import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LearningProvider } from '../context/LearningContext';
import { TutorPage } from '../pages/TutorPage';

function renderTutorPage() {
  return render(
    <BrowserRouter>
      <LearningProvider>
        <TutorPage />
      </LearningProvider>
    </BrowserRouter>
  );
}

describe('AI Tutor - Multilingual & Multi-Grade Frontend', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Mock fetch for health and conversations
    global.fetch = vi.fn((url: any) => {
      if (String(url).includes('/api/tutor/health')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              service: 'AI Tutor FastAPI Backend',
              status: 'ok',
              configured_model: 'qwen2.5:7b',
              accessible: true
            })
        });
      }
      if (String(url).includes('/api/tutor/conversations')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { id: 'conv-photosynthesis', topic: 'Photosynthesis', subject: 'Science' }
            ])
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    }) as any;
  });

  it('renders AI Tutor brand identity and Local Ollama status badge', async () => {
    renderTutorPage();
    expect(screen.getByRole('heading', { name: /AI Tutor/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Local Ollama • Qwen2.5:7b/i)).toBeInTheDocument();
    expect(screen.getByText(/AI Tutor: Local & Private/i)).toBeInTheDocument();
  });

  it('provides Language selection for English, Telugu (తెలుగు), and Hindi (हिंदी)', async () => {
    renderTutorPage();
    const teluguBtn = screen.getByRole('button', { name: 'తెలుగు' });
    const hindiBtn = screen.getByRole('button', { name: 'हिंदी' });
    const englishBtn = screen.getByRole('button', { name: 'English' });

    expect(teluguBtn).toBeInTheDocument();
    expect(hindiBtn).toBeInTheDocument();
    expect(englishBtn).toBeInTheDocument();

    // Clicking Telugu switches language
    fireEvent.click(teluguBtn);
    await waitFor(() => {
      expect(screen.getByText(/ఈ రోజు మీరు ఏ అంశాన్ని నేర్చుకోవాలనుకుంటున్నారు/i)).toBeInTheDocument();
    });

    // Clicking Hindi switches language
    fireEvent.click(hindiBtn);
    await waitFor(() => {
      expect(screen.getByText(/आज आप कौन सा विषय पढ़ना चाहते हैं/i)).toBeInTheDocument();
    });
  });

  it('provides Grade selection from Grade 1 to 10 with pedagogical bands', async () => {
    renderTutorPage();
    const gradeSelect = screen.getByLabelText(/Select School Grade/i);
    expect(gradeSelect).toBeInTheDocument();

    // Default Grade 10 shows High School band
    expect(screen.getByText(/High School/i)).toBeInTheDocument();

    // Switch to Grade 1
    fireEvent.change(gradeSelect, { target: { value: '1' } });
    await waitFor(() => {
      expect(screen.getByText(/Foundational/i)).toBeInTheDocument();
    });

    // Switch to Grade 4
    fireEvent.change(gradeSelect, { target: { value: '4' } });
    await waitFor(() => {
      expect(screen.getByText(/Elementary/i)).toBeInTheDocument();
    });
  });

  it('provides Subject selection covering core school subjects', () => {
    renderTutorPage();
    const subjectSelect = screen.getByLabelText(/Select Subject/i);
    expect(subjectSelect).toBeInTheDocument();

    const expectedSubjects = ['Science', 'Maths', 'English', 'Telugu', 'Hindi', 'Social Studies', 'Computer Science'];
    expectedSubjects.forEach((sub) => {
      expect(screen.getByRole('option', { name: sub })).toBeInTheDocument();
    });
  });

  it('renders microphone speech input button and question input bar', () => {
    renderTutorPage();
    const micButton = screen.getByTitle(/Speak question/i);
    expect(micButton).toBeInTheDocument();

    const input = screen.getByLabelText(/Ask AI Tutor a question/i);
    expect(input).toBeInTheDocument();

    const sendBtn = screen.getByLabelText(/Send Question/i);
    expect(sendBtn).toBeInTheDocument();
  });
});
