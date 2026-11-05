from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class VisualRequirementContract(BaseModel):
    """
    Section 9: Structured Visual Requirement Contract for future Image and Diagram Generation.
    Specifies exact diagrams, real images, illustrations, animations, labels, and anti-hallucination bounds.
    """
    topic: str
    subject: str
    grade: int
    diagrams_needed: List[str] = Field(default_factory=list)
    real_images_recommended: List[str] = Field(default_factory=list)
    illustrations_to_generate: List[str] = Field(default_factory=list)
    animation_recommended: bool = False
    animation_type: Optional[str] = None
    is_3d_model_recommended: bool = False
    three_d_model_key: Optional[str] = None
    required_labels: List[str] = Field(default_factory=list)
    mandatory_structures: List[str] = Field(default_factory=list)
    prohibited_visual_inventions: List[str] = Field(default_factory=list)
    vector_svg_blueprint: Optional[str] = None
