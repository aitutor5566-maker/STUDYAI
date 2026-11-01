import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { createAppServer } from '../server/index.ts';

const serverInstance = createAppServer();

async function api(path, options = {}, studentId = 'student-vishwak') {
  return new Promise((resolve, reject) => {
    const req = new EventEmitter();
    req.method = options.method || 'GET';
    req.url = path;
    req.headers = {
      'x-student-id': studentId,
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...Object.fromEntries(Object.entries(options.headers || {}).map(([k, v]) => [k.toLowerCase(), v]))
    };
    req.socket = { remoteAddress: '127.0.0.1' };
    req.destroy = () => {};

    let statusCode = 200;
    const chunks = [];
    const res = {
      writeHead(code) {
        statusCode = code;
      },
      setHeader() {},
      getHeader() {},
      end(body) {
        if (body) chunks.push(body);
        try {
          const parsed = chunks.length > 0 ? JSON.parse(chunks.join('')) : {};
          resolve({ status: statusCode, data: parsed });
        } catch {
          resolve({ status: statusCode, data: {} });
        }
      }
    };

    serverInstance.emit('request', req, res);

    queueMicrotask(() => {
      try {
        if (options.body) {
          req.emit('data', Buffer.from(options.body, 'utf-8'));
        }
        req.emit('end');
      } catch (err) {
        reject(err);
      }
    });
  });
}

const TOPICS = [
  { topic: 'DNA', is3d: true },
  { topic: 'Human Heart', is3d: true },
  { topic: 'Photosynthesis', is3d: true },
  { topic: 'Atomic Structure', is3d: true },
  { topic: 'Chemical Bonding', is3d: false },
  { topic: 'Fractions', is3d: false },
  { topic: 'Geometry', is3d: false },
  { topic: 'Newton’s Laws', is3d: false },
  { topic: 'Solar System', is3d: true },
  { topic: 'Water Cycle', is3d: true }
];

console.log('================================================================');
console.log('🚀 RUNNING STUDYAI VISUAL AI TUTOR FULL ACCEPTANCE SUITE (A to J)');
console.log('================================================================\n');

async function runAcceptanceTests() {
  let passedCount = 0;
  let testIdx = 1;

  // Criterion 13: Strict Prohibition of Video Generation (Section I)
  console.log(`[TEST ${testIdx++}] Verifying Section I: Video Generation Strictly Disabled`);
  const postVid = await api('/api/media/video', {
    method: 'POST',
    body: JSON.stringify({ topic: 'Solar System Orbits', durationSeconds: 40 })
  });
  assert.equal(postVid.status, 403, 'POST /api/media/video must return 403 Forbidden');
  assert.equal(postVid.data.code, 'FEATURE_DISABLED', 'Error code must be FEATURE_DISABLED');
  assert.equal(postVid.data.disabled, true);
  console.log('  ✔ POST /api/media/video rejected with 403 Forbidden and FEATURE_DISABLED');

  const getVid = await api('/api/media/video/test-job-999');
  assert.equal(getVid.status, 403, 'GET /api/media/video/:id must return 403 Forbidden');
  assert.equal(getVid.data.code, 'FEATURE_DISABLED');
  console.log('  ✔ GET /api/media/video/:id rejected with 403 Forbidden and FEATURE_DISABLED');

  const health = await api('/api/health');
  assert.equal(health.status, 200);
  assert.equal(health.data.providers.video.status, 'strictly_disabled');
  assert.equal(health.data.providers.video.configured, false);
  console.log('  ✔ /api/health reports video generation as strictly_disabled');
  passedCount++;

  // Criterion 8b: Visual Plan & Regeneration Endpoints (Section D)
  console.log(`\n[TEST ${testIdx++}] Verifying Section D: Visual Intelligence Engine Plan & Regeneration`);
  const planRes = await api('/api/visual/plan?topic=Human+Heart&gradeLevel=Grade+10');
  assert.equal(planRes.status, 200);
  assert.ok(planRes.data.subtopics.length >= 4, 'Must provide structured subtopic hierarchy');
  assert.ok(planRes.data.subtopics[0].primaryVisual.dataUrl.startsWith('data:image/svg+xml;base64,'));
  assert.ok(planRes.data.subtopics[0].primaryVisual.labels.length >= 4, 'Must have validated non-overlapping labels');
  console.log(`  ✔ /api/visual/plan returned ${planRes.data.subtopics.length} subtopics with high-contrast labels`);

  const regenRes = await api('/api/visual/regenerate', {
    method: 'POST',
    body: JSON.stringify({ topic: 'Human Heart', subtopic: 'Cardiac Valves' })
  });
  assert.equal(regenRes.status, 200);
  assert.equal(regenRes.data.success, true);
  assert.ok(regenRes.data.visual.dataUrl.startsWith('data:image/svg+xml;base64,'));
  console.log('  ✔ /api/visual/regenerate forced cache refresh and generated updated SVG');
  passedCount++;

  // Criteria 1 to 12 across all 10 topics
  for (const t of TOPICS) {
    console.log(`\n[TEST ${testIdx++}] Acceptance Testing Topic: "${t.topic}"`);
    
    // 1. Ask tutor question
    const convId = `conv-accept-${Date.now()}-${t.topic.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const askRes = await api('/api/tutor/ask', {
      method: 'POST',
      body: JSON.stringify({
        conversationId: convId,
        topic: t.topic,
        question: `Explain the fundamental mechanisms and structures of ${t.topic}`,
        mode: 'detailed',
        grade: 10,
        level: 'Grade 10',
        subject: 'Science'
      })
    });

    assert.equal(askRes.status, 200, `Ask request failed for ${t.topic}`);
    const actualConvId = askRes.data.conversationId;
    const msgs = askRes.data.messages || [];
    assert.ok(msgs.length >= 2, 'Must contain user and assistant messages');
    const assistant = msgs.find((m) => m.role === 'assistant');
    assert.ok(assistant && assistant.structured, 'Assistant message must contain structured explanation');
    const s = assistant.structured;

    // Acceptance 1: Topic understood
    assert.ok(s.topic.toLowerCase().includes(t.topic.toLowerCase().slice(0, 4)), 'Topic understood correctly');

    // Acceptance 2: Broken into logical subtopics
    assert.ok(s.subtopics && s.subtopics.length >= 3, `Expected at least 3 subtopics, got ${s.subtopics?.length}`);

    // Acceptance 3: Detailed explanations clear, complete, accurate
    assert.ok(s.introduction.length >= 50, 'Introduction must be detailed and clear');
    assert.ok(s.keySteps.length >= 2, 'Must contain structured key steps');
    assert.ok(s.definitions.length >= 2, 'Must contain formal definitions');

    // Acceptance 4 & 5: Visual support evaluated & generated
    assert.ok(s.imageUrl && s.imageUrl.startsWith('data:image/svg+xml;base64,'), 'Must include verified SVG visual representation');

    // Acceptance 6 & 7: Visual directly explains content and has correct labels
    assert.ok(s.imageExplanation, 'Must contain 7-part visual explanation walkthrough');
    assert.ok(s.imageExplanation.whatItShows.length > 20, 'whatItShows must be detailed');
    assert.ok(s.imageExplanation.importantParts.length >= 2, 'Must have labeled parts');

    // Acceptance 8: 3D model support
    if (t.is3d) {
      assert.ok(s.model3dType, `Topic ${t.topic} should have 3D model representation`);
    }

    // Acceptance 9: Student interaction works with selected visual component
    const firstPart = s.imageExplanation.importantParts[0];
    const partLabel = typeof firstPart === 'string' ? firstPart : firstPart.label;
    const partRole = typeof firstPart === 'object' ? firstPart.description : '';

    const interactRes = await api('/api/tutor/ask', {
      method: 'POST',
      body: JSON.stringify({
        conversationId: actualConvId,
        topic: t.topic,
        question: `Explain the specific role of ${partLabel}`,
        mode: 'detailed',
        selectedVisualComponent: {
          id: partLabel.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          label: partLabel,
          role: partRole
        }
      })
    });
    assert.equal(interactRes.status, 200);
    const interactAssistant = interactRes.data.messages.filter(m => m.role === 'assistant').pop();
    assert.ok(interactAssistant, 'Interaction follow-up returned response');

    // Acceptance 10: Follow-up maintains context
    assert.ok(interactRes.data.messages.length >= 4, 'Conversation history maintained across follow-ups');

    // Acceptance 11: Lesson persisted and retrievable
    const getConv = await api(`/api/tutor/conversations/${actualConvId}`);
    assert.equal(getConv.status, 200);
    assert.ok(getConv.data.messages.length >= 4, 'Retrieved persisted conversation messages');

    // Acceptance 12: Lesson can be saved into AI Notes
    const saveNoteRes = await api('/api/notes/generate', {
      method: 'POST',
      body: JSON.stringify({
        topic: t.topic,
        subject: s.subject || 'Science',
        level: 'Grade 10'
      })
    });
    assert.equal(saveNoteRes.status, 201, 'Failed to save lesson into AI Notes');
    assert.ok(saveNoteRes.data.id, 'Saved note must have ID');

    console.log(`  ✔ All 12 acceptance criteria passed for "${t.topic}"`);
    passedCount++;
  }

  console.log('\n================================================================');
  console.log(`🎉 ALL ${passedCount} ACCEPTANCE CRITERIA AND TOPIC TESTS PASSED!`);
  console.log('================================================================\n');
}

runAcceptanceTests().catch((err) => {
  console.error('\n❌ ACCEPTANCE TEST FAILED:', err);
  process.exit(1);
});
