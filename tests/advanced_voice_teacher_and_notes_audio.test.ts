import test from 'node:test';
import assert from 'node:assert/strict';
import { voiceTeachingEngine, type AudioNarrationDepth, type AudioNarrationLanguage } from '../server/voiceTeachingEngine.ts';
import { getSubtopicDiagramsForTopic } from '../server/subtopicDiagramCatalog.ts';
import { cleanNotebookTextForAudioSpeech } from '../server/digitalNotebookPaginationEngine.ts';
import { generateNaturalAudioLesson } from '../server/aiAdapter.ts';
import { db, initDatabase } from '../server/db.ts';

// Ensure all schema migrations & tables are initialized
initDatabase();

const BENCHMARK_TOPICS = [
  { topic: 'Photosynthesis', subject: 'Biology', discipline: 'Biology' },
  { topic: 'Structure of the Human Heart', subject: 'Biology', discipline: 'Biology' },
  { topic: 'DNA Structure & Replication', subject: 'Biology', discipline: 'Biology' },
  { topic: "Newton's Laws of Force & Motion", subject: 'Physics', discipline: 'Physics' },
  { topic: 'Work, Power & Energy', subject: 'Physics', discipline: 'Physics' },
  { topic: 'Chemical Bonding (Ionic vs Covalent)', subject: 'Chemistry', discipline: 'Chemistry' },
  { topic: 'Fractions & Operations', subject: 'Mathematics', discipline: 'Mathematics' },
  { topic: 'Geometry & Pythagorean Theorem', subject: 'Mathematics', discipline: 'Mathematics' },
  { topic: 'World War II Timeline', subject: 'History', discipline: 'History' },
  { topic: "Earth's Hydrological Water Cycle", subject: 'Geography', discipline: 'Geography' },
  { topic: 'English Grammar & Sentence Syntax', subject: 'English', discipline: 'Language' },
  { topic: 'Binary Search Algorithm', subject: 'Computer Science', discipline: 'ComputerScience' }
];

test('Voice AI Tutor & Notes-to-Audio Suite: All 12 Benchmark Disciplines generate valid lesson plans', async () => {
  for (const item of BENCHMARK_TOPICS) {
    const lesson = await voiceTeachingEngine.prepareNarrationScriptForNote({
      noteId: `test-note-${item.topic.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      userId: 'test-user-1',
      topic: item.topic,
      subject: item.subject,
      grade: 10,
      board: 'CBSE',
      depth: 'detailed',
      language: 'en',
      contentMarkdown: `# ${item.topic}\n\nComprehensive notes on ${item.topic} for CBSE Class 10.`
    });

    assert.ok(lesson.sections.length >= 5, `${item.topic} should have at least 5 structured sections`);
    assert.ok(lesson.totalDurationSeconds > 30, `${item.topic} duration should be > 30s`);
    assert.strictEqual(lesson.topic, item.topic);
    assert.strictEqual(lesson.status, 'ready');

    // Section 1 should be Overview
    assert.ok(lesson.sections[0].title.includes('Overview') || lesson.sections[0].title.includes('Core'));
    assert.ok(lesson.sections[0].spokenText.length > 50);
  }
});

test('Depth Hierarchy: Exam Preparation mode is more comprehensive and includes worked numericals & traps', async () => {
  const normalLesson = await voiceTeachingEngine.prepareNarrationScriptForNote({
    noteId: 'test-depth-normal',
    userId: 'test-user-1',
    topic: 'Work, Power & Energy',
    subject: 'Physics',
    grade: 10,
    board: 'CBSE',
    depth: 'normal',
    language: 'en',
    contentMarkdown: '# Work, Power and Energy'
  });

  const examLesson = await voiceTeachingEngine.prepareNarrationScriptForNote({
    noteId: 'test-depth-exam',
    userId: 'test-user-1',
    topic: 'Work, Power & Energy',
    subject: 'Physics',
    grade: 10,
    board: 'CBSE',
    depth: 'exam',
    language: 'en',
    contentMarkdown: '# Work, Power and Energy'
  });

  // Exam lesson must have more sections (including Solved Numericals, Comparisons, Traps)
  assert.ok(
    examLesson.sections.length > normalLesson.sections.length,
    `Exam lesson (${examLesson.sections.length} sections) must have more sections than Normal lesson (${normalLesson.sections.length} sections)`
  );

  // Exam lesson must have longer duration
  assert.ok(
    examLesson.totalDurationSeconds > normalLesson.totalDurationSeconds,
    `Exam lesson total duration (${examLesson.totalDurationSeconds}s) must exceed Normal lesson (${normalLesson.totalDurationSeconds}s)`
  );

  // Verify Exam lesson includes Formula & Solved Numericals section
  const formulaSection = examLesson.sections.find((s) => s.category === 'Quantitative Mastery');
  assert.ok(formulaSection, 'Exam mode must have Quantitative Mastery / Solved Numerical section');
  assert.ok(formulaSection.spokenText.includes('governing') || formulaSection.spokenText.includes('formula'));

  // Verify Exam lesson includes Board Traps & Tips section
  const trapSection = examLesson.sections.find((s) => s.category === 'Exam Strategy');
  assert.ok(trapSection, 'Exam mode must have Exam Strategy / Board Traps section');
});

test('Visual & Diagram Spoken Narration: Generates 8-point spoken walkthrough with labeled components', async () => {
  const diagrams = getSubtopicDiagramsForTopic('Photosynthesis', 'Biology');
  assert.ok(diagrams.length > 0, 'Photosynthesis must have subtopic diagrams');

  const diag = diagrams[0];
  const narration = voiceTeachingEngine.generateDiagramSpokenNarration(diag, 'Photosynthesis', 'en');

  assert.ok(narration.spokenText.length > 80, 'Spoken walkthrough must be detailed');
  assert.ok(narration.whatItShows.length > 10, 'whatItShows must be populated');
  assert.ok(narration.importantComponents.length >= 2, 'importantComponents must have at least 2 labels');
  assert.ok(narration.stepByStepMechanism.length >= 3, 'stepByStepMechanism must have at least 3 steps');
  assert.ok(narration.studentTakeaway.includes('label') || narration.studentTakeaway.includes('exam'), 'studentTakeaway must advise on exam labeling');
  assert.ok(narration.sentences.length >= 3, 'Must be segmented into at least 3 sentences');
});

test('Multilingual Support: Telugu (తెలుగు) preserves exact scientific terminology and generates Telugu script', async () => {
  const teluguLesson = await voiceTeachingEngine.prepareNarrationScriptForNote({
    noteId: 'test-te-photo',
    userId: 'test-user-1',
    topic: 'Photosynthesis',
    subject: 'Biology',
    grade: 10,
    board: 'State Board',
    depth: 'detailed',
    language: 'te',
    contentMarkdown: '# Photosynthesis'
  });

  assert.strictEqual(teluguLesson.language, 'te');
  assert.ok(teluguLesson.teacherGreeting.includes('నమస్కారం'), 'Teacher greeting must be in Telugu');

  // Verify Telugu script Unicode presence
  const hasTeluguChars = /[\u0C00-\u0C7F]/.test(teluguLesson.sections[0].spokenText);
  assert.ok(hasTeluguChars, 'Spoken text must contain Telugu Unicode characters');

  // Verify scientific terms are preserved with parentheses or clear technical markers
  const fullScript = teluguLesson.sections.map((s) => s.spokenText).join(' ');
  assert.ok(
    fullScript.includes('Photosynthesis') || fullScript.includes('కిరణజన్య సంయోగక్రియ'),
    'Telugu narration must maintain accurate scientific term for Photosynthesis'
  );
});

test('Multilingual Support: Hindi (हिन्दी) preserves exact scientific terminology and generates Devanagari script', async () => {
  const hindiLesson = await voiceTeachingEngine.prepareNarrationScriptForNote({
    noteId: 'test-hi-photo',
    userId: 'test-user-1',
    topic: 'Photosynthesis',
    subject: 'Biology',
    grade: 10,
    board: 'CBSE',
    depth: 'detailed',
    language: 'hi',
    contentMarkdown: '# Photosynthesis'
  });

  assert.strictEqual(hindiLesson.language, 'hi');
  assert.ok(hindiLesson.teacherGreeting.includes('नमस्ते'), 'Teacher greeting must be in Hindi');

  // Verify Devanagari script Unicode presence
  const hasDevanagari = /[\u0900-\u097F]/.test(hindiLesson.sections[0].spokenText);
  assert.ok(hasDevanagari, 'Spoken text must contain Hindi Devanagari Unicode characters');

  const fullScript = hindiLesson.sections.map((s) => s.spokenText).join(' ');
  assert.ok(
    fullScript.includes('Photosynthesis') || fullScript.includes('प्रकाश-संश्लेषण'),
    'Hindi narration must maintain accurate scientific term for Photosynthesis'
  );
});

test('Interactive Interruption: Answers student questions in context and preserves resume position', async () => {
  const lesson = await voiceTeachingEngine.prepareNarrationScriptForNote({
    noteId: 'test-interrupt-1',
    userId: 'test-user-1',
    topic: 'Structure of the Human Heart',
    subject: 'Biology',
    depth: 'detailed',
    language: 'en',
    contentMarkdown: '# Human Heart'
  });

  // Test 1: "Explain that again"
  const repeatRes = await voiceTeachingEngine.handleInteractiveVoiceInterruption({
    noteAudioLesson: lesson,
    currentSectionIndex: 1,
    playbackSeconds: 14.5,
    studentQuestion: 'Can you explain that again?'
  });

  assert.ok(repeatRes.verbalAnswer.includes('review') || repeatRes.verbalAnswer.includes('repeat') || repeatRes.verbalAnswer.includes('section'));
  assert.strictEqual(repeatRes.resumeSectionIndex, 1);
  assert.strictEqual(repeatRes.resumeSeconds, 14.5);
  assert.ok(repeatRes.audioUrl?.startsWith('data:audio/'), 'Must synthesize spoken audio data URL for answer');

  // Test 2: "Explain this diagram"
  const diagRes = await voiceTeachingEngine.handleInteractiveVoiceInterruption({
    noteAudioLesson: lesson,
    currentSectionIndex: 2,
    playbackSeconds: 22.0,
    studentQuestion: 'Explain this diagram to me'
  });

  assert.ok(diagRes.verbalAnswer.length > 20);
  assert.strictEqual(diagRes.resumeSectionIndex, 2);
  assert.strictEqual(diagRes.resumeSeconds, 22.0);
});

test('Clean Educational Speech: Mathematical & Chemical formulas are transliterated into natural speech', () => {
  const chemFormula = '6 CO2 + 6 H2O -> C6H12O6 + 6 O2';
  const cleanChem = cleanNotebookTextForAudioSpeech(chemFormula, 'Photosynthesis');
  assert.ok(cleanChem.includes('Carbon Dioxide') && cleanChem.includes('Glucose') && cleanChem.includes('Oxygen'),
    'Chemical formula must be converted to spoken English molecule names');

  const physicsFormula = 'F = m * a';
  const cleanPhysics = cleanNotebookTextForAudioSpeech(physicsFormula, 'Force');
  assert.ok(cleanPhysics.includes('Force equals mass times acceleration'),
    'Physics formula must be spoken as Force equals mass times acceleration');
});

test('Speech Synthesis Pipeline: Generates valid normalized audio with real duration', async () => {
  const audio = await generateNaturalAudioLesson({
    topic: 'Photosynthesis',
    scriptText: 'Welcome to your photosynthesis study lesson. Plants use sunlight, water, and carbon dioxide to prepare glucose.',
    voice: 'Nova (Teacher)',
    speed: 1.0,
    language: 'en'
  });

  assert.ok(audio.wavDataUrl.startsWith('data:audio/'), 'Must return valid data:audio/ URL');
  assert.ok(audio.durationSeconds > 0, 'Duration must be positive');
  assert.ok(audio.audioValidation?.decodable, 'Audio must be decodable');
});

test('Database Persistence: note_audio_lessons table correctly stores and updates audio progress', () => {
  const testId = `nal-test-${Date.now()}`;
  const now = new Date().toISOString();

  // Find or insert test user
  let user = db.prepare('SELECT id FROM users LIMIT 1').get() as any;
  const userId = user ? user.id : 'test-uid-aud';
  if (!user) {
    db.prepare(`INSERT OR IGNORE INTO users (id, name, email, grade, board, avatar_url, streak_days, parent_passcode_hash, created_at)
      VALUES (?, 'Audio Tester', 'aud@test.com', 'Grade 10', 'CBSE', '', 0, '', ?)`).run(userId, now);
  }

  // Find or insert test note
  let note = db.prepare('SELECT id FROM notes WHERE user_id = ? LIMIT 1').get(userId) as any;
  const noteId = note ? note.id : 'note-aud-test';
  if (!note) {
    db.prepare(`INSERT OR IGNORE INTO notes (id, user_id, title, subject, topic, level, depth, notebook, content_markdown, structured_json, flashcards_json, quiz_json, source_type, created_at, updated_at)
      VALUES (?, ?, 'Photosynthesis Notes', 'Biology', 'Photosynthesis', 'Grade 10', 'detailed', 'General', '# Photosynthesis', '{}', '[]', '[]', 'topic', ?, ?)`).run(noteId, userId, now, now);
  }

  // Insert audio lesson
  db.prepare(`
    INSERT OR REPLACE INTO note_audio_lessons (
      id, note_id, user_id, depth, language, voice_name, status, lesson_title, total_duration_seconds, sections_json, current_playback_section, current_playback_seconds, created_at, updated_at
    ) VALUES (?, ?, ?, 'detailed', 'en', 'Nova', 'ready', 'Photosynthesis Audio Lesson', 120, '[]', 0, 0, ?, ?)
  `).run(testId, noteId, userId, now, now);

  const row = db.prepare('SELECT * FROM note_audio_lessons WHERE id = ?').get(testId) as any;
  assert.ok(row, 'Audio lesson must be saved in database');
  assert.strictEqual(row.depth, 'detailed');
  assert.strictEqual(row.total_duration_seconds, 120);

  // Update playback progress
  db.prepare(`UPDATE note_audio_lessons SET current_playback_section = 2, current_playback_seconds = 45.5 WHERE id = ?`).run(testId);
  const updated = db.prepare('SELECT current_playback_section, current_playback_seconds FROM note_audio_lessons WHERE id = ?').get(testId) as any;
  assert.strictEqual(updated.current_playback_section, 2);
  assert.strictEqual(updated.current_playback_seconds, 45.5);

  // Clean up test record
  db.prepare('DELETE FROM note_audio_lessons WHERE id = ?').run(testId);
});
