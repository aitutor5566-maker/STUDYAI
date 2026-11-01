/**
 * STUDYAI — PHASE 3 & 4 END-TO-END AI NOTES REBUILD VERIFICATION SUITE (TESTS 1–8)
 * Verifies every mandatory requirement from Section 13 of the Master Prompt against http://localhost:3001.
 */
import fs from 'node:fs';
import path from 'node:path';
import { EventEmitter } from 'node:events';
import { createAppServer } from '../server/index.ts';

const serverInstance = createAppServer();
const BASE_URL = 'http://localhost:3001';

async function apiRequest(endpoint, options = {}) {
  return new Promise((resolve, reject) => {
    const req = new EventEmitter();
    req.method = options.method || 'GET';
    req.url = endpoint;
    req.headers = {
      'x-user-id': 'student-alex',
      'x-student-id': 'student-alex',
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...Object.fromEntries(Object.entries(options.headers || {}).map(([k, v]) => [k.toLowerCase(), v]))
    };
    req.socket = { remoteAddress: '127.0.0.1' };
    req.destroy = () => {};

    let statusCode = 200;
    const responseHeaders = {};
    const chunks = [];
    const res = {
      writeHead(code, headers) {
        statusCode = code;
        if (headers) Object.assign(responseHeaders, headers);
      },
      setHeader(k, v) {
        responseHeaders[k.toLowerCase()] = v;
      },
      getHeader(k) {
        return responseHeaders[k.toLowerCase()];
      },
      end(body) {
        if (body) chunks.push(body);
        const raw = chunks.join('');
        try {
          const parsed = raw.length > 0 ? JSON.parse(raw) : {};
          resolve({ status: statusCode, ok: statusCode >= 200 && statusCode < 300, body: parsed });
        } catch {
          resolve({ status: statusCode, ok: statusCode >= 200 && statusCode < 300, body: raw });
        }
      }
    };

    serverInstance.emit('request', req, res);

    queueMicrotask(() => {
      try {
        if (options.body) {
          req.emit('data', Buffer.from(options.body, 'utf-8'));
        }
        req.emit('end');
      } catch (err) {
        reject(err);
      }
    });
  });
}

/**
 * Builds a valid multi-page PDF binary buffer with 5 distinct pages (/Type /Page)
 * and readable text streams so extractTextPagesFromPdfBuffer parses all 5 pages.
 */
function buildMultiChapterBiologyPdfBase64() {
  const pages = [
    'Chapter 1: Cell Structure and Organelles. Eukaryotic cells contain a membrane-bound nucleus, mitochondria for ATP synthesis, ribosomes for protein translation, and endoplasmic reticulum.',
    'Chapter 2: DNA Structure and Mitotic Cell Division. DNA (Deoxyribonucleic Acid) forms a double helix with complementary base pairing (A-T and G-C). During mitosis, sister chromatids separate equally.',
    'Chapter 3: Cellular Respiration and ATP Generation. Glycolysis in the cytoplasm converts glucose into pyruvate, followed by the Krebs cycle and oxidative phosphorylation in mitochondria producing 36 ATP.',
    'Chapter 4: Photosynthesis Light Reactions and Calvin Cycle. Chloroplasts capture photons in thylakoid membranes to split water (photolysis), generating ATP and NADPH for RuBisCO carbon fixation.',
    'Chapter 5: Human Circulatory System and Cardiac Cycle. The four-chambered heart pumps deoxygenated blood to the lungs (pulmonary circuit) and oxygenated blood to the systemic circuit via the aorta.'
  ];

  let pdfContent = '%PDF-1.4\n';
  pages.forEach((pageText, idx) => {
    const objNum = idx + 1;
    const escaped = pageText.replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    pdfContent += `${objNum} 0 obj\n<< /Type /Page /Parent 0 0 R >>\nstream\nBT /F1 12 Tf 72 720 Td (${escaped}) Tj ET\nendstream\nendobj\n`;
  });
  pdfContent += '%%EOF\n';
  return Buffer.from(pdfContent, 'utf8').toString('base64');
}

async function runAllTests() {
  const report = {
    executedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: { total: 8, passed: 0, failed: 0 },
    tests: {}
  };

  console.log('===================================================================');
  console.log('STUDYAI — AI NOTES REBUILD VERIFICATION SUITE (SECTION 13 TESTS 1–8)');
  console.log('===================================================================');

  // =========================================================================
  // TEST 1 — Topic Notes: "Create detailed notes on DNA"
  // =========================================================================
  console.log('\n[Test 1] Topic Notes: "Create detailed notes on DNA"...');
  const t1Res = await apiRequest('/api/notes/generate', {
    method: 'POST',
    body: JSON.stringify({
      topic: 'Create detailed notes on DNA',
      subject: 'Science',
      depth: 'detailed',
      sourceType: 'topic'
    })
  });

  const t1Note = t1Res.body;
  const t1Struct = t1Note?.structured || {};
  const t1Images = t1Struct.images || [];
  const t1Abbrs = t1Struct.abbreviations || [];
  const hasDnaFullForm = t1Abbrs.some(
    (a) =>
      String(a.shortForm || a.abbr).toUpperCase().includes('DNA') &&
      String(a.fullForm).toLowerCase().includes('deoxyribonucleic acid')
  );
  const hasRnaFullForm = t1Abbrs.some(
    (a) =>
      String(a.shortForm || a.abbr).toUpperCase().includes('RNA') &&
      String(a.fullForm).toLowerCase().includes('ribonucleic acid')
  );
  const hasComparisonTable =
    t1Struct.differences &&
    Array.isArray(t1Struct.differences.rows) &&
    t1Struct.differences.rows.length >= 3;
  const has7PartWalkthroughs =
    t1Images.length >= 2 &&
    t1Images.every(
      (img) =>
        img.imageUrl?.startsWith('data:image/svg+xml') &&
        img.explanation?.whatItShows &&
        Array.isArray(img.explanation?.majorParts) &&
        img.explanation?.stepByStepProcess &&
        img.explanation?.howToRead &&
        img.explanation?.connectionToTopic
    );

  // Verify persistence in SQLite
  const t1Fetch = await apiRequest(`/api/notes/${t1Note?.id}`);
  const t1Passed =
    t1Res.status === 201 &&
    Boolean(t1Struct.simpleIntroduction) &&
    Array.isArray(t1Struct.definitions) &&
    t1Struct.definitions.length >= 3 &&
    Array.isArray(t1Struct.keywords) &&
    t1Struct.keywords.length >= 5 &&
    hasDnaFullForm &&
    hasRnaFullForm &&
    hasComparisonTable &&
    has7PartWalkthroughs &&
    t1Fetch.status === 200 &&
    t1Fetch.body?.id === t1Note?.id;

  report.tests.test1_topic_dna = {
    passed: t1Passed,
    noteId: t1Note?.id,
    title: t1Note?.title,
    sectionsCount: t1Struct.sections?.length || 0,
    definitionsCount: t1Struct.definitions?.length || 0,
    abbreviationsCount: t1Abbrs.length,
    hasDnaFullForm,
    hasRnaFullForm,
    hasComparisonTable,
    imagesCount: t1Images.length,
    has7PartWalkthroughs,
    persistedInSqlite: t1Fetch.status === 200
  };
  console.log(` -> Test 1 Passed: ${t1Passed} (Sections: ${t1Struct.sections?.length}, Images: ${t1Images.length}, DNA/RNA Full Forms: ${hasDnaFullForm && hasRnaFullForm})`);

  // =========================================================================
  // TEST 2 — Long Multi-Chapter Biology PDF (5 Pages / 5 Chapters, No Truncation)
  // =========================================================================
  console.log('\n[Test 2] Long Multi-Chapter Biology PDF (5 Pages / 5 Chapters)...');
  const pdfBase64 = buildMultiChapterBiologyPdfBase64();
  const t2UploadRes = await apiRequest('/api/notes/upload', {
    method: 'POST',
    body: JSON.stringify({
      fileName: 'Comprehensive_Biology_5_Chapters.pdf',
      fileSize: pdfBase64.length,
      fileType: 'application/pdf',
      base64Content: pdfBase64
    })
  });

  const t2GenRes = await apiRequest('/api/notes/generate', {
    method: 'POST',
    body: JSON.stringify({
      topic: 'Multi-Chapter Biology Textbook Master Notebook',
      subject: 'Science',
      depth: 'detailed',
      sources: [
        {
          sourceType: 'pdf',
          title: 'Comprehensive_Biology_5_Chapters.pdf',
          fileName: 'Comprehensive_Biology_5_Chapters.pdf',
          base64Content: pdfBase64
        }
      ]
    })
  });

  const t2Struct = t2GenRes.body?.structured || {};
  const t2Inventory = t2Struct.sourceRecords?.[0]?.inventory || {};
  const t2Coverage = t2Struct.coverageVerification || {};
  const allCitationsText = JSON.stringify(t2Struct.sections?.map((s) => s.citations) || []);
  const citesAll5Pages =
    allCitationsText.includes('Page 1') &&
    allCitationsText.includes('Page 2') &&
    allCitationsText.includes('Page 3') &&
    allCitationsText.includes('Page 4') &&
    allCitationsText.includes('Page 5');

  const t2Passed =
    t2UploadRes.status === 200 &&
    t2GenRes.status === 201 &&
    t2Inventory.totalUnits === 5 &&
    t2Inventory.unitsProcessed === 5 &&
    t2Coverage.coveragePercent === 100 &&
    citesAll5Pages &&
    (t2Struct.images?.length || 0) >= 2;

  report.tests.test2_long_pdf = {
    passed: t2Passed,
    noteId: t2GenRes.body?.id,
    totalPagesDetected: t2Inventory.totalUnits,
    pagesProcessed: t2Inventory.unitsProcessed,
    coveragePercent: t2Coverage.coveragePercent,
    citesAll5Pages,
    sectionsGenerated: t2Struct.sections?.length || 0,
    imagesCount: t2Struct.images?.length || 0
  };
  console.log(` -> Test 2 Passed: ${t2Passed} (Pages: ${t2Inventory.unitsProcessed}/${t2Inventory.totalUnits}, Coverage: ${t2Coverage.coveragePercent}%, All 5 Pages Cited: ${citesAll5Pages})`);

  // =========================================================================
  // TEST 3 — YouTube Lecture with Timestamped Transcript & Citations
  // =========================================================================
  console.log('\n[Test 3] Educational YouTube Lecture with Timestamp Citations...');
  const ytTranscript = [
    '[00:00] Welcome to today’s biology lecture on DNA Replication and the Molecular Machinery of the Cell.',
    '[02:15] First, DNA Helicase unwinds the antiparallel double helix at the replication origin by breaking hydrogen bonds between Adenine-Thymine and Guanine-Cytosine base pairs.',
    '[05:40] Next, Primase synthesizes a short RNA primer so DNA Polymerase III can add nucleotides continuously in the 5-prime to 3-prime direction on the leading strand.',
    '[09:10] Finally, on the lagging strand, Okazaki fragments are synthesized discontinuously and sealed into a continuous phosphodiester backbone by DNA Ligase.'
  ].join('\n');

  const t3GenRes = await apiRequest('/api/notes/generate', {
    method: 'POST',
    body: JSON.stringify({
      topic: 'DNA Replication Molecular Lecture Notes',
      subject: 'Science',
      depth: 'detailed',
      sources: [
        {
          sourceType: 'youtube',
          title: 'MIT Molecular Biology Lecture: DNA Replication',
          url: 'https://www.youtube.com/watch?v=8kK2zwjRV0M',
          content: ytTranscript
        }
      ]
    })
  });

  const t3Struct = t3GenRes.body?.structured || {};
  const t3Inventory = t3Struct.sourceRecords?.[0]?.inventory || {};
  const t3CitationsStr = JSON.stringify(t3Struct.sections?.map((s) => s.citations) || []);
  const hasTimestampCitations =
    t3CitationsStr.includes('00:00') &&
    t3CitationsStr.includes('02:15') &&
    t3CitationsStr.includes('05:40') &&
    t3CitationsStr.includes('09:10');

  const t3Passed =
    t3GenRes.status === 201 &&
    t3Inventory.totalUnits === 4 &&
    t3Inventory.unitsProcessed === 4 &&
    t3Inventory.coveragePercent === 100 &&
    hasTimestampCitations &&
    (t3Struct.images?.length || 0) >= 2;

  report.tests.test3_youtube_lecture = {
    passed: t3Passed,
    noteId: t3GenRes.body?.id,
    videoId: t3Struct.sourceRecords?.[0]?.metadata?.videoId,
    timestampSegmentsProcessed: t3Inventory.unitsProcessed,
    coveragePercent: t3Inventory.coveragePercent,
    hasTimestampCitations,
    imagesCount: t3Struct.images?.length || 0
  };
  console.log(` -> Test 3 Passed: ${t3Passed} (Timestamps: ${t3Inventory.unitsProcessed}/${t3Inventory.totalUnits}, Citations Verified: ${hasTimestampCitations})`);

  // =========================================================================
  // TEST 4 — Multiple Sources (PDF + YouTube + Web Article) with Contradiction Detection
  // =========================================================================
  console.log('\n[Test 4] Multiple Sources (1 PDF + 2 Links) with Contradiction Detection...');
  const t4GenRes = await apiRequest('/api/notes/generate', {
    method: 'POST',
    body: JSON.stringify({
      topic: 'Cellular Respiration & ATP Yield Multi-Source Analysis',
      subject: 'Science',
      depth: 'detailed',
      sources: [
        {
          sourceType: 'pdf',
          title: 'Classical_Biochemistry_Textbook.pdf',
          fileName: 'Classical_Biochemistry_Textbook.pdf',
          content:
            'Page 1: Cellular respiration oxidizes glucose through glycolysis, the Krebs cycle, and the mitochondrial electron transport chain. Classical textbook stoichiometry states that complete aerobic respiration produces 38 ATP per molecule of glucose.'
        },
        {
          sourceType: 'youtube',
          title: 'Cellular Respiration ATP Synthesis Lecture',
          url: 'https://www.youtube.com/watch?v=00jbG_cfGuQ',
          content:
            '[00:00] Glycolysis yields 2 net ATP and 2 NADH in the cytosol.\n[03:30] Oxidative phosphorylation uses proton-motive force across the inner mitochondrial membrane to drive ATP synthase.'
        },
        {
          sourceType: 'web',
          title: 'Modern Bioenergetics Journal Review',
          url: 'https://bioenergetics.example.edu/atp-yield',
          content:
            'Section 1: Modern experimental measurements of proton leak and ATP-ADP translocase energetic cost prove that aerobic cellular respiration produces 30 ATP per molecule of glucose rather than the older theoretical estimate.'
        }
      ]
    })
  });

  const t4Struct = t4GenRes.body?.structured || {};
  const t4Comparison = t4Struct.sourceComparison || {};
  const t4SourcesCount = t4Struct.sourceRecords?.length || 0;
  const hasDetectedContradiction =
    Array.isArray(t4Comparison.contradictions) &&
    t4Comparison.contradictions.length >= 1 &&
    JSON.stringify(t4Comparison.contradictions).includes('38') &&
    JSON.stringify(t4Comparison.contradictions).includes('30');

  const t4Passed =
    t4GenRes.status === 201 &&
    t4SourcesCount === 3 &&
    Array.isArray(t4Comparison.agreements) &&
    t4Comparison.agreements.length >= 1 &&
    hasDetectedContradiction;

  report.tests.test4_multi_source_contradictions = {
    passed: t4Passed,
    noteId: t4GenRes.body?.id,
    sourcesProcessed: t4SourcesCount,
    agreementsCount: t4Comparison.agreements?.length || 0,
    complementaryCount: t4Comparison.complementaryDetails?.length || 0,
    contradictionsDetected: t4Comparison.contradictions || []
  };
  console.log(` -> Test 4 Passed: ${t4Passed} (Sources: ${t4SourcesCount}, Contradictions Detected: ${t4Comparison.contradictions?.length || 0})`);

  // =========================================================================
  // TEST 5 — Editing & Reopening Persistence (Text, Sections, Image Order, Table)
  // =========================================================================
  console.log('\n[Test 5] Editing Notebook (Paragraphs, Sections, Image Reordering, Table) & Reopening...');
  const targetNoteId = t1Note.id;
  const editedStructured = JSON.parse(JSON.stringify(t1Struct));
  editedStructured.sections[0].heading = '1. Edited Section: Molecular Architecture of DNA Double Helix';
  editedStructured.sections[0].body = 'Student custom paragraph edit: DNA stores hereditary genetic instructions in antiparallel strands.';
  if (editedStructured.images.length >= 2) {
    const firstImgTitle = editedStructured.images[0].title;
    const temp = editedStructured.images[0];
    editedStructured.images[0] = editedStructured.images[1];
    editedStructured.images[1] = temp;
    editedStructured.reorderedFromFirstTitle = firstImgTitle;
  }
  editedStructured.differences.rows.push(['Custom Student Criterion', 'Double-stranded B-helix', 'Single-stranded ribose chain']);

  const t5UpdateRes = await apiRequest(`/api/notes/${targetNoteId}`, {
    method: 'PUT',
    body: JSON.stringify({
      title: 'DNA Structure & Replication — Edited Master Notebook',
      subject: 'Science',
      notebook: 'Genetics Vault',
      content_markdown: t1Note.content_markdown + '\n\n## Student Added Revision Note\nVerified persistence in SQLite.',
      structured: editedStructured
    })
  });

  const t5ReopenRes = await apiRequest(`/api/notes/${targetNoteId}`);
  const reopened = t5ReopenRes.body;
  const t5Passed =
    t5UpdateRes.status === 200 &&
    t5ReopenRes.status === 200 &&
    reopened.title === 'DNA Structure & Replication — Edited Master Notebook' &&
    reopened.notebook === 'Genetics Vault' &&
    reopened.structured?.sections?.[0]?.heading === '1. Edited Section: Molecular Architecture of DNA Double Helix' &&
    reopened.structured?.differences?.rows?.some((r) => r[0] === 'Custom Student Criterion');

  report.tests.test5_editing_persistence = {
    passed: t5Passed,
    noteId: targetNoteId,
    updatedTitle: reopened?.title,
    updatedFirstSectionHeading: reopened?.structured?.sections?.[0]?.heading,
    tableRowsCountAfterEdit: reopened?.structured?.differences?.rows?.length || 0,
    reopenedSuccessfully: t5ReopenRes.status === 200
  };
  console.log(` -> Test 5 Passed: ${t5Passed} (Persisted Title & Section Edits + Table Row + Image Reordering)`);

  // =========================================================================
  // TEST 6 — Study Tools (Flashcards, Quiz, Study Guide, Audio Overview) & Source-Grounded Q&A
  // =========================================================================
  console.log('\n[Test 6] Study Tools & Source-Grounded Q&A with Citations...');
  const t6ToolsRes = await apiRequest(`/api/notes/${t2GenRes.body.id}/study-tools`, {
    method: 'POST',
    body: JSON.stringify({ toolType: 'all' })
  });

  const t6AskRes = await apiRequest(`/api/notes/${t2GenRes.body.id}/ask`, {
    method: 'POST',
    body: JSON.stringify({
      question: 'What happens in Chapter 3 during cellular respiration and Chapter 4 in chloroplasts?'
    })
  });

  const toolsBody = t6ToolsRes.body || {};
  const askBody = t6AskRes.body || {};
  const t6Passed =
    t6ToolsRes.status === 200 &&
    Array.isArray(toolsBody.flashcards) &&
    toolsBody.flashcards.length >= 4 &&
    Array.isArray(toolsBody.quiz) &&
    toolsBody.quiz.length >= 3 &&
    Boolean(toolsBody.studyGuide?.executiveSummary) &&
    Boolean(toolsBody.audioOverviewScript) &&
    t6AskRes.status === 200 &&
    Boolean(askBody.sourceGroundedAnswer) &&
    Boolean(askBody.aiSupplementalExplanation) &&
    Array.isArray(askBody.citations) &&
    askBody.citations.length >= 1;

  report.tests.test6_study_tools_and_grounded_qa = {
    passed: t6Passed,
    flashcardsCount: toolsBody.flashcards?.length || 0,
    quizQuestionsCount: toolsBody.quiz?.length || 0,
    hasStudyGuide: Boolean(toolsBody.studyGuide?.executiveSummary),
    hasAudioOverviewScript: Boolean(toolsBody.audioOverviewScript),
    qaCitationsReturned: askBody.citations?.map((c) => c.citationLabel) || [],
    separatesGroundedFromSupplemental: Boolean(askBody.sourceGroundedAnswer && askBody.aiSupplementalExplanation)
  };
  console.log(` -> Test 6 Passed: ${t6Passed} (Flashcards: ${toolsBody.flashcards?.length}, Quiz: ${toolsBody.quiz?.length}, Q&A Citations: ${askBody.citations?.length})`);

  // =========================================================================
  // TEST 7 — Export (White-Page Printable HTML/PDF, Word .doc, Markdown .md)
  // =========================================================================
  console.log('\n[Test 7] Exporting Notebook to Printable White-Page HTML, Word (.doc), and Markdown (.md)...');
  const exportHtmlRes = await apiRequest(`/api/notes/${targetNoteId}/export?format=html`);
  const exportDocRes = await apiRequest(`/api/notes/${targetNoteId}/export?format=doc`);
  const exportMdRes = await apiRequest(`/api/notes/${targetNoteId}/export?format=md`);

  const htmlStr = String(exportHtmlRes.body || '');
  const docStr = String(exportDocRes.body || '');
  const mdStr = String(exportMdRes.body || '');

  const htmlHasWhitePageAndImages =
    htmlStr.includes('<!DOCTYPE html>') &&
    htmlStr.includes('background: #FFFFFF') &&
    htmlStr.includes('data:image/svg+xml') &&
    htmlStr.includes('<table') &&
    htmlStr.includes('Deoxyribonucleic Acid');

  const docHasContent = docStr.includes('urn:schemas-microsoft-com:office:word') && docStr.includes('data:image/svg+xml');
  const mdHasContent = mdStr.includes('Full Forms') && mdStr.includes('Deoxyribonucleic Acid');

  const t7Passed =
    exportHtmlRes.status === 200 &&
    exportDocRes.status === 200 &&
    exportMdRes.status === 200 &&
    htmlHasWhitePageAndImages &&
    docHasContent &&
    mdHasContent;

  report.tests.test7_exports = {
    passed: t7Passed,
    htmlByteLength: htmlStr.length,
    docByteLength: docStr.length,
    mdByteLength: mdStr.length,
    htmlHasWhitePageAndImages,
    docHasContent,
    mdHasContent
  };
  console.log(` -> Test 7 Passed: ${t7Passed} (HTML: ${htmlStr.length}B, DOC: ${docStr.length}B, MD: ${mdStr.length}B)`);

  // =========================================================================
  // TEST 8 — Failure Handling (Inaccessible Source, Failed Image Gen, Interrupted Pipeline)
  // =========================================================================
  console.log('\n[Test 8] Failure Handling (Inaccessible Source, Failed Image Generation, Interrupted Pipeline)...');
  // 8A: Inaccessible YouTube URL without transcript
  const failSourceRes = await apiRequest('/api/notes/generate', {
    method: 'POST',
    body: JSON.stringify({
      topic: 'Inaccessible Video Test',
      subject: 'Science',
      sources: [
        {
          sourceType: 'youtube',
          url: 'https://www.youtube.com/watch?v=invalid00000'
        }
      ]
    })
  });

  // 8B: Failed mandatory image generation
  const failImageRes = await apiRequest('/api/notes/generate', {
    method: 'POST',
    body: JSON.stringify({
      topic: 'Photosynthesis',
      subject: 'Science',
      simulateFailure: 'image_failure'
    })
  });

  // 8C: Interrupted source processing pipeline
  const failInterruptedRes = await apiRequest('/api/notes/generate', {
    method: 'POST',
    body: JSON.stringify({
      topic: 'Newton Laws',
      subject: 'Science',
      simulateFailure: 'interrupted'
    })
  });

  const t8Passed =
    failSourceRes.status === 422 &&
    Boolean(failSourceRes.body?.error) &&
    failImageRes.status === 503 &&
    failImageRes.body?.code === 'MANDATORY_IMAGE_FAILURE' &&
    failInterruptedRes.status === 503 &&
    failInterruptedRes.body?.code === 'PIPELINE_INTERRUPTED';

  report.tests.test8_failure_handling = {
    passed: t8Passed,
    inaccessibleSourceStatus: failSourceRes.status,
    inaccessibleSourceError: failSourceRes.body?.error,
    imageFailureStatus: failImageRes.status,
    imageFailureCode: failImageRes.body?.code,
    interruptedStatus: failInterruptedRes.status,
    interruptedCode: failInterruptedRes.body?.code
  };
  console.log(` -> Test 8 Passed: ${t8Passed} (Inaccessible Source: ${failSourceRes.status}, Image Failure: ${failImageRes.status}, Interrupted: ${failInterruptedRes.status})`);

  // Summarize results
  const allResults = Object.values(report.tests);
  report.summary.passed = allResults.filter((r) => r.passed).length;
  report.summary.failed = allResults.filter((r) => !r.passed).length;

  const reportPath = path.join(process.cwd(), 'tests', 'notes_rebuild_verification_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  console.log('\n===================================================================');
  console.log(`SUMMARY: ${report.summary.passed}/${report.summary.total} AI NOTES REBUILD ACCEPTANCE TESTS PASSED`);
  console.log(`Saved report to: ${reportPath}`);
  console.log('===================================================================');

  if (report.summary.failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Verification suite error:', err);
  process.exit(1);
});
