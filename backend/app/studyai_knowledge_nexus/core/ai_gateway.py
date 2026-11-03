import os
import time
import json
import logging
from typing import Any, Dict, List, Optional, AsyncGenerator
import httpx

logger = logging.getLogger("knowledge_nexus.ai_gateway")

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:7b")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
GROK_API_KEY = os.getenv("GROK_API_KEY", "")
GROK_MODEL = os.getenv("GROK_MODEL", "grok-beta")


class AIGateway:
    """
    Unified Multi-LLM Gateway.
    Prioritizes Local Qwen 2.5 7B via Ollama, with robust cloud fallbacks:
    Groq -> Gemini -> OpenAI -> Grok.
    """

    def __init__(self):
        self.ollama_url = OLLAMA_URL
        self.ollama_model = OLLAMA_MODEL

    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.2,
        max_tokens: int = 4096,
        prefer_provider: Optional[str] = None,
        json_mode: bool = False,
    ) -> Dict[str, Any]:
        """
        Executes generation following the priority chain:
        1. Local Qwen 2.5 7B
        2. Groq (Llama 3.3 70B)
        3. Google Gemini
        4. OpenAI GPT
        5. xAI Grok
        """
        start_time = time.time()
        providers = ["ollama", "groq", "gemini", "openai", "grok"]
        if prefer_provider and prefer_provider in providers:
            providers.remove(prefer_provider)
            providers.insert(0, prefer_provider)

        last_error = None
        for provider in providers:
            try:
                if provider == "ollama":
                    resp = await self._call_ollama(messages, temperature, json_mode)
                    elapsed = int((time.time() - start_time) * 1000)
                    return {
                        "text": resp,
                        "provider": "ollama",
                        "model": self.ollama_model,
                        "latency_ms": elapsed,
                        "fallback_used": False,
                    }
                elif provider == "groq" and GROQ_API_KEY:
                    resp = await self._call_groq(messages, temperature, max_tokens, json_mode)
                    elapsed = int((time.time() - start_time) * 1000)
                    return {
                        "text": resp,
                        "provider": "groq",
                        "model": GROQ_MODEL,
                        "latency_ms": elapsed,
                        "fallback_used": True,
                    }
                elif provider == "gemini" and GEMINI_API_KEY:
                    resp = await self._call_gemini(messages, temperature, json_mode)
                    elapsed = int((time.time() - start_time) * 1000)
                    return {
                        "text": resp,
                        "provider": "gemini",
                        "model": GEMINI_MODEL,
                        "latency_ms": elapsed,
                        "fallback_used": True,
                    }
                elif provider == "openai" and OPENAI_API_KEY:
                    resp = await self._call_openai(messages, temperature, max_tokens, json_mode)
                    elapsed = int((time.time() - start_time) * 1000)
                    return {
                        "text": resp,
                        "provider": "openai",
                        "model": OPENAI_MODEL,
                        "latency_ms": elapsed,
                        "fallback_used": True,
                    }
                elif provider == "grok" and GROK_API_KEY:
                    resp = await self._call_grok(messages, temperature, max_tokens, json_mode)
                    elapsed = int((time.time() - start_time) * 1000)
                    return {
                        "text": resp,
                        "provider": "grok",
                        "model": GROK_MODEL,
                        "latency_ms": elapsed,
                        "fallback_used": True,
                    }
            except Exception as e:
                logger.warning(f"Gateway provider '{provider}' failed: {e}. Trying next in chain.")
                last_error = e
                continue

        # If all providers fail, return a safe fallback response
        raise RuntimeError(f"All AI Gateway providers exhausted. Last error: {last_error}")

    async def _call_ollama(self, messages: List[Dict[str, str]], temperature: float, json_mode: bool) -> str:
        payload = {
            "model": self.ollama_model,
            "messages": messages,
            "stream": False,
            "options": {"temperature": temperature},
        }
        if json_mode:
            payload["format"] = "json"

        async with httpx.AsyncClient(timeout=45.0) as client:
            res = await client.post(f"{self.ollama_url}/api/chat", json=payload)
            if res.status_code != 200:
                raise RuntimeError(f"Ollama returned HTTP {res.status_code}: {res.text}")
            data = res.json()
            return data.get("message", {}).get("content", "")

    async def _call_groq(
        self, messages: List[Dict[str, str]], temperature: float, max_tokens: int, json_mode: bool
    ) -> str:
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        }
        # Use verified Groq model name
        model_name = GROQ_MODEL if "llama" in GROQ_MODEL.lower() or "mixtral" in GROQ_MODEL.lower() else "llama-3.3-70b-versatile"
        payload = {
            "model": model_name,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if json_mode:
            payload["response_format"] = {"type": "json_object"}

        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.post(url, headers=headers, json=payload)
            if res.status_code != 200:
                raise RuntimeError(f"Groq returned HTTP {res.status_code}: {res.text}")
            data = res.json()
            return data["choices"][0]["message"]["content"]

    async def _call_gemini(self, messages: List[Dict[str, str]], temperature: float, json_mode: bool) -> str:
        # Convert standard OpenAI/Ollama messages into Gemini contents format
        contents = []
        system_instruction = None
        for m in messages:
            if m["role"] == "system":
                system_instruction = {"parts": [{"text": m["content"]}]}
            elif m["role"] == "user":
                contents.append({"role": "user", "parts": [{"text": m["content"]}]})
            elif m["role"] == "assistant":
                contents.append({"role": "model", "parts": [{"text": m["content"]}]})

        gemini_model = "gemini-2.0-flash"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{gemini_model}:generateContent?key={GEMINI_API_KEY}"
        payload: Dict[str, Any] = {
            "contents": contents,
            "generationConfig": {"temperature": temperature},
        }
        if system_instruction:
            payload["systemInstruction"] = system_instruction
        if json_mode:
            payload["generationConfig"]["responseMimeType"] = "application/json"

        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.post(url, json=payload)
            if res.status_code != 200:
                raise RuntimeError(f"Gemini returned HTTP {res.status_code}: {res.text}")
            data = res.json()
            candidates = data.get("candidates", [])
            if not candidates:
                raise RuntimeError("Gemini returned empty candidates")
            return candidates[0]["content"]["parts"][0]["text"]

    async def _call_openai(
        self, messages: List[Dict[str, str]], temperature: float, max_tokens: int, json_mode: bool
    ) -> str:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": OPENAI_MODEL,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if json_mode:
            payload["response_format"] = {"type": "json_object"}

        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.post(url, headers=headers, json=payload)
            if res.status_code != 200:
                raise RuntimeError(f"OpenAI returned HTTP {res.status_code}: {res.text}")
            data = res.json()
            return data["choices"][0]["message"]["content"]

    async def _call_grok(
        self, messages: List[Dict[str, str]], temperature: float, max_tokens: int, json_mode: bool
    ) -> str:
        url = "https://api.x.ai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {GROK_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": GROK_MODEL,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if json_mode:
            payload["response_format"] = {"type": "json_object"}

        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.post(url, headers=headers, json=payload)
            if res.status_code != 200:
                raise RuntimeError(f"Grok returned HTTP {res.status_code}: {res.text}")
            data = res.json()
            return data["choices"][0]["message"]["content"]


ai_gateway = AIGateway()
