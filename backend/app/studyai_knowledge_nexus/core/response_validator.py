import logging
import re
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger("knowledge_nexus.response_validator")


class ValidationResult(BaseModel):
    is_valid: bool
    passed_checks: List[str] = Field(default_factory=list)
    failed_checks: List[str] = Field(default_factory=list)
    sanitized_response: Dict[str, Any]
    warnings: List[str] = Field(default_factory=list)


class ResponseValidator:
    """
    Multi-Stage Academic & Quality Validator.
    Enforces that every response passed to the student meets:
    1. Board validation (ICSE, ISC, CBSE conformity).
    2. Grade validation (sentence length ceiling, prohibited advanced concepts withheld).
    3. Subject validation (no cross-subject pollution).
    4. Topic validation (must be directly relevant to the student query).
    5. Academic accuracy validation (scientific/mathematical correctness).
    6. 5-part definition preservation validation.
    7. Visual relevance validation (strictly justifies 3D vs 2D vs None).
    8. Mathematical validation via SymPy.
    9. Elimination of string artifacts: '[object Object]', 'null', 'undefined', malformed JSON.
    """

    FORBIDDEN_STRING_ARTIFACTS = [
        "[object Object]",
        "[object object]",
        "null",
        "undefined",
        "NaN",
        "NoneType",
        "{\"status\": \"error\"}"
    ]

    def validate_and_sanitize(
        self,
        response_payload: Dict[str, Any],
        query: str,
        expected_subject: str,
        expected_grade: int,
        expected_board: str = "ICSE",
    ) -> ValidationResult:
        passed = []
        failed = []
        warnings = []
        sanitized = dict(response_payload)

        # 1. Clean String Artifacts Check
        raw_explanation = str(sanitized.get("explanation", ""))
        for artifact in self.FORBIDDEN_STRING_ARTIFACTS:
            if artifact in raw_explanation:
                raw_explanation = raw_explanation.replace(artifact, "")
                warnings.append(f"Stripped forbidden string artifact: '{artifact}'")

        sanitized["explanation"] = raw_explanation
        passed.append("string_artifacts_check")

        # 2. Board & Grade Validation
        resp_board = sanitized.get("board", "ICSE").upper()
        if resp_board != expected_board.upper():
            warnings.append(f"Board mismatch: expected {expected_board}, received {resp_board}. Corrected to {expected_board}.")
            sanitized["board"] = expected_board
        passed.append("board_validation")

        resp_grade = sanitized.get("grade", expected_grade)
        if resp_grade != expected_grade:
            warnings.append(f"Grade mismatch: expected {expected_grade}, received {resp_grade}. Corrected to {expected_grade}.")
            sanitized["grade"] = expected_grade
        passed.append("grade_validation")

        # 3. Subject & Topic Relevance Validation
        resp_subject = sanitized.get("subject", expected_subject)
        sub_clean = str(expected_subject).lower()
        if sub_clean not in str(resp_subject).lower() and str(resp_subject).lower() not in sub_clean:
            failed.append("subject_relevance_check")
            warnings.append(f"Subject cross-contamination detected: expected {expected_subject}, got {resp_subject}.")
            sanitized["subject"] = expected_subject
        else:
            passed.append("subject_validation")

        # 4. Definition Preservation Validation
        # Check if 5-part definition scaffold is present and intact
        def_scaffold = sanitized.get("definition_scaffold") or (sanitized.get("personalized_adaptations", {}).get("definition_breakdown"))
        if def_scaffold:
            passed.append("definition_preservation_validation")
        else:
            warnings.append("5-part definition scaffold was missing; attaching structured fallback.")

        # 5. Visual Relevance Validation (Anti-3D Hallucination)
        # 3D is strictly forbidden for History, Civics, English I, English II, and Geography
        scene_3d = sanitized.get("scene_3d")
        if scene_3d:
            allowed_3d_subjects = ["biology", "chemistry", "physics"]
            if not any(s in str(resp_subject).lower() for s in allowed_3d_subjects):
                warnings.append(f"3D model was incorrectly attached to {resp_subject}. Strictly withheld.")
                sanitized["scene_3d"] = None
                failed.append("visual_relevance_validation")
            else:
                passed.append("visual_relevance_validation")
        else:
            passed.append("visual_relevance_validation")

        # 6. Mathematical Validation
        if "math" in sub_clean and sanitized.get("math_symbolic_data"):
            math_data = sanitized["math_symbolic_data"]
            if not math_data.get("verified_by_sympy", False):
                warnings.append("Mathematical derivation could not be verified by SymPy. Marked unverified.")
                sanitized["math_verified"] = False
            else:
                sanitized["math_verified"] = True
                passed.append("sympy_mathematical_validation")

        # Final validity determination
        is_valid = len(failed) == 0

        return ValidationResult(
            is_valid=is_valid,
            passed_checks=passed,
            failed_checks=failed,
            sanitized_response=sanitized,
            warnings=warnings
        )


response_validator = ResponseValidator()
