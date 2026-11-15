import { describe, it, expect } from 'vitest';
import {
  WAR_OF_WORDS_QUESTIONS,
  buildWarOfWordsDeck,
  selectThreeTargets,
  validateWarOfWordsAnswer
} from './questionBank';

describe('WAR OF WORDS — STUDY RUSH 3D Core Systems', () => {
  it('1. Question bank has 100+ reviewed questions across all 9 English categories', () => {
    expect(WAR_OF_WORDS_QUESTIONS.length).toBeGreaterThanOrEqual(108);

    const categories = [
      'Vocabulary Quest',
      'Synonym Battle',
      'Antonym Battle',
      'Missing Word',
      'Spelling Challenge',
      'Grammar Battle',
      'Sentence Formation',
      'Idioms & Phrases',
      'Picture Word Quest'
    ];
    for (const cat of categories) {
      const count = WAR_OF_WORDS_QUESTIONS.filter((q) => q.category === cat).length;
      expect(count).toBeGreaterThanOrEqual(12);
    }

    for (const q of WAR_OF_WORDS_QUESTIONS) {
      expect(q.targetWord.length).toBeGreaterThan(0);
      expect(q.pronunciation.length).toBeGreaterThan(0);
      expect(q.meaning.length).toBeGreaterThan(5);
      expect(q.exampleSentence.length).toBeGreaterThan(5);
      expect(q.explanation.length).toBeGreaterThan(5);
    }
  });

  it('2. 3-target selection always includes correctOptionId and 2 distinct distractors', () => {
    for (const q of WAR_OF_WORDS_QUESTIONS) {
      const targets = selectThreeTargets(q);
      expect(targets.length).toBe(3);
      expect(targets.some((t) => t.id === q.correctOptionId)).toBe(true);
      const uniqueIds = new Set(targets.map((t) => t.id));
      expect(uniqueIds.size).toBe(3);
    }
  });

  it('3. Strict ID-based validation & duplicate-attack prevention (100 KP once per question)', () => {
    const q = WAR_OF_WORDS_QUESTIONS[0];
    const evaluated = new Set<string>();

    const firstAttempt = validateWarOfWordsAnswer(q, q.correctOptionId, evaluated);
    expect(firstAttempt.accepted).toBe(true);
    expect(firstAttempt.isCorrect).toBe(true);
    expect(firstAttempt.pointsAwarded).toBe(100);

    // Repeated attack on the same question must be rejected
    const duplicateAttempt = validateWarOfWordsAnswer(q, q.correctOptionId, evaluated);
    expect(duplicateAttempt.accepted).toBe(false);
    expect(duplicateAttempt.pointsAwarded).toBe(0);

    // Incorrect answer on another question awards 0 points
    const q2 = WAR_OF_WORDS_QUESTIONS[1];
    const wrongOpt = q2.options.find((o) => o.id !== q2.correctOptionId)!;
    const wrongAttempt = validateWarOfWordsAnswer(q2, wrongOpt.id, evaluated);
    expect(wrongAttempt.accepted).toBe(true);
    expect(wrongAttempt.isCorrect).toBe(false);
    expect(wrongAttempt.pointsAwarded).toBe(0);
  });

  it('4. Deck builder supports all modes including Revision Mode', () => {
    const synDeck = buildWarOfWordsDeck('synonym_battle', 'All Categories', 'medium', 7);
    expect(synDeck.length).toBeGreaterThanOrEqual(6);
    expect(synDeck.every((q) => q.category === 'Synonym Battle')).toBe(true);

    const missed = [WAR_OF_WORDS_QUESTIONS[0], WAR_OF_WORDS_QUESTIONS[12]];
    const revDeck = buildWarOfWordsDeck('revision_mode', 'All Categories', 'medium', 7, missed);
    expect(revDeck.length).toBe(2);
  });
});
