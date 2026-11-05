from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class VoiceSyncEvent(BaseModel):
    segment_id: str
    lesson_step_id: str
    spoken_text: str
    visual_action: Dict[str, Any] = Field(default_factory=lambda: {"type": "highlight", "target_id": "overview"})
    pause_after_seconds: float = 0.5


class VoiceIntegrationContract(BaseModel):
    """
    Section 11: Voice Integration Contract for Synchronized Multimodal Teaching.
    Supports narration, visual cue synchronization, step tracking, pause/resume,
    interruption handling, and fail-safe recovery.
    """
    topic: str
    voice_enabled: bool = True
    session_id: str
    audio_format: str = "audio/mp3"
    voice_id: str = "en-IN-Wavenet-D"
    language_code: str = "en-IN"
    narration_segments: List[VoiceSyncEvent] = Field(default_factory=list)
    supports_pause_resume: bool = True
    supports_interruption_recovery: bool = True
    fail_safe_silent_mode: bool = True
    failure_recovery_message: str = (
        "Audio engine encountering latency; continuing seamlessly with visual cards and text."
    )
