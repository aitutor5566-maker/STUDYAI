class LessonSubtopic {
  final String subtopicId;
  final String title;
  final String learningObjective;
  final bool has3dSupport;

  LessonSubtopic({
    required this.subtopicId,
    required this.title,
    required this.learningObjective,
    this.has3dSupport = false,
  });

  factory LessonSubtopic.fromJson(Map<String, dynamic> json) {
    return LessonSubtopic(
      subtopicId: json['subtopic_id'] ?? json['id'] ?? '',
      title: json['title'] ?? '',
      learningObjective: json['learning_objective'] ?? json['objective'] ?? '',
      has3dSupport: json['has_3d_support'] ?? json['has3dSupport'] ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'subtopic_id': subtopicId,
        'title': title,
        'learning_objective': learningObjective,
        'has_3d_support': has3dSupport,
      };
}

class LessonExplanation {
  final String topic;
  final String subject;
  final String mode;
  final int grade;
  final String introduction;
  final List<String> keySteps;
  final List<String> keywords;
  final List<LessonSubtopic> subtopics;
  final String? imageUrl;
  final String? imageCaption;
  final String? model3dType;

  LessonExplanation({
    required this.topic,
    required this.subject,
    required this.mode,
    required this.grade,
    required this.introduction,
    required this.keySteps,
    required this.keywords,
    this.subtopics = const [],
    this.imageUrl,
    this.imageCaption,
    this.model3dType,
  });

  factory LessonExplanation.fromJson(Map<String, dynamic> json) {
    return LessonExplanation(
      topic: json['topic'] ?? '',
      subject: json['subject'] ?? 'Science',
      mode: json['mode'] ?? 'detailed',
      grade: (json['grade'] as num?)?.toInt() ?? 10,
      introduction: json['introduction'] ?? '',
      keySteps: List<String>.from(json['keySteps'] ?? json['key_steps'] ?? []),
      keywords: List<String>.from(json['keywords'] ?? []),
      subtopics: (json['subtopics'] as List<dynamic>?)
              ?.map((s) => LessonSubtopic.fromJson(s as Map<String, dynamic>))
              .toList() ??
          [],
      imageUrl: json['imageUrl'] ?? json['image_url'],
      imageCaption: json['imageCaption'] ?? json['image_caption'],
      model3dType: json['model3dType'] ?? json['model_3d_type'],
    );
  }
}
