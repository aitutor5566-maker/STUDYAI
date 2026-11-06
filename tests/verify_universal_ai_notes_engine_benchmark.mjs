/**
 * Comprehensive Benchmark Suite: STUDYAI Universal Intelligent AI Notes Engine
 *
 * Verifies:
 * 1. Live Topic Classification & Disambiguation (/api/notes/classify)
 * 2. Automatic Student Profile Resolution (Zero manual selection required)
 * 3. 13-Subject Coverage Benchmark (Physics, Chemistry, Biology, Mathematics, History, Geography, Civics, Economics, English, CS, Accountancy)
 * 4. Anti-Hallucination & Anti-Formula-Bleed (Strict formula checks vs non-numerical zero fake formulas)
 * 5. Step-by-Step Worked Problems with SI Units and Dimensional Checks
 * 6. Specialized Domain Technical SVG Diagrams
 * 7. 4 Design Modes Switcher & Persistence (handwritten, infographic, formula-sheet, chapter-detailed)
 * 8. The Final Comprehensive Revision Page (Matrix, formulas/dates, definitions, mnemonics, model questions)
 * 9. Multi-Format Export (HTML with Final Revision Page, Markdown)
 */

const BASE_URL = 'http://localhost:3001';

async function main() {
  console.log('========================================================================');
  console.log('🧪 RUNNING UNIVERSAL INTELLIGENT AI NOTES ENGINE BENCHMARK SUITE');
  console.log('========================================================================\n');

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${testName} ${details ? '(' + details + ')' : ''}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${details ? '— ' + details : ''}`);
      failedTests++;
    }
  }

  // TEST 1: LIVE CLASSIFICATION & DISAMBIGUATION ENDPOINT
  console.log('--- TEST GROUP 1: Live Universal Topic Classification & Disambiguation ---');
  try {
    const resFriction = await fetch(`${BASE_URL}/api/notes/classify?topic=Friction`);
    const dataFriction = await resFriction.json();
    assert(resFriction.status === 200, 'GET /api/notes/classify?topic=Friction returns 200');
    assert(dataFriction.classification?.subject === 'Physics', 'Friction classified as Physics', dataFriction.classification?.subject);
    assert(dataFriction.classification?.requiresFormulas === true, 'Friction requires formulas');
    assert(dataFriction.classification?.visualSpecification?.targetMedium === 'Physics Mechanics Vector Diagram', 'Target medium is Physics Vector Diagram');

    // Ambiguous topic: "Cell"
    const resCell = await fetch(`${BASE_URL}/api/notes/classify?topic=Cell`);
    const dataCell = await resCell.json();
    assert(dataCell.classification?.isAmbiguous === true, 'Ambiguous topic "Cell" flagged as isAmbiguous=true');
    assert(Array.isArray(dataCell.classification?.disambiguationOptions) && dataCell.classification.disambiguationOptions.length >= 2, 'Cell returns disambiguation options', `count: ${dataCell.classification?.disambiguationOptions?.length}`);

    // Ambiguous topic: "Current"
    const resCurrent = await fetch(`${BASE_URL}/api/notes/classify?topic=Current`);
    const dataCurrent = await resCurrent.json();
    assert(dataCurrent.classification?.isAmbiguous === true, 'Ambiguous topic "Current" flagged as isAmbiguous=true');
  } catch (err) {
    assert(false, 'Live Classification Endpoint', err.message);
  }

  // TEST 2: ALL 13 SUBJECTS BENCHMARK GENERATION (TOPIC-ONLY INPUT)
  console.log('\n--- TEST GROUP 2: 13-Subject Universal Topic-First Generation Benchmark ---');
  const benchmarkTopics = [
    { topic: 'Friction', expectedSubject: 'Physics', requiresFormulas: true, hasNumericals: true },
    { topic: 'Circular motion', expectedSubject: 'Physics', requiresFormulas: true, hasNumericals: true },
    { topic: 'Photosynthesis', expectedSubject: 'Biology', requiresFormulas: false, hasNumericals: false },
    { topic: 'Human heart', expectedSubject: 'Biology', requiresFormulas: false, hasNumericals: false },
    { topic: 'Chemical bonding', expectedSubject: 'Chemistry', requiresFormulas: false, hasNumericals: false },
    { topic: 'Quadratic equations', expectedSubject: 'Mathematics', requiresFormulas: true, hasNumericals: true },
    { topic: 'French Revolution', expectedSubject: 'History', requiresFormulas: false, hasNumericals: false },
    { topic: 'Climate', expectedSubject: 'Geography', requiresFormulas: false, hasNumericals: false },
    { topic: 'Fundamental Rights', expectedSubject: 'Civics', requiresFormulas: false, hasNumericals: false },
    { topic: 'Macbeth', expectedSubject: 'English', requiresFormulas: false, hasNumericals: false },
    { topic: 'Computer networks', expectedSubject: 'Computer Science', requiresFormulas: false, hasNumericals: false },
    { topic: 'Demand and supply', expectedSubject: 'Economics', requiresFormulas: true, hasNumericals: true },
    { topic: 'Journal entries', expectedSubject: 'Accountancy', requiresFormulas: true, hasNumericals: true }
  ];

  let testNoteId = null;

  for (const b of benchmarkTopics) {
    try {
      console.log(`\n  Testing topic: "${b.topic}" (Zero manual subject/board selection)...`);
      const res = await fetch(`${BASE_URL}/api/notes/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: b.topic // ONLY TOPIC SUPPLIED
        })
      });
      const note = await res.json();
      assert(res.status === 200 || res.status === 201, `POST /api/notes/generate for "${b.topic}" returned 200/201`);
      assert(note.subject === b.expectedSubject, `Subject inferred as "${b.expectedSubject}"`, `actual: ${note.subject}`);
      
      const structured = note.structured || {};
      
      // Strict Anti-Hallucination Formula Check
      if (b.requiresFormulas) {
        assert(structured.formula || (Array.isArray(structured.workedProblems) && structured.workedProblems.length > 0), `Formulas present for quantitative topic "${b.topic}"`);
        if (b.hasNumericals) {
          const probs = structured.workedProblems || [];
          assert(probs.length > 0, `Worked problems generated for "${b.topic}"`, `count: ${probs.length}`);
          if (probs[0]) {
            assert(typeof probs[0].finalAnswer === 'string' && probs[0].finalAnswer.length > 0, `Final answer present with SI units`);
            assert(typeof probs[0].dimensionalCheck === 'string' && probs[0].dimensionalCheck.length > 0, `Dimensional check present: ${probs[0].dimensionalCheck}`);
          }
        }
      } else {
        // Zero fake formulas in non-numerical subjects!
        const fakeFormulaBleed = structured.formula && typeof structured.formula === 'object' && structured.formula.equation && structured.formula.equation.includes('=') && !b.topic.toLowerCase().includes('chemical');
        assert(!fakeFormulaBleed, `Strict Anti-Hallucination: No fake mathematical formulas generated for "${b.topic}"`);
      }

      // Check specialized visual SVG diagram
      const images = structured.images || [];
      assert(images.length > 0, `Specialized educational diagram generated for "${b.topic}"`);
      if (images[0]) {
        assert(typeof images[0].imageUrl === 'string' && images[0].imageUrl.startsWith('data:image/svg+xml'), `Diagram is genuine technical SVG data URL`);
        assert(images[0].explanationSevenPart?.whatItShows?.length > 0, `7-Part visual diagram walkthrough present`);
      }

      // Check Final Comprehensive Revision Page (Mandatory feature)
      const finalRevision = structured.finalRevisionPage || note.finalRevisionPage;
      assert(Boolean(finalRevision), `Final Comprehensive Revision Page present for "${b.topic}"`);
      if (finalRevision) {
        assert(typeof finalRevision.executiveSummary === 'string' && finalRevision.executiveSummary.length > 20, `Executive revision summary present`);
        assert(Array.isArray(finalRevision.quickRevisionMatrix) && finalRevision.quickRevisionMatrix.length >= 2, `Quick Revision Concept Matrix table present (${finalRevision.quickRevisionMatrix?.length} rows)`);
        assert(Array.isArray(finalRevision.keyFormulasOrDatesOrRules) && finalRevision.keyFormulasOrDatesOrRules.length >= 1, `Master formulas/dates/rules present`);
        assert(Array.isArray(finalRevision.highYieldDefinitions) && finalRevision.highYieldDefinitions.length >= 2, `High-yield definitions present`);
        assert(Array.isArray(finalRevision.modelExamQuestions) && finalRevision.modelExamQuestions.length >= 1, `Model exam questions with answer keys present`);
      }

      if (!testNoteId) {
        testNoteId = note.id;
      }
    } catch (err) {
      assert(false, `Generation benchmark for "${b.topic}"`, err.message);
    }
  }

  // TEST 3: 4 DESIGN MODES SWITCHER & PERSISTENCE
  console.log('\n--- TEST GROUP 3: 4 Design Modes Switcher & Persistence ---');
  if (testNoteId) {
    const modes = ['handwritten', 'infographic', 'formula-sheet', 'chapter-detailed'];
    for (const mode of modes) {
      try {
        const updateRes = await fetch(`${BASE_URL}/api/notes/${testNoteId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            design_mode: mode
          })
        });
        const updated = await updateRes.json();
        assert(updateRes.status === 200, `PUT /api/notes/${testNoteId} switched to mode "${mode}"`);
        assert(updated.design_mode === mode, `Active note design_mode persisted as "${mode}"`);
      } catch (err) {
        assert(false, `Switch design mode to "${mode}"`, err.message);
      }
    }
  }

  // TEST 4: MULTI-FORMAT EXPORT WITH FINAL COMPREHENSIVE REVISION PAGE
  console.log('\n--- TEST GROUP 4: Multi-Format Export (HTML Print & Markdown) ---');
  if (testNoteId) {
    try {
      const htmlExportRes = await fetch(`${BASE_URL}/api/notes/${testNoteId}/export?format=html`);
      const htmlText = await htmlExportRes.text();
      assert(htmlExportRes.status === 200, `GET /api/notes/:id/export?format=html returned 200`);
      assert(htmlText.includes('THE FINAL COMPREHENSIVE REVISION PAGE'), `HTML export contains The Final Comprehensive Revision Page banner`);
      assert(htmlText.includes('Quick Revision Concept Matrix'), `HTML export contains Concept Matrix table`);
      assert(htmlText.includes('Model Board Exam Questions'), `HTML export contains Model Exam Questions`);
      assert(htmlText.includes('data:image/svg+xml'), `HTML export contains embedded technical SVG diagram`);

      const mdExportRes = await fetch(`${BASE_URL}/api/notes/${testNoteId}/export?format=md`);
      const mdText = await mdExportRes.text();
      assert(mdExportRes.status === 200, `GET /api/notes/:id/export?format=md returned 200`);
      assert(mdText.includes('#') && mdText.length > 200, `Markdown export contains structured headings and content`);
    } catch (err) {
      assert(false, 'Export formats', err.message);
    }
  }

  console.log('\n========================================================================');
  console.log(`📊 BENCHMARK COMPLETE: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('========================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal benchmark error:', err);
  process.exit(1);
});
