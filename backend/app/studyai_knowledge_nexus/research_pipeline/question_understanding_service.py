import logging
import re
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from backend.app.studyai_knowledge_nexus.core.subject_classifier import subject_classifier
from backend.app.studyai_knowledge_nexus.visualization.visual_decision_engine import visual_decision_engine

logger = logging.getLogger("research_pipeline.question_understanding")


class QuestionUnderstandingResult(BaseModel):
    original_question: str
    subject: str
    topic: str
    subtopic: str
    grade: int
    curriculum: str
    question_type: str
    learning_objective: str
    required_explanation_depth: str
    research_requirement: bool
    required_visual_types: List[str]
    required_3d_model: Optional[str] = None
    language_preference: str = "English"


class QuestionUnderstandingService:
    """
    Analyzes student educational queries to understand subject, topic,
    epistemological category, grade constraints, and research necessity.
    """

    def analyze_question(
        self,
        question: str,
        grade: int = 10,
        curriculum: str = "ICSE",
        preferred_subject: Optional[str] = None,
        language: str = "English",
        cached_record_exists: bool = False,
    ) -> QuestionUnderstandingResult:
        clean_q = question.strip()
        lower_q = clean_q.lower()

        # Step 1: Classify Subject, Topic, and Matched Curriculum Node
        classification = subject_classifier.classify(
            query=clean_q,
            user_grade=grade,
            preferred_subject=preferred_subject,
        )
        resolved_subject = classification["subject"]
        matched_chapter = classification["matched_chapter"]

        # Step 2: Extract Topic and Subtopic
        topic = matched_chapter if matched_chapter != "General Science" else clean_q
        subtopic = self._infer_subtopic(clean_q, resolved_subject)

        # Step 3: Determine Question Type
        q_type = self._determine_question_type(clean_q, resolved_subject)

        # Step 4: Determine Required Explanation Depth
        if grade <= 5:
            depth = "foundational"
        elif grade <= 8:
            depth = "intermediate"
        else:
            depth = "advanced_rigorous"

        # Step 5: Research Necessity Check
        # For fundamental stable topics (e.g. Heart chambers, Newton's laws, Pythagoras),
        # if verified knowledge is already cached, external web research is NOT required.
        research_required = False
        if not cached_record_exists:
            # Check if query needs external research
            is_contemporary = any(w in lower_q for w in ["current", "recent", "nobel", "2024", "2025", "2026", "news", "latest"])
            is_specific_deep = any(w in lower_q for w in ["why", "how", "explain", "derive", "difference between", "mechanism"])
            research_required = is_contemporary or is_specific_deep

        # Step 6: Visual & 3D Requirements Analysis
        visual_decision = visual_decision_engine.decide_visual(
            topic=clean_q,
            subject=resolved_subject,
            grade=grade,
            board=curriculum,
        )
        required_visuals = [visual_decision.visual_type]
        required_3d = visual_decision.model_3d_key if visual_decision.is_3d_required else None

        # Step 7: Formulate Learning Objective
        learning_objective = (
            f"Master the core principles, terminology, and mechanisms of {topic} "
            f"({subtopic}) according to {curriculum} Grade {grade} {resolved_subject} benchmarks."
        )

        return QuestionUnderstandingResult(
            original_question=clean_q,
            subject=resolved_subject,
            topic=topic,
            subtopic=subtopic,
            grade=grade,
            curriculum=curriculum.upper(),
            question_type=q_type,
            learning_objective=learning_objective,
            required_explanation_depth=depth,
            research_requirement=research_required,
            required_visual_types=required_visuals,
            required_3d_model=required_3d,
            language_preference=language,
        )

    def _infer_subtopic(self, query: str, subject: str) -> str:
        q_lower = query.lower()
        if "chamber" in q_lower or "heart" in q_lower or "circulation" in q_lower:
            return "Human Heart & Double Circulation"
        if "moment" in q_lower or "lever" in q_lower:
            return "Turning Effect of Force & Equilibrium"
        if "water" in q_lower or "covalent" in q_lower:
            return "Molecular Geometry & Covalent Bonding"
        if "cone" in q_lower or "volume" in q_lower:
            return "Right Circular Cone Volume & Mensuration"
        if "war" in q_lower or "sarajevo" in q_lower:
            return "First World War Long-term & Immediate Causes"
        if "volcano" in q_lower or "magma" in q_lower:
            return "Volcanic Landforms & Magma Extrusion"
        if "photosynthesis" in q_lower:
            return "Light & Dark Reactions of Photosynthesis"
        if "quadratic" in q_lower:
            return "Quadratic Equation Roots & Factorization"
        return "Fundamental Curricular Principles"

    def _determine_question_type(self, query: str, subject: str) -> str:
        q_lower = query.lower()
        if any(w in q_lower for w in ["calculate", "solve", "find", "evaluate", "numerical"]):
            return "numerical_problem"
        if any(w in q_lower for w in ["define", "definition", "what is"]):
            return "definition_request"
        if any(w in q_lower for w in ["how does", "mechanism", "pump", "flow", "work", "process"]):
            return "process_mechanism"
        if any(w in q_lower for w in ["differentiate", "compare", "distinguish", "vs", "difference"]):
            return "comparative_analysis"
        if subject.lower() in ["history", "civics"]:
            return "historical_event"
        if "english" in subject.lower():
            return "literary_analysis"
        return "concept_explanation"


question_understanding_service = QuestionUnderstandingService()
