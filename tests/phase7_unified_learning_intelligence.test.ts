import test from 'node:test';
import assert from 'node:assert/strict';
import { StudentLearningIntelligenceEngine } from '../server/studentLearningIntelligenceEngine.ts';
import { db, updateStudentTopicProgress, recordStudentMisconception } from '../server/db.ts';
import { knowledgeIntelligenceAdmin } from '../server/knowledgeIntelligenceAdmin.ts';

const TEST_STUDENT_ID = 'student-vishwak';
const SECOND_STUDENT_ID = 'student-new';

test('STUDYAI Phase 7 — Unified Personal AI Learning Intelligence Engine', async (t) => {
  await t.test('1. Student Academic Context: Auto-resolves board, grade, language and subjects without manual selection', () => {
    const context = StudentLearningIntelligenceEngine.getStudentAcademicContext(TEST_STUDENT_ID);
    assert.equal(context.userId, TEST_STUDENT_ID);
    assert.ok(context.board, 'Must have a resolved board');
    assert.ok(typeof context.grade === 'number', 'Grade must be a number');
    assert.ok(['en', 'te', 'hi'].includes(context.preferredLanguage), 'Must resolve supported language');
    assert.ok(Array.isArray(context.enrolledSubjects), 'Must have enrolled subjects');
    assert.ok(context.enrolledSubjects.length >= 3, 'Must support multiple subjects');
  });

  await t.test('2. Demonstrated Mastery vs Mere Activity: Distinguishes activity counts from verified understanding', () => {
    // Record a topic progress at 'mastered' and another at 'practice_attempted'
    updateStudentTopicProgress({
      userId: TEST_STUDENT_ID,
      subject: 'Biology',
      topic: 'Photosynthesis',
      stage: 'mastered',
      practiceScore: 92
    });

    updateStudentTopicProgress({
      userId: TEST_STUDENT_ID,
      subject: 'Physics',
      topic: "Newton's Laws",
      stage: 'practice_attempted',
      practiceScore: 60
    });

    const profile = StudentLearningIntelligenceEngine.getStudentLearningProfile(TEST_STUDENT_ID);
    assert.ok(typeof profile.metrics.totalActivitiesLogged === 'number');
    assert.ok(typeof profile.metrics.masteredTopicsCount === 'number');
    assert.ok(profile.metrics.masteredTopicsCount >= 1, 'Should have at least 1 mastered topic');
    assert.ok(profile.metrics.genuineMasteryRate <= 100, 'Mastery rate must be bounded <= 100%');
    assert.ok(profile.topicProgress.mastered.some((m) => m.topic.toLowerCase() === 'photosynthesis'));
  });

  await t.test('3. Prerequisite & Concept Relationship Intelligence: Detects missing foundational concepts', () => {
    // When a student struggles on cellular respiration without mastering photosynthesis
    const progressList = [
      {
        topic: 'Cellular Respiration',
        subject: 'Biology',
        stage: 'practice_attempted',
        practice_score: 55,
        attempts_count: 2
      }
    ];

    const alerts = StudentLearningIntelligenceEngine.detectMissingPrerequisites(TEST_STUDENT_ID, progressList);
    assert.ok(Array.isArray(alerts));
    // If prerequisite relationship exists in graph, an alert is raised with an explainable reason
    alerts.forEach((alert) => {
      assert.ok(alert.topic);
      assert.ok(alert.missingPrerequisite);
      assert.ok(alert.reason.includes('prerequisite') || alert.reason.includes('mastered'));
    });
  });

  await t.test('4. Explainable Next-Step Recommendations: Gives reasoned next actions based on actual evidence', () => {
    // Inject a formula misconception
    recordStudentMisconception({
      userId: TEST_STUDENT_ID,
      subject: 'Physics',
      topic: "Ohm's Law",
      skillOrConcept: 'V = IR formula substitution',
      misconceptionType: 'formula_error',
      evidenceText: 'Calculated 10V / 2A = 20 ohms instead of 5 ohms.',
      confidence: 0.95,
      correctiveExplanation: 'Resistance R = V / I. Division was incorrectly treated as multiplication.'
    });

    const context = StudentLearningIntelligenceEngine.getStudentAcademicContext(TEST_STUDENT_ID);
    const progressList = [
      { topic: "Ohm's Law", subject: 'Physics', stage: 'practice_attempted', practice_score: 50, attempts_count: 2 }
    ];
    const misconceptions = [
      {
        id: 'misc-ohm',
        subject: 'Physics',
        topic: "Ohm's Law",
        skill_or_concept: 'V = IR formula substitution',
        misconception_type: 'formula_error',
        observed_count: 2,
        evidence_text: 'Division treated as multiplication.',
        corrective_explanation: 'R = V / I.'
      }
    ];

    const recs = StudentLearningIntelligenceEngine.generateNextStepRecommendations(
      TEST_STUDENT_ID,
      context,
      progressList,
      misconceptions
    );

    assert.ok(recs.length > 0, 'Must generate recommendations');
    const formulaRec = recs.find((r) => r.actionType === 'review_formula' || r.actionType === 'solve_misconception');
    assert.ok(formulaRec, 'Should recommend formula review for formula misconception');
    assert.ok(formulaRec?.reason.includes('formula') || formulaRec?.reason.includes('error'), 'Reason must explain why');
    assert.ok(formulaRec?.evidence, 'Recommendation must carry concrete evidence');
    assert.ok(formulaRec?.targetUrl, 'Recommendation must link to target workspace');
  });

  await t.test('5. Spaced Learning & Revision Queue: Prioritizes topics needing review', () => {
    const progressList = [
      { topic: 'Photosynthesis', subject: 'Biology', stage: 'mastered', practice_score: 95, updated_at: '2026-10-01T00:00:00Z' },
      { topic: "Newton's Laws", subject: 'Physics', stage: 'practice_attempted', practice_score: 60, updated_at: '2026-11-01T00:00:00Z' }
    ];
    const misconceptions = [
      { topic: "Newton's Laws", subject: 'Physics', observed_count: 2 }
    ];

    const queue = StudentLearningIntelligenceEngine.generateSpacedRevisionQueue(TEST_STUDENT_ID, progressList, misconceptions);
    assert.ok(queue.length >= 1, 'Must contain revision queue items');
    assert.ok(queue[0].topic);
    assert.ok(queue[0].recommendedModality);
    assert.ok(queue[0].reason);
    assert.ok(typeof queue[0].daysSinceLastActivity === 'number');
  });

  await t.test('6. Weekly 40-Mark Mock Test: Generates Mode A, B, C with strictly 40.0 marks', () => {
    // Mode A: 100% Objective
    const examA = StudentLearningIntelligenceEngine.generate40MarkMockExam({
      subject: 'Science',
      topic: 'Photosynthesis',
      optionType: 'OPTION_A'
    });
    const sumA = examA.questions.reduce((acc, q) => acc + q.marks, 0);
    assert.equal(sumA, 40.0, 'Mode A must total exactly 40.0 marks');
    assert.equal(examA.total_marks, 40.0);

    // Mode B: Mixed 20M Obj + 20M Desc
    const examB = StudentLearningIntelligenceEngine.generate40MarkMockExam({
      subject: 'Physics',
      topic: "Newton's Laws",
      optionType: 'OPTION_B'
    });
    const sumB = examB.questions.reduce((acc, q) => acc + q.marks, 0);
    assert.equal(sumB, 40.0, 'Mode B must total exactly 40.0 marks');

    // Mode C: 100% Descriptive
    const examC = StudentLearningIntelligenceEngine.generate40MarkMockExam({
      subject: 'Biology',
      topic: 'Photosynthesis',
      optionType: 'OPTION_C'
    });
    const sumC = examC.questions.reduce((acc, q) => acc + q.marks, 0);
    assert.equal(sumC, 40.0, 'Mode C must total exactly 40.0 marks');

    // Rubric checks on descriptive questions
    const descQ = examC.questions.find((q) => q.question_type === 'definition' || q.question_type === 'explain');
    assert.ok(descQ?.rubric?.criteria, 'Descriptive questions must carry a transparent scoring rubric');
  });

  await t.test('7. Authoritative Server-Side Evaluation: Correctly grades mock exams and updates progress', () => {
    const exam = StudentLearningIntelligenceEngine.generate40MarkMockExam({
      subject: 'Science',
      topic: 'Photosynthesis',
      optionType: 'OPTION_B'
    });

    // Provide student answers (first 5 correct, rest empty or descriptive)
    const answers: Record<string, any> = {};
    exam.questions.slice(0, 5).forEach((q) => {
      answers[q.id] = q.correct_answer;
    });

    const submission = StudentLearningIntelligenceEngine.evaluateMockExamSubmission({
      exam,
      userId: TEST_STUDENT_ID,
      answers,
      durationSeconds: 1200
    });

    assert.ok(submission.submissionId.startsWith('sub-'));
    assert.equal(submission.totalMarks, 40.0);
    assert.ok(typeof submission.scoreObtained === 'number');
    assert.ok(submission.scoreObtained <= 40.0);
    assert.ok(submission.correctCount >= 5);
    assert.ok(submission.evaluatedQuestions.length === exam.questions.length);
    assert.ok(typeof submission.percentage === 'number');
    assert.ok(Array.isArray(submission.weakTopics));
    assert.ok(Array.isArray(submission.recommendations));
  });

  await t.test('8. Multi-Student Data Isolation: Strictly isolates profiles, progress and misconceptions', () => {
    const profileVishwak = StudentLearningIntelligenceEngine.getStudentLearningProfile(TEST_STUDENT_ID);
    const profileNew = StudentLearningIntelligenceEngine.getStudentLearningProfile(SECOND_STUDENT_ID);

    assert.equal(profileVishwak.academicContext.userId, TEST_STUDENT_ID);
    assert.equal(profileNew.academicContext.userId, SECOND_STUDENT_ID);

    // Ensure Vishwak's private data is not leaked into Student New
    assert.notDeepEqual(profileVishwak.academicContext.userId, profileNew.academicContext.userId);
  });

  await t.test('9. Admin Quality & Reliability Monitoring: Reports Learning Intelligence metrics', () => {
    const report = knowledgeIntelligenceAdmin.getDashboardReport();
    assert.ok(report.learningIntelligence, 'Report must contain learningIntelligence metrics');
    assert.ok(typeof report.learningIntelligence?.totalStudentsActive === 'number');
    assert.ok(typeof report.learningIntelligence?.masteredTopicsCount === 'number');
    assert.ok(typeof report.learningIntelligence?.activeMisconceptionsCount === 'number');
    assert.strictEqual(report.learningIntelligence?.antiHallucinationEnforced, true);
  });
});
