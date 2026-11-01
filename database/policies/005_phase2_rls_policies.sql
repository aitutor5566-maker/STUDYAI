-- ==============================================================================
-- STUDYAI — PHASE 2: COMPREHENSIVE SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- Policy File: 005_phase2_rls_policies.sql
-- ==============================================================================

-- Enable RLS across all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_child_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE superadmin_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtopics ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE examinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE examination_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE examination_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE examination_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_provider_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 1. USERS & PROFILES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own user record"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own user record"
    ON users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Superadmins can view all users"
    ON users FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid() AND u.role = 'superadmin'
        )
    );

CREATE POLICY "Admins can view users within their tenant"
    ON users FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users admin_u
            WHERE admin_u.id = auth.uid()
            AND admin_u.role IN ('admin', 'superadmin')
            AND (admin_u.tenant_id = users.tenant_id OR admin_u.role = 'superadmin')
        )
    );

-- Student profiles
CREATE POLICY "Students manage own student profile"
    ON student_profiles FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Verified parents can view child student profile"
    ON student_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM parent_child_relationships pcr
            WHERE pcr.parent_id = auth.uid()
            AND pcr.child_id = student_profiles.user_id
            AND pcr.status = 'verified'
            AND pcr.allow_progress_view = TRUE
        )
    );

-- ------------------------------------------------------------------------------
-- 2. PARENT-CHILD SECURITY POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Parents view own parent child links"
    ON parent_child_relationships FOR SELECT
    USING (parent_id = auth.uid() OR child_id = auth.uid());

CREATE POLICY "Parents can create link requests"
    ON parent_child_relationships FOR INSERT
    WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Students or admins can verify relationship"
    ON parent_child_relationships FOR UPDATE
    USING (child_id = auth.uid() OR EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'superadmin')
    ));

-- ------------------------------------------------------------------------------
-- 3. AI TUTOR CONVERSATIONS & CHAT PRIVACY POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Students manage own ai conversations"
    ON ai_conversations FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- STRICT PARENT PRIVACY: Chat messages only accessible to parents if explicit consent is set
CREATE POLICY "Parents can view child ai conversations only if consent granted"
    ON ai_conversations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM parent_child_relationships pcr
            WHERE pcr.parent_id = auth.uid()
            AND pcr.child_id = ai_conversations.user_id
            AND pcr.status = 'verified'
            AND pcr.allow_chat_view = TRUE
        )
    );

CREATE POLICY "Students manage own ai messages"
    ON ai_messages FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM ai_conversations c
            WHERE c.id = ai_messages.conversation_id AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "Parents can view child ai messages only if consent granted"
    ON ai_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM ai_conversations c
            JOIN parent_child_relationships pcr ON pcr.child_id = c.user_id
            WHERE c.id = ai_messages.conversation_id
            AND pcr.parent_id = auth.uid()
            AND pcr.status = 'verified'
            AND pcr.allow_chat_view = TRUE
        )
    );

-- ------------------------------------------------------------------------------
-- 4. AI NOTES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Students manage own ai notes"
    ON ai_notes FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Verified parents can view child ai notes"
    ON ai_notes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM parent_child_relationships pcr
            WHERE pcr.parent_id = auth.uid()
            AND pcr.child_id = ai_notes.user_id
            AND pcr.status = 'verified'
        )
    );

-- ------------------------------------------------------------------------------
-- 5. EXAMINATIONS, ATTEMPTS & RESULTS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Students view published examinations"
    ON examinations FOR SELECT
    TO authenticated
    USING (is_published = TRUE);

CREATE POLICY "Admins manage examinations"
    ON examinations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'superadmin')
        )
    );

CREATE POLICY "Students manage own examination attempts"
    ON examination_attempts FOR ALL
    USING (auth.uid() = student_id)
    WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Verified parents view child examination results"
    ON examination_results FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM parent_child_relationships pcr
            WHERE pcr.parent_id = auth.uid()
            AND pcr.child_id = examination_results.student_id
            AND pcr.status = 'verified'
            AND pcr.allow_exam_view = TRUE
        )
    );

CREATE POLICY "Students view own examination results"
    ON examination_results FOR SELECT
    USING (auth.uid() = student_id);

-- ------------------------------------------------------------------------------
-- 6. PROGRESS, SCHEDULES & NOTIFICATIONS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Students manage own progress"
    ON student_progress FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Verified parents view child progress"
    ON student_progress FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM parent_child_relationships pcr
            WHERE pcr.parent_id = auth.uid()
            AND pcr.child_id = student_progress.user_id
            AND pcr.status = 'verified'
            AND pcr.allow_progress_view = TRUE
        )
    );

CREATE POLICY "Users manage own schedules"
    ON study_schedules FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own notifications"
    ON notifications FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 7. FINANCIAL / PAYMENTS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Accountants and admins manage payments"
    ON payments FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid() AND u.role IN ('accountant', 'admin', 'superadmin')
        )
    );

CREATE POLICY "Users view own payments"
    ON payments FOR SELECT
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 8. AUDIT LOGS & SYSTEM GOVERNANCE (SUPERADMIN ONLY)
-- ------------------------------------------------------------------------------
CREATE POLICY "Superadmins only view audit logs"
    ON audit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid() AND u.role = 'superadmin'
        )
    );

CREATE POLICY "Superadmins manage ai configs"
    ON ai_provider_configs FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid() AND u.role = 'superadmin'
        )
    );

CREATE POLICY "Superadmins manage feature flags"
    ON feature_flags FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid() AND u.role = 'superadmin'
        )
    );

CREATE POLICY "All authenticated users view feature flags"
    ON feature_flags FOR SELECT
    TO authenticated
    USING (TRUE);
