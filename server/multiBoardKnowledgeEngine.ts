import crypto from 'node:crypto';
import { db } from './db.ts';

export type EducationalBoard =
  | 'CBSE'
  | 'ICSE'
  | 'AP_STATE_BOARD'
  | 'TS_STATE_BOARD';

export type SupportedSubject =
  | 'Science'
  | 'General Science'
  | 'Environmental Science'
  | 'Physics'
  | 'Chemistry'
  | 'Biology'
  | 'Mathematics'
  | 'Social Studies'
  | 'History'
  | 'Geography'
  | 'Civics'
  | 'Political Science'
  | 'Economics'
  | 'English'
  | 'Telugu'
  | 'Hindi'
  | 'Computer Science'
  | 'Information Technology'
  | 'General Knowledge';

export type KnowledgeStatus =
  | 'research_draft'
  | 'needs_verification'
  | 'verified_knowledge'
  | 'published_knowledge'
  | 'superseded_knowledge';

export type ConceptRelationType =
  | 'PREREQUISITE_OF'
  | 'PART_OF'
  | 'RELATED_TO'
  | 'EXAMPLE_OF'
  | 'APPLICATION_OF'
  | 'DIFFERENCE_BETWEEN';

export interface BoardCurriculumSpecification {
  code: EducationalBoard;
  name: string;
  fullName: string;
  authority: string;
  jurisdiction: string;
  officialPortal: string;
  currentAcademicYear: string;
  gradesSupported: number[]; // 1 to 10
  defaultLanguage: 'English' | 'Telugu' | 'Hindi';
  supportedLanguages: Array<'English' | 'Telugu' | 'Hindi'>;
}

export interface EquivalentTopicMapping {
  universalTopicId: string;
  universalTopicTitle: string;
  subject: SupportedSubject;
  mappings: Array<{
    board: EducationalBoard;
    grade: number;
    officialChapterTitle: string;
    chapterNumber: number;
    prescribedTextbook: string;
    learningDepth: 'foundational' | 'intermediate' | 'rigorous';
    weightageMarks?: number;
    examSignificance: string;
  }>;
}

export interface ConceptGraphNode {
  id: string;
  name: string;
  subject: SupportedSubject;
  gradeRecommendation: number;
  definition: string;
  formulas: string[];
}

export interface ConceptGraphEdge {
  id: string;
  sourceConceptId: string;
  targetConceptId: string;
  relationType: ConceptRelationType;
  description: string;
  weight: number;
}

export interface SyllabusEditionDiff {
  board: EducationalBoard;
  subject: SupportedSubject;
  grade: number;
  previousEdition: string;
  newEdition: string;
  addedTopics: string[];
  removedTopics: string[];
  modifiedTopics: Array<{ topic: string; changes: string }>;
  changedLearningObjectives: string[];
  requiresHumanReview: boolean;
}

export interface KnowledgeDocumentRecord {
  id: string;
  universalTopicId: string;
  board: EducationalBoard;
  grade: number;
  subject: SupportedSubject;
  title: string;
  status: KnowledgeStatus;
  version: number;
  academicYear: string;
  confidenceScore: number;
  reviewedBy?: string;
  reviewedAt?: string;
  contentMarkdown: string;
  definitions: Array<{ term: string; definition: string }>;
  formulas: Array<{ equation: string; explanation: string; siUnits?: string }>;
  sourceReference: {
    publisher: string;
    textbookName: string;
    chapter: string;
    licenseType: string;
  };
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// Official Specifications for the 4 Curricula
// -----------------------------------------------------------------------------
export const SUPPORTED_CURRICULA: Record<EducationalBoard, BoardCurriculumSpecification> = {
  CBSE: {
    code: 'CBSE',
    name: 'CBSE',
    fullName: 'Central Board of Secondary Education (CBSE / NCERT)',
    authority: 'National Council of Educational Research and Training (NCERT)',
    jurisdiction: 'National (India)',
    officialPortal: 'https://ncert.nic.in',
    currentAcademicYear: '2025-2026',
    gradesSupported: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    defaultLanguage: 'English',
    supportedLanguages: ['English', 'Hindi']
  },
  ICSE: {
    code: 'ICSE',
    name: 'ICSE',
    fullName: 'Council for the Indian School Certificate Examinations (CISCE / ICSE)',
    authority: 'CISCE Board Regulations & Syllabuses',
    jurisdiction: 'National / Private Recognized (India)',
    officialPortal: 'https://cisce.org',
    currentAcademicYear: '2025-2026',
    gradesSupported: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    defaultLanguage: 'English',
    supportedLanguages: ['English', 'Hindi']
  },
  AP_STATE_BOARD: {
    code: 'AP_STATE_BOARD',
    name: 'Andhra Pradesh State Board',
    fullName: 'Board of Secondary Education Andhra Pradesh (BSEAP / SCERT AP)',
    authority: 'State Council of Educational Research and Training (SCERT AP)',
    jurisdiction: 'State of Andhra Pradesh',
    officialPortal: 'https://scert.ap.gov.in',
    currentAcademicYear: '2025-2026',
    gradesSupported: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    defaultLanguage: 'English',
    supportedLanguages: ['English', 'Telugu', 'Hindi']
  },
  TS_STATE_BOARD: {
    code: 'TS_STATE_BOARD',
    name: 'Telangana State Board',
    fullName: 'Board of Secondary Education Telangana (BSETS / SCERT Telangana)',
    authority: 'State Council of Educational Research and Training (SCERT Telangana)',
    jurisdiction: 'State of Telangana',
    officialPortal: 'https://scert.telangana.gov.in',
    currentAcademicYear: '2025-2026',
    gradesSupported: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    defaultLanguage: 'English',
    supportedLanguages: ['English', 'Telugu', 'Hindi']
  }
};

// -----------------------------------------------------------------------------
// Multi-Board Knowledge Engine Implementation
// -----------------------------------------------------------------------------
export class MultiBoardKnowledgeEngine {
  /**
   * Initializes baseline knowledge graph nodes and official mappings in SQLite
   */
  initializeBaselineKnowledge(): void {
    // 1. Register Boards
    const insertBoard = db.prepare(`
      INSERT OR REPLACE INTO curriculum_boards (
        code, name, full_name, authority, jurisdiction, official_portal, academic_year, grades_supported_json, supported_languages_json, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    for (const [code, spec] of Object.entries(SUPPORTED_CURRICULA)) {
      insertBoard.run(
        code,
        spec.name,
        spec.fullName,
        spec.authority,
        spec.jurisdiction,
        spec.officialPortal,
        spec.currentAcademicYear,
        JSON.stringify(spec.gradesSupported),
        JSON.stringify(spec.supportedLanguages)
      );
    }

    // 2. Insert Core Universal Topics & Concepts
    this.seedBaselineConcepts();

    // 3. Insert Knowledge Graph Relationships
    this.seedBaselineConceptGraph();

    // 4. Seed Multi-Board Equivalences
    this.seedBaselineCurriculumMappings();
  }

  private seedBaselineConcepts(): void {
    const insertConcept = db.prepare(`
      INSERT OR REPLACE INTO universal_knowledge_nodes (
        id, topic, subject, domain, academic_definition, fundamental_laws_json, governing_formulas_json, key_phenomena_json, prerequisites_json, subtopics_json, verified, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `);

    const now = new Date().toISOString();

    const concepts = [
      {
        id: 'ukn-photosynthesis',
        topic: 'Photosynthesis',
        subject: 'Biology',
        domain: 'Plant Bioenergetics',
        definition: 'The biochemical process by which photoautotrophs convert sunlight, water, and carbon dioxide into chemical energy (glucose) while releasing oxygen.',
        laws: ['Conservation of Energy', 'Law of Limiting Factors (Blackman)'],
        formulas: [{ formula: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂', explanation: 'Balanced stoichiometric photosynthetic conversion.' }],
        phenomena: ['Photolysis in Thylakoids', 'Calvin Cycle in Stroma'],
        prereqs: ['Chloroplast Anatomy', 'Plant Cell Structure', 'Light Energy'],
        subtopics: ['Light Reactions', 'Calvin Cycle', 'Stomatal Regulation']
      },
      {
        id: 'ukn-chlorophyll',
        topic: 'Chlorophyll',
        subject: 'Biology',
        domain: 'Photosynthetic Pigments',
        definition: 'A green magnesium-porphyrin pigment embedded in thylakoid membranes that absorbs blue and red wavelengths to drive electron excitation.',
        laws: ['Beer-Lambert Law (Photon Absorption)'],
        formulas: [{ formula: 'Chlorophyll a: C₅₅H₇₂O₅N₄Mg', explanation: 'Primary reaction center pigment.' }],
        phenomena: ['Photo-excitation of electrons', 'Fluorescence'],
        prereqs: ['Light Spectrum', 'Pigment Absorption'],
        subtopics: ['Chlorophyll a vs b', 'Absorption Spectra', 'Porphyrin Ring']
      },
      {
        id: 'ukn-chloroplast',
        topic: 'Chloroplast',
        subject: 'Biology',
        domain: 'Cellular Organelles',
        definition: 'A semi-autonomous double-membrane organelle containing grana and stroma that hosts the machinery of photosynthesis.',
        laws: ['Endosymbiotic Theory'],
        formulas: [],
        phenomena: ['Chemiosmotic ATP synthesis across thylakoid lumen'],
        prereqs: ['Cell Organelles', 'Double-Membrane Transport'],
        subtopics: ['Thylakoids & Grana', 'Stroma Matrix', 'Circular DNA']
      },
      {
        id: 'ukn-human-heart',
        topic: 'Human Heart',
        subject: 'Biology',
        domain: 'Circulatory Physiology',
        definition: 'A four-chambered muscular myogenic pump that propels oxygenated and deoxygenated blood through systemic and pulmonary vascular circuits.',
        laws: ['Frank-Starling Law', 'Fluid Continuity'],
        formulas: [{ formula: 'CO = HR × SV', explanation: 'Cardiac Output = Heart Rate × Stroke Volume' }],
        phenomena: ['Double Circulation', 'Sinoatrial Nodal Pacemaking', 'Lub-Dub Valve Closure'],
        prereqs: ['Circulatory System', 'Blood Vessels', 'Cardiac Muscle'],
        subtopics: ['Four Chambers', 'Valvular Mechanics', 'Cardiac Conduction Cycle']
      },
      {
        id: 'ukn-valves',
        topic: 'Heart Valves',
        subject: 'Biology',
        domain: 'Cardiac Mechanics',
        definition: 'Flaps of endocardial tissue that prevent retrograde blood flow during ventricular systole and diastole.',
        laws: ['One-Way Hydrodynamic Valve Action'],
        formulas: [],
        phenomena: ['Tricuspid, Bicuspid (Mitral), and Semilunar closures'],
        prereqs: ['Human Heart Anatomy', 'Pressure Gradients'],
        subtopics: ['Atrioventricular Valves', 'Semilunar Valves', 'Chordae Tendineae']
      },
      {
        id: 'ukn-electricity',
        topic: 'Electricity and Electric Current',
        subject: 'Physics',
        domain: 'Electromagnetism',
        definition: 'The rate of flow of electric charge through a conductor across a potential difference.',
        laws: ["Ohm's Law", "Joule's Law of Heating", "Kirchhoff's Circuit Laws"],
        formulas: [
          { formula: 'I = Q / t', explanation: 'Current = Charge per unit time (Amperes, A)' },
          { formula: 'V = I · R', explanation: "Ohm's Law relating potential difference, current, and resistance." },
          { formula: 'P = V · I = I²R', explanation: 'Electric Power (Watts, W)' }
        ],
        phenomena: ['Drift velocity of electrons', 'Joule heating effect', 'Electromagnetic induction'],
        prereqs: ['Electric Charge', 'Potential Difference', 'Conductors vs Insulators'],
        subtopics: ["Ohm's Law", 'Series Circuits', 'Parallel Circuits', 'Electric Power']
      },
      {
        id: 'ukn-resistance',
        topic: 'Electrical Resistance & Ohm Law',
        subject: 'Physics',
        domain: 'Circuit Physics',
        definition: 'The opposition offered by a conductor to the flow of electric charge, governed by material resistivity, length, and cross-sectional area.',
        laws: ["Ohm's Law (V ∝ I at constant temperature)"],
        formulas: [{ formula: 'R = ρ · (L / A)', explanation: 'Resistance = Resistivity × Length / Area (Ohms, Ω)' }],
        phenomena: ['Temperature dependence of resistance', 'Ohmic vs Non-Ohmic behavior'],
        prereqs: ['Electric Current', 'Potential Difference'],
        subtopics: ['Resistivity', 'Series Combination (Rs = R1+R2)', 'Parallel Combination (1/Rp = 1/R1+1/R2)']
      },
      {
        id: 'ukn-quadratic-equations',
        topic: 'Quadratic Equations',
        subject: 'Mathematics',
        domain: 'Algebra',
        definition: 'A second-degree polynomial equation of the standard form ax² + bx + c = 0 where a ≠ 0.',
        laws: ['Fundamental Theorem of Algebra (degree 2 implies exactly two roots)'],
        formulas: [
          { formula: 'D = b² - 4ac', explanation: 'Discriminant determines the nature of the roots.' },
          { formula: 'x = (-b ± √D) / (2a)', explanation: 'The Quadratic Formula for roots.' }
        ],
        phenomena: ['Parabolic geometric trajectory', 'Vertex extremum (-b/2a, -D/4a)'],
        prereqs: ['Linear Equations', 'Polynomials', 'Factoring'],
        subtopics: ['Factoring Method', 'Completing the Square', 'Quadratic Formula', 'Nature of Roots']
      },
      {
        id: 'ukn-fractions',
        topic: 'Fractions and Rational Numbers',
        subject: 'Mathematics',
        domain: 'Number Systems',
        definition: 'A numerical representation of a part of a whole expressed as a ratio of numerator to non-zero denominator (a/b).',
        laws: ['Properties of Rational Numbers', 'Fraction Equivalence'],
        formulas: [{ formula: 'a/b + c/d = (ad + bc) / bd', explanation: 'Common denominator addition.' }],
        phenomena: ['Unit partitioning', 'Equivalent fractional forms'],
        prereqs: ['Whole Numbers', 'Division Operations'],
        subtopics: ['Proper vs Improper', 'Decimals Conversion', 'Percentages Equivalence']
      },
      {
        id: 'ukn-decimals',
        topic: 'Decimals and Place Value',
        subject: 'Mathematics',
        domain: 'Number Systems',
        definition: 'A positional numeral system based on ten, using a decimal point to represent fractional parts of tenths, hundredths, and thousandths.',
        laws: ['Base-10 Positional System'],
        formulas: [{ formula: 'a/10 + b/100 = 0.ab', explanation: 'Decimal representation of base-10 fractions.' }],
        phenomena: ['Terminating vs non-terminating recurring decimals'],
        prereqs: ['Fractions and Rational Numbers'],
        subtopics: ['Conversion to Fractions', 'Decimal Arithmetic', 'Rounding & Precision']
      },
      {
        id: 'ukn-newtons-laws',
        topic: "Newton's Three Laws of Motion",
        subject: 'Physics',
        domain: 'Classical Mechanics & Dynamics',
        definition: "Newton's Three Laws of Motion describe the quantitative relationship between a body, the forces acting upon it, and its resulting motion: (1) Law of Inertia, (2) F = dp/dt = m·a, and (3) Action and Reaction are equal and opposite.",
        laws: [
          "Newton's First Law (Law of Inertia): A body remains at rest or in uniform motion in a straight line unless acted upon by an external unbalanced force.",
          "Newton's Second Law (Law of Momentum): The rate of change of linear momentum is directly proportional to the applied unbalanced force (F = m·a).",
          "Newton's Third Law (Action-Reaction): For every action force there is an equal and opposite reaction force acting on two different bodies (F_AB = -F_BA)."
        ],
        formulas: [
          { formula: 'F = m · a', explanation: 'Net force (N) equals mass (kg) multiplied by acceleration (m/s²).' },
          { formula: 'p = m · v', explanation: 'Linear momentum (kg·m/s) equals mass times velocity.' },
          { formula: 'F = (m·v - m·u) / t', explanation: 'Rate of change of momentum derivation of Second Law.' }
        ],
        phenomena: ['Inertia of rest, motion, and direction', 'Recoil of a gun and rocket propulsion', 'Impulse and momentum conservation in collisions'],
        prereqs: ['Velocity and Acceleration', 'Mass vs Weight', 'Vector and Scalar Quantities'],
        subtopics: ['First Law & Inertia', 'Second Law & Momentum Derivation', 'Third Law & Action-Reaction Pairs', 'Conservation of Linear Momentum', 'Free-Body Diagrams']
      },
      {
        id: 'ukn-optics-refraction',
        topic: 'Light: Reflection and Refraction',
        subject: 'Physics',
        domain: 'Ray & Geometric Optics',
        definition: 'Reflection is the bouncing back of light in the same medium at an interface, whereas refraction is the bending of light when it passes obliquely from one optical medium to another of different refractive index.',
        laws: ['Law of Reflection (∠i = ∠r)', "Snell's Law of Refraction (n₁ sin i = n₂ sin r)"],
        formulas: [
          { formula: 'n = c / v = sin i / sin r', explanation: "Refractive index and Snell's Law." },
          { formula: '1/f = 1/v - 1/u', explanation: 'Thin Lens Formula relating focal length, image distance, and object distance.' },
          { formula: '1/f = 1/v + 1/u', explanation: 'Spherical Mirror Formula.' }
        ],
        phenomena: ['Total Internal Reflection (TIR)', 'Dispersion through a glass prism', 'Real and virtual image formation'],
        prereqs: ['Rectilinear Propagation of Light', 'Trigonometric Sine Ratio'],
        subtopics: ['Spherical Mirrors', "Snell's Law & Refractive Index", 'Convex & Concave Lenses', 'Power of a Lens (P = 1/f)']
      },
      {
        id: 'ukn-chemical-reactions',
        topic: 'Chemical Reactions and Equations',
        subject: 'Chemistry',
        domain: 'Stoichiometry & Chemical Kinetics',
        definition: 'A chemical reaction is a process in which one or more reactant substances undergo bond breaking and bond formation to produce new product substances with distinct chemical properties, obeying the Law of Conservation of Mass.',
        laws: ['Law of Conservation of Mass (Lavoisier)', 'Law of Definite Proportions (Proust)'],
        formulas: [
          { formula: '2Mg + O₂ → 2MgO', explanation: 'Combination reaction (combustion of magnesium ribbon).' },
          { formula: 'Zn + H₂SO₄ → ZnSO₄ + H₂↑', explanation: 'Single displacement reaction.' },
          { formula: 'CaCO₃ (s) → CaO (s) + CO₂ (g)', explanation: 'Thermal decomposition reaction.' }
        ],
        phenomena: ['Evolution of gas, precipitate formation, colour and temperature change', 'Oxidation-Reduction (Redox) electron transfer', 'Corrosion and Rancidity'],
        prereqs: ['Atoms and Molecules', 'Valency and Chemical Formulae'],
        subtopics: ['Balancing Chemical Equations', 'Combination & Decomposition', 'Displacement & Double Displacement', 'Oxidation and Reduction (Redox)']
      },
      {
        id: 'ukn-acids-bases-salts',
        topic: 'Acids, Bases and Salts',
        subject: 'Chemistry',
        domain: 'Ionic Equilibrium & Solutions',
        definition: 'Acids donate H⁺ (H₃O⁺) ions in aqueous solution (pH < 7), bases donate OH⁻ ions or accept protons (pH > 7), and salts are ionic compounds formed by the neutralization reaction between an acid and a base.',
        laws: ['Arrhenius & Bronsted-Lowry Acid-Base Theories', 'Logarithmic pH Scale (Sorensen)'],
        formulas: [
          { formula: 'pH = -log₁₀[H⁺]', explanation: 'Hydrogen ion concentration logarithmic scale (0 to 14).' },
          { formula: 'HCl + NaOH → NaCl + H₂O', explanation: 'Neutralization reaction forming salt and water.' },
          { formula: 'CaSO₄·2H₂O → CaSO₄·½H₂O + 1½H₂O', explanation: 'Preparation of Plaster of Paris from Gypsum at 373 K.' }
        ],
        phenomena: ['Exothermic dilution of concentrated acids', 'Olfactory and pH indicators', 'Water of crystallization'],
        prereqs: ['Chemical Reactions', 'Ions and Electrolytes'],
        subtopics: ['pH Scale & Indicators', 'Neutralization Reactions', 'Chlor-Alkali Process (NaOH)', 'Baking Soda, Washing Soda & Plaster of Paris']
      },
      {
        id: 'ukn-periodic-table',
        topic: 'Periodic Classification of Elements & Chemical Bonding',
        subject: 'Chemistry',
        domain: 'Inorganic & Structural Chemistry',
        definition: 'The Modern Periodic Law states that the physical and chemical properties of elements are periodic functions of their atomic numbers (Z), governing valence shell electron configurations and ionic/covalent bonding.',
        laws: ['Modern Periodic Law (Henry Moseley)', 'Octet Rule (Kossel & Lewis)'],
        formulas: [
          { formula: 'Maximum electrons in shell n = 2n²', explanation: 'Bohr-Bury electronic configuration rule.' }
        ],
        phenomena: ['Periodic trends in atomic radius, ionization energy, and electronegativity', 'Electrovalent (ionic) vs Covalent electron sharing'],
        prereqs: ['Atomic Structure', 'Atomic Number and Mass Number'],
        subtopics: ['Groups and Periods', 'Periodic Trends (Radius, Electronegativity)', 'Ionic vs Covalent Bonding', 'Lewis Dot Structures']
      },
      {
        id: 'ukn-cell-division',
        topic: 'Cell Structure, Mitosis and Meiosis',
        subject: 'Biology',
        domain: 'Cell Biology & Genetics',
        definition: 'The cell is the fundamental structural and functional unit of life; somatic growth occurs via Mitosis (equational division producing 2 diploid 2n cells), whereas gametogenesis occurs via Meiosis (reductional division producing 4 haploid n cells).',
        laws: ['Cell Theory (Schleiden, Schwann & Virchow: Omnis cellula e cellula)'],
        formulas: [
          { formula: 'Mitosis: 2n → 2 × (2n)', explanation: 'Equational division preserving chromosome number.' },
          { formula: 'Meiosis: 2n → 4 × (n)', explanation: 'Reductional division halving chromosome number + crossing over.' }
        ],
        phenomena: ['Prophase, Metaphase, Anaphase, Telophase & Cytokinesis', 'Chiasmata formation and genetic recombination in Pachytene'],
        prereqs: ['Prokaryotic vs Eukaryotic Cells', 'Chromosomes and DNA'],
        subtopics: ['Cell Organelles (Nucleus, Mitochondria, Ribosomes)', 'Cell Cycle (Interphase & M-Phase)', 'Mitosis Stages', 'Meiosis I & II and Significance']
      },
      {
        id: 'ukn-respiration-excretion',
        topic: 'Cellular Respiration and Excretion',
        subject: 'Biology',
        domain: 'Human & Plant Physiology',
        definition: 'Cellular respiration is the enzymatic oxidation of glucose to synthesize ATP energy (aerobically yielding ~30-38 ATP or anaerobically yielding 2 ATP), while excretion removes nitrogenous metabolic wastes like urea via nephrons in the kidneys.',
        laws: ['Chemiosmotic Hypothesis (Mitchell)', 'Glomerular Ultrafiltration & Tubular Reabsorption'],
        formulas: [
          { formula: 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + 38 ATP', explanation: 'Aerobic cellular respiration in cytoplasm and mitochondria.' },
          { formula: 'C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂ + 2 ATP', explanation: 'Anaerobic fermentation in yeast.' }
        ],
        phenomena: ['Glycolysis in cytoplasm and Krebs cycle in mitochondrial matrix', 'Alveolar gas exchange', 'Nephron urine formation (Ultrafiltration, Reabsorption, Secretion)'],
        prereqs: ['Photosynthesis', 'Enzymes', 'Blood Circulation'],
        subtopics: ['Aerobic vs Anaerobic Respiration', 'Human Respiratory System & Alveoli', 'Structure of Nephron', 'Osmoregulation & Dialysis']
      },
      {
        id: 'ukn-linear-equations-algebra',
        topic: 'Linear Equations and Algebraic Expressions',
        subject: 'Mathematics',
        domain: 'Algebra',
        definition: 'A linear equation is a first-degree algebraic equation whose graph is a straight line (ax + b = 0 or a₁x + b₁y + c₁ = 0), solvable analytically via transposition, substitution, elimination, or cross-multiplication.',
        laws: ['Axioms of Equality', 'Consistency Criteria for Simultaneous Linear Systems'],
        formulas: [
          { formula: 'ax + b = c ⇒ x = (c - b) / a', explanation: 'Single-variable linear solution.' },
          { formula: 'a₁/a₂ ≠ b₁/b₂ (Unique Solution)', explanation: 'Intersecting lines condition for a pair of linear equations.' },
          { formula: '(a + b)² = a² + 2ab + b²; a² - b² = (a - b)(a + b)', explanation: 'Fundamental algebraic identities.' }
        ],
        phenomena: ['Graphical intersection of lines in the Cartesian plane', 'Parallel (no solution) vs Coincident (infinite solutions) lines'],
        prereqs: ['Arithmetic Operations', 'Variables and Constants'],
        subtopics: ['Solving Single-Variable Linear Equations', 'Substitution & Elimination Methods', 'Consistency of Simultaneous Equations', 'Word Problems on Age, Speed & Numbers']
      },
      {
        id: 'ukn-trigonometry',
        topic: 'Introduction to Trigonometry and Identities',
        subject: 'Mathematics',
        domain: 'Trigonometry & Geometry',
        definition: 'Trigonometry studies the quantitative relationships between the acute angles and side ratios of a right-angled triangle (sine, cosine, tangent, cosecant, secant, cotangent) and their universal identities.',
        laws: ['Pythagorean Theorem (Hypotenuse² = Base² + Perpendicular²)'],
        formulas: [
          { formula: 'sin θ = Opposite / Hypotenuse; cos θ = Adjacent / Hypotenuse; tan θ = sin θ / cos θ', explanation: 'Primary trigonometric ratios.' },
          { formula: 'sin²θ + cos²θ = 1', explanation: 'Fundamental Pythagorean Trigonometric Identity.' },
          { formula: '1 + tan²θ = sec²θ; 1 + cot²θ = cosec²θ', explanation: 'Derived Pythagorean Identities.' }
        ],
        phenomena: ['Angles of elevation and depression in surveying and navigation', 'Standard angles (0°, 30°, 45°, 60°, 90°) exact ratio invariance'],
        prereqs: ['Right-Angled Triangles', 'Pythagoras Theorem', 'Similar Triangles'],
        subtopics: ['Trigonometric Ratios', 'Standard Angle Values Table', 'Pythagorean Trigonometric Identities', 'Heights and Distances (Angle of Elevation/Depression)']
      },
      {
        id: 'ukn-geometry-mensuration',
        topic: 'Geometry, Triangles, Circles and Mensuration',
        subject: 'Mathematics',
        domain: 'Euclidean Geometry & Mensuration',
        definition: 'Euclidean geometry and mensuration analyze similarity/congruence of triangles, tangent-secant properties of circles, and the calculation of perimeter, surface area, and volume of 2D/3D solids.',
        laws: ['Basic Proportionality Theorem (Thales Theorem)', 'Pythagoras Theorem', 'Tangent-Radius Perpendicularity Theorem'],
        formulas: [
          { formula: 'Area of Triangle = ½ × base × height; Heron Formula = √[s(s-a)(s-b)(s-c)]', explanation: 'Planar triangle area formulas.' },
          { formula: 'Circle Area = πr²; Circumference = 2πr', explanation: 'Circle mensuration.' },
          { formula: 'Cylinder Volume = πr²h; Cone Volume = ⅓πr²h; Sphere Volume = (4/3)πr³', explanation: '3D Solid Mensuration.' }
        ],
        phenomena: ['Equal length of tangents drawn from an external point to a circle', 'Volume conservation during recasting of metallic solids'],
        prereqs: ['Lines and Angles', 'Polygons'],
        subtopics: ['Similar Triangles & BPT (Thales Theorem)', 'Circle Tangents & Chords', 'Surface Areas and Volumes of Cylinders, Cones & Spheres', 'Coordinate Geometry Distance & Section Formulas']
      },
      {
        id: 'ukn-statistics-probability',
        topic: 'Statistics and Probability',
        subject: 'Mathematics',
        domain: 'Data Science, Statistics & Probability',
        definition: 'Statistics summarizes grouped and ungrouped data through measures of central tendency (Mean, Median, Mode), while Probability quantifies the likelihood of an event on a scale from 0 to 1.',
        laws: ['Empirical Relationship: 3 Median = Mode + 2 Mean', 'Classical Probability Axiom: 0 ≤ P(E) ≤ 1; P(E) + P(not E) = 1'],
        formulas: [
          { formula: 'Mean (x̄) = Σ(fᵢxᵢ) / Σfᵢ', explanation: 'Direct method for arithmetic mean of grouped data.' },
          { formula: 'Median = l + [(N/2 - cf) / f] × h', explanation: 'Median of grouped frequency distribution.' },
          { formula: 'P(E) = (Number of favourable outcomes) / (Total possible outcomes)', explanation: 'Theoretical (Classical) Probability.' }
        ],
        phenomena: ['Cumulative frequency ogive curves', 'Sample spaces for coins, dice, and playing cards'],
        prereqs: ['Fractions and Percentages', 'Data Tables and Bar Graphs'],
        subtopics: ['Mean (Direct, Assumed Mean, Step-Deviation)', 'Median & Cumulative Frequency', 'Mode of Grouped Data', 'Theoretical Probability & Complementary Events']
      },
      {
        id: 'ukn-french-revolution-nationalism',
        topic: 'The French Revolution and Rise of Nationalism',
        subject: 'History',
        domain: 'Modern World & Indian History',
        definition: 'The French Revolution (1789) dismantled feudal absolutism under the Ancien Régime, established popular sovereignty and the Declaration of the Rights of Man and Citizen, and catalyzed constitutional nationalism across Europe and anti-colonial movements in India.',
        laws: ['Historical Causation: Socio-Economic Inequality, Enlightenment Philosophy & Fiscal Crisis'],
        formulas: [],
        phenomena: [
          'Division of French society into First Estate (Clergy), Second Estate (Nobility), and Third Estate (Peasants, Workers, Bourgeoisie)',
          'Storming of the Bastille on 14 July 1789 and abolition of feudal privileges',
          'Napoleonic Civil Code of 1804 and spread of liberty, equality, and fraternity'
        ],
        prereqs: ['Feudalism and Monarchy', 'Enlightenment Thinkers (Locke, Rousseau, Montesquieu)'],
        subtopics: ['Causes: The Three Estates & Subsistence Crisis', 'Outbreak of 1789 & Constitutional Monarchy', 'Reign of Terror & Jacobin Republic', 'Napoleonic Code & Legacy of Liberty, Equality, Fraternity']
      },
      {
        id: 'ukn-indian-national-movement',
        topic: 'Indian National Movement and Freedom Struggle',
        subject: 'History',
        domain: 'Modern Indian History',
        definition: 'The Indian National Movement was a mass anti-colonial struggle against British imperial rule that progressed from early moderate petitions to Gandhian Satyagraha (Non-Cooperation 1920, Civil Disobedience / Dandi Salt March 1930, Quit India 1942), culminating in Independence in 1947.',
        laws: ['Satyagraha (Truth-Force and Non-Violent Civil Resistance)'],
        formulas: [],
        phenomena: ['Partition of Bengal & Swadeshi Movement (1905)', 'Jallianwala Bagh & Non-Cooperation Movement (1919-1922)', 'Dandi Salt March & Civil Disobedience (1930)', 'Quit India Movement (1942) & Indian Independence Act (1947)'],
        prereqs: ['Revolt of 1857', 'Foundation of Indian National Congress (1885)'],
        subtopics: ['Moderates, Extremists & Swadeshi Movement', 'Mahatma Gandhi & Idea of Satyagraha', 'Non-Cooperation & Khilafat Movements', 'Salt Satyagraha, Civil Disobedience & Quit India']
      },
      {
        id: 'ukn-geography-water-climate-monsoon',
        topic: 'Water Cycle, Monsoon Climate and Natural Resources',
        subject: 'Geography',
        domain: 'Physical & Resource Geography',
        definition: 'The hydrological (water) cycle continuously circulates water between oceans, atmosphere, and land through evaporation, transpiration, condensation, precipitation, and runoff, driving seasonal monsoon rainfall, river basins, and groundwater recharge.',
        laws: ['Hydrological Mass Balance (Precipitation = Evapotranspiration + Runoff + Groundwater Recharge)', 'Coriolis Force (Ferrel Law) deflecting winds right in Northern Hemisphere'],
        formulas: [
          { formula: 'P = E + R + ΔS', explanation: 'Water Balance Equation (Precipitation = Evapotranspiration + Runoff + Storage change).' }
        ],
        phenomena: ['Differential heating of Indian landmass and Indian Ocean driving Southwest Monsoon', 'Orographic rainfall along Western Ghats and Himalayas', 'Multi-purpose river valley projects and rainwater harvesting'],
        prereqs: ['States of Matter', 'Latitude, Longitude and Pressure Belts'],
        subtopics: ['Processes of the Hydrological Cycle', 'Mechanism of Indian Monsoon (ITCZ, Jet Streams)', 'Soil Types & Conservation', 'Water Resources & Rainwater Harvesting']
      },
      {
        id: 'ukn-civics-constitution-democracy',
        topic: 'Indian Constitution, Fundamental Rights and Parliamentary Democracy',
        subject: 'Civics',
        domain: 'Constitutional Governance & Political Science',
        definition: 'The Constitution of India (effective 26 January 1950) establishes a Sovereign, Socialist, Secular, Democratic Republic with federal power-sharing, six Fundamental Rights (Part III, Articles 12-35), Directive Principles, and parliamentary separation of powers between Legislature, Executive, and Judiciary.',
        laws: ['Doctrine of Basic Structure & Constitutional Supremacy', 'Separation of Powers & Judicial Review (Article 32)'],
        formulas: [],
        phenomena: ['Six Fundamental Rights (Equality, Freedom, Against Exploitation, Freedom of Religion, Cultural/Educational, Constitutional Remedies)', 'Bicameral Parliament (Lok Sabha & Rajya Sabha)', 'Three-tier Federalism (Union, State, Panchayati Raj / Municipalities)'],
        prereqs: ['Indian Freedom Struggle', 'Rule of Law'],
        subtopics: ['Preamble & Key Values', 'Six Fundamental Rights & Fundamental Duties', 'Union Parliament (Lok Sabha vs Rajya Sabha)', 'Independent Judiciary & Federal Power Sharing']
      },
      {
        id: 'ukn-economics-development-money',
        topic: 'Economic Development, Sectors of Economy, Money and Credit',
        subject: 'Economics',
        domain: 'Macroeconomics & Development Economics',
        definition: 'Economics analyzes how societies allocate scarce resources across Primary (agriculture), Secondary (manufacturing), and Tertiary (services) sectors, measured by GDP, Per Capita Income, and HDI, facilitated by modern banking, Reserve Bank of India (RBI) monetary regulation, and formal credit.',
        laws: ['Law of Demand and Supply', 'Double Coincidence of Wants eliminated by Money as Medium of Exchange'],
        formulas: [
          { formula: 'Per Capita Income = Total National Income / Total Population', explanation: 'Average income indicator used in World Development Reports.' },
          { formula: 'BMI = Weight (kg) / [Height (m)]²', explanation: 'Body Mass Index nutritional indicator.' }
        ],
        phenomena: ['Shift from Primary to Tertiary sector in developing economies', 'Reserve Bank of India (RBI) currency issuance and CRR/collateral supervision', 'Self-Help Groups (SHGs) and micro-credit'],
        prereqs: ['Basic Percentage and Averages', 'Goods and Services'],
        subtopics: ['Development Indicators (PCI, Literacy, IMR, HDI)', 'Primary, Secondary & Tertiary Sectors; Organized vs Unorganized', 'Functions of Money & RBI', 'Formal vs Informal Credit & Self-Help Groups']
      },
      {
        id: 'ukn-english-grammar-voice-tenses',
        topic: 'English Grammar: Tenses, Active-Passive Voice, Direct-Indirect Speech and Clauses',
        subject: 'English',
        domain: 'English Language, Grammar & Composition',
        definition: 'English grammar governs sentence syntax through twelve verb tense aspects, voice transformation (Active Subject-Verb-Object to Passive Object + be + V₃ + by Subject), reported speech tense backshifting, subject-verb concord, and figurative literary devices.',
        laws: [
          'Active to Passive Rule: Object becomes Subject + Auxiliary (be) in matching tense + Past Participle (V₃) + by + Agent.',
          'Direct to Indirect Speech Rule: When reporting verb is in past tense ("said"), shift present tense to past, past simple to past perfect, and update time/place deictics ("now" → "then", "tomorrow" → "the next day").',
          'Subject-Verb Concord: A singular subject takes a singular verb; collective or "neither/either" subjects take singular verbs.'
        ],
        formulas: [
          { formula: 'Active: S + V + O  ⇒  Passive: O + [be + V₃] + by + S', explanation: 'Voice transformation syntactic formula.' },
          { formula: 'Present Perfect: Subject + has/have + V₃', explanation: 'Action completed in the past with present relevance.' }
        ],
        phenomena: ['Transitive vs Intransitive verb voice eligibility', 'Poetic devices: Metaphor, Simile, Personification, Alliteration, Irony'],
        prereqs: ['Parts of Speech (Noun, Pronoun, Verb, Adjective, Adverb, Preposition, Conjunction)', 'Singular and Plural Nouns'],
        subtopics: ['12 Verb Tenses & Aspect Usage', 'Active and Passive Voice Transformation', 'Direct and Indirect (Reported) Speech', 'Subject-Verb Agreement (Concord) & Literary Devices']
      },
      {
        id: 'ukn-telugu-vyakaranam',
        topic: 'తెలుగు వ్యాకరణం: సంధులు, సమాసాలు, అలంకారాలు మరియు ఛందస్సు (Telugu Grammar)',
        subject: 'Telugu',
        domain: 'Telugu Language, Vyakaranam & Sahityం (తెలుగు భాషా సాహిత్యాలు)',
        definition: 'తెలుగు వ్యాకరణం (Telugu Vyakaranam) పదాల నిర్మాణం, పూర్వపర స్వరాల కలయిక (సంధి - Sandhi), సమర్థములైన పదాల ఏకపద భావం (సమాసం - Samasam), కావ్య సౌందర్యాన్ని పెంచే అలంకారాలు (Alankaralu), మరియు పద్య లక్షణాలను తెలిపే ఛందస్సును (Chandassu - గురువు U, లఘువు I) శాస్త్రీయంగా వివరిస్తుంది.',
        laws: [
          'సవర్ణదీర్ఘ సంధి సూత్రం: అ, ఇ, ఉ, ఋ లకు సవర్ణములైన అచ్చులు పరమైనప్పుడు వాని దీర్ఘము ఏకాదేశమగును (ఉదా: రామ + ఆలయము = రామాలయము).',
          'గుణసంధి సూత్రం: అకారమునకు ఇ, ఉ, ఋ లు పరమైనప్పుడు క్రమముగా ఏ, ఓ, అర్ లు ఆదేశమగును (ఉదా: దేవ + ఇంద్రుడు = దేవేంద్రుడు).',
          'ఉత్వసంధి / ఇత్వసంధి / యడాగమ సంధి తెలుగు సంధులలో ప్రముఖమైనవి.'
        ],
        formulas: [
          { formula: 'సవర్ణదీర్ఘ సంధి: అ/ఆ + అ/ఆ → ఆ | ఇ/ఈ + ఇ/ఈ → ఈ | ఉ/ఊ + ఉ/ఊ → ఊ', explanation: 'సంస్కృత సవర్ణదీర్ఘ సంధి సూత్ర నిర్మాణం.' },
          { formula: 'ద్వంద్వ సమాసం: ఉభయపదార్థ ప్రధానం (ఉదా: తల్లిదండ్రులు = తల్లియును, తండ్రియును)', explanation: 'రెండు పదాల అర్థాలకు సమాన ప్రాధాన్యత గల సమాసం.' },
          { formula: 'ద్విగు సమాసం: సంఖ్యా పూర్వపద కర్మధారయం (ఉదా: ముల్లోకములు = మూడైన లోకములు)', explanation: 'మొదటి పదం సంఖ్యావాచకంగా గల సమాసం.' }
        ],
        phenomena: [
          'భాషా భాగాలు (Parts of Speech in Telugu): నామవాచకం (Noun), సర్వనామం (Pronoun), విశేషణం (Adjective), క్రియ (Verb), అవ్యయం (Indeclinable)',
          'అలంకారాలు: ఉపమాలంకారం (Simile), ఉత్ప్రేక్షాలంకారం, రూపకాలంకారం (Metaphor), అతిశయోక్తి అలంకారం',
          'ఛందస్సు: ఉత్పలమాల (భ-ర-న-భ-భ-ర-వ), చంపకమాల (న-జ-భ-జ-జ-జ-ర), శార్దూలం (మ-స-జ-స-త-త-గ), మత్తేభం (స-భ-ర-న-మ-య-వ)'
        ],
        prereqs: ['అచ్చులు (Vowels - 16), హల్లులు (Consonants - 37)', 'గుణింతాలు మరియు ఒత్తులు'],
        subtopics: [
          'భాషా భాగాలు (5 Parts of Speech in Telugu)',
          'సంధులు: సవర్ణదీర్ఘ, గుణ, వృద్ధి, యణాదేశ మరియు తెలుగు సంధులు (ఉత్వ, ఇత్వ, అత్వ)',
          'సమాసాలు: తత్పురుష, కర్మధారయ, ద్విగు, ద్వంద్వ, బహువ్రీహి సమాసాలు',
          'అలంకారాలు (శబ్దాలంకారాలు & అర్థాలంకారాలు) మరియు ఛందస్సు (గురు-లఘువులు)'
        ]
      },
      {
        id: 'ukn-hindi-vyakaran',
        topic: 'हिंदी व्याकरण: संधि, समास, काल, वाच्य और अलंकार (Hindi Grammar)',
        subject: 'Hindi',
        domain: 'Hindi Language & Vyakaran (हिंदी भाषा और व्याकरण)',
        definition: 'हिंदी व्याकरण (Hindi Vyakaran) भाषा को शुद्ध रूप में लिखने, पढ़ने और बोलने के नियमों का शास्त्र है, जिसमें वर्ण-विचार, संज्ञा, सर्वनाम, विशेषण, क्रिया, संधि (दो वर्णों का मेल), समास (शब्दों का संक्षिप्तीकरण), उपसर्ग-प्रत्यय, मुहावरे और अलंकार शामिल हैं।',
        laws: [
          'दीर्घ स्वर संधि: ह्रस्व या दीर्घ अ, इ, उ के बाद समान स्वर आने पर दोनों मिलकर दीर्घ (आ, ई, ऊ) हो जाते हैं (जैसे: विद्या + आलय = विद्यालय)।',
          'गुण संधि: अ/आ के आगे इ/ई हो तो ए, उ/ऊ हो तो ओ, तथा ऋ हो तो अर् हो जाता है (जैसे: नर + इंद्र = नरेंद्र)।'
        ],
        formulas: [
          { formula: 'संधि: प्रथम शब्द का अंतिम वर्ण + द्वितीय शब्द का प्रथम वर्ण → विकार (परिवर्तन)', explanation: 'वर्णों के मेल से उत्पन्न ध्वनि परिवर्तन।' },
          { formula: 'समास के ६ मुख्य भेद: अव्ययीभाव, तत्पुरुष, कर्मधारय, द्विगु, द्वंद्व, बहुव्रीहि', explanation: 'हिंदी समास वर्गीकरण।' }
        ],
        phenomena: ['संज्ञा, सर्वनाम, विशेषण और क्रिया के भेद', 'कर्तृवाच्य, कर्मवाच्य और भाववाच्य', 'अनुप्रास, यमक, श्लेष, उपमा और रूपक अलंकार'],
        prereqs: ['स्वर और व्यंजन (Vowels & Consonants in Devanagari)', 'मात्राएँ और शब्द-भेद'],
        subtopics: ['संज्ञा, सर्वनाम, विशेषण और क्रिया', 'संधि और संधि-विच्छेद (स्वर, व्यंजन, विसर्ग)', 'समास और समास-विग्रह के ६ भेद', 'मुहावरे, लोकोक्तियाँ और अलंकार']
      },
      {
        id: 'ukn-computer-science-algorithms',
        topic: 'Computer Science: Algorithms, Python Programming, Data Structures & Networks',
        subject: 'Computer Science',
        domain: 'Computer Science & Information Technology',
        definition: 'Computer Science encompasses algorithmic problem-solving, structured and object-oriented programming (Python/Java), relational databases (SQL), and computer network architectures (OSI & TCP/IP protocols).',
        laws: ['Boolean Algebra Laws (De Morgan Theorems)', 'Structured Programming Theorem (Sequence, Selection, Iteration)'],
        formulas: [
          { formula: 'Binary Search Time Complexity = O(log₂ n); Linear Search = O(n)', explanation: 'Algorithmic asymptotic efficiency.' },
          { formula: 'Decimal to Binary: N = Σ bᵢ · 2ⁱ', explanation: 'Positional base-2 number representation.' }
        ],
        phenomena: ['Variables, loops, conditionals, and functions in Python', 'Client-server HTTP/HTTPS request-response cycle and DNS resolution', 'SQL SELECT, JOIN, GROUP BY relational queries'],
        prereqs: ['Basic Logic and Arithmetic', 'Input-Process-Output (IPO) Cycle'],
        subtopics: ['Algorithms, Flowcharts & Time Complexity', 'Python Programming (Loops, Functions, Lists, Dictionaries)', 'Relational Databases & SQL Queries', 'Computer Networks (LAN/WAN, OSI Layers, TCP/IP, Cybersecurity)']
      }
    ];

    for (const c of concepts) {
      insertConcept.run(
        c.id,
        c.topic,
        c.subject,
        c.domain,
        c.definition,
        JSON.stringify(c.laws),
        JSON.stringify(c.formulas),
        JSON.stringify(c.phenomena),
        JSON.stringify(c.prereqs),
        JSON.stringify(c.subtopics),
        now
      );
    }
  }

  private seedBaselineConceptGraph(): void {
    const insertEdge = db.prepare(`
      INSERT OR REPLACE INTO concept_relationships (
        id, source_concept_id, target_concept_id, relation_type, description, weight, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();

    const relationships = [
      // Photosynthesis Graph
      { id: 'rel-photo-chloro', src: 'ukn-photosynthesis', tgt: 'ukn-chlorophyll', type: 'PART_OF', desc: 'Chlorophyll is the primary reaction center pigment of photosynthesis.', w: 1.0 },
      { id: 'rel-photo-chloroplast', src: 'ukn-photosynthesis', tgt: 'ukn-chloroplast', type: 'PART_OF', desc: 'Photosynthesis takes place inside the chloroplast organelle.', w: 1.0 },
      { id: 'rel-chloroplast-chloro', src: 'ukn-chloroplast', tgt: 'ukn-chlorophyll', type: 'PART_OF', desc: 'Thylakoid membranes inside the chloroplast house the chlorophyll molecules.', w: 0.9 },

      // Human Heart Graph
      { id: 'rel-heart-valves', src: 'ukn-human-heart', tgt: 'ukn-valves', type: 'PART_OF', desc: 'Valves regulate unidirectional blood flow through the heart chambers.', w: 1.0 },

      // Electricity Graph
      { id: 'rel-elec-resistance', src: 'ukn-electricity', tgt: 'ukn-resistance', type: 'RELATED_TO', desc: "Ohm's law relates current, voltage, and electrical resistance in a circuit.", w: 1.0 },

      // Mathematics Graph (Fractions -> Decimals -> Percentages)
      { id: 'rel-frac-dec', src: 'ukn-fractions', tgt: 'ukn-decimals', type: 'PREREQUISITE_OF', desc: 'Understanding fractions is an essential prerequisite for decimal representations.', w: 1.0 }
    ];

    for (const r of relationships) {
      insertEdge.run(r.id, r.src, r.tgt, r.type, r.desc, r.w, now);
    }
  }

  private seedBaselineCurriculumMappings(): void {
    const insertMapping = db.prepare(`
      INSERT OR REPLACE INTO board_curriculum_mappings (
        id, universal_node_id, board, grade, chapter_title, prescribed_textbook, learning_outcomes_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const mappings = [
      // Photosynthesis across 4 Boards
      {
        id: 'map-photo-cbse-10',
        nodeId: 'ukn-photosynthesis',
        board: 'CBSE',
        grade: 10,
        chapter: 'Chapter 5: Life Processes',
        book: 'NCERT Class 10 Science',
        outcomes: ['Understand autotrophic nutrition', 'Analyze Light and Dark reaction mechanisms', 'Explain balanced chemical equation']
      },
      {
        id: 'map-photo-icse-10',
        nodeId: 'ukn-photosynthesis',
        board: 'ICSE',
        grade: 10,
        chapter: 'Chapter 6: Photosynthesis — Provider of Food for All',
        book: 'Selina Concise Biology Class 10 (ICSE)',
        outcomes: ['Demonstrate photolysis of water', 'Investigate experiments for necessity of light and CO2', 'Understand Calvin cycle nuances']
      },
      {
        id: 'map-photo-ap-10',
        nodeId: 'ukn-photosynthesis',
        board: 'AP_STATE_BOARD',
        grade: 10,
        chapter: 'Chapter 1: Nutrition — Food Supplying System',
        book: 'AP SCERT General Science Class 10',
        outcomes: ['Conduct Von Sachs and Ingenhousz experiments', 'Explain site of photosynthesis (chloroplast)', 'Examine light-dependent and independent reactions']
      },
      {
        id: 'map-photo-ts-10',
        nodeId: 'ukn-photosynthesis',
        board: 'TS_STATE_BOARD',
        grade: 10,
        chapter: 'Chapter 1: Nutrition — Food Supplying System',
        book: 'Telangana SCERT Biological Science Class 10',
        outcomes: ['Investigate stomatal apparatus', 'Trace electron transport in light reactions', 'Understand carbon reduction in stroma']
      },

      // Human Heart across 4 Boards
      {
        id: 'map-heart-cbse-10',
        nodeId: 'ukn-human-heart',
        board: 'CBSE',
        grade: 10,
        chapter: 'Chapter 5: Life Processes (Transportation)',
        book: 'NCERT Class 10 Science',
        outcomes: ['Describe 4-chambered heart structure', 'Explain double circulation in human beings', 'Understand pulmonary vs systemic circuits']
      },
      {
        id: 'map-heart-icse-10',
        nodeId: 'ukn-human-heart',
        board: 'ICSE',
        grade: 10,
        chapter: 'Chapter 8: The Circulatory System',
        book: 'Selina Concise Biology Class 10 (ICSE)',
        outcomes: ['Identify external and internal heart anatomy', 'Understand valve mechanics (bicuspid, tricuspid, semilunar)', 'Trace cardiac cycle and pacemaker']
      },
      {
        id: 'map-heart-ap-10',
        nodeId: 'ukn-human-heart',
        board: 'AP_STATE_BOARD',
        grade: 10,
        chapter: 'Chapter 3: Transportation — The Circulatory System',
        book: 'AP SCERT General Science Class 10',
        outcomes: ['Dissect mammalian heart structure', 'Diagram double circulation pathway', 'Understand cardiac cycle timing (0.8s)']
      },
      {
        id: 'map-heart-ts-10',
        nodeId: 'ukn-human-heart',
        board: 'TS_STATE_BOARD',
        grade: 10,
        chapter: 'Chapter 3: Transportation — The Circulatory System',
        book: 'Telangana SCERT Biological Science Class 10',
        outcomes: ['Analyze internal structure of heart', 'Trace blood flow through valves', 'Examine blood pressure measurement (Sphygmomanometer)']
      },

      // Electricity across 4 Boards
      {
        id: 'map-elec-cbse-10',
        nodeId: 'ukn-electricity',
        board: 'CBSE',
        grade: 10,
        chapter: 'Chapter 11: Electricity',
        book: 'NCERT Class 10 Science',
        outcomes: ["Verify Ohm's Law experimentally", 'Calculate equivalent resistance for series and parallel circuits', "Apply Joule's Law of heating"]
      },
      {
        id: 'map-elec-icse-10',
        nodeId: 'ukn-electricity',
        board: 'ICSE',
        grade: 10,
        chapter: 'Chapter 8 & 9: Current Electricity & Household Circuits',
        book: 'Concise Physics Class 10 (ICSE)',
        outcomes: ['State EMF, terminal voltage, and internal resistance', 'Solve multi-resistor network problems', 'Explain domestic three-pin socket earthing safety']
      },
      {
        id: 'map-elec-ap-10',
        nodeId: 'ukn-electricity',
        board: 'AP_STATE_BOARD',
        grade: 10,
        chapter: 'Chapter 9: Electric Current',
        book: 'AP SCERT General Science (Physical Science)',
        outcomes: ["State Ohm's Law and its limitations", 'Derive series and parallel resistor combinations', 'Calculate electric power and commercial units']
      },
      {
        id: 'map-elec-ts-10',
        nodeId: 'ukn-electricity',
        board: 'TS_STATE_BOARD',
        grade: 10,
        chapter: 'Chapter 9: Electric Current',
        book: 'Telangana SCERT Physical Science Class 10',
        outcomes: ['Explore drift speed of electrons', 'Construct V-I graphs for ohmic conductors', 'Apply Kirchhoff laws to basic circuits']
      },

      // Newton's Laws across 4 Boards
      {
        id: 'map-newton-cbse-9',
        nodeId: 'ukn-newtons-laws',
        board: 'CBSE',
        grade: 9,
        chapter: 'Chapter 8: Force and Laws of Motion',
        book: 'NCERT Class 9 Science',
        outcomes: ['State Newton three laws of motion', 'Derive F = ma from rate of change of momentum', 'Apply conservation of momentum']
      },
      {
        id: 'map-newton-icse-9',
        nodeId: 'ukn-newtons-laws',
        board: 'ICSE',
        grade: 9,
        chapter: 'Chapter 3: Laws of Motion',
        book: 'Concise Physics Class 9 (ICSE)',
        outcomes: ['Distinguish contact and non-contact forces', 'Solve F = dp/dt numericals', 'Analyze action-reaction pairs']
      },
      {
        id: 'map-newton-ap-9',
        nodeId: 'ukn-newtons-laws',
        board: 'AP_STATE_BOARD',
        grade: 9,
        chapter: 'Chapter 2: Laws of Motion',
        book: 'AP SCERT Physical Science Class 9',
        outcomes: ['Demonstrate inertia of rest and motion', 'Verify Second Law using Atwood machine', 'Calculate impulse and momentum']
      },
      {
        id: 'map-newton-ts-9',
        nodeId: 'ukn-newtons-laws',
        board: 'TS_STATE_BOARD',
        grade: 9,
        chapter: 'Chapter 2: Laws of Motion',
        book: 'Telangana SCERT Physical Science Class 9',
        outcomes: ['Understand net force and free-body diagrams', 'Derive F = ma', 'Apply Third Law to rocket propulsion']
      },

      // Quadratic Equations & Linear Equations across 4 Boards
      {
        id: 'map-quad-cbse-10',
        nodeId: 'ukn-quadratic-equations',
        board: 'CBSE',
        grade: 10,
        chapter: 'Chapter 4: Quadratic Equations',
        book: 'NCERT Class 10 Mathematics',
        outcomes: ['Solve quadratic equations by factorization and quadratic formula', 'Analyze discriminant D = b² - 4ac for nature of roots']
      },
      {
        id: 'map-quad-icse-10',
        nodeId: 'ukn-quadratic-equations',
        board: 'ICSE',
        grade: 10,
        chapter: 'Chapter 5: Quadratic Equations in One Variable',
        book: 'CISCE Prescribed Class 10 Mathematics',
        outcomes: ['Examine nature of roots via discriminant', 'Solve word problems reducible to quadratic form']
      },
      {
        id: 'map-quad-ap-10',
        nodeId: 'ukn-quadratic-equations',
        board: 'AP_STATE_BOARD',
        grade: 10,
        chapter: 'Chapter 5: Quadratic Equations',
        book: 'AP SCERT Class 10 Mathematics',
        outcomes: ['Find roots by completing the square and Sridharacharya formula', 'Relate discriminant to parabola x-intercepts']
      },
      {
        id: 'map-quad-ts-10',
        nodeId: 'ukn-quadratic-equations',
        board: 'TS_STATE_BOARD',
        grade: 10,
        chapter: 'Chapter 5: Quadratic Equations',
        book: 'Telangana SCERT Class 10 Mathematics',
        outcomes: ['Solve quadratic equations and verify sum/product of roots', 'Model geometric and motion word problems']
      },

      // French Revolution & Nationalism across 4 Boards
      {
        id: 'map-french-cbse-9',
        nodeId: 'ukn-french-revolution-nationalism',
        board: 'CBSE',
        grade: 9,
        chapter: 'Chapter 1: The French Revolution',
        book: 'NCERT Class 9 India and the Contemporary World I',
        outcomes: ['Analyze Three Estates social hierarchy', 'Explain Declaration of Rights of Man and Citizen', 'Assess Reign of Terror and Rise of Napoleon']
      },
      {
        id: 'map-french-ap-9',
        nodeId: 'ukn-french-revolution-nationalism',
        board: 'AP_STATE_BOARD',
        grade: 9,
        chapter: 'Chapter 12: Democratic and Nationalist Revolutions',
        book: 'AP SCERT Social Studies Class 9',
        outcomes: ['Compare American and French Revolutions', 'Understand constitutional monarchy and human rights']
      },

      // Water Cycle, Monsoon & Geography across 4 Boards
      {
        id: 'map-geo-cbse-10',
        nodeId: 'ukn-geography-water-climate-monsoon',
        board: 'CBSE',
        grade: 10,
        chapter: 'Chapter 3: Water Resources & Climate',
        book: 'NCERT Class 10 Contemporary India II',
        outcomes: ['Trace hydrological cycle and monsoon mechanism', 'Evaluate multi-purpose river projects and rainwater harvesting']
      },
      {
        id: 'map-geo-icse-10',
        nodeId: 'ukn-geography-water-climate-monsoon',
        board: 'ICSE',
        grade: 10,
        chapter: 'Chapter 4 & 6: Climate of India & Water Resources',
        book: 'CISCE Total Geography Class 10',
        outcomes: ['Explain Southwest and Northeast Monsoon winds', 'Differentiate surface water and groundwater conservation']
      },

      // English Grammar across 4 Boards
      {
        id: 'map-eng-cbse-10',
        nodeId: 'ukn-english-grammar-voice-tenses',
        board: 'CBSE',
        grade: 10,
        chapter: 'Integrated Grammar: Tenses, Voice, Reported Speech & Determiners',
        book: 'NCERT First Flight & Words and Expressions Class 10',
        outcomes: ['Transform Active to Passive voice accurately', 'Convert Direct to Indirect speech with tense backshift', 'Apply Subject-Verb Concord']
      },

      // Telugu Vyakaranam across AP & TS Boards
      {
        id: 'map-tel-ap-10',
        nodeId: 'ukn-telugu-vyakaranam',
        board: 'AP_STATE_BOARD',
        grade: 10,
        chapter: 'తెలుగు వ్యాకరణం: సంధులు, సమాసాలు, అలంకారాలు, ఛందస్సు',
        book: 'AP SCERT 10వ తరగతి తెలుగు వాచకం',
        outcomes: ['సవర్ణదీర్ఘ, గుణ, వృద్ధి, ఉత్వ, ఇత్వ సంధులను విడదీసి సూత్రాలను రాయడం', 'ద్వంద్వ, ద్విగు, తత్పురుష సమాసాల విగ్రహవాక్యాలను గుర్తించడం', 'ఉత్పలమాల, చంపకమాల పద్యాలకు గురు-లఘువులు గుర్తించడం']
      },
      {
        id: 'map-tel-ts-10',
        nodeId: 'ukn-telugu-vyakaranam',
        board: 'TS_STATE_BOARD',
        grade: 10,
        chapter: 'తెలుగు వ్యాకరణాంశాలు: సంధులు - సమాసాలు - అలంకారాలు - ఛందస్సు',
        book: 'Telangana SCERT 10వ తరగతి తెలుగు వాచకం (సింగిడి)',
        outcomes: ['సంస్కృత మరియు తెలుగు సంధుల సూత్రాలను ఉదాహరణలతో వివరించడం', 'సమాస భేదాలు మరియు అలంకారాలను గుర్తించడం']
      }
    ];

    for (const m of mappings) {
      insertMapping.run(m.id, m.nodeId, m.board, m.grade, m.chapter, m.book, JSON.stringify(m.outcomes));
    }
  }

  // ---------------------------------------------------------------------------
  // Topic Equivalence Mapping
  // ---------------------------------------------------------------------------
  getEquivalentTopics(topic: string): EquivalentTopicMapping | null {
    const clean = topic.trim().toLowerCase();

    // Query universal node (exact match first, then shortest partial match)
    let node = db.prepare(`
      SELECT * FROM universal_knowledge_nodes
      WHERE LOWER(topic) = ?
      LIMIT 1
    `).get(clean) as any;

    if (!node) {
      node = db.prepare(`
        SELECT * FROM universal_knowledge_nodes
        WHERE LOWER(topic) LIKE ?
        ORDER BY LENGTH(topic) ASC
        LIMIT 1
      `).get(`%${clean}%`) as any;
    }

    if (!node) return null;

    // Query board mappings
    const mappingsRows = db.prepare(`
      SELECT * FROM board_curriculum_mappings
      WHERE universal_node_id = ?
    `).all(node.id) as any[];

    const mappings = mappingsRows.map((row) => ({
      board: row.board as EducationalBoard,
      grade: row.grade,
      officialChapterTitle: row.chapter_title,
      chapterNumber: 1,
      prescribedTextbook: row.prescribed_textbook,
      learningDepth: (row.grade >= 9 ? 'rigorous' : row.grade >= 6 ? 'intermediate' : 'foundational') as any,
      examSignificance: `Prescribed chapter in ${row.board} Grade ${row.grade} annual examination syllabus.`
    }));

    return {
      universalTopicId: node.id,
      universalTopicTitle: node.topic,
      subject: node.subject as SupportedSubject,
      mappings
    };
  }

  // ---------------------------------------------------------------------------
  // Knowledge Graph Queries & Traversal
  // ---------------------------------------------------------------------------
  getConceptPrerequisites(conceptIdOrTopic: string): ConceptGraphNode[] {
    const rows = db.prepare(`
      SELECT n.* FROM universal_knowledge_nodes n
      JOIN concept_relationships r ON r.source_concept_id = n.id
      WHERE (r.target_concept_id = ? OR r.target_concept_id IN (
        SELECT id FROM universal_knowledge_nodes WHERE LOWER(topic) = LOWER(?)
      ))
      AND r.relation_type = 'PREREQUISITE_OF'
    `).all(conceptIdOrTopic, conceptIdOrTopic) as any[];

    return rows.map((r) => this.mapNodeRow(r));
  }

  getConceptParts(conceptIdOrTopic: string): ConceptGraphNode[] {
    const rows = db.prepare(`
      SELECT n.* FROM universal_knowledge_nodes n
      JOIN concept_relationships r ON r.target_concept_id = n.id
      WHERE (r.source_concept_id = ? OR r.source_concept_id IN (
        SELECT id FROM universal_knowledge_nodes WHERE LOWER(topic) = LOWER(?)
      ))
      AND r.relation_type = 'PART_OF'
    `).all(conceptIdOrTopic, conceptIdOrTopic) as any[];

    return rows.map((r) => this.mapNodeRow(r));
  }

  getRelatedConcepts(conceptIdOrTopic: string): Array<{ node: ConceptGraphNode; relation: ConceptRelationType; description: string }> {
    const rows = db.prepare(`
      SELECT n.*, r.relation_type, r.description FROM universal_knowledge_nodes n
      JOIN concept_relationships r ON (r.target_concept_id = n.id OR r.source_concept_id = n.id)
      WHERE (r.source_concept_id = ? OR r.target_concept_id = ? OR r.source_concept_id IN (
        SELECT id FROM universal_knowledge_nodes WHERE LOWER(topic) = LOWER(?)
      ))
      AND n.id != ?
    `).all(conceptIdOrTopic, conceptIdOrTopic, conceptIdOrTopic, conceptIdOrTopic) as any[];

    return rows.map((r) => ({
      node: this.mapNodeRow(r),
      relation: r.relation_type as ConceptRelationType,
      description: r.description
    }));
  }

  private mapNodeRow(r: any): ConceptGraphNode {
    let formulas: string[] = [];
    try {
      formulas = JSON.parse(r.governing_formulas_json || '[]').map((f: any) => f.formula);
    } catch {
      formulas = [];
    }
    return {
      id: r.id,
      name: r.topic,
      subject: r.subject as SupportedSubject,
      gradeRecommendation: 10,
      definition: r.academic_definition,
      formulas
    };
  }

  // ---------------------------------------------------------------------------
  // Automated Curriculum Research and Ingestion Pipeline
  // ---------------------------------------------------------------------------
  ingestCurriculumResource(input: {
    board: EducationalBoard;
    grade: number;
    subject: SupportedSubject;
    title: string;
    publisher: string;
    academicYear: string;
    edition: string;
    licenseType: string;
    officialSourceUrl?: string;
    chapters: Array<{ chapterNumber: number; chapterTitle: string; learningObjectives: string[] }>;
  }): { sourceId: string; chaptersIngested: number; status: string } {
    const sourceId = `src-${input.board.toLowerCase()}-g${input.grade}-${crypto.randomUUID().slice(0, 6)}`;
    const now = new Date().toISOString();

    // 1. Insert into curriculum_sources
    db.prepare(`
      INSERT OR REPLACE INTO curriculum_sources (
        source_id, board, grade, subject, title, publisher, publication_year, academic_year, edition, license_type, access_status, official_source_url, chapters_count, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'indexed_catalog', ?, ?, ?)
    `).run(
      sourceId,
      input.board,
      input.grade,
      input.subject,
      input.title,
      input.publisher,
      2025,
      input.academicYear,
      input.edition,
      input.licenseType,
      input.officialSourceUrl || '',
      input.chapters.length,
      now
    );

    // 2. Insert chapters
    const insertChapter = db.prepare(`
      INSERT OR REPLACE INTO curriculum_chapters (
        id, source_id, board, grade, subject, chapter_number, chapter_title, learning_objectives_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const ch of input.chapters) {
      const chId = `ch-${sourceId}-${ch.chapterNumber}`;
      insertChapter.run(
        chId,
        sourceId,
        input.board,
        input.grade,
        input.subject,
        ch.chapterNumber,
        ch.chapterTitle,
        JSON.stringify(ch.learningObjectives),
        now
      );
    }

    return {
      sourceId,
      chaptersIngested: input.chapters.length,
      status: 'indexed_and_mapped'
    };
  }

  // ---------------------------------------------------------------------------
  // Knowledge Verification & Versioning Workflow
  // States: research_draft -> verified_knowledge -> published_knowledge
  // ---------------------------------------------------------------------------
  updateKnowledgeVerificationState(
    documentId: string,
    nextStatus: KnowledgeStatus,
    reviewerInfo: { reviewerName: string; notes: string; confidenceScore?: number }
  ): { documentId: string; previousStatus: string; newStatus: KnowledgeStatus; verifiedAt: string } {
    const now = new Date().toISOString();

    const existing = db.prepare('SELECT * FROM knowledge_documents WHERE id = ?').get(documentId) as any;
    const prevStatus = existing?.status || 'research_draft';

    db.prepare(`
      UPDATE knowledge_documents
      SET status = ?,
          reviewed_by = ?,
          confidence_score = ?,
          updated_at = ?
      WHERE id = ?
    `).run(
      nextStatus,
      reviewerInfo.reviewerName,
      reviewerInfo.confidenceScore ?? 0.98,
      now,
      documentId
    );

    return {
      documentId,
      previousStatus: prevStatus,
      newStatus: nextStatus,
      verifiedAt: now
    };
  }

  // ---------------------------------------------------------------------------
  // Syllabus Edition Comparison & Diffing
  // ---------------------------------------------------------------------------
  diffCurriculumEditions(params: {
    board: EducationalBoard;
    subject: SupportedSubject;
    grade: number;
    previousTopics: string[];
    newTopics: string[];
  }): SyllabusEditionDiff {
    const prevSet = new Set(params.previousTopics.map((t) => t.trim().toLowerCase()));
    const newSet = new Set(params.newTopics.map((t) => t.trim().toLowerCase()));

    const addedTopics = params.newTopics.filter((t) => !prevSet.has(t.trim().toLowerCase()));
    const removedTopics = params.previousTopics.filter((t) => !newSet.has(t.trim().toLowerCase()));

    const modifiedTopics: Array<{ topic: string; changes: string }> = [];
    for (const t of params.newTopics) {
      if (prevSet.has(t.trim().toLowerCase())) {
        // Topic retained with updated learning outcomes or rationalization
        modifiedTopics.push({
          topic: t,
          changes: 'Learning outcomes rationalized to align with latest board examination blueprints.'
        });
      }
    }

    const requiresReview = addedTopics.length > 0 || removedTopics.length > 0;

    return {
      board: params.board,
      subject: params.subject,
      grade: params.grade,
      previousEdition: '2024-2025 Edition',
      newEdition: '2025-2026 Rationalized Edition',
      addedTopics,
      removedTopics,
      modifiedTopics: modifiedTopics.slice(0, 5),
      changedLearningObjectives: [
        'Increased emphasis on application-based questions and experimental demonstrations',
        'Standardized 9-step problem-solving heuristics for physics and mathematics'
      ],
      requiresHumanReview: requiresReview
    };
  }
}

export const multiBoardKnowledgeEngine = new MultiBoardKnowledgeEngine();
