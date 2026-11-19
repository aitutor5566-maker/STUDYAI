import { describe, it, expect } from 'vitest';
import {
  STUDY_RUSH_QUESTIONS,
  buildQuestionDeck,
  getAllStudyRushQuestions,
  selectArenaOptions,
  validateStudyRushAnswer
} from './questionBank';
import { DayNightManager } from './DayNightManager';
import { getStudyRushLevelTheme, getZoneAtPosition } from './WorldManager';

describe('STUDY RUSH 3D — SURVIVAL NIGHT Core Systems', () => {
  it('1. Question bank has 64+ questions covering all 8 subjects', () => {
    expect(STUDY_RUSH_QUESTIONS.length).toBeGreaterThanOrEqual(64);

    const requiredSubjects = [
      'Mathematics',
      'Physics',
      'Chemistry',
      'Biology',
      'English',
      'History',
      'Geography',
      'General Knowledge'
    ];
    for (const subj of requiredSubjects) {
      const count = STUDY_RUSH_QUESTIONS.filter((q) => q.subject === subj).length;
      expect(count).toBeGreaterThanOrEqual(8);
    }

    const combined = getAllStudyRushQuestions();
    expect(combined.length).toBeGreaterThan(STUDY_RUSH_QUESTIONS.length);
  });

  it('2. Strict ID-based answer validation and 3-shrine arena option selection', () => {
    for (const q of STUDY_RUSH_QUESTIONS) {
      expect(validateStudyRushAnswer(q, q.correctOptionId)).toBe(true);
      const wrongOption = q.options.find((o) => o.id !== q.correctOptionId)!;
      expect(validateStudyRushAnswer(q, wrongOption.id)).toBe(false);

      const arenaOpts = selectArenaOptions(q);
      expect(arenaOpts.length).toBe(3);
      expect(arenaOpts.some((o) => o.id === q.correctOptionId)).toBe(true);
      const uniqueIds = new Set(arenaOpts.map((o) => o.id));
      expect(uniqueIds.size).toBe(3);
    }
  });

  it('3. Subject & difficulty deck filtering', () => {
    const physDeck = buildQuestionDeck('Physics', 'medium', 10);
    expect(physDeck.length).toBeGreaterThanOrEqual(3);
    expect(physDeck.every((q) => q.subject === 'Physics')).toBe(true);
  });

  it('4. DayNightManager transitions cleanly through Day -> Sunset -> Night -> Sunrise', () => {
    const mgr = new DayNightManager({
      dayDurationSec: 10,
      sunsetDurationSec: 5,
      nightDurationSec: 10,
      sunriseDurationSec: 5
    });

    expect(mgr.getPhase()).toBe('day');
    mgr.advance(11);
    expect(mgr.getPhase()).toBe('sunset');

    const nightEv = mgr.advance(6);
    expect(mgr.getPhase()).toBe('night');
    expect(nightEv.enteredNight).toBe(true);
    expect(mgr.nightCount).toBe(1);

    const sunriseEv = mgr.advance(10);
    expect(mgr.getPhase()).toBe('sunrise');
    expect(sunriseEv.enteredSunrise).toBe(true);

    const skip = mgr.skipToNight();
    expect(skip.enteredNight).toBe(true);
    expect(mgr.getPhase()).toBe('night');
  });

  it('5. Open-world zone detection and 6-territory level progression themes', () => {
    expect(getZoneAtPosition(0, 0)).toBe('village');
    expect(getZoneAtPosition(-30, 0)).toBe('dark_forest');
    expect(getZoneAtPosition(0, -35)).toBe('crystal_cave');
    expect(getZoneAtPosition(32, 0)).toBe('ancient_castle');
    expect(getZoneAtPosition(0, 32)).toBe('science_kingdom');

    const names = [1, 2, 3, 4, 5, 6].map((lvl) => getStudyRushLevelTheme(lvl).name);
    expect(names).toEqual([
      '1. Green Forest',
      '2. Mountain Region',
      '3. Desert Region',
      '4. Snow Region',
      '5. Village Region',
      '6. River & Island Region'
    ]);
  });
});
