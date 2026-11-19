import { centralAiOrchestrator, type CentralAIProviderId } from './centralAiOrchestrator.ts';
import { macCompanionBridge } from './macCompanionBridge.ts';
import { ResponseValidationLayer, type ComprehensiveValidationReport } from './responseValidationLayer.ts';
import { unifiedKnowledgeRetrieval, type UnifiedRetrievedKnowledge } from './unifiedKnowledgeRetrieval.ts';
import { icseCbseKnowledgeBank } from './icseCbseKnowledgeBank.ts';

export type TeachingQuestionType =
  | 'quick_answer'
  | 'concept_deep_dive'
  | 'numerical_math'
  | 'numerical_physics'
  | 'chemistry_equation_or_numerical'
  | 'exam_prep';

export type ExamMarkFormat = '2-mark' | '3-mark' | '5-mark' | '10-mark';

export interface MultiModelTeachRequest {
  question: string;
  topic?: string;
  subject?: string;
  grade?: number;
  board?: string;
  language?: string;
  mode?: 'quick' | 'normal' | 'detailed' | 'exam';
  examMarks?: ExamMarkFormat;
  studentId?: string;
  history?: Array<{ role: string; content: string }>;
}

export interface UniversalExplanationSections {
  definition: string;
  whatIsIt: string;
  whyImportant: string;
  howItWorks: string[];
  whereUsed: string[];
  realLifeExamples: string[];
  memoryTechniques: {
    storyAnalogy: string;
    mnemonic: string;
    spacedRevisionTip: string;
  };
  quickSummary: string[];
  testYourUnderstanding: Array<{ question: string; hint: string }>;
}

export interface NumericalSolutionStructure {
  domain: 'mathematics' | 'physics' | 'chemistry';
  topic: string;
  concept: string;
  givenValues: string[];
  toFind: string;
  unitConversions: string[];
  formula: string;
  whyFormulaWorks: string;
  stepByStepWorking: string[];
  finalAnswerWithUnit: string;
  verificationCheck: string;
  shortcutMethod?: string;
}

export interface ChemicalEquationCheck {
  detectedEquation: string;
  isBalanced: boolean;
  reactantAtoms: Record<string, number>;
  productAtoms: Record<string, number>;
  details: string;
}

export interface MultiModelTeachResponse {
  subject: string;
  topic: string;
  questionType: TeachingQuestionType;
  routing: {
    modulesUsed: Array<'qwen_2_5_brain' | 'gpt_knowledge_bank' | 'gemini_research_bank' | 'curriculum_rag'>;
    primaryProvider: CentralAIProviderId;
    modelUsed: string;
    reason: string;
    qwenTrainedNote: string;
    limitations: string[];
  };
  directAnswer: string;
  universalSections?: UniversalExplanationSections;
  numericalSolution?: NumericalSolutionStructure;
  chemicalEquationCheck?: ChemicalEquationCheck;
  examPreparation?: {
    markFormat: ExamMarkFormat;
    formattedAnswer: string;
    formalDefinitions: Array<{ term: string; definition: string }>;
    importantComparisons: Array<{ title: string; summary: string }>;
    commonMistakes: string[];
    practiceQuestions: string[];
    modelAnswers: Array<{ question: string; marks: number; modelAnswer: string; markingTip: string }>;
  };
  subjectTeachingSequence: string[];
  needsClarification?: boolean;
  clarificationQuestion?: string;
  uncertaintyDisclosure?: string;
  sources: Array<{ title: string; publisher: string; board: string; grade: number }>;
  validation: ComprehensiveValidationReport;
  latencyMs: number;
}

export function getSubjectTeachingSequence(subject: string): string[] {
  const s = subject.toLowerCase();
  if (s.includes('bio')) return ['Definition', 'Structure', 'Parts', 'Functions', 'Processes', 'Diagram', 'Examples', 'Differences', 'Applications', 'Assessment'];
  if (s.includes('phys')) return ['Definition', 'Principle', 'Laws', 'Explanation', 'Formulas', 'Derivations', 'Numericals', 'Diagrams', 'Applications', 'Assessment'];
  if (s.includes('chem')) return ['Definition', 'Basic Concepts', 'Elements & Compounds', 'Properties', 'Structures', 'Reactions', 'Equations', 'Examples', 'Applications', 'Assessment'];
  if (s.includes('math')) return ['Prerequisites', 'Concepts', 'Rules', 'Formulas', 'Methods', 'Worked Problems', 'Practice', 'Applications', 'Assessment'];
  if (s.includes('hist')) return ['Background', 'Timeline', 'People', 'Events', 'Causes', 'Developments', 'Consequences', 'Historical Significance', 'Assessment'];
  if (s.includes('geo')) return ['Introduction', 'Location', 'Physical Features', 'Formation', 'Processes', 'Maps', 'Diagrams', 'Examples', 'Applications', 'Assessment'];
  if (s.includes('eng') || s.includes('hindi') || s.includes('telugu') || s.includes('lang')) return ['Vocabulary', 'Definitions & Meanings', 'Grammar', 'Rules', 'Examples', 'Reading', 'Comprehension', 'Writing', 'Practice', 'Assessment'];
  if (s.includes('comp')) return ['Introduction', 'Terminology', 'Concepts', 'Components', 'Working Principles', 'Algorithms', 'Examples', 'Practical Tasks', 'Applications', 'Assessment'];
  return ['Introduction', 'Definition', 'Core Concepts', 'Working Principles', 'Examples', 'Applications', 'Comparisons', 'Assessment'];
}

const validator = new ResponseValidationLayer();

/**
 * Classifies subject & teaching intent so we route intelligently without calling every API unnecessarily.
 */
export function classifyTeachingIntent(
  question: string,
  explicitSubject?: string,
  explicitMode?: string
): { subject: string; questionType: TeachingQuestionType } {
  const q = question.toLowerCase();

  let subject = explicitSubject?.trim() || 'General Science';
  if (!explicitSubject) {
    if (/[\u0C00-\u0C7F]/.test(question) || /\b(telugu|sandhi|samasam|vyakaranam|alankaram|chandassu)\b/.test(q)) {
      subject = 'Telugu';
    } else if (/[\u0900-\u097F]/.test(question) || /\b(hindi|vyakaran|sangya|sarvanam|visheshan|samas|muhavare)\b/.test(q)) {
      subject = 'Hindi';
    } else if (/\b(multiplication|multiply|multiplicand|repeated addition|addition|subtraction|division|quadratic|polynomial|equation|algebra|trigonometry|sin|cos|tan|triangle|circle|calculus|derivative|integral|probability|ratio|percentage|solve|factor|roots?)\b/.test(q) || /x\^2|x²|[0-9]x\s*[+\-=]/.test(q)) {
      subject = 'Mathematics';
    } else if (/\b(force|pressure|thrust|pascal|newton|velocity|acceleration|momentum|ohm|voltage|current|resistance|watt|joule|refraction|lens|mirror|gravity|kinematics|mass)\b/.test(q)) {
      subject = 'Physics';
    } else if (/\b(atom|atomic|rutherford|bohr|isotope|isobar|mole|stoichiometry|acid|base|ph|reaction|balance|h2o|co2|hcl|naoh|oxidation|periodic|valency|covalent|ionic)\b/.test(q) || /->|→/.test(q)) {
      subject = 'Chemistry';
    } else if (/\b(life processes|cell|mitosis|meiosis|photosynthesis|stomata|chloroplast|heart|blood|circulation|nephron|nutrition|dna|enzyme|respiration|neuron|organ)\b/.test(q)) {
      subject = 'Biology';
    } else if (/\b(algorithm|array|loop|function|recursion|binary|database|sql|python|javascript|typescript|complexity)\b/.test(q)) {
      subject = 'Computer Science';
    } else if (/\b(indus valley|harappa|mohenjo|lothal|civilization|earliest cities|revolution|bastille|treaty|empire|dynasty|war|satyagraha|gandhi|independence|century|historian)\b/.test(q)) {
      subject = 'History';
    } else if (/\b(weather|barometer|hygrometer|lapse rate|insolation|water cycle|hydrological|climate|monsoon|river|soil|latitude|tectonic|biome|agriculture|aquifer)\b/.test(q)) {
      subject = 'Geography';
    } else if (/\b(constitution|fundamental rights|parliament|lok sabha|rajya sabha|democracy|federalism|civics)\b/.test(q)) {
      subject = 'Civics';
    } else if (/\b(gdp|per capita|inflation|money and credit|rbi|demand and supply|economics)\b/.test(q)) {
      subject = 'Economics';
    } else if (/\b(grammar|synonym|antonym|metaphor|simile|tense|active voice|passive voice|reported speech|essay|poem|literature)\b/.test(q)) {
      subject = 'English';
    }
  }

  if (explicitMode === 'exam' || /\b(2 mark|3 mark|5 mark|10 mark|board exam|important question)\b/.test(q)) {
    return { subject, questionType: 'exam_prep' };
  }
  if (explicitMode === 'quick' || (q.split(/\s+/).length <= 6 && /^(what is|define)\b/.test(q) && explicitMode !== 'detailed')) {
    return { subject, questionType: 'quick_answer' };
  }
  if (subject === 'Chemistry' && (/->|→/.test(q) || /\b(balance|moles?|molarity|calculate)\b/.test(q))) {
    return { subject, questionType: 'chemistry_equation_or_numerical' };
  }
  if (subject === 'Physics' && /\d/.test(q) && /\b(calculate|find|determine|speed|velocity|force|acceleration|current|resistance|work|energy)\b/.test(q)) {
    return { subject, questionType: 'numerical_physics' };
  }
  if (subject === 'Mathematics' && (/\d/.test(q) || /\b(solve|factor|find|calculate|roots?|evaluate|simplify)\b/.test(q))) {
    return { subject, questionType: 'numerical_math' };
  }
  return { subject, questionType: 'concept_deep_dive' };
}

/**
 * Deterministic atom counter for chemical equations like "2H2 + O2 -> 2H2O".
 */
export function verifyChemicalEquationBalance(rawInput: string): ChemicalEquationCheck | null {
  const normalized = rawInput.replace(/→|=>|=/g, '->');
  const match = normalized.match(/([A-Za-z0-9+()\s]+)->([A-Za-z0-9+()\s]+)/);
  if (!match) return null;

  const parseSide = (side: string): Record<string, number> => {
    const counts: Record<string, number> = {};
    const terms = side.split('+').map((t) => t.trim()).filter(Boolean);
    for (const term of terms) {
      const coefMatch = term.match(/^(\d+)\s*(.+)$/);
      const coef = coefMatch ? parseInt(coefMatch[1], 10) : 1;
      const formula = coefMatch ? coefMatch[2].trim() : term.trim();
      const elemRegex = /([A-Z][a-z]?)(\d*)/g;
      let m: RegExpExecArray | null;
      while ((m = elemRegex.exec(formula)) !== null) {
        const el = m[1];
        const sub = m[2] ? parseInt(m[2], 10) : 1;
        counts[el] = (counts[el] || 0) + coef * sub;
      }
    }
    return counts;
  };

  const reactantAtoms = parseSide(match[1]);
  const productAtoms = parseSide(match[2]);
  const elements = new Set([...Object.keys(reactantAtoms), ...Object.keys(productAtoms)]);
  if (elements.size === 0) return null;

  let isBalanced = true;
  const diffs: string[] = [];
  for (const el of elements) {
    const l = reactantAtoms[el] || 0;
    const r = productAtoms[el] || 0;
    if (l !== r) {
      isBalanced = false;
      diffs.push(`${el}: ${l} vs ${r}`);
    }
  }

  const eq = `${match[1].trim()} -> ${match[2].trim()}`;
  return {
    detectedEquation: eq,
    isBalanced,
    reactantAtoms,
    productAtoms,
    details: isBalanced
      ? `Verified atom conservation for ${eq}.`
      : `Unbalanced atom counts detected (${diffs.join(', ')}).`
  };
}

function buildStructuredSystemInstruction(
  subject: string,
  topic: string,
  questionType: TeachingQuestionType,
  grade: number,
  board: string,
  examMarks: ExamMarkFormat
): string {
  const basePhilosophy = [
    `You are STUDYAI, an expert ${subject} teacher for Grade ${grade} (${board}).`,
    `Philosophy: Do not just give answers. Teach the concept, explain the reason, show how it works step by step, connect it to real life, and help the student remember it.`,
    `Never invent formulas, citations, or guaranteed exam questions.`
  ];

  if (questionType === 'numerical_math') {
    basePhilosophy.push(
      `Solve this Mathematics problem using: 1) Topic, 2) Given values, 3) To find, 4) Formula & why it works, 5) Step-by-step substitution & intermediate calculations, 6) Final answer with units, 7) Verification check, 8) Shortcut method (after standard method).`
    );
  } else if (questionType === 'numerical_physics') {
    basePhilosophy.push(
      `Solve this Physics numerical using: 1) Physics topic & concept, 2) Given quantities & unit conversions, 3) Unknown quantity, 4) Formula & physical law, 5) Step-by-step substitution, 6) Final answer with SI units, 7) Physical reasonableness check.`
    );
  } else if (questionType === 'chemistry_equation_or_numerical') {
    basePhilosophy.push(
      `Solve this Chemistry problem clearly: list reactants/products or given values, balance atom counts step by step or apply stoichiometry/mole formulas, show units, and verify the result.`
    );
  } else if (questionType === 'exam_prep') {
    basePhilosophy.push(
      `Format for Exam Preparation Mode (${examMarks} format for ${board} Grade ${grade}): include textbook definition, structured headings, labelled diagram description if helpful, real-life example, common exam mistakes to avoid, and practice questions.`
    );
  } else if (questionType === 'quick_answer') {
    basePhilosophy.push(`Provide a crisp, accurate, beginner-friendly explanation without unnecessary bloat.`);
  } else {
    basePhilosophy.push(
      `Structure your teaching around: Definition, What It Is, Why It Is Important, How It Works Step-by-Step, Where It Is Used, Real-Life Examples, Memory Trick/Story Analogy, Quick Summary, and 2 Test-Your-Understanding questions for "${topic}".`
    );
  }

  return basePhilosophy.join('\n');
}

export class MultiModelAiTeacherEngine {
  public async getModuleStatus() {
    const providers = await centralAiOrchestrator.getHealthOverview();
    const qwen = providers.find((p) => p.id === 'qwen');
    const openai = providers.find((p) => p.id === 'openai');
    const gemini = providers.find((p) => p.id === 'gemini');

    return {
      modules: {
        qwen25Brain: {
          name: 'Module 1: Qwen 2.5 Primary AI Brain',
          status: qwen?.status || 'OFFLINE',
          mode: qwen?.mode || 'local_ollama',
          activeModel: qwen?.activeModel || 'qwen2.5:7b',
          fineTuned: false,
          note: macCompanionBridge.isBridgeOnline()
            ? 'Connected via Mac Companion Bridge (base instruction model; not custom fine-tuned).'
            : 'Using local Ollama if available, otherwise transparently falling back to configured cloud/curriculum engine.'
        },
        gptKnowledgeBank: {
          name: 'Module 2: GPT Knowledge Bank & RAG',
          status: openai?.status || 'UNCONFIGURED',
          ragStore: 'SQLite + Curriculum Knowledge Retrieval (active)',
          activeModel: openai?.activeModel || 'gpt-4o-mini'
        },
        geminiResearchBank: {
          name: 'Module 3: Gemini Research Bank',
          status: gemini?.status || 'UNCONFIGURED',
          activeModel: gemini?.activeModel || 'gemini-2.5-flash'
        }
      }
    };
  }

  public async teach(req: MultiModelTeachRequest): Promise<MultiModelTeachResponse> {
    const start = Date.now();
    const question = (req.question || '').trim();
    const grade = req.grade || 10;
    const board = req.board || 'CBSE';
    const language = req.language || 'English';
    const examMarks: ExamMarkFormat = req.examMarks || '5-mark';

    const { subject, questionType } = classifyTeachingIntent(question, req.subject, req.mode);
    const topic = (req.topic || question.slice(0, 80) || subject).trim();

    const modulesUsed: MultiModelTeachResponse['routing']['modulesUsed'] = ['curriculum_rag'];
    const limitations: string[] = [];

    // Module 2: Retrieve structured textbook-aligned knowledge from Knowledge Bank
    let retrieved: UnifiedRetrievedKnowledge | null = null;
    try {
      retrieved = unifiedKnowledgeRetrieval.retrieveKnowledge(
        topic,
        subject as any,
        grade,
        board as any,
        language
      );
      if (retrieved) {
        modulesUsed.push('gpt_knowledge_bank');
      }
    } catch {
      limitations.push('Curriculum Knowledge Bank lookup returned no exact match; using general reasoning.');
    }

    // Check chemical equation deterministically if applicable
    const chemicalEquationCheck =
      subject === 'Chemistry' ? verifyChemicalEquationBalance(question) ?? undefined : undefined;

    const systemPrompt = buildStructuredSystemInstruction(
      subject,
      topic,
      questionType,
      grade,
      board,
      examMarks
    );

    const taskType =
      questionType === 'exam_prep'
        ? 'DEEP_EXAM_PREP'
        : questionType === 'numerical_math' ||
          questionType === 'numerical_physics' ||
          questionType === 'chemistry_equation_or_numerical'
        ? 'NUMERICAL_CALCULATION'
        : 'CONCEPT_EXPLANATION';

    // Intelligent routing:
    // - Module 1 (Qwen 2.5) is primary brain when online.
    // - Module 3 (Gemini Research) is invoked for deep conceptual/exam queries if available, skipped for quick answers/simple math.
    const shouldConsultGeminiResearch =
      questionType === 'concept_deep_dive' || questionType === 'exam_prep';

    const primaryRes = await centralAiOrchestrator.execute({
      studentId: req.studentId,
      taskType,
      prompt: question,
      topic,
      subject,
      grade,
      board,
      language,
      learningMode: req.mode === 'exam' ? 'exam' : req.mode === 'quick' ? 'concise' : 'detailed',
      history: req.history,
      systemPrompt,
      enableCollaboration: shouldConsultGeminiResearch
    });

    if (primaryRes.provider === 'qwen') {
      modulesUsed.push('qwen_2_5_brain');
    } else {
      limitations.push(`Qwen 2.5 local/bridge brain was unavailable; answered via ${primaryRes.provider} (${primaryRes.model}).`);
    }

    if (shouldConsultGeminiResearch && primaryRes.provider === 'gemini') {
      modulesUsed.push('gemini_research_bank');
    }

    if (primaryRes.warnings.length > 0) {
      limitations.push(...primaryRes.warnings);
    }

    let answerText = primaryRes.answer || `Let's understand ${topic} in ${subject} step by step.`;
    const isGenericAmbiguousPhrase =
      !req.subject &&
      /^(explain|teach|tell me about|what is)?\s*(chapter\s*\d+|unit\s*\d+|this|that|it|power|work|cell|state|acid|voice)\s*[?!.]*$/i.test(question);

    const rawKbChapter = isGenericAmbiguousPhrase
      ? null
      : icseCbseKnowledgeBank.findBestMatchingChapter({
          query: topic,
          board,
          grade,
          subject
        });

    const topicTokens = topic
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !['explain', 'what', 'with', 'about', 'theory', 'chapter'].includes(w));
    const kbHay = rawKbChapter
      ? `${rawKbChapter.chapterTitle} ${rawKbChapter.topicList.join(' ')} ${rawKbChapter.keyTerminology.join(' ')}`.toLowerCase()
      : '';
    const kbMatchesTopic =
      Boolean(rawKbChapter) &&
      (topicTokens.length === 0 || topicTokens.some((tok) => kbHay.includes(tok)));
    const kbChapter = kbMatchesTopic ? rawKbChapter : null;

    const isAmbiguous =
      isGenericAmbiguousPhrase ||
      (!req.subject &&
        !kbChapter &&
        question.split(/\s+/).length <= 4 &&
        /\b(chapter\s*\d+|unit\s*\d+|power|work|cell|state|acid|voice)\b/i.test(question));

    const clarificationQuestion = isAmbiguous
      ? `To teach this accurately for ${board} Class ${grade}, could you clarify which subject or chapter you mean (for example, Physics, Chemistry, Biology, or Civics)?`
      : undefined;

    let uncertaintyDisclosure: string | undefined;
    if (!kbChapter) {
      uncertaintyDisclosure = `Note: "${topic}" is not yet published in the verified ${board} Class ${grade} Knowledge Bank. This explanation uses curriculum-guided reasoning and should be cross-checked with your official textbook.`;
      limitations.push(uncertaintyDisclosure);
    }

    // In Exam Preparation Mode, preserve full conceptual teaching and enrich with formal definitions,
    // comparisons, formulas/derivations, exam question types, and marking guidance so Exam Mode is always deeper.
    if (questionType === 'exam_prep' && kbChapter) {
      const defsBlock = kbChapter.importantDefinitions
        .slice(0, 4)
        .map((d) => `- **${d.term}**: ${d.definition}`)
        .join('\n');
      const compBlock = kbChapter.importantComparisons[0]
        ? `\n\n### 📊 Important Distinctions (${kbChapter.importantComparisons[0].title})\n` +
          kbChapter.importantComparisons[0].rows
            .map((r) => `- **${r.aspect}**: ${kbChapter.importantComparisons[0].leftColumnHeader} = ${r.leftValue} | ${kbChapter.importantComparisons[0].rightColumnHeader} = ${r.rightValue}`)
            .join('\n')
        : '';
      const examQsBlock = [...kbChapter.practiceQuestions, ...kbChapter.assessmentQuestions]
        .slice(0, 4)
        .map((q, idx) => `${idx + 1}. **[${q.questionType} • ${q.marks} Marks]** ${q.question}\n   - *Model Answer*: ${q.correctAnswer}\n   - *Marking Guidance*: ${q.explanation}`)
        .join('\n');

      answerText = `${answerText}\n\n---\n### 🎯 ${board} Class ${grade} Exam Preparation Addendum\n#### 📖 Formal Textbook Definitions\n${defsBlock}${compBlock}\n\n#### 📝 Board-Aligned Practice Questions & Model Answers\n${examQsBlock}`;
    }

    const validation = validator.validate({
      topic,
      subject,
      grade,
      board,
      language,
      content: answerText
    });

    const isNumerical =
      questionType === 'numerical_math' ||
      questionType === 'numerical_physics' ||
      questionType === 'chemistry_equation_or_numerical';

    const universalSections: UniversalExplanationSections | undefined =
      questionType === 'quick_answer' || isNumerical
        ? undefined
        : {
            definition:
              primaryRes.definitions?.[0]?.definition ||
              `${topic} is a foundational concept in Grade ${grade} ${subject}.`,
            whatIsIt:
              primaryRes.explanation_sections?.[0]?.body ||
              answerText.slice(0, 420),
            whyImportant: `Understanding ${topic} builds the conceptual foundation for higher ${subject} topics and ${board} assessments.`,
            howItWorks:
              primaryRes.explanation_sections?.map((s) => `${s.title}: ${s.body}`) ||
              [answerText],
            whereUsed: primaryRes.examples?.slice(0, 3) || [
              `Applied in everyday ${subject.toLowerCase()} phenomena and laboratory observations.`
            ],
            realLifeExamples: primaryRes.examples || [
              `Observe how ${topic} appears in daily life and real-world engineering.`
            ],
            memoryTechniques: {
              storyAnalogy: `Imagine ${topic} as a clear cause-and-effect system where each part has a specific role.`,
              mnemonic: `Remember ${topic}: Definition → Cause → Working → Real-Life Link.`,
              spacedRevisionTip: `Review key terms and solve 2 practice problems within 24 hours, then again after 3 days.`
            },
            quickSummary: [
              `Core Idea: ${topic} (${subject})`,
              ...(primaryRes.formulas?.map((f) => `${f.name}: ${f.equation}`) || [])
            ],
            testYourUnderstanding: [
              {
                question: `In your own words, what is ${topic} and why does it happen?`,
                hint: `Start from the core definition and trace one cause-and-effect step.`
              },
              {
                question: `Give one real-life example where ${topic} is useful.`,
                hint: `Think about everyday science or technology around you.`
              }
            ]
          };

    const numericalSolution: NumericalSolutionStructure | undefined = isNumerical
      ? {
          domain:
            questionType === 'numerical_math'
              ? 'mathematics'
              : questionType === 'numerical_physics'
              ? 'physics'
              : 'chemistry',
          topic,
          concept: `${subject} problem-solving applying standard principles for ${topic}.`,
          givenValues: ['Extracted from student problem statement above.'],
          toFind: question,
          unitConversions:
            questionType === 'numerical_physics'
              ? ['Verify all quantities are converted to SI units before substitution.']
              : [],
          formula:
            primaryRes.formulas?.[0]?.equation ||
            `Apply the standard ${subject} governing relation for ${topic}.`,
          whyFormulaWorks: `This relation directly links the given quantities to the unknown in ${subject}.`,
          stepByStepWorking: [answerText],
          finalAnswerWithUnit: 'See verified final step above with appropriate units.',
          verificationCheck: chemicalEquationCheck
            ? chemicalEquationCheck.details
            : 'Check dimensions/units and substitute the result back into the original relation.',
          shortcutMethod:
            questionType === 'numerical_math'
              ? 'After mastering the standard derivation above, check factor pairs or mental estimation to verify quickly in exams.'
              : undefined
        }
      : undefined;

    const examPreparation =
      questionType === 'exam_prep'
        ? {
            markFormat: examMarks,
            formattedAnswer: answerText,
            formalDefinitions: (kbChapter?.importantDefinitions || []).map((d) => ({
              term: d.term,
              definition: d.definition
            })),
            importantComparisons: (kbChapter?.importantComparisons || []).map((c) => ({
              title: c.title,
              summary: c.rows.map((r) => `${r.aspect}: ${r.leftValue} vs ${r.rightValue}`).join(' | ')
            })),
            commonMistakes:
              kbChapter && kbChapter.commonMisconceptions.length > 0
                ? kbChapter.commonMisconceptions.map((m) => `${m.misconception} → ${m.scientificCorrection}`)
                : [
                    'Skipping definitions or key terminology before jumping into examples.',
                    'Forgetting units, signs, or balanced coefficients in equations.'
                  ],
            practiceQuestions:
              kbChapter && kbChapter.assessmentQuestions.length > 0
                ? kbChapter.assessmentQuestions.map((q) => `[${q.questionType} • ${q.marks}M] ${q.question}`)
                : [
                    `Define ${topic} and state two key applications (${examMarks}).`,
                    `Explain the working of ${topic} with a labelled diagram and example.`
                  ],
            modelAnswers: [...(kbChapter?.practiceQuestions || []), ...(kbChapter?.assessmentQuestions || [])]
              .slice(0, 4)
              .map((q) => ({
                question: q.question,
                marks: q.marks,
                modelAnswer: q.correctAnswer,
                markingTip: q.explanation
              }))
          }
        : undefined;

    return {
      subject,
      topic,
      questionType,
      subjectTeachingSequence: getSubjectTeachingSequence(subject),
      needsClarification: isAmbiguous,
      clarificationQuestion,
      uncertaintyDisclosure,
      routing: {
        modulesUsed,
        primaryProvider: primaryRes.provider,
        modelUsed: primaryRes.model,
        reason: shouldConsultGeminiResearch
          ? 'Deep conceptual/exam query routed across Knowledge Bank, Research, and Primary Teaching Brain.'
          : 'Targeted query routed directly to Knowledge Bank + Primary Brain to minimize latency and API cost.',
        qwenTrainedNote:
          'Qwen 2.5 operates as base instruction model via Mac Bridge / Ollama when online (not custom fine-tuned).',
        limitations
      },
      directAnswer: answerText,
      universalSections,
      numericalSolution,
      chemicalEquationCheck,
      examPreparation,
      sources: primaryRes.sources || [],
      validation,
      latencyMs: Date.now() - start
    };
  }
}

export const multiModelAiTeacherEngine = new MultiModelAiTeacherEngine();
