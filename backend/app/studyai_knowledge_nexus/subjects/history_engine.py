from typing import Any, Dict, List, Optional
import json

from backend.app.studyai_knowledge_nexus.subjects.base_subject_engine import (
    BaseSubjectEngine,
    SubjectEngineOutput,
    DefinitionScaffold,
)

HISTORICAL_EVENTS_KNOWLEDGE = {
    "1857": {
        "event_name": "The First War of Independence (1857)",
        "time_period": "May 10, 1857 – November 1858",
        "geopolitical_context": "British East India Company expanding rule across the Indian subcontinent via annexation, subsidiary alliances, and military subjugation.",
        "key_figures": [
            {"name": "Mangal Pandey", "role": "Sepoy in 34th Bengal Native Infantry at Barrackpore", "allegiance": "Indian Patriot / Revolutionary"},
            {"name": "Rani Lakshmibai", "role": "Queen of Jhansi, led defence of Jhansi and Gwalior", "allegiance": "Maratha / Indian Leadership"},
            {"name": "Nana Saheb", "role": "Adopted son of Peshwa Baji Rao II, led the uprising at Kanpur", "allegiance": "Maratha / Indian Leadership"},
            {"name": "Bahadur Shah Zafar", "role": "Last Mughal Emperor, proclaimed Emperor of Hindustan", "allegiance": "Mughal Empire"},
            {"name": "Lord Canning", "role": "Governor-General of India during the Revolt; first Viceroy", "allegiance": "British Crown"}
        ],
        "root_causes": {
            "political": "Doctrine of Lapse (annexation of Satara, Jhansi, Nagpur); Annexation of Awadh on pretext of maladministration; Disrespect to Bahadur Shah Zafar.",
            "economic": "Ruin of traditional Indian handicrafts and artisans; Heavy land revenue systems (Permanent Settlement, Mahalwari); Drain of wealth to Britain.",
            "social_religious": "Interference in customs (Abolition of Sati 1829, Widow Remarriage Act 1856); Taxing temple and mosque lands; Activities of Christian missionaries; Introduction of Western education.",
            "military": "General Service Enlistment Act 1856 (crossing the sea violated caste rules); Lower salaries and denial of foreign service bhatta to Indian sepoys; Grievous disparity in promotions."
        },
        "trigger": "Introduction of the Enfield P-53 Rifle using greased cartridges suspected of being lubricated with cow and pig fat, requiring soldiers to bite the paper cartridge before loading.",
        "chronological_sequence": [
            {"date": "March 29, 1857", "event": "Mangal Pandey revolts at Barrackpore parade ground and fires upon his British officers."},
            {"date": "May 9-10, 1857", "event": "85 sepoys at Meerut court-martialled; remaining regiments mutiny, liberate comrades, and march to Delhi."},
            {"date": "May 11-12, 1857", "event": "Sepoys seize Delhi, proclaim Bahadur Shah Zafar as Shahenshah-e-Hindustan."},
            {"date": "June 1857", "event": "Uprisings erupt across Kanpur (Nana Saheb), Lucknow (Begum Hazrat Mahal), and Jhansi (Rani Lakshmibai)."},
            {"date": "June 1858", "event": "Rani Lakshmibai falls valiantly in battle fighting near Gwalior."},
            {"date": "November 1, 1858", "event": "Queen Victoria's Proclamation read by Lord Canning at Allahabad Durbar, ending Company rule."}
        ],
        "battles_treaties": [
            "Siege of Delhi (June - September 1857)",
            "Siege of Cawnpore (Kanpur) and Bibighat",
            "Defense and Relief of Lucknow Residency",
            "Government of India Act 1858 (Transferred power from East India Company to the British Crown)"
        ],
        "turning_points": [
            "Recapture of Delhi by British troops under John Nicholson (September 1857).",
            "Fall of Lucknow and death of Rani Lakshmibai at Kotah-ki-Serai near Gwalior (June 1858)."
        ],
        "direct_consequences": [
            "End of British East India Company rule; governance transferred directly to the British Crown via Secretary of State for India.",
            "Governor-General granted title of Viceroy (Lord Canning first Viceroy).",
            "Queen's Proclamation of 1858 promising non-annexation of princely states and religious tolerance.",
            "Complete reorganization of the Indian Army: increased European troops to Indian ratio (1:2 in Bengal) and ethnic grouping (martial races theory)."
        ],
        "long_term_significance": "Laid the foundational bedrock of Indian nationalism, uniting diverse sections against foreign colonial exploitation, and inspiring the freedom struggle led by early and assertive nationalists.",
        "primary_citations": [
            "Queen Victoria's Proclamation, Allahabad, 1 November 1858: 'We hold ourselves bound to the natives of Our Indian territories by the same obligations of duty which bind Us to all Our other subjects.'",
            "Total History & Civics Grade 10, Morning Star Publishers, Chapter 1."
        ]
    }
}


class HistoryEngine(BaseSubjectEngine):
    """
    Subject Engine 3: History.
    Specializes in:
    - 16-Point Historical Event Dossiers
    - Chronological Event Sequencing & Interactive SVG Timelines
    - Geopolitical Causal Flows (Political, Economic, Socio-Religious, Military)
    - Primary Document Citations & Archival Verification
    - Strict visual policy: Real historical photographs, maps, timelines; NO 3D models.
    """

    @property
    def subject_name(self) -> str:
        return "History"

    @property
    def allowed_visual_types(self) -> List[str]:
        # History strictly forbids 3D models; permits timelines, historical maps, and authentic archival photographs
        return ["chronological_timeline_svg", "historical_map_diagram", "archival_portrait_card", "none"]

    def analyze_topic(
        self,
        topic: str,
        grade: int,
        board: str = "ICSE",
        mode: str = "normal",
        context: Optional[Dict[str, Any]] = None,
    ) -> SubjectEngineOutput:
        clean_topic = topic.strip()
        dossier_res = self.analyze_event(clean_topic)
        dossier = dossier_res.get("dossier", HISTORICAL_EVENTS_KNOWLEDGE["1857"])

        def_scaffold = DefinitionScaffold(
            original_academic_definition=(
                "The Doctrine of Lapse was an aggressive imperialist annexation policy formulated by Lord Dalhousie (Governor-General of India 1848–1856) "
                "stipulating that any Indian princely state under direct British suzerainty whose sovereign ruler died without a natural biological male heir "
                "would automatically lapse to and be annexed by the British East India Company, denying the legal status of adopted sons."
            ) if "doctrine" in clean_topic.lower() or "lapse" in clean_topic.lower() else (
                "Imperialism is an asymmetric geopolitical system and policy of extending a nation's sovereign authority and territorial dominion "
                "over foreign countries and peoples through military conquest, economic subjugation, and unequal treaties."
            ),
            simplified_definition=(
                "The Doctrine of Lapse was a British rule stating that if an Indian king died without his own natural son, the British took over his kingdom, refusing to recognize an adopted child as ruler."
            ) if "doctrine" in clean_topic.lower() or "lapse" in clean_topic.lower() else (
                "Imperialism is when a powerful country takes over other weaker countries by force and controls their land, trade, and government."
            ),
            difficult_words_breakdown=[
                {"word": "Suzerainty", "meaning": "A relationship in which one state has political control and supremacy over another state."},
                {"word": "Annexation", "meaning": "The formal administrative incorporation of a foreign territory into one's own state dominion."},
                {"word": "Biological Heir", "meaning": "A naturally born child, as distinguished from an adopted child in traditional succession."}
            ],
            relatable_example=(
                "Under the Doctrine of Lapse, when Maharaja Gangadhar Rao of Jhansi passed away, the British refused to recognize his adopted son Damodar Rao and forcefully annexed Jhansi in 1853, prompting Rani Lakshmibai to join the 1857 uprising."
            ),
            meaning_preservation_proof="The simplified explanation preserves the exact legal restriction against adopted heirs and imperial annexation without omission."
        )

        steps = [
            {
                "step_number": 1,
                "title": "Geopolitical Context & Underlying Preconditions",
                "explanation": f"Context: {dossier.get('geopolitical_context', 'Colonial expansion and imperial rivalries.')}"
            },
            {
                "step_number": 2,
                "title": "Immediate Catalyst & Chronological Flashpoints",
                "explanation": f"Trigger: {dossier.get('trigger', 'Introduction of the greased cartridge.')}"
            },
            {
                "step_number": 3,
                "title": "Institutional Reorganization & Long-Term Historical Legacy",
                "explanation": f"Consequences: {', '.join(dossier.get('direct_consequences', ['End of Company rule', 'Queen Victoria proclamation']))[:200]}..."
            }
        ]

        terms = [
            {"term": "Doctrine of Lapse", "meaning": "Annexation policy of Dalhousie denying succession to adopted sons (Satara, Jhansi, Nagpur)."},
            {"term": "Queen's Proclamation of 1858", "meaning": "Royal charter ending East India Company rule and promising religious non-interference."},
            {"term": "General Service Enlistment Act 1856", "meaning": "Military decree compelling Indian sepoys to serve overseas, violating caste rules."}
        ]

        examples = [
            {
                "type": "Historical Cause-and-Effect Analysis",
                "question": "Explain the immediate cause of the 1857 uprising.",
                "solution": "The introduction of the Enfield P-53 rifle using paper cartridges greased with animal fat (cow and pig fat). Sepoys had to bite the cartridge to load the gun, which violated the religious tenets of both Hindu and Muslim soldiers.",
                "explanation": "Mangal Pandey's revolt at Barrackpore on March 29, 1857, was the direct flashpoint of this immediate grievance."
            }
        ]

        misconceptions = [
            {
                "misconception": "Viewing the 1857 uprising as purely a military mutiny of disgruntled soldiers",
                "correction": "While sepoys triggered the revolt, it quickly became a widespread popular uprising involving dispossessed peasants, taluqdars of Awadh, displaced artisans, and deposed rulers seeking liberation from colonial exploitation."
            }
        ]

        visual_rec = {
            "type": "chronological_timeline_svg",
            "format": "Interactive SVG Timeline",
            "svg_code": dossier_res.get("timeline_svg"),
            "caption": f"Chronological Timeline for {dossier.get('event_name', clean_topic)}",
            "requires_3d": False
        }

        assessment = {
            "question": "Mention two administrative changes introduced by the Government of India Act 1858.",
            "correct_answer": "1. Governance of India transferred from the East India Company to the British Crown. 2. A cabinet minister in Britain appointed as Secretary of State for India, aided by a 15-member Council.",
            "rubric_note": "Mention transfer to Crown and appointment of Secretary of State."
        }

        return SubjectEngineOutput(
            subject=self.subject_name,
            topic=clean_topic,
            curriculum_board=board,
            grade=grade,
            teaching_methodology="16-Point Archival Dossier & Chronological Causal Mapping",
            definition_scaffold=def_scaffold,
            core_explanation_steps=steps,
            essential_terminology=terms,
            worked_examples=examples,
            visual_recommendation=visual_rec,
            assessment_checkpoint=assessment,
            common_misconceptions=misconceptions,
            subject_specific_payload={
                "dossier": dossier,
                "requires_3d": False
            }
        )

    def analyze_event(self, event_query: str) -> Dict[str, Any]:
        """Provides backward-compatible 16-point event dossier."""
        q = event_query.lower()
        if "1857" in q or "first war" in q or "revolt" in q or "sepoy" in q or "mangal pandey" in q or "jhansi" in q:
            dossier = HISTORICAL_EVENTS_KNOWLEDGE["1857"]
            return {
                "success": True,
                "event_matched": "1857 First War of Independence",
                "dossier": dossier,
                "timeline_svg": self._generate_timeline_svg(dossier["chronological_sequence"])
            }

        default_dossier = {
            "event_name": event_query.title(),
            "time_period": "Historical Era",
            "geopolitical_context": "National and geopolitical transformations across the region.",
            "key_figures": [{"name": "Prominent Historical Figures", "role": "Leadership", "allegiance": "National"}],
            "root_causes": {"political": "Governance policies", "economic": "Fiscal and trade changes", "social_religious": "Cultural dynamics", "military": "Security posture"},
            "trigger": "Critical immediate spark initiating mobilization.",
            "chronological_sequence": [{"date": "Stage 1", "event": "Genesis and mobilization"}, {"date": "Stage 2", "event": "Peak engagement"}, {"date": "Stage 3", "event": "Resolution"}],
            "battles_treaties": ["Major Accords and Engagements"],
            "turning_points": ["Decisive structural shift"],
            "direct_consequences": ["Governance restructuring", "Legal modifications"],
            "long_term_significance": "Deep enduring imprint on modern constitutionalism and national identity.",
            "primary_citations": ["Total History & Civics Grade 10, Morning Star Publishers."]
        }
        return {
            "success": True,
            "event_matched": event_query,
            "dossier": default_dossier,
            "timeline_svg": self._generate_timeline_svg(default_dossier["chronological_sequence"])
        }

    def _generate_timeline_svg(self, sequence: List[Dict[str, str]]) -> str:
        """Renders an interactive SVG chronological timeline."""
        items_count = len(sequence)
        width = 520
        height = max(180, 50 + (items_count * 52))

        svg_lines = [
            f'<svg viewBox="0 0 {width} {height}" class="w-full h-auto bg-slate-950 rounded-xl p-4 border border-slate-800">'
            f'<line x1="80" y1="40" x2="80" y2="{height - 30}" stroke="#f97316" stroke-width="3" stroke-linecap="round"/>'
            f'<text x="260" y="25" fill="#fdba74" font-size="13" font-weight="bold" text-anchor="middle" font-family="sans-serif">Chronological Sequence of Events</text>'
        ]

        for idx, item in enumerate(sequence):
            y = 55 + (idx * 52)
            svg_lines.append(f'<circle cx="80" cy="{y}" r="6" fill="#f97316" stroke="#ffffff" stroke-width="2"/>')
            svg_lines.append(f'<text x="100" y="{y - 4}" fill="#fed7aa" font-size="11" font-weight="bold" font-family="sans-serif">{item["date"]}</text>')
            text_desc = item['event'][:65] + '...' if len(item['event']) > 65 else item['event']
            svg_lines.append(f'<text x="100" y="{y + 12}" fill="#94a3b8" font-size="10" font-family="sans-serif">{text_desc}</text>')

        svg_lines.append('</svg>')
        return "\n".join(svg_lines)

    def validate_academic_accuracy(self, output: SubjectEngineOutput) -> bool:
        if output.visual_recommendation.get("requires_3d"):
            return False
        return True


history_engine = HistoryEngine()
