import type {
  EducationalQuestion,
  GameFeedback,
  GameLanguage,
  GameOption,
  OptionId,
  SharedGameSettings,
  GameType
} from './types.ts';
import { getCurriculumFallbackQuestions } from './curriculumBank.ts';

/**
 * Modern Fisher-Yates shuffle that produces a new shuffled array.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Validates question integrity according to Part 2 specifications:
 * - Non-empty question text
 * - Valid options with distinct text
 * - Unambiguous correct answer linked to a valid option ID
 * - Valid explanation
 */
export function validateQuestion(
  q: any,
  expectedTopic?: string,
  expectedGrade?: number,
  expectedLang?: GameLanguage
): q is EducationalQuestion {
  if (!q || typeof q !== 'object') return false;
  if (!q.id || typeof q.id !== 'string') return false;
  if (!q.question || typeof q.question !== 'string' || q.question.trim().length < 5) return false;
  if (!Array.isArray(q.options) || q.options.length < 3) return false;

  // Validate options structure
  const seenTexts = new Set<string>();
  const validOptionIds = new Set<string>(['A', 'B', 'C', 'D']);
  let hasCorrectOption = false;

  for (const opt of q.options) {
    if (!opt || typeof opt !== 'object') return false;
    const id = String(opt.id || '').toUpperCase();
    const text = String(opt.text || '').trim();

    if (!validOptionIds.has(id)) return false;
    if (text.length === 0) return false;
    if (seenTexts.has(text.toLowerCase())) return false; // Options must be distinct
    seenTexts.add(text.toLowerCase());

    if (id === q.correct_option_id) {
      hasCorrectOption = true;
    }
  }

  if (!hasCorrectOption) return false;
  if (!q.explanation || typeof q.explanation !== 'string' || q.explanation.trim().length < 5) return false;

  return true;
}

/**
 * Prepares and shuffles a question for Shooter games (4 options).
 * The option display positions are randomized, while correct_option_id remains invariant.
 */
export function prepareQuestionForShooter(q: EducationalQuestion): EducationalQuestion {
  // Ensure we have 4 options
  let options = [...q.options];
  if (options.length > 4) {
    const correctOpt = options.find((o) => o.id === q.correct_option_id)!;
    const others = options.filter((o) => o.id !== q.correct_option_id).slice(0, 3);
    options = [correctOpt, ...others];
  }

  // Shuffle option display order
  const shuffledOptions = shuffleArray(options);

  return {
    ...q,
    options: shuffledOptions
  };
}

/**
 * Prepares and shuffles a question for 3-Lane Runner games (exactly 3 options).
 * Selects the correct option plus 2 distinct distractors and shuffles across the 3 lanes.
 */
export function prepareQuestionForRunner(q: EducationalQuestion): EducationalQuestion {
  const correctOpt = q.options.find((o) => o.id === q.correct_option_id);
  if (!correctOpt) return q;

  const wrongOptions = q.options.filter((o) => o.id !== q.correct_option_id);
  const chosenWrong = shuffleArray(wrongOptions).slice(0, 2);

  // 3 options total: 1 correct + 2 distractors
  const threeOptions = [correctOpt, ...chosenWrong];
  const shuffledThree = shuffleArray(threeOptions);

  return {
    ...q,
    options: shuffledThree
  };
}

export class QuestionEngine {
  private settings: SharedGameSettings;
  private queue: EducationalQuestion[] = [];
  private history: EducationalQuestion[] = [];
  private usedIds: Set<string> = new Set();
  private currentQuestion: EducationalQuestion | null = null;
  private isFetching: boolean = false;

  constructor(settings: SharedGameSettings) {
    this.settings = { ...settings };
  }

  public getSettings(): SharedGameSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<SharedGameSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    // If topic, chapter, or grade changes, clear old queue
    if (newSettings.topic || newSettings.chapter || newSettings.grade || newSettings.language) {
      this.resetQueue();
    }
  }

  public resetQueue() {
    this.queue = [];
    this.usedIds.clear();
    this.currentQuestion = null;
  }

  public getQueueLength(): number {
    return this.queue.length;
  }

  public getHistory(): EducationalQuestion[] {
    return [...this.history];
  }

  public getCurrentQuestion(): EducationalQuestion | null {
    return this.currentQuestion;
  }

  /**
   * Adds validated questions to the queue, skipping duplicates.
   */
  public addQuestions(questions: EducationalQuestion[]) {
    const valid: EducationalQuestion[] = [];
    for (const q of questions) {
      if (!this.usedIds.has(q.id) && validateQuestion(q)) {
        this.usedIds.add(q.id);
        valid.push(q);
      }
    }

    const shuffled = shuffleArray(valid);
    for (const q of shuffled) {
      this.queue.push(q);
    }
  }

  /**
   * Loads a batch of questions from the API or offline curriculum bank.
   */
  public async loadQuestionBatch(
    apiFetch?: <T = any>(path: string, options?: RequestInit) => Promise<T>,
    count: number = 8
  ): Promise<number> {
    if (this.isFetching) return 0;
    this.isFetching = true;

    try {
      let fetchedQuestions: EducationalQuestion[] = [];

      // 1. Attempt API fetch
      if (apiFetch) {
        try {
          const res = await apiFetch('/api/games/questions', {
            method: 'POST',
            body: JSON.stringify({
              topic: this.settings.topic,
              subject: this.settings.subject,
              chapter: this.settings.chapter,
              grade: this.settings.grade,
              language: this.settings.language,
              difficulty: this.settings.startingDifficulty,
              count
            })
          });

          if (res && Array.isArray(res.questions) && res.questions.length > 0) {
            fetchedQuestions = res.questions.map((raw: any, idx: number) => {
              // Convert raw API format to standard EducationalQuestion if needed
              if (raw.correct_option_id && Array.isArray(raw.options) && raw.options[0]?.id) {
                return raw as EducationalQuestion;
              }

              // Compatibility adapter for legacy format: options: string[], correctIndex: number
              const rawOpts = Array.isArray(raw.options) ? raw.options : ['A', 'B', 'C', 'D'];
              const cIdx = typeof raw.correctIndex === 'number' ? raw.correctIndex : 0;
              const optionIds: OptionId[] = ['A', 'B', 'C', 'D'];

              const mappedOptions: GameOption[] = rawOpts.slice(0, 4).map((text: any, i: number) => ({
                id: optionIds[i],
                text: String(text)
              }));

              return {
                id: raw.id || `q-${this.settings.topic.toLowerCase().slice(0, 8)}-${Date.now()}-${idx}`,
                grade: this.settings.grade,
                subject: this.settings.subject,
                chapter: this.settings.chapter,
                topic: this.settings.topic,
                language: this.settings.language,
                difficulty: this.settings.startingDifficulty === 'hard' ? 3 : this.settings.startingDifficulty === 'easy' ? 1 : 2,
                question: String(raw.question),
                options: mappedOptions,
                correct_option_id: optionIds[cIdx] || 'A',
                explanation: String(raw.explanation || 'Verified correct answer.'),
                hint: raw.hint ? String(raw.hint) : undefined
              } as EducationalQuestion;
            });
          }
        } catch {
          // Fall back gracefully to curriculum bank
        }
      }

      // 2. If API returned no questions, load from curriculum bank
      if (fetchedQuestions.length === 0) {
        fetchedQuestions = getCurriculumFallbackQuestions({
          topic: this.settings.topic,
          grade: this.settings.grade,
          language: this.settings.language,
          count
        });
      }

      const initialCount = this.queue.length;
      this.addQuestions(fetchedQuestions);
      return this.queue.length - initialCount;
    } finally {
      this.isFetching = false;
    }
  }

  /**
   * Retrieves the next question prepared specifically for the active game type.
   */
  public getNextQuestion(gameType: GameType): EducationalQuestion | null {
    if (this.queue.length === 0) {
      // Emergency fallback if queue is empty
      const fallbacks = getCurriculumFallbackQuestions({
        topic: this.settings.topic,
        grade: this.settings.grade,
        language: this.settings.language,
        count: 4
      });
      this.addQuestions(fallbacks);
    }

    if (this.queue.length === 0) return null;

    const rawNext = this.queue.shift()!;
    this.history.push(rawNext);

    // Apply game-specific formatting and shuffling
    if (gameType === 'answer_runner') {
      this.currentQuestion = prepareQuestionForRunner(rawNext);
    } else {
      this.currentQuestion = prepareQuestionForShooter(rawNext);
    }

    return this.currentQuestion;
  }

  /**
   * Evaluates the student's actual chosen answer.
   * Never relies on position: evaluates against correct_option_id.
   */
  public evaluateAnswer(chosenOptionId: OptionId, basePoints: number = 200): GameFeedback | null {
    if (!this.currentQuestion) return null;

    const isCorrect = chosenOptionId === this.currentQuestion.correct_option_id;
    const correctOpt = this.currentQuestion.options.find((o) => o.id === this.currentQuestion!.correct_option_id);
    const chosenOpt = this.currentQuestion.options.find((o) => o.id === chosenOptionId);

    return {
      isCorrect,
      chosenOptionId,
      correctOptionId: this.currentQuestion.correct_option_id,
      chosenText: chosenOpt ? chosenOpt.text : 'Unknown Choice',
      correctText: correctOpt ? correctOpt.text : 'Correct Answer',
      explanation: this.currentQuestion.explanation,
      hint: this.currentQuestion.hint,
      pointsEarned: isCorrect ? basePoints : 0
    };
  }
}
