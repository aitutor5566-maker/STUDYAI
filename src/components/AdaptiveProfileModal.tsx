import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  CheckCircle2,
  BookOpen,
  Volume2,
  HelpCircle,
  Eye,
  Edit3,
  Brain,
  Sparkles,
  Layers,
  Calculator,
  RotateCcw
} from 'lucide-react';

export interface StudentAdaptiveProfile {
  difficult_subjects: string[];
  difficult_topics: string[];
  reading_difficulty: boolean;
  spelling_difficulty: boolean;
  writing_difficulty: boolean;
  vocabulary_difficulty: boolean;
  concept_difficulty: boolean;
  memory_difficulty: boolean;
  math_calculation_difficulty: boolean;
  diagram_difficulty?: boolean;
  long_explanation_difficulty?: boolean;
  step_by_step_difficulty?: boolean;
  explanation_style: 'concise' | 'balanced' | 'deep' | 'visual_first';
  preferred_learning_methods: string[];
  topic_understanding?: Record<string, { score: number; status: string; lastAssessed?: string }>;
  recent_feedback?: Array<{ topic: string; rating: string; comment?: string; date: string }>;
}

const DEFAULT_PROFILE: StudentAdaptiveProfile = {
  difficult_subjects: [],
  difficult_topics: [],
  reading_difficulty: false,
  spelling_difficulty: false,
  writing_difficulty: false,
  vocabulary_difficulty: false,
  concept_difficulty: false,
  memory_difficulty: false,
  math_calculation_difficulty: false,
  diagram_difficulty: false,
  long_explanation_difficulty: false,
  step_by_step_difficulty: false,
  explanation_style: 'balanced',
  preferred_learning_methods: ['diagrams', 'examples']
};

const SUBJECT_OPTIONS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Science (General)',
  'Social Studies',
  'English',
  'Computer Science'
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  apiFetch: <T = any>(endpoint: string, options?: RequestInit) => Promise<T>;
  onProfileUpdated?: (profile: StudentAdaptiveProfile) => void;
}

export const AdaptiveProfileModal: React.FC<Props> = ({
  isOpen,
  onClose,
  apiFetch,
  onProfileUpdated
}) => {
  const [profile, setProfile] = useState<StudentAdaptiveProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [newTopicInput, setNewTopicInput] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setSavedSuccess(false);
    apiFetch<{ user_id: string; adaptive_profile: StudentAdaptiveProfile }>('/api/tutor/adaptive-profile')
      .then((res) => {
        if (res && res.adaptive_profile) {
          setProfile({
            ...DEFAULT_PROFILE,
            ...res.adaptive_profile
          });
        }
      })
      .catch(() => {
        // Fallback default
        setProfile(DEFAULT_PROFILE);
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleSubject = (subj: string) => {
    setProfile((prev) => {
      const exists = prev.difficult_subjects.includes(subj);
      return {
        ...prev,
        difficult_subjects: exists
          ? prev.difficult_subjects.filter((s) => s !== subj)
          : [...prev.difficult_subjects, subj]
      };
    });
  };

  const addDifficultTopic = () => {
    const trimmed = newTopicInput.trim();
    if (!trimmed) return;
    if (!profile.difficult_topics.includes(trimmed)) {
      setProfile((prev) => ({
        ...prev,
        difficult_topics: [...prev.difficult_topics, trimmed]
      }));
    }
    setNewTopicInput('');
  };

  const removeDifficultTopic = (topicToRemove: string) => {
    setProfile((prev) => ({
      ...prev,
      difficult_topics: prev.difficult_topics.filter((t) => t !== topicToRemove)
    }));
  };

  const toggleLearningMethod = (method: string) => {
    setProfile((prev) => {
      const exists = prev.preferred_learning_methods.includes(method);
      return {
        ...prev,
        preferred_learning_methods: exists
          ? prev.preferred_learning_methods.filter((m) => m !== method)
          : [...prev.preferred_learning_methods, method]
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiFetch('/api/tutor/adaptive-profile', {
        method: 'PUT',
        body: JSON.stringify(profile)
      });
      setSavedSuccess(true);
      if (onProfileUpdated) {
        onProfileUpdated(profile);
      }
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 900);
    } catch (err) {
      console.error('Failed to save adaptive profile', err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setProfile(DEFAULT_PROFILE);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 680,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#FFFFFF',
          borderRadius: 24,
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          border: '1.5px solid rgba(255, 106, 0, 0.25)'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #FF6A00 0%, #EA580C 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}
            >
              <Sliders size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                Personalised Learning Profile
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B' }}>
                Tune your AI Tutor to your learning strengths, reading pace, and preferred explanation style.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 8
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#64748B' }}>
              Loading your personalised learning preferences...
            </div>
          ) : (
            <>
              {/* Explanation Style Selector */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: 8 }}>
                  🎯 Preferred Explanation Depth &amp; Length:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
                  {[
                    { key: 'concise', label: 'Concise & Short', desc: 'Direct, clear, meaning-preserving, no fluff' },
                    { key: 'balanced', label: 'Balanced (Default)', desc: 'Medium-sized explanations with 1 example' },
                    { key: 'deep', label: 'Deep Academic', desc: 'Thorough derivations, formal definitions' },
                    { key: 'visual_first', label: 'Visual First', desc: 'Diagrams & 3D models prioritized before text' }
                  ].map((opt) => (
                    <div
                      key={opt.key}
                      onClick={() => setProfile((prev) => ({ ...prev, explanation_style: opt.key as any }))}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 14,
                        border: `2px solid ${profile.explanation_style === opt.key ? '#FF6A00' : '#E2E8F0'}`,
                        background: profile.explanation_style === opt.key ? '#FFF7ED' : '#F8FAFC',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: profile.explanation_style === opt.key ? '#EA580C' : '#1E293B' }}>
                        {opt.label}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: 2, lineHeight: 1.3 }}>
                        {opt.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learning Needs & Weakness Adaptations */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: 6 }}>
                  🧠 Areas Where You Want Special Adaptive Support:
                </label>
                <p style={{ margin: '0 0 10px', fontSize: '0.74rem', color: '#64748B' }}>
                  Select any areas where you find learning challenging. The AI Tutor adapts formatting automatically.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
                  {[
                    {
                      key: 'reading_difficulty',
                      title: 'Reading dense text is difficult',
                      desc: 'Use shorter sentences (<18 words), smaller sections, plain language, and highlight audio.'
                    },
                    {
                      key: 'spelling_difficulty',
                      title: 'Spelling scientific terms is tricky',
                      desc: 'Provide gentle spelling notes without shaming or interrupting your learning flow.'
                    },
                    {
                      key: 'writing_difficulty',
                      title: 'Writing structured exam answers',
                      desc: 'Provide guided answer templates, step-by-step writing frameworks, and model phrasing.'
                    },
                    {
                      key: 'vocabulary_difficulty',
                      title: 'Unfamiliar scientific vocabulary',
                      desc: 'Retain terminology but explain difficult words separately with pronunciation and meaning.'
                    },
                    {
                      key: 'concept_difficulty',
                      title: 'Abstract or invisible concepts',
                      desc: 'Anchor explanations with labeled visual diagrams and interactive 3D WebGL models.'
                    },
                    {
                      key: 'memory_difficulty',
                      title: 'Remembering & quick revision',
                      desc: 'Include rapid takeaway bullet points, memory hooks, and self-check revision questions.'
                    },
                    {
                      key: 'math_calculation_difficulty',
                      title: 'Math & formula calculations',
                      desc: 'Break every mathematical equation and numerical derivation into numbered micro-steps.'
                    },
                    {
                      key: 'diagram_difficulty',
                      title: 'Understanding diagrams & spatial models',
                      desc: 'Break diagrams into labelled components and explain the exact biological/physical function of each part.'
                    },
                    {
                      key: 'long_explanation_difficulty',
                      title: 'Following long explanations',
                      desc: 'Chunk explanations into self-contained single-concept steps with checkpoint questions.'
                    },
                    {
                      key: 'step_by_step_difficulty',
                      title: 'Following complex solutions',
                      desc: 'Explicitly explain the reasoning behind each intermediate step without skipping arithmetic.'
                    }
                  ].map((item) => {
                    const isChecked = Boolean((profile as any)[item.key]);
                    return (
                      <div
                        key={item.key}
                        onClick={() =>
                          setProfile((prev) => ({
                            ...prev,
                            [item.key]: !isChecked
                          }))
                        }
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          padding: '10px 14px',
                          borderRadius: 14,
                          border: `1.5px solid ${isChecked ? '#FF6A00' : '#E2E8F0'}`,
                          background: isChecked ? '#FFFDFB' : '#FFFFFF',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          style={{ marginTop: 2, accentColor: '#FF6A00' }}
                        />
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isChecked ? '#EA580C' : '#1E293B' }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748B', lineHeight: 1.35, marginTop: 2 }}>
                            {item.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Difficult Subjects */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: 6 }}>
                  📚 Subjects You Find Most Difficult:
                </label>
                <p style={{ margin: '0 0 8px', fontSize: '0.74rem', color: '#64748B' }}>
                  When teaching these subjects, AI Tutor will explain foundational prerequisites first.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {SUBJECT_OPTIONS.map((subj) => {
                    const isSelected = profile.difficult_subjects.includes(subj);
                    return (
                      <button
                        key={subj}
                        type="button"
                        onClick={() => toggleSubject(subj)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 999,
                          border: `1.5px solid ${isSelected ? '#EA580C' : '#CBD5E1'}`,
                          background: isSelected ? '#FF6A00' : '#F8FAFC',
                          color: isSelected ? '#FFFFFF' : '#334155',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {subj}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficult Topics List */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: 6 }}>
                  🔍 Specific Challenging Topics:
                </label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    type="text"
                    value={newTopicInput}
                    onChange={(e) => setNewTopicInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addDifficultTopic();
                      }
                    }}
                    placeholder="e.g. Quadratic Equations, Photosynthesis, Organic Chemistry"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 10,
                      border: '1px solid #CBD5E1',
                      fontSize: '0.8rem'
                    }}
                  />
                  <button
                    type="button"
                    onClick={addDifficultTopic}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 10,
                      background: '#0F172A',
                      color: '#FFFFFF',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Add Topic
                  </button>
                </div>

                {profile.difficult_topics.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {profile.difficult_topics.map((top) => (
                      <span
                        key={top}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '4px 10px',
                          borderRadius: 999,
                          background: '#EFF6FF',
                          color: '#1E40AF',
                          border: '1px solid #BFDBFE',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                      >
                        {top}
                        <button
                          type="button"
                          onClick={() => removeDifficultTopic(top)}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B', fontWeight: 800 }}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Preferred Learning Methods */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: 6 }}>
                  💡 Preferred Learning Methods:
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { id: 'diagrams', label: '📊 Labeled Diagrams' },
                    { id: 'images', label: '🖼️ Real-World Images' },
                    { id: 'audio', label: '🎙️ Spoken Audio Lessons' },
                    { id: 'examples', label: '🌍 Everyday Examples & Analogies' },
                    { id: 'written', label: '✍️ Written Step-by-Step' }
                  ].map((m) => {
                    const isSelected = profile.preferred_learning_methods.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => toggleLearningMethod(m.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 10,
                          border: `1.5px solid ${isSelected ? '#0284C7' : '#E2E8F0'}`,
                          background: isSelected ? '#F0F9FF' : '#FFFFFF',
                          color: isSelected ? '#0284C7' : '#475569',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          cursor: 'pointer'
                        }}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Honest Disclaimer */}
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: '#F1F5F9',
                  color: '#475569',
                  fontSize: '0.72rem',
                  lineHeight: 1.45
                }}
              >
                ℹ️ <strong>Educational Notice:</strong> This profile personalises your AI Tutor’s teaching speed, sentence complexity, and visual scaffolding. It is designed solely for adaptive learning pedagogy and does not diagnose medical or cognitive conditions. You can update or reset this anytime.
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#F8FAFC'
          }}
        >
          <button
            type="button"
            onClick={handleReset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              border: 'none',
              background: 'transparent',
              color: '#64748B',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={14} />
            <span>Reset to Default</span>
          </button>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-glass"
              style={{ fontSize: '0.8rem', padding: '8px 16px' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn-orange"
              style={{ fontSize: '0.8rem', padding: '8px 20px' }}
            >
              {saving ? 'Saving...' : savedSuccess ? '✓ Saved!' : 'Save & Adapt Tutor'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
