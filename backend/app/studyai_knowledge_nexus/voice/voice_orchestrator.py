import os
import io
import re
import time
import uuid
import struct
import base64
import logging
from typing import Any, Dict, List, Optional
import httpx
from pydantic import BaseModel, Field

from backend.app.studyai_knowledge_nexus.knowledge_hub.knowledge_library_repo import knowledge_library
from backend.app.studyai_knowledge_nexus.core.subject_classifier import subject_classifier
from backend.app.studyai_knowledge_nexus.core.grade_controller import grade_controller
from backend.app.studyai_knowledge_nexus.core.adaptive_memory import adaptive_memory
from backend.app.studyai_knowledge_nexus.voice.teacher_pedagogy_engine import teacher_pedagogy_engine

logger = logging.getLogger("knowledge_nexus.voice_orchestrator")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")


def wrap_pcm16_in_wav(pcm_bytes: bytes, sample_rate: int = 24000, num_channels: int = 1) -> bytes:
    """Wraps raw 16-bit linear PCM bytes into a standard playable WAV container."""
    byte_rate = sample_rate * num_channels * 2
    block_align = num_channels * 2
    data_size = len(pcm_bytes)
    total_file_size = 36 + data_size

    header = struct.pack(
        "<4sI4s4sIHHIIHH4sI",
        b"RIFF",
        total_file_size,
        b"WAVE",
        b"fmt ",
        16,             # Subchunk1Size
        1,              # AudioFormat (PCM)
        num_channels,
        sample_rate,
        byte_rate,
        block_align,
        16,             # BitsPerSample
        b"data",
        data_size,
    )
    return header + pcm_bytes


class SynchronizedSentence(BaseModel):
    sentence_index: int
    text: str
    highlight_target_id: Optional[str] = None
    action: str = "highlight"


class VoiceSession:
    """Maintains active state for an ongoing conversational voice lesson."""

    def __init__(
        self,
        session_id: str,
        user_id: str,
        topic: str,
        grade: int,
        subject: str,
        mode: str = "normal",
        depth: str = "standard",
        language: str = "en",
        student_question: Optional[str] = None,
        tutor_structured: Optional[Dict[str, Any]] = None,
        tutor_content: Optional[str] = None,
        profile: Optional[Dict[str, Any]] = None,
        voice_name: str = "Kore",
        speed: float = 1.0,
    ):
        self.session_id = session_id
        self.user_id = user_id
        self.topic = topic
        self.grade = grade
        self.subject = subject
        self.mode = mode
        self.depth = depth # 'quick', 'standard', 'detailed', 'complete_teacher'
        self.language = language.lower() # 'en', 'te', 'hi', 'ur', 'ml'
        self.student_question = student_question
        self.tutor_structured = tutor_structured or {}
        self.tutor_content = tutor_content or ""
        self.profile = profile or {}
        self.voice_name = voice_name
        self.speed = speed
        self.created_at = time.time()
        self.current_step_index = 0
        self.current_sentence_index = 0
        self.is_paused = False
        self.is_muted = False
        self.lesson_steps: List[Dict[str, Any]] = []
        self.audio_cache: Dict[int, Dict[str, Any]] = {} # section_idx -> audio payload
        self.conversation_transcript: List[Dict[str, str]] = []
        self.active_visual: Optional[Dict[str, Any]] = None


class VoiceLessonOrchestrator:
    """
    Advanced AI Voice Teaching Engine.
    Behaves as an experienced, patient personal teacher:
    - Direct connection to the AI Tutor's full structured lesson (definitions, terms, concepts, calculations, diagrams).
    - 15-stage classroom teaching pedagogy sequence matching the AI Tutor's exact layout.
    - Section-based chunked audio synthesis with client Web Speech / Cloud dual fallback.
    - Interactive commands: 'explain again', 'explain simpler', 'explain in more detail', 'give example', 'explain formula', 'explain diagram', 'next step', 'go back'.
    - Multilingual voice support: English, Telugu, Hindi, Urdu, Malayalam preserving scientific nomenclature.
    """

    def __init__(self):
        self.sessions: Dict[str, VoiceSession] = {}
        self._cloud_audio_disabled_until: float = 0.0

    async def start_voice_lesson(
        self,
        topic: str,
        grade: int = 10,
        subject: Optional[str] = None,
        mode: str = "normal",
        depth: str = "standard",
        language: str = "en",
        student_question: Optional[str] = None,
        tutor_structured: Optional[Dict[str, Any]] = None,
        tutor_content: Optional[str] = None,
        user_id: str = "student_voice_user",
        profile: Optional[Dict[str, Any]] = None,
        voice_name: str = "Kore",
        speed: float = 1.0,
    ) -> Dict[str, Any]:
        session_id = f"vsession-{uuid.uuid4().hex[:10]}"

        # 1. Subject Identification
        resolved_subject = subject
        if not resolved_subject or resolved_subject.lower() in ("all", "general", "science"):
            class_res = subject_classifier.classify(topic)
            resolved_subject = class_res.subject

        # 2. Retrieve Verified Knowledge from Shared Knowledge Library
        k_record = knowledge_library.find_record(topic, grade=grade, subject=resolved_subject)
        if not k_record:
            sem_records = knowledge_library.semantic_search(topic, limit=1)
            if sem_records:
                k_record = sem_records[0]

        session = VoiceSession(
            session_id=session_id,
            user_id=user_id,
            topic=topic,
            grade=grade,
            subject=resolved_subject,
            mode=mode,
            depth=depth,
            language=language,
            student_question=student_question,
            tutor_structured=tutor_structured,
            tutor_content=tutor_content,
            profile=profile,
            voice_name=voice_name,
            speed=speed,
        )

        # 3. Build Full Pedagogical Teacher Sequence grounded in AI Tutor + Knowledge Library
        session.lesson_steps = teacher_pedagogy_engine.construct_teacher_curriculum(
            topic=topic,
            subject=resolved_subject,
            grade=grade,
            mode=mode,
            depth=depth,
            language=session.language,
            tutor_structured=tutor_structured,
            tutor_content=tutor_content,
            k_record=k_record
        )

        first_step = session.lesson_steps[0]
        session.active_visual = first_step.get("visual")
        session.current_step_index = 0
        session.current_sentence_index = 0

        # 4. Generate Section Audio for First Step
        spoken_text = first_step["teacher_speech"]
        audio_payload = await self.generate_audio_with_fallback(
            text=spoken_text,
            voice_name=voice_name,
            speed=speed,
            language=session.language
        )
        session.audio_cache[0] = audio_payload

        session.conversation_transcript.append({
            "speaker": "teacher",
            "text": spoken_text,
            "timestamp": time.time(),
        })

        self.sessions[session_id] = session

        return {
            "session_id": session_id,
            "status": "active",
            "topic": topic,
            "grade": grade,
            "subject": resolved_subject,
            "mode": mode,
            "depth": session.depth,
            "language": session.language,
            "speed": session.speed,
            "current_step_index": 0,
            "current_section_index": 0,
            "total_steps": len(session.lesson_steps),
            "total_sections": len(session.lesson_steps),
            "step_title": first_step["title"],
            "section_id": first_step.get("section_id", "sec_1"),
            "current_section": {
                "title": first_step["title"],
                "type": first_step.get("type", "intro"),
                "spoken_script": spoken_text,
                "sentences": first_step.get("sentences", []),
            },
            "teacher_speech": spoken_text,
            "sentences": first_step.get("sentences", []),
            "audio_url": audio_payload.get("audio_url"),
            "audio_available": audio_payload.get("audio_available", False),
            "provider_used": audio_payload.get("provider", "Browser WebSpeechAPI Engine"),
            "notice": audio_payload.get("notice"),
            "synced_visual": session.active_visual,
            "checkpoint_question": first_step.get("checkpoint_question"),
            "all_sections_outline": [
                {
                    "index": i,
                    "id": st.get("section_id", f"sec_{i+1}"),
                    "title": st["title"],
                    "type": st.get("type", "section"),
                }
                for i, st in enumerate(session.lesson_steps)
            ],
            "suggested_actions": [
                "Continue to next step",
                "Explain more simply",
                "Explain in more detail",
                "Give another example",
                "Explain this formula",
                "Explain this diagram",
                "Repeat this sentence"
            ],
        }

    async def process_student_turn(
        self,
        session_id: str,
        student_utterance: str,
        action: Optional[str] = None,
        selected_option_index: Optional[int] = None
    ) -> Dict[str, Any]:
        session = self.sessions.get(session_id)
        if not session:
            raise ValueError(f"Voice session '{session_id}' not found or expired.")

        clean_utterance = student_utterance.strip().lower()
        session.conversation_transcript.append({
            "speaker": "student",
            "text": student_utterance,
            "timestamp": time.time(),
        })

        current_step = session.lesson_steps[session.current_step_index]
        teacher_reply_text = ""
        advance_step = False
        highlight_target_override = None
        checkpoint_result = None

        # 1. Action: Repeat current sentence
        if action == "repeat_sentence" or any(p in clean_utterance for p in ["repeat sentence", "repeat that sentence", "say that again"]):
            sents = current_step.get("sentences", [])
            cur_idx = session.current_sentence_index
            target_sent = sents[cur_idx]["text"] if cur_idx < len(sents) else current_step["teacher_speech"]
            teacher_reply_text = f"Repeating sentence: {target_sent}"
            highlight_target_override = sents[cur_idx].get("highlight_target_id") if cur_idx < len(sents) else None

        # 2. Action: Explain more simply
        elif action == "explain_simpler" or any(p in clean_utterance for p in ["simpler", "simple", "easy", "confused", "don't understand", "make it simple"]):
            analogy = current_step.get("simple_analogy", f"Think of {session.topic} with an intuitive everyday analogy.")
            teacher_reply_text = (
                f"Let us make it simpler: {analogy} "
                f"Notice that the underlying physical and biological rules remain constant, but thinking of it as a coordinated system makes it easy to visualize."
            )

        # 3. Action: Explain in more detail
        elif action == "explain_detailed" or any(p in clean_utterance for p in ["more detail", "deeper", "elaborate", "expand"]):
            facts = current_step.get("facts", [])
            facts_expanded = " ".join(facts) if facts else f"In advanced {session.subject}, {session.topic} involves strict molecular and thermodynamic equilibria."
            teacher_reply_text = f"Here is the deeper explanation: {facts_expanded}"

        # 4. Action: Explain formula
        elif action == "explain_formula" or any(p in clean_utterance for p in ["formula", "equation", "math", "numerical"]):
            formula_step = next((st for st in session.lesson_steps if "formula" in st.get("section_id", "")), None)
            if formula_step:
                teacher_reply_text = formula_step["teacher_speech"]
                highlight_target_override = "formula_card"
            else:
                teacher_reply_text = f"In {session.topic}, governing equations relate the input forces, energy, or concentrations according to conservation laws."

        # 5. Action: Explain diagram / 3D model
        elif action == "explain_diagram" or any(p in clean_utterance for p in ["diagram", "3d model", "model", "visual", "figure"]):
            diag_step = next((st for st in session.lesson_steps if "diagram" in st.get("section_id", "")), None)
            if diag_step:
                teacher_reply_text = diag_step["teacher_speech"]
                highlight_target_override = "whole_model"
            else:
                teacher_reply_text = f"Looking at the visual for {session.topic}: Notice how each labelled anatomical and physical component connects directly to the system's function."

        # 6. Action: Give another example
        elif action == "give_example" or any(p in clean_utterance for p in ["example", "another example", "instance"]):
            teacher_reply_text = (
                f"Here is another real-world application: In industrial engineering and living systems, {session.topic} "
                f"ensures optimal efficiency by preventing wasted energy and avoiding backflow."
            )

        # 7. Action: Go back / Previous step
        elif action == "previous_step" or any(p in clean_utterance for p in ["go back", "previous", "earlier"]):
            if session.current_step_index > 0:
                session.current_step_index -= 1
                session.current_sentence_index = 0
                step = session.lesson_steps[session.current_step_index]
                session.active_visual = step.get("visual")
                teacher_reply_text = f"Returning to section: {step['title']}. {step['teacher_speech']}"
            else:
                teacher_reply_text = f"We are already at the beginning of the lesson: {current_step['title']}."

        # 8. Action: Checkpoint Evaluation
        elif action == "submit_answer" or selected_option_index is not None or (current_step.get("checkpoint_question") and (clean_utterance or current_step.get("expected_keywords"))):
            cq = current_step.get("checkpoint_question") or {}
            correct_idx = cq.get("correct_index", 0) if isinstance(cq, dict) else 0
            if selected_option_index is not None:
                is_correct = (selected_option_index == correct_idx)
            else:
                expected = current_step.get("expected_keywords", [])
                is_correct = any(kw.lower() in clean_utterance for kw in expected) if expected else True

            if is_correct:
                teacher_reply_text = "Spot on! That is 100% correct. You have understood the essential concept."
                checkpoint_result = {"is_correct": True, "score": 1.0, "feedback": teacher_reply_text}
                adaptive_memory.record_interaction(
                    user_id=session.user_id, topic=session.topic, subject=session.subject,
                    grade=session.grade, question_answered=True, was_correct=True
                )
            else:
                hint = current_step.get("hint") or (cq.get("options", [""])[correct_idx] if isinstance(cq, dict) and cq.get("options") else "the key formula/definition")
                teacher_reply_text = f"Good attempt! The correct answer is: {hint}."
                checkpoint_result = {"is_correct": False, "score": 0.0, "feedback": teacher_reply_text}
                adaptive_memory.record_interaction(
                    user_id=session.user_id, topic=session.topic, subject=session.subject,
                    grade=session.grade, question_answered=True, was_correct=False
                )

        # 9. Default: Forward progression (Next step)
        else:
            advance_step = True
            teacher_reply_text = "Excellent. Let us move to the next section."

        # Advance step if requested
        if advance_step and session.current_step_index < len(session.lesson_steps) - 1:
            session.current_step_index += 1
            session.current_sentence_index = 0
            next_step = session.lesson_steps[session.current_step_index]
            session.active_visual = next_step.get("visual")
            teacher_reply_text += f"\n\n{next_step['teacher_speech']}"

        audio_payload = await self.generate_audio_with_fallback(
            text=teacher_reply_text,
            voice_name=session.voice_name,
            speed=session.speed,
            language=session.language
        )

        session.conversation_transcript.append({
            "speaker": "teacher",
            "text": teacher_reply_text,
            "timestamp": time.time(),
        })

        active_step = session.lesson_steps[session.current_step_index]

        return {
            "session_id": session_id,
            "status": "active",
            "topic": session.topic,
            "grade": session.grade,
            "subject": session.subject,
            "depth": session.depth,
            "language": session.language,
            "speed": session.speed,
            "current_step_index": session.current_step_index,
            "current_section_index": session.current_step_index,
            "total_steps": len(session.lesson_steps),
            "total_sections": len(session.lesson_steps),
            "current_section": {
                "title": active_step["title"],
                "type": active_step.get("type", "section"),
                "spoken_script": teacher_reply_text,
                "sentences": active_step.get("sentences", []),
            },
            "step_title": active_step["title"],
            "section_id": active_step.get("section_id", f"sec_{session.current_step_index + 1}"),
            "teacher_speech": teacher_reply_text,
            "sentences": active_step.get("sentences", []),
            "audio_url": audio_payload.get("audio_url"),
            "audio_available": audio_payload.get("audio_available", False),
            "provider_used": audio_payload.get("provider", "Browser WebSpeechAPI Engine"),
            "synced_visual": session.active_visual,
            "highlight_target": highlight_target_override or (session.active_visual.get("target_id") if session.active_visual else None),
            "checkpoint_question": active_step.get("checkpoint_question"),
            "checkpoint_result": checkpoint_result,
            "is_lesson_finished": session.current_step_index >= len(session.lesson_steps) - 1,
            "suggested_actions": [
                "Continue to next step",
                "Explain more simply",
                "Explain in more detail",
                "Give another example",
                "Explain this formula",
                "Explain this diagram",
                "Repeat this sentence"
            ],
        }

    async def update_session_control(
        self,
        session_id: str,
        action: str,
        speed: Optional[float] = None,
        section_index: Optional[int] = None,
        sentence_index: Optional[int] = None
    ) -> Dict[str, Any]:
        """Handles pause, resume, replay, speed change, section jump, and sentence index updates."""
        session = self.sessions.get(session_id)
        if not session:
            raise ValueError(f"Session '{session_id}' not found")

        action_clean = action.lower()
        if action_clean == "pause":
            session.is_paused = True
            return {"session_id": session_id, "status": "paused", "is_paused": True}
        elif action_clean == "resume":
            session.is_paused = False
            return {"session_id": session_id, "status": "active", "is_paused": False}
        elif action_clean == "speed" and speed:
            session.speed = max(0.5, min(2.0, speed))
            return {"session_id": session_id, "status": "speed_updated", "speed": session.speed}
        elif action_clean == "jump_section" and section_index is not None:
            if 0 <= section_index < len(session.lesson_steps):
                session.current_step_index = section_index
                session.current_sentence_index = 0
                step = session.lesson_steps[section_index]
                session.active_visual = step.get("visual")
                audio = await self.generate_audio_with_fallback(step["teacher_speech"], session.voice_name, session.speed, session.language)
                return {
                    "session_id": session_id,
                    "status": "section_jumped",
                    "current_step_index": section_index,
                    "current_section_index": section_index,
                    "total_sections": len(session.lesson_steps),
                    "step_title": step["title"],
                    "current_section": {
                        "title": step["title"],
                        "type": step.get("type", "section"),
                        "spoken_script": step["teacher_speech"],
                        "sentences": step.get("sentences", []),
                    },
                    "teacher_speech": step["teacher_speech"],
                    "sentences": step.get("sentences", []),
                    "audio_url": audio.get("audio_url"),
                    "audio_available": audio.get("audio_available", False),
                    "synced_visual": session.active_visual
                }
        elif action_clean == "set_sentence" and sentence_index is not None:
            session.current_sentence_index = sentence_index
            return {"session_id": session_id, "status": "sentence_updated", "sentence_index": sentence_index}
        elif action_clean == "replay":
            step = session.lesson_steps[session.current_step_index]
            audio = await self.generate_audio_with_fallback(
                step["teacher_speech"], session.voice_name, session.speed, session.language
            )
            return {
                "session_id": session_id,
                "status": "replaying",
                "teacher_speech": step["teacher_speech"],
                "sentences": step.get("sentences", []),
                "audio_url": audio.get("audio_url"),
                "audio_available": audio.get("audio_available", False),
                "synced_visual": session.active_visual
            }
        elif action_clean == "stop":
            if session_id in self.sessions:
                del self.sessions[session_id]
            return {"session_id": session_id, "status": "stopped", "is_lesson_finished": True}

        return {"session_id": session_id, "status": action_clean, "is_paused": session.is_paused}

    async def generate_audio_with_fallback(
        self,
        text: str,
        voice_name: str = "Kore",
        speed: float = 1.0,
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Synthesizes audio with dual-engine support:
        1. Cloud Gemini Native Audio or ElevenLabs when credentials present.
        2. Clean fallback to Browser WebSpeechAPI Engine with zero failure crashes.
        """
        clean_text = self._sanitize_text_for_speech(text)
        gemini_key = os.getenv("GEMINI_API_KEY", "")
        eleven_key = os.getenv("ELEVENLABS_API_KEY", "")

        # 1. Gemini Native Audio (with 60-second circuit breaker if network unreachable)
        if gemini_key and time.time() > self._cloud_audio_disabled_until:
            try:
                gemini_voice = {"Kore": "Kore", "Puck": "Puck", "Fenrir": "Fenrir", "Aoede": "Aoede"}.get(voice_name, "Kore")
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key={gemini_key}"
                payload = {
                    "contents": [{"parts": [{"text": clean_text[:1200]}]}],
                    "generationConfig": {
                        "responseModalities": ["AUDIO"],
                        "speechConfig": {
                            "voiceConfig": {"prebuiltVoiceConfig": {"voiceName": gemini_voice}}
                        }
                    }
                }
                async with httpx.AsyncClient(timeout=3.5) as client:
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        inline = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("inlineData", {})
                        b64_pcm = inline.get("data")
                        if b64_pcm:
                            pcm_bytes = base64.b64decode(b64_pcm)
                            wav_bytes = wrap_pcm16_in_wav(pcm_bytes, sample_rate=24000)
                            b64_wav = base64.b64encode(wav_bytes).decode("utf-8")
                            return {
                                "audio_url": f"data:audio/wav;base64,{b64_wav}",
                                "audio_available": True,
                                "duration_seconds": round(len(pcm_bytes) / 48000.0, 2),
                                "provider": f"Google Gemini Native Audio ({gemini_voice})",
                                "success": True,
                            }
            except Exception as e:
                self._cloud_audio_disabled_until = time.time() + 60.0
                logger.warning(f"Gemini native audio call failed: {e}. Circuit breaker engaged for 60s. Falling back to Web Speech.")

        # 2. ElevenLabs Multilingual
        if eleven_key:
            try:
                voice_id = "EXAVITQu4vr4xnSDxMaL"
                url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
                headers = {"xi-api-key": eleven_key, "Content-Type": "application/json", "Accept": "audio/mpeg"}
                payload = {
                    "text": clean_text[:1000],
                    "model_id": "eleven_multilingual_v2",
                    "voice_settings": {"stability": 0.5, "similarity_boost": 0.8},
                }
                async with httpx.AsyncClient(timeout=15.0) as client:
                    res = await client.post(url, headers=headers, json=payload)
                    if res.status_code == 200:
                        b64_mp3 = base64.b64encode(res.content).decode("utf-8")
                        return {
                            "audio_url": f"data:audio/mpeg;base64,{b64_mp3}",
                            "audio_available": True,
                            "duration_seconds": max(2.5, len(clean_text) * 0.06),
                            "provider": "ElevenLabs Multilingual Neural Voice",
                            "success": True,
                        }
            except Exception as e:
                logger.warning(f"ElevenLabs fallback failed: {e}")

        # 3. Transparent Browser Web Speech Fallback
        return {
            "audio_url": None,
            "audio_available": False,
            "duration_seconds": max(2.0, len(clean_text) * 0.05),
            "provider": "Browser WebSpeechAPI Engine",
            "notice": "Cloud audio credentials not configured; audio is seamlessly synthesized via client Web Speech API with full visual synchronization.",
            "success": True,
        }

    def _sanitize_text_for_speech(self, text: str) -> str:
        t = re.sub(r"\[.*?\]\(.*?\)", "", text)
        t = re.sub(r"[*#_`>~]", "", t)
        t = re.sub(r"\\[\(\)\[\]]", "", t)
        t = re.sub(r"https?://\S+", "", t)
        t = re.sub(r"\s+", " ", t).strip()
        return t


voice_orchestrator = VoiceLessonOrchestrator()
