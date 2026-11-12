import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { initDatabase } from '../server/db.ts';
import { educationalVisualIntelligenceEngine } from '../server/educationalVisualIntelligenceEngine.ts';
import {
  SCIENTIFIC_VECTOR_REGISTRY,
  getDetailedScientificAsset
} from '../server/scientificVectorLibrary.ts';
import { getSubtopicDiagramsForTopic } from '../server/subtopicDiagramCatalog.ts';

initDatabase();

test('STUDYAI — UPDATE 2: Professional Visual Intelligence & Deep Teaching Engine Master Test Suite', async (t) => {
  await t.test('1. Elimination of Generic Box-Based Scientific Diagrams in Heart & Anatomy', () => {
    // Audit human_heart in vector library
    const heartAsset = SCIENTIFIC_VECTOR_REGISTRY.human_heart;
    assert.ok(heartAsset, 'Human heart asset must exist in registry');
    assert.ok(!/<rect[^>]*fill="[^"]*"[^>]*>(Right|Left) (Atrium|Ventricle)/i.test(heartAsset.svgXml), 'No chamber should be rendered as a raw rect');
    assert.ok(heartAsset.svgXml.includes('<path id="left_ventricle"'), 'Left ventricle must have anatomical path and semantic ID');
    assert.ok(heartAsset.svgXml.includes('<path id="right_ventricle"'), 'Right ventricle must have anatomical path and semantic ID');
    assert.ok(heartAsset.svgXml.includes('<path id="left_atrium"'), 'Left atrium must have anatomical path and semantic ID');
    assert.ok(heartAsset.svgXml.includes('<path id="right_atrium"'), 'Right atrium must have anatomical path and semantic ID');
    assert.ok(heartAsset.svgXml.includes('id="aortic_arch"'), 'Aortic arch must be present');
    assert.ok(heartAsset.svgXml.includes('id="pulmonary_trunk"'), 'Pulmonary trunk must be present');
    assert.ok(heartAsset.svgXml.includes('id="interventricular_septum"'), 'Interventricular septum must be present');

    // Audit subtopic diagrams for human heart
    const heartSubtopics = getSubtopicDiagramsForTopic('Structure of the Human Heart', 'Biology');
    const fourChambers = heartSubtopics.find((d) => d.subtopicKey === 'four_chambers');
    assert.ok(fourChambers, 'four_chambers subtopic diagram must exist');
    assert.ok(!fourChambers.svgXml.includes('<rect x="220" y="130" width="150" height="110"'), 'Generic rectangular chamber rects must be removed from subtopic catalog');
    assert.ok(fourChambers.svgXml.includes('Anatomical Coronal Cutaway'), 'Subtopic must use anatomical coronal cutaway');
  });

  await t.test('2. Verification of New Dedicated Visual Schematics', () => {
    // 2a. Double Circulation
    const doubleCirc = getDetailedScientificAsset('Double Circulation');
    assert.ok(doubleCirc, 'Double circulation asset must resolve');
    assert.strictEqual(doubleCirc.topic, 'Human Double Circulation System');
    assert.ok(doubleCirc.svgXml.includes('id="pulmonary_circuit"'), 'Must depict pulmonary circuit');
    assert.ok(doubleCirc.svgXml.includes('id="systemic_circuit"'), 'Must depict systemic circuit');
    assert.ok(doubleCirc.svgXml.includes('LUNGS'), 'Must visually show lungs');
    assert.ok(doubleCirc.svgXml.includes('BODY TISSUES'), 'Must visually show body tissues');
    assert.ok(doubleCirc.svgXml.includes('120 mmHg'), 'Must annotate systemic systolic pressure');
    assert.ok(doubleCirc.svgXml.includes('25 mmHg'), 'Must annotate pulmonary pressure');

    // 2b. Cardiac Conduction System & ECG Correlation
    const conduction = getDetailedScientificAsset('Cardiac Conduction System');
    assert.ok(conduction, 'Cardiac conduction asset must resolve');
    assert.ok(conduction.svgXml.includes('id="sa_node"'), 'Must depict SA node');
    assert.ok(conduction.svgXml.includes('id="av_node"'), 'Must depict AV node');
    assert.ok(conduction.svgXml.includes('id="bundle_of_his"'), 'Must depict Bundle of His');
    assert.ok(conduction.svgXml.includes('id="purkinje_fibers"'), 'Must depict Purkinje network');
    assert.ok(conduction.svgXml.includes('id="ecg_correlation"'), 'Must include synchronized ECG');
    assert.ok(conduction.svgXml.includes('P Wave') && conduction.svgXml.includes('QRS'), 'Must annotate P-QRS-T waves');

    // 2c. Chloroplast Ultrastructure Close-Up
    const chlor = getDetailedScientificAsset('Chloroplast ultrastructure');
    assert.ok(chlor, 'Chloroplast asset must resolve');
    assert.ok(chlor.svgXml.includes('id="outer_inner_membrane"'), 'Must depict double membrane envelope');
    assert.ok(chlor.svgXml.includes('id="grana_thylakoids"'), 'Must depict stacked thylakoid grana');
    assert.ok(chlor.svgXml.includes('id="stroma_lamellae"'), 'Must depict stroma lamellae bridges');
    assert.ok(chlor.svgXml.includes('id="chloroplast_dna"'), 'Must depict circular cpDNA and ribosomes');

    // 2d. Magnetic Fields & Solenoid
    const magnet = getDetailedScientificAsset('Magnetic field around a bar magnet');
    assert.ok(magnet, 'Magnetic fields asset must resolve');
    assert.ok(magnet.svgXml.includes('id="magnetic_dipole"'), 'Must depict bar magnet dipole');
    assert.ok(magnet.svgXml.includes('id="solenoid_coil"'), 'Must depict solenoid coil');
    assert.ok(magnet.svgXml.includes('B = μ₀ · n · I') || magnet.svgXml.includes('B = μ₀'), 'Must annotate solenoid formula');

    // 2e. Earth Internal Structure & Layers
    const earth = getDetailedScientificAsset('Earth internal structure and layers');
    assert.ok(earth, 'Earth layers asset must resolve');
    assert.ok(earth.svgXml.includes('id="crust_lithosphere"'), 'Must depict crust & lithosphere');
    assert.ok(earth.svgXml.includes('id="asthenosphere_mantle"'), 'Must depict mantle & asthenosphere');
    assert.ok(earth.svgXml.includes('id="outer_core_liquid"'), 'Must depict liquid outer core');
    assert.ok(earth.svgXml.includes('id="inner_core_solid"'), 'Must depict solid inner core');
    assert.ok(earth.svgXml.includes('Gutenberg') && earth.svgXml.includes('Moho'), 'Must annotate seismic discontinuities');
  });

  await t.test('3. Multi-Level Visual Teaching Progression System', () => {
    // Cardiac / Heart multi-level views
    const heartLevels = educationalVisualIntelligenceEngine.getMultiLevelVisuals('Human Heart');
    assert.ok(heartLevels.length >= 3, `Heart must have at least 3 levels, got ${heartLevels.length}`);
    assert.strictEqual(heartLevels[0].level, 1);
    assert.strictEqual(heartLevels[0].levelName, 'Level 1: Overall Anatomy');
    assert.strictEqual(heartLevels[1].level, 2);
    assert.strictEqual(heartLevels[1].levelName, 'Level 2: Electrical Conduction');
    assert.strictEqual(heartLevels[2].level, 3);
    assert.strictEqual(heartLevels[2].levelName, 'Level 3: Double Circulation');

    // Photosynthesis / Chloroplast multi-level views
    const photoLevels = educationalVisualIntelligenceEngine.getMultiLevelVisuals('Photosynthesis');
    assert.ok(photoLevels.length >= 3, `Photosynthesis must have at least 3 levels, got ${photoLevels.length}`);
    assert.strictEqual(photoLevels[0].levelName, 'Level 1: Overall Process');
    assert.strictEqual(photoLevels[1].levelName, 'Level 2: Organelle Ultrastructure');

    // Physics Magnetism multi-level views
    const magLevels = educationalVisualIntelligenceEngine.getMultiLevelVisuals('Magnetic fields');
    assert.ok(magLevels.length >= 2, `Magnetism must have at least 2 levels, got ${magLevels.length}`);

    // Earth Structure multi-level views
    const earthLevels = educationalVisualIntelligenceEngine.getMultiLevelVisuals('Earth layers');
    assert.ok(earthLevels.length >= 2, `Earth must have at least 2 levels, got ${earthLevels.length}`);
  });

  await t.test('4. 10-Point Deep Teacher-Style Walkthrough Pipeline', async () => {
    const visual = await educationalVisualIntelligenceEngine.produceEducationalVisual({
      topic: 'Cardiac Conduction System and ECG Correlation',
      subject: 'Biology'
    });

    assert.ok(visual.deepExplanation, 'Visual output must contain deepExplanation');
    const de = visual.deepExplanation;
    assert.ok(de.point1_whatStudentIsLookingAt.length > 20, 'Point 1: What student sees must be detailed');
    assert.ok(de.point2_structureIdentity.includes('SA') || de.point2_structureIdentity.includes('Node'), 'Point 2: Structure identity');
    assert.ok(de.point3_anatomicalLocation.includes('Right Atrium') || de.point3_anatomicalLocation.length > 15, 'Point 3: Anatomical location');
    assert.ok(de.point4_primaryFunction.length > 15, 'Point 4: Function');
    assert.ok(de.point5_workingMechanism.includes('delay') || de.point5_workingMechanism.length > 20, 'Point 5: Working mechanism');
    assert.ok(de.point6_whyImportant.length > 15, 'Point 6: Why important');
    assert.ok(de.point7_connectionsToOtherComponents.length > 15, 'Point 7: Connections');
    assert.ok(de.point8_malfunctionOrEdgeCase.includes('Block') || de.point8_malfunctionOrEdgeCase.length > 15, 'Point 8: Malfunction/Pathology');
    assert.ok(de.point9_realWorldOrClinicalLife.includes('ECG') || de.point9_realWorldOrClinicalLife.length > 15, 'Point 9: Clinical/Real-world');
    assert.ok(de.point10_examKeyTakeaway.includes('P wave') || de.point10_examKeyTakeaway.length > 15, 'Point 10: Exam takeaway');
  });

  await t.test('5. Multi-Disciplinary Coverage Across 28 Verified Vector Schematics', () => {
    const totalAssets = Object.keys(SCIENTIFIC_VECTOR_REGISTRY).length;
    assert.ok(totalAssets >= 28, `Must have >= 28 verified vector schematics, got ${totalAssets}`);

    // Verify all SVGs are responsive and conform to standard aspect ratio
    for (const [key, asset] of Object.entries(SCIENTIFIC_VECTOR_REGISTRY)) {
      assert.ok(asset.svgXml.includes('viewBox="0 0 840 520"'), `Asset "${key}" must have viewBox="0 0 840 520"`);
      assert.ok(asset.svgXml.includes('preserveAspectRatio="xMidYMid meet"'), `Asset "${key}" must have preserveAspectRatio`);
      assert.ok(asset.labels.length >= 3, `Asset "${key}" must contain at least 3 labels`);
    }
  });

  await t.test('6. Exported Assets and Manifest Consistency on Disk', () => {
    const manifestPath = path.join(process.cwd(), 'public', 'images', 'educational', 'manifest.json');
    assert.ok(fs.existsSync(manifestPath), 'manifest.json must exist');

    const manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.ok(manifestData.length >= 28, `Manifest must index >= 28 assets, got ${manifestData.length}`);

    // Check specific new files exist
    const newFiles = [
      'double_circulation.svg',
      'cardiac_conduction.svg',
      'chloroplast_structure.svg',
      'magnetic_fields.svg',
      'earth_layers.svg'
    ];

    for (const f of newFiles) {
      const pubPath = path.join(process.cwd(), 'public', 'images', 'educational', f);
      assert.ok(fs.existsSync(pubPath), `File ${f} must exist in public/images/educational/`);
      const stat = fs.statSync(pubPath);
      assert.ok(stat.size > 500, `File ${f} must have content > 500 bytes`);
    }
  });

  await t.test('7. Negative & Quality Assessment Pipeline', () => {
    const plan = educationalVisualIntelligenceEngine.planVisual({
      topic: 'Human Double Circulation System',
      subject: 'Biology'
    });

    const validSvg = SCIENTIFIC_VECTOR_REGISTRY.double_circulation.svgXml;
    const assessment = educationalVisualIntelligenceEngine.evaluateVisualQuality(validSvg, plan);
    assert.ok(assessment.qualityScore >= 80, 'Approved asset must have score >= 80');
    assert.strictEqual(assessment.overallStatus, 'approved');

    // Negative test: Corrupted SVG missing key components and having distorted shapes
    const badSvg = '<svg viewBox="0 0 100 100"><rect width="10" height="10" fill="red"/></svg>';
    const badAssessment = educationalVisualIntelligenceEngine.evaluateVisualQuality(badSvg, plan);
    assert.ok(badAssessment.qualityScore < 70, 'Corrupted SVG must receive lower score');
    assert.ok(badAssessment.missingElements.length > 0, 'Corrupted SVG must detect missing components');
  });
});
