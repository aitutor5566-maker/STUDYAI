import re
import logging
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger("knowledge_nexus.question_type_classifier")


class QuestionTypeMetadata(BaseModel):
    type_id: str
    display_name: str
    description: str
    required_sections: List[str]
    suggested_visual: Optional[str] = None
    is_exam_high_yield: bool = False


class QuestionClassificationResult(BaseModel):
    primary_type: str
    confidence: float
    secondary_types: List[str] = Field(default_factory=list)
    is_follow_up: bool = False
    metadata: QuestionTypeMetadata
    scaffold_instructions: str


class QuestionTypeClassifier:
    """
    Dedicated Classifier covering the 23 specific educational question types
    mandated by STUDYAI Universal AI Teacher Intelligence Engine:
    1. Definition
    2. Explain
    3. Describe
    4. How and why
    5. Compare
    6. Differentiate
    7. Advantages and disadvantages
    8. Causes and effects
    9. Numerical problem
    10. Mathematical proof
    11. Mathematical derivation
    12. Geometrical construction
    13. Diagram explanation
    14. Process explanation
    15. Historical event
    16. Map-based question
    17. Formula explanation
    18. Identify and classify
    19. Short-answer question
    20. Long-answer question
    21. Exam-style question
    22. Application-based question
    23. Follow-up question
    """

    QUESTION_TYPES: Dict[str, QuestionTypeMetadata] = {
        "definition": QuestionTypeMetadata(
            type_id="definition",
            display_name="Definition",
            description="Formal academic definition with literal meaning and key defining terms.",
            required_sections=["Exact Academic Definition", "Simplified Translation", "Key Characteristics / Keywords", "Curricular Example"],
            suggested_visual="concept_card",
            is_exam_high_yield=True,
        ),
        "explain": QuestionTypeMetadata(
            type_id="explain",
            display_name="Explain",
            description="In-depth conceptual explanation establishing underlying mechanisms and reasons.",
            required_sections=["Core Concept", "Working Mechanism / Principle", "Real-World Demonstration", "Common Examiner Pitfalls"],
            suggested_visual="labeled_diagram",
            is_exam_high_yield=True,
        ),
        "describe": QuestionTypeMetadata(
            type_id="describe",
            display_name="Describe",
            description="Detailed portrayal of structural features, appearances, or sequences.",
            required_sections=["Structural Overview", "Detailed Physical / Functional Characteristics", "Labeled Component Breakdown"],
            suggested_visual="labeled_diagram",
            is_exam_high_yield=False,
        ),
        "how_and_why": QuestionTypeMetadata(
            type_id="how_and_why",
            display_name="How and Why",
            description="Dual explanation exploring the exact operational mechanism (How) and causal necessity (Why).",
            required_sections=["The 'How' (Mechanism & Sequential Operation)", "The 'Why' (Underlying Scientific / Logical Reason)", "Summary Takeaway"],
            suggested_visual="flowchart",
            is_exam_high_yield=True,
        ),
        "compare": QuestionTypeMetadata(
            type_id="compare",
            display_name="Compare",
            description="Evaluation of both similarities and differences between two or more concepts.",
            required_sections=["Entities Under Comparison", "Common Similarities", "Key Differences", "Synthesis Summary"],
            suggested_visual="comparison_table",
            is_exam_high_yield=False,
        ),
        "differentiate": QuestionTypeMetadata(
            type_id="differentiate",
            display_name="Differentiate",
            description="Rigorous tabular contrast highlighting distinct distinguishing criteria with strict parallelism.",
            required_sections=["Basis of Distinction (Parameters)", "Tabular Comparison (Entity A vs Entity B)", "Key Distinguishing Diagnostic Rule"],
            suggested_visual="comparison_table",
            is_exam_high_yield=True,
        ),
        "advantages_disadvantages": QuestionTypeMetadata(
            type_id="advantages_disadvantages",
            display_name="Advantages and Disadvantages",
            description="Balanced evaluation of benefits/strengths versus limitations/drawbacks.",
            required_sections=["Concept Overview", "Key Advantages / Merits (Bullet points)", "Key Disadvantages / Demerits (Bullet points)", "Evaluative Conclusion"],
            suggested_visual="pros_cons_table",
            is_exam_high_yield=True,
        ),
        "causes_effects": QuestionTypeMetadata(
            type_id="causes_effects",
            display_name="Causes and Effects",
            description="Analysis of antecedent triggers, catalysts, and subsequent consequences.",
            required_sections=["Root Causes (Direct & Underlying Catalysts)", "Propagation / Escalation", "Short-Term & Long-Term Effects", "Historical/Scientific Impact"],
            suggested_visual="causal_chain_flowchart",
            is_exam_high_yield=True,
        ),
        "numerical_problem": QuestionTypeMetadata(
            type_id="numerical_problem",
            display_name="Numerical Problem",
            description="Rigorous 6-step computational problem-solving with SI units and checks.",
            required_sections=["Step 1: Given Data with Units", "Step 2: Required To Find", "Step 3: Relevant Formula / Principle", "Step 4: Step-by-Step Substitution", "Step 5: Calculation & Working", "Step 6: Final Answer with Standard SI Units & Sanity Check"],
            suggested_visual="formula_card",
            is_exam_high_yield=True,
        ),
        "mathematical_proof": QuestionTypeMetadata(
            type_id="mathematical_proof",
            display_name="Mathematical Proof",
            description="Deductive formal proof establishing mathematical certainty from axioms/theorems.",
            required_sections=["Given / Hypothesis", "To Prove", "Construction (if required)", "Proof Statements & Reasons (Two-Column Table)", "Conclusion (Q.E.D.)"],
            suggested_visual="geometric_diagram",
            is_exam_high_yield=True,
        ),
        "mathematical_derivation": QuestionTypeMetadata(
            type_id="mathematical_derivation",
            display_name="Mathematical Derivation",
            description="Systematic algebraic/calculus transformation from base principles to final formula.",
            required_sections=["Initial Assumptions & Physical Setup", "Base Governing Equation", "Step-by-Step Algebraic Manipulation", "Final Derived Formula", "Physical Significance / Limiting Cases"],
            suggested_visual="derivation_steps",
            is_exam_high_yield=True,
        ),
        "geometrical_construction": QuestionTypeMetadata(
            type_id="geometrical_construction",
            display_name="Geometrical Construction",
            description="Step-by-step drafting instructions using straightedge and compass.",
            required_sections=["Given Dimensions / Requirements", "To Construct", "Geometric Principle / Theorem Used", "Sequential Construction Steps (Compass & Ruler)", "Proof / Mathematical Justification of Validity"],
            suggested_visual="construction_steps_diagram",
            is_exam_high_yield=True,
        ),
        "diagram_explanation": QuestionTypeMetadata(
            type_id="diagram_explanation",
            display_name="Diagram Explanation",
            description="Comprehensive walkthrough of visual schematics, labeling, and component functions.",
            required_sections=["Diagram Identity & Orientation", "Key Parts & Functional Labeling", "Directional Arrows / Flow Mechanism", "Standard Board Exam Drawing Tips"],
            suggested_visual="labeled_diagram",
            is_exam_high_yield=True,
        ),
        "process_explanation": QuestionTypeMetadata(
            type_id="process_explanation",
            display_name="Process Explanation",
            description="Sequential stage-by-stage explanation of biological, chemical, or physical processes.",
            required_sections=["Process Definition & Site of Occurrence", "Necessary Preconditions / Reactants", "Chronological Stages / Steps", "End Products & Efficiency", "Regulatory / Influencing Factors"],
            suggested_visual="process_flowchart",
            is_exam_high_yield=True,
        ),
        "historical_event": QuestionTypeMetadata(
            type_id="historical_event",
            display_name="Historical Event",
            description="Chronological historical analysis with context, key figures, and significance.",
            required_sections=["Historical Context & Date/Location", "Key Leaders / Protagonists", "Chronological Sequence of Events", "Consequences & Historical Legacy", "Primary Source / Historiographical Note"],
            suggested_visual="timeline",
            is_exam_high_yield=True,
        ),
        "map_based_question": QuestionTypeMetadata(
            type_id="map_based_question",
            display_name="Map-Based Question",
            description="Cartographic orientation, coordinate references, landmarks, and spatial distribution.",
            required_sections=["Geographic Scope & Map Type", "Specific Coordinates / Landmark Reference", "Key Physical / Thematic Features Marked", "Topographical / Spatial Significance"],
            suggested_visual="annotated_map",
            is_exam_high_yield=True,
        ),
        "formula_explanation": QuestionTypeMetadata(
            type_id="formula_explanation",
            display_name="Formula Explanation",
            description="Deconstruction of mathematical or scientific formulas, symbols, units, and conditions.",
            required_sections=["The Formula in Standard Notation", "Symbol Breakdown & Physical Quantities", "Standard SI / Metric Units", "Conditions of Validity / Limitations"],
            suggested_visual="formula_card",
            is_exam_high_yield=False,
        ),
        "identify_classify": QuestionTypeMetadata(
            type_id="identify_classify",
            display_name="Identify and Classify",
            description="Taxonomic grouping and categorical classification based on distinguishing criteria.",
            required_sections=["Item Identification", "Classification Hierarchy / Category", "Distinguishing Diagnostic Features", "Contrasting Non-Members"],
            suggested_visual="classification_tree",
            is_exam_high_yield=False,
        ),
        "short_answer": QuestionTypeMetadata(
            type_id="short_answer",
            display_name="Short-Answer Question",
            description="Concise, high-yield answers tailored for 1-2 mark questions.",
            required_sections=["Direct Answer / Name / Term", "Brief Scientific / Contextual Reason", "Mark-Scoring Key Term"],
            suggested_visual=None,
            is_exam_high_yield=True,
        ),
        "long_answer": QuestionTypeMetadata(
            type_id="long_answer",
            display_name="Long-Answer Question",
            description="Structured comprehensive essay response suitable for 4-6 mark board questions.",
            required_sections=["Introduction & Thesis Statement", "Detailed Sub-Headings with Bullet Points", "Supporting Evidence / Equations / Diagrams", "Concluding Summary"],
            suggested_visual="structured_outline",
            is_exam_high_yield=True,
        ),
        "exam_style": QuestionTypeMetadata(
            type_id="exam_style",
            display_name="Exam-Style Question",
            description="Model answer strictly mapped to standard CISCE/CBSE marking schemes.",
            required_sections=["Mark Breakdown & Allocation ([1 mark] / [2 marks])", "Model Answer with Key Marks-Underlined", "Common Examiner Pitfalls (Where students lose marks)", "Revision Flashpoint"],
            suggested_visual="marking_rubric",
            is_exam_high_yield=True,
        ),
        "application_based": QuestionTypeMetadata(
            type_id="application_based",
            display_name="Application-Based Question",
            description="Real-world scenario testing conceptual understanding and higher-order thinking.",
            required_sections=["Scenario Analysis", "Underlying Scientific / Mathematical Law Involved", "Application to the Situation", "Practical Significance"],
            suggested_visual="scenario_graphic",
            is_exam_high_yield=True,
        ),
        "follow_up": QuestionTypeMetadata(
            type_id="follow_up",
            display_name="Follow-up Question",
            description="Contextual clarification, continuation, or deeper dive into a previously discussed topic.",
            required_sections=["Connection to Previous Topic", "Targeted Clarification / Answer", "Contrast or Additional Context", "Check for Understanding"],
            suggested_visual=None,
            is_exam_high_yield=False,
        ),
    }

    # Rule patterns for pattern matching
    FOLLOW_UP_PATTERNS = [
        r"^(and|also|what about|how about|why is that|can you explain that further)\b",
        r"\b(second|first|third|last|previous|above|next) (point|step|reason|example|equation)\b",
        r"\b(explain again|explain more|tell me more|give another example|clarify this|elaborate)\b",
        r"\b(why did you say|what does that mean|i don't understand that part)\b",
        r"^(why\?|how\?|what if\b|what happens next\b)",
    ]

    TYPE_RULES = [
        ("follow_up", [r"^(and|what about|how about|explain the second point|give another example|why\?)\b"]),
        ("numerical_problem", [
            r"\b(calculate|find the value of|solve for|determine the force|mass of|velocity of|resistance of|how much heat|a body of|an object of)\b",
            r"\b(\d+(\.\d+)?\s*(kg|m/s|newton|ohm|cm|joule|watt|coulomb|volt|ampere))\b",
            r"\b(a stone is thrown|a car accelerates|an electric circuit of|calculate the focal length)\b"
        ]),
        ("geometrical_construction", [
            r"\b(construct|draw a line segment|draw a circle of radius|tangent to a circle|circumscribe|inscribe|using ruler and compasses?|bisect|angle bisector)\b"
        ]),
        ("mathematical_proof", [
            r"\b(prove that|show that lhs\s*=\s*rhs|show that|deduce that|mathematical proof)\b",
            r"\b(prove that the tangents drawn|prove by contradiction|prove the identity)\b"
        ]),
        ("mathematical_derivation", [
            r"\b(derive|derivation of|derive the expression|derive the lens formula|derive the mirror formula|derive v\^2\s*=|derive an expression)\b"
        ]),
        ("differentiate", [
            r"\b(differentiate between|distinguish between|give differences between|tabulate the difference|points of difference)\b"
        ]),
        ("compare", [
            r"\b(compare|comparison between|similarities and differences|how does .* compare to)\b"
        ]),
        ("advantages_disadvantages", [
            r"\b(advantages and disadvantages|merits and demerits|pros and cons|benefits and drawbacks|limitations of)\b"
        ]),
        ("causes_effects", [
            r"\b(causes and effects|causes and consequences|what caused|consequences of|impact of|reasons for the revolt|factors leading to)\b"
        ]),
        ("map_based_question", [
            r"\b(map|mark on the map|locate on the map|topographical sheet|topo sheet|contour lines|grid reference|shading the area)\b"
        ]),
        ("historical_event", [
            r"\b(revolt of 1857|first world war|second world war|treaty of versailles|quit india|swadeshi|dandi march|events of|timeline of)\b"
        ]),
        ("diagram_explanation", [
            r"\b(explain the diagram|diagram of|draw a neat labeled diagram|label the parts of|schematic representation)\b"
        ]),
        ("process_explanation", [
            r"\b(process of|mechanism of|steps involved in|stages of|how is .* manufactured|haber process|contact process|transpiration mechanism|photosynthesis process)\b"
        ]),
        ("how_and_why", [
            r"\b(how and why|why does|how does|why is|explain why)\b"
        ]),
        ("formula_explanation", [
            r"\b(explain the formula|what does .* represent in the formula|state the mathematical expression|write the formula for)\b"
        ]),
        ("identify_classify", [
            r"\b(classify|identify the type|name the group|categorize|which group does .* belong to)\b"
        ]),
        ("definition", [
            r"\b(define|definition of|what is meant by|what is|state the term|define the following)\b"
        ]),
        ("application_based", [
            r"\b(give real life application|why do we feel|why is it recommended to|practical application|daily life example|give scientific reason)\b"
        ]),
        ("exam_style", [
            r"\b(marks?|\[\d+\s*marks?\]|board question|sample paper|marking scheme|icse 20\d\d)\b"
        ]),
        ("describe", [
            r"\b(describe|give an account of|state the structure of|appearance of)\b"
        ]),
        ("short_answer", [
            r"\b(name the|give one reason|state two factors|mention one|briefly state|state the law of)\b"
        ]),
        ("long_answer", [
            r"\b(discuss in detail|explain comprehensively|write an essay on|give a detailed account)\b"
        ]),
        ("explain", [
            r"\b(explain|what happens when|elucidate|clarify)\b"
        ]),
    ]

    def classify(self, query: str, has_prior_context: bool = False) -> QuestionClassificationResult:
        """
        Classifies student query into one of the 23 precise question types.
        """
        q_lower = query.strip().lower()

        # Check follow-up status
        is_follow_up = False
        if has_prior_context:
            for pattern in self.FOLLOW_UP_PATTERNS:
                if re.search(pattern, q_lower):
                    is_follow_up = True
                    break

        if is_follow_up:
            metadata = self.QUESTION_TYPES["follow_up"]
            return QuestionClassificationResult(
                primary_type="follow_up",
                confidence=0.92,
                secondary_types=["explain"],
                is_follow_up=True,
                metadata=metadata,
                scaffold_instructions=self._generate_scaffold_instructions("follow_up", metadata),
            )

        matched_types: List[tuple] = []

        for type_id, patterns in self.TYPE_RULES:
            score = 0
            for pat in patterns:
                matches = re.findall(pat, q_lower)
                if matches:
                    score += len(matches) * 1.5
            if score > 0:
                matched_types.append((type_id, score))

        if matched_types:
            # Sort by highest score
            matched_types.sort(key=lambda x: x[1], reverse=True)
            primary_type = matched_types[0][0]
            confidence = min(0.95, 0.65 + (matched_types[0][1] * 0.1))
            secondary = [t[0] for t in matched_types[1:4]]
        else:
            # Fallback based on sentence structure
            if q_lower.startswith("what is") or q_lower.startswith("define"):
                primary_type = "definition"
                confidence = 0.75
            elif q_lower.startswith("why") or q_lower.startswith("how"):
                primary_type = "how_and_why"
                confidence = 0.70
            elif "difference" in q_lower or "versus" in q_lower or "vs" in q_lower:
                primary_type = "differentiate"
                confidence = 0.85
            elif any(c in q_lower for c in ["+", "=", "*", "^", "calculate", "value"]):
                primary_type = "numerical_problem"
                confidence = 0.70
            else:
                primary_type = "explain"
                confidence = 0.60
            secondary = []

        metadata = self.QUESTION_TYPES[primary_type]
        scaffold = self._generate_scaffold_instructions(primary_type, metadata)

        return QuestionClassificationResult(
            primary_type=primary_type,
            confidence=confidence,
            secondary_types=secondary,
            is_follow_up=False,
            metadata=metadata,
            scaffold_instructions=scaffold,
        )

    def _generate_scaffold_instructions(self, type_id: str, meta: QuestionTypeMetadata) -> str:
        sections_str = "\n".join([f"  - {s}" for s in meta.required_sections])
        visual_str = f"Visual Guidance: Require {meta.suggested_visual}" if meta.suggested_visual else "Visual Guidance: Optional / Diagram as needed"
        return (
            f"QUESTION TYPE SCAFFOLD FOR '{meta.display_name.upper()}':\n"
            f"Core Objective: {meta.description}\n"
            f"MANDATORY STRUCTURAL SECTIONS:\n{sections_str}\n"
            f"{visual_str}\n"
            f"Pedagogical Requirement: Never omit any of these sections. Keep the answer structure tightly aligned to this format."
        )


question_type_classifier = QuestionTypeClassifier()
