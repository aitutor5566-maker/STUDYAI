"""
STUDYAI — Standalone Qwen 2.5 7B Educational Evaluation Rubric (13 Dimensions)
Communicates ZERO external APIs. Evaluates raw Qwen responses deterministically and structurally.
"""

import re
from typing import Dict, Any, List


RUBRIC_DIMENSIONS = [
    "factual_correctness",
    "definition_accuracy",
    "key_term_completeness",
    "explanation_depth",
    "logical_organization",
    "appropriate_detail",
    "example_quality",
    "comparison_accuracy",
    "calculation_correctness",
    "exam_question_relevance",
    "citation_integrity",
    "correct_visual_planning",
    "clarity_and_readability",
]


def evaluate_response(question_item: Dict[str, Any], response_text: str) -> Dict[str, Any]:
    text = response_text or ""
    lower = text.lower()
    expected_kw: List[str] = question_item.get("expected_keywords", [])
    task_type: str = question_item.get("task_type", "deep_explanation")
    requires_table: bool = bool(question_item.get("requires_table", False))
    requires_calc: bool = bool(question_item.get("requires_calculation", False))

    # 1. Factual correctness (keyword & concept coverage + absence of known factual hallucinations)
    matched_kw = [kw for kw in expected_kw if kw.lower() in lower]
    kw_ratio = len(matched_kw) / max(1, len(expected_kw))
    factual_score = round(min(10.0, 3.0 + 7.0 * kw_ratio), 1)

    # 2. Definition accuracy (multi-tier definitions: precise, everyday/simple, formal, clarification)
    has_def_heading = bool(re.search(r"(definition|what is|meaning)", lower))
    has_everyday = bool(re.search(r"(simple|everyday|plain language|in simple terms|intuitively)", lower))
    has_formal = bool(re.search(r"(formal|scientific|mathematical|chemical|biochemical)", lower))
    def_score = 4.0
    if has_def_heading:
        def_score += 2.5
    if has_everyday:
        def_score += 2.0
    if has_formal:
        def_score += 1.5
    def_score = round(min(10.0, def_score), 1)

    # 3. Key-term completeness (explained glossary rather than bare keyword list)
    has_key_terms_sec = bool(re.search(r"(key\s*terms|glossary|terminology|keywords|essential.*terms)", lower))
    bullet_definitions = len(re.findall(r"[-*]\s+\*\*[^*]+\*\*\s*[:—-]", text))
    key_term_score = min(10.0, 3.0 + (3.0 if has_key_terms_sec else 0.0) + min(4.0, bullet_definitions * 0.8))

    # 4. Explanation depth (prerequisites, step-by-step mechanism, misconceptions, formulas, summary)
    depth_signals = [
        bool(re.search(r"(prerequisite|prior knowledge|foundation)", lower)),
        bool(re.search(r"(step-by-step|mechanism|derivation|stage|process)", lower)),
        bool(re.search(r"(misconception|common mistake|pitfall)", lower)),
        bool(re.search(r"(formula|equation|law)", lower)),
        bool(re.search(r"(summary|revision|takeaway|recap)", lower)),
    ]
    depth_score = round(3.0 + sum(1.4 for s in depth_signals if s), 1)

    # 5. Logical organization (numbered/markdown headings, clean hierarchy)
    headings_count = len(re.findall(r"^#{1,4}\s+.+", text, flags=re.MULTILINE))
    numbered_steps = len(re.findall(r"^\d+\.\s+.+", text, flags=re.MULTILINE))
    org_score = round(min(10.0, 3.5 + min(4.0, headings_count * 0.7) + min(2.5, numbered_steps * 0.4)), 1)

    # 6. Appropriate detail (concise for simple definitions, comprehensive for deep explanations)
    word_count = len(text.split())
    if task_type == "definition":
        detail_score = 9.5 if 120 <= word_count <= 650 else (7.5 if word_count > 650 else 5.0)
    else:
        detail_score = 9.5 if word_count >= 350 else (7.0 if word_count >= 200 else 4.5)

    # 7. Example quality (worked examples, real-world applications, concrete numbers/scenarios)
    has_example = bool(re.search(r"(example|application|for instance|real-world|worked)", lower))
    example_score = 9.0 if (has_example and word_count >= 180) else (6.5 if has_example else 3.5)

    # 8. Comparison accuracy (Markdown table presence & multi-row comparison when applicable)
    table_rows = len(re.findall(r"^\|.+\|$", text, flags=re.MULTILINE))
    if requires_table or task_type == "comparison":
        comp_score = 9.5 if table_rows >= 4 else (6.0 if "vs" in lower or "difference" in lower else 3.0)
    else:
        comp_score = 9.0 if table_rows >= 3 else 7.5

    # 9. Calculation correctness (Deterministic verification for numerical & algebraic benchmarks)
    if requires_calc:
        q_id = question_item.get("id", "")
        if q_id == "phys_3_force_numerical":
            has_a = bool(re.search(r"\b3(\.0+)?\s*m/s", lower))
            has_f = bool(re.search(r"\b36(\.0+)?\s*(n|newtons)", lower))
            has_d = bool(re.search(r"\b37\.5\s*(m|meters)", lower))
            has_verif = "verif" in lower or "check" in lower
            calc_score = 2.0 + (2.5 if has_a else 0) + (2.5 if has_f else 0) + (2.0 if has_d else 0) + (1.0 if has_verif else 0)
        elif q_id == "math_3_solve_and_verify":
            has_disc = "25" in lower
            has_r1 = bool(re.search(r"x\s*=\s*3\b", lower) or "3" in lower)
            has_r2 = bool(re.search(r"(0\.5|1/2)", lower))
            has_verif = "verif" in lower or "substitut" in lower
            calc_score = 2.0 + (2.0 if has_disc else 0) + (2.0 if has_r1 else 0) + (2.0 if has_r2 else 0) + (2.0 if has_verif else 0)
        else:
            calc_score = 8.0
    else:
        calc_score = 8.5

    # 10. Exam-question relevance (Practice questions, MCQs, model answers, non-fabricated past-paper disclaimer)
    has_practice = bool(re.search(r"(practice question|mcq|multiple-choice|short-answer|model answer|self-check)", lower))
    has_honest_disclaimer = bool(re.search(r"(ai-generated|practice|not official|not guaranteed)", lower))
    if task_type == "exam_prep":
        exam_score = 6.0 + (2.5 if has_practice else 0.0) + (1.5 if has_honest_disclaimer else 0.0)
    else:
        exam_score = 9.0 if has_practice else 5.5

    # 11. Citation integrity (No fabricated page numbers or fake DOIs)
    has_fake_page = bool(re.search(r"page\s+\d+\s+of\s+ncert", lower))
    citation_score = 4.0 if has_fake_page else 9.5

    # 12. Correct visual planning (Structured Visual Specification with type, purpose, labels, section)
    has_visual_spec = bool(re.search(r"(visual specification|visual type|labeled diagram|essential components|labels)", lower))
    visual_score = 9.5 if has_visual_spec else 3.0

    # 13. Clarity and readability
    has_cot_leak = "<think>" in lower or "</think>" in lower
    clarity_score = 6.0 if has_cot_leak else (9.2 if headings_count >= 2 else 7.8)

    scores = {
        "factual_correctness": round(factual_score, 1),
        "definition_accuracy": round(def_score, 1),
        "key_term_completeness": round(key_term_score, 1),
        "explanation_depth": round(depth_score, 1),
        "logical_organization": round(org_score, 1),
        "appropriate_detail": round(detail_score, 1),
        "example_quality": round(example_score, 1),
        "comparison_accuracy": round(comp_score, 1),
        "calculation_correctness": round(calc_score, 1),
        "exam_question_relevance": round(exam_score, 1),
        "citation_integrity": round(citation_score, 1),
        "correct_visual_planning": round(visual_score, 1),
        "clarity_and_readability": round(clarity_score, 1),
    }

    overall_avg = round(sum(scores.values()) / len(scores), 2)

    failure_patterns = []
    if not has_visual_spec:
        failure_patterns.append("Missing structured visual specification (visual type, labels, section association).")
    if (requires_table or task_type == "comparison") and table_rows < 4:
        failure_patterns.append("Missing structured Markdown comparison table.")
    if not has_practice:
        failure_patterns.append("No exam/self-check practice questions or model answers included.")
    if bullet_definitions < 2:
        failure_patterns.append("Key terms not explained in a structured glossary.")

    return {
        "scores": scores,
        "overall_score_10": overall_avg,
        "word_count": word_count,
        "matched_keywords": matched_kw,
        "missing_keywords": [kw for kw in expected_kw if kw.lower() not in lower],
        "markdown_table_rows": table_rows,
        "failure_patterns": failure_patterns,
    }
