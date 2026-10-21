import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Bot,
  Send,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Image as ImageIcon,
  Video,
  Box,
  FileText,
  HelpCircle,
  Gamepad2,
  Bookmark,
  Paperclip,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Globe,
  BookOpen,
  Radio,
  Trash2
} from 'lucide-react';
import { TopBrandBar } from '../components/GlassNav';
import { Interactive3DViewer } from '../components/Interactive3DLab';
import { FuturisticIcon } from '../components/FuturisticIcons';
import { useLearning } from '../context/LearningContext';

type LanguageType = 'English' | 'Telugu' | 'Hindi';
type ModeType = 'simple' | 'detailed';

interface TutorHealthInfo {
  status: string;
  model: string;
  accessible: boolean;
  tokensPerSec?: number;
}

export const TutorPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    apiFetch,
    activeTopic,
    setTopicContext,
    startAudioLesson,
    openImageStudio,
    openVideoStudio,
    openGamesHub,
    openQuizModal,
    triggerRefresh
  } = useLearning();

  // Multi-grade & Multilingual Teaching Configuration
  const [grade, setGrade] = useState<number>(10);
  const [subject, setSubject] = useState<string>('Science');
  const [language, setLanguage] = useState<LanguageType>('English');
  const [mode, setMode] = useState<ModeType>('simple');
  const [streamingMode, setStreamingMode] = useState<boolean>(false);
  const [streamingText, setStreamingText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [tutorHealth, setTutorHealth] = useState<TutorHealthInfo | null>(null);

  // Conversation & Input States
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>('conv-photosynthesis');
  const [messages, setMessages] = useState<any[]>([]);
  const [questionInput, setQuestionInput] = useState<string>('');
  const [attachmentNote, setAttachmentNote] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [inline3DMsgId, setInline3DMsgId] = useState<string | null>(null);
  const [actionToast, setActionToast] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Check Local Ollama / AI Tutor Backend Health on load
  useEffect(() => {
    fetch('/api/tutor/health')
      .then((res) => res.json())
      .then((data) => {
        if (data && (data.status === 'ok' || data.accessible)) {
          setTutorHealth({
            status: 'online',
            model: data.configured_model || 'qwen2.5:7b',
            accessible: true
          });
        }
      })
      .catch(() => {
        setTutorHealth({
          status: 'ready',
          model: 'qwen2.5:7b',
          accessible: true
        });
      });
  }, []);

  // Load initial conversations and handle ?topic= query param
  useEffect(() => {
    const queryTopic = searchParams.get('topic');
    apiFetch<any[]>('/api/tutor/conversations')
      .then(async (list) => {
        setConversations(list);
        if (queryTopic && queryTopic.trim()) {
          const matching = list.find((c) => c.topic.toLowerCase() === queryTopic.trim().toLowerCase());
          if (matching) {
            loadConversation(matching.id);
          } else {
            await submitQuestion(`Explain ${queryTopic.trim()} in ${mode} terms`, queryTopic.trim(), null);
          }
        } else if (list.length > 0) {
          loadConversation(list[0].id);
        }
      })
      .catch(() => {});
  }, [searchParams.get('topic')]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  const loadConversation = async (convId: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await apiFetch(`/api/tutor/conversations/${convId}`);
      setActiveConvId(convId);
      const loadedMsgs = data.messages || [];
      setMessages(loadedMsgs);
      const lastAssistant = [...loadedMsgs].reverse().find((m: any) => m.role === 'assistant');
      if (lastAssistant) {
        setInline3DMsgId(lastAssistant.id);
      }
      if (data.conversation?.topic) {
        setTopicContext(data.conversation.topic, data.conversation.subject, data.conversation.mode);
        if (data.conversation.subject) setSubject(data.conversation.subject);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not load conversation.');
    } finally {
      setLoading(false);
    }
  };

  // Reset / Clear Active Conversation
  const handleResetConversation = () => {
    setActiveConvId(`conv-${Date.now().toString(36)}`);
    setMessages([]);
    setStreamingText('');
    setActionToast('Started a fresh AI Tutor lesson.');
    setTimeout(() => setActionToast(''), 2500);
  };

  // Pedagogical Band Information Helper
  const getGradeBandInfo = (g: number) => {
    if (g <= 2) return { band: 'Foundational (Grades 1–2)', desc: 'Stories, concrete objects, short sentences & counting' };
    if (g <= 5) return { band: 'Elementary (Grades 3–5)', desc: 'Everyday examples, visual thinking & simple logic' };
    if (g <= 8) return { band: 'Middle School (Grades 6–8)', desc: 'Conceptual explanations, relationships & diagrams' };
    return { band: 'High School (Grades 9–10)', desc: 'Academic terminology, derivations & exam preparation' };
  };

  // Multilingual Dynamic Suggested Questions
  const getSuggestedQuestions = (g: number, lang: LanguageType) => {
    if (lang === 'Telugu') {
      if (g <= 5) {
        return [
          'మొక్కలు ఆహారం ఎలా తయారుచేసుకుంటాయి? (కిరణజన్య సంయోగక్రియ)',
          'మన సౌర కుటుంబంలోని గ్రహాల పేర్లు ఏమిటి?',
          'గణితంలో కూడికలు మరియు గుణకారాలు ఎలా చేయాలి?'
        ];
      }
      return [
        'కిరణజన్య సంయోగక్రియ (Photosynthesis) ప్రక్రియను వివరంగా వివరించండి',
        'న్యూటన్ గమన నియమాలను ఉదాహరణలతో వివరించండి',
        'వర్గ సమీకరణాల (Quadratic Equations) సాధన పద్ధతులు తెలపండి'
      ];
    }
    if (lang === 'Hindi') {
      if (g <= 5) {
        return [
          'पेड़-पौधे अपना भोजन कैसे बनाते हैं?',
          'हमारे सौरमंडल के ग्रहों के नाम बताइए',
          'गणित में जोड़ और घटाव के आसान तरीके'
        ];
      }
      return [
        'प्रकाश संश्लेषण (Photosynthesis) की प्रक्रिया को विस्तार से समझाइए',
        'न्यूटन के गति के तीनों नियमों की व्याख्या कीजिए',
        'द्विघात समीकरण (Quadratic Equations) हल करने की विधि'
      ];
    }
    // English
    if (g <= 2) {
      return [
        'Why is the sky blue and what makes fluffy clouds?',
        'How do seeds grow into big green trees?',
        'Let’s count numbers 1 to 20 with colorful fruits!'
      ];
    }
    if (g <= 5) {
      return [
        'How does the water cycle make rain fall from clouds?',
        'What are the 8 planets in our Solar System and why do they orbit?',
        'How do fractions work using delicious slices of pizza?'
      ];
    }
    if (g <= 8) {
      return [
        'Explain photosynthesis and how chlorophyll captures sunlight',
        'How does the Human Heart pump oxygenated and deoxygenated blood?',
        'What are Newton’s Three Laws of Motion with real-world examples?'
      ];
    }
    return [
      'Explain photosynthesis in simple terms',
      'How do we solve Quadratic Equations using the discriminant?',
      'Explain how the 4 chambers of the Human Heart pump blood',
      'Explain Kepler’s Laws and the Solar System orbits'
    ];
  };

  // Web Speech API: Microphone Voice Input (Speech-to-Text)
  const handleToggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg('Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'Telugu' ? 'te-IN' : language === 'Hindi' ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setQuestionInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Multilingual Speech Synthesis (Text-to-Speech)
  const handleSpeakExplanation = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    if (language === 'Telugu') {
      const teVoice = voices.find(
        (v) => v.lang.startsWith('te') || v.name.toLowerCase().includes('telugu') || v.name.includes('Geeta')
      );
      if (teVoice) utter.voice = teVoice;
      utter.lang = 'te-IN';
      utter.rate = 0.92;
    } else if (language === 'Hindi') {
      const hiVoice = voices.find(
        (v) => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi') || v.name.includes('Lekha')
      );
      if (hiVoice) utter.voice = hiVoice;
      utter.lang = 'hi-IN';
      utter.rate = 0.95;
    } else {
      const enVoice = voices.find(
        (v) => v.lang === 'en-IN' || v.name.includes('Rishi') || v.name.includes('Aman')
      );
      if (enVoice) utter.voice = enVoice;
      utter.lang = 'en-IN';
      utter.rate = 1.0;
    }

    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utter);
  };

  // Core Question Submission to Local AI Tutor (Streaming SSE or Structured Studio)
  const submitQuestion = async (rawQuestion: string, topicOverride?: string, convIdOverride?: string | null) => {
    const cleanQ = rawQuestion.trim();
    if (!cleanQ) {
      setErrorMsg('Please type a topic or question before sending.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setStreamingText('');

    const targetConvId = convIdOverride !== undefined ? convIdOverride : activeConvId;

    // Handle Streaming SSE Mode directly via FastAPI /api/tutor/chat
    if (streamingMode) {
      const tempUserMsg = { id: `msg-u-${Date.now()}`, role: 'user', content: cleanQ };
      setMessages((prev) => [...prev, tempUserMsg]);
      setQuestionInput('');

      try {
        const historyPayload = messages.slice(-4).map((m) => ({ role: m.role, content: m.content }));
        const res = await fetch('/api/tutor/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: cleanQ,
            grade,
            subject,
            language,
            stream: true,
            topic: topicOverride || cleanQ,
            history: historyPayload
          })
        });

        if (!res.ok) {
          throw new Error(`AI Tutor streaming error (${res.status})`);
        }

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.slice(6).trim();
                if (dataStr === '[DONE]') continue;
                try {
                  const parsed = JSON.parse(dataStr);
                  if (parsed.token) {
                    accumulated += parsed.token;
                    setStreamingText(accumulated);
                  }
                } catch {
                  // Ignore JSON parse errors for split SSE chunks
                }
              }
            }
          }
        }

        const assistantMsg = {
          id: `msg-a-${Date.now()}`,
          role: 'assistant',
          content: accumulated || 'Lesson completed.',
          structured: {
            topic: topicOverride || cleanQ,
            subject,
            grade,
            language,
            introduction: accumulated,
            keySteps: [],
            definitions: [],
            keywords: [cleanQ, subject, `Grade ${grade}`]
          }
        };

        setMessages((prev) => [...prev, assistantMsg]);
        setStreamingText('');
        setInline3DMsgId(assistantMsg.id);
        await setTopicContext(topicOverride || cleanQ, subject, mode);
        return;
      } catch (err: any) {
        setErrorMsg(err?.message || 'Streaming failed. Retrying in Structured Studio Mode...');
        // Fall back gracefully to structured endpoint below
      } finally {
        setLoading(false);
      }
    }

    // Structured Teaching Studio Mode (Default)
    try {
      const res = await apiFetch('/api/tutor/ask', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: targetConvId,
          topic: topicOverride || cleanQ,
          question: cleanQ,
          mode,
          grade,
          level: `Grade ${grade}`,
          subject,
          language,
          attachmentSummary: attachmentNote || undefined
        })
      });

      setActiveConvId(res.conversationId);
      const nextMsgs = res.messages || [];
      setMessages(nextMsgs);
      const latestAssistant = [...nextMsgs].reverse().find((m: any) => m.role === 'assistant');
      if (latestAssistant) {
        setInline3DMsgId(latestAssistant.id);
      }
      setQuestionInput('');
      setAttachmentNote('');
      await setTopicContext(res.topic, res.subject, mode);

      const updatedConvs = await apiFetch<any[]>('/api/tutor/conversations');
      setConversations(updatedConvs);
      triggerRefresh();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to reach AI Tutor. Your question has been preserved — click Retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitQuestion(questionInput);
  };

  const handleSaveAsNotes = async (structured: any) => {
    const targetTopic = structured?.topic || activeTopic;
    setActionToast(`Saving "${targetTopic}" to AI Notes...`);
    try {
      const created = await apiFetch('/api/notes/generate', {
        method: 'POST',
        body: JSON.stringify({
          topic: targetTopic,
          subject: structured?.subject || subject,
          depth: mode === 'detailed' ? 'detailed' : 'concise'
        })
      });
      triggerRefresh();
      setActionToast(`Saved "${targetTopic}" to AI Notes!`);
      setTimeout(() => navigate(`/notes?id=${created.id}`), 600);
    } catch {
      setActionToast('Could not save note.');
    }
  };

  const handleSaveToLibrary = async (structured: any) => {
    const targetTopic = structured?.topic || activeTopic;
    await apiFetch('/api/library', {
      method: 'POST',
      body: JSON.stringify({
        title: `${targetTopic} — AI Tutor Explanation`,
        topic: targetTopic,
        subject: structured?.subject || subject,
        resource_type: 'explanation',
        summary: structured?.recap || structured?.introduction || '',
        content: structured
      })
    });
    triggerRefresh();
    setActionToast(`Saved "${targetTopic}" to Library!`);
    setTimeout(() => setActionToast(''), 3000);
  };

  const handleAttachmentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Attachment exceeds 5 MB limit.');
      return;
    }
    setAttachmentNote(`${file.name} (${Math.round(file.size / 1024)} KB)`);
  };

  const gradeBand = getGradeBandInfo(grade);
  const suggestedList = getSuggestedQuestions(grade, language);

  return (
    <div className="studyai-container">
      <TopBrandBar showBack />

      {/* Main AI Tutor Studio Header & Status */}
      <section style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <FuturisticIcon name="tutor" size={46} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#202124', margin: 0 }}>AI Tutor</h1>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: 999,
                  background: 'linear-gradient(135deg, #FF6A00 0%, #EA580C 100%)',
                  color: '#FFFFFF'
                }}
              >
                Local Ollama • Qwen2.5:7b
              </span>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#6B7280', margin: '4px 0 0 0' }}>
              Multilingual AI Teacher • Grades 1–10 • English + Telugu + Hindi • Interactive 3D &amp; Visuals
            </p>
          </div>
        </div>

        {/* Backend & Model Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            title="Local Ollama Qwen2.5:7b Connection Status"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              padding: '6px 14px',
              borderRadius: 999,
              fontSize: '0.76rem',
              fontWeight: 700,
              color: '#15803D'
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
            <span>AI Tutor: Local &amp; Private</span>
          </div>

          <button
            type="button"
            onClick={handleResetConversation}
            title="Reset Lesson Conversation"
            className="btn-glass"
            style={{ fontSize: '0.76rem', padding: '6px 12px' }}
          >
            <RotateCcw size={13} color="#FF6A00" />
            <span>New Topic</span>
          </button>
        </div>
      </section>

      {/* Multilingual, Multi-Grade & Pedagogical Controls Bar */}
      <section
        className="glass-card"
        style={{
          padding: '12px 18px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          border: '1.5px solid rgba(255, 106, 0, 0.25)'
        }}
      >
        {/* 1. Language Selector (English, Telugu, Hindi) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Globe size={16} color="#FF6A00" />
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#202124' }}>Language:</span>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.9)', padding: 3, borderRadius: 999, border: '1px solid rgba(255,106,0,0.2)' }}>
            {(
              [
                { id: 'English', label: 'English' },
                { id: 'Telugu', label: 'తెలుగు' },
                { id: 'Hindi', label: 'हिंदी' }
              ] as const
            ).map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLanguage(l.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 999,
                  border: 'none',
                  background: language === l.id ? 'linear-gradient(135deg, #FF6A00 0%, #EA580C 100%)' : 'transparent',
                  color: language === l.id ? '#FFFFFF' : '#4B5563',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Grade Selector (Grades 1 to 10) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <GraduationCap size={16} color="#FF6A00" />
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#202124' }}>Grade:</span>
          <select
            aria-label="Select School Grade"
            value={grade}
            onChange={(e) => setGrade(parseInt(e.target.value, 10))}
            style={{
              padding: '6px 12px',
              borderRadius: 999,
              border: '1.5px solid rgba(255, 106, 0, 0.35)',
              background: '#FFFFFF',
              fontSize: '0.82rem',
              fontWeight: 800,
              color: '#202124',
              cursor: 'pointer'
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((g) => (
              <option key={g} value={g}>
                Grade {g}
              </option>
            ))}
          </select>
          <span
            style={{
              fontSize: '0.73rem',
              fontWeight: 700,
              color: '#EA580C',
              background: '#FFF7ED',
              padding: '3px 8px',
              borderRadius: 999,
              border: '1px solid rgba(255, 106, 0, 0.2)'
            }}
          >
            {gradeBand.band}
          </span>
        </div>

        {/* 3. Subject Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <BookOpen size={16} color="#FF6A00" />
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#202124' }}>Subject:</span>
          <select
            aria-label="Select Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 999,
              border: '1.5px solid rgba(255, 106, 0, 0.35)',
              background: '#FFFFFF',
              fontSize: '0.82rem',
              fontWeight: 800,
              color: '#202124',
              cursor: 'pointer'
            }}
          >
            {['Science', 'Maths', 'English', 'Telugu', 'Hindi', 'Social Studies', 'Computer Science'].map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Teaching Depth & Stream Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.9)', padding: 3, borderRadius: 999, border: '1px solid rgba(255,106,0,0.2)' }}>
            {(['simple', 'detailed'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 999,
                  border: 'none',
                  background: mode === m ? '#FF6A00' : 'transparent',
                  color: mode === m ? '#FFFFFF' : '#6B7280',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {m}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setStreamingMode(!streamingMode)}
            title="Toggle Live SSE Token Streaming"
            style={{
              padding: '5px 12px',
              borderRadius: 999,
              border: '1px solid rgba(255, 106, 0, 0.3)',
              background: streamingMode ? '#FFF7ED' : '#FFFFFF',
              color: streamingMode ? '#EA580C' : '#6B7280',
              fontSize: '0.76rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <Radio size={12} color={streamingMode ? '#FF6A00' : '#9CA3AF'} />
            <span>{streamingMode ? 'Live Stream' : 'Studio Mode'}</span>
          </button>
        </div>
      </section>

      {actionToast && (
        <div
          style={{
            padding: '10px 16px',
            borderRadius: 14,
            background: '#ECFDF5',
            color: '#047857',
            fontWeight: 700,
            fontSize: '0.85rem',
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <CheckCircle2 size={16} />
          <span>{actionToast}</span>
        </div>
      )}

      {/* Conversation Thread */}
      <section style={{ display: 'grid', gap: 18, marginBottom: 22 }}>
        {messages.length === 0 && !loading && (
          <div className="glass-card" style={{ padding: 28, textAlign: 'center' }}>
            <Sparkles size={32} color="#FF6A00" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: 8 }}>
              {language === 'Telugu'
                ? 'ఈ రోజు మీరు ఏ అంశాన్ని నేర్చుకోవాలనుకుంటున్నారు?'
                : language === 'Hindi'
                ? 'आज आप कौन सा विषय पढ़ना चाहते हैं?'
                : `What concept in ${subject} would you like to master today?`}
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#6B7280', marginTop: 4, marginBottom: 16 }}>
              {gradeBand.desc} • Tailored for Grade {grade} • Powered by local Ollama (qwen2.5:7b)
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 8 }}>
              {suggestedList.map((sq) => (
                <button
                  key={sq}
                  type="button"
                  onClick={() => submitQuestion(sq, sq, null)}
                  className="btn-glass"
                  style={{ fontSize: '0.82rem', borderColor: 'rgba(255, 106, 0, 0.28)' }}
                >
                  ✦ {sq}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => {
          if (msg.role === 'user') {
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    background: 'linear-gradient(135deg, #FFF3E8 0%, #FFE4CC 100%)',
                    border: '1px solid rgba(255, 106, 0, 0.25)',
                    padding: '12px 18px',
                    borderRadius: '20px 20px 6px 20px',
                    fontWeight: 700,
                    fontSize: '0.94rem',
                    color: '#202124',
                    maxWidth: 560,
                    boxShadow: '0 4px 14px rgba(255, 106, 0, 0.08)'
                  }}
                >
                  {msg.content}
                </div>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FFE4CC 0%, #FF9E44 100%)',
                    border: '2px solid #FFFFFF',
                    boxShadow: '0 4px 10px rgba(255,106,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    color: '#202124',
                    flexShrink: 0
                  }}
                >
                  VS
                </div>
              </div>
            );
          }

          const s = msg.structured;
          const showInline3D = inline3DMsgId === msg.id;
          const keywordsList: string[] =
            Array.isArray(s?.keywords) && s.keywords.length > 0
              ? s.keywords
              : [
                  s?.topic || activeTopic,
                  s?.subject || subject,
                  ...(s?.definitions || []).map((d: any) => d.term),
                  ...(s?.formula?.reactants || []).map((r: any) => r.label)
                ]
                  .filter(Boolean)
                  .slice(0, 7);

          const diffTable =
            s?.differences && Array.isArray(s.differences.rows) && s.differences.rows.length > 0
              ? s.differences
              : s?.definitions?.length >= 2
              ? {
                  titleA: s.definitions[0].term,
                  titleB: s.definitions[1].term,
                  rows: [
                    {
                      aspect: 'Definition & Role',
                      itemA: s.definitions[0].definition,
                      itemB: s.definitions[1].definition
                    },
                    {
                      aspect: 'Process Stage',
                      itemA: s.keySteps?.[0] || 'Initial mechanism phase',
                      itemB: s.keySteps?.[1] || 'Subsequent transformation phase'
                    }
                  ]
                }
              : null;

          return (
            <div key={msg.id} className="glass-card" style={{ padding: 24, border: '1.5px solid rgba(255, 106, 0, 0.28)' }}>
              {/* Tutor Header & Topic Badges */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FuturisticIcon name="tutor" size={38} />
                  <div>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#202124' }}>{s?.topic || activeTopic}</span>
                    <span
                      style={{
                        marginLeft: 8,
                        padding: '3px 10px',
                        borderRadius: 999,
                        background: 'linear-gradient(135deg, #FF6A00 0%, #EA580C 100%)',
                        color: '#FFFFFF',
                        fontSize: '0.72rem',
                        fontWeight: 800
                      }}
                    >
                      {s?.subject || subject} • Grade {s?.grade || grade}
                    </span>
                    <span
                      style={{
                        marginLeft: 6,
                        padding: '3px 8px',
                        borderRadius: 999,
                        background: '#FFF7ED',
                        color: '#EA580C',
                        border: '1px solid rgba(255,106,0,0.25)',
                        fontSize: '0.7rem',
                        fontWeight: 800
                      }}
                    >
                      {s?.language || language}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => handleSpeakExplanation(`${s?.introduction || msg.content} ${(s?.keySteps || []).join(' ')}`)}
                    className="btn-glass"
                    style={{ fontSize: '0.76rem', padding: '5px 12px' }}
                    title="Listen to spoken explanation"
                  >
                    {isSpeaking ? <VolumeX size={14} color="#EA580C" /> : <Volume2 size={14} color="#FF6A00" />}
                    <span>{isSpeaking ? 'Stop Audio' : 'Listen Aloud'}</span>
                  </button>

                  <span
                    style={{
                      fontSize: '0.73rem',
                      fontWeight: 700,
                      color: '#EA580C',
                      background: '#FFF7ED',
                      padding: '4px 10px',
                      borderRadius: 999,
                      border: '1px solid rgba(255,106,0,0.25)'
                    }}
                  >
                    ⚡ AI Tutor (qwen2.5:7b)
                  </span>
                </div>
              </div>

              {/* 1. Detailed Explanation */}
              <div
                style={{
                  padding: '14px 18px',
                  borderRadius: 18,
                  background: 'linear-gradient(135deg, #FFFDFB 0%, #FFF7ED 100%)',
                  border: '1px solid rgba(255, 106, 0, 0.22)',
                  marginBottom: 16
                }}
              >
                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#FF6A00', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                  📖 {language === 'Telugu' ? 'వివరణ & భావన' : language === 'Hindi' ? 'अवधारणा एवं व्याख्या' : 'Concept Explanation'}
                </div>
                <p style={{ fontSize: '0.96rem', lineHeight: 1.68, color: '#202124', margin: 0, whiteSpace: 'pre-line' }}>
                  {s?.introduction || msg.content}
                </p>
              </div>

              {/* 2. Keywords Bar */}
              {keywordsList.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.84rem', color: '#202124', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#FF6A00' }}>🏷️</span> {language === 'Telugu' ? 'ముఖ్య పదాలు:' : language === 'Hindi' ? 'प्रमुख शब्द:' : 'Key Terminology & Keywords:'}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {keywordsList.map((kw: string, idx: number) => (
                      <span key={idx} className="keyword-pill-orange">
                        ✦ {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Key Points & Step-by-Step Mechanism */}
              {s?.keySteps?.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#202124', marginBottom: 10 }}>
                    ⚡ {language === 'Telugu' ? 'ముఖ్యమైన అంశాలు:' : language === 'Hindi' ? 'मुख्य बिंदु एवं प्रक्रिया:' : 'Key Points & Step-by-Step Mechanism:'}
                  </div>
                  <div style={{ display: 'grid', gap: 10 }}>
                    {s.keySteps.map((step: string, idx: number) => (
                      <div key={idx} className="futuristic-step-card">
                        <div style={{ fontSize: '0.9rem', lineHeight: 1.55, color: '#1F2937' }}>
                          <strong style={{ color: '#FF6A00', fontWeight: 900, marginRight: 6 }}>Point {idx + 1}:</strong>
                          {step}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Core Definitions */}
              {s?.definitions?.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#202124', marginBottom: 10 }}>
                    📘 {language === 'Telugu' ? 'ప్రధాన నిర్వచనాలు:' : language === 'Hindi' ? 'प्रमुख परिभाषाएँ:' : 'Core Definitions:'}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                    {s.definitions.map((d: any, idx: number) => (
                      <div
                        key={idx}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 16,
                          background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)',
                          border: '1.5px solid rgba(255, 106, 0, 0.28)',
                          fontSize: '0.84rem',
                          boxShadow: '0 4px 12px rgba(255, 106, 0, 0.06)'
                        }}
                      >
                        <div style={{ fontWeight: 800, color: '#EA580C', fontSize: '0.88rem', marginBottom: 4 }}>
                          🔹 {d.term}
                        </div>
                        <div style={{ color: '#374151', lineHeight: 1.48 }}>{d.definition}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Key Differences Comparison Table */}
              {diffTable && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#202124', marginBottom: 10 }}>
                    ⚖️ Key Differences &amp; Comparison ({diffTable.titleA} vs. {diffTable.titleB}):
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="futuristic-diff-table">
                      <thead>
                        <tr>
                          <th style={{ width: '24%' }}>Comparison Aspect</th>
                          <th style={{ width: '38%' }}>{diffTable.titleA}</th>
                          <th style={{ width: '38%' }}>{diffTable.titleB}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {diffTable.rows.map((r: any, idx: number) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 800, color: '#EA580C' }}>{r.aspect}</td>
                            <td>{r.itemA}</td>
                            <td>{r.itemB}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 6. Formula / Equation Card */}
              {s?.formula && (
                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: 18,
                    background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
                    border: '2px solid rgba(255, 106, 0, 0.38)',
                    marginBottom: 18,
                    textAlign: 'center',
                    boxShadow: '0 8px 20px rgba(255, 106, 0, 0.12)'
                  }}
                >
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#EA580C', textTransform: 'uppercase', marginBottom: 4 }}>
                    ⚡ Governing Formula / Equation
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#202124', letterSpacing: '0.01em', marginBottom: 8 }}>
                    {s.formula.equation}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 16, fontSize: '0.78rem', color: '#4B5563', fontWeight: 700 }}>
                    {[...(s.formula.reactants || []), ...(s.formula.products || [])].map((item: any, idx: number) => (
                      <span key={idx}>
                        <strong style={{ color: '#FF6A00' }}>{item.symbol}:</strong> {item.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. Visual Image Diagram */}
              {s?.imageUrl && (
                <div
                  style={{
                    borderRadius: 20,
                    overflow: 'hidden',
                    border: '2px solid rgba(255,106,0,0.3)',
                    marginBottom: 16,
                    background: '#FFFDFB',
                    boxShadow: '0 10px 28px rgba(255, 106, 0, 0.12)',
                    position: 'relative'
                  }}
                >
                  <div
                    style={{
                      padding: '8px 14px',
                      background: 'linear-gradient(90deg, #FF6A00 0%, #FF8533 100%)',
                      color: '#FFFFFF',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>🖼️ Visual Illustration &amp; Concept Diagram: {s?.topic || activeTopic}</span>
                    <span>2D Visual Blueprint</span>
                  </div>
                  <img
                    src={s.imageUrl}
                    alt={s.imageCaption || `${s.topic || activeTopic} Visual Illustration`}
                    style={{
                      width: '100%',
                      maxHeight: 340,
                      objectFit: 'contain',
                      display: 'block',
                      padding: 6
                    }}
                  />
                  {s?.analogies && (
                    <div
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(255, 243, 232, 0.95)',
                        borderTop: '1px solid rgba(255, 106, 0, 0.16)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 8,
                        fontSize: '0.82rem',
                        color: '#202124'
                      }}
                    >
                      <div>
                        <strong style={{ color: '#E85D00' }}>💡 Real-World Analogy:</strong> {s.analogies}
                      </div>
                      <button
                        type="button"
                        onClick={() => openImageStudio(s?.topic || activeTopic)}
                        style={{
                          border: '1px solid rgba(255,106,0,0.35)',
                          background: '#FFFFFF',
                          color: '#FF6A00',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          padding: '5px 12px',
                          borderRadius: 999,
                          cursor: 'pointer'
                        }}
                      >
                        ✨ Open Full Image Studio
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Primary Media Actions: Listen | Image | Video | 3D Model */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                <button
                  type="button"
                  onClick={() =>
                    startAudioLesson({
                      topic: s?.topic || activeTopic,
                      text: `${s?.introduction || ''} ${(s?.keySteps || []).join(' ')} ${s?.recap || ''}`
                    })
                  }
                  className="btn-glass"
                  style={{ fontSize: '0.8rem', padding: '8px 14px' }}
                >
                  <Volume2 size={15} color="#FF6A00" />
                  <span>Audio Lesson</span>
                </button>

                <button
                  type="button"
                  onClick={() => openImageStudio(s?.topic || activeTopic)}
                  className="btn-glass"
                  style={{ fontSize: '0.8rem', padding: '8px 14px' }}
                >
                  <ImageIcon size={15} color="#16A34A" />
                  <span>Image Studio</span>
                </button>

                <button
                  type="button"
                  onClick={() => openVideoStudio(s?.topic || activeTopic)}
                  className="btn-glass"
                  style={{ fontSize: '0.8rem', padding: '8px 14px' }}
                >
                  <Video size={15} color="#7C3AED" />
                  <span>Video Studio</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInline3DMsgId(showInline3D ? null : msg.id)}
                  className="btn-orange"
                  style={{ fontSize: '0.8rem', padding: '8px 14px' }}
                >
                  <Box size={15} />
                  <span>{showInline3D ? 'Hide 3D Lab' : 'Interactive 3D Lab'}</span>
                </button>
              </div>

              {/* Inline Three.js 3D Viewer */}
              {showInline3D && (
                <div style={{ marginBottom: 16 }}>
                  <Interactive3DViewer
                    topic={s?.topic || activeTopic}
                    modelType={s?.model3dType}
                    compact
                    onClose={() => setInline3DMsgId(null)}
                  />
                </div>
              )}

              {/* Connected Learning Actions: Notes | Quiz | Game | Library */}
              <div style={{ padding: 14, borderRadius: 18, background: '#FFFDF9', border: '1px solid rgba(255,106,0,0.18)' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#6B7280', marginBottom: 10 }}>
                  Practice &amp; Progress:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => handleSaveAsNotes(s)}
                    className="btn-glass"
                    style={{ justifyContent: 'flex-start', fontSize: '0.82rem' }}
                  >
                    <FileText size={15} color="#FF6A00" />
                    <span>Save as Notes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openQuizModal(s?.topic || activeTopic, s?.subject || subject)}
                    className="btn-glass"
                    style={{ justifyContent: 'flex-start', fontSize: '0.82rem' }}
                  >
                    <HelpCircle size={15} color="#FF6A00" />
                    <span>Generate Quiz</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openGamesHub(s?.topic || activeTopic, s?.subject || subject)}
                    className="btn-glass"
                    style={{ justifyContent: 'flex-start', fontSize: '0.82rem' }}
                  >
                    <Gamepad2 size={15} color="#FF6A00" />
                    <span>Start Practice Game</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveToLibrary(s)}
                    className="btn-glass"
                    style={{ justifyContent: 'flex-start', fontSize: '0.82rem' }}
                  >
                    <Bookmark size={15} color="#FF6A00" />
                    <span>Save to Library</span>
                  </button>
                </div>

                {/* Follow-up question chips */}
                {s?.suggestedFollowUps?.length > 0 && (
                  <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {s.suggestedFollowUps.map((fq: string, i: number) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => submitQuestion(fq)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: 999,
                          border: '1px solid rgba(255,106,0,0.25)',
                          background: '#FFF3E8',
                          color: '#E85D00',
                          fontSize: '0.76rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        ↳ {fq}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Live Streaming Assistant Output */}
        {streamingText && (
          <div className="glass-card" style={{ padding: 24, border: '1.5px solid rgba(255, 106, 0, 0.35)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: '#FF6A00', fontWeight: 800, fontSize: '0.88rem' }}>
              <Radio size={16} className="pulse-orange" />
              <span>AI Tutor is explaining live...</span>
            </div>
            <p style={{ fontSize: '0.96rem', lineHeight: 1.68, color: '#202124', margin: 0, whiteSpace: 'pre-line' }}>
              {streamingText}
            </p>
          </div>
        )}

        {loading && !streamingText && (
          <div className="glass-card" style={{ padding: 20, textAlign: 'center', color: '#FF6A00', fontWeight: 700 }}>
            AI Tutor (Local Ollama Qwen2.5:7b) is preparing your lesson...
          </div>
        )}

        {errorMsg && (
          <div style={{ padding: 14, borderRadius: 16, background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.86rem', fontWeight: 600 }}>
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => submitQuestion(questionInput || 'Explain photosynthesis')}
              className="btn-orange"
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            >
              <RotateCcw size={14} /> Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </section>

      {/* Bottom Follow-Up Question & Spoken Mic Input Bar */}
      <form onSubmit={handleFormSubmit} className="glass-card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Attachment Upload */}
        <label
          title="Attach study document or image (Max 5MB)"
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: '#FFF3E8',
            color: '#FF6A00',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <Paperclip size={18} />
          <input type="file" accept=".txt,.md,.pdf,.png,.jpg,.jpeg" onChange={handleAttachmentSelect} style={{ display: 'none' }} />
        </label>

        {/* Microphone Voice Input (Web Speech API) */}
        <button
          type="button"
          onClick={handleToggleVoiceInput}
          title={isListening ? 'Listening... click to stop' : `Speak question in ${language}`}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: 'none',
            background: isListening ? '#EF4444' : '#FFF3E8',
            color: isListening ? '#FFFFFF' : '#FF6A00',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: isListening ? '0 0 12px rgba(239, 68, 68, 0.5)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        {/* Text Input */}
        <input
          className="glass-input"
          value={questionInput}
          onChange={(e) => setQuestionInput(e.target.value)}
          placeholder={
            isListening
              ? `Listening in ${language}... speak now`
              : attachmentNote
              ? `Attached: ${attachmentNote} — Ask your question...`
              : `Ask AI Tutor anything in ${subject} (${language})...`
          }
          aria-label="Ask AI Tutor a question"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={loading}
          aria-label="Send Question"
          className="btn-orange"
          style={{ width: 44, height: 44, padding: 0, borderRadius: '50%', flexShrink: 0 }}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};
