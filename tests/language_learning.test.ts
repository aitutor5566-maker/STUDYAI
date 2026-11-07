import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { createAppServer } from '../server/index.ts';

const serverInstance = createAppServer();
const TEST_STUDENT_ID = 'student_test_polyglot_' + Date.now();
const SECOND_STUDENT_ID = 'student_test_isolated_' + Date.now();

async function api(
  path: string,
  options: { method?: string; body?: string; headers?: Record<string, string> } = {},
  studentId = TEST_STUDENT_ID
) {
  return new Promise<{ status: number; data: any }>((resolve, reject) => {
    const req = new EventEmitter() as any;
    req.method = options.method || 'GET';
    req.url = path;
    req.headers = {
      'x-student-id': studentId,
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...Object.fromEntries(Object.entries(options.headers || {}).map(([k, v]) => [k.toLowerCase(), v]))
    };
    req.socket = { remoteAddress: '127.0.0.1' };
    req.destroy = () => {};

    let statusCode = 200;
    const chunks: string[] = [];
    const res = {
      writeHead(code: number) {
        statusCode = code;
      },
      end(body?: string) {
        if (body) chunks.push(body);
        try {
          const parsed = chunks.length > 0 ? JSON.parse(chunks.join('')) : {};
          resolve({ status: statusCode, data: parsed });
        } catch {
          resolve({ status: statusCode, data: {} });
        }
      }
    } as any;

    serverInstance.emit('request', req, res);

    queueMicrotask(() => {
      try {
        if (options.body) {
          req.emit('data', Buffer.from(options.body, 'utf-8'));
        }
        req.emit('end');
      } catch (err) {
        reject(err);
      }
    });
  });
}

test('1. Supported Languages Catalog returns 7 languages including scripts', async () => {
  const { status, data } = await api('/api/languages');
  assert.strictEqual(status, 200);
  assert.ok(Array.isArray(data.languages));
  assert.ok(data.languages.length >= 7, 'Must support at least 7 languages');

  const expectedCodes = ['en', 'te', 'hi', 'ja', 'fr', 'de', 'es'];
  for (const code of expectedCodes) {
    const found = data.languages.find((l: any) => l.code === code);
    assert.ok(found, `Expected language code ${code} to exist`);
    assert.ok(found.name, `Language ${code} must have a name`);
    assert.ok(found.native_name, `Language ${code} must have a native name`);
    assert.ok(found.script_name, `Language ${code} must specify script`);
  }

  const ja = data.languages.find((l: any) => l.code === 'ja');
  assert.ok(
    ja.script_name.includes('Kanji') && ja.script_name.includes('Hiragana'),
    'Japanese must explicitly specify Kanji and Hiragana scripts'
  );
});

test('2. Enrol in Japanese target with Telugu support language', async () => {
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
  assert.strictEqual(data.enrolment.is_active, 1);
});

test('3. Fetch active enrolments for student', async () => {
  const { status, data } = await api('/api/languages/enrolments');
  assert.strictEqual(status, 200);
  assert.ok(Array.isArray(data.enrolments));
  assert.strictEqual(data.enrolments.length, 1);
  assert.strictEqual(data.enrolments[0].target_language_code, 'ja');
  assert.strictEqual(data.enrolments[0].support_language_code, 'te');
});

test('4. Fetch 8-stage progressive curriculum for Japanese', async () => {
  const { status, data } = await api('/api/languages/ja/course');
  assert.strictEqual(status, 200);
  assert.ok(data.stages);
  assert.strictEqual(data.stages.length, 8, 'Must return exactly 8 stages');

  // Stage 1
  assert.strictEqual(data.stages[0].stage_number, 1);
  assert.ok(data.stages[0].title.includes('Hiragana') || data.stages[0].title.includes('Foundations'));
  assert.strictEqual(data.stages[0].lessons.length, 3);

  // Stage 6 (Kanji)
  assert.strictEqual(data.stages[5].stage_number, 6);
  assert.ok(data.stages[5].title.includes('Kanji') || data.stages[5].objective.includes('Kanji'));

  // Stage 8
  assert.strictEqual(data.stages[7].stage_number, 8);
});

test('5. Retrieve lesson content with support language translations', async () => {
  const { status, data } = await api('/api/languages/ja/lesson/1/1');
  assert.strictEqual(status, 200);
  assert.ok(data.lesson);
  assert.ok(Array.isArray(data.lesson.vocabulary));
  assert.ok(data.lesson.vocabulary.length > 0);
  assert.ok(data.lesson.vocabulary[0].term);
  assert.ok(data.lesson.vocabulary[0].meaning);
  assert.ok(data.lesson.grammar_rules && data.lesson.grammar_rules.length > 0);
});

test('6. Speaking Engine: Evaluate exact pronunciation with honest feedback', async () => {
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

test('7. Speaking Engine: Evaluate partial/mispronounced speech honestly (no false praise)', async () => {
  const { status, data } = await api('/api/languages/speaking/evaluate', {
    method: 'POST',
    body: JSON.stringify({
      target_language_code: 'ja',
      expected_phrase: 'ありがとうございます',
      spoken_phrase: 'ありがと'
    })
  });

  assert.strictEqual(status, 200);
  assert.ok(data.accuracy_score < 80, 'Partial speech must not receive 100% perfection score');
  assert.strictEqual(data.phonetic_breakdown.is_exact_match, false);
  assert.ok(data.feedback.length > 10);
});

test('8. AI Conversation Partner turn returns target language and support explanations', async () => {
  const { status, data } = await api('/api/languages/conversation/turn', {
    method: 'POST',
    body: JSON.stringify({
      target_language_code: 'ja',
      student_message: 'はじめまして。',
      context: 'First greeting'
    })
  });

  assert.strictEqual(status, 200);
  assert.ok(data.ai_reply);
  assert.ok(data.support_translation);
});

test('9. Interactive language games provide matching, scramble, and quizzes', async () => {
  const { status, data } = await api('/api/languages/ja/games');
  assert.strictEqual(status, 200);
  assert.ok(data.games);
  assert.ok(Array.isArray(data.games.wordMatch));
  assert.ok(data.games.sentenceScramble);
  assert.ok(Array.isArray(data.games.sentenceScramble.scrambled_tokens));
  assert.ok(Array.isArray(data.games.spellingQuiz));
});

test('10. Diagnostic placement test assesses student level', async () => {
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

test('11. Progress through all 24 lessons and achieve 100% completion', async () => {
  let lastRes: any;
  for (let s = 1; s <= 8; s++) {
    for (let l = 1; l <= 3; l++) {
      const { status, data } = await api('/api/languages/lesson/complete', {
        method: 'POST',
        body: JSON.stringify({
          target_language_code: 'ja',
          stage_number: s,
          lesson_number: l
        })
      });
      assert.strictEqual(status, 200);
      lastRes = data;
    }
  }

  assert.strictEqual(lastRes.is_course_completed, 1);
  assert.strictEqual(lastRes.progress_percent, 100);
});

test('12. Generate official certificate of course completion', async () => {
  const { status, data } = await api('/api/languages/ja/certificate');
  assert.strictEqual(status, 200);
  assert.ok(data.certificate);
  assert.strictEqual(data.certificate.target_language_code, 'ja');
  assert.strictEqual(data.certificate.is_completed, true);
  assert.strictEqual(data.certificate.lessons_completed, 24);
});

test('13. Enrol in a second language preserving 100% of previous course without deletion', async () => {
  // Enrol in French with English support
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

  // Verify both courses exist
  const { status: listStatus, data: listData } = await api('/api/languages/enrolments');
  assert.strictEqual(listStatus, 200);
  assert.strictEqual(listData.enrolments.length, 2);

  const jaEnrol = listData.enrolments.find((e: any) => e.target_language_code === 'ja');
  const frEnrol = listData.enrolments.find((e: any) => e.target_language_code === 'fr');

  assert.ok(jaEnrol);
  assert.strictEqual(jaEnrol.is_course_completed, 1);
  assert.strictEqual(jaEnrol.progress_percent, 100);

  assert.ok(frEnrol);
  assert.strictEqual(frEnrol.is_active, 1);
  assert.strictEqual(frEnrol.support_language_code, 'en');
});

test('14. Multi-student profile isolation guarantees data privacy', async () => {
  const { status, data } = await api('/api/languages/enrolments', {}, SECOND_STUDENT_ID);
  assert.strictEqual(status, 200);
  assert.strictEqual(data.enrolments.length, 0);
});

test('15. Picture-Based Vocabulary Studio returns 15 categories and animated SVG illustrations', async () => {
  const { status, data } = await api('/api/languages/ja/picture-vocabulary?support=te');
  assert.strictEqual(status, 200);
  assert.strictEqual(data.categories.length, 15);
  assert.ok(data.items.length >= 15);

  const waterCard = data.items.find((i: any) => i.englishWord === 'Water');
  assert.ok(waterCard);
  assert.ok(waterCard.targetWord.includes('水'));
  assert.strictEqual(waterCard.romanization, 'Mizu');
  assert.ok(waterCard.illustrationSvgDataUrl.startsWith('data:image/svg+xml'));
  assert.strictEqual(waterCard.quizOptions.length, 4);
});

test('16. Save Picture Vocabulary word to student collection & persist mastery', async () => {
  const { status, data } = await api('/api/languages/vocabulary/save', {
    method: 'POST',
    body: JSON.stringify({
      language_code: 'ja',
      support_language_code: 'te',
      word_id: 'vocab-water',
      category: 'water_drinks',
      english_word: 'Water',
      target_word: '水 (みず)',
      romanization: 'Mizu',
      support_meaning: 'నీరు (Water)',
      pronunciation_score: 98
    })
  });
  assert.strictEqual(status, 200);
  assert.strictEqual(data.success, true);
  assert.ok(data.savedWordsCount >= 1);
  assert.strictEqual(data.savedWords[0].word_id, 'vocab-water');
});

test('17. Language-Specific Script Mastery Decks return Hiragana, Katakana, Kanji & Telugu scripts', async () => {
  const jaScripts = await api('/api/languages/ja/scripts');
  assert.strictEqual(jaScripts.status, 200);
  assert.strictEqual(jaScripts.data.decks.length, 3); // Hiragana, Katakana, Kanji

  const teScripts = await api('/api/languages/te/scripts');
  assert.strictEqual(teScripts.status, 200);
  assert.ok(teScripts.data.decks.length >= 2); // Achulu & Hallulu
});

test('18. Listening & Understanding Studio provides word-picture, minimal pairs, and dialogue activities', async () => {
  const { status, data } = await api('/api/languages/ja/listening?support=te');
  assert.strictEqual(status, 200);
  assert.ok(data.activities.wordIdentification.length > 0);
  assert.ok(data.activities.sentenceComprehension.length > 0);
  assert.ok(data.activities.minimalPairs.length > 0);
  assert.ok(data.activities.shortDialogue.lines.length > 0);

  const submitRes = await api('/api/languages/listening/submit', {
    method: 'POST',
    body: JSON.stringify({
      language_code: 'ja',
      activity_type: 'minimal_pairs',
      question_id: 'mp-ja-1',
      is_correct: true,
      playback_speed: 0.55
    })
  });
  assert.strictEqual(submitRes.status, 200);
  assert.strictEqual(submitRes.data.isCorrect, true);
});

test('19. All 7 Interactive Language Games (Games A to G) are generated and playable', async () => {
  const { status, data } = await api('/api/languages/ja/games?support=te');
  assert.strictEqual(status, 200);
  const g = data.games;
  assert.ok(Array.isArray(g.pictureToWord) && g.pictureToWord.length > 0);
  assert.ok(Array.isArray(g.listenAndSelect) && g.listenAndSelect.length > 0);
  assert.ok(Array.isArray(g.speakTheWord) && g.speakTheWord.length > 0);
  assert.ok(Array.isArray(g.missingLetters) && g.missingLetters.length > 0);
  assert.ok(Array.isArray(g.wordMatching) && g.wordMatching.length > 0);
  assert.ok(Array.isArray(g.sentenceBuilder) && g.sentenceBuilder.length > 0);
  assert.ok(Array.isArray(g.conversationChallenge) && g.conversationChallenge.length > 0);

  const submitGame = await api('/api/languages/games/submit', {
    method: 'POST',
    body: JSON.stringify({
      language_code: 'ja',
      game_code: 'picture_to_word',
      difficulty: 'medium',
      score: 60,
      accuracy_percent: 100,
      items_completed: 4
    })
  });
  assert.strictEqual(submitGame.status, 200);
  assert.strictEqual(submitGame.data.success, true);
});

test('20. AI Conversation Scenarios provide 8 real-life situations & 3-metric pronunciation evaluation', async () => {
  const scenRes = await api('/api/languages/conversation/scenarios');
  assert.strictEqual(scenRes.status, 200);
  assert.strictEqual(scenRes.data.count, 8);

  const evalRes = await api('/api/languages/speaking/evaluate', {
    method: 'POST',
    body: JSON.stringify({
      target_language_code: 'ja',
      support_language_code: 'te',
      expected_phrase: '水',
      spoken_phrase: '水'
    })
  });
  assert.strictEqual(evalRes.status, 200);
  assert.strictEqual(evalRes.data.word_recognition_score, 100);
  assert.strictEqual(evalRes.data.pronunciation_quality_score, 100);
  assert.strictEqual(evalRes.data.sentence_accuracy_score, 100);
  assert.ok(evalRes.data.language_phonetic_notes);
  assert.ok(evalRes.data.assessment_capability_disclosure);
});
