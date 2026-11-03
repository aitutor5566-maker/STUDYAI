import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

from backend.app.studyai_knowledge_nexus.core.knowledge_router import knowledge_nexus_router
from backend.app.studyai_knowledge_nexus.core.subject_classifier import subject_classifier
from backend.app.studyai_knowledge_nexus.curriculum.icse_database import icse_db, ICSE_CURRICULUM_TREE
from backend.app.studyai_knowledge_nexus.subjects.mathematics_engine import math_engine
from backend.app.studyai_knowledge_nexus.subjects.history_engine import history_engine
from backend.app.studyai_knowledge_nexus.vision.document_ingestion import doc_ingestion
from backend.app.studyai_knowledge_nexus.visualization.threejs_orchestrator import threejs_orchestrator
from backend.app.studyai_knowledge_nexus.core.grade_controller import grade_controller
from backend.app.studyai_knowledge_nexus.core.adaptation_engine import adaptation_engine
from backend.app.studyai_knowledge_nexus.core.adaptive_memory import adaptive_memory

logger = logging.getLogger("knowledge_nexus.api_router")

nexus_api_router = APIRouter(prefix="/nexus", tags=["STUDYAI Knowledge Nexus"])


class NexusAskRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=5000, description="Student topic, question or problem")
    grade: int = Field(default=10, ge=1, le=10, description="ICSE Grade 1–10")
    subject: Optional[str] = Field(default=None, description="Optional subject (e.g. Mathematics, History & Civics)")
    mode: str = Field(default="normal", description="'normal' or 'exam_prep'")
    language: str = Field(default="English", description="Response language")
    profile: Optional[Dict[str, Any]] = Field(default=None, description="Student weakness & learning profile")
    file_payload: Optional[Dict[str, Any]] = Field(default=None, description="Optional attached document/image")


class SolveMathRequest(BaseModel):
    expression: str = Field(..., description="Equation or expression e.g. 2*x^2 - 8*x + 6 = 0")


class VerifySolutionRequest(BaseModel):
    equation: str = Field(...)
    candidate_answer: str = Field(...)


class HistoryEventRequest(BaseModel):
    event_query: str = Field(..., description="Historical event or era, e.g. 1857 First War of Independence")


class DocumentIngestRequest(BaseModel):
    file_name: str
    content_type: str = "application/octet-stream"
    data_base64: Optional[str] = None
    raw_text: Optional[str] = None


@nexus_api_router.post("/ask")
async def ask_knowledge_nexus(payload: NexusAskRequest):
    """
    Main entry point for STUDYAI Knowledge Nexus:
    Universal Educational Intelligence, Research, Retrieval & Teaching.
    """
    try:
        result = await knowledge_nexus_router.process_learning_query(
            query=payload.query,
            grade=payload.grade,
            subject=payload.subject,
            mode=payload.mode,
            language=payload.language,
            profile=payload.profile,
            file_payload=payload.file_payload,
        )
        return result
    except Exception as e:
        logger.error(f"Error in Knowledge Nexus /ask: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Knowledge Nexus orchestration failure: {str(e)}",
        )


@nexus_api_router.post("/classify")
async def classify_query(payload: Dict[str, Any]):
    query = payload.get("query", "")
    grade = payload.get("grade", 10)
    subject = payload.get("subject")
    return subject_classifier.classify(query=query, user_grade=grade, preferred_subject=subject)


@nexus_api_router.get("/curriculum/{grade}")
async def get_grade_curriculum(grade: int):
    """Returns official ICSE Grade curriculum tree."""
    curriculum = ICSE_CURRICULUM_TREE.get(grade)
    if not curriculum:
        raise HTTPException(status_code=404, detail=f"ICSE curriculum for Grade {grade} not found")
    return {
        "board": "ICSE",
        "grade": grade,
        "subjects": curriculum,
        "approved_publishers": icse_db.get_all_publishers(),
    }


@nexus_api_router.post("/solve-math")
async def solve_mathematics(payload: SolveMathRequest):
    """Symbolic computation and derivation verified by SymPy."""
    return math_engine.solve_algebraic_expression(payload.expression)


@nexus_api_router.post("/verify-math")
async def verify_mathematics(payload: VerifySolutionRequest):
    """Independently verifies candidate mathematical answer."""
    return math_engine.verify_solution(payload.equation, payload.candidate_answer)


@nexus_api_router.post("/history-event")
async def get_history_dossier(payload: HistoryEventRequest):
    """Produces 16-point comprehensive historical analysis dossier."""
    return history_engine.analyze_event(payload.event_query)


@nexus_api_router.post("/ingest-document")
async def ingest_document(payload: DocumentIngestRequest):
    """Processes multimodal documents, handwritten homework or scanned pages."""
    return doc_ingestion.process_file_payload(
        file_name=payload.file_name,
        content_type=payload.content_type,
        data_base64=payload.data_base64,
        raw_text=payload.raw_text,
    )


@nexus_api_router.get("/3d-scene/{model_id}")
async def get_3d_scene(model_id: str):
    """Returns safe declarative Three.js 3D scene specification."""
    scene = threejs_orchestrator.get_scene_spec(model_id)
    if not scene:
        raise HTTPException(status_code=404, detail=f"3D Scene '{model_id}' not found")
    return scene


@nexus_api_router.get("/grade-profile/{grade}")
async def get_grade_profile(grade: int):
    """Returns the 12 depth and vocabulary parameters for the specified grade."""
    if grade < 1 or grade > 10:
        raise HTTPException(status_code=400, detail="Grade must be between 1 and 10")
    return grade_controller.get_grade_profile(grade)


@nexus_api_router.get("/adaptive-profile/{user_id}")
async def get_student_adaptive_profile(user_id: str):
    """Retrieves empirical student learning profile and continuous adaptation adjustments."""
    return adaptive_memory.get_or_create_profile(user_id)


class UpdateAdaptiveProfileRequest(BaseModel):
    difficulties: Optional[List[str]] = None
    explanation_style: Optional[str] = None
    preferred_learning_methods: Optional[List[str]] = None
    grade: Optional[int] = None


@nexus_api_router.post("/adaptive-profile/{user_id}")
async def update_student_adaptive_profile(user_id: str, payload: UpdateAdaptiveProfileRequest):
    """Allows student to review and edit learning difficulties and preferences."""
    return adaptive_memory.update_student_preferences(
        user_id=user_id,
        difficulties=payload.difficulties,
        explanation_style=payload.explanation_style,
        preferred_learning_methods=payload.preferred_learning_methods,
        grade=payload.grade,
    )


class RecordInteractionRequest(BaseModel):
    user_id: str
    topic: str
    subject: str
    grade: int
    question_answered: bool = False
    was_correct: bool = True
    student_feedback: Optional[str] = None
    mistake_type: Optional[str] = None


@nexus_api_router.post("/record-interaction")
async def record_student_interaction(payload: RecordInteractionRequest):
    """Records real student learning interactions and empirical accuracy updates."""
    return adaptive_memory.record_interaction(
        user_id=payload.user_id,
        topic=payload.topic,
        subject=payload.subject,
        grade=payload.grade,
        question_answered=payload.question_answered,
        was_correct=payload.was_correct,
        student_feedback=payload.student_feedback,
        mistake_type=payload.mistake_type,
    )


class AdaptationsPreviewRequest(BaseModel):
    topic: str
    subject: str = "Science"
    grade: int = 10
    difficulties: List[str]


@nexus_api_router.post("/adaptations-preview")
async def preview_adaptations(payload: AdaptationsPreviewRequest):
    """Previews independent pedagogical scaffolding for declared learning difficulties."""
    return adaptation_engine.generate_adaptations(
        topic=payload.topic,
        subject=payload.subject,
        grade=payload.grade,
        difficulties=payload.difficulties,
    )
