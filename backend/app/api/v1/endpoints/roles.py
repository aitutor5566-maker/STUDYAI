from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from ....security.rbac import (
    ROLE_SUPERADMIN, ROLE_ADMIN, AuthenticatedUser,
    get_current_user, require_role, prevent_role_escalation,
    ROLE_DEFAULT_PERMISSIONS
)
from ....middleware.audit import record_audit_log
from ....repositories.db_state import db_state

router = APIRouter()


class RoleAssignRequest(BaseModel):
    user_id: str
    role: str = Field(..., description="Target role to assign")


class CustomRoleCreate(BaseModel):
    name: str
    code: str
    description: str
    permissions: List[str]


@router.get("", summary="List Available Roles")
async def list_roles(user: AuthenticatedUser = Depends(get_current_user)):
    """List system roles and their associated default permission scopes."""
    return [
        {
            "role": role_code,
            "permissions": sorted(list(perms)),
            "is_system": True
        }
        for role_code, perms in ROLE_DEFAULT_PERMISSIONS.items()
    ]


@router.get("/permissions", summary="List All Granular Permissions")
async def list_permissions(user: AuthenticatedUser = Depends(require_role([ROLE_ADMIN, ROLE_SUPERADMIN]))):
    """Retrieve all system permissions with module categorization and actions."""
    all_perms = set()
    for perms in ROLE_DEFAULT_PERMISSIONS.values():
        all_perms.update(perms)
        
    return [
        {"code": p, "module": p.split(":")[0], "action": p.split(":")[1]}
        for p in sorted(list(all_perms))
    ]


@router.post("/assign", summary="Assign Role with Escalation Prevention")
async def assign_role(req: RoleAssignRequest, current_user: AuthenticatedUser = Depends(require_role([ROLE_ADMIN, ROLE_SUPERADMIN]))):
    """
    Assign a role to a target user.
    Strictly checks that the assigner does not attempt unauthorized role escalation.
    """
    prevent_role_escalation(assigner=current_user, target_role=req.role)
    
    target_user = db_state.users.get(req.user_id)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "Not Found", "message": "Target user not found", "code": "USER_NOT_FOUND"}
        )
        
    old_role = target_user["role"]
    target_user["role"] = req.role
    
    record_audit_log(
        actor_id=current_user.id,
        actor_role=current_user.role,
        action="ROLE_ASSIGNMENT",
        target_resource="users",
        target_id=req.user_id,
        details={"old_role": old_role, "new_role": req.role}
    )
    
    return {
        "status": "success",
        "message": f"Successfully updated user role from '{old_role}' to '{req.role}'",
        "user_id": req.user_id,
        "new_role": req.role
    }
