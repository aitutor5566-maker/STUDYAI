-- ==============================================================================
-- STUDYAI — Initial Production Seeds (003_seed_data)
-- ==============================================================================

-- 1. Default Tenant (CBSE Demonstration School)
INSERT INTO tenants (id, name, subdomain, board, is_active)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Delhi Public Demonstration Academy',
    'demo',
    'CBSE',
    TRUE
) ON CONFLICT (subdomain) DO NOTHING;

-- 2. Student Profile: Vishwak Sai (Grade 10 CBSE)
INSERT INTO profiles (id, tenant_id, email, full_name, role, grade, board, streak_days, parent_passcode_hash)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'vishwak.sai@studyai.edu',
    'Vishwak Sai',
    'student',
    'Grade 10',
    'CBSE',
    7,
    crypt('2468', gen_salt('bf'))
) ON CONFLICT (email) DO NOTHING;

-- 3. Learning Preferences for Vishwak Sai
INSERT INTO learning_preferences (user_id, explanation_depth, preferred_language, daily_goal_minutes, daily_goal_topics)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'detailed',
    'English',
    45,
    3
) ON CONFLICT (user_id) DO NOTHING;

-- 4. Active Shared Topic Context
INSERT INTO shared_topic_context (user_id, active_topic, subject, level, explanation_mode)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'Human Heart',
    'Biology',
    'Grade 10',
    'detailed'
) ON CONFLICT (user_id) DO NOTHING;
