import pytest
from backend.app.studyai_knowledge_nexus.core.grade_controller import grade_controller
from backend.app.studyai_knowledge_nexus.core.adaptation_engine import adaptation_engine
from backend.app.studyai_knowledge_nexus.core.adaptive_memory import adaptive_memory
from backend.app.studyai_knowledge_nexus.core.teaching_orchestrator import teaching_orchestrator
from backend.app.studyai_knowledge_nexus.research.external_research_engine import external_research
from backend.app.studyai_knowledge_nexus.curriculum.icse_database import icse_db, ICSE_CURRICULUM_TREE


def test_grade_curriculum_coverage_grades_1_to_10():
    """Verifies that ICSE Curriculum tree has entries for all Grades 1 through 10."""
    for grade in range(1, 11):
        grade_data = ICSE_CURRICULUM_TREE.get(grade)
        assert grade_data is not None, f"Grade {grade} must exist in ICSE_CURRICULUM_TREE"
        assert len(grade_data.keys()) >= 1, f"Grade {grade} must have at least one subject defined"


def test_grade_depth_photosynthesis_grade_6_vs_8_vs_10():
    """
    CRITICAL ACCEPTANCE TEST:
    Verify that asking about Photosynthesis produces distinct, grade-appropriate
    content boundaries for Grade 6, Grade 8, and Grade 10:
    - Grade 6: Basic food-making, word equation, NO photolysis/Calvin cycle.
    - Grade 8: Chloroplasts, stomata, balanced equation, rate factors.
    - Grade 10: Full biochemical mechanism, photolysis of water, Calvin cycle, limiting factors.
    """
    # 1. Grade 6
    g6_depth = grade_controller.resolve_topic_curriculum_depth("Photosynthesis", grade=6)
    assert g6_depth["grade"] == 6
    assert "photolysis" in [c.lower() for c in g6_depth["prohibited_concepts"]]
    assert "calvin cycle" in [c.lower() for c in g6_depth["prohibited_concepts"]]
    assert "Carbon dioxide + Water" in g6_depth["equation"] # Word equation
    assert g6_depth["max_sentence_length"] <= 18

    # 2. Grade 8
    g8_depth = grade_controller.resolve_topic_curriculum_depth("Photosynthesis", grade=8)
    assert g8_depth["grade"] == 8
    assert any("chloroplast" in c.lower() for c in g8_depth["required_concepts"])
    assert "6CO₂ + 6H₂O" in g8_depth["equation"] # Simple balanced equation
    assert g8_depth["max_sentence_length"] == 22

    # 3. Grade 10
    g10_depth = grade_controller.resolve_topic_curriculum_depth("Photosynthesis", grade=10)
    assert g10_depth["grade"] == 10
    req_10 = " ".join(g10_depth["required_concepts"]).lower()
    assert "photolysis of water" in req_10
    assert "calvin cycle" in req_10
    assert "blackman's principle" in req_10
    assert len(g10_depth["prohibited_concepts"]) == 0 # High school ICSE board requirements fully retained
    assert "6CO₂ + 12H₂O" in g10_depth["equation"] # Full biochemical equation with 12H2O


def test_spelling_support_adapter():
    """Verifies that spelling adaptation identifies difficult words, syllabifies them, and adds phonetic hints."""
    res = adaptation_engine.generate_adaptations(
        topic="Photosynthesis and Chlorophyll",
        subject="Biology",
        grade=6,
        difficulties=["spelling"],
        explanation_text="Plants use chlorophyll in photosynthesis to convert sunlight into energy.",
    )
    spelling_card = res["spelling_card"]
    assert spelling_card is not None
    assert len(spelling_card["words"]) >= 2

    # Check syllabification of photosynthesis
    photo_word = next(w for w in spelling_card["words"] if w["word"] == "Photosynthesis")
    assert photo_word["parts"] == "pho-to-syn-the-sis"
    assert "foh-toh-SIN-thuh-sis" in photo_word["pronounce"]
    assert "gentle_note" in spelling_card


def test_reading_support_adapter():
    """Verifies reading support imposes max sentence limit and provides comprehension check."""
    res = adaptation_engine.generate_adaptations(
        topic="Refraction of Light",
        subject="Physics",
        grade=7,
        difficulties=["reading"],
    )
    assert res["reading_support"] is not None
    assert "<18 words" in res["reading_support"]["reading_rule"] or "18 words" in res["reading_support"]["reading_rule"]
    assert "comprehension_checkpoint" in res["reading_support"]


def test_writing_support_adapter():
    """Verifies writing support generates structured ICSE answer frameworks and model templates."""
    res = adaptation_engine.generate_adaptations(
        topic="The First War of Independence 1857",
        subject="History & Civics",
        grade=8,
        difficulties=["writing_answers"],
    )
    writing = res["writing_scaffold"]
    assert writing is not None
    assert len(writing["structure_steps"]) == 4
    assert "model_answer_starter" in writing
    assert "scoring_keywords" in writing


def test_mathematics_support_adapter():
    """Verifies math support mandates no skipped steps and verification checks."""
    res = adaptation_engine.generate_adaptations(
        topic="Quadratic Equations",
        subject="Mathematics",
        grade=9,
        difficulties=["mathematical_calculations"],
    )
    math_scaff = res["math_scaffolding"]
    assert math_scaff is not None
    assert "substitute it back" in math_scaff["verification_prompt"]
    assert any("MATH ADAPTATION" in directive for directive in res["system_instruction_additions"])


def test_multiple_simultaneous_learning_difficulties():
    """
    ACCEPTANCE TEST D:
    A Grade 7 student experiencing Spelling, Reading, and Memory difficulties
    must receive all 3 adaptations harmoniously.
    """
    res = adaptation_engine.generate_adaptations(
        topic="Photosynthesis and Starch",
        subject="Biology",
        grade=7,
        difficulties=["spelling", "reading", "remembering_information"],
    )
    assert res["spelling_card"] is not None, "Spelling card must be generated"
    assert res["reading_support"] is not None, "Reading support must be generated"
    assert res["memory_aids"] is not None, "Memory aids must be generated"
    assert len(res["applied_difficulties"]) == 3


def test_adaptive_learning_memory_tracking_and_updates():
    """Verifies that student interactions update practice metrics and strategy adjustments."""
    user_id = "test_student_adaptive_01"
    
    # 1. Initial profile
    prof = adaptive_memory.get_or_create_profile(user_id, grade=8)
    assert prof["grade"] == 8
    assert prof["practice_metrics"]["total_questions_attempted"] == 0

    # 2. Record a mistake
    adaptive_memory.record_interaction(
        user_id=user_id,
        topic="Quadratic Equations",
        subject="Mathematics",
        grade=8,
        question_answered=True,
        was_correct=False,
        mistake_type="calculation",
    )
    updated = adaptive_memory.get_or_create_profile(user_id)
    assert updated["practice_metrics"]["total_questions_attempted"] == 1
    assert "Quadratic Equations" in updated["topics_needing_revision"]
    assert updated["strategy_adjustments"]["scaffolding_level"] == "extra_scaffolded"

    # 3. Update preferences
    pref_update = adaptive_memory.update_student_preferences(
        user_id=user_id,
        difficulties=["spelling", "mathematical_calculations"],
        explanation_style="concise",
    )
    assert "spelling" in pref_update["difficulties"]
    assert pref_update["explanation_style"] == "concise"


def test_grade_aware_external_research_filtering():
    """
    Verifies that external research results containing college-level terminology
    are filtered out of core Grade 6 explanations and routed to optional advanced reading.
    """
    mock_snippets = [
        {"title": "Basic Photosynthesis for Middle School", "snippet": "Green leaves use chlorophyll and sunlight to make glucose and release oxygen.", "url": "https://example.com/1"},
        {"title": "Advanced Photolysis and Calvin Cycle Kinetics", "snippet": "Detailed photolysis and Calvin cycle Rubisco enzymatic reactions in C3 plants.", "url": "https://example.com/2"}
    ]
    filtered = external_research.filter_and_adapt_research_for_grade(
        snippets=mock_snippets,
        grade=6,
        prohibited_concepts=["photolysis", "calvin cycle", "rubisco"],
    )
    assert filtered["filter_applied"] is True
    assert len(filtered["core_adapted_snippets"]) == 1
    assert "Basic Photosynthesis" in filtered["core_adapted_snippets"][0]["title"]
    assert len(filtered["advanced_optional_material"]) == 1
    assert "Advanced Photolysis" in filtered["advanced_optional_material"][0]["title"]
