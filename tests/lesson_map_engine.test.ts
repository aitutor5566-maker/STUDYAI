import test from 'node:test';
import assert from 'node:assert/strict';
import { initDatabase } from '../server/db.ts';
import { lessonMapEngine } from '../server/lessonMapEngine.ts';

initDatabase();

test('LessonMapEngine computes prerequisites, enforces real mastery, and generates 6-phase exam roadmap', async () => {
  const userId = `test-lm-${Date.now()}`;

  // Initial Physics graph: Charge is available, Voltage & Resistance are locked until Charge is completed
  const g1 = lessonMapEngine.getSubjectGraph(userId, 'Physics', 10);
  const charge = g1.nodes.find((n) => n.id === 'phy-10-charge')!;
  const voltage = g1.nodes.find((n) => n.id === 'phy-10-voltage')!;
  assert.equal(charge.status, 'available');
  assert.equal(voltage.status, 'locked');

  // Failing assessment marks needs_revision, not mastered, and keeps Voltage locked
  const failRes = lessonMapEngine.recordAssessment(userId, 'phy-10-charge', 40, 60);
  assert.equal(failRes.status, 'needs_revision');
  const g2 = lessonMapEngine.getSubjectGraph(userId, 'Physics', 10);
  assert.equal(g2.nodes.find((n) => n.id === 'phy-10-voltage')!.status, 'locked');

  // Passing >=80% marks mastered and unlocks Voltage & Resistance!
  const passRes = lessonMapEngine.recordAssessment(userId, 'phy-10-charge', 90, 120);
  assert.equal(passRes.status, 'mastered');
  const g3 = lessonMapEngine.getSubjectGraph(userId, 'Physics', 10);
  assert.equal(g3.nodes.find((n) => n.id === 'phy-10-voltage')!.status, 'available');
  assert.equal(g3.stats.masteredCount, 1);

  // 6-phase exam roadmap adapts to exam date
  const roadmap = lessonMapEngine.generateExamRoadmap(userId, {
    subject: 'Physics',
    grade: 10,
    board: 'CBSE',
    examName: 'Pre-Board Exam',
    examDate: new Date(Date.now() + 20 * 86400_000).toISOString().slice(0, 10)
  });
  assert.equal(roadmap.phases.length, 6);
  assert.ok(roadmap.daysRemaining >= 6);

  // Parent/Teacher summary reflects real XP
  const summary = lessonMapEngine.getParentTeacherSummary(userId);
  assert.ok(summary.totalXp >= 150);

  // Custom syllabus lesson map generation & editing
  const custom = await lessonMapEngine.generateCustomLessonMap(userId, {
    subject: 'Physics',
    grade: 10,
    board: 'CBSE',
    chapter: 'Electromagnetic Induction',
    syllabusText: 'Magnetic Flux\nFaradays Law\nLenz Law',
    sourceLabel: 'NCERT Ch 13'
  });
  assert.equal(custom.nodes.length, 3);
  const listed = lessonMapEngine.listCustomLessonMaps(userId);
  assert.equal(listed.length, 1);
  const upd = lessonMapEngine.updateCustomLessonMap(userId, custom.id, custom.nodes, true);
  assert.equal(upd.updated, true);
  assert.equal(upd.approved, true);
});
