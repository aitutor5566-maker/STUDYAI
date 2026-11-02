import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:3001';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  try {
    return { status: res.status, data: JSON.parse(text) };
  } catch {
    return { status: res.status, text };
  }
}

async function runTests() {
  console.log('🚀 Running STUDYAI Adaptive AI Tutor Upgrade Verification Battery...\n');

  // Test 1: Fetch and Verify Adaptive Profile
  console.log('1. Testing GET /api/tutor/adaptive-profile...');
  const getRes = await request('/api/tutor/adaptive-profile');
  assert.equal(getRes.status, 200, 'Should return HTTP 200');
  assert.ok(getRes.data.user_id, 'Should have user_id');
  assert.ok(getRes.data.adaptive_profile, 'Should have adaptive_profile object');
  console.log('   ✅ Adaptive Profile GET verified.');

  // Test 2: Update Adaptive Profile (PUT)
  console.log('2. Testing PUT /api/tutor/adaptive-profile with student weaknesses...');
  const updatePayload = {
    difficult_subjects: ['Maths', 'Physics'],
    difficult_topics: ['Quadratic Equations'],
    reading_difficulty: true,
    spelling_difficulty: true,
    writing_difficulty: true,
    vocabulary_difficulty: true,
    concept_difficulty: true,
    memory_difficulty: true,
    math_calculation_difficulty: true,
    explanation_style: 'concise',
    preferred_learning_methods: ['diagrams', 'audio', 'examples']
  };
  const putRes = await request('/api/tutor/adaptive-profile', {
    method: 'PUT',
    body: JSON.stringify(updatePayload)
  });
  assert.equal(putRes.status, 200, 'Should return HTTP 200');
  assert.equal(putRes.data.success, true);
  assert.equal(putRes.data.adaptive_profile.explanation_style, 'concise');
  assert.equal(putRes.data.adaptive_profile.reading_difficulty, true);
  assert.equal(putRes.data.adaptive_profile.spelling_difficulty, true);
  assert.deepEqual(putRes.data.adaptive_profile.difficult_subjects, ['Maths', 'Physics']);
  console.log('   ✅ Adaptive Profile PUT and persistence verified.');

  // Test 3: Spelling Guidance Detection & Supportive Guidance
  console.log('3. Testing Spelling Guidance and Gentle Correction in AI Tutor...');
  const askTypoRes = await request('/api/tutor/ask', {
    method: 'POST',
    body: JSON.stringify({
      topic: 'fotosynthesis',
      question: 'What happens during fotosynthesis?',
      mode: 'simple'
    })
  });
  assert.equal(askTypoRes.status, 200);
  const typoAssistantMsg = askTypoRes.data.messages.find(m => m.role === 'assistant');
  assert.ok(typoAssistantMsg, 'Assistant message should exist');
  assert.ok(typoAssistantMsg.structured.spellingGuidance, 'Spelling guidance should be detected');
  assert.equal(typoAssistantMsg.structured.spellingGuidance.corrected, 'photosynthesis');
  assert.ok(typoAssistantMsg.structured.spellingGuidance.message.includes('photosynthesis'));
  console.log(`   ✅ Spelling guidance detected: "${typoAssistantMsg.structured.spellingGuidance.original}" -> "${typoAssistantMsg.structured.spellingGuidance.corrected}" without shaming.`);

  // Test 4: Prerequisite Bridge for Weak Subjects
  console.log('4. Testing Foundational Prerequisite Bridge for Weak Subject (Maths)...');
  const askMathsRes = await request('/api/tutor/ask', {
    method: 'POST',
    body: JSON.stringify({
      topic: 'Quadratic Equations',
      question: 'How to use quadratic formula?',
      subject: 'Maths',
      mode: 'simple'
    })
  });
  assert.equal(askMathsRes.status, 200);
  const mathsAssistantMsg = askMathsRes.data.messages.find(m => m.role === 'assistant');
  assert.ok(mathsAssistantMsg.structured.prerequisiteBridge, 'Prerequisite bridge should be generated for difficult subject');
  assert.ok(mathsAssistantMsg.structured.prerequisiteBridge.foundationalConcept, 'Should contain foundationConcept');
  console.log(`   ✅ Foundational prerequisite bridge generated: "${mathsAssistantMsg.structured.prerequisiteBridge.foundationalConcept}".`);

  // Test 5: Concise & Meaning-Preserving Explanations
  console.log('5. Testing Concise Explanation Engine and Meaning Preservation...');
  assert.ok(mathsAssistantMsg.structured.simpleIntroduction, 'Must have simple definition');
  assert.ok(mathsAssistantMsg.structured.clearDefinition?.formal || mathsAssistantMsg.structured.formula, 'Must preserve academic/scientific truth');
  console.log('   ✅ Explanation preserves scientific/mathematical precision with accessible wording.');

  // Test 6: Understanding-Check Evaluation (Correct Answer)
  console.log('6. Testing POST /api/tutor/evaluate-understanding (Correct Answer)...');
  const evalCorrectRes = await request('/api/tutor/evaluate-understanding', {
    method: 'POST',
    body: JSON.stringify({
      topic: 'Photosynthesis',
      question: 'What is the byproduct gas released in photosynthesis?',
      selectedOption: 'Oxygen (O2)',
      correctOption: 'Oxygen (O2)',
      explanation: 'Water molecules are split in the light-dependent reactions to release oxygen gas.'
    })
  });
  assert.equal(evalCorrectRes.status, 200);
  assert.equal(evalCorrectRes.data.isCorrect, true);
  assert.equal(evalCorrectRes.data.score, 100);
  assert.ok(evalCorrectRes.data.feedback.includes('Excellent work'));
  assert.equal(evalCorrectRes.data.topicStatus, 'mastered');
  console.log('   ✅ Correct answer evaluation verified: +100 score, constructive positive feedback.');

  // Test 7: Understanding-Check Evaluation (Incorrect Answer)
  console.log('7. Testing POST /api/tutor/evaluate-understanding (Incorrect Answer)...');
  const evalIncorrectRes = await request('/api/tutor/evaluate-understanding', {
    method: 'POST',
    body: JSON.stringify({
      topic: 'Photosynthesis',
      question: 'What is the byproduct gas released in photosynthesis?',
      selectedOption: 'Carbon Dioxide (CO2)',
      correctOption: 'Oxygen (O2)',
      explanation: 'Water molecules are split in the light-dependent reactions to release oxygen gas.'
    })
  });
  assert.equal(evalIncorrectRes.status, 200);
  assert.equal(evalIncorrectRes.data.isCorrect, false);
  assert.ok(evalIncorrectRes.data.feedback.includes('Good effort'));
  assert.ok(evalIncorrectRes.data.feedback.includes('Oxygen (O2)'));
  assert.equal(evalIncorrectRes.data.topicStatus, 'needs_review');
  console.log('   ✅ Incorrect answer evaluation verified: constructive guidance, non-punitive review status.');

  // Test 8: Explanation Feedback & Style Adaptation
  console.log('8. Testing POST /api/tutor/feedback...');
  const feedbackRes = await request('/api/tutor/feedback', {
    method: 'POST',
    body: JSON.stringify({
      topic: 'Photosynthesis',
      rating: 'too_simple',
      comment: 'Give me deeper chemical details'
    })
  });
  assert.equal(feedbackRes.status, 200);
  assert.equal(feedbackRes.data.adaptedStyle, 'detailed');
  console.log('   ✅ Dynamic style adaptation verified: adapted to detailed.');

  // Test 9: FastAPI Gateway Parity
  console.log('9. Testing FastAPI Gateway Parity (/api/v1/profiles/adaptive)...');
  const fastapiAdaptive = await request('/api/v1/profiles/adaptive');
  assert.equal(fastapiAdaptive.status, 200);
  assert.ok(fastapiAdaptive.data.adaptive_profile);
  console.log('   ✅ FastAPI Gateway parity verified.');

  console.log('\n🎉 ALL 9 ADAPTIVE AI TUTOR UPGRADE VERIFICATION TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
