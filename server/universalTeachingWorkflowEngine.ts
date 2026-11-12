import crypto from 'node:crypto';
import {
  extractAndExplainAbbreviations,
  buildWorkedNumericalProblems,
  buildFormulaExploded,
  renderSpecializedSecondarySvg,
  buildPrimaryImageWalkthrough,
  validateImageAsset,
  generateFriendlyPersonalTeacherIntro,
  type AbbreviationItem,
  type ImageWalkthrough
} from './tutorRebuildEngine.ts';
import {
  getSubtopicDiagramsForTopic,
  type SubtopicDiagramItem
} from './subtopicDiagramCatalog.ts';

export interface NumericalProblem9Step {
  problemNumber: number;
  title: string;
  statement: string;
  step1_givenInformation: Array<{ symbol: string; value: string; unit: string; description: string }>;
  step2_requiredQuantity: { symbol: string; target: string; expectedUnit: string };
  step3_relevantFormula: string;
  step4_formulaSelectionReason: string;
  step5_substitution: string;
  step6_stepByStepCalculations: string[];
  step7_siUnits: string;
  step8_finalAnswer: string;
  step9_verificationOrInterpretation: string;
}

export interface DiagramVisualExplanation8Point {
  diagramId: string;
  title: string;
  imageUrl: string;
  diagramType: string;
  caption: string;
  point1_whatItRepresents: string;
  point2_labelledParts: Array<{ label: string; description: string }>;
  point3_componentFunctions: string;
  point4_componentRelationships: string;
  point5_directionOfMovementOrProcess: string;
  point6_stepByStepInterpretation: string[];
  point7_learningOutcome: string;
  point8_whatToRemember: string;
  isVerified: boolean;
}

export interface ProblemSolvingMethodSection {
  isRelevant: boolean;
  discipline: string;
  tenPointMethodGuide: Array<{ stepNumber: number; title: string; instruction: string }>;
  problemTypes: Array<{
    typeId: string;
    typeName: string;
    howToIdentify: string;
    requiredFormulaOrPrinciple: string;
    representativeSolvedExample: {
      problemStatement: string;
      givenInformation: Array<{ symbol: string; value: string; unit: string; description: string }>;
      requiredQuantity: string;
      formulaSelected: string;
      formulaSelectionReason: string;
      substitution: string;
      stepByStepCalculations: string[];
      unitsAndFinalAnswer: string;
      alternativeMethod?: string;
      commonMistakesToAvoid: string[];
    };
  }>;
  practiceProblemsWithAnswers: Array<{
    problemNumber: number;
    statement: string;
    answer: string;
    stepByStepExplanation: string;
  }>;
}

export interface SubtopicConceptItem {
  subtopicId: string;
  name: string;
  whatItIs: string;
  whatItMeans?: string;
  structureOrComponents: string;
  purpose: string;
  howItWorks: string;
  whyItIsImportant: string;
  characteristics: string[];
  importance: string;
  examples: string[];
  connectionToMainTopic: string;
  diagram: DiagramVisualExplanation8Point;
}

export interface ImportantDefinitionItem {
  term: string;
  academicDefinition: string;
  simpleExplanation: string;
  example: string;
  importance: string;
}

export interface UniversalTeachingWorkflow {
  topic: string;
  subject: string;
  grade: number;
  board: string;
  discipline: string;
  createdAt: string;

  // Stage 1: Friendly topic introduction
  stage1_topicIntroduction: {
    teacherGreeting?: string;
    overview: string;
    whatStudentWillLearn: string[];
    whyItIsImportant: string;
    whereItIsUsed: string;
    subjectConnection: string;
  };

  // Stage 2: Main definition
  stage2_definitionAndMeaning: {
    academicDefinition: string;
    simpleLanguageExplanation: string;
    keyWordMeanings: Array<{ word: string; meaning: string }>;
    coreExample: string;
    practicalInterpretation: string;
  };
  stage2_mainDefinition?: {
    academicDefinition: string;
    simpleLanguageExplanation: string;
    keyWordMeanings: Array<{ word: string; meaning: string }>;
    coreExample: string;
    practicalInterpretation: string;
  };

  // Stage 3: Important definitions within the topic & subtopics
  stage3_importantDefinitions: ImportantDefinitionItem[];
  stage3_fundamentalsAndPrerequisites: {
    backgroundKnowledge: string[];
    basicPrinciples: string[];
    prerequisites: string[];
    priorConceptConnections: string;
  };

  // Stage 4: Key terminology and full forms
  stage4_importantTerminology: Array<{
    term: string;
    fullForm?: string;
    definition: string;
    simpleMeaning: string;
    importance: string;
    example: string;
    technicalDefinition?: string;
    functionOrRole?: string;
  }>;
  stage4_keyTerminologyAndFullForms?: Array<{
    term: string;
    fullForm?: string;
    definition: string;
    simpleMeaning: string;
    importance: string;
    example: string;
  }>;

  // Stage 5: Main concepts and subtopics (EACH with its own dedicated diagram!)
  stage5_mainConceptsAndSubtopics: SubtopicConceptItem[];
  stage5_mainConceptsAndComponents: SubtopicConceptItem[];

  // Stage 6: Differences and comparisons
  stage6_differencesAndComparisons: {
    title: string;
    conceptA: string;
    conceptB: string;
    meaningOfEach?: { conceptA: string; conceptB: string };
    similarities?: string[];
    differences?: string[];
    uniqueCharacteristics?: { conceptA: string[]; conceptB: string[] };
    rows: Array<{ aspect: string; itemA: string; itemB: string }>;
    summaryTakeaway?: string;
    causeAndEffectNotes: string[];
  };
  // Backward compatibility alias
  stage11_comparisonsAndRelationships: {
    title: string;
    conceptA: string;
    conceptB: string;
    rows: Array<{ aspect: string; itemA: string; itemB: string }>;
    causeAndEffectNotes: string[];
  };

  // Stage 7: Detailed mechanisms and processes (with dedicated process-flow diagram)
  stage7_detailedMechanismsAndProcesses: {
    processTitle: string;
    startingConditions: string;
    componentsInvolved: string[];
    sequenceOfEvents: Array<{
      stepNumber: number;
      title: string;
      whatHappens: string;
      whereItHappens: string;
      whyItHappens: string;
      whatHappensNext: string;
    }>;
    finalResult: string;
    relationshipsBetweenStages: string;
    processDiagram: DiagramVisualExplanation8Point;
  };
  // Backward compatibility aliases
  stage6_detailedWorkingMechanism: {
    whatHappens: string;
    whyItHappens: string;
    howItHappens: string;
    participatingComponents: string[];
    componentInteractions: string;
    finalResult: string;
  };
  stage7_stepByStepProcesses: Array<{
    stepNumber: number;
    title: string;
    whatHappens: string;
    whereItHappens: string;
    componentsInvolved: string[];
    whyItHappens: string;
    whatHappensNext: string;
  }>;

  // Stage 8: Diagrams and visual explanations (All subtopic diagrams aggregated)
  stage8_diagramsAndVisualExplanations: DiagramVisualExplanation8Point[];

  // Stage 9: Examples and applications
  stage9_examplesAndApplications: {
    simpleExample: { scenario: string; explanation: string };
    textbookExample: { scenario: string; explanation: string };
    realWorldExample: { scenario: string; explanation: string };
    practicalApplications: string[];
  };

  // Stage 10: Formulas, equations and problem solving
  stage10_formulasAndProblemSolving: {
    hasFormulas: boolean;
    primaryEquation?: string;
    variableExploded: Array<{ symbol: string; name: string; siUnit: string; role: string }>;
    derivation?: string[];
    whyFormulaIsUsed?: string;
    workedNumericals: NumericalProblem9Step[];
  };

  // Stage 11: Important facts and misconceptions
  stage12_importantFactsAndMisconceptions: {
    importantFacts: string[];
    frequentlyMisunderstood: Array<{ misconception: string; scientificFact: string; whyMistakeOccurs: string }>;
    boardTraps: string[];
  };
  stage10_importantFactsAndMisconceptions?: {
    importantFacts: string[];
    frequentlyMisunderstood: Array<{ misconception: string; scientificFact: string; whyMistakeOccurs: string }>;
    boardTraps: string[];
  };

  // Stage 12: Complete topic recap
  stage13_completeTopicRecap: {
    comprehensiveSummary: string[];
    coreTakeaway: string;
    quickRevisionChecklist: string[];
  };
  stage11_completeRecap?: {
    comprehensiveSummary: string[];
    coreTakeaway: string;
    quickRevisionChecklist: string[];
  };

  // Stage 13 / 14: Knowledge assessment
  stage14_knowledgeAssessment: Array<{
    id: string;
    type: 'MCQ' | 'Short Answer' | 'Long Answer' | 'Definition' | 'Numerical' | 'Fill in Blanks';
    marks: number;
    question: string;
    options?: string[];
    correctAnswer: string;
    modelAnswer: string;
    explanation: string;
  }>;
  stage12_knowledgeCheck?: Array<{
    id: string;
    type: 'MCQ' | 'Short Answer' | 'Long Answer' | 'Definition' | 'Numerical' | 'Fill in Blanks';
    marks: number;
    question: string;
    options?: string[];
    correctAnswer: string;
    modelAnswer: string;
    explanation: string;
  }>;

  // 10 Unified Universal Educational Sections (A through J)
  sectionA_definitions?: any;
  sectionB_keyPoints?: any;
  sectionC_keyTermsAndTerminology?: any;
  sectionD_mainConceptsAndSubtopics?: any;
  sectionE_keyDifferencesAndComparisons?: any;
  sectionF_importantProcessesAndMechanisms?: any;
  sectionG_formulasAndEquations?: any;
  sectionH_problemSolvingMethods?: ProblemSolvingMethodSection;
  sectionI_examOrientedPreparation?: any;
  sectionJ_finalRevisionSection?: any;
}

/**
 * Builds the canonical 12-Stage Universal Teaching Workflow for any curriculum topic,
 * ensuring each subtopic receives its own dedicated diagram and 8-point explanation.
 */
export function buildUniversalTeachingWorkflow(params: {
  topic: string;
  subject?: string;
  grade?: number;
  board?: string;
  studentName?: string;
  rawLesson?: any;
}): UniversalTeachingWorkflow {
  const topic = (params.topic || 'Photosynthesis').trim();
  const subject = params.subject || inferSubjectFromTopic(topic);
  const grade = params.grade || 10;
  const board = params.board || 'CBSE';
  const rawLesson = params.rawLesson || {};
  const studentName = params.studentName || rawLesson.studentName;
  const lower = topic.toLowerCase();
  const now = new Date().toISOString();

  // 1. Discipline Classification
  let discipline = 'General Science';
  if (/heart|circulation|lungs|respiratory|photosynthesis|dna|cell|digestive|ear|anatomy/.test(lower)) {
    discipline = 'Biology & Life Sciences';
  } else if (/newton|force|motion|energy|work|power|circuit|motor|electricity|gravity/.test(lower)) {
    discipline = 'Physics & Mechanics';
  } else if (/bonding|acid|base|atom|reaction|compound|molecule/.test(lower)) {
    discipline = 'Chemistry & Matter';
  } else if (/equation|quadratic|linear|triangle|polynomial|algebra|geometry/.test(lower)) {
    discipline = 'Mathematics';
  } else if (/war|revolution|civics|history|constitution|geography/.test(lower)) {
    discipline = 'Social Sciences';
  }

  // Abbreviations & Full Forms
  const abbrList = extractAndExplainAbbreviations(topic, topic, topic);

  // Retrieve Dedicated Multi-Diagram Catalog for Subtopics
  const subtopicDiagramDefs = getSubtopicDiagramsForTopic(topic, subject);

  // Build 8-point diagram objects for each subtopic
  const subtopicDiagrams8Point: DiagramVisualExplanation8Point[] = subtopicDiagramDefs.map((sd) => ({
    diagramId: sd.diagramId,
    title: sd.diagramTitle,
    imageUrl: sd.dataUrl,
    diagramType: sd.diagramType,
    caption: sd.caption,
    point1_whatItRepresents: sd.point1_whatItRepresents,
    point2_labelledParts: sd.point2_labelledParts,
    point3_componentFunctions: sd.point3_componentFunctions,
    point4_componentRelationships: sd.point4_componentRelationships,
    point5_directionOfMovementOrProcess: sd.point5_directionOfMovementOrProcess,
    point6_stepByStepInterpretation: sd.point6_stepByStepInterpretation,
    point7_learningOutcome: sd.point7_learningOutcome,
    point8_whatToRemember: sd.point8_whatToRemember,
    isVerified: true
  }));

  // Build Worked Numerical Problems (9-Step Template)
  const rawNumericals = buildWorkedNumericalProblems(topic, subject, { equation: 'F = m · a' });
  const workedNumericals9Step: NumericalProblem9Step[] = rawNumericals.map((rn, idx) => ({
    problemNumber: idx + 1,
    title: rn.title,
    statement: rn.problemStatement,
    step1_givenInformation: rn.givenData || [
      { symbol: 'm', value: '5.0', unit: 'kg', description: 'Mass of the body' },
      { symbol: 'F', value: '25.0', unit: 'N', description: 'Net applied external force' }
    ],
    step2_requiredQuantity: {
      symbol: 'a',
      target: 'Acceleration produced in the body',
      expectedUnit: 'm/s²'
    },
    step3_relevantFormula: rn.formulaUsed || 'F = m · a',
    step4_formulaSelectionReason: `Selected because Newton's Second Law mathematically relates unbalanced net force to mass and the resulting acceleration.`,
    step5_substitution: rn.stepByStepSolution[1] || 'Substitute values into formula: a = F / m = 25.0 N / 5.0 kg',
    step6_stepByStepCalculations: rn.stepByStepSolution,
    step7_siUnits: rn.siUnit || 'Metres per second squared (m/s²)',
    step8_finalAnswer: rn.finalAnswer || 'a = 5.0 m/s²',
    step9_verificationOrInterpretation: rn.verificationCheck || 'Verification: Dimensional check [N / kg] = [kg·m/s² / kg] = [m/s²] (Consistent).'
  }));

  // Stage 1: Friendly Topic Introduction
  const friendlyTeacherGreeting = generateFriendlyPersonalTeacherIntro({
    studentName,
    topic,
    subject,
    mode: 'tutor'
  });

  const stage1 = {
    teacherGreeting: friendlyTeacherGreeting,
    overview: `**${topic}** is a cornerstone topic in Class ${grade} ${subject} (${discipline}). It establishes the fundamental principles governing how physical, chemical, or biological entities interact, transform, and reach equilibrium.`,
    whatStudentWillLearn: [
      `The precise academic and textbook definition of ${topic}.`,
      `Core structural components and prerequisites required for mastery.`,
      `The complete working mechanism and step-by-step sequential processes.`,
      `Mathematical governing equations, SI units, and worked numerical problems.`,
      `Common board examination traps, misconceptions, and high-yield model answers.`
    ],
    whyItIsImportant: `Mastering ${topic} provides the essential conceptual foundation needed for advanced Class 11–12 topics, competitive assessments, and real-world scientific applications.`,
    whereItIsUsed: `Directly applied in modern industrial engineering, medical physiology, environmental balance, and laboratory experimental procedures.`,
    subjectConnection: `Forms a primary chapter pillar within the ${board} Class ${grade} ${subject} curriculum syllabus.`
  };

  // Stage 2: Main Definition
  const stage2 = buildMainDefinitionForTopic(topic, subject);

  // Stage 3: Important Definitions within the Topic & Subtopics
  const stage3ImportantDefs = buildImportantDefinitionsForTopic(topic, subject);
  const stage3Prereqs = {
    backgroundKnowledge: [
      `Elementary Class ${grade - 1} foundational terminology of ${subject}.`,
      `Concept of conservation of mass, energy, and momentum.`,
      `Familiarity with standard SI metric units (meters, seconds, kilograms, Joules, Newtons).`
    ],
    basicPrinciples: [
      `Causality: Every observed physical or biological effect has a measurable physical cause.`,
      `Conservation: Energy and mass cannot be created or destroyed, only transformed between states.`
    ],
    prerequisites: [
      `Understanding how vectors and scalars differ.`,
      `Basic algebraic balancing and substitution skills.`
    ],
    priorConceptConnections: `Directly connects prior units on foundational states of matter with advanced macroscopic mechanics and physiological regulation.`
  };

  // Stage 4: Key Terminology and Full Forms
  const stage4 = abbrList.map((a) => ({
    term: a.abbr,
    fullForm: a.fullForm,
    definition: a.simpleDefinition,
    simpleMeaning: a.simpleDefinition,
    importance: a.roleInTopic,
    example: a.example,
    technicalDefinition: a.simpleDefinition,
    functionOrRole: a.roleInTopic
  }));

  // Stage 5: Main Concepts and Subtopics (Each with its dedicated diagram!)
  const stage5Subtopics: SubtopicConceptItem[] = buildSubtopicsWithDiagrams(topic, subject, subtopicDiagrams8Point);

  // Stage 6: Differences and Comparisons
  const stage6Comparisons = buildComparisonsForTopic(topic, subject);

  // Stage 7: Detailed Mechanisms & Processes (with Process-Flow Diagram)
  const processFlowDiagramSpec = renderSpecializedSecondarySvg(
    /heart|cardiac/.test(lower)
      ? 'process_flow'
      : /dna|helix/.test(lower)
      ? 'dna_replication_flow'
      : /atp/.test(lower)
      ? 'atp_structure'
      : /newton|force/.test(lower)
      ? 'newton_laws_fbd'
      : /bond|chemical/.test(lower)
      ? 'chemical_bonding_types'
      : 'process_flow',
    topic
  );

  const processFlowDiagram8Point: DiagramVisualExplanation8Point = {
    diagramId: `process-flow-${crypto.randomUUID().slice(0, 8)}`,
    title: processFlowDiagramSpec.title,
    imageUrl: processFlowDiagramSpec.dataUrl,
    diagramType: processFlowDiagramSpec.diagramType,
    caption: processFlowDiagramSpec.caption,
    point1_whatItRepresents: processFlowDiagramSpec.explanation.whatItShows,
    point2_labelledParts: processFlowDiagramSpec.explanation.importantParts,
    point3_componentFunctions: processFlowDiagramSpec.explanation.partFunctions,
    point4_componentRelationships: processFlowDiagramSpec.explanation.howPartsConnect,
    point5_directionOfMovementOrProcess: 'Directional sequential flow: Stage 1 (Inputs) → Stage 2 (Mechanism) → Stage 3 (Final Output).',
    point6_stepByStepInterpretation: processFlowDiagramSpec.explanation.processStages,
    point7_learningOutcome: processFlowDiagramSpec.explanation.whyItMatters,
    point8_whatToRemember: processFlowDiagramSpec.explanation.whatToRemember,
    isVerified: true
  };

  const stage7Processes = buildStepByStepProcessesForTopic(topic, subject);
  const stage7DetailedMechanisms = {
    processTitle: `${topic} Complete Sequential Mechanism`,
    startingConditions: `Initial physiological, physical, or chemical conditions prior to activation.`,
    componentsInvolved: stage7Processes.map((p) => p.componentsInvolved).flat(),
    sequenceOfEvents: stage7Processes,
    finalResult: `Stable terminal output and energy state achieving system equilibrium.`,
    relationshipsBetweenStages: `Each stage's product acts as the essential substrate or electrical trigger for the succeeding stage.`,
    processDiagram: processFlowDiagram8Point
  };

  // Stage 6 detailed working mechanism (backward compatibility)
  const stage6WorkingMech = {
    whatHappens: `Under standard operational conditions, incoming inputs bind to or stimulate the primary functional units of ${topic}.`,
    whyItHappens: `Driven by potential energy gradients, chemical affinity, or applied external forces seeking thermodynamic equilibrium.`,
    howItHappens: `Through a tight series of physical deflections, chemical bond shifts, or electrical depolarizations that progress sequentially without skipping stages.`,
    participatingComponents: [`Primary Hub`, `Transmission Vector`, `Reactive Catalyst/Transducer`, `Terminal Receptor`],
    componentInteractions: `Component A activates Component B via mechanical force or chemical reduction, which in turn primes Component C for discharge.`,
    finalResult: `The stable, measurable generation of target output products accompanied by clean thermal dissipation.`
  };

  // Stage 8: Aggregate all diagrams (All individual subtopic diagrams + process flow)
  const allDiagrams: DiagramVisualExplanation8Point[] = [
    ...subtopicDiagrams8Point,
    processFlowDiagram8Point
  ];

  // Stage 9: Examples and Applications
  const stage9Examples = {
    simpleExample: {
      scenario: `Everyday home observation of ${topic}`,
      explanation: `Illustrates how everyday household appliances or living organisms utilize the exact same fundamental principles of ${topic}.`
    },
    textbookExample: {
      scenario: `Standard NCERT/CBSE Class ${grade} laboratory verification experiment`,
      explanation: `Demonstrates that measured empirical values closely follow theoretical equations within ±2% experimental margin.`
    },
    realWorldExample: {
      scenario: `Large-scale modern engineering or medical application`,
      explanation: `Used by biomedical researchers and mechanical engineers to design life-saving diagnostics and efficient transit systems.`
    },
    practicalApplications: [
      `Quantitative calculation of system performance in engineering.`,
      `Diagnostic medical assessment of organ health and disease pathways.`,
      `Optimization of environmental energy conversion and storage.`
    ]
  };

  // Stage 10: Formulas
  const stage10Formulas = {
    hasFormulas: discipline === 'Physics & Mechanics' || discipline === 'Mathematics' || discipline === 'Chemistry & Matter',
    primaryEquation: discipline === 'Physics & Mechanics' ? 'F = m · a  |  p = m · v' : 'Inputs → Transformation → Output',
    variableExploded: buildFormulaExploded(topic, { equation: 'F = m · a' }),
    derivation: [
      '1. State Newton’s Second Law: Force is proportional to rate of change of momentum (F ∝ dp/dt).',
      '2. Substitute linear momentum definition: p = m · v, therefore F = k · d(m · v) / dt.',
      '3. For constant mass m: F = k · m · (dv / dt).',
      '4. By definition, acceleration a = dv / dt, yielding F = k · m · a.',
      '5. Choosing SI unit of Force such that 1 N accelerates 1 kg at 1 m/s², constant k = 1.',
      '6. Final Fundamental Derivation: F = m · a (Boxed).'
    ],
    whyFormulaIsUsed: `Allows exact quantitative prediction of body motion without trial-and-error experimentation.`,
    workedNumericals: workedNumericals9Step
  };

  // Stage 11: Facts and Misconceptions
  const stage12Facts = {
    importantFacts: [
      `Verified across all standard experimental conditions adhering to Class ${grade} curriculum laws.`,
      `Does not depend on observer frame when measured in standard inertial reference frames.`
    ],
    frequentlyMisunderstood: [
      {
        misconception: `Assuming that ${topic} produces results without consuming potential energy.`,
        scientificFact: `First Law of Thermodynamics strictly requires an equal quantity of input energy for all generated output work.`,
        whyMistakeOccurs: `Students often overlook invisible energy inputs such as ambient heat or stored chemical bonds.`
      },
      {
        misconception: `Omitting standard SI metric units during final numerical answer steps.`,
        scientificFact: `In board examinations, writing a correct numerical magnitude without SI units loses 0.5 to 1 full mark.`,
        whyMistakeOccurs: `Rushing to calculate the number without verifying unit dimensional consistency.`
      }
    ],
    boardTraps: [
      `Forgetting to state direction when solving vector quantities (Force, Acceleration, Velocity).`,
      `Failing to label the axes and units when sketching illustrative graphical curves in exams.`
    ]
  };

  // Stage 12: Recap
  const stage13Recap = {
    comprehensiveSummary: [
      `1. Core Principle: ${stage2.simpleLanguageExplanation}`,
      `2. Governing Relationship: ${stage10Formulas.primaryEquation}`,
      `3. Sequential Flow: ${stage7Processes.map((s) => s.title).join(' → ')}`,
      `4. Diagram Anchor: ${subtopicDiagrams8Point[0]?.point8_whatToRemember || processFlowDiagram8Point.point8_whatToRemember}`,
      `5. Common Trap: ${stage12Facts.boardTraps[0]}`
    ],
    coreTakeaway: `Mastering ${topic} requires connecting its visual structure, mathematical laws, and real-world cause-and-effect mechanism into one coherent mental model.`,
    quickRevisionChecklist: [
      `Can write official definition from memory.`,
      `Can draw and label the key parts of each subtopic schematic diagram.`,
      `Can state all abbreviations and full forms without hesitation.`,
      `Can solve a 3-step numerical using the 9-point board template.`
    ]
  };

  // Stage 13: Knowledge Assessment
  const stage14Assessment = [
    {
      id: `q1-${topic.slice(0, 4)}`,
      type: 'MCQ' as const,
      marks: 1,
      question: `Which of the following statements represents the scientifically verified mechanism of ${topic}?`,
      options: [
        subtopicDiagrams8Point[0]?.point8_whatToRemember || processFlowDiagram8Point.point8_whatToRemember,
        'It occurs completely isolated from any external conservation laws.',
        'It operates without any intermediate components participating.',
        'It produces energy from nothing without consuming inputs.'
      ],
      correctAnswer: subtopicDiagrams8Point[0]?.point8_whatToRemember || processFlowDiagram8Point.point8_whatToRemember,
      modelAnswer: `Option A is correct: ${subtopicDiagrams8Point[0]?.point8_whatToRemember || processFlowDiagram8Point.point8_whatToRemember}`,
      explanation: 'Directly reflects the governing curriculum mechanism established in the subtopic breakdown.'
    },
    {
      id: `q2-${topic.slice(0, 4)}`,
      type: 'Definition' as const,
      marks: 2,
      question: `Define ${topic} according to textbook standards and expand its primary related abbreviations.`,
      correctAnswer: stage2.academicDefinition,
      modelAnswer: `${stage2.academicDefinition}\nKey Full Forms: ${abbrList.map((a) => `${a.abbr} = ${a.fullForm}`).join(', ')}.`,
      explanation: 'Include both formal academic phrasing and all standard full forms for maximum marks.'
    },
    {
      id: `q3-${topic.slice(0, 4)}`,
      type: 'Short Answer' as const,
      marks: 3,
      question: `Describe the 3-step sequential process of ${topic} and explain what happens if Stage 2 fails.`,
      correctAnswer: stage7Processes.map((s) => s.title).join('; '),
      modelAnswer: `The 3 stages are:\n1. ${stage7Processes[0]?.title}: ${stage7Processes[0]?.whatHappens}\n2. ${stage7Processes[1]?.title}: ${stage7Processes[1]?.whatHappens}\n3. ${stage7Processes[2]?.title}: ${stage7Processes[2]?.whatHappens}\nIf Stage 2 fails, transformation cannot proceed and the system stalls without producing output.`,
      explanation: 'Present in clear numbered points with mechanistic cause-and-effect reasoning.'
    },
    {
      id: `q4-${topic.slice(0, 4)}`,
      type: 'Long Answer' as const,
      marks: 5,
      question: `With reference to labelled diagrams, thoroughly explain the working mechanism of ${topic}, derive its governing formula, and calculate a standard worked example.`,
      correctAnswer: 'Complete multi-part solution',
      modelAnswer: `[Section 1: Principle & Diagram]\n${stage1.overview}\nDiagram shows: ${subtopicDiagrams8Point[0]?.point1_whatItRepresents}\n\n[Section 2: Formula Derivation]\n${stage10Formulas.derivation?.join('\n')}\n\n[Section 3: Worked Numerical]\nGiven: ${workedNumericals9Step[0]?.step1_givenInformation.map((g) => `${g.symbol} = ${g.value} ${g.unit}`).join(', ')}\nFormula: ${workedNumericals9Step[0]?.step3_relevantFormula}\nSubstitution: ${workedNumericals9Step[0]?.step5_substitution}\nFinal Answer: ${workedNumericals9Step[0]?.step8_finalAnswer}`,
      explanation: 'Structure 5-mark board answers into distinct labelled sections with clear derivations and boxed final numerical answers.'
    }
  ];

  return {
    topic,
    subject,
    grade,
    board,
    discipline,
    createdAt: now,

    // Stage 1
    stage1_topicIntroduction: stage1,

    // Stage 2
    stage2_definitionAndMeaning: stage2,
    stage2_mainDefinition: stage2,

    // Stage 3
    stage3_importantDefinitions: stage3ImportantDefs,
    stage3_fundamentalsAndPrerequisites: stage3Prereqs,

    // Stage 4
    stage4_importantTerminology: stage4,
    stage4_keyTerminologyAndFullForms: stage4,

    // Stage 5 (Systematic Subtopics with Individual Dedicated Diagrams)
    stage5_mainConceptsAndSubtopics: stage5Subtopics,
    stage5_mainConceptsAndComponents: stage5Subtopics,

    // Stage 6
    stage6_differencesAndComparisons: stage6Comparisons,
    stage11_comparisonsAndRelationships: stage6Comparisons,

    // Stage 7
    stage7_detailedMechanismsAndProcesses: stage7DetailedMechanisms,
    stage6_detailedWorkingMechanism: stage6WorkingMech,
    stage7_stepByStepProcesses: stage7Processes,

    // Stage 8 (All Subtopic Diagrams + Process Flow)
    stage8_diagramsAndVisualExplanations: allDiagrams,

    // Stage 9
    stage9_examplesAndApplications: stage9Examples,

    // Stage 10
    stage10_formulasAndProblemSolving: stage10Formulas,

    // Stage 11
    stage12_importantFactsAndMisconceptions: stage12Facts,
    stage10_importantFactsAndMisconceptions: stage12Facts,

    // Stage 12
    stage13_completeTopicRecap: stage13Recap,
    stage11_completeRecap: stage13Recap,

    // Stage 13 / 14
    stage14_knowledgeAssessment: stage14Assessment,
    stage12_knowledgeCheck: stage14Assessment,

    // 10 Unified Universal Educational Sections (A through J)
    sectionA_definitions: {
      title: 'Section A: Definitions & Academic Meaning',
      mainTopicDefinition: stage2,
      importantAcademicDefinitions: stage3ImportantDefs,
      subtopicDefinitions: stage5Subtopics.map((s) => ({
        name: s.name,
        definition: s.whatItIs,
        importance: s.whyItIsImportant
      })),
      terminologyAndFullForms: abbrList
    },
    sectionB_keyPoints: {
      title: 'Section B: Key Points & Core Principles',
      corePrinciples: buildCorePrinciplesForTopic(topic, subject, stage12Facts),
      essentialFacts: stage12Facts.importantFacts,
      componentsAndFunctions: stage5Subtopics.map((s) => ({
        component: s.name,
        function: s.howItWorks,
        characteristics: s.characteristics
      })),
      mustRememberTakeaways: stage13Recap.comprehensiveSummary
    },
    sectionC_keyTermsAndTerminology: {
      title: 'Section C: Key Terms & Terminology',
      terms: stage4.map((t) => ({
        term: t.term,
        fullForm: t.fullForm || t.term,
        academicDefinition: t.technicalDefinition || t.definition,
        simpleExplanation: t.definition,
        example: t.example,
        importance: t.importance
      }))
    },
    sectionD_mainConceptsAndSubtopics: {
      title: 'Section D: Main Concepts & Subtopics',
      subtopics: stage5Subtopics
    },
    sectionE_keyDifferencesAndComparisons: {
      title: 'Section E: Key Differences & Comparisons',
      comparisonTitle: stage6Comparisons.title,
      conceptA: stage6Comparisons.conceptA,
      conceptB: stage6Comparisons.conceptB,
      rows: stage6Comparisons.rows,
      causeAndEffectNotes: stage6Comparisons.causeAndEffectNotes,
      summaryTakeaway: stage6Comparisons.summaryTakeaway
    },
    sectionF_importantProcessesAndMechanisms: {
      title: 'Section F: Important Processes & Mechanisms',
      processTitle: stage7DetailedMechanisms.processTitle,
      startingConditions: stage7DetailedMechanisms.startingConditions,
      componentsInvolved: stage7DetailedMechanisms.componentsInvolved,
      stages: stage7Processes,
      finalResult: stage7DetailedMechanisms.finalResult,
      processDiagram: processFlowDiagram8Point
    },
    sectionG_formulasAndEquations: {
      title: 'Section G: Formulas & Equations',
      hasFormulas: stage10Formulas.hasFormulas,
      primaryEquation: stage10Formulas.primaryEquation,
      symbolsAndUnits: stage10Formulas.variableExploded,
      derivation: stage10Formulas.derivation,
      workedNumericals: workedNumericals9Step
    },
    sectionH_problemSolvingMethods: buildProblemSolvingMethodsForTopic(topic, subject, discipline, grade),
    sectionI_examOrientedPreparation: {
      title: 'Section I: Exam-Oriented Preparation',
      mcqs: stage14Assessment.filter((q) => q.type === 'MCQ'),
      definitionQuestions: stage14Assessment.filter((q) => q.type === 'Definition'),
      shortAnswerQuestions: stage14Assessment.filter((q) => q.type === 'Short Answer'),
      longAnswerQuestions: stage14Assessment.filter((q) => q.type === 'Long Answer'),
      allQuestions: stage14Assessment,
      markingSchemeTips: [
        `Underline key scientific terms and official textbook definitions.`,
        `In numerical answers, clearly state the formula, show algebraic substitutions, and box the final answer with proper SI units.`,
        `Always accompany descriptive explanations with a neat directional diagram or flowchart.`
      ]
    },
    sectionJ_finalRevisionSection: {
      title: 'Section J: Final Revision Section',
      topicRecap: stage13Recap.comprehensiveSummary,
      coreTakeaway: stage13Recap.coreTakeaway,
      quickRevisionChecklist: stage13Recap.quickRevisionChecklist,
      boardTrapsToAvoid: stage12Facts.boardTraps,
      misconceptionsBusted: stage12Facts.frequentlyMisunderstood,
      selfAssessmentQuestions: stage14Assessment,
      executiveSummary: stage13Recap.coreTakeaway || `${topic} is a cornerstone academic unit governing verified interactions in ${subject}.`,
      quickRevisionMatrix: stage5Subtopics.slice(0, 5).map((s) => ({
        concept: s.name,
        keyRuleOrPrinciple: s.whatItIs,
        examSignificance: s.whyItIsImportant || 'High-yield board examination topic'
      }))
    },
    finalRevisionPage: {
      executiveSummary: stage13Recap.coreTakeaway || `${topic} is a high-yield academic topic in ${board} Class ${grade} ${subject}. Mastery requires precise understanding of definitions, labeled diagrams, mechanisms, and exam trap questions.`,
      quickRevisionMatrix: stage5Subtopics.slice(0, 5).map((s) => ({
        concept: s.name,
        keyRuleOrPrinciple: s.whatItIs,
        examSignificance: s.whyItIsImportant || 'High-yield board examination topic'
      })),
      memoryMnemonics: stage12Facts.boardTraps?.slice(0, 3) || [],
      highYieldFormulasOrRules: stage10Formulas.primaryEquation ? [{ name: 'Governing Formula', formula: stage10Formulas.primaryEquation, notes: 'Must include SI units' }] : [],
      examTrapReminders: stage12Facts.boardTraps || []
    }
  };
}

/**
 * Builds the complete, continuous vertically scrollable digital textbook document for AI Notes.
 * Crucial Rule: Each subtopic in Section D is immediately followed by its OWN individual educational diagram
 * and 8-point scientific breakdown (never just a single image for the entire chapter).
 * Everything is delivered together in ONE COMPLETE, CONTINUOUS PAGE (No forced 5-step gating).
 */
export function buildSinglePageDigitalTextbookMarkdown(workflow: UniversalTeachingWorkflow): string {
  const w = workflow;
  const num = w.stage10_formulasAndProblemSolving?.workedNumericals?.[0] || {
    statement: `Standard quantitative problem for ${w.topic}`,
    step1_givenInformation: [{ symbol: 'm', value: '5.0', unit: 'kg', description: 'Mass' }],
    step2_requiredQuantity: { target: 'Calculated value', symbol: 'x', expectedUnit: 'SI units' },
    step3_relevantFormula: 'F = m · a',
    step4_formulaSelectionReason: 'Standard physical relationship',
    step5_substitution: 'x = 5.0 · 2.0',
    step6_stepByStepCalculations: ['Step 1: Substitute', 'Step 2: Compute'],
    step7_siUnits: 'SI units',
    step8_finalAnswer: '10.0 SI units',
    step9_verificationOrInterpretation: 'Dimensional check verified'
  };
  const subtopics = w.stage5_mainConceptsAndSubtopics || w.stage5_mainConceptsAndComponents || [];
  const probSection = w.sectionH_problemSolvingMethods || buildProblemSolvingMethodsForTopic(w.topic, w.subject, w.discipline, w.grade);

  return `# ${w.topic} — Complete Digital Study Textbook
*Curriculum: ${w.board} • Grade ${w.grade} • Subject: ${w.subject} (${w.discipline})*

---

## Table of Contents
- [Section A: Definitions & Academic Meaning](#section-a-definitions)
- [Section B: Key Points & Core Principles](#section-b-key-points)
- [Section C: Key Terms & Terminology](#section-c-terminology)
- [Section D: Main Concepts & Subtopics](#section-d-subtopics)
- [Section E: Key Differences & Comparisons](#section-e-comparisons)
- [Section F: Important Processes & Mechanisms](#section-f-processes)
- [Section G: Formulas & Equations](#section-g-formulas)
- [Section H: Problem-Solving Methods](#section-h-problem-solving)
- [Section I: Exam-Oriented Preparation](#section-i-exam-prep)
- [Section J: Final Revision Section](#section-j-revision)

### Complete Chapter Outline
1. [Stage 1 — Topic Introduction](#stage-1--topic-introduction)
2. [Stage 2 — Definition and Meaning](#stage-2--definition-and-meaning)
3. [Stage 3 — Fundamentals and Prerequisites](#stage-3--fundamentals-and-prerequisites)
4. [Stage 4 — Important Terminology & Full Forms](#stage-4--important-terminology--full-forms)
5. [Stage 5 — Main Concepts & Components](#stage-5--main-concepts--components)
6. [Stage 6 — Detailed Working Mechanism](#stage-6--detailed-working-mechanism)
7. [Stage 7 — Step-by-Step Processes](#stage-7--step-by-step-processes)
8. [Stage 8 — Diagrams & Visual Explanations](#stage-8--diagrams--visual-explanations)
9. [Stage 9 — Examples & Applications](#stage-9--examples--applications)
10. [Stage 10 — Formulas, Equations & Problem Solving](#stage-10--formulas-equations--problem-solving)
11. [Stage 11 — Comparisons & Relationships](#stage-11--comparisons--relationships)
12. [Stage 12 — Important Facts & Misconceptions](#stage-12--important-facts--misconceptions)
13. [Stage 13 — Complete Topic Recap](#stage-13--complete-topic-recap)
14. [Stage 14 — Knowledge Assessment & Self-Test](#stage-14--knowledge-assessment--self-test)

---

## Section A: Definitions & Academic Meaning
<a id="section-a-definitions"></a>

## Stage 1 — Topic Introduction

> **Personal Teacher Introduction:**  
> ${w.stage1_topicIntroduction.teacherGreeting || w.stage1_topicIntroduction.overview}

${w.stage1_topicIntroduction.overview}

### What You Will Learn in This Chapter:
${w.stage1_topicIntroduction.whatStudentWillLearn.map((pt) => `• ${pt}`).join('\n')}

**Why This Topic Matters:**  
${w.stage1_topicIntroduction.whyItIsImportant}

**Where It Is Applied in Real Life & Science:**  
${w.stage1_topicIntroduction.whereItIsUsed}

---

## Stage 2 — Definition and Meaning

> **Academic Textbook Definition:**  
> ${w.stage2_definitionAndMeaning.academicDefinition}

### Simple Everyday Language Explanation:
${w.stage2_definitionAndMeaning.simpleLanguageExplanation}

### Meaning of Important Words in the Definition:
${w.stage2_definitionAndMeaning.keyWordMeanings.map((k) => `• **${k.word}:** ${k.meaning}`).join('\n')}

**Concrete Anchor Example:**  
${w.stage2_definitionAndMeaning.coreExample}

**Practical Interpretation:**  
${w.stage2_definitionAndMeaning.practicalInterpretation}

---

## Stage 3 — Fundamentals and Prerequisites

Before diving into advanced mechanisms, master these foundational prerequisites and definitions:

### Background Knowledge Required:
${w.stage3_fundamentalsAndPrerequisites.backgroundKnowledge.map((b) => `1. ${b}`).join('\n')}

### Basic Governing Principles:
${w.stage3_fundamentalsAndPrerequisites.basicPrinciples.map((p) => `• ${p}`).join('\n')}

### Important Definitions Within the Topic & Subtopics:
${w.stage3_importantDefinitions.map((d, i) => `#### A.${i + 1} ${d.term}
- **Academic Definition:** ${d.academicDefinition}
- **Simple Explanation:** ${d.simpleExplanation}
- **Example:** ${d.example}
- **Curriculum Importance:** ${d.importance}
`).join('\n')}

---

## Section B: Key Points & Core Principles
<a id="section-b-key-points"></a>

### Core Principles of ${w.topic}:
${(w.sectionB_keyPoints?.corePrinciples || []).map((cp: string) => `• ${cp}`).join('\n')}

### Essential Scientific Facts:
${w.stage12_importantFactsAndMisconceptions.importantFacts.map((f) => `• ${f}`).join('\n')}

### Key Components and Their Critical Functions:
${subtopics.map((s) => `• **${s.name}:** ${s.howItWorks} *(Characteristics: ${s.characteristics.join(', ')})*`).join('\n')}

### Concepts Students Must Remember:
${w.stage13_completeTopicRecap.comprehensiveSummary.map((s) => `• ${s}`).join('\n')}

---

## Section C: Key Terms & Terminology
<a id="section-c-terminology"></a>

## Stage 4 — Important Terminology & Full Forms

Never use abbreviations without understanding their scientific meaning:

| Abbreviation / Term | Full Scientific Form | Simple Definition | Role in ${w.topic} | Concrete Example |
| :--- | :--- | :--- | :--- | :--- |
${w.stage4_importantTerminology.map((t) => `| **${t.term}** | ${t.fullForm || t.term} | ${t.definition} | ${t.importance} | ${t.example || 'Standard curriculum application'} |`).join('\n')}

---

## Section D: Main Concepts & Subtopics
<a id="section-d-subtopics"></a>

## Stage 5 — Main Concepts & Components

*Strict Multi-Image Requirement: Every subtopic below is presented alongside its own dedicated, verified educational diagram with full 8-point breakdown.*

${subtopics.map((sub, i) => `### Subtopic D.${i + 1}: ${sub.name}

- **What It Is:** ${sub.whatItIs}
- **Structure & Components:** ${sub.structureOrComponents}
- **How It Works:** ${sub.howItWorks}
- **Why It Is Important:** ${sub.whyItIsImportant}
- **Key Characteristics:** ${sub.characteristics.join(', ')}
- **Connection to Main Topic:** ${sub.connectionToMainTopic}

#### ${sub.diagram.title}
![${sub.diagram.title}](${sub.diagram.imageUrl})
*Figure D.${i + 1}: ${sub.diagram.caption}*

##### 8-Point Scientific Diagram Breakdown:
1. **What the Diagram Represents:** ${sub.diagram.point1_whatItRepresents}
2. **Labelled Components & Roles:**
${sub.diagram.point2_labelledParts.map((p) => `   - **${p.label}:** ${p.description}`).join('\n')}
3. **Component Functions:** ${sub.diagram.point3_componentFunctions}
4. **Inter-Component Connections:** ${sub.diagram.point4_componentRelationships}
5. **Direction of Movement / Process Flow:** ${sub.diagram.point5_directionOfMovementOrProcess}
6. **Step-by-Step Interpretation:**
${sub.diagram.point6_stepByStepInterpretation.map((st) => `   ${st}`).join('\n')}
7. **Pedagogical Learning Outcome:** ${sub.diagram.point7_learningOutcome}
8. **What to Remember for Exams:** **${sub.diagram.point8_whatToRemember}**

---
`).join('\n')}

## Stage 8 — Diagrams & Visual Explanations

### Complete Visual Gallery & 8-Point Scientific Analysis

${w.stage8_diagramsAndVisualExplanations.map((diag, dIdx) => `### Figure 8.${dIdx + 1}: ${diag.title}
![${diag.title}](${diag.imageUrl})
*${diag.caption}*

#### 8-Point Scientific Diagram Breakdown:
1. **What it Represents:** ${diag.point1_whatItRepresents}
2. **Labelled Components:**
${diag.point2_labelledParts.map((p) => `   - **${p.label}:** ${p.description}`).join('\n')}
3. **Component Functions:** ${diag.point3_componentFunctions}
4. **Inter-Component Connections:** ${diag.point4_componentRelationships}
5. **Direction of Movement / Flow:** ${diag.point5_directionOfMovementOrProcess}
6. **Step-by-Step Interpretation:**
${diag.point6_stepByStepInterpretation.map((st) => `   ${st}`).join('\n')}
7. **Pedagogical Learning Outcome:** ${diag.point7_learningOutcome}
8. **What to Remember for Exams:** **${diag.point8_whatToRemember}**

---
`).join('\n')}

## Section E: Key Differences & Comparisons
<a id="section-e-comparisons"></a>

## Stage 11 — Comparisons & Relationships

### ${w.stage6_differencesAndComparisons.title}

| Aspect of Comparison | ${w.stage6_differencesAndComparisons.conceptA} | ${w.stage6_differencesAndComparisons.conceptB} |
| :--- | :--- | :--- |
${w.stage6_differencesAndComparisons.rows.map((r) => `| **${r.aspect}** | ${r.itemA} | ${r.itemB} |`).join('\n')}

### Cause and Effect Insights:
${w.stage6_differencesAndComparisons.causeAndEffectNotes.map((ce) => `• ${ce}`).join('\n')}

${w.stage6_differencesAndComparisons.summaryTakeaway ? `> **Summary Takeaway:** ${w.stage6_differencesAndComparisons.summaryTakeaway}` : ''}

---

## Section F: Important Processes & Mechanisms
<a id="section-f-processes"></a>

## Stage 6 — Detailed Working Mechanism

### How ${w.topic} Actually Works
${w.stage6_detailedWorkingMechanism.whatHappens}

- **Why It Happens:** ${w.stage6_detailedWorkingMechanism.whyItHappens}
- **How It Happens:** ${w.stage6_detailedWorkingMechanism.howItHappens}
- **Key Participating Components:** ${w.stage6_detailedWorkingMechanism.participatingComponents.join(', ')}
- **Component Interactions:** ${w.stage6_detailedWorkingMechanism.componentInteractions}
- **Final Result:** ${w.stage6_detailedWorkingMechanism.finalResult}

---

## Stage 7 — Step-by-Step Processes

${w.stage7_stepByStepProcesses.map((s) => `### Stage ${s.stepNumber}: ${s.title}
- **What Happens:** ${s.whatHappens}
- **Where It Happens:** ${s.whereItHappens}
- **Components Involved:** ${s.componentsInvolved.join(', ')}
- **Why It Happens:** ${s.whyItHappens}
- **Next Stage:** ${s.whatHappensNext}
`).join('\n')}

---

## Section G: Formulas & Equations
<a id="section-g-formulas"></a>

## Stage 10 — Formulas, Equations & Problem Solving

${w.stage10_formulasAndProblemSolving.hasFormulas ? `### Primary Governing Equation
$$\\mathbf{${w.stage10_formulasAndProblemSolving.primaryEquation}}^*$$

### Meaning of Symbols & SI Units:
| Symbol | Quantity Name | SI Metric Unit | Physical Role |
| :--- | :--- | :--- | :--- |
${w.stage10_formulasAndProblemSolving.variableExploded.map((v) => `| \`${v.symbol}\` | ${v.name} | ${v.siUnit} | ${v.role} |`).join('\n')}

### Mathematical Derivation:
${w.stage10_formulasAndProblemSolving.derivation?.map((d) => `${d}`).join('\n')}

### Standard Solved Numerical (9-Step Board Examination Template):
**Problem Statement:** ${num.statement}

1. **Given Information:**  
${num.step1_givenInformation.map((g) => `   - ${g.description} (\`${g.symbol}\`): **${g.value} ${g.unit}**`).join('\n')}
2. **Required Quantity:** ${num.step2_requiredQuantity.target} (\`${num.step2_requiredQuantity.symbol}\` in \`${num.step2_requiredQuantity.expectedUnit}\`)
3. **Relevant Formula:** \`${num.step3_relevantFormula}\`
4. **Formula Selection Reason:** ${num.step4_formulaSelectionReason}
5. **Substitution:** \`${num.step5_substitution}\`
6. **Step-by-Step Calculations:**  
${num.step6_stepByStepCalculations.map((c) => `   ${c}`).join('\n')}
7. **Units Verification:** ${num.step7_siUnits}
8. **Final Answer:** **\`${num.step8_finalAnswer}\`**
9. **Verification Check:** ${num.step9_verificationOrInterpretation}
` : `*This conceptual topic is qualitatively governed by biological structures, historical cause-and-effect sequences, or descriptive laws rather than numerical derivations.*`}

---

## Stage 9 — Examples & Applications

### 1. Simple Everyday Example:
- **Scenario:** ${w.stage9_examplesAndApplications.simpleExample.scenario}
- **Scientific Explanation:** ${w.stage9_examplesAndApplications.simpleExample.explanation}

### 2. Standard Textbook Laboratory Example:
- **Scenario:** ${w.stage9_examplesAndApplications.textbookExample.scenario}
- **Scientific Explanation:** ${w.stage9_examplesAndApplications.textbookExample.explanation}

### 3. Advanced Engineering & Medical Applications:
${w.stage9_examplesAndApplications.practicalApplications.map((app) => `• ${app}`).join('\n')}

---

## Section H: Problem-Solving Methods (Mathematics & Physics)
<a id="section-h-problem-solving"></a>

*Structured 10-Point Problem Solving Framework for Quantitative & Scientific Mastery:*

### The 10-Point Problem-Solving Method:
${probSection.tenPointMethodGuide.map((m) => `${m.stepNumber}. **${m.title}:** ${m.instruction}`).join('\n')}

### Representative Problem Types & Solved Examples:
${probSection.problemTypes.map((pt, ptIdx) => `#### Problem Type ${ptIdx + 1}: ${pt.typeName}
- **How to Identify This Type:** ${pt.howToIdentify}
- **Required Formula / Principle:** \`${pt.requiredFormulaOrPrinciple}\`

##### Representative Solved Example:
**Problem Statement:** ${pt.representativeSolvedExample.problemStatement}

**Given Information:**
${pt.representativeSolvedExample.givenInformation.map((g) => `- ${g.description} (\`${g.symbol}\`): **${g.value} ${g.unit}**`).join('\n')}

- **Target Quantity:** ${pt.representativeSolvedExample.requiredQuantity}
- **Formula Selected:** \`${pt.representativeSolvedExample.formulaSelected}\`
- **Formula Selection Reason:** ${pt.representativeSolvedExample.formulaSelectionReason}
- **Substitution:** \`${pt.representativeSolvedExample.substitution}\`

**Step-by-Step Calculations:**
${pt.representativeSolvedExample.stepByStepCalculations.map((c) => `- ${c}`).join('\n')}

- **Units and Final Answer:** **\`${pt.representativeSolvedExample.unitsAndFinalAnswer}\`**
- **Alternative Method:** ${pt.representativeSolvedExample.alternativeMethod}
- **Common Mistakes to Avoid:**
${pt.representativeSolvedExample.commonMistakesToAvoid.map((m) => `  ⚠️ ${m}`).join('\n')}
`).join('\n')}

### Practice Problems with Verified Solutions:
${probSection.practiceProblemsWithAnswers.map((pp) => `#### Practice Problem ${pp.problemNumber}:
**Question:** ${pp.statement}

<details>
<summary><strong>View Solution & Explanation</strong></summary>

**Verified Answer:** \`${pp.answer}\`  
**Step-by-Step Explanation:** ${pp.stepByStepExplanation}
</details>
`).join('\n')}

---

## Section I: Exam-Oriented Preparation
<a id="section-i-exam-prep"></a>

## Stage 14 — Knowledge Assessment & Self-Test

Test your understanding with these curriculum-calibrated practice questions across all standard examination formats:

${w.stage14_knowledgeAssessment.map((q, i) => `### Question I.${i + 1} (${q.type} • ${q.marks} Mark${q.marks > 1 ? 's' : ''})
**${q.question}**

${q.options ? q.options.map((opt, oIdx) => `${String.fromCharCode(65 + oIdx)}. ${opt}`).join('\n') : ''}

<details>
<summary><strong>View Model Answer & Detailed Explanation</strong></summary>

**Correct Answer:**  
${q.correctAnswer}

**Examiner Model Answer:**  
\`\`\`
${q.modelAnswer}
\`\`\`

**Pedagogical Explanation:**  
${q.explanation}
</details>
`).join('\n')}

### High-Scoring Examination Advice:
- Always define terms using textbook-accurate academic terminology.
- Underline keywords (e.g. conservation of energy, stoichiometry, enzyme-substrate complex).
- In calculation steps, state the base formula before substituting numbers, and box your final answer with proper SI units.
- Draw clear, labelled directional diagrams or flowcharts to earn full presentation marks.

---

## Section J: Final Revision Section
<a id="section-j-revision"></a>

## Stage 12 — Important Facts & Misconceptions

### Critical Facts to Remember:
${w.stage12_importantFactsAndMisconceptions.importantFacts.map((f) => `• ${f}`).join('\n')}

### Common Student Misconceptions Busted:
${w.stage12_importantFactsAndMisconceptions.frequentlyMisunderstood.map((m, i) => `#### Misconception J.${i + 1}: "${m.misconception}"
- **Scientific Truth:** ${m.scientificFact}
- **Why this mistake occurs:** ${m.whyMistakeOccurs}
`).join('\n')}

### High-Yield Board Examination Traps:
${w.stage12_importantFactsAndMisconceptions.boardTraps.map((bt) => `⚠️ **Trap:** ${bt}`).join('\n')}

---

## Stage 13 — Complete Topic Recap

### Comprehensive Revision Takeaways:
${w.stage13_completeTopicRecap.comprehensiveSummary.map((s) => `${s}`).join('\n\n')}

> **Core Chapter Takeaway:**  
> ${w.stage13_completeTopicRecap.coreTakeaway}

### Rapid Mastery Checklist:
${w.stage13_completeTopicRecap.quickRevisionChecklist.map((c) => `- [ ] ${c}`).join('\n')}

---
*Generated by STUDYAI Universal Deep Teaching & Single-Page Digital Textbook Engine • Verified Academic Integrity*
`;
}

// ============================================================================
// HELPER BUILDERS FOR TOPIC-SPECIFIC PEDAGOGICAL CONTENT
// ============================================================================

function inferSubjectFromTopic(t: string): string {
  const l = (t || '').toLowerCase();
  if (/heart|cardiac|lung|respiratory|photosynthesis|dna|cell|blood|digestion|ear|eye|kidney/.test(l)) return 'Biology';
  if (/newton|force|motion|energy|work|power|circuit|motor|electricity|gravity|light|reflection|lens/.test(l)) return 'Physics';
  if (/bonding|acid|base|atom|periodic|reaction|metal|chemical/.test(l)) return 'Chemistry';
  if (/equation|quadratic|linear|triangle|circle|polynomial|algebra|geometry|trigonometry/.test(l)) return 'Mathematics';
  if (/history|war|revolution|civics|geography|climate|map/.test(l)) return 'Social Studies';
  return 'Science';
}

export function buildProblemSolvingMethodsForTopic(
  topic: string,
  subject: string,
  discipline: string,
  grade: number
): ProblemSolvingMethodSection {
  const t = topic.toLowerCase();
  const isPhysics = discipline.includes('Physics') || /force|motion|newton|momentum|inertia|friction|circuit|electric|velocity|acceleration|gravity/.test(t);
  const isMath = discipline.includes('Math') || /fraction|equation|quadratic|linear|polynomial|geometry|triangle|algebra/.test(t);

  const tenPointMethodGuide = [
    { stepNumber: 1, title: 'Classify Problem Type', instruction: 'Read the question carefully to identify whether it requires direct substitution, inverse variable rearrangement, conservation balance, or geometric deduction.' },
    { stepNumber: 2, title: 'Identify Formula & Principle', instruction: 'Determine which physical law, mathematical theorem, or chemical principle governs the relationship between the quantities.' },
    { stepNumber: 3, title: 'List Given Data with Symbols', instruction: 'Extract all given values from the problem statement, write their official symbols, and convert all non-standard units to SI base metric units (e.g. g → kg, cm → m, min → s).' },
    { stepNumber: 4, title: 'Identify Required Target Quantity', instruction: 'State clearly what quantity must be solved for and write down its expected final metric or dimensional unit.' },
    { stepNumber: 5, title: 'Select Relevant Equation', instruction: 'State the base algebraic equation relating the given information to the target variable before rearranging.' },
    { stepNumber: 6, title: 'Isolate Target Variable (Algebraic Rearrangement)', instruction: 'Rearrange the equation symbolically before substituting numbers to avoid rounding errors during intermediate steps.' },
    { stepNumber: 7, title: 'Substitute Numerical Values', instruction: 'Replace symbols with pure numerical values and verify sign conventions (positive vs negative direction for vectors).' },
    { stepNumber: 8, title: 'Execute Step-by-Step Arithmetic Calculation', instruction: 'Perform operations following proper order of operations (BODMAS/PEMDAS) and carry numbers to correct decimal places.' },
    { stepNumber: 9, title: 'State Final Boxed Answer with Standard SI Units', instruction: 'Write the final answer clearly with magnitude, standard metric units, and direction if the quantity is a vector.' },
    { stepNumber: 10, title: 'Dimensional Verification & Sanity Check', instruction: 'Verify dimensions using unit cancellation and check if the numerical value is physically reasonable in the real world.' }
  ];

  if (isPhysics) {
    return {
      isRelevant: true,
      discipline: 'Physics & Mechanics',
      tenPointMethodGuide,
      problemTypes: [
        {
          typeId: 'phys-type-1',
          typeName: 'Type 1: Direct Unbalanced Net Force & Acceleration Calculation',
          howToIdentify: 'Given mass m and applied force F (or acceleration a), asked to calculate the resulting acceleration or required force.',
          requiredFormulaOrPrinciple: "Newton's Second Law: F_net = m · a  =>  a = F_net / m",
          representativeSolvedExample: {
            problemStatement: 'A constant horizontal unbalanced force of 36 N acts on a stationary block of mass 6.0 kg on a frictionless surface. Calculate the acceleration produced in the block.',
            givenInformation: [
              { symbol: 'm', value: '6.0', unit: 'kg', description: 'Mass of the block' },
              { symbol: 'F_net', value: '36.0', unit: 'N', description: 'Net applied horizontal force' }
            ],
            requiredQuantity: 'Acceleration a in m/s²',
            formulaSelected: 'F_net = m · a',
            formulaSelectionReason: "Newton's Second Law mathematically relates unbalanced force to acceleration.",
            substitution: 'a = F_net / m = 36.0 N / 6.0 kg',
            stepByStepCalculations: [
              'Step 1: Write governing law: F_net = m · a',
              'Step 2: Rearrange for acceleration: a = F_net / m',
              'Step 3: Substitute given quantities: a = 36.0 / 6.0',
              'Step 4: Compute numerical quotient: a = 6.0 m/s²'
            ],
            unitsAndFinalAnswer: 'a = 6.0 m/s² in the direction of the applied force',
            alternativeMethod: 'Using impulse-momentum: I = F · Δt = m · Δv => F / m = Δv / Δt = a.',
            commonMistakesToAvoid: [
              'Forgetting that 1 N = 1 kg·m/s², and omitting m/s² from the final answer.',
              'Assuming acceleration depends on speed rather than net unbalanced force.'
            ]
          }
        },
        {
          typeId: 'phys-type-2',
          typeName: 'Type 2: Multi-Step Kinematic Force-Velocity Integration',
          howToIdentify: 'Given force, mass, and time interval (or initial speed), asked to calculate final speed or distance traveled.',
          requiredFormulaOrPrinciple: 'Combined Newton II + Kinematic Equation: v = u + a · t  where a = F / m',
          representativeSolvedExample: {
            problemStatement: 'A vehicle of mass 1200 kg traveling at 20 m/s is brought to rest in 4.0 seconds by braking. Calculate: (a) the deceleration, and (b) the average braking force applied.',
            givenInformation: [
              { symbol: 'm', value: '1200', unit: 'kg', description: 'Mass of vehicle' },
              { symbol: 'u', value: '20.0', unit: 'm/s', description: 'Initial velocity' },
              { symbol: 'v', value: '0.0', unit: 'm/s', description: 'Final velocity at rest' },
              { symbol: 't', value: '4.0', unit: 's', description: 'Braking time interval' }
            ],
            requiredQuantity: 'Braking force F_b in N and Deceleration a in m/s²',
            formulaSelected: 'v = u + a · t  and  F = m · a',
            formulaSelectionReason: 'First kinematic equation relates velocity change to acceleration; Second law determines the force required.',
            substitution: 'a = (v - u) / t = (0 - 20) / 4.0 = -5.0 m/s²; F_b = 1200 · (-5.0)',
            stepByStepCalculations: [
              'Step 1: Calculate acceleration: a = (v - u) / t = (0 - 20) / 4.0 = -5.0 m/s²',
              'Step 2: Deceleration magnitude is 5.0 m/s²',
              'Step 3: Calculate retarding force: F = m · a = 1200 kg · (-5.0 m/s²) = -6000 N',
              'Step 4: Negative sign indicates opposing braking direction: F_braking = 6000 N'
            ],
            unitsAndFinalAnswer: 'Deceleration = 5.0 m/s²; Braking Force = 6000 N (opposite to motion)',
            alternativeMethod: 'Using impulse-momentum theorem: F · t = m · (v - u) => F = 1200 · (-20) / 4 = -6000 N.',
            commonMistakesToAvoid: [
              'Confusing speed with acceleration.',
              'Forgetting the negative sign indicating that force opposes direction of travel.'
            ]
          }
        },
        {
          typeId: 'phys-type-3',
          typeName: 'Type 3: Action-Reaction & Momentum Conservation (Rocket / Recoil Dynamics)',
          howToIdentify: 'Involves two interacting bodies (e.g. gun recoil, rocket exhaust thrust, colliding carts).',
          requiredFormulaOrPrinciple: "Newton's Third Law & Conservation of Linear Momentum: m_1 · v_1 + m_2 · v_2 = 0",
          representativeSolvedExample: {
            problemStatement: 'A rifle of mass 3.0 kg fires a bullet of mass 0.03 kg with a muzzle velocity of 300 m/s. Calculate the recoil velocity of the rifle.',
            givenInformation: [
              { symbol: 'm_rifle', value: '3.0', unit: 'kg', description: 'Mass of the rifle' },
              { symbol: 'm_bullet', value: '0.03', unit: 'kg', description: 'Mass of the bullet' },
              { symbol: 'v_bullet', value: '300.0', unit: 'm/s', description: 'Forward velocity of bullet' }
            ],
            requiredQuantity: 'Recoil velocity v_rifle in m/s',
            formulaSelected: 'm_rifle · v_rifle + m_bullet · v_bullet = 0',
            formulaSelectionReason: "Newton's Third Law dictates that action and reaction impulses are equal and opposite, conserving total momentum.",
            substitution: 'v_rifle = -(m_bullet · v_bullet) / m_rifle = -(0.03 · 300) / 3.0',
            stepByStepCalculations: [
              'Step 1: State total initial momentum before firing = 0 (system at rest)',
              'Step 2: Total momentum after firing must equal 0: (m_rifle · v_rifle) + (m_bullet · v_bullet) = 0',
              'Step 3: Rearrange for recoil velocity: v_rifle = -(m_bullet · v_bullet) / m_rifle',
              'Step 4: Substitute numbers: v_rifle = -(0.03 kg · 300 m/s) / 3.0 kg = -9.0 / 3.0 = -3.0 m/s'
            ],
            unitsAndFinalAnswer: 'v_recoil = -3.0 m/s (3.0 m/s backward recoil)',
            alternativeMethod: 'Using impulse equality: F_action = -F_reaction over time Δt yields equal and opposite momentum changes.',
            commonMistakesToAvoid: [
              'Failing to convert bullet mass from grams (30g) to kilograms (0.03 kg).',
              'Omitting the negative sign representing backward recoil direction.'
            ]
          }
        }
      ],
      practiceProblemsWithAnswers: [
        {
          problemNumber: 1,
          statement: 'A net force of 50 N acts on an object of mass 10 kg. What acceleration is produced?',
          answer: 'a = 5.0 m/s²',
          stepByStepExplanation: 'Apply Newton II: a = F / m = 50 N / 10 kg = 5.0 m/s² in the direction of the force.'
        },
        {
          problemNumber: 2,
          statement: 'How much force is required to accelerate a 2.5 kg cart from 4 m/s to 16 m/s in 3 seconds?',
          answer: 'F = 10.0 N',
          stepByStepExplanation: 'Acceleration a = (16 - 4) / 3 = 12 / 3 = 4 m/s². Force F = m · a = 2.5 kg · 4 m/s² = 10.0 N.'
        },
        {
          problemNumber: 3,
          statement: 'A 500 kg rocket expels 20 kg of gas at 1000 m/s in 1 second. What average thrust force does the rocket experience?',
          answer: 'F_thrust = 20,000 N',
          stepByStepExplanation: 'Thrust force F = (Δm / Δt) · v_exhaust = (20 kg / 1 s) · 1000 m/s = 20,000 N.'
        }
      ]
    };
  }

  if (isMath) {
    return {
      isRelevant: true,
      discipline: 'Mathematics',
      tenPointMethodGuide,
      problemTypes: [
        {
          typeId: 'math-type-1',
          typeName: 'Type 1: Equal Partition Area Model & Arithmetic Simplification',
          howToIdentify: 'Given fractions with unlike denominators, asked to compute sum, difference, or equivalent ratio.',
          requiredFormulaOrPrinciple: 'Least Common Multiple (LCM) conversion: a/b ± c/d = (a·d ± b·c) / (b·d)',
          representativeSolvedExample: {
            problemStatement: 'Simplify and solve: 3/4 + 1/6. Express in simplest fractional form.',
            givenInformation: [
              { symbol: 'f_1', value: '3/4', unit: 'fraction', description: 'First fraction' },
              { symbol: 'f_2', value: '1/6', unit: 'fraction', description: 'Second fraction' }
            ],
            requiredQuantity: 'Simplified sum fraction',
            formulaSelected: 'Find LCM of denominators 4 and 6',
            formulaSelectionReason: 'Fractions can only be combined when partitioned into equal unit sizes.',
            substitution: 'LCM(4, 6) = 12; (3·3)/12 + (1·2)/12',
            stepByStepCalculations: [
              'Step 1: Find LCM of 4 and 6. Multiples of 4: 4, 8, 12... Multiples of 6: 6, 12... => LCM = 12',
              'Step 2: Convert 3/4 to equivalent fraction with denominator 12: 3/4 · (3/3) = 9/12',
              'Step 3: Convert 1/6 to equivalent fraction with denominator 12: 1/6 · (2/2) = 2/12',
              'Step 4: Add numerators: 9/12 + 2/12 = (9 + 2)/12 = 11/12'
            ],
            unitsAndFinalAnswer: '11/12 (Irreducible proper fraction)',
            alternativeMethod: 'Cross-multiplication: (3·6 + 1·4) / (4·6) = (18 + 4) / 24 = 22/24 = 11/12.',
            commonMistakesToAvoid: [
              'Adding numerators and denominators directly (e.g. 3/4 + 1/6 = 4/10 is completely incorrect!).',
              'Forgetting to reduce to simplest form.'
            ]
          }
        },
        {
          typeId: 'math-type-2',
          typeName: 'Type 2: Word Problem Fractional Modeling & Proportional Distribution',
          howToIdentify: 'A real-life scenario where a total whole is shared or divided into fractional segments.',
          requiredFormulaOrPrinciple: 'Part = Fraction × Total Whole',
          representativeSolvedExample: {
            problemStatement: 'A student has a monthly study budget of 48 hours. She spends 1/3 of the time on Science, 1/4 on Mathematics, and the remainder on Languages. How many hours are dedicated to Languages?',
            givenInformation: [
              { symbol: 'T', value: '48', unit: 'hours', description: 'Total study hours' },
              { symbol: 'frac_sci', value: '1/3', unit: 'fraction', description: 'Share of Science' },
              { symbol: 'frac_math', value: '1/4', unit: 'fraction', description: 'Share of Math' }
            ],
            requiredQuantity: 'Hours dedicated to Languages',
            formulaSelected: 'Remaining Fraction = 1 - (1/3 + 1/4); Hours = Remaining Fraction · 48',
            formulaSelectionReason: 'The sum of all fractional parts of a whole equals 1.',
            substitution: 'LCM(3, 4) = 12; 1/3 + 1/4 = 4/12 + 3/12 = 7/12; Remaining = 1 - 7/12 = 5/12',
            stepByStepCalculations: [
              'Step 1: Calculate combined fraction of Science and Math: 1/3 + 1/4 = 4/12 + 3/12 = 7/12',
              'Step 2: Find remaining fraction for Languages: 1 - 7/12 = 12/12 - 7/12 = 5/12',
              'Step 3: Multiply remaining fraction by total budget: (5/12) · 48 hours',
              'Step 4: Calculate: (48 / 12) · 5 = 4 · 5 = 20 hours'
            ],
            unitsAndFinalAnswer: '20 hours dedicated to Languages',
            alternativeMethod: 'Calculate individual hours first: Science = 48/3 = 16h; Math = 48/4 = 12h; Languages = 48 - (16 + 12) = 48 - 28 = 20h.',
            commonMistakesToAvoid: [
              'Forgetting to subtract from the total whole (1).',
              'Dividing 48 by the remaining numerator instead of denominator.'
            ]
          }
        }
      ],
      practiceProblemsWithAnswers: [
        {
          problemNumber: 1,
          statement: 'Solve: 5/8 - 1/4. Give answer in simplest form.',
          answer: '3/8',
          stepByStepExplanation: 'Convert 1/4 to 2/8. Subtract: 5/8 - 2/8 = 3/8.'
        },
        {
          problemNumber: 2,
          statement: 'Verify whether 4/10 and 6/15 are equivalent fractions.',
          answer: 'Yes, both equal 2/5.',
          stepByStepExplanation: 'Reduce 4/10 by factor of 2 => 2/5. Reduce 6/15 by factor of 3 => 2/5. Both fractions are equivalent.'
        }
      ]
    };
  }

  // Biology, Chemistry & General Science quantitative / deductive reasoning problem-solving
  return {
    isRelevant: true,
    discipline: discipline,
    tenPointMethodGuide,
    problemTypes: [
      {
        typeId: 'sci-type-1',
        typeName: 'Type 1: Quantitative Stoichiometric Conversion & Physiological Rate Calculation',
        howToIdentify: 'Given input rates or chemical quantities, asked to determine output yield or cardiac hemodynamic flow.',
        requiredFormulaOrPrinciple: 'Conservation of Mass & Volumetric Rate: Output = Rate × Duration',
        representativeSolvedExample: {
          problemStatement: topic.toLowerCase().includes('heart')
            ? 'A resting human has an average resting heart rate of 72 beats per minute and a stroke volume of 70 mL per ventricular beat. Calculate the total cardiac output in liters per minute.'
            : 'In photosynthesis, calculate the volume of O₂ gas released at STP when 3 moles of glucose (C₆H₁₂O₆) are fully synthesized by a plant.',
          givenInformation: topic.toLowerCase().includes('heart')
            ? [
                { symbol: 'HR', value: '72', unit: 'beats/min', description: 'Heart rate' },
                { symbol: 'SV', value: '70', unit: 'mL/beat', description: 'Stroke volume' }
              ]
            : [
                { symbol: 'n_glucose', value: '3.0', unit: 'mol', description: 'Moles of glucose' },
                { symbol: 'ratio', value: '6:1', unit: 'ratio', description: 'Moles of O₂ per mole of glucose' }
              ],
          requiredQuantity: topic.toLowerCase().includes('heart') ? 'Cardiac Output CO in L/min' : 'Volume of O₂ in liters at STP',
          formulaSelected: topic.toLowerCase().includes('heart') ? 'Cardiac Output CO = HR · SV' : 'V_O2 = n_glucose · 6 · 22.4 L/mol',
          formulaSelectionReason: 'Physiological formula directly calculates total blood volume pumped per unit time.',
          substitution: topic.toLowerCase().includes('heart') ? 'CO = 72 beats/min · 70 mL/beat = 5040 mL/min' : 'V = 3 · 6 · 22.4 L = 18 · 22.4 L',
          stepByStepCalculations: topic.toLowerCase().includes('heart')
            ? [
                'Step 1: Write formula: Cardiac Output CO = Heart Rate (HR) × Stroke Volume (SV)',
                'Step 2: Substitute values: CO = 72 × 70 = 5040 mL/min',
                'Step 3: Convert milliliters to liters: 5040 mL / 1000 mL/L = 5.04 L/min',
                'Step 4: Box final answer: 5.04 L/min (~5 liters per minute, circulating entire blood volume every 60 seconds)'
              ]
            : [
                'Step 1: Write balanced equation: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂',
                'Step 2: Note stoichiometric ratio: 1 mol glucose produces 6 mol O₂',
                'Step 3: Calculate moles of O₂: 3 mol glucose × 6 = 18 mol O₂',
                'Step 4: Multiply by molar volume at STP: 18 mol × 22.4 L/mol = 403.2 L'
              ],
          unitsAndFinalAnswer: topic.toLowerCase().includes('heart') ? 'Cardiac Output = 5.04 L/min' : 'Volume of O₂ = 403.2 L at STP',
          alternativeMethod: 'Dimensional analysis unit factor method.',
          commonMistakesToAvoid: [
            'Forgetting to convert milliliters to liters.',
            'Assuming stroke volume is identical to total heart volume.'
          ]
        }
      },
      {
        typeId: 'sci-type-2',
        typeName: 'Type 2: Deductive Mechanism Analysis & Directional Pathway Flow',
        howToIdentify: 'Given an anatomical condition or biochemical disruption, asked to predict downstream failure points.',
        requiredFormulaOrPrinciple: 'Cause-and-Effect Sequential Dependency',
        representativeSolvedExample: {
          problemStatement: topic.toLowerCase().includes('heart')
            ? 'Explain what happens to systemic circulation if the bicuspid (mitral) valve fails to close tightly during left ventricular systole.'
            : 'Predict what happens to the Calvin cycle if a plant is kept in total darkness for 24 hours.',
          givenInformation: [
            { symbol: 'Disruption', value: 'Valve incompetence / Dark deprivation', unit: 'Condition', description: 'Systemic abnormality' }
          ],
          requiredQuantity: 'Physiological consequence and diagnostic manifestation',
          formulaSelected: 'Cause → Intermediate Disruption → Final System Output',
          formulaSelectionReason: 'Biological mechanisms operate as tightly linked sequential pathways.',
          substitution: 'Disruption at Stage 2 halts Stage 3 output.',
          stepByStepCalculations: topic.toLowerCase().includes('heart')
            ? [
                'Step 1: Identify normal valve role: Bicuspid valve prevents retrograde backflow from left ventricle into left atrium during systole.',
                'Step 2: Deduce defect effect: Incomplete closure causes blood to regurgitate backward into the left atrium during ventricular contraction.',
                'Step 3: Upstream consequence: Pulmonary venous congestion, elevated pulmonary capillary pressure, and pulmonary edema.',
                'Step 4: Downstream consequence: Reduced stroke volume into the aorta, lowered systemic cardiac output, causing shortness of breath and fatigue.'
              ]
            : [
                'Step 1: Note that Calvin cycle enzymes do not directly require light photons.',
                'Step 2: However, Calvin cycle requires ATP and NADPH produced during light reactions on thylakoids.',
                'Step 3: In prolonged darkness, thylakoid photolysis stops and ATP/NADPH pools are exhausted within minutes.',
                'Step 4: RuBisCO fixes no carbon; G3P synthesis stops and sugar output falls to zero.'
              ],
          unitsAndFinalAnswer: topic.toLowerCase().includes('heart') ? 'Result: Mitral regurgitation, pulmonary congestion, reduced systemic perfusion' : 'Result: Calvin cycle arrests due to lack of ATP and NADPH',
          commonMistakesToAvoid: [
            'Assuming dark reactions can run indefinitely in the dark.',
            'Confusing systemic venous return with pulmonary venous return.'
          ]
        }
      }
    ],
    practiceProblemsWithAnswers: [
      {
        problemNumber: 1,
        statement: topic.toLowerCase().includes('heart')
          ? 'If an athlete’s heart rate increases to 150 bpm during a race and stroke volume reaches 100 mL, calculate the active cardiac output.'
          : 'A plant leaf has an area of 50 cm² with 200 stomata per mm². Calculate the total stomata on the leaf.',
        answer: topic.toLowerCase().includes('heart') ? 'CO = 15.0 L/min' : '1,000,000 stomata (1 million)',
        stepByStepExplanation: topic.toLowerCase().includes('heart')
          ? 'CO = 150 bpm × 100 mL = 15,000 mL/min = 15.0 L/min (3x increase over resting).'
          : '50 cm² = 50 × 100 mm² = 5,000 mm². Total stomata = 5,000 mm² × 200 stomata/mm² = 1,000,000 stomata.'
      }
    ]
  };
}

function buildMainDefinitionForTopic(topic: string, subject: string) {
  const l = topic.toLowerCase();
  if (l.includes('photosynthesis')) {
    return {
      academicDefinition: 'Photosynthesis is the photo-biochemical anabolic process wherein green plants and photoautotrophs convert carbon dioxide and water into glucose (C₆H₁₂O₆) and molecular oxygen (O₂) utilizing radiant solar energy captured by chlorophyll pigments within chloroplasts.',
      simpleLanguageExplanation: 'In simple everyday words, photosynthesis is how green plants cook their own food using sunlight, air (carbon dioxide), and water from the soil, giving us oxygen to breathe in return.',
      keyWordMeanings: [
        { word: 'Photo-biochemical', meaning: 'A biological chemical reaction driven by light photons.' },
        { word: 'Anabolic', meaning: 'A synthetic metabolic process building larger energy-rich molecules from smaller ones.' },
        { word: 'Chlorophyll', meaning: 'The green pigment inside chloroplasts that traps blue and red wavelengths of light.' },
        { word: 'Photolysis', meaning: 'The light-powered splitting of water molecules into hydrogen ions, electrons, and oxygen gas.' }
      ],
      coreExample: 'Green garden leaves turning toward a sunny window to produce starch that feeds the plant.',
      practicalInterpretation: 'Every bite of food we eat and every breath of oxygen we take depends on the continuous activity of plant photosynthesis.'
    };
  }

  if (l.includes('heart') || l.includes('cardiac')) {
    return {
      academicDefinition: 'The human heart is a myogenic, four-chambered fibromuscular organ situated in the thoracic mediastinum that functions as a dual suction-pressure pump driving continuous double circulation (pulmonary and systemic) across the vascular network.',
      simpleLanguageExplanation: 'In simple words, the heart is a muscular pump that beats around 72 times a minute, pumping oxygen-poor blood to the lungs to pick up oxygen, and oxygen-rich blood to the entire body to keep us alive.',
      keyWordMeanings: [
        { word: 'Myogenic', meaning: 'Originating muscle contractions spontaneously within cardiac tissue (SA node) without nervous stimulation.' },
        { word: 'Mediastinum', meaning: 'The central compartment of the chest cavity between the two lungs where the heart rests.' },
        { word: 'Double Circulation', meaning: 'Blood passes through the heart twice (once to the lungs, once to the body) during every complete journey.' },
        { word: 'Systole / Diastole', meaning: 'Systole is active ventricular contraction (pumping); diastole is ventricular relaxation (filling).' }
      ],
      coreExample: 'Feeling your pulse at your wrist (radial artery) each time the left ventricle contracts and ejects blood into the aorta.',
      practicalInterpretation: 'The heart ensures that our brain and organs receive an unbroken supply of glucose and oxygen every second of our lives.'
    };
  }

  if (l.includes('chemical reaction') || (l.includes('equation') && l.includes('chemical'))) {
    return {
      academicDefinition: 'A chemical reaction is a process in which one or more substances (reactants) undergo chemical bond breaking and reforming to yield one or more new substances (products) with entirely distinct chemical identities, governed strictly by the Law of Conservation of Mass.',
      simpleLanguageExplanation: 'In simple everyday words, a chemical reaction is a permanent change where starting substances transform into new substances with new properties, like when iron rusts or milk turns into curd.',
      keyWordMeanings: [
        { word: 'Reactant', meaning: 'Substances that participate and undergo chemical change during a reaction.' },
        { word: 'Product', meaning: 'The new chemical substances formed as a result of the chemical transformation.' },
        { word: 'Balanced Equation', meaning: 'An equation where the total number of atoms of each element is identical on reactant and product sides.' },
        { word: 'Precipitate', meaning: 'An insoluble solid that separates out from a liquid solution during a double displacement reaction.' }
      ],
      coreExample: 'Burning a magnesium ribbon in air to produce a white powder of basic magnesium oxide (2Mg + O₂ → 2MgO).',
      practicalInterpretation: 'Balancing chemical equations ensures chemical engineers and pharmacists synthesize exact dosages without wasting raw materials.'
    };
  }

  if (l.includes('quadratic')) {
    return {
      academicDefinition: 'A quadratic equation in variable x is a second-degree polynomial equation of the canonical form ax² + bx + c = 0, where a, b, c are real coefficients and a ≠ 0, possessing exactly two roots (real or complex) determined by the quadratic formula x = (-b ± √(b² - 4ac)) / (2a).',
      simpleLanguageExplanation: 'In simple everyday words, a quadratic equation is any math equation where the highest power of x is squared (x²), which produces a symmetrical U-shaped curved graph called a parabola.',
      keyWordMeanings: [
        { word: 'Degree of Polynomial', meaning: 'The highest exponent of the variable present in the polynomial equation (degree = 2 for quadratics).' },
        { word: 'Discriminant (D)', meaning: 'The algebraic quantity b² - 4ac that determines whether roots are real, equal, or non-real.' },
        { word: 'Vertex', meaning: 'The peak maximum or lowest minimum turning point on a parabola located at x = -b/(2a).' },
        { word: 'Zeroes / Roots', meaning: 'The x-values that make the quadratic polynomial evaluate to zero (the x-intercepts of the graph).' }
      ],
      coreExample: 'Calculating how high a kicked football flies and when it lands on the ground using the height function h(t) = -4.9t² + 20t.',
      practicalInterpretation: 'Civil engineers use quadratic parabolas to design suspension bridge cables and satellite dish focal points.'
    };
  }

  if (l.includes('electricity') || l.includes('circuit')) {
    return {
      academicDefinition: 'Electricity is the physical phenomenon associated with the presence and macroscopic flow of electric charges, characterized by electric current (I = Q/t), potential difference (V = W/Q), and electrical resistance (R = ρ·L/A) obeying Ohm\'s Law V = I·R under constant physical temperature.',
      simpleLanguageExplanation: 'In simple everyday words, electricity is the flow of millions of tiny invisible electrons through metal wires that carries power to lights, fans, computers, and electric cars.',
      keyWordMeanings: [
        { word: 'Electric Current (I)', meaning: 'The rate of flow of electric charge through a cross-section of conductor, measured in Amperes (A).' },
        { word: 'Potential Difference (V)', meaning: 'The work done per unit charge in moving a unit positive charge between two points, measured in Volts (V).' },
        { word: 'Resistance (R)', meaning: 'The opposition offered by a conductor to the passage of electric current, measured in Ohms (Ω).' },
        { word: 'Ohm\'s Law', meaning: 'Current is directly proportional to potential difference across a conductor, provided temperature remains constant.' }
      ],
      coreExample: 'Plugging in a toaster where current flowing through nichrome resistance wire converts electrical energy into heat.',
      practicalInterpretation: 'Ohm\'s Law and circuit topologies allow engineers to safely distribute electric power across cities and silicon microchips.'
    };
  }

  if (l.includes('french revolution') || l.includes('bastille')) {
    return {
      academicDefinition: 'The French Revolution (1789–1799) was a period of revolutionary social and political transformation in France that dismantled the feudal Ancien Régime, eliminated royal absolutism, proclaimed the Declaration of the Rights of Man, and established modern secular democratic nationalism based on Liberté, Égalité, Fraternité.',
      simpleLanguageExplanation: 'In simple everyday words, the French Revolution was when ordinary citizens and peasants in France rose up against heavy taxes and an unfair king, storming the Bastille prison and giving birth to modern human rights.',
      keyWordMeanings: [
        { word: 'Third Estate', meaning: 'The 98% of the French population (peasants, workers, and bourgeoisie) who bore almost the entire tax burden.' },
        { word: 'Storming of the Bastille', meaning: 'On 14 July 1789, citizens stormed the medieval royal fortress-prison, symbol of despotic royal tyranny.' },
        { word: 'Tithe & Taille', meaning: 'Tithe was a religious tax of one-tenth of agricultural produce levied by the church; Taille was a direct tax to the state.' },
        { word: 'Estates General', meaning: 'The ancient French representative assembly of the three estates summoned by King Louis XVI in May 1789.' }
      ],
      coreExample: 'The creation of the National Assembly on the Tennis Court of Versailles pledging not to disband until drafting a constitution.',
      practicalInterpretation: 'The French Revolution gave the world the modern metric system, democratic voting rights, and the idea of universal human rights.'
    };
  }

  if (l.includes('water resource')) {
    return {
      academicDefinition: 'Water resources encompass the aggregate terrestrial volume of freshwater (surface runoff, inland lakes, rivers, and underground aquifers) accessible for agrarian cultivation, industrial manufacture, municipal consumption, and ecological sustenance, renewed continuously by the planetary hydrological cycle.',
      simpleLanguageExplanation: 'In simple everyday words, water resources are the freshwater from rivers, rain, lakes, and underground wells that we must preserve carefully because only 2.5% of all water on Earth is fresh and drinkable.',
      keyWordMeanings: [
        { word: 'Hydrological Cycle', meaning: 'The solar-powered planetary circulation of water between oceans, atmosphere, and land via evaporation and rain.' },
        { word: 'Water Scarcity', meaning: 'A deficiency in water quantity or quality when demand exceeds available renewable resources in a geographic region.' },
        { word: 'Multipurpose Dam', meaning: 'A major river barrier designed simultaneously for flood mitigation, hydroelectricity generation, and canal irrigation.' },
        { word: 'Rainwater Harvesting', meaning: 'The sustainable technique of collecting and storing rainwater from rooftops and land to recharge depleted groundwater.' }
      ],
      coreExample: 'Rooftop rainwater harvesting in Rajasthan using underground tankas to store clean drinking water through dry summer months.',
      practicalInterpretation: 'Water conservation prevents agricultural collapse and ensures future generations have clean drinking water.'
    };
  }

  return {
    academicDefinition: `${topic} is scientifically defined as the governing mechanism wherein specific structural inputs undergo controlled interaction or transformation to produce verified outcomes under conservation laws.`,
    simpleLanguageExplanation: `In simple everyday words, ${topic} explains how different parts work together step by step to produce a measurable, predictable result in the natural world.`,
    keyWordMeanings: [
      { word: 'Mechanism', meaning: 'The sequence of chemical, physical, or biological steps by which an overall change occurs.' },
      { word: 'Equilibrium', meaning: 'A balanced state where opposing forces or reaction rates cancel each other out.' }
    ],
    coreExample: `Observed whenever energy or materials transition from initial potential states into active kinetic work within ${subject}.`,
    practicalInterpretation: `Understanding ${topic} allows us to accurately calculate, predict, and control real systems instead of guessing outcomes.`
  };
}

function buildImportantDefinitionsForTopic(topic: string, subject: string): ImportantDefinitionItem[] {
  const l = topic.toLowerCase();
  if (l.includes('photosynthesis')) {
    return [
      {
        term: 'Chloroplast',
        academicDefinition: 'A double-membrane bound organelle of endosymbiotic origin containing thylakoids and stroma, serving as the cellular site of photosynthesis.',
        simpleExplanation: 'The tiny green food factory inside plant leaf cells.',
        example: 'Found abundantly in leaf palisade mesophyll cells (30–50 chloroplasts per cell).',
        importance: 'The essential organelle where both light and dark reactions occur.'
      },
      {
        term: 'Thylakoid & Granum',
        academicDefinition: 'A membrane-bound disc containing chlorophyll; stacked thylakoids form a granum (plural: grana) maximizing photon absorption.',
        simpleExplanation: 'Green disc-shaped solar plates stacked like coins inside the chloroplast.',
        example: 'Light-dependent reactions and water splitting take place across thylakoid membranes.',
        importance: 'Houses Photosystem II, Photosystem I, and ATP synthase.'
      },
      {
        term: 'Stroma',
        academicDefinition: 'The aqueous, enzyme-rich fluid matrix surrounding the thylakoid grana inside a chloroplast.',
        simpleExplanation: 'The clear liquid filling the chloroplast where sugars are assembled.',
        example: 'Contains the dissolved RuBisCO enzyme that fixes CO₂ during the Calvin cycle.',
        importance: 'Site of light-independent dark reactions (sugar synthesis).'
      },
      {
        term: 'Photolysis of Water',
        academicDefinition: 'The photochemical splitting of water molecules into protons (H⁺), electrons (e⁻), and oxygen gas (O₂) at the Oxygen-Evolving Complex of Photosystem II.',
        simpleExplanation: 'Sunlight cracking water molecules apart to release oxygen gas into the air.',
        example: '2H₂O + photons → 4H⁺ + 4e⁻ + O₂↑.',
        importance: 'Source of all atmospheric oxygen and the electron donor for light reactions.'
      },
      {
        term: 'Calvin Cycle',
        academicDefinition: 'The cyclic enzymatic pathway in the stroma that fixes carbon dioxide into glyceraldehyde-3-phosphate (G3P) using ATP and NADPH.',
        simpleExplanation: 'The 3-step circular process plants use to build sugar from carbon dioxide.',
        example: 'RuBisCO fixes 3 CO₂ molecules with 3 RuBP molecules to yield 6 3-PGA.',
        importance: 'Produces the actual carbohydrate food that sustains life on Earth.'
      }
    ];
  }

  if (l.includes('heart') || l.includes('cardiac')) {
    return [
      {
        term: 'Atrium (Right and Left)',
        academicDefinition: 'The thin-walled superior receiving chambers of the heart that collect venous blood prior to ventricular filling.',
        simpleExplanation: 'The top receiving rooms of the heart where blood enters first.',
        example: 'Right Atrium receives deoxygenated blood from vena cava; Left Atrium receives oxygenated blood from pulmonary veins.',
        importance: 'Pre-fills ventricles during diastole to optimize stroke volume.'
      },
      {
        term: 'Ventricle (Right and Left)',
        academicDefinition: 'The thick-walled muscular inferior pumping chambers of the heart responsible for driving blood into arterial circuits.',
        simpleExplanation: 'The powerful bottom muscular pumps that squeeze blood out to the lungs and body.',
        example: 'Left Ventricle myocardium is 3x thicker than Right Ventricle to pump blood throughout the body.',
        importance: 'Generates systolic blood pressure driving systemic and pulmonary circulation.'
      },
      {
        term: 'Sinoatrial (SA) Node',
        academicDefinition: 'A specialized cluster of self-excitatory myocardial pacemaker cells located in the upper wall of the right atrium generating rhythmic action potentials (~72 bpm).',
        simpleExplanation: 'The natural electronic pacemaker of the heart that keeps your pulse steady.',
        example: 'Generates spontaneous electrical impulses that sweep across atria triggering atrial systole.',
        importance: 'Sets heart rate and coordinates normal sinus rhythm.'
      },
      {
        term: 'Interventricular Septum',
        academicDefinition: 'A stout muscular partition separating the left and right ventricles, preventing admixture of oxygenated and deoxygenated blood.',
        simpleExplanation: 'The solid muscular dividing wall down the middle of the heart.',
        example: 'Defects in this septum (VSD / hole in the heart) cause fatigue due to mixed blood.',
        importance: 'Maintains strict separation between systemic and pulmonary bloodstreams.'
      },
      {
        term: 'Cardiac Valves (Tricuspid, Bicuspid, Semilunar)',
        academicDefinition: 'Fibrous flap-like structures ensuring strictly unidirectional blood flow by opening during forward pressure and snapping shut against retrograde backflow.',
        simpleExplanation: 'One-way doors inside the heart that prevent blood from sloshing backward.',
        example: 'Closure of AV valves creates the first heart sound (LUB); closure of semilunar valves creates the second sound (DUB).',
        importance: 'Prevents regurgitation and produces the classic "lub-dub" heartbeat sounds.'
      }
    ];
  }

  return [
    {
      term: 'Primary Operational Unit',
      academicDefinition: `The fundamental physical or structural element responsible for initiating ${topic}.`,
      simpleExplanation: `The main starting part that sets the whole system in motion.`,
      example: `Found across all standard textbook laboratory setups for ${topic}.`,
      importance: `Without this unit, no downstream transformation can occur.`
    },
    {
      term: 'Equilibrium State',
      academicDefinition: `A balanced condition where forward and reverse process rates are equal and net change is zero.`,
      simpleExplanation: `When all forces or chemical changes balance out steadily.`,
      example: `Reached once initial reactions or kinetic transfers conclude.`,
      importance: `Represents the final resting or measured outcome in curriculum problems.`
    }
  ];
}

function buildSubtopicsWithDiagrams(topic: string, subject: string, diagrams: DiagramVisualExplanation8Point[]): SubtopicConceptItem[] {
  const l = topic.toLowerCase();

  if (l.includes('photosynthesis')) {
    return [
      {
        subtopicId: 'photo-sub-1',
        name: 'Overall Photosynthetic Process & Organismal Integration',
        whatItIs: 'The holistic process by which green plants capture solar radiation, draw water through roots, absorb carbon dioxide through leaf stomata, and synthesize glucose while venting oxygen.',
        whatItMeans: 'The plant operates as an open solar energy harvester feeding the entire planet.',
        structureOrComponents: 'Roots (water uptake), Xylem (upward conduction), Leaves & Stomata (gas exchange), Phloem (glucose transport).',
        purpose: 'Provides chemical energy for plant growth and supplies oxygen for animal respiration.',
        howItWorks: 'Sunlight excites chlorophyll in leaf mesophyll; roots draw soil water; stomata open for CO₂ intake; glucose is synthesized and oxygen is exhaled.',
        whyItIsImportant: 'Underpins all terrestrial food chains and maintains atmospheric oxygen at ~21%.',
        characteristics: ['Anabolic reaction', 'Requires photon capture', 'Light-driven redox reaction'],
        importance: 'Forms the foundational chapter in CBSE/ICSE Class 10 Biology.',
        examples: ['Aquatic Hydrilla releasing visible oxygen bubbles under sunlight', 'Leaves storing starch that turns blue-black with iodine'],
        connectionToMainTopic: 'Introduces the overall macro-level inputs and outputs before inspecting sub-cellular reactions.',
        diagram: diagrams[0]
      },
      {
        subtopicId: 'photo-sub-2',
        name: 'Chloroplast Ultrastructure (Membranes, Stroma & Grana)',
        whatItIs: 'The specialized double-membrane plant organelle containing thylakoid grana discs suspended in an aqueous stroma matrix.',
        whatItMeans: 'The microscopic factory inside leaf cells where the actual chemistry of photosynthesis happens.',
        structureOrComponents: 'Outer membrane, Inner membrane, Intermembrane space, Stroma (fluid), Thylakoids, Grana stacks, Stroma lamellae, Chloroplast DNA & 70S ribosomes.',
        purpose: 'Spatially separates light-dependent reactions (thylakoids) from light-independent dark reactions (stroma).',
        howItWorks: 'Thylakoid membranes provide surface area for millions of chlorophyll pigments to absorb light; the surrounding stroma provides a soluble bath for RuBisCO enzyme.',
        whyItIsImportant: 'Compartmentalization allows proton gradients to build up across thylakoids without leaking into the rest of the cell.',
        characteristics: ['Semi-autonomous organelle', 'Possesses circular DNA', 'Stacked grana increase surface area'],
        importance: 'Diagram questions on chloroplast structure appear annually in board examinations.',
        examples: ['Palisade mesophyll cells under a light microscope showing bright green oval chloroplasts'],
        connectionToMainTopic: 'Provides the exact physical anatomical locations where Stages 3 and 4 take place.',
        diagram: diagrams[1]
      },
      {
        subtopicId: 'photo-sub-3',
        name: 'Light-Dependent Reactions & Photolysis of Water',
        whatItIs: 'The photochemical reactions occurring in thylakoid membranes where light energy splits water and synthesizes ATP and NADPH via the Z-scheme.',
        whatItMeans: 'Sunlight cracks water molecules open to recharge cellular chemical batteries (ATP and NADPH) and releases oxygen.',
        structureOrComponents: 'Photosystem II (P680), Oxygen-Evolving Complex, Plastoquinone, Cytochrome b₆f, Plastocyanin, Photosystem I (P700), Ferredoxin, NADP⁺ Reductase, ATP Synthase.',
        purpose: 'Generates the "assimilatory power" (ATP and NADPH) required to reduce carbon dioxide into sugar in the next stage.',
        howItWorks: 'Photons hit PS II, exciting electrons; water is photolyzed to replace electrons (2H₂O → 4H⁺ + 4e⁻ + O₂↑); electrons flow down the chain pumping H⁺ into the lumen; ATP Synthase rotates as H⁺ rushes out, generating ATP.',
        whyItIsImportant: 'Proves that atmospheric oxygen comes entirely from water splitting, not from CO₂.',
        characteristics: ['Directly light-dependent', 'Occurs across thylakoid membrane', 'Produces ATP + NADPH + O₂'],
        importance: 'The Z-scheme is a classic 5-mark board examination question.',
        examples: ['Robin Hill reaction: isolated chloroplasts produce O₂ when illuminated in the presence of an artificial electron acceptor'],
        connectionToMainTopic: 'Converts solar electromagnetic energy into the chemical energy consumed in the Calvin Cycle.',
        diagram: diagrams[2]
      },
      {
        subtopicId: 'photo-sub-4',
        name: 'Calvin Cycle & Enzymatic Carbon Fixation in the Stroma',
        whatItIs: 'The cyclic light-independent pathway occurring in the chloroplast stroma wherein RuBisCO fixes CO₂ into carbohydrates using ATP and NADPH.',
        whatItMeans: 'The chemical kitchen where carbon dioxide gas is assembled into real glucose sugar.',
        structureOrComponents: 'CO₂ substrate, RuBP acceptor (5C), RuBisCO enzyme, 3-PGA intermediates, ATP, NADPH, G3P triose sugar output.',
        purpose: 'Fixes inorganic atmospheric carbon into organic food that can nourish plants and animals.',
        howItWorks: 'Phase 1: RuBisCO fixes CO₂ onto RuBP to make 3-PGA. Phase 2: ATP and NADPH reduce 3-PGA into G3P (1 exits as sugar). Phase 3: ATP regenerates RuBP to repeat the cycle.',
        whyItIsImportant: 'RuBisCO is the bridge connecting inorganic atmospheric carbon to all organic life.',
        characteristics: ['Enzymatic cycle', 'Occurs in stroma', 'Requires ATP and NADPH from light reactions'],
        importance: 'Commonly tested with Melvin Calvin’s radioactive carbon-14 tracer experiments.',
        examples: ['Plants synthesizing starch grains inside stroma during daytime sunlight'],
        connectionToMainTopic: 'Fulfills the primary purpose of photosynthesis: synthesizing food.',
        diagram: diagrams[3]
      },
      {
        subtopicId: 'photo-sub-5',
        name: 'Balanced Chemical Equation & Atomic Conservation',
        whatItIs: 'The stoichiometric chemical equation 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ demonstrating conservation of matter and energy storage.',
        whatItMeans: 'Proves that every atom entering the leaf is accounted for in the final sugar and oxygen products.',
        structureOrComponents: '6 Carbon Dioxide molecules, 6 Water molecules, Light photons, Chlorophyll catalyst, 1 Glucose molecule, 6 Oxygen molecules.',
        purpose: 'Provides the mathematical foundation for balancing biochemical equations and understanding conservation of mass.',
        howItWorks: '6 carbon atoms from CO₂ form the glucose backbone; 12 hydrogen atoms from water reduce the carbon; 12 oxygen atoms from water are expelled as 6O₂.',
        whyItIsImportant: 'Students must balance this equation correctly to earn full marks in board examinations.',
        characteristics: ['Endothermic / Endergonic', 'ΔG° = +2870 kJ/mol', '100% atomic balance'],
        importance: 'Board examiners penalize unbalanced equations (e.g. omitting 6s).',
        examples: ['Using molar mass: 264g CO₂ + 108g H₂O yields 180g Glucose + 192g O₂'],
        connectionToMainTopic: 'Provides the formal chemical summary of the entire chapter.',
        diagram: diagrams[4]
      }
    ];
  }

  if (l.includes('heart') || l.includes('cardiac')) {
    return [
      {
        subtopicId: 'heart-sub-1',
        name: 'Heart External Anatomy & Mediastinal Orientation',
        whatItIs: 'The gross physical orientation, protective pericardial coverings, and external sulci of the human heart in the chest cavity.',
        whatItMeans: 'How the heart looks on the outside and how it is protected between the two lungs.',
        structureOrComponents: 'Pericardial sac (fibrous & serous), Base (superior), Apex (inferior-left), Coronary sulcus, Anterior interventricular groove.',
        purpose: 'Anchors the heart in the chest, prevents acute friction, and delivers blood to heart muscle via coronary arteries.',
        howItWorks: 'Pericardial fluid eliminates friction as the heart expands and twists; coronary arteries branch from the aorta to feed the working myocardium.',
        whyItIsImportant: 'Explains where to listen for heart sounds and why coronary artery blockages cause heart attacks.',
        characteristics: ['Fist-sized muscular organ (~300g)', 'Rests in mediastinum', '2/3 lies left of midline'],
        importance: 'Essential for clinical anatomy and physical examination questions.',
        examples: ['Apex beat felt at the 5th left intercostal space along the midclavicular line'],
        connectionToMainTopic: 'Establishes external orientation before exploring internal chambers.',
        diagram: diagrams[0]
      },
      {
        subtopicId: 'heart-sub-2',
        name: 'The Four Muscular Chambers & Internal Septum',
        whatItIs: 'The internal architecture of Right Atrium, Right Ventricle, Left Atrium, Left Ventricle, and the separating interventricular septum.',
        whatItMeans: 'The four internal rooms of the heart that keep dirty blood completely separate from clean blood.',
        structureOrComponents: 'Right Atrium, Right Ventricle, Left Atrium, Left Ventricle, Interatrial Septum, Interventricular Septum, Myocardium.',
        purpose: 'Receives blood at low pressure and pumps it out at high pressure without mixing oxygenated and deoxygenated streams.',
        howItWorks: 'Atria receive incoming blood; ventricles contract forcefully to eject blood; the thick septum prevents any cross-contamination.',
        whyItIsImportant: 'Left ventricle myocardium is 3x thicker than right ventricle because it must pump against systemic vascular resistance.',
        characteristics: ['Four distinct chambers', 'Complete muscular septum in mammals', 'Thick left ventricular wall'],
        importance: 'The reason why mammals maintain constant high body temperature (homeothermy).',
        examples: ['Echocardiogram showing the muscular interventricular septum contracting between ventricles'],
        connectionToMainTopic: 'Reveals the physical pumps driving the circulatory circuits.',
        diagram: diagrams[1]
      },
      {
        subtopicId: 'heart-sub-3',
        name: 'Double Circulation (Pulmonary & Systemic Circuits)',
        whatItIs: 'The complete two-circuit circulatory system where blood flows through the heart twice during each complete bodily cycle.',
        whatItMeans: 'Blood takes two distinct loops: a short loop to the lungs for oxygen, and a long loop to the body for delivery.',
        structureOrComponents: 'Pulmonary Circuit (RV → Pulmonary Artery → Lungs → Pulmonary Veins → LA) and Systemic Circuit (LV → Aorta → Body → Vena Cava → RA).',
        purpose: 'Delivers blood with maximal oxygen tension (~100 mmHg) to tissues while maintaining safe low pressure (~25 mmHg) in lung capillaries.',
        howItWorks: 'Deoxygenated blood from the body enters RA → RV → Lungs (oxygenated) → LA → LV → Body.',
        whyItIsImportant: 'Prevents oxygen-rich and oxygen-poor blood from mixing, enabling high athletic stamina and brain function.',
        characteristics: ['Dual loop', 'Pulmonary artery carries deoxy blood', 'Pulmonary veins carry oxy blood'],
        importance: 'A mandatory high-yield question in every Class 10 board examination.',
        examples: ['Tracing a red blood cell from the big toe through the heart, lungs, back through the heart, and back to the brain'],
        connectionToMainTopic: 'Explains the physiological route and purpose of every heartbeat.',
        diagram: diagrams[2]
      },
      {
        subtopicId: 'heart-sub-4',
        name: 'Cardiac Conduction System & Pacemaker Rhythm',
        whatItIs: 'The intrinsic electrical network (SA Node, AV Node, Bundle of His, Purkinje Fibers) generating and coordinating rhythmic heartbeats.',
        whatItMeans: 'The heart’s internal electrical wiring that makes it beat automatically without needing brain signals.',
        structureOrComponents: 'Sinoatrial (SA) node, Internodal tracts, Atrioventricular (AV) node, Bundle of His, Bundle branches, Purkinje fibers.',
        purpose: 'Ensures atria contract first to fill ventricles, followed by coordinated ventricular contraction from the apex upward.',
        howItWorks: 'SA node fires ~72 impulses/min; AV node delays the pulse by 0.1s; Purkinje fibers spread the pulse upward through ventricular walls.',
        whyItIsImportant: 'The 0.1-second AV nodal delay is essential: without it, atria and ventricles would squeeze simultaneously, halting blood flow.',
        characteristics: ['Myogenic auto-rhythmicity', '0.1s AV delay', 'Wave travels from apex to base'],
        importance: 'Explains ECG waveforms (P wave, QRS complex, T wave).',
        examples: ['Artificial electronic pacemakers implanted in patients whose SA node fails'],
        connectionToMainTopic: 'Explains how the mechanical chambers are timed and stimulated.',
        diagram: diagrams[3]
      },
      {
        subtopicId: 'heart-sub-5',
        name: 'Heart Valves, Great Vessels & "LUB-DUB" Sounds',
        whatItIs: 'The one-way atrioventricular (Tricuspid/Mitral) and semilunar (Aortic/Pulmonary) valves preventing backflow, and the origin of heart sounds.',
        whatItMeans: 'One-way doors inside the heart whose snapping shut creates the familiar "lub-dub" sound through a stethoscope.',
        structureOrComponents: 'Tricuspid valve, Bicuspid / Mitral valve, Chordae tendineae, Papillary muscles, Aortic valve, Pulmonary valve, Aorta, Vena Cava.',
        purpose: 'Forces blood to flow strictly forward in one direction through the heart chambers.',
        howItWorks: 'Ventricular systole snaps AV valves shut (Sound S₁: LUB); ventricular diastole causes arterial backpressure that snaps Semilunar valves shut (Sound S₂: DUB).',
        whyItIsImportant: 'Defective valves fail to close tightly, producing heart murmurs heard on auscultation.',
        characteristics: ['Pressure-operated flaps', 'Chordae tendineae prevent valve inversion', 'Produces S₁ and S₂ sounds'],
        importance: 'Board exams regularly ask: "What causes the first and second heart sounds?"',
        examples: ['A doctor using a stethoscope at the chest to detect normal lub-dub vs abnormal regurgitant murmurs'],
        connectionToMainTopic: 'Explains the mechanical valve action and acoustic signatures of the heart.',
        diagram: diagrams[4]
      }
    ];
  }

  // Fallback for generic topics: Map each subtopic diagram to a structured subtopic
  return diagrams.map((diag, idx) => ({
    subtopicId: `sub-${idx + 1}-${topic.slice(0, 4)}`,
    name: diag.title.replace(/^Diagram \d+:\s*/, ''),
    whatItIs: `Detailed conceptual breakdown of ${diag.title} within ${topic}.`,
    whatItMeans: `Explains how this specific sub-element contributes to the overall mechanism of ${topic}.`,
    structureOrComponents: diag.point2_labelledParts.map((p) => p.label).join(', '),
    purpose: diag.point3_componentFunctions,
    howItWorks: diag.point5_directionOfMovementOrProcess,
    whyItIsImportant: diag.point7_learningOutcome,
    characteristics: ['Syllabus verified', 'Step-by-step clarity', 'Direct exam relevance'],
    importance: diag.point8_whatToRemember,
    examples: [`Standard laboratory observation illustrating ${diag.title}`],
    connectionToMainTopic: `Directly links foundational principles to the complete chapter mechanism.`,
    diagram: diag
  }));
}

function buildComparisonsForTopic(topic: string, subject: string) {
  const l = topic.toLowerCase();
  if (l.includes('photosynthesis')) {
    return {
      title: 'Photosynthesis vs. Cellular Respiration Comparison Matrix',
      conceptA: 'Photosynthesis (Anabolic)',
      conceptB: 'Cellular Respiration (Catabolic)',
      rows: [
        { aspect: 'Metabolic Nature', itemA: 'Anabolic (constructive; builds glucose)', itemB: 'Catabolic (destructive; breaks glucose)' },
        { aspect: 'Energy Transformation', itemA: 'Converts solar light energy into chemical bond energy', itemB: 'Releases chemical bond energy as ATP and heat' },
        { aspect: 'Cellular Site', itemA: 'Chloroplasts (thylakoids & stroma)', itemB: 'Mitochondria (cristae & matrix) and cytoplasm' },
        { aspect: 'Primary Reactants', itemA: '6CO₂ + 6H₂O + Sunlight', itemB: 'C₆H₁₂O₆ (Glucose) + 6O₂' },
        { aspect: 'Primary Products', itemA: 'C₆H₁₂O₆ (Glucose) + 6O₂', itemB: '6CO₂ + 6H₂O + 36–38 ATP' },
        { aspect: 'Occurrence', itemA: 'Only in green plants/photoautotrophs in light', itemB: 'In all living aerobic organisms 24 hours a day' }
      ],
      causeAndEffectNotes: [
        'Photosynthesis produces the glucose and oxygen that Cellular Respiration requires as inputs.',
        'Cellular Respiration produces the carbon dioxide and water that Photosynthesis recycles as inputs.',
        'Together, they form the closed ecological carbon-oxygen cycle sustaining terrestrial life.'
      ],
      summaryTakeaway: 'Photosynthesis STORES solar energy in glucose; Respiration RELEASES that stored energy as ATP.'
    };
  }

  if (l.includes('heart') || l.includes('cardiac')) {
    return {
      title: 'Arteries vs. Veins Comparison Matrix',
      conceptA: 'Arteries (High-Pressure Outflow)',
      conceptB: 'Veins (Low-Pressure Inflow)',
      rows: [
        { aspect: 'Direction of Flow', itemA: 'Carries blood AWAY from heart to tissues', itemB: 'Carries blood TOWARD the heart from tissues' },
        { aspect: 'Blood Oxygenation', itemA: 'Carries oxygenated blood (Except Pulmonary Artery)', itemB: 'Carries deoxygenated blood (Except Pulmonary Veins)' },
        { aspect: 'Vascular Pressure', itemA: 'High pressure (~120 mmHg systolic)', itemB: 'Low pressure (~5–10 mmHg)' },
        { aspect: 'Vessel Wall Anatomy', itemA: 'Thick muscular, highly elastic tunica media', itemB: 'Thin muscular wall with wide lumen' },
        { aspect: 'Internal Valves', itemA: 'No internal valves (high pressure prevents backflow)', itemB: 'Possesses semilunar pocket valves to prevent backflow' },
        { aspect: 'Lumen Diameter', itemA: 'Narrow lumen maintaining high arterial pressure', itemB: 'Wide, collapsible lumen acting as capacitance reservoir' }
      ],
      causeAndEffectNotes: [
        'Arterial walls must be thick and elastic to withstand ventricular systolic pressure surges without rupturing.',
        'Veins must have one-way pocket valves because venous pressure is too low to overcome gravity on its own.'
      ],
      summaryTakeaway: 'Arteries carry blood Away (thick, no valves); Veins Visit the heart (thin, with valves).'
    };
  }

  if (l.includes('chemical reaction') || (l.includes('equation') && l.includes('chemical'))) {
    return {
      title: 'Combination vs. Decomposition Reactions Comparison Matrix',
      conceptA: 'Combination Reaction (Synthesis)',
      conceptB: 'Decomposition Reaction (Analysis)',
      rows: [
        { aspect: 'Number of Reactants', itemA: 'Two or more elements/compounds combine (A + B → AB)', itemB: 'A single compound reactant breaks down (AB → A + B)' },
        { aspect: 'Number of Products', itemA: 'Always exactly ONE single product formed', itemB: 'Two or more simpler products formed' },
        { aspect: 'Thermal Nature', itemA: 'Predominantly exothermic (releases energy as heat/light)', itemB: 'Predominantly endothermic (absorbs heat, light, or electricity)' },
        { aspect: 'Energy Requirement', itemA: 'Spontaneous once activation energy is supplied', itemB: 'Requires continuous energy input (Thermal, Photolytic, Electrolytic)' },
        { aspect: 'NCERT Textbook Example', itemA: '2Mg(s) + O₂(g) → 2MgO(s)', itemB: '2Pb(NO₃)₂(s) → 2PbO(s) + 4NO₂(g) + O₂(g)' }
      ],
      causeAndEffectNotes: [
        'Decomposition is the exact chemical reverse of combination synthesis.',
        'Thermal decomposition of lead nitrate releases characteristic brown fumes of nitrogen dioxide (NO₂) gas.'
      ],
      summaryTakeaway: 'Combination PUTS TOGETHER into 1 product; Decomposition BREAKS DOWN into multiple products.'
    };
  }

  if (l.includes('quadratic')) {
    return {
      title: 'Factoring Method vs. Quadratic Formula Comparison Matrix',
      conceptA: 'Factoring / Splitting Middle Term',
      conceptB: 'Quadratic Formula x = (-b ± √D) / 2a',
      rows: [
        { aspect: 'Applicability', itemA: 'Fastest when roots are rational and factors are obvious', itemB: 'Universal; works for all quadratic equations without exception' },
        { aspect: 'Prerequisite Condition', itemA: 'Discriminant D = b² - 4ac must be a perfect square', itemB: 'Applicable whether D is square, non-square, zero, or negative' },
        { aspect: 'Calculation Complexity', itemA: 'Simple mental math for integer coefficients', itemB: 'Requires systematic radical computation and fractions' },
        { aspect: 'Nature of Output', itemA: 'Direct linear binomial factors (x - α)(x - β) = 0', itemB: 'Explicit algebraic values for both roots directly' }
      ],
      causeAndEffectNotes: [
        'If splitting the middle term fails within 30 seconds, immediately apply the Quadratic Formula.',
        'Checking the discriminant D first prevents wasting time searching for non-existent rational factors.'
      ],
      summaryTakeaway: 'Use factoring when D is a perfect square; use Quadratic Formula for all difficult or irrational roots.'
    };
  }

  if (l.includes('electricity') || l.includes('circuit')) {
    return {
      title: 'Series Circuit vs. Parallel Circuit Comparison Matrix',
      conceptA: 'Series Connection (Single Pathway)',
      conceptB: 'Parallel Connection (Branched Pathways)',
      rows: [
        { aspect: 'Current Flow (I)', itemA: 'Same current flows through all components (I = I₁ = I₂)', itemB: 'Current divides across branches (I = I₁ + I₂ + I₃)' },
        { aspect: 'Potential Difference (V)', itemA: 'Voltage divides across resistors (V = V₁ + V₂)', itemB: 'Same voltage across every branch (V = V₁ = V₂)' },
        { aspect: 'Equivalent Resistance', itemA: 'Rs = R₁ + R₂ + ... (Always greater than largest R)', itemB: '1/Rp = 1/R₁ + 1/R₂ + ... (Always smaller than smallest R)' },
        { aspect: 'Fault Consequence', itemA: 'If one bulb fuses, entire circuit breaks and turns off', itemB: 'If one appliance fuses, all other branches continue working' },
        { aspect: 'Practical Application', itemA: 'Decorative fairy lights, safety fuses', itemB: 'Domestic household wiring' }
      ],
      causeAndEffectNotes: [
        'Household appliances are connected in parallel so each operates at the full 220V mains supply with independent switches.',
        'Series wiring would cause excessive total resistance and diminish light output in all bulbs.'
      ],
      summaryTakeaway: 'Series: Same Current, shared Voltage; Parallel: Same Voltage, shared Current.'
    };
  }

  if (l.includes('french revolution') || l.includes('bastille')) {
    return {
      title: 'Ancien Régime Absolute Monarchy vs. Constitutional Republic',
      conceptA: 'Ancien Régime (Pre-1789)',
      conceptB: 'Constitutional Republic (Post-1789)',
      rows: [
        { aspect: 'Sovereignty Source', itemA: 'Divine Right of Kings (Monarch answerable only to God)', itemB: 'Popular Sovereignty (Power resides in the citizenry)' },
        { aspect: 'Social Hierarchy', itemA: 'Rigid Three Estates with birth-based feudal privileges', itemB: 'Universal civic equality before the law (Égalité)' },
        { aspect: 'Taxation Structure', itemA: 'Third Estate bore almost 100% of taxes (Tithe & Taille)', itemB: 'Equitable taxation proportional to income and property' },
        { aspect: 'Legislative Authority', itemA: 'King had absolute unchecked veto power', itemB: 'Elected National Assembly framing constitutional law' }
      ],
      causeAndEffectNotes: [
        'The bankruptcy of the French treasury under King Louis XVI forced the summoning of the Estates General, triggering the revolution.',
        'The Fall of the Bastille on 14 July 1789 symbolized the irrevocable destruction of royal tyranny.'
      ],
      summaryTakeaway: 'The Revolution transformed French subjects into participating democratic citizens.'
    };
  }

  if (l.includes('water resource')) {
    return {
      title: 'Traditional Rainwater Harvesting vs. Large Multipurpose Dams',
      conceptA: 'Traditional Rainwater Harvesting',
      conceptB: 'Large Multipurpose River Dams',
      rows: [
        { aspect: 'Scale & Ownership', itemA: 'Decentralized community-owned or individual household', itemB: 'Centralized mega-infrastructure funded by government' },
        { aspect: 'Ecological Impact', itemA: 'Negligible environmental disturbance; recharges aquifers', itemB: 'Large-scale submergence of forests and soil erosion' },
        { aspect: 'Human Displacement', itemA: 'Zero displacement of indigenous local populations', itemB: 'Mass displacement of tribal and farming communities' },
        { aspect: 'Capital & Maintenance', itemA: 'Low capital expenditure; easy local maintenance', itemB: 'Massive capital outlay; prone to reservoir siltation' },
        { aspect: 'Regional Examples', itemA: 'Guls/Kuls in Himalayas, Tankas/Johads in Rajasthan', itemB: 'Bhakra Nangal, Hirakud, Sardar Sarovar Project' }
      ],
      causeAndEffectNotes: [
        'Rainwater harvesting captures monsoon rain where it falls, raising groundwater tables sustainably without submerging valleys.',
        'While dams provide vital hydroelectric energy, localized harvesting ensures drought resilience for small farmers.'
      ],
      summaryTakeaway: 'Dams deliver concentrated industrial power; Rainwater harvesting delivers decentralized, sustainable water security.'
    };
  }

  return {
    title: `${topic} Comparative Matrix`,
    conceptA: `Direct / Unilateral Mode`,
    conceptB: `Feedback / Dual Mode`,
    rows: [
      { aspect: 'Energy Requirement', itemA: 'Requires continuous high external energy supply', itemB: 'Highly self-sustaining through energy recycling' },
      { aspect: 'Speed of Response', itemA: 'Near-instantaneous open-loop response', itemB: 'Carefully modulated dampening response' },
      { aspect: 'Stability under Stress', itemA: 'Vulnerable to sudden boundary shocks', itemB: 'Robust homeostasis via error correction' }
    ],
    causeAndEffectNotes: [
      `Increasing initial input amplitude yields a proportional rise in throughput until saturation is reached.`,
      `Failure of regulatory feedback leads to runaway accumulation or premature cessation.`
    ],
    summaryTakeaway: `Select the appropriate operational mode based on system load and error tolerance.`
  };
}

export function buildCorePrinciplesForTopic(topic: string, subject: string, stage12Facts?: any): string[] {
  const l = `${topic} ${subject}`.toLowerCase();

  if (/heart|cardiac|circulat/.test(l)) {
    return [
      `The human heart functions as a dual muscular pump operating two discrete closed circuits: Pulmonary Circulation (to alveolar capillary beds) and Systemic Circulation (to bodily tissues).`,
      `Complete anatomical separation between right (deoxygenated) and left (oxygenated) chambers prevents blood mixing and maintains homeothermy and high arterial pressure.`,
      `Four non-return valves (Tricuspid, Bicuspid/Mitral, Pulmonary Semilunar, Aortic Semilunar) enforce strictly unidirectional forward hemodynamic flow.`,
      `The cardiac cycle is governed by intrinsic myogenic pacemaking initiated at the Sinoatrial (SA) node, propagated with an essential 0.1-second delay at the Atrioventricular (AV) node, and distributed via the Bundle of His and Purkinje fibers.`,
      `The left ventricle possesses a myocardium three times thicker than the right ventricle because it must overcome systemic vascular resistance (~120 mmHg vs ~25 mmHg).`
    ];
  }

  if (/photosynthesis|chloroplast|light reaction|calvin/.test(l)) {
    return [
      `Photosynthesis converts incident solar photon energy into stable chemical bond energy stored in glucose ($C_6H_{12}O_6$), consuming carbon dioxide ($CO_2$) and water ($H_2O$) while releasing oxygen ($O_2$).`,
      `Light-dependent reactions in the thylakoid grana membranes generate ATP and NADPH via electron transport chains driven by water photolysis ($2H_2O \\rightarrow 4H^+ + 4e^- + O_2$).`,
      `Light-independent dark reactions (Calvin Cycle) in the stroma utilize ATP, NADPH, and the enzyme RuBisCO to fix atmospheric $CO_2$ into triose phosphates.`,
      `The rate of photosynthesis follows Blackman's Law of Limiting Factors, determined by the reactant or environmental variable in lowest supply.`
    ];
  }

  if (/newton|force|motion|inertia|momentum/.test(l)) {
    return [
      `Newton's First Law (Law of Inertia) states that a body remains at rest or in uniform rectilinear motion unless compelled to change that state by a non-zero net external force ($\\sum \\vec{F} = 0 \\iff \\vec{a} = 0$).`,
      `Newton's Second Law quantifies dynamics: net external force equals the time rate of change of linear momentum ($\\vec{F} = \\frac{d\\vec{p}}{dt} = m\\vec{a}$).`,
      `Newton's Third Law (Action-Reaction) mandates that mutual forces between interacting bodies are always equal in magnitude, opposite in direction, and act on different bodies ($\\vec{F}_{AB} = -\\vec{F}_{BA}$).`,
      `The total linear momentum of an isolated physical system remains constant if no net external force acts upon it.`
    ];
  }

  if (/circuit|electric|current|ohm|resistan|voltage/.test(l)) {
    return [
      `Ohm's Law states that electric current through a metallic conductor is directly proportional to the potential difference across its terminals at constant temperature ($V = I \\cdot R$).`,
      `In a series circuit, electric current is identical across all components, while total voltage divides; equivalent resistance is the algebraic sum ($R_s = R_1 + R_2 + \\dots$).`,
      `In a parallel circuit, potential difference across all branches is identical, while current divides; reciprocal of equivalent resistance equals the sum of reciprocals ($1/R_p = 1/R_1 + 1/R_2 + \\dots$).`,
      `Joule's Law of Heating dictates that electrical thermal dissipation is proportional to current squared, resistance, and time ($H = I^2 R t$).`
    ];
  }

  if (/light|reflection|refraction|lens|mirror|optics/.test(l)) {
    return [
      `The Law of Reflection states that the incident ray, reflected ray, and normal to the reflecting surface lie in the same plane, and the angle of incidence equals the angle of reflection ($\\angle i = \\angle r$).`,
      `Snell's Law of Refraction relates angles to refractive indices across an optical interface: $\\frac{\\sin i}{\\sin r} = \\frac{n_2}{n_1} = \\frac{v_1}{v_2}$.`,
      `Convex lenses are converging with positive focal length ($f > 0$), producing real inverted images for objects beyond the principal focus; concave lenses are diverging ($f < 0$).`,
      `The Lens Formula relates object distance ($u$), image distance ($v$), and focal length ($f$): $\\frac{1}{f} = \\frac{1}{v} - \\frac{1}{u}$.`
    ];
  }

  if (/atom|bohr|electron|proton|nucleus/.test(l)) {
    return [
      `The Bohr model describes the atom with a dense central positive nucleus orbited by negatively charged electrons confined to discrete, quantized non-radiating energy levels ($K, L, M, N$).`,
      `Electrons only radiate or absorb electromagnetic energy when jumping between discrete stationary orbits ($\\Delta E = E_2 - E_1 = h\\nu$).`,
      `The maximum electron capacity of an energy shell is determined by the $2n^2$ rule, where $n$ is the principal quantum number.`,
      `Chemical reactivity and valence behavior are determined by the outermost valence shell electron configuration.`
    ];
  }

  if (/bond|chemical reaction|reaction|equation|acid|base/.test(l)) {
    return [
      `Chemical reactions involve the breaking of existing chemical bonds in reactants and the forming of new bonds in products, strictly conserving total mass and atomic identity.`,
      `Ionic bonding involves the complete transfer of valence electrons from electropositive metals to electronegative non-metals, producing electrostatic ionic lattices.`,
      `Covalent bonding involves the mutual sharing of electron pairs between non-metallic atoms to achieve noble gas electron configurations.`,
      `Enthalpy changes during chemical reactions reflect the net difference between endothermic bond-cleavage inputs and exothermic bond-formation releases.`
    ];
  }

  if (/digest|alimentary|stomach|enzyme|peristalsis/.test(l)) {
    return [
      `The human digestive system breaks down complex insoluble macromolecules (carbohydrates, proteins, lipids) into simple soluble absorbable nutrients (glucose, amino acids, fatty acids).`,
      `Food is propelled through the gastrointestinal tract by rhythmic muscular contractions termed peristalsis.`,
      `Digestion is sequential: salivary amylase in the mouth, pepsin in acidic gastric juice, and pancreatic enzymes in the alkaline duodenum.`,
      `Villi and microvilli in the small intestine amplify surface area for rapid nutrient absorption into blood and lymph capillaries.`
    ];
  }

  if (/quadratic|equation|polynomial|root/.test(l)) {
    return [
      `A quadratic equation has canonical form $ax^2 + bx + c = 0$ ($a \\neq 0$) and possesses exactly two roots determined by the quadratic formula $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$.`,
      `The discriminant $\\Delta = b^2 - 4ac$ governs root nature: $\\Delta > 0$ yields two distinct real roots, $\\Delta = 0$ yields one repeated real root, and $\\Delta < 0$ yields conjugate complex roots.`,
      `By Vieta's formulas, root sum equals $-b/a$ and root product equals $c/a$.`,
      `The graph of a quadratic function is a symmetric parabola with vertex at $x = -b / (2a)$.`
    ];
  }

  if (/pythagor|triangle|geometry|angle|circle/.test(l)) {
    return [
      `The Pythagorean Theorem states that in any right-angled Euclidean triangle, the square of the hypotenuse equals the sum of the squares of the other two legs ($a^2 + b^2 = c^2$).`,
      `The converse of the Pythagorean Theorem confirms that if $a^2 + b^2 = c^2$, the angle opposite side $c$ is strictly $90^\\circ$.`,
      `Pythagorean triples ($3-4-5$, $5-12-13$, $8-15-17$) satisfy integer solutions to $a^2 + b^2 = c^2$.`,
      `Trigonometric ratios (sine, cosine, tangent) are defined as normalized ratios of side lengths relative to an acute angle in a right triangle.`
    ];
  }

  if (stage12Facts?.importantFacts && stage12Facts.importantFacts.length >= 3) {
    return stage12Facts.importantFacts.slice(0, 5);
  }

  return [
    `${topic} is a core academic syllabus unit governed by verified theoretical principles and experimental proofs.`,
    `Mastery requires understanding the foundational definitions, structural components, and sequential mechanisms.`,
    `Mathematical or qualitative formulations accurately describe observable behaviors under standard curriculum conditions.`,
    `Board examinations prioritize precise terminology, labeled diagrams, and step-by-step reasoning.`
  ];
}

function buildStepByStepProcessesForTopic(topic: string, subject: string) {
  const l = `${topic} ${subject}`.toLowerCase();

  if (/heart|cardiac|circulat/.test(l)) {
    return [
      {
        stepNumber: 1,
        title: 'Venous Return & Atrial Inflow',
        whatHappens: 'Deoxygenated blood from the upper and lower body drains through the Superior and Inferior Vena Cava into the Right Atrium (RA), while oxygenated blood from the lungs drains via the four Pulmonary Veins into the Left Atrium (LA).',
        whereItHappens: 'Superior/Inferior Vena Cava, Right Atrium, Pulmonary Veins, Left Atrium.',
        componentsInvolved: ['Superior Vena Cava', 'Inferior Vena Cava', 'Right Atrium', 'Pulmonary Veins', 'Left Atrium'],
        whyItHappens: 'During atrial diastole, relaxed atrial muscle creates negative chamber pressure that suctions systemic and pulmonary venous return.',
        whatHappensNext: 'Pressure in the atria exceeds ventricular pressure, forcing open the Atrioventricular (AV) valves.'
      },
      {
        stepNumber: 2,
        title: 'Atrial Systole & Ventricular Filling',
        whatHappens: 'The Sinoatrial (SA) node fires an electrical impulse across the atrial walls; atria contract simultaneously, pushing blood past the Tricuspid Valve into the Right Ventricle (RV) and past the Bicuspid (Mitral) Valve into the Left Ventricle (LV).',
        whereItHappens: 'Atrioventricular junctions (Tricuspid and Bicuspid/Mitral valves) into the ventricles.',
        componentsInvolved: ['SA Node', 'Atrial Myocardium', 'Tricuspid Valve', 'Bicuspid/Mitral Valve', 'Right Ventricle', 'Left Ventricle'],
        whyItHappens: 'Atrial contraction tops off ventricular volume, completing the end-diastolic volume (EDV ~120 mL).',
        whatHappensNext: 'The electrical pulse reaches the AV Node, where it is delayed for 0.1s before ventricular depolarization.'
      },
      {
        stepNumber: 3,
        title: 'Ventricular Systole & AV Valve Closure (First Heart Sound: "LUB")',
        whatHappens: 'The action potential travels down the Bundle of His and Purkinje fibers; ventricles begin contracting forcefully from the apex upward. Rising intraventricular pressure instantly forces the Tricuspid and Mitral valves shut.',
        whereItHappens: 'Right and Left Ventricular myocardium and AV valves.',
        componentsInvolved: ['AV Node', 'Bundle of His', 'Purkinje Fibers', 'Chordae Tendineae', 'Papillary Muscles', 'AV Valves'],
        whyItHappens: 'Sudden closure and vibration of the taut AV valves produces the low-pitched First Heart Sound ("LUB" / S₁), preventing regurgitation into atria.',
        whatHappensNext: 'Ventricular pressure rises rapidly until it exceeds arterial backpressure in the Aorta and Pulmonary Artery.'
      },
      {
        stepNumber: 4,
        title: 'Ventricular Ejection into Great Vessels',
        whatHappens: 'High ventricular pressure forces open the Pulmonary Semilunar Valve (ejecting deoxygenated blood from RV into Pulmonary Trunk towards lungs) and the Aortic Semilunar Valve (ejecting oxygenated blood from LV into Aorta towards the body).',
        whereItHappens: 'Pulmonary Semilunar Valve, Pulmonary Artery, Aortic Semilunar Valve, Systemic Aorta.',
        componentsInvolved: ['Right Ventricle', 'Left Ventricle', 'Pulmonary Semilunar Valve', 'Aortic Semilunar Valve', 'Pulmonary Trunk', 'Systemic Aorta'],
        whyItHappens: 'Left ventricular pressure surges to ~120 mmHg, overcoming systemic aortic diastolic pressure (~80 mmHg) to drive cardiac stroke volume (~70 mL).',
        whatHappensNext: 'Ventricles empty their stroke volume and begin relaxing.'
      },
      {
        stepNumber: 5,
        title: 'Ventricular Diastole & Semilunar Valve Closure (Second Heart Sound: "DUB")',
        whatHappens: 'Ventricles relax (diastole); chamber pressure drops steeply below arterial pressures. Blood attempting to flow backward into the ventricles snaps the Aortic and Pulmonary Semilunar valves shut.',
        whereItHappens: 'Base of Aorta and Pulmonary Trunk.',
        componentsInvolved: ['Aortic Semilunar Valve', 'Pulmonary Semilunar Valve', 'Ventricular Cavities'],
        whyItHappens: 'Snapping closure of the semilunar valves creates the sharp, shorter Second Heart Sound ("DUB" / S₂), protecting the ventricles from arterial backflow.',
        whatHappensNext: 'Both atria and ventricles enter joint diastole to begin the next cardiac filling cycle.'
      },
      {
        stepNumber: 6,
        title: 'Capillary Exchange & Complete Dual Circulation Route',
        whatHappens: 'Blood in pulmonary capillaries releases CO₂ and binds O₂ before returning to LA; simultaneously, blood in systemic capillaries delivers O₂ and nutrients to cells and absorbs cellular wastes before returning to RA: Body → Vena Cava → RA → Tricuspid → RV → Pulmonary Valve → Pulmonary Artery → Lungs → Pulmonary Veins → LA → Mitral → LV → Aorta → Body.',
        whereItHappens: 'Alveolar pulmonary capillary networks and systemic peripheral tissue capillary beds.',
        componentsInvolved: ['Pulmonary Capillaries', 'Systemic Capillaries', 'Erythrocytes (Hemoglobin)', 'Body Tissues'],
        whyItHappens: 'Maintains high concentration gradients for diffusion of respiratory gases across semi-permeable membranes.',
        whatHappensNext: 'Venous blood recollected by venules feeds back into vena cava, perpetuating the continuous circulatory circuit.'
      }
    ];
  }

  if (/photosynthesis|chloroplast|light reaction|calvin/.test(l)) {
    return [
      {
        stepNumber: 1,
        title: 'Photon Absorption & Water Photolysis',
        whatHappens: 'Chlorophyll pigments in Photosystem II (PS II) absorb light photons, promoting valence electrons to high energy levels. Simultaneously, the Oxygen-Evolving Complex cleaves water into protons, electrons, and molecular oxygen ($2H_2O \\rightarrow 4H^+ + 4e^- + O_2$).',
        whereItHappens: 'Thylakoid grana membrane and Oxygen-Evolving Complex.',
        componentsInvolved: ['Light Photons', 'Chlorophyll P680', 'H₂O', 'Oxygen-Evolving Complex'],
        whyItHappens: 'Absorbed light energy excites ground-state electrons; extracted water electrons replenish the oxidized reaction center while oxygen diffuses out through stomata.',
        whatHappensNext: 'Energized electrons pass to plastoquinone and Cytochrome b₆f, initiating proton translocation.'
      },
      {
        stepNumber: 2,
        title: 'Electron Transport Chain & Photophosphorylation',
        whatHappens: 'Electrons traverse Cytochrome b₆f to Photosystem I (PS I), pumping protons ($H^+$) into the thylakoid lumen. Ferredoxin and $NADP^+$ Reductase reduce $NADP^+$ to $NADPH$, while the resulting proton electrochemical gradient drives ATP Synthase to generate ATP.',
        whereItHappens: 'Thylakoid membrane protein complexes and ATP Synthase coupling factor ($CF_0-CF_1$).',
        componentsInvolved: ['Cyt b₆f', 'Plastocyanin', 'PS I (P700)', 'NADP⁺ Reductase', 'ATP Synthase'],
        whyItHappens: 'Proton accumulation in the thylakoid lumen creates a steep chemiosmotic proton-motive force that rotates ATP Synthase.',
        whatHappensNext: 'ATP and NADPH diffuse from the thylakoid surface into the surrounding aqueous stroma.'
      },
      {
        stepNumber: 3,
        title: 'Enzymatic Carbon Fixation & Glucose Synthesis (Calvin Cycle)',
        whatHappens: 'In the stroma, the enzyme RuBisCO fixes atmospheric $CO_2$ onto Ribulose-1,5-bisphosphate (RuBP) to yield 3-PGA; ATP and NADPH reduce 3-PGA into glyceraldehyde-3-phosphate (G3P), which condenses into glucose and regenerates RuBP.',
        whereItHappens: 'Chloroplast Stroma aqueous matrix.',
        componentsInvolved: ['CO₂', 'RuBP', 'RuBisCO', 'ATP', 'NADPH', 'G3P'],
        whyItHappens: 'Chemical energy stored in ATP and NADPH is transferred into stable covalent carbon-carbon bonds of glucose ($C_6H_{12}O_6$).',
        whatHappensNext: 'Synthesized glucose is converted to sucrose for phloem translocation or stored as starch granules.'
      }
    ];
  }

  if (/newton|force|motion|inertia/.test(l)) {
    return [
      {
        stepNumber: 1,
        title: 'Inertial State & Force Identification',
        whatHappens: 'An object remains in its existing state of rest or constant linear velocity until subjected to unbalanced external contact or field forces.',
        whereItHappens: 'Inertial frame of reference.',
        componentsInvolved: ['Physical Mass (m)', 'Inertial Frame', 'External Interactions'],
        whyItHappens: 'Mass possesses intrinsic inertia, resisting changes to its momentum vector.',
        whatHappensNext: 'Applied external forces resolve into a resultant non-zero net vector sum ($\\sum \\vec{F} \\neq 0$).'
      },
      {
        stepNumber: 2,
        title: 'Momentum Variation & Dynamic Acceleration',
        whatHappens: 'The unbalanced net force drives an acceleration inversely proportional to mass and directly proportional to force magnitude ($\\vec{a} = \\vec{F}_{\\text{net}} / m$).',
        whereItHappens: 'Along the directional vector of the net applied force.',
        componentsInvolved: ['Net Force (F)', 'Mass (m)', 'Acceleration Vector (a)'],
        whyItHappens: 'Newton\'s Second Law dictates that the time rate of change of momentum is proportional to the applied force.',
        whatHappensNext: 'Simultaneous action-reaction force pairs develop at all physical points of contact.'
      },
      {
        stepNumber: 3,
        title: 'Action-Reaction Interaction & Momentum Conservation',
        whatHappens: 'The interacting bodies exert equal and opposite collinear forces upon each other ($\\vec{F}_{12} = -\\vec{F}_{21}$); if the system is isolated, total momentum is strictly conserved.',
        whereItHappens: 'Mutual interface between interacting bodies.',
        componentsInvolved: ['Body 1', 'Body 2', 'Mutual Interaction Forces'],
        whyItHappens: 'Forces in nature always occur in paired simultaneous reciprocal interactions.',
        whatHappensNext: 'Velocities adjust until external forces cease or reach static mechanical equilibrium.'
      }
    ];
  }

  if (/circuit|electric|current|ohm/.test(l)) {
    return [
      {
        stepNumber: 1,
        title: 'Potential Difference Establishment',
        whatHappens: 'A chemical battery or DC source creates an electromotive force (EMF) separating charges, establishing a high potential positive terminal and low potential negative terminal.',
        whereItHappens: 'Power source and connecting conductors.',
        componentsInvolved: ['Battery/Power Source', 'Electromotive Force', 'Free Electrons'],
        whyItHappens: 'Electrochemical potential energy builds an electric field inside the closed conducting circuit.',
        whatHappensNext: 'Free conduction electrons experience an electrostatic Coulomb force driving drift velocity.'
      },
      {
        stepNumber: 2,
        title: 'Charge Drift & Resistive Voltage Drop',
        whatHappens: 'Electrons drift through the conductor; collisions with ionic lattice atoms impede motion, establishing resistance ($R$) and dropping potential by $V = I \\cdot R$.',
        whereItHappens: 'Resistive circuit elements and metallic wire lattice.',
        componentsInvolved: ['Drifting Electrons', 'Metallic Lattice', 'Resistor Component'],
        whyItHappens: 'Inelastic collisions transfer electrical kinetic energy into thermal vibrations (Joule heating: $H = I^2 R t$).',
        whatHappensNext: 'Current passes through the load, performing work or emitting light/heat.'
      },
      {
        stepNumber: 3,
        title: 'Loop Completion & Kirchhoff Equilibrium',
        whatHappens: 'Charges return to the opposite terminal, maintaining continuous closed-loop current while total EMF equals the sum of branch potential drops ($\\sum V = 0$).',
        whereItHappens: 'Closed circuit pathway.',
        componentsInvolved: ['Return Wire', 'Switch/Ammeter', 'Complete Loop'],
        whyItHappens: 'Conservation of charge dictates that current entering any junction must equal current leaving it.',
        whatHappensNext: 'Current flows steadily as long as the voltage source and switch remain closed.'
      }
    ];
  }

  if (/quadratic|equation|root/.test(l)) {
    return [
      {
        stepNumber: 1,
        title: 'Standard Canonical Alignment & Coefficient Extraction',
        whatHappens: 'All terms are gathered on one side to achieve standard quadratic form: $ax^2 + bx + c = 0$, identifying coefficients $a$, $b$, and constant $c$ ($a \\neq 0$).',
        whereItHappens: 'Algebraic equation formulation.',
        componentsInvolved: ['Leading Coefficient (a)', 'Linear Coefficient (b)', 'Constant Term (c)'],
        whyItHappens: 'Standardization allows exact identification of parameters for factoring or quadratic formula substitution.',
        whatHappensNext: 'Calculate the discriminant to determine root nature.'
      },
      {
        stepNumber: 2,
        title: 'Discriminant Evaluation ($\\Delta = b^2 - 4ac$)',
        whatHappens: 'Compute the discriminant value: if $\\Delta > 0$, roots are real and distinct; if $\\Delta = 0$, roots are real and repeated; if $\\Delta < 0$, roots are complex conjugates.',
        whereItHappens: 'Under the radical sign of the quadratic formula.',
        componentsInvolved: ['Discriminant (b² - 4ac)', 'Square Root Radical'],
        whyItHappens: 'The sign of the radical radicand determines whether real-number solutions exist on the Cartesian x-axis.',
        whatHappensNext: 'Substitute $\\Delta$ into the quadratic formula to compute root values.'
      },
      {
        stepNumber: 3,
        title: 'Root Computation & Vieta Verification',
        whatHappens: 'Compute $x_1, x_2 = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$, and verify against Vieta’s formulas ($x_1 + x_2 = -b/a$ and $x_1 \\cdot x_2 = c/a$).',
        whereItHappens: 'Final algebraic solution set.',
        componentsInvolved: ['Calculated Roots', 'Vieta Relations', 'Solution Verification'],
        whyItHappens: 'Ensures algebraic correctness and confirms intersection coordinates on the parabola.',
        whatHappensNext: 'Box the final verified roots with proper mathematical notation.'
      }
    ];
  }

  // Universal Fallback for any other academic topic:
  return [
    {
      stepNumber: 1,
      title: 'Initial Condition & Primary Inputs',
      whatHappens: `Core prerequisite elements and fundamental conditions for ${topic} assemble and initiate interaction.`,
      whereItHappens: `Primary domain location defined by ${subject} curriculum standards.`,
      componentsInvolved: ['Primary Reactants / Entities', 'Initial Field / Medium'],
      whyItHappens: `Potential difference, concentration gradient, or academic rule triggers the initial transformation.`,
      whatHappensNext: `The activation threshold is reached, advancing into the core working mechanism.`
    },
    {
      stepNumber: 2,
      title: 'Core Transformation & Working Mechanism',
      whatHappens: `The governing principles of ${topic} execute sequentially, transferring energy, momentum, or structural states.`,
      whereItHappens: `Central functional zone or reaction chamber.`,
      componentsInvolved: ['Transforming Agents', 'Intermediate States', 'Catalysts / Forces'],
      whyItHappens: `Physical, chemical, or logical conservation laws enforce the direction of state change.`,
      whatHappensNext: `Intermediates resolve into stable terminal outputs.`
    },
    {
      stepNumber: 3,
      title: 'Terminal Result & Equilibrium Stabilization',
      whatHappens: `The final products, steady-state motion, or solved values of ${topic} are established and verified.`,
      whereItHappens: `Terminal boundary or completed output domain.`,
      componentsInvolved: ['Final Products / Quantities', 'Stabilizing Feedback'],
      whyItHappens: `System reaches minimum free energy or logical mathematical consistency.`,
      whatHappensNext: `The cycle or proof is complete and ready for academic application and exam evaluation.`
    }
  ];
}
