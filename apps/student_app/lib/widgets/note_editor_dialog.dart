import 'package:flutter/material.dart';
import 'package:shared_models/shared_models.dart';
import 'package:shared_ui/shared_ui.dart';

class NoteDetailViewerDialog extends StatefulWidget {
  final StudyNote note;
  final Function(String title, String content)? onSave;

  const NoteDetailViewerDialog({
    Key? key,
    required this.note,
    this.onSave,
  }) : super(key: key);

  static void show(BuildContext context, {required StudyNote note, Function(String, String)? onSave}) {
    showDialog(
      context: context,
      builder: (ctx) => NoteDetailViewerDialog(note: note, onSave: onSave),
    );
  }

  @override
  State<NoteDetailViewerDialog> createState() => _NoteDetailViewerDialogState();
}

class _NoteDetailViewerDialogState extends State<NoteDetailViewerDialog> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  late TextEditingController _titleController;
  late TextEditingController _contentController;
  bool _isEditing = false;
  int _activeFlashcardIndex = 0;
  bool _isCardFlipped = false;
  Map<int, String> _quizSelections = {};

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _titleController = TextEditingController(text: widget.note.title);
    _contentController = TextEditingController(text: widget.note.contentMarkdown);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _titleController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
      child: StudyAiGlassCard(
        padding: const EdgeInsets.all(24),
        child: SizedBox(
          width: 850,
          height: 650,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: _isEditing
                        ? TextField(
                            controller: _titleController,
                            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Colors.white),
                            decoration: const InputDecoration(border: InputBorder.none, hintText: 'Note Title'),
                          )
                        : Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _titleController.text,
                                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: StudyAiColors.textLight),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '${widget.note.subject} • ${widget.note.topic} • ${widget.note.notebook}',
                                style: const TextStyle(fontSize: 12, color: StudyAiColors.textMuted),
                              ),
                            ],
                          ),
                  ),
                  Row(
                    children: [
                      IconButton(
                        icon: Icon(_isEditing ? Icons.save_rounded : Icons.edit_note_rounded, color: StudyAiColors.primary),
                        tooltip: _isEditing ? 'Save Changes' : 'Edit Note',
                        onPressed: () {
                          if (_isEditing && widget.onSave != null) {
                            widget.onSave!(_titleController.text, _contentController.text);
                          }
                          setState(() {
                            _isEditing = !_isEditing;
                          });
                        },
                      ),
                      IconButton(
                        icon: const Icon(Icons.share_rounded, color: StudyAiColors.cyanAccent),
                        tooltip: 'Export Note',
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Note exported as printable Markdown!'),
                              backgroundColor: StudyAiColors.surface,
                            ),
                          );
                        },
                      ),
                      IconButton(
                        icon: const Icon(Icons.close_rounded, color: StudyAiColors.textLight),
                        onPressed: () => Navigator.of(context).pop(),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 12),
              // Tab Bar
              TabBar(
                controller: _tabController,
                indicatorColor: StudyAiColors.primary,
                labelColor: StudyAiColors.primary,
                unselectedLabelColor: StudyAiColors.textMuted,
                tabs: [
                  const Tab(text: 'Note Content'),
                  Tab(text: 'Flashcards (${widget.note.flashcards.length})'),
                  Tab(text: 'Quiz (${widget.note.quiz.length})'),
                ],
              ),
              const SizedBox(height: 16),
              // Tab Body
              Expanded(
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    _buildMarkdownTab(),
                    _buildFlashcardsTab(),
                    _buildQuizTab(),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMarkdownTab() {
    if (_isEditing) {
      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: StudyAiColors.background.withOpacity(0.5),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.white.withOpacity(0.1)),
        ),
        child: TextField(
          controller: _contentController,
          maxLines: null,
          expands: true,
          style: const TextStyle(fontSize: 14, color: StudyAiColors.textLight, height: 1.5),
          decoration: const InputDecoration(border: InputBorder.none, hintText: 'Enter Markdown content...'),
        ),
      );
    }

    return SingleChildScrollView(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: StudyAiColors.background.withOpacity(0.4),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(
          _contentController.text,
          style: const TextStyle(fontSize: 14, color: StudyAiColors.textLight, height: 1.6),
        ),
      ),
    );
  }

  Widget _buildFlashcardsTab() {
    if (widget.note.flashcards.isEmpty) {
      return const StudyAiEmptyView(
        title: 'No Flashcards Yet',
        description: 'Flashcards generated from this study note will appear here.',
        icon: Icons.style_rounded,
      );
    }

    final card = widget.note.flashcards[_activeFlashcardIndex];

    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        GestureDetector(
          onTap: () {
            setState(() {
              _isCardFlipped = !_isCardFlipped;
            });
          },
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 250),
            width: 480,
            height: 240,
            padding: const EdgeInsets.all(28),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: _isCardFlipped
                    ? [StudyAiColors.primaryDark.withOpacity(0.9), StudyAiColors.primaryLight.withOpacity(0.9)]
                    : [StudyAiColors.surface, StudyAiColors.surfaceLight],
              ),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: Colors.white.withOpacity(0.2)),
              boxShadow: [
                BoxShadow(color: Colors.black.withOpacity(0.25), blurRadius: 18, offset: const Offset(0, 8)),
              ],
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  _isCardFlipped ? 'ANSWER / CONCEPT' : 'QUESTION / PROMPT',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1.0,
                    color: _isCardFlipped ? Colors.white70 : StudyAiColors.cyanAccent,
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  _isCardFlipped ? card.back : card.front,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                    height: 1.4,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                Text(
                  'Tap to flip card',
                  style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.6)),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 20),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            IconButton(
              icon: const Icon(Icons.arrow_back_ios_rounded, color: Colors.white),
              onPressed: _activeFlashcardIndex > 0
                  ? () {
                      setState(() {
                        _activeFlashcardIndex--;
                        _isCardFlipped = false;
                      });
                    }
                  : null,
            ),
            Text(
              '${_activeFlashcardIndex + 1} / ${widget.note.flashcards.length}',
              style: const TextStyle(fontWeight: FontWeight.w700, color: StudyAiColors.textLight),
            ),
            IconButton(
              icon: const Icon(Icons.arrow_forward_ios_rounded, color: Colors.white),
              onPressed: _activeFlashcardIndex < widget.note.flashcards.length - 1
                  ? () {
                      setState(() {
                        _activeFlashcardIndex++;
                        _isCardFlipped = false;
                      });
                    }
                  : null,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildQuizTab() {
    if (widget.note.quiz.isEmpty) {
      return const StudyAiEmptyView(
        title: 'No Practice Questions',
        description: 'Auto-generated multiple-choice questions for this topic will appear here.',
        icon: Icons.quiz_rounded,
      );
    }

    return ListView.builder(
      itemCount: widget.note.quiz.length,
      itemBuilder: (ctx, i) {
        final q = widget.note.quiz[i];
        final selected = _quizSelections[i];

        return StudyAiGlassCard(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Q${i + 1}: ${q.question}',
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Colors.white),
              ),
              const SizedBox(height: 12),
              ...q.options.map((opt) {
                final isChosen = (selected == opt);
                final isAnswer = (opt.toLowerCase().trim() == q.answer.toLowerCase().trim());
                Color optColor = Colors.white.withOpacity(0.08);
                if (selected != null) {
                  if (isAnswer) optColor = StudyAiColors.greenAccent.withOpacity(0.3);
                  else if (isChosen) optColor = StudyAiColors.redAccent.withOpacity(0.3);
                }

                return GestureDetector(
                  onTap: () {
                    setState(() {
                      _quizSelections[i] = opt;
                    });
                  },
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: optColor,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: isChosen ? StudyAiColors.primary : Colors.white.withOpacity(0.12),
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          isChosen ? Icons.radio_button_checked : Icons.radio_button_unchecked,
                          size: 16,
                          color: isChosen ? StudyAiColors.primary : StudyAiColors.textMuted,
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            opt,
                            style: TextStyle(
                              fontSize: 13,
                              color: isChosen ? Colors.white : StudyAiColors.textLight.withOpacity(0.9),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }),
            ],
          ),
        );
      },
    );
  }
}
