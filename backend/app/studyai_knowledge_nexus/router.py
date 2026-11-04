import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

from backend.app.studyai_knowledge_nexus.core.knowledge_router import knowledge_nexus_router
from backend.app.studyai_knowledge_nexus.core.subject_classifier import subject_classifier
from backend.app.studyai_knowledge_nexus.curriculum.icse_database import icse_db, ICSE_CURRICULUM_TREE
from backend.app.studyai_knowledge_nexus.curriculum.curriculum_manager import curriculum_manager
from backend.app.studyai_knowledge_nexus.subjects.subject_registry import subject_registry
from backend.app.studyai_knowledge_nexus.subjects.mathematics_engine import math_engine
from backend.app.studyai_knowledge_nexus.subjects.history_engine import history_engine
from backend.app.studyai_knowledge_nexus.vision.document_ingestion import doc_ingestion
from backend.app.studyai_knowledge_nexus.visualization.visual_decision_engine import visual_decision_engine
from backend.app.studyai_knowledge_nexus.visualization.threejs_orchestrator import threejs_orchestrator
from backend.app.studyai_knowledge_nexus.core.grade_controller import grade_controller
from backend.app.studyai_knowledge_nexus.core.adaptation_engine import adaptation_engine
from backend.app.studyai_knowledge_nexus.core.adaptive_memory import adaptive_memory
from backend.app.studyai_knowledge_nexus.training.sft_evaluator import sft_evaluator

logger = logging.getLogger("knowledge_nexus.api_router")

nexus_api_router = APIRouter(prefix="/nexus", tags=["STUDYAI Knowledge Nexus"])


class NexusAskRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=5000, description="Student topic, question or problem")
    grade: int = Field(default=10, ge=1, le=12, description="Student grade 1–12")
    subject: Optional[str] = Field(default=None, description="Curriculum subject (e.g. Mathematics, English I, Physics)")
    board: str = Field(default="ICSE", description="Curriculum Board: 'ICSE', 'ISC', or 'CBSE'")
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


class VisualDecisionRequest(BaseModel):
    topic: str
    subject: str = "Science"
    grade: int = 10
    board: str = "ICSE"


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
            board=payload.board,
            mode=payload.mode,
            language=payload.language,
            profile=payload.profile,
            file_payload=payload.file_payload,
        )
        return result
    except Exception as e:
        logger.error(f"Error in Knowledge Nexus /ask pipeline: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Knowledge Nexus Error: {str(e)}",
        )


@nexus_api_router.get("/subjects")
async def list_ten_subject_engines():
    """Lists the 10 independent Subject Intelligence Engines with allowed visual types."""
    subjects_info = []
    for sub in subject_registry.list_all_subjects():
        eng = subject_registry.get_engine(sub)
        subjects_info.append({
            "subject": eng.subject_name,
            "engine_class": eng.__class__.__name__,
            "allowed_visual_types": eng.allowed_visual_types
        })
    return {"total_subjects": len(subjects_info), "subjects": subjects_info}


@nexus_api_router.post("/visual-decision")
async def test_visual_decision(payload: VisualDecisionRequest):
    """Evaluates an educational topic across the 12 visual decision modalities with strict 3D gatekeeping."""
    decision = visual_decision_engine.decide_visual(
        topic=payload.topic,
        subject=payload.subject,
        grade=payload.grade,
        board=payload.board,
    )
    return decision.dict()


@nexus_api_router.get("/board-profile/{board}")
async def get_curriculum_board_profile(board: str):
    """Returns curriculum profile and publisher mappings for ICSE, ISC, or CBSE."""
    return curriculum_manager.get_board_profile(board)


@nexus_api_router.get("/sft-benchmark")
async def run_sft_dataset_benchmark():
    """Evaluates Qwen and Knowledge Nexus against the Subject SFT Dataset."""
    return sft_evaluator.run_benchmark_evaluation()


@nexus_api_router.post("/solve-math")
async def solve_mathematics_equation(payload: SolveMathRequest):
    """Solves algebraic, quadratic, or linear equations using exact SymPy symbolic logic."""
    res = math_engine.solve_algebraic_expression(payload.expression)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Math parsing failed"))
    return res


@nexus_api_router.post("/verify-math")
async def verify_math_candidate_solution(payload: VerifySolutionRequest):
    """Independently verifies candidate mathematical solutions without hallucination."""
    return math_engine.verify_solution(payload.equation, payload.candidate_answer)


@nexus_api_router.post("/history-event")
async def get_history_16_point_dossier(payload: HistoryEventRequest):
    """Generates a structured 16-point historical dossier and SVG chronological timeline."""
    return history_engine.analyze_event(payload.event_query)


@nexus_api_router.post("/classify")
async def classify_student_query(payload: NexusAskRequest):
    """Classifies student query into subject, grade, and chapter curriculum nodes."""
    return subject_classifier.classify(
        query=payload.query,
        user_grade=payload.grade,
        preferred_subject=payload.subject,
    )


@nexus_api_router.post("/ingest-document")
async def ingest_document_file(payload: DocumentIngestRequest):
    """Ingests and parses student uploaded files, detecting questions and academic concepts."""
    return doc_ingestion.process_file_payload(
        file_name=payload.file_name,
        content_type=payload.content_type,
        data_base64=payload.data_base64,
        raw_text=payload.raw_text,
    )


@nexus_api_router.get("/curriculum/{grade}")
async def get_curriculum_by_grade(grade: int = 10, board: str = "ICSE"):
    """Returns the full curriculum tree for the requested grade and board."""
    return {
        "board": board.upper(),
        "grade": grade,
        "subjects": ICSE_CURRICULUM_TREE.get(grade, {}),
        "approved_publishers": icse_db.get_all_publishers(),
    }


@nexus_api_router.get("/grade-profile/{grade}")
async def get_grade_profile(grade: int = 10):
    """Returns the Grade-Aware pedagogical constraints."""
    return grade_controller.get_grade_profile(grade)


@nexus_api_router.get("/3d-scene/{model_id}")
async def get_3d_scene_spec(model_id: str):
    """Returns declarative Three.js 3D scene specifications without eval strings."""
    scene = threejs_orchestrator.get_scene_spec(model_id)
    if not scene:
        raise HTTPException(status_code=404, detail="3D model specification not found")
    return scene


@nexus_api_router.get("/adaptive-profile/{user_id}")
async def get_student_adaptive_profile(user_id: str):
    """Returns student's persistent learning profile."""
    return adaptive_memory.get_profile(user_id)


class UpdateAdaptiveProfileRequest(BaseModel):
    difficulties: Optional[List[str]] = None
    explanation_style: Optional[str] = None
    preferred_learning_methods: Optional[List[str]] = None
    grade: Optional[int] = None


@nexus_api_router.post("/adaptive-profile/{user_id}")
async def update_student_adaptive_profile(user_id: str, payload: UpdateAdaptiveProfileRequest):
    """Updates student self-reported learning difficulties and explanation preferences."""
    return adaptive_memory.update_profile(
        user_id=user_id,
        difficulties=payload.difficulties,
        explanation_style=payload.explanation_style,
        preferred_learning_methods=payload.preferred_learning_methods,
        grade=payload.grade,
    )


class RecordInteractionRequest(BaseModel):
    user_id: str
    topic: str
    subject: str = "General"
    grade: int = 10
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
