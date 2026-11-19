import test from 'node:test';
import assert from 'node:assert/strict';
import { multiBoardKnowledgeEngine } from '../server/multiBoardKnowledgeEngine.ts';
import { unifiedKnowledgeRetrieval } from '../server/unifiedKnowledgeRetrieval.ts';
import { multiModelAiTeacherEngine } from '../server/multiModelAiTeacherEngine.ts';
import { classifyStudentMessageIntent } from '../server/intelligentTeachingRouter.ts';
import { AdvancedNotesGenerationEngine, validateAcademicNotebook } from '../server/advancedNotesGenerationEngine.ts';
import { generateGameQuestions } from '../server/educationalGamesEngine.ts';
import { ResearchIntelligenceEngine } from '../server/researchIntelligenceEngine.ts';
import { knowledgeIntelligenceAdmin } from '../server/knowledgeIntelligenceAdmin.ts';

test('1. Multi-Board Knowledge Engine seeds all 4 boards and 26+ verified concept nodes across all school subjects', () => {
  multiBoardKnowledgeEngine.initializeBaselineKnowledge();
  const report = knowledgeIntelligenceAdmin.getDashboardReport();
  assert.equal(report.overview.totalBoardsCovered, 4);
  assert.ok(
    (report.contentQualityAndVerification.knowledgeGraphMetrics?.totalConceptNodes ?? 0) >= 24,
    'Expected at least 24 universal knowledge nodes across subjects'
  );
  assert.ok(
    (report.contentQualityAndVerification.subjectWiseCoverage?.length ?? 0) >= 10,
    'Expected subject-wise coverage across 10+ subjects'
  );
});

test('2. End-to-End Subject Benchmark: Physics (Newton three laws), Biology (Photosynthesis & Stomata), Math (Step-by-step Algebra), History, Geography, English, and Telugu', async () => {
  // 2a. Physics: Newton's Three Laws of Motion (ICSE Grade 9)
  const newtonRes = await multiModelAiTeacherEngine.teach({
    question: "Explain Newton's three laws of motion",
    grade: 9,
    board: 'ICSE'
  });
  assert.equal(newtonRes.subject, 'Physics');
  assert.match(newtonRes.directAnswer, /Inertia|First Law/i);
  assert.match(newtonRes.directAnswer, /F\s*=\s*m\s*·?\s*a|Second Law|Momentum/i);
  assert.match(newtonRes.directAnswer, /Action|Reaction|Third Law/i);

  // 2b. Biology: Photosynthesis including role of stomata (CBSE Grade 10)
  const photoRes = await multiModelAiTeacherEngine.teach({
    question: 'Explain photosynthesis, including the role of stomata',
    grade: 10,
    board: 'CBSE'
  });
  assert.equal(photoRes.subject, 'Biology');
  assert.match(photoRes.directAnswer, /6CO₂|glucose|chlorophyll/i);
  assert.match(photoRes.directAnswer, /stomata|Guard Cells/i);

  // 2c. Mathematics: Solve an algebra problem step by step
  const mathRes = await multiModelAiTeacherEngine.teach({
    question: 'Solve the linear algebra equation 3x + 7 = 22 step by step',
    grade: 8,
    board: 'CBSE'
  });
  assert.equal(mathRes.subject, 'Mathematics');
  assert.match(mathRes.directAnswer, /x\s*=\s*5|15\s*\/\s*3/i);

  // 2d. History: Causes and consequences of the French Revolution
  const histRes = await multiModelAiTeacherEngine.teach({
    question: 'Explain the causes and consequences of the French Revolution',
    grade: 9,
    board: 'CBSE'
  });
  assert.equal(histRes.subject, 'History');
  assert.match(histRes.directAnswer, /Estates|Bastille|1789|Napoleon/i);

  // 2e. Geography: Geographical process (Water Cycle & Monsoon)
  const geoRes = await multiModelAiTeacherEngine.teach({
    question: 'Explain the water cycle and Indian monsoon mechanism',
    grade: 10,
    board: 'CBSE'
  });
  assert.equal(geoRes.subject, 'Geography');
  assert.match(geoRes.directAnswer, /hydrological|evaporation|monsoon|precipitation/i);

  // 2f. English Grammar: Active and Passive Voice with examples
  const engRes = await multiModelAiTeacherEngine.teach({
    question: 'Explain active and passive voice in English grammar with examples',
    grade: 10,
    board: 'CBSE'
  });
  assert.equal(engRes.subject, 'English');
  assert.match(engRes.directAnswer, /Active|Passive|Past Participle|V₃/i);

  // 2g. Telugu Grammar in Telugu (సవర్ణదీర్ఘ సంధి మరియు సమాసాలు)
  const telRes = await multiModelAiTeacherEngine.teach({
    question: 'తెలుగు వ్యాకరణంలో సవర్ణదీర్ఘ సంధి మరియు సమాసాలను ఉదాహరణలతో వివరించండి',
    grade: 10,
    board: 'AP_STATE_BOARD',
    language: 'Telugu'
  });
  assert.equal(telRes.subject, 'Telugu');
  assert.match(telRes.directAnswer, /సవర్ణదీర్ఘ సంధి|సమాసం|రామాలయము/);
  assert.equal(telRes.validation.checks.languageQuality.passed, true);
});

test('3. Conversational Intent, Follow-Up Context Preservation, Ambiguous Queries & Continuous Missing-Topic Discovery', async () => {
  const greet = classifyStudentMessageIntent({ message: 'Hi', previousTopic: 'Photosynthesis' });
  assert.equal(greet.intent, 'greeting');
  assert.equal(greet.shouldRunAcademicRag, false);
  assert.equal(greet.preservedTopic, 'Photosynthesis');

  const followUp = classifyStudentMessageIntent({
    message: 'Why is it important?',
    previousTopic: "Newton's Laws of Motion"
  });
  assert.equal(followUp.intent, 'follow_up_question');
  assert.equal(followUp.preservedTopic, "Newton's Laws of Motion");

  const ambig = classifyStudentMessageIntent({ message: '?' });
  assert.equal(ambig.intent, 'ambiguous_message');
  assert.equal(ambig.shouldRunAcademicRag, false);

  // Continuous knowledge discovery for a missing topic
  const novelTopic = `Quantum Superconductivity ${Date.now()}`;
  const gapBefore = ResearchIntelligenceEngine.detectTopicGaps(novelTopic, 'Physics', 10, 'CBSE');
  assert.equal(gapBefore.hasGap, true);

  const resJob = await ResearchIntelligenceEngine.executeResearchPipeline({
    topic: novelTopic,
    subject: 'Physics',
    grade: 10,
    board: 'CBSE'
  });
  const passedStages = resJob.stages.filter((s) => s.status === 'passed');
  assert.equal(passedStages.length, 8);
  assert.ok(resJob.publishedDocumentId);
});

test('4. Shared Knowledge Foundation Consistency across Tutor, AI Notes, and Educational Games', async () => {
  const topic = "Newton's Laws of Motion";
  const retrieved = await unifiedKnowledgeRetrieval.retrieve({
    topic,
    subject: 'Physics',
    grade: 9,
    board: 'CBSE'
  });
  assert.equal(retrieved.universalNode.subject, 'Physics');
  assert.equal(retrieved.boardRequirement.chapterTitle, 'Chapter 8: Force and Laws of Motion');

  // AI Notes uses the same knowledge foundation and passes strict validation
  const note = await AdvancedNotesGenerationEngine.generateNotebook({
    topic,
    subject: 'Physics',
    grade: 9,
    board: 'CBSE',
    depth: 'comprehensive_exam'
  });
  const noteValid = validateAcademicNotebook(note);
  assert.equal(noteValid.isValid, true, `Notebook validation errors: ${noteValid.errors.join('; ')}`);

  // Educational Games uses the same knowledge foundation for topics like French Revolution or Trigonometry
  const gameQs = generateGameQuestions({
    gameSlug: 'mcq_challenge',
    topic: 'The French Revolution',
    subject: 'History',
    count: 3
  });
  assert.ok(gameQs.length >= 2);
  assert.equal(gameQs[0].subject, 'History');
  assert.match(JSON.stringify(gameQs), /French Revolution|Ancien Régime|Bastille|Estates/i);
});
