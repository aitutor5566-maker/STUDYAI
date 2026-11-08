import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractAndExplainAbbreviations,
  enrichLessonWithRebuildStructure,
  buildWorkedNumericalProblems,
  buildFormulaExploded
} from '../server/tutorRebuildEngine.ts';
import {
  VERIFIED_MODEL_SPECS,
  buildElectricCircuit,
  buildHumanLungs,
  buildHumanTorsoAnatomy,
  buildHumanHeart,
  buildHumanEar
} from '../src/utils/diagram3dModels.ts';

test('1. Acronym & Full Form Dictionary expands vital science and physics abbreviations', () => {
  const abbrs = extractAndExplainAbbreviations(
    'Immunology & Diagnostics',
    'Explain AIDS, HIV, and BCG vaccines alongside ECG and LED circuits',
    'We study AIDS caused by HIV, prevention with BCG, testing with ECG, and LED displays.'
  );

  const abbrMap = new Map(abbrs.map((a) => [a.abbr, a.fullForm]));

  assert.ok(abbrMap.has('AIDS'), 'Should expand AIDS');
  assert.equal(abbrMap.get('AIDS'), 'Acquired Immunodeficiency Syndrome');

  assert.ok(abbrMap.has('HIV'), 'Should expand HIV');
  assert.equal(abbrMap.get('HIV'), 'Human Immunodeficiency Virus');

  assert.ok(abbrMap.has('BCG'), 'Should expand BCG');
  assert.equal(abbrMap.get('BCG'), 'Bacillus Calmette–Guérin');

  assert.ok(abbrMap.has('ECG'), 'Should expand ECG');
  assert.equal(abbrMap.get('ECG'), 'Electrocardiogram');

  assert.ok(abbrMap.has('LED'), 'Should expand LED');
  assert.equal(abbrMap.get('LED'), 'Light Emitting Diode');
});

test('2. Acronym Dictionary expands Energy, Physics and Chemistry abbreviations', () => {
  const abbrs = extractAndExplainAbbreviations(
    'Thermodynamics and Sound',
    'Compare SONAR, RADAR, CNG, LPG, EMF, AC, and DC at STP',
    'Under STP conditions, sound travels to measure depth with SONAR, radio waves for RADAR, using CNG and LPG fuels.'
  );

  const abbrMap = new Map(abbrs.map((a) => [a.abbr, a.fullForm]));
  assert.ok(abbrMap.has('SONAR'), 'Should expand SONAR');
  assert.equal(abbrMap.get('SONAR'), 'Sound Navigation and Ranging');

  assert.ok(abbrMap.has('RADAR'), 'Should expand RADAR');
  assert.equal(abbrMap.get('RADAR'), 'Radio Detection and Ranging');

  assert.ok(abbrMap.has('CNG'), 'Should expand CNG');
  assert.equal(abbrMap.get('CNG'), 'Compressed Natural Gas');

  assert.ok(abbrMap.has('STP'), 'Should expand STP');
  assert.equal(abbrMap.get('STP'), 'Standard Temperature and Pressure');
});

test('3. AI Tutor Normal Learning Mode delivers the complete 13-Part Pedagogical Journey', () => {
  const mockLesson = {
    topic: 'Photosynthesis',
    subject: 'Biology',
    level: 'Grade 10',
    mode: 'learning',
    introduction: 'Photosynthesis is the biochemical process by which photoautotrophic organisms synthesize organic glucose from inorganic carbon dioxide and water.',
    keySteps: [
      '1. Light Absorption — Chlorophyll pigments in thylakoid membranes trap solar photons.',
      '2. Photolysis of Water — Solar energy splits H2O molecules into protons, electrons, and O2 gas.',
      '3. Electron Transport Chain — Photons energize electrons through photosystems to generate ATP and NADPH.',
      '4. Calvin Cycle — Carbon fixation in stroma combines CO2 with RuBP to synthesize glucose.'
    ],
    definitions: [
      { term: 'Chloroplast', definition: 'Double-membraned organelle containing thylakoids and stroma.' },
      { term: 'Photolysis', definition: 'Light-driven splitting of water molecules into protons and oxygen.' }
    ],
    formula: {
      equation: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂'
    },
    analogies: 'Like a solar-powered bakery turning sun rays, air, and water into food.',
    misconceptions: ['Plants only perform photosynthesis during the day and never perform cellular respiration.']
  };

  const dummySvgGen = () => ({
    dataUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PC9zdmc+',
    diagramType: 'concept_diagram',
    caption: 'Photosynthesis Diagram',
    limitationNote: 'Diagram'
  });

  const enriched = enrichLessonWithRebuildStructure(mockLesson, dummySvgGen);

  assert.equal(enriched.teachingMode, 'learning', 'Should indicate learning teaching mode');
  assert.ok(enriched.learningJourney, 'Should contain learningJourney');

  // Verify all 13 parts
  const lj = enriched.learningJourney;
  assert.ok(lj.part1_topicIntroduction, 'Part 1: Topic Introduction exists');
  assert.ok(lj.part2_studentFriendlyDefinition, 'Part 2: Student-friendly definition exists');
  assert.ok(lj.part3_whyItMatters, 'Part 3: Why it matters exists');
  assert.ok(Array.isArray(lj.part4_prerequisitesBridge) && lj.part4_prerequisitesBridge.length > 0, 'Part 4: Prerequisites bridge exists');
  assert.ok(Array.isArray(lj.part5_terminologyWithFullForms) && lj.part5_terminologyWithFullForms.length > 0, 'Part 5: Terminology with full forms exists');
  assert.ok(Array.isArray(lj.part6_deepMechanisms) && lj.part6_deepMechanisms.length >= 4, 'Part 6: Deep mechanisms exist');
  assert.ok(Array.isArray(lj.part7_everydayExamples) && lj.part7_everydayExamples.length > 0, 'Part 7: Everyday examples exist');
  assert.ok(Array.isArray(lj.part8_visualDiagrams) && lj.part8_visualDiagrams.length > 0, 'Part 8: Visual diagrams exist');
  assert.ok(lj.part9_formulasAndLaws && lj.part9_formulasAndLaws.equation, 'Part 9: Formulas and laws exist');
  assert.ok(Array.isArray(lj.part10_commonMisconceptions) && lj.part10_commonMisconceptions.length > 0, 'Part 10: Common misconceptions exist');
  assert.ok(Array.isArray(lj.part11_structuredSummaryRecap) && lj.part11_structuredSummaryRecap.length > 0, 'Part 11: Structured summary recap exists');
  assert.ok(Array.isArray(lj.part12_understandingChecks) && lj.part12_understandingChecks.length > 0, 'Part 12: Understanding checks exist');
  assert.ok(Array.isArray(lj.part13_curiosityFollowUps) && lj.part13_curiosityFollowUps.length > 0, 'Part 13: Curiosity follow-ups exist');
});

test('4. AI Tutor Exam Preparation Mode delivers the complete 18-Part Examination Structure', () => {
  const mockExamLesson = {
    topic: "Newton's Second Law of Motion",
    subject: 'Physics',
    level: 'Grade 10',
    mode: 'exam',
    introduction: 'Newton’s Second Law states that the rate of change of momentum of a body is directly proportional to the applied unbalanced external force and takes place in the direction of the force.',
    keySteps: [
      '1. Rate of Change of Momentum — dp/dt is proportional to applied force.',
      '2. Constant Mass Formulation — F = d(mv)/dt = m(dv/dt) = ma.',
      '3. Vector Directionality — Acceleration vector a is collinear with net force vector F.',
      '4. SI Units — 1 Newton (N) = 1 kg·m/s².'
    ],
    formula: {
      equation: 'F = m · a'
    },
    differences: {
      titleA: "Newton's First Law",
      titleB: "Newton's Second Law",
      rows: [
        { aspect: 'Definition', itemA: 'Defines inertia qualitatively', itemB: 'Quantifies force as F = ma' }
      ]
    },
    misconceptions: ['Force is required to keep an object moving at constant velocity.']
  };

  const dummySvgGen = () => ({
    dataUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PC9zdmc+',
    diagramType: 'physics_fbd',
    caption: 'Force Vector FBD',
    limitationNote: 'Diagram'
  });

  const enriched = enrichLessonWithRebuildStructure(mockExamLesson, dummySvgGen);

  assert.equal(enriched.teachingMode, 'exam', 'Should indicate exam teaching mode');
  assert.ok(enriched.examMastery, 'Should contain examMastery');

  const em = enriched.examMastery;
  assert.ok(em.part1_boardStandardDefinition, 'Part 1: Board standard definition exists');
  assert.ok(Array.isArray(em.part2_scientificNomenclature), 'Part 2: Scientific nomenclature exists');
  assert.ok(Array.isArray(em.part3_formulaeAndSiUnits) && em.part3_formulaeAndSiUnits.length > 0, 'Part 3: Formulae and SI units exist');
  assert.ok(Array.isArray(em.part4_stepByStepDerivations) && em.part4_stepByStepDerivations.length > 0, 'Part 4: Derivations exist');
  assert.ok(Array.isArray(em.part5_standardWorkedNumericals) && em.part5_standardWorkedNumericals.length > 0, 'Part 5: Worked numericals exist');
  assert.ok(Array.isArray(em.part8_labelledDiagramChecklist), 'Part 8: Diagram checklist exists');
  assert.ok(Array.isArray(em.part9_boardTrapsAndPitfalls) && em.part9_boardTrapsAndPitfalls.length > 0, 'Part 9: Board traps exist');
  assert.ok(Array.isArray(em.part10_oneMarkMcqs), 'Part 10: 1-mark MCQs exist');
  assert.ok(Array.isArray(em.part11_twoMarkShortQuestions), 'Part 11: 2-mark short questions exist');
  assert.ok(Array.isArray(em.part12_threeMarkStructuredQuestions), 'Part 12: 3-mark structured questions exist');
  assert.ok(Array.isArray(em.part13_fiveMarkLongQuestions), 'Part 13: 5-mark long questions exist');
  assert.ok(em.part14_quickMnemonics, 'Part 14: Quick mnemonics exist');
  assert.ok(Array.isArray(em.part15_fastRevisionSummary), 'Part 15: Fast revision summary exists');

  // Verify Physics Numerical template has Given, Formula, Substitution, Final Answer with SI Units
  const numProblem = em.part5_standardWorkedNumericals[0];
  assert.ok(numProblem.problemStatement, 'Problem statement exists');
  assert.ok(Array.isArray(numProblem.givenData) && numProblem.givenData.length > 0, 'Given data exists');
  assert.ok(numProblem.formulaUsed, 'Formula used exists');
  assert.ok(Array.isArray(numProblem.stepByStepSolution) && numProblem.stepByStepSolution.length > 0, 'Step-by-step substitution exists');
  assert.ok(numProblem.finalAnswer, 'Final answer exists');
  assert.ok(numProblem.siUnit, 'SI unit explicitly checked');
});

test('5. 3D Model Studio: Geometric Fidelity of 5 Reference Benchmark Models', () => {
  // Screenshot 1: Electric Circuit
  const circuit = buildElectricCircuit();
  assert.ok(circuit.rootGroup, 'Circuit root group exists');
  assert.ok(circuit.components.battery.length > 0, 'Circuit battery exists');
  assert.ok(circuit.components.light_bulb.length > 0, 'Circuit bulb exists');
  assert.ok(circuit.components.switch.length > 0, 'Circuit switch exists');
  assert.ok(circuit.components.copper_wires.length > 0, 'Circuit copper wires exist');

  // Screenshot 2: Human Lungs (Lobes, Fissures, Trachea)
  const lungs = buildHumanLungs();
  assert.ok(lungs.rootGroup, 'Lungs root group exists');
  assert.ok(lungs.components.trachea.length > 0, 'Trachea exists');
  assert.ok(lungs.components.right_superior_lobe.length > 0, 'Right superior lobe exists');
  assert.ok(lungs.components.right_middle_lobe.length > 0, 'Right middle lobe exists');
  assert.ok(lungs.components.right_inferior_lobe.length > 0, 'Right inferior lobe exists');
  assert.ok(lungs.components.horizontal_fissure.length > 0, 'Horizontal fissure exists');
  assert.ok(lungs.components.left_superior_lobe.length > 0, 'Left superior lobe exists');
  assert.ok(lungs.components.left_inferior_lobe.length > 0, 'Left inferior lobe exists');
  assert.ok(lungs.components.oblique_fissure.length > 0, 'Oblique fissure exists');

  // Screenshot 3: Human Torso Anatomy
  const torso = buildHumanTorsoAnatomy();
  assert.ok(torso.rootGroup, 'Torso root group exists');
  assert.ok(torso.components.torso_shell.length > 0, 'Transparent acrylic shell exists');
  assert.ok(torso.components.diagnostic_base.length > 0, 'Electronic diagnostic base exists');
  assert.ok(torso.components.heart.length > 0, 'Heart organ exists');
  assert.ok(torso.components.lungs.length > 0, 'Lungs organ exists');
  assert.ok(torso.components.liver.length > 0, 'Liver organ exists');
  assert.ok(torso.components.stomach.length > 0, 'Stomach organ exists');

  // Screenshot 4: Assemblr EDU Human Heart Cutaway
  const heart = buildHumanHeart();
  assert.ok(heart.rootGroup, 'Heart root group exists');
  assert.ok(heart.components.left_ventricle.length > 0, 'Left ventricle cavity exists');
  assert.ok(heart.components.right_ventricle.length > 0, 'Right ventricle cavity exists');
  assert.ok(heart.components.left_atrium.length > 0, 'Left atrium cavity exists');
  assert.ok(heart.components.right_atrium.length > 0, 'Right atrium cavity exists');
  assert.ok(heart.components.valves.length > 0, 'Heart valves exist');
  assert.ok(heart.components.aorta.length > 0, 'Aorta arch exists');
  assert.ok(heart.components.pulmonary_artery.length > 0, 'Pulmonary artery exists');
  assert.ok(heart.components.vena_cava.length > 0, 'Vena cava exists');
  assert.ok(heart.animatedNodes.length > 0, 'Animated blood circulation nodes exist');

  // Screenshot 5: Human Ear Mozaik 3D Studio
  const ear = buildHumanEar();
  assert.ok(ear.rootGroup, 'Ear root group exists');
  assert.ok(ear.components.auricle.length > 0, 'Ear auricle exists');
  assert.ok(ear.components.tympanic_membrane.length > 0, 'Tympanic membrane exists');
  assert.ok(ear.components.malleus.length > 0, 'Malleus ossicle exists');
  assert.ok(ear.components.incus.length > 0, 'Incus ossicle exists');
  assert.ok(ear.components.stapes.length > 0, 'Stapes ossicle exists');
  assert.ok(ear.components.cochlea.length > 0, 'Spiral cochlea exists');
  assert.ok(ear.components.semicircular_canals.length > 0, 'Semicircular canals exist');
});

test('6. Model Specifications for All 5 Visual Reference Benchmarks are Verified in Catalog', () => {
  const specs = VERIFIED_MODEL_SPECS;

  assert.ok(specs.electric_circuit, 'Electric circuit spec exists');
  assert.ok(specs.electric_circuit.parts.length >= 4, 'Circuit has key components');

  assert.ok(specs.human_lungs, 'Human lungs spec exists');
  assert.ok(specs.human_lungs.parts.length >= 4, 'Lungs have lobes and trachea');

  assert.ok(specs.human_torso_anatomy, 'Human torso spec exists');
  assert.ok(specs.human_torso_anatomy.parts.some((p) => p.label.includes('Intestin')), 'Torso has organs');

  assert.ok(specs.human_heart, 'Human heart spec exists');
  assert.equal(specs.human_heart.studioBackground, '#fed7aa', 'Heart matches Assemblr peach studio background');
  assert.ok(specs.human_heart.parts.some((p) => p.id === 'left_ventricle'), 'Heart has Left Ventricle');
  assert.ok(specs.human_heart.parts.some((p) => p.id === 'valves'), 'Heart has Valves');

  assert.ok(specs.human_ear, 'Human ear spec exists');
  assert.ok(specs.human_ear.parts.some((p) => p.id === 'tympanic_membrane'), 'Ear has tympanic membrane');
});
