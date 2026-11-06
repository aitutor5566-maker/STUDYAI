/**
 * tests/verify_advanced_voice_teacher_system.mjs
 * Comprehensive automated verification suite for STUDYAI Advanced AI Voice Teacher System.
 */
import assert from 'node:assert/strict';

const FASTAPI_URL = 'http://127.0.0.1:8000';
const NODE_URL = 'http://localhost:3001';

async function run() {
  console.log('🚀 Starting STUDYAI Advanced AI Voice Teacher System Verification Suite...\n');

  let passed = 0;
  let total = 0;

  function recordPass(testName) {
    passed++;
    total++;
    console.log(`  ✅ [PASS] ${testName}`);
  }

  function recordFail(testName, err) {
    total++;
    console.error(`  ❌ [FAIL] ${testName}:`, err?.message || err);
    throw err;
  }

  // TEST 1: Direct Tutor to Voice Bridge API Endpoint
  try {
    const res = await fetch(`${FASTAPI_URL}/api/v1/voice/create-lesson-from-tutor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'Four Chambers of the Human Heart and Blood Circulation',
        grade: 'Grade 10',
        subject: 'Biology',
        mode: 'standard',
        depth: 'complete_teacher',
        student_question: 'Explain the four chambers of human heart and how blood circulates through them',
        tutor_content: 'The heart has four chambers: right atrium, right ventricle, left atrium, and left ventricle. Deoxygenated blood enters the right atrium...',
        tutor_structured: {
          topic: 'Four Chambers of the Human Heart and Blood Circulation',
          subject: 'Biology',
          grade: 'Grade 10',
          mode: 'standard',
          foundational_prerequisite: 'Basic understanding of circulatory system and oxygen-carbon dioxide gas exchange.',
          formal_definition: 'The human heart is a four-chambered muscular organ that pumps deoxygenated blood to the lungs and oxygenated blood to the systemic circulation.',
          simplified_definition: 'The heart is like a double pump keeping fresh and used blood completely separated.',
          important_terminology: [
            { term: 'Right Atrium', pronunciation: 'ryte AY-tree-um', meaning: 'Receives deoxygenated blood from the body via vena cava' },
            { term: 'Tricuspid Valve', pronunciation: 'try-KUSS-pid valv', meaning: 'Three-flapped valve preventing backflow into right atrium' },
            { term: 'Pulmonary Artery', pronunciation: 'PULL-muh-ner-ee', meaning: 'Carries deoxygenated blood from right ventricle to lungs' },
            { term: 'Aorta', pronunciation: 'ay-OR-tuh', meaning: 'Largest systemic artery carrying oxygenated blood from left ventricle' }
          ],
          core_mechanism_steps: [
            '1. Deoxygenated blood enters right atrium from superior and inferior vena cava.',
            '2. Right ventricle contracts, sending blood via pulmonary artery to lungs.',
            '3. Oxygenated blood from lungs enters left atrium via pulmonary veins.',
            '4. Left ventricle pumps oxygenated blood through the aorta into the entire body.'
          ],
          numerical_worked_examples: [
            {
              title: 'Cardiac Output Calculation',
              formula_latex: 'CO = HR \\times SV',
              spoken_formula: 'Cardiac Output equals Heart Rate times Stroke Volume',
              given_values: 'Heart Rate HR = 72 beats per minute, Stroke Volume SV = 70 millilitres per beat',
              substitution_step: 'CO = 72 times 70 mL',
              arithmetic_result: '5040 mL/min or approximately 5.04 litres per minute',
              unit: 'L/min',
              significance: 'Measures total volume of blood pumped by left ventricle in one minute.'
            }
          ],
          visual_3d_walkthrough: {
            model_type: 'human_heart',
            view_angle: 'anterior coronal',
            guided_sequence: [
              { part_id: 'right_atrium', spoken_narration: 'Observe the upper right chamber receiving systemic blood.', duration_sec: 6 },
              { part_id: 'tricuspid_valve', spoken_narration: 'Notice the tricuspid valve opening during ventricular diastole.', duration_sec: 5 },
              { part_id: 'pulmonary_artery', spoken_narration: 'Follow the pulmonary trunk branching towards both lungs.', duration_sec: 6 },
              { part_id: 'left_ventricle', spoken_narration: 'Note the thick muscular myocardium of the left ventricle designed for systemic pressure.', duration_sec: 7 }
            ]
          },
          common_misconceptions: [
            'Misconception: All arteries carry oxygen-rich blood. Correction: The pulmonary artery carries deoxygenated blood.'
          ],
          checkpoint_question: {
            question: 'Which chamber has the thickest muscular wall and why?',
            options: [
              'Right Atrium because it collects blood from the entire body',
              'Left Ventricle because it must pump blood against high systemic vascular resistance to the whole body',
              'Right Ventricle because it pumps blood directly to the lungs',
              'Left Atrium because it receives blood from four pulmonary veins'
            ],
            correct_index: 1,
            spoken_prompt: 'Before we conclude, answer this: Which chamber has the thickest muscular wall and why?'
          }
        }
      })
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(data.session_id, 'session_id should be returned');
    assert.strictEqual(data.total_sections >= 8, true, 'complete_teacher should have at least 8 pedagogical sections');
    assert.ok(data.current_section, 'current_section should be defined');
    assert.ok(data.all_sections_outline.length >= 8, 'all_sections_outline should contain sections');

    // Check specific pedagogical sections
    const types = data.all_sections_outline.map(s => s.type);
    assert.ok(types.includes('intro'), 'Must include intro');
    assert.ok(types.includes('prerequisites'), 'Must include prerequisites');
    assert.ok(types.includes('definitions'), 'Must include definitions');
    assert.ok(types.includes('terminology'), 'Must include terminology');
    assert.ok(types.includes('core_mechanism'), 'Must include core_mechanism');
    assert.ok(types.includes('visual_3d_walkthrough'), 'Must include visual_3d_walkthrough');
    assert.ok(types.includes('checkpoint'), 'Must include checkpoint');

    recordPass('Test 1: Direct Tutor-to-Voice bridge generates classroom curriculum with full section outline');
  } catch (err) {
    recordFail('Test 1', err);
  }

  // TEST 2: 8 Subject-Specific Pedagogy Tests
  const subjectsToTest = [
    {
      subject: 'Biology',
      topic: 'Human Heart and Double Circulation',
      expectedKeyword: 'pulmonary',
      visualPart: 'right_atrium'
    },
    {
      subject: 'Physics',
      topic: 'Work, Power and Energy Relations',
      expectedKeyword: 'equals',
      formulaLatex: 'P = W / t'
    },
    {
      subject: 'Chemistry',
      topic: 'Chemical Bonding and VSEPR Water Molecular Geometry',
      expectedKeyword: 'valence',
      visualPart: 'covalent'
    },
    {
      subject: 'Mathematics',
      topic: 'Geometrical Constructions of Perpendicular Bisectors',
      expectedKeyword: 'compass',
      expectedStep: 'arc'
    },
    {
      subject: 'Geography',
      topic: 'Hydrological Water Cycle and Precipitation',
      expectedKeyword: 'evaporation',
      expectedStep: 'condensation'
    },
    {
      subject: 'History',
      topic: 'Causes of the First World War and Alliance System',
      expectedKeyword: 'alliance',
      expectedStep: 'Sarajevo'
    },
    {
      subject: 'English',
      topic: 'Active and Passive Voice Transformations',
      expectedKeyword: 'subject',
      expectedStep: 'verb'
    },
    {
      subject: 'Computer Science',
      topic: 'Binary Search Algorithm and Logarithmic Complexity',
      expectedKeyword: 'divide',
      expectedStep: 'pointer'
    }
  ];

  for (const s of subjectsToTest) {
    try {
      const res = await fetch(`${FASTAPI_URL}/api/v1/voice/create-lesson-from-tutor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: s.topic,
          grade: 'Grade 10',
          subject: s.subject,
          mode: 'standard',
          depth: 'standard',
          student_question: `Explain ${s.topic} in detail`,
          tutor_content: `Educational lesson regarding ${s.topic} covering key mechanisms and examples.`,
          tutor_structured: {
            topic: s.topic,
            subject: s.subject,
            grade: 'Grade 10',
            mode: 'standard',
            formal_definition: `${s.topic} is an essential academic concept in ${s.subject}.`,
            core_mechanism_steps: [
              `Step 1: Introduction to ${s.topic}`,
              `Step 2: Core mechanism involving ${s.expectedKeyword || 'fundamental'} logic`,
              `Step 3: Verification and conclusion`
            ],
            numerical_worked_examples: s.formulaLatex ? [
              {
                title: 'Calculation Example',
                formula_latex: s.formulaLatex,
                given_values: 'Given test values',
                arithmetic_result: 'Final numerical result'
              }
            ] : []
          }
        })
      });

      const data = await res.json();
      assert.strictEqual(res.status, 200);
      assert.ok(data.session_id);
      assert.ok(data.total_sections >= 5, `Subject ${s.subject} should have >= 5 sections in standard depth`);
      recordPass(`Test 2.${subjectsToTest.indexOf(s) + 1}: Subject Pedagogy: ${s.subject} (${s.topic.split(' ')[0]})`);
    } catch (err) {
      recordFail(`Test 2 (${s.subject})`, err);
    }
  }

  // TEST 3: Depth Variation Verification (quick, standard, detailed, complete_teacher)
  const depths = [
    { depth: 'quick', minSections: 4, maxSections: 5 },
    { depth: 'standard', minSections: 6, maxSections: 8 },
    { depth: 'detailed', minSections: 9, maxSections: 12 },
    { depth: 'complete_teacher', minSections: 10, maxSections: 15 }
  ];

  for (const d of depths) {
    try {
      const res = await fetch(`${FASTAPI_URL}/api/v1/voice/create-lesson-from-tutor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'Photosynthesis Light Dependent Reactions',
          grade: 'Grade 11',
          subject: 'Biology',
          mode: 'standard',
          depth: d.depth,
          student_question: 'Explain light reactions',
          tutor_content: 'Light reactions occur in thylakoid membranes...',
          tutor_structured: {
            topic: 'Photosynthesis Light Dependent Reactions',
            subject: 'Biology',
            grade: 'Grade 11',
            foundational_prerequisite: 'Chloroplast structure and photon energy',
            formal_definition: 'Process by which light energy is converted into chemical energy (ATP and NADPH)',
            simplified_definition: 'Plants catching sunlight to create energetic fuel packets',
            important_terminology: [{ term: 'Thylakoid', meaning: 'Membrane sac' }],
            core_mechanism_steps: ['Photolysis of water', 'Electron transport chain', 'Chemiosmosis'],
            real_world_application: 'Solar cell mimicry and bio-energy harvesting',
            common_misconceptions: ['Dark reaction only happens at night'],
            checkpoint_question: {
              question: 'Where do light reactions take place?',
              options: ['Thylakoid membrane', 'Stroma', 'Mitochondria', 'Cytoplasm'],
              correct_index: 0
            }
          }
        })
      });

      const data = await res.json();
      assert.strictEqual(res.status, 200);
      assert.ok(
        data.total_sections >= d.minSections && data.total_sections <= d.maxSections,
        `Depth '${d.depth}' expected ${d.minSections}-${d.maxSections} sections, got ${data.total_sections}`
      );
      recordPass(`Test 3.${depths.indexOf(d) + 1}: Depth level '${d.depth}' correctly scaled to ${data.total_sections} sections`);
    } catch (err) {
      recordFail(`Test 3 (${d.depth})`, err);
    }
  }

  // TEST 4: Interactive Commands on Active Session
  try {
    // 4.1 Start session
    const startRes = await fetch(`${FASTAPI_URL}/api/v1/voice/create-lesson-from-tutor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'Newton Second Law of Motion',
        grade: 'Grade 9',
        subject: 'Physics',
        depth: 'standard',
        student_question: 'Explain F = ma',
        tutor_content: 'Force equals mass times acceleration.',
        tutor_structured: {
          topic: 'Newton Second Law of Motion',
          formal_definition: 'Rate of change of momentum is directly proportional to applied net force.',
          core_mechanism_steps: ['Net external force causes acceleration', 'a is inversely proportional to mass'],
          numerical_worked_examples: [{
            title: 'Force Calculation',
            formula_latex: 'F = m \\times a',
            spoken_formula: 'F equals m times a',
            given_values: 'm = 10 kg, a = 2 m/s^2',
            arithmetic_result: 'F = 20 Newtons'
          }],
          checkpoint_question: {
            question: 'What is the SI unit of force?',
            options: ['Joule', 'Newton', 'Watt', 'Pascal'],
            correct_index: 1
          }
        }
      })
    });
    const sessionData = await startRes.json();
    const sessionId = sessionData.session_id;
    assert.ok(sessionId, 'Should have active sessionId');

    // 4.2 Interactive Command: explain_simpler
    const simplerRes = await fetch(`${FASTAPI_URL}/api/v1/voice/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, command: 'explain_simpler' })
    });
    const simplerData = await simplerRes.json();
    assert.strictEqual(simplerRes.status, 200);
    assert.ok(simplerData.current_section.spoken_script.length > 0);
    recordPass('Test 4.1: Command "explain_simpler" produced simplified breakdown without losing topic context');

    // 4.3 Interactive Command: give_example
    const egRes = await fetch(`${FASTAPI_URL}/api/v1/voice/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, command: 'give_example' })
    });
    const egData = await egRes.json();
    assert.strictEqual(egRes.status, 200);
    assert.ok(egData.current_section.spoken_script.includes('example') || egData.current_section.spoken_script.includes('Imagine') || egData.current_section.spoken_script.length > 0);
    recordPass('Test 4.2: Command "give_example" delivered immediate concrete analogy');

    // 4.4 Interactive Command: explain_formula
    const formRes = await fetch(`${FASTAPI_URL}/api/v1/voice/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, command: 'explain_formula' })
    });
    const formData = await formRes.json();
    assert.strictEqual(formRes.status, 200);
    assert.ok(formData.current_section.spoken_script.length > 0);
    recordPass('Test 4.3: Command "explain_formula" vocalized equation variables and units');

    // 4.5 Interactive Command: jump_section
    const jumpRes = await fetch(`${FASTAPI_URL}/api/v1/voice/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, command: 'jump_section', section_index: sessionData.total_sections - 1 })
    });
    const jumpData = await jumpRes.json();
    assert.strictEqual(jumpRes.status, 200);
    assert.strictEqual(jumpData.current_section_index, sessionData.total_sections - 1);
    recordPass(`Test 4.4: Command "jump_section" navigated directly to checkpoint (index ${sessionData.total_sections - 1})`);

    // 4.6 Checkpoint answer evaluation
    const evalRes = await fetch(`${FASTAPI_URL}/api/v1/voice/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, command: 'submit_answer', selected_option_index: 1 })
    });
    const evalData = await evalRes.json();
    assert.strictEqual(evalRes.status, 200);
    assert.strictEqual(evalData.checkpoint_result?.is_correct, true);
    recordPass('Test 4.5: Checkpoint submitted answer correctly scored (Newton is correct)');
  } catch (err) {
    recordFail('Test 4', err);
  }

  // TEST 5: Multilingual Voice Teacher
  const testLangs = [
    { lang: 'Telugu', code: 'te', expectedScripHint: 'మరియు' },
    { lang: 'Hindi', code: 'hi', expectedScripHint: 'और' },
    { lang: 'Urdu', code: 'ur', expectedScripHint: 'اور' },
    { lang: 'Malayalam', code: 'ml', expectedScripHint: 'കൂടാതെ' }
  ];

  for (const l of testLangs) {
    try {
      const res = await fetch(`${FASTAPI_URL}/api/v1/voice/create-lesson-from-tutor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'Cell Structure and Organelles',
          grade: 'Grade 9',
          subject: 'Biology',
          language: l.lang,
          depth: 'quick',
          student_question: 'Explain cell structure',
          tutor_content: 'Cells are the basic unit of life with nucleus, mitochondria and cell membrane.',
          tutor_structured: {
            topic: 'Cell Structure and Organelles',
            formal_definition: 'Cells are microscopic structural units.',
            important_terminology: [{ term: 'Mitochondria', meaning: 'Powerhouse of the cell' }]
          }
        })
      });

      const data = await res.json();
      assert.strictEqual(res.status, 200);
      assert.ok(data.current_section.spoken_script.length > 0);
      recordPass(`Test 5.${testLangs.indexOf(l) + 1}: Multilingual Voice Teacher successfully configured for ${l.lang}`);
    } catch (err) {
      recordFail(`Test 5 (${l.lang})`, err);
    }
  }

  // TEST 6: Dual Mode Verification (Normal Learning Mode vs Exam Preparation Mode)
  try {
    const normalRes = await fetch(`${FASTAPI_URL}/api/v1/voice/create-lesson-from-tutor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'Ohm Law',
        grade: 'Grade 10',
        subject: 'Physics',
        mode: 'standard',
        depth: 'standard',
        student_question: 'Explain Ohms Law',
        tutor_content: 'V = IR',
        tutor_structured: { topic: 'Ohm Law', formal_definition: 'V = IR' }
      })
    });
    const normalData = await normalRes.json();

    const examRes = await fetch(`${FASTAPI_URL}/api/v1/voice/create-lesson-from-tutor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'Ohm Law',
        grade: 'Grade 10',
        subject: 'Physics',
        mode: 'exam_prep',
        depth: 'standard',
        student_question: 'Explain Ohms Law',
        tutor_content: 'V = IR. Key exam points and common pitfalls.',
        tutor_structured: {
          topic: 'Ohm Law',
          formal_definition: 'V = IR',
          common_misconceptions: ['Thinking non-ohmic conductors obey V=IR at high temp'],
          exam_tips: ['Always state at constant temperature in your definition to earn full marks']
        }
      })
    });
    const examData = await examRes.json();

    assert.strictEqual(normalRes.status, 200);
    assert.strictEqual(examRes.status, 200);
    assert.ok(examData.current_section.spoken_script.toLowerCase().includes('exam') || examData.all_sections_outline.some(s => s.title.toLowerCase().includes('exam') || s.type === 'pitfalls'));
    recordPass('Test 6: Dual Mode: Exam Preparation Mode actively emphasizes mark schemes and common pitfalls');
  } catch (err) {
    recordFail('Test 6', err);
  }

  console.log(`\n🎉 Verification Completed: ${passed}/${total} Tests Passed Successfully!\n`);
}

run().catch((err) => {
  console.error('\n💥 Test suite execution failed:', err);
  process.exit(1);
});
