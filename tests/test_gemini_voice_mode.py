import pytest
import base64
from backend.app.studyai_knowledge_nexus.voice.voice_orchestrator import (
    voice_orchestrator,
    wrap_pcm16_in_wav,
    VoiceSession,
    VoiceLessonStep,
)


def test_wrap_pcm16_in_wav():
    """Verify that wrap_pcm16_in_wav produces a strictly valid RIFF WAV audio container."""
    dummy_pcm = b"\x00\x00" * 24000 # 1 second of 24kHz 16-bit mono silence
    wav_bytes = wrap_pcm16_in_wav(dummy_pcm, sample_rate=24000, channels=1)
    
    assert wav_bytes.startswith(b"RIFF")
    assert b"WAVE" in wav_bytes[8:12]
    assert b"fmt " in wav_bytes[12:16]
    assert b"data" in wav_bytes[36:40]
    # Header is 44 bytes, total size is 44 + 48000
    assert len(wav_bytes) == 44 + len(dummy_pcm)


@pytest.mark.asyncio
async def test_start_voice_lesson_structure():
    """
    Test initiating an interactive Gemini voice lesson:
    - Creates active VoiceSession with 5 curriculum steps.
    - Resolves grade-aware depth (Grade 8 Biology Photosynthesis).
    - Synchronizes visual asset (3D model or diagram).
    - Produces spoken teacher hook and base64 WAV audio.
    """
    session = await voice_orchestrator.start_voice_lesson(
        topic="Photosynthesis",
        grade=8,
        subject="Biology",
        board="ICSE",
        learning_difficulties=["reading"],
        preferred_style="visual",
        voice_persona="Kore"
    )

    assert session is not None
    assert session.session_id.startswith("vsession-")
    assert session.status == "active"
    assert session.current_step_index == 0
    assert len(session.steps) >= 4
    
    # Check steps sequence
    step_titles = [s.title for s in session.steps]
    assert "Friendly Introduction & Hook" in step_titles
    assert "Core Definition & Meaning" in step_titles
    assert "Step-by-Step Mechanism" in step_titles
    
    # Check visual sync
    assert session.current_visual is not None
    assert session.current_visual.get("type") in ["3d_model", "svg_diagram", "formula"]
    
    # Check opening audio
    assert session.current_speech is not None
    assert len(session.current_speech) > 20
    assert session.current_audio_url is not None
    assert session.current_audio_url.startswith("data:audio/wav;base64,")


@pytest.mark.asyncio
async def test_voice_turn_clarification_on_confusion():
    """
    Verify that when student expresses confusion ('I don't understand'),
    the AI teacher responds empathetically with a simpler explanation and
    does NOT advance to the next step.
    """
    session = await voice_orchestrator.start_voice_lesson(
        topic="Ohm's Law",
        grade=9,
        subject="Physics",
        board="ICSE"
    )
    initial_step = session.current_step_index

    # Student expresses confusion
    result = await voice_orchestrator.process_student_turn(
        session_id=session.session_id,
        student_speech="I don't understand this formula, can you explain in simpler words?"
    )

    assert result["session_id"] == session.session_id
    # Step must NOT advance
    assert result["current_step_index"] == initial_step
    # Teacher must provide clarification
    speech = result["teacher_speech"].lower()
    assert any(w in speech for w in ["understand", "break", "simple", "worry", "analogy", "think", "water"])
    # Audio must be generated
    assert result["audio_url"] is not None
    assert result["audio_url"].startswith("data:audio/wav;base64,")


@pytest.mark.asyncio
async def test_voice_turn_advancement_on_comprehension():
    """
    Verify that when student confirms comprehension ('I got it, let's continue'),
    the AI teacher gives positive reinforcement and advances to the next step.
    """
    session = await voice_orchestrator.start_voice_lesson(
        topic="Chemical Reactions",
        grade=7,
        subject="Chemistry",
        board="ICSE"
    )
    initial_step = session.current_step_index

    # Student confirms understanding
    result = await voice_orchestrator.process_student_turn(
        session_id=session.session_id,
        student_speech="Yes, I understand now! Let us move to the next part."
    )

    # Step must advance
    assert result["current_step_index"] == initial_step + 1
    assert result["step_title"] == session.steps[1].title
    assert result["audio_url"] is not None


@pytest.mark.asyncio
async def test_voice_lesson_controls():
    """Verify pause, resume, repeat, and stop session controls."""
    session = await voice_orchestrator.start_voice_lesson(
        topic="Mitochondria",
        grade=6,
        subject="Biology"
    )

    # 1. Repeat
    rep_res = await voice_orchestrator.handle_control_action(session.session_id, "repeat")
    assert rep_res["status"] == "active"
    assert "Let me repeat" in rep_res["teacher_speech"] or rep_res["teacher_speech"] != ""

    # 2. Pause
    pause_res = await voice_orchestrator.handle_control_action(session.session_id, "pause")
    assert pause_res["status"] == "paused"
    assert pause_res["is_paused"] is True

    # 3. Resume
    resume_res = await voice_orchestrator.handle_control_action(session.session_id, "resume")
    assert resume_res["status"] == "active"
    assert resume_res["is_paused"] is False

    # 4. Stop
    stop_res = await voice_orchestrator.handle_control_action(session.session_id, "stop")
    assert stop_res["status"] == "completed"
    assert stop_res["is_lesson_finished"] is True
