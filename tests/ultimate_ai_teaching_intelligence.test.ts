import test from 'node:test';
import assert from 'node:assert/strict';
import { initDatabase } from '../server/db.ts';
import {
  buildLineByLineExplanation,
  buildPronunciationGuide,
  classifyStudentMessageIntent,
  routeIntelligentTutorMessage
} from '../server/intelligentTeachingRouter.ts';

initDatabase();

test('classifyStudentMessageIntent accurately classifies greetings, social, gratitude, confusion, pronunciation, line-by-line, quiz, and academic queries', () => {
  const hi = classifyStudentMessageIntent({ message: 'Hi' });
  assert.equal(hi.intent, 'greeting');
  assert.equal(hi.shouldRunAcademicRag, false);

  const how = classifyStudentMessageIntent({ message: 'How are you?' });
  assert.equal(how.intent, 'social_chat');
  assert.equal(how.shouldRunAcademicRag, false);

  const ty = classifyStudentMessageIntent({ message: 'Thank you.' });
  assert.equal(ty.intent, 'gratitude_farewell');
  assert.equal(ty.shouldRunAcademicRag, false);

  const confused = classifyStudentMessageIntent({
    message: "I don't understand.",
    previousTopic: 'Photosynthesis'
  });
  assert.equal(confused.intent, 'confusion_clarification');
  assert.equal(confused.preservedTopic, 'Photosynthesis');

  const again = classifyStudentMessageIntent({
    message: 'Explain that again.',
    previousTopic: "Newton's Laws"
  });
  assert.equal(again.intent, 'confusion_clarification');
  assert.equal(again.preservedTopic, "Newton's Laws");

  const photo = classifyStudentMessageIntent({ message: 'Explain photosynthesis.' });
  assert.equal(photo.intent, 'academic_question');
  assert.equal(photo.shouldRunAcademicRag, true);

  const newton = classifyStudentMessageIntent({ message: "Explain Newton's Laws." });
  assert.equal(newton.intent, 'academic_question');

  const lbl = classifyStudentMessageIntent({
    message: 'Explain every line of this paragraph: Chlorophyll absorbs light. Water splits into oxygen.'
  });
  assert.equal(lbl.intent, 'line_by_line_request');

  const pron = classifyStudentMessageIntent({ message: 'Pronounce photosynthesis' });
  assert.equal(pron.intent, 'pronunciation_request');

  const quiz = classifyStudentMessageIntent({ message: 'Give me a quiz', previousTopic: 'Photosynthesis' });
  assert.equal(quiz.intent, 'quiz_request');

  const cont = classifyStudentMessageIntent({ message: 'Continue our previous lesson', previousTopic: 'Quadratic Equations' });
  assert.equal(cont.intent, 'continue_lesson');
  assert.equal(cont.preservedTopic, 'Quadratic Equations');
});

test('routeIntelligentTutorMessage handles line-by-line, pronunciation, confusion, and maximum detail teaching', async () => {
  const hiRes = await routeIntelligentTutorMessage({ message: 'Hi', studentName: 'Vishwak' });
  assert.equal(hiRes.handledDirectly, true);
  assert.ok(hiRes.reply?.includes('Vishwak'));

  const lblItems = buildLineByLineExplanation(
    'Explain every line of this paragraph: 2x + 4 = 10. Therefore x = 3.',
    'Mathematics'
  );
  assert.equal(lblItems.length, 2);
  assert.ok(lblItems[0].originalLine.includes('2x + 4 = 10'));

  const pron = buildPronunciationGuide('Pronounce photosynthesis', 'English');
  assert.equal(pron.originalText, 'photosynthesis');
  assert.ok(pron.syllableBreakdown.length > 0);
  assert.ok(pron.stressPattern.includes('Primary stress'));

  const confusedRes = await routeIntelligentTutorMessage({
    message: "I don't understand.",
    previousTopic: 'Photosynthesis',
    subject: 'Biology',
    grade: 10,
    board: 'CBSE'
  });
  assert.equal(confusedRes.handledDirectly, true);
  assert.ok(confusedRes.reply?.includes('Photosynthesis'));

  const maxRes = await routeIntelligentTutorMessage({
    message: 'Explain Newtons Laws of Motion',
    subject: 'Physics',
    grade: 10,
    board: 'CBSE',
    maximumDetailRequested: true
  });
  assert.equal(maxRes.handledDirectly, true);
  assert.ok((maxRes as any).deepLesson);
  assert.equal((maxRes as any).deepLesson.depthLevel, 'expert');
});
