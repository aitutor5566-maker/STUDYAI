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
                <FuturisticIcon name={item.iconName} size={isActive ? 30 : 26} />
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
    <header
      className="glass-panel top-brand-bar-header"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 22,
        padding: '12px 18px',
        borderRadius: 9999,
        gap: 12,
        flexWrap: 'wrap',
        background: 'rgba(255, 255, 255, 0.86)',
        border: '1.5px solid rgba(255, 106, 0, 0.18)',
        boxShadow: '0 10px 28px -8px rgba(255, 106, 0, 0.12), inset 0 1px 0 #FFFFFF'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {showBack && (
          <button
            type="button"
            onClick={onBack ? onBack : () => navigate(-1)}
            aria-label="Go Back"
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              border: '1.5px solid rgba(255, 106, 0, 0.24)',
              background: '#FFF3E8',
              color: '#FF6A00',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.18s ease'
            }}
          >
            ←
          </button>
        )}
        <div
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: '#FFF3E8',
              border: '1px solid rgba(255, 106, 0, 0.22)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(255, 106, 0, 0.12)'
            }}
          >
            <FuturisticIcon name="logo" size={34} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 900,
                  fontSize: '1.22rem',
                  letterSpacing: '-0.03em',
                  color: '#FF6A00'
                }}
              >
                STUDYAI
              </span>
              <span
                style={{
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: '#FFF3E8',
                  color: '#E85D00',
                  border: '1px solid rgba(255, 106, 0, 0.25)',
                  letterSpacing: '0.04em'
                }}
              >
                AI ECOSYSTEM
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 500, marginTop: 1 }}>
              Active Journey: <strong style={{ color: '#202124', fontWeight: 700 }}>{activeTopic}</strong>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {/* Student Mode Switcher (Populated vs Honest Empty State for New Student) */}
        <select
          aria-label="Select Student Profile Mode"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          style={{
            padding: '8px 14px',
            borderRadius: 999,
            border: '1.5px solid rgba(255, 106, 0, 0.24)',
            background: '#FFFFFF',
            fontSize: '0.79rem',
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

        {streakDays > 0 && (
          <div
            title={`${streakDays}-day learning streak`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              borderRadius: 999,
              background: '#FFF3E8',
              border: '1.5px solid rgba(255, 106, 0, 0.28)',
              color: '#E85D00',
              fontSize: '0.82rem',
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(255, 106, 0, 0.1)'
            }}
          >
            <Flame size={15} fill="#FF6A00" color="#FF6A00" />
            <span>{streakDays}d</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate('/library')}
          aria-label="Notifications and Saved Activity"
          style={{
            position: 'relative',
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '1.5px solid rgba(255, 106, 0, 0.22)',
            background: '#FFFFFF',
            color: '#FF6A00',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(255, 106, 0, 0.1)',
            transition: 'transform 0.18s ease'
          }}
        >
          <Bell size={18} />
          <span
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 8,
              height: 8,
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
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF7A1A 0%, #FF6A00 100%)',
            border: '2px solid #FFFFFF',
            boxShadow: '0 6px 16px rgba(255, 106, 0, 0.28)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            color: '#FFFFFF',
            fontSize: '0.86rem',
            cursor: 'pointer'
          }}
        >
          {studentId === 'student-vishwak' ? 'VS' : 'AS'}
        </div>
      </div>
    </header>
  );
};
