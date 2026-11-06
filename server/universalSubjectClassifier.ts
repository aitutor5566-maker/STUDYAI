/**
 * STUDYAI Universal Subject-Classification & Topic-to-Discipline Engine
 *
 * Automatically detects subject, discipline, curriculum chapter, related subtopics,
 * mathematical/numerical requirements, visual media types, and handles ambiguous topics.
 *
 * Supports at minimum:
 * - Mathematics
 * - Physics
 * - Chemistry
 * - Biology
 * - General Science
 * - History
 * - Geography
 * - Civics & Political Science
 * - Economics
 * - English & Literature
 * - Computer Science & IT
 * - Commerce & Accountancy & Business Studies
 * - Environmental Science
 * - Extensible framework for any academic discipline
 */

export interface TopicClassification {
  topic: string;
  normalizedTopic: string;
  subject: string;
  discipline: string;
  chapter: string;
  subtopics: string[];
  requiresFormulas: boolean;
  requiresNumericals: boolean;
  requiresDiagrams: boolean;
  requiresTimelines: boolean;
  requiresMaps: boolean;
  requiresCode: boolean;
  requiresAccountingLedger: boolean;
  suggestedVisualType: string;
  visualSpecification?: {
    targetMedium: string;
  };
  designModeDefault: 'handwritten' | 'infographic' | 'formula_sheet' | 'chapter_notes';
  isAmbiguous: boolean;
  ambiguityOptions?: Array<{
    subject: string;
    discipline: string;
    description: string;
  }>;
  disambiguationOptions?: Array<{
    subject: string;
    discipline: string;
    description: string;
  }>;
  clarificationPrompt?: string;
  confidence: number;
}

export interface StudentAcademicContext {
  grade?: number | string;
  board?: string;
  preferredLanguage?: string;
  explanationDepth?: 'concise' | 'balanced' | 'detailed' | 'exam-prep';
  weakSubjects?: string[];
  recentTopics?: string[];
}

interface SubjectRule {
  subject: string;
  discipline: string;
  defaultChapter: string;
  keywordsRegex: RegExp;
  requiresFormulas: boolean;
  requiresNumericals: boolean;
  requiresDiagrams: boolean;
  requiresTimelines: boolean;
  requiresMaps: boolean;
  requiresCode: boolean;
  requiresAccountingLedger: boolean;
  suggestedVisualType: string;
  designMode: 'handwritten' | 'infographic' | 'formula_sheet' | 'chapter_notes';
  subtopicsGenerator: (topic: string) => string[];
}

const SUBJECT_RULES: SubjectRule[] = [
  // 1. PHYSICS
  {
    subject: 'Physics',
    discipline: 'Mechanics & Physical Sciences',
    defaultChapter: 'Motion, Forces & Energy',
    keywordsRegex: /\b(friction|newton|laws of motion|inertia|f\s*=\s*ma|circular motion|centripetal|gravitation|gravity|kinematics|momentum|impulse|work energy power|simple harmonic motion|shm|wave|optics|reflection|refraction|lens|mirror|electricity|current electricity|ohm's law|circuits|resistor|capacitor|magnetism|electromagnetism|induction|faraday|thermodynamics|heat transfer|fluid mechanics|bernoulli|buoyancy|viscosity|torque|rotational motion)\b/i,
    requiresFormulas: true,
    requiresNumericals: true,
    requiresDiagrams: true,
    requiresTimelines: false,
    requiresMaps: false,
    requiresCode: false,
    requiresAccountingLedger: false,
    suggestedVisualType: 'fbd_vectors',
    designMode: 'formula_sheet',
    subtopicsGenerator: (t) => {
      const lower = t.toLowerCase();
      if (lower.includes('friction')) {
        return ['Static Friction & Limiting Friction', 'Kinetic (Dynamic) Friction', 'Rolling Friction & Bearings', 'Coefficient of Friction (μ)', 'Angle of Friction & Repose', 'Friction on Inclined Planes', 'Practical Applications & Lubrication'];
      }
      if (lower.includes('circular')) {
        return ['Angular Displacement & Velocity (ω)', 'Centripetal Acceleration (a_c = v²/r)', 'Centripetal Force (F = mv²/r)', 'Banking of Roads & Centrifugal Effect', 'Motion in a Vertical Circle', 'Planetary Orbit Applications'];
      }
      return ['First Law & Inertia', 'Second Law (F = ma)', 'Third Law (Action & Reaction)', 'Free-Body Diagram Resolution', 'Conservation of Momentum', 'Friction & Normal Force'];
    }
  },

  // 2. MATHEMATICS
  {
    subject: 'Mathematics',
    discipline: 'Pure & Applied Mathematics',
    defaultChapter: 'Algebra, Geometry & Calculus',
    keywordsRegex: /\b(quadratic|quadratic equations|parabola|discriminant|polynomial|linear equation|algebra|arithmetic progression|ap|gp|trigonometry|sine|cosine|tangent|calculus|differentiation|derivative|integration|integral|matrix|matrices|determinant|coordinate geometry|circle|triangle|mensuration|probability|statistics|vectors|logarithm|sets|complex numbers|binomial theorem|limits)\b/i,
    requiresFormulas: true,
    requiresNumericals: true,
    requiresDiagrams: true,
    requiresTimelines: false,
    requiresMaps: false,
    requiresCode: false,
    requiresAccountingLedger: false,
    suggestedVisualType: 'math_plot',
    designMode: 'formula_sheet',
    subtopicsGenerator: (t) => {
      const lower = t.toLowerCase();
      if (lower.includes('quadratic')) {
        return ['Standard Form (ax² + bx + c = 0)', 'Discriminant (D = b² - 4ac) & Nature of Roots', 'Solving by Factorisation', 'Quadratic Formula (Sridharacharya)', 'Relation Between Roots & Coefficients', 'Vertex & Graphical Parabola Plot', 'Word Problems & Practical Modeling'];
      }
      if (lower.includes('trigonometr')) {
        return ['Trigonometric Ratios (sin, cos, tan)', 'Trigonometric Identities (sin²θ + cos²θ = 1)', 'Values at Standard Angles (0°, 30°, 45°, 60°, 90°)', 'Heights and Distances', 'Compound Angle Formulas'];
      }
      return ['Definitions & Notations', 'Core Theorems & Properties', 'Standard Formula Derivations', 'Step-by-Step Worked Solved Problems', 'Graphical Analysis & Cartesian Plotting', 'Common Exam Pitfalls'];
    }
  },

  // 3. CHEMISTRY
  {
    subject: 'Chemistry',
    discipline: 'Chemical Sciences',
    defaultChapter: 'Matter, Bonding & Reactions',
    keywordsRegex: /\b(chemical bonding|covalent bond|ionic bond|metallic bond|hydrogen bonding|periodic table|periodic classification|atomic structure|bohr atom|mole concept|stoichiometry|acids bases and salts|redox|chemical reaction|equilibrium|thermodynamics chemistry|electrochemistry|organic chemistry|hydrocarbon|alkane|alkene|alkyne|alcohol|aldehyde|polymers|chemical kinetics|coordination compounds|solutions|colligative properties)\b/i,
    requiresFormulas: true,
    requiresNumericals: true,
    requiresDiagrams: true,
    requiresTimelines: false,
    requiresMaps: false,
    requiresCode: false,
    requiresAccountingLedger: false,
    suggestedVisualType: 'molecular_structure',
    designMode: 'infographic',
    subtopicsGenerator: (t) => {
      const lower = t.toLowerCase();
      if (lower.includes('bonding')) {
        return ['Octet Rule & Lewis Electron Dot Structures', 'Ionic (Electrovalent) Bonding & Crystal Lattice', 'Covalent Bonding (Single, Double, Triple)', 'Polar Covalent Bonds & Electronegativity', 'VSEPR Theory & 3D Molecular Geometry', 'Hydrogen Bonding & Van der Waals Forces', 'Physical Properties: Melting Point & Solubility'];
      }
      return ['Atomic Structure & Electron Shells', 'Balanced Chemical Equations', 'Reaction Conditions & Catalysts', 'Stoichiometric Mole Calculations', 'Laboratory Observations & Safety', 'Key Industrial Applications'];
    }
  },

  // 4. BIOLOGY
  {
    subject: 'Biology',
    discipline: 'Life Sciences & Human Physiology',
    defaultChapter: 'Life Processes & Cellular Biology',
    keywordsRegex: /\b(photosynthesis|human heart|cardiac|circulation|cell|cell biology|mitochondria|chloroplast|dna|dna replication|rna|genetics|mendel|heredity|evolution|darwin|respiration|cellular respiration|digestion|digestive system|nervous system|neuron|brain|kidney|excretion|nephron|endocrine|hormones|reproduction|plant physiology|transpiration|ecosystem|ecology|biodiversity|microbiology|bacteria|virus|biotechnology)\b/i,
    requiresFormulas: false,
    requiresNumericals: false,
    requiresDiagrams: true,
    requiresTimelines: false,
    requiresMaps: false,
    requiresCode: false,
    requiresAccountingLedger: false,
    suggestedVisualType: 'anatomical_diagram',
    designMode: 'infographic',
    subtopicsGenerator: (t) => {
      const lower = t.toLowerCase();
      if (lower.includes('heart')) {
        return ['External Anatomy & Pericardium', 'Four Chambers (Atria & Ventricles)', 'Valves: AV (Tricuspid, Bicuspid) & Semilunar', 'Great Vessels (Vena Cava, Aorta, Pulmonary)', 'Double Circulation (Systemic vs. Pulmonary)', 'Cardiac Cycle & Conduction System (SA/AV Node)', 'Hemodynamics: Cardiac Output = HR × SV'];
      }
      if (lower.includes('photosynthesis')) {
        return ['Chloroplast Structure: Grana & Stroma', 'Light-Dependent Reactions in Thylakoids', 'Photolysis of Water & Oxygen Release', 'Light-Independent Calvin Cycle (Dark Reaction)', 'Balanced Chemical Equation (6CO₂ + 6H₂O)', 'CAM Photosynthesis in Desert Plants', 'Factors Affecting Photosynthesis (Light, CO₂, Temp)'];
      }
      if (lower.includes('dna')) {
        return ['Double Helix Architecture (Watson & Crick)', 'Nucleotide Structure: Sugar, Phosphate, Base', 'Complementary Base Pairing (A=T, G≡C)', 'Semi-Conservative Replication Mechanism', 'Key Enzymes: Helicase, DNA Polymerase, Ligase', 'Leading vs. Lagging Strand (Okazaki Fragments)'];
      }
      return ['Structural Organization', 'Cellular & Organ Components', 'Step-by-Step Biological Mechanism', 'Labelled Scientific Diagram', 'Functional Adaptations', 'Disorders & Clinical Significance'];
    }
  },

  // 5. HISTORY
  {
    subject: 'History',
    discipline: 'World History & Civilizations',
    defaultChapter: 'Revolutions, Empires & Modern Era',
    keywordsRegex: /\b(french revolution|bastille|louis xvi|third estate|industrial revolution|world war|world war i|world war ii|ww1|ww2|treaty of versailles|russian revolution|bolshevik|lenin|nazism|hitler|fascism|mussolini|indian independence|gandhi|non cooperation|civil disobedience|quit india|mughal empire|akbar|delhi sultanate|american revolution|cold war|renaissance|chola|harappan|indus valley|imperialism|colonialism)\b/i,
    requiresFormulas: false,
    requiresNumericals: false,
    requiresDiagrams: false,
    requiresTimelines: true,
    requiresMaps: true,
    requiresCode: false,
    requiresAccountingLedger: false,
    suggestedVisualType: 'chronological_timeline',
    designMode: 'chapter_notes',
    subtopicsGenerator: (t) => {
      const lower = t.toLowerCase();
      if (lower.includes('french revolution')) {
        return ['Socio-Economic Causes: The Three Estates System', 'Financial Crisis & Estates-General of 1789', 'Fall of the Bastille (14 July 1789)', 'Declaration of the Rights of Man and of the Citizen', 'Reign of Terror (Robespierre & Jacobins)', 'Rise of Napoleon Bonaparte', 'Historical Significance & Democratic Legacy'];
      }
      return ['Historical Background & Era Context', 'Underlying Causes: Political, Social, Economic', 'Chronological Timeline of Key Events', 'Prominent Historical Personalities & Leaders', 'Crucial Turning Points & Battles', 'Treaties & Constitutional Changes', 'Long-term Impact & Global Significance'];
    }
  },

  // 6. GEOGRAPHY
  {
    subject: 'Geography',
    discipline: 'Physical & Human Geography',
    defaultChapter: 'Earth Systems, Climate & Resources',
    keywordsRegex: /\b(climate|weather|atmosphere|atmospheric layers|monsoon|cyclone|el nino|global warming|plate tectonics|earthquake|volcano|rock cycle|rivers|fluvial|glacier|coastal landforms|drainage system|water resources|soils|natural vegetation|forests|minerals|energy resources|agriculture|population geography|urbanization|geographical maps|map reading|longitude|latitude)\b/i,
    requiresFormulas: false,
    requiresNumericals: false,
    requiresDiagrams: true,
    requiresTimelines: false,
    requiresMaps: true,
    requiresCode: false,
    requiresAccountingLedger: false,
    suggestedVisualType: 'geographical_map',
    designMode: 'infographic',
    subtopicsGenerator: (t) => {
      const lower = t.toLowerCase();
      if (lower.includes('climate')) {
        return ['Difference Between Weather and Climate', 'Factors Affecting Climate (Latitude, Altitude, Distance from Sea)', 'Atmospheric Pressure Belts & Planetary Winds', 'Monsoon Mechanism: Southwest & Retreating Northeast', 'Koppen Climate Classification Zones', 'Climate Change, Global Warming & Mitigation'];
      }
      return ['Geographical Context & Spatial Distribution', 'Physical Landforms & Geomorphic Processes', 'Climatic Characteristics & Seasonal Variations', 'Flora, Fauna & Soil Associations', 'Human Adaptation & Economic Resource Uses', 'Cartographic Map Skills & Cross-Sections'];
    }
  },

  // 7. CIVICS & POLITICAL SCIENCE
  {
    subject: 'Civics',
    discipline: 'Political Science, Governance & Law',
    defaultChapter: 'Constitutional Democracy & Institutions',
    keywordsRegex: /\b(fundamental rights|constitution|indian constitution|preamble|directive principles|dpsp|parliament|lok sabha|rajya sabha|prime minister|president|judiciary|supreme court|high court|judicial review|democracy|federalism|local government|panchayati raj|elections|election commission|political parties|secularism|citizenship|human rights|rule of law)\b/i,
    requiresFormulas: false,
    requiresNumericals: false,
    requiresDiagrams: true,
    requiresTimelines: false,
    requiresMaps: false,
    requiresCode: false,
    requiresAccountingLedger: false,
    suggestedVisualType: 'institutional_hierarchy',
    designMode: 'chapter_notes',
    subtopicsGenerator: (t) => {
      const lower = t.toLowerCase();
      if (lower.includes('fundamental rights')) {
        return ['Constitutional Origin: Part III (Articles 12–35)', 'Right to Equality (Articles 14–18)', 'Right to Freedom (Articles 19–22)', 'Right Against Exploitation (Articles 23–24)', 'Right to Freedom of Religion (Articles 25–28)', 'Cultural and Educational Rights (Articles 29–30)', 'Right to Constitutional Remedies & Writs (Article 32)'];
      }
      return ['Constitutional Foundation & Legal Provisions', 'Institutional Structure & Hierarchy of Authority', 'Powers, Functions & Responsibilities', 'Checks and Balances Between Organs of State', 'Rights and Duties of Citizens', 'Democratic Relevance in Modern Governance'];
    }
  },

  // 8. ECONOMICS
  {
    subject: 'Economics',
    discipline: 'Microeconomics & Macroeconomics',
    defaultChapter: 'Markets, Production & National Economy',
    keywordsRegex: /\b(demand and supply|law of demand|law of supply|elasticity of demand|market equilibrium|monopoly|perfect competition|national income|gdp|gnh|inflation|deflation|fiscal policy|monetary policy|central bank|rbi|commercial banking|money and credit|international trade|balance of payments|poverty|unemployment|sustainable development|budget)\b/i,
    requiresFormulas: true,
    requiresNumericals: true,
    requiresDiagrams: true,
    requiresTimelines: false,
    requiresMaps: false,
    requiresCode: false,
    requiresAccountingLedger: false,
    suggestedVisualType: 'economic_curves',
    designMode: 'infographic',
    subtopicsGenerator: (t) => {
      const lower = t.toLowerCase();
      if (lower.includes('demand') || lower.includes('supply')) {
        return ['Law of Demand & Negative Sloping Demand Curve', 'Determinants of Demand (Price, Income, Substitutes)', 'Law of Supply & Positive Sloping Supply Curve', 'Market Equilibrium: Intersection of Supply & Demand', 'Price Elasticity of Demand (Formula: Ed = %ΔQ / %ΔP)', 'Shifts in Curves vs. Movements Along Curves', 'Government Price Ceilings and Price Floors'];
      }
      return ['Core Economic Definition & Assumptions', 'Theoretical Principles & Behavioral Models', 'Graphical Curves & Mathematical Equations', 'Numerical Calculations (Elasticity, GDP, Multiplier)', 'Real-World Policy Applications', 'Market Distortions & Limitations'];
    }
  },

  // 9. ENGLISH & LITERATURE
  {
    subject: 'English',
    discipline: 'Language, Grammar & Literature',
    defaultChapter: 'Literary Analysis, Prose & Grammar',
    keywordsRegex: /\b(macbeth|shakespeare|hamlet|othello|julius caesar|merchant of venice|poetry|poetic devices|metaphor|simile|personification|alliteration|irony|active and passive voice|direct and indirect speech|reported speech|tenses|clauses|subject verb agreement|concord|prepositions|comprehension|essay writing|letter writing|summary writing|rhetoric|syntax)\b/i,
    requiresFormulas: false,
    requiresNumericals: false,
    requiresDiagrams: true,
    requiresTimelines: false,
    requiresMaps: false,
    requiresCode: false,
    requiresAccountingLedger: false,
    suggestedVisualType: 'literary_arc',
    designMode: 'handwritten',
    subtopicsGenerator: (t) => {
      const lower = t.toLowerCase();
      if (lower.includes('macbeth')) {
        return ['Historical Context & The Gunpowder Plot Influence', 'Act-by-Act Plot Summary & Dramatic Arc', 'Character Analysis: Macbeth’s Tragic Flaw (Hamartia)', 'Lady Macbeth: Ambition, Guilt & Sleepwalking Scene', 'The Three Witches & The Role of Fate vs. Free Will', 'Central Themes: Kingship vs. Tyranny, Guilt & Blood Imagery', 'Key Soliloquies ("Tomorrow, and tomorrow, and tomorrow")'];
      }
      return ['Definition, Grammatical Rule & Structure', 'Contextual Sentence Examples', 'Exceptions & Common Stylistic Errors', 'Literary / Rhetorical Device Breakdown', 'Character & Thematic Insights', 'Practice Exercises & Model Transformations'];
    }
  },

  // 10. COMPUTER SCIENCE & IT
  {
    subject: 'Computer Science',
    discipline: 'Computing, Networking & Software Engineering',
    defaultChapter: 'Networks, Algorithms & Systems',
    keywordsRegex: /\b(computer networks|networking|osi model|tcp ip|ip address|router|switch|lan|wan|topolog|protocol|http|https|dns|socket|algorithm|data structure|binary search|sorting|recursion|linked list|stack|queue|binary tree|graph|database|sql|normalization|acid properties|cybersecurity|encryption|operating system|process scheduling|python|java|c\+\+|object oriented|oop)\b/i,
    requiresFormulas: false,
    requiresNumericals: false,
    requiresDiagrams: true,
    requiresTimelines: false,
    requiresMaps: false,
    requiresCode: true,
    requiresAccountingLedger: false,
    suggestedVisualType: 'network_topology',
    designMode: 'infographic',
    subtopicsGenerator: (t) => {
      const lower = t.toLowerCase();
      if (lower.includes('network')) {
        return ['Network Types: LAN, MAN, WAN, PAN', 'Network Topologies (Star, Mesh, Bus, Ring)', 'The OSI 7-Layer Model vs. TCP/IP Model', 'Core Protocols: IP, TCP, UDP, HTTP, DNS', 'Transmission Media: Guided (Fiber, Copper) vs. Wireless', 'Routing, Switching & IP Addressing (IPv4 vs. IPv6)', 'Network Security: Firewalls, Encryption & VPNs'];
      }
      return ['Foundational Architectural Concepts', 'Core Algorithms & Algorithmic Complexity (Big-O)', 'Syntax-Highlighted Code Implementations', 'Flowcharts & Structural System Diagrams', 'Comparison of Alternative Approaches', 'Practical Engineering Applications'];
    }
  },

  // 11. COMMERCE & ACCOUNTANCY
  {
    subject: 'Accountancy',
    discipline: 'Financial Accounting & Commerce',
    defaultChapter: 'Accounting Principles & Financial Records',
    keywordsRegex: /\b(journal entries|journal entry|ledger|trial balance|balance sheet|profit and loss|double entry|debit and credit|depreciation|bank reconciliation|brs|accounting principles|gaap|partnership accounting|goodwill|company accounts|shares and debentures|cash flow statement|ratio analysis|cost accounting|working capital)\b/i,
    requiresFormulas: true,
    requiresNumericals: true,
    requiresDiagrams: true,
    requiresTimelines: false,
    requiresMaps: false,
    requiresCode: false,
    requiresAccountingLedger: true,
    suggestedVisualType: 'accounting_ledger',
    designMode: 'handwritten',
    subtopicsGenerator: (t) => {
      const lower = t.toLowerCase();
      if (lower.includes('journal')) {
        return ['The Accounting Equation (Assets = Liabilities + Capital)', 'Three Golden Rules of Accounting (Real, Personal, Nominal)', 'Standard Format of a Journal Entry', 'Compound Journal Entries', 'Trade Discount vs. Cash Discount Treatment', 'GST (CGST, SGST, IGST) Accounting Entries', 'Posting from Journal to General Ledger'];
      }
      return ['Core Accounting Definition & Legal Standard (GAAP/IFRS)', 'Principles & Conventions (Prudence, Matching, Going Concern)', 'Debit & Credit Rules and Balance Verifications', 'Standardized Financial Statements & Format Tables', 'Comprehensive Worked Problem with Ledger Balancing', 'Common Errors Not Disclosed by Trial Balance'];
    }
  },

  // 12. BUSINESS STUDIES
  {
    subject: 'Business Studies',
    discipline: 'Management & Commercial Studies',
    defaultChapter: 'Principles of Management & Organization',
    keywordsRegex: /\b(principles of management|fayol|taylor|business environment|planning|organising|staffing|directing|controlling|marketing management|marketing mix|financial management|capital structure|consumer protection|entrepreneurship|business studies|business organization)\b/i,
    requiresFormulas: false,
    requiresNumericals: false,
    requiresDiagrams: true,
    requiresTimelines: false,
    requiresMaps: false,
    requiresCode: false,
    requiresAccountingLedger: false,
    suggestedVisualType: 'management_hierarchy',
    designMode: 'chapter_notes',
    subtopicsGenerator: () => [
      'Concept, Nature & Importance of the Topic',
      'Fayol and Taylor Management Principles',
      'Step-by-Step Organizational Process',
      'Management Hierarchy & Decision Matrix',
      'Comparative Matrix of Alternatives',
      'Case Study Analysis & Real-World Brand Strategy',
      'High-Yield Board Examination Questions'
    ]
  },

  // 13. ENVIRONMENTAL SCIENCE
  {
    subject: 'Environmental Science',
    discipline: 'Ecology & Environmental Management',
    defaultChapter: 'Ecosystems, Pollution & Sustainability',
    keywordsRegex: /\b(pollution|air pollution|water pollution|waste management|ozone depletion|acid rain|renewable energy|conservation|sustainable development|biodiversity hotspot|food chain|food web|trophic level|environmental impact)\b/i,
    requiresFormulas: false,
    requiresNumericals: false,
    requiresDiagrams: true,
    requiresTimelines: false,
    requiresMaps: true,
    requiresCode: false,
    requiresAccountingLedger: false,
    suggestedVisualType: 'ecological_cycle',
    designMode: 'infographic',
    subtopicsGenerator: () => [
      'Definition, Scope & Ecological Context',
      'Trophic Levels & Energy Flow Dynamics',
      'Causes, Sources & Pollutant Classifications',
      'Environmental & Human Health Consequences',
      'Technological & Policy Remediation Strategies',
      'Global Treaties (Kyoto, Paris Agreement)',
      'Actionable Individual & Community Conservation'
    ]
  }
];

/**
 * Known ambiguous topics with multi-discipline interpretations
 */
const AMBIGUOUS_TOPIC_REGISTRY: Record<string, Array<{ subject: string; discipline: string; description: string; hintRegex: RegExp }>> = {
  cell: [
    {
      subject: 'Biology',
      discipline: 'Cell Biology & Cytology',
      description: 'The structural, functional, and biological unit of all known living organisms.',
      hintRegex: /\b(organelle|nucleus|membrane|cytoplasm|mitochondria|plant|animal|biology|living|tissue)\b/i
    },
    {
      subject: 'Computer Science',
      discipline: 'Information Technology & Spreadsheets',
      description: 'A single rectangular data container at the intersection of a row and column in a spreadsheet or grid.',
      hintRegex: /\b(excel|spreadsheet|table|row|column|formula|grid|computer|software|data)\b/i
    },
    {
      subject: 'Physics',
      discipline: 'Electricity & Electrochemistry',
      description: 'An electrochemical power source (galvanic/voltaic cell) providing electromotive force (EMF).',
      hintRegex: /\b(battery|electrochemical|emf|voltage|current|circuit|anode|cathode|electrolyte)\b/i
    }
  ],
  current: [
    {
      subject: 'Physics',
      discipline: 'Electromagnetism & Circuits',
      description: 'Electric current: The rate of flow of electric charge (I = Q/t) measured in Amperes.',
      hintRegex: /\b(electric|ampere|charge|circuit|voltage|resistance|wire|ohm|electricity)\b/i
    },
    {
      subject: 'Geography',
      discipline: 'Oceanography & Physical Geography',
      description: 'Ocean currents: Continuous, directed movements of seawater driven by winds, temperature, and Coriolis force.',
      hintRegex: /\b(ocean|sea|water|warm|cold|gulf stream|salinity|wind|tide|coastal)\b/i
    }
  ],
  force: [
    {
      subject: 'Physics',
      discipline: 'Classical Mechanics',
      description: 'An interaction that causes an object of mass m to accelerate (F = ma) measured in Newtons.',
      hintRegex: /\b(newton|mass|acceleration|friction|vector|mechanics|push|pull|motion)\b/i
    },
    {
      subject: 'Civics',
      discipline: 'Defense & State Institutions',
      description: 'Armed forces, police power, or lawful state enforcement mechanisms.',
      hintRegex: /\b(military|police|army|state|law|enforcement|security|defense)\b/i
    }
  ],
  revolution: [
    {
      subject: 'History',
      discipline: 'World History',
      description: 'A fundamental socio-political transformation or overthrow of a government (e.g. French, Industrial).',
      hintRegex: /\b(french|industrial|russian|revolt|monarchy|history|liberty|war|uprising)\b/i
    },
    {
      subject: 'Physics',
      discipline: 'Rotational Mechanics & Astronomy',
      description: 'Orbital or rotational movement of a body around an axis or center point (rpm, orbital period).',
      hintRegex: /\b(circular|orbit|planet|axis|rpm|rotation|angle|mechanics|motion)\b/i
    }
  ]
};

/**
 * Universal Subject Classification & Topic Intelligence
 */
export function classifyUniversalTopic(
  topicInput: string,
  context?: StudentAcademicContext
): TopicClassification {
  const clean = (topicInput || 'Study Topic').trim();
  const lower = clean.toLowerCase();

  // 1. Check for Ambiguous Topics
  const rootTopicWord = lower.replace(/^(the|a|an|about|explain|what is)\s+/i, '').trim();
  const ambiguityEntry = AMBIGUOUS_TOPIC_REGISTRY[rootTopicWord] ||
    Object.entries(AMBIGUOUS_TOPIC_REGISTRY).find(([k]) => new RegExp(`\\b${k}\\b`, 'i').test(lower))?.[1];

  let resolvedSubject = '';
  let resolvedDiscipline = '';
  let isAmbiguous = false;
  let ambiguityOptions: TopicClassification['ambiguityOptions'] = undefined;
  let clarificationPrompt: string | undefined = undefined;

  if (ambiguityEntry && ambiguityEntry.length > 1) {
    // If the topic is ONLY the single ambiguous word, always require clarification
    const isSingleAmbiguousWord = clean.split(/\s+/).length === 1;
    let matchedOption = !isSingleAmbiguousWord ? ambiguityEntry.find((opt) => opt.hintRegex.test(lower)) : undefined;

    if (!matchedOption && !isSingleAmbiguousWord && context?.recentTopics && context.recentTopics.length > 0) {
      const recentStr = context.recentTopics.join(' ');
      matchedOption = ambiguityEntry.find((opt) => opt.hintRegex.test(recentStr));
    }

    if (matchedOption) {
      resolvedSubject = matchedOption.subject;
      resolvedDiscipline = matchedOption.discipline;
      isAmbiguous = false;
    } else {
      isAmbiguous = true;
      ambiguityOptions = ambiguityEntry.map((opt) => ({
        subject: opt.subject,
        discipline: opt.discipline,
        description: opt.description
      }));
      clarificationPrompt = `"${clean}" has important meanings across multiple subjects: ${ambiguityEntry
        .map((o) => `${o.subject} (${o.discipline})`)
        .join(' or ')}. Which perspective would you like to study?`;
      // Default to highest-frequency educational meaning if no disambiguation provided
      resolvedSubject = ambiguityEntry[0].subject;
      resolvedDiscipline = ambiguityEntry[0].discipline;
    }
  }

  // 2. Rule-Based Subject Matching
  let matchedRule = SUBJECT_RULES.find((r) => r.subject.toLowerCase() === resolvedSubject.toLowerCase());

  if (!matchedRule) {
    for (const rule of SUBJECT_RULES) {
      if (rule.keywordsRegex.test(lower)) {
        matchedRule = rule;
        resolvedSubject = rule.subject;
        resolvedDiscipline = rule.discipline;
        break;
      }
    }
  }

  // 3. Fallback to General Science or Interdisciplinary
  if (!matchedRule) {
    matchedRule = {
      subject: 'General Science',
      discipline: 'Interdisciplinary Studies',
      defaultChapter: 'Core Concepts & Principles',
      keywordsRegex: /.*/,
      requiresFormulas: false,
      requiresNumericals: false,
      requiresDiagrams: true,
      requiresTimelines: false,
      requiresMaps: false,
      requiresCode: false,
      requiresAccountingLedger: false,
      suggestedVisualType: 'concept_flowchart',
      designMode: 'chapter_notes',
      subtopicsGenerator: () => [
        'Fundamental Definition & Foundational Principles',
        'Key Components & Structural Organization',
        'Step-by-Step Mechanism / Process Dynamics',
        'Visual Representation & Component Analysis',
        'Practical Real-World Applications & Examples',
        'Common Misconceptions & High-Yield Exam Watchouts'
      ]
    };
    resolvedSubject = 'General Science';
    resolvedDiscipline = 'Interdisciplinary Studies';
  }

  const subtopics = matchedRule.subtopicsGenerator(clean);

  return {
    topic: clean,
    normalizedTopic: clean.replace(/\b\w/g, (c) => c.toUpperCase()),
    subject: resolvedSubject,
    discipline: resolvedDiscipline || matchedRule.discipline,
    chapter: matchedRule.defaultChapter,
    subtopics,
    requiresFormulas: matchedRule.requiresFormulas,
    requiresNumericals: matchedRule.requiresNumericals,
    requiresDiagrams: matchedRule.requiresDiagrams,
    requiresTimelines: matchedRule.requiresTimelines,
    requiresMaps: matchedRule.requiresMaps,
    requiresCode: matchedRule.requiresCode,
    requiresAccountingLedger: matchedRule.requiresAccountingLedger,
    suggestedVisualType: matchedRule.suggestedVisualType,
    visualSpecification: {
      targetMedium: matchedRule.suggestedVisualType === 'fbd_vectors'
        ? 'Physics Mechanics Vector Diagram'
        : matchedRule.suggestedVisualType === 'circular_motion_svg'
        ? 'Circular Motion Kinematics Diagram'
        : matchedRule.suggestedVisualType === 'market_equilibrium_curves'
        ? 'Economics Demand-Supply Curve'
        : matchedRule.suggestedVisualType === 'accounting_ledger_table'
        ? 'Accounting 5-Column Ledger'
        : matchedRule.suggestedVisualType === 'osi_layer_stack'
        ? 'Computer Science OSI 7-Layer Architecture'
        : matchedRule.suggestedVisualType === 'fundamental_rights_tree'
        ? 'Constitutional Fundamental Rights Tree'
        : matchedRule.suggestedVisualType === 'literary_arc'
        ? 'Shakespearean Dramatic Arc Diagram'
        : `${resolvedSubject} Educational Diagram`
    },
    designModeDefault: matchedRule.designMode,
    isAmbiguous,
    ambiguityOptions,
    disambiguationOptions: ambiguityOptions,
    clarificationPrompt,
    confidence: isAmbiguous ? 0.7 : 0.98
  };
}
