import { db } from './db.ts';
import { icseCbseKnowledgeBank, type KnowledgeBankChapterRecord } from './icseCbseKnowledgeBank.ts';
import { unifiedKnowledgeRetrieval } from './unifiedKnowledgeRetrieval.ts';
import { getSubjectTeachingSequence } from './multiModelAiTeacherEngine.ts';
import { getSubtopicDiagramsForTopic } from './subtopicDiagramCatalog.ts';

export type TopicMasteryState =
  | 'Not Started'
  | 'Learning'
  | 'Needs Revision'
  | 'Understood'
  | 'Assessment Passed'
  | 'Mastered';

export type JourneyTeachingMode = 'normal' | 'exam';

export interface ChapterJourneyCheckpointItem {
  id: string;
  topicIndex: number;
  topicName: string;
  questionType: 'MCQ' | 'Short Answer' | 'Numerical' | 'Application';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  likelyMisconception: string;
  simplerReExplanation: string;
  simplerExample: string;
  followUpQuestion: string;
}

export interface ChapterJourneyProgressRecord {
  userId: string;
  chapterId: string;
  board: string;
  grade: number;
  subject: string;
  currentStage: number;
  teachingMode: JourneyTeachingMode;
  topicStates: Record<string, TopicMasteryState>;
  bookmarkedTopics: string[];
  checkpointHistory: Array<{
    checkpointId: string;
    topicName: string;
    isCorrect: boolean;
    studentAnswer: string;
    timestamp: string;
  }>;
  prerequisitesSkipped: boolean;
  assessmentScore: number | null;
  assessmentTotalMarks: number | null;
  assessmentReport: FinalAssessmentEvaluationReport | null;
  updatedAt: string;
}

export interface FinalAssessmentEvaluationReport {
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  topicWisePerformance: Array<{
    topic: string;
    earnedMarks: number;
    maxMarks: number;
    percentage: number;
    state: TopicMasteryState;
  }>;
  strongConcepts: string[];
  weakConcepts: string[];
  misconceptionsDetected: string[];
  recommendedRevision: string[];
  suggestedPractice: string[];
  nextRecommendedChapter: {
    chapterId: string;
    chapterTitle: string;
    subject: string;
    grade: number;
    board: string;
  } | null;
}

export interface ChapterMasteryJourneyPayload {
  chapterMeta: {
    chapterId: string;
    board: string;
    grade: number;
    subject: string;
    syllabusUnit: string;
    chapterTitle: string;
    academicYear: string;
    prescribedTextbook: string;
    verificationStatus: string;
    completenessPercentage: number;
    subjectTeachingSequence: string[];
  };
  teachingMode: JourneyTeachingMode;
  progress: ChapterJourneyProgressRecord;
  stages: {
    stage1_introduction: {
      overview: string;
      whatYouWillLearn: string[];
      whyImportant: string;
      everydayConnection: string;
      whereUseful: string[];
      outcomesGained: string[];
    };
    stage2_zeroLevelFoundation: {
      assumesZeroPriorKnowledge: boolean;
      prerequisites: Array<{ term: string; simpleIdea: string; whyNeeded: string }>;
      quickSkipCheck: {
        question: string;
        options: string[];
        correctAnswer: string;
      };
    };
    stage3_definitionsAndTerminology: Array<{
      term: string;
      officialDefinition: string;
      simpleMeaning: string;
      example: string;
      characteristics: string;
      symbolOrUnit?: string;
    }>;
    stage4_conceptByConcept: Array<{
      topicIndex: number;
      topicTitle: string;
      subtopicTitle: string;
      introduction: string;
      meaning: string;
      formalDefinition: string;
      simpleLanguage: string;
      howAndWhyItWorks: string;
      componentsOrCharacteristics: string[];
      examples: string[];
      practicalApplications: string[];
      connectionToPrevious: string;
      commonMisconception: string;
      quickCheckQuestion: string;
    }>;
    stage5_processesAndMechanisms: Array<{
      stepNumber: number;
      title: string;
      startingCondition: string;
      whatHappens: string;
      whyItHappens: string;
      outcome: string;
    }>;
    stage6_diagramsAndVisuals: Array<{
      title: string;
      diagramType: string;
      dataUrl: string;
      whatItShows: string;
      componentsRepresented: Array<{ label: string; description: string }>;
      howPartsRelate: string;
      arrowsAndSymbolsMeaning: string;
      keyTakeaway: string;
    }>;
    stage7_examplesAndApplications: {
      basicExamples: string[];
      intermediateExamples: string[];
      challengingExamples: string[];
      everydayApplications: string[];
      academicApplications: string[];
    };
    stage8_differencesAndComparisons: Array<{
      title: string;
      leftColumnHeader: string;
      rightColumnHeader: string;
      rows: Array<{ aspect: string; leftValue: string; rightValue: string }>;
    }>;
    stage9_formulasDerivationsNumericals: {
      applicable: boolean;
      formulas: Array<{
        name: string;
        formula: string;
        symbolMeanings: string;
        siUnit: string;
        conditionsAndDerivation: string;
      }>;
      solvedNumericals: Array<{
        problemStatement: string;
        givenInformation: string;
        requiredQuantity: string;
        formulaUsed: string;
        substitutionAndSteps: string[];
        finalAnswerWithUnits: string;
        verificationCheck: string;
      }>;
      commonCalculationErrors: string[];
    };
    stage10_importantFactsAndKeyPoints: {
      facts: string[];
      keyTerminology: string[];
    };
    stage11_misconceptionCorrection: Array<{
      whatStudentsThink: string;
      whyIncorrect: string;
      correctConcept: string;
      clarifyingExample: string;
    }>;
    stage12_interactiveCheckpoints: ChapterJourneyCheckpointItem[];
    stage13_completeRevision: {
      chapterOverview: string;
      definitionsCount: number;
      keyFacts: string[];
      formulas: string[];
      commonMistakes: string[];
      chapterSummary: string;
    };
    stage14_examPreparation: {
      boardExpectations: string;
      disclaimer: string;
      questionsByType: Array<{
        id: string;
        questionType: string;
        difficulty: string;
        marks: number;
        question: string;
        options?: string[];
        modelAnswer: string;
        markingGuidance: string;
      }>;
    };
    stage15_finalAssessment: {
      totalMarks: number;
      passingPercentage: number;
      questions: Array<{
        id: string;
        topic: string;
        questionType: string;
        marks: number;
        question: string;
        options?: string[];
      }>;
    };
    stage16_masteryReport: {
      overallMasteryPercentage: number;
      topicsMasteredCount: number;
      totalTopicsCount: number;
      topicStates: Array<{ topic: string; state: TopicMasteryState; bookmarked: boolean }>;
      nextRecommendedChapter: {
        chapterId: string;
        chapterTitle: string;
        subject: string;
        grade: number;
        board: string;
      } | null;
    };
  };
}

class ChapterMasteryJourneyEngine {
  private initialized = false;

  public ensureInitialized(): void {
    if (this.initialized) return;
    this.initialized = true;
    icseCbseKnowledgeBank.ensureInitialized();
    db.exec(`
      CREATE TABLE IF NOT EXISTS chapter_mastery_progress (
        user_id TEXT NOT NULL,
        chapter_id TEXT NOT NULL,
        board TEXT NOT NULL,
        grade INTEGER NOT NULL,
        subject TEXT NOT NULL,
        current_stage INTEGER NOT NULL DEFAULT 1,
        teaching_mode TEXT NOT NULL DEFAULT 'normal',
        topic_states_json TEXT NOT NULL DEFAULT '{}',
        bookmarked_topics_json TEXT NOT NULL DEFAULT '[]',
        checkpoint_history_json TEXT NOT NULL DEFAULT '[]',
        prerequisites_skipped INTEGER NOT NULL DEFAULT 0,
        assessment_score INTEGER,
        assessment_total_marks INTEGER,
        assessment_report_json TEXT,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (user_id, chapter_id)
      );
    `);
  }

  public listAvailableChapters(filters?: { board?: string; grade?: number; subject?: string }) {
    this.ensureInitialized();
    const report = icseCbseKnowledgeBank.getCompletenessTrackerReport(filters);
    return report.chapters.map((c) => ({
      id: c.id,
      board: c.board,
      grade: c.grade,
      subject: c.subject,
      syllabusUnit: c.syllabusUnit,
      chapterNumber: c.chapterNumber,
      chapterTitle: c.chapterTitle,
      topicsCount: c.topicsCount,
      topicList: c.topicList,
      status: c.status,
      completenessPercentage: c.completenessPercentage
    }));
  }

  private resolveChapter(params: { chapterId?: string; query?: string; board?: string; grade?: number; subject?: string }): KnowledgeBankChapterRecord {
    this.ensureInitialized();
    if (params.chapterId) {
      const all = icseCbseKnowledgeBank.searchChapters({ limit: 200 });
      const exact = all.find((c) => c.id === params.chapterId);
      if (exact) return exact;
    }
    const found = icseCbseKnowledgeBank.findBestMatchingChapter({
      query: params.query || params.subject || 'Force and Pressure',
      board: params.board,
      grade: params.grade,
      subject: params.subject
    });
    if (found) return found;

    // Fallback to first published chapter
    const fallback = icseCbseKnowledgeBank.searchChapters({ status: 'Published', limit: 1 });
    return fallback[0];
  }

  private getOrCreateProgress(userId: string, ch: KnowledgeBankChapterRecord, requestedMode?: JourneyTeachingMode): ChapterJourneyProgressRecord {
    const row = db
      .prepare('SELECT * FROM chapter_mastery_progress WHERE user_id = ? AND chapter_id = ?')
      .get(userId, ch.id) as any;

    if (row) {
      const topicStates: Record<string, TopicMasteryState> = JSON.parse(row.topic_states_json || '{}');
      for (const t of ch.topicList) {
        if (!topicStates[t]) topicStates[t] = 'Not Started';
      }
      const mode: JourneyTeachingMode = requestedMode || (row.teaching_mode === 'exam' ? 'exam' : 'normal');
      if (requestedMode && requestedMode !== row.teaching_mode) {
        db.prepare('UPDATE chapter_mastery_progress SET teaching_mode = ?, updated_at = ? WHERE user_id = ? AND chapter_id = ?').run(
          mode,
          new Date().toISOString(),
          userId,
          ch.id
        );
      }
      return {
        userId: row.user_id,
        chapterId: row.chapter_id,
        board: row.board,
        grade: row.grade,
        subject: row.subject,
        currentStage: Number(row.current_stage || 1),
        teachingMode: mode,
        topicStates,
        bookmarkedTopics: JSON.parse(row.bookmarked_topics_json || '[]'),
        checkpointHistory: JSON.parse(row.checkpoint_history_json || '[]'),
        prerequisitesSkipped: Boolean(row.prerequisites_skipped),
        assessmentScore: row.assessment_score !== null ? Number(row.assessment_score) : null,
        assessmentTotalMarks: row.assessment_total_marks !== null ? Number(row.assessment_total_marks) : null,
        assessmentReport: row.assessment_report_json ? JSON.parse(row.assessment_report_json) : null,
        updatedAt: row.updated_at
      };
    }

    const initialStates: Record<string, TopicMasteryState> = {};
    ch.topicList.forEach((t, idx) => {
      // Opening a chapter sets only the active first topic to 'Learning' — NEVER 'Mastered'
      initialStates[t] = idx === 0 ? 'Learning' : 'Not Started';
    });

    const now = new Date().toISOString();
    const mode: JourneyTeachingMode = requestedMode || 'normal';
    db.prepare(`
      INSERT INTO chapter_mastery_progress (
        user_id, chapter_id, board, grade, subject, current_stage, teaching_mode,
        topic_states_json, bookmarked_topics_json, checkpoint_history_json,
        prerequisites_skipped, updated_at
      ) VALUES (?, ?, ?, ?, ?, 1, ?, ?, '[]', '[]', 0, ?)
    `).run(userId, ch.id, ch.board, ch.grade, ch.subject, mode, JSON.stringify(initialStates), now);

    return {
      userId,
      chapterId: ch.id,
      board: ch.board,
      grade: ch.grade,
      subject: ch.subject,
      currentStage: 1,
      teachingMode: mode,
      topicStates: initialStates,
      bookmarkedTopics: [],
      checkpointHistory: [],
      prerequisitesSkipped: false,
      assessmentScore: null,
      assessmentTotalMarks: null,
      assessmentReport: null,
      updatedAt: now
    };
  }

  public startOrResumeJourney(params: {
    userId: string;
    chapterId?: string;
    query?: string;
    board?: string;
    grade?: number;
    subject?: string;
    teachingMode?: JourneyTeachingMode;
  }): ChapterMasteryJourneyPayload {
    this.ensureInitialized();
    const ch = this.resolveChapter(params);
    const progress = this.getOrCreateProgress(params.userId, ch, params.teachingMode);
    const mode = progress.teachingMode;
    const retrieved = unifiedKnowledgeRetrieval.retrieveKnowledge(ch.chapterTitle, ch.subject, ch.grade, ch.board, 'English');
    const diagrams = getSubtopicDiagramsForTopic(ch.chapterTitle, ch.subject);

    const nextChapter = this.findNextRecommendedChapter(ch);

    // Build Stage 12 Checkpoints (1 per topic, up to 4)
    const checkpoints: ChapterJourneyCheckpointItem[] = ch.topicList.slice(0, 4).map((topicName, idx) => {
      const q = ch.practiceQuestions[idx] || ch.assessmentQuestions[idx];
      const misc = ch.commonMisconceptions[idx % Math.max(1, ch.commonMisconceptions.length)];
      if (q) {
        return {
          id: `chk-${ch.id}-${idx + 1}`,
          topicIndex: idx,
          topicName,
          questionType: (q.questionType as any) || 'MCQ',
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          likelyMisconception: misc?.misconception || `Confusing ${topicName} with an unrelated term.`,
          simplerReExplanation:
            misc?.scientificCorrection ||
            ch.detailedExplanations[idx % Math.max(1, ch.detailedExplanations.length)]?.explanation ||
            ch.chapterIntroduction,
          simplerExample: ch.examples[idx % Math.max(1, ch.examples.length)] || ch.chapterSummary,
          followUpQuestion: `In one short sentence, what is the key rule of "${topicName}"?`
        };
      }
      return {
        id: `chk-${ch.id}-${idx + 1}`,
        topicIndex: idx,
        topicName,
        questionType: 'Short Answer',
        question: `Explain the core idea of "${topicName}" in ${ch.subject}.`,
        correctAnswer: ch.importantDefinitions[idx]?.definition || ch.chapterSummary,
        explanation: ch.chapterSummary,
        likelyMisconception: misc?.misconception || `Memorizing "${topicName}" without understanding why it works.`,
        simplerReExplanation: ch.chapterIntroduction,
        simplerExample: ch.examples[0] || ch.chapterSummary,
        followUpQuestion: `Give one everyday example of "${topicName}".`
      };
    });

    // Build Stage 15 Assessment Questions (from practice + assessment bank)
    const allQs = [...ch.practiceQuestions, ...ch.assessmentQuestions];
    const assessmentQs = (allQs.length > 0 ? allQs : [
      {
        id: `asq-${ch.id}-1`,
        questionType: 'Short Answer' as const,
        difficulty: 'Medium' as const,
        question: `Define ${ch.chapterTitle} and state two key applications.`,
        correctAnswer: ch.chapterIntroduction,
        explanation: ch.chapterSummary,
        marks: 3
      }
    ]).map((q, idx) => ({
      id: q.id || `asq-${ch.id}-${idx + 1}`,
      topic: ch.topicList[idx % Math.max(1, ch.topicList.length)] || ch.chapterTitle,
      questionType: q.questionType,
      marks: q.marks || 2,
      question: q.question,
      options: q.options
    }));

    const totalMarks = assessmentQs.reduce((sum, q) => sum + q.marks, 0);
    const topicStatesList = ch.topicList.map((t) => ({
      topic: t,
      state: progress.topicStates[t] || 'Not Started',
      bookmarked: progress.bookmarkedTopics.includes(t)
    }));
    const masteredCount = topicStatesList.filter((t) => t.state === 'Mastered' || t.state === 'Assessment Passed').length;
    const overallMasteryPct = topicStatesList.length > 0 ? Math.round((masteredCount / topicStatesList.length) * 100) : 0;

    return {
      chapterMeta: {
        chapterId: ch.id,
        board: ch.board,
        grade: ch.grade,
        subject: ch.subject,
        syllabusUnit: ch.syllabusUnit,
        chapterTitle: ch.chapterTitle,
        academicYear: ch.academicYear,
        prescribedTextbook: ch.verifiedAcademicSources[0]?.documentTitle || `${ch.board} Class ${ch.grade} ${ch.subject}`,
        verificationStatus: ch.status,
        completenessPercentage: ch.completenessPercentage,
        subjectTeachingSequence: getSubjectTeachingSequence(ch.subject)
      },
      teachingMode: mode,
      progress,
      stages: {
        stage1_introduction: {
          overview: ch.chapterIntroduction,
          whatYouWillLearn: ch.learningObjectives,
          whyImportant: `Mastering ${ch.chapterTitle} builds essential conceptual clarity for ${ch.board} Class ${ch.grade} ${ch.subject} and higher classes.`,
          everydayConnection: ch.applications[0] || ch.examples[0] || ch.chapterSummary,
          whereUseful: ch.applications,
          outcomesGained: ch.learningObjectives
        },
        stage2_zeroLevelFoundation: {
          assumesZeroPriorKnowledge: true,
          prerequisites: (retrieved.universalNode.prerequisites || []).slice(0, 3).map((p, idx) => ({
            term: p,
            simpleIdea: `Foundational idea #${idx + 1}: Before learning ${ch.chapterTitle}, make sure you know what "${p}" means in everyday words.`,
            whyNeeded: `Connects directly to ${ch.topicList[0] || ch.chapterTitle}.`
          })),
          quickSkipCheck: {
            question: `Quick Foundation Check: Which statement best describes the starting idea of ${ch.chapterTitle}?`,
            options: [
              ch.chapterIntroduction.slice(0, 110) + (ch.chapterIntroduction.length > 110 ? '...' : ''),
              'It has no relation to observations or rules.',
              'It only applies outside the school curriculum.'
            ],
            correctAnswer: ch.chapterIntroduction.slice(0, 110) + (ch.chapterIntroduction.length > 110 ? '...' : '')
          }
        },
        stage3_definitionsAndTerminology: ch.importantDefinitions.map((d, idx) => ({
          term: d.term,
          officialDefinition: d.definition,
          simpleMeaning: `In simple words: ${d.definition}`,
          example: ch.examples[idx % Math.max(1, ch.examples.length)] || ch.chapterSummary,
          characteristics: ch.keyTerminology.slice(idx, idx + 3).join(', ') || ch.subject,
          symbolOrUnit: d.symbolOrUnit
        })),
        stage4_conceptByConcept: ch.topicList.map((topicTitle, idx) => ({
          topicIndex: idx,
          topicTitle,
          subtopicTitle: ch.subtopicList[idx % Math.max(1, ch.subtopicList.length)] || topicTitle,
          introduction: `Concept ${idx + 1} of ${ch.topicList.length}: ${topicTitle}`,
          meaning: ch.importantDefinitions[idx % Math.max(1, ch.importantDefinitions.length)]?.definition || ch.chapterIntroduction,
          formalDefinition: ch.importantDefinitions[idx % Math.max(1, ch.importantDefinitions.length)]?.definition || ch.chapterIntroduction,
          simpleLanguage: ch.detailedExplanations[idx % Math.max(1, ch.detailedExplanations.length)]?.explanation || ch.chapterIntroduction,
          howAndWhyItWorks:
            mode === 'exam' && ch.detailedExplanations[idx % Math.max(1, ch.detailedExplanations.length)]?.boardSpecificNote
              ? `${ch.detailedExplanations[idx % Math.max(1, ch.detailedExplanations.length)]?.explanation}\n\n[${ch.board} Exam Expectation]: ${ch.detailedExplanations[idx % Math.max(1, ch.detailedExplanations.length)]?.boardSpecificNote}`
              : ch.detailedExplanations[idx % Math.max(1, ch.detailedExplanations.length)]?.explanation || ch.chapterSummary,
          componentsOrCharacteristics: ch.subtopicList.slice(0, 4),
          examples: ch.examples.slice(0, mode === 'exam' ? ch.examples.length : 2),
          practicalApplications: ch.applications.slice(0, mode === 'exam' ? ch.applications.length : 2),
          connectionToPrevious: idx === 0 ? 'Builds directly on Stage 2 Zero-Level Foundation.' : `Connects directly from "${ch.topicList[idx - 1]}".`,
          commonMisconception: ch.commonMisconceptions[idx % Math.max(1, ch.commonMisconceptions.length)]?.misconception || 'Confusing terminology without checking conditions.',
          quickCheckQuestion: ch.practiceQuestions[idx % Math.max(1, ch.practiceQuestions.length)]?.question || `Explain "${topicTitle}" in your own words.`
        })),
        stage5_processesAndMechanisms:
          (ch.solvedProblems[0]?.stepByStepSolution || ch.subtopicList).map((step, idx) => ({
            stepNumber: idx + 1,
            title: `Step ${idx + 1}: ${ch.subtopicList[idx % Math.max(1, ch.subtopicList.length)] || ch.topicList[0]}`,
            startingCondition: idx === 0 ? ch.chapterIntroduction : `Follows completion of Step ${idx}.`,
            whatHappens: step,
            whyItHappens: ch.solvedProblems[0]?.whyEachStep || ch.importantFacts[idx % Math.max(1, ch.importantFacts.length)] || ch.chapterSummary,
            outcome: idx === (ch.solvedProblems[0]?.stepByStepSolution || ch.subtopicList).length - 1 ? (ch.solvedProblems[0]?.finalAnswer || ch.chapterSummary) : `Prepares Step ${idx + 2}.`
          })),
        stage6_diagramsAndVisuals: diagrams.slice(0, 3).map((d, idx) => ({
          title: ch.diagramsAndIllustrations[idx]?.title || d.diagramTitle,
          diagramType: ch.diagramsAndIllustrations[idx]?.type || d.diagramType,
          dataUrl: d.dataUrl,
          whatItShows: ch.diagramsAndIllustrations[idx]?.description || d.point1_whatItRepresents,
          componentsRepresented: d.point2_labelledParts,
          howPartsRelate: d.point4_componentRelationships,
          arrowsAndSymbolsMeaning: d.point5_directionOfMovementOrProcess,
          keyTakeaway: d.point8_whatToRemember
        })),
        stage7_examplesAndApplications: {
          basicExamples: ch.examples.slice(0, 1),
          intermediateExamples: ch.examples.slice(1, 2),
          challengingExamples: ch.examples.slice(2),
          everydayApplications: ch.applications.slice(0, 2),
          academicApplications: ch.applications.slice(2).length > 0 ? ch.applications.slice(2) : [`Applied in ${ch.board} Class ${ch.grade} ${ch.subject} problem-solving.`]
        },
        stage8_differencesAndComparisons: ch.importantComparisons,
        stage9_formulasDerivationsNumericals: {
          applicable: ch.formulasAndEquations.length > 0 || ch.solvedProblems.length > 0,
          formulas: ch.formulasAndEquations.map((f) => ({
            name: f.name,
            formula: f.formula,
            symbolMeanings: f.variables,
            siUnit: f.siUnit,
            conditionsAndDerivation: f.derivationOrMeaning
          })),
          solvedNumericals: ch.solvedProblems.map((p) => ({
            problemStatement: p.problemStatement,
            givenInformation: p.givenData,
            requiredQuantity: 'Find the unknown value step by step with units.',
            formulaUsed: p.formulaUsed,
            substitutionAndSteps: p.stepByStepSolution,
            finalAnswerWithUnits: p.finalAnswer,
            verificationCheck: p.whyEachStep
          })),
          commonCalculationErrors: ch.commonMisconceptions.map((m) => m.misconception)
        },
        stage10_importantFactsAndKeyPoints: {
          facts: ch.importantFacts,
          keyTerminology: ch.keyTerminology
        },
        stage11_misconceptionCorrection: ch.commonMisconceptions.map((m, idx) => ({
          whatStudentsThink: m.misconception,
          whyIncorrect: `This misconception ignores the verified ${ch.subject} rule.`,
          correctConcept: m.scientificCorrection,
          clarifyingExample: ch.examples[idx % Math.max(1, ch.examples.length)] || ch.chapterSummary
        })),
        stage12_interactiveCheckpoints: checkpoints,
        stage13_completeRevision: {
          chapterOverview: ch.chapterIntroduction,
          definitionsCount: ch.importantDefinitions.length,
          keyFacts: ch.importantFacts,
          formulas: ch.formulasAndEquations.map((f) => `${f.name}: ${f.formula} (${f.siUnit})`),
          commonMistakes: ch.commonMisconceptions.map((m) => `${m.misconception} → ${m.scientificCorrection}`),
          chapterSummary: ch.chapterSummary
        },
        stage14_examPreparation: {
          boardExpectations: `${ch.board} Class ${ch.grade} ${ch.subject} (${ch.syllabusUnit}) — Focus on precise terminology, clear step-by-step reasoning, and labeled visuals.`,
          disclaimer: 'Practice questions are aligned with official board syllabus competencies; no leaked or guaranteed exam predictions are made.',
          questionsByType: [...ch.practiceQuestions, ...ch.assessmentQuestions].map((q) => ({
            id: q.id,
            questionType: q.questionType,
            difficulty: q.difficulty,
            marks: q.marks,
            question: q.question,
            options: q.options,
            modelAnswer: q.correctAnswer,
            markingGuidance: q.explanation
          }))
        },
        stage15_finalAssessment: {
          totalMarks,
          passingPercentage: 70,
          questions: assessmentQs
        },
        stage16_masteryReport: {
          overallMasteryPercentage: overallMasteryPct,
          topicsMasteredCount: masteredCount,
          totalTopicsCount: topicStatesList.length,
          topicStates: topicStatesList,
          nextRecommendedChapter: nextChapter
        }
      }
    };
  }

  public evaluateCheckpoint(params: {
    userId: string;
    chapterId: string;
    checkpointId: string;
    topicName: string;
    studentAnswer: string;
  }): {
    isCorrect: boolean;
    diagnosedMisconception?: string;
    reTeachingExplanation: string;
    simplerExample: string;
    followUpQuestion: string;
    shouldAdvance: boolean;
    updatedTopicState: TopicMasteryState;
    progress: ChapterJourneyProgressRecord;
  } {
    this.ensureInitialized();
    const journey = this.startOrResumeJourney({ userId: params.userId, chapterId: params.chapterId });
    const chk = journey.stages.stage12_interactiveCheckpoints.find((c) => c.id === params.checkpointId) ||
      journey.stages.stage12_interactiveCheckpoints[0];

    const cleanStudent = (params.studentAnswer || '').trim().toLowerCase();
    const cleanCorrect = (chk?.correctAnswer || '').trim().toLowerCase();
    const isCorrect =
      cleanStudent.length > 0 &&
      (cleanStudent === cleanCorrect ||
        cleanCorrect.includes(cleanStudent) ||
        cleanStudent.includes(cleanCorrect) ||
        (cleanStudent.length >= 18 && cleanCorrect.split(/\s+/).filter((w) => w.length > 4 && cleanStudent.includes(w)).length >= 2));

    const updatedTopicState: TopicMasteryState = isCorrect ? 'Understood' : 'Needs Revision';
    const topicKey = params.topicName || chk?.topicName || journey.chapterMeta.chapterTitle;

    const progress = journey.progress;
    progress.topicStates[topicKey] = updatedTopicState;
    progress.checkpointHistory.push({
      checkpointId: params.checkpointId,
      topicName: topicKey,
      isCorrect,
      studentAnswer: params.studentAnswer,
      timestamp: new Date().toISOString()
    });

    const nextStage = isCorrect ? Math.min(16, Math.max(progress.currentStage, 12)) : progress.currentStage;
    db.prepare(`
      UPDATE chapter_mastery_progress
      SET topic_states_json = ?, checkpoint_history_json = ?, current_stage = ?, updated_at = ?
      WHERE user_id = ? AND chapter_id = ?
    `).run(
      JSON.stringify(progress.topicStates),
      JSON.stringify(progress.checkpointHistory),
      nextStage,
      new Date().toISOString(),
      params.userId,
      params.chapterId
    );

    return {
      isCorrect,
      diagnosedMisconception: isCorrect ? undefined : chk?.likelyMisconception,
      reTeachingExplanation: isCorrect
        ? `Great job! ${chk?.explanation}`
        : `Let's look at "${topicKey}" in a simpler way: ${chk?.simplerReExplanation}`,
      simplerExample: chk?.simplerExample || journey.chapterMeta.chapterTitle,
      followUpQuestion: isCorrect
        ? 'Ready to continue to the next concept!'
        : chk?.followUpQuestion || `Try explaining "${topicKey}" again in one simple sentence.`,
      shouldAdvance: isCorrect,
      updatedTopicState,
      progress: { ...progress, currentStage: nextStage }
    };
  }

  public submitFinalAssessment(params: {
    userId: string;
    chapterId: string;
    answers: Record<string, string>;
  }): FinalAssessmentEvaluationReport {
    this.ensureInitialized();
    const ch = this.resolveChapter({ chapterId: params.chapterId });
    const progress = this.getOrCreateProgress(params.userId, ch);
    const allQs = [...ch.practiceQuestions, ...ch.assessmentQuestions];
    const questions = allQs.length > 0 ? allQs : [
      {
        id: `asq-${ch.id}-1`,
        questionType: 'Short Answer' as const,
        difficulty: 'Medium' as const,
        question: `Define ${ch.chapterTitle}`,
        correctAnswer: ch.chapterIntroduction,
        explanation: ch.chapterSummary,
        marks: 3
      }
    ];

    let totalEarned = 0;
    let totalMax = 0;
    const topicScores: Record<string, { earned: number; max: number }> = {};
    const strongConcepts: string[] = [];
    const weakConcepts: string[] = [];
    const misconceptionsDetected: string[] = [];

    questions.forEach((q, idx) => {
      const topic = ch.topicList[idx % Math.max(1, ch.topicList.length)] || ch.chapterTitle;
      if (!topicScores[topic]) topicScores[topic] = { earned: 0, max: 0 };
      const maxM = q.marks || 2;
      totalMax += maxM;
      topicScores[topic].max += maxM;

      const ans = (params.answers[q.id] || '').trim().toLowerCase();
      const expected = (q.correctAnswer || '').trim().toLowerCase();
      const keywords = expected.split(/\s+/).filter((w) => w.length > 4);
      const matchedKeywords = keywords.filter((w) => ans.includes(w));

      const isCorrect =
        ans.length > 0 &&
        (ans === expected ||
          expected.includes(ans) ||
          ans.includes(expected) ||
          (keywords.length > 0 && matchedKeywords.length >= Math.min(2, keywords.length)));

      if (isCorrect) {
        totalEarned += maxM;
        topicScores[topic].earned += maxM;
      } else {
        const misc = ch.commonMisconceptions[idx % Math.max(1, ch.commonMisconceptions.length)]?.misconception;
        if (misc && !misconceptionsDetected.includes(misc)) {
          misconceptionsDetected.push(misc);
        }
      }
    });

    const percentage = totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 0;
    const passed = percentage >= 70;

    const topicWisePerformance = Object.entries(topicScores).map(([topic, sc]) => {
      const pct = sc.max > 0 ? Math.round((sc.earned / sc.max) * 100) : 0;
      let state: TopicMasteryState = 'Needs Revision';
      if (pct >= 80) {
        state = passed ? 'Mastered' : 'Assessment Passed';
        strongConcepts.push(topic);
      } else if (pct >= 50) {
        state = 'Understood';
      } else {
        weakConcepts.push(topic);
      }
      progress.topicStates[topic] = state;
      return { topic, earnedMarks: sc.earned, maxMarks: sc.max, percentage: pct, state };
    });

    const nextRecommendedChapter = this.findNextRecommendedChapter(ch);
    const report: FinalAssessmentEvaluationReport = {
      score: totalEarned,
      totalMarks: totalMax,
      percentage,
      passed,
      topicWisePerformance,
      strongConcepts,
      weakConcepts,
      misconceptionsDetected,
      recommendedRevision:
        weakConcepts.length > 0
          ? weakConcepts.map((w) => `Revisit Stage 4 & Stage 11 Misconceptions for "${w}"`)
          : ['Review Stage 13 Complete Chapter Revision sheet once before moving to the next chapter.'],
      suggestedPractice:
        weakConcepts.length > 0
          ? weakConcepts.map((w) => `Complete 2 extra practice problems on "${w}" in Exam Prep Mode.`)
          : [`Proceed to ${nextRecommendedChapter?.chapterTitle || 'the next syllabus chapter'}.`],
      nextRecommendedChapter
    };

    db.prepare(`
      UPDATE chapter_mastery_progress
      SET current_stage = 16,
          topic_states_json = ?,
          assessment_score = ?,
          assessment_total_marks = ?,
          assessment_report_json = ?,
          updated_at = ?
      WHERE user_id = ? AND chapter_id = ?
    `).run(
      JSON.stringify(progress.topicStates),
      totalEarned,
      totalMax,
      JSON.stringify(report),
      new Date().toISOString(),
      params.userId,
      ch.id
    );

    return report;
  }

  public updateProgressControls(params: {
    userId: string;
    chapterId: string;
    currentStage?: number;
    teachingMode?: JourneyTeachingMode;
    toggleBookmarkTopic?: string;
    prerequisitesSkipped?: boolean;
  }): ChapterJourneyProgressRecord {
    this.ensureInitialized();
    const ch = this.resolveChapter({ chapterId: params.chapterId });
    const progress = this.getOrCreateProgress(params.userId, ch, params.teachingMode);

    if (typeof params.currentStage === 'number') {
      progress.currentStage = Math.max(1, Math.min(16, params.currentStage));
    }
    if (params.teachingMode) {
      progress.teachingMode = params.teachingMode;
    }
    if (typeof params.prerequisitesSkipped === 'boolean') {
      progress.prerequisitesSkipped = params.prerequisitesSkipped;
    }
    if (params.toggleBookmarkTopic) {
      const idx = progress.bookmarkedTopics.indexOf(params.toggleBookmarkTopic);
      if (idx >= 0) progress.bookmarkedTopics.splice(idx, 1);
      else progress.bookmarkedTopics.push(params.toggleBookmarkTopic);
    }

    progress.updatedAt = new Date().toISOString();
    db.prepare(`
      UPDATE chapter_mastery_progress
      SET current_stage = ?, teaching_mode = ?, bookmarked_topics_json = ?, prerequisites_skipped = ?, updated_at = ?
      WHERE user_id = ? AND chapter_id = ?
    `).run(
      progress.currentStage,
      progress.teachingMode,
      JSON.stringify(progress.bookmarkedTopics),
      progress.prerequisitesSkipped ? 1 : 0,
      progress.updatedAt,
      params.userId,
      ch.id
    );

    return progress;
  }

  private findNextRecommendedChapter(current: KnowledgeBankChapterRecord) {
    const candidates = icseCbseKnowledgeBank.searchChapters({
      board: current.board,
      subject: current.subject,
      limit: 20
    });
    const next = candidates.find((c) => c.id !== current.id && c.grade >= current.grade);
    if (!next) return null;
    return {
      chapterId: next.id,
      chapterTitle: next.chapterTitle,
      subject: next.subject,
      grade: next.grade,
      board: next.board
    };
  }
}

export const chapterMasteryJourneyEngine = new ChapterMasteryJourneyEngine();
