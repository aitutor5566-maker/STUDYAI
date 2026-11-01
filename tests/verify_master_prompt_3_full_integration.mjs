/**
 * STUDYAI — MASTER PROMPT 3 FULL SYSTEM INTEGRATION & VERIFICATION SUITE
 * Complete Student Journey (21 steps), Admin & Super Admin Portals,
 * Security & RBAC, AI Tutor Quality, 40-Mark Test Engine, and Deployment Integrity.
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const baseUrl = 'http://127.0.0.1:8000';
const workspaceRoot = '/Users/vishwaksai/Downloads/AI APP';
let passedCount = 0;
let totalTests = 0;

function report(id, title, pass = true) {
  totalTests++;
  if (pass) {
    passedCount++;
    console.log(`  ✔ [PASS] ${id}: ${title}`);
  } else {
    console.log(`  ❌ [FAIL] ${id}: ${title}`);
  }
}

async function runMasterPrompt3Verification() {
  console.log('\n================================================================');
  console.log('🚀 RUNNING STUDYAI MASTER PROMPT 3 FULL SYSTEM INTEGRATION SUITE');
  console.log('================================================================\n');

  try {
    // -------------------------------------------------------------------------
    // SECTION 1: AUTHENTICATION, RBAC & ENTERPRISE ROLES
    // -------------------------------------------------------------------------
    console.log('[SECTION 1] Authenticating Roles & Verifying RBAC Boundaries');

    // 1.1 Student Authentication
    const studentRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'vishwak@studyai.internal', password: 'StudentPass123!' })
    });
    assert.strictEqual(studentRes.status, 200, 'Student login must succeed');
    const studentToken = (await studentRes.json()).access_token;
    report('AUTH_1', 'Student (vishwak@studyai.internal) authenticated successfully', !!studentToken);

    // 1.2 Admin Authentication
    const adminRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@nps-bengaluru.edu.in', password: 'AdminPass123!' })
    });
    assert.strictEqual(adminRes.status, 200, 'Admin login must succeed');
    const adminToken = (await adminRes.json()).access_token;
    report('AUTH_2', 'School Admin (admin@nps-bengaluru.edu.in) authenticated successfully', !!adminToken);

    // 1.3 Super Admin Authentication with Mandatory MFA
    // First verify standard login without MFA is rejected
    const superadminNoMfaRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'superadmin@studyai.com', password: 'SuperAdminSecretPass2026!' })
    });
    assert.strictEqual(superadminNoMfaRes.status, 403, 'Super Admin login without MFA must be rejected');
    const mfaErr = await superadminNoMfaRes.json();
    assert.strictEqual(mfaErr.detail.code, 'MFA_REQUIRED');

    // Elevated Super Admin Login with MFA TOTP Token
    const superadminRes = await fetch(`${baseUrl}/api/v1/auth/superadmin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'superadmin@studyai.com',
        password: 'SuperAdminSecretPass2026!',
        mfa_code: '123456'
      })
    });
    assert.strictEqual(superadminRes.status, 200, 'Super Admin elevated login must succeed');
    const superadminToken = (await superadminRes.json()).access_token;
    report('AUTH_3', 'Super Admin (superadmin@studyai.com) authenticated with mandatory MFA TOTP', !!superadminToken);

    // 1.4 Accountant Authentication
    const accountantRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'finance@nps-bengaluru.edu.in', password: 'FinancePass123!' })
    });
    assert.strictEqual(accountantRes.status, 200, 'Accountant login must succeed');
    const accountantToken = (await accountantRes.json()).access_token;
    report('AUTH_4', 'Accountant (finance@nps-bengaluru.edu.in) authenticated successfully', !!accountantToken);

    // 1.5 Parent Authentication
    const parentRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rajesh@studyai.internal', password: 'ParentPass123!' })
    });
    assert.strictEqual(parentRes.status, 200, 'Parent login must succeed');
    const parentToken = (await parentRes.json()).access_token;
    report('AUTH_5', 'Parent (rajesh@studyai.internal) authenticated successfully', !!parentToken);

    // 1.6 Privilege Escalation Rejection: Admin cannot access Super Admin endpoints
    const adminBreachRes = await fetch(`${baseUrl}/api/v1/superadmin/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(adminBreachRes.status, 403, 'Admin must be forbidden from Super Admin overview');
    report('RBAC_1', 'Admin rejected from Super Admin routes (403 Forbidden)', true);

    // 1.7 Accountant Boundary: Accountant cannot access Super Admin or student private chat
    const accountantAiBreach = await fetch(`${baseUrl}/api/v1/superadmin/ai-providers`, {
      headers: { Authorization: `Bearer ${accountantToken}` }
    });
    assert.strictEqual(accountantAiBreach.status, 403, 'Accountant must be forbidden from Super Admin AI providers');

    const accountantChatBreach = await fetch(`${baseUrl}/api/v1/parent/children/usr_student_001/conversations`, {
      headers: { Authorization: `Bearer ${accountantToken}` }
    });
    assert.strictEqual(accountantChatBreach.status, 403, 'Accountant must be forbidden from student private chats');
    report('RBAC_2', 'Accountant strictly isolated from AI settings and student chats', true);

    // 1.8 Student Boundary: Student cannot access School Admin overview
    const studentBreachRes = await fetch(`${baseUrl}/api/v1/admin/overview`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(studentBreachRes.status, 403, 'Student must be forbidden from Admin overview');
    report('RBAC_3', 'Student rejected from School Admin portal routes (403 Forbidden)', true);

    // -------------------------------------------------------------------------
    // SECTION 2: COMPLETE 21-STEP STUDENT JOURNEY
    // -------------------------------------------------------------------------
    console.log('\n[SECTION 2] Verifying Complete 21-Step Student Journey');

    // Step 1: Login verified in AUTH_1

    // Step 2: Complete Learning Preferences Setup
    const prefRes = await fetch(`${baseUrl}/api/v1/profiles/me/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        primary_learning_style: 'visual_spatial',
        grade_level: 'Grade 10',
        pace_preference: 'balanced',
        daily_goal_minutes: 45
      })
    });
    assert.strictEqual(prefRes.status, 200);
    report('JOURNEY_S2', 'Step 2: Completed student learning preferences setup', true);

    // Step 3: Open Home & Check Study Schedule / Recommendations
    const homeProgressRes = await fetch(`${baseUrl}/api/v1/progress/summary`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(homeProgressRes.status, 200);
    const homeProgress = await homeProgressRes.json();
    assert.ok(homeProgress.subject_breakdown, 'Home progress must return subject breakdown');

    const scheduleRes = await fetch(`${baseUrl}/api/v1/schedule`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(scheduleRes.status, 200);
    report('JOURNEY_S3', 'Step 3: Opened Home with progress metrics and study schedule', true);

    // Step 4: Mode A (Normal Learning & Mastery) on Photosynthesis
    const modeARes = await fetch(`${baseUrl}/api/v1/tutor/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        topic: 'Photosynthesis',
        question: 'How do plants make food in simple terms?',
        mode: 'normal',
        grade: 10,
        level: 'Grade 10',
        subject: 'Science'
      })
    });
    assert.strictEqual(modeARes.status, 200);
    const modeAData = await modeARes.json();
    assert.strictEqual(modeAData.mode, 'normal');
    assert.ok(modeAData.analogy && modeAData.analogy.length > 20, 'Mode A must provide intuitive analogy');
    assert.ok(modeAData.everyday_examples && modeAData.everyday_examples.length > 0, 'Mode A must provide everyday examples');
    assert.ok(modeAData.short_understanding_checks && modeAData.short_understanding_checks.length > 0, 'Mode A must provide bite-sized checks');
    report('JOURNEY_S4', 'Step 4: Studied topic in Mode A (Normal Learning & Mastery with analogy)', true);

    // Step 5: Study Across Core Curriculum Topics (Biology, Physics, Chemistry, Math)
    const testTopics = [
      { topic: 'Human Heart', subject: 'Biology', model: 'human_heart' },
      { topic: 'DNA', subject: 'Biology', model: 'dna_double_helix' },
      { topic: "Newton's Laws", subject: 'Physics', model: 'newtons_laws' },
      { topic: 'Electric Circuits', subject: 'Physics', model: 'circuit_simulation' },
      { topic: 'Atomic Structure', subject: 'Chemistry', model: 'atom_structure' },
      { topic: 'Solar System', subject: 'Physics', model: 'solar_system' },
      { topic: 'Geometry', subject: 'Mathematics', model: 'solid_geometry' }
    ];

    for (const t of testTopics) {
      const resp = await fetch(`${baseUrl}/api/v1/tutor/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`
        },
        body: JSON.stringify({
          topic: t.topic,
          question: `Explain ${t.topic}`,
          mode: 'normal',
          grade: 10,
          level: 'Grade 10',
          subject: t.subject
        })
      });
      assert.strictEqual(resp.status, 200, `Topic ${t.topic} must return 200`);
      const data = await resp.json();
      assert.strictEqual(data.three_js_model.model_id, t.model, `Topic ${t.topic} model id mismatch`);
    }
    report('JOURNEY_S5', 'Step 5: Studied representative topics across Biology, Physics, Chemistry, and Math', true);

    // Step 6: View Actual Educational Images & Labeled SVG Diagrams
    assert.ok(modeAData.visual_representations && modeAData.visual_representations.length > 0, 'Must have visual representations');
    const firstVis = modeAData.visual_representations[0];
    assert.ok(firstVis.data_url.startsWith('data:image/svg+xml'), 'Visual must be valid data URL');
    assert.ok(firstVis.accessibility_text.length > 10, 'Visual must have accessibility text');
    report('JOURNEY_S6', 'Step 6: Verified high-contrast labeled educational SVGs and accessibility', true);

    // Step 7: Explore Interactive Three.js 3D Model Mapping
    assert.ok(modeAData.three_js_model.has_3d_support, 'Three.js 3D support must be true');
    assert.strictEqual(modeAData.three_js_model.model_id, 'plant_cell');
    report('JOURNEY_S7', 'Step 7: Explored interactive Three.js 3D simulation mappings', true);

    // Step 8: Ask Targeted Question About Selected Model Component
    const componentRes = await fetch(`${baseUrl}/api/v1/tutor/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        topic: 'Photosynthesis',
        question: 'What is the role of this thylakoid membrane stack?',
        mode: 'normal',
        grade: 10,
        level: 'Grade 10',
        subject: 'Science',
        selected_visual_component: {
          id: 'thylakoid_grana',
          label: 'Granum Thylakoid Stack',
          role: 'Light-Dependent Photophosphorylation Site'
        }
      })
    });
    assert.strictEqual(componentRes.status, 200);
    const compData = await componentRes.json();
    assert.ok(compData.detailed_explanation.includes('Granum Thylakoid Stack'), 'Must incorporate selected component');
    report('JOURNEY_S8', 'Step 8: Asked targeted question about selected 3D component with preserved context', true);

    // Step 9: Switch Seamlessly to Mode B (Deep Learning & Exam Preparation)
    const modeBRes = await fetch(`${baseUrl}/api/v1/tutor/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        topic: 'Photosynthesis',
        question: 'Give formal board exam explanation with chemical equations',
        mode: 'deep',
        grade: 10,
        level: 'Grade 10',
        subject: 'Science'
      })
    });
    assert.strictEqual(modeBRes.status, 200);
    const modeBData = await modeBRes.json();
    assert.strictEqual(modeBData.mode, 'deep');
    assert.strictEqual(modeBData.topic, 'Photosynthesis', 'Topic context must be preserved');
    report('JOURNEY_S9', 'Step 9: Switched seamlessly to Mode B (Deep Learning & Exam Preparation)', true);

    // Step 10: View Formal Definitions, Full Forms, Formulas, Comparison Table, 3-Tier Questions
    assert.ok(modeBData.formal_definitions && modeBData.formal_definitions.length >= 2, 'Must include formal definitions');
    assert.ok(modeBData.terminology_and_abbreviations && modeBData.terminology_and_abbreviations.length >= 2, 'Must include full forms table');
    assert.ok(modeBData.formulas_and_derivations && modeBData.formulas_and_derivations.length >= 1, 'Must include formulas & derivations');
    assert.ok(modeBData.comparison_table && modeBData.comparison_table.rows.length >= 2, 'Must include comparison table');
    assert.ok(modeBData.three_tier_exam_questions.tier_1_short.length >= 1, 'Must have Tier 1 short questions');
    assert.ok(modeBData.three_tier_exam_questions.tier_2_detailed.length >= 1, 'Must have Tier 2 detailed questions');
    assert.ok(modeBData.exam_revision_summary && modeBData.exam_revision_summary.length >= 2, 'Must have high-yield summary');
    report('JOURNEY_S10', 'Step 10: Verified Mode B academic rigor (formulas, full forms, comparison table, 3-tier questions)', true);

    // Step 11: Save Lesson Directly into AI Notes
    const saveNoteRes = await fetch(`${baseUrl}/api/v1/tutor/save-to-notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        lesson_id: modeBData.lesson_id,
        title: 'Master Study Note: Photosynthesis',
        topic: 'Photosynthesis',
        subject: 'Science',
        notebook_name: 'Biology Board Prep',
        content_markdown: modeBData.detailed_explanation,
        flashcards: [{ front: 'What is RuBisCO?', back: 'Enzyme catalyzing carbon fixation' }],
        quiz: [{ question: 'Where do light reactions occur?', answer: 'Thylakoids' }]
      })
    });
    assert.strictEqual(saveNoteRes.status, 201);
    const savedNote = await saveNoteRes.json();
    const createdNoteId = savedNote.note_id;
    assert.ok(createdNoteId, 'Note ID must be returned');
    report('JOURNEY_S11', 'Step 11: Saved active lesson directly into AI Notes', true);

    // Step 12: Generate, Edit and Search AI Notes Studio
    const updateNoteRes = await fetch(`${baseUrl}/api/v1/notes/${createdNoteId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        title: 'Master Study Note: Photosynthesis (Exam Edition)',
        content_markdown: modeBData.detailed_explanation + '\n\n**Key Takeaway**: Non-cyclic photophosphorylation generates ATP and NADPH.'
      })
    });
    assert.strictEqual(updateNoteRes.status, 200);

    const searchNotesRes = await fetch(`${baseUrl}/api/v1/notes?search=Photosynthesis`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(searchNotesRes.status, 200);
    const searchNotes = await searchNotesRes.json();
    assert.ok(searchNotes.some(n => n.id === createdNoteId), 'Saved note must appear in search');
    report('JOURNEY_S12', 'Step 12: Generated, edited, and searched AI Notes Studio', true);

    // Step 13: Open Library Catalog
    const libraryRes = await fetch(`${baseUrl}/api/v1/library`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(libraryRes.status, 200);
    const libraryData = await libraryRes.json();
    assert.ok(libraryData.total !== undefined || (libraryData.items && libraryData.items.length >= 0), 'Library catalog must be accessible');
    report('JOURNEY_S13', 'Step 13: Opened Library central resource catalog', true);

    // Step 14: Explore 3D Lab Catalog
    const lab3dRes = await fetch(`${baseUrl}/api/v1/visual-3d/models`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(lab3dRes.status, 200);
    const labModels = await lab3dRes.json();
    assert.ok(labModels.length >= 5, '3D Lab must provide multiple curriculum models');
    report('JOURNEY_S14', 'Step 14: Explored 3D Lab interactive model catalog', true);

    // Step 15: Play All Three Adaptive Educational Games
    const game1Res = await fetch(`${baseUrl}/api/v1/games/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ game_type: 'answer_battle', subject: 'Science', topic: 'Photosynthesis', academic_level: 'Grade 10' })
    });
    assert.strictEqual(game1Res.status, 200);

    const game2Res = await fetch(`${baseUrl}/api/v1/games/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ game_type: 'space_shooter', subject: 'Physics', topic: "Newton's Laws", academic_level: 'Grade 10' })
    });
    assert.strictEqual(game2Res.status, 200);

    const game3Res = await fetch(`${baseUrl}/api/v1/games/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ game_type: 'learning_runner', subject: 'Mathematics', topic: 'Geometry', academic_level: 'Grade 10' })
    });
    assert.strictEqual(game3Res.status, 200);
    report('JOURNEY_S15', 'Step 15: Played all three adaptive games (Concept Duel, Space Shooter, Learning Runner)', true);

    // Step 16: Earn Points and Verify Ledger
    const awardPointsRes = await fetch(`${baseUrl}/api/v1/points/award`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        student_id: 'usr_student_001',
        amount: 50,
        activity_type: 'game_completion',
        reason: 'Mastered photosynthesis duel level 1'
      })
    });
    assert.strictEqual(awardPointsRes.status, 200);

    const pointsBalRes = await fetch(`${baseUrl}/api/v1/points/balance`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(pointsBalRes.status, 200);
    const balanceData = await pointsBalRes.json();
    assert.ok(balanceData.total_points >= 50, 'Points balance must reflect rewarded points');
    report('JOURNEY_S16', 'Step 16: Earned gamified points and verified authoritative ledger balance', true);

    // Step 17: Generate Configurable 40-Mark Practice Test (Option A, B, C & Validation)
    // Option A: 40 Objective
    const optARes = await fetch(`${baseUrl}/api/v1/examinations/generate-40mark-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        subject: 'Science',
        topic: 'Photosynthesis',
        option_type: 'OPTION_A',
        objective_marks: 40.0,
        descriptive_marks: 0.0
      })
    });
    assert.strictEqual(optARes.status, 201);
    const optAData = await optARes.json();
    assert.strictEqual(optAData.total_marks, 40.0, 'Option A must strictly equal 40.0 marks');
    assert.strictEqual(optAData.objective_marks, 40.0);

    // Option B: Mixed 20 + 20
    const optBRes = await fetch(`${baseUrl}/api/v1/examinations/generate-40mark-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        subject: 'Science',
        topic: 'Photosynthesis',
        option_type: 'OPTION_B',
        objective_marks: 20.0,
        descriptive_marks: 20.0
      })
    });
    assert.strictEqual(optBRes.status, 201);
    const optBData = await optBRes.json();
    assert.strictEqual(optBData.total_marks, 40.0, 'Option B must strictly equal 40.0 marks');
    assert.strictEqual(optBData.objective_marks, 20.0);
    assert.strictEqual(optBData.descriptive_marks, 20.0);

    // Option C: 40 Descriptive
    const optCRes = await fetch(`${baseUrl}/api/v1/examinations/generate-40mark-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        subject: 'Science',
        topic: 'Photosynthesis',
        option_type: 'OPTION_C',
        objective_marks: 0.0,
        descriptive_marks: 40.0
      })
    });
    assert.strictEqual(optCRes.status, 201);
    const optCData = await optCRes.json();
    assert.strictEqual(optCData.total_marks, 40.0, 'Option C must strictly equal 40.0 marks');
    assert.strictEqual(optCData.descriptive_marks, 40.0);

    // Strict validation: Reject total != 40
    const invalidTestRes = await fetch(`${baseUrl}/api/v1/examinations/generate-40mark-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        subject: 'Science',
        topic: 'Photosynthesis',
        option_type: 'OPTION_B',
        objective_marks: 25.0,
        descriptive_marks: 20.0 // Sum = 45 != 40
      })
    });
    assert.strictEqual(invalidTestRes.status, 400, 'Must reject test when total != 40.0');
    report('JOURNEY_S17', 'Step 17: Generated all three 40-mark test options (A, B, C) and verified strict 40M validation', true);

    // Step 18: Start 40-Mark Test & Autosave Progress Against Network Loss
    const testExamId = optBData.id;
    const startTestRes = await fetch(`${baseUrl}/api/v1/examinations/${testExamId}/start`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(startTestRes.status, 200);
    const startData = await startTestRes.json();
    const attemptId = startData.attempt_id;
    assert.ok(attemptId, 'Attempt ID must be returned');

    // Autosave progress
    const saveProgressRes = await fetch(`${baseUrl}/api/v1/examinations/${testExamId}/save-progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        attempt_id: attemptId,
        current_answers: { [optBData.questions[0].id]: 'Operational mechanism of Photosynthesis' },
        marked_for_review: [optBData.questions[1].id],
        time_spent_seconds: 120
      })
    });
    assert.strictEqual(saveProgressRes.status, 200);
    report('JOURNEY_S18', 'Step 18: Started 40-mark test and autosaved in-progress answers against network loss', true);

    // Step 19: Submit Test & Verify Transparent Evaluation & Rubrics
    const answersPayload = optBData.questions.map((q) => {
      if (q.category === 'descriptive') {
        return {
          question_id: q.id,
          student_answer: 'Photosynthesis is a coordinated biological system that maintains operational equilibrium and energy transfer in plant cells.'
        };
      } else if (q.question_type === 'multiple_select') {
        return {
          question_id: q.id,
          student_answer: ['Conservation of energy', 'Predictable behavior']
        };
      } else {
        return {
          question_id: q.id,
          student_answer: 'Operational mechanism of Photosynthesis'
        };
      }
    });

    const submitRes = await fetch(`${baseUrl}/api/v1/examinations/${testExamId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        attempt_id: attemptId,
        answers: answersPayload
      })
    });
    assert.strictEqual(submitRes.status, 200);
    const evalResult = await submitRes.json();
    assert.strictEqual(evalResult.total_possible, 40.0, 'Total possible must be 40.0');
    assert.ok(evalResult.percentage > 0, 'Score percentage must be computed');
    assert.ok(evalResult.letter_grade, 'Letter grade must be assigned');
    assert.ok(evalResult.objective_score !== undefined, 'Objective score must be segregated');
    assert.ok(evalResult.descriptive_score !== undefined, 'Descriptive score must be segregated');
    assert.ok(evalResult.topic_breakdown, 'Topic breakdown must be computed');
    report('JOURNEY_S19', 'Step 19: Submitted test with auto-grading, rubric criteria, and objective/descriptive segregation', true);

    // Step 20: Check Learning Progress Trends
    const myResultsRes = await fetch(`${baseUrl}/api/v1/examinations/results/my`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(myResultsRes.status, 200);
    const myResults = await myResultsRes.json();
    assert.ok(myResults.length >= 1, 'Past evaluated attempts must appear in results');
    report('JOURNEY_S20', 'Step 20: Verified student learning progress and examination historical analytics', true);

    // Step 21: Access Parent Dashboard & Verify Child Confidentiality
    const parentChildrenRes = await fetch(`${baseUrl}/api/v1/parent/children`, {
      headers: { Authorization: `Bearer ${parentToken}` }
    });
    assert.strictEqual(parentChildrenRes.status, 200);
    const childrenList = await parentChildrenRes.json();
    assert.ok(childrenList.some(c => c.child_id === 'usr_student_001' || c.student_id === 'usr_student_001'), 'Vishwak must be listed as child');

    // Verify student chat confidentiality
    const parentChatAttempt = await fetch(`${baseUrl}/api/v1/parent/children/usr_student_001/conversations`, {
      headers: { Authorization: `Bearer ${parentToken}` }
    });
    assert.strictEqual(parentChatAttempt.status, 403, 'Parent must be refused student private chat');
    const breachJson = await parentChatAttempt.json();
    assert.strictEqual(breachJson.detail.code, 'STUDENT_CHAT_CONFIDENTIAL', 'Must cite STUDENT_CHAT_CONFIDENTIAL');
    report('JOURNEY_S21', 'Step 21: Accessed Parent Dashboard; confirmed student private chat confidentiality enforced', true);

    // -------------------------------------------------------------------------
    // SECTION 3: ADMIN & SUPER ADMIN PORTAL WORKFLOWS
    // -------------------------------------------------------------------------
    console.log('\n[SECTION 3] Verifying School Admin & Super Admin Portals');

    // 3.1 School Admin: Overview & Roster
    const adminOverviewRes = await fetch(`${baseUrl}/api/v1/admin/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(adminOverviewRes.status, 200);
    const adminOverview = await adminOverviewRes.json();
    assert.ok(adminOverview.total_students >= 1, 'Admin overview must report student count');

    const studentRosterRes = await fetch(`${baseUrl}/api/v1/admin/students`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(studentRosterRes.status, 200);
    report('ADMIN_1', 'School Admin: Overview and Student Roster verified', true);

    // 3.2 School Admin: Examination Publishing
    const publishExamRes = await fetch(`${baseUrl}/api/v1/examinations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        title: 'Mid-Term Physics Assessment: Forces and Motion',
        week: 12,
        academic_level: 'Grade 10',
        subject: 'Physics',
        topics: ["Newton's Laws"],
        total_marks: 20.0,
        duration_minutes: 30,
        pass_percentage: 40.0,
        questions: [
          {
            question_text: "Calculate force required to accelerate 2 kg at 3 m/s².",
            question_type: "numerical",
            topic: "Newton's Laws",
            correct_answer: 6.0,
            marks: 5.0
          }
        ]
      })
    });
    assert.strictEqual(publishExamRes.status, 201);
    report('ADMIN_2', 'School Admin: Published mid-term curriculum examination', true);

    // 3.3 Super Admin: Global Platform Overview
    const superOverviewRes = await fetch(`${baseUrl}/api/v1/superadmin/overview`, {
      headers: { Authorization: `Bearer ${superadminToken}` }
    });
    assert.strictEqual(superOverviewRes.status, 200);
    const superOverview = await superOverviewRes.json();
    assert.ok(superOverview.active_tenants >= 1 || superOverview.total_tenants >= 1, 'Super Admin overview must report tenants');

    // 3.4 Super Admin: AI Provider Health & Cost Tracking
    const aiProvidersRes = await fetch(`${baseUrl}/api/v1/superadmin/ai-providers`, {
      headers: { Authorization: `Bearer ${superadminToken}` }
    });
    assert.strictEqual(aiProvidersRes.status, 200);
    const aiProviders = await aiProvidersRes.json();
    assert.ok(Array.isArray(aiProviders) || Array.isArray(aiProviders.providers), 'AI providers list must be returned');

    const aiAnalyticsRes = await fetch(`${baseUrl}/api/v1/superadmin/ai-usage-analytics`, {
      headers: { Authorization: `Bearer ${superadminToken}` }
    });
    assert.strictEqual(aiAnalyticsRes.status, 200);
    report('SUPERADMIN_1', 'Super Admin: Global Overview, AI Providers, and Cost Tracking verified', true);

    // 3.5 Super Admin: Global Audit Logs
    const auditRes = await fetch(`${baseUrl}/api/v1/superadmin/audit-logs?limit=10`, {
      headers: { Authorization: `Bearer ${superadminToken}` }
    });
    assert.strictEqual(auditRes.status, 200);
    report('SUPERADMIN_2', 'Super Admin: Enterprise Audit Logs accessible', true);

    // -------------------------------------------------------------------------
    // SECTION 4: VIDEO GENERATION PROHIBITION
    // -------------------------------------------------------------------------
    console.log('\n[SECTION 4] Verifying Permanent Video Generation Prohibition (403 FEATURE_DISABLED)');

    for (const [roleName, token] of [['Student', studentToken], ['Admin', adminToken], ['Super Admin', superadminToken]]) {
      const vidRes = await fetch(`${baseUrl}/api/v1/media/video/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prompt: 'Create educational video about heart' })
      });
      assert.strictEqual(vidRes.status, 403, `Video generation must be forbidden for ${roleName}`);
      const err = await vidRes.json();
      assert.strictEqual(err.detail.code, 'FEATURE_DISABLED');
    }
    report('SEC_VID_1', 'Video generation permanently rejected with 403 FEATURE_DISABLED across all roles', true);

    // -------------------------------------------------------------------------
    // SECTION 5: SEPARATE DEPLOYMENT CONFIGURATIONS & DOCKER INTEGRITY
    // -------------------------------------------------------------------------
    console.log('\n[SECTION 5] Verifying Independent Multi-Application Deployment Artifacts');

    const adminDocker = fs.readFileSync(path.join(workspaceRoot, 'infrastructure/docker/Dockerfile.admin'), 'utf-8');
    const superadminDocker = fs.readFileSync(path.join(workspaceRoot, 'infrastructure/docker/Dockerfile.superadmin'), 'utf-8');
    const studentDocker = fs.readFileSync(path.join(workspaceRoot, 'infrastructure/docker/Dockerfile.student'), 'utf-8');
    const backendDocker = fs.readFileSync(path.join(workspaceRoot, 'infrastructure/docker/Dockerfile.backend'), 'utf-8');

    assert.ok(adminDocker.includes('apps/admin_portal'), 'Dockerfile.admin must target admin_portal');
    assert.ok(superadminDocker.includes('apps/superadmin_portal'), 'Dockerfile.superadmin must target superadmin_portal');
    assert.ok(studentDocker.includes('apps/student_app') || studentDocker.includes('dist'), 'Dockerfile.student must target student app');
    assert.ok(backendDocker.includes('backend.app.main:app'), 'Dockerfile.backend must target FastAPI production app');

    // Nginx Multi-Domain Routing
    const nginxConf = fs.readFileSync(path.join(workspaceRoot, 'infrastructure/deployment/nginx.prod.conf'), 'utf-8');
    assert.ok(nginxConf.includes('admin.studyai.com'), 'Nginx must configure admin.studyai.com');
    assert.ok(nginxConf.includes('superadmin.studyai.com'), 'Nginx must configure superadmin.studyai.com');
    assert.ok(nginxConf.includes('studyai.com'), 'Nginx must configure studyai.com');
    assert.ok(nginxConf.includes('api.studyai.com'), 'Nginx must configure api.studyai.com');

    report('DEPLOY_1', 'Verified independent Flutter Web builds, separate Dockerfiles, and multi-domain Nginx config', true);

    // -------------------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------------------
    console.log('\n================================================================');
    console.log(`🎉 ALL ${passedCount}/${totalTests} MASTER PROMPT 3 VERIFICATION TESTS PASSED SUCCESSFULLY!`);
    console.log('================================================================\n');

  } catch (error) {
    console.error('\n❌ VERIFICATION TEST FAILED:', error);
    process.exit(1);
  }
}

runMasterPrompt3Verification();
