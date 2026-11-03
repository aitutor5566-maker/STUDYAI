import json
import logging
from typing import Any, Dict, List, Optional
from backend.app.studyai_knowledge_nexus.core.grade_controller import grade_controller
from backend.app.studyai_knowledge_nexus.core.adaptation_engine import adaptation_engine

logger = logging.getLogger("knowledge_nexus.teaching_orchestrator")


class TeachingConfiguration:
    """
    Structured Teaching Configuration passed before AI generation.
    Enforces grade boundaries, required and prohibited concepts,
    active pedagogical adaptations, and visual formats.
    """

    def __init__(
        self,
        grade: int,
        board: str,
        subject: str,
        chapter: str,
        topic: str,
        learning_objectives: List[str],
        explanation_depth: str,
        vocabulary_level: str,
        sentence_limit: int,
        learning_preferences: List[str],
        active_adaptations: List[str],
        required_concepts: List[str],
        prohibited_concepts: List[str],
        required_equation: str,
        required_visual_type: str,
        question_type: str,
        retrieved_knowledge: List[Dict[str, Any]],
        verified_sources: List[Dict[str, Any]],
    ):
        self.grade = grade
        self.board = board
        self.subject = subject
        self.chapter = chapter
        self.topic = topic
        self.learning_objectives = learning_objectives
        self.explanation_depth = explanation_depth
        self.vocabulary_level = vocabulary_level
        self.sentence_limit = sentence_limit
        self.learning_preferences = learning_preferences
        self.active_adaptations = active_adaptations
        self.required_concepts = required_concepts
        self.prohibited_concepts = prohibited_concepts
        self.required_equation = required_equation
        self.required_visual_type = required_visual_type
        self.question_type = question_type
        self.retrieved_knowledge = retrieved_knowledge
        self.verified_sources = verified_sources

    def to_dict(self) -> Dict[str, Any]:
        return {
            "grade": self.grade,
            "board": self.board,
            "subject": self.subject,
            "chapter": self.chapter,
            "topic": self.topic,
            "learning_objectives": self.learning_objectives,
            "explanation_depth": self.explanation_depth,
            "vocabulary_level": self.vocabulary_level,
            "sentence_limit": self.sentence_limit,
            "learning_preferences": self.learning_preferences,
            "active_adaptations": self.active_adaptations,
            "required_concepts": self.required_concepts,
            "prohibited_concepts": self.prohibited_concepts,
            "required_equation": self.required_equation,
            "required_visual_type": self.required_visual_type,
            "question_type": self.question_type,
            "retrieved_knowledge_count": len(self.retrieved_knowledge),
            "verified_sources_count": len(self.verified_sources),
        }


class TeachingOrchestrator:
    """
    Pedagogical orchestrator structuring the educational output into
    STUDYAI's standard 8-Part pedagogical contract with Grade-Aware
    and Student-Adaptive intelligence.
    """

    def build_teaching_configuration(
        self,
        query: str,
        grade: int,
        subject: str,
        chapter: str,
        mode: str = "normal",
        profile: Optional[Dict[str, Any]] = None,
        retrieved_knowledge: Optional[List[Dict[str, Any]]] = None,
        verified_sources: Optional[List[Dict[str, Any]]] = None,
    ) -> TeachingConfiguration:
        """
        Constructs the comprehensive teaching configuration enforcing
        Grade-level boundaries and personalized student adaptations.
        """
        # Resolve Grade-Specific depth and curriculum boundaries
        grade_depth = grade_controller.resolve_topic_curriculum_depth(query, grade)
        profile_data = profile or {}

        # Extract declared difficulties
        declared_difficulties = profile_data.get("difficulties") or profile_data.get("weaknesses") or []

        # Determine visual type
        req_visual = "interactive_diagram_or_3d" if grade >= 8 else "labeled_2d_diagram"

        return TeachingConfiguration(
            grade=grade,
            board="ICSE",
            subject=subject,
            chapter=chapter,
            topic=query,
            learning_objectives=grade_depth.get("required_concepts", []),
            explanation_depth=profile_data.get("explanation_style", "balanced"),
            vocabulary_level=grade_depth["vocabulary_level"],
            sentence_limit=grade_depth["max_sentence_length"],
            learning_preferences=profile_data.get("preferred_learning_methods", ["diagrams", "examples"]),
            active_adaptations=declared_difficulties,
            required_concepts=grade_depth.get("required_concepts", []),
            prohibited_concepts=grade_depth.get("prohibited_concepts", []),
            required_equation=grade_depth.get("equation", ""),
            required_visual_type=req_visual,
            question_type="3_tier_icse_questions",
            retrieved_knowledge=retrieved_knowledge or [],
            verified_sources=verified_sources or [],
        )

    def build_system_instructions(
        self,
        config: TeachingConfiguration,
        mode: str = "normal",
    ) -> str:
        mode_instruction = (
            "EXAM PREPARATION MODE: Focus strictly on high-yield ICSE board questions, standard marking schemes, "
            "precise keywords that fetch marks, common examiner traps, and quick revision formulas."
            if mode == "exam_prep"
            else "NORMAL LEARNING MODE: Focus on foundational conceptual clarity, step-by-step intuitive explanations, "
                 "real-world analogies, and interactive visual reinforcement."
        )

        # Grade-level constraints
        req_concepts_str = ", ".join(config.required_concepts) if config.required_concepts else "Standard curriculum objectives"
        proh_concepts_str = ", ".join(config.prohibited_concepts) if config.prohibited_concepts else "None"
        equation_str = f"Required Formula / Equation: {config.required_equation}" if config.required_equation else "Formulas: Grade-appropriate simple expressions only."

        # Generate adaptation directives for student difficulties
        adaptation_specs = adaptation_engine.generate_adaptations(
            topic=config.topic,
            subject=config.subject,
            grade=config.grade,
            difficulties=config.active_adaptations,
        )
        adaptation_directives = "\n".join(adaptation_specs["system_instruction_additions"])
        if not adaptation_directives:
            adaptation_directives = "- Maintain clear, balanced sentences preserving exact academic meaning."

        return f"""You are STUDYAI Knowledge Nexus, the Universal Educational Intelligence & ICSE Teaching System.
Curriculum Target: ICSE (Council for the Indian School Certificate Examinations), Grade {config.grade}, Subject: {config.subject}.
Teaching Mode: {mode_instruction}

STRICT GRADE-{config.grade} CONTENT DEPTH RULES:
- Vocabulary Difficulty: {config.vocabulary_level}.
- Sentence Complexity: Maximum {config.sentence_limit} words per sentence.
- Required Concepts to Teach: {req_concepts_str}.
- PROHIBITED CONCEPTS (DO NOT INCLUDE - Too advanced for Grade {config.grade}): {proh_concepts_str}.
- {equation_str}
- Never omit essential syllabus requirements for older students.
- Never introduce college-level or higher-grade biochemical/mathematical jargon to younger students.

PERSONALIZED LEARNING ADAPTATIONS FOR THIS STUDENT:
{adaptation_directives}

STANDARD 8-PART RESPONSE FORMAT:
Part 1: Conceptual Core (Exact definition adapted to Grade {config.grade}).
Part 2: Grade Scaffolding (Vocabulary breakdown and key terms explained simply).
Part 3: Visual/Diagram Anchor (Description of diagram, anatomy, or chart matching Grade {config.grade}).
Part 4: Curriculum Citations (Specific ICSE textbook reference e.g., Selina / Morning Star / APC).
Part 5: Step-by-Step Solved Example / Derivation (With complete working suitable for Grade {config.grade}).
Part 6: Examiner Traps & Common Pitfalls (Common mistakes students make).
Part 7: Quick Checkpoint Questions (1 Easy, 1 Medium, 1 Grade-appropriate Question).
Part 8: Reinforcement Mini-Activity (Quick recall hook or game challenge).

ANTI-HALLUCINATION GUARDRAILS:
- Never fabricate citations, book titles, page numbers, or URLs.
- Stick strictly to verified ICSE textbook publishers (Selina Publishers, Morning Star, APC, Goyal Brothers, Evergreen).
"""


teaching_orchestrator = TeachingOrchestrator()
