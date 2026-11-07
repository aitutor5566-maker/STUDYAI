import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Box,
  CheckCircle2,
  Circle,
  ChevronRight,
  Plus,
  Sparkles,
  Globe
} from 'lucide-react';
import { TopBrandBar } from '../components/GlassNav';
import { FuturisticIcon, FuturisticIconName } from '../components/FuturisticIcons';
import { useLearning } from '../context/LearningContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    apiFetch,
    activeTopic,
    setTopicContext,
    open3DLab,
    openImageStudio,
    openVideoStudio,
    openGamesHub,
    openQuizModal,
    refreshTick,
    triggerRefresh
  } = useLearning();

  const [dashboard, setDashboard] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [heroTopicInput, setHeroTopicInput] = useState<string>('');
  const [newGoalTitle, setNewGoalTitle] = useState<string>('');

  useEffect(() => {
    setLoading(true);
    apiFetch('/api/dashboard')
      .then((data) => {
        setDashboard(data);
        if (data?.sharedContext?.active_topic && !heroTopicInput) {
          setHeroTopicInput(data.sharedContext.active_topic);
        }
      })
      .finally(() => setLoading(false));
  }, [apiFetch, refreshTick]);

  const handleStartJourney = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetTopic = heroTopicInput.trim() || activeTopic || 'Photosynthesis';
    await setTopicContext(targetTopic);
    navigate(`/tutor?topic=${encodeURIComponent(targetTopic)}`);
  };

  const handleToggleGoal = async (goalId: string) => {
    await apiFetch(`/api/goals/${goalId}/toggle`, { method: 'POST' });
    triggerRefresh();
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    await apiFetch('/api/goals', {
      method: 'POST',
      body: JSON.stringify({ title: newGoalTitle.trim(), subject: 'Science' })
    });
    setNewGoalTitle('');
    triggerRefresh();
  };

  const userName = dashboard?.user?.name?.split(' ')[0] || 'Vishwak';
  const stats = dashboard?.stats || { overallProgress: 0, topicsStudied: 0, quizzesCompleted: 0, totalStudyHours: 0, streakDays: 0 };
  const subjects: any[] = dashboard?.subjectPerformance || [];
  const goals: any[] = dashboard?.goals || [];
  const recentActivity: any[] = dashboard?.recentActivity || [];
  const completedGoalsCount = goals.filter((g) => g.completed).length;

  const quickActions: Array<{
    label: string;
    subtitle: string;
    iconName: FuturisticIconName;
    onClick: () => void;
  }> = [
    {
      label: 'AI Tutor',
      subtitle: 'Interactive Teacher',
      iconName: 'tutor',
      onClick: () => navigate(`/tutor?topic=${encodeURIComponent(heroTopicInput || activeTopic)}`)
    },
    {
      label: 'AI Notes',
      subtitle: 'Visual Notebooks',
      iconName: 'notes',
      onClick: () => navigate(`/notes?topic=${encodeURIComponent(heroTopicInput || activeTopic)}`)
    },
    {
      label: 'Games',
      subtitle: '7 Academic Games',
      iconName: 'games',
      onClick: () => openGamesHub(heroTopicInput || activeTopic)
    },
    {
      label: '3D Lab',
      subtitle: 'WebGL Models',
      iconName: 'lab3d',
      onClick: () => open3DLab(heroTopicInput || activeTopic)
    },
    {
      label: 'Video',
      subtitle: 'Visual Explainers',
      iconName: 'video',
      onClick: () => openVideoStudio(heroTopicInput || activeTopic)
    },
    {
      label: 'Image',
      subtitle: 'Diagrams & Charts',
      iconName: 'image',
      onClick: () => openImageStudio(heroTopicInput || activeTopic)
    },
    {
      label: 'Library',
      subtitle: 'All Saved Assets',
      iconName: 'library',
      onClick: () => navigate('/library')
    },
    {
      label: 'Quizzes',
      subtitle: 'Practice & Mastery',
      iconName: 'quiz',
      onClick: () => openQuizModal(heroTopicInput || activeTopic)
    }
  ];

  // SVG Ring math
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (Math.min(100, stats.overallProgress) / 100) * circumference;

  return (
    <div className="studyai-container">
      <TopBrandBar streakDays={stats.streakDays} />

      {/* Greeting & Universal Topic Search */}
      <section style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 999,
                background: '#FFF3E8',
                border: '1px solid rgba(255, 106, 0, 0.24)',
                color: '#E85D00',
                fontSize: '0.74rem',
                fontWeight: 800,
                marginBottom: 8
              }}
            >
              <Sparkles size={13} color="#FF6A00" />
              <span>INTELLIGENT PERSONALIZED LEARNING STUDIO</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#202124', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
              Good Morning, {userName}! ☀️
            </h1>
            <p style={{ color: '#6B7280', fontSize: '0.94rem', marginTop: 4 }}>
              Enter any topic below to launch synchronized AI tutoring, visual notes, 3D models, and interactive games.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/languages')}
            className="btn-glass"
            style={{ fontSize: '0.84rem', padding: '9px 16px' }}
          >
            <Globe size={16} color="#FF6A00" />
            <span>Speaking &amp; Languages Studio</span>
          </button>
        </div>

        <form onSubmit={handleStartJourney} className="glass-input-wrap" style={{ padding: '8px 10px 8px 20px' }}>
          <Search size={20} color="#FF6A00" />
          <input
            className="glass-input"
            value={heroTopicInput}
            onChange={(e) => setHeroTopicInput(e.target.value)}
            placeholder="Search any topic... (e.g., Photosynthesis, Newton's Laws, Human Heart, Trigonometry)"
            aria-label="Enter a topic to start learning"
          />
          <button type="submit" className="btn-orange" style={{ padding: '10px 22px', fontSize: '0.9rem' }}>
            Start Learning →
          </button>
        </form>
      </section>

      {/* Hero Section: One Topic -> One Complete Learning Journey */}
      <section className="hero-glass-banner" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          <div style={{ flex: '1 1 320px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 999,
                background: 'rgba(255, 106, 0, 0.13)',
                color: '#E85D00',
                fontSize: '0.74rem',
                fontWeight: 800,
                marginBottom: 10
              }}
            >
              <span>ACTIVE TOPIC ECOSYSTEM</span>
            </div>
            <h2
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '1.6rem',
                fontWeight: 900,
                color: '#202124',
                letterSpacing: '-0.02em',
                lineHeight: 1.25,
                marginBottom: 6
              }}
            >
              Your Learning Journey: <span style={{ color: '#FF6A00' }}>{heroTopicInput || activeTopic}</span>
            </h2>
            <div
              style={{
                fontSize: '0.96rem',
                fontWeight: 600,
                color: '#6B7280',
                marginBottom: 18,
                maxWidth: 580,
                lineHeight: 1.5
              }}
            >
              One Topic → Complete Learning across AI Tutor, Visual Notebook, Interactive 3D WebGL Models, Voice Teacher, and Educational Games.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <button type="button" onClick={() => handleStartJourney()} className="btn-orange" style={{ padding: '12px 28px', fontSize: '0.95rem' }}>
                <span>Explore with AI Tutor</span>
              </button>
              <button type="button" onClick={() => open3DLab(heroTopicInput || activeTopic)} className="btn-glass">
                <Box size={16} color="#FF6A00" />
                <span>Launch 3D Lab</span>
              </button>
              <button
                type="button"
                onClick={() => navigate(`/notes?topic=${encodeURIComponent(heroTopicInput || activeTopic)}`)}
                className="btn-glass"
              >
                <span>Open Visual Notes</span>
              </button>
            </div>
          </div>

          {/* 3D Mascot Illustration SVG */}
          <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'center' }}>
            <svg width="144" height="144" viewBox="0 0 140 140" aria-hidden="true" style={{ animation: 'float3D 5s ease-in-out infinite' }}>
              <defs>
                <radialGradient id="mascotGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FF6A00" stopOpacity="0.34" />
                  <stop offset="100%" stopColor="#FF6A00" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="70" cy="70" r="66" fill="url(#mascotGlow)" />
              {/* Antenna */}
              <line x1="70" y1="18" x2="70" y2="32" stroke="#FF6A00" strokeWidth="4" strokeLinecap="round" />
              <circle cx="70" cy="15" r="6" fill="#FF6A00" />
              {/* Head */}
              <rect x="34" y="32" width="72" height="54" rx="24" fill="#FFFFFF" stroke="#FF6A00" strokeWidth="3" />
              {/* Visor */}
              <rect x="44" y="44" width="52" height="28" rx="14" fill="#202124" />
              <circle cx="58" cy="58" r="5" fill="#FF6A00" />
              <circle cx="82" cy="58" r="5" fill="#FF6A00" />
              <path d="M64 64 Q70 69 76 64" stroke="#FF6A00" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              {/* Ears */}
              <rect x="25" y="50" width="8" height="20" rx="4" fill="#FF6A00" />
              <rect x="107" y="50" width="8" height="20" rx="4" fill="#FF6A00" />
              {/* Body */}
              <rect x="44" y="90" width="52" height="36" rx="18" fill="#FFFFFF" stroke="#FF6A00" strokeWidth="3" />
              <circle cx="70" cy="108" r="9" fill="#FFF3E8" stroke="#FF6A00" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </section>

      {/* 8 Quick Action Glass Tiles with Futuristic Illustrated Icons */}
      <section style={{ marginBottom: 26 }} aria-label="Learning Shortcuts">
        <div className="quick-actions-grid">
          {quickActions.map((item) => {
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className="quick-tile"
              >
                <div className="quick-tile-icon">
                  <FuturisticIcon name={item.iconName} size={42} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#202124' }}>{item.label}</div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#6B7280', marginTop: 2 }}>{item.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Dashboard Grid: Progress & Subject Bars + Goals & Recent Activity */}
      <div className="dashboard-grid">
        {/* Left Column: Your Progress Card */}
        <section className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <h3 style={{ fontSize: '1.14rem', fontWeight: 800, color: '#202124' }}>Your Learning Progress</h3>
              <p style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: 2 }}>Real-time subject mastery and study consistency</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              style={{
                border: '1px solid rgba(255, 106, 0, 0.24)',
                background: '#FFF3E8',
                color: '#E85D00',
                padding: '6px 12px',
                borderRadius: 999,
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <span>View Analytics</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {loading ? (
            <div style={{ padding: 28, textAlign: 'center', color: '#6B7280' }}>Loading real learning analytics...</div>
          ) : subjects.length === 0 ? (
            /* Honest Empty State for New Student */
            <div style={{ padding: 26, borderRadius: 20, background: '#FFF3E8', border: '1.5px solid rgba(255, 106, 0, 0.22)', textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#202124', marginBottom: 6 }}>
                Welcome to STUDYAI! Your Learning Journey Starts Here
              </div>
              <p style={{ fontSize: '0.86rem', color: '#6B7280', marginBottom: 16 }}>
                No completed study sessions or quizzes recorded yet for this account. Ask your AI Tutor a question or generate your first study notes to begin tracking real mastery!
              </p>
              <button type="button" onClick={() => handleStartJourney()} className="btn-orange">
                Start First Topic: Photosynthesis →
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 26, flexWrap: 'wrap' }}>
              {/* Circular Ring */}
              <div
                style={{
                  position: 'relative',
                  width: 124,
                  height: 124,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  background: '#FFFBF7',
                  borderRadius: '50%',
                  boxShadow: 'inset 0 2px 8px rgba(255, 106, 0, 0.08)'
                }}
              >
                <svg width="124" height="124" viewBox="0 0 124 124">
                  <circle cx="62" cy="62" r={radius} stroke="#FFF3E8" strokeWidth="10" fill="none" />
                  <circle
                    cx="62"
                    cy="62"
                    r={radius}
                    stroke="#FF6A00"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={progressOffset}
                    strokeLinecap="round"
                    transform="rotate(-90 62 62)"
                  />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.42rem', fontWeight: 900, color: '#202124' }}>{stats.overallProgress}%</div>
                  <div style={{ fontSize: '0.68rem', color: '#E85D00', fontWeight: 800, textTransform: 'uppercase' }}>Mastery</div>
                </div>
              </div>

              {/* Subject Bars — Unified Signature Orange & Warm Accent Hierarchy */}
              <div style={{ flex: 1, minWidth: 220, display: 'grid', gap: 12 }}>
                {subjects.map((subj) => {
                  return (
                    <div key={subj.subject}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700, color: '#202124', marginBottom: 5 }}>
                        <span>{subj.subject}</span>
                        <span style={{ color: '#FF6A00', fontWeight: 800 }}>{subj.score}%</span>
                      </div>
                      <div style={{ height: 9, borderRadius: 999, background: '#FFF3E8', overflow: 'hidden', border: '1px solid rgba(255, 106, 0, 0.14)' }}>
                        <div
                          style={{
                            width: `${subj.score}%`,
                            height: '100%',
                            borderRadius: 999,
                            background: 'linear-gradient(90deg, #FF8533 0%, #FF6A00 60%, #E85D00 100%)',
                            transition: 'width 0.5s cubic-bezier(0.22, 1, 0.36, 1)'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Metric Pills */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 22 }}>
            <div style={{ padding: '12px 14px', borderRadius: 16, background: '#FFF3E8', border: '1px solid rgba(255, 106, 0, 0.2)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#FF6A00' }}>{stats.topicsStudied}</div>
              <div style={{ fontSize: '0.74rem', color: '#6B7280', fontWeight: 700, marginTop: 2 }}>Topics Studied</div>
            </div>
            <div style={{ padding: '12px 14px', borderRadius: 16, background: '#FFFFFF', border: '1.5px solid rgba(255, 106, 0, 0.18)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#E85D00' }}>{stats.quizAccuracy}%</div>
              <div style={{ fontSize: '0.74rem', color: '#6B7280', fontWeight: 700, marginTop: 2 }}>Quiz Accuracy</div>
            </div>
            <div style={{ padding: '12px 14px', borderRadius: 16, background: '#FFF3E8', border: '1px solid rgba(255, 106, 0, 0.2)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#202124' }}>{stats.totalStudyHours}h</div>
              <div style={{ fontSize: '0.74rem', color: '#6B7280', fontWeight: 700, marginTop: 2 }}>Study Time</div>
            </div>
          </div>
        </section>

        {/* Right Column: Today's Goals & Recent Activity */}
        <div style={{ display: 'grid', gap: 20 }}>
          <section className="glass-card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#202124' }}>Today's Study Goals</h3>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: 999,
                  background: '#FFF3E8',
                  color: '#FF6A00',
                  border: '1px solid rgba(255, 106, 0, 0.22)'
                }}
              >
                {completedGoalsCount}/{goals.length} Completed
              </span>
            </div>

            <div style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
              {goals.slice(0, 4).map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleToggleGoal(g.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    borderRadius: 14,
                    border: g.completed ? '1.5px solid rgba(255, 106, 0, 0.32)' : '1px solid rgba(32, 33, 36, 0.08)',
                    background: g.completed ? '#FFF3E8' : '#FFFFFF',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.18s ease'
                  }}
                >
                  {g.completed ? <CheckCircle2 size={18} color="#FF6A00" /> : <Circle size={18} color="#9CA3AF" />}
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: g.completed ? '#E85D00' : '#202124',
                      textDecoration: g.completed ? 'line-through' : 'none',
                      flex: 1
                    }}
                  >
                    {g.title}
                  </span>
                </button>
              ))}
            </div>

            <form onSubmit={handleAddGoal} style={{ display: 'flex', gap: 8 }}>
              <input
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                placeholder="Add a new study goal..."
                style={{
                  flex: 1,
                  padding: '9px 14px',
                  borderRadius: 999,
                  border: '1.5px solid rgba(255, 106, 0, 0.22)',
                  background: '#FFFFFF',
                  fontSize: '0.84rem',
                  color: '#202124',
                  outline: 'none'
                }}
              />
              <button type="submit" className="btn-orange" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
                <Plus size={14} /> Add
              </button>
            </form>
          </section>

          <section className="glass-card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#202124', marginBottom: 12 }}>Recent Learning Activity</h3>
            {recentActivity.length === 0 ? (
              <div style={{ fontSize: '0.85rem', color: '#6B7280', padding: '12px 0' }}>
                No activity recorded yet. Start a topic above!
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {recentActivity.slice(0, 4).map((act) => (
                  <div
                    key={act.id}
                    onClick={() => {
                      if (act.activity_type === 'note') navigate(`/notes?id=${act.resource_id || ''}`);
                      else if (act.activity_type === 'video') openVideoStudio(act.topic);
                      else if (act.activity_type === 'model3d') open3DLab(act.topic);
                      else if (act.activity_type === 'quiz') openQuizModal(act.topic, act.subject);
                      else if (act.activity_type === 'game') openGamesHub(act.topic, act.subject);
                      else navigate(`/tutor?topic=${encodeURIComponent(act.topic)}`);
                    }}
                    className="glass-card-interactive"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '11px 14px',
                      borderRadius: 16,
                      background: '#FFFFFF',
                      border: '1px solid rgba(255, 106, 0, 0.16)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#202124' }}>{act.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: 2 }}>
                        <span style={{ color: '#FF6A00', fontWeight: 700 }}>{act.subject}</span> • {act.duration_minutes} mins
                      </div>
                    </div>
                    <ChevronRight size={16} color="#FF6A00" />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
