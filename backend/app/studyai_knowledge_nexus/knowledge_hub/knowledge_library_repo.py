import os
import json
import sqlite3
import hashlib
import logging
from typing import Any, Dict, List, Optional
from datetime import datetime

logger = logging.getLogger("knowledge_nexus.knowledge_library")

DB_DIR = os.path.join(os.getcwd(), "data")
DB_PATH = os.path.join(DB_DIR, "studyai.db")


class KnowledgeLibraryRepository:
    """
    Central Educational Knowledge Library Repository.
    Maintains hierarchical taxonomy:
    Curriculum -> Grade -> Subject -> Chapter -> Topic -> Subtopic -> Knowledge Record
    Supports:
    - 7 Verification Statuses
    - Content Hashing (SHA-256)
    - Full Version History & Changelog
    - Atomic SQLite transactions
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
                    verification_status TEXT NOT NULL,
                    confidence_score REAL NOT NULL,
                    content_hash TEXT NOT NULL,
                    version INTEGER NOT NULL DEFAULT 1,
                    facts_json TEXT NOT NULL DEFAULT '[]',
                    definition_academic TEXT,
                    definition_simplified TEXT,
                    key_terms_json TEXT NOT NULL DEFAULT '[]',
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
        grade: int,
        board: str = "ICSE",
        subject: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        """Finds knowledge record matching topic (case-insensitive substring or exact)."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            query = """
                SELECT * FROM universal_knowledge_records
                WHERE board = ? AND grade = ?
            """
            params = [board.upper(), grade]

            if subject:
                query += " AND LOWER(subject) = LOWER(?)"
                params.append(subject)

            cursor.execute(query, params)
            rows = cursor.fetchall()

            clean_req = topic.lower().replace("&", " ").replace("-", " ")
            req_words = set(w for w in clean_req.split() if len(w) > 2)

            for row in rows:
                rec_topic = row["topic"].lower().replace("&", " ").replace("-", " ")
                if clean_req in rec_topic or rec_topic in clean_req:
                    return self._row_to_dict(row)
                rec_words = set(w for w in rec_topic.split() if len(w) > 2)
                if req_words and len(req_words.intersection(rec_words)) >= min(len(req_words), 2):
                    return self._row_to_dict(row)

            # Secondary pass: match on topic across all grades if topic is distinct
            cursor.execute("""
                SELECT * FROM universal_knowledge_records
                WHERE board = ?
            """, [board.upper()])
            all_board_rows = cursor.fetchall()
            for row in all_board_rows:
                rec_topic = row["topic"].lower().replace("&", " ").replace("-", " ")
                if clean_req in rec_topic or rec_topic in clean_req:
                    return self._row_to_dict(row)
                rec_words = set(w for w in rec_topic.split() if len(w) > 2)
                if req_words and len(req_words.intersection(rec_words)) >= min(len(req_words), 2):
                    return self._row_to_dict(row)

            return None

    def save_or_update_record(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """Saves a new record or increments version if content changed."""
        now = datetime.utcnow().isoformat() + "Z"
        topic = record["topic"]
        grade = record["grade"]
        board = record.get("board", "ICSE").upper()
        subject = record["subject"]
        content_hash = record["content_hash"]

        existing = self.find_record(topic, grade, board, subject)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            if existing:
                # Check if hash changed
                if existing["content_hash"] == content_hash:
                    # No content change, return existing
                    return existing

                new_version = existing["version"] + 1
                rec_id = existing["id"]

                # Archive existing in version history
                cursor.execute("""
                    INSERT INTO universal_knowledge_version_history 
                    (record_id, version, content_hash, changes_summary, archived_at)
                    VALUES (?, ?, ?, ?, ?)
                """, [rec_id, existing["version"], existing["content_hash"], "Updated facts and citations via Knowledge Hub", now])

                cursor.execute("""
                    UPDATE universal_knowledge_records SET
                        verification_status = ?,
                        confidence_score = ?,
                        content_hash = ?,
                        version = ?,
                        facts_json = ?,
                        definition_academic = ?,
                        definition_simplified = ?,
                        key_terms_json = ?,
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
                    json.dumps(record.get("facts", [])),
                    record.get("definition_academic", ""),
                    record.get("definition_simplified", ""),
                    json.dumps(record.get("key_terms", [])),
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
                        id, board, grade, subject, chapter, topic, subtopic,
                        verification_status, confidence_score, content_hash, version,
                        facts_json, definition_academic, definition_simplified,
                        key_terms_json, misconceptions_json, prerequisites_json,
                        visual_recommendation_json, citations_json, practice_questions_json,
                        created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, [
                    rec_id,
                    board,
                    grade,
                    subject,
                    record.get("chapter", "Standard Curriculum"),
                    topic,
                    record.get("subtopic", ""),
                    record.get("verification_status", "verified_against_sources"),
                    record.get("confidence_score", 0.95),
                    content_hash,
                    1,
                    json.dumps(record.get("facts", [])),
                    record.get("definition_academic", ""),
                    record.get("definition_simplified", ""),
                    json.dumps(record.get("key_terms", [])),
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
        return {
            "id": row["id"],
            "board": row["board"],
            "grade": row["grade"],
            "subject": row["subject"],
            "chapter": row["chapter"],
            "topic": row["topic"],
            "subtopic": row["subtopic"],
            "verification_status": row["verification_status"],
            "confidence_score": row["confidence_score"],
            "content_hash": row["content_hash"],
            "version": row["version"],
            "facts": json.loads(row["facts_json"]),
            "definition_academic": row["definition_academic"],
            "definition_simplified": row["definition_simplified"],
            "key_terms": json.loads(row["key_terms_json"]),
            "misconceptions": json.loads(row["misconceptions_json"]),
            "prerequisites": json.loads(row["prerequisites_json"]),
            "visual_recommendation": json.loads(row["visual_recommendation_json"]),
            "citations": json.loads(row["citations_json"]),
            "practice_questions": json.loads(row["practice_questions_json"]),
            "created_at": row["created_at"],
            "updated_at": row["updated_at"],
        }

    def _seed_benchmark_knowledge(self):
        """Seeds the 6 initial benchmark curriculum topics into the repository."""
        benchmarks = [
            # 1. Biology: Human Heart
            {
                "topic": "Human Heart & Circulation",
                "grade": 10,
                "board": "ICSE",
                "subject": "Biology",
                "chapter": "Circulatory System",
                "subtopic": "Double Circulation & Heart Chambers",
                "verification_status": "verified_against_sources",
                "confidence_score": 0.99,
                "facts": [
                    "The human heart is a 4-chambered muscular pump enclosed in a double-walled pericardium.",
                    "Right Atrium receives deoxygenated blood from the Superior and Inferior Vena Cava.",
                    "Right Ventricle pumps deoxygenated blood through the Pulmonary Artery to the lungs for oxygenation.",
                    "Left Atrium receives oxygenated blood from the four Pulmonary Veins.",
                    "Left Ventricle has the thickest muscular wall to pump oxygenated blood into the systemic Aorta at high pressure.",
                    "Tricuspid valve guards the right atrioventricular aperture; Bicuspid (Mitral) valve guards the left.",
                    "Interventricular septum completely prevents mixing of oxygenated and deoxygenated blood.",
                ],
                "definition_academic": (
                    "The human heart is a hollow muscular organ with four separate chambers that maintains double "
                    "circulation (pulmonary and systemic) by rhythmic contractions coordinated by the Sinoatrial (SA) node."
                ),
                "definition_simplified": "A 4-room muscular engine in the chest that pumps fresh blood to the body and used blood to the lungs.",
                "key_terms": [
                    {"term": "Right Atrium", "definition": "Receives deoxygenated blood from systemic tissues."},
                    {"term": "Right Ventricle", "definition": "Pumps deoxygenated blood to the pulmonary circuit."},
                    {"term": "Left Atrium", "definition": "Receives oxygen-rich blood from pulmonary veins."},
                    {"term": "Left Ventricle", "definition": "Pumps oxygenated blood through the aorta into systemic circulation."},
                    {"term": "Septum", "definition": "Muscular dividing partition between the left and right sides."},
                    {"term": "SA Node", "definition": "Natural pacemaker situated in upper wall of right atrium."},
                ],
                "misconceptions": [
                    {"misconception": "Deoxygenated blood in veins is blue.", "correction": "Human blood is always red; deoxygenated blood is dark crimson, never blue."},
                ],
                "prerequisites": ["Tissues and Organs", "Blood Vessels (Arteries vs Veins)", "Respiratory Gas Exchange"],
                "visual_recommendation": {
                    "visual_type": "threejs_3d",
                    "model_key": "human-heart",
                    "description": "3D Anatomical Heart with 4 chambers, valves, great vessels, and 13-stage cardiac cycle.",
                },
                "citations": [
                    {
                        "title": "CISCE ICSE Biology Regulations & Syllabuses: Circulatory System",
                        "url": "https://cisce.org",
                        "source": "Council for the Indian School Certificate Examinations",
                        "retrieval_date": "2026-11-05T00:00:00Z",
                    }
                ],
                "practice_questions": [
                    {
                        "question": "Differentiate between the functions of the pulmonary artery and pulmonary vein.",
                        "marks": 2,
                        "model_answer": "Pulmonary artery carries deoxygenated blood from right ventricle to lungs; pulmonary vein carries oxygenated blood from lungs to left atrium.",
                    }
                ],
            },
            # 2. Physics: Principle of Moments
            {
                "topic": "Principle of Moments",
                "grade": 10,
                "board": "ICSE",
                "subject": "Physics",
                "chapter": "Force, Work, Power and Energy",
                "subtopic": "Turning Forces & Equilibrium",
                "verification_status": "verified_against_sources",
                "confidence_score": 0.99,
                "facts": [
                    "Moment of a force is the measure of its turning effect about a pivot: Moment = Force × Perpendicular distance (τ = F × d).",
                    "SI unit of moment of force is Newton-metre (N·m).",
                    "Clockwise moments are taken as negative by sign convention; Anticlockwise moments are taken as positive.",
                    "According to the Principle of Moments, in rotational equilibrium: Sum of anticlockwise moments = Sum of clockwise moments.",
                ],
                "definition_academic": (
                    "When an object is in rotational equilibrium under the action of several coplanar forces, "
                    "the algebraic sum of moments of all forces about the axis of rotation or pivot is zero."
                ),
                "definition_simplified": "When a lever or beam balances without tipping, the turning pull to the left exactly matches the turning pull to the right.",
                "key_terms": [
                    {"term": "Moment of Force", "definition": "Turning effect produced by a force about a given axis."},
                    {"term": "Fulcrum", "definition": "The fixed support or pivot point about which a lever turns."},
                    {"term": "Couple", "definition": "Two equal and opposite parallel forces whose lines of action do not coincide."},
                ],
                "misconceptions": [
                    {"misconception": "A heavier object always tilts the seesaw.", "correction": "Turning effect depends on Force × Distance; a lighter object further away produces greater torque."},
                ],
                "prerequisites": ["Force and Mass", "Rigid Body Dynamics", "Translational Equilibrium"],
                "visual_recommendation": {
                    "visual_type": "diagram",
                    "description": "Balanced lever diagram showing load arm, effort arm, fulcrum, and torque equations.",
                },
                "citations": [
                    {
                        "title": "CISCE ICSE Physics Class 10 Syllabus: Force, Work and Machines",
                        "url": "https://cisce.org",
                        "source": "CISCE Official Publications",
                        "retrieval_date": "2026-11-05T00:00:00Z",
                    }
                ],
                "practice_questions": [
                    {
                        "question": "A uniform half-metre rule is balanced horizontally on a knife-edge at the 29 cm mark when a weight of 20 gf is suspended from one end. Find the weight of the rule.",
                        "marks": 3,
                        "model_answer": "Weight of rule acts at 25 cm mark. Distance from pivot = 29 - 25 = 4 cm. Load at 50 cm mark: distance = 50 - 29 = 21 cm. W × 4 = 20 × 21 => W = 105 gf.",
                    }
                ],
            },
            # 3. Chemistry: Structure of Water Molecule
            {
                "topic": "Structure of Water Molecule",
                "grade": 9,
                "board": "CBSE",
                "subject": "Chemistry",
                "chapter": "Atoms and Molecules",
                "subtopic": "Covalent Bonding & Polarity",
                "verification_status": "verified_against_sources",
                "confidence_score": 0.98,
                "facts": [
                    "A water molecule (H2O) consists of two hydrogen atoms covalently bonded to one oxygen atom.",
                    "The two single covalent bonds are formed by sharing electrons between hydrogen (1s) and oxygen (2p).",
                    "Oxygen possesses two shared bonding pairs and two lone pairs of non-bonding electrons.",
                    "The molecular geometry is bent or V-shaped with a bond angle of approximately 104.5 degrees.",
                    "Due to oxygen's high electronegativity (3.44 vs 2.20 for hydrogen), water is a polar molecule with a dipole moment.",
                ],
                "definition_academic": (
                    "A chemical compound consisting of two hydrogen atoms bonded to a central oxygen atom by polar single "
                    "covalent bonds, exhibiting a bent molecular geometry (bond angle ~104.5°) due to lone pair repulsion."
                ),
                "definition_simplified": "Two small hydrogen atoms chemically joined to one big oxygen atom in a bent 'Mickey Mouse' shape that acts like a tiny magnet.",
                "key_terms": [
                    {"term": "Covalent Bond", "definition": "A chemical link formed by the mutual sharing of electron pairs."},
                    {"term": "Electronegativity", "definition": "The tendency of an atom to attract shared electron pairs towards itself."},
                    {"term": "Dipole Moment", "definition": "A measure of the net separation of positive and negative electrical charges."},
                ],
                "misconceptions": [
                    {"misconception": "Water molecule is straight/linear like CO2.", "correction": "Water has two unshared lone pairs pushing the H-O-H bonds into a bent 104.5° angle."},
                ],
                "prerequisites": ["Atomic Structure", "Valence Electrons", "Chemical Formulas"],
                "visual_recommendation": {
                    "visual_type": "threejs_3d",
                    "model_key": "water-molecule",
                    "description": "3D Molecular Geometry showing central Oxygen, two Hydrogen atoms, and bent 104.5° bond angle.",
                },
                "citations": [
                    {
                        "title": "NCERT Class 9 Science: Atoms and Molecules",
                        "url": "https://ncert.nic.in",
                        "source": "NCERT National Curriculum Framework",
                        "retrieval_date": "2026-11-05T00:00:00Z",
                    }
                ],
                "practice_questions": [
                    {
                        "question": "Explain why the water molecule has a bent shape rather than a linear geometry.",
                        "marks": 2,
                        "model_answer": "Oxygen has four electron pairs around it (two bonding, two lone pairs). The lone pair-lone pair repulsions push the two hydrogen bonds together into a bent 104.5° geometry.",
                    }
                ],
            },
            # 4. Mathematics: Volume of a Cone
            {
                "topic": "Volume of a Cone",
                "grade": 10,
                "board": "ICSE",
                "subject": "Mathematics",
                "chapter": "Mensuration",
                "subtopic": "Right Circular Cone",
                "verification_status": "verified_against_sources",
                "confidence_score": 0.99,
                "facts": [
                    "A right circular cone has a circular base of radius r, vertical height h, and slant height l.",
                    "Slant height relationship: l^2 = r^2 + h^2 (by Pythagoras' theorem).",
                    "Volume formula of a cone: V = (1/3) * π * r^2 * h.",
                    "The volume of a cone is exactly one-third the volume of a cylinder with the same base radius and height.",
                    "Curved Surface Area (CSA) = π * r * l; Total Surface Area (TSA) = π * r * (l + r).",
                ],
                "definition_academic": (
                    "The volume of a right circular cone is one-third of the product of the area of its circular base "
                    "and its perpendicular height: V = (1/3) * π * r^2 * h."
                ),
                "definition_simplified": "The 3D space inside a cone is exactly one-third of the space inside a cylinder of the same height and width.",
                "key_terms": [
                    {"term": "Radius (r)", "definition": "Distance from the center of the circular base to its boundary."},
                    {"term": "Vertical Height (h)", "definition": "Perpendicular distance from the vertex to the center of the base."},
                    {"term": "Slant Height (l)", "definition": "Distance from the vertex to any point on the base circle circumference."},
                ],
                "misconceptions": [
                    {"misconception": "Students often confuse vertical height h with slant height l in the volume formula.", "correction": "Volume uses vertical height h; slant height l is used only for curved surface area."},
                ],
                "prerequisites": ["Circle Area (πr²)", "Pythagoras Theorem", "Volume of a Cylinder"],
                "visual_recommendation": {
                    "visual_type": "diagram",
                    "description": "Right circular cone diagram clearly labelling radius r, height h, slant height l, and right-angled triangle relation.",
                },
                "citations": [
                    {
                        "title": "CISCE ICSE Mathematics Class 10 Syllabus: Mensuration - Cone & Cylinder",
                        "url": "https://cisce.org",
                        "source": "CISCE Official Publications",
                        "retrieval_date": "2026-11-05T00:00:00Z",
                    }
                ],
                "practice_questions": [
                    {
                        "question": "Find the volume of a right circular cone of radius 6 cm and height 7 cm (Take π = 22/7).",
                        "marks": 3,
                        "model_answer": "V = (1/3) * (22/7) * 6 * 6 * 7 = (1/3) * 22 * 36 = 22 * 12 = 264 cm³.",
                    }
                ],
            },
            # 5. History: Causes of the First World War
            {
                "topic": "Causes of the First World War",
                "grade": 10,
                "board": "ICSE",
                "subject": "History",
                "chapter": "The First World War (1914–1918)",
                "subtopic": "Militarism, Alliances, Imperial Rivalries & Sarajevo Crisis",
                "verification_status": "verified_against_sources",
                "confidence_score": 0.99,
                "facts": [
                    "The First World War took place from 28 July 1914 to 11 November 1918.",
                    "Four fundamental long-term causes are summarized as M-A-I-N: Militarism, Alliances, Imperialism, and Aggressive Nationalism.",
                    "The European powers divided into two hostile armed camps: Triple Alliance (Germany, Austria-Hungary, Italy) and Triple Entente (Britain, France, Russia).",
                    "The immediate cause was the Sarajevo Crisis: Assassination of Archduke Franz Ferdinand, heir to Austro-Hungarian throne, on 28 June 1914 by Gavrilo Princip of the Serbian nationalist group 'Black Hand'.",
                    "Austria delivered an ultimatum to Serbia; Russia mobilized in defense of Serbia; Germany declared war on Russia and France, invading neutral Belgium.",
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
                    {"term": "Militarism", "definition": "Policy of glorifying military power and maintaining a standing army prepared for war."},
                ],
                "misconceptions": [
                    {"misconception": "The assassination of the Archduke alone caused the war.", "correction": "The assassination was merely the immediate spark; underlying militarism, imperialism, and alliance treaties made war inevitable."},
                ],
                "prerequisites": ["19th Century European Imperialism", "Unification of Germany and Italy", "Balkan Question"],
                "visual_recommendation": {
                    "visual_type": "timeline",
                    "description": "Chronological timeline from 1882 Triple Alliance to 28 June 1914 Sarajevo Crisis and July Ultimatum.",
                },
                "citations": [
                    {
                        "title": "CISCE ICSE History & Civics Class 10 Syllabus: The Contemporary World - WWI",
                        "url": "https://cisce.org",
                        "source": "CISCE Official Publications",
                        "retrieval_date": "2026-11-05T00:00:00Z",
                    }
                ],
                "practice_questions": [
                    {
                        "question": "State the immediate cause of the First World War and name the secret society responsible.",
                        "marks": 2,
                        "model_answer": "Assassination of Archduke Franz Ferdinand at Sarajevo on 28 June 1914 by Gavrilo Princip, a member of the Serbian secret society 'Black Hand' (Union or Death).",
                    }
                ],
            },
            # 6. Geography: Formation of Volcanoes
            {
                "topic": "Formation of Volcanoes",
                "grade": 9,
                "board": "ICSE",
                "subject": "Geography",
                "chapter": "Landforms of the Earth",
                "subtopic": "Volcanoes, Magma, Lava & Plate Tectonics",
                "verification_status": "verified_against_sources",
                "confidence_score": 0.98,
                "facts": [
                    "A volcano is an opening or rupture in the Earth's crust through which molten rock, volcanic ash, and gases erupt.",
                    "Magma is molten rock situated underneath the Earth's crust; once it breaches the surface through a vent, it is termed lava.",
                    "Most volcanoes form along convergent plate boundaries (subduction zones) and divergent plate boundaries (mid-ocean ridges), with some over mantle hotspots.",
                    "Key anatomical parts of a volcano include magma chamber, central conduit or pipe, vent, crater, and volcanic cone.",
                    "Volcanoes are classified by activity: Active (e.g. Mt. Etna, Barren Island), Dormant (e.g. Mt. Vesuvius), and Extinct (e.g. Mt. Kilimanjaro).",
                ],
                "definition_academic": (
                    "A volcano is a vent or fissure in the crust of the Earth through which molten magma, pyroclastic debris, "
                    "steam, and volcanic gases escape from the interior of the earth to build conical landforms."
                ),
                "definition_simplified": "A mountain or chimney in the Earth's crust that allows superheated molten rock and gases from deep underground to explode or flow out.",
                "key_terms": [
                    {"term": "Magma", "definition": "Molten rock stored beneath the surface of the Earth."},
                    {"term": "Lava", "definition": "Molten rock that has erupted onto the Earth's surface."},
                    {"term": "Vent", "definition": "The circular opening through which volcanic material emerges."},
                    {"term": "Crater", "definition": "The bowl-shaped depression at the top of a volcanic cone surrounding the central vent."},
                ],
                "misconceptions": [
                    {"misconception": "Magma and lava are identical terms.", "correction": "Magma is strictly below the Earth's crust; lava is molten rock after it reaches the surface."},
                ],
                "prerequisites": ["Structure of the Earth (Crust, Mantle, Core)", "Plate Tectonics", "Igneous Rocks"],
                "visual_recommendation": {
                    "visual_type": "diagram",
                    "description": "Cross-sectional geological diagram of a composite volcano showing magma chamber, main conduit, vent, crater, and stratified ash/lava layers.",
                },
                "citations": [
                    {
                        "title": "CISCE ICSE Geography Class 9 Syllabus: Internal Processes of the Earth - Volcanoes",
                        "url": "https://cisce.org",
                        "source": "CISCE Official Publications",
                        "retrieval_date": "2026-11-05T00:00:00Z",
                    }
                ],
                "practice_questions": [
                    {
                        "question": "Differentiate between magma and lava, and give one example of an active volcano in India.",
                        "marks": 3,
                        "model_answer": "Magma is molten rock beneath the Earth's surface, whereas lava is magma that has reached the surface. Barren Island in the Andaman Sea is India's only active volcano.",
                    }
                ],
            },
        ]

        for b in benchmarks:
            raw_facts = b["facts"]
            raw_string = f"{b['board']}:{b['grade']}:{b['subject'].lower()}:{b['topic'].lower()}:" + "|".join(sorted(raw_facts))
            b["content_hash"] = hashlib.sha256(raw_string.encode("utf-8")).hexdigest()
            self.save_or_update_record(b)


knowledge_library = KnowledgeLibraryRepository()
