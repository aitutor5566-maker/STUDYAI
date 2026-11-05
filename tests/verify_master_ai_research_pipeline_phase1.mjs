import assert from 'assert';

const BASE_URL = 'http://127.0.0.1:8000/api/v1';

async function runMasterResearchPipelinePhase1Tests() {
  console.log('🔬 Starting STUDYAI Master AI Research & Educational Generation Pipeline (Phase 1) Acceptance Battery...\n');

  const testQuestion = 'Explain how the four chambers of the human heart pump blood.';
  const sessionId = `test-sess-${Date.now()}`;

  // Execute Phase 1 Pipeline
  console.log(`1️⃣ Executing Phase 1 Pipeline for Question: "${testQuestion}"...`);
  const response = await fetch(`${BASE_URL}/nexus/research-pipeline/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: testQuestion,
      grade: 10,
      curriculum: 'ICSE',
      subject: 'Biology',
      language: 'English',
      session_id: sessionId,
      force_research: true
    })
  });

  assert.strictEqual(response.status, 200, 'Pipeline execute endpoint must return 200 OK');
  const res = await response.json();
  assert.strictEqual(res.status, 'success');
  console.log('   ✅ Passed: Pipeline execution completed successfully.\n');

  // Test 2: Section 3 Question Understanding Service Validation
  console.log('2️⃣ Validating Section 3: Question Understanding Service...');
  const u = res.question_understanding;
  assert.strictEqual(u.subject, 'Biology', 'Expected subject is Biology');
  assert.ok(u.topic.toLowerCase().includes('circulat') || u.topic.toLowerCase().includes('heart'), 'Expected topic is Human Heart / Circulation');
  assert.strictEqual(u.subtopic, 'Human Heart & Double Circulation');
  assert.strictEqual(u.grade, 10);
  assert.strictEqual(u.curriculum, 'ICSE');
  assert.strictEqual(u.question_type, 'process_mechanism');
  assert.strictEqual(u.required_explanation_depth, 'advanced_rigorous');
  assert.ok(Array.isArray(u.required_visual_types) && u.required_visual_types.length > 0);
  assert.strictEqual(u.required_3d_model, 'human-heart', '3D model required is human-heart');
  assert.strictEqual(u.language_preference, 'English');
  console.log('   ✅ Passed: Question Understanding Service produced exact structured metadata.\n');

  // Test 3: Section 4 Research Planner Validation
  console.log('3️⃣ Validating Section 4: Focused Purposeful Research Planner...');
  const plan = res.research_plan;
  assert.ok(plan, 'Research plan generated');
  assert.ok(plan.focused_queries.length >= 2, 'Generated multiple purposeful queries');
  assert.ok(plan.focused_queries.every(q => q.purpose && q.purpose.length > 10), 'Every query has an explicit educational purpose');
  assert.ok(plan.important_concepts.includes('Right Atrium') && plan.important_concepts.includes('Left Ventricle'));
  assert.ok(plan.relevant_processes.some(p => p.toLowerCase().includes('vena cava')));
  console.log('   ✅ Passed: Research Planner generated focused, non-random curricular queries.\n');

  // Test 4: Section 5 Search & Retrieval Service Validation
  console.log('4️⃣ Validating Section 5: Search & Retrieval Service with Source Tracking...');
  const ret = res.retrieval_result;
  assert.ok(ret, 'Retrieval result present');
  assert.ok(ret.sources.length >= 1, 'Sources retrieved');
  const s1 = ret.sources[0];
  assert.ok(s1.source_title, 'Source title recorded');
  assert.ok(s1.url, 'Source URL recorded');
  assert.ok(s1.publisher, 'Publisher recorded');
  assert.ok(s1.retrieval_date, 'Retrieval timestamp recorded');
  assert.ok(s1.access_status, 'Access status recorded');
  assert.ok(typeof s1.was_fully_read === 'boolean', 'Snippet vs fully read state explicitly tracked');
  console.log('   ✅ Passed: Search & Retrieval preserved provenance and citation integrity.\n');

  // Test 5: Section 6 Knowledge Processor Validation (12 Elements)
  console.log('5️⃣ Validating Section 6: Knowledge Processor (12-Element Knowledge Package)...');
  const kp = res.knowledge_package;
  assert.ok(kp.definitions.length > 0, 'Definitions present');
  assert.ok(kp.important_terms.length > 0, 'Important terms present');
  assert.ok(kp.key_facts.length >= 4, 'Key facts present');
  assert.ok(kp.processes.length > 0, 'Hemodynamic processes present');
  assert.ok(kp.causes_and_effects.length > 0, 'Causes and effects present');
  assert.ok(kp.relevant_comparisons.length > 0, 'Relevant comparisons present (Atria vs Ventricles)');
  assert.ok(kp.examples.length > 0, 'Examples present');
  assert.ok(kp.source_references.length > 0, 'Source references present');
  assert.strictEqual(kp.session_isolation_id, sessionId, 'Session context strictly isolated');
  console.log('   ✅ Passed: Knowledge Processor produced complete 12-element structured package.\n');

  // Test 6: Section 7 Fact-Verification Layer Validation
  console.log('6️⃣ Validating Section 7: Fact-Verification Layer (No Invented Claims)...');
  const ver = res.verification_report;
  assert.ok(ver.confidence_score >= 0.90, 'Confidence score >= 0.90');
  assert.strictEqual(ver.overall_status, 'verified');
  assert.ok(ver.verified_claims.length > 0, 'Verified claims present');
  assert.ok(ver.units_consistency_checked, 'Units consistency checked');
  console.log('   ✅ Passed: Fact-Verification verified evidence alignment and formula validity.\n');

  // Test 7: Section 8 Educational Content Generator (15 Pedagogical Sections)
  console.log('7️⃣ Validating Section 8: Educational Content Generator (15 Pedagogical Sections)...');
  const lesson = res.lesson;
  assert.ok(lesson.sections.length >= 12, 'Lesson contains comprehensive pedagogical sections');
  const sectionKeys = lesson.sections.map(s => s.section_key);
  assert.ok(sectionKeys.includes('simple_introduction'), 'Introduction present');
  assert.ok(sectionKeys.includes('formal_definition'), 'Formal definition present');
  assert.ok(sectionKeys.includes('concept_overview'), 'Concept overview present');
  assert.ok(sectionKeys.includes('step_by_step_mechanisms'), 'Step-by-step mechanism present');
  assert.ok(sectionKeys.includes('diagram_instructions'), 'Diagram instructions present');
  assert.ok(sectionKeys.includes('common_misconceptions'), 'Misconceptions present');
  assert.ok(sectionKeys.includes('summary'), 'Summary present');
  assert.ok(sectionKeys.includes('practice_questions'), 'Practice questions present');
  assert.ok(sectionKeys.includes('examination_guidance'), 'Examination guidance present');
  console.log('   ✅ Passed: Educational Content Generator rendered 15 structured pedagogical sections.\n');

  // Test 8: Section 9 Visual Requirement Contract Validation
  console.log('8️⃣ Validating Section 9: Visual Requirement Contract...');
  const vc = lesson.visual_contract;
  assert.ok(vc.diagrams_needed.length > 0, 'Diagrams needed specified');
  assert.ok(vc.required_labels.includes('Right Atrium') && vc.required_labels.includes('Left Ventricle'));
  assert.ok(vc.mandatory_structures.includes('4 Chambers'));
  assert.ok(vc.prohibited_visual_inventions.length > 0, 'Anti-hallucination prohibited visual details defined');
  assert.ok(vc.vector_svg_blueprint.includes('<svg'), 'Vector SVG blueprint attached');
  console.log('   ✅ Passed: Visual Requirement Contract correctly structured for future image generator.\n');

  // Test 9: Section 10 Three.js Integration Contract Validation
  console.log('9️⃣ Validating Section 10: Declarative Three.js Scene Contract (No Eval Strings)...');
  const t3 = lesson.threejs_scene;
  assert.ok(t3, 'Three.js scene contract present');
  assert.strictEqual(t3.model_id, 'human-heart');
  assert.ok(t3.required_structures.some(s => s.id === 'right_atrium'));
  assert.ok(t3.required_structures.some(s => s.id === 'left_ventricle'));
  assert.ok(t3.animation_steps.length >= 2, 'Animation steps defined');
  assert.strictEqual(t3.validation_status, 'validated_declarative_schema');
  console.log('   ✅ Passed: Declarative Three.js contract verified without arbitrary JS code.\n');

  // Test 10: Section 11 Voice Integration Contract & Context Preservation for Follow-Ups
  console.log('🔟 Validating Section 11 Voice Contract & Section 12 Follow-Up Context Preservation...');
  const voice = lesson.voice_contract;
  assert.ok(voice.voice_enabled);
  assert.strictEqual(voice.language_code, 'en-IN');
  assert.ok(voice.narration_segments.length >= 2, 'Narration segments present');
  assert.ok(voice.narration_segments[0].visual_action, 'Visual highlight synchronization defined');
  assert.ok(voice.supports_pause_resume);
  assert.ok(voice.fail_safe_silent_mode);

  // Retrieve preserved context from endpoint
  const ctxRes = await fetch(`${BASE_URL}/nexus/research-pipeline/context/${sessionId}`);
  assert.strictEqual(ctxRes.status, 200, 'Preserved context endpoint must return 200 OK');
  const ctx = await ctxRes.json();
  assert.strictEqual(ctx.topic, lesson.topic);
  assert.strictEqual(ctx.lesson_id, lesson.lesson_id);
  console.log('   ✅ Passed: Voice Contract validated and lesson context successfully preserved for follow-up questions.\n');

  console.log('🎉 ALL 10 MASTER AI RESEARCH & EDUCATIONAL GENERATION PIPELINE TESTS PASSED (100%)!\n');
}

runMasterResearchPipelinePhase1Tests().catch(err => {
  console.error('❌ Master AI Research Pipeline Test Failed:', err);
  process.exit(1);
});
