import type { EducationalQuestion, GameLanguage, OptionId } from '../types.ts';

export type BiomeType = 'grassland' | 'desert' | 'snow' | 'castle' | 'forest';

export interface ArenaDefinition {
  id: BiomeType;
  waveIndex: number;
  name: string;
  themeTitle: string;
  description: string;
  groundColor: number;
  groundSecondaryColor: number;
  wallColor: number;
  wallTrimColor: number;
  skyColor: number;
  fogColor: number;
  fogDensity: number;
  ambientLightColor: number;
  sunLightColor: number;
  accentColor: string;
  gridSize: number; // e.g. 28 -> -14 to +14 bounds
  wallHeight: number;
  mobType: string;
  mobCount: number;
  bossWave?: boolean;
}

export interface VoxelMobState {
  id: string;
  type: string;
  name: string;
  biome: BiomeType;
  position: { x: number; y: number; z: number };
  rotationY: number;
  health: number;
  maxHealth: number;
  speed: number;
  isBoss?: boolean;
  isAlive: boolean;
  hitFlashTime: number; // time remaining for white flash
  meshGroup?: any;
}

export interface HitParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  color: number;
  life: number;
  maxLife: number;
  size: number;
}

export interface FloatingTextEffect {
  id: string;
  text: string;
  x: number;
  y: number;
  z: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface BattleWorldStats {
  score: number;
  knowledgeXP: number;
  wave: number;
  totalWaves: number;
  currentArena: BiomeType;
  playerHealth: number;
  maxHealth: number;
  comboStreak: number;
  mobsRemaining: number;
  totalMobsInWave: number;
  questionsAnswered: number;
  correctAnswers: number;
  powerUpActive: boolean;
  powerUpTimeLeft: number;
}

export interface PlayerControlsInput {
  moveForward: number; // -1 to 1
  moveRight: number; // -1 to 1
  jump: boolean;
  action: boolean;
  lookDeltaX: number;
  lookDeltaY: number;
}
