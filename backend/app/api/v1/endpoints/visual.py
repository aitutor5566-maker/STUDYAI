from fastapi import APIRouter, Query
from ....schemas.contracts import SubtopicPlan, VisualPlanResponse

router = APIRouter()


@router.get("/plan", response_model=VisualPlanResponse)
async def get_visual_plan(
    topic: str = Query(default="Human Heart", max_length=200),
    grade_level: str = Query(default="Grade 10", max_length=50)
):
    """Returns the curriculum visual plan and subtopic breakdown."""
    norm = topic.lower()
    if "heart" in norm:
        subtopics = [
            SubtopicPlan(subtopic_id="sub_1", title="Cardiac Anatomy & Four Chambers", learning_objective="Identify 4 chambers and systemic flow", has_3d_support=True),
            SubtopicPlan(subtopic_id="sub_2", title="Systemic vs. Pulmonary Circuits", learning_objective="Understand double circulation loops", has_3d_support=True),
            SubtopicPlan(subtopic_id="sub_3", title="Valves & Backflow Prevention", learning_objective="Examine tricuspid and mitral check valves", has_3d_support=True),
            SubtopicPlan(subtopic_id="sub_4", title="SA Node Pacemaker Conduction", learning_objective="Study cardiac electrical depolarization", has_3d_support=True),
        ]
        prereqs = ["Cellular Respiration", "Circulatory System Overview", "Pressure Gradients"]
        subject = "Biology & Physiology"
    elif "dna" in norm:
        subtopics = [
            SubtopicPlan(subtopic_id="sub_1", title="Nucleotide Sugar-Phosphate Rails", learning_objective="Examine 5' to 3' backbone structure", has_3d_support=True),
            SubtopicPlan(subtopic_id="sub_2", title="Watson-Crick Base Pairing", learning_objective="Analyze A=T and G≡C hydrogen bonding", has_3d_support=True),
            SubtopicPlan(subtopic_id="sub_3", title="Antiparallel Double Helix", learning_objective="Understand antiparallel spatial geometry", has_3d_support=True),
        ]
        prereqs = ["Cell Biology", "Organic Macromolecules"]
        subject = "Molecular Genetics"
    else:
        subtopics = [
            SubtopicPlan(subtopic_id="sub_1", title=f"{topic} Fundamentals", learning_objective="Core theoretical definitions", has_3d_support=False),
            SubtopicPlan(subtopic_id="sub_2", title=f"{topic} Key Mechanisms", learning_objective="Step-by-step physical principles", has_3d_support=False),
            SubtopicPlan(subtopic_id="sub_3", title=f"{topic} Applications", learning_objective="Real-world practical examples", has_3d_support=False),
        ]
        prereqs = ["Foundational Science", "Measurement Units"]
        subject = "General Science"

    return VisualPlanResponse(
        topic=topic,
        grade_level=grade_level,
        subject=subject,
        prerequisites=prereqs,
        subtopics=subtopics
    )
