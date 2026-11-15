export type EnglishCategory =
  | 'All Categories'
  | 'Vocabulary Quest'
  | 'Synonym Battle'
  | 'Antonym Battle'
  | 'Missing Word'
  | 'Spelling Challenge'
  | 'Grammar Battle'
  | 'Sentence Formation'
  | 'Idioms & Phrases'
  | 'Picture Word Quest';

export type GameModeId =
  | 'word_quest'
  | 'synonym_battle'
  | 'antonym_battle'
  | 'grammar_challenge'
  | 'spelling_arena'
  | 'sentence_master'
  | 'revision_mode'
  | 'time_challenge'
  | 'shadow_boss';

export type WorldId =
  | 'moonlight_valley'
  | 'shadow_forest'
  | 'ancient_kingdom'
  | 'crystal_caverns'
  | 'sky_of_knowledge';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type GraphicsQuality = 'low' | 'medium' | 'high';
export type OptionId = 'A' | 'B' | 'C' | 'D';
export type HelmStyle = 'hood' | 'horned' | 'crest';

export interface WarriorCustomization {
  armorColor: string;
  cloakColor: string;
  glowColor: string;
  helmStyle: HelmStyle;
}

export const DEFAULT_WARRIOR_CUSTOMIZATION: WarriorCustomization = {
  armorColor: '#1E293B',
  cloakColor: '#0F172A',
  glowColor: '#22D3EE',
  helmStyle: 'hood'
};

export interface WarWordOption {
  id: OptionId;
  text: string;
}

export interface WarWordQuestion {
  id: string;
  category: Exclude<EnglishCategory, 'All Categories'>;
  grade: number;
  difficulty: DifficultyLevel;
  topic: string;
  vocabLevel: 'Foundation' | 'Intermediate' | 'Advanced';
  prompt: string;
  visualEmoji?: string;
  targetWord: string;
  pronunciation: string;
  meaning: string;
  exampleSentence: string;
  explanation: string;
  options: WarWordOption[];
  correctOptionId: OptionId;
}

export interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
}

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  masterVolume: 0.7,
  musicVolume: 0.35,
  sfxVolume: 0.75,
  muted: false
};

export interface AnswerOutcome {
  questionId: string;
  selectedOptionId: OptionId;
  correctOptionId: OptionId;
  isCorrect: boolean;
  pointsAwarded: number;
  question: WarWordQuestion;
}

export interface WarOfWordsSessionSummary {
  mode: GameModeId;
  worldId: WorldId;
  category: EnglishCategory;
  difficulty: DifficultyLevel;
  grade: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  knowledgePoints: number;
  bestStreak: number;
  durationSeconds: number;
  wordsLearned: string[];
  missedQuestions: WarWordQuestion[];
  worldCompleted: boolean;
}
