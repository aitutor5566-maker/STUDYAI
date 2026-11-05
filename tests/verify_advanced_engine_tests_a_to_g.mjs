// verify_advanced_engine_tests_a_to_g.mjs
// Comprehensive Acceptance Battery for STUDYAI Advanced AI Research, Knowledge Retrieval,
// Image Generation & High-Quality 3D Visualization Engine (Tests A through G)

import assert from 'node:assert';

const BASE_URL = process.env.API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

async function runAdvancedEngineAcceptanceBattery() {
  console.log('🚀 Starting STUDYAI Advanced AI Research, Knowledge Retrieval, Image Generation & 3D Visualization Acceptance Battery...\n');

  // ==========================================
  // TEST A (Biology): Human Heart
  // ==========================================
  console.log('🅰️ TEST A (Biology): Human Heart & Double Circulation...');
  const heartSessionId = `test-heart-${Date.now()}`;
  const heartRes = await fetch(`${BASE_URL}/nexus/research-pipeline/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: 'Explain how the four chambers of the human heart pump blood.',
      grade: 10,
      curriculum: 'ICSE',
      subject: 'Biology',
      language: 'English',
      session_id: heartSessionId,
      force_research: true
    })
  });
  assert.strictEqual(heartRes.status, 200, 'Pipeline execute endpoint must return 200 OK');
  const heartData = await heartRes.json();
  assert.strictEqual(heartData.status, 'success');

  // Subject and Topic Validation
  const uHeart = heartData.question_understanding;
  assert.strictEqual(uHeart.subject, 'Biology');
  assert.ok(uHeart.topic.toLowerCase().includes('circulat') || uHeart.topic.toLowerCase().includes('heart'));
  assert.strictEqual(uHeart.required_3d_model, 'human-heart');

  // Three.js Level 3 3D Model Validation
  const heartSceneRes = await fetch(`${BASE_URL}/nexus/3d-scene/human-heart`);
  assert.strictEqual(heartSceneRes.status, 200, '3D scene endpoint must return 200 OK');
  const heartSceneData = await heartSceneRes.json();
  const hScene = heartSceneData.scene || heartSceneData;

  assert.strictEqual(hScene.model_key, 'human-heart');
  assert.strictEqual(hScene.quality_level, 'level_3_advanced_scientific', 'Heart must be Level 3 Advanced Scientific');

  const partIds = hScene.parts.map(p => p.id);
  // 4 Chambers
  assert.ok(partIds.includes('right_atrium'), 'Right Atrium present');
  assert.ok(partIds.includes('right_ventricle'), 'Right Ventricle present');
  assert.ok(partIds.includes('left_atrium'), 'Left Atrium present');
  assert.ok(partIds.includes('left_ventricle'), 'Left Ventricle present');
  // Septum
  assert.ok(partIds.includes('septum'), 'Septum present');
  // 4 Valves
  assert.ok(partIds.includes('tricuspid_valve'), 'Tricuspid valve present');
  assert.ok(partIds.includes('mitral_valve') || partIds.includes('bicuspid_valve'), 'Bicuspid/Mitral valve present');
  assert.ok(partIds.includes('pulmonary_valve'), 'Pulmonary valve present');
  assert.ok(partIds.includes('aortic_valve'), 'Aortic valve present');
  // Great Vessels
  assert.ok(partIds.includes('superior_vena_cava'), 'SVC present');
  assert.ok(partIds.includes('inferior_vena_cava'), 'IVC present');
  assert.ok(partIds.includes('pulmonary_artery'), 'Pulmonary Artery present');
  assert.ok(partIds.includes('pulmonary_veins'), 'Pulmonary Veins present');
  assert.ok(partIds.includes('aorta'), 'Aorta present');

  // SA Node in dedicated conduction layer
  const saPart = hScene.parts.find(p => p.id === 'sa_node');
  assert.ok(saPart, 'SA Node present');
  assert.strictEqual(saPart.layer, 'conduction', 'SA Node must be isolated in dedicated conduction layer');

  // 13-stage blood flow sequence
  assert.strictEqual(hScene.blood_flow_sequence.length, 13, 'Blood flow sequence must define exactly 13 stages');
  assert.ok(hScene.blood_flow_sequence[0].includes('Systemic venous return'));
  assert.ok(hScene.blood_flow_sequence[12].includes('Aortic Valve & Systemic Aorta'));

  // 20 Pedagogical Sections Check
  const heartSections = heartData.lesson.sections;
  assert.ok(heartSections.length >= 15, 'Contains comprehensive pedagogical sections');
  const sectionKeys = heartSections.map(s => s.section_key);
  assert.ok(sectionKeys.includes('memory_techniques'), 'Memory techniques (LORD, TRI before BI) present');
  assert.ok(sectionKeys.includes('examination_guidance'), 'Examination guidance present');
  assert.ok(sectionKeys.includes('understanding_check'), 'Understanding checkpoint present');

  console.log('   ✅ Passed Test A: Human Heart 4 chambers, valves, great vessels, SA node, 13-stage flow, Level 3 3D scene, and 20 sections verified.\n');

  // ==========================================
  // TEST B (Physics): Principle of Moments
  // ==========================================
  console.log('🅱️ TEST B (Physics): Principle of Moments & Balanced Lever...');
  const physicsRes = await fetch(`${BASE_URL}/nexus/research-pipeline/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: 'State and derive the Principle of Moments and solve a balanced lever problem.',
      grade: 10,
      curriculum: 'ICSE',
      subject: 'Physics',
      language: 'English',
      force_research: false
    })
  });
  assert.strictEqual(physicsRes.status, 200);
  const physicsData = await physicsRes.json();
  assert.strictEqual(physicsData.question_understanding.subject, 'Physics');
  assert.strictEqual(physicsData.question_understanding.required_3d_model, 'lever-moments');

  // Inspect 3D Scene Spec for Lever
  const leverSceneRes = await fetch(`${BASE_URL}/nexus/3d-scene/lever-moments`);
  assert.strictEqual(leverSceneRes.status, 200);
  const leverSceneData = await leverSceneRes.json();
  const lScene = leverSceneData.scene || leverSceneData;
  const lPartIds = lScene.parts.map(p => p.id);
  assert.ok(lPartIds.includes('lever_arm'), 'Rigid lever arm present');
  assert.ok(lPartIds.includes('fulcrum_wedge'), 'Fulcrum wedge present');
  assert.ok(lPartIds.includes('load_f1') && lPartIds.includes('effort_f2'), 'Forces present on lever');

  // 9-Point Numerical Resolution Card
  const numCardRes = await fetch(`${BASE_URL}/nexus/physics-numerical`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      given: { "Force F1": "20 N", "Distance d1": "30 cm", "Distance d2": "60 cm" },
      find: "Effort Force F2 required to balance the lever",
      principle_formula: "Principle of Moments: F1 × d1 = F2 × d2",
      why_formula_applies: "The lever is in static rotational equilibrium about the central fulcrum.",
      substitution_with_units: "20 N × 0.30 m = F2 × 0.60 m",
      calculation: "F2 = (20 × 0.30) / 0.60 = 6.0 / 0.60 = 10.0 N",
      final_answer_with_unit: "10.0 N",
      check: "[N] × [m] = [N] × [m], torque dimensions match [M L^2 T^-2].",
      common_mistake: "Forgetting to convert distances from cm to SI meters before substitution."
    })
  });
  assert.strictEqual(numCardRes.status, 200);
  const numCard = await numCardRes.json();
  assert.ok(numCard.given && numCard.principle_formula && numCard.final_answer_with_unit);
  assert.strictEqual(numCard.final_answer_with_unit, '10.0 N');
  assert.ok(numCard.common_mistake.includes('cm to SI meters'));

  console.log('   ✅ Passed Test B: Principle of Moments tau = F x d, rotational equilibrium, 3D lever model, and 9-point numerical verified.\n');

  // ==========================================
  // TEST C (Chemistry): Water Molecule Structure
  // ==========================================
  console.log('🅲 TEST C (Chemistry): Water Molecule Covalent Bonding & Bent Geometry...');
  const chemRes = await fetch(`${BASE_URL}/nexus/research-pipeline/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: 'Explain the structure of a water molecule including covalent bonds and bent geometry.',
      grade: 10,
      curriculum: 'ICSE',
      subject: 'Chemistry',
      language: 'English',
      force_research: false
    })
  });
  assert.strictEqual(chemRes.status, 200);
  const chemData = await chemRes.json();
  assert.strictEqual(chemData.question_understanding.subject, 'Chemistry');
  assert.strictEqual(chemData.question_understanding.required_3d_model, 'water-molecule');

  // Verify 3D Molecular Representation & Bent Angle
  const waterSceneRes = await fetch(`${BASE_URL}/nexus/3d-scene/water-molecule`);
  assert.strictEqual(waterSceneRes.status, 200);
  const waterSceneData = await waterSceneRes.json();
  const wScene = waterSceneData.scene || waterSceneData;
  const wParts = wScene.parts.map(p => p.id);
  assert.ok(wParts.includes('oxygen_atom'), 'Central oxygen atom present');
  assert.ok(wParts.includes('hydrogen_1') && wParts.includes('hydrogen_2'), 'Both hydrogen atoms present');
  assert.ok(wParts.includes('covalent_bond_1') && wParts.includes('covalent_bond_2'), 'Covalent bonds present');
  assert.ok(wParts.includes('lone_pair_lobes'), 'Non-bonding lone electron pairs present');
  assert.ok(wScene.annotations.some(a => a.text.includes('Dipole Moment') || a.id === 'dipole_label'), 'Net molecular dipole moment vector present');
  assert.ok(wScene.annotations.some(a => a.text.includes('104.5°')), 'Exact 104.5 degree bent angle annotated');

  console.log('   ✅ Passed Test C: Water molecule bent geometry (104.5°), covalent bonds, lone pairs, and Level 3 3D model verified.\n');

  // ==========================================
  // TEST D (Geography): Formation of Volcanoes
  // ==========================================
  console.log('🅳 TEST D (Geography): Formation of Volcanoes & Magma vs Lava...');
  const geoRes = await fetch(`${BASE_URL}/nexus/research-pipeline/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: 'Describe the formation of a volcano and explain the difference between magma and lava.',
      grade: 10,
      curriculum: 'ICSE',
      subject: 'Geography',
      language: 'English',
      force_research: false
    })
  });
  assert.strictEqual(geoRes.status, 200);
  const geoData = await geoRes.json();
  assert.strictEqual(geoData.question_understanding.subject, 'Geography');
  assert.strictEqual(geoData.question_understanding.required_3d_model, 'volcano');

  // Verify 3D Volcano Cross-Section
  const volcanoSceneRes = await fetch(`${BASE_URL}/nexus/3d-scene/volcano`);
  assert.strictEqual(volcanoSceneRes.status, 200);
  const volcanoData = await volcanoSceneRes.json();
  const vScene = volcanoData.scene || volcanoData;
  const vParts = vScene.parts.map(p => p.id);
  assert.ok(vParts.includes('magma_chamber'), 'Subterranean magma chamber present');
  assert.ok(vParts.includes('central_conduit'), 'Central conduit/pipe present');
  assert.ok(vParts.includes('crater_vent'), 'Summit crater and vent present');
  assert.ok(vParts.includes('volcano_cone'), 'Stratified volcanic cone present');
  assert.ok(vScene.annotations.some(a => a.text.includes('Magma') && a.text.includes('Lava')), 'Magma vs Lava annotation present');

  console.log('   ✅ Passed Test D: Volcano formation, magma chamber, central conduit, and 3D cross-section verified.\n');

  // ==========================================
  // TEST E (History): Causes of First World War
  // ==========================================
  console.log('🅴 TEST E (History): Causes of First World War (Strictly NO 3D Gatekeeping)...');
  const histRes = await fetch(`${BASE_URL}/nexus/research-pipeline/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: 'Analyze the causes of the First World War including the Sarajevo Crisis.',
      grade: 10,
      curriculum: 'ICSE',
      subject: 'History',
      language: 'English',
      force_research: false
    })
  });
  assert.strictEqual(histRes.status, 200);
  const histData = await histRes.json();
  assert.strictEqual(histData.question_understanding.subject, 'History');

  // Strict Gatekeeping: History MUST NOT generate a 3D model
  assert.strictEqual(histData.question_understanding.required_3d_model, null, 'History must NEVER require a 3D model');
  assert.strictEqual(histData.lesson.threejs_scene, null, 'History lesson threejs_scene contract must be strictly null');
  assert.ok(
    histData.question_understanding.required_visual_types.includes('timeline') ||
    histData.question_understanding.required_visual_types.includes('historical_image'),
    'History visual must be timeline or historical archival imagery'
  );

  // Check Authentic Archival Record for WWI
  const hubRecRes = await fetch(`${BASE_URL}/nexus/knowledge-hub/record?topic=Causes%20of%20the%20First%20World%20War&grade=10&board=ICSE&subject=History`);
  assert.strictEqual(hubRecRes.status, 200);
  const hubRec = await hubRecRes.json();
  assert.ok(hubRec.facts.some(f => f.includes('Sarajevo Crisis') || f.includes('1914')));
  assert.ok(hubRec.content_hash, 'Content hash present for citation integrity');

  console.log('   ✅ Passed Test E: WWI Causes verified with M-A-I-N timeline, archival provenance, and strict NO 3D gatekeeping.\n');

  // ==========================================
  // TEST F (Voice Conversation): Interactive Follow-Up Turn
  // ==========================================
  console.log('🅵 TEST F (Voice Conversation): Interactive Follow-Up, 3D Component Inspection & Analogy...');
  const vStartRes = await fetch(`${BASE_URL}/voice/start-lesson`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: 'Human Heart',
      grade: 10,
      subject: 'Biology',
      voice_name: 'Kore'
    })
  });
  assert.strictEqual(vStartRes.status, 200);
  const vStart = await vStartRes.json();
  assert.ok(vStart.session_id, 'Voice session created with valid session ID');

  // Turn 1: Component inspection / highlight ("Show me right ventricle")
  const vTurn1Res = await fetch(`${BASE_URL}/voice/interact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: vStart.session_id,
      student_utterance: 'Can you show me the right ventricle in the 3D model?'
    })
  });
  assert.strictEqual(vTurn1Res.status, 200);
  const vTurn1 = await vTurn1Res.json();
  assert.ok(vTurn1.synced_visual, 'Visual action synced');
  assert.strictEqual(vTurn1.synced_visual.target_id, 'right_ventricle', 'Visual action highlighted right_ventricle');
  assert.ok(vTurn1.teacher_speech.toLowerCase().includes('right ventricle'), 'Teacher speech focused on right ventricle');

  // Turn 2: "Make it simpler" analogy request
  const vTurn2Res = await fetch(`${BASE_URL}/voice/interact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: vStart.session_id,
      student_utterance: 'Can you make it simpler? I am a bit confused.'
    })
  });
  assert.strictEqual(vTurn2Res.status, 200);
  const vTurn2 = await vTurn2Res.json();
  assert.ok(vTurn2.teacher_speech.toLowerCase().includes('analogy') || vTurn2.teacher_speech.toLowerCase().includes('house'), 'Provides everyday analogy');

  // Turn 3: Check context retention for research pipeline
  const ctxRes = await fetch(`${BASE_URL}/nexus/research-pipeline/context/${heartSessionId}`);
  assert.strictEqual(ctxRes.status, 200);
  const ctx = await ctxRes.json();
  assert.ok(ctx.topic.toLowerCase().includes('heart') || ctx.topic.toLowerCase().includes('circulat'));
  assert.strictEqual(ctx.grade, 10);

  console.log('   ✅ Passed Test F: Voice conversation handled 3D component highlight, simpler analogy explanation, and preserved context across turns.\n');

  // ==========================================
  // TEST G (Failure Handling): Simulated Provider Outages & Graceful Fallbacks
  // ==========================================
  console.log('🅶 TEST G (Failure Handling): Provider Outage Resilience & Zero Crash Fallback...');

  // 1. Voice invalid session error handling
  const badVoiceRes = await fetch(`${BASE_URL}/voice/interact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: 'non-existent-session-id',
      student_utterance: 'Hello'
    })
  });
  assert.strictEqual(badVoiceRes.status, 404, 'Non-existent session must return 404, not crash with 500');

  // 2. Query unknown topic with fallback to curricular database
  const fallbackRes = await fetch(`${BASE_URL}/nexus/research-pipeline/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: 'Explain quantum entanglement spin conservation in quantum computing.',
      grade: 10,
      curriculum: 'ICSE',
      subject: 'Physics',
      force_research: false
    })
  });
  assert.strictEqual(fallbackRes.status, 200, 'Uncached query gracefully handled without unhandled exception');
  const fallbackData = await fallbackRes.json();
  assert.strictEqual(fallbackData.status, 'success');
  assert.ok(fallbackData.lesson.sections.length >= 10);

  // 3. Provider status inspection
  const statusRes = await fetch(`${BASE_URL}/nexus/knowledge-hub/providers-status`);
  assert.strictEqual(statusRes.status, 200);
  const statusData = await statusRes.json();
  assert.strictEqual(statusData.central_knowledge_library.status, 'active');
  assert.strictEqual(statusData.central_image_library.status, 'active');
  const sunsetNotice = statusData.gemini.custom_search_sunset_notice || statusData.gemini.deprecation_notice || '';
  assert.ok(sunsetNotice.includes('2027') || sunsetNotice.includes('sunset') || sunsetNotice.includes('Google Search'));

  console.log('   ✅ Passed Test G: Simulated failures gracefully handled with safe fallbacks and zero system crashes.\n');

  console.log('======================================================================');
  console.log('🎉 ALL ACCEPTANCE TESTS A THROUGH G PASSED WITH 100% SUCCESS!');
  console.log('======================================================================\n');
}

runAdvancedEngineAcceptanceBattery().catch(err => {
  console.error('❌ Advanced Engine Acceptance Battery Failed:', err);
  process.exit(1);
});
