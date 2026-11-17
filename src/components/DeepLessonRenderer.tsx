import React, { useEffect, useState } from 'react';
import { BookOpen, CheckCircle2, Layers, Sparkles, X } from 'lucide-react';
import { useLearning } from '../context/LearningContext';

export interface DeepLessonRendererProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
  subject: string;
  chapter?: string;
  lessonId?: string;
  onMasteryUpdated?: () => void;
}

export const DeepLessonRenderer: React.FC<DeepLessonRendererProps> = ({
  isOpen,
  onClose,
  topic,
  subject,
  chapter,
  lessonId,
  onMasteryUpdated
}) => {
  const { apiFetch } = useLearning();
  const [depth, setDepth] = useState<'foundation' | 'deep' | 'expert'>('deep');
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeSubtopic, setActiveSubtopic] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [evalFeedback, setEvalFeedback] = useState<string | null>(null);
  const [interactReply, setInteractReply] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !topic) return;
    setLoading(true);
    setEvalFeedback(null);
    setInteractReply(null);
    apiFetch<any>('/api/deep-lesson/generate', {
      method: 'POST',
      body: JSON.stringify({ topic, subject, chapter: chapter || topic, grade: 10, board: 'CBSE', depthLevel: depth })
    })
      .then((res) => {
        setLesson(res.deepLesson);
        setActiveSubtopic(res.deepLesson?.section7_subtopics?.[0] || null);
      })
      .finally(() => setLoading(false));
  }, [isOpen, topic, subject, chapter, depth, apiFetch]);

  const handleInteract = async (action: string) => {
    const res = await apiFetch<any>('/api/deep-lesson/interact', {
      method: 'POST',
      body: JSON.stringify({ topic, subject, grade: 10, board: 'CBSE', action })
    });
    setInteractReply(res.interaction?.reply || '');
  };

  const submitMastery = async () => {
    if (!lesson?.section17_masteryAssessment) return;
    const qs = lesson.section17_masteryAssessment as any[];
    let correct = 0;
    const reteachNotes: string[] = [];
    qs.forEach((q) => {
      if (answers[q.id] === q.correctIndex) {
        correct++;
      } else {
        reteachNotes.push(q.reteachOnWrong);
      }
    });
    const scorePercent = Math.round((correct / Math.max(1, qs.length)) * 100);
    if (lessonId) {
      await apiFetch('/api/lesson-map/assess', {
        method: 'POST',
        body: JSON.stringify({ lessonId, scorePercent, timeSpentSec: 180 })
      });
      onMasteryUpdated?.();
    }
    setEvalFeedback(
      scorePercent >= 80
        ? `Mastered (${scorePercent}%)! All core concepts verified.`
        : `Score: ${scorePercent}%. Re-teaching guide: ${reteachNotes.join(' ')}`
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9998] bg-slate-950/90 backdrop-blur-md overflow-y-auto p-4 md:p-8 text-slate-100">
      <div className="max-w-5xl mx-auto bg-slate-900 border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-slate-950/95 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase text-cyan-300">{subject} • {chapter || topic}</div>
            <h2 className="text-xl font-black text-white">{topic} — Deep Concept Mastery</h2>
          </div>
          <div className="flex items-center gap-2">
            {(['foundation', 'deep', 'expert'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDepth(d)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize ${
                  depth === d ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {d}
              </button>
            ))}
            <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading || !lesson ? (
          <div className="p-12 text-center text-cyan-300 text-sm">Generating 17-section Deep Concept Mastery lesson...</div>
        ) : (
          <div className="p-6 space-y-6 text-sm">
            {/* 1 & 2: Introduction + Complete Definition */}
            <section className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="text-xs font-bold uppercase text-cyan-300 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" /> 1–2. Introduction & Complete Definition
              </div>
              <p className="text-slate-300">{lesson.section1_introduction.overview} {lesson.section1_introduction.whyLearnIt}</p>
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30">
                <div className="font-bold text-white">Formal Definition:</div>
                <p className="text-cyan-100">{lesson.section2_definition.formalDefinition}</p>
                <div className="font-bold text-white mt-2">Simple Meaning:</div>
                <p className="text-slate-300">{lesson.section2_definition.simpleDefinition}</p>
              </div>
            </section>

            {/* 3 & 4: Basic Understanding + How It Works */}
            <section className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="text-xs font-bold uppercase text-amber-300">3–4. Foundations & How It Works (Step by Step)</div>
              <p className="text-xs text-slate-400">Prerequisites: {lesson.section3_basicUnderstanding.prerequisites.join(' • ')}</p>
              <div className="space-y-2">
                {lesson.section4_howItWorks.map((st: any) => (
                  <div key={st.stepNumber} className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="font-bold text-white">Step {st.stepNumber}: {st.stageTitle}</div>
                    <div className="text-xs text-slate-300 mt-0.5"><b>What happens:</b> {st.whatHappens}</div>
                    <div className="text-xs text-cyan-200 mt-0.5"><b>Why it happens:</b> {st.whyItHappens}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* 5: Component-by-Component */}
            <section className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="text-xs font-bold uppercase text-emerald-300">5. Component-by-Component Breakdown</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {lesson.section5_components.map((c: any) => (
                  <div key={c.name} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                    <div className="font-bold text-white text-sm">{c.name}</div>
                    <div><b>Definition:</b> {c.definition}</div>
                    <div><b>Function:</b> {c.functionRole}</div>
                    <div><b>Importance:</b> {c.importance}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* 6: Deep Visual Explanation */}
            <section className="p-4 rounded-2xl bg-slate-950/70 border border-cyan-500/30 space-y-3">
              <div className="text-xs font-bold uppercase text-cyan-300">6. Deep Visual Explanation — {lesson.section6_visualExplanation.title}</div>
              <div className="rounded-xl overflow-hidden border border-slate-800" dangerouslySetInnerHTML={{ __html: lesson.section6_visualExplanation.svgMarkup }} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
                <div><b>What it represents:</b> {lesson.section6_visualExplanation.interpretation.whatItRepresents}</div>
                <div><b>How parts connect:</b> {lesson.section6_visualExplanation.interpretation.howPartsConnect}</div>
                <div><b>What to observe:</b> {lesson.section6_visualExplanation.interpretation.whatToObserve}</div>
                <div><b>Takeaway:</b> {lesson.section6_visualExplanation.interpretation.completeTakeaway}</div>
              </div>
            </section>

            {/* 7: Independently Selectable Subtopics */}
            <section className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="text-xs font-bold uppercase text-violet-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> 7. Detailed Subtopics (Click to Explore)
              </div>
              <div className="flex flex-wrap gap-2">
                {lesson.section7_subtopics.map((sub: any) => (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubtopic(sub)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                      activeSubtopic?.id === sub.id ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {sub.title}
                  </button>
                ))}
              </div>
              {activeSubtopic && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1 text-slate-300">
                  <div className="font-bold text-white">{activeSubtopic.title}</div>
                  <div><b>Definition:</b> {activeSubtopic.definition}</div>
                  <div><b>Explanation:</b> {activeSubtopic.explanation}</div>
                  <div><b>Application:</b> {activeSubtopic.application}</div>
                </div>
              )}
            </section>

            {/* 8-15: Applications, Misconceptions, Formulas & Exam Prep */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
                <div className="font-bold uppercase text-rose-300">11. Common Misconceptions</div>
                {lesson.section11_misconceptions.map((m: any, idx: number) => (
                  <div key={idx} className="space-y-1 text-slate-300">
                    <div className="text-rose-200"><b>Myth:</b> {m.incorrectIdea}</div>
                    <div className="text-emerald-200"><b>Truth:</b> {m.correctExplanation}</div>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
                <div className="font-bold uppercase text-amber-300">15. Exam Preparation (1–5 Marks)</div>
                {lesson.section15_examPreparation.twoMarkQuestions.map((q: any, idx: number) => (
                  <div key={idx} className="text-slate-300"><b>2M:</b> {q.q} — {q.a}</div>
                ))}
                <div className="text-[11px] text-slate-400 italic">{lesson.section15_examPreparation.disclaimer}</div>
              </div>
            </section>

            {/* Interactive Teaching Prompts */}
            <section className="p-4 rounded-2xl bg-slate-950/70 border border-violet-500/30 space-y-2">
              <div className="text-xs font-bold uppercase text-violet-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Interactive Teaching Assistant
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Explain this in simpler language',
                  'What happens if the primary component is removed?',
                  'Give another real-life example',
                  'Explain the diagram step by step'
                ].map((act) => (
                  <button
                    key={act}
                    onClick={() => handleInteract(act)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-violet-500/25 border border-slate-700 text-xs text-slate-200"
                  >
                    {act}
                  </button>
                ))}
              </div>
              {interactReply && <div className="p-3 rounded-xl bg-slate-900 text-xs text-slate-200">{interactReply}</div>}
            </section>

            {/* 17: Concept Mastery Assessment */}
            <section className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-3">
              <div className="text-xs font-bold uppercase text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> 17. Concept Mastery Assessment
              </div>
              {lesson.section17_masteryAssessment.map((q: any) => (
                <div key={q.id} className="space-y-1.5 text-xs">
                  <div className="font-bold text-white">{q.question}</div>
                  {q.options.map((opt: string, idx: number) => (
                    <button
                      key={opt}
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: idx }))}
                      className={`w-full text-left px-3 py-1.5 rounded-lg border ${
                        answers[q.id] === idx ? 'border-emerald-400 bg-emerald-500/20 text-white' : 'border-slate-800 bg-slate-900 text-slate-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ))}
              <button onClick={submitMastery} className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs">
                Evaluate Mastery
              </button>
              {evalFeedback && <div className="text-xs font-semibold text-amber-200">{evalFeedback}</div>}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
