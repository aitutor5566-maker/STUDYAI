import test from 'node:test';
import assert from 'node:assert';
import { katanaEngine } from '../server/katanaEngine.ts';
import { db } from '../server/db.ts';

test('1. KATANA Game Catalog: Environments, Moonlit Bamboo Forest & Warrior Profile', async () => {
  const catalog = katanaEngine.getCatalog('student-vishwak');

  assert.ok(catalog, 'Catalog is returned');
  assert.strictEqual(catalog.gameName, 'KATANA — SHADOW WARRIORS: THE WISDOM BATTLE');
  assert.ok(catalog.environments.length >= 6, 'Contains 6 cinematic environments');

  const forest = catalog.environments.find((e) => e.id === 'moonlit_bamboo_forest');
  assert.ok(forest, 'Moonlit Bamboo Forest is present');
  assert.strictEqual(forest?.isUnlocked, true, 'First environment is unlocked by default');
  assert.ok(forest?.bgGradient.length >= 2, 'Has parallax sky gradient');

  assert.ok(catalog.warriorProfile, 'Warrior profile returned');
  assert.ok(catalog.warriorProfile.warriorLevel >= 1, 'Warrior level calculated');
  assert.strictEqual(catalog.warriorProfile.userId, 'student-vishwak');
});

test('2. KATANA Battle Session Start: HP, Waves, & Moonlit Bamboo Forest initialization', async () => {
  const session = katanaEngine.startSession({
    userId: 'student-vishwak',
    mode: 'campaign',
    environment: 'moonlit_bamboo_forest',
    subject: 'Science',
    topic: 'Photosynthesis',
    stageIndex: 1
  });

  assert.ok(session.sessionId, 'Session created with unique ID');
  assert.strictEqual(session.playerHp, 100, 'Initial warrior HP is 100');
  assert.strictEqual(session.currentWave, 1, 'Starts at wave 1');
  assert.strictEqual(session.totalWaves, 5, 'Total waves set to 5');
  assert.strictEqual(session.enemy.hp, 100, 'Minion HP is 100');
  assert.strictEqual(session.enemy.isBoss, false, 'Stage 1 minion is not boss');
  assert.ok(session.currentQuestion, 'Initial battle question provided');
});

test('3. Zero-Exposure Anti-Cheat Security: Correct answers not exposed in client question payloads', async () => {
  const questions = katanaEngine.getQuestionsForBattle({
    subject: 'Science',
    topic: 'Photosynthesis',
    grade: 10,
    board: 'CBSE',
    count: 3
  });

  assert.ok(questions.length > 0, 'Questions returned');
  for (const q of questions) {
    assert.ok(q.prompt, 'Has prompt');
    assert.ok(Array.isArray(q.options), 'Has answer options');
    assert.strictEqual((q as any).correct, undefined, 'Correct answer property is NEVER exposed to client');
    assert.strictEqual((q as any).correct_answer_hash, undefined, 'Hash is not exposed in clean payload');
  }
});

test('4. Battle Strike Validation (Correct Answer): Combo multiplier, spirit charge & enemy damage', async () => {
  const session = katanaEngine.startSession({
    userId: 'student-vishwak',
    mode: 'campaign',
    subject: 'Science',
    topic: 'Photosynthesis',
    stageIndex: 1
  });

  // Verify correct answer for Water (H2O)
  const strike = katanaEngine.validateBattleStrike({
    sessionId: session.sessionId,
    userId: 'student-vishwak',
    questionId: 'kq-photo-1',
    studentAnswer: 'Water (H2O)',
    timeTakenMs: 1400
  });

  assert.strictEqual(strike.isCorrect, true, 'Strike is validated as correct');
  assert.ok(strike.damageDealt >= 35, 'Dealt warrior damage to shadow enemy');
  assert.strictEqual(strike.playerDamageTaken, 0, 'Player took zero damage');
  assert.strictEqual(strike.comboCount, 1, 'Combo increased to 1');
  assert.ok(strike.spiritEnergy > 0, 'Spirit energy charged');
  assert.ok(strike.explanation.includes('Water') || strike.explanation.includes('Photolysis'), 'Educational explanation provided');
});

test('5. Battle Strike Validation (Incorrect Answer): Enemy retaliation & Automatic Revision Queue', async () => {
  const session = katanaEngine.startSession({
    userId: 'student-vishwak',
    mode: 'campaign',
    subject: 'Science',
    topic: 'Photosynthesis',
    stageIndex: 1
  });

  // Purposefully submit wrong answer
  const strike = katanaEngine.validateBattleStrike({
    sessionId: session.sessionId,
    userId: 'student-vishwak',
    questionId: 'kq-photo-1',
    studentAnswer: 'Carbon dioxide (CO2)',
    timeTakenMs: 1800
  });

  assert.strictEqual(strike.isCorrect, false, 'Strike is incorrect');
  assert.strictEqual(strike.damageDealt, 0, 'Dealt zero damage on wrong answer');
  assert.strictEqual(strike.playerDamageTaken, 20, 'Player takes 20 damage from enemy retaliation');
  assert.strictEqual(strike.comboCount, 0, 'Combo reset to 0');
  assert.ok(strike.explanation.length > 10, 'Pedagogical explanation teaches correct concept');

  // Verify concept added to Revision Queue
  const revision = katanaEngine.getRevisionMissions('student-vishwak');
  assert.ok(revision.missions.length >= 1, 'Weak concept queued for automatic revision');
  assert.ok(revision.missions.some((m) => m.weakConcept.includes('Photolysis')), 'Queued specific weak concept');
});

test('6. Chapter Final Boss Battle: Scaled HP & Multi-Concept Challenge', async () => {
  const bossSession = katanaEngine.startSession({
    userId: 'student-vishwak',
    mode: 'campaign',
    subject: 'Science',
    topic: 'Structure of the Human Heart',
    stageIndex: 5 // Chapter Final Boss
  });

  assert.strictEqual(bossSession.currentStage, 5);
  assert.strictEqual(bossSession.enemy.isBoss, true, 'Flagged as Boss encounter');
  assert.strictEqual(bossSession.enemy.hp, 250, 'Boss HP scaled to 250');
  assert.ok(bossSession.enemy.name.includes('Boss') || bossSession.enemy.name.includes('Warlord'), 'Boss titled appropriately');
});

test('7. Session Victory, Star Ratings, & High Score Persistence', async () => {
  const session = katanaEngine.startSession({
    userId: 'student-vishwak',
    mode: 'campaign',
    subject: 'Science',
    topic: 'Photosynthesis',
    stageIndex: 1
  });

  const summary = katanaEngine.completeSession(session.sessionId, 'student-vishwak', true);

  assert.strictEqual(summary.victory, true);
  assert.ok(summary.xpEarned >= 150, 'Awarded victory XP');
  assert.ok(summary.stars >= 1, 'Awarded stage stars');
  assert.strictEqual(summary.nextStageUnlocked, 2, 'Stage 2 unlocked on Stage 1 clear');

  // Verify persistence in level progress table
  const progress = db.prepare('SELECT * FROM katana_level_progress WHERE user_id = ? AND environment_id = ? AND stage_index = ?')
    .get('student-vishwak', 'moonlit_bamboo_forest', 1) as any;
  assert.ok(progress, 'Progress persisted in database');
  assert.strictEqual(progress.cleared, 1, 'Marked as cleared');
});

test('8. Multi-Student Data Isolation: Student A cannot tamper with Student B session', async () => {
  const sessionA = katanaEngine.startSession({
    userId: 'student-vishwak',
    mode: 'campaign',
    subject: 'Science',
    topic: 'Photosynthesis'
  });

  // Attempt to validate strike from student-alex
  assert.throws(() => {
    katanaEngine.validateBattleStrike({
      sessionId: sessionA.sessionId,
      userId: 'student-alex', // Unauthorized student
      questionId: 'kq-photo-1',
      studentAnswer: 'Water (H2O)',
      timeTakenMs: 1000
    });
  }, /unauthorized/i, 'Rejects cross-student session access');
});
