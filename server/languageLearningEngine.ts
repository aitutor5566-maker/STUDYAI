/**
 * STUDYAI AI Speaking Skills & Multilingual Language Learning Engine
 *
 * Architecture:
 * - 7 Supported Languages (English, Telugu, Hindi, Japanese, French, German, Spanish)
 * - Extensible framework for any additional natural language
 * - Independent Target Language vs. Support/Explanation Language
 * - 8 Progressive Learning Stages tailored to each language's writing system & grammar
 * - AI Speaking Skills Engine (Listen & Repeat, Pronunciation Assessment, Sentence Speaking, Voice Q&A, AI Dialogue Partner)
 * - Interactive Language Games (Word Match, Sentence Scramble, Missing Letter, Listen & Select)
 * - Independent Course Completion Tracking & Language Re-enrollment
 */

export interface SupportedLanguageMeta {
  code: string;
  name: string;
  nativeName: string;
  scriptName: string;
  flagEmoji: string;
  description: string;
  speechRecognitionCode: string;
  speechSynthesisVoice: string;
  stagesCount: number;
  featuredThemes: string[];
}

export interface VocabularyItem {
  id: string;
  term: string; // Target language word
  nativeScript?: string; // e.g. Hiragana/Kanji for Japanese, Devanagari for Hindi, Telugu script
  romanization?: string; // Romaji, Pinyin, or IAST pronunciation guide
  partOfSpeech: string;
  targetSentence: string;
  targetSentenceScript?: string;
  targetSentenceRomanization?: string;
  // Explanations mapped by support language (te = Telugu, en = English, hi = Hindi)
  translations: Record<string, {
    meaning: string;
    sentenceTranslation: string;
    grammarNote?: string;
    culturalContext?: string;
  }>;
  audioPronunciationText: string;
}

export interface GrammarConcept {
  id: string;
  title: string;
  ruleSummary: string;
  structureFormula: string;
  examples: Array<{
    target: string;
    romanization?: string;
    translations: Record<string, string>;
  }>;
  explanationsBySupportLang: Record<string, string>;
  commonMistakesBySupportLang: Record<string, string>;
}

export interface SpeakingExercise {
  id: string;
  type: 'listen_repeat' | 'pronunciation' | 'sentence_speak' | 'voice_answer' | 'conversation';
  promptTitle: string;
  targetPhrase: string;
  targetScript?: string;
  phoneticGuide: string;
  audioText: string;
  acceptableVariations: string[];
  supportExplanations: Record<string, {
    meaning: string;
    instructions: string;
    tips: string;
  }>;
}

export interface InteractiveGameItem {
  id: string;
  gameType: 'word_match' | 'sentence_scramble' | 'missing_letter' | 'listen_select' | 'translation_quiz';
  prompt: string;
  questionTarget: string;
  correctAnswer: string;
  options: string[];
  scrambledWords?: string[];
  supportTranslation: string;
}

export interface StageData {
  stageNumber: number;
  title: string;
  subtitle: string;
  focus: string;
  lessons: Array<{
    lessonNumber: number;
    title: string;
    description: string;
    vocabulary: VocabularyItem[];
    grammar: GrammarConcept[];
    speakingExercises: SpeakingExercise[];
    interactiveGames: InteractiveGameItem[];
  }>;
}

// 1. SUPPORTED LANGUAGES CATALOG
export const SUPPORTED_LANGUAGES: SupportedLanguageMeta[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    scriptName: 'Latin Alphabet (A-Z)',
    flagEmoji: '🇬🇧',
    description: 'Master global communication, academic fluency, phonetics, and confident conversational expression.',
    speechRecognitionCode: 'en-US',
    speechSynthesisVoice: 'Google US English',
    stagesCount: 8,
    featuredThemes: ['Foundations & Phonetics', 'Daily Life & Academics', 'Sentence Syntax', 'Tenses & Modals', 'Active Speaking', 'Analytical Reading', 'Debate & Professional Fluency', 'Advanced Communication']
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    scriptName: 'తెలుగు లిపి (Telugu Script)',
    flagEmoji: '🏛️',
    description: 'Learn the sweet Italian of the East — Achulu, Hallulu, Guninthalu, vibrant vocabulary, and classical conversation.',
    speechRecognitionCode: 'te-IN',
    speechSynthesisVoice: 'Google తెలుగు',
    stagesCount: 8,
    featuredThemes: ['అచ్చులు & హల్లులు (Vowels & Consonants)', 'గుణింతాలు & పదాలు', 'సరళ వాక్యాలు', 'విభక్తులు & వ్యాకరణం', 'సంభాషణ నైపుణ్యాలు', 'సాహిత్యం & పఠనం', 'రోజువారీ జీవితం', 'ఉన్నత ప్రావీణ్యత']
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    scriptName: 'देवनागरी (Devanagari)',
    flagEmoji: '🦚',
    description: 'Explore the national language of India — Varnamala, Matras, rich cultural idioms, and expressive speaking.',
    speechRecognitionCode: 'hi-IN',
    speechSynthesisVoice: 'Google हिन्दी',
    stagesCount: 8,
    featuredThemes: ['वर्णमाला (Swar & Vyanjan)', 'मात्राएँ एवं शब्द', 'सरल वाक्य रचना', 'कारक एवं काल (Tenses)', 'संवाद एवं उच्चारण', 'बोध एवं पठन', 'व्यावहारिक हिन्दी', 'प्रौढ़ अभिव्यक्ति']
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    scriptName: 'ひらがな, カタカナ & 漢字 (Hiragana, Katakana & Kanji)',
    flagEmoji: '🌸',
    description: 'Progressively learn Hiragana, Katakana, core Kanji, politeness levels (Keigo), and Japanese conversational etiquette.',
    speechRecognitionCode: 'ja-JP',
    speechSynthesisVoice: 'Google 日本語',
    stagesCount: 8,
    featuredThemes: ['Hiragana Foundations', 'Katakana & Loanwords', 'Essential Kanji & Particles (は, が, を)', 'Verb Conjugations (Masu form)', 'Listening & Natural Cadence', 'Reading Short Manga & Passages', 'Travel, Dining & Etiquette', 'Advanced N3/N2 Immersion']
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    scriptName: 'Alphabet Français avec Accents (é, è, ê, ç)',
    flagEmoji: '🗼',
    description: 'Learn the language of diplomacy and culture — nasal sounds, liaison, gender agreements, and Parisian dialogue.',
    speechRecognitionCode: 'fr-FR',
    speechSynthesisVoice: 'Google Français',
    stagesCount: 8,
    featuredThemes: ['Alphabet & Les Sons Français', 'Vocabulaire Quotidien', 'Structures de Phrases de Base', 'Conjugaison (Présent, Passé Composé)', 'Expression Orale & Écoute', 'Lecture & Compréhension', 'Voyage & Conversation Réelle', 'Expression Avancée']
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    scriptName: 'Lateinisches Alphabet mit Umlauten (ä, ö, ü, ß)',
    flagEmoji: '🏰',
    description: 'Engineered precision — Genders (der, die, das), 4 grammatical cases, compound words, and fluent spoken German.',
    speechRecognitionCode: 'de-DE',
    speechSynthesisVoice: 'Google Deutsch',
    stagesCount: 8,
    featuredThemes: ['Das Alphabet & Aussprache', 'Wortschatz des Alltags', 'Satzbau & Verbstellung', 'Die 4 Fälle (Kasus & Artikel)', 'Hören & Sprechen', 'Lesen & Textverständnis', 'Reise, Studium & Beruf', 'C1 Verhandlungssicherheit']
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    scriptName: 'Alfabeto Español con Ñ (ñ, á, é, í, ó, ú)',
    flagEmoji: '💃',
    description: 'Vibrant global tongue — rolled R (erre), Ser vs. Estar, subjunctive moods, and lively everyday conversations.',
    speechRecognitionCode: 'es-ES',
    speechSynthesisVoice: 'Google Español',
    stagesCount: 8,
    featuredThemes: ['El Alfabeto y Sonidos', 'Vocabulario Esencial', 'Construcción de Frases', 'Ser vs. Estar y Tiempos', 'Práctica de Conversación', 'Lectura y Redacción', 'Cultura y Viajes', 'Fluidez Avanzada']
  }
];

// Helper to get language meta
export function getLanguageMeta(code: string): SupportedLanguageMeta {
  const found = SUPPORTED_LANGUAGES.find((l) => l.code === code.toLowerCase());
  return (
    found || {
      code,
      name: code.toUpperCase(),
      nativeName: code.toUpperCase(),
      scriptName: 'Standard Script',
      flagEmoji: '🌐',
      description: `Language course for ${code.toUpperCase()}`,
      speechRecognitionCode: code,
      speechSynthesisVoice: 'Default',
      stagesCount: 8,
      featuredThemes: ['Foundations', 'Vocabulary', 'Sentences', 'Grammar', 'Speaking', 'Reading', 'Communication', 'Mastery']
    }
  );
}

// 2. CURRICULUM GENERATOR FOR 8 PROGRESSIVE STAGES
export function generateCurriculumForLanguage(langCode: string): StageData[] {
  const code = langCode.toLowerCase();

  // Language Specific Stage 1 to 8 Content
  if (code === 'ja') {
    return [
      {
        stageNumber: 1,
        title: 'Stage 1 — Hiragana & Japanese Foundations',
        subtitle: 'Master the 46 basic Hiragana characters, long vowels, and polite everyday greetings.',
        focus: 'alphabet',
        lessons: [
          {
            lessonNumber: 1,
            title: 'Lesson 1.1: The Vowel Row (あ, い, う, え, お) & Greetings',
            description: 'Learn the primary Japanese vowels and universal respectful greetings.',
            vocabulary: [
              {
                id: 'ja-1-1',
                term: 'こんにちは',
                nativeScript: 'こんにちは',
                romanization: 'Konnichiwa',
                partOfSpeech: 'Greeting',
                targetSentence: '皆さん、こんにちは！',
                targetSentenceScript: '皆さん、こんにちは！',
                targetSentenceRomanization: 'Minasan, konnichiwa!',
                translations: {
                  en: { meaning: 'Hello / Good afternoon', sentenceTranslation: 'Hello, everyone!' },
                  te: { meaning: 'నమస్కారం / శుభ మధ్యాహ్నం', sentenceTranslation: 'అందరికీ నమస్కారం!' },
                  hi: { meaning: 'नमस्ते / शुभ दोपहर', sentenceTranslation: 'आप सभी को नमस्ते!' }
                },
                audioPronunciationText: 'こんにちは'
              },
              {
                id: 'ja-1-2',
                term: 'ありがとう',
                nativeScript: 'ありがとう',
                romanization: 'Arigatou',
                partOfSpeech: 'Expression',
                targetSentence: '本当にありがとう。',
                targetSentenceScript: '本当にありがとう。',
                targetSentenceRomanization: 'Hontou ni arigatou.',
                translations: {
                  en: { meaning: 'Thank you', sentenceTranslation: 'Thank you very much.' },
                  te: { meaning: 'ధన్యవాదాలు', sentenceTranslation: 'చాలా ధన్యవాదాలు.' },
                  hi: { meaning: 'धन्यवाद', sentenceTranslation: 'बहुत-बहुत धन्यवाद।' }
                },
                audioPronunciationText: 'ありがとう'
              },
              {
                id: 'ja-1-3',
                term: 'おはよう',
                nativeScript: 'おはよう',
                romanization: 'Ohayou',
                partOfSpeech: 'Greeting',
                targetSentence: '先生、おはようございます！',
                targetSentenceScript: '先生、おはようございます！',
                targetSentenceRomanization: 'Sensei, ohayou gozaimasu!',
                translations: {
                  en: { meaning: 'Good morning', sentenceTranslation: 'Good morning, teacher!' },
                  te: { meaning: 'శుభోదయం', sentenceTranslation: 'శుభోదయం, గురువుగారూ!' },
                  hi: { meaning: 'शुभ प्रभात', sentenceTranslation: 'शुभ प्रभात, शिक्षक महोदय!' }
                },
                audioPronunciationText: 'おはようございます'
              }
            ],
            grammar: [
              {
                id: 'ja-g1',
                title: 'Polite Desu (です) & Topic Marker Wa (は)',
                ruleSummary: 'In Japanese, the particle は (pronounced wa) marks the topic of the sentence, and です (desu) functions as the polite copula (is/am/are).',
                structureFormula: '[Topic] は [Description/Noun] です。',
                examples: [
                  {
                    target: 'わたし は がくせい です。',
                    romanization: 'Watashi wa gakusei desu.',
                    translations: {
                      en: 'I am a student.',
                      te: 'నేను ఒక విద్యార్థిని.',
                      hi: 'मैं एक विद्यार्थी हूँ।'
                    }
                  }
                ],
                explanationsBySupportLang: {
                  en: 'Unlike English S-V-O word order, Japanese follows Subject-Object-Verb (S-O-V). The verb/copula "desu" always comes at the end.',
                  te: 'ఇంగ్లీష్‌లో సబ్జెక్ట్-వెర్బ్-ఆబ్జెక్ట్ ఉండగా, జపనీస్ భాషలో తెలుగు లాగానే కర్త-కర్మ-క్రియ (S-O-V) క్రమం ఉంటుంది. "డెస్" వాక్యం చివర వస్తుంది.',
                  hi: 'हिन्दी की तरह ही जापानी भाषा में भी कर्ता-कर्म-क्रिया (S-O-V) का क्रम होता है। "देसु" वाक्य के अंत में आता है।'
                },
                commonMistakesBySupportLang: {
                  en: 'Do not pronounce "は" as "ha" when used as a grammatical particle; pronounce it as "wa".',
                  te: 'పార్టికల్ రూపంలో ఉన్నప్పుడు "హ" అని కాకుండా "వా" అని పలకాలి.',
                  hi: 'व्याकरण कण के रूप में इसे "हा" नहीं, "वा" उच्चारित करें।'
                }
              }
            ],
            speakingExercises: [
              {
                id: 'ja-sp1',
                type: 'listen_repeat',
                promptTitle: 'Listen and repeat the polite greeting',
                targetPhrase: 'こんにちは',
                targetScript: 'こんにちは',
                phoneticGuide: 'Kon-ni-chi-wa',
                audioText: 'こんにちは',
                acceptableVariations: ['こんにちは', 'konnichiwa'],
                supportExplanations: {
                  en: { meaning: 'Hello', instructions: 'Press the microphone and say "Konnichiwa" clearly.', tips: 'Keep the vowels even and rhythmic.' },
                  te: { meaning: 'నమస్కారం', instructions: 'మైక్రోఫోన్ నొక్కి "కొన్నిచివా" అని స్పష్టంగా పలకండి.', tips: 'అక్షరాలను సమాన వేగంతో పలకండి.' },
                  hi: { meaning: 'नमस्ते', instructions: 'माइक दबाकर "कोन्निचिवा" स्पष्ट रूप से बोलें।', tips: 'स्वरों को लयबद्ध रखें।' }
                }
              },
              {
                id: 'ja-sp2',
                type: 'sentence_speak',
                promptTitle: 'Introduce yourself politely',
                targetPhrase: 'わたしはがくせいです',
                targetScript: '私は学生です',
                phoneticGuide: 'Watashi wa gakusei desu',
                audioText: 'わたしはがくせいです',
                acceptableVariations: ['私は学生です', 'わたしはがくせいです', 'watashi wa gakusei desu'],
                supportExplanations: {
                  en: { meaning: 'I am a student', instructions: 'Say the full sentence introducing yourself as a student.', tips: 'The final "u" in "desu" is whispered lightly as "des".' },
                  te: { meaning: 'నేను విద్యార్థిని', instructions: 'నేను విద్యార్థిని అని జపనీస్‌లో చెప్పండి.', tips: '"డెస్" చివర తేలికగా పలకాలి.' },
                  hi: { meaning: 'मैं विद्यार्थी हूँ', instructions: 'जापानी में अपना परिचय दें।', tips: '"देसु" का अंतिम उ हल्का फुसफुसाया जाता है।' }
                }
              }
            ],
            interactiveGames: [
              {
                id: 'ja-gm1',
                gameType: 'word_match',
                prompt: 'Match the Japanese greeting with its meaning',
                questionTarget: 'こんにちは',
                correctAnswer: 'Hello',
                options: ['Hello', 'Good night', 'Goodbye', 'Excuse me'],
                supportTranslation: 'Hello / Good afternoon'
              },
              {
                id: 'ja-gm2',
                gameType: 'sentence_scramble',
                prompt: 'Arrange the words to form: "I am a student"',
                questionTarget: 'I am a student',
                correctAnswer: 'わたし は がくせい です',
                options: ['わたし', 'は', 'がくせい', 'です'],
                scrambledWords: ['です', 'わたし', 'がくせい', 'は'],
                supportTranslation: 'I am a student.'
              }
            ]
          },
          {
            lessonNumber: 2,
            title: 'Lesson 1.2: The Ka, Sa, Ta, Na Rows & Numbers (1–10)',
            description: 'Learn the second block of Hiragana and count from 1 to 10.',
            vocabulary: [
              {
                id: 'ja-1-2-1',
                term: 'いち',
                nativeScript: '一',
                romanization: 'Ichi',
                partOfSpeech: 'Number',
                targetSentence: 'りんご を いちこ ください。',
                translations: { en: { meaning: 'One (1)', sentenceTranslation: 'Please give me one apple.' }, te: { meaning: 'ఒకటి (1)', sentenceTranslation: 'దయచేసి ఒక ఆపిల్ ఇవ్వండి.' } },
                audioPronunciationText: 'いち'
              }
            ],
            grammar: [],
            speakingExercises: [],
            interactiveGames: []
          },
          {
            lessonNumber: 3,
            title: 'Lesson 1.3: Self-Introduction & Polite Greetings',
            description: 'Introduce yourself politely with Hajimemashite and Yoroshiku Onegaishimasu.',
            vocabulary: [
              {
                id: 'ja-1-3-1',
                term: 'はじめまして',
                nativeScript: 'はじめまして',
                romanization: 'Hajimemashite',
                partOfSpeech: 'Expression',
                targetSentence: 'はじめまして、ヴィシュワクです。',
                translations: { en: { meaning: 'Nice to meet you', sentenceTranslation: 'Nice to meet you, I am Vishwak.' }, te: { meaning: 'పరిచయమైనందుకు సంతోషం', sentenceTranslation: 'పరిచయమైనందుకు సంతోషం, నా పేరు విశ్వక్.' } },
                audioPronunciationText: 'はじめまして'
              }
            ],
            grammar: [],
            speakingExercises: [],
            interactiveGames: []
          }
        ]
      },
      {
        stageNumber: 2,
        title: 'Stage 2 — Katakana, Daily Life & Vocabulary',
        subtitle: 'Learn foreign loanwords in Katakana, numbers, food, and family terms.',
        focus: 'vocabulary',
        lessons: [
          {
            lessonNumber: 1,
            title: 'Lesson 2.1: Food, Drinks & Katakana Loanwords',
            description: 'Order food and recognize loanwords like コーヒー (coffee) and パン (bread).',
            vocabulary: [
              {
                id: 'ja-2-1',
                term: 'みず',
                nativeScript: '水',
                romanization: 'Mizu',
                partOfSpeech: 'Noun',
                targetSentence: 'おみず を ください。',
                targetSentenceScript: 'お水をください。',
                targetSentenceRomanization: 'Omizu o kudasai.',
                translations: {
                  en: { meaning: 'Water', sentenceTranslation: 'Please give me water.' },
                  te: { meaning: 'నీరు / మంచి నీళ్ళు', sentenceTranslation: 'దయచేసి మంచి నీళ్ళు ఇవ్వండి.' },
                  hi: { meaning: 'पानी / जल', sentenceTranslation: 'कृपया मुझे पानी दीजिए।' }
                },
                audioPronunciationText: 'お水をください'
              }
            ],
            grammar: [
              {
                id: 'ja-g2',
                title: 'Object Marker を (O) & Kudasai (Please Give Me)',
                ruleSummary: 'The particle を marks the direct object of an action verb. "Kudasai" requests something politely.',
                structureFormula: '[Item] を ください。',
                examples: [{ target: 'みず を ください。', romanization: 'Mizu o kudasai.', translations: { en: 'Water, please.', te: 'దయచేసి నీరు ఇవ్వండి.', hi: 'कृपया पानी दीजिए।' } }],
                explanationsBySupportLang: {
                  en: 'Use "o kudasai" whenever you want to order food, drinks, or ask for an item in a store.',
                  te: 'ఏదైనా వస్తువును లేదా ఆహారాన్ని ఆర్డర్ చేసేటప్పుడు "ఓ కుదసాయి" అని అడగాలి.',
                  hi: 'दुकान या रेस्तरां में कुछ मांगते समय "ओ कुदासाई" का प्रयोग करें।'
                },
                commonMistakesBySupportLang: {
                  en: 'Particle を is written with hiragana "wo" on keyboard but pronounced "o".',
                  te: 'కీబోర్డులో "wo" అని టైప్ చేసినా పలికేటప్పుడు "ఓ" అని పలకాలి.',
                  hi: 'लिखते समय "wo" टाइप करते हैं, पर बोलते समय केवल "ओ" उच्चारित करते हैं।'
                }
              }
            ],
            speakingExercises: [
              {
                id: 'ja-sp3',
                type: 'voice_answer',
                promptTitle: 'Order water politely in a restaurant',
                targetPhrase: 'おみずをください',
                targetScript: 'お水をください',
                phoneticGuide: 'Omizu o kudasai',
                audioText: 'おみずをください',
                acceptableVariations: ['お水をください', 'おみずをください', 'omizu o kudasai'],
                supportExplanations: {
                  en: { meaning: 'Water, please', instructions: 'Imagine the waiter asks what you want. Say: "Omizu o kudasai".', tips: 'Adding "O" before "mizu" makes it polite.' },
                  te: { meaning: 'దయచేసి నీరు ఇవ్వండి', instructions: 'రెస్టారెంట్‌లో నీరు ఆర్డర్ చేయండి: "ఒమిజు ఓ కుదసాయి".', tips: 'ముందు "ఓ" చేరిస్తే మర్యాదగా ఉంటుంది.' },
                  hi: { meaning: 'कृपया पानी दीजिए', instructions: 'रेस्तरां में पानी मांगें: "ओमिज़ु ओ कुदासाई"।', tips: '"ओ" लगाने से वाक्य विनम्र बनता है।' }
                }
              }
            ],
            interactiveGames: [
              {
                id: 'ja-gm3',
                gameType: 'listen_select',
                prompt: 'Listen to the audio and select what the speaker requested',
                questionTarget: 'お水をください',
                correctAnswer: 'Water',
                options: ['Water', 'Tea', 'Coffee', 'Rice'],
                supportTranslation: 'Please give me water'
              }
            ]
          },
          {
            lessonNumber: 2,
            title: 'Lesson 2.2: Family Members & Kinship Terms',
            description: 'Learn terms for family (Kazoku, Chichi, Haha, Kyoudai).',
            vocabulary: [],
            grammar: [],
            speakingExercises: [],
            interactiveGames: []
          },
          {
            lessonNumber: 3,
            title: 'Lesson 2.3: Colors, Clothing & Physical Descriptions',
            description: 'Describe everyday items and apparel.',
            vocabulary: [],
            grammar: [],
            speakingExercises: [],
            interactiveGames: []
          }
        ]
      },
      {
        stageNumber: 3,
        title: 'Stage 3 — Sentence Formation & Questions',
        subtitle: 'Ask questions with か (ka), discover locations with ここ・そこ・どこ, and build basic dialogues.',
        focus: 'sentence_formation',
        lessons: [
          { lessonNumber: 1, title: 'Lesson 3.1: Asking Where Things Are (Doko desu ka?)', description: 'Ask for restrooms, train stations, and landmarks.', vocabulary: [], grammar: [], speakingExercises: [], interactiveGames: [] },
          { lessonNumber: 2, title: 'Lesson 3.2: Demonstrative Pronouns (Kore, Sore, Are)', description: 'Point to and identify objects near and far.', vocabulary: [], grammar: [], speakingExercises: [], interactiveGames: [] },
          { lessonNumber: 3, title: 'Lesson 3.3: Prices & Shopping Questions (Ikura desu ka?)', description: 'Inquire about costs in Japanese shops.', vocabulary: [], grammar: [], speakingExercises: [], interactiveGames: [] }
        ]
      },
      {
        stageNumber: 4,
        title: 'Stage 4 — Japanese Grammar & Verb Conjugations',
        subtitle: 'Understand U-verbs, Ru-verbs, Irregular verbs (Suru, Kuru) and their Masu / Masen forms.',
        focus: 'grammar',
        lessons: [
          { lessonNumber: 1, title: 'Lesson 4.1: The Present Polite Tense (Tabemasu, Nomimasu)', description: 'Daily habits and actions.', vocabulary: [], grammar: [], speakingExercises: [], interactiveGames: [] },
          { lessonNumber: 2, title: 'Lesson 4.2: Past Tense Conjugation (Mashita & Masen deshita)', description: 'Describe what you did yesterday or last week.', vocabulary: [], grammar: [], speakingExercises: [], interactiveGames: [] },
          { lessonNumber: 3, title: 'Lesson 4.3: Inviting Others (Mashou & Masen ka)', description: 'Propose lunch or going somewhere together.', vocabulary: [], grammar: [], speakingExercises: [], interactiveGames: [] }
        ]
      },
      {
        stageNumber: 5,
        title: 'Stage 5 — Active Listening & Natural Speaking',
        subtitle: 'Shadowing exercises, pitch accent awareness, and spoken response drills.',
        focus: 'speaking_listening',
        lessons: [
          { lessonNumber: 1, title: 'Lesson 5.1: Conversational Timing & Aizuchi (Nodding Phrases)', description: 'Sound like a native speaker using Sou desu ne and Naruhodo.', vocabulary: [], grammar: [], speakingExercises: [], interactiveGames: [] },
          { lessonNumber: 2, title: 'Lesson 5.2: Natural Speed Comprehension & Podcasts', description: 'Follow daily spoken dialogues at normal speed.', vocabulary: [], grammar: [], speakingExercises: [], interactiveGames: [] },
          { lessonNumber: 3, title: 'Lesson 5.3: Asking for Clarification & Repetition', description: 'Say Mou ichido onegaishimasu naturally.', vocabulary: [], grammar: [], speakingExercises: [], interactiveGames: [] }
        ]
      },
      {
        stageNumber: 6,
        title: 'Stage 6 — Reading & Writing (Essential Kanji)',
        subtitle: 'First 50 Jouyou Kanji: Numbers (一, 二, 三), elements (日, 月, 木, 水, 火), and reading comprehension.',
        focus: 'reading_writing',
        lessons: [
          { lessonNumber: 1, title: 'Lesson 6.1: Reading Real Signs, Schedules & Menus', description: 'Practical reading in Tokyo.', vocabulary: [], grammar: [], speakingExercises: [], interactiveGames: [] },
          { lessonNumber: 2, title: 'Lesson 6.2: Core Kanji Radicals & Stroke Orders', description: 'Recognize building blocks of complex Kanji.', vocabulary: [], grammar: [], speakingExercises: [], interactiveGames: [] },
          { lessonNumber: 3, title: 'Lesson 6.3: Short Stories & Manga Dialogues', description: 'Read authentic conversational passages.', vocabulary: [], grammar: [], speakingExercises: [], interactiveGames: [] }
        ]
      },
      {
        stageNumber: 7,
        title: 'Stage 7 — Real-World Situational Communication',
        subtitle: 'Shopping in convenience stores (Konbini), booking hotels, asking directions, and emergency phrases.',
        focus: 'real_world',
        lessons: [
          { lessonNumber: 1, title: 'Lesson 7.1: The Japanese Train Station Master Journey', description: 'Buying tickets and navigating Shinkansen lines.', vocabulary: [], grammar: [], speakingExercises: [], interactiveGames: [] },
          { lessonNumber: 2, title: 'Lesson 7.2: Hotel Booking & Dining Etiquette', description: 'Check-in and table manners in traditional Ryokan.', vocabulary: [], grammar: [], speakingExercises: [], interactiveGames: [] },
          { lessonNumber: 3, title: 'Lesson 7.3: Emergencies, Medical Visits & Pharmacy Phrases', description: 'Communicate symptoms and urgent needs clearly.', vocabulary: [], grammar: [], speakingExercises: [], interactiveGames: [] }
        ]
      },
      {
        stageNumber: 8,
        title: 'Stage 8 — Advanced Japanese & Natural Fluency',
        subtitle: 'Complex reasoning, expressing opinions (to omoimasu), Keigo business basics, and native dialogue partner practice.',
        focus: 'advanced',
        lessons: [
          { lessonNumber: 1, title: 'Lesson 8.1: Expressing Opinions & Cultural Discussions', description: 'Speak fluently about books, technology, and philosophy.', vocabulary: [], grammar: [], speakingExercises: [], interactiveGames: [] },
          { lessonNumber: 2, title: 'Lesson 8.2: Keigo (Sonkeigo & Kenjougo) Honorific Foundations', description: 'Polite language for professional and formal encounters.', vocabulary: [], grammar: [], speakingExercises: [], interactiveGames: [] },
          { lessonNumber: 3, title: 'Lesson 8.3: Open Conversational Dialogue with AI Native Partner', description: 'Spontaneous open dialogue on any topic without hesitation.', vocabulary: [], grammar: [], speakingExercises: [], interactiveGames: [] }
        ]
      }
    ];
  }

  // DEFAULT 8-STAGE BLUEPRINT (ENGLISH, TELUGU, HINDI, FRENCH, GERMAN, SPANISH)
  const langMeta = getLanguageMeta(code);

  const stageTitles = [
    { title: 'Stage 1 — Beginner Foundations', subtitle: `Alphabet, core sounds, first greetings and pronunciation in ${langMeta.name}.`, focus: 'alphabet' },
    { title: 'Stage 2 — Vocabulary Development', subtitle: 'Family, school, food, numbers, colours, and everyday activities.', focus: 'vocabulary' },
    { title: 'Stage 3 — Sentence Formation', subtitle: 'Word order, question & answer patterns, and common expressions.', focus: 'sentence_formation' },
    { title: 'Stage 4 — Core Grammar', subtitle: `Tenses, verbs, agreement rules, and structural syntax in ${langMeta.name}.`, focus: 'grammar' },
    { title: 'Stage 5 — Listening & Speaking Mastery', subtitle: 'Repeat after native audio, accent training, and spontaneous spoken answers.', focus: 'speaking_listening' },
    { title: 'Stage 6 — Reading & Writing', subtitle: 'Reading comprehension passages, spelling challenges, and essay construction.', focus: 'reading_writing' },
    { title: 'Stage 7 — Real-World Situational Communication', subtitle: 'Travel, shopping, school, dining, interviews, and directions.', focus: 'real_world' },
    { title: 'Stage 8 — Advanced Fluency & Conversation', subtitle: 'Debates, advanced expressions, idioms, and fluent AI conversation partner.', focus: 'advanced' }
  ];

  return stageTitles.map((st, sIdx) => {
    const sNum = sIdx + 1;
    return {
      stageNumber: sNum,
      title: st.title,
      subtitle: st.subtitle,
      focus: st.focus,
      lessons: [
        {
          lessonNumber: 1,
          title: `Lesson ${sNum}.1: Foundations of ${st.focus.replace(/_/g, ' ').toUpperCase()}`,
          description: `Master high-yield practical skills for ${st.title} in ${langMeta.name}.`,
          vocabulary: generateSampleVocabForLanguage(code, sNum),
          grammar: generateSampleGrammarForLanguage(code, sNum),
          speakingExercises: generateSampleSpeakingExercises(code, sNum),
          interactiveGames: generateSampleGames(code, sNum)
        },
        {
          lessonNumber: 2,
          title: `Lesson ${sNum}.2: Guided Practice & Pronunciation`,
          description: `Deepen vocabulary retention and spoken fluency in ${langMeta.name}.`,
          vocabulary: [],
          grammar: [],
          speakingExercises: [],
          interactiveGames: []
        },
        {
          lessonNumber: 3,
          title: `Lesson ${sNum}.3: Real-World Mastery Challenge`,
          description: `Apply your knowledge to unlock the next progressive milestone.`,
          vocabulary: [],
          grammar: [],
          speakingExercises: [],
          interactiveGames: []
        }
      ]
    };
  });
}

// 3. SAMPLE VOCABULARY GENERATOR FOR SUPPORT LANGUAGES
function generateSampleVocabForLanguage(targetLang: string, stage: number): VocabularyItem[] {
  if (targetLang === 'en') {
    return [
      {
        id: 'en-1',
        term: 'Confident',
        partOfSpeech: 'Adjective',
        targetSentence: 'She spoke with a confident voice during the school debate.',
        translations: {
          te: { meaning: 'ఆత్మవిశ్వాసం కల / ధైర్యవంతమైన', sentenceTranslation: 'పాఠశాల డిబేట్‌లో ఆమె ఆత్మవిశ్వాసంతో మాట్లాడింది.', grammarNote: 'విశేషణం (Adjective) - వ్యక్తి నమ్మకాన్ని సూచిస్తుంది.' },
          hi: { meaning: 'आत्मविश्वासी / भरोसा रखने वाला', sentenceTranslation: 'स्कूल वाद-विवाद प्रतियोगिता में वह आत्मविश्वास से बोली।', grammarNote: 'विशेषण - व्यक्ति के आत्मबल को दर्शाता है।' },
          en: { meaning: 'Feeling or showing certainty about something', sentenceTranslation: 'She spoke with a confident voice during the school debate.' }
        },
        audioPronunciationText: 'Confident'
      },
      {
        id: 'en-2',
        term: 'Persevere',
        partOfSpeech: 'Verb',
        targetSentence: 'Great scientists persevere through difficult experiments.',
        translations: {
          te: { meaning: 'పట్టుదలతో కొనసాగించు / ఓపికతో శ్రమించు', sentenceTranslation: 'గొప్ప శాస్త్రవేత్తలు కష్టమైన ప్రయోగాలలోనూ పట్టుదలతో శ్రమిస్తారు.' },
          hi: { meaning: 'दृढ़ रहना / कठिन समय में भी लगे रहना', sentenceTranslation: 'महान वैज्ञानिक कठिन प्रयोगों में भी दृढ़ता से लगे रहते हैं।' },
          en: { meaning: 'Continue in a course of action even in the face of difficulty', sentenceTranslation: 'Great scientists persevere through difficult experiments.' }
        },
        audioPronunciationText: 'Persevere'
      }
    ];
  }

  if (targetLang === 'fr') {
    return [
      {
        id: 'fr-1',
        term: 'Bonjour',
        partOfSpeech: 'Greeting',
        targetSentence: 'Bonjour, comment allez-vous aujourd’hui ?',
        translations: {
          en: { meaning: 'Hello / Good morning', sentenceTranslation: 'Hello, how are you doing today?' },
          te: { meaning: 'నమస్కారం / శుభోదయం', sentenceTranslation: 'నమస్కారం, ఈ రోజు మీరు ఎలా ఉన్నారు?' },
          hi: { meaning: 'नमस्ते / शुभ प्रभात', sentenceTranslation: 'नमस्ते, आज आप कैसे हैं?' }
        },
        audioPronunciationText: 'Bonjour'
      },
      {
        id: 'fr-2',
        term: 'Merci beaucoup',
        partOfSpeech: 'Expression',
        targetSentence: 'Merci beaucoup pour votre aide précieuse.',
        translations: {
          en: { meaning: 'Thank you very much', sentenceTranslation: 'Thank you very much for your valuable help.' },
          te: { meaning: 'చాలా ధన్యవాదాలు', sentenceTranslation: 'మీ విలువైన సహాయానికి చాలా ధన్యవాదాలు.' },
          hi: { meaning: 'बहुत बहुत धन्यवाद', sentenceTranslation: 'आपकी बहुमूल्य सहायता के लिए बहुत-बहुत धन्यवाद।' }
        },
        audioPronunciationText: 'Merci beaucoup'
      }
    ];
  }

  if (targetLang === 'de') {
    return [
      {
        id: 'de-1',
        term: 'Guten Tag',
        partOfSpeech: 'Greeting',
        targetSentence: 'Guten Tag! Wie geht es Ihnen?',
        translations: {
          en: { meaning: 'Good day / Hello', sentenceTranslation: 'Good day! How are you doing?' },
          te: { meaning: 'నమస్కారం / శుభదినం', sentenceTranslation: 'నమస్కారం! మీరు ఎలా ఉన్నారు?' },
          hi: { meaning: 'शुभ दिन / नमस्ते', sentenceTranslation: 'शुभ दिन! आप कैसे हैं?' }
        },
        audioPronunciationText: 'Guten Tag'
      }
    ];
  }

  if (targetLang === 'te') {
    return [
      {
        id: 'te-1',
        term: 'నమస్కారం',
        romanization: 'Namaskāram',
        partOfSpeech: 'Greeting',
        targetSentence: 'అందరికీ నా హృదయపూర్వక నమస్కారాలు.',
        translations: {
          en: { meaning: 'Respectful Greetings / Hello', sentenceTranslation: 'My heartfelt greetings to everyone.' },
          hi: { meaning: 'सादर नमस्कार / प्रणाम', sentenceTranslation: 'सभी को मेरा हार्दिक नमस्कार।' },
          te: { meaning: 'వందనం / ప్రణామం', sentenceTranslation: 'అందరికీ నా హృదయపూర్వక నమస్కారాలు.' }
        },
        audioPronunciationText: 'నమస్కారం'
      }
    ];
  }

  if (targetLang === 'hi') {
    return [
      {
        id: 'hi-1',
        term: 'नमस्ते',
        romanization: 'Namaste',
        partOfSpeech: 'Greeting',
        targetSentence: 'नमस्ते, आप कैसे हैं?',
        translations: {
          en: { meaning: 'Hello / Greetings', sentenceTranslation: 'Hello, how are you?' },
          te: { meaning: 'నమస్కారం', sentenceTranslation: 'నమస్కారం, మీరు ఎలా ఉన్నారు?' },
          hi: { meaning: 'अभिवादन / प्रणाम', sentenceTranslation: 'नमस्ते, आप कैसे हैं?' }
        },
        audioPronunciationText: 'नमस्ते'
      }
    ];
  }

  // Fallback
  return [
    {
      id: `${targetLang}-sample-1`,
      term: 'Hola',
      partOfSpeech: 'Greeting',
      targetSentence: '¡Hola! ¿Cómo estás hoy?',
      translations: {
        en: { meaning: 'Hello', sentenceTranslation: 'Hello! How are you today?' },
        te: { meaning: 'నమస్కారం', sentenceTranslation: 'నమస్కారం! ఈరోజు మీరు ఎలా ఉన్నారు?' },
        hi: { meaning: 'नमस्ते', sentenceTranslation: 'नमस्ते! आज आप कैसे हैं?' }
      },
      audioPronunciationText: 'Hola'
    }
  ];
}

function generateSampleGrammarForLanguage(targetLang: string, stage: number): GrammarConcept[] {
  if (targetLang === 'en') {
    return [
      {
        id: 'en-g1',
        title: 'Subject-Verb Agreement in Simple Present',
        ruleSummary: 'Singular third-person subjects (he, she, it) take verb + s/es. Plural subjects take base verb.',
        structureFormula: 'Subject + Verb(+s/es) + Object',
        examples: [
          { target: 'She reads a book every day.', translations: { te: 'ఆమె ప్రతిరోజూ పుస్తకం చదువుతుంది.', hi: 'वह हर दिन एक किताब पढ़ती है।' } },
          { target: 'They read books together.', translations: { te: 'వారు కలిసి పుస్తకాలు చదువుతారు.', hi: 'वे एक साथ किताबें पढ़ते हैं।' } }
        ],
        explanationsBySupportLang: {
          te: 'హీ (He), షీ (She), ఇట్ (It) ల తర్వాత వచ్చే క్రియకు "s" లేదా "es" చేర్చాలి. మిగిలిన వాటికి క్రియ సాధారణ రూపంలో ఉంటుంది.',
          hi: 'थर्ड पर्सन एकवचन (he, she, it) के साथ क्रिया में s/es जोड़ा जाता है, जबकि बहुवचन के साथ मूल क्रिया आती है।',
          en: 'Singular third person requires adding "s" or "es" to the base verb (e.g. He runs vs. They run).'
        },
        commonMistakesBySupportLang: {
          te: '"She go to school" అని చెప్పకూడదు; "She goes to school" అని చెప్పాలి.',
          hi: '"She go to school" गलत है; "She goes to school" सही है।',
          en: 'Never say "She walk"; always say "She walks".'
        }
      }
    ];
  }

  return [
    {
      id: `${targetLang}-g1`,
      title: 'Word Order & Polite Registers',
      ruleSummary: 'Sentence structure and respectful communication in everyday dialogues.',
      structureFormula: 'Subject + Object + Verb',
      examples: [{ target: 'Example Sentence', translations: { en: 'Example sentence.', te: 'ఉదాహరణ వాక్యం.', hi: 'उदाहरण वाक्य।' } }],
      explanationsBySupportLang: {
        en: 'Learn the primary sentence order and polite markers.',
        te: 'ముఖ్యమైన వాక్య నిర్మాణం మరియు మర్యాదపూర్వక పదాలను నేర్చుకోండి.',
        hi: 'प्रमुख वाक्य विन्यास और विनम्र शब्दों को समझें।'
      },
      commonMistakesBySupportLang: {
        en: 'Be mindful of word order differences from English.',
        te: 'ఇంగ్లీష్ మరియు ఈ భాష మధ్య వాక్య నిర్మాణ వ్యత్యాసాన్ని గమనించండి.',
        hi: 'वाक्य रचना के अंतर को ध्यान में रखें।'
      }
    }
  ];
}

function generateSampleSpeakingExercises(targetLang: string, stage: number): SpeakingExercise[] {
  const meta = getLanguageMeta(targetLang);
  const samplePhrase = targetLang === 'fr' ? 'Bonjour, comment allez-vous ?' : targetLang === 'de' ? 'Guten Morgen, wie geht es Ihnen?' : targetLang === 'ja' ? 'こんにちは' : targetLang === 'te' ? 'నమస్కారం, బాగున్నారా?' : targetLang === 'hi' ? 'नमस्ते, आप कैसे हैं?' : 'Hello, it is wonderful to meet you.';

  return [
    {
      id: `${targetLang}-spe-1`,
      type: 'listen_repeat',
      promptTitle: `Listen and repeat in ${meta.name}`,
      targetPhrase: samplePhrase,
      phoneticGuide: samplePhrase,
      audioText: samplePhrase,
      acceptableVariations: [samplePhrase],
      supportExplanations: {
        en: { meaning: 'Listen carefully to the native rhythm and repeat clearly.', instructions: 'Click the mic and speak.', tips: 'Keep calm and enunciate every syllable.' },
        te: { meaning: 'ఉచ్చారణను జాగ్రత్తగా విని తిరిగి పలకండి.', instructions: 'మైక్ నొక్కి స్పష్టంగా మాట్లాడండి.', tips: 'ప్రతి అక్షరాన్ని స్పష్టంగా పలకండి.' },
        hi: { meaning: 'उच्चारण को ध्यान से सुनें और दोहराएँ।', instructions: 'माइक दबाकर स्पष्ट बोलें।', tips: 'हर अक्षर का उच्चारण साफ रखें।' }
      }
    }
  ];
}

function generateSampleGames(targetLang: string, stage: number): InteractiveGameItem[] {
  return [
    {
      id: `${targetLang}-game-1`,
      gameType: 'word_match',
      prompt: `Match the ${getLanguageMeta(targetLang).name} word with its correct meaning`,
      questionTarget: targetLang === 'ja' ? 'ありがとう' : targetLang === 'fr' ? 'Merci' : targetLang === 'de' ? 'Danke' : targetLang === 'te' ? 'ధన్యవాదాలు' : targetLang === 'hi' ? 'धन्यवाद' : 'Gratitude',
      correctAnswer: 'Thank you',
      options: ['Thank you', 'Goodbye', 'Please', 'Good morning'],
      supportTranslation: 'Thank you'
    }
  ];
}

// 4. SPEAKING EVALUATION ALGORITHM (Honest, supportive phonetic feedback)
export function evaluateStudentPronunciation(params: {
  targetPhrase: string;
  recognizedUtterance: string;
  targetLanguage: string;
  supportLanguage: string;
}): {
  accuracyScore: number; // 0 to 100
  isExactMatch: boolean;
  similarityRatio: number;
  feedbackCategory: 'excellent' | 'good' | 'needs_practice';
  detailedFeedback: string;
  supportLanguageExplanation: string;
  matchedWordsCount: number;
  totalWordsCount: number;
} {
  const cleanTarget = params.targetPhrase.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, '');
  const cleanSpoken = params.recognizedUtterance.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, '');

  if (!cleanSpoken) {
    return {
      accuracyScore: 0,
      isExactMatch: false,
      similarityRatio: 0,
      feedbackCategory: 'needs_practice',
      detailedFeedback: 'No speech was detected. Please ensure your microphone is enabled and speak clearly.',
      supportLanguageExplanation: params.supportLanguage === 'te'
        ? 'ఏ విధమైన శబ్దం గుర్తించబడలేదు. దయచేసి మైక్ ఆన్ చేసి స్పష్టంగా మాట్లాడండి.'
        : params.supportLanguage === 'hi'
        ? 'कोई आवाज़ सुनाई नहीं दी। कृपया माइक चालू करके स्पष्ट बोलें।'
        : 'No speech was detected. Please verify your microphone and speak clearly.',
      matchedWordsCount: 0,
      totalWordsCount: cleanTarget.split(/\s+/).length
    };
  }

  // Exact match
  if (cleanTarget === cleanSpoken) {
    return {
      accuracyScore: 100,
      isExactMatch: true,
      similarityRatio: 100,
      feedbackCategory: 'excellent',
      detailedFeedback: 'Superb pronunciation! Clear rhythm, accurate phonetics, and natural pacing.',
      supportLanguageExplanation: params.supportLanguage === 'te'
        ? 'అద్భుతమైన ఉచ్చారణ! ప్రతి పదం చాలా స్పష్టంగా, సహజమైన లయతో పలికారు.'
        : params.supportLanguage === 'hi'
        ? 'उत्कृष्ट उच्चारण! आपने हर शब्द बहुत स्पष्ट और सहजता से बोला।'
        : 'Superb pronunciation! Every word was clear, accurate, and natural.',
      matchedWordsCount: cleanTarget.split(/\s+/).length,
      totalWordsCount: cleanTarget.split(/\s+/).length
    };
  }

  // Word-level token match & Levenshtein metric
  const targetWords = cleanTarget.split(/\s+/).filter(Boolean);
  const spokenWords = cleanSpoken.split(/\s+/).filter(Boolean);

  let matchedWords = 0;
  for (const tw of targetWords) {
    if (spokenWords.includes(tw)) {
      matchedWords++;
    } else {
      // Fuzzy match
      const hasClose = spokenWords.some((sw) => {
        const dist = levenshteinDistance(tw, sw);
        return dist <= Math.max(1, Math.floor(tw.length * 0.35));
      });
      if (hasClose) matchedWords += 0.7;
    }
  }

  const wordRatio = Math.min(1, matchedWords / Math.max(1, targetWords.length));
  const rawScore = Math.round(wordRatio * 100);
  const score = Math.max(25, Math.min(95, rawScore));

  let cat: 'excellent' | 'good' | 'needs_practice' = 'good';
  let detailedFeedback = `Good effort! You captured ${Math.round(wordRatio * 100)}% of the target phrase.`;

  if (score >= 85) {
    cat = 'excellent';
    detailedFeedback = 'Excellent articulation! Your words are easily understandable by native speakers.';
  } else if (score < 60) {
    cat = 'needs_practice';
    detailedFeedback = `You said: "${params.recognizedUtterance}". Try repeating slowly, paying attention to the syllable rhythm.`;
  }

  let supportExp = '';
  if (params.supportLanguage === 'te') {
    supportExp = score >= 85
      ? 'చాలా బాగా పలికారు! మీ మాటలు చాలా స్పష్టంగా అర్థమవుతున్నాయి.'
      : score >= 60
      ? `మంచి ప్రయత్నం! మీరు దాదాపు సరిగ్గా పలికారు. మీరు పలికింది: "${params.recognizedUtterance}". మళ్ళీ ఒకసారి ప్రయత్నించండి.`
      : `కాస్త మెరుగుపడాలి. మీరు పలికింది: "${params.recognizedUtterance}". లక్ష్య వాక్యాన్ని నిదానంగా విని మళ్ళీ పలకండి.`;
  } else if (params.supportLanguage === 'hi') {
    supportExp = score >= 85
      ? 'बहुत अच्छा उच्चारण! आपकी आवाज़ साफ़ और प्रभावशाली है।'
      : score >= 60
      ? `अच्छा प्रयास! आपने बोला: "${params.recognizedUtterance}"। एक बार फिर ध्यान से सुनकर बोलें।`
      : `थोड़ा और अभ्यास करें। आपने बोला: "${params.recognizedUtterance}"। शब्दों को धीरे-धीरे दोहराएँ।`;
  } else {
    supportExp = detailedFeedback;
  }

  return {
    accuracyScore: score,
    isExactMatch: false,
    similarityRatio: Math.round(wordRatio * 100),
    feedbackCategory: cat,
    detailedFeedback,
    supportLanguageExplanation: supportExp,
    matchedWordsCount: Math.round(matchedWords),
    totalWordsCount: targetWords.length
  };
}

function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

// 5. PLACEMENT TEST DIAGNOSTIC EVALUATION
export function evaluatePlacementTest(answers: Array<{ questionId: string; selectedOption: string; isCorrect: boolean }>): {
  recommendedStage: number;
  recommendedLevel: string;
  scorePercentage: number;
  diagnosticSummary: string;
} {
  const total = answers.length || 1;
  const correct = answers.filter((a) => a.isCorrect).length;
  const pct = Math.round((correct / total) * 100);

  let stage = 1;
  let level = 'Beginner (Stage 1)';
  let summary = 'Start with Stage 1 foundations to build rock-solid vocabulary, spelling, and pronunciation.';

  if (pct >= 80) {
    stage = 5;
    level = 'Intermediate (Stage 5)';
    summary = 'Great diagnostic performance! You qualify directly for Stage 5 Listening & Active Speaking practice.';
  } else if (pct >= 50) {
    stage = 3;
    level = 'Elementary (Stage 3)';
    summary = 'Good baseline! We recommend starting at Stage 3 Sentence Formation to accelerate your conversational fluency.';
  }

  return {
    recommendedStage: stage,
    recommendedLevel: level,
    scorePercentage: pct,
    diagnosticSummary: summary
  };
}
