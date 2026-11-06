import re
import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger("knowledge_nexus.teacher_pedagogy")

# Multilingual scientific translation and explanation templates
MULTILINGUAL_HOOKS = {
    "te": {
        "welcome": "హలో! మన {subject} పాఠ్యాంశానికి స్వాగతం. ఈరోజు మనం {topic} గురించి వివరంగా తెలుసుకుందాం.",
        "foundation": "ముందుగా, ఈ అంశాన్ని పూర్తిగా అర్థం చేసుకోవడానికి అవసరమైన ప్రాథమిక విషయాలను పరిశీలిద్దాం.",
        "definition": "పాఠ్యపుస్తక శాస్త్రీయ నిర్వచనాన్ని చూద్దాం: {academic_def}. సులభంగా చెప్పాలంటే, {simplified_def}.",
        "formula": "ఇక్కడ ముఖ్యమైన గణిత సూత్రం {formula_spoken}.",
        "diagram": "మీ స్క్రీన్ పై ఉన్న 3D నమూనా లేదా రేఖాచిత్రాన్ని గమనించండి: {diagram_desc}.",
        "summary": "బాగా అర్థం చేసుకున్నారు! ఈరోజు మనం {topic} యొక్క ముఖ్య భావనలు మరియు సూత్రాలను నేర్చుకున్నాం."
    },
    "hi": {
        "welcome": "नमस्ते! हमारे {subject} सत्र में आपका स्वागत है। आज हम {topic} के बारे में गहराई से समझेंगे।",
        "foundation": "मुख्य अवधारणा को समझने से पहले, आइए इसके लिए आवश्यक बुनियादी बातों को देख लेते हैं।",
        "definition": "पाठ्यपुस्तक की वैज्ञानिक परिभाषा इस प्रकार है: {academic_def}। सरल शब्दों में, {simplified_def}।",
        "formula": "यहाँ हमारा प्रमुख सूत्र है {formula_spoken}।",
        "diagram": "स्क्रीन पर प्रदर्शित 3D मॉडल अथवा चित्र को ध्यान से देखिए: {diagram_desc}।",
        "summary": "बहुत बढ़िया! आज आपने {topic} की प्रमुख संरचना, क्रियाविधि और परीक्षा संबंधी मुख्य बिंदुओं को पूरी तरह समझ लिया है।"
    },
    "ur": {
        "welcome": "ہیلو! ہمارے تعلیمی سیشن میں خوش آمدید۔ آج ہم {topic} کا تفصیلی جائزہ لیں گے۔",
        "foundation": "آگے بڑھنے سے پہلے، بنیادی معلومات کا جائزہ لینا ضروری ہے۔",
        "definition": "درسی کتاب کی تعریف: {academic_def}۔ آسان الفاظ میں، {simplified_def}۔",
        "formula": "یہاں بنیادی فارمولا ہے {formula_spoken}۔",
        "diagram": "اسکرین پر موجود تصویر یا ماڈل کو غور سے دیکھیں: {diagram_desc}۔",
        "summary": "شاندار! آپ نے {topic} کے اہم نکات کو کامیابی سے سمجھ لیا ہے۔"
    },
    "ml": {
        "welcome": "നമസ്കാരം! നമ്മുടെ {subject} ക്ലാസിലേക്ക് സ്വാഗതം. ഇന്ന് നാം {topic} വിശദമായി പഠിക്കാൻ പോകുന്നു.",
        "foundation": "പ്രധാന ആശയത്തിലേക്ക് കടക്കുന്നതിന് മുൻപ്, ഇതിനാവശ്യമായ അടിസ്ഥാന കാര്യങ്ങൾ മനസ്സിലാക്കാം.",
        "definition": "ശാസ്ത്രീയ നിർവചനം: {academic_def}. ലളിതമായി പറഞ്ഞാൽ, {simplified_def}.",
        "formula": "ഇവിടെ ഉപയോഗിക്കുന്ന പ്രധാന സൂത്രവാക്യം {formula_spoken}.",
        "diagram": "സ്‌ക്രീനിലെ 3D മോഡൽ അല്ലെങ്കിൽ ഡയഗ്രം ശ്രദ്ധിക്കുക: {diagram_desc}.",
        "summary": "വളരെ നല്ലത്! {topic} എന്ന വിഷയത്തിലെ പ്രധാന ആശയങ്ങൾ നിങ്ങൾ മനസ്സിലാക്കിക്കഴിഞ്ഞു."
    }
}


def naturalize_formula_speech(formula_str: str) -> str:
    """
    Translates raw mathematical / LaTeX expressions into natural spoken sentences.
    e.g. 'P = W / t' -> 'P equals W divided by T'
         'F = m * a' -> 'F equals mass M multiplied by acceleration A'
         'KE = 1/2 m v^2' -> 'Kinetic Energy equals half of mass M times velocity V squared'
         'V = 1/3 * pi * r^2 * h' -> 'Volume V equals one-third of pi times radius R squared times height H'
    """
    if not formula_str:
        return ""
    
    text = formula_str.strip()
    # Normalize LaTeX symbols
    text = re.sub(r"\\cdot|\*", " multiplied by ", text)
    text = re.sub(r"\\frac\{1\}\{2\}|1/2", " half of ", text)
    text = re.sub(r"\\frac\{1\}\{3\}|1/3", " one-third of ", text)
    text = re.sub(r"\\pi|\bpi\b", "pi", text)
    text = re.sub(r"\\times", " times ", text)
    text = re.sub(r"\^2", " squared", text)
    text = re.sub(r"\^3", " cubed", text)
    text = re.sub(r"\\Delta", "change in ", text)
    text = re.sub(r"\s*/\s*", " divided by ", text)
    text = re.sub(r"\s*=\s*", " equals ", text)
    text = re.sub(r"\s*\+\s*", " plus ", text)
    text = re.sub(r"\s*-\s*", " minus ", text)

    # Clean double spaces
    text = re.sub(r"\s+", " ", text).strip()
    return text


class TeacherPedagogyEngine:
    """
    Transforms structured AI Tutor educational content into a 15-stage Classroom Teacher
    Voice sequence matching the AI Tutor's exact layout.
    """

    def construct_teacher_curriculum(
        self,
        topic: str,
        subject: str,
        grade: int,
        mode: str,
        depth: str,
        language: str,
        tutor_structured: Optional[Dict[str, Any]] = None,
        tutor_content: Optional[str] = None,
        k_record: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Synthesizes structured teaching sections based on:
        - AI Tutor's actual response
        - Knowledge Library canonical record
        - Requested depth: 'quick' (4 sections), 'standard' (7 sections),
          'detailed' (10 sections), 'complete_teacher' (up to 14 sections).
        """
        s = tutor_structured or {}
        k = k_record or {}
        clean_topic = topic.strip()
        topic_title = clean_topic.title()
        is_exam_mode = (mode == "exam_prep")

        # 1. Extract Educational Components faithfully from AI Tutor & Knowledge Library
        academic_def = (
            s.get("formal_definition")
            or (s.get("definitions", [{}])[0].get("definition") if s.get("definitions") else None)
            or k.get("definition_academic")
            or f"{clean_topic} is a core academic principle in {subject}."
        )
        simplified_def = (
            s.get("simplified_definition")
            or s.get("simpleExplanation")
            or k.get("definition_simplified")
            or f"A fundamental principle explaining {clean_topic} in clear everyday terms."
        )

        key_terms = s.get("important_terminology") or s.get("definitions") or k.get("key_terms") or []
        facts = s.get("core_mechanism_steps") or s.get("keySteps") or k.get("facts") or [f"{clean_topic} operates under strict physical/biological laws."]
        formulae = s.get("numerical_worked_examples") or s.get("formula") or k.get("formulae") or []
        examples = s.get("numerical_worked_examples") or s.get("worked_examples") or k.get("examples") or []
        differences = s.get("differences") or ({"rows": []})
        misconceptions = s.get("common_misconceptions") or s.get("misconceptions") or k.get("misconceptions") or []
        exam_questions = s.get("checkpoint_question") or s.get("examQuestions") or k.get("practice_questions") or []
        real_world = s.get("real_world_application") or s.get("real_world") or k.get("real_world_application")

        # 3D Model / Diagram visual metadata
        model_key = s.get("modelKey") or (k.get("visual_recommendation", {}).get("model_key"))
        if not model_key and ("heart" in clean_topic.lower() or "cardiac" in clean_topic.lower()):
            model_key = "human-heart"

        visual_anchor = {
            "type": "threejs_3d_model" if model_key else "diagram",
            "model_key": model_key,
            "svg": s.get("diagramSvg"),
            "caption": f"Visual Explanation for {topic_title}"
        }

        sections: List[Dict[str, Any]] = []

        # ----------------------------------------------------------------------
        # STAGE 1: INTRODUCE THE TOPIC (Multilingual Support)
        # ----------------------------------------------------------------------
        intro_text = (
            f"Hello and welcome to our {subject} session for Grade {grade}. Today, we are going to explore {topic_title}. "
            f"By the end of this lesson, you will clearly understand how this concept operates, why it is fundamental to {subject}, "
            f"and how to answer related examination questions with confidence."
        )
        if is_exam_mode:
            intro_text = (
                f"Welcome to your exam preparation coaching on {topic_title}. In {subject} examinations, questions on this topic "
                f"carry significant marks for precise definitions, accurate step sequences, and governing equations. "
                f"Let us master the exact keywords and examiners' expectations."
            )

        lang_lower = (language or "en").lower()
        if lang_lower in ("te", "telugu"):
            intro_text = f"మన {subject} పాఠ్యాంశానికి స్వాగతం! ఈరోజు మనం గ్రేడ్ {grade} కోసం {topic_title} గురించి వివరంగా తెలుసుకుందాం."
        elif lang_lower in ("hi", "hindi"):
            intro_text = f"हमारे {subject} सत्र में आपका स्वागत है! आज हम कक्षा {grade} के लिए {topic_title} का अध्ययन करेंगे।"
        elif lang_lower in ("ur", "urdu"):
            intro_text = f"ہمارے {subject} کے سبق میں خوش آمدید! آج ہم جماعت {grade} کے لیے {topic_title} کو تفصیل سے سمجھیں گے۔"
        elif lang_lower in ("ml", "malayalam"):
            intro_text = f"നമ്മുടെ {subject} പാഠത്തിലേക്ക് സ്വാഗതം! ഇന്ന് നമ്മൾ ഗ്രേഡ് {grade}-ന് {topic_title} വിശദമായി പഠിക്കും."
        sections.append({
            "section_id": "sec_intro",
            "type": "intro",
            "section_number": 1,
            "title": "Topic Introduction & Learning Goals",
            "teacher_speech": intro_text,
            "sentences": self._split_into_sentences(intro_text, visual_target="whole_model" if model_key else None),
            "visual": visual_anchor
        })

        # ----------------------------------------------------------------------
        # STAGE 2: EXPLAIN THE FOUNDATION & PREREQUISITES (Standard, Detailed, Complete)
        # ----------------------------------------------------------------------
        if depth in ("standard", "detailed", "complete_teacher"):
            foundation_text = s.get("foundational_prerequisite") or (
                f"Before we dive into the intricate details, let us anchor our foundational knowledge. "
                f"In {subject}, {clean_topic} builds upon prerequisite ideas of system stability, energy conservation, "
                f"and structural coordination. Understanding these prerequisites ensures you will never get confused by complex terms."
            )
            if not s.get("foundational_prerequisite"):
                if "heart" in clean_topic.lower():
                    foundation_text = (
                        "Before exploring how the heart beats, let us recall why our body requires circulation in the first place. "
                        "Every living cell in your body requires continuous oxygen and glucose for cellular respiration, and produces waste carbon dioxide. "
                        "Blood is the vehicle that carries these vital gases, and the heart is the continuous muscular pump that drives this transport."
                    )
                elif "work" in clean_topic.lower():
                    foundation_text = (
                        "Before calculating work done, remember the physical definition of force. "
                        "In daily speech, merely holding a heavy book feels like hard work. But in scientific physics, work is only performed "
                        "when an applied force successfully causes displacement in the direction of the force."
                    )
            sections.append({
                "section_id": "sec_foundation",
                "type": "prerequisites",
                "section_number": 2,
                "title": "Foundational Principles & Prerequisites",
                "teacher_speech": foundation_text,
                "sentences": self._split_into_sentences(foundation_text),
                "visual": visual_anchor
            })

        # ----------------------------------------------------------------------
        # STAGE 3: ACADEMIC DEFINITION & MEANING (All Depths)
        # ----------------------------------------------------------------------
        def_speech = (
            f"Let us read the formal textbook definition: {academic_def} "
            f"Now, let us unpack what this means in simple language: {simplified_def} "
            f"Notice how we preserve the exact scientific meaning without oversimplification."
        )
        sections.append({
            "section_id": "sec_definition",
            "type": "definitions",
            "section_number": 3,
            "title": "Academic Definition & Simplified Meaning",
            "teacher_speech": def_speech,
            "sentences": self._split_into_sentences(def_speech, visual_target="sa_node" if model_key == "human-heart" else None),
            "visual": visual_anchor
        })

        # ----------------------------------------------------------------------
        # STAGE 4: EXPLAIN EVERY IMPORTANT TERM (Detailed & Complete)
        # ----------------------------------------------------------------------
        if depth in ("detailed", "complete_teacher") and key_terms:
            term_lines = []
            term_sentences = []
            for idx, kt in enumerate(key_terms[:5]):
                if isinstance(kt, dict):
                    t_name = kt.get("term", "")
                    t_def = kt.get("meaning") or kt.get("definition", "")
                    t_pron = f" (pronounced {kt['pronunciation']})" if kt.get("pronunciation") else ""
                    sentence = f"The term '{t_name}'{t_pron} refers to: {t_def}."
                else:
                    t_name = str(kt)
                    sentence = f"The key term '{t_name}' is essential in understanding {topic_title}."
                term_lines.append(sentence)
                target_id = self._map_term_to_model_part(t_name)
                term_sentences.append({
                    "sentence_index": idx,
                    "text": sentence,
                    "highlight_target_id": target_id,
                    "action": "highlight"
                })

            terms_speech = "Let us master the essential terminology. " + " ".join(term_lines)
            sections.append({
                "section_id": "sec_terms",
                "type": "terminology",
                "section_number": 4,
                "title": "Essential Scientific Terminology",
                "teacher_speech": terms_speech,
                "sentences": term_sentences,
                "visual": visual_anchor
            })

        # ----------------------------------------------------------------------
        # STAGE 5: MAIN CONCEPT & STEP-BY-STEP MECHANISM (All Depths)
        # ----------------------------------------------------------------------
        mechanism_speech = ""
        mechanism_sents = []

        if "heart" in clean_topic.lower() and not s.get("core_mechanism_steps"):
            heart_steps = [
                ("Right Atrium Inflow", "First, deoxygenated blood from the body enters the Right Atrium through the superior and inferior vena cava.", "right_atrium"),
                ("Tricuspid Valve Aperture", "The Right Atrium contracts, pushing blood through the tricuspid valve into the Right Ventricle.", "tricuspid_valve"),
                ("Pulmonary Circuit", "The Right Ventricle contracts, pumping blood through the pulmonary artery to the lungs for oxygenation.", "pulmonary_artery"),
                ("Left Atrium Inflow", "Fresh oxygen-rich blood returns from the lungs via pulmonary veins into the Left Atrium.", "left_atrium"),
                ("Bicuspid Valve & Ventricular Filling", "Blood flows through the bicuspid or mitral valve into the powerful, thick-walled Left Ventricle.", "bicuspid_valve"),
                ("Systemic Aortic Output", "Finally, the Left Ventricle contracts forcefully, pumping oxygenated blood into the systemic Aorta to supply the entire body.", "aorta")
            ]
            mechanism_speech = "Now let us follow the complete step-by-step circulation mechanism. " + " ".join(st[1] for st in heart_steps)
            mechanism_sents = [
                {"sentence_index": i, "text": st[1], "highlight_target_id": st[2], "action": "highlight"}
                for i, st in enumerate(heart_steps)
            ]
        elif ("construct" in clean_topic.lower() or "triangle" in clean_topic.lower()) and not s.get("core_mechanism_steps"):
            construction_steps = [
                ("Base Line", "Step 1: Using your straightedge ruler, draw base line segment AB measuring exactly 6 centimetres.", "base_line"),
                ("Arc from A", "Step 2: Open your compass to radius 4 centimetres. Place the metal point at vertex A and draw a circular arc above the base.", "arc_a"),
                ("Arc from B", "Step 3: Open your compass to radius 5 centimetres. Place the compass point at vertex B and strike an intersecting arc.", "arc_b"),
                ("Triangle Join", "Step 4: Mark the precise intersection point as C. Using the ruler, join segment AC and segment BC. The triangle ABC is now fully constructed.", "triangle_join")
            ]
            mechanism_speech = "Let us follow the exact Euclidean compass and ruler drafting sequence. " + " ".join(cs[1] for cs in construction_steps)
            mechanism_sents = [
                {"sentence_index": i, "text": cs[1], "highlight_target_id": cs[2], "action": "highlight"}
                for i, cs in enumerate(construction_steps)
            ]
        else:
            facts_list = facts if facts else [f"The mechanism of {clean_topic} proceeds through coordinated sequential stages."]
            mechanism_speech = "Here is the step-by-step mechanism. " + " ".join(facts_list[:5])
            mechanism_sents = [
                {"sentence_index": i, "text": f, "highlight_target_id": self._map_term_to_model_part(f), "action": "highlight"}
                for i, f in enumerate(facts_list[:5])
            ]

        sections.append({
            "section_id": "sec_mechanism",
            "type": "core_mechanism",
            "section_number": 5,
            "title": "Detailed Step-by-Step Mechanism",
            "teacher_speech": mechanism_speech,
            "sentences": mechanism_sents,
            "visual": visual_anchor
        })

        # ----------------------------------------------------------------------
        # STAGE 6: GOVERNING FORMULAE & NUMERICALS (When Present)
        # ----------------------------------------------------------------------
        if formulae or "work" in clean_topic.lower() or "force" in clean_topic.lower() or "cone" in clean_topic.lower():
            formula_lines = []
            f_sents = []
            if isinstance(formulae, list) and len(formulae) > 0:
                for idx, f_item in enumerate(formulae[:3]):
                    if isinstance(f_item, dict):
                        f_name = f_item.get("title") or f_item.get("name", "Equation")
                        f_eq = f_item.get("spoken_formula") or f_item.get("formula_latex") or f_item.get("formula") or f_item.get("equation", "")
                        f_units = f_item.get("unit") or f_item.get("units", "SI Units")
                        spoken_eq = naturalize_formula_speech(f_eq)
                        text_line = f"Consider {f_name}: {spoken_eq}. Here, values are measured in {f_units}."
                        if f_item.get("given_values"):
                            text_line += f" Given: {f_item['given_values']}."
                        if f_item.get("arithmetic_result"):
                            text_line += f" Result: {f_item['arithmetic_result']}."
                    else:
                        text_line = f"Governing relation: {naturalize_formula_speech(str(f_item))}."
                    formula_lines.append(text_line)
                    f_sents.append({"sentence_index": idx, "text": text_line, "highlight_target_id": "formula_card", "action": "focus"})
            else:
                text_line = "In physics, Power equals Work divided by Time (P equals W divided by T), where work is in Joules, time in seconds, and power in Watts."
                formula_lines.append(text_line)
                f_sents.append({"sentence_index": 0, "text": text_line, "highlight_target_id": "formula_card", "action": "focus"})

            formula_speech = "Let us examine the governing mathematical formulae. " + " ".join(formula_lines)
            sections.append({
                "section_id": "sec_formula",
                "type": "formulae",
                "section_number": 6,
                "title": "Mathematical Formulae & Equation Analysis",
                "teacher_speech": formula_speech,
                "sentences": f_sents,
                "visual": visual_anchor
            })

        # ----------------------------------------------------------------------
        # STAGE 7: DIAGRAMS & 3D VISUAL EXPLANATION (Standard, Detailed, Complete)
        # ----------------------------------------------------------------------
        if depth in ("standard", "detailed", "complete_teacher"):
            v_walk = s.get("visual_3d_walkthrough")
            if v_walk and isinstance(v_walk, dict) and v_walk.get("guided_sequence"):
                seq_lines = []
                seq_sents = []
                for idx, step in enumerate(v_walk["guided_sequence"]):
                    p_id = step.get("part_id")
                    narr = step.get("spoken_narration")
                    seq_lines.append(narr)
                    seq_sents.append({
                        "sentence_index": idx,
                        "text": narr,
                        "highlight_target_id": p_id,
                        "action": "highlight"
                    })
                diagram_speech = "Let us perform a detailed interactive 3D visual walkthrough. " + " ".join(seq_lines)
                diagram_sents = seq_sents
            else:
                diagram_speech = (
                    f"Take a moment to inspect the visual on your screen. "
                    f"Notice how each component occupies a precise spatial location and serves a distinct functional role. "
                    f"Spatial coordination ensures that the entire system functions with maximum physiological and physical efficiency."
                )
                if model_key == "human-heart":
                    diagram_speech = (
                        "Look at the interactive 3D model of the human heart on your screen. "
                        "Notice the Right Atrium and Right Ventricle on the patient's right side, which appears on your left. "
                        "Observe the thick, powerful muscular myocardium enclosing the Left Ventricle at the apex. "
                        "The interventricular septum acts as an impermeable central wall, preventing any mixing of oxygenated and deoxygenated blood."
                    )
                diagram_sents = self._split_into_sentences(diagram_speech, visual_target="septum" if model_key == "human-heart" else None)

            sections.append({
                "section_id": "sec_diagram",
                "type": "visual_3d_walkthrough",
                "section_number": 7,
                "title": "Diagram & 3D Visual Walkthrough",
                "teacher_speech": diagram_speech,
                "sentences": diagram_sents,
                "visual": visual_anchor
            })

        # ----------------------------------------------------------------------
        # STAGE: WORKED EXAMPLES & PROBLEM SOLVING (Detailed & Complete)
        # ----------------------------------------------------------------------
        if depth in ("detailed", "complete_teacher") and (examples or depth == "complete_teacher"):
            eg_lines = []
            if examples and isinstance(examples, list) and len(examples) > 0:
                for idx, eg in enumerate(examples[:2]):
                    if isinstance(eg, dict):
                        eg_title = eg.get("title") or eg.get("question") or "Worked Example"
                        eg_sol = eg.get("arithmetic_result") or eg.get("solution") or eg.get("answer") or ""
                        eg_lines.append(f"In {eg_title}: Notice how the governing principles apply directly, resulting in {eg_sol}.")
                    else:
                        eg_lines.append(f"For instance, consider how {clean_topic} applies in: {str(eg)}.")
            else:
                eg_lines.append(f"Let us walk through a concrete example. In a laboratory investigation of {clean_topic}, measuring output changes under controlled conditions reveals direct linear proportionality.")

            eg_speech = "Let us explore an in-depth worked classroom example. " + " ".join(eg_lines)
            sections.append({
                "section_id": "sec_worked_example",
                "type": "worked_examples",
                "section_number": len(sections) + 1,
                "title": "Worked Classroom Example & Demonstration",
                "teacher_speech": eg_speech,
                "sentences": self._split_into_sentences(eg_speech),
                "visual": visual_anchor
            })

        # ----------------------------------------------------------------------
        # STAGE 8: REAL-WORLD APPLICATIONS (Detailed & Complete)
        # ----------------------------------------------------------------------
        if depth in ("detailed", "complete_teacher") and real_world:
            rw_text = f"In practical engineering, medicine, and the natural world, {topic_title} plays a pivotal role. {real_world}"
            sections.append({
                "section_id": "sec_real_world",
                "type": "real_world_application",
                "section_number": len(sections) + 1,
                "title": "Real-World Practical Applications",
                "teacher_speech": rw_text,
                "sentences": self._split_into_sentences(rw_text),
                "visual": visual_anchor
            })

        # ----------------------------------------------------------------------
        # STAGE 9: COMMON EXAMINATION TRAPS & PITFALLS (Detailed, Complete)
        # ----------------------------------------------------------------------
        if (depth in ("detailed", "complete_teacher") or is_exam_mode) and misconceptions:
            trap_lines = []
            trap_sents = []
            for idx, m in enumerate(misconceptions[:3]):
                if isinstance(m, dict):
                    trap = m.get("misconception", "")
                    corr = m.get("correction", "")
                    t_str = f"A frequent examination trap is believing that {trap}. The scientific reality is that {corr}."
                else:
                    t_str = f"Take note of this examination pitfall: {str(m)}."
                trap_lines.append(t_str)
                trap_sents.append({"sentence_index": idx, "text": t_str, "highlight_target_id": None, "action": "warning"})

            traps_speech = "Pay careful attention to common pitfalls where students lose examination marks. " + " ".join(trap_lines)
            sections.append({
                "section_id": "sec_pitfalls",
                "type": "pitfalls",
                "section_number": len(sections) + 1,
                "title": "Common Misconceptions & Examination Traps",
                "teacher_speech": traps_speech,
                "sentences": trap_sents,
                "visual": visual_anchor
            })

        # ----------------------------------------------------------------------
        # STAGE: PEDAGOGICAL SUMMARY & REVISION (Complete Teacher)
        # ----------------------------------------------------------------------
        if depth == "complete_teacher":
            summary_speech = (
                f"Before our final evaluation, let us quickly synthesize the master takeaways for {topic_title}. "
                f"First, remember the precise academic definition and fundamental terminology. "
                f"Second, trace the sequential cause-and-effect mechanism step by step. "
                f"Finally, ensure all units, signs, and physical conditions are explicitly accounted for in examination answers."
            )
            sections.append({
                "section_id": "sec_summary",
                "type": "summary",
                "section_number": len(sections) + 1,
                "title": "Comprehensive Summary & Pedagogical Takeaways",
                "teacher_speech": summary_speech,
                "sentences": self._split_into_sentences(summary_speech),
                "visual": visual_anchor
            })

        # ----------------------------------------------------------------------
        # STAGE 10: UNDERSTANDING CHECK & INTERACTIVE RECAP (All Depths)
        # ----------------------------------------------------------------------
        cp_dict = None
        if s.get("checkpoint_question") and isinstance(s["checkpoint_question"], dict):
            cp_dict = s["checkpoint_question"]
            checkpoint_q = cp_dict.get("spoken_prompt") or cp_dict.get("question", "")
            exp_keywords = ["option", "because", "thickest", "wall", "left ventricle", "newton"]
        else:
            checkpoint_q = f"What is one primary governing principle or output of {clean_topic}?"
            exp_keywords = ["force", "energy", "reaction", "water", "heat", "oxygen"]

            if "heart" in clean_topic.lower():
                checkpoint_q = "Which chamber of the heart has the thickest muscular wall and pumps blood into the aorta?"
                exp_keywords = ["left ventricle", "ventricle", "thick", "aorta"]
            elif "work" in clean_topic.lower():
                checkpoint_q = "If you apply force on a wall but it does not move, how much mechanical work is done?"
                exp_keywords = ["zero", "no work", "none", "0"]

        recap_speech = (
            f"To wrap up our lesson: You have mastered the definition, structural mechanism, and key equations for {topic_title}. "
            f"Now, let us do a quick understanding check. {checkpoint_q}"
        )
        sections.append({
            "section_id": "sec_recap_checkpoint",
            "type": "checkpoint",
            "section_number": len(sections) + 1,
            "title": "Lesson Recap & Understanding Checkpoint",
            "teacher_speech": recap_speech,
            "sentences": self._split_into_sentences(recap_speech, visual_target="left_ventricle" if model_key == "human-heart" else None),
            "checkpoint_question": cp_dict or checkpoint_q,
            "expected_keywords": exp_keywords,
            "visual": visual_anchor
        })

        return sections

    def _split_into_sentences(
        self,
        text: str,
        visual_target: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        raw_sents = re.split(r"(?<=[.!?])\s+", text.strip())
        results = []
        for i, s in enumerate(raw_sents):
            if s.strip():
                results.append({
                    "sentence_index": i,
                    "text": s.strip(),
                    "highlight_target_id": visual_target,
                    "action": "highlight"
                })
        return results

    def _map_term_to_model_part(self, term: str) -> Optional[str]:
        t = term.lower()
        if "right atrium" in t:
            return "right_atrium"
        elif "right ventricle" in t:
            return "right_ventricle"
        elif "left atrium" in t:
            return "left_atrium"
        elif "left ventricle" in t:
            return "left_ventricle"
        elif "septum" in t:
            return "septum"
        elif "tricuspid" in t:
            return "tricuspid_valve"
        elif "mitral" in t or "bicuspid" in t:
            return "bicuspid_valve"
        elif "aorta" in t:
            return "aorta"
        elif "pulmonary artery" in t:
            return "pulmonary_artery"
        elif "sa node" in t or "pacemaker" in t:
            return "sa_node"
        return None


teacher_pedagogy_engine = TeacherPedagogyEngine()
