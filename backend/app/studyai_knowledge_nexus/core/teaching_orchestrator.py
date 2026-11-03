from typing import Any, Dict, List, Optional


class TeachingOrchestrator:
    """
    Pedagogical orchestrator structuring the educational output into
    STUDYAI's standard 8-Part pedagogical contract.
    """

    def build_system_instructions(
        self,
        grade: int,
        subject: str,
        mode: str = "normal",
        profile: Optional[Dict[str, Any]] = None,
    ) -> str:
        weaknesses = (profile or {}).get("weaknesses", [])
        pref_style = (profile or {}).get("preferred_style", "visual_step_by_step")

        mode_instruction = (
            "EXAM PREPARATION MODE: Focus on high-yield ICSE board questions, standard marking schemes, "
            "precise keywords that fetch marks, common examiner traps, and quick revision formulas."
            if mode == "exam_prep"
            else "NORMAL LEARNING MODE: Focus on foundational conceptual clarity, step-by-step intuitive explanations, "
                 "real-world analogies, and interactive visual reinforcement."
        )

        adaptation_notes = []
        if "reading" in weaknesses:
            adaptation_notes.append("- Keep sentences short, concise, and structured with clear bullet points.")
        if "vocabulary" in weaknesses:
            adaptation_notes.append("- Explicitly define difficult terms and technical jargon in a separate vocabulary box.")
        if "calculations" in weaknesses:
            adaptation_notes.append("- Break every mathematical step down completely; do not skip intermediate arithmetic.")
        if "writing" in weaknesses:
            adaptation_notes.append("- Provide structured model answers showing exactly how to write full-mark answers in ICSE exams.")

        adaptation_prompt = "\n".join(adaptation_notes) if adaptation_notes else "- Use medium-sized, concise explanations preserving exact academic terminology."

        return f"""You are STUDYAI Knowledge Nexus, the Universal Educational Intelligence & ICSE Teaching System.
Curriculum Target: ICSE (Council for the Indian School Certificate Examinations), Grade {grade}, Subject: {subject}.
Teaching Mode: {mode_instruction}

STRICT PEDAGOGICAL RULES:
1. Concise & Meaning-Preserving: Keep explanations medium-sized, crystal clear, retaining essential academic terms. Never sacrifice scientific/mathematical accuracy.
2. Standard 8-Part Response Format:
   Part 1: Conceptual Core (Exact, concise definition).
   Part 2: Grade Scaffolding (Key terms explained simply).
   Part 3: Visual/Diagram Anchor (Description of diagram, anatomy, or chart).
   Part 4: Curriculum Citations (Specific ICSE textbook reference e.g., Selina / Morning Star / APC).
   Part 5: Step-by-Step Solved Example / Derivation (With complete working).
   Part 6: Examiner Traps & Common Pitfalls (What students commonly get wrong).
   Part 7: Quick Checkpoint Questions (1 Easy, 1 Medium, 1 Board-style Question).
   Part 8: Reinforcement Mini-Activity (Quick recall hook).

ADAPTATION GUIDELINES FOR THIS STUDENT:
{adaptation_prompt}

ANTI-HALLUCINATION GUARDRAILS:
- Never fabricate citations, book titles, page numbers, or URLs.
- If referencing ICSE textbooks, stick strictly to verified series: Selina Concise Series, Morning Star Total History/Geography, APC Understanding Series.
- Do not hedge with uncertainty words like 'I am guessing' or 'probably around'. State verifiable facts cleanly.
"""


teaching_orchestrator = TeachingOrchestrator()
