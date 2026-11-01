from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from ....security.rbac import (
    ROLE_SUPERADMIN, ROLE_ADMIN, AuthenticatedUser,
    get_current_user, require_permission
)
from ....repositories.db_state import db_state

router = APIRouter()


class SubjectItem(BaseModel):
    id: str
    academic_level_id: str
    name: str
    code: str
    color_hex: str


class TopicItem(BaseModel):
    id: str
    subject_id: str
    name: str
    slug: str
    sequence_order: int


class SubtopicItem(BaseModel):
    id: str
    topic_id: str
    name: str
    slug: str
    estimated_minutes: int
    visual_component_type: str


class LessonItem(BaseModel):
    id: str
    subtopic_id: str
    title: str
    content_markdown: str
    objectives: List[str]
    estimated_duration_minutes: int


@router.get("/levels", summary="Get Academic Levels")
async def get_academic_levels(user: AuthenticatedUser = Depends(get_current_user)):
    return db_state.academic_levels


@router.get("/subjects", response_model=List[SubjectItem], summary="Get Subjects")
async def get_subjects(user: AuthenticatedUser = Depends(get_current_user)):
    return db_state.subjects


@router.get("/topics", response_model=List[TopicItem], summary="Get Topics")
async def get_topics(subject_id: Optional[str] = None, user: AuthenticatedUser = Depends(get_current_user)):
    if subject_id:
        return [t for t in db_state.topics if t["subject_id"] == subject_id]
    return db_state.topics


@router.get("/subtopics", response_model=List[SubtopicItem], summary="Get Subtopics")
async def get_subtopics(topic_id: Optional[str] = None, user: AuthenticatedUser = Depends(get_current_user)):
    if topic_id:
        return [s for s in db_state.subtopics if s["topic_id"] == topic_id]
    return db_state.subtopics


@router.get("/lessons/{subtopic_id}", response_model=List[LessonItem], summary="Get Lessons")
async def get_lessons(subtopic_id: str, user: AuthenticatedUser = Depends(get_current_user)):
    return [l for l in db_state.lessons if l["subtopic_id"] == subtopic_id]
