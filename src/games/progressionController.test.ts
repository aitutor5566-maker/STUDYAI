import { describe, expect, it } from 'vitest';
import {
  QuestionProgressionMachine,
  detectRecommendedGraphicsQuality
} from './ProgressionController';

describe('QuestionProgressionMachine', () => {
  it('enforces the 7-state lifecycle and prevents duplicate scoring', () => {
    const machine = new QuestionProgressionMachine({
      startingLevel: 1,
      questionsPerLevel: 2,
      expectedSubject: 'Physics',
      expectedTopic: 'Forces'
    });

    expect(machine.getState()).toBe('READY');
    expect(machine.isQuestionConsistent('Physics', 'Newton Laws & Forces')).toBe(true);
    expect(machine.isQuestionConsistent('History', 'World War I')).toBe(false);

    expect(machine.activateQuestion('q1')).toBe(true);
    expect(machine.getState()).toBe('QUESTION_ACTIVE');

    const firstEval = machine.submitAnswer({
      questionId: 'q1',
      selectedAnswerId: 'A',
      correctAnswerId: 'A',
      basePoints: 100
    });
    expect(firstEval).toEqual({
      accepted: true,
      isCorrect: true,
      pointsAwarded: 100,
      levelCompleted: false
    });
    expect(machine.getState()).toBe('FEEDBACK');

    // Duplicate submission on the same question must be rejected
    const duplicateEval = machine.submitAnswer({
      questionId: 'q1',
      selectedAnswerId: 'A',
      correctAnswerId: 'A',
      basePoints: 100
    });
    expect(duplicateEval.accepted).toBe(false);
    expect(machine.getSnapshot().score).toBe(100);

    expect(machine.advance()).toBe('NEXT_QUESTION');
    expect(machine.activateQuestion('q2')).toBe(true);

    const secondEval = machine.submitAnswer({
      questionId: 'q2',
      selectedAnswerId: 'B',
      correctAnswerId: 'B',
      basePoints: 100
    });
    expect(secondEval.accepted).toBe(true);
    expect(secondEval.pointsAwarded).toBe(120); // streak bonus
    expect(secondEval.levelCompleted).toBe(true);

    expect(machine.advance()).toBe('LEVEL_COMPLETE');
    const nextLvl = machine.startNextLevel();
    expect(nextLvl).toBe(2);
    expect(machine.getState()).toBe('READY');
    expect(machine.getSnapshot().questionsAnsweredInLevel).toBe(0);
    expect(machine.getSnapshot().score).toBe(220);
  });
});

describe('detectRecommendedGraphicsQuality', () => {
  it('selects appropriate quality tiers from device capability hints', () => {
    expect(
      detectRecommendedGraphicsQuality({ prefersReducedMotion: true, hardwareConcurrency: 16, deviceMemory: 32 })
    ).toBe('low');

    expect(
      detectRecommendedGraphicsQuality({ hardwareConcurrency: 2, deviceMemory: 2, isTouchDevice: false })
    ).toBe('low');

    expect(
      detectRecommendedGraphicsQuality({ hardwareConcurrency: 6, deviceMemory: 6, isTouchDevice: true })
    ).toBe('medium');

    expect(
      detectRecommendedGraphicsQuality({
        hardwareConcurrency: 6,
        deviceMemory: 4,
        devicePixelRatio: 1,
        viewportWidth: 1440,
        isTouchDevice: false
      })
    ).toBe('high');

    expect(
      detectRecommendedGraphicsQuality({
        hardwareConcurrency: 10,
        deviceMemory: 16,
        devicePixelRatio: 2,
        viewportWidth: 1920,
        isTouchDevice: false
      })
    ).toBe('ultra');
  });
});
