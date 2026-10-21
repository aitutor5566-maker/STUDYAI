import React, { useEffect, useState } from 'react';
import { CheckCircle2, HelpCircle, RotateCcw, X, Sparkles } from 'lucide-react';
import { useLearning } from '../context/LearningContext';

export const QuizModal: React.FC = () => {
  const { modalQuiz, closeQuizModal, apiFetch, triggerRefresh } = useLearning();
  const [topic, setTopic] = useState(modalQuiz.topic || 'Photosynthesis');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [loading, setLoading] = useState(false);
  const [quizId, setQuizId] = useState<string>('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    if (modalQuiz.open) {
      setTopic(modalQuiz.topic || 'Photosynthesis');
      setResult(null);
      setAnswers({});
      loadQuiz(modalQuiz.topic || 'Photosynthesis', difficulty);
    }
  }, [modalQuiz.open, modalQuiz.topic]);

  const loadQuiz = async (targetTopic: string, diff: string) => {
    setLoading(true);
    setResult(null);
    setAnswers({});
    try {
      const res = await apiFetch('/api/quizzes/generate', {
        method: 'POST',
        body: JSON.stringify({ topic: targetTopic, difficulty: diff, count: 5 })
      });
      setQuizId(res.quizId);
      setQuestions(res.questions || []);
    } finally {
      setLoading(false);
    }
  };

  if (!modalQuiz.open) return null;

  const handleSubmit = async () => {
    if (!quizId) return;
    setLoading(true);
    try {
      const ordered = questions.map((_, idx) => (answers[idx] !== undefined ? answers[idx] : -1));
      const res = await apiFetch(`/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers: ordered })
      });
      setResult(res);
      triggerRefresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-modal-overlay" role="dialog" aria-modal="true" aria-label="Interactive Practice Quiz">
      <div className="glass-modal-content" style={{ maxWidth: 740 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FFF3E8', color: '#FF6A00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HelpCircle size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Adaptive Topic Quiz: {topic}</h2>
              <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Server-validated answer keys & instant mistake explanations</p>
            </div>
          </div>
          <button type="button" onClick={closeQuizModal} className="btn-glass" style={{ padding: '6px 10px' }} aria-label="Close Quiz">
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <div className="glass-input-wrap" style={{ flex: 1 }}>
            <input className="glass-input" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic..." />
          </div>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as any)}
            style={{ padding: '8px 14px', borderRadius: 999, border: '1px solid rgba(0,0,0,0.12)', fontWeight: 600 }}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <button type="button" onClick={() => loadQuiz(topic, difficulty)} className="btn-glass">
            <Sparkles size={15} /> New Questions
          </button>
        </div>

        {loading && <div style={{ padding: 28, textAlign: 'center', fontWeight: 700, color: '#FF6A00' }}>Loading validated questions...</div>}

        {!loading && !result && questions.length > 0 && (
          <div style={{ display: 'grid', gap: 16 }}>
            {questions.map((q, qIdx) => (
              <div key={q.id || qIdx} style={{ padding: 16, borderRadius: 18, background: '#FFFFFF', border: '1px solid rgba(255,106,0,0.2)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 10 }}>
                  {qIdx + 1}. {q.question}
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {q.options.map((opt: string, oIdx: number) => {
                    const selected = answers[qIdx] === oIdx;
                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => setAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 12,
                          border: selected ? '2px solid #FF6A00' : '1px solid rgba(0,0,0,0.1)',
                          background: selected ? '#FFF3E8' : '#FFFDFB',
                          textAlign: 'left',
                          fontWeight: selected ? 700 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        {String.fromCharCode(65 + oIdx)}. {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <button type="button" onClick={handleSubmit} className="btn-orange" style={{ justifySelf: 'end' }}>
              Submit Quiz Answers →
            </button>
          </div>
        )}

        {!loading && result && (
          <div style={{ padding: 20, borderRadius: 20, background: '#FFFDFB', border: '1.5px solid #FF6A00' }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <CheckCircle2 size={38} color="#16A34A" />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: 6 }}>
                Score: {result.score} / {result.total} ({result.accuracy}%)
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>Saved to your Library & Academic Progress</p>
            </div>
            {result.mistakes?.length > 0 && (
              <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
                {result.mistakes.map((m: any, idx: number) => (
                  <div key={idx} style={{ padding: 12, borderRadius: 14, background: '#FFF', border: '1px solid rgba(220,38,38,0.25)', fontSize: '0.84rem' }}>
                    <div style={{ fontWeight: 700 }}>{m.question}</div>
                    <div style={{ color: '#DC2626' }}>Your answer: {m.yourAnswer}</div>
                    <div style={{ color: '#15803D', fontWeight: 700 }}>Correct: {m.correctAnswer}</div>
                    <div style={{ color: '#6B7280', marginTop: 3 }}>{m.explanation}</div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button type="button" onClick={() => loadQuiz(topic, difficulty)} className="btn-orange">
                <RotateCcw size={15} /> Retry New Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
