import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X, Volume2, Mic, MicOff, CheckCircle2, RotateCcw,
  Sparkles, Trophy, ArrowRight, Globe, MessageSquare
} from 'lucide-react';
import { useLearning } from '../../context/LearningContext';

export interface SpeakingPracticeGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLanguage?: string;
  initialTopic?: string;
}

interface SpeakingPrompt {
  phrase: string;
  romanization?: string;
  meaning: string;
  phoneticTip: string;
  category: string;
}

interface LanguageDeck {
  code: string;
  bcp47: string;
  name: string;
  nativeName: string;
  flag: string;
  prompts: SpeakingPrompt[];
}

const LANGUAGE_DECKS: Record<string, LanguageDeck> = {
  en: {
    code: 'en',
    bcp47: 'en-US',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    prompts: [
      {
        phrase: 'Knowledge grows when we ask thoughtful questions.',
        meaning: 'Expressing curiosity in academic discussion',
        phoneticTip: 'Stress "KNOW-ledge", "THOUGHT-ful", and "QUES-tions" clearly.',
        category: 'Fluency'
      },
      {
        phrase: 'Photosynthesis converts light energy into chemical energy.',
        meaning: 'Explaining a core biology concept clearly',
        phoneticTip: 'Break into pho-to-SYN-the-sis and con-VERTS.',
        category: 'Academic'
      },
      {
        phrase: 'Could you please explain that step once more?',
        meaning: 'Polite classroom clarification',
        phoneticTip: 'Use a gentle rising intonation at the end.',
        category: 'Conversation'
      },
      {
        phrase: 'Consistent daily practice builds lasting confidence.',
        meaning: 'Motivational speaking practice',
        phoneticTip: 'Pronounce the final "t" in "consistent" and "t" in "lasting".',
        category: 'Pronunciation'
      },
      {
        phrase: 'Every experiment teaches us something valuable.',
        meaning: 'Scientific mindset statement',
        phoneticTip: 'Enunciate ex-PER-i-ment and VAL-u-a-ble.',
        category: 'Academic'
      }
    ]
  },
  te: {
    code: 'te',
    bcp47: 'te-IN',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flag: '🇮🇳',
    prompts: [
      {
        phrase: 'నమస్కారం, మీరు ఎలా ఉన్నారు?',
        romanization: 'Namaskaram, meeru ela unnaru?',
        meaning: 'Hello, how are you?',
        phoneticTip: 'Keep the "aa" in Na-mas-KAA-ram smooth and unhurried.',
        category: 'Greetings'
      },
      {
        phrase: 'నేను ఈ రోజు కొత్త విషయాలు నేర్చుకుంటున్నాను.',
        romanization: 'Nenu ee roju kotta vishayalu nerchukuntunnanu.',
        meaning: 'I am learning new things today.',
        phoneticTip: 'Stress "ner-chu-kun-tun-NAA-nu" clearly.',
        category: 'Learning'
      },
      {
        phrase: 'దయచేసి మళ్ళీ నెమ్మదిగా చెప్పండి.',
        romanization: 'Dayachesi malli nemmadiga cheppandi.',
        meaning: 'Please say that again slowly.',
        phoneticTip: 'Soften "dayachesi" and pause slightly before "nemmadiga".',
        category: 'Conversation'
      },
      {
        phrase: 'విద్య మన జీవితాన్ని వెలిగిస్తుంది.',
        romanization: 'Vidya mana jeevithanni veligisthundi.',
        meaning: 'Education illuminates our life.',
        phoneticTip: 'Pronounce "Vid-ya" crisply with a soft dental "d".',
        category: 'Wisdom'
      },
      {
        phrase: 'ధన్యవాదాలు, నాకు బాగా అర్థమైంది.',
        romanization: 'Dhanyavadalu, naku baga arthamaindi.',
        meaning: 'Thank you, I understood well.',
        phoneticTip: 'Aspirate "Dha" in Dhanyavadalu.',
        category: 'Gratitude'
      }
    ]
  },
  hi: {
    code: 'hi',
    bcp47: 'hi-IN',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    prompts: [
      {
        phrase: 'नमस्ते, आज हम एक नया विषय सीखेंगे।',
        romanization: 'Namaste, aaj hum ek naya vishay seekhenge.',
        meaning: 'Hello, today we will learn a new topic.',
        phoneticTip: 'Keep "seekhenge" nasalized lightly on the final syllable.',
        category: 'Classroom'
      },
      {
        phrase: 'कृपया इसे फिर से समझाइए।',
        romanization: 'Kripaya ise phir se samjhaiye.',
        meaning: 'Please explain this again.',
        phoneticTip: 'Pronounce "phir" with a clean aspirated p+h sound.',
        category: 'Conversation'
      },
      {
        phrase: 'निरंतर अभ्यास से सफलता मिलती है।',
        romanization: 'Nirantar abhyas se safalta milti hai.',
        meaning: 'Success comes from continuous practice.',
        phoneticTip: 'Separate "abh-yaas" clearly without rushing.',
        category: 'Motivation'
      },
      {
        phrase: 'मुझे विज्ञान और गणित पढ़ना पसंद है।',
        romanization: 'Mujhe vigyan aur ganit padhna pasand hai.',
        meaning: 'I like studying science and mathematics.',
        phoneticTip: 'Retroflex "d" in "ganit" and "padhna".',
        category: 'Academics'
      },
      {
        phrase: 'धन्यवाद, यह बहुत उपयोगी जानकारी थी।',
        romanization: 'Dhanyavaad, yah bahut upyogi jaankari thi.',
        meaning: 'Thank you, this was very useful information.',
        phoneticTip: 'Long "aa" in "jaan-kaa-ri".',
        category: 'Gratitude'
      }
    ]
  },
  ja: {
    code: 'ja',
    bcp47: 'ja-JP',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    prompts: [
      {
        phrase: 'おはようございます。今日も頑張りましょう。',
        romanization: 'Ohayou gozaimasu. Kyou mo ganbarimashou.',
        meaning: 'Good morning. Let us do our best today.',
        phoneticTip: 'Give equal timing to every mora: o-ha-yo-u go-za-i-ma-su.',
        category: 'Greetings'
      },
      {
        phrase: 'もう一度ゆっくり言ってください。',
        romanization: 'Mou ichido yukkuri itte kudasai.',
        meaning: 'Please say that again slowly.',
        phoneticTip: 'Hold the double consonant pause in "yuk-kuri" and "it-te".',
        category: 'Conversation'
      },
      {
        phrase: 'これはとても面白い質問ですね。',
        romanization: 'Kore wa totemo omoshiroi shitsumon desu ne.',
        meaning: 'That is a very interesting question.',
        phoneticTip: 'Devoice the final "u" in "desu" smoothly.',
        category: 'Classroom'
      },
      {
        phrase: '毎日少しずつ練習しています。',
        romanization: 'Mainichi sukoshi zutsu renshuu shite imasu.',
        meaning: 'I practice little by little every day.',
        phoneticTip: 'Keep "su" light in "sukoshi" and lengthen "ren-shuu".',
        category: 'Study'
      },
      {
        phrase: 'ありがとうございます、よく分かりました。',
        romanization: 'Arigatou gozaimasu, yoku wakarimashita.',
        meaning: 'Thank you, I understood well.',
        phoneticTip: 'Soft tap for Japanese "r" in "ari-ga-tou" and "waka-ri-ma-shita".',
        category: 'Gratitude'
      }
    ]
  },
  fr: {
    code: 'fr',
    bcp47: 'fr-FR',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    prompts: [
      {
        phrase: 'Bonjour, comment allez-vous aujourd’hui ?',
        romanization: 'Bon-zhoor, ko-mahn ta-lay-voo oh-zhoor-dwee?',
        meaning: 'Hello, how are you today?',
        phoneticTip: 'Link "comment" and "allez" with a subtle "t" liaison.',
        category: 'Greetings'
      },
      {
        phrase: 'Pouvez-vous répéter plus lentement, s’il vous plaît ?',
        romanization: 'Poo-vay-voo ray-pay-tay ploo lahnt-mahn, seel voo play?',
        meaning: 'Can you repeat more slowly, please?',
        phoneticTip: 'Keep final consonants light and nasalize "len-te-ment".',
        category: 'Conversation'
      },
      {
        phrase: 'J’aime apprendre les sciences et les langues.',
        romanization: 'Zhem a-prahndr lay syahns ay lay lahng.',
        meaning: 'I like learning sciences and languages.',
        phoneticTip: 'Rounded vowel in "les" and soft "j" in "j’aime".',
        category: 'Study'
      },
      {
        phrase: 'La pratique quotidienne rend la parole naturelle.',
        romanization: 'La pra-teek ko-tee-dyen rahn la pa-rol na-too-rel.',
        meaning: 'Daily practice makes speaking natural.',
        phoneticTip: 'Use a gentle uvular "r" in "pratique" and "parole".',
        category: 'Fluency'
      },
      {
        phrase: 'Merci beaucoup pour votre explication claire.',
        romanization: 'Mehr-see bo-koo poor vo-tr ek-splee-ka-syohn klair.',
        meaning: 'Thank you very much for your clear explanation.',
        phoneticTip: 'Nasalize "-tion" cleanly at the end of "explication".',
        category: 'Gratitude'
      }
    ]
  },
  de: {
    code: 'de',
    bcp47: 'de-DE',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    prompts: [
      {
        phrase: 'Guten Tag, ich lerne heute etwas Neues.',
        romanization: 'Goo-ten Tahg, ikh ler-ne hoy-te et-vas Noy-es.',
        meaning: 'Good day, I am learning something new today.',
        phoneticTip: 'Pronounce "eu" in "heute" and "Neues" like "oy".',
        category: 'Classroom'
      },
      {
        phrase: 'Können Sie das bitte langsamer wiederholen?',
        romanization: 'Koen-nen zee das bit-te lang-zaa-mer vee-der-ho-len?',
        meaning: 'Could you please repeat that more slowly?',
        phoneticTip: 'Round your lips for "ö" in "Können" and pronounce "w" like English "v".',
        category: 'Conversation'
      },
      {
        phrase: 'Übung macht den Meister.',
        romanization: 'Ue-bung makht den Mys-ter.',
        meaning: 'Practice makes the master.',
        phoneticTip: 'Round lips for "Ü" and use a soft guttural "ch" in "macht".',
        category: 'Proverb'
      },
      {
        phrase: 'Wissenschaft hilft uns, die Welt zu verstehen.',
        romanization: 'Vis-sen-shaft hilft oons, dee Velt tsoo fer-shtay-en.',
        meaning: 'Science helps us understand the world.',
        phoneticTip: '"st" in "verstehen" sounds like "sht".',
        category: 'Academics'
      },
      {
        phrase: 'Vielen Dank, das war sehr hilfreich.',
        romanization: 'Fee-len Dank, das vaar zair hilf-rykh.',
        meaning: 'Thank you very much, that was very helpful.',
        phoneticTip: '"v" in "Vielen" sounds like English "f".',
        category: 'Gratitude'
      }
    ]
  }
};

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function computeSpeechMatchScore(expected: string, romanization: string | undefined, spoken: string): number {
  const cleanSpoken = normalizeText(spoken);
  if (!cleanSpoken) return 0;

  const targetVariants = [normalizeText(expected)];
  if (romanization) targetVariants.push(normalizeText(romanization));

  let best = 0;
  for (const target of targetVariants) {
    if (!target) continue;
    if (cleanSpoken === target) return 100;
    const expectedWords = target.split(' ').filter(Boolean);
    const spokenWords = cleanSpoken.split(' ').filter(Boolean);
    if (expectedWords.length === 0) continue;

    let matched = 0;
    for (const ew of expectedWords) {
      if (spokenWords.some((sw) => sw === ew || (ew.length > 3 && (sw.includes(ew) || ew.includes(sw))))) {
        matched += 1;
      }
    }
    const wordScore = Math.round((matched / expectedWords.length) * 100);
    if (wordScore > best) best = wordScore;
  }
  return Math.min(100, Math.max(best, cleanSpoken.length >= 4 ? 35 : 0));
}

export const SpeakingPracticeGameModal: React.FC<SpeakingPracticeGameModalProps> = ({
  isOpen,
  onClose,
  initialLanguage = 'en',
  initialTopic
}) => {
  const { apiFetch, studentId } = useLearning();
  const normalizedInitial = LANGUAGE_DECKS[initialLanguage] ? initialLanguage : 'en';
  const [selectedLang, setSelectedLang] = useState<string>(normalizedInitial);
  const [promptIdx, setPromptIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [typedFallback, setTypedFallback] = useState('');
  const [feedback, setFeedback] = useState<{ score: number; message: string; passed: boolean } | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [gameCompleted, setGameCompleted] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      const lang = LANGUAGE_DECKS[initialLanguage] ? initialLanguage : 'en';
      setSelectedLang(lang);
      setPromptIdx(0);
      setScore(0);
      setStreak(0);
      setCompletedCount(0);
      setTranscript('');
      setTypedFallback('');
      setFeedback(null);
      setGameCompleted(false);
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setSpeechSupported(Boolean(SpeechRec));
    }
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* ignore */ }
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen, initialLanguage]);

  const deck = LANGUAGE_DECKS[selectedLang] || LANGUAGE_DECKS.en;
  const currentPrompt = deck.prompts[promptIdx] || deck.prompts[0];

  const handleListen = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentPrompt.phrase);
    utterance.lang = deck.bcp47;
    utterance.rate = 0.88;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [currentPrompt.phrase, deck.bcp47]);

  const evaluateAttempt = useCallback((spokenText: string) => {
    const matchScore = computeSpeechMatchScore(
      currentPrompt.phrase,
      currentPrompt.romanization,
      spokenText
    );
    const passed = matchScore >= 60;
    const earned = passed ? 25 + Math.round(matchScore / 10) : 5;

    setScore((prev) => prev + earned);
    setStreak((prev) => (passed ? prev + 1 : 0));
    setCompletedCount((prev) => prev + 1);
    setFeedback({
      score: matchScore,
      passed,
      message: passed
        ? matchScore >= 85
          ? 'Excellent pronunciation and rhythm!'
          : 'Great effort! Clear enough to be understood.'
        : 'Good try! Listen to the model voice once more and focus on the phonetic tip.'
    });
  }, [currentPrompt]);

  const handleToggleMic = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setSpeechSupported(false);
      return;
    }

    if (isListening && recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      setIsListening(false);
      return;
    }

    try {
      const rec = new SpeechRec();
      rec.lang = deck.bcp47;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      recognitionRef.current = rec;
      setTranscript('');
      setFeedback(null);
      setIsListening(true);

      let latestTranscript = '';
      rec.onresult = (event: any) => {
        let text = '';
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript + ' ';
        }
        latestTranscript = text.trim();
        setTranscript(latestTranscript);
      };
      rec.onerror = () => {
        setIsListening(false);
      };
      rec.onend = () => {
        setIsListening(false);
        if (latestTranscript.trim()) {
          evaluateAttempt(latestTranscript);
        }
      };
      rec.start();
    } catch {
      setIsListening(false);
      setSpeechSupported(false);
    }
  };

  const handleSubmitTypedFallback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedFallback.trim()) return;
    setTranscript(typedFallback.trim());
    evaluateAttempt(typedFallback.trim());
  };

  const handleNextPrompt = async () => {
    if (promptIdx + 1 >= deck.prompts.length) {
      setGameCompleted(true);
      try {
        await apiFetch('/api/educational-games/war-of-words/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: studentId || 'student-1',
            score,
            correctCount: Math.max(1, completedCount),
            totalQuestions: deck.prompts.length,
            topic: initialTopic ? `${deck.name}: ${initialTopic}` : `Speaking Arena — ${deck.name}`,
            levelReached: 1,
            bestStreak: streak
          })
        });
      } catch {
        // Non-blocking score persistence
      }
      return;
    }
    setPromptIdx((prev) => prev + 1);
    setTranscript('');
    setTypedFallback('');
    setFeedback(null);
  };

  const handleRestart = () => {
    setPromptIdx(0);
    setScore(0);
    setStreak(0);
    setCompletedCount(0);
    setTranscript('');
    setTypedFallback('');
    setFeedback(null);
    setGameCompleted(false);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.78)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 720,
          maxHeight: '92vh',
          overflowY: 'auto',
          background: '#FFFFFF',
          borderRadius: 24,
          boxShadow: '0 24px 60px rgba(15, 23, 42, 0.35)',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0F172A, #1E293B)',
            color: '#FFFFFF',
            padding: '18px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #F97316, #EA580C)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Mic size={22} color="#FFFFFF" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                Speaking &amp; Pronunciation Arena
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#CBD5E1' }}>
                {deck.flag} {deck.name} ({deck.nativeName})
                {initialTopic ? ` • ${initialTopic}` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close speaking game"
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: 'none',
              color: '#FFFFFF',
              width: 36,
              height: 36,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Language Switcher & Stats */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid #E2E8F0',
            background: '#F8FAFC',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            <Globe size={15} color="#64748B" />
            {Object.values(LANGUAGE_DECKS).map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setSelectedLang(lang.code);
                  setPromptIdx(0);
                  setTranscript('');
                  setTypedFallback('');
                  setFeedback(null);
                  setGameCompleted(false);
                }}
                style={{
                  padding: '5px 10px',
                  borderRadius: 999,
                  border: selectedLang === lang.code ? '1.5px solid #F97316' : '1px solid #CBD5E1',
                  background: selectedLang === lang.code ? '#FFF7ED' : '#FFFFFF',
                  color: selectedLang === lang.code ? '#C2410C' : '#334155',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {lang.flag} {lang.name}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, fontSize: '0.82rem', fontWeight: 700 }}>
            <span style={{ color: '#0F172A' }}>Score: {score}</span>
            <span style={{ color: '#EA580C' }}>Streak: {streak}🔥</span>
            <span style={{ color: '#475569' }}>
              {Math.min(promptIdx + 1, deck.prompts.length)}/{deck.prompts.length}
            </span>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '22px' }}>
          {gameCompleted ? (
            <div style={{ textAlign: 'center', padding: '24px 12px' }}>
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: '50%',
                  background: '#FEF3C7',
                  color: '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px'
                }}
              >
                <Trophy size={34} />
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '1.35rem', fontWeight: 800, color: '#0F172A' }}>
                Speaking Session Complete!
              </h3>
              <p style={{ margin: '0 0 20px', color: '#475569', fontSize: '0.95rem' }}>
                You practiced {deck.prompts.length} {deck.name} phrases and earned <strong>{score} XP</strong>.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                <button
                  onClick={handleRestart}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 12,
                    border: 'none',
                    background: 'linear-gradient(135deg, #F97316, #EA580C)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <RotateCcw size={16} /> Practice Again
                </button>
                <button
                  onClick={onClose}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 12,
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#334155',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Back to Hub
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Prompt Card */}
              <div
                style={{
                  padding: '20px',
                  borderRadius: 18,
                  background: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)',
                  border: '1px solid #FED7AA'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#C2410C',
                      background: '#FFFFFF',
                      padding: '4px 10px',
                      borderRadius: 999
                    }}
                  >
                    {currentPrompt.category}
                  </span>
                  <button
                    onClick={handleListen}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 10,
                      border: 'none',
                      background: isSpeaking ? '#EA580C' : '#0F172A',
                      color: '#FFFFFF',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Volume2 size={15} />
                    {isSpeaking ? 'Speaking...' : 'Listen to Model'}
                  </button>
                </div>

                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.45, marginBottom: 6 }}>
                  {currentPrompt.phrase}
                </div>
                {currentPrompt.romanization && (
                  <div style={{ fontSize: '0.92rem', color: '#9A3412', fontWeight: 600, marginBottom: 6 }}>
                    {currentPrompt.romanization}
                  </div>
                )}
                <div style={{ fontSize: '0.88rem', color: '#475569' }}>
                  <strong>Meaning:</strong> {currentPrompt.meaning}
                </div>
              </div>

              {/* Phonetic Tip */}
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  color: '#166534',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8
                }}
              >
                <Sparkles size={16} style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <strong>Pronunciation Tip:</strong> {currentPrompt.phoneticTip}
                </div>
              </div>

              {/* Voice Input Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {speechSupported && (
                  <button
                    onClick={handleToggleMic}
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      borderRadius: 14,
                      border: 'none',
                      background: isListening
                        ? 'linear-gradient(135deg, #DC2626, #B91C1C)'
                        : 'linear-gradient(135deg, #F97316, #EA580C)',
                      color: '#FFFFFF',
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10
                    }}
                  >
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    {isListening ? 'Listening... Tap to Stop & Check' : 'Tap Microphone & Speak Phrase'}
                  </button>
                )}

                {!speechSupported && (
                  <div style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MessageSquare size={14} />
                    Live microphone recognition is unavailable in this browser; use Listen + type practice below.
                  </div>
                )}

                {/* Always-available text practice fallback */}
                <form onSubmit={handleSubmitTypedFallback} style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={typedFallback}
                    onChange={(e) => setTypedFallback(e.target.value)}
                    placeholder={
                      currentPrompt.romanization
                        ? `Or type phrase / romanization (${currentPrompt.romanization})...`
                        : 'Or type what you practiced to verify...'
                    }
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: 12,
                      border: '1px solid #CBD5E1',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '10px 16px',
                      borderRadius: 12,
                      border: 'none',
                      background: '#0F172A',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Check
                  </button>
                </form>
              </div>

              {/* Transcript & Feedback */}
              {transcript && (
                <div style={{ padding: '12px 14px', borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: '0.88rem' }}>
                  <strong style={{ color: '#475569' }}>Your attempt:</strong>{' '}
                  <span style={{ color: '#0F172A' }}>{transcript}</span>
                </div>
              )}

              {feedback && (
                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: 14,
                    background: feedback.passed ? '#ECFDF5' : '#FEF3C7',
                    border: `1px solid ${feedback.passed ? '#6EE7B7' : '#FCD34D'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle2 size={20} color={feedback.passed ? '#059669' : '#D97706'} />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0F172A' }}>
                        Match Score: {feedback.score}%
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#334155' }}>{feedback.message}</div>
                    </div>
                  </div>
                  <button
                    onClick={handleNextPrompt}
                    style={{
                      padding: '9px 16px',
                      borderRadius: 10,
                      border: 'none',
                      background: '#0F172A',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    {promptIdx + 1 >= deck.prompts.length ? 'Finish Session' : 'Next Phrase'}
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
