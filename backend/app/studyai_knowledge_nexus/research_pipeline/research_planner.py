import logging
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from backend.app.studyai_knowledge_nexus.research_pipeline.question_understanding_service import (
    QuestionUnderstandingResult,
)

logger = logging.getLogger("research_pipeline.research_planner")


class FocusedSearchQuery(BaseModel):
    query_text: str
    purpose: str
    target_category: str  # e.g., 'definition', 'mechanism', 'formula_units', 'evidence', 'visual_diagram'
    target_sources: List[str]


class ResearchPlan(BaseModel):
    topic: str
    subject: str
    grade: int
    curriculum: str
    important_concepts: List[str]
    target_definitions: List[str]
    scientific_or_historical_facts: List[str]
    relevant_processes: List[str]
    formulas_and_units: List[str]
    supporting_evidence_targets: List[str]
    appropriate_educational_sources: List[str]
    relevant_image_requirements: List[str]
    focused_queries: List[FocusedSearchQuery]


class ResearchPlanner:
    """
    Creates focused, purposeful academic research plans targeting exact
    curriculum concepts, definitions, formulas, and visual specifications.
    Never generates random search queries.
    """

    def create_research_plan(
        self,
        understanding: QuestionUnderstandingResult,
    ) -> ResearchPlan:
        topic = understanding.topic
        subtopic = understanding.subtopic
        subject = understanding.subject
        grade = understanding.grade
        curriculum = understanding.curriculum

        # 1. Identify important concepts & targets
        concepts = self._extract_concepts(understanding)
        definitions = self._identify_definitions_needed(understanding)
        facts = self._identify_facts_needed(understanding)
        processes = self._identify_processes_needed(understanding)
        formulas = self._identify_formulas_needed(understanding)
        evidence = [f"{curriculum} Official Syllabus Regulations for Grade {grade} {subject}"]
        sources = [
            f"{curriculum} Board Syllabus Repository",
            "Council for the Indian School Certificate Examinations (CISCE)" if curriculum in ["ICSE", "ISC"] else "NCERT Curriculum Repository",
            "Standard School Textbook Benchmark Publications",
        ]
        image_reqs = self._identify_image_requirements(understanding)

        # 2. Build focused queries with explicit purpose
        focused_queries = []

        # Query 1: Core definition and academic scope
        focused_queries.append(FocusedSearchQuery(
            query_text=f"{curriculum} Class {grade} {subject} {topic} {subtopic} definition syllabus",
            purpose=f"Retrieve authoritative {curriculum} definition and scope limits for {topic}.",
            target_category="definition",
            target_sources=sources,
        ))

        # Query 2: Exact mechanism or stepwise process
        if processes:
            focused_queries.append(FocusedSearchQuery(
                query_text=f"{subject} {subtopic} mechanism process steps Class {grade}",
                purpose=f"Extract verified biological/physical/mathematical sequence of events for {subtopic}.",
                target_category="mechanism",
                target_sources=sources,
            ))

        # Query 3: Formulas & units / dates & evidence
        if formulas:
            focused_queries.append(FocusedSearchQuery(
                query_text=f"{subject} {topic} formulas SI units derivations",
                purpose=f"Validate dimensional consistency, mathematical formulas, and SI units for {topic}.",
                target_category="formula_units",
                target_sources=sources,
            ))
        elif subject.lower() in ["history", "geography"]:
            focused_queries.append(FocusedSearchQuery(
                query_text=f"{subject} {topic} chronological events causes consequences Class {grade}",
                purpose=f"Verify verified historical timeline and geopolitical facts for {topic}.",
                target_category="evidence",
                target_sources=sources,
            ))

        # Query 4: Curricular diagrams and visual representations
        if image_reqs:
            focused_queries.append(FocusedSearchQuery(
                query_text=f"{curriculum} Class {grade} {subject} {topic} labelled diagram visual anatomy",
                purpose=f"Identify standard textbook labels, arrows, and structures required for {topic}.",
                target_category="visual_diagram",
                target_sources=sources,
            ))

        return ResearchPlan(
            topic=topic,
            subject=subject,
            grade=grade,
            curriculum=curriculum,
            important_concepts=concepts,
            target_definitions=definitions,
            scientific_or_historical_facts=facts,
            relevant_processes=processes,
            formulas_and_units=formulas,
            supporting_evidence_targets=evidence,
            appropriate_educational_sources=sources,
            relevant_image_requirements=image_reqs,
            focused_queries=focused_queries,
        )

    def _extract_concepts(self, u: QuestionUnderstandingResult) -> List[str]:
        q_lower = u.original_question.lower()
        if "heart" in q_lower or "chamber" in q_lower or "circulation" in q_lower:
            return [
                "Right Atrium", "Right Ventricle", "Left Atrium", "Left Ventricle",
                "Tricuspid and Bicuspid Valves", "Aorta and Vena Cava", "Pulmonary Circulation",
                "Systemic Circulation", "Interventricular Septum", "Sinoatrial Node"
            ]
        if "moment" in q_lower or "force" in q_lower:
            return ["Moment of Force", "Fulcrum", "Clockwise vs Anticlockwise Moments", "Rotational Equilibrium"]
        if "water" in q_lower:
            return ["Covalent Bonding", "Lone Pair Repulsion", "Bent Geometry", "Electronegativity", "Dipole Moment"]
        if "cone" in q_lower:
            return ["Right Circular Cone", "Base Radius", "Vertical Height", "Slant Height", "Pythagoras Relation"]
        return [u.topic, u.subtopic]

    def _identify_definitions_needed(self, u: QuestionUnderstandingResult) -> List[str]:
        q_lower = u.original_question.lower()
        if "heart" in q_lower:
            return ["Double Circulation", "Cardiac Cycle", "Systole and Diastole", "Pericardium"]
        if "moment" in q_lower:
            return ["Principle of Moments", "Torque", "Couple"]
        return [f"Formal Definition of {u.topic}"]

    def _identify_facts_needed(self, u: QuestionUnderstandingResult) -> List[str]:
        q_lower = u.original_question.lower()
        if "heart" in q_lower:
            return [
                "Left ventricle has thickest muscular walls to pump against systemic vascular resistance.",
                "Valves prevent backflow of blood.",
                "Oxygenated and deoxygenated blood never mix in a healthy human heart due to complete septum.",
            ]
        return [f"Key verified facts for {u.topic}"]

    def _identify_processes_needed(self, u: QuestionUnderstandingResult) -> List[str]:
        q_lower = u.original_question.lower()
        if "heart" in q_lower:
            return [
                "Deoxygenated blood entry via Vena Cava into Right Atrium",
                "Passage through Tricuspid valve into Right Ventricle",
                "Pumping through Pulmonary Artery to Lungs",
                "Return of Oxygenated blood via Pulmonary Veins into Left Atrium",
                "Passage through Bicuspid valve into Left Ventricle",
                "High-pressure ejection through Aorta into Systemic Circulation",
            ]
        return [f"Operational mechanism of {u.topic}"]

    def _identify_formulas_needed(self, u: QuestionUnderstandingResult) -> List[str]:
        q_lower = u.original_question.lower()
        if "moment" in q_lower:
            return ["τ = F × d", "SI Unit: N·m", "Clockwise Moment = Anticlockwise Moment"]
        if "cone" in q_lower:
            return ["V = (1/3)πr²h", "l² = r² + h²", "CSA = πrl", "TSA = πr(l + r)"]
        return []

    def _identify_image_requirements(self, u: QuestionUnderstandingResult) -> List[str]:
        q_lower = u.original_question.lower()
        if "heart" in q_lower:
            return [
                "Anatomical cross-section showing 4 distinct chambers (RA, RV, LA, LV)",
                "Interventricular septum partition",
                "4 valves: Tricuspid, Bicuspid/Mitral, Pulmonary Semilunar, Aortic Semilunar",
                "Great vessels: Superior/Inferior Vena Cava, Pulmonary Artery, Pulmonary Veins, Aorta",
                "Blood flow directional arrows (Blue for deoxygenated, Red for oxygenated)",
            ]
        return [f"Labeled educational diagram illustrating {u.topic}"]


research_planner = ResearchPlanner()
