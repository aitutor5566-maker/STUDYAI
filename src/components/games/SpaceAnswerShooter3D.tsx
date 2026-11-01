import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Heart,
  Star,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
  Rocket,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Zap,
  Info
} from 'lucide-react';
import { EducationalQuestion, GameFeedback, OptionId } from '../../games/types';
import { LevelInfo } from '../../games/ProgressionController';
import { SpaceBattleEngine } from '../../games/spaceBattle/SpaceBattleEngine';

interface SpaceAnswerShooter3DProps {
  question: EducationalQuestion | null;
  onAnswerChosen: (optionId: OptionId) => void;
  levelInfo: LevelInfo;
  feedback: GameFeedback | null;
  lives: number;
  score: number;
  combo: number;
  isPaused: boolean;
  questionIndex?: number;
  totalQuestions?: number;
  subject?: string;
  chapter?: string;
  onTogglePause?: () => void;
  onExit?: () => void;
}

export const SpaceAnswerShooter3D: React.FC<SpaceAnswerShooter3DProps> = ({
  question,
  onAnswerChosen,
  levelInfo,
  feedback,
  lives,
  score,
  combo,
  isPaused: parentPaused,
  questionIndex = 2,
  totalQuestions = 5,
  subject = 'Biology',
  chapter = 'Human Body',
  onTogglePause,
  onExit
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<SpaceBattleEngine | null>(null);

  const [localPaused, setLocalPaused] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showControlsHint, setShowControlsHint] = useState<boolean>(true);
  const [joystickActive, setJoystickActive] = useState<boolean>(false);
  const joystickStartRef = useRef<{ x: number; y: number } | null>(null);

  const isPaused = parentPaused || localPaused;

  // 1. Initialize SpaceBattleEngine
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const engine = new SpaceBattleEngine(containerRef.current, canvasRef.current, {
      onAnswerChosen: (optionId: OptionId, _isCorrect: boolean) => {
        // Authoritative projectile-enemy collision evaluates the answer
        onAnswerChosen(optionId);
      },
      onDamageTaken: (_remainingLives: number) => {
        // Handled in parent state via lives prop
      },
      onScoreGained: (_pts: number, _c: number) => {
        // Bonus score
      }
    });

    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // 2. Synchronize Question, Lives, and Pause state
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setQuestion(question);
    }
  }, [question]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setLives(lives);
      engineRef.current.setPaused(isPaused);
    }
  }, [lives, isPaused]);

  // 3. Desktop Keyboard Controls: WASD / Arrows, Space / Click to shoot, Shift to boost
  useEffect(() => {
    const keysDown = new Set<string>();
    let loopId: number | null = null;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        if (onTogglePause) onTogglePause();
        else setLocalPaused((prev) => !prev);
        return;
      }

      if (isPaused || feedback) return;

      keysDown.add(e.code);

      if (e.code === 'Space') {
        e.preventDefault();
        engineRef.current?.triggerFire();
      }

      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        engineRef.current?.setBoost(true);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysDown.delete(e.code);
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        engineRef.current?.setBoost(false);
      }
    };

    const pollMovement = () => {
      if (!isPaused && !feedback && engineRef.current) {
        let dx = 0;
        let dy = 0;

        if (keysDown.has('KeyA') || keysDown.has('ArrowLeft')) dx -= 0.45;
        if (keysDown.has('KeyD') || keysDown.has('ArrowRight')) dx += 0.45;
        if (keysDown.has('KeyW') || keysDown.has('ArrowUp')) dy += 0.35;
        if (keysDown.has('KeyS') || keysDown.has('ArrowDown')) dy -= 0.35;

        if (dx !== 0 || dy !== 0) {
          engineRef.current.movePlayerBy(dx, dy);
        }
      }
      loopId = requestAnimationFrame(pollMovement);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    loopId = requestAnimationFrame(pollMovement);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      if (loopId !== null) cancelAnimationFrame(loopId);
    };
  }, [isPaused, feedback, onTogglePause]);

  // 4. Mouse / Pointer Steering & Shooting
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isPaused || feedback || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    engineRef.current?.setPlayerSteer(normX, normY);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isPaused || feedback) return;
    if ((e.target as HTMLElement).closest('.arcade-ui-button')) return;
    engineRef.current?.triggerFire();
  };

  // 5. Virtual Joystick Touch Handlers
  const handleJoystickTouchStart = (e: React.TouchEvent) => {
    setJoystickActive(true);
    const touch = e.touches[0];
    joystickStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleJoystickTouchMove = (e: React.TouchEvent) => {
    if (!joystickStartRef.current) return;
    const touch = e.touches[0];
    const deltaX = (touch.clientX - joystickStartRef.current.x) * 0.08;
    const deltaY = -(touch.clientY - joystickStartRef.current.y) * 0.06;
    engineRef.current?.movePlayerBy(deltaX, deltaY);
  };

  const handleJoystickTouchEnd = () => {
    setJoystickActive(false);
    joystickStartRef.current = null;
  };

  const toggleMute = () => {
    if (engineRef.current) {
      const next = !isMuted;
      setIsMuted(next);
      engineRef.current.audio.setMuted(next);
    }
  };

  const currentLevelNum = levelInfo?.level || 2;
  const progressRatio = Math.min(1, Math.max(0, questionIndex / totalQuestions));

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '620px',
        maxHeight: '94vh',
        overflow: 'hidden',
        background: '#040714',
        userSelect: 'none',
        touchAction: 'none',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          touchAction: 'none'
        }}
      />

      {/* ------------------------------------------------------------- */}
      {/* TOP SCI-FI ARCADE HUD (Directly matching visual design) */}
      {/* ------------------------------------------------------------- */}
      <header
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          right: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          zIndex: 40,
          pointerEvents: 'none'
        }}
      >
        {/* Left: STUDYAI Robot Avatar Badge */}
        <div
          className="arcade-ui-button"
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(8, 18, 44, 0.92)',
            backdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(56, 189, 248, 0.5)',
            borderRadius: 24,
            padding: '6px 16px 6px 8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.7), inset 0 0 12px rgba(56, 189, 248, 0.2)'
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #38bdf8 0%, #0369a1 70%, #082f49 100%)',
              border: '2px solid #7dd3fc',
              boxShadow: '0 0 14px rgba(56, 189, 248, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '22px'
            }}
          >
            🤖
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.86rem', fontWeight: 900, color: '#ffffff', letterSpacing: '0.04em' }}>
              STUDYAI
            </span>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.06em' }}>
              Space Battle
            </span>
          </div>
        </div>

        {/* Center: Chamfered Question Card */}
        <div
          style={{
            flex: 1,
            maxWidth: 680,
            background: 'rgba(8, 18, 44, 0.92)',
            backdropFilter: 'blur(16px)',
            border: '2px solid rgba(56, 189, 248, 0.6)',
            borderRadius: 20,
            padding: '12px 24px',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.7), inset 0 0 20px rgba(56, 189, 248, 0.2)'
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(0.95rem, 2.2vw, 1.25rem)',
              fontWeight: 800,
              color: '#ffffff',
              margin: '0 0 4px 0',
              lineHeight: 1.35,
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)'
            }}
          >
            {question ? question.question : 'Engage the alien fleet!'}
          </h2>
          <div
            style={{
              fontSize: '0.76rem',
              fontWeight: 700,
              color: '#38bdf8',
              letterSpacing: '0.05em'
            }}
          >
            {subject} • {chapter} • Level {currentLevelNum}
          </div>
        </div>

        {/* Right: Health, Score, Question Progress & Pause */}
        <div
          className="arcade-ui-button"
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'rgba(8, 18, 44, 0.92)',
            backdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(56, 189, 248, 0.5)',
            borderRadius: 20,
            padding: '8px 14px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.7)'
          }}
        >
          {/* Health Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Heart size={16} color="#ef4444" fill="#ef4444" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div
                style={{
                  width: 52,
                  height: 8,
                  backgroundColor: 'rgba(239, 68, 68, 0.25)',
                  borderRadius: 4,
                  overflow: 'hidden',
                  border: '1px solid rgba(239, 68, 68, 0.5)'
                }}
              >
                <div
                  style={{
                    width: `${(lives / 3) * 100}%`,
                    height: '100%',
                    backgroundColor: '#ef4444',
                    boxShadow: '0 0 8px #ef4444',
                    transition: 'width 0.25s ease'
                  }}
                />
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#f87171' }}>
                {lives}/3
              </span>
            </div>
          </div>

          {/* Score */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Star size={16} color="#facc15" fill="#facc15" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#94a3b8' }}>Score</span>
              <span style={{ fontSize: '0.86rem', fontWeight: 900, color: '#ffffff' }}>
                {score.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Question Counter */}
          <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#38bdf8', paddingLeft: 4 }}>
            Question {questionIndex}/{totalQuestions}
          </div>

          {/* Pause Button */}
          <button
            type="button"
            aria-label="Pause Game"
            onClick={() => {
              if (onTogglePause) onTogglePause();
              else setLocalPaused((prev) => !prev);
            }}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: 'rgba(56, 189, 248, 0.18)',
              border: '1.5px solid #38bdf8',
              boxShadow: '0 0 10px rgba(56, 189, 248, 0.45)',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
          </button>
        </div>
      </header>

      {/* Dismissible Desktop Controls Guide */}
      {showControlsHint && (
        <div
          className="arcade-ui-button"
          style={{
            position: 'absolute',
            top: 86,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(8, 18, 44, 0.88)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            borderRadius: 16,
            padding: '6px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: '0.74rem',
            color: '#cbd5e1',
            zIndex: 35,
            backdropFilter: 'blur(8px)'
          }}
        >
          <span>🎯 <b>Controls:</b> Move: WASD / Arrows / Mouse | Fire: Space / Click | Boost: Shift | Pause: Esc</span>
          <button
            type="button"
            onClick={() => setShowControlsHint(false)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2 }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* BOTTOM SCI-FI CONTROLS (Joystick, Level Progress, FIRE Rocket) */}
      {/* ------------------------------------------------------------- */}
      <footer
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 40,
          pointerEvents: 'none'
        }}
      >
        {/* Bottom-Left: Glowing Circular Virtual D-Pad / Joystick */}
        <div
          className="arcade-ui-button"
          onTouchStart={handleJoystickTouchStart}
          onTouchMove={handleJoystickTouchMove}
          onTouchEnd={handleJoystickTouchEnd}
          style={{
            pointerEvents: 'auto',
            width: 104,
            height: 104,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(3, 105, 161, 0.35) 0%, rgba(8, 18, 44, 0.9) 75%)',
            border: '2.5px solid #38bdf8',
            boxShadow: '0 0 24px rgba(56, 189, 248, 0.5)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'grab'
          }}
        >
          <div style={{ position: 'absolute', top: 6, color: '#38bdf8', opacity: 0.8 }}>
            <ChevronUp size={18} />
          </div>
          <div style={{ position: 'absolute', bottom: 6, color: '#38bdf8', opacity: 0.8 }}>
            <ChevronDown size={18} />
          </div>
          <div
            onClick={(e) => {
              e.stopPropagation();
              engineRef.current?.movePlayerBy(-1.2);
            }}
            style={{ position: 'absolute', left: 6, color: '#38bdf8', cursor: 'pointer' }}
          >
            <ChevronLeft size={20} />
          </div>
          <div
            onClick={(e) => {
              e.stopPropagation();
              engineRef.current?.movePlayerBy(1.2);
            }}
            style={{ position: 'absolute', right: 6, color: '#38bdf8', cursor: 'pointer' }}
          >
            <ChevronRight size={20} />
          </div>

          {/* Center Thumb Nub */}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #38bdf8 0%, #0284c7 80%)',
              border: '2px solid #e0f2fe',
              boxShadow: '0 0 12px rgba(56, 189, 248, 0.85)',
              transform: joystickActive ? 'scale(0.92)' : 'scale(1)',
              transition: 'transform 0.1s ease'
            }}
          />
        </div>

        {/* Bottom-Center: Level Progress Capsule */}
        <div
          className="arcade-ui-button"
          style={{
            pointerEvents: 'auto',
            background: 'rgba(8, 18, 44, 0.92)',
            backdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(56, 189, 248, 0.5)',
            borderRadius: 24,
            padding: '10px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            minWidth: 260,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)'
          }}
        >
          <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#ffffff' }}>
            Level {currentLevelNum}
          </span>
          <div
            style={{
              flex: 1,
              height: 8,
              backgroundColor: 'rgba(56, 189, 248, 0.2)',
              borderRadius: 4,
              overflow: 'hidden',
              border: '1px solid rgba(56, 189, 248, 0.45)'
            }}
          >
            <div
              style={{
                width: `${progressRatio * 100}%`,
                height: '100%',
                backgroundColor: '#38bdf8',
                boxShadow: '0 0 10px #38bdf8',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
          <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#38bdf8' }}>
            {questionIndex}/{totalQuestions}
          </span>
        </div>

        {/* Bottom-Right: Glowing Circular FIRE Rocket Button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <button
            type="button"
            aria-label="FIRE"
            className="arcade-ui-button"
            onClick={() => engineRef.current?.triggerFire()}
            style={{
              pointerEvents: 'auto',
              width: 104,
              height: 104,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(2, 132, 199, 0.45) 0%, rgba(8, 18, 44, 0.92) 75%)',
              border: '2.5px solid #38bdf8',
              boxShadow: '0 0 28px rgba(56, 189, 248, 0.65), inset 0 0 16px rgba(56, 189, 248, 0.35)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.1s ease, box-shadow 0.1s ease'
            }}
            onPointerDown={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(0.92)';
            }}
            onPointerUp={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
            }}
          >
            <Rocket size={42} color="#38bdf8" />
          </button>
          <span
            style={{
              fontSize: '0.86rem',
              fontWeight: 900,
              color: '#38bdf8',
              letterSpacing: '0.12em',
              textShadow: '0 0 10px rgba(56, 189, 248, 0.85)'
            }}
          >
            FIRE
          </span>
        </div>
      </footer>

      {/* ------------------------------------------------------------- */}
      {/* EDUCATIONAL FEEDBACK TOAST (On Direct Hit / Shield Deflection) */}
      {/* ------------------------------------------------------------- */}
      {feedback && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: 520,
            width: '90%',
            background: feedback.isCorrect ? 'rgba(6, 78, 59, 0.97)' : 'rgba(127, 29, 29, 0.97)',
            border: `2px solid ${feedback.isCorrect ? '#34d399' : '#f87171'}`,
            borderRadius: 20,
            padding: '22px 26px',
            color: '#ffffff',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.85)',
            zIndex: 60,
            textAlign: 'center',
            backdropFilter: 'blur(16px)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
            {feedback.isCorrect ? (
              <>
                <CheckCircle2 size={28} color="#34d399" />
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#34d399' }}>
                  DIRECT HIT! Correct Answer (+{feedback.pointsEarned * combo} pts)
                </span>
              </>
            ) : (
              <>
                <AlertTriangle size={28} color="#f87171" />
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f87171' }}>
                  SHIELD DEFLECTED! (-1 Shield)
                </span>
              </>
            )}
          </div>
          <p style={{ margin: '0 0 14px 0', fontSize: '0.94rem', lineHeight: 1.5, color: '#f1f5f9' }}>
            {feedback.explanation}
          </p>
          {!feedback.isCorrect && (
            <div style={{ fontSize: '0.84rem', color: '#fde047', fontWeight: 700 }}>
              Target the enemy carrying: <b>{feedback.correctText}</b>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* PAUSE OVERLAY MODAL */}
      {/* ------------------------------------------------------------- */}
      {isPaused && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(5, 8, 20, 0.88)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 70
          }}
        >
          <div
            style={{
              background: 'rgba(8, 18, 44, 0.96)',
              border: '2px solid rgba(56, 189, 248, 0.55)',
              borderRadius: 24,
              padding: '32px 40px',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85)',
              maxWidth: 420,
              width: '90%'
            }}
          >
            <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', margin: '0 0 8px 0' }}>
              Flight Paused
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: '0 0 24px 0' }}>
              Your fleet position and educational progress are preserved.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                type="button"
                onClick={() => {
                  if (onTogglePause) onTogglePause();
                  else setLocalPaused(false);
                }}
                style={{
                  padding: '12px 20px',
                  borderRadius: 14,
                  backgroundColor: '#0284c7',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <Play size={18} />
                <span>Resume Battle</span>
              </button>

              <button
                type="button"
                onClick={toggleMute}
                style={{
                  padding: '10px 18px',
                  borderRadius: 14,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                <span>{isMuted ? 'Unmute Audio' : 'Mute Audio'}</span>
              </button>

              {onExit && (
                <button
                  type="button"
                  onClick={onExit}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 14,
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#f87171',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  <X size={18} />
                  <span>Exit to StudyAI</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
