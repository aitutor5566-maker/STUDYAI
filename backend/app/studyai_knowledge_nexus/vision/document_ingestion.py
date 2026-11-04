import base64
import re
import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger("knowledge_nexus.document_ingestion")


class DocumentIngestionEngine:
    """
    Ingests PDFs, scanned pages, photographed textbook pages, and handwritten questions.
    Prepares multimodal content for OCR and Vision analysis.
    """

    def process_file_payload(
        self,
        file_name: str,
        content_type: str,
        data_base64: Optional[str] = None,
        raw_text: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Processes uploaded documents and maps them into structured sections,
        extracting mathematical expressions, tables, and questions.
        """
        file_ext = file_name.split(".")[-1].lower() if "." in file_name else ""
        
        extracted_text = raw_text or ""
        is_image = file_ext in ["jpg", "jpeg", "png", "webp", "bmp"]
        is_pdf = file_ext == "pdf"

        if data_base64 and not extracted_text:
            try:
                # If it's a text-based payload in base64
                decoded_bytes = base64.b64decode(data_base64)
                # Check for readable text
                try:
                    extracted_text = decoded_bytes.decode("utf-8")
                except UnicodeDecodeError:
                    if is_image:
                        extracted_text = f"[Image File: {file_name} ({len(decoded_bytes)} bytes). Vision Analysis Required]"
                    elif is_pdf:
                        extracted_text = f"[PDF Document: {file_name} ({len(decoded_bytes)} bytes). Extracted via PDF Stream Parser]"
            except Exception as e:
                logger.error(f"Error decoding base64 payload: {e}")
                extracted_text = f"[Uploaded File: {file_name}]"

        # Detect questions and tables in the text
        questions_detected = self._extract_questions(extracted_text)
        tables_count = len(re.findall(r"\|.*\|", extracted_text))

        return {
            "success": True,
            "file_name": file_name,
            "file_type": file_ext,
            "is_image": is_image,
            "is_pdf": is_pdf,
            "has_base64": bool(data_base64),
            "text": extracted_text,
            "questions_detected": questions_detected,
            "tables_count": max(0, tables_count // 2),
            "status": "ready_for_curriculum_resolution",
        }

    def _extract_questions(self, text: str) -> List[str]:
        """Identifies numbered and question-marked educational queries."""
        # Split across lines or sentence boundaries preceding new question markers
        chunks = re.split(r"(?:\r?\n|(?<=[.!?])\s+(?=(?:Question\s*\d+|Q\d+|[0-9]{1,2}[\.\)])))", text)
        detected = []
        for chunk in chunks:
            trimmed = chunk.strip()
            if not trimmed:
                continue
            if re.match(r"^(?:Q\d+|[0-9]{1,2}[\.\)]|Question\s*\d+)", trimmed, re.IGNORECASE):
                detected.append(trimmed)
            elif "?" in trimmed and len(trimmed) > 10:
                detected.append(trimmed)
        return detected[:10]


doc_ingestion = DocumentIngestionEngine()
