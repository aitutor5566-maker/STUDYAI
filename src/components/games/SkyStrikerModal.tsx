import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Award,
  CheckCircle2,
  Compass,
  Crosshair,
  HelpCircle,
  Lock,
  Maximize2,
  Minimize2,
  Pause,
  Plane,
  Play,
  RotateCcw,
  Settings,
  Shield,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  X,
  Zap
} from 'lucide-react';
import { useLearning } from '../../context/LearningContext';
import { SkyStrikerAudioManager } from '../../games/skyStriker/AudioManager';
import { SKY_WORLDS } from '../../games/skyStriker/EnvironmentManager';
import { buildSkyStrikerDeck, SKY_STRIKER_QUESTION_COUNT } from '../../games/skyStriker/questionBank';
import { SkyStrikerCanvas, SkyStrikerMobileInput } from '../../games/skyStriker/SkyStrikerCanvas';
import {
  AIRCRAFT_SKINS,
  AircraftSkinId,
  CameraMode,
  DEFAULT_SKY_AUDIO,
  DifficultyLevel,
  GameModeId,
  GraphicsQuality,
  SkyStrikerAudioSettings,
  SkyStrikerHudSnapshot,
  SkyStrikerQuestion,
  SkyStrikerSessionSummary,
  SkyStrikerSubject,
  WorldId
} from '../../games/skyStriker/types';
import { enterElementFullscreen, exitBrowserFullscreen, isBrowserFullscreenActive } from '../../utils/fullscreenGame';
import {
  QuestionProgressionMachine,
  detectRecommendedGraphicsQuality
} from '../../games/ProgressionController';

export interface SkyStrikerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
  initialSubject?: string;
  difficulty?: DifficultyLevel;
}

const SUBJECT_OPTIONS: SkyStrikerSubject[] = [
  'All Subjects',
  'Science',
  'Mathematics',
  'English',
  'History',
  'Geography',
  'General Knowledge'
];

const UNLOCKED_WORLDS_KEY = 'studyai_sky_striker_worlds_v1';
const MISSED_QUESTIONS_KEY = 'studyai_sky_striker_missed_v1';

export const SkyStrikerModal: React.FC<SkyStrikerModalProps> = ({
  isOpen,
  onClose,
  initialTopic,
  initialSubject,
  difficulty: propDifficulty
}) => {
  const { activeProfile, apiFetch, triggerRefresh } = useLearning();
  const audioManager = useMemo(() => new SkyStrikerAudioManager(), []);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const joystickCenterRef = useRef<{ x: number; y: number } | null>(null);

  const mobileInputRef = useRef<SkyStrikerMobileInput>({
    moveX: 0,
    moveY: 0,
    boost: false
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [screen, setScreen] = useState<'menu' | 'playing' | 'paused' | 'results'>('menu');
  const [mode, setMode] = useState<GameModeId>('knowledge_flight');
  const [subject, setSubject] = useState<SkyStrikerSubject>('All Subjects');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(propDifficulty || 'medium');
  const [grade, setGrade] = useState<number>(activeProfile?.grade || 8);
  const [worldId, setWorldId] = useState<WorldId>('desert_storm');
  const [skinId, setSkinId] = useState<AircraftSkinId>('cyan_viper');
  const [cameraMode, setCameraMode] = useState<CameraMode>('standard');
  const [quality, setQuality] = useState<GraphicsQuality>(() => detectRecommendedGraphicsQuality());
  const progressionRef = useRef(new QuestionProgressionMachine({ questionsPerLevel: 5 }));
  const feedbackTimerRef = useRef<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [audioSettings, setAudioSettings] = useState<SkyStrikerAudioSettings>(DEFAULT_SKY_AUDIO);
  const [showSettings, setShowSettings] = useState(false);
  const [showHangar, setShowHangar] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [levelNum, setLevelNum] = useState(1);

  const [unlockedWorlds, setUnlockedWorlds] = useState<WorldId[]>(() => {
    try {
      const raw = localStorage.getItem(UNLOCKED_WORLDS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return ['desert_storm'];
  });

  const [savedMissed, setSavedMissed] = useState<SkyStrikerQuestion[]>(() => {
    try {
      const raw = localStorage.getItem(MISSED_QUESTIONS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return [];
  });

  // Active Flight Session State
  const [deck, setDeck] = useState<SkyStrikerQuestion[]>(() =>
    buildSkyStrikerDeck('All Subjects', 'medium', 8, [], initialTopic, 10)
  );
  const [qIndex, setQIndex] = useState(0);
  const [knowledgePoints, setKnowledgePoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [masteredTopics, setMasteredTopics] = useState<string[]>([]);
  const [runMissed, setRunMissed] = useState<SkyStrikerQuestion[]>([]);
  const [feedbackBanner, setFeedbackBanner] = useState<{
    isCorrect: boolean;
    correctText: string;
    explanation: string;
  } | null>(null);
  const [summary, setSummary] = useState<SkyStrikerSessionSummary | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const [selectTargetSignal, setSelectTargetSignal] = useState(0);
  const [pulseSignal, setPulseSignal] = useState(0);
  const [selectedOptionOverride, setSelectedOptionOverride] = useState<string | null>(null);
  const [joystickKnob, setJoystickKnob] = useState({ x: 0, y: 0 });

  const [hud, setHud] = useState<SkyStrikerHudSnapshot>({
    speedKts: 540,
    altitudeFt: 1760,
    isBoosting: false,
    turbulenceActive: true,
    selectedTargetId: null,
    selectedAnswerId: null,
    lockProgress: 0,
    isLocked: false,
    targets: []
  });

  const startTimeRef = useRef<number>(Date.now());
  const currentQuestion = deck[qIndex];

  useEffect(() => {
    audioManager.updateSettings(audioSettings);
  }, [audioSettings, audioManager]);

  useEffect(() => {
    const syncFs = () => setIsFullscreen(isBrowserFullscreenActive());
    document.addEventListener('fullscreenchange', syncFs);
    document.addEventListener('webkitfullscreenchange', syncFs);
    return () => {
      document.removeEventListener('fullscreenchange', syncFs);
      document.removeEventListener('webkitfullscreenchange', syncFs);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      audioManager.stopEngineAmbience();
      exitBrowserFullscreen();
      return;
    }
    const hint = `${initialSubject || ''} ${initialTopic || ''}`.toLowerCase();
    if (hint.includes('math') || hint.includes('algebra') || hint.includes('quadratic')) {
      setSubject('Mathematics');
    } else if (hint.includes('english') || hint.includes('grammar') || hint.includes('vocab') || hint.includes('synonym')) {
      setSubject('English');
    } else if (hint.includes('hist') || hint.includes('revolution')) {
      setSubject('History');
    } else if (hint.includes('geog') || hint.includes('tectonic')) {
      setSubject('Geography');
    } else if (hint.includes('sci') || hint.includes('bio') || hint.includes('phys') || hint.includes('mitosis') || hint.includes('photo')) {
      setSubject('Science');
    }
    if (propDifficulty) setDifficulty(propDifficulty);
  }, [isOpen, audioManager, initialSubject, initialTopic, propDifficulty]);

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
    audioManager.stopEngineAmbience();
    await exitBrowserFullscreen();
    onClose();
  };

  const completeRun = useCallback(
    async (
      finalCorrect: number,
      finalIncorrect: number,
      finalPoints: number,
      finalBestStreak: number,
      finalMastered: string[],
      finalMissed: SkyStrikerQuestion[]
    ) => {
      audioManager.stopEngineAmbience();
      audioManager.playLevelComplete();

      const total = Math.max(1, finalCorrect + finalIncorrect);
      const accuracy = Math.round((finalCorrect / total) * 100);
      const durationSeconds = Math.max(8, Math.round((Date.now() - startTimeRef.current) / 1000));

      // Unlock next world on solid completion (>= 60% accuracy)
      if (accuracy >= 60) {
        const order: WorldId[] = ['desert_storm', 'frozen_horizon', 'ocean_frontier', 'future_city', 'sky_kingdom'];
        const currentIdx = order.indexOf(worldId);
        const nextWorld = order[Math.min(order.length - 1, currentIdx + 1)];
        if (nextWorld && !unlockedWorlds.includes(nextWorld)) {
          const updated = [...unlockedWorlds, nextWorld];
          setUnlockedWorlds(updated);
          try {
            localStorage.setItem(UNLOCKED_WORLDS_KEY, JSON.stringify(updated));
          } catch {
            // ignore
          }
        }
      }

      if (finalMissed.length > 0) {
        const merged = Array.from(
          new Map([...savedMissed, ...finalMissed].map((q) => [q.questionId, q])).values()
        ).slice(0, 25);
        setSavedMissed(merged);
        try {
          localStorage.setItem(MISSED_QUESTIONS_KEY, JSON.stringify(merged));
        } catch {
          // ignore
        }
      }

      const sessionSummary: SkyStrikerSessionSummary = {
        knowledgePoints: finalPoints,
        correctAnswers: finalCorrect,
        incorrectAnswers: finalIncorrect,
        totalQuestions: total,
        accuracy,
        bestStreak: finalBestStreak,
        levelReached: levelNum,
        durationSeconds,
        masteredTopics: finalMastered,
        missedQuestions: finalMissed
      };

      setSummary(sessionSummary);
      setScreen('results');

      try {
        await apiFetch('/api/educational-games/sky-striker/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            knowledgePoints: finalPoints,
            accuracy,
            totalQuestions: total,
            correctAnswers: finalCorrect,
            incorrectAnswers: finalIncorrect,
            durationSeconds,
            subject,
            topic: initialTopic || subject,
            difficulty,
            grade,
            levelReached: levelNum,
            masteredTopics: finalMastered,
            missedTopics: finalMissed.map((m) => m.topic)
          })
        });
        setSavedNotice('Flight progress synced to AI Tutor Academy!');
        triggerRefresh();
      } catch {
        setSavedNotice('Flight complete (local progress saved).');
      }
    },
    [audioManager, worldId, unlockedWorlds, savedMissed, levelNum, apiFetch, subject, initialTopic, difficulty, grade, triggerRefresh]
  );

  const startFlight = (chosenMode: GameModeId = 'knowledge_flight', nextLevel = levelNum) => {
    audioManager.unlock();
    audioManager.startEngineAmbience();
    setMode(chosenMode);
    setLevelNum(nextLevel);

    const newDeck =
      chosenMode === 'revision_flight' && savedMissed.length > 0
        ? buildSkyStrikerDeck(subject, difficulty, grade, savedMissed, initialTopic, 10)
        : buildSkyStrikerDeck(subject, difficulty, grade, [], initialTopic, 10);

    setDeck(newDeck);
    setQIndex(0);
    setKnowledgePoints(0);
    setStreak(0);
    setBestStreak(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setMasteredTopics([]);
    setRunMissed([]);
    setFeedbackBanner(null);
    setShowHint(false);
    setSummary(null);
    setSavedNotice(null);
    if (feedbackTimerRef.current) {
      window.clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
    progressionRef.current.reset(nextLevel);
    if (newDeck[0]) {
      progressionRef.current.activateQuestion(newDeck[0].questionId);
    }
    startTimeRef.current = Date.now();
    setScreen('playing');
    enterElementFullscreen(rootRef.current).then((ok) => setIsFullscreen(ok));
  };

  const handleAnswerEvaluated = useCallback(
    (answerId: string) => {
      if (!currentQuestion || feedbackBanner) return;

      const evalResult = progressionRef.current.submitAnswer({
        questionId: currentQuestion.questionId,
        selectedAnswerId: answerId,
        correctAnswerId: currentQuestion.correctAnswerId,
        basePoints: 100
      });
      if (!evalResult.accepted) return;

      const isCorrect = evalResult.isCorrect;
      const correctOpt = currentQuestion.options.find((o) => o.answerId === currentQuestion.correctAnswerId);

      const nextCorrect = isCorrect ? correctCount + 1 : correctCount;
      const nextIncorrect = isCorrect ? incorrectCount : incorrectCount + 1;
      const nextStreak = isCorrect ? streak + 1 : 0;
      const nextBestStreak = Math.max(bestStreak, nextStreak);
      const nextPoints = isCorrect ? knowledgePoints + evalResult.pointsAwarded : knowledgePoints;
      const nextMastered = isCorrect
        ? Array.from(new Set([...masteredTopics, currentQuestion.topic]))
        : masteredTopics;
      const nextMissed = isCorrect ? runMissed : [...runMissed, currentQuestion];

      if (isCorrect) {
        audioManager.playCorrect();
      } else {
        audioManager.playIncorrect();
      }

      setCorrectCount(nextCorrect);
      setIncorrectCount(nextIncorrect);
      setStreak(nextStreak);
      setBestStreak(nextBestStreak);
      setKnowledgePoints(nextPoints);
      setMasteredTopics(nextMastered);
      setRunMissed(nextMissed);

      setFeedbackBanner({
        isCorrect,
        correctText: correctOpt ? `${correctOpt.label} — ${correctOpt.text}` : '',
        explanation: currentQuestion.explanation
      });

      if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = window.setTimeout(() => {
        feedbackTimerRef.current = null;
        setFeedbackBanner(null);
        setShowHint(false);
        const nextState = progressionRef.current.advance();
        if (qIndex + 1 >= deck.length) {
          completeRun(nextCorrect, nextIncorrect, nextPoints, nextBestStreak, nextMastered, nextMissed);
        } else {
          if (nextState === 'LEVEL_COMPLETE') {
            const nextLvl = progressionRef.current.startNextLevel();
            setLevelNum(nextLvl);
            const order: WorldId[] = ['desert_storm', 'frozen_horizon', 'ocean_frontier', 'future_city', 'sky_kingdom'];
            const nextWorld = order[(order.indexOf(worldId) + 1) % order.length];
            if (nextWorld) {
              setWorldId(nextWorld);
              setUnlockedWorlds((prev) => {
                if (prev.includes(nextWorld)) return prev;
                const updated = [...prev, nextWorld];
                try {
                  localStorage.setItem(UNLOCKED_WORLDS_KEY, JSON.stringify(updated));
                } catch {
                  // ignore
                }
                return updated;
              });
            }
          }
          const nextQ = deck[qIndex + 1];
          if (nextQ) {
            progressionRef.current.activateQuestion(nextQ.questionId);
          }
          setQIndex((prev) => prev + 1);
        }
      }, 1500);
    },
    [
      currentQuestion,
      feedbackBanner,
      correctCount,
      incorrectCount,
      streak,
      bestStreak,
      knowledgePoints,
      masteredTopics,
      runMissed,
      audioManager,
      qIndex,
      deck,
      worldId,
      completeRun
    ]
  );

  // Mobile Virtual Flight Joystick Touch Handlers
  const handleJoystickMove = (clientX: number, clientY: number) => {
    if (!joystickCenterRef.current) return;
    const dx = clientX - joystickCenterRef.current.x;
    const dy = clientY - joystickCenterRef.current.y;
    const maxR = 40;
    const dist = Math.hypot(dx, dy);
    const clampedDist = Math.min(maxR, dist);
    const angle = Math.atan2(dy, dx);
    const kx = Math.cos(angle) * clampedDist;
    const ky = Math.sin(angle) * clampedDist;
    setJoystickKnob({ x: kx, y: ky });
    mobileInputRef.current.moveX = kx / maxR;
    mobileInputRef.current.moveY = -ky / maxR; // up is positive climb
  };

  const resetJoystick = () => {
    joystickCenterRef.current = null;
    setJoystickKnob({ x: 0, y: 0 });
    mobileInputRef.current.moveX = 0;
    mobileInputRef.current.moveY = 0;
  };

  if (!isOpen) return null;

  const currentSkin = AIRCRAFT_SKINS.find((s) => s.id === skinId) || AIRCRAFT_SKINS[0];

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
        overflow: 'hidden',
        userSelect: 'none'
      }}
    >
      {/* ==================== MAIN MENU ==================== */}
      {screen === 'menu' && (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '22px 16px',
            background:
              'radial-gradient(circle at 80% 12%, rgba(34,211,238,0.2), transparent 46%), linear-gradient(160deg, #050814 0%, #0B192C 55%, #0F172A 100%)',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <div style={{ width: '100%', maxWidth: 960 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #06B6D4, #2563EB)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(6,182,212,0.4)'
                  }}
                >
                  <Plane size={26} color="#FFFFFF" />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 900, letterSpacing: '0.1em', color: '#22D3EE' }}>
                    STUDY RUSH 3D • FIGHTER JET
                  </div>
                  <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 900 }}>SKY STRIKER — KNOWLEDGE FLIGHT</h1>
                  <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                    THINK. FLY. AIM. LEARN. • {SKY_STRIKER_QUESTION_COUNT}+ Curriculum Questions
                    {initialTopic ? ` • Topic: ${initialTopic}` : ''}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleExitGame}
                aria-label="Close Sky Striker"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#FFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Configuration Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 14, marginBottom: 18 }}>
              {/* Mission Setup */}
              <div style={{ background: 'rgba(15,23,42,0.86)', border: '1px solid rgba(34,211,238,0.35)', borderRadius: 18, padding: 16 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#67E8F9', marginBottom: 10 }}>
                  MISSION PARAMETERS
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label style={{ fontSize: '0.76rem', color: '#CBD5E1', fontWeight: 700 }}>
                    Subject
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value as SkyStrikerSubject)}
                      style={{
                        width: '100%',
                        marginTop: 4,
                        padding: '9px 10px',
                        borderRadius: 10,
                        background: '#0F172A',
                        color: '#FFF',
                        border: '1px solid #334155',
                        fontWeight: 700
                      }}
                    >
                      {SUBJECT_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <label style={{ flex: 1, fontSize: '0.76rem', color: '#CBD5E1', fontWeight: 700 }}>
                      Grade
                      <select
                        value={grade}
                        onChange={(e) => setGrade(Number(e.target.value))}
                        style={{
                          width: '100%',
                          marginTop: 4,
                          padding: '9px 10px',
                          borderRadius: 10,
                          background: '#0F172A',
                          color: '#FFF',
                          border: '1px solid #334155',
                          fontWeight: 700
                        }}
                      >
                        {[6, 7, 8, 9, 10].map((g) => (
                          <option key={g} value={g}>
                            Grade {g}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label style={{ flex: 1, fontSize: '0.76rem', color: '#CBD5E1', fontWeight: 700 }}>
                      Difficulty
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                        style={{
                          width: '100%',
                          marginTop: 4,
                          padding: '9px 10px',
                          borderRadius: 10,
                          background: '#0F172A',
                          color: '#FFF',
                          border: '1px solid #334155',
                          fontWeight: 700
                        }}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </label>
                  </div>
                </div>
              </div>

              {/* World Selection */}
              <div style={{ background: 'rgba(15,23,42,0.86)', border: '1px solid rgba(34,211,238,0.35)', borderRadius: 18, padding: 16 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#67E8F9', marginBottom: 10 }}>
                  AERIAL WORLD ({unlockedWorlds.length}/5 UNLOCKED)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {SKY_WORLDS.map((w) => {
                    const unlocked = unlockedWorlds.includes(w.id);
                    const active = worldId === w.id;
                    return (
                      <button
                        key={w.id}
                        type="button"
                        disabled={!unlocked}
                        onClick={() => setWorldId(w.id)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: 10,
                          border: active ? '1.5px solid #22D3EE' : '1px solid #334155',
                          background: active ? 'rgba(6,182,212,0.18)' : 'rgba(15,23,42,0.7)',
                          color: unlocked ? '#F8FAFC' : '#64748B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: unlocked ? 'pointer' : 'not-allowed',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          textAlign: 'left'
                        }}
                      >
                        <span>{w.name}</span>
                        {!unlocked && <Lock size={13} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hangar & Graphics */}
              <div style={{ background: 'rgba(15,23,42,0.86)', border: '1px solid rgba(34,211,238,0.35)', borderRadius: 18, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 10 }}>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#67E8F9', marginBottom: 10 }}>
                    AIRCRAFT &amp; FLIGHT SETTINGS
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: currentSkin.previewGradient, border: '1.5px solid #22D3EE' }} />
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 800 }}>{currentSkin.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Twin-Engine Intercept Jet</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setShowHangar(true)}
                    style={{
                      flex: 1,
                      padding: '9px 10px',
                      borderRadius: 10,
                      background: '#1E293B',
                      border: '1px solid #334155',
                      color: '#FFF',
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      cursor: 'pointer'
                    }}
                  >
                    Aircraft Hangar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSettings(true)}
                    style={{
                      flex: 1,
                      padding: '9px 10px',
                      borderRadius: 10,
                      background: '#1E293B',
                      border: '1px solid #334155',
                      color: '#FFF',
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 5
                    }}
                  >
                    <Settings size={14} /> Settings
                  </button>
                </div>
              </div>
            </div>

            {/* Action Launch Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => startFlight('knowledge_flight', 1)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '14px 32px',
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #06B6D4 0%, #2563EB 100%)',
                  border: 'none',
                  color: '#FFF',
                  fontSize: '1.05rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 10px 28px rgba(6,182,212,0.42)'
                }}
              >
                <Play size={20} fill="#FFF" /> Launch Knowledge Flight
              </button>

              {savedMissed.length > 0 && (
                <button
                  type="button"
                  onClick={() => startFlight('revision_flight', 1)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '14px 22px',
                    borderRadius: 14,
                    background: '#1E293B',
                    border: '1.5px solid #F59E0B',
                    color: '#FDE68A',
                    fontSize: '0.94rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  <RotateCcw size={17} /> Revision Flight ({savedMissed.length})
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== 3D FLIGHT GAMEPLAY + HUD ==================== */}
      {(screen === 'playing' || screen === 'paused') && currentQuestion && (
        <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
          <SkyStrikerCanvas
            paused={screen === 'paused' || Boolean(feedbackBanner) || showSettings}
            worldId={worldId}
            quality={quality}
            cameraMode={cameraMode}
            skinId={skinId}
            reducedMotion={reducedMotion}
            currentQuestion={currentQuestion}
            audioManager={audioManager}
            selectTargetSignal={selectTargetSignal}
            pulseSignal={pulseSignal}
            selectedOptionOverride={selectedOptionOverride}
            mobileInputRef={mobileInputRef}
            onHudUpdate={setHud}
            onAnswerEvaluated={handleAnswerEvaluated}
            onPauseRequested={() => setScreen((s) => (s === 'playing' ? 'paused' : 'playing'))}
          />

          {/* Projected Holographic Answer Labels */}
          {hud.targets.map(
            (t) =>
              t.visible && (
                <button
                  key={t.targetId}
                  type="button"
                  onClick={() => {
                    setSelectedOptionOverride(t.answerId);
                    setTimeout(() => setSelectedOptionOverride(null), 50);
                  }}
                  style={{
                    position: 'absolute',
                    left: t.screenX,
                    top: t.screenY,
                    transform: 'translate(-50%, -100%)',
                    padding: '6px 12px',
                    borderRadius: 10,
                    background:
                      t.validationState === 'correct'
                        ? 'rgba(16, 185, 129, 0.94)'
                        : t.validationState === 'incorrect'
                        ? 'rgba(245, 158, 11, 0.94)'
                        : t.isSelected
                        ? 'rgba(6, 182, 212, 0.94)'
                        : 'rgba(15, 23, 42, 0.88)',
                    border: t.isSelected ? '2px solid #FFFFFF' : '1.5px solid #22D3EE',
                    color: '#FFFFFF',
                    fontSize: '0.82rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    maxWidth: 210,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    boxShadow: t.isSelected ? '0 0 18px rgba(34,211,238,0.85)' : 'none',
                    zIndex: 10
                  }}
                >
                  {t.label} — {t.text}
                  {t.isSelected && (
                    <span style={{ marginLeft: 6, fontSize: '0.7rem', color: '#E0F2FE' }}>
                      {t.isLocked ? '🎯 LOCKED' : `${Math.round(t.lockProgress * 100)}%`}
                    </span>
                  )}
                </button>
              )
          )}

          {/* TOP-LEFT: Knowledge Points & Streak */}
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              background: 'rgba(15,23,42,0.86)',
              border: '1px solid rgba(34,211,238,0.4)',
              borderRadius: 12,
              padding: '8px 12px',
              zIndex: 20
            }}
          >
            <div style={{ fontSize: '0.84rem', fontWeight: 900, color: '#67E8F9' }}>⭐ {knowledgePoints} KP</div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#FDE047' }}>🔥 Streak: {streak}</div>
          </div>

          {/* TOP-CENTER: Futuristic Question HUD */}
          <div
            style={{
              position: 'absolute',
              top: typeof window !== 'undefined' && window.innerWidth < 820 ? 74 : 12,
              left: '50%',
              transform: 'translateX(-50%)',
              width: typeof window !== 'undefined' && window.innerWidth < 820 ? 'calc(100vw - 24px)' : 'min(560px, calc(100vw - 320px))',
              background: 'rgba(15, 23, 42, 0.92)',
              border: '1.5px solid rgba(34, 211, 238, 0.65)',
              borderRadius: 16,
              padding: '10px 16px',
              zIndex: 20,
              boxShadow: '0 8px 28px rgba(0, 0, 0, 0.45)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', fontWeight: 800, color: '#22D3EE', marginBottom: 4 }}>
              <span>
                {currentQuestion.subject.toUpperCase()} — LEVEL {String(levelNum).padStart(2, '0')} • {currentQuestion.topic}
              </span>
              <span>
                Q {qIndex + 1}/{deck.length}
              </span>
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.35 }}>
              {currentQuestion.questionText}
            </div>
            {currentQuestion.optionalHint && (
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowHint((h) => !h)}
                  style={{
                    background: 'rgba(34,211,238,0.16)',
                    border: '1px solid rgba(34,211,238,0.4)',
                    color: '#67E8F9',
                    borderRadius: 8,
                    padding: '2px 8px',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <HelpCircle size={12} /> {showHint ? 'Hide Hint' : 'Hint'}
                </button>
                {showHint && <span style={{ fontSize: '0.74rem', color: '#FDE68A' }}>{currentQuestion.optionalHint}</span>}
              </div>
            )}
            {/* Progress Bar */}
            <div style={{ marginTop: 8, height: 4, borderRadius: 99, background: '#1E293B', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${((qIndex + 1) / Math.max(1, deck.length)) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #06B6D4, #38BDF8)',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>

          {/* TOP-RIGHT: Fullscreen, Sound & Pause */}
          <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8, zIndex: 20 }}>
            <button
              type="button"
              onClick={toggleFullscreen}
              style={{ padding: 9, borderRadius: 11, background: 'rgba(15,23,42,0.86)', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', cursor: 'pointer' }}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button
              type="button"
              onClick={() => setAudioSettings((s) => ({ ...s, muted: !s.muted }))}
              style={{ padding: 9, borderRadius: 11, background: 'rgba(15,23,42,0.86)', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', cursor: 'pointer' }}
              aria-label="Toggle Mute"
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

          {/* EDUCATIONAL FEEDBACK BANNER (Correct Burst / Incorrect Shield) */}
          {feedbackBanner && (
            <div
              style={{
                position: 'absolute',
                top: '48%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 'min(480px, 92vw)',
                background: feedbackBanner.isCorrect ? 'rgba(6, 78, 59, 0.95)' : 'rgba(120, 53, 15, 0.95)',
                border: `2px solid ${feedbackBanner.isCorrect ? '#34D399' : '#FBBF24'}`,
                borderRadius: 18,
                padding: '16px 20px',
                zIndex: 35,
                textAlign: 'center',
                boxShadow: '0 16px 40px rgba(0,0,0,0.6)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: '1.1rem', fontWeight: 900, marginBottom: 6 }}>
                {feedbackBanner.isCorrect ? (
                  <>
                    <CheckCircle2 size={22} color="#34D399" />
                    <span style={{ color: '#6EE7B7' }}>CORRECT ANSWER! +100 KP</span>
                  </>
                ) : (
                  <>
                    <Shield size={22} color="#FBBF24" />
                    <span style={{ color: '#FDE68A' }}>ENERGY SHIELD ACTIVATED</span>
                  </>
                )}
              </div>
              {!feedbackBanner.isCorrect && (
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#FFFFFF', marginBottom: 6 }}>
                  Correct Answer: {feedbackBanner.correctText}
                </div>
              )}
              <div style={{ fontSize: '0.84rem', color: '#E2E8F0', lineHeight: 1.45 }}>
                {feedbackBanner.explanation}
              </div>
            </div>
          )}

          {/* BOTTOM-LEFT: Virtual Flight Joystick + Speed/Altitude Telemetry */}
          <div style={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', alignItems: 'flex-end', gap: 12, zIndex: 20 }}>
            <div
              onTouchStart={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                joystickCenterRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
                if (e.touches[0]) handleJoystickMove(e.touches[0].clientX, e.touches[0].clientY);
              }}
              onTouchMove={(e) => {
                if (e.touches[0]) handleJoystickMove(e.touches[0].clientX, e.touches[0].clientY);
              }}
              onTouchEnd={resetJoystick}
              style={{
                width: 92,
                height: 92,
                borderRadius: '50%',
                background: 'rgba(15, 23, 42, 0.72)',
                border: '2px solid rgba(34, 211, 238, 0.5)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                touchAction: 'none'
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#22D3EE',
                  transform: `translate(${joystickKnob.x}px, ${joystickKnob.y}px)`,
                  boxShadow: '0 0 12px rgba(34,211,238,0.8)'
                }}
              />
            </div>

            <div
              style={{
                background: 'rgba(15, 23, 42, 0.84)',
                border: '1px solid rgba(34,211,238,0.35)',
                borderRadius: 12,
                padding: '8px 12px',
                fontSize: '0.74rem',
                fontWeight: 800
              }}
            >
              <div style={{ color: '#67E8F9' }}>SPD: {hud.speedKts} KTS {hud.isBoosting ? '⚡BOOST' : ''}</div>
              <div style={{ color: '#CBD5E1' }}>ALT: {hud.altitudeFt} FT</div>
              <div style={{ color: '#94A3B8', fontSize: '0.68rem', marginTop: 2 }}>
                WASD/Arrows Fly • E Target • Space Pulse
              </div>
            </div>
          </div>

          {/* BOTTOM-RIGHT: Boost, Select Target & Energy Pulse Buttons */}
          <div style={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, zIndex: 20 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onTouchStart={() => {
                  mobileInputRef.current.boost = true;
                  audioManager.playBoost();
                }}
                onTouchEnd={() => {
                  mobileInputRef.current.boost = false;
                }}
                onMouseDown={() => {
                  mobileInputRef.current.boost = true;
                  audioManager.playBoost();
                }}
                onMouseUp={() => {
                  mobileInputRef.current.boost = false;
                }}
                style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: 'rgba(249, 115, 22, 0.9)',
                  border: '1.5px solid #FDBA74',
                  color: '#FFF',
                  fontWeight: 900,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5
                }}
              >
                <Zap size={15} /> Boost
              </button>

              <button
                type="button"
                onClick={() => setSelectTargetSignal((s) => s + 1)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1.5px solid #22D3EE',
                  color: '#67E8F9',
                  fontWeight: 900,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5
                }}
              >
                <Crosshair size={15} /> Select [E]
              </button>
            </div>

            <button
              type="button"
              onClick={() => setPulseSignal((s) => s + 1)}
              style={{
                padding: '13px 22px',
                borderRadius: 14,
                background: 'linear-gradient(135deg, #06B6D4, #2563EB)',
                border: '2px solid #A5F3FC',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                boxShadow: '0 6px 20px rgba(6,182,212,0.5)'
              }}
            >
              <Sparkles size={17} /> Activate Energy Pulse [Space]
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
            background: 'rgba(5, 8, 20, 0.84)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: 16
          }}
        >
          <div style={{ width: 'min(380px, 92vw)', background: '#0F172A', border: '1.5px solid #22D3EE', borderRadius: 20, padding: 22, textAlign: 'center' }}>
            <h2 style={{ margin: '0 0 14px', fontWeight: 900 }}>Flight Paused</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                onClick={() => setScreen('playing')}
                style={{ padding: 12, borderRadius: 12, background: '#0891B2', border: 'none', color: '#FFF', fontWeight: 900, cursor: 'pointer' }}
              >
                Resume Flight
              </button>
              <button
                type="button"
                onClick={() => startFlight(mode, levelNum)}
                style={{ padding: 11, borderRadius: 12, background: '#1E293B', border: '1px solid #334155', color: '#FFF', fontWeight: 800, cursor: 'pointer' }}
              >
                Restart Mission
              </button>
              <button
                type="button"
                onClick={() => {
                  audioManager.stopEngineAmbience();
                  setScreen('menu');
                }}
                style={{ padding: 11, borderRadius: 12, background: '#1E293B', border: '1px solid #334155', color: '#FFF', fontWeight: 800, cursor: 'pointer' }}
              >
                Main Menu
              </button>
              <button
                type="button"
                onClick={handleExitGame}
                style={{ padding: 11, borderRadius: 12, background: '#334155', border: 'none', color: '#FCA5A5', fontWeight: 800, cursor: 'pointer' }}
              >
                Exit Game
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== HANGAR CUSTOMIZATION MODAL ==================== */}
      {showHangar && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(5, 8, 20, 0.86)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 60,
            padding: 16
          }}
        >
          <div style={{ width: 'min(480px, 95vw)', background: '#0F172A', border: '1.5px solid #22D3EE', borderRadius: 20, padding: 22 }}>
            <h3 style={{ margin: '0 0 14px', fontWeight: 900 }}>Aircraft Hangar &amp; Skins</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {AIRCRAFT_SKINS.map((sk) => (
                <button
                  key={sk.id}
                  type="button"
                  onClick={() => setSkinId(sk.id)}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    border: skinId === sk.id ? '2px solid #22D3EE' : '1px solid #334155',
                    background: '#1E293B',
                    color: '#FFF',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ height: 28, borderRadius: 8, background: sk.previewGradient, marginBottom: 8 }} />
                  <div style={{ fontWeight: 800, fontSize: '0.84rem' }}>{sk.name}</div>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowHangar(false)}
              style={{ width: '100%', marginTop: 16, padding: 11, borderRadius: 12, background: '#0891B2', border: 'none', color: '#FFF', fontWeight: 900, cursor: 'pointer' }}
            >
              Confirm Aircraft
            </button>
          </div>
        </div>
      )}

      {/* ==================== SETTINGS MODAL ==================== */}
      {showSettings && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(5, 8, 20, 0.86)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 65,
            padding: 16
          }}
        >
          <div style={{ width: 'min(440px, 95vw)', background: '#0F172A', border: '1.5px solid #22D3EE', borderRadius: 20, padding: 22 }}>
            <h3 style={{ margin: '0 0 14px', fontWeight: 900 }}>Flight, Camera &amp; Audio Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#67E8F9' }}>
                CAMERA MODE
                <select
                  value={cameraMode}
                  onChange={(e) => setCameraMode(e.target.value as CameraMode)}
                  style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 10, background: '#1E293B', color: '#FFF', border: '1px solid #334155' }}
                >
                  <option value="standard">Standard Chase Camera</option>
                  <option value="cinematic">Cinematic Chase Camera</option>
                  <option value="reduced">Reduced Camera Movement</option>
                </select>
              </label>

              <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#67E8F9' }}>
                GRAPHICS QUALITY
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value as GraphicsQuality)}
                  style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 10, background: '#1E293B', color: '#FFF', border: '1px solid #334155' }}
                >
                  <option value="low">Low (Battery Saver)</option>
                  <option value="medium">Medium (Balanced)</option>
                  <option value="high">High (Dynamic Shadows)</option>
                  <option value="ultra">Ultra (Full Bloom & 2x DPR)</option>
                </select>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', fontWeight: 700 }}>
                <input type="checkbox" checked={reducedMotion} onChange={(e) => setReducedMotion(e.target.checked)} />
                Reduced Motion (disable turbulence &amp; camera tilt)
              </label>

              <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#67E8F9' }}>
                MASTER VOLUME ({Math.round(audioSettings.masterVolume * 100)}%)
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={audioSettings.masterVolume}
                  onChange={(e) => setAudioSettings((s) => ({ ...s, masterVolume: Number(e.target.value) }))}
                  style={{ width: '100%', accentColor: '#22D3EE' }}
                />
              </label>
            </div>
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              style={{ width: '100%', marginTop: 18, padding: 11, borderRadius: 12, background: '#0891B2', border: 'none', color: '#FFF', fontWeight: 900, cursor: 'pointer' }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ==================== RESULTS SCREEN ==================== */}
      {screen === 'results' && summary && (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 22,
            background: 'radial-gradient(circle at 50% 10%, rgba(34,211,238,0.22), transparent 50%), #050814',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div style={{ width: 'min(680px, 100%)', background: '#0F172A', border: '1.5px solid #22D3EE', borderRadius: 24, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <Trophy size={26} color="#FDE047" />
              <h2 style={{ margin: 0, fontWeight: 900 }}>Knowledge Flight Debrief</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 16 }}>
              <div style={{ background: '#1E293B', padding: 12, borderRadius: 12 }}>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800 }}>KNOWLEDGE PTS</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#67E8F9' }}>{summary.knowledgePoints}</div>
              </div>
              <div style={{ background: '#1E293B', padding: 12, borderRadius: 12 }}>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800 }}>ACCURACY</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#34D399' }}>{summary.accuracy}%</div>
              </div>
              <div style={{ background: '#1E293B', padding: 12, borderRadius: 12 }}>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800 }}>BEST STREAK</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FDE047' }}>{summary.bestStreak}</div>
              </div>
              <div style={{ background: '#1E293B', padding: 12, borderRadius: 12 }}>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800 }}>CORRECT / TOTAL</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFF' }}>
                  {summary.correctAnswers}/{summary.totalQuestions}
                </div>
              </div>
            </div>

            {summary.missedQuestions.length > 0 && (
              <div style={{ marginBottom: 14, background: '#1E293B', padding: 12, borderRadius: 12 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#FBBF24', marginBottom: 6 }}>
                  MISSED QUESTIONS SAVED FOR REVISION ({summary.missedQuestions.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 160, overflowY: 'auto' }}>
                  {summary.missedQuestions.map((mq) => (
                    <div key={mq.questionId} style={{ fontSize: '0.78rem', color: '#E2E8F0' }}>
                      • <strong>{mq.topic}:</strong> {mq.questionText} — <em>{mq.explanation}</em>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {savedNotice && <div style={{ fontSize: '0.8rem', color: '#34D399', fontWeight: 800, marginBottom: 14 }}>✅ {savedNotice}</div>}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleExitGame}
                style={{ padding: '11px 16px', borderRadius: 12, background: '#1E293B', border: '1px solid #334155', color: '#FFF', fontWeight: 800, cursor: 'pointer' }}
              >
                Exit Game
              </button>
              <button
                type="button"
                onClick={() => startFlight('knowledge_flight', levelNum)}
                style={{ padding: '11px 16px', borderRadius: 12, background: '#1E293B', border: '1px solid #22D3EE', color: '#67E8F9', fontWeight: 800, cursor: 'pointer' }}
              >
                Retry Level
              </button>
              <button
                type="button"
                onClick={() => startFlight('knowledge_flight', levelNum + 1)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '11px 20px',
                  borderRadius: 12,
                  background: '#0891B2',
                  border: 'none',
                  color: '#FFF',
                  fontWeight: 900,
                  cursor: 'pointer'
                }}
              >
                <Compass size={16} /> Next Level
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
