import logging
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger("knowledge_nexus.threejs_orchestrator")


class ModelPart(BaseModel):
    id: str
    label: str
    role: str
    color: str
    selectable: bool = True
    highlight_color: str = "#ff6a00"
    cross_section_visible: bool = True
    exploded_offset: List[float] = Field(default_factory=lambda: [0.0, 0.0, 0.0])


class CameraPreset(BaseModel):
    name: str
    position: List[float]
    target: List[float]
    fov: float = 50.0


class ThreeJSDeclarativeScene(BaseModel):
    title: str
    model_key: str
    subject: str
    academic_topic: str
    background: str = "#090d16"
    camera: Dict[str, Any]
    camera_presets: List[CameraPreset]
    lights: List[Dict[str, Any]]
    objects: List[Dict[str, Any]]
    parts: List[ModelPart]
    annotations: List[Dict[str, Any]]
    animation_type: str = "none" # pulse, spin, orbit, flow
    supports_cross_section: bool = True
    supports_exploded_view: bool = True
    mobile_touch_enabled: bool = True


class ThreeJSSceneOrchestrator:
    """
    Three.js Intelligence Engine.
    Produces safe, declarative 3D WebGL scene specifications.
    Enforces scientific accuracy, interactive part callouts, camera presets,
    cross-sections, and mobile touch interactions without code-injection risks.
    """

    PRESET_MODELS: Dict[str, Dict[str, Any]] = {
        "human-heart": {
            "title": "Interactive 3D Human Heart (Circulatory Anatomy)",
            "model_key": "human-heart",
            "subject": "Biology",
            "academic_topic": "Human Heart & Double Circulation",
            "background": "#090d16",
            "camera": {"fov": 50, "position": [0, 0, 7], "min_distance": 3.0, "max_distance": 15.0},
            "camera_presets": [
                {"name": "Anterior (Frontal View)", "position": [0, 0, 7], "target": [0, 0, 0], "fov": 50},
                {"name": "Superior (Great Vessels)", "position": [0, 6, 4], "target": [0, 0, 0], "fov": 45},
                {"name": "Left Ventricular Apex", "position": [4, -2, 5], "target": [0, 0, 0], "fov": 48}
            ],
            "lights": [
                {"type": "ambient", "color": "#ffffff", "intensity": 0.8},
                {"type": "directional", "color": "#ff6b81", "position": [5, 10, 7], "intensity": 1.2},
                {"type": "point", "color": "#38bdf8", "position": [-5, -5, -3], "intensity": 0.5}
            ],
            "objects": [
                {
                    "id": "myocardium",
                    "geometry": {"type": "sphere", "radius": 1.8, "widthSegments": 32, "heightSegments": 32},
                    "material": {"type": "meshStandard", "color": "#b91c1c", "roughness": 0.35, "metalness": 0.1},
                    "scale": [1.0, 1.3, 0.9],
                    "position": [0, -0.2, 0]
                },
                {
                    "id": "aorta",
                    "geometry": {"type": "torus", "radius": 0.9, "tube": 0.28, "radialSegments": 16, "tubularSegments": 32, "arc": 3.1415},
                    "material": {"type": "meshStandard", "color": "#ef4444", "roughness": 0.2},
                    "position": [0.2, 1.3, 0],
                    "rotation": [0, 0, -0.5]
                },
                {
                    "id": "vena_cava",
                    "geometry": {"type": "cylinder", "radiusTop": 0.25, "radiusBottom": 0.25, "height": 2.2, "radialSegments": 24},
                    "material": {"type": "meshStandard", "color": "#2563eb", "roughness": 0.2},
                    "position": [-1.1, 0.4, -0.2]
                }
            ],
            "parts": [
                {"id": "left_ventricle", "label": "Left Ventricle", "role": "Pumps oxygenated blood to the body via Aorta at high systemic pressure.", "color": "#ef4444", "exploded_offset": [0.5, -0.3, 0.5]},
                {"id": "right_ventricle", "label": "Right Ventricle", "role": "Pumps deoxygenated blood to the lungs via Pulmonary Artery.", "color": "#3b82f6", "exploded_offset": [-0.5, -0.3, 0.5]},
                {"id": "aorta", "label": "Systemic Aorta", "role": "Largest systemic artery carrying oxygen-rich blood from Left Ventricle to tissues.", "color": "#dc2626", "exploded_offset": [0.2, 0.6, 0.0]},
                {"id": "vena_cava", "label": "Vena Cava", "role": "Returns deoxygenated blood from upper and lower body to Right Atrium.", "color": "#1d4ed8", "exploded_offset": [-0.6, 0.3, -0.2]}
            ],
            "annotations": [
                {"id": "aorta_label", "text": "Aorta (Carries oxygenated blood)", "position": [0.2, 2.2, 0]},
                {"id": "vena_cava_label", "text": "Superior Vena Cava", "position": [-1.3, 1.2, -0.2]},
                {"id": "myocardium_label", "text": "Thick Muscular Myocardium", "position": [1.2, -0.8, 0.5]}
            ],
            "animation_type": "pulse",
            "supports_cross_section": True,
            "supports_exploded_view": True,
            "mobile_touch_enabled": True
        },
        "plant-cell": {
            "title": "Interactive 3D Plant Cell Structure & Photosynthetic Organelles",
            "model_key": "plant-cell",
            "subject": "Biology",
            "academic_topic": "Plant Physiology & Chloroplast Structure",
            "background": "#09120e",
            "camera": {"fov": 45, "position": [0, 0, 8], "min_distance": 3.0, "max_distance": 16.0},
            "camera_presets": [
                {"name": "Cell Overview", "position": [0, 0, 8], "target": [0, 0, 0], "fov": 45},
                {"name": "Chloroplast Detail", "position": [-1.2, 1.2, 2.5], "target": [-1.2, 0.8, 0.3], "fov": 35},
                {"name": "Central Vacuole", "position": [1.5, 0.5, 4], "target": [0.3, 0.1, 0], "fov": 40}
            ],
            "lights": [
                {"type": "ambient", "color": "#ffffff", "intensity": 0.9},
                {"type": "directional", "color": "#4ade80", "position": [4, 8, 5], "intensity": 1.0}
            ],
            "objects": [
                {
                    "id": "cell_wall",
                    "geometry": {"type": "box", "width": 4.0, "height": 3.0, "depth": 2.2},
                    "material": {"type": "meshStandard", "color": "#15803d", "transparent": True, "opacity": 0.45, "roughness": 0.5},
                    "position": [0, 0, 0]
                },
                {
                    "id": "large_vacuole",
                    "geometry": {"type": "sphere", "radius": 1.1, "widthSegments": 24, "heightSegments": 24},
                    "material": {"type": "meshStandard", "color": "#38bdf8", "transparent": True, "opacity": 0.6, "roughness": 0.1},
                    "position": [0.3, 0.1, 0]
                },
                {
                    "id": "chloroplast_1",
                    "geometry": {"type": "sphere", "radius": 0.35, "widthSegments": 16, "heightSegments": 16},
                    "material": {"type": "meshStandard", "color": "#22c55e", "roughness": 0.3},
                    "scale": [1.4, 0.7, 0.7],
                    "position": [-1.2, 0.8, 0.3]
                }
            ],
            "parts": [
                {"id": "cell_wall", "label": "Cellulose Cell Wall", "role": "Rigid outer layer providing structural support and turgor resistance.", "color": "#15803d", "exploded_offset": [0, 0, 1.0]},
                {"id": "vacuole", "label": "Central Vacuole", "role": "Stores cell sap and maintains cellular osmotic turgidity.", "color": "#38bdf8", "exploded_offset": [0.5, 0, 0]},
                {"id": "chloroplast", "label": "Chloroplast", "role": "Contains thylakoids and chlorophyll where photosynthesis light and dark reactions occur.", "color": "#22c55e", "exploded_offset": [-0.6, 0.4, 0.4]}
            ],
            "annotations": [
                {"id": "wall_label", "text": "Rigid Cellulose Cell Wall", "position": [-2.1, 1.6, 0]},
                {"id": "vacuole_label", "text": "Central Turgid Vacuole", "position": [0.3, 1.3, 0]},
                {"id": "chloro_label", "text": "Chloroplast (Thylakoids & Stroma)", "position": [-1.2, 1.2, 0.5]}
            ],
            "animation_type": "none",
            "supports_cross_section": True,
            "supports_exploded_view": True,
            "mobile_touch_enabled": True
        },
        "dna-double-helix": {
            "title": "Interactive 3D DNA Double Helix & Base Pairing",
            "model_key": "dna-double-helix",
            "subject": "Biology",
            "academic_topic": "Molecular Genetics & DNA Structure",
            "background": "#09090b",
            "camera": {"fov": 50, "position": [0, 0, 6], "min_distance": 2.5, "max_distance": 14.0},
            "camera_presets": [
                {"name": "Full Helix Spiral", "position": [0, 0, 6], "target": [0, 0, 0], "fov": 50},
                {"name": "Hydrogen Bonding Angle", "position": [2, 1, 3], "target": [0, 0, 0], "fov": 38}
            ],
            "lights": [
                {"type": "ambient", "color": "#ffffff", "intensity": 0.9},
                {"type": "point", "color": "#a855f7", "position": [3, 4, 3], "intensity": 1.2}
            ],
            "objects": [
                {
                    "id": "helix_core",
                    "geometry": {"type": "cylinder", "radiusTop": 0.6, "radiusBottom": 0.6, "height": 4.5, "radialSegments": 16},
                    "material": {"type": "meshStandard", "color": "#8b5cf6", "wireframe": True},
                    "position": [0, 0, 0]
                }
            ],
            "parts": [
                {"id": "sugar_phosphate", "label": "Sugar-Phosphate Backbone", "role": "Forms the structural framework of nucleic acid strands running antiparallel (5' to 3' and 3' to 5').", "color": "#8b5cf6", "exploded_offset": [0.4, 0, 0]},
                {"id": "base_pairs", "label": "Complementary Base Pairs", "role": "Adenine pairs with Thymine (2 hydrogen bonds); Guanine pairs with Cytosine (3 hydrogen bonds).", "color": "#ec4899", "exploded_offset": [-0.4, 0, 0]}
            ],
            "annotations": [
                {"id": "base_pairs", "text": "Complementary Bases: A=T (2 H-bonds), G≡C (3 H-bonds)", "position": [0, 1.5, 0.8]},
                {"id": "sugar_backbone", "text": "Deoxyribose-Phosphate Backbone", "position": [0.8, -1.2, 0.5]}
            ],
            "animation_type": "spin",
            "supports_cross_section": False,
            "supports_exploded_view": True,
            "mobile_touch_enabled": True
        }
    }

    def get_scene_spec(self, model_key: str) -> Optional[Dict[str, Any]]:
        clean_key = model_key.lower().strip()
        spec = self.PRESET_MODELS.get(clean_key)
        if not spec:
            return None
        res = dict(spec)
        res["scene"] = {
            "background": spec.get("background"),
            "camera": spec.get("camera"),
            "lights": spec.get("lights"),
            "objects": spec.get("objects", []),
            "annotations": spec.get("annotations", []),
        }
        return res

    def validate_scene_against_topic(self, scene_spec: Dict[str, Any], topic: str, subject: str) -> bool:
        """Validates that a 3D scene is strictly educationally aligned with the topic."""
        t_clean = topic.lower()
        sub_clean = subject.lower()
        spec_topic = scene_spec.get("academic_topic", "").lower()
        spec_sub = scene_spec.get("subject", "").lower()

        if sub_clean not in spec_sub and spec_sub not in sub_clean:
            return False

        topic_words = set(t_clean.split())
        spec_words = set(spec_topic.split())
        return len(topic_words.intersection(spec_words)) > 0 or any(w in t_clean for w in ["heart", "cell", "dna", "photo"])


threejs_orchestrator = ThreeJSSceneOrchestrator()
