-- ==============================================================================
-- STUDYAI — COMPLETE SUPABASE INTEGRATION MIGRATION (011_family_account_supabase_integration.sql)
-- Architecture: ONE FAMILY ACCOUNT -> MULTIPLE STUDENT PROFILES -> INDEPENDENT STUDENT LOGINS
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. USERS TABLE (Linked to auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('parent', 'student', 'educator', 'admin')),
    avatar_url TEXT DEFAULT '/avatars/default.svg',
    phone TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- ==============================================================================
-- 2. FAMILY ROLES & PERMISSIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.family_roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.family_roles (id, name, description) VALUES
    ('family_owner', 'Family Owner', 'Primary family account manager with billing and full administrative authority'),
    ('parent', 'Parent / Guardian', 'Parent with supervisory, consent and academic monitoring authority'),
    ('student', 'Student Member', 'Learner profile with independent login and private learning workspace'),
    ('tutor', 'Family Tutor', 'Educational support role with read-only progress and notes access')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.permissions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'general'
);

INSERT INTO public.permissions (id, name, description, category) VALUES
    ('family:manage', 'Manage Family Settings', 'Can edit family name, invite/remove members', 'family'),
    ('student:create', 'Create Student Profiles', 'Can add new student profiles to the family', 'student'),
    ('student:manage_academic', 'Manage Academic Configuration', 'Can update board, class, and subjects', 'academic'),
    ('student:view_progress', 'View Learning Progress', 'Can inspect student mastery and test analytics', 'analytics'),
    ('notes:read_own', 'Read Own Notes', 'Can read personal AI notes and summaries', 'notes'),
    ('notes:write_own', 'Write Own Notes', 'Can create and edit personal AI notes', 'notes'),
    ('sessions:execute', 'Conduct Learning Sessions', 'Can interact with AI Tutor, 3D Lab, Voice Teacher', 'learning'),
    ('consent:manage', 'Manage COPPA & Legal Consent', 'Can grant or revoke child consent records', 'compliance')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id TEXT NOT NULL REFERENCES public.family_roles(id) ON DELETE CASCADE,
    permission_id TEXT NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
);

INSERT INTO public.role_permissions (role_id, permission_id) VALUES
    ('family_owner', 'family:manage'),
    ('family_owner', 'student:create'),
    ('family_owner', 'student:manage_academic'),
    ('family_owner', 'student:view_progress'),
    ('family_owner', 'consent:manage'),
    ('parent', 'student:create'),
    ('parent', 'student:manage_academic'),
    ('parent', 'student:view_progress'),
    ('parent', 'consent:manage'),
    ('student', 'notes:read_own'),
    ('student', 'notes:write_own'),
    ('student', 'sessions:execute')
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- 3. FAMILIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    max_students INTEGER NOT NULL DEFAULT 5,
    subscription_tier TEXT NOT NULL DEFAULT 'standard' CHECK (subscription_tier IN ('free', 'standard', 'premium', 'family_unlimited')),
    subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'canceled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_families_created_by ON public.families(created_by);

-- ==============================================================================
-- 4. FAMILY MEMBERS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role_id TEXT NOT NULL REFERENCES public.family_roles(id) ON DELETE RESTRICT,
    is_primary_guardian BOOLEAN NOT NULL DEFAULT FALSE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_family_user UNIQUE (family_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_family_members_family ON public.family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user ON public.family_members(user_id);

-- ==============================================================================
-- 5. STUDENT PROFILES (The core student entity)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    slug TEXT UNIQUE, -- e.g. 'student-vishwak' or 'student-new' to bridge existing accounts
    avatar_url TEXT DEFAULT '/avatars/default.svg',
    birth_date DATE,
    current_grade TEXT NOT NULL DEFAULT 'Grade 10',
    current_board TEXT NOT NULL DEFAULT 'CBSE',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    daily_screen_time_limit_mins INTEGER DEFAULT 180,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_profiles_family ON public.student_profiles(family_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_slug ON public.student_profiles(slug);

-- ==============================================================================
-- 6. STUDENT PROFILE ACCESS (Mapping independent logins to student profiles)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.student_profile_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    access_level TEXT NOT NULL DEFAULT 'student' CHECK (access_level IN ('owner_parent', 'student', 'viewer', 'tutor')),
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_profile_user_access UNIQUE (student_profile_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_spa_profile ON public.student_profile_access(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_spa_user ON public.student_profile_access(user_id);

-- ==============================================================================
-- 7. FAMILY INVITATIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.family_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    invited_email TEXT NOT NULL,
    target_student_profile_id UUID REFERENCES public.student_profiles(id) ON DELETE SET NULL,
    role_id TEXT NOT NULL REFERENCES public.family_roles(id) DEFAULT 'student',
    invitation_code TEXT NOT NULL UNIQUE,
    invited_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    accepted_at TIMESTAMPTZ,
    accepted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_family_invitations_email ON public.family_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_family_invitations_code ON public.family_invitations(invitation_code);

-- ==============================================================================
-- 8. USER PERMISSION OVERRIDES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_permission_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    permission_id TEXT NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
    is_granted BOOLEAN NOT NULL DEFAULT TRUE,
    granted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_perm_override UNIQUE (user_id, permission_id, family_id)
);

-- ==============================================================================
-- 9. ACADEMIC PREFERENCES (Per Student Profile)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.academic_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE UNIQUE,
    target_board TEXT NOT NULL DEFAULT 'CBSE',
    class_grade TEXT NOT NULL DEFAULT 'Grade 10',
    academic_year TEXT NOT NULL DEFAULT '2026-2027',
    enrolled_subjects JSONB NOT NULL DEFAULT '["Mathematics", "Science", "Social Science", "English"]'::jsonb,
    stream TEXT DEFAULT 'General',
    examination_goals JSONB DEFAULT '{"target_percentage": 95, "competitive_exams": ["JEE", "NEET", "Olympiad"]}'::jsonb,
    preserve_history_on_promotion BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_acad_pref_profile ON public.academic_preferences(student_profile_id);

-- ==============================================================================
-- 10. LEARNING PREFERENCES (Per Student Profile)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.learning_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE UNIQUE,
    explanation_depth TEXT NOT NULL DEFAULT 'detailed' CHECK (explanation_depth IN ('simple', 'standard', 'detailed', 'rigorous')),
    sensory_preference TEXT NOT NULL DEFAULT 'multimodal' CHECK (sensory_preference IN ('visual', 'auditory', 'textual', 'kinesthetic_interactive', 'multimodal')),
    voice_speed NUMERIC NOT NULL DEFAULT 1.0,
    preferred_voice TEXT NOT NULL DEFAULT 'Nova (Teacher)',
    enable_3d_auto_rotate BOOLEAN NOT NULL DEFAULT TRUE,
    adaptive_difficulty_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    language TEXT NOT NULL DEFAULT 'en-IN',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learn_pref_profile ON public.learning_preferences(student_profile_id);

-- ==============================================================================
-- 11. STUDENT NOTES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.student_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    subject TEXT NOT NULL DEFAULT 'Science',
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    format TEXT NOT NULL DEFAULT 'markdown' CHECK (format IN ('markdown', 'latex', 'json', 'rich_text')),
    key_takeaways JSONB DEFAULT '[]'::jsonb,
    formulas JSONB DEFAULT '[]'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    is_starred BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_notes_profile ON public.student_notes(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_student_notes_topic ON public.student_notes(topic);

-- ==============================================================================
-- 12. LEARNING SESSIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.learning_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    topic_name TEXT NOT NULL,
    subject_name TEXT NOT NULL DEFAULT 'Science',
    session_type TEXT NOT NULL CHECK (session_type IN ('tutor_mode_a', 'tutor_mode_b', 'voice_teacher', '3d_lab', 'notes', 'games_hub', 'weekly_exam', 'notebook_source')),
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    xp_earned INTEGER NOT NULL DEFAULT 0,
    interaction_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learning_sessions_profile ON public.learning_sessions(student_profile_id);

-- ==============================================================================
-- 13. STUDENT PROGRESS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.student_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    mastery_percentage NUMERIC NOT NULL DEFAULT 0.0 CHECK (mastery_percentage BETWEEN 0 AND 100),
    questions_attempted INTEGER NOT NULL DEFAULT 0,
    questions_correct INTEGER NOT NULL DEFAULT 0,
    confidence_score NUMERIC NOT NULL DEFAULT 0.5 CHECK (confidence_score BETWEEN 0.0 AND 1.0),
    last_practiced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_student_topic_progress UNIQUE (student_profile_id, subject, topic)
);

CREATE INDEX IF NOT EXISTS idx_student_progress_profile ON public.student_progress(student_profile_id);

-- ==============================================================================
-- 14. ASSESSMENT RESULTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.assessment_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    score NUMERIC NOT NULL,
    max_score NUMERIC NOT NULL,
    percentage NUMERIC NOT NULL,
    assessment_type TEXT NOT NULL CHECK (assessment_type IN ('quick_quiz', 'weekly_exam', 'chapter_test', 'mock_board')),
    detailed_breakdown JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessment_results_profile ON public.assessment_results(student_profile_id);

-- ==============================================================================
-- 15. STUDENT FILES (Private Storage Metadata)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.student_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    bucket_name TEXT NOT NULL CHECK (bucket_name IN ('student-uploads', 'ai-notes', 'educational-images', 'educational-videos', '3d-assets')),
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    is_processed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_files_profile ON public.student_files(student_profile_id);

-- ==============================================================================
-- 16. CONSENT RECORDS (COPPA & Parental Compliance)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    student_profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    parent_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    consent_type TEXT NOT NULL,
    is_granted BOOLEAN NOT NULL DEFAULT TRUE,
    ip_address TEXT,
    user_agent TEXT,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_consent_records_student ON public.consent_records(student_profile_id);

-- ==============================================================================
-- 17. AUDIT LOGS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID REFERENCES public.families(id) ON DELETE SET NULL,
    actor_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    student_profile_id REFERENCES public.student_profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_family ON public.audit_logs(family_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- ==============================================================================
-- 18. AUTO-UPDATE TIMESTAMP FUNCTION & TRIGGERS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_users_updated_at') THEN
        CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_families_updated_at') THEN
        CREATE TRIGGER trg_families_updated_at BEFORE UPDATE ON public.families FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_student_profiles_updated_at') THEN
        CREATE TRIGGER trg_student_profiles_updated_at BEFORE UPDATE ON public.student_profiles FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_student_notes_updated_at') THEN
        CREATE TRIGGER trg_student_notes_updated_at BEFORE UPDATE ON public.student_notes FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
    END IF;
END $$;
