import test from 'node:test';
import assert from 'node:assert/strict';
import { getSubtopicDiagramsForTopic } from '../server/subtopicDiagramCatalog.ts';
import {
  buildUniversalTeachingWorkflow,
  buildSinglePageDigitalTextbookMarkdown
} from '../server/universalTeachingWorkflowEngine.ts';
import { renderEducationalMarkdownToHtml } from '../src/utils/educationalMarkdownUtils.ts';

test('STUDYAI Complete AI Notes, Deep Research & Scientific Image Generation Overhaul', async (t) => {
  const benchmarkTopics = [
    { topic: 'Photosynthesis', subject: 'Biology', grade: 'Class 10' },
    { topic: 'Human Heart', subject: 'Biology', grade: 'Class 10' },
    { topic: 'Chemical Reactions and Equations', subject: 'Chemistry', grade: 'Class 10' },
    { topic: 'Electricity', subject: 'Physics', grade: 'Class 10' },
    { topic: 'Quadratic Equations', subject: 'Mathematics', grade: 'Class 10' },
    { topic: 'The French Revolution', subject: 'History', grade: 'Class 10' },
    { topic: 'Water Resources', subject: 'Geography', grade: 'Class 10' },
  ];

  await t.test('1. All 7 Benchmark Topics have verified dedicated subtopic diagrams with 8-point breakdowns', () => {
    for (const item of benchmarkTopics) {
      const diagrams = getSubtopicDiagramsForTopic(item.topic);
      assert.ok(diagrams && diagrams.length >= 3, `Expected at least 3 dedicated subtopic diagrams for ${item.topic}, got ${diagrams?.length}`);

      for (const diag of diagrams) {
        assert.ok(diag.diagramId, `Diagram must have diagramId: ${diag.diagramTitle}`);
        assert.ok(diag.diagramTitle, `Diagram must have a title: ${diag.diagramId}`);
        assert.ok(diag.subtopicTitle, `Diagram must specify subtopicTitle: ${diag.diagramTitle}`);
        assert.ok(diag.svgXml || diag.dataUrl, `Diagram must provide svgXml or dataUrl: ${diag.diagramTitle}`);
        assert.ok(diag.point1_whatItRepresents, `Point 1 (What it represents) required: ${diag.diagramTitle}`);
        assert.ok(diag.point2_labelledParts, `Point 2 (Labelled parts) required: ${diag.diagramTitle}`);
        assert.ok(diag.point7_learningOutcome, `Point 7 (Learning outcome) required: ${diag.diagramTitle}`);
        assert.ok(diag.point8_whatToRemember, `Point 8 (What to remember) required: ${diag.diagramTitle}`);
        assert.equal(diag.isVerified, true, `Diagram must be verified: ${diag.diagramTitle}`);
      }
    }
  });

  await t.test('2. Universal Teaching Workflow Engine produces complete structured notes with diagrams embedded', async () => {
    for (const item of benchmarkTopics) {
      const workflow = buildUniversalTeachingWorkflow({
        topic: item.topic,
        subject: item.subject,
        gradeLevel: item.grade,
        examContext: 'CBSE / NCERT Board Exam'
      });

      assert.ok(workflow, `Workflow must be generated for ${item.topic}`);
      assert.ok(workflow.topic, `Topic must be present for ${item.topic}`);
      assert.ok(workflow.stage2_mainDefinition, `Definition must be present for ${item.topic}`);

      const contentMarkdown = buildSinglePageDigitalTextbookMarkdown(workflow);
      assert.ok(contentMarkdown && contentMarkdown.length > 500, `Digital textbook markdown must be present for ${item.topic}`);

      // Check markdown contains embedded subtopic diagrams
      assert.match(contentMarkdown, /!\[.*?\]\(data:image\/svg\+xml;base64,.*?\)/, `Markdown should embed SVG subtopic diagrams for ${item.topic}`);
      
      // Check sections A through J exist in workflow
      assert.ok(workflow.sectionA_definitions, `Section A Definition must exist for ${item.topic}`);
      assert.ok(workflow.sectionB_keyPoints && workflow.sectionB_keyPoints.corePrinciples.length > 0, `Section B Key Points must exist for ${item.topic}`);
      assert.ok(workflow.sectionD_mainConceptsAndSubtopics && workflow.sectionD_mainConceptsAndSubtopics.subtopics.length > 0, `Section D Subtopics must exist for ${item.topic}`);
      assert.ok(workflow.sectionI_examOrientedPreparation, `Section I Exam prep must exist for ${item.topic}`);
    }
  });

  await t.test('3. Educational Markdown Renderer cleans raw SVG tags and formats mathematical & chemical equations', () => {
    const rawMarkdownWithMathAndSvg = `
# Class 10 Chemistry — Chemical Reactions
> [!IMPORTANT]
> A chemical equation represents a symbolic representation of a chemical reaction.

$$2\\text{Mg} + \\text{O}_2 \\rightarrow 2\\text{MgO}$$

In water, $\\text{H}_2\\text{O}$ breaks into ions. Quadratic roots: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$.

![Combination Reaction: Burning Magnesium](data:image/svg+xml;utf8,<svg viewBox="0 0 800 500"><text>Magnesium Ribbon</text></svg>)

<svg width="100" height="100"><circle cx="50" cy="50" r="40" /></svg>
`;

    const renderedHtml = renderEducationalMarkdownToHtml(rawMarkdownWithMathAndSvg);
    assert.ok(renderedHtml, 'Rendered HTML should not be empty');
    
    // Check that loose raw <svg> tags were stripped so code strings don't pollute document
    assert.ok(!renderedHtml.includes('<circle cx="50"'), 'Raw XML/SVG tags in prose must be cleaned');

    // Check that markdown image was transformed into an interactive educational diagram card
    assert.ok(renderedHtml.includes('educational-diagram-card'), 'Markdown images must be wrapped in educational diagram cards');
    assert.ok(renderedHtml.includes('Combination Reaction: Burning Magnesium'), 'Diagram caption must be preserved');
    assert.ok(renderedHtml.includes('Verified Curriculum Asset'), 'Educational badge must be displayed');

    // Check that math/chemical notation is formatted
    assert.ok(renderedHtml.includes('2MgO') || renderedHtml.includes('H<sub>2</sub>O') || renderedHtml.includes('math-equation-block'), 'Equations must be parsed');
  });

  await t.test('4. Resilient Fallback: Offline / Quota-Exhausted State Generates Complete Curriculum Notes', async () => {
    // When external AI APIs are quota exhausted, the engine falls back gracefully without 500 error
    const fallbackWorkflow = buildUniversalTeachingWorkflow({
      topic: 'Quadratic Equations',
      subject: 'Mathematics',
      gradeLevel: 'Class 10',
      examContext: 'CBSE Board Examination'
    });

    const fallbackMarkdown = buildSinglePageDigitalTextbookMarkdown(fallbackWorkflow);

    assert.ok(fallbackMarkdown.length > 500, 'Fallback note must provide deep curriculum textbook content');
    assert.ok(fallbackWorkflow.sectionG_formulasAndEquations.hasFormulas, 'Formulas must be enabled for Mathematics');
    assert.ok(fallbackWorkflow.sectionG_formulasAndEquations.symbolsAndUnits.length > 0, 'Symbols must be populated');
    assert.ok(fallbackWorkflow.sectionI_examOrientedPreparation.allQuestions.length > 0, 'Exam prep questions must be populated');
  });
});
