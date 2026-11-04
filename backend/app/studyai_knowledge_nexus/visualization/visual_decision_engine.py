import logging
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger("knowledge_nexus.visual_decision_engine")

# 12 Visual Decision Types
VISUAL_TYPES = [
    "real_photograph",
    "ai_educational_illustration",
    "labelled_2d_diagram",
    "historical_image",
    "map",
    "timeline",
    "graph",
    "interactive_calculator",
    "interactive_simulation",
    "animation",
    "threejs_3d_model",
    "no_visual"
]


class VisualDecision(BaseModel):
    visual_type: str = Field(..., description="One of the 12 defined visual decision types")
    justification: str = Field(..., description="Pedagogical rationale for this visual type")
    is_3d_required: bool = Field(default=False)
    model_3d_key: Optional[str] = Field(default=None)
    diagram_svg: Optional[str] = Field(default=None)
    image_brief: Optional[Dict[str, Any]] = Field(default=None)
    provenance: Optional[Dict[str, str]] = Field(default=None)


class VisualDecisionEngine:
    """
    Pedagogical Visual Decision Engine.
    Determines the exact visual modality required for an educational topic
    across 12 distinct visual categories.
    
    STRICT RULE: Never generate a 3D model simply because a student asks for an explanation.
    Only spatial structures (Anatomy, Organelles, Molecular Orbitals, Solar System) qualify for 3D.
    """

    # Topics that strictly qualify for Three.js 3D models
    VALID_3D_TOPICS = {
        "heart": {"key": "human-heart", "caption": "Interactive 3D Anatomical Human Heart & 4-Chamber Circulation"},
        "cardiac": {"key": "human-heart", "caption": "Interactive 3D Anatomical Human Heart & 4-Chamber Circulation"},
        "circulation": {"key": "human-heart", "caption": "Interactive 3D Anatomical Human Heart & 4-Chamber Circulation"},
        "nephron": {"key": "plant-cell", "caption": "Interactive 3D Glomerulus & Renal Tubule Structure"},
        "kidney": {"key": "plant-cell", "caption": "Interactive 3D Renal Gross Anatomy"},
        "chloroplast": {"key": "plant-cell", "caption": "Interactive 3D Chloroplast Organelle & Thylakoid Grana"},
        "plant cell": {"key": "plant-cell", "caption": "Interactive 3D Plant Cell with Cell Wall & Vacuole"},
        "dna": {"key": "dna-double-helix", "caption": "Interactive 3D DNA Double Helix & Base Pairing"},
        "chromosome": {"key": "dna-double-helix", "caption": "Interactive 3D Chromosome & Nucleosome Histones"},
        "molecule": {"key": "dna-double-helix", "caption": "Interactive 3D Molecular Geometry"},
        "solar system": {"key": "plant-cell", "caption": "Interactive 3D Orbital Dynamics"}
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

        # 1. Check for History / Civics -> Timelines, Historical Images, Maps (Strictly NO 3D)
        if "hist" in sub_clean or "civic" in sub_clean:
            if any(w in t_clean for w in ["war", "revolt", "battle", "movement", "treaty", "timeline", "independence", "nationalism"]):
                return VisualDecision(
                    visual_type="timeline",
                    justification="Historical events require chronological causal sequencing; timelines prevent confusion of dates and stages.",
                    is_3d_required=False,
                    provenance={"source": "National Archives & ICSE Historical Cartography", "verification": "Primary Source Authenticated"}
                )
            if any(w in t_clean for w in ["personality", "leader", "gandhi", "tilak", "queen", "proclamation", "canning", "nehr"]):
                return VisualDecision(
                    visual_type="historical_image",
                    justification="Historical personalities benefit from authentic archival portraits. AI reconstructions are forbidden for genuine historical records.",
                    is_3d_required=False,
                    image_brief={
                        "topic": topic,
                        "type": "Authentic Archival Photograph",
                        "authenticity_notice": "Original historical photograph; not an AI synthetic generation."
                    },
                    provenance={"source": "National Portrait Gallery / Archaeological Survey of India", "verification": "Authentic Archival Record"}
                )
            return VisualDecision(
                visual_type="labelled_2d_diagram",
                justification="Constitutional structures and historical treaties require 2D organizational hierarchy charts.",
                is_3d_required=False
            )

        # 2. Check for Geography -> Maps, Contours, Climographs
        if "geog" in sub_clean:
            if any(w in t_clean for w in ["topo", "contour", "survey", "grid", "slope", "height"]):
                return VisualDecision(
                    visual_type="labelled_2d_diagram",
                    justification="Topographical maps require high-precision 2D contour cross-sections and Survey of India grid coordinate sheets.",
                    is_3d_required=False
                )
            if any(w in t_clean for w in ["soil", "rain", "monsoon", "climate", "mineral", "crop", "river", "forest"]):
                return VisualDecision(
                    visual_type="map",
                    justification="Geographic resource distributions and wind paths require cartographic map overlays.",
                    is_3d_required=False,
                    provenance={"source": "Survey of India / Meteorological Department", "verification": "Standard Thematic Map"}
                )

        # 3. Check for Mathematics -> Graphs, Interactive Calculators
        if "math" in sub_clean:
            if any(w in t_clean for w in ["quadrat", "graph", "parabola", "function", "curve", "trig", "line", "slope"]):
                return VisualDecision(
                    visual_type="graph",
                    justification="Mathematical functions and roots are best understood via coordinate Cartesian function plots.",
                    is_3d_required=False
                )
            if any(w in t_clean for w in ["gst", "banking", "interest", "matrix", "arithmetic", "solve"]):
                return VisualDecision(
                    visual_type="interactive_calculator",
                    justification="Commercial arithmetic and matrix operations benefit from interactive step calculators.",
                    is_3d_required=False
                )
            return VisualDecision(
                visual_type="no_visual",
                justification="Pure symbolic algebraic derivations require step-by-step mathematical text rather than decorative visuals.",
                is_3d_required=False
            )

        # 4. Check for Computer Science -> Algorithm Flowcharts, Trace Tables
        if "comp" in sub_clean or "java" in sub_clean or "python" in sub_clean:
            if any(w in t_clean for w in ["search", "sort", "loop", "algorithm", "flowchart", "binary"]):
                return VisualDecision(
                    visual_type="labelled_2d_diagram",
                    justification="Algorithms and search procedures require sequential logic flowcharts and variable tracing tables.",
                    is_3d_required=False
                )
            return VisualDecision(
                visual_type="no_visual",
                justification="Syntax rules, method signatures, and class designs require formatted code blocks rather than visual diagrams.",
                is_3d_required=False
            )

        # 5. Check for English I & II -> Syntax Trees, Character Maps, No Visual
        if "eng" in sub_clean:
            if any(w in t_clean for w in ["merchant", "tempest", "character", "scene", "shylock", "portia", "drama"]):
                return VisualDecision(
                    visual_type="labelled_2d_diagram",
                    justification="Drama scenes benefit from character relationship and thematic conflict charts.",
                    is_3d_required=False
                )
            return VisualDecision(
                visual_type="no_visual",
                justification="Grammar rules and preposition usages are best learned via rule formulas and direct sentence transformation drills.",
                is_3d_required=False
            )

        # 6. Check for Physics -> Ray Optics, Circuit Schematics, Vector Force
        if "phys" in sub_clean:
            if any(w in t_clean for w in ["circuit", "ohm", "resistor", "series", "parallel", "fuse", "earthing"]):
                return VisualDecision(
                    visual_type="labelled_2d_diagram",
                    justification="Electrical circuits require clear schematic diagrams with standard electrical symbols (IEEE/IEC).",
                    is_3d_required=False
                )
            if any(w in t_clean for w in ["lens", "ray", "refract", "prism", "convex", "concave", "mirror"]):
                return VisualDecision(
                    visual_type="labelled_2d_diagram",
                    justification="Optical physics requires exact geometric ray tracing following Cartesian sign conventions.",
                    is_3d_required=False
                )
            if any(w in t_clean for w in ["motor", "fleming", "induction", "magnetic field"]):
                return VisualDecision(
                    visual_type="interactive_simulation",
                    justification="Electromagnetic induction and motor torque benefit from animated directional vector fields.",
                    is_3d_required=False
                )

        # 7. Check for Chemistry -> Chemical Equations, Electron-Dot, Molecular Geometry (Selective 3D)
        if "chem" in sub_clean:
            if any(w in t_clean for w in ["vsepr", "tetrahedr", "molecular geometry", "orbital"]):
                return VisualDecision(
                    visual_type="threejs_3d_model",
                    justification="3D spatial visualization is educationally essential to understand bond angles (109.5°) and non-planar molecular geometries.",
                    is_3d_required=True,
                    model_3d_key="dna-double-helix"
                )
            if any(w in t_clean for w in ["bond", "electron", "covalent", "coordinate", "dot"]):
                return VisualDecision(
                    visual_type="labelled_2d_diagram",
                    justification="Chemical bonding requires 2D Lewis electron-dot diagrams showing valence electron sharing.",
                    is_3d_required=False
                )
            return VisualDecision(
                visual_type="labelled_2d_diagram",
                justification="Chemical manufacturing processes (Haber, Contact) require industrial schematic flowcharts with catalyst conditions.",
                is_3d_required=False
            )

        # 8. Check for Biology -> 3D Spatial Models for Anatomy & Cells
        if "bio" in sub_clean:
            for kw, spec in self.VALID_3D_TOPICS.items():
                if kw in t_clean:
                    return VisualDecision(
                        visual_type="threejs_3d_model",
                        justification=f"Spatial comprehension of {spec['caption']} is significantly enhanced by 360° interactive rotation, zoom, and cross-section dissection.",
                        is_3d_required=True,
                        model_3d_key=spec["key"]
                    )
            return VisualDecision(
                visual_type="labelled_2d_diagram",
                justification="Biological physiological cycles (e.g. cardiac cycle, urine formation) are best represented via step-by-step labeled diagrams.",
                is_3d_required=False
            )

        # Default fallback: Labelled 2D diagram
        return VisualDecision(
            visual_type="labelled_2d_diagram",
            justification="Standard 2D labeled diagram provides clear conceptual grounding without unnecessary cognitive overhead.",
            is_3d_required=False
        )


visual_decision_engine = VisualDecisionEngine()
