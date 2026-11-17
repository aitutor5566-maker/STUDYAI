import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Compass,
  Hammer,
  Heart,
  HelpCircle,
  Layers,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Shield,
  Sparkles,
  Sun,
  Moon,
  Trophy,
  User,
  Users,
  Volume2,
  VolumeX,
  X,
  Zap
} from 'lucide-react';
import { useLearning } from '../../context/LearningContext';
import { StudyRushAudioManager } from '../../games/studyRush3d/AudioManager';
import { buildQuestionDeck, STUDY_RUSH_ACHIEVEMENTS } from '../../games/studyRush3d/questionBank';
import { LiveHudSnapshot, StudyRush3DCanvas } from '../../games/studyRush3d/StudyRush3DCanvas';
import { enterElementFullscreen, exitBrowserFullscreen, isBrowserFullscreenActive } from '../../utils/fullscreenGame';
import {
  QuestionProgressionMachine,
  loadGameProgress,
  saveGameProgress
} from '../../games/ProgressionController';
import { getStudyRushLevelTheme } from '../../games/studyRush3d/WorldManager';
import {
  AchievementMeta,
  AnswerOutcomeEvent,
  CompanionType,
  DEFAULT_PLAYER_CUSTOMIZATION,
  DifficultyLevel,
  GameScreenState,
  HatStyle,
  PlayerCustomization,
  ResourceInventory,
  SimulatedParticipant,
  StudyRushQuestion,
  StudyRushSessionSummary,
  SubjectCategory,
  VillageUpgradeState
} from '../../games/studyRush3d/types';

export interface StudyRush3DModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
  initialSubject?: string;
  difficulty?: DifficultyLevel;
}

const SUBJECT_LIST: SubjectCategory[] = [
  'All Subjects',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'History',
  'Geography',
  'General Knowledge'
];

const SIMULATED_PLAZA_SQUAD: SimulatedParticipant[] = [
  { id: 'sim-1', name: 'NovaBot-7', role: 'Arcane Archer', level: 4, status: 'Patrolling North Gate', isSimulated: true },
  { id: 'sim-2', name: 'ByteGuard', role: 'Stone Mason', level: 3, status: 'Reinforcing Walls', isSimulated: true },
  { id: 'sim-3', name: 'LumenAI', role: 'Crystal Scout', level: 5, status: 'Scanning Crystal Cave', isSimulated: true }
];

const ZONE_LABELS: Record<string, string> = {
  village: 'Survival Village',
  dark_forest: 'Dark Forest (West)',
  crystal_cave: 'Crystal Cave (North)',
  ancient_castle: 'Ancient Castle (East)',
  science_kingdom: 'Science Kingdom (South)'
};

export const StudyRush3DModal: React.FC<StudyRush3DModalProps> = ({
  isOpen,
  onClose,
  initialTopic,
  initialSubject,
  difficulty: propDifficulty
}) => {
  const { activeProfile, apiFetch, triggerRefresh } = useLearning();
  const navigate = useNavigate();

  const audioManager = useMemo(() => new StudyRushAudioManager(), []);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Screen & Setup State
  const [screen, setScreen] = useState<GameScreenState>('menu');
  const [subject, setSubject] = useState<SubjectCategory>('All Subjects');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(propDifficulty || 'medium');
  const [grade, setGrade] = useState<number>(activeProfile?.grade || 9);
  const [customization, setCustomization] = useState<PlayerCustomization>({
    ...DEFAULT_PLAYER_CUSTOMIZATION,
    name: activeProfile?.name?.split(' ')[0] || 'Scholar'
  });
  const [showCustomize, setShowCustomize] = useState(false);
  const [showBuildModal, setShowBuildModal] = useState(false);
  const [showSquadPanel, setShowSquadPanel] = useState(false);

  // Audio controls
  const [muted, setMuted] = useState(false);

  // Gameplay State
  const [deck, setDeck] = useState<StudyRushQuestion[]>(() => buildQuestionDeck('All Subjects', 'medium', 9));
  const [qIndex, setQIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [playerHp, setPlayerHp] = useState(100);
  const [villageHp, setVillageHp] = useState(100);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [nightsSurvived, setNightsSurvived] = useState(0);
  const [wavesCleared, setWavesCleared] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  const [masteredTopics, setMasteredTopics] = useState<string[]>([]);
  const [resources, setResources] = useState<ResourceInventory>({
    wood: 4,
    stone: 4,
    crystal: 1,
    knowledgeOrbs: 1
  });
  const [upgrades, setUpgrades] = useState<VillageUpgradeState>({
    wallLevel: 1,
    towerLevel: 0,
    lanternLevel: 0,
    libraryLevel: 0
  });
  const [feedbackBanner, setFeedbackBanner] = useState<{
    isCorrect: boolean;
    title: string;
    detail: string;
  } | null>(null);

  const [quickCastSignal, setQuickCastSignal] = useState<{ index: number; seq: number } | null>(null);
  const [skipToNightSignal, setSkipToNightSignal] = useState(0);
  const [sessionSummary, setSessionSummary] = useState<StudyRushSessionSummary | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const startTimestampRef = useRef<number>(Date.now());
  const mobileInputRef = useRef({ moveX: 0, moveY: 0, jump: false, interact: false });
  const [levelNum, setLevelNum] = useState<number>(() =>
    loadGameProgress('study_rush_3d', activeProfile?.id || 'default').currentLevel
  );
  const progressionRef = useRef(new QuestionProgressionMachine({ questionsPerLevel: 5, startingLevel: levelNum }));

  const [hud, setHud] = useState<LiveHudSnapshot>({
    phase: 'day',
    nightWave: 1,
    zone: 'village',
    targetedShrineIndex: null,
    targetedOptionId: null,
    nearbyPrompt: null,
    activeEnemiesCount: 0,
    shrineOptions: []
  });

  const currentQuestion = deck[qIndex % deck.length];

  const finishRun = useCallback(
    async (victory: boolean) => {
      const durationSeconds = Math.max(10, Math.round((Date.now() - startTimestampRef.current) / 1000));
      const accuracy = questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0;

      const unlocked: AchievementMeta[] = [];
      if (nightsSurvived >= 1) unlocked.push(STUDY_RUSH_ACHIEVEMENTS[0]);
      if (bestStreak >= 5) unlocked.push(STUDY_RUSH_ACHIEVEMENTS[1]);
      if (upgrades.wallLevel + upgrades.towerLevel + upgrades.lanternLevel + upgrades.libraryLevel >= 3) {
        unlocked.push(STUDY_RUSH_ACHIEVEMENTS[2]);
      }
      if (resources.wood + resources.stone + resources.crystal + resources.knowledgeOrbs >= 12) {
        unlocked.push(STUDY_RUSH_ACHIEVEMENTS[3]);
      }
      if (wavesCleared >= 3 && accuracy >= 80) unlocked.push(STUDY_RUSH_ACHIEVEMENTS[4]);

      const summary: StudyRushSessionSummary = {
        score,
        xpEarned: xp,
        nightsSurvived,
        wavesCleared,
        questionsAnswered,
        correctAnswers,
        accuracy,
        bestStreak,
        durationSeconds,
        subject,
        grade,
        difficulty,
        resourcesCollected: resources,
        villageUpgrades: upgrades,
        weakTopics: Array.from(new Set(weakTopics)),
        masteredTopics: Array.from(new Set(masteredTopics)),
        unlockedAchievements: unlocked,
        victory
      };

      setSessionSummary(summary);
      setScreen('results');

      try {
        const res = await apiFetch('/api/educational-games/study-rush/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(summary)
        });
        if (res.ok) {
          setSavedNotice('Progress & XP saved to STUDYAI Library!');
          triggerRefresh();
        }
      } catch {
        setSavedNotice('Session completed locally.');
      }
    },
    [
      apiFetch,
      bestStreak,
      correctAnswers,
      difficulty,
      grade,
      masteredTopics,
      nightsSurvived,
      questionsAnswered,
      resources,
      score,
      subject,
      triggerRefresh,
      upgrades,
      wavesCleared,
      weakTopics,
      xp
    ]
  );

  // Sync subject/difficulty from AI Tutor / Language Learning context & handle fullscreen
  useEffect(() => {
    if (!isOpen) {
      exitBrowserFullscreen();
      return;
    }
    const hint = `${initialSubject || ''} ${initialTopic || ''}`.toLowerCase();
    if (hint.includes('math') || hint.includes('algebra') || hint.includes('quadratic') || hint.includes('geometry')) {
      setSubject('Mathematics');
    } else if (hint.includes('physic') || hint.includes('newton') || hint.includes('force') || hint.includes('circuit')) {
      setSubject('Physics');
    } else if (hint.includes('chem') || hint.includes('atom') || hint.includes('bond')) {
      setSubject('Chemistry');
    } else if (hint.includes('bio') || hint.includes('mitosis') || hint.includes('photosynthesis') || hint.includes('heart')) {
      setSubject('Biology');
    } else if (hint.includes('hist') || hint.includes('revolution') || hint.includes('war')) {
      setSubject('History');
    } else if (hint.includes('geog') || hint.includes('tectonic') || hint.includes('water cycle')) {
      setSubject('Geography');
    } else if (hint.includes('english') || hint.includes('grammar') || hint.includes('vocab') || hint.includes('language')) {
      setSubject('English');
    }
    if (propDifficulty) setDifficulty(propDifficulty);
  }, [isOpen, initialTopic, initialSubject, propDifficulty]);

  useEffect(() => {
    const syncFs = () => setIsFullscreen(isBrowserFullscreenActive());
    document.addEventListener('fullscreenchange', syncFs);
    document.addEventListener('webkitfullscreenchange', syncFs);
    return () => {
      document.removeEventListener('fullscreenchange', syncFs);
      document.removeEventListener('webkitfullscreenchange', syncFs);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (isBrowserFullscreenActive()) {
      await exitBrowserFullscreen();
      setIsFullscreen(false);
    } else {
      const ok = await enterElementFullscreen(rootRef.current);
      setIsFullscreen(ok);
    }
  };

  const handleExitGame = async () => {
    await exitBrowserFullscreen();
    onClose();
  };

  // Auto-end run if Player HP or Village HP drops to 0
  useEffect(() => {
    if (screen === 'playing' && (playerHp <= 0 || villageHp <= 0)) {
      finishRun(false);
    }
  }, [playerHp, villageHp, screen, finishRun]);

  const startNewRun = () => {
    audioManager.unlock();
    const freshDeck = buildQuestionDeck(subject, difficulty, grade);
    setDeck(freshDeck);
    setQIndex(0);
    setShowHint(false);
    setPlayerHp(100);
    setVillageHp(100);
    setScore(0);
    setXp(0);
    setStreak(0);
    setBestStreak(0);
    setNightsSurvived(0);
    setWavesCleared(0);
    setQuestionsAnswered(0);
    setCorrectAnswers(0);
    setWeakTopics([]);
    setMasteredTopics([]);
    setResources({ wood: 4, stone: 4, crystal: 1, knowledgeOrbs: 1 });
    setUpgrades({ wallLevel: 1, towerLevel: 0, lanternLevel: 0, libraryLevel: 0 });
    enterElementFullscreen(rootRef.current).then((ok) => setIsFullscreen(ok));
    setFeedbackBanner(null);
    setSavedNotice(null);
    setSessionSummary(null);
    progressionRef.current.reset(1);
    if (deck[0]) {
      progressionRef.current.activateQuestion(deck[0].id);
    }
    startTimestampRef.current = Date.now();
    setScreen('playing');
  };

  const handleAnswerSubmitted = useCallback((ev: AnswerOutcomeEvent) => {
    const activeQ = deck[qIndex % deck.length];
    const qId = activeQ?.id || `sr-${qIndex}`;
    const evalResult = progressionRef.current.submitAnswer({
      questionId: qId,
      selectedAnswerId: ev.isCorrect ? ev.correctOptionId : '__wrong__',
      correctAnswerId: ev.correctOptionId,
      basePoints: ev.pointsEarned
    });
    if (!evalResult.accepted) return;

    setQuestionsAnswered((n) => n + 1);
    setShowHint(false);

    const nextState = progressionRef.current.advance();
    const leveledUp = nextState === 'LEVEL_COMPLETE';
    const nextLevel = leveledUp ? progressionRef.current.startNextLevel() : progressionRef.current.getSnapshot().level;
    const nextTheme = getStudyRushLevelTheme(nextLevel);
    if (leveledUp) {
      setLevelNum(nextLevel);
      saveGameProgress({
        gameId: 'study_rush_3d',
        profileId: activeProfile?.id || 'default',
        currentLevel: nextLevel,
        highestUnlockedLevel: nextLevel,
        completedLevels: [nextLevel - 1],
        bestScore: score + ev.pointsEarned + 150,
        totalCorrect: correctAnswers + (ev.isCorrect ? 1 : 0),
        totalAttempts: questionsAnswered + 1
      });
    }

    if (ev.isCorrect) {
      setCorrectAnswers((n) => n + 1);
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
      const bonus = ev.pointsEarned + streak * 25 + (leveledUp ? 150 : 0);
      setScore((sc) => sc + bonus);
      setXp((x) => x + 35 + (leveledUp ? 60 : 0));
      setWavesCleared((w) => w + 1);
      setResources((r) => ({ ...r, knowledgeOrbs: r.knowledgeOrbs + 1 }));
      setMasteredTopics((prev) => [...prev, ev.topic]);
      if (leveledUp) {
        setPlayerHp((h) => Math.min(100, h + 15));
      }
      setFeedbackBanner({
        isCorrect: true,
        title: leveledUp
          ? `🏆 Level ${nextLevel}: ${nextTheme.name} Unlocked! +${bonus} pts`
          : `✨ Arcane Strike! +${bonus} pts`,
        detail: ev.explanation
      });
    } else {
      setStreak(0);
      setWeakTopics((prev) => [...prev, ev.topic]);
      setFeedbackBanner({
        isCorrect: false,
        title: leveledUp
          ? `🛡️ Level ${nextLevel} Reached (Correct: ${ev.correctOptionId})`
          : `🛡️ Knowledge Shield Absorbed (Correct: ${ev.correctOptionId})`,
        detail: ev.explanation
      });
    }

    const nextIdx = qIndex + 1;
    const nextQ = deck[nextIdx % deck.length];
    if (nextQ) {
      progressionRef.current.activateQuestion(nextQ.id);
    }
    setQIndex(nextIdx);
  }, [deck, qIndex, streak]);

  const handleResourceCollected = useCallback((delta: Partial<ResourceInventory>, label: string) => {
    setResources((r) => ({
      wood: r.wood + (delta.wood || 0),
      stone: r.stone + (delta.stone || 0),
      crystal: r.crystal + (delta.crystal || 0),
      knowledgeOrbs: r.knowledgeOrbs + (delta.knowledgeOrbs || 0)
    }));
    setScore((s) => s + 25);
    setFeedbackBanner({
      isCorrect: true,
      title: `🎒 Resource Gathered: ${label}`,
      detail: 'Use resources in the Build Upgrades bench to strengthen Survival Village!'
    });
  }, []);

  const handleVillagerTip = useCallback((speaker: string, message: string) => {
    setFeedbackBanner({
      isCorrect: true,
      title: `💬 ${speaker}`,
      detail: message
    });
  }, []);

  const handleNightSurvived = useCallback((nightNum: number) => {
    setNightsSurvived(nightNum);
    setScore((s) => s + 250);
    setXp((x) => x + 80);
    setPlayerHp((h) => Math.min(100, h + 20));
    setVillageHp((h) => Math.min(100, h + 15));
    setFeedbackBanner({
      isCorrect: true,
      title: `🌅 Dawn Reached! Night ${nightNum} Survived (+250 pts)`,
      detail: 'The village is safe! Gather resources or upgrade defenses before the next nightfall.'
    });
  }, []);

  const performUpgrade = (kind: keyof VillageUpgradeState) => {
    audioManager.unlock();
    const costs: Record<keyof VillageUpgradeState, Partial<ResourceInventory>> = {
      wallLevel: { wood: 2, stone: 2 },
      towerLevel: { stone: 3, crystal: 1 },
      lanternLevel: { wood: 2, crystal: 1 },
      libraryLevel: { wood: 2, knowledgeOrbs: 2 }
    };
    const cost = costs[kind];
    if (
      resources.wood < (cost.wood || 0) ||
      resources.stone < (cost.stone || 0) ||
      resources.crystal < (cost.crystal || 0) ||
      resources.knowledgeOrbs < (cost.knowledgeOrbs || 0)
    ) {
      setFeedbackBanner({
        isCorrect: false,
        title: 'Not enough resources!',
        detail: 'Explore the Forest (Wood), Cave (Stone/Crystal), or answer questions (Orbs).'
      });
      return;
    }

    setResources((r) => ({
      wood: r.wood - (cost.wood || 0),
      stone: r.stone - (cost.stone || 0),
      crystal: r.crystal - (cost.crystal || 0),
      knowledgeOrbs: r.knowledgeOrbs - (cost.knowledgeOrbs || 0)
    }));
    setUpgrades((u) => ({ ...u, [kind]: u[kind] + 1 }));
    if (kind === 'wallLevel') setVillageHp((h) => Math.min(100, h + 20));
    audioManager.playBuildUpgrade();
    setFeedbackBanner({
      isCorrect: true,
      title: '🏗️ Village Defense Upgraded!',
      detail: 'Your Survival Village is stronger for the coming night.'
    });
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    audioManager.setMuted(next);
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      ref={rootRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        zIndex: 99999,
        background: '#090D1F',
        color: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, system-ui, sans-serif',
        touchAction: screen === 'playing' ? 'none' : 'auto',
        overflow: 'hidden'
      }}
    >
      {/* ==================== MAIN MENU ==================== */}
      {screen === 'menu' && (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 16px',
            background: 'radial-gradient(circle at 20% 15%, rgba(255,106,0,0.22), transparent 45%), linear-gradient(160deg, #090D1F 0%, #111936 55%, #0B2438 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 920,
              background: 'rgba(15, 23, 42, 0.88)',
              border: '1.5px solid rgba(255, 106, 0, 0.45)',
              borderRadius: 24,
              padding: '28px 24px',
              boxShadow: '0 24px 60px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 18 }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 999, background: 'rgba(255,106,0,0.18)', border: '1px solid #FF6A00', color: '#FDBA74', fontSize: '0.75rem', fontWeight: 800, marginBottom: 10 }}>
                  <Sparkles size={14} /> STUDYAI 3D VOXEL ADVENTURE
                </div>
                <h1 style={{ fontSize: 'clamp(1.6rem, 3.6vw, 2.4rem)', fontWeight: 900, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
                  STUDY RUSH 3D — SURVIVAL NIGHT
                </h1>
                <p style={{ margin: 0, color: '#94A3B8', fontWeight: 700, fontSize: '0.92rem', letterSpacing: '0.06em' }}>
                  LEARN. EXPLORE. SURVIVE. BECOME A LEGEND.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  color: '#E2E8F0',
                  borderRadius: 12,
                  padding: 8,
                  cursor: 'pointer'
                }}
                aria-label="Close Study Rush 3D"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 20 }}>
              {/* Subject Picker */}
              <div style={{ background: 'rgba(30,41,59,0.75)', padding: 14, borderRadius: 16, border: '1px solid rgba(148,163,184,0.2)' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#FDBA74', marginBottom: 6 }}>
                  SUBJECT PACK
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as SubjectCategory)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: '#0F172A', color: '#FFF', border: '1px solid #334155', fontWeight: 700 }}
                >
                  {SUBJECT_LIST.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty Picker */}
              <div style={{ background: 'rgba(30,41,59,0.75)', padding: 14, borderRadius: 16, border: '1px solid rgba(148,163,184,0.2)' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#FDBA74', marginBottom: 6 }}>
                  DIFFICULTY
                </label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      style={{
                        flex: 1,
                        padding: '9px 6px',
                        borderRadius: 10,
                        border: difficulty === d ? '1.5px solid #FF6A00' : '1px solid #334155',
                        background: difficulty === d ? '#FF6A00' : '#0F172A',
                        color: '#FFF',
                        fontWeight: 800,
                        textTransform: 'capitalize',
                        cursor: 'pointer'
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grade Picker */}
              <div style={{ background: 'rgba(30,41,59,0.75)', padding: 14, borderRadius: 16, border: '1px solid rgba(148,163,184,0.2)' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#FDBA74', marginBottom: 6 }}>
                  CLASS / GRADE: {grade}
                </label>
                <input
                  type="range"
                  min={5}
                  max={12}
                  value={grade}
                  onChange={(e) => setGrade(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#FF6A00', marginTop: 8 }}
                />
              </div>
            </div>

            {/* Gameplay Loop Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 22 }}>
              {[
                { icon: '🌲', title: 'Explore Open World', desc: 'Village, Dark Forest, Crystal Cave, Castle & Science Kingdom' },
                { icon: '💎', title: 'Collect & Build', desc: 'Gather Wood, Stone, Crystals & Orbs to upgrade defenses' },
                { icon: '🔮', title: 'Cast Answer Bolts', desc: 'Aim at the 3 Answer Shrines (or press 1/2/3) to blast night waves' },
                { icon: '🌅', title: 'Survive Nightfall', desc: 'Endure Sunset → Night → Sunrise cycles & earn XP' }
              ].map((item) => (
                <div key={item.title} style={{ background: 'rgba(15,23,42,0.75)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 12 }}>
                  <div style={{ fontSize: '1.3rem', marginBottom: 4 }}>{item.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: 2 }}>{item.title}</div>
                  <div style={{ fontSize: '0.76rem', color: '#94A3B8', lineHeight: 1.4 }}>{item.desc}</div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setShowCustomize(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px 18px',
                    borderRadius: 14,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#FFF',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  <User size={18} />
                  Customize Hero ({customization.hatStyle}, {customization.companion})
                </button>
              </div>

              <button
                type="button"
                onClick={startNewRun}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '14px 28px',
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #FF7A1A 0%, #FF5500 100%)',
                  border: 'none',
                  color: '#FFF',
                  fontSize: '1rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 10px 28px rgba(255,106,0,0.4)'
                }}
              >
                <Play size={20} fill="#FFF" />
                Enter Survival Village
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 3D PLAYING VIEWPORT + HUD ==================== */}
      {(screen === 'playing' || screen === 'paused') && (
        <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
          <StudyRush3DCanvas
            paused={screen === 'paused' || showBuildModal || showCustomize}
            customization={customization}
            currentQuestion={currentQuestion}
            villageUpgrades={upgrades}
            audioManager={audioManager}
            levelNum={levelNum}
            quickCastSignal={quickCastSignal}
            skipToNightSignal={skipToNightSignal}
            mobileInputRef={mobileInputRef}
            onHudUpdate={setHud}
            onAnswerSubmitted={handleAnswerSubmitted}
            onResourceCollected={handleResourceCollected}
            onVillagerTip={handleVillagerTip}
            onVillageDamaged={(d) => setVillageHp((h) => Math.max(0, h - d))}
            onPlayerDamaged={(d) => setPlayerHp((h) => Math.max(0, h - d))}
            onNightSurvived={handleNightSurvived}
            onPauseRequested={() => setScreen((s) => (s === 'playing' ? 'paused' : 'playing'))}
          />

          {/* TOP-LEFT: Health, Village Integrity & Resources */}
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              background: 'rgba(15,23,42,0.82)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: 14,
              padding: '10px 12px',
              minWidth: 195,
              pointerEvents: 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 800 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#FCA5A5' }}>
                <Heart size={13} fill="#EF4444" color="#EF4444" /> Hero HP
              </span>
              <span>{playerHp}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 99, background: '#1E293B', overflow: 'hidden' }}>
              <div style={{ width: `${playerHp}%`, height: '100%', background: '#EF4444', transition: 'width 0.2s' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 800, marginTop: 2 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#93C5FD' }}>
                <Shield size={13} color="#3B82F6" /> Village Gate
              </span>
              <span>{villageHp}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 99, background: '#1E293B', overflow: 'hidden' }}>
              <div style={{ width: `${villageHp}%`, height: '100%', background: '#3B82F6', transition: 'width 0.2s' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', fontWeight: 800, color: '#FACC15', marginTop: 4 }}>
              <span>⭐ {score} pts</span>
              <span>🔥 Streak {streak}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, fontSize: '0.72rem', fontWeight: 700, color: '#CBD5E1' }}>
              <span>🪵{resources.wood}</span>
              <span>🪨{resources.stone}</span>
              <span>💎{resources.crystal}</span>
              <span>🔮{resources.knowledgeOrbs}</span>
            </div>
          </div>

          {/* TOP-CENTER: Fixed Educational Question HUD (responsive for mobile & desktop) */}
          {currentQuestion && (
            <div
              style={{
                position: 'absolute',
                top: typeof window !== 'undefined' && window.innerWidth < 900 ? 124 : 12,
                left: '50%',
                transform: 'translateX(-50%)',
                width: typeof window !== 'undefined' && window.innerWidth < 900 ? 'calc(100vw - 24px)' : 'min(520px, calc(100vw - 440px))',
                minWidth: 260,
                background: 'rgba(15,23,42,0.9)',
                backdropFilter: 'blur(10px)',
                border: '1.5px solid rgba(255,106,0,0.65)',
                borderRadius: 16,
                padding: '10px 14px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#FDBA74', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {currentQuestion.subject} • {currentQuestion.topic}
                </span>
                <button
                  type="button"
                  onClick={() => setShowHint((h) => !h)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 99,
                    border: '1px solid rgba(250,204,21,0.45)',
                    background: 'rgba(250,204,21,0.12)',
                    color: '#FDE047',
                    cursor: 'pointer'
                  }}
                >
                  <HelpCircle size={12} /> Hint
                </button>
              </div>
              <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.35 }}>
                {currentQuestion.question}
              </div>
              {showHint && (
                <div style={{ marginTop: 6, fontSize: '0.76rem', color: '#FDE047', fontWeight: 600 }}>
                  💡 Hint: {currentQuestion.hint}
                </div>
              )}
            </div>
          )}

          {/* TOP-RIGHT: Day/Night Clock, Zone, Controls */}
          <div
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 8
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(15,23,42,0.84)',
                border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: 14,
                padding: '8px 12px'
              }}
            >
              {hud.phase === 'night' ? <Moon size={16} color="#818CF8" /> : <Sun size={16} color="#FACC15" />}
              <div style={{ fontSize: '0.78rem', fontWeight: 800 }}>
                <div style={{ textTransform: 'uppercase', color: hud.phase === 'night' ? '#A5B4FC' : '#FDE047' }}>
                  {hud.phase} {hud.phase === 'night' ? `• WAVE ${hud.nightWave}` : ''}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Compass size={11} /> {ZONE_LABELS[hud.zone] || hud.zone}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {hud.phase !== 'night' && (
                <button
                  type="button"
                  onClick={() => setSkipToNightSignal((n) => n + 1)}
                  style={{
                    padding: '7px 11px',
                    borderRadius: 10,
                    background: 'rgba(99,102,241,0.88)',
                    border: 'none',
                    color: '#FFF',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  🌙 Start Night Wave
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowBuildModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '7px 11px',
                  borderRadius: 10,
                  background: 'rgba(255,106,0,0.9)',
                  border: 'none',
                  color: '#FFF',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                <Hammer size={14} /> Build
              </button>
              <button
                type="button"
                onClick={() => setShowSquadPanel((s) => !s)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '7px 10px',
                  borderRadius: 10,
                  background: 'rgba(15,23,42,0.84)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  color: '#FFF',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
                title="Simulated AI Plaza Companions"
              >
                <Users size={14} />
              </button>
              <button
                type="button"
                onClick={toggleMute}
                style={{
                  padding: '7px 10px',
                  borderRadius: 10,
                  background: 'rgba(15,23,42,0.84)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  color: '#FFF',
                  cursor: 'pointer'
                }}
                aria-label="Toggle Sound"
              >
                {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                style={{
                  padding: '7px 10px',
                  borderRadius: 10,
                  background: 'rgba(15,23,42,0.84)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  color: '#FFF',
                  cursor: 'pointer'
                }}
                aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
              <button
                type="button"
                onClick={() => setScreen('paused')}
                style={{
                  padding: '7px 10px',
                  borderRadius: 10,
                  background: 'rgba(15,23,42,0.84)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  color: '#FFF',
                  cursor: 'pointer'
                }}
                aria-label="Pause Game"
              >
                <Pause size={15} />
              </button>
            </div>
          </div>

          {/* CENTER RETICLE + TARGET LOCK */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                border: hud.targetedShrineIndex !== null ? '2.5px solid #FACC15' : '2px solid rgba(255,255,255,0.75)',
                background: hud.targetedShrineIndex !== null ? 'rgba(250,204,21,0.35)' : 'transparent'
              }}
            />
            {hud.targetedOptionId && (
              <div style={{ background: 'rgba(255,106,0,0.92)', padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 900 }}>
                TARGET LOCKED: [{hud.targetedOptionId}] — Click to Cast!
              </div>
            )}
            {hud.nearbyPrompt && (
              <div style={{ background: 'rgba(16,185,129,0.92)', padding: '4px 12px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 800 }}>
                {hud.nearbyPrompt}
              </div>
            )}
          </div>

          {/* SIMULATED AI PLAZA SQUAD PANEL */}
          {showSquadPanel && (
            <div
              style={{
                position: 'absolute',
                top: 108,
                right: 12,
                width: 250,
                background: 'rgba(15,23,42,0.92)',
                border: '1px solid rgba(56,189,248,0.4)',
                borderRadius: 14,
                padding: 12
              }}
            >
              <div style={{ fontSize: '0.74rem', fontWeight: 900, color: '#38BDF8', marginBottom: 6 }}>
                SIMULATED AI EVENT SQUAD
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginBottom: 8 }}>
                Offline simulated AI companions assisting your village (not live human players).
              </div>
              {SIMULATED_PLAZA_SQUAD.map((p) => (
                <div key={p.id} style={{ padding: '6px 8px', borderRadius: 8, background: 'rgba(30,41,59,0.75)', marginBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', fontWeight: 800 }}>
                    <span>{p.name}</span>
                    <span style={{ color: '#FDBA74' }}>[SIMULATED AI]</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#CBD5E1' }}>{p.role} • {p.status}</div>
                </div>
              ))}
            </div>
          )}

          {/* FEEDBACK TOAST */}
          {feedbackBanner && (
            <div
              style={{
                position: 'absolute',
                bottom: 92,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'min(520px, calc(100vw - 32px))',
                background: feedbackBanner.isCorrect ? 'rgba(6,78,59,0.94)' : 'rgba(30,58,138,0.94)',
                border: `1.5px solid ${feedbackBanner.isCorrect ? '#34D399' : '#60A5FA'}`,
                borderRadius: 14,
                padding: '10px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 10
              }}
            >
              <div>
                <div style={{ fontWeight: 900, fontSize: '0.84rem', marginBottom: 2 }}>{feedbackBanner.title}</div>
                <div style={{ fontSize: '0.78rem', color: '#E2E8F0', lineHeight: 1.35 }}>{feedbackBanner.detail}</div>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackBanner(null)}
                style={{ background: 'transparent', border: 'none', color: '#CBD5E1', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* BOTTOM QUICK-CAST SHRINE BAR + CONTROLS HINT */}
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              width: 'min(680px, calc(100vw - 24px))'
            }}
          >
            <div style={{ display: 'flex', gap: 8, width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
              {hud.shrineOptions.map((opt, idx) => (
                <button
                  key={`${opt.id}-${idx}`}
                  type="button"
                  onClick={() => setQuickCastSignal({ index: idx, seq: Date.now() })}
                  style={{
                    flex: '1 1 160px',
                    maxWidth: 215,
                    padding: '9px 12px',
                    borderRadius: 12,
                    background: hud.targetedShrineIndex === idx ? '#FF6A00' : 'rgba(15,23,42,0.88)',
                    border: hud.targetedShrineIndex === idx ? '2px solid #FEF08A' : '1.5px solid rgba(56,189,248,0.55)',
                    color: '#FFF',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <span style={{ padding: '2px 7px', borderRadius: 6, background: 'rgba(255,255,255,0.16)', fontSize: '0.72rem' }}>
                    {idx + 1}
                  </span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <strong>{opt.id}:</strong> {opt.text}
                  </span>
                </button>
              ))}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#CBD5E1', background: 'rgba(15,23,42,0.72)', padding: '3px 10px', borderRadius: 99 }}>
              WASD Move • Space Jump • Drag/Dbl-Click Look • Left-Click or [1][2][3] Cast Magic • E Interact • Esc Pause
            </div>
          </div>

          {/* MOBILE & TABLET VIRTUAL MOVEMENT PAD (bottom-left) */}
          <div
            style={{
              position: 'absolute',
              bottom: 92,
              left: 14,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 38px)',
              gridTemplateRows: 'repeat(2, 38px)',
              gap: 4
            }}
          >
            <div />
            <button
              type="button"
              onTouchStart={() => { mobileInputRef.current.moveY = -1; }}
              onTouchEnd={() => { mobileInputRef.current.moveY = 0; }}
              onMouseDown={() => { mobileInputRef.current.moveY = -1; }}
              onMouseUp={() => { mobileInputRef.current.moveY = 0; }}
              style={{ borderRadius: 10, background: 'rgba(15,23,42,0.82)', border: '1px solid rgba(255,255,255,0.22)', color: '#FFF', fontWeight: 900, cursor: 'pointer' }}
              aria-label="Move Forward"
            >
              ▲
            </button>
            <div />
            <button
              type="button"
              onTouchStart={() => { mobileInputRef.current.moveX = -1; }}
              onTouchEnd={() => { mobileInputRef.current.moveX = 0; }}
              onMouseDown={() => { mobileInputRef.current.moveX = -1; }}
              onMouseUp={() => { mobileInputRef.current.moveX = 0; }}
              style={{ borderRadius: 10, background: 'rgba(15,23,42,0.82)', border: '1px solid rgba(255,255,255,0.22)', color: '#FFF', fontWeight: 900, cursor: 'pointer' }}
              aria-label="Move Left"
            >
              ◀
            </button>
            <button
              type="button"
              onTouchStart={() => { mobileInputRef.current.moveY = 1; }}
              onTouchEnd={() => { mobileInputRef.current.moveY = 0; }}
              onMouseDown={() => { mobileInputRef.current.moveY = 1; }}
              onMouseUp={() => { mobileInputRef.current.moveY = 0; }}
              style={{ borderRadius: 10, background: 'rgba(15,23,42,0.82)', border: '1px solid rgba(255,255,255,0.22)', color: '#FFF', fontWeight: 900, cursor: 'pointer' }}
              aria-label="Move Backward"
            >
              ▼
            </button>
            <button
              type="button"
              onTouchStart={() => { mobileInputRef.current.moveX = 1; }}
              onTouchEnd={() => { mobileInputRef.current.moveX = 0; }}
              onMouseDown={() => { mobileInputRef.current.moveX = 1; }}
              onMouseUp={() => { mobileInputRef.current.moveX = 0; }}
              style={{ borderRadius: 10, background: 'rgba(15,23,42,0.82)', border: '1px solid rgba(255,255,255,0.22)', color: '#FFF', fontWeight: 900, cursor: 'pointer' }}
              aria-label="Move Right"
            >
              ▶
            </button>
          </div>

          {/* MOBILE TOUCH ACTION BUTTONS (bottom-right) */}
          <div
            style={{
              position: 'absolute',
              bottom: 92,
              right: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}
          >
            <button
              type="button"
              onTouchStart={() => { mobileInputRef.current.jump = true; }}
              onClick={() => { mobileInputRef.current.jump = true; }}
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(255,106,0,0.82)',
                border: '1.5px solid #FFF',
                color: '#FFF',
                fontWeight: 900,
                fontSize: '0.7rem',
                cursor: 'pointer'
              }}
            >
              JUMP
            </button>
            <button
              type="button"
              onTouchStart={() => { mobileInputRef.current.interact = true; }}
              onClick={() => { mobileInputRef.current.interact = true; }}
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(16,185,129,0.85)',
                border: '1.5px solid #FFF',
                color: '#FFF',
                fontWeight: 900,
                fontSize: '0.7rem',
                cursor: 'pointer'
              }}
            >
              USE
            </button>
          </div>
        </div>
      )}

      {/* ==================== PAUSE OVERLAY ==================== */}
      {screen === 'paused' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(9,13,31,0.78)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 30
          }}
        >
          <div style={{ width: 'min(420px, 92vw)', background: '#0F172A', border: '1.5px solid #FF6A00', borderRadius: 22, padding: 24, textAlign: 'center' }}>
            <h2 style={{ margin: '0 0 8px 0', fontWeight: 900 }}>Adventure Paused</h2>
            <p style={{ margin: '0 0 20px 0', color: '#94A3B8', fontSize: '0.86rem' }}>
              Score: {score} pts • Nights Survived: {nightsSurvived} • Accuracy: {questionsAnswered ? Math.round((correctAnswers / questionsAnswered) * 100) : 0}%
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                onClick={() => setScreen('playing')}
                style={{ padding: 12, borderRadius: 12, background: '#FF6A00', border: 'none', color: '#FFF', fontWeight: 900, cursor: 'pointer' }}
              >
                Resume Survival
              </button>
              <button
                type="button"
                onClick={() => { setShowBuildModal(true); }}
                style={{ padding: 12, borderRadius: 12, background: '#1E293B', border: '1px solid #334155', color: '#FFF', fontWeight: 800, cursor: 'pointer' }}
              >
                Village Build & Upgrades
              </button>
              <button
                type="button"
                onClick={() => finishRun(nightsSurvived >= 1)}
                style={{ padding: 12, borderRadius: 12, background: 'rgba(239,68,68,0.18)', border: '1px solid #EF4444', color: '#FCA5A5', fontWeight: 800, cursor: 'pointer' }}
              >
                End Run & Save Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== VILLAGE BUILD / UPGRADE MODAL ==================== */}
      {showBuildModal && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(9,13,31,0.78)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 40,
            padding: 16
          }}
        >
          <div style={{ width: 'min(560px, 95vw)', background: '#0F172A', border: '1.5px solid #FF6A00', borderRadius: 22, padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Hammer size={18} color="#FF6A00" /> Survival Village Upgrades
              </h3>
              <button type="button" onClick={() => setShowBuildModal(false)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#CBD5E1', marginBottom: 14 }}>
              Inventory: 🪵 {resources.wood} Wood • 🪨 {resources.stone} Stone • 💎 {resources.crystal} Crystal • 🔮 {resources.knowledgeOrbs} Orbs
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
              {[
                { key: 'wallLevel' as const, name: 'Perimeter Walls', lvl: upgrades.wallLevel, cost: '2 Wood, 2 Stone', benefit: 'Reduces gate damage & +20% Gate HP' },
                { key: 'towerLevel' as const, name: 'Arcane Watchtower', lvl: upgrades.towerLevel, cost: '3 Stone, 1 Crystal', benefit: 'Auto-fires bolts at night enemies' },
                { key: 'lanternLevel' as const, name: 'Village Lanterns', lvl: upgrades.lanternLevel, cost: '2 Wood, 1 Crystal', benefit: 'Brightens perimeter during night waves' },
                { key: 'libraryLevel' as const, name: 'Study Library', lvl: upgrades.libraryLevel, cost: '2 Wood, 2 Orbs', benefit: '+15 Magic Bolt damage per level' }
              ].map((item) => (
                <div key={item.key} style={{ background: '#1E293B', borderRadius: 14, padding: 12, border: '1px solid #334155' }}>
                  <div style={{ fontWeight: 900, fontSize: '0.88rem' }}>{item.name} (Lv.{item.lvl})</div>
                  <div style={{ fontSize: '0.74rem', color: '#94A3B8', margin: '4px 0 8px 0' }}>{item.benefit}</div>
                  <button
                    type="button"
                    onClick={() => performUpgrade(item.key)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 10, background: '#FF6A00', border: 'none', color: '#FFF', fontWeight: 800, fontSize: '0.76rem', cursor: 'pointer' }}
                  >
                    Upgrade ({item.cost})
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== CHARACTER CUSTOMIZATION MODAL ==================== */}
      {showCustomize && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(9,13,31,0.82)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: 16
          }}
        >
          <div style={{ width: 'min(480px, 95vw)', background: '#0F172A', border: '1.5px solid #FF6A00', borderRadius: 22, padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontWeight: 900 }}>Customize Your Voxel Hero</h3>
              <button type="button" onClick={() => setShowCustomize(false)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#FDBA74' }}>HAT / HELMET</label>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  {(['none', 'wizard', 'helmet', 'crown'] as HatStyle[]).map((hat) => (
                    <button
                      key={hat}
                      type="button"
                      onClick={() => setCustomization((c) => ({ ...c, hatStyle: hat }))}
                      style={{
                        flex: 1,
                        padding: '8px 6px',
                        borderRadius: 10,
                        background: customization.hatStyle === hat ? '#FF6A00' : '#1E293B',
                        border: 'none',
                        color: '#FFF',
                        fontWeight: 800,
                        textTransform: 'capitalize',
                        cursor: 'pointer'
                      }}
                    >
                      {hat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#FDBA74' }}>COMPANION PET</label>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  {(['owl', 'fox', 'golem', 'none'] as CompanionType[]).map((pet) => (
                    <button
                      key={pet}
                      type="button"
                      onClick={() => setCustomization((c) => ({ ...c, companion: pet }))}
                      style={{
                        flex: 1,
                        padding: '8px 6px',
                        borderRadius: 10,
                        background: customization.companion === pet ? '#FF6A00' : '#1E293B',
                        border: 'none',
                        color: '#FFF',
                        fontWeight: 800,
                        textTransform: 'capitalize',
                        cursor: 'pointer'
                      }}
                    >
                      {pet}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 14 }}>
                <label style={{ flex: 1, fontSize: '0.74rem', fontWeight: 800, color: '#FDBA74' }}>
                  TUNIC COLOR
                  <input
                    type="color"
                    value={customization.shirtColor}
                    onChange={(e) => setCustomization((c) => ({ ...c, shirtColor: e.target.value }))}
                    style={{ display: 'block', width: '100%', height: 38, marginTop: 4, borderRadius: 8, border: 'none' }}
                  />
                </label>
                <label style={{ flex: 1, fontSize: '0.74rem', fontWeight: 800, color: '#FDBA74' }}>
                  CAPE COLOR
                  <input
                    type="color"
                    value={customization.capeColor}
                    onChange={(e) => setCustomization((c) => ({ ...c, capeColor: e.target.value }))}
                    style={{ display: 'block', width: '100%', height: 38, marginTop: 4, borderRadius: 8, border: 'none' }}
                  />
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowCustomize(false)}
              style={{ width: '100%', marginTop: 18, padding: 12, borderRadius: 12, background: '#FF6A00', border: 'none', color: '#FFF', fontWeight: 900, cursor: 'pointer' }}
            >
              Save Hero Look
            </button>
          </div>
        </div>
      )}

      {/* ==================== RESULTS SCREEN ==================== */}
      {screen === 'results' && sessionSummary && (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 16px',
            background: 'linear-gradient(160deg, #090D1F 0%, #111936 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{ width: 'min(720px, 100%)', background: '#0F172A', border: '1.5px solid #FF6A00', borderRadius: 24, padding: 26 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <Trophy size={32} color="#FACC15" />
              <div>
                <h2 style={{ margin: 0, fontWeight: 900 }}>
                  {sessionSummary.victory ? 'Survival Village Legend!' : 'Nightfall Report'}
                </h2>
                <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.86rem' }}>
                  {sessionSummary.subject} • Grade {sessionSummary.grade} • {sessionSummary.difficulty.toUpperCase()}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 18 }}>
              {[
                { label: 'Score', val: `${sessionSummary.score} pts` },
                { label: 'XP Earned', val: `+${sessionSummary.xpEarned} XP` },
                { label: 'Accuracy', val: `${sessionSummary.accuracy}%` },
                { label: 'Nights Survived', val: `${sessionSummary.nightsSurvived}` }
              ].map((stat) => (
                <div key={stat.label} style={{ background: '#1E293B', borderRadius: 14, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 800 }}>{stat.label}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#FDBA74' }}>{stat.val}</div>
                </div>
              ))}
            </div>

            {sessionSummary.unlockedAchievements.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FACC15', marginBottom: 6 }}>UNLOCKED ACHIEVEMENTS</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {sessionSummary.unlockedAchievements.map((a) => (
                    <span key={a.id} style={{ padding: '6px 12px', borderRadius: 99, background: 'rgba(250,204,21,0.14)', border: '1px solid rgba(250,204,21,0.4)', fontSize: '0.78rem', fontWeight: 800 }}>
                      {a.icon} {a.title}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {sessionSummary.weakTopics.length > 0 && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: 14, padding: 14, marginBottom: 16 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#FCA5A5', marginBottom: 6 }}>
                  RECOMMENDED REVISION TOPICS
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  {sessionSummary.weakTopics.map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate(`/notes?topic=${encodeURIComponent(topic)}`);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        borderRadius: 99,
                        background: '#1E293B',
                        border: '1px solid #FF6A00',
                        color: '#FFF',
                        fontSize: '0.76rem',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      <BookOpen size={13} /> Review "{topic}" in Notes
                    </button>
                  ))}
                </div>
              </div>
            )}

            {savedNotice && (
              <div style={{ fontSize: '0.8rem', color: '#34D399', fontWeight: 800, marginBottom: 14 }}>
                ✅ {savedNotice}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleExitGame}
                style={{ padding: '11px 18px', borderRadius: 12, background: '#1E293B', border: '1px solid #334155', color: '#FFF', fontWeight: 800, cursor: 'pointer' }}
              >
                Exit Game
              </button>
              <button
                type="button"
                onClick={startNewRun}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 12, background: '#FF6A00', border: 'none', color: '#FFF', fontWeight: 900, cursor: 'pointer' }}
              >
                <RotateCcw size={16} /> Play Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
