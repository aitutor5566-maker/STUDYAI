import 'package:flutter/material.dart';
import 'package:shared_models/shared_models.dart';
import 'package:shared_services/shared_services.dart';

class StudentAppState extends ChangeNotifier {
  final StudyAiApiClient apiClient;

  int currentNavIndex = 0;
  bool isLoading = true;
  String? errorMessage;

  // Active Session & User
  UserProfile? userProfile;
  int totalPoints = 1450;
  int streakDays = 14;

  // Domain Data Lists
  List<SubjectProgress> progressList = [];
  List<StudyNote> notesList = [];
  List<Examination> examinationsList = [];
  List<StudyScheduleItem> schedulesList = [];
  List<AchievementBadge> achievementsList = [];
  List<Map<String, dynamic>> libraryResources = [];
  List<Map<String, dynamic>> gamesList = [];
  List<Map<String, dynamic>> models3DList = [];

  // Active Learning Topic
  String activeTopic = 'Photosynthesis & Cellular Respiration';
  String activeSubject = 'Science';

  StudentAppState({StudyAiApiClient? client})
      : apiClient = client ?? StudyAiApiClient() {
    loadAllData();
  }

  void setNavIndex(int index) {
    if (currentNavIndex != index) {
      currentNavIndex = index;
      notifyListeners();
    }
  }

  void setActiveTopic(String topic, String subject) {
    activeTopic = topic;
    activeSubject = subject;
    notifyListeners();
  }

  Future<void> loadAllData() async {
    isLoading = true;
    errorMessage = null;
    notifyListeners();

    try {
      // 1. Authenticate / Login as student Vishwak
      await apiClient.login('vishwak@studyai.internal', 'StudentPass123!');
      
      // 2. Load User Profile
      try {
        userProfile = await apiClient.getMe();
      } catch (_) {
        userProfile = UserProfile(
          id: 'usr_student_001',
          email: 'vishwak@studyai.internal',
          fullName: 'Vishwak Sai',
          role: 'student',
          grade: 'Grade 10',
          board: 'CBSE',
          streakDays: 14,
        );
      }

      // 3. Load Progress
      try {
        progressList = await apiClient.getProgress();
      } catch (_) {
        progressList = [
          SubjectProgress(id: '1', subject: 'Science', topic: 'Photosynthesis', masteryLevel: 94.0, completionPercentage: 100.0, totalStudyMinutes: 180),
          SubjectProgress(id: '2', subject: 'Mathematics', topic: 'Quadratic Equations', masteryLevel: 88.0, completionPercentage: 85.0, totalStudyMinutes: 140),
          SubjectProgress(id: '3', subject: 'Social Studies', topic: 'Nationalism in India', masteryLevel: 76.0, completionPercentage: 70.0, totalStudyMinutes: 90),
        ];
      }

      // 4. Load Notes
      try {
        notesList = await apiClient.getNotes();
      } catch (_) {
        notesList = [];
      }

      // 5. Load Examinations
      try {
        examinationsList = await apiClient.getExaminations();
      } catch (_) {
        examinationsList = [
          Examination(id: 'exam_001', title: 'Cellular Energy & Plant Respiration', subject: 'Science', totalMarks: 20, durationMinutes: 30)
        ];
      }

      // 6. Load Schedules
      try {
        schedulesList = await apiClient.getSchedules();
      } catch (_) {
        schedulesList = [];
      }

      // 7. Load Achievements
      try {
        achievementsList = await apiClient.getAchievements();
      } catch (_) {
        achievementsList = [
          AchievementBadge(id: 'ach_1', code: 'STREAK_14', title: 'Fortnight Scholar', description: '14-day study streak', unlocked: true),
          AchievementBadge(id: 'ach_2', code: 'QUIZ_ACE', title: 'Curriculum Ace', description: '100% on weekly science exam', unlocked: true),
        ];
      }

      // 8. Load 3D Models & Games
      try {
        models3DList = await apiClient.get3DModels();
        gamesList = await apiClient.getGames();
        libraryResources = await apiClient.getLibrary();
      } catch (_) {}

      isLoading = false;
      notifyListeners();
    } catch (e) {
      errorMessage = e.toString();
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> createNote(String title, String topic, String content) async {
    try {
      final newNote = await apiClient.createNote(
        title: title,
        topic: topic,
        subject: activeSubject,
        contentMarkdown: content,
      );
      notesList.insert(0, newNote);
      notifyListeners();
    } catch (e) {
      errorMessage = 'Failed to save note: $e';
      notifyListeners();
    }
  }

  Future<StudyNote?> generateNoteFromSource({
    required String topic,
    String subject = 'Science',
    String sourceType = 'topic',
    String? content,
    String? lessonId,
  }) async {
    try {
      final res = await apiClient.generateNote(
        topic: topic,
        subject: subject,
        sourceType: sourceType,
        content: content,
        lessonId: lessonId,
      );
      final newNote = StudyNote.fromJson(res);
      notesList.insert(0, newNote);
      notifyListeners();
      return newNote;
    } catch (e) {
      errorMessage = 'Failed to generate note from $sourceType: $e';
      notifyListeners();
      return null;
    }
  }

  Future<void> reloadNotes() async {
    try {
      notesList = await apiClient.getNotes();
      notifyListeners();
    } catch (_) {}
  }

  Future<void> reloadLibrary() async {
    try {
      libraryResources = await apiClient.getLibrary();
      notifyListeners();
    } catch (_) {}
  }

  Future<void> deleteNote(String noteId) async {
    try {
      await apiClient.deleteNote(noteId);
      notesList.removeWhere((n) => n.id == noteId);
      notifyListeners();
    } catch (e) {
      errorMessage = 'Failed to delete note: $e';
      notifyListeners();
    }
  }

  void logout() {
    apiClient.authToken = null;
    userProfile = null;
    currentNavIndex = 0;
    notifyListeners();
  }
}
