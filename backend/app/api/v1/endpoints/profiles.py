from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from ....security.rbac import (
    ROLE_SUPERADMIN, ROLE_ADMIN, ROLE_STUDENT, ROLE_PARENT,
    AuthenticatedUser, get_current_user, get_optional_current_user
)
from ....repositories.db_state import db_state

router = APIRouter()


class StudentProfileUpdate(BaseModel):
    grade: Optional[str] = None
    grade_level: Optional[str] = None
    board: Optional[str] = None
    preferred_learning_style: Optional[str] = None
    primary_learning_style: Optional[str] = None


@router.get("/student/{student_id}")
async def get_student_profile(student_id: str, user: AuthenticatedUser = Depends(get_current_user)):
    """
    Get student profile. Accessible by the student themselves, school admins,
    or a verified parent.
    """
    profile = db_state.student_profiles.get(student_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "Not Found", "message": "Student profile not found", "code": "PROFILE_NOT_FOUND"}
        )
        
    # Authorization checks
    if user.id != student_id and user.role not in (ROLE_ADMIN, ROLE_SUPERADMIN):
        # Check if caller is verified parent
        link = next(
            (l for l in db_state.parent_child_relationships.values()
             if l["parent_id"] == user.id and l["child_id"] == student_id and l["status"] == "verified"),
            None
        )
        if not link or not link.get("allow_progress_view", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"error": "Forbidden", "message": "You are not authorized to view this student profile", "code": "UNAUTHORIZED_PARENT"}
            )
            
    raw_user = db_state.users.get(student_id, {})
    return {
        "user_id": student_id,
        "full_name": raw_user.get("full_name"),
        "email": raw_user.get("email"),
        **profile
    }


class AdaptiveProfileUpdate(BaseModel):
    difficult_subjects: Optional[List[str]] = None
    difficult_topics: Optional[List[str]] = None
    reading_difficulty: Optional[bool] = None
    spelling_difficulty: Optional[bool] = None
    writing_difficulty: Optional[bool] = None
    vocabulary_difficulty: Optional[bool] = None
    concept_difficulty: Optional[bool] = None
    memory_difficulty: Optional[bool] = None
    math_calculation_difficulty: Optional[bool] = None
    explanation_style: Optional[str] = None
    preferred_learning_methods: Optional[List[str]] = None


@router.get("/adaptive")
async def get_my_adaptive_profile(user: Optional[AuthenticatedUser] = Depends(get_optional_current_user)):
    """Retrieve the student's personalised adaptive profile."""
    user_id = user.id if user else "usr_student_001"
    profile = db_state.student_profiles.get(user_id, {})
    adaptive = profile.get("adaptive_profile", {
        "difficult_subjects": [],
        "difficult_topics": [],
        "reading_difficulty": False,
        "spelling_difficulty": False,
        "writing_difficulty": False,
        "vocabulary_difficulty": False,
        "concept_difficulty": False,
        "memory_difficulty": False,
        "math_calculation_difficulty": False,
        "explanation_style": "balanced",
        "preferred_learning_methods": ["diagrams", "examples"],
        "topic_understanding": {},
        "recent_feedback": []
    })
    return {"user_id": user_id, "adaptive_profile": adaptive}


@router.put("/adaptive")
async def update_my_adaptive_profile(req: AdaptiveProfileUpdate, user: Optional[AuthenticatedUser] = Depends(get_optional_current_user)):
    """Update student's personalised adaptive profile."""
    user_id = user.id if user else "usr_student_001"
    profile = db_state.student_profiles.get(user_id)
    if not profile:
        profile = {
            "user_id": user_id,
            "grade": "Grade 10",
            "board": "CBSE",
            "adaptive_profile": {}
        }
        db_state.student_profiles[user_id] = profile

    adaptive = profile.setdefault("adaptive_profile", {
        "difficult_subjects": [],
        "difficult_topics": [],
        "reading_difficulty": False,
        "spelling_difficulty": False,
        "writing_difficulty": False,
        "vocabulary_difficulty": False,
        "concept_difficulty": False,
        "memory_difficulty": False,
        "math_calculation_difficulty": False,
        "explanation_style": "balanced",
        "preferred_learning_methods": ["diagrams", "examples"],
        "topic_understanding": {},
        "recent_feedback": []
    })

    if req.difficult_subjects is not None:
        adaptive["difficult_subjects"] = req.difficult_subjects
    if req.difficult_topics is not None:
        adaptive["difficult_topics"] = req.difficult_topics
    if req.reading_difficulty is not None:
        adaptive["reading_difficulty"] = req.reading_difficulty
    if req.spelling_difficulty is not None:
        adaptive["spelling_difficulty"] = req.spelling_difficulty
    if req.writing_difficulty is not None:
        adaptive["writing_difficulty"] = req.writing_difficulty
    if req.vocabulary_difficulty is not None:
        adaptive["vocabulary_difficulty"] = req.vocabulary_difficulty
    if req.concept_difficulty is not None:
        adaptive["concept_difficulty"] = req.concept_difficulty
    if req.memory_difficulty is not None:
        adaptive["memory_difficulty"] = req.memory_difficulty
    if req.math_calculation_difficulty is not None:
        adaptive["math_calculation_difficulty"] = req.math_calculation_difficulty
    if req.explanation_style is not None:
        adaptive["explanation_style"] = req.explanation_style
    if req.preferred_learning_methods is not None:
        adaptive["preferred_learning_methods"] = req.preferred_learning_methods

    return {"status": "success", "adaptive_profile": adaptive}
@router.patch("/student/me")
async def update_my_student_profile(req: StudentProfileUpdate, user: AuthenticatedUser = Depends(get_current_user)):
    """Update student learning preferences and profile."""
    if user.role != ROLE_STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": "Forbidden", "message": "Only students can update student profile", "code": "ROLE_MISMATCH"}
        )
        
    profile = db_state.student_profiles.get(user.id)
    if not profile:
        profile = {
            "user_id": user.id,
            "grade": "Grade 10",
            "board": "CBSE",
            "streak_days": 1,
            "total_points": 0,
            "preferred_learning_style": "visual"
        }
        db_state.student_profiles[user.id] = profile
        
    if req.grade is not None:
        profile["grade"] = req.grade
    if req.board is not None:
        profile["board"] = req.board
    if req.preferred_learning_style is not None:
        profile["preferred_learning_style"] = req.preferred_learning_style
    elif getattr(req, "primary_learning_style", None) is not None:
        profile["preferred_learning_style"] = req.primary_learning_style
        
    return {"status": "success", "profile": profile}
