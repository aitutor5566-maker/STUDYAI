import React, { useEffect, useState } from 'react';
import {
  Edit3,
  Settings,
  Target,
  Award,
  Shield,
  Lock,
  Unlock,
  HelpCircle,
  Mail,
  AlertOctagon,
  LogOut,
  ChevronRight,
  CheckCircle2,
  Sliders,
  Brain,
  Users,
  UserPlus,
  BookOpen,
  Copy,
  Check,
  PlusCircle
} from 'lucide-react';
import { TopBrandBar } from '../components/GlassNav';
import { useLearning } from '../context/LearningContext';
import { AdaptiveProfileModal } from '../components/AdaptiveProfileModal';

export const ProfilePage: React.FC = () => {
  const { apiFetch, studentId, setStudentId, studentProfiles, refreshProfiles, refreshTick, triggerRefresh } = useLearning();

  const [parentTab, setParentTab] = useState<'analytics' | 'family' | 'academic'>('analytics');
  const [familyData, setFamilyData] = useState<any | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileGrade, setNewProfileGrade] = useState('Grade 10');
  const [newProfileBoard, setNewProfileBoard] = useState('CBSE');
  const [familyActionMsg, setFamilyActionMsg] = useState('');

  // Academic preferences form state
  const [acadBoard, setAcadBoard] = useState('CBSE');
  const [acadGrade, setAcadGrade] = useState('Grade 10');
  const [acadSubjects, setAcadSubjects] = useState<string[]>(['Mathematics', 'Science', 'Social Science', 'English']);
  const [acadSaveMsg, setAcadSaveMsg] = useState('');

  const [dashboard, setDashboard] = useState<any | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [nameInput, setNameInput] = useState('Vishwak Sai');
  const [gradeInput, setGradeInput] = useState('Grade 10');
  const [boardInput, setBoardInput] = useState('CBSE');
  const [depthPref, setDepthPref] = useState<'simple' | 'detailed'>('simple');
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1.0);
  const [dailyMins, setDailyMins] = useState<number>(60);
  const [notificationsOn, setNotificationsOn] = useState<boolean>(true);
  const [saveBanner, setSaveBanner] = useState<string>('');

  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  // Server-Enforced Parent Dashboard State (Section 16)
  const [showParentModal, setShowParentModal] = useState(false);
  const [parentPasscode, setParentPasscode] = useState('');
  const [parentToken, setParentToken] = useState<string | null>(null);
  const [parentData, setParentData] = useState<any | null>(null);
  const [parentAuthError, setParentAuthError] = useState('');
  const [parentLoading, setParentLoading] = useState(false);
  const [showAdaptiveModal, setShowAdaptiveModal] = useState<boolean>(false);
  const [adaptiveProfile, setAdaptiveProfile] = useState<any | null>(null);

  useEffect(() => {
    apiFetch('/api/dashboard').then((data) => {
      setDashboard(data);
      if (data?.user) {
        setNameInput(data.user.name);
        setGradeInput(data.user.grade);
        setBoardInput(data.user.board);
      }
      if (data?.preferences) {
        setDepthPref(data.preferences.explanation_depth || 'simple');
        setVoiceSpeed(Number(data.preferences.voice_speed) || 1.0);
        setDailyMins(Number(data.preferences.daily_goal_minutes) || 60);
        setNotificationsOn(Boolean(data.preferences.notifications_enabled));
      }
    });

    apiFetch('/api/tutor/adaptive-profile')
      .then((data) => {
        if (data?.adaptive_profile) {
          setAdaptiveProfile(data.adaptive_profile);
        }
      })
      .catch(() => {});
  }, [apiFetch, refreshTick, studentId]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiFetch('/api/profile', {
      method: 'PUT',
      body: JSON.stringify({
        name: nameInput,
        grade: gradeInput,
        board: boardInput,
        preferences: {
          explanation_depth: depthPref,
          voice_speed: voiceSpeed,
          daily_goal_minutes: dailyMins,
          notifications_enabled: notificationsOn
        }
      })
    });
    setEditingProfile(false);
    setSaveBanner('Profile & learning preferences saved to database!');
    triggerRefresh();
    setTimeout(() => setSaveBanner(''), 3000);
  };

  const handleParentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setParentLoading(true);
    setParentAuthError('');
    try {
      const authRes = await apiFetch('/api/parent/auth', {
        method: 'POST',
        body: JSON.stringify({ passcode: parentPasscode })
      });
      setParentToken(authRes.token);
      const report = await apiFetch('/api/parent/dashboard', {
        headers: { Authorization: `Bearer ${authRes.token}` }
      });
      setParentData(report);
      const fam = await apiFetch('/api/family/my-family').catch(() => null);
      if (fam) setFamilyData(fam);
      setParentPasscode('');
    } catch (err: any) {
      setParentAuthError(err?.message || 'Unauthorized parent access.');
    } finally {
      setParentLoading(false);
    }
  };

  const handleInviteStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    try {
      const res = await apiFetch('/api/family/invite-student', {
        method: 'POST',
        body: JSON.stringify({ invited_email: inviteEmail })
      });
      if (res?.invitation?.invitation_code) {
        setInviteCode(res.invitation.invitation_code);
        setFamilyActionMsg(`Invitation code generated for ${inviteEmail}!`);
        setInviteEmail('');
        const fam = await apiFetch('/api/family/my-family').catch(() => null);
        if (fam) setFamilyData(fam);
      }
    } catch (err: any) {
      setFamilyActionMsg(err.message || 'Failed to send invitation');
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName) return;
    try {
      const res = await apiFetch('/api/student/create-profile', {
        method: 'POST',
        body: JSON.stringify({
          display_name: newProfileName,
          current_grade: newProfileGrade,
          current_board: newProfileBoard
        })
      });
      if (res?.success) {
        setFamilyActionMsg(`Student profile "${newProfileName}" created!`);
        setNewProfileName('');
        await refreshProfiles();
        const fam = await apiFetch('/api/family/my-family').catch(() => null);
        if (fam) setFamilyData(fam);
      }
    } catch (err: any) {
      setFamilyActionMsg(err.message || 'Failed to create student profile');
    }
  };

  const handleSaveAcademic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/api/student/preferences', {
        method: 'PUT',
        body: JSON.stringify({
          student_profile_id: studentId,
          target_board: acadBoard,
          class_grade: acadGrade,
          enrolled_subjects: acadSubjects
        })
      });
      if (res?.success) {
        setAcadSaveMsg('Academic profile updated! Learning history and prior grade achievements preserved.');
        await refreshProfiles();
        triggerRefresh();
        setTimeout(() => setAcadSaveMsg(''), 4000);
      }
    } catch (err: any) {
      setAcadSaveMsg(err.message || 'Failed to update academic profile');
    }
  };

  const handleParentLogout = async () => {
    if (parentToken) {
      await apiFetch('/api/parent/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${parentToken}` }
      }).catch(() => {});
    }
    setParentToken(null);
    setParentData(null);
    setShowParentModal(false);
  };

  const stats = dashboard?.stats || { overallProgress: 0, topicsStudied: 0, quizzesCompleted: 0, totalStudyHours: 0 };
  const subjects: string[] = dashboard?.preferences?.subjects || ['Maths', 'Science', 'English', 'Social Studies'];

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (Math.min(100, stats.overallProgress) / 100) * circumference;

  return (
    <div className="studyai-container">
      <TopBrandBar showBack />

      {saveBanner && (
        <div style={{ padding: '10px 16px', borderRadius: 14, background: '#ECFDF5', color: '#047857', fontWeight: 700, fontSize: '0.86rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={16} />
          <span>{saveBanner}</span>
        </div>
      )}

      {/* Student Identity Card */}
      <section className="glass-card" style={{ padding: 22, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FFE4CC 0%, #FF8533 100%)',
                border: '3px solid #FFFFFF',
                boxShadow: '0 8px 20px rgba(255,106,0,0.22)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.35rem',
                fontWeight: 800,
                color: '#202124'
              }}
            >
              {nameInput
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#202124' }}>{nameInput}</h1>
              <p style={{ fontSize: '0.88rem', color: '#6B7280', fontWeight: 600 }}>
                {gradeInput} • {boardInput}
              </p>
            </div>
          </div>

          <button type="button" onClick={() => setEditingProfile((e) => !e)} className="btn-glass">
            <Edit3 size={15} color="#FF6A00" />
            <span>{editingProfile ? 'Cancel' : 'Edit Profile'}</span>
          </button>
        </div>

        {editingProfile && (
          <form onSubmit={handleSaveProfile} style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.08)', display: 'grid', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#6B7280' }}>Student Name</label>
                <input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.14)', marginTop: 4 }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#6B7280' }}>Grade / Level</label>
                <input
                  value={gradeInput}
                  onChange={(e) => setGradeInput(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.14)', marginTop: 4 }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#6B7280' }}>Curriculum Board</label>
                <input
                  value={boardInput}
                  onChange={(e) => setBoardInput(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.14)', marginTop: 4 }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-orange">
                Save Profile & Preferences
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Personalised Adaptive Learning Profile Card */}
      <section
        className="glass-card"
        style={{
          padding: 22,
          marginBottom: 20,
          background: 'linear-gradient(135deg, #FFF3E8 0%, #FFFFFF 100%)',
          border: '1.5px solid rgba(255, 106, 0, 0.25)',
          boxShadow: '0 8px 24px rgba(255, 106, 0, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #FF6A00 0%, #E85D00 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(255, 106, 0, 0.25)'
              }}
            >
              <Brain size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#202124', margin: 0 }}>
                Personalised Adaptive Learning Profile
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#6B7280', margin: '2px 0 0' }}>
                Helps your AI Tutor understand your weaknesses, preferred explanations, and reading pace
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAdaptiveModal(true)}
            style={{
              padding: '9px 18px',
              borderRadius: 999,
              background: 'linear-gradient(135deg, #FF6A00 0%, #E85D00 100%)',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 6px 16px rgba(255, 106, 0, 0.25)'
            }}
          >
            <Sliders size={16} />
            <span>Customize Learning Profile</span>
          </button>
        </div>

        {/* Profile Highlights Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          <span style={{ fontSize: '0.78rem', padding: '5px 12px', borderRadius: 999, background: '#FFF3E8', color: '#E85D00', border: '1px solid rgba(255,106,0,0.25)', fontWeight: 700 }}>
            ⚡ Style: {adaptiveProfile?.explanation_style ? String(adaptiveProfile.explanation_style).toUpperCase() : 'BALANCED'}
          </span>
          <span style={{ fontSize: '0.78rem', padding: '5px 12px', borderRadius: 999, background: adaptiveProfile?.reading_difficulty ? '#FEE2E2' : '#DCFCE7', color: adaptiveProfile?.reading_difficulty ? '#B91C1C' : '#15803D', fontWeight: 700 }}>
            📖 Reading Accessibility: {adaptiveProfile?.reading_difficulty ? 'Short sentences & chunks' : 'Standard'}
          </span>
          <span style={{ fontSize: '0.78rem', padding: '5px 12px', borderRadius: 999, background: adaptiveProfile?.spelling_difficulty ? '#FEF3C7' : '#DCFCE7', color: adaptiveProfile?.spelling_difficulty ? '#B45309' : '#15803D', fontWeight: 700 }}>
            ✍️ Spelling Support: {adaptiveProfile?.spelling_difficulty ? 'Gentle guidance' : 'Standard'}
          </span>
          {Array.isArray(adaptiveProfile?.difficult_subjects) && adaptiveProfile.difficult_subjects.length > 0 && (
            <span style={{ fontSize: '0.78rem', padding: '5px 12px', borderRadius: 999, background: '#FFF3E8', color: '#FF6A00', fontWeight: 700 }}>
              🎯 Focused Subjects: {adaptiveProfile.difficult_subjects.join(', ')}
            </span>
          )}
        </div>
      </section>

      <div className="dashboard-grid">
        {/* Left Column: Learning Progress & Subjects */}
        <div style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
          <section className="glass-card" style={{ padding: 22 }}>
            <h2 style={{ fontSize: '1.08rem', fontWeight: 800, marginBottom: 16 }}>Learning Progress</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: 108, height: 108, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="108" height="108" viewBox="0 0 108 108">
                  <circle cx="54" cy="54" r={radius} stroke="#F3E8DF" strokeWidth="9" fill="none" />
                  <circle
                    cx="54"
                    cy="54"
                    r={radius}
                    stroke="#FF6A00"
                    strokeWidth="9"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={progressOffset}
                    strokeLinecap="round"
                    transform="rotate(-90 54 54)"
                  />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{stats.overallProgress}%</div>
                  <div style={{ fontSize: '0.65rem', color: '#6B7280' }}>Overall</div>
                </div>
              </div>

              <div style={{ flex: 1, display: 'grid', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: '#6B7280', fontWeight: 600 }}>Topics Learned</span>
                  <strong style={{ color: '#202124' }}>{stats.topicsStudied}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: '#6B7280', fontWeight: 600 }}>Quizzes Completed</span>
                  <strong style={{ color: '#202124' }}>{stats.quizzesCompleted}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: '#6B7280', fontWeight: 600 }}>Study Time</span>
                  <strong style={{ color: '#202124' }}>{stats.totalStudyHours} hrs</strong>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: 10 }}>Subjects</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {subjects.map((subj) => (
                  <span
                    key={subj}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 999,
                      background: '#FFF3E8',
                      color: '#E85D00',
                      fontSize: '0.8rem',
                      fontWeight: 700
                    }}
                  >
                    {subj}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Protected Parent Dashboard Entry Card (matching screenshot) */}
          <section
            onClick={() => setShowParentModal(true)}
            className="hero-glass-banner glass-card-interactive"
            style={{ padding: 20 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 46, height: 46, borderRadius: 14, background: '#FFFFFF', color: '#FF6A00', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(255,106,0,0.16)' }}>
                  <Shield size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#202124' }}>Parent Dashboard</h3>
                  <p style={{ fontSize: '0.82rem', color: '#6B7280' }}>View your child's progress (Server-Protected Access)</p>
                </div>
              </div>
              <ChevronRight size={20} color="#FF6A00" />
            </div>
          </section>

          {/* Super Admin Enterprise Console Entry Card */}
          <a
            href="/superadmin"
            className="glass-card glass-card-interactive"
            style={{
              padding: 20,
              textDecoration: 'none',
              display: 'block',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF3E8 100%)',
              border: '1.5px solid rgba(255, 106, 0, 0.25)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 46, height: 46, borderRadius: 14, background: 'linear-gradient(135deg, #FF6A00 0%, #E85D00 100%)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(255,106,0,0.25)' }}>
                  <Shield size={22} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#202124', margin: 0 }}>Super Admin Console</h3>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#E85D00', backgroundColor: '#FFF3E8', border: '1px solid rgba(255,106,0,0.25)', padding: '2px 6px', borderRadius: 4 }}>MFA REQUIRED</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#6B7280', margin: '4px 0 0 0' }}>Platform governance, AI costs, and security audit logs</p>
                </div>
              </div>
              <ChevronRight size={20} color="#FF6A00" />
            </div>
          </a>
        </div>

        {/* Right Column: Preferences, Goals, Achievements, Help & Logout */}
        <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
          <section className="glass-card" style={{ padding: 16, display: 'grid', gap: 8 }}>
            {[
              { id: 'prefs', label: 'Learning Preferences', icon: Settings },
              { id: 'goals', label: 'Study Goals', icon: Target },
              { id: 'achievements', label: 'Achievements', icon: Award },
              { id: 'settings', label: 'Settings & Accessibility', icon: Lock }
            ].map((item) => {
              const Icon = item.icon;
              const isOpen = activeAccordion === item.id;
              return (
                <div key={item.id}>
                  <button
                    type="button"
                    onClick={() => setActiveAccordion(isOpen ? null : item.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 14,
                      border: 'none',
                      background: isOpen ? '#FFF3E8' : '#FFFFFF',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: '0.9rem', color: '#202124' }}>
                      <Icon size={18} color="#FF6A00" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight size={16} color="#9CA3AF" style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>

                  {isOpen && item.id === 'prefs' && (
                    <div style={{ padding: 14, display: 'grid', gap: 10, fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Default Tutor Depth:</span>
                        <select value={depthPref} onChange={(e) => setDepthPref(e.target.value as any)} style={{ padding: '6px 10px', borderRadius: 10 }}>
                          <option value="simple">Simple Explanations</option>
                          <option value="detailed">Detailed Explanations</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Audio Lesson Speed:</span>
                        <select value={voiceSpeed} onChange={(e) => setVoiceSpeed(Number(e.target.value))} style={{ padding: '6px 10px', borderRadius: 10 }}>
                          <option value={0.75}>0.75x</option>
                          <option value={1}>1.0x</option>
                          <option value={1.25}>1.25x</option>
                          <option value={1.5}>1.5x</option>
                        </select>
                      </div>
                      <button type="button" onClick={handleSaveProfile} className="btn-orange" style={{ justifySelf: 'end', padding: '6px 14px', fontSize: '0.8rem' }}>
                        Save Preferences
                      </button>
                    </div>
                  )}

                  {isOpen && item.id === 'goals' && (
                    <div style={{ padding: 14, fontSize: '0.84rem', color: '#374151' }}>
                      Daily Target: <strong>{dailyMins} minutes/day</strong> across {subjects.length} subjects.
                    </div>
                  )}

                  {isOpen && item.id === 'achievements' && (
                    <div style={{ padding: 14, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      <span style={{ padding: '5px 12px', borderRadius: 999, background: '#FEF3C7', color: '#D97706', fontSize: '0.78rem', fontWeight: 700 }}>
                        🏆 7-Day Streak
                      </span>
                      <span style={{ padding: '5px 12px', borderRadius: 999, background: '#DCFCE7', color: '#15803D', fontSize: '0.78rem', fontWeight: 700 }}>
                        🌱 Photosynthesis Master
                      </span>
                      <span style={{ padding: '5px 12px', borderRadius: 999, background: '#E0F2FE', color: '#0284C7', fontSize: '0.78rem', fontWeight: 700 }}>
                        🧊 3D Lab Explorer
                      </span>
                    </div>
                  )}

                  {isOpen && item.id === 'settings' && (
                    <div style={{ padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                      <span>Study Reminder Notifications</span>
                      <input type="checkbox" checked={notificationsOn} onChange={(e) => setNotificationsOn(e.target.checked)} />
                    </div>
                  )}
                </div>
              );
            })}
          </section>

          {/* Help & Support Section */}
          <section className="glass-card" style={{ padding: 16, display: 'grid', gap: 6 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, padding: '4px 8px', color: '#6B7280' }}>Help & Support</div>
            {[
              { label: 'FAQs — One Topic Learning Ecosystem', icon: HelpCircle },
              { label: 'Contact Us — support@studyai.edu', icon: Mail },
              { label: 'Report a Problem', icon: AlertOctagon }
            ].map((h) => {
              const Icon = h.icon;
              return (
                <div key={h.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 12, background: '#FFFFFF', fontSize: '0.85rem', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Icon size={16} color="#FF6A00" />
                    <span>{h.label}</span>
                  </div>
                  <ChevronRight size={15} color="#9CA3AF" />
                </div>
              );
            })}
          </section>

          {/* Log Out / Switch Student Session */}
          <button
            type="button"
            onClick={() => setStudentId(studentId === 'student-vishwak' ? 'student-new' : 'student-vishwak')}
            className="btn-glass"
            style={{ width: '100%', padding: 14, color: '#E85D00', fontWeight: 800 }}
          >
            <LogOut size={17} />
            <span>
              {studentId === 'student-vishwak' ? 'Switch to New Student (Empty State) / Log Out' : 'Switch Back to Vishwak Sai (Grade 10)'}
            </span>
          </button>
        </div>
      </div>

      {/* SERVER-ENFORCED PARENT DASHBOARD MODAL */}
      {showParentModal && (
        <div className="glass-modal-overlay" role="dialog" aria-modal="true" aria-label="Protected Parent Dashboard">
          <div className="glass-modal-content" style={{ maxWidth: 740 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 42, height: 42, borderRadius: 14, background: '#FFF3E8', color: '#FF6A00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {parentToken ? <Unlock size={20} /> : <Lock size={20} />}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.18rem', fontWeight: 800 }}>Protected Parent Dashboard</h2>
                  <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Server-verified parent-child session authorization</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowParentModal(false)} className="btn-glass">
                Close
              </button>
            </div>

            {!parentToken ? (
              <form onSubmit={handleParentLogin} style={{ padding: 22, borderRadius: 20, background: '#FFFDFB', border: '1px solid rgba(255,106,0,0.25)' }}>
                <p style={{ fontSize: '0.88rem', color: '#374151', marginBottom: 14 }}>
                  Enter your server-verified Parent Access Passcode to inspect <strong>{nameInput}</strong>'s verified study time, quiz accuracy, strengths, and topics needing revision. <em>(Demo Passcode: <strong>2468</strong>)</em>
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="password"
                    value={parentPasscode}
                    onChange={(e) => setParentPasscode(e.target.value)}
                    placeholder="Enter Parent Passcode (2468)..."
                    aria-label="Parent Access Passcode"
                    style={{ flex: 1, padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.18)', fontSize: '0.95rem' }}
                  />
                  <button type="submit" className="btn-orange" disabled={parentLoading}>
                    {parentLoading ? 'Verifying...' : 'Authorize on Server'}
                  </button>
                </div>
                {parentAuthError && (
                  <div style={{ marginTop: 10, color: '#DC2626', fontSize: '0.84rem', fontWeight: 700 }}>{parentAuthError}</div>
                )}
              </form>
            ) : (
              parentData && (
                <div style={{ display: 'grid', gap: 16 }}>
                  {/* Parent Tab Switcher */}
                  <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: 10 }}>
                    <button
                      type="button"
                      onClick={() => setParentTab('analytics')}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 10,
                        border: 'none',
                        background: parentTab === 'analytics' ? '#FFF3E8' : 'transparent',
                        color: parentTab === 'analytics' ? '#FF6A00' : '#4B5563',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      <Target size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                      Learning Analytics
                    </button>
                    <button
                      type="button"
                      onClick={() => setParentTab('family')}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 10,
                        border: 'none',
                        background: parentTab === 'family' ? '#FFF3E8' : 'transparent',
                        color: parentTab === 'family' ? '#FF6A00' : '#4B5563',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      <Users size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                      Family & Student Logins
                    </button>
                    <button
                      type="button"
                      onClick={() => setParentTab('academic')}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 10,
                        border: 'none',
                        background: parentTab === 'academic' ? '#FFF3E8' : 'transparent',
                        color: parentTab === 'academic' ? '#FF6A00' : '#4B5563',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      <BookOpen size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                      Academic Preferences
                    </button>
                  </div>

                  {/* TAB 1: LEARNING ANALYTICS */}
                  {parentTab === 'analytics' && (
                    <div style={{ display: 'grid', gap: 14 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
                        <div style={{ padding: 14, borderRadius: 14, background: '#FFF3E8', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FF6A00' }}>{parentData.summary.totalStudyHours} hrs</div>
                          <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>Recorded Study Time</div>
                        </div>
                        <div style={{ padding: 14, borderRadius: 14, background: '#ECFDF5', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#047857' }}>{parentData.summary.averageQuizAccuracy}%</div>
                          <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>Avg Quiz Accuracy</div>
                        </div>
                        <div style={{ padding: 14, borderRadius: 14, background: '#E0F2FE', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284C7' }}>
                            {parentData.summary.goalsCompleted}/{parentData.summary.totalGoals}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>Goals Completed</div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div style={{ padding: 14, borderRadius: 14, background: '#FFFFFF', border: '1px solid rgba(22,163,74,0.25)' }}>
                          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#15803D', marginBottom: 6 }}>✓ Core Strengths</div>
                          <ul style={{ paddingLeft: 18, fontSize: '0.84rem', color: '#374151' }}>
                            {parentData.strengths.map((s: string) => (
                              <li key={s}>{s}</li>
                            ))}
                          </ul>
                        </div>
                        <div style={{ padding: 14, borderRadius: 14, background: '#FFFFFF', border: '1px solid rgba(234,88,12,0.25)' }}>
                          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#EA580C', marginBottom: 6 }}>⚠️ Topics Needing Revision</div>
                          <ul style={{ paddingLeft: 18, fontSize: '0.84rem', color: '#374151' }}>
                            {parentData.needsRevision.map((r: string) => (
                              <li key={r}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div style={{ padding: 14, borderRadius: 14, background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.88rem', marginBottom: 6 }}>Recently Studied Topics</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {parentData.recentTopics.map((t: string) => (
                            <span key={t} style={{ padding: '4px 10px', borderRadius: 999, background: '#F3F4F6', fontSize: '0.78rem', fontWeight: 600 }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: FAMILY & STUDENT LOGINS */}
                  {parentTab === 'family' && (
                    <div style={{ display: 'grid', gap: 16 }}>
                      {familyActionMsg && (
                        <div style={{ padding: '10px 14px', borderRadius: 10, background: '#ECFDF5', color: '#047857', fontSize: '0.85rem', fontWeight: 600 }}>
                          {familyActionMsg}
                        </div>
                      )}

                      {/* Family Account Details */}
                      <div style={{ padding: 14, borderRadius: 14, background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#111827' }}>
                            {familyData?.family?.name || 'Sai Family'}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                            Family Account • Plan: <strong>{familyData?.family?.subscription_tier || 'Premium'}</strong> • Max Students: {familyData?.family?.max_students || 5}
                          </div>
                        </div>
                        <span style={{ padding: '4px 12px', borderRadius: 999, background: '#DCFCE7', color: '#166534', fontSize: '0.78rem', fontWeight: 700 }}>
                          Active Supabase Family
                        </span>
                      </div>

                      {/* Active Student Profiles in Family */}
                      <div style={{ padding: 14, borderRadius: 14, background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Users size={16} color="#FF6A00" />
                          <span>Student Profiles & Independent Logins</span>
                        </div>
                        <div style={{ display: 'grid', gap: 8 }}>
                          {(familyData?.student_profiles || studentProfiles).map((p: any) => {
                            const isCurrent = studentId === p.slug || studentId === p.id;
                            return (
                              <div
                                key={p.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '10px 14px',
                                  borderRadius: 12,
                                  background: isCurrent ? '#FFF3E8' : '#F9FAFB',
                                  border: isCurrent ? '1px solid rgba(255,106,0,0.35)' : '1px solid rgba(0,0,0,0.06)'
                                }}
                              >
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1F2937' }}>
                                    {p.display_name} {isCurrent && <span style={{ fontSize: '0.72rem', color: '#EA580C', fontWeight: 800 }}>(Active Session)</span>}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                                    {p.current_grade} • {p.current_board} • Identifier: <code>{p.slug || p.id}</code>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setStudentId(p.slug || p.id)}
                                  className="btn-glass"
                                  style={{ padding: '5px 12px', fontSize: '0.78rem', fontWeight: 700 }}
                                >
                                  {isCurrent ? 'Current' : 'Switch To'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Invite Student with Independent Login */}
                      <div style={{ padding: 14, borderRadius: 14, background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <UserPlus size={16} color="#FF6A00" />
                          <span>Invite Student for Independent Login</span>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#6B7280', marginBottom: 10 }}>
                          Sends a secure family invite code allowing a student to log in on their own device while staying linked to this family.
                        </p>
                        <form onSubmit={handleInviteStudent} style={{ display: 'flex', gap: 8 }}>
                          <input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="Student email (e.g. learner@studyai.edu)..."
                            style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: '0.85rem' }}
                          />
                          <button type="submit" className="btn-orange" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
                            Generate Code
                          </button>
                        </form>
                        {inviteCode && (
                          <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 10, background: '#FEF3C7', border: '1px solid #F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                              <span style={{ fontSize: '0.78rem', color: '#92400E', fontWeight: 700 }}>STUDENT INVITATION CODE: </span>
                              <strong style={{ fontSize: '1rem', color: '#78350F', letterSpacing: 1 }}>{inviteCode}</strong>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(inviteCode);
                                setCopiedCode(true);
                                setTimeout(() => setCopiedCode(false), 2000);
                              }}
                              className="btn-glass"
                              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                            >
                              {copiedCode ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                              <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Add New Student Profile */}
                      <div style={{ padding: 14, borderRadius: 14, background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <PlusCircle size={16} color="#FF6A00" />
                          <span>Add New Student Profile to Family</span>
                        </div>
                        <form onSubmit={handleCreateStudent} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8 }}>
                          <input
                            type="text"
                            value={newProfileName}
                            onChange={(e) => setNewProfileName(e.target.value)}
                            placeholder="Student Full Name..."
                            style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: '0.85rem' }}
                          />
                          <select
                            value={newProfileGrade}
                            onChange={(e) => setNewProfileGrade(e.target.value)}
                            style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: '0.85rem' }}
                          >
                            {['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map((g) => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                          <select
                            value={newProfileBoard}
                            onChange={(e) => setNewProfileBoard(e.target.value)}
                            style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: '0.85rem' }}
                          >
                            {['CBSE', 'ICSE', 'Cambridge', 'IB', 'State Board'].map((b) => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                          </select>
                          <button type="submit" className="btn-orange" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
                            Add Profile
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: ACADEMIC PREFERENCES */}
                  {parentTab === 'academic' && (
                    <form onSubmit={handleSaveAcademic} style={{ display: 'grid', gap: 14 }}>
                      {acadSaveMsg && (
                        <div style={{ padding: '10px 14px', borderRadius: 10, background: '#ECFDF5', color: '#047857', fontSize: '0.85rem', fontWeight: 600 }}>
                          {acadSaveMsg}
                        </div>
                      )}

                      <div style={{ padding: 14, borderRadius: 14, background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)', display: 'grid', gap: 12 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111827' }}>
                          Curriculum & Examination Board Configuration
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#4B5563', marginBottom: 4 }}>
                              Target Education Board:
                            </label>
                            <select
                              value={acadBoard}
                              onChange={(e) => setAcadBoard(e.target.value)}
                              style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: '0.85rem' }}
                            >
                              <option value="CBSE">CBSE (Central Board of Secondary Education)</option>
                              <option value="ICSE">ICSE / ISC (Council for Indian School Certificate)</option>
                              <option value="Cambridge">Cambridge Assessment (IGCSE / A-Levels)</option>
                              <option value="IB">International Baccalaureate (IB MYP / DP)</option>
                              <option value="State Board">State Board (Telangana / Maharashtra / AP / Karnataka)</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#4B5563', marginBottom: 4 }}>
                              Academic Class / Grade:
                            </label>
                            <select
                              value={acadGrade}
                              onChange={(e) => setAcadGrade(e.target.value)}
                              style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: '0.85rem' }}
                            >
                              {['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map((g) => (
                                <option key={g} value={g}>{g}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#4B5563', marginBottom: 6 }}>
                            Active Enrolled Subjects:
                          </label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {['Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'Social Science', 'English', 'Computer Science'].map((sub) => {
                              const checked = acadSubjects.includes(sub);
                              return (
                                <label
                                  key={sub}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '6px 12px',
                                    borderRadius: 999,
                                    background: checked ? '#FFF3E8' : '#F3F4F6',
                                    border: checked ? '1px solid #FF6A00' : '1px solid #E5E7EB',
                                    color: checked ? '#EA580C' : '#374151',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setAcadSubjects((prev) => [...prev, sub]);
                                      } else {
                                        setAcadSubjects((prev) => prev.filter((s) => s !== sub));
                                      }
                                    }}
                                  />
                                  <span>{sub}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        <div style={{ padding: '8px 12px', borderRadius: 10, background: '#F0FDF4', border: '1px solid #BBF7D0', fontSize: '0.76rem', color: '#166534' }}>
                          ℹ️ <strong>Academic History Preservation Guarantee:</strong> When changing class or board, all past notes, 3D laboratory models, and quiz attempt analytics are permanently preserved in the database.
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                          <button type="submit" className="btn-orange" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                            Save Academic Configuration
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    <button type="button" onClick={handleParentLogout} className="btn-glass" style={{ color: '#DC2626' }}>
                      Lock Parent Session
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Adaptive Profile Modal */}
      <AdaptiveProfileModal
        isOpen={showAdaptiveModal}
        onClose={() => setShowAdaptiveModal(false)}
        apiFetch={apiFetch}
        onProfileUpdated={(updated) => {
          setAdaptiveProfile(updated);
          setSaveBanner('Adaptive learning profile updated!');
          setTimeout(() => setSaveBanner(''), 3000);
        }}
      />
    </div>
  );
};
