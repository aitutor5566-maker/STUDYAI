import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildTopicIdentityLock,
  generateTutorExplanation,
  validateTopicConsistency
} from '../server/aiAdapter.ts';

test('Topic Identity Lock prevents stale Physics/Science dropdowns from hijacking 1857 Revolt', async () => {
  const t0 = performance.now();
  const lock = buildTopicIdentityLock({
    question: 'Explain the First War of Independence.',
    previousTopic: "Newton's Laws of Motion",
    uiSubject: 'Physics',
    grade: 10,
    board: 'CBSE'
  });
  const lockMs = performance.now() - t0;
  assert.equal(lock.subject, 'Social Studies');
  assert.equal(lock.isHistoricalOrSocial, true);
  assert.ok(lockMs < 50, `Topic lock should be fast (<50ms), took ${lockMs.toFixed(2)}ms`);

  const resNormal = await generateTutorExplanation({
    topic: "Newton's Laws of Motion",
    question: 'Explain the First War of Independence.',
    mode: 'simple',
    subject: 'Physics',
    grade: 10,
    forceOfflineCurriculum: true
  });
  assert.equal(resNormal.subject, 'Social Studies');
  assert.equal(resNormal.formula, null);
  assert.equal(resNormal.model3dType, null);
  assert.notEqual(resNormal.diagramType, 'newton_physics');
  assert.ok(resNormal.introduction.includes('1857'));
  assert.equal(/newton|free-body|m\/s²/i.test(resNormal.introduction), false);

  const resExam = await generateTutorExplanation({
    topic: 'First War of Indian Independence (1857)',
    question: 'Give complete exam preparation for the First War of Independence.',
    mode: 'detailed',
    subject: 'Physics',
    grade: 10,
    forceOfflineCurriculum: true
  });
  assert.equal(resExam.subject, 'Social Studies');
  assert.equal(resExam.formula, null);
  assert.ok(resExam.keySteps.length >= 4);
});

test('Science topics, topic switching (1857 -> Photosynthesis), and follow-ups work accurately', async () => {
  const newton = await generateTutorExplanation({
    topic: 'General',
    question: "Explain Newton's Three Laws of Motion.",
    mode: 'detailed',
    subject: 'Social Studies',
    grade: 10,
    forceOfflineCurriculum: true
  });
  assert.equal(newton.subject, 'Science');
  assert.ok(newton.formula);

  // Switch from 1857 Revolt to Photosynthesis
  const photo = await generateTutorExplanation({
    topic: 'First War of Indian Independence (1857)',
    question: 'Explain photosynthesis.',
    mode: 'detailed',
    subject: 'Social Studies',
    grade: 10,
    forceOfflineCurriculum: true
  });
  assert.equal(photo.subject, 'Science');
  assert.ok(photo.introduction.toLowerCase().includes('photosynthesis'));
  assert.equal(/1857|east india company/i.test(photo.introduction), false);

  // Follow-up on 1857 Revolt
  const followUpLock = buildTopicIdentityLock({
    question: 'Explain the economic causes in more detail.',
    previousTopic: 'First War of Indian Independence (1857)',
    uiSubject: 'Social Studies'
  });
  assert.equal(followUpLock.isHistoricalOrSocial, true);

  // Consistency sanitizer strips accidental physics leakage from history
  const sanitized = validateTopicConsistency(followUpLock, {
    introduction: "Newton's Laws of Motion use F = ma (m/s²).",
    formula: { equation: 'F = ma' },
    diagramType: 'newton_physics',
    keySteps: ['F = ma in kg·m/s²', 'Economic exploitation by East India Company'],
    keywords: ['Free-Body Diagram', 'Doctrine of Lapse']
  });
  assert.equal(sanitized.formula, null);
  assert.equal(sanitized.diagramType, 'concept_diagram');
  assert.equal(sanitized.keySteps.length, 1);
  assert.equal(sanitized.keywords.length, 1);
});
