import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildUniversalTeachingWorkflow,
  buildSinglePageDigitalTextbookMarkdown
} from '../server/universalTeachingWorkflowEngine.ts';
import {
  getPhotosynthesisSubtopicDiagrams,
  getHumanHeartSubtopicDiagrams,
  getSubtopicDiagramsForTopic
} from '../server/subtopicDiagramCatalog.ts';

test('1. Photosynthesis: Multi-Image Subtopic Diagram System (5 Distinct Diagrams)', () => {
  const diagrams = getPhotosynthesisSubtopicDiagrams();
  assert.ok(diagrams.length >= 5, 'Photosynthesis must generate at least 5 distinct subtopic diagrams');

  const expectedKeys = [
    'overall_overview',
    'chloroplast_structure',
    'light_reactions',
    'calvin_cycle',
    'chemical_equation'
  ];

  for (const key of expectedKeys) {
    const diag = diagrams.find((d) => d.subtopicKey === key);
    assert.ok(diag, `Diagram for key "${key}" must exist`);
    assert.ok(diag.dataUrl.startsWith('data:image/svg+xml;base64,'), `Diagram "${key}" has valid data URL`);
    assert.ok(diag.point1_whatItRepresents.length > 20, `Diagram "${key}" has comprehensive point 1`);
    assert.ok(diag.point2_labelledParts.length >= 3, `Diagram "${key}" has at least 3 labeled parts`);
    assert.ok(diag.point3_componentFunctions.length > 15, `Diagram "${key}" explains component functions`);
    assert.ok(diag.point4_componentRelationships.length > 15, `Diagram "${key}" explains connections`);
    assert.ok(diag.point5_directionOfMovementOrProcess.length > 15, `Diagram "${key}" explains process flow`);
    assert.ok(diag.point6_stepByStepInterpretation.length >= 3, `Diagram "${key}" has step-by-step interpretation`);
    assert.ok(diag.point7_learningOutcome.length > 15, `Diagram "${key}" states learning outcome`);
    assert.ok(diag.point8_whatToRemember.length > 15, `Diagram "${key}" states exam takeaway`);
  }

  // Diagram 1: Overall overview includes sun, CO2, H2O, glucose, O2
  const d1 = diagrams.find((d) => d.subtopicKey === 'overall_overview')!;
  assert.ok(d1.svgXml.includes('Sunlight') || d1.svgXml.includes('Photon'));
  assert.ok(d1.svgXml.includes('CO₂'));
  assert.ok(d1.svgXml.includes('H₂O'));
  assert.ok(d1.svgXml.includes('Glucose') || d1.svgXml.includes('C₆H₁₂O₆'));
  assert.ok(d1.svgXml.includes('O₂'));

  // Diagram 2: Chloroplast structure includes membranes, stroma, thylakoids, grana
  const d2 = diagrams.find((d) => d.subtopicKey === 'chloroplast_structure')!;
  assert.ok(d2.svgXml.includes('Outer Membrane'));
  assert.ok(d2.svgXml.includes('Inner Membrane'));
  assert.ok(d2.svgXml.includes('Stroma'));
  assert.ok(d2.svgXml.includes('Thylakoid') || d2.svgXml.includes('Granum'));

  // Diagram 3: Light reactions includes photolysis of water & ATP/NADPH
  const d3 = diagrams.find((d) => d.subtopicKey === 'light_reactions')!;
  assert.ok(d3.svgXml.includes('Photolysis of Water'));
  assert.ok(d3.svgXml.includes('ATP'));
  assert.ok(d3.svgXml.includes('NADPH'));
  assert.ok(d3.svgXml.includes('PS II') && d3.svgXml.includes('PS I'));

  // Diagram 4: Calvin cycle includes RuBisCO and carbon fixation
  const d4 = diagrams.find((d) => d.subtopicKey === 'calvin_cycle')!;
  assert.ok(d4.svgXml.includes('RuBisCO'));
  assert.ok(d4.svgXml.includes('Carbon Fixation'));
  assert.ok(d4.svgXml.includes('RuBP'));
  assert.ok(d4.svgXml.includes('G3P'));

  // Diagram 5: Balanced chemical equation includes 6CO2 + 6H2O -> C6H12O6 + 6O2
  const d5 = diagrams.find((d) => d.subtopicKey === 'chemical_equation')!;
  assert.ok(d5.svgXml.includes('6CO₂'));
  assert.ok(d5.svgXml.includes('6H₂O'));
  assert.ok(d5.svgXml.includes('C₆H₁₂O₆'));
  assert.ok(d5.svgXml.includes('6O₂'));
});

test('2. Human Heart: Multi-Image Subtopic Diagram System (5 Distinct Diagrams)', () => {
  const diagrams = getHumanHeartSubtopicDiagrams();
  assert.equal(diagrams.length, 5, 'Human Heart must generate exactly 5 distinct subtopic diagrams');

  const expectedKeys = [
    'external_anatomy',
    'four_chambers',
    'double_circulation',
    'cardiac_conduction',
    'valves_vessels'
  ];

  for (const key of expectedKeys) {
    const diag = diagrams.find((d) => d.subtopicKey === key);
    assert.ok(diag, `Heart diagram for key "${key}" must exist`);
    assert.ok(diag.dataUrl.startsWith('data:image/svg+xml;base64,'), `Heart diagram "${key}" has valid data URL`);
    assert.ok(diag.point1_whatItRepresents.length > 20, `Heart diagram "${key}" has comprehensive point 1`);
    assert.ok(diag.point2_labelledParts.length >= 3, `Heart diagram "${key}" has at least 3 labeled parts`);
    assert.ok(diag.point3_componentFunctions.length > 15, `Heart diagram "${key}" explains functions`);
    assert.ok(diag.point4_componentRelationships.length > 15, `Heart diagram "${key}" explains connections`);
    assert.ok(diag.point5_directionOfMovementOrProcess.length > 15, `Heart diagram "${key}" explains flow`);
    assert.ok(diag.point8_whatToRemember.length > 15, `Heart diagram "${key}" states takeaway`);
  }

  // Diagram 1: External anatomy includes mediastinum, base, apex, pericardium
  const d1 = diagrams.find((d) => d.subtopicKey === 'external_anatomy')!;
  assert.ok(d1.svgXml.includes('Mediastinum') || d1.svgXml.includes('Apex') || d1.svgXml.includes('Base'));

  // Diagram 2: Four chambers cross-section includes RA, RV, LA, LV and Septum
  const d2 = diagrams.find((d) => d.subtopicKey === 'four_chambers')!;
  assert.ok(d2.svgXml.includes('Right Atrium'));
  assert.ok(d2.svgXml.includes('Right Ventricle'));
  assert.ok(d2.svgXml.includes('Left Atrium'));
  assert.ok(d2.svgXml.includes('Left Ventricle'));
  assert.ok(d2.svgXml.includes('Interventricular Septum') || d2.svgXml.includes('Septum'));

  // Diagram 3: Double circulation includes Pulmonary and Systemic loops
  const d3 = diagrams.find((d) => d.subtopicKey === 'double_circulation')!;
  assert.ok(d3.svgXml.includes('Pulmonary'));
  assert.ok(d3.svgXml.includes('Systemic') || d3.svgXml.includes('Body Tissues'));

  // Diagram 4: Conduction system includes SA node, AV node, Purkinje fibers
  const d4 = diagrams.find((d) => d.subtopicKey === 'cardiac_conduction')!;
  assert.ok(d4.svgXml.includes('Sinoatrial') || d4.svgXml.includes('SA Node') || d4.svgXml.includes('SA'));
  assert.ok(d4.svgXml.includes('AV Node') || d4.svgXml.includes('Atrioventricular') || d4.svgXml.includes('AV'));
  assert.ok(d4.svgXml.includes('Purkinje') || d4.svgXml.includes('Bundle of His'));

  // Diagram 5: Valves and vessels includes LUB-DUB heart sounds and AV/Semilunar valves
  const d5 = diagrams.find((d) => d.subtopicKey === 'valves_vessels')!;
  assert.ok(d5.svgXml.includes('LUB') && d5.svgXml.includes('DUB'));
  assert.ok(d5.svgXml.includes('Tricuspid') || d5.svgXml.includes('Bicuspid'));
});

test('3. Universal 12-Stage Teaching Workflow Engine Integrity', () => {
  const workflow = buildUniversalTeachingWorkflow({
    topic: 'Photosynthesis',
    subject: 'Biology',
    grade: 10,
    board: 'CBSE',
    studentName: 'Aarav'
  });

  // Stage 1: Friendly Topic Introduction
  assert.ok(workflow.stage1_topicIntroduction.teacherGreeting?.includes('Aarav'), 'Stage 1 uses student name');
  assert.ok(workflow.stage1_topicIntroduction.whatStudentWillLearn.length >= 4, 'Stage 1 covers multiple concepts');
  assert.ok(workflow.stage1_topicIntroduction.whyItIsImportant.length > 20, 'Stage 1 states importance');

  // Stage 2: Main Definition
  assert.ok(workflow.stage2_definitionAndMeaning.academicDefinition.includes('Photosynthesis'), 'Stage 2 academic definition');
  assert.ok(workflow.stage2_definitionAndMeaning.simpleLanguageExplanation.length > 20, 'Stage 2 plain explanation');
  assert.ok(workflow.stage2_definitionAndMeaning.keyWordMeanings.length >= 2, 'Stage 2 explains key words in definition');
  assert.ok(workflow.stage2_definitionAndMeaning.coreExample.length > 10, 'Stage 2 has anchor example');

  // Stage 3: Important Definitions within the topic & subtopics
  assert.ok(workflow.stage3_importantDefinitions.length >= 3, 'Stage 3 defines key concepts within topic');
  const chloroplastDef = workflow.stage3_importantDefinitions.find((d) => d.term === 'Chloroplast');
  assert.ok(chloroplastDef, 'Chloroplast definition exists in Stage 3');
  assert.ok(chloroplastDef.academicDefinition && chloroplastDef.simpleExplanation, 'Contains academic and simple explanations');

  // Stage 4: Key Terminology and Full Forms
  assert.ok(workflow.stage4_importantTerminology.length >= 2, 'Stage 4 terminology');
  assert.ok(workflow.stage4_importantTerminology.some((t) => t.fullForm), 'Contains full scientific forms');

  // Stage 5: Main Concepts and Subtopics (EACH with its own diagram)
  assert.equal(workflow.stage5_mainConceptsAndSubtopics.length, 5, 'Stage 5 has 5 distinct subtopics for Photosynthesis');
  for (const sub of workflow.stage5_mainConceptsAndSubtopics) {
    assert.ok(sub.name, 'Subtopic has name');
    assert.ok(sub.whatItIs.length > 20, 'Subtopic has description');
    assert.ok(sub.structureOrComponents.length > 10, 'Subtopic has components');
    assert.ok(sub.howItWorks.length > 20, 'Subtopic explains how it works');
    assert.ok(sub.whyItIsImportant.length > 15, 'Subtopic explains importance');
    assert.ok(sub.diagram, 'Subtopic has its own dedicated diagram');
    assert.ok(sub.diagram.imageUrl.startsWith('data:image/svg+xml;base64,'), 'Subtopic diagram has data URL');
    assert.ok(sub.diagram.point1_whatItRepresents.length > 15, 'Subtopic diagram has point 1');
    assert.ok(sub.diagram.point8_whatToRemember.length > 10, 'Subtopic diagram has exam takeaway');
  }

  // Stage 6: Differences and Comparisons
  assert.ok(workflow.stage6_differencesAndComparisons.rows.length >= 3, 'Stage 6 comparison matrix has at least 3 rows');
  assert.ok(workflow.stage6_differencesAndComparisons.title.includes('Photosynthesis'), 'Stage 6 compares relevant concepts');

  // Stage 7: Detailed Mechanisms and Processes
  assert.ok(workflow.stage7_detailedMechanismsAndProcesses.sequenceOfEvents.length >= 3, 'Stage 7 has step-by-step sequence');
  assert.ok(workflow.stage7_detailedMechanismsAndProcesses.processDiagram, 'Stage 7 includes dedicated process diagram');

  // Stage 8: All aggregated diagrams
  assert.ok(workflow.stage8_diagramsAndVisualExplanations.length >= 5, 'Stage 8 aggregates all subtopic diagrams');

  // Stage 9: Formulas / Equations
  assert.ok(workflow.stage10_formulasAndProblemSolving, 'Stage 9 formulas/stoichiometry');

  // Stage 10: Facts & Misconceptions
  assert.ok(workflow.stage12_importantFactsAndMisconceptions.frequentlyMisunderstood.length >= 1, 'Stage 10 misconceptions');

  // Stage 11: Recap
  assert.ok(workflow.stage13_completeTopicRecap.comprehensiveSummary.length >= 3, 'Stage 11 comprehensive recap');

  // Stage 12: Knowledge Assessment
  assert.ok(workflow.stage14_knowledgeAssessment.length >= 3, 'Stage 12 has assessment questions');
});

test('4. AI Notes Digital Textbook Markdown: Multi-Image Embedding Adjacent to Subtopics', () => {
  const workflow = buildUniversalTeachingWorkflow({
    topic: 'Structure of the Human Heart',
    subject: 'Biology',
    grade: 10,
    board: 'CBSE',
    studentName: 'Vishwak'
  });

  const markdown = buildSinglePageDigitalTextbookMarkdown(workflow);

  // Verifies the markdown contains Table of Contents
  assert.ok(markdown.includes('## Table of Contents'), 'Contains Table of Contents');

  // Verifies that multiple diagram images appear throughout Stage 5
  const imageMatches = markdown.match(/!\[.*?\]\(data:image\/svg\+xml;base64,.*?\)/g);
  assert.ok(imageMatches && imageMatches.length >= 5, `Expected at least 5 inline images in textbook markdown, found ${imageMatches?.length}`);

  // Verifies that under each subtopic diagram, the 8-point scientific breakdown is rendered
  const breakdownMatches = markdown.match(/8-Point Scientific Diagram Breakdown:/g);
  assert.ok(breakdownMatches && breakdownMatches.length >= 5, `Expected at least 5 diagram breakdowns, found ${breakdownMatches?.length}`);

  // Verifies specific Heart subtopics appear in Stage 5
  assert.ok(markdown.includes('Heart External Anatomy'), 'Contains external anatomy subtopic');
  assert.ok(markdown.includes('Four Muscular Chambers'), 'Contains four chambers subtopic');
  assert.ok(markdown.includes('Double Circulation'), 'Contains double circulation subtopic');
  assert.ok(markdown.includes('Cardiac Conduction System'), 'Contains conduction subtopic');
  assert.ok(markdown.includes('Heart Valves'), 'Contains valves subtopic');
});
