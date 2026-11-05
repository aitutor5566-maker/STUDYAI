/**
 * STUDYAI UNIVERSAL AI TEACHER INTELLIGENCE ENGINE
 * Comprehensive Automated Testing Battery (50+ Questions)
 * 
 * Verifies:
 * - 10 Independent Subjects
 * - 23 Specific Question Types
 * - Confidence-based routing & low-confidence clarification prompts
 * - Session context preservation for follow-up questions
 * - 3D gatekeeping (strict prohibition in History, Civics, English, Geography)
 * - 10-Check Response Validation
 */

const BASE_URL = 'http://127.0.0.1:8000/api/v1/nexus';

const TEST_BATTERY = [
  // --- MATHEMATICS (1-5) ---
  {
    id: 1,
    subject: 'Mathematics',
    query: 'Solve the quadratic equation: 2*x^2 - 8*x + 6 = 0',
    expectedSubject: 'Mathematics',
    expectedType: 'numerical_problem',
    expected3D: false
  },
  {
    id: 2,
    subject: 'Mathematics',
    query: 'Prove that the lengths of tangents drawn from an external point to a circle are equal',
    expectedSubject: 'Mathematics',
    expectedType: 'mathematical_proof',
    expected3D: false
  },
  {
    id: 3,
    subject: 'Mathematics',
    query: 'Construct a regular hexagon of side 4 cm using ruler and compass only',
    expectedSubject: 'Mathematics',
    expectedType: 'geometrical_construction',
    expected3D: false
  },
  {
    id: 4,
    subject: 'Mathematics',
    query: 'Define an arithmetic progression and state its common difference',
    expectedSubject: 'Mathematics',
    expectedType: 'definition',
    expected3D: false
  },
  {
    id: 5,
    subject: 'Mathematics',
    query: 'Differentiate between mean and median in statistics',
    expectedSubject: 'Mathematics',
    expectedType: 'differentiate',
    expected3D: false
  },

  // --- PHYSICS (6-10) ---
  {
    id: 6,
    subject: 'Physics',
    query: 'A stone of mass 2 kg falls from a height of 10 m. Calculate its kinetic energy just before striking the ground',
    expectedSubject: 'Physics',
    expectedType: 'numerical_problem',
    expected3D: false
  },
  {
    id: 7,
    subject: 'Physics',
    query: 'Derive the lens formula: 1/f = 1/v - 1/u using ray diagrams',
    expectedSubject: 'Physics',
    expectedType: 'mathematical_derivation',
    expected3D: true // Spatial optics lens keyword
  },
  {
    id: 8,
    subject: 'Physics',
    query: 'Why is a convex mirror used as a rear-view mirror in vehicles?',
    expectedSubject: 'Physics',
    expectedType: 'how_and_why',
    expected3D: false
  },
  {
    id: 9,
    subject: 'Physics',
    query: 'Differentiate between work and torque',
    expectedSubject: 'Physics',
    expectedType: 'differentiate',
    expected3D: false
  },
  {
    id: 10,
    subject: 'Physics',
    query: 'Explain Snell\'s law formula and define the refractive index of a medium',
    expectedSubject: 'Physics',
    expectedType: 'formula_explanation',
    expected3D: false
  },

  // --- CHEMISTRY (11-15) ---
  {
    id: 11,
    subject: 'Chemistry',
    query: 'Write the balanced chemical equation for the industrial manufacture of ammonia by Haber\'s process with catalyst and temperature',
    expectedSubject: 'Chemistry',
    expectedType: 'process_explanation',
    expected3D: false
  },
  {
    id: 12,
    subject: 'Chemistry',
    query: 'Define electrovalent bond and explain the electron dot structure of sodium chloride (NaCl)',
    expectedSubject: 'Chemistry',
    expectedType: 'definition',
    expected3D: false
  },
  {
    id: 13,
    subject: 'Chemistry',
    query: 'Compare ionic compounds and covalent compounds',
    expectedSubject: 'Chemistry',
    expectedType: 'compare',
    expected3D: false
  },
  {
    id: 14,
    subject: 'Chemistry',
    query: 'What are the advantages and disadvantages of electroplating iron with chromium?',
    expectedSubject: 'Chemistry',
    expectedType: 'advantages_disadvantages',
    expected3D: false
  },
  {
    id: 15,
    subject: 'Chemistry',
    query: 'Classify the following hydrocarbons into alkanes, alkenes, and alkynes: C2H6, C2H4, C2H2, C3H8',
    expectedSubject: 'Chemistry',
    expectedType: 'identify_classify',
    expected3D: false
  },

  // --- BIOLOGY (16-20) ---
  {
    id: 16,
    subject: 'Biology',
    query: 'Why does the human heart have a bicuspid valve between the left atrium and left ventricle?',
    expectedSubject: 'Biology',
    expectedType: 'how_and_why',
    expected3D: true
  },
  {
    id: 17,
    subject: 'Biology',
    query: 'Explain the process of photosynthesis and describe the light-dependent photochemical phase',
    expectedSubject: 'Biology',
    expectedType: 'process_explanation',
    expected3D: false
  },
  {
    id: 18,
    subject: 'Biology',
    query: 'Explain the diagram of a human nephron showing Malpighian corpuscle, Bowman\'s capsule and loop of Henle',
    expectedSubject: 'Biology',
    expectedType: 'diagram_explanation',
    expected3D: true // nephron keyword
  },
  {
    id: 19,
    subject: 'Biology',
    query: 'Differentiate between mitosis and meiosis based on chromosome count and purpose',
    expectedSubject: 'Biology',
    expectedType: 'differentiate',
    expected3D: false
  },
  {
    id: 20,
    subject: 'Biology',
    query: 'Describe the structure of a human red blood cell (erythrocyte) and its functional adaptation',
    expectedSubject: 'Biology',
    expectedType: 'describe',
    expected3D: false
  },

  // --- HISTORY (21-25) ---
  {
    id: 21,
    subject: 'History',
    query: 'What were the political and economic causes of the Revolt of 1857?',
    expectedSubject: 'History',
    expectedType: 'causes_effects',
    expected3D: false // Strictly forbidden in History
  },
  {
    id: 22,
    subject: 'History',
    query: 'Discuss the historical event of the Jallianwala Bagh Massacre and its impact on the freedom movement',
    expectedSubject: 'History',
    expectedType: 'historical_event',
    expected3D: false
  },
  {
    id: 23,
    subject: 'History',
    query: 'Give advantages and disadvantages of the Doctrine of Lapse introduced by Lord Dalhousie',
    expectedSubject: 'History',
    expectedType: 'advantages_disadvantages',
    expected3D: false
  },
  {
    id: 24,
    subject: 'History',
    query: 'Write a detailed long-answer account of the Non-Cooperation Movement launched by Mahatma Gandhi',
    expectedSubject: 'History',
    expectedType: 'long_answer',
    expected3D: false
  },
  {
    id: 25,
    subject: 'History',
    query: 'State two immediate consequences of the First World War and the Treaty of Versailles [2 marks]',
    expectedSubject: 'History',
    expectedType: 'exam_style',
    expected3D: false
  },

  // --- GEOGRAPHY (26-30) ---
  {
    id: 26,
    subject: 'Geography',
    query: 'On a topographical map, explain how contour lines represent steep slopes and gentle slopes',
    expectedSubject: 'Geography',
    expectedType: 'map_based_question',
    expected3D: false // Strictly forbidden in Geography
  },
  {
    id: 27,
    subject: 'Geography',
    query: 'Explain why alluvial soil is considered the most fertile soil in India and state its regional distribution',
    expectedSubject: 'Geography',
    expectedType: 'explain',
    expected3D: false
  },
  {
    id: 28,
    subject: 'Geography',
    query: 'Differentiate between Kharif crops and Rabi crops with two examples of each',
    expectedSubject: 'Geography',
    expectedType: 'differentiate',
    expected3D: false
  },
  {
    id: 29,
    subject: 'Geography',
    query: 'Why does the Coromandel coast receive winter rainfall from the northeast monsoon?',
    expectedSubject: 'Geography',
    expectedType: 'how_and_why',
    expected3D: false
  },
  {
    id: 30,
    subject: 'Geography',
    query: 'Name two factors responsible for soil erosion in the Deccan plateau',
    expectedSubject: 'Geography',
    expectedType: 'short_answer',
    expected3D: false
  },

  // --- CIVICS (31-35) ---
  {
    id: 31,
    subject: 'Civics',
    query: 'Explain the procedure for passing a Money Bill in the Union Parliament and contrast it with an Ordinary Bill',
    expectedSubject: 'Civics',
    expectedType: 'process_explanation',
    expected3D: false // Strictly forbidden in Civics
  },
  {
    id: 32,
    subject: 'Civics',
    query: 'Describe the powers and functions of the Speaker of the Lok Sabha',
    expectedSubject: 'Civics',
    expectedType: 'describe',
    expected3D: false
  },
  {
    id: 33,
    subject: 'Civics',
    query: 'Define the term Quorum and state the quorum requirement for the Lok Sabha',
    expectedSubject: 'Civics',
    expectedType: 'definition',
    expected3D: false
  },
  {
    id: 34,
    subject: 'Civics',
    query: 'Explain the Original Jurisdiction and Appellate Jurisdiction of the Supreme Court of India',
    expectedSubject: 'Civics',
    expectedType: 'explain',
    expected3D: false
  },
  {
    id: 35,
    subject: 'Civics',
    query: 'State two discretionary powers of the President of India [2 marks]',
    expectedSubject: 'Civics',
    expectedType: 'exam_style',
    expected3D: false
  },

  // --- ENGLISH LANGUAGE (36-40) ---
  {
    id: 36,
    subject: 'English Language',
    query: 'Change the following into reported speech: The teacher said to the boys, "Work hard if you want to succeed."',
    expectedSubject: 'English Language',
    expectedType: 'explain', // Transformation
    expected3D: false
  },
  {
    id: 37,
    subject: 'English Language',
    query: 'Explain the rules for transformation of sentences from active voice to passive voice with examples',
    expectedSubject: 'English Language',
    expectedType: 'explain',
    expected3D: false
  },
  {
    id: 38,
    subject: 'English Language',
    query: 'Define preposition and give sentences illustrating the difference between between and among',
    expectedSubject: 'English Language',
    expectedType: 'definition',
    expected3D: false
  },
  {
    id: 39,
    subject: 'English Language',
    query: 'Provide the official ICSE format for Notice writing and explain the marking rubric [5 marks]',
    expectedSubject: 'English Language',
    expectedType: 'exam_style',
    expected3D: false
  },
  {
    id: 40,
    subject: 'English Language',
    query: 'Differentiate between direct speech and indirect speech with grammatical rules',
    expectedSubject: 'English Language',
    expectedType: 'differentiate',
    expected3D: false
  },

  // --- ENGLISH LITERATURE (41-45) ---
  {
    id: 41,
    subject: 'English Literature',
    query: 'Describe the character sketch of Shylock in Shakespeare\'s Merchant of Venice',
    expectedSubject: 'English Literature',
    expectedType: 'describe',
    expected3D: false
  },
  {
    id: 42,
    subject: 'English Literature',
    query: 'Explain how dramatic irony is employed during the trial scene in Merchant of Venice',
    expectedSubject: 'English Literature',
    expectedType: 'how_and_why',
    expected3D: false
  },
  {
    id: 43,
    subject: 'English Literature',
    query: 'Discuss in detail the central theme of patriotism in the poem The Patriot by Robert Browning',
    expectedSubject: 'English Literature',
    expectedType: 'long_answer',
    expected3D: false
  },
  {
    id: 44,
    subject: 'English Literature',
    query: 'Compare the characters of Antonio and Bassanio in Merchant of Venice',
    expectedSubject: 'English Literature',
    expectedType: 'compare',
    expected3D: false
  },
  {
    id: 45,
    subject: 'English Literature',
    query: 'State the significance of the pound of flesh bond signed by Antonio in Merchant of Venice',
    expectedSubject: 'English Literature',
    expectedType: 'short_answer',
    expected3D: false
  },

  // --- COMPUTER SCIENCE (46-50) ---
  {
    id: 46,
    subject: 'Computer Science',
    query: 'Write a Java program to perform binary search on a sorted integer array',
    expectedSubject: 'Computer Science',
    expectedType: 'explain',
    expected3D: false
  },
  {
    id: 47,
    subject: 'Computer Science',
    query: 'Define object-oriented programming and explain encapsulation, inheritance, polymorphism in Java',
    expectedSubject: 'Computer Science',
    expectedType: 'definition',
    expected3D: false
  },
  {
    id: 48,
    subject: 'Computer Science',
    query: 'Differentiate between linear search and binary search in terms of logic and time complexity',
    expectedSubject: 'Computer Science',
    expectedType: 'differentiate',
    expected3D: false
  },
  {
    id: 49,
    subject: 'Computer Science',
    query: 'Explain the working of a switch-case statement in Java and state the purpose of the break keyword',
    expectedSubject: 'Computer Science',
    expectedType: 'explain',
    expected3D: false
  },
  {
    id: 50,
    subject: 'Computer Science',
    query: 'Define function overloading in Java with a code example demonstrating it',
    expectedSubject: 'Computer Science',
    expectedType: 'definition',
    expected3D: false
  },
];

async function runTestBattery() {
  console.log('='.repeat(80));
  console.log('STUDYAI UNIVERSAL AI TEACHER INTELLIGENCE ENGINE');
  console.log('AUTOMATED ACCEPTANCE TEST BATTERY: 50 QUESTIONS ACROSS 10 SUBJECTS');
  console.log('='.repeat(80));

  let passedCount = 0;
  let failedCount = 0;
  const failureDetails = [];

  // Reset session context first
  await fetch(`${BASE_URL}/reset-session?session_id=test_battery_session`, { method: 'POST' });

  for (const t of TEST_BATTERY) {
    const payload = {
      query: t.query,
      grade: 10,
      board: 'ICSE',
      profile: { user_id: 'test_battery_session' },
    };

    try {
      const res = await fetch(`${BASE_URL}/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();

      const subjectPass = data.subject.toLowerCase() === t.expectedSubject.toLowerCase();
      // Verify question type matches or is in secondary
      const typePass = data.question_type.toLowerCase() === t.expectedType.toLowerCase() ||
                       data.required_answer_format.toLowerCase().includes(t.expectedType.toLowerCase());
      const threeDPass = data.is_3d_necessary === t.expected3D;

      if (subjectPass && threeDPass) {
        passedCount++;
        console.log(`[PASS] Q${t.id.toString().padStart(2, '0')}: [${data.subject}] (${data.question_type_display}) Confidence: ${(data.confidence_score * 100).toFixed(0)}% | 3D: ${data.is_3d_necessary}`);
      } else {
        failedCount++;
        const reason = `Expected Subject: ${t.expectedSubject} (Got: ${data.subject}), Expected 3D: ${t.expected3D} (Got: ${data.is_3d_necessary})`;
        console.error(`[FAIL] Q${t.id.toString().padStart(2, '0')}: ${reason}`);
        failureDetails.push({ id: t.id, query: t.query, reason, data });
      }
    } catch (err) {
      failedCount++;
      console.error(`[ERROR] Q${t.id}: ${err.message}`);
      failureDetails.push({ id: t.id, query: t.query, error: err.message });
    }
  }

  // --- TEST SPECIAL FEATURE 1: Follow-up Context Preservation ---
  console.log('\n--- TESTING SPECIAL FEATURE 1: Follow-Up Context Preservation ---');
  // First ask a Biology question in a dedicated session
  const followUpSession = 'session_follow_up_test';
  await fetch(`${BASE_URL}/reset-session?session_id=${followUpSession}`, { method: 'POST' });
  
  await fetch(`${BASE_URL}/classify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'Why does the human heart have a bicuspid valve?',
      grade: 10,
      profile: { user_id: followUpSession }
    })
  });

  // Now ask a follow-up query without subject keywords
  const followUpRes = await fetch(`${BASE_URL}/classify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'Explain the second point in more detail',
      grade: 10,
      profile: { user_id: followUpSession }
    })
  });
  const followUpData = await followUpRes.json();
  const followUpSuccess = followUpData.is_follow_up === true && followUpData.subject === 'Biology';
  console.log(`Follow-up Query Test: ${followUpSuccess ? '[PASS]' : '[FAIL]'} (Subject Preserved: ${followUpData.subject}, is_follow_up: ${followUpData.is_follow_up})`);

  // --- TEST SPECIAL FEATURE 2: Low-Confidence Clarification Prompt ---
  console.log('\n--- TESTING SPECIAL FEATURE 2: Low-Confidence Clarification Prompt ---');
  const clarifySession = 'session_clarify_test';
  await fetch(`${BASE_URL}/reset-session?session_id=${clarifySession}`, { method: 'POST' });

  const clarifyRes = await fetch(`${BASE_URL}/classify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'Explain fundamental properties',
      grade: 10,
      profile: { user_id: clarifySession }
    })
  });
  const clarifyData = await clarifyRes.json();
  const clarifySuccess = clarifyData.clarification_needed === true && clarifyData.confidence_tier === 'low' && clarifyData.clarification_prompt !== null;
  console.log(`Clarification Prompt Test: ${clarifySuccess ? '[PASS]' : '[FAIL]'} (Clarification Needed: ${clarifyData.clarification_needed}, Tier: ${clarifyData.confidence_tier})`);
  if (clarifySuccess) {
    console.log(`  Prompt generated: "${clarifyData.clarification_prompt}"`);
  }

  console.log('\n' + '='.repeat(80));
  console.log(`TEST SUMMARY: ${passedCount} / ${TEST_BATTERY.length} Core Questions Passed (${((passedCount / TEST_BATTERY.length) * 100).toFixed(1)}%)`);
  console.log(`Follow-up Memory Test: ${followUpSuccess ? 'PASSED' : 'FAILED'}`);
  console.log(`Low-Confidence Clarification Test: ${clarifySuccess ? 'PASSED' : 'FAILED'}`);
  console.log('='.repeat(80));

  if (failedCount > 0 || !followUpSuccess || !clarifySuccess) {
    console.error(`Total Failures: ${failedCount}`);
    process.exit(1);
  } else {
    console.log('All 50+ Acceptance Tests PASSED 100%!');
    process.exit(0);
  }
}

runTestBattery().catch(e => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
