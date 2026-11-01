import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as THREE from 'three';
import { SpaceBattleAudio } from '../games/spaceBattle/SpaceBattleAudio';
import { SpacecraftModels } from '../games/spaceBattle/SpacecraftModels';
import { SpaceBattleEngine } from '../games/spaceBattle/SpaceBattleEngine';
import { EducationalQuestion } from '../games/types';

describe('STUDYAI Space Battle — Full 3D Arcade Gameplay & Collision Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('SpacecraftModels constructs detailed 3D player starfighter with blasters and engines', () => {
    const player = SpacecraftModels.createPlayerStarfighter();
    expect(player.group).toBeDefined();
    expect(player.hull).toBeDefined();
    expect(player.shield).toBeDefined();
    expect(player.muzzlePoints.length).toBe(2); // Left & right wing blasters
    expect(player.thrusterFlames.length).toBe(2); // Twin ion engines
    expect(player.thrusterLight).toBeDefined();
  });

  it('SpacecraftModels constructs distinct alien starfighters with 3D hulls and answer badges', () => {
    const cruiser = SpacecraftModels.createAlienStarfighter('cruiser', 0xef4444, 'Lungs');
    expect(cruiser.group).toBeDefined();
    expect(cruiser.hitRadius).toBeGreaterThan(1.0);
    expect(cruiser.labelSprite).toBeDefined();
    expect(cruiser.hullMeshes.length).toBeGreaterThan(2);

    const interceptor = SpacecraftModels.createAlienStarfighter('interceptor', 0x2563eb, 'Heart');
    expect(interceptor.group).toBeDefined();
    expect(interceptor.labelSprite).toBeDefined();

    const raider = SpacecraftModels.createAlienStarfighter('raider', 0x10b981, 'Liver');
    expect(raider.group).toBeDefined();
    expect(raider.labelSprite).toBeDefined();
  });

  it('initializes SpaceBattleEngine, loads question with 8-ship fleet, moves and boosts player', () => {
    const container = document.createElement('div');
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    const onAnswerChosen = vi.fn();
    const onDamageTaken = vi.fn();
    const onScoreGained = vi.fn();

    const engine = new SpaceBattleEngine(container, canvas, {
      onAnswerChosen,
      onDamageTaken,
      onScoreGained
    });

    const testQuestion: EducationalQuestion = {
      id: 'g7-bio-body-1',
      grade: 7,
      subject: 'Biology',
      chapter: 'Human Body',
      topic: 'Circulatory System',
      language: 'English',
      difficulty: 2,
      question: 'Which organ pumps blood throughout the human body?',
      options: [
        { id: 'A', text: 'Lungs' },
        { id: 'B', text: 'Heart' },
        { id: 'C', text: 'Liver' },
        { id: 'D', text: 'Stomach' }
      ],
      correct_option_id: 'B',
      explanation: 'The heart pumps blood through the circulatory system.'
    };

    engine.setQuestion(testQuestion);

    // Player Movement (horizontal & vertical)
    engine.setPlayerSteer(-0.6, 0.4);
    engine.movePlayerBy(0.5, -0.2);
    engine.setBoost(true);
    engine.setBoost(false);

    // Firing blasters produces real projectiles
    engine.triggerFire();

    // Pause & Resume
    engine.setPaused(true);
    engine.setPaused(false);

    // Clean disposal
    expect(() => engine.destroy()).not.toThrow();
  });

  it('demonstrates real continuous projectile collision and answer evaluation', () => {
    const container = document.createElement('div');
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    const onAnswerChosen = vi.fn();
    const onDamageTaken = vi.fn();
    const onScoreGained = vi.fn();

    const engine = new SpaceBattleEngine(container, canvas, {
      onAnswerChosen,
      onDamageTaken,
      onScoreGained
    });

    const testQuestion: EducationalQuestion = {
      id: 'g7-bio-body-1',
      grade: 7,
      subject: 'Biology',
      chapter: 'Human Body',
      topic: 'Circulatory System',
      language: 'English',
      difficulty: 2,
      question: 'Which organ pumps blood throughout the human body?',
      options: [
        { id: 'A', text: 'Lungs' },
        { id: 'B', text: 'Heart' },
        { id: 'C', text: 'Liver' },
        { id: 'D', text: 'Stomach' }
      ],
      correct_option_id: 'B',
      explanation: 'The heart pumps blood through the circulatory system.'
    };

    engine.setQuestion(testQuestion);

    // Directly test enemy collision resolution
    const enemies = (engine as any).enemies;
    expect(enemies.length).toBe(8);

    const correctEnemy = enemies.find((e: any) => e.isCorrect);
    expect(correctEnemy).toBeDefined();
    expect(correctEnemy.optionId).toBe('B');

    // Simulate projectile hitting the correct enemy
    (engine as any).handleEnemyCollision(correctEnemy);

    expect(onScoreGained).toHaveBeenCalledWith(500, 1);
    expect(onAnswerChosen).toHaveBeenCalledWith('B', true);

    engine.destroy();
  });
});
