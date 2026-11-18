import { deepConceptMasteryEngine } from './deepConceptMasteryEngine.ts';
import { multiModelAiTeacherEngine } from './multiModelAiTeacherEngine.ts';

export type StudentIntentCategory =
  | 'greeting'
  | 'social_chat'
  | 'identity_capability'
  | 'casual_conversation'
  | 'gratitude_farewell'
  | 'confusion_clarification'
  | 'continue_lesson'
  | 'follow_up_question'
  | 'example_request'
  | 'pronunciation_request'
  | 'line_by_line_request'
  | 'quiz_request'
  | 'game_request'
  | 'language_learning_request'
  | 'voice_request'
  | 'image_document_question'
  | 'maximum_detail_explanation'
  | 'academic_question'
  | 'ambiguous_message';

export interface IntentClassificationResult {
  intent: StudentIntentCategory;
  confidence: number; // 0..1
  preservedTopic: string | null;
  shouldRunAcademicRag: boolean;
  shouldCreateNotesRecord: boolean;
  reason: string;
}

export interface LineByLineItem {
  lineNumber: number;
  originalLine: string;
  simpleExplanation: string;
  difficultWords: Array<{ word: string; meaning: string }>;
  underlyingMeaning: string;
  connectionToSurrounding: string;
}

export interface PronunciationGuide {
  originalText: string;
  language: string;
  phoneticGuide: string;
  syllableBreakdown: string;
  stressPattern: string;
  difficultSoundsTip: string;
  meaning: string;
  exampleSentence: string;
  rhythmTip: string;
  micScoringNote: string;
}

/**
 * Classifies student message intent using conversation history, context, and linguistic structure
 * so casual greetings/social messages never trigger full academic RAG or overwrite lesson topics.
 */
export function classifyStudentMessageIntent(opts: {
  message: string;
  previousTopic?: string | null;
  history?: Array<{ role: string; content: string }>;
  maximumDetailRequested?: boolean;
  hasAttachment?: boolean;
}): IntentClassificationResult {
  const raw = (opts.message || '').trim();
  const lower = raw.toLowerCase();
  let prevTopic = opts.previousTopic?.trim() || null;
  if (!prevTopic && Array.isArray(opts.history) && opts.history.length > 0) {
    for (let i = opts.history.length - 1; i >= 0; i--) {
      const h = opts.history[i];
      if (h?.role === 'user' && h.content) {
        const candidate = h.content
          .replace(/^(explain|what is|define|tell me about|describe)\s+/i, '')
          .replace(/[?!.]+$/g, '')
          .trim();
        if (
          candidate.length >= 3 &&
          !/^(hi|hello|hey|how are you|what is your name|thank you|thanks|bye|give me an example|explain it again)/i.test(candidate)
        ) {
          prevTopic = candidate.slice(0, 120);
          break;
        }
      }
    }
  }
  const wordCount = raw.split(/\s+/).filter(Boolean).length;

  // 1. Greetings
  if (/^(hi|hello|hey|hii+|yo|hola|namaste|good morning|good afternoon|good evening)[!.\s]*$/i.test(lower)) {
    return {
      intent: 'greeting',
      confidence: 0.98,
      preservedTopic: prevTopic,
      shouldRunAcademicRag: false,
      shouldCreateNotesRecord: false,
      reason: 'Short conversational greeting detected.'
    };
  }

  // 2. Identity & capability questions
  if (/^(what is your name|what's your name|who are you|what can you do|tell me about yourself)[?!.\s]*$/i.test(lower)) {
    return {
      intent: 'identity_capability',
      confidence: 0.97,
      preservedTopic: prevTopic,
      shouldRunAcademicRag: false,
      shouldCreateNotesRecord: false,
      reason: 'Identity or capability question detected.'
    };
  }

  // 2b. Social chat & casual conversation
  if (/^(how are you|how r u|how's it going|what's up|whats up|are you there)[?!.\s]*$/i.test(lower)) {
    return {
      intent: 'social_chat',
      confidence: 0.96,
      preservedTopic: prevTopic,
      shouldRunAcademicRag: false,
      shouldCreateNotesRecord: false,
      reason: 'Social conversational question detected.'
    };
  }

  if (/^(i am bored|i'm bored|tell me something interesting|can you help me|help me)[?!.\s]*$/i.test(lower)) {
    return {
      intent: 'casual_conversation',
      confidence: 0.94,
      preservedTopic: prevTopic,
      shouldRunAcademicRag: false,
      shouldCreateNotesRecord: false,
      reason: 'Casual conversation or general assistance request detected.'
    };
  }

  // 3. Gratitude & farewell
  if (/^(thank you|thanks|thx|ty|thank u|bye|goodbye|see you|good night|ok thanks|got it,? thanks)[!.\s]*$/i.test(lower)) {
    return {
      intent: 'gratitude_farewell',
      confidence: 0.97,
      preservedTopic: prevTopic,
      shouldRunAcademicRag: false,
      shouldCreateNotesRecord: false,
      reason: 'Gratitude or farewell detected.'
    };
  }

  // 4. Confusion / Clarification / Repeat Differently (must preserve previous topic!)
  if (
    /\b(i don'?t understand|don'?t get it|confused|explain (that|it) again|say that again|simpler|too complicated|didn'?t understand|repeat differently)\b/i.test(lower)
  ) {
    return {
      intent: 'confusion_clarification',
      confidence: 0.94,
      preservedTopic: prevTopic,
      shouldRunAcademicRag: Boolean(prevTopic),
      shouldCreateNotesRecord: false,
      reason: 'Student expressed confusion or requested a simpler re-explanation using previous topic context.'
    };
  }

  // 5. Continue previous lesson
  if (/\b(continue|go on|next part|keep going|previous lesson|where we left off)\b/i.test(lower) && wordCount <= 9) {
    return {
      intent: 'continue_lesson',
      confidence: 0.92,
      preservedTopic: prevTopic,
      shouldRunAcademicRag: Boolean(prevTopic),
      shouldCreateNotesRecord: false,
      reason: 'Student asked to continue the previous lesson.'
    };
  }

  // 5b. Example request (anchors to previousTopic when present)
  if (
    /^(give me an? example|show me an? example|real[- ]life example|another example|examples?\??|for example\??)[!.\s]*$/i.test(lower) ||
    (/\b(give me an? example|more examples|everyday example)\b/i.test(lower) && wordCount <= 9)
  ) {
    return {
      intent: 'example_request',
      confidence: 0.94,
      preservedTopic: prevTopic,
      shouldRunAcademicRag: Boolean(prevTopic),
      shouldCreateNotesRecord: false,
      reason: 'Example request detected; preserving active conversation topic.'
    };
  }

  // 5c. Context-dependent follow-up question (anaphora: "its", "it", "this", "more deeply")
  if (
    prevTopic &&
    wordCount <= 12 &&
    /\b(its|it|this|that|more deeply|in more detail|explain more|go deeper|why is it important|what is its importance|what are its applications|how does it work)\b/i.test(lower)
  ) {
    return {
      intent: 'follow_up_question',
      confidence: 0.93,
      preservedTopic: prevTopic,
      shouldRunAcademicRag: true,
      shouldCreateNotesRecord: false,
      reason: 'Follow-up question referencing active conversation topic.'
    };
  }

  // 6. Pronunciation request
  if (/\b(pronounce|pronunciation|how (do you|to) say|syllables?)\b/i.test(lower)) {
    return {
      intent: 'pronunciation_request',
      confidence: 0.95,
      preservedTopic: prevTopic,
      shouldRunAcademicRag: false,
      shouldCreateNotesRecord: false,
      reason: 'Pronunciation teaching request detected.'
    };
  }

  // 7. Line-by-line explanation request
  if (/\b(line by line|every line|each line|sentence by sentence|break down this paragraph)\b/i.test(lower)) {
    return {
      intent: 'line_by_line_request',
      confidence: 0.95,
      preservedTopic: prevTopic,
      shouldRunAcademicRag: false,
      shouldCreateNotesRecord: false,
      reason: 'Line-by-line explanation request detected.'
    };
  }

  // 8. Quiz request
  if (/\b(give me a quiz|quiz me|test my understanding|practice questions?|mcq)\b/i.test(lower)) {
    return {
      intent: 'quiz_request',
      confidence: 0.92,
      preservedTopic: prevTopic,
      shouldRunAcademicRag: true,
      shouldCreateNotesRecord: false,
      reason: 'Quiz or understanding check requested.'
    };
  }

  // 9. Game request
  if (/\b(play a game|open game|study rush|war of words|sky striker|shadow ninja)\b/i.test(lower)) {
    return {
      intent: 'game_request',
      confidence: 0.9,
      preservedTopic: prevTopic,
      shouldRunAcademicRag: false,
      shouldCreateNotesRecord: false,
      reason: 'Educational 3D game launch request detected.'
    };
  }

  // 10. Image / document question
  if (opts.hasAttachment) {
    return {
      intent: 'image_document_question',
      confidence: 0.9,
      preservedTopic: prevTopic,
      shouldRunAcademicRag: true,
      shouldCreateNotesRecord: false,
      reason: 'Question includes uploaded image/document context.'
    };
  }

  // 11. Ambiguous very short message (e.g. "?", "help", "hmm", "what")
  if (wordCount <= 2 && /^(help|what|why|how|hmm+|\?+|\.+)$/i.test(lower)) {
    return {
      intent: 'ambiguous_message',
      confidence: 0.85,
      preservedTopic: prevTopic,
      shouldRunAcademicRag: false,
      shouldCreateNotesRecord: false,
      reason: 'Message is genuinely ambiguous; ask one short clarifying question.'
    };
  }

  // 12. Maximum detail vs standard academic question
  if (opts.maximumDetailRequested || /\b(maximum detail|in depth|deepest|everything about|complete lesson)\b/i.test(lower)) {
    return {
      intent: 'maximum_detail_explanation',
      confidence: 0.93,
      preservedTopic: prevTopic,
      shouldRunAcademicRag: true,
      shouldCreateNotesRecord: false,
      reason: 'Maximum-detail comprehensive lesson requested.'
    };
  }

  return {
    intent: 'academic_question',
    confidence: 0.88,
    preservedTopic: prevTopic,
    shouldRunAcademicRag: true,
    shouldCreateNotesRecord: false,
    reason: 'Academic topic explanation or problem-solving request.'
  };
}

export function buildLineByLineExplanation(sourceText: string, subject = 'General'): LineByLineItem[] {
  const cleaned = sourceText
    .replace(/^.*?(line by line|every line|each line|sentence by sentence)[:\s-]*/i, '')
    .trim();
  const rawLines = cleaned
    .split(/\r?\n|(?<=[.!?])\s+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const lines = rawLines.length > 0 ? rawLines : [sourceText.trim()];

  return lines.map((line, idx) => {
    const longWords = Array.from(
      new Set(
        line
          .replace(/[^a-zA-Z\s]/g, ' ')
          .split(/\s+/)
          .filter((w) => w.length >= 7)
      )
    ).slice(0, 3);

    const isMathLine = /=|\+|\-|\*|\/|\^|\d/.test(line) && /math|physics|chem/i.test(subject);

    return {
      lineNumber: idx + 1,
      originalLine: line,
      simpleExplanation: isMathLine
        ? `This step transforms or evaluates the expression "${line}" while preserving equality.`
        : `In simple words, this line states: ${line.replace(/\.$/, '')}.`,
      difficultWords: longWords.map((w) => ({
        word: w,
        meaning: `Key ${subject} term used in this sentence.`
      })),
      underlyingMeaning: isMathLine
        ? 'Each algebraic/numerical step prepares the values for the next calculation.'
        : 'Establishes a cause, definition, or supporting detail for the paragraph.',
      connectionToSurrounding:
        idx === 0
          ? 'Introduces the opening idea that the following lines build upon.'
          : `Connects directly to Line ${idx} and leads into ${idx + 1 < lines.length ? `Line ${idx + 2}` : 'the conclusion'}.`
    };
  });
}

export function buildPronunciationGuide(message: string, language = 'English'): PronunciationGuide {
  const cleaned = message
    .replace(/^(please\s+)?(how\s+(do\s+you|to)\s+)?(pronounce|say)\s+/i, '')
    .replace(/[?"'.!]+$/g, '')
    .trim();
  const target = cleaned || 'Photosynthesis';

  // Build syllable segmentation heuristic
  const words = target.split(/\s+/);
  const syllabified = words
    .map((w) => {
      const parts = w.match(/[^aeiouy]*[aeiouy]+(?:[^aeiouy](?![aeiouy]))?/gi);
      if (!parts || parts.length <= 1) return w;
      return parts
        .map((p, i) => (i === Math.floor(parts.length / 2) ? p.toUpperCase() : p.toLowerCase()))
        .join('·');
    })
    .join('  ');

  const stressPart = syllabified.split('·').find((p) => p === p.toUpperCase()) || words[0];

  return {
    originalText: target,
    language,
    phoneticGuide: syllabified.toLowerCase().replace(/·/g, '-'),
    syllableBreakdown: syllabified,
    stressPattern: `Primary stress on "${stressPart}" (say it slightly louder and clearer).`,
    difficultSoundsTip: `Speak each syllable cleanly without rushing consonant clusters in "${target}".`,
    meaning: `Pronunciation & speaking guide for "${target}" (${language}).`,
    exampleSentence: `Try saying it naturally in a sentence: "Today I practiced saying ${target} clearly."`,
    rhythmTip: words.length > 2 ? 'Pause briefly between phrases for natural speaking rhythm.' : 'Keep a steady, relaxed pace.',
    micScoringNote: 'Audio replay uses browser speech synthesis; live microphone accuracy scoring requires active speech recognition.'
  };
}

export async function routeIntelligentTutorMessage(opts: {
  message: string;
  previousTopic?: string | null;
  subject?: string;
  grade?: number;
  board?: string;
  language?: string;
  studentName?: string;
  history?: Array<{ role: string; content: string }>;
  maximumDetailRequested?: boolean;
  hasAttachment?: boolean;
}) {
  const cls = classifyStudentMessageIntent({
    message: opts.message,
    previousTopic: opts.previousTopic,
    history: opts.history,
    maximumDetailRequested: opts.maximumDetailRequested,
    hasAttachment: opts.hasAttachment
  });

  const namePrefix = opts.studentName ? `${opts.studentName}, ` : '';
  const topic = cls.preservedTopic || opts.subject || 'today’s topic';

  if (cls.intent === 'greeting') {
    return {
      handledDirectly: true,
      classification: cls,
      reply: `Hey${opts.studentName ? ` ${opts.studentName}` : ''}! Great to see you. What subject or topic would you like to explore today?`
    };
  }

  if (cls.intent === 'identity_capability') {
    return {
      handledDirectly: true,
      classification: cls,
      reply: `I'm your STUDYAI learning assistant. You can ask me academic questions, explore topics step by step, practice pronunciation, or generate a Lesson Map anytime!`
    };
  }

  if (cls.intent === 'social_chat') {
    return {
      handledDirectly: true,
      classification: cls,
      reply: `I'm doing great and ready to help you learn! Ask me any question, paste a paragraph for line-by-line help, or pick a topic to master.`
    };
  }

  if (cls.intent === 'casual_conversation') {
    const reply = /bored|interesting/i.test(opts.message)
      ? `Fun fact: Light from the Sun takes about 8 minutes and 20 seconds to reach Earth—and plants use that exact sunlight in Photosynthesis! Want to explore a cool Science, History, or Space topic, or play a 3D learning game?`
      : `Of course${opts.studentName ? `, ${opts.studentName}` : ''}! Tell me which subject, topic, or homework question you'd like to work on.`;
    return {
      handledDirectly: true,
      classification: cls,
      reply
    };
  }

  if (cls.intent === 'gratitude_farewell') {
    const isFarewell = /\b(bye|goodbye|see you|good night)\b/i.test(opts.message);
    return {
      handledDirectly: true,
      classification: cls,
      reply: isFarewell
        ? `Goodbye${opts.studentName ? `, ${opts.studentName}` : ''}! Have a great day, and come back anytime you want to learn more.`
        : `You're welcome${opts.studentName ? `, ${opts.studentName}` : ''}! Happy to help — let me know if you want to explore another topic.`
    };
  }

  if (cls.intent === 'example_request' && !cls.preservedTopic) {
    return {
      handledDirectly: true,
      classification: cls,
      reply: `${namePrefix}sure! Which topic or concept would you like an example for?`
    };
  }

  if (cls.intent === 'ambiguous_message') {
    return {
      handledDirectly: true,
      classification: cls,
      reply: `${namePrefix}could you tell me which topic or question you'd like help with? For example, you can ask me to explain a concept, solve a problem, or review a paragraph line by line.`
    };
  }

  if (cls.intent === 'game_request') {
    return {
      handledDirectly: true,
      classification: cls,
      reply: `You can launch our 3D Learning Games (Shadow Ninja: Minecraft Realms, Sky Striker, Study Rush 3D, or War of Words) right from the "Play 3D Games" panel here in AI Tutor!`
    };
  }

  if (cls.intent === 'pronunciation_request') {
    const guide = buildPronunciationGuide(opts.message, opts.language || 'English');
    return {
      handledDirectly: true,
      classification: cls,
      pronunciationGuide: guide,
      reply: `Here is how to pronounce **${guide.originalText}**:\n- **Syllables:** ${guide.syllableBreakdown}\n- **Stress:** ${guide.stressPattern}\n- **Tip:** ${guide.difficultSoundsTip}\n- **Example:** ${guide.exampleSentence}`
    };
  }

  if (cls.intent === 'line_by_line_request') {
    const lines = buildLineByLineExplanation(opts.message, opts.subject || 'General');
    const formatted = lines
      .map(
        (l) =>
          `**Line ${l.lineNumber}:** "${l.originalLine}"\n- Simple meaning: ${l.simpleExplanation}\n- Connection: ${l.connectionToSurrounding}`
      )
      .join('\n\n');
    return {
      handledDirectly: true,
      classification: cls,
      lineByLineBreakdown: lines,
      reply: `Here is a line-by-line breakdown preserving your original text:\n\n${formatted}`
    };
  }

  if (cls.intent === 'confusion_clarification') {
    const simRes = await multiModelAiTeacherEngine.teach({
      question: `The student did not understand "${topic}". Explain "${topic}" again from scratch in much simpler words using a fresh everyday analogy, and end with one easy check question.`,
      topic,
      subject: opts.subject,
      grade: opts.grade || 10,
      board: opts.board || 'CBSE',
      language: opts.language || 'English',
      mode: 'normal'
    });
    return {
      handledDirectly: true,
      classification: cls,
      reply: `No worries at all — let's look at **${topic}** from a completely fresh angle:\n\n${simRes.directAnswer}`
    };
  }

  if (cls.intent === 'maximum_detail_explanation') {
    const deepLesson = await deepConceptMasteryEngine.generateDeepLesson({
      topic: opts.message.replace(/^(explain in maximum detail|explain)\s+/i, '').trim() || topic,
      subject: opts.subject || 'General Science',
      grade: opts.grade || 10,
      board: opts.board || 'CBSE',
      depthLevel: 'expert'
    });
    return {
      handledDirectly: true,
      classification: cls,
      deepLesson,
      reply: `### ${deepLesson.topic} — Maximum Detail Lesson\n\n**Definition:** ${deepLesson.section2_definition.formalDefinition}\n\n**How It Works:**\n${deepLesson.section4_howItWorks.map((s) => `${s.stepNumber}. **${s.stageTitle}:** ${s.whatHappens} *Why:* ${s.whyItHappens}`).join('\n')}`
    };
  }

  // Otherwise fall through to existing structured AI Tutor pipeline with preserved topic for follow-ups/examples
  const resolvedTopic =
    cls.intent === 'follow_up_question' || cls.intent === 'example_request' || cls.intent === 'continue_lesson'
      ? cls.preservedTopic || undefined
      : undefined;
  const resolvedPrompt =
    cls.intent === 'example_request' && resolvedTopic
      ? `Provide 3 clear everyday and scientific examples of "${resolvedTopic}" with step-by-step explanations.`
      : cls.intent === 'follow_up_question' && resolvedTopic
      ? `Continuing our lesson on "${resolvedTopic}": ${opts.message}`
      : opts.message;

  return {
    handledDirectly: false,
    classification: cls,
    resolvedTopic,
    resolvedPrompt
  };
}
