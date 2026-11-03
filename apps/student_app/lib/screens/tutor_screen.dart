import 'package:flutter/material.dart';
import 'package:shared_ui/shared_ui.dart';
import '../state/student_app_state.dart';
import '../widgets/interactive_3d_dialog.dart';
import '../widgets/voice_teacher_dialog.dart';

class TutorScreen extends StatefulWidget {
  final StudentAppState state;

  const TutorScreen({Key? key, required this.state}) : super(key: key);

  @override
  State<TutorScreen> createState() => _TutorScreenState();
}

class _TutorScreenState extends State<TutorScreen> {
  final TextEditingController _questionController = TextEditingController();
  final TextEditingController _topicController = TextEditingController(text: 'Human Heart');

  String _selectedSubject = 'Science';
  String _selectedGrade = 'Grade 10';
  String _selectedLanguage = 'English';
  String _explanationMode = 'detailed';
  String _learningMode = 'normal'; // 'normal' | 'exam'
  bool _isAsking = false;

  Map<String, dynamic>? _lessonData;
  String? _followUpResponse;
  bool _isAudioPlaying = false;
  double _audioSpeed = 1.0;

  final Map<int, String> _userQuizAnswers = {};

  final List<String> _quickTopics = [
    'Human Heart & Double Circulation',
    'DNA Double Helix & Genetics',
    'Photosynthesis & Chloroplasts',
    'Atomic Structure (Bohr Model)',
    'Newton\'s Laws of Motion',
    'Solar System Orbital Dynamics',
  ];

  @override
  void dispose() {
    _questionController.dispose();
    _topicController.dispose();
    super.dispose();
  }

  Future<void> askTutor([String? topicOverride, String? questionText]) => _submitInquiry(topicOverride ?? _topicController.text, questionText ?? _questionController.text);

  Future<void> _submitInquiry(String topicText, [String? questionText]) async {
    final effectiveTopic = topicText.trim().isNotEmpty ? topicText.trim() : 'Human Heart';
    final effectiveQuestion = (questionText != null && questionText.trim().isNotEmpty)
        ? questionText.trim()
        : 'Explain the core mechanisms, structures, and processes of $effectiveTopic';

    setState(() {
      _isAsking = true;
      _followUpResponse = null;
      _userQuizAnswers.clear();
      _isAudioPlaying = false;
    });

    try {
      final res = await widget.state.apiClient.post('/api/v1/tutor/ask', {
        'topic': effectiveTopic,
        'question': effectiveQuestion,
        'grade': int.tryParse(_selectedGrade.replaceAll(RegExp(r'[^0-9]'), '')) ?? 10,
        'level': _selectedGrade,
        'subject': _selectedSubject,
        'language': _selectedLanguage,
        'mode': _explanationMode,
      });

      setState(() {
        _isAsking = false;
        _lessonData = res as Map<String, dynamic>;
      });
    } catch (e) {
      setState(() {
        _isAsking = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error generating lesson: $e'), backgroundColor: StudyAiColors.surface),
      );
    }
  }

  Future<void> _requestFollowUp(String actionType, [String? selectedPart]) async {
    if (_lessonData == null) return;
    final topic = _lessonData!['topic'] ?? _topicController.text;

    try {
      final res = await widget.state.apiClient.post('/api/v1/tutor/follow-up', {
        'action_type': actionType,
        'topic': topic,
        'current_lesson_id': _lessonData!['lesson_id'],
        'selected_part': selectedPart,
      });

      setState(() {
        _followUpResponse = res['teacher_explanation'] as String?;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Follow-up error: $e'), backgroundColor: StudyAiColors.surface),
      );
    }
  }

  Future<void> _saveLessonToNotes() async {
    if (_lessonData == null) return;

    try {
      final title = '${_lessonData!['topic']} Master Study Guide';
      final topic = _lessonData!['topic'];
      final content = _lessonData!['detailed_explanation'] ?? '';

      final flashcards = (_lessonData!['terminology_and_abbreviations'] as List<dynamic>?)?.map((item) {
            return {
              'front': '${item['abbr']} (${item['full_form']})',
              'back': item['definition']?.toString() ?? '',
            };
          }).toList() ??
          [];

      final quiz = (_lessonData!['understanding_questions'] as List<dynamic>?)?.map((q) {
            return {
              'question': q['question'],
              'options': q['options'],
              'answer': q['correct_answer'],
            };
          }).toList() ??
          [];

      await widget.state.apiClient.post('/api/v1/tutor/save-to-notes', {
        'lesson_id': _lessonData!['lesson_id'],
        'title': title,
        'topic': topic,
        'subject': _selectedSubject,
        'notebook_name': 'AI Tutor Lessons',
        'content_markdown': content,
        'flashcards': flashcards,
        'quiz': quiz,
      });

      // Reload notes list in state
      widget.state.notesList = await widget.state.apiClient.getNotes();

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Saved "$title" into AI Notes Studio!'),
          backgroundColor: StudyAiColors.greenAccent.withOpacity(0.9),
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Save error: $e'), backgroundColor: StudyAiColors.surface),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          const Text(
            'AI Multimodal Tutor',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: StudyAiColors.textLight),
          ),
          const SizedBox(height: 4),
          const Text(
            'Structured curriculum lessons, Three.js 3D models, labeled scientific diagrams, and interactive self-check quizzes',
            style: TextStyle(fontSize: 13, color: StudyAiColors.textMuted),
          ),
          const SizedBox(height: 20),

          // TOP-LEVEL PERMANENT LEARNING MODE SELECTOR
          Container(
            padding: const EdgeInsets.all(5),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.06),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.white.withOpacity(0.12)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: InkWell(
                    onTap: () => setState(() => _learningMode = 'normal'),
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        gradient: _learningMode == 'normal'
                            ? const LinearGradient(colors: [StudyAiColors.primary, StudyAiColors.primaryDark])
                            : null,
                        borderRadius: BorderRadius.circular(10),
                        boxShadow: _learningMode == 'normal'
                            ? [BoxShadow(color: StudyAiColors.primary.withOpacity(0.35), blurRadius: 10, offset: const Offset(0, 3))]
                            : null,
                      ),
                      child: Center(
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Text('🌱', style: TextStyle(fontSize: 14)),
                            const SizedBox(width: 8),
                            Text(
                              'NORMAL LEARNING MODE',
                              style: TextStyle(
                                fontWeight: FontWeight.w800,
                                fontSize: 13,
                                color: _learningMode == 'normal' ? Colors.white : StudyAiColors.textMuted,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: InkWell(
                    onTap: () => setState(() => _learningMode = 'exam'),
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        gradient: _learningMode == 'exam'
                            ? const LinearGradient(colors: [StudyAiColors.cyanAccent, Color(0xFF0284C7)])
                            : null,
                        borderRadius: BorderRadius.circular(10),
                        boxShadow: _learningMode == 'exam'
                            ? [BoxShadow(color: const Color(0xFF0284C7).withOpacity(0.35), blurRadius: 10, offset: const Offset(0, 3))]
                            : null,
                      ),
                      child: Center(
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Text('🎯', style: TextStyle(fontSize: 14)),
                            const SizedBox(width: 8),
                            Text(
                              'EXAM PREPARATION MODE',
                              style: TextStyle(
                                fontWeight: FontWeight.w800,
                                fontSize: 13,
                                color: _learningMode == 'exam' ? Colors.white : StudyAiColors.textMuted,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // PROMINENT GEMINI AI TEACHER VOICE LESSON BUTTON
          InkWell(
            onTap: () {
              final effectiveTopic = _topicController.text.trim().isNotEmpty ? _topicController.text.trim() : 'Human Heart';
              final parsedGrade = int.tryParse(_selectedGrade.replaceAll(RegExp(r'[^0-9]'), '')) ?? 10;
              showDialog(
                context: context,
                builder: (_) => VoiceTeacherDialog(
                  apiClient: widget.state.apiClient,
                  topic: effectiveTopic,
                  grade: parsedGrade,
                  subject: _selectedSubject,
                  mode: _learningMode,
                ),
              );
            },
            borderRadius: BorderRadius.circular(14),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [StudyAiColors.primary, Color(0xFFEA580C)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(14),
                boxShadow: [
                  BoxShadow(
                    color: StudyAiColors.primary.withOpacity(0.4),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.mic, color: Colors.white, size: 22),
                  const SizedBox(width: 10),
                  const Text(
                    'Start Voice Lesson',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: const Text(
                      'Gemini Conversational Audio',
                      style: TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.w700),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 18),

          // Inquiry Input & Configuration Card
          StudyAiGlassCard(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Selectors row
                Wrap(
                  spacing: 12,
                  runSpacing: 10,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    _buildDropdown(
                      label: 'Subject',
                      value: _selectedSubject,
                      items: ['Science', 'Mathematics', 'Social Studies', 'English'],
                      onChanged: (v) => setState(() => _selectedSubject = v!),
                    ),
                    _buildDropdown(
                      label: 'Grade',
                      value: _selectedGrade,
                      items: ['Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
                      onChanged: (v) => setState(() => _selectedGrade = v!),
                    ),
                    _buildDropdown(
                      label: 'Language',
                      value: _selectedLanguage,
                      items: ['English', 'Hindi', 'Telugu'],
                      onChanged: (v) => setState(() => _selectedLanguage = v!),
                    ),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text('Detailed', style: TextStyle(fontSize: 12, color: StudyAiColors.textMuted)),
                        Switch(
                          value: _explanationMode == 'detailed',
                          activeColor: StudyAiColors.primary,
                          onChanged: (val) {
                            setState(() {
                              _explanationMode = val ? 'detailed' : 'simple';
                            });
                          },
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Topic Input
                TextField(
                  controller: _topicController,
                  style: const TextStyle(color: Colors.white, fontSize: 14),
                  decoration: InputDecoration(
                    labelText: 'Topic to Master',
                    labelStyle: const TextStyle(color: StudyAiColors.primary, fontWeight: FontWeight.w600),
                    hintText: 'e.g., Human Heart, Photosynthesis, DNA, Bohr Atomic Model',
                    hintStyle: const TextStyle(color: StudyAiColors.textMuted, fontSize: 13),
                    filled: true,
                    fillColor: Colors.white.withOpacity(0.04),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
                const SizedBox(height: 14),

                // Question Prompt
                TextField(
                  controller: _questionController,
                  maxLines: 2,
                  style: const TextStyle(color: Colors.white, fontSize: 14),
                  decoration: InputDecoration(
                    hintText: 'Ask a specific question or leave blank for a comprehensive structured lesson...',
                    hintStyle: const TextStyle(color: StudyAiColors.textMuted, fontSize: 13),
                    filled: true,
                    fillColor: Colors.white.withOpacity(0.04),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 12),

                // Quick Topic Chips
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _quickTopics.map((topic) {
                    return ActionChip(
                      backgroundColor: Colors.white.withOpacity(0.06),
                      side: BorderSide(color: Colors.white.withOpacity(0.12)),
                      label: Text(topic, style: const TextStyle(fontSize: 11, color: StudyAiColors.textLight)),
                      onPressed: () {
                        _topicController.text = topic;
                        _submitInquiry(topic);
                      },
                    );
                  }).toList(),
                ),
                const SizedBox(height: 16),

                // Ask CTA
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    StudyAiPrimaryButton(
                      label: 'Assemble Complete Lesson',
                      icon: Icons.psychology_rounded,
                      isLoading: _isAsking,
                      onPressed: () => _submitInquiry(_topicController.text, _questionController.text),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Output Presentation
          if (_isAsking)
            const StudyAiLoadingView(message: 'AI Teaching Engine is assembling pedagogy, 3D simulations & labeled diagrams...')
          else if (_lessonData != null) ...[
            _buildAudioLessonBar(context),
            const SizedBox(height: 20),
            _buildCompleteLessonView(context, _lessonData!),
          ] else
            const StudyAiEmptyView(
              title: 'AI Teaching System Ready',
              description: 'Select any curriculum topic above to generate an in-depth lesson with objectives, definitions, full forms, Three.js 3D simulations, and understanding checks.',
              icon: Icons.school_rounded,
            ),

          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildDropdown({
    required String label,
    required String value,
    required List<String> items,
    required ValueChanged<String?> onChanged,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: value,
          dropdownColor: StudyAiColors.surface,
          style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
          items: items.map((i) => DropdownMenuItem(value: i, child: Text(i))).toList(),
          onChanged: onChanged,
        ),
      ),
    );
  }

  Widget _buildAudioLessonBar(BuildContext context) {
    return StudyAiGlassCard(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      child: Row(
        children: [
          IconButton(
            icon: Icon(
              _isAudioPlaying ? Icons.pause_circle_filled_rounded : Icons.play_circle_fill_rounded,
              size: 38,
              color: StudyAiColors.primary,
            ),
            onPressed: () {
              setState(() {
                _isAudioPlaying = !_isAudioPlaying;
              });
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(_isAudioPlaying ? 'Playing audio teacher narration...' : 'Audio paused'),
                  duration: const Duration(seconds: 1),
                  backgroundColor: StudyAiColors.surface,
                ),
              );
            },
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Audio Teacher Narration', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: Colors.white)),
                Text(
                  'Natural speech • Voice: Nova (Teacher) • ${_isAudioPlaying ? 'Playing (0:14 / 0:45)' : 'Ready'}',
                  style: const TextStyle(fontSize: 11, color: StudyAiColors.textMuted),
                ),
              ],
            ),
          ),
          // Speed button
          PopupMenuButton<double>(
            initialValue: _audioSpeed,
            color: StudyAiColors.surface,
            onSelected: (speed) {
              setState(() {
                _audioSpeed = speed;
              });
            },
            itemBuilder: (ctx) => [
              const PopupMenuItem(value: 1.0, child: Text('1.0x Speed', style: TextStyle(color: Colors.white))),
              const PopupMenuItem(value: 1.25, child: Text('1.25x Speed', style: TextStyle(color: Colors.white))),
              const PopupMenuItem(value: 1.5, child: Text('1.5x Speed', style: TextStyle(color: Colors.white))),
            ],
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.08),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text('${_audioSpeed}x', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12, color: Colors.white)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCompleteLessonView(BuildContext context, Map<String, dynamic> lesson) {
    final topic = lesson['topic'] ?? _topicController.text;
    final modelId = lesson['three_js_model']?['model_id'] ?? 'plant_cell';
    final objectives = (lesson['learning_objectives'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [];
    final terms = lesson['terminology_and_abbreviations'] as List<dynamic>? ?? [];
    final subtopics = lesson['subtopics'] as List<dynamic>? ?? [];
    final questions = lesson['understanding_questions'] as List<dynamic>? ?? [];
    final misconceptions = (lesson['common_misconceptions'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Top Action Bar
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            StudyAiGlassPill(
              label: '${lesson['subject']} • ${lesson['level']}',
              icon: Icons.verified_rounded,
              color: StudyAiColors.greenAccent,
              isSelected: true,
            ),
            Row(
              children: [
                ElevatedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Launching 40-Mark Practice Exam for $topic...'),
                        backgroundColor: StudyAiColors.cyanAccent,
                      ),
                    );
                  },
                  icon: const Icon(Icons.assignment_turned_in_rounded, size: 16),
                  label: const Text('40-Mark Exam', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0284C7),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Launching Space Battle Game for $topic...'),
                        backgroundColor: const Color(0xFF7C3AED),
                      ),
                    );
                  },
                  icon: const Icon(Icons.videogame_asset_rounded, size: 16),
                  label: const Text('Play Game', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF7C3AED),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton.icon(
                  onPressed: _saveLessonToNotes,
                  icon: const Icon(Icons.bookmark_add_rounded, size: 16),
                  label: const Text('Save Notes', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: StudyAiColors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Mode Status Banner
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(
            color: _learningMode == 'normal'
                ? StudyAiColors.primary.withOpacity(0.12)
                : const Color(0xFF0284C7).withOpacity(0.12),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: _learningMode == 'normal'
                  ? StudyAiColors.primary.withOpacity(0.3)
                  : const Color(0xFF0284C7).withOpacity(0.3),
            ),
          ),
          child: Row(
            children: [
              Text(_learningMode == 'normal' ? '🌱' : '🎯', style: const TextStyle(fontSize: 16)),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  _learningMode == 'normal'
                      ? 'NORMAL LEARNING MODE: Everyday explanations, concept breakdown, integrated diagrams & 3D models'
                      : 'EXAM PREPARATION MODE: Formal definitions, full forms glossary, formulas, labeled schematics & practice tests',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: _learningMode == 'normal' ? StudyAiColors.primary : const Color(0xFF38BDF8),
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),

        // ADAPTIVE GUIDANCE BANNERS
        if (lesson['spellingGuidance'] != null || lesson['spelling_guidance'] != null) ...[
          Builder(builder: (ctx) {
            final sg = (lesson['spellingGuidance'] ?? lesson['spelling_guidance']) as Map<String, dynamic>;
            return Container(
              padding: const EdgeInsets.all(14),
              margin: const EdgeInsets.only(bottom: 14),
              decoration: BoxDecoration(
                color: const Color(0xFFEFF6FF),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF93C5FD)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.spellcheck_rounded, color: Color(0xFF2563EB), size: 20),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      sg['message']?.toString() ?? 'Friendly spelling tip: "${sg['corrected']}"',
                      style: const TextStyle(color: Color(0xFF1E40AF), fontWeight: FontWeight.w600, fontSize: 13),
                    ),
                  ),
                ],
              ),
            );
          }),
        ],

        if (lesson['prerequisiteBridge'] != null || lesson['prerequisite_bridge'] != null) ...[
          Builder(builder: (ctx) {
            final pb = (lesson['prerequisiteBridge'] ?? lesson['prerequisite_bridge']) as Map<String, dynamic>;
            return Container(
              padding: const EdgeInsets.all(14),
              margin: const EdgeInsets.only(bottom: 14),
              decoration: BoxDecoration(
                color: const Color(0xFFF0FDF4),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF86EFAC)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Text('🌱', style: TextStyle(fontSize: 16)),
                      const SizedBox(width: 8),
                      Text(
                        'Foundational Prerequisite: ${pb['foundationConcept'] ?? pb['foundation_concept'] ?? 'Core Concepts'}',
                        style: const TextStyle(color: Color(0xFF166534), fontWeight: FontWeight.w800, fontSize: 13),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    pb['whyItMatters']?.toString() ?? pb['why_it_matters']?.toString() ?? '',
                    style: const TextStyle(color: Color(0xFF14532D), fontSize: 13, height: 1.4),
                  ),
                ],
              ),
            );
          }),
        ],

        // MODE BRANCHING
        if (_learningMode == 'normal') ...[
          // NORMAL LEARNING MODE (14 COMPONENTS)
          // 1. Topic Introduction
          StudyAiGlassCard(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('🌱 Component 1: Topic Introduction (Everyday Words)', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: StudyAiColors.greenAccent)),
                const SizedBox(height: 8),
                Text(
                  lesson['topic_overview'] ?? 'Let us explore $topic in simple everyday language. Everything works together in a coordinated flow.',
                  style: const TextStyle(fontSize: 14, color: StudyAiColors.textLight, height: 1.5),
                ),
                if (lesson['detailed_explanation'] != null) ...[
                  const SizedBox(height: 12),
                  const Divider(color: Colors.white10),
                  const SizedBox(height: 8),
                  const Text('Concept Overview & Academic Background', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: StudyAiColors.primary)),
                  const SizedBox(height: 6),
                  Text(lesson['detailed_explanation'] ?? '', style: const TextStyle(fontSize: 13, color: Colors.white70, height: 1.5)),
                ],
              ],
            ),
          ),
          const SizedBox(height: 16),

          // 2. What the Student Will Learn
          if (objectives.isNotEmpty) ...[
            StudyAiGlassCard(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('🎯 Component 2: What You Will Learn in This Topic', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: StudyAiColors.cyanAccent)),
                  const SizedBox(height: 10),
                  ...objectives.map((obj) => Padding(
                        padding: const EdgeInsets.only(bottom: 6),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Icon(Icons.check_circle_outline_rounded, size: 16, color: StudyAiColors.cyanAccent),
                            const SizedBox(width: 8),
                            Expanded(child: Text(obj, style: const TextStyle(fontSize: 13, color: Colors.white70))),
                          ],
                        ),
                      )),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],

          // 3. Prerequisites
          StudyAiGlassCard(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('🧭 Component 3: Prerequisites (Foundational Knowledge)', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFF60A5FA))),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: [
                    'Cell structures & membranes',
                    'Basic energy transformations',
                    'Atomic particles & charges',
                  ].map((pr) => Chip(
                    backgroundColor: Colors.white.withOpacity(0.06),
                    label: Text(pr, style: const TextStyle(fontSize: 11, color: Colors.white70)),
                  )).toList(),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // 4. Topic Breakdown (Subtopics)
          if (subtopics.isNotEmpty) ...[
            StudyAiGlassCard(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('📚 Component 4: Topic Breakdown (Logical Curriculum Sections)', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: StudyAiColors.amberAccent)),
                  const SizedBox(height: 10),
                  ...subtopics.map((sub) => Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(color: Colors.white.withOpacity(0.04), borderRadius: BorderRadius.circular(8)),
                        child: Row(
                          children: [
                            const Icon(Icons.play_arrow_rounded, color: StudyAiColors.amberAccent, size: 18),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(sub['title'] ?? '', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.white)),
                            ),
                          ],
                        ),
                      )),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],

          // 5. Concept Explanations with Integrated Three.js 3D Models & Visuals
          // (Positioning visuals directly beside or below the concept they explain)
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: [StudyAiColors.primaryDark.withOpacity(0.8), StudyAiColors.surface]),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: StudyAiColors.primary, width: 1.5),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 50,
                      height: 50,
                      decoration: BoxDecoration(color: Colors.white.withOpacity(0.15), shape: BoxShape.circle),
                      child: const Icon(Icons.view_in_ar_rounded, color: Colors.white, size: 28),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Component 5: Interactive 3D Model — $topic', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.white)),
                          const SizedBox(height: 2),
                          const Text('Visual positioned directly at the core concept. Orbit, zoom, and inspect layers.', style: TextStyle(fontSize: 11, color: Colors.white70)),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    ElevatedButton.icon(
                      onPressed: () {
                        Interactive3DDialog.show(context, modelTitle: modelId);
                      },
                      icon: const Icon(Icons.fullscreen_rounded, size: 18),
                      label: const Text('Open Interactive 3D Lab'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: StudyAiColors.primaryDark,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // 6. Step-by-Step Mechanisms
          StudyAiGlassCard(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('⚡ Component 6: Step-by-Step Mechanisms & Flow', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: StudyAiColors.primary)),
                const SizedBox(height: 10),
                ...[
                  'Phase 1: Activation and initial chemical / structural change.',
                  'Phase 2: Transfer across intermediate stages maintaining equilibrium.',
                  'Phase 3: Generation of biological output or energetic equilibrium.',
                ].asMap().entries.map((e) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                        decoration: BoxDecoration(color: StudyAiColors.primary.withOpacity(0.2), borderRadius: BorderRadius.circular(6)),
                        child: Text('Step ${e.key + 1}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: StudyAiColors.primary)),
                      ),
                      const SizedBox(width: 10),
                      Expanded(child: Text(e.value, style: const TextStyle(fontSize: 13, color: Colors.white70))),
                    ],
                  ),
                )),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // 7. Real-World Examples & Analogies
          StudyAiGlassCard(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('🌍 Component 7: Real-World Examples & Analogies', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: StudyAiColors.greenAccent)),
                const SizedBox(height: 8),
                Text(
                  'Analogy: Imagine a central pump and branching highway network where delivery trucks (hemoglobin) carry supplies to every house.',
                  style: const TextStyle(fontSize: 13, color: StudyAiColors.textLight, height: 1.5),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // 8. Important Terminology & Full Forms
          if (terms.isNotEmpty) ...[
            StudyAiGlassCard(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('🏷️ Component 8: Important Terminology & Full Forms', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: StudyAiColors.amberAccent)),
                  const SizedBox(height: 12),
                  ...terms.map((t) => Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(color: Colors.white.withOpacity(0.04), borderRadius: BorderRadius.circular(8)),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('${t['abbr']} — ${t['full_form']}', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: StudyAiColors.amberAccent)),
                            const SizedBox(height: 2),
                            Text(t['definition'], style: const TextStyle(fontSize: 12, color: StudyAiColors.textMuted)),
                          ],
                        ),
                      )),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],

          // 9. Common Misconceptions to Avoid
          if (misconceptions.isNotEmpty) ...[
            StudyAiGlassCard(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.warning_amber_rounded, color: StudyAiColors.redAccent, size: 18),
                      SizedBox(width: 8),
                      Text('⚠️ Component 9: Common Misunderstandings Corrected', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.white)),
                    ],
                  ),
                  const SizedBox(height: 10),
                  ...misconceptions.map((m) => Padding(
                        padding: const EdgeInsets.only(bottom: 6),
                        child: Text('• $m', style: const TextStyle(fontSize: 13, color: Colors.white70, height: 1.4)),
                      )),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],

          // 10. Check Your Understanding (Self-Check)
          if (questions.isNotEmpty) ...[
            const Text('🎯 Component 10: Understanding Checks (Interactive)', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Colors.white)),
            const SizedBox(height: 10),
            ...questions.asMap().entries.map((entry) {
              final idx = entry.key;
              final q = entry.value;
              final chosen = _userQuizAnswers[idx];

              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                child: StudyAiGlassCard(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Q${idx + 1}: ${q['question']}', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: Colors.white)),
                      const SizedBox(height: 8),
                      ...((q['options'] as List<dynamic>?) ?? []).map((opt) {
                        final optStr = opt.toString();
                        final isSelected = (chosen == optStr);
                        final isCorrect = (optStr == q['correct_answer']);
                        Color optBg = Colors.white.withOpacity(0.04);
                        if (chosen != null) {
                          if (isCorrect) optBg = StudyAiColors.greenAccent.withOpacity(0.25);
                          else if (isSelected) optBg = StudyAiColors.redAccent.withOpacity(0.25);
                        }

                        return GestureDetector(
                          onTap: () {
                            setState(() {
                              _userQuizAnswers[idx] = optStr;
                            });
                          },
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 6),
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            decoration: BoxDecoration(
                              color: optBg,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: isSelected ? StudyAiColors.primary : Colors.white.withOpacity(0.08)),
                            ),
                            child: Text(optStr, style: const TextStyle(fontSize: 12, color: Colors.white)),
                          ),
                        );
                      }),
                      if (chosen != null) ...[
                        const SizedBox(height: 6),
                        Text('Explanation: ${q['explanation']}', style: const TextStyle(fontSize: 11, color: StudyAiColors.cyanAccent)),
                      ]
                    ],
                  ),
                ),
              );
            }),
            const SizedBox(height: 16),
          ],

          // 11. Topic Summary
          StudyAiGlassCard(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('📌 Component 11: Topic Summary & Key Takeaways', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: StudyAiColors.greenAccent)),
                const SizedBox(height: 8),
                Text(
                  'Key takeaway: $topic functions as an interdependent physiological cycle. Ensure all sequence steps and structural connections are preserved.',
                  style: const TextStyle(fontSize: 13, color: Colors.white70, height: 1.5),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // 12. Topic Mastery Assessment
          StudyAiGlassCard(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('🏆 Component 12: Topic Mastery Assessment', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: StudyAiColors.primary)),
                const SizedBox(height: 6),
                const Text('Test your complete mastery under simulated examination conditions.', style: TextStyle(fontSize: 12, color: StudyAiColors.textMuted)),
                const SizedBox(height: 14),
                Row(
                  children: [
                    ElevatedButton.icon(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Starting 40-Mark Practice Exam for $topic...'), backgroundColor: StudyAiColors.primary),
                        );
                      },
                      icon: const Icon(Icons.assignment_turned_in_rounded),
                      label: const Text('Start 40-Mark Practice Exam'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: StudyAiColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ] else ...[
          // EXAM PREPARATION MODE
          // 1. Formal Academic Definitions
          StudyAiGlassCard(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('📘 Component 1: Formal Academic Definitions (Examiner Standard)', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF38BDF8))),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: const Color(0xFF0284C7).withOpacity(0.15), borderRadius: BorderRadius.circular(10)),
                  child: Text(
                    'Standard Definition: $topic is formally defined as the physiological or physical mechanism governing the designated curriculum topic.',
                    style: const TextStyle(fontSize: 13, color: Colors.white, height: 1.5),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // 2. Full Forms & Abbreviations Glossary
          if (terms.isNotEmpty) ...[
            StudyAiGlassCard(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('🔤 Component 2: Mandatory Full Forms & Abbreviations Glossary', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Colors.white)),
                  const SizedBox(height: 10),
                  ...terms.map((t) => Padding(
                        padding: const EdgeInsets.only(bottom: 6),
                        child: Text('${t['abbr']} = ${t['full_form']} (${t['definition']})', style: const TextStyle(fontSize: 12, color: Colors.white70)),
                      )),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],

          // 3. Must-Include Scoring Keywords
          StudyAiGlassCard(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('🏷️ Component 3: Must-Include Scoring Keywords', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFFFBBF24))),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: [topic, 'Double Circulation', 'Systole / Diastole', 'Valve Mechanism', 'Aorta'].map((kw) => Chip(
                    backgroundColor: const Color(0xFFFBBF24).withOpacity(0.15),
                    label: Text(kw, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFFFBBF24))),
                  )).toList(),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // 4. Governing Formulas & Scientific Equations
          StudyAiGlassCard(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('⚡ Component 4: Governing Formulas & Scientific Equations', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: StudyAiColors.greenAccent)),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: StudyAiColors.greenAccent.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
                  child: const Center(
                    child: Text('Cardiac Output (CO) = Stroke Volume (SV) × Heart Rate (HR)', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: StudyAiColors.greenAccent)),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // 5. Labeled Examination Schematics & 3D Structures
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: [const Color(0xFF0369A1).withOpacity(0.8), StudyAiColors.surface]),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF38BDF8), width: 1.5),
            ),
            child: Row(
              children: [
                const Icon(Icons.architecture_rounded, color: Color(0xFF38BDF8), size: 36),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Component 5: Labeled Examination Schematics', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Colors.white)),
                      const SizedBox(height: 2),
                      const Text('Students must reproduce labeled diagrams in 5-mark board questions.', style: TextStyle(fontSize: 11, color: Colors.white70)),
                    ],
                  ),
                ),
                ElevatedButton(
                  onPressed: () => Interactive3DDialog.show(context, modelTitle: modelId),
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0284C7)),
                  child: const Text('View 3D Schematic', style: TextStyle(fontSize: 12)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // 6. Comparisons & Differences Table
          StudyAiGlassCard(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('⚖️ Component 6: Classic Board Exam Comparison Table', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Colors.white)),
                const SizedBox(height: 10),
                Table(
                  border: TableBorder.all(color: Colors.white12),
                  children: const [
                    TableRow(children: [
                      Padding(padding: EdgeInsets.all(8), child: Text('Criteria', style: TextStyle(fontWeight: FontWeight.w800, color: StudyAiColors.primary, fontSize: 12))),
                      Padding(padding: EdgeInsets.all(8), child: Text('Arteries', style: TextStyle(fontWeight: FontWeight.w800, color: Colors.white, fontSize: 12))),
                      Padding(padding: EdgeInsets.all(8), child: Text('Veins', style: TextStyle(fontWeight: FontWeight.w800, color: Colors.white, fontSize: 12))),
                    ]),
                    TableRow(children: [
                      Padding(padding: EdgeInsets.all(8), child: Text('Wall Thickness', style: TextStyle(color: Colors.white70, fontSize: 11))),
                      Padding(padding: EdgeInsets.all(8), child: Text('Thick muscular walls', style: TextStyle(color: Colors.white70, fontSize: 11))),
                      Padding(padding: EdgeInsets.all(8), child: Text('Thin walls with valves', style: TextStyle(color: Colors.white70, fontSize: 11))),
                    ]),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // 7. Examiner Tips & Scoring Traps
          StudyAiGlassCard(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('💡 Component 7: Examiner Tips & Scoring Pitfalls', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFFFBBF24))),
                const SizedBox(height: 8),
                const Text('• Never omit arrowheads on blood flow vectors; markers deduct 1 mark.', style: TextStyle(fontSize: 12, color: Colors.white70)),
                const Text('• Highlight the distinction between oxygenated and deoxygenated chambers.', style: TextStyle(fontSize: 12, color: Colors.white70)),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // 8. 40-Mark Practice Exam Challenge
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFF0284C7), Color(0xFF0369A1)]),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('⚡ Component 8: 40-Mark Mock Practice Examination', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white)),
                      const SizedBox(height: 4),
                      Text('Test yourself on $topic with Option 1 (Objective), Option 2 (Mixed), or Option 3 (Descriptive).', style: const TextStyle(fontSize: 12, color: Colors.white70)),
                    ],
                  ),
                ),
                const SizedBox(width: 14),
                ElevatedButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Starting full 40-mark practice test for $topic...'), backgroundColor: const Color(0xFF0284C7)),
                    );
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.white, foregroundColor: const Color(0xFF0284C7)),
                  child: const Text('Start 40M Test', style: TextStyle(fontWeight: FontWeight.w800)),
                ),
              ],
            ),
          ),
        ],

        const SizedBox(height: 20),
        _buildInteractiveTeacherBar(context),
      ],
    );
  }

  Widget _buildInteractiveTeacherBar(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Ask the Teacher (Context-Preserved):', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.white)),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            _buildFollowUpChip('Make it simpler', 'simpler'),
            _buildFollowUpChip('Explain step-by-step', 'step_by_step'),
            _buildFollowUpChip('Explain selected 3D part', 'explain_part'),
            _buildFollowUpChip('Give another example', 'another_example'),
            _buildFollowUpChip('Compare concepts', 'compare'),
          ],
        ),
      ],
    );
  }

  Widget _buildFollowUpChip(String label, String actionType) {
    return ActionChip(
      backgroundColor: StudyAiColors.primary.withOpacity(0.12),
      side: const BorderSide(color: StudyAiColors.primary, width: 1),
      label: Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.white)),
      onPressed: () => _requestFollowUp(actionType),
    );
  }
}
