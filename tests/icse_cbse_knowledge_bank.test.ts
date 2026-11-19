import test from 'node:test';
import assert from 'node:assert/strict';
import { icseCbseKnowledgeBank } from '../server/icseCbseKnowledgeBank.ts';
import { unifiedKnowledgeRetrieval } from '../server/unifiedKnowledgeRetrieval.ts';
import { multiModelAiTeacherEngine } from '../server/multiModelAiTeacherEngine.ts';
import { AdvancedNotesGenerationEngine, validateAcademicNotebook } from '../server/advancedNotesGenerationEngine.ts';
import { generateGameQuestions } from '../server/educationalGamesEngine.ts';

test('1. ICSE & CBSE Knowledge Bank (Grades 1–10) seeds distinct board curricula, 20-field chapters, and honest completeness metrics', () => {
  icseCbseKnowledgeBank.ensureInitialized();
  const report = icseCbseKnowledgeBank.getCompletenessTrackerReport();

  // Over 140 grade-subject prescriptions across Grades 1-10 for CBSE and ICSE
  assert.ok(report.summary.totalPrescribedGradeSubjects >= 140, `Expected >= 140 grade-subject prescriptions, got ${report.summary.totalPrescribedGradeSubjects}`);
  assert.ok(report.summary.totalChaptersTracked >= 75, `Expected >= 75 tracked chapters across CBSE & ICSE, got ${report.summary.totalChaptersTracked}`);

  // Honest completeness: not 100% because catalog includes Discovered / Content Pending / Needs Verification chapters
  assert.ok(report.summary.overallCompletenessPercentage < 100 && report.summary.overallCompletenessPercentage >= 75);
  assert.ok(report.summary.statusBreakdown['Published'] >= 50);
  assert.ok(report.summary.statusBreakdown['Discovered'] >= 1);
  assert.ok(report.summary.statusBreakdown['Content Pending'] >= 1);
  assert.ok(report.summary.statusBreakdown['Needs Verification'] >= 1);

  // Verify board-specific curriculum structure (Economics introduced in Grade 9; Physics/Chemistry/Biology from Grade 6)
  const economicsGrades = report.gradeSubjectMatrix.filter((g) => g.subject === 'Economics').map((g) => g.grade);
  assert.ok(economicsGrades.every((g) => g >= 9), 'Economics must only be prescribed from Grade 9 onwards');

  // Verify 20-field completeness on Grade 8 Physics (Force and Pressure)
  const forceCh = icseCbseKnowledgeBank.findBestMatchingChapter({
    query: 'Force and Pressure',
    board: 'ICSE',
    grade: 8,
    subject: 'Physics'
  });
  assert.ok(forceCh, 'Expected Grade 8 ICSE Physics Force and Pressure chapter');
  assert.equal(forceCh.completenessPercentage, 100);
  assert.ok(forceCh.learningObjectives.length >= 3);
  assert.ok(forceCh.topicList.length >= 4);
  assert.ok(forceCh.subtopicList.length >= 3);
  assert.ok(forceCh.importantDefinitions.length >= 4);
  assert.ok(forceCh.formulasAndEquations.length >= 2);
  assert.ok(forceCh.solvedProblems.length >= 1);
  assert.ok(forceCh.importantComparisons.length >= 1);
  assert.ok(forceCh.commonMisconceptions.length >= 1);
  assert.ok(forceCh.practiceQuestions.length >= 2);
  assert.ok(forceCh.assessmentQuestions.length >= 2);
  assert.ok(forceCh.verifiedAcademicSources.length >= 1);
});

test('2. Required 10-Grade Benchmark Suite across ICSE & CBSE (Grades 3, 5, 6, 7, 8, 9, 10)', async () => {
  // (1) Grade 3 Mathematics: Explain multiplication with examples
  const g3Math = await multiModelAiTeacherEngine.teach({
    question: 'Explain multiplication with examples',
    grade: 3,
    board: 'CBSE'
  });
  assert.equal(g3Math.subject, 'Mathematics');
  assert.match(g3Math.directAnswer, /repeated addition|Multiplicand|Multiplier|Product|equal groups/i);

  // (2) Grade 5 Science: Explain the water cycle
  const g5Sci = await multiModelAiTeacherEngine.teach({
    question: 'Explain the water cycle',
    subject: 'General Science',
    grade: 5,
    board: 'ICSE'
  });
  assert.match(g5Sci.directAnswer, /Evaporation|Condensation|Precipitation|Transpiration/i);

  // (3) Grade 6 History: Explain a relevant curriculum chapter (Harappan / Indus Valley Civilization)
  const g6Hist = await multiModelAiTeacherEngine.teach({
    question: 'Explain the Indus Valley Harappan Civilization town planning and Great Bath',
    grade: 6,
    board: 'CBSE'
  });
  assert.equal(g6Hist.subject, 'History');
  assert.match(g6Hist.directAnswer, /Harappa|Mohenjo-daro|Citadel|Great Bath|Lothal|drainage/i);

  // (4) Grade 7 Geography: Explain weather and climate
  const g7Geo = await multiModelAiTeacherEngine.teach({
    question: 'Explain weather and climate and their measuring instruments',
    grade: 7,
    board: 'ICSE'
  });
  assert.equal(g7Geo.subject, 'Geography');
  assert.match(g7Geo.directAnswer, /Weather|Climate|30|Barometer|Lapse Rate|Humidity/i);

  // (5) Grade 8 Physics: Explain force and pressure
  const g8Phys = await multiModelAiTeacherEngine.teach({
    question: 'Explain force and pressure with the formula P = F / A and SI unit',
    grade: 8,
    board: 'CBSE'
  });
  assert.equal(g8Phys.subject, 'Physics');
  assert.match(g8Phys.directAnswer, /P\s*=\s*F\s*\/\s*A|Pascal|Thrust|Contact/i);

  // (6) Grade 9 Chemistry: Explain atomic structure
  const g9Chem = await multiModelAiTeacherEngine.teach({
    question: 'Explain atomic structure, Rutherford gold foil experiment and Bohr model',
    grade: 9,
    board: 'ICSE'
  });
  assert.equal(g9Chem.subject, 'Chemistry');
  assert.match(g9Chem.directAnswer, /Rutherford|Bohr|2n²|Nucleus|Isotopes|Protons/i);

  // (7) Grade 10 Biology: Explain life processes
  const g10Bio = await multiModelAiTeacherEngine.teach({
    question: 'Explain life processes including nutrition, respiration, double circulation and nephron excretion',
    grade: 10,
    board: 'CBSE'
  });
  assert.equal(g10Bio.subject, 'Biology');
  assert.match(g10Bio.directAnswer, /Photosynthesis|Mitochondria|Double Circulation|Nephron|ATP/i);

  // (8) Grade 10 Mathematics: Solve a board-aligned algebra problem (Quadratic Equation 2x² - 7x + 3 = 0)
  const g10Math = await multiModelAiTeacherEngine.teach({
    question: 'Solve the quadratic equation 2x² - 7x + 3 = 0 step by step',
    grade: 10,
    board: 'ICSE'
  });
  assert.equal(g10Math.subject, 'Mathematics');
  assert.match(g10Math.directAnswer, /D\s*=\s*\(?-?7\)?²|25|x₁\s*=\s*.*3|0\.5/);

  // (9) Grade 8 English: Explain a grammar concept (Active and Passive Voice)
  const g8Eng = await multiModelAiTeacherEngine.teach({
    question: 'Explain active and passive voice grammar rules with examples',
    grade: 8,
    board: 'ICSE'
  });
  assert.equal(g8Eng.subject, 'English');
  assert.match(g8Eng.directAnswer, /Active|Passive|Past Participle|V₃/i);

  // (10) Grade 7 Hindi: Explain a language concept (संज्ञा, संधि और समास)
  const g7Hindi = await multiModelAiTeacherEngine.teach({
    question: 'हिंदी व्याकरण में संज्ञा, संधि और समास को उदाहरण सहित समझाइए',
    grade: 7,
    board: 'CBSE',
    language: 'Hindi'
  });
  assert.equal(g7Hindi.subject, 'Hindi');
  assert.match(g7Hindi.directAnswer, /संज्ञा|संधि|समास|हिमालय|विद्यालय/);
});

test('3. Knowledge Bank connects to AI Notes, Educational Games, and Admin Verification Workflow', async () => {
  // Generate AI Notes for Grade 9 ICSE Chemistry (Atomic Structure)
  const note = await AdvancedNotesGenerationEngine.generateNotebook({
    topic: 'Atomic Structure and Bohr Model',
    subject: 'Chemistry',
    grade: 9,
    board: 'ICSE',
    depth: 'comprehensive_exam'
  });
  const valid = validateAcademicNotebook(note);
  assert.equal(valid.isValid, true, `Notebook validation errors: ${valid.errors.join('; ')}`);

  // Generate Educational Game Questions for Grade 8 Physics (Force and Pressure)
  const gameQs = generateGameQuestions({
    gameSlug: 'mcq_challenge',
    topic: 'Force and Pressure',
    subject: 'Physics',
    count: 3
  });
  assert.ok(gameQs.length >= 2);
  assert.match(JSON.stringify(gameQs), /Force|Pressure|Pascal|Thrust/i);

  // Admin Verification Workflow: Upgrade a 'Needs Verification' chapter to 'Published' and bump version
  const pendingChId = 'kb-ch-cat-cbse-g9-1';
  const verifiedCh = icseCbseKnowledgeBank.verifyAndPublishChapter(pendingChId);
  assert.ok(verifiedCh);
  assert.equal(verifiedCh.status, 'Published');
  assert.ok(verifiedCh.completenessPercentage >= 95);
  assert.ok(verifiedCh.version >= 2);
});

test('4. 10-Category, Two-Board Coverage Matrix (2 × 10 × 10 = 200 Cells), All 10 Classes Populated, Duplicate Prevention & Deep Heart/Skill Content', () => {
  const report = icseCbseKnowledgeBank.getCompletenessTrackerReport();

  // 1. All 10 subject coverage categories and 200 matrix cells (2 Boards × 10 Classes × 10 Categories)
  assert.equal(report.tenCategoriesFramework.length, 10);
  assert.equal(report.summary.totalTenCategoryMatrixCells, 200);

  // 2. All 10 classes (Classes 1 to 10) have populated chapters in both CBSE and ICSE
  assert.equal(report.classWiseCoverage.length, 10);
  for (const cls of report.classWiseCoverage) {
    assert.ok(cls.cbseChaptersCount >= 1, `Expected CBSE chapters in Class ${cls.grade}`);
    assert.ok(cls.icseChaptersCount >= 1, `Expected ICSE chapters in Class ${cls.grade}`);
  }

  // 3. Categories are honestly classified (not falsely claiming all 10 are compulsory exam subjects in every class)
  const statuses = new Set(report.tenCategoryMatrix.map((c) => c.prescriptionStatus));
  assert.ok(statuses.has('compulsory_prescribed'));
  assert.ok(statuses.has('optional_prescribed'));
  assert.ok(statuses.has('school_level_graded'));
  assert.ok(statuses.has('integrated_supplementary'));
  assert.ok(statuses.has('not_applicable'));

  // 4. Deep content retrieval across Categories 5, 7, 8, 9, 10 and Human Heart (4 chambers, valves, vessels, double circulation)
  const evsCh = icseCbseKnowledgeBank.findBestMatchingChapter({ query: '3Rs Reduce Reuse Recycle', grade: 2 });
  assert.ok(evsCh && evsCh.chapterIntroduction.includes('Reduce, Reuse, and Recycle'));

  const gkCh = icseCbseKnowledgeBank.findBestMatchingChapter({ query: 'ISRO Chandrayaan-3 Aditya-L1', grade: 6 });
  assert.ok(gkCh && gkCh.chapterIntroduction.includes('Chandrayaan-3'));

  const artCh = icseCbseKnowledgeBank.findBestMatchingChapter({ query: 'Color Wheel Linear Perspective Kalamkari', grade: 7 });
  assert.ok(artCh && artCh.chapterIntroduction.includes('Color Wheel'));

  const peCh = icseCbseKnowledgeBank.findBestMatchingChapter({ query: 'Balanced Diet BMI R.I.C.E. First Aid Yoga', grade: 8 });
  assert.ok(peCh && peCh.chapterIntroduction.includes('R.I.C.E.'));

  const vocCh = icseCbseKnowledgeBank.findBestMatchingChapter({ query: 'Financial Literacy 50/30/20 Design Thinking SUPW', grade: 9 });
  assert.ok(vocCh && vocCh.chapterIntroduction.includes('50/30/20'));

  const heartRetrieved = unifiedKnowledgeRetrieval.retrieveKnowledge('Human Heart', 'Biology', 10, 'CBSE');
  const heartText = JSON.stringify(heartRetrieved);
  assert.match(heartText, /Atrium|Ventricle|Tricuspid|Bicuspid|Double Circulation/i);

  // 5. Duplicate ingestion prevention
  const dupAttempt = icseCbseKnowledgeBank.ingestChapterWithDuplicateCheck({
    board: 'CBSE',
    grade: 8,
    subject: 'Physics',
    syllabusUnit: 'Mechanics',
    chapterNumber: 8,
    chapterTitle: 'Chapter 8: Force and Pressure',
    chapterIntroduction: 'Duplicate test',
    topicList: ['Force', 'Pressure']
  });
  assert.equal(dupAttempt.duplicateDetected, true);
});
