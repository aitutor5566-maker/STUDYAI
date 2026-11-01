from fastapi import APIRouter, HTTPException, status
from ....core.config import settings
from ....schemas.contracts import VideoGenerationError

router = APIRouter()


@router.post("/video/generate", status_code=status.HTTP_403_FORBIDDEN, response_model=VideoGenerationError)
@router.post("/video", status_code=status.HTTP_403_FORBIDDEN, response_model=VideoGenerationError)
async def request_video_generation():
    """
    Video generation endpoint.
    Strictly rejected with HTTP 403 Forbidden per Section 7 architectural rules.
    """
    if not settings.FEATURE_VIDEO_GENERATION:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "FEATURE_DISABLED",
                "error": "Video generation is strictly disabled in production pending approved future release. Use interactive Three.js 3D models and verified educational diagrams instead.",
                "disabled": True,
                "feature": "video_generation"
            }
        )
    return VideoGenerationError()


@router.get("/video/{video_id}", status_code=status.HTTP_403_FORBIDDEN)
async def get_video_status(video_id: str):
    """Status endpoint for video generation jobs; strictly disabled."""
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail={
            "code": "FEATURE_DISABLED",
            "error": "Video generation is strictly disabled in production pending approved future release.",
            "disabled": True,
            "feature": "video_generation"
        }
    )
