import re
import logging
from typing import Any, Dict, List, Optional, Tuple
from pydantic import BaseModel, Field

from backend.app.studyai_knowledge_nexus.core.question_type_classifier import (
    question_type_classifier, QuestionClassificationResult
)
from backend.app.studyai_knowledge_nexus.curriculum.icse_database import icse_db

logger = logging.getLogger("knowledge_nexus.subject_classifier")


class SubjectClassificationResult(BaseModel):
    board: str = "ICSE"
    grade: int = 10
    subject: str
    matched_chapter: str
    topic: str
    subtopic: str
    question_type: str
    question_type_display: str
    explanation_depth: str
    required_answer_format: str
    visual_beneficial: bool
    is_3d_necessary: bool
    confidence_score: float
    confidence_tier: str  # 'high', 'medium', 'low'
    clarification_needed: bool = False
    clarification_prompt: Optional[str] = None
    suggested_subjects: List[str] = Field(default_factory=list)
    is_follow_up: bool = False
    recommended_books: List[str] = Field(default_factory=list)
    curriculum_found: bool = False

    def to_dict(self) -> Dict[str, Any]:
        return {
            "board": self.board,
            "grade": self.grade,
            "subject": self.subject,
            "matched_chapter": self.matched_chapter,
            "topic": self.topic,
            "subtopic": self.subtopic,
            "question_type": self.question_type,
            "question_type_display": self.question_type_display,
            "explanation_depth": self.explanation_depth,
            "required_answer_format": self.required_answer_format,
            "visual_beneficial": self.visual_beneficial,
            "is_3d_necessary": self.is_3d_necessary,
            "confidence_score": self.confidence_score,
            "confidence_tier": self.confidence_tier,
            "clarification_needed": self.clarification_needed,
            "clarification_prompt": self.clarification_prompt,
            "suggested_subjects": self.suggested_subjects,
            "is_follow_up": self.is_follow_up,
            "recommended_books": self.recommended_books,
            "curriculum_found": self.curriculum_found,
        }

    def get(self, key: str, default: Any = None) -> Any:
        return getattr(self, key, default)

    def __getitem__(self, item):
        return getattr(self, item)


class SubjectTopicIntelligenceEngine:
    """
    Dedicated Subject and Topic Intelligence Engine.
    Accurately classifies queries across 10 distinct educational subjects:
    1. Mathematics
    2. Physics
    3. Chemistry
    4. Biology
    5. History
    6. Geography
    7. Civics
    8. English Language
    9. English Literature
    10. Computer Science
    
    Includes:
    - Multi-tiered keyword & semantic pattern matching
    - Follow-up context preservation (session memory)
    - 23 question type identification
    - Explicit confidence scoring (High / Medium / Low with clarification)
    - Automated 3D gatekeeping determination
    """

    SUBJECTS = [
        "Mathematics",
        "Physics",
        "Chemistry",
        "Biology",
        "History",
        "Geography",
        "Civics",
        "English Language",
        "English Literature",
        "Computer Science",
    ]

    # Weighted vocabulary dictionary for high-precision identification
    SUBJECT_LEXICON: Dict[str, Dict[str, float]] = {
        "Mathematics": {
            "math": 2.0, "maths": 2.0, "mathematics": 2.0, "solve": 1.0, "equation": 1.5,
            "quadratic": 2.5, "algebra": 2.0, "matrix": 2.5, "matrices": 2.5, "gst": 2.0,
            "banking": 1.8, "shares": 1.5, "dividend": 1.5, "linear inequation": 2.5,
            "factorisation": 2.0, "remainder theorem": 2.5, "factor theorem": 2.5,
            "ratio and proportion": 2.0, "arithmetic progression": 2.5, "geometric progression": 2.5,
            "ap": 1.2, "gp": 1.2, "reflection": 1.2, "section formula": 2.5, "midpoint": 2.0,
            "equation of a line": 2.5, "slope": 2.0, "intercept": 2.0, "similarity": 2.0,
            "locus": 2.5, "circles": 2.0, "tangents": 2.0, "chord": 2.0, "cyclic quadrilateral": 2.5,
            "constructions": 2.0, "mensuration": 2.5, "cylinder": 2.0, "cone": 2.0, "sphere": 2.0,
            "hemisphere": 2.0, "trigonometry": 2.5, "trigonometric": 2.5, "sin": 1.8, "cos": 1.8,
            "tan": 1.8, "sec": 1.8, "cosec": 1.8, "cot": 1.8, "heights and distances": 2.5,
            "statistics": 2.0, "mean": 1.5, "median": 1.5, "mode": 1.5, "ogive": 2.5,
            "histogram": 2.0, "probability": 2.2, "pythagoras": 2.0, "pythagorean": 2.0,
            "derivative": 2.0, "integral": 2.0, "calculus": 2.5, "geometry": 2.0, "theorem": 1.8,
            "polynomial": 2.0, "rhombus": 2.0, "trapezium": 2.0, "hypotenuse": 2.0,
        },
        "Physics": {
            "physics": 2.5, "force": 1.8, "work": 1.5, "power": 1.5, "energy": 1.5,
            "joule": 2.0, "newton": 2.0, "turning effect": 2.5, "moment of force": 2.5,
            "torque": 2.5, "couple": 2.0, "equilibrium": 2.0, "centre of gravity": 2.5,
            "uniform circular motion": 2.5, "centripetal": 2.5, "centrifugal": 2.5,
            "machines": 2.0, "pulley": 2.5, "lever": 2.5, "mechanical advantage": 2.5,
            "velocity ratio": 2.5, "efficiency": 2.0, "block and tackle": 2.5,
            "refraction": 2.5, "snell's law": 3.0, "refractive index": 2.5, "prism": 2.5,
            "total internal reflection": 3.0, "critical angle": 2.5, "lens": 2.2, "convex lens": 2.5,
            "concave lens": 2.5, "focal length": 2.5, "magnification": 2.0, "spectrum": 2.0,
            "dispersion": 2.5, "electromagnetic spectrum": 2.5, "infrared": 2.0, "ultraviolet": 2.0,
            "sound": 1.8, "echo": 2.5, "sonar": 2.5, "radar": 2.0, "resonance": 2.5,
            "vibrations": 2.0, "amplitude": 2.0, "pitch": 2.0, "loudness": 2.0, "frequency": 2.0,
            "current electricity": 2.5, "ohm's law": 3.0, "resistance": 2.2, "resistivity": 2.5,
            "resistors": 2.2, "series and parallel": 2.2, "emf": 2.5, "internal resistance": 2.5,
            "electrical power": 2.2, "kilowatt-hour": 2.5, "kwh": 2.5, "household circuits": 2.5,
            "fuse": 2.0, "earthing": 2.5, "three-pin plug": 2.5, "magnetic effect": 2.5,
            "electromagnet": 2.2, "lorentz force": 2.5, "fleming's left hand rule": 3.0,
            "electromagnetic induction": 2.8, "faraday's law": 3.0, "lenz's law": 3.0,
            "transformer": 2.5, "calorimetry": 3.0, "heat capacity": 2.5, "specific heat": 2.5,
            "latent heat": 2.5, "radioactivity": 2.8, "alpha particle": 2.5, "beta particle": 2.5,
            "gamma radiation": 2.5, "half-life": 2.5, "nuclear fission": 2.5, "nuclear fusion": 2.5,
            "isotopes": 1.5, "isobars": 1.5, "background radiation": 2.5,
        },
        "Chemistry": {
            "chemistry": 2.5, "periodic table": 2.5, "periodic properties": 2.5, "atomic radius": 2.0,
            "ionisation potential": 2.5, "electron affinity": 2.5, "electronegativity": 2.5,
            "chemical bonding": 2.5, "electrovalent": 2.5, "ionic bond": 2.5, "covalent bond": 2.5,
            "coordinate bond": 2.5, "lone pair": 2.5, "electron dot": 2.2, "lewis structure": 2.5,
            "acids": 2.0, "bases": 2.0, "salts": 2.0, "ph scale": 2.5, "neutralisation": 2.0,
            "analytical chemistry": 2.5, "sodium hydroxide": 2.0, "ammonium hydroxide": 2.0,
            "precipitate": 2.0, "mole concept": 3.0, "stoichiometry": 3.0, "avogadro": 2.8,
            "vapour density": 2.5, "empirical formula": 2.5, "molecular formula": 2.5,
            "electrolysis": 2.8, "electrolyte": 2.5, "cathode": 2.2, "anode": 2.2,
            "electroplating": 2.5, "electro-refining": 2.5, "hall-heroult": 3.0,
            "metallurgy": 2.5, "ores": 2.0, "bauxite": 2.5, "blast furnace": 2.5, "roasting": 2.2,
            "calcination": 2.2, "alloys": 2.0, "amalgam": 2.2, "hydrogen chloride": 2.5,
            "fountain experiment": 3.0, "hydrochloric acid": 2.2, "ammonia": 2.5, "haber process": 3.0,
            "nitric acid": 2.5, "ostwald process": 3.0, "aqua regia": 2.5, "brown ring test": 3.0,
            "sulphuric acid": 2.5, "contact process": 3.0, "dehydrating agent": 2.5,
            "organic chemistry": 2.5, "hydrocarbons": 2.5, "alkanes": 2.5, "alkenes": 2.5,
            "alkynes": 2.5, "methane": 2.2, "ethane": 2.2, "ethene": 2.2, "ethyne": 2.2,
            "isomerism": 2.5, "functional group": 2.5, "alcohol": 2.0, "carboxylic acid": 2.5,
            "esterification": 2.5, "addition reaction": 2.2, "substitution reaction": 2.2,
        },
        "Biology": {
            "biology": 2.5, "biological": 2.0, "cell": 1.8, "cell division": 2.5, "mitosis": 3.0,
            "meiosis": 3.0, "chromosomes": 2.5, "dna": 2.5, "nucleotide": 2.2, "gene": 2.0,
            "genetics": 2.5, "mendel": 2.8, "monohybrid": 2.8, "dihybrid": 2.8, "phenotype": 2.5,
            "genotype": 2.5, "punnett square": 2.8, "absorption by roots": 2.8, "osmosis": 2.5,
            "diffusion": 2.0, "turgidity": 2.5, "flaccidity": 2.5, "plasmolysis": 2.8, "xylem": 2.2,
            "phloem": 2.2, "root hair": 2.2, "transpiration": 2.8, "stomata": 2.2, "potometer": 2.8,
            "guttation": 2.8, "bleeding": 2.0, "photosynthesis": 2.8, "chloroplast": 2.5,
            "chlorophyll": 2.2, "light reaction": 2.5, "dark reaction": 2.5, "calvin cycle": 2.5,
            "photolysis": 2.8, "circulatory system": 2.5, "heart": 2.2, "human heart": 3.0,
            "cardiac": 2.5, "atrium": 2.5, "ventricle": 2.5, "aorta": 2.5, "pulmonary": 2.5,
            "bicuspid": 2.8, "tricuspid": 2.8, "semilunar": 2.8, "double circulation": 3.0,
            "blood pressure": 2.0, "systole": 2.5, "diastole": 2.5, "blood groups": 2.2,
            "rh factor": 2.5, "excretory system": 2.5, "kidney": 2.5, "nephron": 3.0, "ultrafiltration": 3.0,
            "selective reabsorption": 2.8, "dialysis": 2.5, "urine": 2.0, "nervous system": 2.5,
            "neuron": 2.8, "synapse": 2.8, "reflex arc": 2.8, "brain": 2.0, "cerebrum": 2.5,
            "cerebellum": 2.5, "medulla": 2.5, "spinal cord": 2.2, "eye": 2.0, "retina": 2.5,
            "cornea": 2.2, "myopia": 2.5, "hypermetropia": 2.5, "endocrine system": 2.5,
            "hormone": 2.2, "pituitary": 2.5, "thyroid": 2.5, "thyroxine": 2.5, "pancreas": 2.0,
            "insulin": 2.5, "glucagon": 2.5, "adrenal": 2.5, "adrenaline": 2.5, "reproductive system": 2.5,
            "fertilisation": 2.2, "menstrual cycle": 2.5, "placenta": 2.5, "population": 1.5,
        },
        "History": {
            "history": 2.5, "historical": 2.0, "revolt of 1857": 3.5, "first war of independence": 3.5,
            "doctrine of lapse": 3.0, "dalhousie": 2.8, "mangalpande": 3.0, "meerut": 2.5,
            "nana saheb": 2.8, "rani laxmi bai": 2.8, "bahadur shah zafar": 2.8, "growth of nationalism": 2.8,
            "raja rammohan roy": 2.8, "jyotirao phule": 2.8, "brahmo samaj": 2.8, "indian national congress": 3.0,
            "inc": 1.8, "a.o. hume": 2.8, "w.c. bonnerjee": 2.8, "early nationalists": 3.0,
            "moderates": 2.2, "dadabhai naoroji": 2.8, "gopal krishna gokhale": 2.8, "drain theory": 3.0,
            "assertive nationalists": 3.0, "radicals": 2.0, "bal gangadhar tilak": 2.8, "bipin chandra pal": 2.8,
            "lala lajpat rai": 2.8, "lal bal pal": 3.0, "partition of bengal": 3.0, "lord curzon": 2.8,
            "swadeshi": 3.0, "boycott": 2.5, "surat split": 3.0, "muslim league": 3.0,
            "aga khan": 2.8, "lucknow pact": 3.0, "home rule": 2.5, "national movement": 2.8,
            "mahatma gandhi": 2.5, "gandhian era": 3.0, "satyagraha": 3.0, "champaran": 2.8,
            "rowlatt act": 3.0, "jallianwala bagh": 3.5, "khilafat movement": 3.0,
            "non-cooperation movement": 3.5, "chauri chaura": 3.5, "simon commission": 3.0,
            "lahore session": 3.0, "poorna swaraj": 3.0, "civil disobedience": 3.5, "dandi march": 3.5,
            "gandhi-irwin pact": 3.0, "round table conferences": 3.0, "quit india movement": 3.5,
            "subhas chandra bose": 3.0, "ina": 2.8, "indian national army": 3.0, "forward bloc": 3.0,
            "cabinet mission": 3.0, "mountbatten plan": 3.0, "indian independence act 1947": 3.5,
            "first world war": 3.5, "causes of first world war": 3.5, "triple alliance": 3.0,
            "triple entente": 3.0, "sarajevo crisis": 3.5, "archduke franz ferdinand": 3.5,
            "treaty of versailles": 3.5, "league of nations": 3.0, "rise of dictatorships": 3.0,
            "fascism": 3.0, "mussolini": 3.0, "nazism": 3.0, "hitler": 3.0, "second world war": 3.5,
            "axis powers": 2.8, "allied powers": 2.5, "invasion of poland": 3.5, "pearl harbor": 3.5,
            "hiroshima": 3.0, "nagasaki": 3.0, "united nations": 2.8, "non-aligned movement": 3.0,
            "nam": 2.0, "jawaharlal nehru": 2.5, "josip broz tito": 2.8, "gamal abdel nasser": 2.8,
        },
        "Geography": {
            "geography": 2.5, "geographical": 2.0, "topographical maps": 3.0, "topo sheet": 3.0,
            "contour": 2.8, "contour interval": 2.8, "grid reference": 2.8, "four-figure": 2.8,
            "six-figure": 2.8, "drainage pattern": 2.5, "dendritic": 2.8, "trellised": 2.8,
            "radial": 2.8, "settlement pattern": 2.5, "nucleated": 2.5, "dispersed": 2.5,
            "climate of india": 2.8, "monsoon": 2.8, "southwest monsoon": 3.0, "northeast monsoon": 3.0,
            "western disturbances": 3.0, "coriolis effect": 2.2, "jet streams": 2.5,
            "loo": 2.5, "kalbaisakhi": 2.8, "mango showers": 2.8, "soils of india": 2.8,
            "alluvial soil": 3.0, "black soil": 3.0, "regur": 3.0, "red soil": 2.8, "laterite soil": 3.0,
            "soil erosion": 2.5, "sheet erosion": 2.8, "gully erosion": 2.8, "soil conservation": 2.5,
            "natural vegetation": 2.8, "tropical evergreen": 3.0, "tropical deciduous": 3.0,
            "monsoon forests": 2.8, "thorn forests": 2.8, "mangrove": 2.8, "sundarbans": 2.8,
            "mountain forests": 2.5, "afforestation": 2.2, "water resources": 2.5, "irrigation": 2.5,
            "canals": 2.2, "wells and tubewells": 2.5, "tanks": 2.2, "drip irrigation": 2.5,
            "sprinkler irrigation": 2.5, "rainwater harvesting": 2.5, "mineral resources": 2.5,
            "iron ore": 2.5, "bauxite ore": 2.2, "manganese": 2.2, "copper": 2.0, "coal": 2.2,
            "gondwana coal": 2.8, "petroleum": 2.2, "mumbai high": 2.8, "natural gas": 2.0,
            "hydel power": 2.2, "bhakra nangal": 2.8, "hirakud": 2.8, "solar power": 2.0,
            "agriculture in india": 2.8, "kharif": 3.0, "rabi": 3.0, "zaid": 2.8, "rice": 2.2,
            "wheat": 2.2, "millets": 2.2, "sugarcane": 2.2, "cotton": 2.2, "jute": 2.2, "tea": 2.2,
            "coffee": 2.2, "manufacturing industries": 2.5, "tata iron and steel": 2.8, "tisco": 2.8,
            "transport in india": 2.5, "golden quadrilateral": 3.0, "railways": 2.0, "waste management": 2.5,
        },
        "Civics": {
            "civics": 3.0, "constitution": 2.8, "parliament": 3.0, "union parliament": 3.2,
            "lok sabha": 3.2, "rajya sabha": 3.2, "speaker": 2.8, "speaker of lok sabha": 3.2,
            "presiding officer": 2.5, "quorum": 3.0, "question hour": 3.0, "zero hour": 3.0,
            "adjournment motion": 3.0, "no-confidence motion": 3.2, "money bill": 3.2, "ordinary bill": 2.8,
            "casting vote": 2.8, "prorogation": 2.8, "dissolution": 2.8, "union executive": 3.0,
            "president of india": 3.2, "powers of president": 3.0, "electoral college": 3.2,
            "impeachment of president": 3.5, "ordinance": 3.0, "executive powers": 2.8,
            "emergency powers": 3.0, "vice president": 2.8, "prime minister": 3.0,
            "council of ministers": 3.0, "cabinet": 3.0, "collective responsibility": 3.5,
            "individual responsibility": 3.0, "judiciary": 2.8, "supreme court of india": 3.5,
            "chief justice of india": 3.0, "original jurisdiction": 3.5, "appellate jurisdiction": 3.5,
            "advisory jurisdiction": 3.2, "judicial review": 3.5, "court of record": 3.2,
            "writ": 3.2, "habeas corpus": 3.5, "mandamus": 3.5, "certiorari": 3.5, "prohibition": 3.0,
            "quo warranto": 3.5, "high court": 3.0, "subordinate courts": 2.8, "lok adalat": 3.2,
            "fundamental rights": 2.8, "directive principles": 2.8,
        },
        "English Language": {
            "english language": 3.5, "english i": 3.5, "grammar": 3.0, "tense": 2.5,
            "transformation of sentences": 3.5, "active and passive voice": 3.5,
            "direct and indirect speech": 3.5, "reported speech": 3.5, "prepositions": 3.0,
            "appropriate prepositions": 3.2, "phrasal verbs": 3.0, "conjunctions": 2.5,
            "synthesis of sentences": 3.5, "conditional sentences": 3.0, "degrees of comparison": 3.0,
            "subject verb agreement": 3.0, "composition": 2.8, "essay": 2.5, "narrative essay": 2.8,
            "descriptive essay": 2.8, "argumentative essay": 2.8, "letter writing": 3.0,
            "formal letter": 3.2, "informal letter": 3.0, "notice writing": 3.5, "email writing": 3.5,
            "unseen comprehension": 3.2, "passage comprehension": 3.0, "summary writing": 3.2,
            "vocabulary exercises": 2.5, "idioms": 2.5, "punctuation": 2.2,
        },
        "English Literature": {
            "english literature": 3.5, "english ii": 3.5, "drama": 2.5, "play": 2.0,
            "merchant of venice": 4.0, "shylock": 4.0, "antonio": 3.5, "bassanio": 3.5,
            "portia": 3.5, "pound of flesh": 4.0, "trial scene": 3.8, "caskets": 3.5,
            "belmont": 3.2, "venice": 2.2, "julius caesar": 4.0, "brutus": 4.0,
            "mark antony": 4.0, "cassius": 3.8, "ides of march": 3.8, "prose": 2.5,
            "treasure chest": 3.5, "treasure trove": 3.5, "short stories": 2.5,
            "with the photographer": 3.5, "the elevator": 3.5, "the girl who can": 3.5,
            "the pedestrian": 3.5, "the last lesson": 3.5, "poetry": 2.5, "poems": 2.5,
            "daffodils": 3.5, "i know why the caged bird sings": 4.0, "the patriot": 3.8,
            "abou ben adhem": 3.8, "nine gold medals": 3.8, "theme": 2.0, "character sketch": 2.8,
            "dramatic irony": 3.0, "soliloquy": 3.0, "metaphor": 2.2, "alliteration": 2.2,
            "personification": 2.2, "imagery": 2.2, "symbolism": 2.5,
        },
        "Computer Science": {
            "computer science": 3.5, "computer applications": 3.5, "java": 3.2, "oop": 3.2,
            "object oriented programming": 3.5, "class and object": 3.2, "encapsulation": 3.2,
            "inheritance": 3.2, "polymorphism": 3.2, "abstraction": 3.2, "data types": 2.5,
            "primitive data types": 2.8, "operators in java": 2.8, "ternary operator": 3.0,
            "control structures": 2.5, "if-else": 2.5, "switch case": 3.0, "loops": 2.5,
            "for loop": 2.5, "while loop": 2.5, "do-while loop": 2.5, "nested loop": 2.8,
            "break and continue": 2.8, "methods in java": 2.8, "function overloading": 3.2,
            "constructors": 3.2, "default constructor": 3.0, "parameterized constructor": 3.0,
            "arrays": 2.8, "single dimensional array": 3.0, "double dimensional array": 3.0,
            "linear search": 3.2, "binary search": 3.2, "bubble sort": 3.2, "selection sort": 3.2,
            "string handling": 3.0, "stringbuffer": 3.0, "character class": 3.0, "isletter": 2.8,
            "isdigit": 2.8, "wrapper classes": 3.0, "autoboxing": 3.0, "unboxing": 3.0,
            "bluej": 3.0, "bytecode": 2.8, "jvm": 2.8, "python": 2.0, "algorithm": 2.5,
            "flowchart": 2.0, "time complexity": 2.5,
        },
    }

    # In-memory session tracking: session_id -> { "last_subject": ..., "last_topic": ..., "last_chapter": ..., "last_grade": ... }
    _session_context: Dict[str, Dict[str, Any]] = {}

    def classify(
        self,
        query: str,
        user_grade: int = 10,
        preferred_subject: Optional[str] = None,
        board: str = "ICSE",
        session_id: Optional[str] = None,
    ) -> SubjectClassificationResult:
        """
        Classifies the student query into Subject, Grade, Curriculum, Chapter, Topic,
        Subtopic, Question Type, Explanation Depth, Visual/3D need, and Confidence Tier.
        """
        q_clean = query.strip()
        q_lower = q_clean.lower()
        effective_board = board.upper()

        # Retrieve prior session context if available
        prior_context = self._session_context.get(session_id or "default_session", {})
        has_prior_context = bool(prior_context.get("last_subject"))

        # 1. Question Type Classification
        q_type_res: QuestionClassificationResult = question_type_classifier.classify(
            query=q_clean,
            has_prior_context=has_prior_context,
        )

        # 2. Check if this is a follow-up query relying on previous session context
        is_follow_up = q_type_res.is_follow_up
        detected_subject = None
        confidence_score = 0.0

        if is_follow_up and has_prior_context:
            detected_subject = prior_context["last_subject"]
            confidence_score = 0.88
            matched_chapter = prior_context.get("last_chapter", "Curriculum Topic")
            resolved_topic = f"{prior_context.get('last_topic', 'Topic')} (Follow-up: {q_clean})"
            resolved_subtopic = q_clean
        else:
            # Explicit preferred subject override if given and valid
            if preferred_subject and preferred_subject.lower() not in ("general", "all", "auto", "none", ""):
                for subj in self.SUBJECTS:
                    if preferred_subject.lower() in subj.lower() or subj.lower() in preferred_subject.lower():
                        detected_subject = subj
                        confidence_score = 0.95
                        break

            # Subject Scoring Engine across Lexicon
            if not detected_subject:
                scores: Dict[str, float] = {subj: 0.0 for subj in self.SUBJECTS}
                for subj, lexicon in self.SUBJECT_LEXICON.items():
                    for kw, weight in lexicon.items():
                        # Word boundary match or exact substring
                        if re.search(r'\b' + re.escape(kw) + r'\b', q_lower):
                            scores[subj] += weight * 1.5
                        elif kw in q_lower and len(kw) > 3:
                            scores[subj] += weight

                # Sort candidates
                sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
                top_subject, top_score = sorted_scores[0]
                runner_up_subject, runner_up_score = sorted_scores[1]

                if top_score > 0:
                    detected_subject = top_subject
                    # Normalize confidence score between 0.35 and 0.98
                    margin = top_score - runner_up_score
                    if top_score >= 4.0 and margin >= 2.0:
                        confidence_score = min(0.98, 0.75 + (top_score * 0.03))
                    elif top_score >= 2.0:
                        confidence_score = min(0.85, 0.55 + (top_score * 0.04))
                    else:
                        confidence_score = 0.45
                else:
                    # No keywords matched; check if session context exists as soft fallback
                    if has_prior_context:
                        detected_subject = prior_context["last_subject"]
                        confidence_score = 0.50
                    else:
                        detected_subject = "Biology"  # Sensible scientific fallback
                        confidence_score = 0.25

            # Resolve Chapter & Curriculum from ICSE Database
            curriculum_match = icse_db.find_matching_curriculum(q_clean, grade=user_grade, subject=detected_subject)
            matched_chapter = curriculum_match.get("chapter") if curriculum_match else f"{detected_subject} Core Syllabus"
            resolved_topic = q_clean
            resolved_subtopic = "Fundamental Principles & Mechanism"

        # Confidence Tier Determination
        if confidence_score >= 0.70:
            confidence_tier = "high"
            clarification_needed = False
            clarification_prompt = None
            suggested_subjects = []
        elif confidence_score >= 0.40:
            confidence_tier = "medium"
            clarification_needed = False
            clarification_prompt = None
            suggested_subjects = [detected_subject]
        else:
            confidence_tier = "low"
            clarification_needed = True
            suggested_subjects = ["Physics", "Chemistry", "Biology", "Mathematics", "History"]
            clarification_prompt = (
                f"I want to make sure I teach this with total accuracy. Did you mean this in the context of "
                f"{suggested_subjects[0]}, {suggested_subjects[1]}, or {suggested_subjects[2]}?"
            )

        # 3. 3D Gatekeeping
        # Strictly forbidden for History, Civics, English Language, English Literature, Geography
        disallowed_3d_subjects = ["History", "Civics", "English Language", "English Literature", "Geography"]
        is_3d_necessary = False
        visual_beneficial = True

        if detected_subject in disallowed_3d_subjects:
            is_3d_necessary = False
            if detected_subject in ["English Language"]:
                visual_beneficial = False
        else:
            # Biology, Physics, Chemistry, Math: 3D only when spatial volumetric interaction is essential
            spatial_keywords = ["heart", "circulation", "molecule", "orbital", "prism", "lens", "dna", "nephron", "cylinder", "cone", "sphere", "lever", "pulley", "volcano"]
            if any(k in q_lower for k in spatial_keywords):
                is_3d_necessary = True

        # 4. Explanation Depth & Answer Format
        if user_grade <= 7:
            explanation_depth = "foundational_intuitive"
        elif user_grade <= 10:
            explanation_depth = "comprehensive_icse_standard"
        else:
            explanation_depth = "advanced_analytical"

        required_format = q_type_res.metadata.display_name

        # Save active session context
        self._session_context[session_id or "default_session"] = {
            "last_subject": detected_subject,
            "last_chapter": matched_chapter,
            "last_topic": resolved_topic,
            "last_grade": user_grade,
        }

        recommended_books = (
            curriculum_match.get("recommended_books")
            if 'curriculum_match' in locals() and curriculum_match
            else ["Concise Series (Selina Publishers)", "Morning Star Publishers"]
        )

        return SubjectClassificationResult(
            board=effective_board,
            grade=user_grade,
            subject=detected_subject,
            matched_chapter=matched_chapter,
            topic=resolved_topic,
            subtopic=resolved_subtopic,
            question_type=q_type_res.primary_type,
            question_type_display=q_type_res.metadata.display_name,
            explanation_depth=explanation_depth,
            required_answer_format=required_format,
            visual_beneficial=visual_beneficial,
            is_3d_necessary=is_3d_necessary,
            confidence_score=round(confidence_score, 2),
            confidence_tier=confidence_tier,
            clarification_needed=clarification_needed,
            clarification_prompt=clarification_prompt,
            suggested_subjects=suggested_subjects,
            is_follow_up=is_follow_up,
            recommended_books=recommended_books,
            curriculum_found=bool('curriculum_match' in locals() and curriculum_match),
        )

    def reset_session(self, session_id: Optional[str] = None):
        """Clears memory for a specific session."""
        sid = session_id or "default_session"
        if sid in self._session_context:
            del self._session_context[sid]


subject_classifier = SubjectTopicIntelligenceEngine()
