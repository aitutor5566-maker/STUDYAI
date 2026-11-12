import test from 'node:test';
import assert from 'node:assert/strict';
import { initDatabase } from '../server/db.ts';
import { educationalVisualIntelligenceEngine } from '../server/educationalVisualIntelligenceEngine.ts';
import {
  SCIENTIFIC_VECTOR_REGISTRY,
  getDetailedScientificAsset
} from '../server/scientificVectorLibrary.ts';
import { generateScientificSvgDataUrl } from '../server/aiAdapter.ts';
import {
  PROCEDURAL_3D_BUILDERS,
  VERIFIED_MODEL_SPECS
} from '../src/utils/diagram3dModels.ts';

// Initialize in-memory / local test database
initDatabase();

test('Next-Gen Educational Visual Intelligence Engine Test Suite', async (t) => {
  await t.test('1. Visual Planning across Key Academic Disciplines', () => {
    const heartPlan = educationalVisualIntelligenceEngine.planVisual({
      topic: 'Structure of the Human Heart',
      subject: 'Biology',
      grade: 10,
      board: 'ICSE'
    });
    assert.strictEqual(heartPlan.modality, 'anatomical_cross_section');
    assert.strictEqual(heartPlan.recommendedModel3d, 'human_heart');
    assert.ok(heartPlan.expectedComponents.includes('Right Atrium'));
    assert.ok(heartPlan.expectedComponents.includes('Left Ventricle'));
    assert.ok(heartPlan.negativePrompt.length > 0);
    assert.ok(/coronal/i.test(heartPlan.imagePrompt));

    const dnaPlan = educationalVisualIntelligenceEngine.planVisual({
      topic: 'DNA Double Helix Structure',
      subject: 'Biology',
      grade: 10,
      board: 'CBSE'
    });
    assert.strictEqual(dnaPlan.modality, 'molecular_schematic');
    assert.strictEqual(dnaPlan.recommendedModel3d, 'dna_helix');
    assert.ok(dnaPlan.expectedComponents.includes('Adenine'));

    const bondingPlan = educationalVisualIntelligenceEngine.planVisual({
      topic: 'Chemical Bonding (Ionic vs Covalent)',
      subject: 'Chemistry',
      grade: 9,
      board: 'CBSE'
    });
    assert.strictEqual(bondingPlan.modality, 'molecular_schematic');
    assert.ok(bondingPlan.expectedComponents.includes('Valence Electron Transfer'));

    const newtonPlan = educationalVisualIntelligenceEngine.planVisual({
      topic: "Newton's Laws of Motion & Free-Body Diagram",
      subject: 'Physics',
      grade: 11,
      board: 'CBSE'
    });
    assert.strictEqual(newtonPlan.modality, 'physics_vector_schematic');
    assert.ok(newtonPlan.expectedComponents.includes('Normal Reaction Force N'));
  });

  await t.test('2. High-Precision Scientific Vector Library Integrity', () => {
    const topicsToCheck = [
      'human_heart',
      'human_brain',
      'dna_helix',
      'plant_cell',
      'chemical_bonding',
      'newton_motion',
      'water_cycle'
    ];

    for (const key of topicsToCheck) {
      const asset = SCIENTIFIC_VECTOR_REGISTRY[key];
      assert.ok(asset, `Asset ${key} must exist in SCIENTIFIC_VECTOR_REGISTRY`);
      assert.ok(asset.svgXml.includes('<svg'), `${key} SVG must be valid SVG xml`);
      assert.ok(asset.svgXml.includes('</svg>'), `${key} SVG must close properly`);
      assert.ok(asset.labels.length >= 4, `${key} must have at least 4 programmatic labels`);
      assert.ok(asset.walkthrough.whatItShows.length > 10, `${key} must have walkthrough explanation`);
      assert.ok(asset.walkthrough.importantComponents.length >= 3, `${key} must list important components`);
      assert.ok(asset.walkthrough.examTakeaway.length > 10, `${key} must have exam takeaway`);

      // Verify absence of simplistic generic block blueprint shapes
      assert.ok(
        !asset.svgXml.includes('1. Core Definition &amp; Inputs') &&
        !asset.svgXml.includes('1. Core Definition & Inputs'),
        `${key} must NOT be a generic 4-box blueprint placeholder`
      );
    }
  });

  await t.test('3. Topic Resolver getDetailedScientificAsset Matching', () => {
    const heartRes = getDetailedScientificAsset('Human Heart Circulation');
    assert.ok(heartRes);
    assert.strictEqual(heartRes.topic, 'Structure of the Human Heart');

    const brainRes = getDetailedScientificAsset('Human Brain Sagittal View');
    assert.ok(brainRes);
    assert.ok(brainRes.labels.some((l) => l.name.includes('Cerebellum')));

    const dnaRes = getDetailedScientificAsset('Watson and Crick DNA double helix');
    assert.ok(dnaRes);
    assert.strictEqual(dnaRes.subject, 'Biology');

    const bondingRes = getDetailedScientificAsset('Ionic and Covalent bond formation');
    assert.ok(bondingRes);
    assert.strictEqual(bondingRes.subject, 'Chemistry');

    const waterRes = getDetailedScientificAsset('Hydrologic Water Cycle precipitation');
    assert.ok(waterRes);
    assert.strictEqual(waterRes.subject, 'Geography');
  });

  await t.test('4. Automated Quality Assessment Pipeline', () => {
    const plan = educationalVisualIntelligenceEngine.planVisual({
      topic: 'Structure of the Human Heart',
      subject: 'Biology',
      grade: 10,
      board: 'ICSE'
    });

    const asset = SCIENTIFIC_VECTOR_REGISTRY.human_heart;
    const assessment = educationalVisualIntelligenceEngine.evaluateVisualQuality(asset.svgXml, plan);

    assert.ok(assessment.relevanceScore >= 80, 'Relevance must be >= 80');
    assert.ok(assessment.scientificAccuracyScore >= 80, 'Accuracy must be >= 80');
    assert.ok(assessment.structuralCompletenessScore >= 60, 'Completeness must be >= 60');
    assert.ok(assessment.labelClarityScore >= 80, 'Label clarity must be >= 80');
    assert.ok(assessment.qualityScore >= 75, 'Overall quality score must be >= 75');
    assert.ok(
      assessment.overallStatus === 'approved' || assessment.overallStatus === 'approved_with_limitations',
      `Overall status must be acceptable, got ${assessment.overallStatus}`
    );
  });

  await t.test('5. Procedural 3D Model Builders in Three.js Engine', () => {
    // Check registered builders in PROCEDURAL_3D_BUILDERS
    assert.ok(typeof PROCEDURAL_3D_BUILDERS.human_heart === 'function', 'Heart 3D builder must exist');
    assert.ok(typeof PROCEDURAL_3D_BUILDERS.dna_helix === 'function', 'DNA 3D builder must exist');
    assert.ok(typeof PROCEDURAL_3D_BUILDERS.plant_cell === 'function', 'Plant Cell 3D builder must exist');
    assert.ok(typeof PROCEDURAL_3D_BUILDERS.electric_circuit === 'function', 'Circuit 3D builder must exist');

    // Execute builders and test group output
    const heart3d = PROCEDURAL_3D_BUILDERS.human_heart();
    assert.ok(heart3d.rootGroup, 'Heart 3D result must have rootGroup');
    assert.ok(Object.keys(heart3d.components).length >= 4, 'Heart 3D components must have >= 4 elements');
    assert.ok(heart3d.components.aorta, 'Heart 3D must have aorta');

    const dna3d = PROCEDURAL_3D_BUILDERS.dna_helix();
    assert.ok(dna3d.rootGroup, 'DNA 3D result must have rootGroup');
    assert.ok(Object.keys(dna3d.components).length >= 2, 'DNA 3D components must exist');

    const plantCell3d = PROCEDURAL_3D_BUILDERS.plant_cell();
    assert.ok(plantCell3d.rootGroup, 'Plant cell 3D result must have rootGroup');
    assert.ok(plantCell3d.components.chloroplasts, 'Plant cell 3D must have chloroplasts');

    // Verify verified specs
    assert.ok(VERIFIED_MODEL_SPECS.human_heart, 'Verified spec for heart must exist');
    assert.ok(VERIFIED_MODEL_SPECS.dna_helix, 'Verified spec for dna_helix must exist');
    assert.ok(VERIFIED_MODEL_SPECS.plant_cell, 'Verified spec for plant_cell must exist');
    assert.ok(VERIFIED_MODEL_SPECS.human_heart.parts.length >= 4, 'Heart parts in spec must be >= 4');
  });

  await t.test('6. aiAdapter generateScientificSvgDataUrl Integration', () => {
    const heartSvg = generateScientificSvgDataUrl('Structure of the Human Heart');
    assert.ok(heartSvg.dataUrl.startsWith('data:image/svg+xml;base64,'), 'Heart SVG data URL must be generated');
    const heartDecoded = Buffer.from(heartSvg.dataUrl.split(',')[1], 'base64').toString('utf-8');
    assert.ok(heartDecoded.includes('Vena Cava'), 'Decoded SVG must contain Vena Cava');
    assert.ok(heartDecoded.includes('Aorta'), 'Decoded SVG must contain Aorta');
    assert.ok(heartDecoded.includes('Right Atrium'), 'Decoded SVG must contain Right Atrium');
    assert.ok(heartDecoded.includes('Left Ventricle'), 'Decoded SVG must contain Left Ventricle');
    assert.ok(!heartDecoded.includes('1. Core Definition'), 'Decoded SVG must NOT be fallback block blueprint');

    const brainSvg = generateScientificSvgDataUrl('Human Brain Structure');
    const brainDecoded = Buffer.from(brainSvg.dataUrl.split(',')[1], 'base64').toString('utf-8');
    assert.ok(brainDecoded.includes('Frontal Lobe'), 'Brain SVG must contain Frontal Lobe');
    assert.ok(brainDecoded.includes('Cerebellum'), 'Brain SVG must contain Cerebellum');
  });

  await t.test('7. End-to-End produceEducationalVisual Execution', async () => {
    const visual = await educationalVisualIntelligenceEngine.produceEducationalVisual({
      topic: 'Human Heart Internal Structure',
      grade: 10,
      board: 'ICSE',
      preferredSource: 'vector'
    });

    assert.ok(visual.assetId, 'Visual output must have assetId');
    assert.strictEqual(visual.topic, 'Human Heart Internal Structure');
    assert.ok(visual.dataUrl.startsWith('data:image/svg+xml;base64,'));
    assert.ok(visual.labels.length >= 4, 'Visual must include programmatic labels');
    assert.ok(visual.walkthrough.whatItShows.length > 10, 'Visual must include walkthrough explanation');
    assert.strictEqual(visual.interactive3dSupported, true, 'Heart must support interactive 3D');
    assert.strictEqual(visual.recommendedModel3d, 'human_heart');
    assert.ok(
      visual.qualityAssessment.overallStatus === 'approved' ||
      visual.qualityAssessment.overallStatus === 'approved_with_limitations'
    );
  });

  await t.test('8. Admin Visual Intelligence Metrics & Monitoring', () => {
    const metrics = educationalVisualIntelligenceEngine.getVisualIntelligenceMetrics();
    assert.strictEqual(metrics.status, 'operational');
    assert.ok(metrics.verifiedVectorAssetsCount >= 7, 'Must have at least 7 verified vector schematics');
    assert.ok(metrics.supportedInteractive3dModels.includes('human_heart'));
    assert.ok(metrics.supportedInteractive3dModels.includes('dna_helix'));
    assert.ok(metrics.supportedInteractive3dModels.includes('plant_cell'));
    assert.ok(metrics.supportedDisciplines.includes('Biology'));
    assert.ok(metrics.supportedDisciplines.includes('Chemistry'));
    assert.ok(metrics.supportedDisciplines.includes('Physics'));
  });
});
