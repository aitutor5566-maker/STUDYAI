-- STUDYAI Knowledge Nexus Schema Migration
-- Migration: 010_knowledge_nexus_schema.sql

-- 1. ICSE Hierarchical Curriculum Repository
CREATE TABLE IF NOT EXISTS icse_curriculum_nodes (
    id TEXT PRIMARY KEY,
    board TEXT NOT NULL DEFAULT 'ICSE',
    grade INTEGER NOT NULL CHECK (grade >= 1 AND grade <= 10),
    subject TEXT NOT NULL,
    book_title TEXT NOT NULL,
    publisher TEXT NOT NULL,
    edition TEXT DEFAULT 'Current Edition',
    chapter_number INTEGER,
    chapter_title TEXT NOT NULL,
    topic_name TEXT NOT NULL,
    subtopics JSON DEFAULT '[]',
    learning_objectives JSON DEFAULT '[]',
    key_terms JSON DEFAULT '[]',
    exam_weightage_percent NUMERIC(4, 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_icse_curriculum_grade_subject ON icse_curriculum_nodes(grade, subject);
CREATE INDEX IF NOT EXISTS idx_icse_curriculum_chapter ON icse_curriculum_nodes(chapter_title);

-- 2. Multimodal Ingested Documents & Question Scans
CREATE TABLE IF NOT EXISTS multimodal_ingestions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    file_name TEXT NOT NULL,
    content_type TEXT NOT NULL,
    file_size_bytes INTEGER,
    storage_url TEXT,
    raw_transcription TEXT,
    detected_questions JSON DEFAULT '[]',
    detected_diagrams JSON DEFAULT '[]',
    source_type TEXT NOT NULL CHECK (source_type IN ('pdf', 'image_scan', 'homework_photo', 'handwritten_note', 'text')),
    processing_status TEXT NOT NULL DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_multimodal_ingestions_user ON multimodal_ingestions(user_id);

-- 3. Verified External Research Cache
CREATE TABLE IF NOT EXISTS external_research_cache (
    id TEXT PRIMARY KEY,
    query_hash TEXT NOT NULL UNIQUE,
    query_text TEXT NOT NULL,
    source_engine TEXT NOT NULL, -- 'google_search', 'grok', 'telegram', 'cisce_registry'
    verified_snippets JSON NOT NULL DEFAULT '[]',
    confidence_score NUMERIC(3, 2) NOT NULL DEFAULT 0.90,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_research_cache_hash ON external_research_cache(query_hash);

-- 4. Subject Dossiers & Interactive Assets
CREATE TABLE IF NOT EXISTS subject_dossiers (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    dossier_type TEXT NOT NULL, -- '16_point_event', 'sympy_derivation', 'chemical_reaction', '3d_scene'
    entity_name TEXT NOT NULL,
    payload JSON NOT NULL,
    verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subject_dossiers_type ON subject_dossiers(subject, dossier_type);

-- Row Level Security (RLS) Policies
ALTER TABLE icse_curriculum_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE multimodal_ingestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_research_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_dossiers ENABLE ROW LEVEL SECURITY;

-- Curriculum & Dossiers are publicly readable
CREATE POLICY "Public read for icse_curriculum_nodes" ON icse_curriculum_nodes FOR SELECT USING (true);
CREATE POLICY "Public read for subject_dossiers" ON subject_dossiers FOR SELECT USING (true);
CREATE POLICY "Public read for external_research_cache" ON external_research_cache FOR SELECT USING (true);

-- Multimodal Ingestion user access
CREATE POLICY "User manages own multimodal ingestions" ON multimodal_ingestions
    FOR ALL USING (auth.uid()::text = user_id OR user_id IS NULL);
