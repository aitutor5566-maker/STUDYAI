import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileText,
  Search,
  Sparkles,
  Upload,
  Save,
  Trash2,
  Volume2,
  HelpCircle,
  Layers,
  Download,
  ChevronRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { TopBrandBar } from '../components/GlassNav';
import { useLearning } from '../context/LearningContext';

export const NotesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { apiFetch, activeTopic, setTopicContext, startAudioLesson, openQuizModal, refreshTick, triggerRefresh } = useLearning();

  const [notes, setNotes] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Active Note Editor State
  const [activeNote, setActiveNote] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editSubject, setEditSubject] = useState<string>('Science');
  const [editNotebook, setEditNotebook] = useState<string>('Biology');
  const [editMarkdown, setEditMarkdown] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'flashcards'>('preview');
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  // Note Generation Form State
  const [showGenerator, setShowGenerator] = useState<boolean>(false);
  const [genTopic, setGenTopic] = useState<string>(searchParams.get('topic') || activeTopic || '');
  const [genSubject, setGenSubject] = useState<string>('Science');
  const [genDepth, setGenDepth] = useState<'concise' | 'detailed' | 'exam-prep'>('detailed');
  const [genSourceText, setGenSourceText] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState<{ type: 'ok' | 'err'; message: string } | null>(null);
  const [generating, setGenerating] = useState<boolean>(false);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.set('subject', selectedCategory);
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      const list = await apiFetch<any[]>(`/api/notes?${params.toString()}`);
      setNotes(list);

      const requestedId = searchParams.get('id');
      if (requestedId) {
        const found = list.find((n) => n.id === requestedId);
        if (found) selectNoteForEditing(found);
      } else if (!activeNote && list.length > 0) {
        selectNoteForEditing(list[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [selectedCategory, searchQuery, refreshTick]);

  const selectNoteForEditing = (note: any) => {
    setActiveNote(note);
    setEditTitle(note.title);
    setEditSubject(note.subject);
    setEditNotebook(note.notebook || note.subject);
    setEditMarkdown(note.content_markdown);
    setSaveStatus('idle');
    setFlippedCards({});
  };

  const handleGenerateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genTopic.trim()) {
      setUploadStatus({ type: 'err', message: 'Please enter a topic title to generate structured notes.' });
      return;
    }
    setGenerating(true);
    setUploadStatus(null);
    try {
      const created = await apiFetch('/api/notes/generate', {
        method: 'POST',
        body: JSON.stringify({
          topic: genTopic.trim(),
          subject: genSubject,
          depth: genDepth,
          sourceText: genSourceText,
          sourceType: genSourceText ? 'uploaded_or_pasted' : 'topic'
        })
      });
      await setTopicContext(created.topic, created.subject);
      setShowGenerator(false);
      setGenSourceText('');
      triggerRefresh();
      selectNoteForEditing(created);
    } catch (err: any) {
      setUploadStatus({ type: 'err', message: err?.message || 'Failed to generate notes.' });
    } finally {
      setGenerating(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadStatus(null);

    try {
      let textContent = '';
      if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.txt') || file.name.endsWith('.json')) {
        textContent = await file.text();
      }
      const res = await apiFetch('/api/notes/upload', {
        method: 'POST',
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          content: textContent
        })
      });
      setGenTopic(res.inferredTopic || file.name);
      setGenSourceText(res.extractedSummary || '');
      setShowGenerator(true);
      setUploadStatus({
        type: 'ok',
        message: `Validated "${file.name}" (${Math.round(file.size / 1024)} KB). Ready to synthesize structured notes!`
      });
    } catch (err: any) {
      setUploadStatus({
        type: 'err',
        message: err?.message || 'Unsupported or invalid file upload.'
      });
    }
  };

  const handleSaveNote = async () => {
    if (!activeNote) return;
    setSaveStatus('saving');
    try {
      const updated = await apiFetch(`/api/notes/${activeNote.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: editTitle,
          subject: editSubject,
          notebook: editNotebook,
          content_markdown: editMarkdown
        })
      });
      setActiveNote(updated);
      setSaveStatus('saved');
      triggerRefresh();
    } catch {
      setSaveStatus('error');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this note?')) return;
    await apiFetch(`/api/notes/${noteId}`, { method: 'DELETE' });
    setActiveNote(null);
    triggerRefresh();
  };

  const handleExportMarkdown = () => {
    if (!activeNote) return;
    const blob = new Blob([editMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${editTitle.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Safe Markdown Renderer (Section 8 requirement: never execute arbitrary HTML or scripts)
  const renderSafeMarkdown = (md: string) => {
    return md.split('\n').map((line, i) => {
      if (line.startsWith('# ')) {
        return (
          <h2 key={i} style={{ fontSize: '1.3rem', fontWeight: 800, color: '#202124', marginTop: 12, marginBottom: 8 }}>
            {line.slice(2)}
          </h2>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h3 key={i} style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FF6A00', marginTop: 14, marginBottom: 6 }}>
            {line.slice(3)}
          </h3>
        );
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={i} style={{ marginLeft: 20, marginBottom: 5, fontSize: '0.92rem', lineHeight: 1.55, color: '#202124' }}>
            {line.slice(2)}
          </li>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        return (
          <div key={i} style={{ marginBottom: 6, fontSize: '0.92rem', lineHeight: 1.55, fontWeight: 500, color: '#202124' }}>
            {line}
          </div>
        );
      }
      if (line.startsWith('`') && line.endsWith('`')) {
        return (
          <div
            key={i}
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              background: '#FFF3E8',
              border: '1px solid rgba(255,106,0,0.3)',
              fontFamily: 'monospace',
              fontWeight: 700,
              color: '#E85D00',
              margin: '8px 0'
            }}
          >
            {line.slice(1, -1)}
          </div>
        );
      }
      if (!line.trim()) return <div key={i} style={{ height: 6 }} />;
      return (
        <p key={i} style={{ fontSize: '0.92rem', lineHeight: 1.6, color: '#202124', marginBottom: 6 }}>
          {line}
        </p>
      );
    });
  };

  const categories = ['All', 'Science', 'Maths', 'English', 'Social Studies'];

  return (
    <div className="studyai-container">
      <TopBrandBar showBack />

      {/* Studio Title */}
      <section style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 42, height: 42, borderRadius: 14, background: '#FFF3E8', color: '#FF6A00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#202124' }}>AI Notes Studio</h1>
            <p style={{ fontSize: '0.86rem', color: '#6B7280' }}>Create, edit and organize your study notes with AI</p>
          </div>
        </div>
      </section>

      {/* Search & Category Pills */}
      <section style={{ marginBottom: 18 }}>
        <div className="glass-input-wrap" style={{ marginBottom: 12 }}>
          <Search size={18} color="#FF6A00" />
          <input
            className="glass-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, topics or subjects..."
            aria-label="Search notes"
          />
        </div>

        <div className="pill-row">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Prominent Generate New Notes Action Card */}
      <section className="hero-glass-banner" style={{ padding: 20, marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: '#FFFFFF', color: '#FF6A00', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(255,106,0,0.15)' }}>
              <Sparkles size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#202124' }}>Generate New Notes</h2>
              <p style={{ fontSize: '0.84rem', color: '#6B7280' }}>Turn any topic, pasted text, or uploaded document into structured study notes</p>
            </div>
          </div>

          <button type="button" onClick={() => setShowGenerator((s) => !s)} className="btn-orange">
            <span>{showGenerator ? 'Hide Generator' : 'New AI Note →'}</span>
          </button>
        </div>

        {showGenerator && (
          <form onSubmit={handleGenerateNote} style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(255,106,0,0.2)', display: 'grid', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
              <input
                value={genTopic}
                onChange={(e) => setGenTopic(e.target.value)}
                placeholder="Enter topic (e.g., Newton's Laws, Cell Division, Trigonometry)..."
                style={{ padding: '11px 14px', borderRadius: 14, border: '1px solid rgba(255,106,0,0.35)', fontSize: '0.92rem' }}
                aria-label="New Note Topic"
              />
              <select
                value={genSubject}
                onChange={(e) => setGenSubject(e.target.value)}
                style={{ padding: '11px 14px', borderRadius: 14, border: '1px solid rgba(0,0,0,0.12)', fontWeight: 600 }}
                aria-label="Note Subject"
              >
                <option value="Science">Science</option>
                <option value="Maths">Maths</option>
                <option value="English">English</option>
                <option value="Social Studies">Social Studies</option>
                <option value="Computer Science">Computer Science</option>
              </select>
              <select
                value={genDepth}
                onChange={(e) => setGenDepth(e.target.value as any)}
                style={{ padding: '11px 14px', borderRadius: 14, border: '1px solid rgba(0,0,0,0.12)', fontWeight: 600 }}
                aria-label="Note Depth"
              >
                <option value="concise">Concise Summary</option>
                <option value="detailed">Detailed Curriculum Notes</option>
                <option value="exam-prep">Board Exam Revision Sheet</option>
              </select>
            </div>

            <textarea
              value={genSourceText}
              onChange={(e) => setGenSourceText(e.target.value)}
              rows={3}
              placeholder="Optional: Paste textbook excerpt, lecture notes, or upload a file below..."
              style={{ width: '100%', padding: 12, borderRadius: 14, border: '1px solid rgba(0,0,0,0.12)', fontFamily: 'inherit', fontSize: '0.88rem' }}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <label className="btn-glass" style={{ cursor: 'pointer' }}>
                <Upload size={15} />
                <span>Upload Document / Image (.txt, .md, .pdf, .png)</span>
                <input type="file" accept=".txt,.md,.pdf,.png,.jpg,.jpeg,.json" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>

              <button type="submit" className="btn-orange" disabled={generating}>
                <Sparkles size={16} />
                <span>{generating ? 'Synthesizing Structured Notes...' : 'Generate Structured Notes'}</span>
              </button>
            </div>
          </form>
        )}

        {uploadStatus && (
          <div
            style={{
              marginTop: 12,
              padding: '10px 14px',
              borderRadius: 12,
              background: uploadStatus.type === 'ok' ? '#ECFDF5' : '#FEF2F2',
              color: uploadStatus.type === 'ok' ? '#047857' : '#DC2626',
              fontSize: '0.84rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            {uploadStatus.type === 'ok' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{uploadStatus.message}</span>
          </div>
        )}
      </section>

      {/* Main Split Workspace: Recent Notes List + Full Note Editor */}
      <div className="dashboard-grid">
        {/* Left: Recent Notes List + Tools Grid */}
        <div style={{ display: 'grid', gap: 20, alignContent: 'start' }}>
          <section className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Recent Notes ({notes.length})</h3>
              <span style={{ fontSize: '0.78rem', color: '#FF6A00', fontWeight: 700 }}>Persisted in SQLite</span>
            </div>

            {loading ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#6B7280' }}>Loading saved notes...</div>
            ) : notes.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#6B7280', fontSize: '0.88rem' }}>
                No notes match your filter. Click "New AI Note" above to create one!
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {notes.map((n) => {
                  const isSelected = activeNote?.id === n.id;
                  return (
                    <div
                      key={n.id}
                      onClick={() => selectNoteForEditing(n)}
                      className="glass-card-interactive"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: 16,
                        background: isSelected ? '#FFF3E8' : '#FFFFFF',
                        border: isSelected ? '2px solid #FF6A00' : '1px solid rgba(0,0,0,0.06)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 12,
                            background: isSelected ? '#FF6A00' : '#FFF3E8',
                            color: isSelected ? '#FFFFFF' : '#FF6A00',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800
                          }}
                        >
                          <FileText size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#202124' }}>{n.title}</div>
                          <div style={{ fontSize: '0.76rem', color: '#6B7280' }}>
                            {n.notebook || n.subject} • {n.flashcards?.length || 0} flashcards
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={16} color="#9CA3AF" />
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Tools Grid (matching reference UI bottom-left section) */}
          <section className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: '1.02rem', fontWeight: 800, marginBottom: 12 }}>Tools</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  setGenDepth('concise');
                  setShowGenerator(true);
                }}
                className="quick-tile"
              >
                <FileText size={20} color="#FF6A00" />
                <span style={{ fontSize: '0.76rem', fontWeight: 700 }}>Summarize</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('flashcards')}
                className="quick-tile"
              >
                <Layers size={20} color="#D97706" />
                <span style={{ fontSize: '0.76rem', fontWeight: 700 }}>Flashcards</span>
              </button>
              <button
                type="button"
                onClick={() => openQuizModal(activeNote?.topic || activeTopic, activeNote?.subject || 'Science')}
                className="quick-tile"
              >
                <HelpCircle size={20} color="#16A34A" />
                <span style={{ fontSize: '0.76rem', fontWeight: 700 }}>Practice Questions</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  startAudioLesson({
                    topic: activeNote?.title || activeTopic,
                    text: editMarkdown.replace(/[#*`]/g, '')
                  })
                }
                className="quick-tile"
              >
                <Volume2 size={20} color="#0284C7" />
                <span style={{ fontSize: '0.76rem', fontWeight: 700 }}>Convert to Audio</span>
              </button>
              <button
                type="button"
                onClick={() => setShowGenerator(true)}
                className="quick-tile"
              >
                <Upload size={20} color="#7C3AED" />
                <span style={{ fontSize: '0.76rem', fontWeight: 700 }}>Upload File</span>
              </button>
              <button
                type="button"
                onClick={handleExportMarkdown}
                className="quick-tile"
              >
                <Download size={20} color="#EA580C" />
                <span style={{ fontSize: '0.76rem', fontWeight: 700 }}>More (Export)</span>
              </button>
            </div>
          </section>
        </div>

        {/* Right: Structured Rich Note Editor & Flashcards */}
        <section className="glass-card" style={{ padding: 22 }}>
          {!activeNote ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>
              Select a note from the list or generate a new note to open the studio editor.
            </div>
          ) : (
            <div>
              {/* Editor Top Controls */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {(['preview', 'editor', 'flashcards'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 999,
                        border: 'none',
                        background: activeTab === tab ? '#FF6A00' : '#FFF3E8',
                        color: activeTab === tab ? '#FFFFFF' : '#E85D00',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        textTransform: 'capitalize'
                      }}
                    >
                      {tab === 'preview' ? 'Structured View' : tab === 'editor' ? 'Edit Note' : `Flashcards (${activeNote.flashcards?.length || 0})`}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {saveStatus === 'saved' && (
                    <span style={{ fontSize: '0.78rem', color: '#15803D', fontWeight: 700 }}>✓ Saved</span>
                  )}
                  {saveStatus === 'error' && (
                    <span style={{ fontSize: '0.78rem', color: '#DC2626', fontWeight: 700 }}>Save failed — Retry</span>
                  )}
                  <button type="button" onClick={handleSaveNote} className="btn-orange" style={{ padding: '7px 14px', fontSize: '0.8rem' }}>
                    <Save size={14} />
                    <span>{saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteNote(activeNote.id)}
                    className="btn-glass"
                    style={{ padding: '7px 10px', color: '#DC2626' }}
                    aria-label="Delete Note"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Editable Title & Metadata Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, marginBottom: 14 }}>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  aria-label="Note Title"
                  style={{ padding: '8px 12px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)', fontWeight: 800, fontSize: '1.02rem' }}
                />
                <input
                  value={editNotebook}
                  onChange={(e) => setEditNotebook(e.target.value)}
                  aria-label="Notebook Name"
                  placeholder="Notebook"
                  style={{ width: 110, padding: '8px 10px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)', fontSize: '0.82rem', fontWeight: 600 }}
                />
                <select
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  aria-label="Subject"
                  style={{ padding: '8px 10px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)', fontSize: '0.82rem', fontWeight: 600 }}
                >
                  <option value="Science">Science</option>
                  <option value="Maths">Maths</option>
                  <option value="English">English</option>
                  <option value="Social Studies">Social Studies</option>
                  <option value="Computer Science">Computer Science</option>
                </select>
              </div>

              {/* Tab 1: Structured Safe Markdown Preview */}
              {activeTab === 'preview' && (
                <div style={{ padding: 18, borderRadius: 18, background: '#FFFFFF', border: '1px solid rgba(255,106,0,0.18)', maxHeight: 580, overflowY: 'auto' }}>
                  {activeNote.structured?.keywords?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12, alignItems: 'center' }}>
                      {activeNote.structured?.providerName && (
                        <span style={{ padding: '3px 10px', borderRadius: 999, background: '#ECFDF5', color: '#047857', fontSize: '0.73rem', fontWeight: 700 }}>
                          ✨ {activeNote.structured.providerName}
                        </span>
                      )}
                      {activeNote.structured.keywords.map((kw: string) => (
                        <span key={kw} style={{ padding: '3px 10px', borderRadius: 999, background: '#FFF3E8', color: '#E85D00', fontSize: '0.73rem', fontWeight: 700 }}>
                          #{kw}
                        </span>
                      ))}
                    </div>
                  )}
                  {activeNote.structured?.imageUrl && (
                    <div style={{ marginBottom: 14, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,106,0,0.2)', background: '#FFFBF7' }}>
                      <img
                        src={activeNote.structured.imageUrl}
                        alt={activeNote.title}
                        style={{ width: '100%', maxHeight: 280, objectFit: 'contain', display: 'block' }}
                      />
                    </div>
                  )}
                  {renderSafeMarkdown(editMarkdown)}
                </div>
              )}

              {/* Tab 2: Raw Structured Editor */}
              {activeTab === 'editor' && (
                <textarea
                  value={editMarkdown}
                  onChange={(e) => setEditMarkdown(e.target.value)}
                  aria-label="Note Markdown Content Editor"
                  rows={18}
                  style={{
                    width: '100%',
                    padding: 16,
                    borderRadius: 18,
                    border: '1.5px solid rgba(255,106,0,0.35)',
                    fontFamily: 'monospace',
                    fontSize: '0.88rem',
                    lineHeight: 1.55,
                    background: '#FFFDFB'
                  }}
                />
              )}

              {/* Tab 3: Interactive Flashcards */}
              {activeTab === 'flashcards' && (
                <div style={{ display: 'grid', gap: 12 }}>
                  {(activeNote.flashcards || []).map((card: any, idx: number) => {
                    const isFlipped = Boolean(flippedCards[idx]);
                    return (
                      <div
                        key={idx}
                        onClick={() => setFlippedCards((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                        style={{
                          padding: 18,
                          borderRadius: 18,
                          background: isFlipped ? '#FFF3E8' : '#FFFFFF',
                          border: '1.5px solid rgba(255,106,0,0.3)',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#FF6A00', textTransform: 'uppercase', marginBottom: 4 }}>
                          {isFlipped ? 'Answer (Click to flip)' : `Flashcard ${idx + 1} — Question (Click to reveal answer)`}
                        </div>
                        <div style={{ fontSize: '0.96rem', fontWeight: 700, color: '#202124' }}>
                          {isFlipped ? card.back : card.front}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
