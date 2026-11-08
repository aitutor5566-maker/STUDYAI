import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  generateFriendlyPersonalTeacherIntro,
  enrichLessonWithRebuildStructure
} from '../server/tutorRebuildEngine.ts';
import {
  cleanNotebookTextForAudioSpeech,
  partitionWorkflowIntoPages,
  buildAudioPlaylistForNotebook
} from '../server/digitalNotebookPaginationEngine.ts';
import {
  buildUniversalTeachingWorkflow
} from '../server/universalTeachingWorkflowEngine.ts';

describe('STUDYAI Friendly AI Teacher, Long-Term Learning, Audio Notes & Digital Textbook', () => {

  it('1. AI Tutor: Natural topic introduction addresses student by name with varied styles', () => {
    // When student name is available
    const intro1 = generateFriendlyPersonalTeacherIntro({
      studentName: 'Vishwak Sai',
      topic: 'Photosynthesis',
      subject: 'Science',
      grade: 10,
      mode: 'tutor',
      styleIndex: 0
    });
    assert.match(intro1, /Hey, Vishwak!/i, 'Addresses student by their actual first name');
    assert.match(intro1, /Photosynthesis/i, 'Mentions the lesson topic');
    assert.match(intro1, /plants prepare their own food using sunlight/i, 'Engaging contextual hook');

    // Natural variation across style indices
    const intro2 = generateFriendlyPersonalTeacherIntro({
      studentName: 'Vishwak Sai',
      topic: 'Photosynthesis',
      subject: 'Science',
      grade: 10,
      mode: 'tutor',
      styleIndex: 1
    });
    assert.match(intro2, /Hello, Vishwak!/i, 'Provides alternative natural greeting style');
    assert.notEqual(intro1, intro2, 'Greeting styles must vary naturally');

    // Warm, welcoming generic greeting when name is absent (without inventing fake names)
    const genericIntro = generateFriendlyPersonalTeacherIntro({
      topic: 'Structure of the Human Heart',
      subject: 'Biology',
      grade: 10,
      mode: 'tutor'
    });
    assert.doesNotMatch(genericIntro, /\b(Student|User|Anonymous|Guest)\b/i, 'Never uses placeholder name tokens');
    assert.match(genericIntro, /Structure of the Human Heart/i, 'Mentions the topic clearly');
    assert.match(genericIntro, /Hello|Welcome/i, 'Friendly welcoming greeting');
  });

  it('2. AI Tutor: Relatable real-life examples for abstract curriculum concepts', () => {
    const dummySvg = () => ({
      dataUrl: 'data:image/svg+xml;utf8,<svg></svg>',
      diagramType: 'Diagram',
      caption: 'Curriculum Visual',
      limitationNote: 'Diagram'
    });

    // A. Photosynthesis: Plants cooking food in nature using sunlight, water, and CO2
    const photLesson = enrichLessonWithRebuildStructure(
      { topic: 'Photosynthesis', subject: 'Science', grade: 10 },
      dummySvg
    );
    const photExample = photLesson.learningJourney?.part7_everydayExamples?.[0] || '';
    assert.match(photExample, /cooking/i, 'Contains cooking analogy for photosynthesis');
    assert.match(photExample, /sunlight/i, 'Relates sunlight energy to cooking food');

    // B. Force: Pushing a shopping trolley or bicycle
    const forceLesson = enrichLessonWithRebuildStructure(
      { topic: 'Newton Laws of Motion and Force', subject: 'Physics', grade: 9 },
      dummySvg
    );
    const forceExample = forceLesson.learningJourney?.part7_everydayExamples?.[0] || '';
    assert.match(forceExample, /trolley|bicycle/i, 'Contains shopping trolley or bicycle force analogy');

    // C. Friction: Walking on slippery floor vs dry pavement
    const frictionLesson = enrichLessonWithRebuildStructure(
      { topic: 'Friction and Surface Resistance', subject: 'Physics', grade: 8 },
      dummySvg
    );
    const frictionExample = frictionLesson.learningJourney?.part7_everydayExamples?.[0] || '';
    assert.match(frictionExample, /pavement|floor|slip|ice/i, 'Relates friction to gripping pavement vs slipping on ice');

    // D. Electricity: Household light switch and closed circuit
    const circuitLesson = enrichLessonWithRebuildStructure(
      { topic: 'Electric Circuit and Voltage', subject: 'Physics', grade: 10 },
      dummySvg
    );
    const circuitExample = circuitLesson.learningJourney?.part7_everydayExamples?.[0] || '';
    assert.match(circuitExample, /switch|bulb|circuit/i, 'Relates electric circuit to household light switch');

    // E. Fractions: Sharing a pizza or chocolate bar equally
    const fractionLesson = enrichLessonWithRebuildStructure(
      { topic: 'Fractions and Ratios', subject: 'Mathematics', grade: 6 },
      dummySvg
    );
    const fractionExample = fractionLesson.learningJourney?.part7_everydayExamples?.[0] || '';
    assert.match(fractionExample, /pizza|slice|chocolate/i, 'Relates fractions to sharing pizza slices');
  });

  it('3. AI Tutor: Active recall prompts and spaced retrieval retention techniques', () => {
    const dummySvg = () => ({
      dataUrl: 'data:image/svg+xml;utf8,<svg></svg>',
      diagramType: 'Diagram',
      caption: 'Curriculum Visual',
      limitationNote: 'Diagram'
    });

    const lesson = enrichLessonWithRebuildStructure(
      { topic: 'Structure of the Human Heart', subject: 'Biology', grade: 10 },
      dummySvg
    );

    const checks = lesson.learningJourney?.part12_understandingChecks;
    assert.ok(Array.isArray(checks) && checks.length > 0, 'Contains understanding checks');
    const primaryCheck = checks[0];

    assert.ok(primaryCheck.activeRecallPrompt, 'Includes an active recall self-explanation prompt');
    assert.match(primaryCheck.activeRecallPrompt, /active recall/i, 'Explicitly prompts active recall');

    assert.ok(primaryCheck.spacedRetrievalTip, 'Includes spaced retrieval guidance');
    assert.match(primaryCheck.spacedRetrievalTip, /spaced retrieval|long-term/i, 'Teaches spaced retrieval for long-term memory');
  });

  it('4. Digital Textbook: Automatic page partitioning into ordered textbook pages', () => {
    const workflow = buildUniversalTeachingWorkflow({
      topic: 'Photosynthesis',
      subject: 'Biology',
      grade: 10,
      board: 'CBSE'
    });

    const pages = partitionWorkflowIntoPages(workflow);

    assert.ok(pages.length >= 8, `Expected at least 8 textbook pages, got ${pages.length}`);

    // Page 1: Topic Introduction & Core Definition
    assert.equal(pages[0].pageNumber, 1);
    assert.match(pages[0].title, /Introduction|Definition/i);
    assert.match(pages[0].contentMarkdown, /Academic Textbook Definition/i);

    // Page 2: Terminology, Full Forms & Prerequisites
    assert.equal(pages[1].pageNumber, 2);
    assert.match(pages[1].title, /Terminology|Full Forms/i);

    // Subtopic Pages with dedicated adjacent diagrams and 8-point breakdowns
    const subtopicPages = pages.filter((p) => p.diagrams && p.diagrams.length > 0);
    assert.ok(subtopicPages.length >= 3, `Expected at least 3 pages with diagrams, got ${subtopicPages.length}`);

    for (const sp of subtopicPages) {
      for (const diag of sp.diagrams) {
        assert.ok(diag.title, 'Diagram must have a title');
        assert.ok(diag.imageUrl.startsWith('data:image/svg+xml'), 'Diagram must have valid SVG data URL');
        assert.ok(diag.point1_whatItRepresents, 'Diagram includes Point 1: What It Represents');
        assert.ok(Array.isArray(diag.point2_labelledParts), 'Diagram includes Point 2: Labelled Parts');
        assert.ok(diag.point3_componentFunctions, 'Diagram includes Point 3: Component Functions');
        assert.ok(diag.point4_componentRelationships, 'Diagram includes Point 4: Component Relationships');
        assert.ok(diag.point5_directionOfMovementOrProcess, 'Diagram includes Point 5: Direction of Process');
        assert.ok(Array.isArray(diag.point6_stepByStepInterpretation), 'Diagram includes Point 6: Step-by-Step Interpretation');
        assert.ok(diag.point7_learningOutcome, 'Diagram includes Point 7: Learning Outcome');
        assert.ok(diag.point8_whatToRemember, 'Diagram includes Point 8: What to Remember');
      }
    }

    // Mechanism Page
    const mechanismPage = pages.find((p) => /mechanism|sequence|process flow/i.test(p.title));
    assert.ok(mechanismPage, 'Includes dedicated mechanism/process page');

    // Comparisons Page
    const comparisonPage = pages.find((p) => /comparison|difference/i.test(p.title));
    assert.ok(comparisonPage, 'Includes comparative analysis page');

    // Final Revision Master Page
    const revisionPage = pages.find((p) => /revision|master/i.test(p.title));
    assert.ok(revisionPage, 'Includes final revision master sheet page');

    // Assessment Self-Test Page
    const assessmentPage = pages.find((p) => /assessment|quiz|self-test/i.test(p.title));
    assert.ok(assessmentPage, 'Includes knowledge assessment practice page');
  });

  it('5. Notes-to-Audio: Text sanitization never pronounces punctuation names and eliminates noise', () => {
    const rawMarkdownWithMathAndPunctuation = `
## Stage 1: Topic Introduction
Photosynthesis, comma, is a vital process full stop.
Equation: $6CO_2 + 6H_2O \\rightarrow C_6H_{12}O_6 + 6O_2$.
Force formula: $F = m \\cdot a$.
<details><summary>Click to view</summary>Hidden text</details>
| Abbr | Full Form |
| :--- | :--- |
| ATP | Adenosine Triphosphate |
Remember: Never say comma colon period semicolon in speech.
Photosynthesis, comma, is a vital process full stop.
`.trim();

    const cleanAudioSpeech = cleanNotebookTextForAudioSpeech(rawMarkdownWithMathAndPunctuation, 'Photosynthesis');

    // CRITICAL REQUIREMENT: Never pronounce punctuation names
    assert.doesNotMatch(cleanAudioSpeech, /\bcomma\b/i, 'Never pronounces the word "comma"');
    assert.doesNotMatch(cleanAudioSpeech, /\bfull\s*stop\b/i, 'Never pronounces the words "full stop"');
    assert.doesNotMatch(cleanAudioSpeech, /\bperiod\b/i, 'Never pronounces the word "period"');
    assert.doesNotMatch(cleanAudioSpeech, /\bsemicolon\b/i, 'Never pronounces the word "semicolon"');

    // Mathematical formula conversion
    assert.match(cleanAudioSpeech, /six molecules of Carbon Dioxide/i, 'Converts 6CO2 to natural spoken English');
    assert.match(cleanAudioSpeech, /Glucose/i, 'Converts C6H12O6 to Glucose');
    assert.match(cleanAudioSpeech, /Force equals mass times acceleration/i, 'Converts F = m * a to spoken words');

    // Markdown and HTML stripping
    assert.doesNotMatch(cleanAudioSpeech, /<details>|<summary>/i, 'Strips HTML tags completely');
    assert.doesNotMatch(cleanAudioSpeech, /\|/g, 'Strips markdown table pipe characters');
    assert.doesNotMatch(cleanAudioSpeech, /##/g, 'Strips markdown header hashes');

    // Repetition elimination
    const occurrences = (cleanAudioSpeech.match(/is a vital process/gi) || []).length;
    assert.equal(occurrences, 1, 'Deduplicates identical consecutive sentences');
  });

  it('6. Audio Narration Playlist: Builds non-repeating ordered track playlist for notebook', () => {
    const workflow = buildUniversalTeachingWorkflow({
      topic: 'Human Heart',
      subject: 'Biology',
      grade: 10,
      board: 'CBSE'
    });

    const playlist = buildAudioPlaylistForNotebook(workflow);
    assert.ok(playlist.length >= 8, `Expected playlist with at least 8 tracks, got ${playlist.length}`);

    // Verify ordering and unique track numbering
    for (let i = 0; i < playlist.length; i++) {
      assert.equal(playlist[i].pageNumber, i + 1, `Playlist track ${i} must match page number ${i + 1}`);
      assert.ok(playlist[i].pageTitle.length > 0, `Track ${i + 1} has valid title`);
      assert.ok(playlist[i].spokenText.length > 20, `Track ${i + 1} has substantial spoken text`);
      assert.ok(playlist[i].estimatedDurationSeconds > 0, `Track ${i + 1} has positive duration`);

      // Ensure no punctuation names are in spoken text
      assert.doesNotMatch(playlist[i].spokenText, /\bcomma\b/i, `Track ${i + 1} must not contain spoken "comma"`);
      assert.doesNotMatch(playlist[i].spokenText, /\bfull\s*stop\b/i, `Track ${i + 1} must not contain spoken "full stop"`);
    }
  });
});
