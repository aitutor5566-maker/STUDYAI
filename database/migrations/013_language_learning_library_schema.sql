-- ==============================================================================
-- STUDYAI MIGRATION 013: AI Speaking Skills & Multilingual Language Learning Library
-- Supports: English, Telugu, Hindi, Japanese, French, German, Spanish (Extensible)
-- Features: 8-Stage Progressive Pathways, Dual Language System (Target + Support Language),
-- Speaking Skills Engine, Interactive Games, Achievements, and Course Completion Tracking
-- ==============================================================================

-- 1. Supported Languages Catalog
CREATE TABLE IF NOT EXISTS public.supported_languages (
    code VARCHAR(10) PRIMARY KEY, -- 'en', 'te', 'hi', 'ja', 'fr', 'de', 'es'
    name VARCHAR(100) NOT NULL,
    native_name VARCHAR(100) NOT NULL,
    script_name VARCHAR(100) NOT NULL,
    flag_emoji VARCHAR(10) NOT NULL,
    description TEXT NOT NULL,
    speech_recognition_code VARCHAR(20) NOT NULL,
    speech_synthesis_voice VARCHAR(100) NOT NULL,
    stages_count INTEGER NOT NULL DEFAULT 8,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Language Courses & Stages
CREATE TABLE IF NOT EXISTS public.language_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    language_code VARCHAR(10) NOT NULL REFERENCES public.supported_languages(code) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    level VARCHAR(50) NOT NULL DEFAULT 'Beginner to Advanced',
    total_stages INTEGER NOT NULL DEFAULT 8,
    total_lessons INTEGER NOT NULL DEFAULT 24,
    estimated_hours INTEGER NOT NULL DEFAULT 30,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.language_course_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.language_courses(id) ON DELETE CASCADE,
    stage_number INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    subtitle VARCHAR(300) NOT NULL,
    pedagogical_focus VARCHAR(100) NOT NULL, -- 'alphabet', 'vocabulary', 'sentence_formation', 'grammar', 'speaking_listening', 'reading_writing', 'real_world', 'advanced'
    total_lessons INTEGER NOT NULL DEFAULT 3,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(course_id, stage_number)
);

-- 3. Lessons, Vocabulary & Grammar Concepts
CREATE TABLE IF NOT EXISTS public.language_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_id UUID NOT NULL REFERENCES public.language_course_stages(id) ON DELETE CASCADE,
    lesson_number INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    vocabulary_items_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    grammar_notes_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    speaking_prompts_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    listening_audio_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    interactive_exercises_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    estimated_minutes INTEGER NOT NULL DEFAULT 15,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(stage_id, lesson_number)
);

-- 4. Student Language Enrolments & Independent Progress
CREATE TABLE IF NOT EXISTS public.student_language_enrolments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL REFERENCES public.supported_languages(code) ON DELETE CASCADE,
    support_language_code VARCHAR(10) NOT NULL DEFAULT 'en', -- Explanation language (e.g. te for Telugu, en for English, hi for Hindi)
    is_primary_active BOOLEAN NOT NULL DEFAULT FALSE,
    current_stage INTEGER NOT NULL DEFAULT 1,
    current_lesson_number INTEGER NOT NULL DEFAULT 1,
    skill_level VARCHAR(50) NOT NULL DEFAULT 'Beginner (Stage 1)',
    completed_lessons_count INTEGER NOT NULL DEFAULT 0,
    total_lessons_count INTEGER NOT NULL DEFAULT 24,
    progress_percentage INTEGER NOT NULL DEFAULT 0,
    vocabulary_words_learned INTEGER NOT NULL DEFAULT 0,
    grammar_concepts_learned INTEGER NOT NULL DEFAULT 0,
    speaking_exercises_completed INTEGER NOT NULL DEFAULT 0,
    listening_exercises_completed INTEGER NOT NULL DEFAULT 0,
    reading_exercises_completed INTEGER NOT NULL DEFAULT 0,
    writing_exercises_completed INTEGER NOT NULL DEFAULT 0,
    average_speaking_accuracy INTEGER NOT NULL DEFAULT 0,
    is_course_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    last_studied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_profile_id, language_code)
);

-- 5. Detailed Lesson Progress Records
CREATE TABLE IF NOT EXISTS public.student_lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.language_lessons(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'completed', 'mastered'
    score_percentage INTEGER NOT NULL DEFAULT 0,
    attempts_count INTEGER NOT NULL DEFAULT 1,
    speaking_score INTEGER,
    listening_score INTEGER,
    mistakes_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_profile_id, lesson_id)
);

-- 6. Speaking Skills & Audio Assessment Logs
CREATE TABLE IF NOT EXISTS public.student_speaking_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL,
    exercise_type VARCHAR(50) NOT NULL, -- 'listen_repeat', 'pronunciation', 'sentence_speak', 'voice_answer', 'conversation'
    target_text TEXT NOT NULL,
    recognized_text TEXT NOT NULL,
    accuracy_score INTEGER NOT NULL, -- 0 to 100
    phonetic_feedback TEXT,
    support_language_explanation TEXT,
    audio_duration_seconds REAL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Achievements & Language Certificates
CREATE TABLE IF NOT EXISTS public.student_language_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL,
    achievement_key VARCHAR(100) NOT NULL, -- 'first_word', 'stage1_master', 'speaking_pro', 'streak_7', 'course_complete'
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    icon_name VARCHAR(50) NOT NULL DEFAULT 'award',
    badge_color VARCHAR(50) NOT NULL DEFAULT '#FF6A00',
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_profile_id, language_code, achievement_key)
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_enrolments_student ON public.student_language_enrolments(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_enrolments_language ON public.student_language_enrolments(language_code);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_student ON public.student_lesson_progress(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_speaking_evals_student ON public.student_speaking_evaluations(student_profile_id);
