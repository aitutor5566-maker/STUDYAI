import 'package:flutter/material.dart';
import 'package:shared_ui/shared_ui.dart';
import '../state/student_app_state.dart';
import '../widgets/interactive_3d_dialog.dart';

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
        // Top Action Bar: Save to Notes CTA
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            StudyAiGlassPill(
              label: '${lesson['subject']} • ${lesson['level']}',
              icon: Icons.verified_rounded,
              color: StudyAiColors.greenAccent,
              isSelected: true,
            ),
            ElevatedButton.icon(
              onPressed: _saveLessonToNotes,
              icon: const Icon(Icons.bookmark_add_rounded, size: 18),
              label: const Text('Save to AI Notes', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
              style: ElevatedButton.styleFrom(
                backgroundColor: StudyAiColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // 1. Topic Overview & Objectives Card
        StudyAiGlassCard(
          padding: const EdgeInsets.all(22),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Lesson Overview: $topic', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Colors.white)),
              const SizedBox(height: 10),
              Text(lesson['topic_overview'] ?? '', style: const TextStyle(fontSize: 14, color: StudyAiColors.textLight, height: 1.5)),
              const SizedBox(height: 16),
              const Text('Learning Objectives:', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: StudyAiColors.cyanAccent)),
              const SizedBox(height: 8),
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
        const SizedBox(height: 20),

        // 2. Interactive Three.js 3D Model Card
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: LinearGradient(colors: [StudyAiColors.primaryDark.withOpacity(0.8), StudyAiColors.surface]),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: StudyAiColors.primary, width: 1.5),
          ),
          child: Row(
            children: [
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(color: Colors.white.withOpacity(0.15), shape: BoxShape.circle),
                child: const Icon(Icons.view_in_ar_rounded, color: Colors.white, size: 32),
              ),
              const SizedBox(width: 18),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Three.js Simulation: $topic', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white)),
                    const SizedBox(height: 4),
                    const Text('Inspect organelle anatomy, rotate camera, and test exploded layers.', style: TextStyle(fontSize: 12, color: Colors.white70)),
                  ],
                ),
              ),
              ElevatedButton.icon(
                onPressed: () {
                  Interactive3DDialog.show(context, modelTitle: modelId);
                },
                icon: const Icon(Icons.fullscreen_rounded),
                label: const Text('Open 3D Model'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: StudyAiColors.primaryDark,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        // 3. Detailed Explanation
        StudyAiGlassCard(
          padding: const EdgeInsets.all(22),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Detailed Educational Explanation', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: StudyAiColors.primary)),
              const SizedBox(height: 12),
              Text(
                lesson['detailed_explanation'] ?? '',
                style: const TextStyle(fontSize: 14, color: StudyAiColors.textLight, height: 1.6),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        // 4. Terminology & Full Forms (No abbreviations left unexplained!)
        if (terms.isNotEmpty) ...[
          StudyAiGlassCard(
            padding: const EdgeInsets.all(22),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Important Terminology & Full Forms', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: StudyAiColors.amberAccent)),
                const SizedBox(height: 12),
                ...terms.map((t) => Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: Colors.white.withOpacity(0.04), borderRadius: BorderRadius.circular(10)),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(t['abbr'], style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: StudyAiColors.amberAccent)),
                              const SizedBox(width: 8),
                              Text('— ${t['full_form']}', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: Colors.white)),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(t['definition'], style: const TextStyle(fontSize: 12, color: StudyAiColors.textMuted)),
                        ],
                      ),
                    )),
              ],
            ),
          ),
          const SizedBox(height: 20),
        ],

        // 5. Interactive Teacher Follow-Up Actions
        _buildInteractiveTeacherBar(context),
        if (_followUpResponse != null) ...[
          const SizedBox(height: 12),
          StudyAiGlassCard(
            padding: const EdgeInsets.all(16),
            child: Text(
              _followUpResponse!,
              style: const TextStyle(fontSize: 14, color: StudyAiColors.cyanAccent, height: 1.5),
            ),
          ),
        ],
        const SizedBox(height: 20),

        // 6. Subtopics Breakdown
        if (subtopics.isNotEmpty) ...[
          const Text('Curriculum Subtopics', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white)),
          const SizedBox(height: 10),
          ...subtopics.map((sub) => Container(
                margin: const EdgeInsets.only(bottom: 12),
                child: StudyAiGlassCard(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(sub['title'] ?? '', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Colors.white)),
                      const SizedBox(height: 4),
                      Text(sub['learning_objective'] ?? '', style: const TextStyle(fontSize: 12, color: StudyAiColors.textMuted)),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        children: ((sub['concepts'] as List<dynamic>?) ?? []).map((c) {
                          return Chip(
                            backgroundColor: Colors.white.withOpacity(0.06),
                            label: Text(c.toString(), style: const TextStyle(fontSize: 11, color: Colors.white70)),
                          );
                        }).toList(),
                      ),
                    ],
                  ),
                ),
              )),
          const SizedBox(height: 20),
        ],

        // 7. Common Misconceptions
        if (misconceptions.isNotEmpty) ...[
          StudyAiGlassCard(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.warning_amber_rounded, color: StudyAiColors.redAccent, size: 20),
                    SizedBox(width: 8),
                    Text('Common Misconceptions to Avoid', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Colors.white)),
                  ],
                ),
                const SizedBox(height: 12),
                ...misconceptions.map((m) => Padding(
                      padding: const EdgeInsets.only(bottom: 6),
                      child: Text(m, style: const TextStyle(fontSize: 13, color: Colors.white70, height: 1.4)),
                    )),
              ],
            ),
          ),
          const SizedBox(height: 20),
        ],

        // 8. Self-Check Understanding Questions
        if (questions.isNotEmpty) ...[
          const Text('Check Your Understanding (Interactive)', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white)),
          const SizedBox(height: 10),
          ...questions.asMap().entries.map((entry) {
            final idx = entry.key;
            final q = entry.value;
            final chosen = _userQuizAnswers[idx];

            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              child: StudyAiGlassCard(
                padding: const EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Q${idx + 1}: ${q['question']}', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: Colors.white)),
                    const SizedBox(height: 10),
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
                      const SizedBox(height: 8),
                      Text('Explanation: ${q['explanation']}', style: const TextStyle(fontSize: 11, color: StudyAiColors.cyanAccent)),
                    ]
                  ],
                ),
              ),
            );
          }),
        ],
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
