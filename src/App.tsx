import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LearningProvider } from './context/LearningContext';
import { GlassNav } from './components/GlassNav';
import { AudioLessonBar } from './components/AudioLessonBar';
import { Interactive3DLabModal } from './components/Interactive3DLab';
import { ImageGenerationModal, VideoGenerationModal } from './components/MediaStudios';
import { EducationalGamesModal } from './components/EducationalGamesModal';
import { QuizModal } from './components/QuizModal';
import { HomePage } from './pages/HomePage';
import { NotesPage } from './pages/NotesPage';
import { TutorPage } from './pages/TutorPage';
import { LibraryPage } from './pages/LibraryPage';
import { ProfilePage } from './pages/ProfilePage';
import { SuperAdminPage } from './pages/SuperAdminPage';

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error?.message || 'Unexpected rendering error' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="studyai-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="glass-card" style={{ maxWidth: 480, padding: 28, textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#202124', marginBottom: 8 }}>
              STUDYAI Protected Recovery State
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#6B7280', marginBottom: 16 }}>
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, message: '' });
                window.location.href = '/';
              }}
              className="btn-orange"
            >
              Return to Study Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const App: React.FC = () => {
  return (
    <AppErrorBoundary>
      <BrowserRouter>
        <LearningProvider>
          <div className="studyai-shell">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/tutor" element={<TutorPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/superadmin" element={<SuperAdminPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Persistent Cross-Route Audio Player & Connected Ecosystem Modals */}
            <AudioLessonBar />
            <Interactive3DLabModal />
            <ImageGenerationModal />
            <VideoGenerationModal />
            <EducationalGamesModal />
            <QuizModal />

            {/* Shared 5-Destination Floating Pill Glass Navigation */}
            <GlassNav />
          </div>
        </LearningProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  );
};

export default App;
