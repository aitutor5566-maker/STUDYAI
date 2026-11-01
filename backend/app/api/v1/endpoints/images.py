import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from ....security.rbac import AuthenticatedUser, get_current_user

router = APIRouter()


class ImageGenerateRequest(BaseModel):
    topic: str
    subtopic: Optional[str] = None
    prompt: str


class ImageResponse(BaseModel):
    id: str
    topic: str
    subtopic: Optional[str] = None
    visual_type: str
    image_url: str
    svg_payload: str
    prompt: str


@router.post("/generate", response_model=ImageResponse, summary="Generate Educational Diagram")
async def generate_educational_image(req: ImageGenerateRequest, user: AuthenticatedUser = Depends(get_current_user)):
    """Generate high-contrast educational SVG diagram."""
    svg_mock = (
        f'<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">'
        f'<rect width="800" height="500" fill="#0F172A"/>'
        f'<text x="400" y="50" fill="#38BDF8" font-size="24" text-anchor="middle" font-weight="bold">{req.topic.upper()}</text>'
        f'<circle cx="400" cy="250" r="100" fill="#10B981" opacity="0.8"/>'
        f'<text x="400" y="255" fill="#FFFFFF" font-size="16" text-anchor="middle">{req.subtopic or req.topic}</text>'
        f'</svg>'
    )
    new_id = f"img_{uuid.uuid4().hex[:8]}"
    return ImageResponse(
        id=new_id,
        topic=req.topic,
        subtopic=req.subtopic,
        visual_type="svg_diagram",
        image_url=f"/api/v1/images/{new_id}.svg",
        svg_payload=svg_mock,
        prompt=req.prompt
    )
