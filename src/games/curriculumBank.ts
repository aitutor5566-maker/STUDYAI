import type { EducationalQuestion } from './types.ts';

export const CURRICULUM_QUESTION_BANK: EducationalQuestion[] = [
  // ==========================================
  // Grade 5 Mathematics — Fractions & Decimals (English)
  // ==========================================
  {
    id: 'g5-math-frac-1',
    grade: 5,
    subject: 'Maths',
    chapter: 'Fractions',
    topic: 'Equivalent Fractions',
    language: 'English',
    difficulty: 1,
    question: 'Which fraction is equivalent to one-half (1/2)?',
    options: [
      { id: 'A', text: '2/4' },
      { id: 'B', text: '1/3' },
      { id: 'C', text: '3/5' },
      { id: 'D', text: '2/5' }
    ],
    correct_option_id: 'A',
    explanation: 'Multiplying numerator and denominator of 1/2 by 2 gives 2/4.',
    hint: 'Divide the numerator and denominator by 2 to simplify.'
  },
  {
    id: 'g5-math-frac-2',
    grade: 5,
    subject: 'Maths',
    chapter: 'Fractions',
    topic: 'Equivalent Fractions',
    language: 'English',
    difficulty: 1,
    question: 'What is 3/6 simplified to its lowest terms?',
    options: [
      { id: 'A', text: '1/3' },
      { id: 'B', text: '1/2' },
      { id: 'C', text: '2/3' },
      { id: 'D', text: '3/4' }
    ],
    correct_option_id: 'B',
    explanation: 'Dividing both 3 and 6 by their greatest common factor 3 yields 1/2.',
    hint: 'Both 3 and 6 can be divided by 3.'
  },
  {
    id: 'g5-math-frac-3',
    grade: 5,
    subject: 'Maths',
    chapter: 'Fractions',
    topic: 'Equivalent Fractions',
    language: 'English',
    difficulty: 2,
    question: 'Solve: 1/4 + 2/4 = ?',
    options: [
      { id: 'A', text: '3/4' },
      { id: 'B', text: '3/8' },
      { id: 'C', text: '2/4' },
      { id: 'D', text: '1/2' }
    ],
    correct_option_id: 'A',
    explanation: 'With common denominator 4, add the numerators: 1 + 2 = 3, giving 3/4.',
    hint: 'Keep the denominator the same and add the numerators.'
  },
  {
    id: 'g5-math-frac-4',
    grade: 5,
    subject: 'Maths',
    chapter: 'Fractions',
    topic: 'Equivalent Fractions',
    language: 'English',
    difficulty: 2,
    question: 'Which is the largest fraction among the following?',
    options: [
      { id: 'A', text: '1/8' },
      { id: 'B', text: '1/4' },
      { id: 'C', text: '3/4' },
      { id: 'D', text: '1/2' }
    ],
    correct_option_id: 'C',
    explanation: '3/4 represents 75%, which is larger than 1/2 (50%), 1/4 (25%), and 1/8 (12.5%).',
    hint: 'Convert to decimals or visualize slices of a whole pizza.'
  },
  {
    id: 'g5-math-frac-5',
    grade: 5,
    subject: 'Maths',
    chapter: 'Fractions',
    topic: 'Equivalent Fractions',
    language: 'English',
    difficulty: 3,
    question: 'Calculate: 3/5 - 1/5 = ?',
    options: [
      { id: 'A', text: '2/5' },
      { id: 'B', text: '2/10' },
      { id: 'C', text: '4/5' },
      { id: 'D', text: '1/5' }
    ],
    correct_option_id: 'A',
    explanation: 'With like denominators, subtract the numerators: 3 - 1 = 2, so 2/5.',
    hint: 'Subtract only the top numbers.'
  },
  {
    id: 'g5-math-frac-6',
    grade: 5,
    subject: 'Maths',
    chapter: 'Fractions',
    topic: 'Equivalent Fractions',
    language: 'English',
    difficulty: 3,
    question: 'What fraction of an hour is 15 minutes?',
    options: [
      { id: 'A', text: '1/2' },
      { id: 'B', text: '1/3' },
      { id: 'C', text: '1/4' },
      { id: 'D', text: '1/5' }
    ],
    correct_option_id: 'C',
    explanation: '15 minutes out of 60 minutes simplifies to 15/60 = 1/4 of an hour.',
    hint: 'An hour has 60 minutes. Divide 15 by 60.'
  },

  // ==========================================
  // Grade 5 Science — Solar System & Planetary Orbits (English)
  // ==========================================
  {
    id: 'g5-sci-solar-1',
    grade: 5,
    subject: 'Science',
    chapter: 'Solar System',
    topic: 'Planetary Orbits',
    language: 'English',
    difficulty: 1,
    question: 'Which planet is closest to the Sun?',
    options: [
      { id: 'A', text: 'Venus' },
      { id: 'B', text: 'Mercury' },
      { id: 'C', text: 'Earth' },
      { id: 'D', text: 'Mars' }
    ],
    correct_option_id: 'B',
    explanation: 'Mercury is the innermost planet of our Solar System, orbiting closest to the Sun.',
    hint: 'It is also the smallest planet in our solar system.'
  },
  {
    id: 'g5-sci-solar-2',
    grade: 5,
    subject: 'Science',
    chapter: 'Solar System',
    topic: 'Planetary Orbits',
    language: 'English',
    difficulty: 1,
    question: 'Which planet is famously known as the "Red Planet"?',
    options: [
      { id: 'A', text: 'Jupiter' },
      { id: 'B', text: 'Mars' },
      { id: 'C', text: 'Saturn' },
      { id: 'D', text: 'Venus' }
    ],
    correct_option_id: 'B',
    explanation: 'Mars appears red because its surface is covered with iron-oxide (rust) dust.',
    hint: 'It is named after the Roman god of war.'
  },
  {
    id: 'g5-sci-solar-3',
    grade: 5,
    subject: 'Science',
    chapter: 'Solar System',
    topic: 'Planetary Orbits',
    language: 'English',
    difficulty: 2,
    question: 'What is the largest planet in our Solar System?',
    options: [
      { id: 'A', text: 'Saturn' },
      { id: 'B', text: 'Neptune' },
      { id: 'C', text: 'Jupiter' },
      { id: 'D', text: 'Uranus' }
    ],
    correct_option_id: 'C',
    explanation: 'Jupiter is the most massive planet, with more mass than all other planets combined.',
    hint: 'It has the Great Red Spot storm.'
  },
  {
    id: 'g5-sci-solar-4',
    grade: 5,
    subject: 'Science',
    chapter: 'Solar System',
    topic: 'Planetary Orbits',
    language: 'English',
    difficulty: 2,
    question: 'How long does Earth take to complete one full orbit around the Sun?',
    options: [
      { id: 'A', text: '24 hours' },
      { id: 'B', text: '30 days' },
      { id: 'C', text: '365 1/4 days' },
      { id: 'D', text: '12 months exactly' }
    ],
    correct_option_id: 'C',
    explanation: 'Earth completes one full revolution around the Sun in approximately 365.25 days (one year).',
    hint: 'The extra 1/4 day creates a leap year every 4 years.'
  },
  {
    id: 'g5-sci-solar-5',
    grade: 5,
    subject: 'Science',
    chapter: 'Solar System',
    topic: 'Planetary Orbits',
    language: 'English',
    difficulty: 3,
    question: 'What force keeps the planets in orbit around the Sun?',
    options: [
      { id: 'A', text: 'Magnetic force' },
      { id: 'B', text: 'Gravitational force' },
      { id: 'C', text: 'Frictional force' },
      { id: 'D', text: 'Electrostatic force' }
    ],
    correct_option_id: 'B',
    explanation: 'The Sun’s massive gravitational pull curves the straight-line motion of planets into orbits.',
    hint: 'It is the same attractive force that pulls an apple toward the ground.'
  },
  {
    id: 'g5-sci-solar-6',
    grade: 5,
    subject: 'Science',
    chapter: 'Solar System',
    topic: 'Planetary Orbits',
    language: 'English',
    difficulty: 3,
    question: 'Which planet has the most prominent and visible ring system?',
    options: [
      { id: 'A', text: 'Saturn' },
      { id: 'B', text: 'Jupiter' },
      { id: 'C', text: 'Uranus' },
      { id: 'D', text: 'Neptune' }
    ],
    correct_option_id: 'A',
    explanation: 'Saturn has spectacular rings composed of billions of chunks of water ice and rock.',
    hint: 'It is the sixth planet from the Sun.'
  },

  // ==========================================
  // Grade 8 Science — Electricity & Circuits (English)
  // ==========================================
  {
    id: 'g8-sci-elec-1',
    grade: 8,
    subject: 'Science',
    chapter: 'Electricity',
    topic: 'Electric Circuits',
    language: 'English',
    difficulty: 1,
    question: 'What is the SI unit of electric current?',
    options: [
      { id: 'A', text: 'Volt (V)' },
      { id: 'B', text: 'Ampere (A)' },
      { id: 'C', text: 'Ohm (Ω)' },
      { id: 'D', text: 'Watt (W)' }
    ],
    correct_option_id: 'B',
    explanation: 'The Ampere (A) measures the rate of flow of electric charges per second.',
    hint: 'Named after the French physicist André-Marie Ampère.'
  },
  {
    id: 'g8-sci-elec-2',
    grade: 8,
    subject: 'Science',
    chapter: 'Electricity',
    topic: 'Electric Circuits',
    language: 'English',
    difficulty: 1,
    question: 'Which of the following is a good conductor of electricity?',
    options: [
      { id: 'A', text: 'Rubber' },
      { id: 'B', text: 'Copper wire' },
      { id: 'C', text: 'Plastic' },
      { id: 'D', text: 'Dry wood' }
    ],
    correct_option_id: 'B',
    explanation: 'Copper has abundant free electrons, allowing electric charge to flow freely.',
    hint: 'Used in electrical wiring in homes.'
  },
  {
    id: 'g8-sci-elec-3',
    grade: 8,
    subject: 'Science',
    chapter: 'Electricity',
    topic: 'Electric Circuits',
    language: 'English',
    difficulty: 2,
    question: 'According to Ohm’s Law, what is the mathematical relationship between Voltage (V), Current (I), and Resistance (R)?',
    options: [
      { id: 'A', text: 'V = I / R' },
      { id: 'B', text: 'V = I × R' },
      { id: 'C', text: 'V = I + R' },
      { id: 'D', text: 'I = V × R' }
    ],
    correct_option_id: 'B',
    explanation: 'Ohm’s law states that potential difference is directly proportional to current: V = I × R.',
    hint: 'Voltage equals Current times Resistance.'
  },
  {
    id: 'g8-sci-elec-4',
    grade: 8,
    subject: 'Science',
    chapter: 'Electricity',
    topic: 'Electric Circuits',
    language: 'English',
    difficulty: 2,
    question: 'In a series circuit, if one bulb burns out and breaks the circuit, what happens to the remaining bulbs?',
    options: [
      { id: 'A', text: 'They glow brighter' },
      { id: 'B', text: 'All bulbs turn off' },
      { id: 'C', text: 'They continue glowing unchanged' },
      { id: 'D', text: 'Only the last bulb stays lit' }
    ],
    correct_option_id: 'B',
    explanation: 'A series circuit has a single continuous pathway; any break stops current to all components.',
    hint: 'There is only one path for current to flow.'
  },
  {
    id: 'g8-sci-elec-5',
    grade: 8,
    subject: 'Science',
    chapter: 'Electricity',
    topic: 'Electric Circuits',
    language: 'English',
    difficulty: 3,
    question: 'Which instrument is connected in parallel to measure potential difference across a resistor?',
    options: [
      { id: 'A', text: 'Ammeter' },
      { id: 'B', text: 'Voltmeter' },
      { id: 'C', text: 'Galvanometer' },
      { id: 'D', text: 'Rheostat' }
    ],
    correct_option_id: 'B',
    explanation: 'A voltmeter has very high internal resistance and is connected in parallel across the component.',
    hint: 'Measures Volts across two points.'
  },

  // ==========================================
  // Grade 5 Science — Solar System (Telugu - తెలుగు)
  // ==========================================
  {
    id: 'g5-sci-solar-te-1',
    grade: 5,
    subject: 'Science',
    chapter: 'Solar System',
    topic: 'Planetary Orbits',
    language: 'Telugu',
    difficulty: 1,
    question: 'సూర్యునికి అత్యంత సమీపంలో ఉన్న గ్రహం ఏది?',
    options: [
      { id: 'A', text: 'బుధుడు (Mercury)' },
      { id: 'B', text: 'శుక్రుడు (Venus)' },
      { id: 'C', text: 'భూమి (Earth)' },
      { id: 'D', text: 'కుజుడు (Mars)' }
    ],
    correct_option_id: 'A',
    explanation: 'మన సౌర కుటుంబంలో సూర్యునికి అత్యంత దగ్గరగా ఉన్న మొదటి గ్రహం బుధుడు (Mercury).',
    hint: 'ఇది సౌర కుటుంబంలో అతి చిన్న గ్రహం కూడా.'
  },
  {
    id: 'g5-sci-solar-te-2',
    grade: 5,
    subject: 'Science',
    chapter: 'Solar System',
    topic: 'Planetary Orbits',
    language: 'Telugu',
    difficulty: 1,
    question: 'సౌర కుటుంబంలో "ఎరుపు గ్రహం" (Red Planet) అని ఏ గ్రహాన్ని పిలుస్తారు?',
    options: [
      { id: 'A', text: 'బృహస్పతి (Jupiter)' },
      { id: 'B', text: 'కుజుడు (Mars)' },
      { id: 'C', text: 'శని (Saturn)' },
      { id: 'D', text: 'శుక్రుడు (Venus)' }
    ],
    correct_option_id: 'B',
    explanation: 'కుజుని ఉపరితలంపై ఐరన్ ఆక్సైడ్ (తుప్పు) ధూళి ఎక్కువగా ఉండడం వల్ల ఎర్రగా కనిపిస్తుంది.',
    hint: 'భూమికి తర్వాత ఉన్న నాల్గవ గ్రహం.'
  },
  {
    id: 'g5-sci-solar-te-3',
    grade: 5,
    subject: 'Science',
    chapter: 'Solar System',
    topic: 'Planetary Orbits',
    language: 'Telugu',
    difficulty: 2,
    question: 'సౌర కుటుంబంలో అన్నింటికంటే అతిపెద్ద గ్రహం ఏది?',
    options: [
      { id: 'A', text: 'శని (Saturn)' },
      { id: 'B', text: 'వరుణుడు (Neptune)' },
      { id: 'C', text: 'బృహస్పతి (Jupiter)' },
      { id: 'D', text: 'యురేనస్ (Uranus)' }
    ],
    correct_option_id: 'C',
    explanation: 'బృహస్పతి (Jupiter) సౌర కుటుంబంలో అత్యంత భారీ మరియు అతిపెద్ద వాయు గ్రహం.',
    hint: 'దీనిపై గ్రేట్ రెడ్ స్పాట్ అనే భారీ తుఫాను ఉంది.'
  },
  {
    id: 'g5-sci-solar-te-4',
    grade: 5,
    subject: 'Science',
    chapter: 'Solar System',
    topic: 'Planetary Orbits',
    language: 'Telugu',
    difficulty: 2,
    question: 'గ్రహాలు సూర్యుని చుట్టూ తిరగడానికి కారణమైన ప్రధాన ఆకర్షణ శక్తి ఏది?',
    options: [
      { id: 'A', text: 'అయస్కాంత శక్తి' },
      { id: 'B', text: 'గురుత్వాకర్షణ శక్తి (Gravity)' },
      { id: 'C', text: 'ఘర్షణ శక్తి' },
      { id: 'D', text: 'స్థిర విద్యుత్ శక్తి' }
    ],
    correct_option_id: 'B',
    explanation: 'సూర్యుని అపారమైన గురుత్వాకర్షణ శక్తి గ్రహాలను స్థిరమైన కక్ష్యలలో బంధించి ఉంచుతుంది.',
    hint: 'పైకి విసిరిన వస్తువును క్రిందికి లాగే శక్తి.'
  },

  // ==========================================
  // Grade 5 Science — Solar System (Hindi - हिंदी)
  // ==========================================
  {
    id: 'g5-sci-solar-hi-1',
    grade: 5,
    subject: 'Science',
    chapter: 'Solar System',
    topic: 'Planetary Orbits',
    language: 'Hindi',
    difficulty: 1,
    question: 'सूर्य के सबसे निकट कौन सा ग्रह स्थित है?',
    options: [
      { id: 'A', text: 'शुक्र (Venus)' },
      { id: 'B', text: 'बुध (Mercury)' },
      { id: 'C', text: 'पृथ्वी (Earth)' },
      { id: 'D', text: 'मंगल (Mars)' }
    ],
    correct_option_id: 'B',
    explanation: 'बुध (Mercury) हमारे सौरमंडल में सूर्य के सबसे निकट स्थित ग्रह है।',
    hint: 'यह हमारे सौरमंडल का सबसे छोटा ग्रह भी है।'
  },
  {
    id: 'g5-sci-solar-hi-2',
    grade: 5,
    subject: 'Science',
    chapter: 'Solar System',
    topic: 'Planetary Orbits',
    language: 'Hindi',
    difficulty: 1,
    question: 'किस ग्रह को "लाल ग्रह" (Red Planet) के नाम से जाना जाता है?',
    options: [
      { id: 'A', text: 'बृहस्पति (Jupiter)' },
      { id: 'B', text: 'मंगल (Mars)' },
      { id: 'C', text: 'शनि (Saturn)' },
      { id: 'D', text: 'शुक्र (Venus)' }
    ],
    correct_option_id: 'B',
    explanation: 'मंगल ग्रह की सतह पर आयरन ऑक्साइड (जंग) की अधिकता के कारण यह लाल दिखाई देता है।',
    hint: 'यह सूर्य से चौथा ग्रह है।'
  },
  {
    id: 'g5-sci-solar-hi-3',
    grade: 5,
    subject: 'Science',
    chapter: 'Solar System',
    topic: 'Planetary Orbits',
    language: 'Hindi',
    difficulty: 2,
    question: 'हमारे सौरमंडल का सबसे बड़ा ग्रह कौन सा है?',
    options: [
      { id: 'A', text: 'शनि (Saturn)' },
      { id: 'B', text: 'वरुण (Neptune)' },
      { id: 'C', text: 'बृहस्पति (Jupiter)' },
      { id: 'D', text: 'अरुण (Uranus)' }
    ],
    correct_option_id: 'C',
    explanation: 'बृहस्पति (Jupiter) सौरमंडल का सबसे विशाल और द्रव्यमान वाला ग्रह है।',
    hint: 'इसके पास प्रसिद्ध विशाल लाल धब्बा (Great Red Spot) है।'
  },

  // ==========================================
  // Grade 10 Science — Photosynthesis (English)
  // ==========================================
  {
    id: 'g10-sci-photo-1',
    grade: 10,
    subject: 'Science',
    chapter: 'Life Processes',
    topic: 'Photosynthesis',
    language: 'English',
    difficulty: 2,
    question: 'What is the primary green pigment that traps sunlight in plant leaves?',
    options: [
      { id: 'A', text: 'Carotene' },
      { id: 'B', text: 'Chlorophyll' },
      { id: 'C', text: 'Anthocyanin' },
      { id: 'D', text: 'Hemoglobin' }
    ],
    correct_option_id: 'B',
    explanation: 'Chlorophyll located in thylakoid membranes absorbs blue and red wavelengths of sunlight.',
    hint: 'Gives leaves their vibrant green color.'
  },
  {
    id: 'g10-sci-photo-2',
    grade: 10,
    subject: 'Science',
    chapter: 'Life Processes',
    topic: 'Photosynthesis',
    language: 'English',
    difficulty: 3,
    question: 'During photosynthesis, oxygen released into the atmosphere originates from which molecule?',
    options: [
      { id: 'A', text: 'Carbon Dioxide (CO₂)' },
      { id: 'B', text: 'Water (H₂O)' },
      { id: 'C', text: 'Glucose (C₆H₁₂O₆)' },
      { id: 'D', text: 'Chlorophyll' }
    ],
    correct_option_id: 'B',
    explanation: 'Photolysis of water (splitting of H₂O by light energy) releases oxygen gas and protons.',
    hint: 'Water is split during the light reaction phase.'
  },
  // ==========================================
  // Biology & Human Body — Circulatory System & Organs (English)
  // ==========================================
  {
    id: 'g7-bio-body-1',
    grade: 7,
    subject: 'Biology',
    chapter: 'Human Body',
    topic: 'Circulatory System',
    language: 'English',
    difficulty: 2,
    question: 'Which organ pumps blood throughout the human body?',
    options: [
      { id: 'A', text: 'Lungs' },
      { id: 'B', text: 'Heart' },
      { id: 'C', text: 'Liver' },
      { id: 'D', text: 'Stomach' }
    ],
    correct_option_id: 'B',
    explanation: 'The heart is the primary muscular organ that circulates blood through blood vessels to all parts of the human body.',
    hint: 'A muscular organ located in the center-left of the chest.'
  },
  {
    id: 'g7-bio-body-2',
    grade: 7,
    subject: 'Biology',
    chapter: 'Human Body',
    topic: 'Respiratory System',
    language: 'English',
    difficulty: 2,
    question: 'Which organs are responsible for gas exchange, absorbing oxygen and expelling carbon dioxide?',
    options: [
      { id: 'A', text: 'Lungs' },
      { id: 'B', text: 'Kidneys' },
      { id: 'C', text: 'Liver' },
      { id: 'D', text: 'Heart' }
    ],
    correct_option_id: 'A',
    explanation: 'The lungs facilitate respiration by allowing oxygen to enter red blood cells in the alveoli while expelling carbon dioxide.',
    hint: 'Paired spongy organs located inside the thoracic rib cage.'
  },
  {
    id: 'g7-bio-body-3',
    grade: 7,
    subject: 'Biology',
    chapter: 'Human Body',
    topic: 'Nervous System',
    language: 'English',
    difficulty: 2,
    question: 'Which organ serves as the central control unit for thoughts, memory, and voluntary movement?',
    options: [
      { id: 'A', text: 'Brain' },
      { id: 'B', text: 'Spinal Cord' },
      { id: 'C', text: 'Heart' },
      { id: 'D', text: 'Pancreas' }
    ],
    correct_option_id: 'A',
    explanation: 'The brain coordinates sensory processing, cognitive function, homeostasis, and motor control.',
    hint: 'Protected inside the human cranium/skull.'
  },
  {
    id: 'g7-bio-body-4',
    grade: 7,
    subject: 'Biology',
    chapter: 'Human Body',
    topic: 'Excretory System',
    language: 'English',
    difficulty: 2,
    question: 'Which pair of bean-shaped organs filters metabolic waste products from the blood to produce urine?',
    options: [
      { id: 'A', text: 'Kidneys' },
      { id: 'B', text: 'Liver' },
      { id: 'C', text: 'Spleen' },
      { id: 'D', text: 'Lungs' }
    ],
    correct_option_id: 'A',
    explanation: 'The kidneys filter blood through nephrons, regulating fluid balance and extracting urea into urine.',
    hint: 'Bean-shaped organs located in the posterior abdominal wall.'
  }
];

export function getCurriculumFallbackQuestions(params: {
  topic: string;
  grade?: number;
  language?: string;
  count?: number;
}): EducationalQuestion[] {
  const t = (params.topic || '').toLowerCase();
  const lang = params.language || 'English';
  const grade = params.grade || 5;
  const count = params.count || 6;

  // 1. Try exact topic + language match
  let matches = CURRICULUM_QUESTION_BANK.filter(
    (q) =>
      q.language === lang &&
      (q.topic.toLowerCase().includes(t) ||
        t.includes(q.topic.toLowerCase()) ||
        q.chapter.toLowerCase().includes(t) ||
        t.includes(q.chapter.toLowerCase()))
  );

  // 2. If no exact match, fallback to language match
  if (matches.length === 0) {
    matches = CURRICULUM_QUESTION_BANK.filter((q) => q.language === lang);
  }

  // 3. Fallback to English curriculum questions if requested language has limited entries
  if (matches.length === 0) {
    matches = CURRICULUM_QUESTION_BANK.filter((q) => q.language === 'English');
  }

  return matches.slice(0, count);
}
