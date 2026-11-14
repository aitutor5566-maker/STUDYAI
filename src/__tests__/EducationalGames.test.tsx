import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LearningProvider, useLearning } from '../context/LearningContext';
import { EducationalGamesModal } from '../components/EducationalGamesModal';

// Helper component to trigger openGamesHub
const TestGameLauncher: React.FC = () => {
  const { openGamesHub } = useLearning();
  return (
    <div>
      <button
        type="button"
        onClick={() => openGamesHub('Fractions', 'Maths', 'answer_battle')}
      >
        Open Math Game
      </button>
      <button
        type="button"
        onClick={() => openGamesHub('Solar System', 'Science', 'learning_runner')}
      >
        Open Runner Game
      </button>
      <button
        type="button"
        onClick={() => openGamesHub('Electricity', 'Science', 'space_shooter')}
      >
        Open Space Game
      </button>
      <EducationalGamesModal />
    </div>
  );
};

function renderGameApp() {
  return render(
    <LearningProvider>
      <TestGameLauncher />
    </LearningProvider>
  );
}

describe('3D Educational Games Hub & Question Engine UI', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn((url: any) => {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            topic: 'Fractions',
            subject: 'Maths',
            chapter: 'Fractions',
            difficulty: 'medium',
            questions: [
              {
                id: 'test-q-1',
                question: 'Which fraction is equivalent to one-half?',
                options: ['2/4', '1/3', '3/5', '2/5'],
                correctIndex: 0,
                explanation: 'Two-fourths simplifies to one-half.'
              },
              {
                id: 'test-q-2',
                question: 'What is 3/6 simplified?',
                options: ['1/3', '1/2', '2/3', '3/4'],
                correctIndex: 1,
                explanation: '3/6 reduces to 1/2.'
              }
            ]
          })
      });
    }) as any;
  });

  it('renders all three 3D game options in the setup screen', async () => {
    renderGameApp();
    fireEvent.click(screen.getByRole('button', { name: /Open Math Game/i }));

    expect(screen.getByText(/AI Tutor 3D Educational Games/i)).toBeInTheDocument();
    expect(screen.getByText(/^Answer Shooter$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Answer Runner$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Space Answer Shooter$/i)).toBeInTheDocument();
  });

  it('provides curriculum settings for Grade 1–10, Subject, and Language (English, Telugu, Hindi)', async () => {
    renderGameApp();
    fireEvent.click(screen.getByRole('button', { name: /Open Math Game/i }));

    const gradeSelect = screen.getByLabelText(/Grade/i);
    expect(gradeSelect).toBeInTheDocument();

    const langSelect = screen.getByLabelText(/Language/i);
    expect(langSelect).toBeInTheDocument();
    expect(screen.getAllByRole('option', { name: /English/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('option', { name: /తెలుగు/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /हिंदी/i })).toBeInTheDocument();

    const modeSelect = screen.getByLabelText(/Mode/i);
    expect(modeSelect).toBeInTheDocument();
  });

  it('starts Answer Shooter game, displays the 3D arena HUD, and evaluates shots', async () => {
    renderGameApp();
    fireEvent.click(screen.getByRole('button', { name: /Open Math Game/i }));

    const startBtn = screen.getByRole('button', { name: /Start 3D Educational Game/i });
    fireEvent.click(startBtn);

    await waitFor(() => {
      expect(screen.getByText(/Answer Shooter •/i)).toBeInTheDocument();
      expect(screen.getByText(/(Which fraction is equivalent to one-half|What is 3\/6 simplified)/i)).toBeInTheDocument();
    });

    // Check targets are present
    const targetBtns = screen.getAllByRole('button', { name: /Key \[[A-D]\]/i });
    expect(targetBtns.length).toBe(4);

    // Clicking target fires projectile and shows feedback
    fireEvent.click(targetBtns[0]);
    await waitFor(() => {
      expect(screen.getByText(/(DIRECT HIT|SHIELD HIT)/i)).toBeInTheDocument();
    });
  });

  it('starts Answer Runner game with 3 lane checkpoints', async () => {
    renderGameApp();
    fireEvent.click(screen.getByRole('button', { name: /Open Runner Game/i }));

    const startBtn = screen.getByRole('button', { name: /Start 3D Educational Game/i });
    fireEvent.click(startBtn);

    await waitFor(() => {
      expect(screen.getByText(/Answer Runner/i)).toBeInTheDocument();
    });

    // Expect 3 lane switcher buttons
    expect(screen.getByRole('button', { name: /Lane 1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Lane 2/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Lane 3/i })).toBeInTheDocument();
  });

  it('starts Space Answer Shooter game with alien fleet and arcade fire controls', async () => {
    renderGameApp();
    fireEvent.click(screen.getByRole('button', { name: /Open Space Game/i }));

    const startBtn = screen.getByRole('button', { name: /Start 3D Educational Game/i });
    fireEvent.click(startBtn);

    await waitFor(() => {
      expect(screen.getByText(/Space Answer Shooter/i)).toBeInTheDocument();
    });

    // Expect arcade controls
    expect(screen.getByRole('button', { name: /FIRE/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pause Game/i })).toBeInTheDocument();
  });
});
