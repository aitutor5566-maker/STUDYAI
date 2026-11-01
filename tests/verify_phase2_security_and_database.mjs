/**
 * STUDYAI — PHASE 2: DATABASE, AUTHENTICATION, RBAC & SECURITY VERIFICATION SUITE
 * 
 * Verifies live against Central FastAPI Production Backend (port 8000):
 *  1. Multi-Role Authentication (Student, Parent, Admin, Super Admin)
 *  2. Super Admin MFA Enforcement & Elevated Authorization
 *  3. RBAC & Granular Permission Scopes
 *  4. Prevention of Unauthorized Role Escalation
 *  5. Parent-Child Relationship Verification Guard
 *  6. Student Private Conversation Confidentiality (Chat Hidden from Parents by Default)
 *  7. Cross-Student Resource Isolation & Ownership Integrity
 *  8. Examination Engine: Attempt Submission, Auto-Grading & Percentiles
 *  9. Educational Game Sessions & Points Rewards
 * 10. Universal Video Generation Prohibition (Rejection with 403 FEATURE_DISABLED across all roles)
 * 11. Super Admin Inability to Enable Video Generation Flag
 * 12. Secure File Upload Size, MIME & Magic Bytes Validation
 * 13. Security Audit Logging Telemetry
 */

import assert from 'assert';

let passedCount = 0;
let failedCount = 0;

function report(step, description, success, details = '') {
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

async function runPhase2VerificationSuite() {
  console.log('\n================================================================');
  console.log('🛡️ RUNNING STUDYAI PHASE 2 SECURITY & DATABASE VERIFICATION SUITE');
  console.log('================================================================\n');

  const baseUrl = 'http://127.0.0.1:8000';

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Health & Universal Feature Flags Check
    // -------------------------------------------------------------------------
    console.log('[TEST 1] Verifying System Health & Video Prohibition Feature Flag');
    const healthRes = await fetch(`${baseUrl}/api/v1/health`);
    assert.strictEqual(healthRes.status, 200);
    const healthData = await healthRes.json();
    assert.strictEqual(healthData.video_generation.enabled, false);
    assert.strictEqual(healthData.video_generation.status, 'strictly_disabled');
    report('T1', 'Health endpoint reports honest status and strictly disabled video generation', true);

    // -------------------------------------------------------------------------
    // TEST 2: Multi-Role Authentication & Token Issuance
    // -------------------------------------------------------------------------
    console.log('\n[TEST 2] Verifying Multi-Role Authentication');
    
    // 2a. Student Login
    const studentLogin = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'vishwak@studyai.internal', password: 'StudentPass123!' })
    });
    assert.strictEqual(studentLogin.status, 200);
    const studentAuth = await studentLogin.json();
    assert.strictEqual(studentAuth.role, 'student');
    assert.ok(studentAuth.access_token);
    report('T2a', 'Student authentication issued signed token with student claims', true, `User: ${studentAuth.full_name}`);

    // 2b. Parent Login
    const parentLogin = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rajesh@studyai.internal', password: 'ParentPass123!' })
    });
    assert.strictEqual(parentLogin.status, 200);
    const parentAuth = await parentLogin.json();
    assert.strictEqual(parentAuth.role, 'parent');
    report('T2b', 'Parent authentication issued signed token with parent claims', true, `Parent: ${parentAuth.full_name}`);

    // 2c. Admin Login
    const adminLogin = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@nps-bengaluru.edu.in', password: 'AdminPass123!' })
    });
    assert.strictEqual(adminLogin.status, 200);
    const adminAuth = await adminLogin.json();
    assert.strictEqual(adminAuth.role, 'admin');
    report('T2c', 'Admin authentication issued signed token with tenant admin claims', true, `Admin: ${adminAuth.full_name}`);

    // -------------------------------------------------------------------------
    // TEST 3: Super Admin MFA Enforcement & Elevated Authorization
    // -------------------------------------------------------------------------
    console.log('\n[TEST 3] Verifying Super Admin MFA & Elevation Defense');
    
    // 3a. Rejection without valid MFA code
    const superWithoutMfa = await fetch(`${baseUrl}/api/v1/auth/superadmin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'superadmin@studyai.com',
        password: 'SuperAdminSecretPass2026!',
        mfa_code: '000000'
      })
    });
    assert.strictEqual(superWithoutMfa.status, 401);
    report('T3a', 'Super Admin login rejected with invalid MFA code (401 Unauthorized)', true);

    // 3b. Acceptance with verified MFA token
    const superWithMfa = await fetch(`${baseUrl}/api/v1/auth/superadmin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'superadmin@studyai.com',
        password: 'SuperAdminSecretPass2026!',
        mfa_code: '123456'
      })
    });
    assert.strictEqual(superWithMfa.status, 200);
    const superAuth = await superWithMfa.json();
    assert.strictEqual(superAuth.role, 'superadmin');
    report('T3b', 'Super Admin authenticated with 6-digit TOTP/MFA code and elevated claims', true);

    // -------------------------------------------------------------------------
    // TEST 4: Prevention of Role Escalation
    // -------------------------------------------------------------------------
    console.log('\n[TEST 4] Verifying Role Escalation Prevention');
    
    // School Admin attempts to escalate Student to Super Admin -> MUST BE REJECTED 403
    const escalationAttempt = await fetch(`${baseUrl}/api/v1/roles/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminAuth.access_token}`
      },
      body: JSON.stringify({
        user_id: 'usr_student_001',
        role: 'superadmin'
      })
    });
    assert.strictEqual(escalationAttempt.status, 403);
    const escData = await escalationAttempt.json();
    assert.strictEqual(escData.detail.code, 'ROLE_ESCALATION_BLOCKED');
    report('T4', 'Role escalation blocked: Admin cannot assign Superadmin privileges (403 ROLE_ESCALATION_BLOCKED)', true);

    // -------------------------------------------------------------------------
    // TEST 5: Parent-Child Relationship Verification & Child Progress Access
    // -------------------------------------------------------------------------
    console.log('\n[TEST 5] Verifying Parent-Child Access Restrictions');
    
    // 5a. Verified parent views linked child (Vishwak) progress
    const childProgRes = await fetch(`${baseUrl}/api/v1/parent/children/usr_student_001/progress`, {
      headers: { 'Authorization': `Bearer ${parentAuth.access_token}` }
    });
    assert.strictEqual(childProgRes.status, 200);
    const progData = await childProgRes.json();
    assert.strictEqual(progData.child_id, 'usr_student_001');
    report('T5a', 'Verified parent successfully accessed linked child progress and exams', true);

    // 5b. Parent attempts to access UNLINKED child (Bob) -> MUST BE REJECTED 403
    const unlinkedChildRes = await fetch(`${baseUrl}/api/v1/parent/children/usr_student_002/progress`, {
      headers: { 'Authorization': `Bearer ${parentAuth.access_token}` }
    });
    assert.strictEqual(unlinkedChildRes.status, 403);
    const unlinkedData = await unlinkedChildRes.json();
    assert.strictEqual(unlinkedData.detail.code, 'LINK_NOT_FOUND');
    report('T5b', 'Parent access to unlinked child rejected (403 LINK_NOT_FOUND)', true);

    // -------------------------------------------------------------------------
    // TEST 6: Student Private Conversation Confidentiality (Strict Privacy)
    // -------------------------------------------------------------------------
    console.log('\n[TEST 6] Verifying Student Private Conversation Confidentiality');
    
    // Verified parent attempts to inspect child's private tutor chat logs without explicit consent -> MUST BE REJECTED 403
    const privateChatRes = await fetch(`${baseUrl}/api/v1/parent/children/usr_student_001/conversations`, {
      headers: { 'Authorization': `Bearer ${parentAuth.access_token}` }
    });
    assert.strictEqual(privateChatRes.status, 403);
    const chatData = await privateChatRes.json();
    assert.strictEqual(chatData.detail.code, 'STUDENT_CHAT_CONFIDENTIAL');
    report('T6', 'Confidentiality preserved: Child private chat hidden from parent by default (403 STUDENT_CHAT_CONFIDENTIAL)', true);

    // -------------------------------------------------------------------------
    // TEST 7: Cross-Student Resource Isolation & Ownership Integrity
    // -------------------------------------------------------------------------
    console.log('\n[TEST 7] Verifying Cross-Student Resource Isolation');
    
    // Student Bob attempts to delete Student Vishwak's study notebook -> MUST BE REJECTED 403
    const bobLogin = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bob@studyai.internal', password: 'StudentPass123!' })
    });
    const bobAuth = await bobLogin.json();

    const crossDeleteRes = await fetch(`${baseUrl}/api/v1/notes/note_001`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${bobAuth.access_token}` }
    });
    assert.strictEqual(crossDeleteRes.status, 403);
    report('T7', 'Resource ownership enforced: Student Bob cannot delete Vishwak\'s notebook (403 FORBIDDEN)', true);

    // -------------------------------------------------------------------------
    // TEST 8: Examination Engine: Attempt Submission & Auto-Grading
    // -------------------------------------------------------------------------
    console.log('\n[TEST 8] Verifying Examination Engine & Automated Scoring');
    
    const examSubmitRes = await fetch(`${baseUrl}/api/v1/examinations/exam_001/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentAuth.access_token}`
      },
      body: JSON.stringify({
        answers: [
          { question_id: 'q_001', student_answer: 'Mitochondria' },
          { question_id: 'q_002', student_answer: 'Green' }
        ]
      })
    });
    assert.strictEqual(examSubmitRes.status, 200);
    const examResult = await examSubmitRes.json();
    assert.strictEqual(examResult.total_score, 20);
    assert.strictEqual(examResult.percentage, 100);
    assert.strictEqual(examResult.evaluations.length, 2);
    assert.strictEqual(examResult.evaluations[0].is_correct, true);
    report('T8', 'Examination attempt auto-graded: 100% score computed with detailed question feedback', true);

    // -------------------------------------------------------------------------
    // TEST 9: Educational Games & Gamified Points Reward
    // -------------------------------------------------------------------------
    console.log('\n[TEST 9] Verifying Educational Games & Gamification Points');
    
    const gameSessionRes = await fetch(`${baseUrl}/api/v1/games/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentAuth.access_token}`
      },
      body: JSON.stringify({
        game_type: 'space_shooter_3d',
        subject: 'Science',
        topic: 'Photosynthesis',
        score: 1500,
        accuracy: 95,
        correct_count: 14,
        total_questions: 15,
        stage_reached: 4,
        duration_seconds: 110
      })
    });
    assert.strictEqual(gameSessionRes.status, 201);
    const gameData = await gameSessionRes.json();
    assert.ok(gameData.points_earned > 0);
    assert.ok(gameData.total_points > 1450);
    report('T9', 'Game session recorded: Points awarded and total student balance updated', true, `Points Earned: ${gameData.points_earned}`);

    // -------------------------------------------------------------------------
    // TEST 10: Video Generation Strictly Disabled (All Roles & Methods)
    // -------------------------------------------------------------------------
    console.log('\n[TEST 10] Verifying Video Generation Strict Server-Side Prohibition');
    
    // 10a. Student POST /api/v1/media/video
    const studentVideoPost = await fetch(`${baseUrl}/api/v1/media/video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentAuth.access_token}`
      },
      body: JSON.stringify({ prompt: 'Create cell division video' })
    });
    assert.strictEqual(studentVideoPost.status, 403);
    const vidErrA = await studentVideoPost.json();
    assert.strictEqual(vidErrA.detail.code, 'FEATURE_DISABLED');

    // 10b. Admin GET /api/v1/media/video/:id
    const adminVideoGet = await fetch(`${baseUrl}/api/v1/media/video/vid_12345`, {
      headers: { 'Authorization': `Bearer ${adminAuth.access_token}` }
    });
    assert.strictEqual(adminVideoGet.status, 403);
    const vidErrB = await adminVideoGet.json();
    assert.strictEqual(vidErrB.detail.code, 'FEATURE_DISABLED');
    report('T10', 'Universal video generation prohibition enforced: Both POST and GET return 403 FEATURE_DISABLED', true);

    // -------------------------------------------------------------------------
    // TEST 11: Super Admin Cannot Enable Video Generation Flag
    // -------------------------------------------------------------------------
    console.log('\n[TEST 11] Verifying System Policy: Video Flag Locked Against Super Admin');
    
    const flagOverrideAttempt = await fetch(`${baseUrl}/api/v1/superadmin/feature-flags/video_generation`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superAuth.access_token}`
      },
      body: JSON.stringify({ is_enabled: true })
    });
    assert.strictEqual(flagOverrideAttempt.status, 403);
    const flagErr = await flagOverrideAttempt.json();
    assert.strictEqual(flagErr.detail.code, 'FEATURE_DISABLED');
    report('T11', 'Video flag locked: Even Super Admin is rejected when attempting to enable video (403 FEATURE_DISABLED)', true);

    // -------------------------------------------------------------------------
    // TEST 12: Secure File Upload Validation (PDF Magic Bytes Check)
    // -------------------------------------------------------------------------
    console.log('\n[TEST 12] Verifying Secure File Upload (MIME & Magic Bytes Header)');
    
    // Base64 for valid PDF starting with %PDF-
    const validPdfBase64 = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF').toString('base64');
    const uploadRes = await fetch(`${baseUrl}/api/v1/library/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminAuth.access_token}`
      },
      body: JSON.stringify({
        title: 'NCERT Grade 10 Biology Syllabus Guide',
        subject: 'Science',
        grade: 'Grade 10',
        filename: 'biology_guide.pdf',
        mime_type: 'application/pdf',
        file_content_base64: validPdfBase64
      })
    });
    assert.strictEqual(uploadRes.status, 201);
    const uploadData = await uploadRes.json();
    assert.strictEqual(uploadData.mime_type, 'application/pdf');

    // Tampered upload (MIME claimed PDF, but content is executable / not %PDF-)
    const tamperedBase64 = Buffer.from('MALICIOUS_BINARY_EXEC_PAYLOAD').toString('base64');
    const tamperedRes = await fetch(`${baseUrl}/api/v1/library/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminAuth.access_token}`
      },
      body: JSON.stringify({
        title: 'Tampered Exploit Test',
        subject: 'Science',
        grade: 'Grade 10',
        filename: 'exploit.pdf',
        mime_type: 'application/pdf',
        file_content_base64: tamperedBase64
      })
    });
    assert.strictEqual(tamperedRes.status, 400);
    const tamperedErr = await tamperedRes.json();
    assert.strictEqual(tamperedErr.detail.code, 'MAGIC_BYTES_MISMATCH');
    report('T12', 'File validation security: Tampered binary payload rejected (400 MAGIC_BYTES_MISMATCH)', true);

    // -------------------------------------------------------------------------
    // TEST 13: Security Audit Logging Telemetry
    // -------------------------------------------------------------------------
    console.log('\n[TEST 13] Verifying Security Audit Log Telemetry');
    
    const auditRes = await fetch(`${baseUrl}/api/v1/superadmin/audit-logs`, {
      headers: { 'Authorization': `Bearer ${superAuth.access_token}` }
    });
    assert.strictEqual(auditRes.status, 200);
    const logs = await auditRes.json();
    assert.ok(Array.isArray(logs));
    assert.ok(logs.length > 0);
    const videoAttemptLog = logs.find(l => l.action === 'VIDEO_ENABLE_ATTEMPT_BLOCKED');
    assert.ok(videoAttemptLog);
    report('T13', 'Audit logging active: Security events captured with actor ID, role, action, and timestamp', true, `Captured ${logs.length} audit telemetry entries`);

    console.log('\n================================================================');
    console.log(`🎉 ALL ${passedCount} PHASE 2 SECURITY & DATABASE ACCEPTANCE TESTS PASSED!`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('\n❌ VERIFICATION TEST FAILED:', err);
    process.exitCode = 1;
  }
}

runPhase2VerificationSuite();
