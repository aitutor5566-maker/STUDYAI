-- ==============================================================================
-- STUDYAI POLICIES 013: Row Level Security for Speaking Skills & Language Learning
-- ==============================================================================

-- Enable RLS on all language tables
ALTER TABLE public.supported_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.language_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.language_course_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.language_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_language_enrolments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_speaking_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_language_achievements ENABLE ROW LEVEL SECURITY;

-- 1. Catalog Tables: Publicly readable by all authenticated users
CREATE POLICY rls_supported_languages_read ON public.supported_languages
    FOR SELECT TO authenticated USING (is_active = TRUE);

CREATE POLICY rls_language_courses_read ON public.language_courses
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY rls_language_course_stages_read ON public.language_course_stages
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY rls_language_lessons_read ON public.language_lessons
    FOR SELECT TO authenticated USING (TRUE);

-- 2. Student Language Enrolments Policies:
-- Students can select their own enrolments
CREATE POLICY rls_enrolments_student_select ON public.student_language_enrolments
    FOR SELECT TO authenticated
    USING (
        student_profile_id IN (
            SELECT spa.student_profile_id FROM public.student_profile_access spa
            WHERE spa.user_id = auth.uid() AND spa.is_active = 1
        )
        OR EXISTS (
            SELECT 1 FROM public.student_profiles sp
            JOIN public.family_members fm ON fm.family_id = sp.family_id
            WHERE sp.id = student_profile_id AND fm.user_id = auth.uid() AND fm.role_id IN ('owner', 'parent', 'admin', 'superadmin')
        )
    );

-- Students can insert/update their own enrolments
CREATE POLICY rls_enrolments_student_insert ON public.student_language_enrolments
    FOR INSERT TO authenticated
    WITH CHECK (
        student_profile_id IN (
            SELECT spa.student_profile_id FROM public.student_profile_access spa
            WHERE spa.user_id = auth.uid() AND spa.is_active = 1
        )
    );

CREATE POLICY rls_enrolments_student_update ON public.student_language_enrolments
    FOR UPDATE TO authenticated
    USING (
        student_profile_id IN (
            SELECT spa.student_profile_id FROM public.student_profile_access spa
            WHERE spa.user_id = auth.uid() AND spa.is_active = 1
        )
    );

-- 3. Lesson Progress Policies:
CREATE POLICY rls_lesson_progress_select ON public.student_lesson_progress
    FOR SELECT TO authenticated
    USING (
        student_profile_id IN (
            SELECT spa.student_profile_id FROM public.student_profile_access spa
            WHERE spa.user_id = auth.uid() AND spa.is_active = 1
        )
        OR EXISTS (
            SELECT 1 FROM public.student_profiles sp
            JOIN public.family_members fm ON fm.family_id = sp.family_id
            WHERE sp.id = student_profile_id AND fm.user_id = auth.uid() AND fm.role_id IN ('owner', 'parent', 'admin', 'superadmin')
        )
    );

CREATE POLICY rls_lesson_progress_write ON public.student_lesson_progress
    FOR ALL TO authenticated
    USING (
        student_profile_id IN (
            SELECT spa.student_profile_id FROM public.student_profile_access spa
            WHERE spa.user_id = auth.uid() AND spa.is_active = 1
        )
    );

-- 4. Speaking Evaluations & Achievements
CREATE POLICY rls_speaking_evals_select ON public.student_speaking_evaluations
    FOR SELECT TO authenticated
    USING (
        student_profile_id IN (
            SELECT spa.student_profile_id FROM public.student_profile_access spa
            WHERE spa.user_id = auth.uid() AND spa.is_active = 1
        )
        OR EXISTS (
            SELECT 1 FROM public.student_profiles sp
            JOIN public.family_members fm ON fm.family_id = sp.family_id
            WHERE sp.id = student_profile_id AND fm.user_id = auth.uid() AND fm.role_id IN ('owner', 'parent', 'admin', 'superadmin')
        )
    );

CREATE POLICY rls_speaking_evals_insert ON public.student_speaking_evaluations
    FOR INSERT TO authenticated
    WITH CHECK (
        student_profile_id IN (
            SELECT spa.student_profile_id FROM public.student_profile_access spa
            WHERE spa.user_id = auth.uid() AND spa.is_active = 1
        )
    );

CREATE POLICY rls_achievements_select ON public.student_language_achievements
    FOR SELECT TO authenticated
    USING (
        student_profile_id IN (
            SELECT spa.student_profile_id FROM public.student_profile_access spa
            WHERE spa.user_id = auth.uid() AND spa.is_active = 1
        )
        OR EXISTS (
            SELECT 1 FROM public.student_profiles sp
            JOIN public.family_members fm ON fm.family_id = sp.family_id
            WHERE sp.id = student_profile_id AND fm.user_id = auth.uid() AND fm.role_id IN ('owner', 'parent', 'admin', 'superadmin')
        )
    );

CREATE POLICY rls_achievements_insert ON public.student_language_achievements
    FOR INSERT TO authenticated
    WITH CHECK (
        student_profile_id IN (
            SELECT spa.student_profile_id FROM public.student_profile_access spa
            WHERE spa.user_id = auth.uid() AND spa.is_active = 1
        )
    );
