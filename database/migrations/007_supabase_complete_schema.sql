-- ==============================================================================
-- STUDYAI — COMPLETE PRODUCTION SUPABASE MIGRATION (007_supabase_complete_schema.sql)
-- Integrates all 17 required tables, indexes, timestamps, and Row Level Security (RLS)
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- Table 1: profiles
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'parent', 'teacher', 'admin', 'superadmin')),
    grade TEXT NOT NULL DEFAULT 'Grade 10',
    board TEXT NOT NULL DEFAULT 'CBSE',
    avatar_url TEXT DEFAULT '/avatars/default.svg',
    streak_days INTEGER NOT NULL DEFAULT 0,
    total_points INTEGER NOT NULL DEFAULT 0,
    parent_passcode_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ------------------------------------------------------------------------------
-- Table 2: parent_accounts
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.parent_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    passcode_hash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'revoked')),
    daily_time_limit_minutes INTEGER NOT NULL DEFAULT 120,
    curfew_start TIME,
    curfew_end TIME,
    allow_exam_view BOOLEAN NOT NULL DEFAULT TRUE,
    allow_progress_view BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_parent_student UNIQUE (parent_user_id, student_user_id)
);

CREATE INDEX IF NOT EXISTS idx_parent_accounts_parent ON public.parent_accounts(parent_user_id);
CREATE INDEX IF NOT EXISTS idx_parent_accounts_student ON public.parent_accounts(student_user_id);

-- ------------------------------------------------------------------------------
-- Table 3: subjects
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    icon TEXT DEFAULT 'book',
    color_hex TEXT DEFAULT '#FF6A00',
    grade_level TEXT NOT NULL DEFAULT 'Grade 10',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subjects_code ON public.subjects(code);

-- ------------------------------------------------------------------------------
-- Table 4: topics
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    has_3d_model BOOLEAN NOT NULL DEFAULT FALSE,
    model_3d_id TEXT,
    order_index INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_subject_slug UNIQUE (subject_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_topics_subject ON public.topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_topics_slug ON public.topics(slug);

-- ------------------------------------------------------------------------------
-- Table 5: learning_sessions
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.learning_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    topic_name TEXT NOT NULL,
    subject_name TEXT NOT NULL DEFAULT 'Science',
    session_type TEXT NOT NULL CHECK (session_type IN ('tutor_mode_a', 'tutor_mode_b', '3d_lab', 'notes', 'game', 'exam', 'focus')),
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    xp_earned INTEGER NOT NULL DEFAULT 0,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learning_sessions_user ON public.learning_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_created ON public.learning_sessions(created_at DESC);

-- ------------------------------------------------------------------------------
-- Table 6: notes (ai_notes)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    topic TEXT NOT NULL,
    subject TEXT NOT NULL DEFAULT 'Science',
    content_markdown TEXT NOT NULL,
    structured_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    flashcards JSONB NOT NULL DEFAULT '[]'::jsonb,
    source_file_url TEXT,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_user ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_topic ON public.notes(topic);

-- ------------------------------------------------------------------------------
-- Table 7: generated_content
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.generated_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('diagram_svg', 'audio_lesson', 'structured_lesson', 'flashcard_deck', 'summary')),
    topic TEXT NOT NULL,
    subject TEXT NOT NULL DEFAULT 'Science',
    payload TEXT NOT NULL,
    media_url TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_generated_content_topic ON public.generated_content(topic);
CREATE INDEX IF NOT EXISTS idx_generated_content_type ON public.generated_content(content_type);

-- ------------------------------------------------------------------------------
-- Table 8: uploaded_files
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.uploaded_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    bucket_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_uploaded_files_user ON public.uploaded_files(user_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_bucket ON public.uploaded_files(bucket_name);

-- ------------------------------------------------------------------------------
-- Table 9: questions
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    topic_name TEXT NOT NULL,
    subject_name TEXT NOT NULL DEFAULT 'Science',
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C')),
    marks INTEGER NOT NULL DEFAULT 1,
    explanation TEXT NOT NULL,
    difficulty_level TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_topic ON public.questions(topic_name);

-- ------------------------------------------------------------------------------
-- Table 10: exam_results
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exam_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    exam_title TEXT NOT NULL,
    subject TEXT NOT NULL,
    total_marks INTEGER NOT NULL DEFAULT 40,
    score_obtained NUMERIC(5,2) NOT NULL,
    percentage NUMERIC(5,2) NOT NULL,
    passed BOOLEAN NOT NULL DEFAULT TRUE,
    section_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    answers_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exam_results_user ON public.exam_results(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_created ON public.exam_results(created_at DESC);

-- ------------------------------------------------------------------------------
-- Table 11: game_progress
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.game_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    game_type TEXT NOT NULL CHECK (game_type IN ('fighting_progression', 'shooting_drill', 'preference_learning')),
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    high_score INTEGER NOT NULL DEFAULT 0,
    highest_stage INTEGER NOT NULL DEFAULT 1,
    total_correct INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    accuracy_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.0,
    unlocked_combos JSONB NOT NULL DEFAULT '[]'::jsonb,
    last_played_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_game_topic UNIQUE (user_id, game_type, topic)
);

CREATE INDEX IF NOT EXISTS idx_game_progress_user ON public.game_progress(user_id);

-- ------------------------------------------------------------------------------
-- Table 12: focus_sessions
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.focus_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_duration_minutes INTEGER NOT NULL DEFAULT 25,
    completed_duration_minutes INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed', 'interrupted')),
    ambient_sound TEXT DEFAULT 'rain',
    notes_taken INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_focus_sessions_user ON public.focus_sessions(user_id);

-- ------------------------------------------------------------------------------
-- Table 13: study_schedule
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.study_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_study_schedule_user ON public.study_schedule(user_id);

-- ------------------------------------------------------------------------------
-- Table 14: permissions
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    module TEXT NOT NULL,
    action TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table 15: user_roles
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_name TEXT NOT NULL CHECK (role_name IN ('student', 'parent', 'teacher', 'admin', 'superadmin')),
    granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_role_pair UNIQUE (user_id, role_name)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);

-- ------------------------------------------------------------------------------
-- Table 16: usage_quotas
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.usage_quotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    tutor_messages_used INTEGER NOT NULL DEFAULT 0,
    tutor_messages_limit INTEGER NOT NULL DEFAULT 500,
    diagram_generations_used INTEGER NOT NULL DEFAULT 0,
    diagram_generations_limit INTEGER NOT NULL DEFAULT 50,
    audio_seconds_used INTEGER NOT NULL DEFAULT 0,
    audio_seconds_limit INTEGER NOT NULL DEFAULT 3600,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_period UNIQUE (user_id, period_start)
);

CREATE INDEX IF NOT EXISTS idx_usage_quotas_user ON public.usage_quotas(user_id);

-- ------------------------------------------------------------------------------
-- Table 17: generation_jobs
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.generation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_type TEXT NOT NULL CHECK (job_type IN ('socratic_lesson', 'diagram_synthesis', 'audio_narration', 'notes_summary', 'exam_generation')),
    topic TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    progress_percentage INTEGER NOT NULL DEFAULT 0,
    result_payload JSONB,
    error_message TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_generation_jobs_user ON public.generation_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_status ON public.generation_jobs(status);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_jobs ENABLE ROW LEVEL SECURITY;

-- Helper function: Is user an admin or superadmin?
CREATE OR REPLACE FUNCTION public.is_admin_or_superadmin(user_uid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_uid AND role IN ('admin', 'superadmin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. profiles policies
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin_or_superadmin(auth.uid()));

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 2. parent_accounts policies
CREATE POLICY "Parents and linked students can view parent account" ON public.parent_accounts
    FOR SELECT USING (auth.uid() = parent_user_id OR auth.uid() = student_user_id OR public.is_admin_or_superadmin(auth.uid()));

CREATE POLICY "Parents can update controls" ON public.parent_accounts
    FOR UPDATE USING (auth.uid() = parent_user_id OR public.is_admin_or_superadmin(auth.uid()));

-- 3. subjects & topics policies (Public read, admin write)
CREATE POLICY "Authenticated users can read subjects" ON public.subjects
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage subjects" ON public.subjects
    FOR ALL USING (public.is_admin_or_superadmin(auth.uid()));

CREATE POLICY "Authenticated users can read topics" ON public.topics
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage topics" ON public.topics
    FOR ALL USING (public.is_admin_or_superadmin(auth.uid()));

-- 4. learning_sessions policies
CREATE POLICY "Students manage own learning sessions" ON public.learning_sessions
    FOR ALL USING (
        auth.uid() = user_id OR 
        public.is_admin_or_superadmin(auth.uid()) OR
        EXISTS (SELECT 1 FROM public.parent_accounts WHERE parent_user_id = auth.uid() AND student_user_id = user_id AND allow_progress_view = true)
    );

-- 5. notes policies
CREATE POLICY "Students manage own notes" ON public.notes
    FOR ALL USING (auth.uid() = user_id);

-- 6. generated_content policies
CREATE POLICY "Users can read relevant generated content" ON public.generated_content
    FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id OR public.is_admin_or_superadmin(auth.uid()));

CREATE POLICY "Users can create generated content" ON public.generated_content
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 7. uploaded_files policies
CREATE POLICY "Users can access own uploaded files" ON public.uploaded_files
    FOR ALL USING (
        auth.uid() = user_id OR 
        public.is_admin_or_superadmin(auth.uid()) OR
        EXISTS (SELECT 1 FROM public.parent_accounts WHERE parent_user_id = auth.uid() AND student_user_id = user_id)
    );

-- 8. questions policies
CREATE POLICY "Authenticated users can read questions" ON public.questions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage questions" ON public.questions
    FOR ALL USING (public.is_admin_or_superadmin(auth.uid()));

-- 9. exam_results policies
CREATE POLICY "Students and linked parents can read exam results" ON public.exam_results
    FOR SELECT USING (
        auth.uid() = user_id OR 
        public.is_admin_or_superadmin(auth.uid()) OR
        EXISTS (SELECT 1 FROM public.parent_accounts WHERE parent_user_id = auth.uid() AND student_user_id = user_id AND allow_exam_view = true)
    );

CREATE POLICY "Students can record exam results" ON public.exam_results
    FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin_or_superadmin(auth.uid()));

-- 10. game_progress policies
CREATE POLICY "Students manage own game progress" ON public.game_progress
    FOR ALL USING (
        auth.uid() = user_id OR 
        public.is_admin_or_superadmin(auth.uid()) OR
        EXISTS (SELECT 1 FROM public.parent_accounts WHERE parent_user_id = auth.uid() AND student_user_id = user_id)
    );

-- 11. focus_sessions policies
CREATE POLICY "Students manage own focus sessions" ON public.focus_sessions
    FOR ALL USING (auth.uid() = user_id OR public.is_admin_or_superadmin(auth.uid()));

-- 12. study_schedule policies
CREATE POLICY "Students and linked parents can view schedule" ON public.study_schedule
    FOR SELECT USING (
        auth.uid() = user_id OR 
        public.is_admin_or_superadmin(auth.uid()) OR
        EXISTS (SELECT 1 FROM public.parent_accounts WHERE parent_user_id = auth.uid() AND student_user_id = user_id)
    );

CREATE POLICY "Students can update schedule" ON public.study_schedule
    FOR ALL USING (auth.uid() = user_id);

-- 13. permissions & user_roles policies
CREATE POLICY "Authenticated users can read permissions" ON public.permissions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can read own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin_or_superadmin(auth.uid()));

CREATE POLICY "Admins can manage roles" ON public.user_roles
    FOR ALL USING (public.is_admin_or_superadmin(auth.uid()));

-- 14. usage_quotas & generation_jobs policies
CREATE POLICY "Users can read own usage quotas" ON public.usage_quotas
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin_or_superadmin(auth.uid()));

CREATE POLICY "Users can read and manage own generation jobs" ON public.generation_jobs
    FOR ALL USING (auth.uid() = user_id OR public.is_admin_or_superadmin(auth.uid()));
