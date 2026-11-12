import React, { useState } from 'react';
import { Sword, Trophy, Sparkles, ChevronRight, Shield, Flame, Compass } from 'lucide-react';
import { useLearning } from '../context/LearningContext';
import { ARENA_DEFINITIONS } from '../games/battleWorld/VoxelArenaManager';

export const EducationalGamesSection: React.FC = () => {
  const { activeTopic, openGamesHub } = useLearning();
  const [topic, setTopic] = useState<string>(activeTopic || 'Photosynthesis');

  const arenas = Object.values(ARENA_DEFINITIONS);

  const handleLaunchBattleWorld = () => {
    openGamesHub(topic || 'Photosynthesis', 'Science');
  };

  return (
    <section
      className="glass-card"
      style={{
        marginBottom: 26,
        padding: 28,
        borderRadius: 26,
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        border: '1.5px solid rgba(255, 106, 0, 0.4)',
        boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        color: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Accent Glow */}
      <div
        style={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 106, 0, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      {/* Header & Badges */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 22 }}>
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
              boxShadow: '0 8px 24px rgba(255, 106, 0, 0.4)',
              flexShrink: 0
            }}
          >
            <Sword size={30} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: 999,
                  background: '#FF6A00',
                  color: '#FFFFFF',
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  letterSpacing: '0.04em'
                }}
              >
                STUDYAI BATTLE WORLD
              </span>
              <span style={{ fontSize: '0.8rem', color: '#FDBA74', fontWeight: 800 }}>
                Minecraft-Inspired 3D Voxel Educational RPG
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FFFFFF', margin: '0 0 4px 0' }}>
              Academic Arena Game Center
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#94A3B8', margin: 0 }}>
              Master curriculum concepts by battling through 5 enclosed voxel biomes and answering syllabus questions!
            </p>
          </div>
        </div>

        {/* Topic Input & Direct Launch Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1.5px solid rgba(255, 106, 0, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FF6A00' }}>TOPIC:</span>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Photosynthesis"
              style={{
                border: 'none',
                background: 'transparent',
                fontWeight: 800,
                fontSize: '0.85rem',
                color: '#FFFFFF',
                outline: 'none',
                maxWidth: 160
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleLaunchBattleWorld}
            style={{
              padding: '10px 22px',
              borderRadius: 14,
              background: 'linear-gradient(135deg, #FF7A1A 0%, #FF6A00 100%)',
              color: '#FFFFFF',
              fontWeight: 900,
              fontSize: '0.9rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 8px 20px rgba(255, 106, 0, 0.35)'
            }}
          >
            <Sword size={18} />
            <span>PLAY BATTLE WORLD</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* 5 Voxel Arena Biomes Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 14,
          marginTop: 16
        }}
      >
        {arenas.map((arena) => (
          <div
            key={arena.id}
            onClick={handleLaunchBattleWorld}
            style={{
              padding: 16,
              borderRadius: 18,
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(71, 85, 105, 0.5)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#FF6A00';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.5)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  padding: '2px 8px',
                  borderRadius: 6,
                  background: `${arena.accentColor}25`,
                  color: arena.accentColor,
                  border: `1px solid ${arena.accentColor}50`
                }}
              >
                WAVE {arena.waveIndex}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{arena.mobCount} Mobs</span>
            </div>

            <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#F8FAFC' }}>
              {arena.name}
            </h4>

            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94A3B8', lineHeight: 1.4 }}>
              {arena.description}
            </p>
          </div>
        ))}
      </div>

      {/* Feature Highlights Footer */}
      <div
        style={{
          marginTop: 20,
          paddingTop: 16,
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          fontSize: '0.82rem',
          color: '#CBD5E1'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={16} color="#FBBF24" />
          <span>Continuous Top-Center Question HUD</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Compass size={16} color="#38BDF8" />
          <span>Mobile Virtual Joystick + Desktop WASD</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Shield size={16} color="#34D399" />
          <span>Solid Enclosed Boundary Walls (No Void Falls)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Trophy size={16} color="#FB923C" />
          <span>Curriculum Integrated Knowledge XP</span>
        </div>
      </div>
    </section>
  );
};

export default EducationalGamesSection;
