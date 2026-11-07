import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Sparkles, Search, Bookmark, CheckCircle2, ChevronRight, Compass,
  Layers, Scissors, Move, Activity, FileText, Award, HelpCircle, ShieldCheck,
  Send, RefreshCw, Zap, Play, Filter
} from 'lucide-react';
import { Interactive3DViewer, VERIFIED_MODEL_SPECS, ModelSpec, ModelPartInfo } from '../components/Interactive3DLab';
import { useLearning } from '../context/LearningContext';

const SUBJECT_CATEGORIES = [
  { id: 'all', label: 'All Subjects' },
  { id: 'biology', label: 'Biology' },
  { id: 'physics', label: 'Physics' },
  { id: 'chemistry', label: 'Chemistry' },
  { id: 'mathematics', label: 'Mathematics' },
  { id: 'geography', label: 'Geography' },
  { id: 'engineering', label: 'Engineering' }
];

export const Diagrams3DPage: React.FC = () => {
  const { apiFetch, triggerRefresh } = useLearning();

  // Active diagram selection
  const [selectedDiagramId, setSelectedDiagramId] = useState<string>('human_heart');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSubject, setActiveSubject] = useState<string>('all');
  const [savedDiagrams, setSavedDiagrams] = useState<Record<string, boolean>>({});

  // AI procedural generator state
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<string>('');

  // Currently selected component in the active diagram
  const [activeComponent, setActiveComponent] = useState<ModelPartInfo | null>(null);

  // Active quiz modal or drawer state
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Active Model Spec
  const activeSpec = useMemo<ModelSpec>(() => {
    return VERIFIED_MODEL_SPECS[selectedDiagramId] || VERIFIED_MODEL_SPECS.human_heart;
  }, [selectedDiagramId]);

  // Load saved diagrams list
  useEffect(() => {
    apiFetch('/api/diagrams-3d/saved')
      .then((res) => {
        if (res && res.savedDiagramIds && Array.isArray(res.savedDiagramIds)) {
          const map: Record<string, boolean> = {};
          res.savedDiagramIds.forEach((id: string) => {
            map[id] = true;
          });
          setSavedDiagrams(map);
        }
      })
      .catch(() => {});
  }, [apiFetch]);

  // Filter diagrams by subject and search
  const filteredDiagramList = useMemo(() => {
    const list = Object.values(VERIFIED_MODEL_SPECS);
    return list.filter((spec) => {
      const matchSubject =
        activeSubject === 'all' ||
        spec.subject.toLowerCase().includes(activeSubject.toLowerCase());
      const matchQuery =
        !searchQuery.trim() ||
        spec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spec.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spec.parts.some((p) => p.label.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchSubject && matchQuery;
    });
  }, [activeSubject, searchQuery]);

  // Bookmark toggle
  const handleToggleBookmark = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (savedDiagrams[id]) {
        await apiFetch(`/api/diagrams-3d/save/${id}`, { method: 'DELETE' });
        setSavedDiagrams((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      } else {
        await apiFetch('/api/diagrams-3d/save', {
          method: 'POST',
          body: JSON.stringify({ diagramId: id })
        });
        setSavedDiagrams((prev) => ({ ...prev, [id]: true }));
      }
      triggerRefresh();
    } catch {}
  };

  // Generate 3D Diagram from user prompt
  const handleAiGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setIsGeneratingAi('Analyzing concept and preparing 3D diagram...');
    try {
      const res = await apiFetch('/api/diagrams-3d/generate', {
        method: 'POST',
        body: JSON.stringify({ prompt: aiPrompt })
      });
      if (res && res.diagram && res.diagram.id) {
        if (VERIFIED_MODEL_SPECS[res.diagram.id]) {
          setSelectedDiagramId(res.diagram.id);
        }
      }
    } catch {
      // Fallback: match by keywords
      const p = aiPrompt.toLowerCase();
      if (p.includes('lung') || p.includes('breath')) setSelectedDiagramId('human_lungs');
      else if (p.includes('circuit') || p.includes('electron') || p.includes('battery')) setSelectedDiagramId('electric_circuit');
      else if (p.includes('ear') || p.includes('sound') || p.includes('hearing')) setSelectedDiagramId('human_ear');
      else if (p.includes('torso') || p.includes('organ') || p.includes('skeleton')) setSelectedDiagramId('human_torso_anatomy');
      else if (p.includes('motor')) setSelectedDiagramId('electric_motor');
      else if (p.includes('orbit') || p.includes('solar')) setSelectedDiagramId('solar_system');
      else if (p.includes('dna')) setSelectedDiagramId('dna_helix');
      else setSelectedDiagramId('human_heart');
    } finally {
      setIsGeneratingAi('');
      setAiPrompt('');
    }
  };

  // Launch interactive diagram quiz
  const handleStartQuiz = async () => {
    try {
      const res = await apiFetch(`/api/diagrams-3d/quiz/${activeSpec.id}`);
      if (res && res.quiz) {
        setActiveQuiz(res.quiz);
        setQuizAnswers({});
        setQuizScore(null);
      }
    } catch {}
  };

  return (
    <div className="studyai-content-container" style={{ padding: '24px 20px', maxWidth: 1400, margin: '0 auto' }}>
      {/* 1. Page Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#FF6A00' }}>
                STUDYAI UNIVERSAL 3D STUDIO
              </span>
              <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 999, background: '#FFF3E8', color: '#FF6A00', fontWeight: 700 }}>
                Interactive Learning Engine
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#202124', margin: '4px 0 6px 0' }}>
              Interactive 3D Diagram Studio
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#6B7280', margin: 0 }}>
              Rotate 360°, inspect cross-sections, explode internal components, trace animated mechanisms, and master academic concepts.
            </p>
          </div>

          {/* AI Diagram Generator Prompt Input */}
          <form
            onSubmit={handleAiGenerate}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#FFFFFF',
              border: '1.5px solid rgba(255,106,0,0.35)',
              borderRadius: 999,
              padding: '4px 6px 4px 16px',
              boxShadow: '0 2px 12px rgba(255,106,0,0.08)'
            }}
          >
            <Sparkles size={16} color="#FF6A00" />
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Describe any diagram you want to explore..."
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '0.82rem',
                width: 240,
                color: '#202124'
              }}
            />
            <button
              type="submit"
              disabled={Boolean(isGeneratingAi)}
              className="btn-orange"
              style={{ padding: '7px 16px', fontSize: '0.78rem', borderRadius: 999 }}
            >
              <span>{isGeneratingAi ? 'Generating...' : 'AI Generate'}</span>
            </button>
          </form>
        </div>

        {/* Subject Categories & Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
          {/* Subject Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
            {SUBJECT_CATEGORIES.map((cat) => {
              const isActive = activeSubject === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveSubject(cat.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 999,
                    fontSize: '0.78rem',
                    fontWeight: isActive ? 700 : 500,
                    background: isActive ? '#FF6A00' : 'rgba(255,255,255,0.85)',
                    color: isActive ? '#FFFFFF' : '#4B5563',
                    border: isActive ? '1px solid #FF6A00' : '1px solid rgba(0,0,0,0.08)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: isActive ? '0 2px 8px rgba(255,106,0,0.25)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#FFFFFF',
              border: '1px solid rgba(0,0,0,0.12)',
              borderRadius: 999,
              padding: '6px 14px',
              minWidth: 220
            }}
          >
            <Search size={14} color="#9CA3AF" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search components, organs, circuits..."
              style={{ border: 'none', outline: 'none', fontSize: '0.8rem', width: '100%', color: '#202124' }}
            />
          </div>
        </div>
      </div>

      {/* 2. Main Studio Workspace Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '290px 1fr',
          gap: 18,
          alignItems: 'start'
        }}
      >
        {/* LEFT SIDEBAR: Diagram Catalog & Bookmarks */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 18,
            padding: 16,
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            maxHeight: 'calc(100vh - 220px)',
            overflowY: 'auto'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#202124' }}>
              Universal 3D Models ({filteredDiagramList.length})
            </span>
            <span style={{ fontSize: '0.7rem', color: '#FF6A00', fontWeight: 700 }}>
              {Object.keys(savedDiagrams).length} Saved
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredDiagramList.map((model) => {
              const isSelected = selectedDiagramId === model.id;
              const isSaved = Boolean(savedDiagrams[model.id]);
              return (
                <div
                  key={model.id}
                  onClick={() => setSelectedDiagramId(model.id)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 12,
                    background: isSelected ? '#FFF3E8' : '#F9FAFB',
                    border: isSelected ? '1.5px solid #FF6A00' : '1px solid #E5E7EB',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#202124', lineHeight: 1.3 }}>
                        {model.title.split(':')[0]}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#6B7280', marginTop: 3 }}>
                        {model.subject}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleToggleBookmark(model.id, e)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 2,
                        color: isSaved ? '#FF6A00' : '#9CA3AF'
                      }}
                      title={isSaved ? 'Remove bookmark' : 'Bookmark diagram'}
                    >
                      <Bookmark size={15} fill={isSaved ? '#FF6A00' : 'none'} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                    <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: 999, background: '#E0E7FF', color: '#3730A3', fontWeight: 600 }}>
                      {model.parts.length} parts
                    </span>
                    <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: 999, background: '#DCFCE7', color: '#166534', fontWeight: 600 }}>
                      6 modes
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Quiz Launcher Banner */}
          <div
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #FFF3E8 0%, #FED7AA 100%)',
              border: '1px solid rgba(255,106,0,0.25)',
              textAlign: 'center'
            }}
          >
            <Award size={24} color="#FF6A00" style={{ margin: '0 auto 6px auto' }} />
            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#202124' }}>
              Test Diagram Mastery
            </div>
            <div style={{ fontSize: '0.72rem', color: '#6B7280', margin: '4px 0 10px 0' }}>
              Take a 3-part interactive quiz on {activeSpec.title.split(':')[0]}
            </div>
            <button
              type="button"
              onClick={handleStartQuiz}
              className="btn-orange"
              style={{ width: '100%', padding: '6px 12px', fontSize: '0.78rem' }}
            >
              Start Diagram Quiz
            </button>
          </div>
        </div>

        {/* CENTER & RIGHT: The Interactive 3D WebGL Canvas Engine */}
        <div>
          <Interactive3DViewer
            key={selectedDiagramId}
            modelType={selectedDiagramId}
            onSelectComponent={(comp) => setActiveComponent(comp)}
          />

          {/* Bottom Interactive Component Grid */}
          <div
            style={{
              marginTop: 16,
              background: '#FFFFFF',
              borderRadius: 16,
              padding: 18,
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Compass size={18} color="#FF6A00" />
                <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#202124', margin: 0 }}>
                  Anatomical &amp; Structural Components ({activeSpec.parts.length})
                </h3>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#6B7280' }}>
                Click any part to inspect in 3D
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 10
              }}
            >
              {activeSpec.parts.map((part) => {
                const isSelected = (activeComponent?.id || activeSpec.parts[0]?.id) === part.id;
                return (
                  <div
                    key={part.id}
                    onClick={() => setActiveComponent(part)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 10,
                      background: isSelected ? '#FFF3E8' : '#F9FAFB',
                      border: isSelected ? '1.5px solid #FF6A00' : '1px solid #E5E7EB',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: part.color
                        }}
                      />
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#202124' }}>
                        {part.label}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#6B7280', lineHeight: 1.35 }}>
                      {part.role}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive Quiz Drawer Modal */}
      {activeQuiz && (
        <div className="glass-modal-overlay" role="dialog" aria-modal="true" aria-label="Diagram Quiz">
          <div className="glass-modal-content" style={{ maxWidth: 640, width: '92%', padding: 24, borderRadius: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#FF6A00', textTransform: 'uppercase' }}>
                  Interactive Assessment
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#202124', margin: 0 }}>
                  {activeSpec.title.split(':')[0]} Mastery Quiz
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveQuiz(null)}
                className="btn-glass"
                style={{ padding: '6px 10px' }}
              >
                ✕
              </button>
            </div>

            {/* Questions List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 380, overflowY: 'auto', paddingRight: 4 }}>
              {activeQuiz.questions?.map((q: any, qIdx: number) => (
                <div key={q.id || qIdx} style={{ padding: 14, borderRadius: 12, background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#202124', marginBottom: 10 }}>
                    {qIdx + 1}. {q.prompt}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {q.options?.map((opt: string, optIdx: number) => {
                      const isChosen = quizAnswers[q.id || qIdx] === optIdx;
                      const isCorrect = q.correctIndex === optIdx;
                      const showResult = quizScore !== null;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => {
                            if (quizScore === null) {
                              setQuizAnswers((prev) => ({ ...prev, [q.id || qIdx]: optIdx }));
                            }
                          }}
                          style={{
                            padding: '8px 12px',
                            borderRadius: 8,
                            textAlign: 'left',
                            fontSize: '0.8rem',
                            fontWeight: isChosen ? 700 : 500,
                            background: showResult
                              ? isCorrect
                                ? '#DCFCE7'
                                : isChosen
                                ? '#FEE2E2'
                                : '#FFFFFF'
                              : isChosen
                              ? '#FFF3E8'
                              : '#FFFFFF',
                            border: showResult
                              ? isCorrect
                                ? '1.5px solid #16A34A'
                                : isChosen
                                ? '1.5px solid #DC2626'
                                : '1px solid #E5E7EB'
                              : isChosen
                              ? '1.5px solid #FF6A00'
                              : '1px solid #E5E7EB',
                            color: '#202124',
                            cursor: quizScore === null ? 'pointer' : 'default'
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Quiz Submit Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 14, borderTop: '1px solid #E5E7EB' }}>
              <div>
                {quizScore !== null && (
                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#16A34A' }}>
                    Score: {quizScore} / {activeQuiz.questions?.length || 0} Correct!
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {quizScore === null ? (
                  <button
                    type="button"
                    onClick={() => {
                      let correct = 0;
                      activeQuiz.questions?.forEach((q: any, idx: number) => {
                        if (quizAnswers[q.id || idx] === q.correctIndex) correct++;
                      });
                      setQuizScore(correct);
                      // Record progress to backend
                      apiFetch('/api/diagrams-3d/progress', {
                        method: 'POST',
                        body: JSON.stringify({
                          diagramId: activeSpec.id,
                          exploredComponentIds: activeSpec.parts.map((p) => p.id),
                          quizScore: correct,
                          quizTotal: activeQuiz.questions?.length || 3
                        })
                      }).catch(() => {});
                    }}
                    className="btn-orange"
                    style={{ padding: '8px 18px', fontSize: '0.84rem' }}
                  >
                    Submit Answers
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveQuiz(null)}
                    className="btn-orange"
                    style={{ padding: '8px 18px', fontSize: '0.84rem' }}
                  >
                    Done
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Diagrams3DPage;
