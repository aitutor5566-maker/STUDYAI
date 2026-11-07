-- Migration 014: Educational Games Library Schema
-- 7 Interactive Educational Games: Missing Letters, Missing Words, Match Pairs, MCQ Challenge, Word Scramble, True/False, Find the Mistake

-- 1. Games Catalog Table
CREATE TABLE IF NOT EXISTS public.educational_games_catalog (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL, -- 'vocabulary', 'concept', 'logic', 'recall', 'problem_solving'
    icon_name TEXT NOT NULL,
    compatible_subjects JSONB NOT NULL DEFAULT '["Science", "Mathematics", "Social Studies", "English", "Languages", "Computer Science"]'::jsonb,
    supported_difficulties JSONB NOT NULL DEFAULT '["easy", "medium", "hard"]'::jsonb,
    instructions TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Educational Game Sessions
CREATE TABLE IF NOT EXISTS public.educational_game_sessions (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    game_slug TEXT NOT NULL REFERENCES public.educational_games_catalog(slug) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    total_questions INTEGER NOT NULL DEFAULT 5,
    correct_count INTEGER NOT NULL DEFAULT 0,
    incorrect_count INTEGER NOT NULL DEFAULT 0,
    hints_used INTEGER NOT NULL DEFAULT 0,
    score INTEGER NOT NULL DEFAULT 0,
    accuracy_percentage INTEGER NOT NULL DEFAULT 0,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    weak_concepts JSONB NOT NULL DEFAULT '[]'::jsonb,
    mastered_concepts JSONB NOT NULL DEFAULT '[]'::jsonb,
    session_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Educational Game Question Logs
CREATE TABLE IF NOT EXISTS public.educational_game_question_logs (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES public.educational_game_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_index INTEGER NOT NULL,
    question_payload JSONB NOT NULL,
    student_answer JSONB NOT NULL,
    correct_answer JSONB NOT NULL,
    is_correct BOOLEAN NOT NULL,
    score_earned INTEGER NOT NULL DEFAULT 0,
    hints_used INTEGER NOT NULL DEFAULT 0,
    concept_tested TEXT,
    explanation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Student Game Analytics & High Scores
CREATE TABLE IF NOT EXISTS public.student_educational_game_stats (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    game_slug TEXT NOT NULL REFERENCES public.educational_games_catalog(slug) ON DELETE CASCADE,
    total_sessions_completed INTEGER NOT NULL DEFAULT 0,
    total_questions_answered INTEGER NOT NULL DEFAULT 0,
    total_correct_answers INTEGER NOT NULL DEFAULT 0,
    highest_score INTEGER NOT NULL DEFAULT 0,
    average_accuracy INTEGER NOT NULL DEFAULT 0,
    favorite_topic TEXT,
    last_played_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, game_slug)
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_game_sessions_user ON public.educational_game_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_slug ON public.educational_game_sessions(game_slug, topic);
CREATE INDEX IF NOT EXISTS idx_game_question_logs_session ON public.educational_game_question_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_game_stats_user ON public.student_educational_game_stats(user_id);
