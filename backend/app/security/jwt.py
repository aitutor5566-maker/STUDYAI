import datetime
import json
import base64
import hmac
import hashlib
from typing import Any, Dict, Optional
from ..core.config import settings


def _base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")


def _base64url_decode(data_str: str) -> bytes:
    padding = "=" * (4 - (len(data_str) % 4))
    return base64.urlsafe_b64decode(data_str + padding)


def create_jwt_token(payload: Dict[str, Any], expires_delta: Optional[datetime.timedelta] = None) -> str:
    """Create a signed JWT token using HMAC-SHA256."""
    header = {"alg": "HS256", "typ": "JWT"}
    now = datetime.datetime.now(datetime.timezone.utc)
    
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
    to_encode = payload.copy()
    to_encode.update({"iat": int(now.timestamp()), "exp": int(expire.timestamp())})
    
    header_bytes = json.dumps(header, separators=(",", ":")).encode("utf-8")
    payload_bytes = json.dumps(to_encode, separators=(",", ":")).encode("utf-8")
    
    encoded_header = _base64url_encode(header_bytes)
    encoded_payload = _base64url_encode(payload_bytes)
    
    signing_input = f"{encoded_header}.{encoded_payload}".encode("utf-8")
    signature = hmac.new(settings.JWT_SECRET_KEY.encode("utf-8"), signing_input, hashlib.sha256).digest()
    encoded_signature = _base64url_encode(signature)
    
    return f"{encoded_header}.{encoded_payload}.{encoded_signature}"


def decode_jwt_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and verify JWT token signature and expiration."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        
        encoded_header, encoded_payload, encoded_signature = parts
        signing_input = f"{encoded_header}.{encoded_payload}".encode("utf-8")
        expected_sig = hmac.new(settings.JWT_SECRET_KEY.encode("utf-8"), signing_input, hashlib.sha256).digest()
        actual_sig = _base64url_decode(encoded_signature)
        
        if not hmac.compare_digest(expected_sig, actual_sig):
            return None
        
        payload_json = _base64url_decode(encoded_payload).decode("utf-8")
        payload = json.loads(payload_json)
        
        # Verify expiration
        exp = payload.get("exp")
        if exp and datetime.datetime.now(datetime.timezone.utc).timestamp() > exp:
            return None
            
        return payload
    except Exception:
        return None
