import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_models/shared_models.dart';

class StudyAiApiClient {
  final String baseUrl;
  String? authToken;
  String studentId;

  StudyAiApiClient({
    this.baseUrl = 'http://127.0.0.1:8000',
    this.authToken,
    this.studentId = 'usr_student_001',
  });

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        'x-student-id': studentId,
        if (authToken != null) 'Authorization': 'Bearer $authToken',
      };

  Future<dynamic> get(String path) async {
    final response = await http.get(Uri.parse('$baseUrl$path'), headers: _headers);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonDecode(response.body);
    }
    throw Exception('GET $path error (${response.statusCode}): ${response.body}');
  }

  Future<dynamic> post(String path, dynamic body) async {
    final response = await http.post(
      Uri.parse('$baseUrl$path'),
      headers: _headers,
      body: jsonEncode(body),
    );
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonDecode(response.body);
    }
    throw Exception('POST $path error (${response.statusCode}): ${response.body}');
  }

  Future<dynamic> delete(String path) async {
    final response = await http.delete(Uri.parse('$baseUrl$path'), headers: _headers);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonDecode(response.body);
    }
    throw Exception('DELETE $path error (${response.statusCode}): ${response.body}');
  }

  // --- Specialized Service Methods ---

  Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await post('/api/v1/auth/login', {'email': email, 'password': password});
    authToken = res['access_token'] as String?;
    return res as Map<String, dynamic>;
  }

  Future<UserProfile> getMe() async {
    final res = await get('/api/v1/auth/me');
    return UserProfile.fromJson(res as Map<String, dynamic>);
  }

  Future<List<SubjectProgress>> getProgress() async {
    final res = await get('/api/v1/progress');
    if (res is List) {
      return res.map((e) => SubjectProgress.fromJson(Map<String, dynamic>.from(e as Map))).toList();
    }
    return [];
  }

  Future<List<StudyNote>> getNotes() async {
    final res = await get('/api/v1/notes');
    if (res is List) {
      return res.map((e) => StudyNote.fromJson(Map<String, dynamic>.from(e as Map))).toList();
    }
    return [];
  }

  Future<StudyNote> createNote({
    required String title,
    required String topic,
    String subject = 'Science',
    required String contentMarkdown,
    List<Map<String, dynamic>> flashcards = const [],
    List<Map<String, dynamic>> quiz = const [],
  }) async {
    final res = await post('/api/v1/notes', {
      'title': title,
      'topic': topic,
      'subject': subject,
      'content_markdown': contentMarkdown,
      'flashcards': flashcards,
      'quiz': quiz,
    });
    return StudyNote.fromJson(res as Map<String, dynamic>);
  }

  Future<void> deleteNote(String noteId) async {
    await delete('/api/v1/notes/$noteId');
  }

  Future<List<Examination>> getExaminations() async {
    final res = await get('/api/v1/examinations');
    if (res is List) {
      return res.map((e) => Examination.fromJson(Map<String, dynamic>.from(e as Map))).toList();
    }
    return [];
  }

  Future<Map<String, dynamic>> submitExamination(String examId, List<Map<String, dynamic>> answers, {String? attemptId}) async {
    final res = await post('/api/v1/examinations/$examId/submit', {
      'answers': answers,
      if (attemptId != null) 'attempt_id': attemptId,
    });
    return res as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> startExamination(String examId) async {
    final res = await post('/api/v1/examinations/$examId/start', {});
    return res as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> saveExamProgress(String examId, String attemptId, Map<String, dynamic> answers, List<String> marked) async {
    final res = await post('/api/v1/examinations/$examId/save-progress', {
      'attempt_id': attemptId,
      'current_answers': answers,
      'marked_for_review': marked,
    });
    return res as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> claimReward(String eventType, String referenceId) async {
    final res = await post('/api/v1/points/claim-reward', {
      'event_type': eventType,
      'reference_id': referenceId,
    });
    return res as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getPointsBalance() async {
    final res = await get('/api/v1/points/balance');
    return res as Map<String, dynamic>;
  }

  Future<List<Map<String, dynamic>>> getLeaderboard() async {
    final res = await get('/api/v1/points/leaderboard');
    if (res is List) {
      return res.map((e) => Map<String, dynamic>.from(e as Map)).toList();
    }
    return [];
  }

  Future<Map<String, dynamic>> generateGameQuestions({
    required String gameType,
    required String topic,
    String subject = 'Science',
    String difficulty = 'medium',
    int count = 5,
  }) async {
    final res = await post('/api/v1/games/questions', {
      'game_type': gameType,
      'topic': topic,
      'subject': subject,
      'difficulty': difficulty,
      'count': count,
    });
    return res as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> submitGameSession({
    required String gameType,
    required String topic,
    required String subject,
    required int score,
    required int accuracy,
    required int correctCount,
    required int totalQuestions,
    int stageReached = 1,
    int durationSeconds = 60,
  }) async {
    final res = await post('/api/v1/games/sessions', {
      'game_type': gameType,
      'topic': topic,
      'subject': subject,
      'score': score,
      'accuracy': accuracy,
      'correct_count': correctCount,
      'total_questions': totalQuestions,
      'stage_reached': stageReached,
      'duration_seconds': durationSeconds,
    });
    return res as Map<String, dynamic>;
  }

  Future<List<StudyScheduleItem>> getSchedules() async {
    final res = await get('/api/v1/schedule');
    if (res is List) {
      return res.map((e) => StudyScheduleItem.fromJson(Map<String, dynamic>.from(e as Map))).toList();
    }
    return [];
  }

  Future<List<AchievementBadge>> getAchievements() async {
    final res = await get('/api/v1/points/achievements');
    if (res is List) {
      return res.map((e) => AchievementBadge.fromJson(Map<String, dynamic>.from(e as Map))).toList();
    }
    return [];
  }

  Future<List<Map<String, dynamic>>> getLibrary({String? type, String? subject, String? q}) async {
    final query = <String, String>{};
    if (type != null) query['type'] = type;
    if (subject != null) query['subject'] = subject;
    if (q != null) query['q'] = q;
    final queryString = query.entries.map((e) => '${e.key}=${Uri.encodeComponent(e.value)}').join('&');
    final path = queryString.isEmpty ? '/api/v1/library' : '/api/v1/library?$queryString';
    final res = await get(path);
    if (res is Map && res['items'] is List) {
      return (res['items'] as List).map((e) => Map<String, dynamic>.from(e as Map)).toList();
    }
    if (res is List) {
      return res.map((e) => Map<String, dynamic>.from(e as Map)).toList();
    }
    return [];
  }

  Future<Map<String, dynamic>> generateNote({
    required String topic,
    String subject = 'Science',
    String level = 'Grade 10',
    String sourceType = 'topic',
    String? lessonId,
    String? content,
    Map<String, dynamic>? metadata,
  }) async {
    final res = await post('/api/v1/notes/generate', {
      'topic': topic,
      'subject': subject,
      'level': level,
      'source_type': sourceType,
      if (lessonId != null) 'lesson_id': lessonId,
      if (content != null) 'content': content,
      if (metadata != null) 'metadata': metadata,
    });
    return res as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> autosaveNote(String noteId, {String? contentMarkdown, String? title}) async {
    final res = await post('/api/v1/notes/$noteId/autosave', {
      if (contentMarkdown != null) 'content_markdown': contentMarkdown,
      if (title != null) 'title': title,
    });
    return res as Map<String, dynamic>;
  }

  Future<List<Map<String, dynamic>>> getNoteVersions(String noteId) async {
    final res = await get('/api/v1/notes/$noteId/versions');
    if (res is List) {
      return res.map((e) => Map<String, dynamic>.from(e as Map)).toList();
    }
    return [];
  }

  Future<Map<String, dynamic>> restoreNoteVersion(String noteId, String versionId) async {
    final res = await post('/api/v1/notes/$noteId/versions/$versionId/restore', {});
    return res as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> toggleFavorite(String resourceId) async {
    final res = await post('/api/v1/library/$resourceId/favorite', {});
    return res as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> save3DModelToLibrary(String modelId, {String? customTitle, String? collectionId}) async {
    final res = await post('/api/v1/visual-3d/save-to-library', {
      'model_id': modelId,
      if (customTitle != null) 'custom_title': customTitle,
      if (collectionId != null) 'collection_id': collectionId,
    });
    return res as Map<String, dynamic>;
  }

  Future<List<Map<String, dynamic>>> getGames() async {
    final res = await get('/api/v1/games/catalog');
    if (res is List) {
      return res.map((e) => Map<String, dynamic>.from(e as Map)).toList();
    }
    return [];
  }

  Future<List<Map<String, dynamic>>> get3DModels() async {
    final res = await get('/api/v1/visual-3d/models');
    if (res is List) {
      return res.map((e) => Map<String, dynamic>.from(e as Map)).toList();
    }
    return [];
  }

  Future<Map<String, dynamic>> askTutor({
    required String question,
    required String topic,
    int grade = 10,
    String subject = 'Science',
    String language = 'English',
    String mode = 'detailed',
  }) async {
    final res = await post('/api/v1/tutor/ask', {
      'question': question,
      'topic': topic,
      'grade': grade,
      'subject': subject,
      'language': language,
      'mode': mode,
    });
    return res as Map<String, dynamic>;
  }

  // --- KATANA: SHADOW WARRIORS — THE WISDOM BATTLE API Client Methods ---

  Future<Map<String, dynamic>> getKatanaCatalog() async {
    final res = await get('/api/katana/catalog');
    return res as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> startKatanaSession({
    required String mode,
    String environment = 'moonlit_bamboo_forest',
    required String subject,
    required String topic,
    int stageIndex = 1,
  }) async {
    final res = await post('/api/katana/session/start', {
      'mode': mode,
      'environment': environment,
      'subject': subject,
      'topic': topic,
      'stageIndex': stageIndex,
    });
    return res as Map<String, dynamic>;
  }

  Future<KatanaStrikeResult> validateKatanaStrike({
    required String sessionId,
    required String questionId,
    required String studentAnswer,
    int timeTakenMs = 1200,
  }) async {
    final res = await post('/api/katana/battle/validate', {
      'sessionId': sessionId,
      'questionId': questionId,
      'studentAnswer': studentAnswer,
      'timeTakenMs': timeTakenMs,
    });
    return KatanaStrikeResult.fromJson(res as Map<String, dynamic>);
  }

  Future<Map<String, dynamic>> completeKatanaSession({
    required String sessionId,
    required bool victory,
  }) async {
    final res = await post('/api/katana/session/complete', {
      'sessionId': sessionId,
      'victory': victory,
    });
    return res as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getKatanaRevisions() async {
    final res = await get('/api/katana/revision');
    return res as Map<String, dynamic>;
  }

  Future<bool> equipKatanaItem({
    required String itemType,
    required String itemId,
  }) async {
    final res = await post('/api/katana/inventory/equip', {
      'itemType': itemType,
      'itemId': itemId,
    });
    return res['success'] == true;
  }
}
