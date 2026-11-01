from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "1.0.0"
    environment: str
    video_generation: Dict[str, Any]
    database: Dict[str, Any]
    ai_providers: Dict[str, Any]


class VisualComponent(BaseModel):
    id: str
    label: str
    role: Optional[str] = None
    color: Optional[str] = "#38BDF8"


class TutorAskRequest(BaseModel):
    topic: str = Field(..., min_length=1, max_length=200)
    question: str = Field(..., min_length=1, max_length=5000)
    mode: str = Field(default="detailed", pattern="^(simple|detailed|normal|mastery|deep|exam)$")
    grade: int = Field(default=10, ge=1, le=12)
    level: str = Field(default="Grade 10")
    subject: str = Field(default="Science")
    language: str = Field(default="English")
    selected_visual_component: Optional[VisualComponent] = None


class SubtopicPlan(BaseModel):
    subtopic_id: str
    title: str
    learning_objective: str
    has_3d_support: bool = False


class VisualPlanResponse(BaseModel):
    topic: str
    grade_level: str
    subject: str
    prerequisites: List[str]
    subtopics: List[SubtopicPlan]


class VideoGenerationError(BaseModel):
    code: str = "FEATURE_DISABLED"
    error: str = "Video generation is strictly disabled in production pending approved future release."
    disabled: bool = True
    feature: str = "video_generation"
