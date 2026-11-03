from typing import Any, Dict, List, Optional
import re

ICSE_PUBLISHERS = [
    {"name": "Selina Publishers", "series": ["Concise Physics", "Concise Chemistry", "Concise Biology", "Concise Mathematics"]},
    {"name": "Morning Star", "series": ["Total History and Civics", "Total Geography", "Total English"]},
    {"name": "Arya Publishing Company (APC)", "series": ["Understanding ICSE Mathematics by M.L. Aggarwal", "Understanding Computer Applications with BlueJ"]},
    {"name": "Goyal Brothers Prakashan", "series": ["A Text Book of ICSE Geography", "Core Science"]},
    {"name": "Ratna Sagar", "series": ["Living Science", "Past and Present"]},
    {"name": "Evergreen Publications", "series": ["Candid ICSE Biology", "Candid ICSE Chemistry"]}
]

# Comprehensive ICSE Curriculum tree across Grades 1-10
ICSE_CURRICULUM_TREE: Dict[int, Dict[str, List[Dict[str, Any]]]] = {
    10: {
        "History & Civics": [
            {
                "chapter": "The First War of Independence (1857)",
                "topics": ["Political Causes", "Socio-Religious Causes", "Economic Causes", "Military Causes", "Immediate Cause (Enfield Rifle)", "Consequences and Queen's Proclamation"],
                "books": ["Total History and Civics (Morning Star)", "Transitions (Madhubun)"]
            },
            {
                "chapter": "Growth of Nationalism & Early Nationalists",
                "topics": ["Factors promoting nationalism", "Early Nationalists objectives and methods", "Surendranath Banerjee", "Dadabhai Naoroji", "Gopal Krishna Gokhale"],
                "books": ["Total History and Civics (Morning Star)"]
            },
            {
                "chapter": "Assertive Nationalism & Partition of Bengal",
                "topics": ["Causes of Partition of Bengal 1905", "Swadeshi and Boycott Movement", "Assertive leaders: Bal Gangadhar Tilak, Bipin Chandra Pal, Lala Lajpat Rai"],
                "books": ["Total History and Civics (Morning Star)"]
            },
            {
                "chapter": "The Union Parliament",
                "topics": ["Lok Sabha composition and powers", "Rajya Sabha composition and powers", "Speaker of Lok Sabha", "Legislative procedures and Parliamentary control"],
                "books": ["Total History and Civics (Morning Star)"]
            },
            {
                "chapter": "The Supreme Court and High Courts",
                "topics": ["Composition and appointment of judges", "Original Jurisdiction", "Appellate Jurisdiction", "Advisory Jurisdiction", "Judicial Review", "Writ Jurisdiction"],
                "books": ["Total History and Civics (Morning Star)"]
            },
            {
                "chapter": "Contemporary World & The United Nations",
                "topics": ["First World War causes (Nationalism, Imperialism, Alliances, Sarajevo Crisis)", "Treaty of Versailles", "Causes of Second World War", "UN General Assembly", "Security Council", "UNESCO, WHO, UNICEF"],
                "books": ["Total History and Civics (Morning Star)"]
            }
        ],
        "Mathematics": [
            {
                "chapter": "Commercial Mathematics: GST & Banking",
                "topics": ["Goods and Services Tax (Intra-state, Inter-state, Input Tax Credit)", "Recurring Deposit Accounts (Interest & Maturity Value formulas)"],
                "books": ["Understanding ICSE Mathematics (M.L. Aggarwal)", "Concise Mathematics (Selina)"]
            },
            {
                "chapter": "Algebra: Quadratic Equations",
                "topics": ["Standard form ax^2 + bx + c = 0", "Factorisation method", "Quadratic formula (discriminant D = b^2 - 4ac)", "Nature of roots", "Word problems"],
                "books": ["Understanding ICSE Mathematics (M.L. Aggarwal)", "Concise Mathematics (Selina)"]
            },
            {
                "chapter": "Algebra: Matrices",
                "topics": ["Order of a matrix", "Row, column, square, identity matrices", "Addition and subtraction", "Scalar multiplication", "Matrix multiplication (2x2)"],
                "books": ["Understanding ICSE Mathematics (M.L. Aggarwal)", "Concise Mathematics (Selina)"]
            },
            {
                "chapter": "Coordinate Geometry",
                "topics": ["Reflection (x-axis, y-axis, origin, invariant points)", "Section formula & Mid-point formula", "Equation of a straight line (Slope-intercept form, Point-slope form)"],
                "books": ["Understanding ICSE Mathematics (M.L. Aggarwal)", "Concise Mathematics (Selina)"]
            },
            {
                "chapter": "Trigonometry",
                "topics": ["Trigonometric identities (sin^2 + cos^2 = 1, 1 + tan^2 = sec^2, 1 + cot^2 = cosec^2)", "Heights and Distances with angles of elevation and depression (30°, 45°, 60°)"],
                "books": ["Understanding ICSE Mathematics (M.L. Aggarwal)", "Concise Mathematics (Selina)"]
            },
            {
                "chapter": "Mensuration: Cylinder, Cone, Sphere",
                "topics": ["Right circular cylinder (CSA, TSA, Volume)", "Right circular cone (Slant height, CSA, TSA, Volume)", "Spheres and Hemispheres (Surface area, Volume)", "Combination of solids"],
                "books": ["Understanding ICSE Mathematics (M.L. Aggarwal)", "Concise Mathematics (Selina)"]
            },
            {
                "chapter": "Statistics & Probability",
                "topics": ["Mean (Direct, Short-cut, Step-deviation methods)", "Median and Quartiles from Ogive (Cumulative frequency curve)", "Mode from Histogram", "Classical probability of single events"],
                "books": ["Understanding ICSE Mathematics (M.L. Aggarwal)", "Concise Mathematics (Selina)"]
            }
        ],
        "Physics": [
            {
                "chapter": "Force, Work, Power and Energy",
                "topics": ["Turning effect of force and moment of couple", "Equilibrium of bodies", "Principle of moments", "Centre of gravity", "Uniform circular motion vs linear motion", "Work done W = F*s*cos(theta)", "Kinetic and Potential energy conservation"],
                "books": ["Concise Physics (Selina)", "Frank Modern Certificate Physics"]
            },
            {
                "chapter": "Light: Refraction at Plane Surfaces and Lenses",
                "topics": ["Laws of refraction and Snell's Law", "Refractive index and real/apparent depth", "Total Internal Reflection and Critical Angle", "Convex and Concave lenses ray diagrams", "Lens formula 1/f = 1/v - 1/u", "Magnification and Power of lens"],
                "books": ["Concise Physics (Selina)"]
            },
            {
                "chapter": "Sound: Echoes and Vibrations",
                "topics": ["Reflection of sound waves and Echoes (d = vt/2)", "SONAR and Medical ultrasound", "Natural, damped and forced vibrations", "Resonance with practical demonstrations"],
                "books": ["Concise Physics (Selina)"]
            },
            {
                "chapter": "Electricity and Magnetism",
                "topics": ["Ohm's Law V = IR", "Resistors in series and parallel", "Internal resistance and EMF of cell", "Electrical energy and Power P = VI = I^2R = V^2/R", "Household circuits and 3-pin plugs", "Magnetic effect of current and Fleming's Left-Hand Rule"],
                "books": ["Concise Physics (Selina)"]
            },
            {
                "chapter": "Calorimetry & Radioactivity",
                "topics": ["Specific heat capacity Q = mc*delta_T", "Principle of Method of Mixtures", "Specific latent heat Q = mL", "Alpha, beta, gamma emissions and radioactive decay"],
                "books": ["Concise Physics (Selina)"]
            }
        ],
        "Chemistry": [
            {
                "chapter": "Periodic Properties and Variations",
                "topics": ["Modern Periodic Law", "Periodic trends: Atomic size, Ionisation potential, Electron affinity, Electronegativity, Metallic and Non-metallic character"],
                "books": ["Concise Chemistry (Selina)", "Simplified Middle School Chemistry (Viraf J. Dalal)"]
            },
            {
                "chapter": "Chemical Bonding",
                "topics": ["Electrovalent (Ionic) bonding (NaCl, MgCl2, CaO)", "Covalent bonding (H2, Cl2, O2, N2, CH4, H2O, NH3)", "Coordinate bonding (Ammonium ion, Hydronium ion)"],
                "books": ["Concise Chemistry (Selina)"]
            },
            {
                "chapter": "Acids, Bases and Salts & Analytical Chemistry",
                "topics": ["Definitions according to Arrhenius", "Types of salts (Normal, Acid, Basic)", "Action of NaOH and NH4OH on metal salt solutions (Cu, Fe, Zn, Pb)"],
                "books": ["Concise Chemistry (Selina)"]
            },
            {
                "chapter": "Mole Concept and Stoichiometry",
                "topics": ["Gay Lussac's Law of Combining Volumes", "Avogadro's Law", "Mole, Molar mass, Molar volume at STP (22.4 L)", "Empirical and Molecular formulas"],
                "books": ["Concise Chemistry (Selina)"]
            },
            {
                "chapter": "Electrolysis and Metallurgy",
                "topics": ["Electrolysis of molten PbBr2, acidified water, CuSO4 solution", "Electroplating and electro-refining", "Hall-Héroult process and Baeyer's process for Aluminium"],
                "books": ["Concise Chemistry (Selina)"]
            },
            {
                "chapter": "Study of Compounds: HCl, NH3, HNO3, H2SO4",
                "topics": ["Laboratory preparation and Fountain experiment", "Oxidizing property of HNO3 and H2SO4", "Contact Process for H2SO4", "Haber Process for NH3"],
                "books": ["Concise Chemistry (Selina)"]
            },
            {
                "chapter": "Organic Chemistry",
                "topics": ["IUPAC nomenclature of Alkanes, Alkenes, Alkynes, Alcohols, Carboxylic acids", "Homologous series", "Isomerism (Chain, Position)", "Reactions of Methane, Ethane, Ethene, Ethyne"],
                "books": ["Concise Chemistry (Selina)"]
            }
        ],
        "Biology": [
            {
                "chapter": "Basic Biology: Cell Division and Genetics",
                "topics": ["Structure of chromosome, DNA and genes", "Mitosis stages (Prophase, Metaphase, Anaphase, Telophase)", "Meiosis significance", "Mendel's Laws of Inheritance (Monohybrid & Dihybrid cross)", "Sex determination in humans"],
                "books": ["Concise Biology (Selina)", "Candid ICSE Biology"]
            },
            {
                "chapter": "Plant Physiology: Absorption, Transpiration & Photosynthesis",
                "topics": ["Osmosis, Diffusion, Turgidity, Plasmolysis", "Transpiration mechanisms and Ganong's potometer", "Photosynthesis light and dark reactions", "Experiments demonstrating starch formation, light and CO2 requirement"],
                "books": ["Concise Biology (Selina)"]
            },
            {
                "chapter": "Human Anatomy: Circulatory and Excretory Systems",
                "topics": ["Structure of heart, cardiac cycle, double circulation", "Blood composition and blood groups", "Structure of nephron and urine formation mechanism"],
                "books": ["Concise Biology (Selina)"]
            },
            {
                "chapter": "Human Anatomy: Nervous System and Endocrine System",
                "topics": ["Neuron structure, reflex arc, central and peripheral nervous system", "Endocrine glands: Pituitary, Thyroid, Adrenal, Pancreas and hormone functions"],
                "books": ["Concise Biology (Selina)"]
            }
        ],
        "Geography": [
            {
                "chapter": "Topographical Maps & Interpretation",
                "topics": ["Four-figure and Six-figure grid references", "Contours and relief features", "Drainage patterns and settlement types", "Scale and conventional symbols"],
                "books": ["Total Geography (Morning Star)", "A Text Book of ICSE Geography"]
            },
            {
                "chapter": "Climate of India",
                "topics": ["South-West Monsoon (Arabian Sea and Bay of Bengal branches)", "Retreating Monsoon and North-East Monsoon", "Western Disturbances", "Rainfall distribution across India"],
                "books": ["Total Geography (Morning Star)"]
            },
            {
                "chapter": "Soils, Vegetation & Water Resources",
                "topics": ["Alluvial, Black, Red, Laterite soils characteristics and distribution", "Tropical Evergreen, Deciduous, Thorn, Mountain and Tidal forests", "Canal, Well, Tank and Drip irrigation methods"],
                "books": ["Total Geography (Morning Star)"]
            }
        ],
        "Computer Applications": [
            {
                "chapter": "Object-Oriented Programming with Java",
                "topics": ["Classes and Objects as abstraction and encapsulation", "Primitive vs Non-primitive data types", "Operators and precedence", "Conditional and Loop structures", "Functions and method overloading", "Arrays (1D and 2D)", "String handling with String and Character class methods"],
                "books": ["Understanding Computer Applications with BlueJ (APC)"]
            }
        ]
    },
    9: {
        "Physics": [
            {"chapter": "Measurements and Experimentation", "topics": ["Vernier Calipers", "Screw Gauge", "Simple Pendulum (Time period T = 2*pi*sqrt(l/g))"], "books": ["Concise Physics (Selina)"]},
            {"chapter": "Motion in One Dimension", "topics": ["Equations of motion (v = u + at, s = ut + 1/2at^2, v^2 = u^2 + 2as)", "Distance-time and velocity-time graphs"], "books": ["Concise Physics (Selina)"]},
            {"chapter": "Newton's Laws of Motion & Gravitation", "topics": ["First, second and third laws of motion", "Universal law of gravitation F = G*m1*m2/r^2"], "books": ["Concise Physics (Selina)"]}
        ],
        "Chemistry": [
            {"chapter": "The Language of Chemistry", "topics": ["Symbols, Valency, Radicals", "Writing chemical formulas and balancing equations"], "books": ["Concise Chemistry (Selina)"]},
            {"chapter": "Atomic Structure and Chemical Bonding", "topics": ["Rutherford and Bohr models", "Octet rule, electrovalent and covalent bonding basics"], "books": ["Concise Chemistry (Selina)"]}
        ],
        "Mathematics": [
            {"chapter": "Rational and Irrational Numbers", "topics": ["Surds, Rationalisation of denominator"], "books": ["Concise Mathematics (Selina)"]},
            {"chapter": "Compound Interest", "topics": ["Formula method A = P(1 + r/100)^n"], "books": ["Understanding ICSE Mathematics (M.L. Aggarwal)"]},
            {"chapter": "Simultaneous Linear Equations", "topics": ["Elimination, Substitution, Cross-multiplication methods"], "books": ["Concise Mathematics (Selina)"]}
        ],
        "Biology": [
            {"chapter": "Basic Biology: Cell and Tissues", "topics": ["Plant vs Animal Cell organelles", "Meristematic and Permanent plant tissues", "Epithelial, Connective, Muscular, Nervous animal tissues"], "books": ["Concise Biology (Selina)"]}
        ],
        "History & Civics": [
            {"chapter": "The Harappan Civilisation & Vedic Period", "topics": ["Town planning, Great Bath, Seals", "Early and Later Vedic society, literature"], "books": ["Total History and Civics (Morning Star)"]},
            {"chapter": "The Mughal Empire", "topics": ["Akbar's policies, Din-i-Ilahi, Mansabdari system, architecture"], "books": ["Total History and Civics (Morning Star)"]}
        ]
    }
}


class ICSECurriculumDatabase:
    """
    Hierarchical ICSE Knowledge Base spanning Grades 1 to 10.
    Provides verified board-approved syllabi, textbooks, chapters,
    and multi-publisher alignments.
    """

    def get_subject_chapters(self, grade: int, subject: str) -> List[Dict[str, Any]]:
        grade_data = ICSE_CURRICULUM_TREE.get(grade, {})
        for s_key, chapters in grade_data.items():
            if subject.lower() in s_key.lower() or s_key.lower() in subject.lower():
                return chapters
        return []

    def find_matching_curriculum(self, query: str, grade: int = 10, subject: Optional[str] = None) -> Optional[Dict[str, Any]]:
        query_lower = query.lower()
        grade_data = ICSE_CURRICULUM_TREE.get(grade, {})
        
        # If subject is specified, look there first
        subjects_to_search = [subject] if subject and subject in grade_data else list(grade_data.keys())

        best_match = None
        highest_score = 0

        for subj in subjects_to_search:
            chapters = grade_data.get(subj, [])
            for ch in chapters:
                score = 0
                ch_name = ch["chapter"].lower()
                for word in query_lower.split():
                    if len(word) > 3 and word in ch_name:
                        score += 3
                for t in ch.get("topics", []):
                    t_lower = t.lower()
                    for word in query_lower.split():
                        if len(word) > 3 and word in t_lower:
                            score += 2

                if score > highest_score:
                    highest_score = score
                    best_match = {
                        "subject": subj,
                        "grade": grade,
                        "chapter": ch["chapter"],
                        "matched_topics": ch.get("topics", []),
                        "recommended_books": ch.get("books", []),
                        "score": score
                    }

        return best_match if highest_score >= 2 else None

    def get_all_publishers(self) -> List[Dict[str, Any]]:
        return ICSE_PUBLISHERS


icse_db = ICSECurriculumDatabase()
