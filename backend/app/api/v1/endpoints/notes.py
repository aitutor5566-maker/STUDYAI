import datetime
import re
import uuid
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from pydantic import BaseModel, Field

from ....security.rbac import (
    ROLE_SUPERADMIN, ROLE_ADMIN, ROLE_STUDENT, ROLE_PARENT,
    AuthenticatedUser, get_current_user
)
from ....repositories.db_state import db_state
from ....services.notes_engine import (
    generate_subject_tailored_note,
    export_note_to_format,
    parse_source_content
)

router = APIRouter()


class NoteCreate(BaseModel):
    title: str = Field(..., min_length=2)
    subject: str = "Science"
    topic: str
    notebook_name: str = "General"
    content_markdown: str
    flashcards: List[Dict[str, str]] = []
    quiz: List[Dict[str, Any]] = []
    citations: List[Dict[str, Any]] = []
    source_type: str = "topic"


class NoteGenerateRequest(BaseModel):
    topic: str = Field(..., min_length=2)
    subject: str = "Science"
    level: str = "Grade 10"
    source_type: str = "topic" # topic, lesson, pdf, image, document, video
    lesson_id: Optional[str] = None
    content: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    subject: Optional[str] = None
    topic: Optional[str] = None
    notebook_name: Optional[str] = None
    content_markdown: Optional[str] = None
    flashcards: Optional[List[Dict[str, str]]] = None
    quiz: Optional[List[Dict[str, Any]]] = None
    change_summary: Optional[str] = "Student update"


class ProcessSourceRequest(BaseModel):
    source_type: str # pdf, image, document, video
    topic: Optional[str] = ""
    content: str
    metadata: Optional[Dict[str, Any]] = None


@router.get("", summary="List AI Study Notebooks")
async def list_notes(
    student_id: Optional[str] = None,
    subject: Optional[str] = None,
    q: Optional[str] = None,
    user: AuthenticatedUser = Depends(get_current_user)
):
    """
    List notes for current user, linked child, or administrative inspection.
    Supports filtering by subject and search query keyword.
    """
    target_user_id = student_id or user.id
    
    if target_user_id != user.id and user.role not in (ROLE_ADMIN, ROLE_SUPERADMIN):
        link = next(
            (l for l in db_state.parent_child_relationships.values()
             if l["parent_id"] == user.id and l["child_id"] == target_user_id and l["status"] == "verified"),
            None
        )
        if not link:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"error": "Forbidden", "message": "Cannot inspect notes of unlinked student", "code": "FORBIDDEN"}
            )
            
    notes = [n for n in db_state.ai_notes.values() if n["user_id"] == target_user_id]
    
    if subject and subject.lower() != "all":
        notes = [n for n in notes if n.get("subject", "").lower() == subject.lower() or n.get("notebook_name", "").lower() == subject.lower()]
        
    if q and q.strip():
        query = q.strip().lower()
        notes = [
            n for n in notes
            if query in n.get("title", "").lower()
            or query in n.get("topic", "").lower()
            or query in n.get("content_markdown", "").lower()
        ]
        
    return notes


@router.post("/generate", status_code=status.HTTP_201_CREATED, summary="Source-to-Notebook Generation")
async def generate_note(req: NoteGenerateRequest, user: AuthenticatedUser = Depends(get_current_user)):
    """
    Transforms any topic, AI Tutor lesson, PDF, image, text document, or video source into
    a comprehensive, subject-tailored AI Study Notebook with diagrams, tables, flashcards, and quizzes.
    """
    source_content = req.content
    effective_topic = req.topic

    # If importing from an AI Tutor lesson
    if req.source_type == "lesson" and req.lesson_id:
        lesson = db_state.lessons.get(req.lesson_id)
        if lesson:
            effective_topic = lesson.get("topic", req.topic)
            source_content = (
                f"{lesson.get('topic_overview', '')}\n\n"
                f"{lesson.get('detailed_explanation', '')}\n\n"
                f"Key Points: {lesson.get('key_points', [])}"
            )

    note_data = generate_subject_tailored_note(
        source_type=req.source_type,
        topic=effective_topic,
        content=source_content,
        subject=req.subject,
        level=req.level,
        metadata=req.metadata or {}
    )

    new_id = f"note_{uuid.uuid4().hex[:8]}"
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    record = {
        "id": new_id,
        "user_id": user.id,
        "title": note_data["title"],
        "subject": note_data["subject"],
        "topic": note_data["topic"],
        "notebook_name": f"{note_data['subject']} 2026",
        "content_markdown": note_data["content_markdown"],
        "structured_json": note_data,
        "flashcards_json": note_data["flashcards"],
        "quiz_json": note_data["revision_questions"],
        "citations_json": note_data["citations"],
        "diagram_svg": note_data["diagram_svg"],
        "source_type": req.source_type,
        "created_at": now_iso,
        "updated_at": now_iso,
        "version": 1
    }

    db_state.ai_notes[new_id] = record

    # Initialize Version History
    db_state.note_versions[new_id] = [
        {
            "version_id": f"ver_{uuid.uuid4().hex[:6]}",
            "version_number": 1,
            "title": record["title"],
            "content_markdown": record["content_markdown"],
            "created_at": now_iso,
            "change_summary": f"Initial notebook generation from {req.source_type}"
        }
    ]

    # Track in recent access
    if user.id not in db_state.recently_accessed:
        db_state.recently_accessed[user.id] = []
    db_state.recently_accessed[user.id].insert(0, {
        "resource_id": new_id,
        "resource_type": "note",
        "title": record["title"],
        "accessed_at": now_iso
    })

    return record


@router.post("/process-source", summary="Extract and analyze learning source")
async def process_learning_source(req: ProcessSourceRequest, user: AuthenticatedUser = Depends(get_current_user)):
    """
    Parses PDF text, image annotations, document markdown, or video lecture timestamps
    without performing illegal video generation.
    """
    parsed = parse_source_content(req.source_type, req.content, req.metadata or {})
    return {
        "status": "success",
        "source_type": req.source_type,
        "headings_detected": parsed["headings"],
        "citations_extracted": parsed["citations"],
        "timestamp_milestones": parsed["transcript_segments"],
        "character_count": len(req.content)
    }


@router.get("/{note_id}")
async def get_note_detail(note_id: str, user: AuthenticatedUser = Depends(get_current_user)):
    note = db_state.ai_notes.get(note_id)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "Not Found", "message": "Notebook not found", "code": "NOTE_NOT_FOUND"}
        )
        
    if note["user_id"] != user.id and user.role not in (ROLE_ADMIN, ROLE_SUPERADMIN):
        link = next(
            (l for l in db_state.parent_child_relationships.values()
             if l["parent_id"] == user.id and l["child_id"] == note["user_id"] and l["status"] == "verified"),
            None
        )
        if not link:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"error": "Forbidden", "message": "Access denied to private notebook", "code": "FORBIDDEN"}
            )
            
    # Include versions count
    versions = db_state.note_versions.get(note_id, [])
    result = dict(note)
    result["versions_count"] = len(versions)
    return result


@router.put("/{note_id}")
async def update_note(note_id: str, req: NoteUpdate, user: AuthenticatedUser = Depends(get_current_user)):
    note = db_state.ai_notes.get(note_id)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "Not Found", "message": "Notebook not found", "code": "NOTE_NOT_FOUND"}
        )
    if note["user_id"] != user.id and user.role != ROLE_SUPERADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": "Forbidden", "message": "Cannot modify another student's notebook", "code": "FORBIDDEN"}
        )

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    new_version_num = note.get("version", 1) + 1

    if req.title is not None:
        note["title"] = req.title
    if req.subject is not None:
        note["subject"] = req.subject
    if req.topic is not None:
        note["topic"] = req.topic
    if req.notebook_name is not None:
        note["notebook_name"] = req.notebook_name
    if req.content_markdown is not None:
        note["content_markdown"] = req.content_markdown
    if req.flashcards is not None:
        note["flashcards_json"] = req.flashcards
    if req.quiz is not None:
        note["quiz_json"] = req.quiz

    note["version"] = new_version_num
    note["updated_at"] = now_iso

    # Capture Snapshot in Version History
    if note_id not in db_state.note_versions:
        db_state.note_versions[note_id] = []

    db_state.note_versions[note_id].append({
        "version_id": f"ver_{uuid.uuid4().hex[:6]}",
        "version_number": new_version_num,
        "title": note["title"],
        "content_markdown": note["content_markdown"],
        "created_at": now_iso,
        "change_summary": req.change_summary or f"Version {new_version_num} revision"
    })

    return note


@router.post("/{note_id}/autosave")
async def autosave_note(note_id: str, req: NoteUpdate, user: AuthenticatedUser = Depends(get_current_user)):
    """
    Lightweight, debounced autosave endpoint to protect against accidental loss of student edits.
    """
    note = db_state.ai_notes.get(note_id)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "Not Found", "message": "Notebook not found", "code": "NOTE_NOT_FOUND"}
        )
    if note["user_id"] != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    if req.content_markdown is not None:
        note["content_markdown"] = req.content_markdown
    if req.title is not None:
        note["title"] = req.title
    note["last_autosaved_at"] = now_iso

    return {
        "status": "autosaved",
        "note_id": note_id,
        "last_autosaved_at": now_iso,
        "version": note.get("version", 1)
    }


@router.get("/{note_id}/versions")
async def list_note_versions(note_id: str, user: AuthenticatedUser = Depends(get_current_user)):
    note = db_state.ai_notes.get(note_id)
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notebook not found")
    if note["user_id"] != user.id and user.role not in (ROLE_ADMIN, ROLE_SUPERADMIN):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    versions = db_state.note_versions.get(note_id, [])
    return versions


@router.post("/{note_id}/versions/{version_id}/restore")
async def restore_note_version(note_id: str, version_id: str, user: AuthenticatedUser = Depends(get_current_user)):
    note = db_state.ai_notes.get(note_id)
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notebook not found")
    if note["user_id"] != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    versions = db_state.note_versions.get(note_id, [])
    target_ver = next((v for v in versions if v["version_id"] == version_id), None)
    if not target_ver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Version snapshot not found")

    note["content_markdown"] = target_ver["content_markdown"]
    note["title"] = target_ver["title"]
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    note["updated_at"] = now_iso
    note["version"] = note.get("version", 1) + 1

    # Record restore event
    versions.append({
        "version_id": f"ver_{uuid.uuid4().hex[:6]}",
        "version_number": note["version"],
        "title": note["title"],
        "content_markdown": note["content_markdown"],
        "created_at": now_iso,
        "change_summary": f"Restored from version {target_ver['version_number']}"
    })

    return {"status": "success", "message": f"Restored note to version {target_ver['version_number']}", "note": note}


@router.get("/{note_id}/export")
async def export_note(
    note_id: str,
    format: str = Query(default="markdown", regex="^(markdown|html|json)$"),
    user: AuthenticatedUser = Depends(get_current_user)
):
    note = db_state.ai_notes.get(note_id)
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notebook not found")
    if note["user_id"] != user.id and user.role not in (ROLE_ADMIN, ROLE_SUPERADMIN):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    exported = export_note_to_format(note, format)
    return Response(
        content=exported["content"],
        media_type=exported["mime_type"],
        headers={"Content-Disposition": f'attachment; filename="{exported["filename"]}"'}
    )


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_note(req: NoteCreate, user: AuthenticatedUser = Depends(get_current_user)):
    new_id = f"note_{uuid.uuid4().hex[:8]}"
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    record = {
        "id": new_id,
        "user_id": user.id,
        "title": req.title,
        "subject": req.subject,
        "topic": req.topic,
        "notebook_name": req.notebook_name,
        "content_markdown": req.content_markdown,
        "flashcards_json": req.flashcards,
        "quiz_json": req.quiz,
        "citations_json": req.citations,
        "source_type": req.source_type,
        "created_at": now_iso,
        "updated_at": now_iso,
        "version": 1
    }
    db_state.ai_notes[new_id] = record
    db_state.note_versions[new_id] = [
        {
            "version_id": f"ver_{uuid.uuid4().hex[:6]}",
            "version_number": 1,
            "title": req.title,
            "content_markdown": req.content_markdown,
            "created_at": now_iso,
            "change_summary": "Initial manual creation"
        }
    ]
    return record


@router.delete("/{note_id}")
async def delete_note(note_id: str, user: AuthenticatedUser = Depends(get_current_user)):
    note = db_state.ai_notes.get(note_id)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "Not Found", "message": "Notebook not found", "code": "NOTE_NOT_FOUND"}
        )
        
    if note["user_id"] != user.id and user.role != ROLE_SUPERADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": "Forbidden", "message": "Cannot delete another user's notebook", "code": "FORBIDDEN"}
        )
        
    del db_state.ai_notes[note_id]
    if note_id in db_state.note_versions:
        del db_state.note_versions[note_id]
    return {"status": "success", "message": "Notebook deleted"}
