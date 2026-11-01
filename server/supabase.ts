import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

export const isServerSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabaseAdmin: SupabaseClient | null = isServerSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

/**
 * Health check to verify connection to Supabase instance
 */
export async function testSupabaseConnection(): Promise<{ connected: boolean; message: string }> {
  if (!supabaseAdmin) {
    return {
      connected: false,
      message: 'Supabase credentials not configured in environment (SUPABASE_URL / SUPABASE_ANON_KEY missing)',
    };
  }

  try {
    const { data, error } = await supabaseAdmin.from('profiles').select('id').limit(1);
    if (error) {
      return {
        connected: false,
        message: `Connected to endpoint but query failed: ${error.message}`,
      };
    }
    return {
      connected: true,
      message: 'Successfully connected to Supabase and queried profiles table.',
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Connection failed: ${err.message || String(err)}`,
    };
  }
}
