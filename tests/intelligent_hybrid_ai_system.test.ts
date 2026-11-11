import test from 'node:test';
import assert from 'node:assert/strict';
import {
  centralAiOrchestrator,
  QwenProviderAdapter,
  GeminiProviderAdapter,
  OpenAIProviderAdapter,
  LocalCurriculumFallbackAdapter,
  ModelRouter,
  AcademicVerificationService,
  ResponseValidator,
  type NormalizedAiRequest
} from '../server/centralAiOrchestrator.ts';
import { macCompanionBridge } from '../server/macCompanionBridge.ts';
import { unifiedKnowledgeRetrieval } from '../server/unifiedKnowledgeRetrieval.ts';
import { initDatabase, db } from '../server/db.ts';

test('STUDYAI — Intelligent Hybrid AI System Test Suite', async (t) => {
  initDatabase();

  // ---------------------------------------------------------------------------
  // 1. Qwen 2.5 7B Local Ollama Detection & Model Verification
  // ---------------------------------------------------------------------------
  await t.test('1. Qwen 2.5 7B Local Ollama Provider: Detects model and executes inference', async () => {
    const qwen = new QwenProviderAdapter();
    const isUp = await qwen.isAvailable();
    assert.strictEqual(isUp, true, 'Qwen 2.5 7B on Ollama (or Mac Bridge) must be available on local Mac');

    const modelInfo = await qwen.getModelInfo();
    assert.ok(modelInfo.available, 'Model info must report available');
    assert.ok(
      modelInfo.modelTag.includes('qwen2.5') || modelInfo.modelTag.includes('ai-tutor'),
      `Model tag must be qwen2.5 or ai-tutor (found: ${modelInfo.modelTag})`
    );

    // Test actual execution
    const req: NormalizedAiRequest = {
      taskType: 'TUTOR_CHAT',
      topic: "Newton's Second Law of Motion",
      subject: 'Physics',
      grade: 10,
      board: 'CBSE',
      language: 'English',
      prompt: 'State Newton second law and its governing formula F = ma.'
    };

    const res = await qwen.execute(req);
    assert.ok(res.content && res.content.length > 20, 'Qwen must generate substantive response');
    assert.ok(res.model.includes('qwen2.5') || res.model.includes('ai-tutor') || res.model.includes('Ollama'), 'Model must identify Qwen/Ollama');
  });

  // ---------------------------------------------------------------------------
  // 2. Mac Companion Bridge Lifecycle & Offline Detection
  // ---------------------------------------------------------------------------
  await t.test('2. Mac Companion Bridge: Registration, Heartbeat, Job Polling & Offline Detection', async () => {
    const statusBefore = macCompanionBridge.getStatus();
    assert.ok(typeof statusBefore.online === 'boolean', 'Bridge must report online boolean');

    // Register a mock Mac Companion client
    const reg = macCompanionBridge.registerClient({
      macHostname: 'Vishwak-MacBook-Pro',
      osVersion: 'macOS 15.0 Darwin',
      activeModel: 'qwen2.5:7b',
      installedModels: ['qwen2.5:7b', 'ai-tutor:latest']
    }, '127.0.0.1');

    assert.ok(reg.success, 'Registration must succeed');
    assert.ok(reg.clientId.startsWith('mac-bridge-'), 'Client ID must have valid prefix');

    // Record heartbeat
    const hb = macCompanionBridge.recordHeartbeat(reg.clientId);
    assert.strictEqual(hb, true, 'Heartbeat must succeed for registered client');

    const statusAfter = macCompanionBridge.getStatus();
    assert.strictEqual(statusAfter.online, true, 'Bridge must be ONLINE after registration');
    assert.strictEqual(statusAfter.activeModel, 'qwen2.5:7b', 'Active model must match registered model');

    // Test async job queueing and dispatching through the bridge
    const dispatchPromise = macCompanionBridge.dispatchJob({
      model: 'qwen2.5:7b',
      messages: [{ role: 'user', content: 'What is acceleration?' }],
      timeoutMs: 4000
    });

    // Companion daemon polls for job
    const polledJob = macCompanionBridge.pollNextJob(reg.clientId);
    assert.ok(polledJob && polledJob.jobId, 'Bridge must deliver queued job to polling daemon');
    assert.strictEqual(polledJob.model, 'qwen2.5:7b', 'Polled job must specify model');

    // Companion daemon submits inference result
    const submitted = macCompanionBridge.submitJobResult(reg.clientId, {
      jobId: polledJob.jobId,
      content: 'Acceleration is the rate of change of velocity with respect to time (a = dv/dt).',
      tokensUsed: { prompt: 20, completion: 22, total: 42 }
    });
    assert.strictEqual(submitted, true, 'Result submission must succeed');

    const result = await dispatchPromise;
    assert.ok(result.content.includes('Acceleration'), 'Dispatched job must resolve with companion response');
    assert.strictEqual(result.provider, 'qwen_mac_bridge', 'Provider must be marked as qwen_mac_bridge');
  });

  // ---------------------------------------------------------------------------
  // 3. Google Gemini Provider Adapter
  // ---------------------------------------------------------------------------
  await t.test('3. Google Gemini Provider: Connects with official API models and structured output', async () => {
    const gemini = new GeminiProviderAdapter();
    const isAvail = await gemini.isAvailable();

    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 10) {
      assert.strictEqual(isAvail, true, 'Gemini must be available when key is set');

      const req: NormalizedAiRequest = {
        taskType: 'ACADEMIC_RESEARCH',
        topic: 'Photosynthesis Light vs Dark Reactions',
        subject: 'Biology',
        grade: 10,
        board: 'CBSE',
        prompt: 'Explain the thylakoid membrane role in light reactions.'
      };

      const res = await gemini.execute(req);
      assert.ok(res.content && res.content.length > 20, 'Gemini must generate educational research content');
      assert.ok(res.model.includes('gemini'), 'Model must identify as gemini');
    } else {
      assert.strictEqual(isAvail, false, 'Gemini correctly reports unavailable when key is missing');
    }
  });

  // ---------------------------------------------------------------------------
  // 4. OpenAI Provider Adapter
  // ---------------------------------------------------------------------------
  await t.test('4. OpenAI Provider: Reasoning & independent quality assessment', async () => {
    const openai = new OpenAIProviderAdapter();
    const isAvail = await openai.isAvailable();

    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 10) {
      assert.strictEqual(isAvail, true, 'OpenAI must be available when key is set');

      const req: NormalizedAiRequest = {
        taskType: 'INDEPENDENT_REVIEW',
        topic: 'Law of Conservation of Mass',
        subject: 'Chemistry',
        grade: 9,
        board: 'CBSE',
        prompt: 'Check whether mass can be created or destroyed in a chemical reaction.'
      };

      const res = await openai.execute(req);
      assert.ok(res.content && res.content.length > 20, 'OpenAI must produce reasoning review');
      assert.ok(res.model.includes('openai'), 'Model must identify as openai');
    } else {
      assert.strictEqual(isAvail, false, 'OpenAI correctly reports unavailable when key is missing');
    }
  });

  // ---------------------------------------------------------------------------
  // 5. Intelligent Model Router & Routing Table Rules (PART 7)
  // ---------------------------------------------------------------------------
  await t.test('5. Model Router: Follows Part 7 routing table (Qwen primary, Gemini research, OpenAI review)', () => {
    const router = new ModelRouter();
    const allProviders = new Set<CentralAIProviderId>(['qwen', 'gemini', 'openai', 'local_curriculum']);

    // 1. Normal educational question -> Qwen primary
    const q1: NormalizedAiRequest = {
      taskType: 'TUTOR_CHAT',
      topic: 'Human Heart',
      subject: 'Biology',
      grade: 10,
      prompt: 'How does the heart pump blood?'
    };
    const route1 = router.route(q1, allProviders);
    assert.strictEqual(route1[0], 'qwen', 'Normal tutor question must route to Qwen first');

    // 2. Academic research -> Gemini primary
    const q2: NormalizedAiRequest = {
      taskType: 'ACADEMIC_RESEARCH',
      topic: 'Photosynthesis',
      subject: 'Biology',
      grade: 10,
      prompt: 'Research thylakoid ATP synthase mechanism'
    };
    const route2 = router.route(q2, allProviders);
    assert.strictEqual(route2[0], 'gemini', 'Academic research must route to Gemini first');

    // 3. Independent review -> OpenAI primary
    const q3: NormalizedAiRequest = {
      taskType: 'INDEPENDENT_REVIEW',
      topic: 'Newton Laws',
      subject: 'Physics',
      grade: 10,
      prompt: 'Review calculation for accuracy'
    };
    const route3 = router.route(q3, allProviders);
    assert.strictEqual(route3[0], 'openai', 'Independent review must route to OpenAI first');

    // 4. When Qwen is offline -> graceful fallback to Gemini
    const noQwen = new Set<CentralAIProviderId>(['gemini', 'openai', 'local_curriculum']);
    const routeFallback = router.route(q1, noQwen);
    assert.strictEqual(routeFallback[0], 'gemini', 'When Qwen is offline, tutor questions must fall back to Gemini');
  });

  // ---------------------------------------------------------------------------
  // 6. Central AI Orchestrator Execution, Normalization & Audit Logging
  // ---------------------------------------------------------------------------
  await t.test('6. Central AI Orchestrator: Unified Execution & Normalized Response Contract (PART 14)', async () => {
    const req: NormalizedAiRequest = {
      taskType: 'TUTOR_CHAT',
      topic: 'Photosynthesis',
      subject: 'Biology',
      grade: 10,
      board: 'CBSE',
      language: 'English',
      prompt: 'Explain photosynthesis with equations and definitions.'
    };

    const res = await centralAiOrchestrator.execute(req);

    // Verify Part 14 normalized schema fields
    assert.ok(res.request_id && res.request_id.startsWith('req-'), 'Must have request_id');
    assert.ok(res.conversation_id && res.conversation_id.startsWith('conv-'), 'Must have conversation_id');
    assert.ok(['qwen', 'gemini', 'openai', 'local_curriculum'].includes(res.provider), 'Must have valid provider id');
    assert.ok(res.model, 'Must specify exact model name');
    assert.ok(res.response_status === 'success' || res.response_status === 'fallback', 'Must have valid response status');
    assert.strictEqual(res.subject, 'Biology', 'Must preserve subject');
    assert.strictEqual(res.topic, 'Photosynthesis', 'Must preserve topic');
    assert.ok(res.answer && res.answer.length > 50, 'Must have substantive answer');
    assert.ok(Array.isArray(res.definitions), 'Definitions must be an array');
    assert.ok(Array.isArray(res.formulas), 'Formulas must be an array');
    assert.ok(Array.isArray(res.sources), 'Sources must be an array');
    assert.ok(res.latency_ms >= 0, 'Must record latency');

    // Verify audit log row was written to SQLite
    const auditRow = db.prepare('SELECT * FROM ai_orchestration_audit_logs WHERE id = ?').get(res.request_id) as any;
    assert.ok(auditRow, 'Orchestration execution must be persisted to SQLite audit table');
    assert.strictEqual(auditRow.topic, 'Photosynthesis', 'Audit row topic must match');
  });

  // ---------------------------------------------------------------------------
  // 7. Shared Indian Academic Knowledge Library (CBSE, ICSE, AP, TS — EN, TE, HI)
  // ---------------------------------------------------------------------------
  await t.test('7. Shared Indian Academic Knowledge Library: Multi-board & Multilingual Retrieval', async () => {
    // A. CBSE Science Class 10
    const cbse = await unifiedKnowledgeRetrieval.retrieveCurriculumKnowledge({
      topic: 'Structure of the Human Heart',
      subject: 'Science',
      grade: 10,
      board: 'CBSE',
      language: 'English'
    });
    assert.strictEqual(cbse.boardRequirement.board, 'CBSE');
    assert.strictEqual(cbse.boardRequirement.grade, 10);
    assert.ok(cbse.dualExplanation.academicFormalDefinition.length > 20, 'Has formal academic definition');
    assert.ok(cbse.dualExplanation.stepByStepMechanism.length >= 3, 'Has step-by-step mechanism');

    // B. ICSE Physics Class 10
    const icse = await unifiedKnowledgeRetrieval.retrieveCurriculumKnowledge({
      topic: 'Force and Newton Second Law',
      subject: 'Physics',
      grade: 10,
      board: 'ICSE',
      language: 'English'
    });
    assert.strictEqual(icse.boardRequirement.board, 'ICSE');
    assert.ok(icse.universalNode.governingFormulas.length > 0, 'ICSE Physics must include governing formulas');

    // C. Andhra Pradesh State Board in Telugu
    const apTelugu = await unifiedKnowledgeRetrieval.retrieveCurriculumKnowledge({
      topic: 'Photosynthesis',
      subject: 'Science',
      grade: 10,
      board: 'AP_STATE_BOARD',
      language: 'Telugu'
    });
    assert.strictEqual(apTelugu.boardRequirement.board, 'AP_STATE_BOARD');
    assert.strictEqual(apTelugu.languageLocalized.language, 'Telugu');
    assert.ok(apTelugu.languageLocalized.localizedLaymanIntro.length > 10, 'Must have Telugu localized explanation');

    // D. Telangana State Board in Hindi
    const tsHindi = await unifiedKnowledgeRetrieval.retrieveCurriculumKnowledge({
      topic: 'Chemical Reactions and Equations',
      subject: 'Chemistry',
      grade: 10,
      board: 'TS_STATE_BOARD',
      language: 'Hindi'
    });
    assert.strictEqual(tsHindi.boardRequirement.board, 'TS_STATE_BOARD');
    assert.strictEqual(tsHindi.languageLocalized.language, 'Hindi');
  });

  // ---------------------------------------------------------------------------
  // 8. Academic Verification & Anti-Hallucination Checks
  // ---------------------------------------------------------------------------
  await t.test('8. Academic Verification: Mathematical formula validation and deterministic arithmetic', () => {
    const verifier = new AcademicVerificationService();

    // Formula verification against retrieved laws
    const formulas = [
      { formula: 'F = ma', explanation: 'Net force equals mass times acceleration' },
      { formula: 'W = F * d', explanation: 'Work done' }
    ];

    const contentWithFormulas = 'According to Newton second law, F = ma. When a force moves an object, W = F * d.';
    const vResult1 = verifier.verifyFormulas(contentWithFormulas, formulas);
    assert.strictEqual(vResult1.verified, true, 'Formulas present in text must be marked verified');
    assert.strictEqual(vResult1.matchedFormulas.length, 2, 'Both formulas must be matched');

    // Deterministic arithmetic solver
    const solved1 = verifier.solveDeterministicArithmetic('15 * 9.8');
    assert.strictEqual(solved1, 147, '15 * 9.8 must deterministically equal 147');

    const solved2 = verifier.solveDeterministicArithmetic('(250 - 100) / 5');
    assert.strictEqual(solved2, 30, '(250 - 100) / 5 must deterministically equal 30');
  });

  // ---------------------------------------------------------------------------
  // 9. Provider Health Diagnostics Overview
  // ---------------------------------------------------------------------------
  await t.test('9. Provider Health Service: Live diagnostics overview', async () => {
    const overview = await centralAiOrchestrator.getHealthOverview();
    assert.ok(Array.isArray(overview) && overview.length >= 4, 'Must report at least 4 providers');

    const qwen = overview.find((p) => p.id === 'qwen');
    assert.ok(qwen, 'Qwen provider must be reported');
    assert.strictEqual(qwen.status, 'ONLINE', 'Qwen on local Ollama must be ONLINE');
    assert.ok(qwen.role.includes('Primary'), 'Qwen must be designated as Primary AI Teaching Model');

    const fallback = overview.find((p) => p.id === 'local_curriculum');
    assert.ok(fallback, 'Local curriculum fallback must be reported');
    assert.strictEqual(fallback.status, 'ONLINE', 'Fallback must always be ONLINE');
  });
});
