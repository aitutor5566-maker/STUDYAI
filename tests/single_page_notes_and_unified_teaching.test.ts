import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildUniversalTeachingWorkflow,
  buildSinglePageDigitalTextbookMarkdown,
  buildProblemSolvingMethodsForTopic
} from '../server/universalTeachingWorkflowEngine.ts';

test('STUDYAI Single-Page Notes & Unified AI Teaching Suite', async (t) => {
  await t.test('1. Workflow Engine populates all 10 Unified Educational Sections (A through J)', () => {
    const workflow = buildUniversalTeachingWorkflow({
      topic: 'Photosynthesis',
      subject: 'Biology',
      grade: 10,
      board: 'CBSE',
      studentName: 'Vishwak'
    });

    assert.ok(workflow.sectionA_definitions, 'Section A exists');
    assert.ok(workflow.sectionB_keyPoints, 'Section B exists');
    assert.ok(workflow.sectionC_keyTermsAndTerminology, 'Section C exists');
    assert.ok(workflow.sectionD_mainConceptsAndSubtopics, 'Section D exists');
    assert.ok(workflow.sectionE_keyDifferencesAndComparisons, 'Section E exists');
    assert.ok(workflow.sectionF_importantProcessesAndMechanisms, 'Section F exists');
    assert.ok(workflow.sectionG_formulasAndEquations, 'Section G exists');
    assert.ok(workflow.sectionH_problemSolvingMethods, 'Section H exists');
    assert.ok(workflow.sectionI_examOrientedPreparation, 'Section I exists');
    assert.ok(workflow.sectionJ_finalRevisionSection, 'Section J exists');
  });

  await t.test('2. Section A: Main Topic Definition, Academic Definitions, Subtopic Definitions & Full Forms', () => {
    const workflow = buildUniversalTeachingWorkflow({
      topic: 'Photosynthesis',
      subject: 'Biology',
      grade: 10
    });

    const secA = workflow.sectionA_definitions;
    assert.ok(secA.mainTopicDefinition.academicDefinition.includes('Photosynthesis'), 'Main topic academic definition present');
    assert.ok(secA.mainTopicDefinition.simpleLanguageExplanation, 'Simple language explanation present');
    assert.ok(secA.importantAcademicDefinitions.length >= 3, 'Contains important academic definitions');
    assert.ok(secA.subtopicDefinitions.length >= 2, 'Contains subtopic definitions');
    assert.ok(secA.terminologyAndFullForms.length >= 2, 'Contains terminology and full forms');
  });

  await t.test('3. Section B: Key Points, Core Principles, Essential Facts, and Components with Functions', () => {
    const workflow = buildUniversalTeachingWorkflow({
      topic: 'Photosynthesis',
      subject: 'Biology',
      grade: 10
    });

    const secB = workflow.sectionB_keyPoints;
    assert.ok(secB.corePrinciples.length >= 2, 'Core principles present');
    assert.ok(secB.essentialFacts.length >= 2, 'Essential facts present');
    assert.ok(secB.componentsAndFunctions.length >= 2, 'Components and functions present');
    assert.ok(secB.mustRememberTakeaways.length >= 3, 'Must-remember takeaways present');
  });

  await t.test('4. Section C: Key Terms & Terminology with Academic Definition, Simple Meaning, and Example', () => {
    const workflow = buildUniversalTeachingWorkflow({
      topic: 'Photosynthesis',
      subject: 'Biology',
      grade: 10
    });

    const secC = workflow.sectionC_keyTermsAndTerminology;
    assert.ok(secC.terms.length >= 2, 'Terms present');
    for (const term of secC.terms) {
      assert.ok(term.term, 'Term label exists');
      assert.ok(term.fullForm, 'Full form exists');
      assert.ok(term.academicDefinition, 'Academic definition exists');
      assert.ok(term.simpleExplanation, 'Simple explanation exists');
    }
  });

  await t.test('5. Section D: Main Concepts & Subtopics with Dedicated Diagram & 8-Point Breakdown', () => {
    const workflow = buildUniversalTeachingWorkflow({
      topic: 'Photosynthesis',
      subject: 'Biology',
      grade: 10
    });

    const secD = workflow.sectionD_mainConceptsAndSubtopics;
    assert.ok(secD.subtopics.length >= 3, 'Has multiple subtopics');

    for (const sub of secD.subtopics) {
      assert.ok(sub.name, 'Subtopic has name');
      assert.ok(sub.whatItIs, 'Subtopic has definition/description');
      assert.ok(sub.structureOrComponents, 'Subtopic has structure');
      assert.ok(sub.howItWorks, 'Subtopic has mechanism');
      assert.ok(sub.diagram, 'Subtopic has its OWN dedicated diagram');
      assert.ok(sub.diagram.imageUrl.startsWith('data:image/svg+xml'), 'Diagram is valid SVG');
      assert.ok(sub.diagram.point1_whatItRepresents, 'Diagram has Point 1');
      assert.ok(sub.diagram.point2_labelledParts.length >= 2, 'Diagram has Point 2 labeled parts');
      assert.ok(sub.diagram.point3_componentFunctions, 'Diagram has Point 3 component functions');
      assert.ok(sub.diagram.point4_componentRelationships, 'Diagram has Point 4 relationships');
      assert.ok(sub.diagram.point5_directionOfMovementOrProcess, 'Diagram has Point 5 direction');
      assert.ok(sub.diagram.point6_stepByStepInterpretation.length >= 2, 'Diagram has Point 6 steps');
      assert.ok(sub.diagram.point7_learningOutcome, 'Diagram has Point 7 learning outcome');
      assert.ok(sub.diagram.point8_whatToRemember, 'Diagram has Point 8 exam memory hook');
    }
  });

  await t.test('6. Section E: Key Differences & Comparisons (Comparison Tables)', () => {
    const workflow = buildUniversalTeachingWorkflow({
      topic: 'Photosynthesis',
      subject: 'Biology',
      grade: 10
    });

    const secE = workflow.sectionE_keyDifferencesAndComparisons;
    assert.ok(secE.comparisonTitle, 'Comparison title exists');
    assert.ok(secE.conceptA, 'Concept A identified');
    assert.ok(secE.conceptB, 'Concept B identified');
    assert.ok(secE.rows.length >= 3, 'Multiple comparison rows exist');
    for (const row of secE.rows) {
      assert.ok(row.aspect, 'Aspect exists');
      assert.ok(row.itemA, 'Item A exists');
      assert.ok(row.itemB, 'Item B exists');
    }
  });

  await t.test('7. Section F: Important Processes and Mechanisms with Flowchart/Process Diagram', () => {
    const workflow = buildUniversalTeachingWorkflow({
      topic: 'Photosynthesis',
      subject: 'Biology',
      grade: 10
    });

    const secF = workflow.sectionF_importantProcessesAndMechanisms;
    assert.ok(secF.processTitle, 'Process title exists');
    assert.ok(secF.stages.length >= 3, 'At least 3 sequential stages');
    assert.ok(secF.processDiagram, 'Process diagram exists');
    assert.ok(secF.finalResult, 'Final outcome stated');
  });

  await t.test('8. Section G: Formulas, Equations, SI Units, Derivations, and Worked Numericals', () => {
    const physWorkflow = buildUniversalTeachingWorkflow({
      topic: "Newton's Laws of Motion",
      subject: 'Physics',
      grade: 9
    });

    const secG = physWorkflow.sectionG_formulasAndEquations;
    assert.equal(secG.hasFormulas, true, 'Physics topic has formulas');
    assert.ok(secG.primaryEquation.includes('F = m · a'), 'Primary formula F=ma');
    assert.ok(secG.symbolsAndUnits.length >= 3, 'Symbols and SI units defined');
    assert.ok(secG.derivation.length >= 3, 'Derivation steps provided');
    assert.ok(secG.workedNumericals.length >= 1, 'Standard worked numerical provided');
    assert.equal(secG.workedNumericals[0].step7_siUnits.includes('m/s²'), true, 'SI units verified');
  });

  await t.test('9. Section H: 10-Point Problem-Solving Method for Physics & Mathematics', () => {
    // Physics
    const physProblemSection = buildProblemSolvingMethodsForTopic("Newton's Laws of Motion", 'Physics', 'Physics & Mechanics', 9);
    assert.equal(physProblemSection.isRelevant, true);
    assert.equal(physProblemSection.tenPointMethodGuide.length, 10, 'Complete 10-point framework');
    assert.ok(physProblemSection.problemTypes.length >= 3, 'Multiple representative physics problem types');
    assert.ok(physProblemSection.problemTypes.some((pt) => pt.typeName.includes('Direct Unbalanced Net Force')));
    assert.ok(physProblemSection.problemTypes.some((pt) => pt.typeName.includes('Kinematic')));
    assert.ok(physProblemSection.problemTypes.some((pt) => pt.typeName.includes('Momentum Conservation')));
    assert.ok(physProblemSection.practiceProblemsWithAnswers.length >= 2, 'Practice problems with answers');

    // Math
    const mathProblemSection = buildProblemSolvingMethodsForTopic('Fractions and Decimals', 'Mathematics', 'Mathematics', 6);
    assert.equal(mathProblemSection.isRelevant, true);
    assert.equal(mathProblemSection.tenPointMethodGuide.length, 10, 'Complete 10-point framework');
    assert.ok(mathProblemSection.problemTypes.length >= 2, 'Multiple math problem types');
    assert.ok(mathProblemSection.practiceProblemsWithAnswers.length >= 2, 'Math practice problems with verified solutions');
  });

  await t.test('10. Section I: Exam-Oriented Preparation with Multi-Format Questions & Model Answers', () => {
    const workflow = buildUniversalTeachingWorkflow({
      topic: 'Photosynthesis',
      subject: 'Biology',
      grade: 10
    });

    const secI = workflow.sectionI_examOrientedPreparation;
    assert.ok(secI.mcqs.length >= 1, 'Has MCQs');
    assert.ok(secI.definitionQuestions.length >= 1, 'Has Definition questions');
    assert.ok(secI.shortAnswerQuestions.length >= 1, 'Has Short Answer questions');
    assert.ok(secI.longAnswerQuestions.length >= 1, 'Has Long Answer questions');
    assert.ok(secI.markingSchemeTips.length >= 2, 'Has marking scheme advice');
  });

  await t.test('11. Section J: Final Revision Section with Topic Recap, Checklist, and Traps to Avoid', () => {
    const workflow = buildUniversalTeachingWorkflow({
      topic: 'Photosynthesis',
      subject: 'Biology',
      grade: 10
    });

    const secJ = workflow.sectionJ_finalRevisionSection;
    assert.ok(secJ.topicRecap.length >= 3, 'Recap points present');
    assert.ok(secJ.coreTakeaway, 'Core takeaway present');
    assert.ok(secJ.quickRevisionChecklist.length >= 2, 'Revision checklist present');
    assert.ok(secJ.boardTrapsToAvoid.length >= 1, 'Board traps to avoid present');
    assert.ok(secJ.misconceptionsBusted.length >= 1, 'Misconceptions present');
  });

  await t.test('12. Single-Page Digital Textbook Markdown renders all 10 Unified Sections (A through J) in ONE Continuous Document', () => {
    const workflow = buildUniversalTeachingWorkflow({
      topic: 'Structure of the Human Heart',
      subject: 'Biology',
      grade: 10,
      board: 'CBSE'
    });

    const markdown = buildSinglePageDigitalTextbookMarkdown(workflow);

    // Document title
    assert.ok(markdown.includes('# Structure of the Human Heart — Complete Digital Study Textbook'));

    // Table of contents on top
    assert.ok(markdown.includes('## Table of Contents'));
    assert.ok(markdown.includes('[Section A: Definitions & Academic Meaning](#section-a-definitions)'));
    assert.ok(markdown.includes('[Section B: Key Points & Core Principles](#section-b-key-points)'));
    assert.ok(markdown.includes('[Section C: Key Terms & Terminology](#section-c-terminology)'));
    assert.ok(markdown.includes('[Section D: Main Concepts & Subtopics](#section-d-subtopics)'));
    assert.ok(markdown.includes('[Section E: Key Differences & Comparisons](#section-e-comparisons)'));
    assert.ok(markdown.includes('[Section F: Important Processes & Mechanisms](#section-f-processes)'));
    assert.ok(markdown.includes('[Section G: Formulas & Equations](#section-g-formulas)'));
    assert.ok(markdown.includes('[Section H: Problem-Solving Methods](#section-h-problem-solving)'));
    assert.ok(markdown.includes('[Section I: Exam-Oriented Preparation](#section-i-exam-prep)'));
    assert.ok(markdown.includes('[Section J: Final Revision Section](#section-j-revision)'));

    // Section headings in exact content order
    const posA = markdown.indexOf('## Section A: Definitions & Academic Meaning');
    const posB = markdown.indexOf('## Section B: Key Points & Core Principles');
    const posC = markdown.indexOf('## Section C: Key Terms & Terminology');
    const posD = markdown.indexOf('## Section D: Main Concepts & Subtopics');
    const posE = markdown.indexOf('## Section E: Key Differences & Comparisons');
    const posF = markdown.indexOf('## Section F: Important Processes & Mechanisms');
    const posG = markdown.indexOf('## Section G: Formulas & Equations');
    const posH = markdown.indexOf('## Section H: Problem-Solving Methods');
    const posI = markdown.indexOf('## Section I: Exam-Oriented Preparation');
    const posJ = markdown.indexOf('## Section J: Final Revision Section');

    assert.ok(posA !== -1, 'Section A heading exists');
    assert.ok(posB > posA, 'Section B follows Section A');
    assert.ok(posC > posB, 'Section C follows Section B');
    assert.ok(posD > posC, 'Section D follows Section C');
    assert.ok(posE > posD, 'Section E follows Section D');
    assert.ok(posF > posE, 'Section F follows Section E');
    assert.ok(posG > posF, 'Section G follows Section F');
    assert.ok(posH > posG, 'Section H follows Section G');
    assert.ok(posI > posH, 'Section I follows Section H');
    assert.ok(posJ > posI, 'Section J follows Section I');

    // Multi-image diagram breakdown in Section D
    assert.ok(markdown.includes('8-Point Scientific Diagram Breakdown'), 'Section D includes 8-point diagram breakdown');
    assert.ok(markdown.includes('data:image/svg+xml'), 'Subtopic diagrams embedded');
  });

  await t.test('13. No Five-Step Navigation or Gating: Everything in Single Page without Next Step Locks', () => {
    const workflow = buildUniversalTeachingWorkflow({
      topic: 'Chemical Bonding',
      subject: 'Chemistry',
      grade: 10
    });

    const markdown = buildSinglePageDigitalTextbookMarkdown(workflow);

    // Verify there are NO forced step-completion locks in the single-page document
    assert.equal(markdown.includes('Continue Learning Next Section →'), false, 'No next section lock button in text');
    assert.equal(markdown.includes('Step 1 of 5'), false, 'No 5-step gating indicator');
    assert.equal(markdown.includes('Locked until previous step is completed'), false, 'No locked steps');
  });
});
