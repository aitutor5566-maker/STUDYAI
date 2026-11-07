import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { createAppServer } from '../server/index.ts';

const serverInstance = createAppServer();
const TEST_STUDENT_ID = 'student-vishwak';
const SECOND_STUDENT_ID = 'student-new';

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

test('1. Educational Games Catalog returns all 7 core educational games', async () => {
  const { status, data } = await api('/api/educational-games/catalog');
  assert.equal(status, 200);
  assert.ok(Array.isArray(data.games));
  assert.equal(data.count, 7);
  assert.equal(data.games.length, 7);

  const slugs = data.games.map((g: any) => g.slug).sort();
  const expectedSlugs = [
    'find_mistake',
    'match_pairs',
    'mcq_challenge',
    'missing_letters',
    'missing_words',
    'true_false',
    'word_scramble'
  ].sort();
  assert.deepEqual(slugs, expectedSlugs);

  data.games.forEach((g: any) => {
    assert.ok(g.name);
    assert.ok(g.category);
    assert.ok(Array.isArray(g.instructions));
    assert.ok(Array.isArray(g.supportedDifficulties));
    assert.ok(Array.isArray(g.compatibleSubjects));
  });
});

test('2. Game 1: Missing Letters session generation & validation', async () => {
  const startRes = await api('/api/educational-games/session/start', {
    method: 'POST',
    body: JSON.stringify({
      game_slug: 'missing_letters',
      topic: 'Photosynthesis',
      subject: 'Biology',
      difficulty: 'medium'
    })
  });

  assert.equal(startRes.status, 201);
  assert.ok(startRes.data.sessionId);
  assert.ok(Array.isArray(startRes.data.questions));
  assert.ok(startRes.data.questions.length >= 3);

  const q1 = startRes.data.questions[0];
  assert.ok(q1.displayWord);
  assert.ok(Array.isArray(q1.missingIndices));
  assert.ok(q1.fullWord);
  assert.ok(q1.hint);

  // Submit correct answer
  const correctSubmit = await api('/api/educational-games/session/submit-answer', {
    method: 'POST',
    body: JSON.stringify({
      session_id: startRes.data.sessionId,
      question: q1,
      question_index: 0,
      student_answer: q1.fullWord,
      hints_used: 0
    })
  });

  assert.equal(correctSubmit.status, 200);
  assert.equal(correctSubmit.data.isCorrect, true);
  assert.ok(correctSubmit.data.scoreEarned > 0);
  assert.ok(correctSubmit.data.explanation);
});

test('3. Game 2: Missing Words session generation & answer validation', async () => {
  const startRes = await api('/api/educational-games/session/start', {
    method: 'POST',
    body: JSON.stringify({
      game_slug: 'missing_words',
      topic: 'Photosynthesis',
      subject: 'Science',
      difficulty: 'easy'
    })
  });

  assert.equal(startRes.status, 201);
  const q1 = startRes.data.questions[0];
  assert.ok(q1.sentenceWithBlank);
  assert.ok(q1.sentenceWithBlank.includes('______'));
  assert.ok(Array.isArray(q1.options));
  assert.ok(q1.options.length >= 2);

  // Submit correct answer
  const submitRes = await api('/api/educational-games/session/submit-answer', {
    method: 'POST',
    body: JSON.stringify({
      session_id: startRes.data.sessionId,
      question: q1,
      question_index: 0,
      student_answer: q1.correctWord,
      hints_used: 0
    })
  });

  assert.equal(submitRes.status, 200);
  assert.equal(submitRes.data.isCorrect, true);
  assert.ok(submitRes.data.explanation.length > 0);
});

test('4. Game 3: Match the Pairs session generation & validation', async () => {
  const startRes = await api('/api/educational-games/session/start', {
    method: 'POST',
    body: JSON.stringify({
      game_slug: 'match_pairs',
      topic: 'Photosynthesis',
      subject: 'Science'
    })
  });

  assert.equal(startRes.status, 201);
  const q1 = startRes.data.questions[0];
  assert.ok(Array.isArray(q1.pairs));
  assert.ok(q1.pairs.length >= 3);
  assert.ok(Array.isArray(q1.shuffledLeft));
  assert.ok(Array.isArray(q1.shuffledRight));

  // Submit correct matches
  const submitRes = await api('/api/educational-games/session/submit-answer', {
    method: 'POST',
    body: JSON.stringify({
      session_id: startRes.data.sessionId,
      question: q1,
      question_index: 0,
      student_answer: q1.pairs.map((p: any) => ({ left: p.left, right: p.right })),
      hints_used: 0
    })
  });

  assert.equal(submitRes.status, 200);
  assert.equal(submitRes.data.isCorrect, true);
});

test('5. Game 4: MCQ Challenge session generation & validation', async () => {
  const startRes = await api('/api/educational-games/session/start', {
    method: 'POST',
    body: JSON.stringify({
      game_slug: 'mcq_challenge',
      topic: 'Human Heart',
      subject: 'Biology'
    })
  });

  assert.equal(startRes.status, 201);
  const q1 = startRes.data.questions[0];
  assert.ok(q1.question);
  assert.equal(q1.options.length, 4);
  assert.ok(typeof q1.correctOptionIndex === 'number');

  // Submit correct choice
  const submitRes = await api('/api/educational-games/session/submit-answer', {
    method: 'POST',
    body: JSON.stringify({
      session_id: startRes.data.sessionId,
      question: q1,
      question_index: 0,
      student_answer: q1.correctOptionIndex,
      hints_used: 0
    })
  });

  assert.equal(submitRes.status, 200);
  assert.equal(submitRes.data.isCorrect, true);
  assert.ok(submitRes.data.explanation);
});

test('6. Game 5: Word Scramble session generation & validation', async () => {
  const startRes = await api('/api/educational-games/session/start', {
    method: 'POST',
    body: JSON.stringify({
      game_slug: 'word_scramble',
      topic: 'Friction',
      subject: 'Physics'
    })
  });

  assert.equal(startRes.status, 201);
  const q1 = startRes.data.questions[0];
  assert.ok(Array.isArray(q1.scrambledLetters));
  assert.ok(q1.word);

  // Submit correct rearranged word
  const submitRes = await api('/api/educational-games/session/submit-answer', {
    method: 'POST',
    body: JSON.stringify({
      session_id: startRes.data.sessionId,
      question: q1,
      question_index: 0,
      student_answer: q1.word,
      hints_used: 0
    })
  });

  assert.equal(submitRes.status, 200);
  assert.equal(submitRes.data.isCorrect, true);
});

test('7. Game 6: True or False session generation & validation', async () => {
  const startRes = await api('/api/educational-games/session/start', {
    method: 'POST',
    body: JSON.stringify({
      game_slug: 'true_false',
      topic: 'Friction',
      subject: 'Physics'
    })
  });

  assert.equal(startRes.status, 201);
  const q1 = startRes.data.questions[0];
  assert.ok(q1.statement);
  assert.ok(typeof q1.isTrue === 'boolean');

  // Submit correct boolean answer
  const submitRes = await api('/api/educational-games/session/submit-answer', {
    method: 'POST',
    body: JSON.stringify({
      session_id: startRes.data.sessionId,
      question: q1,
      question_index: 0,
      student_answer: q1.isTrue,
      hints_used: 0
    })
  });

  assert.equal(submitRes.status, 200);
  assert.equal(submitRes.data.isCorrect, true);
});

test('8. Game 7: Find the Mistake session generation & validation', async () => {
  const startRes = await api('/api/educational-games/session/start', {
    method: 'POST',
    body: JSON.stringify({
      game_slug: 'find_mistake',
      topic: 'Photosynthesis',
      subject: 'Biology'
    })
  });

  assert.equal(startRes.status, 201);
  const q1 = startRes.data.questions[0];
  assert.ok(Array.isArray(q1.tokens));
  assert.ok(typeof q1.mistakeTokenIndex === 'number');
  assert.ok(q1.correctToken);

  // Submit correct token index & correction
  const submitRes = await api('/api/educational-games/session/submit-answer', {
    method: 'POST',
    body: JSON.stringify({
      session_id: startRes.data.sessionId,
      question: q1,
      question_index: 0,
      student_answer: {
        tokenIndex: q1.mistakeTokenIndex,
        correction: q1.correctToken
      },
      hints_used: 0
    })
  });

  assert.equal(submitRes.status, 200);
  assert.equal(submitRes.data.isCorrect, true);
  assert.ok(submitRes.data.explanation);
});

test('9. Full Session Lifecycle: start -> answer mixed -> complete -> weak concept extraction', async () => {
  const startRes = await api('/api/educational-games/session/start', {
    method: 'POST',
    body: JSON.stringify({
      game_slug: 'true_false',
      topic: 'Photosynthesis',
      subject: 'Biology'
    })
  });

  const sessionId = startRes.data.sessionId;
  const questions = startRes.data.questions;

  // Q1: Correct
  await api('/api/educational-games/session/submit-answer', {
    method: 'POST',
    body: JSON.stringify({
      session_id: sessionId,
      question: questions[0],
      question_index: 0,
      student_answer: questions[0].isTrue,
      hints_used: 0
    })
  });

  // Q2: Incorrect (opposite boolean)
  const incorrectRes = await api('/api/educational-games/session/submit-answer', {
    method: 'POST',
    body: JSON.stringify({
      session_id: sessionId,
      question: questions[1],
      question_index: 1,
      student_answer: !questions[1].isTrue,
      hints_used: 1
    })
  });

  assert.equal(incorrectRes.data.isCorrect, false);
  assert.ok(incorrectRes.data.weakConceptIfWrong);

  // Complete session
  const completeRes = await api('/api/educational-games/session/complete', {
    method: 'POST',
    body: JSON.stringify({
      session_id: sessionId,
      duration_seconds: 45
    })
  });

  assert.equal(completeRes.status, 200);
  assert.equal(completeRes.data.correctCount, 1);
  assert.ok(Array.isArray(completeRes.data.weakConcepts));
  assert.ok(completeRes.data.weakConcepts.length > 0);
  assert.ok(completeRes.data.tutorUrl.includes('/tutor'));
});

test('10. Multi-student game history isolation & stats aggregation', async () => {
  const isolatedStudentId = `student-isolated-${Date.now()}`;
  const historyA = await api('/api/educational-games/history', {}, TEST_STUDENT_ID);
  assert.equal(historyA.status, 200);
  assert.ok(historyA.data.sessions.length > 0);
  assert.ok(historyA.data.stats.length > 0);

  const historyB = await api('/api/educational-games/history', {}, isolatedStudentId);
  assert.equal(historyB.status, 200);
  // Isolated student has not played games yet
  assert.equal(historyB.data.sessions.filter((s: any) => s.user_id === isolatedStudentId).length, 0);
});
