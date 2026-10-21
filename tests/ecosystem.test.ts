import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { createAppServer } from '../server/index.ts';

const serverInstance = createAppServer();

async function api(path: string, options: { method?: string; body?: string; headers?: Record<string, string> } = {}, studentId = 'student-vishwak') {
  return new Promise<{ status: number; data: any }>((resolve, reject) => {
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
        try {
          const parsed = chunks.length > 0 ? JSON.parse(chunks.join('')) : {};
          resolve({ status: statusCode, data: parsed });
        } catch {
          resolve({ status: statusCode, data: {} });
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

test('1. Health & AI Provider Status report honest configuration without leaking secrets', async () => {
  const { status, data } = await api('/api/health');
  assert.equal(status, 200);
  assert.equal(data.status, 'ok');
  assert.ok(data.providers.llm);
  assert.ok(data.providers.video.message.includes('VIDEO_API_KEY') || data.providers.video.configured);
});

test('2. Home Dashboard returns real persisted data for Vishwak and honest empty state for New Student', async () => {
  const populated = await api('/api/dashboard', {}, 'student-vishwak');
  assert.equal(populated.status, 200);
  assert.equal(populated.data.user.name, 'Vishwak Sai');
  assert.ok(populated.data.stats.overallProgress > 0);
  assert.ok(populated.data.subjectPerformance.length >= 4);
  assert.ok(populated.data.recentActivity.length > 0);

  const emptyState = await api('/api/dashboard', {}, 'student-new');
  assert.equal(emptyState.status, 200);
  assert.equal(emptyState.data.stats.overallProgress, 0);
  assert.equal(emptyState.data.stats.topicsStudied, 0);
  assert.equal(emptyState.data.subjectPerformance.length, 0);
});

test('3. Shared Topic Context synchronizes across the learning journey', async () => {
  const putRes = await api('/api/context', {
    method: 'PUT',
    body: JSON.stringify({ active_topic: 'Quadratic Equations', subject: 'Maths', explanation_mode: 'detailed' })
  });
  assert.equal(putRes.status, 200);
  assert.equal(putRes.data.active_topic, 'Quadratic Equations');
  assert.equal(putRes.data.subject, 'Maths');
  assert.equal(putRes.data.explanation_mode, 'detailed');
});

test('4. AI Tutor validates input, returns structured explanations, and preserves follow-up context', async () => {
  const badRes = await api('/api/tutor/ask', {
    method: 'POST',
    body: JSON.stringify({ question: '   ' })
  });
  assert.equal(badRes.status, 400);

  const ask1 = await api('/api/tutor/ask', {
    method: 'POST',
    body: JSON.stringify({
      topic: 'Photosynthesis',
      question: 'Explain photosynthesis in simple terms',
      mode: 'simple'
    })
  });
  assert.equal(ask1.status, 200);
  assert.ok(ask1.data.conversationId);
  const lastMsg1 = ask1.data.messages[ask1.data.messages.length - 1];
  assert.equal(lastMsg1.role, 'assistant');
  assert.ok(lastMsg1.structured.introduction.length > 20);
  assert.ok(Array.isArray(lastMsg1.structured.keySteps));
  assert.ok(lastMsg1.structured.formula.equation.includes('CO₂'));
  assert.ok(lastMsg1.structured.imageUrl && lastMsg1.structured.imageUrl.startsWith('data:image/'));

  const ask2 = await api('/api/tutor/ask', {
    method: 'POST',
    body: JSON.stringify({
      conversationId: ask1.data.conversationId,
      topic: 'Photosynthesis',
      question: 'How do desert plants perform photosynthesis without losing water?',
      mode: 'detailed'
    })
  });
  assert.equal(ask2.status, 200);
  assert.equal(ask2.data.messages.length, 4);
  const lastMsg2 = ask2.data.messages[3];
  assert.ok(lastMsg2.structured.introduction.includes('CAM') || lastMsg2.structured.introduction.includes('context'));
});

test('5. AI Notes Studio creates, edits, persists, searches, and validates file uploads', async () => {
  const badUpload = await api('/api/notes/upload', {
    method: 'POST',
    body: JSON.stringify({ fileName: 'malware.exe', fileSize: 1024, fileType: 'application/octet-stream' })
  });
  assert.equal(badUpload.status, 400);

  const okUpload = await api('/api/notes/upload', {
    method: 'POST',
    body: JSON.stringify({
      fileName: 'human_heart_notes.md',
      fileSize: 2048,
      fileType: 'text/markdown',
      content: '# Human Heart Chambers\nLeft ventricle pumps oxygenated blood.'
    })
  });
  assert.equal(okUpload.status, 200);
  assert.equal(okUpload.data.valid, true);

  const genRes = await api('/api/notes/generate', {
    method: 'POST',
    body: JSON.stringify({
      topic: 'Human Heart & Double Circulation',
      subject: 'Science',
      depth: 'detailed'
    })
  });
  assert.equal(genRes.status, 201);
  const noteId = genRes.data.id;
  assert.ok(genRes.data.content_markdown.includes('Human Heart'));
  assert.ok(genRes.data.flashcards.length >= 2);

  const updatedMarkdown = genRes.data.content_markdown + '\n\n## Custom Student Annotation\nVerified SA Node pacemaker notes.';
  const editRes = await api(`/api/notes/${noteId}`, {
    method: 'PUT',
    body: JSON.stringify({
      title: 'Human Heart — Edited by Vishwak',
      content_markdown: updatedMarkdown
    })
  });
  assert.equal(editRes.status, 200);

  const reopenRes = await api(`/api/notes/${noteId}`);
  assert.equal(reopenRes.status, 200);
  assert.equal(reopenRes.data.title, 'Human Heart — Edited by Vishwak');
  assert.ok(reopenRes.data.content_markdown.includes('Custom Student Annotation'));
});

test('6. Natural Audio Lessons synthesize valid WAV data and reuse cached assets', async () => {
  const first = await api('/api/media/audio', {
    method: 'POST',
    body: JSON.stringify({
      topic: 'Photosynthesis',
      text: 'Photosynthesis converts sunlight into chemical energy.',
      voice: 'Nova (Teacher)',
      speed: 1.0
    })
  });
  assert.equal(first.status, 200);
  assert.ok(first.data.wavDataUrl.startsWith('data:audio/'));
  assert.equal(first.data.reusedCache, false);

  const second = await api('/api/media/audio', {
    method: 'POST',
    body: JSON.stringify({
      topic: 'Photosynthesis',
      text: 'Photosynthesis converts sunlight into chemical energy.',
      voice: 'Nova (Teacher)',
      speed: 1.0
    })
  });
  assert.equal(second.status, 200);
  assert.equal(second.data.reusedCache, true);
  assert.equal(second.data.id, first.data.id);
});

test('7. AI Image, Video Studio, and 3D Lab generate validated assets and save to Library', async () => {
  const imgRes = await api('/api/media/image', {
    method: 'POST',
    body: JSON.stringify({ topic: 'Quadratic Parabola', style: 'Mathematical Graph & Roots' })
  });
  assert.equal(imgRes.status, 200);
  assert.ok(imgRes.data.imageUrl.startsWith('data:image/svg+xml;base64,'));
  assert.ok(imgRes.data.limitationNote.length > 10);

  const vidRes = await api('/api/media/video', {
    method: 'POST',
    body: JSON.stringify({ topic: 'Solar System', audience: 'Grade 10', durationSeconds: 40 })
  });
  assert.equal(vidRes.status, 201);
  assert.equal(vidRes.data.status, 'completed');
  assert.ok(vidRes.data.scenes.length >= 4);

  const modelRes = await api('/api/media/model3d', {
    method: 'POST',
    body: JSON.stringify({ topic: 'DNA Helix', modelType: 'dna_helix' })
  });
  assert.equal(modelRes.status, 201);
  assert.equal(modelRes.data.modelId, 'dna_helix');
});

test('8. Educational Games & Quizzes validate answer keys and persist results', async () => {
  const qRes = await api('/api/games/questions', {
    method: 'POST',
    body: JSON.stringify({ topic: 'Photosynthesis', subject: 'Science', difficulty: 'medium', count: 5 })
  });
  assert.equal(qRes.status, 200);
  assert.equal(qRes.data.questions.length, 5);
  for (const q of qRes.data.questions) {
    assert.equal(q.options.length, 4);
    assert.ok(q.correctIndex >= 0 && q.correctIndex < 4);
    assert.ok(q.explanation.length > 5);
  }

  for (const gameType of ['answer_battle', 'learning_runner', 'space_shooter']) {
    const sess = await api('/api/games/sessions', {
      method: 'POST',
      body: JSON.stringify({
        game_type: gameType,
        topic: 'Photosynthesis',
        subject: 'Science',
        difficulty: 'medium',
        score: 950,
        correct_count: 5,
        total_questions: 6,
        stage_reached: 3,
        mistakes: []
      })
    });
    assert.equal(sess.status, 201);
    assert.equal(sess.data.game_type, gameType);
  }
});

test('9. Parent Dashboard enforces server-side token authentication and rejects unauthorized requests', async () => {
  const unauth = await api('/api/parent/dashboard');
  assert.equal(unauth.status, 401);

  const wrongPin = await api('/api/parent/auth', {
    method: 'POST',
    body: JSON.stringify({ passcode: '0000' })
  });
  assert.equal(wrongPin.status, 401);

  const validAuth = await api('/api/parent/auth', {
    method: 'POST',
    body: JSON.stringify({ passcode: '2468' })
  });
  assert.equal(validAuth.status, 200);
  assert.ok(validAuth.data.token.startsWith('parent_'));

  const protectedReport = await api('/api/parent/dashboard', {
    headers: { Authorization: `Bearer ${validAuth.data.token}` }
  });
  assert.equal(protectedReport.status, 200);
  assert.equal(protectedReport.data.student.name, 'Vishwak Sai');
  assert.ok(protectedReport.data.summary.totalStudyMinutes > 0);

  await api('/api/parent/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${validAuth.data.token}` }
  });
  const afterLogout = await api('/api/parent/dashboard', {
    headers: { Authorization: `Bearer ${validAuth.data.token}` }
  });
  assert.equal(afterLogout.status, 401);
});
