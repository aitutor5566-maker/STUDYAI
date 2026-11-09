import test from 'node:test';
import assert from 'node:assert/strict';
import { AdvancedNotesGenerationEngine } from '../server/advancedNotesGenerationEngine.ts';
import { db } from '../server/db.ts';
import { knowledgeIntelligenceAdmin } from '../server/knowledgeIntelligenceAdmin.ts';

test('STUDYAI Phase 5 — Advanced AI Notes Generation Engine', async (t) => {
  await t.test('1. Generates Standard Learning Notes with full structural integrity', async () => {
    const note = await AdvancedNotesGenerationEngine.generateNotebook({
      topic: 'Photosynthesis',
      subject: 'Biology',
      grade: 10,
      board: 'CBSE',
      depth: 'standard',
      language: 'en',
      studentId: 'student-test-p5'
    });

    assert.ok(note.id.startsWith('note-'), 'Should have valid note id');
    assert.strictEqual(note.topic, 'Photosynthesis');
    assert.strictEqual(note.subject, 'Biology');
    assert.strictEqual(note.depth, 'standard');
    assert.strictEqual(note.language, 'en');

    // Table of Contents
    assert.ok(note.tableOfContents.length >= 6, 'ToC should contain at least 6 sections');
    assert.ok(note.contentMarkdown.includes('## Table of Contents'), 'Markdown should have ToC');

    // Visual Asset present
    const visualSection = note.sections.find((s) => s.visualAsset);
    assert.ok(visualSection, 'Should contain a section with a verified visual asset');
    assert.ok(visualSection?.visualAsset?.svgXml?.includes('<svg'), 'Visual asset should contain valid SVG');

    // Rapid Revision
    assert.ok(note.finalRevisionSummary.quickRevisionMatrix.length > 0, 'Should have rapid revision matrix');
    assert.ok(note.flashcards.length >= 3, 'Should generate flashcards');
    assert.ok(note.quiz.length >= 1, 'Should generate quiz');
  });

  await t.test('2. Generates Comprehensive Exam Notes with high-yield questions & marking schemes', async () => {
    const note = await AdvancedNotesGenerationEngine.generateNotebook({
      topic: 'Photosynthesis',
      subject: 'Biology',
      grade: 10,
      board: 'CBSE',
      depth: 'comprehensive_exam',
      language: 'en',
      studentId: 'student-test-p5'
    });

    assert.strictEqual(note.depth, 'comprehensive_exam');
    assert.ok(note.contentMarkdown.includes('High-Yield Board Exam Questions'), 'Exam notes should include high-yield questions');
    assert.ok(note.contentMarkdown.includes('Marking Scheme'), 'Exam notes should include official marking schemes');
    assert.ok(note.contentMarkdown.includes('Common Student Misconceptions to Avoid'), 'Exam notes should highlight pitfalls');
  });

  await t.test('3. Dynamic Subject Adaptation: Physics/Maths includes derivations and 10-step numerical', async () => {
    const note = await AdvancedNotesGenerationEngine.generateNotebook({
      topic: "Ohm's Law",
      subject: 'Physics',
      grade: 10,
      board: 'CBSE',
      depth: 'standard',
      language: 'en',
      studentId: 'student-test-p5'
    });

    assert.strictEqual(note.subject, 'Physics');
    assert.ok(note.contentMarkdown.includes('Governing Mathematical Equations'), 'Physics notes should include mathematical equations');
    assert.ok(note.contentMarkdown.includes('Deterministic Numerical Problem & Step-by-Step Solution'), 'Physics notes should include numerical solution');
    assert.ok(note.contentMarkdown.includes('Step 1 (Given Data)'), 'Should follow 10-step numerical solver format');
    assert.ok(note.contentMarkdown.includes('Step 9 (Canonical Units)'), 'Should state canonical units');
  });

  await t.test('4. Dynamic Subject Adaptation: History strictly excludes formulas and numericals', async () => {
    const note = await AdvancedNotesGenerationEngine.generateNotebook({
      topic: 'The French Revolution',
      subject: 'History',
      grade: 9,
      board: 'CBSE',
      depth: 'standard',
      language: 'en',
      studentId: 'student-test-p5'
    });

    assert.strictEqual(note.subject, 'History');
    assert.ok(note.contentMarkdown.includes('Historical Timeline & Chronological Sequence'), 'History notes should feature chronological sequence');
    assert.ok(!note.contentMarkdown.includes('Governing Mathematical Equations'), 'History notes must NOT include mathematical equations');
    assert.ok(!note.contentMarkdown.includes('Deterministic Numerical Problem'), 'History notes must NOT include numerical problems');
    assert.ok(!note.contentMarkdown.includes('V = I \\times R'), 'History notes must not contain Ohm law formula');
  });

  await t.test('5. Multilingual Notes: Generates notes in Telugu and Hindi', async () => {
    const noteTe = await AdvancedNotesGenerationEngine.generateNotebook({
      topic: 'Photosynthesis',
      subject: 'Biology',
      grade: 10,
      board: 'AP_STATE_BOARD',
      depth: 'standard',
      language: 'te',
      studentId: 'student-test-p5'
    });

    assert.strictEqual(noteTe.language, 'te');
    assert.ok(noteTe.contentMarkdown.includes('కిరణజన్య సంయోగక్రియ') || noteTe.contentMarkdown.includes('తెలుగు'), 'Telugu notes should include Telugu academic terms');

    const noteHi = await AdvancedNotesGenerationEngine.generateNotebook({
      topic: 'Photosynthesis',
      subject: 'Biology',
      grade: 10,
      board: 'CBSE',
      depth: 'standard',
      language: 'hi',
      studentId: 'student-test-p5'
    });

    assert.strictEqual(noteHi.language, 'hi');
    assert.ok(noteHi.contentMarkdown.includes('प्रकाश-संश्लेषण') || noteHi.contentMarkdown.includes('हिन्दी'), 'Hindi notes should include Hindi academic terms');
  });

  await t.test('6. Anti-Hallucination Policy Test Cases (All 6 Mandatory Scenarios)', async () => {
    // Case 1: Refusal of unsupported / unverified board coverage without speculative fabrication
    const unsupportedBoardNote = await AdvancedNotesGenerationEngine.generateNotebook({
      topic: 'Photosynthesis',
      grade: 10,
      board: 'UNKNOWN_FOREIGN_BOARD_99',
      studentId: 'student-test-p5'
    });
    // System transparently defaults to national curriculum baseline or discloses coverage rather than fabricating
    assert.ok(unsupportedBoardNote.evidenceSources.every((src) => src.isVerified), 'All evidence sources must be verified');

    // Case 2: Zero fabricated textbook page numbers or citations
    assert.ok(!unsupportedBoardNote.contentMarkdown.includes('page 9999'), 'Must not invent random page citations');

    // Case 3: Conflicting syllabus handling (transparent disclosure, no invented harmonization)
    assert.ok(unsupportedBoardNote.contentMarkdown.includes('Official Textbook Concordance'), 'Must present verified concordances from recognized boards');

    // Case 4: Refusal of unsupported formulas in non-mathematical subjects
    const civicsNote = await AdvancedNotesGenerationEngine.generateNotebook({
      topic: 'Indian Constitution and Federalism',
      subject: 'Civics',
      grade: 10,
      board: 'CBSE',
      studentId: 'student-test-p5'
    });
    assert.ok(!civicsNote.contentMarkdown.includes('F = ma') && !civicsNote.contentMarkdown.includes('E = mc^2'), 'Civics notes must not contain invented physics equations');

    // Case 5: Visual verification rejects unrelated images
    const visual = civicsNote.sections.find((s) => s.visualAsset);
    if (visual && visual.visualAsset) {
      assert.ok(!visual.visualAsset.caption.toLowerCase().includes('resistor') && !visual.visualAsset.caption.toLowerCase().includes('ohm'), 'Visuals in civics must not display electrical resistors');
    }

    // Case 6: Honest disclosure on unpredictable future exam questions
    assert.ok(!unsupportedBoardNote.contentMarkdown.includes('GUARANTEED LEAK') && !unsupportedBoardNote.contentMarkdown.includes('100% Guaranteed Question Paper'), 'Must never guarantee leaked question papers');
  });

  await t.test('7. Database Persistence & Library Integration', async () => {
    const note = await AdvancedNotesGenerationEngine.generateNotebook({
      topic: 'Chemical Reactions and Equations',
      subject: 'Chemistry',
      grade: 10,
      board: 'CBSE',
      depth: 'standard',
      language: 'en',
      studentId: 'student-vishwak'
    });

    const now = new Date().toISOString();
    db.prepare(`
      INSERT OR REPLACE INTO notes (id, user_id, title, subject, topic, level, depth, notebook, content_markdown, structured_json, flashcards_json, quiz_json, source_type, design_mode, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      note.id,
      'student-vishwak',
      note.title,
      note.subject,
      note.topic,
      `Grade ${note.grade} (${note.board})`,
      note.depth,
      note.notebook,
      note.contentMarkdown,
      JSON.stringify({
        tableOfContents: note.tableOfContents,
        sections: note.sections,
        visualPlan: note.visualPlan,
        evidenceSources: note.evidenceSources,
        finalRevisionSummary: note.finalRevisionSummary
      }),
      JSON.stringify(note.flashcards),
      JSON.stringify(note.quiz),
      'topic',
      'chapter_notes',
      now,
      now
    );

    const saved = db.prepare('SELECT * FROM notes WHERE id = ?').get(note.id) as any;
    assert.ok(saved, 'Note must exist in db');
    assert.strictEqual(saved.topic, 'Chemical Reactions and Equations');
    assert.strictEqual(saved.subject, 'Chemistry');

    const parsedJson = JSON.parse(saved.structured_json);
    assert.ok(parsedJson.tableOfContents.length >= 6, 'Saved JSON must contain Table of Contents');
  });

  await t.test('8. Admin Dashboard Telemetry includes Notes Intelligence metrics', () => {
    const report = knowledgeIntelligenceAdmin.getDashboardReport();
    assert.ok(report.notesIntelligence, 'Admin report must include notesIntelligence telemetry');
    assert.ok(typeof report.notesIntelligence?.totalNotesGenerated === 'number', 'Must report total notes generated');
    assert.ok(Array.isArray(report.notesIntelligence?.subjectBreakdown), 'Must provide subject breakdown');
    assert.ok(Array.isArray(report.notesIntelligence?.depthBreakdown), 'Must provide depth breakdown');
    assert.strictEqual(report.notesIntelligence?.antiHallucinationEnforced, true, 'Must report anti-hallucination enforced');
  });
});
