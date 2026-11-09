import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  db,
  initDatabase,
  getStudentMisconceptions,
  recordStudentMisconception,
  resolveStudentMisconception,
  getStudentTopicProgress,
  updateStudentTopicProgress
} from '../server/db.ts';
import { StudyAiPersonalTeacherEngine } from '../server/studyAiPersonalTeacherEngine.ts';
import { knowledgeIntelligenceAdmin } from '../server/knowledgeIntelligenceAdmin.ts';

initDatabase();

test('STUDYAI Phase 4: Advanced Personal AI Tutor & Adaptive Teaching Engine', async (t) => {

  await t.test('1. Automatic Subject Detection: Accurately classifies disciplines without manual dropdowns', () => {
    // Critical Requirement: Never misclassify Physics/Maths/History as Biology
    const newton = StudyAiPersonalTeacherEngine.detectSubjectAndTopic("Explain Newton's laws of motion");
    assert.equal(newton.subject, 'Physics');
    assert.notEqual(newton.subject, 'Biology');

    const quadratic = StudyAiPersonalTeacherEngine.detectSubjectAndTopic("Solve this quadratic equation: x^2 - 5x + 6 = 0");
    assert.equal(quadratic.subject, 'Mathematics');
    assert.notEqual(quadratic.subject, 'Biology');

    const photo = StudyAiPersonalTeacherEngine.detectSubjectAndTopic("What is photosynthesis and how does chlorophyll function?");
    assert.equal(photo.subject, 'Biology');

    const rev = StudyAiPersonalTeacherEngine.detectSubjectAndTopic("What is the French Revolution and the storming of the Bastille?");
    assert.equal(rev.subject, 'History');
    assert.notEqual(rev.subject, 'Biology');

    const bond = StudyAiPersonalTeacherEngine.detectSubjectAndTopic("Explain chemical bonding between sodium and chlorine");
    assert.equal(bond.subject, 'Chemistry');

    const water = StudyAiPersonalTeacherEngine.detectSubjectAndTopic("Explain the global water cycle, evaporation and rainfall");
    assert.equal(water.subject, 'Geography');
  });

  await t.test('2. Ambiguous Topic Disambiguation: Asks one focused clarification without forcing assumptions', () => {
    const cellAmbiguous = StudyAiPersonalTeacherEngine.detectSubjectAndTopic("cell");
    assert.equal(cellAmbiguous.isAmbiguous, true);
    assert.ok(cellAmbiguous.clarificationPrompt?.includes('biological') || cellAmbiguous.clarificationPrompt?.includes('battery'));

    const workAmbiguous = StudyAiPersonalTeacherEngine.detectSubjectAndTopic("work");
    assert.equal(workAmbiguous.isAmbiguous, true);
    assert.ok(workAmbiguous.clarificationPrompt?.includes('Physics') || workAmbiguous.clarificationPrompt?.includes('mechanical'));
  });

  await t.test('3. Normal Learning Mode: Clear pedagogical explanation with understanding check', async () => {
    const studentContext = {
      studentId: 'student-vishwak',
      studentName: 'Vishwak',
      grade: 10,
      board: 'CBSE',
      preferredLanguage: 'en' as const
    };

    const response = await StudyAiPersonalTeacherEngine.teachConcept({
      question: 'What is photosynthesis?',
      studentContext,
      mode: 'learning'
    });

    assert.equal(response.subject, 'Biology');
    assert.equal(response.mode, 'learning');
    assert.ok(response.teacherGreeting.includes('Vishwak'));
    assert.ok(response.explanation.introduction.length > 20);
    assert.ok(response.explanation.coreDefinition.includes('6CO₂') || response.explanation.coreDefinition.includes('glucose'));
    assert.ok(response.explanation.keyTerms.length >= 2);
    assert.ok(response.explanation.stepByStepTeaching.length >= 3);
    assert.ok(response.explanation.realWorldApplication.length > 10);
    assert.ok(response.understandingCheck, 'Normal mode must include an interactive understanding check');
    assert.equal(response.understandingCheck?.questionType, 'mcq');
    assert.ok(response.understandingCheck?.options && response.understandingCheck.options.length >= 3);
  });

  await t.test('4. Deep Exam-Preparation Mode: Comprehensive academic breakdown with exam questions and NO equations in History', async () => {
    const studentContext = {
      studentId: 'student-vishwak',
      studentName: 'Vishwak',
      grade: 10,
      board: 'ICSE',
      preferredLanguage: 'en' as const
    };

    // Deep Exam Prep for Physics
    const physicsResponse = await StudyAiPersonalTeacherEngine.teachConcept({
      question: 'Explain Newton\'s Second Law of Motion in detail',
      studentContext,
      mode: 'exam'
    });

    assert.equal(physicsResponse.subject, 'Physics');
    assert.equal(physicsResponse.mode, 'exam');
    assert.ok(physicsResponse.explanation.formulasAndDerivations, 'Physics exam mode must provide formulas & derivations');
    assert.ok(physicsResponse.explanation.commonMisconceptions && physicsResponse.explanation.commonMisconceptions.length > 0);
    assert.ok(physicsResponse.explanation.examQuestions && physicsResponse.explanation.examQuestions.length >= 2);
    assert.ok(physicsResponse.explanation.revisionSummary && physicsResponse.explanation.revisionSummary.length >= 2);

    // Deep Exam Prep for History - Anti-Hallucination: Must NOT contain math formulas!
    const historyResponse = await StudyAiPersonalTeacherEngine.teachConcept({
      question: 'Explain the French Revolution causes and estates',
      studentContext,
      mode: 'exam'
    });

    assert.equal(historyResponse.subject, 'History');
    assert.equal(historyResponse.explanation.formulasAndDerivations, undefined, 'History exam prep must NEVER include math formulas!');
    assert.equal(historyResponse.explanation.solvedNumerical, undefined, 'History exam prep must NEVER include numerical calculations!');
    assert.ok(historyResponse.explanation.examQuestions && historyResponse.explanation.examQuestions.length >= 2);
  });

  await t.test('5. Advanced 10-Step Numerical Solving Engine: Physics & Mathematics accuracy', () => {
    // Case 1: Physics F = m * a
    const physicsProblem = "A 5 kg mass accelerates at 2 m/s^2 on a frictionless track. Calculate the net force.";
    const solution = StudyAiPersonalTeacherEngine.solveNumericalProblem(physicsProblem, 'Physics', 10);

    assert.equal(solution.subject, 'Physics');
    assert.equal(solution.step4_governingFormula, 'F = m × a');
    assert.equal(solution.step8_finalResult, 10);
    assert.ok(solution.step9_canonicalUnit.includes('N') || solution.step9_canonicalUnit.includes('Newton'));
    assert.ok(solution.step10_realityCheck.length > 10);
    assert.equal(solution.isIncompleteProblem, undefined);

    // Case 2: Incomplete problem statement - Anti-hallucination guardrail
    const incompleteProblem = "Calculate acceleration of a car.";
    const incompleteSolution = StudyAiPersonalTeacherEngine.solveNumericalProblem(incompleteProblem, 'Physics', 10);
    assert.equal(incompleteSolution.isIncompleteProblem, true);
    assert.ok(incompleteSolution.missingDataReason?.includes('Neither'));
  });

  await t.test('6. Adaptive Understanding Evaluation: Evaluates correct and partially correct responses honestly', () => {
    const testUserId = `test-student-${Date.now()}`;

    // Exact Correct Answer
    const correctEval = StudyAiPersonalTeacherEngine.evaluateStudentAnswer({
      userId: testUserId,
      topic: 'Photosynthesis',
      subject: 'Biology',
      question: 'Which molecule is split to produce oxygen during photolysis?',
      studentAnswer: 'Water (H2O) via photolysis',
      correctAnswer: 'Water (H2O) via Photolysis',
      explanation: 'Photolysis of water splits H2O into protons, electrons and oxygen.'
    });

    assert.equal(correctEval.isCorrect, true);
    assert.equal(correctEval.score, 100);
    assert.equal(correctEval.updatedProgressStage, 'understanding_demonstrated');

    // Partial Answer
    const partialEval = StudyAiPersonalTeacherEngine.evaluateStudentAnswer({
      userId: testUserId,
      topic: 'Photosynthesis',
      subject: 'Biology',
      question: 'Which molecule is split to produce oxygen during photolysis?',
      studentAnswer: 'water molecule',
      correctAnswer: 'Water (H2O) via Photolysis',
      explanation: 'Photolysis of water splits H2O into protons, electrons and oxygen.'
    });

    assert.ok(partialEval.isPartiallyCorrect);
    assert.equal(partialEval.score, 65);
    assert.equal(partialEval.updatedProgressStage, 'practice_attempted');
  });

  await t.test('7. Misconception & Weakness Detection: Records evidence-based misconception and resolves upon improvement', () => {
    const testUserId = `test-student-misc-${Date.now()}`;

    // Student makes an error: Confusing oxygen origin
    const incorrectEval = StudyAiPersonalTeacherEngine.evaluateStudentAnswer({
      userId: testUserId,
      topic: 'Photosynthesis',
      subject: 'Biology',
      question: 'Which molecule is split to produce oxygen during photolysis?',
      studentAnswer: 'Carbon Dioxide (CO2)',
      correctAnswer: 'Water (H2O) via Photolysis',
      explanation: 'Oxygen released during photosynthesis comes entirely from water splitting, not from CO2 reduction.'
    });

    assert.equal(incorrectEval.isCorrect, false);
    assert.equal(incorrectEval.score, 40);
    assert.ok(incorrectEval.misconceptionDetected);

    // Verify misconception is recorded in database
    const recorded = getStudentMisconceptions(testUserId, 'Biology', 'active');
    assert.ok(recorded.length > 0, 'Active misconception must be saved in database');
    assert.equal(recorded[0].topic, 'Photosynthesis');
    assert.ok(recorded[0].evidence_text.includes('Carbon Dioxide'));

    // Student studies and later answers correctly
    const followUpCorrect = StudyAiPersonalTeacherEngine.evaluateStudentAnswer({
      userId: testUserId,
      topic: 'Photosynthesis',
      subject: 'Biology',
      question: 'Which molecule is split to produce oxygen during photolysis?',
      studentAnswer: 'Water (H2O) via Photolysis',
      correctAnswer: 'Water (H2O) via Photolysis',
      explanation: 'Photolysis of water splits H2O into protons, electrons and oxygen.'
    });

    assert.equal(followUpCorrect.isCorrect, true);

    // Verify misconception status is updated to 'resolved'
    const activeAfter = getStudentMisconceptions(testUserId, 'Biology', 'active');
    assert.equal(activeAfter.length, 0, 'Misconception must be resolved after demonstrating understanding');
  });

  await t.test('8. Progress Tracking: Viewing an explanation does NOT falsely grant mastery', async () => {
    const testUserId = `test-student-prog-${Date.now()}`;

    // 1. Initial view/explanation
    await StudyAiPersonalTeacherEngine.teachConcept({
      question: 'Explain Electric Resistance',
      studentContext: {
        studentId: testUserId,
        grade: 10,
        board: 'CBSE'
      },
      mode: 'learning'
    });

    const progressAfterTeach = getStudentTopicProgress(testUserId, 'Physics');
    assert.ok(progressAfterTeach.length > 0);
    assert.equal(progressAfterTeach[0].stage, 'explained', 'Opening explanation must only reach "explained", NOT "mastered"');

    // 2. Demonstrating understanding upgrades stage
    updateStudentTopicProgress({
      userId: testUserId,
      subject: 'Physics',
      topic: 'Electric Resistance',
      stage: 'understanding_demonstrated',
      practiceScore: 90
    });

    const progressAfterCheck = getStudentTopicProgress(testUserId, 'Physics');
    assert.equal(progressAfterCheck[0].stage, 'understanding_demonstrated');
  });

  await t.test('9. Document & Image Question Parser: Rejects illegible scans without hallucination', () => {
    const studentContext = {
      studentId: 'student-vishwak',
      grade: 10,
      board: 'CBSE'
    };

    // Illegible or blurry image
    const illegible = StudyAiPersonalTeacherEngine.parseDocumentQuestion({
      imageBase64OrText: '',
      isLegible: false,
      studentContext
    });
    assert.equal(illegible.isLegible, false);
    assert.ok(illegible.clarificationNeeded?.includes('blurry'));

    // Legible textbook physics question
    const legible = StudyAiPersonalTeacherEngine.parseDocumentQuestion({
      imageBase64OrText: 'Calculate the current flowing through a 10 ohm resistor connected to a 12V battery.',
      isLegible: true,
      studentContext
    });
    assert.equal(legible.isLegible, true);
    assert.equal(legible.detectedSubject, 'Physics');
  });

  await t.test('10. Multi-Turn Lesson Memory: Resolves pronouns and subtopic references across turns', () => {
    const turn1 = StudyAiPersonalTeacherEngine.detectSubjectAndTopic("Explain Newton's laws of motion");
    assert.equal(turn1.subject, 'Physics');
    assert.ok(turn1.topic.includes('Newton'));

    // Student asks follow-up with pronoun / relative reference
    const turn2 = StudyAiPersonalTeacherEngine.detectSubjectAndTopic("Give examples", {
      recentTopic: turn1.topic,
      recentSubject: turn1.subject
    });
    assert.equal(turn2.subject, 'Physics');
    assert.equal(turn2.topic, turn1.topic, 'Turn 2 must preserve active topic context');

    const turn3 = StudyAiPersonalTeacherEngine.detectSubjectAndTopic("Explain the second one", {
      recentTopic: turn1.topic,
      recentSubject: turn1.subject
    });
    assert.equal(turn3.subject, 'Physics');
    assert.equal(turn3.topic, turn1.topic, 'Turn 3 must preserve active topic context');
  });

  await t.test('11. Multilingual Support: Preserves scientific formulas in Telugu and Hindi', async () => {
    const studentTe = {
      studentId: 'student-te',
      grade: 10,
      board: 'AP_STATE_BOARD',
      preferredLanguage: 'te' as const
    };

    const responseTe = await StudyAiPersonalTeacherEngine.teachConcept({
      question: 'What is photosynthesis?',
      studentContext: studentTe,
      mode: 'learning'
    });

    assert.equal(responseTe.language, 'te');
    assert.ok(responseTe.explanation.coreDefinition.includes('6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂'), 'Must preserve chemical equation intact');
    assert.ok(responseTe.visualPlan?.localizedLabels.some(l => l.label.includes('హరితరేణువు') || l.label.includes('పొర')));
  });

  await t.test('12. Knowledge Intelligence Admin Dashboard incorporates AI Tutor Telemetry', () => {
    const report = knowledgeIntelligenceAdmin.getDashboardReport();
    assert.ok(report.tutorIntelligence, 'Report must contain tutorIntelligence telemetry');
    assert.ok(typeof report.tutorIntelligence.totalConversations === 'number');
    assert.ok(typeof report.tutorIntelligence.activeMisconceptionsCount === 'number');
    assert.ok(typeof report.tutorIntelligence.topicStageBreakdown === 'object');
    assert.ok('viewed' in report.tutorIntelligence.topicStageBreakdown);
    assert.ok('mastered' in report.tutorIntelligence.topicStageBreakdown);
  });
});
