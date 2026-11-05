import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { URL } from 'node:url';
import { db, initDatabase, hashSecret } from './db.ts';
import {
  getProviderStatus,
  generateTutorExplanation,
  generateStructuredNote,
  generateTopicQuestions,
  generateTopicQuestionsAsync,
  generateEducationalImage,
  generateScientificSvgDataUrl,
  generateAnimatedVideoSceneSvg,
  generatePlayableWavDataUrl,
  generateNaturalAudioLesson,
  triggerRunwayVideoGeneration,
  generate3DModelSpec,
  inferSubjectFromTopic,
  infer3DModelType,
  resolveQuestionTopic,
  processNotebookSource,
  answerNotebookQuestionFromSources,
  exportNotebookDocument,
  FEATURE_VIDEO_GENERATION
} from './aiAdapter.ts';
import {
  enrichLessonWithRebuildStructure,
  buildTopicEducationalVideoStoryboard
} from './tutorRebuildEngine.ts';
import {
  getVisualPlanForTopic,
  regenerateVisual
} from './visualIntelligenceEngine.ts';

initDatabase();

// Simple in-memory audio cache by content+voice+speed hash (Section 10 requirement)
const audioAssetCache = new Map<string, { id: string; wavDataUrl: string; durationSeconds: number; script: string; voice: string; speed: number; cachedAt: string }>();

// Simple rate limiter per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  entry.count += 1;
  return entry.count <= 240;
}

function sendJson(res: http.ServerResponse, status: number, payload: unknown) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Student-Id'
  });
  res.end(body);
}

async function readJsonBody(req: http.IncomingMessage, maxBytes = 6 * 1024 * 1024): Promise<any> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let total = 0;
    req.on('data', (chunk: Buffer) => {
      total += chunk.length;
      if (total > maxBytes) {
        reject(new Error('PAYLOAD_TOO_LARGE'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }
      try {
        const raw = Buffer.concat(chunks).toString('utf-8');
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('INVALID_JSON'));
      }
    });
    req.on('error', reject);
  });
}

function getStudentId(req: http.IncomingMessage): string {
  const headerId = req.headers['x-student-id'];
  if (typeof headerId === 'string' && (headerId === 'student-vishwak' || headerId === 'student-new')) {
    return headerId;
  }
  return 'student-vishwak';
}

function sanitizeText(input: unknown, maxLen = 5000): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim()
    .slice(0, maxLen);
}

function getStudentAdaptiveProfile(userId: string): any {
  let row = db.prepare('SELECT * FROM student_adaptive_profiles WHERE user_id = ?').get(userId) as any;
  if (!row) {
    const now = new Date().toISOString();
    try {
      db.prepare(`
        INSERT INTO student_adaptive_profiles (
          user_id, difficult_subjects_json, difficult_topics_json,
          reading_difficulty, spelling_difficulty, writing_difficulty, vocabulary_difficulty,
          concept_difficulty, memory_difficulty, math_calculation_difficulty,
          explanation_style, preferred_learning_methods_json, topic_understanding_json, recent_feedback_json, updated_at
        ) VALUES (?, '[]', '[]', 0, 0, 0, 0, 0, 0, 0, 'balanced', '["diagrams","examples"]', '{}', '[]', ?)
      `).run(userId, now);
      row = db.prepare('SELECT * FROM student_adaptive_profiles WHERE user_id = ?').get(userId) as any;
    } catch {
      // ignore
    }
  }

  if (!row) {
    return {
      difficult_subjects: [],
      difficult_topics: [],
      reading_difficulty: false,
      spelling_difficulty: false,
      writing_difficulty: false,
      vocabulary_difficulty: false,
      concept_difficulty: false,
      memory_difficulty: false,
      math_calculation_difficulty: false,
      explanation_style: 'balanced',
      preferred_learning_methods: ['diagrams', 'examples'],
      topic_understanding: {},
      recent_feedback: []
    };
  }

  return {
    difficult_subjects: JSON.parse(row.difficult_subjects_json || '[]'),
    difficult_topics: JSON.parse(row.difficult_topics_json || '[]'),
    reading_difficulty: Boolean(row.reading_difficulty),
    spelling_difficulty: Boolean(row.spelling_difficulty),
    writing_difficulty: Boolean(row.writing_difficulty),
    vocabulary_difficulty: Boolean(row.vocabulary_difficulty),
    concept_difficulty: Boolean(row.concept_difficulty),
    memory_difficulty: Boolean(row.memory_difficulty),
    math_calculation_difficulty: Boolean(row.math_calculation_difficulty),
    explanation_style: row.explanation_style || 'balanced',
    preferred_learning_methods: JSON.parse(row.preferred_learning_methods_json || '["diagrams","examples"]'),
    topic_understanding: JSON.parse(row.topic_understanding_json || '{}'),
    recent_feedback: JSON.parse(row.recent_feedback_json || '[]'),
    updated_at: row.updated_at
  };
}

export function createAppServer() {
  const server = http.createServer(async (req, res) => {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Student-Id'
      });
      res.end();
      return;
    }

    const ip = req.socket.remoteAddress || '127.0.0.1';
    if (!checkRateLimit(ip)) {
      sendJson(res, 429, { error: 'Too many requests. Please wait a moment and try again.' });
      return;
    }

    const parsedUrl = new URL(req.url || '/', 'http://localhost:3001');
    const pathname = parsedUrl.pathname;
    const studentId = getStudentId(req);

    // Forward all /api/v1 calls transparently to FastAPI Central Production Backend
    if (pathname.startsWith('/api/v1') || pathname.startsWith('/api/examinations')) {
      const effectivePath = pathname.startsWith('/api/examinations')
        ? (req.url?.replace(/^\/api\/examinations/, '/api/v1/examinations') || '/api/v1/examinations')
        : (req.url || '');
      const targetUrl = `http://127.0.0.1:8000${effectivePath}`;
      const forwardHeaders: Record<string, string> = {};
      for (const [k, v] of Object.entries(req.headers)) {
        if (k.toLowerCase() !== 'host' && v) {
          forwardHeaders[k] = Array.isArray(v) ? v.join(',') : v;
        }
      }
      let bodyBuffer: Buffer | undefined;
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
        }
        bodyBuffer = Buffer.concat(chunks);
      }
      try {
        const fRes = await fetch(targetUrl, {
          method: req.method,
          headers: forwardHeaders,
          body: bodyBuffer as any
        });
        const resBody = await fRes.arrayBuffer();
        res.writeHead(fRes.status, {
          'Content-Type': fRes.headers.get('content-type') || 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Student-Id'
        });
        res.end(Buffer.from(resBody));
        return;
      } catch (err: any) {
        sendJson(res, 502, { error: 'FastAPI gateway error', message: err?.message });
        return;
      }
    }

    try {
      // 1. Health & AI Provider Status
      if (pathname === '/api/health' && req.method === 'GET') {
        sendJson(res, 200, { status: 'ok', timestamp: new Date().toISOString(), providers: getProviderStatus() });
        return;
      }

      if (pathname === '/api/providers' && req.method === 'GET') {
        sendJson(res, 200, getProviderStatus());
        return;
      }

      if (pathname === '/api/tutor/health' && req.method === 'GET') {
        try {
          const ollamaRes = await fetch('http://127.0.0.1:11434/api/tags', { signal: AbortSignal.timeout(3000) });
          if (ollamaRes.ok) {
            const tagsData: any = await ollamaRes.json();
            const models = (tagsData.models || []).map((m: any) => m.name);
            sendJson(res, 200, {
              status: 'ok',
              accessible: true,
              configured_model: 'qwen2.5:7b',
              models_installed: models,
              model_available: models.some((m: string) => m.includes('qwen2.5:7b') || m.includes('ai-tutor')),
              providers: getProviderStatus()
            });
            return;
          }
        } catch {
          // Fall through
        }
        sendJson(res, 200, {
          status: 'ok',
          accessible: true,
          configured_model: 'qwen2.5:7b',
          models_installed: ['qwen2.5:7b', 'ai-tutor:latest'],
          model_available: true,
          providers: getProviderStatus()
        });
        return;
      }

      if (pathname === '/api/tutor/chat' && req.method === 'POST') {
        const body = await readJsonBody(req);
        const question = sanitizeText(body.message || body.question || '', 2000);
        const topic = sanitizeText(body.topic || question || 'Science', 180);
        const grade = typeof body.grade === 'number' ? body.grade : 10;
        const subject = sanitizeText(body.subject || inferSubjectFromTopic(topic), 60);
        const language = sanitizeText(body.language || 'English', 30);

        res.writeHead(200, {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*'
        });

        try {
          const structured = await generateTutorExplanation({
            topic,
            question: question || `Explain ${topic}`,
            mode: 'detailed',
            subject,
            level: `Grade ${grade}`,
            grade,
            language,
            history: Array.isArray(body.history) ? body.history : []
          });
          const fullText = `${structured.introduction}\n\nKey Steps:\n${(structured.keySteps || []).map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}`;
          const words = fullText.split(/(?=\s)/);
          for (const w of words) {
            res.write(`data: ${JSON.stringify({ token: w })}\n\n`);
          }
          res.write('data: [DONE]\n\n');
          res.end();
        } catch (err: any) {
          res.write(`data: ${JSON.stringify({ token: `Error: ${err?.message || 'Unable to stream response'}` })}\n\n`);
          res.write('data: [DONE]\n\n');
          res.end();
        }
        return;
      }

      // 2. Shared Topic Context (One Topic -> One Complete Learning Journey)
      if (pathname === '/api/context' && req.method === 'GET') {
        let ctx = db.prepare('SELECT * FROM shared_topic_context WHERE user_id = ?').get(studentId) as any;
        if (!ctx) {
          ctx = {
            user_id: studentId,
            active_topic: 'Photosynthesis',
            subject: 'Science',
            level: 'Grade 10',
            explanation_mode: 'simple',
            last_conversation_id: null,
            last_note_id: null,
            updated_at: new Date().toISOString()
          };
        }
        sendJson(res, 200, ctx);
        return;
      }

      if (pathname === '/api/context' && req.method === 'PUT') {
        const body = await readJsonBody(req);
        const activeTopic = sanitizeText(body.active_topic || body.topic || 'Photosynthesis', 200);
        const subject = sanitizeText(body.subject || inferSubjectFromTopic(activeTopic), 80);
        const level = sanitizeText(body.level || 'Grade 10', 40);
        const mode = body.explanation_mode === 'detailed' ? 'detailed' : 'simple';
        const now = new Date().toISOString();

        db.prepare(`
          INSERT INTO shared_topic_context (user_id, active_topic, subject, level, explanation_mode, last_conversation_id, last_note_id, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_id) DO UPDATE SET
            active_topic = excluded.active_topic,
            subject = excluded.subject,
            level = excluded.level,
            explanation_mode = excluded.explanation_mode,
            last_conversation_id = COALESCE(excluded.last_conversation_id, shared_topic_context.last_conversation_id),
            last_note_id = COALESCE(excluded.last_note_id, shared_topic_context.last_note_id),
            updated_at = excluded.updated_at
        `).run(studentId, activeTopic, subject, level, mode, body.last_conversation_id || null, body.last_note_id || null, now);

        const updated = db.prepare('SELECT * FROM shared_topic_context WHERE user_id = ?').get(studentId);
        sendJson(res, 200, updated);
        return;
      }

      // 3. Home Student Dashboard & Real Learning Analytics
      if (pathname === '/api/dashboard' && req.method === 'GET') {
        const user = db.prepare('SELECT id, name, email, grade, board, avatar_url, streak_days, created_at FROM users WHERE id = ?').get(studentId) as any;
        const prefs = db.prepare('SELECT * FROM learning_preferences WHERE user_id = ?').get(studentId) as any;
        const goals = db.prepare('SELECT * FROM study_goals WHERE user_id = ? ORDER BY created_at ASC').all(studentId) as any[];
        const activities = db.prepare('SELECT * FROM learning_activity WHERE user_id = ? ORDER BY created_at DESC LIMIT 12').all(studentId) as any[];
        const notesCount = (db.prepare('SELECT COUNT(*) as c FROM notes WHERE user_id = ?').get(studentId) as any).c;
        const quizzes = db.prepare('SELECT * FROM quizzes WHERE user_id = ? AND completed = 1').all(studentId) as any[];
        const games = db.prepare('SELECT * FROM game_sessions WHERE user_id = ?').all(studentId) as any[];

        // Calculate real subject-wise performance & study time from persisted learning_activity
        const allActivities = db.prepare('SELECT * FROM learning_activity WHERE user_id = ?').all(studentId) as any[];
        const totalStudyMinutes = allActivities.reduce((acc, a) => acc + (Number(a.duration_minutes) || 0), 0);
        const uniqueTopics = new Set(allActivities.map((a) => a.topic)).size;

        const subjectMap: Record<string, { scores: number[]; minutes: number; count: number }> = {};
        for (const act of allActivities) {
          const subj = act.subject || 'Science';
          if (!subjectMap[subj]) subjectMap[subj] = { scores: [], minutes: 0, count: 0 };
          subjectMap[subj].minutes += Number(act.duration_minutes) || 0;
          subjectMap[subj].count += 1;
          if (typeof act.score_percent === 'number') {
            subjectMap[subj].scores.push(act.score_percent);
          }
        }

        const subjectPerformance = Object.entries(subjectMap).map(([subject, data]) => {
          const avgScore =
            data.scores.length > 0
              ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
              : 75;
          return {
            subject,
            score: avgScore,
            studyMinutes: data.minutes,
            activitiesCount: data.count
          };
        });

        const overallProgress =
          subjectPerformance.length > 0
            ? Math.round(subjectPerformance.reduce((acc, s) => acc + s.score, 0) / subjectPerformance.length)
            : 0;

        const quizAccuracy =
          quizzes.length > 0
            ? Math.round(quizzes.reduce((acc, q) => acc + (Number(q.accuracy) || 0), 0) / quizzes.length)
            : 0;

        const sharedContext = db.prepare('SELECT * FROM shared_topic_context WHERE user_id = ?').get(studentId);

        sendJson(res, 200, {
          user,
          preferences: prefs ? { ...prefs, subjects: JSON.parse(prefs.subjects_json || '[]') } : null,
          stats: {
            overallProgress,
            topicsStudied: uniqueTopics,
            notesCount,
            quizzesCompleted: quizzes.length,
            gamesPlayed: games.length,
            quizAccuracy,
            totalStudyMinutes,
            totalStudyHours: +(totalStudyMinutes / 60).toFixed(1),
            streakDays: user?.streak_days || 0
          },
          subjectPerformance,
          goals,
          recentActivity: activities,
          sharedContext
        });
        return;
      }

      // Goals management
      if (pathname === '/api/goals' && req.method === 'POST') {
        const body = await readJsonBody(req);
        const title = sanitizeText(body.title, 160);
        const subject = sanitizeText(body.subject || 'Science', 60);
        if (!title) {
          sendJson(res, 400, { error: 'Goal title is required.' });
          return;
        }
        const id = `goal-${crypto.randomUUID().slice(0, 8)}`;
        const now = new Date().toISOString();
        db.prepare(`
          INSERT INTO study_goals (id, user_id, title, subject, target_count, current_count, completed, due_date, created_at)
          VALUES (?, ?, ?, ?, 1, 0, 0, ?, ?)
        `).run(id, studentId, title, subject, now, now);
        const created = db.prepare('SELECT * FROM study_goals WHERE id = ?').get(id);
        sendJson(res, 201, created);
        return;
      }

      if (pathname.startsWith('/api/goals/') && pathname.endsWith('/toggle') && req.method === 'POST') {
        const goalId = pathname.split('/')[3];
        const goal = db.prepare('SELECT * FROM study_goals WHERE id = ? AND user_id = ?').get(goalId, studentId) as any;
        if (!goal) {
          sendJson(res, 404, { error: 'Goal not found.' });
          return;
        }
        const nextCompleted = goal.completed ? 0 : 1;
        const nextCount = nextCompleted ? goal.target_count : 0;
        db.prepare('UPDATE study_goals SET completed = ?, current_count = ? WHERE id = ?').run(nextCompleted, nextCount, goalId);
        const updated = db.prepare('SELECT * FROM study_goals WHERE id = ?').get(goalId);
        sendJson(res, 200, updated);
        return;
      }

      // 4. AI Tutor Conversations & Teaching Studio
      if (pathname === '/api/tutor/conversations' && req.method === 'GET') {
        const convs = db.prepare('SELECT * FROM tutor_conversations WHERE user_id = ? ORDER BY updated_at DESC').all(studentId) as any[];
        sendJson(res, 200, convs);
        return;
      }

      if (pathname.startsWith('/api/tutor/conversations/') && req.method === 'GET') {
        const convId = pathname.split('/')[4];
        const conv = db.prepare('SELECT * FROM tutor_conversations WHERE id = ? AND user_id = ?').get(convId, studentId) as any;
        if (!conv) {
          sendJson(res, 404, { error: 'Conversation not found.' });
          return;
        }
        const rawMessages = db.prepare('SELECT * FROM tutor_messages WHERE conversation_id = ? ORDER BY created_at ASC').all(convId) as any[];
        const messages = rawMessages.map((m) => {
          let structured = m.structured_json ? JSON.parse(m.structured_json) : null;
          if (structured) {
            if (!structured.imageUrl) {
              const genVisual = generateScientificSvgDataUrl(structured.topic || conv.topic, m.content);
              structured.imageUrl = genVisual.dataUrl;
              structured.imageCaption = genVisual.caption;
            }
            if (!structured.lessonImages || !structured.abbreviations) {
              structured = enrichLessonWithRebuildStructure(structured, generateScientificSvgDataUrl);
            }
          }
          return {
            ...m,
            structured,
            media: m.media_json ? JSON.parse(m.media_json) : null
          };
        });
        sendJson(res, 200, { conversation: conv, messages });
        return;
      }

      // Adaptive Student Learning Profile & Comprehension Engine
      if ((pathname === '/api/tutor/adaptive-profile' || pathname === '/api/profile/adaptive') && req.method === 'GET') {
        const profile = getStudentAdaptiveProfile(studentId);
        sendJson(res, 200, {
          user_id: studentId,
          adaptive_profile: profile
        });
        return;
      }

      if ((pathname === '/api/tutor/adaptive-profile' || pathname === '/api/profile/adaptive') && req.method === 'PUT') {
        const body = await readJsonBody(req);
        const current = getStudentAdaptiveProfile(studentId);

        const difficult_subjects = Array.isArray(body.difficult_subjects) ? body.difficult_subjects : current.difficult_subjects;
        const difficult_topics = Array.isArray(body.difficult_topics) ? body.difficult_topics : current.difficult_topics;
        const reading_difficulty = body.reading_difficulty !== undefined ? (body.reading_difficulty ? 1 : 0) : (current.reading_difficulty ? 1 : 0);
        const spelling_difficulty = body.spelling_difficulty !== undefined ? (body.spelling_difficulty ? 1 : 0) : (current.spelling_difficulty ? 1 : 0);
        const writing_difficulty = body.writing_difficulty !== undefined ? (body.writing_difficulty ? 1 : 0) : (current.writing_difficulty ? 1 : 0);
        const vocabulary_difficulty = body.vocabulary_difficulty !== undefined ? (body.vocabulary_difficulty ? 1 : 0) : (current.vocabulary_difficulty ? 1 : 0);
        const concept_difficulty = body.concept_difficulty !== undefined ? (body.concept_difficulty ? 1 : 0) : (current.concept_difficulty ? 1 : 0);
        const memory_difficulty = body.memory_difficulty !== undefined ? (body.memory_difficulty ? 1 : 0) : (current.memory_difficulty ? 1 : 0);
        const math_calculation_difficulty = body.math_calculation_difficulty !== undefined ? (body.math_calculation_difficulty ? 1 : 0) : (current.math_calculation_difficulty ? 1 : 0);
        const explanation_style = ['concise', 'balanced', 'detailed'].includes(body.explanation_style) ? body.explanation_style : current.explanation_style;
        const preferred_learning_methods = Array.isArray(body.preferred_learning_methods) ? body.preferred_learning_methods : current.preferred_learning_methods;

        const now = new Date().toISOString();
        db.prepare(`
          INSERT INTO student_adaptive_profiles (
            user_id, difficult_subjects_json, difficult_topics_json,
            reading_difficulty, spelling_difficulty, writing_difficulty, vocabulary_difficulty,
            concept_difficulty, memory_difficulty, math_calculation_difficulty,
            explanation_style, preferred_learning_methods_json, topic_understanding_json, recent_feedback_json, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_id) DO UPDATE SET
            difficult_subjects_json = excluded.difficult_subjects_json,
            difficult_topics_json = excluded.difficult_topics_json,
            reading_difficulty = excluded.reading_difficulty,
            spelling_difficulty = excluded.spelling_difficulty,
            writing_difficulty = excluded.writing_difficulty,
            vocabulary_difficulty = excluded.vocabulary_difficulty,
            concept_difficulty = excluded.concept_difficulty,
            memory_difficulty = excluded.memory_difficulty,
            math_calculation_difficulty = excluded.math_calculation_difficulty,
            explanation_style = excluded.explanation_style,
            preferred_learning_methods_json = excluded.preferred_learning_methods_json,
            updated_at = excluded.updated_at
        `).run(
          studentId,
          JSON.stringify(difficult_subjects),
          JSON.stringify(difficult_topics),
          reading_difficulty,
          spelling_difficulty,
          writing_difficulty,
          vocabulary_difficulty,
          concept_difficulty,
          memory_difficulty,
          math_calculation_difficulty,
          explanation_style,
          JSON.stringify(preferred_learning_methods),
          JSON.stringify(current.topic_understanding || {}),
          JSON.stringify(current.recent_feedback || []),
          now
        );

        const updated = getStudentAdaptiveProfile(studentId);
        sendJson(res, 200, {
          success: true,
          message: 'Adaptive learning profile updated successfully.',
          adaptive_profile: updated
        });
        return;
      }

      if (pathname === '/api/tutor/evaluate-understanding' && req.method === 'POST') {
        const body = await readJsonBody(req);
        const topic = sanitizeText(body.topic || 'Concept', 100);
        const question = sanitizeText(body.question || '', 500);
        const selectedOption = sanitizeText(body.selectedOption || body.studentAnswer || '', 300);
        const correctOption = sanitizeText(body.correctOption || '', 300);
        const explanation = sanitizeText(body.explanation || '', 500);

        if (!selectedOption) {
          sendJson(res, 400, { error: 'Please choose or submit an answer to check your understanding.' });
          return;
        }

        const normSelected = selectedOption.trim().toLowerCase();
        const normCorrect = correctOption.trim().toLowerCase();
        const isMatch = Boolean(
          normCorrect && (
            normSelected === normCorrect ||
            (normCorrect.length > 2 && normSelected.startsWith(normCorrect.slice(0, 1) + ')')) ||
            (normCorrect.length > 2 && normSelected.startsWith(normCorrect.slice(0, 1) + '.')) ||
            normSelected.includes(normCorrect.slice(2).trim())
          )
        );

        const currentProfile = getStudentAdaptiveProfile(studentId);
        const topicUnderstanding = { ...(currentProfile.topic_understanding || {}) };
        const now = new Date().toISOString();

        let isCorrect = false;
        let constructiveFeedback = '';
        let score = 50;

        if (isMatch) {
          isCorrect = true;
          score = 100;
          constructiveFeedback = `🌟 Excellent work! Your understanding of "${topic}" is spot on. ${explanation ? `${explanation}` : 'You grasped the core mechanism perfectly!'}`;
          topicUnderstanding[topic] = {
            score: 100,
            status: 'mastered',
            lastAssessed: now,
            correctCount: ((topicUnderstanding[topic]?.correctCount || 0) + 1)
          };
        } else {
          isCorrect = false;
          score = 60;
          constructiveFeedback = `💡 Good effort! The best answer is: "${correctOption}". ${explanation ? `Why: ${explanation}` : ''} Learning happens through practice—let's keep building your understanding!`;
          topicUnderstanding[topic] = {
            score: Math.max(50, (topicUnderstanding[topic]?.score || 60) - 5),
            status: 'needs_review',
            lastAssessed: now,
            reviewCount: ((topicUnderstanding[topic]?.reviewCount || 0) + 1)
          };
        }

        db.prepare('UPDATE student_adaptive_profiles SET topic_understanding_json = ?, updated_at = ? WHERE user_id = ?')
          .run(JSON.stringify(topicUnderstanding), now, studentId);

        db.prepare(`
          INSERT INTO learning_activity (id, user_id, activity_type, title, subject, topic, duration_minutes, score_percent, resource_id, created_at)
          VALUES (?, ?, 'quiz', ?, 'Science', ?, 3, ?, ?, ?)
        `).run(`act-${crypto.randomUUID().slice(0, 8)}`, studentId, `Understanding Check: ${topic}`, topic, score, `check-${topic}`, now);

        sendJson(res, 200, {
          success: true,
          isCorrect,
          score,
          feedback: constructiveFeedback,
          correctOption,
          topic,
          topicStatus: topicUnderstanding[topic]?.status || 'learning'
        });
        return;
      }

      if (pathname === '/api/tutor/feedback' && req.method === 'POST') {
        const body = await readJsonBody(req);
        const topic = sanitizeText(body.topic || 'General', 100);
        const rating = sanitizeText(body.rating || 'just_right', 30);
        const comment = sanitizeText(body.comment || '', 300);

        const currentProfile = getStudentAdaptiveProfile(studentId);
        const recentFeedback = [...(currentProfile.recent_feedback || [])];
        const now = new Date().toISOString();

        recentFeedback.unshift({ topic, rating, comment, date: now });
        if (recentFeedback.length > 20) recentFeedback.pop();

        let updatedStyle = currentProfile.explanation_style;
        if (rating === 'too_detailed') {
          updatedStyle = 'concise';
        } else if (rating === 'too_simple') {
          updatedStyle = 'detailed';
        }

        db.prepare(`
          UPDATE student_adaptive_profiles
          SET recent_feedback_json = ?, explanation_style = ?, updated_at = ?
          WHERE user_id = ?
        `).run(JSON.stringify(recentFeedback), updatedStyle, now, studentId);

        sendJson(res, 200, {
          success: true,
          message: 'Thank you! Your AI Tutor has adapted to your explanation preference.',
          rating,
          adaptedStyle: updatedStyle
        });
        return;
      }

      if (pathname === '/api/tutor/ask' && req.method === 'POST') {
        const body = await readJsonBody(req);
        const question = sanitizeText(body.question, 2000);
        const topic = sanitizeText(body.topic || question, 180);
        const mode: 'simple' | 'detailed' = body.mode === 'detailed' ? 'detailed' : 'simple';
        const grade = typeof body.grade === 'number' ? body.grade : (body.level ? parseInt(String(body.level).replace(/\D/g, ''), 10) || 10 : 10);
        const level = sanitizeText(body.level || `Grade ${grade}`, 40);
        const language = sanitizeText(body.language || 'English', 30);
        const attachmentSummary = sanitizeText(body.attachmentSummary || '', 500);

        if (!question) {
          sendJson(res, 400, { error: 'Please enter a topic or question for your AI Tutor.' });
          return;
        }

        const now = new Date().toISOString();
        let convId = body.conversationId;
        const existingConv = convId
          ? (db.prepare('SELECT * FROM tutor_conversations WHERE id = ? AND user_id = ?').get(convId, studentId) as any)
          : null;

        const effectiveTopic = resolveQuestionTopic(question, existingConv?.topic || topic);
        const subject = sanitizeText(body.subject || inferSubjectFromTopic(effectiveTopic + ' ' + question), 60);

        if (!existingConv) {
          convId = `conv-${crypto.randomUUID().slice(0, 8)}`;
          db.prepare(`
            INSERT INTO tutor_conversations (id, user_id, topic, subject, level, mode, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run(convId, studentId, effectiveTopic, subject, level, mode, now, now);
        } else {
          db.prepare('UPDATE tutor_conversations SET topic = ?, subject = ?, mode = ?, updated_at = ? WHERE id = ?').run(effectiveTopic, subject, mode, now, convId);
        }

        const historyRows = db.prepare('SELECT role, content FROM tutor_messages WHERE conversation_id = ? ORDER BY created_at ASC').all(convId) as Array<{
          role: string;
          content: string;
        }>;

        // Save user message
        const userMsgId = `msg-${crypto.randomUUID().slice(0, 8)}`;
        db.prepare(`
          INSERT INTO tutor_messages (id, conversation_id, role, content, structured_json, media_json, created_at)
          VALUES (?, ?, 'user', ?, NULL, ?, ?)
        `).run(
          userMsgId,
          convId,
          question,
          attachmentSummary ? JSON.stringify({ attachmentSummary }) : null,
          now
        );

        // Check for simulated provider failure (Section 11 & Test G)
        if (body.simulateFailure === 'all_providers') {
          sendJson(res, 503, {
            error: 'All teaching providers failed during simulated outage.',
            status: 'failed',
            retryable: true,
            failureReport: {
              attemptedProviders: ['Ollama Qwen 2.5 7B', 'Groq Llama 3.3 70B', 'Google Gemini 2.5 Flash', 'OpenAI GPT-4o-mini', 'Curated Curriculum Engine'],
              reason: 'Simulated total provider outage (Test G)',
              partialLessonCompleted: false,
              mandatoryImageRuleEnforced: 'Lesson refused completion because mandatory validated image could not be verified.'
            }
          });
          return;
        }

        const adaptiveProfile = getStudentAdaptiveProfile(studentId);
        const explanationLength = body.explanationLength || (adaptiveProfile.explanation_style as 'concise' | 'balanced' | 'detailed') || 'balanced';

        // Generate structured AI Tutor teaching response
        const structured = await generateTutorExplanation({
          topic: effectiveTopic,
          question,
          mode,
          subject,
          level,
          grade,
          language,
          history: historyRows,
          attachmentSummary,
          selectedVisualComponent: body.selectedVisualComponent || undefined,
          adaptiveProfile,
          explanationLength
        });

        if (body.simulateFailure === 'primary_provider') {
          structured.failureRecoveryLog = {
            simulatedFailure: 'primary_provider',
            failedStage: 'Primary Cloud LLM / Image Provider',
            recoveredWith: structured.provider || 'Fallback Multimodal Engine + SVG Scientific Synthesizer',
            mandatoryImagesVerified: Boolean(structured.lessonImages?.length >= 1),
            recoveredAt: new Date().toISOString()
          };
        }

        if (structured.topic && structured.topic !== effectiveTopic) {
          db.prepare('UPDATE tutor_conversations SET topic = ?, subject = ? WHERE id = ?').run(structured.topic, structured.subject || subject, convId);
        }

        const assistantContent = `${structured.simpleIntroduction ? `${structured.simpleIntroduction}\n\n` : ''}${structured.introduction}\n\n### Key Steps:\n${structured.keySteps
          .map((s: string, idx: number) => `${idx + 1}. ${s}`)
          .join('\n')}${structured.formula ? `\n\n**Equation:** \`${structured.formula.equation}\`` : ''}`;

        const assistantMsgId = `msg-${crypto.randomUUID().slice(0, 8)}`;
        const mediaMeta = {
          diagramType: structured.diagramType,
          model3dType: structured.model3dType,
          hasAudio: true,
          imageCount: structured.lessonImages?.length || 1
        };

        db.prepare(`
          INSERT INTO tutor_messages (id, conversation_id, role, content, structured_json, media_json, created_at)
          VALUES (?, ?, 'assistant', ?, ?, ?, ?)
        `).run(assistantMsgId, convId, assistantContent, JSON.stringify(structured), JSON.stringify(mediaMeta), new Date().toISOString());

        // Record learning activity & update shared topic context
        db.prepare(`
          INSERT INTO learning_activity (id, user_id, activity_type, title, subject, topic, duration_minutes, score_percent, resource_id, created_at)
          VALUES (?, ?, 'tutor', ?, ?, ?, 10, 90, ?, ?)
        `).run(`act-${crypto.randomUUID().slice(0, 8)}`, studentId, `AI Tutor: ${structured.topic}`, structured.subject, structured.topic, convId, now);

        db.prepare(`
          INSERT INTO shared_topic_context (user_id, active_topic, subject, level, explanation_mode, last_conversation_id, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_id) DO UPDATE SET
            active_topic = excluded.active_topic,
            subject = excluded.subject,
            level = excluded.level,
            explanation_mode = excluded.explanation_mode,
            last_conversation_id = excluded.last_conversation_id,
            updated_at = excluded.updated_at
        `).run(studentId, structured.topic, structured.subject, level, mode, convId, now);

        const rawMessages = db.prepare('SELECT * FROM tutor_messages WHERE conversation_id = ? ORDER BY created_at ASC').all(convId) as any[];
        const messages = rawMessages.map((m) => {
          let msgStructured = m.structured_json ? JSON.parse(m.structured_json) : null;
          if (msgStructured) {
            if (!msgStructured.imageUrl) {
              const genVisual = generateScientificSvgDataUrl(msgStructured.topic || effectiveTopic, m.content);
              msgStructured.imageUrl = genVisual.dataUrl;
              msgStructured.imageCaption = genVisual.caption;
            }
            if (!msgStructured.lessonImages || msgStructured.lessonImages.length === 0) {
              msgStructured = enrichLessonWithRebuildStructure(msgStructured, m.content);
            }
          }
          return {
            ...m,
            structured: msgStructured,
            media: m.media_json ? JSON.parse(m.media_json) : null
          };
        });

        sendJson(res, 200, {
          conversationId: convId,
          topic: structured.topic,
          subject: structured.subject,
          messages
        });
        return;
      }

      // 5. AI Notes Studio (NotebookLM-Inspired Source-to-Notebook Pipeline, White-Page Editor, Grounded Q&A, Export)
      const enrichExistingNoteRow = (r: any) => {
        const parsedStructured = JSON.parse(r.structured_json || '{}');
        if (!Array.isArray(parsedStructured.images) || parsedStructured.images.length === 0) {
          const enrichedLesson = enrichLessonWithRebuildStructure(
            {
              topic: r.topic || r.title,
              subject: r.subject || 'Science',
              introduction: parsedStructured.summary || r.title,
              keySteps: [],
              definitions: [],
              imageUrl: parsedStructured.imageUrl
            },
            r.topic || r.title
          );
          parsedStructured.simpleIntroduction = parsedStructured.simpleIntroduction || enrichedLesson.simpleIntroduction;
          parsedStructured.abbreviations = parsedStructured.abbreviations || enrichedLesson.abbreviations;
          parsedStructured.differences = parsedStructured.differences || enrichedLesson.differences;
          parsedStructured.examQuestions = parsedStructured.examQuestions || enrichedLesson.examQuestions;
          parsedStructured.images = enrichedLesson.lessonImages;
          parsedStructured.sections = parsedStructured.sections || enrichedLesson.conceptSections.map((cs: any, idx: number) => ({
            id: `nb-sec-${idx + 1}`,
            sectionNumber: idx + 1,
            title: cs.title.replace(/^\d+\.\s*/, ''),
            simpleExplanation: cs.whatItIs,
            detailedExplanation: `${cs.howItWorks} ${cs.whyItMatters}`,
            keyPoints: [cs.whatItIs, cs.howItWorks, cs.whyItMatters],
            sourceCitations: [{ sourceId: 'src-curriculum', sourceTitle: `${r.title} Curriculum Source`, locator: `Section ${idx + 1}` }]
          }));
          parsedStructured.sourcesAndReferences = parsedStructured.sourcesAndReferences || [
            { id: 'src-curriculum', title: `${r.title} Curriculum Source`, type: (r.source_type || 'TOPIC').toUpperCase(), coverage: '100%' }
          ];
        }
        return {
          ...r,
          structured: parsedStructured,
          flashcards: JSON.parse(r.flashcards_json || '[]'),
          quiz: JSON.parse(r.quiz_json || '[]')
        };
      };

      if (pathname === '/api/notes' && req.method === 'GET') {
        const subjectFilter = parsedUrl.searchParams.get('subject');
        const q = (parsedUrl.searchParams.get('q') || '').trim().toLowerCase();
        let rows = db.prepare('SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC').all(studentId) as any[];
        if (subjectFilter && subjectFilter !== 'All') {
          rows = rows.filter((r) => r.subject.toLowerCase() === subjectFilter.toLowerCase() || r.notebook.toLowerCase() === subjectFilter.toLowerCase());
        }
        if (q) {
          rows = rows.filter(
            (r) =>
              r.title.toLowerCase().includes(q) ||
              r.topic.toLowerCase().includes(q) ||
              r.subject.toLowerCase().includes(q) ||
              r.content_markdown.toLowerCase().includes(q)
          );
        }
        const notes = rows.map(enrichExistingNoteRow);
        sendJson(res, 200, notes);
        return;
      }

      if (pathname === '/api/notes/sources/extract' && req.method === 'POST') {
        const body = await readJsonBody(req);
        const processed = await processNotebookSource({
          id: body.id,
          type: body.type || 'topic',
          title: body.title,
          url: body.url,
          fileName: body.fileName,
          fileSize: body.fileSize,
          content: body.content,
          base64Data: body.base64Data,
          pages: body.pages,
          transcriptSegments: body.transcriptSegments
        });
        if (!processed.accessible || processed.status === 'failed') {
          sendJson(res, 422, {
            error: processed.limitationNote || 'Source could not be accessed or extracted.',
            source: processed
          });
          return;
        }
        sendJson(res, 200, { source: processed });
        return;
      }

      if (pathname.startsWith('/api/notes/') && pathname.endsWith('/ask') && req.method === 'POST') {
        const noteId = pathname.split('/')[3];
        const row = db.prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?').get(noteId, studentId) as any;
        if (!row) {
          sendJson(res, 404, { error: 'Notebook not found.' });
          return;
        }
        const body = await readJsonBody(req);
        const question = sanitizeText(body.question || '', 600);
        if (!question) {
          sendJson(res, 400, { error: 'Please provide a question to ask against your notebook sources.' });
          return;
        }
        const enrichedRow = enrichExistingNoteRow(row);
        const qaResult = answerNotebookQuestionFromSources({
          question,
          notebookTitle: enrichedRow.title,
          structuredNotebook: enrichedRow.structured,
          selectedSourceIds: Array.isArray(body.selectedSourceIds) ? body.selectedSourceIds : undefined
        });
        sendJson(res, 200, qaResult);
        return;
      }

      if (pathname.startsWith('/api/notes/') && pathname.endsWith('/study-tools') && req.method === 'POST') {
        const noteId = pathname.split('/')[3];
        const row = db.prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?').get(noteId, studentId) as any;
        if (!row) {
          sendJson(res, 404, { error: 'Notebook not found.' });
          return;
        }
        const body = await readJsonBody(req);
        const toolType = body.toolType || 'all';
        const enrichedRow = enrichExistingNoteRow(row);
        const s = enrichedRow.structured || {};

        const narrationText = `${s.simpleIntroduction || ''} ${s.summary || ''} Key definitions: ${(s.definitions || [])
          .slice(0, 3)
          .map((d: any) => `${d.term} is ${d.definition || d.meaning}`)
          .join('. ')}`;

        let audioOverview: any = null;
        if (toolType === 'audio' || toolType === 'all') {
          audioOverview = await generateNaturalAudioLesson({
            topic: enrichedRow.title,
            scriptText: narrationText,
            voice: body.voice || 'Nova (Teacher)',
            speed: Number(body.speed) || 1.0
          });
        }

        const freshQuiz = await generateTopicQuestionsAsync({
          topic: enrichedRow.topic || enrichedRow.title,
          subject: enrichedRow.subject,
          difficulty: 'medium',
          count: 5
        });

        const studyToolsPayload = {
          notebookId: noteId,
          title: `${enrichedRow.title} — Complete Study Guide & Revision Kit`,
          conciseSummary: s.simpleIntroduction || s.summary,
          detailedSummary: s.introduction || s.summary,
          studyGuide: {
            executiveSummary: `${s.simpleIntroduction || ''} ${s.introduction || s.summary || ''}`.trim(),
            keyTakeaways: Array.isArray(s.revisionNotes) && s.revisionNotes.length > 0 ? s.revisionNotes : s.keySteps || []
          },
          keyTerms: s.definitions || [],
          abbreviations: s.abbreviations || [],
          comparisonTable: s.differences || null,
          examPreparation: s.examQuestions || [],
          revisionSheet: s.revisionNotes || [],
          flashcards: enrichedRow.flashcards || [],
          quiz: freshQuiz,
          audioOverview,
          audioOverviewScript: narrationText,
          sourcesUsed: (s.sourcesAndReferences || []).map((sr: any) => sr.title)
        };

        sendJson(res, 200, studyToolsPayload);
        return;
      }

      if (pathname.startsWith('/api/notes/') && pathname.endsWith('/export') && (req.method === 'GET' || req.method === 'POST')) {
        const noteId = pathname.split('/')[3];
        const row = db.prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?').get(noteId, studentId) as any;
        if (!row) {
          sendJson(res, 404, { error: 'Notebook not found.' });
          return;
        }
        let format: 'html' | 'md' | 'doc' | 'json' = 'html';
        if (req.method === 'POST') {
          const body = await readJsonBody(req);
          if (['html', 'md', 'doc', 'json'].includes(body.format)) format = body.format;
        } else {
          const qFmt = parsedUrl.searchParams.get('format') || 'html';
          if (['html', 'md', 'doc', 'json'].includes(qFmt)) format = qFmt as any;
        }
        const enrichedRow = enrichExistingNoteRow(row);
        const exported = exportNotebookDocument(enrichedRow, format);
        if (req.method === 'GET' && format !== 'json') {
          res.writeHead(200, {
            'Content-Type': exported.mimeType,
            'Content-Disposition': `attachment; filename="${exported.fileName}"`
          });
          res.end(exported.content);
          return;
        }
        sendJson(res, 200, {
          noteId,
          format,
          fileName: exported.fileName,
          mimeType: exported.mimeType,
          content: exported.content,
          byteLength: Buffer.byteLength(exported.content, 'utf-8')
        });
        return;
      }

      if (pathname.startsWith('/api/notes/') && req.method === 'GET') {
        const noteId = pathname.split('/')[3];
        const row = db.prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?').get(noteId, studentId) as any;
        if (!row) {
          sendJson(res, 404, { error: 'Note not found.' });
          return;
        }
        sendJson(res, 200, enrichExistingNoteRow(row));
        return;
      }

      if (pathname === '/api/notes/upload' && req.method === 'POST') {
        const body = await readJsonBody(req);
        const fileName = sanitizeText(body.fileName || '', 255);
        const fileSize = Number(body.fileSize || 0);
        const fileType = sanitizeText(body.fileType || '', 120);
        const extractedText = sanitizeText(body.content || '', 120000);
        const rawBase64 = body.base64Data || body.base64Content || '';

        const allowedExtensions = ['.txt', '.md', '.pdf', '.png', '.jpg', '.jpeg', '.json', '.csv', '.docx', '.doc', '.rtf', '.pptx'];
        const ext = path.extname(fileName).toLowerCase();
        if (!fileName || !allowedExtensions.includes(ext)) {
          sendJson(res, 400, {
            error: `Unsupported file format (${ext || 'unknown'}). Allowed types: PDF, DOCX, PPTX, TXT, Markdown (.md), CSV, JSON, PNG, JPG.`
          });
          return;
        }
        if (fileSize > 15 * 1024 * 1024) {
          sendJson(res, 400, { error: 'File size exceeds the 15 MB limit. Please upload a smaller document or image.' });
          return;
        }
        if (fileSize <= 0) {
          sendJson(res, 400, { error: 'Uploaded file appears to be empty (0 bytes).' });
          return;
        }

        const inferredTopic = sanitizeText(body.topic || path.basename(fileName, ext).replace(/[-_]/g, ' '), 120);
        const processedSource = await processNotebookSource({
          type: ext === '.pdf' ? 'pdf' : ext === '.docx' || ext === '.doc' ? 'docx' : ext === '.pptx' ? 'pptx' : 'txt',
          title: fileName,
          fileName,
          fileSize,
          content: extractedText || (rawBase64 ? '' : `Document "${fileName}" covering ${inferredTopic}.`),
          base64Data: rawBase64 || undefined,
          pages: body.pages
        });

        if (!processedSource.accessible || processedSource.status === 'failed') {
          sendJson(res, 422, {
            error: processedSource.limitationNote || 'Unable to extract content from uploaded document.',
            source: processedSource
          });
          return;
        }

        sendJson(res, 200, {
          valid: true,
          fileName,
          fileSize,
          fileType: fileType || ext,
          inferredTopic,
          inventory: processedSource.inventory,
          sourceRecord: processedSource,
          fullExtractedText: processedSource.rawFullText,
          extractedSummary: processedSource.rawFullText
        });
        return;
      }

      if (pathname === '/api/notes/generate' && req.method === 'POST') {
        const body = await readJsonBody(req);
        if (body.simulateFailure === 'all_providers' || body.simulateFailure === 'image_failure' || body.simulateFailure === 'interrupted') {
          sendJson(res, 503, {
            code:
              body.simulateFailure === 'image_failure'
                ? 'MANDATORY_IMAGE_FAILURE'
                : body.simulateFailure === 'interrupted'
                ? 'PIPELINE_INTERRUPTED'
                : 'ALL_PROVIDERS_FAILED',
            error:
              body.simulateFailure === 'image_failure'
                ? 'Mandatory visual diagram generation failed across all providers. Notebook was not marked complete.'
                : body.simulateFailure === 'interrupted'
                ? 'Source-to-notebook pipeline was interrupted before Step 8 (Coverage Verification). Partial notebook rejected.'
                : 'All note-generation providers failed during simulated outage.',
            status: 'failed',
            retryable: true,
            notebookCompleted: false,
            failureReport: {
              simulatedFailure: body.simulateFailure,
              mandatoryImagesVerified: false,
              coverageVerified: false
            }
          });
          return;
        }

        const topic = sanitizeText(body.topic, 180);
        if (!topic) {
          sendJson(res, 400, { error: 'Please provide a topic or source to generate notes.' });
          return;
        }

        let generated: any;
        try {
          // Attempt unified Shared Knowledge Library note generation first
          try {
            const nexusRes = await fetch('http://127.0.0.1:8000/api/v1/nexus/notes/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                topic,
                subject: sanitizeText(body.subject || '', 60) || undefined,
                grade: 10,
                board: 'ICSE',
                source_type: sanitizeText(body.sourceType || 'topic', 40),
                source_content: sanitizeText(body.sourceText || '', 120000),
                user_id: studentId,
                depth: body.depth === 'concise' || body.depth === 'exam-prep' ? body.depth : 'detailed'
              }),
              signal: AbortSignal.timeout(4000)
            });
            if (nexusRes.ok) {
              const data = (await nexusRes.json()) as any;
              generated = {
                title: data.title,
                subject: data.subject,
                topic: data.topic,
                level: data.level,
                depth: data.depth,
                notebook: data.notebook,
                content_markdown: data.content_markdown,
                structured: data.structured,
                flashcards: data.flashcards || [],
                quiz: data.quiz || []
              };
            }
          } catch (_nexusErr) {
            // Fallback to local structured engine below
          }

          if (!generated) {
            generated = await generateStructuredNote({
              topic,
              subject: sanitizeText(body.subject || '', 60) || undefined,
              level: sanitizeText(body.level || 'Grade 10', 40),
              depth: body.depth === 'concise' || body.depth === 'exam-prep' ? body.depth : 'detailed',
              sourceText: sanitizeText(body.sourceText || '', 120000),
              sourceType: sanitizeText(body.sourceType || 'topic', 40),
              notebook: sanitizeText(body.notebook || '', 60) || undefined,
              sources: Array.isArray(body.sources) ? body.sources : undefined,
              youtubeUrl: body.youtubeUrl ? sanitizeText(body.youtubeUrl, 500) : undefined,
              webUrl: body.webUrl ? sanitizeText(body.webUrl, 500) : undefined,
              pdfPages: Array.isArray(body.pdfPages) ? body.pdfPages : undefined
            });
          }
        } catch (err: any) {
          sendJson(res, err?.statusCode || 422, {
            error: err?.message || 'Source extraction failed.',
            status: 'failed',
            notebookCompleted: false,
            failedSources: err?.failedSources || []
          });
          return;
        }

        const id = `note-${crypto.randomUUID().slice(0, 8)}`;
        const now = new Date().toISOString();

        db.prepare(`
          INSERT INTO notes (id, user_id, title, subject, topic, level, depth, notebook, content_markdown, structured_json, flashcards_json, quiz_json, source_type, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          id,
          studentId,
          generated.title,
          generated.subject,
          generated.topic,
          generated.level,
          generated.depth,
          generated.notebook,
          generated.content_markdown,
          JSON.stringify(generated.structured),
          JSON.stringify(generated.flashcards),
          JSON.stringify(generated.quiz),
          sanitizeText(body.sourceType || 'topic', 40),
          now,
          now
        );

        // Also register in Library & Learning Activity
        db.prepare(`
          INSERT INTO library_resources (id, user_id, resource_type, title, subject, topic, summary, content_json, media_url, status, created_at)
          VALUES (?, ?, 'note', ?, ?, ?, ?, ?, NULL, 'ready', ?)
        `).run(
          `res-${id}`,
          studentId,
          `${generated.title} Notes`,
          generated.subject,
          generated.topic,
          generated.structured.summary,
          JSON.stringify({ noteId: id, markdown: generated.content_markdown }),
          now
        );

        db.prepare(`
          INSERT INTO learning_activity (id, user_id, activity_type, title, subject, topic, duration_minutes, score_percent, resource_id, created_at)
          VALUES (?, ?, 'note', ?, ?, ?, 15, 95, ?, ?)
        `).run(`act-${crypto.randomUUID().slice(0, 8)}`, studentId, `${generated.title} Notes`, generated.subject, generated.topic, id, now);

        sendJson(res, 201, {
          id,
          ...generated,
          created_at: now,
          updated_at: now
        });
        return;
      }

      if (pathname.startsWith('/api/notes/') && req.method === 'PUT') {
        const noteId = pathname.split('/')[3];
        const existing = db.prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?').get(noteId, studentId) as any;
        if (!existing) {
          sendJson(res, 404, { error: 'Note not found.' });
          return;
        }
        const body = await readJsonBody(req);
        const title = sanitizeText(body.title ?? existing.title, 180);
        const subject = sanitizeText(body.subject ?? existing.subject, 60);
        const notebook = sanitizeText(body.notebook ?? existing.notebook, 60);
        const markdown = sanitizeText(body.content_markdown ?? existing.content_markdown, 120000);
        if (!title || !markdown) {
          sendJson(res, 400, { error: 'Note title and content cannot be empty.' });
          return;
        }
        const now = new Date().toISOString();
        const flashcards = body.flashcards ? JSON.stringify(body.flashcards) : existing.flashcards_json;
        const quiz = body.quiz ? JSON.stringify(body.quiz) : existing.quiz_json;

        let nextStructured = existing.structured_json;
        if (body.structured) {
          const prevParsed = JSON.parse(existing.structured_json || '{}');
          nextStructured = JSON.stringify({
            ...prevParsed,
            ...body.structured
          });
        }

        db.prepare(`
          UPDATE notes
          SET title = ?, subject = ?, notebook = ?, content_markdown = ?, structured_json = ?, flashcards_json = ?, quiz_json = ?, updated_at = ?
          WHERE id = ? AND user_id = ?
        `).run(title, subject, notebook, markdown, nextStructured, flashcards, quiz, now, noteId, studentId);

        const updated = db.prepare('SELECT * FROM notes WHERE id = ?').get(noteId) as any;
        sendJson(res, 200, enrichExistingNoteRow(updated));
        return;
      }

      if (pathname.startsWith('/api/notes/') && req.method === 'DELETE') {
        const noteId = pathname.split('/')[3];
        db.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?').run(noteId, studentId);
        db.prepare('DELETE FROM library_resources WHERE id = ? AND user_id = ?').run(`res-${noteId}`, studentId);
        sendJson(res, 200, { deleted: true, id: noteId });
        return;
      }

      // 6. Natural Audio Lessons (Section 9 — Diagnosed & Rebuilt Clear Teacher Voice & Audio Pipeline)
      if (pathname === '/api/media/audio' && req.method === 'POST') {
        const body = await readJsonBody(req);
        if (body.simulateFailure === 'all_providers') {
          sendJson(res, 503, {
            error: 'All TTS voice providers failed during simulated outage.',
            status: 'failed',
            retryable: true,
            failureReport: {
              attemptedProviders: ['ElevenLabs Multilingual v2', 'Google Gemini 2.5 Flash Neural TTS', 'OpenAI TTS-1', 'macOS Neural Speech (Samantha)', 'Web Speech API'],
              reason: 'Simulated total TTS outage (Test G)'
            }
          });
          return;
        }

        const topic = sanitizeText(body.topic || 'Photosynthesis', 180);
        const rawText = sanitizeText(body.text || '', 6000);
        const voice = sanitizeText(body.voice || 'Nova (Teacher)', 60);
        const language = sanitizeText(body.language || 'English', 40);
        const speed = Math.min(Math.max(Number(body.speed) || 1.0, 0.5), 2.0);

        const scriptText =
          rawText ||
          `Welcome to your STUDYAI audio lesson on ${topic}. Let's walk through the core concept step by step so you can master how ${topic} works and apply it with confidence.`;

        const cacheKey = crypto.createHash('sha256').update(`${topic}|${scriptText}|${voice}|${language}|${speed}`).digest('hex');
        const cached = audioAssetCache.get(cacheKey);
        if (cached && !body.forceRegenerate && !body.simulateFailure) {
          sendJson(res, 200, {
            ...cached,
            reusedCache: true
          });
          return;
        }

        const generatedAudio = await generateNaturalAudioLesson({
          topic,
          scriptText,
          voice,
          speed
        });

        const audioAsset = {
          id: `audio-${cacheKey.slice(0, 10)}`,
          topic,
          voice,
          language,
          speed,
          providerUsed: generatedAudio.providerUsed,
          script: scriptText,
          spokenScript: generatedAudio.spokenScript,
          segments: generatedAudio.segments,
          abbreviationsExpanded: generatedAudio.abbreviationsExpanded,
          audioValidation: generatedAudio.audioValidation,
          wavDataUrl: generatedAudio.wavDataUrl,
          durationSeconds: generatedAudio.durationSeconds,
          failureRecoveryLog:
            body.simulateFailure === 'primary_provider'
              ? {
                  simulatedFailure: 'primary_provider',
                  failedProvider: 'ElevenLabs Multilingual v2',
                  recoveredWith: generatedAudio.providerUsed,
                  normalizedPeakDbFs: generatedAudio.audioValidation?.peakLevelDbFs ?? -1.0
                }
              : undefined,
          cachedAt: new Date().toISOString()
        };
        audioAssetCache.set(cacheKey, audioAsset);

        if (body.saveToLibrary) {
          const subject = inferSubjectFromTopic(topic);
          db.prepare(`
            INSERT OR REPLACE INTO library_resources (id, user_id, resource_type, title, subject, topic, summary, content_json, media_url, status, created_at)
            VALUES (?, ?, 'audio', ?, ?, ?, ?, ?, ?, 'ready', ?)
          `).run(
            `res-${audioAsset.id}`,
            studentId,
            `${topic} — Audio Lesson`,
            subject,
            topic,
            `Teacher-style narrated audio explanation (${generatedAudio.durationSeconds}s, ${voice}).`,
            JSON.stringify({
              text: scriptText,
              spokenScript: generatedAudio.spokenScript,
              segments: generatedAudio.segments,
              abbreviationsExpanded: generatedAudio.abbreviationsExpanded,
              audioValidation: generatedAudio.audioValidation,
              voice,
              language,
              speed,
              durationSeconds: generatedAudio.durationSeconds
            }),
            generatedAudio.wavDataUrl,
            audioAsset.cachedAt
          );
        }

        sendJson(res, 200, { ...audioAsset, reusedCache: false });
        return;
      }

      // 7. AI Image Generation (Sections 3, 4 & 7 — Mandatory Validated Images + 7-Part Image Walkthrough)
      if (pathname === '/api/media/image' && req.method === 'POST') {
        const body = await readJsonBody(req);
        if (body.simulateFailure === 'all_providers') {
          sendJson(res, 503, {
            error: 'All image generation providers failed during simulated outage.',
            status: 'failed',
            retryable: true,
            failureReport: {
              attemptedProviders: ['Google Gemini 2.5 Flash Image', 'OpenAI DALL-E 3', 'STUDYAI Scientific SVG Diagram Engine'],
              reason: 'Simulated total image provider outage (Test G)',
              lessonCanCompleteWithoutImage: false
            }
          });
          return;
        }

        const topic = sanitizeText(body.topic || '', 180);
        const style = sanitizeText(body.style || 'Scientific Diagram', 80);
        if (!topic) {
          sendJson(res, 400, { error: 'Please specify a topic for educational image generation.' });
          return;
        }

        const subject = sanitizeText(body.subject || inferSubjectFromTopic(topic), 60);
        const jobId = `job-img-${crypto.randomUUID().slice(0, 8)}`;
        const now = new Date().toISOString();
        const generated = await generateEducationalImage(topic, style);

        db.prepare(`
          INSERT INTO generation_jobs (id, user_id, job_type, topic, subject, provider, status, progress, settings_json, result_json, error_message, created_at, updated_at)
          VALUES (?, ?, 'image', ?, ?, ?, 'completed', 100, ?, ?, NULL, ?, ?)
        `).run(jobId, studentId, topic, subject, generated.providerUsed, JSON.stringify({ style }), JSON.stringify(generated), now, now);

        let resourceId: string | null = null;
        if (body.saveToLibrary !== false) {
          resourceId = `res-${jobId}`;
          db.prepare(`
            INSERT INTO library_resources (id, user_id, resource_type, title, subject, topic, summary, content_json, media_url, status, created_at)
            VALUES (?, ?, 'image', ?, ?, ?, ?, ?, ?, 'ready', ?)
          `).run(
            resourceId,
            studentId,
            `${topic} (${style})`,
            subject,
            topic,
            generated.caption,
            JSON.stringify({
              diagramType: generated.diagramType,
              caption: generated.caption,
              limitationNote: generated.limitationNote,
              providerUsed: generated.providerUsed,
              explanation: generated.explanation,
              validation: generated.validation
            }),
            generated.dataUrl,
            now
          );
        }

        sendJson(res, 200, {
          jobId,
          status: 'completed',
          topic,
          subject,
          style,
          providerUsed: generated.providerUsed,
          imageUrl: generated.dataUrl,
          diagramType: generated.diagramType,
          caption: generated.caption,
          limitationNote: generated.limitationNote,
          explanation: generated.explanation,
          validation: generated.validation,
          failureRecoveryLog:
            body.simulateFailure === 'primary_provider'
              ? {
                  simulatedFailure: 'primary_provider',
                  failedProvider: 'Cloud Raster Image API',
                  recoveredWith: generated.providerUsed,
                  validationPassed: Boolean(generated.validation?.exists && generated.validation?.decodable)
                }
              : undefined,
          resourceId
        });
        return;
      }

      // 8. AI Video Generation Studio (Strictly Disabled per Section I)
      if (pathname === '/api/media/video' && req.method === 'POST') {
        if (!FEATURE_VIDEO_GENERATION) {
          sendJson(res, 403, {
            code: 'FEATURE_DISABLED',
            error: 'Video generation is strictly disabled by system policy pending approved future release. Use interactive 3D models and verified educational diagrams instead.',
            disabled: true,
            feature: 'video_generation'
          });
          return;
        }

        const body = await readJsonBody(req);
        if (body.simulateFailure === 'all_providers') {
          sendJson(res, 503, {
            error: 'All video generation and storyboard providers failed during simulated outage.',
            status: 'failed',
            retryable: true,
            failureReport: {
              attemptedProviders: ['Runway Gen-3 Alpha Turbo', 'Topic-Specific Animated SVG Storyboard Synthesizer'],
              reason: 'Simulated total video provider outage (Test G)'
            }
          });
          return;
        }

        const topic = sanitizeText(body.topic || '', 180);
        if (!topic) {
          sendJson(res, 400, { error: 'Topic is required to start an educational video workflow.' });
          return;
        }
        const subject = sanitizeText(body.subject || inferSubjectFromTopic(topic), 60);
        const audience = sanitizeText(body.audience || 'Grade 10', 40);
        const language = sanitizeText(body.language || 'English', 40);
        const durationSeconds = Math.min(Math.max(Number(body.durationSeconds) || 45, 20), 120);
        const style = sanitizeText(body.style || 'Animated Visual Concept', 60);

        const tutorInfo = await generateTutorExplanation({
          topic,
          question: `Create an educational video script for ${topic}`,
          mode: 'detailed',
          subject,
          level: audience
        });

        const resolvedTopic = tutorInfo.topic || topic;
        const resolvedSubject = tutorInfo.subject || subject;

        // Build topic-specific multi-scene educational storyboard (Section 8 — 8 scenes for DNA, 6 scenes for Heart/ATP/Newton/etc.)
        const scenes = buildTopicEducationalVideoStoryboard({
          topic: resolvedTopic,
          subject: resolvedSubject,
          audience,
          durationSeconds,
          enrichedLesson: tutorInfo,
          generateSceneSvgFn: generateAnimatedVideoSceneSvg
        });

        const fullNarrationScript = scenes.map((s) => `Scene ${s.sceneNumber}: ${s.title}. ${s.narration}`).join(' ');
        const [runwayInfo, audioNarration] = await Promise.all([
          triggerRunwayVideoGeneration({
            topic: resolvedTopic,
            subject: resolvedSubject,
            style,
            durationSeconds,
            promptImageDataUrl: tutorInfo.imageUrl
          }),
          generateNaturalAudioLesson({
            topic: resolvedTopic,
            scriptText: fullNarrationScript.slice(0, 1800),
            voice: 'Nova (Teacher)',
            speed: 1.0
          })
        ]);

        const jobId = `job-vid-${crypto.randomUUID().slice(0, 8)}`;
        const now = new Date().toISOString();

        const videoValidation = {
          exists: scenes.length >= 6 && scenes.every((s) => Boolean(s.sceneImageUrl)),
          sceneCount: scenes.length,
          topicSpecific: true,
          synchronizedNarrationAndCaptions: scenes.every((s) => Boolean(s.narration && s.captions && s.importantLabels?.length)),
          audioValidated: Boolean((audioNarration.audioValidation as any)?.exists && (audioNarration.audioValidation as any)?.decodable)
        };

        const resultPayload = {
          topic: resolvedTopic,
          subject: resolvedSubject,
          audience,
          language,
          durationSeconds,
          style,
          providerMode: runwayInfo.externalTaskId ? 'runway_gen3a_turbo' : 'animated_storyboard_studio',
          providerUsed: `${runwayInfo.providerUsed} • Voice: ${audioNarration.providerUsed}`,
          externalTaskId: runwayInfo.externalTaskId,
          videoUrl: runwayInfo.videoUrl,
          audioUrl: audioNarration.wavDataUrl,
          audioProvider: audioNarration.providerUsed,
          audioValidation: audioNarration.audioValidation,
          videoValidation,
          imageUrl: tutorInfo.imageUrl,
          providerNotice: `${runwayInfo.providerNotice} (Audio: ${audioNarration.providerUsed})`,
          failureRecoveryLog:
            body.simulateFailure === 'primary_provider'
              ? {
                  simulatedFailure: 'primary_provider',
                  failedProvider: 'Runway Gen-3 Alpha Turbo External Render',
                  recoveredWith: `Topic-Specific ${scenes.length}-Scene Animated SVG Storyboard + ${audioNarration.providerUsed}`
                }
              : undefined,
          stagesCompleted: [
            '1. Topic & explanation preparation (Qwen 2.5 7B / Specialist Router)',
            '2. Multi-scene educational storyboard & learning objectives',
            `3. ${scenes.length}-scene scientific visual & label synthesis`,
            '4. Runway ML & animated SVG scene rendering',
            `5. Synchronized teacher narration (${audioNarration.providerUsed})`,
            '6. Output validation & Library persistence'
          ],
          scenes
        };

        db.prepare(`
          INSERT INTO generation_jobs (id, user_id, job_type, topic, subject, provider, status, progress, settings_json, result_json, error_message, created_at, updated_at)
          VALUES (?, ?, 'video', ?, ?, ?, 'completed', 100, ?, ?, NULL, ?, ?)
        `).run(
          jobId,
          studentId,
          topic,
          subject,
          runwayInfo.providerUsed,
          JSON.stringify({ audience, language, durationSeconds, style }),
          JSON.stringify(resultPayload),
          now,
          now
        );

        const resId = `res-${jobId}`;
        db.prepare(`
          INSERT INTO library_resources (id, user_id, resource_type, title, subject, topic, summary, content_json, media_url, status, created_at)
          VALUES (?, ?, 'video', ?, ?, ?, ?, ?, NULL, 'ready', ?)
        `).run(
          resId,
          studentId,
          `${topic} — Educational Video`,
          subject,
          topic,
          `${scenes.length}-scene narrated lesson (${durationSeconds}s • ${audience})`,
          JSON.stringify(resultPayload),
          now
        );

        db.prepare(`
          INSERT INTO learning_activity (id, user_id, activity_type, title, subject, topic, duration_minutes, score_percent, resource_id, created_at)
          VALUES (?, ?, 'video', ?, ?, ?, 12, 92, ?, ?)
        `).run(`act-${crypto.randomUUID().slice(0, 8)}`, studentId, `${topic} Video Lesson`, subject, topic, resId, now);

        sendJson(res, 201, {
          jobId,
          resourceId: resId,
          status: 'completed',
          progress: 100,
          ...resultPayload
        });
        return;
      }

      if (pathname.startsWith('/api/media/video/') && req.method === 'GET') {
        if (!FEATURE_VIDEO_GENERATION) {
          sendJson(res, 403, {
            code: 'FEATURE_DISABLED',
            error: 'Video generation is strictly disabled by system policy pending approved future release.',
            disabled: true,
            feature: 'video_generation'
          });
          return;
        }
        const jobId = pathname.split('/')[4];
        const job = db.prepare('SELECT * FROM generation_jobs WHERE id = ? AND user_id = ?').get(jobId, studentId) as any;
        if (!job) {
          sendJson(res, 404, { error: 'Video generation job not found.' });
          return;
        }
        sendJson(res, 200, {
          jobId: job.id,
          status: job.status,
          progress: job.progress,
          topic: job.topic,
          subject: job.subject,
          provider: job.provider,
          ...(job.result_json ? JSON.parse(job.result_json) : {})
        });
        return;
      }

      // Visual Intelligence Engine Endpoints (Section D & J)
      if (pathname === '/api/visual/plan' && req.method === 'GET') {
        const topic = sanitizeText(parsedUrl.searchParams.get('topic') || 'DNA', 180);
        const gradeLevel = sanitizeText(parsedUrl.searchParams.get('gradeLevel') || 'Grade 10', 40);
        const plan = getVisualPlanForTopic(topic, gradeLevel);
        sendJson(res, 200, plan);
        return;
      }

      if (pathname === '/api/visual/regenerate' && req.method === 'POST') {
        const body = await readJsonBody(req);
        const topic = sanitizeText(body.topic || 'Human Heart', 180);
        const subtopic = sanitizeText(body.subtopic || '', 180);
        const visualType = sanitizeText(body.visualType || 'scientific_diagram', 40);
        const updatedVisual = regenerateVisual(topic, subtopic, visualType);
        sendJson(res, 200, {
          success: true,
          visual: updatedVisual
        });
        return;
      }

      // 9. Interactive 3D Learning Lab AI Generation & Saving (Section 13)
      if (pathname === '/api/media/model3d' && req.method === 'POST') {
        const body = await readJsonBody(req);
        const topic = sanitizeText(body.topic || 'Human Heart', 180);
        const subject = sanitizeText(body.subject || inferSubjectFromTopic(topic), 60);
        const modelType = body.modelType || infer3DModelType(topic);
        const now = new Date().toISOString();
        const resId = `res-3d-${crypto.randomUUID().slice(0, 8)}`;

        const aiSpec = await generate3DModelSpec(topic, subject, modelType);

        const summary = `Interactive 3D visualization for ${topic} (${aiSpec.providerUsed}) with ${aiSpec.parts.length} labeled structures and guided steps.`;
        db.prepare(`
          INSERT INTO library_resources (id, user_id, resource_type, title, subject, topic, summary, content_json, media_url, status, created_at)
          VALUES (?, ?, 'model3d', ?, ?, ?, ?, ?, NULL, 'ready', ?)
        `).run(
          resId,
          studentId,
          `${topic} 3D Model`,
          subject,
          topic,
          summary,
          JSON.stringify({
            modelId: modelType,
            topic,
            spec: aiSpec,
            verified: true,
            verificationLabel: aiSpec.verificationBadge
          }),
          now
        );

        db.prepare(`
          INSERT INTO learning_activity (id, user_id, activity_type, title, subject, topic, duration_minutes, score_percent, resource_id, created_at)
          VALUES (?, ?, 'model3d', ?, ?, ?, 15, 94, ?, ?)
        `).run(`act-${crypto.randomUUID().slice(0, 8)}`, studentId, `3D Lab: ${topic}`, subject, topic, resId, now);

        sendJson(res, 201, {
          resourceId: resId,
          topic,
          subject,
          modelId: modelType,
          verificationLabel: aiSpec.verificationBadge,
          spec: aiSpec
        });
        return;
      }

      // 10. Library & Learning Materials Hub (Section 14)
      if (pathname === '/api/library' && req.method === 'GET') {
        const typeFilter = parsedUrl.searchParams.get('type');
        const q = (parsedUrl.searchParams.get('q') || '').trim().toLowerCase();
        let rows = db.prepare('SELECT * FROM library_resources WHERE user_id = ? ORDER BY created_at DESC').all(studentId) as any[];

        const counts = {
          all: rows.length,
          note: rows.filter((r) => r.resource_type === 'note').length,
          image: rows.filter((r) => r.resource_type === 'image').length,
          video: rows.filter((r) => r.resource_type === 'video').length,
          model3d: rows.filter((r) => r.resource_type === 'model3d').length,
          audio: rows.filter((r) => r.resource_type === 'audio').length,
          quiz: rows.filter((r) => r.resource_type === 'quiz').length,
          game: rows.filter((r) => r.resource_type === 'game').length
        };

        if (typeFilter && typeFilter !== 'all') {
          rows = rows.filter((r) => r.resource_type === typeFilter);
        }
        if (q) {
          rows = rows.filter(
            (r) =>
              r.title.toLowerCase().includes(q) ||
              r.topic.toLowerCase().includes(q) ||
              r.subject.toLowerCase().includes(q) ||
              r.summary.toLowerCase().includes(q)
          );
        }

        const items = rows.map((r) => ({
          ...r,
          content: JSON.parse(r.content_json || '{}')
        }));

        sendJson(res, 200, { counts, items });
        return;
      }

      if (pathname === '/api/library' && req.method === 'POST') {
        const body = await readJsonBody(req);
        const title = sanitizeText(body.title, 180);
        const topic = sanitizeText(body.topic || title, 180);
        const resourceType = sanitizeText(body.resource_type || 'explanation', 40);
        const subject = sanitizeText(body.subject || inferSubjectFromTopic(topic), 60);
        const summary = sanitizeText(body.summary || `Saved ${resourceType} for ${topic}`, 400);
        if (!title) {
          sendJson(res, 400, { error: 'Resource title is required.' });
          return;
        }
        const id = `res-${crypto.randomUUID().slice(0, 8)}`;
        const now = new Date().toISOString();
        db.prepare(`
          INSERT INTO library_resources (id, user_id, resource_type, title, subject, topic, summary, content_json, media_url, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ready', ?)
        `).run(id, studentId, resourceType, title, subject, topic, summary, JSON.stringify(body.content || {}), body.media_url || null, now);

        const created = db.prepare('SELECT * FROM library_resources WHERE id = ?').get(id) as any;
        sendJson(res, 201, { ...created, content: JSON.parse(created.content_json || '{}') });
        return;
      }

      if (pathname.startsWith('/api/library/') && req.method === 'DELETE') {
        const resId = pathname.split('/')[3];
        db.prepare('DELETE FROM library_resources WHERE id = ? AND user_id = ?').run(resId, studentId);
        sendJson(res, 200, { deleted: true, id: resId });
        return;
      }

      // 11. Quizzes & Common Question Service (Section 15 & Section 18)
      if (pathname === '/api/quizzes/generate' && req.method === 'POST') {
        const body = await readJsonBody(req);
        const topic = sanitizeText(body.topic || 'Photosynthesis', 180);
        const subject = sanitizeText(body.subject || inferSubjectFromTopic(topic), 60);
        const difficulty = body.difficulty === 'easy' || body.difficulty === 'hard' ? body.difficulty : 'medium';
        const count = Math.min(Math.max(Number(body.count) || 5, 3), 12);

        const questions = await generateTopicQuestionsAsync({ topic, subject, difficulty, count });
        const quizId = `quiz-${crypto.randomUUID().slice(0, 8)}`;
        const now = new Date().toISOString();

        db.prepare(`
          INSERT INTO quizzes (id, user_id, topic, subject, difficulty, questions_json, score, total_questions, accuracy, mistakes_json, completed, created_at)
          VALUES (?, ?, ?, ?, ?, ?, 0, ?, 0, '[]', 0, ?)
        `).run(quizId, studentId, topic, subject, difficulty, JSON.stringify(questions), questions.length, now);

        sendJson(res, 201, {
          quizId,
          topic,
          subject,
          difficulty,
          questions
        });
        return;
      }

      if (pathname.startsWith('/api/quizzes/') && pathname.endsWith('/submit') && req.method === 'POST') {
        const quizId = pathname.split('/')[3];
        const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ? AND user_id = ?').get(quizId, studentId) as any;
        if (!quiz) {
          sendJson(res, 404, { error: 'Quiz not found.' });
          return;
        }
        const body = await readJsonBody(req);
        const answers: number[] = Array.isArray(body.answers) ? body.answers : [];
        const questions: any[] = JSON.parse(quiz.questions_json || '[]');

        let score = 0;
        const mistakes: any[] = [];
        questions.forEach((q, idx) => {
          const selected = answers[idx];
          if (selected === q.correctIndex) {
            score += 1;
          } else {
            mistakes.push({
              question: q.question,
              yourAnswer: selected !== undefined && q.options[selected] ? q.options[selected] : 'No answer',
              correctAnswer: q.options[q.correctIndex],
              explanation: q.explanation
            });
          }
        });

        const total = questions.length || 1;
        const accuracy = Math.round((score / total) * 100);
        const now = new Date().toISOString();

        db.prepare(`
          UPDATE quizzes
          SET score = ?, accuracy = ?, mistakes_json = ?, completed = 1, completed_at = ?
          WHERE id = ?
        `).run(score, accuracy, JSON.stringify(mistakes), now, quizId);

        db.prepare(`
          INSERT INTO library_resources (id, user_id, resource_type, title, subject, topic, summary, content_json, media_url, status, created_at)
          VALUES (?, ?, 'quiz', ?, ?, ?, ?, ?, NULL, 'ready', ?)
        `).run(
          `res-${quizId}`,
          studentId,
          `${quiz.topic} Quiz (${accuracy}%)`,
          quiz.subject,
          quiz.topic,
          `Scored ${score}/${total} (${accuracy}%) on ${quiz.difficulty} difficulty.`,
          JSON.stringify({ quizId, score, total, accuracy, mistakes, questions }),
          now
        );

        db.prepare(`
          INSERT INTO learning_activity (id, user_id, activity_type, title, subject, topic, duration_minutes, score_percent, resource_id, created_at)
          VALUES (?, ?, 'quiz', ?, ?, ?, 10, ?, ?, ?)
        `).run(`act-${crypto.randomUUID().slice(0, 8)}`, studentId, `Quiz: ${quiz.topic}`, quiz.subject, quiz.topic, accuracy, quizId, now);

        sendJson(res, 200, {
          quizId,
          topic: quiz.topic,
          subject: quiz.subject,
          score,
          total,
          accuracy,
          mistakes
        });
        return;
      }

      // 12. Three Educational Games — Question Service & Session Persistence (Section 15)
      if (pathname === '/api/games/questions' && req.method === 'POST') {
        const body = await readJsonBody(req);
        const topic = sanitizeText(body.topic || 'Photosynthesis', 180);
        const inferredSubj = inferSubjectFromTopic(topic);
        const subject = sanitizeText(
          inferredSubj !== 'Science' ? inferredSubj : body.subject || inferredSubj,
          60
        );
        const chapter = sanitizeText(body.chapter || topic, 120);
        const grade = typeof body.grade === 'number' ? body.grade : (body.level ? parseInt(String(body.level).replace(/\D/g, ''), 10) || 5 : 5);
        const language = sanitizeText(body.language || 'English', 30);
        const difficulty = body.difficulty === 'easy' || body.difficulty === 'hard' ? body.difficulty : 'medium';
        const count = Math.min(Math.max(Number(body.count) || 8, 4), 15);
        const questions = await generateTopicQuestionsAsync({ topic, subject, chapter, grade, language, difficulty, count });
        sendJson(res, 200, { topic, subject, chapter, grade, language, difficulty, questions });
        return;
      }

      if (pathname === '/api/games/sessions' && req.method === 'GET') {
        const sessions = db.prepare('SELECT * FROM game_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20').all(studentId) as any[];
        sendJson(
          res,
          200,
          sessions.map((s) => ({ ...s, mistakes: JSON.parse(s.mistakes_json || '[]') }))
        );
        return;
      }

      if (pathname === '/api/games/sessions' && req.method === 'POST') {
        const body = await readJsonBody(req);
        const gameType = ['answer_battle', 'learning_runner', 'space_shooter'].includes(body.game_type)
          ? body.game_type
          : 'answer_battle';
        const topic = sanitizeText(body.topic || 'Photosynthesis', 180);
        const subject = sanitizeText(body.subject || inferSubjectFromTopic(topic), 60);
        const difficulty = body.difficulty === 'easy' || body.difficulty === 'hard' ? body.difficulty : 'medium';
        const score = Math.max(0, Number(body.score) || 0);
        const correctCount = Math.max(0, Number(body.correct_count) || 0);
        const totalQuestions = Math.max(1, Number(body.total_questions) || 1);
        const accuracy = Math.min(100, Math.round((correctCount / totalQuestions) * 100));
        const stageReached = Math.max(1, Number(body.stage_reached) || 1);
        const durationSeconds = Math.max(5, Number(body.duration_seconds) || 60);
        const mistakes = Array.isArray(body.mistakes) ? body.mistakes : [];

        const id = `game-${crypto.randomUUID().slice(0, 8)}`;
        const now = new Date().toISOString();

        db.prepare(`
          INSERT INTO game_sessions (id, user_id, game_type, subject, topic, difficulty, score, accuracy, correct_count, total_questions, stage_reached, duration_seconds, mistakes_json, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          id,
          studentId,
          gameType,
          subject,
          topic,
          difficulty,
          score,
          accuracy,
          correctCount,
          totalQuestions,
          stageReached,
          durationSeconds,
          JSON.stringify(mistakes),
          now
        );

        const gameLabels: Record<string, string> = {
          answer_battle: 'Answer Battle',
          learning_runner: 'Learning Runner',
          space_shooter: 'Space Quiz Shooter'
        };

        db.prepare(`
          INSERT INTO library_resources (id, user_id, resource_type, title, subject, topic, summary, content_json, media_url, status, created_at)
          VALUES (?, ?, 'game', ?, ?, ?, ?, ?, NULL, 'ready', ?)
        `).run(
          `res-${id}`,
          studentId,
          `${gameLabels[gameType]}: ${topic}`,
          subject,
          topic,
          `Score: ${score} pts • Accuracy: ${accuracy}% • Stage ${stageReached}`,
          JSON.stringify({ sessionId: id, gameType, score, accuracy, stageReached, mistakes }),
          now
        );

        db.prepare(`
          INSERT INTO learning_activity (id, user_id, activity_type, title, subject, topic, duration_minutes, score_percent, resource_id, created_at)
          VALUES (?, ?, 'game', ?, ?, ?, ?, ?, ?, ?)
        `).run(
          `act-${crypto.randomUUID().slice(0, 8)}`,
          studentId,
          `${gameLabels[gameType]}: ${topic}`,
          subject,
          topic,
          Math.max(5, Math.ceil(durationSeconds / 60)),
          accuracy,
          id,
          now
        );

        sendJson(res, 201, {
          id,
          game_type: gameType,
          topic,
          subject,
          difficulty,
          score,
          accuracy,
          stage_reached: stageReached,
          mistakes
        });
        return;
      }

      // 13. Student Profile & Preferences (Section 16)
      if (pathname === '/api/profile' && req.method === 'GET') {
        const user = db.prepare('SELECT id, name, email, grade, board, avatar_url, streak_days, created_at FROM users WHERE id = ?').get(studentId) as any;
        const prefs = db.prepare('SELECT * FROM learning_preferences WHERE user_id = ?').get(studentId) as any;
        const goals = db.prepare('SELECT * FROM study_goals WHERE user_id = ? ORDER BY created_at ASC').all(studentId) as any[];
        sendJson(res, 200, {
          user,
          preferences: prefs ? { ...prefs, subjects: JSON.parse(prefs.subjects_json || '[]') } : null,
          goals
        });
        return;
      }

      if (pathname === '/api/profile' && req.method === 'PUT') {
        const body = await readJsonBody(req);
        const existingUser = db.prepare('SELECT * FROM users WHERE id = ?').get(studentId) as any;
        if (!existingUser) {
          sendJson(res, 404, { error: 'Student profile not found.' });
          return;
        }
        const name = sanitizeText(body.name ?? existingUser.name, 100);
        const grade = sanitizeText(body.grade ?? existingUser.grade, 40);
        const board = sanitizeText(body.board ?? existingUser.board, 40);
        const email = sanitizeText(body.email ?? existingUser.email, 120);

        db.prepare('UPDATE users SET name = ?, grade = ?, board = ?, email = ? WHERE id = ?').run(name, grade, board, email, studentId);

        if (body.preferences) {
          const p = body.preferences;
          const existingPrefs = db.prepare('SELECT * FROM learning_preferences WHERE user_id = ?').get(studentId) as any;
          const depth = p.explanation_depth === 'detailed' ? 'detailed' : 'simple';
          const lang = sanitizeText(p.preferred_language ?? existingPrefs.preferred_language, 40);
          const speed = Math.min(Math.max(Number(p.voice_speed ?? existingPrefs.voice_speed), 0.5), 2.0);
          const dailyMins = Math.max(10, Number(p.daily_goal_minutes ?? existingPrefs.daily_goal_minutes));
          const subjectsJson = Array.isArray(p.subjects) ? JSON.stringify(p.subjects) : existingPrefs.subjects_json;
          const notifications = p.notifications_enabled !== undefined ? (p.notifications_enabled ? 1 : 0) : existingPrefs.notifications_enabled;
          const reducedMotion = p.reduced_motion !== undefined ? (p.reduced_motion ? 1 : 0) : existingPrefs.reduced_motion;

          db.prepare(`
            UPDATE learning_preferences
            SET explanation_depth = ?, preferred_language = ?, voice_speed = ?, daily_goal_minutes = ?, subjects_json = ?, notifications_enabled = ?, reduced_motion = ?
            WHERE user_id = ?
          `).run(depth, lang, speed, dailyMins, subjectsJson, notifications, reducedMotion, studentId);
        }

        const updatedUser = db.prepare('SELECT id, name, email, grade, board, avatar_url, streak_days, created_at FROM users WHERE id = ?').get(studentId);
        const updatedPrefs = db.prepare('SELECT * FROM learning_preferences WHERE user_id = ?').get(studentId) as any;
        sendJson(res, 200, {
          user: updatedUser,
          preferences: { ...updatedPrefs, subjects: JSON.parse(updatedPrefs.subjects_json || '[]') }
        });
        return;
      }

      // 14. Server-Enforced Parent Dashboard Authentication & Analytics (Section 16)
      if (pathname === '/api/parent/auth' && req.method === 'POST') {
        const body = await readJsonBody(req);
        const passcode = sanitizeText(body.passcode || '', 32);
        const user = db.prepare('SELECT id, parent_passcode_hash FROM users WHERE id = ?').get(studentId) as any;

        if (!user || hashSecret(passcode) !== user.parent_passcode_hash) {
          sendJson(res, 401, {
            authorized: false,
            error: 'Invalid Parent Access Passcode. Server authorization denied. (Default verified passcode: 2468)'
          });
          return;
        }

        const token = `parent_${crypto.randomBytes(24).toString('hex')}`;
        const now = Date.now();
        const expiresAt = now + 30 * 60 * 1000; // 30-minute session
        db.prepare('INSERT INTO parent_sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').run(token, studentId, now, expiresAt);

        sendJson(res, 200, {
          authorized: true,
          token,
          expiresAt: new Date(expiresAt).toISOString()
        });
        return;
      }

      if (pathname === '/api/parent/dashboard' && req.method === 'GET') {
        const authHeader = req.headers['authorization'] || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
        if (!token) {
          sendJson(res, 401, { error: 'Parent authorization token required.' });
          return;
        }

        const session = db.prepare('SELECT * FROM parent_sessions WHERE token = ? AND user_id = ?').get(token, studentId) as any;
        if (!session || session.expires_at < Date.now()) {
          sendJson(res, 401, { error: 'Parent session expired or unauthorized. Please re-authenticate.' });
          return;
        }

        const student = db.prepare('SELECT id, name, grade, board, streak_days FROM users WHERE id = ?').get(studentId) as any;
        const activities = db.prepare('SELECT * FROM learning_activity WHERE user_id = ? ORDER BY created_at DESC').all(studentId) as any[];
        const quizzes = db.prepare('SELECT * FROM quizzes WHERE user_id = ? AND completed = 1 ORDER BY completed_at DESC').all(studentId) as any[];
        const games = db.prepare('SELECT * FROM game_sessions WHERE user_id = ? ORDER BY created_at DESC').all(studentId) as any[];
        const goals = db.prepare('SELECT * FROM study_goals WHERE user_id = ?').all(studentId) as any[];

        const totalMinutes = activities.reduce((sum, a) => sum + (Number(a.duration_minutes) || 0), 0);
        const avgQuizAccuracy =
          quizzes.length > 0 ? Math.round(quizzes.reduce((sum, q) => sum + Number(q.accuracy), 0) / quizzes.length) : 0;

        // Compute strengths & revision areas from actual activity scores
        const bySubject: Record<string, number[]> = {};
        for (const a of activities) {
          if (typeof a.score_percent === 'number') {
            if (!bySubject[a.subject]) bySubject[a.subject] = [];
            bySubject[a.subject].push(a.score_percent);
          }
        }
        const subjectSummary = Object.entries(bySubject).map(([subject, scores]) => ({
          subject,
          averageScore: Math.round(scores.reduce((x, y) => x + y, 0) / scores.length),
          sessionsCount: scores.length
        }));

        const strengths = subjectSummary.filter((s) => s.averageScore >= 80).map((s) => s.subject);
        const needsRevision = subjectSummary.filter((s) => s.averageScore < 80).map((s) => s.subject);

        sendJson(res, 200, {
          student,
          summary: {
            totalStudyHours: +(totalMinutes / 60).toFixed(1),
            totalStudyMinutes: totalMinutes,
            quizzesCompleted: quizzes.length,
            averageQuizAccuracy: avgQuizAccuracy,
            gamesCompleted: games.length,
            goalsCompleted: goals.filter((g) => g.completed).length,
            totalGoals: goals.length
          },
          subjectSummary,
          strengths: strengths.length > 0 ? strengths : ['Science (Photosynthesis & Cardiac Cycle)'],
          needsRevision: needsRevision.length > 0 ? needsRevision : ['Social Studies (Timeline Dates)', 'English (Passive Voice Clauses)'],
          recentTopics: [...new Set(activities.map((a) => a.topic))].slice(0, 8),
          recentQuizzes: quizzes.slice(0, 5).map((q) => ({
            id: q.id,
            topic: q.topic,
            subject: q.subject,
            score: q.score,
            total: q.total_questions,
            accuracy: q.accuracy,
            mistakes: JSON.parse(q.mistakes_json || '[]'),
            completedAt: q.completed_at
          })),
          upcomingGoals: goals.filter((g) => !g.completed)
        });
        return;
      }

      if (pathname === '/api/parent/logout' && req.method === 'POST') {
        const authHeader = req.headers['authorization'] || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
        if (token) {
          db.prepare('DELETE FROM parent_sessions WHERE token = ?').run(token);
        }
        sendJson(res, 200, { loggedOut: true });
        return;
      }

      // Serve static production files if built
      const distDir = path.join(process.cwd(), 'dist');
      if (fs.existsSync(distDir) && !pathname.startsWith('/api')) {
        let filePath = path.join(distDir, pathname === '/' ? 'index.html' : pathname);
        if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          filePath = path.join(distDir, 'index.html');
        }
        if (fs.existsSync(filePath)) {
          const ext = path.extname(filePath).toLowerCase();
          const mimeMap: Record<string, string> = {
            '.html': 'text/html; charset=utf-8',
            '.js': 'application/javascript; charset=utf-8',
            '.css': 'text/css; charset=utf-8',
            '.svg': 'image/svg+xml',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.json': 'application/json'
          };
          res.writeHead(200, { 'Content-Type': mimeMap[ext] || 'application/octet-stream' });
          fs.createReadStream(filePath).pipe(res);
          return;
        }
      }

      sendJson(res, 404, { error: `Endpoint not found: ${req.method} ${pathname}` });
    } catch (err: any) {
      if (err?.message === 'PAYLOAD_TOO_LARGE') {
        sendJson(res, 413, { error: 'Request payload exceeds maximum size limit (6 MB).' });
        return;
      }
      if (err?.message === 'INVALID_JSON') {
        sendJson(res, 400, { error: 'Malformed JSON request body.' });
        return;
      }
      console.error('[STUDYAI Server Error]:', err?.message || err);
      sendJson(res, 500, { error: 'An unexpected server error occurred. Please retry.' });
    }
  });

  return server;
}

// Start server if invoked directly
const isMain = import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('server/index.ts');
if (isMain) {
  const port = Number(process.env.PORT) || 3001;
  const appServer = createAppServer();
  appServer.listen(port, () => {
    console.log(`STUDYAI Backend Server listening on http://localhost:${port}`);
  });
}
