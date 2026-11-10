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

export interface StudentProfileItem {
  id: string;
  family_id: string;
  display_name: string;
  slug?: string;
  avatar_url?: string;
  current_grade: string;
  current_board: string;
  enrolled_subjects?: string[];
  target_board?: string;
  class_grade?: string;
}

export interface LearningContextType {
  studentId: string;
  setStudentId: (id: string) => void;
  studentProfiles: StudentProfileItem[];
  activeProfile: StudentProfileItem | null;
  refreshProfiles: () => Promise<void>;
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
  // Weekly Examinations & Mock Tests Modal
  modalExam: { open: boolean; topic: string; subject: string };
  openExamModal: (topic?: string, subject?: string) => void;
  closeExamModal: () => void;
  refreshTick: number;
  triggerRefresh: () => void;
}

const LearningContext = createContext<LearningContextType | null>(null);

export const LearningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [studentId, setStudentIdState] = useState<string>('student-vishwak');
  const [studentProfiles, setStudentProfiles] = useState<StudentProfileItem[]>([
    { id: 'profile-vishwak', family_id: 'family-sai', display_name: 'Vishwak Sai', slug: 'student-vishwak', current_grade: 'Grade 10', current_board: 'CBSE' },
    { id: 'profile-aarav', family_id: 'family-sai', display_name: 'Aarav Sharma', slug: 'student-new', current_grade: 'Grade 9', current_board: 'ICSE' }
  ]);
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
  const [modalExam, setModalExam] = useState<{ open: boolean; topic: string; subject: string }>({
    open: false,
    topic: 'Human Heart',
    subject: 'Science'
  });

  const triggerRefresh = useCallback(() => {
    setRefreshTick((t) => t + 1);
  }, []);

  const apiFetch = useCallback(
    async <T = any>(path: string, options: RequestInit = {}): Promise<T> => {
      const headers = new Headers(options.headers || {});
      headers.set('X-Student-Id', studentId);
      if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
        headers.set('Content-Type', 'application/json');
      }

      // Check if browser is strictly offline
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        throw new Error('You appear to be offline. Please check your internet connection.');
      }

      // Robust URL resolution:
      // When accessed from mobile devices, tunnels, or external IPs, always use relative path so it routes through proxy/tunnel.
      // Only attempt direct localhost:3001 if the browser itself is on desktop localhost.
      const isLocalDesktop =
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
        window.location.port === '5173';

      const candidateUrls: string[] = [path];
      if (isLocalDesktop && path.startsWith('/api')) {
        candidateUrls.push(`http://localhost:3001${path}`);
      }

      let lastError: Error | null = null;
      let res: Response | null = null;

      for (const targetUrl of candidateUrls) {
        try {
          // Timeout protection: abort after 45 seconds if request hangs
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 45000);
          const signal = options.signal || controller.signal;

          res = await fetch(targetUrl, {
            ...options,
            headers,
            signal
          });
          clearTimeout(timeoutId);

          if (res) break;
        } catch (fetchErr: any) {
          lastError = fetchErr;
        }
      }

      if (!res) {
        const errorMsg = lastError?.name === 'AbortError'
          ? 'Request timed out after 45 seconds. Please try again.'
          : (lastError?.message === 'Failed to fetch'
              ? 'Unable to connect to STUDYAI service. Please verify the backend server is reachable.'
              : (lastError?.message || 'Network request failed. Please check your connection.')) ;
        throw new Error(errorMsg);
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const serverError = data.error || data.message || `Request failed with status ${res.status}`;
        throw new Error(serverError);
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

  const refreshProfiles = useCallback(async () => {
    try {
      const res = await apiFetch<{ profiles: StudentProfileItem[] }>('/api/student/profiles');
      if (Array.isArray(res?.profiles) && res.profiles.length > 0) {
        setStudentProfiles(res.profiles);
      }
    } catch {
      // Fallback
    }
  }, [apiFetch]);

  useEffect(() => {
    refreshProfiles();
  }, [refreshProfiles]);

  const activeProfile = studentProfiles.find((p) => p.slug === studentId || p.id === studentId) || studentProfiles[0] || null;

  const setStudentId = (id: string) => {
    setStudentIdState(id);
    const matched = studentProfiles.find((p) => p.slug === id || p.id === id);
    if (matched?.current_grade) {
      setActiveLevel(matched.current_grade);
    }
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

  const openExamModal = (topic?: string, subject?: string) => {
    setModalExam({
      open: true,
      topic: topic || activeTopic,
      subject: subject || activeSubject
    });
  };
  const closeExamModal = () => setModalExam((prev) => ({ ...prev, open: false }));

  return (
    <LearningContext.Provider
      value={{
        studentId,
        setStudentId,
        studentProfiles,
        activeProfile,
        refreshProfiles,
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
        modalExam,
        openExamModal,
        closeExamModal,
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
