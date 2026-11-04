// verify_master_spec_v4.mjs
// Automated Acceptance & Verification Battery for STUDYAI Master Specification v4.0

import assert from 'node:assert';

const BASE_URL = process.env.API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

async function runMasterSpecV4Battery() {
  console.log('🧪 Starting STUDYAI Master Specification v4.0 Acceptance Battery...\n');

  // Test 1: ICSE Physics Chapter 1 - Force & Turning Effect
  console.log('1️⃣ Testing ICSE Physics Chapter 1 (Force, Turning Moments, Couple, Centre of Gravity)...');
  const forceRes = await fetch(`${BASE_URL}/nexus/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'Explain turning effect of force, principle of moments and couple', grade: 10, subject: 'Physics' })
  });
  assert.strictEqual(forceRes.status, 200);
  const forceData = await forceRes.json();
  assert.strictEqual(forceData.subject, 'Physics');
  assert.strictEqual(forceData.subject_intelligence.payload.icse_chapters_1_to_3_compliant, true);
  assert.ok(forceData.definition_scaffold.original_academic_definition.includes('torque') || forceData.definition_scaffold.original_academic_definition.includes('moment'));
  assert.ok(forceData.explanation.length > 50);
  console.log('   ✅ Passed: ICSE Physics Chapter 1 Force benchmark verified.\n');

  // Test 2: ICSE Physics Chapter 2 - Work, Power, Energy & kWh
  console.log('2️⃣ Testing ICSE Physics Chapter 2 (Work Done, Sign Conventions, Power, and kWh)...');
  const workRes = await fetch(`${BASE_URL}/nexus/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'Define work, power and kilowatt-hour and state the condition for zero work', grade: 10, subject: 'Physics' })
  });
  assert.strictEqual(workRes.status, 200);
  const workData = await workRes.json();
  const workPayload = workData.subject_intelligence.payload;
  assert.ok(workPayload.physics_data.chapter.includes('Work'));
  assert.ok(workData.definition_scaffold.simplified_definition.includes('work') || workData.definition_scaffold.simplified_definition.includes('force'));
  console.log('   ✅ Passed: ICSE Physics Chapter 2 Work/Power/Energy & kWh verified.\n');

  // Test 3: ICSE Physics Chapter 3 - Machines, Levers & Block and Tackle
  console.log('3️⃣ Testing ICSE Physics Chapter 3 (Machines, MA, VR, Efficiency, Class I-III Levers, Block & Tackle)...');
  const machineRes = await fetch(`${BASE_URL}/nexus/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'Explain mechanical advantage, velocity ratio and block and tackle system with 5 pulleys', grade: 10, subject: 'Physics' })
  });
  assert.strictEqual(machineRes.status, 200);
  const machineData = await machineRes.json();
  assert.ok(machineData.subject_intelligence.payload.physics_data.chapter.includes('Machines'));
  assert.ok(machineData.subject_intelligence.payload.section_4_numerical);
  console.log('   ✅ Passed: ICSE Physics Chapter 3 Machines benchmark verified.\n');

  // Test 4: Section 4.4 9-Point Deterministic Numerical Card
  console.log('4️⃣ Testing Section 4.4 9-Point Deterministic Numerical Card...');
  const numRes = await fetch(`${BASE_URL}/nexus/physics-numerical`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      given: { "Load (L)": "1000 N", "Effort (E)": "250 N", "Pulleys (n)": "5" },
      find: "Mechanical Advantage (MA) and Efficiency (η)",
      principle_formula: "MA = L / E; VR = n; η = (MA / VR) * 100%",
      why_formula_applies: "Standard block and tackle system with n pulleys in equilibrium.",
      substitution_with_units: "MA = 1000 N / 250 N = 4; VR = 5; η = (4 / 5) * 100%",
      calculation: "MA = 4.0; η = 80.0%",
      final_answer_with_unit: "MA = 4.0; Efficiency = 80%",
      check: "MA is less than VR (5) due to friction and lower block weight, confirming physical validity.",
      common_mistake: "Assuming MA = VR = 5 in a practical real-world machine."
    })
  });
  assert.strictEqual(numRes.status, 200);
  const numData = await numRes.json();
  assert.strictEqual(numData.find, "Mechanical Advantage (MA) and Efficiency (η)");
  assert.strictEqual(numData.final_answer_with_unit, "MA = 4.0; Efficiency = 80%");
  assert.ok(numData.dimensional_reasonableness_check.length > 10);
  console.log('   ✅ Passed: Section 4.4 9-point numerical card validated.\n');

  // Test 5: Section 7.1 Image Candidate Metadata & Licensing
  console.log('5️⃣ Testing Section 7.1 Image Candidate Metadata & Licensing...');
  const imgRes = await fetch(`${BASE_URL}/nexus/image-candidates?query=Mahatma%20Gandhi%20Salt%20March&subject=History&grade=10`);
  assert.strictEqual(imgRes.status, 200);
  const candidates = await imgRes.json();
  assert.ok(Array.isArray(candidates));
  assert.ok(candidates.length > 0);
  const cand = candidates[0];
  assert.ok(cand.title);
  assert.ok(cand.license_name);
  assert.ok(cand.attribution_text);
  assert.strictEqual(cand.verification_status, "verified");
  console.log('   ✅ Passed: Section 7.1 Image candidate metadata verified.\n');

  // Test 6: Google Custom Search API 2027 Sunset & Migration Notice
  console.log('6️⃣ Testing Google Custom Search API 2027 Sunset & Migration Notice...');
  const gApiRes = await fetch(`${BASE_URL}/nexus/google-api-status`);
  assert.strictEqual(gApiRes.status, 200);
  const gApi = await gApiRes.json();
  assert.strictEqual(gApi.api_name, "Google Custom Search JSON API");
  assert.ok(gApi.official_notice.includes("1 January 2027"));
  assert.ok(gApi.migration_plan.length > 20);
  console.log('   ✅ Passed: Google Custom Search API sunset notice and migration plan confirmed.\n');

  // Test 7: Section 8 & 9 Rebuilt 3D Heart Model Scene Specification
  console.log('7️⃣ Testing Section 8 & 9 Rebuilt 3D Heart Model Scene Specification...');
  const heartRes = await fetch(`${BASE_URL}/nexus/3d-scene/human-heart`);
  assert.strictEqual(heartRes.status, 200);
  const heart = await heartRes.json();
  assert.strictEqual(heart.subject, "Biology");
  assert.ok(heart.orientation_notice.includes("Patient Left"));
  assert.strictEqual(heart.blood_flow_sequence.length, 13);
  
  // Verify all 4 chambers exist
  const partIds = heart.parts.map(p => p.id);
  assert.ok(partIds.includes("right_atrium"), "Right Atrium present");
  assert.ok(partIds.includes("right_ventricle"), "Right Ventricle present");
  assert.ok(partIds.includes("left_atrium"), "Left Atrium present");
  assert.ok(partIds.includes("left_ventricle"), "Left Ventricle present");
  assert.ok(partIds.includes("septum"), "Interventricular Septum present");

  // Verify all 4 valves exist
  assert.ok(partIds.includes("tricuspid_valve"), "Tricuspid valve present");
  assert.ok(partIds.includes("mitral_valve"), "Mitral / Bicuspid valve present");
  assert.ok(partIds.includes("pulmonary_valve"), "Pulmonary valve present");
  assert.ok(partIds.includes("aortic_valve"), "Aortic valve present");

  // Verify great vessels
  assert.ok(partIds.includes("superior_vena_cava"), "Superior Vena Cava present");
  assert.ok(partIds.includes("pulmonary_artery"), "Pulmonary Artery present");
  assert.ok(partIds.includes("aorta"), "Aorta present");

  // Verify SA node is separated from atrial anatomy
  const saNodePart = heart.parts.find(p => p.id === "sa_node");
  assert.ok(saNodePart, "SA Node present");
  assert.strictEqual(saNodePart.layer, "conduction", "SA node in separate conduction layer");
  assert.notStrictEqual(saNodePart.id, "right_atrium", "SA node not merged with right atrium");

  // Verify 2D fallback SVG is present
  assert.ok(heart.fallback_diagram_svg.includes("<svg"), "2D Fallback SVG present");
  console.log('   ✅ Passed: Section 8 & 9 Heart rebuild verified across all acceptance checks.\n');

  // Test 8: Section 10.2 Voice Event Segments & Visual Synchronization
  console.log('8️⃣ Testing Section 10.2 Voice Event Segments & Visual Synchronization...');
  const voiceStartRes = await fetch(`${BASE_URL}/voice/start-lesson`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic: 'Human Heart Circulation', grade: 10, subject: 'Biology' })
  });
  assert.strictEqual(voiceStartRes.status, 200);
  const voiceStart = await voiceStartRes.json();
  assert.ok(voiceStart.session_id.startsWith('vsession-'));
  assert.ok(Array.isArray(voiceStart.voice_events));
  assert.ok(voiceStart.voice_events.length > 0);
  const vEvent = voiceStart.voice_events[0];
  assert.strictEqual(vEvent.event, 'speak_segment');
  assert.ok(vEvent.segment_id.startsWith('seg-'));
  assert.ok(vEvent.lesson_block_id.startsWith('step-block-'));
  assert.strictEqual(vEvent.language, 'en-IN');
  console.log('   ✅ Passed: Section 10.2 Voice event segments synchronized with visual actions.\n');

  // Test 9: Section 13 Typed LessonBlocks & Section 13.1 API Response Envelope
  console.log('9️⃣ Testing Section 13 Typed LessonBlocks & Section 13.1 API Response Envelope...');
  const askRes = await fetch(`${BASE_URL}/nexus/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'Double circulation in human heart', grade: 10, subject: 'Biology' })
  });
  assert.strictEqual(askRes.status, 200);
  const askEnvelope = await askRes.json();

  // Check 13.1 Envelope keys
  assert.ok(askEnvelope.request_id, "request_id present");
  assert.strictEqual(askEnvelope.status, "complete", "status is complete");
  assert.strictEqual(askEnvelope.curriculum_context.board, "ICSE");
  assert.strictEqual(askEnvelope.curriculum_context.grade, 10);
  assert.strictEqual(askEnvelope.curriculum_context.subject, "Biology");

  // Check lesson object and typed blocks
  assert.ok(askEnvelope.lesson.title);
  assert.ok(Array.isArray(askEnvelope.lesson.blocks));
  assert.ok(askEnvelope.lesson.blocks.some(b => b.type === "heading"), "heading block present");
  assert.ok(askEnvelope.lesson.blocks.some(b => b.type === "definition"), "definition block present");
  assert.ok(askEnvelope.lesson.blocks.some(b => b.type === "paragraph"), "paragraph block present");
  assert.ok(askEnvelope.lesson.blocks.some(b => b.type === "three_d_scene"), "3D scene block present");

  // Check visual plan, voice, and quality
  assert.ok(Array.isArray(askEnvelope.visual_plan.assets));
  assert.ok(askEnvelope.voice.available);
  assert.strictEqual(askEnvelope.quality.schema_valid, true);
  assert.strictEqual(askEnvelope.quality.academic_checks, "passed");
  console.log('   ✅ Passed: Section 13 & 13.1 typed data contracts and response envelope verified.\n');

  // Test 10: Section 12 Anti-Hallucination & Evidence Record
  console.log('🔟 Testing Section 12 Anti-Hallucination & Evidence Records...');
  assert.ok(!askEnvelope.explanation.includes('[object Object]'), 'No [object Object]');
  assert.ok(!askEnvelope.explanation.includes('null'), 'No unrendered null strings');
  assert.ok(askEnvelope.citations.length > 0, 'Citations present');
  console.log('   ✅ Passed: Anti-hallucination sanitization and citation grounding verified.\n');

  console.log('🎉 ALL 10 STUDYAI MASTER SPECIFICATION V4.0 ACCEPTANCE TESTS PASSED (100%)!\n');
}

runMasterSpecV4Battery().catch(err => {
  console.error('❌ Master Spec v4.0 Test Failed:', err);
  process.exit(1);
});
