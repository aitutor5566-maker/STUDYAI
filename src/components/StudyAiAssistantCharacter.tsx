import React, { useState, useEffect } from 'react';
import { Sparkles, MessageCircle, Volume2 } from 'lucide-react';

export type AssistantState = 'idle' | 'thinking' | 'speaking' | 'success';

interface StudyAiAssistantCharacterProps {
  state?: AssistantState;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showBubble?: boolean;
  bubbleText?: string;
  speechBubble?: string;
  onClick?: () => void;
  className?: string;
}

export const StudyAiAssistantCharacter: React.FC<StudyAiAssistantCharacterProps> = ({
  state = 'idle',
  size = 'md',
  showBubble = false,
  bubbleText,
  speechBubble,
  onClick,
  className = ''
}) => {
  const [blink, setBlink] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const effectiveBubbleText = speechBubble || bubbleText;
  const shouldShowBubble = showBubble || Boolean(speechBubble);

  // Natural blinking interval every 4-6 seconds
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 200);
    }, 4500);
    return () => clearInterval(blinkInterval);
  }, []);

  const dimensions = {
    sm: { width: 54, height: 60, viewBox: '0 0 100 110' },
    md: { width: 90, height: 100, viewBox: '0 0 100 110' },
    lg: { width: 140, height: 155, viewBox: '0 0 100 110' },
    hero: { width: 180, height: 200, viewBox: '0 0 100 110' }
  }[size];

  return (
    <div
      className={`studyai-assistant-container ${className}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none'
      }}
    >
      {/* Optional Contextual Speech Bubble */}
      {((shouldShowBubble && effectiveBubbleText) || (isHovered && effectiveBubbleText)) && (
        <div
          className="assistant-speech-bubble"
          style={{
            position: 'absolute',
            bottom: '100%',
            marginBottom: 10,
            background: '#FFFFFF',
            border: '1.5px solid rgba(255, 106, 0, 0.28)',
            borderRadius: 16,
            padding: '8px 14px',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: '#202124',
            boxShadow: '0 10px 24px -4px rgba(255, 106, 0, 0.16)',
            whiteSpace: 'nowrap',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            animation: 'cardSlideUp 0.25s ease both'
          }}
        >
          <Sparkles size={13} color="#FF6A00" />
          <span>{effectiveBubbleText || "I'm Aura, your AI study companion!"}</span>
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #FFFFFF'
            }}
          />
        </div>
      )}

      {/* Futuristic Vector Animated Character SVG */}
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox={dimensions.viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`assistant-character-svg state-${state} ${isHovered ? 'hovered' : ''}`}
        style={{
          filter: 'drop-shadow(0 8px 18px rgba(255, 106, 0, 0.18))',
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        <defs>
          {/* Gradients conforming to strict STUDYAI palette */}
          <linearGradient id="auraHeadGrad" x1="20" y1="20" x2="80" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#FFF7ED" />
            <stop offset="100%" stopColor="#FFF3E8" />
          </linearGradient>

          <linearGradient id="auraVisorGrad" x1="25" y1="40" x2="75" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#202124" />
            <stop offset="100%" stopColor="#2C2E33" />
          </linearGradient>

          <linearGradient id="auraOrangeGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF6A00" />
            <stop offset="100%" stopColor="#E85D00" />
          </linearGradient>

          <radialGradient id="auraGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF6A00" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FF6A00" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Soft Orange Backlight Glow */}
        <ellipse cx="50" cy="55" rx="38" ry="36" fill="url(#auraGlow)" className="assistant-ambient-glow" />

        {/* Floating Holographic Ring (Synced to Thinking/Idle) */}
        <g className="assistant-orbital-ring">
          <ellipse
            cx="50"
            cy="56"
            rx="46"
            ry="16"
            stroke="url(#auraOrangeGrad)"
            strokeWidth="1.75"
            strokeDasharray={state === 'thinking' ? '6 4' : 'none'}
            opacity="0.75"
            transform="rotate(-12 50 56)"
          />
          {/* Orbital Satellite Node */}
          <circle cx="94" cy="46" r="3" fill="#FF6A00" className="assistant-satellite-node">
            <animate
              attributeName="opacity"
              values="0.4;1;0.4"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        {/* Floating Pod Body (Head + Torso unit) */}
        <g className="assistant-floating-body">
          {/* Little Floating Ear Wings */}
          <path
            d="M 14 50 C 10 44, 10 62, 14 56 Z"
            fill="#FF6A00"
            opacity="0.85"
            className="assistant-wing-left"
          />
          <path
            d="M 86 50 C 90 44, 90 62, 86 56 Z"
            fill="#FF6A00"
            opacity="0.85"
            className="assistant-wing-right"
          />

          {/* Main Curved Head Pod */}
          <rect
            x="18"
            y="26"
            width="64"
            height="58"
            rx="29"
            fill="url(#auraHeadGrad)"
            stroke="#FF6A00"
            strokeWidth="2"
          />

          {/* Top Holographic Antenna & Sensor Node */}
          <path d="M 50 26 L 50 14" stroke="#FF6A00" strokeWidth="2.5" strokeLinecap="round" />
          <circle
            cx="50"
            cy="11"
            r="4.5"
            fill="#FF6A00"
            className={state === 'thinking' ? 'antenna-pulse-fast' : 'antenna-pulse'}
          />
          <circle cx="50" cy="11" r="2" fill="#FFFFFF" />

          {/* Sleek Dark Visor Screen */}
          <rect
            x="24"
            y="36"
            width="52"
            height="34"
            rx="17"
            fill="url(#auraVisorGrad)"
            stroke="rgba(255, 106, 0, 0.4)"
            strokeWidth="1.2"
          />

          {/* Expressive AI Eyes (Glowing Orange/White) */}
          {state === 'success' ? (
            // Happy inverted curved eyes
            <g className="assistant-happy-eyes">
              <path
                d="M 34 54 Q 40 46 46 54"
                stroke="#FF6A00"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 54 54 Q 60 46 66 54"
                stroke="#FF6A00"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          ) : blink ? (
            // Blinking line
            <g className="assistant-blinking-eyes">
              <line x1="34" y1="52" x2="44" y2="52" stroke="#FF6A00" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="56" y1="52" x2="66" y2="52" stroke="#FF6A00" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          ) : (
            // Normal / Thinking / Speaking Eyes
            <g className="assistant-normal-eyes">
              {/* Left Eye */}
              <circle cx="39" cy="51" r="5" fill="#FF6A00" />
              <circle cx="40.5" cy="49.5" r="1.8" fill="#FFFFFF" />

              {/* Right Eye */}
              <circle cx="61" cy="51" r="5" fill="#FF6A00" />
              <circle cx="62.5" cy="49.5" r="1.8" fill="#FFFFFF" />
            </g>
          )}

          {/* Mouth Area: Responsive to Speaking / Thinking / Idle */}
          {state === 'speaking' ? (
            // Animated Voice Waveform bars
            <g className="assistant-speaking-waveform">
              <line x1="42" y1="62" x2="42" y2="66" stroke="#FF6A00" strokeWidth="2" strokeLinecap="round">
                <animate attributeName="y1" values="60;63;60" dur="0.35s" repeatCount="indefinite" />
                <animate attributeName="y2" values="68;65;68" dur="0.35s" repeatCount="indefinite" />
              </line>
              <line x1="47" y1="59" x2="47" y2="69" stroke="#FF6A00" strokeWidth="2" strokeLinecap="round">
                <animate attributeName="y1" values="58;62;58" dur="0.28s" repeatCount="indefinite" />
                <animate attributeName="y2" values="70;66;70" dur="0.28s" repeatCount="indefinite" />
              </line>
              <line x1="53" y1="60" x2="53" y2="68" stroke="#FF6A00" strokeWidth="2" strokeLinecap="round">
                <animate attributeName="y1" values="62;58;62" dur="0.31s" repeatCount="indefinite" />
                <animate attributeName="y2" values="66;70;66" dur="0.31s" repeatCount="indefinite" />
              </line>
              <line x1="58" y1="62" x2="58" y2="66" stroke="#FF6A00" strokeWidth="2" strokeLinecap="round">
                <animate attributeName="y1" values="63;61;63" dur="0.33s" repeatCount="indefinite" />
                <animate attributeName="y2" values="65;67;65" dur="0.33s" repeatCount="indefinite" />
              </line>
            </g>
          ) : state === 'thinking' ? (
            // Thinking synaptic dots
            <g className="assistant-thinking-dots">
              <circle cx="44" cy="64" r="1.5" fill="#FF6A00">
                <animate attributeName="opacity" values="0.2;1;0.2" dur="1s" repeatCount="indefinite" />
              </circle>
              <circle cx="50" cy="64" r="1.5" fill="#FF6A00">
                <animate attributeName="opacity" values="0.2;1;0.2" dur="1s" begin="0.3s" repeatCount="indefinite" />
              </circle>
              <circle cx="56" cy="64" r="1.5" fill="#FF6A00">
                <animate attributeName="opacity" values="0.2;1;0.2" dur="1s" begin="0.6s" repeatCount="indefinite" />
              </circle>
            </g>
          ) : (
            // Subtle pleasant curved mouth
            <path
              d="M 45 63 Q 50 66 55 63"
              stroke="#FF6A00"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
              opacity="0.8"
            />
          )}

          {/* Chest Brand Emblem (Minimalist Orange Accent) */}
          <circle cx="50" cy="80" r="3" fill="#FF6A00" opacity="0.9" />
          <circle cx="50" cy="80" r="1" fill="#FFFFFF" />

          {/* Floating Base Thruster Halo */}
          <ellipse cx="50" cy="88" rx="14" ry="4" fill="#FF6A00" opacity="0.35" className="assistant-thruster" />
          <ellipse cx="50" cy="90" rx="8" ry="2" fill="#E85D00" opacity="0.6" className="assistant-thruster-inner" />
        </g>
      </svg>
    </div>
  );
};
