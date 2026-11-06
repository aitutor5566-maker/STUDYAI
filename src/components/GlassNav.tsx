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

  if (location.pathname.startsWith('/superadmin')) {
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
              <span className="nav-item-icon-box" style={{ background: 'transparent' }}>
                <FuturisticIcon name={item.iconName} size={isActive ? 32 : 28} />
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
  subtitle?: string;
  streakDays?: number;
}> = ({ showBack = false, streakDays = 7 }) => {
  const navigate = useNavigate();
  const { studentId, setStudentId, studentProfiles, activeTopic } = useLearning();

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 18,
        gap: 12,
        flexWrap: 'wrap'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {showBack && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go Back"
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              border: '1px solid rgba(255,106,0,0.2)',
              background: 'rgba(255,255,255,0.8)',
              color: '#FF6A00',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ←
          </button>
        )}
        <div
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
        >
          <FuturisticIcon name="tutor" size={42} />
          <div>
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                fontSize: '1.22rem',
                letterSpacing: '-0.02em',
                color: '#FF6A00'
              }}
            >
              STUDYAI
            </span>
            <div style={{ fontSize: '0.73rem', color: '#6B7280', fontWeight: 500 }}>
              Active Journey: <strong style={{ color: '#202124' }}>{activeTopic}</strong>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Student Mode Switcher (Populated vs Honest Empty State for New Student) */}
        <select
          aria-label="Select Student Profile Mode"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          style={{
            padding: '7px 12px',
            borderRadius: 999,
            border: '1px solid rgba(255,106,0,0.25)',
            background: 'rgba(255,255,255,0.82)',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: '#202124',
            cursor: 'pointer'
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
              gap: 5,
              padding: '6px 12px',
              borderRadius: 999,
              background: '#FFF3E8',
              border: '1px solid rgba(255,106,0,0.25)',
              color: '#E85D00',
              fontSize: '0.82rem',
              fontWeight: 700
            }}
          >
            <Flame size={15} fill="#FF6A00" />
            <span>{streakDays}d</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate('/library')}
          aria-label="Notifications and Saved Activity"
          style={{
            position: 'relative',
            width: 38,
            height: 38,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.85)',
            background: 'rgba(255,255,255,0.82)',
            color: '#FF6A00',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(255,106,0,0.1)'
          }}
        >
          <Bell size={18} />
          <span
            style={{
              position: 'absolute',
              top: 7,
              right: 8,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#FF6A00'
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
            background: 'linear-gradient(135deg, #FFE4CC 0%, #FF9E44 100%)',
            border: '2px solid #FFFFFF',
            boxShadow: '0 4px 12px rgba(255,106,0,0.22)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            color: '#202124',
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          {studentId === 'student-vishwak' ? 'VS' : 'AS'}
        </div>
      </div>
    </header>
  );
};
