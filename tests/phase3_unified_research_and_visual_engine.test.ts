import { test } from 'node:test';
import assert from 'node:assert/strict';
import { db, initDatabase, getVisualAssets, getResearchJobs, getSyllabusChangeLogs } from '../server/db.ts';
import { ResearchIntelligenceEngine } from '../server/researchIntelligenceEngine.ts';
import { UnifiedVisualIntelligenceEngine } from '../server/visualIntelligenceEngineUnified.ts';
import { knowledgeIntelligenceAdmin } from '../server/knowledgeIntelligenceAdmin.ts';

initDatabase();

test('STUDYAI Phase 3: Research Intelligence & Visual Generation Engine', async (t) => {

  await t.test('1. Research Pipeline: 8-Stage Execution with Zero-Hallucination & Publication', async () => {
    const result = await ResearchIntelligenceEngine.executeResearchPipeline({
      topic: 'Photosynthesis',
      subject: 'Biology',
      grade: 10,
      board: 'CBSE',
      priority: 1
    });

    assert.ok(result.jobId, 'Research job ID must be generated');
    assert.equal(result.topic, 'Photosynthesis');
    assert.equal(result.board, 'CBSE');
    assert.ok(result.confidenceScore >= 0.90, `Confidence score must be >= 0.90, got ${result.confidenceScore}`);
    
    // Verify all 8 stages were logged
    const stageNames = result.stages.map(s => s.stage);
    assert.ok(stageNames.includes('DISCOVER'), 'DISCOVER stage must be present');
    assert.ok(stageNames.includes('IDENTIFY'), 'IDENTIFY stage must be present');
    assert.ok(stageNames.includes('EXTRACT'), 'EXTRACT stage must be present');
    assert.ok(stageNames.includes('STRUCTURE'), 'STRUCTURE stage must be present');
    assert.ok(stageNames.includes('CROSS_CHECK'), 'CROSS_CHECK stage must be present');
    assert.ok(stageNames.includes('VERIFY'), 'VERIFY stage must be present');
    assert.ok(stageNames.includes('REVIEW'), 'REVIEW stage must be present');
    assert.ok(stageNames.includes('PUBLISH'), 'PUBLISH stage must be present');

    // Verify formulas syntax check passed
    assert.ok(result.formulas.length > 0, 'Formulas must be extracted');
    assert.ok(result.formulas.every(f => f.syntaxValid), 'All extracted formulas must have valid syntax');
    assert.ok(result.formulas.some(f => f.equation.includes('6CO₂') || f.equation.includes('C₆H₁₂O₆')), 'Balanced equation must be present');

    // Verify published document saved in database
    assert.ok(result.publishedDocumentId, 'Published document ID must exist');
    const doc = db.prepare('SELECT * FROM knowledge_documents WHERE id = ?').get(result.publishedDocumentId) as any;
    assert.ok(doc, 'Knowledge document must be persisted in database');
    assert.equal(doc.status, 'published_knowledge');
  });

  await t.test('2. Missing-Topic Gap Detection identifies gaps accurately', async () => {
    // Gap 1: Completely missing topic
    const missingTopic = ResearchIntelligenceEngine.detectTopicGaps('Quantum Chromodynamics In High School', 'Physics', 6, 'CBSE');
    assert.equal(missingTopic.hasGap, true);
    assert.ok(missingTopic.completenessScore < 0.5);

    // Gap 2: Universal topic known (Photosynthesis)
    const knownTopic = ResearchIntelligenceEngine.detectTopicGaps('Photosynthesis', 'Biology', 10, 'CBSE');
    assert.ok(typeof knownTopic.completenessScore === 'number');
    assert.ok(knownTopic.completenessScore >= 0.4);
  });

  await t.test('3. Cross-Board Source Conflict Resolution preserves board nuances', async () => {
    const result = await ResearchIntelligenceEngine.executeResearchPipeline({
      topic: 'Cellular Respiration and Photosynthesis Energy Yield',
      subject: 'Biology',
      grade: 10,
      board: 'ICSE',
      priority: 2
    });

    assert.ok(result.conflictsDetected.length > 0, 'Conflict between ICSE and CBSE ATP yield should be detected');
    const conflict = result.conflictsDetected[0];
    assert.ok(conflict.boardA.includes('ICSE'));
    assert.ok(conflict.boardB.includes('CBSE'));
    assert.ok(conflict.resolution.includes('context'), 'Conflict resolution must explain context without false consensus');
  });

  await t.test('4. Background Research Scheduler Controls (Pause & Resume)', async () => {
    assert.equal(ResearchIntelligenceEngine.isResearchPaused(), false);
    
    ResearchIntelligenceEngine.pauseResearch();
    assert.equal(ResearchIntelligenceEngine.isResearchPaused(), true);

    ResearchIntelligenceEngine.resumeResearch();
    assert.equal(ResearchIntelligenceEngine.isResearchPaused(), false);

    const jobs = getResearchJobs(undefined, 10);
    assert.ok(Array.isArray(jobs), 'Research jobs queue must be queryable');
    assert.ok(jobs.length > 0, 'Jobs from previous tests must be recorded');
  });

  await t.test('5. Syllabus Change Monitoring tracks curriculum diffs across Indian boards', async () => {
    const changes = ResearchIntelligenceEngine.monitorSyllabusChanges('ALL', '2025-2026');
    assert.ok(changes.length >= 4, 'Must monitor updates for CBSE, ICSE, AP, and TS boards');
    
    const boards = changes.map(c => c.board);
    assert.ok(boards.includes('CBSE'));
    assert.ok(boards.includes('ICSE'));
    assert.ok(boards.includes('AP_STATE'));
    assert.ok(boards.includes('TS_STATE'));

    const logged = getSyllabusChangeLogs('CBSE', '2025-2026');
    assert.ok(logged.length > 0, 'CBSE change logs must be persisted in database');
  });

  await t.test('6. Visual Intelligence Engine: Contextual Planning for 12 Benchmark Topics', async () => {
    const benchmarkTopics = [
      { topic: 'Photosynthesis', subject: 'Biology', expectedCategory: 'anatomical_diagram' },
      { topic: 'Human Heart', subject: 'Biology', expectedCategory: 'anatomical_diagram' },
      { topic: 'Plant Cell', subject: 'Biology', expectedCategory: 'anatomical_diagram' },
      { topic: 'DNA Double Helix', subject: 'Biology', expectedCategory: 'molecular_structure' },
      { topic: 'Digestive System', subject: 'Biology', expectedCategory: 'anatomical_diagram' },
      { topic: 'Chemical Bonding', subject: 'Chemistry', expectedCategory: 'molecular_structure' },
      { topic: 'Light Reflection and Refraction', subject: 'Physics', expectedCategory: 'ray_diagram' },
      { topic: 'Electric Circuit', subject: 'Physics', expectedCategory: 'circuit_schematic' },
      { topic: 'Water Cycle', subject: 'Geography', expectedCategory: 'geographic_cross_section' },
      { topic: 'Solar System', subject: 'Physics', expectedCategory: 'scientific_flowchart' },
      { topic: 'Pythagoras Theorem', subject: 'Mathematics', expectedCategory: 'geometric_proof' },
      { topic: 'Harappan Civilization', subject: 'History', expectedCategory: 'historical_map' }
    ];

    for (const b of benchmarkTopics) {
      const plan = UnifiedVisualIntelligenceEngine.planEducationalVisual({
        topic: b.topic,
        subject: b.subject,
        grade: 10,
        board: 'CBSE'
      });

      assert.equal(plan.topic, b.topic);
      assert.equal(plan.visualCategory, b.expectedCategory, `Topic ${b.topic} should produce category ${b.expectedCategory}`);
      assert.ok(plan.requiredComponents.length > 0, `Topic ${b.topic} must list required scientific components`);
      assert.ok(plan.promptInstructions.positivePrompt.length > 0);
      assert.ok(plan.promptInstructions.negativeExclusions.length >= 5, 'Must contain negative exclusions');
      assert.ok(plan.svgXml && plan.svgXml.includes('<svg'), `Topic ${b.topic} must produce valid SVG XML`);
      assert.equal(plan.verificationPassed, true);
    }
  });

  await t.test('7. Negative Visual Verification: Rejects Non-Scientific and Misleading Imagery', async () => {
    // Negative Case 1: Culinary food for Photosynthesis
    const foodVerification = UnifiedVisualIntelligenceEngine.verifyVisualAccuracy({
      topic: 'Photosynthesis',
      subject: 'Biology',
      candidateDescription: 'A delicious cheese pizza with vegetable toppings served on a restaurant table.'
    });
    assert.equal(foodVerification.verified, false);
    assert.equal(foodVerification.accuracyStatus, 'inaccurate');
    assert.ok(foodVerification.rejectionReason?.includes('culinary food'));

    // Negative Case 2: Romantic Valentine heart emoji for Human Heart anatomy
    const heartVerification = UnifiedVisualIntelligenceEngine.verifyVisualAccuracy({
      topic: 'Human Heart',
      subject: 'Biology',
      candidateDescription: 'A red shiny cartoon heart shape with a romantic red ribbon and flowers.'
    });
    assert.equal(heartVerification.verified, false);
    assert.equal(heartVerification.accuracyStatus, 'inaccurate');
    assert.ok(heartVerification.rejectionReason?.includes('romantic'));

    // Positive Case: Legitimate anatomical human heart
    const validHeart = UnifiedVisualIntelligenceEngine.verifyVisualAccuracy({
      topic: 'Human Heart',
      subject: 'Biology',
      candidateDescription: 'Anterior cross-section of the human heart showing Right Atrium, Left Atrium, Right Ventricle, Left Ventricle, and Aorta.'
    });
    assert.equal(validHeart.verified, true);
    assert.equal(validHeart.accuracyStatus, 'accurate');
    assert.ok(validHeart.matchingComponents.length >= 4);
  });

  await t.test('8. Multilingual Visual Overlay: English, Telugu, and Hindi Labels', async () => {
    const planEn = UnifiedVisualIntelligenceEngine.planEducationalVisual({
      topic: 'Photosynthesis',
      subject: 'Biology',
      language: 'en'
    });
    assert.ok(planEn.localizedLabels.some(l => l.label.includes('Chloroplast') || l.label.includes('Membrane')));

    const planTe = UnifiedVisualIntelligenceEngine.planEducationalVisual({
      topic: 'Photosynthesis',
      subject: 'Biology',
      language: 'te'
    });
    assert.ok(planTe.localizedLabels.some(l => l.label.includes('హరితరేణువు') || l.label.includes('పొర')));

    const planHi = UnifiedVisualIntelligenceEngine.planEducationalVisual({
      topic: 'Photosynthesis',
      subject: 'Biology',
      language: 'hi'
    });
    assert.ok(planHi.localizedLabels.some(l => l.label.includes('हरितलवक') || l.label.includes('झिल्ली')));
  });

  await t.test('9. Central Searchable Educational Image Asset Library', async () => {
    const allAssets = getVisualAssets();
    assert.ok(allAssets.length >= 12, 'Must contain at least the 12 baseline benchmark assets');

    const biologyAssets = getVisualAssets({ subject: 'Biology' });
    assert.ok(biologyAssets.length >= 5, 'Biology assets must be filtered');

    const heartAsset = getVisualAssets({ topic: 'Human Heart' });
    assert.ok(heartAsset.length >= 1);
    assert.equal(heartAsset[0].topic, 'Human Heart');
    assert.equal(heartAsset[0].license_type, 'CC-BY-4.0');
    assert.equal(heartAsset[0].attribution, 'STUDYAI Visual Intelligence Engine');
  });

  await t.test('10. Knowledge Intelligence Admin Dashboard incorporates Phase 3 Telemetry', async () => {
    const report = knowledgeIntelligenceAdmin.getDashboardReport();
    assert.ok(report.researchPipeline, 'Report must include researchPipeline telemetry');
    assert.ok(report.researchPipeline.totalJobs >= 1);
    assert.equal(report.researchPipeline.isSchedulerPaused, false);

    assert.ok(report.syllabusMonitoring, 'Report must include syllabusMonitoring telemetry');
    assert.ok(report.syllabusMonitoring.recentChangesCount >= 1);

    assert.ok(report.visualAssetIntelligence, 'Report must include visualAssetIntelligence telemetry');
    assert.ok(report.visualAssetIntelligence.totalAssetsCount >= 12);
    assert.ok(report.visualAssetIntelligence.categories.length >= 5);
  });
});
