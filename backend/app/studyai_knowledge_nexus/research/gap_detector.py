import re
from typing import Any, Dict, List, Optional


class KnowledgeGapDetector:
    """
    Detects whether a query requires external search or verification beyond
    the static ICSE curriculum.
    """

    GAP_TRIGGERS = [
        "latest", "recent", "current", "news", "update", "research",
        "find online", "search web", "telegram", "external source",
        "who won", "is it true that", "latest syllabus", "2025", "2026"
    ]

    def requires_external_research(self, query: str, matched_curriculum: Optional[Dict[str, Any]]) -> bool:
        q_lower = query.lower()
        if any(trigger in q_lower for trigger in self.GAP_TRIGGERS):
            return True
        if matched_curriculum is None:
            return True
        return False


gap_detector = KnowledgeGapDetector()
