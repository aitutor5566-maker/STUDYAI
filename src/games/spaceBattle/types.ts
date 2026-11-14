import { EducationalQuestion, GameFeedback, OptionId } from '../types';
import { LevelInfo } from '../ProgressionController';

export interface SpaceBattleConfig {
  canvas: HTMLCanvasElement;
  onAnswerChosen: (optionId: OptionId) => void;
  onDamageTaken?: (remainingLives: number) => void;
  onScoreGained?: (points: number, combo: number) => void;
  onQuestionCompleted?: (isCorrect: boolean) => void;
}

export interface EnemyShipData {
  id: string;
  optionId: OptionId;
  text: string;
  isCorrect: boolean;
  row: number; // 0: top row, 1: bottom row
  col: number; // 0 to 3
  color: number;
  initialX: number;
  initialY: number;
  currentX: number;
  currentY: number;
  health: number;
  maxHealth: number;
  isDestroyed: boolean;
  meshGroup?: any;
}

export interface LaserBolt {
  id: number;
  x: number;
  y: number;
  z: number;
  speed: number;
  active: boolean;
  mesh?: any;
}

export interface EnemyProjectile {
  id: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  active: boolean;
  mesh?: any;
}

export interface SpaceBattleProps {
  question: EducationalQuestion | null;
  onAnswerChosen: (optionId: OptionId) => void;
  levelInfo: LevelInfo;
  feedback: GameFeedback | null;
  lives: number;
  score: number;
  combo: number;
  isPaused: boolean;
  questionIndex?: number;
  totalQuestions?: number;
  subject?: string;
  chapter?: string;
  onTogglePause?: () => void;
  onExit?: () => void;
}
