import { describe, it, expect } from 'vitest';
import { buildSkyStrikerDeck, SKY_STRIKER_QUESTION_COUNT } from './questionBank';
import { SKY_WORLDS } from './EnvironmentManager';
import { AIRCRAFT_SKINS } from './types';

describe('Study Rush 3D — Sky Striker Engine', () => {
  it('contains at least 50 reviewed curriculum questions', () => {
    expect(SKY_STRIKER_QUESTION_COUNT).toBeGreaterThanOrEqual(50);
  });

  it('builds a 10-question deck with zero duplicates and 3 unique options per question', () => {
    const deck = buildSkyStrikerDeck('All Subjects', 'medium', 8, [], undefined, 10);
    expect(deck.length).toBe(10);

    const ids = new Set(deck.map((q) => q.questionId));
    expect(ids.size).toBe(10);

    for (const q of deck) {
      expect(q.options.length).toBe(3);
      expect(q.options.map((o) => o.label)).toEqual(['A', 'B', 'C']);
      const optIds = new Set(q.options.map((o) => o.answerId));
      expect(optIds.size).toBe(3);
      expect(optIds.has(q.correctAnswerId)).toBe(true);
    }
  });

  it('prioritizes topic-matched questions when launched from AI Tutor', () => {
    const deck = buildSkyStrikerDeck('Science', 'medium', 9, [], 'Mitosis', 10);
    expect(deck[0].topic.toLowerCase()).toContain('mitosis');
  });

  it('supports Revision Flight from missed questions', () => {
    const base = buildSkyStrikerDeck('Mathematics', 'medium', 9, [], undefined, 3);
    const rev = buildSkyStrikerDeck('All Subjects', 'medium', 9, base, undefined, 10);
    expect(rev.length).toBe(3);
    expect(rev.map((q) => q.questionId).sort()).toEqual(base.map((q) => q.questionId).sort());
  });

  it('provides 6 worlds starting with Coastal Sunset and 4 aircraft skins', () => {
    expect(SKY_WORLDS.length).toBe(6);
    expect(SKY_WORLDS[0].id).toBe('coastal_sunset');
    expect(AIRCRAFT_SKINS.length).toBe(4);
  });
});
