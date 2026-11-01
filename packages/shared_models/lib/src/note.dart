class NoteFlashcard {
  final String front;
  final String back;

  NoteFlashcard({required this.front, required this.back});

  factory NoteFlashcard.fromJson(Map<String, dynamic> json) {
    return NoteFlashcard(
      front: json['front'] ?? json['question'] ?? '',
      back: json['back'] ?? json['answer'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {'front': front, 'back': back};
}

class NoteQuizItem {
  final String question;
  final List<String> options;
  final String answer;

  NoteQuizItem({
    required this.question,
    required this.options,
    required this.answer,
  });

  factory NoteQuizItem.fromJson(Map<String, dynamic> json) {
    return NoteQuizItem(
      question: json['question'] ?? '',
      options: (json['options'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      answer: json['answer'] ?? json['correct_answer'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'question': question,
        'options': options,
        'answer': answer,
      };
}

class StudyNote {
  final String id;
  final String title;
  final String subject;
  final String topic;
  final String notebook;
  final String contentMarkdown;
  final List<NoteFlashcard> flashcards;
  final List<NoteQuizItem> quiz;
  final List<Map<String, dynamic>> citations;
  final DateTime createdAt;

  StudyNote({
    required this.id,
    required this.title,
    required this.subject,
    required this.topic,
    required this.contentMarkdown,
    this.notebook = 'General',
    this.flashcards = const [],
    this.quiz = const [],
    this.citations = const [],
    DateTime? createdAt,
  }) : createdAt = createdAt ?? DateTime.now();

  factory StudyNote.fromJson(Map<String, dynamic> json) {
    final rawFlashcards = json['flashcards_json'] ?? json['flashcards'];
    final rawQuiz = json['quiz_json'] ?? json['quiz'];
    final rawCitations = json['citations_json'] ?? json['citations'];

    return StudyNote(
      id: json['id'] as String,
      title: json['title'] as String,
      subject: json['subject'] ?? 'Science',
      topic: json['topic'] ?? '',
      notebook: json['notebook_name'] ?? json['notebook'] ?? 'General',
      contentMarkdown: json['content_markdown'] ?? json['content'] ?? '',
      flashcards: rawFlashcards is List
          ? rawFlashcards.map((e) => NoteFlashcard.fromJson(Map<String, dynamic>.from(e as Map))).toList()
          : [],
      quiz: rawQuiz is List
          ? rawQuiz.map((e) => NoteQuizItem.fromJson(Map<String, dynamic>.from(e as Map))).toList()
          : [],
      citations: rawCitations is List
          ? rawCitations.map((e) => Map<String, dynamic>.from(e as Map)).toList()
          : [],
      createdAt: json['created_at'] != null ? DateTime.tryParse(json['created_at'] as String) : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'subject': subject,
        'topic': topic,
        'notebook_name': notebook,
        'content_markdown': contentMarkdown,
        'flashcards': flashcards.map((e) => e.toJson()).toList(),
        'quiz': quiz.map((e) => e.toJson()).toList(),
        'citations': citations,
        'created_at': createdAt.toIso8601String(),
      };
}
