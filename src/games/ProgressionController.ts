import { GameDifficulty, GameMode } from './types';

export interface LevelInfo {
  level: number;
  difficulty: GameDifficulty;
  difficultyScore: 1 | 2 | 3 | 4;
  title: string;
  speedMultiplier: number;
  targetAccuracy: number; // 0.8 = 80%
}

export class ProgressionController {
  private level: number = 1;
  private mode: GameMode = 'practice';
  private recentResults: boolean[] = []; // sliding window for accuracy calculation
  private consecutiveCorrect: number = 0;
  private consecutiveIncorrect: number = 0;
  private questionsInCurrentLevel: number = 0;
  private promotionThreshold: number = 0.8; // 80% accuracy rule

  constructor(startingDifficulty: GameDifficulty = 'medium', mode: GameMode = 'practice') {
    this.mode = mode;
    this.level = startingDifficulty === 'hard' ? 5 : startingDifficulty === 'medium' ? 3 : 1;
  }

  public getLevel(): number {
    return this.level;
  }

  public getLevelInfo(): LevelInfo {
    const lvl = this.level;
    let difficulty: GameDifficulty = 'easy';
    let difficultyScore: 1 | 2 | 3 | 4 = 1;
    let title = 'Introductory Level';
    let speedMultiplier = 1.0;

    if (lvl <= 2) {
      difficulty = 'easy';
      difficultyScore = 1;
      title = `Level ${lvl} — Foundational Concepts`;
      speedMultiplier = 1.0;
    } else if (lvl <= 4) {
      difficulty = 'medium';
      difficultyScore = 2;
      title = `Level ${lvl} — Intermediate Mechanism`;
      speedMultiplier = 1.25;
    } else if (lvl <= 6) {
      difficulty = 'hard';
      difficultyScore = 3;
      title = `Level ${lvl} — Advanced Problem Solving`;
      speedMultiplier = 1.5;
    } else {
      difficulty = 'hard';
      difficultyScore = 4;
      title = `Level ${lvl} — Master Challenge`;
      speedMultiplier = 1.75;
    }

    return {
      level: lvl,
      difficulty,
      difficultyScore,
      title,
      speedMultiplier,
      targetAccuracy: this.promotionThreshold
    };
  }

  public recordAnswer(isCorrect: boolean): {
    promoted: boolean;
    demoted: boolean;
    newLevel: number;
    accuracy: number;
    consecutiveCorrect: number;
    consecutiveIncorrect: number;
    shouldProvideHint: boolean;
  } {
    this.questionsInCurrentLevel += 1;
    this.recentResults.push(isCorrect);
    if (this.recentResults.length > 5) {
      this.recentResults.shift();
    }

    if (isCorrect) {
      this.consecutiveCorrect += 1;
      this.consecutiveIncorrect = 0;
    } else {
      this.consecutiveIncorrect += 1;
      this.consecutiveCorrect = 0;
    }

    const correctCount = this.recentResults.filter(Boolean).length;
    const windowAccuracy = correctCount / this.recentResults.length;

    let promoted = false;
    let demoted = false;

    // Promotion rule: At least 3 questions evaluated at this level and window accuracy >= 80%
    if (this.questionsInCurrentLevel >= 3 && windowAccuracy >= this.promotionThreshold && this.level < 10) {
      this.level += 1;
      this.questionsInCurrentLevel = 0;
      this.recentResults = [];
      promoted = true;
    }

    // Demotion / Stagnation mitigation: If student has 3 consecutive errors in challenge mode
    if (this.consecutiveIncorrect >= 3 && this.level > 1 && this.mode === 'challenge') {
      this.level -= 1;
      this.questionsInCurrentLevel = 0;
      this.recentResults = [];
      this.consecutiveIncorrect = 0;
      demoted = true;
    }

    // Suggest a hint if student has missed 2 in a row
    const shouldProvideHint = this.consecutiveIncorrect >= 2;

    return {
      promoted,
      demoted,
      newLevel: this.level,
      accuracy: Math.round(windowAccuracy * 100),
      consecutiveCorrect: this.consecutiveCorrect,
      consecutiveIncorrect: this.consecutiveIncorrect,
      shouldProvideHint
    };
  }

  public reset(startingDifficulty: GameDifficulty = 'medium') {
    this.level = startingDifficulty === 'hard' ? 5 : startingDifficulty === 'medium' ? 3 : 1;
    this.recentResults = [];
    this.consecutiveCorrect = 0;
    this.consecutiveIncorrect = 0;
    this.questionsInCurrentLevel = 0;
  }
}

export type QuestionProgressionState =
  | 'READY'
  | 'QUESTION_ACTIVE'
  | 'ANSWER_SELECTED'
  | 'ANSWER_VALIDATED'
  | 'FEEDBACK'
  | 'NEXT_QUESTION'
  | 'LEVEL_COMPLETE';

export type AdaptiveGraphicsQuality = 'low' | 'medium' | 'high' | 'ultra';

export interface DeviceCapabilityHints {
  hardwareConcurrency?: number;
  deviceMemory?: number;
  devicePixelRatio?: number;
  viewportWidth?: number;
  isTouchDevice?: boolean;
  prefersReducedMotion?: boolean;
}

/**
 * Automatically selects an appropriate 3D graphics quality tier for the current device
 * while still allowing the user to override it in Settings.
 */
export function detectRecommendedGraphicsQuality(
  hints?: DeviceCapabilityHints
): AdaptiveGraphicsQuality {
  const nav = typeof navigator !== 'undefined' ? (navigator as any) : undefined;
  const win = typeof window !== 'undefined' ? window : undefined;

  const prefersReducedMotion =
    hints?.prefersReducedMotion ??
    Boolean(win?.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
  if (prefersReducedMotion) return 'low';

  const cores = hints?.hardwareConcurrency ?? nav?.hardwareConcurrency ?? 4;
  const memory = hints?.deviceMemory ?? nav?.deviceMemory ?? 4;
  const dpr = hints?.devicePixelRatio ?? win?.devicePixelRatio ?? 1;
  const width = hints?.viewportWidth ?? win?.innerWidth ?? 1280;
  const isTouch =
    hints?.isTouchDevice ??
    Boolean(
      win &&
        (('ontouchstart' in win) || (nav?.maxTouchPoints ?? 0) > 0) &&
        width < 1024
    );

  if (memory <= 2 || cores <= 2) return 'low';
  if (isTouch) {
    return memory >= 6 && cores >= 6 ? 'medium' : 'low';
  }
  if (cores >= 8 && memory >= 8 && dpr >= 1.5 && width >= 1280) {
    return 'ultra';
  }
  if (cores >= 6 && memory >= 4) {
    return 'high';
  }
  return 'medium';
}

export interface ProgressionSnapshot {
  state: QuestionProgressionState;
  level: number;
  questionIndex: number;
  questionsAnsweredInLevel: number;
  questionsPerLevel: number;
  correctInLevel: number;
  totalCorrect: number;
  totalAnswered: number;
  streak: number;
  bestStreak: number;
  score: number;
  activeQuestionId: string | null;
  lastOutcome: {
    questionId: string;
    selectedAnswerId: string;
    isCorrect: boolean;
    pointsAwarded: number;
  } | null;
}

/**
 * Centralized 7-state question progression machine:
 * READY -> QUESTION_ACTIVE -> ANSWER_SELECTED -> ANSWER_VALIDATED -> FEEDBACK -> NEXT_QUESTION -> LEVEL_COMPLETE
 * Prevents duplicate scoring, enforces subject/topic consistency when configured, and manages multi-level advancement.
 */
export class QuestionProgressionMachine {
  private state: QuestionProgressionState = 'READY';
  private level: number = 1;
  private questionIndex: number = 0;
  private questionsPerLevel: number;
  private questionsAnsweredInLevel: number = 0;
  private correctInLevel: number = 0;
  private totalCorrect: number = 0;
  private totalAnswered: number = 0;
  private streak: number = 0;
  private bestStreak: number = 0;
  private score: number = 0;
  private activeQuestionId: string | null = null;
  private evaluatedQuestionKeys: Set<string> = new Set();
  private lastOutcome: ProgressionSnapshot['lastOutcome'] = null;
  private expectedSubject?: string;
  private expectedTopic?: string;

  constructor(options: {
    startingLevel?: number;
    questionsPerLevel?: number;
    expectedSubject?: string;
    expectedTopic?: string;
  } = {}) {
    this.level = Math.max(1, options.startingLevel ?? 1);
    this.questionsPerLevel = Math.max(1, options.questionsPerLevel ?? 5);
    this.expectedSubject = options.expectedSubject?.trim().toLowerCase();
    this.expectedTopic = options.expectedTopic?.trim().toLowerCase();
  }

  public getState(): QuestionProgressionState {
    return this.state;
  }

  public getSnapshot(): ProgressionSnapshot {
    return {
      state: this.state,
      level: this.level,
      questionIndex: this.questionIndex,
      questionsAnsweredInLevel: this.questionsAnsweredInLevel,
      questionsPerLevel: this.questionsPerLevel,
      correctInLevel: this.correctInLevel,
      totalCorrect: this.totalCorrect,
      totalAnswered: this.totalAnswered,
      streak: this.streak,
      bestStreak: this.bestStreak,
      score: this.score,
      activeQuestionId: this.activeQuestionId,
      lastOutcome: this.lastOutcome ? { ...this.lastOutcome } : null
    };
  }

  public isQuestionConsistent(subject?: string, topic?: string): boolean {
    if (this.expectedSubject && subject) {
      if (subject.trim().toLowerCase() !== this.expectedSubject) return false;
    }
    if (this.expectedTopic && topic) {
      if (!topic.trim().toLowerCase().includes(this.expectedTopic) && !this.expectedTopic.includes(topic.trim().toLowerCase())) {
        return false;
      }
    }
    return true;
  }

  public activateQuestion(questionId: string): boolean {
    if (!questionId) return false;
    if (this.state !== 'READY' && this.state !== 'NEXT_QUESTION' && this.state !== 'FEEDBACK') {
      return false;
    }
    this.activeQuestionId = questionId;
    this.state = 'QUESTION_ACTIVE';
    return true;
  }

  public submitAnswer(params: {
    questionId: string;
    selectedAnswerId: string;
    correctAnswerId: string;
    basePoints?: number;
  }): {
    accepted: boolean;
    isCorrect: boolean;
    pointsAwarded: number;
    levelCompleted: boolean;
  } {
    const evalKey = `${this.level}:${this.questionIndex}:${params.questionId}`;
    if (
      this.state !== 'QUESTION_ACTIVE' ||
      this.activeQuestionId !== params.questionId ||
      this.evaluatedQuestionKeys.has(evalKey)
    ) {
      return {
        accepted: false,
        isCorrect: false,
        pointsAwarded: 0,
        levelCompleted: this.state === 'LEVEL_COMPLETE'
      };
    }

    this.state = 'ANSWER_SELECTED';
    this.evaluatedQuestionKeys.add(evalKey);

    const isCorrect =
      String(params.selectedAnswerId).trim().toUpperCase() ===
      String(params.correctAnswerId).trim().toUpperCase();

    this.state = 'ANSWER_VALIDATED';
    this.totalAnswered += 1;
    this.questionsAnsweredInLevel += 1;

    let pointsAwarded = 0;
    if (isCorrect) {
      this.totalCorrect += 1;
      this.correctInLevel += 1;
      this.streak += 1;
      this.bestStreak = Math.max(this.bestStreak, this.streak);
      pointsAwarded = (params.basePoints ?? 100) + (this.streak - 1) * 20;
      this.score += pointsAwarded;
    } else {
      this.streak = 0;
    }

    this.lastOutcome = {
      questionId: params.questionId,
      selectedAnswerId: params.selectedAnswerId,
      isCorrect,
      pointsAwarded
    };

    this.state = 'FEEDBACK';
    const levelCompleted = this.questionsAnsweredInLevel >= this.questionsPerLevel;
    return {
      accepted: true,
      isCorrect,
      pointsAwarded,
      levelCompleted
    };
  }

  public advance(): QuestionProgressionState {
    if (this.state === 'FEEDBACK') {
      if (this.questionsAnsweredInLevel >= this.questionsPerLevel) {
        this.state = 'LEVEL_COMPLETE';
        return this.state;
      }
      this.questionIndex += 1;
      this.activeQuestionId = null;
      this.state = 'NEXT_QUESTION';
      return this.state;
    }
    return this.state;
  }

  public startNextLevel(): number {
    this.level += 1;
    this.questionsAnsweredInLevel = 0;
    this.correctInLevel = 0;
    this.questionIndex += 1;
    this.activeQuestionId = null;
    this.lastOutcome = null;
    this.state = 'READY';
    return this.level;
  }

  public reset(startingLevel = 1): void {
    this.level = Math.max(1, startingLevel);
    this.questionIndex = 0;
    this.questionsAnsweredInLevel = 0;
    this.correctInLevel = 0;
    this.totalCorrect = 0;
    this.totalAnswered = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.score = 0;
    this.activeQuestionId = null;
    this.evaluatedQuestionKeys.clear();
    this.lastOutcome = null;
    this.state = 'READY';
  }
}
