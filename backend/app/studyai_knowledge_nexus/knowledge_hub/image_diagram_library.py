import os
import json
import sqlite3
import uuid
import logging
from typing import Any, Dict, List, Optional
from datetime import datetime

logger = logging.getLogger("knowledge_nexus.image_library")

DATA_DIR = os.path.join(os.getcwd(), "data")
DB_PATH = os.path.join(DATA_DIR, "studyai.sqlite")

VALID_IMAGE_CATEGORIES = [
    "retrieved_image",
    "ai_generated_image",
    "generated_diagram",
    "threejs_model_reference",
    "student_uploaded_image"
]


class EducationalImageLibrary:
    """
    Dedicated Shared Image & Educational Diagram Library.
    Maintains 5 distinct asset classes:
    1. Retrieved images (from authorized educational sources).
    2. AI-generated educational images (photorealistic or stylized pedagogical renders).
    3. Generated diagrams (procedural SVG/Mermaid/Canvas diagrams).
    4. Three.js model references (declarative 3D interactive model assets).
    5. Student-uploaded images (diagram photos, textbook scan uploads).
    """

    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        self._init_db()
        self._seed_benchmark_images()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS educational_image_library (
                    id TEXT PRIMARY KEY,
                    topic TEXT NOT NULL,
                    subject TEXT NOT NULL,
                    category TEXT NOT NULL,
                    title TEXT NOT NULL,
                    description TEXT NOT NULL,
                    source_method TEXT NOT NULL,
                    source_url TEXT,
                    asset_url TEXT,
                    svg_content TEXT,
                    model_key TEXT,
                    license_info TEXT NOT NULL DEFAULT 'Educational Fair Use',
                    verification_status TEXT NOT NULL DEFAULT 'verified',
                    related_knowledge_id TEXT,
                    metadata_json TEXT NOT NULL DEFAULT '{}',
                    created_at TEXT NOT NULL
                )
            """)
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_eil_topic_subj
                ON educational_image_library(topic, subject, category)
            """)
            conn.commit()

    def add_asset(
        self,
        topic: str,
        subject: str,
        category: str,
        title: str,
        description: str,
        source_method: str,
        source_url: Optional[str] = None,
        asset_url: Optional[str] = None,
        svg_content: Optional[str] = None,
        model_key: Optional[str] = None,
        license_info: str = "Educational Fair Use",
        verification_status: str = "verified",
        related_knowledge_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Inserts an image/diagram asset into the shared repository."""
        if category not in VALID_IMAGE_CATEGORIES:
            raise ValueError(f"Invalid category '{category}'. Must be one of {VALID_IMAGE_CATEGORIES}")

        asset_id = f"img-{category[:4]}-{uuid.uuid4().hex[:8]}"
        now = datetime.utcnow().isoformat() + "Z"

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO educational_image_library (
                    id, topic, subject, category, title, description, source_method,
                    source_url, asset_url, svg_content, model_key, license_info,
                    verification_status, related_knowledge_id, metadata_json, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, [
                asset_id,
                topic,
                subject,
                category,
                title,
                description,
                source_method,
                source_url,
                asset_url,
                svg_content,
                model_key,
                license_info,
                verification_status,
                related_knowledge_id,
                json.dumps(metadata or {}),
                now
            ])
            conn.commit()

        return self.get_asset(asset_id) or {}

    def get_asset(self, asset_id: str) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM educational_image_library WHERE id = ?", [asset_id])
            row = cursor.fetchone()
            return self._row_to_dict(row) if row else None

    def find_assets_for_topic(
        self,
        topic: str,
        subject: Optional[str] = None,
        category: Optional[str] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Finds matching assets by topic keyword, subject, and category."""
        clean_t = topic.lower()
        query = "SELECT * FROM educational_image_library WHERE 1=1"
        params: List[Any] = []

        if subject:
            query += " AND LOWER(subject) = LOWER(?)"
            params.append(subject)

        if category:
            query += " AND category = ?"
            params.append(category)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            rows = cursor.fetchall()

            matched = []
            for r in rows:
                d = self._row_to_dict(r)
                if d["topic"].lower() in clean_t or clean_t in d["topic"].lower():
                    matched.append(d)
                elif any(word in d["title"].lower() for word in clean_t.split() if len(word) > 3):
                    matched.append(d)

            return matched[:limit]

    def _row_to_dict(self, row: sqlite3.Row) -> Dict[str, Any]:
        return {
            "id": row["id"],
            "topic": row["topic"],
            "subject": row["subject"],
            "category": row["category"],
            "title": row["title"],
            "description": row["description"],
            "source_method": row["source_method"],
            "source_url": row["source_url"],
            "asset_url": row["asset_url"],
            "svg_content": row["svg_content"],
            "model_key": row["model_key"],
            "license_info": row["license_info"],
            "verification_status": row["verification_status"],
            "related_knowledge_id": row["related_knowledge_id"],
            "metadata": json.loads(row["metadata_json"]),
            "created_at": row["created_at"]
        }

    def _seed_benchmark_images(self):
        """Seeds standard visual benchmarks across the 5 categories."""
        benchmarks = [
            {
                "topic": "Human Heart & Circulation",
                "subject": "Biology",
                "category": "threejs_model_reference",
                "title": "Interactive 3D Anatomical Human Heart",
                "description": "Photorealistic 3D PBR Heart model with 4 chambers, 4 valves, great vessels, and 13-stage blood flow.",
                "source_method": "Three.js Scientific Procedural Mesh Engine",
                "model_key": "human-heart",
                "verification_status": "verified_against_sources"
            },
            {
                "topic": "Geometrical Constructions",
                "subject": "Mathematics",
                "category": "generated_diagram",
                "title": "4-Step Ruler & Compass Triangle SSS Construction",
                "description": "Step-by-step 2D Euclidean compass arcs and ruler drafting for Triangle ABC.",
                "source_method": "STUDYAI Deterministic Geometry Construction Engine",
                "svg_content": "<svg viewBox='0 0 600 400'>...</svg>",
                "verification_status": "verified_against_sources"
            },
            {
                "topic": "Chemical Bonding",
                "subject": "Chemistry",
                "category": "threejs_model_reference",
                "title": "3D Polar Covalent Water Molecule",
                "description": "Interactive Three.js 3D VSEPR Bent Geometry with 104.5° bond angle and partial dipole charges.",
                "source_method": "Three.js Chemical Geometry Engine",
                "model_key": "water-molecule",
                "verification_status": "verified_against_sources"
            },
            {
                "topic": "Water Cycle",
                "subject": "Geography",
                "category": "generated_diagram",
                "title": "Global Hydrological Cycle Process Flowchart",
                "description": "Cyclical diagram showing evaporation, transpiration, condensation, precipitation, and runoff.",
                "source_method": "SVG Diagram Engine",
                "svg_content": "<svg viewBox='0 0 800 500'>...</svg>",
                "verification_status": "verified_against_sources"
            },
            {
                "topic": "Causes of the First World War",
                "subject": "History",
                "category": "generated_diagram",
                "title": "Road to WWI Chronological Timeline (1882-1914)",
                "description": "Sequential timeline mapping Triple Alliance, Triple Entente, Sarajevo Crisis, and July Ultimatum.",
                "source_method": "Timeline SVG Generator",
                "svg_content": "<svg viewBox='0 0 900 300'>...</svg>",
                "verification_status": "verified_against_sources"
            },
            {
                "topic": "Work, Power and Energy",
                "subject": "Physics",
                "category": "ai_generated_image",
                "title": "Energy Conversion in a Free-Falling Body",
                "description": "Diagrammatic visual illustration showing continuous conversion of PE to KE.",
                "source_method": "AI Pedagogical Visual Renderer",
                "asset_url": "/assets/illustrations/physics_work_energy.png",
                "verification_status": "verified_against_sources"
            }
        ]

        with self._get_connection() as conn:
            cursor = conn.cursor()
            for b in benchmarks:
                cursor.execute(
                    "SELECT id FROM educational_image_library WHERE topic = ? AND title = ?",
                    [b["topic"], b["title"]]
                )
                if not cursor.fetchone():
                    self.add_asset(**b)


image_diagram_library = EducationalImageLibrary()
