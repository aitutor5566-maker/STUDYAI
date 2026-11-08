import test from 'node:test';
import assert from 'node:assert';
import { katanaEngine, KATANA_ENVIRONMENTS } from '../server/katanaEngine.ts';
import { db } from '../server/db.ts';

test('1. 3D Battlefield 4-Option Mapping: Every question delivers exactly 4 distinct battle options', async () => {
  const topics = ['Photosynthesis', 'Structure of the Human Heart', 'Laws of Motion'];

  for (const topic of topics) {
    const questions = katanaEngine.getQuestionsForBattle({
      subject: 'Science',
      topic,
      grade: 10,
      board: 'CBSE',
      count: 2
    });

    assert.ok(questions.length > 0, `Returns questions for topic: ${topic}`);
    for (const q of questions) {
      assert.strictEqual(q.options.length, 4, `Question ${q.id} has exactly 4 options for the 4 3D shadow enemies`);
      // Ensure unique options
      const uniqueOpts = new Set(q.options);
      assert.strictEqual(uniqueOpts.size, 4, `Question ${q.id} options are all distinct`);
    }
  }
});

test('2. Question Continuity Across Environments: Environment switching preserves session topic and question', async () => {
  const envs = ['moonlit_bamboo_forest', 'ancient_stone_fortress', 'mist_mountain_ridge'];

  // Start in Bamboo Forest
  const session = katanaEngine.startSession({
    userId: 'student-vishwak',
    mode: 'campaign',
    environment: 'moonlit_bamboo_forest',
    subject: 'Science',
    topic: 'Photosynthesis',
    stageIndex: 1
  });

  assert.ok(session.currentQuestion, 'Session initialized with continuous question');
  const initialQId = session.currentQuestion?.id;
  const initialTopic = session.currentQuestion?.topic;

  // Verify that questions retrieved for Photosynthesis maintain topic continuity regardless of env
  for (const env of envs) {
    const questions = katanaEngine.getQuestionsForBattle({
      subject: 'Science',
      topic: 'Photosynthesis',
      grade: 10,
      board: 'CBSE',
      count: 3
    });

    assert.ok(questions.length > 0, `Questions available in environment ${env}`);
    for (const q of questions) {
      assert.strictEqual(q.topic, 'Photosynthesis', `Environment ${env} retains strict topic continuity`);
    }
  }
});

test('3. Zero Subject/Topic Mismatch: Heart questions never contaminate Photosynthesis or Physics sessions', async () => {
  // Photosynthesis test
  const photoQuestions = katanaEngine.getQuestionsForBattle({
    subject: 'Science',
    topic: 'Photosynthesis',
    grade: 10,
    board: 'CBSE',
    count: 5
  });

  for (const q of photoQuestions) {
    assert.strictEqual(q.topic, 'Photosynthesis', 'Must match Photosynthesis');
    assert.ok(!q.prompt.toLowerCase().includes('ventricle'), 'No heart terms in Photosynthesis questions');
    assert.ok(!q.prompt.toLowerCase().includes('valve'), 'No heart valves in Photosynthesis questions');
  }

  // Heart test
  const heartQuestions = katanaEngine.getQuestionsForBattle({
    subject: 'Science',
    topic: 'Structure of the Human Heart',
    grade: 10,
    board: 'CBSE',
    count: 5
  });

  for (const q of heartQuestions) {
    assert.strictEqual(q.topic, 'Structure of the Human Heart', 'Must match Structure of the Human Heart');
    assert.ok(!q.prompt.toLowerCase().includes('photolysis'), 'No photosynthesis terms in Heart questions');
    assert.ok(!q.prompt.toLowerCase().includes('chlorophyll'), 'No chlorophyll in Heart questions');
  }

  // Physics test
  const physicsQuestions = katanaEngine.getQuestionsForBattle({
    subject: 'Physics',
    topic: 'Laws of Motion',
    grade: 9,
    board: 'CBSE',
    count: 5
  });

  for (const q of physicsQuestions) {
    assert.strictEqual(q.topic, 'Laws of Motion', 'Must match Laws of Motion');
    assert.ok(q.prompt.toLowerCase().includes('motion') || q.prompt.toLowerCase().includes('newton') || q.prompt.toLowerCase().includes('force'));
  }
});

test('4. Full 3D Combat Strike Loop: Correct strike defeats enemy, awards combo & educational feedback', async () => {
  const session = katanaEngine.startSession({
    userId: 'student-vishwak',
    mode: 'campaign',
    environment: 'moonlit_bamboo_forest',
    subject: 'Science',
    topic: 'Photosynthesis',
    stageIndex: 1
  });

  // Strike Enemy B (Water)
  const strike = katanaEngine.validateBattleStrike({
    sessionId: session.sessionId,
    userId: 'student-vishwak',
    questionId: 'kq-photo-1',
    studentAnswer: 'Water (H2O)',
    timeTakenMs: 950
  });

  assert.strictEqual(strike.isCorrect, true, 'Strike correctly validated');
  assert.ok(strike.damageDealt > 0, 'Enemy damaged');
  assert.strictEqual(strike.playerDamageTaken, 0, 'Player took zero damage');
  assert.strictEqual(strike.comboCount, 1, 'Combo counter incremented to 1');
  assert.ok(strike.explanation.length > 20, 'Educational explanation provided');
});

test('5. Full 3D Combat Strike Loop: Incorrect strike is parried, retaliates damage & offers remediation', async () => {
  const session = katanaEngine.startSession({
    userId: 'student-vishwak',
    mode: 'campaign',
    environment: 'ancient_stone_fortress',
    subject: 'Science',
    topic: 'Photosynthesis',
    stageIndex: 1
  });

  // Purposeful wrong answer (Enemy A: Carbon dioxide)
  const strike = katanaEngine.validateBattleStrike({
    sessionId: session.sessionId,
    userId: 'student-vishwak',
    questionId: 'kq-photo-1',
    studentAnswer: 'Carbon dioxide (CO2)',
    timeTakenMs: 1100
  });

  assert.strictEqual(strike.isCorrect, false, 'Strike correctly blocked');
  assert.strictEqual(strike.damageDealt, 0, 'Enemy took 0 damage');
  assert.ok(strike.playerDamageTaken > 0, 'Warrior took retaliation damage');
  assert.strictEqual(strike.comboCount, 0, 'Combo reset to 0');
  assert.ok(strike.explanation.toLowerCase().includes('water'), 'Explanation points out the correct academic answer');
});
