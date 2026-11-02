import 'package:flutter/material.dart';
import 'package:shared_ui/shared_ui.dart';
import '../state/student_app_state.dart';

class ProfileScreen extends StatefulWidget {
  final StudentAppState state;

  const ProfileScreen({Key? key, required this.state}) : super(key: key);

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _examReminders = true;
  bool _dailyStreakAlerts = true;
  bool _reducedMotion = false;
  String _explanationDepth = 'Detailed';
  String _voiceModel = 'Nova (Teacher)';

  @override
  Widget build(BuildContext context) {
    final user = widget.state.userProfile;
    final fullName = user?.fullName ?? 'Vishwak Sai';
    final email = user?.email ?? 'vishwak@studyai.internal';

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Profile Card
          StudyAiGlassCard(
            padding: const EdgeInsets.all(24),
            child: Row(
              children: [
                Container(
                  width: 72,
                  height: 72,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [StudyAiColors.primary, StudyAiColors.primaryLight],
                    ),
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(color: StudyAiColors.primary.withOpacity(0.35), blurRadius: 16, offset: const Offset(0, 6)),
                    ],
                  ),
                  child: Center(
                    child: Text(
                      fullName.isNotEmpty ? fullName[0] : 'V',
                      style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w800, color: Colors.white),
                    ),
                  ),
                ),
                const SizedBox(width: 20),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(fullName, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Colors.white)),
                      const SizedBox(height: 4),
                      Text(email, style: const TextStyle(fontSize: 13, color: StudyAiColors.textMuted)),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(color: StudyAiColors.primary.withOpacity(0.2), borderRadius: BorderRadius.circular(6)),
                            child: const Text('CBSE Class 10', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: StudyAiColors.primary)),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(color: StudyAiColors.greenAccent.withOpacity(0.2), borderRadius: BorderRadius.circular(6)),
                            child: const Text('Student Active', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: StudyAiColors.greenAccent)),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Verified Parent Link Status
          StudyAiGlassCard(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: StudyAiColors.greenAccent.withOpacity(0.18),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.family_restroom_rounded, color: StudyAiColors.greenAccent, size: 24),
                ),
                const SizedBox(width: 16),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Guardian Link Status', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: Colors.white)),
                      SizedBox(height: 2),
                      Text(
                        'Linked with Rajesh Sai (Father) • Status: Verified',
                        style: TextStyle(fontSize: 12, color: StudyAiColors.textMuted),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Chat logs are strictly confidential per student privacy policy.',
                        style: TextStyle(fontSize: 11, color: StudyAiColors.cyanAccent),
                      ),
                    ],
                  ),
                ),
                StudyAiGlassPill(
                  label: 'Verified',
                  icon: Icons.check_circle_rounded,
                  color: StudyAiColors.greenAccent,
                  isSelected: true,
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Personalised Adaptive Learning Profile
          const Text('Personalised Adaptive Learning Profile', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white)),
          const SizedBox(height: 12),
          StudyAiGlassCard(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: const [
                        Icon(Icons.psychology_rounded, color: Color(0xFFC084FC), size: 24),
                        SizedBox(width: 10),
                        Text('Adaptive Comprehension Engine', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Colors.white)),
                      ],
                    ),
                    StudyAiGlassPill(
                      label: 'Active Profile',
                      icon: Icons.check_circle_rounded,
                      color: StudyAiColors.greenAccent,
                      isSelected: true,
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                const Text(
                  'Your AI Tutor personalises explanations, simplifies sentence structures, bridges foundational concepts, and provides gentle spelling guidance based on your academic profile.',
                  style: TextStyle(fontSize: 13, color: Colors.white70, height: 1.45),
                ),
                const SizedBox(height: 14),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: const [
                    Chip(
                      label: Text('Reading: Chunks & Glossaries', style: TextStyle(fontSize: 11, color: Colors.white)),
                      backgroundColor: Color(0x33A855F7),
                    ),
                    Chip(
                      label: Text('Spelling: Gentle Guidance', style: TextStyle(fontSize: 11, color: Colors.white)),
                      backgroundColor: Color(0x3306B6D4),
                    ),
                    Chip(
                      label: Text('Style: Balanced & Meaning-Preserving', style: TextStyle(fontSize: 11, color: Colors.white)),
                      backgroundColor: Color(0x3310B981),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Academic & Learning Preferences
          const Text('Learning Preferences', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white)),
          const SizedBox(height: 12),
          StudyAiGlassCard(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                _buildPreferenceRow(
                  label: 'Explanation Depth',
                  subtitle: 'Determines detail level and prerequisite breakdowns',
                  value: _explanationDepth,
                  items: ['Simple', 'Detailed', 'Rigorous CBSE'],
                  onChanged: (val) => setState(() => _explanationDepth = val!),
                ),
                const Divider(color: StudyAiColors.glassBorder, height: 28),
                _buildPreferenceRow(
                  label: 'Audio Voice Model',
                  subtitle: 'Natural narration for audio lessons and explanations',
                  value: _voiceModel,
                  items: ['Nova (Teacher)', 'Echo (Calm)', 'Onyx (Deep)'],
                  onChanged: (val) => setState(() => _voiceModel = val!),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Notifications & Accessibility
          const Text('Notifications & Accessibility', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white)),
          const SizedBox(height: 12),
          StudyAiGlassCard(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                _buildSwitchRow(
                  label: 'Exam Reminders',
                  subtitle: 'Receive notification 2 hours prior to scheduled assessments',
                  value: _examReminders,
                  onChanged: (val) => setState(() => _examReminders = val),
                ),
                const Divider(color: StudyAiColors.glassBorder, height: 28),
                _buildSwitchRow(
                  label: 'Daily Streak Alerts',
                  subtitle: 'Gentle evening reminder to complete daily topic goal',
                  value: _dailyStreakAlerts,
                  onChanged: (val) => setState(() => _dailyStreakAlerts = val),
                ),
                const Divider(color: StudyAiColors.glassBorder, height: 28),
                _buildSwitchRow(
                  label: 'Reduced Motion',
                  subtitle: 'Disables 3D camera sweeps and heavy particle animations',
                  value: _reducedMotion,
                  onChanged: (val) => setState(() => _reducedMotion = val),
                ),
              ],
            ),
          ),
          const SizedBox(height: 28),

          // Logout Action Button
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () {
                widget.state.logout();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Logged out of STUDYAI session'), backgroundColor: StudyAiColors.surface),
                );
              },
              icon: const Icon(Icons.logout_rounded, color: StudyAiColors.redAccent),
              label: const Text('Sign Out of Account', style: TextStyle(fontWeight: FontWeight.w700, color: StudyAiColors.redAccent)),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: StudyAiColors.redAccent, width: 1.5),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildPreferenceRow({
    required String label,
    required String subtitle,
    required String value,
    required List<String> items,
    required ValueChanged<String?> onChanged,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: Colors.white)),
              const SizedBox(height: 2),
              Text(subtitle, style: const TextStyle(fontSize: 12, color: StudyAiColors.textMuted)),
            ],
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.06),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.white.withOpacity(0.12)),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: value,
              dropdownColor: StudyAiColors.surface,
              style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
              items: items.map((i) => DropdownMenuItem(value: i, child: Text(i))).toList(),
              onChanged: onChanged,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSwitchRow({
    required String label,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: Colors.white)),
              const SizedBox(height: 2),
              Text(subtitle, style: const TextStyle(fontSize: 12, color: StudyAiColors.textMuted)),
            ],
          ),
        ),
        Switch(
          value: value,
          activeColor: StudyAiColors.primary,
          onChanged: onChanged,
        ),
      ],
    );
  }
}
