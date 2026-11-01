from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from ....security.rbac import AuthenticatedUser, get_current_user
from ....repositories.db_state import db_state

router = APIRouter()


class NotificationItem(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    notification_type: str
    is_read: bool


@router.get("", response_model=List[NotificationItem], summary="Get User Notifications")
async def get_notifications(user: AuthenticatedUser = Depends(get_current_user)):
    return [NotificationItem(**n) for n in db_state.notifications if n["user_id"] == user.id]


@router.patch("/{notification_id}/read", summary="Mark Notification Read")
async def mark_read(notification_id: str, user: AuthenticatedUser = Depends(get_current_user)):
    notif = next((n for n in db_state.notifications if n["id"] == notification_id and n["user_id"] == user.id), None)
    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "Not Found", "message": "Notification not found", "code": "NOTIF_NOT_FOUND"}
        )
    notif["is_read"] = True
    return {"status": "success", "notification_id": notification_id}
