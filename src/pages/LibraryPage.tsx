import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  FileText,
  Image as ImageIcon,
  Video,
  Box,
  Gamepad2,
  Rocket,
  HelpCircle,
  Volume2,
  Trash2,
  ExternalLink,
  X
} from 'lucide-react';
import { TopBrandBar } from '../components/GlassNav';
import { FuturisticIcon, FuturisticIconName } from '../components/FuturisticIcons';
import { useLearning } from '../context/LearningContext';

export const LibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    apiFetch,
    open3DLab,
    openVideoStudio,
    openImageStudio,
    openGamesHub,
    openQuizModal,
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
    { id: 'note', label: 'Notes', count: counts.note || 0, iconName: 'notes' },
    { id: 'image', label: 'Images', count: counts.image || 0, iconName: 'image' },
    { id: 'video', label: 'Videos', count: counts.video || 0, iconName: 'video' },
    { id: 'model3d', label: '3D Models', count: counts.model3d || 0, iconName: 'lab3d' },
    { id: 'game', label: 'Games', count: counts.game || 0, iconName: 'games' },
    { id: 'quiz', label: 'Quizzes', count: counts.quiz || 0, iconName: 'quiz' }
  ];

  const getVisualGradient = (type: string) => {
    if (type === 'model3d') return 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)';
    if (type === 'video') return 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)';
    if (type === 'note') return 'linear-gradient(135deg, #064E3B 0%, #047857 100%)';
    if (type === 'image') return 'linear-gradient(135deg, #7C2D12 0%, #EA580C 100%)';
    return 'linear-gradient(135deg, #374151 0%, #1F2937 100%)';
  };

  return (
    <div className="studyai-container">
      <TopBrandBar showBack />

      {/* Title */}
      <section style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#202124' }}>Library</h1>
        <p style={{ fontSize: '0.88rem', color: '#6B7280' }}>All your saved learning materials in one place</p>
      </section>

      {/* Search & Filter Pills */}
      <section style={{ marginBottom: 20 }}>
        <div className="glass-input-wrap" style={{ marginBottom: 12 }}>
          <Search size={18} color="#FF6A00" />
          <input
            className="glass-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search library..."
            aria-label="Search saved library resources"
          />
        </div>

        <div className="pill-row">
          {filterTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTypeFilter(t.id)}
              className={`filter-pill ${typeFilter === t.id ? 'active' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {/* 6 Category Count Cards (matching reference UI grid) */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 12,
          marginBottom: 24
        }}
      >
        {categoryCards.map((c) => {
          const isSelected = typeFilter === c.id;
          return (
            <div
              key={c.id}
              onClick={() => setTypeFilter(isSelected ? 'all' : c.id)}
              className="glass-card glass-card-interactive"
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                border: isSelected ? '2px solid #FF6A00' : undefined
              }}
            >
              <div style={{ flexShrink: 0 }}>
                <FuturisticIcon name={c.iconName} size={42} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#202124' }}>{c.label}</div>
                <div style={{ fontSize: '0.76rem', color: '#6B7280', fontWeight: 600 }}>{c.count} items</div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Recently Added Persisted Resources */}
      <section style={{ marginBottom: 26 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontSize: '1.12rem', fontWeight: 800, color: '#202124' }}>
            Recently Added ({items.length})
          </h2>
          {typeFilter !== 'all' && (
            <button type="button" onClick={() => setTypeFilter('all')} style={{ border: 'none', background: 'transparent', color: '#FF6A00', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
              Show All →
            </button>
          )}
        </div>

        {loading ? (
          <div className="glass-card" style={{ padding: 28, textAlign: 'center', color: '#6B7280' }}>
            Loading saved resources from SQLite...
          </div>
        ) : items.length === 0 ? (
          <div className="glass-card" style={{ padding: 28, textAlign: 'center', color: '#6B7280' }}>
            No saved resources found for this filter. Save notes, 3D models, diagrams, or videos to view them here!
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpenResource(item)}
                className="glass-card glass-card-interactive"
                style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
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
                      <span style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.2)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>
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
                          background: 'rgba(0,0,0,0.35)',
                          color: '#FCA5A5',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '0.96rem', color: '#F8FAFC' }}>{item.title}</div>
                  </div>

                  <div style={{ padding: 14 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FF6A00', marginBottom: 4 }}>
                      {item.subject} • {item.topic}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#6B7280', lineHeight: 1.45 }}>
                      {item.summary}
                    </p>
                  </div>
                </div>

                <div style={{ padding: '0 14px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 600 }}>Saved in Library</span>
                  <span style={{ fontSize: '0.78rem', color: '#FF6A00', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    Open <ExternalLink size={13} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Persisted Resource Inspector Modal (opens exact saved content without regenerating!) */}
      {inspectedResource && (
        <div className="glass-modal-overlay" role="dialog" aria-modal="true" aria-label="Saved Resource Viewer">
          <div className="glass-modal-content" style={{ maxWidth: 680 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <span style={{ padding: '3px 10px', borderRadius: 999, background: '#FFF3E8', color: '#E85D00', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  Saved {inspectedResource.resource_type} • {inspectedResource.subject}
                </span>
                <h3 style={{ fontSize: '1.22rem', fontWeight: 800, marginTop: 6 }}>{inspectedResource.title}</h3>
              </div>
              <button type="button" onClick={() => setInspectedResource(null)} className="btn-glass" style={{ padding: '6px 10px' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: 16, borderRadius: 16, background: '#FFFDFB', border: '1px solid rgba(255,106,0,0.22)', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 8 }}>Persisted Summary:</div>
              <p style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.55, marginBottom: 12 }}>{inspectedResource.summary}</p>

              {inspectedResource.media_url && inspectedResource.resource_type === 'image' && (
                <img
                  src={inspectedResource.media_url}
                  alt={inspectedResource.title}
                  style={{ width: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 12 }}
                />
              )}

              {inspectedResource.content?.markdown && (
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.84rem', background: '#FFFFFF', padding: 12, borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)' }}>
                  {inspectedResource.content.markdown}
                </pre>
              )}

              {inspectedResource.content?.scenes && (
                <div style={{ display: 'grid', gap: 8 }}>
                  {inspectedResource.content.scenes.map((sc: any, idx: number) => (
                    <div key={idx} style={{ padding: 10, borderRadius: 10, background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)', fontSize: '0.82rem' }}>
                      <strong>Scene {idx + 1} — {sc.title}:</strong> {sc.narration}
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        <section className="hero-glass-banner" style={{ padding: 22, border: '1.5px solid rgba(56, 189, 248, 0.45)', background: 'linear-gradient(135deg, rgba(8, 18, 44, 0.08) 0%, rgba(56, 189, 248, 0.08) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 20px rgba(56, 189, 248, 0.35)'
                }}
              >
                <Rocket size={26} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#202124' }}>STUDYAI Space Battle</h3>
                <p style={{ fontSize: '0.86rem', color: '#6B7280' }}>
                  Vertical 3D arcade space shooter — shoot enemy fleets carrying correct answers &amp; dodge attacks
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openGamesHub(activeTopic || 'Human Body', 'Biology', 'space_shooter')}
              className="btn-orange"
              style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', boxShadow: '0 6px 18px rgba(3, 105, 161, 0.35)' }}
            >
              <span>Play Space Battle 🚀</span>
            </button>
          </div>
        </section>

        <section className="hero-glass-banner" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
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
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#202124' }}>3D Lab</h3>
                <p style={{ fontSize: '0.86rem', color: '#6B7280' }}>
                  Explore interactive 3D models — Human Heart, Solar System, DNA Helix &amp; Chloroplasts
                </p>
              </div>
            </div>
            <button type="button" onClick={() => open3DLab('Human Heart & Cardiac Cycle', 'human_heart')} className="btn-orange">
              <span>Explore</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
