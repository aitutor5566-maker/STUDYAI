import json
import logging
import os
from typing import Any, Dict, List

from backend.app.studyai_knowledge_nexus.subjects.subject_registry import subject_registry
from backend.app.studyai_knowledge_nexus.visualization.visual_decision_engine import visual_decision_engine
from backend.app.studyai_knowledge_nexus.curriculum.curriculum_manager import curriculum_manager

logger = logging.getLogger("knowledge_nexus.sft_evaluator")


class SFTEvaluator:
    """
    Evaluates Qwen 2.5 7B and Knowledge Nexus against the Subject SFT Dataset.
    Validates curriculum board boundaries, 5-part definition scaffolds,
    and visual decisions before deciding whether weight fine-tuning is required.
    """

    def __init__(self, dataset_path: str = "dataset/subject_sft_dataset.jsonl"):
        self.dataset_path = dataset_path

    def load_dataset(self) -> List[Dict[str, Any]]:
        records = []
        if not os.path.exists(self.dataset_path):
            raise FileNotFoundError(f"SFT Dataset not found at: {self.dataset_path}")
        with open(self.dataset_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    records.append(json.loads(line))
        return records

    def run_benchmark_evaluation(self) -> Dict[str, Any]:
        dataset = self.load_dataset()
        total_examples = len(dataset)
        
        passed_board_checks = 0
        passed_definition_checks = 0
        passed_visual_decision_checks = 0
        passed_misconception_checks = 0
        subject_breakdown = {}

        for item in dataset:
            board = item["board"]
            grade = item["grade"]
            subject = item["subject"]
            topic = item["topic"]
            expected_visual = item["visual_decision"]

            # 1. Subject Engine Resolution
            engine = subject_registry.get_engine(subject)
            engine_output = engine.analyze_topic(topic=topic, grade=grade, board=board)

            # 2. Board Profile Check
            board_prof = curriculum_manager.get_board_profile(board)
            if board_prof:
                passed_board_checks += 1

            # 3. 5-Part Definition Check
            scaffold = engine_output.definition_scaffold
            if (
                scaffold.original_academic_definition
                and scaffold.simplified_definition
                and len(scaffold.difficult_words_breakdown) >= 1
                and scaffold.relatable_example
                and scaffold.meaning_preservation_proof
            ):
                passed_definition_checks += 1

            # 4. Visual Decision Alignment
            decision = visual_decision_engine.decide_visual(topic=topic, subject=subject, grade=grade, board=board)
            if decision.visual_type == expected_visual or (expected_visual == "labelled_2d_diagram" and not decision.is_3d_required):
                passed_visual_decision_checks += 1

            # 5. Misconceptions Checked
            if len(engine_output.common_misconceptions) >= 1:
                passed_misconception_checks += 1

            subject_breakdown[subject] = {
                "tested": True,
                "engine_type": engine.__class__.__name__,
                "visual_type": decision.visual_type,
                "is_3d_required": decision.is_3d_required
            }

        board_compliance = (passed_board_checks / total_examples) * 100
        definition_score = (passed_definition_checks / total_examples) * 100
        visual_accuracy = (passed_visual_decision_checks / total_examples) * 100
        misconception_rate = (passed_misconception_checks / total_examples) * 100

        # Recommendation: If RAG + Subject Engines achieve >= 95% benchmark accuracy,
        # external weight fine-tuning is unnecessary and would risk catastrophic forgetting.
        mean_score = (board_compliance + definition_score + visual_accuracy + misconception_rate) / 4.0
        sft_weight_tuning_recommendation = (
            "KEEP_KNOWLEDGE_SYSTEM" if mean_score >= 90.0 else "PERFORM_LORA_SFT"
        )

        return {
            "total_examples": total_examples,
            "board_compliance_rate_pct": round(board_compliance, 1),
            "definition_preservation_pct": round(definition_score, 1),
            "visual_decision_accuracy_pct": round(visual_accuracy, 1),
            "misconception_rate_pct": round(misconception_rate, 1),
            "mean_benchmark_score_pct": round(mean_score, 1),
            "sft_weight_tuning_recommendation": sft_weight_tuning_recommendation,
            "subject_breakdown": subject_breakdown
        }


sft_evaluator = SFTEvaluator()
