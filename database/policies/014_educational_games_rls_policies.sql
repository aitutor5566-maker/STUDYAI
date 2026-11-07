-- Row Level Security Policies for Educational Games Library
-- Student Isolation + Guardian/Parent Access + Admin/Superadmin Governance

ALTER TABLE public.educational_games_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_game_question_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_educational_game_stats ENABLE ROW LEVEL SECURITY;

-- 1. Games Catalog: Authenticated users can view active games
DROP POLICY IF EXISTS "games_catalog_select" ON public.educational_games_catalog;
CREATE POLICY "games_catalog_select" ON public.educational_games_catalog
    FOR SELECT TO authenticated
    USING (is_active = TRUE OR public.is_admin_or_superadmin(auth.uid()));

DROP POLICY IF EXISTS "games_catalog_manage_admin" ON public.educational_games_catalog;
CREATE POLICY "games_catalog_manage_admin" ON public.educational_games_catalog
    FOR ALL TO authenticated
    USING (public.is_admin_or_superadmin(auth.uid()));

-- 2. Game Sessions: Students manage their own; Parents view their children; Admins view all
DROP POLICY IF EXISTS "game_sessions_student_all" ON public.educational_game_sessions;
CREATE POLICY "game_sessions_student_all" ON public.educational_game_sessions
    FOR ALL TO authenticated
    USING (
        auth.uid() = user_id OR
        public.is_family_parent(auth.uid()) OR
        public.is_admin_or_superadmin(auth.uid())
    )
    WITH CHECK (auth.uid() = user_id);

-- 3. Game Question Logs
DROP POLICY IF EXISTS "game_logs_student_all" ON public.educational_game_question_logs;
CREATE POLICY "game_logs_student_all" ON public.educational_game_question_logs
    FOR ALL TO authenticated
    USING (
        auth.uid() = user_id OR
        public.is_family_parent(auth.uid()) OR
        public.is_admin_or_superadmin(auth.uid())
    )
    WITH CHECK (auth.uid() = user_id);

-- 4. Student Game Analytics
DROP POLICY IF EXISTS "game_stats_student_all" ON public.student_educational_game_stats;
CREATE POLICY "game_stats_student_all" ON public.student_educational_game_stats
    FOR ALL TO authenticated
    USING (
        auth.uid() = user_id OR
        public.is_family_parent(auth.uid()) OR
        public.is_admin_or_superadmin(auth.uid())
    )
    WITH CHECK (auth.uid() = user_id);
