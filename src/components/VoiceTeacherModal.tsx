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
  MessageSquare
} from 'lucide-react';
import { Interactive3DLab } from './Interactive3DLab';

interface VoiceSessionResponse {
  session_id: string;
  status: string;
  topic: string;
  grade: number;
  subject: string;
  mode: string;
  current_step_index: number;
  total_steps: number;
  step_title: string;
  teacher_speech: string;
  audio_url?: string;
  audio_duration_seconds?: number;
  provider_used?: string;
  synced_visual?: {
    type: string;
    model_key?: string;
    svg?: string;
    caption?: string;
  };
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
  const [transcript, setTranscript] = useState<Array<{ speaker: 'teacher' | 'student'; text: string }>>([]);
  const [statusNote, setStatusNote] = useState<string>('');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen && !session) {
      handleStartLesson();
    }
    return () => {
      stopAudioPlayback();
      stopSpeechRecognition();
    };
  }, [isOpen]);

  const handleStartLesson = async () => {
    setLoading(true);
    setStatusNote('Connecting to Gemini Voice Lesson Orchestrator...');
    try {
      // Explicitly check mic permission
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
          voice_name: voiceName,
          speed: 1.0
        })
      });

      setSession(res);
      setTranscript([{ speaker: 'teacher', text: res.teacher_speech }]);
      setStatusNote(`Teacher speaking (${res.provider_used || 'Gemini Native Audio'})...`);

      if (res.audio_url) {
        playSpokenAudio(res.audio_url);
      }
    } catch (err: any) {
      setStatusNote(`Voice startup notice: ${err?.message || 'Unable to start audio lesson'}`);
    } finally {
      setLoading(false);
    }
  };

  const playSpokenAudio = (audioUrl: string) => {
    stopAudioPlayback();
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onplay = () => setIsPlayingAudio(true);
    audio.onended = () => {
      setIsPlayingAudio(false);
      setStatusNote('Listening to student... (Say your answer, or tap options below)');
      startSpeechRecognition();
    };
    audio.onerror = () => {
      setIsPlayingAudio(false);
      setStatusNote('Audio ended. Waiting for student response.');
    };

    audio.play().catch((e) => {
      console.warn('Audio auto-play blocked, student can click play:', e);
      setIsPlayingAudio(false);
    });
  };

  const stopAudioPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
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
      recog.lang = 'en-US';

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

  const sendStudentTurn = async (utterance: string) => {
    if (!session || !utterance.trim()) return;
    stopAudioPlayback();
    stopSpeechRecognition();

    setTranscript((prev) => [...prev, { speaker: 'student', text: utterance }]);
    setStudentInput('');
    setLoading(true);
    setStatusNote('Teacher is formulating response...');

    try {
      const res = await apiFetch<VoiceSessionResponse>('/api/v1/voice/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.session_id,
          student_utterance: utterance
        })
      });

      setSession(res);
      setTranscript((prev) => [...prev, { speaker: 'teacher', text: res.teacher_speech }]);
      setStatusNote('Teacher speaking...');

      if (res.audio_url) {
        playSpokenAudio(res.audio_url);
      }
    } catch (err: any) {
      setStatusNote(`Turn error: ${err?.message || 'Could not process turn'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInterrupt = () => {
    stopAudioPlayback();
    setStatusNote('Teacher paused. Ask your question or share your thought.');
    startSpeechRecognition();
  };

  const handleExplainAgain = () => {
    sendStudentTurn('Explain again, please.');
  };

  const handleTogglePause = () => {
    if (isPlayingAudio && audioRef.current) {
      audioRef.current.pause();
      setIsPaused(true);
      setStatusNote('Lesson paused.');
    } else if (isPaused && audioRef.current) {
      audioRef.current.play();
      setIsPaused(false);
      setStatusNote('Lesson resumed.');
    }
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
          maxWidth: 960,
          maxHeight: '92vh',
          borderRadius: 24,
          background: 'rgba(255, 255, 255, 0.98)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.3)',
          border: '2px solid rgba(255, 106, 0, 0.35)',
          overflow: 'hidden'
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '16px 24px',
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
                  AI Teacher Voice Lesson
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
                Topic: <strong>{topic}</strong> • Conversational Audio powered by Google Gemini
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Voice persona selector */}
            <select
              aria-label="Select Teacher Voice"
              value={voiceName}
              onChange={(e) => setVoiceName(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: 999,
                border: '1.5px solid #CBD5E1',
                fontSize: '0.76rem',
                fontWeight: 700,
                color: '#334155',
                background: '#FFFFFF'
              }}
            >
              <option value="Kore">Kore (Patient Teacher)</option>
              <option value="Puck">Puck (Science Mentor)</option>
              <option value="Aoede">Aoede (Expressive)</option>
              <option value="Fenrir">Fenrir (Authoritative)</option>
            </select>

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
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', flex: 1, minHeight: 400, overflow: 'hidden' }}>
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
            {session?.synced_visual?.type === '3d_model' ? (
              <div style={{ width: '100%', height: '100%', minHeight: 320 }}>
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
                <p style={{ fontSize: '0.8rem', color: '#64748B', maxWidth: 300, margin: '0 auto' }}>
                  {session?.synced_visual?.caption || `Synchronized ICSE Grade ${grade} curriculum explanation.`}
                </p>
              </div>
            )}

            {/* Pulsing Audio Waveform Bar */}
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
                  {statusNote || 'Voice channel ready.'}
                </span>
              </div>
              <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                Step {session ? session.current_step_index + 1 : 1} of {session?.total_steps || 5}
              </span>
            </div>
          </div>

          {/* Right Column: Live Conversation Transcript & Subtitles */}
          <div
            style={{
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              background: '#F8FAFC',
              overflowY: 'auto'
            }}
          >
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

            {/* Quick Suggested Spoken Phrases */}
            <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['I understand!', 'Explain again', 'Give me an example', "I don't understand"].map((phrase) => (
                <button
                  key={phrase}
                  type="button"
                  onClick={() => sendStudentTurn(phrase)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 999,
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#475569',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  "{phrase}"
                </button>
              ))}
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
              onClick={handleInterrupt}
              className="btn-glass"
              style={{ padding: '8px 14px', fontSize: '0.78rem' }}
              title="Interrupt and ask a question"
            >
              <MessageSquare size={14} color="#EA580C" />
              <span>Interrupt / Ask</span>
            </button>

            <button
              type="button"
              onClick={handleExplainAgain}
              className="btn-glass"
              style={{ padding: '8px 14px', fontSize: '0.78rem' }}
              title="Ask teacher to repeat or explain simply"
            >
              <RotateCcw size={14} color="#475569" />
              <span>Explain Again</span>
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
