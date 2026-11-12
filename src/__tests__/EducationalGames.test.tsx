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
        onClick={() => openGamesHub('Fractions', 'Maths')}
      >
        Open Battle World
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

describe('STUDYAI BATTLE WORLD — Game Center Complete Rebuild UI Tests', () => {
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
                explanation: 'Two-fourths simplifies directly to one-half.'
              }
            ]
          })
      });
    }) as any;
  });

  it('renders STUDYAI BATTLE WORLD lobby, curriculum selectors, and 5 Voxel Arenas', async () => {
    renderGameApp();
    fireEvent.click(screen.getByRole('button', { name: /Open Battle World/i }));

    expect(screen.getByText(/STUDYAI BATTLE WORLD/i)).toBeInTheDocument();
    expect(screen.getByText(/3D VOXEL RPG/i)).toBeInTheDocument();
    expect(screen.getByText(/MASTER YOUR SYLLABUS IN THE BATTLE WORLD/i)).toBeInTheDocument();

    // Verify 5 Arena Biomes are displayed
    expect(screen.getByText(/Verdant Meadow/i)).toBeInTheDocument();
    expect(screen.getByText(/Scorched Dunes/i)).toBeInTheDocument();
    expect(screen.getByText(/Glacial Peak/i)).toBeInTheDocument();
    expect(screen.getByText(/Obsidian Keep/i)).toBeInTheDocument();
    expect(screen.getByText(/Ancient Canopy/i)).toBeInTheDocument();

    // Verify Enter Button
    expect(screen.getByRole('button', { name: /ENTER BATTLE WORLD/i })).toBeInTheDocument();
  });

  it('provides curriculum settings for Grade 1–12, Subject, and Language (English, Telugu, Hindi)', async () => {
    renderGameApp();
    fireEvent.click(screen.getByRole('button', { name: /Open Battle World/i }));

    const gradeSelect = screen.getByLabelText(/Grade/i);
    expect(gradeSelect).toBeInTheDocument();

    const subjectSelect = screen.getByLabelText(/Subject/i);
    expect(subjectSelect).toBeInTheDocument();

    const langSelect = screen.getByLabelText(/Language/i);
    expect(langSelect).toBeInTheDocument();
    expect(screen.getAllByRole('option', { name: /English/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('option', { name: /Telugu/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Hindi/i })).toBeInTheDocument();
  });

  it('enters 3D Battle World, displays Top-Center Continuous Question HUD and mobile controls', async () => {
    renderGameApp();
    fireEvent.click(screen.getByRole('button', { name: /Open Battle World/i }));

    const enterBtn = screen.getByRole('button', { name: /ENTER BATTLE WORLD/i });
    fireEvent.click(enterBtn);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^ANSWER$/i })).toBeInTheDocument();
      expect(screen.getAllByText(/STRIKE/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/JUMP/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('opens Multiple Choice Question Dialog from Question HUD and displays answer feedback', async () => {
    renderGameApp();
    fireEvent.click(screen.getByRole('button', { name: /Open Battle World/i }));

    const enterBtn = screen.getByRole('button', { name: /ENTER BATTLE WORLD/i });
    fireEvent.click(enterBtn);

    // Wait for question to be loaded into the HUD
    await waitFor(() => {
      expect(screen.getByText(/Which fraction is equivalent to one-half\?/i)).toBeInTheDocument();
    });

    const answerHudBtn = screen.getByRole('button', { name: /^ANSWER$/i });
    fireEvent.click(answerHudBtn);

    // Question options should be visible inside the dialog
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /2\/4/i })).toBeInTheDocument();
    });

    // Click option A
    fireEvent.click(screen.getByRole('button', { name: /2\/4/i }));

    await waitFor(() => {
      expect(screen.getByText(/Correct! \+100 Knowledge XP/i)).toBeInTheDocument();
    });
  });
});
