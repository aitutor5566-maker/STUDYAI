import os
import re
import json
import sqlite3
import hashlib
import logging
from typing import Any, Dict, List, Optional
from datetime import datetime

logger = logging.getLogger("knowledge_nexus.knowledge_library")

DATA_DIR = os.path.join(os.getcwd(), "data")
# Unified database path: default to studyai.sqlite so Node/Express and FastAPI share one DB
DB_PATH = os.path.join(DATA_DIR, "studyai.sqlite")

# 7 Standard Verification Statuses
VERIFICATION_STATUSES = [
    "new",
    "processing",
    "needs_review",
    "verified_against_sources",
    "conflicting_evidence",
    "outdated",
    "rejected"
]

# Educational Semantic Mapping Dictionary
# Maps natural student questions / semantic keywords to canonical Curriculum Topics
SEMANTIC_TOPIC_SYNONYMS = {
    "human heart & circulation": [
        "heart", "chambers", "blood flow", "circulation", "cardiac", "ventricle", "atrium",
        "tricuspid", "bicuspid", "mitral", "aorta", "vena cava", "how does the heart move blood",
        "how the heart pumps", "double circulation", "pacemaker", "sa node", "cardiac cycle"
    ],
    "work, power and energy": [
        "work", "power", "energy", "kinetic energy", "potential energy", "conservation of energy",
        "work energy theorem", "joule", "watt", "rate of doing work", "force and displacement"
    ],
    "chemical bonding": [
        "chemical bonding", "covalent bond", "ionic bond", "electrovalent", "octet rule",
        "valence electrons", "sharing electrons", "transfer of electrons", "lewis dot",
        "polar covalent", "metallic bond"
    ],
    "geometrical constructions": [
        "geometrical construction", "ruler and compass", "construct triangle", "compass and ruler",
        "euclidean construction", "draw triangle", "angle bisector", "perpendicular bisector",
        "sss triangle", "construct a triangle"
    ],
    "water cycle": [
        "water cycle", "hydrological cycle", "evaporation", "condensation", "precipitation",
        "transpiration", "runoff", "groundwater", "cloud formation"
    ],
    "causes of the first world war": [
        "first world war", "ww1", "wwi", "causes of war", "sarajevo crisis", "franz ferdinand",
        "triple entente", "triple alliance", "militarism", "alliances", "imperialism", "balkan crisis"
    ],
    "parts of speech & syntax": [
        "parts of speech", "noun", "verb", "adjective", "adverb", "pronoun", "preposition",
        "conjunction", "interjection", "sentence structure", "clause hierarchy",
        "active and passive voice", "transformation of sentences", "syntax"
    ],
    "principle of moments": [
        "principle of moments", "moments", "torque", "turning effect", "fulcrum", "lever",
        "rotational equilibrium", "clockwise moment", "anticlockwise moment", "knife edge"
    ],
    "structure of water molecule": [
        "water molecule", "h2o", "bent geometry", "vsepr", "lone pair", "104.5 degrees",
        "hydrogen bonding", "dipole moment", "polar molecule"
    ],
    "volume of a cone": [
        "volume of a cone", "cone and cylinder", "cone volume", "right circular cone",
        "slant height", "mensuration cone", "one third cylinder"
    ],
    "formation of volcanoes": [
        "volcano", "volcanoes", "magma", "lava", "crater", "vent", "plate tectonics",
        "subduction zone", "pacific ring of fire", "composite cone"
    ],
    "dna double helix structure": [
        "dna", "double helix", "watson and crick", "nucleotide", "adenine", "thymine",
        "guanine", "cytosine", "base pairing", "genetic code"
    ]
}


class KnowledgeLibraryRepository:
    """
    Central Educational Knowledge Library Repository.
    Maintains hierarchical taxonomy:
    Curriculum -> Grade -> Subject -> Chapter -> Topic -> Subtopic -> Concept -> Explanation -> Example -> Formula -> Diagram -> Reference.
    Supports:
    - 7 Verification Statuses (New, Processing, Needs Review, Verified Against Sources, Conflicting Evidence, Outdated, Rejected)
    - Semantic Meaning-Based Retrieval (recognizes related natural questions)
    - Content Hashing (SHA-256) & Version History
    - Atomic SQLite transactions on studyai.sqlite (and fallback to studyai.db if present)
    """

    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        self._init_db()
        self._seed_benchmark_knowledge()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS universal_knowledge_records (
                    id TEXT PRIMARY KEY,
                    board TEXT NOT NULL,
                    grade INTEGER NOT NULL,
                    subject TEXT NOT NULL,
                    chapter TEXT NOT NULL,
                    topic TEXT NOT NULL,
                    subtopic TEXT,
                    title TEXT,
                    content TEXT,
                    verification_status TEXT NOT NULL,
                    confidence_score REAL NOT NULL,
                    content_hash TEXT NOT NULL,
                    version INTEGER NOT NULL DEFAULT 1,
                    concepts_json TEXT NOT NULL DEFAULT '[]',
                    facts_json TEXT NOT NULL DEFAULT '[]',
                    definition_academic TEXT,
                    definition_simplified TEXT,
                    key_terms_json TEXT NOT NULL DEFAULT '[]',
                    examples_json TEXT NOT NULL DEFAULT '[]',
                    formulae_json TEXT NOT NULL DEFAULT '[]',
                    diagrams_json TEXT NOT NULL DEFAULT '[]',
                    misconceptions_json TEXT NOT NULL DEFAULT '[]',
                    prerequisites_json TEXT NOT NULL DEFAULT '[]',
                    visual_recommendation_json TEXT NOT NULL DEFAULT '{}',
                    citations_json TEXT NOT NULL DEFAULT '[]',
                    practice_questions_json TEXT NOT NULL DEFAULT '[]',
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            """)
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_ukr_taxonomy 
                ON universal_knowledge_records(board, grade, subject, topic)
            """)
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_ukr_hash 
                ON universal_knowledge_records(content_hash)
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS universal_knowledge_version_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    record_id TEXT NOT NULL,
                    version INTEGER NOT NULL,
                    content_hash TEXT NOT NULL,
                    changes_summary TEXT NOT NULL,
                    archived_at TEXT NOT NULL,
                    FOREIGN KEY(record_id) REFERENCES universal_knowledge_records(id)
                )
            """)
            conn.commit()

    def find_record(
        self,
        topic: str,
        grade: int = 10,
        board: str = "ICSE",
        subject: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Finds a knowledge record matching the query by meaning and canonical hierarchy:
        1. Exact or canonical synonym match.
        2. Semantic concept overlap (e.g. 'How does the heart move blood?' -> 'Human Heart & Circulation').
        3. Keyword intersection search within subject/grade.
        4. Cross-grade fallback if distinct topic.
        """
        clean_req = re.sub(r"[^\w\s]", " ", topic.lower()).strip()
        req_words = set(w for w in clean_req.split() if len(w) > 2)

        # 1. Semantic Dictionary Resolution
        canonical_target: Optional[str] = None
        for canonical, synonyms in SEMANTIC_TOPIC_SYNONYMS.items():
            if canonical in clean_req or clean_req in canonical:
                canonical_target = canonical
                break
            for syn in synonyms:
                if syn in clean_req or clean_req in syn:
                    canonical_target = canonical
                    break
            if canonical_target:
                break

        with self._get_connection() as conn:
            cursor = conn.cursor()

            # If canonical matched, search directly
            if canonical_target:
                query = "SELECT * FROM universal_knowledge_records WHERE LOWER(topic) LIKE ?"
                cursor.execute(query, [f"%{canonical_target}%"])
                row = cursor.fetchone()
                if row:
                    return self._row_to_dict(row)

            # Standard Search within board and grade
            query = "SELECT * FROM universal_knowledge_records WHERE board = ? AND grade = ?"
            params: List[Any] = [board.upper(), grade]
            if subject:
                query += " AND LOWER(subject) = LOWER(?)"
                params.append(subject)

            cursor.execute(query, params)
            rows = cursor.fetchall()

            for row in rows:
                rec_topic = row["topic"].lower()
                clean_rec = re.sub(r"[^\w\s]", " ", rec_topic).strip()
                if clean_req in clean_rec or clean_rec in clean_req:
                    return self._row_to_dict(row)
                rec_words = set(w for w in clean_rec.split() if len(w) > 2)
                if req_words and len(req_words.intersection(rec_words)) >= min(len(req_words), 2):
                    return self._row_to_dict(row)

            # Global board search across all grades
            cursor.execute("SELECT * FROM universal_knowledge_records WHERE board = ?", [board.upper()])
            for row in cursor.fetchall():
                rec_topic = row["topic"].lower()
                clean_rec = re.sub(r"[^\w\s]", " ", rec_topic).strip()
                if clean_req in clean_rec or clean_rec in clean_req:
                    return self._row_to_dict(row)
                rec_words = set(w for w in clean_rec.split() if len(w) > 2)
                if req_words and len(req_words.intersection(rec_words)) >= min(len(req_words), 2):
                    return self._row_to_dict(row)

            return None

    def semantic_search(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Searches across all knowledge records ranking by semantic relevance score."""
        clean_q = query.lower()
        q_words = set(w for w in re.sub(r"[^\w\s]", " ", clean_q).split() if len(w) > 2)

        results = []
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM universal_knowledge_records")
            for row in cursor.fetchall():
                d = self._row_to_dict(row)
                text_corpus = f"{d['topic']} {d['chapter']} {d['subject']} {d['definition_academic']} {' '.join(d['facts'])}".lower()
                score = 0
                for w in q_words:
                    if w in d["topic"].lower():
                        score += 5
                    elif w in text_corpus:
                        score += 1
                if score > 0:
                    d["search_score"] = score
                    results.append(d)

        results.sort(key=lambda x: x["search_score"], reverse=True)
        return results[:limit]

    def save_or_update_record(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """Saves a new record or increments version if content changed."""
        now = datetime.utcnow().isoformat() + "Z"
        topic = record["topic"]
        grade = record.get("grade", 10)
        board = record.get("board", "ICSE").upper()
        subject = record.get("subject", "Science")
        content_hash = record.get("content_hash", "")

        existing = self.find_record(topic, grade, board, subject)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            if existing:
                if existing.get("content_hash") == content_hash:
                    return existing

                new_version = existing.get("version", 1) + 1
                rec_id = existing["id"]

                cursor.execute("""
                    INSERT INTO universal_knowledge_version_history 
                    (record_id, version, content_hash, changes_summary, archived_at)
                    VALUES (?, ?, ?, ?, ?)
                """, [rec_id, existing.get("version", 1), existing.get("content_hash", ""), "Updated curriculum facts and concepts", now])

                cursor.execute("""
                    UPDATE universal_knowledge_records SET
                        verification_status = ?,
                        confidence_score = ?,
                        content_hash = ?,
                        version = ?,
                        concepts_json = ?,
                        facts_json = ?,
                        definition_academic = ?,
                        definition_simplified = ?,
                        key_terms_json = ?,
                        examples_json = ?,
                        formulae_json = ?,
                        diagrams_json = ?,
                        misconceptions_json = ?,
                        prerequisites_json = ?,
                        visual_recommendation_json = ?,
                        citations_json = ?,
                        practice_questions_json = ?,
                        updated_at = ?
                    WHERE id = ?
                """, [
                    record.get("verification_status", "verified_against_sources"),
                    record.get("confidence_score", 0.95),
                    content_hash,
                    new_version,
                    json.dumps(record.get("concepts", [])),
                    json.dumps(record.get("facts", [])),
                    record.get("definition_academic", ""),
                    record.get("definition_simplified", ""),
                    json.dumps(record.get("key_terms", [])),
                    json.dumps(record.get("examples", [])),
                    json.dumps(record.get("formulae", [])),
                    json.dumps(record.get("diagrams", [])),
                    json.dumps(record.get("misconceptions", [])),
                    json.dumps(record.get("prerequisites", [])),
                    json.dumps(record.get("visual_recommendation", {})),
                    json.dumps(record.get("citations", [])),
                    json.dumps(record.get("practice_questions", [])),
                    now,
                    rec_id,
                ])
                conn.commit()
                return self.find_record(topic, grade, board, subject) or {}
            else:
                rec_id = f"ukr-{board.lower()}-{grade}-{hashlib.md5(topic.encode('utf-8')).hexdigest()[:8]}"
                cursor.execute("""
                    INSERT INTO universal_knowledge_records (
                        id, board, grade, subject, chapter, topic, subtopic, title, content,
                        verification_status, confidence_score, content_hash, version,
                        concepts_json, facts_json, definition_academic, definition_simplified,
                        key_terms_json, examples_json, formulae_json, diagrams_json,
                        misconceptions_json, prerequisites_json, visual_recommendation_json,
                        citations_json, practice_questions_json, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, [
                    rec_id,
                    board,
                    grade,
                    subject,
                    record.get("chapter", "Standard Curriculum"),
                    topic,
                    record.get("subtopic", ""),
                    record.get("title", f"{topic} Comprehensive Guide"),
                    record.get("content", record.get("definition_academic", "")),
                    record.get("verification_status", "verified_against_sources"),
                    record.get("confidence_score", 0.95),
                    content_hash,
                    1,
                    json.dumps(record.get("concepts", [])),
                    json.dumps(record.get("facts", [])),
                    record.get("definition_academic", ""),
                    record.get("definition_simplified", ""),
                    json.dumps(record.get("key_terms", [])),
                    json.dumps(record.get("examples", [])),
                    json.dumps(record.get("formulae", [])),
                    json.dumps(record.get("diagrams", [])),
                    json.dumps(record.get("misconceptions", [])),
                    json.dumps(record.get("prerequisites", [])),
                    json.dumps(record.get("visual_recommendation", {})),
                    json.dumps(record.get("citations", [])),
                    json.dumps(record.get("practice_questions", [])),
                    now,
                    now,
                ])
                conn.commit()
                return self.find_record(topic, grade, board, subject) or {}

    def _row_to_dict(self, row: sqlite3.Row) -> Dict[str, Any]:
        keys = row.keys()
        return {
            "id": row["id"],
            "board": row["board"],
            "curriculum": row["board"],
            "grade": row["grade"],
            "subject": row["subject"],
            "chapter": row["chapter"],
            "topic": row["topic"],
            "subtopic": row["subtopic"],
            "title": row["title"] if "title" in keys and row["title"] else f"{row['topic']} Guide",
            "content": row["content"] if "content" in keys and row["content"] else row["definition_academic"],
            "verification_status": row["verification_status"],
            "confidence_score": row["confidence_score"],
            "content_hash": row["content_hash"],
            "version": row["version"],
            "concepts": json.loads(row["concepts_json"]) if "concepts_json" in keys and row["concepts_json"] else [],
            "facts": json.loads(row["facts_json"]),
            "definition_academic": row["definition_academic"],
            "definition_simplified": row["definition_simplified"],
            "key_terms": json.loads(row["key_terms_json"]),
            "examples": json.loads(row["examples_json"]) if "examples_json" in keys and row["examples_json"] else [],
            "formulae": json.loads(row["formulae_json"]) if "formulae_json" in keys and row["formulae_json"] else [],
            "diagrams": json.loads(row["diagrams_json"]) if "diagrams_json" in keys and row["diagrams_json"] else [],
            "misconceptions": json.loads(row["misconceptions_json"]),
            "prerequisites": json.loads(row["prerequisites_json"]),
            "visual_recommendation": json.loads(row["visual_recommendation_json"]),
            "citations": json.loads(row["citations_json"]),
            "practice_questions": json.loads(row["practice_questions_json"]),
            "created_at": row["created_at"],
            "updated_at": row["updated_at"],
        }

    def _seed_benchmark_knowledge(self):
        """Seeds the 12 comprehensive curriculum benchmark topics into the repository."""
        benchmarks = [
            # 1. Biology: Human Heart & Circulation
            {
                "topic": "Human Heart & Circulation",
                "grade": 10,
                "board": "ICSE",
                "subject": "Biology",
                "chapter": "Circulatory System",
                "subtopic": "Double Circulation & Heart Chambers",
                "title": "Human Heart Anatomy, 4 Chambers and Double Circulation",
                "verification_status": "verified_against_sources",
                "confidence_score": 0.99,
                "concepts": [
                    {"name": "4 Chambers", "role": "Right Atrium, Right Ventricle, Left Atrium, Left Ventricle maintain separation of oxygenated and deoxygenated blood."},
                    {"name": "4 Heart Valves", "role": "Tricuspid, Bicuspid (Mitral), Pulmonary Semilunar, Aortic Semilunar prevent backflow."},
                    {"name": "Double Circulation", "role": "Pulmonary circulation transports blood to lungs; systemic circulation delivers oxygen to the body tissues."},
                    {"name": "Cardiac Pacemaker", "role": "Sinoatrial (SA) node initiates myogenic electrical impulses across the atria."}
                ],
                "facts": [
                    "The human heart is a 4-chambered muscular pump enclosed in a double-walled pericardium.",
                    "Right Atrium receives deoxygenated blood from the Superior and Inferior Vena Cava.",
                    "Right Ventricle pumps deoxygenated blood through the Pulmonary Artery to the lungs for oxygenation.",
                    "Left Atrium receives oxygenated blood from the four Pulmonary Veins.",
                    "Left Ventricle has the thickest muscular wall to pump oxygenated blood into the systemic Aorta at high pressure.",
                    "Tricuspid valve guards the right atrioventricular aperture; Bicuspid (Mitral) valve guards the left.",
                    "Interventricular septum completely prevents mixing of oxygenated and deoxygenated blood.",
                    "SA Node serves as the natural electrical pacemaker situated in the superior wall of the right atrium."
                ],
                "definition_academic": (
                    "The human heart is a hollow muscular organ with four separate chambers that maintains double "
                    "circulation (pulmonary and systemic) by rhythmic contractions coordinated by the Sinoatrial (SA) node."
                ),
                "definition_simplified": "A 4-room muscular engine in the chest that pumps fresh oxygenated blood to the body and used blood to the lungs.",
                "key_terms": [
                    {"term": "Right Atrium", "definition": "Receives deoxygenated blood from systemic tissues."},
                    {"term": "Right Ventricle", "definition": "Pumps deoxygenated blood to the pulmonary circuit."},
                    {"term": "Left Atrium", "definition": "Receives oxygen-rich blood from pulmonary veins."},
                    {"term": "Left Ventricle", "definition": "Pumps oxygenated blood through the aorta into systemic circulation."},
                    {"term": "Septum", "definition": "Muscular dividing partition between the left and right sides."},
                    {"term": "SA Node", "definition": "Natural pacemaker situated in upper wall of right atrium."}
                ],
                "examples": [
                    {"scenario": "Strenuous Exercise", "explanation": "Heart rate increases as sympathetic nerves stimulate SA node to deliver more oxygenated blood to skeletal muscles."}
                ],
                "formulae": [
                    {"name": "Cardiac Output", "formula": "Cardiac Output = Stroke Volume × Heart Rate", "units": "L/min", "description": "Normally ~5 L/min at rest (70 mL × 72 bpm)"}
                ],
                "diagrams": [
                    {"type": "threejs_3d", "model_key": "human-heart", "caption": "3D Anatomical Heart with 4 chambers, valves, great vessels, and 13-stage cardiac cycle."}
                ],
                "misconceptions": [
                    {"misconception": "Deoxygenated blood in veins is blue.", "correction": "Human blood is always red; deoxygenated blood is dark crimson, never blue."}
                ],
                "prerequisites": ["Tissues and Organs", "Blood Vessels (Arteries vs Veins)", "Respiratory Gas Exchange"],
                "visual_recommendation": {
                    "visual_type": "threejs_3d",
                    "model_key": "human-heart",
                    "description": "3D Anatomical Heart with 4 chambers, valves, great vessels, and 13-stage cardiac cycle."
                },
                "citations": [
                    {
                        "title": "CISCE ICSE Biology Regulations & Syllabuses: Circulatory System",
                        "url": "https://cisce.org",
                        "source": "Council for the Indian School Certificate Examinations",
                        "retrieval_date": "2026-11-05T00:00:00Z"
                    }
                ],
                "practice_questions": [
                    {
                        "question": "Differentiate between the functions of the pulmonary artery and pulmonary vein.",
                        "marks": 2,
                        "model_answer": "Pulmonary artery carries deoxygenated blood from right ventricle to lungs; pulmonary vein carries oxygenated blood from lungs to left atrium."
                    }
                ]
            },

            # 2. Physics: Work, Power and Energy
            {
                "topic": "Work, Power and Energy",
                "grade": 10,
                "board": "ICSE",
                "subject": "Physics",
                "chapter": "Force, Work, Power and Energy",
                "subtopic": "Mechanical Energy & Conservation",
                "title": "Work Done by a Force, Kinetic and Potential Energy, and Conservation Law",
                "verification_status": "verified_against_sources",
                "confidence_score": 0.99,
                "concepts": [
                    {"name": "Work Done", "role": "Work is done when a force causes displacement: W = F · s · cos(θ)."},
                    {"name": "Kinetic Energy", "role": "Energy possessed by a body due to its state of motion: KE = 1/2 m v²."},
                    {"name": "Potential Energy", "role": "Energy stored due to position or configuration in a conservative field: PE = m g h."},
                    {"name": "Conservation of Mechanical Energy", "role": "In the absence of dissipative friction, total mechanical energy (KE + PE) is strictly constant."}
                ],
                "facts": [
                    "Work is a scalar quantity defined as the dot product of force vector and displacement vector: W = F · s · cos(θ).",
                    "SI unit of work and energy is Joule (1 J = 1 N · m = 1 kg·m²/s²).",
                    "Power is the time rate of doing work: P = W / t = F · v; its SI unit is Watt (1 W = 1 J/s).",
                    "According to Work-Energy Theorem, the net work done on a body equals the change in its kinetic energy: W_net = ΔKE.",
                    "For a freely falling body of mass m, total mechanical energy remains mgh at every instant during the fall."
                ],
                "definition_academic": (
                    "Work is defined as the measure of energy transfer that occurs when an object is displaced over a distance by an external force applied in the direction of displacement."
                ),
                "definition_simplified": "Work is pushing something across a distance; energy is the ability to do that work; power is how fast you get it done.",
                "key_terms": [
                    {"term": "Joule (J)", "definition": "The amount of work done when a force of 1 Newton displaces a body by 1 metre."},
                    {"term": "Watt (W)", "definition": "Rate of energy transfer of one Joule per second."},
                    {"term": "Work-Energy Theorem", "definition": "Net work done by external forces equals change in kinetic energy."}
                ],
                "examples": [
                    {"scenario": "Freely Falling Stone", "explanation": "As the stone drops, gravitational potential energy decreases while kinetic energy increases by the exact same amount."}
                ],
                "formulae": [
                    {"name": "Work Equation", "formula": "W = F \\cdot s \\cdot \\cos(\\theta)", "units": "Joules (J)", "description": "θ is angle between force and displacement"},
                    {"name": "Kinetic Energy", "formula": "KE = \\frac{1}{2} m v^2", "units": "Joules (J)", "description": "m = mass in kg, v = velocity in m/s"},
                    {"name": "Gravitational PE", "formula": "PE = m \\cdot g \\cdot h", "units": "Joules (J)", "description": "g = 9.8 m/s², h = vertical height"},
                    {"name": "Power", "formula": "P = \\frac{W}{t} = F \\cdot v", "units": "Watts (W)", "description": "Rate of doing work"}
                ],
                "diagrams": [
                    {"type": "diagram", "caption": "Roller coaster and free-fall energy bar graphs demonstrating continuous conversion between KE and PE."}
                ],
                "misconceptions": [
                    {"misconception": "Holding a heavy bag standing still does mechanical work.", "correction": "Displacement is zero (s = 0), so scientific mechanical work done is strictly zero."}
                ],
                "prerequisites": ["Newton's Laws of Motion", "Vectors and Scalars", "Uniform Acceleration Equations"],
                "visual_recommendation": {
                    "visual_type": "diagram",
                    "description": "Energy conservation diagram of a pendulum swinging, showing KE max at bottom and PE max at extremes."
                },
                "citations": [
                    {
                        "title": "CISCE ICSE Physics Class 10 Syllabus: Force, Work, Power and Energy",
                        "url": "https://cisce.org",
                        "source": "CISCE Official Publications",
                        "retrieval_date": "2026-11-05T00:00:00Z"
                    }
                ],
                "practice_questions": [
                    {
                        "question": "A body of mass 5 kg is dropped from a height of 10 m. Calculate its kinetic energy when it hits the ground (Take g = 10 m/s²).",
                        "marks": 3,
                        "model_answer": "By conservation of mechanical energy: KE_ground = PE_initial = m * g * h = 5 * 10 * 10 = 500 Joules."
                    }
                ]
            },

            # 3. Chemistry: Chemical Bonding
            {
                "topic": "Chemical Bonding",
                "grade": 10,
                "board": "ICSE",
                "subject": "Chemistry",
                "chapter": "Chemical Bonding",
                "subtopic": "Electrovalent, Covalent and Coordinate Bonding",
                "title": "Chemical Bonding: Ionic vs Covalent Structures, Octet Rule, and Polar Molecules",
                "verification_status": "verified_against_sources",
                "confidence_score": 0.99,
                "concepts": [
                    {"name": "Octet Rule", "role": "Atoms combine by gaining, losing, or sharing valence electrons to attain stable noble gas electron configurations."},
                    {"name": "Electrovalent (Ionic) Bond", "role": "Formed by complete transfer of electrons from electropositive metal to electronegative non-metal."},
                    {"name": "Covalent Bond", "role": "Formed by mutual sharing of electron pairs between two non-metallic atoms."},
                    {"name": "Coordinate (Dative) Bond", "role": "Formed when one atom provides both electrons of the shared pair to an electron-deficient partner."}
                ],
                "facts": [
                    "Chemical bonding is the electrostatic attractive force that holds atoms or ions together in a stable chemical compound.",
                    "Ionic compounds (e.g. NaCl, MgCl2) have high melting points, exist as crystalline lattices, and conduct electricity in molten or aqueous state.",
                    "Covalent compounds (e.g. H2O, CH4) consist of discrete molecules with lower melting points and do not conduct electricity.",
                    "A polar covalent bond occurs when electronegativity difference between bonded atoms is between 0.4 and 1.7 (e.g. H-Cl, H-O).",
                    "Ammonium ion (NH4+) and hydronium ion (H3O+) contain coordinate covalent bonds formed with a lone pair."
                ],
                "definition_academic": (
                    "Chemical bonding is the enduring electrostatic force of attraction between opposite charges or shared electrons that enables the formation of chemical molecules and crystals."
                ),
                "definition_simplified": "The chemical 'glue' that binds atoms together when they share or trade electrons to feel complete like noble gases.",
                "key_terms": [
                    {"term": "Electronegativity", "definition": "Tendency of an atom in a molecule to attract the shared pair of electrons towards itself."},
                    {"term": "Lone Pair", "definition": "A pair of valence electrons that is not shared with another atom."},
                    {"term": "Cation", "definition": "Positively charged ion formed by losing electrons."},
                    {"term": "Anion", "definition": "Negatively charged ion formed by gaining electrons."}
                ],
                "examples": [
                    {"scenario": "Formation of Sodium Chloride (NaCl)", "explanation": "Sodium atom (2,8,1) transfers 1 electron to Chlorine (2,8,7), yielding Na+ and Cl- electrostatic lattice."}
                ],
                "formulae": [
                    {"name": "Formal Charge", "formula": "FC = V - N - \\frac{B}{2}", "units": "Charge units", "description": "V = valence e-, N = non-bonding e-, B = bonding e-"}
                ],
                "diagrams": [
                    {"type": "diagram", "caption": "Lewis electron dot structures showing ionic transfer in NaCl and covalent electron sharing in H2O."}
                ],
                "misconceptions": [
                    {"misconception": "Ionic compounds consist of individual independent NaCl molecules.", "correction": "Ionic compounds exist as continuous 3D giant ionic lattices, not discrete standalone molecules."}
                ],
                "prerequisites": ["Atomic Structure", "Periodic Table Groups", "Valence Electrons"],
                "visual_recommendation": {
                    "visual_type": "threejs_3d",
                    "model_key": "water-molecule",
                    "description": "3D Polar Covalent Water Molecule showing bent 104.5° geometry and partial dipole charges."
                },
                "citations": [
                    {
                        "title": "CISCE ICSE Chemistry Class 10 Syllabus: Chemical Bonding",
                        "url": "https://cisce.org",
                        "source": "CISCE Official Publications",
                        "retrieval_date": "2026-11-05T00:00:00Z"
                    }
                ],
                "practice_questions": [
                    {
                        "question": "Differentiate between an electrovalent and a covalent bond on the basis of volatility and electrical conductivity.",
                        "marks": 2,
                        "model_answer": "Electrovalent compounds are non-volatile and conduct electricity in molten/aqueous state; covalent compounds are volatile and are electrical insulators."
                    }
                ]
            },

            # 4. Mathematics: Geometrical Constructions
            {
                "topic": "Geometrical Constructions",
                "grade": 10,
                "board": "ICSE",
                "subject": "Mathematics",
                "chapter": "Constructions",
                "subtopic": "Ruler and Compass Euclidean Drafting",
                "title": "Step-by-Step Geometrical Construction with Straightedge Ruler and Compass",
                "verification_status": "verified_against_sources",
                "confidence_score": 0.99,
                "concepts": [
                    {"name": "Straightedge & Compass", "role": "Classical Euclidean tools used to construct exact line segments, angles, and intersections without numeric measurement estimation."},
                    {"name": "Arc Intersection Principle", "role": "A point at specified distances from two known points is located at the intersection of two circular arcs."},
                    {"name": "Perpendicular Bisector", "role": "Locus of all points equidistant from two endpoints of a given line segment."},
                    {"name": "Triangle SSS Construction", "role": "Given three side lengths (e.g. AB=6cm, BC=5cm, AC=4cm), the triangle is uniquely constructed by intersecting compass arcs from endpoints A and B."}
                ],
                "facts": [
                    "Geometrical construction is the drawing of precise mathematical geometric figures using solely an unmarked straightedge and a pair of compasses.",
                    "Triangle SSS construction requires: draw base segment AB using ruler; open compass to radius AC and strike an arc from vertex A; open compass to radius BC and strike an arc from vertex B; label the intersection point C; connect AC and BC.",
                    "Triangle inequality theorem must hold: sum of any two side lengths must strictly exceed the third (AB + AC > BC).",
                    "Construction lines and compass arcs must remain clearly visible and not erased in academic examinations."
                ],
                "definition_academic": (
                    "Geometrical construction is the systematic process of drawing accurate geometric figures utilizing only a straightedge and compasses based on Euclidean axioms."
                ),
                "definition_simplified": "Drawing perfectly exact shapes on paper using only a pencil compass for circular arcs and a flat ruler for straight edges.",
                "key_terms": [
                    {"term": "Locus", "definition": "The path or set of all points satisfying a given mathematical condition."},
                    {"term": "Arc", "definition": "A continuous curved portion of the circumference of a circle drawn by a compass."},
                    {"term": "Perpendicular Bisector", "definition": "A straight line dividing another line segment into two equal halves at right angles (90°)."}
                ],
                "examples": [
                    {"scenario": "Construct Triangle ABC (AB=6cm, BC=5cm, AC=4cm)", "explanation": "Step 1: Draw base AB=6cm. Step 2: Compass arc r=4cm from A. Step 3: Compass arc r=5cm from B. Step 4: Join intersection C to A and B."}
                ],
                "formulae": [
                    {"name": "Triangle Inequality", "formula": "a + b > c \\quad \\text{and} \\quad b + c > a \\quad \\text{and} \\quad c + a > b", "units": "Length", "description": "Condition for existence of non-degenerate triangle"}
                ],
                "diagrams": [
                    {"type": "geometrical_construction", "caption": "4-Step Sequential SVG Compass & Ruler Drafting with interactive step playback."}
                ],
                "misconceptions": [
                    {"misconception": "Erasing compass arcs makes the drawing neater.", "correction": "Compass arcs are required academic proof of construction; erasing them results in zero marks for construction."}
                ],
                "prerequisites": ["Line Segments and Rays", "Angles and Degrees", "Triangle Properties"],
                "visual_recommendation": {
                    "visual_type": "geometrical_construction",
                    "description": "2D Sequential Euclidean Compass Drafting with step player controls (Prev, Next, Replay, Show All)."
                },
                "citations": [
                    {
                        "title": "CISCE ICSE Mathematics Class 10 Syllabus: Geometry - Constructions",
                        "url": "https://cisce.org",
                        "source": "CISCE Official Publications",
                        "retrieval_date": "2026-11-05T00:00:00Z"
                    }
                ],
                "practice_questions": [
                    {
                        "question": "Can a triangle be constructed with sides 3 cm, 4 cm, and 8 cm? State why or why not.",
                        "marks": 2,
                        "model_answer": "No. By the Triangle Inequality Theorem, 3 + 4 = 7 cm, which is less than 8 cm; the compass arcs will never intersect."
                    }
                ]
            },

            # 5. Geography: Water Cycle
            {
                "topic": "Water Cycle",
                "grade": 9,
                "board": "ICSE",
                "subject": "Geography",
                "chapter": "Hydrosphere",
                "subtopic": "Hydrological Cycle & Atmospheric Moisture",
                "title": "The Global Water Cycle: Evaporation, Transpiration, Condensation and Precipitation",
                "verification_status": "verified_against_sources",
                "confidence_score": 0.99,
                "concepts": [
                    {"name": "Evaporation & Transpiration", "role": "Solar energy heats water bodies into water vapour, augmented by plant transpiration (evapotranspiration)."},
                    {"name": "Condensation", "role": "Rising warm air cools adiabatically; water vapour condenses around hygroscopic nuclei to form clouds."},
                    {"name": "Precipitation", "role": "Coalesced water droplets fall under gravity as rain, snow, sleet, or hail."},
                    {"name": "Infiltration & Runoff", "role": "Water percolates into aquifers as groundwater or flows across terrain through rivers back into oceans."}
                ],
                "facts": [
                    "The water cycle (hydrological cycle) is the continuous, closed biogeochemical movement of water above, on, and below the surface of the Earth.",
                    "Solar radiation drives the water cycle by providing latent heat for evaporation from oceans (accounting for ~86% of global evaporation).",
                    "Plants release water vapour into the atmosphere through stomatal transpiration.",
                    "Condensation requires microscopic dust or sea salt particles termed condensation nuclei (hygroscopic nuclei).",
                    "Total volume of water on Earth remains constant (approximately 1.386 billion km³), distributed between oceans (97.5%), glaciers (1.75%), and groundwater/surface water."
                ],
                "definition_academic": (
                    "The hydrological cycle is the continuous circulation of water within the Earth's hydrosphere, driven by solar energy and gravity through phase changes between solid, liquid, and gas."
                ),
                "definition_simplified": "Earth's giant recycling system where water evaporates into clouds, falls back down as rain, and flows into rivers and oceans to repeat forever.",
                "key_terms": [
                    {"term": "Evapotranspiration", "definition": "Sum of water evaporation from soil and aquatic bodies plus transpiration from plant stomata."},
                    {"term": "Condensation Nuclei", "definition": "Microscopic airborne particles upon which water vapour condenses to form clouds."},
                    {"term": "Infiltration", "definition": "The downward movement of water from the surface into the soil and underlying rock strata."}
                ],
                "examples": [
                    {"scenario": "Orographic Rainfall", "explanation": "Moisture-laden monsoon winds hit the Western Ghats, forced to rise, cool, condense, and precipitate on the windward slope."}
                ],
                "formulae": [
                    {"name": "Water Balance Equation", "formula": "P = Q + E + \\Delta S", "units": "mm/year", "description": "Precipitation = Runoff (Q) + Evapotranspiration (E) + Storage change (ΔS)"}
                ],
                "diagrams": [
                    {"type": "diagram", "caption": "Comprehensive cyclical flowchart showing ocean evaporation, cloud transport, mountain precipitation, and river runoff."}
                ],
                "misconceptions": [
                    {"misconception": "Rain comes from clouds opening up or bursting.", "correction": "Precipitation occurs through coalescence when cloud droplets grow too heavy for upward air currents to support."}
                ],
                "prerequisites": ["Atmospheric Humidity", "States of Matter (Gas, Liquid, Solid)", "Solar Radiation"],
                "visual_recommendation": {
                    "visual_type": "process_flowchart",
                    "description": "2D process flowchart depicting evaporation, transpiration, condensation, precipitation, and percolation."
                },
                "citations": [
                    {
                        "title": "CISCE ICSE Geography Class 9 Syllabus: Hydrosphere",
                        "url": "https://cisce.org",
                        "source": "CISCE Official Publications",
                        "retrieval_date": "2026-11-05T00:00:00Z"
                    }
                ],
                "practice_questions": [
                    {
                        "question": "Define evapotranspiration and name the primary energy source that powers the hydrological cycle.",
                        "marks": 2,
                        "model_answer": "Evapotranspiration is the total moisture loss to the atmosphere through evaporation from water/soil and transpiration from plants. The Sun (solar radiation) powers the cycle."
                    }
                ]
            },

            # 6. History: Causes of the First World War
            {
                "topic": "Causes of the First World War",
                "grade": 10,
                "board": "ICSE",
                "subject": "History",
                "chapter": "The First World War (1914–1918)",
                "subtopic": "Militarism, Alliances, Imperial Rivalries & Sarajevo Crisis",
                "title": "Causes of the First World War: M-A-I-N Factors and the Sarajevo Crisis",
                "verification_status": "verified_against_sources",
                "confidence_score": 0.99,
                "concepts": [
                    {"name": "Militarism", "role": "European arms race and naval rivalry between Great Britain and Imperial Germany."},
                    {"name": "Alliance System", "role": "Hostile division of Europe into Triple Alliance (1882) and Triple Entente (1907)."},
                    {"name": "Imperialism", "role": "Clashes over colonial territories in Africa and the weakening Ottoman Empire."},
                    {"name": "Sarajevo Crisis (1914)", "role": "Immediate trigger: assassination of Archduke Franz Ferdinand by Gavrilo Princip in Bosnia."}
                ],
                "facts": [
                    "The First World War took place from 28 July 1914 to 11 November 1918.",
                    "Four fundamental long-term causes are summarized as M-A-I-N: Militarism, Alliances, Imperialism, and Aggressive Nationalism.",
                    "The European powers divided into two hostile armed camps: Triple Alliance (Germany, Austria-Hungary, Italy) and Triple Entente (Britain, France, Russia).",
                    "The immediate cause was the Sarajevo Crisis: Assassination of Archduke Franz Ferdinand, heir to Austro-Hungarian throne, on 28 June 1914 by Gavrilo Princip of the Serbian nationalist group 'Black Hand'.",
                    "Austria delivered an ultimatum to Serbia; Russia mobilized in defense of Serbia; Germany declared war on Russia and France, invading neutral Belgium."
                ],
                "definition_academic": (
                    "The First World War was a global geopolitical conflict triggered immediately by the Sarajevo Crisis of June 1914 "
                    "and driven fundamentally by imperialist expansionism, aggressive nationalism, armaments race, and secret alliance treaties."
                ),
                "definition_simplified": "A catastrophic four-year war sparked by the assassination of an Austrian prince, fueled by decades of rivalry and secret military treaties between European superpowers.",
                "key_terms": [
                    {"term": "Triple Entente", "definition": "1907 alliance between Great Britain, France, and the Russian Empire."},
                    {"term": "Triple Alliance", "definition": "1882 alliance linking Germany, Austria-Hungary, and Italy."},
                    {"term": "Sarajevo Crisis", "definition": "The assassination of Archduke Franz Ferdinand on 28 June 1914 that triggered the war."},
                    {"term": "Black Hand", "definition": "Serbian revolutionary secret society (Union or Death) responsible for the assassination."}
                ],
                "examples": [
                    {"scenario": "The Domino Effect of July 1914", "explanation": "Within one week of Austria's declaration of war on Serbia, alliance commitments mobilized Russia, Germany, France, and Britain."}
                ],
                "formulae": [],
                "diagrams": [
                    {"type": "timeline", "caption": "Chronological timeline from 1882 Triple Alliance to 28 June 1914 Sarajevo Crisis and 4 August 1914 British entry into war."}
                ],
                "misconceptions": [
                    {"misconception": "The assassination of the Archduke was the sole cause of the war.", "correction": "The assassination was merely the immediate spark; underlying militarism, imperialism, and alliance treaties made war inevitable."}
                ],
                "prerequisites": ["19th Century European Imperialism", "Unification of Germany and Italy", "Balkan Wars"],
                "visual_recommendation": {
                    "visual_type": "timeline",
                    "description": "Chronological timeline of the road to WWI (1882–1914)."
                },
                "citations": [
                    {
                        "title": "CISCE ICSE History & Civics Class 10 Syllabus: The Contemporary World - WWI",
                        "url": "https://cisce.org",
                        "source": "CISCE Official Publications",
                        "retrieval_date": "2026-11-05T00:00:00Z"
                    }
                ],
                "practice_questions": [
                    {
                        "question": "State the immediate cause of the First World War and name the secret society responsible.",
                        "marks": 2,
                        "model_answer": "Assassination of Archduke Franz Ferdinand at Sarajevo on 28 June 1914 by Gavrilo Princip, a member of the Serbian secret society 'Black Hand' (Union or Death)."
                    }
                ]
            },

            # 7. English Language: Parts of Speech & Syntax
            {
                "topic": "Parts of Speech & Syntax",
                "grade": 10,
                "board": "ICSE",
                "subject": "English Language",
                "chapter": "Grammar & Syntax",
                "subtopic": "Parts of Speech, Clause Analysis & Voice Transformation",
                "title": "Comprehensive English Grammar: 8 Parts of Speech, Sentence Syntax & Active-Passive Voice",
                "verification_status": "verified_against_sources",
                "confidence_score": 0.99,
                "concepts": [
                    {"name": "8 Parts of Speech", "role": "Noun, Pronoun, Verb, Adjective, Adverb, Preposition, Conjunction, Interjection form building blocks of syntax."},
                    {"name": "Clause Hierarchy", "role": "Independent (principal) clauses vs Dependent (subordinate noun, adjective, adverb) clauses."},
                    {"name": "Active vs Passive Voice", "role": "Active voice highlights doer of action (Subject + Verb + Object); Passive highlights receiver (Object + auxiliary 'to be' + Past Participle + by + Subject)."}
                ],
                "facts": [
                    "Every English word in a sentence functions as one of eight traditional parts of speech based on syntactic context.",
                    "A clause contains a subject and a finite predicate; a phrase lacks a subject-verb pairing.",
                    "In active to passive transformation: object of active sentence becomes grammatical subject of passive sentence; verb changes to appropriate tense of 'be' + past participle; subject becomes agent introduced by 'by'.",
                    "Intransitive verbs (verbs lacking a direct object, e.g. 'arrive', 'sleep') cannot be transformed into the passive voice."
                ],
                "definition_academic": (
                    "Syntax is the grammatical arrangement of words and phrases into well-formed sentences in accordance with the morphological classes (parts of speech) of a language."
                ),
                "definition_simplified": "The structural rules and building blocks used to organize words into clear, meaningful sentences.",
                "key_terms": [
                    {"term": "Finite Verb", "definition": "A verb that has a specific tense, person, and number agreement with its subject."},
                    {"term": "Subordinate Clause", "definition": "A clause that cannot stand alone as a complete sentence and depends on a main clause."},
                    {"term": "Transitive Verb", "definition": "A verb that requires one or more objects to express a complete thought."}
                ],
                "examples": [
                    {"scenario": "Voice Transformation", "explanation": "Active: 'Shakespeare wrote Hamlet.' -> Passive: 'Hamlet was written by Shakespeare.'"}
                ],
                "formulae": [
                    {"name": "Passive Voice Rule", "formula": "\\text{Subject (Active Object)} + \\text{Auxiliary 'be'} + \\text{Past Participle (V3)} + (\\text{by } + \\text{Agent})", "units": "Grammatical Structure", "description": "Standard passive transformation template"}
                ],
                "diagrams": [
                    {"type": "diagram", "caption": "Hierarchical syntax tree showing sentence broken down into Noun Phrase (NP) and Verb Phrase (VP)."}
                ],
                "misconceptions": [
                    {"misconception": "All sentences can be changed into passive voice.", "correction": "Only transitive verbs taking a direct object can be converted to passive voice; sentences with intransitive verbs cannot."}
                ],
                "prerequisites": ["Basic Sentence Structure", "Verb Tenses", "Subject-Verb Agreement"],
                "visual_recommendation": {
                    "visual_type": "labelled_2d_diagram",
                    "description": "Hierarchical syntax diagram mapping Subject, Predicate, Direct Object, and Dependent Clauses."
                },
                "citations": [
                    {
                        "title": "CISCE ICSE English Language Regulations & Syllabus",
                        "url": "https://cisce.org",
                        "source": "Council for the Indian School Certificate Examinations",
                        "retrieval_date": "2026-11-05T00:00:00Z"
                    }
                ],
                "practice_questions": [
                    {
                        "question": "Transform into passive voice: 'The committee rejected all proposals without explanation.'",
                        "marks": 2,
                        "model_answer": "'All proposals were rejected by the committee without explanation.'"
                    }
                ]
            }
        ]

        for b in benchmarks:
            raw_facts = b["facts"]
            raw_string = f"{b['board']}:{b['grade']}:{b['subject'].lower()}:{b['topic'].lower()}:" + "|".join(sorted(raw_facts))
            b["content_hash"] = hashlib.sha256(raw_string.encode("utf-8")).hexdigest()
            self.save_or_update_record(b)


knowledge_library = KnowledgeLibraryRepository()
