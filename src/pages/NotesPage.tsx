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
  GraduationCap
} from 'lucide-react';
import { TopBrandBar } from '../components/GlassNav';
import { useLearning } from '../context/LearningContext';

interface PendingSourceItem {
  id: string;
  sourceType: 'topic' | 'pdf' | 'youtube' | 'web' | 'docx' | 'txt';
  title: string;
  url?: string;
  fileName?: string;
  content?: string;
  base64Content?: string;
}

const PIPELINE_STEP_LABELS = [
  '1. Import Source',
  '2. Extract Content',
  '3. Build Coverage Inventory',
  '4. Segment Sections',
  '5. Analyze Concepts & Terms',
  '6. Generate Structured Notes',
  '7. Generate & Validate Diagrams',
  '8. Verify 100% Source Coverage',
  '9. Render White-Page Notebook',
  '10. Persist to SQLite'
];

export const NotesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { apiFetch, activeTopic, setTopicContext, startAudioLesson, openQuizModal, refreshTick, triggerRefresh } = useLearning();

  const [notes, setNotes] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Active Note & White-Page Digital Notebook Editor State
  const [activeNote, setActiveNote] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editSubject, setEditSubject] = useState<string>('Science');
  const [editNotebook, setEditNotebook] = useState<string>('Biology');
  const [editMarkdown, setEditMarkdown] = useState<string>('');
  const [editStructured, setEditStructured] = useState<any | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState<'notebook' | 'ask-sources' | 'study-tools' | 'flashcards' | 'editor'>('notebook');
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  // Undo / Redo History Stack for White-Page Notebook Editing
  const [historyStack, setHistoryStack] = useState<Array<{ title: string; markdown: string; structured: any }>>([]);
  const [redoStack, setRedoStack] = useState<Array<{ title: string; markdown: string; structured: any }>>([]);
  const [editingSectionIdx, setEditingSectionIdx] = useState<number | null>(null);
  const [newKeyNoteText, setNewKeyNoteText] = useState<string>('');
  const autosaveTimerRef = useRef<number | null>(null);

  // Multi-Source Notebook Generator State
  const [showGenerator, setShowGenerator] = useState<boolean>(false);
  const [genTopic, setGenTopic] = useState<string>(searchParams.get('topic') || activeTopic || '');
  const [genSubject, setGenSubject] = useState<string>('Science');
  const [genDepth, setGenDepth] = useState<'concise' | 'detailed' | 'exam-prep'>('detailed');
  const [genSourceText, setGenSourceText] = useState<string>('');
  const [youtubeUrlInput, setYoutubeUrlInput] = useState<string>('');
  const [webUrlInput, setWebUrlInput] = useState<string>('');
  const [pendingSources, setPendingSources] = useState<PendingSourceItem[]>([]);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'ok' | 'err'; message: string } | null>(null);
  const [generating, setGenerating] = useState<boolean>(false);
  const [pipelineStepIdx, setPipelineStepIdx] = useState<number>(0);

  // Universal Topic Classifier Live Preview State
  const [topicClassification, setTopicClassification] = useState<any | null>(null);
  const [classifyingTopic, setClassifyingTopic] = useState<boolean>(false);

  // Source-Grounded Q&A State
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);
  const [qaQuestion, setQaQuestion] = useState<string>('');
  const [qaLoading, setQaLoading] = useState<boolean>(false);
  const [qaHistory, setQaHistory] = useState<any[]>([]);

  // Study Tools State
  const [studyToolsData, setStudyToolsData] = useState<any | null>(null);
  const [studyToolsLoading, setStudyToolsLoading] = useState<boolean>(false);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.set('subject', selectedCategory);
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      const list = await apiFetch<any[]>(`/api/notes?${params.toString()}`);
      setNotes(list);

      const requestedId = searchParams.get('id');
      if (requestedId) {
        const found = list.find((n) => n.id === requestedId);
        if (found) selectNoteForEditing(found);
      } else if (!activeNote && list.length > 0) {
        selectNoteForEditing(list[0]);
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

  // Live Universal Topic Classifier with Disambiguation
  useEffect(() => {
    const trimmed = genTopic.trim();
    if (!trimmed || trimmed.length < 2) {
      setTopicClassification(null);
      return;
    }
    const timer = window.setTimeout(async () => {
      setClassifyingTopic(true);
      try {
        const res = await apiFetch(`/api/notes/classify?topic=${encodeURIComponent(trimmed)}`);
        setTopicClassification(res);
        if (res?.classification?.subject && res.classification.subject !== genSubject) {
          setGenSubject(res.classification.subject);
        }
      } catch {
        // Silently skip on error
      } finally {
        setClassifyingTopic(false);
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [genTopic]);

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
    setQaHistory([]);
    setStudyToolsData(null);
    const srcIds = (structuredCopy?.sourceRecords || []).map((s: any) => s.id);
    setSelectedSourceIds(srcIds);
  };

  const pushUndoSnapshot = () => {
    setHistoryStack((prev) => [
      ...prev.slice(-19),
      {
        title: editTitle,
        markdown: editMarkdown,
        structured: editStructured ? JSON.parse(JSON.stringify(editStructured)) : {}
      }
    ]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (historyStack.length === 0) return;
    const last = historyStack[historyStack.length - 1];
    setRedoStack((prev) => [
      ...prev,
      {
        title: editTitle,
        markdown: editMarkdown,
        structured: editStructured ? JSON.parse(JSON.stringify(editStructured)) : {}
      }
    ]);
    setHistoryStack((prev) => prev.slice(0, -1));
    setEditTitle(last.title);
    setEditMarkdown(last.markdown);
    setEditStructured(last.structured);
    scheduleAutosave(last.title, editSubject, editNotebook, last.markdown, last.structured);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setHistoryStack((prev) => [
      ...prev,
      {
        title: editTitle,
        markdown: editMarkdown,
        structured: editStructured ? JSON.parse(JSON.stringify(editStructured)) : {}
      }
    ]);
    setRedoStack((prev) => prev.slice(0, -1));
    setEditTitle(next.title);
    setEditMarkdown(next.markdown);
    setEditStructured(next.structured);
    scheduleAutosave(next.title, editSubject, editNotebook, next.markdown, next.structured);
  };

  const scheduleAutosave = (
    nextTitle: string,
    nextSubject: string,
    nextNotebook: string,
    nextMarkdown: string,
    nextStructured: any
  ) => {
    if (!activeNote) return;
    if (autosaveTimerRef.current) {
      window.clearTimeout(autosaveTimerRef.current);
    }
    setSaveStatus('saving');
    autosaveTimerRef.current = window.setTimeout(async () => {
      try {
        const updated = await apiFetch(`/api/notes/${activeNote.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            title: nextTitle,
            subject: nextSubject,
            notebook: nextNotebook,
            content_markdown: nextMarkdown,
            structured: nextStructured
          })
        });
        setActiveNote(updated);
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
      }
    }, 900);
  };

  const handleAddYouTubeSource = () => {
    if (!youtubeUrlInput.trim()) return;
    const url = youtubeUrlInput.trim();
    setPendingSources((prev) => [
      ...prev,
      {
        id: `yt-${Date.now()}`,
        sourceType: 'youtube',
        title: `YouTube Lecture (${url})`,
        url,
        content: genSourceText.trim() || undefined
      }
    ]);
    if (!genTopic.trim()) {
      setGenTopic('YouTube Video Lecture Study Notes');
    }
    setYoutubeUrlInput('');
    setUploadStatus({ type: 'ok', message: `Added YouTube source "${url}" to notebook queue.` });
  };

  const handleAddWebSource = () => {
    if (!webUrlInput.trim()) return;
    const url = webUrlInput.trim();
    setPendingSources((prev) => [
      ...prev,
      {
        id: `web-${Date.now()}`,
        sourceType: 'web',
        title: `Web Article (${url})`,
        url,
        content: genSourceText.trim() || undefined
      }
    ]);
    if (!genTopic.trim()) {
      setGenTopic('Web Article Study Notes');
    }
    setWebUrlInput('');
    setUploadStatus({ type: 'ok', message: `Added Web Link "${url}" to notebook queue.` });
  };

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadStatus(null);

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

      const extType: PendingSourceItem['sourceType'] = lowerName.endsWith('.pdf')
        ? 'pdf'
        : lowerName.endsWith('.docx')
          ? 'docx'
          : 'txt';

      setPendingSources((prev) => [
        ...prev,
        {
          id: `file-${Date.now()}`,
          sourceType: extType,
          title: file.name,
          fileName: file.name,
          content: res.fullExtractedText || textContent || res.extractedSummary || '',
          base64Content: base64Content || undefined
        }
      ]);

      if (!genTopic.trim()) {
        setGenTopic(res.inferredTopic || file.name.replace(/\.[^.]+$/, ''));
      }
      setShowGenerator(true);
      setUploadStatus({
        type: 'ok',
        message: `Imported "${file.name}" (${res.inventory?.totalUnits || 1} ${res.inventory?.unitType || 'section'}(s), 100% extracted). Ready to generate notebook!`
      });
    } catch (err: any) {
      setUploadStatus({
        type: 'err',
        message: err?.message || 'Unsupported or unreadable file upload.'
      });
    }
  };

  const handleGenerateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genTopic.trim() && pendingSources.length === 0 && !youtubeUrlInput.trim() && !webUrlInput.trim()) {
      setUploadStatus({ type: 'err', message: 'Please enter a topic, upload a PDF/document, or add a YouTube/Web link.' });
      return;
    }

    setGenerating(true);
    setPipelineStepIdx(0);
    setUploadStatus(null);

    const stepInterval = window.setInterval(() => {
      setPipelineStepIdx((prev) => (prev < PIPELINE_STEP_LABELS.length - 1 ? prev + 1 : prev));
    }, 350);

    try {
      const sourcesPayload: any[] = [...pendingSources];
      if (youtubeUrlInput.trim()) {
        sourcesPayload.push({
          sourceType: 'youtube',
          title: `YouTube Lecture (${youtubeUrlInput.trim()})`,
          url: youtubeUrlInput.trim(),
          content: genSourceText.trim() || undefined
        });
      }
      if (webUrlInput.trim()) {
        sourcesPayload.push({
          sourceType: 'web',
          title: `Web Article (${webUrlInput.trim()})`,
          url: webUrlInput.trim(),
          content: genSourceText.trim() || undefined
        });
      }

      const effectiveTopic =
        genTopic.trim() ||
        sourcesPayload[0]?.title ||
        'Comprehensive Study Notebook';

      const created = await apiFetch('/api/notes/generate', {
        method: 'POST',
        body: JSON.stringify({
          topic: effectiveTopic,
          subject: genSubject,
          depth: genDepth,
          sourceText: genSourceText,
          sourceType: sourcesPayload.length > 0 ? sourcesPayload[0].sourceType : genSourceText ? 'txt' : 'topic',
          sources: sourcesPayload.length > 0 ? sourcesPayload : undefined
        })
      });

      await setTopicContext(created.topic, created.subject);
      setShowGenerator(false);
      setGenSourceText('');
      setYoutubeUrlInput('');
      setWebUrlInput('');
      setPendingSources([]);
      triggerRefresh();
      selectNoteForEditing(created);
      setActiveTab('notebook');
    } catch (err: any) {
      setUploadStatus({ type: 'err', message: err?.message || 'Failed to generate notebook.' });
    } finally {
      window.clearInterval(stepInterval);
      setGenerating(false);
    }
  };

  const handleSaveNote = async () => {
    if (!activeNote) return;
    setSaveStatus('saving');
    try {
      const updated = await apiFetch(`/api/notes/${activeNote.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: editTitle,
          subject: editSubject,
          notebook: editNotebook,
          content_markdown: editMarkdown,
          structured: editStructured
        })
      });
      setActiveNote(updated);
      setSaveStatus('saved');
      triggerRefresh();
    } catch {
      setSaveStatus('error');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this notebook?')) return;
    await apiFetch(`/api/notes/${noteId}`, { method: 'DELETE' });
    setActiveNote(null);
    triggerRefresh();
  };

  // White-Page Notebook Section & Visual Editing Handlers
  const handleUpdateSectionField = (idx: number, field: 'heading' | 'body' | 'plainExplanation', value: string) => {
    if (!editStructured) return;
    pushUndoSnapshot();
    const next = JSON.parse(JSON.stringify(editStructured));
    if (!Array.isArray(next.sections)) next.sections = [];
    if (next.sections[idx]) {
      next.sections[idx][field] = value;
      if (field === 'body') {
        next.sections[idx].plainExplanation = value;
      }
    }
    setEditStructured(next);
    scheduleAutosave(editTitle, editSubject, editNotebook, editMarkdown, next);
  };

  const handleAddSection = () => {
    if (!editStructured) return;
    pushUndoSnapshot();
    const next = JSON.parse(JSON.stringify(editStructured));
    if (!Array.isArray(next.sections)) next.sections = [];
    const newSecNum = next.sections.length + 1;
    next.sections.push({
      id: `sec-custom-${Date.now()}`,
      heading: `${newSecNum}. Additional Study Section`,
      body: 'Write your custom notes, examples, or classroom takeaways here.',
      plainExplanation: 'Write your custom notes, examples, or classroom takeaways here.',
      keyPoints: ['Important concept takeaway'],
      terms: [],
      citations: ['[Student Custom Section]']
    });
    setEditStructured(next);
    setEditingSectionIdx(next.sections.length - 1);
    scheduleAutosave(editTitle, editSubject, editNotebook, editMarkdown, next);
  };

  const handleDeleteSection = (idx: number) => {
    if (!editStructured?.sections) return;
    pushUndoSnapshot();
    const next = JSON.parse(JSON.stringify(editStructured));
    next.sections.splice(idx, 1);
    setEditStructured(next);
    setEditingSectionIdx(null);
    scheduleAutosave(editTitle, editSubject, editNotebook, editMarkdown, next);
  };

  const handleMoveImage = (idx: number, direction: -1 | 1) => {
    if (!editStructured?.images) return;
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= editStructured.images.length) return;
    pushUndoSnapshot();
    const next = JSON.parse(JSON.stringify(editStructured));
    const temp = next.images[idx];
    next.images[idx] = next.images[targetIdx];
    next.images[targetIdx] = temp;
    setEditStructured(next);
    scheduleAutosave(editTitle, editSubject, editNotebook, editMarkdown, next);
  };

  const handleAddComparisonRow = () => {
    if (!editStructured) return;
    pushUndoSnapshot();
    const next = JSON.parse(JSON.stringify(editStructured));
    if (!next.differences) {
      next.differences = {
        title: `${editTitle} — Comparison Table`,
        columns: ['Feature / Criterion', 'Concept A', 'Concept B'],
        rows: []
      };
    }
    next.differences.rows.push(['New Criterion', 'Primary Mechanism Detail', 'Contrast / Secondary Detail']);
    setEditStructured(next);
    scheduleAutosave(editTitle, editSubject, editNotebook, editMarkdown, next);
  };

  const handleAddKeyNote = () => {
    if (!newKeyNoteText.trim() || !editStructured) return;
    pushUndoSnapshot();
    const next = JSON.parse(JSON.stringify(editStructured));
    if (!Array.isArray(next.summaryPoints)) next.summaryPoints = [];
    next.summaryPoints.push(newKeyNoteText.trim());
    setNewKeyNoteText('');
    setEditStructured(next);
    scheduleAutosave(editTitle, editSubject, editNotebook, editMarkdown, next);
  };

  // Source-Grounded Q&A Handler
  const handleAskSourceQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNote || !qaQuestion.trim()) return;
    setQaLoading(true);
    try {
      const response = await apiFetch(`/api/notes/${activeNote.id}/ask`, {
        method: 'POST',
        body: JSON.stringify({
          question: qaQuestion.trim(),
          selectedSourceIds
        })
      });
      setQaHistory((prev) => [response, ...prev]);
      setQaQuestion('');
    } catch (err: any) {
      setUploadStatus({ type: 'err', message: err?.message || 'Failed to answer question from notebook sources.' });
    } finally {
      setQaLoading(false);
    }
  };

  // Study Tools Generator Handler
  const handleGenerateStudyTools = async () => {
    if (!activeNote) return;
    setStudyToolsLoading(true);
    try {
      const res = await apiFetch(`/api/notes/${activeNote.id}/study-tools`, {
        method: 'POST',
        body: JSON.stringify({ toolType: 'all' })
      });
      setStudyToolsData(res);
      triggerRefresh();
    } catch (err: any) {
      setUploadStatus({ type: 'err', message: err?.message || 'Failed to generate study tools.' });
    } finally {
      setStudyToolsLoading(false);
    }
  };

  // Export Handler (HTML / PDF Print / DOC / Markdown)
  const handleExportFormat = async (format: 'html' | 'doc' | 'md') => {
    if (!activeNote) return;
    try {
      const res = await fetch(`/api/notes/${activeNote.id}/export?format=${format}`);
      const content = await res.text();
      const mimeType =
        format === 'html'
          ? 'text/html;charset=utf-8'
          : format === 'doc'
            ? 'application/msword;charset=utf-8'
            : 'text/markdown;charset=utf-8';
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${editTitle.replace(/[^a-zA-Z0-9_-]+/g, '_')}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Fallback client download for markdown
      const blob = new Blob([editMarkdown], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${editTitle.replace(/\s+/g, '_')}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleSwitchDesignMode = async (mode: string) => {
    if (!activeNote) return;
    const nextStructured = { ...(editStructured || {}), designMode: mode };
    setEditStructured(nextStructured);
    setActiveNote((prev: any) => ({ ...prev, design_mode: mode, structured: nextStructured }));
    try {
      await apiFetch(`/api/notes/${activeNote.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          design_mode: mode,
          structured: nextStructured
        })
      });
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  };

  const getDesignModeStyle = (mode: string): React.CSSProperties => {
    switch (mode) {
      case 'handwritten':
        return {
          background: '#FFFDF9',
          color: '#1E293B',
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #E2E8F0 31px, #E2E8F0 32px)',
          borderLeft: '6px solid #EF4444',
          borderRadius: 16,
          borderTop: '1px solid #E2E8F0',
          borderRight: '1px solid #E2E8F0',
          borderBottom: '1px solid #E2E8F0',
          boxShadow: '0 12px 32px rgba(17, 24, 39, 0.08)',
          padding: '36px 40px',
          fontFamily: "'Segoe Print', 'Comic Sans MS', cursive, sans-serif",
          lineHeight: 1.8
        };
      case 'infographic':
        return {
          background: '#F0F9FF',
          color: '#0F172A',
          borderRadius: 16,
          border: '2px solid #0284C7',
          boxShadow: '0 16px 36px rgba(2, 132, 199, 0.12)',
          padding: '36px 40px',
          fontFamily: 'Inter, system-ui, sans-serif',
          lineHeight: 1.7
        };
      case 'formula-sheet':
        return {
          background: '#F8FAFC',
          color: '#0F172A',
          borderRadius: 16,
          border: '2px solid #6366F1',
          boxShadow: '0 16px 36px rgba(99, 102, 241, 0.12)',
          padding: '36px 40px',
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Menlo', monospace",
          lineHeight: 1.7
        };
      case 'chapter-detailed':
      default:
        return {
          background: '#FFFFFF',
          color: '#111827',
          borderRadius: 16,
          border: '1px solid #D1D5DB',
          boxShadow: '0 12px 32px rgba(17, 24, 39, 0.08)',
          padding: '36px 40px',
          fontFamily: "Georgia, 'Times New Roman', serif",
          lineHeight: 1.72
        };
    }
  };

  const scrollToNotebookAnchor = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const categories = ['All', 'Science', 'Maths', 'English', 'Social Studies', 'Computer Science'];

  const structured = editStructured || activeNote?.structured || {};
  const currentDesignMode = editStructured?.designMode || activeNote?.design_mode || 'handwritten';
  const finalRevisionPage = structured?.finalRevisionPage || activeNote?.finalRevisionPage;
  const workedProblems: any[] = structured?.workedProblems || [];
  const sourceRecords: any[] = structured?.sourceRecords || [];
  const sections: any[] = structured?.sections || [];
  const images: any[] = structured?.images || [];
  const definitions: any[] = structured?.definitions || [];
  const abbreviations: any[] = structured?.abbreviations || [];
  const differences = structured?.differences;
  const formula = structured?.formula;
  const examQuestions: any[] = structured?.examQuestions || [];
  const sourceComparison = structured?.sourceComparison;
  const coverageVerification = structured?.coverageVerification;

  return (
    <div className="studyai-container">
      <TopBrandBar showBack />

      {/* Studio Header */}
      <section style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 42, height: 42, borderRadius: 14, background: '#FFF3E8', color: '#FF6A00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#202124' }}>AI Notes & Source-Grounded Notebook Studio</h1>
              <p style={{ fontSize: '0.86rem', color: '#6B7280' }}>
                Transform Topics, Long PDFs, YouTube Lectures & Web Articles into Illustrated White-Page Digital Notebooks
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" onClick={() => setShowGenerator((s) => !s)} className="btn-orange">
              <Sparkles size={16} />
              <span>{showGenerator ? 'Hide Source Studio' : '+ New Multi-Source Notebook'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Search & Category Pills */}
      <section style={{ marginBottom: 18 }}>
        <div className="glass-input-wrap" style={{ marginBottom: 12 }}>
          <Search size={18} color="#FF6A00" />
          <input
            className="glass-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notebooks, topics, definitions, or cited sources..."
            aria-label="Search notes"
          />
        </div>

        <div className="pill-row">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Multi-Source Import & Notebook Generator Card */}
      {showGenerator && (
        <section className="hero-glass-banner" style={{ padding: 22, marginBottom: 22 }}>
          <div style={{ marginBottom: 14 }}>
            <h2 style={{ fontSize: '1.12rem', fontWeight: 800, color: '#202124' }}>
              Create Source-Grounded Digital Notebook (Topic • PDF/DOCX • YouTube • Web Links)
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#4B5563' }}>
              Attach one or multiple sources. Every page, chapter, and timestamp is inventoried and converted into structured white-page notes with validated educational diagrams.
            </p>
          </div>

          <form onSubmit={handleGenerateNote} style={{ display: 'grid', gap: 14 }}>
            {/* Topic-First Universal Input */}
            <div>
              <div style={{ position: 'relative' }}>
                <input
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  placeholder="Enter any topic (e.g. Friction, Circular motion, Demand and supply, Macbeth, Journal entries, Photosynthesis)..."
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    borderRadius: 14,
                    border: '2px solid #FF6A00',
                    fontSize: '1rem',
                    fontWeight: 600,
                    background: '#FFFFFF',
                    boxShadow: '0 4px 14px rgba(255, 106, 0, 0.12)',
                    outline: 'none'
                  }}
                  aria-label="Universal Note Topic Input"
                />
                {classifyingTopic && (
                  <span style={{ position: 'absolute', right: 14, top: 14, fontSize: '0.78rem', color: '#EA580C', fontWeight: 700 }}>
                    Classifying topic...
                  </span>
                )}
              </div>

              {/* Live Universal Classification Preview Chips & Ambiguity Disambiguation */}
              {topicClassification?.classification && (
                <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 12, background: '#FFF7ED', border: '1px solid #FFEDD5', display: 'grid', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: '#9A3412' }}>
                        Auto-Recognized:
                      </span>
                      <span style={{ padding: '2px 8px', borderRadius: 999, background: '#FFEDD5', color: '#C2410C', fontWeight: 800, fontSize: '0.78rem' }}>
                        {topicClassification.classification.subject} ({topicClassification.classification.discipline})
                      </span>
                      <span style={{ padding: '2px 8px', borderRadius: 999, background: '#FFFFFF', border: '1px solid #FED7AA', color: '#374151', fontSize: '0.76rem', fontWeight: 600 }}>
                        Chapter: {topicClassification.classification.chapter}
                      </span>
                      <span style={{ padding: '2px 8px', borderRadius: 999, background: '#EFF6FF', color: '#1E40AF', fontSize: '0.76rem', fontWeight: 600 }}>
                        Medium: {topicClassification.classification.visualSpecification?.targetMedium}
                      </span>
                      <span style={{ padding: '2px 8px', borderRadius: 999, background: topicClassification.classification.requiresFormulas ? '#ECFDF5' : '#F3F4F6', color: topicClassification.classification.requiresFormulas ? '#047857' : '#4B5563', fontSize: '0.76rem', fontWeight: 700 }}>
                        {topicClassification.classification.requiresFormulas ? '🧮 Formulas & Numericals Required' : '🛡️ Anti-Hallucination Active (Zero Fake Formulas)'}
                      </span>
                    </div>
                    {topicClassification.studentProfile && (
                      <span style={{ fontSize: '0.72rem', color: '#6B7280', fontWeight: 600 }}>
                        Auto-profile: {topicClassification.studentProfile.grade} • {topicClassification.studentProfile.board}
                      </span>
                    )}
                  </div>

                  {/* Ambiguity Disambiguation Options */}
                  {topicClassification.classification.isAmbiguous && Array.isArray(topicClassification.classification.disambiguationOptions) && (
                    <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid #FED7AA' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#DC2626', marginBottom: 4 }}>
                        ⚠️ Multi-Discipline Topic Detected — Click to clarify focus:
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {topicClassification.classification.disambiguationOptions.map((opt: any, oIdx: number) => (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => {
                              setGenTopic(`${opt.subject}: ${opt.label || opt.discipline || opt.topic}`);
                              setGenSubject(opt.subject);
                            }}
                            style={{
                              padding: '4px 10px',
                              borderRadius: 999,
                              border: '1px solid #EA580C',
                              background: '#FFFFFF',
                              color: '#EA580C',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            + {opt.subject}: {opt.label || opt.discipline}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Optional Overrides (Auto-synced with classifier) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#6B7280', marginBottom: 4 }}>
                  Subject (Auto-detected, click to override)
                </label>
                <select
                  value={genSubject}
                  onChange={(e) => setGenSubject(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.12)', fontWeight: 600, background: '#FFFFFF' }}
                  aria-label="Note Subject"
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">General Science</option>
                  <option value="History">History</option>
                  <option value="Geography">Geography</option>
                  <option value="Civics">Civics / Political Science</option>
                  <option value="Economics">Economics</option>
                  <option value="English">English / Literature</option>
                  <option value="Computer Science">Computer Science / IT</option>
                  <option value="Accountancy">Accountancy / Commerce</option>
                  <option value="Business Studies">Business Studies</option>
                  <option value="Environmental Science">Environmental Science</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#6B7280', marginBottom: 4 }}>
                  Notebook Depth & Target
                </label>
                <select
                  value={genDepth}
                  onChange={(e) => setGenDepth(e.target.value as any)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.12)', fontWeight: 600, background: '#FFFFFF' }}
                  aria-label="Note Depth"
                >
                  <option value="detailed">Complete Illustrated Digital Notebook (with Revision Sheet)</option>
                  <option value="exam-prep">Board & Competitive Exam Master Sheet</option>
                  <option value="concise">High-Yield Revision Notebook</option>
                </select>
              </div>
            </div>

            {/* YouTube & Web Link Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#FFFFFF', padding: '0 12px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.12)' }}>
                  <Youtube size={18} color="#DC2626" />
                  <input
                    value={youtubeUrlInput}
                    onChange={(e) => setYoutubeUrlInput(e.target.value)}
                    placeholder="Paste YouTube Lecture URL (https://youtube.com/watch?v=...)"
                    style={{ width: '100%', padding: '10px 0', border: 'none', outline: 'none', fontSize: '0.85rem' }}
                  />
                </div>
                <button type="button" onClick={handleAddYouTubeSource} className="btn-glass" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
                  + Add Video
                </button>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#FFFFFF', padding: '0 12px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.12)' }}>
                  <Globe size={18} color="#0284C7" />
                  <input
                    value={webUrlInput}
                    onChange={(e) => setWebUrlInput(e.target.value)}
                    placeholder="Paste Educational Web Article URL (https://...)"
                    style={{ width: '100%', padding: '10px 0', border: 'none', outline: 'none', fontSize: '0.85rem' }}
                  />
                </div>
                <button type="button" onClick={handleAddWebSource} className="btn-glass" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
                  + Add Link
                </button>
              </div>
            </div>

            <textarea
              value={genSourceText}
              onChange={(e) => setGenSourceText(e.target.value)}
              rows={3}
              placeholder="Optional: Paste full chapter text, timestamped lecture transcript (e.g. [00:00] Intro...), or multi-page document excerpt..."
              style={{ width: '100%', padding: 12, borderRadius: 14, border: '1px solid rgba(0,0,0,0.12)', fontFamily: 'inherit', fontSize: '0.88rem', background: '#FFFFFF' }}
            />

            {/* Queued Multi-Sources List */}
            {pendingSources.length > 0 && (
              <div style={{ padding: 12, borderRadius: 14, background: '#FFFFFF', border: '1px solid rgba(255,106,0,0.25)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#EA580C', textTransform: 'uppercase', marginBottom: 8 }}>
                  Attached Notebook Sources ({pendingSources.length}) — Multi-Source Synthesis & Contradiction Detection Active
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {pendingSources.map((src) => (
                    <div
                      key={src.id}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 12px',
                        borderRadius: 999,
                        background: '#FFF3E8',
                        border: '1px solid rgba(255,106,0,0.3)',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: '#111827'
                      }}
                    >
                      <span>[{src.sourceType.toUpperCase()}] {src.title}</span>
                      <button
                        type="button"
                        onClick={() => setPendingSources((prev) => prev.filter((p) => p.id !== src.id))}
                        style={{ border: 'none', background: 'transparent', color: '#DC2626', cursor: 'pointer', fontWeight: 800 }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 10-Step Pipeline Progress Bar during Generation */}
            {generating && (
              <div style={{ padding: 14, borderRadius: 14, background: '#FFFFFF', border: '1.5px solid #FF6A00' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.82rem', fontWeight: 800, color: '#EA580C' }}>
                  <span>Running 10-Step Source-to-Notebook Pipeline...</span>
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

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <label className="btn-glass" style={{ cursor: 'pointer' }}>
                <Upload size={15} />
                <span>Upload PDF / DOCX / PPTX / TXT / MD</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.pptx,.txt,.md,.csv,.json"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>

              <button type="submit" className="btn-orange" disabled={generating}>
                <Sparkles size={16} />
                <span>{generating ? 'Building White-Page Notebook...' : 'Generate Complete Digital Notebook'}</span>
              </button>
            </div>
          </form>
        </section>
      )}

      {uploadStatus && (
        <div
          style={{
            marginBottom: 18,
            padding: '10px 14px',
            borderRadius: 12,
            background: uploadStatus.type === 'ok' ? '#ECFDF5' : '#FEF2F2',
            color: uploadStatus.type === 'ok' ? '#047857' : '#DC2626',
            fontSize: '0.84rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          {uploadStatus.type === 'ok' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{uploadStatus.message}</span>
        </div>
      )}

      {/* Main Split Workspace: Saved Notebooks Sidebar + Dedicated White-Page Digital Notebook */}
      <div className="dashboard-grid">
        {/* Left Sidebar: Saved Notebooks + Quick Study Actions */}
        <div style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
          <section className="glass-card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: '1.02rem', fontWeight: 800 }}>Saved Notebooks ({notes.length})</h3>
              <span style={{ fontSize: '0.75rem', color: '#15803D', fontWeight: 700 }}>✓ SQLite Synced</span>
            </div>

            {loading ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#6B7280' }}>Loading saved notebooks...</div>
            ) : notes.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#6B7280', fontSize: '0.88rem' }}>
                No notebooks match your filter. Click "+ New Multi-Source Notebook" above!
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 10, maxHeight: 420, overflowY: 'auto' }}>
                {notes.map((n) => {
                  const isSelected = activeNote?.id === n.id;
                  const imgCount = n.structured?.images?.length || (n.structured?.imageUrl ? 1 : 0);
                  const srcCount = n.structured?.sourceRecords?.length || 1;
                  return (
                    <div
                      key={n.id}
                      onClick={() => selectNoteForEditing(n)}
                      className="glass-card-interactive"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: 16,
                        background: isSelected ? '#FFF3E8' : '#FFFFFF',
                        border: isSelected ? '2px solid #FF6A00' : '1px solid rgba(0,0,0,0.06)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 12,
                            background: isSelected ? '#FF6A00' : '#FFF3E8',
                            color: isSelected ? '#FFFFFF' : '#FF6A00',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800
                          }}
                        >
                          <FileText size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111827' }}>{n.title}</div>
                          <div style={{ fontSize: '0.74rem', color: '#6B7280' }}>
                            {n.subject} • {srcCount} source(s) • {imgCount} diagram(s)
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={16} color="#9CA3AF" />
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Notebook Tools & Export Studio */}
          <section className="glass-card" style={{ padding: 18 }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 800, marginBottom: 10 }}>Notebook Actions & Export</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              <button
                type="button"
                onClick={() => setActiveTab('ask-sources')}
                className="quick-tile"
              >
                <MessageSquare size={18} color="#FF6A00" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Ask Sources (Q&A)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('study-tools');
                  if (!studyToolsData) handleGenerateStudyTools();
                }}
                className="quick-tile"
              >
                <GraduationCap size={18} color="#7C3AED" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Study Guide & Quiz</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('flashcards')}
                className="quick-tile"
              >
                <Layers size={18} color="#D97706" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Flashcards ({activeNote?.flashcards?.length || 0})</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  startAudioLesson({
                    topic: activeNote?.title || activeTopic,
                    text:
                      structured?.simpleIntroduction
                        ? `${activeNote?.title}. ${structured.simpleIntroduction}. ${(structured.summaryPoints || []).join(' ')}`
                        : editMarkdown.replace(/[#*`]/g, '')
                  })
                }
                className="quick-tile"
              >
                <Volume2 size={18} color="#0284C7" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Audio Overview</span>
              </button>
              <button
                type="button"
                onClick={() => handleExportFormat('html')}
                className="quick-tile"
              >
                <Printer size={18} color="#16A34A" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Export White-Page HTML/PDF</span>
              </button>
              <button
                type="button"
                onClick={() => handleExportFormat('doc')}
                className="quick-tile"
              >
                <Download size={18} color="#EA580C" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Export Word (.doc)</span>
              </button>
            </div>
          </section>
        </div>

        {/* Right: Dedicated White-Page Digital Notebook Canvas & Grounded Workspace */}
        <section style={{ minWidth: 0 }}>
          {!activeNote ? (
            <div className="glass-card" style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>
              Select a saved notebook on the left or click "+ New Multi-Source Notebook" to generate one.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 14 }}>
              {/* Top Workspace Control Bar */}
              <div
                className="glass-card"
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10
                }}
              >
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {(
                    [
                      { id: 'notebook', label: '📖 White-Page Notebook' },
                      { id: 'ask-sources', label: `💬 Ask Sources (${sourceRecords.length || 1})` },
                      { id: 'study-tools', label: '🎓 Study Guide & Audio' },
                      { id: 'flashcards', label: `🗂️ Flashcards (${activeNote.flashcards?.length || 0})` },
                      { id: 'editor', label: '✏️ Raw Markdown' }
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id);
                        if (tab.id === 'study-tools' && !studyToolsData) {
                          handleGenerateStudyTools();
                        }
                      }}
                      style={{
                        padding: '7px 13px',
                        borderRadius: 999,
                        border: 'none',
                        background: activeTab === tab.id ? '#FF6A00' : '#FFF3E8',
                        color: activeTab === tab.id ? '#FFFFFF' : '#E85D00',
                        fontWeight: 700,
                        fontSize: '0.79rem',
                        cursor: 'pointer'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Undo / Redo / Save / Export Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={historyStack.length === 0}
                    className="btn-glass"
                    style={{ padding: '6px 10px', opacity: historyStack.length === 0 ? 0.45 : 1 }}
                    title="Undo"
                  >
                    <Undo2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={handleRedo}
                    disabled={redoStack.length === 0}
                    className="btn-glass"
                    style={{ padding: '6px 10px', opacity: redoStack.length === 0 ? 0.45 : 1 }}
                    title="Redo"
                  >
                    <Redo2 size={14} />
                  </button>

                  {saveStatus === 'saved' && (
                    <span style={{ fontSize: '0.76rem', color: '#15803D', fontWeight: 700 }}>✓ Saved</span>
                  )}
                  {saveStatus === 'saving' && (
                    <span style={{ fontSize: '0.76rem', color: '#D97706', fontWeight: 700 }}>Autosaving...</span>
                  )}
                  {saveStatus === 'error' && (
                    <span style={{ fontSize: '0.76rem', color: '#DC2626', fontWeight: 700 }}>Save error</span>
                  )}

                  <button type="button" onClick={handleSaveNote} className="btn-orange" style={{ padding: '7px 14px', fontSize: '0.8rem' }}>
                    <Save size={14} />
                    <span>Save Notebook</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExportFormat('md')}
                    className="btn-glass"
                    style={{ padding: '7px 10px', fontSize: '0.78rem' }}
                    title="Download Markdown (.md)"
                  >
                    .MD
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteNote(activeNote.id)}
                    className="btn-glass"
                    style={{ padding: '7px 10px', color: '#DC2626' }}
                    aria-label="Delete Note"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* =====================================================================
                  TAB 1: DEDICATED WHITE-PAGE DIGITAL NOTEBOOK EDITOR
                  ===================================================================== */}
              {activeTab === 'notebook' && (
                <div
                  id="white-page-notebook-sheet"
                  style={getDesignModeStyle(currentDesignMode)}
                >
                  {/* White-Page Document Header & Editable Title */}
                  <header style={{ borderBottom: '2px solid #111827', paddingBottom: 18, marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8, fontFamily: 'Inter, system-ui, sans-serif' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 4, background: '#F3F4F6', color: '#111827', fontSize: '0.73rem', fontWeight: 800, textTransform: 'uppercase' }}>
                          {editSubject} Notebook
                        </span>
                        {coverageVerification && (
                          <span style={{ padding: '3px 10px', borderRadius: 4, background: '#ECFDF5', color: '#047857', fontSize: '0.73rem', fontWeight: 800 }}>
                            ✓ {coverageVerification.coveragePercent || 100}% Source Coverage Verified ({coverageVerification.processedSourceUnits || 1}/{coverageVerification.totalSourceUnits || 1} units)
                          </span>
                        )}
                        {structured?.providerName && (
                          <span style={{ padding: '3px 10px', borderRadius: 4, background: '#EFF6FF', color: '#1D4ED8', fontSize: '0.73rem', fontWeight: 700 }}>
                            Synthesized via {structured.providerName}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => navigate(`/tutor?topic=${encodeURIComponent(activeNote.topic || editTitle)}`)}
                          style={{
                            padding: '5px 11px',
                            borderRadius: 6,
                            border: '1px solid #D1D5DB',
                            background: '#FFFFFF',
                            color: '#111827',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5
                          }}
                        >
                          <ExternalLink size={12} />
                          <span>Open in AI Tutor</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => window.print()}
                          style={{
                            padding: '5px 11px',
                            borderRadius: 6,
                            border: '1px solid #D1D5DB',
                            background: '#FFFFFF',
                            color: '#111827',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5
                          }}
                        >
                          <Printer size={12} />
                          <span>Print White Page</span>
                        </button>
                      </div>
                    </div>

                    {/* 4 Reference-Based Design Modes Switcher */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 10, marginBottom: 12 }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Design Mode:
                      </span>
                      {[
                        { id: 'handwritten', label: '📝 Classroom Handwritten', desc: 'Warm lined notebook with handwritten style' },
                        { id: 'infographic', label: '🔬 Scientific Infographic', desc: 'Vibrant modern callouts and tech diagrams' },
                        { id: 'formula-sheet', label: '📐 Formula Revision Sheet', desc: 'High-contrast monospace formulas and cards' },
                        { id: 'chapter-detailed', label: '📚 Detailed Chapter Notes', desc: 'Textbook multi-section layout' }
                      ].map((dm) => (
                        <button
                          key={dm.id}
                          type="button"
                          onClick={() => handleSwitchDesignMode(dm.id)}
                          style={{
                            padding: '4px 11px',
                            borderRadius: 20,
                            border: currentDesignMode === dm.id ? '2px solid #FF6A00' : '1px solid #D1D5DB',
                            background: currentDesignMode === dm.id ? '#FFF3E8' : '#FFFFFF',
                            color: currentDesignMode === dm.id ? '#EA580C' : '#374151',
                            fontWeight: currentDesignMode === dm.id ? 800 : 600,
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                          title={dm.desc}
                        >
                          {dm.label}
                        </button>
                      ))}
                    </div>

                    <input
                      value={editTitle}
                      onChange={(e) => {
                        pushUndoSnapshot();
                        setEditTitle(e.target.value);
                        scheduleAutosave(e.target.value, editSubject, editNotebook, editMarkdown, editStructured);
                      }}
                      aria-label="Note Title"
                      style={{
                        width: '100%',
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        fontSize: '1.85rem',
                        fontWeight: 800,
                        color: '#111827',
                        fontFamily: "Georgia, 'Times New Roman', serif",
                        padding: '4px 0'
                      }}
                    />

                    {/* Keywords Row */}
                    {structured?.keywords?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8, fontFamily: 'Inter, system-ui, sans-serif' }}>
                        {structured.keywords.map((kw: string) => (
                          <span
                            key={kw}
                            style={{
                              padding: '2px 9px',
                              borderRadius: 4,
                              background: '#F9FAFB',
                              border: '1px solid #E5E7EB',
                              color: '#374151',
                              fontSize: '0.74rem',
                              fontWeight: 600
                            }}
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </header>

                  {/* Table of Contents (TOC) Quick Jump Bar */}
                  <nav
                    aria-label="Notebook Table of Contents"
                    style={{
                      background: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      borderRadius: 10,
                      padding: '12px 16px',
                      marginBottom: 26,
                      fontFamily: 'Inter, system-ui, sans-serif'
                    }}
                  >
                    <div style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: '#4B5563', marginBottom: 8 }}>
                      Table of Contents — Click to Jump to Section
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {[
                        { id: 'nb-overview', label: '1. Overview & Objectives' },
                        { id: 'nb-definitions', label: `2. Definitions (${definitions.length})` },
                        { id: 'nb-abbreviations', label: `3. Full Forms (${abbreviations.length})` },
                        { id: 'nb-sections', label: `4. Detailed Topic Notes (${sections.length})` },
                        { id: 'nb-images', label: `5. Visual Diagrams (${images.length})` },
                        { id: 'nb-comparison', label: '6. Comparison Table' },
                        { id: 'nb-formula', label: '7. Formulas & Examples' },
                        { id: 'nb-exam', label: `8. Exam Q&A (${examQuestions.length})` },
                        ...(sourceComparison ? [{ id: 'nb-multisource', label: '9. Multi-Source Comparison' }] : []),
                        { id: 'nb-sources', label: '10. Source Inventory & Citations' },
                        ...(finalRevisionPage ? [{ id: 'nb-final-revision', label: '🏆 Final Comprehensive Revision Page' }] : [])
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => scrollToNotebookAnchor(item.id)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: 6,
                            border: '1px solid #D1D5DB',
                            background: '#FFFFFF',
                            color: '#111827',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </nav>

                  {/* Notebook Editor Toolbar (Add Section, Add Table Row, Add Highlight) */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 8,
                      alignItems: 'center',
                      padding: '10px 14px',
                      borderRadius: 8,
                      background: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      marginBottom: 26,
                      fontFamily: 'Inter, system-ui, sans-serif'
                    }}
                  >
                    <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#374151', marginRight: 4 }}>
                      Notebook Tools:
                    </span>
                    <button
                      type="button"
                      onClick={handleAddSection}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 6,
                        border: '1px solid #D1D5DB',
                        background: '#FFFFFF',
                        color: '#111827',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <Plus size={13} />
                      <span>Add Section</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAddComparisonRow}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 6,
                        border: '1px solid #D1D5DB',
                        background: '#FFFFFF',
                        color: '#111827',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <Table size={13} />
                      <span>Add Table Row</span>
                    </button>
                    <div style={{ display: 'flex', gap: 6, flex: 1, minWidth: 220 }}>
                      <input
                        value={newKeyNoteText}
                        onChange={(e) => setNewKeyNoteText(e.target.value)}
                        placeholder="Add custom highlight or revision takeaway..."
                        style={{
                          flex: 1,
                          padding: '5px 10px',
                          borderRadius: 6,
                          border: '1px solid #D1D5DB',
                          fontSize: '0.76rem'
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddKeyNote}
                        style={{
                          padding: '5px 10px',
                          borderRadius: 6,
                          border: '1px solid #111827',
                          background: '#111827',
                          color: '#FFFFFF',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        + Add Takeaway
                      </button>
                    </div>
                  </div>

                  {/* SECTION 1: OVERVIEW, SIMPLE EXPLANATION & LEARNING OBJECTIVES */}
                  <section id="nb-overview" style={{ marginBottom: 30 }}>
                    <h2 style={{ fontSize: '1.28rem', fontWeight: 800, color: '#111827', borderBottom: '1px solid #E5E7EB', paddingBottom: 6, marginBottom: 12 }}>
                      1. Simple Introduction & Learning Objectives
                    </h2>
                    <p style={{ fontSize: '1rem', color: '#1F2937', marginBottom: 14 }}>
                      {structured?.simpleIntroduction || structured?.overview || activeNote.summary}
                    </p>
                    {structured?.plainLanguageOverview && structured.plainLanguageOverview !== structured.simpleIntroduction && (
                      <div style={{ padding: '12px 16px', background: '#F9FAFB', borderLeft: '4px solid #111827', borderRadius: 6, marginBottom: 14 }}>
                        <strong style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '0.82rem', textTransform: 'uppercase', color: '#374151' }}>
                          Intuitive Everyday Analogy:
                        </strong>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.95rem', color: '#1F2937' }}>{structured.plainLanguageOverview}</p>
                      </div>
                    )}

                    {Array.isArray(structured?.learningObjectives) && structured.learningObjectives.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', color: '#374151', marginBottom: 6 }}>
                          Learning Objectives
                        </div>
                        <ul style={{ margin: 0, paddingLeft: 22 }}>
                          {structured.learningObjectives.map((obj: string, i: number) => (
                            <li key={i} style={{ marginBottom: 4, color: '#111827', fontSize: '0.95rem' }}>
                              {obj}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </section>

                  {/* SECTION 2: CORE DEFINITIONS */}
                  {definitions.length > 0 && (
                    <section id="nb-definitions" style={{ marginBottom: 30 }}>
                      <h2 style={{ fontSize: '1.28rem', fontWeight: 800, color: '#111827', borderBottom: '1px solid #E5E7EB', paddingBottom: 6, marginBottom: 12 }}>
                        2. Important Terms & Definitions
                      </h2>
                      <div style={{ display: 'grid', gap: 10 }}>
                        {definitions.map((d: any, idx: number) => (
                          <div key={idx} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#FFFFFF' }}>
                            <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#111827' }}>{d.term}</div>
                            <div style={{ fontSize: '0.94rem', color: '#1F2937', marginTop: 2 }}>{d.definition || d.meaning}</div>
                            {d.simpleExplanation && d.simpleExplanation !== (d.definition || d.meaning) && (
                              <div style={{ fontSize: '0.86rem', color: '#4B5563', marginTop: 4, fontStyle: 'italic' }}>
                                Plain-language note: {d.simpleExplanation}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* SECTION 3: FULL FORMS & ABBREVIATIONS GLOSSARY */}
                  {abbreviations.length > 0 && (
                    <section id="nb-abbreviations" style={{ marginBottom: 30 }}>
                      <h2 style={{ fontSize: '1.28rem', fontWeight: 800, color: '#111827', borderBottom: '1px solid #E5E7EB', paddingBottom: 6, marginBottom: 12 }}>
                        3. Full Forms & Scientific Abbreviations
                      </h2>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Inter, system-ui, sans-serif', fontSize: '0.88rem' }}>
                          <thead>
                            <tr style={{ background: '#F3F4F6', textAlign: 'left' }}>
                              <th style={{ padding: '10px 12px', border: '1px solid #D1D5DB', fontWeight: 800, color: '#111827' }}>Abbreviation</th>
                              <th style={{ padding: '10px 12px', border: '1px solid #D1D5DB', fontWeight: 800, color: '#111827' }}>Full Expanded Form</th>
                              <th style={{ padding: '10px 12px', border: '1px solid #D1D5DB', fontWeight: 800, color: '#111827' }}>Simple Meaning & Role</th>
                            </tr>
                          </thead>
                          <tbody>
                            {abbreviations.map((item: any, idx: number) => (
                              <tr key={idx} style={{ background: idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB' }}>
                                <td style={{ padding: '9px 12px', border: '1px solid #D1D5DB', fontWeight: 800, color: '#111827' }}>
                                  {item.abbr || item.shortForm}
                                </td>
                                <td style={{ padding: '9px 12px', border: '1px solid #D1D5DB', fontWeight: 700, color: '#1F2937' }}>
                                  {item.fullForm}
                                </td>
                                <td style={{ padding: '9px 12px', border: '1px solid #D1D5DB', color: '#374151' }}>
                                  {item.simpleDefinition || item.meaning || item.simpleMeaning}
                                  {item.roleInTopic ? ` (${item.roleInTopic})` : ''}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  )}

                  {/* SECTION 4: DETAILED NUMBERED SECTIONS WITH INLINE CITATIONS & EDITING */}
                  <section id="nb-sections" style={{ marginBottom: 32 }}>
                    <h2 style={{ fontSize: '1.28rem', fontWeight: 800, color: '#111827', borderBottom: '1px solid #E5E7EB', paddingBottom: 6, marginBottom: 16 }}>
                      4. Detailed Topic & Source-Grounded Sections
                    </h2>

                    <div style={{ display: 'grid', gap: 22 }}>
                      {sections.map((sec: any, idx: number) => {
                        const isEditing = editingSectionIdx === idx;
                        const pairedImage = images[idx];
                        const headingVal = sec.heading || sec.title || `Section ${idx + 1}`;
                        const bodyVal = sec.body || sec.detailedExplanation || '';
                        const citationsList =
                          Array.isArray(sec.citations) && sec.citations.length > 0
                            ? sec.citations
                            : Array.isArray(sec.sourceCitations)
                              ? sec.sourceCitations.map((c: any) => `[${c.sourceTitle}, ${c.locator}]`)
                              : [];
                        return (
                          <article
                            key={sec.id || idx}
                            id={`nb-sec-${idx + 1}`}
                            style={{
                              padding: '18px 20px',
                              borderRadius: 10,
                              border: '1px solid #E5E7EB',
                              background: '#FFFFFF'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                              {isEditing ? (
                                <input
                                  value={headingVal}
                                  onChange={(e) => handleUpdateSectionField(idx, 'heading', e.target.value)}
                                  style={{
                                    flex: 1,
                                    padding: '6px 10px',
                                    fontSize: '1.1rem',
                                    fontWeight: 800,
                                    border: '1px solid #111827',
                                    borderRadius: 6
                                  }}
                                />
                              ) : (
                                <h3 style={{ fontSize: '1.12rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                                  {headingVal}
                                </h3>
                              )}

                              <div style={{ display: 'flex', gap: 6, fontFamily: 'Inter, system-ui, sans-serif' }}>
                                <button
                                  type="button"
                                  onClick={() => setEditingSectionIdx(isEditing ? null : idx)}
                                  style={{
                                    padding: '4px 9px',
                                    borderRadius: 6,
                                    border: '1px solid #D1D5DB',
                                    background: isEditing ? '#111827' : '#FFFFFF',
                                    color: isEditing ? '#FFFFFF' : '#374151',
                                    fontSize: '0.73rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4
                                  }}
                                >
                                  <Edit3 size={12} />
                                  <span>{isEditing ? 'Done' : 'Edit Section'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    navigate(`/tutor?topic=${encodeURIComponent(`${activeNote.topic || editTitle}: ${headingVal}`)}`)
                                  }
                                  style={{
                                    padding: '4px 9px',
                                    borderRadius: 6,
                                    border: '1px solid #D1D5DB',
                                    background: '#F9FAFB',
                                    color: '#111827',
                                    fontSize: '0.73rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Ask AI Tutor
                                </button>
                                {sections.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSection(idx)}
                                    style={{
                                      padding: '4px 8px',
                                      borderRadius: 6,
                                      border: '1px solid #FECACA',
                                      background: '#FEF2F2',
                                      color: '#DC2626',
                                      fontSize: '0.73rem',
                                      fontWeight: 700,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Source / Page / Timestamp Citation Badges */}
                            {citationsList.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10, fontFamily: 'Inter, system-ui, sans-serif' }}>
                                {citationsList.map((cit: string, cIdx: number) => (
                                  <span
                                    key={cIdx}
                                    style={{
                                      padding: '2px 8px',
                                      borderRadius: 4,
                                      background: '#F3F4F6',
                                      color: '#374151',
                                      fontSize: '0.72rem',
                                      fontWeight: 700
                                    }}
                                  >
                                    📌 {cit}
                                  </span>
                                ))}
                              </div>
                            )}

                            {isEditing ? (
                              <textarea
                                value={bodyVal}
                                onChange={(e) => handleUpdateSectionField(idx, 'body', e.target.value)}
                                rows={5}
                                style={{
                                  width: '100%',
                                  padding: 10,
                                  borderRadius: 8,
                                  border: '1px solid #111827',
                                  fontFamily: 'inherit',
                                  fontSize: '0.96rem',
                                  lineHeight: 1.65,
                                  marginBottom: 10
                                }}
                              />
                            ) : (
                              <p style={{ fontSize: '0.98rem', color: '#111827', margin: '0 0 10px 0', whiteSpace: 'pre-line' }}>
                                {bodyVal}
                              </p>
                            )}

                            {Array.isArray(sec.keyPoints) && sec.keyPoints.length > 0 && (
                              <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
                                {sec.keyPoints.map((kp: string, kIdx: number) => (
                                  <li key={kIdx} style={{ fontSize: '0.92rem', color: '#374151', marginBottom: 4 }}>
                                    {kp}
                                  </li>
                                ))}
                              </ul>
                            )}

                            {/* Inline Section-Paired Diagram Preview */}
                            {pairedImage && (
                              <figure
                                style={{
                                  margin: '16px 0 4px 0',
                                  padding: 14,
                                  borderRadius: 8,
                                  border: '1px solid #D1D5DB',
                                  background: '#FAFAFA'
                                }}
                              >
                                <img
                                  src={pairedImage.imageUrl}
                                  alt={pairedImage.altText || pairedImage.title}
                                  style={{ width: '100%', maxHeight: 300, objectFit: 'contain', display: 'block', background: '#FFFFFF', borderRadius: 6 }}
                                />
                                <figcaption style={{ marginTop: 8, fontSize: '0.84rem', color: '#374151', fontFamily: 'Inter, system-ui, sans-serif' }}>
                                  <strong>{pairedImage.title}:</strong> {pairedImage.caption}
                                </figcaption>
                              </figure>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  </section>

                  {/* SECTION 5: EDUCATIONAL DIAGRAMS & 7-PART IMAGE WALKTHROUGHS */}
                  {images.length > 0 && (
                    <section id="nb-images" style={{ marginBottom: 32 }}>
                      <h2 style={{ fontSize: '1.28rem', fontWeight: 800, color: '#111827', borderBottom: '1px solid #E5E7EB', paddingBottom: 6, marginBottom: 16 }}>
                        5. Educational Visual Diagrams & Step-by-Step Image Walkthroughs ({images.length})
                      </h2>
                      <div style={{ display: 'grid', gap: 20 }}>
                        {images.map((img: any, idx: number) => {
                          const exp = img.explanation || {};
                          return (
                            <div
                              key={img.id || idx}
                              style={{
                                padding: 18,
                                borderRadius: 10,
                                border: '1px solid #D1D5DB',
                                background: '#FFFFFF'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 10, fontFamily: 'Inter, system-ui, sans-serif' }}>
                                <div>
                                  <span style={{ fontSize: '0.73rem', fontWeight: 800, textTransform: 'uppercase', color: '#4B5563' }}>
                                    Figure {idx + 1} • {img.provider || 'Programmatic Scientific SVG Diagram Renderer'}
                                  </span>
                                  <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#111827', margin: '2px 0 0 0' }}>
                                    {img.title}
                                  </h3>
                                </div>

                                <div style={{ display: 'flex', gap: 6 }}>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveImage(idx, -1)}
                                    disabled={idx === 0}
                                    style={{
                                      padding: '4px 8px',
                                      borderRadius: 6,
                                      border: '1px solid #D1D5DB',
                                      background: '#FFFFFF',
                                      cursor: idx === 0 ? 'not-allowed' : 'pointer',
                                      opacity: idx === 0 ? 0.4 : 1
                                    }}
                                    title="Move Diagram Up"
                                  >
                                    <ArrowUp size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveImage(idx, 1)}
                                    disabled={idx === images.length - 1}
                                    style={{
                                      padding: '4px 8px',
                                      borderRadius: 6,
                                      border: '1px solid #D1D5DB',
                                      background: '#FFFFFF',
                                      cursor: idx === images.length - 1 ? 'not-allowed' : 'pointer',
                                      opacity: idx === images.length - 1 ? 0.4 : 1
                                    }}
                                    title="Move Diagram Down"
                                  >
                                    <ArrowDown size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      navigate(`/tutor?topic=${encodeURIComponent(`${activeNote.topic || editTitle} — ${img.title}`)}`)
                                    }
                                    style={{
                                      padding: '4px 10px',
                                      borderRadius: 6,
                                      border: '1px solid #111827',
                                      background: '#111827',
                                      color: '#FFFFFF',
                                      fontSize: '0.73rem',
                                      fontWeight: 700,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Explain in AI Tutor
                                  </button>
                                </div>
                              </div>

                              <div style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: 12, background: '#FFFFFF', marginBottom: 12 }}>
                                <img
                                  src={img.imageUrl}
                                  alt={img.altText || img.title}
                                  style={{ width: '100%', maxHeight: 340, objectFit: 'contain', display: 'block' }}
                                />
                              </div>

                              <p style={{ fontSize: '0.9rem', color: '#374151', marginBottom: 10 }}>
                                <strong>Caption:</strong> {img.caption}
                              </p>

                              {/* 7-Part Structured Image Walkthrough */}
                              <div
                                style={{
                                  display: 'grid',
                                  gap: 6,
                                  padding: 14,
                                  borderRadius: 8,
                                  background: '#F9FAFB',
                                  border: '1px solid #E5E7EB',
                                  fontFamily: 'Inter, system-ui, sans-serif',
                                  fontSize: '0.84rem',
                                  color: '#1F2937'
                                }}
                              >
                                <div style={{ fontWeight: 800, color: '#111827', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                                  How to Read This Visual Diagram (7-Part Walkthrough)
                                </div>
                                {exp.whatItShows && <div><strong>1. What this shows:</strong> {exp.whatItShows}</div>}
                                {Array.isArray(exp.majorParts) && exp.majorParts.length > 0 && (
                                  <div><strong>2. Major labeled parts:</strong> {exp.majorParts.join(' • ')}</div>
                                )}
                                {Array.isArray(exp.WhatEachLabelMeans) && exp.WhatEachLabelMeans.length > 0 && (
                                  <div><strong>3. Label meanings:</strong> {exp.WhatEachLabelMeans.join(' | ')}</div>
                                )}
                                {exp.stepByStepProcess && <div><strong>4. Step-by-step flow:</strong> {exp.stepByStepProcess}</div>}
                                {exp.howToRead && <div><strong>5. Reading order:</strong> {exp.howToRead}</div>}
                                {exp.whatToNoticeFirst && <div><strong>6. Notice first:</strong> {exp.whatToNoticeFirst}</div>}
                                {exp.connectionToTopic && <div><strong>7. Exam & lesson connection:</strong> {exp.connectionToTopic}</div>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  {/* SECTION 6: DIFFERENCES & COMPARISON TABLE */}
                  {differences && Array.isArray(differences.rows) && differences.rows.length > 0 && (
                    <section id="nb-comparison" style={{ marginBottom: 32 }}>
                      <h2 style={{ fontSize: '1.28rem', fontWeight: 800, color: '#111827', borderBottom: '1px solid #E5E7EB', paddingBottom: 6, marginBottom: 12 }}>
                        6. {differences.title || `${differences.titleA || 'Concept A'} vs. ${differences.titleB || 'Concept B'} — Comparison Table`}
                      </h2>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Inter, system-ui, sans-serif', fontSize: '0.88rem' }}>
                          <thead>
                            <tr style={{ background: '#F3F4F6', textAlign: 'left' }}>
                              {(
                                differences.columns || [
                                  'Comparison Criterion',
                                  differences.titleA || 'Concept A',
                                  differences.titleB || 'Concept B'
                                ]
                              ).map((col: string, cIdx: number) => (
                                <th key={cIdx} style={{ padding: '10px 12px', border: '1px solid #D1D5DB', fontWeight: 800, color: '#111827' }}>
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {differences.rows.map((row: any, rIdx: number) => {
                              const cells = Array.isArray(row) ? row : [row.aspect, row.itemA, row.itemB];
                              return (
                                <tr key={rIdx} style={{ background: rIdx % 2 === 0 ? '#FFFFFF' : '#F9FAFB' }}>
                                  {cells.map((cell: string, cIdx: number) => (
                                    <td
                                      key={cIdx}
                                      style={{
                                        padding: '9px 12px',
                                        border: '1px solid #D1D5DB',
                                        fontWeight: cIdx === 0 ? 700 : 400,
                                        color: '#111827'
                                      }}
                                    >
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  )}

                  {/* SECTION 7: FORMULAS, VARIABLES & WORKED NUMERICAL EXAMPLE */}
                  {(formula || (Array.isArray(workedProblems) && workedProblems.length > 0)) && (
                    <section id="nb-formula" style={{ marginBottom: 32 }}>
                      <h2 style={{ fontSize: '1.28rem', fontWeight: 800, color: '#111827', borderBottom: '1px solid #E5E7EB', paddingBottom: 6, marginBottom: 12 }}>
                        7. Governing Equations & Step-by-Step Worked Problems
                      </h2>
                      {formula && (
                        <div style={{ padding: 16, borderRadius: 8, border: '1px solid #D1D5DB', background: '#F9FAFB', fontFamily: 'Inter, system-ui, sans-serif', marginBottom: 12 }}>
                          <div style={{ fontSize: '1.08rem', fontWeight: 800, fontFamily: 'monospace', color: '#111827', marginBottom: 8 }}>
                            {formula.equation || formula.expression || (typeof formula === 'string' ? formula : '')}
                          </div>
                          {Array.isArray(formula.variables) && formula.variables.length > 0 && (
                            <ul style={{ margin: '0 0 10px 0', paddingLeft: 20, fontSize: '0.88rem', color: '#374151' }}>
                              {formula.variables.map((v: any, idx: number) => (
                                <li key={idx}>
                                  <strong>{v.symbol}:</strong> {v.meaning || v.label} {v.unit ? `(${v.unit})` : ''}
                                </li>
                              ))}
                            </ul>
                          )}
                          {formula.workedExample && (
                            <div style={{ fontSize: '0.88rem', color: '#1F2937', borderTop: '1px solid #E5E7EB', paddingTop: 8 }}>
                              <strong>Worked Example:</strong> {formula.workedExample}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Worked Problems (Step-by-step with Units and Dimensional Check) */}
                      {Array.isArray(workedProblems) && workedProblems.length > 0 && (
                        <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', color: '#4B5563' }}>
                            Worked Numerical Problems ({workedProblems.length})
                          </div>
                          {workedProblems.map((prob: any, pIdx: number) => (
                            <div key={pIdx} style={{ padding: 14, borderRadius: 8, background: '#FFFFFF', border: '1px solid #D1D5DB', fontFamily: 'Inter, system-ui, sans-serif' }}>
                              <div style={{ fontWeight: 800, color: '#111827', fontSize: '0.94rem', marginBottom: 6 }}>
                                Problem {pIdx + 1}: {prob.problemStatement}
                              </div>
                              <div style={{ fontSize: '0.84rem', color: '#4B5563', marginBottom: 6 }}>
                                <strong>Given:</strong> {prob.givenData} • <strong>Formula:</strong> <code style={{ background: '#F3F4F6', padding: '2px 6px', borderRadius: 4 }}>{prob.formulaUsed}</code>
                              </div>
                              {Array.isArray(prob.stepByStepSolution) && (
                                <div style={{ margin: '6px 0', paddingLeft: 12, borderLeft: '3px solid #3B82F6', fontSize: '0.86rem', color: '#1F2937' }}>
                                  {prob.stepByStepSolution.map((st: string, sIdx: number) => (
                                    <div key={sIdx} style={{ marginBottom: 4 }}>{st}</div>
                                  ))}
                                </div>
                              )}
                              <div style={{ padding: '6px 10px', background: '#ECFDF5', color: '#065F46', borderRadius: 6, fontWeight: 700, fontSize: '0.86rem', marginTop: 6 }}>
                                ✓ Final Answer: {prob.finalAnswer}
                              </div>
                              {prob.dimensionalCheck && (
                                <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: 4 }}>
                                  Dimensional / Verification Check: {prob.dimensionalCheck}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  )}

                  {/* SECTION 8: EXAM QUESTIONS & MODEL ANSWERS */}
                  {examQuestions.length > 0 && (
                    <section id="nb-exam" style={{ marginBottom: 32 }}>
                      <h2 style={{ fontSize: '1.28rem', fontWeight: 800, color: '#111827', borderBottom: '1px solid #E5E7EB', paddingBottom: 6, marginBottom: 12 }}>
                        8. High-Yield Exam Questions & Model Answers
                      </h2>
                      <div style={{ display: 'grid', gap: 12 }}>
                        {examQuestions.map((eq: any, idx: number) => (
                          <div key={idx} style={{ padding: 14, borderRadius: 8, border: '1px solid #E5E7EB', background: '#FFFFFF' }}>
                            <div style={{ fontWeight: 800, color: '#111827', fontSize: '0.96rem', marginBottom: 4 }}>
                              Q{idx + 1}. {eq.question}
                            </div>
                            <div style={{ fontSize: '0.92rem', color: '#1F2937' }}>
                              <strong>Model Answer:</strong> {eq.modelAnswer || eq.answer}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* SECTION 9: MULTI-SOURCE SYNTHESIS & CONTRADICTION DETECTION */}
                  {sourceComparison && (
                    <section id="nb-multisource" style={{ marginBottom: 32 }}>
                      <h2 style={{ fontSize: '1.28rem', fontWeight: 800, color: '#111827', borderBottom: '1px solid #E5E7EB', paddingBottom: 6, marginBottom: 12 }}>
                        9. Multi-Source Synthesis (Agreements, Complementary Details & Contradictions)
                      </h2>
                      <div style={{ display: 'grid', gap: 12, fontFamily: 'Inter, system-ui, sans-serif', fontSize: '0.88rem' }}>
                        {Array.isArray(sourceComparison.agreements) && sourceComparison.agreements.length > 0 && (
                          <div style={{ padding: 12, borderRadius: 8, background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46' }}>
                            <strong>✓ Cross-Source Agreements:</strong>
                            <ul style={{ margin: '6px 0 0 0', paddingLeft: 20 }}>
                              {sourceComparison.agreements.map((a: any, i: number) => (
                                <li key={i}>{typeof a === 'string' ? a : `${a.topic}: ${a.summary}`}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {Array.isArray(sourceComparison.complementaryDetails) && sourceComparison.complementaryDetails.length > 0 && (
                          <div style={{ padding: 12, borderRadius: 8, background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1E40AF' }}>
                            <strong>➕ Complementary Source Details:</strong>
                            <ul style={{ margin: '6px 0 0 0', paddingLeft: 20 }}>
                              {sourceComparison.complementaryDetails.map((c: any, i: number) => (
                                <li key={i}>
                                  {typeof c === 'string' ? c : `${c.sourceTitle}: ${c.uniqueContribution} (${c.citation})`}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {Array.isArray(sourceComparison.contradictions) && sourceComparison.contradictions.length > 0 && (
                          <div style={{ padding: 12, borderRadius: 8, background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B' }}>
                            <strong>⚠️ Detected Source Contradictions / Discrepancies:</strong>
                            <ul style={{ margin: '6px 0 0 0', paddingLeft: 20 }}>
                              {sourceComparison.contradictions.map((con: any, i: number) => (
                                <li key={i}>
                                  {typeof con === 'string'
                                    ? con
                                    : con.aspect
                                      ? `${con.aspect}: ${con.claimA?.statement} vs. ${con.claimB?.statement} — ${con.resolutionNote}`
                                      : `${con.topic}: ${con.sourceAClaim} vs. ${con.sourceBClaim} — ${con.explanation}`}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </section>
                  )}

                  {/* SECTION 10: REVISION SUMMARY & SOURCE INVENTORY */}
                  <section id="nb-sources" style={{ borderTop: '2px solid #111827', paddingTop: 18 }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', marginBottom: 10 }}>
                      10. Revision Summary & Grounded Source Inventory
                    </h2>
                    {Array.isArray(structured?.summaryPoints) && structured.summaryPoints.length > 0 && (
                      <ul style={{ marginBottom: 16, paddingLeft: 22 }}>
                        {structured.summaryPoints.map((pt: string, i: number) => (
                          <li key={i} style={{ fontSize: '0.94rem', color: '#111827', marginBottom: 4 }}>
                            {pt}
                          </li>
                        ))}
                      </ul>
                    )}

                    {sourceRecords.length > 0 && (
                      <div style={{ padding: 12, borderRadius: 8, background: '#F9FAFB', border: '1px solid #E5E7EB', fontFamily: 'Inter, system-ui, sans-serif', fontSize: '0.82rem' }}>
                        <div style={{ fontWeight: 800, color: '#111827', marginBottom: 6 }}>
                          Verified Source Provenance ({sourceRecords.length} source(s)):
                        </div>
                        {sourceRecords.map((src: any, idx: number) => (
                          <div key={src.id || idx} style={{ color: '#374151', marginBottom: 4 }}>
                            • <strong>[{src.sourceType?.toUpperCase()}] {src.title}</strong> — {src.inventory?.unitsProcessed || 1}/{src.inventory?.totalUnits || 1} {src.inventory?.unitType || 'unit'}(s) processed ({src.inventory?.coveragePercent || 100}% coverage)
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* =====================================================================
                      SECTION 11: THE FINAL COMPREHENSIVE REVISION PAGE (MANDATORY FEATURE)
                      ===================================================================== */}
                  {finalRevisionPage && (
                    <section
                      id="nb-final-revision"
                      style={{
                        marginTop: 40,
                        padding: '28px 32px',
                        borderRadius: 16,
                        background: currentDesignMode === 'handwritten' ? '#FEFCE8' : '#F0FDF4',
                        border: '2.5px solid #16A34A',
                        boxShadow: '0 12px 32px rgba(22, 163, 74, 0.12)',
                        fontFamily: 'Inter, system-ui, sans-serif'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, borderBottom: '2px solid #16A34A', paddingBottom: 14, marginBottom: 18 }}>
                        <div>
                          <div style={{ display: 'inline-block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', background: '#16A34A', color: '#FFFFFF', padding: '3px 9px', borderRadius: 6, letterSpacing: '0.5px', marginBottom: 6 }}>
                            High-Yield Board & Exam Master Sheet
                          </div>
                          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#14532D', margin: 0 }}>
                            🏆 The Final Comprehensive Revision Page
                          </h2>
                        </div>
                        <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#15803D', background: '#DCFCE7', padding: '4px 12px', borderRadius: 999 }}>
                          {editSubject} • {activeNote.topic || editTitle}
                        </span>
                      </div>

                      {/* Executive Summary */}
                      {finalRevisionPage.executiveSummary && (
                        <div style={{ padding: 14, background: '#FFFFFF', borderRadius: 10, border: '1px solid #BBF7D0', marginBottom: 18 }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#14532D', textTransform: 'uppercase', marginBottom: 4 }}>
                            Executive Concept Summary
                          </div>
                          <p style={{ margin: 0, fontSize: '0.94rem', color: '#1F2937', lineHeight: 1.65 }}>
                            {finalRevisionPage.executiveSummary}
                          </p>
                        </div>
                      )}

                      {/* 1. Quick Revision Concept Matrix Table */}
                      {Array.isArray(finalRevisionPage.quickRevisionMatrix) && finalRevisionPage.quickRevisionMatrix.length > 0 && (
                        <div style={{ marginBottom: 22 }}>
                          <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#14532D', marginBottom: 10 }}>
                            1. Quick Revision Concept Matrix
                          </h3>
                          <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#FFFFFF', borderRadius: 8, overflow: 'hidden', fontSize: '0.86rem' }}>
                              <thead>
                                <tr style={{ background: '#DCFCE7', color: '#14532D', textAlign: 'left' }}>
                                  <th style={{ padding: '9px 12px', border: '1px solid #BBF7D0', fontWeight: 800 }}>Subtopic / Concept</th>
                                  <th style={{ padding: '9px 12px', border: '1px solid #BBF7D0', fontWeight: 800 }}>Core Principle / Rule</th>
                                  <th style={{ padding: '9px 12px', border: '1px solid #BBF7D0', fontWeight: 800 }}>Exam Significance & Traps</th>
                                </tr>
                              </thead>
                              <tbody>
                                {finalRevisionPage.quickRevisionMatrix.map((row: any, rIdx: number) => (
                                  <tr key={rIdx} style={{ background: rIdx % 2 === 0 ? '#FFFFFF' : '#F9FAFB' }}>
                                    <td style={{ padding: '9px 12px', border: '1px solid #BBF7D0', fontWeight: 700, color: '#111827' }}>
                                      {row.concept}
                                    </td>
                                    <td style={{ padding: '9px 12px', border: '1px solid #BBF7D0', color: '#374151' }}>
                                      {row.keyRuleOrPrinciple}
                                    </td>
                                    <td style={{ padding: '9px 12px', border: '1px solid #BBF7D0', color: '#15803D', fontWeight: 600 }}>
                                      {row.examSignificance}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* 2. Master Formulas, Key Dates & Governing Rules */}
                      {Array.isArray(finalRevisionPage.keyFormulasOrDatesOrRules) && finalRevisionPage.keyFormulasOrDatesOrRules.length > 0 && (
                        <div style={{ marginBottom: 22 }}>
                          <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#14532D', marginBottom: 10 }}>
                            2. Master Formulas, Key Dates & Governing Rules
                          </h3>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
                            {finalRevisionPage.keyFormulasOrDatesOrRules.map((item: any, fIdx: number) => (
                              <div key={fIdx} style={{ padding: 12, background: '#FFFFFF', borderRadius: 8, border: '1px solid #BBF7D0' }}>
                                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#15803D', textTransform: 'uppercase' }}>
                                  {item.label}
                                </div>
                                <div style={{ fontSize: '0.98rem', fontWeight: 800, fontFamily: 'monospace', color: '#111827', margin: '4px 0' }}>
                                  {item.formulaOrDetail}
                                </div>
                                <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                                  {item.unitsOrSignificance}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 3. High-Yield Must-Know Definitions */}
                      {Array.isArray(finalRevisionPage.highYieldDefinitions) && finalRevisionPage.highYieldDefinitions.length > 0 && (
                        <div style={{ marginBottom: 22 }}>
                          <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#14532D', marginBottom: 10 }}>
                            3. High-Yield Must-Know Definitions
                          </h3>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
                            {finalRevisionPage.highYieldDefinitions.map((d: any, dIdx: number) => (
                              <div key={dIdx} style={{ padding: 11, background: '#FFFFFF', borderRadius: 8, border: '1px solid #E5E7EB' }}>
                                <strong style={{ color: '#111827', fontSize: '0.88rem' }}>{d.term}: </strong>
                                <span style={{ color: '#374151', fontSize: '0.86rem' }}>{d.conciseDefinition}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 4. Mnemonics & Exam Traps */}
                      {((Array.isArray(finalRevisionPage.mnemonics) && finalRevisionPage.mnemonics.length > 0) || (Array.isArray(finalRevisionPage.misconceptions) && finalRevisionPage.misconceptions.length > 0)) && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 22 }}>
                          {Array.isArray(finalRevisionPage.mnemonics) && finalRevisionPage.mnemonics.length > 0 && (
                            <div style={{ padding: 14, background: '#EFF6FF', borderRadius: 8, border: '1px solid #BFDBFE' }}>
                              <strong style={{ color: '#1E40AF', fontSize: '0.84rem', textTransform: 'uppercase' }}>
                                💡 Memory Mnemonics:
                              </strong>
                              <ul style={{ margin: '6px 0 0 0', paddingLeft: 18, fontSize: '0.86rem', color: '#1E3A8A' }}>
                                {finalRevisionPage.mnemonics.map((m: string, mIdx: number) => (
                                  <li key={mIdx} style={{ marginBottom: 4 }}>{m}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {Array.isArray(finalRevisionPage.misconceptions) && finalRevisionPage.misconceptions.length > 0 && (
                            <div style={{ padding: 14, background: '#FEF2F2', borderRadius: 8, border: '1px solid #FECACA' }}>
                              <strong style={{ color: '#991B1B', fontSize: '0.84rem', textTransform: 'uppercase' }}>
                                ⚠️ Common Exam Traps & Misconceptions:
                              </strong>
                              <ul style={{ margin: '6px 0 0 0', paddingLeft: 18, fontSize: '0.86rem', color: '#7F1D1D' }}>
                                {finalRevisionPage.misconceptions.map((mis: string, misIdx: number) => (
                                  <li key={misIdx} style={{ marginBottom: 4 }}>{mis}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 5. Model Exam Questions with Complete Marking Keys */}
                      {Array.isArray(finalRevisionPage.modelExamQuestions) && finalRevisionPage.modelExamQuestions.length > 0 && (
                        <div>
                          <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#14532D', marginBottom: 10 }}>
                            5. Model Board Exam Questions with Marking Keys
                          </h3>
                          <div style={{ display: 'grid', gap: 10 }}>
                            {finalRevisionPage.modelExamQuestions.map((q: any, qIdx: number) => (
                              <div key={qIdx} style={{ padding: 14, background: '#FFFFFF', borderRadius: 8, border: '1px solid #BBF7D0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                  <span style={{ fontWeight: 800, color: '#111827', fontSize: '0.92rem' }}>
                                    Q{qIdx + 1}. {q.question}
                                  </span>
                                  <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: 999 }}>
                                    {q.marks} Marks
                                  </span>
                                </div>
                                <div style={{ fontSize: '0.86rem', color: '#374151', background: '#F9FAFB', padding: 10, borderRadius: 6, borderLeft: '3px solid #16A34A', marginTop: 6 }}>
                                  <strong>Model Answer & Marking Key:</strong> {q.answerKey}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </section>
                  )}
                </div>
              )}

              {/* =====================================================================
                  TAB 2: ASK NOTEBOOK SOURCES (SOURCE-GROUNDED Q&A WITH CITATIONS)
                  ===================================================================== */}
              {activeTab === 'ask-sources' && (
                <div className="glass-card" style={{ padding: 22 }}>
                  <h2 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#111827', marginBottom: 6 }}>
                    Ask Your Notebook Sources (Source-Grounded Q&A)
                  </h2>
                  <p style={{ fontSize: '0.86rem', color: '#4B5563', marginBottom: 16 }}>
                    Select which attached sources to query. Every answer separates <strong>Source-Grounded Evidence (with Page/Timestamp Citations)</strong> from <strong>Supplemental AI Tutor Context</strong>.
                  </p>

                  {/* Source Selection Checkboxes */}
                  {sourceRecords.length > 0 && (
                    <div style={{ marginBottom: 16, padding: 14, borderRadius: 12, background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', marginBottom: 8 }}>
                        Active Sources for Grounding ({selectedSourceIds.length}/{sourceRecords.length} selected)
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                        {sourceRecords.map((src: any) => {
                          const checked = selectedSourceIds.includes(src.id);
                          return (
                            <label
                              key={src.id}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '6px 12px',
                                borderRadius: 8,
                                background: checked ? '#FFF3E8' : '#F9FAFB',
                                border: checked ? '1.5px solid #FF6A00' : '1px solid #D1D5DB',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  setSelectedSourceIds((prev) =>
                                    prev.includes(src.id) ? prev.filter((id) => id !== src.id) : [...prev, src.id]
                                  );
                                }}
                              />
                              <span>[{src.sourceType?.toUpperCase()}] {src.title}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleAskSourceQuestion} style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
                    <input
                      value={qaQuestion}
                      onChange={(e) => setQaQuestion(e.target.value)}
                      placeholder="Ask a question about this notebook (e.g., What does Chapter 3 say about ATP? What is the formula?)..."
                      style={{
                        flex: 1,
                        padding: '12px 14px',
                        borderRadius: 12,
                        border: '1.5px solid rgba(255,106,0,0.35)',
                        fontSize: '0.92rem',
                        background: '#FFFFFF'
                      }}
                    />
                    <button type="submit" className="btn-orange" disabled={qaLoading}>
                      <MessageSquare size={16} />
                      <span>{qaLoading ? 'Searching Sources...' : 'Ask Notebook'}</span>
                    </button>
                  </form>

                  {qaHistory.length === 0 ? (
                    <div style={{ padding: 24, textAlign: 'center', background: '#FFFFFF', borderRadius: 12, color: '#6B7280', fontSize: '0.88rem' }}>
                      Ask any question above to retrieve exact cited answers from your notebook sources.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: 14 }}>
                      {qaHistory.map((item, idx) => (
                        <div key={idx} style={{ padding: 18, borderRadius: 14, background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                          <div style={{ fontWeight: 800, color: '#111827', fontSize: '0.98rem', marginBottom: 10 }}>
                            Q: {item.question}
                          </div>

                          <div style={{ padding: 12, borderRadius: 10, background: '#ECFDF5', border: '1px solid #A7F3D0', marginBottom: 10 }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase', marginBottom: 4 }}>
                              ✓ Source-Grounded Answer
                            </div>
                            <div style={{ fontSize: '0.92rem', color: '#065F46', lineHeight: 1.6 }}>
                              {item.sourceGroundedAnswer}
                            </div>
                            {Array.isArray(item.citations) && item.citations.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                                {item.citations.map((cit: any, cIdx: number) => (
                                  <span
                                    key={cIdx}
                                    style={{
                                      padding: '2px 8px',
                                      borderRadius: 4,
                                      background: '#FFFFFF',
                                      border: '1px solid #6EE7B7',
                                      color: '#047857',
                                      fontSize: '0.74rem',
                                      fontWeight: 700
                                    }}
                                  >
                                    📌 {cit.citationLabel || `${cit.sourceTitle} (${cit.locator})`}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {item.aiSupplementalExplanation && (
                            <div style={{ padding: 12, borderRadius: 10, background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1D4ED8', textTransform: 'uppercase', marginBottom: 4 }}>
                                💡 AI Tutor Supplemental Explanation (Beyond Direct Source Text)
                              </div>
                              <div style={{ fontSize: '0.88rem', color: '#1E3A8A', lineHeight: 1.55 }}>
                                {item.aiSupplementalExplanation}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* =====================================================================
                  TAB 3: STUDY GUIDE, QUIZ & NARRATED AUDIO OVERVIEW
                  ===================================================================== */}
              {activeTab === 'study-tools' && (
                <div className="glass-card" style={{ padding: 22 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                    <div>
                      <h2 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#111827' }}>
                        Notebook Study Guide, Practice Quiz & Audio Overview
                      </h2>
                      <p style={{ fontSize: '0.84rem', color: '#4B5563' }}>
                        Generated directly from your notebook sections, definitions, and cited sources.
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() =>
                          startAudioLesson({
                            topic: activeNote.title,
                            text:
                              studyToolsData?.audioOverviewScript ||
                              `${activeNote.title}. ${structured?.simpleIntroduction || ''}. ${(structured?.summaryPoints || []).join(' ')}`
                          })
                        }
                        className="btn-orange"
                      >
                        <Volume2 size={15} />
                        <span>Play Audio Overview</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openQuizModal(activeNote.topic || editTitle, activeNote.subject || 'Science')}
                        className="btn-glass"
                      >
                        <HelpCircle size={15} />
                        <span>Launch Interactive Quiz</span>
                      </button>
                    </div>
                  </div>

                  {studyToolsLoading ? (
                    <div style={{ padding: 24, textAlign: 'center', color: '#6B7280' }}>
                      Synthesizing Study Guide, Audio Overview Script, Flashcards & Practice Questions...
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: 16 }}>
                      {studyToolsData?.studyGuide && (
                        <div style={{ padding: 18, borderRadius: 14, background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', marginBottom: 8 }}>
                            📋 Executive Study Guide Summary
                          </h3>
                          <p style={{ fontSize: '0.92rem', color: '#1F2937', lineHeight: 1.65, marginBottom: 12 }}>
                            {studyToolsData.studyGuide.executiveSummary}
                          </p>
                          {Array.isArray(studyToolsData.studyGuide.keyTakeaways) && (
                            <ul style={{ paddingLeft: 20, margin: 0 }}>
                              {studyToolsData.studyGuide.keyTakeaways.map((tk: string, i: number) => (
                                <li key={i} style={{ fontSize: '0.88rem', color: '#374151', marginBottom: 4 }}>
                                  {tk}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}

                      {studyToolsData?.audioOverviewScript && (
                        <div style={{ padding: 18, borderRadius: 14, background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', marginBottom: 6 }}>
                            🎙️ Narrated Audio Overview Script (Spoken Full Forms Enabled)
                          </h3>
                          <p style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.65 }}>
                            {studyToolsData.audioOverviewScript}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* =====================================================================
                  TAB 4: INTERACTIVE FLASHCARDS
                  ===================================================================== */}
              {activeTab === 'flashcards' && (
                <div className="glass-card" style={{ padding: 22 }}>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827', marginBottom: 12 }}>
                    Active Recall Flashcards ({activeNote.flashcards?.length || 0})
                  </h2>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {(activeNote.flashcards || []).map((card: any, idx: number) => {
                      const isFlipped = Boolean(flippedCards[idx]);
                      return (
                        <div
                          key={idx}
                          onClick={() => setFlippedCards((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                          style={{
                            padding: 18,
                            borderRadius: 16,
                            background: isFlipped ? '#FFF3E8' : '#FFFFFF',
                            border: '1.5px solid rgba(255,106,0,0.3)',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#FF6A00', textTransform: 'uppercase', marginBottom: 4 }}>
                            {isFlipped ? 'Answer (Click to flip)' : `Flashcard ${idx + 1} — Question (Click to reveal answer)`}
                          </div>
                          <div style={{ fontSize: '0.96rem', fontWeight: 700, color: '#111827' }}>
                            {isFlipped ? card.back : card.front}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* =====================================================================
                  TAB 5: RAW MARKDOWN EDITOR
                  ===================================================================== */}
              {activeTab === 'editor' && (
                <div className="glass-card" style={{ padding: 22 }}>
                  <textarea
                    value={editMarkdown}
                    onChange={(e) => {
                      pushUndoSnapshot();
                      setEditMarkdown(e.target.value);
                      scheduleAutosave(editTitle, editSubject, editNotebook, e.target.value, editStructured);
                    }}
                    aria-label="Note Markdown Content Editor"
                    rows={22}
                    style={{
                      width: '100%',
                      padding: 16,
                      borderRadius: 14,
                      border: '1.5px solid #D1D5DB',
                      fontFamily: 'monospace',
                      fontSize: '0.88rem',
                      lineHeight: 1.6,
                      background: '#FFFFFF',
                      color: '#111827'
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
