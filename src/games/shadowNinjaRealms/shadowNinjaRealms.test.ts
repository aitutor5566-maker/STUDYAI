import { describe, expect, it } from 'vitest';
import { selectRealmsQuestions, validateRealmsAnswer } from './questionBank';
import { MINECRAFT_TERRITORIES, NINJA_CHARACTERS, VOXEL_CHARACTERS } from './types';

describe('Shadow Ninja : Minecraft Realms', () => {
  it('provides distinct Ninja and Voxel hero presets and all 6 Minecraft territories', () => {
    expect(NINJA_CHARACTERS.length).toBeGreaterThanOrEqual(3);
    expect(VOXEL_CHARACTERS.length).toBeGreaterThanOrEqual(3);
    expect(MINECRAFT_TERRITORIES.length).toBe(6);
    expect(MINECRAFT_TERRITORIES.map((t) => t.id)).toEqual([
      'emerald_forest',
      'mountain_region',
      'desert_oasis',
      'alpine_snow_peaks',
      'village_region',
      'river_islands'
    ]);
  });

  it('selects curriculum-aligned questions and guards duplicate correct submissions', () => {
    const qs = selectRealmsQuestions('Biology', 'Photosynthesis');
    expect(qs.length).toBeGreaterThan(0);
    const first = qs[0];
    const answered = new Set<string>();

    const wrongOpt = first.options.find((o) => o.id !== first.correctOptionId)!;
    const rWrong = validateRealmsAnswer(first, wrongOpt.id, answered);
    expect(rWrong.accepted).toBe(true);
    expect(rWrong.isCorrect).toBe(false);

    const rRight = validateRealmsAnswer(first, first.correctOptionId, answered);
    expect(rRight.accepted).toBe(true);
    expect(rRight.isCorrect).toBe(true);

    const rDup = validateRealmsAnswer(first, first.correctOptionId, answered);
    expect(rDup.accepted).toBe(false);
  });
});
