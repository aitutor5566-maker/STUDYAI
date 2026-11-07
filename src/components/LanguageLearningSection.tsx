import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Sparkles, BookOpen, Flame, ChevronRight, Award, Image as ImageIcon } from 'lucide-react';
import { useLearning } from '../context/LearningContext';

interface ActiveEnrolment {
  id: string;
  target_language_code: string;
  target_language_name: string;
  target_native_name: string;
  support_language_code: string;
  support_language_name: string;
  current_stage: number;
  current_stage_title?: string;
  current_lesson: number;
  progress_percent: number;
  is_course_completed: number;
  completed_at?: string;
  streak_days?: number;
}

interface LanguageOption {
  code: string;
  name: string;
  native_name: string;
  flag_emoji: string;
  script_name: string;
}

export const LanguageLearningSection: React.FC = () => {
  const navigate = useNavigate();
  const { apiFetch, studentId } = useLearning();

  const [, setLoading] = useState<boolean>(true);
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [activeEnrolment, setActiveEnrolment] = useState<ActiveEnrolment | null>(null);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [, setTotalEnrolled] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      apiFetch('/api/languages').catch(() => ({ languages: [] })),
      apiFetch('/api/languages/enrolments').catch(() => ({ enrolments: [] }))
    ])
      .then(([langsRes, enrolsRes]) => {
        if (!isMounted) return;
        const available = langsRes?.languages || [];
        const enrolments = enrolsRes?.enrolments || [];

        setLanguages(available);
        setTotalEnrolled(enrolments.length);

        const completed = enrolments.filter((e: any) => e.is_course_completed === 1).length;
        setCompletedCount(completed);

        const active = enrolments.find((e: any) => e.is_active === 1) || enrolments[0] || null;
        setActiveEnrolment(active);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [apiFetch, studentId]);

  return (
    <section
      className="glass-card"
      style={{
        marginBottom: 24,
        padding: 26,
        borderRadius: 26,
        background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF9F4 55%, #FFF3E8 100%)',
        border: '1.5px solid rgba(255, 106, 0, 0.28)',
        boxShadow: '0 16px 40px -10px rgba(255, 106, 0, 0.14), inset 0 1px 0 #FFFFFF',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative soft orange ambient glow */}
      <div
        style={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 106, 0, 0.13) 0%, rgba(255, 255, 255, 0) 70%)',
          pointerEvents: 'none'
        }}
      />

      {/* Header and Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 20, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 18,
              background: 'linear-gradient(135deg, #FF7A1A 0%, #FF6A00 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 8px 20px rgba(255, 106, 0, 0.32)',
              fontSize: '1.75rem',
              flexShrink: 0
            }}
          >
            🗣️
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: 999,
                  background: '#FF6A00',
                  color: '#FFFFFF',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em'
                }}
              >
                AI LANGUAGE ECOSYSTEM
              </span>
              <span style={{ fontSize: '0.78rem', color: '#E85D00', fontWeight: 800 }}>
                Multilingual Voice &amp; Picture Vocabulary Studio
              </span>
            </div>
            <h2 style={{ fontSize: '1.38rem', fontWeight: 900, color: '#202124', letterSpacing: '-0.02em', margin: '0 0 4px 0' }}>
              Speaking Skills &amp; Language Learning
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#6B7280', margin: 0 }}>
              Learn new languages, improve your speaking, and communicate confidently.
            </p>
          </div>
        </div>

        {/* Action Button & Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {completedCount > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 999,
                background: '#FFF3E8',
                border: '1.5px solid rgba(255, 106, 0, 0.28)',
                color: '#E85D00',
                fontSize: '0.8rem',
                fontWeight: 800
              }}
            >
              <Award size={15} color="#FF6A00" />
              <span>{completedCount} Course{completedCount > 1 ? 's' : ''} Completed</span>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              borderRadius: 999,
              background: '#FFFFFF',
              border: '1.5px solid rgba(255, 106, 0, 0.24)',
              color: '#E85D00',
              fontSize: '0.8rem',
              fontWeight: 800
            }}
          >
            <Flame size={15} fill="#FF6A00" color="#FF6A00" />
            <span>{activeEnrolment?.streak_days || 3} Day Streak</span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/languages')}
            className="btn-orange"
            style={{ padding: '12px 22px', fontSize: '0.92rem' }}
          >
            <span>{activeEnrolment ? 'Continue Learning' : 'Start Learning'}</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Active Enrolment Status or Intro Banner */}
      {activeEnrolment ? (
        <div
          style={{
            padding: 18,
            borderRadius: 18,
            background: '#FFFFFF',
            border: '1.5px solid rgba(255, 106, 0, 0.2)',
            boxShadow: '0 4px 14px rgba(255, 106, 0, 0.06)',
            marginBottom: 18
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.4rem' }}>
                {languages.find((l) => l.code === activeEnrolment.target_language_code)?.flag_emoji || '🌐'}
              </span>
              <div>
                <span style={{ fontWeight: 900, color: '#202124', fontSize: '1.02rem' }}>
                  {activeEnrolment.target_language_name} ({activeEnrolment.target_native_name})
                </span>
                <span style={{ fontSize: '0.8rem', color: '#6B7280', marginLeft: 8, fontWeight: 600 }}>
                  • Stage {activeEnrolment.current_stage || 1} of 8 • Lesson {activeEnrolment.current_lesson || 1}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: '#6B7280', fontWeight: 700 }}>
              <span>Explained in:</span>
              <span style={{ padding: '3px 10px', borderRadius: 999, background: '#FFF3E8', color: '#E85D00', border: '1px solid rgba(255, 106, 0, 0.24)' }}>
                {activeEnrolment.support_language_name || 'English'}
              </span>
              <span style={{ color: '#FF6A00', fontWeight: 800 }}>• {activeEnrolment.progress_percent || 0}% Complete</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: 9, background: '#FFF3E8', borderRadius: 99, overflow: 'hidden', border: '1px solid rgba(255, 106, 0, 0.14)' }}>
            <div
              style={{
                width: `${Math.min(100, Math.max(5, activeEnrolment.progress_percent || 0))}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #FF8533 0%, #FF6A00 60%, #E85D00 100%)',
                borderRadius: 99,
                transition: 'width 0.4s ease'
              }}
            />
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: 16,
            borderRadius: 16,
            background: '#FFFFFF',
            border: '1.5px solid rgba(255, 106, 0, 0.2)',
            marginBottom: 18,
            fontSize: '0.86rem',
            color: '#202124'
          }}
        >
          💡 <strong style={{ color: '#FF6A00' }}>Choose any target language:</strong> Learn Japanese, French, German, Spanish, English, Telugu, or Hindi explained in your native tongue!
        </div>
      )}

      {/* Available Languages Chips */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
          Available Multilingual Pathways
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {languages.map((lang) => {
            const isCurrent = activeEnrolment?.target_language_code === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => navigate(`/languages?lang=${lang.code}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 999,
                  border: isCurrent ? '2px solid #FF6A00' : '1.5px solid rgba(255, 106, 0, 0.16)',
                  background: isCurrent ? '#FFF3E8' : '#FFFFFF',
                  color: isCurrent ? '#E85D00' : '#202124',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  boxShadow: isCurrent ? '0 4px 12px rgba(255, 106, 0, 0.15)' : '0 2px 6px rgba(32, 33, 36, 0.04)',
                  transition: 'all 0.18s ease'
                }}
              >
                <span>{lang.flag_emoji}</span>
                <span>{lang.name}</span>
                <span style={{ fontSize: '0.72rem', color: isCurrent ? '#FF6A00' : '#6B7280' }}>({lang.native_name})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fast Shortcuts: Picture Vocabulary, Speaking Lab, 7 Language Games & 8 Stages */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 12
        }}
      >
        <div
          onClick={() => navigate('/languages?tab=vocabulary')}
          className="glass-card-interactive"
          style={{
            padding: 14,
            borderRadius: 16,
            background: '#FFFFFF',
            border: '1.5px solid rgba(255, 106, 0, 0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: '#FFF3E8',
              color: '#FF6A00',
              border: '1px solid rgba(255, 106, 0, 0.22)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <ImageIcon size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#202124' }}>
              Picture Vocabulary
            </div>
            <div style={{ fontSize: '0.76rem', color: '#6B7280' }}>
              15 visual categories with audio
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate('/languages?tab=speaking')}
          className="glass-card-interactive"
          style={{
            padding: 14,
            borderRadius: 16,
            background: '#FFFFFF',
            border: '1.5px solid rgba(255, 106, 0, 0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: '#FFF3E8',
              color: '#FF6A00',
              border: '1px solid rgba(255, 106, 0, 0.22)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Mic size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#202124' }}>
              Speaking Practice Lab
            </div>
            <div style={{ fontSize: '0.76rem', color: '#6B7280' }}>
              Pronunciation analysis &amp; voice feedback
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate('/languages?tab=games')}
          className="glass-card-interactive"
          style={{
            padding: 14,
            borderRadius: 16,
            background: '#FFFFFF',
            border: '1.5px solid rgba(255, 106, 0, 0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: '#FFF3E8',
              color: '#FF6A00',
              border: '1px solid rgba(255, 106, 0, 0.22)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#202124' }}>
              7 Interactive Games
            </div>
            <div style={{ fontSize: '0.76rem', color: '#6B7280' }}>
              Matching, sentence builder &amp; voice games
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate('/languages?tab=curriculum')}
          className="glass-card-interactive"
          style={{
            padding: 14,
            borderRadius: 16,
            background: '#FFFFFF',
            border: '1.5px solid rgba(255, 106, 0, 0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: '#FFF3E8',
              color: '#FF6A00',
              border: '1px solid rgba(255, 106, 0, 0.22)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <BookOpen size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#202124' }}>
              8 Progressive Stages
            </div>
            <div style={{ fontSize: '0.76rem', color: '#6B7280' }}>
              From script foundations to fluency
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
