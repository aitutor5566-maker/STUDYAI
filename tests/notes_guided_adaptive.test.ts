import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { createAppServer } from '../server/index.ts';

const serverInstance = createAppServer();

async function api(
  path: string,
  options: { method?: string; body?: string; headers?: Record<string, string> } = {},
  studentId = 'student-vishwak'
) {
  return new Promise<{ status: number; data: any; rawBody: string }>((resolve, reject) => {
    const req = new EventEmitter() as any;
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
    const chunks: string[] = [];
    const res = {
      writeHead(code: number) {
        statusCode = code;
      },
      end(body?: string) {
        if (body) chunks.push(body);
        const raw = chunks.join('');
        try {
          const parsed = raw.length > 0 ? JSON.parse(raw) : {};
          resolve({ status: statusCode, data: parsed, rawBody: raw });
        } catch {
          resolve({ status: statusCode, data: {}, rawBody: raw });
        }
      }
    } as any;

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

test('1. Topic intelligence & note generation creates structured roadmap with verified diagrams', async () => {
  const res = await api('/api/notes/generate', {
    method: 'POST',
    body: JSON.stringify({
      topic: 'Human Heart Circulation',
      subject: 'Biology'
    })
  });

  assert.equal(res.status, 201);
  assert.ok(res.data.id);
  assert.equal(res.data.subject, 'Biology');
  assert.ok(Array.isArray(res.data.structured?.sections));
  assert.ok(res.data.structured.sections.length >= 3);
  // Verified diagrams generated
  assert.ok(Array.isArray(res.data.structured?.images));
  assert.ok(res.data.structured.images.length > 0);
  assert.ok(res.data.structured.images[0].imageUrl.startsWith('data:image/svg+xml') || res.data.structured.images[0].imageUrl.startsWith('http'));
});

test('2. Adaptive AI Teaching endpoint adjusts explanations to Level 1 (Simplify), Level 3 (Deep), and Example', async () => {
  // First create a note to test against
  const noteRes = await api('/api/notes/generate', {
    method: 'POST',
    body: JSON.stringify({
      topic: 'Friction Mechanics',
      subject: 'Physics'
    })
  });
  assert.equal(noteRes.status, 201);
  const noteId = noteRes.data.id;

  // Level 1: Simplify
  const simplifyRes = await api(`/api/notes/${noteId}/adaptive`, {
    method: 'POST',
    body: JSON.stringify({
      sectionIndex: 0,
      action: 'simplify',
      level: 1
    })
  });
  assert.equal(simplifyRes.status, 200);
  assert.equal(simplifyRes.data.level, 1);
  assert.ok(simplifyRes.data.explanation.length > 20);
  assert.ok(simplifyRes.data.analogyOrExample.includes('Analogy'));
  assert.ok(simplifyRes.data.interactiveCheck?.question);

  // Level 3: Explain more
  const deepRes = await api(`/api/notes/${noteId}/adaptive`, {
    method: 'POST',
    body: JSON.stringify({
      sectionIndex: 0,
      action: 'explain_more',
      level: 3
    })
  });
  assert.equal(deepRes.status, 200);
  assert.equal(deepRes.data.level, 3);
  assert.ok(deepRes.data.explanation.includes('Academic') || deepRes.data.explanation.includes('Derivation'));
  assert.ok(deepRes.data.keyTakeaway.includes('Exam'));

  // Show Example
  const exampleRes = await api(`/api/notes/${noteId}/adaptive`, {
    method: 'POST',
    body: JSON.stringify({
      sectionIndex: 0,
      action: 'show_example',
      level: 2
    })
  });
  assert.equal(exampleRes.status, 200);
  assert.equal(exampleRes.data.level, 2);
  assert.ok(exampleRes.data.analogyOrExample.length > 10);
});

test('3. Studio Tools endpoint synthesizes Audio (Single & Two-Speaker), Mind Map, Slide Deck & Infographic', async () => {
  const noteRes = await api('/api/notes/generate', {
    method: 'POST',
    body: JSON.stringify({
      topic: 'Photosynthesis Biochemical Stages',
      subject: 'Biology'
    })
  });
  assert.equal(noteRes.status, 201);
  const noteId = noteRes.data.id;

  const toolsRes = await api(`/api/notes/${noteId}/study-tools`, {
    method: 'POST',
    body: JSON.stringify({
      toolType: 'all',
      audioMode: 'two-speaker'
    })
  });

  assert.equal(toolsRes.status, 200);
  // Audio overview script and two-speaker turns
  assert.ok(toolsRes.data.audioOverviewScript);
  assert.ok(Array.isArray(toolsRes.data.twoSpeakerDiscussion?.turns));
  assert.ok(toolsRes.data.twoSpeakerDiscussion.turns.length >= 2);
  assert.equal(toolsRes.data.twoSpeakerDiscussion.turns[0].speaker, 'Teacher Nova');
  assert.equal(toolsRes.data.twoSpeakerDiscussion.turns[1].speaker, 'Student Alex');

  // Mind map hierarchy
  assert.ok(toolsRes.data.mindMap);
  assert.equal(toolsRes.data.mindMap.rootId, 'mm-root');
  assert.ok(Array.isArray(toolsRes.data.mindMap.nodes));
  assert.ok(toolsRes.data.mindMap.nodes.length >= 3);

  // Slide deck
  assert.ok(Array.isArray(toolsRes.data.slideDeck));
  assert.equal(toolsRes.data.slideDeck.length, 7);
  assert.equal(toolsRes.data.slideDeck[0].slideType, 'title');
  assert.equal(toolsRes.data.slideDeck[1].slideType, 'introduction');

  // Infographic
  assert.ok(toolsRes.data.infographic);
  assert.ok(Array.isArray(toolsRes.data.infographic.keyMetrics));
  assert.ok(toolsRes.data.infographic.svgDataUrl.startsWith('data:image/svg+xml'));

  // Data table
  assert.ok(toolsRes.data.dataTable);
  assert.ok(Array.isArray(toolsRes.data.dataTable.rows));
});

test('4. Multi-format export delivers printable HTML with Final Revision Page & Markdown', async () => {
  const noteRes = await api('/api/notes/generate', {
    method: 'POST',
    body: JSON.stringify({
      topic: 'Quadratic Equations and Roots',
      subject: 'Mathematics'
    })
  });
  assert.equal(noteRes.status, 201);
  const noteId = noteRes.data.id;

  const htmlRes = await api(`/api/notes/${noteId}/export?format=html`);
  assert.equal(htmlRes.status, 200);
  assert.ok(htmlRes.rawBody.includes('Quadratic Equations and Roots'));

  const mdRes = await api(`/api/notes/${noteId}/export?format=md`);
  assert.equal(mdRes.status, 200);
  assert.ok(mdRes.rawBody.includes('# Quadratic Equations'));
});

test('5. Multi-student profile data isolation guarantees private notes access', async () => {
  const userANote = await api(
    '/api/notes/generate',
    {
      method: 'POST',
      body: JSON.stringify({ topic: 'Vishwak Private Research', subject: 'Science' })
    },
    'student-vishwak'
  );
  assert.equal(userANote.status, 201);
  const noteId = userANote.data.id;

  // Another student attempting to access user A's note should be rejected
  const isolatedStudentId = `student-isolated-${Date.now()}`;
  const unauthorizedRes = await api(`/api/notes/${noteId}`, {}, isolatedStudentId);
  assert.equal(unauthorizedRes.status, 404);
});
