-- ==============================================================================
-- STUDYAI — ROW LEVEL SECURITY POLICIES (011_family_account_rls_policies.sql)
-- Complete security enforcement for Family Account Model and Student Profile Isolation
-- ==============================================================================

-- Helper functions for RLS checks
CREATE OR REPLACE FUNCTION public.is_family_parent(target_family_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.family_members
        WHERE family_id = target_family_id
          AND user_id = auth.uid()
          AND role_id IN ('family_owner', 'parent')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.has_student_profile_access(target_profile_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Directly assigned student user
    IF EXISTS (
        SELECT 1 FROM public.student_profile_access
        WHERE student_profile_id = target_profile_id
          AND user_id = auth.uid()
          AND is_active = TRUE
    ) THEN
        RETURN TRUE;
    END IF;

    -- Parent or guardian of the student profile's family
    IF EXISTS (
        SELECT 1 FROM public.student_profiles sp
        JOIN public.family_members fm ON fm.family_id = sp.family_id
        WHERE sp.id = target_profile_id
          AND fm.user_id = auth.uid()
          AND fm.role_id IN ('family_owner', 'parent')
    ) THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all family tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profile_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permission_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 1. USERS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "users_read_own_or_family" ON public.users;
CREATE POLICY "users_read_own_or_family" ON public.users
    FOR SELECT USING (
        auth.uid() = id OR
        EXISTS (
            SELECT 1 FROM public.family_members fm1
            JOIN public.family_members fm2 ON fm1.family_id = fm2.family_id
            WHERE fm1.user_id = auth.uid() AND fm2.user_id = users.id
        )
    );

DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 2. FAMILIES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "families_read_member" ON public.families;
CREATE POLICY "families_read_member" ON public.families
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.family_members
            WHERE family_id = families.id AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "families_insert_parent" ON public.families;
CREATE POLICY "families_insert_parent" ON public.families
    FOR INSERT WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "families_update_owner" ON public.families;
CREATE POLICY "families_update_owner" ON public.families
    FOR UPDATE USING (public.is_family_parent(id));

-- ------------------------------------------------------------------------------
-- 3. FAMILY MEMBERS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "family_members_read" ON public.family_members;
CREATE POLICY "family_members_read" ON public.family_members
    FOR SELECT USING (
        user_id = auth.uid() OR
        public.is_family_parent(family_id)
    );

DROP POLICY IF EXISTS "family_members_insert_parent" ON public.family_members;
CREATE POLICY "family_members_insert_parent" ON public.family_members
    FOR INSERT WITH CHECK (public.is_family_parent(family_id));

DROP POLICY IF EXISTS "family_members_delete_parent" ON public.family_members;
CREATE POLICY "family_members_delete_parent" ON public.family_members
    FOR DELETE USING (public.is_family_parent(family_id));

-- ------------------------------------------------------------------------------
-- 4. STUDENT PROFILES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "student_profiles_read" ON public.student_profiles;
CREATE POLICY "student_profiles_read" ON public.student_profiles
    FOR SELECT USING (public.has_student_profile_access(id));

DROP POLICY IF EXISTS "student_profiles_insert_parent" ON public.student_profiles;
CREATE POLICY "student_profiles_insert_parent" ON public.student_profiles
    FOR INSERT WITH CHECK (public.is_family_parent(family_id));

DROP POLICY IF EXISTS "student_profiles_update_parent" ON public.student_profiles;
CREATE POLICY "student_profiles_update_parent" ON public.student_profiles
    FOR UPDATE USING (public.is_family_parent(family_id));

-- ------------------------------------------------------------------------------
-- 5. STUDENT PROFILE ACCESS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "spa_read" ON public.student_profile_access;
CREATE POLICY "spa_read" ON public.student_profile_access
    FOR SELECT USING (
        user_id = auth.uid() OR
        public.has_student_profile_access(student_profile_id)
    );

DROP POLICY IF EXISTS "spa_manage_parent" ON public.student_profile_access;
CREATE POLICY "spa_manage_parent" ON public.student_profile_access
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.student_profiles sp
            WHERE sp.id = student_profile_access.student_profile_id
              AND public.is_family_parent(sp.family_id)
        )
    );

-- ------------------------------------------------------------------------------
-- 6. FAMILY INVITATIONS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "invitations_read" ON public.family_invitations;
CREATE POLICY "invitations_read" ON public.family_invitations
    FOR SELECT USING (
        public.is_family_parent(family_id) OR
        invited_email = (auth.jwt() ->> 'email')
    );

DROP POLICY IF EXISTS "invitations_manage_parent" ON public.family_invitations;
CREATE POLICY "invitations_manage_parent" ON public.family_invitations
    FOR ALL USING (public.is_family_parent(family_id));

-- ------------------------------------------------------------------------------
-- 7. ACADEMIC & LEARNING PREFERENCES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "acad_pref_read" ON public.academic_preferences;
CREATE POLICY "acad_pref_read" ON public.academic_preferences
    FOR SELECT USING (public.has_student_profile_access(student_profile_id));

DROP POLICY IF EXISTS "acad_pref_manage" ON public.academic_preferences;
CREATE POLICY "acad_pref_manage" ON public.academic_preferences
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.student_profiles sp
            WHERE sp.id = academic_preferences.student_profile_id
              AND public.is_family_parent(sp.family_id)
        )
    );

DROP POLICY IF EXISTS "learn_pref_read" ON public.learning_preferences;
CREATE POLICY "learn_pref_read" ON public.learning_preferences
    FOR SELECT USING (public.has_student_profile_access(student_profile_id));

DROP POLICY IF EXISTS "learn_pref_manage" ON public.learning_preferences;
CREATE POLICY "learn_pref_manage" ON public.learning_preferences
    FOR ALL USING (public.has_student_profile_access(student_profile_id));

-- ------------------------------------------------------------------------------
-- 8. STUDENT NOTES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "notes_read" ON public.student_notes;
CREATE POLICY "notes_read" ON public.student_notes
    FOR SELECT USING (public.has_student_profile_access(student_profile_id));

DROP POLICY IF EXISTS "notes_manage" ON public.student_notes;
CREATE POLICY "notes_manage" ON public.student_notes
    FOR ALL USING (public.has_student_profile_access(student_profile_id));

-- ------------------------------------------------------------------------------
-- 9. LEARNING SESSIONS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "sessions_read" ON public.learning_sessions;
CREATE POLICY "sessions_read" ON public.learning_sessions
    FOR SELECT USING (public.has_student_profile_access(student_profile_id));

DROP POLICY IF EXISTS "sessions_insert" ON public.learning_sessions;
CREATE POLICY "sessions_insert" ON public.learning_sessions
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        public.has_student_profile_access(student_profile_id)
    );

-- ------------------------------------------------------------------------------
-- 10. STUDENT PROGRESS & ASSESSMENTS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "progress_read" ON public.student_progress;
CREATE POLICY "progress_read" ON public.student_progress
    FOR SELECT USING (public.has_student_profile_access(student_profile_id));

DROP POLICY IF EXISTS "progress_manage" ON public.student_progress;
CREATE POLICY "progress_manage" ON public.student_progress
    FOR ALL USING (public.has_student_profile_access(student_profile_id));

DROP POLICY IF EXISTS "assessments_read" ON public.assessment_results;
CREATE POLICY "assessments_read" ON public.assessment_results
    FOR SELECT USING (public.has_student_profile_access(student_profile_id));

DROP POLICY IF EXISTS "assessments_manage" ON public.assessment_results;
CREATE POLICY "assessments_manage" ON public.assessment_results
    FOR ALL USING (public.has_student_profile_access(student_profile_id));

-- ------------------------------------------------------------------------------
-- 11. STUDENT FILES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "files_read" ON public.student_files;
CREATE POLICY "files_read" ON public.student_files
    FOR SELECT USING (public.has_student_profile_access(student_profile_id));

DROP POLICY IF EXISTS "files_manage" ON public.student_files;
CREATE POLICY "files_manage" ON public.student_files
    FOR ALL USING (public.has_student_profile_access(student_profile_id));

-- ------------------------------------------------------------------------------
-- 12. CONSENT & AUDIT LOGS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "consent_read_manage" ON public.consent_records;
CREATE POLICY "consent_read_manage" ON public.consent_records
    FOR ALL USING (public.is_family_parent(family_id));

DROP POLICY IF EXISTS "audit_logs_read" ON public.audit_logs;
CREATE POLICY "audit_logs_read" ON public.audit_logs
    FOR SELECT USING (public.is_family_parent(family_id));
