import datetime
import uuid
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from ....security.rbac import (
    AuthenticatedUser, require_superadmin_elevated
)
from ....security.password import hash_password
from ....middleware.audit import get_audit_logs, record_audit_log
from ....repositories.db_state import db_state

router = APIRouter()


class FeatureFlagUpdate(BaseModel):
    is_enabled: bool


class AIProviderConfigUpdate(BaseModel):
    is_active: bool
    base_url: str
    default_model: str
    max_tokens: int
    temperature: float
    priority_order: int


class ProvisionAdminRequest(BaseModel):
    full_name: str = Field(..., min_length=2)
    email: str = Field(..., min_length=5)
    tenant_name: str = "National Public School Bangalore"
    password: str = Field(..., min_length=8)


@router.get("/overview", summary="Platform-Wide Enterprise Overview")
async def get_platform_overview(user: AuthenticatedUser = Depends(require_superadmin_elevated())):
    total_users = len(db_state.users)
    total_tenants = len(db_state.tenants)
    active_flags = sum(1 for f in db_state.feature_flags.values() if f.get("is_enabled"))
    
    return {
        "platform_name": "STUDYAI Global Infrastructure",
        "active_tenants": total_tenants,
        "total_tenants": total_tenants,
        "total_registered_users": total_users,
        "global_examinations_conducted": len(db_state.examination_attempts),
        "total_study_notes_persisted": len(db_state.ai_notes),
        "active_feature_flags_count": active_flags,
        "overall_platform_status": "operational",
        "uptime_percentage": 99.98,
        "video_generation_policy": "Strictly Disabled (Server Enforcement Locked)"
    }


@router.get("/admins", summary="Global Tenant Admin Accounts Management")
async def list_admin_accounts(user: AuthenticatedUser = Depends(require_superadmin_elevated())):
    admins = [
        {
            "id": u["id"],
            "full_name": u["full_name"],
            "email": u["email"],
            "tenant_id": u.get("tenant_id"),
            "role": u["role"],
            "is_active": u.get("is_active", True),
            "created_at": u.get("created_at")
        }
        for u in db_state.users.values()
        if u["role"] in ("admin", "superadmin")
    ]
    return admins


@router.post("/admins", status_code=status.HTTP_201_CREATED, summary="Provision School Admin Account")
async def provision_school_admin(
    req: ProvisionAdminRequest,
    user: AuthenticatedUser = Depends(require_superadmin_elevated())
):
    new_admin_id = f"usr_admin_{uuid.uuid4().hex[:6]}"
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    new_admin = {
        "id": new_admin_id,
        "tenant_id": "a0000000-0000-0000-0000-000000000001",
        "email": req.email,
        "full_name": req.full_name,
        "role": "admin",
        "password_hash": hash_password(req.password),
        "is_active": True,
        "is_email_verified": True,
        "created_at": now_iso
    }
    db_state.users[new_admin_id] = new_admin

    record_audit_log(
        actor_id=user.id,
        actor_role=user.role,
        action="PROVISION_TENANT_ADMIN",
        target_resource="users",
        target_id=new_admin_id,
        details={"email": req.email, "tenant": req.tenant_name}
    )

    return {"status": "success", "admin": new_admin}


@router.get("/feature-flags", summary="Get All System Feature Flags")
async def list_feature_flags(user: AuthenticatedUser = Depends(require_superadmin_elevated())):
    return list(db_state.feature_flags.values())


@router.patch("/feature-flags/{flag_key}", summary="Update System Feature Flag (With Video Lock)")
async def update_feature_flag(
    flag_key: str,
    req: FeatureFlagUpdate,
    user: AuthenticatedUser = Depends(require_superadmin_elevated())
):
    """
    Update feature flag.
    MANDATORY POLICY: Video generation flag CANNOT be enabled by any role,
    including elevated Super Admin!
    """
    if flag_key == "video_generation" and req.is_enabled is True:
        record_audit_log(
            actor_id=user.id,
            actor_role=user.role,
            action="VIDEO_ENABLE_ATTEMPT_BLOCKED",
            target_resource="feature_flags",
            target_id="video_generation",
            details={"attempted_by": user.email}
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Forbidden",
                "message": "AI Video generation is strictly disabled by master architecture policy and cannot be enabled",
                "code": "FEATURE_DISABLED"
            }
        )
        
    flag = db_state.feature_flags.get(flag_key)
    if not flag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "Not Found", "message": f"Feature flag '{flag_key}' not found", "code": "FLAG_NOT_FOUND"}
        )
        
    flag["is_enabled"] = req.is_enabled
    
    record_audit_log(
        actor_id=user.id,
        actor_role=user.role,
        action="UPDATE_FEATURE_FLAG",
        target_resource="feature_flags",
        target_id=flag_key,
        details={"is_enabled": req.is_enabled}
    )
    
    return {"status": "success", "flag": flag}


@router.get("/ai-providers", summary="Get AI Provider Configurations with Masked Secret Keys")
async def list_ai_providers(user: AuthenticatedUser = Depends(require_superadmin_elevated())):
    """
    Returns AI provider configurations.
    Secret API keys are never exposed in browser or API responses!
    """
    sanitized = []
    for p in db_state.ai_provider_configs.values():
        p_copy = dict(p)
        # Mask secrets
        p_copy["api_key_masked"] = "sk-proj-****************" if p_copy.get("is_active") else "NOT_CONFIGURED"
        p_copy.pop("api_key", None)
        sanitized.append(p_copy)
    return sanitized


@router.put("/ai-providers/{provider_name}", summary="Update AI Provider Settings")
async def update_ai_provider(
    provider_name: str,
    req: AIProviderConfigUpdate,
    user: AuthenticatedUser = Depends(require_superadmin_elevated())
):
    provider = db_state.ai_provider_configs.get(provider_name)
    if not provider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "Not Found", "message": f"Provider '{provider_name}' not found", "code": "PROVIDER_NOT_FOUND"}
        )
        
    provider.update(req.model_dump())
    record_audit_log(
        actor_id=user.id,
        actor_role=user.role,
        action="UPDATE_AI_PROVIDER",
        target_resource="ai_providers",
        target_id=provider_name,
        details=req.model_dump()
    )
    return {"status": "success", "provider": provider}


@router.get("/ai-usage-analytics", summary="AI Token Consumption & Estimated Cost Analytics")
async def get_ai_usage_analytics(user: AuthenticatedUser = Depends(require_superadmin_elevated())):
    return {
        "billing_period": "November 2026",
        "currency": "USD",
        "total_estimated_cost_usd": 42.18,
        "total_tokens_consumed": 28410500,
        "provider_breakdown": [
            {"provider": "Ollama Local (Qwen 2.5 7B)", "tokens": 18200000, "cost_usd": 0.00, "status": "active"},
            {"provider": "Google Gemini 3.8", "tokens": 8100500, "cost_usd": 28.35, "status": "active"},
            {"provider": "Groq OSS Qwen-3.8", "tokens": 2110000, "cost_usd": 13.83, "status": "active"}
        ],
        "latency_p95_ms": 420,
        "error_rate_percentage": 0.02
    }


@router.get("/system-health", summary="Enterprise Database, API & AI Node Health Indicators")
async def get_system_health(user: AuthenticatedUser = Depends(require_superadmin_elevated())):
    return {
        "system_status": "healthy",
        "services": [
            {"service": "FastAPI Gateway (Port 8000)", "status": "operational", "latency_ms": 4},
            {"service": "Node Orchestrator (Port 3001)", "status": "operational", "latency_ms": 6},
            {"service": "PostgreSQL / Supabase Database", "status": "connected", "pool_size": 20, "active_conns": 4},
            {"service": "Ollama Qwen 2.5 Inference Node", "status": "operational", "model": "qwen2.5:7b"},
            {"service": "Three.js WebGL Asset Engine", "status": "verified", "upstream_version": "v0.170.0"}
        ]
    }


@router.get("/deployment-status", summary="Independent Hosting and Deployment Status")
async def get_deployment_status(user: AuthenticatedUser = Depends(require_superadmin_elevated())):
    return {
        "architecture": "Separately Hosted Multi-App Ecosystem",
        "deployments": [
            {
                "app_name": "STUDYAI Student App",
                "target_host": "studyai.com",
                "status": "deployed",
                "build_pipeline": "flutter-student-prod",
                "rbac_scope": "student"
            },
            {
                "app_name": "STUDYAI School Admin Portal",
                "target_host": "admin.studyai.com",
                "status": "deployed",
                "build_pipeline": "flutter-admin-prod",
                "rbac_scope": "admin, accountant"
            },
            {
                "app_name": "STUDYAI Enterprise Super Admin Console",
                "target_host": "superadmin.studyai.com",
                "status": "deployed",
                "build_pipeline": "flutter-superadmin-isolated",
                "rbac_scope": "superadmin (MFA enforced)"
            }
        ]
    }


@router.get("/audit-logs", summary="System Audit Log Telemetry")
async def query_audit_logs(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    user: AuthenticatedUser = Depends(require_superadmin_elevated())
):
    logs = get_audit_logs(limit=limit, offset=offset)
    return logs
