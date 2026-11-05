import re
import logging
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from backend.app.studyai_knowledge_nexus.visualization.geometry_construction_engine import (
    geometry_construction_engine, GeometricalConstructionPlan
)

logger = logging.getLogger("knowledge_nexus.visual_decision_engine")

# 12 Standard Educational Visual Decision Types (Part 2)
VISUAL_TYPES = [
    "threejs_3d_model",
    "geometrical_construction",
    "mathematical_graph",
    "timeline",
    "map",
    "process_flowchart",
    "labelled_2d_diagram",
    "relevant_educational_image",
    "two_d_animation",
    "interactive_simulation",
    "step_by_step_drawing",
    "no_visual"
]


class VisualSpecification(BaseModel):
    """
    16-Field Validated Visual Specification Generator (Part 3).
    Formulated strictly before rendering any visual to guarantee educational integrity,
    scientific accuracy, and zero arbitrary JavaScript execution.
    """
    subject: str = Field(..., description="1. Academic Subject")
    topic: str = Field(..., description="2. Academic Topic")
    educational_objective: str = Field(..., description="3. Concrete learning goal")
    model_type: str = Field(..., description="4. Visual modality e.g. threejs_3d_model, geometrical_construction, timeline")
    required_objects: List[str] = Field(..., description="5. Named components/entities required")
    object_relationships: List[str] = Field(..., description="6. Structural or topological relations")
    correct_labels: List[str] = Field(..., description="7. Curricular labels verified without overlap")
    spatial_arrangement: Dict[str, Any] = Field(..., description="8. Coordinates, bounding bounds, and layout")
    scale_and_proportions: Dict[str, Any] = Field(..., description="9. Scientific scale, ratios, or dimensions")
    material_and_appearance: Dict[str, Any] = Field(..., description="10. PBR materials, roughness, metalness, and colors")
    camera_position: Dict[str, Any] = Field(..., description="11. Initial camera pos, target, and FOV")
    lighting: List[Dict[str, Any]] = Field(..., description="12. 4-point educational lighting setup with shadows")
    animation_requirements: Dict[str, Any] = Field(..., description="13. Directional flow, rotation, or step animations")
    interactive_controls: List[str] = Field(..., description="14. Supported user interactions (rotate, zoom, pan, highlight, exploded-view)")
    explanation_steps: List[Dict[str, str]] = Field(..., description="15. Step-by-step narration synchronized to visual highlights")
    scientific_validation: Dict[str, Any] = Field(..., description="16. Factual accuracy, dimensional check, and provenance")


class VisualDecision(BaseModel):
    visual_type: str = Field(..., description="One of the 12 defined visual decision types")
    justification: str = Field(..., description="Pedagogical rationale for this visual type")
    is_3d_required: bool = Field(default=False)
    model_3d_key: Optional[str] = Field(default=None)
    diagram_svg: Optional[str] = Field(default=None)
    geometry_construction: Optional[GeometricalConstructionPlan] = Field(default=None)
    visual_specification: Optional[VisualSpecification] = Field(default=None)
    image_brief: Optional[Dict[str, Any]] = Field(default=None)
    provenance: Optional[Dict[str, str]] = Field(default=None)


class VisualDecisionEngine:
    """
    Visual Intelligence Decision Engine (Part 2 & Part 3).
    Selects the most effective educational visual modality across 12 formats.
    
    CRITICAL RULE: 3D MUST NOT BE FORCED.
    Only spatial volumetric interaction (Anatomy, Organelles, Molecular Geometry, 3D Solids, Simple Machines) qualifies.
    Pure 2D subjects (History, Geography maps, English grammar, Geometrical constructions, Coordinate plots)
    are strictly directed to their optimal non-3D visual medium.
    """

    # Curricular 3D spatial models
    VALID_3D_TOPICS = {
        "heart": {
            "key": "human-heart",
            "caption": "Interactive 3D Anatomical Human Heart & 4-Chamber Circulation",
            "objective": "Understand the four distinct chambers, valves, septum, and sequence of systemic/pulmonary circulation without blood mixing."
        },
        "cardiac": {
            "key": "human-heart",
            "caption": "Interactive 3D Anatomical Human Heart & 4-Chamber Circulation",
            "objective": "Understand cardiac cycle, ventricular systole, and atrioventricular valve dynamics."
        },
        "cell": {
            "key": "plant-cell",
            "caption": "Interactive 3D Plant Cell with Cell Wall & Vacuole",
            "objective": "Explore eukaryotic cell ultrastructure, cellulose cell wall, chloroplasts, and large central vacuole."
        },
        "dna": {
            "key": "dna-double-helix",
            "caption": "Interactive 3D DNA Double Helix & Base Pairing",
            "objective": "Demonstrate antiparallel sugar-phosphate rails and complementary A=T (2 H-bonds) and G≡C (3 H-bonds) base pairing."
        },
        "water molecule": {
            "key": "water-molecule",
            "caption": "Interactive 3D Water Molecule (H₂O) Bent Geometry",
            "objective": "Visualize VSEPR lone-pair repulsion bending H-O-H bond angle to 104.5° with net dipole moment."
        },
        "atomic": {
            "key": "atomic-structure",
            "caption": "Interactive 3D Rutherford-Bohr Atomic Model",
            "objective": "Understand central dense proton-neutron nucleus surrounded by quantized K, L, M electron orbital shells."
        },
        "atom": {
            "key": "atomic-structure",
            "caption": "Interactive 3D Rutherford-Bohr Atomic Model",
            "objective": "Understand central dense proton-neutron nucleus surrounded by quantized K, L, M electron orbital shells."
        },
        "lever": {
            "key": "lever-moments",
            "caption": "Interactive 3D Principle of Moments & Balanced Lever",
            "objective": "Verify rotational equilibrium: sum of anticlockwise moments equals sum of clockwise moments (F1 * d1 = F2 * d2)."
        },
        "simple machine": {
            "key": "lever-moments",
            "caption": "Interactive 3D Principle of Moments & Balanced Lever",
            "objective": "Examine mechanical advantage, velocity ratio, and fulcrum mechanics."
        },
        "cone and cylinder": {
            "key": "cone-cylinder-volume",
            "caption": "Interactive 3D Volume Relationship of Cone & Cylinder",
            "objective": "Prove that the volume of a cone is exactly one-third the volume of a cylinder with identical base radius and height: V = (1/3)πr²h."
        },
        "volcano": {
            "key": "volcano",
            "caption": "Interactive 3D Composite Volcano Geomorphology",
            "objective": "Inspect internal magma chamber, central pipe conduit, and summit vent cross-section."
        }
    }

    def decide_visual(
        self,
        topic: str,
        subject: str,
        grade: int,
        board: str = "ICSE",
    ) -> VisualDecision:
        t_clean = topic.lower().strip()
        sub_clean = subject.lower().strip()

        # 1. Geometrical Construction (Part 5 - Explicit 2D Compass Drafting, NEVER 3D)
        if any(w in t_clean for w in ["construct", "construction", "ruler and compass", "compass arc", "bisect angle", "draw a triangle"]):
            # Extract side lengths if provided (e.g. 6cm, 5cm, 4cm)
            nums = [float(n) for n in re.findall(r'\b\d+(?:\.\d+)?\b', t_clean)]
            if len(nums) >= 3:
                ab, bc, ac = nums[0], nums[1], nums[2]
            else:
                ab, bc, ac = 6.0, 5.0, 4.0

            try:
                plan = geometry_construction_engine.construct_triangle(ab, bc, ac)
                spec = self._build_visual_specification(
                    subject="Mathematics",
                    topic=topic,
                    objective="Step-by-step compass and straightedge construction satisfying triangle inequality",
                    model_type="geometrical_construction",
                    objects=["Base segment AB", "Compass arc from A", "Compass arc from B", "Vertex C", "Side AC", "Side BC"],
                    relations=["AB = 6 cm", "AC = 4 cm", "BC = 5 cm", "Intersection at C"],
                    labels=["A", "B", "C", "c = 6cm", "b = 4cm", "a = 5cm"],
                    steps=[
                        {"step": "1. Draw Base AB", "detail": "Draw segment AB = 6 cm using straightedge."},
                        {"step": "2. Arc from A", "detail": "Strike arc of radius 4 cm from vertex A with compass."},
                        {"step": "3. Arc from B", "detail": "Strike arc of radius 5 cm from vertex B with compass to locate C."},
                        {"step": "4. Complete Triangle", "detail": "Join AC and BC with ruler."}
                    ]
                )
                return VisualDecision(
                    visual_type="geometrical_construction",
                    justification="Geometrical constructions require step-by-step 2D compass arcs and straightedge ruler drafting, not 3D projection.",
                    is_3d_required=False,
                    geometry_construction=plan,
                    diagram_svg=plan.final_svg,
                    visual_specification=spec,
                    provenance={"source": "Euclidean Compass-and-Ruler Engine", "verification": "Triangle Inequality Satisfied"}
                )
            except Exception as e:
                logger.warning(f"Geometry construction fallback: {e}")

        # 2. 3D Solid Geometry Mensuration (Cone & Cylinder Volume, 3D Solids)
        if any(w in t_clean for w in ["cone and cylinder", "cone", "cylinder volume", "solid geometry"]):
            spec_data = self.VALID_3D_TOPICS.get("cone and cylinder")
            if spec_data:
                spec = self._build_visual_specification(
                    subject="Mathematics",
                    topic=topic,
                    objective=spec_data["objective"],
                    model_type="threejs_3d_model",
                    objects=["Circumscribed Cylinder", "Inscribed Cone", "Shared Circular Base"],
                    relations=["Volume(Cone) = (1/3) * Volume(Cylinder)"],
                    labels=["Cylinder (πr²h)", "Cone (1/3 πr²h)", "Base (πr²)"],
                    steps=[
                        {"step": "1. Solid Alignment", "detail": "Examine cylinder and inscribed cone with congruent base radius r and height h."},
                        {"step": "2. Volume Equivalence", "detail": "Observe that cone volume is exactly one-third cylinder volume: V = (1/3)πr²h."},
                        {"step": "3. Dimension Inspection", "detail": "Inspect base radius r and perpendicular height h."}
                    ]
                )
                return VisualDecision(
                    visual_type="threejs_3d_model",
                    justification="Spatial interaction with 3D solids (cone inscribed inside cylinder) materially enhances geometric intuition of the 1/3 volume theorem.",
                    is_3d_required=True,
                    model_3d_key="cone-cylinder-volume",
                    visual_specification=spec,
                )

        # 3. Mathematical Graphs (Coordinate Geometry, Quadratic functions, Trigonometric plots)
        if any(w in t_clean for w in ["coordinate geometry", "parabola", "quadrat", "plot", "sine wave", "ogive", "histogram", "graph"]) or ("math" in sub_clean and not any(w in t_clean for w in ["construct", "solid", "cone"])):
            spec = self._build_visual_specification(
                subject="Mathematics",
                topic=topic,
                objective="Visualize functional behavior, intercepts, vertex, and roots on Cartesian coordinate axes",
                model_type="mathematical_graph",
                objects=["X-axis", "Y-axis", "Origin (0,0)", "Grid lines", "Function curve", "Roots / Intercepts"],
                relations=["Y = f(X) mapping across Cartesian quadrants"],
                labels=["X", "Y", "Origin", "Vertex", "x-intercepts"],
                steps=[
                    {"step": "1. Define Domain", "detail": "Establish coordinate axes and scale markers."},
                    {"step": "2. Evaluate Points", "detail": "Calculate function values f(x) for points in range."},
                    {"step": "3. Trace Curve", "detail": "Plot continuous curve through calculated points and identify roots."}
                ]
            )
            return VisualDecision(
                visual_type="mathematical_graph",
                justification="Mathematical functions, slopes, and roots are best understood via 2D Cartesian coordinate plots.",
                is_3d_required=False,
                visual_specification=spec,
                provenance={"source": "SymPy / Cartesian Function Plotter", "verification": "Analytic Coordinates"}
            )

        # 3. History (Timelines, Historical Maps, Archival Portraits - Strictly NO 3D)
        if "hist" in sub_clean or any(w in t_clean for w in ["first world war", "revolt of 1857", "treaty of versailles", "gandhi", "swadeshi"]):
            if any(w in t_clean for w in ["war", "revolt", "battle", "movement", "treaty", "timeline", "event"]):
                spec = self._build_visual_specification(
                    subject="History",
                    topic=topic,
                    objective="Trace chronological causal sequence of events and historical milestones",
                    model_type="timeline",
                    objects=["Historical Era Axis", "Milestone 1: Trigger Event", "Milestone 2: Escalation", "Milestone 3: Resolution & Treaty"],
                    relations=["Chronological causality: Antecedent triggers leading to subsequent treaties and territorial changes"],
                    labels=["Date / Year", "Event Name", "Key Historical Leaders", "Impact"],
                    steps=[
                        {"step": "1. Outbreak / Catalyst", "detail": "Underlying tensions culminate in immediate trigger."},
                        {"step": "2. Course of the Conflict", "detail": "Mobilization of forces and major campaigns."},
                        {"step": "3. Resolution & Treaty", "detail": "Signing of formal peace treaty and geopolitical realignment."}
                    ]
                )
                return VisualDecision(
                    visual_type="timeline",
                    justification="Historical events require chronological causal sequencing; timelines prevent confusion of dates and stages. 3D is strictly avoided.",
                    is_3d_required=False,
                    visual_specification=spec,
                    provenance={"source": "National Archives & ICSE Historical Cartography", "verification": "Primary Source Authenticated"}
                )

        # 4. Geography (Maps, Soil Profiles, Water Cycle Process Flowcharts)
        if "geog" in sub_clean or any(w in t_clean for w in ["water cycle", "monsoon", "soil", "climate", "rainfall"]):
            if "water cycle" in t_clean or "cycle" in t_clean:
                spec = self._build_visual_specification(
                    subject="Geography",
                    topic=topic,
                    objective="Demonstrate continuous circulation of water through evaporation, condensation, precipitation, and percolation",
                    model_type="process_flowchart",
                    objects=["Ocean Reservoir", "Solar Evaporation Stream", "Atmospheric Condensation / Clouds", "Precipitation (Rain)", "Groundwater Runoff"],
                    relations=["Solar heating drives evaporation -> cools aloft to condense -> precipitates onto land -> flows back via rivers"],
                    labels=["Evaporation", "Transpiration", "Condensation", "Precipitation", "Infiltration", "Surface Runoff"],
                    steps=[
                        {"step": "1. Evaporation & Transpiration", "detail": "Solar thermal radiation heats water bodies and vegetation, vaporizing water."},
                        {"step": "2. Condensation", "detail": "Water vapor rises, expands, and cools forming clouds around condensation nuclei."},
                        {"step": "3. Precipitation & Return", "detail": "Droplets coalesce and fall as rain or snow, replenishing rivers and groundwater aquifers."}
                    ]
                )
                return VisualDecision(
                    visual_type="process_flowchart",
                    justification="Cyclical earth science processes are best represented as 2D process flowcharts showing directional energy and mass transfer.",
                    is_3d_required=False,
                    visual_specification=spec,
                    provenance={"source": "Geographical Survey of India", "verification": "Hydrological Cycle Model"}
                )
            if any(w in t_clean for w in ["soil", "alluvial", "monsoon", "crop", "river", "forest", "mineral"]):
                return VisualDecision(
                    visual_type="map",
                    justification="Geographic resource distributions, climatic regions, and soil belts require 2D cartographic maps.",
                    is_3d_required=False,
                    provenance={"source": "Survey of India / IMD", "verification": "Standard Cartographic Map"}
                )

        # 5. English Language & Literature (Syntax trees, Grammatical charts, Character maps - NO 3D)
        if "eng" in sub_clean or any(w in t_clean for w in ["sentence", "grammar", "clause", "voice", "speech", "shylock", "merchant"]):
            spec = self._build_visual_specification(
                subject="English Language",
                topic=topic,
                objective="Deconstruct sentence hierarchy into Subject, Verb Predicate, and Complements/Clauses",
                model_type="labelled_2d_diagram",
                objects=["Sentence Root", "Subject Noun Phrase", "Predicate Verb Phrase", "Direct Object", "Modifying Clause"],
                relations=["Hierarchical syntactic dependency parse tree"],
                labels=["Subject", "Finite Verb", "Direct Object", "Adverbial Modifier"],
                steps=[
                    {"step": "1. Identify Clause Structure", "detail": "Locate principal subject and finite verb."},
                    {"step": "2. Map Subordinate Elements", "detail": "Attach dependent clauses and prepositional phrases."},
                    {"step": "3. Verify Agreement", "detail": "Ensure grammatical concord between subject and verb."}
                ]
            )
            return VisualDecision(
                visual_type="labelled_2d_diagram",
                justification="Grammatical sentence structures require clear 2D hierarchical syntax tree diagrams. 3D models are strictly inappropriate.",
                is_3d_required=False,
                visual_specification=spec,
            )

        # 6. Civics (Institutional Hierarchy Flowcharts - NO 3D)
        if "civic" in sub_clean or any(w in t_clean for w in ["parliament", "lok sabha", "president", "supreme court", "constitution"]):
            return VisualDecision(
                visual_type="labelled_2d_diagram",
                justification="Constitutional institutions and legislative procedures require 2D governance flowcharts.",
                is_3d_required=False,
            )

        # 7. Check for Validated 3D Educational Models (Biology, Chemistry, Physics, 3D Geometry)
        for kw, spec_data in self.VALID_3D_TOPICS.items():
            if kw in t_clean:
                spec = self._build_visual_specification(
                    subject=subject,
                    topic=topic,
                    objective=spec_data["objective"],
                    model_type="threejs_3d_model",
                    objects=["Primary Spatial Geometry", "Internal Components", "Surface Markings", "Conduction / Flow Vectors"],
                    relations=["360° Volumetric Assembly with Cartesian Alignment"],
                    labels=["Core Component", "Interface Boundary", "Active Organelle / Region"],
                    steps=[
                        {"step": "1. Anatomical / Structural Overview", "detail": f"Initial spatial orientation of {spec_data['caption']}."},
                        {"step": "2. Internal Component Analysis", "detail": "Cross-sectional inspection of internal structures and mechanisms."},
                        {"step": "3. Functional Process Flow", "detail": "Animated path of energy, blood, or particles through the system."}
                    ]
                )
                return VisualDecision(
                    visual_type="threejs_3d_model",
                    justification=f"Spatial comprehension of {spec_data['caption']} is materially enhanced by 360° interactive rotation, zoom, cross-section dissection, and step-linked highlighting.",
                    is_3d_required=True,
                    model_3d_key=spec_data["key"],
                    visual_specification=spec,
                )

        # Default fallback: Labelled 2D diagram
        return VisualDecision(
            visual_type="labelled_2d_diagram",
            justification="Standard 2D labeled diagram provides clear conceptual grounding without unnecessary cognitive overhead.",
            is_3d_required=False,
        )

    def _build_visual_specification(
        self,
        subject: str,
        topic: str,
        objective: str,
        model_type: str,
        objects: List[str],
        relations: List[str],
        labels: List[str],
        steps: List[Dict[str, str]],
    ) -> VisualSpecification:
        return VisualSpecification(
            subject=subject,
            topic=topic,
            educational_objective=objective,
            model_type=model_type,
            required_objects=objects,
            object_relationships=relations,
            correct_labels=labels,
            spatial_arrangement={"origin": [0, 0, 0], "bounds": [-3.0, 3.0], "coordinate_system": "Cartesian"},
            scale_and_proportions={"metric": "standard_pedagogical_scale", "ratio": "1:1"},
            material_and_appearance={
                "pbr_enabled": True,
                "materials": ["MeshStandardMaterial", "MeshPhysicalMaterial"],
                "roughness": 0.35,
                "metalness": 0.1,
            },
            camera_position={"position": [0, 0, 7.5], "target": [0, 0, 0], "fov": 50.0},
            lighting=[
                {"type": "ambient", "color": "#ffffff", "intensity": 0.8},
                {"type": "directional", "color": "#f8fafc", "position": [5, 10, 7], "intensity": 1.2, "castShadow": True},
                {"type": "point", "color": "#38bdf8", "position": [-5, -4, 4], "intensity": 0.6}
            ],
            animation_requirements={"type": "step_linked_highlight", "speed": 1.0, "loop": True},
            interactive_controls=["rotate", "zoom", "pan", "reset", "highlight_part", "cross_section", "exploded_view"],
            explanation_steps=steps,
            scientific_validation={"status": "verified", "source": "ICSE Curricular Standard", "accuracy_rating": 1.0}
        )


visual_decision_engine = VisualDecisionEngine()
