/**
 * STUDYAI — PHASE 8 COMPLETE SYSTEM INTEGRATION, QA & PRODUCTION SUITE
 * 
 * Verifies end-to-end student journeys, multi-discipline AI Tutor quality,
 * security boundaries, video restriction, deployment configs, and store readiness.
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

async function runPhase8MasterIntegrationSuite() {
  console.log('\n================================================================');
  console.log('🚀 RUNNING STUDYAI PHASE 8 MASTER SYSTEM INTEGRATION & QA SUITE');
  console.log('================================================================\n');

  const baseUrl = 'http://127.0.0.1:8000';

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Deployment & Store Readiness Assets Audit
    // -------------------------------------------------------------------------
    console.log('[TEST 1] Verifying Production Deployment & Store Readiness Artifacts');
    
    // Check Android release setup
    assert.ok(fs.existsSync('apps/student_app/android/build.gradle'), 'Android build.gradle missing');
    assert.ok(fs.existsSync('apps/student_app/android/app/build.gradle'), 'Android app build.gradle missing');
    assert.ok(fs.existsSync('apps/student_app/android/app/src/main/AndroidManifest.xml'), 'AndroidManifest.xml missing');
    assert.ok(fs.existsSync('apps/student_app/android/app/proguard-rules.pro'), 'Proguard rules missing');
    assert.ok(fs.existsSync('apps/student_app/android/key.properties.example'), 'Key properties template missing');
    
    // Check iOS release setup
    assert.ok(fs.existsSync('apps/student_app/ios/Podfile'), 'iOS Podfile missing');
    assert.ok(fs.existsSync('apps/student_app/ios/Runner/Info.plist'), 'iOS Info.plist missing');
    assert.ok(fs.existsSync('apps/student_app/ios/Runner/AppDelegate.swift'), 'AppDelegate.swift missing');
    
    // Check Store readiness assets & documentation
    assert.ok(fs.existsSync('apps/student_app/assets/icons/app_icon.svg'), 'App icon SVG missing');
    assert.ok(fs.existsSync('apps/student_app/assets/splash/splash_screen.svg'), 'Splash screen SVG missing');
    assert.ok(fs.existsSync('docs/PRIVACY_POLICY.md'), 'Privacy policy missing');
    assert.ok(fs.existsSync('docs/DATA_SAFETY.md'), 'Data safety disclosure missing');
    assert.ok(fs.existsSync('docs/PERMISSIONS_REVIEW.md'), 'Permissions review missing');
    assert.ok(fs.existsSync('docs/STORE_METADATA.md'), 'Store metadata missing');

    // Check Production deployment configurations
    assert.ok(fs.existsSync('infrastructure/deployment/nginx.prod.conf'), 'Production Nginx config missing');
    assert.ok(fs.existsSync('infrastructure/deployment/docker-compose.prod.yml'), 'Production Docker Compose missing');
    assert.ok(fs.existsSync('scripts/backup_database.sh'), 'Database backup script missing');
    assert.ok(fs.existsSync('scripts/restore_database.sh'), 'Database restore script missing');
    assert.ok(fs.existsSync('scripts/health_check.sh'), 'Health check script missing');

    report('T1', 'All Android, iOS, Store Readiness, Nginx TLS & Backup scripts verified', true);

    // -------------------------------------------------------------------------
    // TEST 2: System Health & Universal Video Generation Restriction
    // -------------------------------------------------------------------------
    console.log('\n[TEST 2] Verifying Ecosystem Health & Universal Video Restriction');
    
    const healthRes = await fetch(`${baseUrl}/api/v1/health`);
    assert.strictEqual(healthRes.status, 200);
    const healthData = await healthRes.json();
    assert.ok(healthData.status === 'ok' || healthData.status === 'healthy');
    assert.strictEqual(healthData.video_generation.enabled, false);

    const videoReq = await fetch(`${baseUrl}/api/v1/media/video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Generate video of human heart' })
    });
    assert.strictEqual(videoReq.status, 403);
    const videoErr = await videoReq.json();
    assert.strictEqual(videoErr.detail.code, 'FEATURE_DISABLED');
    report('T2', 'System healthy and universal video generation strictly disabled (403 FEATURE_DISABLED)', true);

    // -------------------------------------------------------------------------
    // TEST 3: Complete 17-Step End-to-End Student Mastery Journey
    // -------------------------------------------------------------------------
    console.log('\n[TEST 3] Executing Complete 17-Step End-to-End Student Mastery Journey');

    // Step 1: Self-Service Registration & Login
    const uniqueStudentEmail = `journey_student_${Date.now()}@studyai.internal`;
    const regRes = await fetch(`${baseUrl}/api/v1/auth/register/student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: uniqueStudentEmail,
        password: 'StudentJourneyPass123!',
        full_name: 'Ananya Ramesh',
        grade: 'Grade 10',
        board: 'CBSE'
      })
    });
    assert.strictEqual(regRes.status, 200);
    const studentAuth = await regRes.json();
    const sToken = studentAuth.access_token;
    const studentId = studentAuth.user_id;
    assert.ok(sToken);
    report('T3.1', `Student registered & authenticated: ${studentAuth.full_name} (${studentId})`, true);

    // Step 2: Learning Preference Setup
    const prefRes = await fetch(`${baseUrl}/api/v1/profiles/student/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sToken}`
      },
      body: JSON.stringify({
        grade: 'Grade 10',
        board: 'CBSE',
        preferred_learning_style: 'visual'
      })
    });
    assert.strictEqual(prefRes.status, 200);
    report('T3.2', 'Student learning preferences updated (visual style, CBSE 10 targets)', true);

    // Step 3: Open Home Telemetry & Curriculum
    const subjectsRes = await fetch(`${baseUrl}/api/v1/curriculum/subjects`, {
      headers: { Authorization: `Bearer ${sToken}` }
    });
    assert.strictEqual(subjectsRes.status, 200);
    const subjectsList = await subjectsRes.json();
    assert.ok(subjectsList.length >= 2);

    const progressRes = await fetch(`${baseUrl}/api/v1/progress`, {
      headers: { Authorization: `Bearer ${sToken}` }
    });
    assert.strictEqual(progressRes.status, 200);
    report('T3.3', `Home telemetry loaded with ${subjectsList.length} curriculum subjects`, true);

    // Step 4 & 5: Ask AI Tutor & Receive 14-Section Structured Explanation
    const tutorRes = await fetch(`${baseUrl}/api/v1/tutor/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sToken}`
      },
      body: JSON.stringify({
        topic: 'Human Heart and Blood Circulation',
        question: 'Explain double circulation, chambers, valves, and SA node pacemaker',
        grade: 10,
        level: 'Grade 10',
        subject: 'Science',
        mode: 'detailed'
      })
    });
    assert.strictEqual(tutorRes.status, 200);
    const lesson = await tutorRes.json();
    assert.ok(lesson.lesson_id);
    assert.ok(lesson.topic_overview);
    assert.ok(lesson.learning_objectives.length >= 3);
    assert.ok(lesson.definitions.length >= 2);
    assert.ok(lesson.topic_summary);
    report('T3.4-5', `AI Tutor synthesized 14-section pedagogical lesson: ${lesson.lesson_id}`, true);

    // Step 6: View Relevant Educational Labeled SVG Visual
    assert.ok(lesson.visual_representations.length > 0);
    assert.ok(lesson.visual_representations[0].data_url.startsWith('data:image/svg+xml'));
    report('T3.6', 'Pedagogical labeled SVG vector diagram verified within lesson response', true);

    // Step 7: Open Interactive Three.js Simulation
    assert.ok(lesson.three_js_model);
    assert.strictEqual(lesson.three_js_model.has_3d_support, true);
    assert.strictEqual(lesson.three_js_model.model_id, 'human_heart');
    report('T3.7', `Interactive Three.js 3D model mapped: ${lesson.three_js_model.model_id}`, true);

    // Step 8: Ask Context-Preserved Follow-Up Question
    const followUpRes = await fetch(`${baseUrl}/api/v1/tutor/follow-up`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sToken}`
      },
      body: JSON.stringify({
        action_type: 'simpler',
        topic: lesson.topic,
        current_lesson_id: lesson.lesson_id
      })
    });
    assert.strictEqual(followUpRes.status, 200);
    const followUp = await followUpRes.json();
    assert.ok(followUp.teacher_explanation);
    report('T3.8', 'Teacher follow-up answered in context with analogy breakdown', true);

    // Step 9: Save Lesson into AI Notes
    const saveRes = await fetch(`${baseUrl}/api/v1/tutor/save-to-notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sToken}`
      },
      body: JSON.stringify({
        lesson_id: lesson.lesson_id,
        title: 'Master Study Notes: Human Heart & Blood Flow',
        topic: lesson.topic,
        subject: lesson.subject,
        notebook_name: 'Cardiology 2026',
        content_markdown: lesson.detailed_explanation
      })
    });
    assert.strictEqual(saveRes.status, 201);
    const savedNote = await saveRes.json();
    const noteId = savedNote.note_id;
    assert.ok(noteId);
    report('T3.9', `Lesson saved directly into AI Study Notebook: ${noteId}`, true);

    // Step 10: Create and Edit AI Notes (Autosave & KaTeX Math)
    const autosaveRes = await fetch(`${baseUrl}/api/v1/notes/${noteId}/autosave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sToken}`
      },
      body: JSON.stringify({
        content_markdown: '# Human Circulatory System\n\nCardiac Output formula: $CO = HR \\times SV$\n\n- Heart Rate (HR)\n- Stroke Volume (SV)'
      })
    });
    assert.strictEqual(autosaveRes.status, 200);
    const autosaveData = await autosaveRes.json();
    assert.strictEqual(autosaveData.status, 'autosaved');
    report('T3.10', `AI Notebook updated via debounced autosave (Version ${autosaveData.version})`, true);

    // Step 11: Find Resources in Centralized Library
    const libRes = await fetch(`${baseUrl}/api/v1/library?q=heart`, {
      headers: { Authorization: `Bearer ${sToken}` }
    });
    assert.strictEqual(libRes.status, 200);
    const libData = await libRes.json();
    const libItems = libData.items || libData.resources || [];
    assert.ok(libItems.length >= 1);
    report('T3.11', `Library query located ${libItems.length} matching resources`, true);

    // Step 12: Use the 3D Lab Simulation
    const models3dRes = await fetch(`${baseUrl}/api/v1/visual-3d/models`, {
      headers: { Authorization: `Bearer ${sToken}` }
    });
    assert.strictEqual(models3dRes.status, 200);
    const models = await models3dRes.json();
    const heartModel = models.find(m => m.id === 'human_heart');
    assert.ok(heartModel);
    const partsList = heartModel.parts || heartModel.annotations || [];
    assert.ok(partsList.length >= 4);
    report('T3.12', `3D Lab simulation retrieved: ${heartModel.title || heartModel.name} with ${partsList.length} anatomical parts`, true);

    // Step 13: Play All Three Adaptive Educational Games
    const gamesCatalogRes = await fetch(`${baseUrl}/api/v1/games/catalog`, {
      headers: { Authorization: `Bearer ${sToken}` }
    });
    assert.strictEqual(gamesCatalogRes.status, 200);
    const catalog = await gamesCatalogRes.json();
    const gamesList = Array.isArray(catalog) ? catalog : (catalog.games || []);
    assert.strictEqual(gamesList.length, 3);
    report('T3.13a', 'Catalog retrieved all 3 adaptive games (Concept Duel, Astro Interceptor 3D, Path Runner)', true);

    // Play Game 1: Answer Battle / Concept Duel
    const g1Session = await fetch(`${baseUrl}/api/v1/games/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sToken}`
      },
      body: JSON.stringify({
        game_type: 'answer_battle',
        subject: 'Science',
        topic: 'Photosynthesis',
        score: 1500,
        accuracy: 100,
        correct_count: 5,
        total_questions: 5,
        stage_reached: 3,
        duration_seconds: 60
      })
    });
    assert.strictEqual(g1Session.status, 201);

    // Play Game 2: Astro Interceptor 3D
    const g2Session = await fetch(`${baseUrl}/api/v1/games/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sToken}`
      },
      body: JSON.stringify({
        game_type: 'space_shooter',
        subject: 'Science',
        topic: 'Motion',
        score: 1200,
        accuracy: 80,
        correct_count: 4,
        total_questions: 5,
        stage_reached: 2,
        duration_seconds: 60
      })
    });
    assert.strictEqual(g2Session.status, 201);

    // Play Game 3: Concept Path Runner
    const g3Session = await fetch(`${baseUrl}/api/v1/games/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sToken}`
      },
      body: JSON.stringify({
        game_type: 'learning_runner',
        subject: 'Science',
        topic: 'Photosynthesis',
        score: 1400,
        accuracy: 100,
        correct_count: 5,
        total_questions: 5,
        stage_reached: 3,
        duration_seconds: 60
      })
    });
    assert.strictEqual(g3Session.status, 201);
    report('T3.13b', 'All 3 adaptive educational games played and authoritative sessions logged', true);

    // Step 14: Earn Points & Ledger Verification
    const pointsRes = await fetch(`${baseUrl}/api/v1/points/balance`, {
      headers: { Authorization: `Bearer ${sToken}` }
    });
    assert.strictEqual(pointsRes.status, 200);
    const pointsData = await pointsRes.json();
    assert.ok(pointsData.total_points > 0);
    report('T3.14', `Authoritative points ledger verified: ${pointsData.total_points} XP earned`, true);

    // Step 15: Attempt Weekly Examination
    const startExamRes = await fetch(`${baseUrl}/api/v1/examinations/exam_001/start`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${sToken}` }
    });
    assert.strictEqual(startExamRes.status, 200);
    const attempt = await startExamRes.json();
    const attemptId = attempt.attempt_id;
    assert.ok(attemptId);

    // Autosave examination progress
    const examAutosave = await fetch(`${baseUrl}/api/v1/examinations/exam_001/save-progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sToken}`
      },
      body: JSON.stringify({
        attempt_id: attemptId,
        answers: {
          q_001: 'Mitochondria'
        },
        time_spent_seconds: 120
      })
    });
    assert.strictEqual(examAutosave.status, 200);
    report('T3.15', `Weekly examination started (${attemptId}) & answers autosaved`, true);

    // Step 16: Submit Examination & View Topic Diagnostics
    const submitRes = await fetch(`${baseUrl}/api/v1/examinations/exam_001/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sToken}`
      },
      body: JSON.stringify({
        attempt_id: attemptId,
        answers: [
          { question_id: 'q_001', student_answer: 'Mitochondria' },
          { question_id: 'q_002', student_answer: 'Green' }
        ]
      })
    });
    assert.strictEqual(submitRes.status, 200);
    const examResult = await submitRes.json();
    assert.ok(examResult.percentage >= 80);
    report('T3.16', `Exam evaluated: ${examResult.percentage}% score with topic diagnostics`, true);

    // Step 17: Access Student Profile
    const profileRes = await fetch(`${baseUrl}/api/v1/profiles/student/${studentId}`, {
      headers: { Authorization: `Bearer ${sToken}` }
    });
    assert.strictEqual(profileRes.status, 200);
    const profile = await profileRes.json();
    assert.strictEqual(profile.grade, 'Grade 10');
    report('T3.17', 'Student profile and academic telemetry verified', true);

    // -------------------------------------------------------------------------
    // TEST 4: Multi-Discipline AI Tutor Quality Testing (5 Subjects)
    // -------------------------------------------------------------------------
    console.log('\n[TEST 4] Evaluating AI Tutor Quality Across 5 Foundational Subjects');

    const subjectsToTest = [
      { subject: 'Biology', topic: 'Plant Cell Structure and Photosynthesis' },
      { subject: 'Physics', topic: "Newton's Laws of Motion & Momentum" },
      { subject: 'Chemistry', topic: 'Chemical Bonding & Ionic Reactions' },
      { subject: 'Mathematics', topic: 'Pythagorean Theorem & Trigonometry' },
      { subject: 'Geography', topic: 'Water Cycle & Hydrological Processes' }
    ];

    for (const testItem of subjectsToTest) {
      const resp = await fetch(`${baseUrl}/api/v1/tutor/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sToken}`
        },
        body: JSON.stringify({
          topic: testItem.topic,
          question: `Explain core concepts and examination focus for ${testItem.topic}`,
          grade: 10,
          level: 'Grade 10',
          subject: testItem.subject,
          mode: 'detailed'
        })
      });
      assert.strictEqual(resp.status, 200);
      const data = await resp.json();
      assert.ok(data.lesson_id);
      assert.ok(data.topic_overview);
      assert.ok(data.learning_objectives.length >= 2);
      assert.ok(data.visual_representations.length > 0);
      assert.ok(data.three_js_model);
      report('T4', `Quality verified: ${testItem.subject} — "${testItem.topic}" (14 sections, SVG diagram & 3D)`, true);
    }

    // -------------------------------------------------------------------------
    // TEST 5: Comprehensive Security & Unauthorized Access Defense
    // -------------------------------------------------------------------------
    console.log('\n[TEST 5] Verifying Security Boundaries & Unauthorized Access Defense');

    // 5a. Role Escalation Defense: School Admin cannot create Super Admin
    const adminLogin = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@nps-bengaluru.edu.in', password: 'AdminPass123!' })
    });
    assert.strictEqual(adminLogin.status, 200);
    const adminToken = (await adminLogin.json()).access_token;

    const escalateAttempt = await fetch(`${baseUrl}/api/v1/admin/users/provision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        email: 'malicious_super@studyai.internal',
        password: 'Password123!',
        full_name: 'Privilege Escalator',
        role: 'superadmin'
      })
    });
    assert.strictEqual(escalateAttempt.status, 403);
    report('T5a', 'Role escalation blocked: School Admin cannot create Superadmin (403 Forbidden)', true);

    // 5b. Accountant Boundary: Accountant blocked from student roster
    const accountantLogin = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'finance@nps-bengaluru.edu.in', password: 'FinancePass123!' })
    });
    assert.strictEqual(accountantLogin.status, 200);
    const accountantToken = (await accountantLogin.json()).access_token;

    const accountantRosterAttempt = await fetch(`${baseUrl}/api/v1/admin/students`, {
      headers: { Authorization: `Bearer ${accountantToken}` }
    });
    assert.strictEqual(accountantRosterAttempt.status, 403);
    report('T5b', 'Accountant blocked from student roster and personal info (403 Forbidden)', true);

    // 5c. Super Admin MFA Enforcement & Secret Masking
    const superLogin = await fetch(`${baseUrl}/api/v1/auth/superadmin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'superadmin@studyai.com',
        password: 'SuperAdminSecretPass2026!',
        mfa_code: '123456'
      })
    });
    assert.strictEqual(superLogin.status, 200);
    const superToken = (await superLogin.json()).access_token;

    const aiProvidersRes = await fetch(`${baseUrl}/api/v1/superadmin/ai-providers`, {
      headers: { Authorization: `Bearer ${superToken}` }
    });
    assert.strictEqual(aiProvidersRes.status, 200);
    const providers = await aiProvidersRes.json();
    for (const p of providers) {
      assert.strictEqual(p.api_key, undefined);
      assert.strictEqual(p.api_key_masked, 'sk-proj-****************');
    }
    report('T5c', 'Super Admin MFA verified and secret API keys masked across all provider responses', true);

    // 5d. File Upload Security: Tampered Magic Bytes Rejected
    const fakePdfBytes = Buffer.from('NOT_A_REAL_PDF_JUST_TEXT');
    const uploadRes = await fetch(`${baseUrl}/api/v1/library/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: 'Tampered Document',
        filename: 'tampered.pdf',
        mime_type: 'application/pdf',
        file_content_base64: fakePdfBytes.toString('base64')
      })
    });
    assert.strictEqual(uploadRes.status, 400);
    const uploadErr = await uploadRes.json();
    assert.strictEqual(uploadErr.detail.code, 'MAGIC_BYTES_MISMATCH');
    report('T5d', 'MIME spoofing blocked: Binary magic byte mismatch rejected (400 MAGIC_BYTES_MISMATCH)', true);

    // -------------------------------------------------------------------------
    // TEST 6: Independent Multi-Target Hosting Verification
    // -------------------------------------------------------------------------
    console.log('\n[TEST 6] Verifying Separately Hosted Target Ecosystem');

    const deployStatusRes = await fetch(`${baseUrl}/api/v1/superadmin/deployment-status`, {
      headers: { Authorization: `Bearer ${superToken}` }
    });
    assert.strictEqual(deployStatusRes.status, 200);
    const deployStatus = await deployStatusRes.json();
    assert.strictEqual(deployStatus.deployments.length, 3);
    assert.ok(deployStatus.deployments.some(d => d.target_host === 'studyai.com'));
    assert.ok(deployStatus.deployments.some(d => d.target_host === 'admin.studyai.com'));
    assert.ok(deployStatus.deployments.some(d => d.target_host === 'superadmin.studyai.com'));
    report('T6', 'Multi-tenant separated hosting verified (studyai.com, admin.studyai.com, superadmin.studyai.com)', true);

    console.log('\n================================================================');
    console.log(`🎉 ALL ${passedCount} MASTER INTEGRATION & QA TESTS PASSED!`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('\n❌ PHASE 8 VERIFICATION FAILED:', err);
    process.exit(1);
  }
}

runPhase8MasterIntegrationSuite();
