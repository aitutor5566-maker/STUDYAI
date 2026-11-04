import time
import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger("knowledge_nexus.adaptive_memory")


class AdaptiveLearningMemory:
    """
    Manages long-term student learning performance memory and closed-loop dynamic adaptation.
    Records actual interactions, tracks improvements over time, and adjusts teaching strategy
    without medical diagnosing or permanent ability labeling.
    """

    def __init__(self):
        # In-memory store (mirrored to SQLite student_adaptive_profiles / database)
        self._profiles: Dict[str, Dict[str, Any]] = {}

    def get_or_create_profile(self, user_id: str, grade: int = 10, board: str = "ICSE") -> Dict[str, Any]:
        """Retrieves an existing student learning profile or initializes an honest onboarding profile."""
        if user_id not in self._profiles:
            self._profiles[user_id] = {
                "user_id": user_id,
                "grade": grade,
                "board": board,
                "preferred_language": "English",
                "explanation_style": "balanced",
                "difficulties": [],
                "preferred_learning_methods": ["diagrams", "examples"],
                "interaction_history": [],
                "topics_mastered": [],
                "topics_needing_revision": [],
                "repeated_mistakes": {},
                "practice_metrics": {
                    "total_questions_attempted": 0,
                    "total_correct": 0,
                    "spelling_accuracy_percent": 100,
                    "math_steps_accuracy_percent": 100,
                    "comprehension_accuracy_percent": 100,
                },
                "strategy_adjustments": {
                    "scaffolding_level": "standard", # 'extra_scaffolded', 'standard', 'advanced_faded'
                    "visual_frequency": "high",
                    "step_granularity": "medium",
                },
                "last_updated": time.time(),
            }
        return self._profiles[user_id]

    def record_interaction(
        self,
        user_id: str,
        topic: str,
        subject: str,
        grade: int,
        question_answered: bool = False,
        was_correct: bool = True,
        student_feedback: Optional[str] = None, # 'too_simple', 'just_right', 'too_detailed'
        mistake_type: Optional[str] = None,    # 'spelling', 'calculation', 'definition_misconception'
    ) -> Dict[str, Any]:
        """
        Records a learning event and dynamically adjusts teaching parameters based on empirical observations.
        """
        profile = self.get_or_create_profile(user_id, grade)
        metrics = profile["practice_metrics"]
        adjustments = profile["strategy_adjustments"]

        if question_answered:
            metrics["total_questions_attempted"] += 1
            if was_correct:
                metrics["total_correct"] += 1
                if topic not in profile["topics_mastered"]:
                    profile["topics_mastered"].append(topic)
                if topic in profile["topics_needing_revision"]:
                    profile["topics_needing_revision"].remove(topic)
                # If demonstrating sustained mastery, fade scaffolding
                if metrics["total_correct"] >= 3 and adjustments["scaffolding_level"] == "extra_scaffolded":
                    adjustments["scaffolding_level"] = "standard"
            else:
                if topic not in profile["topics_needing_revision"]:
                    profile["topics_needing_revision"].append(topic)
                # If struggling, elevate scaffolding and increase diagram frequency
                adjustments["scaffolding_level"] = "extra_scaffolded"
                adjustments["visual_frequency"] = "maximum"
                adjustments["step_granularity"] = "finest_micro_steps"

        if mistake_type:
            profile["repeated_mistakes"][mistake_type] = profile["repeated_mistakes"].get(mistake_type, 0) + 1
            # Automatically activate targeted support if repeated errors observed
            if profile["repeated_mistakes"][mistake_type] >= 2:
                if mistake_type == "spelling" and "spelling" not in profile["difficulties"]:
                    profile["difficulties"].append("spelling")
                elif mistake_type == "calculation" and "mathematical_calculations" not in profile["difficulties"]:
                    profile["difficulties"].append("mathematical_calculations")

        if student_feedback == "too_detailed":
            profile["explanation_style"] = "concise"
            adjustments["step_granularity"] = "concise"
        elif student_feedback == "too_simple":
            profile["explanation_style"] = "detailed"
            adjustments["scaffolding_level"] = "advanced_faded"

        profile["last_updated"] = time.time()
        return profile

    def update_student_preferences(
        self,
        user_id: str,
        difficulties: Optional[List[str]] = None,
        explanation_style: Optional[str] = None,
        preferred_learning_methods: Optional[List[str]] = None,
        grade: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Allows student or parent to review and edit learning preferences at any time."""
        profile = self.get_or_create_profile(user_id)
        if difficulties is not None:
            profile["difficulties"] = difficulties
        if explanation_style:
            profile["explanation_style"] = explanation_style
        if preferred_learning_methods is not None:
            profile["preferred_learning_methods"] = preferred_learning_methods
        if grade is not None:
            profile["grade"] = max(1, min(10, grade))
        profile["last_updated"] = time.time()
        return profile

    def get_profile(self, user_id: str) -> Dict[str, Any]:
        """Alias for get_or_create_profile."""
        return self.get_or_create_profile(user_id)

    def update_profile(
        self,
        user_id: str,
        difficulties: Optional[List[str]] = None,
        explanation_style: Optional[str] = None,
        preferred_learning_methods: Optional[List[str]] = None,
        grade: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Alias for update_student_preferences."""
        return self.update_student_preferences(
            user_id=user_id,
            difficulties=difficulties,
            explanation_style=explanation_style,
            preferred_learning_methods=preferred_learning_methods,
            grade=grade,
        )


adaptive_memory = AdaptiveLearningMemory()
