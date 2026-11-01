import time
from collections import defaultdict
from typing import Dict, List
from fastapi import HTTPException, Request, status

# In-memory sliding window rate limiter
_request_history: Dict[str, List[float]] = defaultdict(list)


def check_rate_limit(request: Request, max_requests: int = 120, window_seconds: int = 60):
    """
    Sliding window rate limiter based on client IP or user authorization header.
    Defaults to 120 requests per minute per IP.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    auth_header = request.headers.get("Authorization", "")
    key = f"{client_ip}:{auth_header[:20]}"
    
    now = time.time()
    timestamps = _request_history[key]
    
    # Prune timestamps older than window
    cutoff = now - window_seconds
    _request_history[key] = [ts for ts in timestamps if ts > cutoff]
    
    if len(_request_history[key]) >= max_requests:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": "Too Many Requests",
                "message": f"Rate limit exceeded. Maximum {max_requests} requests per {window_seconds}s.",
                "code": "RATE_LIMIT_EXCEEDED"
            }
        )
        
    _request_history[key].append(now)
