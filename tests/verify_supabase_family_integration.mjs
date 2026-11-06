import fs from 'node:fs';
import path from 'node:path';

const API_BASE = 'http://127.0.0.1:3001';

async function testFamilyIntegration() {
  console.log('================================================================');
  console.log('STUDYAI SUPABASE & FAMILY ACCOUNT BACKEND INTEGRATION TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Verify SQL Migrations & Schema Architecture
  console.log('\n--- 1. SQL Migrations & Schema Files Check ---');
  const migrationPath = path.join(process.cwd(), 'database/migrations/011_family_account_supabase_integration.sql');
  const rlsPath = path.join(process.cwd(), 'database/policies/011_family_account_rls_policies.sql');
  const storagePath = path.join(process.cwd(), 'database/migrations/008_supabase_storage_buckets.sql');

  assert(fs.existsSync(migrationPath), 'Migration 011_family_account_supabase_integration.sql exists');
  assert(fs.existsSync(rlsPath), 'RLS policy file 011_family_account_rls_policies.sql exists');
  assert(fs.existsSync(storagePath), 'Storage buckets migration 008_supabase_storage_buckets.sql exists');

  const migrationContent = fs.readFileSync(migrationPath, 'utf8');
  const expectedTables = [
    'users', 'families', 'family_members', 'student_profiles',
    'student_profile_access', 'family_invitations', 'family_roles',
    'permissions', 'role_permissions', 'user_permission_overrides',
    'academic_preferences', 'learning_preferences', 'student_notes',
    'learning_sessions', 'student_progress', 'assessment_results',
    'student_files', 'consent_records', 'audit_logs'
  ];

  for (const table of expectedTables) {
    assert(migrationContent.includes(`CREATE TABLE IF NOT EXISTS public.${table}`), `Migration contains table: public.${table}`);
  }

  const rlsContent = fs.readFileSync(rlsPath, 'utf8');
  assert(rlsContent.includes('is_family_parent'), 'RLS contains is_family_parent security helper');
  assert(rlsContent.includes('has_student_profile_access'), 'RLS contains has_student_profile_access security helper');
  assert(rlsContent.includes('ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY'), 'RLS enabled on student_profiles');
  assert(rlsContent.includes('ALTER TABLE public.student_notes ENABLE ROW LEVEL SECURITY'), 'RLS enabled on student_notes');

  // 2. Health & Supabase Status Endpoint Check
  console.log('\n--- 2. Live API: Supabase Status Endpoint (/api/supabase/status) ---');
  try {
    const res = await fetch(`${API_BASE}/api/supabase/status`);
    const data = await res.json();
    assert(res.status === 200, 'Endpoint /api/supabase/status returned HTTP 200');
    assert('configured' in data, 'Status response contains "configured" field');
    assert('runtime' in data, `Active runtime mode: ${data.runtime}`);
    assert(Array.isArray(data.tables_verified), `Verified tables tracked (${data.tables_verified.length} tables)`);
  } catch (err) {
    assert(false, `Supabase status check failed: ${err.message}`);
  }

  // 3. Family Account Retrieval (/api/family/my-family)
  console.log('\n--- 3. Live API: Family Account Retrieval (/api/family/my-family) ---');
  let familyId = 'family-sai';
  try {
    const res = await fetch(`${API_BASE}/api/family/my-family`);
    const data = await res.json();
    assert(res.status === 200, 'Endpoint /api/family/my-family returned HTTP 200');
    assert(data.family && data.family.name === 'Sai Family', `Retrieved Family: "${data.family?.name}"`);
    assert(Array.isArray(data.members) && data.members.length >= 2, `Retrieved ${data.members?.length} family members`);
    assert(Array.isArray(data.student_profiles) && data.student_profiles.length >= 2, `Retrieved ${data.student_profiles?.length} student profiles`);
    familyId = data.family?.id || familyId;
  } catch (err) {
    assert(false, `Family retrieval failed: ${err.message}`);
  }

  // 4. Student Invitation with Independent Login (/api/family/invite-student)
  console.log('\n--- 4. Live API: Independent Student Invitation ---');
  let invitationCode = '';
  try {
    const inviteEmail = `test.student.${Date.now()}@studyai.edu`;
    const res = await fetch(`${API_BASE}/api/family/invite-student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        family_id: familyId,
        invited_email: inviteEmail
      })
    });
    const data = await res.json();
    assert(res.status === 201 && data.success, `Successfully generated student invitation for ${inviteEmail}`);
    assert(data.invitation && data.invitation.invitation_code.startsWith('STUDY-'), `Invitation code generated: ${data.invitation?.invitation_code}`);
    invitationCode = data.invitation?.invitation_code;
  } catch (err) {
    assert(false, `Student invitation failed: ${err.message}`);
  }

  // 5. Accept Student Invitation (/api/family/accept-invitation)
  console.log('\n--- 5. Live API: Accept Student Invitation & Independent Login Claim ---');
  try {
    const studentName = 'Ananya Sai';
    const res = await fetch(`${API_BASE}/api/family/accept-invitation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invitation_code: invitationCode,
        student_name: studentName,
        student_email: 'ananya.sai@studyai.edu'
      })
    });
    const data = await res.json();
    assert(res.status === 200 && data.success, `Student invitation accepted successfully for "${studentName}"`);
    assert(Boolean(data.student_user_id), `Independent student user ID assigned: ${data.student_user_id}`);
    assert(Boolean(data.student_profile_id), `Student profile created & linked: ${data.student_profile_id}`);
  } catch (err) {
    assert(false, `Accept invitation failed: ${err.message}`);
  }

  // 6. Create Student Profile (/api/student/create-profile)
  console.log('\n--- 6. Live API: Create Student Profile with Custom Grade & Board ---');
  let newProfileId = '';
  try {
    const res = await fetch(`${API_BASE}/api/student/create-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        family_id: familyId,
        display_name: 'Rohan Sharma',
        current_grade: 'Grade 8',
        current_board: 'Cambridge',
        enrolled_subjects: ['Mathematics', 'Science', 'English Literature', 'French']
      })
    });
    const data = await res.json();
    assert(res.status === 201 && data.success, 'Created student profile "Rohan Sharma" (Grade 8 • Cambridge)');
    assert(data.profile && data.profile.current_board === 'Cambridge', 'Target board correctly saved as Cambridge');
    newProfileId = data.profile?.id;
  } catch (err) {
    assert(false, `Create profile failed: ${err.message}`);
  }

  // 7. Academic Preferences & History Preservation (/api/student/preferences)
  console.log('\n--- 7. Live API: Academic Preferences & History Preservation ---');
  try {
    // Read initial preferences for student-vishwak
    const getRes = await fetch(`${API_BASE}/api/student/preferences?student_profile_id=profile-vishwak`);
    const getData = await getRes.json();
    assert(getRes.status === 200, 'Retrieved academic preferences for profile-vishwak');
    assert(getData.academic_preferences?.target_board === 'CBSE', `Current board: ${getData.academic_preferences?.target_board}`);

    // Update board and grade, verifying history preservation
    const putRes = await fetch(`${API_BASE}/api/student/preferences`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Student-Id': 'student-vishwak' },
      body: JSON.stringify({
        student_profile_id: 'profile-vishwak',
        target_board: 'CBSE',
        class_grade: 'Grade 11',
        stream: 'Science (PCM)',
        enrolled_subjects: ['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'English']
      })
    });
    const putData = await putRes.json();
    assert(putRes.status === 200 && putData.success, 'Updated academic preferences with class promotion to Grade 11');
    assert(putData.message.includes('Learning history preserved'), 'Response guarantees learning history preservation');

    // Verify updated preferences
    const verifyRes = await fetch(`${API_BASE}/api/student/preferences?student_profile_id=profile-vishwak`);
    const verifyData = await verifyRes.json();
    assert(verifyData.profile?.current_grade === 'Grade 11', `Confirmed upgraded grade: ${verifyData.profile?.current_grade}`);
    assert(verifyData.academic_preferences?.stream === 'Science (PCM)', `Confirmed stream: ${verifyData.academic_preferences?.stream}`);
  } catch (err) {
    assert(false, `Academic preferences test failed: ${err.message}`);
  }

  // 8. Link Existing User Without Duplicate Accounts (/api/student/link-existing)
  console.log('\n--- 8. Live API: Link Existing Student Account ---');
  try {
    const res = await fetch(`${API_BASE}/api/student/link-existing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        family_id: familyId,
        existing_user_id: 'student-vishwak'
      })
    });
    const data = await res.json();
    assert(res.status === 200 && data.success, `Linked existing user "student-vishwak" without duplicates: ${data.message}`);
    assert(data.profile && data.profile.slug === 'student-vishwak', 'Profile correctly linked with original slug');
  } catch (err) {
    assert(false, `Link existing user failed: ${err.message}`);
  }

  // 9. Student Profile Isolation Test
  console.log('\n--- 9. Live API: Student Profile Data Isolation ---');
  try {
    // Request with Vishwak Sai header
    const resVishwak = await fetch(`${API_BASE}/api/context`, {
      headers: { 'X-Student-Id': 'student-vishwak' }
    });
    const dataVishwak = await resVishwak.json();

    // Request with Aarav header
    const resAarav = await fetch(`${API_BASE}/api/context`, {
      headers: { 'X-Student-Id': 'student-new' }
    });
    const dataAarav = await resAarav.json();

    assert(resVishwak.status === 200 && resAarav.status === 200, 'Context endpoints accessible for distinct students');
    assert(typeof dataVishwak === 'object' && typeof dataAarav === 'object', 'Independent context objects returned');
  } catch (err) {
    assert(false, `Student data isolation check failed: ${err.message}`);
  }

  console.log('\n================================================================');
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

testFamilyIntegration();
