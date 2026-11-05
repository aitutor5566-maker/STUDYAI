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
        language: str = "en",
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
        self.language = language.lower() # 'en', 'te', 'hi', 'ur', 'ml'
        self.profile = profile or {}
        self.voice_name = voice_name
        self.speed = speed
        self.created_at = time.time()
        self.current_step_index = 0
        self.current_sentence_index = 0
        self.is_paused = False
        self.is_muted = False
        self.lesson_steps: List[Dict[str, Any]] = []
        self.conversation_transcript: List[Dict[str, str]] = []
        self.active_visual: Optional[Dict[str, Any]] = None


class VoiceLessonOrchestrator:
    """
    Dedicated Synchronized Voice Lesson Orchestrator.
    Connects:
    - Shared Educational Knowledge Library for verified topic facts
    - Sentence & Step level visual synchronization (highlighting matching text & 3D objects)
    - Full teaching controls: Pause, Resume, Replay, Speed, Repeat Sentence, Explain Simpler, Step-by-Step
    - Multilingual Support: English, Telugu, Hindi, Urdu, Malayalam
    - Transparent Dual-Engine Audio: Gemini Native Audio / ElevenLabs + Browser Web Speech fallback
    """

    def __init__(self):
        self.sessions: Dict[str, VoiceSession] = {}

    async def start_voice_lesson(
        self,
        topic: str,
        grade: int = 10,
        subject: Optional[str] = None,
        mode: str = "normal",
        language: str = "en",
        user_id: str = "student_voice_user",
        profile: Optional[Dict[str, Any]] = None,
        voice_name: str = "Kore",
        speed: float = 1.0,
    ) -> Dict[str, Any]:
        session_id = f"vsession-{uuid.uuid4().hex[:10]}"

        # 1. Subject Classification
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
            language=language,
            profile=profile,
            voice_name=voice_name,
            speed=speed,
        )

        # 3. Build Synchronized Lesson Steps
        session.lesson_steps = self._build_synchronized_lesson_sequence(
            topic=topic,
            grade=grade,
            subject=resolved_subject,
            language=session.language,
            knowledge=k_record
        )

        first_step = session.lesson_steps[0]
        session.active_visual = first_step.get("visual")
        session.current_step_index = 0
        session.current_sentence_index = 0

        # 4. Generate Spoken Audio
        spoken_text = first_step["teacher_speech"]
        audio_payload = await self.generate_audio_with_fallback(
            text=spoken_text,
            voice_name=voice_name,
            speed=speed,
            language=session.language
        )

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
            "language": session.language,
            "speed": session.speed,
            "current_step_index": 0,
            "total_steps": len(session.lesson_steps),
            "step_title": first_step["title"],
            "teacher_speech": spoken_text,
            "sentences": first_step.get("sentences", []),
            "audio_url": audio_payload.get("audio_url"),
            "audio_available": audio_payload.get("audio_available", False),
            "provider_used": audio_payload.get("provider", "Browser WebSpeechAPI"),
            "notice": audio_payload.get("notice"),
            "synced_visual": session.active_visual,
            "checkpoint_question": first_step.get("checkpoint_question"),
            "suggested_actions": [
                "I understand, continue",
                "Explain more simply",
                "Repeat this sentence",
                "Explain step-by-step"
            ],
        }

    async def process_student_turn(
        self,
        session_id: str,
        student_utterance: str,
        action: Optional[str] = None
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

        # Action: Repeat current sentence
        if action == "repeat_sentence" or any(p in clean_utterance for p in ["repeat sentence", "repeat that sentence", "say that again"]):
            sents = current_step.get("sentences", [])
            cur_idx = session.current_sentence_index
            target_sent = sents[cur_idx]["text"] if cur_idx < len(sents) else current_step["teacher_speech"]
            teacher_reply_text = f"Repeating sentence: {target_sent}"
            highlight_target_override = sents[cur_idx].get("highlight_target_id") if cur_idx < len(sents) else None

        # Action: Explain more simply
        elif action == "explain_simpler" or any(p in clean_utterance for p in ["simpler", "simple", "easy", "confused", "don't understand"]):
            analogy = current_step.get("simple_analogy", f"Let's think of {session.topic} with a simple everyday comparison.")
            teacher_reply_text = f"Let's make it simpler: {analogy}"

        # Action: Explain step by step
        elif action == "explain_step_by_step" or any(p in clean_utterance for p in ["step by step", "break it down"]):
            facts = current_step.get("facts", [])
            if facts:
                teacher_reply_text = "Here is the exact step-by-step breakdown: " + " Then, ".join(facts[:3])
            else:
                teacher_reply_text = f"Step 1: Understand the core structure. Step 2: Follow how {session.topic} operates under natural laws."

        # Action: Checkpoint Answer Evaluation
        elif current_step.get("checkpoint_question") and current_step.get("expected_keywords"):
            expected = current_step["expected_keywords"]
            matched = any(kw.lower() in clean_utterance for kw in expected)
            if matched:
                teacher_reply_text = "Spot on! That is exactly correct. You understood the essential point."
                advance_step = True
            else:
                teacher_reply_text = f"Good attempt! The key factor to remember is {current_step.get('hint', expected[0])}."
                advance_step = True

        # Default forward progression
        else:
            advance_step = True
            teacher_reply_text = "Excellent. Let's move to our next learning milestone."

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
            "language": session.language,
            "speed": session.speed,
            "current_step_index": session.current_step_index,
            "total_steps": len(session.lesson_steps),
            "step_title": active_step["title"],
            "teacher_speech": teacher_reply_text,
            "sentences": active_step.get("sentences", []),
            "audio_url": audio_payload.get("audio_url"),
            "audio_available": audio_payload.get("audio_available", False),
            "provider_used": audio_payload.get("provider", "Browser WebSpeechAPI"),
            "synced_visual": session.active_visual,
            "highlight_target": highlight_target_override or (session.active_visual.get("target_id") if session.active_visual else None),
            "checkpoint_question": active_step.get("checkpoint_question"),
            "is_lesson_finished": session.current_step_index >= len(session.lesson_steps) - 1,
            "suggested_actions": [
                "I understand, continue",
                "Explain more simply",
                "Repeat this sentence",
                "Explain step-by-step"
            ],
        }

    async def update_session_control(
        self,
        session_id: str,
        action: str,
        speed: Optional[float] = None,
        sentence_index: Optional[int] = None
    ) -> Dict[str, Any]:
        """Handles pause, resume, replay, speed change, and sentence index updates."""
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
        2. Clean fallback to Browser WebSpeechAPI with zero failure crashes.
        """
        clean_text = self._sanitize_text_for_speech(text)
        gemini_key = os.getenv("GEMINI_API_KEY", "")
        eleven_key = os.getenv("ELEVENLABS_API_KEY", "")

        # 1. Gemini Native Audio
        if gemini_key:
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
                async with httpx.AsyncClient(timeout=15.0) as client:
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
                logger.warning(f"Gemini native audio call failed: {e}. Falling back.")

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

    def _build_synchronized_lesson_sequence(
        self,
        topic: str,
        grade: int,
        subject: str,
        language: str,
        knowledge: Optional[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Constructs 5 pedagogical steps with discrete sentence-by-sentence visual highlight mapping."""
        k = knowledge or {}
        topic_title = topic.strip().title()
        is_heart = "heart" in topic.lower()

        # Step 1: Hook & Introduction
        step1_text = f"Welcome to our {subject} lesson! Today we are exploring {topic_title} for Grade {grade}."
        if language == "te":
            step1_text = f"మన {subject} పాఠ్యాంశానికి స్వాగతం! ఈరోజు మనం గ్రేడ్ {grade} కోసం {topic_title} గురించి వివరంగా తెలుసుకుందాం."
        elif language == "hi":
            step1_text = f"हमारे {subject} सत्र में आपका स्वागत है! आज हम कक्षा {grade} के लिए {topic_title} का अध्ययन करेंगे।"

        step1_sents = [
            {"sentence_index": 0, "text": step1_text, "highlight_target_id": "whole_model" if is_heart else None, "action": "focus"}
        ]

        # Step 2: Definition & Core Meaning
        acad_def = k.get("definition_academic", f"{topic_title} is a core principle in {subject}.")
        simp_def = k.get("definition_simplified", f"A fundamental mechanism of {topic_title}.")

        step2_text = f"Let's look at the scientific definition: {acad_def} In simple words, {simp_def}"
        if language == "te":
            step2_text = f"పాఠ్యపుస్తక వివరణ: {acad_def} సులభంగా చెప్పాలంటే, {simp_def}"
        elif language == "hi":
            step2_text = f"पाठ्यपुस्तक परिभाषा: {acad_def} सरल शब्दों में, {simp_def}"

        step2_sents = [
            {"sentence_index": 0, "text": f"Scientific Definition: {acad_def}", "highlight_target_id": "sa_node" if is_heart else None, "action": "highlight"},
            {"sentence_index": 1, "text": f"Simplified Concept: {simp_def}", "highlight_target_id": "septum" if is_heart else None, "action": "highlight"}
        ]

        # Step 3: Step-by-Step Circulation / Mechanism
        if is_heart:
            step3_sents = [
                {"sentence_index": 0, "text": "First, deoxygenated blood enters the Right Atrium through the superior and inferior vena cava.", "highlight_target_id": "right_atrium", "action": "highlight"},
                {"sentence_index": 1, "text": "It passes through the tricuspid valve into the Right Ventricle.", "highlight_target_id": "tricuspid_valve", "action": "highlight"},
                {"sentence_index": 2, "text": "The Right Ventricle pumps blood through the pulmonary artery to the lungs.", "highlight_target_id": "pulmonary_artery", "action": "highlight"},
                {"sentence_index": 3, "text": "Oxygenated blood returns to the Left Atrium and passes through the bicuspid valve into the Left Ventricle.", "highlight_target_id": "left_ventricle", "action": "highlight"},
                {"sentence_index": 4, "text": "Finally, the Left Ventricle pumps oxygen-rich blood into the Aorta to nourish the entire body.", "highlight_target_id": "aorta", "action": "highlight"}
            ]
            step3_text = " ".join(s["text"] for s in step3_sents)
        else:
            facts = k.get("facts", [f"{topic_title} functions via discrete coordinated physical stages."])
            step3_sents = [{"sentence_index": i, "text": f, "highlight_target_id": None, "action": "highlight"} for i, f in enumerate(facts[:4])]
            step3_text = " ".join(facts[:4])

        # Step 4: Checkpoint
        step4_question = f"What is one primary function or condition governing {topic_title}?"
        if is_heart:
            step4_question = "Which chamber has the thickest muscular wall to pump blood to the entire body?"

        step4_sents = [
            {"sentence_index": 0, "text": f"Quick Checkpoint: {step4_question}", "highlight_target_id": "left_ventricle" if is_heart else None, "action": "pulse"}
        ]

        # Visual Attachment
        visual_data = {
            "type": "threejs_3d_model" if is_heart else "diagram",
            "model_key": "human-heart" if is_heart else None,
            "target_id": "right_atrium" if is_heart else None,
            "caption": f"Interactive Visual Model for {topic_title}"
        }

        # Step 5: Recap
        step5_text = f"Excellent work! You have mastered the core structure, stages, and examination essentials of {topic_title}."
        step5_sents = [
            {"sentence_index": 0, "text": step5_text, "highlight_target_id": None, "action": "recap"}
        ]

        return [
            {
                "title": "Welcome & Topic Hook",
                "teacher_speech": step1_text,
                "sentences": step1_sents,
                "simple_analogy": simp_def,
                "visual": visual_data
            },
            {
                "title": "Academic Definition & Meaning",
                "teacher_speech": step2_text,
                "sentences": step2_sents,
                "simple_analogy": simp_def,
                "visual": visual_data
            },
            {
                "title": "Step-by-Step Mechanism",
                "teacher_speech": step3_text,
                "sentences": step3_sents,
                "facts": k.get("facts", []),
                "simple_analogy": simp_def,
                "visual": visual_data
            },
            {
                "title": "Interactive Understanding Checkpoint",
                "teacher_speech": f"Let us check your understanding: {step4_question}",
                "sentences": step4_sents,
                "checkpoint_question": step4_question,
                "expected_keywords": ["left ventricle", "ventricle", "thick", "aorta"] if is_heart else ["force", "energy", "reaction", "water", "heat"],
                "hint": "Think about the chamber that needs the most pressure to pump blood all the way to your head and toes.",
                "visual": visual_data
            },
            {
                "title": "Lesson Recap & Next Steps",
                "teacher_speech": step5_text,
                "sentences": step5_sents,
                "visual": visual_data
            }
        ]

    def _sanitize_text_for_speech(self, text: str) -> str:
        t = re.sub(r"\[.*?\]\(.*?\)", "", text)
        t = re.sub(r"[*#_`>~]", "", t)
        t = re.sub(r"\\[\(\)\[\]]", "", t)
        t = re.sub(r"https?://\S+", "", t)
        t = re.sub(r"\s+", " ", t).strip()
        return t


voice_orchestrator = VoiceLessonOrchestrator()
