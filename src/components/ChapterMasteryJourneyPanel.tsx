import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  GraduationCap,
  Award,
  ArrowRight,
  Target,
  Lightbulb
} from 'lucide-react';

interface ChapterMasteryJourneyPanelProps {
  defaultBoard?: string;
  defaultGrade?: number;
  defaultSubject?: string;
  defaultTopic?: string;
  teachingMode: 'normal' | 'exam';
  onTeachingModeChange: (mode: 'normal' | 'exam') => void;
  token?: string;
}

export const ChapterMasteryJourneyPanel: React.FC<ChapterMasteryJourneyPanelProps> = ({
  defaultBoard = 'CBSE',
  defaultGrade = 10,
  defaultSubject,
  defaultTopic,
  teachingMode,
  onTeachingModeChange,
  token
}) => {
  const [board, setBoard] = useState<string>(defaultBoard.toUpperCase().includes('ICSE') ? 'ICSE' : 'CBSE');
  const [grade, setGrade] = useState<number>(defaultGrade || 10);
  const [chaptersList, setChaptersList] = useState<any[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [journey, setJourney] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Stage 12 checkpoint state
  const [checkpointAnswers, setCheckpointAnswers] = useState<Record<string, string>>({});
  const [checkpointFeedback, setCheckpointFeedback] = useState<Record<string, any>>({});

  // Stage 15 assessment state
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, string>>({});
  const [assessmentReport, setAssessmentReport] = useState<any>(null);
  const [submittingAssessment, setSubmittingAssessment] = useState<boolean>(false);

  const authHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  useEffect(() => {
    const loadChapters = async () => {
      try {
        const res = await fetch(`/api/chapter-mastery/chapters?board=${encodeURIComponent(board)}&grade=${grade}`, {
          headers: authHeaders
        });
        const data = await res.json();
        const list = data.chapters || [];
        setChaptersList(list);
        if (list.length > 0 && !selectedChapterId) {
          setSelectedChapterId(list[0].id);
        }
      } catch (err) {
        console.warn('Failed to load Chapter Mastery chapters:', err);
      }
    };
    loadChapters();
  }, [board, grade]);

  const loadJourney = async (opts: { chapterId?: string; query?: string; mode?: 'normal' | 'exam' }) => {
    setLoading(true);
    try {
      const res = await fetch('/api/chapter-mastery/start', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          chapterId: opts.chapterId,
          query: opts.query,
          board,
          grade,
          subject: defaultSubject,
          teachingMode: opts.mode || teachingMode
        })
      });
      const data = await res.json();
      if (data?.journey) {
        setJourney(data.journey);
        setSelectedChapterId(data.journey.chapterMeta.chapterId);
        if (data.journey.progress?.assessmentReport) {
          setAssessmentReport(data.journey.progress.assessmentReport);
        } else {
          setAssessmentReport(null);
        }
      }
    } catch (err) {
      console.warn('Failed to load Chapter Mastery Journey:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChapterId) {
      loadJourney({ chapterId: selectedChapterId, mode: teachingMode });
    } else if (defaultTopic) {
      loadJourney({ query: defaultTopic, mode: teachingMode });
    }
  }, [selectedChapterId, teachingMode]);

  const handleToggleBookmark = async (topicName: string) => {
    if (!journey) return;
    try {
      const res = await fetch('/api/chapter-mastery/progress', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          chapterId: journey.chapterMeta.chapterId,
          toggleBookmarkTopic: topicName
        })
      });
      const data = await res.json();
      if (data?.progress) {
        setJourney((prev: any) => (prev ? { ...prev, progress: data.progress } : prev));
      }
    } catch {}
  };

  const handleCheckCheckpoint = async (chk: any) => {
    if (!journey) return;
    const ans = checkpointAnswers[chk.id] || '';
    if (!ans.trim()) return;
    try {
      const res = await fetch('/api/chapter-mastery/checkpoint', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          chapterId: journey.chapterMeta.chapterId,
          checkpointId: chk.id,
          topicName: chk.topicName,
          studentAnswer: ans
        })
      });
      const data = await res.json();
      if (data?.evaluation) {
        setCheckpointFeedback((prev) => ({ ...prev, [chk.id]: data.evaluation }));
        if (data.evaluation.progress) {
          setJourney((prev: any) => (prev ? { ...prev, progress: data.evaluation.progress } : prev));
        }
      }
    } catch {}
  };

  const handleSubmitAssessment = async () => {
    if (!journey) return;
    setSubmittingAssessment(true);
    try {
      const res = await fetch('/api/chapter-mastery/assessment/submit', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          chapterId: journey.chapterMeta.chapterId,
          answers: assessmentAnswers
        })
      });
      const data = await res.json();
      if (data?.report) {
        setAssessmentReport(data.report);
        loadJourney({ chapterId: journey.chapterMeta.chapterId, mode: teachingMode });
      }
    } catch {} finally {
      setSubmittingAssessment(false);
    }
  };

  const meta = journey?.chapterMeta;
  const stages = journey?.stages;
  const topicStates = journey?.progress?.topicStates || {};
  const bookmarks: string[] = journey?.progress?.bookmarkedTopics || [];

  return (
    <div style={{ display: 'grid', gap: 18, paddingBottom: 40 }}>
      {/* Top Selector & Controls Bar */}
      <div
        className="glass-card"
        style={{
          padding: 18,
          borderRadius: 18,
          border: '1.5px solid rgba(255, 106, 0, 0.25)',
          background: 'linear-gradient(135deg, #FFFBF7 0%, #FFFFFF 100%)'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <GraduationCap size={20} color="#FF6A00" />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#111827', margin: 0 }}>
                Chapter Mastery Journey — Zero to Complete Understanding
              </h2>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#4B5563', margin: '4px 0 0 0' }}>
              16-Stage Guided Curriculum Learning • Grounded in ICSE & CBSE Knowledge Bank
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => onTeachingModeChange('normal')}
              style={{
                padding: '7px 14px',
                borderRadius: 10,
                border: 'none',
                fontWeight: 800,
                fontSize: '0.8rem',
                cursor: 'pointer',
                background: teachingMode === 'normal' ? '#FF6A00' : '#F3F4F6',
                color: teachingMode === 'normal' ? '#FFFFFF' : '#374151'
              }}
            >
              🌱 Normal Learning Mode
            </button>
            <button
              type="button"
              onClick={() => onTeachingModeChange('exam')}
              style={{
                padding: '7px 14px',
                borderRadius: 10,
                border: 'none',
                fontWeight: 800,
                fontSize: '0.8rem',
                cursor: 'pointer',
                background: teachingMode === 'exam' ? '#FF6A00' : '#F3F4F6',
                color: teachingMode === 'exam' ? '#FFFFFF' : '#374151'
              }}
            >
              🎯 Exam Preparation Mode
            </button>
          </div>
        </div>

        {/* Board, Class, and Chapter Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          <select
            value={board}
            onChange={(e) => {
              setBoard(e.target.value);
              setSelectedChapterId('');
            }}
            style={{ padding: '9px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontWeight: 700, fontSize: '0.84rem' }}
          >
            <option value="CBSE">CBSE / NCERT</option>
            <option value="ICSE">ICSE / CISCE</option>
          </select>

          <select
            value={grade}
            onChange={(e) => {
              setGrade(Number(e.target.value));
              setSelectedChapterId('');
            }}
            style={{ padding: '9px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontWeight: 700, fontSize: '0.84rem' }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((g) => (
              <option key={g} value={g}>Class {g}</option>
            ))}
          </select>

          <select
            value={selectedChapterId}
            onChange={(e) => setSelectedChapterId(e.target.value)}
            style={{ padding: '9px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontWeight: 700, fontSize: '0.84rem', gridColumn: 'span 2' }}
          >
            {chaptersList.map((ch) => (
              <option key={ch.id} value={ch.id}>
                [{ch.subject}] {ch.chapterTitle}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="glass-card" style={{ padding: 24, textAlign: 'center', fontWeight: 700, color: '#FF6A00' }}>
          Loading 16-Stage Chapter Mastery Journey...
        </div>
      )}

      {!loading && journey && meta && stages && (
        <>
          {/* Chapter Progress & Topic Navigation Strip */}
          <div className="glass-card" style={{ padding: 18, borderRadius: 18 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#FF6A00' }}>
                  {meta.board} • CLASS {meta.grade} • {meta.subject.toUpperCase()} • {meta.syllabusUnit}
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#111827', margin: '2px 0' }}>
                  {meta.chapterTitle}
                </h3>
                <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                  Source: {meta.prescribedTextbook} • Teaching Flow: {meta.subjectTeachingSequence.slice(0, 6).join(' → ')}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#10B981' }}>
                  {stages.stage16_masteryReport.overallMasteryPercentage}% Mastered
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                  {stages.stage16_masteryReport.topicsMasteredCount} / {stages.stage16_masteryReport.totalTopicsCount} Topics Verified
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(stages.stage4_conceptByConcept || []).map((c: any) => {
                const st = topicStates[c.topicTitle] || 'Not Started';
                const isBookmarked = bookmarks.includes(c.topicTitle);
                return (
                  <div
                    key={c.topicIndex}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 10px',
                      borderRadius: 999,
                      background: st === 'Mastered' || st === 'Assessment Passed' ? '#DCFCE7' : st === 'Understood' ? '#DBEAFE' : st === 'Needs Revision' ? '#FEF3C7' : '#F3F4F6',
                      border: '1px solid rgba(0,0,0,0.08)',
                      fontSize: '0.76rem',
                      fontWeight: 700
                    }}
                  >
                    <span>{c.topicTitle}</span>
                    <span style={{ opacity: 0.75 }}>({st})</span>
                    <button
                      type="button"
                      onClick={() => handleToggleBookmark(c.topicTitle)}
                      title="Bookmark topic"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                    >
                      <Bookmark size={13} color={isBookmarked ? '#FF6A00' : '#9CA3AF'} fill={isBookmarked ? '#FF6A00' : 'none'} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STAGE 1 & 2: INTRODUCTION + ZERO-LEVEL FOUNDATION */}
          <div className="glass-card" style={{ padding: 20, borderRadius: 18, display: 'grid', gap: 14 }}>
            <div>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 900, color: '#FF6A00', marginBottom: 6 }}>
                Stage 1 — Chapter Introduction
              </h4>
              <p style={{ fontSize: '0.88rem', color: '#1F2937', lineHeight: 1.65 }}>{stages.stage1_introduction.overview}</p>
              <div style={{ marginTop: 8, fontSize: '0.82rem', color: '#374151' }}>
                <strong>Everyday Connection:</strong> {stages.stage1_introduction.everydayConnection}
              </div>
            </div>

            <div style={{ padding: 14, borderRadius: 12, background: '#F0F9FF', border: '1px solid #BAE6FD' }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0369A1', marginBottom: 6 }}>
                Stage 2 — Zero-Level Foundation (Prerequisites)
              </h4>
              <div style={{ display: 'grid', gap: 6 }}>
                {stages.stage2_zeroLevelFoundation.prerequisites.map((p: any, idx: number) => (
                  <div key={idx} style={{ fontSize: '0.82rem', color: '#0C4A6E' }}>
                    <strong>• {p.term}:</strong> {p.simpleIdea} <em>({p.whyNeeded})</em>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* STAGE 3: DEFINITIONS & KEY TERMINOLOGY */}
          <div className="glass-card" style={{ padding: 20, borderRadius: 18 }}>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 900, color: '#FF6A00', marginBottom: 10 }}>
              Stage 3 — Official Definitions & Simple Language Meanings
            </h4>
            <div style={{ display: 'grid', gap: 10 }}>
              {stages.stage3_definitionsAndTerminology.map((d: any, idx: number) => (
                <div key={idx} style={{ padding: 12, borderRadius: 12, background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#111827' }}>
                    {d.term} {d.symbolOrUnit ? <span style={{ color: '#FF6A00' }}>({d.symbolOrUnit})</span> : null}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#1F2937', marginTop: 4 }}>
                    <strong>Official Definition:</strong> {d.officialDefinition}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#4B5563', marginTop: 2 }}>
                    <strong>Example:</strong> {d.example}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STAGE 4 & 5: CONCEPT-BY-CONCEPT TEACHING & STEP-BY-STEP PROCESSES */}
          <div className="glass-card" style={{ padding: 20, borderRadius: 18 }}>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 900, color: '#FF6A00', marginBottom: 12 }}>
              Stage 4 & 5 — Concept-by-Concept Teaching & Working Mechanisms
            </h4>
            <div style={{ display: 'grid', gap: 12 }}>
              {stages.stage4_conceptByConcept.map((c: any) => (
                <div key={c.topicIndex} style={{ padding: 14, borderRadius: 14, background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                  <div style={{ fontWeight: 900, fontSize: '0.92rem', color: '#111827', marginBottom: 6 }}>
                    {c.introduction}
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#374151', lineHeight: 1.6, margin: '0 0 8px 0' }}>
                    {c.howAndWhyItWorks}
                  </p>
                  <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                    <strong>Connection:</strong> {c.connectionToPrevious} • <strong>Watch Out:</strong> {c.commonMisconception}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STAGE 6: DIAGRAMS & VISUAL LEARNING */}
          {stages.stage6_diagramsAndVisuals.length > 0 && (
            <div className="glass-card" style={{ padding: 20, borderRadius: 18 }}>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 900, color: '#FF6A00', marginBottom: 12 }}>
                Stage 6 — Verified Diagrams & Visual Explanations
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                {stages.stage6_diagramsAndVisuals.map((v: any, idx: number) => (
                  <div key={idx} style={{ padding: 12, borderRadius: 14, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.86rem', marginBottom: 8 }}>{v.title}</div>
                    {v.dataUrl && (
                      <img src={v.dataUrl} alt={v.title} style={{ width: '100%', borderRadius: 10, marginBottom: 8 }} />
                    )}
                    <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.5 }}>
                      <strong>What it shows:</strong> {v.whatItShows}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#047857', fontWeight: 700, marginTop: 4 }}>
                      💡 Takeaway: {v.keyTakeaway}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STAGE 8 & 9: COMPARISONS + FORMULAS & SOLVED NUMERICALS */}
          <div className="glass-card" style={{ padding: 20, borderRadius: 18, display: 'grid', gap: 14 }}>
            {stages.stage8_differencesAndComparisons.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.96rem', fontWeight: 900, color: '#FF6A00', marginBottom: 8 }}>
                  Stage 8 — Important Differences & Comparisons
                </h4>
                {stages.stage8_differencesAndComparisons.map((comp: any, idx: number) => (
                  <div key={idx} style={{ overflowX: 'auto', marginBottom: 10 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: 6 }}>{comp.title}</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                      <thead>
                        <tr style={{ background: '#F3F4F6' }}>
                          <th style={{ padding: 8, textAlign: 'left', border: '1px solid #E5E7EB' }}>Aspect</th>
                          <th style={{ padding: 8, textAlign: 'left', border: '1px solid #E5E7EB' }}>{comp.leftColumnHeader}</th>
                          <th style={{ padding: 8, textAlign: 'left', border: '1px solid #E5E7EB' }}>{comp.rightColumnHeader}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comp.rows.map((r: any, rIdx: number) => (
                          <tr key={rIdx}>
                            <td style={{ padding: 8, fontWeight: 700, border: '1px solid #E5E7EB' }}>{r.aspect}</td>
                            <td style={{ padding: 8, border: '1px solid #E5E7EB' }}>{r.leftValue}</td>
                            <td style={{ padding: 8, border: '1px solid #E5E7EB' }}>{r.rightValue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}

            {stages.stage9_formulasDerivationsNumericals.applicable && (
              <div>
                <h4 style={{ fontSize: '0.96rem', fontWeight: 900, color: '#FF6A00', marginBottom: 8 }}>
                  Stage 9 — Formulas, Units & Step-by-Step Solved Problems
                </h4>
                {stages.stage9_formulasDerivationsNumericals.formulas.map((f: any, idx: number) => (
                  <div key={idx} style={{ padding: 10, borderRadius: 10, background: '#FFF7ED', border: '1px solid #FED7AA', marginBottom: 8, fontSize: '0.82rem' }}>
                    <strong>{f.name}:</strong> <code>{f.formula}</code> • Units: <em>{f.siUnit}</em>
                    <div style={{ color: '#4B5563', marginTop: 2 }}>{f.symbolMeanings} — {f.conditionsAndDerivation}</div>
                  </div>
                ))}
                {stages.stage9_formulasDerivationsNumericals.solvedNumericals.map((p: any, idx: number) => (
                  <div key={idx} style={{ padding: 12, borderRadius: 12, background: '#F9FAFB', border: '1px solid #E5E7EB', fontSize: '0.82rem' }}>
                    <div style={{ fontWeight: 800, marginBottom: 4 }}>Problem: {p.problemStatement}</div>
                    <div><strong>Given:</strong> {p.givenInformation} | <strong>Formula:</strong> <code>{p.formulaUsed}</code></div>
                    <ul style={{ margin: '6px 0', paddingLeft: 18 }}>
                      {p.substitutionAndSteps.map((s: string, sIdx: number) => (
                        <li key={sIdx}>{s}</li>
                      ))}
                    </ul>
                    <div style={{ fontWeight: 800, color: '#047857' }}>Final Answer: {p.finalAnswerWithUnits}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* STAGE 11 & 12: MISCONCEPTIONS + INTERACTIVE CHECKPOINTS */}
          <div className="glass-card" style={{ padding: 20, borderRadius: 18 }}>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 900, color: '#FF6A00', marginBottom: 10 }}>
              Stage 12 — Interactive Understanding Checkpoints (With Misconception Diagnosis)
            </h4>
            <div style={{ display: 'grid', gap: 12 }}>
              {stages.stage12_interactiveCheckpoints.map((chk: any) => {
                const fb = checkpointFeedback[chk.id];
                return (
                  <div key={chk.id} style={{ padding: 14, borderRadius: 14, background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                    <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#6B7280', marginBottom: 4 }}>
                      Topic: {chk.topicName} ({chk.questionType})
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', marginBottom: 8 }}>{chk.question}</div>

                    {chk.options && chk.options.length > 0 ? (
                      <div style={{ display: 'grid', gap: 6, marginBottom: 8 }}>
                        {chk.options.map((opt: string) => (
                          <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', cursor: 'pointer' }}>
                            <input
                              type="radio"
                              name={chk.id}
                              checked={checkpointAnswers[chk.id] === opt}
                              onChange={() => setCheckpointAnswers((prev) => ({ ...prev, [chk.id]: opt }))}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder="Type your answer..."
                        value={checkpointAnswers[chk.id] || ''}
                        onChange={(e) => setCheckpointAnswers((prev) => ({ ...prev, [chk.id]: e.target.value }))}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', marginBottom: 8, fontSize: '0.82rem' }}
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => handleCheckCheckpoint(chk)}
                      className="btn-orange"
                      style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: 8 }}
                    >
                      Check Understanding
                    </button>

                    {fb && (
                      <div
                        style={{
                          marginTop: 10,
                          padding: 10,
                          borderRadius: 10,
                          background: fb.isCorrect ? '#DCFCE7' : '#FEF3C7',
                          color: fb.isCorrect ? '#166534' : '#92400E',
                          fontSize: '0.8rem'
                        }}
                      >
                        <div style={{ fontWeight: 800 }}>
                          {fb.isCorrect ? '✅ Correct! Topic marked Understood.' : '⚠️ Needs Revision — Let’s re-learn this differently:'}
                        </div>
                        {fb.diagnosedMisconception && (
                          <div style={{ marginTop: 4 }}><strong>Likely Misconception:</strong> {fb.diagnosedMisconception}</div>
                        )}
                        <div style={{ marginTop: 4 }}>{fb.reTeachingExplanation}</div>
                        {!fb.isCorrect && (
                          <div style={{ marginTop: 4 }}><strong>Simpler Example:</strong> {fb.simplerExample}</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* STAGE 13 & 14: COMPLETE REVISION + EXAM PREPARATION */}
          <div className="glass-card" style={{ padding: 20, borderRadius: 18 }}>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 900, color: '#FF6A00', marginBottom: 8 }}>
              Stage 13 — Complete Chapter Revision Sheet
            </h4>
            <p style={{ fontSize: '0.84rem', color: '#374151', marginBottom: 10 }}>{stages.stage13_completeRevision.chapterSummary}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {stages.stage13_completeRevision.keyFacts.map((f: string, idx: number) => (
                <span key={idx} style={{ padding: '5px 10px', borderRadius: 8, background: '#EFF6FF', color: '#1E40AF', fontSize: '0.78rem', fontWeight: 700 }}>
                  • {f}
                </span>
              ))}
            </div>

            {teachingMode === 'exam' && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #E5E7EB' }}>
                <h4 style={{ fontSize: '0.96rem', fontWeight: 900, color: '#EA580C', marginBottom: 6 }}>
                  Stage 14 — {meta.board} Class {meta.grade} Exam Preparation Questions & Model Answers
                </h4>
                <p style={{ fontSize: '0.76rem', color: '#6B7280', marginBottom: 10 }}>{stages.stage14_examPreparation.disclaimer}</p>
                <div style={{ display: 'grid', gap: 8 }}>
                  {stages.stage14_examPreparation.questionsByType.map((q: any, idx: number) => (
                    <div key={idx} style={{ padding: 10, borderRadius: 10, background: '#FFF7ED', border: '1px solid #FED7AA', fontSize: '0.8rem' }}>
                      <div style={{ fontWeight: 800 }}>[{q.questionType} • {q.marks} Marks] {q.question}</div>
                      <div style={{ marginTop: 4, color: '#1F2937' }}><strong>Model Answer:</strong> {q.modelAnswer}</div>
                      <div style={{ marginTop: 2, color: '#6B7280' }}><strong>Marking Guidance:</strong> {q.markingGuidance}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* STAGE 15 & 16: FINAL CHAPTER ASSESSMENT & MASTERY REPORT */}
          <div className="glass-card" style={{ padding: 20, borderRadius: 18 }}>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 900, color: '#FF6A00', marginBottom: 10 }}>
              Stage 15 & 16 — Final Chapter Assessment & Mastery Report
            </h4>
            <div style={{ display: 'grid', gap: 10, marginBottom: 14 }}>
              {stages.stage15_finalAssessment.questions.map((q: any, idx: number) => (
                <div key={q.id} style={{ padding: 12, borderRadius: 12, background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.84rem', marginBottom: 6 }}>
                    Q{idx + 1} ({q.marks} Marks • {q.topic}): {q.question}
                  </div>
                  {q.options && q.options.length > 0 ? (
                    <div style={{ display: 'grid', gap: 4 }}>
                      {q.options.map((opt: string) => (
                        <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem' }}>
                          <input
                            type="radio"
                            name={`assess-${q.id}`}
                            checked={assessmentAnswers[q.id] === opt}
                            onChange={() => setAssessmentAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="Write your concise answer..."
                      value={assessmentAnswers[q.id] || ''}
                      onChange={(e) => setAssessmentAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: '0.8rem' }}
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              disabled={submittingAssessment}
              onClick={handleSubmitAssessment}
              className="btn-orange"
              style={{ padding: '10px 18px', fontSize: '0.86rem', borderRadius: 12 }}
            >
              {submittingAssessment ? 'Grading Assessment...' : `Submit Final Chapter Assessment (${stages.stage15_finalAssessment.totalMarks} Marks)`}
            </button>

            {assessmentReport && (
              <div style={{ marginTop: 16, padding: 16, borderRadius: 14, background: assessmentReport.passed ? '#ECFDF5' : '#FFFBEB', border: '1px solid #A7F3D0' }}>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: assessmentReport.passed ? '#065F46' : '#92400E' }}>
                  Score: {assessmentReport.score} / {assessmentReport.totalMarks} ({assessmentReport.percentage}%) — {assessmentReport.passed ? '🎉 Chapter Assessment Passed!' : '📚 Needs Revision'}
                </div>
                <div style={{ display: 'grid', gap: 6, marginTop: 10 }}>
                  {assessmentReport.topicWisePerformance.map((tp: any) => (
                    <div key={tp.topic} style={{ fontSize: '0.8rem' }}>
                      <strong>{tp.topic}:</strong> {tp.earnedMarks}/{tp.maxMarks} ({tp.percentage}%) — <strong>{tp.state}</strong>
                    </div>
                  ))}
                </div>
                {assessmentReport.nextRecommendedChapter && (
                  <button
                    type="button"
                    onClick={() => setSelectedChapterId(assessmentReport.nextRecommendedChapter.chapterId)}
                    style={{
                      marginTop: 12,
                      padding: '8px 14px',
                      borderRadius: 10,
                      border: 'none',
                      background: '#FF6A00',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <span>Next Chapter: {assessmentReport.nextRecommendedChapter.chapterTitle}</span>
                    <ArrowRight size={15} />
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
