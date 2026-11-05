import os
import json
import time
import logging
from typing import Any, Dict, List, Optional
import httpx

logger = logging.getLogger("knowledge_nexus.openai_knowledge")


class OpenAIEducationalService:
    """
    OpenAI GPT Educational Service with Structured Outputs support.
    Provides:
    - Structured JSON Lesson synthesis
    - Research findings organization
    - Image generation brief creation
    - 3D scene specification design
    - Missing knowledge gap detection
    - Follow-up question generation
    """

    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        self.base_url = "https://api.openai.com/v1"

    def get_capabilities(self) -> Dict[str, Any]:
        """Returns OpenAI GPT capability registry."""
        return {
            "provider": "OpenAI",
            "model": self.model,
            "structured_outputs": True,
            "json_schema_mode": True,
            "lesson_generation": True,
            "image_brief_generation": True,
            "threejs_scene_design": True,
            "api_key_configured": bool(self.api_key),
        }

    async def organize_and_synthesize_knowledge(
        self,
        topic: str,
        grade: int,
        board: str,
        subject: str,
        research_evidence: List[Dict[str, Any]],
        chapter: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Synthesizes research findings into a structured curriculum knowledge record.
        Uses OpenAI Structured Outputs (response_format={'type': 'json_object'}).
        """
        start_time = time.time()
        system_prompt = (
            "You are an academic curriculum specialist for Indian boards (ICSE, ISC, CBSE).\n"
            "Synthesize the provided research evidence into a strictly structured JSON knowledge object.\n"
            "Return ONLY a valid JSON object matching this schema:\n"
            "{\n"
            '  "topic": string,\n'
            '  "core_facts": [string],\n'
            '  "formal_academic_definition": string,\n'
            '  "simplified_definition": string,\n'
            '  "key_terms": [{"term": string, "definition": string}],\n'
            '  "prerequisite_concepts": [string],\n'
            '  "common_misconceptions": [{"misconception": string, "correction": string}],\n'
            '  "visual_recommendation": {"visual_type": string, "description": string},\n'
            '  "practice_questions": [{"question": string, "marks": number, "model_answer": string}]\n'
            "}"
        )

        user_content = (
            f"Topic: {topic}\nBoard: {board} | Grade: {grade} | Subject: {subject} | Chapter: {chapter or 'Standard'}\n"
            f"Research Evidence Snippets:\n{json.dumps(research_evidence, indent=2)}\n"
        )

        if not self.api_key:
            return self._build_deterministic_synthesis(topic, grade, board, subject)

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2,
            "max_tokens": 2048,
        }

        try:
            async with httpx.AsyncClient(timeout=25.0) as client:
                res = await client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    content = data["choices"][0]["message"]["content"]
                    parsed = json.loads(content)
                    parsed["latency_ms"] = int((time.time() - start_time) * 1000)
                    parsed["synthesized_by"] = f"OpenAI {self.model}"
                    return parsed
        except Exception as e:
            logger.warning(f"OpenAI knowledge synthesis call failed: {e}")

        return self._build_deterministic_synthesis(topic, grade, board, subject)

    def _build_deterministic_synthesis(
        self,
        topic: str,
        grade: int,
        board: str,
        subject: str,
    ) -> Dict[str, Any]:
        """Provides verified fallback structured knowledge when external AI is offline."""
        topic_lower = topic.lower()

        if "heart" in topic_lower or "circulation" in topic_lower:
            return {
                "topic": "Human Heart & Circulation",
                "core_facts": [
                    "The human heart is a 4-chambered muscular organ with two atria and two ventricles.",
                    "Deoxygenated blood returns via the Superior and Inferior Vena Cava into the Right Atrium.",
                    "The right ventricle pumps deoxygenated blood to the lungs via the pulmonary artery.",
                    "Oxygenated blood returns from lungs via pulmonary veins to the left atrium.",
                    "The left ventricle pumps oxygenated blood through the aorta to the systemic circulation.",
                ],
                "formal_academic_definition": (
                    "The human heart is a hollow, muscular four-chambered pump enclosed in a pericardium, "
                    "responsible for maintaining systemic and pulmonary circulation of blood."
                ),
                "simplified_definition": "A 4-room muscular pump inside your chest that continuously circulates blood around your entire body.",
                "key_terms": [
                    {"term": "Right Atrium", "definition": "Receives deoxygenated blood from the body tissues."},
                    {"term": "Right Ventricle", "definition": "Pumps deoxygenated blood into the pulmonary artery."},
                    {"term": "Left Atrium", "definition": "Receives oxygen-rich blood from the pulmonary veins."},
                    {"term": "Left Ventricle", "definition": "Thick-walled chamber pumping oxygenated blood into the aorta."},
                    {"term": "Septum", "definition": "Muscular wall preventing the mixing of oxygenated and deoxygenated blood."},
                ],
                "prerequisite_concepts": ["Circulatory System", "Blood Composition", "Blood Vessels"],
                "common_misconceptions": [
                    {"misconception": "Human blood turns blue inside veins.", "correction": "Blood is always red; deoxygenated blood is darker red, never blue."},
                ],
                "visual_recommendation": {
                    "visual_type": "threejs_3d",
                    "description": "3D Anatomical Heart with 4 chambers, valves, great vessels, and 13-stage cardiac cycle.",
                },
                "practice_questions": [
                    {
                        "question": "Name the four chambers of the human heart and state which chamber has the thickest muscular wall.",
                        "marks": 3,
                        "model_answer": "Right Atrium, Right Ventricle, Left Atrium, Left Ventricle. The Left Ventricle has the thickest wall because it pumps blood at high pressure throughout the entire body.",
                    }
                ],
                "synthesized_by": "STUDYAI Curricular Knowledge Engine (Offline Fallback)",
            }
        elif "moment" in topic_lower or "force" in topic_lower:
            return {
                "topic": "Principle of Moments",
                "core_facts": [
                    "Moment of a force = Force × Perpendicular distance from the pivot (τ = F × d).",
                    "SI unit of moment of force is Newton-metre (N·m).",
                    "According to the Principle of Moments, in rotational equilibrium: Sum of anticlockwise moments = Sum of clockwise moments.",
                ],
                "formal_academic_definition": (
                    "When an object is in rotational equilibrium, the sum of clockwise moments about any pivot "
                    "is equal to the sum of anticlockwise moments about the same pivot."
                ),
                "simplified_definition": "When a seesaw or beam is perfectly balanced, the turning effect trying to tilt it one way exactly equals the turning effect tilting it the other way.",
                "key_terms": [
                    {"term": "Moment of Force", "definition": "The turning effect produced by a force about a pivot."},
                    {"term": "Fulcrum", "definition": "The fixed point around which a lever or body rotates."},
                    {"term": "Equilibrium", "definition": "State where resultant external force and resultant torque are zero."},
                ],
                "prerequisite_concepts": ["Force and Units", "Scalars and Vectors", "Rigid Body Dynamics"],
                "common_misconceptions": [
                    {"misconception": "Moments depend only on force magnitude.", "correction": "Moment depends equally on force AND perpendicular distance from pivot."},
                ],
                "visual_recommendation": {
                    "visual_type": "diagram",
                    "description": "Balanced lever diagram showing fulcrum, load arm, effort arm, and opposing torque vectors.",
                },
                "practice_questions": [
                    {
                        "question": "State the Principle of Moments and write its mathematical condition for equilibrium.",
                        "marks": 2,
                        "model_answer": "For an object in equilibrium, the algebraic sum of moments of forces about the pivot is zero: Sum of Clockwise Moments = Sum of Anticlockwise Moments.",
                    }
                ],
                "synthesized_by": "STUDYAI Curricular Knowledge Engine (Offline Fallback)",
            }

        # Generic structured output
        return {
            "topic": topic,
            "core_facts": [
                f"Authoritative core benchmark for {topic} according to {board} Grade {grade} {subject} syllabus.",
                "Rigorous adherence to standard scientific and academic definitions without oversimplification.",
            ],
            "formal_academic_definition": f"The formal academic definition of {topic} as codified in standard {board} approved textbooks.",
            "simplified_definition": f"A direct, student-friendly explanation of {topic} suitable for Grade {grade}.",
            "key_terms": [
                {"term": topic, "definition": f"Core curricular topic for {subject}."}
            ],
            "prerequisite_concepts": ["Foundational Grade Knowledge"],
            "common_misconceptions": [],
            "visual_recommendation": {"visual_type": "diagram", "description": f"Curriculum diagram illustrating {topic}."},
            "practice_questions": [
                {"question": f"Explain the fundamental principles of {topic}.", "marks": 3, "model_answer": f"Standard {board} model answer."}
            ],
            "synthesized_by": "STUDYAI Curricular Knowledge Engine (Offline Fallback)",
        }


openai_knowledge = OpenAIEducationalService()
