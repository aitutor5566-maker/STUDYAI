import datetime
import uuid
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from ....security.rbac import AuthenticatedUser, get_current_user
from ....repositories.db_state import db_state

router = APIRouter()

EVENT_REWARD_RULES = {
    "complete_lesson": {"points": 50, "xp": 50, "label": "Completed AI Tutor Lesson"},
    "complete_subtopic": {"points": 15, "xp": 15, "label": "Completed Core Subtopic"},
    "practice_correct": {"points": 5, "xp": 5, "label": "Correct Practice Answer"},
    "weekly_exam_participation": {"points": 100, "xp": 100, "label": "Participated in Weekly Examination"},
    "exam_excellence": {"points": 200, "xp": 200, "label": "High Distinction in Examination (>=90%)"},
    "revision_completed": {"points": 25, "xp": 25, "label": "Completed Revision Flashcard Deck"},
    "daily_streak": {"points": 30, "xp": 30, "label": "Maintained Daily Learning Streak"}
}


class ClaimRewardRequest(BaseModel):
    event_type: str = Field(..., description="Type of learning event")
    reference_id: str = Field(..., description="Unique ID of completed lesson, exam, or topic")
    idempotency_key: Optional[str] = None


class AwardPointsRequest(BaseModel):
    student_id: Optional[str] = None
    amount: int = 50
    activity_type: Optional[str] = "learning_milestone"
    reason: Optional[str] = "Learning achievement"


@router.post("/award", summary="Award Authoritative Points")
async def award_points(req: AwardPointsRequest, user: AuthenticatedUser = Depends(get_current_user)):
    target_id = req.student_id or user.id
    profile = db_state.student_profiles.get(target_id)
    if not profile:
        profile = {"total_points": 1250, "xp": 1250, "level": 4, "streak_days": 14}
        db_state.student_profiles[target_id] = profile
    profile["total_points"] = profile.get("total_points", 0) + req.amount
    profile["xp"] = profile.get("xp", profile["total_points"]) + req.amount
    return {
        "status": "success",
        "points_awarded": req.amount,
        "new_balance": profile["total_points"],
        "reason": req.reason
    }


@router.get("/balance", summary="Authoritative Student Points, XP & Level")
async def get_points_balance(user: AuthenticatedUser = Depends(get_current_user)):
    profile = db_state.student_profiles.get(user.id)
    if not profile:
        profile = {"total_points": 1250, "xp": 1250, "level": 4, "streak_days": 14}
        db_state.student_profiles[user.id] = profile

    total_points = profile.get("total_points", 0)
    xp = profile.get("xp", total_points)
    level = int((xp / 100) ** 0.5) + 1
    next_level_xp = (level ** 2) * 100
    streak_days = profile.get("streak_days", 14)

    return {
        "user_id": user.id,
        "total_points": total_points,
        "xp": xp,
        "level": level,
        "next_level_xp": next_level_xp,
        "streak_days": streak_days,
        "academic_marks_notice": "Platform points are gamified reward tokens and strictly segregated from formal examination marks."
    }


@router.post("/claim-reward", status_code=status.HTTP_201_CREATED, summary="Claim Authoritative Event Reward")
async def claim_event_reward(req: ClaimRewardRequest, user: AuthenticatedUser = Depends(get_current_user)):
    """
    Awards authoritative backend points for verified learning milestones.
    Enforces strict event deduplication to prevent duplicate claims and reward farming.
    """
    rule = EVENT_REWARD_RULES.get(req.event_type)
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "Bad Request", "message": f"Unknown reward event type '{req.event_type}'", "code": "UNKNOWN_EVENT_TYPE"}
        )

    # 1. Deduplication / Anti-Farming Key
    claim_key = f"{user.id}:{req.event_type}:{req.reference_id}"
    if claim_key in db_state.processed_reward_events:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "error": "Conflict",
                "message": f"Reward for event '{req.event_type}' with reference '{req.reference_id}' has already been claimed",
                "code": "DUPLICATE_REWARD_CLAIM",
                "previously_claimed_at": db_state.processed_reward_events[claim_key].get("claimed_at")
            }
        )

    # 2. Compute Authoritative Reward
    pts_awarded = rule["points"]
    xp_awarded = rule["xp"]

    profile = db_state.student_profiles.get(user.id)
    if not profile:
        profile = {"total_points": 0, "xp": 0, "level": 1, "streak_days": 1}
        db_state.student_profiles[user.id] = profile

    new_balance = profile.get("total_points", 0) + pts_awarded
    new_xp = profile.get("xp", 0) + xp_awarded
    profile["total_points"] = new_balance
    profile["xp"] = new_xp
    new_level = int((new_xp / 100) ** 0.5) + 1
    profile["level"] = new_level

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    claim_record = {
        "claim_key": claim_key,
        "user_id": user.id,
        "event_type": req.event_type,
        "reference_id": req.reference_id,
        "points_awarded": pts_awarded,
        "xp_awarded": xp_awarded,
        "claimed_at": now_iso
    }
    db_state.processed_reward_events[claim_key] = claim_record

    # 3. Record in Points Transaction Ledger
    db_state.points_transactions.append({
        "id": f"pt_{uuid.uuid4().hex[:8]}",
        "user_id": user.id,
        "amount": pts_awarded,
        "balance_after": new_balance,
        "reason": f"{rule['label']} ({req.reference_id})",
        "reference_type": req.event_type,
        "created_at": now_iso
    })

    return {
        "status": "success",
        "event_type": req.event_type,
        "points_awarded": pts_awarded,
        "xp_awarded": xp_awarded,
        "new_balance": new_balance,
        "new_level": new_level,
        "claim_key": claim_key
    }


@router.get("/transactions", summary="Points History & Ledger")
async def get_points_transactions(user: AuthenticatedUser = Depends(get_current_user)):
    user_txs = [t for t in db_state.points_transactions if t["user_id"] == user.id]
    return list(reversed(user_txs))


@router.get("/achievements", summary="User Unlocked Achievements & Badges")
async def get_achievements(user: AuthenticatedUser = Depends(get_current_user)):
    user_unlocked_ids = {a["achievement_id"] for a in db_state.student_achievements if a["user_id"] == user.id}
    all_achievements = list(db_state.achievements.values())
    
    result = []
    for ach in all_achievements:
        is_unlocked = ach["id"] in user_unlocked_ids
        result.append({
            **ach,
            "unlocked": is_unlocked
        })
    return result


@router.get("/leaderboard", summary="Weekly Student Points Leaderboard")
async def get_leaderboard(user: AuthenticatedUser = Depends(get_current_user)):
    """
    Returns peer ranking based on authoritative platform reward points.
    """
    entries = [
        {"rank": 1, "student_name": "Aarav Sharma", "grade": "Grade 10", "points": 2450, "badge": "Grand Scholar"},
        {"rank": 2, "student_name": "Vishwak Sai", "grade": "Grade 10", "points": db_state.student_profiles.get("usr_student_001", {}).get("total_points", 1450), "badge": "Arena Champion"},
        {"rank": 3, "student_name": "Priya Nair", "grade": "Grade 10", "points": 1380, "badge": "Biology Laureate"},
        {"rank": 4, "student_name": "Bob Vance", "grade": "Grade 10", "points": 890, "badge": "Explorer"}
    ]
    entries.sort(key=lambda x: x["points"], reverse=True)
    for idx, e in enumerate(entries):
        e["rank"] = idx + 1
    return entries


@router.post("/streak/check-in", summary="Record Daily Learning Activity & Protect Streak")
async def record_daily_streak(user: AuthenticatedUser = Depends(get_current_user)):
    profile = db_state.student_profiles.get(user.id)
    if not profile:
        profile = {"total_points": 0, "xp": 0, "level": 1, "streak_days": 1}
        db_state.student_profiles[user.id] = profile

    current_streak = profile.get("streak_days", 14) + 1
    profile["streak_days"] = current_streak

    return {
        "status": "streak_updated",
        "current_streak_days": current_streak,
        "message": f"Awesome! You have kept your daily learning streak alive for {current_streak} consecutive days."
    }
