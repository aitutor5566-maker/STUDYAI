-- ==============================================================================
-- Migration: 009_student_adaptive_profile.sql
-- Description: Creates student_adaptive_profiles table for personalised, adaptive
--              learning weaknesses, comprehension tracking, and continuous improvement.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.student_adaptive_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    difficult_subjects JSONB NOT NULL DEFAULT '[]'::jsonb,
    difficult_topics JSONB NOT NULL DEFAULT '[]'::jsonb,
    reading_difficulty BOOLEAN NOT NULL DEFAULT false,
    spelling_difficulty BOOLEAN NOT NULL DEFAULT false,
    writing_difficulty BOOLEAN NOT NULL DEFAULT false,
    vocabulary_difficulty BOOLEAN NOT NULL DEFAULT false,
    concept_difficulty BOOLEAN NOT NULL DEFAULT false,
    memory_difficulty BOOLEAN NOT NULL DEFAULT false,
    math_calculation_difficulty BOOLEAN NOT NULL DEFAULT false,
    explanation_style TEXT NOT NULL DEFAULT 'balanced' CHECK (explanation_style IN ('concise', 'balanced', 'deep', 'visual_first')),
    preferred_learning_methods JSONB NOT NULL DEFAULT '["diagrams", "examples"]'::jsonb,
    topic_understanding JSONB NOT NULL DEFAULT '{}'::jsonb,
    recent_feedback JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_adaptive_profiles_user_id ON public.student_adaptive_profiles(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.student_adaptive_profiles ENABLE ROW LEVEL SECURITY;

-- Students can read & update their own adaptive profile
CREATE POLICY "Students can view own adaptive profile"
    ON public.student_adaptive_profiles
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Students can update own adaptive profile"
    ON public.student_adaptive_profiles
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can insert own adaptive profile"
    ON public.student_adaptive_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Verified parents can view linked student's learning profile
CREATE POLICY "Parents can view linked student adaptive profile"
    ON public.student_adaptive_profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.parent_accounts pa
            WHERE pa.parent_id = auth.uid()
              AND pa.student_id = public.student_adaptive_profiles.user_id
              AND pa.status = 'active'
        )
    );
