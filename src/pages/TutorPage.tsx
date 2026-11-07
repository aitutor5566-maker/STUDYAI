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
  Rocket,
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
  Trash2,
  ShieldCheck,
  Sliders
} from 'lucide-react';
import { TopBrandBar } from '../components/GlassNav';
import { Interactive3DViewer } from '../components/Interactive3DLab';
import { FuturisticIcon } from '../components/FuturisticIcons';
import { useLearning } from '../context/LearningContext';
import { AdaptiveProfileModal } from '../components/AdaptiveProfileModal';
import { VoiceTeacherModal } from '../components/VoiceTeacherModal';

type LanguageType = 'English' | 'Telugu' | 'Hindi';
type ModeType = 'simple' | 'detailed';
export type TeachingMode = 'normal' | 'exam';

export function inferTopicModel3D(topicName: string): string | null {
  const t = (topicName || '').toLowerCase();
  if (t.includes('heart') || t.includes('circulation') || t.includes('cardio')) return 'human_heart';
  if (t.includes('dna') || t.includes('helix') || t.includes('nucleotide')) return 'dna_helix';
  if (t.includes('chloroplast') || t.includes('plant cell')) return 'chloroplast_molecule';
  if (t.includes('atom') || t.includes('bohr') || t.includes('electron shell')) return 'atom_bohr';
  if (t.includes('solar') || t.includes('planet') || t.includes('kepler')) return 'solar_system';
  if (t.includes('volcano')) return 'volcano';
  if (t.includes('water') && (t.includes('molecule') || t.includes('h2o') || t.includes('bent'))) return 'water_molecule';
  if (t.includes('lever') || t.includes('fulcrum') || t.includes('moments')) return 'lever_moments';
  if (t.includes('cone') && t.includes('cylinder')) return 'cone_cylinder_volume';
  return null;
}

const InteractiveGeometryConstruction: React.FC<{ topic?: string }> = ({ topic }) => {
  const [currentStep, setCurrentStep] = useState<number>(4);
  const totalSteps = 4;

  const ab = 6;
  const bc = 5;
  const ac = 4;
  const scale = 42;
  const ax = 70;
  const ay = 210;
  const bx = ax + ab * scale;
  const by = ay;

  const cosA = (ab * ab + ac * ac - bc * bc) / (2 * ab * ac);
  const sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));
  const cx = ax + ac * scale * cosA;
  const cy = ay - ac * scale * sinA;
  const rac = ac * scale;
  const rbc = bc * scale;

  return (
    <div
      style={{
        marginBottom: 18,
        padding: 16,
        borderRadius: 18,
        background: 'linear-gradient(135deg, #090D16 0%, #131D31 100%)',
        color: '#F8FAFC',
        border: '1.5px solid rgba(56, 189, 248, 0.4)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <span style={{ fontWeight: 800, fontSize: '0.94rem', color: '#38BDF8' }}>
            📐 Step-by-Step 2D Geometry Construction (Compass & Straightedge)
          </span>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
            Constructing Triangle ABC: AB = {ab} cm, BC = {bc} cm, AC = {ac} cm (SSS Theorem)
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            disabled={currentStep === 1}
            style={{ padding: '4px 10px', borderRadius: 8, background: '#1E293B', color: '#F8FAFC', border: '1px solid #334155', cursor: 'pointer', fontSize: '0.76rem' }}
          >
            ◀ Prev
          </button>
          <button
            onClick={() => setCurrentStep((s) => Math.min(totalSteps, s + 1))}
            disabled={currentStep === totalSteps}
            style={{ padding: '4px 10px', borderRadius: 8, background: '#1E293B', color: '#F8FAFC', border: '1px solid #334155', cursor: 'pointer', fontSize: '0.76rem' }}
          >
            Next ▶
          </button>
          <button
            onClick={() => setCurrentStep(1)}
            style={{ padding: '4px 10px', borderRadius: 8, background: '#1E293B', color: '#FDBA74', border: '1px solid #334155', cursor: 'pointer', fontSize: '0.76rem' }}
          >
            ↺ Replay
          </button>
          <button
            onClick={() => setCurrentStep(4)}
            style={{ padding: '4px 10px', borderRadius: 8, background: '#0284C7', color: '#FFFFFF', border: 'none', cursor: 'pointer', fontSize: '0.76rem', fontWeight: 700 }}
          >
            Show All
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14, alignItems: 'center' }}>
        <svg viewBox="0 0 460 250" style={{ width: '100%', height: 210, background: '#070A12', borderRadius: 12, border: '1px solid #1E293B' }}>
          {/* Step 1: Base line AB */}
          {currentStep >= 1 && (
            <>
              <line x1={ax} y1={ay} x2={bx} y2={by} stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
              <circle cx={ax} cy={ay} r="4" fill="#38BDF8" />
              <circle cx={bx} cy={by} r="4" fill="#38BDF8" />
              <text x={ax - 16} y={ay + 5} fill="#F8FAFC" fontSize="13" fontWeight="700">A</text>
              <text x={bx + 8} y={by + 5} fill="#F8FAFC" fontSize="13" fontWeight="700">B</text>
              <text x={(ax + bx) / 2} y={ay + 20} fill="#38BDF8" fontSize="11" fontWeight="600" textAnchor="middle">Base AB = {ab} cm</text>
            </>
          )}

          {/* Step 2: Compass Arc from A with radius AC */}
          {currentStep >= 2 && (
            <>
              <path d={`M ${cx - 30} ${cy + 25} A ${rac} ${rac} 0 0 1 ${cx + 30} ${cy - 25}`} fill="none" stroke="#F59E0B" strokeWidth="1.8" strokeDasharray="4 4" />
              <text x={ax + 10} y={(ay + cy) / 2} fill="#F59E0B" fontSize="10">Radius = {ac} cm</text>
            </>
          )}

          {/* Step 3: Compass Arc from B with radius BC */}
          {currentStep >= 3 && (
            <>
              <path d={`M ${cx + 25} ${cy + 30} A ${rbc} ${rbc} 0 0 0 ${cx - 25} ${cy - 30}`} fill="none" stroke="#A855F7" strokeWidth="1.8" strokeDasharray="4 4" />
              <circle cx={cx} cy={cy} r="5" fill="#22C55E" />
              <text x={cx} y={cy - 10} fill="#22C55E" fontSize="13" fontWeight="700" textAnchor="middle">C</text>
            </>
          )}

          {/* Step 4: Join AC and BC */}
          {currentStep >= 4 && (
            <>
              <polygon points={`${ax},${ay} ${bx},${by} ${cx},${cy}`} fill="rgba(56, 189, 248, 0.15)" stroke="#38BDF8" strokeWidth="2.5" />
              <text x={(ax + cx) / 2 - 18} y={(ay + cy) / 2} fill="#F59E0B" fontSize="11" fontWeight="600">b = {ac} cm</text>
              <text x={(bx + cx) / 2 + 10} y={(by + cy) / 2} fill="#A855F7" fontSize="11" fontWeight="600">a = {bc} cm</text>
            </>
          )}
        </svg>

        <div style={{ background: '#0F172A', padding: 12, borderRadius: 10, fontSize: '0.78rem', border: '1px solid #1E293B' }}>
          <div style={{ color: '#FDBA74', fontWeight: 700, marginBottom: 4 }}>
            Step {currentStep} of {totalSteps}:
          </div>
          {currentStep === 1 && <div>1. Draw base segment AB of length {ab} cm with a straightedge.</div>}
          {currentStep === 2 && <div>2. Set compass to radius {ac} cm. Needle at vertex A; draw an arc above AB.</div>}
          {currentStep === 3 && <div>3. Set compass to radius {bc} cm. Needle at vertex B; draw an arc intersecting the first arc at C.</div>}
          {currentStep === 4 && <div>4. Join AC ({ac} cm) and BC ({bc} cm) with straightedge. Triangle ABC is complete and verified!</div>}
          <div style={{ marginTop: 8, color: '#4ADE80', fontSize: '0.72rem' }}>
            ✓ SSS Congruence Theorem: {ab} + {ac} &gt; {bc} (Valid)
          </div>
        </div>
      </div>
    </div>
  );
};

interface TutorHealthInfo {
  status: string;
  model: string;
  accessible: boolean;
  tokensPerSec?: number;
}

const InteractiveQuadraticPlot: React.FC<{ spec?: any }> = ({ spec }) => {
  const [a, setA] = useState<number>(spec?.defaultCoefficients?.a ?? spec?.defaultA ?? 1);
  const [b, setB] = useState<number>(spec?.defaultCoefficients?.b ?? spec?.defaultB ?? -5);
  const [c, setC] = useState<number>(spec?.defaultCoefficients?.c ?? spec?.defaultC ?? 6);

  const safeA = a === 0 ? 0.25 : a;
  const discriminant = Number((b * b - 4 * safeA * c).toFixed(2));
  const vertexX = Number((-b / (2 * safeA)).toFixed(2));
  const vertexY = Number((safeA * vertexX * vertexX + b * vertexX + c).toFixed(2));

  let rootsSummary = 'No Real Roots (D < 0 — Complex Conjugate Roots)';
  let r1: number | null = null;
  let r2: number | null = null;
  if (discriminant > 0) {
    r1 = Number(((-b - Math.sqrt(discriminant)) / (2 * safeA)).toFixed(2));
    r2 = Number(((-b + Math.sqrt(discriminant)) / (2 * safeA)).toFixed(2));
    rootsSummary = `Two Distinct Real Roots: x₁ = ${r1}, x₂ = ${r2}`;
  } else if (discriminant === 0) {
    r1 = Number((-b / (2 * safeA)).toFixed(2));
    rootsSummary = `One Repeated Real Root: x = ${r1}`;
  }

  // Build SVG polyline points for x in [-6, 8]
  const mapX = (x: number) => 220 + x * 24;
  const mapY = (y: number) => 130 - y * 14;
  const pts: string[] = [];
  for (let x = -7; x <= 9; x += 0.25) {
    const y = safeA * x * x + b * x + c;
    if (y >= -8 && y <= 10) {
      pts.push(`${mapX(x).toFixed(1)},${mapY(y).toFixed(1)}`);
    }
  }

  return (
    <div
      style={{
        marginBottom: 18,
        padding: 16,
        borderRadius: 18,
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        color: '#F8FAFC',
        border: '1.5px solid rgba(56, 189, 248, 0.35)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
        <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#38BDF8' }}>
          📈 Interactive Quadratic Parabola Graph Explorer: y = {safeA}x² {b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`}x {c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`}
        </div>
        <span style={{ fontSize: '0.76rem', padding: '3px 10px', borderRadius: 999, background: 'rgba(255,106,0,0.2)', color: '#FDBA74', fontWeight: 700 }}>
          Discriminant D = b² - 4ac = {discriminant}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 14, alignItems: 'center' }}>
        <svg viewBox="0 0 460 240" style={{ width: '100%', height: 210, background: '#090D16', borderRadius: 14, border: '1px solid #334155' }}>
          <line x1="20" y1="130" x2="440" y2="130" stroke="#64748B" strokeWidth="1.5" />
          <line x1="220" y1="15" x2="220" y2="225" stroke="#64748B" strokeWidth="1.5" />
          <line x1={mapX(vertexX)} y1="15" x2={mapX(vertexX)} y2="225" stroke="#F59E0B" strokeWidth="1.2" strokeDasharray="4 4" />
          {pts.length > 1 && <polyline fill="none" stroke="#FF6A00" strokeWidth="3" points={pts.join(' ')} />}
          <circle cx={mapX(vertexX)} cy={mapY(vertexY)} r="5" fill="#38BDF8" />
          {r1 !== null && <circle cx={mapX(r1)} cy={mapY(0)} r="5" fill="#22C55E" />}
          {r2 !== null && <circle cx={mapX(r2)} cy={mapY(0)} r="5" fill="#22C55E" />}
          <text x="24" y="28" fill="#FDBA74" fontSize="11" fontWeight="700">
            Vertex: ({vertexX}, {vertexY}) • Axis: x = {vertexX}
          </text>
          <text x="24" y="220" fill="#4ADE80" fontSize="11" fontWeight="700">
            {rootsSummary}
          </text>
        </svg>

        <div style={{ display: 'grid', gap: 10, fontSize: '0.8rem' }}>
          <label style={{ display: 'grid', gap: 4 }}>
            <span>
              Coefficient <strong>a = {safeA}</strong> ({safeA > 0 ? 'Opens Upward ∪' : 'Opens Downward ∩'})
            </span>
            <input type="range" min={-3} max={3} step={0.5} value={a} onChange={(e) => setA(Number(e.target.value))} style={{ accentColor: '#FF6A00' }} />
          </label>
          <label style={{ display: 'grid', gap: 4 }}>
            <span>
              Coefficient <strong>b = {b}</strong> (Shifts Axis of Symmetry)
            </span>
            <input type="range" min={-8} max={8} step={1} value={b} onChange={(e) => setB(Number(e.target.value))} style={{ accentColor: '#38BDF8' }} />
          </label>
          <label style={{ display: 'grid', gap: 4 }}>
            <span>
              Constant <strong>c = {c}</strong> (Y-Intercept: (0, {c}))
            </span>
            <input type="range" min={-6} max={10} step={1} value={c} onChange={(e) => setC(Number(e.target.value))} style={{ accentColor: '#22C55E' }} />
          </label>
        </div>
      </div>
    </div>
  );
};

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
    openExamModal,
    triggerRefresh
  } = useLearning();

  // Multi-grade & Multilingual Teaching Configuration
  const [grade, setGrade] = useState<number>(10);
  const [subject, setSubject] = useState<string>('Science');
  const [language, setLanguage] = useState<LanguageType>('English');
  const [mode, setMode] = useState<ModeType>('simple');
  const [teachingMode, setTeachingMode] = useState<TeachingMode>('normal');
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
  const [selectedVisualComponent, setSelectedVisualComponent] = useState<{ id: string; label: string; role?: string } | null>(null);
  const [revealedQuestions, setRevealedQuestions] = useState<Record<string, boolean>>({});
  const [explanationLength, setExplanationLength] = useState<'concise' | 'balanced' | 'detailed'>('balanced');
  const [showAdaptiveModal, setShowAdaptiveModal] = useState<boolean>(false);
  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);
  const [voiceLessonTutorStructured, setVoiceLessonTutorStructured] = useState<any | null>(null);
  const [voiceLessonTutorContent, setVoiceLessonTutorContent] = useState<string>('');
  const [voiceLessonQuestion, setVoiceLessonQuestion] = useState<string>('');
  const [evaluations, setEvaluations] = useState<Record<string, { selectedOption: string; evaluated: boolean; isCorrect?: boolean; feedback?: string; score?: number; loading?: boolean }>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});

  useEffect(() => {
    apiFetch<any>('/api/tutor/adaptive-profile')
      .then((data) => {
        if (data?.adaptive_profile?.explanation_style) {
          setExplanationLength(data.adaptive_profile.explanation_style);
        }
      })
      .catch(() => {});
  }, []);

  const handleEvaluateUnderstanding = async (
    msgId: string,
    topic: string,
    question: string,
    selectedOption: string,
    correctOption: string,
    explanation: string
  ) => {
    setEvaluations((prev) => ({
      ...prev,
      [msgId]: { selectedOption, evaluated: false, loading: true }
    }));
    try {
      const res = await apiFetch<any>('/api/tutor/evaluate-understanding', {
        method: 'POST',
        body: JSON.stringify({
          topic,
          question,
          selectedOption,
          correctOption,
          explanation
        })
      });
      setEvaluations((prev) => ({
        ...prev,
        [msgId]: {
          selectedOption,
          evaluated: true,
          loading: false,
          isCorrect: res.isCorrect,
          score: res.score,
          feedback: res.feedback
        }
      }));
      setActionToast(res.isCorrect ? '🌟 Understanding verified! (+100 score)' : '💡 Constructive feedback provided. Keep learning!');
      setTimeout(() => setActionToast(''), 4000);
    } catch (err: any) {
      setEvaluations((prev) => ({
        ...prev,
        [msgId]: { selectedOption, evaluated: false, loading: false }
      }));
      setActionToast('Could not evaluate: ' + (err?.message || 'Error'));
    }
  };

  const handleSendFeedback = async (msgId: string, topic: string, rating: 'too_simple' | 'just_right' | 'too_detailed') => {
    try {
      const res = await apiFetch<any>('/api/tutor/feedback', {
        method: 'POST',
        body: JSON.stringify({ topic, rating })
      });
      setFeedbacks((prev) => ({ ...prev, [msgId]: rating }));
      if (res.adaptedStyle) {
        setExplanationLength(res.adaptedStyle);
      }
      setActionToast(res.message || 'Thank you! Your tutor has adapted to your preference.');
      setTimeout(() => setActionToast(''), 4000);
    } catch (err: any) {
      setActionToast('Could not record feedback');
    }
  };

  const askTargetedQuestion = (q: string, componentOverride?: { id: string; label: string; role?: string }) => {
    if (componentOverride) {
      setSelectedVisualComponent(componentOverride);
    }
    setQuestionInput(q);
    submitQuestion(q, activeTopic, null);
  };

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Check Local Ollama / AI Tutor Backend Health on load
  useEffect(() => {
    apiFetch<any>('/api/tutor/health')
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

  // Multilingual Speech Synthesis (Text-to-Speech — Clean Sentence-Chunked Teacher Narration)
  const handleSpeakExplanation = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();

    // Clean markdown, symbols, and expand key abbreviations on first mention
    const cleaned = text
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/[*#_`~>|]/g, ' ')
      .replace(/→|->/g, ' yields ')
      .replace(/6CO₂\s*\+\s*6H₂O/gi, 'six carbon dioxide plus six water ')
      .replace(/C₆H₁₂O₆\s*\+\s*6O₂/gi, 'glucose plus six oxygen ')
      .replace(/\s+/g, ' ')
      .trim();

    const sentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [cleaned];
    const voices = window.speechSynthesis.getVoices();

    sentences.forEach((sentence, idx) => {
      const utter = new SpeechSynthesisUtterance(sentence.trim());
      utter.volume = 1.0;

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
          (v) => v.name.includes('Samantha') || v.lang === 'en-IN' || v.name.includes('Rishi') || v.name.includes('Aman')
        );
        if (enVoice) utter.voice = enVoice;
        utter.lang = 'en-IN';
        utter.rate = 0.98;
      }

      if (idx === 0) utter.onstart = () => setIsSpeaking(true);
      if (idx === sentences.length - 1) {
        utter.onend = () => setIsSpeaking(false);
        utter.onerror = () => setIsSpeaking(false);
      }

      window.speechSynthesis.speak(utter);
    });
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
        const chatUrl = typeof window !== 'undefined' && window.location.port === '5173' ? 'http://localhost:3001/api/tutor/chat' : '/api/tutor/chat';
        const res = await fetch(chatUrl, {
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
          explanationLength,
          attachmentSummary: attachmentNote || undefined,
          selectedVisualComponent: selectedVisualComponent || undefined
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

      {/* =========================================================================
          PERMANENT TOP-LEVEL LEARNING MODE SELECTOR (PART 2 MANDATORY REQUIREMENT)
          Visually prominent, sticky below header, accessible at all times while scrolling
          ========================================================================= */}
      <section
        style={{
          position: 'sticky',
          top: 64,
          zIndex: 35,
          marginBottom: 16,
          padding: '12px 18px',
          borderRadius: 20,
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(255, 106, 0, 0.35)',
          boxShadow: '0 8px 30px rgba(255, 106, 0, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: teachingMode === 'normal'
                ? 'linear-gradient(135deg, #FF6A00 0%, #EA580C 100%)'
                : 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: teachingMode === 'normal' ? '0 4px 14px rgba(255, 106, 0, 0.35)' : '0 4px 14px rgba(2, 132, 199, 0.35)',
              fontSize: '1.25rem'
            }}
          >
            {teachingMode === 'normal' ? '✨' : '⚡'}
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: teachingMode === 'normal' ? '#EA580C' : '#0284C7' }}>
              CURRENT TEACHING MODE
            </div>
            <div style={{ fontSize: '0.96rem', fontWeight: 900, color: '#1F2937' }}>
              {teachingMode === 'normal'
                ? 'Normal Learning Mode (Concept Mastery & Visuals)'
                : 'Exam Preparation Mode (Formal Definitions & Revision)'}
            </div>
          </div>
        </div>

        {/* PROMINENT SEGMENTED CONTROL */}
        <div
          role="tablist"
          aria-label="Teaching Mode Selector"
          style={{
            display: 'flex',
            background: '#FFF3E8',
            padding: 4,
            borderRadius: 999,
            border: '1.5px solid rgba(255, 106, 0, 0.35)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04)'
          }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={teachingMode === 'normal'}
            onClick={() => {
              if (teachingMode === 'normal') return;
              setTeachingMode('normal');
              setMode('simple');
              setActionToast('Switched to NORMAL LEARNING MODE: Simple language, teacher-style explanations & visual diagrams.');
              setTimeout(() => setActionToast(''), 3500);
            }}
            style={{
              padding: '10px 22px',
              borderRadius: 999,
              border: 'none',
              background: teachingMode === 'normal'
                ? 'linear-gradient(135deg, #FF6A00 0%, #EA580C 100%)'
                : 'transparent',
              color: teachingMode === 'normal' ? '#FFFFFF' : '#6B7280',
              fontWeight: 800,
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: teachingMode === 'normal' ? '0 4px 12px rgba(255,106,0,0.35)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <span>✨</span>
            <span>NORMAL LEARNING MODE</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={teachingMode === 'exam'}
            onClick={() => {
              if (teachingMode === 'exam') return;
              setTeachingMode('exam');
              setMode('detailed');
              setActionToast('Switched to EXAM PREPARATION MODE: Formal definitions, scientific symbols & model answer guidance.');
              setTimeout(() => setActionToast(''), 3500);
            }}
            style={{
              padding: '10px 22px',
              borderRadius: 999,
              border: 'none',
              background: teachingMode === 'exam'
                ? 'linear-gradient(135deg, #FF6A00 0%, #E85D00 100%)'
                : 'transparent',
              color: teachingMode === 'exam' ? '#FFFFFF' : '#6B7280',
              fontWeight: 800,
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: teachingMode === 'exam' ? '0 6px 16px rgba(255,106,0,0.32)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <span>⚡</span>
            <span>EXAM PREPARATION MODE</span>
          </button>
        </div>

        {/* Adaptive Profile Quick Trigger */}
        <button
          type="button"
          onClick={() => setShowAdaptiveModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 18px',
            borderRadius: 999,
            background: '#FFFFFF',
            border: '1.5px solid rgba(255, 106, 0, 0.35)',
            color: '#E85D00',
            fontWeight: 800,
            fontSize: '0.84rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(255, 106, 0, 0.1)',
            transition: 'all 0.2s ease'
          }}
        >
          <Sliders size={16} color="#FF6A00" />
          <span>Learning Profile</span>
        </button>

        {/* Prominent Gemini AI Teacher Voice Mode Button */}
        <button
          type="button"
          onClick={() => {
            const lastAssistantMsg = [...messages].reverse().find((m) => m.role === 'assistant');
            if (lastAssistantMsg) {
              setVoiceLessonTutorStructured(lastAssistantMsg.structured);
              setVoiceLessonTutorContent(lastAssistantMsg.content);
              setVoiceLessonQuestion(lastAssistantMsg.structured?.topic || activeTopic);
            }
            setShowVoiceModal(true);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 18px',
            borderRadius: 999,
            border: 'none',
            background: 'linear-gradient(135deg, #FF6A00 0%, #EA580C 100%)',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '0.82rem',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(255, 106, 0, 0.35)',
            transition: 'all 0.2s ease'
          }}
        >
          <Mic size={16} color="#FFFFFF" />
          <span>Start Voice Lesson</span>
        </button>
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
        {/* Explanation Depth Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={16} color="#FF6A00" />
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#202124' }}>Depth:</span>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.9)', padding: 3, borderRadius: 999, border: '1px solid rgba(255,106,0,0.2)' }}>
            {(
              [
                { id: 'concise', label: '⚡ Concise' },
                { id: 'balanced', label: '⚖️ Balanced' },
                { id: 'detailed', label: '🔍 Detailed' }
              ] as const
            ).map((len) => (
              <button
                key={len.id}
                type="button"
                onClick={() => {
                  setExplanationLength(len.id);
                  setActionToast(`Explanation depth set to: ${len.label}`);
                  setTimeout(() => setActionToast(''), 3000);
                }}
                style={{
                  border: 'none',
                  padding: '4px 12px',
                  borderRadius: 999,
                  background: explanationLength === len.id ? 'linear-gradient(135deg, #FF6A00 0%, #EA580C 100%)' : 'transparent',
                  color: explanationLength === len.id ? '#FFFFFF' : '#4B5563',
                  fontWeight: 700,
                  fontSize: '0.76rem',
                  cursor: 'pointer'
                }}
              >
                {len.label}
              </button>
            ))}
          </div>
        </div>
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

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setVoiceLessonTutorStructured(s);
                      setVoiceLessonTutorContent(msg.content);
                      setVoiceLessonQuestion(s?.topic || activeTopic);
                      setShowVoiceModal(true);
                    }}
                    className="btn-glass"
                    style={{ fontSize: '0.76rem', padding: '5px 12px' }}
                    title="Start AI Voice Teacher Lesson for this explanation"
                  >
                    <Volume2 size={14} color="#FF6A00" />
                    <span>Voice Teacher</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInline3DMsgId(showInline3D ? null : msg.id)}
                    className="btn-glass"
                    style={{
                      fontSize: '0.76rem',
                      padding: '5px 12px',
                      background: showInline3D ? '#FF6A00' : '#FFF7ED',
                      color: showInline3D ? '#FFFFFF' : '#EA580C',
                      borderColor: 'rgba(255,106,0,0.3)'
                    }}
                    title="Toggle Interactive 3D Lab"
                  >
                    <Box size={14} />
                    <span>{showInline3D ? 'Hide 3D Lab' : '3D Model Lab'}</span>
                  </button>

                  <span
                    style={{
                      fontSize: '0.73rem',
                      fontWeight: 700,
                      color: '#E85D00',
                      background: '#FFF3E8',
                      padding: '4px 10px',
                      borderRadius: 999,
                      border: '1px solid rgba(255,106,0,0.28)'
                    }}
                  >
                    {teachingMode === 'normal' ? '🌱 Normal Learning Mode' : '🎯 Exam Prep Mode'}
                  </span>
                </div>
              </div>

              {/* Mode Status Banner inside card */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 15px',
                  borderRadius: 14,
                  marginBottom: 16,
                  background: 'linear-gradient(90deg, #FFF3E8 0%, #FFE4CC 100%)',
                  border: '1.5px solid rgba(255, 106, 0, 0.3)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', fontWeight: 800, color: '#E85D00' }}>
                  <span>{teachingMode === 'normal' ? '🌱' : '⚡'}</span>
                  <span>
                    {teachingMode === 'normal'
                      ? 'NORMAL LEARNING MODE: Everyday explanations, concept breakdown, integrated diagrams & 3D models'
                      : 'EXAM PREPARATION MODE: Formal definitions, full forms glossary, formulas, labeled schematics & practice tests'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setTeachingMode(teachingMode === 'normal' ? 'exam' : 'normal')}
                  className="btn-glass"
                  style={{ fontSize: '0.74rem', padding: '4px 12px', background: '#FFFFFF', color: '#E85D00', fontWeight: 800 }}
                >
                  Switch to {teachingMode === 'normal' ? 'Exam Prep ⚡' : 'Normal Mode 🌱'}
                </button>
              </div>

              {/* Standalone / Inline 3D Viewer if toggled or auto-available */}
              {(showInline3D || (!s?.imageUrl && inferTopicModel3D(s?.topic || activeTopic))) && (
                <div style={{ marginBottom: 18, border: '2px solid rgba(255,106,0,0.3)', borderRadius: 20, overflow: 'hidden' }}>
                  <Interactive3DViewer
                    topic={s?.topic || activeTopic}
                    modelType={s?.model3dType || inferTopicModel3D(s?.topic || activeTopic) || undefined}
                    compact
                    onClose={() => setInline3DMsgId(null)}
                  />
                </div>
              )}

              {/* Gentle Spelling Guidance Notice */}
              {s?.spellingGuidance && (
                <div
                  style={{
                    padding: '10px 16px',
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                    border: '1.5px solid #93C5FD',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 14
                  }}
                >
                  <Sparkles size={18} color="#2563EB" />
                  <span style={{ fontSize: '0.85rem', color: '#1E40AF', fontWeight: 700 }}>
                    {s.spellingGuidance.message || `Gentle tip: "${s.spellingGuidance.corrected}" is spelled '${s.spellingGuidance.corrected}' — wonderful question!`}
                  </span>
                </div>
              )}

              {/* Foundational Prerequisite Bridge (for students with subject difficulty) */}
              {s?.prerequisiteBridge && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 16,
                    background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
                    border: '1.5px solid #86EFAC',
                    marginBottom: 14
                  }}
                >
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#166534', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>🌱</span> Foundational Prerequisite Bridge: {s.prerequisiteBridge.foundationConcept}
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#14532D', margin: 0, lineHeight: 1.55 }}>
                    {s.prerequisiteBridge.whyItMatters}
                  </p>
                </div>
              )}

              {/* Writing Structure Guide (for students with writing difficulty) */}
              {s?.writingGuide && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 16,
                    background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                    border: '1.5px solid #FCD34D',
                    marginBottom: 14
                  }}
                >
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#92400E', marginBottom: 4 }}>
                    ✍️ Answer Structuring Guide (Writing Support)
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#78350F', marginBottom: 6 }}>
                    <strong>Recommended Structure:</strong> {s.writingGuide.answerStructure}
                  </div>
                  {Array.isArray(s.writingGuide.sentenceStarters) && s.writingGuide.sentenceStarters.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {s.writingGuide.sentenceStarters.map((starter: string, sIdx: number) => (
                        <span key={sIdx} style={{ fontSize: '0.76rem', background: '#FFFFFF', padding: '3px 8px', borderRadius: 8, border: '1px solid #FDE68A', color: '#78350F', fontWeight: 600 }}>
                          "{starter}..."
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Memory Hooks (for students with memory difficulty) */}
              {s?.memoryHooks && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 16,
                    background: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)',
                    border: '1.5px solid #D8B4FE',
                    marginBottom: 14
                  }}
                >
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#6B21A8', marginBottom: 4 }}>
                    🧠 Memory Revision Hooks &amp; Mnemonic
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#581C87', fontWeight: 700, marginBottom: 4 }}>
                    "{s.memoryHooks.mnemonic}"
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {s.memoryHooks.quickTakeaways?.map((qt: string, qIdx: number) => (
                      <span key={qIdx} style={{ fontSize: '0.76rem', background: '#FFFFFF', padding: '3px 8px', borderRadius: 8, border: '1px solid #E9D5FF', color: '#6B21A8' }}>
                        • {qt}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* MODE A: NORMAL LEARNING & CONCEPT MASTERY (14 COMPONENTS) */}
              {teachingMode === 'normal' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* 1. Simple Introduction in Everyday Language */}
                  <div
                    style={{
                      padding: '14px 18px',
                      borderRadius: 18,
                      background: 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)',
                      border: '1.5px solid #A7F3D0'
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                      🌱 Component 1: Simple Introduction (In Plain Everyday Words)
                    </div>
                    <p style={{ fontSize: '0.94rem', lineHeight: 1.62, color: '#064E3B', margin: 0 }}>
                      {s?.simpleIntroduction || `Let's understand ${s?.topic || activeTopic} using everyday language. Think of it like a coordinated system where each element works together seamlessly.`}
                    </p>
                  </div>

                  {/* Academic Concept Overview */}
                  <div
                    style={{
                      padding: '14px 18px',
                      borderRadius: 18,
                      background: 'linear-gradient(135deg, #FFFDFB 0%, #FFF7ED 100%)',
                      border: '1px solid rgba(255, 106, 0, 0.22)'
                    }}
                  >
                    <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#FF6A00', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                      📖 Concept Overview &amp; Scientific Background
                    </div>
                    <p style={{ fontSize: '0.95rem', lineHeight: 1.68, color: '#202124', margin: 0, whiteSpace: 'pre-line' }}>
                      {s?.introduction || msg.content}
                    </p>
                    {s?.clearDefinition && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed rgba(255,106,0,0.25)', display: 'grid', gap: 6, fontSize: '0.84rem', color: '#374151' }}>
                        <div><strong style={{ color: '#EA580C' }}>Core Principle:</strong> {s.clearDefinition.formal}</div>
                        <div><strong style={{ color: '#EA580C' }}>Everyday Example:</strong> {s.clearDefinition.example}</div>
                      </div>
                    )}
                  </div>

                  {/* 2. What the Student Will Learn */}
                  <div style={{ padding: '12px 16px', background: '#F8FAFC', borderRadius: 16, border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#0F172A', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>🎯</span> Component 2: What You Will Learn in This Topic
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
                      {(s?.learningOutcomes || [
                        `Master the foundational concepts and definitions of ${s?.topic || activeTopic}`,
                        'Visualize structural parts and mechanisms through diagrams & 3D models',
                        'Understand the step-by-step sequence of operations and connections',
                        'Identify and avoid common misconceptions students make in exams'
                      ]).map((item: string, i: number) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: '0.82rem', color: '#334155' }}>
                          <span style={{ color: '#16A34A', fontWeight: 800 }}>✓</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Prerequisites */}
                  {s?.prerequisites?.length > 0 && (
                    <div style={{ padding: '12px 16px', background: '#EFF6FF', borderRadius: 16, border: '1px solid #BFDBFE' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#1E40AF', marginBottom: 6 }}>
                        🧭 Component 3: Prerequisites (What You Should Know First)
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {s.prerequisites.map((pr: string, idx: number) => (
                          <span
                            key={idx}
                            style={{
                              padding: '4px 11px',
                              borderRadius: 999,
                              background: '#FFFFFF',
                              color: '#1E40AF',
                              border: '1px solid #93C5FD',
                              fontSize: '0.76rem',
                              fontWeight: 600
                            }}
                          >
                            ✓ {pr}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. Topic Breakdown (Subtopics) */}
                  {s?.subtopics && s.subtopics.length > 0 && (
                    <div style={{ padding: '12px 16px', background: '#FFFDF9', borderRadius: 16, border: '1px solid rgba(255,106,0,0.22)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#C2410C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          📚 Component 4: Topic Breakdown ({s.subtopics.length} Logical Subtopics)
                        </span>
                        <span style={{ fontSize: '0.74rem', color: '#9A3412' }}>Click to explore subtopic</span>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {s.subtopics.map((sub: any, subIdx: number) => (
                          <button
                            key={sub.subtopicId || subIdx}
                            type="button"
                            onClick={() => askTargetedQuestion(`Teach me subtopic ${subIdx + 1}: ${sub.title}`)}
                            className="btn-glass"
                            style={{
                              fontSize: '0.75rem',
                              padding: '5px 12px',
                              borderRadius: 999,
                              background: '#FFFFFF',
                              border: '1px solid #FDBA74',
                              color: '#9A3412',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            {subIdx + 1}. {sub.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 5. Concept Explanations with Integrated Visuals & 3D Models */}
                  {/* VISUAL POSITIONING RULE: Position every visual directly beside or below the concept it explains */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#202124', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>🖼️</span> Component 5: Concept Explanations with Integrated Visuals &amp; Diagrams
                    </div>

                    {/* Integrated Concept Cards with Direct Visuals */}
                    {(s?.conceptSections?.length > 0 ? s.conceptSections : [
                      {
                        id: 'concept-1',
                        title: `${s?.topic || activeTopic} Core Mechanism`,
                        whatItIs: s?.clearDefinition?.formal || s?.introduction || msg.content,
                        whereItOccurs: `Within the relevant physiological / physical domain of ${s?.subject || subject}`,
                        howItWorks: (s?.keySteps || []).slice(0, 2).join('; ') || 'Coordinated biological or physical transformation.',
                        whyItMatters: 'Essential for sustaining energy, function, and equilibrium.',
                        whatIfItFails: 'System disruption or reduced efficiency occurs.',
                        examTip: 'Examiners award marks for exact terminology and labeled arrows.'
                      }
                    ]).map((sec: any, idx: number) => {
                      const matchingImg = (s?.lessonImages || [])[idx] || (idx === 0 && s?.imageUrl ? {
                        id: 'primary-visual',
                        title: `${s?.topic || activeTopic} Schematic`,
                        caption: s?.imageCaption || `${s?.topic || activeTopic} Visual Illustration`,
                        imageUrl: s?.imageUrl,
                        explanation: s?.imageExplanation
                      } : null);

                      return (
                        <div
                          key={sec.id || idx}
                          style={{
                            padding: 16,
                            borderRadius: 18,
                            background: '#FFFFFF',
                            border: '1.5px solid rgba(255,106,0,0.25)',
                            boxShadow: '0 4px 14px rgba(255,106,0,0.06)'
                          }}
                        >
                          <div style={{ fontWeight: 800, color: '#EA580C', fontSize: '0.92rem', marginBottom: 6 }}>
                            Concept {idx + 1}: {sec.title}
                          </div>

                          <div style={{ display: 'grid', gap: 5, fontSize: '0.85rem', color: '#374151', lineHeight: 1.55, marginBottom: 12 }}>
                            <div><strong style={{ color: '#1F2937' }}>What it is:</strong> {sec.whatItIs}</div>
                            {sec.whereItOccurs && <div><strong style={{ color: '#1F2937' }}>Where it occurs:</strong> {sec.whereItOccurs}</div>}
                            <div><strong style={{ color: '#1F2937' }}>How it works:</strong> {sec.howItWorks}</div>
                            <div><strong style={{ color: '#1F2937' }}>Why it matters:</strong> {sec.whyItMatters}</div>
                            {sec.whatIfItFails && <div style={{ color: '#B91C1C' }}><strong>If it fails / changes:</strong> {sec.whatIfItFails}</div>}
                            {sec.examTip && <div style={{ color: '#047857', fontWeight: 700 }}>🎯 Exam Tip: {sec.examTip}</div>}
                          </div>

                          {/* DIRECTLY CONNECTED VISUAL / 3D MODEL FOR THIS CONCEPT */}
                          {matchingImg && (
                            <div
                              style={{
                                marginTop: 10,
                                borderRadius: 16,
                                overflow: 'hidden',
                                border: '1.5px solid rgba(255,106,0,0.3)',
                                background: '#FFFDFB'
                              }}
                            >
                              <div
                                style={{
                                  padding: '7px 12px',
                                  background: 'linear-gradient(90deg, #FF6A00 0%, #FF8533 100%)',
                                  color: '#FFFFFF',
                                  fontSize: '0.75rem',
                                  fontWeight: 800,
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}
                              >
                                <span>🖼️ Diagram for Concept {idx + 1}: {matchingImg.title || sec.title}</span>
                                <span>Validated Educational Visual</span>
                              </div>
                              <img
                                src={matchingImg.imageUrl}
                                alt={matchingImg.caption || sec.title}
                                style={{
                                  width: '100%',
                                  maxHeight: 320,
                                  objectFit: 'contain',
                                  display: 'block',
                                  padding: 6
                                }}
                              />

                              {/* 7-Part Visual Walkthrough directly below the diagram */}
                              {matchingImg.explanation && (
                                <div style={{ padding: 12, background: '#F8FAFC', borderTop: '1px solid #E2E8F0', fontSize: '0.82rem', color: '#334155' }}>
                                  <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.84rem', marginBottom: 6 }}>
                                    🔍 7-Part Visual Walkthrough for This Concept:
                                  </div>
                                  <div style={{ marginBottom: 5 }}>
                                    <strong>1. What this image shows:</strong> {matchingImg.explanation.whatItShows}
                                  </div>
                                  {matchingImg.explanation.importantParts?.length > 0 && (
                                    <div style={{ marginBottom: 5 }}>
                                      <strong>2. Important labeled parts (Click to investigate):</strong>{' '}
                                      {matchingImg.explanation.importantParts.map((pt: any, pIdx: number) => {
                                        const lbl = typeof pt === 'string' ? pt : pt.label;
                                        const r = typeof pt === 'object' ? pt.description || pt.role : '';
                                        const isSelected = selectedVisualComponent?.label === lbl;
                                        return (
                                          <button
                                            key={pIdx}
                                            type="button"
                                            onClick={() => setSelectedVisualComponent({
                                              id: lbl.toLowerCase().replace(/[^a-z0-9]/g, '_'),
                                              label: lbl,
                                              role: r
                                            })}
                                            style={{
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              margin: '2px 4px 2px 0',
                                              padding: '2px 8px',
                                              borderRadius: 999,
                                              background: isSelected ? '#FF6A00' : '#FFF3E8',
                                              color: isSelected ? '#FFFFFF' : '#C2410C',
                                              border: isSelected ? '1.5px solid #EA580C' : '1px solid rgba(255,106,0,0.3)',
                                              fontSize: '0.72rem',
                                              fontWeight: 700,
                                              cursor: 'pointer'
                                            }}
                                          >
                                            🏷️ {lbl}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}

                                  {/* Interactive Component Focus Prompt Chips */}
                                  {selectedVisualComponent && (
                                    <div style={{
                                      margin: '6px 0 8px',
                                      padding: '8px 12px',
                                      borderRadius: 12,
                                      background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                                      border: '1.5px solid #3B82F6',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: 6
                                    }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 800, color: '#1E40AF', fontSize: '0.8rem' }}>
                                          🎯 Selected Part: {selectedVisualComponent.label}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => setSelectedVisualComponent(null)}
                                          style={{ border: 'none', background: 'transparent', color: '#64748B', cursor: 'pointer', fontSize: '0.74rem', fontWeight: 700 }}
                                        >
                                          ✕ Deselect
                                        </button>
                                      </div>
                                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                        <button
                                          type="button"
                                          onClick={() => askTargetedQuestion(`Explain the role and mechanism of ${selectedVisualComponent.label} in ${s?.topic || activeTopic}`)}
                                          className="btn-glass"
                                          style={{ fontSize: '0.72rem', padding: '3px 8px', background: '#FFFFFF', color: '#1D4ED8', fontWeight: 700 }}
                                        >
                                          ❓ Explain Role
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => askTargetedQuestion(`What happens if ${selectedVisualComponent.label} is damaged or fails?`)}
                                          className="btn-glass"
                                          style={{ fontSize: '0.72rem', padding: '3px 8px', background: '#FFFFFF', color: '#DC2626', fontWeight: 700 }}
                                        >
                                          ⚠️ If This Fails?
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  {matchingImg.explanation.partFunctions && (
                                    <div style={{ marginBottom: 5 }}>
                                      <strong>3. What each part does:</strong>{' '}
                                      {Array.isArray(matchingImg.explanation.partFunctions)
                                        ? matchingImg.explanation.partFunctions.slice(0, 3).map((pf: any) => `${pf.part || pf.label}: ${pf.role || pf.description}`).join(' • ')
                                        : String(matchingImg.explanation.partFunctions)}
                                    </div>
                                  )}
                                  {matchingImg.explanation.processStages?.length > 0 && (
                                    <div style={{ marginBottom: 5 }}>
                                      <strong>4. Process flow across visual:</strong> {matchingImg.explanation.processStages.join(' → ')}
                                    </div>
                                  )}
                                  <div style={{ padding: '5px 8px', borderRadius: 8, background: '#ECFDF5', color: '#047857', fontWeight: 700 }}>
                                    💡 <strong>5. Exam memory hook:</strong> {matchingImg.explanation.whatToRemember || 'Remember the sequence and labeled arrows.'}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Quadratic Parabola Plot if applicable */}
                    {s?.interactivePlotSpec && <InteractiveQuadraticPlot spec={s.interactivePlotSpec} />}

                    {/* 2D Step-by-Step Compass Geometry Construction if applicable */}
                    {(s?.diagramType === 'geometrical_construction' || /(construct|ruler and compass|triangle construction)/i.test(s?.topic || activeTopic || '')) && (
                      <InteractiveGeometryConstruction topic={s?.topic || activeTopic} />
                    )}
                  </div>

                  {/* 6. Step-by-Step Mechanism */}
                  {s?.keySteps?.length > 0 && (
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#202124', marginBottom: 10 }}>
                        ⚡ Component 6: Step-by-Step Mechanisms &amp; Process Sequence
                      </div>
                      <div style={{ display: 'grid', gap: 8 }}>
                        {s.keySteps.map((step: string, idx: number) => (
                          <div key={idx} className="futuristic-step-card">
                            <div style={{ fontSize: '0.88rem', lineHeight: 1.55, color: '#1F2937' }}>
                              <strong style={{ color: '#FF6A00', fontWeight: 900, marginRight: 6 }}>Step {idx + 1}:</strong>
                              {step}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 7. Real-World Examples & Analogies */}
                  {(s?.realLifeExamples?.length > 0 || s?.applications?.length > 0 || s?.analogies) && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                      {s?.analogies && (
                        <div style={{ padding: 14, borderRadius: 16, background: '#FFF7ED', border: '1.5px solid #FDBA74', fontSize: '0.82rem' }}>
                          <div style={{ fontWeight: 800, color: '#C2410C', marginBottom: 6 }}>💡 Everyday Analogy</div>
                          <p style={{ margin: 0, color: '#9A3412', lineHeight: 1.55 }}>{s.analogies}</p>
                        </div>
                      )}
                      {s?.realLifeExamples?.length > 0 && (
                        <div style={{ padding: 14, borderRadius: 16, background: '#FFFBEB', border: '1px solid #FDE68A', fontSize: '0.82rem' }}>
                          <div style={{ fontWeight: 800, color: '#B45309', marginBottom: 6 }}>🌍 Component 7: Real-Life Examples</div>
                          <ul style={{ margin: 0, paddingLeft: 18, color: '#78350F', lineHeight: 1.5 }}>
                            {s.realLifeExamples.map((ex: string, i: number) => <li key={i}>{ex}</li>)}
                          </ul>
                        </div>
                      )}
                      {s?.applications?.length > 0 && (
                        <div style={{ padding: 14, borderRadius: 16, background: '#F0F9FF', border: '1px solid #BAE6FD', fontSize: '0.82rem' }}>
                          <div style={{ fontWeight: 800, color: '#0369A1', marginBottom: 6 }}>🚀 Practical Applications</div>
                          <ul style={{ margin: 0, paddingLeft: 18, color: '#0C4A6E', lineHeight: 1.5 }}>
                            {s.applications.map((ap: string, i: number) => <li key={i}>{ap}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 8. Important Terminology */}
                  {(keywordsList.length > 0 || s?.definitions?.length > 0) && (
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#202124', marginBottom: 8 }}>
                        🏷️ Component 8: Important Terminology &amp; Keywords
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                        {keywordsList.map((kw: string, idx: number) => (
                          <span key={idx} className="keyword-pill-orange">✦ {kw}</span>
                        ))}
                      </div>
                      {s?.definitions?.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
                          {s.definitions.slice(0, 4).map((d: any, idx: number) => (
                            <div key={idx} style={{ padding: 10, borderRadius: 12, background: '#FFF7ED', border: '1px solid rgba(255,106,0,0.2)', fontSize: '0.82rem' }}>
                              <strong style={{ color: '#EA580C' }}>{d.term}:</strong> <span style={{ color: '#374151' }}>{d.definition}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 9. Common Misunderstandings Corrected */}
                  {s?.misconceptions?.length > 0 && (
                    <div style={{ padding: 14, borderRadius: 16, background: '#FEF2F2', border: '1.5px solid #FECACA', fontSize: '0.82rem' }}>
                      <div style={{ fontWeight: 800, color: '#B91C1C', marginBottom: 6 }}>
                        ⚠️ Component 9: Common Misunderstandings Corrected
                      </div>
                      <ul style={{ margin: 0, paddingLeft: 18, color: '#7F1D1D', lineHeight: 1.55 }}>
                        {s.misconceptions.map((mc: string, i: number) => <li key={i}>{mc}</li>)}
                      </ul>
                    </div>
                  )}

                  {/* 10. Short Understanding Questions (Interactive Self-Check) */}
                  {(s?.practiceQuestions?.length > 0 || s?.examQuestions?.length > 0) && (
                    <div style={{ padding: 16, borderRadius: 18, background: '#EFF6FF', border: '1.5px solid #BFDBFE' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#1E40AF', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>🎯 Component 10: Short Understanding Questions (Self-Check)</span>
                        <span style={{ fontSize: '0.74rem', color: '#3B82F6', fontWeight: 600 }}>Click to reveal answer</span>
                      </div>
                      <div style={{ display: 'grid', gap: 8 }}>
                        {(s?.practiceQuestions || s.examQuestions.map((q: any) => q.question)).slice(0, 4).map((q: string, i: number) => {
                          const qKey = `normal-q-${i}`;
                          const isRevealed = revealedQuestions[qKey];
                          return (
                            <div key={i} style={{ padding: 10, borderRadius: 12, background: '#FFFFFF', border: '1px solid #DBEAFE', fontSize: '0.83rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontWeight: 700, color: '#1E3A8A' }}>Q{i + 1}: {q}</span>
                                <button
                                  type="button"
                                  onClick={() => setRevealedQuestions(prev => ({ ...prev, [qKey]: !prev[qKey] }))}
                                  style={{ border: 'none', background: '#DBEAFE', color: '#1D4ED8', padding: '3px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                                >
                                  {isRevealed ? 'Hide' : 'Check'}
                                </button>
                              </div>
                              {isRevealed && (
                                <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px dashed #BFDBFE', color: '#047857', fontSize: '0.8rem' }}>
                                  <strong>Key Answer Concept:</strong> {s?.keySteps?.[i] || s?.examQuestions?.[i]?.modelAnswer || 'Apply the core mechanism steps directly.'}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 11. Topic Summary */}
                  {s?.revisionNotes?.length > 0 && (
                    <div style={{ padding: 14, borderRadius: 16, background: '#ECFDF5', border: '1px solid #A7F3D0', fontSize: '0.82rem' }}>
                      <div style={{ fontWeight: 800, color: '#047857', marginBottom: 6 }}>📌 Component 11: Topic Summary &amp; Key Takeaways</div>
                      <ul style={{ margin: 0, paddingLeft: 18, color: '#064E3B', lineHeight: 1.55 }}>
                        {s.revisionNotes.map((rn: string, i: number) => <li key={i}>{rn}</li>)}
                      </ul>
                    </div>
                  )}

                  {/* 12. Mastery Assessment Actions */}
                  <div style={{ padding: 16, borderRadius: 18, background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)', border: '1.5px solid rgba(255,106,0,0.3)' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#EA580C', marginBottom: 10 }}>
                      🏆 Component 12: Topic Mastery Assessment &amp; Interactive Practice
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => openExamModal(s?.topic || activeTopic, s?.subject || subject)}
                        className="btn-orange"
                        style={{ fontSize: '0.8rem', padding: '10px 14px', justifyContent: 'center' }}
                      >
                        <ShieldCheck size={16} />
                        <span>Take 40-Mark Topic Exam</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openQuizModal(s?.topic || activeTopic, s?.subject || subject)}
                        className="btn-glass"
                        style={{ fontSize: '0.8rem', padding: '10px 14px', justifyContent: 'center' }}
                      >
                        <HelpCircle size={16} color="#FF6A00" />
                        <span>Interactive Quiz</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openGamesHub(s?.topic || activeTopic, s?.subject || subject, 'space_shooter')}
                        className="btn-glass"
                        style={{ fontSize: '0.8rem', padding: '10px 14px', justifyContent: 'center', color: '#0284C7' }}
                      >
                        <Rocket size={16} color="#0284C7" />
                        <span>Space Battle Practice</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* MODE B: EXAM PREPARATION MODE (FORMAL DEFINITIONS, FORMULAS, SCHEMATICS, 40-MARK TESTS) */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* 1. Formal Academic Definitions */}
                  <div style={{ padding: 16, borderRadius: 18, background: '#FFFFFF', border: '1.5px solid #0284C7' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0369A1', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>📘</span> Component 1: Formal Definitions (Examiner-Standard)
                    </div>
                    {s?.clearDefinition ? (
                      <div style={{ fontSize: '0.88rem', lineHeight: 1.6, color: '#1E293B', background: '#F0F9FF', padding: 12, borderRadius: 12, border: '1px solid #BAE6FD' }}>
                        <div style={{ marginBottom: 4 }}>
                          <strong style={{ color: '#0284C7' }}>Standard Board Definition:</strong> {s.clearDefinition.formal}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#0369A1' }}>
                          <strong>Examiner Keyphrase:</strong> Full marks awarded for exact mention of keywords and conditions.
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.88rem', color: '#1E293B' }}>{s?.introduction || msg.content}</div>
                    )}
                    {s?.definitions?.length > 0 && (
                      <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
                        {s.definitions.map((d: any, idx: number) => (
                          <div key={idx} style={{ padding: 10, borderRadius: 12, background: '#F8FAFC', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}>
                            <div style={{ fontWeight: 800, color: '#0284C7' }}>🔹 {d.term}</div>
                            <div style={{ color: '#334155' }}>{d.definition}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 2. Full Forms & Scientific Abbreviations Glossary */}
                  {s?.abbreviations?.length > 0 && (
                    <div style={{ padding: 16, borderRadius: 18, background: '#F8FAFC', border: '1.5px solid #64748B' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A', marginBottom: 10 }}>
                        🔤 Component 2: Mandatory Full Forms &amp; Abbreviations Glossary
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 8 }}>
                        {s.abbreviations.map((ab: any, idx: number) => (
                          <div key={idx} style={{ padding: 10, borderRadius: 12, background: '#FFFFFF', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}>
                            <div style={{ fontWeight: 900, color: '#0284C7', fontSize: '0.86rem' }}>
                              {ab.abbr} = <span style={{ color: '#0F172A' }}>{ab.fullForm}</span>
                            </div>
                            <div style={{ color: '#475569', fontSize: '0.78rem', marginTop: 2 }}>{ab.simpleDefinition}</div>
                            <div style={{ color: '#047857', fontSize: '0.75rem', fontWeight: 700, marginTop: 2 }}>Role: {ab.roleInTopic}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. Scoring Keywords Bar */}
                  {keywordsList.length > 0 && (
                    <div style={{ padding: 14, borderRadius: 16, background: '#FFFBEB', border: '1.5px solid #FCD34D' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#92400E', marginBottom: 8 }}>
                        🏷️ Component 3: Must-Include Scoring Keywords (Marking Scheme Specific)
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {keywordsList.map((kw: string, idx: number) => (
                          <span
                            key={idx}
                            style={{
                              padding: '4px 10px',
                              borderRadius: 999,
                              background: '#FEF3C7',
                              color: '#92400E',
                              border: '1px solid #F59E0B',
                              fontSize: '0.78rem',
                              fontWeight: 800
                            }}
                          >
                            ⭐ {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. Governing Formulas, Equations & Derivations */}
                  {s?.formula && (
                    <div
                      style={{
                        padding: '14px 18px',
                        borderRadius: 18,
                        background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
                        border: '2px solid #86EFAC',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#15803D', textTransform: 'uppercase', marginBottom: 4 }}>
                        ⚡ Component 4: Governing Equation &amp; Scientific Notation
                      </div>
                      <div style={{ fontSize: '1.18rem', fontWeight: 900, color: '#14532D', letterSpacing: '0.02em', marginBottom: 8 }}>
                        {s.formula.equation}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 14, fontSize: '0.8rem', color: '#166534', fontWeight: 700 }}>
                        {[...(s.formula.reactants || []), ...(s.formula.products || [])].map((item: any, idx: number) => (
                          <span key={idx}>
                            <strong style={{ color: '#047857' }}>{item.symbol}:</strong> {item.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 5. Labeled Examination Schematics & 3D Structures */}
                  <div style={{ padding: 16, borderRadius: 18, background: '#FFFFFF', border: '1.5px solid #0284C7' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0369A1' }}>
                        📐 Component 5: Labeled Examination Diagrams &amp; 3D Schematics
                      </div>
                      <span style={{ fontSize: '0.74rem', color: '#0284C7', fontWeight: 700, background: '#E0F2FE', padding: '3px 8px', borderRadius: 999 }}>
                        High-Yield Exam Diagrams
                      </span>
                    </div>

                    {(s?.lessonImages?.length > 0 ? s.lessonImages : s?.imageUrl ? [{
                      id: 'exam-img-1',
                      title: `${s.topic || activeTopic} Examination Schematic`,
                      imageUrl: s.imageUrl,
                      explanation: s.imageExplanation
                    }] : []).map((imgAsset: any, imgIdx: number) => (
                      <div key={imgAsset.id || imgIdx} style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid #BAE6FD', marginBottom: 12 }}>
                        <div style={{ padding: '6px 12px', background: '#0284C7', color: '#FFFFFF', fontSize: '0.76rem', fontWeight: 800 }}>
                          Schematic #{imgIdx + 1}: {imgAsset.title}
                        </div>
                        <img src={imgAsset.imageUrl} alt={imgAsset.title} style={{ width: '100%', maxHeight: 280, objectFit: 'contain', padding: 6 }} />
                        {imgAsset.explanation?.whatToRemember && (
                          <div style={{ padding: '8px 12px', background: '#F0F9FF', fontSize: '0.8rem', color: '#0369A1', fontWeight: 700 }}>
                            🎯 Drawing &amp; Labeling Guideline: {imgAsset.explanation.whatToRemember}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* 6. Comparisons & Differences Table */}
                  {diffTable && (
                    <div style={{ padding: 16, borderRadius: 18, background: '#FFFFFF', border: '1.5px solid #CBD5E1' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A', marginBottom: 10 }}>
                        ⚖️ Component 6: Comparison &amp; Differences Table ({diffTable.titleA} vs. {diffTable.titleB})
                      </div>
                      <div style={{ overflowX: 'auto' }}>
                        <table className="futuristic-diff-table">
                          <thead>
                            <tr>
                              <th style={{ width: '25%' }}>Criteria</th>
                              <th style={{ width: '37.5%' }}>{diffTable.titleA}</th>
                              <th style={{ width: '37.5%' }}>{diffTable.titleB}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {diffTable.rows.map((r: any, idx: number) => (
                              <tr key={idx}>
                                <td style={{ fontWeight: 800, color: '#0284C7' }}>{r.aspect}</td>
                                <td>{r.itemA}</td>
                                <td>{r.itemB}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 7. Exam-Focused Points & Examiner Tips */}
                  {s?.conceptSections?.some((c: any) => c.examTip) && (
                    <div style={{ padding: 14, borderRadius: 16, background: '#FEF3C7', border: '1.5px solid #F59E0B' }}>
                      <div style={{ fontWeight: 800, color: '#92400E', fontSize: '0.88rem', marginBottom: 6 }}>
                        💡 Component 7: Examiner Tips &amp; High-Yield Focus Points
                      </div>
                      <ul style={{ margin: 0, paddingLeft: 18, color: '#78350F', fontSize: '0.83rem', lineHeight: 1.55 }}>
                        {s.conceptSections.filter((c: any) => c.examTip).map((c: any, i: number) => (
                          <li key={i}><strong>{c.title}:</strong> {c.examTip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 8 & 9. Short and Long Exam Questions with Model Answers */}
                  {s?.examQuestions?.length > 0 && (
                    <div style={{ padding: 16, borderRadius: 18, background: '#FFFFFF', border: '1.5px solid #CBD5E1' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A', marginBottom: 10 }}>
                        📝 Component 8 &amp; 9: Practice Exam Questions &amp; Model Answers
                      </div>
                      <div style={{ display: 'grid', gap: 10 }}>
                        {s.examQuestions.map((eq: any, idx: number) => (
                          <div key={idx} style={{ padding: 12, borderRadius: 14, background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: '0.83rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
                              <span>Q{idx + 1}. {eq.question}</span>
                              <span style={{ color: '#0284C7', fontWeight: 800, whiteSpace: 'nowrap' }}>{eq.marks || '3 Marks'}</span>
                            </div>
                            <div style={{ color: '#334155', lineHeight: 1.5, marginTop: 4 }}>
                              <strong style={{ color: '#047857' }}>Model Answer (Examiner Standard):</strong> {eq.modelAnswer}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 10. Quick Revision Summary */}
                  {s?.revisionNotes?.length > 0 && (
                    <div style={{ padding: 14, borderRadius: 16, background: '#F0FDF4', border: '1px solid #86EFAC', fontSize: '0.82rem' }}>
                      <div style={{ fontWeight: 800, color: '#166534', marginBottom: 6 }}>
                        📌 Component 10: High-Speed Revision Cram Notes
                      </div>
                      <ul style={{ margin: 0, paddingLeft: 18, color: '#14532D', lineHeight: 1.55 }}>
                        {s.revisionNotes.map((rn: string, i: number) => <li key={i}>{rn}</li>)}
                      </ul>
                    </div>
                  )}

                  {/* 11. 40-Mark Mock Test Challenge */}
                  <div
                    style={{
                      padding: 18,
                      borderRadius: 18,
                      background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 12
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, opacity: 0.9 }}>
                        ⚡ Component 11: Real Examination Simulation
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 900, marginTop: 2 }}>
                        Practice 40-Mark Test: {s?.topic || activeTopic}
                      </div>
                      <div style={{ fontSize: '0.78rem', opacity: 0.85, marginTop: 2 }}>
                        Option 1 (Objective) • Option 2 (Mixed 20+20) • Option 3 (Descriptive)
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openExamModal(s?.topic || activeTopic, s?.subject || subject)}
                      style={{
                        padding: '10px 20px',
                        borderRadius: 999,
                        background: '#FFFFFF',
                        color: '#0284C7',
                        border: 'none',
                        fontWeight: 900,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
                      }}
                    >
                      🚀 Start 40-Mark Test Now
                    </button>
                  </div>
                </div>
              )}

              {/* 8-Part Standard Format: Interactive Understanding-Check Question */}
              {s?.understandingCheck && (
                <div
                  style={{
                    marginTop: 16,
                    padding: 16,
                    borderRadius: 18,
                    background: 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)',
                    border: '2px solid #86EFAC',
                    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.08)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#166534', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>🎯</span>
                      <span>Check Your Understanding</span>
                    </div>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#15803D', background: '#DCFCE7', padding: '3px 8px', borderRadius: 999 }}>
                      Interactive Assessment
                    </span>
                  </div>
                  <p style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1F2937', marginBottom: 12 }}>
                    {s.understandingCheck.question}
                  </p>

                  {/* Options */}
                  {Array.isArray(s.understandingCheck.options) && s.understandingCheck.options.length > 0 && (
                    <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
                      {s.understandingCheck.options.map((opt: string, optIdx: number) => {
                        const evalState = evaluations[msg.id];
                        const isSelected = evalState?.selectedOption === opt;
                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={evalState?.evaluated || evalState?.loading}
                            onClick={() =>
                              handleEvaluateUnderstanding(
                                msg.id,
                                s.topic || activeTopic,
                                s.understandingCheck.question,
                                opt,
                                s.understandingCheck.correctAnswer,
                                s.understandingCheck.explanation
                              )
                            }
                            style={{
                              textAlign: 'left',
                              padding: '10px 14px',
                              borderRadius: 12,
                              border: isSelected
                                ? evalState?.isCorrect
                                  ? '2px solid #16A34A'
                                  : '2px solid #EF4444'
                                : '1.5px solid #E5E7EB',
                              background: isSelected
                                ? evalState?.isCorrect
                                  ? '#DCFCE7'
                                  : '#FEE2E2'
                                : '#FFFFFF',
                              color: '#1F2937',
                              fontSize: '0.86rem',
                              fontWeight: isSelected ? 700 : 500,
                              cursor: evalState?.evaluated ? 'default' : 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Realtime Feedback / Result */}
                  {evaluations[msg.id]?.loading && (
                    <div style={{ fontSize: '0.84rem', color: '#166534', fontStyle: 'italic' }}>
                      Evaluating your response...
                    </div>
                  )}

                  {evaluations[msg.id]?.evaluated && (
                    <div
                      style={{
                        padding: 12,
                        borderRadius: 12,
                        background: evaluations[msg.id]?.isCorrect ? '#DCFCE7' : '#FEF3C7',
                        border: evaluations[msg.id]?.isCorrect ? '1.5px solid #86EFAC' : '1.5px solid #FCD34D',
                        fontSize: '0.86rem',
                        lineHeight: 1.55,
                        color: evaluations[msg.id]?.isCorrect ? '#14532D' : '#78350F'
                      }}
                    >
                      {evaluations[msg.id]?.feedback}
                    </div>
                  )}
                </div>
              )}

              {/* Connected Learning Actions: Notes | Quiz | Game | Library */}
              <div style={{ marginTop: 18, padding: 14, borderRadius: 18, background: '#FFFDF9', border: '1px solid rgba(255,106,0,0.18)' }}>
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
                    onClick={() => openExamModal(s?.topic || activeTopic, s?.subject || subject)}
                    className="btn-glass"
                    style={{ justifyContent: 'flex-start', fontSize: '0.82rem', borderColor: 'rgba(2, 132, 199, 0.4)', color: '#0284C7' }}
                  >
                    <ShieldCheck size={15} color="#0284C7" />
                    <span>40-Mark Mock Test</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openGamesHub(s?.topic || activeTopic, s?.subject || subject, 'space_shooter')}
                    className="btn-glass"
                    style={{
                      justifyContent: 'flex-start',
                      fontSize: '0.82rem',
                      background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
                    }}
                  >
                    <Gamepad2 size={16} color="#FFFFFF" />
                    <span>🎮 Play Game for this Topic</span>
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

                {/* Adaptive Feedback Rating Bar */}
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px dashed #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6B7280' }}>
                    How was this explanation?
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => handleSendFeedback(msg.id, s?.topic || activeTopic, 'too_simple')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 999,
                        border: '1px solid #E5E7EB',
                        background: feedbacks[msg.id] === 'too_simple' ? '#FEF3C7' : '#FFFFFF',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      🟡 Too Simple
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendFeedback(msg.id, s?.topic || activeTopic, 'just_right')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 999,
                        border: '1px solid #86EFAC',
                        background: feedbacks[msg.id] === 'just_right' ? '#DCFCE7' : '#F0FDF4',
                        color: '#166534',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      🟢 Just Right
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendFeedback(msg.id, s?.topic || activeTopic, 'too_detailed')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 999,
                        border: '1px solid #E5E7EB',
                        background: feedbacks[msg.id] === 'too_detailed' ? '#E0F2FE' : '#FFFFFF',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      🔵 Too Detailed
                    </button>
                  </div>
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

      {/* Adaptive Learning Profile Modal */}
      <AdaptiveProfileModal
        isOpen={showAdaptiveModal}
        onClose={() => setShowAdaptiveModal(false)}
        apiFetch={apiFetch}
        onProfileUpdated={(updated) => {
          if (updated.explanation_style) {
            setExplanationLength(updated.explanation_style as any);
          }
          setActionToast('Adaptive learning preferences applied to AI Tutor!');
          setTimeout(() => setActionToast(''), 3500);
        }}
      />

      {/* Gemini AI Teacher Voice Mode Modal */}
      <VoiceTeacherModal
        isOpen={showVoiceModal}
        onClose={() => {
          setShowVoiceModal(false);
          setVoiceLessonTutorStructured(null);
          setVoiceLessonTutorContent('');
          setVoiceLessonQuestion('');
        }}
        topic={voiceLessonQuestion || activeTopic || 'Photosynthesis'}
        grade={grade}
        subject={subject}
        mode={mode}
        studentQuestion={voiceLessonQuestion || activeTopic}
        tutorStructured={voiceLessonTutorStructured}
        tutorContent={voiceLessonTutorContent}
        apiFetch={apiFetch}
      />
    </div>
  );
};
