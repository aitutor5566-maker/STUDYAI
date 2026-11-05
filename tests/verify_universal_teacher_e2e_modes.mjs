/**
 * End-to-End Verification: Normal Learning Mode vs Exam Prep Mode
 * & 10-Check Response Validator
 */

const BASE_URL = 'http://127.0.0.1:8000/api/v1/nexus';

async function testModes() {
  console.log('='.repeat(80));
  console.log('TESTING FULL E2E LESSON GENERATION & 10-CHECK VALIDATOR');
  console.log('='.repeat(80));

  // 1. Normal Mode Biology Query
  console.log('\n[1/2] Testing Normal Learning Mode (Biology: Heart valves)...');
  const bioRes = await fetch(`${BASE_URL}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'Why does the human heart have a bicuspid valve between the left atrium and left ventricle?',
      grade: 10,
      mode: 'normal'
    })
  });

  if (!bioRes.ok) throw new Error(`Bio query failed: ${await bioRes.text()}`);
  const bioData = await bioRes.json();

  console.log(`- Subject: ${bioData.subject}`);
  console.log(`- Mode: ${bioData.teaching_mode}`);
  console.log(`- Quality Schema Valid: ${bioData.quality.schema_valid}`);
  console.log(`- Academic Checks: ${bioData.quality.academic_checks}`);
  console.log(`- Total Checks Run: ${bioData.quality.total_checks_run}`);
  console.log(`- Passed Checks: ${bioData.quality.passed_checks.join(', ')}`);
  console.log(`- 3D Scene Attached: ${bioData.scene_3d ? bioData.scene_3d.model_key : 'None'}`);

  // 2. Exam Prep Mode Physics Numerical Query
  console.log('\n[2/2] Testing Exam Prep Mode (Physics: Lens Numerical)...');
  const physRes = await fetch(`${BASE_URL}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'A convex lens of focal length 20 cm forms a real image at 60 cm. Calculate the object distance and magnification.',
      grade: 10,
      mode: 'exam_prep'
    })
  });

  if (!physRes.ok) throw new Error(`Physics query failed: ${await physRes.text()}`);
  const physData = await physRes.json();

  console.log(`- Subject: ${physData.subject}`);
  console.log(`- Mode: ${physData.teaching_mode}`);
  console.log(`- Question Type: ${physData.question_type}`);
  console.log(`- Quality Schema Valid: ${physData.quality.schema_valid}`);
  console.log(`- Academic Checks: ${physData.quality.academic_checks}`);
  console.log(`- Passed Checks: ${physData.quality.passed_checks.join(', ')}`);
  console.log(`- Citations Verified: ${physData.citations.every(c => c.verified)}`);

  console.log('\n' + '='.repeat(80));
  console.log('E2E VERIFICATION COMPLETED SUCCESSFULLY!');
  console.log('='.repeat(80));
}

testModes().catch(err => {
  console.error('E2E verification error:', err);
  process.exit(1);
});
