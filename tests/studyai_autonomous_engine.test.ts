import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { EventEmitter } from 'node:events';
import { createAppServer } from '../server/index.ts';
import {
  LocalKnowledgeBase,
  buildGuardedLLMPrompt,
  ModelMatchingRegistry,
  assemblePhotorealisticPrompt,
  StudyAiAutonomousEngine
} from '../server/studyAiAutonomousEngine.ts';

const serverInstance = createAppServer();
const TEST_STUDENT_ID = 'student-test-engine';

async function api(
  path: string,
  options: { method?: string; body?: string; headers?: Record<string, string> } = {},
  studentId = TEST_STUDENT_ID
) {
  return new Promise<{ status: number; data: any }>((resolve, reject) => {
    const req = new EventEmitter() as any;
    req.method = options.method || 'GET';
    req.url = path;
    req.socket = { remoteAddress: '127.0.0.1' };
    req.headers = {
      'x-student-id': studentId,
      'content-type': 'application/json',
      ...(options.headers || {})
    };

    let statusCode = 200;
    const resHeaders: Record<string, string> = {};
    let responseBody = '';

    const res = {
      writeHead(code: number, headers?: Record<string, string>) {
        statusCode = code;
        if (headers) Object.assign(resHeaders, headers);
        return res;
      },
      setHeader(name: string, value: string) {
        resHeaders[name.toLowerCase()] = value;
        return res;
      },
      end(chunk?: string | Buffer) {
        if (chunk) responseBody += chunk.toString();
        let parsed: any = responseBody;
        try {
          parsed = JSON.parse(responseBody);
        } catch {}
        resolve({ status: statusCode, data: parsed });
      }
    };

    serverInstance.emit('request', req, res);

    if (options.body) {
      req.emit('data', Buffer.from(options.body));
    }
    req.emit('end');
  });
}

test('Module 1: Structured Directory Hierarchy & Deterministic Zero-Hallucination Retrieval', () => {
  const kb = new LocalKnowledgeBase();

  // Verify Grade 1 to 10 folders exist
  for (let g = 1; g <= 10; g++) {
    const gradeDir = path.resolve(process.cwd(), 'data', 'textbooks', `Grade_${g}`);
    assert.ok(fs.existsSync(gradeDir), `Missing Grade_${g} directory`);
    assert.ok(fs.existsSync(path.join(gradeDir, 'Science')));
    assert.ok(fs.existsSync(path.join(gradeDir, 'Math')));
  }

  // Zero-Hallucination Gate: Query local Grade 10 Circulation
  const heartChunk = kb.query('Transportation in Human Beings', 10, 'Science');
  assert.ok(heartChunk, 'Failed to retrieve local textbook chunk for Heart/Circulation');
  assert.equal(heartChunk.grade_level, 10);
  assert.ok(heartChunk.content.includes('four chambers'));
  assert.ok(heartChunk.key_definitions['Double Circulation']);
  assert.equal(heartChunk.exam_pitfalls.length, 2);

  // Query local Grade 10 Electricity
  const electricChunk = kb.query('Electricity', 10, 'Science');
  assert.ok(electricChunk);
  assert.ok(electricChunk.content.includes('Ohm’s law'));
  assert.ok(electricChunk.formulas.some((f) => f.includes('V = I × R')));

  // Query local Grade 9 Sound
  const soundChunk = kb.query('Human Ear', 9, 'Science');
  assert.ok(soundChunk);
  assert.ok(soundChunk.content.includes('auditory ossicles'));
});

test('Module 2: Live LLM Routing & Execution Guardrails Wrapper', () => {
  const prompt = buildGuardedLLMPrompt(10, 'Thermodynamic Entropy', 15);
  assert.ok(prompt.startsWith('Role: Expert Academic Educator for Grade 10.'));
  assert.ok(prompt.includes('Target Student Age: ~15 years old.'));
  assert.ok(prompt.includes('Task: Explain Thermodynamic Entropy with absolute scientific and factual fidelity.'));
  assert.ok(prompt.includes('Strictly adhere to standard K-10 curriculum pedagogy.'));
  assert.ok(prompt.includes('No conversational fluff or meta-statements.'));
  assert.ok(prompt.includes('Zero factual compromise'));
});

test('Module 3: Curated Asset Registry & Google <model-viewer> Embedding', () => {
  const registry = new ModelMatchingRegistry();

  // Biology: Heart matching
  const matchHeart = registry.match3DModel('human heart double circulation');
  assert.ok(matchHeart);
  assert.equal(matchHeart.assetKey, 'human_heart');
  assert.ok(matchHeart.htmlBlock.includes('<model-viewer'));
  assert.ok(matchHeart.htmlBlock.includes('src="/assets/3d/human_heart.glb"'));
  assert.ok(matchHeart.htmlBlock.includes('auto-rotate'));
  assert.ok(matchHeart.htmlBlock.includes('background-color: #0f172a;'));

  // Physics: Electric Motor matching
  const matchMotor = registry.match3DModel('DC electric motor armature');
  assert.ok(matchMotor);
  assert.equal(matchMotor.assetKey, 'electric_motor');
  assert.ok(matchMotor.htmlBlock.includes('src="/assets/3d/electric_motor.glb"'));

  // Earth & Space: Volcano matching
  const matchVolcano = registry.match3DModel('stratovolcano eruption cross-section');
  assert.ok(matchVolcano);
  assert.equal(matchVolcano.assetKey, 'volcano');
});

test('Module 4: Photorealistic Visual Generation Pipeline & Negative Exclusion', () => {
  // Biological Anatomy prompt
  const bioPrompt = assemblePhotorealisticPrompt('Human Lung Alveoli', 'biology');
  assert.ok(bioPrompt.prompt.includes('Hasselblad H6D-100c'));
  assert.ok(bioPrompt.prompt.includes('subsurface scattering'));
  assert.ok(bioPrompt.prompt.includes('--no CGI, 3D render, digital illustration'));
  assert.ok(bioPrompt.hardwareOptics.includes('Hasselblad'));
  assert.ok(bioPrompt.labelRuleNotice.includes('Pure photographic capture without painted text'));

  // Physics & Chemistry laboratory prompt
  const physPrompt = assemblePhotorealisticPrompt('Electrolysis of Acidified Water', 'physics_chemistry');
  assert.ok(physPrompt.prompt.includes('Sony A7R V'));
  assert.ok(physPrompt.prompt.includes('1/8000s shutter speed'));
  assert.ok(physPrompt.prompt.includes('liquid refraction'));

  // Geography & Earth Science prompt
  const geoPrompt = assemblePhotorealisticPrompt('Mid-Atlantic Ridge Tectonic Rift', 'earth_geography');
  assert.ok(geoPrompt.prompt.includes('Phase One XF IQ4 150MP'));
  assert.ok(geoPrompt.prompt.includes('geological rock strata'));
});

test('Module 5: Pedagogical Output Delivery Pipeline with 6-Part Architecture', async () => {
  const engine = new StudyAiAutonomousEngine();

  // Test lesson generation for Grade 10 Heart Circulation
  const lesson = await engine.generateLesson('Transportation in Human Beings', 10, 'Science', 15);

  // 1. Core Concept (The "What")
  assert.ok(lesson.coreConcept.length > 30);
  assert.ok(lesson.coreConcept.includes('heart'));

  // 2. Interactive Visual Anchor
  assert.equal(lesson.visualAnchor.type, '3d_model_viewer');
  assert.ok(lesson.visualAnchor.htmlBlock.includes('<model-viewer'));

  // 3. Mechanistic Breakdown (The "How", 3 to 5 structured points)
  assert.ok(lesson.mechanisticBreakdown.length >= 3 && lesson.mechanisticBreakdown.length <= 5);

  // 4. Real-World Analogy
  assert.ok(lesson.realWorldAnalogy.length > 20);
  assert.ok(lesson.realWorldAnalogy.toLowerCase().includes('pump') || lesson.realWorldAnalogy.toLowerCase().includes('filter'));

  // 5. Study Notes & Exam Summary Table
  assert.ok(lesson.studyNotesTable.keyDefinitions.length >= 2);
  assert.ok(lesson.studyNotesTable.essentialFormulas.length >= 1);
  assert.equal(lesson.studyNotesTable.commonExamPitfalls.length, 2);

  // 6. Active Recall Check (Exactly 2 questions)
  assert.equal(lesson.activeRecallCheck.length, 2);
  assert.ok(lesson.activeRecallCheck[0].question);
  assert.ok(lesson.activeRecallCheck[1].question);

  // Source of Truth verification
  assert.equal(lesson.sourceOfTruth, 'local_verified_textbook');
});

test('Module 5 Backend Endpoint: POST /api/engine/lesson delivers verified pedagogical output', async () => {
  const res = await api('/api/engine/lesson', {
    method: 'POST',
    body: JSON.stringify({
      topic: 'Human Heart',
      gradeLevel: 10,
      subject: 'Science'
    })
  });

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  const l = res.data.lesson;
  assert.equal(l.gradeLevel, 10);
  assert.ok(l.coreConcept);
  assert.ok(l.visualAnchor);
  assert.ok(l.mechanisticBreakdown.length >= 3);
  assert.ok(l.realWorldAnalogy);
  assert.ok(l.studyNotesTable);
  assert.equal(l.activeRecallCheck.length, 2);
});
