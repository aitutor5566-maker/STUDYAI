import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, X } from 'lucide-react';
import { useLearning } from '../context/LearningContext';

export const AudioLessonBar: React.FC = () => {
  const { activeAudio, startAudioLesson, closeAudioLesson } = useLearning();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(12);
  const [speed, setSpeed] = useState(1.0);
  const [voice, setVoice] = useState('Nova (Teacher)');

  useEffect(() => {
    if (!activeAudio) return;
    setSpeed(activeAudio.speed || 1.0);
    setVoice(activeAudio.voice || 'Nova (Teacher)');
    setCurrentTime(0);
    setDuration(activeAudio.durationSeconds || 12);

    const isNeuralAudio =
      Boolean(activeAudio.audioValidation?.isRealSpeech) ||
      activeAudio.wavDataUrl?.startsWith('data:audio/mpeg') ||
      Boolean(activeAudio.providerUsed && !activeAudio.providerUsed.includes('Fallback'));

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    if (isNeuralAudio && audioRef.current) {
      audioRef.current.src = activeAudio.wavDataUrl;
      audioRef.current.volume = 1.0;
      audioRef.current.playbackRate = activeAudio.speed || 1.0;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else if (!isNeuralAudio && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Do NOT play the 8kHz fallback chime simultaneously over speechSynthesis!
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
      }
      try {
        const spoken = activeAudio.spokenScript || activeAudio.script;
        const segments = activeAudio.segments && activeAudio.segments.length > 0 ? activeAudio.segments : [spoken];
        segments.forEach((seg, idx) => {
          const utter = new SpeechSynthesisUtterance(seg);
          utter.rate = activeAudio.speed || 1.0;
          utter.volume = 1.0;
          if (idx === 0) utter.onstart = () => setIsPlaying(true);
          if (idx === segments.length - 1) utter.onend = () => setIsPlaying(false);
          window.speechSynthesis.speak(utter);
        });
        setIsPlaying(true);
      } catch {
        if (audioRef.current) {
          audioRef.current.src = activeAudio.wavDataUrl;
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
      }
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }
    };
  }, [activeAudio]);

  if (!activeAudio) return null;

  const isNeuralStream =
    Boolean(activeAudio.audioValidation?.isRealSpeech) ||
    activeAudio.wavDataUrl?.startsWith('data:audio/mpeg') ||
    Boolean(activeAudio.providerUsed && !activeAudio.providerUsed.includes('Fallback'));

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      if (isNeuralStream) {
        audioRef.current.pause();
      } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.pause();
        } catch {}
      }
      setIsPlaying(false);
    } else {
      if (isNeuralStream) {
        audioRef.current.play().catch(() => {});
      } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.resume();
        } catch {}
      }
      setIsPlaying(true);
    }
  };

  const handleReplay = () => {
    if (!audioRef.current) return;
    if (isNeuralStream) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const spoken = activeAudio.spokenScript || activeAudio.script;
        const utter = new SpeechSynthesisUtterance(spoken);
        utter.rate = speed;
        utter.volume = 1.0;
        window.speechSynthesis.speak(utter);
      } catch {}
    }
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextTime = Number(e.target.value);
    setCurrentTime(nextTime);
    if (audioRef.current) {
      audioRef.current.currentTime = nextTime;
    }
  };

  const handleSpeedChange = (nextSpeed: number) => {
    setSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const handleVoiceChange = (nextVoice: string) => {
    setVoice(nextVoice);
    startAudioLesson({
      topic: activeAudio.topic,
      text: activeAudio.script,
      voice: nextVoice,
      speed
    });
  };

  const fmtTime = (sec: number) => {
    const s = Math.max(0, Math.floor(sec));
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div
      role="region"
      aria-label="Natural Audio Lesson Player"
      style={{
        position: 'fixed',
        left: 16,
        right: 16,
        bottom: 92,
        zIndex: 1100,
        maxWidth: 760,
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(24px)',
        border: '1.5px solid rgba(255, 106, 0, 0.35)',
        borderRadius: 22,
        padding: '12px 16px',
        boxShadow: '0 14px 36px rgba(255, 106, 0, 0.2)'
      }}
    >
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current && audioRef.current.duration) {
            setDuration(audioRef.current.duration);
          }
        }}
        onEnded={() => setIsPlaying(false)}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: '#FFF3E8',
              color: '#FF6A00',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Volume2 size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#202124', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span>Audio Lesson: {activeAudio.topic}</span>
              <span
                style={{
                  fontSize: '0.68rem',
                  padding: '2px 7px',
                  borderRadius: 999,
                  background: '#EFF6FF',
                  color: '#1D4ED8',
                  fontWeight: 600
                }}
              >
                {activeAudio.providerUsed || 'Clear Teacher Voice'} • {activeAudio.audioValidation?.peakLevelDbFs ?? -1.0} dBFS
              </span>
              {activeAudio.reusedCache && (
                <span
                  style={{
                    fontSize: '0.68rem',
                    padding: '2px 7px',
                    borderRadius: 999,
                    background: '#ECFDF5',
                    color: '#047857',
                    fontWeight: 600
                  }}
                >
                  Cached Asset Reused
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6B7280', maxWidth: 340, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeAudio.spokenScript || activeAudio.script}
            </div>
          </div>
        </div>

        {/* Playback Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 220 }}>
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause Audio' : 'Play Audio'}
            className="btn-orange"
            style={{ padding: '8px 14px', fontSize: '0.82rem' }}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            type="button"
            onClick={handleReplay}
            aria-label="Replay Audio"
            className="btn-glass"
            style={{ padding: '7px 10px' }}
          >
            <RotateCcw size={15} />
          </button>

          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', minWidth: 68 }}>
            {fmtTime(currentTime)} / {fmtTime(duration)}
          </span>

          <input
            type="range"
            aria-label="Seek Audio Progress"
            min={0}
            max={duration || 12}
            step={0.2}
            value={currentTime}
            onChange={handleSeek}
            style={{ flex: 1, accentColor: '#FF6A00', cursor: 'pointer' }}
          />
        </div>

        {/* Speed & Voice selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <select
            aria-label="Playback Speed"
            value={speed}
            onChange={(e) => handleSpeedChange(Number(e.target.value))}
            style={{
              padding: '4px 8px',
              borderRadius: 999,
              border: '1px solid rgba(255,106,0,0.25)',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: '#FFF3E8',
              color: '#E85D00'
            }}
          >
            <option value={0.75}>0.75x</option>
            <option value={1}>1.0x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2.0x</option>
          </select>

          <select
            aria-label="Voice Selection"
            value={voice}
            onChange={(e) => handleVoiceChange(e.target.value)}
            style={{
              padding: '4px 8px',
              borderRadius: 999,
              border: '1px solid rgba(0,0,0,0.12)',
              fontSize: '0.75rem',
              background: '#FFFFFF'
            }}
          >
            <option value="Nova (Teacher)">Nova (EN)</option>
            <option value="Aarav (Science Mentor)">Aarav (IN)</option>
            <option value="Clara (Detailed)">Clara (UK)</option>
          </select>

          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                try {
                  window.speechSynthesis.cancel();
                } catch {}
              }
              closeAudioLesson();
            }}
            aria-label="Close Audio Player"
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(0,0,0,0.06)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
