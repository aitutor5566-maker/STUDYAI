from typing import Any, Dict, List, Optional


class GradeController:
    """
    Grade-Wise Content Depth Controller supporting ICSE Grades 1–10.
    Enforces distinct pedagogical profiles controlling:
    1. Vocabulary difficulty
    2. Sentence complexity
    3. Conceptual depth
    4. Assumed prior knowledge
    5. Technical terminology
    6. Mathematical complexity
    7. Scientific mechanisms
    8. Historical detail
    9. Number of explanation steps
    10. Diagram complexity
    11. Examples and analogies
    12. Practice question difficulty
    """

    GRADE_PROFILES: Dict[int, Dict[str, Any]] = {
        1: {
            "stage": "Foundational Early Primary",
            "max_sentence_length": 8,
            "vocabulary_level": "simple_phonetic",
            "conceptual_depth": "sensory_concrete",
            "assumed_prior_knowledge": ["basic objects", "colors", "counting 1-20", "family", "pets"],
            "allow_formulas": False,
            "math_complexity": "single_digit_arithmetic",
            "explanation_steps": 2,
            "diagram_type": "simple_colorful_icon",
            "analogy_domain": "toys_play_animals",
            "question_type": "picture_choice_or_yes_no",
        },
        2: {
            "stage": "Early Primary",
            "max_sentence_length": 10,
            "vocabulary_level": "basic_phonetic",
            "conceptual_depth": "observable_immediate_environment",
            "assumed_prior_knowledge": ["seasons", "plants need water", "addition", "subtraction"],
            "allow_formulas": False,
            "math_complexity": "double_digit_addition",
            "explanation_steps": 2,
            "diagram_type": "labeled_illustration",
            "analogy_domain": "daily_routines_food_play",
            "question_type": "simple_word_choice",
        },
        3: {
            "stage": "Upper Primary",
            "max_sentence_length": 12,
            "vocabulary_level": "elementary_academic",
            "conceptual_depth": "simple_cause_and_effect",
            "assumed_prior_knowledge": ["living vs non-living", "basic plant parts", "multiplication tables 1-10"],
            "allow_formulas": False,
            "math_complexity": "multiplication_and_division",
            "explanation_steps": 3,
            "diagram_type": "parts_of_a_whole_diagram",
            "analogy_domain": "kitchen_cooking_schoolyard",
            "question_type": "fill_in_the_blank",
        },
        4: {
            "stage": "Upper Primary",
            "max_sentence_length": 14,
            "vocabulary_level": "developing_academic",
            "conceptual_depth": "classification_and_systems",
            "assumed_prior_knowledge": ["organ systems overview", "water cycle", "states of matter", "fractions intro"],
            "allow_formulas": False,
            "math_complexity": "simple_fractions_and_decimals",
            "explanation_steps": 3,
            "diagram_type": "flow_diagram_and_cycles",
            "analogy_domain": "machines_nature_neighborhood",
            "question_type": "short_answer_identification",
        },
        5: {
            "stage": "Middle Primary Transition",
            "max_sentence_length": 16,
            "vocabulary_level": "intermediate_elementary",
            "conceptual_depth": "functional_interrelationships",
            "assumed_prior_knowledge": ["skeletal system", "ecosystems", "friction basics", "geometry shapes"],
            "allow_formulas": False,
            "math_complexity": "fractions_decimals_percentages",
            "explanation_steps": 4,
            "diagram_type": "cross_section_with_callouts",
            "analogy_domain": "transport_sports_weather",
            "question_type": "matching_and_short_reasoning",
        },
        6: {
            "stage": "Lower Middle School",
            "max_sentence_length": 18,
            "vocabulary_level": "introductory_scientific",
            "conceptual_depth": "basic_qualitative_mechanisms",
            "assumed_prior_knowledge": ["photosynthesis basic idea", "cells as building blocks", "simple machines"],
            "allow_formulas": True,
            "chemical_equations": "word_equations_only",
            "math_complexity": "basic_linear_equations_ratios",
            "explanation_steps": 4,
            "diagram_type": "labeled_2d_schematic",
            "analogy_domain": "home_appliances_gardening_vehicles",
            "question_type": "definition_and_2_point_explanation",
            "topic_adaptations": {
                "photosynthesis": {
                    "required_concepts": ["sunlight", "chlorophyll", "water from roots", "carbon dioxide from air", "glucose/starch", "oxygen release", "stomata as tiny pores"],
                    "prohibited_concepts": ["photolysis", "calvin cycle", "nadph", "atp synthase", "thylakoid", "hill reaction"],
                    "equation": "Carbon dioxide + Water ⎯(Sunlight / Chlorophyll)⎯→ Glucose + Oxygen",
                    "depth_note": "Explain as food-making process in green leaves using natural sunlight.",
                }
            }
        },
        7: {
            "stage": "Middle School",
            "max_sentence_length": 20,
            "vocabulary_level": "intermediate_scientific",
            "conceptual_depth": "structural_and_process_chains",
            "assumed_prior_knowledge": ["plant cell structure", "elements & compounds", "heat & temperature", "algebra intro"],
            "allow_formulas": True,
            "chemical_equations": "introductory_chemical_symbols",
            "math_complexity": "algebraic_expressions_exponents",
            "explanation_steps": 5,
            "diagram_type": "process_flowchart_with_labels",
            "analogy_domain": "factory_production_circuits_ecosystems",
            "question_type": "differentiate_between_and_short_working",
            "topic_adaptations": {
                "photosynthesis": {
                    "required_concepts": ["chloroplast organelle", "guard cells and stomatal opening", "raw materials entry", "products and byproducts", "starch iodine test"],
                    "prohibited_concepts": ["calvin cycle", "light-dependent phosphorylation", "nadph", "rubisco"],
                    "equation": "CO₂ + H₂O ⎯(Sunlight / Chlorophyll)⎯→ C₆H₁₂O₆ + O₂",
                    "depth_note": "Focus on the role of chloroplasts and the simple chemical transformation.",
                }
            }
        },
        8: {
            "stage": "Upper Middle School Transition",
            "max_sentence_length": 22,
            "vocabulary_level": "pre_certificate_academic",
            "conceptual_depth": "quantitative_relationships_and_organelles",
            "assumed_prior_knowledge": ["atomic structure basics", "laws of reflection", "cell organelles", "linear simultaneous equations"],
            "allow_formulas": True,
            "chemical_equations": "simple_balanced_equations",
            "math_complexity": "factorisation_simultaneous_equations",
            "explanation_steps": 5,
            "diagram_type": "anatomical_section_and_graphical_plots",
            "analogy_domain": "chemical_synthesis_electronic_devices",
            "question_type": "reason_based_questions_and_derivations",
            "topic_adaptations": {
                "photosynthesis": {
                    "required_concepts": ["chloroplast anatomy (grana & stroma overview)", "internal leaf structure (mesophyll)", "factors affecting rate (light intensity, temperature, CO2)", "balanced equation"],
                    "prohibited_concepts": ["detailed electron transport chain", "photolysis electron mechanics", "carbon fixation enzymatic steps"],
                    "equation": "6CO₂ + 6H₂O ⎯(Sunlight / Chlorophyll)⎯→ C₆H₁₂O₆ + 6O₂",
                    "depth_note": "Introduce chloroplast structure, external limiting factors, and the balanced molecular equation.",
                }
            }
        },
        9: {
            "stage": "ICSE Foundation (Class IX)",
            "max_sentence_length": 24,
            "vocabulary_level": "formal_icse_board_standard",
            "conceptual_depth": "rigorous_analytical_and_experimental",
            "assumed_prior_knowledge": ["chemical bonding", "newton laws of motion", "cell division basics", "rational numbers"],
            "allow_formulas": True,
            "chemical_equations": "full_balanced_with_state_symbols",
            "math_complexity": "compound_interest_surds_logarithms_geometry_proofs",
            "explanation_steps": 6,
            "diagram_type": "experimental_apparatus_and_ray_diagrams",
            "analogy_domain": "laboratory_protocols_industrial_processes",
            "question_type": "icse_paper_style_structured_questions",
            "topic_adaptations": {
                "photosynthesis": {
                    "required_concepts": ["destarching experiments", "ganong's screen experiment", "moll's half leaf experiment for co2", "chlorophyll absorption spectra intro", "balanced equation"],
                    "prohibited_concepts": ["p680/p700 photosystems detailed biophysics"],
                    "equation": "6CO₂ + 12H₂O ⎯(Sunlight / Chlorophyll)⎯→ C₆H₁₂O₆ + 6H₂O + 6O₂↑",
                    "depth_note": "Emphasize experimental validation, controlled setups, and observations.",
                }
            }
        },
        10: {
            "stage": "ICSE Board Examination (Class X)",
            "max_sentence_length": 28,
            "vocabulary_level": "rigorous_icse_board_certification",
            "conceptual_depth": "comprehensive_biochemical_and_theoretical",
            "assumed_prior_knowledge": ["full middle school science", "coordinate geometry", "periodic table trends", "stoichiometry"],
            "allow_formulas": True,
            "chemical_equations": "stoichiometrically_balanced_with_enthalpy_and_conditions",
            "math_complexity": "quadratic_equations_matrices_trigonometric_identities_mensuration",
            "explanation_steps": 7,
            "diagram_type": "detailed_microscopic_and_biochemical_pathways",
            "analogy_domain": "exact_icse_examiner_marking_rubrics",
            "question_type": "3_tier_icse_board_examination_questions",
            "topic_adaptations": {
                "photosynthesis": {
                    "required_concepts": [
                        "chloroplast ultrastructure (thylakoids, grana, stroma)",
                        "light reaction / photochemical phase (photolysis of water: 2H2O -> 4H+ + 4e- + O2)",
                        "photophosphorylation (ADP + Pi -> ATP)",
                        "reduction of NADP+ to NADPH",
                        "dark reaction / biosynthetic phase / calvin cycle in stroma",
                        "carbon fixation to phosphoglyceric acid and glucose",
                        "experiments demonstrating light, CO2, and chlorophyll requirement",
                        "blackman's principle of limiting factors",
                        "internal and external limiting factors (transpiration link, stomatal regulation)"
                    ],
                    "prohibited_concepts": [],
                    "equation": "6CO₂ + 12H₂O ⎯(Sunlight / Chlorophyll)⎯→ C₆H₁₂O₆ + 6H₂O + 6O₂↑",
                    "depth_note": "Complete biochemical mechanism covering photochemical and biosynthetic phases, exact experiments, and examiner traps.",
                }
            }
        }
    }

    def get_grade_profile(self, grade: int) -> Dict[str, Any]:
        """Returns the complete depth and pedagogical specification for the grade."""
        clamped_grade = max(1, min(10, grade))
        return self.GRADE_PROFILES.get(clamped_grade, self.GRADE_PROFILES[10])

    def resolve_topic_curriculum_depth(self, topic: str, grade: int) -> Dict[str, Any]:
        """
        Resolves whether a specific topic has tailored grade-level boundaries
        (e.g., Photosynthesis across Grades 6, 8, 10).
        """
        profile = self.get_grade_profile(grade)
        topic_lower = topic.lower()

        for t_key, t_data in profile.get("topic_adaptations", {}).items():
            if t_key in topic_lower or topic_lower in t_key:
                return {
                    "grade": grade,
                    "topic": topic,
                    "has_custom_grade_depth": True,
                    "required_concepts": t_data.get("required_concepts", []),
                    "prohibited_concepts": t_data.get("prohibited_concepts", []),
                    "equation": t_data.get("equation", ""),
                    "depth_note": t_data.get("depth_note", ""),
                    "vocabulary_level": profile["vocabulary_level"],
                    "max_sentence_length": profile["max_sentence_length"],
                    "explanation_steps": profile["explanation_steps"]
                }

        # Generic grade-adaptive fallback
        return {
            "grade": grade,
            "topic": topic,
            "has_custom_grade_depth": False,
            "required_concepts": [f"Standard ICSE Grade {grade} Curriculum Objectives"],
            "prohibited_concepts": [f"Unnecessary Grade {grade + 2}+ Advanced Specialization"] if grade < 9 else [],
            "equation": "" if grade < 6 else "Standard ICSE Formula",
            "depth_note": f"Explain strictly according to ICSE Grade {grade} syllabus.",
            "vocabulary_level": profile["vocabulary_level"],
            "max_sentence_length": profile["max_sentence_length"],
            "explanation_steps": profile["explanation_steps"]
        }


grade_controller = GradeController()
