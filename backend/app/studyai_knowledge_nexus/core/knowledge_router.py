import logging
import time
from typing import Any, Dict, List, Optional

from backend.app.studyai_knowledge_nexus.core.ai_gateway import ai_gateway
from backend.app.studyai_knowledge_nexus.core.hallucination_guard import hallucination_guard
from backend.app.studyai_knowledge_nexus.core.subject_classifier import subject_classifier
from backend.app.studyai_knowledge_nexus.core.teaching_orchestrator import teaching_orchestrator
from backend.app.studyai_knowledge_nexus.core.grade_controller import grade_controller
from backend.app.studyai_knowledge_nexus.core.adaptation_engine import adaptation_engine
from backend.app.studyai_knowledge_nexus.core.adaptive_memory import adaptive_memory
from backend.app.studyai_knowledge_nexus.curriculum.icse_database import icse_db
from backend.app.studyai_knowledge_nexus.subjects.mathematics_engine import math_engine
from backend.app.studyai_knowledge_nexus.subjects.history_engine import history_engine
from backend.app.studyai_knowledge_nexus.subjects.chemistry_engine import chemistry_engine
from backend.app.studyai_knowledge_nexus.subjects.biology_engine import biology_engine
from backend.app.studyai_knowledge_nexus.subjects.physics_engine import physics_engine
from backend.app.studyai_knowledge_nexus.vision.document_ingestion import doc_ingestion
from backend.app.studyai_knowledge_nexus.vision.vision_analyzer import vision_analyzer
from backend.app.studyai_knowledge_nexus.research.gap_detector import gap_detector
from backend.app.studyai_knowledge_nexus.research.external_research_engine import external_research
from backend.app.studyai_knowledge_nexus.visualization.threejs_orchestrator import threejs_orchestrator

logger = logging.getLogger("knowledge_nexus.router")


class KnowledgeNexusRouter:
    """
    Central Coordinator for STUDYAI Knowledge Nexus.
    Orchestrates Grade-Aware and Student-Adaptive teaching intelligence:
    - Never serves uniform explanation depth to different grades.
    - Tailors academic concept selection, vocabulary, and sentence structure strictly to student grade.
    - Combines independent pedagogical adapters for multiple simultaneous learning difficulties.
    - Filters external research to grade-appropriate benchmarks.
    - Tracks empirical student learning memory.
    """

    async def process_learning_query(
        self,
        query: str,
        grade: int = 10,
        subject: Optional[str] = None,
        mode: str = "normal",
        language: str = "English",
        profile: Optional[Dict[str, Any]] = None,
        file_payload: Optional[Dict[str, Any]] = None,
        user_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        start_time = time.time()
        effective_user_id = user_id or (profile or {}).get("user_id") or "anonymous_student"

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

        # Step 4: Subject-Specific Deep Engine Execution
        math_data = None
        history_dossier = None
        chem_data = None
        bio_data = None
        phys_data = None
        visual_3d_key = None
        svg_visual = None
        math_verified = True

        lower_subj = resolved_subject.lower()
        if "math" in lower_subj:
            if any(char in cleaned_query for char in ["=", "^", "²", "x", "+", "-", "*", "/"]):
                math_data = math_engine.solve_algebraic_expression(cleaned_query)
                math_verified = math_data.get("verified_by_sympy", False)
            svg_visual = math_engine.generate_function_svg("quadratic")
        elif "hist" in lower_subj or "civic" in lower_subj:
            history_dossier = history_engine.analyze_event(cleaned_query)
            svg_visual = history_dossier.get("timeline_svg")
        elif "chem" in lower_subj:
            chem_data = chemistry_engine.analyze_reaction(cleaned_query)
        elif "bio" in lower_subj:
            bio_data = biology_engine.analyze_concept(cleaned_query)
            visual_3d_key = bio_data.get("data", {}).get("recommended_3d_model")
        elif "phys" in lower_subj:
            phys_data = physics_engine.analyze_topic(cleaned_query)

        # Step 5: External Gap Detection & Research with Grade-Aware Filtering
        curriculum_match = icse_db.find_matching_curriculum(cleaned_query, grade=grade, subject=resolved_subject)
        requires_research = gap_detector.requires_external_research(cleaned_query, curriculum_match)
        raw_research_snippets = []
        adapted_research = {"core_adapted_snippets": [], "advanced_optional_material": []}
        if requires_research:
            try:
                raw_research_snippets = await external_research.search_web(cleaned_query, num_results=3)
                grade_depth_spec = grade_controller.resolve_topic_curriculum_depth(cleaned_query, grade)
                adapted_research = external_research.filter_and_adapt_research_for_grade(
                    snippets=raw_research_snippets,
                    grade=grade,
                    prohibited_concepts=grade_depth_spec.get("prohibited_concepts", []),
                )
            except Exception as e:
                logger.warning(f"External research failed: {e}")

        # Step 6: Construct Structured Teaching Configuration (Enforces Grade & Adaptations)
        teaching_config = teaching_orchestrator.build_teaching_configuration(
            query=cleaned_query,
            grade=grade,
            subject=resolved_subject,
            chapter=resolved_chapter,
            mode=mode,
            profile=profile,
            retrieved_knowledge=[{"curriculum": curriculum_match}] if curriculum_match else [],
            verified_sources=adapted_research["core_adapted_snippets"],
        )

        # Generate Independent Modular Scaffolding for Active Learning Difficulties
        active_difficulties = (profile or {}).get("difficulties") or (profile or {}).get("weaknesses") or []
        adaptation_payload = adaptation_engine.generate_adaptations(
            topic=cleaned_query,
            subject=resolved_subject,
            grade=grade,
            difficulties=active_difficulties,
            math_steps=math_data.get("steps") if math_data else None,
        )

        system_prompt = teaching_orchestrator.build_system_instructions(
            config=teaching_config,
            mode=mode,
        )

        user_content = [
            f"Topic/Question: {cleaned_query}",
            f"Subject: {resolved_subject} | Chapter: {resolved_chapter}",
            f"Grade: {grade} | Teaching Mode: {mode} | Language: {language}",
            f"Strict Grade Boundaries: Sentence length limit = {teaching_config.sentence_limit} words, Vocabulary = {teaching_config.vocabulary_level}",
            f"Required Concepts for Grade {grade}: {', '.join(teaching_config.required_concepts)}",
        ]
        if teaching_config.prohibited_concepts:
            user_content.append(f"DO NOT include these advanced concepts (above Grade {grade}): {', '.join(teaching_config.prohibited_concepts)}")
        if teaching_config.required_equation:
            user_content.append(f"Required Equation/Formula: {teaching_config.required_equation}")
        if math_data and math_data.get("success"):
            user_content.append(f"SymPy Verified Symbolic Computation Steps:\n{math_data.get('steps')}")
        if history_dossier and history_dossier.get("success"):
            user_content.append(f"Historical 16-Point Dossier Data:\n{history_dossier.get('dossier')}")
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

        # Step 7: Parse 8-Part Structure & Verify Hallucination Guardrails
        recommended_books = classification.get("recommended_books", ["Concise Series (Selina Publishers)"])
        citations_data = [
            {
                "book": book,
                "publisher": "Morning Star" if "Morning Star" in book else "Selina Publishers" if "Selina" in book else "APC",
                "chapter": resolved_chapter,
                "verified": True,
            }
            for book in recommended_books
        ]
        sanitized_citations, citation_conf = hallucination_guard.verify_citations(
            citations_data,
            [b["name"] for b in icse_db.get_all_publishers()],
        )

        confidence_score = hallucination_guard.compute_factual_confidence(
            explanation=raw_text,
            subject=resolved_subject,
            math_verified=math_verified,
            sources_count=len(sanitized_citations) + len(adapted_research["core_adapted_snippets"]),
        )

        # 3D Scene resolution
        three_scene = None
        if visual_3d_key:
            three_scene = threejs_orchestrator.get_scene_spec(visual_3d_key)

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

        return {
            "query": cleaned_query,
            "board": "ICSE",
            "grade": grade,
            "subject": resolved_subject,
            "chapter": resolved_chapter,
            "teaching_mode": mode,
            "language": language,
            "explanation": raw_text,
            "citations": sanitized_citations,
            "confidence_score": confidence_score,
            "math_verified": math_verified,
            "math_symbolic_data": math_data,
            "history_dossier": history_dossier.get("dossier") if history_dossier else None,
            "chemistry_reaction": chem_data.get("data") if chem_data else None,
            "biology_data": bio_data.get("data") if bio_data else None,
            "physics_data": phys_data.get("data") if phys_data else None,
            "svg_visual": svg_visual,
            "scene_3d": three_scene,
            "research_sources": adapted_research["core_adapted_snippets"],
            "advanced_optional_material": adapted_research["advanced_optional_material"],
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
                "grade_profile": {
                    "stage": grade_controller.get_grade_profile(grade).get("stage"),
                    "vocabulary_level": teaching_config.vocabulary_level,
                    "sentence_limit": teaching_config.sentence_limit,
                    "required_concepts_count": len(teaching_config.required_concepts),
                    "prohibited_concepts_count": len(teaching_config.prohibited_concepts),
                }
            },
        }


knowledge_nexus_router = KnowledgeNexusRouter()
