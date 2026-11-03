import re
import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger("knowledge_nexus.adaptation_engine")


class StudentAdaptationEngine:
    """
    Independent Student Learning Adaptation Engine.
    Provides targeted pedagogical scaffolding for 10 distinct learning difficulties:
    1. Spelling
    2. Reading
    3. Writing answers
    4. Understanding definitions
    5. Remembering information (Memory)
    6. Mathematical calculations
    7. Understanding diagrams
    8. Understanding long explanations
    9. Scientific concepts
    10. Following step-by-step solutions
    """

    # Educational Syllable and Pronunciation Lexicon for ICSE STEM & Humanities terms
    SYLLABARY_LEXICON: Dict[str, Dict[str, str]] = {
        "photosynthesis": {"parts": "pho-to-syn-the-sis", "pronounce": "foh-toh-SIN-thuh-sis", "root": "photo (light) + synthesis (putting together)"},
        "chlorophyll": {"parts": "chlo-ro-phyll", "pronounce": "KLOR-uh-fil", "root": "chloro (green) + phyll (leaf)"},
        "chloroplast": {"parts": "chlo-ro-plast", "pronounce": "KLOR-uh-plast", "root": "chloro (green) + plast (formed/cellular body)"},
        "transpiration": {"parts": "trans-pi-ra-tion", "pronounce": "tran-spuh-RAY-shun", "root": "trans (across) + spirare (to breathe)"},
        "mitosis": {"parts": "mi-to-sis", "pronounce": "my-TOH-sis", "root": "mitos (warp thread) referring to chromosome threads"},
        "meiosis": {"parts": "mei-o-sis", "pronounce": "my-OH-sis", "root": "meio (lessening) - halving the chromosome number"},
        "chromosome": {"parts": "chro-mo-some", "pronounce": "KROH-muh-sohm", "root": "chroma (color) + soma (body)"},
        "discriminant": {"parts": "dis-crim-i-nant", "pronounce": "dih-SKRIM-uh-nunt", "root": "discriminare (to distinguish between roots)"},
        "refraction": {"parts": "re-frac-tion", "pronounce": "rih-FRAK-shun", "root": "refringere (broken back or bent)"},
        "stoichiometry": {"parts": "stoi-chi-om-e-try", "pronounce": "stoy-kee-AH-muh-tree", "root": "stoicheion (element) + metron (measure)"},
        "electrolysis": {"parts": "e-lec-trol-y-sis", "pronounce": "ih-lek-TROL-uh-sis", "root": "electro (electric) + lysis (splitting)"},
        "nephron": {"parts": "neph-ron", "pronounce": "NEF-ron", "root": "nephros (kidney)"},
        "glomerulus": {"parts": "glo-mer-u-lus", "pronounce": "gloh-MARE-yoo-lus", "root": "glomus (ball of thread/yarn)"},
    }

    MNEMONICS_LIBRARY: Dict[str, str] = {
        "redox": "OIL RIG: Oxidation Is Loss of electrons, Reduction Is Gain of electrons.",
        "mitosis": "PMAT: Prophase (Prepare), Metaphase (Middle), Anaphase (Apart), Telophase (Two cells).",
        "spectrum": "VIBGYOR: Violet, Indigo, Blue, Green, Yellow, Orange, Red (increasing wavelength).",
        "trigonometry": "SOH CAH TOA: Sin = Opp/Hyp, Cos = Adj/Hyp, Tan = Opp/Adj.",
        "heart_circulation": "LORD: Left Oxygenated, Right Deoxygenated."
    }

    def generate_adaptations(
        self,
        topic: str,
        subject: str,
        grade: int,
        difficulties: List[str],
        explanation_text: str = "",
        math_steps: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Combines independent pedagogical adapters tailored to the student's declared difficulties.
        Ensures that multiple difficulties are supported harmoniously without sacrificing syllabus rigor.
        """
        active_diffs = set(d.lower().strip() for d in difficulties)
        result: Dict[str, Any] = {
            "applied_difficulties": list(active_diffs),
            "spelling_card": None,
            "reading_support": None,
            "writing_scaffold": None,
            "definition_breakdown": None,
            "memory_aids": None,
            "math_scaffolding": None,
            "diagram_callouts": None,
            "chunked_sections": None,
            "system_instruction_additions": [],
        }

        # 1. Spelling Support
        if any(d in active_diffs for d in ["spelling", "reading_difficult_words", "vocabulary"]):
            spelling_words = self._extract_difficult_spelling_words(topic, explanation_text)
            if spelling_words:
                result["spelling_card"] = {
                    "title": "Gentle Word-Building & Pronunciation Guide",
                    "words": spelling_words,
                    "practice_prompt": f"Practice writing: {spelling_words[0]['word']} (Syllables: {spelling_words[0]['parts']})",
                    "gentle_note": "Breaking long academic terms into syllables makes them easier to read and remember!"
                }
                result["system_instruction_additions"].append(
                    "SPELLING ADAPTATION: Identify tricky technical terms and break them into syllables with phonetic guides."
                )

        # 2. Reading Support
        if any(d in active_diffs for d in ["reading", "reading_difficult_words", "understanding_long_explanations"]):
            result["reading_support"] = {
                "reading_rule": "Sentences strictly capped to max 18 words. Paragraphs micro-chunked to 2 sentences.",
                "highlighted_terms": [topic.title()],
                "comprehension_checkpoint": f"Quick Check: What is the main job of {topic.title()} in simple words?",
            }
            result["system_instruction_additions"].append(
                "READING ADAPTATION: Use short sentences (under 18 words), bullet points, and an inline vocabulary glossary."
            )

        # 3. Writing Support
        if any(d in active_diffs for d in ["writing", "writing_answers"]):
            result["writing_scaffold"] = {
                "title": f"ICSE Exam Answer Template for {topic.title()}",
                "structure_steps": [
                    "1. Opening Sentence: State the exact standard definition clearly.",
                    "2. Mechanism / Key Points: Mention 2-3 specific scientific/historical points using required keywords.",
                    "3. Equation / Example: Provide the standard chemical/mathematical formula or historical date.",
                    "4. Conclusion / Significance: State the biological role or historical consequence."
                ],
                "model_answer_starter": f"In ICSE examinations, write: '{topic.title()} is defined as...'",
                "scoring_keywords": ["Cause and effect", "Essential keywords that examiners award marks for"]
            }
            result["system_instruction_additions"].append(
                "WRITING ADAPTATION: Provide a structured model answer template showing the student exactly how to format full-mark answers."
            )

        # 4. Definition Support
        if any(d in active_diffs for d in ["understanding_definitions", "definitions"]):
            result["definition_breakdown"] = {
                "title": f"3-Tier Definition Breakdown for {topic.title()}",
                "formal_icse_meaning": f"Authoritative academic definition preserved from ICSE syllabus for {topic.title()}.",
                "simplified_everyday_meaning": f"In daily life terms: What {topic.title()} does in simple words.",
                "analogy": f"Think of {topic.title()} like a familiar everyday mechanism.",
                "understanding_check": f"Can you rephrase the definition of {topic.title()} in your own words?"
            }
            result["system_instruction_additions"].append(
                "DEFINITION ADAPTATION: Present 3 tiers: 1) Precise formal ICSE definition, 2) Simple everyday translation, 3) Real-world analogy."
            )

        # 5. Memory Support
        if any(d in active_diffs for d in ["remembering_information", "memory"]):
            mnemonic = self._find_matching_mnemonic(topic, subject)
            result["memory_aids"] = {
                "mnemonic": mnemonic or f"Remember the core rule: Every key mechanism in {topic} has a clear trigger and result.",
                "revision_bullets": [
                    f"Core Fact: Focus on the primary purpose of {topic}.",
                    f"Key Traps: Avoid confusing terms that sound similar.",
                    f"Quick Recall: Review this concept again in 24 hours using flashcards."
                ],
                "flashcard_pair": {
                    "front": f"What are the key elements of {topic}?",
                    "back": f"Definition, main mechanism, and one standard ICSE example."
                }
            }
            result["system_instruction_additions"].append(
                "MEMORY ADAPTATION: Include a memorable mnemonic, high-yield takeaway revision bullets, and a flashcard pair."
            )

        # 6. Mathematics Support
        if any(d in active_diffs for d in ["mathematical_calculations", "following_step_by_step_solutions"]):
            result["math_scaffolding"] = {
                "rule": "Every step must show explicit arithmetic without jumping steps. State the reason for each operation.",
                "formula_highlight": "Always write down the general formula first before substituting numbers.",
                "verification_prompt": "After finding the answer, substitute it back into the original equation to check correctness."
            }
            result["system_instruction_additions"].append(
                "MATH ADAPTATION: Break down every step completely; explain the 'Why' behind each algebraic/arithmetic operation."
            )

        # 7. Diagram Support
        if any(d in active_diffs for d in ["understanding_diagrams", "diagrams"]):
            result["diagram_callouts"] = {
                "strategy": "Break diagram into numbered parts, explain function of each part separately.",
                "focus_component": "Highlight the active component currently being explained.",
            }
            result["system_instruction_additions"].append(
                "DIAGRAM ADAPTATION: Clearly list and explain diagram labels one by one with their specific functions."
            )

        # 8. Long Explanation / Chunking Support
        if any(d in active_diffs for d in ["understanding_long_explanations", "step_by_step_solutions"]):
            result["system_instruction_additions"].append(
                "CHUNKED EXPLANATION: Present one sub-concept at a time with clear sectional headings and self-contained checkpoints."
            )

        return result

    def _extract_difficult_spelling_words(self, topic: str, text: str) -> List[Dict[str, str]]:
        words_found = []
        combined = f"{topic} {text}".lower()
        for term, data in self.SYLLABARY_LEXICON.items():
            if term in combined:
                words_found.append({
                    "word": term.title(),
                    "parts": data["parts"],
                    "pronounce": data["pronounce"],
                    "root": data["root"]
                })
        # If none matched from dictionary, generate rule-based syllabification for topic
        if not words_found and len(topic) > 6:
            parts = "-".join([topic[i:i+3] for i in range(0, len(topic), 3)])
            words_found.append({
                "word": topic.title(),
                "parts": parts,
                "pronounce": topic.lower(),
                "root": f"Key ICSE academic term: {topic.title()}"
            })
        return words_found[:3]

    def _find_matching_mnemonic(self, topic: str, subject: str) -> Optional[str]:
        t_low = topic.lower()
        s_low = subject.lower()
        if "redox" in t_low or "oxidation" in t_low or "reduction" in t_low:
            return self.MNEMONICS_LIBRARY["redox"]
        if "mitosis" in t_low or "cell division" in t_low:
            return self.MNEMONICS_LIBRARY["mitosis"]
        if "light" in t_low or "spectrum" in t_low or "refraction" in t_low:
            return self.MNEMONICS_LIBRARY["spectrum"]
        if "trig" in t_low or "sin" in t_low or "cos" in t_low:
            return self.MNEMONICS_LIBRARY["trigonometry"]
        if "heart" in t_low or "circulation" in t_low:
            return self.MNEMONICS_LIBRARY["heart_circulation"]
        return None


adaptation_engine = StudentAdaptationEngine()
