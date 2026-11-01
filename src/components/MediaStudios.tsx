import React, { useEffect, useState } from 'react';
import { Image as ImageIcon, Video, Play, Pause, RotateCcw, AlertCircle, CheckCircle2, X, Sparkles, Volume2 } from 'lucide-react';
import { useLearning } from '../context/LearningContext';

export const ImageGenerationModal: React.FC = () => {
  const { modalImage, closeImageStudio, apiFetch, triggerRefresh } = useLearning();
  const [topic, setTopic] = useState(modalImage.topic || 'Photosynthesis');
  const [style, setStyle] = useState('Scientific Labeled Diagram');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{
    jobId: string;
    imageUrl: string;
    caption: string;
    limitationNote: string;
    explanation?: {
      whatItShows: string;
      importantParts: string[];
      partFunctions: Array<{ part: string; role: string }>;
      howPartsConnect: string;
      processStages: string[];
      whyItMatters: string;
      whatToRemember: string;
    };
    validation?: {
      exists: boolean;
      decodable: boolean;
      matchesTopic: boolean;
      labelsVerified: boolean;
      byteLength: number;
    };
    resourceId?: string;
  } | null>(null);

  useEffect(() => {
    if (modalImage.open) {
      const nextTopic = modalImage.topic || 'Photosynthesis';
      setTopic(nextTopic);
      setError('');
      setResult((prev) => (prev && prev.caption?.toLowerCase().includes(nextTopic.toLowerCase()) ? prev : null));
    }
  }, [modalImage.open, modalImage.topic]);

  if (!modalImage.open) return null;

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      setError('Please enter a valid educational topic.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/api/media/image', {
        method: 'POST',
        body: JSON.stringify({ topic: topic.trim(), style, saveToLibrary: true })
      });
      setResult(res);
      triggerRefresh();
    } catch (err: any) {
      setError(err?.message || 'Image generation failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-modal-overlay" role="dialog" aria-modal="true" aria-label="AI Educational Image Studio">
      <div className="glass-modal-content" style={{ maxWidth: 740 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FFF3E8', color: '#FF6A00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ImageIcon size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>AI Educational Image & Diagram Studio</h2>
              <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Generate labeled scientific diagrams and visual schematics saved directly to your Library</p>
            </div>
          </div>
          <button type="button" onClick={closeImageStudio} className="btn-glass" style={{ padding: '6px 10px' }} aria-label="Close Image Studio">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleGenerate} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 10, marginBottom: 16 }}>
          <div className="glass-input-wrap">
            <input
              className="glass-input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter topic (e.g., Photosynthesis, Quadratic Parabola, Human Heart)..."
              aria-label="Image Topic"
            />
          </div>
          <select
            aria-label="Diagram Style"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            style={{ padding: '10px 14px', borderRadius: 999, border: '1px solid rgba(255,106,0,0.3)', background: '#FFF3E8', fontWeight: 600, fontSize: '0.85rem' }}
          >
            <option value="Scientific Labeled Diagram">Scientific Labeled Diagram</option>
            <option value="Mathematical Graph & Roots">Mathematical Graph & Roots</option>
            <option value="Concept Architecture Map">Concept Architecture Map</option>
          </select>
          <button type="submit" className="btn-orange" disabled={loading}>
            <Sparkles size={16} />
            <span>{loading ? 'Generating...' : 'Generate Visual'}</span>
          </button>
        </form>

        {error && (
          <div style={{ padding: 12, borderRadius: 14, background: '#FEF2F2', color: '#DC2626', fontSize: '0.86rem', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{error}</span>
            <button type="button" onClick={() => handleGenerate()} className="btn-glass" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
              Retry
            </button>
          </div>
        )}

        {loading && (
          <div style={{ padding: 36, textAlign: 'center', background: '#FFFDFB', borderRadius: 20, border: '1px dashed rgba(255,106,0,0.35)' }}>
            <div style={{ fontWeight: 700, color: '#FF6A00', marginBottom: 6 }}>Synthesizing Scientific Diagram for "{topic}"...</div>
            <div style={{ fontSize: '0.82rem', color: '#6B7280' }}>Validating labels, equations, and saving asset to your Library...</div>
          </div>
        )}

        {!loading && result && (
          <div style={{ background: '#FFFFFF', borderRadius: 20, padding: 16, border: '1px solid rgba(255,106,0,0.2)' }}>
            <img
              src={result.imageUrl}
              alt={result.caption}
              style={{ width: '100%', maxHeight: 360, objectFit: 'contain', borderRadius: 14, background: '#FFFBF7' }}
            />
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#202124' }}>{result.caption}</div>
              <span style={{ fontSize: '0.78rem', color: '#15803D', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={15} /> Saved to Library
              </span>
            </div>
            <div style={{ marginTop: 8, padding: 10, borderRadius: 12, background: '#FFF3E8', fontSize: '0.78rem', color: '#9A3412', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{result.limitationNote}</span>
            </div>

            {result.explanation && (
              <div style={{ marginTop: 14, padding: 14, borderRadius: 14, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div style={{ fontWeight: 800, fontSize: '0.84rem', color: '#1E293B', marginBottom: 8 }}>
                  📖 Complete Image Walkthrough & Labeled Parts Guide
                </div>
                <div style={{ fontSize: '0.82rem', color: '#334155', marginBottom: 8, lineHeight: 1.55 }}>
                  <strong>What This Image Shows:</strong> {result.explanation.whatItShows}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  {result.explanation.importantParts?.map((part: any, i: number) => (
                    <span
                      key={i}
                      style={{
                        padding: '3px 9px',
                        borderRadius: 999,
                        background: '#FFF3E8',
                        color: '#C2410C',
                        fontSize: '0.73rem',
                        fontWeight: 700,
                        border: '1px solid rgba(255,106,0,0.25)'
                      }}
                    >
                      🏷️ {typeof part === 'string' ? part : part.label}
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: 6, lineHeight: 1.5 }}>
                  <strong>How Parts Connect:</strong> {result.explanation.howPartsConnect}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 600, background: '#ECFDF5', padding: '6px 10px', borderRadius: 10 }}>
                  💡 <strong>What to Remember:</strong> {result.explanation.whatToRemember}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const VideoGenerationModal: React.FC = () => {
  const { modalVideo, closeVideoStudio } = useLearning();

  if (!modalVideo.open) return null;

  return (
    <div className="glass-modal-overlay" role="dialog" aria-modal="true" aria-label="AI Video Generation Notice">
      <div className="glass-modal-content" style={{ maxWidth: 580, textAlign: 'center', padding: '32px 24px' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Video size={28} />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>
          Video Generation Strictly Disabled
        </h2>
        <div style={{ padding: '8px 14px', borderRadius: 999, background: '#FEE2E2', color: '#991B1B', fontSize: '0.78rem', fontWeight: 800, display: 'inline-block', marginBottom: 14 }}>
          FEATURE_DISABLED (Server Policy)
        </div>
        <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5, marginBottom: 20 }}>
          Per STUDYAI safety and instructional architecture standards, automated video generation is strictly disabled across all user roles. Please utilize the interactive Three.js 3D Lab and labeled visual concept diagrams for spatial and mechanistic learning.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={closeVideoStudio}
            className="btn-glass"
            style={{ padding: '10px 24px', fontWeight: 700, borderRadius: 12 }}
          >
            Close Notice
          </button>
        </div>
      </div>
    </div>
  );
};
