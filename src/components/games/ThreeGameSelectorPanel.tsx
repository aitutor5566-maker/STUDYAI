import React, { useState } from 'react';
import { Play, Sparkles, Shield, Swords, BookOpen, AlertCircle } from 'lucide-react';
import { useLearning } from '../../context/LearningContext';
import {
  THREE_FEATURED_GAMES,
  AuthorisedGameId,
  GameLaunchOrigin,
  getTopicSupportNotice
} from '../../services/gameAccessService';

export interface ThreeGameSelectorPanelProps {
  launchingPage: GameLaunchOrigin;
  topic: string;
  subject?: string;
  language?: string;
  grade?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  learningObjective?: string;
  compact?: boolean;
  onAfterLaunch?: () => void;
}

export const ThreeGameSelectorPanel: React.FC<ThreeGameSelectorPanelProps> = ({
  launchingPage,
  topic,
  subject = 'Science',
  language = 'English',
  grade,
  difficulty = 'medium',
  learningObjective,
  compact = false,
  onAfterLaunch
}) => {
  const { launchAuthorisedGame } = useLearning();
  const [launchError, setLaunchError] = useState<string | null>(null);

  const getIcon = (id: AuthorisedGameId) => {
    if (id === 'war_of_words') return <BookOpen size={18} color="#22D3EE" />;
    if (id === 'study_rush_3d') return <Shield size={18} color="#FF6A00" />;
    return <Swords size={18} color="#F59E0B" />;
  };

  const getGradient = (id: AuthorisedGameId) => {
    if (id === 'war_of_words') return 'linear-gradient(135deg, #050814 0%, #0B1D3A 55%, #083344 100%)';
    if (id === 'study_rush_3d') return 'linear-gradient(135deg, #090D1F 0%, #1E1B4B 55%, #7C2D12 100%)';
    return 'linear-gradient(135deg, #0A1128 0%, #1C2541 55%, #0B525B 100%)';
  };

  const handlePlay = (gameId: AuthorisedGameId, gameName: string) => {
    setLaunchError(null);
    const result = launchAuthorisedGame({
      gameId,
      gameName,
      launchingPage,
      subject,
      topic: topic || 'General Knowledge',
      language,
      grade,
      difficulty,
      learningObjective
    });
    if (!result.authorized) {
      setLaunchError(result.reason || 'Game launch was rejected.');
      return;
    }
    onAfterLaunch?.();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {launchError && (
        <div
          style={{
            padding: '10px 12px',
            borderRadius: 10,
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#991B1B',
            fontSize: '0.8rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <AlertCircle size={16} />
          <span>{launchError}</span>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: compact ? 'repeat(auto-fit, minmax(220px, 1fr))' : 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 12
        }}
      >
        {THREE_FEATURED_GAMES.map((game) => {
          const notice = getTopicSupportNotice(game.id, subject, topic);
          return (
            <div
              key={game.id}
              style={{
                background: getGradient(game.id),
                border: `1.5px solid ${game.accentColor}`,
                borderRadius: 16,
                padding: compact ? 14 : 16,
                color: '#F8FAFC',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 10,
                boxShadow: '0 8px 20px rgba(15, 23, 42, 0.22)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        background: 'rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {getIcon(game.id)}
                    </div>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: game.accentColor
                      }}
                    >
                      {game.badge}
                    </span>
                  </div>
                  <Sparkles size={13} color={game.accentColor} />
                </div>

                <h4 style={{ margin: '0 0 4px', fontSize: '0.94rem', fontWeight: 900, color: '#FFFFFF' }}>
                  {game.name}
                </h4>
                <p style={{ margin: 0, fontSize: '0.76rem', color: '#CBD5E1', lineHeight: 1.45 }}>
                  {game.description}
                </p>

                {notice && (
                  <p style={{ margin: '6px 0 0', fontSize: '0.7rem', color: '#FDE68A', lineHeight: 1.35 }}>
                    Note: {notice}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => handlePlay(game.id, game.name)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 10,
                  border: 'none',
                  background: game.accentColor,
                  color: game.id === 'war_of_words' || game.id === 'katana_wisdom' ? '#0F172A' : '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <Play size={14} fill="currentColor" />
                <span>Play Fullscreen</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
