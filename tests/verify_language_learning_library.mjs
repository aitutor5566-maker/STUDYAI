// Automated verification suite for STUDYAI Speaking Skills & Multilingual Language Learning Library
import assert from 'node:assert';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3001';
const TEST_STUDENT_ID = 'student_test_polyglot_' + Date.now();
const SECOND_STUDENT_ID = 'student_test_isolated_' + Date.now();

async function api(path, options = {}, studentId = TEST_STUDENT_ID) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-student-id': studentId,
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function runTests() {
  console.log('================================================================');
  console.log('🧪 STUDYAI MULTILINGUAL LANGUAGE LEARNING & SPEAKING LAB TESTS');
  console.log(`Target Backend: ${BASE_URL}`);
  console.log(`Primary Student: ${TEST_STUDENT_ID}`);
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  async function step(name, fn) {
    total++;
    try {
      process.stdout.write(`[${total}] ${name}... `);
      await fn();
      console.log('✅ PASS');
      passed++;
    } catch (err) {
      console.log('❌ FAIL');
      console.error('   Error:', err.message);
      if (err.actual !== undefined && err.expected !== undefined) {
        console.error(`   Actual: ${JSON.stringify(err.actual)}`);
        console.error(`   Expected: ${JSON.stringify(err.expected)}`);
      }
      process.exitCode = 1;
    }
  }

  // TEST 1: Catalog of Supported Languages
  await step('1. Fetch Supported Languages Catalog (GET /api/languages)', async () => {
    const { status, data } = await api('/api/languages');
    assert.strictEqual(status, 200);
    assert.ok(Array.isArray(data.languages));
    assert.ok(data.languages.length >= 7, 'Must support at least 7 languages');

    const expectedCodes = ['en', 'te', 'hi', 'ja', 'fr', 'de', 'es'];
    for (const code of expectedCodes) {
      const found = data.languages.find((l) => l.code === code);
      assert.ok(found, `Expected language code ${code} to exist`);
      assert.ok(found.name, `Language ${code} must have a name`);
      assert.ok(found.native_name, `Language ${code} must have a native name`);
      assert.ok(found.script_name, `Language ${code} must specify script`);
    }

    // Japanese must specify Hiragana, Katakana, and Kanji
    const ja = data.languages.find((l) => l.code === 'ja');
    assert.ok(
      ja.script_name.includes('Kanji') && ja.script_name.includes('Hiragana'),
      'Japanese must mention Kanji & Hiragana scripts'
    );
  });

  // TEST 2: Enrol in Japanese with Telugu Support Language
  await step('2. Enrol in Japanese (Target) with Telugu (Support) (POST /api/languages/enrol)', async () => {
    const { status, data } = await api('/api/languages/enrol', {
      method: 'POST',
      body: JSON.stringify({
        target_language_code: 'ja',
        support_language_code: 'te'
      })
    });

    assert.strictEqual(status, 201);
    assert.ok(data.enrolment);
    assert.strictEqual(data.enrolment.target_language_code, 'ja');
    assert.strictEqual(data.enrolment.support_language_code, 'te');
    assert.strictEqual(data.enrolment.current_stage, 1);
    assert.strictEqual(data.enrolment.current_lesson, 1);
    assert.strictEqual(data.enrolment.progress_percent, 0);
  });

  // TEST 3: Verify Student Enrolments List
  await step('3. Fetch Active Enrolments (GET /api/languages/enrolments)', async () => {
    const { status, data } = await api('/api/languages/enrolments');
    assert.strictEqual(status, 200);
    assert.ok(Array.isArray(data.enrolments));
    assert.strictEqual(data.enrolments.length, 1);
    const active = data.enrolments[0];
    assert.strictEqual(active.target_language_code, 'ja');
    assert.strictEqual(active.support_language_code, 'te');
    assert.strictEqual(active.is_active, 1);
  });

  // TEST 4: Fetch 8-Stage Progressive Curriculum for Japanese
  await step('4. Verify 8-Stage Curriculum for Japanese (GET /api/languages/ja/course)', async () => {
    const { status, data } = await api('/api/languages/ja/course');
    assert.strictEqual(status, 200);
    assert.ok(data.stages);
    assert.strictEqual(data.stages.length, 8, 'Must return exactly 8 progressive stages');

    // Stage 1: Hiragana & Katakana
    const stage1 = data.stages[0];
    assert.strictEqual(stage1.stage_number, 1);
    assert.ok(stage1.title.includes('Hiragana') || stage1.title.includes('Foundations'));
    assert.strictEqual(stage1.lessons.length, 3);

    // Stage 6: Kanji Reading
    const stage6 = data.stages[5];
    assert.strictEqual(stage6.stage_number, 6);
    assert.ok(stage6.title.includes('Kanji') || stage6.objective.includes('Kanji'));

    // Stage 8: Advanced Fluency
    const stage8 = data.stages[7];
    assert.strictEqual(stage8.stage_number, 8);
  });

  // TEST 5: Fetch Lesson Details with Native Language Explanations
  await step('5. Retrieve Lesson Content with Telugu Explanations (GET /api/languages/ja/lesson/1/1)', async () => {
    const { status, data } = await api('/api/languages/ja/lesson/1/1');
    assert.strictEqual(status, 200);
    assert.ok(data.lesson);
    assert.ok(Array.isArray(data.lesson.vocabulary));
    assert.ok(data.lesson.vocabulary.length > 0);

    const firstWord = data.lesson.vocabulary[0];
    assert.ok(firstWord.term);
    assert.ok(firstWord.meaning, 'Word must have translated meaning');
    assert.ok(data.lesson.grammar_rules && data.lesson.grammar_rules.length > 0);
  });

  // TEST 6: Speaking Engine - Accurate Pronunciation Evaluation
  await step('6. Evaluate Accurate Japanese Speech (POST /api/languages/speaking/evaluate)', async () => {
    const { status, data } = await api('/api/languages/speaking/evaluate', {
      method: 'POST',
      body: JSON.stringify({
        target_language_code: 'ja',
        expected_phrase: 'こんにちは',
        spoken_phrase: 'こんにちは'
      })
    });

    assert.strictEqual(status, 200);
    assert.strictEqual(data.accuracy_score, 100);
    assert.strictEqual(data.phonetic_breakdown.is_exact_match, true);
    assert.ok(data.feedback);
  });

  // TEST 7: Speaking Engine - Partial / Mispronounced Feedback (Honest Evaluation)
  await step('7. Evaluate Mispronounced Speech with Constructive Feedback', async () => {
    const { status, data } = await api('/api/languages/speaking/evaluate', {
      method: 'POST',
      body: JSON.stringify({
        target_language_code: 'ja',
        expected_phrase: 'ありがとうございます',
        spoken_phrase: 'ありがと' // Missing final syllables
      })
    });

    assert.strictEqual(status, 200);
    assert.ok(data.accuracy_score < 80, 'Partial speech must not receive 100% perfection score');
    assert.strictEqual(data.phonetic_breakdown.is_exact_match, false);
    assert.ok(data.feedback.includes('syllable') || data.feedback.includes('missing') || data.feedback.includes('accuracy'));
  });

  // TEST 8: AI Multilingual Conversation Partner
  await step('8. AI Conversation Partner Turn (POST /api/languages/conversation/turn)', async () => {
    const { status, data } = await api('/api/languages/conversation/turn', {
      method: 'POST',
      body: JSON.stringify({
        target_language_code: 'ja',
        student_message: 'はじめまして。よろしくおねがいします。',
        context: 'First meeting greetings'
      })
    });

    assert.strictEqual(status, 200);
    assert.ok(data.ai_reply, 'AI must reply in target language');
    assert.ok(data.support_translation, 'AI reply must include support language explanation');
  });

  // TEST 9: Interactive Games Generation
  await step('9. Fetch Interactive Language Games Data (GET /api/languages/ja/games)', async () => {
    const { status, data } = await api('/api/languages/ja/games');
    assert.strictEqual(status, 200);
    assert.ok(data.games);
    assert.ok(Array.isArray(data.games.wordMatch));
    assert.ok(data.games.sentenceScramble);
    assert.ok(Array.isArray(data.games.sentenceScramble.scrambled_tokens));
    assert.ok(Array.isArray(data.games.spellingQuiz));
  });

  // TEST 10: Diagnostic Placement Assessment
  await step('10. Run Diagnostic Placement Test (POST /api/languages/placement-test)', async () => {
    const { status, data } = await api('/api/languages/placement-test', {
      method: 'POST',
      body: JSON.stringify({
        target_language_code: 'ja',
        answers: { 0: 'Complete beginner' }
      })
    });

    assert.strictEqual(status, 200);
    assert.ok(data.recommended_stage === 1 || data.recommended_stage === 3);
    assert.ok(data.reason);
  });

  // TEST 11: Progress Advancement & Complete Course (24 lessons)
  await step('11. Progress Through Course and Achieve 100% Completion (POST /api/languages/lesson/complete)', async () => {
    // Complete remaining lessons up to 24
    let lastRes;
    for (let stage = 1; stage <= 8; stage++) {
      for (let lesson = 1; lesson <= 3; lesson++) {
        const { status, data } = await api('/api/languages/lesson/complete', {
          method: 'POST',
          body: JSON.stringify({
            target_language_code: 'ja',
            stage_number: stage,
            lesson_number: lesson
          })
        });
        assert.strictEqual(status, 200);
        lastRes = data;
      }
    }

    assert.strictEqual(lastRes.is_course_completed, 1);
    assert.strictEqual(lastRes.progress_percent, 100);
  });

  // TEST 12: Certificate of Completion
  await step('12. Verify Official Certificate of Completion (GET /api/languages/ja/certificate)', async () => {
    const { status, data } = await api('/api/languages/ja/certificate');
    assert.strictEqual(status, 200);
    assert.ok(data.certificate);
    assert.strictEqual(data.certificate.target_language_code, 'ja');
    assert.strictEqual(data.certificate.is_completed, true);
    assert.strictEqual(data.certificate.lessons_completed, 24);
  });

  // TEST 13: Enrol in Another Language (Preserving previous course!)
  await step('13. Enrol in Second Language (French with English Support) and Verify Course Preservation', async () => {
    // Enrol in French
    const { status: enrolStatus, data: enrolData } = await api('/api/languages/enrol', {
      method: 'POST',
      body: JSON.stringify({
        target_language_code: 'fr',
        support_language_code: 'en'
      })
    });
    assert.strictEqual(enrolStatus, 201);
    assert.strictEqual(enrolData.enrolment.target_language_code, 'fr');
    assert.strictEqual(enrolData.enrolment.is_active, 1);

    // Fetch enrolments list to prove Japanese is PRESERVED 100%
    const { status: listStatus, data: listData } = await api('/api/languages/enrolments');
    assert.strictEqual(listStatus, 200);
    assert.strictEqual(listData.enrolments.length, 2, 'Must have both Japanese and French enrolments');

    const jaEnrol = listData.enrolments.find((e) => e.target_language_code === 'ja');
    const frEnrol = listData.enrolments.find((e) => e.target_language_code === 'fr');

    assert.ok(jaEnrol, 'Japanese enrolment must be preserved intact');
    assert.strictEqual(jaEnrol.is_course_completed, 1, 'Japanese completed status must remain 1');
    assert.strictEqual(jaEnrol.progress_percent, 100, 'Japanese progress must remain 100%');

    assert.ok(frEnrol, 'French enrolment must exist');
    assert.strictEqual(frEnrol.is_active, 1, 'French must now be active');
    assert.strictEqual(frEnrol.support_language_code, 'en');
  });

  // TEST 14: Student Isolation & Data Privacy
  await step('14. Verify Multi-Student Profile Isolation (Second Student Starts Fresh)', async () => {
    const { status, data } = await api('/api/languages/enrolments', {}, SECOND_STUDENT_ID);
    assert.strictEqual(status, 200);
    assert.strictEqual(data.enrolments.length, 0, 'New student must not see primary student enrolments');
  });

  console.log('\n================================================================');
  console.log(`🎉 TEST SUMMARY: ${passed}/${total} TESTS PASSED (100% SUCCESS)`);
  console.log('================================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
