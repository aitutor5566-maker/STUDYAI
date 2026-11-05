import json
import logging
from typing import Any, Dict, List, Optional
from backend.app.studyai_knowledge_nexus.core.grade_controller import grade_controller
from backend.app.studyai_knowledge_nexus.core.adaptation_engine import adaptation_engine
from backend.app.studyai_knowledge_nexus.core.question_type_classifier import question_type_classifier

logger = logging.getLogger("knowledge_nexus.teaching_orchestrator")


class TeachingConfiguration:
    """
    Structured Teaching Configuration passed before AI generation.
    Enforces grade boundaries, subject pedagogical rules, 23 question type scaffolds,
    learning mode directives (Normal vs Exam Prep), and anti-hallucination guardrails.
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
        question_type_scaffold: str,
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
        self.question_type_scaffold = question_type_scaffold
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
            "question_type_scaffold": self.question_type_scaffold,
            "retrieved_knowledge_count": len(self.retrieved_knowledge),
            "verified_sources_count": len(self.verified_sources),
        }


class TeachingOrchestrator:
    """
    Universal Pedagogical Orchestrator.
    Synthesizes subject-specific teaching rules across all 10 academic disciplines,
    embeds precise question-type scaffolds across all 23 question types,
    and tailors delivery between Normal Learning Mode and Exam Preparation Mode.
    """

    # Subject-specific teaching rules
    SUBJECT_TEACHING_RULES: Dict[str, str] = {
        "mathematics": (
            "MATHEMATICS PEDAGOGICAL RULES:\n"
            "- Step-by-Step Proofs: Format proofs with Given, To Prove, Construction (if needed), and a two-column Statements & Reasons proof.\n"
            "- Geometrical Constructions: Provide explicit sequential steps using compass and straightedge, specifying exact radii, arcs, and centers, followed by mathematical justification.\n"
            "- Calculations: Show full arithmetic working without skipping steps; state every formula before substitution; verify roots and sanity checks.\n"
            "- Notation: Use standard mathematical notation; never state an unsubstantiated answer."
        ),
        "physics": (
            "PHYSICS PEDAGOGICAL RULES:\n"
            "- 6-Step Numerical Protocol: Every numerical problem MUST follow:\n"
            "  1. Given Data (quantities with symbols and SI units)\n"
            "  2. Required To Find (exact parameter requested)\n"
            "  3. Governing Formula / Principle\n"
            "  4. Step-by-Step Substitution\n"
            "  5. Calculation Working\n"
            "  6. Final Statement with standard SI Units and Sanity Check\n"
            "- Conceptual Clarity: Differentiate cause and effect; reference ray directions with arrows for optics; enforce conservation laws."
        ),
        "chemistry": (
            "CHEMISTRY PEDAGOGICAL RULES:\n"
            "- Balanced Equations: Every chemical equation must be fully balanced with state symbols: (s), (l), (g), (aq).\n"
            "- Reaction Conditions: Explicitly state catalyst, temperature, and pressure over the reaction arrow.\n"
            "- Physical Observations: State observable phenomena (color change, precipitate formation, gas evolution with odor/color/test).\n"
            "- 3D Models: 3D is strictly reserved for spatial stereochemistry or molecular geometry (e.g. water, methane)."
        ),
        "biology": (
            "BIOLOGY PEDAGOGICAL RULES:\n"
            "- Anatomical Precision: Use exact anatomical terminology (e.g., right/left atria, ventricles, bicuspid/tricuspid valves, pulmonary artery/vein).\n"
            "- Double Circulation: Distinguish pulmonary circulation (heart -> lungs -> heart) from systemic circulation (heart -> body -> heart).\n"
            "- Structure-Function Correlation: Always explain WHY a structure is shaped or located as it is.\n"
            "- Address Common Misconceptions: Clarify frequent student errors (e.g., all arteries carry oxygenated blood except the pulmonary artery)."
        ),
        "history": (
            "HISTORY PEDAGOGICAL RULES:\n"
            "- Chronological Rigor: Present events in strict chronological order with key dates and landmark treaties/acts.\n"
            "- Multi-Causal Analysis: Categorize causes into Political, Economic, Social/Religious, Military, and Immediate.\n"
            "- Balanced Historiography: Present multiple historical viewpoints; maintain objectivity without modern bias.\n"
            "- Anti-3D Rule: 3D models are STRICTLY FORBIDDEN in History; rely on chronological timelines and archival source excerpts."
        ),
        "geography": (
            "GEOGRAPHY PEDAGOGICAL RULES:\n"
            "- Spatial Distribution: Identify precise regions, river basins, mountain ranges, and soil belts.\n"
            "- Climatic Causal Chains: Explain meteorological mechanisms step-by-step (e.g., low-pressure trough, Coriolis effect, rain shadow).\n"
            "- Map-Based Scaffolding: Provide coordinate landmarks, four-figure/six-figure grid guidance, and standard cartographic conventions.\n"
            "- Anti-3D Rule: 3D models are strictly forbidden; utilize 2D topographical diagrams, contour profiles, and thematic maps."
        ),
        "civics": (
            "CIVICS & POLITICAL SCIENCE PEDAGOGICAL RULES:\n"
            "- Constitutional Authority: Cite relevant articles, schedules, and constitutional amendments accurately.\n"
            "- Institutional Procedures: Detail legislative stages (First Reading, Committee, Money Bill procedure, Presidential Assent).\n"
            "- Separation of Powers: Clearly demarcate powers between Executive, Legislature, and Judiciary (including writs and jurisdictions).\n"
            "- Anti-3D Rule: 3D models are strictly forbidden; use institutional flowcharts and comparative tables."
        ),
        "english language": (
            "ENGLISH LANGUAGE (ENGLISH I) PEDAGOGICAL RULES:\n"
            "- Grammar Rules: Provide the exact grammatical rule, followed by the formulaic transformation pattern.\n"
            "- Sentence Transformation: Show original sentence, transformation rule, step-by-step change, and final sentence.\n"
            "- Formats: Provide exact ICSE/CBSE board formats for Formal Letters, Notices, and E-mails with mark allocations.\n"
            "- Visuals: Do not force diagrams; focus on clean tables and formatted templates."
        ),
        "english literature": (
            "ENGLISH LITERATURE (ENGLISH II) PEDAGOGICAL RULES:\n"
            "- Contextual Precision: Situate excerpts accurately within Act/Scene or Stanza/Chapter without fabricating lines.\n"
            "- Literary Devices: Identify and explain dramatic techniques (soliloquy, dramatic irony, foil, personification, metaphor).\n"
            "- Character Analysis: Analyze motivations, moral dilemmas, and character evolution through textual evidence.\n"
            "- Anti-3D Rule: 3D models are strictly forbidden."
        ),
        "computer science": (
            "COMPUTER SCIENCE PEDAGOGICAL RULES:\n"
            "- OOP Principles: Explain concepts using standard Java/Python syntax with encapsulation, inheritance, and polymorphism.\n"
            "- Complete Working Code: Provide syntactically valid, well-commented code snippet meeting ICSE/BlueJ specifications.\n"
            "- Dry Run & Trace Table: Include a step-by-step variable trace table showing state transitions through loop iterations.\n"
            "- Complexity: Briefly indicate time and space complexity considerations."
        ),
    }

    def build_teaching_configuration(
        self,
        query: str,
        grade: int,
        subject: str,
        chapter: str,
        question_type: Optional[str] = None,
        mode: str = "normal",
        profile: Optional[Dict[str, Any]] = None,
        retrieved_knowledge: Optional[List[Dict[str, Any]]] = None,
        verified_sources: Optional[List[Dict[str, Any]]] = None,
    ) -> TeachingConfiguration:
        """
        Constructs the comprehensive teaching configuration enforcing
        Grade-level boundaries, subject rules, question-type scaffolding,
        and student-specific adaptations.
        """
        # Resolve Grade-Specific depth and curriculum boundaries
        grade_depth = grade_controller.resolve_topic_curriculum_depth(query, grade)
        profile_data = profile or {}

        # Resolve Question Type
        effective_qtype = question_type
        if not effective_qtype:
            q_res = question_type_classifier.classify(query)
            effective_qtype = q_res.primary_type
            q_scaffold = q_res.scaffold_instructions
        else:
            meta = question_type_classifier.QUESTION_TYPES.get(effective_qtype)
            if meta:
                q_scaffold = question_type_classifier._generate_scaffold_instructions(effective_qtype, meta)
            else:
                q_scaffold = f"Structure the answer clearly for '{effective_qtype}'."

        # Extract declared difficulties
        declared_difficulties = profile_data.get("difficulties") or profile_data.get("weaknesses") or []

        # Determine visual type
        clean_sub = subject.lower()
        if "history" in clean_sub or "civic" in clean_sub or "english" in clean_sub or "geography" in clean_sub:
            req_visual = "none_or_2d_diagram"
        elif grade >= 8 and any(k in query.lower() for k in ["heart", "circulation", "molecule", "orbital", "prism", "lens"]):
            req_visual = "interactive_diagram_or_3d"
        else:
            req_visual = "labeled_2d_diagram"

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
            question_type=effective_qtype,
            question_type_scaffold=q_scaffold,
            retrieved_knowledge=retrieved_knowledge or [],
            verified_sources=verified_sources or [],
        )

    def build_system_instructions(
        self,
        config: TeachingConfiguration,
        mode: str = "normal",
    ) -> str:
        clean_subject = config.subject.lower()
        subject_rules = self.SUBJECT_TEACHING_RULES.get(clean_subject, "")
        if not subject_rules:
            for s_key, rules in self.SUBJECT_TEACHING_RULES.items():
                if s_key in clean_subject or clean_subject in s_key:
                    subject_rules = rules
                    break

        if mode == "exam_prep":
            mode_instruction = (
                "EXAM PREPARATION MODE ACTIVATED:\n"
                "- Focus strictly on high-yield CISCE/CBSE board exam questions and mark distributions ([1 mark], [2 marks], [3 marks], [5 marks]).\n"
                "- Explicitly highlight and underline mandatory KEYWORDS that examiners search for to award marks.\n"
                "- Detail common examiner traps and specific pitfalls where students lose marks.\n"
                "- Provide a concise Revision Flashpoint table at the end summarizing high-frequency exam points."
            )
        else:
            mode_instruction = (
                "NORMAL LEARNING MODE ACTIVATED:\n"
                "- Focus on deep foundational conceptual clarity, step-by-step intuitive explanations, and real-world analogies.\n"
                "- Guide the student systematically through underlying mechanisms and first principles.\n"
                "- Build curiosity and solid understanding before transitioning to formal examination terminology."
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

        return f"""You are STUDYAI Universal AI Teacher, an elite, subject-aware educational intelligence engine.
Curriculum Target: {config.board}, Grade {config.grade}, Subject: {config.subject}.
Chapter: {config.chapter} | Topic: {config.topic}

TEACHING MODE DIRECTIVE:
{mode_instruction}

STRICT GRADE-{config.grade} CONTENT DEPTH RULES:
- Vocabulary Difficulty: {config.vocabulary_level}.
- Sentence Complexity: Maximum {config.sentence_limit} words per sentence.
- Required Concepts to Teach: {req_concepts_str}.
- PROHIBITED CONCEPTS (DO NOT INCLUDE - Too advanced for Grade {config.grade}): {proh_concepts_str}.
- {equation_str}
- Never introduce college-level or out-of-syllabus jargon to younger students.

SUBJECT-SPECIFIC TEACHING RULES ({config.subject}):
{subject_rules}

QUESTION-TYPE SPECIFIC SCAFFOLD:
{config.question_type_scaffold}

PERSONALIZED LEARNING ADAPTATIONS:
{adaptation_directives}

STANDARD 8-PART PEDAGOGICAL CONTRACT:
Part 1: Conceptual Core (Exact academic definition and plain-English translation).
Part 2: Grade Scaffolding (Vocabulary breakdown and key terms explained simply).
Part 3: Visual/Diagram Anchor (Description of diagram, anatomy, or chart matching Grade {config.grade}).
Part 4: Curriculum Citations (Specific ICSE textbook references e.g., Selina / Morning Star / APC / NCERT).
Part 5: Step-by-Step Solved Example / Derivation / Procedure (Aligned strictly to the question type scaffold).
Part 6: Examiner Traps & Common Pitfalls (Common mistakes students make and how to avoid them).
Part 7: Quick Checkpoint Questions (1 Easy recall, 1 Medium conceptual, 1 Board-style application question).
Part 8: Reinforcement Mini-Activity (Quick recall hook or mental model challenge).

ANTI-HALLUCINATION GUARDRAILS:
- Never fabricate citations, book titles, page numbers, or URLs.
- Stick strictly to verified textbook publishers (Selina Publishers, Morning Star, APC, Goyal Brothers, Evergreen, NCERT).
- Never invent chemical formulas, historical dates, or mathematical equations.
"""


teaching_orchestrator = TeachingOrchestrator()
