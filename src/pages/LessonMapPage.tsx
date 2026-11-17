import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Compass,
  Flame,
  Lock,
  Map as MapIcon,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
  Upload,
  Users,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { useLearning } from '../context/LearningContext';

type NodeStatus = 'locked' | 'available' | 'in_progress' | 'completed' | 'needs_revision' | 'mastered';

interface LessonNode {
  id: string;
  subject: string;
  grade: number;
  unit: string;
  chapter: string;
  title: string;
  topics: string[];
  subtopics: string[];
  prerequisites: string[];
  importance: 'core' | 'high' | 'advanced';
  estimatedMinutes: number;
  x: number;
  y: number;
  status: NodeStatus;
  quizScore: number | null;
  xpEarned: number;
  missingPrerequisites: string[];
  practiceQuestion: {
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  formulas?: Array<{
    id: string;
    name: string;
    equation: string;
    meaning: string;
    symbols: Array<{ symbol: string; meaning: string; unit?: string }>;
    whenToUse: string;
    solvedExample: string;
  }>;
}

interface GraphPayload {
  subject: string;
  grade: number;
  nodes: LessonNode[];
  edges: Array<{ from: string; to: string }>;
  stats: {
    totalNodes: number;
    completedCount: number;
    masteredCount: number;
    needsRevisionCount: number;
    totalXp: number;
    readinessPercent: number;
  };
  recommendedNextId: string | null;
}

const SUBJECTS = ['Physics', 'Mathematics', 'Chemistry', 'Biology', 'History', 'Geography', 'English'];

const STATUS_STYLES: Record<NodeStatus, { border: string; bg: string; badge: string; label: string }> = {
  locked: { border: 'border-slate-700', bg: 'bg-slate-900/70', badge: 'bg-slate-800 text-slate-400', label: 'Locked' },
  available: { border: 'border-cyan-400/70', bg: 'bg-cyan-950/40', badge: 'bg-cyan-500/20 text-cyan-300', label: 'Available' },
  in_progress: { border: 'border-amber-400', bg: 'bg-amber-950/40', badge: 'bg-amber-500/20 text-amber-300', label: 'In Progress' },
  completed: { border: 'border-emerald-400', bg: 'bg-emerald-950/40', badge: 'bg-emerald-500/20 text-emerald-300', label: 'Completed' },
  needs_revision: { border: 'border-rose-400', bg: 'bg-rose-950/40', badge: 'bg-rose-500/20 text-rose-300', label: 'Needs Revision' },
  mastered: { border: 'border-violet-400', bg: 'bg-violet-950/50', badge: 'bg-violet-500/25 text-violet-200', label: 'Mastered' }
};

export const LessonMapPage: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const { apiFetch } = useLearning();
  const navigate = useNavigate();
  const [subject, setSubject] = useState('Physics');
  const [activeTab, setActiveTab] = useState<'map' | 'roadmap' | 'custom' | 'family'>('map');
  const [viewMode, setViewMode] = useState<'mind_map' | 'tree' | 'chapter'>('mind_map');
  const [learningMode, setLearningMode] = useState<'learn' | 'exam' | 'revision'>('learn');
  const [topicSearch, setTopicSearch] = useState('');
  const [customChapter, setCustomChapter] = useState('');
  const [customSyllabusText, setCustomSyllabusText] = useState('');
  const [customMaps, setCustomMaps] = useState<any[]>([]);
  const [customSaving, setCustomSaving] = useState(false);
  const [graph, setGraph] = useState<GraphPayload | null>(null);
  const [loading, setLoading] = useState(false);

  // Pan & Zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 20, y: 20 });
  const dragRef = useRef<{ active: boolean; sx: number; sy: number; px: number; py: number }>({
    active: false,
    sx: 0,
    sy: 0,
    px: 0,
    py: 0
  });

  // Lesson Detail & AI Companion state
  const [selectedNode, setSelectedNode] = useState<LessonNode | null>(null);
  const [lessonDetail, setLessonDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [assessMsg, setAssessMsg] = useState<string | null>(null);
  const [selectedFormula, setSelectedFormula] = useState<any>(null);

  // Embedded AI Study Companion
  const [companionPrompt, setCompanionPrompt] = useState('');
  const [companionReply, setCompanionReply] = useState<string | null>(null);
  const [companionLoading, setCompanionLoading] = useState(false);

  // Exam Roadmap state
  const [examName, setExamName] = useState('Final Board Examination');
  const [examDate, setExamDate] = useState(() => new Date(Date.now() + 21 * 86400_000).toISOString().slice(0, 10));
  const [roadmap, setRoadmap] = useState<any>(null);

  // Parent/Teacher summary
  const [familySummary, setFamilySummary] = useState<any>(null);

  const loadGraph = useCallback(async (sub: string) => {
    setLoading(true);
    try {
      const data = await apiFetch<GraphPayload>(`/api/lesson-map/graph?subject=${encodeURIComponent(sub)}&grade=10`);
      setGraph(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGraph(subject);
  }, [subject, loadGraph]);

  const openLesson = async (node: LessonNode) => {
    setSelectedNode(node);
    setSelectedOption(null);
    setAssessMsg(null);
    setCompanionReply(null);
    setSelectedFormula(node.formulas?.[0] ?? null);
    setDetailLoading(true);
    try {
      const res = await apiFetch<any>('/api/lesson-map/lesson-detail', {
        method: 'POST',
        body: JSON.stringify({ lessonId: node.id, grade: 10, board: 'CBSE' })
      });
      setLessonDetail(res.aiTeaching);
      loadGraph(subject);
    } finally {
      setDetailLoading(false);
    }
  };

  const submitPractice = async () => {
    if (!selectedNode || selectedOption === null) return;
    const isCorrect = selectedOption === selectedNode.practiceQuestion.correctIndex;
    const scorePercent = isCorrect ? 90 : 40;
    const res = await apiFetch<any>('/api/lesson-map/assess', {
      method: 'POST',
      body: JSON.stringify({ lessonId: selectedNode.id, scorePercent, timeSpentSec: 120 })
    });
    setAssessMsg(
      isCorrect
        ? `Mastered! +${res.result.xpEarned} XP — ${selectedNode.practiceQuestion.explanation}`
        : `Needs Revision (${scorePercent}%): ${selectedNode.practiceQuestion.explanation}`
    );
    loadGraph(subject);
  };

  const askCompanion = async (promptText: string) => {
    if (!selectedNode || !promptText.trim()) return;
    setCompanionLoading(true);
    try {
      const res = await apiFetch<any>('/api/ai-teacher/ask', {
        method: 'POST',
        body: JSON.stringify({
          question: `${promptText} (Lesson: ${selectedNode.title})`,
          topic: selectedNode.title,
          subject: selectedNode.subject,
          grade: 10,
          board: 'CBSE'
        })
      });
      setCompanionReply(res.teaching?.directAnswer || 'Explanation ready.');
    } finally {
      setCompanionLoading(false);
    }
  };

  const generateRoadmap = async () => {
    const res = await apiFetch<any>('/api/lesson-map/exam-roadmap', {
      method: 'POST',
      body: JSON.stringify({ subject, grade: 10, board: 'CBSE', examName, examDate })
    });
    setRoadmap(res);
  };

  const loadFamilySummary = async () => {
    const res = await apiFetch<any>('/api/lesson-map/progress-summary');
    setFamilySummary(res);
  };

  const loadCustomMaps = useCallback(async () => {
    const res = await apiFetch<any>('/api/lesson-map/custom');
    setCustomMaps(res.maps || []);
  }, [apiFetch]);

  const handleGenerateCustomMap = async () => {
    if (!customChapter.trim()) return;
    setCustomSaving(true);
    try {
      await apiFetch<any>('/api/lesson-map/generate-custom', {
        method: 'POST',
        body: JSON.stringify({
          subject,
          grade: 10,
          board: 'CBSE',
          chapter: customChapter.trim(),
          syllabusText: customSyllabusText.trim(),
          sourceLabel: 'Uploaded / Custom Syllabus Material'
        })
      });
      setCustomChapter('');
      setCustomSyllabusText('');
      await loadCustomMaps();
    } finally {
      setCustomSaving(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'roadmap' && !roadmap) generateRoadmap();
    if (activeTab === 'family') loadFamilySummary();
    if (activeTab === 'custom') loadCustomMaps();
  }, [activeTab]);

  const nodeById = useMemo(() => {
    const m = new Map<string, LessonNode>();
    graph?.nodes.forEach((n) => m.set(n.id, n));
    return m;
  }, [graph]);

  return (
    <div className={embedded ? 'bg-slate-950 text-slate-100 rounded-3xl p-4 md:p-6 border border-slate-800' : 'min-h-screen bg-slate-950 text-slate-100 pb-28 pt-6 px-4 md:px-8'}>
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-5">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase text-cyan-300 mb-1">
              <MapIcon className="w-4 h-4" /> AI Interactive Lesson Map & Exam Roadmap
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              {subject} Learning Journey (Grade 10)
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('map')}
              className={`px-4 py-2 rounded-xl text-xs font-bold ${
                activeTab === 'map' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}
            >
              Interactive Map
            </button>
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`px-4 py-2 rounded-xl text-xs font-bold ${
                activeTab === 'roadmap' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}
            >
              6-Phase Exam Roadmap
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold ${
                activeTab === 'custom' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}
            >
              <Upload className="w-3.5 h-3.5" /> Upload / Custom Map
            </button>
            <button
              onClick={() => setActiveTab('family')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold ${
                activeTab === 'family' ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Parent / Teacher View
            </button>
          </div>
        </div>

        {/* Subject Pills + Stats */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSubject(s);
                  setSelectedNode(null);
                  setRoadmap(null);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                  subject === s ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-cyan-400/50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {graph && (
            <div className="flex items-center gap-4 text-xs bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-2">
              <span className="text-emerald-300 font-bold">Readiness: {graph.stats.readinessPercent}%</span>
              <span className="text-violet-300 font-bold">Mastered: {graph.stats.masteredCount}/{graph.stats.totalNodes}</span>
              <span className="text-amber-300 font-bold flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> {graph.stats.totalXp} XP</span>
            </div>
          )}
        </div>

        {/* TAB 1: INTERACTIVE VISUAL MAP */}
        {activeTab === 'map' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden relative min-h-[420px]">
              {/* Map Toolbar: View Modes + Topic Search + Zoom */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-slate-800 bg-slate-950/60">
                <div className="flex items-center gap-1.5">
                  {([
                    ['mind_map', 'Mind Map'],
                    ['tree', 'Tree View'],
                    ['chapter', 'Chapter View']
                  ] as const).map(([vm, lbl]) => (
                    <button
                      key={vm}
                      onClick={() => setViewMode(vm)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                        viewMode === vm ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    value={topicSearch}
                    onChange={(e) => setTopicSearch(e.target.value)}
                    placeholder="Search topic..."
                    className="bg-transparent text-[11px] text-white outline-none w-28"
                  />
                </div>
                <div className="hidden md:flex items-center gap-1.5">
                  <button onClick={() => setZoom((z) => Math.min(1.4, z + 0.15))} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700">
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button onClick={() => setZoom((z) => Math.max(0.65, z - 0.15))} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700">
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setZoom(1); setPan({ x: 20, y: 20 }); }} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tree View or Chapter View */}
              {viewMode !== 'mind_map' && (
                <div className="p-4 space-y-2.5 max-h-[390px] overflow-y-auto">
                  {graph?.nodes
                    .filter((n) => !topicSearch.trim() || `${n.title} ${n.chapter} ${n.topics.join(' ')}`.toLowerCase().includes(topicSearch.toLowerCase()))
                    .map((node, idx) => {
                      const st = STATUS_STYLES[node.status];
                      return (
                        <button
                          key={node.id}
                          onClick={() => openLesson(node)}
                          className={`w-full text-left p-3 rounded-2xl border ${st.border} ${st.bg} flex items-center justify-between gap-3`}
                        >
                          <div>
                            <div className="text-[10px] text-cyan-300 font-bold uppercase">
                              {viewMode === 'tree' ? `${node.subject} → ${node.unit} → ${node.chapter}` : `Lesson ${idx + 1}: ${node.chapter}`}
                            </div>
                            <div className="text-sm font-bold text-white">{node.title}</div>
                            <div className="text-[11px] text-slate-400">Topics: {node.topics.join(' • ')} | Subtopics: {node.subtopics.join(', ')}</div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${st.badge}`}>{st.label}</span>
                        </button>
                      );
                    })}
                </div>
              )}

              {/* Desktop Interactive Pan/Zoom SVG + Node Canvas */}
              {viewMode === 'mind_map' && (
              <div
                className="hidden md:block relative h-[390px] overflow-hidden cursor-grab active:cursor-grabbing select-none"
                onMouseDown={(e) => {
                  dragRef.current = { active: true, sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y };
                }}
                onMouseMove={(e) => {
                  if (!dragRef.current.active) return;
                  setPan({
                    x: dragRef.current.px + (e.clientX - dragRef.current.sx),
                    y: dragRef.current.py + (e.clientY - dragRef.current.sy)
                  });
                }}
                onMouseUp={() => { dragRef.current.active = false; }}
                onMouseLeave={() => { dragRef.current.active = false; }}
              >
                <div
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: '0 0',
                    width: 1100,
                    height: 360,
                    position: 'relative'
                  }}
                >
                  <svg width={1100} height={360} className="absolute inset-0 pointer-events-none">
                    {graph?.edges.map((edge) => {
                      const from = nodeById.get(edge.from);
                      const to = nodeById.get(edge.to);
                      if (!from || !to) return null;
                      const x1 = from.x + 190;
                      const y1 = from.y + 44;
                      const x2 = to.x;
                      const y2 = to.y + 44;
                      const cx = (x1 + x2) / 2;
                      const active = from.status === 'completed' || from.status === 'mastered';
                      return (
                        <path
                          key={`${edge.from}-${edge.to}`}
                          d={`M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`}
                          fill="none"
                          stroke={active ? '#22D3EE' : '#334155'}
                          strokeWidth={active ? 3 : 2}
                          strokeDasharray={active ? undefined : '6 4'}
                        />
                      );
                    })}
                  </svg>

                  {graph?.nodes.map((node) => {
                    const st = STATUS_STYLES[node.status];
                    const isRec = graph.recommendedNextId === node.id;
                    return (
                      <button
                        key={node.id}
                        onClick={() => openLesson(node)}
                        style={{ left: node.x, top: node.y, width: 196 }}
                        className={`absolute text-left p-3 rounded-2xl border-2 transition shadow-lg ${st.border} ${st.bg} hover:scale-[1.03]`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${st.badge}`}>
                            {st.label}
                          </span>
                          {isRec && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[9px] font-black">
                              NEXT
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-bold text-white leading-snug">{node.title}</div>
                        <div className="text-[10px] text-slate-400 mt-1">{node.chapter} • {node.estimatedMinutes}m</div>
                      </button>
                    );
                  })}
                </div>
              </div>
              )}

              {/* Mobile Vertical Learning Journey */}
              <div className="md:hidden p-4 space-y-3">
                {graph?.nodes.map((node) => {
                  const st = STATUS_STYLES[node.status];
                  return (
                    <button
                      key={node.id}
                      onClick={() => openLesson(node)}
                      className={`w-full text-left p-3.5 rounded-2xl border-2 ${st.border} ${st.bg}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${st.badge}`}>{st.label}</span>
                        <span className="text-[11px] text-slate-400">{node.estimatedMinutes} min</span>
                      </div>
                      <div className="text-sm font-bold text-white">{node.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{node.topics.join(' • ')}</div>
                    </button>
                  );
                })}
              </div>

              {loading && (
                <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center text-xs text-cyan-300">
                  Loading syllabus graph...
                </div>
              )}
            </div>

            {/* Right Side Panel: Lesson Detail + Assessment + AI Companion */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4 max-h-[540px] overflow-y-auto">
              {!selectedNode ? (
                <div className="text-center py-12 text-slate-400 text-sm space-y-2">
                  <Compass className="w-8 h-8 mx-auto text-cyan-400" />
                  <div className="font-bold text-white">Select a Lesson Node</div>
                  <p className="text-xs">
                    Click any lesson on the map to view its full AI teaching breakdown, formula connections, practice check, and embedded AI Study Companion.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-bold uppercase text-cyan-300">
                        {selectedNode.unit} • {selectedNode.chapter}
                      </div>
                      <h2 className="text-lg font-black text-white">{selectedNode.title}</h2>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLES[selectedNode.status].badge}`}>
                      {STATUS_STYLES[selectedNode.status].label}
                    </span>
                  </div>

                  {selectedNode.status === 'locked' && (
                    <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-2">
                      <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        Prerequisites pending ({selectedNode.missingPrerequisites.join(', ')}). Pass the quick diagnostic below if you already know this topic!
                      </div>
                    </div>
                  )}

                  {detailLoading ? (
                    <div className="text-xs text-cyan-300 py-4">Generating structured AI lesson...</div>
                  ) : lessonDetail ? (
                    <div className="space-y-2.5 text-xs text-slate-300">
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                        <div className="font-bold text-cyan-300 mb-1">Definition & Core Understanding</div>
                        <p>{lessonDetail.universalSections?.definition || lessonDetail.directAnswer}</p>
                      </div>
                      {lessonDetail.universalSections?.memoryTechniques && (
                        <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
                          <div className="font-bold text-indigo-300 mb-1">Memory Trick & Story</div>
                          <p>{lessonDetail.universalSections.memoryTechniques.mnemonic}</p>
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* Formula Connection Map (when available) */}
                  {selectedNode.formulas && selectedNode.formulas.length > 0 && (
                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-cyan-500/30 space-y-2">
                      <div className="text-xs font-bold text-cyan-300">Formula Connection Map</div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedNode.formulas.map((f) => (
                          <button
                            key={f.id}
                            onClick={() => setSelectedFormula(f)}
                            className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-400/40 text-cyan-200 text-xs font-mono"
                          >
                            {f.equation}
                          </button>
                        ))}
                      </div>
                      {selectedFormula && (
                        <div className="text-[11px] text-slate-300 space-y-1 pt-1">
                          <div><b>Meaning:</b> {selectedFormula.meaning}</div>
                          <div><b>When to use:</b> {selectedFormula.whenToUse}</div>
                          <div><b>Example:</b> {selectedFormula.solvedExample}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Lesson Mastery / Diagnostic Check */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                      <CheckCircle2 className="w-4 h-4" /> Practice Check (Required for Completion)
                    </div>
                    <div className="text-xs text-white font-semibold">{selectedNode.practiceQuestion.prompt}</div>
                    <div className="space-y-1.5">
                      {selectedNode.practiceQuestion.options.map((opt, idx) => (
                        <button
                          key={opt}
                          onClick={() => setSelectedOption(idx)}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs border ${
                            selectedOption === idx ? 'border-cyan-400 bg-cyan-500/20 text-white' : 'border-slate-800 bg-slate-900 text-slate-300'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={submitPractice}
                      disabled={selectedOption === null}
                      className="w-full py-2 rounded-xl bg-emerald-500 disabled:opacity-40 text-slate-950 font-bold text-xs"
                    >
                      Verify Understanding
                    </button>
                    {assessMsg && <div className="text-xs text-amber-200 font-semibold">{assessMsg}</div>}
                  </div>

                  {/* Embedded AI Study Companion */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-violet-500/30 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-violet-300">
                      <Sparkles className="w-4 h-4" /> AI Study Companion
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {['Explain simply', 'Real-life example', 'Explain like a story', 'Important exam questions'].map((q) => (
                        <button
                          key={q}
                          onClick={() => askCompanion(q)}
                          className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-violet-400 text-[11px] text-slate-200"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-1.5">
                      <input
                        value={companionPrompt}
                        onChange={(e) => setCompanionPrompt(e.target.value)}
                        placeholder="Ask about this lesson..."
                        className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-xs text-white"
                      />
                      <button
                        onClick={() => askCompanion(companionPrompt)}
                        className="px-3 py-1.5 rounded-lg bg-violet-500 text-white text-xs font-bold"
                      >
                        Ask
                      </button>
                    </div>
                    {companionLoading && <div className="text-[11px] text-violet-300">Thinking...</div>}
                    {companionReply && <div className="text-xs text-slate-200 bg-slate-900/90 p-2.5 rounded-xl">{companionReply}</div>}
                  </div>

                  {/* Three Learning Modes + Smart STUDYAI Module Connections */}
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Learning Mode</span>
                      <div className="flex gap-1">
                        {(['learn', 'exam', 'revision'] as const).map((lm) => (
                          <button
                            key={lm}
                            onClick={() => setLearningMode(lm)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              learningMode === lm ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {lm}
                          </button>
                        ))}
                      </div>
                    </div>
                    {learningMode === 'exam' && (
                      <div className="text-[11px] text-amber-200 bg-amber-950/30 p-2 rounded-lg">
                        <b>Exam Focus ({selectedNode.importance.toUpperCase()}):</b> AI-estimated priority — practice 2-mark definitions & 5-mark derivations.
                      </div>
                    )}
                    {learningMode === 'revision' && (
                      <div className="text-[11px] text-emerald-200 bg-emerald-950/30 p-2 rounded-lg">
                        <b>Quick Revision:</b> {selectedNode.topics.join(' • ')} | Key subtopics: {selectedNode.subtopics.join(', ')}.
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <button
                        onClick={() => navigate(`/tutor?topic=${encodeURIComponent(selectedNode.title)}`)}
                        className="py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-400/40 text-cyan-200 text-[10px] font-bold"
                      >
                        AI Tutor
                      </button>
                      <button
                        onClick={() => navigate(`/notes?topic=${encodeURIComponent(selectedNode.title)}`)}
                        className="py-1.5 rounded-lg bg-amber-500/15 border border-amber-400/40 text-amber-200 text-[10px] font-bold"
                      >
                        AI Notebook
                      </button>
                      <button
                        onClick={() => navigate('/diagrams3d')}
                        className="py-1.5 rounded-lg bg-violet-500/15 border border-violet-400/40 text-violet-200 text-[10px] font-bold"
                      >
                        3D Visual Lab
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* TAB: UPLOAD / CUSTOM SYLLABUS LESSON MAP GENERATOR */}
        {activeTab === 'custom' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-5">
            <div>
              <h2 className="text-lg font-black text-white">Generate Lesson Map from Syllabus or Uploaded Material</h2>
              <p className="text-xs text-slate-400">
                Paste chapter headings or upload a `.txt` / `.md` syllabus outline. AI structures it into prerequisites & lessons while preserving your source reference.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                value={customChapter}
                onChange={(e) => setCustomChapter(e.target.value)}
                placeholder="Chapter Title (e.g. Electromagnetic Induction)"
                className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white"
              />
              <input
                type="file"
                accept=".txt,.md,.csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  file.text().then((txt) => setCustomSyllabusText(txt.slice(0, 5000)));
                }}
                className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-slate-300"
              />
            </div>
            <textarea
              rows={4}
              value={customSyllabusText}
              onChange={(e) => setCustomSyllabusText(e.target.value)}
              placeholder="Paste syllabus topics (one per line), e.g.:&#10;Magnetic Flux & Faraday's Law&#10;Lenz's Law & Conservation of Energy&#10;AC Generator & Applications"
              className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3 text-xs text-white"
            />
            <button
              onClick={handleGenerateCustomMap}
              disabled={customSaving || !customChapter.trim()}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 disabled:opacity-40 text-slate-950 font-bold text-xs"
            >
              {customSaving ? 'Generating Map...' : 'Generate & Save Custom Lesson Map'}
            </button>

            {customMaps.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {customMaps.map((cm) => (
                  <div key={cm.id} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{cm.chapter} ({cm.subject})</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        {cm.nodes?.length || 0} Lessons
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">Source: {cm.sourceLabel}</div>
                    <ul className="text-xs text-slate-300 list-disc pl-4 space-y-0.5">
                      {(cm.nodes || []).map((n: any) => <li key={n.id}>{n.title}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: 6-PHASE EXAM PREPARATION ROADMAP */}
        {activeTab === 'roadmap' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-5">
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Examination Name</label>
                <input
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Exam Date</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white"
                />
              </div>
              <button
                onClick={generateRoadmap}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Adapt 6-Phase Roadmap
              </button>
            </div>

            {roadmap && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roadmap.phases.map((p: any) => (
                  <div key={p.phase} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-300">{p.title}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">{p.allocatedDays} days</span>
                    </div>
                    <p className="text-xs text-slate-300">{p.focus}</p>
                    <ul className="space-y-1 text-[11px] text-slate-400 list-disc pl-4">
                      {p.tasks.map((t: string) => <li key={t}>{t}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PARENT & TEACHER PROGRESS SUMMARY */}
        {activeTab === 'family' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-violet-300">
                <Award className="w-5 h-5" /> Parent & Teacher Progress Overview
              </div>
              {familySummary && <div className="text-xs font-bold text-amber-300">Total Learning XP: {familySummary.totalXp}</div>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {familySummary?.subjects.map((sub: any) => (
                <div key={sub.subject} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between font-bold text-sm">
                    <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-cyan-400" /> {sub.subject}</span>
                    <span className="text-emerald-300">{sub.readinessPercent}%</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Completed: {sub.completed}/{sub.totalLessons} • Mastered: {sub.mastered} • Needs Revision: {sub.needsRevision}
                  </div>
                  {sub.revisionTopics.length > 0 && (
                    <div className="text-[11px] text-rose-300">
                      Revise: {sub.revisionTopics.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
