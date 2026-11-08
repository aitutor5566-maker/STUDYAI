-- Migration 016: KATANA: SHADOW WARRIORS — THE WISDOM BATTLE Schema
-- Real educational 2.5D action-adventure game integrated with STUDYAI

-- 1. KATANA Game Sessions Table
CREATE TABLE IF NOT EXISTS public.katana_sessions (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mode TEXT NOT NULL CHECK (mode IN ('campaign', 'practice', 'endless')),
    environment TEXT NOT NULL DEFAULT 'moonlit_bamboo_forest',
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    grade INTEGER NOT NULL DEFAULT 10,
    board TEXT NOT NULL DEFAULT 'CBSE',
    current_stage INTEGER NOT NULL DEFAULT 1,
    current_wave INTEGER NOT NULL DEFAULT 1,
    player_hp INTEGER NOT NULL DEFAULT 100,
    player_max_hp INTEGER NOT NULL DEFAULT 100,
    spirit_energy INTEGER NOT NULL DEFAULT 0,
    score INTEGER NOT NULL DEFAULT 0,
    combo_count INTEGER NOT NULL DEFAULT 0,
    accuracy_percent INTEGER NOT NULL DEFAULT 0,
    xp_earned INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'victory', 'defeat', 'abandoned')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. KATANA Question Bank Table
CREATE TABLE IF NOT EXISTS public.katana_question_bank (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    grade INTEGER NOT NULL,
    board TEXT NOT NULL,
    question_type TEXT NOT NULL, -- 'mcq_battle', 'fill_blank', 'true_false', 'concept_match', 'boss_challenge'
    prompt TEXT NOT NULL,
    options_json JSONB NOT NULL,
    correct_answer_hash TEXT NOT NULL,
    explanation TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    concept_tag TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. KATANA Battle Attempts Table
CREATE TABLE IF NOT EXISTS public.katana_attempts (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES public.katana_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL REFERENCES public.katana_question_bank(id) ON DELETE CASCADE,
    student_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    damage_dealt INTEGER NOT NULL DEFAULT 0,
    combo_count INTEGER NOT NULL DEFAULT 0,
    time_taken_ms INTEGER NOT NULL DEFAULT 0,
    concept_tag TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. KATANA Topic Mastery Tracking Table
CREATE TABLE IF NOT EXISTS public.katana_topic_mastery (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    mastery_score INTEGER NOT NULL DEFAULT 0, -- 0 to 100
    total_attempts INTEGER NOT NULL DEFAULT 0,
    correct_attempts INTEGER NOT NULL DEFAULT 0,
    weak_concepts_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    last_played_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, subject, topic)
);

-- 5. KATANA Automatic Revision Queue Table
CREATE TABLE IF NOT EXISTS public.katana_revision_queue (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    weak_concept TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'high',
    attempts_failed INTEGER NOT NULL DEFAULT 1,
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. KATANA Inventory & Cosmetics Table
CREATE TABLE IF NOT EXISTS public.katana_inventory (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('outfit', 'katana_blade', 'armor', 'aura')),
    item_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    rarity TEXT NOT NULL DEFAULT 'common',
    is_equipped BOOLEAN NOT NULL DEFAULT FALSE,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, item_type, item_id)
);

-- 7. KATANA Level Progress Table
CREATE TABLE IF NOT EXISTS public.katana_level_progress (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    environment_id TEXT NOT NULL,
    stage_index INTEGER NOT NULL,
    stars INTEGER NOT NULL DEFAULT 0,
    high_score INTEGER NOT NULL DEFAULT 0,
    cleared BOOLEAN NOT NULL DEFAULT FALSE,
    cleared_at TIMESTAMPTZ,
    UNIQUE(user_id, environment_id, stage_index)
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.katana_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.katana_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.katana_topic_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.katana_revision_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.katana_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.katana_level_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can only access own katana sessions"
ON public.katana_sessions FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Students can only access own katana attempts"
ON public.katana_attempts FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Students can only access own topic mastery"
ON public.katana_topic_mastery FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Students can only access own revision queue"
ON public.katana_revision_queue FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Students can only access own katana inventory"
ON public.katana_inventory FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Students can only access own level progress"
ON public.katana_level_progress FOR ALL
USING (auth.uid() = user_id);
