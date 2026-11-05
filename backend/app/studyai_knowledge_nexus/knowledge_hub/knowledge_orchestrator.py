import time
import logging
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from backend.app.studyai_knowledge_nexus.knowledge_hub.gemini_research_service import gemini_research
from backend.app.studyai_knowledge_nexus.knowledge_hub.openai_knowledge_service import openai_knowledge
from backend.app.studyai_knowledge_nexus.knowledge_hub.knowledge_verification_pipeline import (
    verification_pipeline,
    VerificationStatus,
)
from backend.app.studyai_knowledge_nexus.knowledge_hub.knowledge_library_repo import knowledge_library
from backend.app.studyai_knowledge_nexus.knowledge_hub.image_library_repo import central_image_library
from backend.app.studyai_knowledge_nexus.core.subject_classifier import subject_classifier
from backend.app.studyai_knowledge_nexus.curriculum.curriculum_manager import curriculum_manager
from backend.app.studyai_knowledge_nexus.visualization.threejs_orchestrator import threejs_orchestrator

logger = logging.getLogger("knowledge_nexus.orchestrator")


class KnowledgeRequest(BaseModel):
    query: str = Field(..., description="Topic or learning question to acquire and verify")
    grade: int = Field(default=10, ge=1, le=12)
    board: str = Field(default="ICSE", description="Curriculum board (ICSE, ISC, CBSE)")
    subject: Optional[str] = Field(default=None)
    force_refresh: bool = Field(default=False, description="Bypass cache and force multi-provider external research")


class KnowledgePackage(BaseModel):
    topic: str
    grade: int
    board: str
    subject: str
    chapter: str
    verification_status: str
    confidence_score: float
    content_hash: str
    version: int
    facts: List[str]
    definition_academic: str
    definition_simplified: str
    key_terms: List[Dict[str, str]]
    misconceptions: List[Dict[str, str]]
    prerequisites: List[str]
    visual_recommendation: Dict[str, Any]
    diagrams_and_images: List[Dict[str, Any]]
    three_scene_spec: Optional[Dict[str, Any]] = None
    citations: List[Dict[str, Any]]
    practice_questions: List[Dict[str, Any]]
    cache_hit: bool
    research_source: str
    latency_ms: int


class StudyAIKnowledgeOrchestrator:
    """
    STUDYAI KNOWLEDGE ORCHESTRATOR
    Central Universal Knowledge Hub Orchestration Service.
    Connects:
    1. Google Search Grounding (via Gemini API)
    2. OpenAI GPT Structured Outputs
    3. Central Educational Knowledge Library (Taxonomy + SHA-256 Hashing + 7 Statuses)
    4. Central Image & Diagram Library
    5. Three.js 3D Generation Interface
    6. Existing AI Tutor Bridge
    """

    def is_knowledge_sufficient(self, record: Optional[Dict[str, Any]]) -> bool:
        """
        Evaluates whether a stored knowledge record is sufficient to satisfy the learning query
        without invoking expensive external API requests.
        """
        if not record:
            return False
        # Must be verified against sources, have high confidence and at least 2 facts
        if record.get("verification_status") not in [
            VerificationStatus.VERIFIED_AGAINST_SOURCES.value,
            "verified_against_sources",
        ]:
            return False
        if record.get("confidence_score", 0.0) < 0.85:
            return False
        if len(record.get("facts", [])) < 2:
            return False
        return True

    async def acquire_and_orchestrate_knowledge(
        self,
        request: KnowledgeRequest,
    ) -> KnowledgePackage:
        """
        Central pipeline to research, verify, persist and package curriculum knowledge.
        """
        start_time = time.time()
        topic = request.query.strip()
        grade = request.grade
        board = request.board.upper()

        # Step 1: Subject and chapter classification
        classified = subject_classifier.classify(topic, user_grade=grade, preferred_subject=request.subject)
        resolved_subject = classified["subject"]
        resolved_chapter = classified["matched_chapter"]

        # Step 2: Check Central Educational Knowledge Library
        existing_record = None
        if not request.force_refresh:
            existing_record = knowledge_library.find_record(
                topic=topic,
                grade=grade,
                board=board,
                subject=resolved_subject,
            )

        # Step 3: Sufficiency Evaluation & Cache Check
        if existing_record and self.is_knowledge_sufficient(existing_record):
            logger.info(f"Knowledge Orchestrator: Cache Hit & Sufficient for '{topic}'")
            # Retrieve associated images & 3D models
            images = central_image_library.find_images_for_topic(
                topic=topic,
                subject=resolved_subject,
                grade=grade,
                board=board,
            )
            three_spec = None
            vis_rec = existing_record.get("visual_recommendation", {})
            model_key = vis_rec.get("model_key") or vis_rec.get("model_id")
            if model_key:
                three_spec = threejs_orchestrator.get_scene_spec(model_key)

            elapsed = int((time.time() - start_time) * 1000)
            return KnowledgePackage(
                topic=existing_record["topic"],
                grade=existing_record["grade"],
                board=existing_record["board"],
                subject=existing_record["subject"],
                chapter=existing_record["chapter"],
                verification_status=existing_record["verification_status"],
                confidence_score=existing_record["confidence_score"],
                content_hash=existing_record["content_hash"],
                version=existing_record["version"],
                facts=existing_record["facts"],
                definition_academic=existing_record["definition_academic"],
                definition_simplified=existing_record["definition_simplified"],
                key_terms=existing_record["key_terms"],
                misconceptions=existing_record["misconceptions"],
                prerequisites=existing_record["prerequisites"],
                visual_recommendation=existing_record["visual_recommendation"],
                diagrams_and_images=images,
                three_scene_spec=three_spec,
                citations=existing_record["citations"],
                practice_questions=existing_record["practice_questions"],
                cache_hit=True,
                research_source="Central Educational Knowledge Library",
                latency_ms=elapsed,
            )

        # Step 4: External Research & Grounding (Gemini Google Search Grounding)
        logger.info(f"Knowledge Orchestrator: Initiating Multi-Provider Research for '{topic}'")
        gemini_research_data = await gemini_research.search_and_research_topic(
            topic=topic,
            grade=grade,
            board=board,
            subject=resolved_subject,
        )

        # Step 5: OpenAI GPT Structured Knowledge Synthesis
        synthesized_data = await openai_knowledge.organize_and_synthesize_knowledge(
            topic=topic,
            grade=grade,
            board=board,
            subject=resolved_subject,
            research_evidence=gemini_research_data.get("citations", []),
            chapter=resolved_chapter,
        )

        # Step 6: 7-Stage Verification Pipeline & Reconciliation
        verification = verification_pipeline.verify_and_reconcile(
            topic=topic,
            grade=grade,
            board=board,
            subject=resolved_subject,
            gemini_evidence=gemini_research_data,
            synthesized_data=synthesized_data,
            existing_record=existing_record,
        )

        # Step 7: Persist Approved Knowledge in Central Library
        new_record = {
            "topic": topic,
            "grade": grade,
            "board": board,
            "subject": resolved_subject,
            "chapter": resolved_chapter,
            "subtopic": "",
            "verification_status": verification.status.value,
            "confidence_score": verification.overall_confidence,
            "content_hash": verification.content_hash,
            "facts": verification.verified_facts,
            "definition_academic": synthesized_data.get("formal_academic_definition", ""),
            "definition_simplified": synthesized_data.get("simplified_definition", ""),
            "key_terms": synthesized_data.get("key_terms", []),
            "misconceptions": synthesized_data.get("common_misconceptions", []),
            "prerequisites": synthesized_data.get("prerequisite_concepts", []),
            "visual_recommendation": synthesized_data.get("visual_recommendation", {}),
            "citations": verification.citations,
            "practice_questions": synthesized_data.get("practice_questions", []),
        }

        saved_record = knowledge_library.save_or_update_record(new_record)

        # Step 8: Images & 3D Assets Resolution
        images = central_image_library.find_images_for_topic(
            topic=topic,
            subject=resolved_subject,
            grade=grade,
            board=board,
        )
        three_spec = None
        vis_rec = saved_record.get("visual_recommendation", {})
        model_key = vis_rec.get("model_key") or vis_rec.get("model_id")
        if model_key:
            three_spec = threejs_orchestrator.get_scene_spec(model_key)

        elapsed = int((time.time() - start_time) * 1000)
        return KnowledgePackage(
            topic=saved_record["topic"],
            grade=saved_record["grade"],
            board=saved_record["board"],
            subject=saved_record["subject"],
            chapter=saved_record["chapter"],
            verification_status=saved_record["verification_status"],
            confidence_score=saved_record["confidence_score"],
            content_hash=saved_record["content_hash"],
            version=saved_record["version"],
            facts=saved_record["facts"],
            definition_academic=saved_record["definition_academic"],
            definition_simplified=saved_record["definition_simplified"],
            key_terms=saved_record["key_terms"],
            misconceptions=saved_record["misconceptions"],
            prerequisites=saved_record["prerequisites"],
            visual_recommendation=saved_record["visual_recommendation"],
            diagrams_and_images=images,
            three_scene_spec=three_spec,
            citations=saved_record["citations"],
            practice_questions=saved_record["practice_questions"],
            cache_hit=False,
            research_source=f"{gemini_research_data.get('provider', 'Gemini')} + {synthesized_data.get('synthesized_by', 'OpenAI')}",
            latency_ms=elapsed,
        )


studyai_knowledge_orchestrator = StudyAIKnowledgeOrchestrator()
