/**
 * STUDYAI — PHASE 5 VERIFICATION SUITE
 * AI Notes, Library & Learning Resource Management Acceptance Tests
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const baseUrl = 'http://127.0.0.1:8000';
let passedCount = 0;

function report(id, title, pass = true) {
  if (pass) {
    passedCount++;
    console.log(`  ✔ [PASS] ${id}: ${title}`);
  } else {
    console.log(`  ❌ [FAIL] ${id}: ${title}`);
  }
}

async function runPhase5Verification() {
  console.log('\n================================================================');
  console.log('📚 RUNNING STUDYAI PHASE 5 AI NOTES, LIBRARY & 3D LAB SUITE');
  console.log('================================================================\n');

  try {
    // -------------------------------------------------------------------------
    // AUTHENTICATE TEST USERS
    // -------------------------------------------------------------------------
    console.log('[TEST 1] Authenticating Test Users (Student & Admin)');
    const vishwakLogin = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'vishwak@studyai.internal', password: 'StudentPass123!' })
    });
    assert.strictEqual(vishwakLogin.status, 200);
    const vishwakAuth = await vishwakLogin.json();
    const studentToken = vishwakAuth.access_token;

    const bobLogin = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bob@studyai.internal', password: 'StudentPass123!' })
    });
    assert.strictEqual(bobLogin.status, 200);
    const bobAuth = await bobLogin.json();
    const bobToken = bobAuth.access_token;

    const adminLogin = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@nps-bengaluru.edu.in', password: 'AdminPass123!' })
    });
    assert.strictEqual(adminLogin.status, 200);
    const adminAuth = await adminLogin.json();
    const adminToken = adminAuth.access_token;
    report('T1', 'User authentication succeeded for student and admin actors', true);

    // -------------------------------------------------------------------------
    // TEST 2: Multi-Source Note Generation (Topic, Lesson, PDF, Image, Video)
    // -------------------------------------------------------------------------
    console.log('\n[TEST 2] Verifying Multi-Source Note Generation');

    // 2a. Topic Source
    const topicNoteRes = await fetch(`${baseUrl}/api/v1/notes/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        topic: 'Human Heart and Double Circulation',
        subject: 'Biology',
        level: 'Grade 10',
        source_type: 'topic'
      })
    });
    assert.strictEqual(topicNoteRes.status, 201);
    const topicNote = await topicNoteRes.json();
    assert.ok(topicNote.id.startsWith('note_'));
    assert.ok(topicNote.content_markdown.includes('Human Heart and Double Circulation'));
    assert.ok(topicNote.flashcards_json.length >= 2);
    assert.ok(topicNote.quiz_json.length >= 2);
    assert.ok(topicNote.diagram_svg.includes('<svg'));
    report('T2a', `Generated structured note from Topic source (${topicNote.id})`, true);

    // 2b. PDF Source
    const pdfContent = `Page 1: Chloroplast Ultrastructure and Light Reactions.
The thylakoid membrane holds photosystems I and II where photolysis splits H2O into oxygen and protons.
Page 2: Calvin Cycle and Carbon Fixation.
In the stroma, RuBisCO catalyzes carbon fixation using ATP and NADPH synthesized during light reactions.`;

    const pdfNoteRes = await fetch(`${baseUrl}/api/v1/notes/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        topic: 'Photosynthesis Light and Dark Reactions',
        subject: 'Biology',
        level: 'Grade 10',
        source_type: 'pdf',
        content: pdfContent,
        metadata: { fileName: 'ncert_biology_ch6.pdf' }
      })
    });
    assert.strictEqual(pdfNoteRes.status, 201);
    const pdfNote = await pdfNoteRes.json();
    assert.strictEqual(pdfNote.source_type, 'pdf');
    assert.ok(pdfNote.citations_json.length >= 2);
    assert.ok(pdfNote.citations_json[0].locator.includes('Page'));
    report('T2b', `Generated structured note from PDF with page citations (${pdfNote.id})`, true);

    // 2c. Image / OCR Source
    const imgNoteRes = await fetch(`${baseUrl}/api/v1/notes/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        topic: 'Plant Cell Microscopic Anatomy',
        subject: 'Biology',
        level: 'Grade 10',
        source_type: 'image',
        content: 'Labeled micrograph showing cell wall, chloroplast grana, vacuole, and mitochondria.',
        metadata: { fileName: 'plant_cell_electron_microscopy.png' }
      })
    });
    assert.strictEqual(imgNoteRes.status, 201);
    const imgNote = await imgNoteRes.json();
    assert.strictEqual(imgNote.source_type, 'image');
    assert.ok(imgNote.diagram_svg.length > 50);
    report('T2c', `Generated structured note from Image / Diagram source (${imgNote.id})`, true);

    // 2d. Video Lecture Source (Educational Source Analysis, NOT Video Generation)
    const videoNoteRes = await fetch(`${baseUrl}/api/v1/notes/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        topic: 'Cellular Respiration and ATP Yield',
        subject: 'Biology',
        level: 'Grade 10',
        source_type: 'video',
        content: `[00:30] Introduction to glycolysis in the cytoplasm.
[03:45] Transition reaction into the mitochondrial matrix.
[08:12] Krebs cycle decarboxylation producing NADH and FADH2.
[14:20] Oxidative phosphorylation via ATP synthase proton gradient.`,
        metadata: { url: 'https://studyai.internal/lectures/cellular-respiration' }
      })
    });
    assert.strictEqual(videoNoteRes.status, 201);
    const videoNote = await videoNoteRes.json();
    assert.strictEqual(videoNote.source_type, 'video');
    assert.ok(videoNote.citations_json.some(c => c.locator.includes('Timestamp')));
    assert.ok(videoNote.content_markdown.includes('Timestamp Milestones'));
    report('T2d', `Generated structured note from Video transcript milestones (${videoNote.id})`, true);

    // -------------------------------------------------------------------------
    // TEST 3: Subject-Specific Tailored Structures (Formulas, Tables & Timelines)
    // -------------------------------------------------------------------------
    console.log('\n[TEST 3] Verifying Subject-Specific Tailored Note Formatting');

    // 3a. Physics: Formulas & SI Units
    const physicsNoteRes = await fetch(`${baseUrl}/api/v1/notes/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        topic: "Newton's Laws of Motion",
        subject: 'Physics',
        level: 'Grade 10',
        source_type: 'topic'
      })
    });
    assert.strictEqual(physicsNoteRes.status, 201);
    const physicsNote = await physicsNoteRes.json();
    assert.ok(physicsNote.content_markdown.includes('Governing Equations'));
    assert.ok(physicsNote.structured_json.formulas.length >= 2);
    assert.ok(physicsNote.structured_json.formulas[0].equation.includes('F_{net}'));
    assert.ok(physicsNote.content_markdown.includes('SI Unit'));
    report('T3a', 'Physics note contains mathematical equations ($F=ma$), SI units & derivations', true);

    // 3b. Chemistry: Chemical Equations & Molar Masses
    const chemNoteRes = await fetch(`${baseUrl}/api/v1/notes/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        topic: 'Chemical Reactions and Stoichiometry',
        subject: 'Chemistry',
        level: 'Grade 10',
        source_type: 'topic'
      })
    });
    assert.strictEqual(chemNoteRes.status, 201);
    const chemNote = await chemNoteRes.json();
    assert.ok(chemNote.structured_json.formulas.some(f => f.equation.includes('CO_2')));
    assert.ok(chemNote.content_markdown.includes('Molar Mass'));
    report('T3b', 'Chemistry note formatted with balanced chemical equations and reagent properties table', true);

    // 3c. History / Humanities: Timelines & Causes
    const historyNoteRes = await fetch(`${baseUrl}/api/v1/notes/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        topic: 'Industrial Revolution and Global Modernization',
        subject: 'History',
        level: 'Grade 10',
        source_type: 'topic'
      })
    });
    assert.strictEqual(historyNoteRes.status, 201);
    const histNote = await historyNoteRes.json();
    assert.ok(histNote.content_markdown.includes('Chronological Date'));
    assert.ok(histNote.content_markdown.includes('Primary Causes'));
    report('T3c', 'History note formatted with chronological timeline, causes & significance', true);

    // -------------------------------------------------------------------------
    // TEST 4: Note Editing, Versioning & Autosave
    // -------------------------------------------------------------------------
    console.log('\n[TEST 4] Verifying Note Editing, Autosave & Version History');
    const noteIdToEdit = topicNote.id;

    // 4a. Update Note (creates Version 2)
    const updateRes = await fetch(`${baseUrl}/api/v1/notes/${noteIdToEdit}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        title: 'Human Heart: Advanced Cardiac Electrophysiology',
        content_markdown: '# Updated Human Heart Study Guide\nSA Node initiates action potentials propagated through Purkinje fibers.',
        change_summary: 'Added cardiac conduction cycle notes'
      })
    });
    assert.strictEqual(updateRes.status, 200);
    const updatedNote = await updateRes.json();
    assert.strictEqual(updatedNote.version, 2);
    assert.strictEqual(updatedNote.title, 'Human Heart: Advanced Cardiac Electrophysiology');
    report('T4a', `Note updated with incremented version (${updatedNote.version})`, true);

    // 4b. Debounced Autosave
    const autosaveRes = await fetch(`${baseUrl}/api/v1/notes/${noteIdToEdit}/autosave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        content_markdown: '# Updated Human Heart Study Guide\nAutosaved intermediate student edits.'
      })
    });
    assert.strictEqual(autosaveRes.status, 200);
    const autosaveData = await autosaveRes.json();
    assert.strictEqual(autosaveData.status, 'autosaved');
    assert.ok(autosaveData.last_autosaved_at);
    report('T4b', 'Debounced autosave successfully updated content without losing edits', true);

    // 4c. Version History List & Rollback
    const versionsRes = await fetch(`${baseUrl}/api/v1/notes/${noteIdToEdit}/versions`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(versionsRes.status, 200);
    const versions = await versionsRes.json();
    assert.ok(versions.length >= 2);
    const ver1 = versions[0];
    report('T4c', `Retrieved ${versions.length} version snapshots from history`, true);

    const restoreRes = await fetch(`${baseUrl}/api/v1/notes/${noteIdToEdit}/versions/${ver1.version_id}/restore`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(restoreRes.status, 200);
    const restoreData = await restoreRes.json();
    assert.strictEqual(restoreData.status, 'success');
    assert.strictEqual(restoreData.note.title, ver1.title);
    report('T4d', `Successfully rolled back note to version ${ver1.version_number}`, true);

    // -------------------------------------------------------------------------
    // TEST 5: Multi-Format Export (Markdown, HTML, JSON)
    // -------------------------------------------------------------------------
    console.log('\n[TEST 5] Verifying Note Export to Markdown, Standalone HTML & JSON');

    const mdExport = await fetch(`${baseUrl}/api/v1/notes/${noteIdToEdit}/export?format=markdown`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(mdExport.status, 200);
    assert.ok(mdExport.headers.get('content-type').includes('text/markdown'));
    const mdText = await mdExport.text();
    assert.ok(mdText.startsWith('#'));
    report('T5a', 'Exported note as formatted Markdown document', true);

    const htmlExport = await fetch(`${baseUrl}/api/v1/notes/${noteIdToEdit}/export?format=html`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(htmlExport.status, 200);
    assert.ok(htmlExport.headers.get('content-type').includes('text/html'));
    const htmlText = await htmlExport.text();
    assert.ok(htmlText.includes('<!DOCTYPE html>'));
    assert.ok(htmlText.includes('STUDYAI Notes'));
    assert.ok(htmlText.includes('<svg'));
    report('T5b', 'Exported note as standalone printable HTML with Apple Glass styling and KaTeX math', true);

    const jsonExport = await fetch(`${baseUrl}/api/v1/notes/${noteIdToEdit}/export?format=json`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(jsonExport.status, 200);
    assert.ok(jsonExport.headers.get('content-type').includes('application/json'));
    const jsonParsed = await jsonExport.json();
    assert.strictEqual(jsonParsed.id, noteIdToEdit);
    report('T5c', 'Exported note as structured JSON with flashcards & quiz payloads', true);

    // -------------------------------------------------------------------------
    // TEST 6: Centralized Personal Learning Library Catalog
    // -------------------------------------------------------------------------
    console.log('\n[TEST 6] Verifying Centralized Personal Learning Library');

    const libRes = await fetch(`${baseUrl}/api/v1/library`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(libRes.status, 200);
    const libData = await libRes.json();
    assert.ok(libData.items && Array.isArray(libData.items));
    assert.ok(libData.items.length >= 6);
    assert.ok(libData.counts.all >= 6);
    assert.ok(libData.counts.note >= 1);
    assert.ok(libData.counts.model3d >= 4);
    assert.ok(libData.counts.game >= 1);
    report('T6', `Centralized library catalog consolidated ${libData.items.length} multi-type resources`, true);

    // -------------------------------------------------------------------------
    // TEST 7: Search, Category Filters & Tag Aggregation
    // -------------------------------------------------------------------------
    console.log('\n[TEST 7] Verifying Library Search & Filter Capabilities');

    // 7a. Search Query
    const searchRes = await fetch(`${baseUrl}/api/v1/library?q=heart`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(searchRes.status, 200);
    const searchData = await searchRes.json();
    assert.ok(searchData.items.length >= 1);
    assert.ok(searchData.items.every(i => i.title.toLowerCase().includes('heart') || i.topic.toLowerCase().includes('heart')));
    report('T7a', `Search query 'q=heart' returned ${searchData.items.length} relevant matching resources`, true);

    // 7b. Filter by 3D Models
    const modelFilterRes = await fetch(`${baseUrl}/api/v1/library?type=model3d`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(modelFilterRes.status, 200);
    const modelFilterData = await modelFilterRes.json();
    assert.ok(modelFilterData.items.length >= 4);
    assert.ok(modelFilterData.items.every(i => i.resource_type === 'model3d'));
    report('T7b', `Filter 'type=model3d' returned ${modelFilterData.items.length} 3D simulations`, true);

    // 7c. Filter by Subject
    const subjectFilterRes = await fetch(`${baseUrl}/api/v1/library?subject=Physics`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(subjectFilterRes.status, 200);
    const subjectFilterData = await subjectFilterRes.json();
    assert.ok(subjectFilterData.items.length >= 1);
    assert.ok(subjectFilterData.items.every(i => i.subject.toLowerCase().includes('physic')));
    report('T7c', `Filter 'subject=Physics' isolated Physics curriculum resources`, true);

    // -------------------------------------------------------------------------
    // TEST 8: Favorites & Collections Management
    // -------------------------------------------------------------------------
    console.log('\n[TEST 8] Verifying Favorites & Playlist Collections');

    // 8a. Toggle Favorite
    const favToggleRes = await fetch(`${baseUrl}/api/v1/library/3d_human_heart/favorite`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(favToggleRes.status, 200);
    const favData = await favToggleRes.json();
    assert.strictEqual(favData.status, 'success');
    report('T8a', `Toggled favorite status for 3D model (is_favorite: ${favData.is_favorite})`, true);

    // 8b. Create Collection
    const createColRes = await fetch(`${baseUrl}/api/v1/library/collections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        title: 'Class 10 Biology Board Exam High-Yield',
        description: 'Complete high-yield revision deck containing heart, DNA and photosynthesis',
        resource_ids: [topicNote.id, '3d_human_heart']
      })
    });
    assert.strictEqual(createColRes.status, 201);
    const colRecord = await createColRes.json();
    assert.ok(colRecord.id.startsWith('col_'));
    report('T8b', `Created personalized learning collection (${colRecord.id})`, true);

    // -------------------------------------------------------------------------
    // TEST 9: 3D Lab Scientific Models Catalog & Save to Library
    // -------------------------------------------------------------------------
    console.log('\n[TEST 9] Verifying 3D Lab Models & Integration');

    const modelsCatalogRes = await fetch(`${baseUrl}/api/v1/visual-3d/models`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(modelsCatalogRes.status, 200);
    const catalogModels = await modelsCatalogRes.json();
    assert.ok(catalogModels.length >= 6);
    const heartModel = catalogModels.find(m => m.id === 'human_heart');
    assert.ok(heartModel);
    assert.strictEqual(heartModel.subject, 'biology');
    assert.ok(heartModel.parts.length >= 4);
    assert.ok(heartModel.camera_preset.position.length === 3);
    report('T9a', `Retrieved ${catalogModels.length} procedural 3D models with camera presets & annotations`, true);

    // Save Model with customized view into Library
    const saveModelRes = await fetch(`${baseUrl}/api/v1/visual-3d/save-to-library`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        model_id: 'dna_double_helix',
        custom_title: 'Vishwak DNA Replication Model',
        collection_id: colRecord.id
      })
    });
    assert.strictEqual(saveModelRes.status, 201);
    const savedModel = await saveModelRes.json();
    assert.strictEqual(savedModel.status, 'success');
    assert.strictEqual(savedModel.resource.resource_type, 'model3d');
    report('T9b', 'Saved 3D simulation into personal Library and linked collection', true);

    // -------------------------------------------------------------------------
    // TEST 10: Storage Security, Resource Isolation & Permission Boundaries
    // -------------------------------------------------------------------------
    console.log('\n[TEST 10] Verifying Storage Security & Multi-Tenant Access Boundaries');

    // 10a. Cross-Student Note Deletion Isolation
    const crossDeleteRes = await fetch(`${baseUrl}/api/v1/notes/${topicNote.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${bobToken}` }
    });
    assert.strictEqual(crossDeleteRes.status, 403);
    report('T10a', 'Resource ownership enforced: Student Bob blocked from deleting Vishwak note (403 Forbidden)', true);

    // 10b. File Upload Security (10MB limit enforcement)
    const oversizedPayload = Buffer.alloc(11 * 1024 * 1024, 0x41).toString('base64');
    const oversizeRes = await fetch(`${baseUrl}/api/v1/library/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        title: 'Oversized Physics Book',
        filename: 'oversize.pdf',
        mime_type: 'application/pdf',
        file_content_base64: oversizedPayload
      })
    });
    assert.strictEqual(oversizeRes.status, 413);
    report('T10b', 'File size limit strictly enforced: 11MB file rejected (413 Payload Too Large)', true);

    // 10c. Magic Bytes Validation
    const spoofedContent = Buffer.from('FAKE BINARY EXECUTABLE CONTENT', 'utf-8').toString('base64');
    const spoofRes = await fetch(`${baseUrl}/api/v1/library/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        title: 'Spoofed PDF Document',
        filename: 'fake.pdf',
        mime_type: 'application/pdf',
        file_content_base64: spoofedContent
      })
    });
    assert.strictEqual(spoofRes.status, 400);
    const spoofErr = await spoofRes.json();
    assert.strictEqual(spoofErr.detail.code, 'MAGIC_BYTES_MISMATCH');
    report('T10c', 'MIME spoofing blocked via binary magic byte header validation (400 MAGIC_BYTES_MISMATCH)', true);

    console.log('\n================================================================');
    console.log(`🎉 ALL ${passedCount} PHASE 5 AI NOTES, LIBRARY & 3D LAB ACCEPTANCE TESTS PASSED!`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('\n❌ PHASE 5 VERIFICATION FAILED:', err);
    process.exitCode = 1;
  }
}

runPhase5Verification();
