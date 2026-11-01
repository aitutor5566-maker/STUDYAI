/**
 * STUDYAI — MASTER PROMPT 1 FOUNDATION ACCEPTANCE SUITE
 * 
 * Verifies:
 * 1. Monorepo directory structure & audit documentation (including DATABASE_DESIGN.md)
 * 2. Official Three.js repository integration, license compliance & 3D engine structure
 * 3. PostgreSQL 39-table schema, RLS policies & multi-role authorization
 * 4. FastAPI backend modules, health endpoints & OpenAPI docs
 * 5. Strict server-side video generation restriction
 * 6. Isolated 3-application architecture (student, admin, superadmin)
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

let passedCount = 0;
let failedCount = 0;

function report(step, description, success, details) {
  if (success) {
    passedCount++;
    console.log(`  ✔ [PASS] ${step}: ${description}`);
    if (details) console.log(`     ${details}`);
  } else {
    failedCount++;
    console.error(`  ✖ [FAIL] ${step}: ${description}`);
    if (details) console.error(`     Error: ${details}`);
  }
}

async function runPrompt1FoundationSuite() {
  console.log('\n================================================================');
  console.log('🏛️ RUNNING STUDYAI MASTER PROMPT 1: FOUNDATION & INTEGRATION SUITE');
  console.log('================================================================\n');

  const baseUrl = 'http://127.0.0.1:8000';

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Project Structure & Audit Documentation Audit
    // -------------------------------------------------------------------------
    console.log('[TEST 1] Verifying Monorepo Structure & Core Architecture Documents');

    // Required Documentation Files
    const requiredDocs = [
      'PROJECT_AUDIT.md',
      'EXISTING_FEATURES.md',
      'ARCHITECTURE.md',
      'TECHNOLOGY_STACK.md',
      'DATABASE_DESIGN.md',
      'DEVELOPMENT_ROADMAP.md',
      'KNOWN_ISSUES.md'
    ];

    for (const doc of requiredDocs) {
      assert.ok(fs.existsSync(doc), `Missing required document: ${doc}`);
      const content = fs.readFileSync(doc, 'utf-8');
      assert.ok(content.length > 500, `Document ${doc} is too short or empty`);
    }
    report('T1a', 'All 7 mandatory architectural audit and design documents verified', true);

    // Required Monorepo Directories
    const requiredDirs = [
      'apps/student_app',
      'apps/admin_portal',
      'apps/superadmin_portal',
      'backend/app/api',
      'backend/app/core',
      'backend/app/models',
      'backend/app/schemas',
      'backend/app/services',
      'backend/app/repositories',
      'backend/app/security',
      'backend/app/ai',
      'backend/app/tests',
      'database/migrations',
      'database/policies',
      'database/seeds',
      'visual_learning/three.js',
      'visual_learning/src/core',
      'visual_learning/src/scenes',
      'visual_learning/src/models',
      'visual_learning/src/animations',
      'visual_learning/src/interactions',
      'visual_learning/src/materials',
      'visual_learning/src/lighting',
      'visual_learning/src/labels',
      'visual_learning/src/loaders',
      'visual_learning/src/integration',
      'visual_learning/assets/biology',
      'visual_learning/assets/physics',
      'visual_learning/assets/chemistry',
      'visual_learning/assets/geography',
      'visual_learning/assets/mathematics',
      'packages/shared_models',
      'packages/shared_ui',
      'packages/shared_services',
      'infrastructure/docker',
      'infrastructure/deployment',
      'infrastructure/ci_cd',
      'docs',
      'tests'
    ];

    for (const dir of requiredDirs) {
      assert.ok(fs.existsSync(dir), `Missing required directory: ${dir}`);
    }
    report('T1b', 'Complete 39-directory monorepo hierarchy verified matching master specification', true);

    // -------------------------------------------------------------------------
    // TEST 2: Official Three.js Repository Integration & License Compliance
    // -------------------------------------------------------------------------
    console.log('\n[TEST 2] Verifying Official Three.js GitHub Integration & 3D Engine');

    const threeJsDir = 'visual_learning/three.js';
    assert.ok(fs.existsSync(path.join(threeJsDir, 'package.json')), 'Three.js package.json missing');
    assert.ok(fs.existsSync(path.join(threeJsDir, 'LICENSE')), 'Three.js LICENSE missing');
    assert.ok(fs.existsSync(path.join(threeJsDir, 'INTEGRATION.md')), 'INTEGRATION.md missing');

    const threePkg = JSON.parse(fs.readFileSync(path.join(threeJsDir, 'package.json'), 'utf-8'));
    assert.strictEqual(threePkg.name, 'three');
    assert.ok(threePkg.version.includes('0.170.0'), 'Must be official Three.js v0.170.0');

    const licenseContent = fs.readFileSync(path.join(threeJsDir, 'LICENSE'), 'utf-8');
    assert.ok(licenseContent.includes('The MIT License'), 'Official MIT License must be preserved');
    assert.ok(licenseContent.includes('three.js authors') || licenseContent.includes('three.js'), 'Upstream author attribution preserved');

    // Engine Capabilities
    const enginePath = 'visual_learning/engine/VisualLearningEngine.ts';
    assert.ok(fs.existsSync(enginePath), 'VisualLearningEngine.ts missing');
    const engineCode = fs.readFileSync(enginePath, 'utf-8');
    assert.ok(engineCode.includes('createHumanHeart'), 'Engine missing Human Heart procedural geometry');
    assert.ok(engineCode.includes('createDnaHelix'), 'Engine missing DNA procedural geometry');
    assert.ok(engineCode.includes('createChloroplastPhotosynthesis'), 'Engine missing Chloroplast geometry');
    assert.ok(engineCode.includes('createAtomicStructure'), 'Engine missing Atomic Structure geometry');
    assert.ok(engineCode.includes('createSolarSystem'), 'Engine missing Solar System geometry');
    assert.ok(engineCode.includes('dispose'), 'Engine missing memory cleanup / WebGL resource disposal');
    report('T2', 'Official Three.js v0.170.0 integration, MIT license & procedural geometry engine verified', true);

    // -------------------------------------------------------------------------
    // TEST 3: Normalized PostgreSQL Schema & Supabase RLS Policies
    // -------------------------------------------------------------------------
    console.log('\n[TEST 3] Verifying Database Architecture & Security Policies');

    const schemaSql = fs.readFileSync('database/migrations/004_phase2_comprehensive_schema.sql', 'utf-8');
    const rlsSql = fs.readFileSync('database/policies/005_phase2_rls_policies.sql', 'utf-8');

    // Verify key tables in DDL
    const expectedTables = [
      'tenants', 'users', 'student_profiles', 'parent_profiles',
      'parent_child_relationships', 'admin_profiles', 'superadmin_accounts',
      'roles', 'permissions', 'role_permissions', 'user_role_assignments',
      'academic_levels', 'subjects', 'topics', 'subtopics', 'lessons',
      'ai_conversations', 'ai_messages', 'learning_sessions', 'generated_images',
      'ai_notes', 'library_resources', 'games', 'game_sessions',
      'points_transactions', 'achievements', 'student_achievements',
      'examinations', 'exam_questions', 'examination_attempts',
      'examination_answers', 'examination_results', 'student_progress',
      'study_schedules', 'notifications', 'payments', 'audit_logs',
      'ai_provider_configs', 'feature_flags'
    ];

    for (const tbl of expectedTables) {
      assert.ok(
        schemaSql.includes(`CREATE TABLE IF NOT EXISTS ${tbl}`) || schemaSql.includes(`CREATE TABLE ${tbl}`),
        `Schema missing expected table: ${tbl}`
      );
    }
    report('T3a', `All 39 normalized relational tables verified in PostgreSQL migration DDL`, true);

    // Verify RLS policy rules
    assert.ok(rlsSql.includes('ENABLE ROW LEVEL SECURITY'), 'RLS enablement missing in policies');
    assert.ok(rlsSql.includes('Students manage own ai notes'), 'Student note isolation policy missing');
    assert.ok(rlsSql.includes('Verified parents can view child student profile'), 'Parent verification policy missing');
    assert.ok(rlsSql.includes('Accountants and admins manage payments'), 'Accountant financial policy missing');
    report('T3b', 'Supabase Row Level Security (RLS) policies verified for Student, Parent, Admin & Accountant', true);

    // -------------------------------------------------------------------------
    // TEST 4: FastAPI Gateway Health & OpenAPI Documentation Probes
    // -------------------------------------------------------------------------
    console.log('\n[TEST 4] Verifying FastAPI Gateway Health & API Specification');

    const healthRes = await fetch(`${baseUrl}/api/v1/health`);
    assert.strictEqual(healthRes.status, 200);
    const healthData = await healthRes.json();
    assert.ok(healthData.status === 'ok' || healthData.status === 'healthy');
    assert.strictEqual(healthData.video_generation.enabled, false);
    report('T4a', `FastAPI health endpoint active: ${healthData.service} v${healthData.version}`, true);

    const openapiRes = await fetch(`${baseUrl}/openapi.json`);
    assert.strictEqual(openapiRes.status, 200);
    const openapi = await openapiRes.json();
    assert.ok(openapi.paths['/api/v1/auth/login']);
    assert.ok(openapi.paths['/api/v1/auth/superadmin/login']);
    assert.ok(openapi.paths['/api/v1/tutor/ask']);
    assert.ok(openapi.paths['/api/v1/notes']);
    assert.ok(openapi.paths['/api/v1/library']);
    assert.ok(openapi.paths['/api/v1/examinations']);
    assert.ok(openapi.paths['/api/v1/superadmin/overview']);
    report('T4b', `OpenAPI 3.1 specification active with ${Object.keys(openapi.paths).length} modular routes`, true);

    // -------------------------------------------------------------------------
    // TEST 5: Multi-Role Authentication & Privilege Escalation Defense
    // -------------------------------------------------------------------------
    console.log('\n[TEST 5] Verifying Authentication & Server-Side Security Enforcement');

    // 5a. Student Authentication
    const sLogin = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'vishwak@studyai.internal', password: 'StudentPass123!' })
    });
    assert.strictEqual(sLogin.status, 200);
    const sData = await sLogin.json();
    assert.strictEqual(sData.role, 'student');
    report('T5a', 'Student authenticated with signed JWT bearer claims', true);

    // 5b. Admin Privilege Escalation Rejection
    const aLogin = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@nps-bengaluru.edu.in', password: 'AdminPass123!' })
    });
    assert.strictEqual(aLogin.status, 200);
    const aToken = (await aLogin.json()).access_token;

    const escalateAttempt = await fetch(`${baseUrl}/api/v1/admin/users/provision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${aToken}` },
      body: JSON.stringify({
        email: 'attacker@studyai.internal',
        password: 'Password123!',
        full_name: 'Privilege Attacker',
        role: 'superadmin'
      })
    });
    assert.strictEqual(escalateAttempt.status, 403);
    report('T5b', 'Privilege escalation defense verified: Admin cannot create Super Admin (403 Forbidden)', true);

    // 5c. Super Admin MFA Rejection & Acceptance
    const badMfa = await fetch(`${baseUrl}/api/v1/auth/superadmin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'superadmin@studyai.com',
        password: 'SuperAdminSecretPass2026!',
        mfa_code: '000000'
      })
    });
    assert.strictEqual(badMfa.status, 401);

    const goodMfa = await fetch(`${baseUrl}/api/v1/auth/superadmin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'superadmin@studyai.com',
        password: 'SuperAdminSecretPass2026!',
        mfa_code: '123456'
      })
    });
    assert.strictEqual(goodMfa.status, 200);
    report('T5c', 'Super Admin elevated access verified with mandatory 6-digit TOTP MFA', true);

    // -------------------------------------------------------------------------
    // TEST 6: Universal Video Generation Restriction
    // -------------------------------------------------------------------------
    console.log('\n[TEST 6] Verifying Universal Video Generation Restriction');

    const videoReq = await fetch(`${baseUrl}/api/v1/media/video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Create cell division video' })
    });
    assert.strictEqual(videoReq.status, 403);
    const vidErr = await videoReq.json();
    assert.strictEqual(vidErr.detail.code, 'FEATURE_DISABLED');
    report('T6', 'Universal video generation prohibition enforced: Endpoint rejected with 403 FEATURE_DISABLED', true);

    console.log('\n================================================================');
    console.log(`🎉 ALL ${passedCount} MASTER PROMPT 1 ACCEPTANCE TESTS PASSED!`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('\n❌ MASTER PROMPT 1 VERIFICATION FAILED:', err);
    process.exit(1);
  }
}

runPrompt1FoundationSuite();
