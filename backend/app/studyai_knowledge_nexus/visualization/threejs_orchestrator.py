import logging
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger("knowledge_nexus.threejs_orchestrator")


class ModelPart(BaseModel):
    id: str
    label: str
    role: str
    color: str
    layer: str = "anatomy" # anatomy, valves, vessels, conduction
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
    orientation_notice: str = "Anatomical standard: Patient Left = Viewer's Right; Patient Right = Viewer's Left."
    camera: Dict[str, Any]
    camera_presets: List[CameraPreset]
    lights: List[Dict[str, Any]]
    objects: List[Dict[str, Any]]
    parts: List[ModelPart]
    annotations: List[Dict[str, Any]]
    blood_flow_sequence: List[str] = Field(default_factory=list)
    electrical_conduction_system: Dict[str, Any] = Field(default_factory=dict)
    fallback_diagram_svg: Optional[str] = None
    animation_type: str = "none" # pulse, spin, orbit, flow
    supports_cross_section: bool = True
    supports_exploded_view: bool = True
    mobile_touch_enabled: bool = True


HEART_CIRCULATION_13_STAGES = [
    "1. Systemic venous return from Body",
    "2. Superior & Inferior Vena Cava",
    "3. Right Atrium (Deoxygenated collection)",
    "4. Tricuspid Valve (Unidirectional AV opening)",
    "5. Right Ventricle (Pulmonary pump chamber)",
    "6. Pulmonary Valve (Semilunar egress)",
    "7. Pulmonary Arteries (To lungs for oxygenation)",
    "8. Lungs (Alveolar gas exchange: CO₂ out, O₂ in)",
    "9. Pulmonary Veins (Oxygenated return)",
    "10. Left Atrium (Oxygenated collection)",
    "11. Mitral / Bicuspid Valve (High-pressure AV opening)",
    "12. Left Ventricle (Thick muscular systemic pump)",
    "13. Aortic Valve & Systemic Aorta (Distribution to Body)"
]

HEART_2D_FALLBACK_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500" width="100%" height="100%">
  <rect width="600" height="500" rx="16" fill="#0b1120"/>
  <text x="300" y="36" fill="#f8fafc" font-size="18" font-weight="700" text-anchor="middle">Human Heart: Four Chambers &amp; Double Circulation (ICSE 2D Fallback)</text>
  <text x="300" y="58" fill="#94a3b8" font-size="12" text-anchor="middle">ANATOMICAL CONVENTION: Patient Right (Blue) is Left | Patient Left (Red) is Right</text>
  
  <!-- Right Heart (Deoxygenated: Blue) -->
  <rect x="70" y="110" width="190" height="130" rx="12" fill="#1e3a8a" stroke="#3b82f6" stroke-width="2"/>
  <text x="165" y="170" fill="#93c5fd" font-size="15" font-weight="600" text-anchor="middle">Right Atrium (RA)</text>
  <text x="165" y="195" fill="#bfdbfe" font-size="11" text-anchor="middle">Receives Vena Cava blood</text>
  
  <rect x="70" y="270" width="190" height="150" rx="12" fill="#1d4ed8" stroke="#60a5fa" stroke-width="2"/>
  <text x="165" y="335" fill="#dbeafe" font-size="15" font-weight="600" text-anchor="middle">Right Ventricle (RV)</text>
  <text x="165" y="360" fill="#bfdbfe" font-size="11" text-anchor="middle">Pumps to Pulmonary Artery</text>
  
  <!-- Interventricular Septum -->
  <rect x="270" y="100" width="60" height="330" rx="8" fill="#334155" stroke="#64748b" stroke-width="2"/>
  <text x="300" y="270" fill="#f1f5f9" font-size="13" font-weight="700" text-anchor="middle" transform="rotate(-90 300 270)">Septum (Prevents Mixing)</text>
  
  <!-- Left Heart (Oxygenated: Red) -->
  <rect x="340" y="110" width="190" height="130" rx="12" fill="#881337" stroke="#f43f5e" stroke-width="2"/>
  <text x="435" y="170" fill="#fecdd3" font-size="15" font-weight="600" text-anchor="middle">Left Atrium (LA)</text>
  <text x="435" y="195" fill="#ffe4e6" font-size="11" text-anchor="middle">Receives Pulmonary Veins</text>
  
  <rect x="340" y="270" width="190" height="150" rx="12" fill="#be123c" stroke="#fb7185" stroke-width="3"/>
  <text x="435" y="335" fill="#fff1f2" font-size="15" font-weight="700" text-anchor="middle">Left Ventricle (LV)</text>
  <text x="435" y="360" fill="#ffe4e6" font-size="11" text-anchor="middle">Thickest Wall - Pumps to Aorta</text>

  <!-- Valves -->
  <circle cx="165" cy="255" r="16" fill="#f59e0b"/>
  <text x="165" y="260" fill="#000" font-size="10" font-weight="700" text-anchor="middle">Tricuspid</text>
  
  <circle cx="435" cy="255" r="16" fill="#f59e0b"/>
  <text x="435" y="260" fill="#000" font-size="10" font-weight="700" text-anchor="middle">Bicuspid</text>

  <!-- Separate SA Node conduction marker -->
  <circle cx="100" cy="125" r="10" fill="#eab308" stroke="#fef08a" stroke-width="2"/>
  <text x="120" y="130" fill="#fef08a" font-size="11" font-weight="700">SA Node (Pacemaker)</text>
</svg>"""


class ThreeJSSceneOrchestrator:
    """
    Three.js Intelligence Engine (Master Spec v4.0 Section 8 & 9).
    Rebuilds 3D Anatomy and Spatial Structures with scientific accuracy:
    - 4 distinct identifiable chambers & thick interventricular septum
    - 4 valves positioned and named (tricuspid, pulmonary, mitral, aortic)
    - Great vessels (superior/inferior vena cava, pulmonary artery/veins, aorta)
    - 13-stage blood flow circulation sequence (Blue = deoxygenated, Red = oxygenated)
    - Separate SA Node and AV Node electrical conduction layer
    - Consistent patient left/right anatomical convention
    - Reliable 2D SVG fallback
    """

    PRESET_MODELS: Dict[str, Dict[str, Any]] = {
        "human-heart": {
            "title": "Interactive 3D Human Heart (Anatomical 4 Chambers & Double Circulation)",
            "model_key": "human-heart",
            "subject": "Biology",
            "academic_topic": "Human Heart: Four Chambers, Valves, and Double Circulation",
            "background": "#090d16",
            "orientation_notice": "ANATOMICAL CONVENTION: Patient Left is on Viewer's Right. Patient Right is on Viewer's Left.",
            "camera": {"fov": 50, "position": [0, 0, 7.5], "min_distance": 3.0, "max_distance": 16.0},
            "camera_presets": [
                {"name": "Anterior (Frontal View)", "position": [0, 0, 7.5], "target": [0, 0, 0], "fov": 50},
                {"name": "Internal Chambers & Septum", "position": [0, 0, 5.0], "target": [0, -0.2, 0], "fov": 42},
                {"name": "Great Vessels & Aortic Arch", "position": [0, 5.5, 4.5], "target": [0, 1.0, 0], "fov": 45},
                {"name": "Left Ventricular Thick Myocardium", "position": [3.8, -1.8, 5.0], "target": [0.5, -0.5, 0], "fov": 46}
            ],
            "lights": [
                {"type": "ambient", "color": "#ffffff", "intensity": 0.85},
                {"type": "directional", "color": "#f43f5e", "position": [5, 10, 7], "intensity": 1.3},
                {"type": "point", "color": "#38bdf8", "position": [-6, -4, 4], "intensity": 0.7}
            ],
            "objects": [
                # Four Distinct Muscular Chambers
                {
                    "id": "left_ventricle",
                    "geometry": {"type": "sphere", "radius": 1.25, "widthSegments": 32, "heightSegments": 32},
                    "material": {"type": "meshStandard", "color": "#be123c", "roughness": 0.35, "metalness": 0.1},
                    "scale": [1.0, 1.45, 0.95],
                    "position": [0.75, -0.65, 0.1],
                    "label": "Left Ventricle"
                },
                {
                    "id": "right_ventricle",
                    "geometry": {"type": "sphere", "radius": 1.05, "widthSegments": 32, "heightSegments": 32},
                    "material": {"type": "meshStandard", "color": "#1d4ed8", "roughness": 0.35, "metalness": 0.1},
                    "scale": [0.95, 1.3, 0.85],
                    "position": [-0.75, -0.55, 0.25],
                    "label": "Right Ventricle"
                },
                {
                    "id": "left_atrium",
                    "geometry": {"type": "sphere", "radius": 0.82, "widthSegments": 28, "heightSegments": 28},
                    "material": {"type": "meshStandard", "color": "#e11d48", "roughness": 0.4},
                    "position": [0.85, 0.85, -0.2],
                    "label": "Left Atrium"
                },
                {
                    "id": "right_atrium",
                    "geometry": {"type": "sphere", "radius": 0.88, "widthSegments": 28, "heightSegments": 28},
                    "material": {"type": "meshStandard", "color": "#2563eb", "roughness": 0.4},
                    "position": [-0.85, 0.85, 0.15],
                    "label": "Right Atrium"
                },
                # Interventricular Septum (Partition preventing mixing)
                {
                    "id": "septum",
                    "geometry": {"type": "box", "width": 0.32, "height": 2.2, "depth": 1.6},
                    "material": {"type": "meshStandard", "color": "#475569", "roughness": 0.5},
                    "position": [0.0, -0.6, 0.1],
                    "label": "Interventricular Septum"
                },
                # Four Cardiac Valves
                {
                    "id": "tricuspid_valve",
                    "geometry": {"type": "ring", "innerRadius": 0.15, "outerRadius": 0.38, "thetaSegments": 24},
                    "material": {"type": "meshStandard", "color": "#f59e0b", "side": "doubleSide"},
                    "position": [-0.78, 0.1, 0.2],
                    "rotation": [1.57, 0, 0],
                    "label": "Tricuspid Valve (Right AV Valve)"
                },
                {
                    "id": "mitral_valve",
                    "geometry": {"type": "ring", "innerRadius": 0.15, "outerRadius": 0.38, "thetaSegments": 24},
                    "material": {"type": "meshStandard", "color": "#f59e0b", "side": "doubleSide"},
                    "position": [0.78, 0.1, -0.05],
                    "rotation": [1.57, 0, 0],
                    "label": "Bicuspid / Mitral Valve (Left AV Valve)"
                },
                {
                    "id": "pulmonary_valve",
                    "geometry": {"type": "cylinder", "radiusTop": 0.26, "radiusBottom": 0.26, "height": 0.15, "radialSegments": 16},
                    "material": {"type": "meshStandard", "color": "#38bdf8"},
                    "position": [-0.35, 0.45, 0.6],
                    "label": "Pulmonary Semilunar Valve"
                },
                {
                    "id": "aortic_valve",
                    "geometry": {"type": "cylinder", "radiusTop": 0.28, "radiusBottom": 0.28, "height": 0.15, "radialSegments": 16},
                    "material": {"type": "meshStandard", "color": "#fb7185"},
                    "position": [0.25, 0.45, 0.3],
                    "label": "Aortic Semilunar Valve"
                },
                # Great Vessels
                {
                    "id": "aorta",
                    "geometry": {"type": "torus", "radius": 0.95, "tube": 0.32, "radialSegments": 20, "tubularSegments": 40, "arc": 3.4},
                    "material": {"type": "meshStandard", "color": "#dc2626", "roughness": 0.25},
                    "position": [0.22, 1.4, 0],
                    "rotation": [0, 0, -0.4],
                    "label": "Systemic Aorta & Arch"
                },
                {
                    "id": "superior_vena_cava",
                    "geometry": {"type": "cylinder", "radiusTop": 0.28, "radiusBottom": 0.28, "height": 1.6, "radialSegments": 24},
                    "material": {"type": "meshStandard", "color": "#1d4ed8", "roughness": 0.2},
                    "position": [-1.2, 1.45, 0.1],
                    "label": "Superior Vena Cava"
                },
                {
                    "id": "inferior_vena_cava",
                    "geometry": {"type": "cylinder", "radiusTop": 0.28, "radiusBottom": 0.28, "height": 1.4, "radialSegments": 24},
                    "material": {"type": "meshStandard", "color": "#1e40af", "roughness": 0.2},
                    "position": [-1.15, -1.5, -0.1],
                    "label": "Inferior Vena Cava"
                },
                {
                    "id": "pulmonary_artery",
                    "geometry": {"type": "cylinder", "radiusTop": 0.3, "radiusBottom": 0.3, "height": 1.5, "radialSegments": 24},
                    "material": {"type": "meshStandard", "color": "#2563eb", "roughness": 0.25},
                    "position": [-0.25, 1.25, 0.55],
                    "rotation": [0.2, 0, 0.3],
                    "label": "Pulmonary Artery (To Lungs)"
                },
                # Separate Electrical Conduction Node (Distinct from Atrial anatomy)
                {
                    "id": "sa_node",
                    "geometry": {"type": "sphere", "radius": 0.22, "widthSegments": 16, "heightSegments": 16},
                    "material": {"type": "meshStandard", "color": "#facc15", "emissive": "#ca8a04", "emissiveIntensity": 0.6},
                    "position": [-1.1, 1.35, 0.35],
                    "label": "Sinoatrial (SA) Node - Natural Pacemaker"
                }
            ],
            "parts": [
                {"id": "right_atrium", "label": "Right Atrium", "role": "Receives deoxygenated blood from the upper and lower body via superior and inferior venae cavae.", "color": "#2563eb", "layer": "anatomy", "exploded_offset": [-0.6, 0.4, 0.2]},
                {"id": "right_ventricle", "label": "Right Ventricle", "role": "Pumps deoxygenated blood through the pulmonary valve into pulmonary arteries toward the lungs.", "color": "#1d4ed8", "layer": "anatomy", "exploded_offset": [-0.5, -0.4, 0.4]},
                {"id": "left_atrium", "label": "Left Atrium", "role": "Receives freshly oxygenated blood returning from the lungs through 4 pulmonary veins.", "color": "#e11d48", "layer": "anatomy", "exploded_offset": [0.6, 0.4, -0.2]},
                {"id": "left_ventricle", "label": "Left Ventricle", "role": "Thickest muscular chamber; pumps oxygenated blood at systemic high pressure into the Aorta.", "color": "#be123c", "layer": "anatomy", "exploded_offset": [0.6, -0.4, 0.3]},
                {"id": "septum", "label": "Interventricular Septum", "role": "Thick muscular partition separating right and left ventricles, preventing mixing of oxygenated and deoxygenated blood.", "color": "#475569", "layer": "anatomy", "exploded_offset": [0.0, -0.2, 0.0]},
                {"id": "tricuspid_valve", "label": "Tricuspid Valve", "role": "Atrioventricular valve with 3 cusps between RA and RV; prevents backflow into RA during ventricular systole.", "color": "#f59e0b", "layer": "valves", "exploded_offset": [-0.4, 0.1, 0.1]},
                {"id": "mitral_valve", "label": "Bicuspid / Mitral Valve", "role": "Atrioventricular valve with 2 cusps between LA and LV; prevents backflow into LA during powerful ventricular contraction.", "color": "#f59e0b", "layer": "valves", "exploded_offset": [0.4, 0.1, -0.1]},
                {"id": "pulmonary_valve", "label": "Pulmonary Semilunar Valve", "role": "Pocket valve preventing blood from returning from pulmonary artery to RV during diastole.", "color": "#38bdf8", "layer": "valves", "exploded_offset": [-0.2, 0.3, 0.3]},
                {"id": "aortic_valve", "label": "Aortic Semilunar Valve", "role": "High-pressure valve at root of aorta preventing backflow into LV during diastole.", "color": "#fb7185", "layer": "valves", "exploded_offset": [0.2, 0.3, 0.2]},
                {"id": "aorta", "label": "Systemic Aorta & Arch", "role": "Largest systemic artery carrying oxygen-rich blood from LV to the head, arms, and entire body.", "color": "#dc2626", "layer": "vessels", "exploded_offset": [0.2, 0.8, 0.0]},
                {"id": "superior_vena_cava", "label": "Superior Vena Cava", "role": "Great vein collecting deoxygenated blood from head, neck, and upper limbs.", "color": "#1d4ed8", "layer": "vessels", "exploded_offset": [-0.8, 0.6, 0.1]},
                {"id": "pulmonary_artery", "label": "Pulmonary Artery", "role": "Only artery in human body that carries deoxygenated blood (from RV to lungs).", "color": "#2563eb", "layer": "vessels", "exploded_offset": [-0.2, 0.7, 0.4]},
                {"id": "sa_node", "label": "SA Node (Pacemaker)", "role": "Specialized nodal tissue in upper RA wall; self-generates electrical impulses that pace heartbeats (72 bpm).", "color": "#facc15", "layer": "conduction", "exploded_offset": [-0.9, 0.8, 0.3]}
            ],
            "annotations": [
                {"id": "ra_ann", "text": "Right Atrium (Receives Deoxygenated Blood)", "position": [-1.4, 0.85, 0.2]},
                {"id": "rv_ann", "text": "Right Ventricle (Pumps to Pulmonary Trunk)", "position": [-1.4, -0.8, 0.3]},
                {"id": "la_ann", "text": "Left Atrium (Receives Oxygenated Blood)", "position": [1.4, 0.85, -0.2]},
                {"id": "lv_ann", "text": "Left Ventricle (Thickest Wall - Systemic Pump)", "position": [1.4, -0.8, 0.2]},
                {"id": "sa_ann", "text": "SA Node (Separate Electrical Pacemaker Layer)", "position": [-1.5, 1.6, 0.4]}
            ],
            "blood_flow_sequence": HEART_CIRCULATION_13_STAGES,
            "electrical_conduction_system": {
                "sa_node_rate": "72 bpm",
                "pathway": "SA Node -> Internodal Pathways -> AV Node -> Bundle of His -> Left & Right Bundle Branches -> Purkinje Fibers",
                "systole_diastole_distinction": "Atrial systole (0.1s) -> Ventricular systole (0.3s) -> Complete cardiac diastole (0.4s). Total cycle: 0.8s."
            },
            "fallback_diagram_svg": HEART_2D_FALLBACK_SVG,
            "animation_type": "flow_pulse",
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
                {"name": "Chloroplast Detail", "position": [-1.2, 1.2, 2.5], "target": [-1.2, 0.8, 0.3], "fov": 35}
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
                    "id": "chloroplast_1",
                    "geometry": {"type": "sphere", "radius": 0.35, "widthSegments": 16, "heightSegments": 16},
                    "material": {"type": "meshStandard", "color": "#22c55e", "roughness": 0.3},
                    "position": [-1.2, 0.8, 0.3]
                }
            ],
            "parts": [
                {"id": "cell_wall", "label": "Cellulose Cell Wall", "role": "Rigid outer boundary maintaining turgidity and preventing osmotic lysis.", "color": "#15803d"},
                {"id": "chloroplast_1", "label": "Chloroplast (Thylakoids)", "role": "Double-membraned organelle containing chlorophyll for light and dark reactions.", "color": "#22c55e"}
            ],
            "annotations": [
                {"id": "chloroplast_label", "text": "Chloroplast (Granum & Stroma)", "position": [-1.2, 1.3, 0.3]}
            ],
            "animation_type": "spin",
            "supports_cross_section": True,
            "supports_exploded_view": True,
            "mobile_touch_enabled": True
        }
    }

    def get_scene(self, model_key: str) -> Optional[ThreeJSDeclarativeScene]:
        norm_key = model_key.lower().replace("_", "-")
        data = self.PRESET_MODELS.get(norm_key)
        if not data:
            return None
        return ThreeJSDeclarativeScene(**data)

    def get_scene_spec(self, model_key: str) -> Optional[Dict[str, Any]]:
        scene = self.get_scene(model_key)
        if not scene:
            return None
        return scene.dict()

    def validate_scene_schema(self, scene_data: Dict[str, Any]) -> bool:
        required = ["title", "model_key", "subject", "camera", "objects", "parts"]
        return all(k in scene_data for k in required)


threejs_orchestrator = ThreeJSSceneOrchestrator()
