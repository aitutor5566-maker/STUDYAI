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
