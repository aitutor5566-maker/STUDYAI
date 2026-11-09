import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Flame } from 'lucide-react';
import { FuturisticIcon, FuturisticIconName } from './FuturisticIcons';
import { useLearning } from '../context/LearningContext';

export const GlassNav: React.FC = () => {
  const location = useLocation();
  const items: Array<{ path: string; label: string; ariaLabel: string; iconName: FuturisticIconName }> = [
    { path: '/', label: 'Home', ariaLabel: 'Home Dashboard', iconName: 'home' },
    { path: '/notes', label: 'Notes', ariaLabel: 'AI Notes Studio', iconName: 'notes' },
    { path: '/tutor', label: 'AI Tutor', ariaLabel: 'AI Tutor Teaching Studio', iconName: 'tutor' },
    { path: '/library', label: 'Library', ariaLabel: 'Saved Learning Library', iconName: 'library' },
    { path: '/profile', label: 'Profile', ariaLabel: 'Student Profile and Parent Dashboard', iconName: 'profile' }
  ];

  if (location.pathname.startsWith('/superadmin') || location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <nav className="floating-nav-wrapper" aria-label="Primary Navigation">
      <div className="floating-glass-nav" role="menubar">
        {items.map((item) => {
          const isActive =
            item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              role="menuitem"
              aria-label={item.ariaLabel}
              aria-current={isActive ? 'page' : undefined}
              className={`nav-item-btn ${isActive ? 'active' : ''}`}
            >
              <span className="nav-item-icon-box">
                <FuturisticIcon name={item.iconName} size={isActive ? 24 : 22} />
              </span>
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export const TopBrandBar: React.FC<{
  showBack?: boolean;
  onBack?: () => void;
  subtitle?: string;
  streakDays?: number;
}> = ({ showBack = false, onBack, streakDays = 7 }) => {
  const navigate = useNavigate();
  const { studentId, setStudentId, studentProfiles, activeTopic } = useLearning();

  return (
    <header className="glass-panel top-brand-bar-header">
      {/* Main Top Row: Brand & Quick Action Indicators */}
      <div className="top-brand-bar-main-row">
        <div className="top-brand-bar-brand">
          {showBack && (
            <button
              type="button"
              onClick={onBack ? onBack : () => navigate(-1)}
              aria-label="Go Back"
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: '1.5px solid rgba(255, 106, 0, 0.24)',
                background: '#FFF3E8',
                color: '#FF6A00',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.18s ease'
              }}
            >
              ←
            </button>
          )}
          <div
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', minWidth: 0 }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: '#FFF3E8',
                border: '1px solid rgba(255, 106, 0, 0.22)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(255, 106, 0, 0.12)',
                flexShrink: 0
              }}
            >
              <FuturisticIcon name="logo" size={28} />
            </div>
            <div style={{ minWidth: 0, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'nowrap' }}>
                <span
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 900,
                    fontSize: '1.05rem',
                    letterSpacing: '-0.03em',
                    color: '#FF6A00',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  STUDYAI
                </span>
                <span
                  style={{
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: 999,
                    background: '#FFF3E8',
                    color: '#E85D00',
                    border: '1px solid rgba(255, 106, 0, 0.25)',
                    letterSpacing: '0.04em',
                    flexShrink: 0
                  }}
                >
                  AI
                </span>
              </div>
              <div
                className="desktop-only-journey"
                style={{
                  fontSize: '0.72rem',
                  color: '#6B7280',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: 180
                }}
              >
                Journey: <strong style={{ color: '#202124', fontWeight: 700 }}>{activeTopic}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Badges & Quick Shortcuts */}
        <div className="top-brand-bar-actions">
          {streakDays > 0 && (
            <div
              title={`${streakDays}-day learning streak`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '5px 10px',
                borderRadius: 999,
                background: '#FFF3E8',
                border: '1.5px solid rgba(255, 106, 0, 0.28)',
                color: '#E85D00',
                fontSize: '0.76rem',
                fontWeight: 800,
                boxShadow: '0 4px 12px rgba(255, 106, 0, 0.1)'
              }}
            >
              <Flame size={14} fill="#FF6A00" color="#FF6A00" />
              <span>{streakDays}d</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => navigate('/library')}
            aria-label="Notifications and Saved Activity"
            className="header-bell-btn"
            style={{
              position: 'relative',
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '1.5px solid rgba(255, 106, 0, 0.22)',
              background: '#FFFFFF',
              color: '#FF6A00',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(255, 106, 0, 0.1)',
              transition: 'transform 0.18s ease'
            }}
          >
            <Bell size={16} />
            <span
              style={{
                position: 'absolute',
                top: 7,
                right: 7,
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#FF6A00',
                boxShadow: '0 0 0 2px #FFFFFF'
              }}
            />
          </button>

          <div
            onClick={() => navigate('/profile')}
            role="button"
            tabIndex={0}
            aria-label="Open Student Profile"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FF6A00 0%, #EA580C 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.78rem',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: '0 4px 14px rgba(255, 106, 0, 0.3)'
            }}
          >
            VS
          </div>
        </div>
      </div>

      {/* Sub Row on Mobile / Inline on Desktop: Student Profile Selector */}
      <div className="top-brand-bar-sub-row">
        <select
          aria-label="Select Student Profile Mode"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="top-brand-student-select"
          style={{
            padding: '6px 12px',
            borderRadius: 999,
            border: '1.5px solid rgba(255, 106, 0, 0.24)',
            background: '#FFFFFF',
            fontSize: '0.76rem',
            fontWeight: 700,
            color: '#202124',
            cursor: 'pointer',
            outline: 'none',
            boxShadow: '0 2px 8px rgba(255, 106, 0, 0.06)'
          }}
        >
          {studentProfiles && studentProfiles.length > 0 ? (
            studentProfiles.map((p) => (
              <option key={p.id} value={p.slug || p.id}>
                {p.display_name} ({p.current_grade} • {p.current_board})
              </option>
            ))
          ) : (
            <>
              <option value="student-vishwak">Vishwak Sai (Grade 10 • CBSE)</option>
              <option value="student-new">Aarav (Grade 9 • ICSE)</option>
            </>
          )}
        </select>
      </div>
    </header>
  );
};
