-- ==============================================================================
-- STUDYAI — COMPLETE ADMIN, SUPER ADMIN AND TESTER MANAGEMENT (012_admin_superadmin_tester_management.sql)
-- Multi-Portal Architecture: Student, Parent, Admin, Super Admin, Tester
-- ==============================================================================

-- 1. TESTER ROLE TEMPLATES
CREATE TABLE IF NOT EXISTS public.tester_role_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    default_modules JSONB NOT NULL,
    default_permissions JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.tester_role_templates (id, name, description, default_modules, default_permissions) VALUES
    ('tester_overall', 'Overall Testing Agent', 'Full access to test all major modules: Home, Notes, Tutor, Library, Profile, Synthetic Parent Dashboard, Games, 3D Lab, Images, Voice', 
     '["home", "notes", "tutor", "library", "profile", "parent_qa", "games", "3d_lab", "image_studio", "voice_teacher"]'::jsonb,
     '{"read": true, "create": true, "edit": true, "delete": false, "export": true, "test_run": true, "bug_report": true, "view_reports": true}'::jsonb),
    ('tester_notes', 'AI Notes Tester', 'Specialized QA access to AI Notes, topic-to-notes generation, PDF processing, link processing, editing, saving, image relevance, PDF export, bug reporting',
     '["notes", "library"]'::jsonb,
     '{"notes:read": true, "notes:create": true, "notes:edit": true, "notes:export": true, "notes:test_run": true, "bug_report": true}'::jsonb),
    ('tester_tutor', 'AI Tutor Tester', 'Specialized QA access to AI Tutor, subject/topic classification, knowledge retrieval, explanation quality, diagrams, 3D visualization, voice explanations',
     '["tutor", "3d_lab", "voice_teacher"]'::jsonb,
     '{"tutor:read": true, "tutor:create": true, "3d:test_run": true, "voice:test_run": true, "bug_report": true}'::jsonb),
    ('tester_games', 'Game Tester', 'Specialized QA access to Educational Games, game dashboard, controls, questions, scoring, levels, difficulty progression, hints, results, game bug reports',
     '["games"]'::jsonb,
     '{"games:read": true, "games:play": true, "games:test_run": true, "bug_report": true}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    default_modules = EXCLUDED.default_modules,
    default_permissions = EXCLUDED.default_permissions;

-- 2. TESTER ACCOUNTS
CREATE TABLE IF NOT EXISTS public.tester_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role_template_id TEXT NOT NULL REFERENCES public.tester_role_templates(id),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending_invite', 'active', 'suspended', 'revoked')),
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.users(id),
    invitation_token TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tester_accounts_email ON public.tester_accounts(email);
CREATE INDEX IF NOT EXISTS idx_tester_accounts_role ON public.tester_accounts(role_template_id);
CREATE INDEX IF NOT EXISTS idx_tester_accounts_status ON public.tester_accounts(status);

-- 3. TESTER PERMISSION OVERRIDES (YES / NO / INHERIT SWITCH MATRIX)
CREATE TABLE IF NOT EXISTS public.tester_permission_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tester_account_id UUID NOT NULL REFERENCES public.tester_accounts(id) ON DELETE CASCADE,
    permission_key TEXT NOT NULL,
    override_state TEXT NOT NULL CHECK (override_state IN ('YES', 'NO', 'INHERIT')),
    updated_by UUID REFERENCES public.users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tester_perm_override UNIQUE (tester_account_id, permission_key)
);

CREATE INDEX IF NOT EXISTS idx_tester_perm_tester ON public.tester_permission_overrides(tester_account_id);
CREATE INDEX IF NOT EXISTS idx_tester_perm_key ON public.tester_permission_overrides(permission_key);

-- 4. TEST CASES
CREATE TABLE IF NOT EXISTS public.test_cases (
    id TEXT PRIMARY KEY,
    module TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    expected_outcome TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.test_cases (id, module, title, description, expected_outcome, severity) VALUES
    ('TC-TUTOR-01', 'tutor', 'Photosynthesis Detailed Lesson Generation', 'Verify Mode B tutor produces 14 structured pedagogical sections with real content and no placeholders', 'Detailed structured lesson returned with genuine definitions and formulas', 'critical'),
    ('TC-TUTOR-02', 'tutor', 'Formula and Numerical Calculation Clarity', 'Verify quadratic equation explanation step-by-step calculation without truncation', 'Correct discriminant calculation and real quadratic root values', 'high'),
    ('TC-NOTES-01', 'notes', 'AI Notes Generation from Topic Context', 'Verify Notes engine structures markdown summary, key takeaways, and flashcards correctly', 'Structured note document generated with clear headers and bullet points', 'high'),
    ('TC-NOTES-02', 'notes', 'PDF Export Integrity', 'Verify PDF export produces valid, readable PDF document', 'Decodable PDF format with metadata', 'medium'),
    ('TC-3D-01', '3d_lab', 'Human Heart 3D Scientific Fidelity', 'Verify 3D Lab renders multi-chamber cardiac anatomy instead of generic spheres', 'Accurate 4-chamber cardiac geometry with ventricles and aorta', 'critical'),
    ('TC-VOICE-01', 'voice_teacher', 'Voice Curriculum Outline Generation', 'Verify Voice Teacher produces sequential teaching outline matching AI Tutor explanation', 'Lesson speech sequence with checkpoints and clear spoken narration', 'high'),
    ('TC-GAME-01', 'games', 'Answer Battle Game State & Scoring', 'Verify scoring algorithm, correct streak multipliers, and battle stage progression', 'Score increments accurately; stage clears on threshold', 'medium')
ON CONFLICT (id) DO NOTHING;

-- 5. TESTER ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.tester_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tester_id UUID NOT NULL REFERENCES public.tester_accounts(id) ON DELETE CASCADE,
    test_case_id TEXT NOT NULL REFERENCES public.test_cases(id) ON DELETE CASCADE,
    module TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'retest_requested', 'approved')),
    deadline TIMESTAMPTZ,
    assigned_by UUID REFERENCES public.users(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tester_assignments_tester ON public.tester_assignments(tester_id);
CREATE INDEX IF NOT EXISTS idx_tester_assignments_status ON public.tester_assignments(status);

-- 6. TEST RUNS & TEST RESULTS
CREATE TABLE IF NOT EXISTS public.test_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tester_id UUID NOT NULL REFERENCES public.tester_accounts(id) ON DELETE CASCADE,
    environment TEXT NOT NULL DEFAULT 'staging' CHECK (environment IN ('staging', 'production_synthetic')),
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'aborted')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_run_id UUID NOT NULL REFERENCES public.test_runs(id) ON DELETE CASCADE,
    test_case_id TEXT NOT NULL REFERENCES public.test_cases(id) ON DELETE CASCADE,
    tester_id UUID NOT NULL REFERENCES public.tester_accounts(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('passed', 'failed', 'blocked')),
    actual_result TEXT NOT NULL,
    execution_time_ms INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. BUG REPORTS & BUG ASSIGNMENTS (Full Lifecycle)
CREATE TABLE IF NOT EXISTS public.bug_reports (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    affected_module TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Assigned', 'In Progress', 'Fixed', 'Ready for Retest', 'Verified', 'Closed', 'Rejected', 'Duplicate', 'Cannot Reproduce', 'Reopened')),
    steps_to_reproduce TEXT NOT NULL,
    expected_result TEXT NOT NULL,
    actual_result TEXT NOT NULL,
    screenshot_url TEXT,
    permitted_logs TEXT,
    reporter_id UUID REFERENCES public.tester_accounts(id) ON DELETE SET NULL,
    reporter_email TEXT NOT NULL,
    assigned_developer TEXT,
    fix_version TEXT,
    retest_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON public.bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_bug_reports_module ON public.bug_reports(affected_module);

CREATE TABLE IF NOT EXISTS public.bug_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bug_id TEXT NOT NULL REFERENCES public.bug_reports(id) ON DELETE CASCADE,
    developer_email TEXT NOT NULL,
    assigned_by UUID REFERENCES public.users(id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. SYSTEM HEALTH EVENTS
CREATE TABLE IF NOT EXISTS public.system_health_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Healthy', 'Degraded', 'Critical', 'Maintenance')),
    affected_component TEXT NOT NULL,
    issue_description TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_successful_check TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    responsible_team TEXT NOT NULL DEFAULT 'Platform Infrastructure',
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_at TIMESTAMPTZ
);

INSERT INTO public.system_health_events (service_name, status, affected_component, issue_description, started_at, last_successful_check, responsible_team, is_resolved)
VALUES
    ('AI Tutor Ollama Engine', 'Healthy', 'qwen2.5:7b Inference Server', 'Local Ollama model operational with fast token response', NOW() - INTERVAL '1 hour', NOW(), 'AI Infrastructure', false),
    ('Knowledge Nexus SQLite / Postgres', 'Healthy', 'Universal Knowledge Database', 'Knowledge library queries indexed and responsive', NOW() - INTERVAL '1 hour', NOW(), 'Database Operations', false),
    ('Three.js 3D Model Service', 'Healthy', 'WebGPU / WebGL Procedural Engine', 'Scientific procedural 3D model generators verified', NOW() - INTERVAL '1 hour', NOW(), 'Frontend 3D Lab Team', false),
    ('AI Voice Teacher Audio Pipeline', 'Healthy', 'Web Audio PCM / WAV Synthesizer', 'Audio generation with checkpoint sync active', NOW() - INTERVAL '1 hour', NOW(), 'Audio Engineering', false)
ON CONFLICT DO NOTHING;

-- 9. USAGE ANALYTICS
CREATE TABLE IF NOT EXISTS public.usage_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_category TEXT NOT NULL CHECK (metric_category IN ('user', 'feature', 'technical')),
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    dimensions JSONB DEFAULT '{}'::jsonb,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_analytics_metric ON public.usage_analytics(metric_name, recorded_at);
