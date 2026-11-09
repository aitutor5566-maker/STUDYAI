import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Circle,
  ChevronRight,
  Plus,
  Sparkles,
  Globe,
  Mic,
  Flame,
  BookOpen,
  Award,
  Zap,
  Play,
  RotateCcw,
  Compass
} from 'lucide-react';
import { TopBrandBar } from '../components/GlassNav';
import { FuturisticIcon, FuturisticIconName } from '../components/FuturisticIcons';
import { StudyAiAssistantCharacter } from '../components/StudyAiAssistantCharacter';
import { useLearning } from '../context/LearningContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    apiFetch,
    activeTopic,
    setTopicContext,
    openGamesHub,
    openQuizModal,
    refreshTick,
    triggerRefresh
  } = useLearning();

  const [dashboard, setDashboard] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [heroTopicInput, setHeroTopicInput] = useState<string>('');
  const [newGoalTitle, setNewGoalTitle] = useState<string>('');
  const [assistantBubble, setAssistantBubble] = useState<string>("Ready to master a new topic today?");
  const [isListeningVoice, setIsListeningVoice] = useState<boolean>(false);

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

  const handleStartJourney = async (e?: React.FormEvent, customTopic?: string) => {
    if (e) e.preventDefault();
    const targetTopic = (customTopic || heroTopicInput || activeTopic || 'Photosynthesis').trim();
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

  // Web Speech Recognition for Voice Input
  const handleVoiceSearch = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setAssistantBubble("Voice input is supported in Chrome, Safari and Edge.");
      return;
    }
    try {
      const recognition = new SpeechRec();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListeningVoice(true);
        setAssistantBubble("Listening... Speak your study topic!");
      };

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        if (spoken) {
          setHeroTopicInput(spoken);
          setAssistantBubble(`Found: "${spoken}". Click Start to learn!`);
        }
      };

      recognition.onerror = () => {
        setIsListeningVoice(false);
        setAssistantBubble("Could not capture audio. Please type topic.");
      };

      recognition.onend = () => {
        setIsListeningVoice(false);
      };

      recognition.start();
    } catch {
      setIsListeningVoice(false);
      setAssistantBubble("Voice input unavailable. Please type your topic.");
    }
  };

  const userName = dashboard?.user?.name?.split(' ')[0] || 'Vishwak';
  const userGrade = dashboard?.user?.grade ? `Grade ${dashboard.user.grade}` : 'Grade 10';
  const userBoard = dashboard?.user?.board || 'CBSE';
  const stats = dashboard?.stats || { overallProgress: 0, topicsStudied: 0, quizzesCompleted: 0, totalStudyHours: 0, streakDays: 0 };
  const subjects: any[] = dashboard?.subjectPerformance || [];
  const goals: any[] = dashboard?.goals || [];
  const recentActivity: any[] = dashboard?.recentActivity || [];
  const completedGoalsCount = goals.filter((g) => g.completed).length;

  // STRICT 5-DESTINATION ARCHITECTURE (Per Part 3 & 4.E: No standalone 3D Studio or Video destinations)
  const coreLearningDestinations: Array<{
    label: string;
    subtitle: string;
    tag: string;
    iconName: FuturisticIconName;
    onClick: () => void;
  }> = [
    {
      label: 'AI Tutor',
      subtitle: 'Friendly Personal AI Teacher',
      tag: 'Interactive AI',
      iconName: 'tutor',
      onClick: () => navigate(`/tutor?topic=${encodeURIComponent(heroTopicInput || activeTopic)}`)
    },
    {
      label: 'AI Notes',
      subtitle: 'Deep Textbook & Revision',
      tag: 'Progressive Notes',
      iconName: 'notes',
      onClick: () => navigate(`/notes?topic=${encodeURIComponent(heroTopicInput || activeTopic)}&auto=true`)
    },
    {
      label: 'Academic Games',
      subtitle: '7 Curriculum Mastery Games',
      tag: 'Gamified Practice',
      iconName: 'games',
      onClick: () => openGamesHub(heroTopicInput || activeTopic)
    },
    {
      label: 'Saved Library',
      subtitle: 'All Bookmarked Resources',
      tag: 'Personalized Hub',
      iconName: 'library',
      onClick: () => navigate('/library')
    },
    {
      label: 'Language Studio',
      subtitle: 'Speaking, Scripts & Practice',
      tag: 'Multilingual Hub',
      iconName: 'profile',
      onClick: () => navigate('/languages')
    }
  ];

  // SVG Ring math
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (Math.min(100, stats.overallProgress) / 100) * circumference;

  return (
    <div className="studyai-container">
      {/* 1. Header with Brand, Class & Streak */}
      <TopBrandBar streakDays={stats.streakDays} />

      {/* 2. Expressive Animated Welcome Area with StudyAiAssistantCharacter (Part 4.B) */}
      <section
        className="glass-panel"
        style={{
          padding: '24px 28px',
          borderRadius: 24,
          marginBottom: 20,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.94) 0%, rgba(255, 248, 242, 0.96) 50%, rgba(255, 243, 232, 0.9) 100%)',
          border: '1.5px solid rgba(255, 106, 0, 0.22)',
          boxShadow: '0 12px 32px -8px rgba(255, 106, 0, 0.12), inset 0 1px 0 #FFFFFF'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          {/* Welcome Text & Syllabus Context */}
          <div style={{ flex: '1 1 260px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '3px 10px',
                  borderRadius: 999,
                  background: '#FFF3E8',
                  border: '1px solid rgba(255, 106, 0, 0.28)',
                  color: '#E85D00',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em'
                }}
              >
                <Sparkles size={12} color="#FF6A00" />
                <span>STUDYAI LEARNING COMMAND CENTRE</span>
              </span>
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: 999,
                  background: '#FFFFFF',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  color: '#6B7280',
                  fontSize: '0.72rem',
                  fontWeight: 700
                }}
              >
                {userGrade} • {userBoard}
              </span>
            </div>

            <h1
              style={{
                fontSize: '1.9rem',
                fontWeight: 900,
                color: '#202124',
                letterSpacing: '-0.03em',
                lineHeight: 1.2,
                margin: '0 0 6px 0'
              }}
            >
              Good Day, {userName}! ☀️
            </h1>
            <p style={{ color: '#6B7280', fontSize: '0.92rem', margin: '0 0 14px 0', maxWidth: 540, lineHeight: 1.5 }}>
              Your friendly personal AI teacher is ready. Enter any topic below for deep textbook notes, verified picture-based learning, and natural audio lessons.
            </p>

            {/* Contextual Learning Suggestion Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#E85D00', textTransform: 'uppercase' }}>
                Curriculum Suggestions:
              </span>
              {[
                { label: 'Structure of the Human Heart', emoji: '❤️' },
                { label: 'Photosynthesis Light Reactions', emoji: '🌿' },
                { label: "Newton's Laws of Motion", emoji: '⚡' },
                { label: 'DNA Double Helix', emoji: '🧬' }
              ].map((sug) => (
                <button
                  key={sug.label}
                  type="button"
                  onClick={() => {
                    setHeroTopicInput(sug.label);
                    handleStartJourney(undefined, sug.label);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '4px 10px',
                    borderRadius: 999,
                    background: '#FFFFFF',
                    border: '1px solid rgba(255, 106, 0, 0.22)',
                    color: '#202124',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#FF6A00';
                    e.currentTarget.style.background = '#FFF3E8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 106, 0, 0.22)';
                    e.currentTarget.style.background = '#FFFFFF';
                  }}
                >
                  <span>{sug.emoji}</span>
                  <span>{sug.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive AI Assistant Character ("Aura") */}
          <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'center', padding: '0 12px' }}>
            <StudyAiAssistantCharacter
              size="lg"
              state={isListeningVoice ? 'thinking' : 'idle'}
              bubbleText={assistantBubble}
              showBubble
              onClick={() => {
                const quotes = [
                  `Ready to master "${heroTopicInput || activeTopic}" with AI Tutor?`,
                  "Click any suggestion pill to begin your lesson!",
                  "Tip: Picture-first diagrams and voice lessons are built right into AI Tutor!",
                  "Consistency is key — your streak is active!"
                ];
                setAssistantBubble(quotes[Math.floor(Math.random() * quotes.length)]);
              }}
            />
          </div>
        </div>
      </section>

      {/* 3. Intelligent Futuristic Topic Input (Part 4.C) */}
      <section style={{ marginBottom: 24 }}>
        <form
          onSubmit={handleStartJourney}
          className="glass-input-wrap-futuristic"
        >
          <div className="futuristic-input-row">
            <Search size={22} color="#FF6A00" style={{ flexShrink: 0 }} />
            <input
              className="glass-input"
              value={heroTopicInput}
              onChange={(e) => setHeroTopicInput(e.target.value)}
              placeholder="Search or ask any concept... (e.g. Photosynthesis, Chemical Bonding, Linear Equations)"
              aria-label="Enter study topic"
              style={{ fontSize: '0.92rem' }}
            />

            {/* Voice Input Button */}
            <button
              type="button"
              onClick={handleVoiceSearch}
              className="btn-glass"
              style={{
                padding: '7px 12px',
                borderRadius: 999,
                background: isListeningVoice ? '#FF6A00' : '#FFF3E8',
                color: isListeningVoice ? '#FFFFFF' : '#FF6A00',
                borderColor: 'rgba(255, 106, 0, 0.3)',
                flexShrink: 0
              }}
              title="Search using voice"
            >
              <Mic size={16} />
              <span style={{ fontSize: '0.74rem', fontWeight: 700 }}>
                {isListeningVoice ? '...' : 'Voice'}
              </span>
            </button>
          </div>

          <button
            type="submit"
            className="btn-orange"
            style={{ padding: '10px 22px', fontSize: '0.9rem', borderRadius: 999, flexShrink: 0 }}
          >
            Start Learning →
          </button>
        </form>
      </section>

      {/* 4. Active Learning Journey Command Panel (Part 4.D) */}
      <section className="hero-glass-banner" style={{ marginBottom: 24, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 340px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#FF6A00',
                  boxShadow: '0 0 10px #FF6A00',
                  animation: 'antennaPulse 1.8s infinite'
                }}
              />
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#E85D00', textTransform: 'uppercase' }}>
                Active Learning Topic
              </span>
            </div>
            <h2
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '1.55rem',
                fontWeight: 900,
                color: '#202124',
                letterSpacing: '-0.02em',
                lineHeight: 1.25,
                margin: '0 0 6px 0'
              }}
            >
              Current Journey: <span style={{ color: '#FF6A00' }}>{heroTopicInput || activeTopic}</span>
            </h2>
            <p style={{ color: '#6B7280', fontSize: '0.88rem', margin: '0 0 16px 0', maxWidth: 560, lineHeight: 1.45 }}>
              Comprehensive curriculum mastery: Interactive AI Tutor, progressive visual notes, verified scientific diagrams, and practice quizzes.
            </p>

            {/* Quick Action CTAs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleStartJourney()}
                className="btn-orange"
                style={{ padding: '10px 22px', fontSize: '0.88rem' }}
              >
                <span>Launch AI Tutor Workspace →</span>
              </button>
              <button
                type="button"
                onClick={() => navigate(`/notes?topic=${encodeURIComponent(heroTopicInput || activeTopic)}&auto=true`)}
                className="btn-glass"
                style={{ padding: '10px 18px', fontSize: '0.88rem' }}
              >
                <BookOpen size={15} color="#FF6A00" />
                <span>Open Visual Notes</span>
              </button>
              <button
                type="button"
                onClick={() => openQuizModal(heroTopicInput || activeTopic)}
                className="btn-glass"
                style={{ padding: '10px 18px', fontSize: '0.88rem' }}
              >
                <Award size={15} color="#FF6A00" />
                <span>Practice Quiz</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Capsule */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: 18,
              background: '#FFFFFF',
              border: '1.5px solid rgba(255, 106, 0, 0.22)',
              boxShadow: '0 6px 18px rgba(255, 106, 0, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: 16
            }}
          >
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase' }}>
                Study Streak
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <Flame size={18} color="#FF6A00" />
                <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#202124' }}>
                  {stats.streakDays}
                </span>
                <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>days</span>
              </div>
            </div>
            <div style={{ width: 1, height: 36, background: '#EEEEEE' }} />
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase' }}>
                Total Mastery
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#FF6A00', marginTop: 2 }}>
                {Math.round(stats.overallProgress)}%
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Five Main Feature Command Tiles (Part 4.E: AI Tutor, AI Notes, Games, Library, Languages) */}
      <section style={{ marginBottom: 28 }} aria-label="Core Learning Destinations">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: '1.18rem', fontWeight: 900, color: '#202124', margin: 0 }}>
              Core Learning Modules
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '2px 0 0 0' }}>
              Deep educational notebooks, verified scientific diagrams, and friendly voice lessons integrated into your workspace.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 14
          }}
        >
          {coreLearningDestinations.map((item) => (
            <div
              key={item.label}
              onClick={item.onClick}
              className="futuristic-feature-card"
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 14,
                      background: '#FFF3E8',
                      border: '1px solid rgba(255, 106, 0, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <FuturisticIcon name={item.iconName} size={30} />
                  </div>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 999,
                      background: '#FFF3E8',
                      color: '#E85D00'
                    }}
                  >
                    {item.tag}
                  </span>
                </div>

                <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#202124', marginBottom: 4 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#6B7280', lineHeight: 1.4 }}>
                  {item.subtitle}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  color: '#FF6A00',
                  marginTop: 6
                }}
              >
                <span>Enter Workspace</span>
                <ChevronRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Learning Progress & Daily Goals Grid (Part 4.F) */}
      <div className="dashboard-grid">
        {/* Left: Overall Progress & Subject Mastery */}
        <section className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <h3 style={{ fontSize: '1.14rem', fontWeight: 800, color: '#202124', margin: 0 }}>
                Curriculum Progress
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '2px 0 0 0' }}>
                Real stored student mastery from actual study activity
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="btn-glass"
              style={{ fontSize: '0.76rem', padding: '6px 12px' }}
            >
              <span>View Profile</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {loading ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#6B7280' }}>Loading curriculum analytics...</div>
          ) : (
            <div>
              {/* Circular Ring + Overall Stat */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  padding: '16px 20px',
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF8F2 100%)',
                  border: '1px solid rgba(255, 106, 0, 0.18)',
                  marginBottom: 18
                }}
              >
                <div style={{ position: 'relative', width: 104, height: 104, flexShrink: 0 }}>
                  <svg width="104" height="104" style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                      cx="52"
                      cy="52"
                      r={radius}
                      stroke="#FFE4CC"
                      strokeWidth="9"
                      fill="none"
                    />
                    <circle
                      cx="52"
                      cy="52"
                      r={radius}
                      stroke="#FF6A00"
                      strokeWidth="9"
                      strokeDasharray={circumference}
                      strokeDashoffset={progressOffset}
                      strokeLinecap="round"
                      fill="none"
                      style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                    />
                  </svg>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#202124' }}>
                      {Math.round(stats.overallProgress)}%
                    </span>
                    <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                      Mastered
                    </span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#202124' }}>
                    {stats.topicsStudied} Curriculum Concepts Studied
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: 4, lineHeight: 1.4 }}>
                    {stats.quizzesCompleted} quizzes evaluated with honest accuracy checks.
                  </div>
                </div>
              </div>

              {/* Subject Breakdown Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {subjects.slice(0, 4).map((sub) => (
                  <div key={sub.subject}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>
                      <span style={{ color: '#202124' }}>{sub.subject}</span>
                      <span style={{ color: '#FF6A00' }}>{Math.round(sub.progress || sub.score)}%</span>
                    </div>
                    <div style={{ width: '100%', height: 8, borderRadius: 999, background: '#FFF3E8', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.min(100, Math.max(0, sub.progress || sub.score))}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #FF6A00 0%, #E85D00 100%)',
                          borderRadius: 999,
                          transition: 'width 0.6s ease'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Right: Daily Goals & Recent Activity */}
        <section className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: '1.14rem', fontWeight: 800, color: '#202124', margin: 0 }}>
                Daily Study Goals
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '2px 0 0 0' }}>
                {completedGoalsCount} of {goals.length} completed today
              </p>
            </div>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: 999,
                background: completedGoalsCount === goals.length && goals.length > 0 ? '#DCFCE7' : '#FFF3E8',
                color: completedGoalsCount === goals.length && goals.length > 0 ? '#166534' : '#E85D00'
              }}
            >
              {completedGoalsCount === goals.length && goals.length > 0 ? '✓ All Done!' : 'In Progress'}
            </span>
          </div>

          {/* Goal List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {goals.map((goal) => (
              <div
                key={goal.id}
                onClick={() => handleToggleGoal(goal.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: 12,
                  background: goal.completed ? '#F9FAFB' : '#FFFFFF',
                  border: goal.completed ? '1px solid #E5E7EB' : '1.5px solid rgba(255, 106, 0, 0.22)',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease'
                }}
              >
                {goal.completed ? (
                  <CheckCircle2 size={18} color="#16A34A" />
                ) : (
                  <Circle size={18} color="#FF6A00" />
                )}
                <span
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: goal.completed ? '#9CA3AF' : '#202124',
                    textDecoration: goal.completed ? 'line-through' : 'none'
                  }}
                >
                  {goal.title}
                </span>
              </div>
            ))}
          </div>

          {/* Add Goal Input */}
          <form onSubmit={handleAddGoal} style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              placeholder="Add a new study goal..."
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 999,
                border: '1.5px solid #E5E7EB',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              className="btn-orange"
              style={{ padding: '8px 16px', fontSize: '0.8rem', borderRadius: 999 }}
            >
              <Plus size={14} />
              <span>Add</span>
            </button>
          </form>

          {/* Recent Activity List */}
          {recentActivity.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#202124', marginBottom: 8, textTransform: 'uppercase' }}>
                Recent Study Sessions
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {recentActivity.slice(0, 3).map((act) => (
                  <div
                    key={act.id}
                    onClick={() => {
                      if (act.activity_type === 'note') navigate(`/notes?topic=${encodeURIComponent(act.topic)}&auto=true`);
                      else navigate(`/tutor?topic=${encodeURIComponent(act.topic)}`);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: 10,
                      background: '#FFF3E8',
                      cursor: 'pointer'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#202124' }}>
                        {act.title || act.topic}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#6B7280' }}>
                        {act.subject} • {act.activity_type.toUpperCase()}
                      </div>
                    </div>
                    <ChevronRight size={14} color="#FF6A00" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;
