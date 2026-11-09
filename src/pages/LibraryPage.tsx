import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Box,
  Rocket,
  Trash2,
  ExternalLink,
  X,
  Sparkles,
  Download,
  Share2,
  Edit3,
  Clock,
  Filter,
  ArrowUpDown,
  Play,
  FileText,
  Volume2,
  CheckCircle2
} from 'lucide-react';
import { TopBrandBar } from '../components/GlassNav';
import { FuturisticIcon, FuturisticIconName } from '../components/FuturisticIcons';
import { useLearning } from '../context/LearningContext';
import { LanguageLearningSection } from '../components/LanguageLearningSection';
import { EducationalGamesSection } from '../components/EducationalGamesSection';

/**
 * Generates a real topic-specific SVG educational illustration data URL on the client
 * whenever a saved resource does not already carry a server-provided `thumbnail_url` or `media_url`.
 */
function buildTopicPreviewDataUrl(item: any): string {
  if (item.thumbnail_url && String(item.thumbnail_url).startsWith('data:image/')) {
    return item.thumbnail_url;
  }
  if (item.media_url && String(item.media_url).startsWith('data:image/')) {
    return item.media_url;
  }
  if (item.content?.imageUrl && String(item.content.imageUrl).startsWith('data:image/')) {
    return item.content.imageUrl;
  }

  const text = `${item.title || ''} ${item.topic || ''} ${item.subject || ''}`.toLowerCase();
  const safeTitle = String(item.title || item.topic || 'Study Resource')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .slice(0, 38);
  const safeSubj = String(item.subject || 'Education')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  let centerGraphic = '';

  if (text.includes('heart') || text.includes('cardiac') || text.includes('circulation')) {
    centerGraphic = `
      <circle cx="200" cy="105" r="56" fill="#FFF3E8" stroke="#FF6A00" stroke-width="2.5"/>
      <path d="M200 142 C200 142 156 112 156 86 C156 71 168 62 182 62 C191 62 197 68 200 74 C203 68 209 62 218 62 C232 62 244 71 244 86 C244 112 200 142 200 142 Z" fill="#EF4444" stroke="#B91C1C" stroke-width="2.5"/>
      <path d="M192 64 V46 M208 64 V44" stroke="#2563EB" stroke-width="5" stroke-linecap="round"/>
      <path d="M174 96 H226 M200 74 V132" stroke="#FCA5A5" stroke-width="2" stroke-dasharray="3 3"/>
      <text x="140" y="75" fill="#1E40AF" font-size="10" font-weight="700" font-family="sans-serif">RA / RV</text>
      <text x="235" y="75" fill="#991B1B" font-size="10" font-weight="700" font-family="sans-serif">LA / LV</text>
    `;
  } else if (text.includes('dna') || text.includes('helix') || text.includes('gene') || text.includes('chromosome')) {
    centerGraphic = `
      <path d="M120 75 Q160 40 200 75 T280 75" fill="none" stroke="#FF6A00" stroke-width="4" stroke-linecap="round"/>
      <path d="M120 125 Q160 160 200 125 T280 125" fill="none" stroke="#0284C7" stroke-width="4" stroke-linecap="round"/>
      <line x1="140" y1="62" x2="140" y2="138" stroke="#10B981" stroke-width="3"/>
      <line x1="170" y1="58" x2="170" y2="142" stroke="#F59E0B" stroke-width="3"/>
      <line x1="200" y1="75" x2="200" y2="125" stroke="#8B5CF6" stroke-width="3"/>
      <line x1="230" y1="92" x2="230" y2="108" stroke="#10B981" stroke-width="3"/>
      <line x1="260" y1="88" x2="260" y2="112" stroke="#EF4444" stroke-width="3"/>
      <text x="200" y="160" text-anchor="middle" fill="#047857" font-size="10" font-weight="700" font-family="sans-serif">A-T • G-C Base Pairs (3D Double Helix)</text>
    `;
  } else if (text.includes('photosynthesis') || text.includes('chloroplast') || text.includes('plant') || text.includes('leaf')) {
    centerGraphic = `
      <circle cx="130" cy="68" r="18" fill="#FACC15" stroke="#EA580C" stroke-width="2"/>
      <line x1="152" y1="76" x2="182" y2="92" stroke="#F59E0B" stroke-width="2.5" stroke-dasharray="4 3"/>
      <path d="M185 130 C185 88 235 68 265 92 C265 130 225 148 185 130 Z" fill="#22C55E" stroke="#15803D" stroke-width="2.5"/>
      <path d="M185 130 Q222 108 260 94" fill="none" stroke="#DCFCE7" stroke-width="2"/>
      <text x="225" y="158" text-anchor="middle" fill="#15803D" font-size="10" font-weight="700" font-family="sans-serif">6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂</text>
    `;
  } else if (text.includes('quadratic') || text.includes('parabola') || text.includes('math') || text.includes('equation') || text.includes('trigonometry')) {
    centerGraphic = `
      <line x1="110" y1="135" x2="290" y2="135" stroke="#94A3B8" stroke-width="1.8"/>
      <line x1="200" y1="45" x2="200" y2="160" stroke="#94A3B8" stroke-width="1.8"/>
      <path d="M145 55 Q200 185 255 55" fill="none" stroke="#FF6A00" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="171" cy="135" r="4.5" fill="#10B981"/>
      <circle cx="229" cy="135" r="4.5" fill="#10B981"/>
      <circle cx="200" cy="120" r="4.5" fill="#0284C7"/>
      <text x="258" y="75" fill="#FF6A00" font-size="11" font-weight="800" font-family="monospace">y = ax² + bx + c</text>
    `;
  } else if (text.includes('newton') || text.includes('force') || text.includes('friction') || text.includes('motion') || text.includes('physics')) {
    centerGraphic = `
      <line x1="100" y1="135" x2="300" y2="135" stroke="#475569" stroke-width="3"/>
      <rect x="160" y="90" width="70" height="45" rx="8" fill="#FFF3E8" stroke="#FF6A00" stroke-width="2.5"/>
      <text x="195" y="117" text-anchor="middle" fill="#202124" font-size="12" font-weight="800" font-family="sans-serif">Mass m</text>
      <line x1="230" y1="112" x2="282" y2="112" stroke="#16A34A" stroke-width="3.5"/>
      <polygon points="282,106 294,112 282,118" fill="#16A34A"/>
      <text x="262" y="102" text-anchor="middle" fill="#15803D" font-size="10" font-weight="800" font-family="sans-serif">F = ma</text>
      <line x1="160" y1="122" x2="118" y2="122" stroke="#EF4444" stroke-width="3"/>
      <polygon points="118,117 108,122 118,127" fill="#EF4444"/>
      <text x="134" y="112" text-anchor="middle" fill="#B91C1C" font-size="9" font-weight="800" font-family="sans-serif">f = μN</text>
    `;
  } else if (text.includes('solar') || text.includes('planet') || text.includes('geography') || text.includes('climate') || text.includes('earth')) {
    centerGraphic = `
      <circle cx="155" cy="105" r="22" fill="#FACC15" stroke="#FF6A00" stroke-width="2.5"/>
      <ellipse cx="155" cy="105" rx="65" ry="26" fill="none" stroke="#CBD5E1" stroke-width="1.5" stroke-dasharray="4 3"/>
      <ellipse cx="155" cy="105" rx="105" ry="42" fill="none" stroke="#CBD5E1" stroke-width="1.5" stroke-dasharray="4 3"/>
      <circle cx="220" cy="105" r="9" fill="#0284C7"/>
      <circle cx="260" cy="105" r="12" fill="#EA580C"/>
    `;
  } else {
    centerGraphic = `
      <rect x="135" y="54" width="130" height="96" rx="12" fill="#FFFFFF" stroke="#FF6A00" stroke-width="2.2"/>
      <rect x="150" y="70" width="65" height="8" rx="4" fill="#FF6A00"/>
      <rect x="150" y="86" width="95" height="6" rx="3" fill="#CBD5E1"/>
      <rect x="150" y="98" width="82" height="6" rx="3" fill="#CBD5E1"/>
      <rect x="150" y="114" width="54" height="22" rx="6" fill="#FFF3E8" stroke="#FF8533" stroke-width="1.5"/>
      <circle cx="232" cy="125" r="13" fill="#FFF3E8" stroke="#FF6A00" stroke-width="2"/>
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 210" width="400" height="210">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="55%" stop-color="#FAFAFA"/>
        <stop offset="100%" stop-color="#FFF3E8"/>
      </linearGradient>
    </defs>
    <rect width="400" height="210" fill="url(#bg)"/>
    <circle cx="365" cy="28" r="64" fill="#FF6A00" opacity="0.06"/>
    <circle cx="35" cy="185" r="54" fill="#FF6A00" opacity="0.06"/>
    <text x="18" y="26" fill="#E85D00" font-size="10" font-weight="800" font-family="sans-serif" letter-spacing="0.6">${safeSubj.toUpperCase()} • ${String(item.resource_type || 'RESOURCE').toUpperCase()}</text>
    ${centerGraphic}
    <rect x="14" y="172" width="372" height="28" rx="8" fill="#FFFFFF" opacity="0.92"/>
    <text x="24" y="190" fill="#202124" font-size="12" font-weight="800" font-family="sans-serif">${safeTitle}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

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
  const [subjectFilter, setSubjectFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'title' | 'subject'>('newest');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [counts, setCounts] = useState<any>({ all: 0, note: 0, image: 0, video: 0, model3d: 0, audio: 0, quiz: 0, game: 0 });
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [inspectedResource, setInspectedResource] = useState<any | null>(null);
  const [shareToast, setShareToast] = useState<string>('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (typeFilter !== 'all' && typeFilter !== 'continue') params.set('type', typeFilter);
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    apiFetch(`/api/library?${params.toString()}`)
      .then((res) => {
        setCounts(res.counts || {});
        setItems(res.items || []);
      })
      .finally(() => setLoading(false));
  }, [typeFilter, searchQuery, refreshTick, apiFetch]);

  // Deduplicate identical titles within the same resource_type, filter by subject, and sort
  const filteredAndSortedItems = useMemo(() => {
    const seenKeys = new Set<string>();
    const deduped: any[] = [];
    for (const item of items) {
      const key = `${item.resource_type}::${String(item.title || '').trim().toLowerCase()}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        deduped.push(item);
      }
    }

    const bySubject =
      subjectFilter === 'All'
        ? deduped
        : deduped.filter((it) => String(it.subject || '').toLowerCase().includes(subjectFilter.toLowerCase()));

    const sorted = [...bySubject];
    if (sortBy === 'title') {
      sorted.sort((a, b) => String(a.title || '').localeCompare(String(b.title || '')));
    } else if (sortBy === 'subject') {
      sorted.sort((a, b) => String(a.subject || '').localeCompare(String(b.subject || '')));
    } else {
      sorted.sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
    }
    return sorted;
  }, [items, subjectFilter, sortBy]);

  const continueLearningItems = useMemo(() => {
    return filteredAndSortedItems.slice(0, 3);
  }, [filteredAndSortedItems]);

  const handleOpenResource = (item: any) => {
    setInspectedResource(item);
  };

  const handleLaunchWorkspace = (item: any) => {
    setInspectedResource(null);
    if (item.resource_type === 'note') {
      navigate(`/notes?id=${item.content?.noteId || ''}`);
    } else if (item.resource_type === 'model3d' || item.resource_type === 'video') {
      // Integrated contextually into AI Tutor workspace per Part 3 & Part 6
      navigate(`/tutor?topic=${encodeURIComponent(item.topic)}`);
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

  const handleDownloadResource = (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const previewUrl = buildTopicPreviewDataUrl(item);
    const a = document.createElement('a');
    if (item.resource_type === 'image' && previewUrl) {
      a.href = previewUrl;
      a.download = `${String(item.title || 'diagram').replace(/\s+/g, '_')}.svg`;
    } else {
      const textData = `# ${item.title}\nSubject: ${item.subject}\nTopic: ${item.topic}\nType: ${item.resource_type}\n\n${item.summary}\n\n${item.content?.markdown || ''}`;
      const blob = new Blob([textData], { type: 'text/markdown;charset=utf-8' });
      a.href = URL.createObjectURL(blob);
      a.download = `${String(item.title || 'resource').replace(/\s+/g, '_')}.md`;
    }
    a.click();
  };

  const handleShareResource = (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `STUDYAI Resource: ${item.title} (${item.subject} — ${item.topic})`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).catch(() => {});
    }
    setShareToast(`Copied link details for "${item.title}"`);
    setTimeout(() => setShareToast(''), 3000);
  };

  const filterTabs = [
    { id: 'all', label: `All Resources (${counts.all || 0})` },
    { id: 'note', label: `Saved Notebooks & Revision (${counts.note || 0})` },
    { id: 'quiz', label: `Practice Quizzes & Assessments (${counts.quiz || 0})` },
    { id: 'game', label: `Educational Games (${counts.game || 0})` },
    { id: 'audio', label: `Audio Lessons (${counts.audio || 0})` },
    { id: 'image', label: `Visual Schematics (${counts.image || 0})` },
    { id: 'examinations', label: 'Weekly Mock Exams' }
  ];

  const subjectsList = ['All', 'Science', 'Biology', 'Physics', 'Chemistry', 'Mathematics', 'History', 'Geography', 'English'];

  const categoryCards: Array<{
    id: string;
    label: string;
    count: number;
    iconName: FuturisticIconName;
  }> = [
    { id: 'note', label: 'Saved Notebooks', count: counts.note || 0, iconName: 'notes' },
    { id: 'quiz', label: 'Practice & Quizzes', count: counts.quiz || 0, iconName: 'quiz' },
    { id: 'game', label: 'Curriculum Games', count: counts.game || 0, iconName: 'games' },
    { id: 'audio', label: 'Audio Lessons', count: counts.audio || 0, iconName: 'audio' },
    { id: 'image', label: 'Visual Schematics', count: counts.image || 0, iconName: 'image' },
    { id: 'examinations', label: 'Weekly Mock Exams', count: 2, iconName: 'quiz' }
  ];

  return (
    <div className="studyai-container">
      <TopBrandBar showBack />

      {shareToast && (
        <div
          style={{
            padding: '10px 16px',
            borderRadius: 14,
            background: '#FFF3E8',
            border: '1px solid rgba(255,106,0,0.3)',
            color: '#E85D00',
            fontWeight: 700,
            fontSize: '0.85rem',
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <CheckCircle2 size={16} color="#FF6A00" />
          <span>{shareToast}</span>
        </div>
      )}

      {/* Header */}
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
          <span>VISUAL KNOWLEDGE &amp; MULTIMODAL LEARNING REPOSITORY</span>
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#202124', letterSpacing: '-0.02em' }}>Visual Learning Library</h1>
        <p style={{ fontSize: '0.92rem', color: '#6B7280', marginTop: 2 }}>
          Explore your saved AI notebooks, verified scientific diagrams, audio lessons, educational games, and multilingual speaking courses with live visual previews.
        </p>
      </section>

      {/* Search, Subject Filter & Sort Controls */}
      <section style={{ marginBottom: 22 }}>
        <div style={{ display: 'grid', gap: 12, alignItems: 'center', marginBottom: 14 }} className="library-search-bar">
          <div className="glass-input-wrap" style={{ flex: 1 }}>
            <Search size={19} color="#FF6A00" />
            <input
              className="glass-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search visual library by topic, title, subject, or diagram..."
              aria-label="Search saved library resources"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ border: 'none', background: 'transparent', color: '#6B7280', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FFFFFF', border: '1.5px solid #EEEEEE', borderRadius: 999, padding: '8px 14px' }}>
              <Filter size={15} color="#FF6A00" />
              <select
                aria-label="Filter by Subject"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                style={{ border: 'none', background: 'transparent', fontWeight: 700, fontSize: '0.82rem', color: '#202124', outline: 'none', cursor: 'pointer' }}
              >
                {subjectsList.map((s) => (
                  <option key={s} value={s}>
                    Subject: {s}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FFFFFF', border: '1.5px solid #EEEEEE', borderRadius: 999, padding: '8px 14px' }}>
              <ArrowUpDown size={15} color="#FF6A00" />
              <select
                aria-label="Sort Library Items"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{ border: 'none', background: 'transparent', fontWeight: 700, fontSize: '0.82rem', color: '#202124', outline: 'none', cursor: 'pointer' }}
              >
                <option value="newest">Sort: Recently Added</option>
                <option value="title">Sort: Title (A–Z)</option>
                <option value="subject">Sort: Subject</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
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

      {/* Category Quick-Filter Strip */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(148px, 1fr))',
          gap: 12,
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
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: isSelected ? '#FFF3E8' : '#FFFFFF',
                border: isSelected ? '2px solid #FF6A00' : '1.5px solid #EEEEEE'
              }}
            >
              <div style={{ flexShrink: 0 }}>
                <FuturisticIcon name={c.iconName} size={38} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#202124' }}>{c.label}</div>
                <div style={{ fontSize: '0.75rem', color: isSelected ? '#E85D00' : '#6B7280', fontWeight: 700 }}>{c.count} saved</div>
              </div>
            </div>
          );
        })}
      </section>

      {/* SECTION 1: CONTINUE LEARNING & RECENTLY ADDED VISUAL CARDS */}
      <section style={{ marginBottom: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h2 style={{ fontSize: '1.22rem', fontWeight: 900, color: '#202124', margin: 0 }}>
              {typeFilter === 'all' ? 'Saved Visual Learning Materials' : `Filtered Resources (${filteredAndSortedItems.length})`}
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#6B7280', marginTop: 2 }}>
              Every card displays its actual diagram, 3D model schematic, or notebook visual preview. Click any card to inspect or open.
            </p>
          </div>
          {(typeFilter !== 'all' || subjectFilter !== 'All' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setTypeFilter('all');
                setSubjectFilter('All');
                setSearchQuery('');
              }}
              className="btn-glass"
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="glass-card" style={{ padding: 36, textAlign: 'center', color: '#6B7280' }}>
            Loading visual library previews...
          </div>
        ) : filteredAndSortedItems.length === 0 ? (
          <div className="glass-card" style={{ padding: 36, textAlign: 'center', color: '#6B7280' }}>
            <Sparkles size={28} color="#FF6A00" style={{ marginBottom: 8 }} />
            <div style={{ fontWeight: 800, color: '#202124', fontSize: '1rem', marginBottom: 4 }}>No matching resources found</div>
            <p style={{ fontSize: '0.86rem', marginBottom: 14 }}>
              Generate an AI Notebook, 3D Model, or Scientific Diagram to populate your visual library.
            </p>
            <button type="button" onClick={() => navigate('/notes')} className="btn-orange" style={{ padding: '9px 18px', fontSize: '0.84rem' }}>
              + Create AI Notebook
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(285px, 1fr))', gap: 20 }}>
            {filteredAndSortedItems.map((item) => {
              const previewSrc = buildTopicPreviewDataUrl(item);
              return (
                <div
                  key={item.id}
                  onClick={() => handleOpenResource(item)}
                  className="library-visual-card"
                >
                  <div>
                    {/* TOP VISUAL THUMBNAIL FRAME (ACTUAL DIAGRAM / 3D PREVIEW) */}
                    <div className="library-thumbnail-frame">
                      <img
                        src={previewSrc}
                        alt={item.title}
                        className="library-thumbnail-img"
                        loading="lazy"
                      />

                      {/* Category Badge Overlay */}
                      <span
                        style={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          padding: '4px 10px',
                          borderRadius: 999,
                          background: 'rgba(255, 255, 255, 0.92)',
                          border: '1px solid rgba(255, 106, 0, 0.28)',
                          color: '#E85D00',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          backdropFilter: 'blur(8px)'
                        }}
                      >
                        {item.resource_type === 'model3d' ? '3D Model' : item.resource_type}
                      </span>

                      {/* Discreet Action Buttons Overlay */}
                      <div
                        style={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          display: 'flex',
                          gap: 6
                        }}
                      >
                        <button
                          type="button"
                          onClick={(e) => handleDownloadResource(item, e)}
                          title="Download resource"
                          aria-label={`Download ${item.title}`}
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: '50%',
                            border: '1px solid #EEEEEE',
                            background: 'rgba(255,255,255,0.92)',
                            color: '#202124',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Download size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleShareResource(item, e)}
                          title="Share resource"
                          aria-label={`Share ${item.title}`}
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: '50%',
                            border: '1px solid #EEEEEE',
                            background: 'rgba(255,255,255,0.92)',
                            color: '#202124',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Share2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteResource(item.id, item.title, e)}
                          title="Delete resource"
                          aria-label={`Delete ${item.title}`}
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: '50%',
                            border: '1px solid #FEE2E2',
                            background: 'rgba(255,255,255,0.92)',
                            color: '#DC2626',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Card Content Details Below Image */}
                    <div style={{ padding: '16px 18px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                        <span
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            color: '#FF6A00',
                            background: '#FFF3E8',
                            padding: '2px 9px',
                            borderRadius: 999
                          }}
                        >
                          {item.subject || 'Science'}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#6B7280', fontWeight: 600 }}>
                          {item.topic}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#202124', marginBottom: 6, lineHeight: 1.35 }}>
                        {item.title}
                      </h3>

                      <p
                        style={{
                          fontSize: '0.82rem',
                          color: '#6B7280',
                          lineHeight: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {item.summary}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div
                    style={{
                      padding: '10px 18px 16px',
                      borderTop: '1px solid #FAFAFA',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    {(() => {
                      const st = String(item.status || 'ready').toLowerCase();
                      const isVerified = Boolean(item.content?.verified);
                      if (st === 'generating') {
                        return (
                          <span style={{ fontSize: '0.72rem', color: '#D97706', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D97706', display: 'inline-block' }} />
                            Generating...
                          </span>
                        );
                      }
                      if (st === 'needs_review') {
                        return (
                          <span style={{ fontSize: '0.72rem', color: '#EA580C', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EA580C', display: 'inline-block' }} />
                            Needs Review
                          </span>
                        );
                      }
                      if (st === 'failed') {
                        return (
                          <span style={{ fontSize: '0.72rem', color: '#DC2626', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#DC2626', display: 'inline-block' }} />
                            Failed
                          </span>
                        );
                      }
                      return (
                        <span style={{ fontSize: '0.72rem', color: isVerified ? '#15803D' : '#059669', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: isVerified ? '#15803D' : '#059669', display: 'inline-block' }} />
                          {isVerified ? 'Ready • Verified' : 'Ready'}
                        </span>
                      );
                    })()}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLaunchWorkspace(item);
                      }}
                      style={{
                        border: 'none',
                        background: '#FFF3E8',
                        color: '#E85D00',
                        padding: '6px 12px',
                        borderRadius: 999,
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5
                      }}
                    >
                      <span>{item.resource_type === 'note' ? 'Open & Edit' : 'Open Studio'}</span>
                      <ExternalLink size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 2: SPEAKING SKILLS & MULTILINGUAL LANGUAGE LEARNING */}
      <LanguageLearningSection />

      {/* SECTION 3: EDUCATIONAL GAMES LIBRARY (7 CORE GAMES) */}
      <EducationalGamesSection />

      {/* SECTION 4: WEEKLY EXAMINATIONS & 3D LAB / SPACE BATTLE CARDS */}
      <section
        className="glass-card"
        style={{
          marginBottom: 24,
          padding: 24,
          borderRadius: 24,
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FAFAFA 55%, #FFF3E8 100%)',
          border: '1.5px solid rgba(255, 106, 0, 0.28)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flexShrink: 0 }}>
            <FuturisticIcon name="quiz" size={48} />
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
                ASSESSMENT &amp; EXAM CENTER
              </span>
              <span style={{ fontSize: '0.76rem', color: '#E85D00', fontWeight: 700 }}>
                Weekly Mock Exams • Topic-Based 40-Mark Papers
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#202124', margin: '0 0 4px 0' }}>
              Weekly Examinations &amp; Practice Assessments
            </h2>
            <p style={{ fontSize: '0.86rem', color: '#6B7280', margin: 0 }}>
              Attempt official scheduled weekly mock exams or generate customized 40-mark practice papers with instant grading.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => openExamModal(activeTopic, 'Science')}
          className="btn-orange"
          style={{ padding: '12px 24px', fontSize: '0.9rem' }}
        >
          Open Examination Center →
        </button>
      </section>

      {/* Space Battle & 3D Lab Feature Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
        <section className="hero-glass-banner" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #FF7A1A 0%, #FF6A00 100%)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 20px rgba(255, 106, 0, 0.28)'
                }}
              >
                <Rocket size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#202124' }}>STUDYAI Space Battle</h3>
                <p style={{ fontSize: '0.84rem', color: '#6B7280', marginTop: 2 }}>
                  Arcade knowledge challenge — target enemy ships carrying verified scientific answers
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openGamesHub(activeTopic || 'Human Body', 'Biology', 'space_shooter')}
              className="btn-orange"
            >
              <span>Play Space Battle</span>
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
                <Volume2 size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#202124' }}>Voice Teacher &amp; Audio Lessons</h3>
                <p style={{ fontSize: '0.84rem', color: '#6B7280', marginTop: 2 }}>
                  Listen to teacher explanations, diagram verbalizations, and interactive conversational lessons
                </p>
              </div>
            </div>
            <button type="button" onClick={() => navigate('/tutor?voice=true')} className="btn-orange">
              <span>Start Voice Lesson →</span>
            </button>
          </div>
        </section>
      </div>

      {/* Persisted Resource Inspector Modal with Full Visual Preview */}
      {inspectedResource && (
        <div className="glass-modal-overlay" role="dialog" aria-modal="true" aria-label="Saved Resource Viewer">
          <div className="glass-modal-content" style={{ maxWidth: 720 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <span style={{ padding: '4px 12px', borderRadius: 999, background: '#FFF3E8', color: '#E85D00', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
                  Saved {inspectedResource.resource_type} • {inspectedResource.subject}
                </span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#202124', marginTop: 6 }}>{inspectedResource.title}</h3>
              </div>
              <button type="button" onClick={() => setInspectedResource(null)} className="btn-glass" style={{ padding: '6px 10px' }}>
                <X size={16} />
              </button>
            </div>

            {/* Visual Preview Banner inside Modal */}
            <div
              style={{
                borderRadius: 18,
                overflow: 'hidden',
                border: '1.5px solid #EEEEEE',
                background: '#FAFAFA',
                marginBottom: 16,
                maxHeight: 280,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img
                src={buildTopicPreviewDataUrl(inspectedResource)}
                alt={inspectedResource.title}
                style={{ width: '100%', maxHeight: 270, objectFit: 'contain' }}
              />
            </div>

            <div style={{ padding: 18, borderRadius: 18, background: '#FAFAFA', border: '1.5px solid #EEEEEE', marginBottom: 18 }}>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#202124', marginBottom: 6 }}>Resource Overview:</div>
              <p style={{ fontSize: '0.88rem', color: '#6B7280', lineHeight: 1.55, marginBottom: 12 }}>{inspectedResource.summary}</p>

              {inspectedResource.content?.markdown && (
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.84rem', background: '#FFFFFF', padding: 14, borderRadius: 14, border: '1px solid #EEEEEE', color: '#202124', maxHeight: 220, overflowY: 'auto' }}>
                  {inspectedResource.content.markdown}
                </pre>
              )}

              {inspectedResource.content?.scenes && (
                <div style={{ display: 'grid', gap: 8 }}>
                  {inspectedResource.content.scenes.map((sc: any, idx: number) => (
                    <div key={idx} style={{ padding: 10, borderRadius: 12, background: '#FFFFFF', border: '1px solid #EEEEEE', fontSize: '0.82rem', color: '#202124' }}>
                      <strong style={{ color: '#FF6A00' }}>Scene {idx + 1} — {sc.title}:</strong> {sc.narration}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={(e) => handleDownloadResource(inspectedResource, e)}
                  className="btn-glass"
                  style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                >
                  <Download size={14} />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDeleteResource(inspectedResource.id, inspectedResource.title, e)}
                  className="btn-glass"
                  style={{ padding: '8px 14px', fontSize: '0.82rem', color: '#DC2626', borderColor: '#FECACA' }}
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>

              <button type="button" onClick={() => handleLaunchWorkspace(inspectedResource)} className="btn-orange">
                <span>{inspectedResource.resource_type === 'note' ? 'Open in AI Notebook Workspace →' : 'Open in Interactive Studio →'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
