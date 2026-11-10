import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EducationalVisualPlanningEngine,
  VisualCategory
} from '../server/educationalVisualPlanningEngine.ts';
import { getSubtopicDiagramsForTopic } from '../server/subtopicDiagramCatalog.ts';
import {
  SavedNotesVisualUpgradeEngine
} from '../server/savedNotesVisualUpgradeEngine.ts';
import {
  db,
  initDatabase,
  getNoteVersionHistory,
  getNoteVersionById,
  softDeleteTutorMessage,
  updateTutorMessageContent,
  updateTutorMessageStructuredJson
} from '../server/db.ts';

// Initialize DB schema and run migrations
initDatabase();

function helperSaveNote(note: any) {
  db.prepare(`
    INSERT OR REPLACE INTO notes (id, user_id, title, subject, topic, level, depth, notebook, content_markdown, structured_json, flashcards_json, quiz_json, source_type, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    note.id,
    'student-vishwak',
    note.title,
    note.subject || 'Biology',
    note.topic || note.title,
    'Class 10',
    'detailed',
    'General',
    note.content_markdown,
    JSON.stringify({}),
    JSON.stringify([]),
    JSON.stringify([]),
    'topic',
    note.created_at || new Date().toISOString(),
    note.updated_at || new Date().toISOString()
  );
}

function helperGetNote(id: string): any {
  return db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
}

test('STUDYAI Advanced Educational Image Intelligence & Scientific Diagram Generation Upgrade', async (t) => {
  await t.test('1. Reference Implementation: Photosynthesis 6-Diagram Educational Sequence', async () => {
    const diagrams = getSubtopicDiagramsForTopic('Photosynthesis');
    assert.ok(diagrams && diagrams.length >= 6, `Expected at least 6 subtopic diagrams for Photosynthesis, got ${diagrams.length}`);

    // Verify all 6 required diagrams exist
    const diagramIds = diagrams.map(d => d.diagramId);
    assert.ok(diagramIds.includes('photo-diag-1'), 'Must have Diagram 1: Overall organismal overview');
    assert.ok(diagramIds.includes('photo-diag-2'), 'Must have Diagram 2: Leaf internal cross-section');
    assert.ok(diagramIds.includes('photo-diag-3'), 'Must have Diagram 3: Chloroplast ultrastructure');
    assert.ok(diagramIds.includes('photo-diag-4'), 'Must have Diagram 4: Light-dependent reactions (Z-scheme)');
    assert.ok(diagramIds.includes('photo-diag-5'), 'Must have Diagram 5: Calvin cycle');
    assert.ok(diagramIds.includes('photo-diag-6'), 'Must have Diagram 6: Light Reactions vs Calvin Cycle Comparative Matrix');

    // Verify Leaf Internal Structure (Diagram 2) labels
    const leafDiagram = diagrams.find(d => d.diagramId === 'photo-diag-2');
    assert.ok(leafDiagram);
    assert.ok(leafDiagram.svgXml.includes('Upper Epidermis') || leafDiagram.svgXml.includes('Palisade'));
    assert.ok(leafDiagram.svgXml.includes('Stoma') || leafDiagram.svgXml.includes('Guard Cells'));
    assert.ok(leafDiagram.point2_labelledParts.some(p => p.label.toLowerCase().includes('palisade')));
    assert.ok(leafDiagram.point2_labelledParts.some(p => p.label.toLowerCase().includes('spongy')));
    assert.ok(leafDiagram.point2_labelledParts.some(p => p.label.toLowerCase().includes('xylem') || p.label.toLowerCase().includes('vein')));

    // Verify Chloroplast (Diagram 3) labels
    const chloroplast = diagrams.find(d => d.diagramId === 'photo-diag-3');
    assert.ok(chloroplast);
    assert.ok(chloroplast.svgXml.includes('Thylakoid'));
    assert.ok(chloroplast.svgXml.includes('Stroma'));
    assert.ok(chloroplast.svgXml.includes('Granum'));

    // Verify Light Reactions (Diagram 4) photolysis equation and complexes
    const lightRxn = diagrams.find(d => d.diagramId === 'photo-diag-4');
    assert.ok(lightRxn);
    assert.ok(lightRxn.svgXml.includes('PS II') || lightRxn.svgXml.includes('Photosystem II'));
    assert.ok(lightRxn.svgXml.includes('PS I') || lightRxn.svgXml.includes('Photosystem I'));
    assert.ok(lightRxn.svgXml.includes('ATP Synthase'));
    assert.ok(lightRxn.point6_stepByStepInterpretation.some(s => s.includes('photolyzed') || s.includes('H₂O') || s.includes('water')));

    // Verify Calvin Cycle (Diagram 5) RuBisCO and G3P
    const calvin = diagrams.find(d => d.diagramId === 'photo-diag-5');
    assert.ok(calvin);
    assert.ok(calvin.svgXml.includes('RuBisCO') || calvin.svgXml.includes('RuBP'));
    assert.ok(calvin.svgXml.includes('G3P') || calvin.svgXml.includes('PGA'));
    assert.ok(calvin.point8_whatToRemember.toLowerCase().includes('g3p') || calvin.point8_whatToRemember.toLowerCase().includes('glucose'));

    // Verify Comparative Matrix (Diagram 6)
    const compMatrix = diagrams.find(d => d.diagramId === 'photo-diag-6');
    assert.ok(compMatrix);
    assert.ok(compMatrix.svgXml.includes('Thylakoid Membrane') || compMatrix.svgXml.includes('Thylakoid'));
    assert.ok(compMatrix.svgXml.includes('Stroma'));
    assert.ok(compMatrix.svgXml.includes('NADPH') || compMatrix.svgXml.includes('ATP'));
  });

  await t.test('2. EducationalVisualPlanningEngine plans multi-diagram curriculum sequences', async () => {
    const plan = await EducationalVisualPlanningEngine.planVisual({
      topic: 'Photosynthesis',
      subject: 'Biology',
      gradeLevel: 'Class 10',
      curriculum: 'CBSE',
      learningObjective: 'Master light-dependent and light-independent phases of photosynthesis'
    });

    assert.ok(plan);
    assert.ok(plan.diagramSequence && plan.diagramSequence.length >= 6);
    assert.equal(plan.primaryCategory, VisualCategory.BIOLOGY_CELLULAR);
    assert.equal(plan.generationMode, 'programmatic_vector');
    assert.ok(plan.antiHallucinationChecklist.noArtisticMetaphors);
    assert.ok(plan.antiHallucinationChecklist.scientificallyVerifiedLabels);
    assert.ok(plan.selectedDiagram.svgXml.includes('<svg'));
    assert.ok(plan.selectedDiagram.stepByStepProcess.length >= 3);
    assert.ok(plan.selectedDiagram.keyComponents.length >= 4);
    assert.ok(plan.selectedDiagram.whyItHappens);
    assert.ok(plan.selectedDiagram.importantTakeaway);
  });

  await t.test('3. Visual Category classification across STEM and Humanities subjects', async () => {
    const testCases = [
      { topic: 'Human Heart Anatomy', subject: 'Biology', expected: VisualCategory.BIOLOGY_ANATOMY },
      { topic: 'Covalent Bonding in Methane', subject: 'Chemistry', expected: VisualCategory.CHEMISTRY_MOLECULAR },
      { topic: 'Electric Circuit with Ohm Law', subject: 'Physics', expected: VisualCategory.PHYSICS_CIRCUIT },
      { topic: 'Ray Diagram Convex Lens', subject: 'Physics', expected: VisualCategory.PHYSICS_OPTICS },
      { topic: 'Pythagorean Theorem Geometric Proof', subject: 'Mathematics', expected: VisualCategory.MATH_GEOMETRY },
      { topic: 'Indian Independence Movement 1857-1947', subject: 'History', expected: VisualCategory.HISTORY_TIMELINE },
      { topic: 'Plate Tectonics and Volcanoes', subject: 'Geography', expected: VisualCategory.GEOGRAPHY_EARTH },
      { topic: 'Binary Search Algorithm Flowchart', subject: 'Computer Science', expected: VisualCategory.CS_FLOWCHART }
    ];

    for (const tc of testCases) {
      const plan = await EducationalVisualPlanningEngine.planVisual({
        topic: tc.topic,
        subject: tc.subject,
        gradeLevel: 'Class 10'
      });
      assert.equal(plan.primaryCategory, tc.expected, `Expected ${tc.expected} for ${tc.topic}`);
      assert.ok(plan.selectedDiagram.svgXml.startsWith('<svg'));
    }
  });

  await t.test('4. Anti-Hallucination verification rejects artistic metaphors & invalid chemical schemas', () => {
    // Photosynthesis: food plate or chef rejected
    const badPhotoCheck = EducationalVisualPlanningEngine.verifyDiagramIntegrity(
      'Photosynthesis',
      'A cartoon plate of salad and a smiling chef holding sunlight in a pan',
      ['Lettuce', 'Plate', 'Fork']
    );
    assert.equal(badPhotoCheck.isValid, false);
    assert.ok(badPhotoCheck.violations.length > 0);

    // Heart: decorative valentine cartoon rejected
    const badHeartCheck = EducationalVisualPlanningEngine.verifyDiagramIntegrity(
      'Human Heart',
      'Cute red Valentine heart pierced by cupid arrow with floral border',
      ['Love', 'Arrow', 'Ribbon']
    );
    assert.equal(badHeartCheck.isValid, false);
    assert.ok(badHeartCheck.violations.some(v => v.includes('Valentine') || v.includes('heart symbol') || v.includes('anatomical')));

    // Good diagram verified
    const goodHeartCheck = EducationalVisualPlanningEngine.verifyDiagramIntegrity(
      'Human Heart',
      'Anatomical 4-chamber human heart diagram showing deoxygenated and oxygenated flow paths',
      ['Right Atrium', 'Right Ventricle', 'Left Atrium', 'Left Ventricle', 'Aorta', 'Pulmonary Artery']
    );
    assert.equal(goodHeartCheck.isValid, true);
  });

  await t.test('5. Multilingual translation for labels (English, Telugu, Hindi)', () => {
    const enPlan = EducationalVisualPlanningEngine.getMultilingualDiagram('photo-diag-2', 'en');
    assert.ok(enPlan.svgXml.includes('Upper Epidermis') || enPlan.svgXml.includes('Palisade'));

    const tePlan = EducationalVisualPlanningEngine.getMultilingualDiagram('photo-diag-2', 'te');
    assert.ok(tePlan.svgXml.includes('ఎపిడెర్మిస్') || tePlan.svgXml.includes('పాలిసేడ్') || tePlan.keyComponents.some(c => c.label.includes('పాలిసేడ్') || c.label.includes('ఎపిడెర్మిస్')));

    const hiPlan = EducationalVisualPlanningEngine.getMultilingualDiagram('photo-diag-2', 'hi');
    assert.ok(hiPlan.svgXml.includes('एपिडर्मिस') || hiPlan.svgXml.includes('पैलिसैड') || hiPlan.keyComponents.some(c => c.label.includes('पैलिसैड') || c.label.includes('एपिडर्मिस')));
  });

  await t.test('6. SavedNotesVisualUpgradeEngine: Audits note visuals into 5-tier classification', async () => {
    // Setup test note with legacy placeholder
    const testNoteId = 'test-note-photosynthesis-audit';
    helperSaveNote({
      id: testNoteId,
      student_id: 'student-qa-1',
      title: 'Photosynthesis Class 10 Notes',
      subject: 'Biology',
      grade_level: 'Class 10',
      board: 'CBSE',
      content_markdown: '# Photosynthesis\n\nPhotosynthesis is the process by which green plants make food.\n\n![Programmatic Educational Visual](data:image/svg+xml;base64,PHN2Zz48dGV4dD5Qcm9ncmFtbWF0aWMgRWR1Y2F0aW9uYWwgVmlzdWFsPC90ZXh0Pjwvc3ZnPg==)\n\nEnd of note.',
      summary: 'Summary of photosynthesis',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    const audit = await SavedNotesVisualUpgradeEngine.auditNoteVisuals(testNoteId);
    assert.ok(audit);
    assert.equal(audit.noteId, testNoteId);
    assert.ok(audit.overallHealthScore < 100, 'Legacy placeholder note should have < 100 health score');
    assert.ok(audit.needsUpgrade, 'Note with placeholder visuals must need upgrade');
    assert.ok(audit.items.length > 0);
    assert.ok(audit.items.some(it => it.classification === 'relevant_needs_improvement' || it.classification === 'valid_useful'));
    assert.ok(audit.missingProcessVisuals.length > 0, 'Should suggest missing high-yield process visuals');
  });

  await t.test('7. SavedNotesVisualUpgradeEngine: Safe upgrade with version history and rollback', async () => {
    const testNoteId = 'test-note-photosynthesis-upgrade';
    const originalContent = '# Photosynthesis Detailed\n\n$6CO_2 + 6H_2O \\rightarrow C_6H_{12}O_6 + 6O_2$\n\n![Old diagram](data:image/svg+xml;base64,PHN2Zz48dGV4dD5Qcm9ncmFtbWF0aWMgRWR1Y2F0aW9uYWwgVmlzdWFsPC90ZXh0Pjwvc3ZnPg==)\n\nStudent notes: remember RuBisCO.';
    
    helperSaveNote({
      id: testNoteId,
      student_id: 'student-qa-2',
      title: 'Photosynthesis Complete Lecture',
      subject: 'Biology',
      grade_level: 'Class 10',
      board: 'CBSE',
      content_markdown: originalContent,
      summary: 'Study note on photosynthesis',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // Execute safe upgrade
    const upgradeRes = await SavedNotesVisualUpgradeEngine.upgradeNoteVisuals(testNoteId, false);
    assert.ok(upgradeRes.success);
    assert.equal(upgradeRes.newVersionNumber, 2);
    assert.ok(upgradeRes.upgradedVisualCount >= 1);

    // Verify note was upgraded
    const upgradedNote = helperGetNote(testNoteId);
    assert.ok(upgradedNote);
    assert.equal(upgradedNote.visual_version, 2);
    assert.equal(upgradedNote.visual_upgrade_status, 'upgraded');
    // Student text and equations preserved
    assert.ok(upgradedNote.content_markdown.includes('RuBisCO'));
    assert.ok(upgradedNote.content_markdown.includes('6CO_2'));
    // New 5-part visual explanation structure added
    assert.ok(upgradedNote.content_markdown.includes('Scientific Diagram Explanation') || upgradedNote.content_markdown.includes('Visual Explanation'));
    assert.ok(upgradedNote.content_markdown.includes('Why it happens') || upgradedNote.content_markdown.includes('Key Components'));

    // Check version history has backup
    const history = getNoteVersionHistory(testNoteId);
    assert.ok(history.length >= 1);
    const backup = history[0];
    assert.equal(backup.content_markdown, originalContent);

    // Rollback to backup version
    const rollbackRes = await SavedNotesVisualUpgradeEngine.rollbackNoteVersion(testNoteId, backup.id);
    assert.ok(rollbackRes.success);

    // Verify rollback restored exact original content
    const restoredNote = helperGetNote(testNoteId);
    assert.equal(restoredNote.content_markdown, originalContent);
  });

  await t.test('8. Database schema & AI Tutor message editing / soft-delete functions', () => {
    // Verify softDeleteTutorMessage
    const testMsgId = 'test-msg-' + Date.now();
    db.prepare(`
      INSERT INTO tutor_messages (id, conversation_id, role, content, created_at)
      VALUES (?, 'conv-photosynthesis', 'user', 'What is photolysis?', ?)
    `).run(testMsgId, new Date().toISOString());

    updateTutorMessageContent(testMsgId, 'Explain photolysis of water in photosynthesis');
    const updated = db.prepare('SELECT content, edited_at FROM tutor_messages WHERE id = ?').get(testMsgId) as any;
    assert.equal(updated.content, 'Explain photolysis of water in photosynthesis');
    assert.ok(updated.edited_at);

    softDeleteTutorMessage(testMsgId);
    const deleted = db.prepare('SELECT is_deleted FROM tutor_messages WHERE id = ?').get(testMsgId) as any;
    assert.equal(deleted.is_deleted, 1);
  });
});
