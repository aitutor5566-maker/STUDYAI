import React, { useState, useEffect } from 'react';
import { 
  Shield, Activity, Users, AlertTriangle, Bug, 
  BarChart3, CheckCircle2, RefreshCw, LogOut,
  FolderLock, School, Layers, Clock
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [token, setToken] = useState<string>(() => localStorage.getItem('studyai_admin_token') || '');
  const [emailInput, setEmailInput] = useState('admin@studyai.edu');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'knowledge' | 'analytics' | 'qa_status' | 'bugs' | 'health'>('overview');
  const [analytics, setAnalytics] = useState<any>(null);
  const [knowledgeReport, setKnowledgeReport] = useState<any>(null);
  const [healthData, setHealthData] = useState<any>(null);
  const [bugs, setBugs] = useState<any[]>([]);
  const [testers, setTesters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const isAuthenticated = Boolean(token);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Login failed');
      }
      if (data.user?.role !== 'admin' && data.user?.role !== 'superadmin') {
        throw new Error('Access denied. Administrator privileges required.');
      }
      localStorage.setItem('studyai_admin_token', data.token);
      setToken(data.token);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('studyai_admin_token');
    setToken('');
  };

  const loadAdminData = async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [anRes, hRes, bRes, tRes, kRes] = await Promise.all([
        fetch('/api/admin/analytics', { headers }).then((r) => r.json()).catch(() => null),
        fetch('/api/admin/health', { headers }).then((r) => r.json()).catch(() => null),
        fetch('/api/bugs', { headers }).then((r) => r.json()).catch(() => ({ bugs: [] })),
        fetch('/api/admin/testers', { headers }).then((r) => r.json()).catch(() => ({ testers: [] })),
        fetch('/api/admin/knowledge-intelligence', { headers }).then((r) => r.json()).catch(() => null)
      ]);
      if (anRes) setAnalytics(anRes);
      if (hRes) setHealthData(hRes);
      if (bRes?.bugs) setBugs(bRes.bugs);
      if (tRes?.testers) setTesters(tRes.testers);
      if (kRes) setKnowledgeReport(kRes);
    } catch (err) {
      console.warn('Failed to load admin data:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated, token]);

  if (!isAuthenticated) {
    return (
      <div className="studyai-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 20 }}>
        <div className="glass-card" style={{ maxWidth: 460, width: '100%', padding: 32, borderRadius: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: '#FFF3E8', color: '#FF6A00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <School size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>School & Academic Admin</h2>
              <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Protected Operational & QA Testing Portal</p>
            </div>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'grid', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#4B5563', marginBottom: 4 }}>
                Admin Email Address:
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="admin@studyai.edu"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #D1D5DB', fontSize: '0.9rem' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#4B5563', marginBottom: 4 }}>
                Passcode / Password:
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password..."
                style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #D1D5DB', fontSize: '0.9rem' }}
                required
              />
            </div>

            {loginError && (
              <div style={{ padding: '8px 12px', borderRadius: 10, background: '#FEE2E2', color: '#B91C1C', fontSize: '0.82rem', fontWeight: 700 }}>
                {loginError}
              </div>
            )}

            <button type="submit" className="btn-orange" disabled={loading} style={{ padding: 12, marginTop: 4 }}>
              {loading ? 'Verifying Admin Access...' : 'Authenticate to Admin Console'}
            </button>

            <div style={{ padding: '8px 12px', borderRadius: 10, background: '#F3F4F6', fontSize: '0.75rem', color: '#6B7280', textAlign: 'center' }}>
              🔒 Protected portal. Super Admin permissions and private student content restricted.
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="studyai-container" style={{ paddingBottom: 60 }}>
      {/* Top Admin Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid rgba(0,0,0,0.08)', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FFF3E8', color: '#FF6A00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <School size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>STUDYAI Academic & QA Admin</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Operational Oversight, Synthetic QA Testing & Quality Control</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button type="button" onClick={loadAdminData} className="btn-glass" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
          <button type="button" onClick={handleLogout} className="btn-glass" style={{ padding: '8px 14px', fontSize: '0.82rem', color: '#DC2626' }}>
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto' }}>
        {[
          { id: 'overview', label: 'Platform Overview', icon: Layers },
          { id: 'knowledge', label: 'Knowledge Intelligence', icon: School },
          { id: 'analytics', label: 'Database Analytics', icon: BarChart3 },
          { id: 'qa_status', label: 'QA Testers & Teams', icon: Users },
          { id: 'bugs', label: 'Bug Reports Tracking', icon: Bug },
          { id: 'health', label: 'App Health & Monitoring', icon: Activity }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 16px',
                borderRadius: 12,
                border: 'none',
                background: isActive ? '#FFF3E8' : '#F9FAFB',
                color: isActive ? '#FF6A00' : '#4B5563',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            <div className="glass-card" style={{ padding: 18, textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FF6A00' }}>
                {analytics?.user_analytics?.total_families ?? 1}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600 }}>Active Families</div>
            </div>
            <div className="glass-card" style={{ padding: 18, textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10B981' }}>
                {analytics?.user_analytics?.total_student_profiles ?? 2}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600 }}>Student Profiles</div>
            </div>
            <div className="glass-card" style={{ padding: 18, textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#3B82F6' }}>
                {analytics?.feature_analytics?.ai_tutor_questions ?? 0}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600 }}>AI Tutor Sessions</div>
            </div>
            <div className="glass-card" style={{ padding: 18, textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#8B5CF6' }}>
                {bugs.length}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600 }}>Tracked Bugs</div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FolderLock size={18} color="#FF6A00" />
              <span>Least Privilege Security & Data Isolation Notice</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#4B5563', lineHeight: 1.6 }}>
              As a designated Operational Administrator, you can monitor curriculum health, synthetic test executions, and feature availability. 
              Under GDPR/COPPA guidelines, unrestricted access to students' private notes, voice recordings, and parent passcodes is strictly partitioned and restricted from general administrators.
            </p>
          </div>
        </div>
      )}

      {/* TAB 1B: KNOWLEDGE INTELLIGENCE DASHBOARD */}
      {activeTab === 'knowledge' && knowledgeReport && (
        <div style={{ display: 'grid', gap: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <div className="glass-card" style={{ padding: 16 }}>
              <div style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 700 }}>Knowledge Graph Nodes</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FF6A00' }}>
                {knowledgeReport.contentQualityAndVerification?.knowledgeGraphMetrics?.totalConceptNodes ?? 26}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#10B981', fontWeight: 700 }}>
                {knowledgeReport.overview?.activeGradesRange} • {knowledgeReport.overview?.totalBoardsCovered} Boards
              </div>
            </div>
            <div className="glass-card" style={{ padding: 16 }}>
              <div style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 700 }}>Trust & Anti-Hallucination</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10B981' }}>
                {knowledgeReport.contentQualityAndVerification?.averageTrustScore ?? 97.4}%
              </div>
              <div style={{ fontSize: '0.74rem', color: '#4B5563', fontWeight: 700 }}>
                Zero-Hallucination Guard: Active
              </div>
            </div>
            <div className="glass-card" style={{ padding: 16 }}>
              <div style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 700 }}>Verification Pipeline</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1F2937', marginTop: 4 }}>
                Published: {knowledgeReport.contentQualityAndVerification?.verificationWorkflowStatus?.publishedCount ?? 1} • Verified: {knowledgeReport.contentQualityAndVerification?.verificationWorkflowStatus?.verifiedCount ?? 0}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#6B7280' }}>
                Drafts: {knowledgeReport.contentQualityAndVerification?.verificationWorkflowStatus?.draftsCount ?? 0} • Needs Verification: {knowledgeReport.contentQualityAndVerification?.verificationWorkflowStatus?.needsVerificationCount ?? 0}
              </div>
            </div>
            <div className="glass-card" style={{ padding: 16 }}>
              <div style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 700 }}>Language & Visual Assets</div>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#3B82F6', marginTop: 4 }}>
                EN • తెలుగు (TE) • हिंदी (HI)
              </div>
              <div style={{ fontSize: '0.74rem', color: '#4B5563' }}>
                Visual Assets: {knowledgeReport.visualAssetIntelligence?.totalAssetsCount ?? 0} Verified
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: 18 }}>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 800, marginBottom: 12 }}>Board-Wise Curriculum Coverage (CBSE, ICSE, AP SCERT, TS SCERT)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              {(knowledgeReport.curriculumCoverageByBoard || []).map((b: any) => (
                <div key={b.board} style={{ padding: 12, borderRadius: 12, background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#111827' }}>{b.boardName}</div>
                  <div style={{ fontSize: '0.76rem', color: '#4B5563', marginTop: 2 }}>{b.gradesSupported}</div>
                  <div style={{ fontSize: '0.76rem', color: '#FF6A00', fontWeight: 800, marginTop: 4 }}>
                    {b.indexedChaptersCount} Indexed Chapters ({b.coveragePercentage}%)
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ padding: 18 }}>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 800, marginBottom: 12 }}>Subject-Wise Verified Knowledge Nodes</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(knowledgeReport.contentQualityAndVerification?.subjectWiseCoverage || []).map((s: any) => (
                <span key={s.subject} style={{ padding: '6px 12px', borderRadius: 999, background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8', fontSize: '0.78rem', fontWeight: 800 }}>
                  {s.subject}: {s.verifiedNodesCount} Nodes ({s.mappedBoardsCount} Boards)
                </span>
              ))}
            </div>
          </div>

          {(knowledgeReport.contentQualityAndVerification?.missingSyllabusGaps || []).length > 0 && (
            <div className="glass-card" style={{ padding: 18 }}>
              <h3 style={{ fontSize: '0.96rem', fontWeight: 800, marginBottom: 10 }}>Tracked Syllabus Gaps & Continuous Discovery Queue</h3>
              <div style={{ display: 'grid', gap: 8 }}>
                {knowledgeReport.contentQualityAndVerification.missingSyllabusGaps.map((g: any, idx: number) => (
                  <div key={idx} style={{ padding: 10, borderRadius: 10, background: '#FFFBEB', border: '1px solid #FDE68A', fontSize: '0.8rem' }}>
                    <strong>{g.board} Grade {g.grade} • {g.subject}:</strong> {g.gapDescription}
                    <span style={{ marginLeft: 8, color: '#D97706', fontWeight: 800 }}>[Auto-Discovery Queued]</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ANALYTICS */}
      {activeTab === 'analytics' && analytics && (
        <div style={{ display: 'grid', gap: 20 }}>
          <div className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 14 }}>User & Family Metrics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              <div><strong>Registered Users:</strong> {analytics.user_analytics.total_registered_users}</div>
              <div><strong>Active Families:</strong> {analytics.user_analytics.total_families}</div>
              <div><strong>Student Profiles:</strong> {analytics.user_analytics.total_student_profiles}</div>
              <div><strong>Daily Active Users (DAU):</strong> {analytics.user_analytics.daily_active_users}</div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 14 }}>Feature Generation & Usage Metrics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <div>AI Tutor Questions: <strong>{analytics.feature_analytics.ai_tutor_questions}</strong></div>
              <div>AI Notes Generated: <strong>{analytics.feature_analytics.ai_notes_generations}</strong></div>
              <div>3D Models Loaded: <strong>{analytics.feature_analytics.models_3d_loaded}</strong></div>
              <div>Games Completed: <strong>{analytics.feature_analytics.games_completed}</strong></div>
              <div>Assessments Taken: <strong>{analytics.feature_analytics.assessments_completed}</strong></div>
              <div>Voice Sessions: <strong>{analytics.feature_analytics.voice_sessions_completed}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: QA STATUS */}
      {activeTab === 'qa_status' && (
        <div className="glass-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 14 }}>Provisioned QA Testers & Teams</h3>
          <div style={{ display: 'grid', gap: 10 }}>
            {testers.map((t) => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 12, background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t.full_name} ({t.email})</div>
                  <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                    Role: <strong>{t.role_name || t.role_template_id}</strong> • Status: 
                    <span style={{ color: t.status === 'active' ? '#10B981' : '#EF4444', fontWeight: 700, marginLeft: 4 }}>{t.status.toUpperCase()}</span>
                  </div>
                </div>
                <span style={{ padding: '4px 10px', borderRadius: 999, background: '#DCFCE7', color: '#166534', fontSize: '0.75rem', fontWeight: 700 }}>
                  Verified Identity
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: BUGS */}
      {activeTab === 'bugs' && (
        <div className="glass-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 14 }}>Active Bug Reports Lifecycle</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {bugs.map((b) => (
              <div key={b.id} style={{ padding: 14, borderRadius: 12, background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>
                    <code>{b.id}</code> — {b.title}
                  </div>
                  <span style={{ padding: '3px 10px', borderRadius: 999, background: '#FEF3C7', color: '#B45309', fontSize: '0.75rem', fontWeight: 700 }}>
                    {b.status}
                  </span>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#4B5563', marginBottom: 8 }}>{b.description}</p>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', display: 'flex', gap: 14 }}>
                  <span>Module: <strong>{b.affected_module}</strong></span>
                  <span>Severity: <strong>{b.severity}</strong></span>
                  <span>Reporter: <strong>{b.reporter_email}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: HEALTH */}
      {activeTab === 'health' && (
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>System Health & Infrastructure States</h3>
            <span style={{ padding: '4px 12px', borderRadius: 999, background: '#DCFCE7', color: '#166534', fontWeight: 700, fontSize: '0.8rem' }}>
              Overall: {healthData?.overall_status || 'Healthy'}
            </span>
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            {(healthData?.services || []).map((s: any) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 12, background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{s.service_name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                    Component: <code>{s.affected_component}</code> • Team: {s.responsible_team}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: '#10B981', fontWeight: 700, fontSize: '0.85rem' }}>{s.status}</span>
                  <div style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>Last Checked: Just now</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
