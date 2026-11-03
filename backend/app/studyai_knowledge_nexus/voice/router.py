import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from backend.app.studyai_knowledge_nexus.voice.voice_orchestrator import voice_orchestrator

logger = logging.getLogger("knowledge_nexus.voice_router")

voice_api_router = APIRouter(prefix="/voice", tags=["Gemini AI Teacher Voice Mode"])


class StartVoiceLessonRequest(BaseModel):
    topic: str = Field(..., min_length=1, max_length=500, description="Topic for voice lesson, e.g. Photosynthesis")
    grade: int = Field(default=10, ge=1, le=10, description="Student grade 1–10")
    subject: Optional[str] = Field(default=None, description="Curriculum subject")
    mode: str = Field(default="normal", description="'normal' or 'exam_prep'")
    user_id: str = Field(default="student_voice_user")
    profile: Optional[Dict[str, Any]] = Field(default=None, description="Student adaptive profile")
    voice_name: str = Field(default="Kore", description="Gemini voice: Kore, Puck, Fenrir, Aoede")
    speed: float = Field(default=1.0, ge=0.5, le=2.0)


class StudentVoiceTurnRequest(BaseModel):
    session_id: str = Field(..., description="Active session ID from /start-lesson")
    student_utterance: Optional[str] = Field(default=None, description="Student spoken text or response")
    student_speech: Optional[str] = Field(default=None, description="Alias for student_utterance")


class VoiceControlRequest(BaseModel):
    session_id: str
    action: str = Field(..., description="'pause', 'resume', 'mute', 'unmute', 'repeat', 'stop'")


@voice_api_router.post("/start-lesson")
async def start_voice_lesson(payload: StartVoiceLessonRequest):
    """
    Starts an interactive Gemini-powered AI Teacher Voice Lesson:
    - Prepares curriculum knowledge through Knowledge Nexus (Qwen).
    - Generates opening natural teacher speech with Google Gemini audio.
    - Synchronizes visual diagrams / 3D models.
    """
    try:
        res = await voice_orchestrator.start_voice_lesson(
            topic=payload.topic,
            grade=payload.grade,
            subject=payload.subject,
            mode=payload.mode,
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
    - Student answers to checkpoint questions
    - Student interruptions / clarifications ('I don't understand', 'Explain again', 'Give me an example')
    - Returns next spoken response + synchronized visuals
    """
    utterance = payload.student_utterance or payload.student_speech
    if not utterance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either 'student_utterance' or 'student_speech' must be provided.",
        )
    try:
        res = await voice_orchestrator.process_student_turn(
            session_id=payload.session_id,
            student_utterance=utterance,
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
    """Controls session state: pause, resume, mute, unmute, repeat, stop."""
    session = voice_orchestrator.sessions.get(payload.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    action = payload.action.lower()
    if action == "pause":
        session.is_paused = True
        return {"session_id": payload.session_id, "status": "paused", "is_paused": True, "is_muted": session.is_muted}
    elif action == "resume":
        session.is_paused = False
        return {"session_id": payload.session_id, "status": "active", "is_paused": False, "is_muted": session.is_muted}
    elif action == "mute":
        session.is_muted = True
        return {"session_id": payload.session_id, "status": "muted", "is_paused": session.is_paused, "is_muted": True}
    elif action == "unmute":
        session.is_muted = False
        return {"session_id": payload.session_id, "status": "unmuted", "is_paused": session.is_paused, "is_muted": False}
    elif action == "stop":
        if payload.session_id in voice_orchestrator.sessions:
            del voice_orchestrator.sessions[payload.session_id]
        return {
            "session_id": payload.session_id,
            "status": "stopped",
            "is_lesson_finished": True,
            "message": "Voice session ended successfully."
        }
    elif action == "repeat":
        current_step = session.lesson_steps[session.current_step_index]
        audio = await voice_orchestrator.generate_gemini_audio(current_step["teacher_speech"], session.voice_name, session.speed)
        return {
            "session_id": payload.session_id,
            "status": "repeated",
            "teacher_speech": current_step["teacher_speech"],
            "audio_url": audio.get("audio_url"),
        }

    return {"session_id": payload.session_id, "status": action, "is_paused": session.is_paused, "is_muted": session.is_muted}


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
        "current_step_index": session.current_step_index,
        "total_steps": len(session.lesson_steps),
        "is_paused": session.is_paused,
        "is_muted": session.is_muted,
        "transcript": session.conversation_transcript,
    }
