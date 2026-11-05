import logging
from typing import Dict, List, Optional
from backend.app.studyai_knowledge_nexus.subjects.base_subject_engine import BaseSubjectEngine
from backend.app.studyai_knowledge_nexus.subjects.english_i_engine import english_i_engine
from backend.app.studyai_knowledge_nexus.subjects.english_ii_engine import english_ii_engine
from backend.app.studyai_knowledge_nexus.subjects.history_engine import history_engine
from backend.app.studyai_knowledge_nexus.subjects.geography_engine import geography_engine
from backend.app.studyai_knowledge_nexus.subjects.civics_engine import civics_engine
from backend.app.studyai_knowledge_nexus.subjects.mathematics_engine import math_engine
from backend.app.studyai_knowledge_nexus.subjects.physics_engine import physics_engine
from backend.app.studyai_knowledge_nexus.subjects.chemistry_engine import chemistry_engine
from backend.app.studyai_knowledge_nexus.subjects.biology_engine import biology_engine
from backend.app.studyai_knowledge_nexus.subjects.computer_science_engine import computer_science_engine

logger = logging.getLogger("knowledge_nexus.subject_registry")


class SubjectRegistry:
    """
    Central Registry for all 10 Independent Subject Intelligence Engines.
    Guarantees that subject knowledge, methodologies, and visual formats
    are never cross-contaminated between subjects.
    """

    def __init__(self):
        self._engines: Dict[str, BaseSubjectEngine] = {
            "english i": english_i_engine,
            "english language": english_i_engine,
            "english ii": english_ii_engine,
            "english literature": english_ii_engine,
            "history": history_engine,
            "geography": geography_engine,
            "civics": civics_engine,
            "civics / political science": civics_engine,
            "mathematics": math_engine,
            "physics": physics_engine,
            "chemistry": chemistry_engine,
            "biology": biology_engine,
            "computer science": computer_science_engine,
        }

    def get_engine(self, subject_name: str) -> BaseSubjectEngine:
        """Resolves the subject engine by exact or normalized name."""
        clean = self.normalize_subject(subject_name)
        if clean in self._engines:
            return self._engines[clean]

        for key, engine in self._engines.items():
            if clean in key or key in clean:
                return engine

        logger.info(f"Subject '{subject_name}' defaulted to BiologyEngine")
        return self._engines["biology"]

    def list_all_subjects(self) -> List[str]:
        return [engine.subject_name for engine in self._engines.values()]

    def normalize_subject(self, sub_str: str) -> str:
        s = sub_str.lower().strip()
        if "math" in s:
            return "mathematics"
        if "phys" in s:
            return "physics"
        if "chem" in s:
            return "chemistry"
        if "bio" in s:
            return "biology"
        if "hist" in s and "civic" not in s:
            return "history"
        if "civic" in s or "pol" in s:
            return "civics / political science"
        if "geog" in s:
            return "geography"
        if "comp" in s or "java" in s or "python" in s:
            return "computer science"
        if "eng" in s:
            if "2" in s or "ii" in s or "lit" in s:
                return "english ii"
            return "english i"
        return s


subject_registry = SubjectRegistry()
