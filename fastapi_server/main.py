import json
import logging
import re
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field, field_validator

from .config import OLLAMA_MODEL, OLLAMA_URL, PORT
from .ollama_client import (
    OllamaConnectionError,
    OllamaModelNotFoundError,
    OllamaResponseError,
    call_ollama_chat,
    check_ollama_health,
    stream_ollama_chat,
)
from .prompt import build_ai_tutor_system_prompt

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("ai_tutor_fastapi")

app = FastAPI(
    title="AI Tutor Backend",
    description="Local Multilingual AI Teaching System powered by Ollama and Qwen2.5:7b for Grades 1–10",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatMessage(BaseModel):
    role: str
    content: str

    @field_validator("role")
    def validate_role(cls, v: str) -> str:
        role_clean = v.strip().lower()
        if role_clean not in ("user", "assistant", "system"):
            raise ValueError("Role must be 'user', 'assistant', or 'system'")
        return role_clean


class TutorChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=5000, description="Student question or topic")
    grade: int = Field(default=10, ge=1, le=10, description="Student grade (1 to 10)")
    subject: str = Field(default="Science", max_length=80, description="Curriculum subject")
    language: str = Field(default="English", max_length=40, description="English, Telugu, or Hindi")
    history: List[ChatMessage] = Field(default=[], description="Previous conversation turns")
    stream: bool = Field(default=False, description="Whether to stream response tokens via SSE")
    topic: Optional[str] = Field(default=None, max_length=200, description="Specific topic title")
    mode: Optional[str] = Field(default="detailed", description="simple or detailed explanation")


@app.get("/health")
@app.get("/api/tutor/health")
async def get_health():
    """Health check verifying Ollama connection and qwen2.5:7b availability."""
    ollama_info = await check_ollama_health()
    return {
        "service": "AI Tutor FastAPI Backend",
        "status": ollama_info["status"],
        "ollama_url": OLLAMA_URL,
        "configured_model": OLLAMA_MODEL,
        "model_available": ollama_info["model_available"],
        "models_installed": ollama_info["models_installed"],
        "accessible": ollama_info["accessible"],
        "error": ollama_info.get("error"),
    }


def _extract_keywords_and_sections(text: str, topic: str, subject: str) -> Dict[str, Any]:
    """Extracts keywords, key steps, and definitions from teacher response."""
    lines = text.split("\n")
    key_points = []
    definitions = []
    current_section = None

    for raw_line in lines:
        line = raw_line.strip()
        if not line:
            continue
        # Numbered key point
        if re.match(r"^(\d+[\.\)]|\-|\*)\s+\*?\*?", line):
            cleaned = re.sub(r"^(\d+[\.\)]|\-|\*)\s+", "", line).strip("* ")
            if len(cleaned) > 10 and len(key_points) < 5:
                key_points.append(cleaned)
        # Definition pattern: Term: Definition or Term - Definition
        if ":" in line or "—" in line or " - " in line:
            parts = re.split(r"[:—]|\s-\s", line, maxsplit=1)
            if len(parts) == 2 and 2 < len(parts[0].strip("* ")) < 30 and len(parts[1].strip()) > 10:
                if len(definitions) < 4:
                    definitions.append({
                        "term": parts[0].strip("* "),
                        "definition": parts[1].strip(),
                    })

    # Fallback key points if not explicitly numbered
    if not key_points:
        paragraphs = [p.strip() for p in text.split("\n\n") if len(p.strip()) > 30]
        key_points = paragraphs[:4]

    # Generate topic keywords
    words = re.findall(r"\b[A-Za-z\u0C00-\u0C7F\u0900-\u097F]{4,}\b", f"{topic} {subject} {text}")
    unique_words = []
    stopwords = {"this", "that", "with", "from", "have", "your", "what", "which", "will", "when", "about", "these", "their", "there", "because"}
    for w in words:
        wl = w.lower()
        if wl not in stopwords and wl not in [u.lower() for u in unique_words]:
            unique_words.append(w)
            if len(unique_words) >= 7:
                break

    return {
        "keySteps": key_points[:5],
        "definitions": definitions[:4],
        "keywords": unique_words,
    }


@app.post("/api/tutor/chat")
async def chat_with_tutor(req: TutorChatRequest):
    """Core AI Tutor chat endpoint connecting to local Ollama model."""
    clean_msg = req.message.strip()
    topic = req.topic or clean_msg[:60]

    # Build centralized AI Tutor system prompt
    system_prompt = build_ai_tutor_system_prompt(
        grade=req.grade,
        subject=req.subject,
        language=req.language,
    )

    # Assemble conversation payload
    messages = [{"role": "system", "content": system_prompt}]
    for turn in req.history[-6:]:
        messages.append({"role": turn.role, "content": turn.content})
    messages.append({"role": "user", "content": clean_msg})

    logger.info(
        f"Tutoring request | Grade: {req.grade} | Subject: {req.subject} | Language: {req.language} | Stream: {req.stream}"
    )

    if req.stream:
        async def event_generator():
            try:
                async for chunk in stream_ollama_chat(messages, model=OLLAMA_MODEL):
                    payload = json.dumps({"token": chunk})
                    yield f"data: {payload}\n\n"
                yield "data: [DONE]\n\n"
            except Exception as err:
                error_payload = json.dumps({"error": str(err)})
                yield f"data: {error_payload}\n\n"

        return StreamingResponse(event_generator(), media_type="text/event-stream")

    # Non-streaming response
    try:
        ollama_res = await call_ollama_chat(messages, model=OLLAMA_MODEL)
    except OllamaConnectionError as err:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Local AI model connection unavailable: {str(err)}",
        )
    except OllamaModelNotFoundError as err:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(err),
        )
    except OllamaResponseError as err:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(err),
        )
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error in AI Tutor: {str(err)}",
        )

    content = ollama_res["content"]
    extracted = _extract_keywords_and_sections(content, topic, req.subject)

    return {
        "role": "assistant",
        "content": content,
        "topic": topic,
        "subject": req.subject,
        "grade": req.grade,
        "language": req.language,
        "structured": {
            "topic": topic,
            "subject": req.subject,
            "grade": req.grade,
            "language": req.language,
            "introduction": content,
            "keySteps": extracted["keySteps"],
            "definitions": extracted["definitions"],
            "keywords": extracted["keywords"],
        },
        "metadata": {
            "model": ollama_res["model"],
            "total_duration_sec": ollama_res["total_duration_sec"],
            "eval_count": ollama_res["eval_count"],
            "tokens_per_second": ollama_res["tokens_per_second"],
            "provider": "Ollama (qwen2.5:7b)",
        },
    }
