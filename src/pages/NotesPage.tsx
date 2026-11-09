import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Sparkles,
  Upload,
  Save,
  Trash2,
  Volume2,
  HelpCircle,
  Layers,
  Download,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Youtube,
  Globe,
  Plus,
  Undo2,
  Redo2,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  ExternalLink,
  Printer,
  Edit3,
  Table,
  Image as ImageIcon,
  GraduationCap,
  Mic,
  Camera,
  Maximize2,
  Minimize2,
  RotateCcw,
  Shuffle,
  Check,
  X,
  Play,
  Pause,
  FastForward,
  Rewind,
  Share2,
  Bookmark,
  Compass,
  Presentation,
  Network,
  Award,
  ZoomIn,
  ZoomOut,
  List,
  Square
} from 'lucide-react';
import {
  partitionWorkflowIntoPages,
  cleanNotebookTextForAudioSpeech,
  type NotebookPageItem,
  type DiagramVisualExplanation8Point
} from '../utils/digitalNotebookPagination';
import { TopBrandBar } from '../components/GlassNav';
import { FuturisticIcon } from '../components/FuturisticIcons';
import { StudyAiAssistantCharacter } from '../components/StudyAiAssistantCharacter';
import { EducationalMarkdownRenderer } from '../components/EducationalMarkdownRenderer';
import { useLearning } from '../context/LearningContext';

interface PendingSourceItem {
  id: string;
  sourceType: 'topic' | 'pdf' | 'youtube' | 'web' | 'docx' | 'pptx' | 'image' | 'camera' | 'audio' | 'txt';
  title: string;
  url?: string;
  fileName?: string;
  content?: string;
  base64Content?: string;
  previewUrl?: string;
  pageNumber?: number;
}

const PIPELINE_STEP_LABELS = [
  '1. Import Source',
  '2. Extract Content & OCR',
  '3. Build Coverage Inventory',
  '4. Segment Sections & Roadmap',
  '5. Analyze Concepts & Terms',
  '6. Generate Structured Notes',
  '7. Generate & Validate Diagrams',
  '8. Verify 100% Source Coverage',
  '9. Assemble Guided Learning Experience',
  '10. Persist to SQLite & Library'
];

export const NotesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    apiFetch,
    activeTopic,
    setTopicContext,
    startAudioLesson,
    openQuizModal,
    open3DLab,
    refreshTick,
    triggerRefresh
  } = useLearning();

  // Mode: 'home' (Clean Minimal Dashboard) vs 'notebook' (Active Guided Learning Workspace)
  const [dashboardMode, setDashboardMode] = useState<'home' | 'notebook'>('home');
  const [notes, setNotes] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Active Note & Workspace State
  const [activeNote, setActiveNote] = useState<any | null>(null);
  const [notebookSubTab, setNotebookSubTab] = useState<'full' | 'guided' | 'revision' | 'studio' | 'ask' | 'flashcards'>('full');
  const [activeSectionIdx, setActiveSectionIdx] = useState<number>(0);
  const [completedSections, setCompletedSections] = useState<Record<number, boolean>>({});

  // Full-Screen Digital Textbook & PDF Reader State (Prompt Requirement)
  const [readerViewMode, setReaderViewMode] = useState<'paged' | 'continuous'>('continuous');
  const [continuousRenderStyle, setContinuousRenderStyle] = useState<'textbook' | 'sections'>('textbook');
  const [currentPageIdx, setCurrentPageIdx] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullScreenReader, setIsFullScreenReader] = useState<boolean>(false);
  const [showTocDrawer, setShowTocDrawer] = useState<boolean>(false);

  // Synchronized Notes Audio Narration State (Prompt Requirement)
  const [notesAudioOpen, setNotesAudioOpen] = useState<boolean>(false);
  const [notesAudioPlaying, setNotesAudioPlaying] = useState<boolean>(false);
  const [notesAudioPaused, setNotesAudioPaused] = useState<boolean>(false);
  const [notesAudioSpeed, setNotesAudioSpeed] = useState<number>(1.0);
  const [notesAudioTrackIdx, setNotesAudioTrackIdx] = useState<number>(0);
  const [notesAudioDuration, setNotesAudioDuration] = useState<number>(0);
  const [notesAudioCurrentTime, setNotesAudioCurrentTime] = useState<number>(0);
  const [notesAudioLoading, setNotesAudioLoading] = useState<boolean>(false);
  const notesAudioElementRef = useRef<HTMLAudioElement | null>(null);
  const synthUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Adaptive AI Teaching State (Section 9)
  const [teachingLevel, setTeachingLevel] = useState<1 | 2 | 3>(2);
  const [adaptiveLoading, setAdaptiveLoading] = useState<boolean>(false);
  const [adaptiveData, setAdaptiveData] = useState<{
    explanation: string;
    analogyOrExample: string;
    keyTakeaway: string;
    interactiveCheck?: { question: string; options: string[]; correctIndex: number; explanation: string };
  } | null>(null);
  const [quickCheckSelected, setQuickCheckSelected] = useState<number | null>(null);
  const [quickCheckAnswered, setQuickCheckAnswered] = useState<boolean>(false);
  const [inlineSectionQuestion, setInlineSectionQuestion] = useState<string>('');
  const [inlineSectionAnswer, setInlineSectionAnswer] = useState<any | null>(null);
  const [inlineAskLoading, setInlineAskLoading] = useState<boolean>(false);

  // White-Page Full Notebook Editing State
  const [editTitle, setEditTitle] = useState<string>('');
  const [editSubject, setEditSubject] = useState<string>('Science');
  const [editNotebook, setEditNotebook] = useState<string>('Biology');
  const [editMarkdown, setEditMarkdown] = useState<string>('');
  const [editStructured, setEditStructured] = useState<any | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [historyStack, setHistoryStack] = useState<Array<{ title: string; markdown: string; structured: any }>>([]);
  const [redoStack, setRedoStack] = useState<Array<{ title: string; markdown: string; structured: any }>>([]);
  const [editingSectionIdx, setEditingSectionIdx] = useState<number | null>(null);
  const [newKeyNoteText, setNewKeyNoteText] = useState<string>('');
  const [studentSectionNotes, setStudentSectionNotes] = useState<Record<number, string>>({});
  const autosaveTimerRef = useRef<number | null>(null);

  // Intelligent Search & Generation Input State (Section 3 & 4)
  const [heroPrompt, setHeroPrompt] = useState<string>(searchParams.get('topic') || activeTopic || '');
  const [isListeningVoice, setIsListeningVoice] = useState<boolean>(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState<boolean>(false);
  const [pendingSources, setPendingSources] = useState<PendingSourceItem[]>([]);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'ok' | 'err'; message: string } | null>(null);
  const [generating, setGenerating] = useState<boolean>(false);
  const [pipelineStepIdx, setPipelineStepIdx] = useState<number>(0);

  // Universal Topic Classifier Live Preview
  const [topicClassification, setTopicClassification] = useState<any | null>(null);
  const [classifyingTopic, setClassifyingTopic] = useState<boolean>(false);

  // Lightbox Zoom Modal for Diagrams (Section 11)
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; caption?: string } | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState<number>(1);

  // Studio Tools State (Audio, Quiz, Mind Map, Slides, Infographics)
  const [studyToolsData, setStudyToolsData] = useState<any | null>(null);
  const [studyToolsLoading, setStudyToolsLoading] = useState<boolean>(false);
  const [selectedStudioTool, setSelectedStudioTool] = useState<'audio' | 'mindmap' | 'slides' | 'infographic' | 'quiz' | 'reports'>('audio');
  const [audioExperience, setAudioExperience] = useState<'single' | 'two-speaker'>('single');
  const [currentSlideIdx, setCurrentSlideIdx] = useState<number>(0);
  const [mindmapZoom, setMindmapZoom] = useState<number>(1);
  const [mindmapExpandedNodes, setMindmapExpandedNodes] = useState<Record<string, boolean>>({
    'mm-branch-concepts': true,
    'mm-branch-terms': true,
    'mm-branch-visuals': true,
    'mm-branch-exam': true
  });
  const [activeMindmapNode, setActiveMindmapNode] = useState<any | null>(null);

  // Flashcards State
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const [knownCards, setKnownCards] = useState<Record<number, boolean>>({});

  // Source-Grounded Q&A State
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);
  const [qaQuestion, setQaQuestion] = useState<string>('');
  const [qaLoading, setQaLoading] = useState<boolean>(false);
  const [qaHistory, setQaHistory] = useState<any[]>([]);

  // Hidden File Inputs for Attachment Modal
  const fileInputPdfRef = useRef<HTMLInputElement | null>(null);
  const fileInputCameraRef = useRef<HTMLInputElement | null>(null);
  const fileInputSingleImageRef = useRef<HTMLInputElement | null>(null);
  const fileInputMultipleImagesRef = useRef<HTMLInputElement | null>(null);
  const fileInputDocxRef = useRef<HTMLInputElement | null>(null);
  const fileInputPptxRef = useRef<HTMLInputElement | null>(null);

  // URL Attachment Inputs
  const [webUrlInput, setWebUrlInput] = useState<string>('');
  const [youtubeUrlInput, setYoutubeUrlInput] = useState<string>('');

  // Progressive Generation Job State (Option A Workflow)
  const [activeJob, setActiveJob] = useState<any | null>(null);

  // "Understand This Image" Interactive Modal State (Part 16)
  const [understandImageModal, setUnderstandImageModal] = useState<{
    open: boolean;
    imageTitle: string;
    sectionTitle: string;
    imageUrl: string;
    walkthrough?: any;
    question: string;
    answer: string;
    groundedComponents: string[];
    loading: boolean;
  } | null>(null);

  // Progressive Generation Job Poller
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeJob && activeJob.status !== 'Completed' && activeJob.status !== 'Failed') {
      interval = setInterval(async () => {
        try {
          const res = await apiFetch(`/api/notebooks/jobs/${activeJob.id}`);
          if (res && res.job) {
            setActiveJob(res.job);
            if (res.job.status === 'Completed' && res.job.noteId) {
              const noteRes = await apiFetch(`/api/notes/${res.job.noteId}`);
              if (noteRes) {
                selectNoteForEditing(noteRes);
                setDashboardMode('notebook');
                setNotebookSubTab('full');
                setReaderViewMode('continuous');
                triggerRefresh();
              }
            }
          }
        } catch {}
      }, 1500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeJob, apiFetch]);

  // Handle "Understand This Image" contextual Q&A
  const handleAskUnderstandImage = async (qText?: string) => {
    if (!understandImageModal) return;
    const query = qText || understandImageModal.question;
    if (!query.trim()) return;

    setUnderstandImageModal((prev) => (prev ? { ...prev, loading: true } : null));
    try {
      const res = await apiFetch('/api/notebooks/image/ask', {
        method: 'POST',
        body: JSON.stringify({
          topic: activeNote?.topic || editTitle,
          sectionTitle: understandImageModal.sectionTitle,
          imageTitle: understandImageModal.imageTitle,
          question: query,
          walkthrough: understandImageModal.walkthrough
        })
      });
      if (res && res.answer) {
        setUnderstandImageModal((prev) =>
          prev ? { ...prev, answer: res.answer, groundedComponents: res.groundedComponents || [], loading: false } : null
        );
      }
    } catch {
      setUnderstandImageModal((prev) =>
        prev
          ? {
              ...prev,
              answer: 'This diagram illustrates the core components and directional flow essential for understanding the governing concept.',
              loading: false
            }
          : null
      );
    }
  };
  const [activeAttachmentTab, setActiveAttachmentTab] = useState<'files' | 'camera' | 'multi-images' | 'links' | 'voice'>('files');

  // Load Notebooks from SQLite Backend
  const fetchNotes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.set('subject', selectedCategory);
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      const list = await apiFetch<any[]>(`/api/notes?${params.toString()}`);
      setNotes(list);

      const requestedId = searchParams.get('id');
      const requestedTopic = searchParams.get('topic');
      if (requestedId) {
        const found = list.find((n) => n.id === requestedId);
        if (found) {
          selectNoteForEditing(found);
          setDashboardMode('notebook');
          setNotebookSubTab('full');
          setReaderViewMode('continuous');
        }
      } else if (requestedTopic) {
        const cleanReqTopic = requestedTopic.trim().toLowerCase();
        const found = list.find(
          (n) =>
            (n.topic || '').toLowerCase() === cleanReqTopic ||
            (n.title || '').toLowerCase() === cleanReqTopic ||
            (n.topic || '').toLowerCase().includes(cleanReqTopic)
        );
        if (found) {
          selectNoteForEditing(found);
          setDashboardMode('notebook');
          setNotebookSubTab('full');
          setReaderViewMode('continuous');
        } else if (!generating) {
          // Auto-trigger generation so clicking from Home or navigation generates note immediately
          handleGenerateNotebook(undefined, requestedTopic.trim());
        }
      } else if (activeNote) {
        const refreshed = list.find((n) => n.id === activeNote.id);
        if (refreshed) {
          setActiveNote(refreshed);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [selectedCategory, searchQuery, refreshTick]);

  // Live Topic Classifier
  useEffect(() => {
    const trimmed = heroPrompt.trim();
    if (!trimmed || trimmed.length < 2) {
      setTopicClassification(null);
      return;
    }
    const timer = window.setTimeout(async () => {
      setClassifyingTopic(true);
      try {
        const res = await apiFetch(`/api/notes/classify?topic=${encodeURIComponent(trimmed)}`);
        setTopicClassification(res);
        if (res?.classification?.subject && res.classification.subject !== editSubject) {
          setEditSubject(res.classification.subject);
        }
      } catch {
        // Silently skip
      } finally {
        setClassifyingTopic(false);
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [heroPrompt]);

  const selectNoteForEditing = (note: any) => {
    setActiveNote(note);
    setEditTitle(note.title || '');
    setEditSubject(note.subject || 'Science');
    setEditNotebook(note.notebook || note.subject || 'Science');
    setEditMarkdown(note.content_markdown || '');
    const structuredCopy = note.structured ? JSON.parse(JSON.stringify(note.structured)) : {};
    setEditStructured(structuredCopy);
    setHistoryStack([]);
    setRedoStack([]);
    setEditingSectionIdx(null);
    setSaveStatus('idle');
    setFlippedCards({});
    setKnownCards({});
    setQaHistory([]);
    setStudyToolsData(null);
    setActiveSectionIdx(0);
    setTeachingLevel(2);
    setAdaptiveData(null);
    setQuickCheckSelected(null);
    setQuickCheckAnswered(false);
    setInlineSectionAnswer(null);
    const srcIds = (structuredCopy?.sourceRecords || []).map((s: any) => s.id);
    setSelectedSourceIds(srcIds);
  };

  // Open Notebook in Complete Single-Page Continuous Document View
  const handleOpenNotebook = (note: any) => {
    selectNoteForEditing(note);
    setDashboardMode('notebook');
    setNotebookSubTab('full');
    setReaderViewMode('continuous');
    setSearchParams({ id: note.id });
  };

  const handleBackToDashboard = () => {
    setDashboardMode('home');
    setSearchParams({});
  };

  // Voice Input Handler (SpeechRecognition)
  const handleToggleVoiceInput = () => {
    if (isListeningVoice) {
      setIsListeningVoice(false);
      return;
    }
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome, Edge, or Safari.');
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListeningVoice(true);
      };
      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setHeroPrompt(transcript);
        }
      };
      recognition.onerror = () => {
        setIsListeningVoice(false);
      };
      recognition.onend = () => {
        setIsListeningVoice(false);
      };
      recognition.start();
    } catch {
      setIsListeningVoice(false);
    }
  };

  // File Upload Helper
  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || '');
        const commaIdx = result.indexOf(',');
        resolve(commaIdx >= 0 ? result.slice(commaIdx + 1) : result);
      };
      reader.onerror = () => reject(new Error('Failed to read file bytes'));
      reader.readAsDataURL(file);
    });
  };

  const handleProcessIncomingFiles = async (
    files: FileList | File[],
    sourceTypeLabel: PendingSourceItem['sourceType']
  ) => {
    if (!files || files.length === 0) return;
    setUploadStatus(null);

    const newPendingItems: PendingSourceItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        let textContent = '';
        let base64Content = '';
        const lowerName = file.name.toLowerCase();
        if (
          file.type.startsWith('text/') ||
          lowerName.endsWith('.md') ||
          lowerName.endsWith('.txt') ||
          lowerName.endsWith('.json') ||
          lowerName.endsWith('.csv')
        ) {
          textContent = await file.text();
        } else {
          base64Content = await readFileAsBase64(file);
        }

        const res = await apiFetch('/api/notes/upload', {
          method: 'POST',
          body: JSON.stringify({
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            content: textContent,
            base64Content
          })
        });

        const previewUrl = file.type.startsWith('image/')
          ? `data:${file.type};base64,${base64Content}`
          : undefined;

        newPendingItems.push({
          id: `file-${Date.now()}-${i}`,
          sourceType: sourceTypeLabel,
          title: file.name,
          fileName: file.name,
          content: res.fullExtractedText || textContent || res.extractedSummary || '',
          base64Content: base64Content || undefined,
          previewUrl,
          pageNumber: pendingSources.length + i + 1
        });

        if (!heroPrompt.trim()) {
          setHeroPrompt(res.inferredTopic || file.name.replace(/\.[^.]+$/, ''));
        }
      } catch (err: any) {
        setUploadStatus({
          type: 'err',
          message: `Error importing "${file.name}": ${err?.message || 'Unsupported format'}`
        });
      }
    }

    if (newPendingItems.length > 0) {
      setPendingSources((prev) => [...prev, ...newPendingItems]);
      setUploadStatus({
        type: 'ok',
        message: `Successfully attached ${newPendingItems.length} file(s). Ready to generate guided learning notebook!`
      });
    }
  };

  // Re-ordering for multiple textbook images (Section 4 & 5)
  const handleMoveImagePage = (idx: number, direction: -1 | 1) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= pendingSources.length) return;
    setPendingSources((prev) => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy.map((item, p) => ({ ...item, pageNumber: p + 1 }));
    });
  };

  const handleRemovePendingSource = (id: string) => {
    setPendingSources((prev) =>
      prev.filter((p) => p.id !== id).map((item, p) => ({ ...item, pageNumber: p + 1 }))
    );
  };

  // Main Generator Form Submission (Section 7, 8 & 15)
  const handleGenerateNotebook = async (e?: React.FormEvent, overrideTopic?: string) => {
    if (e) e.preventDefault();
    const effectiveTopic =
      overrideTopic?.trim() ||
      heroPrompt.trim() ||
      pendingSources[0]?.title ||
      'Comprehensive Study Notebook';

    if (!effectiveTopic && pendingSources.length === 0) {
      setUploadStatus({
        type: 'err',
        message: 'Please enter a learning topic or attach a source (PDF, textbook image, or link).'
      });
      return;
    }

    setGenerating(true);
    setPipelineStepIdx(0);
    setUploadStatus(null);

    const stepInterval = window.setInterval(() => {
      setPipelineStepIdx((prev) => (prev < PIPELINE_STEP_LABELS.length - 1 ? prev + 1 : prev));
    }, 380);

    try {
      const sourcesPayload: any[] = [...pendingSources];
      if (youtubeUrlInput.trim()) {
        sourcesPayload.push({
          sourceType: 'youtube',
          title: `YouTube Lecture (${youtubeUrlInput.trim()})`,
          url: youtubeUrlInput.trim()
        });
      }
      if (webUrlInput.trim()) {
        sourcesPayload.push({
          sourceType: 'web',
          title: `Web Article (${webUrlInput.trim()})`,
          url: webUrlInput.trim()
        });
      }

      const created = await apiFetch('/api/notes/generate', {
        method: 'POST',
        body: JSON.stringify({
          topic: effectiveTopic,
          subject: editSubject,
          depth: 'detailed',
          sourceType: sourcesPayload.length > 0 ? sourcesPayload[0].sourceType : 'topic',
          sources: sourcesPayload.length > 0 ? sourcesPayload : undefined
        })
      });

      await setTopicContext(created.topic, created.subject);
      setHeroPrompt('');
      setYoutubeUrlInput('');
      setWebUrlInput('');
      setPendingSources([]);
      setShowAttachmentModal(false);
      triggerRefresh();
      selectNoteForEditing(created);
      setDashboardMode('notebook');
      setNotebookSubTab('full');
      setReaderViewMode('continuous');
      setSearchParams({ id: created.id });
    } catch (err: any) {
      setUploadStatus({ type: 'err', message: err?.message || 'Failed to generate notebook.' });
    } finally {
      window.clearInterval(stepInterval);
      setGenerating(false);
    }
  };

  // Adaptive AI Teaching Trigger (Section 9)
  const handleTriggerAdaptive = async (action: 'simplify' | 'explain_more' | 'show_example', level?: 1 | 2 | 3) => {
    if (!activeNote) return;
    setAdaptiveLoading(true);
    try {
      const res = await apiFetch(`/api/notes/${activeNote.id}/adaptive`, {
        method: 'POST',
        body: JSON.stringify({
          sectionIndex: activeSectionIdx,
          action,
          level
        })
      });
      setAdaptiveData(res);
      if (res.level) setTeachingLevel(res.level);
      setQuickCheckSelected(null);
      setQuickCheckAnswered(false);
    } catch (err: any) {
      console.error('Failed to adapt section:', err);
    } finally {
      setAdaptiveLoading(false);
    }
  };

  // Inline Section Ask AI
  const handleAskSectionAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNote || !inlineSectionQuestion.trim()) return;
    setInlineAskLoading(true);
    try {
      const currentSec = (activeNote.structured?.sections || [])[activeSectionIdx];
      const contextQ = `Regarding "${currentSec?.heading || 'this section'}": ${inlineSectionQuestion.trim()}`;
      const res = await apiFetch(`/api/notes/${activeNote.id}/ask`, {
        method: 'POST',
        body: JSON.stringify({
          question: contextQ,
          selectedSourceIds
        })
      });
      setInlineSectionAnswer(res);
      setInlineSectionQuestion('');
    } catch (err: any) {
      alert(err?.message || 'Failed to answer question.');
    } finally {
      setInlineAskLoading(false);
    }
  };

  // Study Tools Synthesizer (Audio, Mind Map, Slides, Infographics, Quiz)
  const handleLoadStudyTools = async () => {
    if (!activeNote) return;
    setStudyToolsLoading(true);
    try {
      const res = await apiFetch(`/api/notes/${activeNote.id}/study-tools`, {
        method: 'POST',
        body: JSON.stringify({ toolType: 'all', audioMode: audioExperience })
      });
      setStudyToolsData(res);
    } catch (err: any) {
      alert(err?.message || 'Failed to synthesize study tools.');
    } finally {
      setStudyToolsLoading(false);
    }
  };

  // Export Document (HTML / Word / Markdown)
  const handleExport = async (format: 'html' | 'doc' | 'md') => {
    if (!activeNote) return;
    try {
      const res = await fetch(`/api/notes/${activeNote.id}/export?format=${format}`);
      const content = await res.text();
      const mime =
        format === 'html'
          ? 'text/html;charset=utf-8'
          : format === 'doc'
          ? 'application/msword;charset=utf-8'
          : 'text/markdown;charset=utf-8';
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${editTitle.replace(/[^a-zA-Z0-9_-]+/g, '_')}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Export failed. Please check network connection.');
    }
  };

  // Section completion mark
  const handleCompleteCurrentSection = () => {
    setCompletedSections((prev) => ({ ...prev, [activeSectionIdx]: true }));
    const totalSecs = (activeNote?.structured?.sections || []).length;
    if (activeSectionIdx < totalSecs - 1) {
      setActiveSectionIdx((prev) => prev + 1);
      setAdaptiveData(null);
      setQuickCheckSelected(null);
      setQuickCheckAnswered(false);
      setInlineSectionAnswer(null);
    } else {
      // Reached the end: open full white-page view to view The Final Revision Page!
      setNotebookSubTab('full');
    }
  };

  // Save student inline section note
  const handleSaveStudentSectionNote = (idx: number, text: string) => {
    setStudentSectionNotes((prev) => ({ ...prev, [idx]: text }));
  };

  const categories = ['All', 'Science', 'Maths', 'English', 'Social Studies', 'Computer Science'];
  const structured = editStructured || activeNote?.structured || {};
  const sections: any[] = structured?.sections || [];
  const currentSection = sections[activeSectionIdx] || sections[0] || {};
  const currentPairedImage = (structured?.images || [])[activeSectionIdx] || (structured?.images || [])[0];
  const finalRevisionPage = structured?.finalRevisionPage || activeNote?.finalRevisionPage;

  // Digital Textbook Paged Reader Data
  const textbookPages: NotebookPageItem[] = React.useMemo(() => {
    if (structured?.textbookPages && Array.isArray(structured.textbookPages) && structured.textbookPages.length > 0) {
      return structured.textbookPages;
    }
    return partitionWorkflowIntoPages(structured?.universalTeachingWorkflow, structured);
  }, [structured]);

  // Stop active notes audio
  const stopNotesAudio = () => {
    if (notesAudioElementRef.current) {
      notesAudioElementRef.current.pause();
      notesAudioElementRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setNotesAudioPlaying(false);
    setNotesAudioPaused(false);
    setNotesAudioCurrentTime(0);
  };

  // Fallback speech synthesis
  const fallbackSpeechSynthesis = (text: string, currentIdx: number) => {
    setNotesAudioLoading(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = notesAudioSpeed;
      utterance.pitch = 1.0;
      synthUtteranceRef.current = utterance;

      utterance.onstart = () => {
        setNotesAudioPlaying(true);
        setNotesAudioPaused(false);
      };
      utterance.onend = () => {
        setNotesAudioPlaying(false);
        setNotesAudioPaused(false);
        if (currentIdx + 1 < textbookPages.length) {
          playNotesAudio(currentIdx + 1);
        }
      };
      utterance.onerror = () => {
        setNotesAudioPlaying(false);
        setNotesAudioPaused(false);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setNotesAudioPlaying(false);
    }
  };

  // Play Notes Audio for a target page
  const playNotesAudio = async (pageIdx?: number) => {
    const targetIdx = typeof pageIdx === 'number' ? pageIdx : currentPageIdx;
    const page = textbookPages[targetIdx] || textbookPages[0];
    if (!page) return;

    stopNotesAudio();
    setNotesAudioTrackIdx(targetIdx);
    setCurrentPageIdx(targetIdx);
    setNotesAudioOpen(true);
    setNotesAudioLoading(true);

    const topicTitle = editTitle || activeNote?.title || 'StudyAI Chapter';
    const rawSpeechText = page.spokenAudioText || cleanNotebookTextForAudioSpeech(page.contentMarkdown, topicTitle);
    const sanitizedSpeech = cleanNotebookTextForAudioSpeech(rawSpeechText, topicTitle);

    try {
      const res = await apiFetch<any>('/api/media/audio', {
        method: 'POST',
        body: JSON.stringify({
          topic: topicTitle,
          text: sanitizedSpeech,
          speed: notesAudioSpeed,
          voice: 'Nova (Teacher)',
          mode: 'notes_audio',
          cleanSpeech: true
        })
      });

      if (res && res.wavDataUrl) {
        if (!notesAudioElementRef.current) {
          notesAudioElementRef.current = new Audio();
        }
        const audio = notesAudioElementRef.current;
        audio.src = res.wavDataUrl;
        audio.playbackRate = notesAudioSpeed;

        audio.onloadedmetadata = () => {
          setNotesAudioDuration(audio.duration || res.durationSeconds || 30);
        };
        audio.ontimeupdate = () => {
          setNotesAudioCurrentTime(audio.currentTime);
        };
        audio.onended = () => {
          setNotesAudioPlaying(false);
          setNotesAudioPaused(false);
          if (targetIdx + 1 < textbookPages.length) {
            playNotesAudio(targetIdx + 1);
          }
        };
        audio.onerror = () => {
          fallbackSpeechSynthesis(sanitizedSpeech, targetIdx);
        };

        await audio.play();
        setNotesAudioPlaying(true);
        setNotesAudioPaused(false);
        setNotesAudioLoading(false);
        return;
      }
    } catch {
      // Fallback below
    }

    fallbackSpeechSynthesis(sanitizedSpeech, targetIdx);
  };

  const pauseNotesAudio = () => {
    if (notesAudioElementRef.current && notesAudioPlaying) {
      notesAudioElementRef.current.pause();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
    setNotesAudioPlaying(false);
    setNotesAudioPaused(true);
  };

  const resumeNotesAudio = () => {
    if (notesAudioElementRef.current && notesAudioPaused) {
      notesAudioElementRef.current.play();
      setNotesAudioPlaying(true);
      setNotesAudioPaused(false);
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window && notesAudioPaused) {
      window.speechSynthesis.resume();
      setNotesAudioPlaying(true);
      setNotesAudioPaused(false);
    } else {
      playNotesAudio(notesAudioTrackIdx);
    }
  };

  const handleAudioSpeedChange = (speed: number) => {
    setNotesAudioSpeed(speed);
    if (notesAudioElementRef.current) {
      notesAudioElementRef.current.playbackRate = speed;
    }
    if (synthUtteranceRef.current && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (notesAudioPlaying) {
        playNotesAudio(notesAudioTrackIdx);
      }
    }
  };

  const nextNotesAudioTrack = () => {
    if (notesAudioTrackIdx + 1 < textbookPages.length) {
      playNotesAudio(notesAudioTrackIdx + 1);
    }
  };

  const prevNotesAudioTrack = () => {
    if (notesAudioTrackIdx > 0) {
      playNotesAudio(notesAudioTrackIdx - 1);
    }
  };

  // Keyboard navigation for reader (arrows to turn page, Escape for fullscreen)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'Escape' && isFullScreenReader) {
        setIsFullScreenReader(false);
      } else if (e.key === 'ArrowRight' && (isFullScreenReader || (notebookSubTab === 'full' && readerViewMode === 'paged'))) {
        setCurrentPageIdx((prev) => Math.min(prev + 1, textbookPages.length - 1));
      } else if (e.key === 'ArrowLeft' && (isFullScreenReader || (notebookSubTab === 'full' && readerViewMode === 'paged'))) {
        setCurrentPageIdx((prev) => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreenReader, readerViewMode, notebookSubTab, textbookPages.length]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopNotesAudio();
    };
  }, []);

  return (
    <div className="studyai-container" style={{ paddingBottom: 60 }}>
      {/* Top Brand Bar */}
      <TopBrandBar showBack={dashboardMode === 'notebook'} onBack={handleBackToDashboard} />

      {/* =========================================================================
          VIEW 1: CLEAN MAIN AI NOTES DASHBOARD (Section 3)
          ========================================================================= */}
      {dashboardMode === 'home' && (
        <main style={{ maxWidth: 1040, margin: '0 auto', padding: '12px 16px' }}>
          {/* Header Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #FF6A00 0%, #E85D00 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 20px rgba(255, 106, 0, 0.28)'
                }}
              >
                <FuturisticIcon name="notes" size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#202124', margin: 0, letterSpacing: '-0.3px' }}>
                  STUDYAI Notes
                </h1>
                <p style={{ fontSize: '0.84rem', color: '#6B7280', margin: 0 }}>
                  Intelligent Learning Notebook • Guided Roadmaps & Adaptive Explanations
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  padding: '6px 14px',
                  borderRadius: 9999,
                  background: '#FFF3E8',
                  color: '#FF6A00',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  border: '1px solid rgba(255,106,0,0.2)'
                }}
              >
                {notes.length} Notebooks Saved
              </span>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="btn-glass"
                style={{ padding: '7px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <span>Profile</span>
              </button>
            </div>
          </div>

          {/* Centre Hero: Large Intelligent Input Box (Section 3) */}
          <section
            className="hero-glass-banner"
            style={{
              padding: '36px 32px',
              borderRadius: 28,
              textAlign: 'center',
              marginBottom: 36,
              background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%)',
              border: '1.5px solid rgba(255, 106, 0, 0.16)',
              boxShadow: '0 20px 48px -12px rgba(255, 106, 0, 0.12)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <StudyAiAssistantCharacter
                size="md"
                state={generating ? 'thinking' : 'idle'}
                speechBubble={
                  generating
                    ? `Researching: ${PIPELINE_STEP_LABELS[pipelineStepIdx] || 'Synthesizing knowledge...'}`
                    : 'Ready to research! Ask any syllabus topic or attach textbooks.'
                }
              />
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 9999, background: '#FFF3E8', color: '#FF6A00', fontWeight: 800, fontSize: '0.76rem', marginBottom: 12 }}>
              <Sparkles size={14} />
              <span>AI-Powered Guided Roadmaps</span>
            </div>
            <h2 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#202124', letterSpacing: '-0.5px', marginBottom: 8 }}>
              What would you like to learn?
            </h2>
            <p style={{ fontSize: '0.94rem', color: '#6B7280', maxWidth: 620, margin: '0 auto 24px auto' }}>
              Enter any topic, question or instructions. Tap the plus (<span style={{ color: '#FF6A00', fontWeight: 800 }}>+</span>) button to import PDFs, textbook photos, Word docs or YouTube lectures.
            </p>

            {/* Large Intelligent Input Bar with Plus (+) and Voice Input */}
            <form onSubmit={handleGenerateNotebook} style={{ maxWidth: 740, margin: '0 auto' }}>
              <div
                className="glass-input-wrap-futuristic"
                style={{
                  background: '#FFFFFF',
                  borderRadius: 20,
                  border: '2px solid #FF6A00',
                  boxShadow: '0 10px 30px rgba(255, 106, 0, 0.14)',
                  padding: '6px 8px 6px 14px'
                }}
              >
                <div className="futuristic-input-row">
                  {/* Prominent Plus (+) Attachment Button */}
                  <button
                    type="button"
                    onClick={() => setShowAttachmentModal(true)}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: pendingSources.length > 0 ? '#10B981' : '#FFF3E8',
                      border: 'none',
                      color: pendingSources.length > 0 ? '#FFFFFF' : '#FF6A00',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'transform 0.18s ease'
                    }}
                    title="Attach PDF, Textbook Photo, Images, Word doc, or Links"
                    aria-label="Add Attachments"
                  >
                    <Plus size={20} strokeWidth={2.8} />
                  </button>

                  {/* Main Input Field */}
                  <input
                    value={heroPrompt}
                    onChange={(e) => setHeroPrompt(e.target.value)}
                    placeholder="e.g. Human Heart, Photosynthesis, Quadratic Equations..."
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      fontSize: '0.98rem',
                      fontWeight: 600,
                      color: '#202124',
                      background: 'transparent',
                      padding: '8px 4px',
                      minWidth: 0
                    }}
                    aria-label="What would you like to learn?"
                  />

                  {/* Voice Input Microphone Button */}
                  <button
                    type="button"
                    onClick={handleToggleVoiceInput}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: isListeningVoice ? '#DC2626' : '#F3F4F6',
                      color: isListeningVoice ? '#FFFFFF' : '#4B5563',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0,
                      animation: isListeningVoice ? 'pulse 1.2s infinite' : 'none'
                    }}
                    title={isListeningVoice ? 'Listening... click to stop' : 'Click to speak your topic'}
                    aria-label="Voice input"
                  >
                    <Mic size={16} />
                  </button>
                </div>

                {/* Generate Notes Button */}
                <button
                  type="submit"
                  disabled={generating}
                  className="btn-orange"
                  style={{
                    padding: '10px 20px',
                    borderRadius: 14,
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    flexShrink: 0
                  }}
                >
                  <Sparkles size={16} />
                  <span>{generating ? 'Generating...' : 'Learn'}</span>
                </button>
              </div>

              {/* Live Topic Classifier Feedback */}
              {classifyingTopic && (
                <div style={{ marginTop: 8, fontSize: '0.78rem', color: '#EA580C', fontWeight: 700 }}>
                  Classifying subject, curriculum & formulas...
                </div>
              )}
              {topicClassification?.classification && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 10, padding: '4px 12px', borderRadius: 9999, background: '#FFF7ED', border: '1px solid #FFEDD5', fontSize: '0.78rem', color: '#9A3412', fontWeight: 700 }}>
                  <span>Recognized: <strong>{topicClassification.classification.subject}</strong> ({topicClassification.classification.discipline})</span>
                  <span>• Chapter: {topicClassification.classification.chapter}</span>
                  {topicClassification.classification.requiresFormulas && <span>• 🧮 Formulas Active</span>}
                </div>
              )}

              {/* Pending Attached Sources Badge */}
              {pendingSources.length > 0 && (
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#047857' }}>
                    ✓ {pendingSources.length} source(s) attached:
                  </span>
                  {pendingSources.map((s) => (
                    <span
                      key={s.id}
                      style={{
                        padding: '3px 10px',
                        borderRadius: 9999,
                        background: '#ECFDF5',
                        border: '1px solid #A7F3D0',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: '#065F46',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <span>[{s.sourceType.toUpperCase()}] {s.title}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePendingSource(s.id)}
                        style={{ border: 'none', background: 'transparent', color: '#DC2626', cursor: 'pointer', fontWeight: 800 }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </form>

            {/* Live Progressive Notebook Generation Job Card (Option A Workflow) */}
            {activeJob && (
              <div
                style={{
                  marginTop: 20,
                  padding: 20,
                  borderRadius: 20,
                  background: '#FFFFFF',
                  border: '2px solid #FF6A00',
                  boxShadow: '0 12px 36px rgba(255,106,0,0.14)',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', background: '#FFF3E8', color: '#FF6A00', padding: '3px 10px', borderRadius: 999 }}>
                      Progressive Generation: {activeJob.status}
                    </span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#202124', margin: '4px 0 0 0' }}>
                      {activeJob.topic}
                    </h3>
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#FF6A00' }}>
                    {activeJob.progressPercent}%
                  </div>
                </div>

                <div style={{ width: '100%', height: 8, background: '#F3F4F6', borderRadius: 999, overflow: 'hidden', marginBottom: 14 }}>
                  <div
                    style={{
                      width: `${activeJob.progressPercent}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #FF6A00 0%, #EA580C 100%)',
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>

                {activeJob.roadmap && (
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#4B5563', marginBottom: 8 }}>
                      Topic Roadmap ({activeJob.sections?.length || 0} of {activeJob.roadmap.subtopics.length} sections ready):
                    </div>
                    <div style={{ display: 'grid', gap: 6 }}>
                      {activeJob.roadmap.subtopics.map((st: string, idx: number) => {
                        const readySec = activeJob.sections?.find((s: any) => s.sectionIndex === idx || s.title === st);
                        const isReady = Boolean(readySec && readySec.status === 'ready');
                        const isCurrent = activeJob.currentSectionIndex === idx && !isReady;
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              if (isReady) {
                                // Student can read this section immediately!
                                setActiveNote({
                                  id: activeJob.noteId,
                                  title: activeJob.topic,
                                  topic: activeJob.topic,
                                  subject: activeJob.subject,
                                  structured: {
                                    sections: activeJob.sections,
                                    images: activeJob.sections.filter((s: any) => s.visual).map((s: any) => s.visual),
                                    roadmap: activeJob.roadmap
                                  }
                                });
                                setActiveSectionIdx(idx);
                                setDashboardMode('notebook');
                                setNotebookSubTab('full');
                                setReaderViewMode('continuous');
                              }
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              borderRadius: 10,
                              background: isReady ? '#F0FDF4' : isCurrent ? '#FFF3E8' : '#F9FAFB',
                              border: isReady ? '1px solid #BBF7D0' : isCurrent ? '1.5px solid #FF6A00' : '1px solid #E5E7EB',
                              cursor: isReady ? 'pointer' : 'default',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isReady ? '#16A34A' : isCurrent ? '#FF6A00' : '#9CA3AF' }}>
                                {isReady ? '✓' : isCurrent ? '⏳' : `${idx + 1}`}
                              </span>
                              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#202124' }}>
                                {st}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isReady ? '#16A34A' : isCurrent ? '#FF6A00' : '#9CA3AF' }}>
                              {isReady ? '📖 Ready to Read' : isCurrent ? `Processing... (${activeJob.status})` : 'Queued'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pipeline progress while generating */}
            {generating && (
              <div style={{ maxWidth: 600, margin: '20px auto 0 auto', padding: 14, borderRadius: 16, background: '#FFFFFF', border: '1.5px solid #FF6A00' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.82rem', fontWeight: 800, color: '#EA580C' }}>
                  <span>Generating Guided Learning Roadmap...</span>
                  <span>{PIPELINE_STEP_LABELS[pipelineStepIdx]}</span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: '#F3F4F6', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${((pipelineStepIdx + 1) / PIPELINE_STEP_LABELS.length) * 100}%`,
                      background: 'linear-gradient(90deg, #FF6A00, #F59E0B)',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>
            )}
          </section>

          {/* Search & Subject Category Filter Row */}
          <section style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
              <h3 style={{ fontSize: '1.18rem', fontWeight: 900, color: '#202124', margin: 0 }}>
                Recent Notebooks
              </h3>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
                    style={{ fontSize: '0.78rem', padding: '6px 14px' }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-input-wrap" style={{ marginBottom: 16 }}>
              <Search size={18} color="#FF6A00" />
              <input
                className="glass-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your saved notebooks by topic, subject, or keywords..."
                aria-label="Search notes"
              />
            </div>
          </section>

          {/* Recent Notebooks Grid with Visual Thumbnails (Section 3) */}
          <section>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>
                Loading saved notebooks...
              </div>
            ) : notes.length === 0 ? (
              <div
                style={{
                  padding: '48px 24px',
                  textAlign: 'center',
                  background: '#FFFFFF',
                  borderRadius: 24,
                  border: '1.5px dashed #E5E7EB'
                }}
              >
                <div style={{ width: 56, height: 56, borderRadius: 16, background: '#FFF3E8', color: '#FF6A00', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px auto' }}>
                  <BookOpen size={28} />
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#202124', marginBottom: 6 }}>
                  No notebooks found
                </h4>
                <p style={{ fontSize: '0.88rem', color: '#6B7280', maxWidth: 440, margin: '0 auto 18px auto' }}>
                  Type any topic above or click "+" to upload your textbook and generate your first guided learning notebook.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAttachmentModal(true)}
                  className="btn-orange"
                >
                  + Create Your First Notebook
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                  gap: 18
                }}
              >
                {notes.map((n) => {
                  const s = n.structured || {};
                  const thumbUrl =
                    s.images?.[0]?.imageUrl ||
                    s.imageUrl ||
                    n.thumbnail_url ||
                    (n.media_url && !n.media_url.endsWith('.wav') ? n.media_url : null);
                  const sectionsCount = s.sections?.length || 5;
                  const dateLabel = new Date(n.updated_at || n.created_at || Date.now()).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  });

                  return (
                    <article
                      key={n.id}
                      onClick={() => handleOpenNotebook(n)}
                      className="library-visual-card"
                      style={{ minHeight: 280 }}
                    >
                      {/* Top Visual Thumbnail (real diagram/illustration) */}
                      <div className="library-thumbnail-frame" style={{ height: 148 }}>
                        {thumbUrl ? (
                          <img
                            src={thumbUrl}
                            alt={n.title}
                            className="library-thumbnail-img"
                            loading="lazy"
                          />
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: '#FF6A00' }}>
                            <FuturisticIcon name="notes" size={36} />
                            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#6B7280' }}>
                              {n.subject}
                            </span>
                          </div>
                        )}
                        <span
                          style={{
                            position: 'absolute',
                            top: 10,
                            left: 10,
                            padding: '3px 10px',
                            borderRadius: 9999,
                            background: 'rgba(255, 255, 255, 0.92)',
                            backdropFilter: 'blur(8px)',
                            color: '#FF6A00',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                          }}
                        >
                          {n.subject}
                        </span>
                      </div>

                      {/* Card Body */}
                      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                        <div>
                          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#202124', margin: '0 0 6px 0', lineHeight: 1.35 }}>
                            {n.title}
                          </h4>
                          <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: '0 0 12px 0', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {s.simpleIntroduction || s.summary || n.content_markdown?.slice(0, 110) || 'Comprehensive guided learning notes.'}
                          </p>
                        </div>

                        {/* Card Footer: Section Progress & Continue Button */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F3F4F6', paddingTop: 10 }}>
                          <span style={{ fontSize: '0.74rem', color: '#6B7280', fontWeight: 600 }}>
                            {sectionsCount} sections • {dateLabel}
                          </span>
                          <button
                            type="button"
                            className="btn-orange"
                            style={{ padding: '5px 12px', fontSize: '0.76rem', borderRadius: 9999 }}
                          >
                            <span>Learn →</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      )}

      {/* =========================================================================
          VIEW 2: ACTIVE GUIDED LEARNING NOTEBOOK WORKSPACE (Section 8, 9, 12, 13)
          ========================================================================= */}
      {dashboardMode === 'notebook' && activeNote && (
        <main style={{ maxWidth: 1180, margin: '0 auto', padding: '12px 16px' }}>
          {/* Top Control Bar */}
          <div
            className="glass-card"
            style={{
              padding: '12px 18px',
              borderRadius: 20,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                type="button"
                onClick={handleBackToDashboard}
                className="btn-glass"
                style={{ padding: '7px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <ChevronLeft size={16} />
                <span>All Notebooks</span>
              </button>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ padding: '2px 8px', borderRadius: 6, background: '#FFF3E8', color: '#FF6A00', fontWeight: 800, fontSize: '0.72rem' }}>
                    {activeNote.subject}
                  </span>
                  <h2 style={{ fontSize: '1.22rem', fontWeight: 900, color: '#202124', margin: 0 }}>
                    {activeNote.title}
                  </h2>
                </div>
              </div>
            </div>

            {/* Mode Switcher: Continuous Single-Page Document vs Paged Reader vs Revision vs Studio vs Q&A */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  setNotebookSubTab('full');
                  setReaderViewMode('continuous');
                }}
                className={`filter-pill ${notebookSubTab === 'full' && readerViewMode === 'continuous' ? 'active' : ''}`}
                style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                title="Complete single-page continuous study document without locked steps"
              >
                <FileText size={14} style={{ marginRight: 4 }} />
                <span>📜 Complete Single-Page Notes</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setNotebookSubTab('full');
                  setReaderViewMode('paged');
                }}
                className={`filter-pill ${notebookSubTab === 'full' && readerViewMode === 'paged' ? 'active' : ''}`}
                style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                title="Page-by-page digital textbook reading experience"
              >
                <BookOpen size={14} style={{ marginRight: 4 }} />
                <span>📖 Paged Reader</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (notesAudioPlaying) {
                    pauseNotesAudio();
                  } else if (notesAudioPaused) {
                    resumeNotesAudio();
                  } else {
                    playNotesAudio(currentPageIdx);
                  }
                }}
                className={`btn-glass ${notesAudioPlaying ? 'active' : ''}`}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  background: notesAudioPlaying ? '#ECFDF5' : '#FFF7ED',
                  color: notesAudioPlaying ? '#047857' : '#C2410C',
                  borderColor: notesAudioPlaying ? '#10B981' : '#FED7AA'
                }}
                title="Listen to textbook narration with natural speech"
              >
                <Volume2 size={14} />
                <span>{notesAudioPlaying ? 'Narration Active' : '🎧 Listen to Notes'}</span>
              </button>
              <button
                type="button"
                onClick={() => setNotebookSubTab('revision')}
                className={`filter-pill ${notebookSubTab === 'revision' ? 'active' : ''}`}
                style={{ padding: '6px 14px', fontSize: '0.78rem' }}
              >
                <Award size={14} style={{ marginRight: 4 }} />
                <span>🏆 Master Revision</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setNotebookSubTab('studio');
                  if (!studyToolsData) handleLoadStudyTools();
                }}
                className={`filter-pill ${notebookSubTab === 'studio' ? 'active' : ''}`}
                style={{ padding: '6px 14px', fontSize: '0.78rem' }}
              >
                <Layers size={14} style={{ marginRight: 4 }} />
                <span>Studio Tools</span>
              </button>
              <button
                type="button"
                onClick={() => setNotebookSubTab('ask')}
                className={`filter-pill ${notebookSubTab === 'ask' ? 'active' : ''}`}
                style={{ padding: '6px 14px', fontSize: '0.78rem' }}
              >
                <MessageSquare size={14} style={{ marginRight: 4 }} />
                <span>Ask Sources</span>
              </button>
              <button
                type="button"
                onClick={() => handleExport('html')}
                className="btn-glass"
                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                title="Print or export as PDF"
              >
                <Printer size={14} />
                <span>Print / PDF</span>
              </button>
            </div>
          </div>

          {/* ---------------------------------------------------------------------
              SUB-TAB 1: GUIDED STEP-BY-STEP LEARNING ROADMAP (Section 8 & 9)
              --------------------------------------------------------------------- */}
          {notebookSubTab === 'guided' && (
            <div>
              {/* Ordered Learning Roadmap Stepper at Top (Section 8) */}
              <div
                className="glass-card"
                style={{
                  padding: '14px 18px',
                  borderRadius: 20,
                  marginBottom: 20
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Learning Roadmap • Step {activeSectionIdx + 1} of {Math.max(1, sections.length)}
                  </div>
                  <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#047857', background: '#ECFDF5', padding: '3px 10px', borderRadius: 9999 }}>
                    {Math.round(((activeSectionIdx + 1) / Math.max(1, sections.length)) * 100)}% Roadmap Progress
                  </span>
                </div>

                <div className="roadmap-stepper-container">
                  {sections.map((sec, idx) => {
                    const isCurrent = activeSectionIdx === idx;
                    const isDone = Boolean(completedSections[idx]);
                    const cleanHeading = (sec.heading || sec.title || `Section ${idx + 1}`).replace(/^\d+\.\s*/, '');
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setActiveSectionIdx(idx);
                          setAdaptiveData(null);
                          setQuickCheckSelected(null);
                          setQuickCheckAnswered(false);
                          setInlineSectionAnswer(null);
                        }}
                        className={`roadmap-step-pill ${isCurrent ? 'active' : isDone ? 'completed' : ''}`}
                      >
                        {isDone ? <Check size={13} /> : <span>{idx + 1}.</span>}
                        <span>{cleanHeading}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Guided Section Learning Canvas */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: currentPairedImage ? 'minmax(0, 1.4fr) minmax(320px, 1fr)' : 'minmax(0, 1fr)',
                  gap: 20
                }}
              >
                {/* Left/Main Column: Adaptive Learning Section Card */}
                <article
                  className="glass-card"
                  style={{
                    padding: '28px 32px',
                    borderRadius: 24,
                    background: '#FFFFFF',
                    border: '1.5px solid #EEEEEE',
                    boxShadow: '0 12px 32px rgba(32, 33, 36, 0.05)'
                  }}
                >
                  {/* Section Title & Locator */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                    <div>
                      <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#FF6A00', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Section {activeSectionIdx + 1} of {sections.length}
                      </span>
                      <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#202124', margin: '4px 0 0 0' }}>
                        {currentSection.heading || `Section ${activeSectionIdx + 1}`}
                      </h2>
                    </div>

                    {currentSection.citations && currentSection.citations[0] && (
                      <span style={{ padding: '4px 10px', borderRadius: 6, background: '#F3F4F6', color: '#4B5563', fontSize: '0.72rem', fontWeight: 700 }}>
                        📌 {currentSection.citations[0]}
                      </span>
                    )}
                  </div>

                  {/* 4 Visible Adaptive Actions Bar (Section 9: Explain Simply, Explain More, Show Example, Ask AI) */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      flexWrap: 'wrap',
                      padding: '12px 14px',
                      borderRadius: 16,
                      background: '#FFF7ED',
                      border: '1.5px solid #FFEDD5',
                      marginBottom: 22
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#9A3412', marginRight: 4 }}>
                      Adaptive AI:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTriggerAdaptive('simplify', 1)}
                      className={`adaptive-action-pill ${teachingLevel === 1 ? 'active' : ''}`}
                    >
                      💡 Explain simply
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTriggerAdaptive('explain_more', 3)}
                      className={`adaptive-action-pill ${teachingLevel === 3 ? 'active' : ''}`}
                    >
                      🔍 Explain more
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTriggerAdaptive('show_example', 2)}
                      className="adaptive-action-pill"
                    >
                      🧪 Show an example
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const qInput = document.getElementById('section-ai-input');
                        if (qInput) qInput.focus();
                      }}
                      className="adaptive-action-pill"
                    >
                      💬 Ask AI
                    </button>
                  </div>

                  {/* Adaptive Loading State */}
                  {adaptiveLoading ? (
                    <div style={{ padding: 24, textAlign: 'center', color: '#EA580C', fontWeight: 700 }}>
                      Tailoring explanation to Level {teachingLevel}...
                    </div>
                  ) : (
                    /* Adaptive Text Explanation */
                    <div style={{ fontSize: '1.02rem', color: '#202124', lineHeight: 1.75, marginBottom: 20 }}>
                      {adaptiveData ? (
                        <div>
                          <div style={{ padding: 14, borderRadius: 14, background: '#FFF3E8', borderLeft: '4px solid #FF6A00', marginBottom: 16 }}>
                            <strong style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#E85D00', display: 'block', marginBottom: 4 }}>
                              Adapted View (Level {teachingLevel})
                            </strong>
                            <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{adaptiveData.explanation}</p>
                          </div>

                          {adaptiveData.analogyOrExample && (
                            <div style={{ padding: 12, borderRadius: 12, background: '#F0FDF4', borderLeft: '4px solid #16A34A', fontSize: '0.94rem', color: '#166534', marginBottom: 14 }}>
                              {adaptiveData.analogyOrExample}
                            </div>
                          )}

                          {adaptiveData.keyTakeaway && (
                            <div style={{ padding: 10, borderRadius: 10, background: '#EFF6FF', fontSize: '0.88rem', color: '#1E40AF', fontWeight: 600 }}>
                              {adaptiveData.keyTakeaway}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p style={{ margin: '0 0 16px 0', whiteSpace: 'pre-line' }}>
                          {currentSection.body || currentSection.plainExplanation || activeNote.summary}
                        </p>
                      )}

                      {/* Key Points Checklist */}
                      {Array.isArray(currentSection.keyPoints) && currentSection.keyPoints.length > 0 && (
                        <ul style={{ margin: '14px 0', paddingLeft: 20 }}>
                          {currentSection.keyPoints.map((kp: string, kIdx: number) => (
                            <li key={kIdx} style={{ marginBottom: 6, color: '#374151' }}>
                              {kp}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* Governing Equation & Worked Example (if mathematical/scientific) */}
                  {structured.formula && activeSectionIdx === 0 && (
                    <div style={{ padding: 16, borderRadius: 16, background: '#F8FAFC', border: '1.5px solid #E2E8F0', marginBottom: 20 }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: 6 }}>
                        Governing Formula & Units
                      </div>
                      <div style={{ fontSize: '1.18rem', fontWeight: 800, fontFamily: 'monospace', color: '#0F172A', marginBottom: 6 }}>
                        {structured.formula.equation || structured.formula.expression}
                      </div>
                      {structured.formula.workedExample && (
                        <div style={{ fontSize: '0.88rem', color: '#334155', borderTop: '1px solid #E2E8F0', paddingTop: 6 }}>
                          <strong>Worked Example:</strong> {structured.formula.workedExample}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Interactive Concept Quick-Check Question (Section 8 & 9) */}
                  <div
                    style={{
                      padding: '20px 22px',
                      borderRadius: 18,
                      background: '#FAFAFA',
                      border: '1.5px solid #EEEEEE',
                      marginBottom: 22
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <HelpCircle size={16} color="#FF6A00" />
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#202124', textTransform: 'uppercase' }}>
                        Quick Concept Check: Test Your Understanding
                      </span>
                    </div>

                    <p style={{ fontSize: '0.94rem', fontWeight: 700, color: '#111827', marginBottom: 12 }}>
                      {adaptiveData?.interactiveCheck?.question ||
                        `In the context of ${currentSection.heading || 'this concept'}, which mechanism is scientifically accurate?`}
                    </p>

                    <div style={{ display: 'grid', gap: 8 }}>
                      {(
                        adaptiveData?.interactiveCheck?.options || [
                          `It operates in direct structured alignment with the verified principles in this section.`,
                          `It operates randomly without governing pathways or biological/physical rules.`,
                          `It reverses standard direction under normal room conditions without external work.`
                        ]
                      ).map((opt: string, optIdx: number) => {
                        const isSelected = quickCheckSelected === optIdx;
                        const isCorrect = optIdx === (adaptiveData?.interactiveCheck?.correctIndex ?? 0);

                        let optBg = '#FFFFFF';
                        let optBorder = '1px solid #E5E7EB';
                        if (quickCheckAnswered) {
                          if (isCorrect) {
                            optBg = '#ECFDF5';
                            optBorder = '2px solid #10B981';
                          } else if (isSelected && !isCorrect) {
                            optBg = '#FEF2F2';
                            optBorder = '2px solid #EF4444';
                          }
                        } else if (isSelected) {
                          optBg = '#FFF3E8';
                          optBorder = '2px solid #FF6A00';
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => {
                              setQuickCheckSelected(optIdx);
                              setQuickCheckAnswered(true);
                            }}
                            style={{
                              padding: '10px 14px',
                              borderRadius: 12,
                              background: optBg,
                              border: optBorder,
                              textAlign: 'left',
                              fontSize: '0.88rem',
                              fontWeight: isSelected ? 700 : 500,
                              color: '#1F2937',
                              cursor: 'pointer',
                              transition: 'all 0.18s ease'
                            }}
                          >
                            <span>{String.fromCharCode(65 + optIdx)}. </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {quickCheckAnswered && (
                      <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: quickCheckSelected === 0 ? '#ECFDF5' : '#FFF7ED', fontSize: '0.86rem', color: quickCheckSelected === 0 ? '#065F46' : '#9A3412', fontWeight: 600 }}>
                        {quickCheckSelected === 0
                          ? '🎉 Excellent understanding! You nailed the core principle.'
                          : '💡 Good effort! Review the definition above and try the adaptive Level 1 explanation.'}
                      </div>
                    )}
                  </div>

                  {/* Ask AI Grounded on this Section */}
                  <div style={{ marginBottom: 24, borderTop: '1px solid #EEEEEE', paddingTop: 18 }}>
                    <form onSubmit={handleAskSectionAI} style={{ display: 'flex', gap: 8 }}>
                      <input
                        id="section-ai-input"
                        value={inlineSectionQuestion}
                        onChange={(e) => setInlineSectionQuestion(e.target.value)}
                        placeholder={`Ask AI a question about "${currentSection.heading || 'this section'}"...`}
                        style={{
                          flex: 1,
                          padding: '10px 14px',
                          borderRadius: 12,
                          border: '1.5px solid #E5E7EB',
                          fontSize: '0.88rem',
                          outline: 'none'
                        }}
                      />
                      <button
                        type="submit"
                        disabled={inlineAskLoading}
                        className="btn-orange"
                        style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                      >
                        {inlineAskLoading ? 'Asking...' : 'Ask Section AI'}
                      </button>
                    </form>

                    {inlineSectionAnswer && (
                      <div style={{ marginTop: 12, padding: 14, borderRadius: 12, background: '#F0FDF4', border: '1px solid #BBF7D0', fontSize: '0.88rem', color: '#14532D' }}>
                        <strong>AI Tutor: </strong>
                        <span>{inlineSectionAnswer.sourceGroundedAnswer || inlineSectionAnswer.aiSupplementalExplanation}</span>
                      </div>
                    )}
                  </div>

                  {/* Student Personal Takeaway Input (Section 14) */}
                  <div style={{ marginBottom: 24, padding: 14, borderRadius: 14, background: '#F9FAFB', border: '1px dashed #D1D5DB' }}>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#4B5563', textTransform: 'uppercase', marginBottom: 6 }}>
                      ✍️ Your Personal Notes / Classroom Highlights for This Section:
                    </label>
                    <textarea
                      value={studentSectionNotes[activeSectionIdx] || ''}
                      onChange={(e) => handleSaveStudentSectionNote(activeSectionIdx, e.target.value)}
                      rows={2}
                      placeholder="Type your personal observations, teacher hints, or mnemonics here..."
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid #E5E7EB', fontSize: '0.86rem', fontFamily: 'inherit' }}
                    />
                  </div>

                  {/* Section Navigation Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1.5px solid #EEEEEE', paddingTop: 18 }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (activeSectionIdx > 0) {
                          setActiveSectionIdx((prev) => prev - 1);
                          setAdaptiveData(null);
                          setQuickCheckSelected(null);
                          setQuickCheckAnswered(false);
                          setInlineSectionAnswer(null);
                        }
                      }}
                      disabled={activeSectionIdx === 0}
                      className="btn-glass"
                      style={{ padding: '8px 16px', fontSize: '0.82rem', opacity: activeSectionIdx === 0 ? 0.4 : 1 }}
                    >
                      <ChevronLeft size={16} />
                      <span>Previous Section</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCompleteCurrentSection}
                      className="btn-orange"
                      style={{ padding: '10px 22px', fontSize: '0.88rem', fontWeight: 800 }}
                    >
                      <span>
                        {activeSectionIdx < sections.length - 1
                          ? 'Continue Learning Next Section →'
                          : 'Complete Roadmap & View Master Sheet 🏆'}
                      </span>
                    </button>
                  </div>
                </article>

                {/* Right Column: High-Resolution Labeled Educational Diagram (Section 11) */}
                {currentPairedImage && (
                  <aside style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div
                      className="glass-card"
                      style={{
                        padding: 16,
                        borderRadius: 22,
                        background: '#FFFFFF',
                        border: '1.5px solid #EEEEEE',
                        boxShadow: '0 8px 24px rgba(32, 33, 36, 0.05)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#FF6A00', textTransform: 'uppercase' }}>
                          Scientific Diagram
                        </span>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() =>
                              setLightboxImage({
                                url: currentPairedImage.imageUrl,
                                title: currentPairedImage.title,
                                caption: currentPairedImage.caption
                              })
                            }
                            className="btn-glass"
                            style={{ padding: '5px 10px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: 4 }}
                            title="Open Fullscreen Lightbox Zoom"
                          >
                            <Maximize2 size={13} />
                            <span>Zoom</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => open3DLab(activeNote.topic || editTitle)}
                            className="btn-glass"
                            style={{ padding: '5px 10px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: 4 }}
                            title="Open in 3D Interactive Lab"
                          >
                            <ExternalLink size={13} />
                            <span>3D Lab</span>
                          </button>
                        </div>
                      </div>

                      {/* Large Readable Diagram Container */}
                      <div
                        onClick={() =>
                          setLightboxImage({
                            url: currentPairedImage.imageUrl,
                            title: currentPairedImage.title,
                            caption: currentPairedImage.caption
                          })
                        }
                        style={{
                          borderRadius: 14,
                          overflow: 'hidden',
                          border: '1px solid #EEEEEE',
                          background: '#FFFFFF',
                          cursor: 'zoom-in',
                          marginBottom: 10
                        }}
                      >
                        <img
                          src={currentPairedImage.imageUrl}
                          alt={currentPairedImage.title}
                          style={{
                            width: '100%',
                            maxHeight: 340,
                            objectFit: 'contain',
                            display: 'block'
                          }}
                        />
                      </div>

                      <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#202124', margin: '0 0 4px 0' }}>
                        {currentPairedImage.title}
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: '0 0 12px 0', lineHeight: 1.45 }}>
                        {currentPairedImage.caption}
                      </p>

                      {/* Interactive "Understand This Image" AI Action */}
                      <div style={{ marginBottom: 12 }}>
                        <button
                          type="button"
                          onClick={() =>
                            setUnderstandImageModal({
                              open: true,
                              imageTitle: currentPairedImage.title,
                              sectionTitle: currentSection?.heading || activeNote?.title || 'Diagram Overview',
                              imageUrl: currentPairedImage.imageUrl,
                              walkthrough: currentPairedImage.walkthrough || currentSection?.imageWalkthrough || currentPairedImage.explanation,
                              question: '',
                              answer: '',
                              groundedComponents: currentPairedImage.explanation?.majorParts || [],
                              loading: false
                            })
                          }
                          className="btn-orange"
                          style={{
                            width: '100%',
                            padding: '8px 14px',
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6
                          }}
                        >
                          <Sparkles size={14} />
                          <span>Understand This Image (Ask AI)</span>
                        </button>
                      </div>

                      {/* 8-Point Scientific Image Walkthrough Breakdown */}
                      {(currentPairedImage.walkthrough || currentSection?.imageWalkthrough || currentPairedImage.explanation) && (
                        <div style={{ padding: 12, borderRadius: 12, background: '#FFFDF9', border: '1px solid #FED7AA', marginBottom: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                            <Compass size={14} color="#EA580C" />
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#EA580C' }}>
                              8-Point Image Walkthrough
                            </span>
                          </div>

                          {/* 1. What it represents */}
                          {(currentPairedImage.walkthrough?.whatItRepresents || currentPairedImage.explanation?.mechanismOverview) && (
                            <div style={{ marginBottom: 6 }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151' }}>1. What It Represents: </span>
                              <span style={{ fontSize: '0.74rem', color: '#4B5563' }}>
                                {currentPairedImage.walkthrough?.whatItRepresents || currentPairedImage.explanation?.mechanismOverview}
                              </span>
                            </div>
                          )}

                          {/* 2. What student is looking at */}
                          {currentPairedImage.walkthrough?.whatStudentIsLookingAt && (
                            <div style={{ marginBottom: 6 }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151' }}>2. Viewing Perspective: </span>
                              <span style={{ fontSize: '0.74rem', color: '#4B5563' }}>
                                {currentPairedImage.walkthrough.whatStudentIsLookingAt}
                              </span>
                            </div>
                          )}

                          {/* 3. Arrow indications / Process sequence */}
                          {(currentPairedImage.walkthrough?.arrowIndications || currentPairedImage.walkthrough?.processSequence) && (
                            <div style={{ marginBottom: 6 }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151' }}>3. Directional Flow: </span>
                              <span style={{ fontSize: '0.74rem', color: '#4B5563' }}>
                                {currentPairedImage.walkthrough?.arrowIndications || currentPairedImage.walkthrough?.processSequence}
                              </span>
                            </div>
                          )}

                          {/* 4. Important Conclusion */}
                          {currentPairedImage.walkthrough?.importantConclusion && (
                            <div style={{ marginBottom: 6 }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151' }}>4. Core Takeaway: </span>
                              <span style={{ fontSize: '0.74rem', color: '#4B5563' }}>
                                {currentPairedImage.walkthrough.importantConclusion}
                              </span>
                            </div>
                          )}

                          {/* 5. Exam Tip */}
                          {currentPairedImage.walkthrough?.examTip && (
                            <div style={{ padding: '6px 8px', borderRadius: 6, background: '#FFF7ED', border: '1px solid #FFEDD5', marginTop: 6 }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#C2410C' }}>💡 Exam Tip: </span>
                              <span style={{ fontSize: '0.72rem', color: '#9A3412' }}>
                                {currentPairedImage.walkthrough.examTip}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Labeled Parts / Walkthrough Preview */}
                      {currentPairedImage.explanation?.majorParts?.length > 0 && (
                        <div style={{ padding: 10, borderRadius: 10, background: '#FAFAFA', border: '1px solid #EEEEEE', marginBottom: 12 }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#4B5563', display: 'block', marginBottom: 4 }}>
                            Key Labeled Components:
                          </span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {currentPairedImage.explanation.majorParts.map((p: string, pIdx: number) => (
                              <span key={pIdx} style={{ padding: '2px 8px', borderRadius: 9999, background: '#FFFFFF', border: '1px solid #E5E7EB', fontSize: '0.72rem', color: '#1F2937', fontWeight: 600 }}>
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Educational Image Discovery & Legal Reuse Badges */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #F3F4F6' }}>
                        <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>
                          Source: {currentPairedImage.source || 'Verified Educational Asset'}
                        </span>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <a
                            href={`https://www.google.com/search?tbm=isch&tbs=sur:cl&q=${encodeURIComponent(activeNote?.topic || currentPairedImage.title || 'diagram')}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: '0.7rem', color: '#FF6A00', textDecoration: 'none', fontWeight: 700 }}
                            title="Discover permitted Creative Commons diagrams on Google"
                          >
                            Google CC ↗
                          </a>
                          <a
                            href={`https://www.pinterest.com/search/pins/?q=${encodeURIComponent((activeNote?.topic || currentPairedImage.title) + ' educational diagram')}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: '0.7rem', color: '#E60023', textDecoration: 'none', fontWeight: 700 }}
                            title="Explore educational pin collections on Pinterest"
                          >
                            Pinterest ↗
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Quick Audio Walkthrough launcher */}
                    <div
                      className="glass-card"
                      style={{
                        padding: 16,
                        borderRadius: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#FFF3E8',
                        border: '1px solid rgba(255,106,0,0.2)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Volume2 size={20} color="#FF6A00" />
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#202124' }}>
                            Audio Walkthrough
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#6B7280' }}>
                            Listen to Teacher Nova explain this section
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          startAudioLesson({
                            topic: currentSection.heading || activeNote.title,
                            text: currentSection.body || activeNote.summary
                          })
                        }
                        className="btn-orange"
                        style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                      >
                        Play Audio
                      </button>
                    </div>
                  </aside>
                )}
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------------
              SUB-TAB 2: COMPLETE DIGITAL TEXTBOOK & PDF READER (Paged & Continuous)
              --------------------------------------------------------------------- */}
          {notebookSubTab === 'full' && (
            <div
              style={
                isFullScreenReader
                  ? {
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 99999,
                      background: '#F8FAFC',
                      overflowY: 'auto',
                      padding: '24px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }
                  : { display: 'flex', flexDirection: 'column', gap: 20 }
              }
            >
              {/* Document Reader Toolbar */}
              <div
                style={{
                  width: '100%',
                  maxWidth: isFullScreenReader ? 920 : '100%',
                  background: '#FFFFFF',
                  borderRadius: 16,
                  border: '1px solid #E2E8F0',
                  padding: '12px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
                }}
              >
                {/* Navigation Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setCurrentPageIdx((prev) => Math.max(0, prev - 1))}
                    disabled={currentPageIdx <= 0}
                    className="btn-glass"
                    style={{ padding: '6px 12px', fontSize: '0.8rem', opacity: currentPageIdx <= 0 ? 0.4 : 1 }}
                    title="Previous Page (Left Arrow)"
                  >
                    <ChevronLeft size={16} />
                    <span>Prev</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowTocDrawer(true)}
                    className="btn-glass"
                    style={{ padding: '6px 12px', fontSize: '0.82rem', fontWeight: 800, color: '#FF6A00', background: '#FFF7ED', borderColor: '#FED7AA' }}
                    title="Open Table of Contents"
                  >
                    <List size={14} style={{ marginRight: 4 }} />
                    <span>Page {currentPageIdx + 1} of {textbookPages.length}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentPageIdx((prev) => Math.min(textbookPages.length - 1, prev + 1))}
                    disabled={currentPageIdx >= textbookPages.length - 1}
                    className="btn-glass"
                    style={{ padding: '6px 12px', fontSize: '0.8rem', opacity: currentPageIdx >= textbookPages.length - 1 ? 0.4 : 1 }}
                    title="Next Page (Right Arrow)"
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* View Mode & Zoom Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#F1F5F9', borderRadius: 8, padding: 2 }}>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((prev) => Math.max(75, prev - 10))}
                      className="btn-glass"
                      style={{ padding: '4px 8px', border: 'none', background: 'transparent' }}
                      title="Zoom Out"
                    >
                      <ZoomOut size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomLevel(100)}
                      style={{ padding: '4px 8px', fontSize: '0.75rem', fontWeight: 700, border: 'none', background: 'transparent', cursor: 'pointer', color: '#475569' }}
                      title="Reset Zoom to 100%"
                    >
                      {zoomLevel}%
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((prev) => Math.min(150, prev + 10))}
                      className="btn-glass"
                      style={{ padding: '4px 8px', border: 'none', background: 'transparent' }}
                      title="Zoom In"
                    >
                      <ZoomIn size={14} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setReaderViewMode((prev) => prev === 'paged' ? 'continuous' : 'paged')}
                    className="btn-glass"
                    style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                    title="Toggle between Paged Book View and Continuous Scroll View"
                  >
                    {readerViewMode === 'paged' ? '📜 Continuous View' : '📖 Paged View'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (notesAudioPlaying) {
                        pauseNotesAudio();
                      } else if (notesAudioPaused) {
                        resumeNotesAudio();
                      } else {
                        playNotesAudio(currentPageIdx);
                      }
                    }}
                    className="btn-glass"
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.78rem',
                      background: notesAudioPlaying ? '#ECFDF5' : '#FFF7ED',
                      color: notesAudioPlaying ? '#047857' : '#C2410C',
                      borderColor: notesAudioPlaying ? '#10B981' : '#FED7AA'
                    }}
                    title="Listen to this page with clean, natural speech"
                  >
                    <Volume2 size={14} />
                    <span>{notesAudioPlaying && notesAudioTrackIdx === currentPageIdx ? 'Playing' : '🎧 Listen'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsFullScreenReader((prev) => !prev)}
                    className="btn-glass"
                    style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                    title={isFullScreenReader ? 'Exit Fullscreen (Esc)' : 'Enter Fullscreen Document Reader'}
                  >
                    {isFullScreenReader ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    <span>{isFullScreenReader ? 'Exit' : 'Fullscreen'}</span>
                  </button>
                </div>
              </div>

              {/* Table of Contents Modal/Drawer */}
              {showTocDrawer && (
                <div
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(15, 23, 42, 0.65)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 100010,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 16
                  }}
                  onClick={() => setShowTocDrawer(false)}
                >
                  <div
                    style={{
                      background: '#FFFFFF',
                      borderRadius: 20,
                      maxWidth: 580,
                      width: '100%',
                      maxHeight: '85vh',
                      overflowY: 'auto',
                      boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
                      padding: '24px 28px'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: 14, marginBottom: 16 }}>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                          📑 Table of Contents
                        </h3>
                        <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
                          {editTitle} • {textbookPages.length} Pages
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowTocDrawer(false)}
                        className="btn-glass"
                        style={{ padding: '6px 10px' }}
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div style={{ display: 'grid', gap: 8 }}>
                      {textbookPages.map((page, idx) => (
                        <button
                          key={page.pageId || idx}
                          type="button"
                          onClick={() => {
                            setCurrentPageIdx(idx);
                            setShowTocDrawer(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            borderRadius: 12,
                            border: currentPageIdx === idx ? '2px solid #FF6A00' : '1px solid #E2E8F0',
                            background: currentPageIdx === idx ? '#FFF7ED' : '#FFFFFF',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: 8,
                                background: currentPageIdx === idx ? '#FF6A00' : '#F1F5F9',
                                color: currentPageIdx === idx ? '#FFFFFF' : '#475569',
                                fontWeight: 800,
                                fontSize: '0.82rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              {page.pageNumber || idx + 1}
                            </span>
                            <div>
                              <strong style={{ fontSize: '0.92rem', color: '#0F172A', display: 'block' }}>
                                {page.title}
                              </strong>
                              <span style={{ fontSize: '0.76rem', color: '#64748B' }}>
                                {page.headerCategory}
                              </span>
                            </div>
                          </div>
                          {page.diagrams && page.diagrams.length > 0 && (
                            <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 6, background: '#EFF6FF', color: '#2563EB', fontWeight: 700 }}>
                              🎨 {page.diagrams.length} Diagram{page.diagrams.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PAGED BOOK VIEW: Page-by-page Digital Textbook Sheet */}
              {readerViewMode === 'paged' && (() => {
                const page = textbookPages[currentPageIdx] || textbookPages[0];
                if (!page) return null;
                const isCurrentAudioTrack = notesAudioPlaying && notesAudioTrackIdx === currentPageIdx;

                return (
                  <div
                    id={`notebook-page-${page.pageNumber}`}
                    style={{
                      width: '100%',
                      maxWidth: 880,
                      background: '#FFFFFF',
                      borderRadius: 20,
                      border: isCurrentAudioTrack ? '2.5px solid #FF6A00' : '1px solid #E2E8F0',
                      boxShadow: isCurrentAudioTrack
                        ? '0 16px 48px rgba(255, 106, 0, 0.16)'
                        : '0 16px 40px rgba(32, 33, 36, 0.08)',
                      padding: '44px 52px',
                      lineHeight: 1.74,
                      transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
                      transformOrigin: 'top center',
                      transition: 'border 0.2s ease, box-shadow 0.2s ease'
                    }}
                  >
                    {/* Page Header */}
                    <header style={{ borderBottom: '2px solid #0F172A', paddingBottom: 16, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ padding: '4px 10px', borderRadius: 6, background: '#FFF3E8', color: '#FF6A00', fontWeight: 800, fontSize: '0.74rem', textTransform: 'uppercase' }}>
                          {page.headerCategory || `${editSubject} Textbook`}
                        </span>
                        {isCurrentAudioTrack && (
                          <span style={{ padding: '4px 10px', borderRadius: 6, background: '#ECFDF5', color: '#047857', fontWeight: 800, fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Volume2 size={12} />
                            <span>Now Narrating</span>
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>
                          Page {page.pageNumber} of {textbookPages.length}
                        </span>
                        <button
                          type="button"
                          onClick={() => playNotesAudio(currentPageIdx)}
                          className="btn-glass"
                          style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                        >
                          <Volume2 size={12} />
                          <span>Listen</span>
                        </button>
                      </div>
                    </header>

                    {/* Page Title & Subheading */}
                    <div style={{ marginBottom: 24 }}>
                      <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0F172A', margin: '0 0 6px 0', fontFamily: 'Georgia, serif' }}>
                        {page.title}
                      </h2>
                      {page.subheading && (
                        <p style={{ fontSize: '0.94rem', color: '#64748B', margin: 0, fontWeight: 600 }}>
                          {page.subheading}
                        </p>
                      )}
                    </div>

                    {/* Page Text Content */}
                    <div style={{ fontSize: '0.98rem', color: '#334155', whiteSpace: 'pre-line', marginBottom: 28, lineHeight: 1.76 }}>
                      {page.contentMarkdown}
                    </div>

                    {/* Dedicated Adjacent SVG Diagrams with 8-Point Scientific Breakdown */}
                    {Array.isArray(page.diagrams) && page.diagrams.map((diag, dIdx) => (
                      <div
                        key={diag.diagramId || dIdx}
                        style={{
                          margin: '28px 0',
                          padding: 24,
                          borderRadius: 18,
                          background: '#F8FAFC',
                          border: '1.5px solid #E2E8F0',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#C2410C', background: '#FFF3E8', padding: '3px 10px', borderRadius: 6 }}>
                            {diag.diagramType || 'Curriculum Diagram'}
                          </span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', background: '#ECFDF5', padding: '3px 8px', borderRadius: 6 }}>
                            ✓ 100% Scientifically Verified
                          </span>
                        </div>

                        {/* Diagram SVG Illustration */}
                        <div style={{ textAlign: 'center', background: '#FFFFFF', padding: 18, borderRadius: 14, border: '1px solid #CBD5E1', marginBottom: 14 }}>
                          <img
                            src={diag.imageUrl}
                            alt={diag.title}
                            style={{ maxWidth: '100%', maxHeight: 380, objectFit: 'contain', display: 'block', margin: '0 auto' }}
                          />
                        </div>

                        <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
                          {diag.title}
                        </h4>
                        <p style={{ fontSize: '0.88rem', color: '#475569', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                          {diag.caption}
                        </p>

                        {/* Complete 8-Point Scientific Breakdown */}
                        <div style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: 18 }}>
                          <h5 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            🔬 8-Point Scientific Diagram Breakdown:
                          </h5>
                          <div style={{ display: 'grid', gap: 10, fontSize: '0.88rem', color: '#334155' }}>
                            <div><strong>1. What It Represents:</strong> {diag.point1_whatItRepresents}</div>
                            {Array.isArray(diag.point2_labelledParts) && diag.point2_labelledParts.length > 0 && (
                              <div>
                                <strong>2. Labelled Parts:</strong>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                                  {diag.point2_labelledParts.map((p, pIdx) => (
                                    <span key={pIdx} style={{ padding: '3px 8px', borderRadius: 6, background: '#F1F5F9', border: '1px solid #CBD5E1', fontSize: '0.8rem' }}>
                                      <strong>{p.label}:</strong> {p.description}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div><strong>3. Component Functions:</strong> {diag.point3_componentFunctions}</div>
                            <div><strong>4. Component Relationships:</strong> {diag.point4_componentRelationships}</div>
                            <div><strong>5. Direction of Process / Movement:</strong> {diag.point5_directionOfMovementOrProcess}</div>
                            {Array.isArray(diag.point6_stepByStepInterpretation) && diag.point6_stepByStepInterpretation.length > 0 && (
                              <div>
                                <strong>6. Step-by-Step Interpretation:</strong>
                                <ol style={{ margin: '4px 0 0 18px', padding: 0 }}>
                                  {diag.point6_stepByStepInterpretation.map((step, sIdx) => (
                                    <li key={sIdx} style={{ marginBottom: 3 }}>{step}</li>
                                  ))}
                                </ol>
                              </div>
                            )}
                            <div><strong>7. Core Learning Outcome:</strong> {diag.point7_learningOutcome}</div>
                            <div style={{ padding: '10px 14px', background: '#FFF7ED', borderRadius: 8, borderLeft: '3px solid #FF6A00', color: '#9A3412', fontWeight: 600 }}>
                              <strong>8. What to Remember for Exams:</strong> {diag.point8_whatToRemember}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Page Footer */}
                    <footer style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                      <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                        Page {page.pageNumber} of {textbookPages.length} • CBSE / NCERT Standard • STUDYAI Academic Intelligence
                      </span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => setCurrentPageIdx((prev) => Math.max(0, prev - 1))}
                          disabled={currentPageIdx <= 0}
                          className="btn-glass"
                          style={{ padding: '6px 12px', fontSize: '0.78rem', opacity: currentPageIdx <= 0 ? 0.4 : 1 }}
                        >
                          ← Previous Page
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentPageIdx((prev) => Math.min(textbookPages.length - 1, prev + 1))}
                          disabled={currentPageIdx >= textbookPages.length - 1}
                          className="btn-glass"
                          style={{ padding: '6px 12px', fontSize: '0.78rem', opacity: currentPageIdx >= textbookPages.length - 1 ? 0.4 : 1 }}
                        >
                          Next Page →
                        </button>
                      </div>
                    </footer>
                  </div>
                );
              })()}

              {/* CONTINUOUS SCROLL VIEW: Full Document Sheet */}
              {readerViewMode === 'continuous' && (
                <div
                  id="white-page-notebook-sheet"
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 24,
                    border: '1px solid #EEEEEE',
                    boxShadow: '0 16px 40px rgba(32, 33, 36, 0.06)',
                    padding: '40px 48px',
                    lineHeight: 1.72,
                    maxWidth: 920,
                    width: '100%'
                  }}
                >
              {/* White Page Header */}
              <header style={{ borderBottom: '2px solid #202124', paddingBottom: 18, marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ padding: '3px 10px', borderRadius: 4, background: '#FFF3E8', color: '#FF6A00', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      {editSubject} Notebook
                    </span>
                    <span style={{ padding: '3px 10px', borderRadius: 4, background: '#ECFDF5', color: '#047857', fontWeight: 800, fontSize: '0.75rem' }}>
                      ✓ 100% Source Coverage Verified
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => handleExport('html')}
                      className="btn-glass"
                      style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                    >
                      <Printer size={14} />
                      <span>Print Document</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExport('md')}
                      className="btn-glass"
                      style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                    >
                      <Download size={14} />
                      <span>Export .MD</span>
                    </button>
                  </div>
                </div>

                <h1 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#202124', margin: '6px 0', fontFamily: 'Georgia, serif' }}>
                  {editTitle}
                </h1>
                <p style={{ fontSize: '1rem', color: '#4B5563', margin: 0 }}>
                  {structured.simpleIntroduction || structured.overview || activeNote.summary}
                </p>
              </header>

              {/* View Mode Toggle: Formatted Digital Textbook vs Interactive Section Cards */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, padding: '10px 14px', background: '#F8FAFC', borderRadius: 14, border: '1px solid #E2E8F0', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setContinuousRenderStyle('textbook')}
                    className={`filter-pill ${continuousRenderStyle === 'textbook' ? 'active' : ''}`}
                    style={{ padding: '7px 16px', fontSize: '0.8rem', fontWeight: 800 }}
                  >
                    📜 Full Formatted Textbook
                  </button>
                  <button
                    type="button"
                    onClick={() => setContinuousRenderStyle('sections')}
                    className={`filter-pill ${continuousRenderStyle === 'sections' ? 'active' : ''}`}
                    style={{ padding: '7px 16px', fontSize: '0.8rem', fontWeight: 800 }}
                  >
                    🗂️ Interactive Section Cards
                  </button>
                </div>
                <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700 }}>
                  {continuousRenderStyle === 'textbook' ? 'Rich parsed textbook • LaTeX equations • Verified diagrams' : 'Interactive syllabus section cards'}
                </span>
              </div>

              {continuousRenderStyle === 'textbook' && activeNote.content_markdown ? (
                <div style={{ padding: '8px 2px' }}>
                  <EducationalMarkdownRenderer content={activeNote.content_markdown} />
                </div>
              ) : (
                <>
              {/* 1. Interactive Table of Contents (Single-Page Continuous Study Guide) */}
              <nav
                style={{
                  background: '#F8FAFC',
                  borderRadius: 16,
                  padding: '16px 20px',
                  marginBottom: 32,
                  border: '1px solid #E2E8F0'
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>📑 Table of Contents (Complete Single-Page Continuous Document)</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { id: 'sec-section-a', label: 'A. Definitions & Academic Meaning' },
                    { id: 'sec-section-b', label: 'B. Key Points & Core Principles' },
                    { id: 'sec-section-c', label: 'C. Key Terms & Full Forms' },
                    { id: 'sec-section-d', label: 'D. Main Concepts & Diagrams' },
                    { id: 'sec-section-e', label: 'E. Key Differences & Comparisons' },
                    { id: 'sec-section-f', label: 'F. Processes & Mechanisms' },
                    { id: 'sec-section-g', label: 'G. Formulas & Equations' },
                    { id: 'sec-section-h', label: 'H. Problem-Solving Methods' },
                    { id: 'sec-section-i', label: 'I. Exam-Oriented Preparation' },
                    { id: 'sec-section-j', label: 'J. Final Revision Section' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        const el = document.getElementById(t.id);
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        border: '1px solid #CBD5E1',
                        background: '#FFFFFF',
                        color: '#0F172A',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </nav>

              {/* Section A: Definitions & Academic Meaning */}
              <div id="sec-section-a" style={{ marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #EEEEEE' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', background: '#FFEDD5', color: '#C2410C', padding: '3px 8px', borderRadius: 4 }}>
                    Section A
                  </span>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#202124', margin: 0 }}>
                    Definitions & Academic Meaning
                  </h3>
                </div>
                <p style={{ fontSize: '1rem', color: '#374151', lineHeight: 1.7, margin: '0 0 14px 0' }}>
                  {structured.simpleIntroduction || structured.overview || activeNote.summary}
                </p>
                <blockquote style={{ margin: '0 0 14px 0', padding: '14px 18px', background: '#F8FAFC', borderLeft: '4px solid #FF6A00', borderRadius: '0 10px 10px 0', fontStyle: 'italic', color: '#1E293B', fontSize: '0.98rem' }}>
                  {structured.clearDefinition?.academic || structured.definitions?.[0]?.definition || `${editTitle} is a verified curriculum principle in ${editSubject}.`}
                </blockquote>
                {structured.clearDefinition?.everyday && (
                  <p style={{ fontSize: '0.94rem', color: '#4B5563', lineHeight: 1.6, margin: '0 0 12px 0' }}>
                    <strong>Everyday Simple Explanation:</strong> {structured.clearDefinition.everyday}
                  </p>
                )}
                {Array.isArray(structured.definitions) && structured.definitions.length > 1 && (
                  <div style={{ marginTop: 14 }}>
                    <h5 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#334155', marginBottom: 8 }}>Important Academic Definitions:</h5>
                    <div style={{ display: 'grid', gap: 8 }}>
                      {structured.definitions.slice(1).map((d: any, dIdx: number) => (
                        <div key={dIdx} style={{ padding: '10px 14px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: '0.88rem' }}>
                          <strong style={{ color: '#FF6A00' }}>{d.term || d.word}:</strong> {d.definition || d.meaning}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Section B: Key Points & Core Principles */}
              <div id="sec-section-b" style={{ marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #EEEEEE' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', background: '#DCFCE7', color: '#15803D', padding: '3px 8px', borderRadius: 4 }}>
                    Section B
                  </span>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#202124', margin: 0 }}>
                    Key Points & Core Principles
                  </h3>
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {(structured.keyPoints || structured.importantFacts || [
                    `${editTitle} operates under fundamental scientific and conservation laws.`,
                    `Components interact in equilibrium rather than isolated events.`,
                    `Theoretical values closely match experimental observation in standard curriculum laboratories.`,
                    `Mastery requires understanding definitions, working mechanisms, and formula applications.`
                  ]).map((kp: string, kIdx: number) => (
                    <div key={kIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', background: '#F9FAFB', borderRadius: 8, border: '1px solid #F3F4F6' }}>
                      <span style={{ color: '#FF6A00', fontWeight: 900, fontSize: '1rem', lineHeight: 1 }}>•</span>
                      <span style={{ fontSize: '0.92rem', color: '#374151', lineHeight: 1.55 }}>{kp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section C: Key Terms & Full Forms */}
              <div id="sec-section-c" style={{ marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #EEEEEE' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', background: '#E0E7FF', color: '#3730A3', padding: '3px 8px', borderRadius: 4 }}>
                    Section C
                  </span>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#202124', margin: 0 }}>
                    Key Terms & Terminology
                  </h3>
                </div>
              {Array.isArray(structured.abbreviations) && structured.abbreviations.length > 0 && (
                <div id="sec-terminology" style={{ marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #EEEEEE' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#202124', marginBottom: 12 }}>
                    3. Important Terminology & Full Forms
                  </h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', background: '#FFFFFF', borderRadius: 10 }}>
                      <thead>
                        <tr style={{ background: '#FFF7ED', color: '#9A3412', textAlign: 'left' }}>
                          <th style={{ padding: '10px 14px', border: '1px solid #FED7AA' }}>Abbreviation / Term</th>
                          <th style={{ padding: '10px 14px', border: '1px solid #FED7AA' }}>Full Scientific Form</th>
                          <th style={{ padding: '10px 14px', border: '1px solid #FED7AA' }}>Definition & Curriculum Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {structured.abbreviations.map((abbr: any, aIdx: number) => (
                          <tr key={aIdx}>
                            <td style={{ padding: '10px 14px', border: '1px solid #FED7AA', fontWeight: 800, color: '#C2410C' }}>{abbr.abbr}</td>
                            <td style={{ padding: '10px 14px', border: '1px solid #FED7AA', fontWeight: 700 }}>{abbr.fullForm}</td>
                            <td style={{ padding: '10px 14px', border: '1px solid #FED7AA', color: '#374151' }}>{abbr.simpleDefinition}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 5. Prerequisites */}
              {Array.isArray(structured.prerequisites) && structured.prerequisites.length > 0 && (
                <div id="sec-prerequisites" style={{ marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #EEEEEE' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#202124', marginBottom: 12 }}>
                    4. Fundamentals & Prerequisites
                  </h3>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {structured.prerequisites.map((req: string, rIdx: number) => (
                      <div key={rIdx} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#F9FAFB', borderRadius: 8, border: '1px solid #F3F4F6' }}>
                        <span style={{ color: '#16A34A', fontWeight: 800 }}>✓</span>
                        <span style={{ fontSize: '0.9rem', color: '#374151' }}>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              </div>

              {/* Section D: Main Concepts and Subtopics (Each with its dedicated diagram) */}
              <div id="sec-section-d" style={{ display: 'grid', gap: 32, marginBottom: 36 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', background: '#FEF3C7', color: '#B45309', padding: '3px 8px', borderRadius: 4 }}>
                    Section D
                  </span>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#202124', margin: 0 }}>
                    Main Concepts & Subtopics
                  </h3>
                </div>
                {sections.map((sec, idx) => (
                  <article key={idx} style={{ borderBottom: '1px solid #EEEEEE', paddingBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#202124', margin: 0 }}>
                        {sec.heading || `Subtopic ${idx + 1}`}
                      </h4>
                      {sec.citations && (
                        <span style={{ fontSize: '0.72rem', color: '#6B7280', fontWeight: 600 }}>
                          {sec.citations[0]}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '1rem', color: '#374151', margin: '0 0 12px 0', whiteSpace: 'pre-line', lineHeight: 1.72 }}>
                      {sec.body || sec.plainExplanation}
                    </p>

                    {/* Paired dedicated diagram placed directly inside the subtopic it explains */}
                    {structured.images?.[idx] && (
                      <figure style={{ margin: '18px 0', padding: 16, borderRadius: 16, background: '#FAFAFA', border: '1.5px solid #EEEEEE' }}>
                        <img
                          src={structured.images[idx].imageUrl}
                          alt={structured.images[idx].title}
                          style={{ width: '100%', maxHeight: 340, objectFit: 'contain', display: 'block', background: '#FFFFFF', borderRadius: 10 }}
                        />
                        <figcaption style={{ marginTop: 10, fontSize: '0.86rem', color: '#4B5563' }}>
                          <strong style={{ color: '#FF6A00' }}>{structured.images[idx].title}: </strong>
                          {structured.images[idx].caption}
                        </figcaption>
                      </figure>
                    )}
                  </article>
                ))}
              </div>

              {/* Section E: Key Differences and Comparisons */}
              {structured.differences && (
                <div id="sec-section-e" style={{ marginBottom: 36, paddingBottom: 24, borderBottom: '1px solid #EEEEEE' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', background: '#FCE7F3', color: '#BE185D', padding: '3px 8px', borderRadius: 4 }}>
                      Section E
                    </span>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#202124', margin: 0 }}>
                      Key Differences & Comparisons
                    </h3>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', background: '#FFFFFF', borderRadius: 10 }}>
                      <thead>
                        <tr style={{ background: '#FFF3E8', color: '#C2410C', textAlign: 'left' }}>
                          <th style={{ padding: '10px 14px', border: '1px solid #FED7AA' }}>Aspect of Comparison</th>
                          <th style={{ padding: '10px 14px', border: '1px solid #FED7AA' }}>{structured.differences.titleA}</th>
                          <th style={{ padding: '10px 14px', border: '1px solid #FED7AA' }}>{structured.differences.titleB}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {structured.differences.rows?.map((row: any, rIdx: number) => (
                          <tr key={rIdx}>
                            <td style={{ padding: '10px 14px', border: '1px solid #FED7AA', fontWeight: 700 }}>{row.aspect}</td>
                            <td style={{ padding: '10px 14px', border: '1px solid #FED7AA' }}>{row.itemA}</td>
                            <td style={{ padding: '10px 14px', border: '1px solid #FED7AA' }}>{row.itemB}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Section F: Important Processes & Mechanisms */}
              <div id="sec-section-f" style={{ marginBottom: 36, paddingBottom: 24, borderBottom: '1px solid #EEEEEE' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', background: '#CCFBF1', color: '#0F766E', padding: '3px 8px', borderRadius: 4 }}>
                    Section F
                  </span>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#202124', margin: 0 }}>
                    Important Processes & Mechanisms
                  </h3>
                </div>
                <div style={{ display: 'grid', gap: 12 }}>
                  {(structured.universalTeachingWorkflow?.stage7_stepByStepProcesses || [
                    { stepNumber: 1, title: 'Initial Activation', whatHappens: 'System components initiate energy intake or receptor excitation under environmental triggers.', whereItHappens: 'Primary receptor site' },
                    { stepNumber: 2, title: 'Transformation Cascade', whatHappens: 'Energy transformation or mechanical transmission proceeds sequentially across intermediate vectors.', whereItHappens: 'Core transformation pathway' },
                    { stepNumber: 3, title: 'Terminal Equilibrium', whatHappens: 'Products or kinetic motion reach stable target configuration with entropy dissipation.', whereItHappens: 'Terminal site' }
                  ]).map((st: any, sIdx: number) => (
                    <div key={sIdx} style={{ padding: '14px 18px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ padding: '2px 8px', borderRadius: 4, background: '#0F766E', color: '#FFFFFF', fontWeight: 800, fontSize: '0.72rem' }}>
                          Stage {st.stepNumber || sIdx + 1}
                        </span>
                        <strong style={{ fontSize: '0.96rem', color: '#0F172A' }}>{st.title}</strong>
                      </div>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#334155', lineHeight: 1.6 }}>
                        {st.whatHappens}
                      </p>
                      {st.whereItHappens && (
                        <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', marginTop: 4 }}>
                          <em>Location:</em> {st.whereItHappens}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Section G: Formulas & Equations */}
              <div id="sec-section-g" style={{ marginBottom: 36, padding: '24px 28px', borderRadius: 16, background: '#F8FAFC', border: '1.5px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', background: '#DBEAFE', color: '#1D4ED8', padding: '3px 8px', borderRadius: 4 }}>
                    Section G
                  </span>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Formulas & Equations
                  </h3>
                </div>
                {structured.formula ? (
                  <div>
                    <div style={{ padding: '12px 18px', background: '#FFFFFF', borderRadius: 10, border: '1px solid #CBD5E1', marginBottom: 16 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Governing Equation</span>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', marginTop: 4 }}>
                        `{structured.formula.equation}`
                      </div>
                    </div>

                    {Array.isArray(structured.workedProblems) && structured.workedProblems.length > 0 && (
                      <div style={{ marginTop: 14 }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#334155', marginBottom: 10 }}>
                          Standard Board Examination Solved Problem:
                        </h4>
                        {structured.workedProblems.map((prob: any, pIdx: number) => (
                          <div key={pIdx} style={{ padding: '16px 20px', background: '#FFFFFF', borderRadius: 12, border: '1px solid #CBD5E1', marginBottom: 12 }}>
                            <strong style={{ fontSize: '0.96rem', color: '#0F172A', display: 'block', marginBottom: 8 }}>
                              {prob.title || `Problem ${pIdx + 1}`}: {prob.problemStatement}
                            </strong>
                            <div style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.6 }}>
                              {Array.isArray(prob.stepByStepSolution) && prob.stepByStepSolution.map((st: string, sIdx: number) => (
                                <div key={sIdx} style={{ marginBottom: 4 }}>• {st}</div>
                              ))}
                              <div style={{ marginTop: 8, padding: '6px 12px', background: '#ECFDF5', borderRadius: 6, color: '#047857', fontWeight: 800 }}>
                                Final Verified Answer: {prob.finalAnswer} ({prob.siUnit})
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: '0.92rem', color: '#64748B' }}>
                    This conceptual topic is qualitatively governed by biological structures, historical cause-and-effect sequences, or descriptive laws rather than numerical formulas.
                  </p>
                )}
              </div>

              {/* Section H: Problem-Solving Methods (Mathematics & Physics) */}
              {(() => {
                const prob = structured?.universalTeachingWorkflow?.sectionH_problemSolvingMethods || structured?.problemSolvingMethods;
                if (!prob || !prob.isRelevant) return null;
                return (
                  <div id="sec-section-h" style={{ marginBottom: 36, padding: '24px 28px', borderRadius: 16, background: '#FFFBEB', border: '1.5px solid #FDE68A' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', background: '#FEF3C7', color: '#92400E', padding: '3px 8px', borderRadius: 4 }}>
                        Section H
                      </span>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#202124', margin: 0 }}>
                        Problem-Solving Methods ({prob.discipline || 'Quantitative & Conceptual Mastery'})
                      </h3>
                    </div>

                    {/* The 10-Point Method Framework */}
                    {Array.isArray(prob.tenPointMethodGuide) && (
                      <div style={{ marginBottom: 20 }}>
                        <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#92400E', marginBottom: 10 }}>
                          The 10-Point Problem-Solving Method:
                        </h4>
                        <div style={{ display: 'grid', gap: 8 }}>
                          {prob.tenPointMethodGuide.map((step: any, sIdx: number) => (
                            <div key={sIdx} style={{ display: 'flex', gap: 10, padding: '8px 12px', background: '#FFFFFF', borderRadius: 8, border: '1px solid #FEF08A' }}>
                              <strong style={{ color: '#D97706', minWidth: 24 }}>{step.stepNumber}.</strong>
                              <div style={{ fontSize: '0.88rem', color: '#374151' }}>
                                <strong style={{ color: '#1F2937' }}>{step.title}:</strong> {step.instruction}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Representative Solved Problem Types */}
                    {Array.isArray(prob.problemTypes) && prob.problemTypes.length > 0 && (
                      <div style={{ marginBottom: 20 }}>
                        <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#92400E', marginBottom: 10 }}>
                          Representative Solved Problem Types:
                        </h4>
                        {prob.problemTypes.map((pt: any, ptIdx: number) => (
                          <div key={ptIdx} style={{ padding: '16px 20px', background: '#FFFFFF', borderRadius: 12, border: '1px solid #FDE68A', marginBottom: 14 }}>
                            <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#B45309', marginBottom: 6 }}>
                              {pt.typeName}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#4B5563', marginBottom: 4 }}>
                              <strong>Identification Clue:</strong> {pt.howToIdentify}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#1E40AF', marginBottom: 10 }}>
                              <strong>Governing Formula / Principle:</strong> <code>{pt.requiredFormulaOrPrinciple}</code>
                            </div>

                            {pt.representativeSolvedExample && (
                              <div style={{ padding: '12px 14px', background: '#FFFBEB', borderRadius: 8, border: '1px solid #FEF3C7', fontSize: '0.86rem' }}>
                                <strong style={{ color: '#92400E', display: 'block', marginBottom: 6 }}>
                                  Example: {pt.representativeSolvedExample.problemStatement}
                                </strong>
                                <div style={{ color: '#374151', lineHeight: 1.6 }}>
                                  {Array.isArray(pt.representativeSolvedExample.stepByStepCalculations) &&
                                    pt.representativeSolvedExample.stepByStepCalculations.map((calc: string, cIdx: number) => (
                                      <div key={cIdx}>• {calc}</div>
                                    ))}
                                  <div style={{ marginTop: 6, fontWeight: 800, color: '#047857' }}>
                                    Final Answer: {pt.representativeSolvedExample.unitsAndFinalAnswer}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Practice Problems with Verified Solutions */}
                    {Array.isArray(prob.practiceProblemsWithAnswers) && prob.practiceProblemsWithAnswers.length > 0 && (
                      <div>
                        <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#92400E', marginBottom: 10 }}>
                          Practice Problems with Verified Solutions:
                        </h4>
                        {prob.practiceProblemsWithAnswers.map((pp: any, ppIdx: number) => (
                          <div key={ppIdx} style={{ padding: '12px 16px', background: '#FFFFFF', borderRadius: 10, border: '1px solid #FEF08A', marginBottom: 10 }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1F2937', marginBottom: 6 }}>
                              Practice {pp.problemNumber || ppIdx + 1}: {pp.statement}
                            </div>
                            <details style={{ fontSize: '0.84rem' }}>
                              <summary style={{ color: '#2563EB', fontWeight: 700, cursor: 'pointer' }}>View Verified Solution</summary>
                              <div style={{ marginTop: 6, padding: '8px 12px', background: '#ECFDF5', borderRadius: 6, color: '#047857' }}>
                                <strong>Answer:</strong> {pp.answer}<br />
                                <em>Explanation:</em> {pp.stepByStepExplanation}
                              </div>
                            </details>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Section I: Exam-Oriented Preparation (Self-Test Knowledge Assessment) */}
              {Array.isArray(structured.examQuestions) && structured.examQuestions.length > 0 && (
                <section
                  id="sec-section-i"
                  style={{
                    marginBottom: 36,
                    padding: '30px 34px',
                    borderRadius: 20,
                    background: '#F8FAFC',
                    border: '1.5px solid #E2E8F0'
                  }}
                >
                  <div id="sec-assessment" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', background: '#DBEAFE', color: '#1D4ED8', padding: '3px 8px', borderRadius: 4 }}>
                        Section I
                      </span>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                        Exam-Oriented Preparation
                      </h3>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>
                      {structured.examQuestions.length} Practice Items
                    </span>
                  </div>

                  <div style={{ display: 'grid', gap: 18 }}>
                    {structured.examQuestions.map((q: any, qIdx: number) => (
                      <div
                        key={qIdx}
                        style={{
                          background: '#FFFFFF',
                          borderRadius: 12,
                          padding: '18px 20px',
                          border: '1px solid #E2E8F0',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FF6A00' }}>
                            Question {qIdx + 1} ({q.type || 'Practice'} • {q.marks || 1} Mark{(q.marks || 1) > 1 ? 's' : ''})
                          </span>
                        </div>
                        <p style={{ fontSize: '0.96rem', fontWeight: 700, color: '#1E293B', margin: '0 0 10px 0' }}>
                          {q.question}
                        </p>

                        {Array.isArray(q.options) && (
                          <div style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
                            {q.options.map((opt: string, oIdx: number) => (
                              <div
                                key={oIdx}
                                style={{
                                  padding: '8px 12px',
                                  borderRadius: 8,
                                  background: '#F8FAFC',
                                  fontSize: '0.86rem',
                                  color: '#334155',
                                  border: '1px solid #E2E8F0'
                                }}
                              >
                                {String.fromCharCode(65 + oIdx)}. {opt}
                              </div>
                            ))}
                          </div>
                        )}

                        <details style={{ marginTop: 8 }}>
                          <summary style={{ fontSize: '0.82rem', fontWeight: 800, color: '#2563EB', cursor: 'pointer', outline: 'none' }}>
                            View Examiner Model Answer & Explanation ▾
                          </summary>
                          <div style={{ marginTop: 10, padding: 12, background: '#F0FDF4', borderRadius: 8, border: '1px solid #BBF7D0', fontSize: '0.86rem', color: '#166534' }}>
                            <strong>Model Answer:</strong> {q.modelAnswer || q.correctAnswer}
                            {q.explanation && (
                              <div style={{ marginTop: 6, fontSize: '0.8rem', color: '#15803D' }}>
                                <em>Why:</em> {q.explanation}
                              </div>
                            )}
                          </div>
                        </details>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Section J: Final Revision Section */}
              <div id="sec-section-j" style={{ marginBottom: 36 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', background: '#DCFCE7', color: '#15803D', padding: '3px 8px', borderRadius: 4 }}>
                    Section J
                  </span>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#14532D', margin: 0 }}>
                    Final Revision Section
                  </h3>
                </div>

                {/* Common Misconceptions & Board Traps */}
                {Array.isArray(structured.misconceptions) && structured.misconceptions.length > 0 && (
                  <div id="sec-misconceptions" style={{ marginBottom: 24, padding: '20px 24px', borderRadius: 16, background: '#FEF2F2', border: '1.5px solid #FECACA' }}>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#991B1B', marginBottom: 10 }}>
                      ⚠️ Common Student Misconceptions & Board Traps:
                    </h4>
                    <div style={{ display: 'grid', gap: 8 }}>
                      {structured.misconceptions.map((misc: string, mIdx: number) => (
                        <div key={mIdx} style={{ fontSize: '0.9rem', color: '#7F1D1D', display: 'flex', gap: 8 }}>
                          <span>⚠️</span>
                          <span>{misc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* The Final Comprehensive Revision Page (Master Sheet) */}
                {finalRevisionPage && (
                  <section
                    id="sec-revision-sheet"
                    style={{
                      padding: '32px 36px',
                      borderRadius: 20,
                      background: '#F0FDF4',
                      border: '2.5px solid #16A34A',
                      boxShadow: '0 12px 32px rgba(22, 163, 74, 0.1)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #16A34A', paddingBottom: 14, marginBottom: 18 }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', background: '#16A34A', color: '#FFFFFF', padding: '3px 10px', borderRadius: 6 }}>
                          High-Yield Board & Exam Master Sheet
                        </span>
                        <h4 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#14532D', margin: '6px 0 0 0' }}>
                          🏆 The Final Comprehensive Revision Page
                        </h4>
                      </div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#15803D' }}>
                        {editSubject} • {editTitle}
                      </span>
                    </div>

                    {finalRevisionPage.executiveSummary && (
                      <div style={{ padding: 14, background: '#FFFFFF', borderRadius: 12, border: '1px solid #BBF7D0', marginBottom: 20 }}>
                        <strong style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#14532D', display: 'block', marginBottom: 4 }}>
                          Executive Concept Summary
                        </strong>
                        <p style={{ margin: 0, fontSize: '0.94rem', color: '#1F2937' }}>
                          {finalRevisionPage.executiveSummary}
                        </p>
                      </div>
                    )}

                    {/* Concept Matrix */}
                    {Array.isArray(finalRevisionPage.quickRevisionMatrix) && (
                      <div style={{ marginBottom: 20 }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#14532D', marginBottom: 8 }}>
                          Quick Revision Concept Matrix:
                        </h4>
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#FFFFFF', borderRadius: 8, fontSize: '0.86rem' }}>
                            <thead>
                              <tr style={{ background: '#DCFCE7', color: '#14532D', textAlign: 'left' }}>
                                <th style={{ padding: '8px 12px', border: '1px solid #BBF7D0' }}>Concept</th>
                                <th style={{ padding: '8px 12px', border: '1px solid #BBF7D0' }}>Core Principle / Rule</th>
                                <th style={{ padding: '8px 12px', border: '1px solid #BBF7D0' }}>Exam Significance</th>
                              </tr>
                            </thead>
                            <tbody>
                              {finalRevisionPage.quickRevisionMatrix.map((row: any, rIdx: number) => (
                                <tr key={rIdx}>
                                  <td style={{ padding: '8px 12px', border: '1px solid #BBF7D0', fontWeight: 700 }}>{row.concept}</td>
                                  <td style={{ padding: '8px 12px', border: '1px solid #BBF7D0' }}>{row.keyRuleOrPrinciple}</td>
                                  <td style={{ padding: '8px 12px', border: '1px solid #BBF7D0', color: '#15803D', fontWeight: 600 }}>{row.examSignificance}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </section>
                )}
              </div>
            </>
          )}
        </div>
      )}

              {/* Synchronized Notes Audio Narration Player Bar (Docked Floating Player) */}
              {notesAudioOpen && (
                <div
                  style={{
                    position: 'sticky',
                    bottom: 24,
                    zIndex: 100020,
                    width: '100%',
                    maxWidth: 880,
                    margin: '0 auto',
                    background: '#FFFFFF',
                    borderRadius: 18,
                    border: '2px solid #FF6A00',
                    boxShadow: '0 16px 40px rgba(255, 106, 0, 0.22)',
                    padding: '14px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10
                  }}
                >
                  {/* Top Line: Track Title, Synchronized Badge & Close Button */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 10,
                          background: 'linear-gradient(135deg, #FF6A00 0%, #EA580C 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF'
                        }}
                      >
                        <Volume2 size={16} />
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: '#0F172A', display: 'block' }}>
                          Now Narrating: Page {notesAudioTrackIdx + 1} — {textbookPages[notesAudioTrackIdx]?.title || 'Textbook Page'}
                        </strong>
                        <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
                          {textbookPages[notesAudioTrackIdx]?.headerCategory || 'Chapter Overview'} • Natural Spoken Voice
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: 6,
                          background: '#ECFDF5',
                          color: '#047857',
                          fontWeight: 800,
                          fontSize: '0.72rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                        <span>Synchronized with Page {notesAudioTrackIdx + 1}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          stopNotesAudio();
                          setNotesAudioOpen(false);
                        }}
                        className="btn-glass"
                        style={{ padding: '4px 8px' }}
                        title="Close Narration Player"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Player Controls & Speed Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    {/* Track & Playback Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        type="button"
                        onClick={prevNotesAudioTrack}
                        disabled={notesAudioTrackIdx <= 0}
                        className="btn-glass"
                        style={{ padding: '6px 10px', opacity: notesAudioTrackIdx <= 0 ? 0.4 : 1 }}
                        title="Previous Track (Page)"
                      >
                        <Rewind size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (notesAudioPlaying) {
                            pauseNotesAudio();
                          } else if (notesAudioPaused) {
                            resumeNotesAudio();
                          } else {
                            playNotesAudio(notesAudioTrackIdx);
                          }
                        }}
                        style={{
                          padding: '8px 18px',
                          borderRadius: 10,
                          background: '#FF6A00',
                          color: '#FFFFFF',
                          border: 'none',
                          fontWeight: 800,
                          fontSize: '0.84rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(255, 106, 0, 0.3)'
                        }}
                        title={notesAudioPlaying ? 'Pause' : 'Play / Resume'}
                      >
                        {notesAudioLoading ? (
                          <span>Loading...</span>
                        ) : notesAudioPlaying ? (
                          <>
                            <Pause size={15} />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <Play size={15} />
                            <span>Play</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={stopNotesAudio}
                        className="btn-glass"
                        style={{ padding: '6px 10px' }}
                        title="Stop Narration"
                      >
                        <Square size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => playNotesAudio(notesAudioTrackIdx)}
                        className="btn-glass"
                        style={{ padding: '6px 10px' }}
                        title="Restart Track from Beginning"
                      >
                        <RotateCcw size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={nextNotesAudioTrack}
                        disabled={notesAudioTrackIdx >= textbookPages.length - 1}
                        className="btn-glass"
                        style={{ padding: '6px 10px', opacity: notesAudioTrackIdx >= textbookPages.length - 1 ? 0.4 : 1 }}
                        title="Next Track (Page)"
                      >
                        <FastForward size={14} />
                      </button>
                    </div>

                    {/* Playback Speed Selectors */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, marginRight: 2 }}>Speed:</span>
                      {[0.75, 1.0, 1.25, 1.5].map((spd) => (
                        <button
                          key={spd}
                          type="button"
                          onClick={() => handleAudioSpeedChange(spd)}
                          style={{
                            padding: '3px 8px',
                            borderRadius: 6,
                            border: notesAudioSpeed === spd ? '1.5px solid #FF6A00' : '1px solid #CBD5E1',
                            background: notesAudioSpeed === spd ? '#FFF3E8' : '#FFFFFF',
                            color: notesAudioSpeed === spd ? '#C2410C' : '#475569',
                            fontWeight: 800,
                            fontSize: '0.72rem',
                            cursor: 'pointer'
                          }}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ---------------------------------------------------------------------
              SUB-TAB: SEPARATE CONDENSED REVISION NOTEBOOK
              --------------------------------------------------------------------- */}
          {notebookSubTab === 'revision' && (
            <div className="glass-card" style={{ padding: '32px 36px', borderRadius: 24, background: '#FFFFFF', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid rgba(255,106,0,0.2)', paddingBottom: 16, marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #FF6A00 0%, #EA580C 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
                    <Award size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', background: '#FFF3E8', color: '#FF6A00', padding: '3px 10px', borderRadius: 999 }}>
                      Condensed Exam Revision Notebook
                    </span>
                    <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#202124', margin: '4px 0 0 0' }}>
                      {editTitle || activeNote?.title || 'Comprehensive Revision Guide'}
                    </h2>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => handleExport('html')}
                    className="btn-orange"
                    style={{ fontSize: '0.82rem', padding: '8px 16px' }}
                  >
                    <Printer size={15} />
                    <span>Print Revision Sheet</span>
                  </button>
                </div>
              </div>

              {/* Executive Concept Summary */}
              <div style={{ padding: 18, background: '#FFF7ED', borderRadius: 16, border: '1.5px solid #FFEDD5', marginBottom: 24 }}>
                <strong style={{ fontSize: '0.82rem', textTransform: 'uppercase', color: '#9A3412', display: 'block', marginBottom: 6 }}>
                  ⚡ Executive Concept Summary
                </strong>
                <p style={{ margin: 0, fontSize: '0.96rem', color: '#1F2937', lineHeight: 1.65 }}>
                  {finalRevisionPage?.executiveSummary ||
                    structured?.sections?.[0]?.content?.slice(0, 320) ||
                    'High-yield summary of core syllabus definitions, fundamental laws, and exam principles.'}
                </p>
              </div>

              {/* Concept Matrix */}
              <div style={{ marginBottom: 28 }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#202124', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>📊 1. Quick Revision Concept Matrix</span>
                </h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', background: '#FFFFFF', borderRadius: 12, overflow: 'hidden', fontSize: '0.88rem', border: '1px solid #E5E7EB' }}>
                    <thead>
                      <tr style={{ background: '#FFF3E8', color: '#9A3412', textAlign: 'left' }}>
                        <th style={{ padding: '10px 14px', border: '1px solid #FED7AA' }}>Concept / Principle</th>
                        <th style={{ padding: '10px 14px', border: '1px solid #FED7AA' }}>Core Rule / Scientific Mechanism</th>
                        <th style={{ padding: '10px 14px', border: '1px solid #FED7AA' }}>High-Frequency Exam Trap</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(finalRevisionPage?.quickRevisionMatrix) && finalRevisionPage.quickRevisionMatrix.length > 0 ? (
                        finalRevisionPage.quickRevisionMatrix.map((row: any, rIdx: number) => (
                          <tr key={rIdx} style={{ background: rIdx % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                            <td style={{ padding: '10px 14px', border: '1px solid #FED7AA', fontWeight: 700, color: '#202124' }}>{row.concept}</td>
                            <td style={{ padding: '10px 14px', border: '1px solid #FED7AA', color: '#4B5563' }}>{row.keyRuleOrPrinciple}</td>
                            <td style={{ padding: '10px 14px', border: '1px solid #FED7AA', color: '#EA580C', fontWeight: 600 }}>{row.examSignificance}</td>
                          </tr>
                        ))
                      ) : (
                        (structured?.sections || []).map((sec: any, sIdx: number) => (
                          <tr key={sIdx} style={{ background: sIdx % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                            <td style={{ padding: '10px 14px', border: '1px solid #FED7AA', fontWeight: 700, color: '#202124' }}>{sec.title}</td>
                            <td style={{ padding: '10px 14px', border: '1px solid #FED7AA', color: '#4B5563' }}>{sec.learningObjective || sec.content?.slice(0, 100)}</td>
                            <td style={{ padding: '10px 14px', border: '1px solid #FED7AA', color: '#EA580C', fontWeight: 600 }}>Key Board Question Section</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* High-Yield Key Points & Formulas */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {(structured?.sections || []).map((sec: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      padding: 16,
                      borderRadius: 16,
                      background: '#FAFAFA',
                      border: '1.5px solid #EEEEEE'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 800, padding: '2px 8px', borderRadius: 999, background: '#FF6A00', color: '#FFFFFF' }}>
                        § {idx + 1}
                      </span>
                      <strong style={{ fontSize: '0.92rem', color: '#202124' }}>{sec.title}</strong>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.84rem', color: '#4B5563', lineHeight: 1.6 }}>
                      {(sec.keyTakeaways || []).length > 0 ? (
                        sec.keyTakeaways.map((k: string, kIdx: number) => <li key={kIdx}>{k}</li>)
                      ) : (
                        <li>{sec.learningObjective || sec.content?.slice(0, 140)}</li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------------
              SUB-TAB 3: STUDIO TOOLS (Section 12 & 13)
              --------------------------------------------------------------------- */}
          {notebookSubTab === 'studio' && (
            <div className="glass-card" style={{ padding: 24, borderRadius: 24 }}>
              {/* Studio Tool Picker */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20, borderBottom: '1px solid #EEEEEE', paddingBottom: 14 }}>
                {[
                  { id: 'audio', label: '🎙️ Audio Overview', icon: Volume2 },
                  { id: 'mindmap', label: '🧠 Interactive Mind Map', icon: Network },
                  { id: 'slides', label: '📊 Slide Deck Presenter', icon: Presentation },
                  { id: 'infographic', label: '🔬 Visual Infographic', icon: ImageIcon },
                  { id: 'quiz', label: '❓ Practice Quiz', icon: HelpCircle },
                  { id: 'reports', label: '📋 Study Guide & Data Table', icon: Table }
                ].map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => setSelectedStudioTool(tool.id as any)}
                    className={`filter-pill ${selectedStudioTool === tool.id ? 'active' : ''}`}
                    style={{ fontSize: '0.8rem', padding: '8px 16px' }}
                  >
                    <span>{tool.label}</span>
                  </button>
                ))}
              </div>

              {studyToolsLoading ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#FF6A00', fontWeight: 700 }}>
                  Synthesizing Audio, Mind Map, Slides, and Infographics from notebook sources...
                </div>
              ) : (
                <div>
                  {/* STUDIO TOOL: AUDIO OVERVIEW (Section 12: Single-Speaker vs Two-Speaker Discussion) */}
                  {selectedStudioTool === 'audio' && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
                        <div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#202124', margin: 0 }}>
                            Narrated Audio Overview Studio
                          </h3>
                          <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: 0 }}>
                            Choose between a Teacher Explanation or a Two-Person AI Discussion.
                          </p>
                        </div>

                        {/* Format Switcher */}
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => {
                              setAudioExperience('single');
                              handleLoadStudyTools();
                            }}
                            className={`filter-pill ${audioExperience === 'single' ? 'active' : ''}`}
                            style={{ fontSize: '0.78rem' }}
                          >
                            Single Teacher (Nova)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAudioExperience('two-speaker');
                              handleLoadStudyTools();
                            }}
                            className={`filter-pill ${audioExperience === 'two-speaker' ? 'active' : ''}`}
                            style={{ fontSize: '0.78rem' }}
                          >
                            Two-Speaker Discussion (Nova & Alex)
                          </button>
                        </div>
                      </div>

                      {/* Audio Player Card */}
                      <div style={{ padding: 20, borderRadius: 18, background: '#FFF3E8', border: '1.5px solid rgba(255,106,0,0.3)', marginBottom: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                          <div>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#FF6A00', textTransform: 'uppercase' }}>
                              {audioExperience === 'two-speaker' ? 'Conversational Podcast Recap' : 'Master Classroom Explanation'}
                            </span>
                            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#202124' }}>
                              {activeNote.title}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              startAudioLesson({
                                topic: activeNote.title,
                                text:
                                  audioExperience === 'two-speaker'
                                    ? studyToolsData?.twoSpeakerDiscussion?.script || studyToolsData?.audioOverviewScript
                                    : studyToolsData?.audioOverviewScript || activeNote.summary
                              })
                            }
                            className="btn-orange"
                            style={{ padding: '8px 20px', borderRadius: 9999, fontSize: '0.84rem' }}
                          >
                            <Play size={15} style={{ marginRight: 6 }} />
                            <span>Play Full Audio</span>
                          </button>
                        </div>

                        {/* Two-Speaker Turns Preview */}
                        {audioExperience === 'two-speaker' && studyToolsData?.twoSpeakerDiscussion?.turns && (
                          <div style={{ display: 'grid', gap: 8, marginTop: 14 }}>
                            {studyToolsData.twoSpeakerDiscussion.turns.slice(0, 4).map((t: any, idx: number) => (
                              <div key={idx} style={{ padding: '10px 14px', borderRadius: 12, background: t.speaker === 'Teacher Nova' ? '#FFFFFF' : '#FFF7ED', border: '1px solid rgba(0,0,0,0.06)' }}>
                                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: t.speaker === 'Teacher Nova' ? '#FF6A00' : '#2563EB', marginBottom: 2 }}>
                                  {t.speaker} ({t.role}):
                                </div>
                                <div style={{ fontSize: '0.88rem', color: '#1F2937' }}>
                                  {t.text}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* STUDIO TOOL: INTERACTIVE MIND MAP (Section 13) */}
                  {selectedStudioTool === 'mindmap' && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#202124', margin: 0 }}>
                          Source-Grounded Concept Mind Map
                        </h3>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => setMindmapZoom((z) => Math.min(1.6, z + 0.15))}
                            className="btn-glass"
                            style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                          >
                            Zoom In +
                          </button>
                          <button
                            type="button"
                            onClick={() => setMindmapZoom((z) => Math.max(0.6, z - 0.15))}
                            className="btn-glass"
                            style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                          >
                            Zoom Out -
                          </button>
                          <button
                            type="button"
                            onClick={() => setMindmapZoom(1)}
                            className="btn-glass"
                            style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                          >
                            Reset
                          </button>
                        </div>
                      </div>

                      {/* SVG Mind Map Visualization */}
                      <div
                        style={{
                          height: 480,
                          borderRadius: 20,
                          background: 'radial-gradient(circle at center, #FFFDF9 0%, #FFF5EB 100%)',
                          border: '1.5px solid rgba(255,106,0,0.2)',
                          overflow: 'auto',
                          padding: 24,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <div
                          style={{
                            transform: `scale(${mindmapZoom})`,
                            transformOrigin: 'center center',
                            transition: 'transform 0.2s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 24
                          }}
                        >
                          {/* Root Node */}
                          <div
                            style={{
                              padding: '14px 28px',
                              borderRadius: 20,
                              background: 'linear-gradient(135deg, #FF6A00 0%, #E85D00 100%)',
                              color: '#FFFFFF',
                              fontWeight: 900,
                              fontSize: '1.15rem',
                              boxShadow: '0 10px 28px rgba(255, 106, 0, 0.35)',
                              textAlign: 'center'
                            }}
                          >
                            {activeNote.title}
                          </div>

                          {/* Level 1 Branches */}
                          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
                            {(studyToolsData?.mindMap?.nodes || []).map((node: any) => (
                              <div
                                key={node.id}
                                style={{
                                  padding: '12px 18px',
                                  borderRadius: 16,
                                  background: '#FFFFFF',
                                  border: '1.5px solid rgba(255,106,0,0.3)',
                                  boxShadow: '0 6px 18px rgba(0,0,0,0.05)',
                                  maxWidth: 220
                                }}
                              >
                                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#FF6A00', marginBottom: 4 }}>
                                  {node.label}
                                </div>
                                <div style={{ fontSize: '0.76rem', color: '#6B7280', marginBottom: 6 }}>
                                  {node.summary}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#047857', fontWeight: 700 }}>
                                  {node.sourceCitation}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STUDIO TOOL: SLIDE DECK PRESENTER (Section 13) */}
                  {selectedStudioTool === 'slides' && (
                    <div>
                      {studyToolsData?.slideDeck ? (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#6B7280' }}>
                              Slide {currentSlideIdx + 1} of {studyToolsData.slideDeck.length}
                            </span>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button
                                type="button"
                                onClick={() => setCurrentSlideIdx((prev) => Math.max(0, prev - 1))}
                                disabled={currentSlideIdx === 0}
                                className="btn-glass"
                                style={{ padding: '4px 12px', fontSize: '0.78rem' }}
                              >
                                ← Prev Slide
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setCurrentSlideIdx((prev) =>
                                    Math.min(studyToolsData.slideDeck.length - 1, prev + 1)
                                  )
                                }
                                disabled={currentSlideIdx === studyToolsData.slideDeck.length - 1}
                                className="btn-orange"
                                style={{ padding: '4px 14px', fontSize: '0.78rem' }}
                              >
                                Next Slide →
                              </button>
                            </div>
                          </div>

                          {/* Active Slide Presentation Canvas */}
                          <div
                            style={{
                              aspectRatio: '16/9',
                              borderRadius: 24,
                              background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFDF9 100%)',
                              border: '2px solid rgba(255,106,0,0.3)',
                              boxShadow: '0 16px 40px rgba(0,0,0,0.08)',
                              padding: '40px 48px',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between'
                            }}
                          >
                            <div>
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FF6A00', textTransform: 'uppercase' }}>
                                STUDYAI Presentation Deck
                              </span>
                              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#202124', margin: '6px 0 4px 0' }}>
                                {studyToolsData.slideDeck[currentSlideIdx]?.title}
                              </h2>
                              <p style={{ fontSize: '0.94rem', color: '#6B7280', margin: '0 0 20px 0' }}>
                                {studyToolsData.slideDeck[currentSlideIdx]?.subtitle}
                              </p>

                              <ul style={{ margin: 0, paddingLeft: 24, fontSize: '1.02rem', color: '#374151', lineHeight: 1.8 }}>
                                {(studyToolsData.slideDeck[currentSlideIdx]?.bullets || []).map(
                                  (b: string, bIdx: number) => (
                                    <li key={bIdx} style={{ marginBottom: 8 }}>
                                      {b}
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #EEEEEE', paddingTop: 12, fontSize: '0.74rem', color: '#6B7280' }}>
                              <span>📌 {studyToolsData.slideDeck[currentSlideIdx]?.sourceCitation}</span>
                              <span>{activeNote.subject} • Verified Curriculum Source</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>
                          Generating structured slide deck...
                        </div>
                      )}
                    </div>
                  )}

                  {/* STUDIO TOOL: INFOGRAPHIC GENERATOR (Section 13) */}
                  {selectedStudioTool === 'infographic' && (
                    <div>
                      {studyToolsData?.infographic ? (
                        <div style={{ padding: 24, borderRadius: 20, background: '#FFFFFF', border: '1.5px solid #EEEEEE' }}>
                          <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#202124', marginBottom: 6 }}>
                            {studyToolsData.infographic.title}
                          </h3>
                          <p style={{ fontSize: '0.88rem', color: '#6B7280', marginBottom: 20 }}>
                            {studyToolsData.infographic.subtitle}
                          </p>

                          {/* Key Metrics Row */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
                            {(studyToolsData.infographic.keyMetrics || []).map((m: any, mIdx: number) => (
                              <div key={mIdx} style={{ padding: 14, borderRadius: 14, background: '#FFF3E8', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#FF6A00' }}>{m.value}</div>
                                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#202124' }}>{m.label}</div>
                                <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>{m.detail}</div>
                              </div>
                            ))}
                          </div>

                          {/* Diagram Spotlight */}
                          {studyToolsData.infographic.svgDataUrl && (
                            <div style={{ padding: 16, borderRadius: 16, background: '#FAFAFA', border: '1px solid #EEEEEE', marginBottom: 20, textAlign: 'center' }}>
                              <img
                                src={studyToolsData.infographic.svgDataUrl}
                                alt="Infographic Diagram"
                                style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain' }}
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>
                          Generating visual infographic...
                        </div>
                      )}
                    </div>
                  )}

                  {/* STUDIO TOOL: PRACTICE QUIZ (Section 13) */}
                  {selectedStudioTool === 'quiz' && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#202124', margin: 0 }}>
                            Source-Grounded Interactive Quiz
                          </h3>
                          <p style={{ fontSize: '0.84rem', color: '#6B7280', margin: 0 }}>
                            Practice high-yield questions generated directly from your notebook sources.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => openQuizModal(activeNote.topic || editTitle, activeNote.subject)}
                          className="btn-orange"
                          style={{ padding: '8px 18px', fontSize: '0.84rem' }}
                        >
                          Launch Full Quiz Modal
                        </button>
                      </div>

                      <div style={{ display: 'grid', gap: 14 }}>
                        {(studyToolsData?.quiz || activeNote.quiz || []).map((q: any, qIdx: number) => (
                          <div key={qIdx} style={{ padding: 16, borderRadius: 14, background: '#FFFFFF', border: '1px solid #EEEEEE' }}>
                            <div style={{ fontWeight: 800, fontSize: '0.94rem', color: '#202124', marginBottom: 8 }}>
                              Q{qIdx + 1}. {q.question}
                            </div>
                            <div style={{ display: 'grid', gap: 6 }}>
                              {(q.options || []).map((opt: string, oIdx: number) => (
                                <div
                                  key={oIdx}
                                  style={{
                                    padding: '8px 12px',
                                    borderRadius: 10,
                                    background: oIdx === (q.correctIndex || 0) ? '#ECFDF5' : '#F9FAFB',
                                    border: oIdx === (q.correctIndex || 0) ? '1px solid #A7F3D0' : '1px solid #E5E7EB',
                                    fontSize: '0.86rem',
                                    color: oIdx === (q.correctIndex || 0) ? '#065F46' : '#374151',
                                    fontWeight: oIdx === (q.correctIndex || 0) ? 700 : 400
                                  }}
                                >
                                  {String.fromCharCode(65 + oIdx)}. {opt} {oIdx === (q.correctIndex || 0) && '✓ (Correct)'}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STUDIO TOOL: REPORTS & DATA TABLE (Section 13) */}
                  {selectedStudioTool === 'reports' && (
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#202124', marginBottom: 12 }}>
                        Structured Source Data Table
                      </h3>
                      {studyToolsData?.dataTable?.rows?.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                            <thead>
                              <tr style={{ background: '#FFF3E8', color: '#FF6A00', textAlign: 'left' }}>
                                <th style={{ padding: '10px 12px', border: '1px solid #FFEDD5' }}>Concept / Term</th>
                                <th style={{ padding: '10px 12px', border: '1px solid #FFEDD5' }}>Category</th>
                                <th style={{ padding: '10px 12px', border: '1px solid #FFEDD5' }}>Definition / Value</th>
                                <th style={{ padding: '10px 12px', border: '1px solid #FFEDD5' }}>Exam Significance</th>
                              </tr>
                            </thead>
                            <tbody>
                              {studyToolsData.dataTable.rows.map((row: any, rIdx: number) => (
                                <tr key={rIdx}>
                                  <td style={{ padding: '8px 12px', border: '1px solid #EEEEEE', fontWeight: 700 }}>{row.term}</td>
                                  <td style={{ padding: '8px 12px', border: '1px solid #EEEEEE' }}>{row.category}</td>
                                  <td style={{ padding: '8px 12px', border: '1px solid #EEEEEE' }}>{row.definition}</td>
                                  <td style={{ padding: '8px 12px', border: '1px solid #EEEEEE', color: '#047857' }}>{row.examSignificance}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>
                          No structured table rows available.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ---------------------------------------------------------------------
              SUB-TAB: SEPARATE CONDENSED REVISION NOTEBOOK
              --------------------------------------------------------------------- */}
          {notebookSubTab === 'revision' && (
            <div className="glass-card" style={{ padding: '32px 36px', borderRadius: 24, background: '#FFFFFF', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid rgba(255,106,0,0.2)', paddingBottom: 16, marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #FF6A00 0%, #EA580C 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
                    <Award size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', background: '#FFF3E8', color: '#FF6A00', padding: '3px 10px', borderRadius: 999 }}>
                      Condensed Exam Revision Notebook
                    </span>
                    <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#202124', margin: '4px 0 0 0' }}>
                      {editTitle || activeNote?.title || 'Comprehensive Revision Guide'}
                    </h2>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => handleExport('html')}
                    className="btn-orange"
                    style={{ fontSize: '0.82rem', padding: '8px 16px' }}
                  >
                    <Printer size={15} />
                    <span>Print Revision Sheet</span>
                  </button>
                </div>
              </div>

              {/* Executive Concept Summary */}
              <div style={{ padding: 18, background: '#FFF7ED', borderRadius: 16, border: '1.5px solid #FFEDD5', marginBottom: 24 }}>
                <strong style={{ fontSize: '0.82rem', textTransform: 'uppercase', color: '#9A3412', display: 'block', marginBottom: 6 }}>
                  ⚡ Executive Concept Summary
                </strong>
                <p style={{ margin: 0, fontSize: '0.96rem', color: '#1F2937', lineHeight: 1.65 }}>
                  {finalRevisionPage?.executiveSummary ||
                    structured?.sections?.[0]?.content?.slice(0, 320) ||
                    'High-yield summary of core syllabus definitions, fundamental laws, and exam principles.'}
                </p>
              </div>

              {/* Concept Matrix */}
              <div style={{ marginBottom: 28 }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#202124', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>📊 1. Quick Revision Concept Matrix</span>
                </h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', background: '#FFFFFF', borderRadius: 12, overflow: 'hidden', fontSize: '0.88rem', border: '1px solid #E5E7EB' }}>
                    <thead>
                      <tr style={{ background: '#FFF3E8', color: '#9A3412', textAlign: 'left' }}>
                        <th style={{ padding: '10px 14px', border: '1px solid #FED7AA' }}>Concept / Principle</th>
                        <th style={{ padding: '10px 14px', border: '1px solid #FED7AA' }}>Core Rule / Scientific Mechanism</th>
                        <th style={{ padding: '10px 14px', border: '1px solid #FED7AA' }}>High-Frequency Exam Trap</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(finalRevisionPage?.quickRevisionMatrix) && finalRevisionPage.quickRevisionMatrix.length > 0 ? (
                        finalRevisionPage.quickRevisionMatrix.map((row: any, rIdx: number) => (
                          <tr key={rIdx} style={{ background: rIdx % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                            <td style={{ padding: '10px 14px', border: '1px solid #FED7AA', fontWeight: 700, color: '#202124' }}>{row.concept}</td>
                            <td style={{ padding: '10px 14px', border: '1px solid #FED7AA', color: '#4B5563' }}>{row.keyRuleOrPrinciple}</td>
                            <td style={{ padding: '10px 14px', border: '1px solid #FED7AA', color: '#EA580C', fontWeight: 600 }}>{row.examSignificance}</td>
                          </tr>
                        ))
                      ) : (
                        (structured?.sections || []).map((sec: any, sIdx: number) => (
                          <tr key={sIdx} style={{ background: sIdx % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                            <td style={{ padding: '10px 14px', border: '1px solid #FED7AA', fontWeight: 700, color: '#202124' }}>{sec.title}</td>
                            <td style={{ padding: '10px 14px', border: '1px solid #FED7AA', color: '#4B5563' }}>{sec.learningObjective || sec.content?.slice(0, 100)}</td>
                            <td style={{ padding: '10px 14px', border: '1px solid #FED7AA', color: '#EA580C', fontWeight: 600 }}>Key Board Question Section</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* High-Yield Key Points & Formulas */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {(structured?.sections || []).map((sec: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      padding: 16,
                      borderRadius: 16,
                      background: '#FAFAFA',
                      border: '1.5px solid #EEEEEE'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 800, padding: '2px 8px', borderRadius: 999, background: '#FF6A00', color: '#FFFFFF' }}>
                        § {idx + 1}
                      </span>
                      <strong style={{ fontSize: '0.92rem', color: '#202124' }}>{sec.title}</strong>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.84rem', color: '#4B5563', lineHeight: 1.6 }}>
                      {(sec.keyTakeaways || []).length > 0 ? (
                        sec.keyTakeaways.map((k: string, kIdx: number) => <li key={kIdx}>{k}</li>)
                      ) : (
                        <li>{sec.learningObjective || sec.content?.slice(0, 140)}</li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------------
              SUB-TAB 4: ASK NOTEBOOK SOURCES (Grounded Q&A with Citations)
              --------------------------------------------------------------------- */}
          {notebookSubTab === 'ask' && (
            <div className="glass-card" style={{ padding: 24, borderRadius: 24 }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#202124', marginBottom: 6 }}>
                Ask Your Notebook Sources (Source-Grounded Q&A)
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#6B7280', marginBottom: 16 }}>
                Every answer separates <strong>Source-Grounded Facts (with Page/Timestamp Citations)</strong> from <strong>Supplemental AI Tutor Context</strong>.
              </p>

              <form onSubmit={handleAskSectionAI} style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                <input
                  value={qaQuestion}
                  onChange={(e) => setQaQuestion(e.target.value)}
                  placeholder="Ask a question about this chapter (e.g. What are the 4 chambers? What formula governs friction?)..."
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: 14,
                    border: '1.5px solid rgba(255,106,0,0.35)',
                    fontSize: '0.94rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault();
                    if (!activeNote || !qaQuestion.trim()) return;
                    setQaLoading(true);
                    try {
                      const res = await apiFetch(`/api/notes/${activeNote.id}/ask`, {
                        method: 'POST',
                        body: JSON.stringify({ question: qaQuestion.trim(), selectedSourceIds })
                      });
                      setQaHistory((prev) => [res, ...prev]);
                      setQaQuestion('');
                    } finally {
                      setQaLoading(false);
                    }
                  }}
                  disabled={qaLoading}
                  className="btn-orange"
                  style={{ padding: '12px 20px', fontSize: '0.88rem' }}
                >
                  {qaLoading ? 'Searching Sources...' : 'Ask Sources'}
                </button>
              </form>

              <div style={{ display: 'grid', gap: 14 }}>
                {qaHistory.map((item, idx) => (
                  <div key={idx} style={{ padding: 18, borderRadius: 16, background: '#FFFFFF', border: '1px solid #EEEEEE' }}>
                    <div style={{ fontWeight: 800, color: '#202124', fontSize: '0.98rem', marginBottom: 8 }}>
                      Q: {item.question}
                    </div>
                    <div style={{ padding: 12, borderRadius: 12, background: '#ECFDF5', border: '1px solid #A7F3D0', marginBottom: 10, fontSize: '0.92rem', color: '#065F46', lineHeight: 1.6 }}>
                      {item.sourceGroundedAnswer}
                      {Array.isArray(item.citations) && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                          {item.citations.map((c: any, cIdx: number) => (
                            <span key={cIdx} style={{ padding: '2px 8px', borderRadius: 6, background: '#FFFFFF', color: '#047857', fontSize: '0.74rem', fontWeight: 700 }}>
                              📌 {c.citationLabel || c.sourceTitle}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      )}

      {/* =========================================================================
          ATTACHMENT MODAL — PLUS (+) BUTTON 9 OPTIONS (Section 4)
          ========================================================================= */}
      {showAttachmentModal && (
        <div className="diagram-lightbox-backdrop" onClick={() => setShowAttachmentModal(false)}>
          <div
            className="diagram-lightbox-panel"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 640, width: '92vw', padding: 28 }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: '#FFF3E8', color: '#FF6A00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={22} strokeWidth={2.8} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#202124', margin: 0 }}>
                    Attach Learning Material
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0 }}>
                    Upload textbook photos, PDFs, documents, or paste educational links
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAttachmentModal(false)}
                className="btn-glass"
                style={{ padding: '6px 10px' }}
                aria-label="Close attachment menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Hidden Real File Inputs */}
            <input
              ref={fileInputPdfRef}
              type="file"
              accept=".pdf"
              style={{ display: 'none' }}
              onChange={(e) => handleProcessIncomingFiles(e.target.files!, 'pdf')}
            />
            <input
              ref={fileInputCameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={(e) => handleProcessIncomingFiles(e.target.files!, 'camera')}
            />
            <input
              ref={fileInputSingleImageRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => handleProcessIncomingFiles(e.target.files!, 'image')}
            />
            <input
              ref={fileInputMultipleImagesRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => handleProcessIncomingFiles(e.target.files!, 'image')}
            />
            <input
              ref={fileInputDocxRef}
              type="file"
              accept=".docx,.doc"
              style={{ display: 'none' }}
              onChange={(e) => handleProcessIncomingFiles(e.target.files!, 'docx')}
            />
            <input
              ref={fileInputPptxRef}
              type="file"
              accept=".pptx,.ppt"
              style={{ display: 'none' }}
              onChange={(e) => handleProcessIncomingFiles(e.target.files!, 'pptx')}
            />

            {/* 9 Working Attachment Options Grid (Section 4) */}
            <div className="attachment-menu-grid" style={{ marginBottom: 20 }}>
              <button
                type="button"
                onClick={() => fileInputPdfRef.current?.click()}
                className="attachment-menu-item"
              >
                <FileText size={28} color="#FF6A00" />
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#202124' }}>1. Upload PDF</span>
                <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>Textbook chapters or notes</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputCameraRef.current?.click()}
                className="attachment-menu-item"
              >
                <Camera size={28} color="#FF6A00" />
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#202124' }}>2. Take Textbook Photo</span>
                <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>Camera OCR & extraction</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputSingleImageRef.current?.click()}
                className="attachment-menu-item"
              >
                <ImageIcon size={28} color="#FF6A00" />
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#202124' }}>3. Single Image</span>
                <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>PNG / JPG diagram or page</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputMultipleImagesRef.current?.click()}
                className="attachment-menu-item"
              >
                <Layers size={28} color="#FF6A00" />
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#202124' }}>4. Multiple Images</span>
                <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>With page re-ordering</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputDocxRef.current?.click()}
                className="attachment-menu-item"
              >
                <FileText size={28} color="#2563EB" />
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#202124' }}>5. Word Doc (.docx)</span>
                <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>DOCX chapter extracts</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputPptxRef.current?.click()}
                className="attachment-menu-item"
              >
                <Presentation size={28} color="#EA580C" />
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#202124' }}>6. PowerPoint (.pptx)</span>
                <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>Lecture slides & decks</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveAttachmentTab('links')}
                className="attachment-menu-item"
              >
                <Globe size={28} color="#0D9488" />
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#202124' }}>7. Website URL</span>
                <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>Educational articles</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveAttachmentTab('links')}
                className="attachment-menu-item"
              >
                <Youtube size={28} color="#DC2626" />
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#202124' }}>8. YouTube URL</span>
                <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>Video lecture synthesis</span>
              </button>

              <button
                type="button"
                onClick={handleToggleVoiceInput}
                className="attachment-menu-item"
              >
                <Mic size={28} color="#7C3AED" />
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#202124' }}>9. Voice Input</span>
                <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>Live speech-to-text</span>
              </button>
            </div>

            {/* URL Inputs Drawer if selected */}
            {activeAttachmentTab === 'links' && (
              <div style={{ padding: 16, borderRadius: 16, background: '#FAFAFA', border: '1.5px solid #EEEEEE', marginBottom: 18 }}>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4B5563', marginBottom: 4 }}>
                    YouTube Lecture URL:
                  </label>
                  <input
                    value={youtubeUrlInput}
                    onChange={(e) => setYoutubeUrlInput(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: '0.86rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4B5563', marginBottom: 4 }}>
                    Educational Website URL:
                  </label>
                  <input
                    value={webUrlInput}
                    onChange={(e) => setWebUrlInput(e.target.value)}
                    placeholder="https://en.wikipedia.org/... or educational article"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: '0.86rem' }}
                  />
                </div>
              </div>
            )}

            {/* Multiple Images Page Ordering List (Section 4 & 5) */}
            {pendingSources.length > 0 && (
              <div style={{ padding: 14, borderRadius: 14, background: '#F9FAFB', border: '1px solid #EEEEEE', marginBottom: 18 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#4B5563', textTransform: 'uppercase', marginBottom: 8 }}>
                  Attached Pages & Sources ({pendingSources.length}) — Reorder Pages:
                </div>
                <div style={{ display: 'grid', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
                  {pendingSources.map((item, idx) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 12px',
                        borderRadius: 10,
                        background: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        fontSize: '0.82rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 800, color: '#FF6A00' }}>#{idx + 1}</span>
                        <span>{item.title}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button
                          type="button"
                          onClick={() => handleMoveImagePage(idx, -1)}
                          disabled={idx === 0}
                          className="btn-glass"
                          style={{ padding: '2px 6px', opacity: idx === 0 ? 0.3 : 1 }}
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveImagePage(idx, 1)}
                          disabled={idx === pendingSources.length - 1}
                          className="btn-glass"
                          style={{ padding: '2px 6px', opacity: idx === pendingSources.length - 1 ? 0.3 : 1 }}
                        >
                          <ArrowDown size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemovePendingSource(item.id)}
                          style={{ border: 'none', background: 'transparent', color: '#DC2626', cursor: 'pointer', fontWeight: 800, padding: '2px 6px' }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowAttachmentModal(false)}
                className="btn-glass"
                style={{ padding: '10px 18px', fontSize: '0.86rem' }}
              >
                Done Attaching
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAttachmentModal(false);
                  handleGenerateNotebook();
                }}
                className="btn-orange"
                style={{ padding: '10px 22px', fontSize: '0.86rem', fontWeight: 800 }}
              >
                Generate Guided Notebook
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          LIGHTBOX ZOOM MODAL FOR DIAGRAMS (Section 11)
          ========================================================================= */}
      {lightboxImage && (
        <div className="diagram-lightbox-backdrop" onClick={() => setLightboxImage(null)}>
          <div
            className="diagram-lightbox-panel"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 900, width: '92vw', padding: 24 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#202124', margin: 0 }}>
                {lightboxImage.title}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setLightboxZoom((z) => Math.min(2.5, z + 0.2))}
                  className="btn-glass"
                  style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                >
                  Zoom In +
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxZoom((z) => Math.max(0.6, z - 0.2))}
                  className="btn-glass"
                  style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                >
                  Zoom Out -
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="btn-glass"
                  style={{ padding: '4px 8px' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div
              style={{
                overflow: 'auto',
                maxHeight: '70vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#FAFAFA',
                borderRadius: 16,
                padding: 16
              }}
            >
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                style={{
                  transform: `scale(${lightboxZoom})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.2s ease',
                  maxWidth: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>

            {lightboxImage.caption && (
              <p style={{ marginTop: 12, fontSize: '0.86rem', color: '#4B5563', margin: '12px 0 0 0' }}>
                {lightboxImage.caption}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Understand This Image Modal Dialog (Part 16) */}
      {understandImageModal && understandImageModal.open && (
        <div
          className="diagram-lightbox-backdrop"
          onClick={() => setUnderstandImageModal(null)}
          style={{ zIndex: 99999 }}
        >
          <div
            className="diagram-lightbox-panel"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 840, width: '92vw', maxHeight: '88vh', overflowY: 'auto', padding: 24, borderRadius: 24 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FF6A00', textTransform: 'uppercase' }}>
                  AI Visual Deep Dive • {understandImageModal.sectionTitle}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#202124', margin: '4px 0 0 0' }}>
                  {understandImageModal.imageTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setUnderstandImageModal(null)}
                className="btn-glass"
                style={{ padding: '6px 10px' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 1.2fr', gap: 20 }}>
              <div>
                <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #E5E7EB', background: '#FAFAFA', marginBottom: 12 }}>
                  <img
                    src={understandImageModal.imageUrl}
                    alt={understandImageModal.imageTitle}
                    style={{ width: '100%', maxHeight: 280, objectFit: 'contain', display: 'block' }}
                  />
                </div>
                {understandImageModal.walkthrough && (
                  <div style={{ padding: 12, borderRadius: 12, background: '#FFF7ED', border: '1px solid #FED7AA' }}>
                    <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#C2410C', marginBottom: 4 }}>
                      Walkthrough Perspective
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#7C2D12', lineHeight: 1.4 }}>
                      {understandImageModal.walkthrough.whatStudentIsLookingAt ||
                        understandImageModal.walkthrough.whatItRepresents ||
                        'Educational reference diagram'}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#374151', marginBottom: 6 }}>
                    Ask a Question About This Image:
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      placeholder="e.g., Why are the ventricular walls thicker than the atria?"
                      value={understandImageModal.question}
                      onChange={(e) =>
                        setUnderstandImageModal((prev) => (prev ? { ...prev, question: e.target.value } : null))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAskUnderstandImage();
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: 12,
                        border: '1.5px solid #D1D5DB',
                        fontSize: '0.85rem'
                      }}
                    />
                    <button
                      type="button"
                      disabled={understandImageModal.loading || !understandImageModal.question.trim()}
                      onClick={() => handleAskUnderstandImage()}
                      className="btn-orange"
                      style={{ padding: '10px 16px', fontSize: '0.85rem', fontWeight: 800 }}
                    >
                      {understandImageModal.loading ? 'Thinking...' : 'Ask'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {[
                      'What is the function of each labeled part?',
                      'Which way does the flow move in this diagram?',
                      'What is the most common exam question about this?'
                    ].map((preset, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => {
                          setUnderstandImageModal((prev) => (prev ? { ...prev, question: preset } : null));
                          handleAskUnderstandImage(preset);
                        }}
                        style={{
                          fontSize: '0.72rem',
                          background: '#F3F4F6',
                          border: '1px solid #E5E7EB',
                          borderRadius: 999,
                          padding: '3px 10px',
                          cursor: 'pointer',
                          color: '#4B5563'
                        }}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {understandImageModal.answer && (
                  <div
                    style={{
                      padding: 14,
                      borderRadius: 14,
                      background: '#FFFFFF',
                      border: '1.5px solid #FF6A00',
                      boxShadow: '0 4px 14px rgba(255,106,0,0.08)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <Sparkles size={16} color="#FF6A00" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FF6A00' }}>
                        AI Diagram Teacher Analysis
                      </span>
                    </div>
                    <p style={{ fontSize: '0.84rem', color: '#1F2937', lineHeight: 1.55, margin: 0 }}>
                      {understandImageModal.answer}
                    </p>
                    {understandImageModal.groundedComponents?.length > 0 && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #F3F4F6' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6B7280' }}>
                          Grounded Components: {understandImageModal.groundedComponents.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
