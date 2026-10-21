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
          </div>
        )}
      </div>
    </div>
  );
};

export const VideoGenerationModal: React.FC = () => {
  const { modalVideo, closeVideoStudio, apiFetch, startAudioLesson, triggerRefresh } = useLearning();
  const [topic, setTopic] = useState(modalVideo.topic || 'Solar System');
  const [audience, setAudience] = useState('Grade 10');
  const [language, setLanguage] = useState('English');
  const [durationSeconds, setDurationSeconds] = useState(40);
  const [style, setStyle] = useState('Cinematic Scientific');

  const [jobState, setJobState] = useState<'idle' | 'generating' | 'completed' | 'failed'>('idle');
  const [stageIndex, setStageIndex] = useState(0);
  const [error, setError] = useState('');
  const [videoData, setVideoData] = useState<any | null>(null);
  const [activeSceneIdx, setActiveSceneIdx] = useState(0);
  const [sceneProgress, setSceneProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoAudioRef = React.useRef<HTMLAudioElement | null>(null);

  const STAGES = [
    '1. Topic & curriculum explanation preparation (Groq / Gemini)',
    '2. Teacher narration script generation',
    '3. Multi-scene visual storyboard planning',
    '4. Runway ML & animated scene diagram synthesis',
    '5. ElevenLabs / Gemini neural voiceover synthesis',
    '6. Saving playable multi-scene lesson to Library'
  ];

  const runVideoWorkflow = async (targetTopic: string) => {
    const clean = targetTopic.trim();
    if (!clean) {
      setError('Please enter a topic for the educational video.');
      return;
    }
    setTopic(clean);
    setError('');
    setJobState('generating');
    setStageIndex(0);
    setIsPlaying(false);

    const progressTimer = setInterval(() => {
      setStageIndex((s) => (s < STAGES.length - 1 ? s + 1 : s));
    }, 220);

    try {
      const res = await apiFetch('/api/media/video', {
        method: 'POST',
        body: JSON.stringify({
          topic: clean,
          audience,
          language,
          durationSeconds,
          style
        })
      });
      clearInterval(progressTimer);
      setStageIndex(STAGES.length - 1);
      setVideoData(res);
      setActiveSceneIdx(0);
      setSceneProgress(0);
      setJobState('completed');
      setIsPlaying(true);
      triggerRefresh();
    } catch (err: any) {
      clearInterval(progressTimer);
      setJobState('failed');
      setError(err?.message || 'Video workflow failed.');
    }
  };

  useEffect(() => {
    if (modalVideo.open) {
      const incomingTopic = (modalVideo.topic || 'Solar System').trim();
      setTopic(incomingTopic);
      // If we don't have videoData for this exact topic yet, reset stale state so it never shows an old topic's video
      if (videoData && videoData.topic?.toLowerCase() !== incomingTopic.toLowerCase()) {
        setVideoData(null);
        setJobState('idle');
        setActiveSceneIdx(0);
        setSceneProgress(0);
        setIsPlaying(false);
      }
    }
  }, [modalVideo.open, modalVideo.topic]);

  useEffect(() => {
    if (!videoAudioRef.current || !videoData?.audioUrl) return;
    if (isPlaying) {
      videoAudioRef.current.play().catch(() => {});
    } else {
      videoAudioRef.current.pause();
    }
  }, [isPlaying, videoData?.audioUrl]);

  // Smooth 100ms progress & scene transition loop
  useEffect(() => {
    if (!isPlaying || !videoData?.scenes?.length) return;
    const tickMs = 100;
    const sceneDurationMs = 5500;
    const stepPct = (tickMs / sceneDurationMs) * 100;

    const timer = setInterval(() => {
      setSceneProgress((prev) => {
        if (prev + stepPct >= 100) {
          setActiveSceneIdx((curIdx) => {
            if (curIdx + 1 < videoData.scenes.length) {
              return curIdx + 1;
            }
            setIsPlaying(false);
            return curIdx;
          });
          return 0;
        }
        return prev + stepPct;
      });
    }, tickMs);
    return () => clearInterval(timer);
  }, [isPlaying, videoData]);

  if (!modalVideo.open) return null;

  const handleStartWorkflow = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await runVideoWorkflow(topic);
  };

  const currentScene = videoData?.scenes?.[activeSceneIdx];
  const overallProgressPct = videoData?.scenes?.length
    ? Math.min(100, Math.round(((activeSceneIdx * 100 + sceneProgress) / (videoData.scenes.length * 100)) * 100))
    : 0;

  return (
    <div className="glass-modal-overlay" role="dialog" aria-modal="true" aria-label="AI Video Generation Studio">
      <div className="glass-modal-content" style={{ maxWidth: 860 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FFF3E8', color: '#FF6A00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Video size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>AI Educational Video Generation Studio</h2>
              <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Topic-Specific Multi-Scene Animated Storyboard & Neural Voiceover Workflow</p>
            </div>
          </div>
          <button type="button" onClick={closeVideoStudio} className="btn-glass" style={{ padding: '6px 10px' }} aria-label="Close Video Studio">
            <X size={16} />
          </button>
        </div>

        {/* Quick Topic Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280' }}>Quick Topics:</span>
          {[
            'Solar System Orbits',
            'Human Heart & Blood Flow',
            'Volcanic Eruption',
            'Newton’s Laws of Motion',
            'DNA Double Helix',
            'Quadratic Equations',
            'Water Cycle',
            'Photosynthesis'
          ].map((preset) => (
            <button
              key={preset}
              type="button"
              disabled={jobState === 'generating'}
              onClick={() => runVideoWorkflow(preset)}
              style={{
                padding: '4px 10px',
                borderRadius: 999,
                border: topic.toLowerCase() === preset.toLowerCase() ? '1.5px solid #FF6A00' : '1px solid rgba(0,0,0,0.12)',
                background: topic.toLowerCase() === preset.toLowerCase() ? '#FFF3E8' : '#FFFFFF',
                color: topic.toLowerCase() === preset.toLowerCase() ? '#E85D00' : '#374151',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {preset}
            </button>
          ))}
        </div>

        <form onSubmit={handleStartWorkflow} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 16 }}>
          <div className="glass-input-wrap" style={{ gridColumn: '1 / -1' }}>
            <input
              className="glass-input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter ANY video topic (e.g., Volcanoes, Human Heart, Electric Circuits, World War II)..."
              aria-label="Video Topic"
            />
          </div>
          <select value={audience} onChange={(e) => setAudience(e.target.value)} aria-label="Audience Level" style={{ padding: '9px 12px', borderRadius: 14, border: '1px solid rgba(0,0,0,0.12)' }}>
            <option value="Grade 8">Grade 8 Foundation</option>
            <option value="Grade 10">Grade 10 Board Prep</option>
            <option value="Grade 12">Grade 12 Advanced</option>
          </select>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} aria-label="Narration Language" style={{ padding: '9px 12px', borderRadius: 14, border: '1px solid rgba(0,0,0,0.12)' }}>
            <option value="English">English</option>
            <option value="English + Hindi Key Terms">Bilingual (EN/HI)</option>
          </select>
          <select value={durationSeconds} onChange={(e) => setDurationSeconds(Number(e.target.value))} aria-label="Video Duration" style={{ padding: '9px 12px', borderRadius: 14, border: '1px solid rgba(0,0,0,0.12)' }}>
            <option value={30}>30 Seconds</option>
            <option value={45}>45 Seconds</option>
            <option value={60}>60 Seconds</option>
          </select>
          <button type="submit" className="btn-orange" disabled={jobState === 'generating'}>
            <Sparkles size={16} />
            <span>{jobState === 'generating' ? 'Generating...' : 'Create Video Lesson'}</span>
          </button>
        </form>

        {/* Pipeline Status */}
        {jobState === 'generating' && (
          <div style={{ padding: 20, borderRadius: 18, background: '#FFFDFB', border: '1px solid rgba(255,106,0,0.25)', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: '#FF6A00', marginBottom: 10 }}>Executing Multi-Scene Video Pipeline for "{topic}"...</div>
            {STAGES.map((st, idx) => (
              <div key={st} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.83rem', padding: '4px 0', color: idx <= stageIndex ? '#202124' : '#9CA3AF', fontWeight: idx === stageIndex ? 700 : 500 }}>
                <span>{idx < stageIndex ? '✅' : idx === stageIndex ? '⏳' : '○'}</span>
                <span>{st}</span>
              </div>
            ))}
          </div>
        )}

        {jobState === 'failed' && (
          <div style={{ padding: 14, borderRadius: 16, background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span>{error}</span>
            <button type="button" onClick={() => handleStartWorkflow()} className="btn-orange" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
              Retry Failed Job
            </button>
          </div>
        )}

        {jobState === 'completed' && videoData && currentScene && (
          <div>
            {/* Honest Provider Configuration Notice */}
            <div style={{ padding: '8px 14px', borderRadius: 12, background: '#FFF3E8', color: '#9A3412', fontSize: '0.78rem', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <span>ℹ️ {videoData.providerNotice}</span>
              <span style={{ fontWeight: 700, color: '#15803D' }}>✓ Saved to Library ({videoData.topic})</span>
            </div>

            {videoData.audioUrl && (
              <audio
                ref={videoAudioRef}
                src={videoData.audioUrl}
                autoPlay
                style={{ display: 'none' }}
              />
            )}

            {videoData.videoUrl && (
              <video
                src={videoData.videoUrl}
                controls
                autoPlay
                loop
                style={{ width: '100%', maxHeight: 280, borderRadius: 18, marginBottom: 12, background: '#000' }}
              />
            )}

            {/* Interactive Animated Multi-Scene Cinema Viewport */}
            <div
              style={{
                borderRadius: 22,
                background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 55%, #1E293B 100%)',
                color: '#FFFFFF',
                padding: 20,
                minHeight: 340,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 16px 36px rgba(15, 23, 42, 0.35)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Top Cinema HUD */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ padding: '4px 12px', borderRadius: 999, background: '#FF6A00', fontSize: '0.75rem', fontWeight: 800 }}>
                    ▶ SCENE {activeSceneIdx + 1} / {videoData.scenes.length}
                  </span>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#FDBA74' }}>
                    {videoData.topic} ({videoData.subject})
                  </span>
                </div>
                <span style={{ fontSize: '0.76rem', color: '#CBD5E1' }}>
                  {videoData.audience} • {videoData.language} {videoData.audioProvider ? `• 🔊 ${videoData.audioProvider}` : ''}
                </span>
              </div>

              {/* Animated Visual + Synchronized Narration Stage */}
              <div style={{ margin: '14px 0', display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: 16, alignItems: 'center', zIndex: 2 }}>
                <div
                  style={{
                    background: '#090D16',
                    borderRadius: 18,
                    padding: 6,
                    border: '2px solid rgba(255, 106, 0, 0.45)',
                    boxShadow: isPlaying ? '0 0 24px rgba(255, 106, 0, 0.28)' : 'none',
                    transition: 'all 0.35s ease',
                    overflow: 'hidden'
                  }}
                >
                  <img
                    key={`scene-img-${videoData.topic}-${activeSceneIdx}`}
                    src={currentScene.sceneImageUrl || videoData.imageUrl}
                    alt={`${videoData.topic} - ${currentScene.title}`}
                    style={{
                      width: '100%',
                      maxHeight: 235,
                      objectFit: 'contain',
                      borderRadius: 12,
                      display: 'block',
                      transform: isPlaying ? `scale(${1 + (sceneProgress / 100) * 0.04})` : 'scale(1)',
                      transition: 'transform 0.2s linear'
                    }}
                  />
                </div>

                <div style={{ padding: '6px 4px' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                    {currentScene.visualCue}
                  </div>
                  <div style={{ fontSize: '1.18rem', fontWeight: 800, color: '#FDBA74', marginBottom: 8 }}>
                    {currentScene.title}
                  </div>
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '5px 12px',
                      borderRadius: 999,
                      background: 'rgba(56, 189, 248, 0.16)',
                      border: '1px solid rgba(56, 189, 248, 0.4)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#38BDF8',
                      marginBottom: 10
                    }}
                  >
                    ⚡ {currentScene.keyFormula}
                  </div>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.58, color: '#F8FAFC', margin: 0, background: 'rgba(15, 23, 42, 0.65)', padding: '10px 12px', borderRadius: 12, borderLeft: '3px solid #FF6A00' }}>
                    "{currentScene.narration}"
                  </p>
                </div>
              </div>

              {/* Continuous Animated Video Scrubber Timeline */}
              <div style={{ marginBottom: 12, zIndex: 2 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94A3B8', marginBottom: 4 }}>
                  <span>{isPlaying ? '🟢 Playing Animated Scene...' : '⏸ Paused'}</span>
                  <span>Timeline Progress: {overallProgressPct}%</span>
                </div>
                <div style={{ width: '100%', height: 7, borderRadius: 999, background: 'rgba(255,255,255,0.14)', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${overallProgressPct}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #FF6A00 0%, #38BDF8 100%)',
                      transition: 'width 0.12s linear'
                    }}
                  />
                </div>
              </div>

              {/* Player Controls */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 12, zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setIsPlaying((p) => !p)}
                    className="btn-orange"
                    style={{ padding: '7px 16px', fontSize: '0.82rem' }}
                  >
                    {isPlaying ? <Pause size={15} /> : <Play size={15} />}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSceneIdx(0);
                      setSceneProgress(0);
                      if (videoAudioRef.current) {
                        videoAudioRef.current.currentTime = 0;
                        videoAudioRef.current.play().catch(() => {});
                      }
                      setIsPlaying(true);
                    }}
                    className="btn-glass"
                    style={{ padding: '7px 12px', fontSize: '0.8rem' }}
                  >
                    <RotateCcw size={14} />
                    <span>Restart</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      startAudioLesson({
                        topic: videoData.topic,
                        text: videoData.scenes.map((s: any) => s.narration).join(' ')
                      })
                    }
                    className="btn-glass"
                    style={{ padding: '7px 12px', fontSize: '0.8rem' }}
                  >
                    <Volume2 size={14} />
                    <span>Narrate Audio</span>
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  {videoData.scenes.map((s: any, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setActiveSceneIdx(idx);
                        setSceneProgress(0);
                      }}
                      style={{
                        padding: '5px 11px',
                        borderRadius: 999,
                        border: 'none',
                        background: idx === activeSceneIdx ? '#FF6A00' : 'rgba(255,255,255,0.16)',
                        color: '#FFF',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Scene {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
