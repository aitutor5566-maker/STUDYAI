from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from ....security.rbac import AuthenticatedUser, get_current_user
from ....repositories.db_state import db_state

router = APIRouter()


class ProgressUpdate(BaseModel):
    subject: str
    topic: str
    minutes_studied: int
    mastery_gain: float = 5.0


@router.get("/summary", summary="Get Student Learning Progress Summary")
@router.get("", summary="Get Student Learning Progress")
async def get_progress(user: AuthenticatedUser = Depends(get_current_user)):
    user_progs = [p for p in db_state.student_progress if p["user_id"] == user.id]
    total_minutes = sum(p.get("total_study_minutes", 0) for p in user_progs)
    avg_mastery = (sum(p.get("mastery_level", 0.0) for p in user_progs) / max(1, len(user_progs))) if user_progs else 0.0
    
    subject_map: Dict[str, Any] = {}
    for p in user_progs:
        sub = p.get("subject", "General")
        if sub not in subject_map:
            subject_map[sub] = {"total_minutes": 0, "avg_mastery": 0.0, "topics_count": 0, "topics": []}
        subject_map[sub]["total_minutes"] += p.get("total_study_minutes", 0)
        subject_map[sub]["topics"].append(p.get("topic"))
        subject_map[sub]["topics_count"] += 1

    return {
        "user_id": user.id,
        "total_study_minutes": total_minutes,
        "average_mastery_percentage": round(avg_mastery, 1),
        "total_topics_studied": len(user_progs),
        "subject_breakdown": subject_map,
        "progress_items": user_progs
    }


@router.post("/record", summary="Record Learning Activity & Update Mastery")
async def record_study_activity(req: ProgressUpdate, user: AuthenticatedUser = Depends(get_current_user)):
    existing = next(
        (p for p in db_state.student_progress
         if p["user_id"] == user.id and p["subject"].lower() == req.subject.lower() and p["topic"].lower() == req.topic.lower()),
        None
    )
    if existing:
        existing["total_study_minutes"] += req.minutes_studied
        existing["mastery_level"] = min(100.0, existing["mastery_level"] + req.mastery_gain)
        existing["completion_percentage"] = min(100.0, existing["completion_percentage"] + 10.0)
        return {"status": "success", "progress": existing}
    else:
        new_record = {
            "id": f"prog_{len(db_state.student_progress) + 1}",
            "user_id": user.id,
            "subject": req.subject,
            "topic": req.topic,
            "mastery_level": min(100.0, req.mastery_gain),
            "completion_percentage": 20.0,
            "total_study_minutes": req.minutes_studied,
        }
        db_state.student_progress.append(new_record)
        return {"status": "success", "progress": new_record}
