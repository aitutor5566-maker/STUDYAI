/**
 * STUDYAI – ADVANCED AI VOICE TEACHER + INTELLIGENT NOTES-TO-AUDIO ENGINE
 * 
 * Provides:
 * 1. Professional Voice AI Tutor with contextual spoken explanations & 8-point diagram walkthroughs
 * 2. Intelligent Notes-to-Audio conversion engine for saved notebooks & active notes
 * 3. 3-Tier Narration Depth: Normal Audio, Detailed Audio, and Exam Preparation Audio
 * 4. Trilingual support: English, Telugu (తెలుగు), and Hindi (हिन्दी) with verified technical terminology
 * 5. Visual synchronization: Diagram inspection and synchronized sentence/section highlight tracking
 * 6. Interactive interruptible teaching with position preservation
 * 7. Multi-provider TTS synthesis cascade with local macOS high-fidelity audio normalization and caching
 */

import crypto from 'node:crypto';
import { cleanNotebookTextForAudioSpeech } from './digitalNotebookPaginationEngine.ts';
import { generateNaturalAudioLesson, prepareTeacherNarrationScript } from './aiAdapter.ts';
import { getSubtopicDiagramsForTopic, type SubtopicDiagramItem } from './subtopicDiagramCatalog.ts';
import { professionalTeacherEngine } from './professionalTeacherEngine.ts';
import { db } from './db.ts';

export type AudioNarrationDepth = 'normal' | 'detailed' | 'exam';
export type AudioNarrationLanguage = 'en' | 'te' | 'hi';

export interface NoteAudioSentence {
  sentenceIndex: number;
  text: string;
  estimatedSeconds: number;
  highlightTargetId?: string;
}

export interface NoteAudioSection {
  sectionIndex: number;
  sectionId: string;
  title: string;
  category: string;
  spokenText: string;
  writtenMarkdownSummary?: string;
  estimatedDurationSeconds: number;
  actualDurationSeconds?: number;
  audioUrl?: string;
  audioProvider?: string;
  status: 'pending' | 'synthesized' | 'failed';
  visual?: {
    id: string;
    title: string;
    caption: string;
    svgXml?: string;
    labels?: string[];
    spokenVisualWalkthrough?: {
      whatItShows: string;
      importantComponents: string[];
      stepByStepMechanism: string[];
      studentTakeaway: string;
    };
  };
  highlightTargetHeading?: string;
  sentences?: NoteAudioSentence[];
}

export interface NoteAudioLesson {
  id: string;
  noteId: string;
  userId: string;
  topic: string;
  subject: string;
  grade: number;
  board: string;
  depth: AudioNarrationDepth;
  language: AudioNarrationLanguage;
  voiceName: string;
  status: 'ready' | 'generating' | 'error';
  lessonTitle: string;
  teacherGreeting: string;
  totalDurationSeconds: number;
  sections: NoteAudioSection[];
  currentPlaybackSection: number;
  currentPlaybackSeconds: number;
  createdAt: string;
  updatedAt: string;
}

export interface InteractiveVoiceInterruptionResult {
  interruptionId: string;
  studentQuestion: string;
  verbalAnswer: string;
  audioUrl?: string;
  audioDurationSeconds?: number;
  resumeSectionIndex: number;
  resumeSeconds: number;
  suggestedActions: string[];
}

// In-memory cache for audio synthesis buffers by hash
const audioSectionCache = new Map<string, { audioUrl: string; durationSeconds: number; provider: string }>();

export class VoiceTeachingEngine {
  /**
   * Translates or enriches technical text for natural teacher speech in target language.
   * Preserves precise scientific and mathematical terminology.
   */
  public cleanAndTransformForSpokenTeaching(text: string, topic = '', language: AudioNarrationLanguage = 'en'): string {
    const cleanEn = cleanNotebookTextForAudioSpeech(text, topic);
    if (language === 'te') {
      return this.localizeToTeluguTeacherSpeech(cleanEn, topic);
    }
    if (language === 'hi') {
      return this.localizeToHindiTeacherSpeech(cleanEn, topic);
    }
    return cleanEn;
  }

  /**
   * Generates a spoken 8-point visual walkthrough for any educational diagram.
   */
  public generateDiagramSpokenNarration(
    diagram: SubtopicDiagramItem | { title: string; caption?: string; labels?: string[]; svgXml?: string },
    topic: string,
    language: AudioNarrationLanguage = 'en'
  ): {
    spokenText: string;
    whatItShows: string;
    importantComponents: string[];
    stepByStepMechanism: string[];
    studentTakeaway: string;
    sentences: NoteAudioSentence[];
  } {
    const title = diagram.title || `${topic} Diagram`;
    const labels = ('labels' in diagram && Array.isArray(diagram.labels)) ? diagram.labels : ['Key Structure', 'Primary Flow', 'Outcome'];
    const caption = ('caption' in diagram && diagram.caption) ? diagram.caption : `Visual representation of ${topic}`;

    const whatItShows = `This schematic illustrates ${caption}.`;
    const importantComponents = labels.slice(0, 5);
    const stepByStepMechanism = [
      `First, identify the main input or starting structure: ${labels[0] || 'the primary source'}.`,
      `Next, observe the central interaction or mechanism: ${labels[1] || 'the core pathway'} transfers energy and materials systematically.`,
      `Finally, notice the resulting output: ${labels[2] || 'the final product'} completes the cycle.`
    ];
    const studentTakeaway = `When sketching this schematic in your examinations, be sure to clearly label ${labels.slice(0, 3).join(', ')} to earn full marks.`;

    let spokenText = '';
    if (language === 'te') {
      spokenText = `ఇప్పుడు మీ స్క్రీన్‌పై ఉన్న చిత్రాన్ని పరిశీలించండి: ${title}. ${caption}. ` +
        `ఇందులో ముఖ్యమైన భాగాలు: ${labels.slice(0, 4).join(', ')}. ` +
        `మొదటగా ${labels[0] || 'ప్రధాన భాగం'} ద్వారా ప్రక్రియ ప్రారంభమవుతుంది. తరువాత ${labels[1] || 'కేంద్ర నిర్మాణం'} ద్వారా రవాణా జరుగుతుంది. ` +
        `పరీక్షలలో ఈ డ్రాయింగ్ వేసేటప్పుడు ఖచ్చితంగా భాగాల పేర్లను గుర్తించండి.`;
    } else if (language === 'hi') {
      spokenText = `अब स्क्रीन पर दिए गए चित्र पर ध्यान दें: ${title}. ${caption}. ` +
        `इसमें मुख्य घटक हैं: ${labels.slice(0, 4).join(', ')}. ` +
        `सर्वप्रथम ${labels[0] || 'मुख्य संरचना'} से प्रक्रिया आरंभ होती है, जिसके बाद ${labels[1] || 'केंद्रीय भाग'} द्वारा पदार्थों का स्थानांतरण होता है। ` +
        `परीक्षा में पूरे अंक प्राप्त करने के लिए इन नामांकित भागों को स्पष्ट रूप से चिह्नित करें।`;
    } else {
      spokenText = `Let's examine the scientific diagram on your screen: ${title}. ${whatItShows} ` +
        `Notice the key labeled components: ${importantComponents.join(', ')}. ` +
        `${stepByStepMechanism.join(' ')} ${studentTakeaway}`;
    }

    const sentences = this.segmentTextIntoSentences(spokenText, labels);
    return {
      spokenText,
      whatItShows,
      importantComponents,
      stepByStepMechanism,
      studentTakeaway,
      sentences
    };
  }

  /**
   * Segments spoken narration into synchronized sentence tracks with estimated timing offsets.
   */
  public segmentTextIntoSentences(text: string, labelKeywords: string[] = []): NoteAudioSentence[] {
    const rawSentences = text
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    let cumulativeSeconds = 0;
    return rawSentences.map((sent, idx) => {
      // Estimate duration based on word count (~150 words per minute => ~2.5 words/sec)
      const wordCount = sent.split(/\s+/).length;
      const duration = Math.max(1.8, Math.round((wordCount / 2.5) * 10) / 10);
      cumulativeSeconds += duration;

      let matchedLabel: string | undefined = undefined;
      const lower = sent.toLowerCase();
      for (const lbl of labelKeywords) {
        if (lower.includes(lbl.toLowerCase())) {
          matchedLabel = lbl;
          break;
        }
      }

      return {
        sentenceIndex: idx,
        text: sent,
        estimatedSeconds: duration,
        highlightTargetId: matchedLabel
      };
    });
  }

  /**
   * Prepares a full multi-section Notes-to-Audio lesson plan from saved note content.
   */
  public async prepareNarrationScriptForNote(params: {
    noteId: string;
    userId: string;
    topic: string;
    subject: string;
    grade?: number;
    board?: string;
    depth?: AudioNarrationDepth;
    language?: AudioNarrationLanguage;
    voiceName?: string;
    contentMarkdown: string;
    structuredJson?: any;
  }): Promise<NoteAudioLesson> {
    const depth: AudioNarrationDepth = params.depth || 'detailed';
    const language: AudioNarrationLanguage = params.language || 'en';
    const grade = params.grade || 10;
    const board = params.board || 'CBSE';
    const voiceName = params.voiceName || (language === 'te' ? 'Geeta' : language === 'hi' ? 'Lekha' : 'Nova (Teacher)');

    // 1. Fetch relevant diagrams from catalog
    const diagrams = getSubtopicDiagramsForTopic(params.topic, params.subject);
    const primaryDiagram = diagrams[0];

    // 2. Query professional teaching intelligence for deep academic structure
    const professionalLesson = await professionalTeacherEngine.planAndCreateLesson({
      topic: params.topic,
      subject: params.subject,
      grade,
      board,
      language: language === 'te' ? 'Telugu' : language === 'hi' ? 'Hindi' : 'English',
      mode: depth === 'exam' ? 'exam' : 'normal'
    });

    const teacherGreeting = language === 'te'
      ? `నమస్కారం విద్యార్థి! "${params.topic}" పై మీ ప్రత్యేక ఆడియో తరగతికి స్వాగతం.`
      : language === 'hi'
      ? `नमस्ते प्रिय विद्यार्थी! "${params.topic}" के इस विशेष ऑडियो पाठ में आपका स्वागत है।`
      : `Hello and welcome! I am your AI Voice Teacher. Today, we will study ${params.topic} in ${params.subject}.`;

    const sections: NoteAudioSection[] = [];
    let sectionCounter = 0;

    // SECTION 1: Introduction & Chapter Orientation
    const s1Text = language === 'te'
      ? `${teacherGreeting} ఈ అధ్యాయంలో మనం ${params.topic} యొక్క ప్రాథమిక భావనలు మరియు సూత్రాలను వివరంగా నేర్చుకుందాం. ${professionalLesson.laymanIntroduction}`
      : language === 'hi'
      ? `${teacherGreeting} इस अध्याय में हम ${params.topic} की बुनियादी अवधारणाओं और सिद्धांतों को विस्तार से समझेंगे। ${professionalLesson.laymanIntroduction}`
      : `${teacherGreeting} Let's begin by understanding what ${params.topic} truly means in everyday life. ${professionalLesson.laymanIntroduction} In academic terms: ${professionalLesson.formalAcademicDefinition}`;

    sections.push({
      sectionIndex: sectionCounter++,
      sectionId: `sec-${params.topic.toLowerCase().replace(/[^a-z0-9]/g, '-')}-1`,
      title: language === 'te' ? '1. పరిచయం & ప్రాథమిక భావనలు' : language === 'hi' ? '1. प्रस्तावना व मूल अवधारणा' : '1. Overview & Core Definition',
      category: 'Orientation',
      spokenText: s1Text,
      writtenMarkdownSummary: `### Chapter Overview: ${params.topic}\n\n${professionalLesson.laymanIntroduction}\n\n**Academic Definition:** ${professionalLesson.formalAcademicDefinition}`,
      estimatedDurationSeconds: Math.ceil(s1Text.length / 15),
      status: 'pending',
      highlightTargetHeading: 'Introduction',
      sentences: this.segmentTextIntoSentences(s1Text)
    });

    // SECTION 2: Core Concepts & Scientific Terminology
    const s2Text = language === 'te'
      ? `ఇప్పుడు ${params.topic} లోని ముఖ్యమైన శాస్త్రీయ పదాలు మరియు నిర్వచనాలను పరిశీలిద్దాం. ${professionalLesson.formalAcademicDefinition}. ఈ ప్రక్రియలోని ప్రతి భాగాన్ని క్రమపద్ధతిలో అర్థం చేసుకోవడం చాలా ముఖ్యం.`
      : language === 'hi'
      ? `अब आइए ${params.topic} की मुख्य वैज्ञानिक शब्दावली और परिभाषाओं पर ध्यान दें। ${professionalLesson.formalAcademicDefinition}. इस प्रक्रिया के प्रत्येक चरण को समझना अत्यंत महत्वपूर्ण है।`
      : `Let's now dive deeper into the precise academic definitions and terminology of ${params.topic}. Examiners expect students to state clearly that: ${professionalLesson.formalAcademicDefinition}. Notice how cause and effect are linked in every stage.`;

    sections.push({
      sectionIndex: sectionCounter++,
      sectionId: `sec-${params.topic.toLowerCase().replace(/[^a-z0-9]/g, '-')}-2`,
      title: language === 'te' ? '2. ముఖ్యమైన నిర్వచనాలు & ప్రక్రియ' : language === 'hi' ? '2. मुख्य परिभाषाएं व प्रक्रिया' : '2. Key Terminology & Academic Definition',
      category: 'Terminology',
      spokenText: s2Text,
      writtenMarkdownSummary: `### Key Academic Terminology\n\n- **Formal Definition:** ${professionalLesson.formalAcademicDefinition}`,
      estimatedDurationSeconds: Math.ceil(s2Text.length / 15),
      status: 'pending',
      highlightTargetHeading: 'Academic Definition',
      sentences: this.segmentTextIntoSentences(s2Text)
    });

    // SECTION 3: Visual & Diagrammatic Narration (with SVG Visual)
    if (primaryDiagram) {
      const diagNarration = this.generateDiagramSpokenNarration(primaryDiagram, params.topic, language);
      sections.push({
        sectionIndex: sectionCounter++,
        sectionId: `sec-${params.topic.toLowerCase().replace(/[^a-z0-9]/g, '-')}-3`,
        title: language === 'te' ? '3. చిత్ర పటం విశ్లేషణ' : language === 'hi' ? '3. रेखाचित्र व दृश्य विश्लेषण' : '3. Educational Visual & Diagram Walkthrough',
        category: 'Visual Intelligence',
        spokenText: diagNarration.spokenText,
        writtenMarkdownSummary: `### Scientific Diagram: ${primaryDiagram.title}\n\n${primaryDiagram.caption}\n\n**Visible Labels:** ${diagNarration.importantComponents.join(', ')}`,
        estimatedDurationSeconds: Math.ceil(diagNarration.spokenText.length / 15),
        status: 'pending',
        visual: {
          id: primaryDiagram.id,
          title: primaryDiagram.title,
          caption: primaryDiagram.caption,
          svgXml: primaryDiagram.svgXml,
          labels: primaryDiagram.labels,
          spokenVisualWalkthrough: {
            whatItShows: diagNarration.whatItShows,
            importantComponents: diagNarration.importantComponents,
            stepByStepMechanism: diagNarration.stepByStepMechanism,
            studentTakeaway: diagNarration.studentTakeaway
          }
        },
        highlightTargetHeading: 'Visual Diagram',
        sentences: diagNarration.sentences
      });
    }

    // SECTION 4: Step-by-Step Mechanisms & Processes
    const sideBySide = professionalLesson.sideBySideSections?.[0];
    const stepsText = sideBySide?.pedagogicalSteps?.stepByStepMechanism?.join(' ') ||
      `Energy and matter interact sequentially through fundamental physical laws in ${params.topic}.`;
    const s4Text = language === 'te'
      ? `${params.topic} ఏ విధంగా పనిచేస్తుందో క్రమపద్ధతిలో అర్థం చేసుకుందాం: ${stepsText}`
      : language === 'hi'
      ? `आइए चरण-दर-चरण समझें कि ${params.topic} किस प्रकार कार्य करता है: ${stepsText}`
      : `Let's follow the step-by-step mechanism of ${params.topic}. ${stepsText} Understanding why this happens step by step prevents memorization mistakes.`;

    sections.push({
      sectionIndex: sectionCounter++,
      sectionId: `sec-${params.topic.toLowerCase().replace(/[^a-z0-9]/g, '-')}-4`,
      title: language === 'te' ? '4. దశలవారీ పనితీరు విధానం' : language === 'hi' ? '4. चरण-दर-चरण कार्यविधि' : '4. Step-by-Step Mechanism',
      category: 'Mechanism',
      spokenText: s4Text,
      writtenMarkdownSummary: `### Step-by-Step Mechanism\n\n${stepsText}`,
      estimatedDurationSeconds: Math.ceil(s4Text.length / 15),
      status: 'pending',
      highlightTargetHeading: 'Mechanism',
      sentences: this.segmentTextIntoSentences(s4Text)
    });

    // SECTION 5: Real-World Applications & Everyday Analogies
    const analogy = sideBySide?.pedagogicalSteps?.everydayAnalogy || `In real life, ${params.topic} powers systems around us every single day.`;
    const realApp = sideBySide?.pedagogicalSteps?.realWorldApplication || `Understanding ${params.topic} is foundational for science and technology.`;
    const s5Text = language === 'te'
      ? `నిత్యజీవితంలో దీనిని ఎక్కడ చూడవచ్చు? ఉదాహరణకు: ${analogy}. దీని ప్రాముఖ్యత: ${realApp}.`
      : language === 'hi'
      ? `दैनिक जीवन में इसका अनुप्रयोग: उदाहरण के लिए, ${analogy}. वास्तविक दुनिया में इसका महत्व: ${realApp}.`
      : `Where do we see ${params.topic} in the real world? Here is an everyday analogy: ${analogy}. In modern science and daily technology: ${realApp}.`;

    sections.push({
      sectionIndex: sectionCounter++,
      sectionId: `sec-${params.topic.toLowerCase().replace(/[^a-z0-9]/g, '-')}-5`,
      title: language === 'te' ? '5. నిజజీవిత అనువర్తనాలు' : language === 'hi' ? '5. वास्तविक जीवन में अनुप्रयोग' : '5. Real-World Applications & Everyday Analogy',
      category: 'Application',
      spokenText: s5Text,
      writtenMarkdownSummary: `### Real-World Connections\n\n- **Analogy:** ${analogy}\n- **Application:** ${realApp}`,
      estimatedDurationSeconds: Math.ceil(s5Text.length / 15),
      status: 'pending',
      highlightTargetHeading: 'Applications',
      sentences: this.segmentTextIntoSentences(s5Text)
    });

    // SECTION 6 (DETAILED & EXAM MODES): Governing Formulas, Derivations & Worked Solved Numericals
    if (depth === 'detailed' || depth === 'exam') {
      const formula = sideBySide?.pedagogicalSteps?.coreFormula || `${params.topic} is governed by standard physical laws.`;
      const numProblem = professionalLesson.workedNumericalProblem;

      let numSpeech = `The core governing mathematical relationship is: ${formula}.`;
      if (numProblem) {
        numSpeech += ` Let's solve a standard board examination numerical problem together. The problem asks: ${numProblem.problemStatement}. ` +
          `Step one: State the given values: ` + numProblem.givenData.map((g: any) => `${g.description} equals ${g.value} ${g.unit}`).join(', ') + `. ` +
          `Step two: Identify the governing formula: ${numProblem.formulaUsed}. ` +
          `Step three: Substitute the values and calculate: ` + numProblem.stepByStepSolution.join(' ') + `. ` +
          `Therefore, the verified final answer is ${numProblem.finalAnswer}. Always remember to write the correct SI metric units!`;
      }

      if (language === 'te') {
        numSpeech = `ముఖ్యమైన గణిత సూత్రం మరియు లెక్కలు: సూత్రం ${formula}. పరీక్షలలో అడిగే లెక్కను సాధిద్దాం. లెక్కలో ఇచ్చిన విలువలను గుర్తించి, సూత్రంలో ప్రతిక్షేపించడం ద్వారా ఖచ్చితమైన సమాధానం వస్తుంది. ప్రమాణాలను తప్పనిసరిగా రాయండి.`;
      } else if (language === 'hi') {
        numSpeech = `मुख्य गणितीय सूत्र व आंकिक प्रश्न: मुख्य सूत्र है ${formula}. आइए बोर्ड परीक्षा के एक मानक संख्यात्मक प्रश्न को हल करें। दिए गए मानों को सूत्र में प्रतिस्थापित करने पर सही उत्तर प्राप्त होता है। सदैव सही मात्रक (units) अवश्य लिखें।`;
      }

      sections.push({
        sectionIndex: sectionCounter++,
        sectionId: `sec-${params.topic.toLowerCase().replace(/[^a-z0-9]/g, '-')}-6`,
        title: language === 'te' ? '6. సూత్రాలు & లెక్కల సాధన' : language === 'hi' ? '6. सूत्र व हल सहित आंकिक प्रश्न' : '6. Governing Formulas & Solved Numerical Problem',
        category: 'Quantitative Mastery',
        spokenText: numSpeech,
        writtenMarkdownSummary: `### Governing Formulas & Solved Problem\n\n- **Formula:** \`${formula}\`\n\n${numProblem ? `**Problem:** ${numProblem.problemStatement}\n\n**Solution:** ${numProblem.finalAnswer}` : ''}`,
        estimatedDurationSeconds: Math.ceil(numSpeech.length / 15),
        status: 'pending',
        highlightTargetHeading: 'Formulas & Problem Solving',
        sentences: this.segmentTextIntoSentences(numSpeech)
      });
    }

    // SECTION 7 (EXAM MODE ONLY): Key Differences & Comparison Table Analysis
    if (depth === 'exam' && professionalLesson.differencesAndComparisons) {
      const diff = professionalLesson.differencesAndComparisons;
      let diffSpeech = `A favorite topic for exam examiners is comparing ${diff.conceptA} versus ${diff.conceptB}. ` +
        diff.rows.map((r: any) => `Regarding ${r.aspect}: ${diff.conceptA} features ${r.itemA}, whereas ${diff.conceptB} features ${r.itemB}.`).join(' ') +
        ` In summary: ${diff.summaryTakeaway || 'Memorize this comparison table for distinction marks.'}`;

      if (language === 'te') {
        diffSpeech = `పరీక్షలలో తరచుగా అడిగే తేడాలు: ${diff.conceptA} మరియు ${diff.conceptB} మధ్య వ్యత్యాసాలను గమనించండి. పట్టిక రూపంలో సమాధానం రాయడం వల్ల పూర్తి మార్కులు లభిస్తాయి.`;
      } else if (language === 'hi') {
        diffSpeech = `परीक्षा के लिए अत्यंत महत्वपूर्ण अंतर: ${diff.conceptA} और ${diff.conceptB} के बीच प्रमुख अंतरों को याद रखें। सारणीबद्ध रूप में उत्तर लिखने पर परीक्षक पूरे अंक देते हैं।`;
      }

      sections.push({
        sectionIndex: sectionCounter++,
        sectionId: `sec-${params.topic.toLowerCase().replace(/[^a-z0-9]/g, '-')}-7`,
        title: language === 'te' ? '7. ముఖ్యమైన తేడాల విశ్లేషణ' : language === 'hi' ? '7. मुख्य अंतर व तुलनात्मक विश्लेषण' : `7. Key Differences: ${diff.conceptA} vs ${diff.conceptB}`,
        category: 'Exam Distinctions',
        spokenText: diffSpeech,
        writtenMarkdownSummary: `### Comparison: ${diff.conceptA} vs ${diff.conceptB}\n\n| Aspect | ${diff.conceptA} | ${diff.conceptB} |\n| :--- | :--- | :--- |\n` +
          diff.rows.map((r: any) => `| **${r.aspect}** | ${r.itemA} | ${r.itemB} |`).join('\n'),
        estimatedDurationSeconds: Math.ceil(diffSpeech.length / 15),
        status: 'pending',
        highlightTargetHeading: 'Differences & Comparisons',
        sentences: this.segmentTextIntoSentences(diffSpeech)
      });
    }

    // SECTION 8 (EXAM MODE ONLY): Board Exam Traps, Misconceptions & Marking Rubric
    if (depth === 'exam') {
      const traps = professionalLesson.misconceptionsVsFacts || [];
      const trap1 = traps[0];
      const markingTip = sideBySide?.pedagogicalSteps?.examMarkingTip || 'Draw clean diagrams and state exact scientific terms to score full marks.';
      let examSpeech = `Here are high-yield examination tips and pitfalls to avoid: ` +
        (trap1 ? `Common student misconception: ${trap1.misconception}. The verified scientific fact is: ${trap1.scientificFact}. ` : '') +
        `Examiner Marking Tip: ${markingTip}`;

      if (language === 'te') {
        examSpeech = `పరీక్షలలో విద్యార్థులు చేసే సాధారణ తప్పులు మరియు వాటికి సరైన శాస్త్రీయ వివరణ: పరీక్షల్లో డ్రాయింగ్స్ మరియు ఫార్ములాలను స్పష్టంగా రాస్తే పూర్తి మార్కులు పొందవచ్చు.`;
      } else if (language === 'hi') {
        examSpeech = `बोर्ड परीक्षा के महत्वपूर्ण सुझाव: सामान्य गलतियों से बचें और वैज्ञानिक तथ्यों को सटीक रूप में लिखें। सही रेखाचित्र व मात्रक लिखने पर पूरे अंक मिलते हैं।`;
      }

      sections.push({
        sectionIndex: sectionCounter++,
        sectionId: `sec-${params.topic.toLowerCase().replace(/[^a-z0-9]/g, '-')}-8`,
        title: language === 'te' ? '8. పరీక్ష చిట్కాలు & సాధారణ తప్పులు' : language === 'hi' ? '8. परीक्षा टिप्स व सावधानियां' : '8. Board Exam Traps & Examiner Marking Tips',
        category: 'Exam Strategy',
        spokenText: examSpeech,
        writtenMarkdownSummary: `### Examination Tips & Traps\n\n- **Marking Tip:** ${markingTip}\n${trap1 ? `- **Misconception Busted:** ${trap1.scientificFact}` : ''}`,
        estimatedDurationSeconds: Math.ceil(examSpeech.length / 15),
        status: 'pending',
        highlightTargetHeading: 'Exam Traps & Tips',
        sentences: this.segmentTextIntoSentences(examSpeech)
      });
    }

    // FINAL SECTION: Chapter Recap & Diagnostic Check
    const diagCheck = professionalLesson.diagnosticCheck;
    let recapSpeech = `Congratulations on completing this audio lesson on ${params.topic}! Let's quickly review the core takeaway. `;
    if (diagCheck) {
      recapSpeech += `Here is a quick self-check question: ${diagCheck.question} Is it A, B, C, or D? The correct answer is option ${diagCheck.correctAnswer}: ${diagCheck.explanation}. Great job!`;
    }

    if (language === 'te') {
      recapSpeech = `అభినందనలు! ${params.topic} పాఠాన్ని విజయవంతంగా పూర్తి చేశారు. ఈ అంశాన్ని బాగా పునశ్చరణ చేయండి. పరీక్షలలో ఉత్తమ ఫలితాలు సాధించండి. ధన్యవాదాలు!`;
    } else if (language === 'hi') {
      recapSpeech = `बधाई! आपने ${params.topic} का यह ऑडियो पाठ सफलतापूर्वक पूर्ण कर लिया है। इसका नियमित अभ्यास करें और परीक्षा में उत्कृष्ट अंक प्राप्त करें। धन्यवाद!`;
    }

    sections.push({
      sectionIndex: sectionCounter++,
      sectionId: `sec-${params.topic.toLowerCase().replace(/[^a-z0-9]/g, '-')}-9`,
      title: language === 'te' ? '9. పునశ్చరణ & స్వీయ పరీక్ష' : language === 'hi' ? '9. पुनरावलोकन व स्व-मूल्यांकन' : '9. Chapter Recap & Diagnostic Check',
      category: 'Recap',
      spokenText: recapSpeech,
      writtenMarkdownSummary: `### Summary & Self-Check\n\n${diagCheck ? `**Question:** ${diagCheck.question}\n**Correct Answer:** Option ${diagCheck.correctAnswer}` : 'Complete topic review completed.'}`,
      estimatedDurationSeconds: Math.ceil(recapSpeech.length / 15),
      status: 'pending',
      highlightTargetHeading: 'Recap & Self-Check',
      sentences: this.segmentTextIntoSentences(recapSpeech)
    });

    const totalDurationSeconds = sections.reduce((acc, s) => acc + s.estimatedDurationSeconds, 0);
    const lessonTitle = `${params.topic} — ${depth.toUpperCase()} Audio Lesson (${language.toUpperCase()})`;

    const lesson: NoteAudioLesson = {
      id: `nal-${crypto.randomUUID().slice(0, 10)}`,
      noteId: params.noteId,
      userId: params.userId,
      topic: params.topic,
      subject: params.subject,
      grade,
      board,
      depth,
      language,
      voiceName,
      status: 'ready',
      lessonTitle,
      teacherGreeting,
      totalDurationSeconds,
      sections,
      currentPlaybackSection: 0,
      currentPlaybackSeconds: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return lesson;
  }

  /**
   * Synthesizes audio for a single section with caching and failover.
   */
  public async synthesizeSectionAudio(
    section: NoteAudioSection,
    topic: string,
    voiceName = 'Nova (Teacher)',
    speed = 1.0,
    language: AudioNarrationLanguage = 'en'
  ): Promise<{ audioUrl: string; durationSeconds: number; providerUsed: string }> {
    const cacheKey = crypto
      .createHash('sha256')
      .update(`${section.spokenText}:${voiceName}:${speed}:${language}`)
      .digest('hex');

    const cached = audioSectionCache.get(cacheKey);
    if (cached) {
      return {
        audioUrl: cached.audioUrl,
        durationSeconds: cached.durationSeconds,
        providerUsed: `${cached.provider} (Cached)`
      };
    }

    const ttsResult = await generateNaturalAudioLesson({
      topic,
      scriptText: section.spokenText,
      voice: voiceName,
      speed,
      language
    });

    const audioUrl = ttsResult.wavDataUrl;
    const durationSeconds = ttsResult.durationSeconds || section.estimatedDurationSeconds;
    const providerUsed = ttsResult.providerUsed;

    audioSectionCache.set(cacheKey, {
      audioUrl,
      durationSeconds,
      provider: providerUsed
    });

    return { audioUrl, durationSeconds, providerUsed };
  }

  /**
   * Handles student interruption during audio lesson ("explain again", "what does this mean", "explain diagram", etc.)
   * and preserves the lesson playback state for seamless resumption.
   */
  public async handleInteractiveVoiceInterruption(params: {
    noteAudioLesson: NoteAudioLesson;
    currentSectionIndex: number;
    playbackSeconds: number;
    studentQuestion: string;
    language?: AudioNarrationLanguage;
  }): Promise<InteractiveVoiceInterruptionResult> {
    const lang = params.language || params.noteAudioLesson.language || 'en';
    const section = params.noteAudioLesson.sections[params.currentSectionIndex] || params.noteAudioLesson.sections[0];
    const qLower = params.studentQuestion.toLowerCase();

    let verbalAnswer = '';
    const suggestedActions = ['Resume Lesson', 'Ask Another Question', 'Explain Diagram'];

    if (qLower.includes('again') || qLower.includes('repeat')) {
      verbalAnswer = lang === 'te'
        ? `ఖచ్చితంగా, మరొకసారి వివరిస్తాను: ${section.spokenText}`
        : lang === 'hi'
        ? `निश्चय ही, मैं इसे पुनः समझाता हूँ: ${section.spokenText}`
        : `Of course! Let's review this section again: ${section.spokenText}`;
    } else if (qLower.includes('simply') || qLower.includes('simple') || qLower.includes('easier')) {
      verbalAnswer = lang === 'te'
        ? `సరళంగా చెప్పాలంటే: ${params.noteAudioLesson.topic} అనేది ఒక సహజ వ్యవస్థ. ఇందులో ప్రతి భాగం తన బాధ్యతను క్రమంగా నిర్వర్తిస్తుంది.`
        : lang === 'hi'
        ? `सरल शब्दों में: ${params.noteAudioLesson.topic} एक सुव्यवस्थित प्रणाली है, जहाँ प्रत्येक घटक अपना कार्य सुचारु रूप से करता है।`
        : `In simple terms: think of ${params.noteAudioLesson.topic} like an assembly line or recipe where specific inputs transform smoothly into useful products.`;
    } else if (qLower.includes('diagram') || qLower.includes('image') || qLower.includes('picture')) {
      if (section.visual?.spokenVisualWalkthrough) {
        verbalAnswer = `${section.visual.spokenVisualWalkthrough.whatItShows} Look at ${section.visual.spokenVisualWalkthrough.importantComponents.join(', ')}. ${section.visual.spokenVisualWalkthrough.studentTakeaway}`;
      } else {
        verbalAnswer = `The accompanying visual provides a clear schematic of ${params.noteAudioLesson.topic}, highlighting the relationship between inputs and outputs.`;
      }
    } else if (qLower.includes('example')) {
      verbalAnswer = lang === 'te'
        ? `నిజజీవిత ఉదాహరణ: రోజువారీ జీవితంలో మనం దీనిని సహజ ప్రక్రియలలో మరియు ఆధునిక సాంకేతిక పరికరాలలో చూస్తాము.`
        : lang === 'hi'
        ? `वास्तविक जीवन का उदाहरण: दैनिक जीवन में हम इसे प्राकृतिक प्रक्रियाओं व आधुनिक उपकरणों में कार्य करते देखते हैं।`
        : `Here is a real-world example: whenever this process occurs in nature, energy is conserved and transformed into measurable chemical or mechanical work.`;
    } else if (qLower.includes('formula') || qLower.includes('equation')) {
      verbalAnswer = `The governing mathematical equation describes the exact proportionality between reactants, products, or physical force and acceleration. Always ensure both sides have matching SI metric units.`;
    } else {
      verbalAnswer = lang === 'te'
        ? `మంచి ప్రశ్న! ${params.noteAudioLesson.topic} లో ఇది చాలా ఆసక్తికరమైన అంశం. దీనికి సంబంధించిన ముఖ్య సూత్రాలను మన ప్రస్తుత పాఠంలో విశ్లేషిస్తున్నాం.`
        : lang === 'hi'
        ? `बहुत अच्छा प्रश्न! ${params.noteAudioLesson.topic} में यह एक महत्वपूर्ण बिंदु है। इसकी मूल कार्यप्रणाली को हम इस पाठ में समझ रहे हैं।`
        : `That's a thoughtful question! In ${params.noteAudioLesson.topic}, this happens because the system always tends toward thermodynamic balance and follows fundamental scientific rules.`;
    }

    // Synthesize spoken answer
    const tts = await generateNaturalAudioLesson({
      topic: params.noteAudioLesson.topic,
      scriptText: verbalAnswer,
      voice: params.noteAudioLesson.voiceName,
      speed: 1.0,
      language: lang
    });

    return {
      interruptionId: `int-${crypto.randomUUID().slice(0, 8)}`,
      studentQuestion: params.studentQuestion,
      verbalAnswer,
      audioUrl: tts.wavDataUrl,
      audioDurationSeconds: tts.durationSeconds,
      resumeSectionIndex: params.currentSectionIndex,
      resumeSeconds: params.playbackSeconds,
      suggestedActions
    };
  }

  /**
   * Helper: Localize text for Telugu teacher narration preserving technical terms.
   */
  private localizeToTeluguTeacherSpeech(text: string, topic: string): string {
    let out = text;
    out = out.replace(/\bPhotosynthesis\b/gi, 'కిరణజన్య సంయోగక్రియ (Photosynthesis)');
    out = out.replace(/\bChloroplast\b/gi, 'హరితరేణువు (Chloroplast)');
    out = out.replace(/\bChlorophyll\b/gi, 'పత్రహరితం (Chlorophyll)');
    out = out.replace(/\bStomata\b/gi, 'పత్రరంధ్రాలు (Stomata)');
    out = out.replace(/\bHeart\b/gi, 'గుండె (Human Heart)');
    out = out.replace(/\bVentricle\b/gi, 'జఠరిక (Ventricle)');
    out = out.replace(/\bAtrium\b/gi, 'కర్ణిక (Atrium)');
    out = out.replace(/\bArtery\b/gi, 'ధమని (Artery)');
    out = out.replace(/\bVein\b/gi, 'సిర (Vein)');
    out = out.replace(/\bForce\b/gi, 'బలం (Force)');
    out = out.replace(/\bAcceleration\b/gi, 'త్వరణం (Acceleration)');
    out = out.replace(/\bVelocity\b/gi, 'వేగం (Velocity)');
    out = out.replace(/\bEnergy\b/gi, 'శక్తి (Energy)');
    out = out.replace(/\bWork\b/gi, 'పని (Work)');
    out = out.replace(/\bPower\b/gi, 'సామర్థ్యం (Power)');
    return out;
  }

  /**
   * Helper: Localize text for Hindi teacher narration preserving technical terms.
   */
  private localizeToHindiTeacherSpeech(text: string, topic: string): string {
    let out = text;
    out = out.replace(/\bPhotosynthesis\b/gi, 'प्रकाश-संश्लेषण (Photosynthesis)');
    out = out.replace(/\bChloroplast\b/gi, 'हरितलवक (Chloroplast)');
    out = out.replace(/\bChlorophyll\b/gi, 'पर्णहरित (Chlorophyll)');
    out = out.replace(/\bStomata\b/gi, 'रंध्र (Stomata)');
    out = out.replace(/\bHeart\b/gi, 'हृदय (Human Heart)');
    out = out.replace(/\bVentricle\b/gi, 'निलय (Ventricle)');
    out = out.replace(/\bAtrium\b/gi, 'अलिंद (Atrium)');
    out = out.replace(/\bArtery\b/gi, 'धमनी (Artery)');
    out = out.replace(/\bVein\b/gi, 'शिरा (Vein)');
    out = out.replace(/\bForce\b/gi, 'बल (Force)');
    out = out.replace(/\bAcceleration\b/gi, 'त्वरण (Acceleration)');
    out = out.replace(/\bVelocity\b/gi, 'वेग (Velocity)');
    out = out.replace(/\bEnergy\b/gi, 'ऊर्जा (Energy)');
    out = out.replace(/\bWork\b/gi, 'कार्य (Work)');
    out = out.replace(/\bPower\b/gi, 'शक्ति (Power)');
    return out;
  }
}

export const voiceTeachingEngine = new VoiceTeachingEngine();
