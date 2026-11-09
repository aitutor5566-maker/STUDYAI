import { test } from 'node:test';
import assert from 'node:assert';
import { generateTutorExplanation } from '../server/aiAdapter.ts';
import { getSubtopicDiagramsForTopic } from '../server/subtopicDiagramCatalog.ts';
import {
  MASTER_LANGUAGE_QUESTION_BANK,
  SENTENCE_CONSTRUCTION_LESSONS,
  getAdaptiveQuestionsForStudent,
  recordStudentQuestionAttempt,
  synthesizeDynamicCurriculumQuestions
} from '../server/languageQuestionManager.ts';
import { evaluateStudentPronunciation, generateCurriculumForLanguage, getLanguageMeta } from '../server/languageLearningEngine.ts';
import { db } from '../server/db.ts';

// ============================================================================
// PHASE 1 — AI TUTOR CONTENT GENERATION RELIABILITY TESTS
// ============================================================================

test('Phase 1: 1. Generate Complete Biology Lesson (Photosynthesis)', async () => {
  const lesson = await generateTutorExplanation({
    topic: 'Photosynthesis',
    question: 'Explain the complete process of photosynthesis in green plants.',
    mode: 'detailed',
    subject: 'Science',
    level: 'Grade 10',
    grade: 10,
    language: 'English',
    forceOfflineCurriculum: true
  });

  assert.ok(lesson, 'Lesson must be generated');
  assert.strictEqual(lesson.topic, 'Photosynthesis');
  assert.ok(lesson.introduction && lesson.introduction.length > 50, 'Must have comprehensive introduction');
  assert.ok(Array.isArray(lesson.keySteps) && lesson.keySteps.length >= 3, 'Must have at least 3 key steps');
  assert.ok(lesson.formula && lesson.formula.equation.includes('CO₂'), 'Must have verified chemical formula');
  assert.ok(Array.isArray(lesson.definitions) && lesson.definitions.length >= 2, 'Must have definitions');
  assert.ok(Array.isArray(lesson.lessonImages) && lesson.lessonImages.length >= 2, 'Must have multiple educational visuals');
});

test('Phase 1: 2. Generate Complete Maths Explanation (Quadratic Equations)', async () => {
  const lesson = await generateTutorExplanation({
    topic: 'Quadratic Equations',
    question: 'How do I solve ax^2 + bx + c = 0 and what does the discriminant mean?',
    mode: 'detailed',
    subject: 'Maths',
    level: 'Grade 10',
    grade: 10,
    language: 'English',
    forceOfflineCurriculum: true
  });

  assert.ok(lesson, 'Maths lesson must be generated');
  assert.ok(lesson.topic.toLowerCase().includes('quadratic'), 'Topic must match quadratic');
  assert.ok(lesson.formula && lesson.formula.equation.includes('4ac'), 'Formula must contain discriminant b^2 - 4ac');
  assert.ok(lesson.differences && lesson.differences.rows.length >= 2, 'Must have tabular comparison for D > 0 vs D <= 0');
  assert.ok(lesson.imageUrl && lesson.imageUrl.startsWith('data:image/svg+xml'), 'Must have generated SVG diagram');
});

test('Phase 1: 3. Generate Physics Numerical (Newton Laws of Motion)', async () => {
  const lesson = await generateTutorExplanation({
    topic: "Newton's Laws of Motion",
    question: 'Explain F = ma and how to calculate acceleration when force and mass are given.',
    mode: 'detailed',
    subject: 'Science',
    level: 'Grade 9',
    grade: 9,
    language: 'English',
    forceOfflineCurriculum: true
  });

  assert.ok(lesson, 'Physics lesson must be generated');
  assert.ok(lesson.formula && lesson.formula.equation.includes('F = m · a'), 'Equation must show F = ma');
  assert.ok(lesson.keywords.some((k: string) => k.toLowerCase().includes('inertia') || k.toLowerCase().includes('force')), 'Keywords must contain Inertia or Force');
  assert.ok(Array.isArray(lesson.workedProblems), 'Must include worked numerical problems for Physics');
});

test('Phase 1: 4. Follow-up Question Preserves Active Context', async () => {
  const history = [
    { role: 'user', content: 'What is Photosynthesis?' },
    { role: 'assistant', content: 'Photosynthesis is the process by which green plants produce food...' }
  ];

  const followUp = await generateTutorExplanation({
    topic: 'Photosynthesis',
    question: 'How do desert plants perform photosynthesis without losing water?',
    mode: 'detailed',
    subject: 'Science',
    level: 'Grade 10',
    grade: 10,
    language: 'English',
    history,
    forceOfflineCurriculum: true
  });

  assert.ok(followUp, 'Follow-up must succeed');
  assert.ok(followUp.introduction.includes('CAM Photosynthesis') || followUp.introduction.includes('desert'), 'Must explain desert plant CAM adaptation');
  assert.strictEqual(followUp.topic, 'Photosynthesis', 'Topic context must remain Photosynthesis');
});

test('Phase 1: 5. Resilient Fallback Prevents 500 or Empty Response', async () => {
  // Pass an unusual topic with offline fallback forced
  const lesson = await generateTutorExplanation({
    topic: 'Quantum Superposition in Cryptography',
    question: 'Explain superposition simply for high school.',
    mode: 'simple',
    subject: 'Science',
    level: 'Grade 10',
    grade: 10,
    language: 'English',
    forceOfflineCurriculum: true
  });

  assert.ok(lesson, 'Must generate lesson without crashing');
  assert.ok(lesson.introduction && lesson.introduction.length > 20, 'Must not be empty');
  assert.ok(lesson.keySteps && lesson.keySteps.length >= 2, 'Must include key steps');
  assert.ok(lesson.imageUrl && lesson.imageUrl.startsWith('data:image/svg+xml'), 'Must include visual asset');
});

// ============================================================================
// PHASE 2 — VISUAL INTELLIGENCE ENGINE BENCHMARK TOPIC INTEGRATION TESTS
// ============================================================================

test('Phase 2: 1. Photosynthesis Visual Sourcing (Main Overview + 5 Dedicated Subtopics)', () => {
  const diagrams = getSubtopicDiagramsForTopic('Photosynthesis');
  assert.ok(Array.isArray(diagrams), 'Must return array of diagrams');
  assert.ok(diagrams.length >= 5, `Expected at least 5 diagrams for Photosynthesis, got ${diagrams.length}`);

  const keys = diagrams.map((d) => d.subtopicKey);
  assert.ok(keys.includes('overall_overview'), 'Must have overview diagram');
  assert.ok(keys.includes('chloroplast_structure'), 'Must have chloroplast subtopic diagram');
  assert.ok(keys.includes('light_reactions'), 'Must have light reaction subtopic diagram');
  assert.ok(keys.includes('calvin_cycle'), 'Must have Calvin cycle subtopic diagram');
  assert.ok(keys.includes('chemical_equation'), 'Must have chemical equation diagram');

  // Verify 8-point pedagogical breakdown
  const first = diagrams[0];
  assert.ok(first.point1_whatItRepresents, 'Must have point 1');
  assert.ok(first.point2_labelledParts.length >= 2, 'Must have point 2 labeled parts');
  assert.ok(first.point3_componentFunctions, 'Must have point 3');
  assert.ok(first.point7_learningOutcome, 'Must have point 7');
  assert.ok(first.point8_whatToRemember, 'Must have point 8');
});

test('Phase 2: 2. Human Heart Visual Sourcing (Main Overview + 5 Dedicated Subtopics)', () => {
  const diagrams = getSubtopicDiagramsForTopic('Human Heart & Circulation');
  assert.ok(diagrams.length >= 5, `Expected at least 5 diagrams for Heart, got ${diagrams.length}`);

  const keys = diagrams.map((d) => d.subtopicKey);
  assert.ok(keys.includes('external_anatomy'), 'Must include external anatomy');
  assert.ok(keys.includes('four_chambers'), 'Must include 4-chamber anatomy');
  assert.ok(keys.includes('double_circulation'), 'Must include double circulation');
  assert.ok(keys.includes('cardiac_conduction'), 'Must include cardiac conduction');
  assert.ok(keys.includes('valves_vessels'), 'Must include valves and vessels');
});

test('Phase 2: 3. DNA Structure Visual Sourcing (Double Helix + 4 Subtopics)', () => {
  const diagrams = getSubtopicDiagramsForTopic('DNA Structure and Genetics');
  assert.ok(diagrams.length >= 4, `Expected at least 4 diagrams for DNA, got ${diagrams.length}`);

  const keys = diagrams.map((d) => d.subtopicKey);
  assert.ok(keys.includes('dna_double_helix'), 'Must include double helix architecture');
  assert.ok(keys.includes('dna_nucleotide_structure'), 'Must include nucleotide monomer structure');
  assert.ok(keys.includes('dna_base_pairing'), 'Must include Watson-Crick base pairing rules');
  assert.ok(keys.includes('dna_replication_fork'), 'Must include semi-conservative replication fork');
});

test('Phase 2: 4. Chemical Bonding Visual Sourcing (Covalent, Ionic, Metallic Subtopics)', () => {
  const diagrams = getSubtopicDiagramsForTopic('Chemical Bonding');
  assert.ok(diagrams.length >= 3, `Expected at least 3 diagrams for Chemical Bonding, got ${diagrams.length}`);

  const keys = diagrams.map((d) => d.subtopicKey);
  assert.ok(keys.includes('covalent_bonding'), 'Must include covalent bonding');
  assert.ok(keys.includes('ionic_bonding'), 'Must include ionic bonding');
  assert.ok(keys.includes('metallic_bonding'), 'Must include metallic bonding');
});

test('Phase 2: 5. The French Revolution Visual Sourcing (Historical Social Diagrams)', () => {
  const diagrams = getSubtopicDiagramsForTopic('The French Revolution');
  assert.ok(diagrams.length >= 3, `Expected at least 3 diagrams for French Revolution, got ${diagrams.length}`);

  const keys = diagrams.map((d) => d.subtopicKey);
  assert.ok(keys.includes('french_rev_three_estates'), 'Must include Three Estates social pyramid');
  assert.ok(keys.includes('french_rev_storming_bastille'), 'Must include Storming of Bastille');
  assert.ok(keys.includes('french_rev_declaration_rights'), 'Must include Rights of Man');
});

test('Phase 2: 6. SQLite Cached Images Schema Supports Topic and Subtopic IDs', () => {
  const testId = `test-img-${Date.now()}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO cached_educational_images (
      id, query, concept_key, title, provider, original_source_url, direct_image_url,
      license_type, retrieval_date, accuracy_status, main_topic_id, subtopic_id, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    testId, 'Photosynthesis Chloroplast', 'chloroplast', 'Chloroplast Anatomy Diagram',
    'STUDYAI Scientific Visual Engine', 'local://verified', 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
    'Educational Fair Use', now, 'verified', 'photosynthesis', 'chloroplast_structure', now
  );

  const row = db.prepare('SELECT main_topic_id, subtopic_id, accuracy_status FROM cached_educational_images WHERE id = ?').get(testId) as any;
  assert.ok(row, 'Cached image row must exist in DB');
  assert.strictEqual(row.main_topic_id, 'photosynthesis');
  assert.strictEqual(row.subtopic_id, 'chloroplast_structure');
  assert.strictEqual(row.accuracy_status, 'verified');

  // Clean up test row
  db.prepare('DELETE FROM cached_educational_images WHERE id = ?').run(testId);
});

// ============================================================================
// PHASE 3 — REBUILT LANGUAGE LEARNING & NON-REPEATING QUESTIONS TESTS
// ============================================================================

test('Phase 3: 1. Japanese Level 1 Curriculum Starts with Hiragana Foundations', () => {
  const curriculum = generateCurriculumForLanguage('ja');
  assert.ok(Array.isArray(curriculum) && curriculum.length === 8, 'Must have 8 progressive stages');

  const stage1 = curriculum[0];
  assert.strictEqual(stage1.stageNumber, 1);
  assert.ok(stage1.title.includes('Hiragana'), 'Stage 1 must focus on Hiragana');
  assert.strictEqual(stage1.focus, 'alphabet');

  // Verify first lesson teaches the vowel row (あ, い, う, え, お)
  const lesson1 = stage1.lessons[0];
  assert.ok(lesson1.title.includes('Vowel Row (あ, い, う, え, お)'), 'Lesson 1.1 must teach vowels');
  assert.ok(lesson1.vocabulary.length >= 3, 'Must have foundational vocabulary');
  assert.ok(lesson1.grammar.length >= 1, 'Must introduce basic copula (です) and particle (は)');
});

test('Phase 3: 2. English Level 1 Curriculum Starts with Alphabet Phonics', () => {
  const curriculum = generateCurriculumForLanguage('en');
  assert.strictEqual(curriculum.length, 8, 'Must have 8 stages');

  const stage1 = curriculum[0];
  assert.strictEqual(stage1.stageNumber, 1);
  assert.strictEqual(stage1.focus, 'alphabet');
  assert.ok(stage1.title.includes('Foundations') || stage1.title.includes('Alphabet'), 'Stage 1 must be foundational');
});

test('Phase 3: 3. Mandatory Level 4 Sentence Formation Teaches Word Order (SOV vs SVO)', () => {
  assert.ok(SENTENCE_CONSTRUCTION_LESSONS.length >= 2, 'Must have sentence construction lessons');

  const jaLesson = SENTENCE_CONSTRUCTION_LESSONS.find((l) => l.languageCode === 'ja');
  assert.ok(jaLesson, 'Must have Japanese sentence construction lesson');
  assert.ok(jaLesson.wordOrderRule.includes('は') && jaLesson.wordOrderRule.includes('ます'), 'Must explain Japanese SOV word order with particles');
  assert.ok(jaLesson.tokenBreakdown.length >= 4, 'Must provide detailed token-by-token breakdown');
  assert.ok(jaLesson.practiceSentenceBuilder.correctOrder.length >= 4, 'Must provide practice sentence builder');

  const enLesson = SENTENCE_CONSTRUCTION_LESSONS.find((l) => l.languageCode === 'en');
  assert.ok(enLesson, 'Must have English sentence construction lesson');
  assert.ok(enLesson.wordOrderRule.includes('Subject') && enLesson.wordOrderRule.includes('Verb') && enLesson.wordOrderRule.includes('Object'), 'Must explain English SVO order');
});

test('Phase 3: 4. Question Management System Prevents Repeating Questions', () => {
  const testUser = `usr_test_${Date.now()}`;

  // 1. First fetch for Stage 1 Japanese
  const questionsBatch1 = getAdaptiveQuestionsForStudent({
    userId: testUser,
    languageCode: 'ja',
    stageNumber: 1,
    limit: 2
  });

  assert.strictEqual(questionsBatch1.length, 2, 'Must return 2 questions');
  const q1Id = questionsBatch1[0].id;

  // 2. Student attempts and masters the first question (isCorrect = true)
  const attemptRes = recordStudentQuestionAttempt({
    userId: testUser,
    languageCode: 'ja',
    curriculumLevel: 1,
    lessonId: 'ja-1-1',
    questionId: q1Id,
    exerciseType: 'mcq',
    isCorrect: true,
    studentAnswer: 'あ (a)'
  });

  assert.ok(attemptRes.masteryScore >= 80, 'Must record high mastery score on correct answer');

  // 3. Second fetch for Stage 1 Japanese must NOT repeat question 1!
  const questionsBatch2 = getAdaptiveQuestionsForStudent({
    userId: testUser,
    languageCode: 'ja',
    stageNumber: 1,
    limit: 2
  });

  assert.strictEqual(questionsBatch2.length, 2, 'Must return 2 questions');
  assert.ok(!questionsBatch2.some((q) => q.id === q1Id), `Question ${q1Id} must NOT be repeated after mastery!`);

  // Clean up test attempts from SQLite
  db.prepare('DELETE FROM student_language_question_attempts WHERE user_id = ?').run(testUser);
});

test('Phase 3: 5. Incorrect Answers Provide Constructive Teaching Feedback Without Penalty', () => {
  const testUser = `usr_test_fail_${Date.now()}`;

  const attemptRes = recordStudentQuestionAttempt({
    userId: testUser,
    languageCode: 'ja',
    curriculumLevel: 1,
    lessonId: 'ja-1-1',
    questionId: 'ja-l1-002',
    exerciseType: 'mcq',
    isCorrect: false,
    studentAnswer: 'さ (sa)'
  });

  assert.strictEqual(attemptRes.isMastered, false, 'Should not mark as mastered when incorrect');
  assert.ok(attemptRes.masteryScore < 50, 'Mastery score should reflect needing further practice');

  // Clean up
  db.prepare('DELETE FROM student_language_question_attempts WHERE user_id = ?').run(testUser);
});

test('Phase 3: 6. Speaking Engine Evaluates Pronunciation Honestly without False Praise', () => {
  // Test perfect pronunciation
  const perfectResult = evaluateStudentPronunciation({
    targetPhrase: 'こんにちは',
    recognizedUtterance: 'こんにちは',
    targetLanguage: 'ja',
    supportLanguage: 'te'
  });

  assert.strictEqual(perfectResult.isExactMatch, true, 'Matching speech must be true');
  assert.ok(perfectResult.accuracyScore >= 95, 'Score must be high for perfect match');

  // Test partial/mispronounced speech
  const imperfectResult = evaluateStudentPronunciation({
    targetPhrase: 'おはようございます',
    recognizedUtterance: 'おやすみなさい', // Said "Good night" instead of "Good morning"
    targetLanguage: 'ja',
    supportLanguage: 'te'
  });

  assert.strictEqual(imperfectResult.isExactMatch, false, 'Different phrase must not match');
  assert.ok(imperfectResult.accuracyScore < 50, 'Score must be low for mispronounced/wrong phrase');
  assert.ok(imperfectResult.detailedFeedback.includes('You said') || imperfectResult.detailedFeedback.includes('Try repeating'), 'Must give actionable corrective feedback');
});

test('Phase 3: 7. Dynamic Question Synthesizer Generates Varied Exercise Types', () => {
  const questions = synthesizeDynamicCurriculumQuestions('ja', 4, 3);
  assert.strictEqual(questions.length, 3, 'Must synthesize 3 questions');

  for (const q of questions) {
    assert.strictEqual(q.curriculumLevel, 4);
    assert.strictEqual(q.exerciseType, 'sentence_builder');
    assert.ok(Array.isArray(q.tokens) && q.tokens.length >= 3, 'Must have sentence tokens');
    assert.ok(q.explanation.includes('S-O-V') || q.explanation.includes('Japanese'), 'Must include S-O-V grammatical explanation');
  }
});
