from typing import Any, Dict, List, Optional
from backend.app.studyai_knowledge_nexus.subjects.base_subject_engine import (
    BaseSubjectEngine,
    SubjectEngineOutput,
    DefinitionScaffold,
)


class EnglishIIEngine(BaseSubjectEngine):
    """
    Subject Engine 2: English II (Literature in English).
    Specializes in:
    - Shakespearean Drama (The Merchant of Venice, The Tempest)
    - Poetry Analysis & Meter (Treasure Trove, Reverie)
    - Prose & Short Stories (Characterization, Symbolism, Themes)
    - Literary Devices: Dramatic Irony, Soliloquy, Metaphor, Personification, Allusion
    - Contextual Questions & 16-Mark Long Critical Essays
    """

    @property
    def subject_name(self) -> str:
        return "English II"

    @property
    def allowed_visual_types(self) -> List[str]:
        # Literature strictly forbids 3D models; allows character maps and scene timelines
        return ["character_network_graph", "scene_thematic_diagram", "text_quote_card", "none"]

    def analyze_topic(
        self,
        topic: str,
        grade: int,
        board: str = "ICSE",
        mode: str = "normal",
        context: Optional[Dict[str, Any]] = None,
    ) -> SubjectEngineOutput:
        clean_topic = topic.strip()

        def_scaffold = DefinitionScaffold(
            original_academic_definition=(
                "Dramatic irony is a literary device by which the audience's or reader's understanding of events or individuals "
                "surpasses that of its characters, creating heightened suspense, tragic pathos, or comedic misunderstanding."
            ) if "irony" in clean_topic.lower() else (
                "A soliloquy is an act of speaking one's thoughts aloud when by oneself or regardless of any hearers, "
                "especially by a character in a play to reveal internal psychological conflicts, motives, and unspoken intent."
            ),
            simplified_definition=(
                "Dramatic irony happens when the audience knows a secret that the characters on stage do not; a soliloquy is a character thinking aloud alone on stage."
            ),
            difficult_words_breakdown=[
                {"word": "Pathos", "meaning": "A quality in literature or art that evokes pity, sorrow, or deep compassion."},
                {"word": "Subtext", "meaning": "The underlying, implicit meaning beneath the literal spoken words."},
                {"word": "Allusion", "meaning": "An indirect or brief reference to a person, place, event, or literary work outside the immediate text."}
            ],
            relatable_example=(
                "In 'The Merchant of Venice' Act IV Scene 1, Shylock believes the young doctor of law (Balthazar) will rule in his favour, but the audience knows she is actually Portia in disguise."
            ),
            meaning_preservation_proof=(
                "Both explanations establish the identical narrative mechanism: a knowledge asymmetry between the observant audience and the unaware character."
            )
        )

        steps = [
            {
                "step_number": 1,
                "title": "Textual Context & Speaker Identification",
                "explanation": "State the exact Act, Scene, speaker, and circumstances under which the dialogue was delivered."
            },
            {
                "step_number": 2,
                "title": "Literary & Thematic Significance",
                "explanation": "Analyze the quote in relation to the overarching themes (e.g. Justice vs Mercy, Appearance vs Reality, Colonial Hegemony in The Tempest)."
            },
            {
                "step_number": 3,
                "title": "Character Psychology & Subtext",
                "explanation": "Unpack the emotional subtext and dramatic motivation behind the character's verbal choices."
            }
        ]

        terms = [
            {"term": "Dramatic Irony", "meaning": "When the audience knows crucial information that a character on stage does not."},
            {"term": "Blank Verse", "meaning": "Unrhymed iambic pentameter, the standard poetic meter used by Shakespeare for noble characters."},
            {"term": "Hubris", "meaning": "Excessive pride or dangerous overconfidence, often leading to a character's downfall."}
        ]

        examples = [
            {
                "type": "Context Question Example",
                "question": "Quote: 'The quality of mercy is not strained...' Explain the context and speaker.",
                "solution": "Spoken by Portia (disguised as doctor Balthazar) to Shylock in the court of Venice (Act IV Scene 1). She argues that mercy cannot be forced; it drops gently like rain from heaven.",
                "explanation": "This speech highlights the Christian virtue of divine mercy surpassing strict legalistic retribution."
            }
        ]

        misconceptions = [
            {
                "misconception": "Treating Shylock as a purely comic or purely villainous caricature",
                "correction": "Shakespeare gives Shylock genuine human dignity and grievances in the 'Hath not a Jew eyes?' speech (Act III Scene 1), presenting complex societal marginalization."
            }
        ]

        visual_rec = {
            "type": "character_network_graph",
            "format": "SVG Thematic Diagram",
            "caption": f"Literary Relationship & Thematic Map for {clean_topic}",
            "requires_3d": False
        }

        assessment = {
            "question": "What is the dramatic significance of the Casket Scene (Act III Scene 2)?",
            "correct_answer": "It tests moral character: gold represents superficial greed, silver represents self-entitlement, and lead represents selfless sacrifice, revealing Bassanio's true virtue.",
            "rubric_note": "Mention the inscriptions and Bassanio's reasoning against deceptive outward appearances."
        }

        return SubjectEngineOutput(
            subject=self.subject_name,
            topic=clean_topic,
            curriculum_board=board,
            grade=grade,
            teaching_methodology="Textual Exegesis & Thematic Character Analysis",
            definition_scaffold=def_scaffold,
            core_explanation_steps=steps,
            essential_terminology=terms,
            worked_examples=examples,
            visual_recommendation=visual_rec,
            assessment_checkpoint=assessment,
            common_misconceptions=misconceptions,
            subject_specific_payload={
                "genre": "Drama & Poetry Analysis",
                "prescribed_texts": ["The Merchant of Venice", "The Tempest", "Treasure Trove", "Reverie"]
            }
        )

    def validate_academic_accuracy(self, output: SubjectEngineOutput) -> bool:
        if output.visual_recommendation.get("requires_3d"):
            return False
        return True


english_ii_engine = EnglishIIEngine()
