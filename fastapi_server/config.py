import os

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:7b")
PORT = int(os.getenv("FASTAPI_PORT", "8000"))
TIMEOUT_SECONDS = float(os.getenv("OLLAMA_TIMEOUT", "180.0"))
