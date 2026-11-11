import test from 'node:test';
import assert from 'node:assert/strict';
import { professionalTeacherEngine } from '../server/professionalTeacherEngine.ts';
import { getSubtopicDiagramsForTopic, planTopicEducationalVisuals } from '../server/subtopicDiagramCatalog.ts';
import { parseMarkdownBlocks } from '../src/utils/educationalMarkdownUtils.ts';
import { initDatabase } from '../server/db.ts';

test('STUDYAI — Professional AI Teacher Transformation Master Test Suite', async (t) => {
  initDatabase();

  // ---------------------------------------------------------------------------
  // 1. Core Principle & Discipline Classification
  // ---------------------------------------------------------------------------
  await t.test('1. Universal Discipline and Pedagogical Classification', () => {
    assert.strictEqual(professionalTeacherEngine.resolveDiscipline('Photosynthesis', 'Science'), 'Biology');
    assert.strictEqual(professionalTeacherEngine.resolveDiscipline('Newton Laws of Motion', 'Physics'), 'Physics');
    assert.strictEqual(professionalTeacherEngine.resolveDiscipline('Fractions and Decimals', 'Mathematics'), 'Mathematics');
    assert.strictEqual(professionalTeacherEngine.resolveDiscipline('World War II', 'History'), 'History');
    assert.strictEqual(professionalTeacherEngine.resolveDiscipline('English Grammar Syntax', 'English'), 'Language');
    assert.strictEqual(professionalTeacherEngine.resolveDiscipline('Binary Search Algorithm', 'Computer Science'), 'ComputerScience');
  });

  // ---------------------------------------------------------------------------
  // 2. BENCHMARK 1: Photosynthesis (Biology) — Light Reactions, Chloroplast, Calvin Cycle
  // ---------------------------------------------------------------------------
  await t.test('2. Benchmark 1: Photosynthesis (Biology) — Side-by-Side Visual Teaching & 5-Step Model', async () => {
    const lesson = await professionalTeacherEngine.planAndCreateLesson({
      topic: 'Photosynthesis',
      subject: 'Biology',
      grade: 10,
      board: 'CBSE',
      language: 'English',
      mode: 'normal'
    });

    assert.strictEqual(lesson.discipline, 'Biology');
    assert.ok(lesson.sideBySideSections.length >= 3, 'Must contain multiple subtopic diagram sections');

    const sec1 = lesson.sideBySideSections[0];
    assert.ok(sec1.visual.svgXml || sec1.visual.imageUrl, 'Must contain verified visual asset');
    assert.ok(sec1.explanation.seeIt_whatAmILookingAt.length > 20, 'SEE IT: Clear visual orientation');
    assert.ok(sec1.explanation.seeIt_keyComponents.length >= 3, 'SEE IT: Labeled anatomical/cellular components');
    assert.ok(sec1.explanation.understandIt_stepByStepMechanism.length >= 3, 'UNDERSTAND IT: Stepwise mechanism');
    assert.ok(sec1.explanation.connectIt_realWorldApplication.length > 10, 'CONNECT IT: Real-world connection');
    assert.ok(sec1.explanation.rememberIt_keyTakeaway.length > 10, 'REMEMBER IT: Essential takeaway');
    assert.ok(sec1.explanation.applyIt_examTip.length > 10, 'APPLY IT: Board marking tip');

    // Verify digital textbook markdown pairs image and explanation
    assert.ok(lesson.singlePageDigitalTextbookMarkdown.includes('SEE IT'), 'Markdown includes 5-step breakdown');
    const blocks = parseMarkdownBlocks(lesson.singlePageDigitalTextbookMarkdown);
    const imgBlock = blocks.find((b) => b.type === 'image');
    assert.ok(imgBlock, 'Markdown must parse image blocks');
    assert.ok(imgBlock.explanation, 'Image block must contain paired explanation for side-by-side rendering');
  });

  // ---------------------------------------------------------------------------
  // 3. BENCHMARK 2: Human Heart (Biology) — 4 Chambers, Circulation, Double Pump
  // ---------------------------------------------------------------------------
  await t.test('3. Benchmark 2: Human Heart (Biology) — Anatomical Labels & Double Circulation', async () => {
    const lesson = await professionalTeacherEngine.planAndCreateLesson({
      topic: 'Structure of the Human Heart',
      subject: 'Biology',
      grade: 10,
      board: 'ICSE',
      language: 'English',
      mode: 'exam'
    });

    assert.strictEqual(lesson.discipline, 'Biology');
    assert.ok(lesson.differencesAndComparisons, 'Must generate Arteries vs Veins comparison table');
    assert.strictEqual(lesson.differencesAndComparisons?.conceptA, 'Arteries');

    const diagrams = getSubtopicDiagramsForTopic('Human Heart', 'Biology');
    assert.ok(diagrams.length >= 4, 'Heart has dedicated subtopic diagrams (Internal Anatomy, Valves, Double Circulation)');
    const chambersDiag = diagrams.find((d) => d.subtopicTitle.includes('Chambers')) || diagrams[1];
    assert.ok(chambersDiag.point2_labelledParts.some((p) => p.label.toLowerCase().includes('ventricle')));
    assert.ok(chambersDiag.point2_labelledParts.some((p) => p.label.toLowerCase().includes('atrium')));
  });

  // ---------------------------------------------------------------------------
  // 4. BENCHMARK 3: DNA Structure (Biology) — Double Helix & Base Pairing
  // ---------------------------------------------------------------------------
  await t.test('4. Benchmark 3: DNA Structure (Biology) — Molecular Fidelity & Base Pairing', async () => {
    const lesson = await professionalTeacherEngine.planAndCreateLesson({
      topic: 'DNA Structure and Watson-Crick Model',
      subject: 'Biology',
      grade: 10,
      board: 'CBSE',
      language: 'English'
    });

    assert.strictEqual(lesson.discipline, 'Biology');
    assert.ok(lesson.sideBySideSections.length >= 1);
    const dnaVisual = lesson.sideBySideSections[0].visual;
    assert.ok(dnaVisual.svgXml?.includes('Adenine') || dnaVisual.svgXml?.includes('Thymine') || dnaVisual.title.includes('DNA'));
  });

  // ---------------------------------------------------------------------------
  // 5. BENCHMARK 4: Force and Motion (Physics) — Newton's Laws & F = ma
  // ---------------------------------------------------------------------------
  await t.test('5. Benchmark 4: Force and Motion (Physics) — Worked Numerical & Vector Resolution', async () => {
    const lesson = await professionalTeacherEngine.planAndCreateLesson({
      topic: 'Newton Laws of Motion and Force',
      subject: 'Physics',
      grade: 9,
      board: 'CBSE',
      language: 'English',
      mode: 'exam'
    });

    assert.strictEqual(lesson.discipline, 'Physics');
    assert.ok(lesson.workedProblem, 'Physics must include step-by-step solved numerical');
    assert.ok(lesson.workedProblem.formula.includes('F = m · a'), 'Numerical uses F = ma');
    assert.ok(lesson.workedProblem.steps.length >= 3, 'Step-by-step calculation included');
    assert.ok(lesson.workedProblem.verification.includes('verified'), 'Dimensional check verified');
  });

  // ---------------------------------------------------------------------------
  // 6. BENCHMARK 5: Work, Power and Energy (Physics) — Mechanical Energy Conservation
  // ---------------------------------------------------------------------------
  await t.test('6. Benchmark 5: Work, Power and Energy (Physics) — W = F·s·cos(θ) & Energy Exchange', async () => {
    const diagrams = getSubtopicDiagramsForTopic('Work, Power and Energy', 'Physics');
    assert.ok(diagrams.length >= 1, 'Must have dedicated Work Power Energy diagram');
    const wpeDiag = diagrams[0];
    assert.ok(wpeDiag.svgXml.includes('W = F · s · cos'), 'SVG diagram depicts work formula');
    assert.ok(wpeDiag.point2_labelledParts.some((p) => p.label.includes('Potential Energy')));
    assert.ok(wpeDiag.point2_labelledParts.some((p) => p.label.includes('Kinetic Energy')));

    const lesson = await professionalTeacherEngine.planAndCreateLesson({
      topic: 'Work and Kinetic Potential Energy',
      subject: 'Physics',
      grade: 9,
      board: 'ICSE',
      language: 'English'
    });
    assert.strictEqual(lesson.discipline, 'Physics');
    assert.ok(lesson.sideBySideSections[0].explanation.rememberIt_keyTakeaway.includes('Joules') || lesson.sideBySideSections[0].explanation.rememberIt_keyTakeaway.includes('Work'));
  });

  // ---------------------------------------------------------------------------
  // 7. BENCHMARK 6: Chemical Bonding (Chemistry) — Ionic vs Covalent Octet Rule
  // ---------------------------------------------------------------------------
  await t.test('7. Benchmark 6: Chemical Bonding (Chemistry) — Electron Transfer & Sharing', async () => {
    const diagrams = getSubtopicDiagramsForTopic('Chemical Bonding', 'Chemistry');
    assert.ok(diagrams.length >= 3, 'Must have Ionic, Covalent and Metallic bonding diagrams');
    const ionicDiag = diagrams.find((d) => d.subtopicKey.includes('ionic'));
    assert.ok(ionicDiag, 'Has ionic diagram');
    assert.ok(ionicDiag?.point2_labelledParts.some((p) => p.label.includes('Na') || p.label.includes('Cation')));

    const lesson = await professionalTeacherEngine.planAndCreateLesson({
      topic: 'Chemical Bonding and Octet Rule',
      subject: 'Chemistry',
      grade: 10,
      board: 'CBSE',
      language: 'English'
    });
    assert.strictEqual(lesson.discipline, 'Chemistry');
  });

  // ---------------------------------------------------------------------------
  // 8. BENCHMARK 7 & 8: Mathematics (Fractions & Geometry)
  // ---------------------------------------------------------------------------
  await t.test('8. Benchmark 7 & 8: Mathematics — Fractions & Geometric Proofs', async () => {
    // A. Fractions
    const fracDiagrams = getSubtopicDiagramsForTopic('Fractions', 'Mathematics');
    assert.ok(fracDiagrams.length >= 3, 'Has fraction circles and number lines');
    assert.ok(fracDiagrams[0].svgXml.includes('Numerator') || fracDiagrams[0].svgXml.includes('circle'));

    // B. Geometry
    const geoDiagrams = getSubtopicDiagramsForTopic('Geometry Triangles', 'Mathematics');
    assert.ok(geoDiagrams.length >= 2, 'Has geometry theorems');

    const mathLesson = await professionalTeacherEngine.planAndCreateLesson({
      topic: 'Fractions and Rational Numbers',
      subject: 'Mathematics',
      grade: 6,
      board: 'CBSE',
      language: 'English'
    });
    assert.strictEqual(mathLesson.discipline, 'Mathematics');
  });

  // ---------------------------------------------------------------------------
  // 9. BENCHMARK 9: World War II (History) — Chronology & Stalingrad Turning Point
  // ---------------------------------------------------------------------------
  await t.test('9. Benchmark 9: World War II (History) — Chronological Timeline & Cause-and-Effect', async () => {
    const diagrams = getSubtopicDiagramsForTopic('World War II', 'History');
    assert.ok(diagrams.length >= 1, 'Must have dedicated World War II timeline diagram');
    const ww2Diag = diagrams[0];
    assert.ok(ww2Diag.svgXml.includes('1939') && ww2Diag.svgXml.includes('Stalingrad'));
    assert.ok(ww2Diag.point2_labelledParts.some((p) => p.label.includes('Stalingrad')));

    const historyLesson = await professionalTeacherEngine.planAndCreateLesson({
      topic: 'World War II Turning Points and Causes',
      subject: 'History',
      grade: 10,
      board: 'ICSE',
      language: 'English'
    });
    assert.strictEqual(historyLesson.discipline, 'History');
    assert.ok(historyLesson.sideBySideSections[0].explanation.seeIt_whatAmILookingAt.includes('timeline'));
  });

  // ---------------------------------------------------------------------------
  // 10. BENCHMARK 10: Earth Water Cycle (Geography)
  // ---------------------------------------------------------------------------
  await t.test('10. Benchmark 10: Earth Water Cycle (Geography) — Evaporation, Condensation & Precipitation', async () => {
    const diagrams = getSubtopicDiagramsForTopic('Water Cycle', 'Geography');
    assert.ok(diagrams.length >= 3, 'Has complete water cycle, cloud formation, and runoff');
    const wcDiag = diagrams[0];
    assert.ok(wcDiag.point2_labelledParts.some((p) => p.label.toLowerCase().includes('evaporation')));
    assert.ok(wcDiag.point2_labelledParts.some((p) => p.label.toLowerCase().includes('precipitation')));

    const geoLesson = await professionalTeacherEngine.planAndCreateLesson({
      topic: 'Hydrological Water Cycle',
      subject: 'Geography',
      grade: 8,
      board: 'CBSE',
      language: 'English'
    });
    assert.strictEqual(geoLesson.discipline, 'Geography');
  });

  // ---------------------------------------------------------------------------
  // 11. BENCHMARK 11: English Grammar (Language) — Sentence Syntax Tree & 8 Parts of Speech
  // ---------------------------------------------------------------------------
  await t.test('11. Benchmark 11: English Grammar (Language) — Subject-Predicate Tree & 8 Parts Taxonomy', async () => {
    const diagrams = getSubtopicDiagramsForTopic('English Grammar Parts of Speech', 'English');
    assert.ok(diagrams.length >= 1, 'Must have dedicated grammar syntax diagram');
    const grammarDiag = diagrams[0];
    assert.ok(grammarDiag.svgXml.includes('Subject') && grammarDiag.svgXml.includes('Predicate'));
    assert.ok(grammarDiag.point2_labelledParts.some((p) => p.label.includes('Noun')));

    const langLesson = await professionalTeacherEngine.planAndCreateLesson({
      topic: 'English Grammar Sentence Structure',
      subject: 'English',
      grade: 8,
      board: 'CBSE',
      language: 'English'
    });
    assert.strictEqual(langLesson.discipline, 'Language');
  });

  // ---------------------------------------------------------------------------
  // 12. BENCHMARK 12: Computer Algorithms (Computer Science) — Binary Search Flowchart & Trace
  // ---------------------------------------------------------------------------
  await t.test('12. Benchmark 12: Computer Algorithms (Computer Science) — Binary Search & O(log n)', async () => {
    const diagrams = getSubtopicDiagramsForTopic('Binary Search Algorithm', 'Computer Science');
    assert.ok(diagrams.length >= 1, 'Must have dedicated binary search algorithm diagram');
    const algoDiag = diagrams[0];
    assert.ok(algoDiag.svgXml.includes('Binary Search Flowchart'));
    assert.ok(algoDiag.svgXml.includes('O(log n)'));
    assert.ok(algoDiag.point2_labelledParts.some((p) => p.label.includes('Midpoint')));

    const csLesson = await professionalTeacherEngine.planAndCreateLesson({
      topic: 'Binary Search Algorithm and Complexity',
      subject: 'Computer Science',
      grade: 10,
      board: 'CBSE',
      language: 'English'
    });
    assert.strictEqual(csLesson.discipline, 'ComputerScience');
  });

  // ---------------------------------------------------------------------------
  // 13. Multilingual Adaptations (Telugu and Hindi)
  // ---------------------------------------------------------------------------
  await t.test('13. Multilingual Adaptive Delivery: Telugu and Hindi Context Preservation', async () => {
    // A. Telugu
    const teLesson = await professionalTeacherEngine.planAndCreateLesson({
      topic: 'Photosynthesis',
      subject: 'Biology',
      grade: 10,
      board: 'AP_STATE_BOARD',
      language: 'Telugu'
    });
    assert.strictEqual(teLesson.language, 'Telugu');
    assert.ok(teLesson.teacherGreeting.includes('నమస్కారం'), 'Greeting is localized in Telugu');
    assert.ok(teLesson.laymanIntroduction.length > 20, 'Layman intro is localized in Telugu');

    // B. Hindi
    const hiLesson = await professionalTeacherEngine.planAndCreateLesson({
      topic: 'Photosynthesis',
      subject: 'Biology',
      grade: 10,
      board: 'CBSE',
      language: 'Hindi'
    });
    assert.strictEqual(hiLesson.language, 'Hindi');
    assert.ok(hiLesson.teacherGreeting.includes('नमस्ते'), 'Greeting is localized in Hindi');
  });

  // ---------------------------------------------------------------------------
  // 14. Responsive Layout & Markdown Block Parsing Verification
  // ---------------------------------------------------------------------------
  await t.test('14. Side-by-Side Teaching Layout: Markdown Block Parsing & Paired Units', () => {
    const sampleMd = `# Photosynthesis
![Chloroplast Ultrastructure](data:image/svg+xml;utf8,<svg></svg>)
*Fig 1.1: Double-membrane organelle with thylakoid stacks.*

#### 🔍 1. SEE IT (What Am I Looking At?)
This diagram shows the cross-section of a chloroplast organelle.
- **Thylakoid:** Membrane disc where light reactions occur
- **Stroma:** Fluid matrix where dark reactions occur

#### ⚙️ 2. UNDERSTAND IT (How It Works & Mechanism)
Photons strike chlorophyll pigments in the thylakoid membrane.
`;

    const blocks = parseMarkdownBlocks(sampleMd);
    const imgBlock = blocks.find((b) => b.type === 'image');
    assert.ok(imgBlock, 'Finds image block');
    assert.ok(imgBlock.explanation, 'Lookahead successfully extracted paired explanation into image block');
    assert.ok(imgBlock.explanation.stepByStepProcess && imgBlock.explanation.stepByStepProcess.length > 0);
    assert.ok(imgBlock.explanation.keyComponents && imgBlock.explanation.keyComponents.length >= 2);
    assert.strictEqual(imgBlock.explanation.keyComponents[0].label, 'Thylakoid');
  });
});
