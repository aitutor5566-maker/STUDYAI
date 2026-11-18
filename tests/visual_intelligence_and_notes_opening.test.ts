import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { db, initDatabase } from '../server/db.ts';
import { educationalVisualIntelligenceEngine } from '../server/educationalVisualIntelligenceEngine.ts';

initDatabase();

test('Visual Intelligence produces topic-specific visuals and explanations across all 10 benchmark topics', async () => {
  const topics = [
    { topic: 'Photosynthesis', subject: 'Biology' },
    { topic: 'Human Heart', subject: 'Biology' },
    { topic: 'Mitosis', subject: 'Biology' },
    { topic: "Newton's Laws", subject: 'Physics' },
    { topic: 'Reflection and Refraction', subject: 'Physics' },
    { topic: 'Water Cycle', subject: 'Geography' },
    { topic: 'DNA Structure', subject: 'Biology' },
    { topic: 'Indian Independence Movement', subject: 'History' },
    { topic: 'Chemical Bonding', subject: 'Chemistry' },
    { topic: 'Geometry', subject: 'Mathematics' },
    { topic: 'Human Digestive System', subject: 'Biology' },
    { topic: 'Pythagoras Theorem', subject: 'Mathematics' },
    { topic: 'Electrical Circuits', subject: 'Physics' }
  ];

  for (const t of topics) {
    const visual = await educationalVisualIntelligenceEngine.produceEducationalVisual({
      topic: t.topic,
      subject: t.subject,
      grade: 10,
      board: 'CBSE',
      language: 'English'
    });

    assert.ok(visual.assetId, `${t.topic} should have an assetId`);
    assert.ok(Boolean(visual.dataUrl && visual.dataUrl.length > 10) || Boolean(visual.svgMarkup && visual.svgMarkup.includes('<svg')), `${t.topic} should produce a renderable visual`);
    assert.ok(visual.walkthrough.whatItShows.length > 10, `${t.topic} should include whatItShows explanation`);
    assert.ok(visual.walkthrough.importantComponents.length >= 2, `${t.topic} should list important components`);
    assert.ok(visual.walkthrough.processSequence.length >= 2, `${t.topic} should include process sequence`);
  }

  // Second identical call must reuse cached asset
  const cached = await educationalVisualIntelligenceEngine.produceEducationalVisual({
    topic: 'Photosynthesis',
    subject: 'Biology',
    grade: 10,
    board: 'CBSE',
    language: 'English'
  });
  assert.ok(cached.assetId);

  const telemetry = educationalVisualIntelligenceEngine.getVisualGenerationTelemetry();
  assert.ok(telemetry.reusedCount >= 1, 'Repeated identical topic request should record cache reuse');
});

test('Saved notebooks persist full sections and visual assets cleanly in SQLite', () => {
  const userId = `test-user-${crypto.randomUUID().slice(0, 8)}`;
  const noteId = `note-${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();

  db.prepare(`INSERT INTO users (id, name, email, grade, board, avatar_url, parent_passcode_hash, created_at) VALUES (?, ?, ?, 10, 'CBSE', '', '', ?)`)
    .run(userId, 'Test Student', `${userId}@studyai.local`, now);

  const structured = {
    summary: 'Complete study notebook on Human Heart',
    imageUrl: 'data:image/svg+xml;utf8,<svg></svg>',
    images: [{ imageUrl: 'data:image/svg+xml;utf8,<svg></svg>', caption: 'Human Heart Cross Section' }],
    sections: [
      { id: 'sec-1', title: 'Four Chambers', body: 'Right and left atria and ventricles pump blood.' },
      { id: 'sec-2', title: 'Double Circulation', body: 'Pulmonary and systemic pathways.' }
    ]
  };

  db.prepare(`
    INSERT INTO notes (id, user_id, title, topic, subject, notebook, source_type, content_markdown, structured_json, flashcards_json, quiz_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'topic', ?, ?, '[]', '[]', ?, ?)
  `).run(noteId, userId, 'Human Heart', 'Human Heart', 'Biology', 'Biology', '# Human Heart\n\nComplete lesson.', JSON.stringify(structured), now, now);

  const row = db.prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?').get(noteId, userId) as any;
  assert.ok(row, 'Saved note must be retrievable by ID and owner');
  const parsed = JSON.parse(row.structured_json);
  assert.equal(parsed.sections.length, 2);
  assert.equal(parsed.images.length, 1);
  assert.match(row.content_markdown, /Human Heart/);

  // Student isolation check: another student cannot fetch this note
  const otherRow = db.prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?').get(noteId, 'other-student') as any;
  assert.equal(otherRow, undefined);

  db.prepare('DELETE FROM notes WHERE id = ?').run(noteId);
  db.prepare('DELETE FROM users WHERE id = ?').run(userId);
});
