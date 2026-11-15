import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Award,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Lock,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Settings,
  Shield,
  Sliders,
  Sparkles,
  Swords,
  Trophy,
  User,
  Volume2,
  VolumeX,
  X,
  Zap
} from 'lucide-react';
import { useLearning } from '../../context/LearningContext';
import { WarOfWordsAudioManager } from '../../games/warOfWords/AudioManager';
import { buildWarOfWordsDeck } from '../../games/warOfWords/questionBank';
import {
  AnswerOutcome,
  AudioSettings,
  DEFAULT_AUDIO_SETTINGS,
  DEFAULT_WARRIOR_CUSTOMIZATION,
  DifficultyLevel,
  EnglishCategory,
  GameModeId,
  GraphicsQuality,
  HelmStyle,
  WarriorCustomization,
  WarOfWordsSessionSummary,
  WarWordQuestion,
  WorldId
} from '../../games/warOfWords/types';
import { WarHudSnapshot, WarOfWordsCanvas } from '../../games/warOfWords/WarOfWordsCanvas';
import { enterElementFullscreen, exitBrowserFullscreen, isBrowserFullscreenActive } from '../../utils/fullscreenGame';

export interface WarOfWordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
  initialLanguage?: string;
  learningObjective?: string;
  difficulty?: DifficultyLevel;
}

const CATEGORIES: EnglishCategory[] = [
  'All Categories',
  'Vocabulary Quest',
  'Synonym Battle',
  'Antonym Battle',
  'Missing Word',
  'Spelling Challenge',
  'Grammar Battle',
  'Sentence Formation',
  'Idioms & Phrases',
  'Picture Word Quest'
];

const WORLDS: Array<{ id: WorldId; name: string; subtitle: string }> = [
  { id: 'moonlight_valley', name: '1. Moonlight Valley', subtitle: 'Ancient stone bridges & glowing moon' },
  { id: 'shadow_forest', name: '2. Shadow Forest', subtitle: 'Foggy pathways & glowing flora' },
  { id: 'ancient_kingdom', name: '3. Ancient Kingdom', subtitle: 'Medieval castles & libraries' },
  { id: 'crystal_caverns', name: '4. Crystal Caverns', subtitle: 'Underground rivers & blue crystals' },
  { id: 'sky_of_knowledge', name: '5. Sky of Knowledge', subtitle: 'Floating islands & starry bridges' }
];

const GAME_MODES: Array<{ id: GameModeId; label: string; desc: string }> = [
  { id: 'word_quest', label: 'Word Quest', desc: 'Vocabulary & meanings' },
  { id: 'synonym_battle', label: 'Synonym Battle', desc: 'Similar-meaning words' },
  { id: 'antonym_battle', label: 'Antonym Battle', desc: 'Opposite-meaning words' },
  { id: 'grammar_challenge', label: 'Grammar Challenge', desc: 'Verbs, parts of speech & rules' },
  { id: 'spelling_arena', label: 'Spelling Arena', desc: 'Spot the exact spelling' },
  { id: 'sentence_master', label: 'Sentence Master', desc: 'Clauses & sentence formation' },
  { id: 'time_challenge', label: 'Time Challenge', desc: 'Beat the 90s clock' },
  { id: 'shadow_boss', label: 'Shadow Boss Battle', desc: '12-question gauntlet' },
  { id: 'revision_mode', label: 'Revision Mode', desc: 'Replay missed questions' }
];

const MISSED_STORAGE_KEY = 'studyai_war_of_words_missed_v1';
const UNLOCKED_WORLDS_KEY = 'studyai_war_of_words_worlds_v1';

export const WarOfWordsModal: React.FC<WarOfWordsModalProps> = ({
  isOpen,
  onClose,
  initialTopic,
  learningObjective,
  difficulty: propDifficulty
}) => {
  const { activeProfile, apiFetch, triggerRefresh } = useLearning();
  const audioManager = useMemo(() => new WarOfWordsAudioManager(), []);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [screen, setScreen] = useState<'menu' | 'playing' | 'paused' | 'results'>('menu');
  const [mode, setMode] = useState<GameModeId>('word_quest');
  const [category, setCategory] = useState<EnglishCategory>('All Categories');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(propDifficulty || 'medium');
  const [grade, setGrade] = useState<number>(activeProfile?.grade || 8);
  const [worldId, setWorldId] = useState<WorldId>('moonlight_valley');
  const [quality, setQuality] = useState<GraphicsQuality>('medium');
  const [customization, setCustomization] = useState<WarriorCustomization>(DEFAULT_WARRIOR_CUSTOMIZATION);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(DEFAULT_AUDIO_SETTINGS);

  const [showCustomize, setShowCustomize] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [unlockedWorlds, setUnlockedWorlds] = useState<WorldId[]>(() => {
    try {
      const raw = localStorage.getItem(UNLOCKED_WORLDS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return ['moonlight_valley'];
  });

  const [savedMissed, setSavedMissed] = useState<WarWordQuestion[]>(() => {
    try {
      const raw = localStorage.getItem(MISSED_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return [];
  });

  // Active Run State
  const [deck, setDeck] = useState<WarWordQuestion[]>(() =>
    buildWarOfWordsDeck('word_quest', 'All Categories', 'medium', 8)
  );
  const [qIndex, setQIndex] = useState(0);
  const [knowledgePoints, setKnowledgePoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [wordsLearned, setWordsLearned] = useState<string[]>([]);
  const [runMissed, setRunMissed] = useState<WarWordQuestion[]>([]);
  const [learningPanel, setLearningPanel] = useState<AnswerOutcome | null>(null);
  const [hintBanner, setHintBanner] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(90);
  const [summary, setSummary] = useState<WarOfWordsSessionSummary | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const [attackSignal, setAttackSignal] = useState(0);
  const [selectNearestSignal, setSelectNearestSignal] = useState(0);
  const [specialSignal, setSpecialSignal] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  const mobileInputRef = useRef({ moveX: 0, jump: false });

  const [hud, setHud] = useState<WarHudSnapshot>({
    selectedTargetIndex: null,
    selectedOptionId: null,
    selectedOptionText: null,
    inAttackRange: false,
    playerX: -7,
    targets: []
  });

  const currentQuestion = deck[qIndex];

  useEffect(() => {
    audioManager.updateSettings(audioSettings);
  }, [audioSettings, audioManager]);

  useEffect(() => {
    if (!isOpen) {
      audioManager.stopAmbience();
      exitBrowserFullscreen();
      return;
    }
    const obj = (learningObjective || initialTopic || '').toLowerCase();
    if (obj.includes('synonym')) {
      setMode('synonym_battle');
      setCategory('Synonym Battle');
    } else if (obj.includes('antonym')) {
      setMode('antonym_battle');
      setCategory('Antonym Battle');
    } else if (obj.includes('grammar')) {
      setMode('grammar_challenge');
      setCategory('Grammar Battle');
    } else if (obj.includes('idiom')) {
      setMode('word_quest');
      setCategory('Idioms & Phrases');
    } else if (obj.includes('sentence')) {
      setMode('sentence_master');
      setCategory('Sentence Formation');
    } else if (obj.includes('spelling')) {
      setMode('spelling_arena');
      setCategory('Spelling Challenge');
    }
    if (propDifficulty) setDifficulty(propDifficulty);
  }, [isOpen, audioManager, initialTopic, learningObjective, propDifficulty]);

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
    audioManager.stopAmbience();
    await exitBrowserFullscreen();
    onClose();
  };

  const completeRun = useCallback(
    async (
      finalCorrect: number,
      finalIncorrect: number,
      finalPoints: number,
      finalBestStreak: number,
      finalWords: string[],
      finalMissed: WarWordQuestion[]
    ) => {
      audioManager.stopAmbience();
      audioManager.playLevelComplete();

      const total = Math.max(1, finalCorrect + finalIncorrect);
      const accuracy = Math.round((finalCorrect / total) * 100);
      const durationSeconds = Math.max(8, Math.round((Date.now() - startTimeRef.current) / 1000));
      const worldCompleted = accuracy >= 60 && total >= 3;

      if (worldCompleted && worldId === 'moonlight_valley') {
        const nextUnlocked: WorldId[] = [
          'moonlight_valley',
          'shadow_forest',
          'ancient_kingdom',
          'crystal_caverns',
          'sky_of_knowledge'
        ];
        setUnlockedWorlds(nextUnlocked);
        try {
          localStorage.setItem(UNLOCKED_WORLDS_KEY, JSON.stringify(nextUnlocked));
        } catch {
          // ignore
        }
      }

      // Persist missed questions locally for Revision Mode
      if (finalMissed.length > 0) {
        const merged = [...finalMissed, ...savedMissed].filter(
          (q, idx, arr) => arr.findIndex((x) => x.id === q.id) === idx
        ).slice(0, 30);
        setSavedMissed(merged);
        try {
          localStorage.setItem(MISSED_STORAGE_KEY, JSON.stringify(merged));
        } catch {
          // ignore
        }
      }

      const sum: WarOfWordsSessionSummary = {
        mode,
        worldId,
        category,
        difficulty,
        grade,
        totalQuestions: total,
        correctAnswers: finalCorrect,
        incorrectAnswers: finalIncorrect,
        accuracy,
        knowledgePoints: finalPoints,
        bestStreak: finalBestStreak,
        durationSeconds,
        wordsLearned: Array.from(new Set(finalWords)),
        missedQuestions: finalMissed,
        worldCompleted
      };
      setSummary(sum);
      setScreen('results');

      try {
        const res = await apiFetch('/api/educational-games/war-of-words/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...sum,
            missedQuestionTopics: finalMissed.map((m) => m.topic)
          })
        });
        if (res.ok) {
          setSavedNotice('Progress & vocabulary saved to AI Tutor Academy!');
          triggerRefresh();
        }
      } catch {
        setSavedNotice('Session saved locally.');
      }
    },
    [apiFetch, audioManager, category, difficulty, grade, mode, savedMissed, triggerRefresh, worldId]
  );

  // Time Challenge countdown
  useEffect(() => {
    if (screen !== 'playing' || mode !== 'time_challenge' || learningPanel) return;
    const id = window.setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          completeRun(correctCount, incorrectCount, knowledgePoints, bestStreak, wordsLearned, runMissed);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [screen, mode, learningPanel, correctCount, incorrectCount, knowledgePoints, bestStreak, wordsLearned, runMissed, completeRun]);

  const startBattle = (overrideMode?: GameModeId) => {
    const chosenMode = overrideMode || mode;
    setMode(chosenMode);
    audioManager.unlock();
    audioManager.startAmbience();

    const newDeck = buildWarOfWordsDeck(chosenMode, category, difficulty, grade, savedMissed);
    setDeck(newDeck);
    setQIndex(0);
    setKnowledgePoints(0);
    setStreak(0);
    setBestStreak(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setWordsLearned([]);
    setRunMissed([]);
    setLearningPanel(null);
    setHintBanner(null);
    setTimeRemaining(90);
    setSummary(null);
    setSavedNotice(null);
    startTimeRef.current = Date.now();
    setScreen('playing');
    enterElementFullscreen(rootRef.current).then((ok) => setIsFullscreen(ok));
  };

  const handleAnswerEvaluated = useCallback((outcome: AnswerOutcome) => {
    setLearningPanel(outcome);
    if (outcome.isCorrect) {
      setCorrectCount((c) => c + 1);
      setKnowledgePoints((kp) => kp + outcome.pointsAwarded);
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
      setWordsLearned((w) => [...w, outcome.question.targetWord]);
    } else {
      setIncorrectCount((ic) => ic + 1);
      setStreak(0);
      setRunMissed((m) => [...m, outcome.question]);
    }
  }, []);

  const advanceToNextQuestion = () => {
    setLearningPanel(null);
    setHintBanner(null);
    if (qIndex + 1 >= deck.length) {
      completeRun(correctCount, incorrectCount, knowledgePoints, bestStreak, wordsLearned, runMissed);
    } else {
      setQIndex((i) => i + 1);
    }
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
        background: '#050814',
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
            padding: '22px 16px',
            background: 'radial-gradient(circle at 80% 15%, rgba(34,211,238,0.18), transparent 45%), linear-gradient(160deg, #050814 0%, #0B142C 55%, #121B3A 100%)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 960,
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1.5px solid rgba(34, 211, 238, 0.45)',
              borderRadius: 24,
              padding: '26px 24px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 18 }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 999, background: 'rgba(34,211,238,0.14)', border: '1px solid #22D3EE', color: '#67E8F9', fontSize: '0.74rem', fontWeight: 900, marginBottom: 8 }}>
                  <Swords size={14} /> STUDY RUSH 3D • SHADOW WARRIOR: THE LANGUAGE BATTLE
                </div>
                <h1 style={{ fontSize: 'clamp(1.7rem, 3.8vw, 2.5rem)', fontWeight: 900, margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
                  WAR OF WORDS
                </h1>
                <p style={{ margin: 0, color: '#94A3B8', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.07em' }}>
                  THINK FAST. CHOOSE THE WORD. MASTER THE BATTLE.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExitGame}
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', color: '#E2E8F0', borderRadius: 12, padding: 8, cursor: 'pointer' }}
                aria-label="Close War of Words"
              >
                <X size={20} />
              </button>
            </div>

            {/* Grade, Difficulty, Category */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12, marginBottom: 16 }}>
              <div style={{ background: 'rgba(30,41,59,0.75)', padding: 12, borderRadius: 14, border: '1px solid rgba(148,163,184,0.2)' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#67E8F9', marginBottom: 6 }}>CHALLENGE CATEGORY</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as EnglishCategory)}
                  style={{ width: '100%', padding: '9px 10px', borderRadius: 10, background: '#0F172A', color: '#FFF', border: '1px solid #334155', fontWeight: 700 }}
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={{ background: 'rgba(30,41,59,0.75)', padding: 12, borderRadius: 14, border: '1px solid rgba(148,163,184,0.2)' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#67E8F9', marginBottom: 6 }}>DIFFICULTY</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      style={{
                        flex: 1,
                        padding: '8px 4px',
                        borderRadius: 9,
                        border: difficulty === d ? '1.5px solid #22D3EE' : '1px solid #334155',
                        background: difficulty === d ? '#0891B2' : '#0F172A',
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

              <div style={{ background: 'rgba(30,41,59,0.75)', padding: 12, borderRadius: 14, border: '1px solid rgba(148,163,184,0.2)' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#67E8F9', marginBottom: 6 }}>GRADE LEVEL: {grade}</label>
                <input
                  type="range"
                  min={5}
                  max={10}
                  value={grade}
                  onChange={(e) => setGrade(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#22D3EE', marginTop: 8 }}
                />
              </div>
            </div>

            {/* Game Modes */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 900, color: '#67E8F9', marginBottom: 8 }}>SELECT GAME MODE</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 8 }}>
                {GAME_MODES.map((m) => {
                  const isRevisionDisabled = m.id === 'revision_mode' && savedMissed.length === 0;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      disabled={isRevisionDisabled}
                      onClick={() => setMode(m.id)}
                      style={{
                        padding: '9px 11px',
                        borderRadius: 12,
                        textAlign: 'left',
                        background: mode === m.id ? 'rgba(34,211,238,0.18)' : 'rgba(15,23,42,0.78)',
                        border: mode === m.id ? '1.5px solid #22D3EE' : '1px solid #334155',
                        color: isRevisionDisabled ? '#64748B' : '#F8FAFC',
                        cursor: isRevisionDisabled ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: '0.8rem' }}>{m.label}</div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                        {m.id === 'revision_mode' ? `${savedMissed.length} missed saved` : m.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* World Selection */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 900, color: '#67E8F9', marginBottom: 8 }}>WORLD SELECTION</div>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {WORLDS.map((w) => {
                  const locked = !unlockedWorlds.includes(w.id);
                  return (
                    <button
                      key={w.id}
                      type="button"
                      disabled={locked}
                      onClick={() => setWorldId(w.id)}
                      style={{
                        flex: '1 0 165px',
                        padding: '10px 12px',
                        borderRadius: 12,
                        textAlign: 'left',
                        background: worldId === w.id ? 'rgba(34,211,238,0.16)' : '#0F172A',
                        border: worldId === w.id ? '1.5px solid #22D3EE' : '1px solid #334155',
                        color: locked ? '#64748B' : '#F8FAFC',
                        cursor: locked ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800, fontSize: '0.8rem' }}>
                        <span>{w.name}</span>
                        {locked && <Lock size={13} />}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: 2 }}>{w.subtitle}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setShowCustomize(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 16px', borderRadius: 12, background: '#1E293B', border: '1px solid #334155', color: '#FFF', fontWeight: 800, cursor: 'pointer' }}
                >
                  <User size={16} /> Customize Warrior
                </button>
                <button
                  type="button"
                  onClick={() => setShowSettings(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 16px', borderRadius: 12, background: '#1E293B', border: '1px solid #334155', color: '#FFF', fontWeight: 800, cursor: 'pointer' }}
                >
                  <Settings size={16} /> Audio & Graphics ({quality})
                </button>
              </div>

              <button
                type="button"
                onClick={() => startBattle()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '13px 28px',
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #06B6D4 0%, #2563EB 100%)',
                  border: 'none',
                  color: '#FFF',
                  fontSize: '1rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 10px 28px rgba(6,182,212,0.38)'
                }}
              >
                <Play size={19} fill="#FFF" /> Enter Moonlight Battle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 2.5D GAMEPLAY VIEWPORT + HUD ==================== */}
      {(screen === 'playing' || screen === 'paused') && currentQuestion && (
        <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
          <WarOfWordsCanvas
            paused={screen === 'paused' || Boolean(learningPanel) || showSettings}
            worldId={worldId}
            quality={quality}
            customization={customization}
            currentQuestion={currentQuestion}
            audioManager={audioManager}
            attackSignal={attackSignal}
            selectNearestSignal={selectNearestSignal}
            specialSignal={specialSignal}
            mobileInputRef={mobileInputRef}
            onHudUpdate={setHud}
            onAnswerEvaluated={handleAnswerEvaluated}
            onSpecialPulse={() => setHintBanner(`✨ Arcane Insight: ${currentQuestion.category} (${currentQuestion.vocabLevel}) — ${currentQuestion.topic}`)}
            onPauseRequested={() => setScreen((s) => (s === 'playing' ? 'paused' : 'playing'))}
          />

          {/* TOP-LEFT: Knowledge Points & Streak */}
          <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(15,23,42,0.86)', border: '1px solid rgba(34,211,238,0.35)', borderRadius: 14, padding: '9px 14px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#67E8F9' }}>⭐ {knowledgePoints} KP</div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#FDE047' }}>🔥 Streak: {streak}</div>
            {mode === 'time_challenge' && (
              <div style={{ fontSize: '0.76rem', fontWeight: 900, color: timeRemaining <= 15 ? '#FCA5A5' : '#A7F3D0', marginTop: 2 }}>
                ⏱️ {timeRemaining}s
              </div>
            )}
          </div>

          {/* TOP-CENTER: Question Panel (responsive for mobile & desktop) */}
          <div
            style={{
              position: 'absolute',
              top: typeof window !== 'undefined' && window.innerWidth < 820 ? 82 : 12,
              left: '50%',
              transform: 'translateX(-50%)',
              width: typeof window !== 'undefined' && window.innerWidth < 820 ? 'calc(100vw - 24px)' : 'min(560px, calc(100vw - 280px))',
              minWidth: 260,
              background: 'rgba(15,23,42,0.92)',
              border: '1.5px solid rgba(34,211,238,0.6)',
              borderRadius: 16,
              padding: '10px 14px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.45)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 900, color: '#67E8F9', marginBottom: 4 }}>
              <span>{currentQuestion.category} • Grade {currentQuestion.grade}</span>
              <span>Question {qIndex + 1} / {deck.length}</span>
            </div>
            <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#FFF', lineHeight: 1.35, display: 'flex', alignItems: 'center', gap: 10 }}>
              {currentQuestion.visualEmoji && <span style={{ fontSize: '1.8rem' }}>{currentQuestion.visualEmoji}</span>}
              <span>{currentQuestion.prompt}</span>
            </div>
            {hintBanner && (
              <div style={{ marginTop: 6, fontSize: '0.75rem', color: '#67E8F9', fontWeight: 700 }}>{hintBanner}</div>
            )}
          </div>

          {/* TOP-RIGHT: Fullscreen, Sound & Pause */}
          <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={toggleFullscreen}
              style={{ padding: 9, borderRadius: 11, background: 'rgba(15,23,42,0.86)', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', cursor: 'pointer' }}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button
              type="button"
              onClick={() => setAudioSettings((s) => ({ ...s, muted: !s.muted }))}
              style={{ padding: 9, borderRadius: 11, background: 'rgba(15,23,42,0.86)', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', cursor: 'pointer' }}
              aria-label="Mute Toggle"
            >
              {audioSettings.muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <button
              type="button"
              onClick={() => setScreen('paused')}
              style={{ padding: 9, borderRadius: 11, background: 'rgba(15,23,42,0.86)', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', cursor: 'pointer' }}
              aria-label="Pause Game"
            >
              <Pause size={16} />
            </button>
          </div>

          {/* BOTTOM TARGET & CONTROLS HUD */}
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
              width: 'min(640px, calc(100vw - 24px))'
            }}
          >
            {hud.selectedOptionId && (
              <div
                style={{
                  padding: '6px 14px',
                  borderRadius: 99,
                  background: hud.inAttackRange ? 'rgba(6,182,212,0.92)' : 'rgba(30,41,59,0.92)',
                  border: '1px solid #67E8F9',
                  fontSize: '0.8rem',
                  fontWeight: 900
                }}
              >
                Target [{hud.selectedOptionId}]: {hud.selectedOptionText} — {hud.inAttackRange ? 'IN RANGE! Click or Attack!' : 'Move closer to attack'}
              </div>
            )}
            <div style={{ fontSize: '0.7rem', color: '#CBD5E1', background: 'rgba(15,23,42,0.78)', padding: '4px 12px', borderRadius: 99 }}>
              A/D or Arrows Move • Space Jump • Shift Sprint • E Select • Left-Click Attack • Q Insight • Esc Pause
            </div>
          </div>

          {/* MOBILE & TOUCH CONTROLS */}
          <div style={{ position: 'absolute', bottom: 48, left: 14, display: 'flex', gap: 8 }}>
            <button
              type="button"
              onTouchStart={() => { mobileInputRef.current.moveX = -1; }}
              onTouchEnd={() => { mobileInputRef.current.moveX = 0; }}
              onMouseDown={() => { mobileInputRef.current.moveX = -1; }}
              onMouseUp={() => { mobileInputRef.current.moveX = 0; }}
              style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(15,23,42,0.84)', border: '1px solid #64748B', color: '#FFF', cursor: 'pointer' }}
              aria-label="Move Left"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onTouchStart={() => { mobileInputRef.current.moveX = 1; }}
              onTouchEnd={() => { mobileInputRef.current.moveX = 0; }}
              onMouseDown={() => { mobileInputRef.current.moveX = 1; }}
              onMouseUp={() => { mobileInputRef.current.moveX = 0; }}
              style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(15,23,42,0.84)', border: '1px solid #64748B', color: '#FFF', cursor: 'pointer' }}
              aria-label="Move Right"
            >
              <ChevronRight size={22} />
            </button>
          </div>

          <div style={{ position: 'absolute', bottom: 48, right: 14, display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => { mobileInputRef.current.jump = true; }}
              style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(30,41,59,0.9)', border: '1px solid #64748B', color: '#FFF', fontWeight: 800, fontSize: '0.74rem', cursor: 'pointer' }}
            >
              JUMP
            </button>
            <button
              type="button"
              onClick={() => setSelectNearestSignal((n) => n + 1)}
              style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(30,41,59,0.9)', border: '1px solid #64748B', color: '#FFF', fontWeight: 800, fontSize: '0.74rem', cursor: 'pointer' }}
            >
              SELECT
            </button>
            <button
              type="button"
              onClick={() => setSpecialSignal((n) => n + 1)}
              style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(14,116,144,0.9)', border: '1px solid #22D3EE', color: '#FFF', fontWeight: 800, fontSize: '0.74rem', cursor: 'pointer' }}
            >
              <Zap size={14} />
            </button>
            <button
              type="button"
              onClick={() => setAttackSignal((n) => n + 1)}
              style={{ padding: '10px 14px', borderRadius: 12, background: '#0891B2', border: '1.5px solid #67E8F9', color: '#FFF', fontWeight: 900, fontSize: '0.76rem', cursor: 'pointer' }}
            >
              ATTACK
            </button>
          </div>

          {/* EDUCATIONAL LEARNING FEEDBACK PANEL */}
          {learningPanel && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(5,8,20,0.76)',
                backdropFilter: 'blur(6px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 30,
                padding: 16
              }}
            >
              <div
                style={{
                  width: 'min(520px, 95vw)',
                  background: '#0F172A',
                  border: `2px solid ${learningPanel.isCorrect ? '#22D3EE' : '#F59E0B'}`,
                  borderRadius: 22,
                  padding: 22
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontWeight: 900, fontSize: '1rem', color: learningPanel.isCorrect ? '#22D3EE' : '#FBBF24' }}>
                    {learningPanel.isCorrect ? '✨ Arcane Strike! +100 Knowledge Points' : '🛡️ Shield Block! Learn & Continue'}
                  </span>
                  <button
                    type="button"
                    onClick={() => audioManager.pronounceWord(learningPanel.question.targetWord)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 99, background: 'rgba(34,211,238,0.14)', border: '1px solid #22D3EE', color: '#67E8F9', fontSize: '0.74rem', fontWeight: 800, cursor: 'pointer' }}
                  >
                    <Volume2 size={14} /> Pronounce
                  </button>
                </div>

                <div style={{ background: '#1E293B', borderRadius: 14, padding: 14, marginBottom: 14, fontSize: '0.86rem', lineHeight: 1.5 }}>
                  <div><strong>WORD:</strong> {learningPanel.question.targetWord} <span style={{ color: '#94A3B8' }}>({learningPanel.question.pronunciation})</span></div>
                  <div><strong>MEANING:</strong> {learningPanel.question.meaning}</div>
                  <div><strong>EXAMPLE:</strong> <em>"{learningPanel.question.exampleSentence}"</em></div>
                  <div style={{ marginTop: 6, color: '#CBD5E1' }}>{learningPanel.question.explanation}</div>
                </div>

                <button
                  type="button"
                  onClick={advanceToNextQuestion}
                  style={{ width: '100%', padding: 12, borderRadius: 12, background: '#0891B2', border: 'none', color: '#FFF', fontWeight: 900, fontSize: '0.92rem', cursor: 'pointer' }}
                >
                  {qIndex + 1 >= deck.length ? 'View Battle Results' : 'Continue to Next Challenge'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== PAUSE OVERLAY ==================== */}
      {screen === 'paused' && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,8,20,0.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40 }}>
          <div style={{ width: 'min(380px, 92vw)', background: '#0F172A', border: '1.5px solid #22D3EE', borderRadius: 20, padding: 22, textAlign: 'center' }}>
            <h2 style={{ margin: '0 0 8px 0', fontWeight: 900 }}>Battle Paused</h2>
            <p style={{ margin: '0 0 18px 0', color: '#94A3B8', fontSize: '0.84rem' }}>
              Knowledge Points: {knowledgePoints} • Streak: {streak}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button type="button" onClick={() => setScreen('playing')} style={{ padding: 11, borderRadius: 12, background: '#0891B2', border: 'none', color: '#FFF', fontWeight: 900, cursor: 'pointer' }}>Resume Battle</button>
              <button type="button" onClick={() => setShowSettings(true)} style={{ padding: 11, borderRadius: 12, background: '#1E293B', border: '1px solid #334155', color: '#FFF', fontWeight: 800, cursor: 'pointer' }}>Audio & Graphics Settings</button>
              <button type="button" onClick={() => completeRun(correctCount, incorrectCount, knowledgePoints, bestStreak, wordsLearned, runMissed)} style={{ padding: 11, borderRadius: 12, background: 'rgba(239,68,68,0.16)', border: '1px solid #EF4444', color: '#FCA5A5', fontWeight: 800, cursor: 'pointer' }}>End Battle & View Results</button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CHARACTER CUSTOMIZATION ==================== */}
      {showCustomize && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,8,20,0.84)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
          <div style={{ width: 'min(440px, 95vw)', background: '#0F172A', border: '1.5px solid #22D3EE', borderRadius: 20, padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontWeight: 900 }}>Shadow Warrior Customization</h3>
              <button type="button" onClick={() => setShowCustomize(false)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#67E8F9' }}>HELMET / HOOD</label>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  {(['hood', 'horned', 'crest'] as HelmStyle[]).map((h) => (
                    <button key={h} type="button" onClick={() => setCustomization((c) => ({ ...c, helmStyle: h }))} style={{ flex: 1, padding: 8, borderRadius: 10, background: customization.helmStyle === h ? '#0891B2' : '#1E293B', border: 'none', color: '#FFF', fontWeight: 800, textTransform: 'capitalize', cursor: 'pointer' }}>{h}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <label style={{ flex: 1, fontSize: '0.74rem', fontWeight: 800, color: '#67E8F9' }}>ARMOR<input type="color" value={customization.armorColor} onChange={(e) => setCustomization((c) => ({ ...c, armorColor: e.target.value }))} style={{ display: 'block', width: '100%', height: 36, marginTop: 4 }} /></label>
                <label style={{ flex: 1, fontSize: '0.74rem', fontWeight: 800, color: '#67E8F9' }}>CLOAK<input type="color" value={customization.cloakColor} onChange={(e) => setCustomization((c) => ({ ...c, cloakColor: e.target.value }))} style={{ display: 'block', width: '100%', height: 36, marginTop: 4 }} /></label>
                <label style={{ flex: 1, fontSize: '0.74rem', fontWeight: 800, color: '#67E8F9' }}>ARCANE GLOW<input type="color" value={customization.glowColor} onChange={(e) => setCustomization((c) => ({ ...c, glowColor: e.target.value }))} style={{ display: 'block', width: '100%', height: 36, marginTop: 4 }} /></label>
              </div>
            </div>
            <button type="button" onClick={() => setShowCustomize(false)} style={{ width: '100%', marginTop: 18, padding: 11, borderRadius: 12, background: '#0891B2', border: 'none', color: '#FFF', fontWeight: 900, cursor: 'pointer' }}>Save Warrior</button>
          </div>
        </div>
      )}

      {/* ==================== AUDIO & GRAPHICS SETTINGS ==================== */}
      {showSettings && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,8,20,0.84)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 55, padding: 16 }}>
          <div style={{ width: 'min(440px, 95vw)', background: '#0F172A', border: '1.5px solid #22D3EE', borderRadius: 20, padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8 }}><Sliders size={18} color="#22D3EE" /> Audio & Graphics</h3>
              <button type="button" onClick={() => setShowSettings(false)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#67E8F9' }}>GRAPHICS QUALITY</label>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  {(['low', 'medium', 'high'] as GraphicsQuality[]).map((q) => (
                    <button key={q} type="button" onClick={() => setQuality(q)} style={{ flex: 1, padding: 8, borderRadius: 10, background: quality === q ? '#0891B2' : '#1E293B', border: 'none', color: '#FFF', fontWeight: 800, textTransform: 'capitalize', cursor: 'pointer' }}>{q}</button>
                  ))}
                </div>
              </div>
              <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#67E8F9' }}>MASTER VOLUME ({Math.round(audioSettings.masterVolume * 100)}%)<input type="range" min={0} max={1} step={0.05} value={audioSettings.masterVolume} onChange={(e) => setAudioSettings((s) => ({ ...s, masterVolume: Number(e.target.value) }))} style={{ width: '100%', accentColor: '#22D3EE' }} /></label>
              <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#67E8F9' }}>MUSIC VOLUME ({Math.round(audioSettings.musicVolume * 100)}%)<input type="range" min={0} max={1} step={0.05} value={audioSettings.musicVolume} onChange={(e) => setAudioSettings((s) => ({ ...s, musicVolume: Number(e.target.value) }))} style={{ width: '100%', accentColor: '#22D3EE' }} /></label>
              <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#67E8F9' }}>SFX VOLUME ({Math.round(audioSettings.sfxVolume * 100)}%)<input type="range" min={0} max={1} step={0.05} value={audioSettings.sfxVolume} onChange={(e) => setAudioSettings((s) => ({ ...s, sfxVolume: Number(e.target.value) }))} style={{ width: '100%', accentColor: '#22D3EE' }} /></label>
            </div>
            <button type="button" onClick={() => setShowSettings(false)} style={{ width: '100%', marginTop: 18, padding: 11, borderRadius: 12, background: '#0891B2', border: 'none', color: '#FFF', fontWeight: 900, cursor: 'pointer' }}>Done</button>
          </div>
        </div>
      )}

      {/* ==================== RESULTS SCREEN ==================== */}
      {screen === 'results' && summary && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 16px', background: 'linear-gradient(160deg, #050814 0%, #0B142C 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 'min(700px, 100%)', background: '#0F172A', border: '1.5px solid #22D3EE', borderRadius: 24, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <Trophy size={30} color="#FACC15" />
              <div>
                <h2 style={{ margin: 0, fontWeight: 900 }}>{summary.worldCompleted ? 'Moonlight Battle Victory!' : 'Language Battle Summary'}</h2>
                <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.84rem' }}>{summary.category} • Grade {summary.grade} • {summary.difficulty.toUpperCase()}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'Knowledge Pts', val: summary.knowledgePoints },
                { label: 'Accuracy', val: `${summary.accuracy}%` },
                { label: 'Correct', val: `${summary.correctAnswers}/${summary.totalQuestions}` },
                { label: 'Best Streak', val: summary.bestStreak }
              ].map((st) => (
                <div key={st.label} style={{ background: '#1E293B', borderRadius: 12, padding: 11, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 800 }}>{st.label}</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#67E8F9' }}>{st.val}</div>
                </div>
              ))}
            </div>

            {summary.wordsLearned.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 900, color: '#67E8F9', marginBottom: 6 }}>NEW WORDS MASTERED</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {summary.wordsLearned.map((w) => (
                    <span key={w} style={{ padding: '4px 10px', borderRadius: 99, background: 'rgba(34,211,238,0.14)', border: '1px solid #22D3EE', fontSize: '0.76rem', fontWeight: 800 }}>{w}</span>
                  ))}
                </div>
              </div>
            )}

            {summary.missedQuestions.length > 0 && (
              <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: 14, padding: 12, marginBottom: 14 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#FBBF24', marginBottom: 6 }}>MISSED WORDS SAVED FOR REVISION ({summary.missedQuestions.length})</div>
                {summary.missedQuestions.slice(0, 4).map((mq) => (
                  <div key={mq.id} style={{ fontSize: '0.78rem', color: '#E2E8F0', marginBottom: 4 }}>
                    <strong>{mq.targetWord}</strong>: {mq.meaning}
                  </div>
                ))}
              </div>
            )}

            {savedNotice && <div style={{ fontSize: '0.8rem', color: '#34D399', fontWeight: 800, marginBottom: 14 }}>✅ {savedNotice}</div>}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button type="button" onClick={handleExitGame} style={{ padding: '11px 16px', borderRadius: 12, background: '#1E293B', border: '1px solid #334155', color: '#FFF', fontWeight: 800, cursor: 'pointer' }}>Exit Game</button>
              {summary.missedQuestions.length > 0 && (
                <button type="button" onClick={() => startBattle('revision_mode')} style={{ padding: '11px 16px', borderRadius: 12, background: '#D97706', border: 'none', color: '#FFF', fontWeight: 900, cursor: 'pointer' }}>Practice Missed Words</button>
              )}
              <button type="button" onClick={() => startBattle()} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 20px', borderRadius: 12, background: '#0891B2', border: 'none', color: '#FFF', fontWeight: 900, cursor: 'pointer' }}>
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
