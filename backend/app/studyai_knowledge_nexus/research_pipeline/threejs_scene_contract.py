from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ThreeJsStructureComponent(BaseModel):
    id: str
    label: str
    geometry_type: str  # e.g., 'cylinder', 'sphere', 'box', 'lathe', 'extrude'
    color_hex: str
    position: List[float] = Field(default_factory=lambda: [0.0, 0.0, 0.0])
    rotation: List[float] = Field(default_factory=lambda: [0.0, 0.0, 0.0])
    scale: List[float] = Field(default_factory=lambda: [1.0, 1.0, 1.0])
    layer: str = "main"  # 'main', 'conduction', 'vascular', 'valvular'
    role: Optional[str] = None
    interactivity_hint: Optional[str] = None


class ThreeJsAnimationStep(BaseModel):
    step_number: int
    name: str
    duration_seconds: float
    active_component_ids: List[str]
    description: str


class ThreeJsSceneContract(BaseModel):
    """
    Section 10: Declarative Scene-Description Contract for future Three.js 3D Generation.
    Strictly declarative; strictly forbids arbitrary JavaScript eval strings.
    """
    scene_title: str
    subject: str
    topic: str
    model_id: str
    required_structures: List[ThreeJsStructureComponent] = Field(default_factory=list)
    component_relationships: List[Dict[str, str]] = Field(default_factory=list)
    labels: List[Dict[str, Any]] = Field(default_factory=list)
    materials: List[Dict[str, Any]] = Field(default_factory=list)
    camera: Dict[str, Any] = Field(default_factory=lambda: {
        "fov": 45,
        "initial_position": [0, 0, 8],
        "target": [0, 0, 0]
    })
    animation_steps: List[ThreeJsAnimationStep] = Field(default_factory=list)
    interactions: List[Dict[str, Any]] = Field(default_factory=list)
    evidence_references: List[str] = Field(default_factory=list)
    validation_status: str = "validated_declarative_schema"
