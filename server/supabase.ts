import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

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
    const { data, error } = await supabaseAdmin.from('users').select('id').limit(1);
    if (error && !error.message.includes('relation "public.users" does not exist')) {
      return {
        connected: false,
        message: `Connected to endpoint but query failed: ${error.message}`,
      };
    }
    return {
      connected: true,
      message: 'Successfully connected to Supabase.',
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Connection failed: ${err.message || String(err)}`,
    };
  }
}

/**
 * Verifies Supabase Bearer Auth token from Authorization header
 */
export async function verifySupabaseToken(authHeader?: string): Promise<{ user: any | null; error?: string }> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'MISSING_OR_INVALID_BEARER_TOKEN' };
  }
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!supabaseAdmin) {
    // In local development / offline mode without remote Supabase credentials,
    // allow a simulated development token for tests and local work:
    if (token.startsWith('dev-token-')) {
      const parts = token.split('-');
      const userId = parts[2] || 'dev-user-id';
      const role = parts[3] || 'parent';
      return {
        user: {
          id: userId,
          email: `${userId}@studyai.edu`,
          user_metadata: { role, full_name: `Dev User (${role})` }
        }
      };
    }
    return { user: null, error: 'SUPABASE_NOT_CONFIGURED' };
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return { user: null, error: error?.message || 'INVALID_TOKEN' };
    }
    return { user };
  } catch (err: any) {
    return { user: null, error: err.message || 'AUTH_VERIFICATION_FAILED' };
  }
}

export interface FamilyCreationParams {
  name: string;
  parentUserId: string;
  maxStudents?: number;
  subscriptionTier?: 'free' | 'standard' | 'premium' | 'family_unlimited';
}

/**
 * Creates a Family and assigns the creator as 'family_owner'
 */
export async function createFamily(params: FamilyCreationParams) {
  if (!supabaseAdmin) return null;

  const { data: family, error: famErr } = await supabaseAdmin
    .from('families')
    .insert({
      name: params.name,
      created_by: params.parentUserId,
      max_students: params.maxStudents || 5,
      subscription_tier: params.subscriptionTier || 'standard',
      subscription_status: 'active'
    })
    .select()
    .single();

  if (famErr) throw famErr;

  const { error: memberErr } = await supabaseAdmin
    .from('family_members')
    .insert({
      family_id: family.id,
      user_id: params.parentUserId,
      role_id: 'family_owner',
      is_primary_guardian: true
    });

  if (memberErr) throw memberErr;
  return family;
}

export interface StudentProfileCreationParams {
  familyId: string;
  displayName: string;
  slug?: string;
  currentGrade?: string;
  currentBoard?: string;
  birthDate?: string;
  parentUserId?: string;
}

/**
 * Creates a Student Profile inside a Family, creates default academic & learning preferences,
 * and grants parent access.
 */
export async function createStudentProfile(params: StudentProfileCreationParams) {
  if (!supabaseAdmin) return null;

  const { data: profile, error: profErr } = await supabaseAdmin
    .from('student_profiles')
    .insert({
      family_id: params.familyId,
      display_name: params.displayName,
      slug: params.slug || `student-${Date.now().toString(36)}`,
      current_grade: params.currentGrade || 'Grade 10',
      current_board: params.currentBoard || 'CBSE',
      birth_date: params.birthDate || null
    })
    .select()
    .single();

  if (profErr) throw profErr;

  // Insert default academic preferences
  await supabaseAdmin.from('academic_preferences').insert({
    student_profile_id: profile.id,
    target_board: params.currentBoard || 'CBSE',
    class_grade: params.currentGrade || 'Grade 10',
    academic_year: '2026-2027',
    enrolled_subjects: ['Mathematics', 'Science', 'Social Science', 'English'],
    stream: 'General',
    preserve_history_on_promotion: true
  });

  // Insert default learning preferences
  await supabaseAdmin.from('learning_preferences').insert({
    student_profile_id: profile.id,
    explanation_depth: 'detailed',
    sensory_preference: 'multimodal',
    voice_speed: 1.0,
    preferred_voice: 'Nova (Teacher)',
    enable_3d_auto_rotate: true,
    adaptive_difficulty_enabled: true
  });

  // If parent provided, grant owner_parent access
  if (params.parentUserId) {
    await supabaseAdmin.from('student_profile_access').insert({
      student_profile_id: profile.id,
      user_id: params.parentUserId,
      access_level: 'owner_parent',
      approved_by: params.parentUserId,
      is_active: true
    });
  }

  return profile;
}

/**
 * Creates an invitation code for a student to independently log in and claim/join their profile
 */
export async function createStudentInvitation(params: {
  familyId: string;
  invitedEmail: string;
  targetStudentProfileId?: string;
  invitedBy: string;
}) {
  if (!supabaseAdmin) return null;

  const invitationCode = `STUDY-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

  const { data, error } = await supabaseAdmin
    .from('family_invitations')
    .insert({
      family_id: params.familyId,
      invited_email: params.invitedEmail.toLowerCase().trim(),
      target_student_profile_id: params.targetStudentProfileId || null,
      role_id: 'student',
      invitation_code: invitationCode,
      invited_by: params.invitedBy,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Accepts an invitation code: links student user to the family and student profile
 */
export async function acceptStudentInvitation(params: {
  invitationCode: string;
  studentUserId: string;
}) {
  if (!supabaseAdmin) return null;

  // Find invitation
  const { data: inv, error: findErr } = await supabaseAdmin
    .from('family_invitations')
    .select('*')
    .eq('invitation_code', params.invitationCode.trim())
    .eq('status', 'pending')
    .single();

  if (findErr || !inv) {
    throw new Error('INVITATION_NOT_FOUND_OR_EXPIRED');
  }

  // Check expiration
  if (new Date(inv.expires_at).getTime() < Date.now()) {
    await supabaseAdmin.from('family_invitations').update({ status: 'expired' }).eq('id', inv.id);
    throw new Error('INVITATION_EXPIRED');
  }

  // Add student user to family_members if not present
  await supabaseAdmin
    .from('family_members')
    .upsert({
      family_id: inv.family_id,
      user_id: params.studentUserId,
      role_id: 'student',
      is_primary_guardian: false
    });

  // If a specific student profile was designated, grant access
  if (inv.target_student_profile_id) {
    await supabaseAdmin
      .from('student_profile_access')
      .upsert({
        student_profile_id: inv.target_student_profile_id,
        user_id: params.studentUserId,
        access_level: 'student',
        approved_by: inv.invited_by,
        is_active: true
      });
  }

  // Mark invitation accepted
  const { data: updatedInv, error: upErr } = await supabaseAdmin
    .from('family_invitations')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString(),
      accepted_by: params.studentUserId
    })
    .eq('id', inv.id)
    .select()
    .single();

  if (upErr) throw upErr;
  return updatedInv;
}

/**
 * Storage signed URL generator for private buckets
 */
export async function getPrivateFileSignedUrl(bucket: string, filePath: string, expiresInSeconds = 3600) {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(filePath, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}
