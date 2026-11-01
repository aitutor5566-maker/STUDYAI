-- ==============================================================================
-- STUDYAI — Production PostgreSQL / Supabase Schema Migration (001_initial_schema)
-- ==============================================================================

-- Enable UUID and Cryptographic extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tenant / School Organization Table
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    board VARCHAR(50) NOT NULL DEFAULT 'CBSE', -- CBSE, ICSE, Cambridge, State
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. User Profiles Table (Linked with Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY, -- Matches auth.users.id
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'parent', 'teacher', 'admin', 'superadmin')),
    grade VARCHAR(50) NOT NULL DEFAULT 'Grade 10',
    board VARCHAR(50) NOT NULL DEFAULT 'CBSE',
    avatar_url TEXT DEFAULT '/avatars/default.svg',
    streak_days INTEGER NOT NULL DEFAULT 0,
    parent_passcode_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Parent-Child Relationship Mapping
CREATE TABLE IF NOT EXISTS parent_child_links (
    parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (parent_id, child_id)
);

-- 4. Learning Preferences
CREATE TABLE IF NOT EXISTS learning_preferences (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    explanation_depth VARCHAR(50) NOT NULL DEFAULT 'detailed',
    preferred_language VARCHAR(50) NOT NULL DEFAULT 'English',
    voice_speed NUMERIC(3, 2) NOT NULL DEFAULT 1.0,
    voice_name VARCHAR(100) NOT NULL DEFAULT 'Nova (Teacher)',
    daily_goal_minutes INTEGER NOT NULL DEFAULT 45,
    daily_goal_topics INTEGER NOT NULL DEFAULT 2,
    subjects JSONB NOT NULL DEFAULT '["Science", "Mathematics", "English", "Social Studies"]'::jsonb,
    notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    reduced_motion BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. AI Tutor Conversations & Messages
CREATE TABLE IF NOT EXISTS tutor_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    topic VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL DEFAULT 'Science',
    level VARCHAR(50) NOT NULL DEFAULT 'Grade 10',
    mode VARCHAR(50) NOT NULL DEFAULT 'detailed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tutor_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES tutor_conversations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    structured_json JSONB,
    media_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. AI Notes & Study Notebooks (NotebookLM architecture)
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL DEFAULT 'Science',
    topic VARCHAR(255) NOT NULL,
    level VARCHAR(50) NOT NULL DEFAULT 'Grade 10',
    notebook_name VARCHAR(100) NOT NULL DEFAULT 'General',
    content_markdown TEXT NOT NULL,
    structured_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    flashcards_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    quiz_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    source_type VARCHAR(50) NOT NULL DEFAULT 'topic',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Visual Learning & 3D Assets Cache
CREATE TABLE IF NOT EXISTS visual_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic VARCHAR(255) NOT NULL,
    subtopic VARCHAR(255),
    visual_type VARCHAR(50) NOT NULL, -- three_js_scene, scientific_diagram, etc.
    svg_data_url TEXT,
    model_3d_config JSONB,
    labels_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    walkthrough_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Game Sessions & Learning Activity
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    game_type VARCHAR(100) NOT NULL, -- space_shooter_3d, periodic_orbit, etc.
    subject VARCHAR(100) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    accuracy INTEGER NOT NULL DEFAULT 0,
    correct_count INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    stage_reached INTEGER NOT NULL DEFAULT 1,
    duration_seconds INTEGER NOT NULL DEFAULT 60,
    mistakes_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS learning_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- tutor, note, game, quiz, visual_3d
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 5,
    score_percent INTEGER,
    resource_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Shared Topic Context
CREATE TABLE IF NOT EXISTS shared_topic_context (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    active_topic VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    level VARCHAR(50) NOT NULL,
    explanation_mode VARCHAR(50) NOT NULL DEFAULT 'detailed',
    last_conversation_id UUID,
    last_note_id UUID,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Indexes for Fast Curriculum Queries
CREATE INDEX IF NOT EXISTS idx_tutor_conv_user ON tutor_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_tutor_msg_conv ON tutor_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_topic ON notes(user_id, topic);
CREATE INDEX IF NOT EXISTS idx_activity_user ON learning_activity(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visual_topic ON visual_assets(topic);
