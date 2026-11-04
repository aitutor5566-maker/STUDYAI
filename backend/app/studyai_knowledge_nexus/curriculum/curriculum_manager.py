import logging
import re
from typing import Any, Dict, List, Optional

logger = logging.getLogger("knowledge_nexus.curriculum_manager")

BOARD_PROFILES: Dict[str, Dict[str, Any]] = {
    "ICSE": {
        "full_name": "Indian Certificate of Secondary Education (CISCE)",
        "grades": list(range(1, 11)),
        "primary_publishers": [
            {"name": "Selina Publishers", "series": "Concise Series (Physics, Chemistry, Biology, Mathematics)"},
            {"name": "Morning Star", "series": "Total History & Civics, Total Geography, Total English"},
            {"name": "Arya Publishing Company (APC)", "series": "Understanding ICSE Mathematics (M.L. Aggarwal), BlueJ Computer Applications"},
            {"name": "Goyal Brothers Prakashan", "series": "Core Science, ICSE Geography"}
        ],
        "pedagogical_focus": "Exhaustive conceptual depth, exact scientific definitions, formal laboratory mechanisms, complete chemical balanced equations with conditions, structured 16-point history event analyses.",
        "marking_criteria": "Strict keywords required; definitions must not omit essential criteria; zero skipped mathematical steps."
    },
    "ISC": {
        "full_name": "Indian School Certificate (CISCE Senior Secondary)",
        "grades": [11, 12],
        "primary_publishers": [
            {"name": "Kalyani Publishers", "series": "Nootan ISC Physics, Nootan ISC Chemistry"},
            {"name": "S. Chand Publishing", "series": "ISC Biology by Veer Bala Rastogi, ISC Mathematics by O.P. Malhotra"},
            {"name": "Morning Star", "series": "The Tempest, Reverie & Echoes (English Literature)"},
            {"name": "Dhanpat Rai & Co.", "series": "Computer Science with Java (Sumita Arora)"}
        ],
        "pedagogical_focus": "Advanced pre-university academic rigor, calculus-based physics derivations, IUPAC organic reaction mechanisms, molecular genetics, Shakespearean dramatic analysis, data structures in Java.",
        "marking_criteria": "Formal mathematical proofs, step derivations with standard limits, IUPAC nomenclature, deep critical literary analysis."
    },
    "CBSE": {
        "full_name": "Central Board of Secondary Education (NCERT)",
        "grades": list(range(1, 13)),
        "primary_publishers": [
            {"name": "NCERT", "series": "National Council of Educational Research and Training Official Textbooks"},
            {"name": "Dhanpat Rai & Co.", "series": "Mathematics by R.D. Sharma, Computer Science with Python by Sumita Arora"},
            {"name": "S. Chand Publishing", "series": "Science for Tenth Class (Lakhmir Singh & Manjit Kaur)"},
            {"name": "Pradeep Publications", "series": "Pradeep's Fundamental Physics & Chemistry"}
        ],
        "pedagogical_focus": "NCERT exemplar alignment, competency-based questions (CBQs), real-world case studies, application-oriented assertions and reasons, Python-centric computer science.",
        "marking_criteria": "NCERT point-to-point conformity, step marking, competency assessment, assertion-reason logic."
    }
}

# Master Curriculum Database mapping Board -> Grade -> Subject -> Chapters & Topics
CURRICULUM_KNOWLEDGE_GRAPH: Dict[str, Dict[int, Dict[str, List[Dict[str, Any]]]]] = {
    "ICSE": {
        10: {
            "English I": [
                {
                    "chapter": "Functional Grammar & Syntax",
                    "topics": ["Transformation of Sentences", "Prepositions & Phrasal Verbs", "Synthesis of Sentences using Conjunctions", "Tenses & Sequence of Tenses", "Direct and Indirect Speech"],
                    "prerequisites": ["Parts of Speech", "Basic Clause Structure"],
                    "leads_to": ["ISC English Language Synthesis"],
                    "textbook": "Total English Grade 10 (Morning Star)"
                },
                {
                    "chapter": "Composition & Applied Writing",
                    "topics": ["Narrative and Descriptive Essays", "Formal & Informal Letter Writing", "Notice & Email Writing Templates", "Unseen Comprehension & Précis Writing"],
                    "prerequisites": ["Paragraph Cohesion", "Punctuation Rules"],
                    "leads_to": ["ISC Proposal & Report Writing"],
                    "textbook": "Total English Grade 10 (Morning Star)"
                }
            ],
            "English II": [
                {
                    "chapter": "Drama: The Merchant of Venice (Shakespeare)",
                    "topics": ["Act III Scene 2 (The Casket Scene)", "Act IV Scene 1 (The Trial Scene & Quality of Mercy)", "Themes of Justice vs Mercy, Friendship, and Prejudice", "Character analysis of Portia, Shylock, Antonio, Bassanio"],
                    "prerequisites": ["Early Elizabethan Drama Conventions", "Poetic Blank Verse"],
                    "leads_to": ["ISC Drama: The Tempest"],
                    "textbook": "The Merchant of Venice (Verity Edition / Morning Star)"
                },
                {
                    "chapter": "Poetry: Treasure Trove / A Collection of Poems",
                    "topics": ["Daffodils by William Wordsworth", "I Know Why the Caged Bird Sings by Maya Angelou", "The Patriot by Robert Browning", "Abu Ben Adhem by Leigh Hunt", "Nine Gold Medals by David Roth"],
                    "prerequisites": ["Figures of Speech (Metaphor, Simile, Personification, Alliteration)"],
                    "leads_to": ["ISC Reverie Anthology"],
                    "textbook": "Treasure Trove (Evergreen Publications)"
                },
                {
                    "chapter": "Prose: Short Stories",
                    "topics": ["An Angel in Disguise by T.S. Arthur", "The Little Match Girl by Hans Christian Andersen", "The Blue Bead by Norah Burke", "My Greatest Olympic Prize by Jesse Owens", "All Summer in a Day by Ray Bradbury"],
                    "prerequisites": ["Narrative Arc", "Symbolism"],
                    "leads_to": ["ISC Echoes Collection"],
                    "textbook": "Treasure Trove Short Stories (Evergreen Publications)"
                }
            ],
            "History": [
                {
                    "chapter": "The First War of Independence (1857)",
                    "topics": ["Political, Socio-Religious, Economic, Military Causes", "Immediate Cause (greased Enfield cartridges)", "Consequences & Queen Victoria's 1858 Proclamation"],
                    "prerequisites": ["British East India Company Expansion 1757-1856"],
                    "leads_to": ["Rise of Indian National Congress 1885"],
                    "textbook": "Total History and Civics Grade 10 (Morning Star)"
                },
                {
                    "chapter": "Indian National Movement (1885-1947)",
                    "topics": ["Early Nationalists vs Assertive Nationalists", "Partition of Bengal 1905 & Swadeshi Movement", "Muslim League Formation 1906", "Mahatma Gandhi's Mass Movements (Non-Cooperation, Civil Disobedience, Quit India)", "Subhas Chandra Bose and the INA", "Mountbatten Plan and Indian Independence Act 1947"],
                    "prerequisites": ["Social Reformers of 19th Century India"],
                    "leads_to": ["Post-Independence Nation Building"],
                    "textbook": "Total History and Civics Grade 10 (Morning Star)"
                },
                {
                    "chapter": "The Contemporary World",
                    "topics": ["First World War Causes & Treaty of Versailles", "Rise of Fascism in Italy & Nazism in Germany", "Second World War Causes & Consequences", "United Nations (General Assembly, Security Council, ICJ, Major Agencies)", "Non-Aligned Movement (NAM) and Panchsheel"],
                    "prerequisites": ["Industrial Revolution & Imperialism"],
                    "leads_to": ["Cold War Geopolitics"],
                    "textbook": "Total History and Civics Grade 10 (Morning Star)"
                }
            ],
            "Geography": [
                {
                    "chapter": "Topography & Survey Maps (45D/7 & 45D/10)",
                    "topics": ["Four-figure and six-figure grid references", "Contour patterns & slopes (steep, gentle, conical hill, plateau, ridge)", "Drainage patterns (trellised, dendritic, radial)", "Settlement patterns (nucleated, dispersed, linear)", "Scale calculation and distance measurement"],
                    "prerequisites": ["Cardinal Directions", "Map Scales"],
                    "leads_to": ["Survey of India Advanced GIS"],
                    "textbook": "Total Geography Grade 10 (Morning Star)"
                },
                {
                    "chapter": "Climate of India",
                    "topics": ["Factors affecting Indian climate (Latitude, Altitude, Himalayas, Monsoon winds, Jet streams)", "Southwest Monsoon mechanism (Arabian Sea and Bay of Bengal branches)", "Retreating Monsoon & Tropical Cyclones", "Western Disturbances and winter rainfall in Northern India"],
                    "prerequisites": ["Atmospheric Pressure Belts", "Coriolis Force"],
                    "leads_to": ["Monsoon Dynamics & Climatology"],
                    "textbook": "Total Geography Grade 10 (Morning Star)"
                },
                {
                    "chapter": "Soil, Water, Mineral & Energy Resources",
                    "topics": ["Soil types of India (Alluvial, Black, Red, Laterite) - characteristics, distribution, soil erosion & conservation", "Water resources: Need for conservation, Irrigation methods (Canal, Tank, Well/Tube-well), Rainwater harvesting", "Minerals: Iron ore, Manganese, Bauxite, Copper", "Conventional (Coal, Petroleum, Hydel) & Non-conventional energy (Solar, Wind, Biogas)"],
                    "prerequisites": ["Rock Cycle", "Hydrological Cycle"],
                    "leads_to": ["Resource Economics & Environmental Geography"],
                    "textbook": "Total Geography Grade 10 (Morning Star)"
                }
            ],
            "Civics / Political Science": [
                {
                    "chapter": "The Union Legislature (Parliament)",
                    "topics": ["Lok Sabha composition, qualifications, term, Speaker", "Rajya Sabha composition, qualifications, permanent body, presiding officers", "Powers & functions: Legislative, Financial, Executive control (No-Confidence Motion, Question Hour), Electoral, Constituent"],
                    "prerequisites": ["Preamble & Fundamental Rights"],
                    "leads_to": ["Constitutional Law & Comparative Parliaments"],
                    "textbook": "Total History and Civics Grade 10 (Morning Star)"
                },
                {
                    "chapter": "The Union Executive",
                    "topics": ["President of India: Qualifications, Electoral College election, Executive, Legislative, Financial, Judicial, and Emergency Powers", "Vice-President of India: Qualifications and functions", "Prime Minister & Council of Ministers: Appointment, Collective Responsibility to Lok Sabha, Role as link between Cabinet and President"],
                    "prerequisites": ["Parliamentary Form of Government"],
                    "leads_to": ["Executive Governance & Public Administration"],
                    "textbook": "Total History and Civics Grade 10 (Morning Star)"
                },
                {
                    "chapter": "The Judiciary",
                    "topics": ["The Supreme Court: Composition, qualifications and appointment of Judges, Independence of Judiciary", "Jurisdiction: Original, Appellate, Advisory, Revisory, Judicial Review, Writ Jurisdiction (Habeas Corpus, Mandamus, Prohibition, Certiorari, Quo-Warranto)", "High Courts and Subordinate Courts: Composition, Lok Adalats and their advantages"],
                    "prerequisites": ["Rule of Law & Separation of Powers"],
                    "leads_to": ["Constitutional Jurisprudence"],
                    "textbook": "Total History and Civics Grade 10 (Morning Star)"
                }
            ],
            "Mathematics": [
                {
                    "chapter": "Commercial Mathematics: GST & Banking",
                    "topics": ["Goods and Services Tax: CGST, SGST, IGST calculations, Input Tax Credit (ITC)", "Recurring Deposit (RD) Accounts: Interest calculation formula I = P * n(n+1)/(2*12) * r/100, Maturity Value MV = (P * n) + I"],
                    "prerequisites": ["Simple & Compound Interest", "Percentages"],
                    "leads_to": ["Financial Mathematics & Annuities"],
                    "textbook": "Understanding ICSE Mathematics (M.L. Aggarwal / APC)"
                },
                {
                    "chapter": "Algebra: Quadratic Equations & Matrices",
                    "topics": ["Standard quadratic form ax^2 + bx + c = 0", "Discriminant D = b^2 - 4ac and nature of roots", "Factorisation and Sridharacharya quadratic formula", "Matrices: Order of matrix, addition, subtraction, scalar multiplication, 2x2 matrix multiplication, compatibility condition"],
                    "prerequisites": ["Linear Equations in Two Variables", "Polynomials"],
                    "leads_to": ["Determinants and Linear Algebra"],
                    "textbook": "Concise Mathematics Grade 10 (Selina)"
                },
                {
                    "chapter": "Geometry: Circles, Tangents & Coordinate Geometry",
                    "topics": ["Angle subtended by an arc at centre is double the angle at circumference", "Angles in the same segment of a circle are equal", "Opposite angles of a cyclic quadrilateral are supplementary", "Tangent-Secant theorems: PT^2 = PA * PB", "Section formula: ( (m1*x2 + m2*x1)/(m1+m2), (m1*y2 + m2*y1)/(m1+m2) ), Midpoint formula, Slope-intercept equation of line y = mx + c"],
                    "prerequisites": ["Triangles & Congruence Theorems", "Cartesian Coordinate System"],
                    "leads_to": ["Coordinate Conic Sections & Calculus"],
                    "textbook": "Understanding ICSE Mathematics (M.L. Aggarwal / APC)"
                }
            ],
            "Physics": [
                {
                    "chapter": "Force, Work, Power & Energy",
                    "topics": ["Translational and Rotational motion, Moment of a Force (Torque = F * r_perp), Principle of Moments", "Centripetal vs Centrifugal Force", "Work done W = F * s * cos(theta), Kinetic and Potential Energy, Principle of Conservation of Mechanical Energy for freely falling body", "Power P = W/t = F * v, Units of Power (Watt, Horsepower) and Electrical Energy (kWh)"],
                    "prerequisites": ["Newton's Laws of Motion", "Scalars & Vectors"],
                    "leads_to": ["Rotational Dynamics & Thermodynamics"],
                    "textbook": "Concise Physics Grade 10 (Selina)"
                },
                {
                    "chapter": "Light: Refraction at Plane Surfaces, Lenses & Spectrum",
                    "topics": ["Laws of Refraction, Snell's Law (sin i / sin r = constant), Refractive index, Principle of Reversibility", "Total Internal Reflection (TIR), Critical angle condition (sin C = 1/mu), Prisms (45-45-90 and 60-60-60)", "Lenses: Convex and concave lens ray diagrams, Lens formula 1/f = 1/v - 1/u, Linear magnification m = v/u, Power of a lens P = 1/f(metres)", "Electromagnetic Spectrum: Dispersion through prism, properties and uses of Gamma, X-rays, UV, Visible, IR, Microwaves, Radio waves"],
                    "prerequisites": ["Reflection of Light", "Fermat's Principle"],
                    "leads_to": ["Wave Optics & Laser Physics"],
                    "textbook": "Concise Physics Grade 10 (Selina)"
                },
                {
                    "chapter": "Electricity & Magnetism",
                    "topics": ["Ohm's Law V = I * R, Factors affecting resistance (R = rho * l / A), Resistors in Series and Parallel", "Electromotive Force (EMF), Terminal Voltage V, Internal Resistance r, Equation: V = E - I*r", "Electrical Power P = V*I = I^2 * R = V^2 / R, Joule's Law of Heating H = I^2 * R * t", "Household wiring: Ring system, Three-pin plug, Fuse, Earthing, Miniature Circuit Breakers (MCB)", "Right-hand thumb rule, Fleming's Left-hand rule for motors, Electromagnetic Induction, Fleming's Right-hand rule"],
                    "prerequisites": ["Electric Charge & Potential Difference", "Magnetic Field Lines"],
                    "leads_to": ["Electromagnetism & AC Circuits"],
                    "textbook": "Concise Physics Grade 10 (Selina)"
                }
            ],
            "Chemistry": [
                {
                    "chapter": "Periodic Properties & Chemical Bonding",
                    "topics": ["Modern Periodic Law, Trends across periods and down groups: Atomic radius, Ionisation Potential, Electron Affinity, Electronegativity, Non-metallic and metallic character", "Electrovalent (Ionic) bonding (NaCl, MgCl2, CaO) with electron dot diagrams", "Covalent bonding (H2, Cl2, O2, N2, CH4, H2O, NH3)", "Coordinate (Dative) bonding in Hydronium ion (H3O+) and Ammonium ion (NH4+)"],
                    "prerequisites": ["Atomic Structure", "Electronic Configuration"],
                    "leads_to": ["Chemical Bonding Theory & Hybridization"],
                    "textbook": "Concise Chemistry Grade 10 (Selina)"
                },
                {
                    "chapter": "Acids, Bases, Salts & Analytical Chemistry",
                    "topics": ["Classification of acids and bases, Strength vs Concentration, Basicity of acids and Acidity of bases", "Methods of preparation of salts (Action of acid on metals, oxides, carbonates, precipitation)", "Action of Sodium Hydroxide and Ammonium Hydroxide on salts of Ca, Fe2+, Fe3+, Cu, Zn, Pb", "Amphoteric oxides and hydroxides (ZnO, Al2O3, PbO) dissolving in excess alkali"],
                    "prerequisites": ["pH Scale", "Neutralisation Reaction"],
                    "leads_to": ["Ionic Equilibrium & Qualitative Analysis"],
                    "textbook": "Concise Chemistry Grade 10 (Selina)"
                },
                {
                    "chapter": "Organic Chemistry: Hydrocarbons & Functional Groups",
                    "topics": ["Tetravalency and Catenation of carbon, Homologous series", "IUPAC nomenclature of alkanes, alkenes, alkynes (up to 5 carbon atoms), Alcohols, Carboxylic acids", "Alkanes (Methane, Ethane): Substitution reaction with chlorine", "Alkenes (Ethene): Addition reactions with H2, Br2, Cl2", "Alkynes (Ethyne): Preparation, addition reactions", "Alcohols (Ethanol): Oxidation to ethanoic acid, Dehydration by conc. H2SO4", "Carboxylic Acids (Ethanoic acid): Esterification reaction with ethanol"],
                    "prerequisites": ["Covalent Carbon Chains"],
                    "leads_to": ["Reaction Mechanisms & Biomolecules"],
                    "textbook": "Concise Chemistry Grade 10 (Selina)"
                }
            ],
            "Biology": [
                {
                    "chapter": "Cell Division & Genetics",
                    "topics": ["Cell Cycle: Interphase (G1, S, G2), Mitosis stages (Prophase, Metaphase, Anaphase, Telophase, Cytokinesis)", "Significance of Mitosis vs Meiosis (Crossing over, genetic variation)", "Structure of Chromosome: Centromere, Chromatids, DNA double helix, Histone octamer / Nucleosome", "Mendel's Laws of Inheritance: Law of Segregation, Law of Independent Assortment, Monohybrid (3:1, 1:2:1) & Dihybrid crosses (9:3:3:1)", "Sex determination in humans (XX/XY), Sex-linked inheritance (Haemophilia, Colour blindness)"],
                    "prerequisites": ["Cell Structure & Organelles", "Nucleus"],
                    "leads_to": ["Molecular Genetics & Biotechnology"],
                    "textbook": "Concise Biology Grade 10 (Selina)"
                },
                {
                    "chapter": "Plant Physiology: Absorption, Transpiration & Photosynthesis",
                    "topics": ["Imbibition, Diffusion, Osmosis, Turgidity, Flaccidity, Plasmolysis, Root pressure", "Transpiration: Mechanism of stomatal opening (potassium ion exchange), factors affecting rate, Ganong's Potometer, Significance of transpiration stream", "Photosynthesis: Chloroplast ultrastructure, Photochemical / Hill Reaction in thylakoid grana (Photolysis of water 2H2O -> 4H+ + 4e- + O2, Photophosphorylation), Biosynthetic / Calvin Cycle in stroma, Limiting factors (Blackman's Law), Balanced Equation: 6CO2 + 12H2O -> C6H12O6 + 6H2O + 6O2"],
                    "prerequisites": ["Plant Cell Structure", "Leaf Anatomy (Mesophyll, Guard Cells)"],
                    "leads_to": ["Plant Biochemistry & Cellular Respiration"],
                    "textbook": "Concise Biology Grade 10 (Selina)"
                },
                {
                    "chapter": "Human Physiology: Circulatory & Excretory Systems",
                    "topics": ["Human Heart: 4 chambers, Tricuspid, Bicuspid and Semilunar valves, Double circulation (Pulmonary and Systemic pathways), Cardiac cycle phases (Atrial systole, Ventricular systole, Joint diastole), Blood pressure and Pulse", "Structure of blood vessels (Artery, Vein, Capillary differences), Blood clotting mechanism (Thrombokinase -> Prothrombin to Thrombin -> Fibrinogen to Fibrin)", "Excretory System: Gross kidney anatomy (Cortex, Medulla, Pelvis), Nephron structure (Bowman's capsule, Glomerulus, PCT, Loop of Henle, DCT, Collecting duct), Urine formation (Ultrafiltration, Selective reabsorption, Tubular secretion), Osmoregulation via ADH"],
                    "prerequisites": ["Tissues (Epithelial, Muscular, Vascular)", "Homeostasis"],
                    "leads_to": ["Cardiovascular Medicine & Renal Pathology"],
                    "textbook": "Concise Biology Grade 10 (Selina)"
                }
            ],
            "Computer Science": [
                {
                    "chapter": "Object-Oriented Programming with Java (BlueJ)",
                    "topics": ["Principles of OOP: Encapsulation, Inheritance, Polymorphism, Abstraction", "Classes and Objects as blueprints and state/behavior instances", "Data types (Primitive: byte, short, int, long, float, double, char, boolean vs Non-primitive: String, Arrays)", "Operators and Expressions: Arithmetic, Relational, Logical, Ternary (? :), Precedence and Associativity"],
                    "prerequisites": ["Algorithms & Flowcharts", "Basic Logic Gates"],
                    "leads_to": ["ISC Data Structures & Class Design"],
                    "textbook": "Understanding Computer Applications with BlueJ (APC / Arya Publishing)"
                },
                {
                    "chapter": "Control Structures, Iteration & User-Defined Methods",
                    "topics": ["Conditional statements: if-else, nested if, switch-case with break and default", "Iteration / Loops: while loop (entry-controlled), do-while loop (exit-controlled), for loop, break and continue statements", "User-Defined Methods: Method signature, return types, call by value vs call by reference, Method Overloading"],
                    "prerequisites": ["Sequential execution"],
                    "leads_to": ["Recursion & Algorithm Complexity"],
                    "textbook": "Understanding Computer Applications with BlueJ (APC / Arya Publishing)"
                },
                {
                    "chapter": "Arrays & String Handling in Java",
                    "topics": ["Single-dimensional arrays: Declaration, initialization, traversal, Linear Search, Binary Search, Bubble Sort, Selection Sort", "String class methods: length(), charAt(), indexOf(), substring(), toUpperCase(), toLowerCase(), equals(), compareTo(), trim(), replace()", "Character class methods: isLetter(), isDigit(), isLetterOrDigit(), isWhitespace(), isUpperCase(), toUpperCase()", "Dry runs, tracing tables, error tracking (syntax, runtime, logical errors)"],
                    "prerequisites": ["Primitive data types", "Loops"],
                    "leads_to": ["2D Arrays & Advanced String Algorithms"],
                    "textbook": "Understanding Computer Applications with BlueJ (APC / Arya Publishing)"
                }
            ]
        }
    },
    "ISC": {
        12: {
            "English I": [
                {
                    "chapter": "Advanced Functional English & Composition",
                    "topics": ["Proposal Writing (Heading, Objectives, List of Measures, Expected Outcomes)", "Formal Report Writing (Journalistic & Official)", "Complex Sentence Synthesis & Transformation", "Unseen Comprehension & Summary Writing (100 words exact limit)"],
                    "textbook": "Total English Grade 12 (Morning Star)"
                }
            ],
            "English II": [
                {
                    "chapter": "Drama: The Tempest (William Shakespeare)",
                    "topics": ["The Usurpation of Prospero and Magic on the Enchanted Island", "Caliban's colonial subjugation vs Ariel's servitude", "Ferdinand and Miranda's pastoral courtship", "The Banquet and Masque scenes", "Themes of Forgiveness over Vengeance ('The rarer action is in virtue than in vengeance')"],
                    "textbook": "The Tempest (Verity Edition)"
                }
            ],
            "Mathematics": [
                {
                    "chapter": "Calculus: Differentiation & Integration",
                    "topics": ["Continuity and Differentiability, Chain rule, Implicit differentiation, Logarithmic differentiation", "Applications of Derivatives: Tangents and Normals, Increasing/Decreasing functions, Maxima and Minima", "Definite and Indefinite Integrals: Substitution, Integration by parts, Partial fractions, Properties of definite integrals", "Differential Equations: Order and degree, Variable separable form, Homogeneous equations, First-order Linear differential equations dy/dx + Py = Q"],
                    "textbook": "ISC Mathematics Class 12 (O.P. Malhotra / S. Chand)"
                }
            ],
            "Physics": [
                {
                    "chapter": "Electromagnetism & Wave Optics",
                    "topics": ["Gauss's Law applications, Biot-Savart Law, Ampere's Circuital Law, Magnetic dipole moment", "Faraday's Laws of Electromagnetic Induction, Lenz's Law, AC Generator, Transformers (step-up, step-down, efficiency, energy losses)", "Wave Optics: Huygens' Wave Theory, Interference of light, Young's Double Slit Experiment fringe width beta = lambda * D / d, Diffraction at a single slit"],
                    "textbook": "Nootan ISC Physics Class 12 (Kalyani Publishers)"
                }
            ],
            "Computer Science": [
                {
                    "chapter": "Data Structures & Inheritance in Java",
                    "topics": ["Inheritance in Java: super keyword, method overriding, abstract classes, interfaces", "Recursion: Base cases, recursive step, call stack tracing", "Data Structures: Implementation of Stacks and Queues using Arrays and Linked Lists, Infix to Postfix conversion", "Binary Trees: Preorder, Inorder, and Postorder traversals"],
                    "textbook": "Computer Science with Java (Sumita Arora / Dhanpat Rai)"
                }
            ]
        }
    },
    "CBSE": {
        10: {
            "Mathematics": [
                {
                    "chapter": "Real Numbers & Polynomials",
                    "topics": ["Fundamental Theorem of Arithmetic (Unique Prime Factorization)", "Proofs of irrationality of sqrt(2), sqrt(3), sqrt(5)", "Relationship between zeroes and coefficients of quadratic polynomials"],
                    "textbook": "Mathematics for Class X (NCERT Official)"
                },
                {
                    "chapter": "Triangles & Trigonometry",
                    "topics": ["Basic Proportionality Theorem (Thales Theorem) and its converse", "Criteria for similarity of triangles (AAA, SSS, SAS)", "Trigonometric ratios of acute angles, Trigonometric identities: sin^2(A) + cos^2(A) = 1, 1 + tan^2(A) = sec^2(A)", "Heights and Distances (Angle of elevation and depression applications)"],
                    "textbook": "Mathematics for Class X (NCERT Official)"
                }
            ],
            "Physics": [
                {
                    "chapter": "Light - Reflection and Refraction",
                    "topics": ["Spherical mirrors: Focal length, Mirror formula 1/f = 1/v + 1/u, Magnification m = -v/u", "Refraction of light, Refractive index, Spherical lenses: Lens formula 1/f = 1/v - 1/u, Power of lens P = 1/f"],
                    "textbook": "Science for Class X (NCERT Official)"
                }
            ],
            "Chemistry": [
                {
                    "chapter": "Chemical Reactions and Equations",
                    "topics": ["Chemical equations, Balanced chemical equations, Implications of a balanced chemical equation", "Types of chemical reactions: Combination, Decomposition, Displacement, Double displacement, Precipitation, Neutralization, Oxidation and Reduction", "Effects of oxidation in everyday life: Corrosion and Rancidity"],
                    "textbook": "Science for Class X (NCERT Official)"
                }
            ],
            "Biology": [
                {
                    "chapter": "Life Processes",
                    "topics": ["Autotrophic and Heterotrophic nutrition, Photosynthesis in plants", "Human Alimentary Canal and digestive enzymes", "Respiration: Aerobic vs Anaerobic pathways (breakdown of glucose in cytoplasm, mitochondria, muscle cells)", "Transportation in Human Beings (Heart, Double Circulation, Blood and Lymph) and Plants (Xylem and Phloem)", "Excretion in Human Beings (Nephron structure, urine formation) and Plants"],
                    "textbook": "Science for Class X (NCERT Official)"
                }
            ]
        }
    }
}


class CurriculumManager:
    """
    Curriculum Intelligence Controller supporting ICSE, ISC, and CBSE.
    Maintains clean boundaries between boards, chapter metadata,
    prerequisite graphs, and textbook provenance tracking.
    """

    def get_board_profile(self, board: str) -> Dict[str, Any]:
        return BOARD_PROFILES.get(board.upper(), BOARD_PROFILES["ICSE"])

    def find_curriculum_node(
        self,
        board: str,
        grade: int,
        subject: str,
        topic_query: str
    ) -> Optional[Dict[str, Any]]:
        board_key = board.upper()
        if board_key not in CURRICULUM_KNOWLEDGE_GRAPH:
            board_key = "ICSE"
        
        grades_map = CURRICULUM_KNOWLEDGE_GRAPH[board_key]
        if grade not in grades_map:
            # Fallback to closest available grade
            available_grades = sorted(grades_map.keys())
            grade = min(available_grades, key=lambda g: abs(g - grade))

        subjects_map = grades_map[grade]
        clean_sub = self._normalize_subject(subject)
        
        target_subject = None
        for s in subjects_map.keys():
            if self._normalize_subject(s) == clean_sub or clean_sub in self._normalize_subject(s):
                target_subject = s
                break

        if not target_subject:
            # Default to first subject if not found
            target_subject = list(subjects_map.keys())[0]

        chapters = subjects_map[target_subject]
        query_words = set(re.findall(r"\w+", topic_query.lower()))

        best_chapter = chapters[0]
        max_overlap = -1

        for chap in chapters:
            combined_text = (chap["chapter"] + " " + " ".join(chap.get("topics", []))).lower()
            overlap = sum(1 for word in query_words if word in combined_text)
            if overlap > max_overlap:
                max_overlap = overlap
                best_chapter = chap

        return {
            "board": board_key,
            "grade": grade,
            "subject": target_subject,
            "chapter": best_chapter["chapter"],
            "matched_topics": best_chapter.get("topics", []),
            "prerequisites": best_chapter.get("prerequisites", []),
            "leads_to": best_chapter.get("leads_to", []),
            "textbook": best_chapter.get("textbook", "Authorized Curriculum Textbook"),
            "board_pedagogical_focus": BOARD_PROFILES[board_key]["pedagogical_focus"]
        }

    def _normalize_subject(self, sub_str: str) -> str:
        s = sub_str.lower().strip()
        if "math" in s:
            return "mathematics"
        if "phys" in s:
            return "physics"
        if "chem" in s:
            return "chemistry"
        if "bio" in s:
            return "biology"
        if "hist" in s and "civic" not in s:
            return "history"
        if "civic" in s or "pol" in s:
            return "civics"
        if "geog" in s:
            return "geography"
        if "comp" in s or "java" in s or "python" in s:
            return "computer science"
        if "eng" in s:
            if "2" in s or "ii" in s or "lit" in s:
                return "english ii"
            return "english i"
        return s


curriculum_manager = CurriculumManager()
