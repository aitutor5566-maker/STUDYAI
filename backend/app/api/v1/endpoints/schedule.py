import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from ....security.rbac import AuthenticatedUser, get_current_user
from ....repositories.db_state import db_state

router = APIRouter()


class ScheduleItemCreate(BaseModel):
    day_of_week: int = Field(..., ge=0, le=6)
    start_time: str
    end_time: str
    subject: str
    topic: Optional[str] = None
    reminder_enabled: bool = True


@router.get("", summary="Get Weekly Study Schedule")
async def get_schedules(user: AuthenticatedUser = Depends(get_current_user)):
    return [s for s in db_state.study_schedules if s["user_id"] == user.id]


@router.post("", status_code=status.HTTP_201_CREATED, summary="Create Schedule Slot")
async def create_schedule(req: ScheduleItemCreate, user: AuthenticatedUser = Depends(get_current_user)):
    new_id = f"sched_{uuid.uuid4().hex[:8]}"
    item = {
        "id": new_id,
        "user_id": user.id,
        "day_of_week": req.day_of_week,
        "start_time": req.start_time,
        "end_time": req.end_time,
        "subject": req.subject,
        "topic": req.topic,
        "reminder_enabled": req.reminder_enabled,
        "is_active": True
    }
    db_state.study_schedules.append(item)
    return item
