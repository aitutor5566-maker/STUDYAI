-- ==============================================================================
-- STUDYAI — ROW LEVEL SECURITY POLICIES (012_admin_tester_rls_policies.sql)
-- Complete security enforcement for Admin, Super Admin, and QA Tester Isolation
-- ==============================================================================

-- Helper functions for Role Verification
CREATE OR REPLACE FUNCTION public.is_superadmin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = check_user_id
          AND role = 'superadmin'
          AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin_or_superadmin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = check_user_id
          AND role IN ('admin', 'superadmin')
          AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_active_tester(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.tester_accounts
        WHERE user_id = check_user_id
          AND status = 'active'
          AND (expires_at IS NULL OR expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all Admin and Tester Tables
ALTER TABLE public.tester_role_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tester_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tester_permission_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tester_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bug_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_analytics ENABLE ROW LEVEL SECURITY;

-- 1. TESTER ROLE TEMPLATES
DROP POLICY IF EXISTS "templates_read_staff" ON public.tester_role_templates;
CREATE POLICY "templates_read_staff" ON public.tester_role_templates
    FOR SELECT USING (public.is_admin_or_superadmin(auth.uid()) OR public.is_active_tester(auth.uid()));

DROP POLICY IF EXISTS "templates_manage_superadmin" ON public.tester_role_templates;
CREATE POLICY "templates_manage_superadmin" ON public.tester_role_templates
    FOR ALL USING (public.is_superadmin(auth.uid()));

-- 2. TESTER ACCOUNTS
DROP POLICY IF EXISTS "tester_accounts_read" ON public.tester_accounts;
CREATE POLICY "tester_accounts_read" ON public.tester_accounts
    FOR SELECT USING (
        public.is_admin_or_superadmin(auth.uid()) OR
        user_id = auth.uid()
    );

DROP POLICY IF EXISTS "tester_accounts_manage_superadmin" ON public.tester_accounts;
CREATE POLICY "tester_accounts_manage_superadmin" ON public.tester_accounts
    FOR ALL USING (public.is_superadmin(auth.uid()));

-- 3. TESTER PERMISSION OVERRIDES (YES/NO/INHERIT)
DROP POLICY IF EXISTS "overrides_read" ON public.tester_permission_overrides;
CREATE POLICY "overrides_read" ON public.tester_permission_overrides
    FOR SELECT USING (
        public.is_superadmin(auth.uid()) OR
        EXISTS (SELECT 1 FROM public.tester_accounts WHERE id = tester_permission_overrides.tester_account_id AND user_id = auth.uid())
    );

DROP POLICY IF EXISTS "overrides_manage_superadmin" ON public.tester_permission_overrides;
CREATE POLICY "overrides_manage_superadmin" ON public.tester_permission_overrides
    FOR ALL USING (public.is_superadmin(auth.uid()));

-- 4. TEST CASES
DROP POLICY IF EXISTS "test_cases_read" ON public.test_cases;
CREATE POLICY "test_cases_read" ON public.test_cases
    FOR SELECT USING (public.is_admin_or_superadmin(auth.uid()) OR public.is_active_tester(auth.uid()));

DROP POLICY IF EXISTS "test_cases_manage_superadmin" ON public.test_cases;
CREATE POLICY "test_cases_manage_superadmin" ON public.test_cases
    FOR ALL USING (public.is_superadmin(auth.uid()));

-- 5. TESTER ASSIGNMENTS
DROP POLICY IF EXISTS "assignments_read" ON public.tester_assignments;
CREATE POLICY "assignments_read" ON public.tester_assignments
    FOR SELECT USING (
        public.is_admin_or_superadmin(auth.uid()) OR
        EXISTS (SELECT 1 FROM public.tester_accounts WHERE id = tester_assignments.tester_id AND user_id = auth.uid())
    );

DROP POLICY IF EXISTS "assignments_manage_superadmin" ON public.tester_assignments;
CREATE POLICY "assignments_manage_superadmin" ON public.tester_assignments
    FOR ALL USING (public.is_superadmin(auth.uid()));

-- 6. TEST RUNS & RESULTS
DROP POLICY IF EXISTS "test_runs_manage" ON public.test_runs;
CREATE POLICY "test_runs_manage" ON public.test_runs
    FOR ALL USING (
        public.is_superadmin(auth.uid()) OR
        EXISTS (SELECT 1 FROM public.tester_accounts WHERE id = test_runs.tester_id AND user_id = auth.uid())
    );

DROP POLICY IF EXISTS "test_results_manage" ON public.test_results;
CREATE POLICY "test_results_manage" ON public.test_results
    FOR ALL USING (
        public.is_superadmin(auth.uid()) OR
        EXISTS (SELECT 1 FROM public.tester_accounts WHERE id = test_results.tester_id AND user_id = auth.uid())
    );

-- 7. BUG REPORTS & ASSIGNMENTS
DROP POLICY IF EXISTS "bugs_read" ON public.bug_reports;
CREATE POLICY "bugs_read" ON public.bug_reports
    FOR SELECT USING (public.is_admin_or_superadmin(auth.uid()) OR public.is_active_tester(auth.uid()));

DROP POLICY IF EXISTS "bugs_insert_testers_staff" ON public.bug_reports;
CREATE POLICY "bugs_insert_testers_staff" ON public.bug_reports
    FOR INSERT WITH CHECK (public.is_admin_or_superadmin(auth.uid()) OR public.is_active_tester(auth.uid()));

DROP POLICY IF EXISTS "bugs_update_staff" ON public.bug_reports;
CREATE POLICY "bugs_update_staff" ON public.bug_reports
    FOR UPDATE USING (public.is_admin_or_superadmin(auth.uid()));

-- 8. SYSTEM HEALTH EVENTS
DROP POLICY IF EXISTS "health_read" ON public.system_health_events;
CREATE POLICY "health_read" ON public.system_health_events
    FOR SELECT USING (public.is_admin_or_superadmin(auth.uid()) OR public.is_active_tester(auth.uid()));

DROP POLICY IF EXISTS "health_manage_superadmin" ON public.system_health_events;
CREATE POLICY "health_manage_superadmin" ON public.system_health_events
    FOR ALL USING (public.is_superadmin(auth.uid()));

-- 9. USAGE ANALYTICS
DROP POLICY IF EXISTS "analytics_read_admin" ON public.usage_analytics;
CREATE POLICY "analytics_read_admin" ON public.usage_analytics
    FOR SELECT USING (public.is_admin_or_superadmin(auth.uid()));

DROP POLICY IF EXISTS "analytics_manage_superadmin" ON public.usage_analytics;
CREATE POLICY "analytics_manage_superadmin" ON public.usage_analytics
    FOR ALL USING (public.is_superadmin(auth.uid()));
