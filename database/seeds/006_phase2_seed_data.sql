-- ==============================================================================
-- STUDYAI — PHASE 2: SEED DATA & SYSTEM INITIALIZATION
-- Seed File: 006_phase2_seed_data.sql
-- ==============================================================================

-- 1. Default Tenant
INSERT INTO tenants (id, name, subdomain, board, contact_email)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'National Public School Bangalore',
    'nps-bengaluru',
    'CBSE',
    'principal@nps-bengaluru.edu.in'
) ON CONFLICT (subdomain) DO NOTHING;

-- 2. Core Permissions
INSERT INTO permissions (code, module, action, description) VALUES
    ('curriculum:view', 'curriculum', 'view', 'View academic subjects, topics and lessons'),
    ('curriculum:create', 'curriculum', 'create', 'Create new curriculum topics and lessons'),
    ('curriculum:edit', 'curriculum', 'edit', 'Modify existing curriculum contents'),
    ('curriculum:delete', 'curriculum', 'delete', 'Remove topics or lessons'),
    ('examinations:view', 'examinations', 'view', 'View examinations and questions'),
    ('examinations:create', 'examinations', 'create', 'Create new exams and question banks'),
    ('examinations:approve', 'examinations', 'approve', 'Approve and publish examinations'),
    ('examinations:take', 'examinations', 'create', 'Attempt examination as a student'),
    ('examinations:evaluate', 'examinations', 'edit', 'Grade and verify examination answers'),
    ('tutor:chat', 'tutor', 'create', 'Interact with AI tutor conversational engine'),
    ('notes:manage', 'notes', 'create', 'Create and edit personal AI study notebooks'),
    ('games:play', 'games', 'create', 'Play 3D educational learning games and submit scores'),
    ('parent:view_child', 'parent_dashboard', 'view', 'View verified child progress and exam scores'),
    ('parent:view_chat', 'parent_dashboard', 'view', 'View student AI tutor conversations when consented'),
    ('payments:view', 'payments', 'view', 'View financial transactions and invoices'),
    ('payments:manage', 'payments', 'configure', 'Generate invoices, process refunds, edit gateways'),
    ('users:manage', 'users', 'manage_permissions', 'Create users, assign roles, reset credentials'),
    ('system:configure', 'system_config', 'configure', 'Configure AI models, API keys, and feature flags'),
    ('system:audit', 'audit', 'export', 'Review security audit logs and system telemetry')
ON CONFLICT (code) DO NOTHING;

-- 3. Standard Roles
INSERT INTO roles (id, tenant_id, name, code, description, is_system) VALUES
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Super Administrator', 'superadmin', 'Global system governance across all tenants', TRUE),
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'School Administrator', 'admin', 'School staff and curriculum administrator', TRUE),
    ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Accountant', 'accountant', 'Finance and payment manager', TRUE),
    ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Student', 'student', 'Active learner enrolled in curriculum', TRUE),
    ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Parent / Guardian', 'parent', 'Verified guardian of student', TRUE)
ON CONFLICT DO NOTHING;

-- 4. Initial Feature Flags
INSERT INTO feature_flags (flag_key, description, is_enabled, allowed_roles) VALUES
    ('video_generation', 'Universal AI Video Generation — Strictly Disabled in Production', FALSE, '[]'::jsonb),
    ('ai_tutor_multimodal', 'Deep Multimodal AI Tutor with Visual Diagrams', TRUE, '["student", "admin", "superadmin"]'::jsonb),
    ('interactive_3d_lab', 'Three.js Interactive 3D Science Models', TRUE, '["student", "admin", "superadmin"]'::jsonb),
    ('notebooklm_notes', 'NotebookLM Multi-Source Study Notebooks', TRUE, '["student", "admin", "superadmin"]'::jsonb),
    ('space_shooter_game', 'Educational 3D Space Answer Shooter Arcade', TRUE, '["student", "admin", "superadmin"]'::jsonb),
    ('parent_guardian_portal', 'Verified Guardian Performance Dashboard', TRUE, '["parent", "admin", "superadmin"]'::jsonb)
ON CONFLICT (flag_key) DO NOTHING;

-- 5. AI Provider Configs
INSERT INTO ai_provider_configs (provider_name, is_active, base_url, default_model, max_tokens, temperature, priority_order) VALUES
    ('ollama', TRUE, 'http://localhost:11434', 'qwen2.5:7b', 4096, 0.70, 1),
    ('gemini', TRUE, 'https://generativelanguage.googleapis.com', 'gemini-1.5-pro', 4096, 0.70, 2),
    ('openai', TRUE, 'https://api.openai.com/v1', 'gpt-4o', 4096, 0.70, 3),
    ('grok', TRUE, 'https://api.x.ai/v1', 'grok-beta', 4096, 0.70, 4)
ON CONFLICT (provider_name) DO NOTHING;
