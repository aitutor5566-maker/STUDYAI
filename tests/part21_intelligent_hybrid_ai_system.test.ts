import test from 'node:test';
import assert from 'node:assert/strict';
import { initDatabase } from '../server/db.ts';
import { centralAiOrchestrator } from '../server/centralAiOrchestrator.ts';
import { unifiedKnowledgeRetrieval } from '../server/unifiedKnowledgeRetrieval.ts';
import { macCompanionBridge } from '../server/macCompanionBridge.ts';
import { generateTutorExplanation } from '../server/aiAdapter.ts';
import { AdvancedNotesGenerationEngine } from '../server/advancedNotesGenerationEngine.ts';

initDatabase();

test('Part 21: STUDYAI Intelligent Hybrid AI System Real Integration Suite', async (t) => {
  await t.test('1. Qwen 2.5 7B / Local Ollama: live inference & streaming', async () => {
    const health = await centralAiOrchestrator.getHealthOverview();
    const qwenHealth = health.find((p) => p.id === 'qwen');
    assert.ok(qwenHealth, 'Qwen provider must exist in health overview');
    assert.strictEqual(qwenHealth.status, 'ONLINE', `Qwen must be ONLINE, got: ${qwenHealth.message}`);

    const res = await centralAiOrchestrator.execute({
      requestId: 'test-qwen-live-001',
      conversationId: 'conv-qwen-001',
      taskType: 'CONCEPT_EXPLANATION',
      topic: 'Ohms Law',
      subject: 'Physics',
      grade: 10,
      board: 'CBSE',
      language: 'English',
      prompt: 'State Ohms Law and write its formula V = IR in 3 concise sentences.',
      forceProvider: 'qwen',
      timeoutMs: 45000
    });

    assert.strictEqual(res.provider, 'qwen');
    assert.strictEqual(res.request_id, 'test-qwen-live-001');
    assert.strictEqual(res.conversation_id, 'conv-qwen-001');
    assert.strictEqual(res.response_status, 'success');
    assert.ok(res.answer.length > 20, 'Qwen must return a real non-empty answer');
    assert.ok(res.model.includes('qwen2.5'), `Expected qwen2.5 model tag, got ${res.model}`);

    // Streaming test
    let tokenCount = 0;
    const streamRes = await centralAiOrchestrator.stream(
      {
        requestId: 'test-qwen-stream-001',
        taskType: 'TUTOR_CHAT',
        topic: 'Photosynthesis',
        subject: 'Biology',
        grade: 10,
        board: 'CBSE',
        language: 'English',
        prompt: 'Give a 2-sentence definition of photosynthesis.',
        timeoutMs: 45000
      },
      (tok) => {
        if (tok.length > 0) tokenCount += 1;
      }
    );

    assert.strictEqual(streamRes.provider, 'qwen');
    assert.ok(tokenCount >= 3, `Expected multiple streamed tokens, got ${tokenCount}`);
    assert.ok(streamRes.answer.length > 15);
  });

  await t.test('2. Google Gemini: live academic research call', async () => {
    const res = await centralAiOrchestrator.execute({
      requestId: 'test-gemini-live-001',
      taskType: 'ACADEMIC_RESEARCH',
      topic: 'Photosynthesis',
      subject: 'Biology',
      grade: 10,
      board: 'ICSE',
      language: 'English',
      prompt: 'List the two main stages of photosynthesis (light-dependent reactions and Calvin cycle) in 3 bullet points.',
      forceProvider: 'gemini',
      timeoutMs: 25000
    });

    assert.strictEqual(res.provider, 'gemini');
    assert.ok(res.model.startsWith('gemini'), `Expected gemini model, got ${res.model}`);
    assert.ok(res.answer.length > 20);
  });

  await t.test('3. OpenAI: live independent review & reasoning call', async () => {
    const res = await centralAiOrchestrator.execute({
      requestId: 'test-openai-live-001',
      taskType: 'INDEPENDENT_REVIEW',
      topic: 'Newtons Second Law of Motion',
      subject: 'Physics',
      grade: 9,
      board: 'CBSE',
      language: 'English',
      prompt: 'Verify the relation F = ma and give one numerical example with units.',
      forceProvider: 'openai',
      timeoutMs: 25000
    });

    assert.strictEqual(res.provider, 'openai');
    assert.ok(res.model.startsWith('openai'), `Expected openai model, got ${res.model}`);
    assert.ok(res.answer.length > 20);
  });

  await t.test('4. Orchestrator: routing, cancellation, Part 14 schema & concurrency', async () => {
    // 4a. Cancellation test
    const controller = new AbortController();
    const cancelReqId = 'test-cancel-001';
    const pendingPromise = centralAiOrchestrator.execute({
      requestId: cancelReqId,
      taskType: 'CONCEPT_EXPLANATION',
      topic: 'Thermodynamics',
      subject: 'Physics',
      grade: 10,
      board: 'CBSE',
      prompt: 'Write a very long essay on the three laws of thermodynamics.',
      abortSignal: controller.signal
    });

    setTimeout(() => {
      centralAiOrchestrator.cancelRequest(cancelReqId);
    }, 30);

    const cancelledRes = await pendingPromise;
    assert.strictEqual(cancelledRes.request_id, cancelReqId);
    assert.strictEqual(cancelledRes.response_status, 'failed');
    assert.strictEqual(cancelledRes.error_code, 'REQUEST_CANCELLED');

    // 4b. Concurrent calls (2 parallel Qwen calls)
    const [c1, c2] = await Promise.all([
      centralAiOrchestrator.execute({
        taskType: 'CONCEPT_EXPLANATION',
        topic: 'Acid and Base',
        subject: 'Chemistry',
        grade: 10,
        board: 'CBSE',
        prompt: 'Define pH scale in 2 sentences.',
        forceProvider: 'qwen',
        timeoutMs: 45000
      }),
      centralAiOrchestrator.execute({
        taskType: 'CONCEPT_EXPLANATION',
        topic: 'Pythagoras Theorem',
        subject: 'Mathematics',
        grade: 10,
        board: 'CBSE',
        prompt: 'State Pythagoras theorem in 2 sentences.',
        forceProvider: 'qwen',
        timeoutMs: 45000
      })
    ]);

    assert.strictEqual(c1.provider, 'qwen');
    assert.strictEqual(c2.provider, 'qwen');
    assert.ok(Array.isArray(c1.definitions));
    assert.ok(Array.isArray(c1.sources));
    assert.ok(Array.isArray(c1.warnings));
  });

  await t.test('5. Shared Indian Academic Knowledge Retrieval across Boards & Languages', async () => {
    const boards = ['CBSE', 'ICSE', 'AP_STATE_BOARD', 'TS_STATE_BOARD'] as const;
    for (const board of boards) {
      const kb = await unifiedKnowledgeRetrieval.retrieveCurriculumKnowledge({
        topic: 'Photosynthesis',
        subject: 'Biology',
        grade: 10,
        board,
        language: 'English'
      });
      assert.ok(kb.universalNode.topic.length > 0, `Expected topic for ${board}`);
      assert.ok(kb.sources.length >= 1, `Expected curriculum source for ${board}`);
    }

    const teKb = await unifiedKnowledgeRetrieval.retrieveCurriculumKnowledge({
      topic: 'Photosynthesis',
      subject: 'Biology',
      grade: 10,
      board: 'AP_STATE_BOARD',
      language: 'Telugu'
    });
    assert.ok(teKb.dualExplanation.academicFormalDefinition.length > 10);
  });

  await t.test('6. AI Tutor & AI Notes end-to-end generation', async () => {
    const tutor = await generateTutorExplanation({
      topic: 'Ohms Law',
      question: 'Explain Ohms Law simply with an example.',
      mode: 'simple',
      subject: 'Physics',
      level: 'Grade 10 (CBSE)',
      grade: 10,
      board: 'CBSE',
      language: 'English'
    });
    assert.ok(tutor.title && tutor.title.length > 3);
    assert.ok(tutor.steps && tutor.steps.length >= 1);

    const notes = await AdvancedNotesGenerationEngine.generateNotebook({
      topic: 'Photosynthesis',
      subject: 'Biology',
      grade: 10,
      board: 'CBSE',
      language: 'en',
      depth: 'standard'
    });
    assert.ok(notes.contentMarkdown && notes.contentMarkdown.length > 200);
    assert.ok(notes.flashcards && notes.flashcards.length >= 1);
  });

  await t.test('7. Mac Companion Bridge: register, heartbeat, dispatch, poll, submit result', async () => {
    const reg = macCompanionBridge.registerClient({
      clientId: 'test-mac-bridge-001',
      macHostname: 'Test-MacBook-Pro',
      activeModel: 'qwen2.5:7b'
    });
    assert.strictEqual(reg.connected, true);
    assert.strictEqual(macCompanionBridge.isBridgeOnline(), true);

    const dispatchPromise = macCompanionBridge.dispatchJob({
      model: 'qwen2.5:7b',
      messages: [{ role: 'user', content: 'Say OK' }],
      timeoutMs: 5000
    });

    const job = macCompanionBridge.pollNextJob('test-mac-bridge-001');
    assert.ok(job && job.jobId, 'Polled job must have jobId');

    const submitted = macCompanionBridge.submitJobResult('test-mac-bridge-001', {
      jobId: job.jobId,
      content: 'OK from Mac Companion Bridge',
      tokensUsed: { prompt: 5, completion: 5, total: 10 }
    });
    assert.strictEqual(submitted, true);

    const jobResult = await dispatchPromise;
    assert.strictEqual(jobResult.content, 'OK from Mac Companion Bridge');
  });
});
