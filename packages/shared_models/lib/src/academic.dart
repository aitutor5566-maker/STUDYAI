class Examination {
  final String id;
  final String title;
  final String subject;
  final String grade;
  final String examType;
  final int totalMarks;
  final int durationMinutes;
  final bool isPublished;

  Examination({
    required this.id,
    required this.title,
    required this.subject,
    this.grade = 'Grade 10',
    this.examType = 'weekly',
    this.totalMarks = 20,
    this.durationMinutes = 30,
    this.isPublished = true,
  });

  factory Examination.fromJson(Map<String, dynamic> json) {
    return Examination(
      id: json['id'] as String,
      title: json['title'] as String,
      subject: json['subject'] ?? 'Science',
      grade: json['grade'] ?? 'Grade 10',
      examType: json['exam_type'] ?? 'weekly',
      totalMarks: (json['total_marks'] as num?)?.toInt() ?? 20,
      durationMinutes: (json['duration_minutes'] as num?)?.toInt() ?? 30,
      isPublished: json['is_published'] ?? true,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'subject': subject,
        'grade': grade,
        'exam_type': examType,
        'total_marks': totalMarks,
        'duration_minutes': durationMinutes,
        'is_published': isPublished,
      };
}

class SubjectProgress {
  final String id;
  final String subject;
  final String topic;
  final double masteryLevel;
  final double completionPercentage;
  final int totalStudyMinutes;

  SubjectProgress({
    required this.id,
    required this.subject,
    required this.topic,
    required this.masteryLevel,
    required this.completionPercentage,
    required this.totalStudyMinutes,
  });

  factory SubjectProgress.fromJson(Map<String, dynamic> json) {
    return SubjectProgress(
      id: json['id'] as String,
      subject: json['subject'] ?? 'Science',
      topic: json['topic'] ?? '',
      masteryLevel: (json['mastery_level'] as num?)?.toDouble() ?? 0.0,
      completionPercentage: (json['completion_percentage'] as num?)?.toDouble() ?? 0.0,
      totalStudyMinutes: (json['total_study_minutes'] as num?)?.toInt() ?? 0,
    );
  }
}

class StudyScheduleItem {
  final String id;
  final int dayOfWeek; // 0=Sun, 1=Mon, ..., 6=Sat
  final String startTime;
  final String endTime;
  final String subject;
  final String? topic;
  final bool reminderEnabled;

  StudyScheduleItem({
    required this.id,
    required this.dayOfWeek,
    required this.startTime,
    required this.endTime,
    required this.subject,
    this.topic,
    this.reminderEnabled = true,
  });

  factory StudyScheduleItem.fromJson(Map<String, dynamic> json) {
    return StudyScheduleItem(
      id: json['id'] as String,
      dayOfWeek: (json['day_of_week'] as num?)?.toInt() ?? 1,
      startTime: json['start_time'] ?? '17:00',
      endTime: json['end_time'] ?? '18:00',
      subject: json['subject'] ?? 'Science',
      topic: json['topic'] as String?,
      reminderEnabled: json['reminder_enabled'] ?? true,
    );
  }
}

class AchievementBadge {
  final String id;
  final String code;
  final String title;
  final String description;
  final String badgeIcon;
  final int pointsReward;
  final bool unlocked;

  AchievementBadge({
    required this.id,
    required this.code,
    required this.title,
    required this.description,
    this.badgeIcon = 'trophy',
    this.pointsReward = 50,
    this.unlocked = false,
  });

  factory AchievementBadge.fromJson(Map<String, dynamic> json) {
    return AchievementBadge(
      id: json['id'] as String,
      code: json['code'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      badgeIcon: json['badge_icon'] ?? 'trophy',
      pointsReward: (json['points_reward'] as num?)?.toInt() ?? 50,
      unlocked: json['unlocked'] ?? false,
    );
  }
}
