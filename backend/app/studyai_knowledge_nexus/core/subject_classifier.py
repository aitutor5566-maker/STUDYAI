import re
from typing import Any, Dict, List, Optional
from backend.app.studyai_knowledge_nexus.curriculum.icse_database import icse_db


class SubjectClassifier:
    """
    Classifies student queries into ICSE grade levels, subjects, chapters, and topics.
    """

    SUBJECT_KEYWORDS = {
        "History & Civics": [
            "history", "civics", "revolt", "1857", "nationalism", "parliament", "lok sabha",
            "rajya sabha", "constitution", "viceroy", "british", "gandhi", "swadeshi", "un",
            "united nations", "first war of independence", "supreme court", "high court"
        ],
        "Mathematics": [
            "math", "maths", "mathematics", "solve", "equation", "quadratic", "algebra",
            "matrix", "matrices", "gst", "banking", "trigonometry", "sin", "cos", "tan",
            "cylinder", "cone", "sphere", "mensuration", "probability", "statistics", "ogive"
        ],
        "Physics": [
            "physics", "force", "work", "power", "energy", "refraction", "lens", "convex",
            "concave", "sound", "echo", "resonance", "ohm", "resistor", "current", "voltage",
            "calorimetry", "radioactivity", "alpha", "beta", "gamma"
        ],
        "Chemistry": [
            "chemistry", "periodic table", "bonding", "ionic", "covalent", "acid", "base",
            "salt", "mole", "stoichiometry", "electrolysis", "metallurgy", "ammonia", "haber",
            "sulphuric", "hcl", "organic", "alkane", "alkene", "alkyne"
        ],
        "Biology": [
            "biology", "cell", "mitosis", "meiosis", "genetics", "mendel", "chromosome", "dna",
            "photosynthesis", "transpiration", "heart", "circulation", "nephron", "kidney",
            "excretion", "nervous", "neuron", "endocrine", "hormone"
        ],
        "Geography": [
            "geography", "topo", "topographical", "monsoon", "climate", "soil", "alluvial",
            "forest", "vegetation", "water resources", "irrigation", "crops", "agriculture"
        ],
        "Computer Applications": [
            "computer", "java", "oop", "bluej", "class", "object", "array", "method", "loop",
            "string", "inheritance", "polymorphism"
        ],
        "English": [
            "english", "grammar", "literature", "prose", "poetry", "essay", "letter", "notice",
            "julius caesar", "merchant of venice"
        ]
    }

    def classify(self, query: str, user_grade: int = 10, preferred_subject: Optional[str] = None) -> Dict[str, Any]:
        """Identifies subject, chapter, and curriculum match."""
        q_lower = query.lower()

        # Detect Subject
        detected_subject = preferred_subject
        if not detected_subject or detected_subject.lower() in ("general", "all", "auto"):
            best_subj = "Science"
            best_score = 0
            for subj, kws in self.SUBJECT_KEYWORDS.items():
                score = sum(1 for kw in kws if kw in q_lower)
                if score > best_score:
                    best_score = score
                    best_subj = subj
            detected_subject = best_subj

        # Search ICSE Database
        curriculum_match = icse_db.find_matching_curriculum(query, grade=user_grade, subject=detected_subject)

        return {
            "board": "ICSE",
            "grade": user_grade,
            "subject": detected_subject,
            "matched_chapter": curriculum_match.get("chapter") if curriculum_match else "General ICSE Syllabus",
            "recommended_books": curriculum_match.get("recommended_books") if curriculum_match else ["Concise Series (Selina)", "Morning Star"],
            "curriculum_found": bool(curriculum_match),
        }


subject_classifier = SubjectClassifier()
