import React, { useState, useEffect } from 'react';
import { Search, Play, Trophy } from 'lucide-react';
import { useLearning } from '../context/LearningContext';
import { EducationalGamePlayerModal } from './EducationalGamePlayerModal';

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
  const { apiFetch, activeTopic, studentId } = useLearning();

  const [games, setGames] = useState<GameItem[]>([]);
  const [, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [gameTopic, setGameTopic] = useState<string>(activeTopic || 'Photosynthesis');

  // Modal player state
  const [activeModalGame, setActiveModalGame] = useState<{ slug: string; name: string } | null>(null);

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
                7 INTERACTIVE GAMES
              </span>
              <span style={{ fontSize: '0.78rem', color: '#E85D00', fontWeight: 800 }}>
                Universal Shared Game Engine
              </span>
            </div>
            <h2 style={{ fontSize: '1.38rem', fontWeight: 900, color: '#202124', letterSpacing: '-0.02em', margin: '0 0 4px 0' }}>
              Educational Games Library
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

      {/* Search & Category Filter Pills */}
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
    </section>
  );
};
