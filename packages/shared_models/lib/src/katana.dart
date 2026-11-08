class KatanaEnvironmentInfo {
  final String id;
  final String name;
  final String theme;
  final String description;
  final int stagesCount;
  final int clearedStages;
  final bool isUnlocked;
  final List<String> bgGradient;
  final String ambientColor;

  KatanaEnvironmentInfo({
    required this.id,
    required this.name,
    required this.theme,
    required this.description,
    required this.stagesCount,
    required this.clearedStages,
    required this.isUnlocked,
    required this.bgGradient,
    required this.ambientColor,
  });

  factory KatanaEnvironmentInfo.fromJson(Map<String, dynamic> json) {
    return KatanaEnvironmentInfo(
      id: json['id'] as String? ?? 'moonlit_bamboo_forest',
      name: json['name'] as String? ?? 'Moonlit Bamboo Forest',
      theme: json['theme'] as String? ?? 'Night Forest & Fireflies',
      description: json['description'] as String? ?? '',
      stagesCount: (json['stagesCount'] as num?)?.toInt() ?? 5,
      clearedStages: (json['clearedStages'] as num?)?.toInt() ?? 0,
      isUnlocked: json['isUnlocked'] as bool? ?? false,
      bgGradient: (json['bgGradient'] as List?)?.map((e) => e.toString()).toList() ?? ['#0A1128', '#1C2541'],
      ambientColor: json['ambientColor'] as String? ?? '#48CAE4',
    );
  }
}

class KatanaWarriorProfile {
  final String userId;
  final int warriorLevel;
  final int totalXp;
  final int streakDays;
  final String equippedOutfit;
  final String equippedBlade;
  final String equippedAura;

  KatanaWarriorProfile({
    required this.userId,
    required this.warriorLevel,
    required this.totalXp,
    required this.streakDays,
    required this.equippedOutfit,
    required this.equippedBlade,
    required this.equippedAura,
  });

  factory KatanaWarriorProfile.fromJson(Map<String, dynamic> json) {
    return KatanaWarriorProfile(
      userId: json['userId'] as String? ?? 'usr_student_001',
      warriorLevel: (json['warriorLevel'] as num?)?.toInt() ?? 1,
      totalXp: (json['totalXp'] as num?)?.toInt() ?? 1450,
      streakDays: (json['streakDays'] as num?)?.toInt() ?? 14,
      equippedOutfit: json['equippedOutfit'] as String? ?? 'Novice Shadow Ronin Garb',
      equippedBlade: json['equippedBlade'] as String? ?? 'Steel Whisper Katana',
      equippedAura: json['equippedAura'] as String? ?? 'Floating Sakura Petals',
    );
  }
}

class KatanaQuestion {
  final String id;
  final String subject;
  final String topic;
  final String prompt;
  final List<String> options;
  final String difficulty;
  final String conceptTag;
  final String questionType;

  KatanaQuestion({
    required this.id,
    required this.subject,
    required this.topic,
    required this.prompt,
    required this.options,
    required this.difficulty,
    required this.conceptTag,
    required this.questionType,
  });

  factory KatanaQuestion.fromJson(Map<String, dynamic> json) {
    return KatanaQuestion(
      id: json['id'] as String? ?? '',
      subject: json['subject'] as String? ?? 'Science',
      topic: json['topic'] as String? ?? '',
      prompt: json['prompt'] as String? ?? '',
      options: (json['options'] as List?)?.map((e) => e.toString()).toList() ?? [],
      difficulty: json['difficulty'] as String? ?? 'medium',
      conceptTag: json['conceptTag'] as String? ?? 'Core Concept',
      questionType: json['questionType'] as String? ?? 'mcq_battle',
    );
  }
}

class KatanaStrikeResult {
  final bool isCorrect;
  final int damageDealt;
  final int playerDamageTaken;
  final int playerHp;
  final int spiritEnergy;
  final int comboCount;
  final int score;
  final String explanation;
  final String conceptTag;
  final String strikeAnimation;
  final KatanaQuestion? nextQuestion;
  final bool isDefeated;

  KatanaStrikeResult({
    required this.isCorrect,
    required this.damageDealt,
    required this.playerDamageTaken,
    required this.playerHp,
    required this.spiritEnergy,
    required this.comboCount,
    required this.score,
    required this.explanation,
    required this.conceptTag,
    required this.strikeAnimation,
    this.nextQuestion,
    required this.isDefeated,
  });

  factory KatanaStrikeResult.fromJson(Map<String, dynamic> json) {
    return KatanaStrikeResult(
      isCorrect: json['isCorrect'] as bool? ?? false,
      damageDealt: (json['damageDealt'] as num?)?.toInt() ?? 0,
      playerDamageTaken: (json['playerDamageTaken'] as num?)?.toInt() ?? 0,
      playerHp: (json['playerHp'] as num?)?.toInt() ?? 100,
      spiritEnergy: (json['spiritEnergy'] as num?)?.toInt() ?? 0,
      comboCount: (json['comboCount'] as num?)?.toInt() ?? 0,
      score: (json['score'] as num?)?.toInt() ?? 0,
      explanation: json['explanation'] as String? ?? '',
      conceptTag: json['conceptTag'] as String? ?? '',
      strikeAnimation: json['strikeAnimation'] as String? ?? 'katana_slash',
      nextQuestion: json['nextQuestion'] != null ? KatanaQuestion.fromJson(json['nextQuestion'] as Map<String, dynamic>) : null,
      isDefeated: json['isDefeated'] as bool? ?? false,
    );
  }
}

class KatanaTopicMastery {
  final String subject;
  final String topic;
  final int masteryScore;
  final int totalAttempts;
  final int accuracyPercent;
  final List<String> weakConcepts;

  KatanaTopicMastery({
    required this.subject,
    required this.topic,
    required this.masteryScore,
    required this.totalAttempts,
    required this.accuracyPercent,
    required this.weakConcepts,
  });

  factory KatanaTopicMastery.fromJson(Map<String, dynamic> json) {
    return KatanaTopicMastery(
      subject: json['subject'] as String? ?? 'Science',
      topic: json['topic'] as String? ?? '',
      masteryScore: (json['masteryScore'] as num?)?.toInt() ?? 0,
      totalAttempts: (json['totalAttempts'] as num?)?.toInt() ?? 0,
      accuracyPercent: (json['accuracyPercent'] as num?)?.toInt() ?? 0,
      weakConcepts: (json['weakConcepts'] as List?)?.map((e) => e.toString()).toList() ?? [],
    );
  }
}

class KatanaRevisionMission {
  final String id;
  final String subject;
  final String topic;
  final String weakConcept;
  final String priority;
  final String recommendedMission;

  KatanaRevisionMission({
    required this.id,
    required this.subject,
    required this.topic,
    required this.weakConcept,
    required this.priority,
    required this.recommendedMission,
  });

  factory KatanaRevisionMission.fromJson(Map<String, dynamic> json) {
    return KatanaRevisionMission(
      id: json['id'] as String? ?? '',
      subject: json['subject'] as String? ?? '',
      topic: json['topic'] as String? ?? '',
      weakConcept: json['weakConcept'] as String? ?? '',
      priority: json['priority'] as String? ?? 'high',
      recommendedMission: json['recommendedMission'] as String? ?? '',
    );
  }
}
