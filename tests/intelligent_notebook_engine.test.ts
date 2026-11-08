import test from 'node:test';
import assert from 'node:assert';
import { notebookGenerationOrchestrator } from '../server/notebookGenerationOrchestrator.ts';
import { educationalImageResearchEngine } from '../server/educationalImageResearchEngine.ts';

test('1. Topic Roadmap Generation and Subtopic Completeness', async () => {
  const context = {
    userId: 'student-test-01',
    grade: 10,
    subject: 'Biology',
    board: 'CBSE',
    targetExams: ['CBSE Board Exam'],
    preferredDepth: 'detailed' as const,
    languagePreference: 'en',
    weakTopics: []
  };

  const roadmap = await notebookGenerationOrchestrator.generateTopicRoadmap(
    'Structure of the Human Heart',
    context,
    {
      discipline: 'science',
      subDiscipline: 'biology',
      topicType: 'conceptual_scientific',
      gradeRange: [9, 10],
      requiresMathDerivation: false,
      requiresLabApparatus: true,
      hasChronology: false,
      suggestedSectionCount: 6
    }
  );

  assert.ok(roadmap, 'Roadmap is generated');
  assert.strictEqual(roadmap.topic, 'Structure of the Human Heart');
  assert.ok(roadmap.subtopics.length >= 4, 'Has at least 4 structured subtopics');
  assert.ok(roadmap.learningObjectives.length >= 3, 'Defines explicit learning objectives');
  assert.ok(roadmap.commonMisconceptions.length >= 2, 'Defines common student misconceptions');
});

test('2. 5 Teaching Levels and 14 Concept Dimensions Generation', async () => {
  const context = {
    userId: 'student-test-01',
    grade: 10,
    subject: 'Physics',
    board: 'ICSE',
    targetExams: ['ICSE Board'],
    preferredDepth: 'detailed' as const,
    languagePreference: 'en',
    weakTopics: []
  };

  const roadmap = await notebookGenerationOrchestrator.generateTopicRoadmap(
    'Force',
    context,
    {
      discipline: 'science',
      subDiscipline: 'physics',
      topicType: 'quantitative_formula',
      gradeRange: [9, 10],
      requiresMathDerivation: true,
      requiresLabApparatus: false,
      hasChronology: false,
      suggestedSectionCount: 5
    }
  );

  const section = await notebookGenerationOrchestrator.generateDetailedSectionContent(
    'Force',
    0,
    "Newton's Second Law of Motion and Momentum",
    context,
    roadmap
  );

  assert.ok(section.fiveLevels.foundation.length > 50, 'Level 1 Foundation populated');
  assert.ok(section.fiveLevels.detailedUnderstanding.length > 100, 'Level 2 Detailed Understanding populated');
  assert.ok(section.fiveLevels.deepConceptual.length > 100, 'Level 3 Deep Conceptual populated');
  assert.ok(section.fiveLevels.applicationAndProblems.length > 100, 'Level 4 Application & Problems populated');
  assert.ok(section.fiveLevels.advancedInsight.length > 50, 'Level 5 Advanced Insight populated');

  // Verify quantitative problem contains SI units and step-by-step working
  assert.ok(section.workedProblem !== undefined || section.contentMarkdown.includes('Worked Numerical'), 'Contains step-by-step problem');
  assert.ok(section.contentMarkdown.includes('SI Unit') || section.fiveLevels.applicationAndProblems.includes('examination'), 'Contains rigor');
});

test('3. Topic 1: Structure of the Human Heart - Visual and 8-Point Walkthrough', async () => {
  const result = await notebookGenerationOrchestrator.retrieveOrGenerateSectionVisual(
    'Structure of the Human Heart',
    {
      id: 'sec-heart-0',
      sectionIndex: 0,
      title: 'Four Chambers and Great Vessels',
      heading: 'Four Chambers and Great Vessels',
      status: 'pending',
      fiveLevels: {
        foundation: '',
        detailedUnderstanding: '',
        deepConceptual: '',
        applicationAndProblems: '',
        advancedInsight: ''
      },
      contentMarkdown: '',
      plainExplanation: '',
      keyTakeaways: [],
      citations: []
    }
  );

  assert.ok(result.visual, 'Visual asset retrieved');
  assert.strictEqual(result.visual.accuracyStatus, 'verified', 'Asset is verified');
  assert.ok(result.walkthrough, '8-point walkthrough generated');
  assert.ok(result.walkthrough.whatItRepresents.length > 0, 'Walkthrough #1: what it represents');
  assert.ok(result.walkthrough.whatStudentIsLookingAt.length > 0, 'Walkthrough #2: what student is looking at');
  assert.ok(result.walkthrough.importantComponents.length >= 3, 'Walkthrough #3: key components');
  assert.ok(result.walkthrough.arrowIndications.length > 0, 'Walkthrough #6: directional flow');
  assert.ok(result.walkthrough.importantConclusion.length > 0, 'Walkthrough #7: core conclusion');
  assert.ok(result.walkthrough.examTip, 'Walkthrough #8: exam tip included');
});

test('4. Topic 2: Photosynthesis - Complete Visual and Chemical Accuracy', async () => {
  const result = await notebookGenerationOrchestrator.retrieveOrGenerateSectionVisual(
    'Photosynthesis',
    {
      id: 'sec-photo-0',
      sectionIndex: 0,
      title: 'Light-Dependent Reactions and Chloroplast Ultrastructure',
      heading: 'Light-Dependent Reactions and Chloroplast Ultrastructure',
      status: 'pending',
      fiveLevels: {
        foundation: '',
        detailedUnderstanding: '',
        deepConceptual: '',
        applicationAndProblems: '',
        advancedInsight: ''
      },
      contentMarkdown: '',
      plainExplanation: '',
      keyTakeaways: [],
      citations: []
    }
  );

  assert.ok(result.visual, 'Visual asset retrieved');
  assert.ok(result.walkthrough, 'Walkthrough created');
  assert.ok(result.walkthrough.processSequence.includes('Photophosphorylation') || result.walkthrough.processSequence.includes('Light') || result.walkthrough.processSequence.includes('chlorophyll'), 'Process sequence references light reaction');
});

test('5. Topic 3: DNA Structure - Molecular Fidelity and Base Pairing', async () => {
  const result = await notebookGenerationOrchestrator.retrieveOrGenerateSectionVisual(
    'DNA Structure',
    {
      id: 'sec-dna-0',
      sectionIndex: 0,
      title: 'Watson-Crick Double Helix and Complementary Base Pairing',
      heading: 'Watson-Crick Double Helix and Complementary Base Pairing',
      status: 'pending',
      fiveLevels: {
        foundation: '',
        detailedUnderstanding: '',
        deepConceptual: '',
        applicationAndProblems: '',
        advancedInsight: ''
      },
      contentMarkdown: '',
      plainExplanation: '',
      keyTakeaways: [],
      citations: []
    }
  );

  assert.ok(result.visual, 'Visual asset retrieved');
  assert.ok(result.walkthrough.componentRelationships.includes('Adenine') || result.walkthrough.componentRelationships.includes('Hydrogen') || result.walkthrough.componentRelationships.includes('backbone'), 'Mentions base pairing relationships');
});

test('6. Topic 4 & 5: Force & Work, Power and Energy - Physics Derivations and Worked Examples', async () => {
  const context = {
    userId: 'student-test-01',
    grade: 9,
    subject: 'Physics',
    board: 'CBSE',
    targetExams: ['School Exams'],
    preferredDepth: 'detailed' as const,
    languagePreference: 'en',
    weakTopics: []
  };

  const roadmap = await notebookGenerationOrchestrator.generateTopicRoadmap(
    'Work, Power and Energy',
    context,
    {
      discipline: 'science',
      subDiscipline: 'physics',
      topicType: 'quantitative_formula',
      gradeRange: [9, 10],
      requiresMathDerivation: true,
      requiresLabApparatus: false,
      hasChronology: false,
      suggestedSectionCount: 5
    }
  );

  const workSection = await notebookGenerationOrchestrator.generateDetailedSectionContent(
    'Work, Power and Energy',
    0,
    'Work-Energy Theorem and Conservation of Mechanical Energy',
    context,
    roadmap
  );

  assert.ok(workSection.fiveLevels.applicationAndProblems.length > 50, 'Populates application level');
  assert.ok(workSection.contentMarkdown.includes('Work, Power and Energy') || workSection.contentMarkdown.includes('Conservation'), 'Covers energy depth');
});

test('7. Topic 6: Atomic Structure - Subatomic Particles and Orbital Models', async () => {
  const result = await notebookGenerationOrchestrator.retrieveOrGenerateSectionVisual(
    'Atomic Structure',
    {
      id: 'sec-atom-0',
      sectionIndex: 0,
      title: 'Bohr Model and Electron Energy Levels',
      heading: 'Bohr Model and Electron Energy Levels',
      status: 'pending',
      fiveLevels: {
        foundation: '',
        detailedUnderstanding: '',
        deepConceptual: '',
        applicationAndProblems: '',
        advancedInsight: ''
      },
      contentMarkdown: '',
      plainExplanation: '',
      keyTakeaways: [],
      citations: []
    }
  );

  assert.ok(result.visual, 'Atomic visual returned');
  assert.ok(result.walkthrough, 'Atomic walkthrough generated');
});

test('8. Topic 7: Linear Equations - Mathematical Rigor and Step-by-Step Balancing', async () => {
  const context = {
    userId: 'student-test-01',
    grade: 8,
    subject: 'Mathematics',
    board: 'CBSE',
    targetExams: ['CBSE Term Exam'],
    preferredDepth: 'detailed' as const,
    languagePreference: 'en',
    weakTopics: []
  };

  const roadmap = await notebookGenerationOrchestrator.generateTopicRoadmap(
    'Linear Equations',
    context,
    {
      discipline: 'mathematics',
      subDiscipline: 'algebra',
      topicType: 'quantitative_formula',
      gradeRange: [7, 8],
      requiresMathDerivation: true,
      requiresLabApparatus: false,
      hasChronology: false,
      suggestedSectionCount: 4
    }
  );

  const mathSection = await notebookGenerationOrchestrator.generateDetailedSectionContent(
    'Linear Equations',
    0,
    'Solving Linear Equations with One Variable and Balance Method',
    context,
    roadmap
  );

  assert.ok(mathSection.fiveLevels.applicationAndProblems.length > 50, 'Populates algebra application');
  assert.ok(mathSection.contentMarkdown.includes('Linear Equations'), 'Contains algebraic content');
});

test('9. Topic 8: World War II - Historical Cause-and-Effect and Chronology', async () => {
  const context = {
    userId: 'student-test-01',
    grade: 10,
    subject: 'History',
    board: 'CBSE',
    targetExams: ['CBSE Board Exam'],
    preferredDepth: 'detailed' as const,
    languagePreference: 'en',
    weakTopics: []
  };

  const historyRoadmap = await notebookGenerationOrchestrator.generateTopicRoadmap(
    'World War II',
    context,
    {
      discipline: 'humanities',
      subDiscipline: 'history',
      topicType: 'historical_chronological',
      gradeRange: [9, 10],
      requiresMathDerivation: false,
      requiresLabApparatus: false,
      hasChronology: true,
      suggestedSectionCount: 6
    }
  );

  assert.ok(historyRoadmap.subtopics.some(s => s.toLowerCase().includes('origin') || s.toLowerCase().includes('cause') || s.toLowerCase().includes('turning') || s.toLowerCase().includes('theatre') || s.toLowerCase().includes('europe')), 'Chronological subtopics present');
});

test('10. Separate Condensed Revision Notebook Generation', async () => {
  const context = {
    userId: 'student-test-01',
    grade: 10,
    subject: 'Biology',
    board: 'CBSE',
    targetExams: ['CBSE Board Exam'],
    preferredDepth: 'detailed' as const,
    languagePreference: 'en',
    weakTopics: []
  };

  const roadmap = await notebookGenerationOrchestrator.generateTopicRoadmap(
    'Structure of the Human Heart',
    context,
    {
      discipline: 'science',
      subDiscipline: 'biology',
      topicType: 'conceptual_scientific',
      gradeRange: [9, 10],
      requiresMathDerivation: false,
      requiresLabApparatus: true,
      hasChronology: false,
      suggestedSectionCount: 4
    }
  );

  const sections = [
    {
      id: 's1',
      sectionIndex: 0,
      title: 'Chambers and Valves',
      heading: 'Chambers and Valves',
      status: 'ready' as const,
      fiveLevels: {
        foundation: 'The heart has four chambers: two atria and two ventricles.',
        detailedUnderstanding: 'Right atrium receives deoxygenated blood from vena cava.',
        deepConceptual: 'Pressure gradients govern atrioventricular valve opening.',
        applicationAndProblems: 'Worked problem: cardiac output Q = SV x HR.',
        advancedInsight: 'Electrical conduction originates at SA node.'
      },
      contentMarkdown: '# Chambers and Valves\n...',
      plainExplanation: 'Four chamber muscular pump',
      keyTakeaways: ['4 chambers', 'Tricuspid & Bicuspid valves prevent backflow'],
      citations: []
    }
  ];

  const revision = await notebookGenerationOrchestrator.generateSeparateRevisionNotebook(
    'note-heart-01',
    'Structure of the Human Heart',
    context,
    roadmap,
    sections
  );

  assert.ok(revision, 'Revision notebook created');
  assert.strictEqual(revision.topic, 'Structure of the Human Heart');
  assert.ok(revision.quickRevisionMatrix.length >= 1, 'Quick revision matrix present');
  assert.ok(revision.highYieldDefinitions.length >= 1, 'High-yield definitions included');
  assert.ok(revision.memoryMnemonics.length >= 1, 'Memory mnemonics included');
  assert.ok(revision.modelExamQuestions.length >= 2, 'Model exam questions with mark scheme');
  assert.ok(revision.modelExamQuestions[0].answerKey.length >= 1, 'Answer key defined');
});

test('11. Interactive "Understand This Image" Q&A Engine', async () => {
  const answerResult = await notebookGenerationOrchestrator.answerImageQuestion(
    'Structure of the Human Heart',
    'Four Chambers of the Heart',
    'Anatomy of the Human Heart',
    'Why is the left ventricle wall thicker than the right ventricle wall?',
    {
      whatItRepresents: 'Human heart chambers and myocardium',
      whatStudentIsLookingAt: 'Anterior coronal cross section',
      importantComponents: [
        { name: 'Left Ventricle', role: 'Pumps blood to entire systemic body through aorta under high hydrostatic pressure' },
        { name: 'Right Ventricle', role: 'Pumps deoxygenated blood to adjacent pulmonary lungs' }
      ],
      componentFunctions: 'Left ventricle produces high pressure for systemic circuit',
      componentRelationships: 'Left ventricle myocardium is 3x thicker',
      arrowIndications: 'Blood flows from left ventricle into the ascending aorta',
      processSequence: 'Ventricular systole -> aortic valve opens -> blood ejected',
      importantConclusion: 'Myocardial thickness correlates with hydraulic workload',
      examTip: 'Always mention systemic circulation vs pulmonary circulation pressure differences'
    }
  );

  assert.ok(answerResult.answer.length > 50, 'Substantive answer provided');
  assert.ok(answerResult.groundedComponents.length > 0, 'Grounded components cited');
  assert.ok(
    answerResult.answer.toLowerCase().includes('pressure') ||
    answerResult.answer.toLowerCase().includes('systemic') ||
    answerResult.answer.toLowerCase().includes('ventricle'),
    'Scientifically grounded in cardiovascular physics'
  );
});

test('12. Progressive Job Management and Independent Section Retry', async () => {
  // Start job
  const job = await notebookGenerationOrchestrator.startProgressiveNotebookJob(
    'student-test-01',
    'Atomic Structure',
    'Chemistry',
    'detailed'
  );

  assert.ok(job.id, 'Job created with ID');
  assert.strictEqual(job.topic, 'Atomic Structure');
  assert.ok(job.roadmap, 'Initial roadmap planned immediately');

  // Check state retrieval
  const state = notebookGenerationOrchestrator.getJobState(job.id);
  assert.ok(state, 'Job state retrievable');

  // Test retry on a section
  const retryResult = await notebookGenerationOrchestrator.retryFailedSection(job.id, 0);
  assert.ok(retryResult, 'Section retry returned result');
  assert.strictEqual(retryResult.status, 'ready', 'Section status updated to ready');
});
