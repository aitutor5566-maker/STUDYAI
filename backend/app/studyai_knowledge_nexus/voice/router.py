import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from backend.app.studyai_knowledge_nexus.voice.voice_orchestrator import voice_orchestrator

logger = logging.getLogger("knowledge_nexus.voice_router")

voice_api_router = APIRouter(prefix="/voice", tags=["Gemini AI Teacher Voice Mode"])


class StartVoiceLessonRequest(BaseModel):
    topic: str = Field(..., min_length=1, max_length=500, description="Topic for voice lesson, e.g. Photosynthesis")
    grade: int = Field(default=10, ge=1, le=12, description="Student grade 1–12")
    subject: Optional[str] = Field(default=None, description="Curriculum subject")
    mode: str = Field(default="normal", description="'normal' or 'exam_prep'")
    language: str = Field(default="en", description="Supported: 'en', 'te', 'hi', 'ur', 'ml'")
    user_id: str = Field(default="student_voice_user")
    profile: Optional[Dict[str, Any]] = Field(default=None, description="Student adaptive profile")
    voice_name: str = Field(default="Kore", description="Voice: Kore, Puck, Fenrir, Aoede")
    speed: float = Field(default=1.0, ge=0.5, le=2.0)


class StudentVoiceTurnRequest(BaseModel):
    session_id: str = Field(..., description="Active session ID from /start-lesson")
    student_utterance: Optional[str] = Field(default=None, description="Student spoken text or response")
    student_speech: Optional[str] = Field(default=None, description="Alias for student_utterance")
    action: Optional[str] = Field(default=None, description="Action: 'repeat_sentence', 'explain_simpler', 'explain_step_by_step'")


class VoiceControlRequest(BaseModel):
    session_id: str
    action: str = Field(..., description="'pause', 'resume', 'mute', 'unmute', 'repeat', 'stop', 'speed', 'set_sentence', 'replay'")
    speed: Optional[float] = Field(default=None, ge=0.5, le=2.0)
    sentence_index: Optional[int] = Field(default=None, ge=0)


@voice_api_router.post("/start-lesson")
async def start_voice_lesson(payload: StartVoiceLessonRequest):
    """
    Starts an interactive AI Teacher Voice Lesson:
    - Prepares curriculum knowledge through Knowledge Library.
    - Generates opening natural teacher speech with Google Gemini / ElevenLabs audio or browser fallback.
    - Synchronizes sentence-level visual diagrams / 3D models.
    """
    try:
        res = await voice_orchestrator.start_voice_lesson(
            topic=payload.topic,
            grade=payload.grade,
            subject=payload.subject,
            mode=payload.mode,
            language=payload.language,
            user_id=payload.user_id,
            profile=payload.profile,
            voice_name=payload.voice_name,
            speed=payload.speed,
        )
        return res
    except Exception as e:
        logger.error(f"Error starting voice lesson: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Voice lesson startup error: {str(e)}",
        )


@voice_api_router.post("/interact")
async def process_student_voice_turn(payload: StudentVoiceTurnRequest):
    """
    Handles two-way conversational turn-taking:
    - Checkpoint question evaluation
    - Student requests ('Explain simpler', 'Repeat sentence', 'Explain step-by-step')
    - Returns next spoken response + synchronized visuals
    """
    utterance = payload.student_utterance or payload.student_speech or ""
    try:
        res = await voice_orchestrator.process_student_turn(
            session_id=payload.session_id,
            student_utterance=utterance,
            action=payload.action
        )
        return res
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        logger.error(f"Error in student voice interaction: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Voice interaction failure: {str(e)}",
        )


@voice_api_router.post("/control")
async def voice_session_control(payload: VoiceControlRequest):
    """Controls session state: pause, resume, mute, unmute, repeat, stop, speed, set_sentence."""
    try:
        res = await voice_orchestrator.update_session_control(
            session_id=payload.session_id,
            action=payload.action,
            speed=payload.speed,
            sentence_index=payload.sentence_index
        )
        return res
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        logger.error(f"Error in voice control: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Voice control failure: {str(e)}",
        )


@voice_api_router.get("/session/{session_id}")
async def get_voice_session(session_id: str):
    """Retrieves session details and full conversation transcript."""
    session = voice_orchestrator.sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Voice session not found")

    return {
        "session_id": session.session_id,
        "topic": session.topic,
        "grade": session.grade,
        "subject": session.subject,
        "mode": session.mode,
        "language": session.language,
        "speed": session.speed,
        "current_step_index": session.current_step_index,
        "current_sentence_index": session.current_sentence_index,
        "is_paused": session.is_paused,
        "total_steps": len(session.lesson_steps),
        "transcript": session.conversation_transcript,
        "active_visual": session.active_visual,
    }
