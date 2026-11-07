import React from 'react';

export type FuturisticIconName =
  | 'logo'
  | 'tutor'
  | 'notes'
  | 'games'
  | 'lab3d'
  | 'video'
  | 'image'
  | 'library'
  | 'quiz'
  | 'home'
  | 'profile'
  | 'language'
  | 'mindmap'
  | 'flashcards'
  | 'audio'
  | 'slides'
  | 'infographic'
  | 'report'
  | 'table';

export const FuturisticIcon: React.FC<{
  name: FuturisticIconName;
  size?: number;
}> = ({ name, size = 44 }) => {
  switch (name) {
    case 'logo':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" className="futuristic-svg-icon">
          <defs>
            <linearGradient id="fi-logo-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FF8533" />
              <stop offset="50%" stopColor="#FF6A00" />
              <stop offset="100%" stopColor="#E85D00" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="18" fill="url(#fi-logo-bg)" />
          {/* Open Knowledge Book + AI Spark */}
          <path d="M16 24 C16 20, 24 20, 32 24 C40 20, 48 20, 48 24 V44 C48 41, 40 41, 32 45 C24 41, 16 41, 16 44 Z" fill="#FFFFFF" />
          <line x1="32" y1="24" x2="32" y2="45" stroke="#FF6A00" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M32 11 L34.2 16.8 L40 19 L34.2 21.2 L32 27 L29.8 21.2 L24 19 L29.8 16.8 Z" fill="#FFF3E8" />
        </svg>
      );

    case 'tutor':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" className="futuristic-svg-icon">
          <defs>
            <linearGradient id="fi-tutor-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FF9E44" />
              <stop offset="55%" stopColor="#FF6A00" />
              <stop offset="100%" stopColor="#E85D00" />
            </linearGradient>
            <radialGradient id="fi-tutor-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFF3E8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#FF6A00" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="18" fill="url(#fi-tutor-bg)" />
          <circle cx="32" cy="32" r="24" fill="url(#fi-tutor-glow)" opacity="0.35" />
          {/* Antenna */}
          <line x1="32" y1="10" x2="32" y2="18" stroke="#FFF" strokeWidth="3" strokeLinecap="round" />
          <circle cx="32" cy="9" r="3.5" fill="#FFF3E8" />
          {/* 3D Robot Head */}
          <rect x="15" y="18" width="34" height="26" rx="11" fill="#FFFFFF" stroke="#FFF3E8" strokeWidth="2" />
          {/* Futuristic Visor */}
          <rect x="20" y="23" width="24" height="13" rx="6.5" fill="#202124" />
          <circle cx="26.5" cy="29.5" r="2.8" fill="#FF6A00" />
          <circle cx="37.5" cy="29.5" r="2.8" fill="#FF6A00" />
          <path d="M29 33 Q32 35.5 35 33" stroke="#FFF3E8" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Base collar */}
          <path d="M22 46 H42 L45 53 H19 Z" fill="#FFF3E8" opacity="0.92" />
        </svg>
      );

    case 'notes':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" className="futuristic-svg-icon">
          <defs>
            <linearGradient id="fi-notes-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FF8533" />
              <stop offset="55%" stopColor="#FF6A00" />
              <stop offset="100%" stopColor="#E85D00" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="18" fill="url(#fi-notes-bg)" />
          <rect x="16" y="13" width="28" height="38" rx="6" fill="#FFFFFF" />
          <rect x="21" y="20" width="18" height="3.5" rx="1.75" fill="#FF6A00" />
          <rect x="21" y="27" width="18" height="3" rx="1.5" fill="#6B7280" />
          <rect x="21" y="33" width="14" height="3" rx="1.5" fill="#6B7280" />
          <rect x="21" y="39" width="11" height="3" rx="1.5" fill="#FF8533" />
          {/* Glowing AI Spark Pen */}
          <path d="M38 36 L49 25 L53 29 L42 40 L36 42 Z" fill="#202124" stroke="#FFF" strokeWidth="1.5" />
          <circle cx="49" cy="17" r="4" fill="#FFF3E8" />
        </svg>
      );

    case 'games':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" className="futuristic-svg-icon">
          <defs>
            <linearGradient id="fi-games-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FF8533" />
              <stop offset="50%" stopColor="#FF6A00" />
              <stop offset="100%" stopColor="#E85D00" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="18" fill="url(#fi-games-bg)" />
          <path
            d="M14 33 C14 24, 21 21, 32 21 C43 21, 50 24, 50 33 C50 41, 46 47, 41 47 C37 47, 35 42, 32 42 C29 42, 27 47, 23 47 C18 47, 14 41, 14 33 Z"
            fill="#FFFFFF"
          />
          {/* D-Pad */}
          <rect x="21" y="29" width="8" height="3" rx="1" fill="#FF6A00" />
          <rect x="23.5" y="26.5" width="3" height="8" rx="1" fill="#FF6A00" />
          {/* Action Buttons */}
          <circle cx="40" cy="28.5" r="2.4" fill="#FF6A00" />
          <circle cx="43.5" cy="32" r="2.4" fill="#E85D00" />
          <circle cx="36.5" cy="32" r="2.4" fill="#FF8533" />
          <circle cx="40" cy="35.5" r="2.4" fill="#202124" />
        </svg>
      );

    case 'lab3d':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" className="futuristic-svg-icon">
          <defs>
            <linearGradient id="fi-3d-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FF8533" />
              <stop offset="50%" stopColor="#FF6A00" />
              <stop offset="100%" stopColor="#E85D00" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="18" fill="url(#fi-3d-bg)" />
          {/* Isometric 3D Cube */}
          <polygon points="32,13 49,23 32,33 15,23" fill="#FFFFFF" />
          <polygon points="15,23 32,33 32,51 15,41" fill="#FFF3E8" />
          <polygon points="49,23 32,33 32,51 49,41" fill="#FFD1B3" />
          <circle cx="32" cy="33" r="4" fill="#FF6A00" />
        </svg>
      );

    case 'video':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" className="futuristic-svg-icon">
          <defs>
            <linearGradient id="fi-vid-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FF8533" />
              <stop offset="50%" stopColor="#FF6A00" />
              <stop offset="100%" stopColor="#E85D00" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="18" fill="url(#fi-vid-bg)" />
          <rect x="13" y="17" width="38" height="30" rx="8" fill="#FFFFFF" />
          <polygon points="28,25 41,32 28,39" fill="#FF6A00" />
          <circle cx="46" cy="18" r="5" fill="#202124" stroke="#FFF" strokeWidth="1.5" />
        </svg>
      );

    case 'image':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" className="futuristic-svg-icon">
          <defs>
            <linearGradient id="fi-img-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FF8533" />
              <stop offset="50%" stopColor="#FF6A00" />
              <stop offset="100%" stopColor="#E85D00" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="18" fill="url(#fi-img-bg)" />
          <rect x="13" y="15" width="38" height="34" rx="8" fill="#FFFFFF" />
          <circle cx="24" cy="25" r="4.5" fill="#FF8533" />
          <path d="M16 44 L27 32 L35 40 L41 34 L48 44 Z" fill="#FF6A00" />
        </svg>
      );

    case 'library':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" className="futuristic-svg-icon">
          <defs>
            <linearGradient id="fi-lib-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FF8533" />
              <stop offset="100%" stopColor="#E85D00" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="18" fill="url(#fi-lib-bg)" />
          <rect x="15" y="16" width="9" height="32" rx="3" fill="#FFFFFF" />
          <rect x="26" y="14" width="9" height="34" rx="3" fill="#FFF3E8" />
          <rect x="38" y="17" width="9" height="31" rx="3" transform="rotate(8 38 17)" fill="#FFD1B3" />
        </svg>
      );

    case 'quiz':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" className="futuristic-svg-icon">
          <defs>
            <linearGradient id="fi-quiz-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FF8533" />
              <stop offset="50%" stopColor="#FF6A00" />
              <stop offset="100%" stopColor="#E85D00" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="18" fill="url(#fi-quiz-bg)" />
          <polygon points="35,12 20,34 31,34 28,52 45,28 34,28" fill="#FFFFFF" />
        </svg>
      );

    case 'language':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" className="futuristic-svg-icon">
          <defs>
            <linearGradient id="fi-lang-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FF8533" />
              <stop offset="100%" stopColor="#E85D00" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="18" fill="url(#fi-lang-bg)" />
          <rect x="14" y="16" width="24" height="18" rx="6" fill="#FFFFFF" />
          <rect x="26" y="28" width="24" height="18" rx="6" fill="#FFF3E8" />
          <text x="26" y="29" fill="#FF6A00" fontSize="12" fontWeight="900" textAnchor="middle">A</text>
          <text x="38" y="41" fill="#E85D00" fontSize="11" fontWeight="900" textAnchor="middle">あ</text>
        </svg>
      );

    case 'mindmap':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" className="futuristic-svg-icon">
          <rect x="4" y="4" width="56" height="56" rx="18" fill="#FF6A00" />
          <line x1="32" y1="32" x2="18" y2="20" stroke="#FFF3E8" strokeWidth="2.5" />
          <line x1="32" y1="32" x2="46" y2="20" stroke="#FFF3E8" strokeWidth="2.5" />
          <line x1="32" y1="32" x2="18" y2="44" stroke="#FFF3E8" strokeWidth="2.5" />
          <line x1="32" y1="32" x2="46" y2="44" stroke="#FFF3E8" strokeWidth="2.5" />
          <circle cx="32" cy="32" r="7" fill="#FFFFFF" />
          <circle cx="18" cy="20" r="4.5" fill="#FFF3E8" />
          <circle cx="46" cy="20" r="4.5" fill="#FFF3E8" />
          <circle cx="18" cy="44" r="4.5" fill="#FFF3E8" />
          <circle cx="46" cy="44" r="4.5" fill="#FFF3E8" />
        </svg>
      );

    case 'flashcards':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" className="futuristic-svg-icon">
          <rect x="4" y="4" width="56" height="56" rx="18" fill="#FF6A00" />
          <rect x="20" y="14" width="28" height="34" rx="5" fill="#FFF3E8" transform="rotate(6 20 14)" />
          <rect x="15" y="16" width="28" height="34" rx="5" fill="#FFFFFF" />
          <rect x="20" y="24" width="18" height="3" rx="1.5" fill="#FF6A00" />
          <rect x="20" y="31" width="14" height="3" rx="1.5" fill="#6B7280" />
        </svg>
      );

    case 'audio':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" className="futuristic-svg-icon">
          <rect x="4" y="4" width="56" height="56" rx="18" fill="#FF6A00" />
          <rect x="16" y="26" width="4" height="12" rx="2" fill="#FFF3E8" />
          <rect x="23" y="19" width="4" height="26" rx="2" fill="#FFFFFF" />
          <rect x="30" y="14" width="4" height="36" rx="2" fill="#FFFFFF" />
          <rect x="37" y="21" width="4" height="22" rx="2" fill="#FFF3E8" />
          <rect x="44" y="27" width="4" height="10" rx="2" fill="#FFF3E8" />
        </svg>
      );

    case 'slides':
    case 'infographic':
    case 'report':
    case 'table':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" className="futuristic-svg-icon">
          <rect x="4" y="4" width="56" height="56" rx="18" fill="#FF6A00" />
          <rect x="14" y="16" width="36" height="32" rx="6" fill="#FFFFFF" />
          <rect x="19" y="22" width="12" height="10" rx="2" fill="#FF6A00" />
          <rect x="34" y="22" width="11" height="4" rx="1.5" fill="#6B7280" />
          <rect x="34" y="28" width="11" height="4" rx="1.5" fill="#FF8533" />
          <rect x="19" y="36" width="26" height="6" rx="2" fill="#FFF3E8" />
        </svg>
      );

    case 'home':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" className="futuristic-svg-icon">
          <defs>
            <linearGradient id="fi-home-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FF8533" />
              <stop offset="100%" stopColor="#E85D00" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="18" fill="url(#fi-home-bg)" />
          <path d="M16 30 L32 16 L48 30 V47 H37 V36 H27 V47 H16 Z" fill="#FFFFFF" />
        </svg>
      );

    case 'profile':
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" className="futuristic-svg-icon">
          <defs>
            <linearGradient id="fi-prof-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FF9E44" />
              <stop offset="100%" stopColor="#E85D00" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="18" fill="url(#fi-prof-bg)" />
          <circle cx="32" cy="24" r="9" fill="#FFFFFF" />
          <path d="M17 48 C17 39, 47 39, 47 48" fill="#FFFFFF" />
        </svg>
      );
  }
};
