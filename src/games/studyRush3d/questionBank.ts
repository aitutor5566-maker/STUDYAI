import { CURRICULUM_QUESTION_BANK } from '../curriculumBank';
import {
  AchievementMeta,
  DifficultyLevel,
  OptionId,
  StudyRushOption,
  StudyRushQuestion,
  SubjectCategory
} from './types';

export const STUDY_RUSH_ACHIEVEMENTS: AchievementMeta[] = [
  {
    id: 'first_light',
    title: 'First Light',
    description: 'Survive your first Night Wave in Survival Village.',
    icon: '🌅'
  },
  {
    id: 'scholar_streak',
    title: 'Arcane Streak',
    description: 'Answer 5 educational questions correctly in a row.',
    icon: '⚡'
  },
  {
    id: 'master_builder',
    title: 'Village Architect',
    description: 'Upgrade at least 2 village defenses during a run.',
    icon: '🏰'
  },
  {
    id: 'resource_gatherer',
    title: 'Voxel Explorer',
    description: 'Collect 10+ resources across the forest, cave, and kingdom.',
    icon: '💎'
  },
  {
    id: 'night_legend',
    title: 'Survival Legend',
    description: 'Clear 3 or more Night Waves with 80%+ accuracy.',
    icon: '👑'
  }
];

export const STUDY_RUSH_QUESTIONS: StudyRushQuestion[] = [
  // ==================== MATHEMATICS (8) ====================
  {
    id: 'sr-math-1',
    subject: 'Mathematics',
    grade: 6,
    difficulty: 'easy',
    topic: 'Fractions & Percentages',
    question: 'What is 3/4 expressed as a percentage?',
    options: [
      { id: 'A', text: '75%' },
      { id: 'B', text: '60%' },
      { id: 'C', text: '80%' },
      { id: 'D', text: '45%' }
    ],
    correctOptionId: 'A',
    hint: 'Multiply 3/4 by 100.',
    explanation: '3 ÷ 4 = 0.75, and 0.75 × 100 = 75%.'
  },
  {
    id: 'sr-math-2',
    subject: 'Mathematics',
    grade: 7,
    difficulty: 'easy',
    topic: 'Geometry — Triangles',
    question: 'What is the sum of the interior angles of any triangle?',
    options: [
      { id: 'A', text: '90°' },
      { id: 'B', text: '180°' },
      { id: 'C', text: '270°' },
      { id: 'D', text: '360°' }
    ],
    correctOptionId: 'B',
    hint: 'It equals a straight angle.',
    explanation: 'In Euclidean geometry, the three interior angles of a triangle always sum to 180°.'
  },
  {
    id: 'sr-math-3',
    subject: 'Mathematics',
    grade: 8,
    difficulty: 'medium',
    topic: 'Linear Equations',
    question: 'Solve for x: 3x + 7 = 22',
    options: [
      { id: 'A', text: 'x = 3' },
      { id: 'B', text: 'x = 4' },
      { id: 'C', text: 'x = 5' },
      { id: 'D', text: 'x = 6' }
    ],
    correctOptionId: 'C',
    hint: 'Subtract 7 from both sides first, then divide by 3.',
    explanation: '3x = 22 − 7 = 15, so x = 15 ÷ 3 = 5.'
  },
  {
    id: 'sr-math-4',
    subject: 'Mathematics',
    grade: 8,
    difficulty: 'medium',
    topic: 'Pythagorean Theorem',
    question: 'A right triangle has legs of length 6 cm and 8 cm. What is the hypotenuse?',
    options: [
      { id: 'A', text: '10 cm' },
      { id: 'B', text: '12 cm' },
      { id: 'C', text: '14 cm' },
      { id: 'D', text: '9 cm' }
    ],
    correctOptionId: 'A',
    hint: 'Use a² + b² = c².',
    explanation: '√(6² + 8²) = √(36 + 64) = √100 = 10 cm.'
  },
  {
    id: 'sr-math-5',
    subject: 'Mathematics',
    grade: 9,
    difficulty: 'medium',
    topic: 'Coordinate Geometry',
    question: 'What is the slope of the line passing through (2, 3) and (6, 11)?',
    options: [
      { id: 'A', text: '1' },
      { id: 'B', text: '2' },
      { id: 'C', text: '3' },
      { id: 'D', text: '4' }
    ],
    correctOptionId: 'B',
    hint: 'Slope m = (y₂ − y₁) / (x₂ − x₁).',
    explanation: 'm = (11 − 3) / (6 − 2) = 8 / 4 = 2.'
  },
  {
    id: 'sr-math-6',
    subject: 'Mathematics',
    grade: 10,
    difficulty: 'hard',
    topic: 'Quadratic Equations',
    question: 'What are the roots of x² − 5x + 6 = 0?',
    options: [
      { id: 'A', text: 'x = 1, 6' },
      { id: 'B', text: 'x = -2, -3' },
      { id: 'C', text: 'x = 2, 3' },
      { id: 'D', text: 'x = 2, -3' }
    ],
    correctOptionId: 'C',
    hint: 'Factor into (x − a)(x − b) = 0 where a + b = 5 and a·b = 6.',
    explanation: '(x − 2)(x − 3) = 0 gives roots x = 2 and x = 3.'
  },
  {
    id: 'sr-math-7',
    subject: 'Mathematics',
    grade: 10,
    difficulty: 'hard',
    topic: 'Trigonometry',
    question: 'In a right-angled triangle, what is sin(30°)?',
    options: [
      { id: 'A', text: '1/2' },
      { id: 'B', text: '√3/2' },
      { id: 'C', text: '1/√2' },
      { id: 'D', text: '1' }
    ],
    correctOptionId: 'A',
    hint: 'In a 30-60-90 triangle, the side opposite 30° is half the hypotenuse.',
    explanation: 'sin(30°) = opposite / hypotenuse = 1/2 = 0.5.'
  },
  {
    id: 'sr-math-8',
    subject: 'Mathematics',
    grade: 7,
    difficulty: 'easy',
    topic: 'Area & Perimeter',
    question: 'What is the area of a circle with radius 7 cm (take π ≈ 22/7)?',
    options: [
      { id: 'A', text: '44 cm²' },
      { id: 'B', text: '154 cm²' },
      { id: 'C', text: '77 cm²' },
      { id: 'D', text: '308 cm²' }
    ],
    correctOptionId: 'B',
    hint: 'Use A = πr².',
    explanation: 'A = (22/7) × 7 × 7 = 22 × 7 = 154 cm².'
  },

  // ==================== PHYSICS (8) ====================
  {
    id: 'sr-phys-1',
    subject: 'Physics',
    grade: 8,
    difficulty: 'easy',
    topic: 'SI Units & Force',
    question: 'What is the SI unit of Force?',
    options: [
      { id: 'A', text: 'Joule (J)' },
      { id: 'B', text: 'Newton (N)' },
      { id: 'C', text: 'Watt (W)' },
      { id: 'D', text: 'Pascal (Pa)' }
    ],
    correctOptionId: 'B',
    hint: 'Named after Sir Isaac Newton.',
    explanation: 'Force is measured in Newtons (N), where 1 N = 1 kg·m/s².'
  },
  {
    id: 'sr-phys-2',
    subject: 'Physics',
    grade: 9,
    difficulty: 'easy',
    topic: "Newton's Laws of Motion",
    question: 'A 4 kg object accelerates at 3 m/s². What net force acts on it?',
    options: [
      { id: 'A', text: '12 N' },
      { id: 'B', text: '7 N' },
      { id: 'C', text: '1.33 N' },
      { id: 'D', text: '24 N' }
    ],
    correctOptionId: 'A',
    hint: "Apply Newton's Second Law: F = m × a.",
    explanation: 'F = m × a = 4 kg × 3 m/s² = 12 N.'
  },
  {
    id: 'sr-phys-3',
    subject: 'Physics',
    grade: 10,
    difficulty: 'medium',
    topic: "Ohm's Law & Circuits",
    question: 'If a 12 V battery drives a 2 A current through a resistor, what is its resistance?',
    options: [
      { id: 'A', text: '24 Ω' },
      { id: 'B', text: '6 Ω' },
      { id: 'C', text: '10 Ω' },
      { id: 'D', text: '0.16 Ω' }
    ],
    correctOptionId: 'B',
    hint: 'Use V = I × R, so R = V / I.',
    explanation: 'R = V / I = 12 V / 2 A = 6 Ω.'
  },
  {
    id: 'sr-phys-4',
    subject: 'Physics',
    grade: 10,
    difficulty: 'medium',
    topic: 'Optics & Lenses',
    question: 'Which type of lens converges parallel light rays to a focal point?',
    options: [
      { id: 'A', text: 'Concave lens' },
      { id: 'B', text: 'Convex lens' },
      { id: 'C', text: 'Plane glass' },
      { id: 'D', text: 'Diverging prism' }
    ],
    correctOptionId: 'B',
    hint: 'It is thicker in the middle than at the edges.',
    explanation: 'A convex (converging) lens bends parallel rays inward so they meet at the principal focus.'
  },
  {
    id: 'sr-phys-5',
    subject: 'Physics',
    grade: 9,
    difficulty: 'medium',
    topic: 'Work, Power & Energy',
    question: 'What is the kinetic energy of a 2 kg ball moving at 5 m/s?',
    options: [
      { id: 'A', text: '10 J' },
      { id: 'B', text: '25 J' },
      { id: 'C', text: '50 J' },
      { id: 'D', text: '5 J' }
    ],
    correctOptionId: 'B',
    hint: 'KE = ½mv².',
    explanation: 'KE = 0.5 × 2 × 5² = 1 × 25 = 25 Joules.'
  },
  {
    id: 'sr-phys-6',
    subject: 'Physics',
    grade: 11,
    difficulty: 'hard',
    topic: 'Waves & Sound',
    question: 'A wave has a frequency of 50 Hz and wavelength of 4 m. What is its wave speed?',
    options: [
      { id: 'A', text: '12.5 m/s' },
      { id: 'B', text: '200 m/s' },
      { id: 'C', text: '54 m/s' },
      { id: 'D', text: '400 m/s' }
    ],
    correctOptionId: 'B',
    hint: 'Wave speed v = f × λ.',
    explanation: 'v = frequency × wavelength = 50 Hz × 4 m = 200 m/s.'
  },
  {
    id: 'sr-phys-7',
    subject: 'Physics',
    grade: 10,
    difficulty: 'hard',
    topic: 'Gravitation',
    question: 'What is the approximate acceleration due to gravity (g) on Earth’s surface?',
    options: [
      { id: 'A', text: '9.8 m/s²' },
      { id: 'B', text: '1.6 m/s²' },
      { id: 'C', text: '3.7 m/s²' },
      { id: 'D', text: '19.6 m/s²' }
    ],
    correctOptionId: 'A',
    hint: 'Often rounded to 10 m/s² in quick calculations.',
    explanation: 'Standard gravitational acceleration on Earth is approximately 9.8 m/s².'
  },
  {
    id: 'sr-phys-8',
    subject: 'Physics',
    grade: 8,
    difficulty: 'easy',
    topic: 'Light & Speed',
    question: 'What is the approximate speed of light in a vacuum?',
    options: [
      { id: 'A', text: '3 × 10⁸ m/s' },
      { id: 'B', text: '340 m/s' },
      { id: 'C', text: '3 × 10⁵ m/s' },
      { id: 'D', text: '1.5 × 10⁸ m/s' }
    ],
    correctOptionId: 'A',
    hint: 'About 300,000 kilometers per second.',
    explanation: 'Light travels at c ≈ 3 × 10⁸ m/s in a vacuum.'
  },

  // ==================== CHEMISTRY (8) ====================
  {
    id: 'sr-chem-1',
    subject: 'Chemistry',
    grade: 7,
    difficulty: 'easy',
    topic: 'Periodic Table',
    question: 'What is the chemical symbol for Sodium?',
    options: [
      { id: 'A', text: 'So' },
      { id: 'B', text: 'Na' },
      { id: 'C', text: 'S' },
      { id: 'D', text: 'Sd' }
    ],
    correctOptionId: 'B',
    hint: 'Derived from its Latin name "Natrium".',
    explanation: 'Sodium has the symbol Na (from Latin Natrium) and atomic number 11.'
  },
  {
    id: 'sr-chem-2',
    subject: 'Chemistry',
    grade: 8,
    difficulty: 'easy',
    topic: 'Acids, Bases & pH',
    question: 'What is the pH value of pure neutral water at 25°C?',
    options: [
      { id: 'A', text: '0' },
      { id: 'B', text: '5' },
      { id: 'C', text: '7' },
      { id: 'D', text: '14' }
    ],
    correctOptionId: 'C',
    hint: 'It sits right in the middle of the 0–14 pH scale.',
    explanation: 'Pure water is neutral with a pH of 7; below 7 is acidic and above 7 is basic.'
  },
  {
    id: 'sr-chem-3',
    subject: 'Chemistry',
    grade: 9,
    difficulty: 'medium',
    topic: 'Atomic Structure',
    question: 'Which subatomic particle carries a negative electrical charge?',
    options: [
      { id: 'A', text: 'Proton' },
      { id: 'B', text: 'Neutron' },
      { id: 'C', text: 'Electron' },
      { id: 'D', text: 'Nucleon' }
    ],
    correctOptionId: 'C',
    hint: 'It orbits outside the atomic nucleus.',
    explanation: 'Electrons carry a −1 charge, protons carry +1, and neutrons are neutral.'
  },
  {
    id: 'sr-chem-4',
    subject: 'Chemistry',
    grade: 10,
    difficulty: 'medium',
    topic: 'Chemical Bonding',
    question: 'Which type of bond is formed by the sharing of electron pairs between atoms?',
    options: [
      { id: 'A', text: 'Ionic bond' },
      { id: 'B', text: 'Covalent bond' },
      { id: 'C', text: 'Metallic bond' },
      { id: 'D', text: 'Hydrogen bond' }
    ],
    correctOptionId: 'B',
    hint: 'Non-metals typically share valence electrons to complete octets.',
    explanation: 'Covalent bonds form when atoms share pairs of electrons, as in H₂O or CH₄.'
  },
  {
    id: 'sr-chem-5',
    subject: 'Chemistry',
    grade: 9,
    difficulty: 'medium',
    topic: 'States of Matter',
    question: 'What is the process called when a solid turns directly into a gas without becoming liquid?',
    options: [
      { id: 'A', text: 'Condensation' },
      { id: 'B', text: 'Sublimation' },
      { id: 'C', text: 'Evaporation' },
      { id: 'D', text: 'Deposition' }
    ],
    correctOptionId: 'B',
    hint: 'Dry ice (solid CO₂) demonstrates this.',
    explanation: 'Sublimation is the direct phase transition from solid to gas (e.g., camphor, dry ice).'
  },
  {
    id: 'sr-chem-6',
    subject: 'Chemistry',
    grade: 10,
    difficulty: 'hard',
    topic: 'Stoichiometry & Mole Concept',
    question: 'What is the molar mass of Carbon Dioxide (CO₂)? (C = 12, O = 16)',
    options: [
      { id: 'A', text: '28 g/mol' },
      { id: 'B', text: '44 g/mol' },
      { id: 'C', text: '32 g/mol' },
      { id: 'D', text: '40 g/mol' }
    ],
    correctOptionId: 'B',
    hint: 'Add 1 Carbon atom and 2 Oxygen atoms.',
    explanation: '12 + (2 × 16) = 12 + 32 = 44 g/mol.'
  },
  {
    id: 'sr-chem-7',
    subject: 'Chemistry',
    grade: 10,
    difficulty: 'hard',
    topic: 'Noble Gases',
    question: 'Which gas is placed in Group 18 (Noble Gases) and is used to fill weather balloons safely?',
    options: [
      { id: 'A', text: 'Hydrogen' },
      { id: 'B', text: 'Helium' },
      { id: 'C', text: 'Nitrogen' },
      { id: 'D', text: 'Chlorine' }
    ],
    correctOptionId: 'B',
    hint: 'Atomic number 2, lighter than air and non-flammable.',
    explanation: 'Helium (He) is a chemically inert Group 18 noble gas.'
  },
  {
    id: 'sr-chem-8',
    subject: 'Chemistry',
    grade: 8,
    difficulty: 'easy',
    topic: 'Chemical Reactions',
    question: 'Which gas turns limewater milky?',
    options: [
      { id: 'A', text: 'Oxygen' },
      { id: 'B', text: 'Carbon dioxide' },
      { id: 'C', text: 'Nitrogen' },
      { id: 'D', text: 'Hydrogen' }
    ],
    correctOptionId: 'B',
    hint: 'It reacts with Ca(OH)₂ to form insoluble CaCO₃.',
    explanation: 'CO₂ reacts with calcium hydroxide (limewater) to form white calcium carbonate precipitate.'
  },

  // ==================== BIOLOGY (8) ====================
  {
    id: 'sr-bio-1',
    subject: 'Biology',
    grade: 7,
    difficulty: 'easy',
    topic: 'Cell Organelles',
    question: 'Which organelle is known as the powerhouse of the eukaryotic cell?',
    options: [
      { id: 'A', text: 'Ribosome' },
      { id: 'B', text: 'Mitochondria' },
      { id: 'C', text: 'Golgi apparatus' },
      { id: 'D', text: 'Lysosome' }
    ],
    correctOptionId: 'B',
    hint: 'It generates ATP through cellular respiration.',
    explanation: 'Mitochondria produce most of the cell’s supply of ATP, used as chemical energy.'
  },
  {
    id: 'sr-bio-2',
    subject: 'Biology',
    grade: 8,
    difficulty: 'easy',
    topic: 'Photosynthesis',
    question: 'Which pigment captures light energy inside plant chloroplasts?',
    options: [
      { id: 'A', text: 'Hemoglobin' },
      { id: 'B', text: 'Chlorophyll' },
      { id: 'C', text: 'Melanin' },
      { id: 'D', text: 'Keratin' }
    ],
    correctOptionId: 'B',
    hint: 'It gives leaves their green color.',
    explanation: 'Chlorophyll absorbs red and blue wavelengths of light to drive photosynthesis.'
  },
  {
    id: 'sr-bio-3',
    subject: 'Biology',
    grade: 10,
    difficulty: 'medium',
    topic: 'Human Heart & Circulation',
    question: 'Which chamber of the human heart pumps oxygenated blood to the entire body via the aorta?',
    options: [
      { id: 'A', text: 'Right Atrium' },
      { id: 'B', text: 'Right Ventricle' },
      { id: 'C', text: 'Left Atrium' },
      { id: 'D', text: 'Left Ventricle' }
    ],
    correctOptionId: 'D',
    hint: 'It has the thickest muscular wall.',
    explanation: 'The Left Ventricle pumps oxygenated blood at high pressure into the aorta for systemic circulation.'
  },
  {
    id: 'sr-bio-4',
    subject: 'Biology',
    grade: 10,
    difficulty: 'medium',
    topic: 'Genetics & DNA',
    question: 'In DNA base pairing, Adenine (A) always pairs with which nitrogenous base?',
    options: [
      { id: 'A', text: 'Guanine (G)' },
      { id: 'B', text: 'Cytosine (C)' },
      { id: 'C', text: 'Thymine (T)' },
      { id: 'D', text: 'Uracil (U)' }
    ],
    correctOptionId: 'C',
    hint: 'Remember A–T and G–C in DNA.',
    explanation: 'In DNA, Adenine pairs with Thymine via two hydrogen bonds, and Guanine pairs with Cytosine.'
  },
  {
    id: 'sr-bio-5',
    subject: 'Biology',
    grade: 9,
    difficulty: 'medium',
    topic: 'Cell Division',
    question: 'Which type of cell division produces two genetically identical daughter cells for growth and repair?',
    options: [
      { id: 'A', text: 'Mitosis' },
      { id: 'B', text: 'Meiosis' },
      { id: 'C', text: 'Binary fission only' },
      { id: 'D', text: 'Transpiration' }
    ],
    correctOptionId: 'A',
    hint: 'Meiosis halves chromosome number for gametes; this one keeps it diploid.',
    explanation: 'Mitosis preserves chromosome number (2n → 2n) to produce two identical somatic daughter cells.'
  },
  {
    id: 'sr-bio-6',
    subject: 'Biology',
    grade: 10,
    difficulty: 'hard',
    topic: 'Human Digestive System',
    question: 'Which enzyme present in saliva begins the breakdown of starch into maltose?',
    options: [
      { id: 'A', text: 'Pepsin' },
      { id: 'B', text: 'Salivary Amylase' },
      { id: 'C', text: 'Trypsin' },
      { id: 'D', text: 'Lipase' }
    ],
    correctOptionId: 'B',
    hint: 'Digestion of carbohydrates begins in the mouth.',
    explanation: 'Salivary amylase (ptyalin) hydrolyzes starch into simpler sugars like maltose in the mouth.'
  },
  {
    id: 'sr-bio-7',
    subject: 'Biology',
    grade: 10,
    difficulty: 'hard',
    topic: 'Nervous System',
    question: 'What is the microscopic gap between two neurons across which neurotransmitters diffuse?',
    options: [
      { id: 'A', text: 'Axon' },
      { id: 'B', text: 'Synapse' },
      { id: 'C', text: 'Dendrite' },
      { id: 'D', text: 'Myelin' }
    ],
    correctOptionId: 'B',
    hint: 'Signals cross this junction chemically.',
    explanation: 'A synapse is the junction where an impulse passes from one neuron to another via neurotransmitters.'
  },
  {
    id: 'sr-bio-8',
    subject: 'Biology',
    grade: 8,
    difficulty: 'easy',
    topic: 'Respiration',
    question: 'Which gas is released as a byproduct of aerobic cellular respiration?',
    options: [
      { id: 'A', text: 'Oxygen' },
      { id: 'B', text: 'Nitrogen' },
      { id: 'C', text: 'Carbon dioxide' },
      { id: 'D', text: 'Methane' }
    ],
    correctOptionId: 'C',
    hint: 'Glucose + O₂ → CO₂ + H₂O + ATP.',
    explanation: 'Aerobic respiration breaks down glucose using oxygen and releases carbon dioxide and water.'
  },

  // ==================== ENGLISH (8) ====================
  {
    id: 'sr-eng-1',
    subject: 'English',
    grade: 6,
    difficulty: 'easy',
    topic: 'Parts of Speech',
    question: 'In the sentence "She ran quickly to the library", what part of speech is "quickly"?',
    options: [
      { id: 'A', text: 'Adjective' },
      { id: 'B', text: 'Adverb' },
      { id: 'C', text: 'Preposition' },
      { id: 'D', text: 'Conjunction' }
    ],
    correctOptionId: 'B',
    hint: 'It modifies the verb "ran".',
    explanation: 'An adverb modifies a verb, adjective, or another adverb, often ending in -ly.'
  },
  {
    id: 'sr-eng-2',
    subject: 'English',
    grade: 7,
    difficulty: 'easy',
    topic: 'Vocabulary — Synonyms',
    question: 'Which word is a synonym for "Benevolent"?',
    options: [
      { id: 'A', text: 'Cruel' },
      { id: 'B', text: 'Kind-hearted' },
      { id: 'C', text: 'Stubborn' },
      { id: 'D', text: 'Silent' }
    ],
    correctOptionId: 'B',
    hint: 'Think of charity and goodwill.',
    explanation: '"Benevolent" means well-meaning and kind-hearted.'
  },
  {
    id: 'sr-eng-3',
    subject: 'English',
    grade: 8,
    difficulty: 'medium',
    topic: 'Figures of Speech',
    question: '"The wind whispered secrets through the pine trees" is an example of:',
    options: [
      { id: 'A', text: 'Simile' },
      { id: 'B', text: 'Personification' },
      { id: 'C', text: 'Hyperbole' },
      { id: 'D', text: 'Onomatopoeia' }
    ],
    correctOptionId: 'B',
    hint: 'A non-human thing is given a human action.',
    explanation: 'Personification attributes human qualities (whispering) to non-human objects (the wind).'
  },
  {
    id: 'sr-eng-4',
    subject: 'English',
    grade: 9,
    difficulty: 'medium',
    topic: 'Active & Passive Voice',
    question: 'Which is the passive voice form of "The scholar solved the puzzle"?',
    options: [
      { id: 'A', text: 'The puzzle was solved by the scholar.' },
      { id: 'B', text: 'The scholar was solving the puzzle.' },
      { id: 'C', text: 'The puzzle solves the scholar.' },
      { id: 'D', text: 'The puzzle had solve by the scholar.' }
    ],
    correctOptionId: 'A',
    hint: 'The object ("the puzzle") becomes the grammatical subject.',
    explanation: 'Simple past active ("solved") converts to "was/were + past participle" ("was solved").'
  },
  {
    id: 'sr-eng-5',
    subject: 'English',
    grade: 8,
    difficulty: 'medium',
    topic: 'Subject-Verb Agreement',
    question: 'Choose the grammatically correct sentence:',
    options: [
      { id: 'A', text: 'Neither of the students were late.' },
      { id: 'B', text: 'Neither of the students was late.' },
      { id: 'C', text: 'Each of the books are heavy.' },
      { id: 'D', text: 'The team are winning its match.' }
    ],
    correctOptionId: 'B',
    hint: '"Neither" and "Each" take singular verbs.',
    explanation: 'Indefinite pronouns like "neither" and "each" are singular and take a singular verb ("was").'
  },
  {
    id: 'sr-eng-6',
    subject: 'English',
    grade: 10,
    difficulty: 'hard',
    topic: 'Literary Devices',
    question: 'What is a "Metaphor"?',
    options: [
      { id: 'A', text: 'A direct comparison without using "like" or "as"' },
      { id: 'B', text: 'An extreme exaggeration' },
      { id: 'C', text: 'A comparison using "like" or "as"' },
      { id: 'D', text: 'Repetition of vowel sounds' }
    ],
    correctOptionId: 'A',
    hint: 'Example: "Time is a thief."',
    explanation: 'A metaphor directly equates two unrelated things without "like" or "as" (unlike a simile).'
  },
  {
    id: 'sr-eng-7',
    subject: 'English',
    grade: 9,
    difficulty: 'hard',
    topic: 'Vocabulary — Antonyms',
    question: 'Which word is an antonym for "Ephemeral"?',
    options: [
      { id: 'A', text: 'Brief' },
      { id: 'B', text: 'Eternal' },
      { id: 'C', text: 'Fragile' },
      { id: 'D', text: 'Swift' }
    ],
    correctOptionId: 'B',
    hint: 'Ephemeral means lasting for a very short time.',
    explanation: 'Since "ephemeral" means short-lived, its opposite is "eternal" or permanent.'
  },
  {
    id: 'sr-eng-8',
    subject: 'English',
    grade: 7,
    difficulty: 'easy',
    topic: 'Punctuation',
    question: 'Which punctuation mark is used to show possession (e.g., "Maya’s notebook")?',
    options: [
      { id: 'A', text: 'Semicolon' },
      { id: 'B', text: 'Apostrophe' },
      { id: 'C', text: 'Hyphen' },
      { id: 'D', text: 'Colon' }
    ],
    correctOptionId: 'B',
    hint: 'It sits above the baseline before the "s".',
    explanation: 'An apostrophe (\') indicates possession or contraction.'
  },

  // ==================== HISTORY (8) ====================
  {
    id: 'sr-hist-1',
    subject: 'History',
    grade: 7,
    difficulty: 'easy',
    topic: 'Ancient Civilizations',
    question: 'Along which river did the Harappan (Indus Valley) Civilization flourish?',
    options: [
      { id: 'A', text: 'Nile River' },
      { id: 'B', text: 'Indus River' },
      { id: 'C', text: 'Danube River' },
      { id: 'D', text: 'Amazon River' }
    ],
    correctOptionId: 'B',
    hint: 'Its major cities were Harappa and Mohenjo-daro.',
    explanation: 'The Indus Valley Civilization developed around the Indus and Ghaggar-Hakra river basins (~3300–1300 BCE).'
  },
  {
    id: 'sr-hist-2',
    subject: 'History',
    grade: 8,
    difficulty: 'easy',
    topic: 'Indian Freedom Struggle',
    question: 'In which year did Mahatma Gandhi lead the Salt March (Dandi March)?',
    options: [
      { id: 'A', text: '1919' },
      { id: 'B', text: '1930' },
      { id: 'C', text: '1942' },
      { id: 'D', text: '1947' }
    ],
    correctOptionId: 'B',
    hint: 'It launched the Civil Disobedience Movement.',
    explanation: 'The 24-day Dandi Salt March took place from March 12 to April 6, 1930.'
  },
  {
    id: 'sr-hist-3',
    subject: 'History',
    grade: 9,
    difficulty: 'medium',
    topic: 'French Revolution',
    question: 'Which event on July 14, 1789 symbolized the start of the French Revolution?',
    options: [
      { id: 'A', text: 'Storming of the Bastille' },
      { id: 'B', text: 'Treaty of Versailles' },
      { id: 'C', text: 'Battle of Waterloo' },
      { id: 'D', text: 'Signing of Magna Carta' }
    ],
    correctOptionId: 'A',
    hint: 'A medieval fortress-prison in Paris was attacked.',
    explanation: 'The Storming of the Bastille on 14 July 1789 became the defining symbol of the French Revolution.'
  },
  {
    id: 'sr-hist-4',
    subject: 'History',
    grade: 10,
    difficulty: 'medium',
    topic: 'World War II',
    question: 'In which year did World War II end?',
    options: [
      { id: 'A', text: '1918' },
      { id: 'B', text: '1939' },
      { id: 'C', text: '1945' },
      { id: 'D', text: '1950' }
    ],
    correctOptionId: 'C',
    hint: 'The United Nations was founded the same year.',
    explanation: 'World War II lasted from 1939 to 1945.'
  },
  {
    id: 'sr-hist-5',
    subject: 'History',
    grade: 8,
    difficulty: 'medium',
    topic: 'Mauryan Empire',
    question: 'Which Mauryan emperor adopted Buddhism and promoted Dhamma after the Kalinga War?',
    options: [
      { id: 'A', text: 'Chandragupta Maurya' },
      { id: 'B', text: 'Ashoka the Great' },
      { id: 'C', text: 'Samudragupta' },
      { id: 'D', text: 'Harshavardhana' }
    ],
    correctOptionId: 'B',
    hint: 'His Lion Capital at Sarnath is India’s national emblem.',
    explanation: 'Emperor Ashoka renounced conquest after the Kalinga War (261 BCE) and spread messages of peace.'
  },
  {
    id: 'sr-hist-6',
    subject: 'History',
    grade: 9,
    difficulty: 'hard',
    topic: 'Renaissance',
    question: 'In which European country did the Renaissance begin in the 14th century?',
    options: [
      { id: 'A', text: 'Italy' },
      { id: 'B', text: 'Spain' },
      { id: 'C', text: 'Russia' },
      { id: 'D', text: 'Sweden' }
    ],
    correctOptionId: 'A',
    hint: 'Florence, Venice, and Rome were its cultural centers.',
    explanation: 'The Renaissance began in Florence, Italy before spreading across Europe.'
  },
  {
    id: 'sr-hist-7',
    subject: 'History',
    grade: 10,
    difficulty: 'hard',
    topic: 'Indian Constitution',
    question: 'Who served as the Chairman of the Drafting Committee of the Indian Constitution?',
    options: [
      { id: 'A', text: 'Dr. Rajendra Prasad' },
      { id: 'B', text: 'Dr. B. R. Ambedkar' },
      { id: 'C', text: 'Sardar Patel' },
      { id: 'D', text: 'Jawaharlal Nehru' }
    ],
    correctOptionId: 'B',
    hint: 'He is widely known as the chief architect of the Indian Constitution.',
    explanation: 'Dr. B. R. Ambedkar chaired the 7-member Drafting Committee formed in 1947.'
  },
  {
    id: 'sr-hist-8',
    subject: 'History',
    grade: 7,
    difficulty: 'easy',
    topic: 'Industrial Revolution',
    question: 'Which invention by James Watt greatly powered the Industrial Revolution?',
    options: [
      { id: 'A', text: 'Improved Steam Engine' },
      { id: 'B', text: 'Airplane' },
      { id: 'C', text: 'Microchip' },
      { id: 'D', text: 'Telescope' }
    ],
    correctOptionId: 'A',
    hint: 'It used coal and water vapor to drive factories and locomotives.',
    explanation: 'James Watt’s separate-condenser steam engine (1776) transformed manufacturing and transport.'
  },

  // ==================== GEOGRAPHY (8) ====================
  {
    id: 'sr-geo-1',
    subject: 'Geography',
    grade: 6,
    difficulty: 'easy',
    topic: 'Solar System & Earth',
    question: 'Which imaginary line divides the Earth into the Northern and Southern Hemispheres?',
    options: [
      { id: 'A', text: 'Prime Meridian' },
      { id: 'B', text: 'Equator' },
      { id: 'C', text: 'Tropic of Cancer' },
      { id: 'D', text: 'Arctic Circle' }
    ],
    correctOptionId: 'B',
    hint: 'It is at 0° latitude.',
    explanation: 'The Equator (0° latitude) splits Earth into Northern and Southern Hemispheres.'
  },
  {
    id: 'sr-geo-2',
    subject: 'Geography',
    grade: 7,
    difficulty: 'easy',
    topic: 'Water Cycle',
    question: 'What is the process where water vapor cools in the atmosphere to form clouds?',
    options: [
      { id: 'A', text: 'Evaporation' },
      { id: 'B', text: 'Condensation' },
      { id: 'C', text: 'Infiltration' },
      { id: 'D', text: 'Transpiration' }
    ],
    correctOptionId: 'B',
    hint: 'Gas turns back into tiny liquid droplets.',
    explanation: 'Condensation cools rising water vapor into liquid droplets around dust nuclei, forming clouds.'
  },
  {
    id: 'sr-geo-3',
    subject: 'Geography',
    grade: 8,
    difficulty: 'medium',
    topic: 'Plate Tectonics',
    question: 'What happens at a subduction zone between an oceanic plate and a continental plate?',
    options: [
      { id: 'A', text: 'The denser oceanic plate sinks beneath the continental plate' },
      { id: 'B', text: 'Both plates evaporate' },
      { id: 'C', text: 'Plates stop moving permanently' },
      { id: 'D', text: 'Oceanic water freezes solid' }
    ],
    correctOptionId: 'A',
    hint: 'Oceanic basalt is denser than continental granite.',
    explanation: 'At convergent boundaries, denser oceanic crust subducts into the mantle, forming trenches and volcanoes.'
  },
  {
    id: 'sr-geo-4',
    subject: 'Geography',
    grade: 9,
    difficulty: 'medium',
    topic: 'Atmosphere Layers',
    question: 'Which layer of the atmosphere contains the Ozone Layer that shields Earth from UV radiation?',
    options: [
      { id: 'A', text: 'Troposphere' },
      { id: 'B', text: 'Stratosphere' },
      { id: 'C', text: 'Mesosphere' },
      { id: 'D', text: 'Exosphere' }
    ],
    correctOptionId: 'B',
    hint: 'It lies directly above the troposphere.',
    explanation: 'Most atmospheric ozone (O₃) is concentrated in the stratosphere (15–35 km altitude).'
  },
  {
    id: 'sr-geo-5',
    subject: 'Geography',
    grade: 9,
    difficulty: 'medium',
    topic: 'Indian Geography',
    question: 'Which mountain range forms the northern boundary of the Indian subcontinent?',
    options: [
      { id: 'A', text: 'Western Ghats' },
      { id: 'B', text: 'Himalayas' },
      { id: 'C', text: 'Aravalli Range' },
      { id: 'D', text: 'Vindhya Range' }
    ],
    correctOptionId: 'B',
    hint: 'Home to Mount Everest and Kanchenjunga.',
    explanation: 'The Himalayas stretch across northern India, Nepal, Bhutan, and Tibet.'
  },
  {
    id: 'sr-geo-6',
    subject: 'Geography',
    grade: 10,
    difficulty: 'hard',
    topic: 'Rocks & Minerals',
    question: 'Igneous rocks are formed by the cooling and solidification of:',
    options: [
      { id: 'A', text: 'Compressed seashells' },
      { id: 'B', text: 'Molten magma or lava' },
      { id: 'C', text: 'River silt layers' },
      { id: 'D', text: 'Glacial ice' }
    ],
    correctOptionId: 'B',
    hint: 'Examples include granite and basalt.',
    explanation: 'Igneous rocks crystallize from molten magma underground (intrusive) or lava on the surface (extrusive).'
  },
  {
    id: 'sr-geo-7',
    subject: 'Geography',
    grade: 10,
    difficulty: 'hard',
    topic: 'Oceanography',
    question: 'What is the deepest known oceanic trench on Earth?',
    options: [
      { id: 'A', text: 'Java Trench' },
      { id: 'B', text: 'Mariana Trench' },
      { id: 'C', text: 'Puerto Rico Trench' },
      { id: 'D', text: 'Tonga Trench' }
    ],
    correctOptionId: 'B',
    hint: 'Located in the western Pacific Ocean (~10,984 m deep).',
    explanation: 'The Challenger Deep in the Mariana Trench is Earth’s deepest oceanic point.'
  },
  {
    id: 'sr-geo-8',
    subject: 'Geography',
    grade: 7,
    difficulty: 'easy',
    topic: 'Continents & Oceans',
    question: 'Which is the largest ocean on Earth?',
    options: [
      { id: 'A', text: 'Atlantic Ocean' },
      { id: 'B', text: 'Indian Ocean' },
      { id: 'C', text: 'Pacific Ocean' },
      { id: 'D', text: 'Arctic Ocean' }
    ],
    correctOptionId: 'C',
    hint: 'It covers more than 30% of Earth’s surface.',
    explanation: 'The Pacific Ocean is the largest and deepest of Earth’s oceanic divisions.'
  },

  // ==================== GENERAL KNOWLEDGE (8) ====================
  {
    id: 'sr-gk-1',
    subject: 'General Knowledge',
    grade: 6,
    difficulty: 'easy',
    topic: 'Space Exploration',
    question: 'Which planet in our Solar System is known for its prominent icy ring system?',
    options: [
      { id: 'A', text: 'Mars' },
      { id: 'B', text: 'Saturn' },
      { id: 'C', text: 'Mercury' },
      { id: 'D', text: 'Venus' }
    ],
    correctOptionId: 'B',
    hint: 'The sixth planet from the Sun.',
    explanation: 'Saturn has the most extensive and visible ring system made of ice and rock particles.'
  },
  {
    id: 'sr-gk-2',
    subject: 'General Knowledge',
    grade: 7,
    difficulty: 'easy',
    topic: 'Computer Science Basics',
    question: 'How many bits make up one Byte?',
    options: [
      { id: 'A', text: '4 bits' },
      { id: 'B', text: '8 bits' },
      { id: 'C', text: '16 bits' },
      { id: 'D', text: '32 bits' }
    ],
    correctOptionId: 'B',
    hint: 'A single ASCII character typically uses 1 byte.',
    explanation: '1 Byte = 8 bits, capable of representing 256 distinct values (2⁸).'
  },
  {
    id: 'sr-gk-3',
    subject: 'General Knowledge',
    grade: 8,
    difficulty: 'medium',
    topic: 'Inventions',
    question: 'Who invented the World Wide Web (WWW) in 1989?',
    options: [
      { id: 'A', text: 'Tim Berners-Lee' },
      { id: 'B', text: 'Alan Turing' },
      { id: 'C', text: 'Charles Babbage' },
      { id: 'D', text: 'Ada Lovelace' }
    ],
    correctOptionId: 'A',
    hint: 'He developed HTTP and HTML while at CERN.',
    explanation: 'Sir Tim Berners-Lee invented the World Wide Web at CERN in 1989.'
  },
  {
    id: 'sr-gk-4',
    subject: 'General Knowledge',
    grade: 9,
    difficulty: 'medium',
    topic: 'Space Missions',
    question: 'Which Indian space mission successfully landed near the lunar south pole in August 2023?',
    options: [
      { id: 'A', text: 'Chandrayaan-1' },
      { id: 'B', text: 'Chandrayaan-3' },
      { id: 'C', text: 'Mangalyaan' },
      { id: 'D', text: 'Aditya-L1' }
    ],
    correctOptionId: 'B',
    hint: 'Its Vikram lander and Pragyan rover touched down on August 23, 2023.',
    explanation: 'ISRO’s Chandrayaan-3 made India the first nation to soft-land near the lunar south pole.'
  },
  {
    id: 'sr-gk-5',
    subject: 'General Knowledge',
    grade: 8,
    difficulty: 'medium',
    topic: 'Algorithms & Logic',
    question: 'What is the time complexity of Binary Search on a sorted array of n elements?',
    options: [
      { id: 'A', text: 'O(n)' },
      { id: 'B', text: 'O(log n)' },
      { id: 'C', text: 'O(n²)' },
      { id: 'D', text: 'O(1) always' }
    ],
    correctOptionId: 'B',
    hint: 'Each step cuts the search space in half.',
    explanation: 'Binary Search halves the remaining interval each step, yielding O(log n) worst-case time.'
  },
  {
    id: 'sr-gk-6',
    subject: 'General Knowledge',
    grade: 10,
    difficulty: 'hard',
    topic: 'Global Institutions',
    question: 'Where is the headquarters of UNESCO located?',
    options: [
      { id: 'A', text: 'Geneva, Switzerland' },
      { id: 'B', text: 'Paris, France' },
      { id: 'C', text: 'New York, USA' },
      { id: 'D', text: 'Vienna, Austria' }
    ],
    correctOptionId: 'B',
    hint: 'Capital city of France.',
    explanation: 'UNESCO (UN Educational, Scientific and Cultural Organization) is headquartered in Paris.'
  },
  {
    id: 'sr-gk-7',
    subject: 'General Knowledge',
    grade: 9,
    difficulty: 'hard',
    topic: 'Environmental Science',
    question: 'Which international agreement focuses on reducing greenhouse gas emissions to limit global warming?',
    options: [
      { id: 'A', text: 'Paris Agreement' },
      { id: 'B', text: 'Bretton Woods Accord' },
      { id: 'C', text: 'Geneva Convention' },
      { id: 'D', text: 'Schengen Treaty' }
    ],
    correctOptionId: 'A',
    hint: 'Adopted at COP21 in 2015.',
    explanation: 'The 2015 Paris Agreement aims to limit global temperature rise well below 2°C (targeting 1.5°C).'
  },
  {
    id: 'sr-gk-8',
    subject: 'General Knowledge',
    grade: 7,
    difficulty: 'easy',
    topic: 'World Currencies & Capitals',
    question: 'What is the capital city of Japan?',
    options: [
      { id: 'A', text: 'Osaka' },
      { id: 'B', text: 'Kyoto' },
      { id: 'C', text: 'Tokyo' },
      { id: 'D', text: 'Sapporo' }
    ],
    correctOptionId: 'C',
    hint: 'Formerly known as Edo.',
    explanation: 'Tokyo has been Japan’s capital since 1868.'
  }
];

function mapCurriculumSubject(raw: string): Exclude<SubjectCategory, 'All Subjects'> {
  const s = raw.toLowerCase();
  if (s.includes('math')) return 'Mathematics';
  if (s.includes('phys')) return 'Physics';
  if (s.includes('chem')) return 'Chemistry';
  if (s.includes('bio') || s.includes('sci')) return 'Biology';
  if (s.includes('eng')) return 'English';
  if (s.includes('hist')) return 'History';
  if (s.includes('geo')) return 'Geography';
  return 'General Knowledge';
}

function mapCurriculumDifficulty(d: 1 | 2 | 3): DifficultyLevel {
  if (d === 1) return 'easy';
  if (d === 2) return 'medium';
  return 'hard';
}

/**
 * Combines the 64+ dedicated Study Rush 3D questions with compatible items
 * from the shared STUDYAI CURRICULUM_QUESTION_BANK.
 */
export function getAllStudyRushQuestions(): StudyRushQuestion[] {
  const bridged: StudyRushQuestion[] = CURRICULUM_QUESTION_BANK
    .filter((q) => q.language === 'English' && q.options.length >= 3)
    .map((q) => ({
      id: `cur-${q.id}`,
      subject: mapCurriculumSubject(q.subject),
      grade: q.grade,
      difficulty: mapCurriculumDifficulty(q.difficulty),
      topic: q.topic || q.chapter,
      question: q.question,
      options: q.options.slice(0, 4).map((o) => ({ id: o.id as OptionId, text: o.text })),
      correctOptionId: q.correct_option_id as OptionId,
      hint: q.hint || 'Read the question carefully and eliminate clearly wrong options.',
      explanation: q.explanation
    }));

  return [...STUDY_RUSH_QUESTIONS, ...bridged];
}

export function shuffleList<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function buildQuestionDeck(
  subject: SubjectCategory,
  difficulty: DifficultyLevel,
  grade?: number
): StudyRushQuestion[] {
  const all = getAllStudyRushQuestions();

  let pool = all.filter((q) => {
    const subjectMatch = subject === 'All Subjects' || q.subject === subject;
    const diffMatch = q.difficulty === difficulty;
    const gradeMatch = !grade || Math.abs(q.grade - grade) <= 3;
    return subjectMatch && diffMatch && gradeMatch;
  });

  if (pool.length < 8) {
    pool = all.filter((q) => subject === 'All Subjects' || q.subject === subject);
  }
  if (pool.length < 8) {
    pool = all;
  }

  return shuffleList(pool);
}

/**
 * Selects exactly 3 distinct options for the 3 physical Answer Shrines in the 3D arena.
 * Always includes the correct option ID and 2 distinct distractors, shuffled across positions.
 */
export function selectArenaOptions(question: StudyRushQuestion): StudyRushOption[] {
  const correct = question.options.find((o) => o.id === question.correctOptionId);
  if (!correct) {
    return question.options.slice(0, 3);
  }
  const distractors = shuffleList(
    question.options.filter((o) => o.id !== question.correctOptionId)
  ).slice(0, 2);

  return shuffleList([correct, ...distractors]);
}

/**
 * Strict ID-based answer validation. Never relies on position, color, or random guessing.
 */
export function validateStudyRushAnswer(
  question: StudyRushQuestion,
  selectedOptionId: OptionId
): boolean {
  if (!question || !question.id || !question.correctOptionId) return false;
  return selectedOptionId === question.correctOptionId;
}
