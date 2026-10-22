export type GameLanguage = 'English' | 'Telugu' | 'Hindi';
export type GameDifficulty = 'easy' | 'medium' | 'hard';
export type GameMode = 'practice' | 'challenge';
export type GameType = 'answer_shooter' | 'answer_runner' | 'space_answer_shooter';
export type OptionId = 'A' | 'B' | 'C' | 'D';

export interface GameOption {
  id: OptionId;
  text: string;
}

export interface EducationalQuestion {
  id: string;
  grade: number; // 1 to 10
  subject: string;
  chapter: string;
  topic: string;
  language: GameLanguage;
  difficulty: 1 | 2 | 3 | 4; // 1: Easy, 2: Medium, 3: Hard, 4: Advanced
  question: string;
  options: GameOption[]; // 4 for shooter games, 3 for runner
  correct_option_id: OptionId;
  explanation: string;
  hint?: string;
}

export interface SharedGameSettings {
  grade: number;
  subject: string;
  chapter: string;
  topic: string;
  language: GameLanguage;
  startingDifficulty: GameDifficulty;
  gameMode: GameMode;
  sessionLength: number; // 10, 20, 30 or 0 for endless
}

export interface GameFeedback {
  isCorrect: boolean;
  chosenOptionId: OptionId;
  correctOptionId: OptionId;
  chosenText: string;
  correctText: string;
  explanation: string;
  hint?: string;
  pointsEarned: number;
}

export interface GameMistakeRecord {
  questionId: string;
  question: string;
  chosenAnswer: string;
  correctAnswer: string;
  explanation: string;
  timestamp: string;
}

export interface GameSessionState {
  // Settings
  settings: SharedGameSettings;

  // Progression
  currentGame: GameType;
  currentLevel: number; // 1 to 10
  currentQuestion: EducationalQuestion | null;
  questionQueue: EducationalQuestion[];
  questionHistory: EducationalQuestion[];
  usedQuestionIds: Set<string>;
  currentAnswerMapping: GameOption[]; // shuffled options for display

  // Performance
  score: number;
  healthOrLives: number;
  maxHealthOrLives: number;
  questionsAttempted: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  combo: number;
  mistakes: GameMistakeRecord[];

  // Flow control
  sessionActive: boolean;
  questionActive: boolean;
  levelTransitionActive: boolean;
  gameOver: boolean;
  gameCompleted: boolean;
  isPaused: boolean;
  pendingTopicChange: string | null;
}
