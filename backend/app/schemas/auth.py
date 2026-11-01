import re
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


def _validate_email(v: str) -> str:
    cleaned = v.strip().lower()
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", cleaned):
        raise ValueError("Invalid email format")
    return cleaned


class LoginRequest(BaseModel):
    email: str
    password: str = Field(..., min_length=6)
    mfa_code: Optional[str] = None

    @field_validator("email")
    def check_email(cls, v: str) -> str:
        return _validate_email(v)


class SuperAdminLoginRequest(BaseModel):
    email: str
    password: str = Field(..., min_length=8)
    mfa_code: str = Field(..., min_length=6, max_length=6, description="Mandatory 6-digit TOTP / MFA code")

    @field_validator("email")
    def check_email(cls, v: str) -> str:
        return _validate_email(v)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    expires_in_minutes: int
    role: str
    user_id: str
    full_name: str
    email: str


class RegisterStudentRequest(BaseModel):
    email: str
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    grade: str = "Grade 10"
    board: str = "CBSE"
    school_name: Optional[str] = None

    @field_validator("email")
    def check_email(cls, v: str) -> str:
        return _validate_email(v)


class RegisterParentRequest(BaseModel):
    email: str
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    phone: Optional[str] = None
    child_enrollment_code: Optional[str] = None

    @field_validator("email")
    def check_email(cls, v: str) -> str:
        return _validate_email(v)


class PasswordResetRequest(BaseModel):
    email: str

    @field_validator("email")
    def check_email(cls, v: str) -> str:
        return _validate_email(v)


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)


class UserProfileResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    tenant_id: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool
    is_email_verified: bool
    permissions: List[str] = []
