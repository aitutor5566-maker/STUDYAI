import { describe, expect, it } from 'vitest';
import {
  QuestionProgressionMachine,
  detectRecommendedGraphicsQuality,
  loadGameProgress,
  saveGameProgress
} from './ProgressionController';
import { getStudyRushLevelTheme } from './studyRush3d/WorldManager';

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

describe('Multi-level transitions & saved progress', () => {
  it('progresses consecutively through levels 1 -> 2 -> 3 with distinct Magic Village themes', () => {
    const machine = new QuestionProgressionMachine({ startingLevel: 1, questionsPerLevel: 2 });
    const levelNames: string[] = [];

    for (let lvl = 1; lvl <= 3; lvl++) {
      levelNames.push(getStudyRushLevelTheme(machine.getSnapshot().level).name);
      expect(machine.activateQuestion(`q-${lvl}-1`)).toBe(true);
      expect(
        machine.submitAnswer({ questionId: `q-${lvl}-1`, selectedAnswerId: 'A', correctAnswerId: 'A' }).accepted
      ).toBe(true);
      expect(machine.advance()).toBe('NEXT_QUESTION');

      expect(machine.activateQuestion(`q-${lvl}-2`)).toBe(true);
      const res = machine.submitAnswer({ questionId: `q-${lvl}-2`, selectedAnswerId: 'B', correctAnswerId: 'B' });
      expect(res.levelCompleted).toBe(true);
      expect(machine.advance()).toBe('LEVEL_COMPLETE');
      machine.startNextLevel();
    }

    expect(levelNames).toEqual(['1. Green Forest', '2. Mountain Region', '3. Desert Region']);
    expect(machine.getSnapshot().level).toBe(4);
  });

  it('persists and isolates student game progress across reloads', () => {
    localStorage.clear();

    saveGameProgress({
      gameId: 'sky_striker',
      profileId: 'student-a',
      currentLevel: 2,
      completedLevels: [1],
      bestScore: 540,
      totalCorrect: 5,
      totalAttempts: 6
    });

    saveGameProgress({
      gameId: 'sky_striker',
      profileId: 'student-a',
      currentLevel: 3,
      completedLevels: [2],
      bestScore: 420 // lower score must not overwrite higher bestScore
    });

    const loadedA = loadGameProgress('sky_striker', 'student-a');
    expect(loadedA.currentLevel).toBe(3);
    expect(loadedA.highestUnlockedLevel).toBe(3);
    expect(loadedA.completedLevels).toEqual([1, 2]);
    expect(loadedA.bestScore).toBe(540);

    const loadedB = loadGameProgress('sky_striker', 'student-b');
    expect(loadedB.currentLevel).toBe(1);
    expect(loadedB.bestScore).toBe(0);
  });
});
