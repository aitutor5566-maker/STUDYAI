import React, { useEffect, useState } from 'react';
import { Gamepad2, Crosshair, Zap, Rocket, Trophy, RotateCcw, X, ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { useLearning } from '../context/LearningContext';

interface QuestionItem {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

interface MistakeRecord {
  question: string;
  yourAnswer: string;
  correctAnswer: string;
  explanation: string;
}

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

function getTopicVisualTheme(topicText: string, subjectText: string) {
  const t = (topicText + ' ' + subjectText).toLowerCase();
  if (/(heart|blood|cardiac|circulat|anatomy|digest|brain|cell|mitosis|dna|gene)/.test(t)) {
    return { heroEmoji: '🧬', bossEmoji: '🦠', bossTitle: 'Bio-Reactor Core', projectile: '💉', accent: '#EF4444' };
  }
  if (/(solar|planet|space|star|orbit|galaxy|kepler|moon|astronomy|gravity|newton|force|physics)/.test(t)) {
    return { heroEmoji: '🧑‍🚀', bossEmoji: '🪐', bossTitle: 'Cosmic Singularity', projectile: '⚡', accent: '#38BDF8' };
  }
  if (/(volcano|earth|water|climate|ocean|mountain|tectonic|weather)/.test(t)) {
    return { heroEmoji: '🛡️', bossEmoji: '🌋', bossTitle: 'Magma Titan', projectile: '🌊', accent: '#F97316' };
  }
  if (/(quadratic|math|equation|algebra|geometry|calculus|fraction)/.test(t)) {
    return { heroEmoji: '🧙‍♂️', bossEmoji: '📐', bossTitle: 'Matrix Guardian', projectile: '✨', accent: '#8B5CF6' };
  }
  if (/(war|history|empire|democracy|revolution|social)/.test(t)) {
    return { heroEmoji: '⚔️', bossEmoji: '🏰', bossTitle: 'Chronos Citadel', projectile: '🏹', accent: '#F59E0B' };
  }
  if (/(grammar|english|verb|voice|tense|literature)/.test(t)) {
    return { heroEmoji: '🦸', bossEmoji: '📜', bossTitle: 'Lexicon Sphinx', projectile: '✒️', accent: '#EC4899' };
  }
  return { heroEmoji: '🤖', bossEmoji: '👾', bossTitle: `${topicText.slice(0, 18)} Boss`, projectile: '🔥', accent: '#FF6A00' };
}

export const EducationalGamesModal: React.FC = () => {
  const { modalGames, closeGamesHub, apiFetch, triggerRefresh } = useLearning();
  const [selectedGame, setSelectedGame] = useState<'answer_battle' | 'learning_runner' | 'space_shooter'>(
    modalGames.initialGame || 'answer_battle'
  );
  const [topic, setTopic] = useState(modalGames.topic || 'Solar System');
  const [subject, setSubject] = useState(modalGames.subject || 'Science');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'finished'>('setup');

  // Shared game progress state
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(1);
  const [stage, setStage] = useState(1);
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong'; text: string } | null>(null);

  // Continuous animation clock (ticks every 50ms = 20fps React state + smooth CSS interpolation)
  const [animTick, setAnimTick] = useState(0);

  // Game A: Answer Battle animations (projectile firing, boss hit explosion, floating score popup)
  const [battleAttack, setBattleAttack] = useState<{
    targetIdx: number;
    isCorrect: boolean;
    phase: 'firing' | 'impact';
  } | null>(null);

  // Game B: Learning Runner specific state (3 lanes: 0, 1, 2; gate Y progress 0..100)
  const [runnerLane, setRunnerLane] = useState<number>(1);
  const [gateProgress, setGateProgress] = useState<number>(10);
  const [laneOptions, setLaneOptions] = useState<Array<{ optionIndex: number; text: string }>>([]);
  const [runnerBurst, setRunnerBurst] = useState<'correct' | 'wrong' | null>(null);

  // Game C: Space Quiz Shooter specific state (ship sector 0..3, laser firing animation, saucer descent)
  const [shipSector, setShipSector] = useState<number>(1);
  const [laserFiring, setLaserFiring] = useState<number | null>(null);
  const [saucerExplosion, setSaucerExplosion] = useState<{ sector: number; isCorrect: boolean } | null>(null);
  const [saucerDescent, setSaucerDescent] = useState<number>(14);

  useEffect(() => {
    if (modalGames.open) {
      const nextTopic = modalGames.topic || 'Solar System';
      setTopic(nextTopic);
      setSubject(modalGames.subject || inferClientSubject(nextTopic));
      if (modalGames.initialGame) setSelectedGame(modalGames.initialGame);
      setGameState('setup');
    }
  }, [modalGames.open, modalGames.topic, modalGames.subject, modalGames.initialGame]);

  // Continuous animation loop while playing any game
  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      setAnimTick((t) => t + 1);
    }, 55);
    return () => clearInterval(timer);
  }, [gameState]);

  const currentQ = questions[qIndex];
  const theme = getTopicVisualTheme(topic, subject);

  // Prepare 3 lane choices for Learning Runner whenever question changes
  useEffect(() => {
    if (!currentQ) return;
    const correctOpt = { optionIndex: currentQ.correctIndex, text: currentQ.options[currentQ.correctIndex] };
    const wrongOpts = currentQ.options
      .map((text, idx) => ({ optionIndex: idx, text }))
      .filter((o) => o.optionIndex !== currentQ.correctIndex)
      .slice(0, 2);
    const three = [correctOpt, ...wrongOpts];
    const rotated = [
      three[qIndex % 3],
      three[(qIndex + 1) % 3],
      three[(qIndex + 2) % 3]
    ];
    setLaneOptions(rotated);
    setGateProgress(8);
    setSaucerDescent(12);
    setBattleAttack(null);
    setRunnerBurst(null);
    setSaucerExplosion(null);
  }, [qIndex, currentQ]);

  // Game B (Learning Runner) continuous forward sprint loop
  useEffect(() => {
    if (gameState !== 'playing' || selectedGame !== 'learning_runner' || !currentQ || feedback) return;
    const speedStep = difficulty === 'hard' ? 2.4 : difficulty === 'medium' ? 1.8 : 1.3;
    const timer = setInterval(() => {
      setGateProgress((prev) => {
        if (prev >= 84) {
          return 84;
        }
        return prev + speedStep;
      });
    }, 75);
    return () => clearInterval(timer);
  }, [gameState, selectedGame, currentQ, feedback, difficulty]);

  // Trigger lane gate collision when gate reaches runner (progress >= 84)
  useEffect(() => {
    if (gameState === 'playing' && selectedGame === 'learning_runner' && gateProgress >= 84 && !feedback && laneOptions.length === 3) {
      const chosen = laneOptions[runnerLane];
      if (chosen) {
        setRunnerBurst(chosen.optionIndex === currentQ?.correctIndex ? 'correct' : 'wrong');
        evaluateChoice(chosen.optionIndex);
      }
    }
  }, [gateProgress, gameState, selectedGame, runnerLane, feedback, laneOptions, currentQ]);

  // Game C (Space Shooter) saucer descent loop
  useEffect(() => {
    if (gameState !== 'playing' || selectedGame !== 'space_shooter' || !currentQ || feedback) return;
    const speedStep = difficulty === 'hard' ? 1.5 : difficulty === 'medium' ? 1.1 : 0.8;
    const timer = setInterval(() => {
      setSaucerDescent((prev) => (prev < 74 ? prev + speedStep : prev));
    }, 90);
    return () => clearInterval(timer);
  }, [gameState, selectedGame, currentQ, feedback, difficulty]);

  // Keyboard controls for all 3 games
  useEffect(() => {
    if (gameState !== 'playing') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (selectedGame === 'answer_battle') {
        if (['1', 'a', 'A'].includes(e.key)) triggerBattleStrike(0);
        if (['2', 'b', 'B'].includes(e.key)) triggerBattleStrike(1);
        if (['3', 'c', 'C'].includes(e.key)) triggerBattleStrike(2);
        if (['4', 'd', 'D'].includes(e.key)) triggerBattleStrike(3);
      } else if (selectedGame === 'learning_runner') {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          setRunnerLane((l) => Math.max(0, l - 1));
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          setRunnerLane((l) => Math.min(2, l + 1));
        }
      } else if (selectedGame === 'space_shooter') {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          setShipSector((s) => Math.max(0, s - 1));
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          setShipSector((s) => Math.min(3, s + 1));
        } else if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          fireSpaceLaser(shipSector);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameState, selectedGame, shipSector, feedback, currentQ]);

  if (!modalGames.open) return null;

  const startGame = async (overrideTopic?: string) => {
    const activeTopicStr = (overrideTopic ?? topic).trim() || 'Solar System';
    const inferredSubj = inferClientSubject(activeTopicStr);
    setTopic(activeTopicStr);
    setSubject(inferredSubj);
    setLoading(true);
    try {
      const res = await apiFetch('/api/games/questions', {
        method: 'POST',
        body: JSON.stringify({
          topic: activeTopicStr,
          subject: inferredSubj,
          difficulty,
          count: 6
        })
      });
      if (res.subject) setSubject(res.subject);
      setQuestions(res.questions || []);
      setQIndex(0);
      setScore(0);
      setLives(3);
      setCombo(1);
      setStage(1);
      setCorrectCount(0);
      setMistakes([]);
      setFeedback(null);
      setRunnerLane(1);
      setShipSector(1);
      setGameState('playing');
    } finally {
      setLoading(false);
    }
  };

  const finishAndSaveSession = async (finalScore: number, finalCorrect: number, finalMistakes: MistakeRecord[], finalStage: number) => {
    setGameState('finished');
    try {
      await apiFetch('/api/games/sessions', {
        method: 'POST',
        body: JSON.stringify({
          game_type: selectedGame,
          topic,
          subject,
          difficulty,
          score: finalScore,
          correct_count: finalCorrect,
          total_questions: questions.length || 6,
          stage_reached: finalStage,
          duration_seconds: 65,
          mistakes: finalMistakes
        })
      });
      triggerRefresh();
    } catch {
      // Non-blocking save
    }
  };

  const evaluateChoice = (chosenOptionIdx: number) => {
    if (!currentQ || feedback) return;
    const isCorrect = chosenOptionIdx === currentQ.correctIndex;
    const pointBase = selectedGame === 'space_shooter' ? 250 : selectedGame === 'learning_runner' ? 200 : 150;

    let nextScore = score;
    let nextCorrect = correctCount;
    let nextLives = lives;
    let nextCombo = combo;
    let nextStage = stage;
    const nextMistakes = [...mistakes];

    if (isCorrect) {
      nextScore = score + pointBase * combo;
      nextCorrect = correctCount + 1;
      nextCombo = combo + 1;
      nextStage = stage + 1;
      setScore(nextScore);
      setCorrectCount(nextCorrect);
      setCombo(nextCombo);
      setStage(nextStage);
      setFeedback({
        type: 'correct',
        text: `💥 DIRECT HIT! (+${pointBase * combo} pts) — ${currentQ.explanation}`
      });
    } else {
      nextLives = lives - 1;
      nextCombo = 1;
      const mistakeItem: MistakeRecord = {
        question: currentQ.question,
        yourAnswer: currentQ.options[chosenOptionIdx] || 'Missed Target',
        correctAnswer: currentQ.options[currentQ.correctIndex],
        explanation: currentQ.explanation
      };
      nextMistakes.push(mistakeItem);
      setLives(nextLives);
      setCombo(1);
      setMistakes(nextMistakes);
      setFeedback({
        type: 'wrong',
        text: `⚠️ SHIELD HIT (-1 Shield)! Correct Target: "${currentQ.options[currentQ.correctIndex]}" — ${currentQ.explanation}`
      });
    }

    setTimeout(() => {
      setFeedback(null);
      setBattleAttack(null);
      setRunnerBurst(null);
      setSaucerExplosion(null);
      if (nextLives <= 0 || qIndex + 1 >= questions.length) {
        finishAndSaveSession(nextScore, nextCorrect, nextMistakes, nextStage);
      } else {
        setQIndex((prev) => prev + 1);
      }
    }, 1550);
  };

  const triggerBattleStrike = (idx: number) => {
    if (!currentQ || feedback || battleAttack) return;
    const isCorrect = idx === currentQ.correctIndex;
    setBattleAttack({ targetIdx: idx, isCorrect, phase: 'firing' });
    setTimeout(() => {
      setBattleAttack({ targetIdx: idx, isCorrect, phase: 'impact' });
      evaluateChoice(idx);
    }, 260);
  };

  const fireSpaceLaser = (sectorIdx: number) => {
    if (!currentQ || feedback || laserFiring !== null) return;
    const isCorrect = sectorIdx === currentQ.correctIndex;
    setShipSector(sectorIdx);
    setLaserFiring(sectorIdx);
    setTimeout(() => {
      setLaserFiring(null);
      setSaucerExplosion({ sector: sectorIdx, isCorrect });
      evaluateChoice(sectorIdx);
    }, 250);
  };

  const bossHpPercent = questions.length > 0 ? Math.max(0, Math.round(((questions.length - correctCount) / questions.length) * 100)) : 100;

  return (
    <div className="glass-modal-overlay" role="dialog" aria-modal="true" aria-label="Educational Games Arcade">
      <div className="glass-modal-content" style={{ maxWidth: 900 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 42, height: 42, borderRadius: 14, background: '#FFF3E8', color: '#FF6A00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Gamepad2 size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>STUDYAI Animated Educational Games Arcade</h2>
              <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Real-time animated action games generated dynamically for any topic you choose</p>
            </div>
          </div>
          <button type="button" onClick={closeGamesHub} className="btn-glass" style={{ padding: '6px 10px' }} aria-label="Close Games Arcade">
            <X size={16} />
          </button>
        </div>

        {/* Game Mode Selector Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
          {[
            { id: 'answer_battle', title: 'Game A: Boss Battle Arena', desc: 'Animated Projectile Combat', icon: Crosshair },
            { id: 'learning_runner', title: 'Game B: Speed Runner 3D', desc: 'Animated 3-Lane Highway Sprint', icon: Zap },
            { id: 'space_shooter', title: 'Game C: Starfighter Defense', desc: 'Animated UFO Laser Shooter', icon: Rocket }
          ].map((g) => {
            const Icon = g.icon;
            const active = selectedGame === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  setSelectedGame(g.id as any);
                  if (gameState === 'finished') setGameState('setup');
                }}
                style={{
                  padding: '11px 14px',
                  borderRadius: 18,
                  border: active ? '2px solid #FF6A00' : '1px solid rgba(0,0,0,0.1)',
                  background: active ? '#FFF3E8' : '#FFFFFF',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 12, background: active ? '#FF6A00' : '#F3F4F6', color: active ? '#FFF' : '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#202124' }}>{g.title}</div>
                  <div style={{ fontSize: '0.73rem', color: '#6B7280' }}>{g.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* SETUP SCREEN */}
        {gameState === 'setup' && (
          <div style={{ padding: 20, borderRadius: 22, background: '#FFFDFB', border: '1px solid rgba(255,106,0,0.22)' }}>
            {/* Quick Topic Launch Chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280' }}>Instant Topic Missions:</span>
              {[
                'Solar System & Orbits',
                'Human Heart & Blood Flow',
                'Quadratic Equations',
                'Newton’s Laws of Motion',
                'Volcanoes & Plate Tectonics',
                'DNA Double Helix',
                'World War II',
                'English Passive Voice',
                'Photosynthesis'
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  disabled={loading}
                  onClick={() => startGame(preset)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 999,
                    border: topic.toLowerCase() === preset.toLowerCase() ? '1.5px solid #FF6A00' : '1px solid rgba(0,0,0,0.12)',
                    background: topic.toLowerCase() === preset.toLowerCase() ? '#FFF3E8' : '#FFFFFF',
                    color: topic.toLowerCase() === preset.toLowerCase() ? '#E85D00' : '#374151',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ⚡ {preset}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', marginBottom: 6 }}>Custom Game Topic</label>
                <div className="glass-input-wrap">
                  <input
                    className="glass-input"
                    value={topic}
                    onChange={(e) => {
                      setTopic(e.target.value);
                      setSubject(inferClientSubject(e.target.value));
                    }}
                    placeholder="Enter ANY topic (e.g., Gravity, Fractions, Volcanoes)..."
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', marginBottom: 6 }}>Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 999, border: '1px solid rgba(0,0,0,0.12)', fontWeight: 600 }}
                >
                  <option value="Science">Science</option>
                  <option value="Maths">Maths</option>
                  <option value="English">English</option>
                  <option value="Social Studies">Social Studies</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', marginBottom: 6 }}>Difficulty & Animation Speed</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 999, border: '1px solid rgba(0,0,0,0.12)', fontWeight: 600 }}
                >
                  <option value="easy">Easy (Foundation Speed)</option>
                  <option value="medium">Medium (Arcade Standard)</option>
                  <option value="hard">Hard (Turbo Challenge)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ fontSize: '0.84rem', color: '#374151', fontWeight: 600 }}>
                {selectedGame === 'answer_battle' && `${theme.heroEmoji} Battle the ${theme.bossTitle} (${theme.bossEmoji})! Strike the moving energy orbs to fire plasma bolts and drain the Boss HP bar!`}
                {selectedGame === 'learning_runner' && '🏃 Sprint down the animated 3-lane cyber highway (Arrow keys or Lane buttons) and crash through the glowing answer portal!'}
                {selectedGame === 'space_shooter' && '🚀 Pilot your starfighter across 4 space sectors and fire twin plasma lasers at the weaving alien saucers!'}
              </div>
              <button type="button" onClick={() => startGame()} className="btn-orange" disabled={loading}>
                <Sparkles size={16} />
                <span>{loading ? `Generating "${topic}" Arena...` : 'Launch Animated Game →'}</span>
              </button>
            </div>
          </div>
        )}

        {/* PLAYING SCREEN */}
        {gameState === 'playing' && currentQ && (
          <div>
            {/* HUD Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderRadius: 16, background: '#0F172A', color: '#FFFFFF', marginBottom: 12, flexWrap: 'wrap', gap: 10, border: '1px solid #334155' }}>
              <div style={{ fontWeight: 800, color: '#FF6A00', fontSize: '0.95rem' }}>
                ⚡ SCORE: {score} PTS <span style={{ color: '#38BDF8', fontSize: '0.8rem', marginLeft: 6 }}>({combo}x COMBO🔥)</span>
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F8FAFC' }}>
                Wave {qIndex + 1} / {questions.length} • {topic} ({subject})
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>Shields:</span>
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i} style={{ opacity: i < lives ? 1 : 0.2, transform: i < lives ? `scale(${1 + Math.sin(animTick * 0.25 + i) * 0.08})` : 'scale(0.85)', display: 'inline-block' }}>
                    🛡️
                  </span>
                ))}
              </div>
            </div>

            {/* Active Question Banner */}
            <div style={{ padding: '12px 18px', borderRadius: 18, background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)', border: '2px solid #FF6A00', marginBottom: 12, boxShadow: '0 6px 18px rgba(255,106,0,0.12)' }}>
              <div style={{ fontSize: '0.73rem', fontWeight: 800, color: '#EA580C', textTransform: 'uppercase', marginBottom: 3 }}>
                🎯 MISSION QUESTION {qIndex + 1} • {topic.toUpperCase()}
              </div>
              <div style={{ fontSize: '1.04rem', fontWeight: 800, color: '#202124' }}>{currentQ.question}</div>
            </div>

            {/* Feedback Toast */}
            {feedback && (
              <div
                style={{
                  padding: '10px 16px',
                  borderRadius: 14,
                  marginBottom: 12,
                  background: feedback.type === 'correct' ? '#ECFDF5' : '#FEF2F2',
                  color: feedback.type === 'correct' ? '#047857' : '#DC2626',
                  border: feedback.type === 'correct' ? '1.5px solid #10B981' : '1.5px solid #EF4444',
                  fontWeight: 800,
                  fontSize: '0.86rem'
                }}
              >
                {feedback.text}
              </div>
            )}

            {/* =====================================================================
                GAME A: ANIMATED BOSS BATTLE & MOVING TARGET ARENA
               ===================================================================== */}
            {selectedGame === 'answer_battle' && (
              <div
                style={{
                  borderRadius: 22,
                  background: 'radial-gradient(circle at 50% 25%, #1E1B4B 0%, #090D16 100%)',
                  border: '2px solid #FF6A00',
                  padding: 18,
                  color: '#FFFFFF',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 14px 32px rgba(15, 23, 42, 0.4)'
                }}
              >
                {/* Animated Cyber Battle Stage (Hero vs Boss Guardian) */}
                <div
                  style={{
                    position: 'relative',
                    height: 128,
                    borderRadius: 18,
                    background: 'linear-gradient(90deg, rgba(56,189,248,0.14) 0%, rgba(15,23,42,0.85) 50%, rgba(239,68,68,0.18) 100%)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 28px',
                    overflow: 'hidden'
                  }}
                >
                  {/* Animated Grid Floor Lines */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(180deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                      backgroundSize: '32px 32px',
                      backgroundPositionX: `${-(animTick * 3) % 32}px`,
                      pointerEvents: 'none'
                    }}
                  />

                  {/* Left: Animated Student Hero Avatar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, zIndex: 2 }}>
                    <div
                      style={{
                        width: 68,
                        height: 68,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, #38BDF8 0%, #0284C7 100%)',
                        border: '3px solid #E0F2FE',
                        boxShadow: '0 0 22px rgba(56,189,248,0.65)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        transform: `translateY(${Math.sin(animTick * 0.22) * 6}px)`
                      }}
                    >
                      {theme.heroEmoji}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase' }}>STUDENT DEFENDER</div>
                      <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#FFFFFF' }}>Combo Power: {combo}x</div>
                      <div style={{ width: 120, height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.18)', marginTop: 6, overflow: 'hidden' }}>
                        <div style={{ width: `${(lives / 3) * 100}%`, height: '100%', background: '#22C55E', transition: 'width 0.3s ease' }} />
                      </div>
                    </div>
                  </div>

                  {/* Center: Live Projectile & Explosion Animation */}
                  <div style={{ flex: 1, position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
                    {!battleAttack && (
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#FDBA74', textAlign: 'center', opacity: 0.85 }}>
                        ⚡ Strike any moving target orb below to fire {theme.projectile} plasma!
                      </div>
                    )}
                    {battleAttack && battleAttack.phase === 'firing' && (
                      <div
                        style={{
                          width: '80%',
                          height: 8,
                          borderRadius: 999,
                          background: 'linear-gradient(90deg, #38BDF8 0%, #FF6A00 50%, #FACC15 100%)',
                          boxShadow: '0 0 24px #FF6A00',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          fontSize: '1.6rem'
                        }}
                      >
                        {theme.projectile}
                      </div>
                    )}
                    {battleAttack && battleAttack.phase === 'impact' && (
                      <div
                        style={{
                          padding: '8px 18px',
                          borderRadius: 999,
                          background: battleAttack.isCorrect ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.28)',
                          border: `2px solid ${battleAttack.isCorrect ? '#22C55E' : '#EF4444'}`,
                          color: '#FFFFFF',
                          fontWeight: 900,
                          fontSize: '1rem',
                          transform: 'scale(1.12)',
                          boxShadow: `0 0 28px ${battleAttack.isCorrect ? '#22C55E' : '#EF4444'}`
                        }}
                      >
                        {battleAttack.isCorrect ? `💥 CRITICAL HIT! +${150 * combo} PTS!` : '🛡️ BOSS COUNTER-ATTACK!'}
                      </div>
                    )}
                  </div>

                  {/* Right: Animated Topic Boss Guardian */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, zIndex: 2 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#FCA5A5', textTransform: 'uppercase' }}>{theme.bossTitle}</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#FFFFFF' }}>Boss HP: {bossHpPercent}%</div>
                      <div style={{ width: 130, height: 9, borderRadius: 999, background: 'rgba(255,255,255,0.18)', marginTop: 6, overflow: 'hidden' }}>
                        <div style={{ width: `${bossHpPercent}%`, height: '100%', background: 'linear-gradient(90deg, #F97316, #EF4444)', transition: 'width 0.35s ease' }} />
                      </div>
                    </div>
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, #EF4444 0%, #7F1D1D 100%)',
                        border: '3px solid #FCA5A5',
                        boxShadow: '0 0 26px rgba(239,68,68,0.75)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.1rem',
                        transform:
                          battleAttack?.phase === 'impact' && battleAttack.isCorrect
                            ? 'scale(1.25) rotate(14deg)'
                            : `translateY(${Math.cos(animTick * 0.22) * 7}px) rotate(${Math.sin(animTick * 0.12) * 6}deg)`
                      }}
                    >
                      {theme.bossEmoji}
                    </div>
                  </div>
                </div>

                {/* 4 Animated Oscillating Target Orbs */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                    gap: 14
                  }}
                >
                  {currentQ.options.map((opt, idx) => {
                    const offsetX = Math.sin(animTick * 0.16 + idx * 1.6) * 5;
                    const offsetY = Math.cos(animTick * 0.18 + idx * 1.3) * 4;
                    const isTargeted = battleAttack?.targetIdx === idx;
                    const isCorrectOpt = idx === currentQ.correctIndex;

                    let borderCol = '#FF6A00';
                    let bgCol = 'rgba(30, 41, 59, 0.92)';
                    if (feedback && isCorrectOpt) {
                      borderCol = '#22C55E';
                      bgCol = 'rgba(20, 83, 45, 0.9)';
                    } else if (isTargeted && ! isCorrectOpt && feedback) {
                      borderCol = '#EF4444';
                      bgCol = 'rgba(127, 29, 29, 0.9)';
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={Boolean(feedback || battleAttack)}
                        onClick={() => triggerBattleStrike(idx)}
                        style={{
                          padding: '16px 16px',
                          borderRadius: 20,
                          border: `2px solid ${borderCol}`,
                          background: bgCol,
                          color: '#FFFFFF',
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          boxShadow: isTargeted ? `0 0 24px ${borderCol}` : '0 8px 20px rgba(0,0,0,0.35)',
                          transform: `translate(${offsetX}px, ${offsetY}px)`,
                          transition: 'background 0.2s ease, border-color 0.2s ease'
                        }}
                      >
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, #FF6A00 0%, #9A3412 100%)',
                            border: '2px solid #FDBA74',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 900,
                            fontSize: '0.95rem',
                            flexShrink: 0,
                            boxShadow: '0 0 12px rgba(255,106,0,0.6)'
                          }}
                        >
                          🎯 {String.fromCharCode(65 + idx)}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#FDBA74', letterSpacing: '0.04em' }}>
                            MOVING ORB {String.fromCharCode(65 + idx)} [KEY {idx + 1}]
                          </div>
                          <div style={{ fontSize: '0.93rem', fontWeight: 700, color: '#F8FAFC', marginTop: 2 }}>{opt}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* =====================================================================
                GAME B: LEARNING RUNNER (ANIMATED 3-LANE CYBER HIGHWAY SPRINT)
               ===================================================================== */}
            {selectedGame === 'learning_runner' && (
              <div>
                <div
                  style={{
                    position: 'relative',
                    height: 300,
                    borderRadius: 22,
                    background: 'linear-gradient(180deg, #090D16 0%, #1E1B4B 45%, #0F172A 100%)',
                    overflow: 'hidden',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    border: '2px solid #38BDF8',
                    marginBottom: 12,
                    boxShadow: '0 14px 32px rgba(15, 23, 42, 0.45)'
                  }}
                >
                  {/* Scrolling Horizon Speed Banner */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 14,
                      zIndex: 5,
                      padding: '4px 10px',
                      borderRadius: 999,
                      background: 'rgba(15,23,42,0.85)',
                      border: '1px solid #38BDF8',
                      color: '#38BDF8',
                      fontSize: '0.72rem',
                      fontWeight: 800
                    }}
                  >
                    ⚡ SPEED: {28 + combo * 4} KM/H • DISTANCE: {animTick * 3}m
                  </div>

                  {[0, 1, 2].map((laneIdx) => {
                    const gateOpt = laneOptions[laneIdx];
                    const isRunnerHere = runnerLane === laneIdx;
                    const gateScale = 0.72 + (gateProgress / 100) * 0.34;
                    return (
                      <div
                        key={laneIdx}
                        onClick={() => setRunnerLane(laneIdx)}
                        style={{
                          position: 'relative',
                          cursor: 'pointer',
                          background: isRunnerHere
                            ? 'linear-gradient(180deg, rgba(255,106,0,0.05) 0%, rgba(255,106,0,0.22) 100%)'
                            : 'transparent',
                          borderRight: laneIdx < 2 ? 'none' : undefined
                        }}
                      >
                        {/* Animated Scrolling Dashed Highway Divider */}
                        {laneIdx < 2 && (
                          <div
                            style={{
                              position: 'absolute',
                              top: 0,
                              bottom: 0,
                              right: 0,
                              width: 4,
                              backgroundImage: 'linear-gradient(180deg, #38BDF8 50%, transparent 50%)',
                              backgroundSize: '4px 36px',
                              backgroundPositionY: `${(animTick * 12) % 36}px`,
                              opacity: 0.55
                            }}
                          />
                        )}

                        <div style={{ textAlign: 'center', padding: 8, fontSize: '0.74rem', color: '#94A3B8', fontWeight: 800 }}>
                          LANE {laneIdx + 1}
                        </div>

                        {/* Approaching Glowing Answer Portal Gate */}
                        {gateOpt && (
                          <div
                            style={{
                              position: 'absolute',
                              left: 12,
                              right: 12,
                              top: `${gateProgress}%`,
                              transform: `translateY(-50%) scale(${gateScale})`,
                              padding: '12px 10px',
                              borderRadius: 16,
                              background: 'linear-gradient(135deg, #FF6A00 0%, #EA580C 100%)',
                              border: '2px solid #FDE047',
                              color: '#FFFFFF',
                              fontSize: '0.8rem',
                              fontWeight: 800,
                              textAlign: 'center',
                              boxShadow: '0 0 22px rgba(255,106,0,0.65)',
                              zIndex: 3
                            }}
                          >
                            <div style={{ fontSize: '0.65rem', color: '#FEF08A', textTransform: 'uppercase', marginBottom: 2 }}>
                              ⚡ ENERGY GATE {laneIdx + 1}
                            </div>
                            {gateOpt.text}
                          </div>
                        )}

                        {/* Animated Player Runner Avatar at bottom of lane */}
                        {isRunnerHere && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: 14,
                              left: '50%',
                              transform: `translateX(-50%) translateY(${Math.abs(Math.sin(animTick * 0.45)) * -10}px)`,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              zIndex: 4
                            }}
                          >
                            {runnerBurst && (
                              <div
                                style={{
                                  marginBottom: 4,
                                  padding: '3px 10px',
                                  borderRadius: 999,
                                  background: runnerBurst === 'correct' ? '#22C55E' : '#EF4444',
                                  color: '#FFF',
                                  fontSize: '0.72rem',
                                  fontWeight: 900
                                }}
                              >
                                {runnerBurst === 'correct' ? '✨ PORTAL BOOST!' : '💥 CRASH!'}
                              </div>
                            )}
                            <div
                              style={{
                                width: 52,
                                height: 52,
                                borderRadius: '50%',
                                background: 'radial-gradient(circle, #22C55E 0%, #15803D 100%)',
                                border: '3px solid #BBF7D0',
                                boxShadow: '0 0 24px #22C55E',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.65rem'
                              }}
                            >
                              🏃
                            </div>
                            <div
                              style={{
                                marginTop: 3,
                                padding: '2px 10px',
                                borderRadius: 999,
                                background: '#22C55E',
                                color: '#052E16',
                                fontWeight: 900,
                                fontSize: '0.68rem'
                              }}
                            >
                              SPRINTER
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Touch / Desktop Lane Controls */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setRunnerLane((l) => Math.max(0, l - 1))}
                    className="btn-glass"
                    aria-label="Move Left Lane"
                  >
                    <ArrowLeft size={16} /> Move Left
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const chosen = laneOptions[runnerLane];
                      if (chosen) {
                        setRunnerBurst(chosen.optionIndex === currentQ?.correctIndex ? 'correct' : 'wrong');
                        evaluateChoice(chosen.optionIndex);
                      }
                    }}
                    className="btn-orange"
                  >
                    ⚡ Turbo Dash Through Lane {runnerLane + 1}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRunnerLane((l) => Math.min(2, l + 1))}
                    className="btn-glass"
                    aria-label="Move Right Lane"
                  >
                    Move Right <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* =====================================================================
                GAME C: SPACE QUIZ SHOOTER (ANIMATED STARFIELD & UFO FLEET)
               ===================================================================== */}
            {selectedGame === 'space_shooter' && (
              <div>
                <div
                  style={{
                    position: 'relative',
                    height: 300,
                    borderRadius: 22,
                    background: 'radial-gradient(circle at 50% 20%, #1E1B4B 0%, #090D16 100%)',
                    overflow: 'hidden',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    border: '2px solid #818CF8',
                    marginBottom: 12,
                    boxShadow: '0 14px 32px rgba(15, 23, 42, 0.5)'
                  }}
                >
                  {/* Scrolling Animated Starfield Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage: 'radial-gradient(#FFFFFF 1.5px, transparent 1.5px), radial-gradient(#38BDF8 1px, transparent 1px)',
                      backgroundSize: '48px 48px, 32px 32px',
                      backgroundPosition: `0px ${(animTick * 4) % 48}px, 16px ${(animTick * 7) % 32}px`,
                      opacity: 0.3,
                      pointerEvents: 'none'
                    }}
                  />

                  {currentQ.options.map((opt, idx) => {
                    const isShipHere = shipSector === idx;
                    const isLaserHere = laserFiring === idx;
                    const isExploding = saucerExplosion?.sector === idx;
                    const saucerWaveX = Math.sin(animTick * 0.22 + idx * 1.4) * 7;

                    return (
                      <div
                        key={idx}
                        onClick={() => fireSpaceLaser(idx)}
                        style={{
                          position: 'relative',
                          borderRight: idx < 3 ? '1px dashed rgba(255,255,255,0.14)' : 'none',
                          cursor: 'crosshair',
                          padding: 8,
                          zIndex: 2
                        }}
                      >
                        <div style={{ textAlign: 'center', fontSize: '0.68rem', fontWeight: 800, color: '#818CF8' }}>
                          SECTOR {idx + 1}
                        </div>

                        {/* Descending Weaving Alien Saucer Target */}
                        <div
                          style={{
                            position: 'absolute',
                            left: 8,
                            right: 8,
                            top: `${saucerDescent}%`,
                            transform: `translateX(${saucerWaveX}px) scale(${isExploding ? 1.25 : 1})`,
                            padding: '10px 8px',
                            borderRadius: 16,
                            background: isExploding
                              ? saucerExplosion?.isCorrect
                                ? 'rgba(34, 197, 94, 0.85)'
                                : 'rgba(239, 68, 68, 0.85)'
                              : 'rgba(15, 23, 42, 0.88)',
                            border: `2px solid ${isExploding ? '#FACC15' : '#38BDF8'}`,
                            color: '#F8FAFC',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            textAlign: 'center',
                            boxShadow: isExploding ? '0 0 28px #FACC15' : '0 0 16px rgba(56,189,248,0.35)',
                            transition: 'transform 0.15s ease'
                          }}
                        >
                          <div style={{ fontSize: '1.25rem', marginBottom: 2 }}>
                            {isExploding ? (saucerExplosion?.isCorrect ? '💥🌟💥' : '💥⚠️💥') : '🛸'}
                          </div>
                          {opt}
                        </div>

                        {/* Twin Plasma Laser Beam */}
                        {isLaserHere && (
                          <div
                            style={{
                              position: 'absolute',
                              left: '50%',
                              top: `${saucerDescent}%`,
                              bottom: 54,
                              width: 8,
                              transform: 'translateX(-50%)',
                              background: 'linear-gradient(180deg, #FACC15 0%, #FF6A00 100%)',
                              boxShadow: '0 0 22px #FF6A00',
                              borderRadius: 999
                            }}
                          />
                        )}

                        {/* Animated Starship Fighter at bottom */}
                        {isShipHere && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: 10,
                              left: '50%',
                              transform: `translateX(-50%) translateY(${Math.sin(animTick * 0.35) * 4}px)`,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center'
                            }}
                          >
                            <div
                              style={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                background: 'radial-gradient(circle, #FF6A00 0%, #9A3412 100%)',
                                border: '2px solid #FDE047',
                                boxShadow: '0 0 20px #FF6A00',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem'
                              }}
                            >
                              🚀
                            </div>
                            <div style={{ fontSize: '0.75rem', marginTop: -2, opacity: 0.8 + (animTick % 2) * 0.2 }}>🔥</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => setShipSector((s) => Math.max(0, s - 1))} className="btn-glass">
                    <ArrowLeft size={15} /> Sector Left
                  </button>
                  <button type="button" onClick={() => fireSpaceLaser(shipSector)} className="btn-orange">
                    🔥 Fire Twin Plasma Lasers (Sector {shipSector + 1})
                  </button>
                  <button type="button" onClick={() => setShipSector((s) => Math.min(3, s + 1))} className="btn-glass">
                    Sector Right <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* FINISHED / RESULTS & MISTAKE REVIEW SCREEN */}
        {gameState === 'finished' && (
          <div style={{ padding: 24, borderRadius: 22, background: '#FFFDFB', border: '1.5px solid rgba(255,106,0,0.3)' }}>
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
              <Trophy size={42} color="#FF6A00" />
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: 8 }}>
                Mission Complete on "{topic}"! Score: {score} pts
              </h3>
              <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>
                Correct Answers: {correctCount} / {questions.length} • Stage Reached: {stage} • Saved to your Library & Progress
              </p>
            </div>

            {mistakes.length > 0 ? (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: 8, color: '#DC2626', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={16} /> Review Mistakes & Explanations ({mistakes.length})
                </div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {mistakes.map((m, idx) => (
                    <div key={idx} style={{ padding: 12, borderRadius: 14, background: '#FFF', border: '1px solid rgba(220,38,38,0.2)', fontSize: '0.84rem' }}>
                      <div style={{ fontWeight: 700, color: '#202124' }}>{m.question}</div>
                      <div style={{ color: '#DC2626', marginTop: 3 }}>Your choice: {m.yourAnswer}</div>
                      <div style={{ color: '#15803D', fontWeight: 700 }}>Correct answer: {m.correctAnswer}</div>
                      <div style={{ color: '#6B7280', marginTop: 4 }}>{m.explanation}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ padding: 14, borderRadius: 14, background: '#ECFDF5', color: '#047857', fontWeight: 700, textAlign: 'center', marginBottom: 18 }}>
                <CheckCircle2 size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                Flawless Run! Zero mistakes on {topic}!
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <button type="button" onClick={() => startGame()} className="btn-orange">
                <RotateCcw size={16} /> Play Again
              </button>
              <button type="button" onClick={() => setGameState('setup')} className="btn-glass">
                Change Game or Topic
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
