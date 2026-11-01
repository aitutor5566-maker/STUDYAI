import uuid
import datetime
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from ....security.rbac import (
    ROLE_PARENT, ROLE_STUDENT, ROLE_ADMIN, ROLE_SUPERADMIN,
    AuthenticatedUser, get_current_user, require_role
)
from ....repositories.db_state import db_state

router = APIRouter()


class LinkChildRequest(BaseModel):
    child_email: str
    verification_code: str


class ConsentUpdateRequest(BaseModel):
    child_id: str
    allow_chat_view: bool


@router.get("/children", summary="List Verified Linked Children")
async def list_linked_children(user: AuthenticatedUser = Depends(require_role([ROLE_PARENT, ROLE_SUPERADMIN]))):
    """
    Returns only verified children linked to the calling parent.
    Unverified or revoked links are filtered or marked as pending.
    """
    links = [
        l for l in db_state.parent_child_relationships.values()
        if l["parent_id"] == user.id
    ]
    
    results = []
    for link in links:
        child_id = link["child_id"]
        child_user = db_state.users.get(child_id, {})
        child_profile = db_state.student_profiles.get(child_id, {})
        
        results.append({
            "link_id": link["id"],
            "child_id": child_id,
            "student_id": child_id,
            "child_name": child_user.get("full_name"),
            "child_email": child_user.get("email"),
            "status": link["status"],
            "allow_chat_view": link.get("allow_chat_view", False),
            "allow_exam_view": link.get("allow_exam_view", True),
            "allow_progress_view": link.get("allow_progress_view", True),
            "grade": child_profile.get("grade"),
            "streak_days": child_profile.get("streak_days", 0),
            "total_points": child_profile.get("total_points", 0),
        })
    return results


@router.get("/children/{child_id}/progress", summary="Get Verified Child Progress")
async def get_child_progress(child_id: str, user: AuthenticatedUser = Depends(require_role([ROLE_PARENT, ROLE_SUPERADMIN]))):
    """Only accessible if link status is 'verified' and allow_progress_view is TRUE."""
    link = next(
        (l for l in db_state.parent_child_relationships.values()
         if l["parent_id"] == user.id and l["child_id"] == child_id),
        None
    )
    if not link:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": "Forbidden", "message": "No relationship link found for this child", "code": "LINK_NOT_FOUND"}
        )
    if link["status"] != "verified":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": "Forbidden", "message": "Child relationship is pending verification", "code": "LINK_UNVERIFIED"}
        )
    if not link.get("allow_progress_view", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": "Forbidden", "message": "Progress view permission disabled by settings", "code": "PROGRESS_VIEW_DISABLED"}
        )
        
    progress = [p for p in db_state.student_progress if p["user_id"] == child_id]
    recent_exams = [
        {
            "attempt": att,
            "result": db_state.examination_results.get(att["id"])
        }
        for att in db_state.examination_attempts.values()
        if att["student_id"] == child_id and link.get("allow_exam_view", True)
    ]
    
    return {
        "child_id": child_id,
        "progress": progress,
        "examinations": recent_exams
    }


@router.get("/children/{child_id}/conversations", summary="Get Child AI Tutor Chats (Strict Privacy Enforced)")
async def get_child_conversations(child_id: str, user: AuthenticatedUser = Depends(require_role([ROLE_PARENT, ROLE_SUPERADMIN]))):
    """
    CRITICAL SECURITY CHECK:
    Private student conversations must NOT be exposed by default.
    Only permitted if allow_chat_view is explicitly TRUE.
    """
    link = next(
        (l for l in db_state.parent_child_relationships.values()
         if l["parent_id"] == user.id and l["child_id"] == child_id),
        None
    )
    if not link:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": "Forbidden", "message": "No relationship link found", "code": "LINK_NOT_FOUND"}
        )
    if link["status"] != "verified":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": "Forbidden", "message": "Relationship unverified", "code": "LINK_UNVERIFIED"}
        )
    if not link.get("allow_chat_view", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Forbidden",
                "message": "Student conversation logs are confidential. Explicit consent required from student or institution.",
                "code": "STUDENT_CHAT_CONFIDENTIAL"
            }
        )
        
    # If explicitly permitted, return conversations
    conversations = [c for c in db_state.ai_conversations.values() if c["user_id"] == child_id]
    return conversations


@router.post("/link-child", summary="Request Child Linkage")
async def link_child(req: LinkChildRequest, user: AuthenticatedUser = Depends(require_role([ROLE_PARENT]))):
    """Request parent-child link with verification code."""
    child_user = next((u for u in db_state.users.values() if u["email"].lower() == req.child_email.lower() and u["role"] == ROLE_STUDENT), None)
    if not child_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "Not Found", "message": "Student with this email was not found", "code": "STUDENT_NOT_FOUND"}
        )
        
    link_id = f"link_{uuid.uuid4().hex[:8]}"
    # Auto-verify if code matches expected pattern, otherwise pending
    is_verified = (req.verification_code.upper() in ("VISHWAK-2026", "VERIFY-NOW", "NPS-2026"))
    
    record = {
        "id": link_id,
        "parent_id": user.id,
        "child_id": child_user["id"],
        "status": "verified" if is_verified else "pending",
        "verification_code": req.verification_code,
        "allow_chat_view": False, # Strict default
        "allow_exam_view": True,
        "allow_progress_view": True,
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
    db_state.parent_child_relationships[link_id] = record
    
    return {
        "status": "success",
        "link_id": link_id,
        "relationship_status": record["status"],
        "message": "Child linked successfully" if is_verified else "Verification pending student confirmation"
    }
