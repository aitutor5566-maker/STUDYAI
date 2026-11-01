-- ==============================================================================
-- STUDYAI — SUPABASE STORAGE BUCKETS MIGRATION (008_supabase_storage_buckets.sql)
-- Configures the 5 required buckets, file size limits, MIME types, and RLS policies
-- ==============================================================================

-- 1. Create Buckets in storage.buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('student-uploads', 'student-uploads', false, 52428800, ARRAY['application/pdf', 'image/png', 'image/jpeg', 'text/plain', 'application/json']),
    ('ai-notes', 'ai-notes', false, 10485760, ARRAY['application/pdf', 'text/markdown', 'text/plain', 'application/json']),
    ('educational-images', 'educational-images', true, 20971520, ARRAY['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp']),
    ('educational-videos', 'educational-videos', true, 104857600, ARRAY['video/mp4', 'video/webm']),
    ('3d-assets', '3d-assets', true, 52428800, ARRAY['model/gltf-binary', 'model/gltf+json', 'application/json', 'application/octet-stream'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage RLS Policies for storage.objects

-- student-uploads: Private, authenticated user owns folder
CREATE POLICY "Users can upload their own files" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'student-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'student-uploads' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin_or_superadmin(auth.uid())));

-- ai-notes: Private, authenticated user owns folder
CREATE POLICY "Users can upload their own notes" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'ai-notes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own notes" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'ai-notes' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin_or_superadmin(auth.uid())));

-- educational-images: Public read, authenticated/admin write
CREATE POLICY "Public read for educational images" ON storage.objects
    FOR SELECT USING (bucket_id = 'educational-images');

CREATE POLICY "Authenticated users can upload educational images" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'educational-images');

-- educational-videos: Public read
CREATE POLICY "Public read for educational videos" ON storage.objects
    FOR SELECT USING (bucket_id = 'educational-videos');

-- 3d-assets: Public read, admin write
CREATE POLICY "Public read for 3d assets" ON storage.objects
    FOR SELECT USING (bucket_id = '3d-assets');

CREATE POLICY "Admins can upload 3d assets" ON storage.objects
    FOR ALL TO authenticated
    USING (bucket_id = '3d-assets' AND public.is_admin_or_superadmin(auth.uid()));
