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
    quality_level: str = "level_3_advanced_scientific"  # level_1_schematic, level_2_instructional, level_3_advanced_scientific
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
                {"id": "inferior_vena_cava", "label": "Inferior Vena Cava", "role": "Great vein returning deoxygenated blood from lower body and abdominal viscera.", "color": "#1e40af", "layer": "vessels", "exploded_offset": [-0.8, -0.6, 0.1]},
                {"id": "pulmonary_artery", "label": "Pulmonary Artery", "role": "Only artery in human body that carries deoxygenated blood (from RV to lungs).", "color": "#2563eb", "layer": "vessels", "exploded_offset": [-0.2, 0.7, 0.4]},
                {"id": "pulmonary_veins", "label": "Pulmonary Veins", "role": "Four pulmonary veins carrying freshly oxygenated blood from lungs into Left Atrium.", "color": "#ef4444", "layer": "vessels", "exploded_offset": [0.8, 0.5, -0.3]},
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
        },
        "water-molecule": {
            "title": "3D Water Molecule (H₂O) Bent Molecular Geometry & Dipole Moment",
            "model_key": "water-molecule",
            "subject": "Chemistry",
            "academic_topic": "Chemical Bonding, Covalent Bonds & Molecular Geometry",
            "quality_level": "level_3_advanced_scientific",
            "background": "#0b101b",
            "camera": {"fov": 45, "position": [0, 0, 6], "min_distance": 2.5, "max_distance": 14.0},
            "camera_presets": [
                {"name": "Standard View", "position": [0, 0, 6], "target": [0, 0, 0], "fov": 45},
                {"name": "Bond Angle 104.5°", "position": [0, 1.5, 4.5], "target": [0, 0, 0], "fov": 35}
            ],
            "lights": [
                {"type": "ambient", "color": "#ffffff", "intensity": 0.8},
                {"type": "directional", "color": "#60a5fa", "position": [3, 5, 4], "intensity": 1.2}
            ],
            "objects": [
                {
                    "id": "oxygen_atom",
                    "geometry": {"type": "sphere", "radius": 0.9, "widthSegments": 32, "heightSegments": 32},
                    "material": {"type": "meshStandard", "color": "#ef4444", "roughness": 0.2, "metalness": 0.1},
                    "position": [0, 0.4, 0],
                    "label": "Oxygen Atom (δ- Electronegative)"
                },
                {
                    "id": "hydrogen_1",
                    "geometry": {"type": "sphere", "radius": 0.55, "widthSegments": 24, "heightSegments": 24},
                    "material": {"type": "meshStandard", "color": "#3b82f6", "roughness": 0.3},
                    "position": [-1.35, -0.75, 0],
                    "label": "Hydrogen Atom 1 (δ+ Electropositive)"
                },
                {
                    "id": "hydrogen_2",
                    "geometry": {"type": "sphere", "radius": 0.55, "widthSegments": 24, "heightSegments": 24},
                    "material": {"type": "meshStandard", "color": "#3b82f6", "roughness": 0.3},
                    "position": [1.35, -0.75, 0],
                    "label": "Hydrogen Atom 2 (δ+ Electropositive)"
                },
                {
                    "id": "covalent_bond_1",
                    "geometry": {"type": "cylinder", "radiusTop": 0.14, "radiusBottom": 0.14, "height": 1.4, "radialSegments": 16},
                    "material": {"type": "meshStandard", "color": "#94a3b8", "roughness": 0.4},
                    "position": [-0.68, -0.17, 0],
                    "rotation": [0, 0, 0.68],
                    "label": "Polar Covalent Single Bond 1"
                },
                {
                    "id": "covalent_bond_2",
                    "geometry": {"type": "cylinder", "radiusTop": 0.14, "radiusBottom": 0.14, "height": 1.4, "radialSegments": 16},
                    "material": {"type": "meshStandard", "color": "#94a3b8", "roughness": 0.4},
                    "position": [0.68, -0.17, 0],
                    "rotation": [0, 0, -0.68],
                    "label": "Polar Covalent Single Bond 2"
                },
                {
                    "id": "lone_pair_lobes",
                    "geometry": {"type": "sphere", "radius": 0.4, "widthSegments": 16, "heightSegments": 16},
                    "material": {"type": "meshStandard", "color": "#facc15", "transparent": True, "opacity": 0.45},
                    "position": [0, 1.4, 0.4],
                    "label": "Unshared Non-Bonding Lone Electron Pairs"
                }
            ],
            "parts": [
                {"id": "oxygen_atom", "label": "Central Oxygen Atom (O)", "role": "High electronegativity (3.44) draws shared electron density, creating partial negative pole.", "color": "#ef4444", "layer": "atoms"},
                {"id": "hydrogen_1", "label": "Hydrogen Atom 1 (H)", "role": "Forms polar single covalent bond by sharing single 1s electron with oxygen 2p orbital.", "color": "#3b82f6", "layer": "atoms"},
                {"id": "hydrogen_2", "label": "Hydrogen Atom 2 (H)", "role": "Forms second polar single covalent bond, creating a partial positive charge center.", "color": "#3b82f6", "layer": "atoms"},
                {"id": "covalent_bond_1", "label": "Covalent Bond 1", "role": "Shared electron pair linkage.", "color": "#94a3b8", "layer": "bonds"},
                {"id": "covalent_bond_2", "label": "Covalent Bond 2", "role": "Shared electron pair linkage.", "color": "#94a3b8", "layer": "bonds"},
                {"id": "lone_pair_lobes", "label": "Non-Bonding Lone Pairs", "role": "Two lone pairs exert strong electrostatic repulsion, compressing H-O-H angle to 104.5°.", "color": "#facc15", "layer": "orbitals"}
            ],
            "annotations": [
                {"id": "angle_label", "text": "H-O-H Bond Angle: 104.5°", "position": [0, -0.2, 0.3]},
                {"id": "dipole_label", "text": "Net Dipole Moment (μ = 1.85 D)", "position": [0, 2.0, 0]}
            ],
            "animation_type": "spin",
            "supports_cross_section": False,
            "supports_exploded_view": True,
            "mobile_touch_enabled": True
        },
        "volcano": {
            "title": "3D Composite Volcano Geomorphology & Magma Conduit",
            "model_key": "volcano",
            "subject": "Geography",
            "academic_topic": "Plate Tectonics, Volcanism & Internal Earth Processes",
            "quality_level": "level_3_advanced_scientific",
            "background": "#0f172a",
            "camera": {"fov": 45, "position": [0, 2, 8], "min_distance": 3.0, "max_distance": 16.0},
            "camera_presets": [
                {"name": "Volcano Overview", "position": [0, 2, 8], "target": [0, 0, 0], "fov": 45},
                {"name": "Magma Chamber Cross-Section", "position": [0, -1, 5], "target": [0, -1, 0], "fov": 38}
            ],
            "lights": [
                {"type": "ambient", "color": "#ffffff", "intensity": 0.7},
                {"type": "directional", "color": "#f97316", "position": [3, 6, 4], "intensity": 1.4}
            ],
            "objects": [
                {
                    "id": "volcano_cone",
                    "geometry": {"type": "cone", "radius": 2.8, "height": 3.2, "radialSegments": 32},
                    "material": {"type": "meshStandard", "color": "#57534e", "roughness": 0.8},
                    "position": [0, 0, 0],
                    "label": "Stratified Volcanic Cone (Ash & Tephra)"
                },
                {
                    "id": "magma_chamber",
                    "geometry": {"type": "sphere", "radius": 1.1, "widthSegments": 24, "heightSegments": 24},
                    "material": {"type": "meshStandard", "color": "#dc2626", "emissive": "#b91c1c", "emissiveIntensity": 0.8},
                    "position": [0, -1.8, 0],
                    "label": "Underground Magma Chamber"
                },
                {
                    "id": "central_conduit",
                    "geometry": {"type": "cylinder", "radiusTop": 0.22, "radiusBottom": 0.35, "height": 3.0, "radialSegments": 16},
                    "material": {"type": "meshStandard", "color": "#ea580c", "emissive": "#c2410c", "emissiveIntensity": 0.6},
                    "position": [0, -0.1, 0],
                    "label": "Main Conduit (Pipe)"
                },
                {
                    "id": "crater_vent",
                    "geometry": {"type": "torus", "radius": 0.45, "tube": 0.12, "radialSegments": 16, "tubularSegments": 24},
                    "material": {"type": "meshStandard", "color": "#292524", "roughness": 0.9},
                    "position": [0, 1.6, 0],
                    "rotation": [1.57, 0, 0],
                    "label": "Summit Crater Vent"
                }
            ],
            "parts": [
                {"id": "volcano_cone", "label": "Composite Volcanic Cone", "role": "Stratified layers of hardened lava, cinders, and volcanic ash built up over eruptions.", "color": "#57534e", "layer": "landform"},
                {"id": "magma_chamber", "label": "Magma Chamber", "role": "Subsurface pool of superheated molten rock under extreme tectonic pressure.", "color": "#dc2626", "layer": "internal"},
                {"id": "central_conduit", "label": "Central Conduit / Pipe", "role": "Vertical channel through which magma rises from the chamber to the surface.", "color": "#ea580c", "layer": "internal"},
                {"id": "crater_vent", "label": "Summit Crater & Vent", "role": "Circular depression at the peak through which gases, pyroclastic debris, and lava erupt.", "color": "#292524", "layer": "landform"}
            ],
            "annotations": [
                {"id": "magma_vs_lava", "text": "Magma (Underground) -> Lava (Surface Ejection)", "position": [0, 2.2, 0]}
            ],
            "animation_type": "pulse",
            "supports_cross_section": True,
            "supports_exploded_view": True,
            "mobile_touch_enabled": True
        },
        "lever-moments": {
            "title": "3D Principle of Moments & Rotational Equilibrium Lever",
            "model_key": "lever-moments",
            "subject": "Physics",
            "academic_topic": "Turning Effect of Force, Fulcrum & Rotational Equilibrium",
            "quality_level": "level_3_advanced_scientific",
            "background": "#0a0f1d",
            "camera": {"fov": 45, "position": [0, 1.5, 7], "min_distance": 2.5, "max_distance": 15.0},
            "camera_presets": [
                {"name": "Equilibrium Front View", "position": [0, 1.5, 7], "target": [0, 0, 0], "fov": 45},
                {"name": "Fulcrum Close-Up", "position": [0, 0.5, 3.5], "target": [0, 0, 0], "fov": 32}
            ],
            "lights": [
                {"type": "ambient", "color": "#ffffff", "intensity": 0.8},
                {"type": "directional", "color": "#38bdf8", "position": [2, 5, 4], "intensity": 1.2}
            ],
            "objects": [
                {
                    "id": "lever_arm",
                    "geometry": {"type": "box", "width": 5.4, "height": 0.22, "depth": 0.5},
                    "material": {"type": "meshStandard", "color": "#475569", "roughness": 0.4},
                    "position": [0, 0, 0],
                    "label": "Uniform Meter Rule Lever Arm"
                },
                {
                    "id": "fulcrum_wedge",
                    "geometry": {"type": "cone", "radius": 0.5, "height": 0.9, "radialSegments": 4},
                    "material": {"type": "meshStandard", "color": "#0284c7", "roughness": 0.2},
                    "position": [0, -0.45, 0],
                    "rotation": [0, 0.78, 0],
                    "label": "Fixed Fulcrum (Pivot Point)"
                },
                {
                    "id": "load_f1",
                    "geometry": {"type": "box", "width": 0.6, "height": 0.7, "depth": 0.6},
                    "material": {"type": "meshStandard", "color": "#dc2626", "roughness": 0.3},
                    "position": [-2.0, 0.46, 0],
                    "label": "Load Force F₁ (Anticlockwise Moment)"
                },
                {
                    "id": "effort_f2",
                    "geometry": {"type": "box", "width": 0.6, "height": 0.45, "depth": 0.6},
                    "material": {"type": "meshStandard", "color": "#16a34a", "roughness": 0.3},
                    "position": [2.0, 0.34, 0],
                    "label": "Effort Force F₂ (Clockwise Moment)"
                }
            ],
            "parts": [
                {"id": "lever_arm", "label": "Rigid Lever Arm", "role": "Horizontal bar capable of rotating about a fixed pivot.", "color": "#475569", "layer": "mechanics"},
                {"id": "fulcrum_wedge", "label": "Fulcrum / Pivot", "role": "The fixed support point about which the turning moment is evaluated.", "color": "#0284c7", "layer": "mechanics"},
                {"id": "load_f1", "label": "Force F₁ (d₁ = 2.0 m)", "role": "Creates anticlockwise torque: τ₁ = F₁ × d₁.", "color": "#dc2626", "layer": "forces"},
                {"id": "effort_f2", "label": "Force F₂ (d₂ = 2.0 m)", "role": "Creates clockwise torque: τ₂ = F₂ × d₂.", "color": "#16a34a", "layer": "forces"}
            ],
            "annotations": [
                {"id": "principle_formula", "text": "Rotational Equilibrium: F₁ × d₁ = F₂ × d₂ (Στ = 0)", "position": [0, 1.4, 0]}
            ],
            "animation_type": "none",
            "supports_cross_section": False,
            "supports_exploded_view": True,
            "mobile_touch_enabled": True
        },
        "dna-double-helix": {
            "title": "3D DNA Double Helix & Complementary Base Pairing (A=T & G≡C)",
            "model_key": "dna-double-helix",
            "subject": "Biology",
            "academic_topic": "Molecular Genetics, DNA Structure & Nucleotide Hydrogen Bonding",
            "quality_level": "level_3_advanced_scientific",
            "background": "#090d16",
            "camera": {"fov": 45, "position": [0, 0, 7.5], "min_distance": 2.5, "max_distance": 15.0},
            "camera_presets": [
                {"name": "Helical Axis View", "position": [0, 0, 7.5], "target": [0, 0, 0], "fov": 45},
                {"name": "Base Pair Rung Detail", "position": [0, 1.0, 3.5], "target": [0, 0.5, 0], "fov": 32}
            ],
            "lights": [
                {"type": "ambient", "color": "#ffffff", "intensity": 0.8},
                {"type": "directional", "color": "#38bdf8", "position": [4, 6, 5], "intensity": 1.2}
            ],
            "objects": [
                {
                    "id": "backbone_strand_1",
                    "geometry": {"type": "cylinder", "radiusTop": 0.12, "radiusBottom": 0.12, "height": 5.0, "radialSegments": 16},
                    "material": {"type": "meshStandard", "color": "#f97316", "roughness": 0.3},
                    "position": [-0.8, 0, 0],
                    "label": "5' to 3' Sugar-Phosphate Backbone"
                },
                {
                    "id": "backbone_strand_2",
                    "geometry": {"type": "cylinder", "radiusTop": 0.12, "radiusBottom": 0.12, "height": 5.0, "radialSegments": 16},
                    "material": {"type": "meshStandard", "color": "#f97316", "roughness": 0.3},
                    "position": [0.8, 0, 0],
                    "label": "3' to 5' Antiparallel Sugar-Phosphate Backbone"
                },
                {
                    "id": "base_pair_at",
                    "geometry": {"type": "box", "width": 1.6, "height": 0.18, "depth": 0.18},
                    "material": {"type": "meshStandard", "color": "#22c55e", "roughness": 0.3},
                    "position": [0, 0.8, 0],
                    "label": "Adenine = Thymine Base Pair (2 Hydrogen Bonds)"
                },
                {
                    "id": "base_pair_gc",
                    "geometry": {"type": "box", "width": 1.6, "height": 0.18, "depth": 0.18},
                    "material": {"type": "meshStandard", "color": "#3b82f6", "roughness": 0.3},
                    "position": [0, -0.6, 0],
                    "rotation": [0, 0.6, 0],
                    "label": "Guanine ≡ Cytosine Base Pair (3 Hydrogen Bonds)"
                }
            ],
            "parts": [
                {"id": "backbone_strand_1", "label": "5'→3' Backbone", "role": "Deoxyribose sugar and phosphate ester polymer rail.", "color": "#f97316", "layer": "backbone"},
                {"id": "backbone_strand_2", "label": "3'→5' Antiparallel Strand", "role": "Oppositely oriented complementary polynucleotide rail.", "color": "#f97316", "layer": "backbone"},
                {"id": "base_pair_at", "label": "A=T Pair (2 H-bonds)", "role": "Purine Adenine pairs with Pyrimidine Thymine via 2 hydrogen bonds.", "color": "#22c55e", "layer": "base_pairs"},
                {"id": "base_pair_gc", "label": "G≡C Pair (3 H-bonds)", "role": "Purine Guanine pairs with Pyrimidine Cytosine via 3 hydrogen bonds.", "color": "#3b82f6", "layer": "base_pairs"}
            ],
            "annotations": [
                {"id": "chargaff_rule", "text": "Chargaff's Rule: %A = %T and %G = %C", "position": [0, 2.2, 0]}
            ],
            "animation_type": "spin",
            "supports_cross_section": False,
            "supports_exploded_view": True,
            "mobile_touch_enabled": True
        },
        "atomic-structure": {
            "title": "3D Rutherford-Bohr Atomic Structure & Quantized Electron Shells",
            "model_key": "atomic-structure",
            "subject": "Physics / Chemistry",
            "academic_topic": "Atomic Structure, Nucleus, Protons, Neutrons & Electron Orbitals",
            "quality_level": "level_3_advanced_scientific",
            "background": "#080b14",
            "camera": {"fov": 45, "position": [0, 0, 8.0], "min_distance": 2.5, "max_distance": 16.0},
            "camera_presets": [
                {"name": "Whole Atom View", "position": [0, 0, 8.0], "target": [0, 0, 0], "fov": 45},
                {"name": "Nucleus Core", "position": [0, 0, 3.2], "target": [0, 0, 0], "fov": 30}
            ],
            "lights": [
                {"type": "ambient", "color": "#ffffff", "intensity": 0.8},
                {"type": "directional", "color": "#e0e7ff", "position": [3, 6, 5], "intensity": 1.2}
            ],
            "objects": [
                {
                    "id": "nucleus_protons",
                    "geometry": {"type": "sphere", "radius": 0.6, "widthSegments": 24, "heightSegments": 24},
                    "material": {"type": "meshStandard", "color": "#ef4444", "roughness": 0.25},
                    "position": [-0.15, 0, 0],
                    "label": "Protons (Positive Charge Z+)"
                },
                {
                    "id": "nucleus_neutrons",
                    "geometry": {"type": "sphere", "radius": 0.6, "widthSegments": 24, "heightSegments": 24},
                    "material": {"type": "meshStandard", "color": "#94a3b8", "roughness": 0.3},
                    "position": [0.15, 0, 0],
                    "label": "Neutrons (Electrically Neutral)"
                },
                {
                    "id": "k_shell_orbit",
                    "geometry": {"type": "ring", "innerRadius": 1.78, "outerRadius": 1.82, "thetaSegments": 64},
                    "material": {"type": "meshStandard", "color": "#38bdf8", "side": "doubleSide"},
                    "position": [0, 0, 0],
                    "rotation": [1.57, 0, 0],
                    "label": "K-Shell Orbit (n=1, Max 2e⁻)"
                },
                {
                    "id": "l_shell_orbit",
                    "geometry": {"type": "ring", "innerRadius": 3.18, "outerRadius": 3.22, "thetaSegments": 64},
                    "material": {"type": "meshStandard", "color": "#818cf8", "side": "doubleSide"},
                    "position": [0, 0, 0],
                    "rotation": [1.0, 0.4, 0],
                    "label": "L-Shell Orbit (n=2, Max 8e⁻)"
                },
                {
                    "id": "orbiting_electron",
                    "geometry": {"type": "sphere", "radius": 0.16, "widthSegments": 16, "heightSegments": 16},
                    "material": {"type": "meshStandard", "color": "#38bdf8", "emissive": "#0284c7", "emissiveIntensity": 0.8},
                    "position": [1.8, 0, 0],
                    "label": "Quantized Electron (e⁻)"
                }
            ],
            "parts": [
                {"id": "nucleus_protons", "label": "Protons (p⁺)", "role": "Positive nuclear charge determining atomic number Z.", "color": "#ef4444", "layer": "nucleus"},
                {"id": "nucleus_neutrons", "label": "Neutrons (n⁰)", "role": "Neutral nucleons binding the nucleus via strong force.", "color": "#94a3b8", "layer": "nucleus"},
                {"id": "k_shell_orbit", "label": "K-Shell (n=1)", "role": "Lowest energy quantized Bohr orbital shell holding up to 2 electrons.", "color": "#38bdf8", "layer": "shells"},
                {"id": "l_shell_orbit", "label": "L-Shell (n=2)", "role": "Second principal energy level holding up to 8 electrons (2n² rule).", "color": "#818cf8", "layer": "shells"},
                {"id": "orbiting_electron", "label": "Electrons (e⁻)", "role": "Negatively charged fundamental leptons orbiting in discrete stationary energy states.", "color": "#38bdf8", "layer": "particles"}
            ],
            "annotations": [
                {"id": "bohr_rule", "text": "Bohr Formula: Max Electrons per Shell = 2n²", "position": [0, 2.5, 0]}
            ],
            "animation_type": "orbit",
            "supports_cross_section": False,
            "supports_exploded_view": True,
            "mobile_touch_enabled": True
        },
        "cone-cylinder-volume": {
            "title": "3D Solid Geometry: Cone & Cylinder Volume Relationship [V = (1/3)πr²h]",
            "model_key": "cone-cylinder-volume",
            "subject": "Mathematics",
            "academic_topic": "Mensuration: Surface Areas & Volumes of 3D Solids",
            "quality_level": "level_3_advanced_scientific",
            "background": "#090d16",
            "camera": {"fov": 45, "position": [0, 1.5, 7.5], "min_distance": 2.5, "max_distance": 16.0},
            "camera_presets": [
                {"name": "Solid Alignment Front View", "position": [0, 1.5, 7.5], "target": [0, 0, 0], "fov": 45},
                {"name": "Top Base Dimension", "position": [0, 5.0, 4.0], "target": [0, 0, 0], "fov": 38}
            ],
            "lights": [
                {"type": "ambient", "color": "#ffffff", "intensity": 0.8},
                {"type": "directional", "color": "#38bdf8", "position": [3, 6, 5], "intensity": 1.2}
            ],
            "objects": [
                {
                    "id": "cylinder_hull",
                    "geometry": {"type": "cylinder", "radiusTop": 1.6, "radiusBottom": 1.6, "height": 3.0, "radialSegments": 32},
                    "material": {"type": "meshStandard", "color": "#0284c7", "transparent": True, "opacity": 0.35, "roughness": 0.2},
                    "position": [0, 0, 0],
                    "label": "Circumscribed Cylinder (Volume V = πr²h)"
                },
                {
                    "id": "inscribed_cone",
                    "geometry": {"type": "cone", "radius": 1.6, "height": 3.0, "radialSegments": 32},
                    "material": {"type": "meshStandard", "color": "#f59e0b", "roughness": 0.4},
                    "position": [0, 0, 0],
                    "label": "Inscribed Cone (Volume V = 1/3 πr²h)"
                },
                {
                    "id": "circular_base",
                    "geometry": {"type": "ring", "innerRadius": 0, "outerRadius": 1.6, "thetaSegments": 32},
                    "material": {"type": "meshStandard", "color": "#38bdf8", "side": "doubleSide"},
                    "position": [0, -1.5, 0],
                    "rotation": [1.57, 0, 0],
                    "label": "Shared Circular Base (Area A = πr²)"
                }
            ],
            "parts": [
                {"id": "cylinder_hull", "label": "Cylinder (V = πr²h)", "role": "Right circular cylinder of radius r and vertical height h.", "color": "#0284c7", "layer": "solids"},
                {"id": "inscribed_cone", "label": "Cone (V = 1/3 πr²h)", "role": "Right circular cone with identical base radius r and perpendicular height h.", "color": "#f59e0b", "layer": "solids"},
                {"id": "circular_base", "label": "Common Base (πr²)", "role": "Congruent circular base shared by both solids.", "color": "#38bdf8", "layer": "dimensions"}
            ],
            "annotations": [
                {"id": "ratio_law", "text": "Fundamental Ratio: Volume(Cone) = (1/3) × Volume(Cylinder)", "position": [0, 2.2, 0]}
            ],
            "animation_type": "none",
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
