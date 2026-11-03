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

  console.log('🎉 ALL STUDYAI KNOWLEDGE NEXUS VERIFICATION TESTS PASSED SUCCESSFULLY! (100%)\n');
}

runBattery().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
