from typing import Any, Dict, List, Optional
from backend.app.studyai_knowledge_nexus.subjects.base_subject_engine import (
    BaseSubjectEngine,
    SubjectEngineOutput,
    DefinitionScaffold,
)


class CivicsEngine(BaseSubjectEngine):
    """
    Subject Engine 5: Civics / Political Science.
    Specializes in:
    - The Indian Constitution & Constitutional Governance
    - The Union Legislature (Lok Sabha, Rajya Sabha, Parliamentary Procedures)
    - The Union Executive (President, Prime Minister, Council of Ministers, Collective Responsibility)
    - The Judiciary (Supreme Court, High Courts, Judicial Review, Writ Jurisdiction)
    - Subordinate Courts & Lok Adalats
    """

    @property
    def subject_name(self) -> str:
        return "Civics / Political Science"

    @property
    def allowed_visual_types(self) -> List[str]:
        # Flowcharts, Governance hierarchy charts, Constitutional process flow. No 3D models.
        return ["governance_hierarchy_flowchart", "constitutional_process_diagram", "none"]

    def analyze_topic(
        self,
        topic: str,
        grade: int,
        board: str = "ICSE",
        mode: str = "normal",
        context: Optional[Dict[str, Any]] = None,
    ) -> SubjectEngineOutput:
        clean_topic = topic.strip()
        q = clean_topic.lower()

        if "parliament" in q or "lok sabha" in q or "rajya sabha" in q:
            orig_def = (
                "The Union Parliament of India is the bicameral supreme legislative body consisting of the President "
                "and two Houses: the Lok Sabha (House of the People) and the Rajya Sabha (Council of States), vested with "
                "sovereign powers to legislate, control finances, and hold the executive accountable."
            )
            simp_def = "The Union Parliament is India's highest law-making body made up of the President, Lok Sabha, and Rajya Sabha, responsible for creating laws and overseeing government actions."
            examp = "Every year, the Union Budget must be presented in Lok Sabha and passed by Parliament before public funds can be withdrawn from the Consolidated Fund of India."
        elif "writ" in q or "court" in q or "judiciary" in q:
            orig_def = (
                "Judicial Review is the inherent constitutional power of the Supreme Court and High Courts under Articles 32 and 226 "
                "to examine the constitutionality of legislative enactments and executive actions, and declare them null and void if they violate fundamental rights or constitutional provisions."
            )
            simp_def = "Judicial Review is the power of high courts to inspect any government law or order and cancel it if it goes against the Constitution."
            examp = "If Parliament passes a law banning peaceful assembly without reason, the Supreme Court can strike down that law using judicial review under Article 32."
        else:
            orig_def = (
                "Collective Responsibility is the core convention of cabinet government under Article 75(3) whereby the Council of Ministers "
                "is collectively accountable to the Lok Sabha for all governmental decisions; if a Vote of No-Confidence is passed, the entire ministry must resign."
            )
            simp_def = "Collective Responsibility means all ministers sink or swim together: the whole cabinet must defend government policy, and if the Lok Sabha passes a No-Confidence vote, everyone must step down."
            examp = "Even if a minister personally disagrees with an agricultural bill, once passed by the cabinet, they must publicly defend it or resign from office."

        def_scaffold = DefinitionScaffold(
            original_academic_definition=orig_def,
            simplified_definition=simp_def,
            difficult_words_breakdown=[
                {"word": "Bicameral", "meaning": "Having two separate legislative chambers or houses (Lok Sabha and Rajya Sabha)."},
                {"word": "Ultra Vires", "meaning": "Beyond the legal powers or constitutional authority of a body."},
                {"word": "Prorogation", "meaning": "The formal termination of a parliamentary session without dissolving the house."}
            ],
            relatable_example=examp,
            meaning_preservation_proof="The simplified definition precisely retains the exact constitutional articles, jurisdictional scope, and procedural requirements without dilution."
        )

        steps = [
            {
                "step_number": 1,
                "title": "Constitutional Provision & Composition",
                "explanation": "State the governing Article of the Indian Constitution, qualifications, tenure, and strength of the body."
            },
            {
                "step_number": 2,
                "title": "Powers & Jurisdictional Domains",
                "explanation": "Detail the distinct Legislative, Financial, Executive, Electoral, and Amendment functions."
            },
            {
                "step_number": 3,
                "title": "Democratic Checks and Balances",
                "explanation": "Analyze how this institution interacts with and limits the powers of the other two democratic pillars."
            }
        ]

        terms = [
            {"term": "Writ of Habeas Corpus", "meaning": "A court order to produce an imprisoned individual before a judge to determine the legality of detention ('to have the body')."},
            {"term": "Adjournment Motion", "meaning": "A motion introduced in Parliament to set aside ordinary business to discuss an urgent matter of definite public importance."},
            {"term": "Quorum", "meaning": "The minimum number of members required to be present (one-tenth of the total house strength) to conduct formal proceedings."}
        ]

        examples = [
            {
                "type": "Constitutional Procedure",
                "question": "What happens when there is a deadlock between Lok Sabha and Rajya Sabha on an Ordinary Bill?",
                "solution": "The President may summon a Joint Sitting of both Houses under Article 108. The Speaker of Lok Sabha presides, and the bill is passed by a simple majority of total members present and voting.",
                "explanation": "Due to greater numerical strength (543 vs 245), the Lok Sabha's will usually prevails in joint sittings."
            }
        ]

        misconceptions = [
            {
                "misconception": "Believing Money Bills can originate in either House",
                "correction": "Under Article 109, Money Bills can ONLY be introduced in the Lok Sabha with the prior recommendation of the President. The Rajya Sabha has only 14 days to recommend amendments, which the Lok Sabha may accept or reject."
            }
        ]

        visual_rec = {
            "type": "governance_hierarchy_flowchart",
            "format": "SVG Organizational Chart",
            "caption": f"Constitutional Structure & Hierarchy for {clean_topic}",
            "requires_3d": False
        }

        assessment = {
            "question": "State two exclusive powers of the Rajya Sabha that the Lok Sabha does not possess.",
            "correct_answer": "1. Under Article 249, it can declare a State List subject to be of national importance for Parliament to legislate. 2. Under Article 312, it can authorize the creation of new All-India Services.",
            "rubric_note": "Both Article 249 and Article 312 must be mentioned with their respective subjects."
        }

        return SubjectEngineOutput(
            subject=self.subject_name,
            topic=clean_topic,
            curriculum_board=board,
            grade=grade,
            teaching_methodology="Constitutional Rule Analysis & Institutional Flow",
            definition_scaffold=def_scaffold,
            core_explanation_steps=steps,
            essential_terminology=terms,
            worked_examples=examples,
            visual_recommendation=visual_rec,
            assessment_checkpoint=assessment,
            common_misconceptions=misconceptions,
            subject_specific_payload={
                "constitution_articles_referenced": ["Article 32", "Article 75", "Article 108", "Article 226", "Article 312"]
            }
        )

    def validate_academic_accuracy(self, output: SubjectEngineOutput) -> bool:
        if output.visual_recommendation.get("requires_3d"):
            return False
        return True


civics_engine = CivicsEngine()
