import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Trophy,
  Flame,
  BookOpen
} from 'lucide-react';
import { useLearning } from '../context/LearningContext';

export interface EducationalGamePlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameSlug: string;
  gameName: string;
  initialTopic?: string;
  initialSubject?: string;
}

export const EducationalGamePlayerModal: React.FC<EducationalGamePlayerModalProps> = ({
  isOpen,
  onClose,
  gameSlug,
  gameName,
  initialTopic = 'Photosynthesis',
  initialSubject = 'Science'
}) => {
  const navigate = useNavigate();
  const { apiFetch, triggerRefresh } = useLearning();

  const [topic, setTopic] = useState<string>(initialTopic);
  const [subject, setSubject] = useState<string>(initialSubject);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [untimed, setUntimed] = useState<boolean>(true);

  // Flow: 'intro' | 'playing' | 'results'
  const [stage, setStage] = useState<'intro' | 'playing' | 'results'>('intro');
  const [loading, setLoading] = useState<boolean>(false);

  // Session data
  const [sessionId, setSessionId] = useState<string>('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);

  // Student answer state
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [letterInputs, setLetterInputs] = useState<Record<number, string>>({});
  const [scrambleAnswer, setScrambleAnswer] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Array<{ left: string; right: string }>>([]);
  const [selectedMistakeTokenIndex, setSelectedMistakeTokenIndex] = useState<number | null>(null);
  const [mistakeCorrectionInput, setMistakeCorrectionInput] = useState<string>('');

  // Outcome of current question
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [answeredOutcome, setAnsweredOutcome] = useState<any | null>(null);

  // Running scores
  const [totalScore, setTotalScore] = useState<number>(0);
  const [, setCorrectCount] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Results screen data
  const [finalResults, setFinalResults] = useState<any | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTopic(initialTopic);
      setSubject(initialSubject);
      setStage('intro');
      setAnsweredOutcome(null);
      setFinalResults(null);
    }
  }, [isOpen, initialTopic, initialSubject, gameSlug]);

  if (!isOpen) return null;

  // 1. START SESSION
  const handleStartGame = async () => {
    setLoading(true);
    setAnsweredOutcome(null);
    setCurrentIndex(0);
    setTotalScore(0);
    setCorrectCount(0);
    setStreak(0);
    setStartTime(Date.now());

    try {
      const res = await apiFetch('/api/educational-games/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_slug: gameSlug,
          topic,
          subject,
          difficulty,
          count: 5
        })
      });

      if (res?.questions && res.questions.length > 0) {
        setSessionId(res.session_id);
        setQuestions(res.questions);
        setCurrentQuestion(res.questions[0]);
        resetQuestionInputs(res.questions[0]);
        setStage('playing');
      }
    } catch (err) {
      console.error('Failed to start game session:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetQuestionInputs = (_q: any) => {
    setTextAnswer('');
    setSelectedOption(null);
    setLetterInputs({});
    setScrambleAnswer([]);
    setSelectedLeft(null);
    setMatchedPairs([]);
    setSelectedMistakeTokenIndex(null);
    setMistakeCorrectionInput('');
    setHintsUsed(0);
    setShowHint(false);
    setAnsweredOutcome(null);
  };

  // 2. SUBMIT ANSWER
  const handleSubmitAnswer = async () => {
    if (!currentQuestion || answeredOutcome) return;

    let studentAnswerPayload: any = textAnswer;

    if (gameSlug === 'missing_letters') {
      const chars = currentQuestion.fullWord.split('');
      const assembled = chars
        .map((ch: string, i: number) => {
          if (currentQuestion.missingIndices.includes(i)) {
            return letterInputs[i] || '';
          }
          return ch;
        })
        .join('');
      studentAnswerPayload = assembled;
    } else if (gameSlug === 'mcq_challenge') {
      studentAnswerPayload = selectedOption;
    } else if (gameSlug === 'match_pairs') {
      studentAnswerPayload = matchedPairs;
    } else if (gameSlug === 'word_scramble') {
      studentAnswerPayload = scrambleAnswer.join('');
    } else if (gameSlug === 'true_false') {
      studentAnswerPayload = selectedOption === 1;
    } else if (gameSlug === 'find_mistake') {
      studentAnswerPayload = {
        tokenIndex: selectedMistakeTokenIndex,
        correction: mistakeCorrectionInput
      };
    }

    try {
      const res = await apiFetch('/api/educational-games/session/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          question_index: currentIndex,
          question: currentQuestion,
          student_answer: studentAnswerPayload,
          hints_used: hintsUsed
        })
      });

      setAnsweredOutcome(res);
      if (res.is_correct) {
        setTotalScore((prev) => prev + res.score_earned);
        setCorrectCount((prev) => prev + 1);
        setStreak((prev) => prev + 1);
      } else {
        setStreak(0);
      }
    } catch (err) {
      console.error('Answer submission error:', err);
    }
  };

  // 3. NEXT QUESTION OR COMPLETE SESSION
  const handleNextQuestion = async () => {
    if (currentIndex + 1 < questions.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setCurrentQuestion(questions[nextIdx]);
      resetQuestionInputs(questions[nextIdx]);
    } else {
      setLoading(true);
      const durationSecs = Math.max(10, Math.round((Date.now() - startTime) / 1000));
      try {
        const res = await apiFetch('/api/educational-games/session/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            duration_seconds: durationSecs
          })
        });
        setFinalResults(res);
        setStage('results');
        triggerRefresh();
      } catch (err) {
        console.error('Failed to complete session:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(32, 33, 36, 0.42)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 880,
          maxHeight: '94vh',
          backgroundColor: '#FFFFFF',
          borderRadius: 28,
          boxShadow: '0 28px 68px -12px rgba(255, 106, 0, 0.24), 0 12px 32px rgba(32, 33, 36, 0.14)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1.5px solid rgba(255, 106, 0, 0.28)'
        }}
      >
        {/* Modal Top Bar — White & Rich Orange Header */}
        <div
          style={{
            padding: '18px 26px',
            borderBottom: '1.5px solid rgba(255, 106, 0, 0.16)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF9F4 55%, #FFF3E8 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #FF7A1A 0%, #FF6A00 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                boxShadow: '0 6px 16px rgba(255, 106, 0, 0.28)'
              }}
            >
              🎮
            </div>
            <div>
              <h2 style={{ fontSize: '1.24rem', fontWeight: 900, color: '#202124', margin: 0 }}>
                {gameName}
              </h2>
              <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 700 }}>
                Topic: <strong style={{ color: '#FF6A00' }}>{topic}</strong> • {subject}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              border: '1.5px solid rgba(255, 106, 0, 0.22)',
              background: '#FFFFFF',
              color: '#FF6A00',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: 26, overflowY: 'auto', flex: 1, background: '#FFFFFF' }}>
          {/* ======================================================== */}
          {/* STAGE 1: INTRO & CONFIGURATION */}
          {/* ======================================================== */}
          {stage === 'intro' && (
            <div>
              <div
                style={{
                  padding: 20,
                  borderRadius: 20,
                  background: 'linear-gradient(135deg, #FFF3E8 0%, #FFFFFF 100%)',
                  border: '1.5px solid rgba(255, 106, 0, 0.26)',
                  marginBottom: 20
                }}
              >
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#E85D00', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Educational Objective
                </div>
                <p style={{ fontSize: '0.94rem', color: '#202124', margin: '6px 0 0 0', lineHeight: 1.55 }}>
                  Reinforce conceptual mastery, critical thinking, and academic vocabulary for{' '}
                  <strong style={{ color: '#FF6A00' }}>{topic}</strong> through verified curriculum-grounded challenge rounds.
                </p>
              </div>

              {/* Topic & Subject Customization */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#202124', display: 'block', marginBottom: 6 }}>
                  Learning Topic:
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Photosynthesis, Human Heart, Friction, Quadratic Equations"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 14,
                    border: '1.5px solid rgba(255, 106, 0, 0.24)',
                    background: '#FFFFFF',
                    color: '#202124',
                    fontWeight: 600,
                    fontSize: '0.92rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Difficulty Selection */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#202124', display: 'block', marginBottom: 8 }}>
                  Difficulty Level:
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {(['easy', 'medium', 'hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      style={{
                        flex: 1,
                        padding: '11px 16px',
                        borderRadius: 14,
                        border: difficulty === diff ? '2px solid #FF6A00' : '1.5px solid rgba(255, 106, 0, 0.18)',
                        background: difficulty === diff ? '#FFF3E8' : '#FFFFFF',
                        color: difficulty === diff ? '#E85D00' : '#6B7280',
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        textTransform: 'capitalize',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease'
                      }}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Untimed Mode Toggle */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: 16,
                  background: '#FFFBF7',
                  border: '1.5px solid rgba(255, 106, 0, 0.18)',
                  marginBottom: 24
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#202124' }}>
                    Relaxed Untimed Learning
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                    Focus on understanding concepts without speed pressure
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={untimed}
                  onChange={(e) => setUntimed(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: '#FF6A00', cursor: 'pointer' }}
                />
              </div>

              <button
                type="button"
                onClick={handleStartGame}
                disabled={loading || !topic.trim()}
                className="btn-orange"
                style={{
                  width: '100%',
                  padding: '15px',
                  fontSize: '1.02rem'
                }}
              >
                <Play size={20} fill="#FFFFFF" />
                <span>{loading ? 'Preparing Game Arena...' : 'Start Game Arena'}</span>
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* STAGE 2: ACTIVE GAMEPLAY ARENA */}
          {/* ======================================================== */}
          {stage === 'playing' && currentQuestion && (
            <div>
              {/* Progress & Live Scores Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 18,
                  paddingBottom: 14,
                  borderBottom: '1.5px solid rgba(255, 106, 0, 0.14)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      padding: '5px 12px',
                      borderRadius: 999,
                      background: '#FFF3E8',
                      border: '1px solid rgba(255, 106, 0, 0.24)',
                      color: '#E85D00',
                      fontSize: '0.8rem',
                      fontWeight: 800
                    }}
                  >
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span
                    style={{
                      padding: '5px 10px',
                      borderRadius: 999,
                      background: 'rgba(255, 106, 0, 0.13)',
                      color: '#E85D00',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      textTransform: 'uppercase'
                    }}
                  >
                    {currentQuestion.difficulty}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#FF6A00', fontWeight: 900, fontSize: '0.94rem' }}>
                    <Trophy size={16} />
                    <span>{totalScore} pts</span>
                  </div>
                  {streak > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#E85D00', fontWeight: 800, fontSize: '0.9rem' }}>
                      <Flame size={16} fill="#FF6A00" />
                      <span>{streak}x Combo</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ---------------------------------------------------- */}
              {/* GAME 1: MISSING LETTERS INTERFACE */}
              {/* ---------------------------------------------------- */}
              {gameSlug === 'missing_letters' && (
                <div>
                  <div style={{ fontSize: '0.88rem', color: '#6B7280', fontWeight: 700, marginBottom: 10 }}>
                    Fill in the missing letters to spell the academic term:
                  </div>

                  {/* Letter Slots */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', margin: '22px 0' }}>
                    {currentQuestion.fullWord.split('').map((char: string, i: number) => {
                      const isMissing = currentQuestion.missingIndices.includes(i);
                      if (!isMissing) {
                        return (
                          <div
                            key={i}
                            style={{
                              width: 46,
                              height: 54,
                              borderRadius: 12,
                              background: '#FFF3E8',
                              border: '2px solid rgba(255, 106, 0, 0.26)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 900,
                              fontSize: '1.4rem',
                              color: '#202124'
                            }}
                          >
                            {char}
                          </div>
                        );
                      }

                      return (
                        <input
                          key={i}
                          type="text"
                          maxLength={1}
                          disabled={Boolean(answeredOutcome)}
                          value={letterInputs[i] || ''}
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase();
                            setLetterInputs({ ...letterInputs, [i]: val });
                          }}
                          style={{
                            width: 46,
                            height: 54,
                            borderRadius: 12,
                            background: '#FFFFFF',
                            border: '2px dashed #FF6A00',
                            textAlign: 'center',
                            fontWeight: 900,
                            fontSize: '1.4rem',
                            color: '#FF6A00',
                            outline: 'none',
                            boxShadow: '0 4px 12px rgba(255, 106, 0, 0.1)'
                          }}
                        />
                      );
                    })}
                  </div>

                  <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#6B7280', fontStyle: 'italic', marginBottom: 16 }}>
                    Meaning: <strong style={{ color: '#202124', fontStyle: 'normal' }}>{currentQuestion.meaning}</strong>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* GAME 2: MISSING WORDS INTERFACE */}
              {/* ---------------------------------------------------- */}
              {gameSlug === 'missing_words' && (
                <div>
                  <div
                    style={{
                      padding: 22,
                      borderRadius: 20,
                      background: '#FFF3E8',
                      border: '1.5px solid rgba(255, 106, 0, 0.24)',
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      color: '#202124',
                      lineHeight: 1.6,
                      marginBottom: 20,
                      textAlign: 'center'
                    }}
                  >
                    "{currentQuestion.sentenceWithBlank}"
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                    {currentQuestion.options?.map((opt: string, i: number) => {
                      const isSelected = textAnswer === opt;
                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={Boolean(answeredOutcome)}
                          onClick={() => setTextAnswer(opt)}
                          style={{
                            padding: '15px 18px',
                            borderRadius: 16,
                            border: isSelected ? '2px solid #FF6A00' : '1.5px solid rgba(255, 106, 0, 0.18)',
                            background: isSelected ? '#FFF3E8' : '#FFFFFF',
                            color: isSelected ? '#E85D00' : '#202124',
                            fontWeight: 800,
                            fontSize: '0.98rem',
                            cursor: 'pointer',
                            transition: 'all 0.18s ease'
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* GAME 3: MATCH THE PAIRS INTERFACE */}
              {/* ---------------------------------------------------- */}
              {gameSlug === 'match_pairs' && (
                <div>
                  <div style={{ fontSize: '0.88rem', color: '#6B7280', fontWeight: 700, marginBottom: 14 }}>
                    Match each term on the left with its accurate explanation on the right:
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    {/* Left Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {currentQuestion.shuffledLeft?.map((leftText: string, i: number) => {
                        const isMatched = matchedPairs.some((p) => p.left === leftText);
                        const isSelected = selectedLeft === leftText;
                        return (
                          <div
                            key={i}
                            onClick={() => !isMatched && !answeredOutcome && setSelectedLeft(leftText)}
                            style={{
                              padding: '14px 16px',
                              borderRadius: 14,
                              background: isMatched ? '#FFF3E8' : isSelected ? '#FFF3E8' : '#FFFFFF',
                              border: isMatched
                                ? '2px solid #FF6A00'
                                : isSelected
                                ? '2px solid #E85D00'
                                : '1.5px solid rgba(255, 106, 0, 0.18)',
                              color: isMatched ? '#E85D00' : isSelected ? '#FF6A00' : '#202124',
                              fontWeight: 800,
                              fontSize: '0.9rem',
                              cursor: isMatched ? 'default' : 'pointer'
                            }}
                          >
                            {leftText} {isMatched && '✓'}
                          </div>
                        );
                      })}
                    </div>

                    {/* Right Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {currentQuestion.shuffledRight?.map((rightText: string, i: number) => {
                        const isMatched = matchedPairs.some((p) => p.right === rightText);
                        return (
                          <div
                            key={i}
                            onClick={() => {
                              if (selectedLeft && !isMatched && !answeredOutcome) {
                                setMatchedPairs([...matchedPairs, { left: selectedLeft, right: rightText }]);
                                setSelectedLeft(null);
                              }
                            }}
                            style={{
                              padding: '14px 16px',
                              borderRadius: 14,
                              background: isMatched ? '#FFF3E8' : '#FFFFFF',
                              border: isMatched ? '2px solid #FF6A00' : '1.5px solid rgba(255, 106, 0, 0.18)',
                              color: isMatched ? '#E85D00' : '#202124',
                              fontWeight: 600,
                              fontSize: '0.85rem',
                              cursor: isMatched ? 'default' : selectedLeft ? 'pointer' : 'default'
                            }}
                          >
                            {rightText} {isMatched && '✓'}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* GAME 4: MCQ CHALLENGE INTERFACE */}
              {/* ---------------------------------------------------- */}
              {gameSlug === 'mcq_challenge' && (
                <div>
                  <div
                    style={{
                      padding: 20,
                      borderRadius: 18,
                      background: '#FFF3E8',
                      border: '1.5px solid rgba(255, 106, 0, 0.24)',
                      fontSize: '1.08rem',
                      fontWeight: 800,
                      color: '#202124',
                      lineHeight: 1.5,
                      marginBottom: 18
                    }}
                  >
                    {currentQuestion.question}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {currentQuestion.options?.map((opt: string, i: number) => {
                      const isSelected = selectedOption === i;
                      const isCorrect = answeredOutcome && i === currentQuestion.correctOptionIndex;
                      const isWrong = answeredOutcome && isSelected && !answeredOutcome.is_correct;

                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={Boolean(answeredOutcome)}
                          onClick={() => setSelectedOption(i)}
                          style={{
                            padding: '14px 18px',
                            borderRadius: 16,
                            border: isCorrect
                              ? '2px solid #16A34A'
                              : isWrong
                              ? '2px solid #DC2626'
                              : isSelected
                              ? '2px solid #FF6A00'
                              : '1.5px solid rgba(255, 106, 0, 0.18)',
                            background: isCorrect
                              ? '#F0FDF4'
                              : isWrong
                              ? '#FEF2F2'
                              : isSelected
                              ? '#FFF3E8'
                              : '#FFFFFF',
                            color: isCorrect
                              ? '#15803D'
                              : isWrong
                              ? '#B91C1C'
                              : isSelected
                              ? '#E85D00'
                              : '#202124',
                            fontWeight: 800,
                            fontSize: '0.94rem',
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <span>{opt}</span>
                          {isCorrect && <CheckCircle2 size={18} color="#16A34A" />}
                          {isWrong && <AlertCircle size={18} color="#DC2626" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* GAME 5: WORD SCRAMBLE INTERFACE */}
              {/* ---------------------------------------------------- */}
              {gameSlug === 'word_scramble' && (
                <div>
                  <div style={{ fontSize: '0.88rem', color: '#6B7280', fontWeight: 700, marginBottom: 10 }}>
                    Click letters in the right order to form the scientific word:
                  </div>

                  {/* Assembled Tray */}
                  <div
                    style={{
                      minHeight: 60,
                      borderRadius: 16,
                      border: '2px dashed rgba(255, 106, 0, 0.36)',
                      background: '#FFFBF7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: 12,
                      marginBottom: 16
                    }}
                  >
                    {scrambleAnswer.length === 0 ? (
                      <span style={{ fontSize: '0.88rem', color: '#6B7280' }}>Select letters from below...</span>
                    ) : (
                      scrambleAnswer.map((ch, i) => (
                        <div
                          key={i}
                          style={{
                            width: 40,
                            height: 46,
                            borderRadius: 10,
                            background: 'linear-gradient(135deg, #FF7A1A 0%, #FF6A00 100%)',
                            color: '#FFFFFF',
                            fontWeight: 900,
                            fontSize: '1.2rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 10px rgba(255, 106, 0, 0.25)'
                          }}
                        >
                          {ch}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Scrambled Source Tiles */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                    {currentQuestion.scrambledLetters?.map((ch: string, i: number) => (
                      <button
                        key={i}
                        type="button"
                        disabled={Boolean(answeredOutcome)}
                        onClick={() => setScrambleAnswer([...scrambleAnswer, ch])}
                        style={{
                          width: 46,
                          height: 52,
                          borderRadius: 12,
                          border: '1.5px solid rgba(255, 106, 0, 0.24)',
                          background: '#FFFFFF',
                          fontWeight: 900,
                          fontSize: '1.25rem',
                          color: '#202124',
                          cursor: 'pointer',
                          boxShadow: '0 4px 10px rgba(255, 106, 0, 0.08)'
                        }}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>

                  {scrambleAnswer.length > 0 && !answeredOutcome && (
                    <div style={{ textAlign: 'center', marginBottom: 14 }}>
                      <button
                        type="button"
                        onClick={() => setScrambleAnswer([])}
                        style={{ border: 'none', background: 'transparent', color: '#E85D00', fontSize: '0.84rem', fontWeight: 800, cursor: 'pointer' }}
                      >
                        Reset Letters
                      </button>
                    </div>
                  )}

                  <div style={{ textAlign: 'center', fontSize: '0.88rem', color: '#6B7280', fontStyle: 'italic' }}>
                    Clue: <strong style={{ color: '#202124', fontStyle: 'normal' }}>{currentQuestion.meaning}</strong>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* GAME 6: TRUE OR FALSE INTERFACE */}
              {/* ---------------------------------------------------- */}
              {gameSlug === 'true_false' && (
                <div>
                  <div
                    style={{
                      padding: 24,
                      borderRadius: 20,
                      background: '#FFF3E8',
                      border: '1.5px solid rgba(255, 106, 0, 0.24)',
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      color: '#202124',
                      textAlign: 'center',
                      lineHeight: 1.5,
                      marginBottom: 24
                    }}
                  >
                    "{currentQuestion.statement}"
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <button
                      type="button"
                      disabled={Boolean(answeredOutcome)}
                      onClick={() => setSelectedOption(1)}
                      style={{
                        padding: 20,
                        borderRadius: 18,
                        border: selectedOption === 1 ? '2.5px solid #FF6A00' : '1.5px solid rgba(255, 106, 0, 0.22)',
                        background: selectedOption === 1 ? '#FFF3E8' : '#FFFFFF',
                        color: selectedOption === 1 ? '#E85D00' : '#202124',
                        fontWeight: 900,
                        fontSize: '1.25rem',
                        cursor: 'pointer',
                        boxShadow: selectedOption === 1 ? '0 8px 20px rgba(255, 106, 0, 0.16)' : 'none'
                      }}
                    >
                      ✓ TRUE
                    </button>

                    <button
                      type="button"
                      disabled={Boolean(answeredOutcome)}
                      onClick={() => setSelectedOption(0)}
                      style={{
                        padding: 20,
                        borderRadius: 18,
                        border: selectedOption === 0 ? '2.5px solid #FF6A00' : '1.5px solid rgba(255, 106, 0, 0.22)',
                        background: selectedOption === 0 ? '#FFF3E8' : '#FFFFFF',
                        color: selectedOption === 0 ? '#E85D00' : '#202124',
                        fontWeight: 900,
                        fontSize: '1.25rem',
                        cursor: 'pointer',
                        boxShadow: selectedOption === 0 ? '0 8px 20px rgba(255, 106, 0, 0.16)' : 'none'
                      }}
                    >
                      ✗ FALSE
                    </button>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* GAME 7: FIND THE MISTAKE INTERFACE */}
              {/* ---------------------------------------------------- */}
              {gameSlug === 'find_mistake' && (
                <div>
                  <div style={{ fontSize: '0.88rem', color: '#6B7280', fontWeight: 700, marginBottom: 10 }}>
                    Step 1: Tap the token that contains an intentional academic error:
                  </div>

                  <div
                    style={{
                      padding: 18,
                      borderRadius: 18,
                      background: '#FFFBF7',
                      border: '1.5px solid rgba(255, 106, 0, 0.2)',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 8,
                      marginBottom: 18
                    }}
                  >
                    {currentQuestion.tokens?.map((token: string, idx: number) => {
                      const isSelected = selectedMistakeTokenIndex === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={Boolean(answeredOutcome)}
                          onClick={() => setSelectedMistakeTokenIndex(idx)}
                          style={{
                            padding: '8px 14px',
                            borderRadius: 10,
                            border: isSelected ? '2px solid #FF6A00' : '1.5px solid rgba(255, 106, 0, 0.18)',
                            background: isSelected ? '#FFF3E8' : '#FFFFFF',
                            color: isSelected ? '#E85D00' : '#202124',
                            fontWeight: 800,
                            fontSize: '0.96rem',
                            cursor: 'pointer'
                          }}
                        >
                          {token}
                        </button>
                      );
                    })}
                  </div>

                  {selectedMistakeTokenIndex !== null && !answeredOutcome && (
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#6B7280', fontWeight: 700, marginBottom: 6 }}>
                        Step 2: Enter the correct replacement word or formula:
                      </div>
                      <input
                        type="text"
                        value={mistakeCorrectionInput}
                        onChange={(e) => setMistakeCorrectionInput(e.target.value)}
                        placeholder={`Correct word to replace "${currentQuestion.tokens[selectedMistakeTokenIndex]}"`}
                        style={{
                          width: '100%',
                          padding: '11px 16px',
                          borderRadius: 14,
                          border: '1.5px solid rgba(255, 106, 0, 0.26)',
                          fontSize: '0.92rem',
                          outline: 'none',
                          marginBottom: 12
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Hint Box */}
              <div style={{ marginTop: 18 }}>
                {!showHint ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowHint(true);
                      setHintsUsed((prev) => prev + 1);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'transparent',
                      border: 'none',
                      color: '#FF6A00',
                      fontWeight: 800,
                      fontSize: '0.84rem',
                      cursor: 'pointer'
                    }}
                  >
                    <HelpCircle size={16} />
                    <span>Need a concept hint?</span>
                  </button>
                ) : (
                  <div style={{ padding: 14, borderRadius: 14, background: '#FFF3E8', border: '1px solid rgba(255, 106, 0, 0.24)', color: '#E85D00', fontSize: '0.84rem' }}>
                    💡 <strong>Hint:</strong> {currentQuestion.hint}
                  </div>
                )}
              </div>

              {/* Action Buttons: Check Answer or Next Question */}
              <div style={{ marginTop: 22, paddingTop: 16, borderTop: '1.5px solid rgba(255, 106, 0, 0.14)' }}>
                {!answeredOutcome ? (
                  <button
                    type="button"
                    onClick={handleSubmitAnswer}
                    className="btn-orange"
                    style={{
                      width: '100%',
                      padding: 15,
                      fontSize: '0.98rem'
                    }}
                  >
                    Check Answer
                  </button>
                ) : (
                  <div>
                    {/* Educational Explanation Box */}
                    <div
                      style={{
                        padding: 18,
                        borderRadius: 16,
                        background: answeredOutcome.is_correct ? '#FFF3E8' : '#FEF2F2',
                        border: `1.5px solid ${answeredOutcome.is_correct ? 'rgba(255, 106, 0, 0.35)' : '#FECACA'}`,
                        marginBottom: 16
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 900,
                          fontSize: '1rem',
                          color: answeredOutcome.is_correct ? '#E85D00' : '#B91C1C',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          marginBottom: 6
                        }}
                      >
                        {answeredOutcome.is_correct ? <CheckCircle2 size={18} color="#FF6A00" /> : <AlertCircle size={18} />}
                        <span>{answeredOutcome.feedback}</span>
                      </div>
                      <div style={{ fontSize: '0.88rem', color: '#202124', lineHeight: 1.55 }}>
                        <strong style={{ color: '#FF6A00' }}>Concept Note:</strong> {answeredOutcome.explanation}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="btn-orange"
                      style={{
                        width: '100%',
                        padding: 15,
                        fontSize: '0.98rem'
                      }}
                    >
                      <span>
                        {currentIndex + 1 < questions.length ? 'Next Question →' : 'Complete Arena & View Results 🏆'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STAGE 3: RESULTS SCREEN & AI TUTOR REVISION */}
          {/* ======================================================== */}
          {stage === 'results' && finalResults && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3.2rem', marginBottom: 8 }}>🏆</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#202124', margin: 0 }}>
                Arena Challenge Completed!
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#6B7280', marginTop: 4 }}>
                Topic: <strong style={{ color: '#FF6A00' }}>{finalResults.topic}</strong> ({finalResults.subject})
              </p>

              {/* Score Breakdown Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 14,
                  margin: '22px 0'
                }}
              >
                <div style={{ padding: 16, borderRadius: 16, background: '#FFF3E8', border: '1.5px solid rgba(255, 106, 0, 0.24)' }}>
                  <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#FF6A00' }}>{finalResults.score}</div>
                  <div style={{ fontSize: '0.74rem', color: '#E85D00', fontWeight: 800 }}>TOTAL SCORE</div>
                </div>

                <div style={{ padding: 16, borderRadius: 16, background: '#FFFFFF', border: '1.5px solid rgba(255, 106, 0, 0.22)' }}>
                  <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#202124' }}>
                    {finalResults.accuracy_percentage}%
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#6B7280', fontWeight: 800 }}>ACCURACY</div>
                </div>

                <div style={{ padding: 16, borderRadius: 16, background: '#FFF3E8', border: '1.5px solid rgba(255, 106, 0, 0.24)' }}>
                  <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#E85D00' }}>
                    {finalResults.correct_count}/{finalResults.total_questions}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#6B7280', fontWeight: 800 }}>CORRECT</div>
                </div>
              </div>

              {/* Weak Concepts & Revision Recommendation */}
              {finalResults.weak_concepts?.length > 0 && (
                <div
                  style={{
                    padding: 18,
                    borderRadius: 18,
                    background: '#FFFBF7',
                    border: '1.5px solid rgba(255, 106, 0, 0.26)',
                    textAlign: 'left',
                    marginBottom: 22
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#E85D00', marginBottom: 8 }}>
                    Concepts Requiring Targeted Revision:
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                    {finalResults.weak_concepts.map((c: string, idx: number) => (
                      <span
                        key={idx}
                        style={{
                          padding: '4px 12px',
                          borderRadius: 999,
                          background: '#FFF3E8',
                          border: '1px solid rgba(255, 106, 0, 0.28)',
                          color: '#E85D00',
                          fontSize: '0.78rem',
                          fontWeight: 800
                        }}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#6B7280', lineHeight: 1.5 }}>
                    {finalResults.revision_recommendation}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate(`/tutor?topic=${encodeURIComponent(finalResults.topic)}`);
                  }}
                  className="btn-orange"
                  style={{ flex: 1 }}
                >
                  <BookOpen size={16} />
                  <span>Revise with AI Tutor</span>
                </button>

                <button
                  type="button"
                  onClick={handleStartGame}
                  className="btn-glass"
                  style={{ flex: 1 }}
                >
                  <RotateCcw size={16} />
                  <span>Play Again</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
