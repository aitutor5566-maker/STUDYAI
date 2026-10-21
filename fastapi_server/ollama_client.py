import json
from typing import Any, AsyncGenerator, Dict, List, Optional
import httpx
from .config import OLLAMA_MODEL, OLLAMA_URL, TIMEOUT_SECONDS


class OllamaConnectionError(Exception):
    """Raised when Ollama local API cannot be reached."""
    pass


class OllamaModelNotFoundError(Exception):
    """Raised when the configured model is not pulled in Ollama."""
    pass


class OllamaResponseError(Exception):
    """Raised when Ollama returns an error or empty output."""
    pass


async def check_ollama_health() -> Dict[str, Any]:
    """Inspects local Ollama instance and verifies model availability."""
    url = f"{OLLAMA_URL}/api/tags"
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(url)
            if resp.status_code != 200:
                return {
                    "status": "error",
                    "accessible": False,
                    "error": f"Ollama HTTP {resp.status_code}: {resp.text}",
                    "configured_model": OLLAMA_MODEL,
                    "models_installed": [],
                    "model_available": False,
                }
            data = resp.json()
            models = [m.get("name", "") for m in data.get("models", [])]
            # Match exact name or base name (e.g. 'qwen2.5:7b' or 'qwen2.5:7b-instruct')
            is_avail = any(
                OLLAMA_MODEL == m or OLLAMA_MODEL in m or m.startswith(OLLAMA_MODEL.split(":")[0])
                for m in models
            )
            return {
                "status": "ok" if is_avail else "warning",
                "accessible": True,
                "configured_model": OLLAMA_MODEL,
                "models_installed": models,
                "model_available": is_avail,
            }
    except Exception as exc:
        return {
            "status": "error",
            "accessible": False,
            "error": f"Cannot connect to Ollama at {OLLAMA_URL}: {str(exc)}",
            "configured_model": OLLAMA_MODEL,
            "models_installed": [],
            "model_available": False,
        }


async def call_ollama_chat(
    messages: List[Dict[str, str]],
    model: Optional[str] = None,
    options: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Executes non-streaming chat with local Ollama model."""
    target_model = model or OLLAMA_MODEL
    url = f"{OLLAMA_URL}/api/chat"

    payload = {
        "model": target_model,
        "messages": messages,
        "stream": False,
        "options": options or {"temperature": 0.4, "num_ctx": 8192},
    }

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS) as client:
            resp = await client.post(url, json=payload)
    except httpx.ConnectError as err:
        raise OllamaConnectionError(
            f"Ollama is not running at {OLLAMA_URL}. Start it with 'ollama serve' or check port 11434."
        ) from err
    except httpx.TimeoutException as err:
        raise OllamaResponseError(
            f"Ollama request timed out after {TIMEOUT_SECONDS}s while running model '{target_model}'."
        ) from err
    except Exception as err:
        raise OllamaConnectionError(f"Ollama communication failed: {str(err)}") from err

    if resp.status_code == 404:
        raise OllamaModelNotFoundError(
            f"Model '{target_model}' is not installed in Ollama. Check 'ollama list' or run 'ollama pull {target_model}'."
        )
    if resp.status_code != 200:
        raise OllamaResponseError(f"Ollama error (HTTP {resp.status_code}): {resp.text}")

    data = resp.json()
    message = data.get("message", {})
    content = message.get("content", "").strip()
    if not content:
        raise OllamaResponseError(f"Ollama returned empty response for model '{target_model}'.")

    eval_count = data.get("eval_count", 0)
    eval_duration_ns = data.get("eval_duration", 1) or 1
    tok_per_sec = round(eval_count / (eval_duration_ns / 1e9), 1)

    return {
        "role": message.get("role", "assistant"),
        "content": content,
        "model": target_model,
        "total_duration_sec": round(data.get("total_duration", 0) / 1e9, 2),
        "eval_count": eval_count,
        "tokens_per_second": tok_per_sec,
    }


async def stream_ollama_chat(
    messages: List[Dict[str, str]],
    model: Optional[str] = None,
    options: Optional[Dict[str, Any]] = None,
) -> AsyncGenerator[str, None]:
    """Streams response chunks from local Ollama model."""
    target_model = model or OLLAMA_MODEL
    url = f"{OLLAMA_URL}/api/chat"

    payload = {
        "model": target_model,
        "messages": messages,
        "stream": True,
        "options": options or {"temperature": 0.4, "num_ctx": 8192},
    }

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS) as client:
            async with client.stream("POST", url, json=payload) as response:
                if response.status_code == 404:
                    raise OllamaModelNotFoundError(f"Model '{target_model}' not found in Ollama.")
                if response.status_code != 200:
                    body = await response.aread()
                    raise OllamaResponseError(f"Ollama HTTP {response.status_code}: {body.decode()}")

                async for line in response.aiter_lines():
                    if not line:
                        continue
                    try:
                        chunk = json.loads(line)
                        text_piece = chunk.get("message", {}).get("content", "")
                        if text_piece:
                            yield text_piece
                        if chunk.get("done", False):
                            break
                    except json.JSONDecodeError:
                        continue
    except httpx.ConnectError as err:
        raise OllamaConnectionError(f"Cannot connect to Ollama at {OLLAMA_URL}: {str(err)}") from err
    except httpx.TimeoutException as err:
        raise OllamaResponseError(f"Stream timed out after {TIMEOUT_SECONDS}s.") from err
