-- ==============================================================================
-- STUDYAI — Supabase Row Level Security (RLS) Policies (002_rls_policies)
-- ==============================================================================

-- Enable RLS across all student-facing and administrative tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE visual_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_topic_context ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Table Policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Parents can view their linked children's profiles
CREATE POLICY "Parents can view linked children profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM parent_child_links
            WHERE parent_id = auth.uid() AND child_id = profiles.id
        )
    );

-- Admins can view all profiles in their tenant
CREATE POLICY "Admins can view tenant profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles admin_p
            WHERE admin_p.id = auth.uid()
            AND admin_p.role IN ('admin', 'superadmin')
            AND (admin_p.tenant_id = profiles.tenant_id OR admin_p.role = 'superadmin')
        )
    );

-- 2. Notes Table Policies
CREATE POLICY "Students can view and edit own notes"
    ON notes FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Parents can view linked child notes"
    ON notes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM parent_child_links
            WHERE parent_id = auth.uid() AND child_id = notes.user_id
        )
    );

-- 3. AI Tutor Conversations & Messages
CREATE POLICY "Students manage own conversations"
    ON tutor_conversations FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students manage own messages"
    ON tutor_messages FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM tutor_conversations
            WHERE id = tutor_messages.conversation_id AND user_id = auth.uid()
        )
    );

-- 4. Shared Topic Context Policies
CREATE POLICY "Users manage own topic context"
    ON shared_topic_context FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. Visual Assets (Public Educational Library)
CREATE POLICY "All authenticated users can read visual assets"
    ON visual_assets FOR SELECT
    TO authenticated
    USING (TRUE);
