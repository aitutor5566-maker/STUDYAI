import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sword,
  Trophy,
  Flame,
  Sparkles,
  Shield,
  Compass,
  Play,
  RotateCcw,
  BookOpen,
  ChevronRight,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  Gamepad2
} from 'lucide-react';
import { TopBrandBar } from '../components/GlassNav';
import { useLearning } from '../context/LearningContext';
import { ARENA_DEFINITIONS } from '../games/battleWorld/VoxelArenaManager';
import { GameLanguage } from '../games/types';

export const GameCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeTopic, activeSubject, openGamesHub, apiFetch } = useLearning();

  const [topic, setTopic] = useState<string>(activeTopic || 'Photosynthesis');
  const [subject, setSubject] = useState<string>(activeSubject || 'Science');
  const [grade, setGrade] = useState<number>(5);
  const [language, setLanguage] = useState<GameLanguage>('English');
  const [loading, setLoading] = useState<boolean>(false);
  const [gameSessions, setGameSessions] = useState<any[]>([]);

  // Fetch student game history
  useEffect(() => {
    apiFetch('/api/games/sessions')
      .then((sessions) => {
        if (Array.isArray(sessions)) {
          setGameSessions(sessions);
        }
      })
      .catch(() => {});
  }, [apiFetch]);

  const handlePlayNow = () => {
    setLoading(true);
    setTimeout(() => {
      openGamesHub(topic || 'Photosynthesis', subject || 'Science', 'battle_world', true);
      setLoading(false);
    }, 200);
  };

  const arenas = Object.values(ARENA_DEFINITIONS);

  // Compute stats
  const totalGamesPlayed = gameSessions.length;
  const highestScore = gameSessions.reduce((max, s) => Math.max(max, Number(s.score) || 0), 0);
  const avgAccuracy = totalGamesPlayed > 0
    ? Math.round(gameSessions.reduce((sum, s) => sum + (Number(s.accuracy) || 0), 0) / totalGamesPlayed)
    : 85;

  return (
    <div className="studyai-shell">
      <TopBrandBar showBack onBack={() => navigate('/')} subtitle="Educational 3D Game Center" />

      <main className="studyai-content-container" style={{ paddingBottom: 100 }}>
        {/* Header Breadcrumb & Title */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span
              style={{
                padding: '4px 12px',
                borderRadius: 999,
                background: 'rgba(255, 106, 0, 0.12)',
                border: '1px solid rgba(255, 106, 0, 0.3)',
                color: '#FF6A00',
                fontSize: '0.74rem',
                fontWeight: 900,
                letterSpacing: '0.04em'
              }}
            >
              STUDYAI GAME CENTER
            </span>
            <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600 }}>
              Curriculum-Aligned 3D Gaming
            </span>
          </div>

          <h1 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#1E293B', letterSpacing: '-0.03em', margin: '0 0 6px 0' }}>
            Academic 3D Game Center
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#64748B', maxWidth: 740, margin: 0 }}>
            Master your syllabus by entering real-time 3D educational worlds. Answer curriculum questions to defeat stylized opponents, unlock elemental power-ups, and level up your Knowledge XP.
          </p>
        </div>

        {/* --- HERO MASTER GAME CARD: STUDYAI BATTLE WORLD --- */}
        <section
          className="glass-card"
          style={{
            marginBottom: 32,
            padding: 0,
            borderRadius: 28,
            background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 60%, #090d16 100%)',
            border: '2px solid rgba(255, 106, 0, 0.45)',
            boxShadow: '0 24px 50px -12px rgba(15, 23, 42, 0.6), 0 0 24px rgba(255, 106, 0, 0.15)',
            color: '#FFFFFF',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {/* Background Ambient Glow */}
          <div
            style={{
              position: 'absolute',
              top: -120,
              right: -120,
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 106, 0, 0.28) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 0 }}>
            {/* Left Column: Stylized Minecraft-Inspired Voxel Thumbnail & Artwork */}
            <div
              style={{
                padding: 32,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
                borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                position: 'relative'
              }}
            >
              {/* Voxel World Art Banner */}
              <div
                style={{
                  width: '100%',
                  height: 230,
                  borderRadius: 20,
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 40%, #15803d 40%, #166534 100%)',
                  boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5), 0 12px 30px rgba(0,0,0,0.4)',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {/* Voxel Isometric Grid Graphic */}
                <svg
                  viewBox="0 0 400 240"
                  style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="60%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#1e293b" />
                    </linearGradient>
                    <linearGradient id="bladeGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#0284c7" />
                    </linearGradient>
                  </defs>

                  {/* Sky & Sun */}
                  <rect width="400" height="240" fill="url(#skyGrad)" />
                  <rect x="290" y="30" width="34" height="34" fill="#fef08a" rx="4" />

                  {/* Background Voxel Castle Ramparts */}
                  <rect x="230" y="80" width="45" height="70" fill="#334155" />
                  <rect x="235" y="70" width="12" height="14" fill="#475569" />
                  <rect x="258" y="70" width="12" height="14" fill="#475569" />
                  <rect x="270" y="100" width="80" height="50" fill="#1e293b" />

                  {/* Voxel Terrain Ground Layers */}
                  <path d="M 0 150 L 400 150 L 400 240 L 0 240 Z" fill="#166534" />
                  <path d="M 0 165 L 400 165 L 400 240 L 0 240 Z" fill="#78350f" />

                  {/* Checkered Voxel Blocks */}
                  {[0, 40, 80, 120, 160, 200, 240, 280, 320, 360].map((bx, i) => (
                    <rect
                      key={i}
                      x={bx}
                      y={150}
                      width="38"
                      height="14"
                      fill={i % 2 === 0 ? '#22c55e' : '#15803d'}
                      rx="2"
                    />
                  ))}

                  {/* Voxel Oak Trees */}
                  <rect x="50" y="100" width="16" height="52" fill="#582f0e" />
                  <rect x="30" y="60" width="56" height="46" fill="#15803d" rx="6" />
                  <rect x="38" y="44" width="40" height="24" fill="#22c55e" rx="4" />

                  <rect x="340" y="108" width="14" height="44" fill="#582f0e" />
                  <rect x="325" y="76" width="44" height="36" fill="#166534" rx="5" />

                  {/* Minecraft-Style Voxel Hero (Center Foreground) */}
                  <g transform="translate(175, 78)">
                    {/* Shadow */}
                    <ellipse cx="25" cy="88" rx="28" ry="8" fill="#000000" opacity="0.4" />

                    {/* Legs */}
                    <rect x="14" y="56" width="10" height="28" fill="#1d4ed8" rx="2" />
                    <rect x="26" y="56" width="10" height="28" fill="#2563eb" rx="2" />

                    {/* Torso (STUDYAI Orange) */}
                    <rect x="12" y="28" width="26" height="30" fill="#ea580c" rx="3" />
                    <rect x="15" y="32" width="20" height="14" fill="#f97316" rx="2" />

                    {/* Left Arm */}
                    <rect x="2" y="28" width="9" height="28" fill="#ea580c" rx="2" />

                    {/* Head */}
                    <rect x="13" y="4" width="24" height="24" fill="#fed7aa" rx="4" />
                    {/* Hair */}
                    <rect x="12" y="2" width="26" height="10" fill="#451a03" rx="3" />
                    {/* Eyes */}
                    <rect x="17" y="14" width="4" height="4" fill="#1e3a8a" />
                    <rect x="29" y="14" width="4" height="4" fill="#1e3a8a" />

                    {/* Right Arm & Raised Cyan Knowledge Blade */}
                    <rect x="39" y="22" width="9" height="24" fill="#ea580c" rx="2" />
                    {/* Blade */}
                    <rect x="42" y="-4" width="6" height="28" fill="url(#bladeGrad)" rx="2" />
                    <rect x="39" y="18" width="12" height="4" fill="#facc15" rx="1" />
                  </g>

                  {/* Floating Knowledge XP Stars */}
                  <polygon points="120,40 123,48 132,48 125,53 128,62 120,56 112,62 115,53 108,48 117,48" fill="#fde047" />
                  <polygon points="260,34 262,39 267,39 263,43 265,49 260,45 255,49 257,43 253,39 258,39" fill="#38bdf8" />
                  <polygon points="150,25 151,29 155,29 152,32 153,37 150,34 147,37 148,32 145,29 149,29" fill="#fde047" />
                </svg>

                {/* Floating Live Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    padding: '4px 10px',
                    borderRadius: 999,
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 106, 0, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: '#F8FAFC'
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                  <span>PLAYABLE 3D ENGINE</span>
                </div>
              </div>

              {/* Game Highlights List */}
              <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                <div style={{ padding: 12, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700 }}>GRAPHICS</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#38BDF8', marginTop: 2 }}>Minecraft 3D Voxel</div>
                </div>
                <div style={{ padding: 12, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700 }}>ARENAS</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#4ADE80', marginTop: 2 }}>5 Enclosed Biomes</div>
                </div>
                <div style={{ padding: 12, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700 }}>CONTROLS</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#FBBF24', marginTop: 2 }}>Touch Joystick / WASD</div>
                </div>
                <div style={{ padding: 12, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700 }}>KNOWLEDGE</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#FB923C', marginTop: 2 }}>Top-Center HUD</div>
                </div>
              </div>
            </div>

            {/* Right Column: Title, Curriculum Form & Play Action */}
            <div style={{ padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: 999,
                      background: '#FF6A00',
                      color: '#FFFFFF',
                      fontSize: '0.72rem',
                      fontWeight: 900,
                      letterSpacing: '0.04em'
                    }}
                  >
                    FEATURED FLAGSHIP GAME
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#FDBA74', fontWeight: 700 }}>
                    STUDYAI Battle World Engine v2.0
                  </span>
                </div>

                <h2 style={{ fontSize: '1.9rem', fontWeight: 900, color: '#FFFFFF', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
                  STUDYAI BATTLE WORLD
                </h2>
                <p style={{ fontSize: '0.92rem', color: '#94A3B8', lineHeight: 1.5, margin: 0 }}>
                  Enter 5 compact enclosed voxel arenas. Strike fictional mobs with your Knowledge Blade, jump over obstacles, and answer curriculum questions to unleash elemental strikes and conquer the Shadow Warden Boss!
                </p>

                {/* Curriculum Configuration Grid */}
                <div
                  style={{
                    marginTop: 24,
                    padding: 18,
                    borderRadius: 18,
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: 14
                  }}
                >
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                      GRADE
                    </label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 10,
                        background: '#1E293B',
                        border: '1px solid #334155',
                        color: '#FFFFFF',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        outline: 'none'
                      }}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                        <option key={g} value={g}>Class {g}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                      SUBJECT
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 10,
                        background: '#1E293B',
                        border: '1px solid #334155',
                        color: '#FFFFFF',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        outline: 'none'
                      }}
                    >
                      <option value="Science">Science</option>
                      <option value="Biology">Biology</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Maths">Mathematics</option>
                      <option value="Social Studies">Social Studies</option>
                      <option value="English">English</option>
                    </select>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                      CHALLENGE TOPIC
                    </label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. Photosynthesis, Heart, Algebra..."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 10,
                        background: '#1E293B',
                        border: '1px solid #334155',
                        color: '#FFFFFF',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons & Status */}
              <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handlePlayNow}
                  disabled={loading}
                  style={{
                    flex: 1,
                    minWidth: 200,
                    padding: '16px 28px',
                    borderRadius: 16,
                    background: 'linear-gradient(135deg, #FF7A1A 0%, #FF6A00 100%)',
                    color: '#FFFFFF',
                    fontSize: '1.05rem',
                    fontWeight: 900,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    boxShadow: '0 12px 28px rgba(255, 106, 0, 0.45)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <Sword size={22} />
                  <span>{loading ? 'INITIALIZING ARENA...' : 'PLAY NOW — BATTLE WORLD'}</span>
                  <ChevronRight size={20} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 18px', borderRadius: 14, background: 'rgba(255,255,255,0.05)' }}>
                  <Trophy size={18} color="#FBBF24" />
                  <span style={{ fontSize: '0.85rem', color: '#F1F5F9', fontWeight: 700 }}>
                    High Score: <strong style={{ color: '#F59E0B' }}>{highestScore}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- 5 ENCLOSED VOXEL BIOME ARENAS SHOWCASE --- */}
        <section style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#1E293B', margin: '0 0 4px 0' }}>
                5 Enclosed Voxel Biome Arenas
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#64748B', margin: 0 }}>
                Every question correctly answered advances the arena. Bounded by 4 solid perimeter walls to guarantee zero falling out!
              </p>
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FF6A00' }}>
              Progressive Difficulty (Wave 1 to 5)
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16
            }}
          >
            {arenas.map((arena) => (
              <div
                key={arena.id}
                onClick={handlePlayNow}
                style={{
                  padding: 20,
                  borderRadius: 20,
                  background: '#FFFFFF',
                  border: '1.5px solid rgba(226, 232, 240, 0.9)',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.04)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#FF6A00';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(255, 106, 0, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.9)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.04)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: 8,
                        background: `${arena.accentColor}20`,
                        color: arena.accentColor,
                        fontSize: '0.72rem',
                        fontWeight: 900
                      }}
                    >
                      WAVE {arena.waveIndex}
                    </span>
                    <span style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 600 }}>
                      {arena.mobCount} Mobs
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#1E293B', margin: '0 0 6px 0' }}>
                    {arena.name}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.45, margin: 0 }}>
                    {arena.description}
                  </p>
                </div>

                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 12,
                    borderTop: '1px solid #F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#FF6A00' }}>
                    Enter Biome →
                  </span>
                  <Sword size={16} color="#FF6A00" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- CONTROLS & DEVICE OPTIMIZATION INFO --- */}
        <section
          className="glass-card"
          style={{
            marginBottom: 32,
            padding: 24,
            borderRadius: 22,
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
            border: '1.5px solid rgba(255, 106, 0, 0.22)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Gamepad2 size={24} color="#FF6A00" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1E293B', margin: 0 }}>
              Device Controls &amp; Gameplay Architecture
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            <div style={{ padding: 18, borderRadius: 16, background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#FF6A00', marginBottom: 6 }}>
                📱 MOBILE &amp; TABLET TOUCH
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
                <li><strong>Left Virtual Joystick:</strong> 360° dynamic analog touch movement</li>
                <li><strong>Right Camera Drag:</strong> Drag thumb anywhere on right side to orbit</li>
                <li><strong>Action Buttons:</strong> Dedicated <code>⚔️ STRIKE</code> and <code>▲ JUMP</code></li>
                <li><strong>Top-Center Question HUD:</strong> Tap to open 4-option multiple choice</li>
              </ul>
            </div>

            <div style={{ padding: 18, borderRadius: 16, background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#0284C7', marginBottom: 6 }}>
                💻 DESKTOP KEYBOARD &amp; MOUSE
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
                <li><strong>WASD / Arrow Keys:</strong> Smooth character movement</li>
                <li><strong>Mouse Drag:</strong> Orbit camera smoothly around player</li>
                <li><strong>Space:</strong> Jump over obstacles</li>
                <li><strong>E / Left Click:</strong> Strike with Knowledge Blade</li>
                <li><strong>Q / Tab:</strong> Open Question answer dialog</li>
              </ul>
            </div>
          </div>
        </section>

        {/* --- STUDENT SESSION ACTIVITY & PROGRESS HISTORY --- */}
        {gameSessions.length > 0 && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1E293B', margin: 0 }}>
                Recent Battle World Missions ({gameSessions.length})
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
                Average Accuracy: <strong style={{ color: '#16A34A' }}>{avgAccuracy}%</strong>
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
              {gameSessions.slice(0, 4).map((s, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 16,
                    borderRadius: 16,
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#FF6A00' }}>
                      {s.subject || 'Science'}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                      {new Date(s.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h5 style={{ margin: '0 0 6px 0', fontSize: '0.92rem', fontWeight: 800, color: '#1E293B' }}>
                    {s.topic}
                  </h5>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.78rem', color: '#64748B' }}>
                    <span>Score: <strong style={{ color: '#E85D00' }}>{s.score}</strong></span>
                    <span>Accuracy: <strong style={{ color: '#16A34A' }}>{s.accuracy}%</strong></span>
                    <span>Stage: {s.stage_reached}/5</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default GameCenterPage;
