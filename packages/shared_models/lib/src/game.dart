class GameSessionRecord {
  final String id;
  final String gameType;
  final String topic;
  final String subject;
  final int score;
  final int accuracy;
  final int correctCount;
  final int totalQuestions;
  final DateTime createdAt;

  GameSessionRecord({
    required this.id,
    required this.gameType,
    required this.topic,
    required this.subject,
    required this.score,
    required this.accuracy,
    required this.correctCount,
    required this.totalQuestions,
    DateTime? createdAt,
  }) : createdAt = createdAt ?? DateTime.now();

  factory GameSessionRecord.fromJson(Map<String, dynamic> json) {
    return GameSessionRecord(
      id: json['id'] as String,
      gameType: json['game_type'] ?? json['gameType'] ?? '',
      topic: json['topic'] ?? '',
      subject: json['subject'] ?? 'Science',
      score: (json['score'] as num?)?.toInt() ?? 0,
      accuracy: (json['accuracy'] as num?)?.toInt() ?? 0,
      correctCount: (json['correct_count'] as num?)?.toInt() ?? 0,
      totalQuestions: (json['total_questions'] as num?)?.toInt() ?? 0,
      createdAt: json['created_at'] != null ? DateTime.parse(json['created_at'] as String) : null,
    );
  }
}
