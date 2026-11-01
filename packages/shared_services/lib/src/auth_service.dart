class StudyAiAuthService {
  String? currentUserId;
  String? currentRole;

  bool get isAuthenticated => currentUserId != null;

  void setSession({required String userId, required String role}) {
    currentUserId = userId;
    currentRole = role;
  }

  void clearSession() {
    currentUserId = null;
    currentRole = null;
  }
}
