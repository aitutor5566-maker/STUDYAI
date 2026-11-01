from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from ....security.rbac import (
    ROLE_SUPERADMIN, ROLE_ADMIN, AuthenticatedUser,
    get_current_user, require_role, require_permission
)
from ....repositories.db_state import db_state

router = APIRouter()


class UserListItem(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    phone: Optional[str] = None


@router.get("", response_model=List[UserListItem], summary="List Tenant Users")
async def list_users(
    role: Optional[str] = None,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    user: AuthenticatedUser = Depends(require_role([ROLE_ADMIN, ROLE_SUPERADMIN]))
):
    """List users within tenant. Admins see only their tenant; Superadmins see all."""
    all_users = list(db_state.users.values())
    if user.role != ROLE_SUPERADMIN:
        all_users = [u for u in all_users if u.get("tenant_id") == user.tenant_id]
        
    if role:
        all_users = [u for u in all_users if u["role"] == role]
        
    sliced = all_users[offset:offset + limit]
    return [
        UserListItem(
            id=u["id"],
            email=u["email"],
            full_name=u["full_name"],
            role=u["role"],
            is_active=u["is_active"],
            phone=u.get("phone")
        ) for u in sliced
    ]


@router.get("/{user_id}", response_model=UserListItem)
async def get_user_detail(user_id: str, current_user: AuthenticatedUser = Depends(get_current_user)):
    """Retrieve user details. Users can access themselves; Admins can access tenant users."""
    target_user = db_state.users.get(user_id)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "Not Found", "message": "User not found", "code": "USER_NOT_FOUND"}
        )
        
    # Access control
    if current_user.id != user_id and current_user.role not in (ROLE_ADMIN, ROLE_SUPERADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": "Forbidden", "message": "Cannot inspect another user's account", "code": "FORBIDDEN"}
        )
        
    return UserListItem(
        id=target_user["id"],
        email=target_user["email"],
        full_name=target_user["full_name"],
        role=target_user["role"],
        is_active=target_user["is_active"],
        phone=target_user.get("phone")
    )
