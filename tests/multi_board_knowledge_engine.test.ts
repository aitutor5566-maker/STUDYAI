import test from 'node:test';
import assert from 'node:assert/strict';
import {
  multiBoardKnowledgeEngine,
  SUPPORTED_CURRICULA,
  type EducationalBoard
} from '../server/multiBoardKnowledgeEngine.ts';
import { unifiedKnowledgeRetrieval } from '../server/unifiedKnowledgeRetrieval.ts';
import { knowledgeIntelligenceAdmin } from '../server/knowledgeIntelligenceAdmin.ts';
import { db } from '../server/db.ts';

test('STUDYAI Phase 2: Multi-Board Knowledge Engine', async (t) => {
  // Ensure baseline data is seeded
  multiBoardKnowledgeEngine.initializeBaselineKnowledge();

  await t.test('1. Multi-Board Curriculum Specifications cover ICSE, CBSE, AP, and Telangana State Boards across Grades 1–10', () => {
    const boards: EducationalBoard[] = ['CBSE', 'ICSE', 'AP_STATE_BOARD', 'TS_STATE_BOARD'];

    for (const b of boards) {
      const spec = SUPPORTED_CURRICULA[b];
      assert.ok(spec, `Specification must exist for ${b}`);
      assert.equal(spec.code, b);
      assert.ok(spec.fullName, `Full name must exist for ${b}`);
      assert.ok(spec.authority, `Authority must exist for ${b}`);
      assert.ok(spec.jurisdiction, `Jurisdiction must exist for ${b}`);
      assert.ok(spec.officialPortal, `Official portal must exist for ${b}`);
      assert.equal(spec.currentAcademicYear, '2025-2026');
      assert.deepEqual(spec.gradesSupported, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], `Grades 1 to 10 must be supported for ${b}`);
      assert.ok(spec.supportedLanguages.includes('English'), `English must be supported for ${b}`);
    }

    // Regional languages check
    assert.ok(SUPPORTED_CURRICULA.AP_STATE_BOARD.supportedLanguages.includes('Telugu'), 'AP State Board must support Telugu');
    assert.ok(SUPPORTED_CURRICULA.TS_STATE_BOARD.supportedLanguages.includes('Telugu'), 'TS State Board must support Telugu');
    assert.ok(SUPPORTED_CURRICULA.CBSE.supportedLanguages.includes('Hindi'), 'CBSE must support Hindi');
  });

  await t.test('2. Topic Equivalence Mapping resolves equivalent curriculum chapters across all 4 boards', () => {
    const topicsToTest = ['Photosynthesis', 'Human Heart', 'Electricity'];

    for (const top of topicsToTest) {
      const equiv = multiBoardKnowledgeEngine.getEquivalentTopics(top);
      assert.ok(equiv, `Equivalent topic mapping must exist for "${top}"`);
      assert.ok(equiv.universalTopicId, `Must have universal ID for "${top}"`);
      assert.ok(equiv.mappings.length >= 4, `Must map "${top}" across all 4 boards, got ${equiv.mappings.length}`);

      const cbseMap = equiv.mappings.find((m) => m.board === 'CBSE');
      const icseMap = equiv.mappings.find((m) => m.board === 'ICSE');
      const apMap = equiv.mappings.find((m) => m.board === 'AP_STATE_BOARD');
      const tsMap = equiv.mappings.find((m) => m.board === 'TS_STATE_BOARD');

      assert.ok(cbseMap, `CBSE mapping required for ${top}`);
      assert.ok(icseMap, `ICSE mapping required for ${top}`);
      assert.ok(apMap, `AP State Board mapping required for ${top}`);
      assert.ok(tsMap, `TS State Board mapping required for ${top}`);

      // Verify board-specific textbook distinctions
      assert.ok(cbseMap.prescribedTextbook.includes('NCERT'), `CBSE must prescribe NCERT for ${top}`);
      assert.ok(icseMap.prescribedTextbook.includes('ICSE') || icseMap.prescribedTextbook.includes('Selina') || icseMap.prescribedTextbook.includes('Concise'), `ICSE must prescribe ICSE text for ${top}`);
      assert.ok(apMap.prescribedTextbook.includes('AP SCERT'), `AP must prescribe AP SCERT for ${top}`);
      assert.ok(tsMap.prescribedTextbook.includes('Telangana SCERT'), `TS must prescribe Telangana SCERT for ${top}`);
    }
  });

  await t.test('3. Knowledge Graph enables conceptual traversal: Prerequisites, Subcomponents, and Relationships', () => {
    // 1. Prerequisites Traversal: Fractions is prerequisite of Decimals
    const prereqs = multiBoardKnowledgeEngine.getConceptPrerequisites('ukn-decimals');
    assert.ok(Array.isArray(prereqs), 'Prerequisites must return an array');
    const hasFractions = prereqs.some((p) => p.name.includes('Fractions') || p.id === 'ukn-fractions');
    assert.ok(hasFractions, 'Fractions must be registered as a prerequisite of Decimals');

    // 2. Subcomponent Traversal: Chlorophyll and Chloroplast are parts of Photosynthesis
    const parts = multiBoardKnowledgeEngine.getConceptParts('ukn-photosynthesis');
    assert.ok(parts.length >= 2, `Photosynthesis must have at least 2 subcomponents, got ${parts.length}`);
    assert.ok(parts.some((p) => p.name.includes('Chlorophyll')), 'Chlorophyll must be a part of Photosynthesis');
    assert.ok(parts.some((p) => p.name.includes('Chloroplast')), 'Chloroplast must be a part of Photosynthesis');

    // 3. Heart Valves is a part of Human Heart
    const heartParts = multiBoardKnowledgeEngine.getConceptParts('ukn-human-heart');
    assert.ok(heartParts.some((p) => p.name.includes('Valves')), 'Heart Valves must be a part of Human Heart');

    // 4. Related Concepts: Resistance is related to Electricity via Ohm Law
    const related = multiBoardKnowledgeEngine.getRelatedConcepts('ukn-electricity');
    assert.ok(related.some((r) => r.node.name.includes('Resistance')), 'Resistance must be related to Electricity');
  });

  await t.test('4. Automated Ingestion Pipeline indexes curriculum resources with chapters and learning objectives', () => {
    const ingestPayload = {
      board: 'CBSE' as const,
      grade: 9,
      subject: 'Science' as const,
      title: 'NCERT Class 9 Science — Matter and Living World',
      publisher: 'NCERT',
      academicYear: '2025-2026',
      edition: 'National Rationalized Edition',
      licenseType: 'Official Curriculum Syllabus',
      chapters: [
        {
          chapterNumber: 1,
          chapterTitle: 'Matter in Our Surroundings',
          learningObjectives: ['Differentiate states of matter', 'Understand latent heat of fusion and vaporization', 'Explain factors affecting evaporation']
        },
        {
          chapterNumber: 2,
          chapterTitle: 'Is Matter Around Us Pure',
          learningObjectives: ['Distinguish solutions, suspensions, and colloids', 'Examine physical vs chemical changes']
        }
      ]
    };

    const res = multiBoardKnowledgeEngine.ingestCurriculumResource(ingestPayload);
    assert.ok(res.sourceId.startsWith('src-cbse-g9-'), 'Generated sourceId must follow format');
    assert.equal(res.chaptersIngested, 2, 'Must ingest 2 chapters');
    assert.equal(res.status, 'indexed_and_mapped');

    // Verify persisted in db
    const row = db.prepare('SELECT * FROM curriculum_sources WHERE source_id = ?').get(res.sourceId) as any;
    assert.ok(row, 'Source must be saved to curriculum_sources table');
    assert.equal(row.title, ingestPayload.title);
  });

  await t.test('5. Knowledge Verification and Versioning Workflow transitions across Draft, Verified, and Published states', () => {
    // 1. Create a draft document
    const docId = `doc-test-draft-${Date.now()}`;
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO knowledge_documents (
        id, universal_topic_id, board, grade, subject, title, status, version, academic_year, confidence_score, content_markdown, created_at, updated_at
      ) VALUES (?, 'ukn-photosynthesis', 'CBSE', 10, 'Biology', 'Photosynthesis Research Draft', 'research_draft', 1, '2025-2026', 0.85, '# Draft Content', ?, ?)
    `).run(docId, now, now);

    // 2. Transition from research_draft to verified_knowledge
    const step1 = multiBoardKnowledgeEngine.updateKnowledgeVerificationState(
      docId,
      'verified_knowledge',
      { reviewerName: 'Academic Reviewer 1', notes: 'Checked equations and NCERT alignment', confidenceScore: 0.95 }
    );
    assert.equal(step1.previousStatus, 'research_draft');
    assert.equal(step1.newStatus, 'verified_knowledge');

    // 3. Transition from verified_knowledge to published_knowledge
    const step2 = multiBoardKnowledgeEngine.updateKnowledgeVerificationState(
      docId,
      'published_knowledge',
      { reviewerName: 'Chief Curriculum Scientist', notes: 'Approved for production student delivery', confidenceScore: 0.99 }
    );
    assert.equal(step2.previousStatus, 'verified_knowledge');
    assert.equal(step2.newStatus, 'published_knowledge');
  });

  await t.test('6. Syllabus Edition Comparison detects added, removed, and modified topics', () => {
    const diff = multiBoardKnowledgeEngine.diffCurriculumEditions({
      board: 'CBSE',
      subject: 'Science',
      grade: 10,
      previousTopics: ['Photosynthesis', 'Periodic Classification of Elements', 'Human Eye', 'Sources of Energy'],
      newTopics: ['Photosynthesis', 'Human Eye', 'Our Environment', 'Magnetic Effects of Electric Current']
    });

    assert.equal(diff.board, 'CBSE');
    assert.ok(diff.removedTopics.includes('Periodic Classification of Elements'), 'Must detect removed topic');
    assert.ok(diff.removedTopics.includes('Sources of Energy'), 'Must detect removed topic');
    assert.ok(diff.addedTopics.includes('Our Environment'), 'Must detect added topic');
    assert.equal(diff.requiresHumanReview, true, 'Changes must require human review');
  });

  await t.test('7. Student Profile auto-resolution supplies board and grade to Knowledge Retrieval', async () => {
    // Student Vishwak is registered as Grade 10 CBSE in users table
    const vishwak = db.prepare('SELECT grade, board FROM users WHERE id = ?').get('student-vishwak') as any;
    assert.ok(vishwak, 'Vishwak user must exist');
    assert.equal(vishwak.board, 'CBSE');

    const result = await unifiedKnowledgeRetrieval.retrieve({
      topic: 'Photosynthesis',
      board: vishwak.board,
      grade: parseInt(vishwak.grade.replace(/\D/g, ''), 10)
    });

    assert.equal(result.boardRequirement.board, 'CBSE');
    assert.equal(result.gradePedagogy.grade, 10);
    assert.equal(result.gradePedagogy.cognitiveStage, 'secondary');

    // Student Aarav is registered as Grade 9 ICSE
    const aarav = db.prepare('SELECT grade, board FROM users WHERE id = ?').get('student-new') as any;
    assert.ok(aarav, 'Aarav user must exist');
    assert.equal(aarav.board, 'ICSE');

    const aaravResult = await unifiedKnowledgeRetrieval.retrieve({
      topic: 'Photosynthesis',
      board: aarav.board,
      grade: parseInt(aarav.grade.replace(/\D/g, ''), 10)
    });

    assert.equal(aaravResult.boardRequirement.board, 'ICSE');
    assert.ok(
      aaravResult.boardRequirement.prescribedTextbook.includes('CISCE') ||
      aaravResult.boardRequirement.prescribedTextbook.includes('ICSE') ||
      aaravResult.boardRequirement.prescribedTextbook.includes('Selina')
    );
  });

  await t.test('8. Knowledge Intelligence Admin Dashboard incorporates live graph and verification metrics', () => {
    const report = knowledgeIntelligenceAdmin.getDashboardReport();
    assert.ok(report, 'Report must exist');
    assert.ok(report.contentQualityAndVerification.knowledgeGraphMetrics, 'Knowledge graph metrics must exist');
    assert.ok(report.contentQualityAndVerification.knowledgeGraphMetrics.totalConceptNodes >= 5, 'Concept nodes must be at least 5');
    assert.ok(report.contentQualityAndVerification.knowledgeGraphMetrics.totalGraphRelationships >= 5, 'Graph relationships must be at least 5');
    assert.ok(report.contentQualityAndVerification.verificationWorkflowStatus, 'Verification workflow status must exist');
    assert.ok(report.contentQualityAndVerification.verificationWorkflowStatus.publishedCount >= 1, 'At least 1 published document must exist');
  });
});
