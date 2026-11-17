import { multiModelAiTeacherEngine } from './multiModelAiTeacherEngine.ts';
import { ResponseValidationLayer, type ComprehensiveValidationReport } from './responseValidationLayer.ts';

export type ExplanationDepthLevel = 'foundation' | 'deep' | 'expert';

export interface DeepLessonRequest {
  topic: string;
  subject: string;
  chapter?: string;
  grade?: number;
  board?: string;
  depthLevel?: ExplanationDepthLevel;
}

export interface DeepLessonComponent {
  name: string;
  definition: string;
  structure: string;
  functionRole: string;
  howItWorks: string;
  importance: string;
  relationships: string;
  example: string;
}

export interface DeepLessonSubtopic {
  id: string;
  title: string;
  definition: string;
  background: string;
  explanation: string;
  workingPrinciple: string;
  example: string;
  application: string;
  connectionToMain: string;
}

export interface DeepLessonDiagram {
  title: string;
  diagramType: string;
  svgMarkup: string;
  labels: Array<{ label: string; meaning: string }>;
  interpretation: {
    whatItRepresents: string;
    howPartsConnect: string;
    processHappening: string;
    whatToObserve: string;
    completeTakeaway: string;
  };
}

export interface DeepLessonPayload {
  topic: string;
  subject: string;
  chapter: string;
  grade: number;
  board: string;
  depthLevel: ExplanationDepthLevel;
  section1_introduction: {
    overview: string;
    whyLearnIt: string;
    learningOutcomes: string[];
    subjectImportance: string;
  };
  section2_definition: {
    formalDefinition: string;
    simpleDefinition: string;
    keyTermsBreakdown: Array<{ term: string; meaning: string }>;
    characteristics: string[];
  };
  section3_basicUnderstanding: {
    prerequisites: string[];
    foundationalTerms: Array<{ term: string; explanation: string }>;
    priorConnections: string;
  };
  section4_howItWorks: Array<{
    stepNumber: number;
    stageTitle: string;
    whatHappens: string;
    whyItHappens: string;
  }>;
  section5_components: DeepLessonComponent[];
  section6_visualExplanation: DeepLessonDiagram;
  section7_subtopics: DeepLessonSubtopic[];
  section8_realWorldApplications: Array<{
    domain: string;
    application: string;
    explanation: string;
  }>;
  section9_workedExamples: Array<{
    title: string;
    context: string;
    steps: string[];
    conclusion: string;
  }>;
  section10_comparisons: Array<{
    conceptA: string;
    conceptB: string;
    difference: string;
    relationship: string;
  }>;
  section11_misconceptions: Array<{
    incorrectIdea: string;
    whyIncorrect: string;
    correctExplanation: string;
    clarifyingExample: string;
  }>;
  section12_glossary: Array<{
    term: string;
    formalMeaning: string;
    simpleMeaning: string;
    unitOrSymbol?: string;
  }>;
  section13_formulasAndRules: Array<{
    name: string;
    expression: string;
    symbols: string;
    units: string;
    whenToUse: string;
    commonMistake: string;
  }>;
  section14_connections: {
    previousLessons: string[];
    relatedChapters: string[];
    crossSubjectLinks: string[];
  };
  section15_examPreparation: {
    oneMarkQuestions: Array<{ q: string; a: string }>;
    twoMarkQuestions: Array<{ q: string; a: string; keywords: string[] }>;
    threeMarkQuestions: Array<{ q: string; a: string }>;
    fiveMarkQuestions: Array<{ q: string; a: string }>;
    disclaimer: string;
  };
  section16_summary: {
    mainConcepts: string[];
    keyProcesses: string[];
    mainTakeaway: string;
  };
  section17_masteryAssessment: Array<{
    id: string;
    kind: 'conceptual' | 'why_how' | 'application' | 'diagram';
    question: string;
    options: string[];
    correctIndex: number;
    reteachOnWrong: string;
  }>;
  sources: Array<{ title: string; publisher: string; board: string; grade: number }>;
  validation: ComprehensiveValidationReport;
  limitations: string[];
}

const validator = new ResponseValidationLayer();

function buildTopicDiagramSvg(topic: string, subject: string): DeepLessonDiagram {
  const t = topic.toLowerCase();
  const safeTitle = topic.replace(/[<>&]/g, '');

  if (t.includes('photosynthesis')) {
    return {
      title: 'Photosynthesis: Chloroplast Light Reactions & Calvin Cycle',
      diagramType: 'Labeled Biological Process Diagram',
      svgMarkup: `<svg viewBox="0 0 640 240" xmlns="http://www.w3.org/2000/svg"><rect width="640" height="240" rx="16" fill="#0F172A"/><circle cx="85" cy="60" r="28" fill="#FACC15"/><text x="85" y="106" text-anchor="middle" fill="#FDE047" font-size="12" font-weight="bold">Sunlight</text><path d="M115 65 L195 95" stroke="#FACC15" stroke-width="3" stroke-dasharray="5 3"/><ellipse cx="340" cy="125" rx="190" ry="82" fill="#064E3B" stroke="#34D399" stroke-width="3"/><rect x="210" y="90" width="90" height="70" rx="12" fill="#10B981"/><text x="255" y="122" text-anchor="middle" fill="#022C22" font-size="12" font-weight="bold">1. Thylakoid</text><text x="255" y="138" text-anchor="middle" fill="#022C22" font-size="10">Light Reaction</text><path d="M305 125 L365 125" stroke="#38BDF8" stroke-width="3"/><text x="335" y="114" text-anchor="middle" fill="#7DD3FC" font-size="10">ATP + NADPH</text><circle cx="430" cy="125" r="44" fill="#0EA5E9" opacity="0.25" stroke="#38BDF8" stroke-width="2"/><text x="430" y="120" text-anchor="middle" fill="#E0F2FE" font-size="12" font-weight="bold">2. Stroma</text><text x="430" y="136" text-anchor="middle" fill="#BAE6FD" font-size="10">Calvin Cycle</text><text x="340" y="226" text-anchor="middle" fill="#A7F3D0" font-size="12">6CO2 + 6H2O -> C6H12O6 + 6O2</text></svg>`,
      labels: [
        { label: '1. Thylakoid (Light Reaction)', meaning: 'Membrane sacs containing chlorophyll where water is split and ATP/NADPH form.' },
        { label: 'ATP + NADPH', meaning: 'Energy-carrying molecules transferred from thylakoids to the stroma.' },
        { label: '2. Stroma (Calvin Cycle)', meaning: 'Fluid matrix where CO2 is fixed into glucose using ATP and NADPH.' }
      ],
      interpretation: {
        whatItRepresents: 'Cross-section of a chloroplast showing the two coupled stages of photosynthesis.',
        howPartsConnect: 'Light reactions in thylakoids supply ATP and NADPH to drive carbon fixation in the stroma.',
        processHappening: 'Solar energy splits H2O (releasing O2) and powers the reduction of CO2 into glucose.',
        whatToObserve: 'Notice the directional energy arrow from Step 1 (Thylakoid) to Step 2 (Stroma).',
        completeTakeaway: 'Photosynthesis converts light energy into chemical energy stored in glucose.'
      }
    };
  }

  if (t.includes('newton') || t.includes('motion')) {
    return {
      title: "Newton's Second Law: Force, Mass & Acceleration",
      diagramType: 'Labeled Physics Force-Vector Diagram',
      svgMarkup: `<svg viewBox="0 0 640 220" xmlns="http://www.w3.org/2000/svg"><rect width="640" height="220" rx="16" fill="#0F172A"/><line x1="60" y1="165" x2="580" y2="165" stroke="#475569" stroke-width="4"/><rect x="220" y="95" width="120" height="68" rx="10" fill="#1E293B" stroke="#38BDF8" stroke-width="3"/><text x="280" y="134" text-anchor="middle" fill="#E0F2FE" font-size="14" font-weight="bold">Mass (m)</text><line x1="345" y1="128" x2="475" y2="128" stroke="#22C55E" stroke-width="5"/><polygon points="475,120 495,128 475,136" fill="#22C55E"/><text x="420" y="114" text-anchor="middle" fill="#86EFAC" font-size="13" font-weight="bold">Net Force F = m × a</text><line x1="215" y1="142" x2="135" y2="142" stroke="#F43F5E" stroke-width="3"/><polygon points="135,136 120,142 135,148" fill="#F43F5E"/><text x="168" y="128" text-anchor="middle" fill="#FDA4AF" font-size="11">Friction (f)</text></svg>`,
      labels: [
        { label: 'Mass (m)', meaning: 'Measure of inertia resisting changes in velocity (kg).' },
        { label: 'Net Force (F)', meaning: 'Vector sum of applied force minus opposing friction (N).' },
        { label: 'Friction (f)', meaning: 'Opposing contact force acting opposite to motion.' }
      ],
      interpretation: {
        whatItRepresents: 'Free-body force diagram showing net horizontal force accelerating a mass.',
        howPartsConnect: 'Net force F_net = F_applied − f determines acceleration a = F_net / m.',
        processHappening: 'An unbalanced force changes the object’s velocity in the direction of net force.',
        whatToObserve: 'Longer green arrow than red arrow means unbalanced net force to the right.',
        completeTakeaway: 'Acceleration is directly proportional to net force and inversely proportional to mass.'
      }
    };
  }

  return {
    title: `${safeTitle} — Conceptual Architecture Diagram`,
    diagramType: `${subject} Structured Flow Diagram`,
    svgMarkup: `<svg viewBox="0 0 640 210" xmlns="http://www.w3.org/2000/svg"><rect width="640" height="210" rx="16" fill="#0F172A"/><rect x="35" y="70" width="150" height="68" rx="12" fill="#1E293B" stroke="#38BDF8" stroke-width="2.5"/><text x="110" y="102" text-anchor="middle" fill="#7DD3FC" font-size="12" font-weight="bold">1. Foundation</text><text x="110" y="120" text-anchor="middle" fill="#CBD5E1" font-size="10">Core Inputs / Terms</text><path d="M190 104 L235 104" stroke="#38BDF8" stroke-width="3"/><rect x="240" y="70" width="160" height="68" rx="12" fill="#1E293B" stroke="#A855F7" stroke-width="2.5"/><text x="320" y="102" text-anchor="middle" fill="#D8B4FE" font-size="12" font-weight="bold">2. Mechanism</text><text x="320" y="120" text-anchor="middle" fill="#CBD5E1" font-size="10">${safeTitle.slice(0, 22)}</text><path d="M405 104 L450 104" stroke="#34D399" stroke-width="3"/><rect x="455" y="70" width="150" height="68" rx="12" fill="#1E293B" stroke="#34D399" stroke-width="2.5"/><text x="530" y="102" text-anchor="middle" fill="#6EE7B7" font-size="12" font-weight="bold">3. Outcome</text><text x="530" y="120" text-anchor="middle" fill="#CBD5E1" font-size="10">Applications & Proof</text></svg>`,
    labels: [
      { label: '1. Foundation', meaning: `Prerequisite definitions and inputs required for ${safeTitle}.` },
      { label: '2. Mechanism', meaning: `Step-by-step internal operation of ${safeTitle}.` },
      { label: '3. Outcome', meaning: `Observable results, formulas, and real-world applications.` }
    ],
    interpretation: {
      whatItRepresents: `Three-stage cause-and-effect architecture of ${safeTitle} in ${subject}.`,
      howPartsConnect: 'Foundational inputs feed the core mechanism to produce verifiable outcomes.',
      processHappening: 'Sequential progression from prerequisites to applied mastery.',
      whatToObserve: 'Follow the numbered flow from Foundation (1) → Mechanism (2) → Outcome (3).',
      completeTakeaway: `Mastering ${safeTitle} requires connecting definitions to mechanisms and applications.`
    }
  };
}

export class DeepConceptMasteryEngine {
  public async generateDeepLesson(req: DeepLessonRequest): Promise<DeepLessonPayload> {
    const topic = (req.topic || 'Science').trim();
    const subject = (req.subject || 'General Science').trim();
    const chapter = (req.chapter || topic).trim();
    const grade = req.grade || 10;
    const board = req.board || 'CBSE';
    const depthLevel: ExplanationDepthLevel = req.depthLevel || 'deep';

    const aiTeach = await multiModelAiTeacherEngine.teach({
      question: `Provide a ${depthLevel}-level complete academic lesson on "${topic}" in ${subject} for Grade ${grade} (${board}).`,
      topic,
      subject,
      grade,
      board,
      mode: 'detailed'
    });

    const isMathOrPhysicsOrChem = /math|physics|chem/i.test(subject);
    const depthTag =
      depthLevel === 'foundation'
        ? 'Beginner-Friendly Foundation'
        : depthLevel === 'expert'
        ? 'Expert Concept Mastery'
        : 'Deep Curriculum Understanding';

    const diagram = buildTopicDiagramSvg(topic, subject);

    const payload: DeepLessonPayload = {
      topic,
      subject,
      chapter,
      grade,
      board,
      depthLevel,
      section1_introduction: {
        overview: `${topic} is a core topic in Grade ${grade} ${subject} (${chapter}) taught at the ${depthTag} level.`,
        whyLearnIt: `Mastering ${topic} explains how key ${subject.toLowerCase()} principles operate in real life and builds readiness for advanced chapters.`,
        learningOutcomes: [
          `State and break down the formal and intuitive definitions of ${topic}.`,
          `Trace every step of how ${topic} works and explain why each step occurs.`,
          `Interpret labeled visual diagrams and solve ${board}-style exam questions.`
        ],
        subjectImportance: `Forms an essential pillar of ${chapter} in the ${board} Grade ${grade} ${subject} syllabus.`
      },
      section2_definition: {
        formalDefinition:
          aiTeach.universalSections?.definition ||
          `${topic} refers to the structured principle and mechanism governing ${chapter} in ${subject}.`,
        simpleDefinition: `In simple words, ${topic} explains what happens, why it happens, and how its parts work together.`,
        keyTermsBreakdown: [
          { term: topic, meaning: `Primary concept under study in ${chapter}.` },
          { term: subject, meaning: `Academic discipline framing the laws and evidence for ${topic}.` }
        ],
        characteristics: [
          'Follows verifiable cause-and-effect relationships.',
          'Connects foundational prerequisites with real-world applications.'
        ]
      },
      section3_basicUnderstanding: {
        prerequisites: [`Foundational ${subject} terminology`, `Basic cause-and-effect reasoning in ${chapter}`],
        foundationalTerms: [
          { term: 'System / Process', explanation: 'The interacting parts that produce an observable outcome.' },
          { term: 'Variable / Factor', explanation: 'A measurable condition that influences how the process behaves.' }
        ],
        priorConnections: `Builds directly on earlier ${subject} units and prepares you for upcoming problem-solving chapters.`
      },
      section4_howItWorks: [
        {
          stepNumber: 1,
          stageTitle: 'Initiation & Inputs',
          whatHappens: `${topic} begins when the required initial conditions or reactants/inputs are present.`,
          whyItHappens: 'Without the starting inputs or boundary conditions, the governing mechanism cannot activate.'
        },
        {
          stepNumber: 2,
          stageTitle: 'Core Transformation / Interaction',
          whatHappens: 'The primary components interact according to established laws or rules.',
          whyItHappens: 'Energy, forces, or logical rules drive the system from its initial state toward an intermediate state.'
        },
        {
          stepNumber: 3,
          stageTitle: 'Final Outcome & Verification',
          whatHappens: 'The process completes and yields measurable outputs or conclusions.',
          whyItHappens: 'Conservation laws or logical consistency ensure predictable, repeatable results.'
        }
      ],
      section5_components: [
        {
          name: `Primary Driver of ${topic}`,
          definition: `The central element or law initiating ${topic}.`,
          structure: 'Core structural unit or governing relation.',
          functionRole: 'Drives the main transformation step.',
          howItWorks: 'Responds directly to changes in input conditions.',
          importance: 'Essential — removing this component halts the entire mechanism.',
          relationships: 'Supplies the output needed by downstream stages.',
          example: `Observed directly in standard Grade ${grade} ${subject} demonstrations of ${topic}.`
        },
        {
          name: `Supporting Regulator / Medium`,
          definition: 'The environment or boundary condition that stabilizes the process.',
          structure: 'Surrounding medium, catalyst, or constraint.',
          functionRole: 'Maintains rate, balance, and accuracy.',
          howItWorks: 'Prevents runaway errors or energy loss.',
          importance: 'Ensures reliable outcomes under varying conditions.',
          relationships: 'Works alongside the primary driver.',
          example: `Controls real-world efficiency when applying ${topic}.`
        }
      ],
      section6_visualExplanation: diagram,
      section7_subtopics: [
        {
          id: 'sub-1',
          title: `Core Mechanism of ${topic}`,
          definition: `Detailed breakdown of the primary process inside ${topic}.`,
          background: `Forms the heart of ${chapter}.`,
          explanation: aiTeach.directAnswer.slice(0, 360),
          workingPrinciple: 'Cause-and-effect progression from input to output.',
          example: `Standard classroom example demonstrating ${topic}.`,
          application: `Used in modern ${subject.toLowerCase()} analysis and engineering.`,
          connectionToMain: `Directly explains Stage 2 of ${topic}.`
        },
        {
          id: 'sub-2',
          title: `Factors & Conditions Affecting ${topic}`,
          definition: `External and internal variables that alter the rate or outcome of ${topic}.`,
          background: 'Explains why results vary across environments.',
          explanation: 'Changing temperature, magnitude, structure, or constraints shifts the equilibrium or output.',
          workingPrinciple: 'Proportional or inverse sensitivity to key parameters.',
          example: 'Comparing ideal textbook conditions with real-world variations.',
          application: 'Helps optimize real-world systems and avoid exam pitfalls.',
          connectionToMain: `Governs the boundary limits of ${topic}.`
        }
      ],
      section8_realWorldApplications: [
        {
          domain: 'Everyday Life',
          application: `Practical use of ${topic}`,
          explanation: `Students encounter ${topic} in daily technology, nature, and problem solving.`
        },
        {
          domain: 'Science & Industry',
          application: `Applied ${subject} Systems`,
          explanation: `Engineers and researchers rely on ${topic} to design reliable solutions.`
        }
      ],
      section9_workedExamples: [
        {
          title: `Worked Case Study: ${topic}`,
          context: `Grade ${grade} ${board} ${subject} application`,
          steps: [
            `Step 1: Identify the given information and relevant principle of ${topic}.`,
            `Step 2: Apply the core mechanism or formula systematically.`,
            `Step 3: Verify units, logic, and physical/historical/conceptual reasonableness.`
          ],
          conclusion: `Demonstrates how ${topic} moves from theory to verified solution.`
        }
      ],
      section10_comparisons: [
        {
          conceptA: topic,
          conceptB: `Related ${chapter} Concept`,
          difference: `${topic} focuses on its specific mechanism, whereas related topics govern complementary stages.`,
          relationship: 'Both connect inside the same unit in the AI Lesson Map.'
        }
      ],
      section11_misconceptions: [
        {
          incorrectIdea: `Memorizing the definition of ${topic} alone is enough to solve problems.`,
          whyIncorrect: 'Exam and real-world questions test why each step happens, not rote recall.',
          correctExplanation: `You must connect the definition to the step-by-step mechanism and component roles.`,
          clarifyingExample: `Ask "what happens if one component is removed?" to test true understanding.`
        }
      ],
      section12_glossary: [
        {
          term: topic,
          formalMeaning: `Formal ${subject} definition of ${topic}.`,
          simpleMeaning: `Clear, everyday meaning of ${topic}.`
        }
      ],
      section13_formulasAndRules: isMathOrPhysicsOrChem
        ? [
            {
              name: `Primary Governing Relation for ${topic}`,
              expression:
                aiTeach.numericalSolution?.formula ||
                `Apply the standard ${subject} equation for ${topic}.`,
              symbols: 'Each variable represents a measurable physical or algebraic quantity.',
              units: 'Use consistent SI units throughout every calculation.',
              whenToUse: `When solving quantitative ${topic} problems.`,
              commonMistake: 'Forgetting unit conversions or dropping negative signs.'
            }
          ]
        : [],
      section14_connections: {
        previousLessons: [`Foundations of ${subject}`],
        relatedChapters: [chapter],
        crossSubjectLinks: [`Connects ${subject} reasoning with analytical problem solving.`]
      },
      section15_examPreparation: {
        oneMarkQuestions: [
          { q: `Define ${topic}.`, a: `State the concise textbook definition with key terminology.` }
        ],
        twoMarkQuestions: [
          {
            q: `State two key applications or characteristics of ${topic}.`,
            a: `1) Core mechanism role. 2) Practical real-world application.`,
            keywords: [topic, subject, chapter]
          }
        ],
        threeMarkQuestions: [
          {
            q: `Explain how ${topic} works with a neat labeled diagram.`,
            a: `Write the definition, 3-step mechanism, and draw/label the diagram components.`
          }
        ],
        fiveMarkQuestions: [
          {
            q: `Describe ${topic} in detail, including its components, working principle, and real-world significance.`,
            a: `Structure with Introduction, Definition, Component breakdown, Working Steps, Diagram, and Conclusion.`
          }
        ],
        disclaimer: 'Practice questions are AI-structured for preparation and are not claimed to be guaranteed official exam questions.'
      },
      section16_summary: {
        mainConcepts: [`Definition of ${topic}`, 'Step-by-step working mechanism', 'Component interactions'],
        keyProcesses: ['Input/Initiation → Core Transformation → Verified Outcome'],
        mainTakeaway: `${topic} is best mastered by linking its formal definition, visual diagram, and real-world cause-and-effect.`
      },
      section17_masteryAssessment: [
        {
          id: 'm-1',
          kind: 'conceptual',
          question: `Which statement best captures why ${topic} works step by step?`,
          options: [
            'Each component performs a linked role transforming inputs into verifiable outcomes.',
            'It occurs randomly without prerequisite conditions.',
            'Memorizing a single keyword replaces understanding the mechanism.'
          ],
          correctIndex: 0,
          reteachOnWrong: `Let's revisit Section 4 (How It Works): ${topic} depends on prerequisite inputs driving each component in sequence.`
        },
        {
          id: 'm-2',
          kind: 'diagram',
          question: `In the visual diagram for ${topic}, what connects the Foundation/Input stage to the final Outcome?`,
          options: [
            'The core Mechanism / Transformation stage',
            'An unrelated external distraction',
            'Skipping intermediate steps'
          ],
          correctIndex: 0,
          reteachOnWrong: `Look at Step 2 in the diagram: the Mechanism transforms foundational inputs into the final outcome.`
        }
      ],
      sources: aiTeach.sources || [],
      validation: validator.validate({
        topic,
        subject,
        grade,
        board,
        content: `${topic} ${subject} ${aiTeach.directAnswer}`
      }),
      limitations: aiTeach.routing.limitations
    };

    return payload;
  }

  public async interactWithLesson(opts: {
    topic: string;
    subject: string;
    grade?: number;
    board?: string;
    action: string;
  }) {
    const res = await multiModelAiTeacherEngine.teach({
      question: `In the context of "${opts.topic}" (${opts.subject}), ${opts.action}`,
      topic: opts.topic,
      subject: opts.subject,
      grade: opts.grade || 10,
      board: opts.board || 'CBSE',
      mode: 'detailed'
    });
    return {
      topic: opts.topic,
      action: opts.action,
      reply: res.directAnswer,
      routing: res.routing
    };
  }
}

export const deepConceptMasteryEngine = new DeepConceptMasteryEngine();
