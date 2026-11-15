import { describe, it, expect } from 'vitest';
import { requestGameLaunch, THREE_FEATURED_GAMES } from './gameAccessService';

describe('Centralised Game Access Service', () => {
  it('preserves exactly the three featured games', () => {
    expect(THREE_FEATURED_GAMES.map((g) => g.id)).toEqual([
      'war_of_words',
      'study_rush_3d',
      'katana_wisdom'
    ]);
  });

  it('authorizes game launches from AI Tutor with topic & subject context', () => {
    const res = requestGameLaunch({
      gameId: 'study_rush_3d',
      gameName: 'Study Rush 3D — Survival Night',
      launchingPage: 'ai_tutor',
      studentId: 'student-vishwak',
      subject: 'Biology',
      topic: 'Mitosis',
      grade: 10,
      difficulty: 'medium'
    });
    expect(res.authorized).toBe(true);
    expect(res.request?.topic).toBe('Mitosis');
    expect(res.request?.subject).toBe('Biology');
  });

  it('authorizes game launches from Language Learning with objective context', () => {
    const res = requestGameLaunch({
      gameId: 'war_of_words',
      gameName: 'War of Words — Shadow Warrior',
      launchingPage: 'language_learning',
      studentId: 'student-vishwak',
      subject: 'Language',
      topic: 'English Synonyms',
      language: 'English',
      learningObjective: 'Synonyms',
      difficulty: 'medium'
    });
    expect(res.authorized).toBe(true);
    expect(res.warning).toBeUndefined();
  });

  it('rejects game launches from Library, Home, Dashboard, Profile, or other pages', () => {
    for (const origin of ['library', 'home', 'dashboard', 'profile', 'other'] as const) {
      const res = requestGameLaunch({
        gameId: 'katana_wisdom',
        gameName: 'Katana: Shadow Warriors — The Wisdom Battle',
        launchingPage: origin,
        studentId: 'student-vishwak',
        topic: 'Photosynthesis'
      });
      expect(res.authorized).toBe(false);
      expect(res.reason).toContain('not an authorised origin');
    }
  });
});
