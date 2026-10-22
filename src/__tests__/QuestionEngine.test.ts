import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateQuestion,
  shuffleArray,
  prepareQuestionForShooter,
  prepareQuestionForRunner,
  QuestionEngine
} from '../games/QuestionEngine';
import { ProgressionController } from '../games/ProgressionController';
import { EducationalQuestion, SharedGameSettings } from '../games/types';

describe('AI Tutor QuestionEngine & Progression System', () => {
  const sampleQuestion: EducationalQuestion = {
    id: 'test-q-1',
    grade: 5,
    subject: 'Maths',
    chapter: 'Fractions',
    topic: 'Equivalent Fractions',
    language: 'English',
    difficulty: 1,
    question: 'Which fraction is equivalent to one-half?',
    options: [
      { id: 'A', text: '2/4' },
      { id: 'B', text: '1/3' },
      { id: 'C', text: '3/5' },
      { id: 'D', text: '2/5' }
    ],
    correct_option_id: 'A',
    explanation: 'Two-fourths simplifies to one-half.',
    hint: 'Divide numerator and denominator by 2.'
  };

  const defaultSettings: SharedGameSettings = {
    grade: 5,
    subject: 'Maths',
    chapter: 'Fractions',
    topic: 'Equivalent Fractions',
    language: 'English',
    startingDifficulty: 'medium',
    gameMode: 'practice',
    sessionLength: 10
  };

  it('validates genuine educational questions and rejects malformed items', () => {
    expect(validateQuestion(sampleQuestion)).toBe(true);

    // Rejects questions with duplicate options
    const duplicateOptsQuestion = {
      ...sampleQuestion,
      options: [
        { id: 'A', text: '2/4' },
        { id: 'B', text: '2/4' },
        { id: 'C', text: '3/5' },
        { id: 'D', text: '2/5' }
      ]
    };
    expect(validateQuestion(duplicateOptsQuestion)).toBe(false);

    // Rejects questions where correct_option_id is missing from options
    const missingCorrectQuestion = {
      ...sampleQuestion,
      correct_option_id: 'C',
      options: [
        { id: 'A', text: '2/4' },
        { id: 'B', text: '1/3' }
      ]
    };
    expect(validateQuestion(missingCorrectQuestion)).toBe(false);
  });

  it('shuffles arrays without mutating source', () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8];
    const shuffled = shuffleArray(original);
    expect(shuffled.length).toBe(original.length);
    expect(new Set(shuffled)).toEqual(new Set(original));
  });

  it('prepares shooter questions with 4 options and preserves stable correct_option_id', () => {
    const prepared = prepareQuestionForShooter(sampleQuestion);
    expect(prepared.options.length).toBe(4);
    expect(prepared.correct_option_id).toBe('A');

    // The option with id 'A' must still have the correct text '2/4'
    const correctOpt = prepared.options.find((o) => o.id === 'A');
    expect(correctOpt).toBeDefined();
    expect(correctOpt?.text).toBe('2/4');
  });

  it('prepares runner questions with exactly 3 distinct lanes and preserves correct answer', () => {
    const runnerQ = prepareQuestionForRunner(sampleQuestion);
    expect(runnerQ.options.length).toBe(3);
    expect(runnerQ.correct_option_id).toBe('A');

    // Correct option must be included in the 3 lanes
    const hasCorrect = runnerQ.options.some((o) => o.id === 'A' && o.text === '2/4');
    expect(hasCorrect).toBe(true);

    // Must have 2 unique distractors
    const distractors = runnerQ.options.filter((o) => o.id !== 'A');
    expect(distractors.length).toBe(2);
    expect(distractors[0].text).not.toBe(distractors[1].text);
  });

  it('evaluates answers strictly by ID, preventing auto-selection bias', () => {
    const engine = new QuestionEngine(defaultSettings);
    engine.addQuestions([sampleQuestion]);

    const q = engine.getNextQuestion('answer_shooter');
    expect(q).not.toBeNull();

    // Selecting 'A' is correct
    const resultA = engine.evaluateAnswer('A', 200);
    expect(resultA?.isCorrect).toBe(true);
    expect(resultA?.pointsEarned).toBe(200);

    // Selecting 'B' is incorrect
    const resultB = engine.evaluateAnswer('B', 200);
    expect(resultB?.isCorrect).toBe(false);
    expect(resultB?.pointsEarned).toBe(0);
    expect(resultB?.correctOptionId).toBe('A');
  });

  it('prevents duplicate questions within the same session', () => {
    const engine = new QuestionEngine(defaultSettings);
    engine.addQuestions([sampleQuestion, sampleQuestion, sampleQuestion]);

    // Only one should be added to queue because IDs are identical
    expect(engine.getQueueLength()).toBe(1);
  });

  it('promotes level after reaching 80% accuracy over minimum required attempts', () => {
    const progression = new ProgressionController('easy', 'practice');
    expect(progression.getLevel()).toBe(1);

    // 3 correct answers in a row
    progression.recordAnswer(true);
    progression.recordAnswer(true);
    const step3 = progression.recordAnswer(true);

    // 3/3 = 100% >= 80%, so promoted!
    expect(step3.promoted).toBe(true);
    expect(step3.newLevel).toBe(2);
    expect(progression.getLevel()).toBe(2);
  });

  it('suggests hints when student struggles with consecutive incorrect answers', () => {
    const progression = new ProgressionController('medium', 'practice');
    const step1 = progression.recordAnswer(false);
    expect(step1.shouldProvideHint).toBe(false);

    const step2 = progression.recordAnswer(false);
    expect(step2.shouldProvideHint).toBe(true);
  });
});
