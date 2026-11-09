import test from 'node:test';
import assert from 'node:assert/strict';
import { unifiedAiOrchestrator, type AIOrchestrationRequest } from '../server/unifiedAiOrchestrator.ts';
import { unifiedKnowledgeRetrieval, type KnowledgeRetrievalQuery } from '../server/unifiedKnowledgeRetrieval.ts';
import { responseValidationLayer } from '../server/responseValidationLayer.ts';
import { knowledgeIntelligenceAdmin } from '../server/knowledgeIntelligenceAdmin.ts';

test('STUDYAI Phase 1: Unified AI Intelligence Foundation', async (t) => {
  await t.test('1. Unified AI Orchestration Layer provides interchangeable adapters for Gemini, OpenAI, Groq, and Local Curriculum', () => {
    const health = unifiedAiOrchestrator.getProvidersHealth();
    assert.ok(Array.isArray(health) && health.length >= 4, 'Must report at least 4 registered providers');

    const gemini = health.find((p) => p.id === 'gemini');
    assert.ok(gemini, 'Gemini adapter must be registered');
    assert.ok(gemini.role.includes('Research'), 'Gemini role must include Research and Teaching');

    const openai = health.find((p) => p.id === 'openai');
    assert.ok(openai, 'OpenAI adapter must be registered');
    assert.ok(openai.role.includes('Review') || openai.role.includes('Fact-Checking'), 'OpenAI role must include Review/Fact-Checking');

    const fallback = health.find((p) => p.id === 'local_curriculum');
    assert.ok(fallback, 'Local curriculum fallback adapter must be registered');
    assert.equal(fallback.operational, true, 'Fallback adapter must always be operational for zero downtime');
  });

  await t.test('2. Orchestrator executes research & teaching tasks with intelligent fallback and audit logging', async () => {
    const req: AIOrchestrationRequest = {
      taskType: 'RESEARCH_AND_TEACH',
      topic: 'Photosynthesis',
      subject: 'Biology',
      grade: 10,
      board: 'CBSE',
      language: 'English',
      prompt: 'Explain the light-dependent and dark reactions of photosynthesis.',
      timeoutMs: 4000
    };

    const res = await unifiedAiOrchestrator.execute(req);
    assert.ok(res.success, 'Execution must succeed');
    assert.ok(res.content && res.content.length > 50, 'Must produce educational content');
    assert.ok(res.model, 'Must report the model used');
    assert.ok(res.auditLogId, 'Must generate audit log id');
  });

  await t.test('3. Shared Knowledge Retrieval Service cleanly separates the 6 curriculum layers', async () => {
    const query: KnowledgeRetrievalQuery = {
      topic: 'Photosynthesis',
      subject: 'Biology',
      grade: 10,
      board: 'CBSE',
      language: 'English'
    };

    const retrieved = await unifiedKnowledgeRetrieval.retrieve(query);

    // Layer A: Universal Knowledge
    assert.ok(retrieved.universalNode, 'Layer A Universal Knowledge Node must exist');
    assert.equal(retrieved.universalNode.topic, 'Photosynthesis');
    assert.ok(retrieved.universalNode.academicDefinition.includes('photochemical'), 'Academic definition must be present');
    assert.ok(retrieved.universalNode.governingFormulas.length > 0, 'Formulas must be present');

    // Layer B: Board Curriculum Requirement
    assert.ok(retrieved.boardRequirement, 'Layer B Board Requirement must exist');
    assert.equal(retrieved.boardRequirement.board, 'CBSE');
    assert.ok(retrieved.boardRequirement.prescribedTextbook.includes('NCERT'), 'Prescribed textbook must reference NCERT for CBSE');

    // Layer C: Grade Pedagogy Profile
    assert.ok(retrieved.gradePedagogy, 'Layer C Grade Pedagogy must exist');
    assert.equal(retrieved.gradePedagogy.grade, 10);
    assert.equal(retrieved.gradePedagogy.cognitiveStage, 'secondary');

    // Layer D: Teaching Explanations (Dual layman vs formal)
    assert.ok(retrieved.dualExplanation, 'Layer D Dual Explanation must exist');
    assert.ok(retrieved.dualExplanation.laymanEverydayExplanation, 'Layman explanation required');
    assert.ok(retrieved.dualExplanation.academicFormalDefinition, 'Formal academic definition required');
    assert.ok(retrieved.dualExplanation.stepByStepMechanism.length > 0, 'Step-by-step mechanism required');

    // Layer E: Examination Information
    assert.ok(retrieved.examinationInfo, 'Layer E Examination Intelligence must exist');
    assert.ok(retrieved.examinationInfo.boardMarkingTips.length > 0, 'Board marking tips required');

    // Layer F: Visual Assets
    assert.ok(Array.isArray(retrieved.visualAssets) && retrieved.visualAssets.length > 0, 'Layer F Visual Assets required');
    assert.ok(retrieved.visualAssets.some((v) => v.title.includes('Chloroplast') || v.title.includes('Photosynthetic')), 'Must have topic-specific diagram');
  });

  await t.test('4. Multi-Board Support: ICSE, CBSE, Andhra Pradesh, and Telangana State Boards across Grades 1–10', async () => {
    const boards: Array<'CBSE' | 'ICSE' | 'AP_STATE_BOARD' | 'TS_STATE_BOARD'> = [
      'CBSE',
      'ICSE',
      'AP_STATE_BOARD',
      'TS_STATE_BOARD'
    ];

    for (const b of boards) {
      const retrieved = await unifiedKnowledgeRetrieval.retrieve({
        topic: 'Human Heart',
        subject: 'Biology',
        grade: 10,
        board: b,
        language: 'English'
      });

      assert.equal(retrieved.boardRequirement.board, b, `Board requirement must match ${b}`);
      assert.ok(retrieved.boardRequirement.prescribedTextbook, `Prescribed textbook must be specified for ${b}`);
    }

    // Verify official sources catalog contains all 4 boards
    const allSources = unifiedKnowledgeRetrieval.getRegisteredSources();
    assert.ok(allSources.some((s) => s.board === 'CBSE'), 'CBSE sources must be registered');
    assert.ok(allSources.some((s) => s.board === 'ICSE'), 'ICSE sources must be registered');
    assert.ok(allSources.some((s) => s.board === 'AP_STATE_BOARD'), 'AP State Board sources must be registered');
    assert.ok(allSources.some((s) => s.board === 'TS_STATE_BOARD'), 'TS State Board sources must be registered');
  });

  await t.test('5. Multilingual Foundation: Preserves scientific formulas while explaining in Telugu and Hindi', async () => {
    // Telugu
    const teluguResult = await unifiedKnowledgeRetrieval.retrieve({
      topic: 'Photosynthesis',
      subject: 'Biology',
      grade: 10,
      board: 'AP_STATE_BOARD',
      language: 'Telugu'
    });

    assert.equal(teluguResult.languageLocalized.language, 'Telugu');
    assert.ok(teluguResult.languageLocalized.translatedTopic.includes('కిరణజన్య సంయోగక్రియ'), 'Telugu title must be accurate');
    assert.equal(teluguResult.languageLocalized.preservesFormulas, true, 'Formulas must be preserved in technical fidelity');

    // Hindi
    const hindiResult = await unifiedKnowledgeRetrieval.retrieve({
      topic: 'Photosynthesis',
      subject: 'Biology',
      grade: 10,
      board: 'CBSE',
      language: 'Hindi'
    });

    assert.equal(hindiResult.languageLocalized.language, 'Hindi');
    assert.ok(hindiResult.languageLocalized.translatedTopic.includes('प्रकाश संश्लेषण'), 'Hindi title must be accurate');
    assert.equal(hindiResult.languageLocalized.preservesFormulas, true, 'Formulas must be preserved in technical fidelity');
  });

  await t.test('6. Response Validation Layer enforces topic relevance, factual accuracy, and formula syntax', () => {
    // Valid educational response
    const validReport = responseValidationLayer.validate({
      topic: 'Photosynthesis',
      subject: 'Biology',
      grade: 10,
      board: 'CBSE',
      language: 'English',
      content: `
# Photosynthesis
Photosynthesis is the photochemical process where plants use chlorophyll, CO₂, and H₂O in the presence of sunlight to produce Glucose (C₆H₁₂O₆) and Oxygen (6O₂).
Equation: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂.
1. Light Reactions: Takes place in thylakoids.
2. Calvin Cycle: Carbon fixation in stroma.
`
    });

    assert.equal(validReport.overallPassed, true, 'Valid response must pass validation');
    assert.ok(validReport.trustScore >= 80, 'Valid response must have high trust score');
    assert.equal(validReport.checks.subjectRelevance.passed, true);
    assert.equal(validReport.checks.topicRelevance.passed, true);
    assert.equal(validReport.checks.factualAccuracy.passed, true);

    // Subject drift response (asking biology, getting pure geography/french revolution)
    const driftReport = responseValidationLayer.validate({
      topic: 'Photosynthesis',
      subject: 'Biology',
      grade: 10,
      board: 'CBSE',
      language: 'English',
      content: 'The French Revolution began in 1789 with the storming of the Bastille. King Louis XVI was overthrown.'
    });

    assert.equal(driftReport.checks.topicRelevance.passed, false, 'Subject/topic drift must fail topic relevance');
  });

  await t.test('7. Knowledge Intelligence Admin Service generates comprehensive dashboard report with security guardrails', () => {
    const report = knowledgeIntelligenceAdmin.getDashboardReport();
    assert.ok(report, 'Admin dashboard report must exist');
    assert.equal(report.overview.totalBoardsCovered, 4, 'Must cover 4 boards');
    assert.equal(report.overview.activeGradesRange, 'Grades 1 to 10');
    assert.ok(Array.isArray(report.curriculumCoverageByBoard) && report.curriculumCoverageByBoard.length === 4, 'Must detail coverage for all 4 boards');
    assert.ok(report.providerPerformance.providers.length >= 4, 'Must monitor all providers');
    assert.equal(report.contentQualityAndVerification.zeroHallucinationCompliant, true);
    assert.equal(report.contentQualityAndVerification.multilingualReadiness.english, true);
    assert.equal(report.contentQualityAndVerification.multilingualReadiness.telugu, true);
    assert.equal(report.contentQualityAndVerification.multilingualReadiness.hindi, true);
  });
});
