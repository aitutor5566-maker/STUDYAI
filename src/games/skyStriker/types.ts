export type SkyStrikerSubject =
  | 'All Subjects'
  | 'Science'
  | 'Mathematics'
  | 'English'
  | 'History'
  | 'Geography'
  | 'General Knowledge';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type WorldId =
  | 'desert_storm'
  | 'frozen_horizon'
  | 'ocean_frontier'
  | 'future_city'
  | 'sky_kingdom';

export type CameraMode = 'standard' | 'cinematic' | 'cockpit' | 'side' | 'reduced';
export type GraphicsQuality = 'low' | 'medium' | 'high' | 'ultra';
export type GameModeId = 'knowledge_flight' | 'revision_flight';

export type AircraftSkinId =
  | 'cyan_viper'
  | 'solar_phoenix'
  | 'obsidian_stealth'
  | 'emerald_falcon';

export interface AircraftSkin {
  id: AircraftSkinId;
  name: string;
  fuselageHex: number;
  wingAccentHex: number;
  canopyHex: number;
  engineGlowHex: number;
  previewGradient: string;
}

export interface SkyStrikerOption {
  answerId: string;
  label: 'A' | 'B' | 'C';
  text: string;
}

export interface SkyStrikerQuestion {
  questionId: string;
  subject: Exclude<SkyStrikerSubject, 'All Subjects'>;
  grade: number;
  topic: string;
  difficulty: DifficultyLevel;
  questionText: string;
  options: SkyStrikerOption[]; // Always exactly 3 randomized options
  correctAnswerId: string;
  explanation: string;
  optionalHint?: string;
}

export interface ProjectedTargetHud {
  targetId: string;
  answerId: string;
  label: 'A' | 'B' | 'C';
  text: string;
  screenX: number;
  screenY: number;
  visible: boolean;
  distance: number;
  isSelected: boolean;
  lockProgress: number; // 0..1
  isLocked: boolean;
  validationState: 'idle' | 'correct' | 'incorrect';
}

export interface RadarBlip {
  id: string;
  kind: 'enemy' | 'target';
  relX: number; // -1..1 normalized radar coords
  relZ: number; // -1..1 normalized radar coords
}

export interface SkyStrikerHudSnapshot {
  speedKts: number;
  altitudeFt: number;
  isBoosting: boolean;
  turbulenceActive: boolean;
  selectedTargetId: string | null;
  selectedAnswerId: string | null;
  lockProgress: number;
  isLocked: boolean;
  targets: ProjectedTargetHud[];
  playerHp?: number;
  shieldActive?: boolean;
  dodgeReady?: boolean;
  radarBlips?: RadarBlip[];
}

export interface SkyStrikerAudioSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
}

export interface SkyStrikerSessionSummary {
  knowledgePoints: number;
  correctAnswers: number;
  incorrectAnswers: number;
  totalQuestions: number;
  accuracy: number;
  bestStreak: number;
  levelReached: number;
  durationSeconds: number;
  masteredTopics: string[];
  missedQuestions: SkyStrikerQuestion[];
}

export const AIRCRAFT_SKINS: AircraftSkin[] = [
  {
    id: 'cyan_viper',
    name: 'Cyan Viper',
    fuselageHex: 0x334155,
    wingAccentHex: 0x06b6d4,
    canopyHex: 0x38bdf8,
    engineGlowHex: 0x22d3ee,
    previewGradient: 'linear-gradient(135deg, #334155, #06b6d4)'
  },
  {
    id: 'solar_phoenix',
    name: 'Solar Phoenix',
    fuselageHex: 0x1e293b,
    wingAccentHex: 0xf97316,
    canopyHex: 0xfbbf24,
    engineGlowHex: 0xfb923c,
    previewGradient: 'linear-gradient(135deg, #1e293b, #f97316)'
  },
  {
    id: 'obsidian_stealth',
    name: 'Obsidian Stealth',
    fuselageHex: 0x0f172a,
    wingAccentHex: 0x818cf8,
    canopyHex: 0xa5b4fc,
    engineGlowHex: 0x6366f1,
    previewGradient: 'linear-gradient(135deg, #0f172a, #6366f1)'
  },
  {
    id: 'emerald_falcon',
    name: 'Emerald Falcon',
    fuselageHex: 0x1e3a3a,
    wingAccentHex: 0x10b981,
    canopyHex: 0x6ee7b7,
    engineGlowHex: 0x34d399,
    previewGradient: 'linear-gradient(135deg, #1e3a3a, #10b981)'
  }
];

export const DEFAULT_SKY_AUDIO: SkyStrikerAudioSettings = {
  masterVolume: 0.75,
  musicVolume: 0.45,
  sfxVolume: 0.85,
  muted: false
};
