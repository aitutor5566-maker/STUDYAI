import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  ListOrdered,
  BookOpen,
  HelpCircle,
  Maximize2,
  Minimize2,
  RefreshCw,
  Trash2,
  AlertCircle,
  Eye,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  ChevronDown,
  MessageSquare
} from 'lucide-react';

export interface NoteAudioSection {
  sectionIndex: number;
  sectionId: string;
  title: string;
  category: string;
  spokenText: string;
  writtenMarkdownSummary?: string;
  estimatedDurationSeconds: number;
  actualDurationSeconds?: number;
  audioUrl?: string;
  audioProvider?: string;
  status: 'pending' | 'synthesized' | 'failed';
  visual?: {
    id: string;
    title: string;
    caption: string;
    svgXml?: string;
    labels?: string[];
    spokenVisualWalkthrough?: {
      whatItShows: string;
      importantComponents: string[];
      stepByStepMechanism: string[];
      studentTakeaway: string;
    };
  };
  highlightTargetHeading?: string;
  sentences?: Array<{
    sentenceIndex: number;
    text: string;
    estimatedSeconds: number;
    highlightTargetId?: string;
  }>;
}

export interface NoteAudioLesson {
  id: string;
  noteId: string;
  userId: string;
  topic: string;
  subject: string;
  grade: number;
  board: string;
  depth: 'normal' | 'detailed' | 'exam';
  language: 'en' | 'te' | 'hi';
  voiceName: string;
  status: 'ready' | 'generating' | 'error';
  lessonTitle: string;
  teacherGreeting: string;
  totalDurationSeconds: number;
  sections: NoteAudioSection[];
  currentPlaybackSection: number;
  currentPlaybackSeconds: number;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  noteId: string;
  noteTitle: string;
  noteSubject: string;
  isOpen: boolean;
  onClose: () => void;
  apiFetch: <T = any>(endpoint: string, options?: RequestInit) => Promise<T>;
  onSectionChange?: (section: NoteAudioSection) => void;
}

export const AudioLessonPlayer: React.FC<Props> = ({
  noteId,
  noteTitle,
  noteSubject,
  isOpen,
  onClose,
  apiFetch,
  onSectionChange
}) => {
  const [lesson, setLesson] = useState<NoteAudioLesson | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [depth, setDepth] = useState<'normal' | 'detailed' | 'exam'>('detailed');
  const [language, setLanguage] = useState<'en' | 'te' | 'hi'>('en');
  const [speed, setSpeed] = useState<number>(1.0);

  const [currentSectionIdx, setCurrentSectionIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [showPlaylistDrawer, setShowPlaylistDrawer] = useState<boolean>(false);
  const [showInterruptionModal, setShowInterruptionModal] = useState<boolean>(false);
  const [interruptionQuery, setInterruptionQuery] = useState<string>('');
  const [interruptionAnswer, setInterruptionAnswer] = useState<string | null>(null);
  const [isInterrupting, setIsInterrupting] = useState<boolean>(false);
  const [synthesizingSectionIdx, setSynthesizingSectionIdx] = useState<number | null>(null);
  const [showVisualModal, setShowVisualModal] = useState<boolean>(false);
  const [activeSentenceIdx, setActiveSentenceIdx] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize or fetch audio lesson when modal opens or depth/language changes
  useEffect(() => {
    if (isOpen && noteId) {
      loadOrGenerateLesson(depth, language, false);
    }
    return () => {
      stopPlayback();
    };
  }, [isOpen, noteId, depth, language]);

  // Synchronize playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  const loadOrGenerateLesson = async (
    targetDepth: 'normal' | 'detailed' | 'exam',
    targetLang: 'en' | 'te' | 'hi',
    forceRegen = false
  ) => {
    setLoading(true);
    setError(null);
    stopPlayback();

    try {
      const res = await apiFetch<NoteAudioLesson>(`/api/notes/${encodeURIComponent(noteId)}/audio/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          depth: targetDepth,
          language: targetLang,
          speed,
          forceRegenerate: forceRegen
        })
      });

      setLesson(res);
      const startIdx = res.currentPlaybackSection || 0;
      setCurrentSectionIdx(startIdx);
      if (res.sections && res.sections[startIdx]) {
        onSectionChange?.(res.sections[startIdx]);
        // Auto-play section 0 if audio exists
        if (res.sections[startIdx].audioUrl) {
          playSectionAudio(res.sections[startIdx], res.currentPlaybackSeconds || 0);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to initialize audio lesson.');
    } finally {
      setLoading(false);
    }
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const playSectionAudio = async (section: NoteAudioSection, startSeconds = 0) => {
    stopPlayback();

    // If section audio is not synthesized yet, synthesize on-demand
    if (!section.audioUrl) {
      setSynthesizingSectionIdx(section.sectionIndex);
      try {
        const synthRes = await apiFetch<any>(
          `/api/notes/${encodeURIComponent(noteId)}/audio/section/${section.sectionIndex}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ speed })
          }
        );
        section.audioUrl = synthRes.audioUrl;
        section.actualDurationSeconds = synthRes.durationSeconds;
        section.status = 'synthesized';
      } catch (e: any) {
        console.warn('Fallback speech synthesis will be used:', e?.message);
      } finally {
        setSynthesizingSectionIdx(null);
      }
    }

    if (section.audioUrl && audioRef.current) {
      const audio = audioRef.current;
      audio.src = section.audioUrl;
      audio.playbackRate = speed;

      audio.onloadedmetadata = () => {
        setDuration(audio.duration || section.estimatedDurationSeconds || 20);
        if (startSeconds > 0) {
          audio.currentTime = startSeconds;
        }
      };

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
        // Estimate sentence index
        if (section.sentences && section.sentences.length > 0) {
          const ratio = audio.currentTime / (audio.duration || 1);
          const sIdx = Math.min(section.sentences.length - 1, Math.floor(ratio * section.sentences.length));
          setActiveSentenceIdx(sIdx);
        }
      };

      audio.onended = () => {
        setIsPlaying(false);
        // Auto-advance to next section
        if (lesson && currentSectionIdx < lesson.sections.length - 1) {
          handleSelectSection(currentSectionIdx + 1);
        }
      };

      audio.onerror = () => {
        playFallbackBrowserSpeech(section.spokenText);
      };

      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        playFallbackBrowserSpeech(section.spokenText);
      }
    } else {
      playFallbackBrowserSpeech(section.spokenText);
    }
  };

  const playFallbackBrowserSpeech = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speed;
      utterance.pitch = 1.0;
      utterance.lang = language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
      synthUtteranceRef.current = utterance;

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => {
        setIsPlaying(false);
        if (lesson && currentSectionIdx < lesson.sections.length - 1) {
          handleSelectSection(currentSectionIdx + 1);
        }
      };
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleTogglePlayPause = () => {
    if (!lesson || !lesson.sections[currentSectionIdx]) return;

    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.pause();
      }
      setIsPlaying(false);
      savePlaybackProgress(currentSectionIdx, currentTime);
    } else {
      if (audioRef.current && audioRef.current.src) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {
          playSectionAudio(lesson.sections[currentSectionIdx], currentTime);
        });
      } else {
        playSectionAudio(lesson.sections[currentSectionIdx], currentTime);
      }
    }
  };

  const handleSelectSection = (idx: number) => {
    if (!lesson || !lesson.sections[idx]) return;
    setCurrentSectionIdx(idx);
    setCurrentTime(0);
    setActiveSentenceIdx(0);
    onSectionChange?.(lesson.sections[idx]);
    playSectionAudio(lesson.sections[idx], 0);
    savePlaybackProgress(idx, 0);
  };

  const handleReplaySection = () => {
    if (!lesson || !lesson.sections[currentSectionIdx]) return;
    playSectionAudio(lesson.sections[currentSectionIdx], 0);
  };

  const handleSeek = (newSeconds: number) => {
    setCurrentTime(newSeconds);
    if (audioRef.current) {
      audioRef.current.currentTime = newSeconds;
    }
  };

  const savePlaybackProgress = async (secIdx: number, seconds: number) => {
    try {
      await apiFetch(`/api/notes/${encodeURIComponent(noteId)}/audio/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPlaybackSection: secIdx,
          currentPlaybackSeconds: seconds
        })
      });
    } catch {}
  };

  const handleInterruptSubmit = async (customQuestion?: string) => {
    const q = customQuestion || interruptionQuery;
    if (!q || !q.trim() || !lesson) return;

    setIsInterrupting(true);
    setInterruptionAnswer(null);

    // Pause main playback while answering
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);

    try {
      const res = await apiFetch<any>(`/api/notes/${encodeURIComponent(noteId)}/audio/interrupt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          currentSectionIndex: currentSectionIdx,
          playbackSeconds: currentTime
        })
      });

      setInterruptionAnswer(res.verbalAnswer);
      if (res.audioUrl && audioRef.current) {
        audioRef.current.src = res.audioUrl;
        audioRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      setInterruptionAnswer('Let me explain this simply: this process operates under continuous physical conservation.');
    } finally {
      setIsInterrupting(false);
    }
  };

  const handleResumeAfterInterruption = () => {
    setShowInterruptionModal(false);
    setInterruptionAnswer(null);
    setInterruptionQuery('');
    if (lesson && lesson.sections[currentSectionIdx]) {
      playSectionAudio(lesson.sections[currentSectionIdx], currentTime);
    }
  };

  const handleDeleteAudioLesson = async () => {
    if (!confirm('Are you sure you want to delete this generated audio lesson? (Your written notes will not be affected)')) {
      return;
    }
    stopPlayback();
    try {
      await apiFetch(`/api/notes/${encodeURIComponent(noteId)}/audio`, {
        method: 'DELETE'
      });
      setLesson(null);
      onClose();
    } catch (e: any) {
      alert(`Unable to delete audio: ${e?.message}`);
    }
  };

  if (!isOpen) return null;

  const currentSection = lesson?.sections[currentSectionIdx];
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(12px)',
        padding: 16
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="audio-lesson-title"
    >
      <audio ref={audioRef} style={{ display: 'none' }} />

      <div
        style={{
          width: '100%',
          maxWidth: 960,
          maxHeight: '92vh',
          background: 'var(--surface-primary, #1E293B)',
          borderRadius: 24,
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: 'var(--text-primary, #F8FAFC)'
        }}
      >
        {/* Top Header Bar */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.03)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #FF6A00 0%, #EE5A24 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(255, 106, 0, 0.35)'
              }}
            >
              <Volume2 size={22} color="#FFFFFF" />
            </div>
            <div>
              <div id="audio-lesson-title" style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
                {noteTitle} • Spoken Audio Lesson
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                {noteSubject} • Professional AI Teacher Audio Narration
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={() => setShowPlaylistDrawer(!showPlaylistDrawer)}
              style={{
                padding: '6px 12px',
                borderRadius: 10,
                background: showPlaylistDrawer ? 'rgba(255, 106, 0, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: showPlaylistDrawer ? '#FF6A00' : '#E2E8F0',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer'
              }}
              title="Toggle chapter playlist"
            >
              <ListOrdered size={15} />
              <span>Chapters ({lesson?.sections.length || 0})</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.06)',
                border: 'none',
                color: '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Close player"
              aria-label="Close audio player"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Options Toolbar: Depth & Language */}
        <div
          style={{
            padding: '12px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            background: 'rgba(0, 0, 0, 0.2)'
          }}
        >
          {/* Audio Depth Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
              Lesson Depth:
            </span>
            {(['normal', 'detailed', 'exam'] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDepth(d)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 8,
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  background: depth === d ? '#FF6A00' : 'rgba(255, 255, 255, 0.08)',
                  color: depth === d ? '#FFFFFF' : '#CBD5E1',
                  transition: 'all 0.2s ease'
                }}
              >
                {d === 'normal' ? '📘 Normal' : d === 'detailed' ? '🔬 Detailed' : '🏆 Exam Prep'}
              </button>
            ))}
          </div>

          {/* Language Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
              Language:
            </span>
            {(
              [
                { id: 'en', label: 'English' },
                { id: 'te', label: 'తెలుగు' },
                { id: 'hi', label: 'हिन्दी' }
              ] as const
            ).map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLanguage(l.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 8,
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  background: language === l.id ? '#0284C7' : 'rgba(255, 255, 255, 0.08)',
                  color: language === l.id ? '#FFFFFF' : '#CBD5E1',
                  transition: 'all 0.2s ease'
                }}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Speed Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
              Speed:
            </span>
            {[0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSpeed(s)}
                style={{
                  padding: '3px 8px',
                  borderRadius: 6,
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  background: speed === s ? '#16A34A' : 'rgba(255, 255, 255, 0.08)',
                  color: speed === s ? '#FFFFFF' : '#CBD5E1'
                }}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
          {/* Active Narration & Synchronized Visual View */}
          <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, color: '#94A3B8' }}>
                <RefreshCw size={32} className="animate-spin" color="#FF6A00" />
                <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                  Synthesizing professional teacher narration script for {noteTitle}...
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Structuring definitions, diagrams, and step-by-step exam takeaways in {language.toUpperCase()}
                </div>
              </div>
            ) : error ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: '#EF4444' }}>
                <AlertCircle size={36} />
                <div style={{ fontSize: '1rem', fontWeight: 700 }}>Unable to Load Audio Lesson</div>
                <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>{error}</div>
                <button
                  type="button"
                  onClick={() => loadOrGenerateLesson(depth, language, true)}
                  style={{
                    marginTop: 8,
                    padding: '8px 16px',
                    borderRadius: 10,
                    background: '#FF6A00',
                    color: '#FFF',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Retry Generation
                </button>
              </div>
            ) : currentSection ? (
              <>
                {/* Section Badge & Category */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        background: 'rgba(255, 106, 0, 0.15)',
                        color: '#FF6A00',
                        fontSize: '0.75rem',
                        fontWeight: 800
                      }}
                    >
                      {currentSection.category}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
                      Section {currentSectionIdx + 1} of {lesson?.sections.length}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {currentSection.visual && (
                      <button
                        type="button"
                        onClick={() => setShowVisualModal(!showVisualModal)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 8,
                          background: 'rgba(2, 132, 199, 0.2)',
                          color: '#38BDF8',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          cursor: 'pointer'
                        }}
                      >
                        <Eye size={14} />
                        <span>{showVisualModal ? 'Hide Diagram' : 'Inspect Diagram'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowInterruptionModal(true)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 8,
                        background: 'rgba(124, 58, 237, 0.2)',
                        color: '#C084FC',
                        border: '1px solid rgba(192, 132, 252, 0.3)',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        cursor: 'pointer'
                      }}
                    >
                      <HelpCircle size={14} />
                      <span>Interrupt Teacher</span>
                    </button>
                  </div>
                </div>

                {/* Section Title */}
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                  {currentSection.title}
                </h3>

                {/* Optional Visual Banner when diagram exists */}
                {currentSection.visual && (showVisualModal || currentSection.category === 'Visual Intelligence') && (
                  <div
                    style={{
                      background: 'rgba(15, 23, 42, 0.8)',
                      borderRadius: 16,
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      padding: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38BDF8' }}>
                        🎨 {currentSection.visual.title}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                        Synchronized Spoken Walkthrough
                      </span>
                    </div>

                    {currentSection.visual.svgXml && (
                      <div
                        style={{
                          width: '100%',
                          maxHeight: 260,
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 12,
                          background: '#0F172A'
                        }}
                        dangerouslySetInnerHTML={{ __html: currentSection.visual.svgXml }}
                      />
                    )}

                    {currentSection.visual.labels && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {currentSection.visual.labels.map((lbl, i) => (
                          <span
                            key={i}
                            style={{
                              padding: '2px 8px',
                              borderRadius: 6,
                              background: 'rgba(255, 255, 255, 0.08)',
                              fontSize: '0.72rem',
                              color: '#CBD5E1',
                              border: '1px solid rgba(255, 255, 255, 0.06)'
                            }}
                          >
                            • {lbl}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Spoken Narration Script with Synchronized Sentence Highlight */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 16,
                    padding: 18,
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    lineHeight: 1.7,
                    fontSize: '0.98rem'
                  }}
                >
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#FF6A00', marginBottom: 8, textTransform: 'uppercase' }}>
                    🎙️ Spoken Teacher Narration
                  </div>
                  {currentSection.sentences && currentSection.sentences.length > 0 ? (
                    <div>
                      {currentSection.sentences.map((sent, sIdx) => {
                        const isCurrent = isPlaying && sIdx === activeSentenceIdx;
                        return (
                          <span
                            key={sIdx}
                            style={{
                              background: isCurrent ? 'rgba(255, 106, 0, 0.25)' : 'transparent',
                              color: isCurrent ? '#FFD8A8' : '#F1F5F9',
                              padding: isCurrent ? '2px 4px' : '0',
                              borderRadius: 4,
                              transition: 'all 0.2s ease',
                              fontWeight: isCurrent ? 600 : 400
                            }}
                          >
                            {sent.text}{' '}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ color: '#F1F5F9' }}>{currentSection.spokenText}</div>
                  )}
                </div>

                {/* Section Summary Takeaways */}
                {currentSection.writtenMarkdownSummary && (
                  <div style={{ fontSize: '0.82rem', color: '#94A3B8', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: 12 }}>
                    <strong>Chapter Note Link:</strong> This audio section corresponds to <em>{currentSection.highlightTargetHeading || currentSection.title}</em> in your digital notebook.
                  </div>
                )}
              </>
            ) : null}
          </div>

          {/* Chapter Playlist Drawer */}
          {showPlaylistDrawer && lesson && (
            <div
              style={{
                width: 320,
                borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(15, 23, 42, 0.95)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', fontWeight: 800, fontSize: '0.92rem' }}>
                Course Chapters & Sections
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {lesson.sections.map((sec, idx) => {
                  const isActive = idx === currentSectionIdx;
                  return (
                    <button
                      key={sec.sectionId}
                      type="button"
                      onClick={() => handleSelectSection(idx)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: isActive ? '1px solid #FF6A00' : '1px solid transparent',
                        background: isActive ? 'rgba(255, 106, 0, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        color: isActive ? '#FF8C00' : '#E2E8F0',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.84rem', fontWeight: isActive ? 700 : 500, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {sec.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                          {sec.category} • ~{sec.estimatedDurationSeconds}s
                        </div>
                      </div>
                      {isActive && <CheckCircle2 size={16} color="#FF6A00" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Audio Player Controls Bar (Bottom) */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(15, 23, 42, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}
        >
          {/* Progress Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', minWidth: 40, textAlign: 'right' }}>
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || currentSection?.estimatedDurationSeconds || 30}
              step={0.1}
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              style={{
                flex: 1,
                accentColor: '#FF6A00',
                cursor: 'pointer'
              }}
              aria-label="Audio progress slider"
            />
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', minWidth: 40 }}>
              {formatTime(duration || currentSection?.estimatedDurationSeconds || 30)}
            </span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                onClick={handleDeleteAudioLesson}
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#EF4444',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
                title="Delete this audio lesson without deleting written notes"
              >
                <Trash2 size={13} />
                <span>Delete Audio</span>
              </button>

              <button
                type="button"
                onClick={() => loadOrGenerateLesson(depth, language, true)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#CBD5E1',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
                title="Regenerate audio narration from updated notes"
              >
                <RefreshCw size={13} />
                <span>Regenerate</span>
              </button>
            </div>

            {/* Playback Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button
                type="button"
                onClick={() => handleSelectSection(Math.max(0, currentSectionIdx - 1))}
                disabled={currentSectionIdx === 0}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: currentSectionIdx === 0 ? '#475569' : '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: currentSectionIdx === 0 ? 'default' : 'pointer'
                }}
                title="Previous section"
              >
                <SkipBack size={18} />
              </button>

              <button
                type="button"
                onClick={handleReplaySection}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title="Replay this section"
              >
                <RotateCcw size={18} />
              </button>

              <button
                type="button"
                onClick={handleTogglePlayPause}
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FF6A00 0%, #EE5A24 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(255, 106, 0, 0.45)',
                  transition: 'transform 0.15s ease'
                }}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {synthesizingSectionIdx !== null ? (
                  <RefreshCw size={22} className="animate-spin" />
                ) : isPlaying ? (
                  <Pause size={24} />
                ) : (
                  <Play size={24} style={{ marginLeft: 3 }} />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleSelectSection(Math.min((lesson?.sections.length || 1) - 1, currentSectionIdx + 1))}
                disabled={!lesson || currentSectionIdx >= lesson.sections.length - 1}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: (!lesson || currentSectionIdx >= lesson.sections.length - 1) ? '#475569' : '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: (!lesson || currentSectionIdx >= lesson.sections.length - 1) ? 'default' : 'pointer'
                }}
                title="Next section"
              >
                <SkipForward size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
                {currentSection?.audioProvider || 'Teacher Voice'}
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Interruption Modal */}
        {showInterruptionModal && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
              zIndex: 10
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: 580,
                background: '#1E293B',
                borderRadius: 20,
                border: '1px solid rgba(255, 255, 255, 0.12)',
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 16
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <HelpCircle size={20} color="#FF6A00" />
                  <span style={{ fontSize: '1.05rem', fontWeight: 800 }}>Ask the AI Teacher</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInterruptionModal(false)}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ fontSize: '0.84rem', color: '#94A3B8' }}>
                You can interrupt the lesson at any time. When you are finished, we will resume right where you left off at <strong>{formatTime(currentTime)}</strong>.
              </div>

              {/* Quick Prompt Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {[
                  'Explain that again',
                  'Explain it more simply',
                  'Explain this diagram',
                  'Give me an everyday example',
                  'Explain the governing formula'
                ].map((prompt, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => handleInterruptSubmit(prompt)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 8,
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#E2E8F0',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    💬 {prompt}
                  </button>
                ))}
              </div>

              {/* Custom Question Input */}
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  placeholder="Or ask anything specific..."
                  value={interruptionQuery}
                  onChange={(e) => setInterruptionQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleInterruptSubmit()}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#FFF',
                    fontSize: '0.85rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleInterruptSubmit()}
                  disabled={isInterrupting || !interruptionQuery.trim()}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 10,
                    background: '#FF6A00',
                    color: '#FFF',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {isInterrupting ? 'Thinking...' : 'Ask'}
                </button>
              </div>

              {/* Spoken Answer */}
              {interruptionAnswer && (
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 12,
                    padding: 14,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    color: '#F8FAFC'
                  }}
                >
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#38BDF8', marginBottom: 6 }}>
                    🎓 Teacher Response:
                  </div>
                  {interruptionAnswer}
                </div>
              )}

              {/* Resume Button */}
              <button
                type="button"
                onClick={handleResumeAfterInterruption}
                style={{
                  marginTop: 8,
                  padding: '12px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                  color: '#FFF',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <Play size={16} />
                <span>Resume Lesson at {formatTime(currentTime)}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
