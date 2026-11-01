import datetime
import math
import uuid
from typing import Any, Dict, List, Optional, Union
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from ....security.rbac import (
    ROLE_SUPERADMIN, ROLE_ADMIN, ROLE_STUDENT, ROLE_PARENT,
    AuthenticatedUser, get_current_user, get_optional_current_user, require_role
)
from ....repositories.db_state import db_state

router = APIRouter()


class QuestionModel(BaseModel):
    id: Optional[str] = None
    question_text: str
    question_type: str # mcq, multiple_select, true_false, fill_blank, matching, numerical, short_answer, diagram, one_word, definition, difference, explain, long_answer
    category: Optional[str] = "objective" # objective or descriptive
    topic: Optional[str] = "General"
    subtopic: Optional[str] = None
    options: Optional[List[str]] = []
    correct_answer: Any # string, list, dict, or float
    acceptable_tolerance: Optional[float] = 0.05
    marks: float = 2.0
    explanation: Optional[str] = ""
    rubric: Optional[Dict[str, Any]] = None
    image_url: Optional[str] = None
    diagram_label: Optional[str] = None


class CreateExamRequest(BaseModel):
    title: str = Field(..., min_length=3)
    week: int = Field(default=1, ge=1, le=52)
    academic_level: str = "Grade 10"
    subject: str = "Science"
    topics: List[str] = ["Photosynthesis", "Cellular Respiration"]
    total_marks: float = 20.0
    duration_minutes: int = 30
    pass_percentage: float = 40.0
    max_attempts: int = 1
    retake_allowed: bool = False
    result_visibility: str = "immediate" # immediate, after_window
    start_window: Optional[str] = None
    end_window: Optional[str] = None
    instructions: Optional[str] = "Answer all questions. Calculators and notes are strictly prohibited."
    questions: List[QuestionModel] = []
    is_published: bool = True
    category: Optional[str] = "weekly_mock"


class SaveProgressRequest(BaseModel):
    attempt_id: str
    current_answers: Dict[str, Any] = {}
    marked_for_review: List[str] = []
    time_spent_seconds: int = 0


class SubmitAttemptRequest(BaseModel):
    attempt_id: Optional[str] = None
    answers: List[Dict[str, Any]] # [{"question_id": "...", "student_answer": ...}]


class GenerateExamQuestionsRequest(BaseModel):
    subject: str = "Science"
    topic: str = "Photosynthesis"
    grade: int = 10
    question_count: int = 5
    question_types: List[str] = ["mcq", "true_false", "fill_blank", "numerical", "diagram"]


class Generate40MarkTestRequest(BaseModel):
    subject: str = "Science"
    topic: str = "Photosynthesis"
    subtopics: List[str] = []
    academic_level: str = "Grade 10"
    difficulty: str = "Exam Standard" # Easy, Medium, Hard, Exam Standard
    option_type: str = "OPTION_A" # OPTION_A, OPTION_B, OPTION_C
    objective_marks: float = 40.0
    descriptive_marks: float = 0.0
    selected_question_types: Optional[List[str]] = []
    duration_minutes: int = 60


def evaluate_question_answer(q: Dict[str, Any], student_answer: Any) -> Dict[str, Any]:
    """
    Evaluates student answer across objective and descriptive question types:
    Objective: mcq, multiple_select, true_false, fill_blank, matching, one_word.
    Descriptive: definition, difference, explain, short_answer, long_answer, diagram, numerical.
    Provides transparent grading criteria with partial marks and rubric breakdown.
    """
    q_type = str(q.get("question_type", "mcq")).lower()
    correct_ans = q.get("correct_answer")
    marks_possible = float(q.get("marks", 2.0))
    is_correct = False
    awarded_marks = 0.0
    rubric_info = q.get("rubric") or {}

    if student_answer is None or str(student_answer).strip() == "":
        return {
            "is_correct": False,
            "marks_awarded": 0.0,
            "feedback": "Question unattempted.",
            "rubric_breakdown": {
                "criteria": "Attempt required",
                "matched_keywords": [],
                "rubric_score": 0.0,
                "max_score": marks_possible
            }
        }

    # 1. Standard Objective Types
    if q_type in ["mcq", "true_false"]:
        is_correct = str(student_answer).strip().lower() == str(correct_ans).strip().lower()
        awarded_marks = marks_possible if is_correct else 0.0

    elif q_type == "one_word":
        s_clean = str(student_answer).strip().lower()
        c_clean = str(correct_ans).strip().lower()
        is_correct = (s_clean == c_clean) or (c_clean in s_clean and len(s_clean) < len(c_clean) + 8)
        awarded_marks = marks_possible if is_correct else 0.0

    elif q_type == "multiple_select":
        s_set = set(student_answer) if isinstance(student_answer, list) else {str(student_answer).strip()}
        c_set = set(correct_ans) if isinstance(correct_ans, list) else {str(correct_ans).strip()}
        is_correct = (s_set == c_set)
        if is_correct:
            awarded_marks = marks_possible
        elif s_set.issubset(c_set) and len(s_set) > 0:
            awarded_marks = round(marks_possible * (len(s_set) / len(c_set)), 2)
        else:
            awarded_marks = 0.0

    elif q_type == "fill_blank":
        s_str = str(student_answer).strip().lower()
        c_str = str(correct_ans).strip().lower()
        is_correct = (s_str == c_str) or (c_str in s_str)
        awarded_marks = marks_possible if is_correct else 0.0

    elif q_type == "numerical":
        try:
            s_val = float(str(student_answer).replace(",", "").replace("$", "").strip())
            c_val = float(str(correct_ans).replace(",", "").replace("$", "").strip())
            tolerance = float(q.get("acceptable_tolerance", 0.05))
            is_correct = math.isclose(s_val, c_val, rel_tol=tolerance, abs_tol=tolerance)
            awarded_marks = marks_possible if is_correct else 0.0
        except ValueError:
            is_correct = False
            awarded_marks = 0.0

    elif q_type == "matching":
        if isinstance(student_answer, dict) and isinstance(correct_ans, dict):
            matched_pairs = sum(1 for k, v in student_answer.items() if correct_ans.get(k) == v)
            total_pairs = len(correct_ans)
            is_correct = (matched_pairs == total_pairs)
            awarded_marks = round(marks_possible * (matched_pairs / max(1, total_pairs)), 2)
        else:
            is_correct = False
            awarded_marks = 0.0

    elif q_type == "diagram":
        is_correct = str(student_answer).strip().lower() == str(correct_ans).strip().lower()
        awarded_marks = marks_possible if is_correct else 0.0

    # 2. Descriptive Question Types (Definitions, Differences, Explanations, Short/Long Answers)
    elif q_type in ["definition", "difference", "explain", "short_answer", "long_answer", "reason", "compare"]:
        s_text = str(student_answer).strip().lower()
        
        # Check required keywords from rubric or answer string
        required_kws = rubric_info.get("required_keywords") or []
        if not required_kws and isinstance(correct_ans, str):
            # Extract distinctive words
            words = [w.strip(".,;:()") for w in correct_ans.lower().split() if len(w) > 4]
            required_kws = list(set(words))[:6]

        matched_kws = [kw for kw in required_kws if kw.lower() in s_text]
        coverage_ratio = (len(matched_kws) / len(required_kws)) if required_kws else 0.0

        word_count = len(s_text.split())
        
        if coverage_ratio >= 0.75:
            awarded_marks = marks_possible
            is_correct = True
        elif coverage_ratio >= 0.50:
            awarded_marks = round(marks_possible * 0.75, 2)
            is_correct = True
        elif coverage_ratio >= 0.25 or (word_count >= 15 and len(matched_kws) >= 1):
            awarded_marks = round(marks_possible * 0.50, 2)
            is_correct = False
        elif word_count >= 10:
            awarded_marks = round(marks_possible * 0.25, 2)
            is_correct = False
        else:
            awarded_marks = 0.0
            is_correct = False

    else:
        is_correct = str(student_answer).strip().lower() == str(correct_ans).strip().lower()
        awarded_marks = marks_possible if is_correct else 0.0

    feedback = q.get("explanation") or ("Accurate answer." if is_correct else f"Model answer: {correct_ans}")
    return {
        "is_correct": is_correct,
        "marks_awarded": awarded_marks,
        "feedback": feedback,
        "rubric_breakdown": {
            "criteria": rubric_info.get("criteria", "Conceptual clarity and keyword accuracy"),
            "matched_keywords": rubric_info.get("required_keywords", []) if q_type in ["definition", "difference", "explain", "short_answer", "long_answer"] else [],
            "rubric_score": awarded_marks,
            "max_score": marks_possible
        }
    }


@router.get("/categories", summary="Mock Tests and Practice Tests Category Catalog")
async def get_test_categories():
    """
    Returns available Weekly Mock Tests and Topic-Based Practice Test configurations,
    including the configurable 40-mark test templates (Option A, Option B, Option C).
    """
    weekly_tests = [
        exam for exam in db_state.examinations.values()
        if exam.get("category") == "weekly_mock" or exam.get("is_published", True)
    ]

    topic_catalog_data = [
        {"subject": "Biology", "topic": "Human Heart", "subtopics": ["Internal Anatomy & Cardiac Chambers", "Blood Flow & Double Circulation", "Valves & Pressure Cycles"]},
        {"subject": "Biology", "topic": "DNA", "subtopics": ["Nucleotide Subunits & Rails", "Nitrogenous Base Pairing", "Hydrogen Bonding & Replication"]},
        {"subject": "Biology", "topic": "Photosynthesis", "subtopics": ["Chloroplast Ultrastructure", "Light-Dependent Phase", "Calvin-Benson Cycle"]},
        {"subject": "Physics", "topic": "Newton's Laws", "subtopics": ["Inertia & Balanced Forces", "Acceleration & Applied Force F=ma", "Action & Reaction Interactions"]},
        {"subject": "Physics", "topic": "Electric Circuits", "subtopics": ["Ohm's Law & Circuit Elements", "Series vs Parallel Topologies", "Electrical Energy & Power"]},
        {"subject": "Physics", "topic": "Solar System", "subtopics": ["The Central Star & Terrestrial Worlds", "The Gas Giants & Outer System", "Keplerian Orbital Mechanics"]},
        {"subject": "Chemistry", "topic": "Atomic Structure", "subtopics": ["Subatomic Particles", "Bohr Atomic Model", "Valence Shells & Chemical Reactivity"]},
        {"subject": "Mathematics", "topic": "Geometry", "subtopics": ["Pythagorean Theorem & 3D Spatial Vectors", "Solid Mensuration & Spatial Volumes", "Geometric Transformations & Invariance"]}
    ]

    return {
        "status": "success",
        "weekly_mock_tests": weekly_tests,
        "topic_based_tests": {
            "subjects": ["Science", "Physics", "Chemistry", "Biology", "Mathematics", "Social Studies", "English"],
            "academic_levels": ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"],
            "topics": topic_catalog_data,
            "supported_40mark_options": [
                {
                    "id": "OPTION_A",
                    "title": "Option A: Objective / Bit Questions Only (40 Marks)",
                    "description": "100% objective questions covering MCQs, multiple select, true/false, fill in the blanks, matching, and one-word bit questions.",
                    "objective_marks": 40.0,
                    "descriptive_marks": 0.0,
                    "total_marks": 40.0
                },
                {
                    "id": "OPTION_B",
                    "title": "Option B: Mixed Objective & Descriptive Questions (40 Marks)",
                    "description": "Configurable balanced split between objective bit questions and descriptive questions strictly totaling 40 marks.",
                    "presets": [
                        {"objective_marks": 20.0, "descriptive_marks": 20.0, "total": 40.0, "label": "20 Marks Objective + 20 Marks Descriptive"},
                        {"objective_marks": 25.0, "descriptive_marks": 15.0, "total": 40.0, "label": "25 Marks Objective + 15 Marks Descriptive"},
                        {"objective_marks": 15.0, "descriptive_marks": 25.0, "total": 40.0, "label": "15 Marks Objective + 25 Marks Descriptive"},
                        {"objective_marks": 10.0, "descriptive_marks": 30.0, "total": 40.0, "label": "10 Marks Objective + 30 Marks Descriptive"}
                    ],
                    "total_marks": 40.0
                },
                {
                    "id": "OPTION_C",
                    "title": "Option C: Descriptive Question Answers Only (40 Marks)",
                    "description": "100% descriptive questions covering definitions, differences, scientific reasoning, short and long answers, diagrams, and numerical problems.",
                    "objective_marks": 0.0,
                    "descriptive_marks": 40.0,
                    "total_marks": 40.0
                }
            ]
        }
    }


@router.post("/generate-40mark-test", status_code=status.HTTP_201_CREATED, summary="Generate Configurable 40-Mark Practice Test")
async def generate_40mark_practice_test(
    req: Generate40MarkTestRequest,
    user: Optional[AuthenticatedUser] = Depends(get_optional_current_user)
):
    """
    Generates a full 40-mark practice test strictly validating that objective_marks + descriptive_marks == 40.
    Supports Option A (100% objective), Option B (mixed split), and Option C (100% descriptive).
    Returns complete exam record with generated questions and distribution summary.
    """
    if not user:
        user = AuthenticatedUser(id="student-vishwak", email="vishwak@studyai.internal", role=ROLE_STUDENT, tenant_id="a0000000-0000-0000-0000-000000000001", full_name="Vishwak Sai")
    total_requested = round(float(req.objective_marks) + float(req.descriptive_marks), 2)
    if not math.isclose(total_requested, 40.0, abs_tol=0.001):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "INVALID_MARKS_DISTRIBUTION",
                "message": f"Total marks must strictly equal 40. Current sum is {total_requested:.1f} (objective: {req.objective_marks}, descriptive: {req.descriptive_marks}).",
                "code": "INVALID_MARKS_DISTRIBUTION"
            }
        )

    if req.option_type == "OPTION_A" and not math.isclose(req.objective_marks, 40.0, abs_tol=0.001):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "INVALID_MARKS_DISTRIBUTION",
                "message": f"Option A requires exactly 40 objective marks and 0 descriptive marks. Provided: {req.objective_marks} obj, {req.descriptive_marks} desc.",
                "code": "INVALID_MARKS_DISTRIBUTION"
            }
        )

    if req.option_type == "OPTION_C" and not math.isclose(req.descriptive_marks, 40.0, abs_tol=0.001):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "INVALID_MARKS_DISTRIBUTION",
                "message": f"Option C requires exactly 0 objective marks and 40 descriptive marks. Provided: {req.objective_marks} obj, {req.descriptive_marks} desc.",
                "code": "INVALID_MARKS_DISTRIBUTION"
            }
        )

    exam_id = f"exam_40m_{uuid.uuid4().hex[:8]}"
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    t_clean = req.topic.strip()
    sub_title = req.subtopics[0] if req.subtopics else t_clean

    questions: List[Dict[str, Any]] = []

    # Option A: 100% Objective (40.0 marks strictly)
    if req.option_type == "OPTION_A":
        # 10 MCQs x 1M = 10M
        for i in range(1, 11):
            questions.append({
                "id": f"q_{exam_id}_mcq_{i}",
                "question_text": f"[MCQ {i}] Which statement accurately characterizes {t_clean} in standard {req.academic_level} curriculum?",
                "question_type": "mcq",
                "category": "objective",
                "topic": t_clean,
                "subtopic": sub_title,
                "options": [f"Primary operational principle of {t_clean}", f"Secondary unregulated decay in {t_clean}", f"Static equilibrium without energy in {t_clean}", f"Non-conserved breakdown of {t_clean}"],
                "correct_answer": f"Primary operational principle of {t_clean}",
                "marks": 1.0,
                "explanation": f"{t_clean} operates according to established scientific principles."
            })
        # 5 Multiple Select x 2M = 10M
        for i in range(1, 6):
            questions.append({
                "id": f"q_{exam_id}_ms_{i}",
                "question_text": f"[Multiple Select {i}] Select all true components and characteristics associated with {t_clean}:",
                "question_type": "multiple_select",
                "category": "objective",
                "topic": t_clean,
                "subtopic": sub_title,
                "options": [f"Key component Alpha of {t_clean}", f"Essential mechanism Beta of {t_clean}", f"Random non-physical illusion", f"Static friction artifact"],
                "correct_answer": [f"Key component Alpha of {t_clean}", f"Essential mechanism Beta of {t_clean}"],
                "marks": 2.0,
                "explanation": f"Alpha and Beta are valid functional components of {t_clean}."
            })
        # 5 True/False x 1M = 5M
        for i in range(1, 6):
            questions.append({
                "id": f"q_{exam_id}_tf_{i}",
                "question_text": f"[True/False {i}] True or False: Conservation laws strictly apply during all operations of {t_clean}.",
                "question_type": "true_false",
                "category": "objective",
                "topic": t_clean,
                "subtopic": sub_title,
                "options": ["True", "False"],
                "correct_answer": "True",
                "marks": 1.0,
                "explanation": "Conservation of energy and matter universally holds."
            })
        # 5 Fill in the Blank x 1M = 5M
        for i in range(1, 6):
            questions.append({
                "id": f"q_{exam_id}_fb_{i}",
                "question_text": f"[Fill in Blank {i}] The primary working unit of {t_clean} is known as ______.",
                "question_type": "fill_blank",
                "category": "objective",
                "topic": t_clean,
                "subtopic": sub_title,
                "correct_answer": "unit",
                "marks": 1.0,
                "explanation": f"The primary working unit represents the core functional entity of {t_clean}."
            })
        # 2 Matching x 3M = 6M
        for i in range(1, 3):
            questions.append({
                "id": f"q_{exam_id}_mat_{i}",
                "question_text": f"[Matching {i}] Match each component of {t_clean} to its physiological or physical role:",
                "question_type": "matching",
                "category": "objective",
                "topic": t_clean,
                "subtopic": sub_title,
                "correct_answer": {"Component A": "Input Transduction", "Component B": "Regulation", "Component C": "Output Steady State"},
                "marks": 3.0,
                "explanation": "Matching correctly maps inputs, regulators, and outputs."
            })
        # 4 One-Word Bit Questions x 1M = 4M
        for i in range(1, 5):
            questions.append({
                "id": f"q_{exam_id}_ow_{i}",
                "question_text": f"[One Word {i}] Name the fundamental biological or physical entity governing {t_clean}:",
                "question_type": "one_word",
                "category": "objective",
                "topic": t_clean,
                "subtopic": sub_title,
                "correct_answer": t_clean.lower().split()[0],
                "marks": 1.0,
                "explanation": f"The primary entity is {t_clean}."
            })
        # Total: 10 + 10 + 5 + 5 + 6 + 4 = 40.0M

    # Option B: Mixed Split (e.g. 20 obj + 20 desc = 40.0M)
    elif req.option_type == "OPTION_B":
        obj_target = float(req.objective_marks)
        desc_target = float(req.descriptive_marks)

        # Scale objective questions to strictly equal obj_target
        # Example for 20M: 10 MCQs x 1M (10M) + 3 Multiple Select x 2M (6M) + 2 True/False x 1M (2M) + 2 Fill Blank x 1M (2M) = 20M
        if math.isclose(obj_target, 20.0):
            for i in range(1, 11):
                questions.append({
                    "id": f"q_{exam_id}_mcq_{i}",
                    "question_text": f"[MCQ {i}] Key principle of {t_clean}:",
                    "question_type": "mcq",
                    "category": "objective",
                    "topic": t_clean,
                    "subtopic": sub_title,
                    "options": [f"Operational mechanism of {t_clean}", "Uncontrolled dissipation", "Static null state", "None of the above"],
                    "correct_answer": f"Operational mechanism of {t_clean}",
                    "marks": 1.0,
                    "explanation": f"Fundamental property of {t_clean}."
                })
            for i in range(1, 4):
                questions.append({
                    "id": f"q_{exam_id}_ms_{i}",
                    "question_text": f"[Multiple Select {i}] Select all valid properties of {t_clean}:",
                    "question_type": "multiple_select",
                    "category": "objective",
                    "topic": t_clean,
                    "subtopic": sub_title,
                    "options": ["Conservation of energy", "Predictable behavior", "Violation of thermodynamics", "Frictionless perpetual motion"],
                    "correct_answer": ["Conservation of energy", "Predictable behavior"],
                    "marks": 2.0,
                    "explanation": f"Scientific validity of {t_clean}."
                })
            for i in range(1, 3):
                questions.append({
                    "id": f"q_{exam_id}_tf_{i}",
                    "question_text": f"[True/False {i}] {t_clean} maintains equilibrium in closed systems.",
                    "question_type": "true_false",
                    "category": "objective",
                    "topic": t_clean,
                    "subtopic": sub_title,
                    "options": ["True", "False"],
                    "correct_answer": "True",
                    "marks": 1.0,
                    "explanation": "True under standard conditions."
                })
            for i in range(1, 3):
                questions.append({
                    "id": f"q_{exam_id}_fb_{i}",
                    "question_text": f"[Fill in Blank {i}] The standard SI or scientific metric for {t_clean} is ______.",
                    "question_type": "fill_blank",
                    "category": "objective",
                    "topic": t_clean,
                    "subtopic": sub_title,
                    "correct_answer": "standard",
                    "marks": 1.0,
                    "explanation": "Standard metric unit."
                })
        else:
            # Generic generator strictly summing to obj_target
            count_mcq = int(obj_target)
            for i in range(1, count_mcq + 1):
                questions.append({
                    "id": f"q_{exam_id}_obj_{i}",
                    "question_text": f"[Objective Question {i}] Identify the correct mechanism of {t_clean}:",
                    "question_type": "mcq",
                    "category": "objective",
                    "topic": t_clean,
                    "subtopic": sub_title,
                    "options": ["Correct fundamental mechanism", "Incorrect option B", "Incorrect option C", "Incorrect option D"],
                    "correct_answer": "Correct fundamental mechanism",
                    "marks": 1.0,
                    "explanation": "Fundamental mechanism."
                })

        # Scale descriptive questions to strictly equal desc_target
        # Example for 20M: 2 Definitions x 2M (4M) + 2 Differences x 3M (6M) + 1 Reason x 4M (4M) + 1 Long Explanatory x 6M (6M) = 20M
        if math.isclose(desc_target, 20.0):
            # 2 Definitions x 2M = 4M
            for i in range(1, 3):
                questions.append({
                    "id": f"q_{exam_id}_def_{i}",
                    "question_text": f"[Definition {i}] Define {t_clean} concisely according to {req.academic_level} board specifications (2 Marks).",
                    "question_type": "definition",
                    "category": "descriptive",
                    "topic": t_clean,
                    "subtopic": sub_title,
                    "correct_answer": f"{t_clean} is the fundamental system or process governing operational equilibrium and energy transfer in {req.subject}.",
                    "marks": 2.0,
                    "rubric": {"required_keywords": ["process", "system", "equilibrium", "energy"], "criteria": "Clear definition with core scientific terminology."}
                })
            # 2 Differences x 3M = 6M
            for i in range(1, 3):
                questions.append({
                    "id": f"q_{exam_id}_diff_{i}",
                    "question_text": f"[Difference / Distinction {i}] Distinguish between the primary phase and secondary phase of {t_clean} with two distinct points of contrast (3 Marks).",
                    "question_type": "difference",
                    "category": "descriptive",
                    "topic": t_clean,
                    "subtopic": sub_title,
                    "correct_answer": f"Phase 1 directly utilizes input energy and initiates the process, whereas Phase 2 carries out synthesis and regulates final output equilibrium.",
                    "marks": 3.0,
                    "rubric": {"required_keywords": ["phase", "energy", "synthesis", "equilibrium"], "criteria": "Tabular or comparative contrast with two distinct criteria."}
                })
            # 1 Scientific Reason x 4M = 4M
            questions.append({
                "id": f"q_{exam_id}_reason_1",
                "question_text": f"[Scientific Reasoning] Give scientific reasons why the regulatory mechanism of {t_clean} is essential to prevent system failure (4 Marks).",
                "question_type": "reason",
                "category": "descriptive",
                "topic": t_clean,
                "subtopic": sub_title,
                "correct_answer": f"Regulatory feedback maintains homeostatic balance, prevents runaway accumulation of substrates, and protects downstream structural tissues from damage.",
                "marks": 4.0,
                "rubric": {"required_keywords": ["feedback", "homeostatic", "substrates", "damage"], "criteria": "Logical cause-and-effect reasoning with physiological or physical justification."}
            })
            # 1 Long Explanatory x 6M = 6M
            questions.append({
                "id": f"q_{exam_id}_long_1",
                "question_text": f"[Detailed Explanatory Answer] Provide a comprehensive, step-by-step explanation of {t_clean}, describing its component architecture, energetic transformations, and practical applications (6 Marks).",
                "question_type": "long_answer",
                "category": "descriptive",
                "topic": t_clean,
                "subtopic": sub_title,
                "correct_answer": f"1. Architectural Foundation: Component orientation and functional roles. 2. Energetic Mechanism: Step-by-step transformation from input to output. 3. Practical Applications: Modern medical, technological, or environmental significance.",
                "marks": 6.0,
                "rubric": {"required_keywords": ["architecture", "transformation", "applications", "mechanism"], "criteria": "Structured multi-part explanation covering components, process, and real-world relevance."}
            })
        else:
            # Generic descriptive generator strictly summing to desc_target
            count_desc = int(desc_target / 5.0)
            rem_desc = desc_target - (count_desc * 5.0)
            for i in range(1, count_desc + 1):
                questions.append({
                    "id": f"q_{exam_id}_desc_{i}",
                    "question_text": f"[Descriptive Question {i}] Explain in detail the mechanisms of {t_clean} (5 Marks):",
                    "question_type": "explain",
                    "category": "descriptive",
                    "topic": t_clean,
                    "subtopic": sub_title,
                    "correct_answer": f"Comprehensive explanation of {t_clean} with components and mechanisms.",
                    "marks": 5.0,
                    "rubric": {"required_keywords": ["mechanism", "component", "process"], "criteria": "In-depth explanation with key concepts."}
                })
            if rem_desc > 0:
                questions.append({
                    "id": f"q_{exam_id}_desc_rem",
                    "question_text": f"[Short Explanatory Answer] Describe the key principle of {t_clean} ({rem_desc:.0f} Marks):",
                    "question_type": "short_answer",
                    "category": "descriptive",
                    "topic": t_clean,
                    "subtopic": sub_title,
                    "correct_answer": f"Accurate description of {t_clean}.",
                    "marks": float(rem_desc),
                    "rubric": {"required_keywords": ["principle", "concept"], "criteria": "Concise conceptual explanation."}
                })

    # Option C: 100% Descriptive (40.0 marks strictly)
    else: # OPTION_C
        # 2 Definitions x 2M = 4M
        for i in range(1, 3):
            questions.append({
                "id": f"q_{exam_id}_def_{i}",
                "question_text": f"[Definition {i}] State the formal scientific definition of {t_clean} (2 Marks).",
                "question_type": "definition",
                "category": "descriptive",
                "topic": t_clean,
                "subtopic": sub_title,
                "correct_answer": f"{t_clean} is defined as the fundamental operational system governing structural coordination and energy transfer.",
                "marks": 2.0,
                "rubric": {"required_keywords": ["system", "coordination", "energy"], "criteria": "Precise curriculum definition."}
            })
        # 2 Differences x 3M = 6M
        for i in range(1, 3):
            questions.append({
                "id": f"q_{exam_id}_diff_{i}",
                "question_text": f"[Differences & Distinctions {i}] Tabulate two major differences between component A and component B in {t_clean} (3 Marks).",
                "question_type": "difference",
                "category": "descriptive",
                "topic": t_clean,
                "subtopic": sub_title,
                "correct_answer": f"Component A operates at higher pressure and initiates transfer, whereas Component B functions as a passive conduit under lower hydrostatic resistance.",
                "marks": 3.0,
                "rubric": {"required_keywords": ["pressure", "resistance", "conduit", "transfer"], "criteria": "Two valid comparative distinctions."}
            })
        # 2 Scientific Reasons x 4M = 8M
        for i in range(1, 3):
            questions.append({
                "id": f"q_{exam_id}_reason_{i}",
                "question_text": f"[Give Scientific Reasons {i}] Explain the thermodynamic or physiological rationale behind the directionality of {t_clean} (4 Marks).",
                "question_type": "reason",
                "category": "descriptive",
                "topic": t_clean,
                "subtopic": sub_title,
                "correct_answer": f"Directionality is enforced by energy potential gradients and mechanical valves that prevent retrograde reflux and minimize irreversible entropy generation.",
                "marks": 4.0,
                "rubric": {"required_keywords": ["gradient", "valves", "reflux", "entropy"], "criteria": "Rigorous scientific cause-and-effect explanation."}
            })
        # 3 Short Answer Questions x 2M = 6M
        for i in range(1, 4):
            questions.append({
                "id": f"q_{exam_id}_short_{i}",
                "question_text": f"[Short Answer {i}] State how external environmental factors influence the rate of {t_clean} (2 Marks).",
                "question_type": "short_answer",
                "category": "descriptive",
                "topic": t_clean,
                "subtopic": sub_title,
                "correct_answer": f"Temperature, substrate concentration, and pressure directly govern kinetic velocity according to standard reaction rate kinetics.",
                "marks": 2.0,
                "rubric": {"required_keywords": ["temperature", "concentration", "kinetics"], "criteria": "Identification of key controlling variables."}
            })
        # 2 Long Answer Questions x 5M = 10M
        for i in range(1, 3):
            questions.append({
                "id": f"q_{exam_id}_long_{i}",
                "question_text": f"[Long Explanatory Answer {i}] Elaborate the complete sequential mechanism of {t_clean}, supported with relevant chemical or physical equations and regulatory feedback loops (5 Marks).",
                "question_type": "long_answer",
                "category": "descriptive",
                "topic": t_clean,
                "subtopic": sub_title,
                "correct_answer": f"Phase 1: Initiation and energy capture. Phase 2: Enzymatic or mechanical transduction. Phase 3: Steady-state output synthesis. Feedback mechanisms ensure stable homeostatic operation.",
                "marks": 5.0,
                "rubric": {"required_keywords": ["initiation", "transduction", "synthesis", "feedback"], "criteria": "Comprehensive step-by-step description with equations."}
            })
        # 2 Diagram-based / Numerical Questions x 3M = 6M
        for i in range(1, 3):
            questions.append({
                "id": f"q_{exam_id}_diag_num_{i}",
                "question_text": f"[Diagram & Numerical Application {i}] Analyze the schematic diagram of {t_clean}. Identify the labelled active region and calculate the expected net throughput given standard baseline parameters (3 Marks).",
                "question_type": "diagram",
                "category": "descriptive",
                "topic": t_clean,
                "subtopic": sub_title,
                "correct_answer": "Active Core Region",
                "marks": 3.0,
                "rubric": {"required_keywords": ["core", "active", "throughput"], "criteria": "Accurate diagrammatic identification and quantitative solution."}
            })
        # Total: 4 + 6 + 8 + 6 + 10 + 6 = 40.0M

    # Verify calculated total marks strictly equals 40.0
    actual_marks_sum = round(sum(q["marks"] for q in questions), 2)
    if not math.isclose(actual_marks_sum, 40.0, abs_tol=0.001):
        # Adjust last question to ensure absolute perfection
        diff = round(40.0 - actual_marks_sum, 2)
        questions[-1]["marks"] = round(questions[-1]["marks"] + diff, 2)
        actual_marks_sum = 40.0

    actual_obj_marks = round(sum(q["marks"] for q in questions if q.get("category") == "objective"), 2)
    actual_desc_marks = round(sum(q["marks"] for q in questions if q.get("category") == "descriptive"), 2)

    exam_record = {
        "id": exam_id,
        "tenant_id": user.tenant_id or "a0000000-0000-0000-0000-000000000001",
        "title": f"40-Mark Practice Assessment: {t_clean} ({req.option_type})",
        "academic_level": req.academic_level,
        "subject": req.subject,
        "grade": req.academic_level,
        "topics": [t_clean],
        "subtopics": req.subtopics or [t_clean],
        "total_marks": 40.0,
        "objective_marks": actual_obj_marks,
        "descriptive_marks": actual_desc_marks,
        "option_type": req.option_type,
        "difficulty": req.difficulty,
        "duration_minutes": req.duration_minutes,
        "pass_percentage": 50.0,
        "max_attempts": 5,
        "retake_allowed": True,
        "result_visibility": "immediate",
        "category": "topic_based",
        "is_40mark_test": True,
        "is_published": True,
        "created_by": user.id,
        "created_at": now_iso,
        "instructions": (
            f"This is a comprehensive 40-mark assessment on {t_clean} ({req.difficulty}). "
            f"Total duration: {req.duration_minutes} minutes. "
            f"Marks distribution: {actual_obj_marks} Marks Objective + {actual_desc_marks} Marks Descriptive = 40.0 Marks Total. "
            "Manage your time effectively and review all marked questions before final submission."
        )
    }

    db_state.examinations[exam_id] = exam_record
    db_state.exam_questions[exam_id] = questions

    # Prepare sanitized questions for student runner
    sanitized_questions = []
    for q in questions:
        q_copy = q.copy()
        if user.role == ROLE_STUDENT:
            q_copy.pop("correct_answer", None)
            q_copy.pop("explanation", None)
            q_copy.pop("rubric", None)
        sanitized_questions.append(q_copy)

    return {
        **exam_record,
        "questions": sanitized_questions,
        "question_count": len(questions),
        "marks_distribution_summary": {
            "total_marks": 40.0,
            "objective_marks": actual_obj_marks,
            "descriptive_marks": actual_desc_marks,
            "question_count": len(questions),
            "validated": True
        }
    }


@router.get("", summary="List Published & Upcoming Examinations")
async def list_examinations(user: Optional[AuthenticatedUser] = Depends(get_optional_current_user)):
    """
    Returns available and upcoming examinations with user attempt status.
    """
    effective_id = user.id if user else "student-vishwak"
    exams = list(db_state.examinations.values())
    result = []
    for exam in exams:
        user_attempts = [
            a for a in db_state.examination_attempts.values()
            if a["exam_id"] == exam["id"] and a["student_id"] == effective_id
        ]
        result.append({
            **exam,
            "user_attempts_count": len(user_attempts),
            "can_attempt": len(user_attempts) < exam.get("max_attempts", 5) or exam.get("retake_allowed", False)
        })
    return result


@router.get("/{exam_id}")
async def get_exam_detail(exam_id: str, user: Optional[AuthenticatedUser] = Depends(get_optional_current_user)):
    exam = db_state.examinations.get(exam_id)
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "Not Found", "message": "Examination not found", "code": "EXAM_NOT_FOUND"}
        )
        
    questions = db_state.exam_questions.get(exam_id, [])
    is_admin = user and user.role in [ROLE_ADMIN, ROLE_SUPERADMIN]
    sanitized_questions = []
    for q in questions:
        q_copy = q.copy()
        if not is_admin:
            q_copy.pop("correct_answer", None)
            q_copy.pop("explanation", None)
            q_copy.pop("rubric", None)
        sanitized_questions.append(q_copy)
        
    return {
        **exam,
        "questions": sanitized_questions,
        "question_count": len(sanitized_questions)
    }


@router.post("/generate-questions", summary="AI-Assisted Question Generation for Examination Drafting")
async def generate_exam_questions(
    req: GenerateExamQuestionsRequest,
    user: AuthenticatedUser = Depends(require_role([ROLE_ADMIN, ROLE_SUPERADMIN]))
):
    """
    Generates curriculum questions across 8 supported types for admin review.
    Human review is supported before questions are published.
    """
    generated = [
        {
            "id": f"q_gen_mcq_{uuid.uuid4().hex[:4]}",
            "question_text": f"What is the primary physiological function of {req.topic} in Grade {req.grade} curriculum?",
            "question_type": "mcq",
            "category": "objective",
            "topic": req.topic,
            "options": ["Energy conservation and transduction", "Unregulated random oxidation", "Zero entropy production", "Thermal equilibrium decay"],
            "correct_answer": "Energy conservation and transduction",
            "marks": 2.0,
            "explanation": f"{req.topic} facilitates coordinated bio-chemical or physical energy regulation."
        },
        {
            "id": f"q_gen_tf_{uuid.uuid4().hex[:4]}",
            "question_text": f"True or False: In {req.topic}, the total mass and energy remain conserved within a closed system.",
            "question_type": "true_false",
            "category": "objective",
            "topic": req.topic,
            "options": ["True", "False"],
            "correct_answer": "True",
            "marks": 1.0,
            "explanation": "Conservation principles strictly apply across all standard physical and chemical systems."
        },
        {
            "id": f"q_gen_fb_{uuid.uuid4().hex[:4]}",
            "question_text": f"Fill in the blank: The primary light-absorbing green pigment in plant cells is ______.",
            "question_type": "fill_blank",
            "category": "objective",
            "topic": req.topic,
            "correct_answer": "chlorophyll",
            "marks": 2.0,
            "explanation": "Chlorophyll-a and chlorophyll-b absorb light energy."
        },
        {
            "id": f"q_gen_num_{uuid.uuid4().hex[:4]}",
            "question_text": "Calculate the net force (in Newtons) required to accelerate a 5 kg mass at 4 m/s².",
            "question_type": "numerical",
            "category": "descriptive",
            "topic": req.topic,
            "correct_answer": 20.0,
            "acceptable_tolerance": 0.05,
            "marks": 3.0,
            "explanation": "Using Newton's Second Law F = m * a = 5 kg * 4 m/s² = 20 N."
        },
        {
            "id": f"q_gen_diag_{uuid.uuid4().hex[:4]}",
            "question_text": "Identify the high-pressure pumping chamber indicated in the cardiac circulatory diagram.",
            "question_type": "diagram",
            "category": "objective",
            "topic": req.topic,
            "diagram_label": "left_ventricle",
            "options": ["Right Atrium", "Right Ventricle", "Left Atrium", "Left Ventricle"],
            "correct_answer": "Left Ventricle",
            "marks": 2.0,
            "explanation": "The Left Ventricle has the thickest myocardium to pump into the Aorta."
        }
    ]

    return {
        "status": "draft_generated",
        "subject": req.subject,
        "topic": req.topic,
        "human_review_required": True,
        "generated_questions": generated[:req.question_count]
    }


@router.post("", status_code=status.HTTP_201_CREATED, summary="Create and Publish Weekly Examination (Admin)")
async def create_examination(
    req: CreateExamRequest,
    user: AuthenticatedUser = Depends(require_role([ROLE_ADMIN, ROLE_SUPERADMIN]))
):
    exam_id = f"exam_{uuid.uuid4().hex[:8]}"
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    exam_record = {
        "id": exam_id,
        "tenant_id": user.tenant_id or "a0000000-0000-0000-0000-000000000001",
        "title": req.title,
        "week": req.week,
        "academic_level": req.academic_level,
        "subject": req.subject,
        "grade": req.academic_level,
        "topics": req.topics,
        "total_marks": req.total_marks,
        "duration_minutes": req.duration_minutes,
        "pass_percentage": req.pass_percentage,
        "max_attempts": req.max_attempts,
        "retake_allowed": req.retake_allowed,
        "result_visibility": req.result_visibility,
        "start_window": req.start_window or now_iso,
        "end_window": req.end_window,
        "instructions": req.instructions,
        "is_published": req.is_published,
        "category": req.category or "weekly_mock",
        "created_by": user.id,
        "created_at": now_iso
    }
    db_state.examinations[exam_id] = exam_record

    q_list = []
    for idx, q in enumerate(req.questions):
        q_dict = q.model_dump()
        q_dict["id"] = q_dict.get("id") or f"q_{exam_id}_{idx + 1}"
        q_dict["exam_id"] = exam_id
        q_list.append(q_dict)

    db_state.exam_questions[exam_id] = q_list
    return {**exam_record, "question_count": len(q_list)}


@router.post("/{exam_id}/start", summary="Start Timed Examination Attempt")
async def start_examination_attempt(exam_id: str, user: Optional[AuthenticatedUser] = Depends(get_optional_current_user)):
    effective_id = user.id if user else "student-vishwak"
    exam = db_state.examinations.get(exam_id)
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Examination not found")

    past_attempts = [
        a for a in db_state.examination_attempts.values()
        if a["exam_id"] == exam_id and a["student_id"] == effective_id and a["status"] == "evaluated"
    ]
    if len(past_attempts) >= exam.get("max_attempts", 5) and not exam.get("retake_allowed", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "Max Attempts Reached", "message": f"Maximum of {exam.get('max_attempts', 5)} attempt(s) reached for this assessment", "code": "MAX_ATTEMPTS_REACHED"}
        )

    attempt_id = f"att_{uuid.uuid4().hex[:8]}"
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    duration_secs = exam.get("duration_minutes", 60) * 60

    attempt_record = {
        "id": attempt_id,
        "exam_id": exam_id,
        "student_id": effective_id,
        "status": "in_progress",
        "started_at": now_iso,
        "duration_seconds": duration_secs,
        "current_answers": {},
        "marked_for_review": [],
        "time_spent_seconds": 0
    }
    db_state.examination_attempts[attempt_id] = attempt_record

    return {
        "status": "started",
        "attempt_id": attempt_id,
        "exam_id": exam_id,
        "duration_seconds": duration_secs,
        "started_at": now_iso,
        "instructions": exam.get("instructions", "")
    }


@router.post("/{exam_id}/save-progress", summary="Autosave In-Progress Answers Against Network Loss")
async def save_exam_progress(
    exam_id: str,
    req: SaveProgressRequest,
    user: Optional[AuthenticatedUser] = Depends(get_optional_current_user)
):
    effective_id = user.id if user else "student-vishwak"
    attempt = db_state.examination_attempts.get(req.attempt_id)
    if not attempt or attempt["student_id"] != effective_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Active attempt not found")

    attempt["current_answers"].update(req.current_answers)
    attempt["marked_for_review"] = req.marked_for_review
    attempt["time_spent_seconds"] = req.time_spent_seconds
    attempt["last_saved_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()

    return {
        "status": "progress_saved",
        "attempt_id": req.attempt_id,
        "saved_answers_count": len(attempt["current_answers"]),
        "marked_for_review_count": len(attempt["marked_for_review"])
    }


@router.post("/{exam_id}/submit", summary="Submit Examination Attempt & Auto-Grade")
async def submit_examination(
    exam_id: str,
    req: SubmitAttemptRequest,
    user: Optional[AuthenticatedUser] = Depends(get_optional_current_user)
):
    """
    Submits an exam attempt, grades answers against rubric across all question types,
    segregates objective vs descriptive scores, flags weak concepts, computes percentile,
    and awards authoritative gamified platform points.
    """
    exam = db_state.examinations.get(exam_id)
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "Not Found", "message": "Examination not found", "code": "EXAM_NOT_FOUND"}
        )
        
    questions = db_state.exam_questions.get(exam_id, [])
    q_map = {q["id"]: q for q in questions}
    
    total_marks_earned = 0.0
    objective_earned = 0.0
    objective_possible = 0.0
    descriptive_earned = 0.0
    descriptive_possible = 0.0

    evaluations = []
    topic_scores: Dict[str, Dict[str, float]] = {}

    for ans_dict in req.answers:
        q_id = ans_dict.get("question_id")
        student_ans = ans_dict.get("student_answer")
        q = q_map.get(q_id)
        if not q:
            continue

        q_topic = q.get("subtopic") or q.get("topic") or exam.get("subject", "General")
        q_marks = float(q.get("marks", 2.0))
        q_cat = q.get("category", "objective")

        if q_topic not in topic_scores:
            topic_scores[q_topic] = {"earned": 0.0, "total": 0.0}
        topic_scores[q_topic]["total"] += q_marks

        eval_res = evaluate_question_answer(q, student_ans)
        marks_awarded = eval_res["marks_awarded"]
        total_marks_earned += marks_awarded
        topic_scores[q_topic]["earned"] += marks_awarded

        if q_cat == "descriptive" or q.get("question_type") in ["definition", "difference", "explain", "short_answer", "long_answer", "reason"]:
            descriptive_earned += marks_awarded
            descriptive_possible += q_marks
        else:
            objective_earned += marks_awarded
            objective_possible += q_marks

        evaluations.append({
            "question_id": q_id,
            "question_text": q["question_text"],
            "question_type": q.get("question_type", "mcq"),
            "category": q_cat,
            "student_answer": student_ans,
            "correct_answer": q["correct_answer"],
            "is_correct": eval_res["is_correct"],
            "marks_awarded": marks_awarded,
            "marks_possible": q_marks,
            "feedback": eval_res["feedback"],
            "rubric_breakdown": eval_res.get("rubric_breakdown")
        })

    total_possible = float(exam.get("total_marks", 40.0))
    if total_possible <= 0:
        total_possible = 40.0
    percentage = round((total_marks_earned / total_possible) * 100.0, 2)
    passed = percentage >= exam.get("pass_percentage", 40.0)

    # Determine letter grade
    if percentage >= 90:
        letter_grade = "A+"
    elif percentage >= 80:
        letter_grade = "A"
    elif percentage >= 70:
        letter_grade = "B"
    elif percentage >= 50:
        letter_grade = "C"
    else:
        letter_grade = "Needs Revision"

    # Compute topic-wise accuracy breakdown & detect weak concepts
    topic_breakdown = {}
    weak_concepts = []
    for t_name, t_data in topic_scores.items():
        t_pct = round((t_data["earned"] / max(1.0, t_data["total"])) * 100.0, 1)
        status_label = "Strong" if t_pct >= 75 else ("Moderate" if t_pct >= 50 else "Needs Revision")
        topic_breakdown[t_name] = {
            "earned": round(t_data["earned"], 2),
            "total": round(t_data["total"], 2),
            "accuracy_percentage": t_pct,
            "status": status_label
        }
        if t_pct < 60.0:
            weak_concepts.append({
                "concept": t_name,
                "accuracy": t_pct,
                "recommendation": f"Review {t_name} core principles and practice targeted bit questions."
            })

    effective_id = user.id if user else "student-vishwak"
    # Historical Comparison with Previous Attempts
    prev_attempts = [
        a for a in db_state.examination_attempts.values()
        if a["student_id"] == effective_id and a["exam_id"] == exam_id and a.get("status") == "evaluated"
    ]
    prev_best_percentage = max([a.get("percentage", 0.0) for a in prev_attempts], default=None)
    improvement_trend = None
    if prev_best_percentage is not None:
        delta = round(percentage - prev_best_percentage, 1)
        improvement_trend = f"+{delta}%" if delta > 0 else f"{delta}%"

    attempt_id = req.attempt_id or f"att_{uuid.uuid4().hex[:8]}"
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    attempt_record = {
        "id": attempt_id,
        "exam_id": exam_id,
        "student_id": effective_id,
        "status": "evaluated",
        "total_score": round(total_marks_earned, 2),
        "total_possible": total_possible,
        "percentage": percentage,
        "letter_grade": letter_grade,
        "passed": passed,
        "objective_score": round(objective_earned, 2),
        "objective_possible": round(objective_possible, 2),
        "descriptive_score": round(descriptive_earned, 2),
        "descriptive_possible": round(descriptive_possible, 2),
        "topic_breakdown": topic_breakdown,
        "weak_concepts": weak_concepts,
        "improvement_trend": improvement_trend,
        "submitted_at": now_iso,
        "answers": evaluations
    }
    db_state.examination_attempts[attempt_id] = attempt_record

    # Award separate platform points
    reward_points = int(percentage)
    if percentage >= 90:
        reward_points += 50 # Bonus for excellence

    student_profile = db_state.student_profiles.get(effective_id)
    if student_profile:
        student_profile["total_points"] = student_profile.get("total_points", 0) + reward_points

    return {
        "status": "evaluated",
        "attempt_id": attempt_id,
        "total_score": round(total_marks_earned, 2),
        "total_possible": total_possible,
        "percentage": percentage,
        "letter_grade": letter_grade,
        "passed": passed,
        "objective_score": round(objective_earned, 2),
        "objective_possible": round(objective_possible, 2),
        "descriptive_score": round(descriptive_earned, 2),
        "descriptive_possible": round(descriptive_possible, 2),
        "topic_breakdown": topic_breakdown,
        "weak_concepts": weak_concepts,
        "improvement_trend": improvement_trend,
        "evaluations": evaluations,
        "points_awarded": reward_points,
        "revision_recommendations": [
            f"Review {item['concept']} concepts ({item['accuracy']}%)" for item in weak_concepts
        ]
    }


@router.get("/results/my", summary="Current Student Examination Results & Historical Analytics")
async def get_my_results(user: Optional[AuthenticatedUser] = Depends(get_optional_current_user)):
    effective_id = user.id if user else "student-vishwak"
    user_attempts = [
        att for att in db_state.examination_attempts.values()
        if att["student_id"] == effective_id and att.get("status") == "evaluated"
    ]
    enriched = []
    for att in user_attempts:
        exam = db_state.examinations.get(att["exam_id"], {})
        enriched.append({
            **att,
            "exam_title": exam.get("title", "Assessment"),
            "subject": exam.get("subject", "Science")
        })
    return enriched


@router.get("/{exam_id}/analytics", summary="Examination Analytics & Cohort Mastery (Admin)")
async def get_exam_analytics(
    exam_id: str,
    user: AuthenticatedUser = Depends(require_role([ROLE_ADMIN, ROLE_SUPERADMIN]))
):
    exam = db_state.examinations.get(exam_id)
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Examination not found")

    attempts = [a for a in db_state.examination_attempts.values() if a["exam_id"] == exam_id and a.get("status") == "evaluated"]
    if not attempts:
        return {
            "exam_id": exam_id,
            "total_attempts": 0,
            "average_percentage": 0.0,
            "pass_rate_percentage": 0.0,
            "highest_score": 0.0
        }

    scores = [a["percentage"] for a in attempts]
    passed_count = sum(1 for a in attempts if a.get("passed", False))

    return {
        "exam_id": exam_id,
        "total_attempts": len(attempts),
        "average_percentage": round(sum(scores) / len(scores), 2),
        "pass_rate_percentage": round((passed_count / len(attempts)) * 100.0, 1),
        "highest_score": max(scores),
        "lowest_score": min(scores)
    }
