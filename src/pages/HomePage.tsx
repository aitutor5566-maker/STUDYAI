import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bot,
  FileText,
  Gamepad2,
  Box,
  Video,
  Image as ImageIcon,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  Circle,
  ChevronRight,
  Plus,
  Sparkles
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

  const subjectColors: Record<string, string> = {
    Science: '#22C55E',
    Maths: '#3B82F6',
    English: '#A855F7',
    'Social Studies': '#F59E0B',
    'Computer Science': '#06B6D4'
  };

  const quickActions: Array<{
    label: string;
    iconName: FuturisticIconName;
    onClick: () => void;
  }> = [
    {
      label: 'AI Tutor',
      iconName: 'tutor',
      onClick: () => navigate(`/tutor?topic=${encodeURIComponent(heroTopicInput || activeTopic)}`)
    },
    {
      label: 'Notes',
      iconName: 'notes',
      onClick: () => navigate(`/notes?topic=${encodeURIComponent(heroTopicInput || activeTopic)}`)
    },
    {
      label: 'Games',
      iconName: 'games',
      onClick: () => openGamesHub(heroTopicInput || activeTopic)
    },
    {
      label: '3D Lab',
      iconName: 'lab3d',
      onClick: () => open3DLab(heroTopicInput || activeTopic)
    },
    {
      label: 'Video',
      iconName: 'video',
      onClick: () => openVideoStudio(heroTopicInput || activeTopic)
    },
    {
      label: 'Image',
      iconName: 'image',
      onClick: () => openImageStudio(heroTopicInput || activeTopic)
    },
    {
      label: 'Library',
      iconName: 'library',
      onClick: () => navigate('/library')
    },
    {
      label: 'More',
      iconName: 'quiz',
      onClick: () => openQuizModal(heroTopicInput || activeTopic)
    }
  ];

  // SVG Ring math
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (Math.min(100, stats.overallProgress) / 100) * circumference;

  return (
    <div className="studyai-container">
      <TopBrandBar streakDays={stats.streakDays} />

      {/* Greeting & Universal Topic Search */}
      <section style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#202124', letterSpacing: '-0.02em' }}>
          Good Morning, {userName}! ☀️
        </h1>
        <p style={{ color: '#6B7280', fontSize: '0.92rem', marginTop: 2, marginBottom: 14 }}>
          Keep going! You're doing great.
        </p>

        <form onSubmit={handleStartJourney} className="glass-input-wrap">
          <Search size={19} color="#FF6A00" />
          <input
            className="glass-input"
            value={heroTopicInput}
            onChange={(e) => setHeroTopicInput(e.target.value)}
            placeholder="Search anything... (topics, notes, games, videos...)"
            aria-label="Enter a topic to start learning"
          />
          <button type="submit" className="btn-orange" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
            Start Learning
          </button>
        </form>
      </section>

      {/* Hero Section: One Topic -> One Complete Learning Journey */}
      <section className="hero-glass-banner" style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px' }}>
            <h2
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '1.45rem',
                fontWeight: 800,
                color: '#202124',
                lineHeight: 1.25,
                marginBottom: 4
              }}
            >
              Your Learning Journey
            </h2>
            <div
              style={{
                fontSize: '1.02rem',
                fontWeight: 700,
                color: '#374151',
                marginBottom: 14
              }}
            >
              One Topic → Complete Learning
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <button type="button" onClick={() => handleStartJourney()} className="btn-orange" style={{ padding: '11px 28px', fontSize: '0.95rem' }}>
                <span>Explore</span>
              </button>
              <button type="button" onClick={() => open3DLab(heroTopicInput || activeTopic)} className="btn-glass">
                <Box size={16} color="#FF6A00" />
                <span>3D Lab</span>
              </button>
            </div>
          </div>

          {/* 3D Mascot Illustration SVG */}
          <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'center' }}>
            <svg width="136" height="136" viewBox="0 0 140 140" aria-hidden="true">
              <defs>
                <radialGradient id="mascotGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="#FF6A00" stop-opacity="0.32" />
                  <stop offset="100%" stop-color="#FF6A00" stop-opacity="0" />
                </radialGradient>
              </defs>
              <circle cx="70" cy="70" r="66" fill="url(#mascotGlow)" />
              {/* Antenna */}
              <line x1="70" y1="18" x2="70" y2="32" stroke="#FF6A00" stroke-width="4" stroke-linecap="round" />
              <circle cx="70" cy="15" r="6" fill="#FF6A00" />
              {/* Head */}
              <rect x="34" y="32" width="72" height="54" rx="24" fill="#FFFFFF" stroke="#FF6A00" stroke-width="3" />
              {/* Visor */}
              <rect x="44" y="44" width="52" height="28" rx="14" fill="#202124" />
              <circle cx="58" cy="58" r="5" fill="#FF8533" />
              <circle cx="82" cy="58" r="5" fill="#FF8533" />
              <path d="M64 64 Q70 69 76 64" stroke="#FF8533" stroke-width="2.5" fill="none" stroke-linecap="round" />
              {/* Ears */}
              <rect x="25" y="50" width="8" height="20" rx="4" fill="#FF6A00" />
              <rect x="107" y="50" width="8" height="20" rx="4" fill="#FF6A00" />
              {/* Body */}
              <rect x="44" y="90" width="52" height="36" rx="18" fill="#FFFFFF" stroke="#FF6A00" stroke-width="3" />
              <circle cx="70" cy="108" r="9" fill="#FFF3E8" stroke="#FF6A00" stroke-width="2" />
            </svg>
          </div>
        </div>
      </section>

      {/* 8 Quick Action Glass Tiles with Futuristic Illustrated Icons */}
      <section style={{ marginBottom: 24 }} aria-label="Learning Shortcuts">
        <div className="quick-actions-grid">
          {quickActions.map((item) => {
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className="quick-tile"
              >
                <div className="quick-tile-icon" style={{ background: 'transparent' }}>
                  <FuturisticIcon name={item.iconName} size={46} />
                </div>
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#202124' }}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Dashboard Grid: Progress & Subject Bars + Goals & Recent Activity */}
      <div className="dashboard-grid">
        {/* Left Column: Your Progress Card */}
        <section className="glass-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#202124' }}>Your Progress</h3>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              style={{ border: 'none', background: 'transparent', color: '#FF6A00', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}
            >
              <span>View All</span>
              <ChevronRight size={15} />
            </button>
          </div>

          {loading ? (
            <div style={{ padding: 28, textAlign: 'center', color: '#6B7280' }}>Loading real learning analytics...</div>
          ) : subjects.length === 0 ? (
            /* Honest Empty State for New Student (Section 7 requirement) */
            <div style={{ padding: 24, borderRadius: 18, background: '#FFF3E8', textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#202124', marginBottom: 6 }}>
                Welcome to STUDYAI! Your Learning Journey Starts Here
              </div>
              <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: 14 }}>
                No completed study sessions or quizzes recorded yet for this account. Ask your AI Tutor a question or generate your first study notes to begin tracking real mastery!
              </p>
              <button type="button" onClick={() => handleStartJourney()} className="btn-orange">
                Start First Topic: Photosynthesis →
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              {/* Circular Ring */}
              <div style={{ position: 'relative', width: 116, height: 116, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="116" height="116" viewBox="0 0 116 116">
                  <circle cx="58" cy="58" r={radius} stroke="#F3E8DF" strokeWidth="10" fill="none" />
                  <circle
                    cx="58"
                    cy="58"
                    r={radius}
                    stroke="#FF6A00"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={progressOffset}
                    strokeLinecap="round"
                    transform="rotate(-90 58 58)"
                  />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#202124' }}>{stats.overallProgress}%</div>
                  <div style={{ fontSize: '0.66rem', color: '#6B7280', fontWeight: 600 }}>Overall</div>
                </div>
              </div>

              {/* Subject Bars */}
              <div style={{ flex: 1, minWidth: 200, display: 'grid', gap: 10 }}>
                {subjects.map((subj) => {
                  const barColor = subjectColors[subj.subject] || '#FF6A00';
                  return (
                    <div key={subj.subject}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>
                        <span>{subj.subject}</span>
                        <span>{subj.score}%</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 999, background: '#F3F4F6', overflow: 'hidden' }}>
                        <div style={{ width: `${subj.score}%`, height: '100%', borderRadius: 999, background: barColor }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Metric Pills */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 18 }}>
            <div style={{ padding: '10px 12px', borderRadius: 14, background: '#FFFDFB', border: '1px solid rgba(255,106,0,0.15)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FF6A00' }}>{stats.topicsStudied}</div>
              <div style={{ fontSize: '0.72rem', color: '#6B7280', fontWeight: 600 }}>Topics Studied</div>
            </div>
            <div style={{ padding: '10px 12px', borderRadius: 14, background: '#FFFDFB', border: '1px solid rgba(255,106,0,0.15)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#16A34A' }}>{stats.quizAccuracy}%</div>
              <div style={{ fontSize: '0.72rem', color: '#6B7280', fontWeight: 600 }}>Quiz Accuracy</div>
            </div>
            <div style={{ padding: '10px 12px', borderRadius: 14, background: '#FFFDFB', border: '1px solid rgba(255,106,0,0.15)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#202124' }}>{stats.totalStudyHours}h</div>
              <div style={{ fontSize: '0.72rem', color: '#6B7280', fontWeight: 600 }}>Study Time</div>
            </div>
          </div>
        </section>

        {/* Right Column: Today's Goals & Recent Activity */}
        <div style={{ display: 'grid', gap: 18 }}>
          <section className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <h3 style={{ fontSize: '1.02rem', fontWeight: 800 }}>Today's Goals</h3>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FF6A00' }}>
                {completedGoalsCount}/{goals.length}
              </span>
            </div>

            <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
              {goals.slice(0, 4).map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleToggleGoal(g.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 12,
                    border: '1px solid rgba(0,0,0,0.06)',
                    background: g.completed ? '#ECFDF5' : '#FFFFFF',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  {g.completed ? <CheckCircle2 size={17} color="#16A34A" /> : <Circle size={17} color="#9CA3AF" />}
                  <span style={{ fontSize: '0.84rem', fontWeight: 600, color: g.completed ? '#047857' : '#202124', textDecoration: g.completed ? 'line-through' : 'none', flex: 1 }}>
                    {g.title}
                  </span>
                </button>
              ))}
            </div>

            <form onSubmit={handleAddGoal} style={{ display: 'flex', gap: 8 }}>
              <input
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                placeholder="Add a study goal..."
                style={{ flex: 1, padding: '8px 12px', borderRadius: 999, border: '1px solid rgba(0,0,0,0.12)', fontSize: '0.82rem' }}
              />
              <button type="submit" className="btn-glass" style={{ padding: '7px 12px', fontSize: '0.8rem' }}>
                <Plus size={14} /> Add
              </button>
            </form>
          </section>

          <section className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: '1.02rem', fontWeight: 800, marginBottom: 12 }}>Recent Activity</h3>
            {recentActivity.length === 0 ? (
              <div style={{ fontSize: '0.84rem', color: '#6B7280' }}>No activity recorded yet. Start a topic above!</div>
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
                      padding: '10px 14px',
                      borderRadius: 14,
                      background: '#FFFFFF',
                      border: '1px solid rgba(0,0,0,0.06)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#202124' }}>{act.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                        {act.subject} • {act.duration_minutes} mins
                      </div>
                    </div>
                    <ChevronRight size={16} color="#9CA3AF" />
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
