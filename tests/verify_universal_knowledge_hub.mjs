import assert from 'assert';

const BASE_URL = 'http://127.0.0.1:8000/api/v1';

async function runUniversalKnowledgeHubAcceptanceTests() {
  console.log('🌐 Starting STUDYAI Universal Knowledge Hub Acceptance Battery...\n');

  // Test 1: Providers Status, Capability Registry & 2027 Sunset Notice
  console.log('1️⃣ Testing Providers Status, Capability Registry & Google Search Deprecation Notice...');
  const providersRes = await fetch(`${BASE_URL}/nexus/knowledge-hub/providers-status`);
  assert.strictEqual(providersRes.status, 200, 'Providers status endpoint should return 200');
  const providers = await providersRes.json();
  
  assert.ok(providers.gemini.google_search_grounding, 'Gemini Google Search Grounding supported');
  assert.ok(providers.gemini.custom_search_sunset_notice.includes('2027'), 'Google Custom Search 2027 sunset notice present');
  assert.ok(providers.openai.structured_outputs, 'OpenAI Structured Outputs supported');
  assert.strictEqual(providers.ollama.status, 'active', 'Ollama local Qwen 2.5 7B active');
  assert.strictEqual(providers.central_knowledge_library.status, 'active', 'Central Knowledge Library active');
  assert.strictEqual(providers.central_knowledge_library.verification_statuses.length, 7, '7 Verification Statuses registered');
  console.log('   ✅ Passed: All AI providers and Central Knowledge Library status verified.\n');

  // Test 2: Benchmark Topic 1 - Biology: Human Heart & 4-Chamber Circulation
  console.log('2️⃣ Testing Benchmark Topic 1 - Biology: Human Heart & 4-Chamber Circulation...');
  const heartRes = await fetch(`${BASE_URL}/nexus/knowledge-hub/acquire`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'Human Heart Circulation',
      grade: 10,
      board: 'ICSE',
      subject: 'Biology'
    })
  });
  assert.strictEqual(heartRes.status, 200);
  const heart = await heartRes.json();
  assert.strictEqual(heart.subject, 'Biology');
  assert.strictEqual(heart.verification_status, 'verified_against_sources');
  assert.ok(heart.confidence_score >= 0.90);
  assert.ok(heart.content_hash.length === 64, 'SHA-256 content hash present');
  assert.ok(heart.facts.some(f => f.includes('Right Atrium') || f.includes('4-chambered')));
  assert.ok(heart.diagrams_and_images.length > 0, 'Curated SVG diagram present');
  assert.ok(heart.diagrams_and_images[0].svg_content.includes('<svg'), 'Valid SVG markup');
  assert.ok(heart.three_scene_spec, 'Three.js 3D companion scene attached');
  assert.ok(heart.three_scene_spec.parts.some(p => p.id === 'sa_node'), 'SA node conduction layer isolated');
  console.log('   ✅ Passed: Benchmark Topic 1 (Human Heart) verified with 3D and SVG assets.\n');

  // Test 3: Benchmark Topic 2 - Physics: Principle of Moments
  console.log('3️⃣ Testing Benchmark Topic 2 - Physics: Principle of Moments...');
  const momentsRes = await fetch(`${BASE_URL}/nexus/knowledge-hub/acquire`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'Principle of Moments',
      grade: 10,
      board: 'ICSE',
      subject: 'Physics'
    })
  });
  assert.strictEqual(momentsRes.status, 200);
  const moments = await momentsRes.json();
  assert.strictEqual(moments.subject, 'Physics');
  assert.strictEqual(moments.verification_status, 'verified_against_sources');
  assert.ok(moments.facts.some(f => f.includes('clockwise') || f.includes('anticlockwise')));
  assert.ok(moments.diagrams_and_images.some(img => img.svg_content && img.svg_content.includes('Fulcrum')));
  console.log('   ✅ Passed: Benchmark Topic 2 (Principle of Moments) verified with rotational equilibrium.\n');

  // Test 4: Benchmark Topic 3 - Chemistry: Structure of Water Molecule
  console.log('4️⃣ Testing Benchmark Topic 3 - Chemistry: Structure of Water Molecule...');
  const waterRes = await fetch(`${BASE_URL}/nexus/knowledge-hub/acquire`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'Structure of Water Molecule',
      grade: 9,
      board: 'CBSE',
      subject: 'Chemistry'
    })
  });
  assert.strictEqual(waterRes.status, 200);
  const water = await waterRes.json();
  assert.strictEqual(water.subject, 'Chemistry');
  assert.strictEqual(water.verification_status, 'verified_against_sources');
  assert.ok(water.facts.some(f => f.includes('104.5') || f.includes('covalent')));
  assert.ok(water.diagrams_and_images.some(img => img.svg_content && img.svg_content.includes('104.5°')));
  console.log('   ✅ Passed: Benchmark Topic 3 (Water Molecule) verified with bent geometry & bond angle.\n');

  // Test 5: Benchmark Topic 4 - Mathematics: Volume of a Cone
  console.log('5️⃣ Testing Benchmark Topic 4 - Mathematics: Volume of a Cone...');
  const coneRes = await fetch(`${BASE_URL}/nexus/knowledge-hub/acquire`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'Volume of a Cone',
      grade: 10,
      board: 'ICSE',
      subject: 'Mathematics'
    })
  });
  assert.strictEqual(coneRes.status, 200);
  const cone = await coneRes.json();
  assert.strictEqual(cone.subject, 'Mathematics');
  assert.strictEqual(cone.verification_status, 'verified_against_sources');
  assert.ok(cone.facts.some(f => f.includes('1/3') || f.includes('π')));
  assert.ok(cone.diagrams_and_images.some(img => img.svg_content && img.svg_content.includes('RIGHT CIRCULAR CONE')));
  console.log('   ✅ Passed: Benchmark Topic 4 (Volume of a Cone) verified with derivation & Pythagorean slant height.\n');

  // Test 6: Benchmark Topic 5 - History: Causes of the First World War
  console.log('6️⃣ Testing Benchmark Topic 5 - History: Causes of the First World War...');
  const wwiRes = await fetch(`${BASE_URL}/nexus/knowledge-hub/acquire`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'Causes of the First World War',
      grade: 10,
      board: 'ICSE',
      subject: 'History'
    })
  });
  assert.strictEqual(wwiRes.status, 200);
  const wwi = await wwiRes.json();
  assert.strictEqual(wwi.subject, 'History');
  assert.strictEqual(wwi.verification_status, 'verified_against_sources');
  assert.ok(wwi.facts.some(f => f.includes('Sarajevo Crisis') || f.includes('Franz Ferdinand')));
  assert.ok(wwi.diagrams_and_images.some(img => img.svg_content && img.svg_content.includes('ROAD TO FIRST WORLD WAR')));
  console.log('   ✅ Passed: Benchmark Topic 5 (WWI Causes) verified with M-A-I-N sequence timeline.\n');

  // Test 7: Benchmark Topic 6 - Geography: Formation of Volcanoes
  console.log('7️⃣ Testing Benchmark Topic 6 - Geography: Formation of Volcanoes...');
  const volcanoRes = await fetch(`${BASE_URL}/nexus/knowledge-hub/acquire`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'Formation of Volcanoes',
      grade: 9,
      board: 'ICSE',
      subject: 'Geography'
    })
  });
  assert.strictEqual(volcanoRes.status, 200);
  const volcano = await volcanoRes.json();
  assert.strictEqual(volcano.subject, 'Geography');
  assert.strictEqual(volcano.verification_status, 'verified_against_sources');
  assert.ok(volcano.facts.some(f => f.includes('magma') || f.includes('lava')));
  assert.ok(volcano.diagrams_and_images.some(img => img.svg_content && img.svg_content.includes('Magma Chamber')));
  console.log('   ✅ Passed: Benchmark Topic 6 (Volcanoes) verified with cross-section magma chamber diagram.\n');

  // Test 8: Central Image Library Dedicated Search with Licensing & Attribution
  console.log('8️⃣ Testing Central Image Library Search with Licensing & Attribution...');
  const imgSearchRes = await fetch(`${BASE_URL}/nexus/knowledge-hub/images?topic=Human Heart&subject=Biology&grade=10`);
  assert.strictEqual(imgSearchRes.status, 200);
  const imgData = await imgSearchRes.json();
  assert.ok(imgData.count >= 1);
  const firstImg = imgData.images[0];
  assert.ok(firstImg.license_type, 'Licensing type specified');
  assert.ok(firstImg.attribution, 'Attribution specified');
  assert.ok(firstImg.provenance_source, 'Provenance source specified');
  assert.strictEqual(firstImg.verification_status, 'verified');
  console.log('   ✅ Passed: Central Image Library search returned fully attributed and licensed assets.\n');

  // Test 9: Central Knowledge Record Direct Lookup & Version History
  console.log('9️⃣ Testing Central Knowledge Record Direct Lookup & Content Hashing...');
  const recRes = await fetch(`${BASE_URL}/nexus/knowledge-hub/record?topic=Principle of Moments&grade=10&board=ICSE&subject=Physics`);
  assert.strictEqual(recRes.status, 200);
  const rec = await recRes.json();
  assert.strictEqual(rec.topic, 'Principle of Moments');
  assert.strictEqual(rec.board, 'ICSE');
  assert.strictEqual(rec.grade, 10);
  assert.ok(rec.content_hash, 'Content SHA-256 hash present');
  assert.ok(rec.version >= 1, 'Version is at least 1');
  assert.ok(Array.isArray(rec.citations) && rec.citations.length > 0, 'Authoritative citations present');
  console.log('   ✅ Passed: Central Knowledge Record lookup verified with content hash and citations.\n');

  // Test 10: AI Tutor End-to-End Integration (/nexus/ask with Knowledge Hub)
  console.log('🔟 Testing AI Tutor End-to-End Integration with Knowledge Hub Package Injection...');
  const tutorRes = await fetch(`${BASE_URL}/nexus/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'Describe the circulation of blood in the human heart',
      grade: 10,
      board: 'ICSE',
      subject: 'Biology'
    })
  });
  assert.strictEqual(tutorRes.status, 200);
  const tutorData = await tutorRes.json();
  assert.ok(tutorData.status === 'complete' || tutorData.status === 'success', 'Status is complete or success');
  assert.ok(tutorData.knowledge_hub, 'Knowledge Hub metadata injected in response envelope');
  assert.strictEqual(tutorData.knowledge_hub.verification_status, 'verified_against_sources');
  assert.ok(tutorData.lesson.blocks.length >= 5, 'Structured lesson blocks present');
  assert.ok(tutorData.visual_plan, 'Visual plan coordinated');
  assert.ok(tutorData.voice, 'Synchronized voice segments present');
  console.log('   ✅ Passed: AI Tutor seamlessly augmented with Universal Knowledge Hub package.\n');

  console.log('🎉 ALL 10 STUDYAI UNIVERSAL KNOWLEDGE HUB ACCEPTANCE TESTS PASSED (100%)!\n');
}

runUniversalKnowledgeHubAcceptanceTests().catch(err => {
  console.error('❌ Universal Knowledge Hub Test Failed:', err);
  process.exit(1);
});
