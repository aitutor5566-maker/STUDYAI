import test from 'node:test';
import assert from 'node:assert/strict';
import { multiModelAiTeacherEngine } from '../server/multiModelAiTeacherEngine.ts';
import { chapterMasteryJourneyEngine } from '../server/chapterMasteryJourneyEngine.ts';

test('1. Accurate AI Teaching Engine: Subject Detection, Normal vs Exam Prep Depth, Ambiguity & Uncertainty Handling', async () => {
  // Normal Learning Mode: Class 8 Physics (Force and Pressure)
  const physNormal = await multiModelAiTeacherEngine.teach({
    question: 'Explain force and pressure with the formula P = F / A',
    grade: 8,
    board: 'CBSE',
    mode: 'detailed'
  });
  assert.equal(physNormal.subject, 'Physics');
  assert.ok(physNormal.subjectTeachingSequence.includes('Formulas'));
  assert.equal(physNormal.validation.checks.subjectRelevance.passed, true);

  // Exam Preparation Mode: must preserve conceptual teaching AND add formal definitions, comparisons, model answers
  const physExam = await multiModelAiTeacherEngine.teach({
    question: 'Explain force and pressure for board exam preparation',
    grade: 8,
    board: 'ICSE',
    mode: 'exam',
    examMarks: '5-mark'
  });
  assert.equal(physExam.subject, 'Physics');
  assert.ok(physExam.examPreparation, 'Exam Prep mode must return examPreparation payload');
  assert.ok(physExam.examPreparation.formalDefinitions.length >= 2);
  assert.ok(physExam.examPreparation.modelAnswers.length >= 2);
  assert.ok(physExam.directAnswer.length > physNormal.directAnswer.length, 'Exam Prep mode must be more comprehensive than Normal mode');

  // Class 5 Mathematics, Class 7/6 History, Class 8/10 Biology, Class 9/10 Chemistry, Class 8 English Grammar, Geography
  const mathG5 = await multiModelAiTeacherEngine.teach({ question: 'Explain multiplication and fractions with examples', grade: 4, board: 'CBSE' });
  assert.equal(mathG5.subject, 'Mathematics');

  const histG6 = await multiModelAiTeacherEngine.teach({ question: 'Explain the Indus Valley Harappan Civilization', grade: 6, board: 'CBSE' });
  assert.equal(histG6.subject, 'History');

  const bioG10 = await multiModelAiTeacherEngine.teach({ question: 'Explain photosynthesis and double circulation in life processes', grade: 10, board: 'ICSE' });
  assert.equal(bioG10.subject, 'Biology');
  assert.ok(bioG10.subjectTeachingSequence[0] === 'Definition');

  const chemG9 = await multiModelAiTeacherEngine.teach({ question: 'Explain atomic structure and Bohr 2n² model', grade: 9, board: 'ICSE' });
  assert.equal(chemG9.subject, 'Chemistry');

  const engG8 = await multiModelAiTeacherEngine.teach({ question: 'Explain active and passive voice in English grammar', grade: 8, board: 'ICSE' });
  assert.equal(engG8.subject, 'English');

  const geoG7 = await multiModelAiTeacherEngine.teach({ question: 'Explain weather and climate and barometer', grade: 7, board: 'ICSE' });
  assert.equal(geoG7.subject, 'Geography');

  // Ambiguous short query should ask 1 concise clarification instead of forcing a wrong answer
  const ambig = await multiModelAiTeacherEngine.teach({ question: 'Explain chapter 1', grade: 8, board: 'CBSE' });
  assert.equal(ambig.needsClarification, true);
  assert.ok(ambig.clarificationQuestion && ambig.clarificationQuestion.length > 20);

  // Unindexed novel topic should disclose uncertainty honestly
  const novel = await multiModelAiTeacherEngine.teach({
    question: 'Explain Quantum Chromodynamics Lattice Gauge Theory',
    subject: 'Physics',
    grade: 10,
    board: 'CBSE'
  });
  assert.ok(novel.uncertaintyDisclosure && novel.uncertaintyDisclosure.includes('not yet published'));
});

test('2. Complete 16-Stage Chapter Mastery Journey: Zero-to-Mastery, Checkpoints, Misconceptions, Assessment & Student Isolation', () => {
  const studentA = `student-mastery-a-${Date.now()}`;
  const studentB = `student-mastery-b-${Date.now()}`;

  // 1. Start Journey on CBSE Grade 8 Physics (Force and Pressure)
  const journey = chapterMasteryJourneyEngine.startOrResumeJourney({
    userId: studentA,
    query: 'Force and Pressure',
    board: 'CBSE',
    grade: 8,
    subject: 'Physics',
    teachingMode: 'normal'
  });

  assert.equal(journey.chapterMeta.board, 'CBSE');
  assert.equal(journey.chapterMeta.grade, 8);
  assert.equal(journey.chapterMeta.subject, 'Physics');
  assert.ok(journey.stages.stage1_introduction.overview.length > 50);
  assert.equal(journey.stages.stage2_zeroLevelFoundation.assumesZeroPriorKnowledge, true);
  assert.ok(journey.stages.stage3_definitionsAndTerminology.length >= 3);
  assert.ok(journey.stages.stage4_conceptByConcept.length >= 3);
  assert.ok(journey.stages.stage5_processesAndMechanisms.length >= 2);
  assert.ok(journey.stages.stage6_diagramsAndVisuals.length >= 1);
  assert.ok(journey.stages.stage8_differencesAndComparisons.length >= 1);
  assert.equal(journey.stages.stage9_formulasDerivationsNumericals.applicable, true);
  assert.ok(journey.stages.stage11_misconceptionCorrection.length >= 1);
  assert.ok(journey.stages.stage12_interactiveCheckpoints.length >= 2);
  assert.ok(journey.stages.stage15_finalAssessment.questions.length >= 2);

  // Verify opening a chapter NEVER marks topics as Mastered
  const initialStates = Object.values(journey.progress.topicStates);
  assert.ok(!initialStates.includes('Mastered'), 'Opening a chapter must never mark topics as Mastered');
  assert.equal(initialStates[0], 'Learning');

  // 2. Bookmark a topic and switch to Exam Mode — verify progress is preserved
  const firstTopic = journey.stages.stage4_conceptByConcept[0].topicTitle;
  const updatedProgress = chapterMasteryJourneyEngine.updateProgressControls({
    userId: studentA,
    chapterId: journey.chapterMeta.chapterId,
    teachingMode: 'exam',
    toggleBookmarkTopic: firstTopic,
    currentStage: 12
  });
  assert.equal(updatedProgress.teachingMode, 'exam');
  assert.ok(updatedProgress.bookmarkedTopics.includes(firstTopic));
  assert.equal(updatedProgress.currentStage, 12);

  // 3. Stage 12 Checkpoint: Incorrect answer triggers misconception diagnosis + blocks auto-advance
  const chk1 = journey.stages.stage12_interactiveCheckpoints[0];
  const wrongEval = chapterMasteryJourneyEngine.evaluateCheckpoint({
    userId: studentA,
    chapterId: journey.chapterMeta.chapterId,
    checkpointId: chk1.id,
    topicName: chk1.topicName,
    studentAnswer: 'completely wrong random answer'
  });
  assert.equal(wrongEval.isCorrect, false);
  assert.equal(wrongEval.shouldAdvance, false);
  assert.equal(wrongEval.updatedTopicState, 'Needs Revision');
  assert.ok(wrongEval.diagnosedMisconception);
  assert.ok(wrongEval.reTeachingExplanation.length > 20);

  // 4. Stage 12 Checkpoint: Correct answer marks topic Understood and allows advance
  const rightEval = chapterMasteryJourneyEngine.evaluateCheckpoint({
    userId: studentA,
    chapterId: journey.chapterMeta.chapterId,
    checkpointId: chk1.id,
    topicName: chk1.topicName,
    studentAnswer: chk1.correctAnswer
  });
  assert.equal(rightEval.isCorrect, true);
  assert.equal(rightEval.shouldAdvance, true);
  assert.equal(rightEval.updatedTopicState, 'Understood');

  // 5. Stage 15 Final Chapter Assessment: Submit full correct answers & verify Mastery Report
  const assessAnswers: Record<string, string> = {};
  const ch = journey.stages.stage14_examPreparation.questionsByType;
  journey.stages.stage15_finalAssessment.questions.forEach((q, idx) => {
    assessAnswers[q.id] = ch[idx]?.modelAnswer || 'Pressure is perpendicular force per unit area';
  });
  const report = chapterMasteryJourneyEngine.submitFinalAssessment({
    userId: studentA,
    chapterId: journey.chapterMeta.chapterId,
    answers: assessAnswers
  });
  assert.equal(report.passed, true);
  assert.ok(report.percentage >= 70);
  assert.ok(report.strongConcepts.length >= 1);

  // 6. Verify Student Data Isolation: Student B has fresh unstarted progress for the same chapter
  const journeyB = chapterMasteryJourneyEngine.startOrResumeJourney({
    userId: studentB,
    chapterId: journey.chapterMeta.chapterId
  });
  assert.equal(journeyB.progress.bookmarkedTopics.length, 0);
  assert.equal(journeyB.progress.assessmentScore, null);
  assert.equal(journeyB.progress.currentStage, 1);
});
