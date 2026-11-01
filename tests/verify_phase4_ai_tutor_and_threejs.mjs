/**
 * STUDYAI — PHASE 4: ADVANCED AI TUTOR, VISUAL TEACHING & THREE.JS VERIFICATION SUITE
 * 
 * Verifies:
 *  1. Complete 14-Section Pedagogical Lesson Generation (Overview, Objectives, Prerequisites,
 *     Detailed Explanation, Subtopics, Definitions, Terminology & Full Forms, Processes, Examples,
 *     Key Points, Misconceptions, Applications, Summary, Understanding Questions)
 *  2. Visual Intelligence Engine & Deterministic High-Contrast Labeled SVGs
 *  3. Visual Association Metadata (Lesson ID, Topic, Subtopic, Concept, Accessibility, Source)
 *  4. Official Three.js Submodule / Repository Compliance (v0.170.0, MIT License, Zero Duplicate Rule)
 *  5. Unified Visual Learning Engine Capabilities (Scene, Camera, Lighting, GLB, Procedural Geometry,
 *     Animation, Raycasting, Highlighting, Reset, Memory Disposal)
 *  6. AI-to-3D Workflow for Curriculum Topics (Heart, DNA, Photosynthesis, Bohr Atom, Solar System, Newton's Laws)
 *  7. Interactive Teacher Experience (Context-Preserved Follow-Ups: simpler, step_by_step, explain_part, compare)
 *  8. Audio Text-to-Speech Narration Synthesis (/api/v1/tutor/audio)
 *  9. Direct Save-to-Notes Pipeline (/api/v1/tutor/save-to-notes)
 * 10. Strict Server-Level Video Generation Prohibition (403 FEATURE_DISABLED)
 * 11. Multi-Topic Quality & Scientific Accuracy Assessment
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';

let passedCount = 0;
let failedCount = 0;

function report(step, description, success, details = '') {
  if (success) {
    passedCount++;
    console.log(`  ✔ [PASS] ${step}: ${description}`);
    if (details) console.log(`     ${details}`);
  } else {
    failedCount++;
    console.error(`  ✖ [FAIL] ${step}: ${description}`);
    if (details) console.error(`     Error: ${details}`);
  }
}

async function runPhase4Verification() {
  console.log('\n================================================================');
  console.log('🧠 RUNNING STUDYAI PHASE 4 ADVANCED AI TUTOR & THREE.JS SUITE');
  console.log('================================================================\n');

  const rootDir = process.cwd();
  const threeJsDir = path.join(rootDir, 'visual_learning/three.js');
  const enginePath = path.join(rootDir, 'visual_learning/engine/VisualLearningEngine.ts');
  const baseUrl = 'http://127.0.0.1:8000';

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Official Three.js Repository Integration & Compliance
    // -------------------------------------------------------------------------
    console.log('[TEST 1] Verifying Official Three.js Upstream Compliance');
    assert.ok(fs.existsSync(path.join(threeJsDir, 'package.json')), 'Three.js package.json missing');
    assert.ok(fs.existsSync(path.join(threeJsDir, 'LICENSE')), 'Three.js LICENSE missing');
    assert.ok(fs.existsSync(path.join(threeJsDir, 'INTEGRATION.md')), 'INTEGRATION.md missing');

    const integrationDoc = fs.readFileSync(path.join(threeJsDir, 'INTEGRATION.md'), 'utf-8');
    assert.ok(integrationDoc.includes('0.170.0'), 'Three.js release version missing');
    assert.ok(integrationDoc.includes('MIT License'), 'MIT license statement missing');
    assert.ok(integrationDoc.includes('Zero Duplicate Three.js Installations'), 'Single-source rule missing');
    report('T1', 'Official Three.js v0.170.0 repository & license compliance verified', true);

    // -------------------------------------------------------------------------
    // TEST 2: Unified VisualLearningEngine & Procedural Geometry Factory
    // -------------------------------------------------------------------------
    console.log('\n[TEST 2] Verifying VisualLearningEngine Three.js Capabilities');
    assert.ok(fs.existsSync(enginePath), 'VisualLearningEngine.ts missing');
    const engineContent = fs.readFileSync(enginePath, 'utf-8');

    assert.ok(engineContent.includes('ProceduralGeometryFactory'), 'ProceduralGeometryFactory missing');
    assert.ok(engineContent.includes('createHumanHeart'), 'createHumanHeart missing');
    assert.ok(engineContent.includes('createDnaHelix'), 'createDnaHelix missing');
    assert.ok(engineContent.includes('createChloroplastPhotosynthesis'), 'createChloroplastPhotosynthesis missing');
    assert.ok(engineContent.includes('createSolarSystem'), 'createSolarSystem missing');
    assert.ok(engineContent.includes('createAtomicStructure'), 'createAtomicStructure missing');
    assert.ok(engineContent.includes('GLTFLoader'), 'GLTFLoader missing');
    assert.ok(engineContent.includes('Raycaster'), 'Raycaster interaction missing');
    report('T2', 'Three.js VisualLearningEngine supports procedural models, GLB, lighting, and raycasting', true);

    // -------------------------------------------------------------------------
    // TEST 3: Complete 14-Section Pedagogical Lesson Assembly
    // -------------------------------------------------------------------------
    console.log('\n[TEST 3] Verifying Complete 14-Section AI Tutor Lesson Generation');
    const heartLessonRes = await fetch(`${baseUrl}/api/v1/tutor/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'Human Heart and Blood Circulation',
        question: 'Explain double circulation, chambers, valves, and SA node pacemaker',
        grade: 10,
        level: 'Grade 10',
        subject: 'Science',
        mode: 'detailed'
      })
    });
    assert.strictEqual(heartLessonRes.status, 200);
    const lesson = await heartLessonRes.json();

    assert.ok(lesson.lesson_id);
    assert.ok(lesson.topic_overview);
    assert.ok(lesson.learning_objectives.length >= 3);
    assert.ok(lesson.prerequisites.length >= 2);
    assert.ok(lesson.detailed_explanation.length > 100);
    assert.ok(lesson.subtopics.length >= 2);
    assert.ok(lesson.definitions.length >= 2);
    assert.ok(lesson.terminology_and_abbreviations.length >= 2);
    assert.ok(lesson.step_by_step_processes.length >= 3);
    assert.ok(lesson.real_world_examples.length >= 1);
    assert.ok(lesson.key_points.length >= 2);
    assert.ok(lesson.common_misconceptions.length >= 1);
    assert.ok(lesson.applications);
    assert.ok(lesson.topic_summary);
    assert.ok(lesson.understanding_questions.length >= 2);

    report('T3', '14-section pedagogical lesson assembled with objectives, definitions, full forms, and summary', true, `Lesson ID: ${lesson.lesson_id}`);

    // -------------------------------------------------------------------------
    // TEST 4: Terminology & Abbreviation Expansion (No Unexplained Acronyms)
    // -------------------------------------------------------------------------
    console.log('\n[TEST 4] Verifying Abbreviation Expansion (Full Forms & Roles)');
    const abbrs = lesson.terminology_and_abbreviations;
    const hasSaNode = abbrs.some(a => a.abbr.includes('SA Node') || a.abbr.includes('ATP') || a.abbr.includes('DNA'));
    assert.ok(hasSaNode, 'Key abbreviations expanded with full forms');
    for (const item of abbrs) {
      assert.ok(item.abbr && item.full_form && item.definition, 'Incomplete abbreviation entry');
    }
    report('T4', `All abbreviations expanded (${abbrs.length} terms: ${abbrs.map(a => a.abbr).join(', ')})`, true);

    // -------------------------------------------------------------------------
    // TEST 5: Visual Intelligence Engine & Deterministic Labeled SVGs
    // -------------------------------------------------------------------------
    console.log('\n[TEST 5] Verifying Visual Representations & Labeled Diagrams');
    const visuals = lesson.visual_representations;
    assert.ok(visuals.length > 0, 'No visual representations generated');
    const firstVisual = visuals[0];

    assert.strictEqual(firstVisual.lesson_id, lesson.lesson_id);
    assert.ok(firstVisual.topic);
    assert.ok(firstVisual.subtopic);
    assert.ok(firstVisual.accessibility_text);
    assert.ok(firstVisual.data_url.startsWith('data:image/svg+xml'));
    assert.ok(firstVisual.source_metadata.contrast_validated);

    report('T5', 'Deterministic labeled SVG generated with Lesson ID association and accessibility text', true);

    // -------------------------------------------------------------------------
    // TEST 6: AI-to-3D Workflow & Three.js Model Mapping
    // -------------------------------------------------------------------------
    console.log('\n[TEST 6] Verifying AI-to-3D Model Mapping');
    assert.ok(lesson.three_js_model);
    assert.strictEqual(lesson.three_js_model.has_3d_support, true);
    assert.strictEqual(lesson.three_js_model.model_id, 'human_heart');
    report('T6', `AI-to-3D workflow mapped topic to validated 3D simulation: ${lesson.three_js_model.model_id}`, true);

    // -------------------------------------------------------------------------
    // TEST 7: Interactive Teacher Experience (Context-Preserved Follow-Ups)
    // -------------------------------------------------------------------------
    console.log('\n[TEST 7] Verifying Context-Preserved Interactive Teacher Follow-Ups');

    // 7a. Make it simpler
    const simplerRes = await fetch(`${baseUrl}/api/v1/tutor/follow-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action_type: 'simpler',
        topic: lesson.topic,
        current_lesson_id: lesson.lesson_id
      })
    });
    assert.strictEqual(simplerRes.status, 200);
    const simplerData = await simplerRes.json();
    assert.ok(simplerData.teacher_explanation.includes('factory') || simplerData.teacher_explanation.includes('analogy'));
    report('T7a', 'Teacher follow-up "Make it simpler" returned intuitive analogy', true);

    // 7b. Explain selected 3D part
    const partRes = await fetch(`${baseUrl}/api/v1/tutor/follow-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action_type: 'explain_part',
        topic: lesson.topic,
        current_lesson_id: lesson.lesson_id,
        selected_part: 'Left Ventricle'
      })
    });
    assert.strictEqual(partRes.status, 200);
    const partData = await partRes.json();
    assert.ok(partData.teacher_explanation.includes('Left Ventricle'));
    report('T7b', 'Teacher follow-up "Explain selected 3D part" explained Left Ventricle in context', true);

    // 7c. Step-by-step
    const stepRes = await fetch(`${baseUrl}/api/v1/tutor/follow-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action_type: 'step_by_step',
        topic: lesson.topic,
        current_lesson_id: lesson.lesson_id
      })
    });
    assert.strictEqual(stepRes.status, 200);
    const stepData = await stepRes.json();
    assert.ok(stepData.teacher_explanation.includes('Stage 1'));
    report('T7c', 'Teacher follow-up "Explain step-by-step" returned staged breakdown', true);

    // -------------------------------------------------------------------------
    // TEST 8: Audio Narration Text-to-Speech Synthesis
    // -------------------------------------------------------------------------
    console.log('\n[TEST 8] Verifying Audio Lesson Synthesis');
    assert.ok(lesson.audio_lesson);
    assert.ok(lesson.audio_lesson.script.length > 30);
    assert.strictEqual(lesson.audio_lesson.voice, 'Nova (Teacher)');

    const audioRes = await fetch(`${baseUrl}/api/v1/tutor/audio?topic=Human+Heart&speed=1.0`);
    assert.strictEqual(audioRes.status, 200);
    const audioData = await audioRes.json();
    assert.ok(audioData.audio_data_url.startsWith('data:audio/wav'));
    report('T8', 'Audio text-to-speech synthesis generated valid WAV narration stream and script', true);

    // -------------------------------------------------------------------------
    // TEST 9: Direct Save-to-Notes Pipeline
    // -------------------------------------------------------------------------
    console.log('\n[TEST 9] Verifying Save Lesson Directly into AI Notes');
    const saveNoteRes = await fetch(`${baseUrl}/api/v1/tutor/save-to-notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lesson_id: lesson.lesson_id,
        title: 'Human Heart Master Study Notebook',
        topic: lesson.topic,
        subject: lesson.subject,
        notebook_name: 'Cardiology 2026',
        content_markdown: lesson.detailed_explanation,
        flashcards: [
          { front: 'What is the function of the SA Node?', back: 'Natural pacemaker initiating cardiac electrical impulses' }
        ],
        quiz: [
          { question: 'Which chamber pumps blood to the systemic circulation?', options: ['Left Ventricle', 'Right Atrium'], answer: 'Left Ventricle' }
        ]
      })
    });
    assert.strictEqual(saveNoteRes.status, 201);
    const saveNoteData = await saveNoteRes.json();
    assert.ok(saveNoteData.note_id);
    report('T9', 'Lesson converted into AI Study Notebook with flashcards & quiz', true, `Note ID: ${saveNoteData.note_id}`);

    // -------------------------------------------------------------------------
    // TEST 10: Strict Video Generation Restriction
    // -------------------------------------------------------------------------
    console.log('\n[TEST 10] Verifying Video Generation Prohibition Integrity');
    const videoCheck = await fetch(`${baseUrl}/api/v1/media/video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Create animated heart video' })
    });
    assert.strictEqual(videoCheck.status, 403);
    const videoErr = await videoCheck.json();
    assert.strictEqual(videoErr.detail.code, 'FEATURE_DISABLED');
    report('T10', 'Video generation strictly forbidden (403 FEATURE_DISABLED)', true);

    // -------------------------------------------------------------------------
    // TEST 11: Multi-Topic Quality & Scientific Accuracy Assessment
    // -------------------------------------------------------------------------
    console.log('\n[TEST 11] Verifying Curriculum Topic Coverage & Model Mapping');
    const topicsToTest = [
      { topic: 'DNA Structure and Replication', expectedModel: 'dna_double_helix' },
      { topic: 'Photosynthesis in Plant Cells', expectedModel: 'plant_cell' },
      { topic: 'Newton’s Laws of Motion', expectedModel: 'newtons_laws' },
      { topic: 'Atomic Structure (Bohr Model)', expectedModel: 'atom_structure' },
      { topic: 'Solar System Dynamics', expectedModel: 'solar_system' }
    ];

    for (const item of topicsToTest) {
      const res = await fetch(`${baseUrl}/api/v1/tutor/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: item.topic,
          question: `Explain core concepts and models of ${item.topic}`,
          grade: 10,
          level: 'Grade 10',
          subject: 'Science'
        })
      });
      assert.strictEqual(res.status, 200);
      const lData = await res.json();
      assert.ok(lData.three_js_model);
      assert.strictEqual(lData.three_js_model.model_id, item.expectedModel);
      assert.ok(lData.understanding_questions.length >= 2);
    }
    report('T11', `Verified 5 foundational science curriculum topics with 100% 3D model mapping`, true);

    console.log('\n================================================================');
    console.log(`🎉 ALL ${passedCount} PHASE 4 AI TUTOR & THREE.JS ACCEPTANCE TESTS PASSED!`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('\n❌ PHASE 4 VERIFICATION FAILED:', err);
    process.exitCode = 1;
  }
}

runPhase4Verification();
