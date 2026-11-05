import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mic,
  MicOff,
  Pause,
  Play,
  RotateCcw,
  Square,
  Sparkles,
  Volume2,
  VolumeX,
  HelpCircle,
  Radio,
  BookOpen,
  MessageSquare,
  Globe,
  Gauge,
  ListOrdered,
  Lightbulb
} from 'lucide-react';
import { Interactive3DLab } from './Interactive3DLab';

interface SynchronizedSentence {
  sentence_index: number;
  text: string;
  highlight_target_id?: string;
  action?: string;
}

interface VoiceSessionResponse {
  session_id: string;
  status: string;
  topic: string;
  grade: number;
  subject: string;
  mode: string;
  language?: string;
  speed?: number;
  current_step_index: number;
  total_steps: number;
  step_title: string;
  teacher_speech: string;
  sentences?: SynchronizedSentence[];
  audio_url?: string;
  audio_available?: boolean;
  audio_duration_seconds?: number;
  provider_used?: string;
  notice?: string;
  synced_visual?: {
    type: string;
    model_key?: string;
    target_id?: string;
    svg?: string;
    caption?: string;
  };
  highlight_target?: string;
  checkpoint_question?: string;
  suggested_actions?: string[];
  is_lesson_finished?: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
  grade: number;
  subject: string;
  mode: string;
  apiFetch: <T = any>(endpoint: string, options?: RequestInit) => Promise<T>;
}

const LANGUAGE_SPEECH_MAP: Record<string, string> = {
  en: 'en-IN',
  te: 'te-IN',
  hi: 'hi-IN',
  ur: 'ur-PK',
  ml: 'ml-IN'
};

export const VoiceTeacherModal: React.FC<Props> = ({
  isOpen,
  onClose,
  topic,
  grade,
  subject,
  mode,
  apiFetch
}) => {
  const [session, setSession] = useState<VoiceSessionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [studentInput, setStudentInput] = useState<string>('');
  const [voiceName, setVoiceName] = useState<string>('Kore');
  const [language, setLanguage] = useState<string>('en');
  const [speed, setSpeed] = useState<number>(1.0);
  const [activeSentenceIdx, setActiveSentenceIdx] = useState<number>(0);
  const [activeHighlightTarget, setActiveHighlightTarget] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<Array<{ speaker: 'teacher' | 'student'; text: string }>>([]);
  const [statusNote, setStatusNote] = useState<string>('');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const synthUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (isOpen && !session) {
      handleStartLesson();
    }
    return () => {
      stopAudioPlayback();
      stopSpeechRecognition();
    };
  }, [isOpen]);

  const handleStartLesson = async (overrideLang?: string) => {
    setLoading(true);
    setStatusNote('Connecting to AI Teacher Voice Engine...');
    const chosenLang = overrideLang || language;

    try {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          await navigator.mediaDevices.getUserMedia({ audio: true });
        }
      } catch (micErr) {
        console.warn('Microphone permission optional or declined:', micErr);
      }

      const res = await apiFetch<VoiceSessionResponse>('/api/v1/voice/start-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          grade,
          subject,
          mode,
          language: chosenLang,
          voice_name: voiceName,
          speed
        })
      });

      setSession(res);
      setActiveSentenceIdx(0);
      setTranscript([{ speaker: 'teacher', text: res.teacher_speech }]);
      setStatusNote(`Teacher speaking (${res.provider_used || 'Voice Audio'})...`);

      if (res.highlight_target || res.synced_visual?.target_id) {
        setActiveHighlightTarget(res.highlight_target || res.synced_visual?.target_id || null);
      }

      // Play audio via cloud URL or fallback to browser speech synthesis
      if (res.audio_url && res.audio_available) {
        playSpokenAudio(res.audio_url, res.sentences);
      } else {
        playWebSpeechSynthesis(res.teacher_speech, chosenLang, speed, res.sentences);
      }
    } catch (err: any) {
      setStatusNote(`Voice startup notice: ${err?.message || 'Unable to connect to audio server. Written lesson ready.'}`);
    } finally {
      setLoading(false);
    }
  };

  const playSpokenAudio = (audioUrl: string, sentences?: SynchronizedSentence[]) => {
    stopAudioPlayback();
    const audio = new Audio(audioUrl);
    audio.playbackRate = speed;
    audioRef.current = audio;

    audio.onplay = () => {
      setIsPlayingAudio(true);
      if (sentences && sentences.length > 0) {
        // Interval sentence highlight simulator for pre-rendered audio
        const durationPerSent = (audio.duration || 6) / sentences.length;
        let sIdx = 0;
        const intervalId = setInterval(() => {
          sIdx++;
          if (sIdx < sentences.length) {
            setActiveSentenceIdx(sIdx);
            if (sentences[sIdx].highlight_target_id) {
              setActiveHighlightTarget(sentences[sIdx].highlight_target_id || null);
            }
          } else {
            clearInterval(intervalId);
          }
        }, Math.max(1200, durationPerSent * 1000));
      }
    };

    audio.onended = () => {
      setIsPlayingAudio(false);
      setStatusNote('Listening to student... (Say your answer, or tap options below)');
      startSpeechRecognition();
    };

    audio.onerror = () => {
      setIsPlayingAudio(false);
      // Seamlessly fall back to browser Web Speech API if remote audio tag failed
      playWebSpeechSynthesis(session?.teacher_speech || '', language, speed, sentences);
    };

    audio.play().catch((e) => {
      console.warn('Audio auto-play blocked, switching to speech synth:', e);
      playWebSpeechSynthesis(session?.teacher_speech || '', language, speed, sentences);
    });
  };

  const playWebSpeechSynthesis = (
    text: string,
    langCode: string,
    speechRate: number,
    sentences?: SynchronizedSentence[]
  ) => {
    if (!('speechSynthesis' in window)) {
      setStatusNote('Speech synthesis unavailable in this browser. Written lesson is active.');
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`>~]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = speechRate;
    utterance.lang = LANGUAGE_SPEECH_MAP[langCode] || 'en-IN';
    synthUtteranceRef.current = utterance;

    utterance.onstart = () => {
      setIsPlayingAudio(true);
      setStatusNote('Teacher speaking (Browser WebSpeech Engine with 100% visual sync)...');
    };

    utterance.onboundary = (evt: any) => {
      // Dynamic sentence highlight mapping
      if (sentences && sentences.length > 0 && evt.name === 'sentence') {
        const charIdx = evt.charIndex || 0;
        let accumulated = 0;
        for (let i = 0; i < sentences.length; i++) {
          accumulated += sentences[i].text.length;
          if (charIdx <= accumulated) {
            setActiveSentenceIdx(i);
            if (sentences[i].highlight_target_id) {
              setActiveHighlightTarget(sentences[i].highlight_target_id || null);
            }
            break;
          }
        }
      }
    };

    utterance.onend = () => {
      setIsPlayingAudio(false);
      setStatusNote('Listening to student... (Say your response or choose an action)');
      startSpeechRecognition();
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setStatusNote('Voice completed. Written lesson and 3D visual remain active.');
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopAudioPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  };

  const startSpeechRecognition = () => {
    if (isMicMuted) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = LANGUAGE_SPEECH_MAP[language] || 'en-IN';

      recog.onstart = () => setIsListening(true);
      recog.onend = () => setIsListening(false);
      recog.onresult = (evt: any) => {
        const spokenText = evt.results[0][0].transcript;
        if (spokenText && spokenText.trim().length > 1) {
          sendStudentTurn(spokenText);
        }
      };

      recognitionRef.current = recog;
      recog.start();
    } catch (e) {
      console.warn('Speech recognition start failed:', e);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const sendStudentTurn = async (utterance: string, action?: string) => {
    if (!session) return;
    stopAudioPlayback();
    stopSpeechRecognition();

    if (utterance.trim()) {
      setTranscript((prev) => [...prev, { speaker: 'student', text: utterance }]);
    }
    setStudentInput('');
    setLoading(true);
    setStatusNote('Teacher is formulating response...');

    try {
      const res = await apiFetch<VoiceSessionResponse>('/api/v1/voice/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.session_id,
          student_utterance: utterance || 'Continue',
          action
        })
      });

      setSession(res);
      setActiveSentenceIdx(0);
      setTranscript((prev) => [...prev, { speaker: 'teacher', text: res.teacher_speech }]);
      setStatusNote('Teacher speaking...');

      if (res.highlight_target) {
        setActiveHighlightTarget(res.highlight_target);
      }

      if (res.audio_url && res.audio_available) {
        playSpokenAudio(res.audio_url, res.sentences);
      } else {
        playWebSpeechSynthesis(res.teacher_speech, language, speed, res.sentences);
      }
    } catch (err: any) {
      setStatusNote(`Turn error: ${err?.message || 'Could not process turn'}`);
    } finally {
      setLoading(false);
    }
  };

  // --- Teaching Controls ---

  const handleTogglePause = async () => {
    if (!session) return;
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);

    if (audioRef.current) {
      if (nextPaused) audioRef.current.pause();
      else audioRef.current.play();
    } else if ('speechSynthesis' in window) {
      if (nextPaused) window.speechSynthesis.pause();
      else window.speechSynthesis.resume();
    }

    try {
      await apiFetch('/api/v1/voice/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.session_id,
          action: nextPaused ? 'pause' : 'resume'
        })
      });
    } catch {}
    setStatusNote(nextPaused ? 'Lesson paused.' : 'Lesson resumed.');
  };

  const handleReplayStep = async () => {
    if (!session) return;
    stopAudioPlayback();
    stopSpeechRecognition();
    try {
      const res = await apiFetch<any>('/api/v1/voice/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: session.session_id, action: 'replay' })
      });
      setActiveSentenceIdx(0);
      if (res.audio_url && res.audio_available) {
        playSpokenAudio(res.audio_url, res.sentences);
      } else {
        playWebSpeechSynthesis(res.teacher_speech, language, speed, res.sentences);
      }
    } catch {}
  };

  const handleRepeatSentence = () => {
    sendStudentTurn('Repeat that sentence', 'repeat_sentence');
  };

  const handleExplainSimpler = () => {
    sendStudentTurn('Make it simpler', 'explain_simpler');
  };

  const handleExplainStepByStep = () => {
    sendStudentTurn('Explain step by step', 'explain_step_by_step');
  };

  const handleSpeedChange = async (newSpeed: number) => {
    setSpeed(newSpeed);
    if (audioRef.current) audioRef.current.playbackRate = newSpeed;
    if (session) {
      try {
        await apiFetch('/api/v1/voice/control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: session.session_id, action: 'speed', speed: newSpeed })
        });
      } catch {}
    }
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    handleStartLesson(newLang);
  };

  const handleEndLesson = async () => {
    stopAudioPlayback();
    stopSpeechRecognition();
    if (session) {
      try {
        await apiFetch('/api/v1/voice/control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: session.session_id, action: 'stop' })
        });
      } catch {}
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(16px)',
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
          maxWidth: 1000,
          maxHeight: '94vh',
          borderRadius: 24,
          background: 'rgba(255, 255, 255, 0.98)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.35)',
          border: '2px solid rgba(255, 106, 0, 0.35)',
          overflow: 'hidden'
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '14px 24px',
            borderBottom: '1.5px solid rgba(255, 106, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #FF6A00 0%, #EA580C 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(255,106,0,0.35)'
              }}
            >
              <Sparkles size={22} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1E293B' }}>
                  AI Teacher Synchronised Voice
                </span>
                <span
                  style={{
                    padding: '2px 10px',
                    borderRadius: 999,
                    background: '#EA580C',
                    color: '#FFFFFF',
                    fontSize: '0.72rem',
                    fontWeight: 800
                  }}
                >
                  Grade {grade} • {subject}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B' }}>
                Topic: <strong>{topic}</strong> • Sentence &amp; 3D Object Synchronized
              </p>
            </div>
          </div>

          {/* Right Controls: Multilingual & Persona */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Language Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Globe size={14} color="#64748B" />
              <select
                aria-label="Select Teaching Language"
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 999,
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: '#334155',
                  background: '#FFFFFF'
                }}
              >
                <option value="en">English</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="ur">اردو (Urdu)</option>
                <option value="ml">മലയാളം (Malayalam)</option>
              </select>
            </div>

            {/* Speed Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Gauge size={14} color="#64748B" />
              <select
                aria-label="Select Explanation Speed"
                value={speed}
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                style={{
                  padding: '5px 8px',
                  borderRadius: 999,
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: '#334155',
                  background: '#FFFFFF'
                }}
              >
                <option value="0.75">0.75x</option>
                <option value="1.0">1.0x (Normal)</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleEndLesson}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                padding: 6,
                borderRadius: 8
              }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Modal Main Stage (Split View: Visual Sync + Spoken Subtitles) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', flex: 1, minHeight: 420, overflow: 'hidden' }}>
          {/* Left Column: Synchronized Visual Anchor */}
          <div
            style={{
              padding: 20,
              background: '#0F172A',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            {session?.synced_visual?.type === '3d_model' || session?.synced_visual?.type === 'threejs_3d_model' ? (
              <div style={{ width: '100%', height: '100%', minHeight: 340 }}>
                <Interactive3DLab
                  modelKey={session.synced_visual.model_key || 'human-heart'}
                  title={session.synced_visual.caption || topic}
                />
              </div>
            ) : session?.synced_visual?.svg ? (
              <div
                style={{ width: '100%', maxWidth: 420 }}
                dangerouslySetInnerHTML={{ __html: session.synced_visual.svg }}
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#94A3B8', padding: 20 }}>
                <div
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: '50%',
                    margin: '0 auto 16px',
                    background: isPlayingAudio ? 'radial-gradient(circle, #FF6A00 0%, #0F172A 70%)' : '#1E293B',
                    boxShadow: isPlayingAudio ? '0 0 30px #FF6A00' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Volume2 size={38} color={isPlayingAudio ? '#FFFFFF' : '#64748B'} />
                </div>
                <h4 style={{ color: '#F8FAFC', margin: '0 0 4px', fontSize: '1.05rem' }}>
                  {session?.step_title || 'Active Spoken Lesson'}
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#64748B', maxWidth: 320, margin: '0 auto' }}>
                  {activeHighlightTarget ? (
                    <span style={{ color: '#F97316', fontWeight: 800 }}>
                      Active Component: {activeHighlightTarget.replace('_', ' ').toUpperCase()}
                    </span>
                  ) : (
                    session?.synced_visual?.caption || `Synchronized ICSE Grade ${grade} curriculum explanation.`
                  )}
                </p>
              </div>
            )}

            {/* Pulsing Audio Status Bar */}
            <div
              style={{
                position: 'absolute',
                bottom: 14,
                left: 20,
                right: 20,
                padding: '6px 14px',
                borderRadius: 12,
                background: 'rgba(30, 41, 59, 0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Radio size={14} color={isPlayingAudio ? '#22C55E' : '#94A3B8'} />
                <span style={{ fontSize: '0.74rem', color: '#E2E8F0', fontWeight: 700 }}>
                  {statusNote || 'Voice & Visual Engine Synchronized.'}
                </span>
              </div>
              <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                Step {session ? session.current_step_index + 1 : 1} of {session?.total_steps || 5}
              </span>
            </div>
          </div>

          {/* Right Column: Live Conversation Transcript & Sentence-Synchronized Subtitles */}
          <div
            style={{
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              background: '#F8FAFC',
              overflowY: 'auto'
            }}
          >
            {/* Active Sentence Focus Box */}
            {session?.sentences && session.sentences.length > 0 && (
              <div
                style={{
                  marginBottom: 14,
                  padding: '12px 16px',
                  borderRadius: 14,
                  background: '#FFFFFF',
                  border: '2px solid #FF6A00',
                  boxShadow: '0 4px 14px rgba(255,106,0,0.12)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#EA580C', textTransform: 'uppercase' }}>
                    Sentence-Synchronized Teacher Subtitle
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#64748B' }}>
                    Sentence {activeSentenceIdx + 1} of {session.sentences.length}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.92rem', color: '#0F172A', fontWeight: 600, lineHeight: 1.5 }}>
                  {session.sentences[activeSentenceIdx]?.text || session.teacher_speech}
                </p>
              </div>
            )}

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
              {transcript.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: item.speaker === 'teacher' ? 'flex-start' : 'flex-end',
                    maxWidth: '85%',
                    padding: '12px 16px',
                    borderRadius: 18,
                    background: item.speaker === 'teacher' ? '#FFFFFF' : '#FF6A00',
                    color: item.speaker === 'teacher' ? '#1E293B' : '#FFFFFF',
                    border: item.speaker === 'teacher' ? '1.5px solid #E2E8F0' : 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    fontSize: '0.86rem',
                    lineHeight: 1.5
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      marginBottom: 4,
                      opacity: 0.8,
                      textTransform: 'uppercase'
                    }}
                  >
                    {item.speaker === 'teacher' ? 'AI Teacher' : 'You'}
                  </div>
                  {item.text}
                </div>
              ))}
              {loading && (
                <div
                  style={{
                    alignSelf: 'flex-start',
                    padding: '8px 14px',
                    borderRadius: 14,
                    background: '#FFF7ED',
                    color: '#EA580C',
                    fontSize: '0.78rem',
                    fontWeight: 700
                  }}
                >
                  AI Teacher is thinking...
                </div>
              )}
            </div>

            {/* Interactive Teacher Action Buttons */}
            <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleRepeatSentence}
                style={{
                  padding: '4px 10px',
                  borderRadius: 999,
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#475569',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <RotateCcw size={12} color="#EA580C" />
                <span>Repeat Sentence</span>
              </button>

              <button
                type="button"
                onClick={handleExplainSimpler}
                style={{
                  padding: '4px 10px',
                  borderRadius: 999,
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#475569',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Lightbulb size={12} color="#F59E0B" />
                <span>Explain More Simply</span>
              </button>

              <button
                type="button"
                onClick={handleExplainStepByStep}
                style={{
                  padding: '4px 10px',
                  borderRadius: 999,
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#475569',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <ListOrdered size={12} color="#3B82F6" />
                <span>Explain Step-by-Step</span>
              </button>

              <button
                type="button"
                onClick={() => sendStudentTurn('I understand, continue')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 999,
                  border: '1px solid #22C55E',
                  background: '#F0FDF4',
                  color: '#16A34A',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                "I understand! Continue"
              </button>
            </div>
          </div>
        </div>

        {/* Footer Voice Controls */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1.5px solid rgba(255, 106, 0, 0.15)',
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16
          }}
        >
          {/* Spoken input field with microphone button */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendStudentTurn(studentInput);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}
          >
            <input
              type="text"
              aria-label="Speak or type response"
              placeholder={isListening ? 'Listening to your voice...' : 'Speak into mic or type your answer...'}
              value={studentInput}
              onChange={(e) => setStudentInput(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 999,
                border: isListening ? '2px solid #22C55E' : '1.5px solid #CBD5E1',
                fontSize: '0.86rem',
                outline: 'none'
              }}
            />
            <button
              type="button"
              onClick={isListening ? stopSpeechRecognition : startSpeechRecognition}
              title={isListening ? 'Stop listening' : 'Speak via microphone'}
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                border: 'none',
                background: isListening ? '#22C55E' : '#FF6A00',
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(255,106,0,0.25)'
              }}
            >
              <Mic size={18} />
            </button>
          </form>

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={handleReplayStep}
              className="btn-glass"
              style={{ padding: '8px 14px', fontSize: '0.78rem' }}
              title="Replay current step explanation"
            >
              <RotateCcw size={14} color="#EA580C" />
              <span>Replay Step</span>
            </button>

            <button
              type="button"
              onClick={handleTogglePause}
              className="btn-glass"
              style={{ padding: '8px 14px', fontSize: '0.78rem' }}
              title={isPaused ? 'Resume lesson' : 'Pause lesson'}
            >
              {isPaused ? <Play size={14} color="#22C55E" /> : <Pause size={14} color="#64748B" />}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>

            <button
              type="button"
              onClick={handleEndLesson}
              style={{
                padding: '8px 16px',
                borderRadius: 999,
                border: 'none',
                background: '#EF4444',
                color: '#FFFFFF',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              End Lesson
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
