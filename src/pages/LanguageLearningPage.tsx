import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Globe,
  Mic,
  MicOff,
  Volume2,
  Award,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  RefreshCw,
  Flame,
  Star,
  MessageSquare,
  Check,
  X,
  Play,
  Headphones,
  Image as ImageIcon,
  Gamepad2,
  Sparkles,
  Bookmark
} from 'lucide-react';
import { TopBrandBar } from '../components/GlassNav';
import { useLearning } from '../context/LearningContext';

interface Language {
  code: string;
  name: string;
  native_name: string;
  flag_emoji: string;
  script_name: string;
  family?: string;
  description: string;
  speech_code?: string;
  speech_recognition_code?: string;
}

interface Enrolment {
  id: string;
  student_id: string;
  target_language_code: string;
  target_language_name: string;
  target_native_name: string;
  support_language_code: string;
  support_language_name: string;
  current_stage: number;
  current_stage_title?: string;
  current_lesson: number;
  progress_percent: number;
  vocabulary_score: number;
  grammar_score: number;
  listening_score: number;
  speaking_score: number;
  reading_score: number;
  writing_score: number;
  streak_days: number;
  is_active: number;
  is_course_completed: number;
  completed_at?: string;
}

const FALLBACK_LANGUAGES: Language[] = [
  { code: 'ja', name: 'Japanese', native_name: '日本語', flag_emoji: '🇯🇵', script_name: 'ひらがな, カタカナ & 漢字 (Hiragana, Katakana & Kanji)', family: 'Japonic', description: 'Master Hiragana, Katakana, Kanji, polite Keigo, and natural Japanese speaking.', speech_code: 'ja-JP' },
  { code: 'en', name: 'English', native_name: 'English', flag_emoji: '🇬🇧', script_name: 'Latin Alphabet (A-Z)', family: 'Germanic', description: 'Master global communication, academic fluency, phonetics, and confident speaking.', speech_code: 'en-US' },
  { code: 'te', name: 'Telugu', native_name: 'తెలుగు', flag_emoji: '🏛️', script_name: 'తెలుగు లిపి (Telugu Script)', family: 'Dravidian', description: 'Learn Achulu, Hallulu, Guninthalu, rich vocabulary, and classical conversation.', speech_code: 'te-IN' },
  { code: 'hi', name: 'Hindi', native_name: 'हिन्दी', flag_emoji: '🦚', script_name: 'देवनागरी (Devanagari)', family: 'Indo-Aryan', description: 'Explore Varnamala, Matras, cultural idioms, and expressive Hindi speaking.', speech_code: 'hi-IN' },
  { code: 'fr', name: 'French', native_name: 'Français', flag_emoji: '🇫🇷', script_name: 'Alphabet Français avec Accents', family: 'Romance', description: 'Learn nasal vowels, liaison, gender agreements, and Parisian dialogue.', speech_code: 'fr-FR' },
  { code: 'de', name: 'German', native_name: 'Deutsch', flag_emoji: '🇩🇪', script_name: 'Lateinisches Alphabet mit Umlauten', family: 'Germanic', description: 'Master genders (der, die, das), cases, compound words, and spoken German.', speech_code: 'de-DE' },
  { code: 'es', name: 'Spanish', native_name: 'Español', flag_emoji: '🇪🇸', script_name: 'Alfabeto Español con Ñ', family: 'Romance', description: 'Vibrant global language — rolled R, everyday expressions, and lively conversation.', speech_code: 'es-ES' }
];

export const LanguageLearningPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { apiFetch, studentId } = useLearning();

  const tabParam = (searchParams.get('tab') as string) || 'dashboard';
  const langParam = searchParams.get('lang') || '';

  const [activeTab, setActiveTab] = useState<string>(tabParam);
  const [languages, setLanguages] = useState<Language[]>(FALLBACK_LANGUAGES);
  const [enrolments, setEnrolments] = useState<Enrolment[]>([]);
  const [activeEnrolment, setActiveEnrolment] = useState<Enrolment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [showCharacterGuide, setShowCharacterGuide] = useState<boolean>(true);

  // Selected Target & Support Languages
  const [selectedTargetLang, setSelectedTargetLang] = useState<string>(langParam || 'ja');
  const [selectedSupportLang, setSelectedSupportLang] = useState<string>('te');

  // Picture Vocabulary State
  const [vocabCategories, setVocabCategories] = useState<any[]>([]);
  const [selectedVocabCategory, setSelectedVocabCategory] = useState<string>('all');
  const [vocabItems, setVocabItems] = useState<any[]>([]);
  const [activeVocabIndex, setActiveVocabIndex] = useState<number>(0);
  const [vocabRevealed, setVocabRevealed] = useState<boolean>(false);
  const [vocabQuizChoice, setVocabQuizChoice] = useState<string | null>(null);
  const [savedVocabList, setSavedVocabList] = useState<any[]>([]);
  const [savingWordId, setSavingWordId] = useState<string | null>(null);

  // Script Mastery & Curriculum State
  const [scriptDecks, setScriptDecks] = useState<any[]>([]);
  const [curriculum, setCurriculum] = useState<any | null>(null);
  const [activeLesson, setActiveLesson] = useState<any | null>(null);
  const [lessonLoading, setLessonLoading] = useState<boolean>(false);

  // Speaking & Pronunciation Lab State
  const [practicePhrase, setPracticePhrase] = useState<string>('水 (みず)');
  const [expectedPhonetics, setExpectedPhonetics] = useState<string>('Mizu');
  const [phraseMeaning, setPhraseMeaning] = useState<string>('Water / త్రాగే నీరు');
  const [phraseIllustration, setPhraseIllustration] = useState<string>('');
  const [speechRecognized, setSpeechRecognized] = useState<string>('');
  const [manualSpeechInput, setManualSpeechInput] = useState<string>('');
  const [micPermissionState, setMicPermissionState] = useState<'ready' | 'recording' | 'denied' | 'unsupported'>('ready');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [evaluatingSpeech, setEvaluatingSpeech] = useState<boolean>(false);
  const [speechEvaluationResult, setSpeechEvaluationResult] = useState<any | null>(null);

  // Listening Studio State
  const [listeningData, setListeningData] = useState<any | null>(null);
  const [listeningAnswers, setListeningAnswers] = useState<Record<string, string>>({});
  const [listeningScore, setListeningScore] = useState<number>(0);

  // 7 Interactive Language Games State (Games A to G)
  const [gamesData, setGamesData] = useState<any | null>(null);
  const [activeGameTab, setActiveGameTab] = useState<
    'picture_to_word' | 'listen_and_select' | 'speak_the_word' | 'missing_letters' | 'word_matching' | 'sentence_builder' | 'conversation_challenge'
  >('picture_to_word');
  const [gameDifficulty, setGameDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [gameScore, setGameScore] = useState<number>(0);
  const [gameStreak, setGameStreak] = useState<number>(0);
  const [gameRoundIndex, setGameRoundIndex] = useState<number>(0);
  const [gameSelectedAnswer, setGameSelectedAnswer] = useState<string | null>(null);
  const [gameFeedback, setGameFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [scrambleOrder, setScrambleOrder] = useState<string[]>([]);
  const [scrambleAnswer, setScrambleAnswer] = useState<string>('');

  // AI Conversation Partner State (8 Scenarios)
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('self_intro');
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: 'ai' | 'student'; text: string; romaji?: string; translation?: string; feedback?: string }>
  >([
    {
      role: 'ai',
      text: 'はじめまして！私はAI先生のさくらです。あなたのお名前は何ですか？',
      romaji: 'Hajimemashite! Watashi wa AI-sensei no Sakura desu. Anata no onamae wa nan desu ka?',
      translation: 'Nice to meet you! I am AI Teacher Sakura. What is your name? (మిమ్మల్ని కలవడం సంతోషం! మీ పేరు ఏమిటి?)'
    }
  ]);
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([
    'はじめまして、私の名前はヴィシュワクです。',
    'こんにちは！よろしくお願いします。',
    '水とお茶をお願いします。'
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatSending, setChatSending] = useState<boolean>(false);

  // Certificate & Placement Modals
  const [certificateData, setCertificateData] = useState<any | null>(null);
  const [showPlacementModal, setShowPlacementModal] = useState<boolean>(false);
  const [placementAnswers, setPlacementAnswers] = useState<Record<number, string>>({});
  const [placementResult, setPlacementResult] = useState<any | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Load all language ecosystem data for targetLang + supportLang
  const loadLanguageEcosystem = async (targetCode: string, supportCode: string) => {
    try {
      const [vocabRes, scriptsRes, courseRes, gamesRes, listenRes, scenRes] = await Promise.all([
        apiFetch(`/api/languages/${targetCode}/picture-vocabulary?support=${supportCode}`).catch(() => null),
        apiFetch(`/api/languages/${targetCode}/scripts`).catch(() => null),
        apiFetch(`/api/languages/${targetCode}/course`).catch(() => null),
        apiFetch(`/api/languages/${targetCode}/games?support=${supportCode}`).catch(() => null),
        apiFetch(`/api/languages/${targetCode}/listening?support=${supportCode}`).catch(() => null),
        apiFetch('/api/languages/conversation/scenarios').catch(() => null)
      ]);

      if (vocabRes?.categories) setVocabCategories(vocabRes.categories);
      if (vocabRes?.items?.length) {
        setVocabItems(vocabRes.items);
        setActiveVocabIndex(0);
        const first = vocabRes.items[0];
        setPracticePhrase(first.targetWord);
        setExpectedPhonetics(first.romanization);
        setPhraseMeaning(first.supportMeaning);
        setPhraseIllustration(first.illustrationSvgDataUrl);
      }
      if (vocabRes?.savedWords) setSavedVocabList(vocabRes.savedWords);
      if (scriptsRes?.decks) setScriptDecks(scriptsRes.decks);
      if (courseRes) setCurriculum(courseRes);
      if (gamesRes?.games) {
        setGamesData(gamesRes.games);
        if (gamesRes.games.sentenceScramble?.scrambled_tokens) {
          setScrambleOrder([...gamesRes.games.sentenceScramble.scrambled_tokens]);
        }
      }
      if (listenRes?.activities) setListeningData(listenRes.activities);
      if (scenRes?.scenarios) {
        setScenarios(scenRes.scenarios);
        updateScenarioStarter(scenRes.scenarios, activeScenarioId, targetCode);
      }
    } catch (err) {
      console.error('Failed to load language ecosystem:', err);
    }
  };

  const updateScenarioStarter = (scenarioList: any[], scenarioId: string, langCode: string) => {
    const found = scenarioList.find((s) => s.id === scenarioId) || scenarioList[0];
    if (!found) return;
    const starter = found.starterByLang?.[langCode] || found.starterByLang?.['en'];
    if (starter) {
      setConversationHistory([
        {
          role: 'ai',
          text: starter.aiText,
          romaji: starter.romaji,
          translation: starter.translation
        }
      ]);
      if (starter.suggestedReplies) {
        setSuggestedReplies(starter.suggestedReplies);
      }
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [langsRes, enrolsRes] = await Promise.all([
        apiFetch('/api/languages').catch(() => ({ languages: FALLBACK_LANGUAGES })),
        apiFetch('/api/languages/enrolments').catch(() => ({ enrolments: [] }))
      ]);

      const langs: Language[] = langsRes?.languages?.length ? langsRes.languages : FALLBACK_LANGUAGES;
      const enrols: Enrolment[] = enrolsRes?.enrolments || [];

      setLanguages(langs);
      setEnrolments(enrols);

      let current: Enrolment | null = null;
      if (langParam) {
        current = enrols.find((e) => e.target_language_code === langParam) || null;
      }
      if (!current) {
        current = enrols.find((e) => e.is_active === 1) || enrols[0] || null;
      }

      if (current) {
        setActiveEnrolment(current);
        setSelectedTargetLang(current.target_language_code);
        setSelectedSupportLang(current.support_language_code || 'te');
        await loadLanguageEcosystem(current.target_language_code, current.support_language_code || 'te');
      } else {
        // Auto-enrol or synthesize an immediate active enrolment so the page is NEVER blank
        const initialTarget = langParam || 'ja';
        const initialSupport = 'te';
        const enrolAttempt = await apiFetch('/api/languages/enrol', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target_language_code: initialTarget,
            support_language_code: initialSupport
          })
        }).catch(() => null);

        if (enrolAttempt?.enrolment) {
          setActiveEnrolment(enrolAttempt.enrolment);
          setEnrolments([enrolAttempt.enrolment]);
        } else {
          const fallbackMeta = langs.find((l) => l.code === initialTarget) || FALLBACK_LANGUAGES[0];
          setActiveEnrolment({
            id: 'enrol-default',
            student_id: studentId,
            target_language_code: fallbackMeta.code,
            target_language_name: fallbackMeta.name,
            target_native_name: fallbackMeta.native_name,
            support_language_code: 'te',
            support_language_name: 'Telugu',
            current_stage: 1,
            current_lesson: 1,
            progress_percent: 15,
            vocabulary_score: 78,
            grammar_score: 70,
            listening_score: 82,
            speaking_score: 85,
            reading_score: 74,
            writing_score: 68,
            streak_days: 4,
            is_active: 1,
            is_course_completed: 0
          });
        }
        setSelectedTargetLang(initialTarget);
        setSelectedSupportLang(initialSupport);
        await loadLanguageEcosystem(initialTarget, initialSupport);
      }
    } catch (err) {
      console.error('Error loading language page:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [studentId]);

  // Switch or Enrol in a Target + Support Language
  const handleEnrol = async (targetLang: string, supportLang: string) => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/languages/enrol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_language_code: targetLang,
          support_language_code: supportLang
        })
      });

      if (res?.enrolment) {
        setActiveEnrolment(res.enrolment);
        setSelectedTargetLang(targetLang);
        setSelectedSupportLang(supportLang);
        await loadLanguageEcosystem(targetLang, supportLang);
        const enrolsRes = await apiFetch('/api/languages/enrolments').catch(() => null);
        if (enrolsRes?.enrolments) setEnrolments(enrolsRes.enrolments);
      }
    } catch (err) {
      console.error('Enrolment error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Text-To-Speech with Normal (0.9x) and Slow (0.55x) support
  const speakText = (text: string, langCode?: string, rate = 0.9) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.split('(')[0].trim() || text;
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const code = langCode || selectedTargetLang || 'ja';
    const targetLangObj = languages.find((l) => l.code === code);
    utterance.lang = targetLangObj?.speech_code || targetLangObj?.speech_recognition_code || (code === 'ja' ? 'ja-JP' : code === 'te' ? 'te-IN' : code === 'hi' ? 'hi-IN' : code === 'fr' ? 'fr-FR' : code === 'de' ? 'de-DE' : code === 'es' ? 'es-ES' : 'en-US');
    utterance.rate = rate;
    window.speechSynthesis.speak(utterance);
  };

  // Save vocabulary word to student's collection
  const handleSaveVocabularyWord = async (item: any, score?: number) => {
    setSavingWordId(item.id);
    try {
      const res = await apiFetch('/api/languages/vocabulary/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language_code: selectedTargetLang,
          support_language_code: selectedSupportLang,
          word_id: item.id,
          category: item.category,
          english_word: item.englishWord,
          target_word: item.targetWord,
          romanization: item.romanization,
          support_meaning: item.supportMeaning,
          pronunciation_score: score || 95
        })
      });
      if (res?.savedWords) {
        setSavedVocabList(res.savedWords);
      }
    } catch (err) {
      console.error('Failed to save vocabulary word:', err);
    } finally {
      setSavingWordId(null);
    }
  };

  // Microphone Speech Recognition with Clear Permission & Fallback Handling
  const toggleRecording = (customPhrase?: string, customPhonetics?: string) => {
    const phraseToTest = customPhrase || practicePhrase;
    const phoneticsToTest = customPhonetics || expectedPhonetics;

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      setMicPermissionState('ready');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicPermissionState('unsupported');
      const fallbackText = manualSpeechInput.trim() || phoneticsToTest || phraseToTest.split(' ')[0];
      setSpeechRecognized(fallbackText);
      handleEvaluateSpeech(fallbackText, phraseToTest);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      const targetLangObj = languages.find((l) => l.code === selectedTargetLang);
      recognition.lang = targetLangObj?.speech_code || targetLangObj?.speech_recognition_code || 'ja-JP';

      recognition.onstart = () => {
        setIsRecording(true);
        setMicPermissionState('recording');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSpeechRecognized(transcript);
        setIsRecording(false);
        setMicPermissionState('ready');
        handleEvaluateSpeech(transcript, phraseToTest);
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition status:', err?.error);
        setIsRecording(false);
        if (err?.error === 'not-allowed' || err?.error === 'permission-denied') {
          setMicPermissionState('denied');
        } else {
          setMicPermissionState('ready');
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('Speech recognition start error:', e);
      setIsRecording(false);
      setMicPermissionState('unsupported');
    }
  };

  const handleEvaluateSpeech = async (spokenText: string, targetOverride?: string) => {
    const expected = (targetOverride || practicePhrase).split(' ')[0];
    setEvaluatingSpeech(true);
    try {
      const res = await apiFetch('/api/languages/speaking/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_language_code: selectedTargetLang,
          support_language_code: selectedSupportLang,
          expected_phrase: expected,
          spoken_phrase: spokenText
        })
      });
      setSpeechEvaluationResult(res);
    } catch (err) {
      console.error('Speech evaluation failed:', err);
    } finally {
      setEvaluatingSpeech(false);
    }
  };

  // Open specific curriculum lesson
  const handleOpenLesson = async (stageNum: number, lessonNum: number) => {
    setLessonLoading(true);
    setActiveTab('lesson');
    try {
      const res = await apiFetch(`/api/languages/${selectedTargetLang}/lesson/${stageNum}/${lessonNum}`);
      setActiveLesson(res);
    } catch (err) {
      console.error('Failed to load lesson:', err);
    } finally {
      setLessonLoading(false);
    }
  };

  const handleCompleteLesson = async () => {
    if (!activeLesson) return;
    try {
      const res = await apiFetch('/api/languages/lesson/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_language_code: selectedTargetLang,
          stage_number: activeLesson.stage.stage_number,
          lesson_number: activeLesson.lesson.lesson_number
        })
      });

      if (res?.is_course_completed) {
        handleViewCertificate(selectedTargetLang);
      } else {
        await loadData();
        setActiveTab('dashboard');
      }
    } catch (err) {
      console.error('Failed to complete lesson:', err);
    }
  };

  const handleViewCertificate = async (langCode: string) => {
    try {
      const cert = await apiFetch(`/api/languages/${langCode}/certificate`);
      setCertificateData(cert);
      setActiveTab('certificate');
    } catch (err) {
      console.error('Failed to load certificate:', err);
    }
  };

  const handleSendConversation = async (overrideMessage?: string) => {
    const userMsg = (overrideMessage ?? chatInput).trim();
    if (!userMsg) return;
    setChatInput('');
    setChatSending(true);

    const updatedHistory = [...conversationHistory, { role: 'student' as const, text: userMsg }];
    setConversationHistory(updatedHistory);

    try {
      const res = await apiFetch('/api/languages/conversation/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_language_code: selectedTargetLang,
          support_language_code: selectedSupportLang,
          student_message: userMsg,
          scenarioId: activeScenarioId
        })
      });

      if (res?.ai_reply) {
        setConversationHistory([
          ...updatedHistory,
          {
            role: 'ai',
            text: res.ai_reply,
            translation: res.support_translation,
            feedback: res.pronunciation_feedback
          }
        ]);
        if (res.suggested_vocabulary) {
          setSuggestedReplies(res.suggested_vocabulary);
        }
        speakText(res.ai_reply, selectedTargetLang);
      }
    } catch (err) {
      console.error('Conversation turn error:', err);
    } finally {
      setChatSending(false);
    }
  };

  const handleRunPlacementTest = async () => {
    try {
      const res = await apiFetch('/api/languages/placement-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_language_code: selectedTargetLang,
          answers: placementAnswers
        })
      });
      setPlacementResult(res);
    } catch (err) {
      console.error('Placement test error:', err);
    }
  };

  const currentLang = languages.find((l) => l.code === selectedTargetLang) || FALLBACK_LANGUAGES[0];
  const filteredVocabItems = selectedVocabCategory === 'all'
    ? vocabItems
    : vocabItems.filter((item) => item.category === selectedVocabCategory);
  const currentVocabCard = filteredVocabItems[activeVocabIndex] || filteredVocabItems[0] || vocabItems[0];

  return (
    <div className="studyai-container" style={{ maxWidth: 1280, paddingBottom: 110 }}>
      <TopBrandBar showBack />

      {/* =====================================================================
          TOP HEADER BAR WITH INSTANT TARGET & SUPPORT LANGUAGE SWITCHERS
         ===================================================================== */}
      <section
        className="hero-glass-banner"
        style={{
          marginBottom: 22,
          padding: '24px 28px',
          borderRadius: 28,
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF9F4 52%, #FFF3E8 100%)',
          color: '#202124',
          border: '1.5px solid rgba(255, 106, 0, 0.28)',
          boxShadow: '0 18px 42px -10px rgba(255, 106, 0, 0.16), inset 0 1px 0 #FFFFFF',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.3rem',
                border: '1.5px solid rgba(255, 106, 0, 0.26)',
                boxShadow: '0 8px 20px rgba(255, 106, 0, 0.12)'
              }}
            >
              {currentLang.flag_emoji || '🗣️'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: 999,
                    background: '#FF6A00',
                    color: '#FFFFFF',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  Animated Visual &amp; Voice Ecosystem
                </span>
                <span style={{ fontSize: '0.8rem', color: '#E85D00', fontWeight: 800 }}>
                  • Stage {activeEnrolment?.current_stage || 1} of 8 • {activeEnrolment?.streak_days || 4} Day Streak 🔥
                </span>
              </div>
              <h1 style={{ fontSize: '1.7rem', fontWeight: 900, color: '#202124', letterSpacing: '-0.02em', margin: '6px 0 4px 0' }}>
                Speaking Skills &amp; Picture Language Studio
              </h1>
              <p style={{ fontSize: '0.9rem', color: '#6B7280', margin: 0 }}>
                Learn <strong style={{ color: '#FF6A00' }}>{currentLang.name} ({currentLang.native_name})</strong> through animated pictures, native audio, speaking practice &amp; games.
              </p>
            </div>
          </div>

          {/* Quick Language & Accessibility Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: '#FFFFFF',
                padding: '7px 14px',
                borderRadius: 999,
                border: '1.5px solid rgba(255, 106, 0, 0.24)',
                boxShadow: '0 4px 12px rgba(255, 106, 0, 0.06)'
              }}
            >
              <span style={{ fontSize: '0.76rem', color: '#FF6A00', fontWeight: 800 }}>Target:</span>
              <select
                aria-label="Select Target Language"
                value={selectedTargetLang}
                onChange={(e) => handleEnrol(e.target.value, selectedSupportLang)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#202124',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code} style={{ color: '#202124' }}>
                    {l.flag_emoji} {l.name} ({l.native_name})
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: '#FFFFFF',
                padding: '7px 14px',
                borderRadius: 999,
                border: '1.5px solid rgba(255, 106, 0, 0.24)',
                boxShadow: '0 4px 12px rgba(255, 106, 0, 0.06)'
              }}
            >
              <span style={{ fontSize: '0.76rem', color: '#FF6A00', fontWeight: 800 }}>Explain in:</span>
              <select
                aria-label="Select Support Language"
                value={selectedSupportLang}
                onChange={(e) => handleEnrol(selectedTargetLang, e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#202124',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="te" style={{ color: '#202124' }}>🇮🇳 Telugu (తెలుగు)</option>
                <option value="en" style={{ color: '#202124' }}>🇬🇧 English</option>
                <option value="hi" style={{ color: '#202124' }}>🇮🇳 Hindi (हिन्दी)</option>
                <option value="fr" style={{ color: '#202124' }}>🇫🇷 French</option>
                <option value="de" style={{ color: '#202124' }}>🇩🇪 German</option>
                <option value="es" style={{ color: '#202124' }}>🇪🇸 Spanish</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setShowCharacterGuide(!showCharacterGuide)}
              style={{
                padding: '8px 14px',
                borderRadius: 999,
                border: '1.5px solid rgba(255, 106, 0, 0.28)',
                background: showCharacterGuide ? '#FFF3E8' : '#FFFFFF',
                color: '#E85D00',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              {showCharacterGuide ? '🦉 Coach Hoot: ON' : '🦉 Coach: OFF'}
            </button>
          </div>
        </div>

        {/* Navigation Pill Bar */}
        <div
          className="responsive-tabs-scroll"
          style={{
            marginTop: 18,
            paddingTop: 16,
            borderTop: '1.5px solid rgba(255, 106, 0, 0.16)'
          }}
        >
          {[
            { id: 'dashboard', label: '🏠 Home Dashboard' },
            { id: 'vocabulary', label: '🖼️ Picture Vocabulary (15 Topics)' },
            { id: 'speaking', label: '🎤 Speaking & Pronunciation' },
            { id: 'games', label: '🎮 7 Language Games' },
            { id: 'listening', label: '🎧 Listening Studio' },
            { id: 'conversation', label: '💬 AI Conversation' },
            { id: 'curriculum', label: '📐 Scripts & 8-Stage Curriculum' },
            { id: 'select', label: '🌐 Switch / Add Language' }
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchParams({ tab: tab.id, lang: selectedTargetLang });
                }}
                className={`filter-pill ${isSelected ? 'active' : ''}`}
                style={{
                  transition: reducedMotion ? 'none' : undefined
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Optional Animated AI Coach Banner */}
      {showCharacterGuide && (
        <section
          className="glass-card"
          style={{
            marginBottom: 22,
            padding: '16px 20px',
            borderRadius: 20,
            background: 'linear-gradient(135deg, #FFF3E8 0%, #FFFFFF 100%)',
            border: '1.5px solid rgba(255, 106, 0, 0.24)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF7A1A 0%, #FF6A00 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                boxShadow: '0 6px 16px rgba(255, 106, 0, 0.28)'
              }}
            >
              🦉
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#E85D00', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Professor Hoot • Interactive Language Coach
              </div>
              <div style={{ fontSize: '0.88rem', color: '#202124', fontWeight: 600 }}>
                Look at each picture, listen to the native pronunciation, and speak into your microphone! Every word is explained in your support language.
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setReducedMotion(!reducedMotion)}
            className="btn-glass"
            style={{ padding: '7px 14px', fontSize: '0.78rem' }}
          >
            {reducedMotion ? '✨ Enable Animations' : '🧘 Reduced Motion'}
          </button>
        </section>
      )}

      {/* =====================================================================
          TAB 1: ANIMATED LANGUAGE LEARNING HOME DASHBOARD
         ===================================================================== */}
      {activeTab === 'dashboard' && (
        <div>
          {/* 6 Interactive Learning Pillar Cards */}
          <section style={{ marginBottom: 26 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#202124', margin: 0 }}>
                ✨ Interactive Language Studios
              </h2>
              <span style={{ fontSize: '0.82rem', color: '#E85D00', fontWeight: 800, background: '#FFF3E8', padding: '5px 12px', borderRadius: 999, border: '1px solid rgba(255, 106, 0, 0.24)' }}>
                Target: {currentLang.name} • Script: {currentLang.script_name}
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 16
              }}
            >
              {[
                {
                  id: 'vocabulary',
                  title: 'Picture Vocabulary Studio',
                  subtitle: '15 Visual Categories • Animated SVGs',
                  desc: 'Learn Water (水 / Mizu), Fruits, Animals, Transport & Everyday Objects through interactive pictures.',
                  icon: '🖼️',
                  cta: 'Explore Picture Cards →'
                },
                {
                  id: 'speaking',
                  title: 'Speaking & Pronunciation Lab',
                  subtitle: 'Live Microphone • Honest Feedback',
                  desc: 'Listen to native speakers, record your voice, and get Word Recognition, Pronunciation & Sentence scores.',
                  icon: '🎤',
                  cta: 'Start Speaking Practice →'
                },
                {
                  id: 'games',
                  title: '7 Interactive Language Games',
                  subtitle: 'Games A–G • Score & Streaks',
                  desc: 'Play Picture-to-Word, Listen & Select, Speak the Word, Missing Letters, Matching, Sentence Builder & Dialogues.',
                  icon: '🎮',
                  cta: 'Play Language Games →'
                },
                {
                  id: 'listening',
                  title: 'Listening & Understanding',
                  subtitle: 'Normal 1.0x & Slow 0.55x Audio',
                  desc: 'Match spoken words to pictures, distinguish minimal pairs (Obasan vs Obaasan), and understand dialogues.',
                  icon: '🎧',
                  cta: 'Open Listening Studio →'
                },
                {
                  id: 'conversation',
                  title: 'AI Conversation Practice',
                  subtitle: '8 Real-Life Roleplay Scenarios',
                  desc: 'Practice ordering food, asking directions, greeting teachers, and talking about family with AI voice.',
                  icon: '💬',
                  cta: 'Start AI Dialogue →'
                },
                {
                  id: 'curriculum',
                  title: 'Grammar, Scripts & 8 Stages',
                  subtitle: currentLang.script_name,
                  desc: 'Master writing characters, stroke/sound guides, sentence patterns, and all 24 structured lessons.',
                  icon: '📐',
                  cta: 'Open Scripts & Stages →'
                }
              ].map((card) => (
                <div
                  key={card.id}
                  onClick={() => {
                    setActiveTab(card.id);
                    setSearchParams({ tab: card.id, lang: selectedTargetLang });
                  }}
                  className="glass-card glass-card-interactive"
                  style={{
                    padding: 22,
                    borderRadius: 22,
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFBF7 65%, #FFF3E8 100%)',
                    border: '1.5px solid rgba(255, 106, 0, 0.22)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 14,
                          background: '#FFF3E8',
                          border: '1px solid rgba(255, 106, 0, 0.24)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.65rem'
                        }}
                      >
                        {card.icon}
                      </div>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: 999,
                          background: '#FFF3E8',
                          border: '1px solid rgba(255, 106, 0, 0.22)',
                          color: '#E85D00',
                          fontSize: '0.72rem',
                          fontWeight: 800
                        }}
                      >
                        {card.subtitle}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.12rem', fontWeight: 900, color: '#202124', margin: '0 0 6px 0' }}>
                      {card.title}
                    </h3>
                    <p style={{ fontSize: '0.84rem', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
                      {card.desc}
                    </p>
                  </div>
                  <div
                    style={{
                      marginTop: 16,
                      paddingTop: 12,
                      borderTop: '1px solid rgba(255, 106, 0, 0.14)',
                      fontWeight: 800,
                      fontSize: '0.86rem',
                      color: '#FF6A00'
                    }}
                  >
                    {card.cta}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Featured Picture Vocabulary Preview Strip on Home Screen */}
          <section
            className="glass-card"
            style={{
              marginBottom: 26,
              padding: 24,
              borderRadius: 24,
              background: '#FFFFFF',
              border: '1.5px solid rgba(255, 106, 0, 0.22)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
              <div>
                <h2 style={{ fontSize: '1.22rem', fontWeight: 900, color: '#202124', margin: 0 }}>
                  🖼️ Featured Picture Vocabulary ({currentLang.name})
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: '2px 0 0 0' }}>
                  Click any illustration to listen to its native pronunciation or practice speaking it!
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('vocabulary')}
                className="btn-orange"
                style={{ padding: '10px 18px', fontSize: '0.85rem' }}
              >
                Open All 15 Picture Categories →
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(215px, 1fr))',
                gap: 16
              }}
            >
              {vocabItems.slice(0, 4).map((item, idx) => (
                <div
                  key={item.id}
                  className="glass-card glass-card-interactive"
                  style={{
                    borderRadius: 20,
                    border: '1.5px solid rgba(255, 106, 0, 0.2)',
                    background: '#FFFBF7',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ height: 138, background: '#FFFFFF', padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255, 106, 0, 0.12)' }}>
                    <img
                      src={item.illustrationSvgDataUrl}
                      alt={item.englishWord}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <div style={{ padding: 16 }}>
                    <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase' }}>
                      {item.englishWord}
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#202124', marginTop: 2 }}>
                      {item.targetWord}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#FF6A00', fontWeight: 800 }}>
                      [{item.romanization}]
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#E85D00', fontWeight: 700, marginTop: 4 }}>
                      {item.supportMeaning}
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button
                        type="button"
                        onClick={() => speakText(item.targetWord, selectedTargetLang)}
                        className="btn-glass"
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          fontSize: '0.78rem'
                        }}
                      >
                        <Volume2 size={15} color="#FF6A00" /> Listen
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveVocabIndex(idx);
                          setSelectedVocabCategory('all');
                          setActiveTab('vocabulary');
                        }}
                        className="btn-orange"
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          fontSize: '0.78rem'
                        }}
                      >
                        Practice
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 6 Core Language Competency Progress Bars */}
          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#202124', marginBottom: 14 }}>
              📊 Daily Learning Progress &amp; Skill Mastery
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 14
              }}
            >
              {[
                { name: 'Picture Vocabulary', icon: '🖼️', score: activeEnrolment?.vocabulary_score || 78 },
                { name: 'Speaking & Phonetics', icon: '🎤', score: activeEnrolment?.speaking_score || 85 },
                { name: 'Listening Comprehension', icon: '🎧', score: activeEnrolment?.listening_score || 80 },
                { name: 'Grammar & Syntax', icon: '📐', score: activeEnrolment?.grammar_score || 72 },
                { name: 'Script Reading', icon: '📖', score: activeEnrolment?.reading_score || 74 },
                { name: 'Sentence Writing', icon: '✍️', score: activeEnrolment?.writing_score || 68 }
              ].map((skill) => (
                <div
                  key={skill.name}
                  className="glass-card"
                  style={{
                    padding: 18,
                    borderRadius: 18,
                    background: '#FFFFFF',
                    border: '1.5px solid rgba(255, 106, 0, 0.16)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, color: '#202124', fontSize: '0.9rem' }}>
                      <span>{skill.icon}</span>
                      <span>{skill.name}</span>
                    </div>
                    <span style={{ fontWeight: 900, color: '#FF6A00', fontSize: '0.95rem' }}>{skill.score}%</span>
                  </div>
                  <div style={{ width: '100%', height: 9, background: '#FFF3E8', borderRadius: 99, overflow: 'hidden', border: '1px solid rgba(255, 106, 0, 0.14)' }}>
                    <div
                      style={{
                        width: `${skill.score}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #FF8533 0%, #FF6A00 60%, #E85D00 100%)',
                        borderRadius: 99,
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* =====================================================================
          TAB 2: PICTURE-BASED VOCABULARY LEARNING STUDIO (15 CATEGORIES)
         ===================================================================== */}
      {activeTab === 'vocabulary' && (
        <div>
          {/* Category Filter Pills */}
          <section style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
              <div>
                <h2 style={{ fontSize: '1.38rem', fontWeight: 900, color: '#202124', margin: 0 }}>
                  🖼️ Picture-Based Vocabulary Studio
                </h2>
                <p style={{ fontSize: '0.86rem', color: '#6B7280', margin: '2px 0 0 0' }}>
                  Identify objects visually, listen to native pronunciation, repeat into the microphone, and save words to your collection.
                </p>
              </div>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#E85D00', background: '#FFF3E8', border: '1.5px solid rgba(255, 106, 0, 0.26)', padding: '6px 14px', borderRadius: 999 }}>
                ⭐ Saved Words: {savedVocabList.length}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedVocabCategory('all');
                  setActiveVocabIndex(0);
                  setVocabRevealed(false);
                  setVocabQuizChoice(null);
                }}
                className={`filter-pill ${selectedVocabCategory === 'all' ? 'active' : ''}`}
              >
                🌈 All 15 Categories ({vocabItems.length})
              </button>
              {vocabCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedVocabCategory(cat.id);
                    setActiveVocabIndex(0);
                    setVocabRevealed(false);
                    setVocabQuizChoice(null);
                  }}
                  className={`filter-pill ${selectedVocabCategory === cat.id ? 'active' : ''}`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </section>

          {/* Interactive Spotlight Picture Card */}
          {currentVocabCard && (
            <section
              className="glass-card"
              style={{
                marginBottom: 26,
                padding: 26,
                borderRadius: 26,
                background: '#FFFFFF',
                border: '1.5px solid rgba(255, 106, 0, 0.28)'
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: 24,
                  alignItems: 'center'
                }}
              >
                {/* Left Column: Large Animated SVG Illustration */}
                <div
                  style={{
                    borderRadius: 22,
                    background: '#FFFBF7',
                    border: '1.5px solid rgba(255, 106, 0, 0.2)',
                    padding: 18,
                    textAlign: 'center'
                  }}
                >
                  <div style={{ height: 230, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                      src={currentVocabCard.illustrationSvgDataUrl}
                      alt={currentVocabCard.englishWord}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <div style={{ marginTop: 10, fontSize: '1.1rem', fontWeight: 900, color: '#202124' }}>
                    What is this called in {currentLang.name}?
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#6B7280', fontWeight: 700 }}>
                    English: <strong style={{ color: '#202124' }}>{currentVocabCard.englishWord}</strong> • Meaning: <strong style={{ color: '#FF6A00' }}>{currentVocabCard.supportMeaning}</strong>
                  </div>

                  {/* Quick Interactive Picture Quiz Options */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                    {currentVocabCard.quizOptions?.map((opt: string) => {
                      const isPicked = vocabQuizChoice === opt;
                      const isCorrect = opt === currentVocabCard.targetWord;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setVocabQuizChoice(opt);
                            setVocabRevealed(true);
                            speakText(opt, selectedTargetLang);
                          }}
                          style={{
                            padding: '10px 12px',
                            borderRadius: 12,
                            border: isPicked
                              ? isCorrect
                                ? '2px solid #FF6A00'
                                : '2px solid #EF4444'
                              : '1.5px solid rgba(255, 106, 0, 0.2)',
                            background: isPicked
                              ? isCorrect
                                ? '#FFF3E8'
                                : '#FEF2F2'
                              : '#FFFFFF',
                            fontWeight: 800,
                            fontSize: '0.92rem',
                            color: '#202124',
                            cursor: 'pointer'
                          }}
                        >
                          {opt} {isPicked && (isCorrect ? '✅' : '❌')}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column: Target Word, Romanisation, Audio, Speaking & Save */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: 999,
                        background: '#FFF3E8',
                        border: '1px solid rgba(255, 106, 0, 0.24)',
                        color: '#E85D00',
                        fontSize: '0.76rem',
                        fontWeight: 800,
                        textTransform: 'uppercase'
                      }}
                    >
                      Card {activeVocabIndex + 1} of {filteredVocabItems.length}
                    </span>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => {
                          const prev = (activeVocabIndex - 1 + filteredVocabItems.length) % filteredVocabItems.length;
                          setActiveVocabIndex(prev);
                          setVocabRevealed(false);
                          setVocabQuizChoice(null);
                          setSpeechEvaluationResult(null);
                        }}
                        className="btn-glass"
                        style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      >
                        <ChevronLeft size={16} /> Prev
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const next = (activeVocabIndex + 1) % filteredVocabItems.length;
                          setActiveVocabIndex(next);
                          setVocabRevealed(false);
                          setVocabQuizChoice(null);
                          setSpeechEvaluationResult(null);
                        }}
                        className="btn-glass"
                        style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      >
                        Next <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Word Breakdown Box */}
                  <div
                    style={{
                      padding: 20,
                      borderRadius: 20,
                      background: 'linear-gradient(135deg, #FFF3E8 0%, #FFFFFF 100%)',
                      border: '1.5px solid rgba(255, 106, 0, 0.28)',
                      marginBottom: 14
                    }}
                  >
                    <div style={{ fontSize: '0.78rem', color: '#E85D00', fontWeight: 800 }}>
                      {currentLang.name.toUpperCase()} WORD:
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#202124', margin: '2px 0' }}>
                      {currentVocabCard.targetWord}
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FF6A00' }}>
                      Romanisation: <span style={{ fontStyle: 'italic' }}>{currentVocabCard.romanization}</span>
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#202124', marginTop: 6 }}>
                      English: <strong>{currentVocabCard.englishWord}</strong> • Support Meaning: <strong style={{ color: '#E85D00' }}>{currentVocabCard.supportMeaning}</strong>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#6B7280', marginTop: 6 }}>
                      💡 <strong style={{ color: '#202124' }}>Pronunciation Tip:</strong> {currentVocabCard.pronunciationTip}
                    </div>
                  </div>

                  {/* Example Sentence Box */}
                  <div
                    style={{
                      padding: 16,
                      borderRadius: 16,
                      background: '#FFFBF7',
                      border: '1.5px solid rgba(255, 106, 0, 0.18)',
                      marginBottom: 16
                    }}
                  >
                    <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase' }}>
                      Example Sentence in Context:
                    </div>
                    <div style={{ fontSize: '1.02rem', fontWeight: 800, color: '#202124', marginTop: 4 }}>
                      {currentVocabCard.targetSentence}
                    </div>
                    {currentVocabCard.sentenceRomanization && (
                      <div style={{ fontSize: '0.82rem', color: '#FF6A00', fontStyle: 'italic' }}>
                        {currentVocabCard.sentenceRomanization}
                      </div>
                    )}
                    <div style={{ fontSize: '0.84rem', color: '#E85D00', fontWeight: 700, marginTop: 2 }}>
                      {currentVocabCard.sentenceMeaning}
                    </div>
                  </div>

                  {/* Audio, Speak & Save Action Buttons */}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => speakText(currentVocabCard.targetWord, selectedTargetLang, 0.9)}
                      className="btn-orange"
                      style={{ padding: '11px 18px', fontSize: '0.86rem' }}
                    >
                      <Volume2 size={18} /> Listen (Normal)
                    </button>

                    <button
                      type="button"
                      onClick={() => speakText(currentVocabCard.targetWord, selectedTargetLang, 0.55)}
                      className="btn-glass"
                      style={{ padding: '11px 16px', fontSize: '0.86rem' }}
                    >
                      🐢 Slow Audio
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPracticePhrase(currentVocabCard.targetWord);
                        setExpectedPhonetics(currentVocabCard.romanization);
                        setPhraseMeaning(currentVocabCard.supportMeaning);
                        setPhraseIllustration(currentVocabCard.illustrationSvgDataUrl);
                        toggleRecording(currentVocabCard.targetWord, currentVocabCard.romanization);
                      }}
                      className="btn-orange"
                      style={{
                        padding: '11px 18px',
                        fontSize: '0.86rem',
                        background: isRecording ? '#EF4444' : undefined
                      }}
                    >
                      <Mic size={18} /> {isRecording ? 'Listening...' : 'Speak Word'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveVocabularyWord(currentVocabCard)}
                      disabled={savingWordId === currentVocabCard.id}
                      className="btn-glass"
                      style={{ padding: '11px 16px', fontSize: '0.86rem' }}
                    >
                      <Bookmark size={16} color="#FF6A00" />
                      {savedVocabList.some((w) => w.word_id === currentVocabCard.id) ? 'Saved ✓' : 'Save Word'}
                    </button>
                  </div>

                  {/* Instant Speaking Feedback inside Picture Card */}
                  {speechEvaluationResult && (
                    <div
                      style={{
                        marginTop: 14,
                        padding: 16,
                        borderRadius: 16,
                        background: '#FFF3E8',
                        border: '1.5px solid rgba(255, 106, 0, 0.32)'
                      }}
                    >
                      <div style={{ fontWeight: 900, color: '#E85D00', fontSize: '0.92rem' }}>
                        🎤 Pronunciation Score: {speechEvaluationResult.accuracy_score}% — {speechEvaluationResult.feedback}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#202124', marginTop: 4 }}>
                        {speechEvaluationResult.support_explanation}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Full Picture Vocabulary Grid */}
          <section>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#202124', marginBottom: 14 }}>
              All Visual Cards in Category ({filteredVocabItems.length})
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 14
              }}
            >
              {filteredVocabItems.map((item, idx) => {
                const isCurrent = currentVocabCard?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setActiveVocabIndex(idx);
                      setVocabRevealed(false);
                      setVocabQuizChoice(null);
                    }}
                    className="glass-card glass-card-interactive"
                    style={{
                      padding: 16,
                      borderRadius: 20,
                      background: isCurrent ? '#FFF3E8' : '#FFFFFF',
                      border: isCurrent ? '2px solid #FF6A00' : '1.5px solid rgba(255, 106, 0, 0.16)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ height: 118, background: '#FFFBF7', borderRadius: 14, padding: 8, marginBottom: 10, border: '1px solid rgba(255, 106, 0, 0.12)' }}>
                      <img
                        src={item.illustrationSvgDataUrl}
                        alt={item.englishWord}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase' }}>
                      {item.englishWord}
                    </div>
                    <div style={{ fontSize: '1.22rem', fontWeight: 900, color: '#202124' }}>{item.targetWord}</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FF6A00' }}>[{item.romanization}]</div>
                    <div style={{ fontSize: '0.78rem', color: '#E85D00', fontWeight: 700, marginTop: 2 }}>
                      {item.supportMeaning}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* =====================================================================
          TAB 3: DEDICATED SPEAKING & PRONUNCIATION LAB
         ===================================================================== */}
      {activeTab === 'speaking' && (
        <div>
          <section
            className="glass-card"
            style={{
              padding: 28,
              borderRadius: 26,
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF9F4 55%, #FFF3E8 100%)',
              color: '#202124',
              border: '1.5px solid rgba(255, 106, 0, 0.28)',
              marginBottom: 24
            }}
          >
            {/* Quick Word Selector Strip */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#E85D00', textTransform: 'uppercase', marginBottom: 8 }}>
                Select Word or Sentence to Practice Speaking:
              </div>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
                {vocabItems.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      setPracticePhrase(v.targetWord);
                      setExpectedPhonetics(v.romanization);
                      setPhraseMeaning(`${v.englishWord} • ${v.supportMeaning}`);
                      setPhraseIllustration(v.illustrationSvgDataUrl);
                      setSpeechEvaluationResult(null);
                      setSpeechRecognized('');
                    }}
                    className={`filter-pill ${practicePhrase === v.targetWord ? 'active' : ''}`}
                  >
                    {v.targetWord} ({v.englishWord})
                  </button>
                ))}
              </div>
            </div>

            {/* Main Speaking Card */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 24,
                alignItems: 'center',
                padding: 24,
                borderRadius: 22,
                background: '#FFFFFF',
                border: '1.5px solid rgba(255, 106, 0, 0.22)',
                boxShadow: '0 8px 24px rgba(255, 106, 0, 0.08)'
              }}
            >
              {/* Picture + Target Phrase */}
              <div style={{ textAlign: 'center' }}>
                {phraseIllustration && (
                  <div style={{ height: 155, background: '#FFFBF7', border: '1px solid rgba(255, 106, 0, 0.16)', borderRadius: 18, padding: 10, marginBottom: 14, display: 'inline-block', width: 220 }}>
                    <img src={phraseIllustration} alt={practicePhrase} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                )}
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#202124', marginBottom: 4 }}>{practicePhrase}</div>
                <div style={{ fontSize: '1.05rem', color: '#FF6A00', fontWeight: 800, fontStyle: 'italic', marginBottom: 6 }}>
                  Romanisation: [{expectedPhonetics}]
                </div>
                <div style={{ fontSize: '0.95rem', color: '#6B7280', fontWeight: 700 }}>
                  Meaning: <strong style={{ color: '#202124' }}>{phraseMeaning}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => speakText(practicePhrase, selectedTargetLang, 0.9)}
                    className="btn-orange"
                    style={{ padding: '10px 18px', fontSize: '0.86rem' }}
                  >
                    <Volume2 size={18} /> Listen Pronunciation
                  </button>
                  <button
                    type="button"
                    onClick={() => speakText(practicePhrase, selectedTargetLang, 0.55)}
                    className="btn-glass"
                    style={{ padding: '10px 16px', fontSize: '0.86rem' }}
                  >
                    🐢 Slow Repeat
                  </button>
                </div>
              </div>

              {/* Microphone & Interactive Assessment Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => toggleRecording()}
                  style={{
                    width: 92,
                    height: 92,
                    borderRadius: '50%',
                    border: isRecording ? '4px solid #FCA5A5' : '4px solid #FFF3E8',
                    background: isRecording ? '#EF4444' : 'linear-gradient(135deg, #FF7A1A 0%, #FF6A00 100%)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: isRecording
                      ? '0 0 30px rgba(239, 68, 68, 0.6)'
                      : '0 12px 28px rgba(255, 106, 0, 0.36)'
                  }}
                  aria-label={isRecording ? 'Stop Recording' : 'Start Speaking'}
                >
                  {isRecording ? <MicOff size={36} /> : <Mic size={36} />}
                </button>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: isRecording ? '#EF4444' : '#FF6A00' }}>
                  {isRecording ? '🔴 Recording... Speak clearly now!' : 'Tap Microphone to Speak'}
                </div>

                {micPermissionState === 'denied' && (
                  <div style={{ fontSize: '0.8rem', color: '#E85D00', textAlign: 'center', maxWidth: 320 }}>
                    Microphone permission was denied by your browser. You can enable microphone access in browser settings or test using phonetic text input below:
                  </div>
                )}

                {/* Accessible Phonetic Input / Fallback Bar */}
                <div style={{ display: 'flex', gap: 8, width: '100%', maxWidth: 360, marginTop: 6 }}>
                  <input
                    type="text"
                    value={manualSpeechInput}
                    onChange={(e) => setManualSpeechInput(e.target.value)}
                    placeholder={`Or type spoken phonetics (e.g. ${expectedPhonetics})...`}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: 999,
                      border: '1.5px solid rgba(255, 106, 0, 0.24)',
                      background: '#FFFBF7',
                      color: '#202124',
                      fontSize: '0.84rem',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const text = manualSpeechInput.trim() || expectedPhonetics;
                      setSpeechRecognized(text);
                      handleEvaluateSpeech(text);
                    }}
                    className="btn-orange"
                    style={{ padding: '9px 16px', fontSize: '0.82rem' }}
                  >
                    Assess
                  </button>
                </div>
              </div>
            </div>

            {/* 3-Dimensional Honest Speaking Feedback Breakdown */}
            {speechEvaluationResult && (
              <div
                style={{
                  marginTop: 20,
                  padding: 22,
                  borderRadius: 20,
                  background: '#FFFFFF',
                  border: '1.5px solid rgba(255, 106, 0, 0.28)',
                  boxShadow: '0 8px 24px rgba(255, 106, 0, 0.08)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 800 }}>
                      RECOGNIZED SPOKEN RESPONSE: &quot;{speechRecognized}&quot;
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#FF6A00', marginTop: 2 }}>
                      {speechEvaluationResult.feedback}
                    </div>
                    <div style={{ fontSize: '0.88rem', color: '#202124', marginTop: 2 }}>
                      {speechEvaluationResult.support_explanation}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setSpeechEvaluationResult(null);
                        setSpeechRecognized('');
                      }}
                      className="btn-glass"
                      style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                    >
                      🔄 Try Again
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const idx = vocabItems.findIndex((v) => v.targetWord === practicePhrase);
                        const nextItem = vocabItems[(idx + 1) % Math.max(1, vocabItems.length)];
                        if (nextItem) {
                          setPracticePhrase(nextItem.targetWord);
                          setExpectedPhonetics(nextItem.romanization);
                          setPhraseMeaning(`${nextItem.englishWord} • ${nextItem.supportMeaning}`);
                          setPhraseIllustration(nextItem.illustrationSvgDataUrl);
                          setSpeechEvaluationResult(null);
                          setSpeechRecognized('');
                        }
                      }}
                      className="btn-orange"
                      style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                    >
                      Next Word →
                    </button>
                  </div>
                </div>

                {/* 3 Distinct Assessment Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12, marginBottom: 12 }}>
                  <div style={{ padding: 14, borderRadius: 14, background: '#FFF3E8', border: '1px solid rgba(255, 106, 0, 0.24)' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700 }}>1. Word Recognition</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#FF6A00' }}>
                      {speechEvaluationResult.word_recognition_score ?? speechEvaluationResult.accuracy_score}%
                    </div>
                  </div>
                  <div style={{ padding: 14, borderRadius: 14, background: '#FFFBF7', border: '1px solid rgba(255, 106, 0, 0.22)' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700 }}>2. Pronunciation Cadence</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#E85D00' }}>
                      {speechEvaluationResult.pronunciation_quality_score ?? speechEvaluationResult.accuracy_score}%
                    </div>
                  </div>
                  <div style={{ padding: 14, borderRadius: 14, background: '#FFF3E8', border: '1px solid rgba(255, 106, 0, 0.24)' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700 }}>3. Sentence Accuracy</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#202124' }}>
                      {speechEvaluationResult.sentence_accuracy_score ?? 100}%
                    </div>
                  </div>
                </div>

                {speechEvaluationResult.language_phonetic_notes && (
                  <div style={{ fontSize: '0.82rem', color: '#E85D00', marginBottom: 4 }}>
                    🎯 <strong>Phonetic Note:</strong> {speechEvaluationResult.language_phonetic_notes}
                  </div>
                )}
                {speechEvaluationResult.assessment_capability_disclosure && (
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                    ℹ️ {speechEvaluationResult.assessment_capability_disclosure}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      )}

      {/* =====================================================================
          TAB 4: 7 INTERACTIVE LANGUAGE GAMES (GAMES A TO G)
         ===================================================================== */}
      {activeTab === 'games' && (
        <div>
          <section style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#202124', margin: 0 }}>
                  🎮 7 Interactive Language Games ({currentLang.name})
                </h2>
                <p style={{ fontSize: '0.86rem', color: '#6B7280', margin: '2px 0 0 0' }}>
                  Play all 7 functional language games with visual illustrations, audio prompts, speaking challenges &amp; instant explanations.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ padding: '6px 12px', borderRadius: 10, background: '#FFF3E8', color: '#E85D00', border: '1px solid rgba(255,106,0,0.2)', fontWeight: 900, fontSize: '0.86rem' }}>
                  🏆 Score: {gameScore} pts
                </span>
                <span style={{ padding: '6px 12px', borderRadius: 10, background: '#FFF3E8', color: '#FF6A00', border: '1px solid rgba(255,106,0,0.2)', fontWeight: 900, fontSize: '0.86rem' }}>
                  🔥 Streak: {gameStreak}
                </span>
                <select
                  value={gameDifficulty}
                  onChange={(e) => setGameDifficulty(e.target.value as any)}
                  style={{ padding: '6px 12px', borderRadius: 10, border: '1px solid rgba(255,106,0,0.25)', background: '#FFFFFF', color: '#202124', fontWeight: 800, fontSize: '0.82rem' }}
                >
                  <option value="easy">Easy Mode</option>
                  <option value="medium">Medium Mode</option>
                  <option value="hard">Hard Mode</option>
                </select>
              </div>
            </div>

            {/* 7 Game Mode Selector Pills */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
              {[
                { id: 'picture_to_word', label: 'Game A: Picture to Word 🖼️' },
                { id: 'listen_and_select', label: 'Game B: Listen & Select 🎧' },
                { id: 'speak_the_word', label: 'Game C: Speak the Word 🎤' },
                { id: 'missing_letters', label: 'Game D: Missing Letters 🔤' },
                { id: 'word_matching', label: 'Game E: Word Matching 🧩' },
                { id: 'sentence_builder', label: 'Game F: Sentence Builder 📐' },
                { id: 'conversation_challenge', label: 'Game G: Conversation Challenge 💬' }
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    setActiveGameTab(g.id as any);
                    setGameRoundIndex(0);
                    setGameSelectedAnswer(null);
                    setGameFeedback(null);
                  }}
                  style={{
                    padding: '9px 14px',
                    borderRadius: 12,
                    border: activeGameTab === g.id ? '2px solid #FF6A00' : '1px solid rgba(32,33,36,0.1)',
                    background: activeGameTab === g.id ? 'linear-gradient(135deg, #FF6A00 0%, #E85D00 100%)' : '#FFFFFF',
                    color: activeGameTab === g.id ? '#FFFFFF' : '#202124',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: activeGameTab === g.id ? '0 6px 14px rgba(255,106,0,0.22)' : 'none'
                  }}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </section>

          {/* GAME A: PICTURE TO WORD */}
          {activeGameTab === 'picture_to_word' && gamesData?.pictureToWord && (
            <section style={{ padding: 24, borderRadius: 22, background: '#FFFFFF', border: '1.5px solid rgba(255,106,0,0.18)', boxShadow: '0 10px 28px rgba(32,33,36,0.05)' }}>
              {(() => {
                const round = gamesData.pictureToWord[gameRoundIndex % gamesData.pictureToWord.length];
                return (
                  <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#FF6A00', textTransform: 'uppercase' }}>
                      Game A: Picture to Word • Round {(gameRoundIndex % gamesData.pictureToWord.length) + 1} of {gamesData.pictureToWord.length}
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#202124', margin: '6px 0 14px 0' }}>
                      Select the correct {currentLang.name} word for this picture ({round.englishWord}):
                    </h3>
                    <div style={{ height: 190, background: '#FFFDFB', borderRadius: 18, padding: 12, marginBottom: 16, border: '1px solid rgba(255,106,0,0.15)' }}>
                      <img src={round.illustrationSvgDataUrl} alt={round.englishWord} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {round.options.map((opt: string) => {
                        const isSelected = gameSelectedAnswer === opt;
                        const isRight = opt === round.correctWord;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              setGameSelectedAnswer(opt);
                              speakText(opt, selectedTargetLang);
                              if (opt === round.correctWord) {
                                setGameScore((s) => s + 15);
                                setGameStreak((st) => st + 1);
                                setGameFeedback({ isCorrect: true, text: `🎉 Correct! ${round.explanation}` });
                              } else {
                                setGameStreak(0);
                                setGameFeedback({ isCorrect: false, text: `Not quite! The correct word is ${round.correctWord}. ${round.explanation}` });
                              }
                            }}
                            style={{
                              padding: '14px',
                              borderRadius: 14,
                              border: isSelected ? (isRight ? '2px solid #10B981' : '2px solid #EF4444') : '1px solid rgba(32,33,36,0.12)',
                              background: isSelected ? (isRight ? '#ECFDF5' : '#FEF2F2') : '#FFFFFF',
                              fontWeight: 900,
                              fontSize: '1.05rem',
                              cursor: 'pointer'
                            }}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {gameFeedback && (
                      <div style={{ marginTop: 16, padding: 14, borderRadius: 14, background: gameFeedback.isCorrect ? '#ECFDF5' : '#FEF2F2', color: gameFeedback.isCorrect ? '#065F46' : '#991B1B', fontWeight: 700 }}>
                        <div>{gameFeedback.text}</div>
                        <button
                          type="button"
                          onClick={() => {
                            setGameRoundIndex((i) => i + 1);
                            setGameSelectedAnswer(null);
                            setGameFeedback(null);
                          }}
                          style={{ marginTop: 10, padding: '8px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #FF6A00 0%, #E85D00 100%)', color: '#FFFFFF', fontWeight: 800, cursor: 'pointer' }}
                        >
                          Next Picture ➔
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </section>
          )}

          {/* GAME B: LISTEN AND SELECT */}
          {activeGameTab === 'listen_and_select' && gamesData?.listenAndSelect && (
            <section style={{ padding: 24, borderRadius: 22, background: '#FFFFFF', border: '1.5px solid rgba(255,106,0,0.18)', boxShadow: '0 10px 28px rgba(32,33,36,0.05)' }}>
              {(() => {
                const round = gamesData.listenAndSelect[gameRoundIndex % gamesData.listenAndSelect.length];
                return (
                  <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#FF6A00', textTransform: 'uppercase' }}>
                      Game B: Listen and Select
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#202124', margin: '6px 0 14px 0' }}>
                      Click Play to hear the {currentLang.name} word, then select its matching picture &amp; meaning:
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 18 }}>
                      <button
                        type="button"
                        onClick={() => speakText(round.audioText, selectedTargetLang, 0.9)}
                        style={{ padding: '12px 22px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #FF6A00 0%, #E85D00 100%)', color: '#FFFFFF', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 6px 16px rgba(255,106,0,0.22)' }}
                      >
                        <Volume2 size={20} /> Play Word Audio ({round.romanization})
                      </button>
                      <button
                        type="button"
                        onClick={() => speakText(round.audioText, selectedTargetLang, 0.55)}
                        style={{ padding: '12px 18px', borderRadius: 14, border: '1.5px solid rgba(255,106,0,0.3)', background: '#FFF3E8', color: '#E85D00', fontWeight: 800, cursor: 'pointer' }}
                      >
                        🐢 Slow Audio
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
                      {round.options.map((opt: any, idx: number) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setGameSelectedAnswer(opt.english);
                            if (opt.isCorrect) {
                              setGameScore((s) => s + 15);
                              setGameStreak((st) => st + 1);
                              setGameFeedback({ isCorrect: true, text: `🎉 Correct! ${round.explanation}` });
                            } else {
                              setGameStreak(0);
                              setGameFeedback({ isCorrect: false, text: `Try again! ${round.explanation}` });
                            }
                          }}
                          style={{
                            padding: 12,
                            borderRadius: 16,
                            border: gameSelectedAnswer === opt.english ? (opt.isCorrect ? '2px solid #10B981' : '2px solid #EF4444') : '1px solid rgba(32,33,36,0.1)',
                            background: '#FFFDFB',
                            cursor: 'pointer'
                          }}
                        >
                          <img src={opt.svg} alt={opt.english} style={{ width: '100%', height: 90, objectFit: 'contain' }} />
                          <div style={{ fontWeight: 900, color: '#202124', marginTop: 6 }}>{opt.english}</div>
                          <div style={{ fontSize: '0.76rem', color: '#E85D00', fontWeight: 700 }}>{opt.meaning}</div>
                        </div>
                      ))}
                    </div>
                    {gameFeedback && (
                      <div style={{ marginTop: 16, padding: 14, borderRadius: 14, background: gameFeedback.isCorrect ? '#ECFDF5' : '#FEF2F2', fontWeight: 700 }}>
                        <div>{gameFeedback.text}</div>
                        <button
                          type="button"
                          onClick={() => {
                            setGameRoundIndex((i) => i + 1);
                            setGameSelectedAnswer(null);
                            setGameFeedback(null);
                          }}
                          style={{ marginTop: 10, padding: '8px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #FF6A00 0%, #E85D00 100%)', color: '#FFFFFF', fontWeight: 800, cursor: 'pointer' }}
                        >
                          Next Audio Round ➔
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </section>
          )}

          {/* GAME C: SPEAK THE WORD */}
          {activeGameTab === 'speak_the_word' && gamesData?.speakTheWord && (
            <section style={{ padding: 24, borderRadius: 22, background: '#FFFFFF', border: '1.5px solid rgba(255,106,0,0.18)', textAlign: 'center', boxShadow: '0 10px 28px rgba(32,33,36,0.05)' }}>
              {(() => {
                const round = gamesData.speakTheWord[gameRoundIndex % gamesData.speakTheWord.length];
                return (
                  <div style={{ maxWidth: 640, margin: '0 auto' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#FF6A00', textTransform: 'uppercase' }}>
                      Game C: Speak the Word Challenge
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#202124', margin: '6px 0 12px 0' }}>
                      Pronounce this word in {currentLang.name}: {round.fullDisplay} [{round.romanization}]
                    </h3>
                    <div style={{ height: 160, background: '#FFFDFB', borderRadius: 16, padding: 10, marginBottom: 14, border: '1px solid rgba(255,106,0,0.15)' }}>
                      <img src={round.illustrationSvgDataUrl} alt={round.englishWord} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 14 }}>
                      <button
                        type="button"
                        onClick={() => speakText(round.targetWord, selectedTargetLang, 0.9)}
                        style={{ padding: '10px 18px', borderRadius: 12, border: '1.5px solid rgba(255,106,0,0.3)', background: '#FFF3E8', color: '#E85D00', fontWeight: 800, cursor: 'pointer' }}
                      >
                        🔊 Hear Example
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          toggleRecording(round.targetWord, round.romanization);
                          setGameScore((s) => s + 20);
                        }}
                        style={{ padding: '10px 22px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #FF6A00 0%, #E85D00 100%)', color: '#FFFFFF', fontWeight: 900, cursor: 'pointer', boxShadow: '0 6px 16px rgba(255,106,0,0.24)' }}
                      >
                        🎤 Speak Now
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setGameRoundIndex((i) => i + 1);
                          setSpeechEvaluationResult(null);
                        }}
                        style={{ padding: '10px 16px', borderRadius: 12, border: '1px solid rgba(32,33,36,0.12)', background: '#FFFFFF', color: '#202124', fontWeight: 800, cursor: 'pointer' }}
                      >
                        Next Word ➔
                      </button>
                    </div>
                    {speechEvaluationResult && (
                      <div style={{ padding: 14, borderRadius: 14, background: '#ECFDF5', color: '#065F46', fontWeight: 700 }}>
                        Score: {speechEvaluationResult.accuracy_score}% — {speechEvaluationResult.feedback}
                      </div>
                    )}
                  </div>
                );
              })()}
            </section>
          )}

          {/* GAME D: MISSING LETTERS */}
          {activeGameTab === 'missing_letters' && gamesData?.missingLetters && (
            <section style={{ padding: 24, borderRadius: 22, background: '#FFFFFF', border: '1.5px solid rgba(255,106,0,0.18)', textAlign: 'center', boxShadow: '0 10px 28px rgba(32,33,36,0.05)' }}>
              {(() => {
                const round = gamesData.missingLetters[gameRoundIndex % gamesData.missingLetters.length];
                return (
                  <div style={{ maxWidth: 640, margin: '0 auto' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#FF6A00', textTransform: 'uppercase' }}>
                      Game D: Missing Letters
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#202124', margin: '6px 0' }}>
                      Complete the missing letter for {round.targetScriptWord} ({round.englishWord}):
                    </h3>
                    <div style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '6px', color: '#202124', margin: '18px 0', padding: 16, borderRadius: 16, background: '#FFF3E8', border: '1px solid rgba(255,106,0,0.2)' }}>
                      {round.maskedDisplay}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                      {round.letterChoices.map((ch: string) => (
                        <button
                          key={ch}
                          type="button"
                          onClick={() => {
                            setGameSelectedAnswer(ch);
                            if (ch === round.missingChar) {
                              setGameScore((s) => s + 15);
                              setGameFeedback({ isCorrect: true, text: `🎉 Correct! ${round.explanation}` });
                            } else {
                              setGameFeedback({ isCorrect: false, text: `The missing letter is "${round.missingChar}". ${round.explanation}` });
                            }
                          }}
                          style={{ width: 56, height: 56, borderRadius: 14, border: '2px solid rgba(255,106,0,0.25)', background: '#FFFFFF', color: '#202124', fontSize: '1.3rem', fontWeight: 900, cursor: 'pointer' }}
                        >
                          {ch}
                        </button>
                      ))}
                    </div>
                    {gameFeedback && (
                      <div style={{ marginTop: 16, padding: 14, borderRadius: 14, background: gameFeedback.isCorrect ? '#ECFDF5' : '#FEF2F2', fontWeight: 700 }}>
                        <div>{gameFeedback.text}</div>
                        <button
                          type="button"
                          onClick={() => {
                            setGameRoundIndex((i) => i + 1);
                            setGameSelectedAnswer(null);
                            setGameFeedback(null);
                          }}
                          style={{ marginTop: 10, padding: '8px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #FF6A00 0%, #E85D00 100%)', color: '#FFFFFF', fontWeight: 800, cursor: 'pointer' }}
                        >
                          Next Word ➔
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </section>
          )}

          {/* GAME E: WORD MATCHING */}
          {activeGameTab === 'word_matching' && gamesData?.wordMatch && (
            <section style={{ padding: 24, borderRadius: 22, background: '#FFFFFF', border: '1.5px solid rgba(255,106,0,0.18)', boxShadow: '0 10px 28px rgba(32,33,36,0.05)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#202124', marginBottom: 12 }}>
                Game E: Match Target Words with Their Meanings
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
                {gamesData.wordMatch.map((item: any, i: number) => {
                  const isMatched = matchedPairs.includes(item.word);
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        if (!isMatched) {
                          setMatchedPairs([...matchedPairs, item.word]);
                          setGameScore((s) => s + 10);
                        }
                      }}
                      style={{
                        padding: 14,
                        borderRadius: 14,
                        background: isMatched ? '#FFF3E8' : '#FFFDFB',
                        border: isMatched ? '2px solid #FF6A00' : '1px solid rgba(32,33,36,0.1)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span style={{ fontWeight: 900, color: '#202124' }}>{item.word}</span>
                      <span style={{ fontSize: '0.84rem', fontWeight: 800, color: isMatched ? '#E85D00' : '#6B7280' }}>
                        {isMatched ? `✓ ${item.meaning}` : 'Tap to Match'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* GAME F: SENTENCE BUILDER */}
          {activeGameTab === 'sentence_builder' && gamesData?.sentenceScramble && (
            <section style={{ padding: 24, borderRadius: 22, background: '#FFFFFF', border: '1.5px solid rgba(255,106,0,0.18)', boxShadow: '0 10px 28px rgba(32,33,36,0.05)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#202124', marginBottom: 6 }}>
                Game F: Sentence Builder
              </h3>
              <div style={{ padding: 12, borderRadius: 12, background: '#FFF3E8', color: '#E85D00', border: '1px solid rgba(255,106,0,0.2)', fontWeight: 800, marginBottom: 14 }}>
                Target Meaning: {gamesData.sentenceScramble.meaning}
              </div>
              <div style={{ minHeight: 52, padding: 14, borderRadius: 14, border: '2px dashed rgba(255,106,0,0.35)', background: '#FFFDFB', marginBottom: 14, fontWeight: 900, fontSize: '1.15rem', color: '#202124' }}>
                {scrambleAnswer || 'Tap word tiles below in grammatical order...'}
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
                {scrambleOrder.map((token: string, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setScrambleAnswer((prev) => (prev ? `${prev} ${token}` : token))}
                    style={{ padding: '10px 16px', borderRadius: 12, border: '1.5px solid rgba(255,106,0,0.25)', background: '#FFFFFF', color: '#202124', fontWeight: 800, cursor: 'pointer' }}
                  >
                    {token}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => {
                    setGameScore((s) => s + 20);
                    setGameFeedback({ isCorrect: true, text: `Target Sentence: ${gamesData.sentenceScramble.correct_sentence}` });
                  }}
                  style={{ padding: '10px 18px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #FF6A00 0%, #E85D00 100%)', color: '#FFFFFF', fontWeight: 800, cursor: 'pointer' }}
                >
                  Check Sentence
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setScrambleAnswer('');
                    setGameFeedback(null);
                  }}
                  style={{ padding: '10px 16px', borderRadius: 12, border: '1px solid rgba(32,33,36,0.12)', background: '#FFFFFF', color: '#202124', fontWeight: 700, cursor: 'pointer' }}
                >
                  Reset
                </button>
              </div>
              {gameFeedback && (
                <div style={{ marginTop: 12, padding: 12, borderRadius: 12, background: '#ECFDF5', color: '#065F46', fontWeight: 800 }}>
                  {gameFeedback.text}
                </div>
              )}
            </section>
          )}

          {/* GAME G: CONVERSATION CHALLENGE */}
          {activeGameTab === 'conversation_challenge' && gamesData?.conversationChallenge && (
            <section style={{ padding: 24, borderRadius: 22, background: '#FFFFFF', border: '1.5px solid rgba(255,106,0,0.18)', boxShadow: '0 10px 28px rgba(32,33,36,0.05)' }}>
              {(() => {
                const challenge = gamesData.conversationChallenge[0];
                return (
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#FF6A00', textTransform: 'uppercase' }}>
                      Game G: Real-Life Conversation Challenge • {challenge.scenario}
                    </div>
                    <div style={{ margin: '12px 0', padding: 16, borderRadius: 16, background: '#FFF3E8', border: '1px solid rgba(255,106,0,0.22)', fontWeight: 800, fontSize: '1.05rem', color: '#202124' }}>
                      🗣️ Partner says: &quot;{challenge.speakerPrompt}&quot;
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {challenge.options.map((opt: any, idx: number) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setGameSelectedAnswer(opt.text);
                            speakText(opt.text.split('(')[0], selectedTargetLang);
                            if (opt.isCorrect) {
                              setGameScore((s) => s + 20);
                              setGameFeedback({ isCorrect: true, text: `🎉 Great response! ${challenge.explanation}` });
                            } else {
                              setGameFeedback({ isCorrect: false, text: `Better choice available: ${challenge.explanation}` });
                            }
                          }}
                          style={{
                            padding: 14,
                            borderRadius: 14,
                            border: gameSelectedAnswer === opt.text ? (opt.isCorrect ? '2px solid #10B981' : '2px solid #EF4444') : '1px solid rgba(32,33,36,0.1)',
                            background: '#FFFFFF',
                            textAlign: 'left',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ fontWeight: 900, color: '#202124' }}>{opt.text}</div>
                          <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: 2 }}>Meaning: {opt.meaning}</div>
                        </button>
                      ))}
                    </div>
                    {gameFeedback && (
                      <div style={{ marginTop: 14, padding: 14, borderRadius: 14, background: gameFeedback.isCorrect ? '#ECFDF5' : '#FEF2F2', fontWeight: 700 }}>
                        {gameFeedback.text}
                      </div>
                    )}
                  </div>
                );
              })()}
            </section>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 5: LISTENING & UNDERSTANDING STUDIO
         ===================================================================== */}
      {activeTab === 'listening' && listeningData && (
        <div>
          <section style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#202124', margin: 0 }}>
              🎧 Listening &amp; Understanding Studio ({currentLang.name})
            </h2>
            <p style={{ fontSize: '0.86rem', color: '#6B7280', margin: '4px 0 0 0' }}>
              Practice listening to words, sentences, minimal pairs, and native dialogues with Normal (1.0x) and Slow (0.55x) audio.
            </p>
          </section>

          {/* 1. Minimal Pairs (Similar Sounds) */}
          <section style={{ marginBottom: 24, padding: 20, borderRadius: 20, background: '#FFFFFF', border: '1.5px solid rgba(255,106,0,0.18)', boxShadow: '0 8px 24px rgba(32,33,36,0.04)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#202124', margin: '0 0 12px 0' }}>
              1. Minimal Pairs: Distinguish Similar Sounds
            </h3>
            {listeningData.minimalPairs?.map((mp: any) => (
              <div key={mp.id} style={{ padding: 16, borderRadius: 16, background: '#FFFDFB', border: '1px solid rgba(255,106,0,0.15)', marginBottom: 12 }}>
                <div style={{ fontWeight: 800, color: '#202124', marginBottom: 8 }}>{mp.title}</div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  <button
                    type="button"
                    onClick={() => speakText(mp.audioText, selectedTargetLang, 0.9)}
                    style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #FF6A00 0%, #E85D00 100%)', color: '#FFFFFF', fontWeight: 800, cursor: 'pointer' }}
                  >
                    🔊 Play Target Sound
                  </button>
                  <button
                    type="button"
                    onClick={() => speakText(mp.audioText, selectedTargetLang, 0.5)}
                    style={{ padding: '8px 14px', borderRadius: 10, border: '1.5px solid rgba(255,106,0,0.3)', background: '#FFF3E8', color: '#E85D00', fontWeight: 800, cursor: 'pointer' }}
                  >
                    🐢 Slow (0.5x)
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {(['A', 'B'] as const).map((choice) => {
                    const wordObj = choice === 'A' ? mp.wordA : mp.wordB;
                    const picked = listeningAnswers[mp.id] === choice;
                    return (
                      <button
                        key={choice}
                        type="button"
                        onClick={() => setListeningAnswers({ ...listeningAnswers, [mp.id]: choice })}
                        style={{
                          padding: 12,
                          borderRadius: 12,
                          border: picked ? '2px solid #FF6A00' : '1px solid rgba(32,33,36,0.12)',
                          background: picked ? '#FFF3E8' : '#FFFFFF',
                          textAlign: 'left',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ fontWeight: 900, color: '#202124' }}>Option {choice}: {wordObj.text}</div>
                        <div style={{ fontSize: '0.8rem', color: '#E85D00', fontWeight: 700 }}>{wordObj.meaning}</div>
                      </button>
                    );
                  })}
                </div>
                {listeningAnswers[mp.id] && (
                  <div style={{ marginTop: 10, fontSize: '0.84rem', color: '#E85D00', fontWeight: 700 }}>
                    💡 {mp.explanation}
                  </div>
                )}
              </div>
            ))}
          </section>

          {/* 2. Short Conversation Comprehension */}
          {listeningData.shortDialogue && (
            <section style={{ padding: 20, borderRadius: 20, background: '#FFFFFF', border: '1.5px solid rgba(255,106,0,0.18)', boxShadow: '0 8px 24px rgba(32,33,36,0.04)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#202124', margin: '0 0 12px 0' }}>
                2. Dialogue Listening: {listeningData.shortDialogue.title}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {listeningData.shortDialogue.lines.map((line: any, i: number) => (
                  <div key={i} style={{ padding: 12, borderRadius: 12, background: '#FFFDFB', border: '1px solid rgba(255,106,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <span style={{ fontWeight: 900, color: '#FF6A00', marginRight: 8 }}>{line.speaker}:</span>
                      <span style={{ fontWeight: 800, color: '#202124' }}>{line.text}</span>
                      {line.romaji && <div style={{ fontSize: '0.78rem', color: '#6B7280', fontStyle: 'italic' }}>{line.romaji}</div>}
                      <div style={{ fontSize: '0.8rem', color: '#E85D00', fontWeight: 600 }}>{line.meaning}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => speakText(line.text, selectedTargetLang, 0.85)}
                      style={{ padding: '6px 12px', borderRadius: 10, border: '1.5px solid rgba(255,106,0,0.25)', background: '#FFF3E8', color: '#E85D00', cursor: 'pointer', fontWeight: 800 }}
                    >
                      🔊 Play
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ fontWeight: 800, color: '#202124', marginBottom: 8 }}>
                Comprehension Question: {listeningData.shortDialogue.question}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                {listeningData.shortDialogue.options.map((opt: string) => {
                  const picked = listeningAnswers['dialogue'] === opt;
                  const isCorrect = opt === listeningData.shortDialogue.correctOption;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setListeningAnswers({ ...listeningAnswers, dialogue: opt });
                        if (isCorrect) setListeningScore((s) => s + 20);
                      }}
                      style={{
                        padding: 12,
                        borderRadius: 12,
                        border: picked ? (isCorrect ? '2px solid #10B981' : '2px solid #EF4444') : '1px solid rgba(32,33,36,0.12)',
                        background: picked ? (isCorrect ? '#ECFDF5' : '#FEF2F2') : '#FFFFFF',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      {opt} {picked && (isCorrect ? '✅' : '❌')}
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 6: AI CONVERSATION PRACTICE (8 REAL-LIFE SCENARIOS)
         ===================================================================== */}
      {activeTab === 'conversation' && (
        <div>
          <section style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#202124', margin: 0 }}>
              💬 AI Conversation Roleplay ({currentLang.name})
            </h2>
            <p style={{ fontSize: '0.86rem', color: '#6B7280', margin: '4px 0 12px 0' }}>
              Select a real-life situation below and converse with your AI language partner using voice or text.
            </p>

            {/* 8 Scenario Selector Pills */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
              {scenarios.map((scen) => (
                <button
                  key={scen.id}
                  type="button"
                  onClick={() => {
                    setActiveScenarioId(scen.id);
                    updateScenarioStarter(scenarios, scen.id, selectedTargetLang);
                  }}
                  style={{
                    padding: '9px 14px',
                    borderRadius: 12,
                    border: activeScenarioId === scen.id ? '2px solid #FF6A00' : '1px solid rgba(32,33,36,0.1)',
                    background: activeScenarioId === scen.id ? '#FFF3E8' : '#FFFFFF',
                    color: activeScenarioId === scen.id ? '#E85D00' : '#202124',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {scen.icon} {scen.title}
                </button>
              ))}
            </div>
          </section>

          <section style={{ padding: 22, borderRadius: 22, background: '#FFFFFF', border: '1.5px solid rgba(255,106,0,0.18)', boxShadow: '0 10px 28px rgba(32,33,36,0.05)' }}>
            {/* Chat History */}
            <div style={{ maxHeight: 340, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, padding: 14, borderRadius: 16, background: '#FFFDFB', border: '1px solid rgba(255,106,0,0.12)', marginBottom: 14 }}>
              {conversationHistory.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: msg.role === 'student' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    padding: 14,
                    borderRadius: 16,
                    background: msg.role === 'student' ? 'linear-gradient(135deg, #FF6A00 0%, #E85D00 100%)' : '#FFFFFF',
                    color: msg.role === 'student' ? '#FFFFFF' : '#202124',
                    border: msg.role === 'student' ? 'none' : '1px solid rgba(255,106,0,0.18)',
                    boxShadow: msg.role === 'student' ? '0 6px 16px rgba(255,106,0,0.2)' : '0 4px 12px rgba(32,33,36,0.04)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <span style={{ fontWeight: 900, fontSize: '0.98rem' }}>{msg.text}</span>
                    {msg.role === 'ai' && (
                      <button
                        type="button"
                        onClick={() => speakText(msg.text, selectedTargetLang)}
                        style={{ border: '1px solid rgba(255,106,0,0.2)', background: '#FFF3E8', borderRadius: 8, padding: '4px 8px', cursor: 'pointer' }}
                      >
                        🔊
                      </button>
                    )}
                  </div>
                  {msg.romaji && <div style={{ fontSize: '0.8rem', color: msg.role === 'student' ? '#FFF3E8' : '#E85D00', fontStyle: 'italic', marginTop: 2 }}>{msg.romaji}</div>}
                  {msg.translation && (
                    <div style={{ fontSize: '0.82rem', color: msg.role === 'student' ? '#FFF3E8' : '#6B7280', marginTop: 4 }}>
                      {msg.translation}
                    </div>
                  )}
                  {msg.feedback && (
                    <div style={{ fontSize: '0.78rem', color: '#E85D00', marginTop: 6, fontWeight: 800 }}>
                      💡 {msg.feedback}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Helpful Suggested Response Chips */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6B7280', marginBottom: 6 }}>
                TAP A SUGGESTED RESPONSE OR TYPE YOUR OWN:
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {suggestedReplies.map((rep, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendConversation(rep)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: 10,
                      border: '1px solid rgba(255,106,0,0.25)',
                      background: '#FFF3E8',
                      color: '#E85D00',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {rep}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Input Bar */}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendConversation()}
                placeholder={`Reply in ${currentLang.name}...`}
                style={{ flex: 1, padding: '12px 16px', borderRadius: 12, border: '1.5px solid rgba(255,106,0,0.25)', fontSize: '0.92rem', outline: 'none' }}
              />
              <button
                type="button"
                onClick={() => handleSendConversation()}
                disabled={chatSending}
                style={{ padding: '12px 22px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #FF6A00 0%, #E85D00 100%)', color: '#FFFFFF', fontWeight: 900, cursor: 'pointer', boxShadow: '0 6px 16px rgba(255,106,0,0.22)' }}
              >
                {chatSending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* =====================================================================
          TAB 7: SCRIPTS, GRAMMAR & 8-STAGE CURRICULUM
         ===================================================================== */}
      {activeTab === 'curriculum' && (
        <div>
          {/* Interactive Script & Character Mastery Deck */}
          <section style={{ marginBottom: 26 }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#202124', margin: '0 0 6px 0' }}>
              ✍️ {currentLang.name} Script &amp; Phonetics Mastery ({currentLang.script_name})
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: '0 0 14px 0' }}>
              Tap any character card to hear its verified native sound and see an example word.
            </p>

            {scriptDecks.map((deck, dIdx) => (
              <div key={dIdx} style={{ marginBottom: 18, padding: 18, borderRadius: 18, background: '#FFFFFF', border: '1.5px solid rgba(255,106,0,0.16)', boxShadow: '0 8px 24px rgba(32,33,36,0.04)' }}>
                <div style={{ fontWeight: 900, fontSize: '1.05rem', color: '#FF6A00' }}>{deck.groupTitle}</div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: 12 }}>{deck.subtitle}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: 10 }}>
                  {deck.characters?.map((ch: any, cIdx: number) => (
                    <div
                      key={cIdx}
                      onClick={() => speakText(ch.char, selectedTargetLang, 0.85)}
                      style={{
                        padding: 12,
                        borderRadius: 14,
                        background: '#FFFDFB',
                        border: '1px solid rgba(255,106,0,0.16)',
                        textAlign: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#202124' }}>{ch.char}</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FF6A00' }}>[{ch.romanization}]</div>
                      <div style={{ fontSize: '0.76rem', color: '#202124', marginTop: 4, fontWeight: 700 }}>{ch.exampleWord}</div>
                      <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>{ch.meaning}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* 8 Progressive Stages Pathway */}
          <section>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#202124', marginBottom: 14 }}>
              📚 8 Progressive Stages of Fluency
            </h2>
            {curriculum?.stages ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {curriculum.stages.map((stage: any) => (
                  <div
                    key={stage.stage_number}
                    style={{
                      borderRadius: 18,
                      background: '#FFFFFF',
                      border: '1.5px solid rgba(255,106,0,0.16)',
                      padding: 20,
                      boxShadow: '0 6px 20px rgba(32,33,36,0.04)'
                    }}
                  >
                    <div style={{ fontWeight: 900, fontSize: '1.05rem', color: '#202124', marginBottom: 4 }}>
                      Stage {stage.stage_number}: {stage.title}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#6B7280', marginBottom: 12 }}>{stage.objective || stage.focus}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                      {stage.lessons?.map((lesson: any) => (
                        <div
                          key={lesson.lesson_number}
                          onClick={() => handleOpenLesson(stage.stage_number, lesson.lesson_number)}
                          style={{
                            padding: 14,
                            borderRadius: 14,
                            background: '#FFFDFB',
                            border: '1px solid rgba(255,106,0,0.16)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#202124' }}>
                              Lesson {lesson.lesson_number}: {lesson.title}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: 2 }}>{lesson.description || lesson.objective}</div>
                          </div>
                          <ChevronRight size={18} color="#FF6A00" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        </div>
      )}

      {/* =====================================================================
          TAB 8: LESSON STUDIO
         ===================================================================== */}
      {activeTab === 'lesson' && activeLesson && (
        <div>
          <div style={{ padding: 20, borderRadius: 18, background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF3E8 100%)', border: '1.5px solid rgba(255,106,0,0.24)', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FF6A00' }}>
                Stage {activeLesson.stage.stage_number} • Lesson {activeLesson.lesson.lesson_number}
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#202124', margin: '4px 0' }}>{activeLesson.lesson.title}</h2>
              <p style={{ fontSize: '0.86rem', color: '#6B7280', margin: 0 }}>{activeLesson.lesson.objective}</p>
            </div>
            <button
              type="button"
              onClick={handleCompleteLesson}
              style={{ padding: '10px 20px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #FF6A00 0%, #E85D00 100%)', color: '#FFFFFF', fontWeight: 800, cursor: 'pointer', boxShadow: '0 6px 16px rgba(255,106,0,0.22)' }}
            >
              ✓ Complete Lesson
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 24 }}>
            {activeLesson.lesson.vocabulary?.map((vocab: any, idx: number) => (
              <div key={idx} style={{ padding: 16, borderRadius: 16, background: '#FFFFFF', border: '1.5px solid rgba(255,106,0,0.16)', boxShadow: '0 6px 18px rgba(32,33,36,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#202124' }}>{vocab.term}</span>
                  <button type="button" onClick={() => speakText(vocab.term, selectedTargetLang)} style={{ border: '1px solid rgba(255,106,0,0.2)', background: '#FFF3E8', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer' }}>
                    🔊
                  </button>
                </div>
                {vocab.romanization && <div style={{ fontSize: '0.8rem', color: '#6B7280', fontStyle: 'italic' }}>{vocab.romanization}</div>}
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#FF6A00', marginTop: 4 }}>Meaning: {vocab.meaning}</div>
                {vocab.example_sentence && (
                  <div style={{ marginTop: 8, padding: 10, borderRadius: 10, background: '#FFFDFB', border: '1px solid rgba(255,106,0,0.12)', fontSize: '0.82rem' }}>
                    <div style={{ fontWeight: 700, color: '#202124' }}>{vocab.example_sentence}</div>
                    <div style={{ color: '#6B7280' }}>{vocab.sentence_meaning}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 9: LANGUAGE SELECTION & DIAGNOSTIC PLACEMENT
         ===================================================================== */}
      {activeTab === 'select' && (
        <div>
          <section style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#202124', margin: 0 }}>
              🌐 Choose Your Target Language &amp; Support Language
            </h2>
            <p style={{ fontSize: '0.86rem', color: '#6B7280', margin: '4px 0 0 0' }}>
              Your progress for each language is saved independently. Switch languages anytime without losing progress!
            </p>
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 16 }}>
            {languages.map((lang) => {
              const isSelected = selectedTargetLang === lang.code;
              return (
                <div
                  key={lang.code}
                  style={{
                    padding: 20,
                    borderRadius: 20,
                    background: isSelected ? '#FFF3E8' : '#FFFFFF',
                    border: isSelected ? '2px solid #FF6A00' : '1px solid rgba(32,33,36,0.1)',
                    boxShadow: isSelected ? '0 10px 26px rgba(255,106,0,0.14)' : '0 6px 18px rgba(32,33,36,0.04)'
                  }}
                >
                  <div style={{ fontSize: '2.4rem', marginBottom: 8 }}>{lang.flag_emoji}</div>
                  <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#202124' }}>
                    {lang.name} ({lang.native_name})
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#FF6A00', fontWeight: 700, marginTop: 2 }}>
                    Script: {lang.script_name}
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#6B7280', marginTop: 8 }}>{lang.description}</p>
                  <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                    <button
                      type="button"
                      onClick={() => {
                        handleEnrol(lang.code, selectedSupportLang);
                        setActiveTab('dashboard');
                      }}
                      style={{ flex: 1, padding: '10px 14px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #FF6A00 0%, #E85D00 100%)', color: '#FFFFFF', fontWeight: 800, cursor: 'pointer', boxShadow: '0 6px 16px rgba(255,106,0,0.22)' }}
                    >
                      Start / Switch
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTargetLang(lang.code);
                        setShowPlacementModal(true);
                      }}
                      style={{ padding: '10px 14px', borderRadius: 12, border: '1.5px solid rgba(255,106,0,0.25)', background: '#FFFFFF', color: '#202124', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Placement Test
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 10: CERTIFICATE OF COMPLETION
         ===================================================================== */}
      {activeTab === 'certificate' && certificateData && (
        <section style={{ maxWidth: 680, margin: '0 auto', padding: 32, borderRadius: 24, background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF3E8 100%)', border: '3px double #FF6A00', textAlign: 'center', boxShadow: '0 18px 42px rgba(255,106,0,0.14)' }}>
          <div style={{ fontSize: '3rem' }}>🏆</div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#202124' }}>Certificate of Fluency &amp; Mastery</h2>
          <p style={{ color: '#E85D00', fontWeight: 800 }}>{certificateData.certificate?.target_language_name} Course Completed</p>
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            style={{ marginTop: 16, padding: '10px 20px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #FF6A00 0%, #E85D00 100%)', color: '#FFFFFF', fontWeight: 800, cursor: 'pointer', boxShadow: '0 6px 16px rgba(255,106,0,0.22)' }}
          >
            Back to Dashboard
          </button>
        </section>
      )}

      {/* Placement Modal */}
      {showPlacementModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(32,33,36,0.52)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 9999 }}>
          <div style={{ maxWidth: 500, width: '100%', borderRadius: 24, background: '#FFFFFF', border: '1.5px solid rgba(255,106,0,0.25)', padding: 24, boxShadow: '0 24px 60px rgba(32,33,36,0.16)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontWeight: 900, color: '#202124' }}>Diagnostic Placement Test</h3>
              <button type="button" onClick={() => setShowPlacementModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X size={20} color="#6B7280" />
              </button>
            </div>
            {placementResult ? (
              <div style={{ textAlign: 'center', padding: 16 }}>
                <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#202124' }}>Recommended: Stage {placementResult.recommended_stage}</div>
                <p style={{ fontSize: '0.86rem', color: '#E85D00', fontWeight: 700 }}>{placementResult.reason}</p>
                <button
                  type="button"
                  onClick={() => {
                    setShowPlacementModal(false);
                    handleEnrol(selectedTargetLang, selectedSupportLang);
                    setActiveTab('dashboard');
                  }}
                  style={{ padding: '10px 20px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #FF6A00 0%, #E85D00 100%)', color: '#FFFFFF', fontWeight: 800, cursor: 'pointer' }}
                >
                  Begin Course
                </button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '0.86rem', color: '#6B7280' }}>How familiar are you with {currentLang.name}?</p>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  {['Complete beginner', 'Know basic words', 'Can form sentences'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setPlacementAnswers({ ...placementAnswers, 0: opt })}
                      style={{ flex: 1, padding: 10, borderRadius: 10, border: placementAnswers[0] === opt ? '2px solid #FF6A00' : '1px solid rgba(32,33,36,0.15)', background: placementAnswers[0] === opt ? '#FFF3E8' : '#FFFFFF', color: placementAnswers[0] === opt ? '#E85D00' : '#202124', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleRunPlacementTest}
                  style={{ width: '100%', padding: 12, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #FF6A00 0%, #E85D00 100%)', color: '#FFFFFF', fontWeight: 800, cursor: 'pointer', boxShadow: '0 6px 16px rgba(255,106,0,0.22)' }}
                >
                  Evaluate My Level
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
