import test from 'node:test';
import assert from 'node:assert/strict';
import {
  planTopicEducationalVisuals,
  getSubtopicDiagramsForTopic,
  findDiagramForSpecificConcept,
  type ImageGenerationInstruction
} from '../server/subtopicDiagramCatalog.ts';
import { generateTutorExplanation } from '../server/aiAdapter.ts';
import { db } from '../server/db.ts';

test('STUDYAI Topic-Accurate Educational Image Generation & Clean AI Tutor Initial State', async (t) => {
  await t.test('1. Six-Step Visual Explanation Plan: Photosynthesis Benchmark (5 Subtopic Diagrams)', () => {
    const plan = planTopicEducationalVisuals({
      topic: 'Photosynthesis',
      subject: 'Biology',
      grade: 10,
      board: 'CBSE'
    });

    assert.equal(plan.step1_studentRequest.mainTopic, 'Photosynthesis');
    assert.equal(plan.step1_studentRequest.subject, 'Biology');
    assert.equal(plan.step1_studentRequest.grade, 10);
    assert.ok(plan.step3_visualPlan.diagramCount >= 5);
    assert.ok(plan.step5_diagrams.length >= 5);
    assert.equal(plan.step6_validation.isValid, true);
    assert.equal(plan.step6_validation.allLabelsAccurate, true);

    const keys = plan.step5_diagrams.map((d) => d.subtopicKey);
    assert.ok(keys.includes('overall_overview'));
    assert.ok(keys.includes('chloroplast_structure'));
    assert.ok(keys.includes('light_reactions'));
    assert.ok(keys.includes('calvin_cycle'));
    assert.ok(keys.includes('chemical_equation'));
  });

  await t.test('2. Six-Step Visual Explanation Plan: Human Heart Benchmark (5 Subtopic Diagrams)', () => {
    const plan = planTopicEducationalVisuals({
      topic: 'Human Heart',
      subject: 'Biology',
      grade: 10
    });

    assert.equal(plan.step5_diagrams.length, 5);
    const keys = plan.step5_diagrams.map((d) => d.subtopicKey);
    assert.ok(keys.includes('external_anatomy'));
    assert.ok(keys.includes('four_chambers'));
    assert.ok(keys.includes('double_circulation'));
    assert.ok(keys.includes('cardiac_conduction'));
    assert.ok(keys.includes('valves_vessels'));
  });

  await t.test('3. Six-Step Visual Explanation Plan: Mitosis Benchmark (4 Subtopic Diagrams)', () => {
    const plan = planTopicEducationalVisuals({
      topic: 'Mitosis',
      subject: 'Biology',
      grade: 10
    });

    assert.equal(plan.step5_diagrams.length, 4);
    const keys = plan.step5_diagrams.map((d) => d.subtopicKey);
    assert.ok(keys.includes('interphase_cell_cycle'));
    assert.ok(keys.includes('prophase_metaphase'));
    assert.ok(keys.includes('anaphase_telophase'));
    assert.ok(keys.includes('cytokinesis_daughter_cells'));

    // Verify 8-point pedagogical analysis
    for (const diag of plan.step5_diagrams) {
      assert.ok(diag.point1_whatItRepresents.length > 20);
      assert.ok(diag.point2_labelledParts.length >= 3);
      assert.ok(diag.point3_componentFunctions.length > 20);
      assert.ok(diag.point4_componentRelationships.length > 20);
      assert.ok(diag.point5_directionOfMovementOrProcess.length > 20);
      assert.ok(diag.point6_stepByStepInterpretation.length >= 3);
      assert.ok(diag.point7_learningOutcome.length > 20);
      assert.ok(diag.point8_whatToRemember.length > 10);
    }
  });

  await t.test('4. Six-Step Visual Explanation Plan: Chemical Bonding Benchmark (3 Subtopic Diagrams)', () => {
    const plan = planTopicEducationalVisuals({
      topic: 'Chemical Bonding',
      subject: 'Chemistry',
      grade: 10
    });

    assert.equal(plan.step5_diagrams.length, 3);
    const keys = plan.step5_diagrams.map((d) => d.subtopicKey);
    assert.ok(keys.includes('ionic_bonding'));
    assert.ok(keys.includes('covalent_bonding'));
    assert.ok(keys.includes('metallic_bonding'));
  });

  await t.test("5. Six-Step Visual Explanation Plan: Newton's Laws of Motion Benchmark (3 Subtopic Diagrams)", () => {
    const plan = planTopicEducationalVisuals({
      topic: "Newton's Laws of Motion",
      subject: 'Physics',
      grade: 9
    });

    assert.equal(plan.step5_diagrams.length, 3);
    const keys = plan.step5_diagrams.map((d) => d.subtopicKey);
    assert.ok(keys.includes('law_1_inertia'));
    assert.ok(keys.includes('law_2_dynamics'));
    assert.ok(keys.includes('law_3_action_reaction'));
  });

  await t.test('6. Six-Step Visual Explanation Plan: Fractions & Water Cycle Benchmarks', () => {
    const fractionsPlan = planTopicEducationalVisuals({
      topic: 'Fractions',
      subject: 'Mathematics',
      grade: 6
    });
    assert.equal(fractionsPlan.step5_diagrams.length, 3);
    const fracKeys = fractionsPlan.step5_diagrams.map((d) => d.subtopicKey);
    assert.ok(fracKeys.includes('equal_partitions'));
    assert.ok(fracKeys.includes('number_line'));
    assert.ok(fracKeys.includes('equivalent_fractions'));

    const waterPlan = planTopicEducationalVisuals({
      topic: 'Water Cycle',
      subject: 'Science',
      grade: 7
    });
    assert.equal(waterPlan.step5_diagrams.length, 3);
    const waterKeys = waterPlan.step5_diagrams.map((d) => d.subtopicKey);
    assert.ok(waterKeys.includes('hydrological_overview'));
    assert.ok(waterKeys.includes('evapotranspiration'));
    assert.ok(waterKeys.includes('condensation_precipitation'));
  });

  await t.test('7. Structured Image-Generation Instructions (Step 4 Schema Integrity)', () => {
    const plan = planTopicEducationalVisuals({
      topic: 'Human Heart',
      subject: 'Biology',
      grade: 10
    });

    assert.ok(plan.step4_imageInstructions.length >= 5);
    for (const inst of plan.step4_imageInstructions) {
      assert.ok(inst.mainTopic.length > 0);
      assert.ok(inst.subtopic.length > 0);
      assert.ok(inst.subject.length > 0);
      assert.ok(inst.gradeComplexity.length > 0);
      assert.ok(inst.diagramType.length > 0);
      assert.ok(Array.isArray(inst.requiredObjects) && inst.requiredObjects.length >= 3);
      assert.ok(Array.isArray(inst.requiredComponents) && inst.requiredComponents.length >= 3);
      assert.ok(Array.isArray(inst.requiredLabels) && inst.requiredLabels.length >= 3);
      assert.ok(inst.spatialRelationships && inst.spatialRelationships.length > 15);
      assert.ok(inst.arrowsAndDirections && inst.arrowsAndDirections.length > 15);
      assert.ok(inst.colorGuidance.length > 10);
      assert.ok(inst.backgroundGuidance.length > 5);
      assert.ok(inst.visualStyle.length > 5);
      assert.ok(inst.educationalPurpose.length > 15);
      assert.ok(Array.isArray(inst.thingsThatMustNotAppear) && inst.thingsThatMustNotAppear.length >= 2);
    }
  });

  await t.test('8. Specific Concept Targeting: Left Ventricle in Human Heart', () => {
    // When a student asks about the left ventricle, the 4 chambers & valves diagram must be selected / prioritized
    const found = findDiagramForSpecificConcept('Human Heart', 'left ventricle', 'Biology');
    assert.ok(found, 'Should find specific diagram for left ventricle');
    assert.equal(found?.subtopicKey, 'four_chambers');
    assert.ok(found?.point2_labelledParts.some((p) => p.label.toLowerCase().includes('left ventricle')));

    const targetedPlan = planTopicEducationalVisuals({
      topic: 'Human Heart',
      specificConcept: 'left ventricle',
      subject: 'Biology'
    });
    // The first diagram must be the four chambers diagram showing the left ventricle
    assert.equal(targetedPlan.step5_diagrams[0].subtopicKey, 'four_chambers');
  });

  await t.test('9. Specific Concept Targeting: Chlorophyll in Photosynthesis', () => {
    const found = findDiagramForSpecificConcept('Photosynthesis', 'chlorophyll and thylakoids', 'Biology');
    assert.ok(found, 'Should find specific diagram for chlorophyll');
    assert.equal(found?.subtopicKey, 'chloroplast_structure');
    assert.ok(
      found?.point2_labelledParts.some((p) =>
        p.description.toLowerCase().includes('chlorophyll') || p.label.toLowerCase().includes('chlorophyll')
      )
    );
  });

  await t.test('10. AI Tutor Grounds Specific Question on Targeted Component without Resetting Topic', async () => {
    const explanation = await generateTutorExplanation({
      topic: 'Human Heart',
      question: 'What is the function of the left ventricle and why does it have thick walls?',
      mode: 'simple',
      subject: 'Biology',
      studentName: 'Aarav',
      selectedVisualComponent: { id: 'lv-1', label: 'Left Ventricle', role: 'Systemic pump' }
    });

    assert.equal(explanation.studentName, 'Aarav');
    assert.ok(explanation.lessonImages.length >= 5, 'Should include human heart multi-diagrams');
    // First image must be the four chambers diagram where the left ventricle is labeled
    const firstImg = explanation.lessonImages[0];
    assert.ok(
      firstImg.title.toLowerCase().includes('chambers') ||
      firstImg.explanation.importantParts.some((p: any) => p.label.toLowerCase().includes('left ventricle')),
      'Elevated diagram should be the chambers diagram highlighting the left ventricle'
    );
    assert.ok(firstImg.imageUrl.startsWith('data:image/svg+xml'), 'Should be decodable vector SVG');
    assert.equal(firstImg.validation.exists, true);
    assert.equal(firstImg.validation.labelsVerified, true);
  });

  await t.test('11. Database Multi-Student Conversation Isolation', () => {
    const student1 = 'test-student-alpha';
    const student2 = 'test-student-beta';
    const conv1 = 'conv-test-alpha-1';
    const conv2 = 'conv-test-beta-1';
    const now = new Date().toISOString();

    // Insert users with all required columns
    db.prepare(`
      INSERT OR REPLACE INTO users (id, name, email, grade, board, avatar_url, parent_passcode_hash, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(student1, 'Alpha', 'alpha@test.com', '10', 'CBSE', '/avatars/1.png', 'hash1', now);

    db.prepare(`
      INSERT OR REPLACE INTO users (id, name, email, grade, board, avatar_url, parent_passcode_hash, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(student2, 'Beta', 'beta@test.com', '9', 'CBSE', '/avatars/2.png', 'hash2', now);

    db.prepare('INSERT OR REPLACE INTO tutor_conversations (id, user_id, topic, subject, level, mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(conv1, student1, 'Photosynthesis', 'Science', 'Grade 10', 'simple', now, now);
    db.prepare('INSERT OR REPLACE INTO tutor_conversations (id, user_id, topic, subject, level, mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(conv2, student2, 'Human Heart', 'Biology', 'Grade 9', 'detailed', now, now);

    // Verify student 1 only sees their own conversation
    const student1Convs = db.prepare('SELECT * FROM tutor_conversations WHERE user_id = ?').all(student1) as any[];
    assert.ok(student1Convs.some((c) => c.id === conv1));
    assert.ok(!student1Convs.some((c) => c.id === conv2), 'Student 1 must NEVER see Student 2 conversations');

    // Verify student 2 only sees their own conversation
    const student2Convs = db.prepare('SELECT * FROM tutor_conversations WHERE user_id = ?').all(student2) as any[];
    assert.ok(student2Convs.some((c) => c.id === conv2));
    assert.ok(!student2Convs.some((c) => c.id === conv1), 'Student 2 must NEVER see Student 1 conversations');

    // Clean up test rows
    db.prepare('DELETE FROM tutor_conversations WHERE id IN (?, ?)').run(conv1, conv2);
    db.prepare('DELETE FROM users WHERE id IN (?, ?)').run(student1, student2);
  });
});
