/**
 * End-to-End Verification Suite for Section 13 Required Tests (Tests A through G)
 * Verifies the live STUDYAI backend on http://localhost:3001
 */

import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = 'http://localhost:3001';

async function postJson(endpoint, body) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Student-Id': 'student-vishwak'
    },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

function assertCondition(cond, message) {
  if (!cond) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

async function runAllTests() {
  const report = {
    timestamp: new Date().toISOString(),
    results: {}
  };

  console.log('=== RUNNING SECTION 13 END-TO-END VERIFICATION SUITE (TESTS A–G) ===\n');

  // ---------------------------------------------------------------------------
  // TEST A — DNA
  // ---------------------------------------------------------------------------
  console.log('▶ Running Test A — DNA (Explanation, Multiple Images, 7-Part Walkthroughs, Abbreviations, 8-Scene Video, 3D Helix, Exam Qs)...');
  const dnaAsk = await postJson('/api/tutor/ask', {
    topic: 'DNA Structure & Replication',
    question: 'Explain DNA structure, complementary base pairing, replication, and gene expression in detail.',
    mode: 'detailed',
    subject: 'Science',
    level: 'Grade 10',
    grade: 10,
    language: 'English'
  });
  assertCondition(dnaAsk.ok, 'Test A /api/tutor/ask HTTP 200');
  const dnaMsg = [...dnaAsk.data.messages].reverse().find((m) => m.role === 'assistant');
  const dnaS = dnaMsg?.structured;
  assertCondition(Boolean(dnaS?.simpleIntroduction), 'Test A: simpleIntroduction present');
  assertCondition(Array.isArray(dnaS?.lessonImages) && dnaS.lessonImages.length >= 2, 'Test A: >= 2 validated lessonImages');
  assertCondition(Boolean(dnaS.lessonImages[0].explanation?.whatItShows), 'Test A: 7-part image walkthrough present');
  assertCondition(Boolean(dnaS.lessonImages[0].validation?.exists && dnaS.lessonImages[0].validation?.decodable), 'Test A: image validation passed');
  assertCondition(Array.isArray(dnaS?.abbreviations) && dnaS.abbreviations.some((a) => a.abbr === 'DNA' && a.fullForm.includes('Deoxyribonucleic Acid')), 'Test A: DNA abbreviation expanded');
  assertCondition(dnaS?.model3dType === 'dna_helix', 'Test A: model3dType === dna_helix');
  assertCondition(Array.isArray(dnaS?.examQuestions) && dnaS.examQuestions.length >= 3, 'Test A: examQuestions present');

  const dnaVideo = await postJson('/api/media/video', {
    topic: 'DNA Structure & Replication',
    subject: 'Biology',
    audience: 'Grade 10',
    durationSeconds: 56
  });
  assertCondition(dnaVideo.ok, 'Test A /api/media/video HTTP 201');
  assertCondition(Array.isArray(dnaVideo.data.scenes) && dnaVideo.data.scenes.length === 8, `Test A: Expected 8 DNA video scenes, got ${dnaVideo.data.scenes?.length}`);
  assertCondition(Boolean(dnaVideo.data.videoValidation?.exists && dnaVideo.data.videoValidation?.synchronizedNarrationAndCaptions), 'Test A: videoValidation passed');

  report.results.testA_DNA = {
    passed: true,
    topic: dnaS.topic,
    imageCount: dnaS.lessonImages.length,
    imageTitles: dnaS.lessonImages.map((i) => i.title),
    abbreviationsExpanded: dnaS.abbreviations.map((a) => `${a.abbr} (${a.fullForm})`),
    videoSceneCount: dnaVideo.data.scenes.length,
    videoSceneTitles: dnaVideo.data.scenes.map((s) => `Scene ${s.sceneNumber}: ${s.title}`),
    model3dType: dnaS.model3dType,
    examQuestionsCount: dnaS.examQuestions.length
  };
  console.log('  ✅ Test A PASSED:', JSON.stringify(report.results.testA_DNA, null, 2));

  // ---------------------------------------------------------------------------
  // TEST B — ATP
  // ---------------------------------------------------------------------------
  console.log('\n▶ Running Test B — ATP (Full Form, Molecular Structure, Function, Energy Cycle, Labeled ATP Image)...');
  const atpAsk = await postJson('/api/tutor/ask', {
    topic: 'ATP (Adenosine Triphosphate)',
    question: 'What is ATP? Explain its full form, molecular structure, function, and ATP-ADP energy cycle.',
    mode: 'detailed',
    subject: 'Science',
    level: 'Grade 10',
    grade: 10,
    language: 'English'
  });
  assertCondition(atpAsk.ok, 'Test B /api/tutor/ask HTTP 200');
  const atpMsg = [...atpAsk.data.messages].reverse().find((m) => m.role === 'assistant');
  const atpS = atpMsg?.structured;
  assertCondition(atpS.abbreviations.some((a) => a.abbr === 'ATP' && a.fullForm === 'Adenosine Triphosphate'), 'Test B: ATP full form Adenosine Triphosphate present');
  assertCondition(atpS.abbreviations.some((a) => a.abbr === 'ADP' && a.fullForm === 'Adenosine Diphosphate'), 'Test B: ADP full form Adenosine Diphosphate present');
  assertCondition(atpS.lessonImages.length >= 2, 'Test B: >= 2 lessonImages for ATP');
  assertCondition(atpS.lessonImages[0].diagramType === 'atp_structure', `Test B: primary diagramType is atp_structure (got ${atpS.lessonImages[0].diagramType})`);
  assertCondition(atpS.lessonImages[0].explanation.importantParts.length >= 4, 'Test B: ATP image walkthrough lists >= 4 labeled parts');

  report.results.testB_ATP = {
    passed: true,
    topic: atpS.topic,
    fullForms: atpS.abbreviations.map((a) => `${a.abbr} = ${a.fullForm}`),
    primaryDiagramType: atpS.lessonImages[0].diagramType,
    labeledPartsExplained: atpS.lessonImages[0].explanation.importantParts,
    formula: atpS.formula?.equation
  };
  console.log('  ✅ Test B PASSED:', JSON.stringify(report.results.testB_ATP, null, 2));

  // ---------------------------------------------------------------------------
  // TEST C — HUMAN HEART
  // ---------------------------------------------------------------------------
  console.log('\n▶ Running Test C — Human Heart (Simple Words Intro, Detailed Images, 3D Heart Model, 6-Scene Circulation Video)...');
  const heartAsk = await postJson('/api/tutor/ask', {
    topic: 'Human Heart',
    question: 'Explain how the Human Heart pumps blood in simple words with labeled diagrams.',
    mode: 'detailed',
    subject: 'Science',
    level: 'Grade 10',
    grade: 10,
    language: 'English'
  });
  assertCondition(heartAsk.ok, 'Test C /api/tutor/ask HTTP 200');
  const heartMsg = [...heartAsk.data.messages].reverse().find((m) => m.role === 'assistant');
  const heartS = heartMsg?.structured;
  assertCondition(Boolean(heartS?.simpleIntroduction), 'Test C: simpleIntroduction present');
  assertCondition(heartS.lessonImages.length >= 2, 'Test C: >= 2 lessonImages for Human Heart');
  assertCondition(heartS.model3dType === 'human_heart', 'Test C: model3dType === human_heart');

  const heartVideo = await postJson('/api/media/video', {
    topic: 'Human Heart',
    subject: 'Biology',
    audience: 'Grade 10',
    durationSeconds: 45
  });
  assertCondition(heartVideo.ok, 'Test C /api/media/video HTTP 201');
  assertCondition(heartVideo.data.scenes.length === 6, `Test C: Expected 6 Heart video scenes, got ${heartVideo.data.scenes.length}`);

  report.results.testC_HumanHeart = {
    passed: true,
    simpleIntroduction: heartS.simpleIntroduction.slice(0, 140) + '...',
    imageCount: heartS.lessonImages.length,
    model3dType: heartS.model3dType,
    videoSceneCount: heartVideo.data.scenes.length,
    videoSceneTitles: heartVideo.data.scenes.map((s) => `Scene ${s.sceneNumber}: ${s.title}`)
  };
  console.log('  ✅ Test C PASSED:', JSON.stringify(report.results.testC_HumanHeart, null, 2));

  // ---------------------------------------------------------------------------
  // TEST D — PHYSICS (NEWTON'S LAWS OF MOTION)
  // ---------------------------------------------------------------------------
  console.log("\n▶ Running Test D — Physics (Newton's Laws of Motion: Explanation, Diagrams, Real-Life Examples, Exam Qs)...");
  const physicsAsk = await postJson('/api/tutor/ask', {
    topic: "Newton's Laws of Motion",
    question: "Explain Newton's Three Laws of Motion with free-body diagrams, real-life examples, and exam questions.",
    mode: 'detailed',
    subject: 'Science',
    level: 'Grade 10',
    grade: 10,
    language: 'English'
  });
  assertCondition(physicsAsk.ok, 'Test D /api/tutor/ask HTTP 200');
  const physicsMsg = [...physicsAsk.data.messages].reverse().find((m) => m.role === 'assistant');
  const physicsS = physicsMsg?.structured;
  assertCondition(physicsS.lessonImages.length >= 2, 'Test D: >= 2 lessonImages for Physics');
  assertCondition(physicsS.lessonImages[0].diagramType === 'newton_physics', `Test D: newton_physics diagram generated (got ${physicsS.lessonImages[0].diagramType})`);
  assertCondition(Array.isArray(physicsS.realLifeExamples) && physicsS.realLifeExamples.length >= 2, 'Test D: >= 2 realLifeExamples');
  assertCondition(Array.isArray(physicsS.examQuestions) && physicsS.examQuestions.length >= 3, 'Test D: >= 3 examQuestions');

  report.results.testD_Physics = {
    passed: true,
    topic: physicsS.topic,
    diagramTypes: physicsS.lessonImages.map((i) => i.diagramType),
    realLifeExamplesCount: physicsS.realLifeExamples.length,
    examQuestionsCount: physicsS.examQuestions.length,
    formula: physicsS.formula?.equation
  };
  console.log('  ✅ Test D PASSED:', JSON.stringify(report.results.testD_Physics, null, 2));

  // ---------------------------------------------------------------------------
  // TEST E — MATHEMATICS (QUADRATIC EQUATIONS)
  // ---------------------------------------------------------------------------
  console.log('\n▶ Running Test E — Mathematics (Quadratic Equations: Step-by-Step, Parabola Graph, Interactive Plot Spec, Practice Problems)...');
  const mathAsk = await postJson('/api/tutor/ask', {
    topic: 'Quadratic Equations',
    question: 'Explain how to solve Quadratic Equations step by step with a parabola graph, worked examples, and practice problems.',
    mode: 'detailed',
    subject: 'Mathematics',
    level: 'Grade 10',
    grade: 10,
    language: 'English'
  });
  assertCondition(mathAsk.ok, 'Test E /api/tutor/ask HTTP 200');
  const mathMsg = [...mathAsk.data.messages].reverse().find((m) => m.role === 'assistant');
  const mathS = mathMsg?.structured;
  assertCondition(mathS.lessonImages.length >= 2, 'Test E: >= 2 lessonImages for Quadratic Equations');
  assertCondition(mathS.lessonImages[0].diagramType === 'quadratic_parabola', `Test E: quadratic_parabola generated (got ${mathS.lessonImages[0].diagramType})`);
  assertCondition(Boolean(mathS.interactivePlotSpec), 'Test E: interactivePlotSpec present');
  assertCondition(Array.isArray(mathS.practiceQuestions) && mathS.practiceQuestions.length >= 3, 'Test E: >= 3 practiceQuestions');

  report.results.testE_Mathematics = {
    passed: true,
    topic: mathS.topic,
    primaryDiagramType: mathS.lessonImages[0].diagramType,
    interactivePlotSpec: mathS.interactivePlotSpec,
    practiceQuestionsCount: mathS.practiceQuestions.length,
    formula: mathS.formula?.equation
  };
  console.log('  ✅ Test E PASSED:', JSON.stringify(report.results.testE_Mathematics, null, 2));

  // ---------------------------------------------------------------------------
  // TEST F — VOICE & AUDIO PIPELINE
  // ---------------------------------------------------------------------------
  console.log('\n▶ Running Test F — Voice & Audio Pipeline (Long Scientific Explanation with Abbreviations, Numbers & Equations)...');
  const voiceRes = await postJson('/api/media/audio', {
    topic: 'Photosynthesis & Cellular Energy (ATP & DNA)',
    text: 'In photosynthesis, 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ inside the chloroplast. Light energy charges ATP and NADPH, while DNA inside the nucleus encodes the RuBisCO enzyme. In physics, F = m · a governs acceleration.',
    voice: 'Nova (Teacher)',
    speed: 1.0,
    forceRegenerate: true
  });
  assertCondition(voiceRes.ok, 'Test F /api/media/audio HTTP 200');
  const vData = voiceRes.data;
  assertCondition(Boolean(vData.spokenScript && vData.spokenScript.includes('Adenosine Triphosphate')), 'Test F: spokenScript expands ATP to Adenosine Triphosphate');
  assertCondition(Boolean(vData.spokenScript && vData.spokenScript.includes('Deoxyribonucleic Acid')), 'Test F: spokenScript expands DNA to Deoxyribonucleic Acid');
  assertCondition(Boolean(vData.spokenScript && vData.spokenScript.includes('six molecules of Carbon Dioxide')), 'Test F: spokenScript converts chemical equation into spoken English');
  assertCondition(Boolean(vData.audioValidation?.isRealSpeech && vData.wavDataUrl?.startsWith('data:audio/')), 'Test F: audioValidation confirms real decodable speech');
  assertCondition(vData.audioValidation.peakLevelDbFs <= -0.9 && vData.audioValidation.peakLevelDbFs >= -1.2, `Test F: Peak level normalized to ~-1.0 dBFS (got ${vData.audioValidation.peakLevelDbFs})`);
  assertCondition(vData.audioValidation.clippedSamples === 0, 'Test F: Zero clipped audio samples');

  report.results.testF_Voice = {
    passed: true,
    providerUsed: vData.providerUsed,
    abbreviationsExpanded: vData.abbreviationsExpanded,
    segmentCount: vData.segments?.length,
    spokenScriptPreview: vData.spokenScript.slice(0, 220) + '...',
    audioValidation: vData.audioValidation
  };
  console.log('  ✅ Test F PASSED:', JSON.stringify(report.results.testF_Voice, null, 2));

  // ---------------------------------------------------------------------------
  // TEST G — FAILURE RECOVERY
  // ---------------------------------------------------------------------------
  console.log('\n▶ Running Test G — Failure Recovery (Simulated Primary Provider Failure + Simulated All-Providers Outage)...');
  const recImage = await postJson('/api/media/image', {
    topic: 'DNA Structure',
    style: 'Scientific Diagram',
    simulateFailure: 'primary_provider'
  });
  assertCondition(recImage.ok && recImage.data.failureRecoveryLog?.validationPassed, 'Test G: Image primary_provider failure recovered with validated SVG diagram');

  const recVideo = await postJson('/api/media/video', {
    topic: 'ATP Energy Cycle',
    simulateFailure: 'primary_provider'
  });
  assertCondition(recVideo.ok && Boolean(recVideo.data.failureRecoveryLog?.recoveredWith), 'Test G: Video primary_provider failure recovered with animated storyboard');

  const recAudio = await postJson('/api/media/audio', {
    topic: 'Human Heart',
    text: 'The SA Node initiates each heartbeat.',
    simulateFailure: 'primary_provider',
    forceRegenerate: true
  });
  assertCondition(recAudio.ok && Boolean(recAudio.data.failureRecoveryLog?.recoveredWith), 'Test G: Audio primary_provider failure recovered cleanly');

  const failAllImage = await postJson('/api/media/image', {
    topic: 'DNA Structure',
    simulateFailure: 'all_providers'
  });
  assertCondition(failAllImage.status === 503 && failAllImage.data.retryable === true && failAllImage.data.failureReport?.lessonCanCompleteWithoutImage === false, 'Test G: All image providers outage returns 503 and refuses completion without image');

  const failAllTutor = await postJson('/api/tutor/ask', {
    topic: 'DNA Structure',
    question: 'Explain DNA',
    simulateFailure: 'all_providers'
  });
  assertCondition(failAllTutor.status === 503 && failAllTutor.data.failureReport?.partialLessonCompleted === false, 'Test G: All tutor providers outage refuses partial completion');

  report.results.testG_FailureRecovery = {
    passed: true,
    imagePrimaryFailureRecovery: recImage.data.failureRecoveryLog,
    videoPrimaryFailureRecovery: recVideo.data.failureRecoveryLog,
    audioPrimaryFailureRecovery: recAudio.data.failureRecoveryLog,
    allProvidersOutageImageStatus: failAllImage.status,
    allProvidersOutageTutorStatus: failAllTutor.status,
    mandatoryImageEnforcement: failAllTutor.data.failureReport?.mandatoryImageRuleEnforced
  };
  console.log('  ✅ Test G PASSED:', JSON.stringify(report.results.testG_FailureRecovery, null, 2));

  const outPath = path.resolve('tests/rebuild_verification_report.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`\n🎉 ALL 7 REQUIRED END-TO-END TESTS (A–G) PASSED! Saved report to ${outPath}`);
}

runAllTests().catch((err) => {
  console.error('\n❌ VERIFICATION FAILED:', err);
  process.exit(1);
});
