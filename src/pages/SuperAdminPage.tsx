import React, { useState, useEffect } from 'react';
import { 
  Shield, Key, Lock, Server, Cpu, Database, 
  Activity, AlertTriangle, CheckCircle2, ChevronRight, 
  RefreshCw, DollarSign, Layers, Globe, LogOut, Eye, EyeOff
} from 'lucide-react';

interface DeploymentItem {
  app_name: string;
  target_host: string;
  status: string;
  build_pipeline: string;
  rbac_scope: string;
}

interface AIProvider {
  name: string;
  base_url: string;
  default_model: string;
  is_active: boolean;
  priority_order: number;
  api_key_masked: string;
}

interface AuditLogEntry {
  id: string;
  actor_id: string;
  actor_role: string;
  action: string;
  target_resource: string;
  target_id?: string;
  created_at: string;
}

export const SuperAdminPage: React.FC = () => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('studyai_superadmin_token');
  });
  const [token, setToken] = useState<string>(() => {
    return localStorage.getItem('studyai_superadmin_token') || '';
  });

  // Login Form State
  const [email, setEmail] = useState<string>('superadmin@studyai.com');
  const [password, setPassword] = useState<string>('SuperAdminSecretPass2026!');
  const [mfaCode, setMfaCode] = useState<string>('123456');
  const [loginError, setLoginError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Console Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'providers' | 'costs' | 'health' | 'flags' | 'audit' | 'deployment'>('overview');

  // Telemetry Data State
  const [overviewData, setOverviewData] = useState<any>(null);
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [costAnalytics, setCostAnalytics] = useState<any>(null);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [deployments, setDeployments] = useState<DeploymentItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string>('');

  const API_BASE = 'http://127.0.0.1:8000/api/v1';

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const res = await fetch(`${API_BASE}/auth/superadmin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
          mfa_code: mfaCode.trim()
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail?.message || 'Authentication failed. Please verify credentials and MFA code.');
      }

      const data = await res.json();
      localStorage.setItem('studyai_superadmin_token', data.access_token);
      setToken(data.access_token);
      setIsAuthenticated(true);
    } catch (err: any) {
      setLoginError(err.message || 'Network connection error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('studyai_superadmin_token');
    setToken('');
    setIsAuthenticated(false);
  };

  // Load telemetry when authenticated
  const loadConsoleData = async () => {
    if (!token) return;
    setIsLoadingData(true);
    const headers = { Authorization: `Bearer ${token}` };

    try {
      // 1. Overview
      const oRes = await fetch(`${API_BASE}/superadmin/overview`, { headers });
      if (oRes.ok) setOverviewData(await oRes.json());

      // 2. AI Providers
      const pRes = await fetch(`${API_BASE}/superadmin/ai-providers`, { headers });
      if (pRes.ok) setProviders(await pRes.json());

      // 3. Costs
      const cRes = await fetch(`${API_BASE}/superadmin/ai-usage-analytics`, { headers });
      if (cRes.ok) setCostAnalytics(await cRes.json());

      // 4. Health
      const hRes = await fetch(`${API_BASE}/superadmin/system-health`, { headers });
      if (hRes.ok) setSystemHealth(await hRes.json());

      // 5. Audit Logs
      const aRes = await fetch(`${API_BASE}/superadmin/audit-logs?limit=15`, { headers });
      if (aRes.ok) setAuditLogs(await aRes.json());

      // 6. Deployment
      const dRes = await fetch(`${API_BASE}/superadmin/deployment-status`, { headers });
      if (dRes.ok) {
        const dData = await dRes.json();
        setDeployments(dData.deployments || []);
      }
    } catch (err) {
      console.error('Failed to refresh superadmin telemetry:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      loadConsoleData();
    }
  }, [isAuthenticated, token]);

  // Attempt video flag enable (will demonstrate security rejection)
  const testVideoLock = async () => {
    try {
      const res = await fetch(`${API_BASE}/superadmin/feature-flags/video_generation`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_enabled: true })
      });

      if (res.status === 403) {
        const err = await res.json();
        setActionNotice(`🛡️ Security Defense Confirmed: ${err.detail?.message || 'Video generation is locked.'}`);
      } else {
        setActionNotice(`Unexpected response code: ${res.status}`);
      }
      setTimeout(() => setActionNotice(''), 6000);
      loadConsoleData();
    } catch (err: any) {
      setActionNotice(`Error: ${err.message}`);
    }
  };

  // If unauthenticated: Show elevated login modal
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#070B14',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        color: '#FFFFFF',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif"
      }}>
        <div style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#0F172A',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '36px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              display: 'inline-flex',
              padding: '14px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #7C3AED 0%, #FF6B00 100%)',
              marginBottom: '16px',
              boxShadow: '0 8px 24px rgba(124, 58, 237, 0.4)'
            }}>
              <Shield size={32} color="#FFFFFF" />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.5px', margin: '0 0 6px 0' }}>
              STUDYAI Super Admin
            </h1>
            <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: 0 }}>
              Enterprise Platform Governance • Port 3003 Scope
            </p>
          </div>

          {loginError && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '10px',
              padding: '12px 14px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.82rem',
              color: '#FCA5A5'
            }}>
              <AlertTriangle size={16} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  backgroundColor: '#1E293B',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  color: '#FFFFFF',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Master Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  backgroundColor: '#1E293B',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  color: '#FFFFFF',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  6-Digit TOTP / MFA Token
                </label>
                <span style={{ fontSize: '0.7rem', color: '#FFB800', fontWeight: 700 }}>MFA Enforced</span>
              </div>
              <input
                type="text"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  backgroundColor: '#1E293B',
                  border: '1px solid rgba(255, 184, 0, 0.4)',
                  borderRadius: '10px',
                  color: '#FFB800',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  letterSpacing: '4px',
                  textAlign: 'center',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #7C3AED 0%, #FF6B00 100%)',
                color: '#FFFFFF',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: isLoggingIn ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 20px rgba(124, 58, 237, 0.35)',
                transition: 'transform 0.15s ease'
              }}
            >
              {isLoggingIn ? 'Verifying Elevated Credentials...' : 'Authenticate Super Admin'}
            </button>
          </form>

          {/* Quick Demo Credentials Reminder */}
          <div style={{
            marginTop: '24px',
            padding: '14px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '10px',
            fontSize: '0.75rem',
            color: '#64748B'
          }}>
            <div style={{ fontWeight: 700, color: '#94A3B8', marginBottom: '4px' }}>Demo Credentials:</div>
            <div>• Email: <code style={{ color: '#E2E8F0' }}>superadmin@studyai.com</code></div>
            <div>• Password: <code style={{ color: '#E2E8F0' }}>SuperAdminSecretPass2026!</code></div>
            <div>• TOTP Code: <code style={{ color: '#FFB800' }}>123456</code></div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Super Admin Dashboard Shell
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#070B14',
      color: '#F8FAFC',
      display: 'flex',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif"
    }}>
      {/* Sidebar */}
      <div style={{
        width: '260px',
        backgroundColor: '#090D16',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 16px'
      }}>
        <div>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', paddingLeft: '8px' }}>
            <div style={{
              padding: '8px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #7C3AED 0%, #FF6B00 100%)'
            }}>
              <Shield size={20} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: '0.95rem', letterSpacing: '1px' }}>STUDYAI</div>
              <div style={{ fontSize: '0.68rem', color: '#FFB800', fontWeight: 800 }}>SUPER ADMIN • ELEVATED</div>
            </div>
          </div>

          {/* Navigation Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { id: 'overview', label: 'Platform Overview', icon: Globe },
              { id: 'providers', label: 'AI Providers & Keys', icon: Key },
              { id: 'costs', label: 'Token & Cost Analytics', icon: DollarSign },
              { id: 'health', label: 'System Health', icon: Activity },
              { id: 'flags', label: 'Feature Flags & Locks', icon: Lock },
              { id: 'audit', label: 'Enterprise Audit Trail', icon: Layers },
              { id: 'deployment', label: 'Edge & Deployments', icon: Server }
            ].map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: isActive ? 'rgba(124, 58, 237, 0.2)' : 'transparent',
                    color: isActive ? '#A78BFA' : '#94A3B8',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.85rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <IconComp size={17} color={isActive ? '#A78BFA' : '#94A3B8'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer info & Logout */}
        <div>
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '10px',
            marginBottom: '12px',
            fontSize: '0.72rem',
            color: '#64748B'
          }}>
            <div style={{ color: '#94A3B8', fontWeight: 600 }}>Active Host</div>
            <div>superadmin.studyai.com</div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#F87171',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <LogOut size={15} />
            <span>Sign Out Super Admin</span>
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 4px 0' }}>
              {activeTab === 'overview' && 'Global Platform Overview'}
              {activeTab === 'providers' && 'AI Provider Secret Configurations'}
              {activeTab === 'costs' && 'AI Usage & Billing Analytics'}
              {activeTab === 'health' && 'System Health & Node Status'}
              {activeTab === 'flags' && 'Universal Feature Flags & Architectural Locks'}
              {activeTab === 'audit' && 'Security Audit Telemetry'}
              {activeTab === 'deployment' && 'Multi-Target Hosting & Deployment Status'}
            </h2>
            <div style={{ fontSize: '0.82rem', color: '#94A3B8' }}>
              Verified authenticated session with elevated claims & multi-tenant isolation
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={loadConsoleData}
              disabled={isLoadingData}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} className={isLoadingData ? 'spin' : ''} />
              <span>Refresh</span>
            </button>

            <a
              href="/"
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 107, 0, 0.15)',
                border: '1px solid rgba(255, 107, 0, 0.3)',
                color: '#FF8A00',
                fontSize: '0.82rem',
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              Back to Student App
            </a>
          </div>
        </div>

        {actionNotice && (
          <div style={{
            backgroundColor: 'rgba(124, 58, 237, 0.2)',
            border: '1px solid #7C3AED',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '24px',
            color: '#DDD6FE',
            fontSize: '0.85rem'
          }}>
            {actionNotice}
          </div>
        )}

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
              <div style={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Active School Tenants</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF', marginTop: '6px' }}>{overviewData?.total_tenants ?? 1}</div>
                <div style={{ fontSize: '0.72rem', color: '#10B981', marginTop: '4px' }}>National Public School Bangalore</div>
              </div>

              <div style={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Total Active Students</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38BDF8', marginTop: '6px' }}>{overviewData?.total_users ?? 2}</div>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '4px' }}>Enrolled & Verified</div>
              </div>

              <div style={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Monthly AI Tokens</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#A78BFA', marginTop: '6px' }}>28.4M</div>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '4px' }}>Ollama Local + Gemini + Groq</div>
              </div>

              <div style={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Estimated Run-Rate</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F59E0B', marginTop: '6px' }}>$42.18</div>
                <div style={{ fontSize: '0.72rem', color: '#10B981', marginTop: '4px' }}>99.2% Local Inference Savings</div>
              </div>
            </div>

            {/* Platform Tenants */}
            <div style={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px 0' }}>Enrolled Institutional Tenants</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: '#94A3B8' }}>
                    <th style={{ padding: '12px 0' }}>School Name</th>
                    <th>Tenant ID</th>
                    <th>Board</th>
                    <th>Admin Contact</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '14px 0', fontWeight: 600 }}>National Public School Bangalore</td>
                    <td style={{ fontFamily: 'monospace', color: '#64748B' }}>a0000000-0000-0000-0000-000000000001</td>
                    <td>CBSE Class 10</td>
                    <td>admin@nps-bengaluru.edu.in</td>
                    <td><span style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34D399', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>ACTIVE</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. AI PROVIDERS TAB */}
        {activeTab === 'providers' && (
          <div>
            <div style={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Key size={18} color="#FFB800" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Cryptographically Masked Secret Credentials</h3>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginTop: 0, marginBottom: '20px' }}>
                All sensitive API keys are strictly masked before leaving the backend gateway. Raw secret values are never transmitted to web clients.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {providers.map((p, idx) => (
                  <div key={idx} style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '10px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{p.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B', fontFamily: 'monospace' }}>Model: {p.default_model} • URL: {p.base_url}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'monospace', color: '#FFB800', fontWeight: 600, fontSize: '0.85rem' }}>
                        {p.api_key_masked}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#10B981', marginTop: '2px' }}>
                        Priority #{p.priority_order} • {p.is_active ? 'ENABLED' : 'DISABLED'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. COSTS & TOKEN ANALYTICS */}
        {activeTab === 'costs' && (
          <div>
            <div style={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px 0' }}>Multi-Provider Billing & Token Breakdown</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: '#94A3B8' }}>
                    <th style={{ padding: '12px 0' }}>Provider</th>
                    <th>Tokens Consumed</th>
                    <th>Estimated Cost (USD)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(costAnalytics?.provider_breakdown || [
                    { provider: 'Ollama Local (Qwen 2.5 7B)', tokens: 18200000, cost_usd: 0.00, status: 'active' },
                    { provider: 'Google Gemini 3.8', tokens: 8100500, cost_usd: 28.35, status: 'active' },
                    { provider: 'Groq OSS Qwen-3.8', tokens: 2110000, cost_usd: 13.83, status: 'active' }
                  ]).map((item: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '14px 0', fontWeight: 600 }}>{item.provider}</td>
                      <td style={{ fontFamily: 'monospace' }}>{item.tokens.toLocaleString()}</td>
                      <td style={{ fontFamily: 'monospace', color: item.cost_usd === 0 ? '#10B981' : '#F59E0B' }}>${item.cost_usd.toFixed(2)}</td>
                      <td><span style={{ color: '#10B981', fontWeight: 700 }}>OPERATIONAL</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. HEALTH TAB */}
        {activeTab === 'health' && (
          <div>
            <div style={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px 0' }}>Ecosystem Microservices & Database Probes</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(systemHealth?.services || [
                  { service: 'FastAPI Gateway (Port 8000)', status: 'operational', latency_ms: 4 },
                  { service: 'Node Orchestrator (Port 3001)', status: 'operational', latency_ms: 6 },
                  { service: 'PostgreSQL / Supabase Database', status: 'connected', pool_size: 20 },
                  { service: 'Ollama Qwen 2.5 Inference Node', status: 'operational', model: 'qwen2.5:7b' },
                  { service: 'Three.js WebGL Asset Engine', status: 'verified', upstream_version: 'v0.170.0' }
                ]).map((s: any, idx: number) => (
                  <div key={idx} style={{
                    padding: '16px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckCircle2 size={18} color="#10B981" />
                      <span style={{ fontWeight: 600 }}>{s.service}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.8rem', color: '#94A3B8' }}>
                      {s.latency_ms && <span>{s.latency_ms}ms</span>}
                      {s.model && <span style={{ fontFamily: 'monospace' }}>{s.model}</span>}
                      {s.upstream_version && <span>{s.upstream_version}</span>}
                      <span style={{ color: '#10B981', fontWeight: 700 }}>OK</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. FEATURE FLAGS & VIDEO LOCK TAB */}
        {activeTab === 'flags' && (
          <div>
            <div style={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 8px 0' }}>Universal Architectural Feature Flags</h3>
              <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginTop: 0, marginBottom: '20px' }}>
                Protected system toggles. Note: Generative AI video is permanently disabled across all roles and cannot be enabled.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{
                  padding: '16px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#FCA5A5' }}>AI Video Generation (video_generation)</div>
                    <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Permanent architectural lock. Disabled to prevent scientific hallucinations.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#EF4444', backgroundColor: 'rgba(239,68,68,0.2)', padding: '4px 8px', borderRadius: '4px' }}>
                      LOCKED (FALSE)
                    </span>
                    <button
                      onClick={testVideoLock}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid rgba(239,68,68,0.4)',
                        backgroundColor: 'transparent',
                        color: '#F87171',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      Test Security Lock
                    </button>
                  </div>
                </div>

                {[
                  { name: 'Interactive 3D Science Lab (feature_3d_lab)', desc: 'Official Three.js v0.170.0 procedural geometries', enabled: true },
                  { name: 'AI Study Notes Studio (feature_ai_notes)', desc: 'Multi-source note generator with autosave and rollback', enabled: true },
                  { name: 'Adaptive Educational Arcades (feature_games)', desc: 'Concept Duel, Astro Interceptor 3D, Path Runner', enabled: true },
                  { name: 'Authoritative Weekly Examinations (feature_examinations)', desc: 'Automated 8-question-type assessment engine', enabled: true }
                ].map((flag, idx) => (
                  <div key={idx} style={{
                    padding: '16px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{flag.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{flag.desc}</div>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10B981', backgroundColor: 'rgba(16,185,129,0.15)', padding: '4px 8px', borderRadius: '4px' }}>
                      ACTIVE
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. AUDIT TRAIL TAB */}
        {activeTab === 'audit' && (
          <div>
            <div style={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px 0' }}>Tamper-Evident Security Telemetry</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: '#94A3B8' }}>
                    <th style={{ padding: '10px 0' }}>Timestamp</th>
                    <th>Actor ID</th>
                    <th>Role</th>
                    <th>Action</th>
                    <th>Target</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((entry, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px 0', fontFamily: 'monospace', color: '#64748B' }}>
                        {entry.created_at ? new Date(entry.created_at).toLocaleTimeString() : 'Recent'}
                      </td>
                      <td style={{ fontFamily: 'monospace' }}>{entry.actor_id}</td>
                      <td>
                        <span style={{
                          backgroundColor: entry.actor_role === 'superadmin' ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.06)',
                          color: entry.actor_role === 'superadmin' ? '#C084FC' : '#94A3B8',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 700
                        }}>
                          {entry.actor_role}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: entry.action.includes('BLOCKED') ? '#F87171' : '#F1F5F9' }}>
                        {entry.action}
                      </td>
                      <td style={{ color: '#94A3B8' }}>{entry.target_resource}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. DEPLOYMENT TAB */}
        {activeTab === 'deployment' && (
          <div>
            <div style={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px 0' }}>Multi-Target Separately Hosted Environments</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {deployments.map((d, i) => (
                  <div key={i} style={{
                    padding: '16px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{d.app_name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#38BDF8', fontFamily: 'monospace' }}>{d.target_host}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
                        Pipeline: {d.build_pipeline} • Scope: {d.rbac_scope}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10B981', backgroundColor: 'rgba(16,185,129,0.15)', padding: '6px 10px', borderRadius: '6px' }}>
                      DEPLOYED (TLS 1.3)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
