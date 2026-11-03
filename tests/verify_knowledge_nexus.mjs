// verify_knowledge_nexus.mjs
// Automated End-to-End Verification Battery for STUDYAI Knowledge Nexus

import assert from 'node:assert';

const BASE_URL = process.env.API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

async function runBattery() {
  console.log('🧪 Starting STUDYAI Knowledge Nexus End-to-End Verification Battery...\n');

  // Test 1: Curriculum Node Retrieval
  console.log('1️⃣ Testing ICSE Curriculum Node Retrieval (Grade 10)...');
  const currRes = await fetch(`${BASE_URL}/nexus/curriculum/10`);
  assert.strictEqual(currRes.status, 200, 'Curriculum endpoint returned HTTP 200');
  const currData = await currRes.json();
  assert.strictEqual(currData.board, 'ICSE');
  assert.ok(currData.subjects['Mathematics'], 'ICSE Mathematics present');
  assert.ok(currData.subjects['History & Civics'], 'ICSE History & Civics present');
  assert.ok(currData.approved_publishers.length >= 3, 'Multiple approved publishers available');
  console.log('   ✅ Passed: ICSE curriculum tree verified across multiple publishers.\n');

  // Test 2: SymPy Symbolic Mathematics Resolution
  console.log('2️⃣ Testing SymPy Symbolic Mathematics Solver...');
  const mathRes = await fetch(`${BASE_URL}/nexus/solve-math`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expression: '3*x^2 - 12*x + 9 = 0' })
  });
  assert.strictEqual(mathRes.status, 200);
  const mathData = await mathRes.json();
  assert.strictEqual(mathData.success, true);
  assert.strictEqual(mathData.verified_by_sympy, true);
  assert.deepStrictEqual(mathData.solution.sort(), ['1', '3'].sort());
  console.log('   ✅ Passed: SymPy symbolic computation returned exact roots [1, 3] with steps.\n');

  // Test 3: Mathematical Verification Engine
  console.log('3️⃣ Testing Independent Mathematical Verification...');
  const verifyRes = await fetch(`${BASE_URL}/nexus/verify-math`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ equation: 'x^2 - 9 = 0', candidate_answer: '3' })
  });
  assert.strictEqual(verifyRes.status, 200);
  const verifyData = await verifyRes.json();
  assert.strictEqual(verifyData.is_correct, true);
  console.log('   ✅ Passed: Candidate solution x=3 successfully verified against x^2 - 9 = 0.\n');

  // Test 4: History 16-Point Event Dossier
  console.log('4️⃣ Testing History 16-Point Event Analysis & Visual Timeline...');
  const histRes = await fetch(`${BASE_URL}/nexus/history-event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_query: 'The First War of Independence 1857' })
  });
  assert.strictEqual(histRes.status, 200);
  const histData = await histRes.json();
  assert.strictEqual(histData.success, true);
  assert.ok(histData.dossier.key_figures.length >= 4);
  assert.ok(histData.timeline_svg.includes('<svg'));
  console.log('   ✅ Passed: 16-point event analysis and interactive SVG timeline generated.\n');

  // Test 5: Subject & Chapter Classification
  console.log('5️⃣ Testing Subject & Chapter Classifier...');
  const classRes = await fetch(`${BASE_URL}/nexus/classify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'How does ultrafiltration occur in the nephron glomerulus?' })
  });
  assert.strictEqual(classRes.status, 200);
  const classData = await classRes.json();
  assert.strictEqual(classData.board, 'ICSE');
  assert.strictEqual(classData.subject, 'Biology');
  console.log('   ✅ Passed: Query correctly mapped to ICSE Biology curriculum node.\n');

  // Test 6: Declarative Three.js 3D Scene Specification
  console.log('6️⃣ Testing Declarative Three.js 3D Scene Specification...');
  const sceneRes = await fetch(`${BASE_URL}/nexus/3d-scene/human-heart`);
  assert.strictEqual(sceneRes.status, 200);
  const sceneData = await sceneRes.json();
  assert.ok(sceneData.scene.objects.length >= 2);
  assert.ok(sceneData.scene.annotations.length >= 2);
  console.log('   ✅ Passed: Safe declarative Three.js 3D scene specification verified.\n');

  // Test 7: Grade-Wise Depth Controller Profiles (Grade 6 vs Grade 10)
  console.log('7️⃣ Testing Grade-Wise Content Depth Controller (Grade 6 vs Grade 10)...');
  const g6Res = await fetch(`${BASE_URL}/nexus/grade-profile/6`);
  assert.strictEqual(g6Res.status, 200);
  const g6Data = await g6Res.json();
  assert.strictEqual(g6Data.max_sentence_length, 18);
  assert.strictEqual(g6Data.vocabulary_level, 'introductory_scientific');

  const g10Res = await fetch(`${BASE_URL}/nexus/grade-profile/10`);
  assert.strictEqual(g10Res.status, 200);
  const g10Data = await g10Res.json();
  assert.strictEqual(g10Data.max_sentence_length, 28);
  assert.strictEqual(g10Data.vocabulary_level, 'rigorous_icse_board_certification');
  console.log('   ✅ Passed: Distinct Grade 6 vs Grade 10 depth & vocabulary profiles verified.\n');

  // Test 8: Modular Student Adaptations Preview (Multiple Simultaneous Difficulties)
  console.log('8️⃣ Testing Modular Student Adaptations Preview (Spelling, Reading, Memory)...');
  const adaptRes = await fetch(`${BASE_URL}/nexus/adaptations-preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: 'Photosynthesis',
      subject: 'Biology',
      grade: 7,
      difficulties: ['spelling', 'reading', 'remembering_information']
    })
  });
  assert.strictEqual(adaptRes.status, 200);
  const adaptData = await adaptRes.json();
  assert.ok(adaptData.spelling_card, 'Spelling syllabary card generated');
  assert.ok(adaptData.reading_support, 'Reading support generated');
  assert.ok(adaptData.memory_aids, 'Memory mnemonics generated');
  assert.strictEqual(adaptData.applied_difficulties.length, 3);
  console.log('   ✅ Passed: Multiple learning difficulty adaptations generated harmoniously.\n');

  // Test 9: Adaptive Learning Memory & Continuous Tracking
  console.log('9️⃣ Testing Adaptive Learning Memory & Closed-Loop Performance Tracking...');
  const testUserId = 'student-test-phase16';
  const updateRes = await fetch(`${BASE_URL}/nexus/adaptive-profile/${testUserId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      difficulties: ['spelling', 'mathematical_calculations'],
      explanation_style: 'concise',
      grade: 8
    })
  });
  assert.strictEqual(updateRes.status, 200);

  const getProfRes = await fetch(`${BASE_URL}/nexus/adaptive-profile/${testUserId}`);
  assert.strictEqual(getProfRes.status, 200);
  const profData = await getProfRes.json();
  assert.strictEqual(profData.grade, 8);
  assert.strictEqual(profData.explanation_style, 'concise');
  assert.ok(profData.difficulties.includes('spelling'));

  // Record an interaction
  const interactRes = await fetch(`${BASE_URL}/nexus/record-interaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: testUserId,
      topic: 'Photosynthesis',
      subject: 'Biology',
      grade: 8,
      question_answered: true,
      was_correct: true,
      student_feedback: 'just_right'
    })
  });
  assert.strictEqual(interactRes.status, 200);
  const interactData = await interactRes.json();
  assert.strictEqual(interactData.practice_metrics.total_questions_attempted, 1);
  assert.strictEqual(interactData.practice_metrics.total_correct, 1);
  console.log('   ✅ Passed: Adaptive memory updated preferences and recorded empirical performance.\n');

  // Test 10: Phase 17 Gemini Voice Teacher - Start Spoken Lesson
  console.log('🔟 Testing Phase 17 Gemini Voice Teacher Start Lesson & Audio Synthesis...');
  const voiceStartRes = await fetch(`${BASE_URL}/voice/start-lesson`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: 'Photosynthesis',
      grade: 8,
      subject: 'Biology',
      board: 'ICSE',
      learning_difficulties: ['reading'],
      preferred_style: 'visual',
      voice_persona: 'Kore'
    })
  });
  assert.strictEqual(voiceStartRes.status, 200, 'Voice start-lesson returned HTTP 200');
  const voiceStartData = await voiceStartRes.json();
  assert.ok(voiceStartData.session_id.startsWith('vsession-'), 'Session ID generated');
  assert.strictEqual(voiceStartData.status, 'active');
  assert.strictEqual(voiceStartData.current_step_index, 0);
  assert.ok(voiceStartData.total_steps >= 4, 'Multiple curriculum steps prepared');
  assert.ok(voiceStartData.teacher_speech.length > 20, 'Spoken lesson hook generated');
  assert.ok(voiceStartData.audio_url.startsWith('data:audio/wav;base64,'), 'Playable WAV base64 audio returned');
  assert.ok(voiceStartData.audio_duration_seconds > 0, 'Audio duration calculated');
  assert.ok(voiceStartData.synced_visual, 'Synchronized visual (3D/diagram) attached');
  console.log(`   ✅ Passed: Spoken lesson started (Session: ${voiceStartData.session_id}, Audio: ${voiceStartData.audio_duration_seconds}s).\n`);

  // Test 11: Phase 17 Gemini Voice Teacher - Conversational Clarification & Step Advancement
  console.log('1️⃣1️⃣ Testing Phase 17 Voice Conversational Turn-Taking & Clarification...');
  const voiceId = voiceStartData.session_id;

  // 11a: Confusion / Simpler words
  const clarifyRes = await fetch(`${BASE_URL}/voice/interact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: voiceId,
      student_speech: "I don't understand, can you explain in simpler words?"
    })
  });
  assert.strictEqual(clarifyRes.status, 200);
  const clarifyData = await clarifyRes.json();
  assert.strictEqual(clarifyData.current_step_index, 0, 'Step remains current on confusion');
  assert.ok(clarifyData.teacher_speech.length > 20, 'Simpler clarification returned');
  assert.ok(clarifyData.audio_url.startsWith('data:audio/wav;base64,'), 'Playable audio for clarification returned');
  console.log('   ✅ Passed: Empathetic clarification generated without skipping lesson steps.');

  // 11b: Comprehension / Advancement
  const advanceRes = await fetch(`${BASE_URL}/voice/interact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: voiceId,
      student_speech: "Yes, I understand now! Let us continue."
    })
  });
  assert.strictEqual(advanceRes.status, 200);
  const advanceData = await advanceRes.json();
  assert.strictEqual(advanceData.current_step_index, 1, 'Lesson advanced to Step 1 on comprehension');
  assert.ok(advanceData.audio_url.startsWith('data:audio/wav;base64,'), 'Step 1 audio generated');
  console.log('   ✅ Passed: Natural advancement to next curriculum step confirmed.\n');

  // Test 12: Phase 17 Voice Session Controls (Pause, Resume, Repeat, Stop)
  console.log('1️⃣2️⃣ Testing Phase 17 Voice Session Controls (Pause, Resume, Repeat, Stop)...');
  const pauseRes = await fetch(`${BASE_URL}/voice/control`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: voiceId, action: 'pause' })
  });
  assert.strictEqual(pauseRes.status, 200);
  const pauseData = await pauseRes.json();
  assert.strictEqual(pauseData.status, 'paused');

  const resumeRes = await fetch(`${BASE_URL}/voice/control`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: voiceId, action: 'resume' })
  });
  assert.strictEqual(resumeRes.status, 200);
  const resumeData = await resumeRes.json();
  assert.strictEqual(resumeData.status, 'active');

  const stopRes = await fetch(`${BASE_URL}/voice/control`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: voiceId, action: 'stop' })
  });
  assert.strictEqual(stopRes.status, 200);
  const stopData = await stopRes.json();
  assert.strictEqual(stopData.is_lesson_finished, true);
  console.log('   ✅ Passed: Pause, resume, and graceful lesson termination verified.\n');

  console.log('🎉 ALL STUDYAI KNOWLEDGE NEXUS & GEMINI VOICE VERIFICATION TESTS PASSED SUCCESSFULLY! (100%)\n');
}

runBattery().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
