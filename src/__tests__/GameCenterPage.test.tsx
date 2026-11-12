import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LearningProvider } from '../context/LearningContext';
import { GameCenterPage } from '../pages/GameCenterPage';

function renderGameCenter() {
  return render(
    <BrowserRouter>
      <LearningProvider>
        <GameCenterPage />
      </LearningProvider>
    </BrowserRouter>
  );
}

describe('GameCenterPage — Dedicated Game Center & Battle World Card Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      })
    ) as any;
  });

  it('renders Game Center header, breadcrumb and flagship STUDYAI BATTLE WORLD card', async () => {
    renderGameCenter();

    expect(screen.getByText(/STUDYAI GAME CENTER/i)).toBeInTheDocument();
    expect(screen.getByText(/Academic 3D Game Center/i)).toBeInTheDocument();
    expect(screen.getByText(/^STUDYAI BATTLE WORLD$/i)).toBeInTheDocument();
    expect(screen.getByText(/FEATURED FLAGSHIP GAME/i)).toBeInTheDocument();
    expect(screen.getByText(/PLAYABLE 3D ENGINE/i)).toBeInTheDocument();

    // Verify Play Now button
    expect(screen.getByRole('button', { name: /PLAY NOW — BATTLE WORLD/i })).toBeInTheDocument();
  });

  it('renders all 5 enclosed voxel biome arena cards', async () => {
    renderGameCenter();

    expect(screen.getByText(/Verdant Meadow/i)).toBeInTheDocument();
    expect(screen.getByText(/Scorched Dunes/i)).toBeInTheDocument();
    expect(screen.getByText(/Glacial Peak/i)).toBeInTheDocument();
    expect(screen.getByText(/Obsidian Keep/i)).toBeInTheDocument();
    expect(screen.getByText(/Ancient Canopy/i)).toBeInTheDocument();
  });

  it('renders mobile touch and desktop controls guide', async () => {
    renderGameCenter();

    expect(screen.getByText(/MOBILE & TABLET TOUCH/i)).toBeInTheDocument();
    expect(screen.getByText(/DESKTOP KEYBOARD & MOUSE/i)).toBeInTheDocument();
    expect(screen.getByText(/Left Virtual Joystick:/i)).toBeInTheDocument();
    expect(screen.getByText(/WASD \/ Arrow Keys:/i)).toBeInTheDocument();
  });

  it('clicking PLAY NOW initiates game launch state', async () => {
    renderGameCenter();

    const playBtn = screen.getByRole('button', { name: /PLAY NOW — BATTLE WORLD/i });
    fireEvent.click(playBtn);

    expect(screen.getByText(/INITIALIZING ARENA\.\.\./i)).toBeInTheDocument();
  });
});
