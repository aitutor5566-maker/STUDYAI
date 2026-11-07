/**
 * STUDYAI — Shared Educational Games Engine
 *
 * Implements the 7 core educational games:
 * 1. Missing Letters
 * 2. Missing Words
 * 3. Match the Pairs
 * 4. MCQ Challenge
 * 5. Word Scramble
 * 6. True or False
 * 7. Find the Mistake
 */

import crypto from 'node:crypto';

export type GameSlug =
  | 'missing_letters'
  | 'missing_words'
  | 'match_pairs'
  | 'mcq_challenge'
  | 'word_scramble'
  | 'true_false'
  | 'find_mistake';

export type GameDifficulty = 'easy' | 'medium' | 'hard';

export interface EducationalGameMeta {
  id: string;
  name: string;
  slug: GameSlug;
  description: string;
  category: 'vocabulary' | 'concept' | 'logic' | 'recall' | 'critical_thinking';
  icon: string;
  badgeColor: string;
  compatibleSubjects: string[];
  supportedDifficulties: GameDifficulty[];
  instructions: string[];
}

export const EDUCATIONAL_GAMES_CATALOG: EducationalGameMeta[] = [
  {
    id: 'game-1',
    name: 'Missing Letters',
    slug: 'missing_letters',
    description: 'Master scientific and academic spelling by filling in missing letter positions with contextual hints.',
    category: 'vocabulary',
    icon: '🔤',
    badgeColor: '#10B981',
    compatibleSubjects: ['Biology', 'Physics', 'Chemistry', 'Mathematics', 'English', 'History', 'Geography', 'Languages'],
    supportedDifficulties: ['easy', 'medium', 'hard'],
    instructions: [
      'Observe the academic term with blank spaces represented by underscores.',
      'Type or select the correct letters to complete the full term.',
      'Request hints if you get stuck, and view the complete definition upon submission.'
    ]
  },
  {
    id: 'game-2',
    name: 'Missing Words',
    slug: 'missing_words',
    description: 'Complete academic statements and law definitions with the correct concept word.',
    category: 'concept',
    icon: '🧩',
    badgeColor: '#3B82F6',
    compatibleSubjects: ['Science', 'Physics', 'Chemistry', 'Biology', 'History', 'Civics', 'Economics', 'English'],
    supportedDifficulties: ['easy', 'medium', 'hard'],
    instructions: [
      'Read the sentence containing an underlined blank space carefully.',
      'Select the correct word from the choices or type in the exact terminology.',
      'Read the educational explanation to reinforce why this term is correct.'
    ]
  },
  {
    id: 'game-3',
    name: 'Match the Pairs',
    slug: 'match_pairs',
    description: 'Connect related terms with their definitions, formulas with principles, or questions with answers.',
    category: 'recall',
    icon: '🔗',
    badgeColor: '#8B5CF6',
    compatibleSubjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Languages'],
    supportedDifficulties: ['easy', 'medium', 'hard'],
    instructions: [
      'Click on a card from Group A (left side) to select it.',
      'Click on the corresponding matching card from Group B (right side).',
      'Match all pairs with minimum mistakes to achieve the highest score.'
    ]
  },
  {
    id: 'game-4',
    name: 'MCQ Challenge',
    slug: 'mcq_challenge',
    description: 'Engage with curriculum-grounded multiple-choice questions with real-time concept feedback.',
    category: 'concept',
    icon: '🎯',
    badgeColor: '#EC4899',
    compatibleSubjects: ['All Academic Subjects', 'Mathematics', 'Science', 'Social Studies', 'English', 'Computer Science'],
    supportedDifficulties: ['easy', 'medium', 'hard'],
    instructions: [
      'Review the academic question and examine the four options provided.',
      'Select the single best answer before the round ends.',
      'Review the concept breakdown to learn both why the correct answer is valid and why distractors are invalid.'
    ]
  },
  {
    id: 'game-5',
    name: 'Word Scramble',
    slug: 'word_scramble',
    description: 'Unscramble mixed letter tiles to discover core scientific terms and vocabulary.',
    category: 'vocabulary',
    icon: '🔀',
    badgeColor: '#F59E0B',
    compatibleSubjects: ['Biology', 'Chemistry', 'Physics', 'Geography', 'English', 'History', 'Languages'],
    supportedDifficulties: ['easy', 'medium', 'hard'],
    instructions: [
      'Look at the scrambled letter tiles representing a key topic word.',
      'Click or drag letters into the answer tray in the correct order.',
      'Use the definition hint to guide your spelling if needed.'
    ]
  },
  {
    id: 'game-6',
    name: 'True or False',
    slug: 'true_false',
    description: 'Evaluate factual and conceptual statements to debunk common academic misconceptions.',
    category: 'logic',
    icon: '⚖️',
    badgeColor: '#06B6D4',
    compatibleSubjects: ['Science', 'History', 'Geography', 'Mathematics', 'Civics', 'Economics'],
    supportedDifficulties: ['easy', 'medium', 'hard'],
    instructions: [
      'Carefully evaluate the provided academic statement.',
      'Choose True if the principle is completely valid, or False if it contains a conceptual flaw.',
      'Read the detailed fact explanation after submission.'
    ]
  },
  {
    id: 'game-7',
    name: 'Find the Mistake',
    slug: 'find_mistake',
    description: 'Spot intentional errors in scientific equations, historical dates, or grammar rules and correct them.',
    category: 'critical_thinking',
    icon: '🔍',
    badgeColor: '#EF4444',
    compatibleSubjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'English'],
    supportedDifficulties: ['easy', 'medium', 'hard'],
    instructions: [
      'Read the formula, sentence, or statement which contains one intentional mistake.',
      'Tap on the flawed token or segment to isolate the error.',
      'Select or type the correct replacement to restore academic accuracy.'
    ]
  }
];

// Helper: infer academic subject from topic name
export function inferSubjectFromTopic(topic: string): string {
  const t = (topic || '').toLowerCase();
  if (/(quadratic|calculus|algebra|triangle|geometry|circle|matrix|fraction|pythagor|polynomial|trigonometr|arithmetic|integers|derivative)/.test(t)) {
    return 'Mathematics';
  }
  if (/(heart|blood|cell|photosynthesis|plant|organ|mitosis|dna|respiration|circulation|ecosystem|digest|bacteria|fungi|anatomy|reproduction)/.test(t)) {
    return 'Biology';
  }
  if (/(friction|gravity|motion|velocity|acceleration|electric|current|lens|optics|light|force|energy|thermodynam|wave|sound|magnet)/.test(t)) {
    return 'Physics';
  }
  if (/(acid|base|salt|atom|periodic|element|reaction|molecule|bond|covalent|ionic|organic|redox|metal|non-metal)/.test(t)) {
    return 'Chemistry';
  }
  if (/(revolution|mughal|british|empire|war|dynasty|independence|treaty|harappa|french revolution|gandhi|crusade)/.test(t)) {
    return 'History';
  }
  if (/(volcano|earthquake|plate|river|climate|monsoon|soil|atmosphere|glacier|ocean|map|latitude|longitude)/.test(t)) {
    return 'Geography';
  }
  if (/(constitution|democracy|parliament|judiciary|rights|government|election|civic)/.test(t)) {
    return 'Civics';
  }
  if (/(tense|verb|noun|preposition|active voice|passive voice|direct speech|metaphor|simile|adjective|clause)/.test(t)) {
    return 'English';
  }
  return 'Science';
}

// -----------------------------------------------------------------------------
// QUESTION GENERATION ENGINE (Grounding & Subject Adaptation)
// -----------------------------------------------------------------------------

export interface BaseQuestion {
  id: string;
  gameSlug: GameSlug;
  topic: string;
  subject: string;
  difficulty: GameDifficulty;
  conceptTested: string;
  hint: string;
  explanation: string;
}

export interface MissingLettersQuestion extends BaseQuestion {
  gameSlug: 'missing_letters';
  fullWord: string;
  displayWord: string; // e.g. "P H O _ O S Y N _ H E S I S"
  missingLetters: string[]; // ['T', 'T']
  missingIndices: number[]; // [4, 9]
  meaning: string;
}

export interface MissingWordsQuestion extends BaseQuestion {
  gameSlug: 'missing_words';
  sentenceWithBlank: string; // "Plants synthesize carbohydrates through the process of ______."
  correctWord: string;
  options: string[]; // 4 multiple choice options
  sentenceCompleted: string;
}

export interface MatchPairsQuestion extends BaseQuestion {
  gameSlug: 'match_pairs';
  pairs: Array<{
    id: string;
    left: string; // e.g. "Chlorophyll"
    right: string; // e.g. "Green photosynthetic pigment"
    category: 'term_meaning' | 'formula_desc' | 'fact_source';
  }>;
  shuffledLeft: string[];
  shuffledRight: string[];
}

export interface MCQQuestion extends BaseQuestion {
  gameSlug: 'mcq_challenge';
  question: string;
  options: string[]; // 4 options
  correctOptionIndex: number;
}

export interface WordScrambleQuestion extends BaseQuestion {
  gameSlug: 'word_scramble';
  word: string;
  scrambledLetters: string[]; // e.g. ['T', 'O', 'P', 'H', 'O', 'S', 'Y', 'N', 'T', 'H', 'E', 'S', 'I', 'S']
  meaning: string;
}

export interface TrueFalseQuestion extends BaseQuestion {
  gameSlug: 'true_false';
  statement: string;
  isTrue: boolean;
  misconceptionAlert?: string;
}

export interface FindMistakeQuestion extends BaseQuestion {
  gameSlug: 'find_mistake';
  incorrectStatement: string; // "Water boils at 90°C at normal atmospheric pressure."
  tokens: string[]; // ["Water", "boils", "at", "90°C", "at", "normal", "atmospheric", "pressure."]
  mistakeTokenIndex: number; // 3 ("90°C")
  mistakeToken: string; // "90°C"
  correctToken: string; // "100°C"
  correctedStatement: string; // "Water boils at 100°C at normal atmospheric pressure."
}

export type GeneratedGameQuestion =
  | MissingLettersQuestion
  | MissingWordsQuestion
  | MatchPairsQuestion
  | MCQQuestion
  | WordScrambleQuestion
  | TrueFalseQuestion
  | FindMistakeQuestion;

/**
 * Builds grounded questions for any topic and any of the 7 games.
 */
export function generateGameQuestions(params: {
  gameSlug: GameSlug;
  topic: string;
  subject?: string;
  difficulty?: GameDifficulty;
  grade?: number;
  count?: number;
}): GeneratedGameQuestion[] {
  const { gameSlug, topic } = params;
  const subject = params.subject || inferSubjectFromTopic(topic);
  const difficulty = params.difficulty || 'medium';
  const count = Math.max(3, Math.min(params.count || 5, 8));

  // Specialized topic knowledge base
  const kb = getTopicKnowledgeBase(topic, subject);

  switch (gameSlug) {
    case 'missing_letters':
      return generateMissingLettersQuestions(kb, topic, subject, difficulty, count);
    case 'missing_words':
      return generateMissingWordsQuestions(kb, topic, subject, difficulty, count);
    case 'match_pairs':
      return generateMatchPairsQuestions(kb, topic, subject, difficulty, count);
    case 'mcq_challenge':
      return generateMCQQuestions(kb, topic, subject, difficulty, count);
    case 'word_scramble':
      return generateWordScrambleQuestions(kb, topic, subject, difficulty, count);
    case 'true_false':
      return generateTrueFalseQuestions(kb, topic, subject, difficulty, count);
    case 'find_mistake':
      return generateFindMistakeQuestions(kb, topic, subject, difficulty, count);
    default:
      return generateMCQQuestions(kb, topic, subject, difficulty, count);
  }
}

// -----------------------------------------------------------------------------
// SPECIFIC GAME GENERATORS
// -----------------------------------------------------------------------------

function generateMissingLettersQuestions(
  kb: TopicKnowledge,
  topic: string,
  subject: string,
  difficulty: GameDifficulty,
  count: number
): MissingLettersQuestion[] {
  const words = kb.keyTerms.slice(0, count);
  return words.map((item, idx) => {
    const fullWord = item.term.toUpperCase();
    const chars = fullWord.split('');

    // Determine missing count based on difficulty
    const missingRatio = difficulty === 'easy' ? 0.25 : difficulty === 'medium' ? 0.4 : 0.55;
    const missingCount = Math.max(1, Math.min(Math.round(chars.length * missingRatio), chars.length - 2));

    const indicesToMask: number[] = [];
    while (indicesToMask.length < missingCount) {
      const randIdx = Math.floor(Math.random() * chars.length);
      if (!indicesToMask.includes(randIdx) && chars[randIdx] !== ' ' && chars[randIdx] !== '-') {
        indicesToMask.push(randIdx);
      }
    }
    indicesToMask.sort((a, b) => a - b);

    const displayChars = chars.map((ch, i) => (indicesToMask.includes(i) ? '_' : ch));
    const missingLetters = indicesToMask.map((i) => chars[i]);

    return {
      id: `q-ml-${idx + 1}-${crypto.randomUUID().slice(0, 6)}`,
      gameSlug: 'missing_letters',
      topic,
      subject,
      difficulty,
      fullWord,
      displayWord: displayChars.join(' '),
      missingLetters,
      missingIndices: indicesToMask,
      meaning: item.meaning,
      conceptTested: item.term,
      hint: `Starts with '${fullWord[0]}' and has ${fullWord.length} letters. Meaning: ${item.meaning}`,
      explanation: `${fullWord} is a fundamental concept in ${topic}: ${item.meaning}`
    };
  });
}

function generateMissingWordsQuestions(
  kb: TopicKnowledge,
  topic: string,
  subject: string,
  difficulty: GameDifficulty,
  count: number
): MissingWordsQuestion[] {
  const items = kb.sentenceFillers.slice(0, count);
  return items.map((item, idx) => {
    const options = shuffleArray([item.correctWord, ...item.distractors]);
    return {
      id: `q-mw-${idx + 1}-${crypto.randomUUID().slice(0, 6)}`,
      gameSlug: 'missing_words',
      topic,
      subject,
      difficulty,
      sentenceWithBlank: item.sentenceWithBlank,
      correctWord: item.correctWord,
      options,
      sentenceCompleted: item.sentenceWithBlank.replace('______', item.correctWord),
      conceptTested: item.concept,
      hint: item.hint || `Relates to ${item.concept}`,
      explanation: item.explanation
    };
  });
}

function generateMatchPairsQuestions(
  kb: TopicKnowledge,
  topic: string,
  subject: string,
  difficulty: GameDifficulty,
  count: number
): MatchPairsQuestion[] {
  // A match round consists of 4 to 6 connected pairs
  const pairCount = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 5 : 6;
  const rawPairs = kb.matchingPairs.slice(0, pairCount);

  const leftItems = rawPairs.map((p) => p.left);
  const rightItems = rawPairs.map((p) => p.right);

  const shuffledLeft = shuffleArray(leftItems);
  const shuffledRight = shuffleArray(rightItems);

  return [
    {
      id: `q-mp-1-${crypto.randomUUID().slice(0, 6)}`,
      gameSlug: 'match_pairs',
      topic,
      subject,
      difficulty,
      pairs: rawPairs.map((p, i) => ({ id: `pair-${i + 1}`, left: p.left, right: p.right, category: 'term_meaning' })),
      shuffledLeft,
      shuffledRight,
      conceptTested: `${topic} Concepts & Definitions`,
      hint: 'Connect each term on the left with its accurate explanation on the right.',
      explanation: 'Every match reinforces core associations between terms and their scientific or academic functions.'
    }
  ];
}

function generateMCQQuestions(
  kb: TopicKnowledge,
  topic: string,
  subject: string,
  difficulty: GameDifficulty,
  count: number
): MCQQuestion[] {
  const items = kb.mcqs.slice(0, count);
  return items.map((item, idx) => {
    const rawOptions = [...item.options];
    const correctVal = rawOptions[item.correctIndex];
    const shuffled = shuffleArray(rawOptions);
    const newIdx = shuffled.indexOf(correctVal);

    return {
      id: `q-mcq-${idx + 1}-${crypto.randomUUID().slice(0, 6)}`,
      gameSlug: 'mcq_challenge',
      topic,
      subject,
      difficulty,
      question: item.question,
      options: shuffled,
      correctOptionIndex: newIdx,
      conceptTested: item.concept,
      hint: item.hint || 'Carefully eliminate options that contradict foundational principles.',
      explanation: item.explanation
    };
  });
}

function generateWordScrambleQuestions(
  kb: TopicKnowledge,
  topic: string,
  subject: string,
  difficulty: GameDifficulty,
  count: number
): WordScrambleQuestion[] {
  const words = kb.keyTerms.slice(0, count);
  return words.map((item, idx) => {
    const word = item.term.toUpperCase();
    const letters = word.split('');
    let scrambled = shuffleArray([...letters]);

    // Ensure it is actually scrambled
    if (scrambled.join('') === word && word.length > 2) {
      scrambled.reverse();
    }

    return {
      id: `q-ws-${idx + 1}-${crypto.randomUUID().slice(0, 6)}`,
      gameSlug: 'word_scramble',
      topic,
      subject,
      difficulty,
      word,
      scrambledLetters: scrambled,
      meaning: item.meaning,
      conceptTested: item.term,
      hint: `First letter is "${word[0]}" and last letter is "${word[word.length - 1]}". Hint: ${item.meaning}`,
      explanation: `${word}: ${item.meaning}`
    };
  });
}

function generateTrueFalseQuestions(
  kb: TopicKnowledge,
  topic: string,
  subject: string,
  difficulty: GameDifficulty,
  count: number
): TrueFalseQuestion[] {
  const items = kb.trueFalseItems.slice(0, count);
  return items.map((item, idx) => {
    return {
      id: `q-tf-${idx + 1}-${crypto.randomUUID().slice(0, 6)}`,
      gameSlug: 'true_false',
      topic,
      subject,
      difficulty,
      statement: item.statement,
      isTrue: item.isTrue,
      conceptTested: item.concept,
      hint: item.hint || 'Think about the exact definitions and scientific boundaries of this concept.',
      explanation: item.explanation,
      misconceptionAlert: item.misconception
    };
  });
}

function generateFindMistakeQuestions(
  kb: TopicKnowledge,
  topic: string,
  subject: string,
  difficulty: GameDifficulty,
  count: number
): FindMistakeQuestion[] {
  const items = kb.findMistakeItems.slice(0, count);
  return items.map((item, idx) => {
    const tokens = item.incorrectStatement.split(' ');
    const mistakeIdx = tokens.findIndex((t) => t.toLowerCase().includes(item.mistakeToken.toLowerCase()));

    return {
      id: `q-fm-${idx + 1}-${crypto.randomUUID().slice(0, 6)}`,
      gameSlug: 'find_mistake',
      topic,
      subject,
      difficulty,
      incorrectStatement: item.incorrectStatement,
      tokens,
      mistakeTokenIndex: mistakeIdx >= 0 ? mistakeIdx : 0,
      mistakeToken: item.mistakeToken,
      correctToken: item.correctToken,
      correctedStatement: item.correctedStatement,
      conceptTested: item.concept,
      hint: item.hint || `Look closely at values, formulas, or directional facts in the statement.`,
      explanation: item.explanation
    };
  });
}

// -----------------------------------------------------------------------------
// ANSWER VALIDATION ENGINE
// -----------------------------------------------------------------------------

export function validateStudentAnswer(params: {
  gameSlug: GameSlug;
  question: GeneratedGameQuestion;
  studentAnswer: any;
  hintsUsed?: number;
}): {
  isCorrect: boolean;
  scoreEarned: number;
  feedback: string;
  explanation: string;
  correctAnswerText: string;
  weakConceptIfWrong?: string;
} {
  const { gameSlug, question, studentAnswer, hintsUsed = 0 } = params;
  let isCorrect = false;
  let correctAnswerText = '';

  const baseScore = question.difficulty === 'hard' ? 25 : question.difficulty === 'medium' ? 20 : 15;
  const hintPenalty = Math.min(baseScore - 5, hintsUsed * 3);

  switch (gameSlug) {
    case 'missing_letters': {
      const q = question as MissingLettersQuestion;
      const normalizedStudent = String(studentAnswer || '').trim().toUpperCase().replace(/\s+/g, '');
      const normalizedTarget = q.fullWord.replace(/\s+/g, '');
      isCorrect = normalizedStudent === normalizedTarget;
      correctAnswerText = q.fullWord;
      break;
    }

    case 'missing_words': {
      const q = question as MissingWordsQuestion;
      const normalizedStudent = String(studentAnswer || '').trim().toLowerCase();
      const normalizedTarget = q.correctWord.trim().toLowerCase();
      isCorrect = normalizedStudent === normalizedTarget;
      correctAnswerText = q.correctWord;
      break;
    }

    case 'match_pairs': {
      const q = question as MatchPairsQuestion;
      // studentAnswer is an array of pairs matched: [{ left: '...', right: '...' }]
      if (Array.isArray(studentAnswer)) {
        const correctMatches = studentAnswer.filter((ansPair: any) => {
          return q.pairs.some((p) => p.left === ansPair.left && p.right === ansPair.right);
        }).length;
        isCorrect = correctMatches === q.pairs.length;
        correctAnswerText = `All ${q.pairs.length} pairs matched correctly.`;
      }
      break;
    }

    case 'mcq_challenge': {
      const q = question as MCQQuestion;
      const selectedIndex = Number(studentAnswer);
      isCorrect = selectedIndex === q.correctOptionIndex;
      correctAnswerText = q.options[q.correctOptionIndex];
      break;
    }

    case 'word_scramble': {
      const q = question as WordScrambleQuestion;
      const normalizedStudent = String(studentAnswer || '').trim().toUpperCase().replace(/\s+/g, '');
      const normalizedTarget = q.word.replace(/\s+/g, '');
      isCorrect = normalizedStudent === normalizedTarget;
      correctAnswerText = q.word;
      break;
    }

    case 'true_false': {
      const q = question as TrueFalseQuestion;
      const studentBool = studentAnswer === true || studentAnswer === 'true' || studentAnswer === 'True';
      isCorrect = studentBool === q.isTrue;
      correctAnswerText = q.isTrue ? 'True' : 'False';
      break;
    }

    case 'find_mistake': {
      const q = question as FindMistakeQuestion;
      // Can submit token index or corrected text
      if (typeof studentAnswer === 'number') {
        isCorrect = studentAnswer === q.mistakeTokenIndex;
      } else if (typeof studentAnswer === 'object' && studentAnswer !== null) {
        const tokenMatch = Number(studentAnswer.tokenIndex) === q.mistakeTokenIndex;
        const textMatch = String(studentAnswer.correction || '').trim().toLowerCase() === q.correctToken.trim().toLowerCase();
        isCorrect = tokenMatch || textMatch;
      } else {
        const normalized = String(studentAnswer || '').trim().toLowerCase();
        isCorrect = normalized.includes(q.mistakeToken.toLowerCase()) || normalized === q.correctToken.toLowerCase();
      }
      correctAnswerText = `The mistake was "${q.mistakeToken}", which should be corrected to "${q.correctToken}".`;
      break;
    }
  }

  const scoreEarned = isCorrect ? Math.max(5, baseScore - hintPenalty) : 0;
  const feedback = isCorrect
    ? 'Excellent! You demonstrated an accurate conceptual understanding.'
    : `Incorrect. The correct answer is: ${correctAnswerText}`;

  return {
    isCorrect,
    scoreEarned,
    feedback,
    explanation: question.explanation,
    correctAnswerText,
    weakConceptIfWrong: isCorrect ? undefined : question.conceptTested
  };
}

// -----------------------------------------------------------------------------
// KNOWLEDGE BASE DICTIONARY FOR HIGH-YIELD TOPICS & FALLBACK ADAPTATION
// -----------------------------------------------------------------------------

interface TopicKnowledge {
  keyTerms: Array<{ term: string; meaning: string }>;
  sentenceFillers: Array<{ sentenceWithBlank: string; correctWord: string; distractors: string[]; explanation: string; concept: string; hint?: string }>;
  matchingPairs: Array<{ left: string; right: string }>;
  mcqs: Array<{ question: string; options: string[]; correctIndex: number; explanation: string; concept: string; hint?: string }>;
  trueFalseItems: Array<{ statement: string; isTrue: boolean; explanation: string; concept: string; misconception?: string; hint?: string }>;
  findMistakeItems: Array<{ incorrectStatement: string; mistakeToken: string; correctToken: string; correctedStatement: string; explanation: string; concept: string; hint?: string }>;
}

function getTopicKnowledgeBase(topic: string, subject: string): TopicKnowledge {
  const t = topic.toLowerCase();

  // 1. Photosynthesis & Plant Biology
  if (t.includes('photosynthesis') || t.includes('plant') || t.includes('chloroplast')) {
    return {
      keyTerms: [
        { term: 'Photosynthesis', meaning: 'Process where autotrophs convert light energy into glucose and oxygen.' },
        { term: 'Chlorophyll', meaning: 'Green pigment that absorbs light energy inside thylakoid membranes.' },
        { term: 'Stomata', meaning: 'Microscopic pores on leaf surfaces that regulate carbon dioxide and water vapor exchange.' },
        { term: 'Glucose', meaning: 'Six-carbon sugar molecule produced as stored chemical energy.' },
        { term: 'Thylakoid', meaning: 'Membrane-bound compartment inside chloroplasts where light reactions occur.' },
        { term: 'Transpiration', meaning: 'Loss of water vapor from the aerial parts of plants.' }
      ],
      sentenceFillers: [
        {
          sentenceWithBlank: 'During photosynthesis, plants absorb water through roots and ______ from the atmosphere.',
          correctWord: 'Carbon dioxide',
          distractors: ['Oxygen', 'Nitrogen', 'Argon'],
          explanation: 'Carbon dioxide enters through leaf stomata and acts as the carbon source for glucose synthesis.',
          concept: 'Reactants of Photosynthesis'
        },
        {
          sentenceWithBlank: 'The light-independent reactions of photosynthesis are also known as the ______ cycle.',
          correctWord: 'Calvin',
          distractors: ['Krebs', 'Citric acid', 'Nitrogen'],
          explanation: 'The Calvin cycle takes place in the stroma and uses ATP and NADPH to fix carbon dioxide into sugar.',
          concept: 'Calvin Cycle'
        },
        {
          sentenceWithBlank: 'Oxygen released during photosynthesis originates from the photolysis of ______.',
          correctWord: 'Water',
          distractors: ['Carbon dioxide', 'Glucose', 'Chlorophyll'],
          explanation: 'During light reactions, water molecules (H2O) are split into electrons, protons, and oxygen gas.',
          concept: 'Photolysis of Water'
        }
      ],
      matchingPairs: [
        { left: 'Chloroplast', right: 'Site of photosynthesis in plant cells' },
        { left: 'Chlorophyll', right: 'Light-absorbing green pigment' },
        { left: 'Stomata', right: 'Pores regulating gas exchange' },
        { left: 'Xylem', right: 'Transports water and mineral salts upward' },
        { left: 'Phloem', right: 'Translocates dissolved sugars throughout plant' }
      ],
      mcqs: [
        {
          question: 'Which byproduct gas is released into the atmosphere during the light reactions of photosynthesis?',
          options: ['Oxygen', 'Carbon Dioxide', 'Hydrogen', 'Nitrogen'],
          correctIndex: 0,
          explanation: 'Water molecules are split in the thylakoid lumen, liberating oxygen (O2) gas.',
          concept: 'Byproducts of Photosynthesis'
        },
        {
          question: 'Where do the light-independent reactions (Calvin cycle) take place within the chloroplast?',
          options: ['Stroma', 'Thylakoid Membrane', 'Outer Membrane', 'Granum'],
          correctIndex: 0,
          explanation: 'The fluid-filled stroma contains enzymes such as RuBisCO needed for carbon fixation.',
          concept: 'Chloroplast Anatomy'
        }
      ],
      trueFalseItems: [
        {
          statement: 'Photosynthesis occurs in both the presence and absence of light continuously.',
          isTrue: false,
          explanation: 'The light-dependent reactions strictly require photons of light energy to energize electrons in chlorophyll.',
          concept: 'Light Requirement',
          misconception: 'Photosynthesis cannot proceed completely in continuous dark environments.'
        },
        {
          statement: 'Chlorophyll primarily reflects green light and absorbs blue and red wavelengths.',
          isTrue: true,
          explanation: 'Because green light is reflected rather than absorbed, plants appear green to the human eye.',
          concept: 'Light Absorption Spectrum'
        }
      ],
      findMistakeItems: [
        {
          incorrectStatement: 'Photosynthesis converts mechanical energy into stored chemical energy in glucose.',
          mistakeToken: 'mechanical',
          correctToken: 'light',
          correctedStatement: 'Photosynthesis converts light energy into stored chemical energy in glucose.',
          explanation: 'Photons from sunlight provide the radiant light energy, not mechanical motion.',
          concept: 'Energy Transformation'
        },
        {
          incorrectStatement: 'Plants take in oxygen gas through stomata to perform photosynthesis during daytime.',
          mistakeToken: 'oxygen',
          correctToken: 'carbon dioxide',
          correctedStatement: 'Plants take in carbon dioxide gas through stomata to perform photosynthesis during daytime.',
          explanation: 'Carbon dioxide is the vital carbon substrate for the Calvin cycle; oxygen is a byproduct.',
          concept: 'Gaseous Exchange'
        }
      ]
    };
  }

  // 2. Human Heart & Circulatory System
  if (t.includes('heart') || t.includes('circulation') || t.includes('blood')) {
    return {
      keyTerms: [
        { term: 'Ventricle', meaning: 'Lower chamber of the heart that pumps blood out to lungs or body.' },
        { term: 'Atrium', meaning: 'Upper receiving chamber of the heart where venous blood enters.' },
        { term: 'Aorta', meaning: 'Largest systemic artery carrying oxygen-rich blood from left ventricle.' },
        { term: 'Hemoglobin', meaning: 'Iron-containing protein in red blood cells that transports oxygen.' },
        { term: 'Artery', meaning: 'Blood vessel carrying blood away from the heart under high pressure.' },
        { term: 'Capillary', meaning: 'Microscopic single-cell thick vessel where nutrient exchange occurs.' }
      ],
      sentenceFillers: [
        {
          sentenceWithBlank: 'Oxygenated blood returns from the lungs into the ______ atrium via pulmonary veins.',
          correctWord: 'Left',
          distractors: ['Right', 'Lower', 'Superior'],
          explanation: 'Pulmonary veins carry oxygen-rich blood directly into the left atrium of the heart.',
          concept: 'Pulmonary Circulation'
        },
        {
          sentenceWithBlank: 'The valve between the right atrium and right ventricle is the ______ valve.',
          correctWord: 'Tricuspid',
          distractors: ['Bicuspid', 'Aortic', 'Pulmonary'],
          explanation: 'The tricuspid valve features three cusps and prevents backflow into the right atrium.',
          concept: 'Cardiac Valves'
        }
      ],
      matchingPairs: [
        { left: 'Left Ventricle', right: 'Pumps oxygenated blood into the aorta' },
        { left: 'Right Ventricle', right: 'Pumps deoxygenated blood to the lungs' },
        { left: 'Pulmonary Artery', right: 'Only artery carrying deoxygenated blood' },
        { left: 'Bicuspid Valve', right: 'Separates left atrium from left ventricle' },
        { left: 'SA Node', right: 'Natural pacemaker of the heart' }
      ],
      mcqs: [
        {
          question: 'Why does the left ventricle have thicker muscular walls than the right ventricle?',
          options: [
            'It pumps blood through high systemic resistance to the entire body',
            'It receives deoxygenated blood from veins',
            'It contains twice as many valves',
            'It filters metabolic waste products'
          ],
          correctIndex: 0,
          explanation: 'Systemic circulation spans the entire organism, demanding higher systolic pumping pressure.',
          concept: 'Myocardial Wall Thickness'
        }
      ],
      trueFalseItems: [
        {
          statement: 'All arteries in the human body carry bright red oxygenated blood without exception.',
          isTrue: false,
          explanation: 'The pulmonary artery is an exception: it transports deoxygenated blood from heart to lungs.',
          concept: 'Arterial Exceptions',
          misconception: 'Arteries are defined by flow direction away from heart, not oxygen saturation.'
        }
      ],
      findMistakeItems: [
        {
          incorrectStatement: 'The right ventricle pumps oxygenated blood directly through the aorta.',
          mistakeToken: 'right',
          correctToken: 'left',
          correctedStatement: 'The left ventricle pumps oxygenated blood directly through the aorta.',
          explanation: 'The left ventricle contracts to eject oxygen-rich blood into the aorta for systemic circulation.',
          concept: 'Ventricular Function'
        }
      ]
    };
  }

  // 3. Friction & Mechanics (Physics)
  if (t.includes('friction') || t.includes('motion') || t.includes('force') || t.includes('gravity')) {
    return {
      keyTerms: [
        { term: 'Friction', meaning: 'Resistive force opposing relative motion between contacting surfaces.' },
        { term: 'Interlocking', meaning: 'Mechanical meshing of microscopic surface irregularities.' },
        { term: 'Lubricant', meaning: 'Substance introduced to reduce friction between moving components.' },
        { term: 'Inertia', meaning: 'Inherent resistance of a body to any change in its state of motion.' },
        { term: 'Newton', meaning: 'Standard SI unit of force equal to kg·m/s².' }
      ],
      sentenceFillers: [
        {
          sentenceWithBlank: 'Static friction is always ______ than kinetic friction between the same surfaces.',
          correctWord: 'Greater',
          distractors: ['Lesser', 'Equal', 'Zero'],
          explanation: 'Extra force is required to break interlocking surface irregularities when starting from rest.',
          concept: 'Static vs Kinetic Friction'
        }
      ],
      matchingPairs: [
        { left: 'Static Friction', right: 'Acts when an applied force attempts to move a stationary body' },
        { left: 'Kinetic Friction', right: 'Acts between surfaces in actual relative sliding motion' },
        { left: 'Rolling Friction', right: 'Smallest frictional resistance encountered by spherical objects' },
        { left: 'Ball Bearings', right: 'Converts sliding friction into rolling friction' }
      ],
      mcqs: [
        {
          question: 'What happens to the frictional force when the roughness of contact surfaces increases?',
          options: ['Friction increases', 'Friction decreases', 'Friction drops to zero', 'Friction becomes negative'],
          correctIndex: 0,
          explanation: 'Rougher surfaces possess more pronounced micro-irregularities that interlock deeply.',
          concept: 'Surface Roughness & Friction'
        }
      ],
      trueFalseItems: [
        {
          statement: 'Friction is purely an undesirable force that serves no beneficial purpose in daily life.',
          isTrue: false,
          explanation: 'Friction is indispensable for walking, applying vehicle brakes, and writing with a pen.',
          concept: 'Friction as a Necessary Force'
        }
      ],
      findMistakeItems: [
        {
          incorrectStatement: 'Ball bearings are installed in machines to maximize sliding friction.',
          mistakeToken: 'maximize',
          correctToken: 'minimize',
          correctedStatement: 'Ball bearings are installed in machines to minimize sliding friction.',
          explanation: 'Ball bearings convert sliding friction into rolling friction to reduce mechanical energy loss.',
          concept: 'Friction Reduction'
        }
      ]
    };
  }

  // Universal Default / Adaptive Fallback (Mathematics, Science, Humanities)
  return {
    keyTerms: [
      { term: 'Hypothesis', meaning: 'Testable explanation formulated based on prior observations.' },
      { term: 'Variable', meaning: 'Any factor, trait, or condition that can exist in differing amounts or types.' },
      { term: 'Equilibrium', meaning: 'State of balanced opposing forces or actions.' },
      { term: 'Coefficient', meaning: 'Numerical factor multiplying an algebraic term or variable.' },
      { term: 'Conservation', meaning: 'Fundamental law stating total quantity remains constant over time.' }
    ],
    sentenceFillers: [
      {
        sentenceWithBlank: `In the study of ${topic}, an accurate understanding begins with foundational ______ principles.`,
        correctWord: 'Scientific',
        distractors: ['Random', 'Unverified', 'Hypothetical'],
        explanation: 'Academic mastery relies on proven scientific methods and verified principles.',
        concept: 'Foundational Knowledge'
      }
    ],
    matchingPairs: [
      { left: 'Principle', right: 'Fundamental truth or proposition serving as foundational reasoning' },
      { left: 'Formula', right: 'Mathematical or chemical rule expressed in symbols' },
      { left: 'Experiment', right: 'Scientific procedure undertaken to test a hypothesis' },
      { left: 'Conclusion', right: 'Judgment or decision reached by systematic reasoning' }
    ],
    mcqs: [
      {
        question: `Which fundamental principle governs learning and investigation in ${topic}?`,
        options: [
          'Systematic observation and empirical evidence',
          'Unverified assumptions',
          'Ignoring contradictory data',
          'Arbitrary speculation'
        ],
        correctIndex: 0,
        explanation: 'Academic disciplines mandate empirical verification and evidence-based analysis.',
        concept: 'Empirical Verification'
      }
    ],
    trueFalseItems: [
      {
        statement: `Understanding core principles in ${topic} allows accurate prediction of real-world phenomena.`,
        isTrue: true,
        explanation: 'Scientific and academic laws enable predictive modeling and practical engineering.',
        concept: 'Predictive Value of Knowledge'
      }
    ],
    findMistakeItems: [
      {
        incorrectStatement: `A scientific theory in ${topic} can never be tested or verified by experimental evidence.`,
        mistakeToken: 'never',
        correctToken: 'always',
        correctedStatement: `A scientific theory in ${topic} can always be tested or verified by experimental evidence.`,
        explanation: 'Falsifiability and testability are primary requirements of any scientific theory.',
        concept: 'Scientific Method'
      }
    ]
  };
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
