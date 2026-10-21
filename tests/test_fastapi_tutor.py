import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch
from fastapi_server.main import app
from fastapi_server.prompt import build_ai_tutor_system_prompt
from fastapi_server.config import OLLAMA_MODEL
from fastapi_server.ollama_client import OllamaConnectionError, OllamaModelNotFoundError


client = TestClient(app)


def test_system_prompt_grades():
    """Verifies grade-band pedagogical adaptation for Grade 2 vs Grade 10."""
    prompt_g2 = build_ai_tutor_system_prompt(grade=2, subject="Maths", language="English")
    assert "GRADE 2 FOUNDATION STAGE" in prompt_g2
    assert "simple words" in prompt_g2.lower()

    prompt_g10 = build_ai_tutor_system_prompt(grade=10, subject="Physics", language="English")
    assert "GRADE 10 SECONDARY / BOARD PREPARATION STAGE" in prompt_g10
    assert "mathematical derivations" in prompt_g10.lower()


def test_system_prompt_languages():
    """Verifies language instructions for English, Telugu, and Hindi."""
    prompt_en = build_ai_tutor_system_prompt(grade=8, subject="Science", language="English")
    assert "LANGUAGE: ENGLISH" in prompt_en

    prompt_te = build_ai_tutor_system_prompt(grade=8, subject="Science", language="Telugu")
    assert "LANGUAGE: TELUGU" in prompt_te
    assert "కిరణజన్య సంయోగక్రియ" in prompt_te

    prompt_hi = build_ai_tutor_system_prompt(grade=8, subject="Science", language="Hindi")
    assert "LANGUAGE: HINDI" in prompt_hi
    assert "प्रकाश संश्लेषण" in prompt_hi


def test_health_check_endpoint():
    """Checks the health check endpoint returns expected schema."""
    resp = client.get("/api/tutor/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["service"] == "AI Tutor FastAPI Backend"
    assert data["configured_model"] == OLLAMA_MODEL
    assert "accessible" in data


def test_validation_errors():
    """Verifies that invalid requests are rejected with HTTP 422."""
    # Empty message
    resp = client.post("/api/tutor/chat", json={"message": "", "grade": 10})
    assert resp.status_code == 422

    # Invalid grade (> 10)
    resp = client.post("/api/tutor/chat", json={"message": "Hello", "grade": 12})
    assert resp.status_code == 422

    # Invalid grade (< 1)
    resp = client.post("/api/tutor/chat", json={"message": "Hello", "grade": 0})
    assert resp.status_code == 422


@patch("fastapi_server.main.call_ollama_chat")
def test_connection_error_handling(mock_chat):
    """Verifies HTTP 503 is returned when Ollama service cannot be reached."""
    mock_chat.side_effect = OllamaConnectionError("Connection refused on port 11434")
    resp = client.post("/api/tutor/chat", json={"message": "What is photosynthesis?", "grade": 10})
    assert resp.status_code == 503
    assert "unavailable" in resp.json()["detail"].lower()


@patch("fastapi_server.main.call_ollama_chat")
def test_missing_model_error_handling(mock_chat):
    """Verifies HTTP 404 is returned when model is not installed."""
    mock_chat.side_effect = OllamaModelNotFoundError("Model 'qwen2.5:7b' not found in Ollama")
    resp = client.post("/api/tutor/chat", json={"message": "What is photosynthesis?", "grade": 10})
    assert resp.status_code == 404
    assert "not found" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_live_ollama_qwen_integration():
    """Real live integration test with local Ollama qwen2.5:7b."""
    from fastapi_server.ollama_client import check_ollama_health, call_ollama_chat

    health = await check_ollama_health()
    if not health["accessible"] or not health["model_available"]:
        pytest.skip("Local Ollama is not accessible or qwen2.5:7b is not loaded.")

    res = await call_ollama_chat(
        messages=[
            {"role": "system", "content": "You are AI Tutor. Answer in exactly 1 concise sentence."},
            {"role": "user", "content": "What is 7 times 8?"},
        ],
        options={"num_predict": 30, "temperature": 0.1},
    )
    assert res["content"]
    assert "56" in res["content"]
    assert res["tokens_per_second"] > 0
    assert res["model"] == OLLAMA_MODEL
