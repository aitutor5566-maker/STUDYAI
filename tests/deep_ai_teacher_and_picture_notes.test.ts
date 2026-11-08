import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { generateFriendlyPersonalTeacherIntro } from '../server/tutorRebuildEngine.ts';
import {
  buildUniversalTeachingWorkflow,
  buildSinglePageDigitalTextbookMarkdown
} from '../server/universalTeachingWorkflowEngine.ts';
import {
  VERIFIED_SCIENTIFIC_ASSETS,
  researchAndRetrieveEducationalVisual
} from '../server/educationalImageResearchEngine.ts';
import { generateNaturalAudioLesson } from '../server/aiAdapter.ts';

test('1. Friendly Personal AI Teacher: addresses student by first name without repetition', () => {
  const greeting = generateFriendlyPersonalTeacherIntro({
    studentName: 'Vishwak Sai',
    topic: 'Photosynthesis',
    subject: 'Biology',
    mode: 'tutor'
  });

  assert.ok(greeting.includes('Vishwak'), 'Greeting addresses student as Vishwak');
  assert.ok(!greeting.includes('Vishwak Sai'), 'Greeting does not repeat full name mechanically');
  assert.ok(greeting.length > 25, 'Greeting is engaging and substantial');
});

test('2. Friendly Personal AI Teacher: generates a warm generic greeting when name is absent', () => {
  const greeting = generateFriendlyPersonalTeacherIntro({
    studentName: '',
    topic: "Newton's Laws of Motion",
    subject: 'Physics',
    mode: 'tutor'
  });

  assert.ok(!greeting.includes('undefined'), 'No undefined in greeting');
  assert.ok(!greeting.includes('null'), 'No null in greeting');
  assert.ok(greeting.length > 20, 'Generates warm generic opening');
});

test('3. Friendly Personal AI Teacher: produces varied conversational opening styles', () => {
  const styles = new Set<string>();
  for (let i = 0; i < 20; i++) {
    const intro = generateFriendlyPersonalTeacherIntro({
      studentName: 'Vishwak',
      topic: 'DNA Structure',
      subject: 'Biology',
      mode: 'voice'
    });
    styles.add(intro);
  }
  assert.ok(styles.size >= 3, `Expected at least 3 distinct styles, got ${styles.size}`);
});

test('4. Friendly Personal AI Teacher: tailors tone for voice lessons and notes audio narration', () => {
  const voiceIntro = generateFriendlyPersonalTeacherIntro({
    studentName: 'Vishwak',
    topic: 'Human Heart',
    subject: 'Biology',
    mode: 'voice'
  });
  assert.ok(voiceIntro.includes('Vishwak'), 'Voice intro mentions student name');

  const notesAudioIntro = generateFriendlyPersonalTeacherIntro({
    studentName: 'Vishwak',
    topic: 'Atomic Structure',
    subject: 'Chemistry',
    mode: 'notes_audio'
  });
  assert.ok(notesAudioIntro.includes('Vishwak'), 'Notes audio intro mentions student name');
  assert.ok(notesAudioIntro.length > 20, 'Substantial audio intro');
});

test('5. Benchmark Topics: Universal Teaching Workflow & Continuous Digital Textbook', () => {
  const benchmarkTopics = [
    { topic: 'Photosynthesis', subject: 'Biology' },
    { topic: 'Structure of the Human Heart', subject: 'Biology' },
    { topic: 'DNA Structure & Replication', subject: 'Biology' },
    { topic: 'Atomic Structure and Bohr Model', subject: 'Chemistry' },
    { topic: 'Force and Laws of Motion', subject: 'Physics' },
    { topic: 'World War II and Global Impact', subject: 'History' },
    { topic: 'Linear Equations in Two Variables', subject: 'Mathematics' }
  ];

  for (const { topic, subject } of benchmarkTopics) {
    const workflow = buildUniversalTeachingWorkflow({
      topic,
      subject,
      grade: 10,
      board: 'CBSE',
      studentName: 'Vishwak'
    });

    assert.equal(workflow.topic, topic);
    assert.ok(workflow.stage1_topicIntroduction.teacherGreeting && workflow.stage1_topicIntroduction.teacherGreeting.includes('Vishwak'), `Stage 1 includes Vishwak for ${topic}`);
    assert.ok(workflow.stage1_topicIntroduction.overview.length > 30, `Stage 1 overview for ${topic}`);
    assert.ok(workflow.stage2_definitionAndMeaning.academicDefinition.length > 20, `Stage 2 academic definition for ${topic}`);
    assert.ok(workflow.stage4_importantTerminology.length >= 2, `Stage 4 terminology for ${topic}`);
    assert.ok(workflow.stage6_detailedWorkingMechanism.whatHappens.length > 20, `Stage 6 mechanism for ${topic}`);
    assert.ok(workflow.stage7_stepByStepProcesses.length >= 3, `Stage 7 processes for ${topic}`);
    assert.ok(workflow.stage8_diagramsAndVisualExplanations[0]?.point1_whatItRepresents.length > 15, `Stage 8 diagram interpretation for ${topic}`);
    assert.ok(workflow.stage9_examplesAndApplications.practicalApplications.length >= 2, `Stage 9 applications for ${topic}`);
    assert.ok(workflow.stage12_importantFactsAndMisconceptions.frequentlyMisunderstood.length >= 1, `Stage 12 misconceptions for ${topic}`);
    assert.ok(workflow.stage14_knowledgeAssessment.length >= 2, `Stage 14 exam questions for ${topic}`);

    const md = buildSinglePageDigitalTextbookMarkdown(workflow);
    assert.ok(md.includes('# '), `Markdown contains top header for ${topic}`);
    assert.ok(md.includes('Table of Contents'), `Markdown contains Table of Contents for ${topic}`);
    assert.ok(md.includes('Personal Teacher Introduction'), `Markdown includes Personal Teacher Introduction for ${topic}`);
    assert.ok(md.includes('Vishwak'), `Markdown greets Vishwak for ${topic}`);
    assert.ok(md.includes('Diagrams & Visual Explanations') || md.includes('8-Point Scientific Diagram Breakdown'), `Markdown includes diagram stage for ${topic}`);
    assert.ok(md.length > 1500, `Markdown length (${md.length}) is comprehensive`);
  }
});

test('6. Verified Educational Visuals & 8-Point Diagram Breakdown for Bohr Atom & Linear Equations', async () => {
  assert.ok(VERIFIED_SCIENTIFIC_ASSETS['atomic_structure_bohr'], 'Bohr atomic model asset exists');
  assert.ok(VERIFIED_SCIENTIFIC_ASSETS['atomic_structure_bohr'].walkthrough?.whatItRepresents?.includes('Bohr atomic model'));

  assert.ok(VERIFIED_SCIENTIFIC_ASSETS['linear_equations_graph'], 'Linear equations graph asset exists');
  assert.ok(VERIFIED_SCIENTIFIC_ASSETS['linear_equations_graph'].walkthrough?.whatItRepresents?.includes('Cartesian'));

  const atomVisual = await researchAndRetrieveEducationalVisual('Atomic Structure and Bohr Model', 10, 'Chemistry');
  assert.ok(atomVisual.directImageUrl, 'Atom visual has direct image/svg url');
  assert.ok(atomVisual.walkthrough?.importantComponents && atomVisual.walkthrough.importantComponents.length >= 2, 'Atom visual has components');

  const mathVisual = await researchAndRetrieveEducationalVisual('Linear Equations in Two Variables', 10, 'Mathematics');
  assert.ok(mathVisual.directImageUrl, 'Math visual has direct image/svg url');
  assert.ok(mathVisual.walkthrough?.whatItRepresents?.includes('Cartesian'), 'Math visual represents Cartesian plane');

  const heartVisual = await researchAndRetrieveEducationalVisual('Structure of the Human Heart', 10, 'Biology');
  assert.equal(heartVisual.accuracyStatus, 'verified', 'Heart visual is verified');
  assert.ok(heartVisual.walkthrough, 'Heart visual has walkthrough');
});

test('7. Natural Voice & Audio Generation with Abbreviations and Speech Synthesis', async () => {
  const audioResult = await generateNaturalAudioLesson({
    topic: 'Structure of the Human Heart',
    scriptText: 'Welcome Vishwak. Notice how the SA node initiates action potentials that travel to the AV node.',
    voice: 'Nova (Teacher)',
    speed: 1.0
  });

  assert.ok(audioResult.durationSeconds > 0, 'Audio duration is positive');
  assert.ok(audioResult.wavDataUrl.startsWith('data:audio/wav;base64,'), 'Wav data URL generated');
  assert.ok(audioResult.audioValidation?.isRealSpeech, 'Real speech validated');
});

test('8. UI Verification: 3D Studio & Video Standalone UI Hidden (Part 11)', () => {
  const tutorPageCode = fs.readFileSync('src/pages/TutorPage.tsx', 'utf8');
  assert.ok(!tutorPageCode.includes('<span>{show3DStudioDrawer ? \'Hide 3D Studio\' : \'Interactive 3D Studio\'}</span>'), 'No Interactive 3D Studio button in TutorPage');
  assert.ok(!tutorPageCode.includes('Universal 3D Educational Diagram Studio'), 'No 3D studio drawer in TutorPage');

  const libraryPageCode = fs.readFileSync('src/pages/LibraryPage.tsx', 'utf8');
  assert.ok(libraryPageCode.includes('Voice Teacher &amp; Audio Lessons'), 'LibraryPage features Voice Teacher');
  assert.ok(!libraryPageCode.includes('<h3 style={{ fontSize: \'1.1rem\', fontWeight: 900, color: \'#202124\' }}>Interactive 3D Lab</h3>'), 'No Interactive 3D Lab card in LibraryPage');

  const flutterHomeCode = fs.readFileSync('apps/student_app/lib/screens/home_screen.dart', 'utf8');
  assert.ok(flutterHomeCode.includes("title': 'Audio Lessons'"), 'Flutter HomeScreen has Audio Lessons');
  assert.ok(!flutterHomeCode.includes("title': '3D Science Lab'"), 'Flutter HomeScreen has no 3D Science Lab');
});
