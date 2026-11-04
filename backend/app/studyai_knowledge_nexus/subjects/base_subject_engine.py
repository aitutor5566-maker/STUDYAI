import abc
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class DefinitionScaffold(BaseModel):
    """
    Mandatory 5-Part Definition Scaffold:
    1. Original academic definition (preserves 100% meaning & criteria).
    2. Simplified definition.
    3. Explanation of difficult words.
    4. Simple relatable example.
    5. Proof showing why the simplified version means the exact same thing.
    """
    original_academic_definition: str = Field(..., description="Preserves 100% meaning & technical conditions")
    simplified_definition: str = Field(..., description="Clear everyday phrasing")
    difficult_words_breakdown: List[Dict[str, str]] = Field(default_factory=list, description="Word -> clear meaning")
    relatable_example: str = Field(..., description="Concrete everyday example")
    meaning_preservation_proof: str = Field(..., description="Explanation of why meaning is identical")


class SubjectEngineOutput(BaseModel):
    """Unified Output Schema across all 10 Subject Intelligence Engines."""
    subject: str
    topic: str
    curriculum_board: str
    grade: int
    teaching_methodology: str
    definition_scaffold: DefinitionScaffold
    core_explanation_steps: List[Dict[str, Any]]
    essential_terminology: List[Dict[str, str]]
    worked_examples: List[Dict[str, Any]]
    visual_recommendation: Dict[str, Any]
    assessment_checkpoint: Dict[str, Any]
    common_misconceptions: List[Dict[str, str]]
    subject_specific_payload: Dict[str, Any] = Field(default_factory=dict)
    is_valid: bool = True
    validation_notes: List[str] = Field(default_factory=list)


class BaseSubjectEngine(abc.ABC):
    """Abstract Base Class for all 10 Subject Intelligence Engines."""

    @property
    @abc.abstractmethod
    def subject_name(self) -> str:
        """Name of the subject, e.g. 'Mathematics', 'English I', 'Physics'."""
        pass

    @property
    @abc.abstractmethod
    def allowed_visual_types(self) -> List[str]:
        """List of allowed visual formats for this subject."""
        pass

    @abc.abstractmethod
    def analyze_topic(
        self,
        topic: str,
        grade: int,
        board: str = "ICSE",
        mode: str = "normal",
        context: Optional[Dict[str, Any]] = None
    ) -> SubjectEngineOutput:
        """Executes subject-specific intelligence, structuring explanations and domain rules."""
        pass

    @abc.abstractmethod
    def validate_academic_accuracy(self, output: SubjectEngineOutput) -> bool:
        """Validates that no subject-specific laws, definitions, or equations were violated."""
        pass
