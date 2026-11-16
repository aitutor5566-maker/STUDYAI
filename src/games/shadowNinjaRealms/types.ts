export type AdventureMode = 'shadow_ninja' | 'minecraft_realms';
export type GraphicsTier = 'low' | 'medium' | 'high' | 'ultra';
export type WeatherType = 'clear' | 'golden_sunset' | 'misty' | 'rain' | 'starry_night';

export type NinjaCharacterId = 'kage_obsidian' | 'sakura_mist' | 'azure_tempest';
export type VoxelCharacterId = 'builder_steve' | 'arcane_alex' | 'crystal_knight';

export type NinjaRealmId = 'bamboo_temple' | 'sakura_sanctuary' | 'misty_waterfall_peaks';
export type MinecraftBiomeId = 'emerald_forest' | 'alpine_snow_peaks' | 'desert_oasis';

export type PlacedBlockKind = 'oak_wood' | 'stone_brick' | 'glow_crystal' | 'sakura_plank';
export type OptionId = 'A' | 'B' | 'C';

export interface RealmsQuestion {
  id: string;
  subject: string;
  topic: string;
  question: string;
  options: Array<{ id: OptionId; text: string }>;
  correctOptionId: OptionId;
  explanation: string;
  hint: string;
}

export interface RealmsInventory {
  wood: number;
  stone: number;
  crystal: number;
  scrolls: number;
  blocksPlaced: number;
}

export interface NinjaMission {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  completed: boolean;
  rewardXp: number;
}

export interface RealmsSettings {
  graphicsTier: GraphicsTier;
  musicVolume: number; // 0..1
  sfxVolume: number; // 0..1
  weather: WeatherType;
}

export interface LiveRealmsHud {
  mode: AdventureMode;
  zoneName: string;
  weather: WeatherType;
  timeOfDayLabel: string;
  nearbyPrompt: string | null;
  targetedShrineIndex: number | null;
  targetedOptionId: OptionId | null;
  shrineOptions: Array<{ index: number; id: OptionId; text: string }>;
  activeEnemiesCount: number;
  fpsEstimate: number;
}

export interface RealmsAnswerOutcome {
  accepted: boolean;
  isCorrect: boolean;
  question: RealmsQuestion;
  chosenOptionId: OptionId;
}

export const NINJA_CHARACTERS: Array<{
  id: NinjaCharacterId;
  name: string;
  cloakHex: string;
  armorHex: string;
  accentHex: string;
  description: string;
}> = [
  {
    id: 'kage_obsidian',
    name: 'Kage — Obsidian Shadow',
    cloakHex: '#0F172A',
    armorHex: '#1E293B',
    accentHex: '#22D3EE',
    description: 'Stealth master of the Bamboo Temple with cyan arcane blades.'
  },
  {
    id: 'sakura_mist',
    name: 'Hotaru — Sakura Mist',
    cloakHex: '#4C1D95',
    armorHex: '#312E81',
    accentHex: '#F472B6',
    description: 'Swift petal-dancer channeling cherry blossom wind energy.'
  },
  {
    id: 'azure_tempest',
    name: 'Raiden — Azure Tempest',
    cloakHex: '#0C4A6E',
    armorHex: '#1E3A8A',
    accentHex: '#FACC15',
    description: 'Storm-forged guardian wielding golden lightning chakra.'
  }
];

export const VOXEL_CHARACTERS: Array<{
  id: VoxelCharacterId;
  name: string;
  shirtHex: string;
  pantsHex: string;
  accentHex: string;
  description: string;
}> = [
  {
    id: 'builder_steve',
    name: 'Atlas — Master Builder',
    shirtHex: '#0284C7',
    pantsHex: '#1E3A8A',
    accentHex: '#F59E0B',
    description: 'Expert architect of voxel fortresses and stone bridges.'
  },
  {
    id: 'arcane_alex',
    name: 'Lyra — Emerald Ranger',
    shirtHex: '#059669',
    pantsHex: '#3F2A1D',
    accentHex: '#34D399',
    description: 'Explorer of deep caves, lush forests, and ancient shrines.'
  },
  {
    id: 'crystal_knight',
    name: 'Orion — Crystal Knight',
    shirtHex: '#4F46E5',
    pantsHex: '#1E293B',
    accentHex: '#38BDF8',
    description: 'Armored defender of the Minecraft Realms frontier.'
  }
];
