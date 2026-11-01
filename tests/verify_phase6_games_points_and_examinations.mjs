/**
 * STUDYAI — PHASE 6 VERIFICATION SUITE
 * Adaptive Educational Games, Points & Rewards, and Weekly Examinations
 */

import assert from 'node:assert';

const baseUrl = 'http://127.0.0.1:8000';
let passedCount = 0;

function report(id, title, pass = true) {
  if (pass) {
    passedCount++;
    console.log(`  ✔ [PASS] ${id}: ${title}`);
  } else {
    console.log(`  ❌ [FAIL] ${id}: ${title}`);
  }
}

async function runPhase6Verification() {
  console.log('\n================================================================');
  console.log('🎮 RUNNING STUDYAI PHASE 6 GAMES, POINTS & WEEKLY EXAMS SUITE');
  console.log('================================================================\n');

  try {
    // -------------------------------------------------------------------------
    // TEST 1: User Authentication (Student & Admin)
    // -------------------------------------------------------------------------
    console.log('[TEST 1] Authenticating Test Users');
    const studentRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'vishwak@studyai.internal', password: 'StudentPass123!' })
    });
    assert.strictEqual(studentRes.status, 200);
    const studentData = await studentRes.json();
    const studentToken = studentData.access_token;

    const bobRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bob@studyai.internal', password: 'StudentPass123!' })
    });
    assert.strictEqual(bobRes.status, 200);
    const bobToken = (await bobRes.json()).access_token;

    const adminRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@nps-bengaluru.edu.in', password: 'AdminPass123!' })
    });
    assert.strictEqual(adminRes.status, 200);
    const adminToken = (await adminRes.json()).access_token;
    report('T1', 'Authenticated student and administrative users successfully', true);

    // -------------------------------------------------------------------------
    // TEST 2: Three Adaptive Educational Games Catalog & Mechanics
    // -------------------------------------------------------------------------
    console.log('\n[TEST 2] Verifying Three Adaptive Educational Games');
    const catalogRes = await fetch(`${baseUrl}/api/v1/games/catalog`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(catalogRes.status, 200);
    const games = await catalogRes.json();
    assert.strictEqual(games.length, 3);

    const g1 = games.find(g => g.id === 'answer_battle');
    assert.ok(g1);
    assert.strictEqual(g1.genre, 'fighting_progression');
    assert.ok(g1.mechanics.streak_multiplier);

    const g2 = games.find(g => g.id === 'space_shooter');
    assert.ok(g2);
    assert.strictEqual(g2.genre, 'shooting_arcade');
    assert.ok(g2.mechanics.targeting === 'correct_answer_nodes');

    const g3 = games.find(g => g.id === 'learning_runner');
    assert.ok(g3);
    assert.strictEqual(g3.genre, 'adaptive_preference_runner');
    assert.ok(g3.mechanics.preference_modes.includes('logic_matching'));
    report('T2', 'Three distinct adaptive games cataloged with age-appropriate non-graphic mechanics', true);

    // -------------------------------------------------------------------------
    // TEST 3: Adaptive Question Generation with Hints & Misconception Warnings
    // -------------------------------------------------------------------------
    console.log('\n[TEST 3] Verifying Adaptive Game Question Generation');
    const qRes = await fetch(`${baseUrl}/api/v1/games/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        game_type: 'answer_battle',
        subject: 'Science',
        topic: 'Photosynthesis',
        difficulty: 'adaptive',
        count: 5,
        preference: 'visual_diagrams'
      })
    });
    assert.strictEqual(qRes.status, 200);
    const qData = await qRes.json();
    assert.strictEqual(qData.questions.length, 5);
    for (const q of qData.questions) {
      assert.strictEqual(q.options.length, 4);
      assert.ok(q.hint.length > 5);
      assert.ok(q.explanation.length > 10);
      assert.ok(q.misconception_warning.length > 10);
      assert.ok(['Apprentice', 'Veteran', 'Master'].includes(q.adaptive_tier));
    }
    report('T3', 'Adaptive game questions generated with hints, explanations, and misconception alerts', true);

    // -------------------------------------------------------------------------
    // TEST 4: Game Session Persistence & Authoritative Points Calculation
    // -------------------------------------------------------------------------
    console.log('\n[TEST 4] Verifying Authoritative Game Session Scoring');
    const sessionRes = await fetch(`${baseUrl}/api/v1/games/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        game_type: 'answer_battle',
        subject: 'Science',
        topic: 'Photosynthesis',
        score: 1500,
        accuracy: 100,
        correct_count: 5,
        total_questions: 5,
        stage_reached: 3,
        duration_seconds: 75,
        mistakes: []
      })
    });
    assert.strictEqual(sessionRes.status, 201);
    const sessionData = await sessionRes.json();
    assert.ok(sessionData.session_id.startsWith('gs_'));
    assert.ok(sessionData.points_earned >= 80); // Base 50 + accuracy bonus 25 + stage bonus 15
    assert.ok(sessionData.level >= 1);
    assert.ok(sessionData.unlocked_achievements.includes('Concept Duel Master'));
    report('T4', `Game session verified: ${sessionData.points_earned} points awarded with level advancement`, true);

    // -------------------------------------------------------------------------
    // TEST 5: Points Balance, Segregation from Academic Marks & Ledger
    // -------------------------------------------------------------------------
    console.log('\n[TEST 5] Verifying Points Balance & Ledger Separation');
    const balRes = await fetch(`${baseUrl}/api/v1/points/balance`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(balRes.status, 200);
    const balance = await balRes.json();
    assert.ok(balance.total_points > 0);
    assert.ok(balance.academic_marks_notice.includes('strictly segregated'));
    report('T5a', 'Authoritative points balance retrieved; academic marks strictly segregated', true);

    const txRes = await fetch(`${baseUrl}/api/v1/points/transactions`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(txRes.status, 200);
    const txs = await txRes.json();
    assert.ok(txs.length >= 2);
    assert.ok(txs[0].reason.length > 5);
    report('T5b', `Points transaction history verified with ${txs.length} ledger entries`, true);

    // -------------------------------------------------------------------------
    // TEST 6: Event Claim Deduplication & Anti-Farming Defense
    // -------------------------------------------------------------------------
    console.log('\n[TEST 6] Verifying Reward Claim Deduplication & Anti-Farming');
    const refId = `les_heart_${Date.now()}`;
    const firstClaimRes = await fetch(`${baseUrl}/api/v1/points/claim-reward`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        event_type: 'complete_lesson',
        reference_id: refId
      })
    });
    assert.strictEqual(firstClaimRes.status, 201);
    const firstClaim = await firstClaimRes.json();
    assert.strictEqual(firstClaim.points_awarded, 50);
    report('T6a', 'Authoritative reward claimed for completing lesson (+50 points)', true);

    // Attempt Duplicate Claim
    const dupClaimRes = await fetch(`${baseUrl}/api/v1/points/claim-reward`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        event_type: 'complete_lesson',
        reference_id: refId
      })
    });
    assert.strictEqual(dupClaimRes.status, 409);
    const dupErr = await dupClaimRes.json();
    assert.strictEqual(dupErr.detail.code, 'DUPLICATE_REWARD_CLAIM');
    report('T6b', 'Duplicate reward claim blocked with 409 Conflict (Anti-Farming)', true);

    // -------------------------------------------------------------------------
    // TEST 7: Leaderboard & Streak Check-in
    // -------------------------------------------------------------------------
    console.log('\n[TEST 7] Verifying Leaderboard & Streak Continuity');
    const streakRes = await fetch(`${baseUrl}/api/v1/points/streak/check-in`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(streakRes.status, 200);
    const streakData = await streakRes.json();
    assert.ok(streakData.current_streak_days >= 15);
    report('T7a', `Daily learning streak check-in recorded (${streakData.current_streak_days} days)`, true);

    const leaderRes = await fetch(`${baseUrl}/api/v1/points/leaderboard`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(leaderRes.status, 200);
    const leaders = await leaderRes.json();
    assert.ok(leaders.length >= 2);
    assert.strictEqual(leaders[0].rank, 1);
    report('T7b', `Weekly points leaderboard verified with ${leaders.length} ranked scholars`, true);

    // -------------------------------------------------------------------------
    // TEST 8: AI Question Generation for Admin Examination Drafting
    // -------------------------------------------------------------------------
    console.log('\n[TEST 8] Verifying AI Question Generation for Examination Drafting');
    const aiQRes = await fetch(`${baseUrl}/api/v1/examinations/generate-questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        subject: 'Science',
        topic: 'Photosynthesis and Cellular Respiration',
        grade: 10,
        question_count: 5
      })
    });
    assert.strictEqual(aiQRes.status, 200);
    const aiQData = await aiQRes.json();
    assert.strictEqual(aiQData.status, 'draft_generated');
    assert.strictEqual(aiQData.human_review_required, true);
    assert.strictEqual(aiQData.generated_questions.length, 5);
    report('T8', 'AI exam question generator drafted 5 questions with mandatory human review flag', true);

    // -------------------------------------------------------------------------
    // TEST 9: Admin Examination Publishing (Configuring All Settings)
    // -------------------------------------------------------------------------
    console.log('\n[TEST 9] Verifying Admin Examination Publishing with Multi-Type Questions');
    const examQuestions = [
      {
        id: 'q_ex_1',
        question_text: 'What gas is evolved during the photolysis of water in photosynthesis?',
        question_type: 'mcq',
        topic: 'Photosynthesis',
        options: ['CO2', 'O2', 'N2', 'CH4'],
        correct_answer: 'O2',
        marks: 4.0,
        explanation: 'Water photolysis in PSII liberates molecular oxygen.'
      },
      {
        id: 'q_ex_2',
        question_text: 'Select all chemical products generated during chloroplast light reactions:',
        question_type: 'multiple_select',
        topic: 'Photosynthesis',
        options: ['ATP', 'NADPH', 'Glucose', 'O2'],
        correct_answer: ['ATP', 'NADPH', 'O2'],
        marks: 4.0,
        explanation: 'Light reactions generate ATP, NADPH, and O2; glucose is synthesized in dark reactions.'
      },
      {
        id: 'q_ex_3',
        question_text: 'True or False: Plant chloroplasts only produce ATP during daytime daylight hours.',
        question_type: 'true_false',
        topic: 'Photosynthesis',
        options: ['True', 'False'],
        correct_answer: 'True',
        marks: 2.0,
        explanation: 'Photophosphorylation strictly requires sunlight photon absorption.'
      },
      {
        id: 'q_ex_4',
        question_text: 'Fill in the blank: The primary carbon-fixing enzyme in C3 plants is ______.',
        question_type: 'fill_blank',
        topic: 'Photosynthesis',
        correct_answer: 'RuBisCO',
        marks: 4.0,
        explanation: 'Ribulose-1,5-bisphosphate carboxylase-oxygenase catalyzes initial CO2 fixation.'
      },
      {
        id: 'q_ex_5',
        question_text: 'Calculate the theoretical net ATP yield per glucose molecule during aerobic cellular respiration in human mitochondria.',
        question_type: 'numerical',
        topic: 'Cellular Respiration',
        correct_answer: 32.0,
        acceptable_tolerance: 0.1,
        marks: 4.0,
        explanation: 'Standard mitochondrial stoichiometry yields ~30 to 32 ATP per oxidized glucose.'
      },
      {
        id: 'q_ex_6',
        question_text: 'In the cardiac diagram, which chamber pumps oxygenated blood directly through the aorta?',
        question_type: 'diagram',
        topic: 'Circulation',
        options: ['Right Ventricle', 'Left Ventricle', 'Right Atrium', 'Left Atrium'],
        correct_answer: 'Left Ventricle',
        marks: 2.0,
        explanation: 'Left ventricle myocardium generates systemic systolic blood pressure.'
      }
    ];

    const createExamRes = await fetch(`${baseUrl}/api/v1/examinations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        title: 'CBSE Class 10 Weekly Science Comprehensive — Assessment 6',
        week: 6,
        academic_level: 'Grade 10',
        subject: 'Science',
        topics: ['Photosynthesis', 'Cellular Respiration', 'Circulation'],
        total_marks: 20.0,
        duration_minutes: 30,
        pass_percentage: 50.0,
        max_attempts: 1,
        retake_allowed: false,
        result_visibility: 'immediate',
        instructions: 'Read questions carefully. Select single or multi-answers as requested. Numerical answers permit standard rounding.',
        questions: examQuestions,
        is_published: true
      })
    });
    assert.strictEqual(createExamRes.status, 201);
    const newExam = await createExamRes.json();
    assert.ok(newExam.id.startsWith('exam_'));
    assert.strictEqual(newExam.question_count, 6);
    report('T9', `Admin created and published 6-question comprehensive weekly exam (${newExam.id})`, true);

    // Student attempts to create exam (must be forbidden)
    const unauthorizedCreate = await fetch(`${baseUrl}/api/v1/examinations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ title: 'Hacked Exam', subject: 'Science', questions: [] })
    });
    assert.strictEqual(unauthorizedCreate.status, 403);
    report('T9b', 'Role enforcement: Student blocked from creating examinations (403 Forbidden)', true);

    // -------------------------------------------------------------------------
    // TEST 10: Student Exam Experience: Start, Autosave Progress & Sanitization
    // -------------------------------------------------------------------------
    console.log('\n[TEST 10] Verifying Student Exam Flow: Start, Sanitization & Autosave');

    // 10a. Sanitization check (Student must NOT see answer keys or explanations)
    const getExamRes = await fetch(`${baseUrl}/api/v1/examinations/${newExam.id}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(getExamRes.status, 200);
    const studentExamView = await getExamRes.json();
    assert.strictEqual(studentExamView.questions.length, 6);
    for (const q of studentExamView.questions) {
      assert.strictEqual(q.correct_answer, undefined);
      assert.strictEqual(q.explanation, undefined);
    }
    report('T10a', 'Exam questions sanitized for student: Correct answers and explanations hidden', true);

    // 10b. Start Timed Attempt
    const startRes = await fetch(`${baseUrl}/api/v1/examinations/${newExam.id}/start`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(startRes.status, 200);
    const startData = await startRes.json();
    assert.strictEqual(startData.status, 'started');
    assert.ok(startData.attempt_id.startsWith('att_'));
    assert.strictEqual(startData.duration_seconds, 1800);
    report('T10b', `Student started timed attempt (${startData.attempt_id}) with 1800-second timer`, true);

    // 10c. Autosave in-progress answers (protects against network disconnect)
    const saveRes = await fetch(`${baseUrl}/api/v1/examinations/${newExam.id}/save-progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        attempt_id: startData.attempt_id,
        current_answers: {
          q_ex_1: 'O2',
          q_ex_3: 'True'
        },
        marked_for_review: ['q_ex_5'],
        time_spent_seconds: 120
      })
    });
    assert.strictEqual(saveRes.status, 200);
    const saveData = await saveRes.json();
    assert.strictEqual(saveData.status, 'progress_saved');
    assert.strictEqual(saveData.saved_answers_count, 2);
    assert.strictEqual(saveData.marked_for_review_count, 1);
    report('T10c', 'In-progress answers and review flags autosaved against network interruption', true);

    // -------------------------------------------------------------------------
    // TEST 11: Auto-Grading Multi-Type Questions, Topic Analytics & Points
    // -------------------------------------------------------------------------
    console.log('\n[TEST 11] Verifying Multi-Type Auto-Grading & Topic Analytics');
    const submitRes = await fetch(`${baseUrl}/api/v1/examinations/${newExam.id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        attempt_id: startData.attempt_id,
        answers: [
          { question_id: 'q_ex_1', student_answer: 'O2' },                         // Correct MCQ (4 pts)
          { question_id: 'q_ex_2', student_answer: ['ATP', 'NADPH', 'O2'] },       // Correct Multiple Select (4 pts)
          { question_id: 'q_ex_3', student_answer: 'True' },                       // Correct True/False (2 pts)
          { question_id: 'q_ex_4', student_answer: 'RuBisCO' },                    // Correct Fill Blank (4 pts)
          { question_id: 'q_ex_5', student_answer: '32' },                         // Correct Numerical (4 pts)
          { question_id: 'q_ex_6', student_answer: 'Left Ventricle' }              // Correct Diagram (2 pts)
        ]
      })
    });
    assert.strictEqual(submitRes.status, 200);
    const evalData = await submitRes.json();
    assert.strictEqual(evalData.total_score, 20.0);
    assert.strictEqual(evalData.percentage, 100.0);
    assert.strictEqual(evalData.passed, true);
    assert.ok(evalData.points_awarded >= 150); // 100 base + 50 excellence bonus
    assert.ok(evalData.topic_breakdown['Photosynthesis']);
    assert.strictEqual(evalData.topic_breakdown['Photosynthesis'].status, 'Strong');
    report('T11a', 'Auto-grader evaluated all 6 question types with 100% score & topic analytics', true);

    // 11b. Attempt Limit Enforcement (Single attempt allowed)
    const secondStartRes = await fetch(`${baseUrl}/api/v1/examinations/${newExam.id}/start`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(secondStartRes.status, 400);
    const limitErr = await secondStartRes.json();
    assert.strictEqual(limitErr.detail.code, 'MAX_ATTEMPTS_REACHED');
    report('T11b', 'Attempt limit strictly enforced: Second attempt blocked without retake permission', true);

    // -------------------------------------------------------------------------
    // TEST 12: Historical Analytics & Cohort Monitoring
    // -------------------------------------------------------------------------
    console.log('\n[TEST 12] Verifying Student Results History & Admin Cohort Analytics');
    const myResultsRes = await fetch(`${baseUrl}/api/v1/examinations/results/my`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(myResultsRes.status, 200);
    const myResults = await myResultsRes.json();
    assert.ok(myResults.length >= 1);
    const latestAttempt = myResults.find(r => r.exam_id === newExam.id);
    assert.ok(latestAttempt);
    assert.strictEqual(latestAttempt.percentage, 100.0);
    report('T12a', `Student retrieved private examination history with topic breakdown`, true);

    const adminAnalyticsRes = await fetch(`${baseUrl}/api/v1/examinations/${newExam.id}/analytics`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(adminAnalyticsRes.status, 200);
    const analytics = await adminAnalyticsRes.json();
    assert.ok(analytics.total_attempts >= 1);
    assert.strictEqual(analytics.pass_rate_percentage, 100.0);
    assert.strictEqual(analytics.highest_score, 100.0);
    report('T12b', 'Admin cohort monitoring computed 100% pass rate & score distributions', true);

    console.log('\n================================================================');
    console.log(`🎉 ALL ${passedCount} PHASE 6 GAMES, POINTS & EXAMS ACCEPTANCE TESTS PASSED!`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('\n❌ PHASE 6 VERIFICATION FAILED:', err);
    process.exitCode = 1;
  }
}

runPhase6Verification();
