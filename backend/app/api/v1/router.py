from fastapi import APIRouter
from .endpoints import (
    health, auth, users, profiles, roles, curriculum, tutor,
    notes, library, images, visual_3d, games, points,
    examinations, progress, schedule, parent, notifications,
    payments, admin, superadmin, media, visual
)

api_v1_router = APIRouter()

# Register all Phase 2 Modules
api_v1_router.include_router(health.router, tags=["Health"])
api_v1_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_v1_router.include_router(users.router, prefix="/users", tags=["Users"])
api_v1_router.include_router(profiles.router, prefix="/profiles", tags=["Profiles"])
api_v1_router.include_router(roles.router, prefix="/roles", tags=["Roles & RBAC"])
api_v1_router.include_router(curriculum.router, prefix="/curriculum", tags=["Curriculum"])
api_v1_router.include_router(tutor.router, prefix="/tutor", tags=["AI Tutor"])
api_v1_router.include_router(notes.router, prefix="/notes", tags=["AI Notes Studio"])
api_v1_router.include_router(library.router, prefix="/library", tags=["Library & Storage"])
api_v1_router.include_router(images.router, prefix="/images", tags=["Visual Diagrams"])
api_v1_router.include_router(visual_3d.router, prefix="/visual-3d", tags=["3D Science Models"])
api_v1_router.include_router(games.router, prefix="/games", tags=["Educational Games"])
api_v1_router.include_router(points.router, prefix="/points", tags=["Points & Rewards"])
api_v1_router.include_router(examinations.router, prefix="/examinations", tags=["Examinations"])
api_v1_router.include_router(progress.router, prefix="/progress", tags=["Student Progress"])
api_v1_router.include_router(schedule.router, prefix="/schedule", tags=["Study Schedule"])
api_v1_router.include_router(parent.router, prefix="/parent", tags=["Parent Dashboard"])
api_v1_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_v1_router.include_router(payments.router, prefix="/payments", tags=["Payments & Billing"])
api_v1_router.include_router(admin.router, prefix="/admin", tags=["School Administration"])
api_v1_router.include_router(superadmin.router, prefix="/superadmin", tags=["Super Admin Console"])
api_v1_router.include_router(media.router, prefix="/media", tags=["Media Governance"])
api_v1_router.include_router(visual.router, prefix="/visual", tags=["Visual Intelligence"])
