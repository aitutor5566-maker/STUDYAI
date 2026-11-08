import React, { useEffect, useRef, useState } from 'react';
import { X, Sparkles, Trophy, Shield, Swords, RotateCcw, Award } from 'lucide-react';
import { useLearning } from '../../context/LearningContext';

interface KatanaQuestion {
  id: string;
  subject: string;
  topic: string;
  prompt: string;
  options: string[];
  difficulty: string;
  conceptTag: string;
  questionType: string;
}

export const KatanaGameModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  topic?: string;
  subject?: string;
  stageIndex?: number;
}> = ({ isOpen, onClose, topic = 'Photosynthesis', subject = 'Science', stageIndex = 1 }) => {
  const { apiFetch, triggerRefresh } = useLearning();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Game state
  const [loading, setLoading] = useState<boolean>(true);
  const [sessionId, setSessionId] = useState<string>('');
  const [playerHp, setPlayerHp] = useState<number>(100);
  const [playerMaxHp] = useState<number>(100);
  const [enemyHp, setEnemyHp] = useState<number>(stageIndex === 5 ? 250 : 100);
  const [enemyMaxHp] = useState<number>(stageIndex === 5 ? 250 : 100);
  const [spiritEnergy, setSpiritEnergy] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [comboCount, setComboCount] = useState<number>(0);
  const [currentWave, setCurrentWave] = useState<number>(1);
  const totalWaves = 5;
  const isBoss = stageIndex === 5;

  const [currentQuestion, setCurrentQuestion] = useState<KatanaQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastExplanation, setLastExplanation] = useState<string | null>(null);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);

  // Victory / Defeat
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [earnedXp, setEarnedXp] = useState<number>(0);
  const [earnedStars, setEarnedStars] = useState<number>(0);

  // Animation values
  const warriorStateRef = useRef<'idle' | 'slashing' | 'hit' | 'victory'>('idle');
  const enemyStateRef = useRef<'idle' | 'hit'>('idle');
  const actionProgressRef = useRef<number>(0);
  const slashParticlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>>([]);
  const firefliesRef = useRef<Array<{ x: number; y: number; r: number; vx: number; vy: number; op: number; ph: number }>>([]);

  // Initialize session
  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    setLoading(true);
    setGameOver(false);
    setIsVictory(false);
    setPlayerHp(100);
    setEnemyHp(isBoss ? 250 : 100);
    setComboCount(0);
    setScore(0);
    setCurrentWave(1);

    // Initialize fireflies
    const flies: any[] = [];
    for (let i = 0; i < 26; i++) {
      flies.push({
        x: Math.random() * 1200,
        y: 80 + Math.random() * 400,
        r: 1.5 + Math.random() * 2.5,
        vx: -0.4 + Math.random() * 0.8,
        vy: -0.3 + Math.random() * 0.6,
        op: 0.4 + Math.random() * 0.6,
        ph: Math.random() * Math.PI * 2
      });
    }
    firefliesRef.current = flies;

    apiFetch('/api/katana/session/start', {
      method: 'POST',
      body: JSON.stringify({
        mode: 'campaign',
        environment: 'moonlit_bamboo_forest',
        subject,
        topic,
        stageIndex
      })
    })
      .then((res) => {
        if (!mounted) return;
        setSessionId(res.sessionId || 'kat-sess-local');
        setPlayerHp(res.playerHp || 100);
        setCurrentWave(res.currentWave || 1);
        if (res.currentQuestion) {
          setCurrentQuestion(res.currentQuestion);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setSessionId('kat-sess-local');
        setCurrentQuestion({
          id: 'kq-fallback-1',
          subject,
          topic,
          prompt: `During photosynthesis in green plants, which molecule is split by sunlight photolysis to release oxygen gas?`,
          options: ['Water (H2O)', 'Carbon dioxide (CO2)', 'Glucose (C6H12O6)'],
          difficulty: 'medium',
          conceptTag: 'Photolysis & Light Reactions',
          questionType: 'mcq_battle'
        });
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, topic, subject, stageIndex, isBoss, apiFetch]);

  // 60 FPS 2.5D Parallax Canvas Loop
  useEffect(() => {
    if (!isOpen) return;

    let time = 0;
    let cameraX = 0;

    const render = () => {
      time += 0.016;
      cameraX += 0.6;

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;
          const groundY = h * 0.72;

          // 1. Layer 1: Night Sky Gradient
          const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
          skyGrad.addColorStop(0, '#060B19');
          skyGrad.addColorStop(0.5, '#0F1E36');
          skyGrad.addColorStop(1, '#0B3B42');
          ctx.fillStyle = skyGrad;
          ctx.fillRect(0, 0, w, h);

          // 2. Full Glowing Moon
          const moonX = w * 0.78 - (cameraX * 0.04) % (w * 0.4);
          const moonY = h * 0.22;
          const moonR = Math.min(w, h) * 0.11;

          // Moon Aura
          ctx.beginPath();
          ctx.arc(moonX, moonY, moonR * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
          ctx.fill();

          // Moon Core
          ctx.beginPath();
          ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
          ctx.fillStyle = '#F1F5F9';
          ctx.fill();

          // Moon Craters
          ctx.fillStyle = 'rgba(203, 213, 225, 0.4)';
          ctx.beginPath();
          ctx.arc(moonX - moonR * 0.3, moonY - moonR * 0.2, moonR * 0.25, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(moonX + moonR * 0.25, moonY + moonR * 0.3, moonR * 0.18, 0, Math.PI * 2);
          ctx.fill();

          // 3. Layer 2: Distant Mountains
          const mountainOffset = (cameraX * 0.15) % (w * 1.5);
          ctx.fillStyle = 'rgba(10, 25, 47, 0.85)';
          ctx.beginPath();
          ctx.moveTo(-w * 0.5 - mountainOffset, groundY);
          for (let x = -w * 0.5 - mountainOffset; x <= w * 2; x += 180) {
            const peakH = 110 + 40 * Math.sin((x + 200) * 0.005);
            ctx.lineTo(x + 90, groundY - peakH);
            ctx.lineTo(x + 180, groundY);
          }
          ctx.lineTo(w, h);
          ctx.lineTo(0, h);
          ctx.closePath();
          ctx.fill();

          // 4. Layer 3: Distant Bamboo (Parallax 0.35)
          const distOffset = (cameraX * 0.35) % 120;
          ctx.strokeStyle = 'rgba(13, 59, 67, 0.65)';
          ctx.lineWidth = 14;
          ctx.lineCap = 'round';
          for (let bx = -100 - distOffset; bx <= w + 100; bx += 70) {
            const sway = Math.sin(time * 1.2 + bx * 0.05) * 6;
            ctx.beginPath();
            ctx.moveTo(bx, groundY);
            ctx.lineTo(bx + sway, groundY - 240);
            ctx.stroke();
          }

          // 5. Layer 4: Near Bamboo Stalks (Parallax 0.65)
          const nearOffset = (cameraX * 0.65) % 160;
          ctx.strokeStyle = '#0E565F';
          ctx.lineWidth = 22;
          for (let bx = -120 - nearOffset; bx <= w + 120; bx += 130) {
            const sway = Math.sin(time * 1.5 + bx * 0.08) * 10;
            ctx.beginPath();
            ctx.moveTo(bx, groundY);
            ctx.lineTo(bx + sway, groundY - 320);
            ctx.stroke();
          }

          // 6. Ground Plane (Stone bridge)
          const groundGrad = ctx.createLinearGradient(0, groundY, 0, h);
          groundGrad.addColorStop(0, '#1C2833');
          groundGrad.addColorStop(1, '#0B1015');
          ctx.fillStyle = groundGrad;
          ctx.fillRect(0, groundY, w, h - groundY);

          // Glowing Orange Edge Line
          ctx.strokeStyle = 'rgba(255, 106, 0, 0.7)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(0, groundY);
          ctx.lineTo(w, groundY);
          ctx.stroke();

          // Firefly Particles
          for (const f of firefliesRef.current) {
            f.x += f.vx;
            f.y += f.vy;
            if (f.x < -20) f.x = w + 20;
            if (f.x > w + 20) f.x = -20;
            const pulse = 0.5 + 0.5 * Math.sin(time * 2.5 + f.ph);
            ctx.fillStyle = `rgba(56, 189, 248, ${f.op * pulse})`;
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
            ctx.fill();
          }

          // 7. Draw Samurai Warrior
          const warriorX = w * 0.28;
          const isSlashing = warriorStateRef.current === 'slashing';
          const isHit = warriorStateRef.current === 'hit';
          const bob = isSlashing ? 0 : Math.sin(time * 3.5) * 3;
          const warriorY = groundY - 60 + bob;

          ctx.save();
          ctx.translate(warriorX + (isHit ? -8 : 0), warriorY);

          // Ground shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.beginPath();
          ctx.ellipse(0, 60 - bob, 24, 6, 0, 0, Math.PI * 2);
          ctx.fill();

          // Body Torso
          ctx.fillStyle = isHit ? '#7F1D1D' : '#0F172A';
          ctx.fillRect(-12, -10, 24, 40);
          ctx.fillStyle = '#1E293B';
          ctx.fillRect(-9, -8, 18, 24);

          // Orange Obi Sash
          ctx.fillStyle = '#FF6A00';
          ctx.fillRect(-11, 8, 22, 6);

          // Head & Hat
          ctx.fillStyle = '#E2E8F0';
          ctx.beginPath();
          ctx.arc(0, -18, 10, 0, Math.PI * 2);
          ctx.fill();

          // Ronin Straw Hat
          ctx.fillStyle = '#B45309';
          ctx.beginPath();
          ctx.moveTo(-22, -22);
          ctx.lineTo(22, -22);
          ctx.lineTo(0, -36);
          ctx.closePath();
          ctx.fill();

          // Glowing Cyan Eye
          ctx.fillStyle = '#38BDF8';
          ctx.beginPath();
          ctx.arc(4, -18, 2, 0, Math.PI * 2);
          ctx.fill();

          // Katana Blade
          ctx.strokeStyle = isSlashing ? '#38BDF8' : '#E2E8F0';
          ctx.lineWidth = 3.5;
          ctx.lineCap = 'round';

          if (isSlashing) {
            actionProgressRef.current += 0.05;
            if (actionProgressRef.current >= 1.0) {
              warriorStateRef.current = 'idle';
              actionProgressRef.current = 0;
            }
            const slashAngle = -Math.PI * 0.3 + actionProgressRef.current * Math.PI * 0.8;
            ctx.save();
            ctx.translate(14, 10);
            ctx.rotate(slashAngle);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(55, 0);
            ctx.stroke();

            // Energy Arc
            ctx.strokeStyle = `rgba(255, 106, 0, ${1.0 - actionProgressRef.current})`;
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.arc(0, 0, 55, -0.5, 0.9);
            ctx.stroke();
            ctx.restore();
          } else {
            ctx.beginPath();
            ctx.moveTo(4, 14);
            ctx.lineTo(28, -8);
            ctx.stroke();
          }
          ctx.restore();

          // 8. Draw Shadow Demon / Boss
          const enemyX = w * 0.72;
          const enemyFloat = Math.sin(time * 3.0 + 1.2) * 5;
          const enemyScale = isBoss ? 1.45 : 1.0;
          const enemyY = groundY - (isBoss ? 80 : 60) + enemyFloat;
          const isEnemyHit = enemyStateRef.current === 'hit';

          ctx.save();
          ctx.translate(enemyX + (isEnemyHit ? 10 : 0), enemyY);
          ctx.scale(enemyScale, enemyScale);

          // Shadow mist body
          ctx.fillStyle = isEnemyHit ? '#EF4444' : (isBoss ? '#4A0404' : '#1E1B4B');
          ctx.beginPath();
          ctx.ellipse(0, 10, isBoss ? 28 : 19, isBoss ? 35 : 24, 0, 0, Math.PI * 2);
          ctx.fill();

          // Red Glowing Eyes
          ctx.fillStyle = '#EF4444';
          ctx.beginPath();
          ctx.arc(-8, -8, isBoss ? 4.5 : 3.0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(8, -8, isBoss ? 4.5 : 3.0, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();

          // 9. Slash Sparks
          for (let i = slashParticlesRef.current.length - 1; i >= 0; i--) {
            const sp = slashParticlesRef.current[i];
            sp.x += sp.vx;
            sp.y += sp.vy;
            sp.life -= 0.04;
            if (sp.life <= 0) {
              slashParticlesRef.current.splice(i, 1);
            } else {
              ctx.strokeStyle = sp.color;
              ctx.lineWidth = 2.5;
              ctx.beginPath();
              ctx.moveTo(sp.x, sp.y);
              ctx.lineTo(sp.x - sp.vx * 3, sp.y - sp.vy * 3);
              ctx.stroke();
            }
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, isBoss]);

  // Handle option selection
  const handleSelectOption = async (option: string) => {
    if (isSubmitting || !currentQuestion || gameOver) return;

    setSelectedOption(option);
    setIsSubmitting(true);

    try {
      const strike = await apiFetch('/api/katana/battle/validate', {
        method: 'POST',
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.id,
          studentAnswer: option,
          timeTakenMs: 1200
        })
      });

      setIsSubmitting(false);
      setLastAnswerCorrect(strike.isCorrect);
      setLastExplanation(strike.explanation);

      setPlayerHp(strike.playerHp);
      setSpiritEnergy(strike.spiritEnergy);
      setComboCount(strike.comboCount);
      setScore(strike.score);

      if (strike.isCorrect) {
        warriorStateRef.current = 'slashing';
        enemyStateRef.current = 'hit';
        actionProgressRef.current = 0;
        setEnemyHp((prev) => Math.max(0, prev - strike.damageDealt));

        // Add particles
        for (let i = 0; i < 18; i++) {
          slashParticlesRef.current.push({
            x: 680 + Math.random() * 60,
            y: 300 + Math.random() * 60,
            vx: -4 + Math.random() * 8,
            vy: -4 + Math.random() * 8,
            life: 1.0,
            color: i % 2 === 0 ? '#FF6A00' : '#38BDF8'
          });
        }
      } else {
        warriorStateRef.current = 'hit';
      }

      // Check stage progression
      if (enemyHp - strike.damageDealt <= 0) {
        if (currentWave < totalWaves) {
          setCurrentWave((w) => w + 1);
          setEnemyHp(isBoss ? 250 : 100);
          if (strike.nextQuestion) setCurrentQuestion(strike.nextQuestion);
        } else {
          // Stage cleared
          handleVictory();
        }
      } else if (strike.playerHp <= 0) {
        setGameOver(true);
        setIsVictory(false);
      } else if (strike.nextQuestion) {
        setCurrentQuestion(strike.nextQuestion);
      }
    } catch {
      setIsSubmitting(false);
    }
  };

  const handleVictory = async () => {
    setGameOver(true);
    setIsVictory(true);
    warriorStateRef.current = 'victory';

    try {
      const summary = await apiFetch('/api/katana/session/complete', {
        method: 'POST',
        body: JSON.stringify({
          sessionId,
          victory: true
        })
      });
      setEarnedXp(summary.xpEarned || 250);
      setEarnedStars(summary.stars || 3);
      triggerRefresh();
    } catch {
      setEarnedXp(250);
      setEarnedStars(3);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: '#060B19',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* 2.5D Canvas Render Layer */}
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        style={{
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          position: 'absolute',
          top: 0,
          left: 0
        }}
      />

      {/* Top Tactical HUD */}
      <header
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '20px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}
      >
        {/* Player Status (Left) */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.88)',
            border: '1.5px solid rgba(255, 106, 0, 0.4)',
            borderRadius: 18,
            padding: '12px 18px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Shield size={16} color="#38BDF8" />
            <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.04em' }}>
              WISDOM WARRIOR
            </span>
            {comboCount > 1 && (
              <span
                style={{
                  background: '#FF6A00',
                  color: '#FFFFFF',
                  padding: '2px 8px',
                  borderRadius: 6,
                  fontSize: '0.72rem',
                  fontWeight: 900
                }}
              >
                x{comboCount} COMBO 🔥
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 140, height: 8, background: 'rgba(255,255,255,0.12)', borderRadius: 999, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.max(0, (playerHp / playerMaxHp) * 100)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #10B981 0%, #34D399 100%)',
                  transition: 'width 0.25s ease'
                }}
              />
            </div>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 800 }}>
              {playerHp}/{playerMaxHp}
            </span>
          </div>
        </div>

        {/* Center Topic & Wave Badge */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 999,
            padding: '8px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <span style={{ fontSize: '0.82rem', fontWeight: 900, color: '#FF6A00' }}>{topic}</span>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FFFFFF' }}>
            {isBoss ? 'FINAL BOSS' : `Wave ${currentWave} of ${totalWaves}`}
          </span>
        </div>

        {/* Enemy Status & Close Button (Right) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.88)',
              border: '1.5px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 18,
              padding: '12px 18px',
              textAlign: 'right',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#EF4444', letterSpacing: '0.04em' }}>
                {isBoss ? 'SHADOW WARLORD' : 'SHADOW SPIRIT'}
              </span>
              <Swords size={16} color="#EF4444" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 800 }}>
                {enemyHp}/{enemyMaxHp}
              </span>
              <div style={{ width: 140, height: 8, background: 'rgba(255,255,255,0.12)', borderRadius: 999, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.max(0, (enemyHp / enemyMaxHp) * 100)}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)',
                    transition: 'width 0.25s ease'
                  }}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {/* Bottom Tactical Question Card & Combat Actions */}
      {!gameOver && currentQuestion && (
        <footer
          style={{
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '92vw',
            maxWidth: 820,
            zIndex: 20
          }}
        >
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.94)',
              border: '2px solid #FF6A00',
              borderRadius: 24,
              padding: 22,
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.7)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span
                style={{
                  background: 'rgba(255, 106, 0, 0.18)',
                  color: '#FF6A00',
                  padding: '3px 10px',
                  borderRadius: 6,
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  textTransform: 'uppercase'
                }}
              >
                {currentQuestion.conceptTag}
              </span>
              <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'rgba(255,255,255,0.7)' }}>
                Score: {score}
              </span>
            </div>

            <p style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.45, margin: '0 0 16px 0' }}>
              {currentQuestion.prompt}
            </p>

            <div style={{ display: 'grid', gap: 8 }}>
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSelectOption(opt)}
                    style={{
                      width: '100%',
                      padding: '12px 18px',
                      borderRadius: 14,
                      background: isSelected ? 'rgba(255, 106, 0, 0.25)' : 'rgba(30, 41, 59, 0.85)',
                      border: isSelected ? '1.5px solid #FF6A00' : '1px solid rgba(255, 255, 255, 0.12)',
                      color: isSelected ? '#FF8533' : '#FFFFFF',
                      fontSize: '0.94rem',
                      fontWeight: isSelected ? 800 : 600,
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: isSelected ? '#FF6A00' : 'rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.78rem',
                        fontWeight: 900
                      }}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanation Popup */}
            {lastExplanation && (
              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  borderRadius: 12,
                  background: lastAnswerCorrect ? 'rgba(6, 95, 70, 0.45)' : 'rgba(153, 27, 27, 0.45)',
                  border: `1px solid ${lastAnswerCorrect ? '#10B981' : '#EF4444'}`,
                  color: '#FFFFFF',
                  fontSize: '0.84rem',
                  lineHeight: 1.45
                }}
              >
                <span style={{ fontWeight: 800, color: lastAnswerCorrect ? '#34D399' : '#F87171' }}>
                  {lastAnswerCorrect ? '✓ WISDOM STRIKE CONNECTED: ' : '✗ STRIKE BLOCKED: '}
                </span>
                {lastExplanation}
              </div>
            )}
          </div>
        </footer>
      )}

      {/* Victory / Defeat Modal */}
      {gameOver && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.88)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24
          }}
        >
          <div
            style={{
              background: '#0F172A',
              border: `2px solid ${isVictory ? '#FF6A00' : '#EF4444'}`,
              borderRadius: 24,
              padding: 32,
              maxWidth: 460,
              width: '100%',
              textAlign: 'center',
              boxShadow: `0 24px 64px ${isVictory ? 'rgba(255, 106, 0, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
            }}
          >
            <div style={{ marginBottom: 16 }}>
              {isVictory ? (
                <Trophy size={64} color="#F59E0B" />
              ) : (
                <RotateCcw size={64} color="#EF4444" />
              )}
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FFFFFF', margin: '0 0 8px 0' }}>
              {isVictory ? 'WISDOM BATTLE VICTORY!' : 'SPIRIT DEPLETED'}
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#94A3B8', margin: '0 0 20px 0', lineHeight: 1.45 }}>
              {isVictory
                ? 'Your katana strikes banished the shadow demons through precise academic understanding.'
                : 'Review your weak concepts and reforge your spirit to conquer this challenge.'}
            </p>

            {isVictory && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <Award
                      key={idx}
                      size={32}
                      color={idx < earnedStars ? '#F59E0B' : 'rgba(255,255,255,0.15)'}
                    />
                  ))}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#FF6A00' }}>
                  +{earnedXp} XP Earned
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '12px 18px',
                  borderRadius: 12,
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Back to Library
              </button>
              <button
                type="button"
                onClick={() => {
                  setGameOver(false);
                  setIsVictory(false);
                  setPlayerHp(100);
                  setEnemyHp(isBoss ? 250 : 100);
                  setCurrentWave(1);
                  setComboCount(0);
                }}
                style={{
                  flex: 1,
                  padding: '12px 18px',
                  borderRadius: 12,
                  background: '#FF6A00',
                  border: 'none',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Battle Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
