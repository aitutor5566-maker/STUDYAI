import time
import logging
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from backend.app.studyai_knowledge_nexus.research_pipeline.question_understanding_service import (
    question_understanding_service,
    QuestionUnderstandingResult,
)
from backend.app.studyai_knowledge_nexus.research_pipeline.research_planner import (
    research_planner,
    ResearchPlan,
)
from backend.app.studyai_knowledge_nexus.research_pipeline.search_retrieval_service import (
    search_retrieval_service,
    SearchRetrievalResult,
)
from backend.app.studyai_knowledge_nexus.research_pipeline.knowledge_processor import (
    knowledge_processor,
    StructuredKnowledgePackage,
)
from backend.app.studyai_knowledge_nexus.research_pipeline.fact_verification_layer import (
    fact_verification_layer,
    FactVerificationReport,
)
from backend.app.studyai_knowledge_nexus.research_pipeline.educational_content_generator import (
    educational_content_generator,
    CompleteEducationalLesson,
)
from backend.app.studyai_knowledge_nexus.knowledge_hub.knowledge_library_repo import knowledge_library

logger = logging.getLogger("research_pipeline.coordinator")


class PipelineExecutionRequest(BaseModel):
    question: str = Field(..., description="Student input question")
    grade: int = Field(default=10, ge=1, le=12)
    curriculum: str = Field(default="ICSE", description="Curriculum Board: ICSE, ISC, or CBSE")
    subject: Optional[str] = Field(default=None)
    language: str = Field(default="English")
    session_id: Optional[str] = Field(default=None)
    force_research: bool = Field(default=False)


class PipelineExecutionResponse(BaseModel):
    status: str = "success"
    request_id: str
    question_understanding: QuestionUnderstandingResult
    research_plan: Optional[ResearchPlan] = None
    retrieval_result: Optional[SearchRetrievalResult] = None
    knowledge_package: StructuredKnowledgePackage
    verification_report: FactVerificationReport
    lesson: CompleteEducationalLesson
    total_latency_ms: int
    context_preserved: bool = True


class MasterResearchPipelineCoordinator:
    """
    MASTER AI RESEARCH AND EDUCATIONAL GENERATION PIPELINE COORDINATOR
    Orchestrates the foundational 12-step research and educational generation workflow:
    1. Receive student question
    2. Understand question
    3. Identify subject, topic, subtopic, grade, curriculum
    4. Decide whether external research is required
    5. Search reliable educational sources when needed
    6. Retrieve and organize relevant information
    7. Verify important facts against sources
    8. Generate detailed educational lesson
    9. Prepare structured visual requirements
    10. Prepare structured 3D requirements
    11. Return complete lesson to existing STUDYAI AI Tutor
    12. Preserve lesson context for follow-up questions
    """

    # In-memory lesson conversation context cache for follow-ups
    _session_context_cache: Dict[str, CompleteEducationalLesson] = {}

    async def execute_pipeline(self, request: PipelineExecutionRequest) -> PipelineExecutionResponse:
        start_time = time.time()
        session_id = request.session_id or f"sess-{int(start_time)}"

        # Step 1 & 2 & 3: Understand Question, Subject, Topic, Subtopic, Grade, Curriculum
        cached_record = knowledge_library.find_record(
            topic=request.question,
            grade=request.grade,
            board=request.curriculum,
            subject=request.subject,
        )
        has_cached = cached_record is not None and not request.force_research

        understanding = question_understanding_service.analyze_question(
            question=request.question,
            grade=request.grade,
            curriculum=request.curriculum,
            preferred_subject=request.subject,
            language=request.language,
            cached_record_exists=has_cached,
        )

        # Step 4: Decide whether external research is required
        needs_research = understanding.research_requirement or request.force_research

        plan: Optional[ResearchPlan] = None
        retrieval: Optional[SearchRetrievalResult] = None

        if needs_research:
            # Step 5: Research Planner
            plan = research_planner.create_research_plan(understanding)
            # Step 6: Search & Retrieval Service
            retrieval = await search_retrieval_service.execute_plan(plan)
        else:
            # Fallback or cached retrieval representation
            plan = research_planner.create_research_plan(understanding)
            retrieval = SearchRetrievalResult(
                query_executed="Local Curriculum Repository Retrieval",
                sources=[],
                provider_used="Central Educational Knowledge Library",
                sunset_notice="Using verified local curricular textbook repository.",
                total_sources_retrieved=0,
            )

        # Step 7: Knowledge Processor (12-element isolated package)
        knowledge = knowledge_processor.process_knowledge(
            understanding=understanding,
            plan=plan,
            retrieval=retrieval,
            session_id=session_id,
        )

        # Step 8: Fact-Verification Layer
        verification = fact_verification_layer.verify_package(
            claims=knowledge.key_facts,
            formulas=knowledge.formulas,
            sources=knowledge.source_references,
            subject=knowledge.subject,
        )

        # Step 9, 10, 11: Educational Content Generator with Visual, 3D & Voice Contracts
        lesson = educational_content_generator.generate_lesson(
            understanding=understanding,
            knowledge=knowledge,
            verification=verification,
            session_id=session_id,
        )

        # Step 12: Preserve Lesson Context for Follow-Up Questions
        self._session_context_cache[session_id] = lesson

        elapsed = int((time.time() - start_time) * 1000)

        return PipelineExecutionResponse(
            status="success",
            request_id=f"req-{int(start_time * 1000)}",
            question_understanding=understanding,
            research_plan=plan,
            retrieval_result=retrieval,
            knowledge_package=knowledge,
            verification_report=verification,
            lesson=lesson,
            total_latency_ms=elapsed,
            context_preserved=True,
        )

    def get_session_context(self, session_id: str) -> Optional[CompleteEducationalLesson]:
        """Retrieves active lesson context for continuous conversational follow-ups."""
        return self._session_context_cache.get(session_id)


master_research_pipeline_coordinator = MasterResearchPipelineCoordinator()
