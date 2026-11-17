import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Flame, Sun, Moon, Laptop } from 'lucide-react';
import { FuturisticIcon, FuturisticIconName } from './FuturisticIcons';
import { useLearning } from '../context/LearningContext';
import { useTheme } from '../context/ThemeContext';

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
  const { studentId, setStudentId, studentProfiles, activeProfile } = useLearning();
  const { theme, resolvedTheme, toggleTheme } = useTheme();

  const displayName = activeProfile?.display_name || 'Vishwak Sai';
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('') || 'ST';

  return (
    <header className="glass-panel top-brand-bar-header">
      <div className="top-brand-bar-main-row">
        {/* Left: Back + Compact Brand */}
        <div className="top-brand-bar-brand">
          {showBack && (
            <button
              type="button"
              onClick={onBack ? onBack : () => navigate(-1)}
              aria-label="Go Back"
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: '1.5px solid rgba(255, 106, 0, 0.24)',
                background: '#FFF3E8',
                color: '#FF6A00',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              ←
            </button>
          )}
          <div
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', minWidth: 0 }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: '#FFF3E8',
                border: '1px solid rgba(255, 106, 0, 0.22)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <FuturisticIcon name="logo" size={22} />
            </div>
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 900,
                fontSize: '1rem',
                letterSpacing: '-0.03em',
                color: '#FF6A00',
                whiteSpace: 'nowrap'
              }}
            >
              STUDYAI
            </span>
          </div>
        </div>

        {/* Right: Compact Student Pill, Streak, Theme Toggle, Profile Avatar */}
        <div className="top-brand-bar-actions">
          <select
            aria-label="Active Student Profile"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="top-brand-student-select"
            title="Switch active student profile"
            style={{
              padding: '5px 8px',
              borderRadius: 999,
              border: '1.5px solid rgba(255, 106, 0, 0.24)',
              background: 'var(--bg-card, #FFFFFF)',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'var(--text-primary, #202124)',
              cursor: 'pointer',
              outline: 'none',
              maxWidth: 145,
              textOverflow: 'ellipsis'
            }}
          >
            {studentProfiles && studentProfiles.length > 0 ? (
              studentProfiles.map((p) => (
                <option key={p.id} value={p.slug || p.id}>
                  {p.display_name.split(' ')[0]} • {String(p.current_grade).replace(/Grade\s*/i, 'Gr ')}
                </option>
              ))
            ) : (
              <>
                <option value="student-vishwak">Vishwak • Gr 10</option>
                <option value="student-new">Aarav • Gr 9</option>
              </>
            )}
          </select>

          {streakDays > 0 && (
            <div
              className="header-streak-pill"
              title={`${streakDays}-day learning streak`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                padding: '4px 8px',
                borderRadius: 999,
                background: '#FFF3E8',
                border: '1px solid rgba(255, 106, 0, 0.25)',
                color: '#E85D00',
                fontSize: '0.72rem',
                fontWeight: 800
              }}
            >
              <Flame size={13} fill="#FF6A00" color="#FF6A00" />
              <span>{streakDays}d</span>
            </div>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Toggle theme (currently ${theme})`}
            title={`Theme: ${theme === 'system' ? 'System (' + resolvedTheme + ')' : theme}`}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: '1.5px solid rgba(255, 106, 0, 0.25)',
              background: 'var(--bg-card)',
              color: '#FF6A00',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            {resolvedTheme === 'dark' ? <Moon size={15} /> : <Sun size={15} />}
          </button>

          <button
            type="button"
            onClick={() => navigate('/profile')}
            aria-label={`Open Profile (${displayName})`}
            title={`${displayName} (${activeProfile?.current_grade || 'Grade 10'} • ${activeProfile?.current_board || 'CBSE'})`}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: 'none',
              background: 'linear-gradient(135deg, #FF6A00 0%, #EA580C 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.72rem',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: '0 3px 10px rgba(255, 106, 0, 0.28)'
            }}
          >
            {initials}
          </button>
        </div>
      </div>
    </header>
  );
};
