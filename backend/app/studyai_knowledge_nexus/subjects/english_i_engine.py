from typing import Any, Dict, List, Optional
from backend.app.studyai_knowledge_nexus.subjects.base_subject_engine import (
    BaseSubjectEngine,
    SubjectEngineOutput,
    DefinitionScaffold,
)


class EnglishIEngine(BaseSubjectEngine):
    """
    Subject Engine 1: English I (English Language & Functional Grammar).
    Specializes in:
    - Transformation & Synthesis of Sentences
    - Prepositions & Phrasal Verbs
    - Tenses & Conditional Clauses
    - Formal / Informal Composition & Letters
    - ICSE Notice & Email Writing Templates
    - Unseen Comprehension & Précis Writing
    """

    @property
    def subject_name(self) -> str:
        return "English I"

    @property
    def allowed_visual_types(self) -> List[str]:
        # English language strictly forbids 3D models
        return ["syntax_tree_diagram", "structural_layout_card", "comparison_table", "none"]

    def analyze_topic(
        self,
        topic: str,
        grade: int,
        board: str = "ICSE",
        mode: str = "normal",
        context: Optional[Dict[str, Any]] = None,
    ) -> SubjectEngineOutput:
        clean_topic = topic.strip()
        
        # 5-Part Definition Scaffold
        def_scaffold = DefinitionScaffold(
            original_academic_definition=(
                "A preposition is a word placed before a noun or a pronoun to show in what relation the person or thing "
                "denoted by it stands in regard to something else; when combined with verbs, they create idiomatic phrasal units."
            ) if "prep" in clean_topic.lower() else (
                "Sentence transformation is the grammatical process of altering the syntactic structure of a sentence "
                "(such as from Active to Passive voice, or Affirmative to Negative) without changing its semantic meaning."
            ),
            simplified_definition=(
                "A preposition is a connector word that shows position, direction, or time; transformation means changing a sentence's shape without changing what it means."
            ),
            difficult_words_breakdown=[
                {"word": "Syntactic", "meaning": "Related to the grammatical structure and order of words in a sentence."},
                {"word": "Semantic", "meaning": "Related to the actual meaning conveyed by the words."},
                {"word": "Idiomatic", "meaning": "A phrase whose meaning cannot be deduced simply from the literal definitions of its individual words."}
            ],
            relatable_example=(
                "Active: 'The chef cooked the pasta.' -> Passive: 'The pasta was cooked by the chef.' The food and the chef are identical; only the focus shifts."
            ),
            meaning_preservation_proof=(
                "Both versions state that the chef performed the cooking on the pasta. The truth value and factual reality remain identical."
            )
        )

        steps = [
            {
                "step_number": 1,
                "title": "Syntactic Rule Identification",
                "explanation": "Identify the main clause, auxiliary verbs, and tense markers. Never alter the primary tense during transformation unless shifting direct to indirect speech."
            },
            {
                "step_number": 2,
                "title": "Voice and Particle Mapping",
                "explanation": "In passive transformations, ensure the past participle (V3) is paired with the appropriate tense form of the verb 'to be'."
            },
            {
                "step_number": 3,
                "title": "ICSE Examination Pitfall Check",
                "explanation": "Verify that no prepositions are accidentally dropped (e.g., 'looked into', 'laughed at' must retain the preposition in passive voice)."
            }
        ]

        terms = [
            {"term": "Syntax", "meaning": "The arrangement of words and phrases to create well-formed sentences in a language."},
            {"term": "Phrasal Verb", "meaning": "An idiomatic phrase consisting of a verb and another element, typically an adverb or a preposition."},
            {"term": "Subordinate Clause", "meaning": "A clause, typically introduced by a conjunction, that forms part of and is dependent on a main clause."}
        ]

        examples = [
            {
                "type": "Transformation Example",
                "question": "Rewrite using 'No sooner... than': As soon as the bell rang, the students entered.",
                "solution": "No sooner did the bell ring than the students entered.",
                "explanation": "Notice the inversion: auxiliary 'did' precedes the subject 'the bell', and the verb reverts to base form 'ring'."
            }
        ]

        misconceptions = [
            {
                "misconception": "Using 'when' with 'No sooner'",
                "correction": "'No sooner' always takes 'than'. 'Hardly' and 'Scarcely' take 'when'."
            },
            {
                "misconception": "Dropping the preposition in passive voice for phrasal verbs",
                "correction": "'They laughed at the clown' becomes 'The clown was laughed at by them' (retaining 'at')."
            }
        ]

        visual_rec = {
            "type": "structural_layout_card",
            "format": "SVG / Text Layout",
            "caption": f"Structural Syntax Breakdown for {clean_topic}",
            "requires_3d": False
        }

        assessment = {
            "question": "Transform into indirect speech: The teacher said, 'Honesty is the best policy.'",
            "correct_answer": "The teacher said that honesty is the best policy.",
            "rubric_note": "Universal truths and proverbs do NOT change their tense in indirect speech."
        }

        return SubjectEngineOutput(
            subject=self.subject_name,
            topic=clean_topic,
            curriculum_board=board,
            grade=grade,
            teaching_methodology="Structural Inversion & Rule-Pattern Analysis",
            definition_scaffold=def_scaffold,
            core_explanation_steps=steps,
            essential_terminology=terms,
            worked_examples=examples,
            visual_recommendation=visual_rec,
            assessment_checkpoint=assessment,
            common_misconceptions=misconceptions,
            subject_specific_payload={
                "composition_type": "Functional & Applied English",
                "board_guidance": "In ICSE English I, concise accuracy and exact preposition usage are strictly evaluated."
            }
        )

    def validate_academic_accuracy(self, output: SubjectEngineOutput) -> bool:
        # Verify 3D is never recommended for English I
        if output.visual_recommendation.get("requires_3d"):
            return False
        return True


english_i_engine = EnglishIEngine()
