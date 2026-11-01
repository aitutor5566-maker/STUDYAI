class UserProfile {
  final String id;
  final String email;
  final String fullName;
  final String role; // student, parent, teacher, admin, superadmin
  final String grade;
  final String board;
  final String avatarUrl;
  final int streakDays;

  UserProfile({
    required this.id,
    required this.email,
    required this.fullName,
    required this.role,
    this.grade = 'Grade 10',
    this.board = 'CBSE',
    this.avatarUrl = '/avatars/default.svg',
    this.streakDays = 0,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] as String,
      email: json['email'] as String,
      fullName: json['full_name'] ?? json['name'] ?? '',
      role: json['role'] ?? 'student',
      grade: json['grade'] ?? 'Grade 10',
      board: json['board'] ?? 'CBSE',
      avatarUrl: json['avatar_url'] ?? '/avatars/default.svg',
      streakDays: (json['streak_days'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'full_name': fullName,
        'role': role,
        'grade': grade,
        'board': board,
        'avatar_url': avatarUrl,
        'streak_days': streakDays,
      };
}
