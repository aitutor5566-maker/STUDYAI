import test from 'node:test';
import assert from 'node:assert/strict';
import { initDatabase } from '../server/db.ts';
import {
  classifyTeachingIntent,
  multiModelAiTeacherEngine,
  verifyChemicalEquationBalance
} from '../server/multiModelAiTeacherEngine.ts';

initDatabase();

test('classifyTeachingIntent routes Math, Physics, Chemistry, Exam Prep, and Quick Answers accurately', () => {
  const math = classifyTeachingIntent('Solve x^2 - 5x + 6 = 0 for x');
  assert.equal(math.subject, 'Mathematics');
  assert.equal(math.questionType, 'numerical_math');

  const physics = classifyTeachingIntent('Calculate the force on a 5 kg mass with acceleration 3 m/s^2');
  assert.equal(physics.subject, 'Physics');
  assert.equal(physics.questionType, 'numerical_physics');

  const chem = classifyTeachingIntent('Balance H2 + O2 -> H2O');
  assert.equal(chem.subject, 'Chemistry');
  assert.equal(chem.questionType, 'chemistry_equation_or_numerical');

  const exam = classifyTeachingIntent('Explain Photosynthesis', 'Biology', 'exam');
  assert.equal(exam.subject, 'Biology');
  assert.equal(exam.questionType, 'exam_prep');

  const quick = classifyTeachingIntent('Define osmosis', 'Biology', 'quick');
  assert.equal(quick.questionType, 'quick_answer');
});

test('verifyChemicalEquationBalance deterministically detects balanced vs unbalanced equations', () => {
  const balanced = verifyChemicalEquationBalance('2H2 + O2 -> 2H2O');
  assert.ok(balanced);
  assert.equal(balanced.isBalanced, true);
  assert.equal(balanced.reactantAtoms.H, 4);
  assert.equal(balanced.productAtoms.H, 4);

  const unbalanced = verifyChemicalEquationBalance('Fe + HCl -> FeCl2 + H2');
  assert.ok(unbalanced);
  assert.equal(unbalanced.isBalanced, false);
  assert.ok(unbalanced.details.includes('Unbalanced'));
});

test('multiModelAiTeacherEngine reports real module status and teaches Biology, Chemistry & Math with validation', async () => {
  const status = await multiModelAiTeacherEngine.getModuleStatus();
  assert.equal(status.modules.qwen25Brain.fineTuned, false);
  assert.ok(status.modules.gptKnowledgeBank.ragStore.includes('SQLite'));

  const bioRes = await multiModelAiTeacherEngine.teach({
    question: 'Explain Photosynthesis for Grade 10',
    subject: 'Biology',
    topic: 'Photosynthesis',
    grade: 10,
    board: 'CBSE',
    mode: 'detailed'
  });
  assert.equal(bioRes.subject, 'Biology');
  assert.ok(bioRes.universalSections);
  assert.ok(bioRes.universalSections.memoryTechniques.mnemonic.length > 10);
  assert.ok(bioRes.universalSections.testYourUnderstanding.length >= 2);
  assert.ok(bioRes.routing.modulesUsed.includes('curriculum_rag'));

  const chemRes = await multiModelAiTeacherEngine.teach({
    question: 'Check balance: Fe + HCl -> FeCl2 + H2',
    subject: 'Chemistry',
    grade: 10,
    board: 'ICSE'
  });
  assert.equal(chemRes.questionType, 'chemistry_equation_or_numerical');
  assert.ok(chemRes.chemicalEquationCheck);
  assert.equal(chemRes.chemicalEquationCheck.isBalanced, false);
  assert.ok(chemRes.numericalSolution);
});
