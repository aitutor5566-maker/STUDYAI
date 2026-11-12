import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Gamepad2,
  Sword,
  Shield,
  Trophy,
  Flame,
  RotateCcw,
  X,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Award,
  ChevronRight,
  BookOpen,
  HelpCircle,
  Zap,
  ArrowUp,
  Compass
} from 'lucide-react';
import { useLearning } from '../../context/LearningContext';
import { EducationalQuestion, GameLanguage, OptionId } from '../../games/types';
import { QuestionEngine } from '../../games/QuestionEngine';
import { BattleWorldEngine } from '../../games/battleWorld/BattleWorldEngine';
import { ARENA_DEFINITIONS } from '../../games/battleWorld/VoxelArenaManager';
import { BattleWorldStats, BiomeType } from '../../games/battleWorld/types';

export const StudyAiBattleWorldModal: React.FC = () => {
  const { modalGames, closeGamesHub, apiFetch, triggerRefresh } = useLearning();

  // Screen Stages: 'setup' | 'playing' | 'gameover'
  const [stage, setStage] = useState<'setup' | 'playing' | 'gameover'>('setup');
  const [isVictory, setIsVictory] = useState<boolean>(false);

  // Curriculum Settings
  const [grade, setGrade] = useState<number>(5);
  const [subject, setSubject] = useState<string>('Science');
  const [topic, setTopic] = useState<string>('Photosynthesis');
  const [language, setLanguage] = useState<GameLanguage>('English');

  // Engine references & Stats
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<BattleWorldEngine | null>(null);
  const engineQuestionRef = useRef<QuestionEngine | null>(null);

  const [stats, setStats] = useState<BattleWorldStats>({
    score: 0,
    knowledgeXP: 0,
    wave: 1,
    totalWaves: 5,
    currentArena: 'grassland',
    playerHealth: 100,
    maxHealth: 100,
    comboStreak: 1,
    mobsRemaining: 4,
    totalMobsInWave: 4,
    questionsAnswered: 0,
    correctAnswers: 0,
    powerUpActive: false,
    powerUpTimeLeft: 0
  });

  // Questions State
  const [currentQuestion, setCurrentQuestion] = useState<EducationalQuestion | null>(null);
  const [questionModalOpen, setQuestionModalOpen] = useState<boolean>(false);
  const [answeredFeedback, setAnsweredFeedback] = useState<{
    chosenOptionId: OptionId;
    isCorrect: boolean;
    explanation: string;
  } | null>(null);
  const [mistakesList, setMistakesList] = useState<Array<{
    question: string;
    chosen: string;
    correct: string;
    explanation: string;
  }>>([]);

  // Audio & Pause state
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [transitionText, setTransitionText] = useState<string | null>(null);

  // Touch Virtual Joystick State
  const joystickCenterRef = useRef<{ x: number; y: number } | null>(null);
  const [joystickThumb, setJoystickThumb] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchLookRef = useRef<{ lastX: number; lastY: number; touchId: number } | null>(null);

  // Synchronize initial topic when opened from tutor or library
  useEffect(() => {
    if (modalGames.open) {
      if (modalGames.topic) setTopic(modalGames.topic);
      if (modalGames.subject) setSubject(modalGames.subject);
      setStage('setup');
      setAnsweredFeedback(null);
      setMistakesList([]);
    }
  }, [modalGames.open, modalGames.topic, modalGames.subject]);

  // Load next question from QuestionEngine
  const fetchNextQuestion = useCallback(async () => {
    if (!engineQuestionRef.current) {
      const engine = new QuestionEngine({
        grade,
        subject,
        chapter: topic,
        topic,
        language,
        startingDifficulty: 'medium',
        gameMode: 'practice',
        sessionLength: 10
      });
      await engine.loadQuestionBatch(apiFetch, 8);
      engineQuestionRef.current = engine;
    }
    const q = engineQuestionRef.current.getNextQuestion('answer_shooter');
    setCurrentQuestion(q);
  }, [apiFetch, grade, subject, topic, language]);

  // Start the Game
  const handleStartGame = async () => {
    setStage('playing');
    setAnsweredFeedback(null);
    setMistakesList([]);

    // Initialize Question Engine
    const engine = new QuestionEngine({
      grade,
      subject,
      chapter: topic,
      topic,
      language,
      startingDifficulty: 'medium',
      gameMode: 'practice',
      sessionLength: 10
    });
    await engine.loadQuestionBatch(apiFetch, 8);
    engineQuestionRef.current = engine;
    const firstQ = engine.getNextQuestion('answer_shooter');
    setCurrentQuestion(firstQ);
  };

  // Mount 3D Engine when stage switches to 'playing'
  useEffect(() => {
    if (stage !== 'playing') {
      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
      }
      return;
    }

    if (!containerRef.current) return;

    const engine = new BattleWorldEngine(containerRef.current, {
      onStatsUpdate: (updatedStats) => {
        setStats(updatedStats);
      },
      onWaveComplete: (waveNum, nextBiome) => {
        const arena = ARENA_DEFINITIONS[nextBiome];
        setTransitionText(`ENTERING ${arena.themeTitle.toUpperCase()}`);
        setTimeout(() => setTransitionText(null), 2500);
        // Refresh to next question for the new wave
        fetchNextQuestion();
      },
      onGameOver: (victory, finalStats) => {
        setIsVictory(victory);
        setStage('gameover');

        // Persist game session to backend
        const accuracy = Math.round(
          (finalStats.correctAnswers / Math.max(1, finalStats.questionsAnswered)) * 100
        );

        apiFetch('/api/games/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            game_type: 'battle_world',
            topic,
            subject,
            difficulty: 'medium',
            score: finalStats.score,
            correct_count: finalStats.correctAnswers,
            total_questions: Math.max(1, finalStats.questionsAnswered),
            accuracy,
            stage_reached: finalStats.wave,
            duration_seconds: 120,
            mistakes: mistakesList
          })
        }).then(() => {
          triggerRefresh();
        }).catch(() => {
          // offline catch
        });
      },
      onOpenQuestionDialog: () => {
        setQuestionModalOpen(true);
      }
    });

    engineRef.current = engine;
    engine.start();

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, [stage, topic, subject, fetchNextQuestion, mistakesList, apiFetch, triggerRefresh]);

  // Answer Submission Handler
  const handleAnswerSubmit = (optionId: OptionId) => {
    if (!currentQuestion || answeredFeedback) return;

    const isCorrect = optionId === currentQuestion.correct_option_id;
    const chosenText = currentQuestion.options.find((o) => o.id === optionId)?.text || '';
    const correctText = currentQuestion.options.find((o) => o.id === currentQuestion.correct_option_id)?.text || '';

    setAnsweredFeedback({
      chosenOptionId: optionId,
      isCorrect,
      explanation: currentQuestion.explanation
    });

    if (!isCorrect) {
      setMistakesList((prev) => [
        ...prev,
        {
          question: currentQuestion.question,
          chosen: chosenText,
          correct: correctText,
          explanation: currentQuestion.explanation
        }
      ]);
    }

    if (engineRef.current) {
      engineRef.current.onAnswerResult(isCorrect);
    }

    // Auto advance question after 2 seconds
    setTimeout(async () => {
      setAnsweredFeedback(null);
      setQuestionModalOpen(false);
      await fetchNextQuestion();
    }, 2200);
  };

  // --- Mobile Touch Event Handlers ---

  const handleJoystickStart = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    joystickCenterRef.current = { x: cx, y: cy };

    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    const maxR = rect.width / 2;
    const clampedR = Math.min(dist, maxR);
    const angle = Math.atan2(dy, dx);

    const tx = Math.cos(angle) * clampedR;
    const ty = Math.sin(angle) * clampedR;
    setJoystickThumb({ x: tx, y: ty });

    if (engineRef.current) {
      engineRef.current.controlsInput.moveRight = tx / maxR;
      engineRef.current.controlsInput.moveForward = -ty / maxR;
    }
  };

  const handleJoystickMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!joystickCenterRef.current) return;
    e.preventDefault();
    const cx = joystickCenterRef.current.x;
    const cy = joystickCenterRef.current.y;
    const maxR = 48; // Joystick radius limit

    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    const clampedR = Math.min(dist, maxR);
    const angle = Math.atan2(dy, dx);

    const tx = Math.cos(angle) * clampedR;
    const ty = Math.sin(angle) * clampedR;
    setJoystickThumb({ x: tx, y: ty });

    if (engineRef.current) {
      engineRef.current.controlsInput.moveRight = tx / maxR;
      engineRef.current.controlsInput.moveForward = -ty / maxR;
    }
  };

  const handleJoystickEnd = () => {
    joystickCenterRef.current = null;
    setJoystickThumb({ x: 0, y: 0 });
    if (engineRef.current) {
      engineRef.current.controlsInput.moveRight = 0;
      engineRef.current.controlsInput.moveForward = 0;
    }
  };

  const handleLookTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.targetTouches.length > 0) {
      const t = e.targetTouches[0];
      touchLookRef.current = {
        lastX: t.clientX,
        lastY: t.clientY,
        touchId: t.identifier
      };
    }
  };

  const handleLookTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchLookRef.current || !engineRef.current) return;
    for (let i = 0; i < e.targetTouches.length; i++) {
      const t = e.targetTouches[i];
      if (t.identifier === touchLookRef.current.touchId) {
        const dx = (t.clientX - touchLookRef.current.lastX) * 0.007;
        const dy = (t.clientY - touchLookRef.current.lastY) * 0.007;
        touchLookRef.current.lastX = t.clientX;
        touchLookRef.current.lastY = t.clientY;
        engineRef.current.rotateCamera(dx, dy);
        break;
      }
    }
  };

  const handleLookTouchEnd = () => {
    touchLookRef.current = null;
  };

  if (!modalGames.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="relative w-full h-full max-w-[1400px] max-h-[920px] bg-slate-900 text-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-800">
        
        {/* Top App Bar Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-950/80 border-b border-slate-800/80 z-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Sword className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-wider text-orange-400 font-mono">STUDYAI BATTLE WORLD</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-bold border border-orange-500/30">
                  3D VOXEL RPG
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Minecraft-Inspired Educational Arena Combat
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {stage === 'playing' && (
              <>
                <button
                  onClick={() => {
                    if (engineRef.current) {
                      const nextPause = !isPaused;
                      setIsPaused(nextPause);
                      engineRef.current.isPaused = nextPause;
                    }
                  }}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title={isPaused ? 'Resume' : 'Pause'}
                >
                  {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </>
            )}

            <button
              onClick={closeGamesHub}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition"
              title="Close Battle World"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* --- STAGE 1: SETUP & LOBBY VIEW --- */}
        {stage === 'setup' && (
          <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col items-center justify-between">
            <div className="max-w-4xl w-full text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Next-Gen 3D Voxel Knowledge Adventure
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400">
                MASTER YOUR SYLLABUS IN THE BATTLE WORLD
              </h1>
              <p className="text-slate-300 text-sm md:text-base max-w-2xl mx-auto">
                Step into 5 compact voxel arenas. Answer syllabus questions to unlock elemental power-ups, defeat stylized mobs, and conquer the Shadow Warden Boss!
              </p>

              {/* Curriculum Selection Card */}
              <div className="mt-6 p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur text-left grid grid-cols-1 md:grid-cols-4 gap-4 shadow-xl">
                <div>
                  <label htmlFor="bw-grade" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Grade / Class
                  </label>
                  <select
                    id="bw-grade"
                    value={grade}
                    onChange={(e) => setGrade(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-medium focus:outline-none focus:border-orange-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                      <option key={g} value={g}>Grade {g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="bw-subject" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Subject
                  </label>
                  <select
                    id="bw-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-medium focus:outline-none focus:border-orange-500"
                  >
                    <option value="Science">Science (General)</option>
                    <option value="Biology">Biology</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Physics">Physics</option>
                    <option value="Maths">Mathematics</option>
                    <option value="Social Studies">Social Studies</option>
                    <option value="English">English</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="bw-topic" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Topic / Concept
                  </label>
                  <input
                    id="bw-topic"
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Photosynthesis, Heart..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-medium focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label htmlFor="bw-lang" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Language
                  </label>
                  <select
                    id="bw-lang"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as GameLanguage)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-medium focus:outline-none focus:border-orange-500"
                  >
                    <option value="English">English</option>
                    <option value="Telugu">Telugu (తెలుగు)</option>
                    <option value="Hindi">Hindi (हिन्दी)</option>
                  </select>
                </div>
              </div>

              {/* 5 Voxel Biome Showcase */}
              <div className="mt-6">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  5 Enclosed Voxel Arenas
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {Object.values(ARENA_DEFINITIONS).map((arena) => (
                    <div
                      key={arena.id}
                      className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex flex-col items-center text-center space-y-1 hover:border-orange-500/50 transition"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
                        style={{ backgroundColor: `${arena.accentColor}30`, color: arena.accentColor }}
                      >
                        W{arena.waveIndex}
                      </div>
                      <span className="font-bold text-xs text-slate-200">{arena.name}</span>
                      <span className="text-[10px] text-slate-400 line-clamp-1">{arena.mobType.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <div className="w-full max-w-md mt-6">
              <button
                onClick={handleStartGame}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-slate-950 font-black text-lg tracking-wider flex items-center justify-center gap-3 shadow-xl shadow-orange-500/25 active:scale-95 transition"
              >
                <Sword className="w-6 h-6" />
                ENTER BATTLE WORLD
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* --- STAGE 2: ACTIVE 3D GAMEPLAY CANVAS & IN-GAME HUD --- */}
        {stage === 'playing' && (
          <div className="relative flex-1 w-full h-full overflow-hidden select-none">
            {/* Three.js Canvas Container */}
            <div ref={containerRef} className="absolute inset-0 w-full h-full" />

            {/* Top-Center Continuous Question HUD */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[92%] max-w-2xl z-30">
              <div
                onClick={() => setQuestionModalOpen(true)}
                className="p-3 md:p-3.5 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-orange-500/40 shadow-2xl flex items-center justify-between gap-3 cursor-pointer hover:border-orange-400 active:scale-[0.99] transition"
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 font-bold text-xs shrink-0 border border-orange-500/30">
                    Q{stats.questionsAnswered + 1}
                  </span>
                  <p className="text-xs md:text-sm font-semibold text-slate-100 truncate">
                    {currentQuestion?.question || `Loading ${topic} challenge question...`}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuestionModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black text-xs shrink-0 flex items-center gap-1.5 shadow-md shadow-orange-500/20"
                >
                  <Zap className="w-3.5 h-3.5" />
                  ANSWER
                </button>
              </div>
            </div>

            {/* Top-Left Player & Wave Stats */}
            <div className="absolute top-3 left-3 z-20 space-y-2 pointer-events-none">
              {/* Health Bar */}
              <div className="p-2.5 rounded-xl bg-slate-950/80 backdrop-blur border border-slate-800 shadow-lg min-w-[160px]">
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-slate-400">HP</span>
                  <span className={stats.playerHealth > 40 ? 'text-emerald-400' : 'text-rose-400'}>
                    {stats.playerHealth}/{stats.maxHealth}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      stats.playerHealth > 50
                        ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                        : stats.playerHealth > 25
                        ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                        : 'bg-gradient-to-r from-rose-600 to-red-400 animate-pulse'
                    }`}
                    style={{ width: `${(stats.playerHealth / stats.maxHealth) * 100}%` }}
                  />
                </div>
              </div>

              {/* Wave & XP Pills */}
              <div className="flex items-center gap-2">
                <div className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur border border-slate-800 text-xs font-bold text-amber-400 flex items-center gap-1.5 shadow">
                  <Trophy className="w-3.5 h-3.5" />
                  XP: {stats.knowledgeXP}
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur border border-slate-800 text-xs font-bold text-orange-400 flex items-center gap-1.5 shadow">
                  <Flame className="w-3.5 h-3.5" />
                  {stats.comboStreak}x
                </div>
                {stats.powerUpActive && (
                  <div className="px-2.5 py-1 rounded-lg bg-cyan-500/20 backdrop-blur border border-cyan-400/50 text-xs font-bold text-cyan-300 flex items-center gap-1 animate-pulse">
                    <Zap className="w-3.5 h-3.5" />
                    POWER {stats.powerUpTimeLeft}s
                  </div>
                )}
              </div>
            </div>

            {/* Top-Right Wave & Mobs remaining */}
            <div className="absolute top-16 right-3 md:top-3 md:right-16 z-20 pointer-events-none">
              <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur border border-slate-800 text-xs font-bold text-slate-300 flex items-center gap-2 shadow">
                <Compass className="w-3.5 h-3.5 text-orange-400" />
                <span>Wave {stats.wave}/5:</span>
                <span className="text-orange-400">{stats.mobsRemaining} Left</span>
              </div>
            </div>

            {/* Wave Transition Banner */}
            {transitionText && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-40 pointer-events-none animate-fadeIn">
                <div className="p-6 rounded-3xl bg-slate-950/90 border-2 border-orange-500/60 shadow-2xl text-center space-y-2">
                  <Sparkles className="w-8 h-8 text-yellow-400 mx-auto animate-bounce" />
                  <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">
                    {transitionText}
                  </h2>
                  <p className="text-xs text-slate-400">Biome and Opponents Reconfigured</p>
                </div>
              </div>
            )}

            {/* Mobile Touch Drag Surface for Camera (Right Half of Screen) */}
            <div
              className="absolute inset-y-0 right-0 w-1/2 z-10 touch-none"
              onTouchStart={handleLookTouchStart}
              onTouchMove={handleLookTouchMove}
              onTouchEnd={handleLookTouchEnd}
            />

            {/* Bottom-Left Mobile Virtual Joystick */}
            <div className="absolute bottom-6 left-6 z-30 touch-none select-none">
              <div
                className="relative w-28 h-28 rounded-full bg-slate-950/60 border-2 border-orange-500/30 backdrop-blur-md flex items-center justify-center shadow-2xl"
                onPointerDown={handleJoystickStart}
                onPointerMove={handleJoystickMove}
                onPointerUp={handleJoystickEnd}
                onPointerCancel={handleJoystickEnd}
              >
                <div
                  className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 shadow-lg shadow-orange-500/50 pointer-events-none transition-transform duration-75"
                  style={{
                    transform: `translate(${joystickThumb.x}px, ${joystickThumb.y}px)`
                  }}
                />
              </div>
            </div>

            {/* Bottom-Right Mobile Action Buttons */}
            <div className="absolute bottom-6 right-6 z-30 flex items-end gap-3 pointer-events-auto">
              <button
                onClick={() => {
                  if (engineRef.current) {
                    engineRef.current.player.jump();
                    engineRef.current.playSound('jump');
                  }
                }}
                className="w-14 h-14 rounded-full bg-slate-900/80 hover:bg-slate-800 border-2 border-blue-500/50 text-blue-400 flex flex-col items-center justify-center font-bold text-xs shadow-xl active:scale-90 transition"
              >
                <ArrowUp className="w-5 h-5" />
                <span className="text-[9px]">JUMP</span>
              </button>

              <button
                onClick={() => {
                  if (engineRef.current) {
                    engineRef.current.triggerAttack();
                  }
                }}
                className="w-18 h-18 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500 text-slate-950 flex flex-col items-center justify-center font-black text-sm shadow-2xl shadow-orange-500/40 active:scale-90 transition"
              >
                <Sword className="w-7 h-7" />
                <span className="text-[10px] tracking-wider">STRIKE</span>
              </button>
            </div>

            {/* Desktop Controls Hint (Hidden on mobile) */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 hidden md:block px-4 py-1 rounded-full bg-slate-950/70 backdrop-blur border border-slate-800 text-[11px] text-slate-400 pointer-events-none z-20">
              WASD: Move • Space: Jump • E / Click: Strike • Q / Tab: Answer • Mouse Drag: Orbit Camera
            </div>

            {/* --- MULTIPLE-CHOICE QUESTION DIALOG OVERLAY --- */}
            {questionModalOpen && currentQuestion && (
              <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
                <div className="max-w-xl w-full bg-slate-900/95 border border-orange-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-orange-500/20 text-orange-400 font-bold text-xs border border-orange-500/30">
                        {topic}
                      </span>
                      <span className="text-xs text-slate-400">Class {grade} {subject}</span>
                    </div>
                    <button
                      onClick={() => setQuestionModalOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <h3 className="text-base md:text-lg font-bold text-white leading-relaxed">
                    {currentQuestion.question}
                  </h3>

                  {/* Options Grid */}
                  <div className="grid grid-cols-1 gap-2.5 pt-2">
                    {currentQuestion.options.map((opt) => {
                      const isChosen = answeredFeedback?.chosenOptionId === opt.id;
                      const isCorrect = opt.id === currentQuestion.correct_option_id;

                      let btnStyle = 'bg-slate-800 hover:bg-slate-700/80 border-slate-700 text-slate-200';
                      if (answeredFeedback) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300';
                        } else if (isChosen) {
                          btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300';
                        }
                      }

                      return (
                        <button
                          key={opt.id}
                          disabled={!!answeredFeedback}
                          onClick={() => handleAnswerSubmit(opt.id)}
                          className={`w-full p-3.5 rounded-xl border font-medium text-sm text-left flex items-center gap-3 transition active:scale-[0.99] ${btnStyle}`}
                        >
                          <span className="w-6 h-6 rounded-lg bg-slate-900/60 border border-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {opt.id}
                          </span>
                          <span className="flex-1">{opt.text}</span>
                          {answeredFeedback && isCorrect && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                          )}
                          {answeredFeedback && isChosen && !isCorrect && (
                            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Immediate Feedback Banner */}
                  {answeredFeedback && (
                    <div
                      className={`p-3.5 rounded-xl text-xs space-y-1 animate-fadeIn border ${
                        answeredFeedback.isCorrect
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                          : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                      }`}
                    >
                      <div className="font-bold flex items-center gap-1.5">
                        {answeredFeedback.isCorrect ? (
                          <>
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                            Correct! +100 Knowledge XP & Power-Up Activated!
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 text-rose-400" />
                            Not quite. Review the concept below:
                          </>
                        )}
                      </div>
                      <p className="text-slate-300 leading-normal">
                        {answeredFeedback.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- STAGE 3: GAME OVER / VICTORY SUMMARY --- */}
        {stage === 'gameover' && (
          <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col items-center justify-center">
            <div className="max-w-xl w-full bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 md:p-8 text-center space-y-6 shadow-2xl backdrop-blur">
              <div className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center shadow-xl">
                {isVictory ? (
                  <div className="w-full h-full rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-yellow-500/30">
                    <Trophy className="w-9 h-9 text-slate-950" />
                  </div>
                ) : (
                  <div className="w-full h-full rounded-3xl bg-slate-700 flex items-center justify-center">
                    <Shield className="w-9 h-9 text-slate-300" />
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white">
                  {isVictory ? 'VICTORY! WORLD CONQUERED!' : 'MISSION COMPLETE'}
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  {isVictory
                    ? 'You defeated all 5 waves including the Shadow Warden Boss!'
                    : `Well fought! You reached Wave ${stats.wave} in ${topic}.`}
                </p>
              </div>

              {/* Performance Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700/60">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Score</div>
                  <div className="text-xl font-black text-orange-400">{stats.score}</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700/60">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Knowledge XP</div>
                  <div className="text-xl font-black text-amber-400">+{stats.knowledgeXP}</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700/60">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Accuracy</div>
                  <div className="text-xl font-black text-emerald-400">
                    {Math.round((stats.correctAnswers / Math.max(1, stats.questionsAnswered)) * 100)}%
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700/60">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Waves Clear</div>
                  <div className="text-xl font-black text-cyan-400">{isVictory ? 5 : stats.wave - 1}/5</div>
                </div>
              </div>

              {/* Review Mistakes Section */}
              {mistakesList.length > 0 && (
                <div className="text-left space-y-2 pt-2 border-t border-slate-700/60">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Concepts to Review ({mistakesList.length})
                  </span>
                  <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                    {mistakesList.map((m, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                        <p className="font-semibold text-slate-200">{m.question}</p>
                        <p className="text-rose-400">Your Answer: {m.chosen}</p>
                        <p className="text-emerald-400">Correct: {m.correct}</p>
                        <p className="text-slate-400 text-[11px]">{m.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={handleStartGame}
                  className="w-full sm:flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  PLAY AGAIN
                </button>
                <button
                  onClick={closeGamesHub}
                  className="w-full sm:flex-1 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition"
                >
                  <BookOpen className="w-4 h-4" />
                  RETURN TO STUDYAI
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
