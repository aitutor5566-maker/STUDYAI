import test from 'node:test';
import assert from 'node:assert/strict';
import { initDatabase } from '../server/db.ts';
import { educationalVisualIntelligenceEngine } from '../server/educationalVisualIntelligenceEngine.ts';
import {
  SCIENTIFIC_VECTOR_REGISTRY,
  getDetailedScientificAsset
} from '../server/scientificVectorLibrary.ts';
import { generateEducationalImage, generateScientificSvgDataUrl } from '../server/aiAdapter.ts';

initDatabase();

test('STUDYAI – Advanced Educational Image Intelligence & Side-by-Side Visual Teaching Test Suite', async (t) => {
  await t.test('1. Visual Coverage across all benchmark subjects & topics', () => {
    const benchmarkTopics = [
      { topic: 'Photosynthesis', subject: 'Biology', expectedKeyword: 'Calvin Cycle' },
      { topic: 'Structure of the Human Heart', subject: 'Biology', expectedKeyword: 'Ventricle' },
      { topic: 'DNA Double Helix', subject: 'Biology', expectedKeyword: 'Adenine' },
      { topic: 'Human Digestive System', subject: 'Biology', expectedKeyword: 'Alimentary' },
      { topic: 'Atomic Structure (Bohr Model)', subject: 'Chemistry', expectedKeyword: 'Nucleus' },
      { topic: 'Chemical Bonding (Ionic & Covalent)', subject: 'Chemistry', expectedKeyword: 'Electron' },
      { topic: 'Chemical Reactions and Equations', subject: 'Chemistry', expectedKeyword: 'Activation Energy' },
      { topic: 'Force and Motion', subject: 'Physics', expectedKeyword: 'Normal' },
      { topic: 'Simple Electric Circuits (Ohms Law)', subject: 'Physics', expectedKeyword: 'Ammeter' },
      { topic: 'Reflection and Refraction of Light', subject: 'Physics', expectedKeyword: 'Convex Lens' },
      { topic: 'Work, Power and Energy', subject: 'Physics', expectedKeyword: 'Kinetic Energy' },
      { topic: 'Simple Machines and Levers', subject: 'Physics', expectedKeyword: 'Fulcrum' },
      { topic: 'Fractions and Rational Numbers', subject: 'Mathematics', expectedKeyword: 'Equivalent' },
      { topic: 'Euclidean Geometry & Pythagoras', subject: 'Mathematics', expectedKeyword: 'Hypotenuse' },
      { topic: 'Algebra and Coordinate Graphs', subject: 'Mathematics', expectedKeyword: 'Slope' },
      { topic: 'Plate Tectonics & Continental Drift', subject: 'Geography', expectedKeyword: 'Subduction' },
      { topic: 'Earth Water Cycle', subject: 'Geography', expectedKeyword: 'Precipitation' },
      { topic: 'World War II Chronology', subject: 'History', expectedKeyword: 'Stalingrad' },
      { topic: 'Indian Independence Movement', subject: 'History', expectedKeyword: 'Dandi' },
      { topic: 'English Grammar Sentence Structure', subject: 'English', expectedKeyword: 'Predicate' },
      { topic: 'Binary Search Algorithm', subject: 'Computer Science', expectedKeyword: 'Divide-and-Conquer' }
    ];

    for (const b of benchmarkTopics) {
      const asset = getDetailedScientificAsset(b.topic);
      assert.ok(asset, `Detailed visual asset must resolve for topic "${b.topic}"`);
      assert.ok(asset.title.length > 5, `Asset for "${b.topic}" must have a descriptive title`);
      assert.ok(asset.caption.length > 15, `Asset for "${b.topic}" must have a detailed pedagogical caption`);
      assert.ok(asset.walkthrough.whatItShows.length > 10, `Walkthrough must explain what it shows`);
      assert.ok(asset.walkthrough.importantComponents.length >= 2, `Walkthrough must have >=2 important components`);
      assert.ok(asset.walkthrough.processSequence.length >= 2, `Walkthrough must outline process sequence`);
      assert.ok(asset.walkthrough.examTakeaway.length > 10, `Walkthrough must have exam takeaway`);
      assert.ok(asset.labels.length >= 3, `Asset must have at least 3 labeled callouts`);

      // Verify that the SVG uses responsive vector attributes and does NOT have forced pixel lock
      assert.ok(
        asset.svgXml.includes('viewBox="0 0 840 520"') &&
        asset.svgXml.includes('preserveAspectRatio="xMidYMid meet"'),
        `Asset "${b.topic}" SVG must be responsive with viewBox and preserveAspectRatio`
      );
    }
  });

  await t.test('2. Anti-distortion and no simplistic block placeholders', () => {
    for (const [key, asset] of Object.entries(SCIENTIFIC_VECTOR_REGISTRY)) {
      assert.ok(
        !asset.svgXml.includes('1. Core Definition & Inputs') &&
        !asset.svgXml.includes('1. Core Definition &amp; Inputs'),
        `Asset "${key}" must not contain generic 4-box blueprint placeholder`
      );
      assert.ok(
        asset.labels.length >= 3,
        `Asset "${key}" must contain authentic educational labels`
      );
    }
  });

  await t.test('3. Topic Resolver getDetailedScientificAsset Fuzzy Matching', () => {
    assert.strictEqual(getDetailedScientificAsset('Light reflection refraction convex lens')?.visualType, 'physics_vector_schematic');
    assert.strictEqual(getDetailedScientificAsset('Bohr Atomic Structure & shells')?.visualType, 'molecular_schematic');
    assert.strictEqual(getDetailedScientificAsset('Photosynthesis in chloroplasts')?.visualType, 'biological_process_diagram');
    assert.strictEqual(getDetailedScientificAsset('Human digestive tract and peristalsis')?.visualType, 'anatomical_cross_section');
    assert.strictEqual(getDetailedScientificAsset('Work, Power, Energy calculations')?.visualType, 'physics_vector_schematic');
    assert.strictEqual(getDetailedScientificAsset('Simple Machines levers and pulleys')?.visualType, 'physics_vector_schematic');
    assert.strictEqual(getDetailedScientificAsset('Equivalent Fractions and number line')?.visualType, 'mathematical_vector_geometry');
    assert.strictEqual(getDetailedScientificAsset('Pythagorean theorem in geometry')?.visualType, 'mathematical_vector_geometry');
    assert.strictEqual(getDetailedScientificAsset('Coordinate graphs parabola and slope')?.visualType, 'mathematical_vector_geometry');
    assert.strictEqual(getDetailedScientificAsset('Plate tectonics subduction trench')?.visualType, 'geological_cross_section');
    assert.strictEqual(getDetailedScientificAsset('World War 2 allied and axis timeline')?.visualType, 'historical_timeline_infographic');
    assert.strictEqual(getDetailedScientificAsset('Indian independence freedom struggle 1857 to 1947')?.visualType, 'historical_timeline_infographic');
    assert.strictEqual(getDetailedScientificAsset('English Grammar active to passive voice')?.visualType, 'historical_timeline_infographic');
    assert.strictEqual(getDetailedScientificAsset('Binary search algorithm O(log n)')?.visualType, 'physics_vector_schematic');
  });

  await t.test('4. Automated Quality Assessment Pipeline Validation', () => {
    const plan = educationalVisualIntelligenceEngine.planVisual({
      topic: 'Photosynthesis',
      subject: 'Biology',
      grade: 10,
      board: 'CBSE'
    });

    const asset = SCIENTIFIC_VECTOR_REGISTRY.photosynthesis;
    const assessment = educationalVisualIntelligenceEngine.evaluateVisualQuality(asset.svgXml, plan);

    assert.ok(assessment.relevanceScore >= 80);
    assert.ok(assessment.scientificAccuracyScore >= 80);
    assert.ok(assessment.qualityScore >= 75);
    assert.ok(
      assessment.overallStatus === 'approved' || assessment.overallStatus === 'approved_with_limitations'
    );
  });

  await t.test('5. End-to-End Educational Visual Production Integration', async () => {
    const visual = await educationalVisualIntelligenceEngine.produceEducationalVisual({
      topic: 'Photosynthesis in Green Plants',
      subject: 'Biology',
      grade: 10,
      board: 'CBSE',
      preferredSource: 'vector'
    });

    assert.ok(visual.dataUrl.startsWith('data:image/svg+xml;base64,'));
    assert.strictEqual(visual.sourceType, 'scientific_vector');
    assert.ok(visual.labels.length >= 4);
    assert.ok(visual.walkthrough.whatItShows.length > 20);
    assert.ok(visual.walkthrough.importantComponents.length >= 2);
    assert.ok(visual.walkthrough.examTakeaway.includes('Balanced Equation') || visual.walkthrough.examTakeaway.length > 10);
  });

  await t.test('6. generateEducationalImage backward compatibility & rich payload', async () => {
    const res = await generateEducationalImage('Human Digestive System', 'Class 10 Biology', false);
    assert.ok(res.dataUrl.startsWith('data:image/svg+xml;base64,'));
    assert.ok(res.caption.includes('Digestive') || res.caption.length > 10);
    assert.ok(res.validation.isAcceptable === true);
    assert.ok(res.explanation.whatItShows.length > 10);
    assert.ok(res.explanation.importantComponents.length >= 2);
  });

  await t.test('7. Admin Visual Intelligence Metrics API', () => {
    const metrics = educationalVisualIntelligenceEngine.getVisualIntelligenceMetrics();
    assert.strictEqual(metrics.status, 'operational');
    assert.ok(metrics.verifiedVectorAssetsCount >= 20, `Must have >=20 verified vector schematics, got ${metrics.verifiedVectorAssetsCount}`);
    assert.ok(metrics.supportedDisciplines.includes('Biology'));
    assert.ok(metrics.supportedDisciplines.includes('Chemistry'));
    assert.ok(metrics.supportedDisciplines.includes('Physics'));
    assert.ok(metrics.supportedDisciplines.includes('Geography'));
    assert.ok(metrics.supportedDisciplines.includes('Mathematics'));
    assert.ok(metrics.supportedDisciplines.includes('History'));
  });
});
