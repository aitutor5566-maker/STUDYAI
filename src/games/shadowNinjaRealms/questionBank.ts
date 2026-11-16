import { OptionId, RealmsQuestion } from './types';

export const REALMS_QUESTIONS: RealmsQuestion[] = [
  {
    id: 'snr-bio-1',
    subject: 'Biology',
    topic: 'Photosynthesis',
    question: 'Which organelle in plant cells captures sunlight to drive photosynthesis?',
    options: [
      { id: 'A', text: 'Chloroplast' },
      { id: 'B', text: 'Mitochondrion' },
      { id: 'C', text: 'Ribosome' }
    ],
    correctOptionId: 'A',
    explanation: 'Chloroplasts contain chlorophyll pigments that absorb light energy to synthesize glucose.',
    hint: 'It contains green chlorophyll.'
  },
  {
    id: 'snr-bio-2',
    subject: 'Biology',
    topic: 'Mitosis',
    question: 'During which phase of mitosis do sister chromatids align at the cell equator?',
    options: [
      { id: 'A', text: 'Prophase' },
      { id: 'B', text: 'Metaphase' },
      { id: 'C', text: 'Telophase' }
    ],
    correctOptionId: 'B',
    explanation: 'In Metaphase, spindle fibers align chromosomes along the metaphase plate at the center.',
    hint: 'Think "M" for Middle.'
  },
  {
    id: 'snr-phy-1',
    subject: 'Physics',
    topic: 'Laws of Motion',
    question: 'According to Newton’s Second Law, what is the net force on a 4 kg mass accelerating at 3 m/s²?',
    options: [
      { id: 'A', text: '7 N' },
      { id: 'B', text: '12 N' },
      { id: 'C', text: '1.33 N' }
    ],
    correctOptionId: 'B',
    explanation: 'F = m × a = 4 kg × 3 m/s² = 12 Newtons.',
    hint: 'Multiply mass by acceleration.'
  },
  {
    id: 'snr-phy-2',
    subject: 'Physics',
    topic: 'Optics',
    question: 'Which phenomenon explains why light bends when passing from air into water?',
    options: [
      { id: 'A', text: 'Refraction' },
      { id: 'B', text: 'Diffraction' },
      { id: 'C', text: 'Reflection' }
    ],
    correctOptionId: 'A',
    explanation: 'Refraction occurs because light changes speed when entering a medium with a different refractive index.',
    hint: 'Light changes speed at the water boundary.'
  },
  {
    id: 'snr-chem-1',
    subject: 'Chemistry',
    topic: 'Atomic Structure',
    question: 'Which subatomic particle determines the atomic number and identity of an element?',
    options: [
      { id: 'A', text: 'Neutron' },
      { id: 'B', text: 'Proton' },
      { id: 'C', text: 'Electron' }
    ],
    correctOptionId: 'B',
    explanation: 'The number of protons in the nucleus defines the atomic number Z of an element.',
    hint: 'It carries a positive charge inside the nucleus.'
  },
  {
    id: 'snr-math-1',
    subject: 'Mathematics',
    topic: 'Quadratic Equations',
    question: 'What are the roots of the quadratic equation x² − 5x + 6 = 0?',
    options: [
      { id: 'A', text: 'x = 2 and x = 3' },
      { id: 'B', text: 'x = −2 and x = −3' },
      { id: 'C', text: 'x = 1 and x = 6' }
    ],
    correctOptionId: 'A',
    explanation: 'Factoring gives (x − 2)(x − 3) = 0, so the roots are x = 2 and x = 3.',
    hint: 'Find two numbers that add to 5 and multiply to 6.'
  },
  {
    id: 'snr-geo-1',
    subject: 'Geography',
    topic: 'Biomes & Climate',
    question: 'Which process in the water cycle turns liquid surface water into atmospheric water vapor?',
    options: [
      { id: 'A', text: 'Condensation' },
      { id: 'B', text: 'Evaporation' },
      { id: 'C', text: 'Precipitation' }
    ],
    correctOptionId: 'B',
    explanation: 'Solar heating drives evaporation, lifting water vapor into the atmosphere to form clouds.',
    hint: 'Sunlit lakes and oceans release vapor upward.'
  },
  {
    id: 'snr-hist-1',
    subject: 'History',
    topic: 'World Civilizations',
    question: 'Which ancient trade network connected East Asia with the Mediterranean world?',
    options: [
      { id: 'A', text: 'The Silk Road' },
      { id: 'B', text: 'The Amber Canal' },
      { id: 'C', text: 'The Atlantic Passage' }
    ],
    correctOptionId: 'A',
    explanation: 'The Silk Road linked China, Central Asia, India, Persia, and the Mediterranean for centuries.',
    hint: 'Named after a prized luxury fabric.'
  },
  {
    id: 'snr-eng-1',
    subject: 'English',
    topic: 'Vocabulary & Literature',
    question: 'What is the closest synonym for the word "resilient"?',
    options: [
      { id: 'A', text: 'Fragile' },
      { id: 'B', text: 'Adaptable & Strong' },
      { id: 'C', text: 'Hesitant' }
    ],
    correctOptionId: 'B',
    explanation: 'Resilient describes someone or something able to recover quickly from difficulties.',
    hint: 'Think of bamboo bending in the wind without breaking.'
  }
];

export function selectRealmsQuestions(subject?: string, topic?: string): RealmsQuestion[] {
  const cleanSub = (subject || '').trim().toLowerCase();
  const cleanTop = (topic || '').trim().toLowerCase();
  const matched = REALMS_QUESTIONS.filter(
    (q) =>
      (cleanTop && (q.topic.toLowerCase().includes(cleanTop) || q.question.toLowerCase().includes(cleanTop))) ||
      (cleanSub && q.subject.toLowerCase().includes(cleanSub))
  );
  if (matched.length >= 3) {
    const rest = REALMS_QUESTIONS.filter((q) => !matched.includes(q));
    return [...matched, ...rest];
  }
  return [...REALMS_QUESTIONS];
}

export function validateRealmsAnswer(
  question: RealmsQuestion,
  chosenOptionId: OptionId,
  answeredIds: Set<string>
): { accepted: boolean; isCorrect: boolean } {
  if (answeredIds.has(question.id)) {
    return { accepted: false, isCorrect: false };
  }
  const isCorrect = question.correctOptionId === chosenOptionId;
  if (isCorrect) {
    answeredIds.add(question.id);
  }
  return { accepted: true, isCorrect };
}
