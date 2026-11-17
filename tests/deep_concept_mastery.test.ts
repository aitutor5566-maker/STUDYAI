import test from 'node:test';
import assert from 'node:assert/strict';
import { initDatabase } from '../server/db.ts';
import { deepConceptMasteryEngine } from '../server/deepConceptMasteryEngine.ts';

initDatabase();

test('DeepConceptMasteryEngine generates complete 17-section lessons across all 6 acceptance subjects', async () => {
  const cases = [
    { topic: 'Photosynthesis', subject: 'Biology', expectFormula: false },
    { topic: "Newton's Laws of Motion", subject: 'Physics', expectFormula: true },
    { topic: 'Quadratic Equations', subject: 'Mathematics', expectFormula: true },
    { topic: 'French Revolution', subject: 'History', expectFormula: false },
    { topic: 'Indian Monsoon', subject: 'Geography', expectFormula: false },
    { topic: 'Computer Networks', subject: 'Computer Science', expectFormula: false }
  ];

  for (const c of cases) {
    const lesson = await deepConceptMasteryEngine.generateDeepLesson({
      topic: c.topic,
      subject: c.subject,
      grade: 10,
      board: 'CBSE',
      depthLevel: 'deep'
    });

    assert.equal(lesson.topic, c.topic);
    assert.ok(lesson.section2_definition.formalDefinition.length > 15);
    assert.ok(lesson.section4_howItWorks.length >= 3);
    assert.ok(lesson.section5_components.length >= 2);
    assert.ok(lesson.section6_visualExplanation.svgMarkup.includes('<svg'));
    assert.ok(lesson.section7_subtopics.length >= 2);
    assert.ok(lesson.section15_examPreparation.twoMarkQuestions.length >= 1);
    assert.ok(lesson.section17_masteryAssessment.length >= 2);
    if (c.expectFormula) {
      assert.ok(lesson.section13_formulasAndRules.length >= 1, `${c.subject} should include formulas`);
    } else {
      assert.equal(lesson.section13_formulasAndRules.length, 0, `${c.subject} should not force irrelevant formulas`);
    }
  }
});
