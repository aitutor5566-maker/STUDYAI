import React, { useEffect, useState, useRef } from 'react';
import {
  Gamepad2,
  Crosshair,
  Zap,
  Rocket,
  Trophy,
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
  Globe,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import { useLearning } from '../context/LearningContext';
import {
  EducationalQuestion,
  GameDifficulty,
  GameFeedback,
  GameLanguage,
  GameMistakeRecord,
  GameMode,
  GameType,
  OptionId,
  SharedGameSettings
} from '../games/types';
import { QuestionEngine } from '../games/QuestionEngine';
import { ProgressionController, LevelInfo } from '../games/ProgressionController';
import { AnswerShooter3D } from './games/AnswerShooter3D';
import { AnswerRunner3D } from './games/AnswerRunner3D';
import { SpaceAnswerShooter3D } from './games/SpaceAnswerShooter3D';

function inferClientSubject(topicText: string): string {
  const t = topicText.toLowerCase();
  if (/(quadratic|math|algebra|equation|fraction|geometry|calculus|trigonometry|number|polynomial|triangle|matrix|probability)/.test(t)) {
    return 'Maths';
  }
  if (/(history|war|empire|revolution|geography|civics|democracy|economy|constitution|industrial|cold war|civilization)/.test(t)) {
    return 'Social Studies';
  }
  if (/(grammar|english|tense|passive|active voice|literature|poem|essay|shakespeare|verb|noun|clause|metaphor)/.test(t)) {
    return 'English';
  }
  return 'Science';
}

export const EducationalGamesModal: React.FC = () => {
  const { modalGames, closeGamesHub, apiFetch, triggerRefresh } = useLearning();

  // Settings State (Part 1)
  const [selectedGame, setSelectedGame] = useState<GameType>('answer_shooter');
  const [grade, setGrade] = useState<number>(5);
  const [subject, setSubject] = useState<string>('Science');
  const [chapter, setChapter] = useState<string>('Solar System');
  const [topic, setTopic] = useState<string>('Planetary Orbits');
  const [language, setLanguage] = useState<GameLanguage>('English');
  const [startingDifficulty, setStartingDifficulty] = useState<GameDifficulty>('medium');
  const [gameMode, setGameMode] = useState<GameMode>('practice');
  const [sessionLength, setSessionLength] = useState<number>(10); // 10, 20, 30, or 0 (endless)

  // Game Flow State
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [loading, setLoading] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [pendingTopicChange, setPendingTopicChange] = useState<string | null>(null);

  // Gameplay Progress State
  const [currentQuestion, setCurrentQuestion] = useState<EducationalQuestion | null>(null);
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [combo, setCombo] = useState<number>(1);
  const [questionsAttempted, setQuestionsAttempted] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [mistakes, setMistakes] = useState<GameMistakeRecord[]>([]);
  const [feedback, setFeedback] = useState<GameFeedback | null>(null);
  const [levelInfo, setLevelInfo] = useState<LevelInfo>({
    level: 1,
    difficulty: 'easy',
    difficultyScore: 1,
    title: 'Level 1 — Foundational Concepts',
    speedMultiplier: 1.0,
    targetAccuracy: 0.8
  });
  const [levelUpAlert, setLevelUpAlert] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Engine & Controller instances
  const engineRef = useRef<QuestionEngine | null>(null);
  const progressionRef = useRef<ProgressionController | null>(null);

  // Synchronize modal open props
  useEffect(() => {
    if (modalGames.open) {
      const incomingTopic = modalGames.topic || 'Solar System';
      const incomingSubject = modalGames.subject || inferClientSubject(incomingTopic);

      // If already playing a game and topic changed externally, ask to restart (Part 1 guard)
      if (gameState === 'playing' && incomingTopic.toLowerCase() !== topic.toLowerCase()) {
        setIsPaused(true);
        setPendingTopicChange(incomingTopic);
        return;
      }

      setTopic(incomingTopic);
      setChapter(incomingTopic);
      setSubject(incomingSubject);

      if (modalGames.initialGame) {
        if (modalGames.initialGame === 'space_shooter') setSelectedGame('space_answer_shooter');
        else if (modalGames.initialGame === 'learning_runner') setSelectedGame('answer_runner');
        else setSelectedGame('answer_shooter');
      }
      setGameState('setup');
    }
  }, [modalGames.open, modalGames.topic, modalGames.subject, modalGames.initialGame]);

  if (!modalGames.open) return null;

  // Start / Restart Game with clean state
  const handleStartGame = async () => {
    setLoading(true);
    setGameState('setup');

    const settings: SharedGameSettings = {
      grade,
      subject,
      chapter: chapter || topic,
      topic,
      language,
      startingDifficulty,
      gameMode,
      sessionLength
    };

    const engine = new QuestionEngine(settings);
    const progression = new ProgressionController(startingDifficulty, gameMode);

    engineRef.current = engine;
    progressionRef.current = progression;

    try {
      await engine.loadQuestionBatch(apiFetch, 8);
      const firstQ = engine.getNextQuestion(selectedGame);

      setCurrentQuestion(firstQ);
      setScore(0);
      setLives(gameMode === 'challenge' ? 3 : 5);
      setCombo(1);
      setQuestionsAttempted(0);
      setCorrectCount(0);
      setMistakes([]);
      setFeedback(null);
      setLevelInfo(progression.getLevelInfo());
      setLevelUpAlert(null);
      setIsPaused(false);
      setPendingTopicChange(null);
      setGameState('playing');
    } finally {
      setLoading(false);
    }
  };

  // Evaluate Chosen Answer
  const handleAnswerChosen = (chosenOptionId: OptionId) => {
    if (!engineRef.current || !progressionRef.current || !currentQuestion || feedback) return;

    const basePoints = selectedGame === 'space_answer_shooter' ? 250 : selectedGame === 'answer_runner' ? 200 : 150;
    const evaluated = engineRef.current.evaluateAnswer(chosenOptionId, basePoints);
    if (!evaluated) return;

    const newAttempted = questionsAttempted + 1;
    setQuestionsAttempted(newAttempted);

    // Progression update
    const progressionStep = progressionRef.current.recordAnswer(evaluated.isCorrect);
    const nextLevelInfo = progressionRef.current.getLevelInfo();
    setLevelInfo(nextLevelInfo);

    if (evaluated.isCorrect) {
      const addedPoints = evaluated.pointsEarned * combo;
      setScore((prev) => prev + addedPoints);
      setCorrectCount((prev) => prev + 1);
      setCombo((prev) => prev + 1);

      if (progressionStep.promoted) {
        setLevelUpAlert(`🎉 LEVEL PROMOTION! Welcome to ${nextLevelInfo.title}`);
        setTimeout(() => setLevelUpAlert(null), 3000);
      }
    } else {
      setCombo(1);
      const nextLives = lives - 1;
      setLives(nextLives);

      const mistakeRecord: GameMistakeRecord = {
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        chosenAnswer: evaluated.chosenText,
        correctAnswer: evaluated.correctText,
        explanation: evaluated.explanation,
        timestamp: new Date().toLocaleTimeString()
      };
      setMistakes((prev) => [...prev, mistakeRecord]);

      if (nextLives <= 0) {
        // Game Over
        setFeedback(evaluated);
        setTimeout(() => handleFinishSession(false), 2400);
        return;
      }
    }

    setFeedback(evaluated);

    // Auto-advance or advance on button click
    const delay = evaluated.isCorrect ? 1800 : 2800;
    setTimeout(() => {
      handleNextQuestion(newAttempted);
    }, delay);
  };

  // Advance to next question in queue
  const handleNextQuestion = (attemptedCount: number) => {
    setFeedback(null);
    if (!engineRef.current) return;

    // Check if session length limit reached
    if (sessionLength > 0 && attemptedCount >= sessionLength) {
      handleFinishSession(true);
      return;
    }

    // Prefetch if queue running low
    if (engineRef.current.getQueueLength() <= 2) {
      engineRef.current.loadQuestionBatch(apiFetch, 6);
    }

    const nextQ = engineRef.current.getNextQuestion(selectedGame);
    if (!nextQ) {
      handleFinishSession(true);
      return;
    }

    setCurrentQuestion(nextQ);
  };

  // Complete and persist game session
  const handleFinishSession = async (completedNormally: boolean) => {
    setGameState('finished');
    const finalAccuracy = questionsAttempted > 0 ? Math.round((correctCount / questionsAttempted) * 100) : 0;

    try {
      await apiFetch('/api/games/sessions', {
        method: 'POST',
        body: JSON.stringify({
          game_type: selectedGame,
          topic,
          subject,
          difficulty: startingDifficulty,
          score,
          correct_count: correctCount,
          total_questions: questionsAttempted || 1,
          accuracy: finalAccuracy,
          stage_reached: levelInfo.level,
          duration_seconds: 60,
          mistakes
        })
      });
      triggerRefresh();
    } catch {
      // Non-blocking persistence
    }
  };

  // Web Speech API: Speak explanation in selected language
  const handleSpeakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    if (language === 'Telugu') {
      const teVoice = voices.find((v) => v.lang.startsWith('te') || v.name.includes('Geeta'));
      if (teVoice) utter.voice = teVoice;
      utter.lang = 'te-IN';
      utter.rate = 0.92;
    } else if (language === 'Hindi') {
      const hiVoice = voices.find((v) => v.lang.startsWith('hi') || v.name.includes('Lekha'));
      if (hiVoice) utter.voice = hiVoice;
      utter.lang = 'hi-IN';
      utter.rate = 0.95;
    } else {
      const enVoice = voices.find((v) => v.lang === 'en-IN' || v.name.includes('Rishi') || v.name.includes('Aman'));
      if (enVoice) utter.voice = enVoice;
      utter.lang = 'en-IN';
      utter.rate = 1.0;
    }

    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(3, 7, 18, 0.75)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: selectedGame === 'space_answer_shooter' && gameState === 'playing' ? 1040 : 960,
          maxHeight: '96vh',
          background: '#0B0F19',
          border: selectedGame === 'space_answer_shooter' ? '2px solid rgba(56, 189, 248, 0.55)' : '1.5px solid rgba(255, 106, 0, 0.45)',
          borderRadius: 24,
          overflowY: 'auto',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75)',
          color: '#FFFFFF',
          padding: selectedGame === 'space_answer_shooter' && gameState === 'playing' ? 0 : 24,
          position: 'relative'
        }}
      >
        {/* Modal Header */}
        {!(selectedGame === 'space_answer_shooter' && gameState === 'playing') && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Gamepad2 size={26} color="#FF6A00" />
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#F8FAFC' }}>
                  AI Tutor 3D Educational Games
                </h2>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                  Loop-Based 3D Learning Arena • Grades 1–10 • English + Telugu + Hindi
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={closeGamesHub}
              aria-label="Close Games"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: 36,
                height: 36,
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* SETUP SCREEN */}
        {gameState === 'setup' && (
          <div style={{ display: 'grid', gap: 16 }}>
            {/* 1. Game Selection Tabs */}
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#FF6A00', marginBottom: 8 }}>
                1. Choose 3D Game:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {(
                  [
                    { id: 'answer_shooter', title: 'Answer Shooter', desc: '3D Arena Target Combat', icon: <Crosshair size={20} color="#FF6A00" /> },
                    { id: 'answer_runner', title: 'Answer Runner', desc: '3D 3-Lane Endless Sprint', icon: <Zap size={20} color="#38BDF8" /> },
                    { id: 'space_answer_shooter', title: 'Space Answer Shooter', desc: 'STUDYAI Space Battle — 3D Arcade Shooter', icon: <Rocket size={20} color="#38BDF8" /> }
                  ] as const
                ).map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedGame(g.id)}
                    style={{
                      padding: '14px 12px',
                      borderRadius: 16,
                      border: selectedGame === g.id ? '2px solid #FF6A00' : '1px solid rgba(255,255,255,0.12)',
                      background: selectedGame === g.id ? 'rgba(255, 106, 0, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                      color: '#FFFFFF',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      {g.icon}
                      <span style={{ fontWeight: 800, fontSize: '0.92rem' }}>{g.title}</span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>{g.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Educational Settings Form */}
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: 18, borderRadius: 18, border: '1px solid rgba(255,255,255,0.08)', display: 'grid', gap: 14 }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#38BDF8' }}>
                2. Curriculum &amp; Language Settings:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                {/* Language */}
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <Globe size={14} color="#FF6A00" /> Language:
                  </label>
                  <select
                    aria-label="Language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as GameLanguage)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 10, background: '#1E293B', border: '1px solid rgba(255,255,255,0.2)', color: '#FFFFFF', fontSize: '0.84rem', fontWeight: 700 }}
                  >
                    <option value="English">English</option>
                    <option value="Telugu">తెలుగు (Telugu)</option>
                    <option value="Hindi">हिंदी (Hindi)</option>
                  </select>
                </div>

                {/* Grade */}
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <GraduationCap size={14} color="#FF6A00" /> Grade (1–10):
                  </label>
                  <select
                    aria-label="Grade"
                    value={grade}
                    onChange={(e) => setGrade(parseInt(e.target.value, 10))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 10, background: '#1E293B', border: '1px solid rgba(255,255,255,0.2)', color: '#FFFFFF', fontSize: '0.84rem', fontWeight: 700 }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((g) => (
                      <option key={g} value={g}>
                        Grade {g}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <BookOpen size={14} color="#FF6A00" /> Subject:
                  </label>
                  <select
                    aria-label="Subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 10, background: '#1E293B', border: '1px solid rgba(255,255,255,0.2)', color: '#FFFFFF', fontSize: '0.84rem', fontWeight: 700 }}
                  >
                    {['Science', 'Maths', 'English', 'Telugu', 'Hindi', 'Social Studies', 'Computer Science'].map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Topic */}
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#94A3B8', marginBottom: 4, display: 'block' }}>
                    Topic Title:
                  </label>
                  <input
                    aria-label="Topic"
                    value={topic}
                    onChange={(e) => {
                      setTopic(e.target.value);
                      setChapter(e.target.value);
                    }}
                    placeholder="e.g. Solar System, Fractions, Electricity"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 10, background: '#1E293B', border: '1px solid rgba(255,255,255,0.2)', color: '#FFFFFF', fontSize: '0.84rem', fontWeight: 700 }}
                  />
                </div>
              </div>

              {/* Game Mode & Difficulty */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 4 }}>
                {/* Starting Difficulty */}
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#94A3B8', marginBottom: 4, display: 'block' }}>
                    Starting Difficulty:
                  </label>
                  <select
                    aria-label="Difficulty"
                    value={startingDifficulty}
                    onChange={(e) => setStartingDifficulty(e.target.value as GameDifficulty)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 10, background: '#1E293B', border: '1px solid rgba(255,255,255,0.2)', color: '#FFFFFF', fontSize: '0.84rem', fontWeight: 700 }}
                  >
                    <option value="easy">Easy (Introductory)</option>
                    <option value="medium">Medium (Standard)</option>
                    <option value="hard">Hard (Advanced)</option>
                  </select>
                </div>

                {/* Game Mode */}
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#94A3B8', marginBottom: 4, display: 'block' }}>
                    Game Mode:
                  </label>
                  <select
                    aria-label="Mode"
                    value={gameMode}
                    onChange={(e) => setGameMode(e.target.value as GameMode)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 10, background: '#1E293B', border: '1px solid rgba(255,255,255,0.2)', color: '#FFFFFF', fontSize: '0.84rem', fontWeight: 700 }}
                  >
                    <option value="practice">Practice Mode (Generous Time &amp; Hints)</option>
                    <option value="challenge">Challenge Mode (Strict Shields &amp; Combos)</option>
                  </select>
                </div>

                {/* Session Length */}
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#94A3B8', marginBottom: 4, display: 'block' }}>
                    Session Length:
                  </label>
                  <select
                    aria-label="Session Length"
                    value={sessionLength}
                    onChange={(e) => setSessionLength(parseInt(e.target.value, 10))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 10, background: '#1E293B', border: '1px solid rgba(255,255,255,0.2)', color: '#FFFFFF', fontSize: '0.84rem', fontWeight: 700 }}
                  >
                    <option value={10}>10 Questions</option>
                    <option value={20}>20 Questions</option>
                    <option value={30}>30 Questions</option>
                    <option value={0}>Endless Mode</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Launch Game Button */}
            <button
              type="button"
              disabled={loading}
              onClick={handleStartGame}
              className="btn-orange"
              style={{
                padding: '14px 28px',
                fontSize: '1.05rem',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                borderRadius: 16,
                boxShadow: '0 8px 24px rgba(255, 106, 0, 0.4)'
              }}
            >
              <Play size={20} />
              <span>{loading ? 'Preparing 3D Arena...' : 'Start 3D Educational Game'}</span>
            </button>
          </div>
        )}

        {/* ACTIVE PLAYING SCREEN */}
        {gameState === 'playing' && (
          <div style={{ position: 'relative' }}>
            {/* Level Promotion Toast */}
            {levelUpAlert && (
              <div
                style={{
                  position: 'absolute',
                  top: 10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 20,
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#FFFFFF',
                  padding: '10px 24px',
                  borderRadius: 999,
                  fontWeight: 900,
                  fontSize: '0.92rem',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.5)'
                }}
              >
                {levelUpAlert}
              </div>
            )}

            {/* Active 3D Game Renderers */}
            {selectedGame === 'answer_shooter' && (
              <AnswerShooter3D
                question={currentQuestion}
                onAnswerChosen={handleAnswerChosen}
                levelInfo={levelInfo}
                feedback={feedback}
                lives={lives}
                score={score}
                combo={combo}
                isPaused={isPaused}
              />
            )}

            {selectedGame === 'answer_runner' && (
              <AnswerRunner3D
                question={currentQuestion}
                onAnswerChosen={handleAnswerChosen}
                levelInfo={levelInfo}
                feedback={feedback}
                lives={lives}
                score={score}
                combo={combo}
                isPaused={isPaused}
              />
            )}

            {selectedGame === 'space_answer_shooter' && (
              <SpaceAnswerShooter3D
                question={currentQuestion}
                onAnswerChosen={handleAnswerChosen}
                levelInfo={levelInfo}
                feedback={feedback}
                lives={lives}
                score={score}
                combo={combo}
                isPaused={isPaused}
                questionIndex={questionsAttempted + 1}
                totalQuestions={sessionLength || 5}
                subject={subject}
                chapter={chapter || topic}
                onTogglePause={() => setIsPaused((prev) => !prev)}
                onExit={() => setGameState('setup')}
              />
            )}

            {/* Educational Feedback Overlay (Part 8) */}
            {feedback && selectedGame !== 'space_answer_shooter' && (
              <div
                style={{
                  marginTop: 14,
                  padding: '14px 18px',
                  borderRadius: 16,
                  background: feedback.isCorrect ? 'rgba(6, 78, 59, 0.95)' : 'rgba(127, 29, 29, 0.95)',
                  border: `2px solid ${feedback.isCorrect ? '#10B981' : '#EF4444'}`,
                  color: '#FFFFFF',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 900, fontSize: '1rem' }}>
                    {feedback.isCorrect ? (
                      <>
                        <CheckCircle2 size={20} color="#34D399" />
                        <span style={{ color: '#34D399' }}>DIRECT HIT! Correct Answer (+{feedback.pointsEarned * combo} pts)</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={20} color="#F87171" />
                        <span style={{ color: '#F87171' }}>SHIELD HIT! (-1 Shield) — Target: {feedback.correctText}</span>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSpeakText(feedback.explanation)}
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      border: 'none',
                      borderRadius: 999,
                      padding: '4px 12px',
                      color: '#FFFFFF',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    <span>Listen</span>
                  </button>
                </div>
                <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.5, color: '#F1F5F9' }}>
                  {feedback.explanation}
                </p>
                {feedback.hint && !feedback.isCorrect && (
                  <div style={{ marginTop: 6, fontSize: '0.8rem', color: '#FDE047', fontWeight: 600 }}>
                    💡 Concept Hint: {feedback.hint}
                  </div>
                )}
              </div>
            )}

            {/* Mid-Game Topic Change Confirmation Modal (Part 1 Guard) */}
            {pendingTopicChange && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(3, 7, 18, 0.85)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 24,
                  zIndex: 30
                }}
              >
                <div style={{ background: '#1E293B', border: '2px solid #FF6A00', borderRadius: 20, padding: 24, maxWidth: 440, textAlign: 'center' }}>
                  <AlertTriangle size={36} color="#FF6A00" style={{ marginBottom: 8 }} />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 8px 0' }}>
                    Topic Changed to &ldquo;{pendingTopicChange}&rdquo;
                  </h3>
                  <p style={{ fontSize: '0.86rem', color: '#94A3B8', marginBottom: 16 }}>
                    Would you like to restart the 3D game using this new topic, or continue your current lesson?
                  </p>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setTopic(pendingTopicChange);
                        setChapter(pendingTopicChange);
                        setSubject(inferClientSubject(pendingTopicChange));
                        setPendingTopicChange(null);
                        handleStartGame();
                      }}
                      className="btn-orange"
                      style={{ padding: '8px 18px', fontSize: '0.86rem' }}
                    >
                      Restart with New Topic
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPendingTopicChange(null);
                        setIsPaused(false);
                      }}
                      className="btn-glass"
                      style={{ padding: '8px 18px', fontSize: '0.86rem' }}
                    >
                      Continue Current Game
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* FINISHED / LEARNING REPORT SCREEN */}
        {gameState === 'finished' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Trophy size={54} color="#FACC15" style={{ marginBottom: 10 }} />
            <h2 style={{ fontSize: '1.45rem', fontWeight: 900, margin: '0 0 6px 0', color: '#F8FAFC' }}>
              {lives > 0 ? 'Mission Accomplished!' : 'Game Over — Great Effort!'}
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#94A3B8', marginBottom: 20 }}>
              {topic} • Grade {grade} • {subject} ({language})
            </p>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, maxWidth: 640, margin: '0 auto 24px auto' }}>
              <div style={{ background: '#1E293B', padding: 14, borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '0.74rem', color: '#94A3B8', fontWeight: 700 }}>Final Score</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FACC15' }}>{score}</div>
              </div>
              <div style={{ background: '#1E293B', padding: 14, borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '0.74rem', color: '#94A3B8', fontWeight: 700 }}>Accuracy</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10B981' }}>
                  {questionsAttempted > 0 ? Math.round((correctCount / questionsAttempted) * 100) : 0}%
                </div>
              </div>
              <div style={{ background: '#1E293B', padding: 14, borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '0.74rem', color: '#94A3B8', fontWeight: 700 }}>Correct / Total</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#38BDF8' }}>
                  {correctCount} / {questionsAttempted}
                </div>
              </div>
              <div style={{ background: '#1E293B', padding: 14, borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '0.74rem', color: '#94A3B8', fontWeight: 700 }}>Stage Reached</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FF6A00' }}>
                  Level {levelInfo.level}
                </div>
              </div>
            </div>

            {/* Mistakes Review */}
            {mistakes.length > 0 && (
              <div style={{ maxWidth: 680, margin: '0 auto 24px auto', textAlign: 'left', background: 'rgba(15, 23, 42, 0.7)', padding: 18, borderRadius: 18, border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#EF4444', marginBottom: 10 }}>
                  Review Identified Mistakes ({mistakes.length}):
                </div>
                <div style={{ display: 'grid', gap: 8, maxHeight: 180, overflowY: 'auto' }}>
                  {mistakes.map((m, i) => (
                    <div key={i} style={{ background: '#1E293B', padding: 10, borderRadius: 10, fontSize: '0.8rem' }}>
                      <div style={{ fontWeight: 700, color: '#FFFFFF', marginBottom: 2 }}>{m.question}</div>
                      <div style={{ color: '#EF4444' }}>❌ Your target: {m.chosenAnswer}</div>
                      <div style={{ color: '#10B981' }}>✅ Correct target: {m.correctAnswer}</div>
                      <div style={{ color: '#94A3B8', marginTop: 2 }}>💡 {m.explanation}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                type="button"
                onClick={handleStartGame}
                className="btn-orange"
                style={{ padding: '12px 24px', fontSize: '0.92rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <RotateCcw size={16} /> Play Again
              </button>
              <button
                type="button"
                onClick={() => setGameState('setup')}
                className="btn-glass"
                style={{ padding: '12px 24px', fontSize: '0.92rem', fontWeight: 800 }}
              >
                Change Settings
              </button>
              <button
                type="button"
                onClick={closeGamesHub}
                className="btn-glass"
                style={{ padding: '12px 24px', fontSize: '0.92rem', fontWeight: 800 }}
              >
                Return to AI Tutor
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
