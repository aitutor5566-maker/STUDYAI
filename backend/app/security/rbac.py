from typing import List, Optional, Set
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from .jwt import decode_jwt_token
from ..core.config import settings

security_bearer = HTTPBearer(auto_error=False)

# Standard Role Constants
ROLE_SUPERADMIN = "superadmin"
ROLE_ADMIN = "admin"
ROLE_ACCOUNTANT = "accountant"
ROLE_STUDENT = "student"
ROLE_PARENT = "parent"
ROLE_CUSTOM = "custom"

ALL_VALID_ROLES = {ROLE_SUPERADMIN, ROLE_ADMIN, ROLE_ACCOUNTANT, ROLE_STUDENT, ROLE_PARENT, ROLE_CUSTOM}

# Role Hierarchies for Escalation Check
# Level order: higher number means higher privilege
ROLE_LEVELS = {
    ROLE_SUPERADMIN: 100,
    ROLE_ADMIN: 50,
    ROLE_ACCOUNTANT: 40,
    ROLE_CUSTOM: 30,
    ROLE_PARENT: 20,
    ROLE_STUDENT: 10,
}

# Default Permissions Map for Built-in Roles
ROLE_DEFAULT_PERMISSIONS = {
    ROLE_SUPERADMIN: {
        "curriculum:view", "curriculum:create", "curriculum:edit", "curriculum:delete",
        "examinations:view", "examinations:create", "examinations:approve", "examinations:evaluate",
        "tutor:chat", "notes:manage", "games:play",
        "parent:view_child", "parent:view_chat",
        "payments:view", "payments:manage",
        "users:manage", "system:configure", "system:audit"
    },
    ROLE_ADMIN: {
        "curriculum:view", "curriculum:create", "curriculum:edit",
        "examinations:view", "examinations:create", "examinations:approve", "examinations:evaluate",
        "tutor:chat", "notes:manage", "games:play",
        "parent:view_child", "payments:view",
        "users:manage"
    },
    ROLE_ACCOUNTANT: {
        "payments:view", "payments:manage"
    },
    ROLE_STUDENT: {
        "curriculum:view", "examinations:view", "examinations:take",
        "tutor:chat", "notes:manage", "games:play"
    },
    ROLE_PARENT: {
        "curriculum:view", "parent:view_child", "payments:view"
    }
}


class AuthenticatedUser:
    def __init__(
        self,
        id: str,
        email: str,
        role: str,
        tenant_id: Optional[str] = None,
        full_name: Optional[str] = None,
        permissions: Optional[List[str]] = None,
        mfa_verified: bool = False
    ):
        self.id = id
        self.email = email
        self.role = role
        self.tenant_id = tenant_id
        self.full_name = full_name or email
        self.mfa_verified = mfa_verified
        
        # Load user permissions
        perms = set(permissions or [])
        default_perms = ROLE_DEFAULT_PERMISSIONS.get(role, set())
        self.permissions: Set[str] = perms.union(default_perms)

    def has_permission(self, permission_code: str) -> bool:
        if self.role == ROLE_SUPERADMIN:
            return True
        return permission_code in self.permissions

    def has_any_role(self, allowed_roles: List[str]) -> bool:
        return self.role in allowed_roles


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security_bearer)
) -> AuthenticatedUser:
    """Dependency that extracts and validates the JWT Bearer token."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "Unauthorized", "message": "Authentication credentials were not provided", "code": "AUTH_REQUIRED"},
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    payload = decode_jwt_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "Unauthorized", "message": "Invalid, expired or tampered token", "code": "TOKEN_INVALID"},
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    user_id = payload.get("sub") or payload.get("user_id")
    email = payload.get("email")
    role = payload.get("role", ROLE_STUDENT)
    tenant_id = payload.get("tenant_id")
    full_name = payload.get("full_name")
    permissions = payload.get("permissions", [])
    mfa_verified = payload.get("mfa_verified", False)
    
    if not user_id or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "Unauthorized", "message": "Malformed token payload", "code": "TOKEN_MALFORMED"},
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    return AuthenticatedUser(
        id=user_id,
        email=email,
        role=role,
        tenant_id=tenant_id,
        full_name=full_name,
        permissions=permissions,
        mfa_verified=mfa_verified
    )


async def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security_bearer)
) -> Optional[AuthenticatedUser]:
    """Dependency that extracts JWT Bearer token if present, returning None if unauthenticated."""
    if not credentials:
        return None
    token = credentials.credentials
    payload = decode_jwt_token(token)
    if not payload:
        return None
    user_id = payload.get("sub") or payload.get("user_id")
    email = payload.get("email")
    if not user_id or not email:
        return None
    return AuthenticatedUser(
        id=user_id,
        email=email,
        role=payload.get("role", ROLE_STUDENT),
        tenant_id=payload.get("tenant_id"),
        full_name=payload.get("full_name"),
        permissions=payload.get("permissions", []),
        mfa_verified=payload.get("mfa_verified", False)
    )


def require_role(allowed_roles: List[str]):
    """Enforces that the authenticated user possesses one of the allowed roles."""
    async def role_checker(user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
        if not user.has_any_role(allowed_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": "Forbidden",
                    "message": f"Access denied. Requires one of roles: {', '.join(allowed_roles)}",
                    "code": "INSUFFICIENT_ROLE"
                }
            )
        return user
    return role_checker


def require_permission(permission_code: str):
    """Enforces that the authenticated user possesses the specific granular permission."""
    async def permission_checker(user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
        if not user.has_permission(permission_code):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": "Forbidden",
                    "message": f"Access denied. Missing required permission: {permission_code}",
                    "code": "PERMISSION_DENIED"
                }
            )
        return user
    return permission_checker


def require_superadmin_elevated():
    """Enforces that the user is a superadmin and has verified MFA / elevated privileges."""
    async def superadmin_checker(user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
        if user.role != ROLE_SUPERADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"error": "Forbidden", "message": "Super Admin access required", "code": "SUPERADMIN_REQUIRED"}
            )
        if settings.SUPERADMIN_MFA_REQUIRED and not user.mfa_verified:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"error": "Forbidden", "message": "Multi-Factor Authentication (MFA) verification required", "code": "MFA_REQUIRED"}
            )
        return user
    return superadmin_checker


def prevent_role_escalation(assigner: AuthenticatedUser, target_role: str):
    """Prevents unauthorized elevation of privilege when assigning roles."""
    if target_role not in ALL_VALID_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "Bad Request", "message": f"Unknown role: {target_role}", "code": "INVALID_ROLE"}
        )
    
    assigner_level = ROLE_LEVELS.get(assigner.role, 0)
    target_level = ROLE_LEVELS.get(target_role, 0)
    
    # Only superadmin can assign admin or superadmin
    if target_role in (ROLE_SUPERADMIN, ROLE_ADMIN) and assigner.role != ROLE_SUPERADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": "Forbidden", "message": "Only Super Administrators can assign Admin or Superadmin privileges", "code": "ROLE_ESCALATION_BLOCKED"}
        )
        
    # An actor cannot assign a role equal to or higher than their own (except superadmin)
    if assigner.role != ROLE_SUPERADMIN and target_level >= assigner_level:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": "Forbidden", "message": "Cannot assign a role equal to or higher than your current role", "code": "ROLE_ESCALATION_BLOCKED"}
        )
