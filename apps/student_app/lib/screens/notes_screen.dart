import 'package:flutter/material.dart';
import 'package:shared_models/shared_models.dart';
import 'package:shared_ui/shared_ui.dart';
import '../state/student_app_state.dart';
import '../widgets/note_editor_dialog.dart';

class NotesScreen extends StatefulWidget {
  final StudentAppState state;

  const NotesScreen({Key? key, required this.state}) : super(key: key);

  @override
  State<NotesScreen> createState() => _NotesScreenState();
}

class _NotesScreenState extends State<NotesScreen> {
  String _selectedFolder = 'All';
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _showCreateNoteModal(BuildContext context) {
    final titleController = TextEditingController();
    final topicController = TextEditingController(text: widget.state.activeTopic);
    final contentController = TextEditingController();
    String selectedSubject = 'Science';
    String selectedSource = 'topic'; // topic, lesson, pdf, image, video
    bool isGenerating = false;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) => Dialog(
          backgroundColor: Colors.transparent,
          insetPadding: const EdgeInsets.all(24),
          child: StudyAiGlassCard(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: BoxConstraints(
                maxWidth: 580,
                maxHeight: MediaQuery.of(context).size.height * 0.85,
              ),
              child: SingleChildScrollView(
                child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Create AI Study Notebook', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Colors.white)),
                      IconButton(icon: const Icon(Icons.close, color: Colors.white), onPressed: () => Navigator.of(context).pop()),
                    ],
                  ),
                  const SizedBox(height: 12),
                  // Source Selector Pills
                  const Text('Select Source:', style: TextStyle(fontSize: 12, color: StudyAiColors.textMuted)),
                  const SizedBox(height: 6),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        {'id': 'topic', 'label': 'Topic', 'icon': Icons.lightbulb_outline},
                        {'id': 'lesson', 'label': 'AI Tutor Lesson', 'icon': Icons.school_outlined},
                        {'id': 'pdf', 'label': 'PDF Document', 'icon': Icons.picture_as_pdf_outlined},
                        {'id': 'image', 'label': 'Diagram / Image', 'icon': Icons.image_outlined},
                        {'id': 'video', 'label': 'Video Transcript', 'icon': Icons.subtitles_outlined},
                      ].map((s) {
                        final isSel = selectedSource == s['id'];
                        return Padding(
                          padding: const EdgeInsets.only(right: 6),
                          child: ChoiceChip(
                            avatar: Icon(s['icon'] as IconData, size: 14, color: isSel ? Colors.white : StudyAiColors.primary),
                            label: Text(s['label'] as String, style: TextStyle(fontSize: 11, color: isSel ? Colors.white : Colors.white70)),
                            selected: isSel,
                            selectedColor: StudyAiColors.primary,
                            backgroundColor: Colors.white.withOpacity(0.06),
                            onSelected: (val) {
                              if (val) setModalState(() => selectedSource = s['id'] as String);
                            },
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: topicController,
                          style: const TextStyle(color: Colors.white),
                          decoration: InputDecoration(
                            labelText: 'Topic / Chapter Title',
                            labelStyle: const TextStyle(color: StudyAiColors.textMuted),
                            filled: true,
                            fillColor: Colors.white.withOpacity(0.05),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.05),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: Colors.white.withOpacity(0.12)),
                        ),
                        child: DropdownButton<String>(
                          value: selectedSubject,
                          dropdownColor: StudyAiColors.surface,
                          underline: const SizedBox(),
                          style: const TextStyle(color: Colors.white, fontSize: 13),
                          items: ['Science', 'Physics', 'Chemistry', 'Biology', 'Mathematics', 'History'].map((subj) {
                            return DropdownMenuItem(value: subj, child: Text(subj));
                          }).toList(),
                          onChanged: (val) {
                            if (val != null) setModalState(() => selectedSubject = val);
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: contentController,
                    maxLines: 4,
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    decoration: InputDecoration(
                      labelText: selectedSource == 'video'
                          ? 'Video Transcript / Milestones ([01:30] Introduction...)'
                          : selectedSource == 'pdf'
                              ? 'PDF Document Text / Chapter Excerpt'
                              : selectedSource == 'image'
                                  ? 'Image / Diagram OCR Text or Description'
                                  : 'Optional Source Notes / Key Highlights',
                      labelStyle: const TextStyle(color: StudyAiColors.textMuted),
                      filled: true,
                      fillColor: Colors.white.withOpacity(0.05),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                  const SizedBox(height: 18),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('Cancel', style: TextStyle(color: Colors.white70))),
                      const SizedBox(width: 12),
                      ElevatedButton(
                        onPressed: isGenerating
                            ? null
                            : () async {
                                final topic = topicController.text.trim();
                                if (topic.isEmpty) return;
                                setModalState(() => isGenerating = true);
                                await widget.state.generateNoteFromSource(
                                  topic: topic,
                                  subject: selectedSubject,
                                  sourceType: selectedSource,
                                  content: contentController.text.trim(),
                                );
                                Navigator.of(context).pop();
                              },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: StudyAiColors.primary,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        child: isGenerating
                            ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                            : const Text('Generate AI Notebook'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    ),
  );
}

  @override
  Widget build(BuildContext context) {
    final filteredNotes = widget.state.notesList.where((note) {
      final matchesFolder = (_selectedFolder == 'All' || note.subject.toLowerCase() == _selectedFolder.toLowerCase());
      final matchesSearch = (_searchQuery.isEmpty ||
          note.title.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          note.topic.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          note.contentMarkdown.toLowerCase().contains(_searchQuery.toLowerCase()));
      return matchesFolder && matchesSearch;
    }).toList();

    return StudyAiResponsiveContainer(
      maxWidth: 1380,
      child: SingleChildScrollView(
        padding: StudyAiBreakpoints.pagePadding(context),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header & Create CTA
            Wrap(
              spacing: 16,
              runSpacing: 12,
              alignment: WrapAlignment.spaceBetween,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('AI Study Notes', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: StudyAiColors.textLight)),
                    SizedBox(height: 4),
                    Text('NotebookLM-inspired smart notebooks with auto-flashcards & quizzes', style: TextStyle(fontSize: 13, color: StudyAiColors.textMuted)),
                  ],
                ),
                ElevatedButton.icon(
                  onPressed: () => _showCreateNoteModal(context),
                  icon: const Icon(Icons.add_rounded, size: 20),
                  label: const Text('New Note', style: TextStyle(fontWeight: FontWeight.w700)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: StudyAiColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

          // Search Bar
          TextField(
            controller: _searchController,
            onChanged: (val) {
              setState(() {
                _searchQuery = val.trim();
              });
            },
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              hintText: 'Search notes by keyword, topic or chapter...',
              hintStyle: const TextStyle(color: StudyAiColors.textMuted, fontSize: 14),
              prefixIcon: const Icon(Icons.search_rounded, color: StudyAiColors.primary),
              suffixIcon: _searchQuery.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear, color: Colors.white70),
                      onPressed: () {
                        _searchController.clear();
                        setState(() {
                          _searchQuery = '';
                        });
                      },
                    )
                  : null,
              filled: true,
              fillColor: StudyAiColors.surface.withOpacity(0.6),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: StudyAiColors.glassBorder)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: StudyAiColors.glassBorder)),
            ),
          ),
          const SizedBox(height: 16),

          // Folder Filter Pills
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: ['All', 'Science', 'Mathematics', 'Biology', 'General'].map((folder) {
                final isSelected = (_selectedFolder == folder);
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: StudyAiGlassPill(
                    label: folder,
                    isSelected: isSelected,
                    onTap: () {
                      setState(() {
                        _selectedFolder = folder;
                      });
                    },
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 24),

          // Notes List or Empty View
          if (filteredNotes.isEmpty)
            StudyAiEmptyView(
              title: _searchQuery.isNotEmpty ? 'No Notes Match Query' : 'No Study Notebooks Created',
              description: _searchQuery.isNotEmpty
                  ? 'Try adjusting your search terms or selecting a different folder.'
                  : 'Start taking notes or ask the AI Tutor to generate a comprehensive study guide.',
              icon: Icons.note_alt_outlined,
              actionLabel: 'Create First Note',
              onAction: () => _showCreateNoteModal(context),
            )
          else
            LayoutBuilder(
              builder: (ctx, constraints) {
                final crossAxisCount = constraints.maxWidth >= 900 ? 3 : (constraints.maxWidth >= 600 ? 2 : 1);
                return GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: filteredNotes.length,
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: crossAxisCount,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                    childAspectRatio: 1.5,
                  ),
                  itemBuilder: (ctx, idx) {
                    final note = filteredNotes[idx];
                    return StudyAiGlassCard(
                      onTap: () {
                        NoteDetailViewerDialog.show(context, note: note);
                      },
                      padding: const EdgeInsets.all(18),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: StudyAiColors.primary.withOpacity(0.18),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  note.subject.toUpperCase(),
                                  style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: StudyAiColors.primary),
                                ),
                              ),
                              PopupMenuButton<String>(
                                icon: const Icon(Icons.more_horiz, color: StudyAiColors.textMuted, size: 20),
                                color: StudyAiColors.surface,
                                onSelected: (action) {
                                  if (action == 'delete') {
                                    widget.state.deleteNote(note.id);
                                  } else if (action == 'open') {
                                    NoteDetailViewerDialog.show(context, note: note);
                                  }
                                },
                                itemBuilder: (ctx) => [
                                  const PopupMenuItem(value: 'open', child: Text('Open Note', style: TextStyle(color: Colors.white))),
                                  const PopupMenuItem(value: 'delete', child: Text('Delete Note', style: TextStyle(color: StudyAiColors.redAccent))),
                                ],
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Text(
                            note.title,
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 6),
                          Expanded(
                            child: Text(
                              note.contentMarkdown,
                              style: const TextStyle(fontSize: 12, color: StudyAiColors.textMuted, height: 1.4),
                              maxLines: 3,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              if (note.flashcards.isNotEmpty) ...[
                                const Icon(Icons.style_rounded, size: 14, color: StudyAiColors.cyanAccent),
                                const SizedBox(width: 4),
                                Text('${note.flashcards.length} cards', style: const TextStyle(fontSize: 11, color: StudyAiColors.textMuted)),
                                const SizedBox(width: 12),
                              ],
                              if (note.quiz.isNotEmpty) ...[
                                const Icon(Icons.quiz_rounded, size: 14, color: StudyAiColors.greenAccent),
                                const SizedBox(width: 4),
                                Text('${note.quiz.length} quiz', style: const TextStyle(fontSize: 11, color: StudyAiColors.textMuted)),
                              ],
                            ],
                          ),
                        ],
                      ),
                    );
                  },
                );
              },
            ),
          const SizedBox(height: 40),
        ],
      ),
    ),
  );
}
}
