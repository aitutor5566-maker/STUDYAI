import React, { useState, useEffect } from 'react';
import { Search, Play, Trophy } from 'lucide-react';
import { useLearning } from '../context/LearningContext';
import { EducationalGamePlayerModal } from './EducationalGamePlayerModal';
import { KatanaGameModal } from './games/KatanaGameModal';
import { StudyRush3DModal } from './games/StudyRush3DModal';
import { WarOfWordsModal } from './games/WarOfWordsModal';
import { SpeakingPracticeGameModal } from './games/SpeakingPracticeGameModal';

interface GameItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  icon: string;
  badge_color?: string;
  badgeColor?: string;
  compatible_subjects?: string[];
  compatibleSubjects?: string[];
  supported_difficulties?: string[];
  supportedDifficulties?: string[];
  instructions?: string[];
}

export const EducationalGamesSection: React.FC = () => {
  const { apiFetch, activeTopic, studentId, openGamesHub } = useLearning();

  const [games, setGames] = useState<GameItem[]>([]);
  const [, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [hubTab, setHubTab] = useState<'all' | '3d_worlds' | 'battle_action' | 'space' | 'subject_brain' | 'language_speaking'>('all');
  const [gameTopic, setGameTopic] = useState<string>(activeTopic || 'Photosynthesis');

  // Modal player state
  const [activeModalGame, setActiveModalGame] = useState<{ slug: string; name: string } | null>(null);
  const [katanaOpen, setKatanaOpen] = useState<boolean>(false);
  const [studyRushOpen, setStudyRushOpen] = useState<boolean>(false);
  const [warOfWordsOpen, setWarOfWordsOpen] = useState<boolean>(false);
  const [speakingOpen, setSpeakingOpen] = useState<boolean>(false);

  // Student stats
  const [, setRecentStats] = useState<any[]>([]);
  const [totalCompleted, setTotalCompleted] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      apiFetch('/api/educational-games/catalog').catch(() => ({ games: [] })),
      apiFetch('/api/educational-games/history').catch(() => ({ sessions: [], stats: [], totalSessionsCompleted: 0 }))
    ])
      .then(([catRes, histRes]) => {
        if (!isMounted) return;
        setGames(catRes?.games || []);
        setRecentStats(histRes?.stats || []);
        setTotalCompleted(histRes?.totalSessionsCompleted || 0);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [apiFetch, studentId]);

  // Keep topic updated if activeTopic changes
  useEffect(() => {
    if (activeTopic) {
      setGameTopic(activeTopic);
    }
  }, [activeTopic]);

  const categories = [
    { id: 'all', label: 'All 7 Games' },
    { id: 'vocabulary', label: 'Vocabulary & Spelling' },
    { id: 'concept', label: 'Concept & MCQ' },
    { id: 'recall', label: 'Recall & Matching' },
    { id: 'logic', label: 'Logic & True/False' },
    { id: 'critical_thinking', label: 'Error Analysis' }
  ];

  const filteredGames = games.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || g.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <section
      className="glass-card"
      style={{
        marginBottom: 26,
        padding: 26,
        borderRadius: 26,
        background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFBF7 55%, #FFF3E8 100%)',
        border: '1.5px solid rgba(255, 106, 0, 0.26)',
        boxShadow: '0 16px 40px -10px rgba(255, 106, 0, 0.12), inset 0 1px 0 #FFFFFF',
        position: 'relative'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 18,
              background: 'linear-gradient(135deg, #FF7A1A 0%, #FF6A00 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontSize: '1.75rem',
              boxShadow: '0 8px 20px rgba(255, 106, 0, 0.32)',
              flexShrink: 0
            }}
          >
            🎮
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: 999,
                  background: '#FF6A00',
                  color: '#FFFFFF',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em'
                }}
              >
                7+ CORE + 3D &amp; SPEAKING ARENAS
              </span>
              <span style={{ fontSize: '0.78rem', color: '#E85D00', fontWeight: 800 }}>
                Unified All-Games Hub
              </span>
            </div>
            <h2 style={{ fontSize: '1.38rem', fontWeight: 900, color: '#202124', letterSpacing: '-0.02em', margin: '0 0 4px 0' }}>
              All Educational Games Hub
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#6B7280', margin: 0 }}>
              Play, learn, and master academic concepts across all subjects.
            </p>
          </div>
        </div>

        {/* Global Topic Picker & Session Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {totalCompleted > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 999,
                background: '#FFF3E8',
                border: '1.5px solid rgba(255, 106, 0, 0.28)',
                color: '#E85D00',
                fontSize: '0.82rem',
                fontWeight: 800
              }}
            >
              <Trophy size={16} color="#FF6A00" />
              <span>{totalCompleted} Session{totalCompleted > 1 ? 's' : ''} Completed</span>
            </div>
          )}

          <div
            style={{
              padding: '7px 16px',
              borderRadius: 999,
              background: '#FFFFFF',
              border: '1.5px solid rgba(255, 106, 0, 0.26)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(255, 106, 0, 0.06)'
            }}
          >
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#FF6A00', letterSpacing: '0.04em' }}>TOPIC:</span>
            <input
              type="text"
              value={gameTopic}
              onChange={(e) => setGameTopic(e.target.value)}
              placeholder="e.g. Photosynthesis"
              style={{
                border: 'none',
                background: 'transparent',
                fontWeight: 800,
                fontSize: '0.88rem',
                color: '#202124',
                outline: 'none',
                maxWidth: 170
              }}
            />
          </div>
        </div>
      </div>

      {/* Unified Hub Category Tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        {[
          { id: 'all', label: '🌟 All Games' },
          { id: '3d_worlds', label: '🧊 3D Worlds' },
          { id: 'battle_action', label: '⚔️ Battle & Action' },
          { id: 'space', label: '🚀 Space Games' },
          { id: 'language_speaking', label: '🗣️ Language & Speaking' },
          { id: 'subject_brain', label: '🧠 Subject & Brain (7)' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setHubTab(tab.id as typeof hubTab)}
            style={{
              padding: '8px 14px',
              borderRadius: 999,
              border: hubTab === tab.id ? '1.5px solid #FF6A00' : '1px solid #E2E8F0',
              background: hubTab === tab.id ? '#FFF3E8' : '#FFFFFF',
              color: hubTab === tab.id ? '#C2410C' : '#334155',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Special 3D, Space & Speaking Arenas Grid */}
      {(hubTab === 'all' || hubTab === 'battle_action' || hubTab === 'space' || hubTab === 'language_speaking' || hubTab === '3d_worlds') && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: 14,
            marginBottom: 20
          }}
        >
          {(hubTab === 'all' || hubTab === 'space') && (
            <div
              style={{
                padding: 18,
                borderRadius: 20,
                background: 'linear-gradient(135deg, #090D24, #1E1B4B)',
                border: '1.5px solid #818CF8',
                color: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 12
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#A5B4FC', marginBottom: 4 }}>SPACE 3D SHOOTER</div>
                <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: 800 }}>🚀 Space Answer Shooter 3D</h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#CBD5E1', lineHeight: 1.45 }}>
                  Pilot your starfighter through 3D asteroid waves and blast the asteroid carrying the correct answer.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openGamesHub(gameTopic || 'Photosynthesis', 'Science', 'space_shooter')}
                style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: 'none',
                  background: '#6366F1',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <Play size={15} fill="#FFFFFF" /> Launch Space Shooter
              </button>
            </div>
          )}

          {(hubTab === 'all' || hubTab === 'battle_action') && (
            <div
              style={{
                padding: 18,
                borderRadius: 20,
                background: 'linear-gradient(135deg, #1F122B, #4C1D95)',
                border: '1.5px solid #C084FC',
                color: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 12
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#E9D5FF', marginBottom: 4 }}>3D BATTLE ARENA</div>
                <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: 800 }}>🎯 Answer Battle Arena 3D</h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#E2E8F0', lineHeight: 1.45 }}>
                  Aim and fire energy bolts at 3D floating answer targets in a fast-paced curriculum arena.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openGamesHub(gameTopic || 'Photosynthesis', 'Science', 'answer_battle')}
                style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: 'none',
                  background: '#9333EA',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <Play size={15} fill="#FFFFFF" /> Launch Answer Battle
              </button>
            </div>
          )}

          {(hubTab === 'all' || hubTab === '3d_worlds') && (
            <div
              style={{
                padding: 18,
                borderRadius: 20,
                background: 'linear-gradient(135deg, #064E3B, #0F766E)',
                border: '1.5px solid #34D399',
                color: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 12
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#A7F3D0', marginBottom: 4 }}>3D ENDLESS RUNNER</div>
                <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: 800 }}>🏃 3D Learning Runner</h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#D1FAE5', lineHeight: 1.45 }}>
                  Dash across 3D lanes and steer through the gate showing the correct answer on your topic.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openGamesHub(gameTopic || 'Photosynthesis', 'Science', 'learning_runner')}
                style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: 'none',
                  background: '#10B981',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <Play size={15} fill="#FFFFFF" /> Launch 3D Runner
              </button>
            </div>
          )}

          {(hubTab === 'all' || hubTab === 'language_speaking') && (
            <div
              style={{
                padding: 18,
                borderRadius: 20,
                background: 'linear-gradient(135deg, #7C2D12, #EA580C)',
                border: '1.5px solid #FDBA74',
                color: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 12
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#FFEDD5', marginBottom: 4 }}>VOICE &amp; PRONUNCIATION</div>
                <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: 800 }}>🗣️ Speaking &amp; Pronunciation Arena</h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#FFEDD5', lineHeight: 1.45 }}>
                  Listen to native pronunciation and speak aloud in English, Telugu, Hindi, Japanese, French &amp; German.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSpeakingOpen(true)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: 'none',
                  background: '#FFFFFF',
                  color: '#C2410C',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <Play size={15} fill="#C2410C" /> Start Speaking Practice
              </button>
            </div>
          )}
        </div>
      )}

      {/* WAR OF WORDS — STUDY RUSH 3D (SHADOW WARRIOR: THE LANGUAGE BATTLE) */}
      {(hubTab === 'all' || hubTab === 'battle_action' || hubTab === 'language_speaking') && (
      <div
        style={{
          margin: '0 0 18px 0',
          padding: 24,
          borderRadius: 24,
          background: 'linear-gradient(135deg, #050814 0%, #0B1D3A 52%, #083344 100%)',
          border: '2px solid #22D3EE',
          boxShadow: '0 16px 40px rgba(34, 211, 238, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20
        }}
      >
        <div style={{ flex: '1 1 360px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
            <span
              style={{
                background: '#0891B2',
                color: '#FFFFFF',
                padding: '4px 12px',
                borderRadius: 999,
                fontSize: '0.74rem',
                fontWeight: 900,
                letterSpacing: '0.05em'
              }}
            >
              2.5D ENGLISH ACTION-ADVENTURE
            </span>
            <span style={{ color: '#67E8F9', fontSize: '0.82rem', fontWeight: 800 }}>
              108+ Questions • 9 Categories • Moonlight Valley
            </span>
          </div>
          <h3 style={{ margin: '0 0 6px 0', color: '#FFFFFF', fontSize: '1.36rem', fontWeight: 900 }}>
            WAR OF WORDS — SHADOW WARRIOR
          </h3>
          <p style={{ margin: 0, color: '#CBD5E1', fontSize: '0.88rem', lineHeight: 1.5 }}>
            Travel through Moonlight Valley as an arcane Shadow Warrior! Approach Answer Sentinels, cast cyan magic strikes, master vocabulary, synonyms, grammar & idioms with audio pronunciation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setWarOfWordsOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 24px',
            borderRadius: 16,
            background: 'linear-gradient(135deg, #06B6D4 0%, #2563EB 100%)',
            border: 'none',
            color: '#FFFFFF',
            fontWeight: 900,
            fontSize: '0.96rem',
            cursor: 'pointer',
            boxShadow: '0 10px 26px rgba(6, 182, 212, 0.38)'
          }}
        >
          <Play size={18} fill="#FFFFFF" />
          Launch War of Words
        </button>
      </div>

      {/* STUDY RUSH 3D — SURVIVAL NIGHT (3D VOXEL ADVENTURE BANNER) */}
      {(hubTab === 'all' || hubTab === '3d_worlds') && (
      <div
        style={{
          margin: '0 0 18px 0',
          padding: 24,
          borderRadius: 24,
          background: 'linear-gradient(135deg, #090D1F 0%, #1E1B4B 52%, #7C2D12 100%)',
          border: '2px solid #FF6A00',
          boxShadow: '0 16px 40px rgba(255, 106, 0, 0.24)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20
        }}
      >
        <div style={{ flex: '1 1 360px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
            <span
              style={{
                background: '#FF6A00',
                color: '#FFFFFF',
                padding: '4px 12px',
                borderRadius: 999,
                fontSize: '0.74rem',
                fontWeight: 900,
                letterSpacing: '0.05em'
              }}
            >
              3D VOXEL SURVIVAL ADVENTURE
            </span>
            <span style={{ color: '#FDBA74', fontSize: '0.82rem', fontWeight: 800 }}>
              Day/Night Cycle • Open World • Three.js Engine
            </span>
          </div>
          <h3 style={{ margin: '0 0 6px 0', color: '#FFFFFF', fontSize: '1.36rem', fontWeight: 900 }}>
            STUDY RUSH 3D — SURVIVAL NIGHT
          </h3>
          <p style={{ margin: 0, color: '#CBD5E1', fontSize: '0.88rem', lineHeight: 1.5 }}>
            Explore Survival Village, Dark Forest & Crystal Cave by day; defend against night waves by casting arcane knowledge bolts at 3D Answer Shrines across 8 academic subjects!
          </p>
        </div>

        <button
          type="button"
          onClick={() => setStudyRushOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 24px',
            borderRadius: 16,
            background: 'linear-gradient(135deg, #FF7A1A 0%, #FF5500 100%)',
            border: 'none',
            color: '#FFFFFF',
            fontWeight: 900,
            fontSize: '0.96rem',
            cursor: 'pointer',
            boxShadow: '0 10px 26px rgba(255, 106, 0, 0.4)'
          }}
        >
          <Play size={18} fill="#FFFFFF" />
          Launch Study Rush 3D
        </button>
      </div>

      {/* KATANA: SHADOW WARRIORS — FLAGSHIP 2.5D ACTION-ADVENTURE BANNER */}
      <div
        style={{
          margin: '0 0 24px 0',
          padding: 24,
          borderRadius: 24,
          background: 'linear-gradient(135deg, #0A1128 0%, #1C2541 50%, #0B525B 100%)',
          border: '2px solid #FF6A00',
          boxShadow: '0 16px 40px rgba(255, 106, 0, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20
        }}
      >
        <div style={{ flex: '1 1 360px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span
              style={{
                background: '#FF6A00',
                color: '#FFFFFF',
                padding: '4px 12px',
                borderRadius: 999,
                fontSize: '0.74rem',
                fontWeight: 900,
                letterSpacing: '0.05em'
              }}
            >
              FLAGSHIP 2.5D ADVENTURE
            </span>
            <span style={{ color: '#48CAE4', fontSize: '0.82rem', fontWeight: 800 }}>
              Moonlit Bamboo Forest • 60 FPS Engine
            </span>
          </div>

          <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#FFFFFF', margin: '0 0 6px 0', letterSpacing: '-0.01em' }}>
            KATANA: SHADOW WARRIORS — THE WISDOM BATTLE
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#CBD5E1', margin: 0, lineHeight: 1.5 }}>
            Master your academic curriculum in real-time samurai combat. Unleash wisdom strikes, charge your spirit katana gauge, and defeat shadow warlords.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setKatanaOpen(true)}
          style={{
            padding: '14px 28px',
            borderRadius: 16,
            background: 'linear-gradient(135deg, #FF6A00 0%, #EA580C 100%)',
            border: 'none',
            color: '#FFFFFF',
            fontSize: '0.96rem',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(255, 106, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            transition: 'transform 0.15s ease'
          }}
        >
          <Play size={18} fill="#FFFFFF" />
          <span>Enter Katana Battle</span>
        </button>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 16px',
            borderRadius: 999,
            background: '#FFFFFF',
            border: '1.5px solid rgba(255, 106, 0, 0.2)',
            flex: '1 1 220px'
          }}
        >
          <Search size={16} color="#FF6A00" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search educational games..."
            style={{ border: 'none', outline: 'none', fontSize: '0.86rem', width: '100%', color: '#202124', background: 'transparent' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategoryFilter(c.id)}
              className={`filter-pill ${categoryFilter === c.id ? 'active' : ''}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* 7 Game Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: 16
        }}
      >
        {filteredGames.map((game) => {
          const subjects = game.compatibleSubjects || game.compatible_subjects || ['Science', 'Mathematics'];
          const difficulties = game.supportedDifficulties || game.supported_difficulties || ['easy', 'medium', 'hard'];

          return (
            <div
              key={game.slug}
              className="glass-card glass-card-interactive"
              onClick={() => setActiveModalGame({ slug: game.slug, name: game.name })}
              style={{
                borderRadius: 20,
                background: '#FFFFFF',
                border: '1.5px solid rgba(255, 106, 0, 0.18)',
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: '#FFF3E8',
                      border: '1px solid rgba(255, 106, 0, 0.22)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.6rem'
                    }}
                  >
                    {game.icon}
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {difficulties.map((d) => (
                      <span
                        key={d}
                        style={{
                          padding: '3px 8px',
                          borderRadius: 999,
                          background: '#FFF3E8',
                          border: '1px solid rgba(255, 106, 0, 0.18)',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          color: '#E85D00',
                          textTransform: 'capitalize'
                        }}
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                <h3 style={{ fontSize: '1.08rem', fontWeight: 900, color: '#202124', margin: '0 0 6px 0' }}>
                  {game.name}
                </h3>
                <p style={{ fontSize: '0.83rem', color: '#6B7280', margin: '0 0 14px 0', lineHeight: 1.48 }}>
                  {game.description}
                </p>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                  {subjects.slice(0, 3).map((sub, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '3px 10px',
                        borderRadius: 999,
                        background: 'rgba(255, 106, 0, 0.08)',
                        border: '1px solid rgba(255, 106, 0, 0.2)',
                        color: '#E85D00',
                        fontSize: '0.72rem',
                        fontWeight: 700
                      }}
                    >
                      {sub}
                    </span>
                  ))}
                  {subjects.length > 3 && (
                    <span style={{ fontSize: '0.72rem', color: '#6B7280', alignSelf: 'center', fontWeight: 600 }}>
                      +{subjects.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveModalGame({ slug: game.slug, name: game.name });
                }}
                className="btn-orange"
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  fontSize: '0.88rem'
                }}
              >
                <Play size={15} fill="#FFFFFF" />
                <span>Play Game</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Unified Interactive Game Player Modal */}
      {activeModalGame && (
        <EducationalGamePlayerModal
          isOpen={Boolean(activeModalGame)}
          onClose={() => setActiveModalGame(null)}
          gameSlug={activeModalGame.slug}
          gameName={activeModalGame.name}
          initialTopic={gameTopic || 'Photosynthesis'}
        />
      )}

      {/* Flagship KATANA 2.5D Action-Adventure Game Modal */}
      <KatanaGameModal
        isOpen={katanaOpen}
        onClose={() => setKatanaOpen(false)}
        topic={gameTopic || 'Photosynthesis'}
      />

      {/* STUDY RUSH 3D — SURVIVAL NIGHT Modal */}
      <StudyRush3DModal
        isOpen={studyRushOpen}
        onClose={() => setStudyRushOpen(false)}
        initialTopic={gameTopic || 'Photosynthesis'}
      />

      )}

      {/* WAR OF WORDS — STUDY RUSH 3D Modal */}
      <WarOfWordsModal
        isOpen={warOfWordsOpen}
        onClose={() => setWarOfWordsOpen(false)}
      />

      {/* Speaking & Pronunciation Arena Modal */}
      <SpeakingPracticeGameModal
        isOpen={speakingOpen}
        onClose={() => setSpeakingOpen(false)}
        initialTopic={gameTopic || 'Conversation'}
      />
    </section>
  );
};
