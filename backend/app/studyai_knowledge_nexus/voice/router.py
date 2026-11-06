import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from backend.app.studyai_knowledge_nexus.voice.voice_orchestrator import voice_orchestrator

logger = logging.getLogger("knowledge_nexus.voice_router")

voice_api_router = APIRouter(prefix="/voice", tags=["Gemini AI Teacher Voice Mode"])


def parse_grade(val: Any) -> int:
    if isinstance(val, int):
        return max(1, min(12, val))
    if isinstance(val, str):
        digits = "".join(ch for ch in val if ch.isdigit())
        if digits:
            return max(1, min(12, int(digits)))
    return 10


class StartVoiceLessonRequest(BaseModel):
    topic: str = Field(..., min_length=1, max_length=500, description="Topic for voice lesson, e.g. Photosynthesis")
    grade: Any = Field(default=10, description="Student grade 1–12 (integer or string like 'Grade 10')")
    subject: Optional[str] = Field(default=None, description="Curriculum subject")
    mode: str = Field(default="normal", description="'normal' or 'exam_prep'")
    depth: str = Field(default="standard", description="'quick', 'standard', 'detailed', 'complete_teacher'")
    language: str = Field(default="en", description="Supported: 'en', 'te', 'hi', 'ur', 'ml'")
    student_question: Optional[str] = Field(default=None, description="Original student question")
    tutor_structured: Optional[Dict[str, Any]] = Field(default=None, description="Structured lesson JSON from AI Tutor")
    tutor_content: Optional[str] = Field(default=None, description="Full markdown response from AI Tutor")
    user_id: str = Field(default="student_voice_user")
    profile: Optional[Dict[str, Any]] = Field(default=None, description="Student adaptive profile")
    voice_name: str = Field(default="Kore", description="Voice: Kore, Puck, Fenrir, Aoede")
    speed: float = Field(default=1.0, ge=0.5, le=2.0)


class CreateLessonFromTutorRequest(BaseModel):
    student_question: Optional[str] = None
    topic: str
    subject: Optional[str] = None
    grade: Any = 10
    mode: str = "normal"
    depth: str = "standard"
    language: str = "en"
    tutor_structured: Optional[Dict[str, Any]] = None
    tutor_content: Optional[str] = None
    voice_name: str = "Kore"
    speed: float = 1.0


class StudentVoiceTurnRequest(BaseModel):
    session_id: str = Field(..., description="Active session ID from /start-lesson")
    student_utterance: Optional[str] = Field(default=None, description="Student spoken text or response")
    student_speech: Optional[str] = Field(default=None, description="Alias for student_utterance")
    action: Optional[str] = Field(default=None, description="Action: 'repeat_sentence', 'explain_simpler', 'explain_detailed', 'explain_formula', 'explain_diagram', 'give_example', 'previous_step'")
    command: Optional[str] = Field(default=None, description="Alias for action")
    selected_option_index: Optional[int] = Field(default=None, description="Selected checkpoint question index")


class VoiceControlRequest(BaseModel):
    session_id: str
    action: Optional[str] = Field(default=None, description="'pause', 'resume', 'mute', 'unmute', 'repeat', 'stop', 'speed', 'set_sentence', 'jump_section', 'replay'")
    command: Optional[str] = Field(default=None, description="Alias for action")
    speed: Optional[float] = Field(default=None, ge=0.5, le=2.0)
    section_index: Optional[int] = Field(default=None, ge=0)
    sentence_index: Optional[int] = Field(default=None, ge=0)
    selected_option_index: Optional[int] = Field(default=None, ge=0)


@voice_api_router.post("/start-lesson")
async def start_voice_lesson(payload: StartVoiceLessonRequest):
    """
    Starts an interactive AI Teacher Voice Lesson:
    - Connects directly to AI Tutor's full structured explanation.
    - Generates classroom pedagogical sequence (up to 15 sections based on depth).
    - Synchronizes sentence-level visual diagrams & 3D models.
    """
    try:
        res = await voice_orchestrator.start_voice_lesson(
            topic=payload.topic,
            grade=parse_grade(payload.grade),
            subject=payload.subject,
            mode=payload.mode,
            depth=payload.depth,
            language=payload.language,
            student_question=payload.student_question,
            tutor_structured=payload.tutor_structured,
            tutor_content=payload.tutor_content,
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


@voice_api_router.post("/create-lesson-from-tutor")
async def create_lesson_from_tutor(payload: CreateLessonFromTutorRequest):
    """
    Direct bridge from AI Tutor response to Voice Teacher Engine:
    Receives complete tutor lesson and converts it to a structured voice curriculum.
    """
    try:
        res = await voice_orchestrator.start_voice_lesson(
            topic=payload.topic,
            grade=parse_grade(payload.grade),
            subject=payload.subject,
            mode=payload.mode,
            depth=payload.depth,
            language=payload.language,
            student_question=payload.student_question,
            tutor_structured=payload.tutor_structured,
            tutor_content=payload.tutor_content,
            voice_name=payload.voice_name,
            speed=payload.speed,
        )
        return res
    except Exception as e:
        logger.error(f"Error creating voice lesson from AI Tutor: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Tutor-to-Voice conversion error: {str(e)}",
        )


@voice_api_router.post("/interact")
async def process_student_voice_turn(payload: StudentVoiceTurnRequest):
    """
    Handles two-way conversational turn-taking:
    - Checkpoint question evaluation
    - Student requests ('Explain simpler', 'Repeat sentence', 'Explain formula', 'Explain diagram', etc.)
    - Returns next spoken response + synchronized visuals
    """
    utterance = payload.student_utterance or payload.student_speech or ""
    action_req = payload.action or payload.command
    try:
        res = await voice_orchestrator.process_student_turn(
            session_id=payload.session_id,
            student_utterance=utterance,
            action=action_req,
            selected_option_index=payload.selected_option_index
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
    """Controls session state: pause, resume, mute, unmute, repeat, stop, speed, jump_section, set_sentence."""
    action_req = payload.action or payload.command or "pause"
    # If the control action is an interactive pedagogical request or answer submission, route through student turn
    interactive_actions = {
        "repeat_sentence", "explain_simpler", "explain_detailed",
        "explain_formula", "explain_diagram", "give_example",
        "previous_step", "submit_answer"
    }
    if action_req in interactive_actions:
        try:
            return await voice_orchestrator.process_student_turn(
                session_id=payload.session_id,
                student_utterance="",
                action=action_req,
                selected_option_index=payload.selected_option_index
            )
        except ValueError as ve:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
        except Exception as e:
            logger.error(f"Error in voice control interactive action: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Voice control failure: {str(e)}",
            )

    try:
        res = await voice_orchestrator.update_session_control(
            session_id=payload.session_id,
            action=action_req,
            speed=payload.speed,
            section_index=payload.section_index,
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
        "depth": session.depth,
        "language": session.language,
        "speed": session.speed,
        "current_step_index": session.current_step_index,
        "current_sentence_index": session.current_sentence_index,
        "is_paused": session.is_paused,
        "total_steps": len(session.lesson_steps),
        "transcript": session.conversation_transcript,
        "active_visual": session.active_visual,
    }
