export type SubjectCategory =
  | 'All Subjects'
  | 'Mathematics'
  | 'Physics'
  | 'Chemistry'
  | 'Biology'
  | 'English'
  | 'History'
  | 'Geography'
  | 'General Knowledge';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type TimePhase = 'day' | 'sunset' | 'night' | 'sunrise';

export type GameScreenState = 'menu' | 'playing' | 'paused' | 'results';

export type HatStyle = 'none' | 'wizard' | 'helmet' | 'crown';
export type CompanionType = 'owl' | 'fox' | 'golem' | 'none';

export interface PlayerCustomization {
  name: string;
  shirtColor: string;
  hairColor: string;
  skinTone: string;
  capeColor: string;
  hatStyle: HatStyle;
  companion: CompanionType;
}

export const DEFAULT_PLAYER_CUSTOMIZATION: PlayerCustomization = {
  name: 'Scholar',
  shirtColor: '#FF6A00',
  hairColor: '#2B1E16',
  skinTone: '#F1C27D',
  capeColor: '#1E3A8A',
  hatStyle: 'wizard',
  companion: 'owl'
};

export type OptionId = 'A' | 'B' | 'C' | 'D';

export interface StudyRushOption {
  id: OptionId;
  text: string;
}

export interface StudyRushQuestion {
  id: string;
  subject: Exclude<SubjectCategory, 'All Subjects'>;
  grade: number;
  difficulty: DifficultyLevel;
  topic: string;
  question: string;
  options: StudyRushOption[];
  correctOptionId: OptionId;
  hint: string;
  explanation: string;
}

export interface ResourceInventory {
  wood: number;
  stone: number;
  crystal: number;
  knowledgeOrbs: number;
}

export interface VillageUpgradeState {
  wallLevel: number;
  towerLevel: number;
  lanternLevel: number;
  libraryLevel: number;
}

export type EnemyType = 'shadow_crawler' | 'void_wisp' | 'obsidian_golem';

export type WorldZone =
  | 'village'
  | 'dark_forest'
  | 'crystal_cave'
  | 'ancient_castle'
  | 'science_kingdom';

export interface AchievementMeta {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface SimulatedParticipant {
  id: string;
  name: string;
  role: string;
  level: number;
  status: string;
  isSimulated: true;
}

export interface AnswerOutcomeEvent {
  questionId: string;
  selectedOptionId: OptionId;
  correctOptionId: OptionId;
  isCorrect: boolean;
  topic: string;
  subject: string;
  explanation: string;
  damageDealt: number;
  pointsEarned: number;
}

export interface StudyRushSessionSummary {
  score: number;
  xpEarned: number;
  nightsSurvived: number;
  wavesCleared: number;
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
  bestStreak: number;
  durationSeconds: number;
  subject: SubjectCategory;
  grade: number;
  difficulty: DifficultyLevel;
  resourcesCollected: ResourceInventory;
  villageUpgrades: VillageUpgradeState;
  weakTopics: string[];
  masteredTopics: string[];
  unlockedAchievements: AchievementMeta[];
  victory: boolean;
}
