import datetime
from typing import Any, Dict, List, Optional
from ..security.password import hash_password

class DatabaseState:
    def __init__(self):
        self.reset()

    def reset(self):
        # 1. Tenants
        self.tenants: Dict[str, Dict[str, Any]] = {
            "a0000000-0000-0000-0000-000000000001": {
                "id": "a0000000-0000-0000-0000-000000000001",
                "name": "National Public School Bangalore",
                "subdomain": "nps-bengaluru",
                "board": "CBSE",
                "is_active": True,
                "contact_email": "principal@nps-bengaluru.edu.in",
            }
        }

        # 2. Users
        self.users: Dict[str, Dict[str, Any]] = {
            # Student: Vishwak Sai
            "usr_student_001": {
                "id": "usr_student_001",
                "tenant_id": "a0000000-0000-0000-0000-000000000001",
                "email": "vishwak@studyai.internal",
                "password_hash": hash_password("StudentPass123!"),
                "full_name": "Vishwak Sai",
                "role": "student",
                "phone": "+91 98765 43210",
                "is_active": True,
                "is_email_verified": True,
            },
            # Second Student: Bob
            "usr_student_002": {
                "id": "usr_student_002",
                "tenant_id": "a0000000-0000-0000-0000-000000000001",
                "email": "bob@studyai.internal",
                "password_hash": hash_password("StudentPass123!"),
                "full_name": "Bob Vance",
                "role": "student",
                "phone": "+91 98765 43211",
                "is_active": True,
                "is_email_verified": True,
            },
            # Parent: Rajesh (Vishwak's parent)
            "usr_parent_001": {
                "id": "usr_parent_001",
                "tenant_id": "a0000000-0000-0000-0000-000000000001",
                "email": "rajesh@studyai.internal",
                "password_hash": hash_password("ParentPass123!"),
                "full_name": "Rajesh Sai",
                "role": "parent",
                "phone": "+91 98765 00001",
                "is_active": True,
                "is_email_verified": True,
            },
            # Admin: School Admin
            "usr_admin_001": {
                "id": "usr_admin_001",
                "tenant_id": "a0000000-0000-0000-0000-000000000001",
                "email": "admin@nps-bengaluru.edu.in",
                "password_hash": hash_password("AdminPass123!"),
                "full_name": "Dr. Ananya Sharma",
                "role": "admin",
                "phone": "+91 98765 00002",
                "is_active": True,
                "is_email_verified": True,
            },
            # Accountant: School Finance
            "usr_accountant_001": {
                "id": "usr_accountant_001",
                "tenant_id": "a0000000-0000-0000-0000-000000000001",
                "email": "finance@nps-bengaluru.edu.in",
                "password_hash": hash_password("FinancePass123!"),
                "full_name": "Suresh Patel",
                "role": "accountant",
                "phone": "+91 98765 00003",
                "is_active": True,
                "is_email_verified": True,
            },
            # Super Admin: Global Owner
            "usr_superadmin_001": {
                "id": "usr_superadmin_001",
                "tenant_id": "a0000000-0000-0000-0000-000000000001",
                "email": "superadmin@studyai.com",
                "password_hash": hash_password("SuperAdminSecretPass2026!"),
                "full_name": "Global Governance Admin",
                "role": "superadmin",
                "phone": "+1 555 019 9888",
                "is_active": True,
                "is_email_verified": True,
            }
        }

        # 3. Student Profiles
        self.student_profiles: Dict[str, Dict[str, Any]] = {
            "usr_student_001": {
                "user_id": "usr_student_001",
                "grade": "Grade 10",
                "board": "CBSE",
                "school_name": "National Public School Bangalore",
                "enrollment_number": "NPS-2026-X-442",
                "streak_days": 14,
                "total_points": 1450,
                "preferred_learning_style": "visual",
                "target_examinations": ["CBSE Class 10 Board Exam", "Science Olympiad"],
            },
            "usr_student_002": {
                "user_id": "usr_student_002",
                "grade": "Grade 10",
                "board": "CBSE",
                "school_name": "National Public School Bangalore",
                "enrollment_number": "NPS-2026-X-443",
                "streak_days": 2,
                "total_points": 150,
                "preferred_learning_style": "auditory",
                "target_examinations": ["CBSE Class 10 Board Exam"],
            }
        }

        # 4. Parent Profiles & Verified Link
        self.parent_profiles: Dict[str, Dict[str, Any]] = {
            "usr_parent_001": {
                "user_id": "usr_parent_001",
                "emergency_contact": "+91 98765 00001",
                "occupation": "Software Architect",
                "preferred_language": "English",
                "notification_channel": "email"
            }
        }

        # Parent-Child Relationships
        # Rajesh is verified parent of Vishwak, but allow_chat_view is FALSE by default!
        self.parent_child_relationships: Dict[str, Dict[str, Any]] = {
            "link_p001_s001": {
                "id": "link_p001_s001",
                "parent_id": "usr_parent_001",
                "child_id": "usr_student_001",
                "status": "verified",
                "verification_code": "VISHWAK-2026",
                "allow_chat_view": False, # Strict privacy
                "allow_exam_view": True,
                "allow_progress_view": True,
            }
        }

        # 5. Curriculum: Subjects, Topics, Subtopics, Lessons
        self.academic_levels = [
            {"id": "lvl_g10", "name": "Grade 10", "code": "GRADE_10", "order_index": 10}
        ]

        self.subjects = [
            {"id": "sub_sci", "academic_level_id": "lvl_g10", "name": "Science", "code": "SCIENCE", "color_hex": "#10B981"},
            {"id": "sub_math", "academic_level_id": "lvl_g10", "name": "Mathematics", "code": "MATH", "color_hex": "#3B82F6"}
        ]

        self.topics = [
            {"id": "top_photo", "subject_id": "sub_sci", "name": "Photosynthesis", "slug": "photosynthesis", "sequence_order": 1},
            {"id": "top_heart", "subject_id": "sub_sci", "name": "Human Heart", "slug": "human-heart", "sequence_order": 2},
            {"id": "top_dna", "subject_id": "sub_sci", "name": "DNA Genetics", "slug": "dna-genetics", "sequence_order": 3}
        ]

        self.subtopics = [
            {"id": "subt_light", "topic_id": "top_photo", "name": "Light-Dependent Reactions", "slug": "light-reactions", "estimated_minutes": 15, "visual_component_type": "plant_cell"},
            {"id": "subt_calvin", "topic_id": "top_photo", "name": "Calvin Cycle", "slug": "calvin-cycle", "estimated_minutes": 15, "visual_component_type": "chemical_cycle"}
        ]

        self.lessons = [
            {
                "id": "les_001",
                "subtopic_id": "subt_light",
                "title": "Chloroplasts and Photon Excitation",
                "content_markdown": "Chloroplasts contain chlorophyll molecules in their thylakoids...",
                "objectives": ["Identify chloroplast anatomy", "Explain photon absorption"],
                "estimated_duration_minutes": 20
            }
        ]

        # 6. AI Conversations & Messages (Private to student unless consented)
        self.ai_conversations: Dict[str, Dict[str, Any]] = {
            "conv_001": {
                "id": "conv_001",
                "user_id": "usr_student_001",
                "topic_id": "top_photo",
                "subject_name": "Science",
                "title": "Understanding Photosynthesis Reactions",
                "status": "active",
                "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
            }
        }

        self.ai_messages: Dict[str, List[Dict[str, Any]]] = {
            "conv_001": [
                {
                    "id": "msg_001",
                    "conversation_id": "conv_001",
                    "role": "user",
                    "content": "Can you explain how light reactions work?",
                    "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
                },
                {
                    "id": "msg_002",
                    "conversation_id": "conv_001",
                    "role": "assistant",
                    "content": "In light-dependent reactions, sunlight energizes electrons in chlorophyll...",
                    "visual_component": "plant_cell",
                    "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
                }
            ]
        }

        # 7. AI Notes & Version Snapshots
        self.ai_notes: Dict[str, Dict[str, Any]] = {
            "note_001": {
                "id": "note_001",
                "user_id": "usr_student_001",
                "title": "Photosynthesis Master Study Guide",
                "subject": "Science",
                "topic": "Photosynthesis",
                "notebook_name": "Botany 2026",
                "content_markdown": "# Photosynthesis\nComprehensive notes with diagrams and Calvin cycle.",
                "flashcards_json": [{"front": "Where do light reactions take place?", "back": "Thylakoid membranes"}],
                "quiz_json": [{"question": "What gas is released during photosynthesis?", "options": ["Oxygen", "CO2"], "answer": "Oxygen"}],
                "citations_json": [{"source": "NCERT Biology Chapter 6", "page": 42}],
                "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                "version": 1
            }
        }
        self.note_versions: Dict[str, List[Dict[str, Any]]] = {
            "note_001": [
                {
                    "version_id": "ver_001",
                    "version_number": 1,
                    "title": "Photosynthesis Master Study Guide",
                    "content_markdown": "# Photosynthesis\nComprehensive notes with diagrams and Calvin cycle.",
                    "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                    "change_summary": "Initial note generated from curriculum"
                }
            ]
        }
        self.library_collections: Dict[str, Dict[str, Any]] = {
            "col_001": {
                "id": "col_001",
                "user_id": "usr_student_001",
                "title": "Board Exam 2026 High-Yield",
                "description": "Critical diagrams and formulas for CBSE Class 10 Science",
                "resource_ids": ["res_001", "note_001"],
                "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
            }
        }
        self.user_favorites: Dict[str, List[str]] = {
            "usr_student_001": ["res_001", "note_001"]
        }
        self.recently_accessed: Dict[str, List[Dict[str, Any]]] = {
            "usr_student_001": [
                {"resource_id": "note_001", "resource_type": "note", "title": "Photosynthesis Master Study Guide", "accessed_at": datetime.datetime.now(datetime.timezone.utc).isoformat()},
                {"resource_id": "res_001", "resource_type": "pdf", "title": "NCERT Grade 10 Science Life Processes", "accessed_at": datetime.datetime.now(datetime.timezone.utc).isoformat()}
            ]
        }

        # 8. Library Resources
        self.library_resources: Dict[str, Dict[str, Any]] = {
            "res_001": {
                "id": "res_001",
                "tenant_id": "a0000000-0000-0000-0000-000000000001",
                "title": "NCERT Grade 10 Science Life Processes",
                "description": "Standard CBSE curriculum reference material",
                "subject": "Science",
                "grade": "Grade 10",
                "resource_type": "pdf",
                "file_path": "/storage/library/cbse_grade10_science_ch6.pdf",
                "file_size_bytes": 1420500,
                "mime_type": "application/pdf",
                "tags": ["biology", "life processes", "cbse"],
                "is_public": True
            }
        }

        # 9. Three Adaptive Educational Games
        self.games: Dict[str, Dict[str, Any]] = {
            "answer_battle": {
                "id": "answer_battle",
                "title": "Concept Duel: Knowledge Arena",
                "game_type": "answer_battle",
                "genre": "fighting_progression",
                "subject": "Science",
                "description": "Round-based knowledge combat where correct conceptual answers unleash attacks, combos, and energy shields against adaptive AI opponents.",
                "min_grade": 6,
                "max_grade": 12,
                "is_active": True,
                "mechanics": {
                    "combat_style": "turn_based_progression",
                    "streak_multiplier": True,
                    "combo_shield": True,
                    "age_appropriate": "non-graphic energy particle aura"
                }
            },
            "space_shooter": {
                "id": "space_shooter",
                "title": "Astro Interceptor 3D",
                "game_type": "space_shooter",
                "genre": "shooting_arcade",
                "subject": "Science",
                "description": "Pilot a research interceptor through scientific asteroid fields, locking onto correct answer targets while evading misconception debris.",
                "min_grade": 6,
                "max_grade": 12,
                "is_active": True,
                "mechanics": {
                    "targeting": "correct_answer_nodes",
                    "speed_adaptive": True,
                    "difficulty_scaling": "streak_based",
                    "age_appropriate": "space sci-fi research probe"
                }
            },
            "learning_runner": {
                "id": "learning_runner",
                "title": "Concept Path Runner & Logic Grid",
                "game_type": "learning_runner",
                "genre": "adaptive_preference_runner",
                "subject": "Science",
                "description": "Configurable adaptive runner supporting visual diagram matching, rapid recall, or step-by-step logic pathways based on student preferences.",
                "min_grade": 6,
                "max_grade": 12,
                "is_active": True,
                "mechanics": {
                    "preference_modes": ["visual_diagrams", "speed_recall", "logic_matching"],
                    "adaptive_pace": True,
                    "checkpoint_challenges": True
                }
            }
        }

        self.game_sessions: List[Dict[str, Any]] = [
            {
                "id": "gs_001",
                "user_id": "usr_student_001",
                "game_id": "space_shooter",
                "game_type": "space_shooter",
                "subject": "Science",
                "topic": "Photosynthesis",
                "score": 1250,
                "accuracy": 92,
                "correct_count": 11,
                "total_questions": 12,
                "stage_reached": 3,
                "duration_seconds": 95,
                "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
            }
        ]

        # 10. Authoritative Points Ledger, Badges & Event Idempotency
        self.processed_reward_events: Dict[str, Dict[str, Any]] = {}
        self.points_transactions: List[Dict[str, Any]] = [
            {
                "id": "pt_001",
                "user_id": "usr_student_001",
                "amount": 100,
                "balance_after": 1450,
                "reason": "Completed Photosynthesis Examination",
                "reference_type": "exam",
                "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
            }
        ]

        self.achievements: Dict[str, Dict[str, Any]] = {
            "ach_streak_14": {
                "id": "ach_streak_14",
                "code": "STREAK_14_DAYS",
                "title": "Fortnight Scholar",
                "description": "Maintained a consistent daily learning streak for 14 continuous days.",
                "points_reward": 100,
                "badge_icon": "flame"
            },
            "ach_battle_master": {
                "id": "ach_battle_master",
                "code": "CONCEPT_DUEL_MASTER",
                "title": "Arena Champion",
                "description": "Achieved a 5-question unbroken combo in Concept Duel.",
                "points_reward": 150,
                "badge_icon": "swords"
            },
            "ach_exam_ace": {
                "id": "ach_exam_ace",
                "code": "WEEKLY_EXAM_ACE",
                "title": "Assessment Laureate",
                "description": "Scored over 90% in a formal weekly examination.",
                "points_reward": 200,
                "badge_icon": "award"
            }
        }

        self.student_achievements: List[Dict[str, Any]] = [
            {
                "user_id": "usr_student_001",
                "achievement_id": "ach_streak_14",
                "unlocked_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
            }
        ]

        # 11. Examinations, Questions, Attempts & Results
        self.examinations: Dict[str, Dict[str, Any]] = {
            "exam_001": {
                "id": "exam_001",
                "tenant_id": "a0000000-0000-0000-0000-000000000001",
                "title": "Grade 10 Weekly Science Assessment — Cellular Energy",
                "subject": "Science",
                "grade": "Grade 10",
                "exam_type": "weekly",
                "total_marks": 20,
                "duration_minutes": 30,
                "is_published": True,
            }
        }

        self.exam_questions: Dict[str, List[Dict[str, Any]]] = {
            "exam_001": [
                {
                    "id": "q_001",
                    "exam_id": "exam_001",
                    "question_text": "What organelle performs cellular respiration in eukaryotic cells?",
                    "question_type": "mcq",
                    "options": ["Ribosome", "Mitochondria", "Chloroplast", "Golgi Body"],
                    "correct_answer": "Mitochondria",
                    "marks": 10,
                    "explanation": "Mitochondria generate ATP through oxidative phosphorylation."
                },
                {
                    "id": "q_002",
                    "exam_id": "exam_001",
                    "question_text": "Which wavelength of light is primarily reflected by chlorophyll-a?",
                    "question_type": "mcq",
                    "options": ["Blue", "Red", "Green", "UV"],
                    "correct_answer": "Green",
                    "marks": 10,
                    "explanation": "Chlorophyll absorbs blue and red, reflecting green light."
                }
            ]
        }

        self.examination_attempts: Dict[str, Dict[str, Any]] = {
            "att_001": {
                "id": "att_001",
                "exam_id": "exam_001",
                "student_id": "usr_student_001",
                "status": "evaluated",
                "total_score": 20.0,
                "percentage": 100.0,
                "started_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                "submitted_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
            }
        }

        self.examination_results: Dict[str, Dict[str, Any]] = {
            "att_001": {
                "id": "res_001",
                "attempt_id": "att_001",
                "student_id": "usr_student_001",
                "exam_id": "exam_001",
                "rank": 1,
                "percentile": 99.4,
                "weak_topics": [],
                "strong_topics": ["Photosynthesis", "Cellular Respiration"]
            }
        }

        # 12. Student Progress & Schedules
        self.student_progress: List[Dict[str, Any]] = [
            {
                "id": "prog_001",
                "user_id": "usr_student_001",
                "subject": "Science",
                "topic": "Photosynthesis",
                "mastery_level": 94.0,
                "completion_percentage": 100.0,
                "total_study_minutes": 180,
                "last_studied_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
            }
        ]

        self.study_schedules: List[Dict[str, Any]] = [
            {
                "id": "sched_001",
                "user_id": "usr_student_001",
                "day_of_week": 1, # Monday
                "start_time": "17:00",
                "end_time": "18:30",
                "subject": "Science",
                "topic": "Photosynthesis & Cellular Respiration",
                "reminder_enabled": True,
                "is_active": True
            }
        ]

        # 13. Notifications
        self.notifications: List[Dict[str, Any]] = [
            {
                "id": "notif_001",
                "user_id": "usr_student_001",
                "title": "Assessment Graded",
                "message": "Your Cellular Energy weekly assessment has been evaluated. Score: 20/20 (100%)",
                "notification_type": "exam",
                "is_read": False,
                "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
            }
        ]

        # 14. Payments
        self.payments: List[Dict[str, Any]] = [
            {
                "id": "pay_001",
                "tenant_id": "a0000000-0000-0000-0000-000000000001",
                "user_id": "usr_parent_001",
                "amount": 4999.00,
                "currency": "INR",
                "status": "completed",
                "gateway": "razorpay",
                "transaction_ref": "pay_live_2026_nps_001",
                "invoice_url": "https://studyai.com/invoices/inv_2026_001.pdf",
                "description": "Annual Academic Subscription Grade 10 CBSE",
                "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
            }
        ]

        # 15. Feature Flags (Strictly enforcing video generation prohibition)
        self.feature_flags: Dict[str, Dict[str, Any]] = {
            "video_generation": {
                "flag_key": "video_generation",
                "description": "AI Video Generation — Strictly Disabled in Production Policy",
                "is_enabled": False,
                "allowed_roles": []
            },
            "ai_tutor_multimodal": {
                "flag_key": "ai_tutor_multimodal",
                "description": "AI Tutor Deep Explanations & Diagrams",
                "is_enabled": True,
                "allowed_roles": ["student", "admin", "superadmin"]
            },
            "interactive_3d_lab": {
                "flag_key": "interactive_3d_lab",
                "description": "Three.js 3D Models",
                "is_enabled": True,
                "allowed_roles": ["student", "admin", "superadmin"]
            }
        }

        # 16. AI Provider Configs
        self.ai_provider_configs: Dict[str, Dict[str, Any]] = {
            "ollama": {
                "provider_name": "ollama",
                "is_active": True,
                "base_url": "http://localhost:11434",
                "default_model": "qwen2.5:7b",
                "max_tokens": 4096,
                "temperature": 0.70,
                "priority_order": 1
            },
            "gemini": {
                "provider_name": "gemini",
                "is_active": True,
                "base_url": "https://generativelanguage.googleapis.com",
                "default_model": "gemini-1.5-pro",
                "max_tokens": 4096,
                "temperature": 0.70,
                "priority_order": 2
            }
        }

db_state = DatabaseState()
