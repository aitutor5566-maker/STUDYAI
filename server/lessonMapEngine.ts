import { db } from './db.ts';
import { multiModelAiTeacherEngine } from './multiModelAiTeacherEngine.ts';

export type LessonNodeStatus =
  | 'locked'
  | 'available'
  | 'in_progress'
  | 'completed'
  | 'needs_revision'
  | 'mastered';

export interface FormulaConnectionItem {
  id: string;
  name: string;
  equation: string;
  meaning: string;
  symbols: Array<{ symbol: string; meaning: string; unit?: string }>;
  whenToUse: string;
  solvedExample: string;
}

export interface CurriculumLessonNode {
  id: string;
  subject: string;
  grade: number;
  unit: string;
  chapter: string;
  title: string;
  topics: string[];
  subtopics: string[];
  prerequisites: string[];
  importance: 'core' | 'high' | 'advanced';
  estimatedMinutes: number;
  x: number;
  y: number;
  practiceQuestion: {
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  formulas?: FormulaConnectionItem[];
}

export interface ComputedLessonNode extends CurriculumLessonNode {
  status: LessonNodeStatus;
  quizScore: number | null;
  attempts: number;
  xpEarned: number;
  nextRevisionAt: string | null;
  missingPrerequisites: string[];
}

export interface ExamRoadmapPhase {
  phase: number;
  title: string;
  focus: string;
  allocatedDays: number;
  tasks: string[];
}

let tablesInitialized = false;

export function ensureLessonMapTables(): void {
  if (tablesInitialized) return;
  db.exec(`
    CREATE TABLE IF NOT EXISTS lesson_map_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'available',
      quiz_score REAL,
      attempts INTEGER NOT NULL DEFAULT 0,
      time_spent_sec INTEGER NOT NULL DEFAULT 0,
      xp_earned INTEGER NOT NULL DEFAULT 0,
      last_studied_at TEXT,
      next_revision_at TEXT,
      updated_at TEXT NOT NULL,
      UNIQUE(user_id, lesson_id)
    );
    CREATE TABLE IF NOT EXISTS lesson_map_roadmaps (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      grade INTEGER NOT NULL,
      board TEXT NOT NULL,
      exam_name TEXT NOT NULL,
      exam_date TEXT NOT NULL,
      roadmap_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS custom_lesson_maps (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      grade INTEGER NOT NULL,
      board TEXT NOT NULL,
      chapter TEXT NOT NULL,
      source_label TEXT NOT NULL,
      nodes_json TEXT NOT NULL,
      approved INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  tablesInitialized = true;
}

const CURRICULUM_NODES: CurriculumLessonNode[] = [
  // PHYSICS (Class 10 Electricity & Optics)
  {
    id: 'phy-10-charge',
    subject: 'Physics',
    grade: 10,
    unit: 'Unit 1: Electromagnetism',
    chapter: 'Electricity',
    title: 'Electric Charge & Current',
    topics: ['Charge quantization', 'Electric current I = Q/t'],
    subtopics: ['Coulomb', 'Ampere', 'Direction of conventional current'],
    prerequisites: [],
    importance: 'core',
    estimatedMinutes: 20,
    x: 80,
    y: 120,
    practiceQuestion: {
      prompt: 'If 12 C of charge flows through a conductor in 4 seconds, what is the electric current?',
      options: ['3 A', '48 A', '0.33 A'],
      correctIndex: 0,
      explanation: 'I = Q / t = 12 C / 4 s = 3 A.'
    },
    formulas: [
      {
        id: 'f-current',
        name: 'Electric Current',
        equation: 'I = Q / t',
        meaning: 'Rate of flow of electric charge through a cross-section.',
        symbols: [
          { symbol: 'I', meaning: 'Electric current', unit: 'Ampere (A)' },
          { symbol: 'Q', meaning: 'Net charge', unit: 'Coulomb (C)' },
          { symbol: 't', meaning: 'Time', unit: 'second (s)' }
        ],
        whenToUse: 'When given total charge flowing in a time interval.',
        solvedExample: 'Q = 12 C, t = 4 s → I = 12 / 4 = 3 A.'
      }
    ]
  },
  {
    id: 'phy-10-voltage',
    subject: 'Physics',
    grade: 10,
    unit: 'Unit 1: Electromagnetism',
    chapter: 'Electricity',
    title: 'Potential Difference (Voltage)',
    topics: ['Work done per unit charge', 'Voltmeter connection'],
    subtopics: ['V = W/Q', '1 Volt definition'],
    prerequisites: ['phy-10-charge'],
    importance: 'core',
    estimatedMinutes: 22,
    x: 330,
    y: 70,
    practiceQuestion: {
      prompt: 'How much work is done in moving 2 C of charge across two points with potential difference 12 V?',
      options: ['6 J', '24 J', '14 J'],
      correctIndex: 1,
      explanation: 'W = V × Q = 12 V × 2 C = 24 J.'
    }
  },
  {
    id: 'phy-10-resistance',
    subject: 'Physics',
    grade: 10,
    unit: 'Unit 1: Electromagnetism',
    chapter: 'Electricity',
    title: 'Resistance & Resistivity',
    topics: ['Factors affecting resistance', 'Series vs Parallel'],
    subtopics: ['Length, area, temperature', 'R = ρL/A'],
    prerequisites: ['phy-10-charge'],
    importance: 'high',
    estimatedMinutes: 25,
    x: 330,
    y: 200,
    practiceQuestion: {
      prompt: 'If the length of a uniform wire is doubled while its cross-sectional area stays constant, its resistance:',
      options: ['Halves', 'Doubles', 'Stays the same'],
      correctIndex: 1,
      explanation: 'Resistance R = ρL/A is directly proportional to length L.'
    }
  },
  {
    id: 'phy-10-ohms-law',
    subject: 'Physics',
    grade: 10,
    unit: 'Unit 1: Electromagnetism',
    chapter: 'Electricity',
    title: "Ohm's Law & Circuit Numericals",
    topics: ['V = I × R', 'V-I Graph', 'Ohmic conductors'],
    subtopics: ['Slope of V-I graph', 'Series & parallel combinations'],
    prerequisites: ['phy-10-voltage', 'phy-10-resistance'],
    importance: 'high',
    estimatedMinutes: 30,
    x: 590,
    y: 120,
    practiceQuestion: {
      prompt: 'A 10 Ω resistor is connected across a 20 V battery. What current flows through it?',
      options: ['2 A', '200 A', '0.5 A'],
      correctIndex: 0,
      explanation: 'By Ohm’s Law, I = V / R = 20 V / 10 Ω = 2 A.'
    }
  },
  {
    id: 'phy-10-exam-rev',
    subject: 'Physics',
    grade: 10,
    unit: 'Unit 1: Electromagnetism',
    chapter: 'Electricity',
    title: 'Chapter Practice & Exam Prep',
    topics: ['Board numericals', 'Circuit diagrams', 'Power P = VI'],
    subtopics: ['2-mark, 3-mark & 5-mark questions'],
    prerequisites: ['phy-10-ohms-law'],
    importance: 'advanced',
    estimatedMinutes: 35,
    x: 840,
    y: 120,
    practiceQuestion: {
      prompt: 'Which formula correctly expresses electrical power dissipated in a resistor?',
      options: ['P = I²R', 'P = I/R', 'P = V/I²'],
      correctIndex: 0,
      explanation: 'Electrical power P = V × I = I²R = V²/R.'
    }
  },

  // MATHEMATICS (Algebra -> Linear -> Quadratic)
  {
    id: 'math-10-arith',
    subject: 'Mathematics',
    grade: 10,
    unit: 'Unit 1: Algebra',
    chapter: 'Foundations',
    title: 'Algebraic Expressions & Identities',
    topics: ['Polynomials', 'Standard identities'],
    subtopics: ['(a+b)²', '(a-b)²', 'a²-b²'],
    prerequisites: [],
    importance: 'core',
    estimatedMinutes: 20,
    x: 80,
    y: 120,
    practiceQuestion: {
      prompt: 'Expand (x + 3)²:',
      options: ['x² + 6x + 9', 'x² + 9', 'x² + 3x + 9'],
      correctIndex: 0,
      explanation: '(a+b)² = a² + 2ab + b² = x² + 6x + 9.'
    },
    formulas: [
      {
        id: 'f-sq-sum',
        name: 'Square of a Binomial',
        equation: '(a + b)² = a² + 2ab + b²',
        meaning: 'Expands the square of a two-term sum without multiplying term by term.',
        symbols: [
          { symbol: 'a', meaning: 'First algebraic term' },
          { symbol: 'b', meaning: 'Second algebraic term' }
        ],
        whenToUse: 'Factoring perfect square trinomials and completing the square.',
        solvedExample: '(x + 3)² = x² + 2(x)(3) + 3² = x² + 6x + 9.'
      }
    ]
  },
  {
    id: 'math-10-linear',
    subject: 'Mathematics',
    grade: 10,
    unit: 'Unit 1: Algebra',
    chapter: 'Linear Equations',
    title: 'Pair of Linear Equations',
    topics: ['Substitution', 'Elimination', 'Graphical intersection'],
    subtopics: ['Consistent vs inconsistent systems'],
    prerequisites: ['math-10-arith'],
    importance: 'core',
    estimatedMinutes: 25,
    x: 340,
    y: 120,
    practiceQuestion: {
      prompt: 'If 2x + 3 = 11, what is the value of x?',
      options: ['4', '7', '5'],
      correctIndex: 0,
      explanation: '2x = 11 − 3 = 8, so x = 4.'
    }
  },
  {
    id: 'math-10-quad',
    subject: 'Mathematics',
    grade: 10,
    unit: 'Unit 1: Algebra',
    chapter: 'Quadratic Equations',
    title: 'Quadratic Equations & Discriminant',
    topics: ['Factorization', 'Quadratic Formula', 'Nature of roots'],
    subtopics: ['ax² + bx + c = 0', 'D = b² − 4ac'],
    prerequisites: ['math-10-linear'],
    importance: 'high',
    estimatedMinutes: 30,
    x: 600,
    y: 120,
    practiceQuestion: {
      prompt: 'What are the roots of x² − 5x + 6 = 0?',
      options: ['x = 2, 3', 'x = -2, -3', 'x = 1, 6'],
      correctIndex: 0,
      explanation: '(x − 2)(x − 3) = 0 gives roots x = 2 and x = 3.'
    },
    formulas: [
      {
        id: 'f-quad',
        name: 'Quadratic Formula',
        equation: 'x = (−b ± √(b² − 4ac)) / (2a)',
        meaning: 'Finds the roots of any quadratic equation ax² + bx + c = 0.',
        symbols: [
          { symbol: 'a', meaning: 'Coefficient of x² (a ≠ 0)' },
          { symbol: 'b', meaning: 'Coefficient of x' },
          { symbol: 'c', meaning: 'Constant term' },
          { symbol: 'D = b² − 4ac', meaning: 'Discriminant (determines real vs complex roots)' }
        ],
        whenToUse: 'Whenever factoring by inspection is difficult or to check root nature.',
        solvedExample: 'For x² − 5x + 6 = 0: D = 25 − 24 = 1; x = (5 ± 1)/2 → x = 3 or 2.'
      }
    ]
  },

  // CHEMISTRY
  {
    id: 'chem-10-atoms',
    subject: 'Chemistry',
    grade: 10,
    unit: 'Unit 1: Chemical Substances',
    chapter: 'Atomic Structure',
    title: 'Atoms, Valency & Ions',
    topics: ['Protons, neutrons, electrons', 'Octet rule'],
    subtopics: ['Cations vs anions', 'Chemical formulas'],
    prerequisites: [],
    importance: 'core',
    estimatedMinutes: 20,
    x: 80,
    y: 120,
    practiceQuestion: {
      prompt: 'Which subatomic particle defines the atomic number of an element?',
      options: ['Proton', 'Neutron', 'Electron'],
      correctIndex: 0,
      explanation: 'Atomic number Z equals the number of protons in the nucleus.'
    }
  },
  {
    id: 'chem-10-equations',
    subject: 'Chemistry',
    grade: 10,
    unit: 'Unit 1: Chemical Substances',
    chapter: 'Chemical Reactions',
    title: 'Balancing Chemical Equations',
    topics: ['Law of conservation of mass', 'Types of reactions'],
    subtopics: ['Combination', 'Decomposition', 'Displacement', 'Redox'],
    prerequisites: ['chem-10-atoms'],
    importance: 'high',
    estimatedMinutes: 25,
    x: 360,
    y: 120,
    practiceQuestion: {
      prompt: 'Which coefficient balances H₂ + O₂ → H₂O?',
      options: ['2H₂ + O₂ → 2H₂O', 'H₂ + 2O₂ → 2H₂O', '2H₂ + 2O₂ → H₂O'],
      correctIndex: 0,
      explanation: '2H₂ + O₂ → 2H₂O has 4 H atoms and 2 O atoms on both sides.'
    }
  },

  // BIOLOGY
  {
    id: 'bio-10-cell',
    subject: 'Biology',
    grade: 10,
    unit: 'Unit 1: Life Processes',
    chapter: 'Cell & Nutrition',
    title: 'Cell Organelles & Chloroplasts',
    topics: ['Eukaryotic cell structure', 'Chloroplast & Mitochondria'],
    subtopics: ['Chlorophyll', 'ATP synthesis'],
    prerequisites: [],
    importance: 'core',
    estimatedMinutes: 20,
    x: 80,
    y: 120,
    practiceQuestion: {
      prompt: 'Which organelle captures solar energy for photosynthesis?',
      options: ['Chloroplast', 'Golgi apparatus', 'Lysosome'],
      correctIndex: 0,
      explanation: 'Chloroplasts contain chlorophyll pigments that absorb sunlight.'
    }
  },
  {
    id: 'bio-10-photo',
    subject: 'Biology',
    grade: 10,
    unit: 'Unit 1: Life Processes',
    chapter: 'Nutrition in Plants',
    title: 'Photosynthesis Mechanism',
    topics: ['Light-dependent reaction', 'Calvin cycle', 'Stomata'],
    subtopics: ['6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂'],
    prerequisites: ['bio-10-cell'],
    importance: 'high',
    estimatedMinutes: 25,
    x: 360,
    y: 120,
    practiceQuestion: {
      prompt: 'Which gas is released as a byproduct during photosynthesis?',
      options: ['Oxygen', 'Carbon monoxide', 'Nitrogen'],
      correctIndex: 0,
      explanation: 'Photolysis of water releases oxygen gas (O₂).'
    }
  },

  // HISTORY
  {
    id: 'hist-10-fr1',
    subject: 'History',
    grade: 10,
    unit: 'Unit 1: Modern World',
    chapter: 'French Revolution',
    title: 'Causes & The Three Estates',
    topics: ['Social inequality', 'Financial crisis', 'Estates-General'],
    subtopics: ['1789 Storming of the Bastille'],
    prerequisites: [],
    importance: 'core',
    estimatedMinutes: 20,
    x: 80,
    y: 120,
    practiceQuestion: {
      prompt: 'Which Estate bore the entire burden of direct taxation in pre-1789 France?',
      options: ['Third Estate', 'First Estate', 'Second Estate'],
      correctIndex: 0,
      explanation: 'The Third Estate (peasants, workers, bourgeoisie) paid taxes while Clergy and Nobility were largely exempt.'
    }
  },
  {
    id: 'hist-10-fr2',
    subject: 'History',
    grade: 10,
    unit: 'Unit 1: Modern World',
    chapter: 'French Revolution',
    title: 'Declaration of Rights & Legacy',
    topics: ['Liberty, Equality, Fraternity', 'Constitutional Monarchy'],
    subtopics: ['Impact on global democracies'],
    prerequisites: ['hist-10-fr1'],
    importance: 'high',
    estimatedMinutes: 22,
    x: 360,
    y: 120,
    practiceQuestion: {
      prompt: 'What core ideals were championed by the French Revolution?',
      options: ['Liberty, Equality, Fraternity', 'Feudalism & Divine Right', 'Mercantilism Only'],
      correctIndex: 0,
      explanation: 'The revolution popularized Liberty, Equality, and Fraternity across Europe and the world.'
    }
  },

  // GEOGRAPHY
  {
    id: 'geo-10-water',
    subject: 'Geography',
    grade: 10,
    unit: 'Unit 1: Resources',
    chapter: 'Water Resources',
    title: 'Hydrological Cycle & Conservation',
    topics: ['Evaporation, Condensation, Precipitation', 'Rainwater harvesting'],
    subtopics: ['Multi-purpose river projects'],
    prerequisites: [],
    importance: 'core',
    estimatedMinutes: 20,
    x: 80,
    y: 120,
    practiceQuestion: {
      prompt: 'Which traditional practice replenishes groundwater directly from rooftop runoff?',
      options: ['Rainwater harvesting', 'Deforestation', 'Over-irrigation'],
      correctIndex: 0,
      explanation: 'Rainwater harvesting captures and channels rainwater into storage tanks or recharge pits.'
    }
  },

  // ENGLISH
  {
    id: 'eng-10-grammar',
    subject: 'English',
    grade: 10,
    unit: 'Unit 1: Language Mastery',
    chapter: 'Grammar & Vocabulary',
    title: 'Tenses, Clauses & Active-Passive Voice',
    topics: ['Sentence structure', 'Voice transformation', 'Context clues'],
    subtopics: ['Subject-verb agreement'],
    prerequisites: [],
    importance: 'core',
    estimatedMinutes: 20,
    x: 80,
    y: 120,
    practiceQuestion: {
      prompt: 'Choose the passive voice of "The student solved the puzzle":',
      options: ['The puzzle was solved by the student.', 'The puzzle is solving the student.', 'The student was solving the puzzle.'],
      correctIndex: 0,
      explanation: 'Past simple active ("solved") transforms to "was solved by..." in passive voice.'
    }
  }
];

export const LESSON_MAP_SUBJECTS = [
  'Physics',
  'Mathematics',
  'Chemistry',
  'Biology',
  'History',
  'Geography',
  'English'
] as const;

export class LessonMapEngine {
  public getSubjectGraph(userId: string, subject: string, grade = 10) {
    ensureLessonMapTables();
    const nodes = CURRICULUM_NODES.filter(
      (n) => n.subject.toLowerCase() === subject.toLowerCase()
    );

    const rows = db
      .prepare('SELECT * FROM lesson_map_progress WHERE user_id = ?')
      .all(userId) as Array<any>;
    const progressMap = new Map<string, any>();
    for (const r of rows) progressMap.set(r.lesson_id, r);

    const isDone = (lessonId: string): boolean => {
      const p = progressMap.get(lessonId);
      return p?.status === 'completed' || p?.status === 'mastered';
    };

    const computed: ComputedLessonNode[] = nodes.map((node) => {
      const rec = progressMap.get(node.id);
      const missingPrereqs = node.prerequisites.filter((pid) => !isDone(pid));

      let status: LessonNodeStatus;
      if (rec?.status === 'mastered' || rec?.status === 'completed' || rec?.status === 'needs_revision' || rec?.status === 'in_progress') {
        status = rec.status;
      } else if (missingPrereqs.length > 0) {
        status = 'locked';
      } else {
        status = 'available';
      }

      return {
        ...node,
        grade,
        status,
        quizScore: rec?.quiz_score ?? null,
        attempts: rec?.attempts ?? 0,
        xpEarned: rec?.xp_earned ?? 0,
        nextRevisionAt: rec?.next_revision_at ?? null,
        missingPrerequisites: missingPrereqs
      };
    });

    const edges = computed.flatMap((n) =>
      n.prerequisites.map((fromId) => ({ from: fromId, to: n.id }))
    );

    const totalXp = computed.reduce((s, n) => s + n.xpEarned, 0);
    const completedCount = computed.filter((n) => n.status === 'completed' || n.status === 'mastered').length;
    const masteredCount = computed.filter((n) => n.status === 'mastered').length;
    const needsRevision = computed.filter((n) => n.status === 'needs_revision');
    const recommendedNext =
      needsRevision[0] ||
      computed.find((n) => n.status === 'in_progress') ||
      computed.find((n) => n.status === 'available') ||
      computed[0] ||
      null;

    return {
      subject,
      grade,
      nodes: computed,
      edges,
      stats: {
        totalNodes: computed.length,
        completedCount,
        masteredCount,
        needsRevisionCount: needsRevision.length,
        totalXp,
        readinessPercent: computed.length > 0 ? Math.round((completedCount / computed.length) * 100) : 0
      },
      recommendedNextId: recommendedNext?.id ?? null
    };
  }

  public recordAssessment(
    userId: string,
    lessonId: string,
    scorePercent: number,
    timeSpentSec = 120
  ) {
    ensureLessonMapTables();
    const node = CURRICULUM_NODES.find((n) => n.id === lessonId);
    if (!node) {
      throw new Error(`Unknown lessonId: ${lessonId}`);
    }

    const now = new Date();
    const nowIso = now.toISOString();
    // Mastery requires demonstrated >= 80% assessment score; >= 60% marks completed; < 60% marks needs_revision
    const newStatus: LessonNodeStatus =
      scorePercent >= 80 ? 'mastered' : scorePercent >= 60 ? 'completed' : 'needs_revision';
    const xpEarned = newStatus === 'mastered' ? 150 : newStatus === 'completed' ? 90 : 25;
    const nextRevDays = newStatus === 'mastered' ? 7 : newStatus === 'completed' ? 3 : 1;
    const nextRevisionAt = new Date(now.getTime() + nextRevDays * 86400_000).toISOString();

    const existing = db
      .prepare('SELECT id, attempts FROM lesson_map_progress WHERE user_id = ? AND lesson_id = ?')
      .get(userId, lessonId) as any;

    if (existing) {
      db.prepare(`
        UPDATE lesson_map_progress
        SET status = ?, quiz_score = ?, attempts = ?, time_spent_sec = time_spent_sec + ?,
            xp_earned = MAX(xp_earned, ?), last_studied_at = ?, next_revision_at = ?, updated_at = ?
        WHERE id = ?
      `).run(
        newStatus,
        scorePercent,
        (existing.attempts || 0) + 1,
        timeSpentSec,
        xpEarned,
        nowIso,
        nextRevisionAt,
        nowIso,
        existing.id
      );
    } else {
      db.prepare(`
        INSERT INTO lesson_map_progress
          (id, user_id, lesson_id, subject, status, quiz_score, attempts, time_spent_sec, xp_earned, last_studied_at, next_revision_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?)
      `).run(
        `lmp-${userId}-${lessonId}`,
        userId,
        lessonId,
        node.subject,
        newStatus,
        scorePercent,
        timeSpentSec,
        xpEarned,
        nowIso,
        nextRevisionAt,
        nowIso
      );
    }

    return {
      lessonId,
      status: newStatus,
      scorePercent,
      xpEarned,
      nextRevisionAt
    };
  }

  public async getLessonDetail(userId: string, lessonId: string, board = 'CBSE', grade = 10) {
    ensureLessonMapTables();
    const node = CURRICULUM_NODES.find((n) => n.id === lessonId);
    if (!node) throw new Error(`Lesson ${lessonId} not found`);

    // Mark in_progress only if not already completed/mastered/needs_revision
    const existing = db
      .prepare('SELECT status FROM lesson_map_progress WHERE user_id = ? AND lesson_id = ?')
      .get(userId, lessonId) as any;
    if (!existing) {
      const nowIso = new Date().toISOString();
      db.prepare(`
        INSERT INTO lesson_map_progress (id, user_id, lesson_id, subject, status, attempts, time_spent_sec, xp_earned, last_studied_at, updated_at)
        VALUES (?, ?, ?, ?, 'in_progress', 0, 0, 0, ?, ?)
      `).run(`lmp-${userId}-${lessonId}`, userId, lessonId, node.subject, nowIso, nowIso);
    }

    const aiTeach = await multiModelAiTeacherEngine.teach({
      question: `Teach "${node.title}" (${node.topics.join(', ')}) for Grade ${grade} ${node.subject}.`,
      topic: node.title,
      subject: node.subject,
      grade,
      board,
      mode: 'detailed'
    });

    return {
      lesson: node,
      aiTeaching: aiTeach
    };
  }

  public generateExamRoadmap(
    userId: string,
    opts: { subject: string; grade: number; board: string; examName: string; examDate: string }
  ) {
    ensureLessonMapTables();
    const graph = this.getSubjectGraph(userId, opts.subject, opts.grade);
    const targetMs = new Date(opts.examDate).getTime();
    const daysRemaining = Math.max(6, Math.ceil((targetMs - Date.now()) / 86400_000) || 18);

    const weakTitles = graph.nodes
      .filter((n) => n.status === 'needs_revision' || n.status === 'locked' || n.status === 'available')
      .map((n) => n.title);

    const phases: ExamRoadmapPhase[] = [
      {
        phase: 1,
        title: 'Phase 1 — Syllabus Understanding',
        focus: `Map all ${graph.nodes.length} lessons & prerequisites in ${opts.subject}.`,
        allocatedDays: Math.max(1, Math.round(daysRemaining * 0.1)),
        tasks: [
          `Review ${opts.board} Grade ${opts.grade} ${opts.subject} chapter weightage`,
          `Identify foundational prerequisites before advanced chapters`
        ]
      },
      {
        phase: 2,
        title: 'Phase 2 — Concept Learning',
        focus: 'Build deep understanding of core definitions, laws, and diagrams.',
        allocatedDays: Math.max(1, Math.round(daysRemaining * 0.25)),
        tasks: weakTitles.slice(0, 3).map((t) => `Complete Lesson & Practice: ${t}`)
      },
      {
        phase: 3,
        title: 'Phase 3 — Guided Practice',
        focus: 'Solve numericals, MCQs, short & long-answer questions.',
        allocatedDays: Math.max(1, Math.round(daysRemaining * 0.2)),
        tasks: [
          'Work through step-by-step derivations and numerical checks',
          'Attempt diagnostic checks on every completed lesson'
        ]
      },
      {
        phase: 4,
        title: 'Phase 4 — Chapter Revision',
        focus: 'Consolidate formula sheets, mnemonics, and common exam mistakes.',
        allocatedDays: Math.max(1, Math.round(daysRemaining * 0.15)),
        tasks: ['Review Formula Connection Map & Memory Tricks', 'Summarize each chapter in 5 key points']
      },
      {
        phase: 5,
        title: 'Phase 5 — Timed Exam Practice',
        focus: 'Simulate 2-mark, 3-mark, and 5-mark exam writing under time limits.',
        allocatedDays: Math.max(1, Math.round(daysRemaining * 0.15)),
        tasks: ['Complete timed practice set', 'Analyze errors and update weak topics']
      },
      {
        phase: 6,
        title: 'Phase 6 — Final Rapid Revision',
        focus: 'High-yield flashcards, formulas, and weak-topic polish.',
        allocatedDays: Math.max(1, Math.round(daysRemaining * 0.15)),
        tasks: ['Final weak-topic sweep', 'Light formula & diagram review before exam day']
      }
    ];

    const roadmapId = `rm-${userId}-${opts.subject.toLowerCase()}`;
    db.prepare(`
      INSERT OR REPLACE INTO lesson_map_roadmaps (id, user_id, subject, grade, board, exam_name, exam_date, roadmap_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      roadmapId,
      userId,
      opts.subject,
      opts.grade,
      opts.board,
      opts.examName,
      opts.examDate,
      JSON.stringify(phases),
      new Date().toISOString()
    );

    return {
      examName: opts.examName,
      examDate: opts.examDate,
      daysRemaining,
      readinessPercent: graph.stats.readinessPercent,
      phases
    };
  }

  public getParentTeacherSummary(userId: string) {
    ensureLessonMapTables();
    const subjectSummaries = LESSON_MAP_SUBJECTS.map((sub) => {
      const g = this.getSubjectGraph(userId, sub, 10);
      return {
        subject: sub,
        totalLessons: g.stats.totalNodes,
        completed: g.stats.completedCount,
        mastered: g.stats.masteredCount,
        needsRevision: g.stats.needsRevisionCount,
        readinessPercent: g.stats.readinessPercent,
        xp: g.stats.totalXp,
        revisionTopics: g.nodes.filter((n) => n.status === 'needs_revision').map((n) => n.title)
      };
    });
    const totalXp = subjectSummaries.reduce((s, item) => s + item.xp, 0);
    return { userId, totalXp, subjects: subjectSummaries };
  }

  /**
   * Analyzes uploaded syllabus/textbook text or chapter request to generate an editable,
   * user-scoped Lesson Map preserving source references without inventing official syllabus claims.
   */
  public async generateCustomLessonMap(
    userId: string,
    opts: {
      subject: string;
      grade: number;
      board: string;
      chapter: string;
      syllabusText?: string;
      sourceLabel?: string;
    }
  ) {
    ensureLessonMapTables();
    const rawLines = (opts.syllabusText || '')
      .split(/\r?\n|;|•/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 4 && s.length <= 120);

    const uniqueTopics = Array.from(new Set(rawLines)).slice(0, 6);
    const baseTopics =
      uniqueTopics.length >= 2
        ? uniqueTopics
        : [
            `${opts.chapter}: Core Definitions & Concepts`,
            `${opts.chapter}: Working Principles & Formulas`,
            `${opts.chapter}: Worked Examples & Applications`,
            `${opts.chapter}: Practice & Exam Revision`
          ];

    const mapId = `cmap-${Date.now().toString(36)}`;
    const nodes: ComputedLessonNode[] = baseTopics.map((title, idx) => ({
      id: `${mapId}-n${idx + 1}`,
      subject: opts.subject,
      grade: opts.grade,
      unit: `${opts.board} Grade ${opts.grade}`,
      chapter: opts.chapter,
      title,
      topics: [title],
      subtopics: [`Key concepts from ${opts.sourceLabel || opts.chapter}`],
      prerequisites: idx > 0 ? [`${mapId}-n${idx}`] : [],
      importance: idx === 0 ? 'core' : idx === baseTopics.length - 1 ? 'advanced' : 'high',
      estimatedMinutes: 20 + idx * 5,
      x: 80 + idx * 250,
      y: idx % 2 === 0 ? 110 : 190,
      status: idx === 0 ? 'available' : 'locked',
      quizScore: null,
      attempts: 0,
      xpEarned: 0,
      nextRevisionAt: null,
      missingPrerequisites: idx > 0 ? [`${mapId}-n${idx}`] : [],
      practiceQuestion: {
        prompt: `Check your understanding of "${title}":`,
        options: [
          `Core principle & definition of ${title}`,
          'Unrelated concept',
          'Skip without verification'
        ],
        correctIndex: 0,
        explanation: `Verified foundational understanding of ${title} (${opts.sourceLabel || 'AI-structured map'}).`
      }
    }));

    const nowIso = new Date().toISOString();
    const sourceLabel = opts.sourceLabel || 'AI-Structured Syllabus Map (Verify against official textbook)';
    db.prepare(`
      INSERT INTO custom_lesson_maps (id, user_id, subject, grade, board, chapter, source_label, nodes_json, approved, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    `).run(mapId, userId, opts.subject, opts.grade, opts.board, opts.chapter, sourceLabel, JSON.stringify(nodes), nowIso, nowIso);

    return {
      id: mapId,
      subject: opts.subject,
      grade: opts.grade,
      board: opts.board,
      chapter: opts.chapter,
      sourceLabel,
      approved: false,
      nodes
    };
  }

  public listCustomLessonMaps(userId: string) {
    ensureLessonMapTables();
    const rows = db
      .prepare('SELECT * FROM custom_lesson_maps WHERE user_id = ? ORDER BY updated_at DESC')
      .all(userId) as Array<any>;
    return rows.map((r) => ({
      id: r.id,
      subject: r.subject,
      grade: r.grade,
      board: r.board,
      chapter: r.chapter,
      sourceLabel: r.source_label,
      approved: Boolean(r.approved),
      nodes: JSON.parse(r.nodes_json || '[]'),
      updatedAt: r.updated_at
    }));
  }

  public updateCustomLessonMap(
    userId: string,
    mapId: string,
    nodes: ComputedLessonNode[],
    approved = true
  ) {
    ensureLessonMapTables();
    const res = db
      .prepare('UPDATE custom_lesson_maps SET nodes_json = ?, approved = ?, updated_at = ? WHERE id = ? AND user_id = ?')
      .run(JSON.stringify(nodes), approved ? 1 : 0, new Date().toISOString(), mapId, userId);
    return { updated: (res.changes || 0) > 0, mapId, approved };
  }
}

export const lessonMapEngine = new LessonMapEngine();
