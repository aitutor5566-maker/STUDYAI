import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface AudioLessonState {
  id: string;
  topic: string;
  script: string;
  spokenScript?: string;
  segments?: string[];
  abbreviationsExpanded?: string[];
  audioValidation?: {
    exists: boolean;
    decodable: boolean;
    isRealSpeech: boolean;
    durationSeconds: number;
    peakLevelDbFs: number;
    rmsLevelDbFs: number;
    clippedSamples: number;
    sampleRateHz: number;
    byteLength: number;
    providerUsed: string;
  };
  wavDataUrl: string;
  durationSeconds: number;
  voice: string;
  language: string;
  speed: number;
  providerUsed?: string;
  reusedCache?: boolean;
}

export interface LearningContextType {
  studentId: 'student-vishwak' | 'student-new';
  setStudentId: (id: 'student-vishwak' | 'student-new') => void;
  activeTopic: string;
  activeSubject: string;
  activeLevel: string;
  explanationMode: 'simple' | 'detailed';
  setTopicContext: (topic: string, subject?: string, mode?: 'simple' | 'detailed') => Promise<void>;
  apiFetch: <T = any>(path: string, options?: RequestInit) => Promise<T>;
  // Persistent Audio Player across navigation
  activeAudio: AudioLessonState | null;
  audioLoading: boolean;
  startAudioLesson: (params: { topic: string; text?: string; voice?: string; speed?: number; saveToLibrary?: boolean }) => Promise<void>;
  closeAudioLesson: () => void;
  // Connected Learning Modals / Studios
  modal3D: { open: boolean; topic: string; modelType?: string };
  open3DLab: (topic?: string, modelType?: string) => void;
  close3DLab: () => void;
  modalImage: { open: boolean; topic: string };
  openImageStudio: (topic?: string) => void;
  closeImageStudio: () => void;
  modalVideo: { open: boolean; topic: string };
  openVideoStudio: (topic?: string) => void;
  closeVideoStudio: () => void;
  modalGames: { open: boolean; topic: string; subject: string; initialGame?: 'answer_battle' | 'learning_runner' | 'space_shooter' };
  openGamesHub: (topic?: string, subject?: string, initialGame?: 'answer_battle' | 'learning_runner' | 'space_shooter') => void;
  closeGamesHub: () => void;
  modalQuiz: { open: boolean; topic: string; subject: string };
  openQuizModal: (topic?: string, subject?: string) => void;
  closeQuizModal: () => void;
  refreshTick: number;
  triggerRefresh: () => void;
}

const LearningContext = createContext<LearningContextType | null>(null);

export const LearningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [studentId, setStudentIdState] = useState<'student-vishwak' | 'student-new'>('student-vishwak');
  const [activeTopic, setActiveTopic] = useState<string>('Photosynthesis');
  const [activeSubject, setActiveSubject] = useState<string>('Science');
  const [activeLevel, setActiveLevel] = useState<string>('Grade 10');
  const [explanationMode, setExplanationMode] = useState<'simple' | 'detailed'>('simple');
  const [refreshTick, setRefreshTick] = useState(0);

  const [activeAudio, setActiveAudio] = useState<AudioLessonState | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);

  const [modal3D, setModal3D] = useState<{ open: boolean; topic: string; modelType?: string }>({ open: false, topic: 'Photosynthesis' });
  const [modalImage, setModalImage] = useState<{ open: boolean; topic: string }>({ open: false, topic: 'Photosynthesis' });
  const [modalVideo, setModalVideo] = useState<{ open: boolean; topic: string }>({ open: false, topic: 'Photosynthesis' });
  const [modalGames, setModalGames] = useState<{
    open: boolean;
    topic: string;
    subject: string;
    initialGame?: 'answer_battle' | 'learning_runner' | 'space_shooter';
  }>({ open: false, topic: 'Photosynthesis', subject: 'Science' });
  const [modalQuiz, setModalQuiz] = useState<{ open: boolean; topic: string; subject: string }>({
    open: false,
    topic: 'Photosynthesis',
    subject: 'Science'
  });

  const triggerRefresh = useCallback(() => {
    setRefreshTick((t) => t + 1);
  }, []);

  const apiFetch = useCallback(
    async <T = any>(path: string, options: RequestInit = {}): Promise<T> => {
      const headers = new Headers(options.headers || {});
      headers.set('X-Student-Id', studentId);
      if (!headers.has('Content-Type') && options.body) {
        headers.set('Content-Type', 'application/json');
      }

      // Direct browser-to-backend call on :3001 when running on Vite dev server (:5173)
      const isViteDev = typeof window !== 'undefined' && window.location.port === '5173';
      const primaryUrl = isViteDev && path.startsWith('/api') ? `http://localhost:3001${path}` : path;

      let res: Response;
      try {
        res = await fetch(primaryUrl, { ...options, headers });
      } catch {
        // Fallback to relative path if direct port isn't used
        res = await fetch(path, { ...options, headers });
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Request failed with status ${res.status}`);
      }
      return data as T;
    },
    [studentId]
  );

  useEffect(() => {
    apiFetch('/api/context')
      .then((ctx) => {
        if (ctx?.active_topic) setActiveTopic(ctx.active_topic);
        if (ctx?.subject) setActiveSubject(ctx.subject);
        if (ctx?.level) setActiveLevel(ctx.level);
        if (ctx?.explanation_mode) setExplanationMode(ctx.explanation_mode);
      })
      .catch(() => {});
  }, [apiFetch]);

  const setStudentId = (id: 'student-vishwak' | 'student-new') => {
    setStudentIdState(id);
    setRefreshTick((t) => t + 1);
  };

  const setTopicContext = useCallback(
    async (topic: string, subject?: string, mode?: 'simple' | 'detailed') => {
      const cleanTopic = topic.trim() || activeTopic;
      setActiveTopic(cleanTopic);
      if (subject) setActiveSubject(subject);
      if (mode) setExplanationMode(mode);
      try {
        const updated = await apiFetch('/api/context', {
          method: 'PUT',
          body: JSON.stringify({
            active_topic: cleanTopic,
            subject: subject || activeSubject,
            level: activeLevel,
            explanation_mode: mode || explanationMode
          })
        });
        if (updated?.subject) setActiveSubject(updated.subject);
      } catch {
        // Ignore transient sync error
      }
    },
    [activeTopic, activeSubject, activeLevel, explanationMode, apiFetch]
  );

  const startAudioLesson = useCallback(
    async (params: { topic: string; text?: string; voice?: string; speed?: number; saveToLibrary?: boolean }) => {
      setAudioLoading(true);
      try {
        const res = await apiFetch<AudioLessonState>('/api/media/audio', {
          method: 'POST',
          body: JSON.stringify({
            topic: params.topic || activeTopic,
            text: params.text,
            voice: params.voice || 'Nova (Teacher)',
            speed: params.speed || 1.0,
            saveToLibrary: params.saveToLibrary ?? true
          })
        });
        setActiveAudio(res);
      } finally {
        setAudioLoading(false);
      }
    },
    [apiFetch, activeTopic]
  );

  const closeAudioLesson = () => setActiveAudio(null);

  const open3DLab = (topic?: string, modelType?: string) => {
    setModal3D({ open: true, topic: topic || activeTopic, modelType });
  };
  const close3DLab = () => setModal3D((prev) => ({ ...prev, open: false }));

  const openImageStudio = (topic?: string) => {
    setModalImage({ open: true, topic: topic || activeTopic });
  };
  const closeImageStudio = () => setModalImage((prev) => ({ ...prev, open: false }));

  const openVideoStudio = (topic?: string) => {
    setModalVideo({ open: true, topic: topic || activeTopic });
  };
  const closeVideoStudio = () => setModalVideo((prev) => ({ ...prev, open: false }));

  const openGamesHub = (topic?: string, subject?: string, initialGame?: 'answer_battle' | 'learning_runner' | 'space_shooter') => {
    setModalGames({
      open: true,
      topic: topic || activeTopic,
      subject: subject || activeSubject,
      initialGame
    });
  };
  const closeGamesHub = () => setModalGames((prev) => ({ ...prev, open: false }));

  const openQuizModal = (topic?: string, subject?: string) => {
    setModalQuiz({
      open: true,
      topic: topic || activeTopic,
      subject: subject || activeSubject
    });
  };
  const closeQuizModal = () => setModalQuiz((prev) => ({ ...prev, open: false }));

  return (
    <LearningContext.Provider
      value={{
        studentId,
        setStudentId,
        activeTopic,
        activeSubject,
        activeLevel,
        explanationMode,
        setTopicContext,
        apiFetch,
        activeAudio,
        audioLoading,
        startAudioLesson,
        closeAudioLesson,
        modal3D,
        open3DLab,
        close3DLab,
        modalImage,
        openImageStudio,
        closeImageStudio,
        modalVideo,
        openVideoStudio,
        closeVideoStudio,
        modalGames,
        openGamesHub,
        closeGamesHub,
        modalQuiz,
        openQuizModal,
        closeQuizModal,
        refreshTick,
        triggerRefresh
      }}
    >
      {children}
    </LearningContext.Provider>
  );
};

export function useLearning() {
  const ctx = useContext(LearningContext);
  if (!ctx) throw new Error('useLearning must be used inside LearningProvider');
  return ctx;
}
