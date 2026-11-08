import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildUniversalTeachingWorkflow,
  buildSinglePageDigitalTextbookMarkdown,
  type UniversalTeachingWorkflow
} from '../server/universalTeachingWorkflowEngine.ts';

test('1. Universal Teaching Workflow: Generates all 14 Canonical Stages for Science & Biology', () => {
  const workflow = buildUniversalTeachingWorkflow({
    topic: 'Structure of the Human Heart',
    subject: 'Biology',
    grade: 10,
    board: 'CBSE'
  });

  assert.equal(workflow.topic, 'Structure of the Human Heart');
  assert.equal(workflow.subject, 'Biology');
  assert.equal(workflow.grade, 10);
  assert.equal(workflow.board, 'CBSE');

  // Stage 1: Topic Introduction
  assert.ok(workflow.stage1_topicIntroduction.overview, 'Stage 1 overview exists');
  assert.ok(workflow.stage1_topicIntroduction.whatStudentWillLearn.length >= 4, 'Stage 1 learning objectives exist');
  assert.ok(workflow.stage1_topicIntroduction.whyItIsImportant, 'Stage 1 importance exists');

  // Stage 2: Definition and Meaning
  assert.ok(workflow.stage2_definitionAndMeaning.academicDefinition, 'Stage 2 academic definition exists');
  assert.ok(workflow.stage2_definitionAndMeaning.simpleLanguageExplanation, 'Stage 2 simple explanation exists');
  assert.ok(workflow.stage2_definitionAndMeaning.keyWordMeanings.length >= 2, 'Stage 2 word meanings exist');

  // Stage 3: Fundamentals and Prerequisites
  assert.ok(workflow.stage3_fundamentalsAndPrerequisites.backgroundKnowledge.length >= 2, 'Stage 3 background knowledge exists');
  assert.ok(workflow.stage3_fundamentalsAndPrerequisites.basicPrinciples.length >= 2, 'Stage 3 basic principles exist');

  // Stage 4: Important Terminology & Full Forms
  assert.ok(workflow.stage4_importantTerminology.length >= 2, 'Stage 4 terminology exists');
  const hasFullForm = workflow.stage4_importantTerminology.some((t) => t.fullForm && t.fullForm.length > 0);
  assert.ok(hasFullForm, 'Stage 4 terminology includes expanded full forms');

  // Stage 5: Main Concepts and Components
  assert.ok(workflow.stage5_mainConceptsAndComponents.length >= 2, 'Stage 5 components exist');
  assert.ok(workflow.stage5_mainConceptsAndComponents[0].structureOrComponents, 'Stage 5 component structure exists');

  // Stage 6: Detailed Working Mechanism
  assert.ok(workflow.stage6_detailedWorkingMechanism.whatHappens, 'Stage 6 what happens exists');
  assert.ok(workflow.stage6_detailedWorkingMechanism.howItHappens, 'Stage 6 how it happens exists');
  assert.ok(workflow.stage6_detailedWorkingMechanism.participatingComponents.length >= 2, 'Stage 6 components exist');

  // Stage 7: Step-by-Step Processes
  assert.ok(workflow.stage7_stepByStepProcesses.length >= 3, 'Stage 7 has sequential process stages');

  // Stage 8: Diagrams and Visual Explanations (8-point walkthrough)
  assert.ok(workflow.stage8_diagramsAndVisualExplanations.length >= 1, 'Stage 8 diagram exists');
  const d = workflow.stage8_diagramsAndVisualExplanations[0];
  assert.ok(d.point1_whatItRepresents, 'Point 1: What it represents exists');
  assert.ok(d.point2_labelledParts.length >= 2, 'Point 2: Labelled parts exist');
  assert.ok(d.point3_componentFunctions, 'Point 3: Component functions exist');
  assert.ok(d.point4_componentRelationships, 'Point 4: Component relationships exist');
  assert.ok(d.point5_directionOfMovementOrProcess, 'Point 5: Direction of movement exists');
  assert.ok(d.point6_stepByStepInterpretation.length >= 2, 'Point 6: Step-by-step interpretation exists');
  assert.ok(d.point7_learningOutcome, 'Point 7: Learning outcome exists');
  assert.ok(d.point8_whatToRemember, 'Point 8: What to remember exists');

  // Stage 9: Examples and Applications
  assert.ok(workflow.stage9_examplesAndApplications.simpleExample.scenario, 'Stage 9 simple example exists');
  assert.ok(workflow.stage9_examplesAndApplications.textbookExample.scenario, 'Stage 9 textbook example exists');
  assert.ok(workflow.stage9_examplesAndApplications.practicalApplications.length >= 2, 'Stage 9 applications exist');

  // Stage 10: Formulas & Problem Solving
  assert.ok(workflow.stage10_formulasAndProblemSolving.workedNumericals.length >= 1, 'Stage 10 worked numericals exist');

  // Stage 11: Comparisons and Relationships
  assert.ok(workflow.stage11_comparisonsAndRelationships.rows.length >= 2, 'Stage 11 comparison rows exist');

  // Stage 12: Important Facts and Misconceptions
  assert.ok(workflow.stage12_importantFactsAndMisconceptions.frequentlyMisunderstood.length >= 1, 'Stage 12 misconceptions exist');
  assert.ok(workflow.stage12_importantFactsAndMisconceptions.boardTraps.length >= 1, 'Stage 12 board traps exist');

  // Stage 13: Complete Topic Recap
  assert.ok(workflow.stage13_completeTopicRecap.comprehensiveSummary.length >= 3, 'Stage 13 recap points exist');
  assert.ok(workflow.stage13_completeTopicRecap.quickRevisionChecklist.length >= 2, 'Stage 13 checklist exists');

  // Stage 14: Knowledge Assessment
  assert.ok(workflow.stage14_knowledgeAssessment.length >= 4, 'Stage 14 has multi-format questions');
  assert.ok(workflow.stage14_knowledgeAssessment.some((q) => q.type === 'MCQ'), 'Stage 14 has MCQ');
  assert.ok(workflow.stage14_knowledgeAssessment.some((q) => q.type === 'Definition'), 'Stage 14 has Definition question');
  assert.ok(workflow.stage14_knowledgeAssessment.some((q) => q.type === 'Short Answer'), 'Stage 14 has Short Answer');
  assert.ok(workflow.stage14_knowledgeAssessment.some((q) => q.type === 'Long Answer'), 'Stage 14 has Long Answer');
});

test('2. 9-Step Numerical Problem Template adheres strictly to board examination standards', () => {
  const workflow = buildUniversalTeachingWorkflow({
    topic: "Newton's Second Law of Motion",
    subject: 'Physics',
    grade: 10,
    board: 'CBSE'
  });

  const num = workflow.stage10_formulasAndProblemSolving.workedNumericals[0];
  assert.ok(num, 'Worked numerical exists for physics');

  // 9 Essential Steps verified
  assert.ok(num.step1_givenInformation.length >= 2, 'Step 1: Given information with units');
  assert.ok(num.step2_requiredQuantity.target && num.step2_requiredQuantity.expectedUnit, 'Step 2: Required quantity');
  assert.ok(num.step3_relevantFormula.includes('F') || num.step3_relevantFormula.includes('a'), 'Step 3: Relevant formula');
  assert.ok(num.step4_formulaSelectionReason.length > 10, 'Step 4: Formula selection reason');
  assert.ok(num.step5_substitution.length > 5, 'Step 5: Substitution step');
  assert.ok(num.step6_stepByStepCalculations.length >= 2, 'Step 6: Step-by-step calculations');
  assert.ok(num.step7_siUnits.includes('m/s²') || num.step7_siUnits.includes('Newton') || num.step7_siUnits.includes('SI'), 'Step 7: SI unit verification');
  assert.ok(num.step8_finalAnswer.length > 0, 'Step 8: Final answer');
  assert.ok(num.step9_verificationOrInterpretation.length > 10, 'Step 9: Verification check');
});

test('3. AI Notes Single-Page Digital Textbook Markdown: Continuous Scroll & Table of Contents', () => {
  const workflow = buildUniversalTeachingWorkflow({
    topic: 'Photosynthesis',
    subject: 'Biology',
    grade: 10,
    board: 'CBSE'
  });

  const markdown = buildSinglePageDigitalTextbookMarkdown(workflow);

  // Single-Page Continuous Textbook Verification
  assert.ok(markdown.includes('# Photosynthesis — Complete Digital Study Textbook'), 'Has textbook master title');
  assert.ok(markdown.includes('## Table of Contents'), 'Has Table of Contents');
  assert.ok(markdown.includes('[Stage 1 — Topic Introduction](#stage-1--topic-introduction)'), 'TOC links to Stage 1');
  assert.ok(markdown.includes('[Stage 8 — Diagrams & Visual Explanations](#stage-8--diagrams--visual-explanations)'), 'TOC links to Stage 8');
  assert.ok(markdown.includes('[Stage 14 — Knowledge Assessment & Self-Test](#stage-14--knowledge-assessment--self-test)'), 'TOC links to Stage 14');

  // Verify all 14 stages appear in continuous vertical sequence
  assert.ok(markdown.includes('## Stage 1 — Topic Introduction'), 'Contains Stage 1 in document');
  assert.ok(markdown.includes('## Stage 2 — Definition and Meaning'), 'Contains Stage 2 in document');
  assert.ok(markdown.includes('## Stage 3 — Fundamentals and Prerequisites'), 'Contains Stage 3 in document');
  assert.ok(markdown.includes('## Stage 4 — Important Terminology & Full Forms'), 'Contains Stage 4 in document');
  assert.ok(markdown.includes('## Stage 5 — Main Concepts & Components'), 'Contains Stage 5 in document');
  assert.ok(markdown.includes('## Stage 6 — Detailed Working Mechanism'), 'Contains Stage 6 in document');
  assert.ok(markdown.includes('## Stage 7 — Step-by-Step Processes'), 'Contains Stage 7 in document');
  assert.ok(markdown.includes('## Stage 8 — Diagrams & Visual Explanations'), 'Contains Stage 8 in document');
  assert.ok(markdown.includes('## Stage 9 — Examples & Applications'), 'Contains Stage 9 in document');
  assert.ok(markdown.includes('## Stage 10 — Formulas, Equations & Problem Solving'), 'Contains Stage 10 in document');
  assert.ok(markdown.includes('## Stage 11 — Comparisons & Relationships'), 'Contains Stage 11 in document');
  assert.ok(markdown.includes('## Stage 12 — Important Facts & Misconceptions'), 'Contains Stage 12 in document');
  assert.ok(markdown.includes('## Stage 13 — Complete Topic Recap'), 'Contains Stage 13 in document');
  assert.ok(markdown.includes('## Stage 14 — Knowledge Assessment & Self-Test'), 'Contains Stage 14 in document');

  // Verify diagrams are integrated inline near the text rather than isolated at the end
  assert.ok(markdown.includes('![') && markdown.includes('data:image/svg+xml;base64,'), 'Integrates verified diagram inline');
});
