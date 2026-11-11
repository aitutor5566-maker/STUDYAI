/**
 * STUDYAI — Professional Teaching Intelligence Engine
 * 
 * Implements the core pedagogical principle:
 *   SEE IT → UNDERSTAND IT → CONNECT IT → REMEMBER IT → APPLY IT.
 * 
 * Universal cross-subject teaching intelligence adapting to student grade (1-10),
 * curriculum board (CBSE, ICSE, AP State Board, TS State Board), language (English, Telugu, Hindi),
 * and educational discipline (Math, Physics, Biology, Chemistry, History, Geography, Language, CS).
 */

import crypto from 'node:crypto';
import { classifyUniversalTopic, type TopicClassification } from './universalSubjectClassifier.ts';
import { getSubtopicDiagramsForTopic, type SubtopicDiagramItem } from './subtopicDiagramCatalog.ts';
import { unifiedKnowledgeRetrieval, type UnifiedRetrievedKnowledge } from './unifiedKnowledgeRetrieval.ts';
import { AcademicVerificationService } from './centralAiOrchestrator.ts';
import { extractAndExplainAbbreviations, type AbbreviationItem } from './tutorRebuildEngine.ts';

export type EducationalDiscipline =
  | 'Mathematics'
  | 'Physics'
  | 'Biology'
  | 'Chemistry'
  | 'History'
  | 'Geography'
  | 'Language'
  | 'ComputerScience'
  | 'GeneralScience'
  | 'SocialStudies';

export type ComplexityLevel = 'foundational' | 'intermediate' | 'advanced';

export type TeachingMode = 'normal' | 'exam';

export interface StudentTeachingProfile {
  studentId?: string;
  studentName?: string;
  grade: number;
  board: string;
  language: 'English' | 'Telugu' | 'Hindi';
  explanationDepth?: 'concise' | 'balanced' | 'detailed';
  priorMasteryLevel?: ComplexityLevel;
}

export interface SideBySideVisualLessonSection {
  sectionId: string;
  title: string;
  subtopicKey: string;
  visual: {
    id: string;
    title: string;
    caption: string;
    svgXml?: string;
    imageUrl?: string;
    diagramType: string;
    labels: Array<{ label: string; description: string }>;
  };
  explanation: {
    // 1. SEE IT (What am I looking at?)
    seeIt_whatAmILookingAt: string;
    seeIt_keyComponents: Array<{ label: string; description: string; role: string }>;
    // 2. UNDERSTAND IT (How does it work and why?)
    understandIt_howItWorks: string;
    understandIt_stepByStepMechanism: string[];
    understandIt_whyItHappens: string;
    // 3. CONNECT IT (Real-world and curriculum connection)
    connectIt_realWorldApplication: string;
    connectIt_whereItOccurs: string;
    // 4. REMEMBER IT (Formulas, terminology and takeaways)
    rememberIt_coreFormulaOrRule?: string;
    rememberIt_keyTakeaway: string;
    rememberIt_abbreviations?: AbbreviationItem[];
    // 5. APPLY IT (Practice problem or exam tip)
    applyIt_workedExampleOrPractice?: {
      problem: string;
      stepByStepSolution: string[];
      answer: string;
    };
    applyIt_examTip: string;
  };
}

export interface ProfessionalTeacherLesson {
  lessonId: string;
  topic: string;
  subject: string;
  discipline: EducationalDiscipline;
  grade: number;
  board: string;
  language: string;
  mode: TeachingMode;
  complexityLevel: ComplexityLevel;
  teacherGreeting: string;
  laymanIntroduction: string;
  formalAcademicDefinition: string;
  sideBySideSections: SideBySideVisualLessonSection[];
  differencesAndComparisons?: {
    title: string;
    conceptA: string;
    conceptB: string;
    rows: Array<{ aspect: string; itemA: string; itemB: string }>;
  };
  workedProblem?: {
    statement: string;
    given: Array<{ variable: string; value: string; unit: string }>;
    formula: string;
    substitution: string;
    steps: string[];
    finalAnswer: string;
    verification: string;
  };
  abbreviationsList: AbbreviationItem[];
  commonMisconceptionsClarified: Array<{ misconception: string; scientificFact: string }>;
  understandingCheckQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  sourcesCited: Array<{ title: string; publisher: string; board: string; grade: number }>;
  singlePageDigitalTextbookMarkdown: string;
}

export class ProfessionalTeachingIntelligenceEngine {
  private verifier = new AcademicVerificationService();

  /**
   * Determine exact educational discipline from subject and topic
   */
  public resolveDiscipline(topic: string, subject?: string): EducationalDiscipline {
    const combined = `${subject || ''} ${topic || ''}`.toLowerCase();
    if (/(math|algebra|geometry|calculus|arithmetic|fraction|trigonometr|quadratic|number|polygon|triangle)/.test(combined)) {
      return 'Mathematics';
    }
    if (/(physics|force|motion|newton|gravity|energy|power|work|electricity|magnet|optics|lens|ohm|thermodynamic|fluid)/.test(combined)) {
      return 'Physics';
    }
    if (/(biology|cell|heart|cardiac|photosynthesis|mitosis|dna|organ|plant|respiration|circulation|digest|reproduction|ecosystem)/.test(combined)) {
      return 'Biology';
    }
    if (/(chemist|chemical|reaction|bonding|atom|molecul|acid|base|salt|periodic|metal|redox|stoichiometr|compound)/.test(combined)) {
      return 'Chemistry';
    }
    if (/(history|war|revolution|gandhi|independence|treaty|monarchy|civilization|empire|colonial|battle|dynasty)/.test(combined)) {
      return 'History';
    }
    if (/(geograph|water cycle|river|landform|soil|climate|atmosphere|earthquake|volcano|plate tectonic|map|drainage)/.test(combined)) {
      return 'Geography';
    }
    if (/(grammar|english|sentence|verb|noun|clause|tense|voice|speech|synonym|vocabulary|comprehension)/.test(combined)) {
      return 'Language';
    }
    if (/(algorithm|computer|program|binary search|sorting|code|flowchart|data structure|logic gate|boolean|array)/.test(combined)) {
      return 'ComputerScience';
    }
    if (/(civics|polity|constitution|democracy|parliament|judiciary|election|citizen)/.test(combined)) {
      return 'SocialStudies';
    }
    return 'GeneralScience';
  }

  /**
   * Determine complexity level adaptively based on grade and topic
   */
  public resolveComplexity(grade: number, topic: string): ComplexityLevel {
    if (grade <= 5) return 'foundational';
    if (grade <= 8) return 'intermediate';
    return 'advanced';
  }

  /**
   * Generates a complete, pedagogical lesson plan following:
   * SEE IT → UNDERSTAND IT → CONNECT IT → REMEMBER IT → APPLY IT.
   */
  public async planAndCreateLesson(params: {
    topic: string;
    question?: string;
    subject?: string;
    grade?: number;
    board?: string;
    language?: 'English' | 'Telugu' | 'Hindi';
    mode?: TeachingMode;
    studentName?: string;
    studentId?: string;
  }): Promise<ProfessionalTeacherLesson> {
    const topic = (params.topic || params.question || 'Science Concept').trim();
    const grade = Math.max(1, Math.min(10, params.grade || 10));
    const board = params.board || 'CBSE';
    const language = params.language || 'English';
    const mode = params.mode || 'normal';
    const studentName = params.studentName || 'Learner';

    const discipline = this.resolveDiscipline(topic, params.subject);
    const complexityLevel = this.resolveComplexity(grade, topic);

    // 1. Retrieve Verified Indian Academic Knowledge from Multi-Board Library
    const retrieved: UnifiedRetrievedKnowledge = await unifiedKnowledgeRetrieval.retrieve({
      topic,
      subject: params.subject,
      grade,
      board,
      language
    });

    // 2. Retrieve topic-specific verified educational diagrams
    const diagrams = getSubtopicDiagramsForTopic(topic, params.subject);

    // 3. Extract Abbreviations & Technical Terms
    const abbreviationsList = extractAndExplainAbbreviations(
      topic,
      topic,
      `${retrieved.dualExplanation.laymanEverydayExplanation} ${retrieved.dualExplanation.academicFormalDefinition} ${retrieved.dualExplanation.stepByStepMechanism.join(' ')}`
    );

    // 4. Build Side-by-Side Visual Teaching Sections (SEE IT → UNDERSTAND IT → CONNECT IT → REMEMBER IT → APPLY IT)
    const sideBySideSections: SideBySideVisualLessonSection[] = diagrams.map((diag, idx) => {
      const labels = diag.point2_labelledParts.map((p) => ({
        label: p.label,
        description: p.description,
        role: p.description
      }));

      return {
        sectionId: `sec-${diag.diagramId || idx}`,
        title: diag.subtopicTitle,
        subtopicKey: diag.subtopicKey,
        visual: {
          id: diag.diagramId || `diag-${idx}`,
          title: diag.diagramTitle,
          caption: diag.caption,
          svgXml: diag.svgXml,
          imageUrl: diag.imageUrl || diag.dataUrl,
          diagramType: diag.diagramType,
          labels: diag.point2_labelledParts
        },
        explanation: {
          // 1. SEE IT
          seeIt_whatAmILookingAt: diag.point1_whatItRepresents,
          seeIt_keyComponents: labels,
          // 2. UNDERSTAND IT
          understandIt_howItWorks: diag.point3_componentFunctions,
          understandIt_stepByStepMechanism: diag.point6_stepByStepInterpretation,
          understandIt_whyItHappens: diag.point4_componentRelationships,
          // 3. CONNECT IT
          connectIt_realWorldApplication: diag.point7_learningOutcome,
          connectIt_whereItOccurs: `Within the curriculum scope of ${diag.subtopicTitle} (${board} Class ${grade}).`,
          // 4. REMEMBER IT
          rememberIt_coreFormulaOrRule: (retrieved.universalNode.governingFormulas[0]?.formula) || undefined,
          rememberIt_keyTakeaway: diag.point8_whatToRemember,
          rememberIt_abbreviations: abbreviationsList.slice(0, 3),
          // 5. APPLY IT
          applyIt_workedExampleOrPractice: {
            problem: `How does ${diag.subtopicTitle} behave under direct curriculum conditions?`,
            stepByStepSolution: [
              `Step 1: Identify participating components (${labels.slice(0, 2).map((l) => l.label).join(', ')}).`,
              `Step 2: Trace the physical or chemical direction (${diag.point5_directionOfMovementOrProcess}).`,
              `Step 3: State the scientific outcome: ${diag.point8_whatToRemember}.`
            ],
            answer: diag.point8_whatToRemember
          },
          applyIt_examTip: `Examiners reward students who clearly sketch this diagram and label: ${labels.slice(0, 3).map((l) => l.label).join(', ')}.`
        }
      };
    });

    // 5. Teacher Greeting & Introductions
    const greeting = this.buildTeacherGreeting(studentName, topic, grade, board, language, discipline);
    const laymanIntro = this.buildLaymanIntro(topic, discipline, grade, language, retrieved);
    const formalDef = retrieved.dualExplanation.academicFormalDefinition;

    // 6. Discipline-Specific Worked Numerical / Problem
    const workedProblem = this.buildDisciplineProblem(topic, discipline, grade, retrieved);

    // 7. Differences & Comparisons Table
    const differencesAndComparisons = this.buildComparisons(topic, discipline, retrieved);

    // 8. Misconceptions
    const commonMisconceptionsClarified = retrieved.dualExplanation.commonMisconceptions.map((m) => ({
      misconception: m,
      scientificFact: `In accordance with verified ${board} academic standards, this is incorrect because the process is governed by: ${retrieved.universalNode.fundamentalLaws.join(', ')}.`
    }));

    // 9. Diagnostic Understanding Check Question
    const understandingCheckQuestion = this.buildUnderstandingCheck(topic, discipline, sideBySideSections[0], retrieved);

    // 10. Digital Textbook Markdown with Side-by-Side Visual Pairs
    const markdown = this.renderDigitalTextbookMarkdown({
      topic,
      subject: retrieved.boardRequirement.officialSubjectName,
      grade,
      board,
      language,
      discipline,
      mode,
      greeting,
      laymanIntro,
      formalDef,
      sideBySideSections,
      differencesAndComparisons,
      workedProblem,
      abbreviationsList,
      misconceptions: commonMisconceptionsClarified,
      understandingCheck: understandingCheckQuestion,
      sources: retrieved.sources
    });

    return {
      lessonId: `lesson-${crypto.randomUUID().slice(0, 10)}`,
      topic,
      subject: retrieved.boardRequirement.officialSubjectName,
      discipline,
      grade,
      board,
      language,
      mode,
      complexityLevel,
      teacherGreeting: greeting,
      laymanIntroduction: laymanIntro,
      formalAcademicDefinition: formalDef,
      sideBySideSections,
      differencesAndComparisons,
      workedProblem,
      abbreviationsList,
      commonMisconceptionsClarified,
      understandingCheckQuestion,
      sourcesCited: retrieved.sources.map((s) => ({
        title: s.title,
        publisher: s.publisher,
        board: s.board,
        grade: s.grade
      })),
      singlePageDigitalTextbookMarkdown: markdown
    };
  }

  // ---------------------------------------------------------------------------
  // Helper Generators
  // ---------------------------------------------------------------------------

  private buildTeacherGreeting(
    studentName: string,
    topic: string,
    grade: number,
    board: string,
    language: string,
    discipline: EducationalDiscipline
  ): string {
    const isTe = language === 'Telugu';
    const isHi = language === 'Hindi';

    if (isTe) {
      return `నమస్కారం ${studentName}! మనం ఈ రోజు ${board} 10వ తరగతి కి సంబంధించిన "${topic}" అంశాన్ని స్పష్టమైన చిత్రాలతో, సులభంగా అర్థం చేసుకుందాం.`;
    }
    if (isHi) {
      return `नमस्ते ${studentName}! आज हम ${board} कक्षा ${grade} के महत्वपूर्ण विषय "${topic}" को स्पष्ट आरेखों और उदाहरणों के साथ समझेंगे।`;
    }

    return `Hello ${studentName}! Welcome to your dedicated ${discipline} lesson on "${topic}". Together, we will walk through the core principles using clear visual diagrams, step-by-step mechanisms, and practical exam takeaways.`;
  }

  private buildLaymanIntro(
    topic: string,
    discipline: EducationalDiscipline,
    grade: number,
    language: string,
    retrieved: UnifiedRetrievedKnowledge
  ): string {
    if (language === 'Telugu' && retrieved.languageLocalized.localizedLaymanIntro) {
      return retrieved.languageLocalized.localizedLaymanIntro;
    }
    if (retrieved.dualExplanation.laymanEverydayExplanation) {
      return retrieved.dualExplanation.laymanEverydayExplanation;
    }
    return `In simple words, **${topic}** is an essential principle in **${discipline}** that explains how foundational elements interact systematically to produce a predictable outcome in the natural and academic world.`;
  }

  private buildDisciplineProblem(
    topic: string,
    discipline: EducationalDiscipline,
    grade: number,
    retrieved: UnifiedRetrievedKnowledge
  ) {
    const lower = topic.toLowerCase();
    if (discipline === 'Physics' || lower.includes('force') || lower.includes('motion') || lower.includes('work')) {
      return {
        statement: 'A net horizontal force of 25 N acts on a mass of 5.0 kg resting on a frictionless plane for a displacement of 4.0 m. Calculate the acceleration of the mass and the total work done.',
        given: [
          { variable: 'F (Force)', value: '25', unit: 'N' },
          { variable: 'm (Mass)', value: '5.0', unit: 'kg' },
          { variable: 's (Displacement)', value: '4.0', unit: 'm' }
        ],
        formula: 'F = m · a  and  W = F · s · cos(0°)',
        substitution: 'a = 25 / 5.0  and  W = 25 · 4.0 · 1',
        steps: [
          '1. By Newton’s Second Law: a = F / m = 25 N / 5.0 kg = 5.0 m/s².',
          '2. The displacement is in the line of the force (θ = 0°), so cos(0°) = 1.',
          '3. Calculate Work Done: W = 25 N · 4.0 m = 100.0 Joules (J).'
        ],
        finalAnswer: 'Acceleration = 5.0 m/s²; Work Done = 100 J',
        verification: 'Work-energy theorem check: Kinetic energy gained = ½ · 5.0 · (2·5.0·4.0) = 100 J. Dimensional consistency verified.'
      };
    }

    if (discipline === 'Mathematics' || lower.includes('fraction') || lower.includes('geometry') || lower.includes('quadratic')) {
      return {
        statement: 'Solve the quadratic equation 2x² - 7x + 3 = 0 using the quadratic formula and determine the nature of its roots.',
        given: [
          { variable: 'a', value: '2', unit: 'coefficient' },
          { variable: 'b', value: '-7', unit: 'coefficient' },
          { variable: 'c', value: '3', unit: 'constant' }
        ],
        formula: 'x = (-b ± √(b² - 4ac)) / (2a); Discriminant D = b² - 4ac',
        substitution: 'D = (-7)² - 4(2)(3) = 49 - 24 = 25',
        steps: [
          '1. Calculate Discriminant: D = 49 - 24 = 25. Since D > 0 and is a perfect square, roots are real, rational, and distinct.',
          '2. Substitute into quadratic formula: x = (7 ± √25) / (2 · 2) = (7 ± 5) / 4.',
          '3. First root: x₁ = (7 + 5) / 4 = 12 / 4 = 3.',
          '4. Second root: x₂ = (7 - 5) / 4 = 2 / 4 = 0.5 (or 1/2).'
        ],
        finalAnswer: 'x = 3  or  x = 1/2',
        verification: 'Check: 2(3)² - 7(3) + 3 = 18 - 21 + 3 = 0. Both roots satisfy the equation perfectly.'
      };
    }

    return undefined;
  }

  private buildComparisons(topic: string, discipline: EducationalDiscipline, retrieved: UnifiedRetrievedKnowledge) {
    const lower = topic.toLowerCase();
    if (lower.includes('heart') || lower.includes('circulation')) {
      return {
        title: 'Comparison: Arteries vs Veins in Human Circulation',
        conceptA: 'Arteries',
        conceptB: 'Veins',
        rows: [
          { aspect: 'Direction of Blood Flow', itemA: 'Carries oxygenated blood away from the heart to tissues (except Pulmonary Artery)', itemB: 'Carries deoxygenated blood back to the heart from tissues (except Pulmonary Vein)' },
          { aspect: 'Internal Blood Pressure', itemA: 'High pressure in rhythmic spurts directly from ventricular contraction', itemB: 'Low, steady uniform pressure assisted by skeletal muscle contractions' },
          { aspect: 'Vessel Wall Anatomy', itemA: 'Thick, highly elastic muscular walls with narrow lumen to withstand pressure', itemB: 'Thin, less muscular walls with large wide lumen' },
          { aspect: 'Presence of Valves', itemA: 'No internal valves (except semilunar valves at base of aorta/pulmonary trunk)', itemB: 'Possesses semilunar pocket valves to prevent backward flow of blood' }
        ]
      };
    }

    if (lower.includes('photosynthesis')) {
      return {
        title: 'Comparison: Light Reactions vs Dark Reactions (Calvin Cycle)',
        conceptA: 'Light-Dependent Reactions (Grana)',
        conceptB: 'Light-Independent Reactions (Stroma)',
        rows: [
          { aspect: 'Site of Occurrence', itemA: 'Thylakoid membranes of chloroplast grana', itemB: 'Stroma fluid matrix of chloroplast' },
          { aspect: 'Direct Light Requirement', itemA: 'Strictly requires photons of light to excite chlorophyll pigments', itemB: 'Does not directly require light; utilizes chemical products of light stage' },
          { aspect: 'Key Energy Transformation', itemA: 'Photolysis of water generating ATP and NADPH while releasing O₂', itemB: 'Carbon fixation reducing CO₂ into glucose sugar using ATP & NADPH' }
        ]
      };
    }

    return undefined;
  }

  private buildUnderstandingCheck(
    topic: string,
    discipline: EducationalDiscipline,
    primarySection: SideBySideVisualLessonSection | undefined,
    retrieved: UnifiedRetrievedKnowledge
  ) {
    const lower = topic.toLowerCase();

    if (lower.includes('photosynthesis')) {
      return {
        question: 'During photosynthesis, which specific reaction phase is directly responsible for releasing molecular oxygen (O₂) into the atmosphere?',
        options: [
          'Fixation of carbon dioxide in the stroma by RuBisCO during the Calvin cycle',
          'Photolysis (light-driven splitting) of water molecules in Photosystem II on the thylakoid membrane',
          'Phosphorylation of ADP into ATP in the cytoplasm',
          'Transport of sucrose through the phloem vascular sieve tubes'
        ],
        correctIndex: 1,
        explanation: 'Molecular oxygen is liberated as a byproduct of the photolysis of water (2H₂O → 4H⁺ + 4e⁻ + O₂) occurring inside the thylakoid lumen during the light-dependent phase.'
      };
    }

    if (lower.includes('heart')) {
      return {
        question: 'Why does the left ventricle of the mammalian heart possess a myocardium wall significantly thicker than the right ventricle?',
        options: [
          'It stores a larger total volume of blood before each contraction',
          'It must pump blood through the high-resistance systemic circulation to the entire body against high hydrostatic pressure',
          'It generates electrical impulses that regulate the sinoatrial (SA) node pacemaker',
          'It receives deoxygenated venous return directly from the superior vena cava'
        ],
        correctIndex: 1,
        explanation: 'The right ventricle pumps blood only a short distance to the low-resistance pulmonary circuit (lungs), whereas the left ventricle must overcome high systemic vascular resistance to distribute blood to the entire body.'
      };
    }

    if (lower.includes('newton') || lower.includes('force')) {
      return {
        question: 'According to Newton’s Second Law of Motion, what occurs to the acceleration of an object if the net applied force is doubled while its mass is also doubled?',
        options: [
          'The acceleration is quadrupled (multiplied by 4)',
          'The acceleration is doubled (multiplied by 2)',
          'The acceleration remains exactly unchanged',
          'The acceleration is halved (divided by 2)'
        ],
        correctIndex: 2,
        explanation: 'Since a = F / m, doubling both the force (2F) and the mass (2m) yields a = (2F)/(2m) = F/m, meaning acceleration remains completely unchanged.'
      };
    }

    // Default Diagnostic Question
    return {
      question: `What is the primary governing principle of ${topic}?`,
      options: [
        `It operates according to: ${retrieved.universalNode.fundamentalLaws[0] || 'conservation principles'}`,
        'It occurs completely randomly without governing physical or chemical laws',
        'It violates the conservation of energy and mass',
        'It is strictly theoretical and has no real-world application'
      ],
      correctIndex: 0,
      explanation: `${topic} is governed by foundational scientific laws, notably ${retrieved.universalNode.fundamentalLaws.join(', ')}.`
    };
  }

  // ---------------------------------------------------------------------------
  // Digital Textbook Markdown Renderer (Side-by-Side Visual Pairs)
  // ---------------------------------------------------------------------------

  private renderDigitalTextbookMarkdown(p: {
    topic: string;
    subject: string;
    grade: number;
    board: string;
    language: string;
    discipline: EducationalDiscipline;
    mode: TeachingMode;
    greeting: string;
    laymanIntro: string;
    formalDef: string;
    sideBySideSections: SideBySideVisualLessonSection[];
    differencesAndComparisons?: any;
    workedProblem?: any;
    abbreviationsList: AbbreviationItem[];
    misconceptions: any[];
    understandingCheck: any;
    sources: any[];
  }): string {
    const lines: string[] = [];

    lines.push(`# ${p.topic}`);
    lines.push(`*Curriculum: ${p.board} • Grade ${p.grade} • Subject: ${p.subject} • Teaching Mode: ${p.mode === 'exam' ? 'Deep Exam Preparation ⚡' : 'Normal Learning Mode 🌱'}*`);
    lines.push('');
    lines.push('---');
    lines.push('');

    // Teacher Greeting Callout
    lines.push('> [!NOTE]');
    lines.push(`> **Personal AI Teacher Introduction:**  `);
    lines.push(`> ${p.greeting}`);
    lines.push('');

    // Section 1: Layman Everyday Introduction
    lines.push('## 1. Everyday Understanding (In Plain Words)');
    lines.push(p.laymanIntro);
    lines.push('');

    // Section 2: Formal Academic Textbook Definition
    lines.push('## 2. Formal Academic Definition');
    lines.push('> **Prescribed Textbook Definition:**  ');
    lines.push(`> ${p.formalDef}`);
    lines.push('');

    // Section 3: Visual Concept Gallery (SIDE-BY-SIDE PAIRS)
    lines.push('## 3. Visual Concept Breakdown & Explanations');
    lines.push('*The following section pairs every verified educational diagram directly with its step-by-step scientific explanation. Use the 5-point sequence: **SEE IT → UNDERSTAND IT → CONNECT IT → REMEMBER IT → APPLY IT**.*');
    lines.push('');

    p.sideBySideSections.forEach((sec, idx) => {
      lines.push(`### Concept ${idx + 1}: ${sec.title}`);
      lines.push('');
      // Markdown Image
      lines.push(`![${sec.visual.title}](${sec.visual.imageUrl || ''})`);
      lines.push(`*Fig ${idx + 1}.1: ${sec.visual.caption}*`);
      lines.push('');
      // Explanation directly paired
      lines.push(`#### 🔍 1. SEE IT (What Am I Looking At?)`);
      lines.push(sec.explanation.seeIt_whatAmILookingAt);
      lines.push('');
      lines.push('**Important Labelled Parts:**');
      sec.explanation.seeIt_keyComponents.forEach((c) => {
        lines.push(`- **${c.label}:** ${c.description}`);
      });
      lines.push('');

      lines.push(`#### ⚙️ 2. UNDERSTAND IT (How It Works & Mechanism)`);
      lines.push(sec.explanation.understandIt_howItWorks);
      lines.push('');
      lines.push('**Step-by-Step Sequence:**');
      sec.explanation.understandIt_stepByStepMechanism.forEach((st) => {
        lines.push(`${st}`);
      });
      lines.push('');
      lines.push(`**Why This Happens:** ${sec.explanation.understandIt_whyItHappens}`);
      lines.push('');

      lines.push(`#### 🔗 3. CONNECT IT (Real-Life & Curriculum Context)`);
      lines.push(`- **Real-World Application:** ${sec.explanation.connectIt_realWorldApplication}`);
      lines.push(`- **Curriculum Occurrence:** ${sec.explanation.connectIt_whereItOccurs}`);
      lines.push('');

      lines.push(`#### 🧠 4. REMEMBER IT (Core Rule & Exam Takeaways)`);
      if (sec.explanation.rememberIt_coreFormulaOrRule) {
        lines.push(`- **Governing Formula / Rule:** \`${sec.explanation.rememberIt_coreFormulaOrRule}\``);
      }
      lines.push(`- **Crucial Fact to Remember:** **${sec.explanation.rememberIt_keyTakeaway}**`);
      lines.push('');

      lines.push(`#### 🎯 5. APPLY IT (Exam Tip & Self-Check)`);
      lines.push(`> [!TIP]`);
      lines.push(`> **Board Exam Marking Tip:** ${sec.explanation.applyIt_examTip}`);
      lines.push('');
      lines.push('---');
      lines.push('');
    });

    // Section 4: Differences & Comparisons (if applicable)
    if (p.differencesAndComparisons) {
      lines.push(`## 4. Key Differences: ${p.differencesAndComparisons.conceptA} vs ${p.differencesAndComparisons.conceptB}`);
      lines.push('| Aspect of Comparison | ' + p.differencesAndComparisons.conceptA + ' | ' + p.differencesAndComparisons.conceptB + ' |');
      lines.push('| :--- | :--- | :--- |');
      p.differencesAndComparisons.rows.forEach((r: any) => {
        lines.push(`| **${r.aspect}** | ${r.itemA} | ${r.itemB} |`);
      });
      lines.push('');
      lines.push('---');
      lines.push('');
    }

    // Section 5: Worked Numerical / Problem (if applicable)
    if (p.workedProblem) {
      lines.push('## 5. Solved Curriculum Numerical / Problem');
      lines.push(`**Problem Statement:**  \n*${p.workedProblem.statement}*`);
      lines.push('');
      lines.push('| Given Variable | Assigned Value | Standard SI Unit |');
      lines.push('| :--- | :--- | :--- |');
      p.workedProblem.given.forEach((g: any) => {
        lines.push(`| \`${g.variable}\` | ${g.value} | ${g.unit} |`);
      });
      lines.push('');
      lines.push(`**Governing Formula:** \`${p.workedProblem.formula}\``);
      lines.push(`**Substitution:** \`${p.workedProblem.substitution}\``);
      lines.push('');
      lines.push('**Step-by-Step Calculation:**');
      p.workedProblem.steps.forEach((st: string) => lines.push(`- ${st}`));
      lines.push('');
      lines.push(`> **Final Answer:** **${p.workedProblem.finalAnswer}**  \n> *${p.workedProblem.verification}*`);
      lines.push('');
      lines.push('---');
      lines.push('');
    }

    // Section 6: Technical Abbreviations and Full Forms
    if (p.abbreviationsList && p.abbreviationsList.length > 0) {
      lines.push('## 6. Important Technical Abbreviations & Full Forms');
      lines.push('| Abbreviation | Full Scientific Form | Simple Definition | Role in Curriculum |');
      lines.push('| :--- | :--- | :--- | :--- |');
      p.abbreviationsList.forEach((a) => {
        lines.push(`| **${a.abbr}** | ${a.fullForm} | ${a.simpleDefinition} | ${a.roleInTopic} |`);
      });
      lines.push('');
      lines.push('---');
      lines.push('');
    }

    // Section 7: Common Misconceptions Clarified
    if (p.misconceptions && p.misconceptions.length > 0) {
      lines.push('## 7. Common Misconceptions vs Verified Facts');
      p.misconceptions.forEach((m) => {
        lines.push(`- ❌ **Common Misconception:** "${m.misconception}"`);
        lines.push(`  - ✅ **Verified Scientific Truth:** ${m.scientificFact}`);
      });
      lines.push('');
      lines.push('---');
      lines.push('');
    }

    // Section 8: Understanding Check Diagnostic
    lines.push('## 8. Diagnostic Understanding Check');
    lines.push(`**Question:** ${p.understandingCheck.question}`);
    lines.push('');
    p.understandingCheck.options.forEach((opt: string, optIdx: number) => {
      const letter = String.fromCharCode(65 + optIdx);
      lines.push(`- **(${letter})** ${opt}`);
    });
    lines.push('');
    const correctLetter = String.fromCharCode(65 + p.understandingCheck.correctIndex);
    lines.push(`> [!NOTE]`);
    lines.push(`> **Correct Answer:** **(${correctLetter})**  \n> **Explanation:** ${p.understandingCheck.explanation}`);
    lines.push('');
    lines.push('---');
    lines.push('');

    // Section 9: Prescribed Curriculum Sources
    lines.push('## 9. Prescribed Academic Curriculum Sources');
    p.sources.forEach((s) => {
      lines.push(`- 📚 **${s.title}** — Published by *${s.publisher}* for ${s.board} Class ${s.grade}`);
    });

    return lines.join('\n');
  }
}

export const professionalTeacherEngine = new ProfessionalTeachingIntelligenceEngine();
