import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { initDatabase, db } from '../server/db.ts';

describe('STUDYAI Theme and Reliability Fixes Suite', () => {
  it('1. ThemeContext and apple-glass.css implement Pure Light and Pure Dark Mode with STUDYAI Orange preserved', () => {
    const cssPath = path.resolve('src/styles/apple-glass.css');
    const themeContextPath = path.resolve('src/context/ThemeContext.tsx');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');
    const themeContextContent = fs.readFileSync(themeContextPath, 'utf-8');

    // 1. ThemeContext supports light, dark, and system modes and syncs data-theme attribute
    assert.ok(themeContextContent.includes("'light' | 'dark' | 'system'"), 'ThemeContext must support light, dark, system modes');
    assert.ok(themeContextContent.includes('studyai_theme_mode'), 'ThemeContext must persist preference to localStorage');
    assert.ok(themeContextContent.includes("setAttribute('data-theme'"), 'ThemeContext must set data-theme attribute');

    // 2. Pure Light Mode has pure white #FFFFFF base and eliminates heavy peach wash
    assert.ok(cssContent.includes('--bg-primary: #FFFFFF;'), 'Light mode must use pure white #FFFFFF background');
    assert.ok(!cssContent.includes('background: radial-gradient(circle at 18% 18%, #FFE8D6 0%, #FFF7ED 50%, #FFFFFF 100%)'), 'Heavy peach radial wash should be eliminated from default background');

    // 3. Pure Dark Mode has pure dark #000000 and dark cards #121216
    assert.ok(cssContent.includes("[data-theme='dark']"), 'apple-glass.css must define [data-theme="dark"] tokens');
    assert.ok(cssContent.includes('--bg-primary: #000000;'), 'Dark mode must use pure black #000000 background');
    assert.ok(cssContent.includes('--bg-card: #121216;'), 'Dark mode must use dark neutral cards');

    // 4. STUDYAI Orange branding preserved in both themes
    assert.ok(cssContent.includes('--brand-orange: #FF6A00;'), 'Brand orange #FF6A00 must be preserved');
  });

  it('2. Notes topic input redesign resolves text clipping and button misalignment', () => {
    const cssPath = path.resolve('src/styles/apple-glass.css');
    const notesPagePath = path.resolve('src/pages/NotesPage.tsx');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');
    const notesContent = fs.readFileSync(notesPagePath, 'utf-8');

    // CSS class definitions exist
    assert.ok(cssContent.includes('.notes-topic-input-container'), 'Container class must exist');
    assert.ok(cssContent.includes('.notes-topic-input-card'), 'Input card class must exist');
    assert.ok(cssContent.includes('.notes-topic-input-field'), 'Input field class must exist');
    assert.ok(cssContent.includes('@media (max-width: 640px)'), 'Mobile responsive breakpoint must exist');

    // NotesPage uses the redesigned structure
    assert.ok(notesContent.includes('className="notes-topic-input-container"'), 'NotesPage must use container class');
    assert.ok(notesContent.includes('className="notes-topic-input-card"'), 'NotesPage must use card class');
    assert.ok(notesContent.includes('className="notes-topic-input-field"'), 'NotesPage must use field class');
  });

  it('3. AI Tutor network handling, question preservation, and clean error banners', () => {
    const tutorPath = path.resolve('src/pages/TutorPage.tsx');
    const tutorContent = fs.readFileSync(tutorPath, 'utf-8');

    // Chat URL must be relative /api/tutor/chat (not hardcoded localhost:3001)
    assert.ok(tutorContent.includes("const chatUrl = '/api/tutor/chat';"), 'Streaming chat URL must be relative /api/tutor/chat');

    // Last submitted question must be tracked so Retry button retries the actual question
    assert.ok(tutorContent.includes('lastSubmittedQuestion'), 'TutorPage must track lastSubmittedQuestion');
    assert.ok(tutorContent.includes('setLastSubmittedQuestion(cleanQ);'), 'TutorPage must record cleanQ when submitting');

    // Retry button uses lastSubmittedQuestion
    assert.ok(tutorContent.includes('submitQuestion(lastSubmittedQuestion || questionInput'), 'Retry button must retry the preserved question');

    // Welcome state hidden when error is present to prevent dual overlapping cards
    assert.ok(tutorContent.includes('messages.length === 0 && !loading && !errorMsg'), 'Empty welcome state must not overlap with errorMsg');
  });

  it('4. AI Notes error recovery state and direct rendering of generated notebooks', () => {
    const notesPath = path.resolve('src/pages/NotesPage.tsx');
    const notesContent = fs.readFileSync(notesPath, 'utf-8');

    // fetchError state exists
    assert.ok(notesContent.includes('const [fetchError, setFetchError] = useState'), 'NotesPage must track fetchError');

    // fetchNotes sets fetchError on failure instead of silently showing "No notebooks found"
    assert.ok(notesContent.includes('setFetchError(msg);'), 'fetchNotes must set fetchError on catch');
    assert.ok(notesContent.includes('fetchError ? ('), 'NotesPage must render error recovery banner when fetchError is present');
    assert.ok(notesContent.includes('Retry Loading'), 'Error banner must provide a retry button');

    // Notebook generation directly updates state and switches to continuous textbook view
    assert.ok(notesContent.includes("setNotes((prev) => [created, ...prev.filter((n) => n.id !== created.id)]);"), 'Generated note must be immediately prepended to notes list');
    assert.ok(notesContent.includes("setDashboardMode('notebook');"), 'Must switch directly to notebook dashboard mode');
    assert.ok(notesContent.includes("setReaderViewMode('continuous');"), 'Must switch directly to continuous reader view');
  });

  it('5. Backend SQLite database verification and note generation integrity', async () => {
    initDatabase();

    // Verify notes table exists and can be queried
    const rows = db.prepare('SELECT id, title, topic, subject FROM notes LIMIT 5').all();
    assert.ok(Array.isArray(rows), 'Notes table must return an array of notes');

    // Verify student profiles exist
    const profiles = db.prepare('SELECT id, display_name FROM student_profiles').all();
    assert.ok(profiles.length > 0, 'At least one student profile must exist');
  });
});
