import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read from Vite environment variables (prefixed with VITE_)
const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let client: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (err) {
    console.warn('[STUDYAI] Failed to initialize Supabase client:', err);
  }
}

export const supabase = client;

// Safe wrapper functions for authentication & data persistence
export async function getSupabaseUser() {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function uploadToStorage(
  bucket: 'student-uploads' | 'ai-notes' | 'educational-images' | 'educational-videos' | '3d-assets',
  path: string,
  file: File | Blob
) {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
  });
  if (error) throw error;
  return data;
}
