export type AuthorisedGameId = 'war_of_words' | 'study_rush_3d' | 'katana_wisdom' | 'sky_striker' | 'shadow_ninja_realms';

export type GameLaunchOrigin =
  | 'ai_tutor'
  | 'language_learning'
  | 'library'
  | 'home'
  | 'dashboard'
  | 'profile'
  | 'other';

export interface GameLaunchRequest {
  gameId: AuthorisedGameId;
  gameName: string;
  launchingPage: GameLaunchOrigin;
  studentId: string;
  subject?: string;
  topic?: string;
  language?: string;
  grade?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  learningObjective?: string;
}

export interface GameLaunchResult {
  authorized: boolean;
  reason?: string;
  warning?: string;
  request?: GameLaunchRequest;
}

export interface GameMetadata {
  id: AuthorisedGameId;
  name: string;
  subtitle: string;
  description: string;
  badge: string;
  accentColor: string;
  supportedSubjects: string[];
  supportsPronunciation: boolean;
}

export const THREE_FEATURED_GAMES: GameMetadata[] = [
  {
    id: 'war_of_words',
    name: 'War of Words — Shadow Warrior',
    subtitle: '108+ Questions • 9 Categories • Moonlight Valley',
    description:
      'Travel through Moonlight Valley as an arcane Shadow Warrior, cast cyan magic at Answer Sentinels, and master vocabulary, synonyms, grammar & idioms with pronunciation.',
    badge: '2.5D Language Adventure',
    accentColor: '#22D3EE',
    supportedSubjects: ['English', 'Language', 'Vocabulary', 'Grammar', 'Literature', 'Languages'],
    supportsPronunciation: true
  },
  {
    id: 'study_rush_3d',
    name: 'Study Rush 3D — Survival Night',
    subtitle: 'Day/Night Cycle • Open World • Three.js Engine',
    description:
      'Explore Survival Village, Dark Forest & Crystal Cave by day and defend the village at night by answering curriculum-aligned questions.',
    badge: '3D Open-World Survival',
    accentColor: '#FF6A00',
    supportedSubjects: ['Science', 'Biology', 'Physics', 'Chemistry', 'Mathematics', 'History', 'Geography', 'English', 'General'],
    supportsPronunciation: false
  },
  {
    id: 'katana_wisdom',
    name: 'Katana: Shadow Warriors — The Wisdom Battle',
    subtitle: 'Flagship 2.5D Adventure • Moonlit Bamboo Forest',
    description:
      'Master your academic curriculum in real-time samurai combat. Unleash wisdom strikes, charge your spirit katana gauge, and defeat shadow warlords.',
    badge: '2.5D Wisdom Combat',
    accentColor: '#F59E0B',
    supportedSubjects: ['Science', 'Biology', 'Physics', 'Chemistry', 'Mathematics', 'History', 'Geography', 'English', 'General'],
    supportsPronunciation: false
  },
  {
    id: 'sky_striker',
    name: 'Sky Striker — Fighter Jet: Knowledge Flight',
    subtitle: '50+ Questions • 5 Aerial Worlds • Three.js Flight Engine',
    description:
      'Pilot a twin-engine futuristic fighter jet through Desert Storm and beyond, lock onto holographic answer targets, and fire energy pulses.',
    badge: '3D Aerial Flight Adventure',
    accentColor: '#38BDF8',
    supportedSubjects: ['Science', 'Biology', 'Physics', 'Chemistry', 'Mathematics', 'History', 'Geography', 'English', 'General'],
    supportsPronunciation: false
  },
  {
    id: 'shadow_ninja_realms',
    name: 'Shadow Ninja : Minecraft Realms',
    subtitle: '2 Worlds • Moving Clouds • Temple & Voxel Building',
    description:
      'Switch between Shadow Ninja (ancient temples, bamboo groves & waterfalls) and Minecraft Realms (voxel biomes & live 3D block building).',
    badge: 'Dual-World 3D Adventure',
    accentColor: '#10B981',
    supportedSubjects: ['Science', 'Biology', 'Physics', 'Chemistry', 'Mathematics', 'History', 'Geography', 'English', 'General'],
    supportsPronunciation: false
  }
];

const AUTHORISED_ORIGINS = new Set<GameLaunchOrigin>(['ai_tutor', 'language_learning']);

export function getTopicSupportNotice(
  gameId: AuthorisedGameId,
  subject?: string,
  topic?: string
): string | null {
  const cleanSubject = (subject || '').trim().toLowerCase();
  const cleanTopic = (topic || '').trim().toLowerCase();

  if (gameId === 'war_of_words') {
    const isLanguageTopic =
      !cleanSubject ||
      cleanSubject.includes('english') ||
      cleanSubject.includes('language') ||
      cleanSubject.includes('grammar') ||
      cleanSubject.includes('vocab') ||
      cleanTopic.includes('synonym') ||
      cleanTopic.includes('idiom') ||
      cleanTopic.includes('grammar') ||
      cleanTopic.includes('vocab');
    if (!isLanguageTopic) {
      return `War of Words specializes in English vocabulary, grammar & idioms. Launching with language challenges related to "${topic || subject}".`;
    }
  }
  return null;
}

export function requestGameLaunch(req: GameLaunchRequest): GameLaunchResult {
  if (!AUTHORISED_ORIGINS.has(req.launchingPage)) {
    return {
      authorized: false,
      reason: `Game launch rejected: "${req.launchingPage}" is not an authorised origin. Games can only be launched from AI Tutor or Language Learning.`
    };
  }

  const gameMeta = THREE_FEATURED_GAMES.find((g) => g.id === req.gameId);
  if (!gameMeta) {
    return {
      authorized: false,
      reason: `Unknown game ID: "${req.gameId}". Only the three featured games are supported.`
    };
  }

  const warning = getTopicSupportNotice(req.gameId, req.subject, req.topic) || undefined;

  return {
    authorized: true,
    warning,
    request: {
      ...req,
      gameName: gameMeta.name,
      topic: req.topic?.trim() || 'General Knowledge',
      subject: req.subject?.trim() || 'Science',
      language: req.language?.trim() || 'English',
      difficulty: req.difficulty || 'medium'
    }
  };
}
