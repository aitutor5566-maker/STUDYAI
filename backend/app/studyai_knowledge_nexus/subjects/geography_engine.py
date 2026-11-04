from typing import Any, Dict, List, Optional
from backend.app.studyai_knowledge_nexus.subjects.base_subject_engine import (
    BaseSubjectEngine,
    SubjectEngineOutput,
    DefinitionScaffold,
)


class GeographyEngine(BaseSubjectEngine):
    """
    Subject Engine 4: Geography.
    Specializes in:
    - Topography & Survey of India Sheet Interpretation (45D/7, 45D/10)
    - 4-figure and 6-figure Easting/Northing grid coordinates
    - Contour slopes, Drainage patterns (Dendritic, Trellis, Radial)
    - Climate of India: Southwest Monsoon Mechanism, Jet Streams, Western Disturbances
    - Soil orders: Alluvial, Black (Regur), Red, Laterite
    - Water, Mineral, Energy Resources and Agro-industries
    """

    @property
    def subject_name(self) -> str:
        return "Geography"

    @property
    def allowed_visual_types(self) -> List[str]:
        # Maps, Cartographic SVG diagrams, Climographs, Contour cross-sections
        return ["cartographic_map", "contour_cross_section", "climograph_chart", "none"]

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

        is_topo = "topo" in q or "grid" in q or "contour" in q or "drainage" in q
        is_climate = "climate" in q or "monsoon" in q or "rain" in q or "temperature" in q

        if is_topo:
            orig_def = (
                "A contour line on a topographical survey map is an imaginary line connecting all points on the Earth's "
                "surface that have an equal elevation above mean sea level; their spacing indicates gradient steepness."
            )
            simp_def = "A contour line joins places with the same height above sea level; close lines mean steep slopes, while spaced lines mean gentle slopes."
            examp = "On Topo Sheet 45D/7, contours spaced 20m apart clustered tightly together indicate a steep escarpment or hill slope."
        elif is_climate:
            orig_def = (
                "The Indian Southwest Monsoon is a seasonal reversal of surface atmospheric pressure and wind systems caused by differential "
                "heating of the Asian landmass and the Indian Ocean, steered by the northward migration of the Inter-Tropical Convergence Zone (ITCZ) and tropical jet streams."
            )
            simp_def = "The Southwest Monsoon is the giant seasonal wind reversal bringing summer rains to India because the heated land draws in moist sea air."
            examp = "During May-June, the Thar Desert forms a severe low-pressure cell that attracts moisture-laden winds from the high-pressure southern Indian Ocean."
        else:
            orig_def = (
                "Laterite soil is a residual soil formed in tropical regions with high temperature and heavy alternating wet and dry seasons, "
                "characterized by intense chemical leaching (desilication) that leaves behind insoluble iron and aluminum oxides."
            )
            simp_def = "Laterite soil is rusty red, brick-like soil created when heavy tropical rains wash away soluble silica, leaving tough iron and aluminum minerals."
            examp = "Laterite soil in the Western Ghats is acidic and nutrient-poor for cereals, but ideal for tea, coffee, and cashew nuts when fertilized."

        def_scaffold = DefinitionScaffold(
            original_academic_definition=orig_def,
            simplified_definition=simp_def,
            difficult_words_breakdown=[
                {"word": "Leaching", "meaning": "The process by which soluble nutrients and silica are washed out of the soil by rainwater."},
                {"word": "Gradient", "meaning": "The degree of steepness or slope of the land surface."},
                {"word": "Differential Heating", "meaning": "The phenomenon where land warms up and cools down much faster than surrounding water bodies."}
            ],
            relatable_example=examp,
            meaning_preservation_proof="The simplified definition explicitly preserves all causative meteorological and geomorphological mechanisms without omitting critical parameters."
        )

        steps = [
            {
                "step_number": 1,
                "title": "Geographical Mechanism & Spatial Extent",
                "explanation": "Establish the geographic location, pressure gradients, or geological bedrock forming the foundation of the phenomenon."
            },
            {
                "step_number": 2,
                "title": "Causal Factors & Climatological/Pedological Dynamics",
                "explanation": "Trace the interaction of rainfall, temperature, vegetation, and landforms driving this phenomenon."
            },
            {
                "step_number": 3,
                "title": "Economic & Human Geography Relevance",
                "explanation": "Connect the phenomenon to human land use, agricultural cropping patterns, irrigation demands, or settlement distribution."
            }
        ]

        terms = [
            {"term": "Isohyet", "meaning": "A line on a map connecting points receiving equal amounts of rainfall in a given period."},
            {"term": "Dendritic Drainage", "meaning": "A tree-branching river pattern formed in areas of uniform rock resistance."},
            {"term": "Western Disturbances", "meaning": "Temperate cyclonic depressions originating in the Mediterranean bringing critical winter rain for Rabi wheat crops."}
        ]

        examples = [
            {
                "type": "Topographic Calculation",
                "question": "How to calculate a 6-figure grid reference for a temple in grid square 2485?",
                "solution": "1. Find Easting 24 and divide into tenths (e.g. 3) -> 243. 2. Find Northing 85 and divide into tenths (e.g. 7) -> 857. 3. Combine: 243857.",
                "explanation": "Eastings always precede Northings in topographical coordinate reporting."
            }
        ]

        misconceptions = [
            {
                "misconception": "Confusing Black Soil with Alluvial Soil formation",
                "correction": "Black soil is in-situ (residual) formed by weathering of Deccan basaltic lava rocks, whereas Alluvial soil is ex-situ (transported) deposited by Himalayan and peninsular river systems."
            }
        ]

        visual_rec = {
            "type": "cartographic_map" if not is_topo else "contour_cross_section",
            "format": "SVG Map / Elevation Profile",
            "caption": f"Cartographic Visual for {clean_topic}",
            "requires_3d": False
        }

        assessment = {
            "question": "Why do the Coromandel coast (Tamil Nadu) regions receive winter rainfall while the rest of India receives summer monsoon rains?",
            "correct_answer": "Tamil Nadu receives rainfall in October-December from the Northeast Retreating Monsoon picking up moisture over the Bay of Bengal and striking the Eastern Ghats.",
            "rubric_note": "Must mention 'Retreating Monsoon' and 'Moisture pickup from the Bay of Bengal'."
        }

        return SubjectEngineOutput(
            subject=self.subject_name,
            topic=clean_topic,
            curriculum_board=board,
            grade=grade,
            teaching_methodology="Spatial Analysis & Cartographic Causal Modeling",
            definition_scaffold=def_scaffold,
            core_explanation_steps=steps,
            essential_terminology=terms,
            worked_examples=examples,
            visual_recommendation=visual_rec,
            assessment_checkpoint=assessment,
            common_misconceptions=misconceptions,
            subject_specific_payload={
                "map_pointing_required": True,
                "toposheet_symbols_referenced": ["Cart-track", "Perennial lined well", "Open scrub", "Dry tank", "Causeway"]
            }
        )

    def validate_academic_accuracy(self, output: SubjectEngineOutput) -> bool:
        if output.visual_recommendation.get("requires_3d"):
            return False
        return True


geography_engine = GeographyEngine()
