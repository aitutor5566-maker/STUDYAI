import base64
import os
from typing import Tuple
from fastapi import HTTPException, status
from ..core.config import settings

MAGIC_BYTES = {
    "application/pdf": b"%PDF-",
    "image/png": b"\x89PNG\r\n\x1a\n",
    "image/jpeg": b"\xff\xd8\xff",
    "image/webp": b"RIFF"
}


def validate_file_payload(content_bytes: bytes, mime_type: str) -> Tuple[bytes, str]:
    """
    Validates file payload against size limits, whitelisted MIME types, and magic bytes.
    Returns (validated_content_bytes, validated_mime_type).
    """
    file_size = len(content_bytes)
    
    # 1. Size Check (10MB limit)
    if file_size > settings.MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail={
                "error": "Payload Too Large",
                "message": f"File size ({file_size} bytes) exceeds limit of {settings.MAX_UPLOAD_SIZE_BYTES} bytes (10MB)",
                "code": "FILE_TOO_LARGE"
            }
        )
        
    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "Bad Request", "message": "Uploaded file is empty", "code": "EMPTY_FILE"}
        )
        
    # 2. MIME Type Validation
    if mime_type not in settings.ALLOWED_UPLOAD_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail={
                "error": "Unsupported Media Type",
                "message": f"MIME type '{mime_type}' is not permitted. Allowed: {settings.ALLOWED_UPLOAD_MIME_TYPES}",
                "code": "INVALID_MIME_TYPE"
            }
        )
        
    # 3. Magic Bytes Header Verification for binary types
    if mime_type in MAGIC_BYTES:
        magic = MAGIC_BYTES[mime_type]
        if not content_bytes.startswith(magic):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": "Bad Request",
                    "message": f"File content does not match reported MIME type header '{mime_type}'",
                    "code": "MAGIC_BYTES_MISMATCH"
                }
            )
            
    return content_bytes, mime_type
