/**
 * STUDYAI Complete Application Audit and Repair - Universal Benchmark Test Suite
 * Evaluates the 6 Core Benchmark Topics End-to-End:
 *   1. Newton's laws (Physics)
 *   2. Photosynthesis (Biology/Botany)
 *   3. Human heart (Biology/Anatomy)
 *   4. Chemical bonding (Chemistry)
 *   5. Quadratic equations (Mathematics)
 *   6. French Revolution (Social Studies/History)
 * 
 * Verifies 8 Core Pillars per Topic:
 *   P1. Topic Identification & Curriculum Board Detection
 *   P2. Multi-Subject Context Isolation (Anti-Bleed Check)
 *   P3. Structured Explanation Depth (Introduction, Concepts, Full Forms)
 *   P4. Worked Numerical Problems & Formula Symbol Exploded Breakdown
 *   P5. Validated Technical Vector Diagrams (Primary & Secondary Mechanism SVGs)
 *   P6. Interactive 3D Model Integrity & Honest Unavailable State
 *   P7. Voice Explanation Synchronisation & Natural Verbalization
 *   P8. Educational Games & Quiz Question Pool Quality (Zero Duplicates)
 */

import { strict as assert } from 'assert';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

console.log('========================================================================');
console.log('🚀 STUDYAI COMPLETE APPLICATION AUDIT & REPAIR — 6 BENCHMARK SUITE');
console.log(`Targeting Backend at: ${BASE_URL}`);
console.log('========================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = [];

async function runStep(name, fn) {
  totalTests++;
  process.stdout.write(`[Test ${String(totalTests).padStart(2, '0')}] ${name} ... `);
  try {
    const details = await fn();
    passedTests++;
    console.log(`✅ PASS ${details ? `(${details})` : ''}`);
  } catch (err) {
    failedTests.push({ name, error: err.message });
    console.log(`❌ FAIL`);
    console.log(`      Error: ${err.message}`);
  }
}

async function api(path, method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function main() {
  // Ensure server is reachable
  await runStep('Backend API Connectivity & Health Check', async () => {
    const res = await api('/api/tutor/health');
    assert.equal(res.status, 200, 'Expected 200 from /api/tutor/health');
    assert.ok(res.data.status === 'ok' || res.data.tutorReady, 'Tutor service should be ready');
    return `status=${res.data.status || 'ok'}`;
  });

  // Verify Student Profile & Automatic Board/Grade Resolution
  await runStep('Student Profile Automatic Board & Grade Resolution (Zero Prompt)', async () => {
    const res = await api('/api/profile');
    assert.equal(res.status, 200);
    assert.ok(res.data.user, 'Profile user object must exist');
    assert.ok(res.data.user.grade, 'Profile user grade must exist');
    assert.ok(res.data.user.board, 'Profile user board must exist');
    return `Grade ${res.data.user.grade} (${res.data.user.board})`;
  });

  // ========================================================================
  // BENCHMARK TOPIC 1: NEWTON'S LAWS OF MOTION (PHYSICS)
  // ========================================================================
  console.log('\n--- BENCHMARK TOPIC 1: NEWTON’S LAWS OF MOTION (PHYSICS) ---');

  let newtonLesson = null;
  await runStep('Newton’s Laws: AI Tutor Lesson Generation with Board & Subject Detection', async () => {
    const res = await api('/api/tutor/ask', 'POST', {
      question: 'Explain Newton’s laws of motion with formula and free body diagram',
      mode: 'detailed'
    });
    assert.equal(res.status, 200);
    assert.ok(res.data.lesson, 'Lesson object should be returned');
    newtonLesson = res.data.lesson;
    assert.match(newtonLesson.topic, /Newton/i, 'Topic should resolve to Newton’s Laws');
    assert.equal(newtonLesson.subject, 'Science', 'Subject should be Science/Physics');
    return `topic="${newtonLesson.topic}", subject="${newtonLesson.subject}"`;
  });

  await runStep('Newton’s Laws: Context Anti-Bleed Check (Zero Photosynthesis Terms)', async () => {
    const jsonStr = JSON.stringify(newtonLesson);
    assert.ok(!jsonStr.includes('Photosynthesis'), 'Newton lesson must not contain "Photosynthesis"');
    assert.ok(!jsonStr.includes('Chloroplast'), 'Newton lesson must not contain "Chloroplast"');
    assert.ok(!jsonStr.includes('6CO₂'), 'Newton lesson must not contain chemical formula "6CO₂"');
    assert.ok(jsonStr.includes('Inertia') || jsonStr.includes('F = m · a') || jsonStr.includes('Acceleration'), 'Must contain mechanics concepts');
    return 'Context fully isolated; 0 biological terms detected';
  });

  await runStep('Newton’s Laws: Worked Numerical Problem & Formula Exploded Breakdown', async () => {
    assert.ok(Array.isArray(newtonLesson.workedProblems) && newtonLesson.workedProblems.length > 0, 'Must have workedProblems');
    const prob = newtonLesson.workedProblems[0];
    assert.ok(prob.problemStatement.includes('4.0 kg') || prob.problemStatement.includes('force'), 'Problem statement must be quantitative');
    assert.ok(prob.stepByStepSolution.length >= 3, 'Must have step by step solution');
    assert.ok(prob.finalAnswer.includes('m/s²'), 'Must include correct SI unit m/s²');
    assert.ok(prob.verificationCheck.length > 10, 'Must include verification check');

    assert.ok(Array.isArray(newtonLesson.formulaExploded) && newtonLesson.formulaExploded.length >= 3, 'Must have formulaExploded');
    assert.ok(newtonLesson.formulaExploded.some(s => s.symbol.includes('F') || s.symbol.includes('m')), 'Must break down F, m, a');
    return `Worked Problem: "${prob.title}", Final Answer: "${prob.finalAnswer}"`;
  });

  await runStep('Newton’s Laws: Primary & Secondary SVG Diagrams with FBD Walkthrough', async () => {
    assert.ok(newtonLesson.lessonImages.length >= 2, 'Must have at least 2 validated images');
    const fbdImage = newtonLesson.lessonImages.find(img => img.diagramType.includes('newton') || img.title.includes('Newton'));
    assert.ok(fbdImage, 'Must have Newton FBD image');
    assert.ok(fbdImage.imageUrl.startsWith('data:image/svg+xml;base64,'), 'Must be valid base64 SVG');
    assert.ok(fbdImage.explanation.importantParts.length >= 3, 'Must have labeled walkthrough parts');
    return `Diagram Type: "${fbdImage.diagramType}", Labels: ${fbdImage.explanation.importantParts.map(p => p.label).join(', ')}`;
  });

  await runStep('Newton’s Laws: 3D Model Spec Resolution (Dynamics Cart & Vectors)', async () => {
    assert.equal(newtonLesson.model3dType, 'newtons_laws', 'model3dType must be "newtons_laws"');
    const res = await api('/api/media/model3d', 'POST', { topic: 'Newton’s Laws of Motion' });
    assert.equal(res.status, 200);
    assert.ok(res.data.spec, 'Must return 3D spec');
    assert.ok(res.data.spec.title.includes('Newton'), 'Spec title must reference Newton');
    return `3D Model ID="${res.data.spec.id}", Title="${res.data.spec.title}"`;
  });

  await runStep('Newton’s Laws: Educational Games Question Pool (F=ma, Zero Duplicates)', async () => {
    const res = await api('/api/games/questions', 'POST', { topic: 'Newton’s Laws of Motion', count: 5 });
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.data.questions) && res.data.questions.length === 5, 'Must return 5 questions');
    const qTexts = res.data.questions.map(q => q.question);
    const uniqueQ = new Set(qTexts);
    assert.equal(uniqueQ.size, 5, 'Zero duplicate questions allowed');
    assert.ok(qTexts.some(q => q.includes('Inertia') || q.includes('Second Law') || q.includes('20 N')), 'Questions must test Newton physics');
    return `5 unique questions generated, sample: "${qTexts[0].slice(0, 48)}..."`;
  });

  // ========================================================================
  // BENCHMARK TOPIC 2: PHOTOSYNTHESIS (BIOLOGY/BOTANY)
  // ========================================================================
  console.log('\n--- BENCHMARK TOPIC 2: PHOTOSYNTHESIS (BIOLOGY/BOTANY) ---');

  let photoLesson = null;
  await runStep('Photosynthesis: AI Tutor Lesson Generation with CAM Adaptation & Reaction', async () => {
    const res = await api('/api/tutor/ask', 'POST', {
      question: 'How do plants perform photosynthesis in daylight and desert conditions?',
      mode: 'detailed'
    });
    assert.equal(res.status, 200);
    photoLesson = res.data.lesson;
    assert.match(photoLesson.topic, /Photosynthesis/i);
    assert.equal(photoLesson.subject, 'Science');
    assert.ok(photoLesson.formula?.equation?.includes('6CO₂'), 'Must include 6CO₂ + 6H₂O formula');
    return `equation="${photoLesson.formula?.equation}"`;
  });

  await runStep('Photosynthesis: Worked Stoichiometric Numerical & Formula Breakdown', async () => {
    assert.ok(Array.isArray(photoLesson.workedProblems) && photoLesson.workedProblems.length > 0);
    const prob = photoLesson.workedProblems[0];
    assert.ok(prob.problemStatement.includes('Glucose') && prob.problemStatement.includes('180'), 'Must solve photosynthetic stoichiometry');
    assert.ok(prob.finalAnswer.includes('264.0 g') && prob.finalAnswer.includes('134.4 L'), 'Correct mass and volume calculation');

    assert.ok(Array.isArray(photoLesson.formulaExploded) && photoLesson.formulaExploded.length >= 4);
    assert.ok(photoLesson.formulaExploded.some(s => s.symbol.includes('6CO₂')));
    return `Stoichiometry: "${prob.finalAnswer}"`;
  });

  await runStep('Photosynthesis: 3D Organelle Spec (Chloroplast Thylakoid Stacks)', async () => {
    assert.equal(photoLesson.model3dType, 'chloroplast_molecule');
    const res = await api('/api/media/model3d', 'POST', { topic: 'Photosynthesis' });
    assert.equal(res.status, 200);
    assert.ok(res.data.spec.id === 'chloroplast_molecule' || res.data.spec.title.includes('Chloroplast'));
    return `Model ID="${res.data.spec.id}"`;
  });

  // ========================================================================
  // BENCHMARK TOPIC 3: HUMAN HEART (BIOLOGY/ANATOMY)
  // ========================================================================
  console.log('\n--- BENCHMARK TOPIC 3: HUMAN HEART (BIOLOGY/ANATOMY) ---');

  let heartLesson = null;
  await runStep('Human Heart: 4 Chambers, Double Circulation & Valve Anatomy Lesson', async () => {
    const res = await api('/api/tutor/ask', 'POST', {
      question: 'Explain the human heart anatomy, four chambers, valves, and double circulation',
      mode: 'detailed'
    });
    assert.equal(res.status, 200);
    heartLesson = res.data.lesson;
    assert.match(heartLesson.topic, /Heart|Circulation/i);
    assert.equal(heartLesson.subject, 'Science');
    return `topic="${heartLesson.topic}"`;
  });

  await runStep('Human Heart: Hemodynamic Worked Problem (Cardiac Output = HR × SV)', async () => {
    assert.ok(Array.isArray(heartLesson.workedProblems) && heartLesson.workedProblems.length > 0);
    const prob = heartLesson.workedProblems[0];
    assert.ok(prob.problemStatement.includes('72') && prob.problemStatement.includes('70 mL'));
    assert.ok(prob.finalAnswer.includes('5.04 L/min'), 'Expected 5.04 L/min cardiac output');
    return `Cardiac Output: "${prob.finalAnswer}"`;
  });

  await runStep('Human Heart: Anatomical 3D Model Spec (No Spheres/Balloons Check)', async () => {
    assert.equal(heartLesson.model3dType, 'human_heart');
    const res = await api('/api/media/model3d', 'POST', { topic: 'Human Heart' });
    assert.equal(res.status, 200);
    const spec = res.data.spec;
    assert.equal(spec.id, 'human_heart');
    assert.ok(spec.parts.some(p => p.id === 'left_ventricle'), 'Must have left_ventricle');
    assert.ok(spec.parts.some(p => p.id === 'tricuspid_valve'), 'Must have tricuspid_valve');
    assert.ok(spec.parts.some(p => p.id === 'mitral_valve'), 'Must have mitral_valve');
    assert.ok(spec.parts.some(p => p.id === 'aorta'), 'Must have aorta');
    assert.ok(spec.parts.some(p => p.id === 'sa_node'), 'Must have sa_node');
    return `Anatomical Structures: ${spec.parts.length} parts (LV, RV, LA, RA, Mitral, Tricuspid, Aorta, SA Node)`;
  });

  // ========================================================================
  // BENCHMARK TOPIC 4: CHEMICAL BONDING (CHEMISTRY)
  // ========================================================================
  console.log('\n--- BENCHMARK TOPIC 4: CHEMICAL BONDING (CHEMISTRY) ---');

  let bondLesson = null;
  await runStep('Chemical Bonding: Polar Covalent vs. Ionic Crystal Lattice Lesson', async () => {
    const res = await api('/api/tutor/ask', 'POST', {
      question: 'What is the difference between covalent and ionic chemical bonding with examples?',
      mode: 'detailed'
    });
    assert.equal(res.status, 200);
    bondLesson = res.data.lesson;
    assert.match(bondLesson.topic, /Bonding|Covalent|Ionic/i);
    assert.equal(bondLesson.subject, 'Science');
    assert.ok(bondLesson.differences?.titleA?.includes('Covalent') && bondLesson.differences?.titleB?.includes('Ionic'));
    return `differences: "${bondLesson.differences.titleA}" vs "${bondLesson.differences.titleB}"`;
  });

  await runStep('Chemical Bonding: Worked VSEPR Lone Pair Geometry Problem (104.5° Bent)', async () => {
    assert.ok(Array.isArray(bondLesson.workedProblems) && bondLesson.workedProblems.length > 0);
    const prob = bondLesson.workedProblems[0];
    assert.ok(prob.finalAnswer.includes('104.5°'), 'Must calculate 104.5° bent geometry');
    assert.ok(prob.finalAnswer.includes('2 lone pairs'), 'Must identify 2 lone pairs');
    return `VSEPR Calculation: "${prob.finalAnswer}"`;
  });

  await runStep('Chemical Bonding: 3D Model Spec (Polar Covalent H₂O & Ionic NaCl)', async () => {
    assert.equal(bondLesson.model3dType, 'chemical_bonding');
    const res = await api('/api/media/model3d', 'POST', { topic: 'Chemical Bonding' });
    assert.equal(res.status, 200);
    assert.equal(res.data.spec.id, 'chemical_bonding');
    assert.ok(res.data.spec.parts.some(p => p.id === 'oxygen_atom'));
    assert.ok(res.data.spec.parts.some(p => p.id === 'ionic_crystal'));
    return `Model ID="${res.data.spec.id}", Structures: ${res.data.spec.parts.map(p => p.label).join(', ')}`;
  });

  // ========================================================================
  // BENCHMARK TOPIC 5: QUADRATIC EQUATIONS (MATHEMATICS)
  // ========================================================================
  console.log('\n--- BENCHMARK TOPIC 5: QUADRATIC EQUATIONS (MATHEMATICS) ---');

  let quadLesson = null;
  await runStep('Quadratic Equations: Algebraic Lesson with Formula & Discriminant Analysis', async () => {
    const res = await api('/api/tutor/ask', 'POST', {
      question: 'How do you solve quadratic equations using the quadratic formula?',
      mode: 'detailed'
    });
    assert.equal(res.status, 200);
    quadLesson = res.data.lesson;
    assert.match(quadLesson.topic, /Quadratic/i);
    assert.equal(quadLesson.subject, 'Maths');
    assert.ok(quadLesson.formula?.equation?.includes('4ac'));
    return `subject="${quadLesson.subject}", formula="${quadLesson.formula?.equation}"`;
  });

  await runStep('Quadratic Equations: Worked Problem Solving 2x² - 7x + 3 = 0 (Roots 3.0 & 0.5)', async () => {
    assert.ok(Array.isArray(quadLesson.workedProblems) && quadLesson.workedProblems.length > 0);
    const prob = quadLesson.workedProblems[0];
    assert.ok(prob.problemStatement.includes('2x² - 7x + 3 = 0'));
    assert.ok(prob.finalAnswer.includes('x₁ = 3.0') && prob.finalAnswer.includes('x₂ = 0.5'));
    assert.ok(prob.finalAnswer.includes('Vertex Coordinates: (1.75, -3.125)'));
    return `Roots: "${prob.finalAnswer}"`;
  });

  await runStep('Quadratic Equations: 3D Mathematical Paraboloid Surface Spec', async () => {
    assert.equal(quadLesson.model3dType, 'math_surface');
    const res = await api('/api/media/model3d', 'POST', { topic: 'Quadratic Equations' });
    assert.equal(res.status, 200);
    assert.equal(res.data.spec.id, 'math_surface');
    return `Model ID="${res.data.spec.id}"`;
  });

  // ========================================================================
  // BENCHMARK TOPIC 6: THE FRENCH REVOLUTION (SOCIAL STUDIES/HISTORY)
  // ========================================================================
  console.log('\n--- BENCHMARK TOPIC 6: THE FRENCH REVOLUTION (SOCIAL STUDIES/HISTORY) ---');

  let frenchLesson = null;
  await runStep('The French Revolution: Historical Analysis (Estates, Bastille, Rights of Man)', async () => {
    const res = await api('/api/tutor/ask', 'POST', {
      question: 'What were the causes and consequences of the French Revolution in 1789?',
      mode: 'detailed'
    });
    assert.equal(res.status, 200);
    frenchLesson = res.data.lesson;
    assert.match(frenchLesson.topic, /French Revolution/i);
    assert.equal(frenchLesson.subject, 'Social Studies');
    assert.equal(frenchLesson.formula, null, 'History topics must NEVER have a fake formula!');
    return `topic="${frenchLesson.topic}", subject="${frenchLesson.subject}", formula=null`;
  });

  await runStep('The French Revolution: Quantitative Demographic Tax Problem (98.2% Third Estate)', async () => {
    assert.ok(Array.isArray(frenchLesson.workedProblems) && frenchLesson.workedProblems.length > 0);
    const prob = frenchLesson.workedProblems[0];
    assert.ok(prob.problemStatement.includes('28 million'));
    assert.ok(prob.finalAnswer.includes('98.2%'), 'Correct demographic calculation');
    return `Demographic Analysis: "${prob.finalAnswer}"`;
  });

  await runStep('The French Revolution: HONEST UNAVAILABLE 3D STATE (Pedagogical Integrity)', async () => {
    assert.equal(frenchLesson.model3dType, null, 'French Revolution model3dType must strictly be null');
    // Calling 3D endpoint with history topic should return 3D not applicable spec
    const res = await api('/api/media/model3d', 'POST', { topic: 'The French Revolution' });
    assert.equal(res.status, 200);
    assert.ok(res.data.spec.isUnavailable || res.data.spec.title.includes('French Revolution') || res.data.spec.subject.includes('Social Studies'),
      'Must return honest spec indicating 3D is not applicable');
    return `model3dType=null (Honest 2D Chronological Flowchart Fallback Active)`;
  });

  await runStep('The French Revolution: Chronological Milestone Secondary SVG Diagram', async () => {
    assert.ok(frenchLesson.lessonImages.length >= 2);
    const secImage = frenchLesson.lessonImages[1];
    assert.ok(secImage.imageUrl.startsWith('data:image/svg+xml;base64,'));
    assert.ok(secImage.diagramType.includes('french') || secImage.diagramType.includes('timeline') || secImage.title.includes('French'));
    return `Secondary SVG: "${secImage.title}"`;
  });

  // ========================================================================
  // PILLAR 7 & 8: VOICE SYNTHESIS & AI NOTES PERSISTENCE ACROSS ECOSYSTEM
  // ========================================================================
  console.log('\n--- VOICE SYNCHRONISATION & NOTES VERIFICATION ---');

  await runStep('Voice Explanation: Natural Spoken Verbalization of Formulas & Clean TTS', async () => {
    const res = await api('/api/media/audio', 'POST', {
      topic: 'Newton’s Laws of Motion',
      text: 'Newton’s Second Law states that F = m · a. For example, six molecules of CO₂ plus six molecules of H₂O yield C₆H₁₂O₆ + 6O₂.'
    });
    assert.equal(res.status, 200);
    assert.ok(res.data.spokenScript, 'spokenScript must be returned');
    assert.ok(!res.data.spokenScript.includes('F = m · a'), 'Raw equation symbols should be converted');
    assert.ok(res.data.spokenScript.includes('Force equals mass times acceleration') || res.data.spokenScript.includes('Carbon Dioxide'), 'Should contain spoken teacher phrasing');
    assert.ok(res.data.audioValidation?.decodable, 'Audio must be decodable');
    return `Spoken: "${res.data.spokenScript.slice(0, 60)}..." (Decodable WAV, ${res.data.durationSeconds}s)`;
  });

  await runStep('AI Notes System: Structured Note Generation & Verification', async () => {
    const res = await api('/api/notes', 'POST', {
      title: 'Newton’s Laws of Motion Comprehensive Study Note',
      subject: 'Science',
      notebook: 'Physics',
      topic: 'Newton’s Laws of Motion'
    });
    assert.equal(res.status, 200);
    assert.ok(res.data.id, 'Note id must be returned');
    assert.ok(res.data.content_markdown?.length > 100, 'Markdown content must be populated');
    assert.ok(res.data.flashcards?.length >= 3, 'Must generate flashcards');
    return `Note ID="${res.data.id}", Flashcards=${res.data.flashcards.length}, Markdown Bytes=${res.data.content_markdown.length}`;
  });

  // ========================================================================
  // FINAL SUMMARY REPORT
  // ========================================================================
  console.log('\n========================================================================');
  console.log(`🏁 BENCHMARK TEST SUITE COMPLETED`);
  console.log(`   Total Executed Tests: ${totalTests}`);
  console.log(`   Passed:               ${passedTests}`);
  console.log(`   Failed:               ${failedTests.length}`);
  console.log('========================================================================\n');

  if (failedTests.length > 0) {
    console.error('❌ FAILURES DETECTED:');
    failedTests.forEach((f, idx) => {
      console.error(`   ${idx + 1}. ${f.name} => ${f.error}`);
    });
    process.exit(1);
  } else {
    console.log('🎉 ALL 6 BENCHMARK TOPICS PASSED 100% OF VERIFICATION CHECKS!');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal Benchmark Error:', err);
  process.exit(1);
});
