import test from 'node:test';
import assert from 'node:assert/strict';
import { initDatabase, db } from '../server/db.ts';
import {
  AdvancedNotesGenerationEngine,
  validateAcademicNotebook
} from '../server/advancedNotesGenerationEngine.ts';
import { buildCorePrinciplesForTopic } from '../server/universalTeachingWorkflowEngine.ts';

initDatabase();

test('STUDYAI – AI Notes Generation Quality, Image Delivery & Notebook Rendering Test Suite', async (t) => {

  await t.test('1. Human Heart Circulation (Class 10 Biology) — Deep Academic Generation', async () => {
    const note = await AdvancedNotesGenerationEngine.generateNotebook({
      topic: 'Human Heart Circulation',
      subject: 'Biology',
      grade: 10,
      board: 'ICSE',
      language: 'en',
      depth: 'standard'
    });

    assert.ok(note, 'Note must be generated');
    assert.strictEqual(note.subject, 'Biology');
    assert.ok(note.title.includes('Human Heart Circulation'), 'Title must reflect topic');

    // Anti-generic filler check
    const bannedPhrases = [
      'Components interact in equilibrium rather than isolated events',
      'Theoretical values closely match experimental observation in standard curriculum laboratories',
      'System components initiate energy intake or receptor excitation under environmental triggers',
      'Energy transformation or mechanical transmission proceeds sequentially across intermediate vectors',
      'Products or kinetic motion reach stable target configuration with entropy dissipation',
      'Core Principle: The central axiom upon which',
      'Foundational Prerequisites: Master underlying terminology',
      'The functional mechanism operates via a sequence of validated stages'
    ];

    const noteJsonString = JSON.stringify(note);
    for (const phrase of bannedPhrases) {
      assert.ok(
        !noteJsonString.includes(phrase),
        `Note must NEVER contain generic filler phrase: "${phrase}"`
      );
    }

    // Verify subtopics count and depth
    assert.ok(note.sections.length >= 5, `Expected at least 5 subtopics, got ${note.sections.length}`);
    for (const sec of note.sections) {
      assert.ok(sec.heading.length >= 5, `Subtopic heading must be meaningful: "${sec.heading}"`);
      assert.ok(sec.body && sec.body.length >= 100, `Subtopic body must be >=100 chars, got ${sec.body?.length} in "${sec.heading}"`);
      assert.ok(sec.content && sec.content.length >= 100, `Subtopic content must be >=100 chars in "${sec.heading}"`);
      assert.strictEqual(sec.body, sec.content, 'body and content must be identical and populated');
      assert.ok(sec.visual, `Subtopic "${sec.heading}" must have an attached visual`);
      assert.ok(
        sec.visual?.dataUrl.startsWith('data:image/svg+xml;base64,') || sec.visual?.dataUrl.startsWith('data:image/svg+xml;'),
        `Subtopic visual must have valid SVG dataUrl: "${sec.visual?.dataUrl.slice(0, 30)}"`
      );
      assert.ok(sec.visual?.explanation?.whatItShows, `Visual must have pedagogical walkthrough whatItShows`);
    }

    // Verify key anatomical topics covered
    const fullText = noteJsonString.toLowerCase();
    assert.ok(fullText.includes('atrium') || fullText.includes('atria'), 'Must cover atria');
    assert.ok(fullText.includes('ventricle'), 'Must cover ventricles');
    assert.ok(fullText.includes('tricuspid') || fullText.includes('mitral') || fullText.includes('bicuspid'), 'Must cover heart valves');
    assert.ok(fullText.includes('pulmonary'), 'Must cover pulmonary circuit');
    assert.ok(fullText.includes('aorta'), 'Must cover systemic aorta');
    assert.ok(fullText.includes('sinoatrial') || fullText.includes('sa node') || fullText.includes('pacemaker'), 'Must cover cardiac conduction');

    // Verify Section F (Process Flow) contains the complete circulation route
    const processes = note.structured.universalTeachingWorkflow.stage7_stepByStepProcesses;
    assert.ok(Array.isArray(processes) && processes.length >= 3, 'Must have >=3 process stages');
    const flowText = processes.map(p => `${p.title} ${p.whatHappens}`).join(' ');
    assert.ok(flowText.includes('Vena Cava') || flowText.includes('vena cava'), 'Must trace Vena Cava in process');
    assert.ok(flowText.includes('Aorta') || flowText.includes('aorta'), 'Must trace Aorta in process');

    // Verify Differences & Comparisons
    assert.ok(note.structured.differences, 'Differences matrix must exist');
    assert.ok(note.structured.differences.rows.length >= 2, 'Differences matrix must have >=2 rows');
    assert.ok(
      note.structured.differences.titleA.toLowerCase().includes('arter') ||
      note.structured.differences.title.toLowerCase().includes('arter') ||
      note.structured.differences.rows.length >= 3,
      'Must contain genuine curriculum comparison'
    );

    // Verify Final Revision Page is complete and NOT empty
    const rev = note.structured.finalRevisionPage;
    assert.ok(rev, 'Final revision page must exist');
    assert.ok(rev.executiveSummary && rev.executiveSummary.length >= 40, 'Executive summary must be >=40 chars');
    assert.ok(Array.isArray(rev.quickRevisionMatrix) && rev.quickRevisionMatrix.length >= 4, 'Quick revision matrix must have >=4 items');

    // Run strict validator
    const val = validateAcademicNotebook(note);
    assert.strictEqual(val.isValid, true, `Validation failed: ${val.errors.join(', ')}`);
  });

  await t.test('2. Physics — Newton\'s Laws of Motion Quality & Validation', async () => {
    const note = await AdvancedNotesGenerationEngine.generateNotebook({
      topic: "Newton's Laws of Motion",
      subject: 'Physics',
      grade: 9,
      board: 'CBSE',
      language: 'en',
      depth: 'comprehensive_exam'
    });

    assert.ok(note, 'Physics note must be generated');
    const val = validateAcademicNotebook(note);
    assert.strictEqual(val.isValid, true, `Validation failed: ${val.errors.join(', ')}`);

    const fullText = JSON.stringify(note).toLowerCase();
    assert.ok(fullText.includes('inertia'), 'Must cover inertia');
    assert.ok(fullText.includes('momentum') || fullText.includes('f = ma'), 'Must cover momentum or F=ma');
    assert.ok(fullText.includes('action-reaction') || fullText.includes('action and reaction') || fullText.includes('third law'), 'Must cover Newton\'s 3rd law');
    assert.ok(note.sections.length >= 3, 'Must have >=3 subtopics');
  });

  await t.test('3. Chemistry — Chemical Bonding & Octet Rule', async () => {
    const note = await AdvancedNotesGenerationEngine.generateNotebook({
      topic: 'Chemical Bonding (Ionic and Covalent)',
      subject: 'Chemistry',
      grade: 10,
      board: 'CBSE',
      language: 'en'
    });

    assert.ok(note, 'Chemistry note must be generated');
    const val = validateAcademicNotebook(note);
    assert.strictEqual(val.isValid, true, `Validation failed: ${val.errors.join(', ')}`);

    const fullText = JSON.stringify(note).toLowerCase();
    assert.ok(fullText.includes('ionic') && fullText.includes('covalent'), 'Must cover ionic and covalent bonding');
    assert.ok(fullText.includes('valence') || fullText.includes('electron') || fullText.includes('octet'), 'Must cover electron interactions');
  });

  await t.test('4. Mathematics — Quadratic Equations & Discriminant', async () => {
    const note = await AdvancedNotesGenerationEngine.generateNotebook({
      topic: 'Quadratic Equations',
      subject: 'Mathematics',
      grade: 10,
      board: 'CBSE',
      language: 'en'
    });

    assert.ok(note, 'Math note must be generated');
    const val = validateAcademicNotebook(note);
    assert.strictEqual(val.isValid, true, `Validation failed: ${val.errors.join(', ')}`);

    const fullText = JSON.stringify(note).toLowerCase();
    assert.ok(fullText.includes('discriminant') || fullText.includes('b² - 4ac') || fullText.includes('b^2 - 4ac'), 'Must cover discriminant');
    assert.ok(fullText.includes('roots') || fullText.includes('formula'), 'Must cover roots formula');
  });

  await t.test('5. Strict Validator Guardrail Rejections', () => {
    // Test that injected generic filler phrase is rejected
    const badNote = {
      title: 'Bad Note',
      sections: [
        { heading: 'Sec 1', body: 'Normal content that is long enough to pass length requirements easily in this test.' },
        { heading: 'Sec 2', body: 'Components interact in equilibrium rather than isolated events.' },
        { heading: 'Sec 3', body: 'More normal content that is long enough to pass length requirements easily.' }
      ],
      structured: {
        definitions: [{ term: 'A', definition: 'B' }],
        keyPoints: ['P1', 'P2'],
        images: [{ title: 'Img 1', imageUrl: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=' }],
        finalRevisionPage: { executiveSummary: 'Valid summary here' }
      }
    };

    const valBad = validateAcademicNotebook(badNote);
    assert.strictEqual(valBad.isValid, false, 'Validator MUST reject banned generic filler phrase');
    assert.ok(valBad.errors.some(e => e.includes('Components interact in equilibrium')));

    // Test that empty subtopic is rejected
    const emptySubtopicNote = {
      title: 'Empty Subtopic Note',
      sections: [
        { heading: 'Sec 1', body: 'Long enough body text for section 1 here to be valid.' },
        { heading: 'Sec 2', body: '' },
        { heading: 'Sec 3', body: 'Long enough body text for section 3 here to be valid.' }
      ],
      structured: {
        definitions: [{ term: 'A', definition: 'B' }],
        keyPoints: ['P1', 'P2'],
        images: [{ title: 'Img 1', imageUrl: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=' }],
        finalRevisionPage: { executiveSummary: 'Valid summary here' }
      }
    };

    const valEmpty = validateAcademicNotebook(emptySubtopicNote);
    assert.strictEqual(valEmpty.isValid, false, 'Validator MUST reject empty subtopic content');
    assert.ok(valEmpty.errors.some(e => e.includes('empty or insufficient content')));
  });

  await t.test('6. Database Persistence & Retrieval Integrity', async () => {
    const testId = `note-test-${Date.now()}`;
    const generated = await AdvancedNotesGenerationEngine.generateNotebook({
      topic: 'Human Heart Circulation',
      subject: 'Biology',
      grade: 10,
      board: 'ICSE',
      language: 'en'
    });

    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO notes (id, user_id, title, subject, topic, level, depth, notebook, content_markdown, structured_json, flashcards_json, quiz_json, source_type, design_mode, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      testId,
      'student-vishwak',
      generated.title,
      generated.subject,
      generated.topic,
      'Grade 10 (ICSE)',
      'standard',
      'Biology',
      generated.content_markdown,
      JSON.stringify(generated.structured),
      JSON.stringify(generated.flashcards),
      JSON.stringify(generated.quiz),
      'topic',
      'infographic',
      now,
      now
    );

    // Read back and parse
    const row = db.prepare('SELECT * FROM notes WHERE id = ?').get(testId) as any;
    assert.ok(row, 'Saved note must be retrieved from database');

    const parsedStructured = JSON.parse(row.structured_json);
    assert.ok(Array.isArray(parsedStructured.sections) && parsedStructured.sections.length >= 5, 'Retrieved sections must be >=5');
    assert.ok(Array.isArray(parsedStructured.images) && parsedStructured.images.length >= 5, 'Retrieved images must be >=5');
    assert.ok(parsedStructured.definitions.length >= 2, 'Retrieved definitions must be >=2');
    assert.ok(parsedStructured.keyPoints.length >= 2, 'Retrieved keyPoints must be >=2');
    assert.ok(parsedStructured.finalRevisionPage.executiveSummary.length > 20, 'Retrieved finalRevisionPage must have executive summary');

    // Verify subtopics retain both body and content
    for (const sec of parsedStructured.sections) {
      assert.ok(sec.body && sec.body.length > 50, `Subtopic "${sec.heading}" must retain non-empty body`);
      assert.ok(sec.content && sec.content.length > 50, `Subtopic "${sec.heading}" must retain non-empty content`);
      assert.ok(sec.visual?.dataUrl.startsWith('data:image/svg+xml;'), `Subtopic visual must retain valid dataUrl`);
    }

    // Cleanup test record
    db.prepare('DELETE FROM notes WHERE id = ?').run(testId);
  });
});
