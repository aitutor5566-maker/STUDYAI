import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Box,
  Rocket,
  Trash2,
  ExternalLink,
  X,
  Sparkles
} from 'lucide-react';
import { TopBrandBar } from '../components/GlassNav';
import { FuturisticIcon, FuturisticIconName } from '../components/FuturisticIcons';
import { useLearning } from '../context/LearningContext';
import { LanguageLearningSection } from '../components/LanguageLearningSection';
import { EducationalGamesSection } from '../components/EducationalGamesSection';

export const LibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    apiFetch,
    open3DLab,
    openVideoStudio,
    openImageStudio,
    openGamesHub,
    openQuizModal,
    openExamModal,
    startAudioLesson,
    activeTopic,
    refreshTick,
    triggerRefresh
  } = useLearning();

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [counts, setCounts] = useState<any>({ all: 0, note: 0, image: 0, video: 0, model3d: 0, audio: 0, quiz: 0, game: 0 });
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [inspectedResource, setInspectedResource] = useState<any | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (typeFilter !== 'all') params.set('type', typeFilter);
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    apiFetch(`/api/library?${params.toString()}`)
      .then((res) => {
        setCounts(res.counts || {});
        setItems(res.items || []);
      })
      .finally(() => setLoading(false));
  }, [typeFilter, searchQuery, refreshTick, apiFetch]);

  const handleOpenResource = (item: any) => {
    setInspectedResource(item);
  };

  const handleLaunchWorkspace = (item: any) => {
    setInspectedResource(null);
    if (item.resource_type === 'note') {
      navigate(`/notes?id=${item.content?.noteId || ''}`);
    } else if (item.resource_type === 'model3d') {
      open3DLab(item.topic, item.content?.modelId);
    } else if (item.resource_type === 'video') {
      openVideoStudio(item.topic);
    } else if (item.resource_type === 'image') {
      openImageStudio(item.topic);
    } else if (item.resource_type === 'audio') {
      startAudioLesson({ topic: item.topic, text: item.content?.text, voice: item.content?.voice, speed: item.content?.speed });
    } else if (item.resource_type === 'quiz') {
      openQuizModal(item.topic, item.subject);
    } else if (item.resource_type === 'game') {
      openGamesHub(item.topic, item.subject, item.content?.gameType);
    } else {
      navigate(`/tutor?topic=${encodeURIComponent(item.topic)}`);
    }
  };

  const handleDeleteResource = async (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${title}" from your Library?`)) return;
    await apiFetch(`/api/library/${id}`, { method: 'DELETE' });
    if (inspectedResource?.id === id) setInspectedResource(null);
    triggerRefresh();
  };

  const filterTabs = [
    { id: 'all', label: 'All' },
    { id: 'examinations', label: 'Weekly Exams & Mock Tests' },
    { id: 'note', label: 'Notes' },
    { id: 'image', label: 'Images' },
    { id: 'video', label: 'Videos' },
    { id: 'model3d', label: '3D Models' },
    { id: 'audio', label: 'Audio' },
    { id: 'quiz', label: 'Quizzes' },
    { id: 'game', label: 'Games' }
  ];

  const categoryCards: Array<{
    id: string;
    label: string;
    count: number;
    iconName: FuturisticIconName;
  }> = [
    { id: 'examinations', label: 'Weekly Mock Exams', count: 2, iconName: 'quiz' },
    { id: 'note', label: 'Notes', count: counts.note || 0, iconName: 'notes' },
    { id: 'image', label: 'Images', count: counts.image || 0, iconName: 'image' },
    { id: 'video', label: 'Videos', count: counts.video || 0, iconName: 'video' },
    { id: 'model3d', label: '3D Models', count: counts.model3d || 0, iconName: 'lab3d' },
    { id: 'game', label: 'Games', count: counts.game || 0, iconName: 'games' },
    { id: 'quiz', label: 'Quizzes', count: counts.quiz || 0, iconName: 'quiz' }
  ];

  const getVisualGradient = (type: string) => {
    if (type === 'model3d') return 'linear-gradient(135deg, #FF6A00 0%, #E85D00 100%)';
    if (type === 'video') return 'linear-gradient(135deg, #FF7A1A 0%, #EA580C 100%)';
    if (type === 'note') return 'linear-gradient(135deg, #FF8533 0%, #FF6A00 100%)';
    if (type === 'image') return 'linear-gradient(135deg, #FF6A00 0%, #C2410C 100%)';
    return 'linear-gradient(135deg, #FF7A1A 0%, #E85D00 100%)';
  };

  return (
    <div className="studyai-container">
      <TopBrandBar showBack />

      {/* Title */}
      <section style={{ marginBottom: 20 }}>
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
            fontSize: '0.72rem',
            fontWeight: 800,
            marginBottom: 8
          }}
        >
          <Sparkles size={13} color="#FF6A00" />
          <span>UNIFIED KNOWLEDGE &amp; STUDIO REPOSITORY</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#202124', letterSpacing: '-0.02em' }}>Library</h1>
        <p style={{ fontSize: '0.92rem', color: '#6B7280', marginTop: 2 }}>
          All your saved learning materials, multilingual speaking labs, examinations, and interactive games in one place.
        </p>
      </section>

      {/* Search & Filter Pills */}
      <section style={{ marginBottom: 22 }}>
        <div className="glass-input-wrap" style={{ marginBottom: 14 }}>
          <Search size={19} color="#FF6A00" />
          <input
            className="glass-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search library resources, notes, 3D models, quizzes..."
            aria-label="Search saved library resources"
          />
        </div>

        <div className="pill-row">
          {filterTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                if (t.id === 'examinations') {
                  openExamModal(activeTopic, 'Science');
                } else {
                  setTypeFilter(t.id);
                }
              }}
              className={`filter-pill ${typeFilter === t.id ? 'active' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {/* MANDATORY PROMINENT SECTION: SPEAKING SKILLS & LANGUAGE LEARNING */}
      <LanguageLearningSection />

      {/* PROMINENT MANDATORY FEATURE: WEEKLY EXAMINATIONS & MOCK TESTS */}
      <section
        className="glass-card"
        style={{
          marginBottom: 24,
          padding: 24,
          borderRadius: 24,
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF8F2 55%, #FFF3E8 100%)',
          border: '1.5px solid rgba(255, 106, 0, 0.3)',
          boxShadow: '0 14px 36px -8px rgba(255, 106, 0, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              background: 'linear-gradient(135deg, #FF7A1A 0%, #FF6A00 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 8px 20px rgba(255, 106, 0, 0.32)'
            }}
          >
            <FuturisticIcon name="quiz" size={34} />
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
                EXAMINATION CENTER
              </span>
              <span style={{ fontSize: '0.76rem', color: '#E85D00', fontWeight: 700 }}>
                A. Weekly Mock Exams • B. Topic-Based 40-Mark Tests
              </span>
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#202124', margin: '0 0 4px 0' }}>
              WEEKLY EXAMINATIONS &amp; MOCK TESTS
            </h2>
            <p style={{ fontSize: '0.86rem', color: '#6B7280', margin: 0 }}>
              Attempt official scheduled weekly mock exams or generate customized 40-mark practice tests across 3 configurations.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => openExamModal(activeTopic, 'Science')}
          className="btn-orange"
          style={{ padding: '12px 24px', fontSize: '0.92rem' }}
        >
          Open Examination Center →
        </button>
      </section>

      {/* EDUCATIONAL GAMES LIBRARY — 7 CORE GAMES MODULE */}
      <EducationalGamesSection />

      {/* Category Count Cards */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))',
          gap: 14,
          marginBottom: 26
        }}
      >
        {categoryCards.map((c) => {
          const isSelected = typeFilter === c.id;
          return (
            <div
              key={c.id}
              onClick={() => {
                if (c.id === 'examinations') {
                  openExamModal(activeTopic, 'Science');
                } else {
                  setTypeFilter(isSelected ? 'all' : c.id);
                }
              }}
              className="glass-card glass-card-interactive"
              style={{
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: isSelected ? '#FFF3E8' : '#FFFFFF',
                border: isSelected ? '2px solid #FF6A00' : '1.5px solid rgba(255, 106, 0, 0.16)'
              }}
            >
              <div style={{ flexShrink: 0 }}>
                <FuturisticIcon name={c.iconName} size={42} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#202124' }}>{c.label}</div>
                <div style={{ fontSize: '0.76rem', color: isSelected ? '#E85D00' : '#6B7280', fontWeight: 700 }}>{c.count} items</div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Recently Added Persisted Resources */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontSize: '1.16rem', fontWeight: 800, color: '#202124' }}>
            Recently Added ({items.length})
          </h2>
          {typeFilter !== 'all' && (
            <button type="button" onClick={() => setTypeFilter('all')} style={{ border: 'none', background: 'transparent', color: '#FF6A00', fontWeight: 800, fontSize: '0.84rem', cursor: 'pointer' }}>
              Show All →
            </button>
          )}
        </div>

        {loading ? (
          <div className="glass-card" style={{ padding: 28, textAlign: 'center', color: '#6B7280' }}>
            Loading saved resources...
          </div>
        ) : items.length === 0 ? (
          <div className="glass-card" style={{ padding: 28, textAlign: 'center', color: '#6B7280' }}>
            No saved resources found for this filter. Save notes, 3D models, diagrams, or videos to view them here!
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpenResource(item)}
                className="glass-card glass-card-interactive"
                style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#FFFFFF' }}
              >
                <div>
                  {/* Visual Preview Banner */}
                  <div
                    style={{
                      height: 118,
                      background: getVisualGradient(item.resource_type),
                      color: '#FFFFFF',
                      padding: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.24)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>
                        {item.resource_type}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteResource(item.id, item.title, e)}
                        aria-label={`Delete ${item.title}`}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          border: 'none',
                          background: 'rgba(255,255,255,0.22)',
                          color: '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '0.96rem', color: '#FFFFFF' }}>{item.title}</div>
                  </div>

                  <div style={{ padding: 16 }}>
                    <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#FF6A00', marginBottom: 6 }}>
                      {item.subject} • {item.topic}
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#6B7280', lineHeight: 1.5 }}>
                      {item.summary}
                    </p>
                  </div>
                </div>

                <div style={{ padding: '0 16px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: '#6B7280', fontWeight: 600 }}>Saved in Library</span>
                  <span style={{ fontSize: '0.8rem', color: '#FF6A00', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                    Open <ExternalLink size={13} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Persisted Resource Inspector Modal */}
      {inspectedResource && (
        <div className="glass-modal-overlay" role="dialog" aria-modal="true" aria-label="Saved Resource Viewer">
          <div className="glass-modal-content" style={{ maxWidth: 680 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <span style={{ padding: '4px 12px', borderRadius: 999, background: '#FFF3E8', color: '#E85D00', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
                  Saved {inspectedResource.resource_type} • {inspectedResource.subject}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#202124', marginTop: 6 }}>{inspectedResource.title}</h3>
              </div>
              <button type="button" onClick={() => setInspectedResource(null)} className="btn-glass" style={{ padding: '6px 10px' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: 18, borderRadius: 18, background: '#FFFBF7', border: '1.5px solid rgba(255,106,0,0.22)', marginBottom: 18 }}>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#202124', marginBottom: 8 }}>Persisted Summary:</div>
              <p style={{ fontSize: '0.88rem', color: '#6B7280', lineHeight: 1.55, marginBottom: 12 }}>{inspectedResource.summary}</p>

              {inspectedResource.media_url && inspectedResource.resource_type === 'image' && (
                <img
                  src={inspectedResource.media_url}
                  alt={inspectedResource.title}
                  style={{ width: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 12 }}
                />
              )}

              {inspectedResource.content?.markdown && (
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.84rem', background: '#FFFFFF', padding: 14, borderRadius: 14, border: '1px solid rgba(255,106,0,0.16)', color: '#202124' }}>
                  {inspectedResource.content.markdown}
                </pre>
              )}

              {inspectedResource.content?.scenes && (
                <div style={{ display: 'grid', gap: 8 }}>
                  {inspectedResource.content.scenes.map((sc: any, idx: number) => (
                    <div key={idx} style={{ padding: 10, borderRadius: 12, background: '#FFFFFF', border: '1px solid rgba(255,106,0,0.16)', fontSize: '0.82rem', color: '#202124' }}>
                      <strong style={{ color: '#FF6A00' }}>Scene {idx + 1} — {sc.title}:</strong> {sc.narration}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" onClick={() => handleLaunchWorkspace(inspectedResource)} className="btn-orange">
                Open in Interactive Studio →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Space Battle & 3D Lab Feature Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
        <section className="hero-glass-banner" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #FF7A1A 0%, #FF6A00 100%)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 20px rgba(255, 106, 0, 0.3)'
                }}
              >
                <Rocket size={26} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#202124' }}>STUDYAI Space Battle</h3>
                <p style={{ fontSize: '0.86rem', color: '#6B7280', marginTop: 2 }}>
                  Vertical 3D arcade space shooter — shoot enemy fleets carrying correct answers &amp; dodge attacks
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openGamesHub(activeTopic || 'Human Body', 'Biology', 'space_shooter')}
              className="btn-orange"
            >
              <span>Play Space Battle 🚀</span>
            </button>
          </div>
        </section>

        <section className="hero-glass-banner" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #FF8533 0%, #FF6A00 100%)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 20px rgba(255,106,0,0.28)'
                }}
              >
                <Box size={26} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#202124' }}>3D Lab</h3>
                <p style={{ fontSize: '0.86rem', color: '#6B7280', marginTop: 2 }}>
                  Explore interactive 3D models — Human Heart, Solar System, DNA Helix &amp; Chloroplasts
                </p>
              </div>
            </div>
            <button type="button" onClick={() => open3DLab('Human Heart & Cardiac Cycle', 'human_heart')} className="btn-orange">
              <span>Explore 3D Lab →</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
