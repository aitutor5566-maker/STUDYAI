import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Bot,
  Send,
  Volume2,
  Image as ImageIcon,
  Video,
  Box,
  FileText,
  HelpCircle,
  Gamepad2,
  Bookmark,
  Paperclip,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { TopBrandBar } from '../components/GlassNav';
import { Interactive3DViewer } from '../components/Interactive3DLab';
import { FuturisticIcon } from '../components/FuturisticIcons';
import { useLearning } from '../context/LearningContext';

export const TutorPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    apiFetch,
    activeTopic,
    setTopicContext,
    startAudioLesson,
    openImageStudio,
    openVideoStudio,
    openGamesHub,
    openQuizModal,
    triggerRefresh
  } = useLearning();

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>('conv-photosynthesis');
  const [messages, setMessages] = useState<any[]>([]);
  const [mode, setMode] = useState<'simple' | 'detailed'>('simple');
  const [questionInput, setQuestionInput] = useState<string>('');
  const [attachmentNote, setAttachmentNote] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [inline3DMsgId, setInline3DMsgId] = useState<string | null>(null);
  const [actionToast, setActionToast] = useState<string>('');

  // Load initial conversations and handle ?topic= query param
  useEffect(() => {
    const queryTopic = searchParams.get('topic');
    apiFetch<any[]>('/api/tutor/conversations')
      .then(async (list) => {
        setConversations(list);
        if (queryTopic && queryTopic.trim()) {
          const matching = list.find((c) => c.topic.toLowerCase() === queryTopic.trim().toLowerCase());
          if (matching) {
            loadConversation(matching.id);
          } else {
            await submitQuestion(`Explain ${queryTopic.trim()} in ${mode} terms`, queryTopic.trim(), null);
          }
        } else if (list.length > 0) {
          loadConversation(list[0].id);
        }
      })
      .catch(() => {});
  }, [searchParams.get('topic')]);

  const loadConversation = async (convId: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await apiFetch(`/api/tutor/conversations/${convId}`);
      setActiveConvId(convId);
      const loadedMsgs = data.messages || [];
      setMessages(loadedMsgs);
      const lastAssistant = [...loadedMsgs].reverse().find((m: any) => m.role === 'assistant');
      if (lastAssistant) {
        setInline3DMsgId(lastAssistant.id);
      }
      if (data.conversation?.topic) {
        setTopicContext(data.conversation.topic, data.conversation.subject, data.conversation.mode);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not load conversation.');
    } finally {
      setLoading(false);
    }
  };

  const submitQuestion = async (rawQuestion: string, topicOverride?: string, convIdOverride?: string | null) => {
    const cleanQ = rawQuestion.trim();
    if (!cleanQ) {
      setErrorMsg('Please type a topic or question before sending.');
      return;
    }
    setLoading(true);
    setErrorMsg('');

    try {
      const targetConvId = convIdOverride !== undefined ? convIdOverride : activeConvId;
      const res = await apiFetch('/api/tutor/ask', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: targetConvId,
          topic: topicOverride || cleanQ,
          question: cleanQ,
          mode,
          attachmentSummary: attachmentNote || undefined
        })
      });
      setActiveConvId(res.conversationId);
      const nextMsgs = res.messages || [];
      setMessages(nextMsgs);
      const latestAssistant = [...nextMsgs].reverse().find((m: any) => m.role === 'assistant');
      if (latestAssistant) {
        setInline3DMsgId(latestAssistant.id);
      }
      setQuestionInput('');
      setAttachmentNote('');
      await setTopicContext(res.topic, res.subject, mode);

      const updatedConvs = await apiFetch<any[]>('/api/tutor/conversations');
      setConversations(updatedConvs);
      triggerRefresh();
    } catch (err: any) {
      // Preserve student's input on failure (Section 9 requirement)
      setErrorMsg(err?.message || 'Unable to reach AI Tutor. Your question has been preserved — click Retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitQuestion(questionInput);
  };

  const handleSaveAsNotes = async (structured: any) => {
    const targetTopic = structured?.topic || activeTopic;
    setActionToast(`Saving "${targetTopic}" to AI Notes...`);
    try {
      const created = await apiFetch('/api/notes/generate', {
        method: 'POST',
        body: JSON.stringify({
          topic: targetTopic,
          subject: structured?.subject || 'Science',
          depth: mode === 'detailed' ? 'detailed' : 'concise'
        })
      });
      triggerRefresh();
      setActionToast(`Saved "${targetTopic}" to AI Notes!`);
      setTimeout(() => navigate(`/notes?id=${created.id}`), 600);
    } catch {
      setActionToast('Could not save note.');
    }
  };

  const handleSaveToLibrary = async (structured: any) => {
    const targetTopic = structured?.topic || activeTopic;
    await apiFetch('/api/library', {
      method: 'POST',
      body: JSON.stringify({
        title: `${targetTopic} — AI Tutor Explanation`,
        topic: targetTopic,
        subject: structured?.subject || 'Science',
        resource_type: 'explanation',
        summary: structured?.recap || structured?.introduction || '',
        content: structured
      })
    });
    triggerRefresh();
    setActionToast(`Saved "${targetTopic}" to Library!`);
    setTimeout(() => setActionToast(''), 3000);
  };

  const handleAttachmentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Attachment exceeds 5 MB limit.');
      return;
    }
    setAttachmentNote(`${file.name} (${Math.round(file.size / 1024)} KB)`);
  };

  return (
    <div className="studyai-container">
      <TopBrandBar showBack />

      {/* AI Tutor Header & Mode Controls */}
      <section style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <FuturisticIcon name="tutor" size={46} />
          <div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#202124' }}>AI Tutor Studio</h1>
            <p style={{ fontSize: '0.84rem', color: '#6B7280' }}>
              Detailed Explanations • Definitions • Differences • Keywords • Key Points • 3D &amp; Visual Diagrams
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Simple vs Detailed Mode Toggle */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.8)', padding: 4, borderRadius: 999, border: '1px solid rgba(255,106,0,0.22)' }}>
            {(['simple', 'detailed'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 999,
                  border: 'none',
                  background: mode === m ? '#FF6A00' : 'transparent',
                  color: mode === m ? '#FFFFFF' : '#6B7280',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {m} Mode
              </button>
            ))}
          </div>

          {/* Conversation Switcher */}
          <select
            aria-label="Conversation History"
            value={activeConvId}
            onChange={(e) => {
              if (e.target.value === 'new') {
                setActiveConvId('');
                setMessages([]);
              } else {
                loadConversation(e.target.value);
              }
            }}
            style={{ padding: '8px 12px', borderRadius: 999, border: '1px solid rgba(0,0,0,0.12)', background: '#FFFFFF', fontSize: '0.8rem', fontWeight: 600 }}
          >
            {conversations.map((c) => (
              <option key={c.id} value={c.id}>
                Topic: {c.topic}
              </option>
            ))}
            <option value="new">+ Start New Topic Conversation</option>
          </select>
        </div>
      </section>

      {actionToast && (
        <div style={{ padding: '10px 16px', borderRadius: 14, background: '#ECFDF5', color: '#047857', fontWeight: 700, fontSize: '0.85rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={16} />
          <span>{actionToast}</span>
        </div>
      )}

      {/* Conversation Thread */}
      <section style={{ display: 'grid', gap: 18, marginBottom: 22 }}>
        {messages.length === 0 && !loading && (
          <div className="glass-card" style={{ padding: 28, textAlign: 'center' }}>
            <Sparkles size={32} color="#FF6A00" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: 8 }}>What topic would you like to master today?</h2>
            <p style={{ fontSize: '0.88rem', color: '#6B7280', marginTop: 4, marginBottom: 16 }}>
              Choose a suggested question below or type any concept in Science, Maths, History, or English.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 8 }}>
              {[
                'Explain photosynthesis in simple terms',
                'How do we solve Quadratic Equations using the discriminant?',
                'Explain how the 4 chambers of the Human Heart pump blood',
                'Explain Kepler’s Laws and the Solar System orbits'
              ].map((sq) => (
                <button
                  key={sq}
                  type="button"
                  onClick={() => submitQuestion(sq, sq, null)}
                  className="btn-glass"
                  style={{ fontSize: '0.82rem' }}
                >
                  {sq}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => {
          if (msg.role === 'user') {
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    background: 'linear-gradient(135deg, #FFF3E8 0%, #FFE4CC 100%)',
                    border: '1px solid rgba(255, 106, 0, 0.25)',
                    padding: '12px 18px',
                    borderRadius: '20px 20px 6px 20px',
                    fontWeight: 700,
                    fontSize: '0.94rem',
                    color: '#202124',
                    maxWidth: 560,
                    boxShadow: '0 4px 14px rgba(255, 106, 0, 0.08)'
                  }}
                >
                  {msg.content}
                </div>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FFE4CC 0%, #FF9E44 100%)',
                    border: '2px solid #FFFFFF',
                    boxShadow: '0 4px 10px rgba(255,106,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    color: '#202124',
                    flexShrink: 0
                  }}
                >
                  VS
                </div>
              </div>
            );
          }

          const s = msg.structured;
          const showInline3D = inline3DMsgId === msg.id;
          const keywordsList: string[] =
            Array.isArray(s?.keywords) && s.keywords.length > 0
              ? s.keywords
              : [
                  s?.topic || activeTopic,
                  s?.subject || 'Science',
                  ...(s?.definitions || []).map((d: any) => d.term),
                  ...(s?.formula?.reactants || []).map((r: any) => r.label)
                ]
                  .filter(Boolean)
                  .slice(0, 7);

          const diffTable =
            s?.differences && Array.isArray(s.differences.rows) && s.differences.rows.length > 0
              ? s.differences
              : s?.definitions?.length >= 2
              ? {
                  titleA: s.definitions[0].term,
                  titleB: s.definitions[1].term,
                  rows: [
                    {
                      aspect: 'Definition & Role',
                      itemA: s.definitions[0].definition,
                      itemB: s.definitions[1].definition
                    },
                    {
                      aspect: 'Process Stage',
                      itemA: s.keySteps?.[0] || 'Initial mechanism phase',
                      itemB: s.keySteps?.[1] || 'Subsequent transformation phase'
                    }
                  ]
                }
              : null;

          return (
            <div key={msg.id} className="glass-card" style={{ padding: 24, border: '1.5px solid rgba(255, 106, 0, 0.28)' }}>
              {/* Tutor Avatar + Topic Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FuturisticIcon name="tutor" size={38} />
                  <div>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#202124' }}>{s?.topic || activeTopic}</span>
                    <span style={{ marginLeft: 8, padding: '3px 10px', borderRadius: 999, background: 'linear-gradient(135deg, #FF6A00 0%, #EA580C 100%)', color: '#FFFFFF', fontSize: '0.72rem', fontWeight: 800 }}>
                      {s?.subject || 'Science'}
                    </span>
                  </div>
                </div>
                {s?.providerName && (
                  <span style={{ fontSize: '0.73rem', fontWeight: 700, color: '#EA580C', background: '#FFF7ED', padding: '4px 10px', borderRadius: 999, border: '1px solid rgba(255,106,0,0.25)' }}>
                    ⚡ Verified AI: {s.providerName}
                  </span>
                )}
              </div>

              {/* 1. Detailed Explanation & Overview */}
              <div
                style={{
                  padding: '14px 18px',
                  borderRadius: 18,
                  background: 'linear-gradient(135deg, #FFFDFB 0%, #FFF7ED 100%)',
                  border: '1px solid rgba(255, 106, 0, 0.22)',
                  marginBottom: 16
                }}
              >
                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#FF6A00', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                  📖 Detailed Concept Explanation
                </div>
                <p style={{ fontSize: '0.96rem', lineHeight: 1.68, color: '#202124', margin: 0 }}>
                  {s?.introduction || msg.content}
                </p>
              </div>

              {/* 2. Keywords & Exam Terminology Bar */}
              {keywordsList.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.84rem', color: '#202124', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#FF6A00' }}>🏷️</span> Key Terminology &amp; Keywords:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {keywordsList.map((kw: string, idx: number) => (
                      <span key={idx} className="keyword-pill-orange">
                        ✦ {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Key Points & Step-by-Step Mechanism */}
              {s?.keySteps?.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#202124', marginBottom: 10 }}>
                    ⚡ Key Points &amp; Step-by-Step Mechanism:
                  </div>
                  <div style={{ display: 'grid', gap: 10 }}>
                    {s.keySteps.map((step: string, idx: number) => (
                      <div key={idx} className="futuristic-step-card">
                        <div style={{ fontSize: '0.9rem', lineHeight: 1.55, color: '#1F2937' }}>
                          <strong style={{ color: '#FF6A00', fontWeight: 900, marginRight: 6 }}>Point {idx + 1}:</strong>
                          {step}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Core Definitions Grid */}
              {s?.definitions?.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#202124', marginBottom: 10 }}>
                    📘 Core Definitions:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                    {s.definitions.map((d: any, idx: number) => (
                      <div
                        key={idx}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 16,
                          background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)',
                          border: '1.5px solid rgba(255, 106, 0, 0.28)',
                          fontSize: '0.84rem',
                          boxShadow: '0 4px 12px rgba(255, 106, 0, 0.06)'
                        }}
                      >
                        <div style={{ fontWeight: 800, color: '#EA580C', fontSize: '0.88rem', marginBottom: 4 }}>
                          🔹 {d.term}
                        </div>
                        <div style={{ color: '#374151', lineHeight: 1.48 }}>{d.definition}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Key Differences & Comparison Table */}
              {diffTable && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#202124', marginBottom: 10 }}>
                    ⚖️ Key Differences &amp; Comparison ({diffTable.titleA} vs. {diffTable.titleB}):
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="futuristic-diff-table">
                      <thead>
                        <tr>
                          <th style={{ width: '24%' }}>Comparison Aspect</th>
                          <th style={{ width: '38%' }}>{diffTable.titleA}</th>
                          <th style={{ width: '38%' }}>{diffTable.titleB}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {diffTable.rows.map((r: any, idx: number) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 800, color: '#EA580C' }}>{r.aspect}</td>
                            <td>{r.itemA}</td>
                            <td>{r.itemB}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 6. Highlighted Equation / Formula Card */}
              {s?.formula && (
                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: 18,
                    background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
                    border: '2px solid rgba(255, 106, 0, 0.38)',
                    marginBottom: 18,
                    textAlign: 'center',
                    boxShadow: '0 8px 20px rgba(255, 106, 0, 0.12)'
                  }}
                >
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#EA580C', textTransform: 'uppercase', marginBottom: 4 }}>
                    ⚡ Governing Formula / Equation
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#202124', letterSpacing: '0.01em', marginBottom: 8 }}>
                    {s.formula.equation}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 16, fontSize: '0.78rem', color: '#4B5563', fontWeight: 700 }}>
                    {[...(s.formula.reactants || []), ...(s.formula.products || [])].map((item: any, idx: number) => (
                      <span key={idx}>
                        <strong style={{ color: '#FF6A00' }}>{item.symbol}:</strong> {item.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. Visual Image Diagram for Every AI Tutor Explanation */}
              <div
                style={{
                  borderRadius: 20,
                  overflow: 'hidden',
                  border: '2px solid rgba(255,106,0,0.3)',
                  marginBottom: 16,
                  background: '#FFFDFB',
                  boxShadow: '0 10px 28px rgba(255, 106, 0, 0.12)',
                  position: 'relative'
                }}
              >
                <div style={{ padding: '8px 14px', background: 'linear-gradient(90deg, #FF6A00 0%, #FF8533 100%)', color: '#FFFFFF', fontSize: '0.78rem', fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>🖼️ Scientific Diagram &amp; Visual Illustration: {s?.topic || activeTopic}</span>
                  <span>2D Visual Blueprint</span>
                </div>
                {s?.imageUrl && (
                  <img
                    src={s.imageUrl}
                    alt={s.imageCaption || `${s.topic || activeTopic} Visual Illustration`}
                    style={{
                      width: '100%',
                      maxHeight: 340,
                      objectFit: 'contain',
                      display: 'block',
                      padding: 6
                    }}
                  />
                )}
                <div
                  style={{
                    padding: '10px 14px',
                    background: 'rgba(255, 243, 232, 0.95)',
                    borderTop: '1px solid rgba(255, 106, 0, 0.16)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 8,
                    fontSize: '0.82rem',
                    color: '#202124'
                  }}
                >
                  <div>
                    <strong style={{ color: '#E85D00' }}>💡 Real-World Analogy:</strong> {s?.analogies}
                  </div>
                  <button
                    type="button"
                    onClick={() => openImageStudio(s?.topic || activeTopic)}
                    style={{
                      border: '1px solid rgba(255,106,0,0.35)',
                      background: '#FFFFFF',
                      color: '#FF6A00',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      padding: '5px 12px',
                      borderRadius: 999,
                      cursor: 'pointer'
                    }}
                  >
                    ✨ Open Full Image Studio
                  </button>
                </div>
              </div>

              {/* Primary Media Bar right under explanation: Listen | Image | Video | 3D Model */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                <button
                  type="button"
                  onClick={() =>
                    startAudioLesson({
                      topic: s?.topic || activeTopic,
                      text: `${s?.introduction || ''} ${(s?.keySteps || []).join(' ')} ${s?.recap || ''}`
                    })
                  }
                  className="btn-glass"
                  style={{ fontSize: '0.8rem', padding: '8px 14px' }}
                >
                  <Volume2 size={15} color="#FF6A00" />
                  <span>Listen</span>
                </button>

                <button
                  type="button"
                  onClick={() => openImageStudio(s?.topic || activeTopic)}
                  className="btn-glass"
                  style={{ fontSize: '0.8rem', padding: '8px 14px' }}
                >
                  <ImageIcon size={15} color="#16A34A" />
                  <span>Image</span>
                </button>

                <button
                  type="button"
                  onClick={() => openVideoStudio(s?.topic || activeTopic)}
                  className="btn-glass"
                  style={{ fontSize: '0.8rem', padding: '8px 14px' }}
                >
                  <Video size={15} color="#7C3AED" />
                  <span>Video</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInline3DMsgId(showInline3D ? null : msg.id)}
                  className="btn-orange"
                  style={{ fontSize: '0.8rem', padding: '8px 14px' }}
                >
                  <Box size={15} />
                  <span>{showInline3D ? 'Hide 3D Model' : '3D Model'}</span>
                </button>
              </div>

              {/* Inline 3D Learning Lab directly inside AI Tutor conversation (Section 13 requirement) */}
              {showInline3D && (
                <div style={{ marginBottom: 16 }}>
                  <Interactive3DViewer
                    topic={s?.topic || activeTopic}
                    modelType={s?.model3dType}
                    compact
                    onClose={() => setInline3DMsgId(null)}
                  />
                </div>
              )}

              {/* "You can also..." Connected Topic Actions (matching screenshot) */}
              <div style={{ padding: 14, borderRadius: 18, background: '#FFFDF9', border: '1px solid rgba(255,106,0,0.18)' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#6B7280', marginBottom: 10 }}>
                  You can also...
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => handleSaveAsNotes(s)}
                    className="btn-glass"
                    style={{ justifyContent: 'flex-start', fontSize: '0.82rem' }}
                  >
                    <FileText size={15} color="#FF6A00" />
                    <span>Save as Notes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openQuizModal(s?.topic || activeTopic, s?.subject)}
                    className="btn-glass"
                    style={{ justifyContent: 'flex-start', fontSize: '0.82rem' }}
                  >
                    <HelpCircle size={15} color="#FF6A00" />
                    <span>Generate Quiz</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openGamesHub(s?.topic || activeTopic, s?.subject)}
                    className="btn-glass"
                    style={{ justifyContent: 'flex-start', fontSize: '0.82rem' }}
                  >
                    <Gamepad2 size={15} color="#FF6A00" />
                    <span>Start Game</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveToLibrary(s)}
                    className="btn-glass"
                    style={{ justifyContent: 'flex-start', fontSize: '0.82rem' }}
                  >
                    <Bookmark size={15} color="#FF6A00" />
                    <span>More (Save to Library)</span>
                  </button>
                </div>

                {/* Suggested Follow-Up Question Pills */}
                {s?.suggestedFollowUps?.length > 0 && (
                  <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {s.suggestedFollowUps.map((fq: string, i: number) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => submitQuestion(fq)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: 999,
                          border: '1px solid rgba(255,106,0,0.25)',
                          background: '#FFF3E8',
                          color: '#E85D00',
                          fontSize: '0.76rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        ↳ {fq}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="glass-card" style={{ padding: 20, textAlign: 'center', color: '#FF6A00', fontWeight: 700 }}>
            AI Tutor is preparing your step-by-step explanation...
          </div>
        )}

        {errorMsg && (
          <div style={{ padding: 14, borderRadius: 16, background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.86rem', fontWeight: 600 }}>
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
            <button type="button" onClick={() => submitQuestion(questionInput || 'Explain photosynthesis')} className="btn-orange" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
              <RotateCcw size={14} /> Retry
            </button>
          </div>
        )}
      </section>

      {/* Bottom Follow-Up Question Input Bar */}
      <form onSubmit={handleFormSubmit} className="glass-card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
        <label
          title="Attach image or study document"
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: '#FFF3E8',
            color: '#FF6A00',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <Paperclip size={18} />
          <input type="file" accept=".txt,.md,.pdf,.png,.jpg,.jpeg" onChange={handleAttachmentSelect} style={{ display: 'none' }} />
        </label>

        <input
          className="glass-input"
          value={questionInput}
          onChange={(e) => setQuestionInput(e.target.value)}
          placeholder={attachmentNote ? `Attached: ${attachmentNote} — Ask a question...` : 'Ask a follow-up question or enter any new topic...'}
          aria-label="Ask AI Tutor a question"
        />

        <button
          type="submit"
          disabled={loading}
          aria-label="Send Question"
          className="btn-orange"
          style={{ width: 44, height: 44, padding: 0, borderRadius: '50%', flexShrink: 0 }}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};
