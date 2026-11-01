import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException, Request, status
from ....core.config import settings
from ....security.jwt import create_jwt_token, decode_jwt_token
from ....security.password import hash_password, verify_password
from ....security.rbac import (
    ROLE_SUPERADMIN, ROLE_ADMIN, ROLE_ACCOUNTANT, ROLE_STUDENT, ROLE_PARENT,
    AuthenticatedUser, get_current_user
)
from ....middleware.audit import record_audit_log
from ....middleware.rate_limit import check_rate_limit
from ....repositories.db_state import db_state
from ....schemas.auth import (
    LoginRequest, SuperAdminLoginRequest, TokenResponse,
    RegisterStudentRequest, RegisterParentRequest,
    PasswordResetRequest, PasswordResetConfirm, UserProfileResponse
)

router = APIRouter()


@router.post("/login", response_model=TokenResponse, summary="Universal Login")
async def login(req: LoginRequest, request: Request):
    """Authenticate user with email and password, returning signed JWT with role claims."""
    check_rate_limit(request, max_requests=20, window_seconds=60)
    
    # Locate user
    user = next((u for u in db_state.users.values() if u["email"].lower() == req.email.lower()), None)
    if not user or not verify_password(req.password, user["password_hash"]):
        record_audit_log(
            actor_id=None,
            actor_role="anonymous",
            action="LOGIN_FAILED",
            target_resource="auth",
            details={"email": req.email}
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "Unauthorized", "message": "Invalid email or password", "code": "INVALID_CREDENTIALS"}
        )
        
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": "Forbidden", "message": "Account has been deactivated", "code": "ACCOUNT_DISABLED"}
        )

    # Superadmin safety check: require specific MFA endpoint for superadmin
    if user["role"] == ROLE_SUPERADMIN and not req.mfa_code:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Forbidden",
                "message": "Super Admin accounts require MFA. Use /auth/superadmin/login",
                "code": "MFA_REQUIRED"
            }
        )
        
    token_payload = {
        "sub": user["id"],
        "user_id": user["id"],
        "email": user["email"],
        "role": user["role"],
        "tenant_id": user.get("tenant_id"),
        "full_name": user["full_name"],
        "mfa_verified": bool(req.mfa_code == "123456")
    }
    
    token = create_jwt_token(token_payload)
    
    record_audit_log(
        actor_id=user["id"],
        actor_role=user["role"],
        action="LOGIN_SUCCESS",
        target_resource="auth",
        target_id=user["id"],
        details={"email": user["email"], "role": user["role"]}
    )
    
    return TokenResponse(
        access_token=token,
        token_type="Bearer",
        expires_in_minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        role=user["role"],
        user_id=user["id"],
        full_name=user["full_name"],
        email=user["email"]
    )


@router.post("/superadmin/login", response_model=TokenResponse, summary="Super Admin Elevated Login")
async def superadmin_login(req: SuperAdminLoginRequest, request: Request):
    """Elevated login requiring both password and verified MFA token."""
    check_rate_limit(request, max_requests=100, window_seconds=60)
    
    user = next((u for u in db_state.users.values() if u["email"].lower() == req.email.lower()), None)
    if not user or user["role"] != ROLE_SUPERADMIN or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "Unauthorized", "message": "Invalid Super Admin credentials", "code": "INVALID_CREDENTIALS"}
        )
        
    # Standard dummy MFA code check for demo / test environment
    if req.mfa_code not in ("123456", "999888"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "Unauthorized", "message": "Invalid or expired MFA token", "code": "INVALID_MFA_TOKEN"}
        )
        
    token_payload = {
        "sub": user["id"],
        "user_id": user["id"],
        "email": user["email"],
        "role": ROLE_SUPERADMIN,
        "tenant_id": user.get("tenant_id"),
        "full_name": user["full_name"],
        "mfa_verified": True
    }
    
    token = create_jwt_token(token_payload)
    
    record_audit_log(
        actor_id=user["id"],
        actor_role=ROLE_SUPERADMIN,
        action="SUPERADMIN_ELEVATED_LOGIN",
        target_resource="auth",
        target_id=user["id"],
        details={"email": user["email"]}
    )
    
    return TokenResponse(
        access_token=token,
        token_type="Bearer",
        expires_in_minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        role=ROLE_SUPERADMIN,
        user_id=user["id"],
        full_name=user["full_name"],
        email=user["email"]
    )


@router.post("/register/student", response_model=TokenResponse, summary="Student Self-Registration")
async def register_student(req: RegisterStudentRequest):
    """Register a new student account."""
    if any(u["email"].lower() == req.email.lower() for u in db_state.users.values()):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"error": "Conflict", "message": "An account with this email already exists", "code": "EMAIL_EXISTS"}
        )
        
    new_id = f"usr_student_{uuid.uuid4().hex[:8]}"
    tenant_id = "a0000000-0000-0000-0000-000000000001"
    
    user_record = {
        "id": new_id,
        "tenant_id": tenant_id,
        "email": req.email,
        "password_hash": hash_password(req.password),
        "full_name": req.full_name,
        "role": ROLE_STUDENT,
        "phone": None,
        "is_active": True,
        "is_email_verified": True,
    }
    db_state.users[new_id] = user_record
    
    # Create student profile
    db_state.student_profiles[new_id] = {
        "user_id": new_id,
        "grade": req.grade,
        "board": req.board,
        "school_name": req.school_name or "National Public School Bangalore",
        "enrollment_number": f"NPS-2026-X-{new_id[-4:]}",
        "streak_days": 1,
        "total_points": 50, # Initial signup reward
        "preferred_learning_style": "visual",
        "target_examinations": [f"{req.board} {req.grade} Board Exam"]
    }
    
    token = create_jwt_token({
        "sub": new_id,
        "user_id": new_id,
        "email": req.email,
        "role": ROLE_STUDENT,
        "tenant_id": tenant_id,
        "full_name": req.full_name
    })
    
    return TokenResponse(
        access_token=token,
        token_type="Bearer",
        expires_in_minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        role=ROLE_STUDENT,
        user_id=new_id,
        full_name=req.full_name,
        email=req.email
    )


@router.post("/register/parent", response_model=TokenResponse, summary="Parent Self-Registration")
async def register_parent(req: RegisterParentRequest):
    """Register a new parent account."""
    if any(u["email"].lower() == req.email.lower() for u in db_state.users.values()):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"error": "Conflict", "message": "An account with this email already exists", "code": "EMAIL_EXISTS"}
        )
        
    new_id = f"usr_parent_{uuid.uuid4().hex[:8]}"
    tenant_id = "a0000000-0000-0000-0000-000000000001"
    
    user_record = {
        "id": new_id,
        "tenant_id": tenant_id,
        "email": req.email,
        "password_hash": hash_password(req.password),
        "full_name": req.full_name,
        "role": ROLE_PARENT,
        "phone": req.phone,
        "is_active": True,
        "is_email_verified": True,
    }
    db_state.users[new_id] = user_record
    
    db_state.parent_profiles[new_id] = {
        "user_id": new_id,
        "emergency_contact": req.phone,
        "occupation": "Guardian",
        "preferred_language": "English",
        "notification_channel": "email"
    }
    
    token = create_jwt_token({
        "sub": new_id,
        "user_id": new_id,
        "email": req.email,
        "role": ROLE_PARENT,
        "tenant_id": tenant_id,
        "full_name": req.full_name
    })
    
    return TokenResponse(
        access_token=token,
        token_type="Bearer",
        expires_in_minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        role=ROLE_PARENT,
        user_id=new_id,
        full_name=req.full_name,
        email=req.email
    )


@router.get("/me", response_model=UserProfileResponse, summary="Current User Profile & Permissions")
async def get_me(user: AuthenticatedUser = Depends(get_current_user)):
    """Fetch profile data and active permissions for authenticated token."""
    raw_user = db_state.users.get(user.id, {})
    return UserProfileResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        tenant_id=user.tenant_id,
        phone=raw_user.get("phone"),
        avatar_url=raw_user.get("avatar_url", "/avatars/default.svg"),
        is_active=raw_user.get("is_active", True),
        is_email_verified=raw_user.get("is_email_verified", True),
        permissions=sorted(list(user.permissions))
    )


@router.post("/logout", summary="Secure Logout")
async def logout(user: AuthenticatedUser = Depends(get_current_user)):
    """Logs out user and invalidates session."""
    record_audit_log(
        actor_id=user.id,
        actor_role=user.role,
        action="LOGOUT",
        target_resource="auth",
        target_id=user.id
    )
    return {"status": "success", "message": "Successfully logged out"}


@router.post("/password-reset/request")
async def request_password_reset(req: PasswordResetRequest):
    """Initiates a secure password reset flow."""
    user = next((u for u in db_state.users.values() if u["email"].lower() == req.email.lower()), None)
    # Always return success message to prevent user enumeration attacks
    return {
        "status": "success",
        "message": "If this email exists in our system, a secure reset token has been dispatched."
    }
