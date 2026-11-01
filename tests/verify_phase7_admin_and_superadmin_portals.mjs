/**
 * STUDYAI — PHASE 7 VERIFICATION SUITE
 * Admin Portal & Separately Hosted Super Admin Portal Acceptance Tests
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const baseUrl = 'http://127.0.0.1:8000';
const workspaceRoot = '/Users/vishwaksai/Downloads/AI APP';
let passedCount = 0;

function report(id, title, pass = true) {
  if (pass) {
    passedCount++;
    console.log(`  ✔ [PASS] ${id}: ${title}`);
  } else {
    console.log(`  ❌ [FAIL] ${id}: ${title}`);
  }
}

async function runPhase7Verification() {
  console.log('\n================================================================');
  console.log('🏛️ RUNNING STUDYAI PHASE 7 ADMIN & SUPER ADMIN PORTAL SUITE');
  console.log('================================================================\n');

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Separate Application Builds & Independent Pipeline Integrity
    // -------------------------------------------------------------------------
    console.log('[TEST 1] Verifying Separate Application Builds & Independent Deployment Pipelines');

    const adminAppDir = path.join(workspaceRoot, 'apps/admin_portal');
    const superadminAppDir = path.join(workspaceRoot, 'apps/superadmin_portal');

    assert.ok(fs.existsSync(path.join(adminAppDir, 'pubspec.yaml')), 'Admin Portal pubspec.yaml missing');
    assert.ok(fs.existsSync(path.join(adminAppDir, 'web/index.html')), 'Admin Portal web entrypoint missing');
    assert.ok(fs.existsSync(path.join(adminAppDir, 'lib/app.dart')), 'Admin Portal app.dart missing');

    assert.ok(fs.existsSync(path.join(superadminAppDir, 'pubspec.yaml')), 'Super Admin Portal pubspec.yaml missing');
    assert.ok(fs.existsSync(path.join(superadminAppDir, 'web/index.html')), 'Super Admin Portal web entrypoint missing');
    assert.ok(fs.existsSync(path.join(superadminAppDir, 'lib/app.dart')), 'Super Admin Portal app.dart missing');

    // Docker and CI/CD pipelines
    const dockerAdmin = fs.readFileSync(path.join(workspaceRoot, 'infrastructure/docker/Dockerfile.admin'), 'utf-8');
    const dockerSuperadmin = fs.readFileSync(path.join(workspaceRoot, 'infrastructure/docker/Dockerfile.superadmin'), 'utf-8');
    assert.ok(dockerAdmin.includes('apps/admin_portal'), 'Admin Dockerfile must target admin_portal');
    assert.ok(dockerSuperadmin.includes('apps/superadmin_portal'), 'Super Admin Dockerfile must target superadmin_portal');
    assert.ok(dockerSuperadmin.includes('Isolated Environment'), 'Super Admin must specify isolated build');

    const dockerCompose = fs.readFileSync(path.join(workspaceRoot, 'infrastructure/docker/docker-compose.yml'), 'utf-8');
    assert.ok(dockerCompose.includes('admin_portal:'), 'admin_portal service missing in compose');
    assert.ok(dockerCompose.includes('superadmin_portal:'), 'superadmin_portal service missing in compose');

    report('T1', 'Verified 2 separate Flutter Web builds & independent deployment container pipelines', true);

    // -------------------------------------------------------------------------
    // TEST 2: Multi-Role Authentication & Super Admin Mandatory MFA
    // -------------------------------------------------------------------------
    console.log('\n[TEST 2] Verifying Separate Authentication Routes & Super Admin MFA');

    // 2a. Student Login
    const studentLogin = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'vishwak@studyai.internal', password: 'StudentPass123!' })
    });
    assert.strictEqual(studentLogin.status, 200);
    const studentToken = (await studentLogin.json()).access_token;

    // 2b. School Admin Login
    const adminLogin = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@nps-bengaluru.edu.in', password: 'AdminPass123!' })
    });
    assert.strictEqual(adminLogin.status, 200);
    const adminToken = (await adminLogin.json()).access_token;

    // 2c. Accountant Login
    const accountantLogin = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'finance@nps-bengaluru.edu.in', password: 'FinancePass123!' })
    });
    assert.strictEqual(accountantLogin.status, 200);
    const accountantToken = (await accountantLogin.json()).access_token;

    // 2d. Super Admin Elevated Login (Rejects missing/bad MFA code)
    const badMfaLogin = await fetch(`${baseUrl}/api/v1/auth/superadmin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'superadmin@studyai.com', password: 'SuperAdminSecretPass2026!', mfa_code: '000000' })
    });
    assert.strictEqual(badMfaLogin.status, 401);
    report('T2a', 'Super Admin rejected with invalid MFA code (401 Unauthorized)', true);

    const validMfaLogin = await fetch(`${baseUrl}/api/v1/auth/superadmin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'superadmin@studyai.com', password: 'SuperAdminSecretPass2026!', mfa_code: '123456' })
    });
    assert.strictEqual(validMfaLogin.status, 200);
    const superadminToken = (await validMfaLogin.json()).access_token;
    report('T2b', 'Super Admin authenticated with mandatory 6-digit TOTP/MFA code', true);

    // -------------------------------------------------------------------------
    // TEST 3: Admin Portal Modules & Roster Analytics
    // -------------------------------------------------------------------------
    console.log('\n[TEST 3] Verifying Admin Portal Overview & Academic Telemetry');

    const adminStatsRes = await fetch(`${baseUrl}/api/v1/admin/dashboard/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(adminStatsRes.status, 200);
    const adminStats = await adminStatsRes.json();
    assert.ok(adminStats.total_active_students >= 1);
    assert.ok(adminStats.total_examinations_published >= 1);
    assert.ok(adminStats.average_academic_score_percentage > 0);
    report('T3a', `Admin overview stats retrieved (${adminStats.total_active_students} students, ${adminStats.average_academic_score_percentage}% avg score)`, true);

    const studentRosterRes = await fetch(`${baseUrl}/api/v1/admin/students`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(studentRosterRes.status, 200);
    const roster = await studentRosterRes.json();
    assert.ok(roster.length >= 1);
    assert.strictEqual(roster[0].role, 'student');
    report('T3b', `Student roster retrieved with ${roster.length} active students`, true);

    const parentsRosterRes = await fetch(`${baseUrl}/api/v1/admin/parents`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(parentsRosterRes.status, 200);
    const parents = await parentsRosterRes.json();
    assert.ok(parents.length >= 1);
    report('T3c', `Parent management retrieved verified family link telemetry`, true);

    // -------------------------------------------------------------------------
    // TEST 4: Accountant Restrictions & Financial Tools Separation
    // -------------------------------------------------------------------------
    console.log('\n[TEST 4] Verifying Accountant Role Restrictions & Financial Isolation');

    // 4a. Accountant CAN access finance
    const financeRes = await fetch(`${baseUrl}/api/v1/admin/finance`, {
      headers: { Authorization: `Bearer ${accountantToken}` }
    });
    assert.strictEqual(financeRes.status, 200);
    const finance = await financeRes.json();
    assert.ok(finance.total_billed_inr > 0);
    assert.ok(finance.collection_rate_percentage > 0);
    report('T4a', 'Accountant successfully accessed tuition ledger & financial tools', true);

    // 4b. Accountant is BLOCKED from student rosters
    const accountantBlockedRoster = await fetch(`${baseUrl}/api/v1/admin/students`, {
      headers: { Authorization: `Bearer ${accountantToken}` }
    });
    assert.strictEqual(accountantBlockedRoster.status, 403);
    report('T4b', 'Accountant blocked from student roster & personal information (403 Forbidden)', true);

    // 4c. Accountant is BLOCKED from platform settings
    const accountantBlockedFlags = await fetch(`${baseUrl}/api/v1/superadmin/feature-flags`, {
      headers: { Authorization: `Bearer ${accountantToken}` }
    });
    assert.strictEqual(accountantBlockedFlags.status, 403);
    report('T4c', 'Accountant blocked from global system feature flags (403 Forbidden)', true);

    // -------------------------------------------------------------------------
    // TEST 5: Privilege Escalation Prevention
    // -------------------------------------------------------------------------
    console.log('\n[TEST 5] Verifying Privilege Escalation Prevention');

    // Admin attempts to provision a Super Admin (must be blocked)
    const escalationRes = await fetch(`${baseUrl}/api/v1/admin/users/delegate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        full_name: 'Malicious Escalation Admin',
        email: 'malicious@studyai.internal',
        role: 'superadmin',
        password: 'HackedPassword123!'
      })
    });
    assert.strictEqual(escalationRes.status, 403);
    const escalationErr = await escalationRes.json();
    assert.strictEqual(escalationErr.detail.code, 'ROLE_ESCALATION_BLOCKED');
    report('T5', 'Privilege escalation blocked: School Admin cannot create or elevate to Super Admin (403 Forbidden)', true);

    // -------------------------------------------------------------------------
    // TEST 6: Super Admin Enterprise Operations & AI Provider Secrets Protection
    // -------------------------------------------------------------------------
    console.log('\n[TEST 6] Verifying Super Admin Operations & Secret Key Masking');

    // 6a. Admin attempting to access Super Admin overview (must be blocked)
    const adminBlockedSuperRes = await fetch(`${baseUrl}/api/v1/superadmin/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(adminBlockedSuperRes.status, 403);
    report('T6a', 'School Admin blocked from Super Admin Enterprise Console (403 Forbidden)', true);

    // 6b. Super Admin accesses overview
    const superOverviewRes = await fetch(`${baseUrl}/api/v1/superadmin/overview`, {
      headers: { Authorization: `Bearer ${superadminToken}` }
    });
    assert.strictEqual(superOverviewRes.status, 200);
    const superOverview = await superOverviewRes.json();
    assert.ok(superOverview.active_tenants >= 1);
    assert.strictEqual(superOverview.video_generation_policy, 'Strictly Disabled (Server Enforcement Locked)');
    report('T6b', `Super Admin retrieved global enterprise overview (${superOverview.active_tenants} tenants)`, true);

    // 6c. AI Provider Configuration — Secret Keys Masked
    const aiProvidersRes = await fetch(`${baseUrl}/api/v1/superadmin/ai-providers`, {
      headers: { Authorization: `Bearer ${superadminToken}` }
    });
    assert.strictEqual(aiProvidersRes.status, 200);
    const aiProviders = await aiProvidersRes.json();
    assert.ok(aiProviders.length >= 2);
    for (const p of aiProviders) {
      assert.strictEqual(p.api_key, undefined); // Real secret MUST never be present
      assert.ok(p.api_key_masked.startsWith('sk-') || p.api_key_masked.startsWith('NOT_') || p.api_key_masked.startsWith('LOCAL_'));
    }
    report('T6c', 'AI Provider credentials strictly masked; zero secret keys leaked in API responses', true);

    // 6d. AI Usage & Cost Analytics
    const aiUsageRes = await fetch(`${baseUrl}/api/v1/superadmin/ai-usage-analytics`, {
      headers: { Authorization: `Bearer ${superadminToken}` }
    });
    assert.strictEqual(aiUsageRes.status, 200);
    const aiUsage = await aiUsageRes.json();
    assert.ok(aiUsage.total_tokens_consumed > 0);
    assert.ok(aiUsage.total_estimated_cost_usd > 0);
    report('T6d', `AI cost analytics verified: ${aiUsage.total_tokens_consumed} tokens consumed, \$${aiUsage.total_estimated_cost_usd} estimated cost`, true);

    // -------------------------------------------------------------------------
    // TEST 7: Feature Flag Lock: Video Generation Locked against Super Admin
    // -------------------------------------------------------------------------
    console.log('\n[TEST 7] Verifying Universal Video Generation Feature Flag Lock');

    const videoFlagAttempt = await fetch(`${baseUrl}/api/v1/superadmin/feature-flags/video_generation`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${superadminToken}` },
      body: JSON.stringify({ is_enabled: true })
    });
    assert.strictEqual(videoFlagAttempt.status, 403);
    const videoFlagErr = await videoFlagAttempt.json();
    assert.strictEqual(videoFlagErr.detail.code, 'FEATURE_DISABLED');
    report('T7', 'Video feature flag permanently locked: Even Super Admin is rejected when attempting to enable video', true);

    // -------------------------------------------------------------------------
    // TEST 8: Enterprise Audit Trail & Telemetry
    // -------------------------------------------------------------------------
    console.log('\n[TEST 8] Verifying Enterprise Audit Trail & Security Telemetry');

    const auditRes = await fetch(`${baseUrl}/api/v1/superadmin/audit-logs?limit=20`, {
      headers: { Authorization: `Bearer ${superadminToken}` }
    });
    assert.strictEqual(auditRes.status, 200);
    const auditLogs = await auditRes.json();
    assert.ok(auditLogs.length >= 5);
    const lastAudit = auditLogs[0];
    assert.ok(lastAudit.actor_id);
    assert.ok(lastAudit.action);
    assert.ok(lastAudit.timestamp || lastAudit.created_at);
    report('T8', `Audit logging active: ${auditLogs.length} security telemetry events captured with actor IDs and timestamps`, true);

    // -------------------------------------------------------------------------
    // TEST 9: Independent Hosting & Deployment Status Verification
    // -------------------------------------------------------------------------
    console.log('\n[TEST 9] Verifying Independent Hosting & Deployment Status');

    const deployRes = await fetch(`${baseUrl}/api/v1/superadmin/deployment-status`, {
      headers: { Authorization: `Bearer ${superadminToken}` }
    });
    assert.strictEqual(deployRes.status, 200);
    const deployData = await deployRes.json();
    assert.strictEqual(deployData.deployments.length, 3);

    const studentDeploy = deployData.deployments.find(d => d.target_host === 'studyai.com');
    const adminDeploy = deployData.deployments.find(d => d.target_host === 'admin.studyai.com');
    const superadminDeploy = deployData.deployments.find(d => d.target_host === 'superadmin.studyai.com');

    assert.ok(studentDeploy);
    assert.ok(adminDeploy);
    assert.ok(superadminDeploy);
    assert.strictEqual(superadminDeploy.rbac_scope, 'superadmin (MFA enforced)');
    report('T9', 'Verified 3 separately hosted target environments (studyai.com, admin.studyai.com, superadmin.studyai.com)', true);

    console.log('\n================================================================');
    console.log(`🎉 ALL ${passedCount} PHASE 7 ADMIN & SUPER ADMIN ACCEPTANCE TESTS PASSED!`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('\n❌ PHASE 7 VERIFICATION FAILED:', err);
    process.exitCode = 1;
  }
}

runPhase7Verification();
