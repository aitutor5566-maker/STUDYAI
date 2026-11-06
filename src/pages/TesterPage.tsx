import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, AlertTriangle, Bug, Play,
  ClipboardList, Shield, LogOut, Check, ChevronRight,
  RefreshCw, Terminal, Layers
} from 'lucide-react';

export const TesterPage: React.FC = () => {
  const [token, setToken] = useState<string>(() => localStorage.getItem('studyai_tester_token') || '');
  const [emailInput, setEmailInput] = useState('qa.overall@studyai.edu');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [testerProfile, setTesterProfile] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'assignments' | 'test_runner' | 'bug_report' | 'permissions'>('assignments');
  const [bugs, setBugs] = useState<any[]>([]);

  // Test Runner State
  const [selectedTestCase, setSelectedTestCase] = useState('TC-TUTOR-01');
  const [testResultStatus, setTestResultStatus] = useState<'passed' | 'failed' | 'blocked'>('passed');
  const [actualResultText, setActualResultText] = useState('Lesson generated with complete 14 pedagogical sections, formulas, and real definitions.');
  const [runSuccessMessage, setRunSuccessMessage] = useState('');

  // Bug Report Form State
  const [bugTitle, setBugTitle] = useState('');
  const [bugDesc, setBugDesc] = useState('');
  const [bugModule, setBugModule] = useState('tutor');
  const [bugSeverity, setBugSeverity] = useState('medium');
  const [bugPriority, setBugPriority] = useState('medium');
  const [bugSteps, setBugSteps] = useState('1. Open module\n2. Trigger generation\n3. Observe output');
  const [bugExpected, setBugExpected] = useState('Expected clean rendering');
  const [bugActual, setBugActual] = useState('Actual unexpected output');
  const [bugSubmitMessage, setBugSubmitMessage] = useState('');

  const isAuthenticated = Boolean(token);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
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
      localStorage.setItem('studyai_tester_token', data.token);
      setToken(data.token);
      setTesterProfile(data.user);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('studyai_tester_token');
    setToken('');
    setTesterProfile(null);
  };

  const loadTesterData = async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [meRes, assignRes, bugsRes] = await Promise.all([
        fetch('/api/auth/me', { headers }).then((r) => r.json()).catch(() => null),
        fetch('/api/tester/assignments', { headers }).then((r) => r.json()).catch(() => ({ assignments: [] })),
        fetch('/api/bugs', { headers }).then((r) => r.json()).catch(() => ({ bugs: [] }))
      ]);

      if (meRes?.user) setTesterProfile(meRes.user);
      if (assignRes?.assignments) setAssignments(assignRes.assignments);
      if (bugsRes?.bugs) setBugs(bugsRes.bugs);
    } catch (err) {
      console.warn('Failed to load tester data:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadTesterData();
    }
  }, [isAuthenticated, token]);

  const handleExecuteTest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tester/run-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          test_case_id: selectedTestCase,
          status: testResultStatus,
          actual_result: actualResultText,
          execution_time_ms: 145
        })
      });
      const data = await res.json();
      if (data.success) {
        setRunSuccessMessage(`Test case ${selectedTestCase} result (${testResultStatus.toUpperCase()}) recorded to database!`);
        setTimeout(() => setRunSuccessMessage(''), 4000);
        loadTesterData();
      }
    } catch (err: any) {
      setRunSuccessMessage(`Execution failed: ${err.message}`);
    }
  };

  const handleSubmitBug = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugTitle || !bugDesc) return;
    try {
      const res = await fetch('/api/bugs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: bugTitle,
          description: bugDesc,
          affected_module: bugModule,
          severity: bugSeverity,
          priority: bugPriority,
          steps_to_reproduce: bugSteps,
          expected_result: bugExpected,
          actual_result: bugActual
        })
      });
      const data = await res.json();
      if (data.success) {
        setBugSubmitMessage(`Bug report ${data.bug.id} successfully created and entered lifecycle (Status: New)!`);
        setBugTitle('');
        setBugDesc('');
        setTimeout(() => setBugSubmitMessage(''), 4000);
        loadTesterData();
      }
    } catch (err: any) {
      setBugSubmitMessage(`Submission failed: ${err.message}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="studyai-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 20 }}>
        <div className="glass-card" style={{ maxWidth: 440, width: '100%', padding: 30, borderRadius: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: '#FFF3E8', color: '#FF6A00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Terminal size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>STUDYAI QA Tester Portal</h2>
              <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Independent Authenticated Identity Verification</p>
            </div>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'grid', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#4B5563', marginBottom: 4 }}>
                Provisioned Tester Email:
              </label>
              <select
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1px solid #D1D5DB', fontSize: '0.85rem' }}
              >
                <option value="qa.overall@studyai.edu">qa.overall@studyai.edu (Overall Testing Agent)</option>
                <option value="qa.notes@studyai.edu">qa.notes@studyai.edu (AI Notes Tester)</option>
                <option value="qa.tutor@studyai.edu">qa.tutor@studyai.edu (AI Tutor Tester)</option>
                <option value="qa.games@studyai.edu">qa.games@studyai.edu (Game Tester)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#4B5563', marginBottom: 4 }}>
                Tester Security Password:
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password..."
                style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #D1D5DB', fontSize: '0.9rem' }}
              />
            </div>

            {loginError && (
              <div style={{ padding: '8px 12px', borderRadius: 10, background: '#FEE2E2', color: '#B91C1C', fontSize: '0.82rem', fontWeight: 700 }}>
                {loginError}
              </div>
            )}

            <button type="submit" className="btn-orange" style={{ padding: 12, marginTop: 4 }}>
              Sign In to QA Testing Workspace
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="studyai-container" style={{ paddingBottom: 60 }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid rgba(0,0,0,0.08)', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FFF3E8', color: '#FF6A00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Terminal size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>STUDYAI QA Tester Workspace</h1>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>
              Logged in as: <strong>{testerProfile?.email}</strong> ({testerProfile?.role_template_id || 'tester'})
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button type="button" onClick={loadTesterData} className="btn-glass" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
          <button type="button" onClick={handleLogout} className="btn-glass" style={{ padding: '8px 14px', fontSize: '0.82rem', color: '#DC2626' }}>
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { id: 'assignments', label: 'My Assignments', icon: ClipboardList },
          { id: 'test_runner', label: 'Execute Test Run', icon: Play },
          { id: 'bug_report', label: 'Bug Reports & Filing', icon: Bug },
          { id: 'permissions', label: 'My Permitted Modules', icon: Shield }
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
                cursor: 'pointer'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div className="glass-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 14 }}>Assigned Test Cases & Modules</h3>
          {assignments.length === 0 ? (
            <p style={{ color: '#6B7280', fontSize: '0.88rem' }}>No pending assignments allocated to this account.</p>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {assignments.map((a) => (
                <div key={a.id} style={{ padding: 14, borderRadius: 12, background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>
                      <code>{a.test_case_id}</code> — {a.tc_title}
                    </div>
                    <span style={{ padding: '3px 10px', borderRadius: 999, background: a.status === 'completed' ? '#DCFCE7' : '#FEF3C7', color: a.status === 'completed' ? '#166534' : '#92400E', fontSize: '0.75rem', fontWeight: 700 }}>
                      {a.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#4B5563', marginBottom: 6 }}>{a.tc_desc}</p>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                    Module: <strong>{a.module}</strong> • Priority: <strong>{a.priority}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EXECUTE TEST RUN */}
      {activeTab === 'test_runner' && (
        <form onSubmit={handleExecuteTest} className="glass-card" style={{ padding: 22, display: 'grid', gap: 14 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Interactive Test Case Execution Runner</h3>
          {runSuccessMessage && (
            <div style={{ padding: '10px 14px', borderRadius: 10, background: '#ECFDF5', color: '#047857', fontSize: '0.85rem', fontWeight: 600 }}>
              {runSuccessMessage}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#4B5563', marginBottom: 4 }}>
              Select Test Case to Execute:
            </label>
            <select
              value={selectedTestCase}
              onChange={(e) => setSelectedTestCase(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: '0.88rem' }}
            >
              <option value="TC-TUTOR-01">TC-TUTOR-01: Photosynthesis Detailed Lesson Generation</option>
              <option value="TC-TUTOR-02">TC-TUTOR-02: Formula and Numerical Calculation Clarity</option>
              <option value="TC-NOTES-01">TC-NOTES-01: AI Notes Generation from Topic Context</option>
              <option value="TC-NOTES-02">TC-NOTES-02: PDF Export Integrity</option>
              <option value="TC-3D-01">TC-3D-01: Human Heart 3D Scientific Fidelity</option>
              <option value="TC-VOICE-01">TC-VOICE-01: Voice Curriculum Outline Generation</option>
              <option value="TC-GAME-01">TC-GAME-01: Answer Battle Game State & Scoring</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#4B5563', marginBottom: 4 }}>
              Outcome Result:
            </label>
            <div style={{ display: 'flex', gap: 12 }}>
              {(['passed', 'failed', 'blocked'] as const).map((st) => (
                <label key={st} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="testStatus"
                    value={st}
                    checked={testResultStatus === st}
                    onChange={() => setTestResultStatus(st)}
                  />
                  <span>{st.toUpperCase()}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#4B5563', marginBottom: 4 }}>
              Actual Result & Observations:
            </label>
            <textarea
              value={actualResultText}
              onChange={(e) => setActualResultText(e.target.value)}
              rows={4}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-orange" style={{ padding: '10px 20px', fontSize: '0.88rem' }}>
              Submit Test Run Execution
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: BUG REPORTING */}
      {activeTab === 'bug_report' && (
        <div style={{ display: 'grid', gap: 20 }}>
          <form onSubmit={handleSubmitBug} className="glass-card" style={{ padding: 22, display: 'grid', gap: 14 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>File a New QA Defect / Bug Report</h3>
            {bugSubmitMessage && (
              <div style={{ padding: '10px 14px', borderRadius: 10, background: '#ECFDF5', color: '#047857', fontSize: '0.85rem', fontWeight: 600 }}>
                {bugSubmitMessage}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#4B5563', marginBottom: 4 }}>Bug Title:</label>
                <input
                  type="text"
                  value={bugTitle}
                  onChange={(e) => setBugTitle(e.target.value)}
                  placeholder="Concise defect summary..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: '0.85rem' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#4B5563', marginBottom: 4 }}>Affected Module:</label>
                <select
                  value={bugModule}
                  onChange={(e) => setBugModule(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: '0.85rem' }}
                >
                  <option value="tutor">AI Tutor</option>
                  <option value="notes">AI Notes</option>
                  <option value="3d_lab">3D Lab</option>
                  <option value="voice_teacher">Voice Teacher</option>
                  <option value="games">Games</option>
                  <option value="library">Library</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#4B5563', marginBottom: 4 }}>Severity:</label>
                <select
                  value={bugSeverity}
                  onChange={(e) => setBugSeverity(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: '0.85rem' }}
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#4B5563', marginBottom: 4 }}>Detailed Description:</label>
              <textarea
                value={bugDesc}
                onChange={(e) => setBugDesc(e.target.value)}
                rows={3}
                placeholder="Observed defect description..."
                style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: '0.85rem' }}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-orange" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                Submit Bug Report
              </button>
            </div>
          </form>

          {/* List of bugs */}
          <div className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 12 }}>Current Bug Reports</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              {bugs.map((b) => (
                <div key={b.id} style={{ padding: 12, borderRadius: 10, background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{b.id} — {b.title}</div>
                    <span style={{ padding: '2px 8px', borderRadius: 999, background: '#FEF3C7', color: '#92400E', fontSize: '0.72rem', fontWeight: 700 }}>
                      {b.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: 4 }}>
                    Module: <strong>{b.affected_module}</strong> • Severity: <strong>{b.severity}</strong> • Reporter: {b.reporter_email}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PERMISSIONS */}
      {activeTab === 'permissions' && (
        <div className="glass-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 12 }}>My Testing Role & Permissions</h3>
          <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: 14 }}>
            Under role <strong>{testerProfile?.role_template_id || 'tester'}</strong>, your access is strictly confined to permitted testing modules. Unpermitted modules cannot be accessed through direct URLs or API calls.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
            {['home', 'notes', 'tutor', 'library', 'games', '3d_lab', 'image_studio', 'voice_teacher'].map((mod) => {
              const roleId = testerProfile?.role_template_id;
              let isAllowed = false;
              if (roleId === 'tester_overall') isAllowed = true;
              else if (roleId === 'tester_notes' && ['notes', 'library'].includes(mod)) isAllowed = true;
              else if (roleId === 'tester_tutor' && ['tutor', '3d_lab', 'voice_teacher'].includes(mod)) isAllowed = true;
              else if (roleId === 'tester_games' && ['games'].includes(mod)) isAllowed = true;

              return (
                <div key={mod} style={{ padding: 12, borderRadius: 10, background: isAllowed ? '#F0FDF4' : '#FEF2F2', border: isAllowed ? '1px solid #BBF7D0' : '1px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'capitalize' }}>{mod}</span>
                  <span style={{ color: isAllowed ? '#166534' : '#991B1B', fontWeight: 800, fontSize: '0.75rem' }}>
                    {isAllowed ? '✓ PERMITTED' : '✗ RESTRICTED'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
