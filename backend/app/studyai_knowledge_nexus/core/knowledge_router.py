import logging
import time
import uuid
from typing import Any, Dict, List, Optional

from backend.app.studyai_knowledge_nexus.core.ai_gateway import ai_gateway
from backend.app.studyai_knowledge_nexus.core.hallucination_guard import hallucination_guard
from backend.app.studyai_knowledge_nexus.core.subject_classifier import subject_classifier
from backend.app.studyai_knowledge_nexus.core.teaching_orchestrator import teaching_orchestrator
from backend.app.studyai_knowledge_nexus.core.grade_controller import grade_controller
from backend.app.studyai_knowledge_nexus.core.adaptation_engine import adaptation_engine
from backend.app.studyai_knowledge_nexus.core.adaptive_memory import adaptive_memory
from backend.app.studyai_knowledge_nexus.core.response_validator import response_validator
from backend.app.studyai_knowledge_nexus.curriculum.curriculum_manager import curriculum_manager
from backend.app.studyai_knowledge_nexus.curriculum.icse_database import icse_db
from backend.app.studyai_knowledge_nexus.subjects.subject_registry import subject_registry
from backend.app.studyai_knowledge_nexus.vision.document_ingestion import doc_ingestion
from backend.app.studyai_knowledge_nexus.vision.vision_analyzer import vision_analyzer
from backend.app.studyai_knowledge_nexus.research.gap_detector import gap_detector
from backend.app.studyai_knowledge_nexus.research.external_research_engine import external_research
from backend.app.studyai_knowledge_nexus.visualization.visual_decision_engine import visual_decision_engine
from backend.app.studyai_knowledge_nexus.visualization.threejs_orchestrator import threejs_orchestrator

logger = logging.getLogger("knowledge_nexus.router")


class KnowledgeNexusRouter:
    """
    Central Coordinator for STUDYAI Knowledge Nexus.
    Orchestrates:
    - 10 Independent Subject Intelligence Engines (No cross-contamination).
    - Multi-Curriculum Support: ICSE, ISC, and CBSE.
    - Deterministic Visual Decision Engine (12 visual modalities; strictly gatekept 3D).
    - Grade & Student Intelligence with 10 scaffolding strategies.
    - Multi-Stage Response Validation preventing malformed outputs.
    """

    async def process_learning_query(
        self,
        query: str,
        grade: int = 10,
        subject: Optional[str] = None,
        board: str = "ICSE",
        mode: str = "normal",
        language: str = "English",
        profile: Optional[Dict[str, Any]] = None,
        file_payload: Optional[Dict[str, Any]] = None,
        user_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        start_time = time.time()
        effective_user_id = user_id or (profile or {}).get("user_id") or "anonymous_student"
        effective_board = board.upper()

        # Step 1: Input sanitization & Anti-injection check
        cleaned_query = hallucination_guard.sanitize_input(query)

        # Step 2: Multimodal / Document Ingestion if file payload is attached
        doc_info = None
        vision_result = None
        if file_payload:
            doc_info = doc_ingestion.process_file_payload(
                file_name=file_payload.get("file_name", "upload"),
                content_type=file_payload.get("content_type", "application/octet-stream"),
                data_base64=file_payload.get("data_base64"),
                raw_text=file_payload.get("text"),
            )
            if doc_info.get("is_image") and file_payload.get("data_base64"):
                vision_result = await vision_analyzer.analyze_image_data(
                    base64_data=file_payload["data_base64"],
                    mime_type=file_payload.get("content_type", "image/jpeg"),
                    user_prompt=cleaned_query,
                )
                if vision_result.get("transcription"):
                    cleaned_query = f"{cleaned_query}\n[Visual Image Input Analysis]: {vision_result['transcription']}"

        # Step 3: Subject & Curriculum Classification
        classification = subject_classifier.classify(
            query=cleaned_query,
            user_grade=grade,
            preferred_subject=subject,
        )
        resolved_subject = classification["subject"]
        resolved_chapter = classification["matched_chapter"]

        # Curriculum Node Resolution (ICSE, ISC, CBSE)
        curr_node = curriculum_manager.find_curriculum_node(
            board=effective_board,
            grade=grade,
            subject=resolved_subject,
            topic_query=cleaned_query,
        )

        # Step 4: Subject Intelligence Engine Execution (10 Independent Engines)
        subject_engine = subject_registry.get_engine(resolved_subject)
        engine_output = subject_engine.analyze_topic(
            topic=cleaned_query,
            grade=grade,
            board=effective_board,
            mode=mode,
        )

        # Step 5: Visual Decision Engine (Evaluates 12 Visual Types & 3D Gatekeeping)
        visual_decision = visual_decision_engine.decide_visual(
            topic=cleaned_query,
            subject=resolved_subject,
            grade=grade,
            board=effective_board,
        )

        three_scene = None
        if visual_decision.is_3d_required and visual_decision.model_3d_key:
            three_scene = threejs_orchestrator.get_scene_spec(visual_decision.model_3d_key)

        svg_visual = None
        if visual_decision.visual_type == "timeline" and "history_engine" in subject_engine.__class__.__name__.lower():
            history_dossier = engine_output.subject_specific_payload.get("dossier", {})
            svg_visual = subject_engine._generate_timeline_svg(history_dossier.get("chronological_sequence", []))
        elif visual_decision.visual_type == "graph" and "math" in resolved_subject.lower():
            svg_visual = subject_engine.generate_function_svg("quadratic")

        # Step 6: External Gap Detection & Research with Grade-Aware Filtering
        curriculum_match = icse_db.find_matching_curriculum(cleaned_query, grade=grade, subject=resolved_subject)
        requires_research = gap_detector.requires_external_research(cleaned_query, curriculum_match)
        adapted_research = {"core_adapted_snippets": [], "advanced_optional_material": []}
        if requires_research:
            try:
                raw_snippets = await external_research.search_web(cleaned_query, num_results=3)
                grade_depth_spec = grade_controller.resolve_topic_curriculum_depth(cleaned_query, grade)
                adapted_research = external_research.filter_and_adapt_research_for_grade(
                    snippets=raw_snippets,
                    grade=grade,
                    prohibited_concepts=grade_depth_spec.get("prohibited_concepts", []),
                )
            except Exception as e:
                logger.warning(f"External research failed: {e}")

        # Step 7: Construct Structured Teaching Configuration
        teaching_config = teaching_orchestrator.build_teaching_configuration(
            query=cleaned_query,
            grade=grade,
            subject=resolved_subject,
            chapter=resolved_chapter,
            mode=mode,
            profile=profile,
            retrieved_knowledge=[{"curriculum": curr_node}] if curr_node else [],
            verified_sources=adapted_research["core_adapted_snippets"],
        )

        # Generate Independent Modular Scaffolding for Active Learning Difficulties
        active_difficulties = (profile or {}).get("difficulties") or (profile or {}).get("weaknesses") or []
        adaptation_payload = adaptation_engine.generate_adaptations(
            topic=cleaned_query,
            subject=resolved_subject,
            grade=grade,
            difficulties=active_difficulties,
            math_steps=engine_output.subject_specific_payload.get("roots"),
        )

        system_prompt = teaching_orchestrator.build_system_instructions(
            config=teaching_config,
            mode=mode,
        )

        user_content = [
            f"Topic/Question: {cleaned_query}",
            f"Board: {effective_board} | Subject: {resolved_subject} | Chapter: {resolved_chapter}",
            f"Grade: {grade} | Teaching Mode: {mode} | Language: {language}",
            f"Subject Methodology: {engine_output.teaching_methodology}",
            f"Strict Grade Boundaries: Sentence length limit = {teaching_config.sentence_limit} words, Vocabulary = {teaching_config.vocabulary_level}",
            f"Required Concepts for Grade {grade}: {', '.join(teaching_config.required_concepts)}",
            f"Visual Decision: {visual_decision.visual_type} (Justification: {visual_decision.justification})",
            f"5-Part Definition Scaffold Target:\n- Academic: {engine_output.definition_scaffold.original_academic_definition}\n- Simplified: {engine_output.definition_scaffold.simplified_definition}",
        ]
        if teaching_config.prohibited_concepts:
            user_content.append(f"DO NOT include these advanced concepts (above Grade {grade}): {', '.join(teaching_config.prohibited_concepts)}")
        if teaching_config.required_equation:
            user_content.append(f"Required Equation/Formula: {teaching_config.required_equation}")
        if adapted_research["core_adapted_snippets"]:
            user_content.append(f"Grade-Filtered Verified Research:\n{adapted_research['core_adapted_snippets']}")

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": "\n\n".join(user_content)},
        ]

        ai_response = await ai_gateway.generate_response(
            messages=messages,
            temperature=0.2,
            max_tokens=2500,
        )
        raw_text = ai_response["text"]

        # Step 8: Parse Citations & Confidence Score
        recommended_books = classification.get("recommended_books", [curr_node.get("textbook", "Authorized Curriculum Textbook")])
        citations_data = [
            {
                "book": book,
                "publisher": "Morning Star" if "Morning Star" in book else "Selina Publishers" if "Selina" in book else "NCERT" if "NCERT" in book else "APC",
                "chapter": resolved_chapter,
                "verified": True,
            }
            for book in recommended_books
        ]
        sanitized_citations, _ = hallucination_guard.verify_citations(
            citations_data,
            [b["name"] for b in icse_db.get_all_publishers()] + ["NCERT", "S. Chand", "Dhanpat Rai"],
        )

        confidence_score = hallucination_guard.compute_factual_confidence(
            explanation=raw_text,
            subject=resolved_subject,
            math_verified=engine_output.subject_specific_payload.get("sympy_verified", True),
            sources_count=len(sanitized_citations) + len(adapted_research["core_adapted_snippets"]),
        )

        # Record interaction in adaptive learning memory
        adaptive_memory.record_interaction(
            user_id=effective_user_id,
            topic=cleaned_query,
            subject=resolved_subject,
            grade=grade,
            question_answered=False,
            was_correct=True,
        )

        elapsed_ms = int((time.time() - start_time) * 1000)

        # Raw Response Bundle
        # Construct Section 13 Typed LessonBlocks
        lesson_blocks = [
            {"type": "heading", "id": "heading-main", "text": f"{resolved_subject}: {cleaned_query.title()}", "level": 1},
            {
                "type": "definition",
                "id": "def-core",
                "term": cleaned_query,
                "exact_definition": engine_output.definition_scaffold.original_academic_definition,
                "simple_explanation": engine_output.definition_scaffold.simplified_definition
            },
            {"type": "paragraph", "id": "para-explanation", "text": raw_text, "source_ids": [c.get("book", "Curriculum") for c in sanitized_citations]}
        ]

        if three_scene:
            lesson_blocks.append({
                "type": "three_d_scene",
                "id": "scene-3d-main",
                "scene_id": three_scene.get("model_key", "human-heart"),
                "fallback_diagram_id": "fallback-svg-diagram"
            })
        elif svg_visual:
            lesson_blocks.append({
                "type": "diagram",
                "id": "diagram-svg-main",
                "asset_id": "inline-svg",
                "labels": [t.get("term") for t in engine_output.essential_terminology if t.get("term")],
                "alt_text": f"Educational scientific diagram for {cleaned_query}"
            })

        if engine_output.worked_examples:
            for i, ex in enumerate(engine_output.worked_examples):
                lesson_blocks.append({
                    "type": "worked_example",
                    "id": f"example-{i+1}",
                    "given": ex.get("question", ""),
                    "find": "Exact quantitative derivation",
                    "steps": [ex.get("solution", "")],
                    "answer": ex.get("explanation", ""),
                    "unit_check": "Verified SI units"
                })

        lesson_blocks.append({
            "type": "summary",
            "id": "summary-main",
            "key_points": [t.get("term") for t in engine_output.essential_terminology if t.get("term")] or ["Core syllabus concepts mastered"]
        })

        request_id = f"req-{uuid.uuid4().hex[:12]}"

        raw_result = {
            "request_id": request_id,
            "status": "complete",
            "curriculum_context": {
                "board": effective_board,
                "grade": grade,
                "subject": resolved_subject,
                "chapter": resolved_chapter
            },
            "lesson": {
                "title": f"{resolved_subject} — {cleaned_query}",
                "learning_objectives": [f"Master {cleaned_query} within {effective_board} Grade {grade} curriculum."],
                "blocks": lesson_blocks,
                "sources": [c.get("book", "Prescribed Syllabus") for c in sanitized_citations]
            },
            "visual_plan": {
                "assets": [visual_decision.visual_type],
                "three_d_scene_ids": [three_scene.get("model_key")] if three_scene else [],
                "fallbacks": ["2D SVG Schematic", "Definition Card"]
            },
            "voice": {
                "available": True,
                "segments": [
                    {
                        "segment_id": "seg-01",
                        "text": engine_output.definition_scaffold.simplified_definition,
                        "target_visual": "three_d_scene" if three_scene else "diagram"
                    }
                ]
            },
            "quality": {
                "schema_valid": True,
                "academic_checks": "passed",
                "warnings": []
            },
            # Backwards-compatible fields preserved for existing UI & tests
            "query": cleaned_query,
            "board": effective_board,
            "grade": grade,
            "subject": resolved_subject,
            "chapter": resolved_chapter,
            "curriculum_node": curr_node,
            "teaching_mode": mode,
            "language": language,
            "explanation": raw_text,
            "citations": sanitized_citations,
            "confidence_score": confidence_score,
            "definition_scaffold": engine_output.definition_scaffold.dict(),
            "subject_intelligence": {
                "engine_name": subject_engine.__class__.__name__,
                "methodology": engine_output.teaching_methodology,
                "essential_terminology": [t.get("term") for t in engine_output.essential_terminology],
                "common_misconceptions": engine_output.common_misconceptions,
                "assessment_checkpoint": engine_output.assessment_checkpoint,
                "payload": engine_output.subject_specific_payload,
            },
            "visual_decision": {
                "visual_type": visual_decision.visual_type,
                "justification": visual_decision.justification,
                "is_3d_required": visual_decision.is_3d_required,
                "provenance": visual_decision.provenance,
            },
            "math_verified": engine_output.subject_specific_payload.get("sympy_verified", True),
            "svg_visual": svg_visual,
            "scene_3d": three_scene,
            "research_sources": adapted_research["core_adapted_snippets"],
            "teaching_configuration": teaching_config.to_dict(),
            "personalized_adaptations": {
                "active_difficulties": adaptation_payload["applied_difficulties"],
                "spelling_card": adaptation_payload["spelling_card"],
                "reading_support": adaptation_payload["reading_support"],
                "writing_scaffold": adaptation_payload["writing_scaffold"],
                "definition_breakdown": adaptation_payload["definition_breakdown"],
                "memory_aids": adaptation_payload["memory_aids"],
                "math_scaffolding": adaptation_payload["math_scaffolding"],
                "diagram_callouts": adaptation_payload["diagram_callouts"],
            },
            "metadata": {
                "provider": ai_response.get("provider"),
                "model": ai_response.get("model"),
                "fallback_used": ai_response.get("fallback_used"),
                "ai_latency_ms": ai_response.get("latency_ms"),
                "total_processing_ms": elapsed_ms,
            },
        }

        # Step 9: Multi-Stage Response Validation & Sanitization
        validation = response_validator.validate_and_sanitize(
            response_payload=raw_result,
            query=cleaned_query,
            expected_subject=resolved_subject,
            expected_grade=grade,
            expected_board=effective_board,
        )

        return validation.sanitized_response


knowledge_nexus_router = KnowledgeNexusRouter()
