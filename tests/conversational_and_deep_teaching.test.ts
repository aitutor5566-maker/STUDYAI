import test from 'node:test';
import assert from 'node:assert/strict';
import { initDatabase } from '../server/db.ts';
import {
  buildLineByLineExplanation,
  buildPronunciationGuide,
  classifyStudentMessageIntent,
  routeIntelligentTutorMessage
} from '../server/intelligentTeachingRouter.ts';
import { deepConceptMasteryEngine } from '../server/deepConceptMasteryEngine.ts';

initDatabase();

test('Greetings, social chat, thanks, and farewells never trigger academic RAG', async () => {
  const cases = [
    { msg: 'Hi', expectedIntent: 'greeting', check: /great to see you|what subject/i },
    { msg: 'Hello', expectedIntent: 'greeting', check: /great to see you|what subject/i },
    { msg: 'How are you?', expectedIntent: 'social_chat', check: /doing great/i },
    { msg: 'What is your name?', expectedIntent: 'identity_capability', check: /STUDYAI learning assistant/i },
    { msg: 'Thank you', expectedIntent: 'gratitude_farewell', check: /welcome|happy to help/i },
    { msg: 'Bye', expectedIntent: 'gratitude_farewell', check: /goodbye|great day/i },
    { msg: 'Can you help me?', expectedIntent: 'casual_conversation', check: /of course|subject/i }
  ];

  for (const c of cases) {
    const routed = await routeIntelligentTutorMessage({ message: c.msg, previousTopic: 'Newton Laws' });
    assert.equal(routed.handledDirectly, true, `"${c.msg}" should be handled directly`);
    assert.equal(routed.classification.intent, c.expectedIntent);
    assert.equal(routed.classification.shouldRunAcademicRag, false);
    assert.match(routed.reply || '', c.check);
  }
});

test('Follow-up questions and example requests retain conversation context and switch cleanly on new topics', async () => {
  const history = [{ role: 'user', content: 'Explain photosynthesis' }];

  const exampleRes = await routeIntelligentTutorMessage({
    message: 'Give me an example.',
    history
  });
  assert.equal(exampleRes.handledDirectly, false);
  assert.equal(exampleRes.classification.intent, 'example_request');
  assert.equal(exampleRes.resolvedTopic, 'photosynthesis');
  assert.match(exampleRes.resolvedPrompt || '', /photosynthesis/i);

  const deeperRes = await routeIntelligentTutorMessage({
    message: 'Explain it more deeply.',
    history
  });
  assert.equal(deeperRes.classification.intent, 'follow_up_question');
  assert.equal(deeperRes.resolvedTopic, 'photosynthesis');

  const importanceRes = await routeIntelligentTutorMessage({
    message: 'What is its importance?',
    history
  });
  assert.equal(importanceRes.classification.intent, 'follow_up_question');
  assert.equal(importanceRes.resolvedTopic, 'photosynthesis');

  // Topic switch must NOT keep forcing photosynthesis onto the new topic
  const switchCls = classifyStudentMessageIntent({
    message: 'Explain the Indian War of Independence',
    previousTopic: 'photosynthesis'
  });
  assert.equal(switchCls.intent, 'academic_question');
  assert.equal(switchCls.shouldRunAcademicRag, true);
});

test('Line-by-line explanation and pronunciation teaching work cleanly', async () => {
  const lbl = await routeIntelligentTutorMessage({
    message: 'Explain line by line: Inertia is the tendency of a body to resist change. External force alters velocity.',
    subject: 'Physics'
  });
  assert.equal(lbl.handledDirectly, true);
  assert.ok((lbl.lineByLineBreakdown?.length || 0) >= 2);
  assert.match(lbl.reply || '', /Line 1/i);

  const pron = await routeIntelligentTutorMessage({
    message: 'How do you pronounce Photosynthesis?',
    language: 'English'
  });
  assert.equal(pron.handledDirectly, true);
  assert.ok(pron.pronunciationGuide);
  assert.match(pron.pronunciationGuide!.syllableBreakdown, /·/);

  const lines = buildLineByLineExplanation('Force equals mass times acceleration.', 'Physics');
  assert.equal(lines.length, 1);
  const guide = buildPronunciationGuide('pronounce Namaste', 'Hindi');
  assert.equal(guide.language, 'Hindi');
});

test('DeepConceptMasteryEngine generates comprehensive topic-accurate lessons', async () => {
  const physicsLesson = await deepConceptMasteryEngine.generateDeepLesson({
    topic: "Newton's First Law",
    subject: 'Physics',
    grade: 9,
    board: 'CBSE',
    depthLevel: 'deep'
  });
  assert.equal(physicsLesson.topic, "Newton's First Law");
  assert.ok(physicsLesson.section2_definition.formalDefinition.length > 20);
  assert.ok(physicsLesson.section4_howItWorks.length >= 2);
  assert.ok(physicsLesson.section6_visualExplanation.svgMarkup.includes('<svg'));
  assert.ok(physicsLesson.section13_formulasAndRules.length >= 1);
  assert.ok(physicsLesson.section15_examPreparation.twoMarkQuestions.length >= 1);

  const historyLesson = await deepConceptMasteryEngine.generateDeepLesson({
    topic: 'Indian War of Independence',
    subject: 'History',
    grade: 10,
    board: 'CBSE',
    depthLevel: 'deep'
  });
  assert.equal(historyLesson.topic, 'Indian War of Independence');
  assert.equal(historyLesson.section13_formulasAndRules.length, 0);
});
