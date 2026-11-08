import 'package:flutter/material.dart';
import 'package:shared_ui/shared_ui.dart';
import '../state/student_app_state.dart';
import '../widgets/continue_learning_card.dart';
import '../widgets/subject_card.dart';
import '../widgets/activity_chart.dart';
import '../widgets/upcoming_exam_card.dart';
import '../widgets/voice_teacher_dialog.dart';

class HomeScreen extends StatelessWidget {
  final StudentAppState state;

  const HomeScreen({Key? key, required this.state}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (state.isLoading) {
      return const StudyAiLoadingView(message: 'Loading personalized curriculum & telemetry...');
    }

    final user = state.userProfile;
    final firstName = user?.fullName.split(' ').first ?? 'Vishwak';

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Personalized Greeting & Top Status Bar
          _buildGreetingSection(context, firstName),
          const SizedBox(height: 24),

          // 2. Continue Learning Hero Card (Rich Orange Apple-Glass Gradient)
          ContinueLearningCard(
            topic: state.activeTopic,
            subject: state.activeSubject,
            onResume: () {
              state.setNavIndex(2); // Switch to AI Tutor
            },
            onOpen3DLab: () {
              VoiceTeacherDialog.show(
                context,
                topic: state.activeTopic,
                grade: 10,
                subject: state.activeSubject,
                apiClient: state.apiClient,
              );
            },
          ),
          const SizedBox(height: 28),

          // 3. Quick Action Shortcuts to Modules
          _buildQuickActionShortcuts(context),
          const SizedBox(height: 28),

          // 4. Subject Progress Overview
          _buildSubjectProgressSection(context),
          const SizedBox(height: 28),

          // 5. Weekly Activity & Study Schedule Grid
          LayoutBuilder(
            builder: (context, constraints) {
              final isDesktop = constraints.maxWidth >= 900;
              if (isDesktop) {
                return Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Expanded(flex: 3, child: WeeklyActivityChart()),
                    const SizedBox(width: 20),
                    Expanded(flex: 2, child: _buildTodayScheduleCard(context)),
                  ],
                );
              }
              return Column(
                children: [
                  const WeeklyActivityChart(),
                  const SizedBox(height: 20),
                  _buildTodayScheduleCard(context),
                ],
              );
            },
          ),
          const SizedBox(height: 28),

          // 6. Upcoming Examinations
          _buildUpcomingExaminations(context),
          const SizedBox(height: 28),

          // 7. Learning Recommendations & Points/Achievements
          _buildRecommendationsAndAchievements(context),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildGreetingSection(BuildContext context, String firstName) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Good morning, $firstName 👋',
              style: const TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.w800,
                color: StudyAiColors.textLight,
                letterSpacing: -0.6,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'CBSE Class 10 • National Public School Bangalore',
              style: TextStyle(
                fontSize: 13,
                color: StudyAiColors.textMuted.withOpacity(0.9),
              ),
            ),
          ],
        ),
        Row(
          children: [
            StudyAiGlassPill(
              label: '${state.streakDays} Day Streak',
              icon: Icons.local_fire_department_rounded,
              color: StudyAiColors.amberAccent,
              isSelected: true,
            ),
            const SizedBox(width: 10),
            StudyAiGlassPill(
              label: '${state.totalPoints} pts',
              icon: Icons.stars_rounded,
              color: StudyAiColors.primary,
              isSelected: true,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildQuickActionShortcuts(BuildContext context) {
    final actions = [
      {'title': 'AI Tutor', 'icon': Icons.psychology_rounded, 'color': StudyAiColors.primary, 'tab': 2},
      {'title': 'AI Notes', 'icon': Icons.menu_book_rounded, 'color': StudyAiColors.cyanAccent, 'tab': 1},
      {'title': 'Audio Lessons', 'icon': Icons.headphones_rounded, 'color': StudyAiColors.greenAccent, 'tab': 2},
      {'title': 'Space Shooter', 'icon': Icons.rocket_launch_rounded, 'color': StudyAiColors.purpleAccent, 'tab': 3},
      {'title': 'Library', 'icon': Icons.folder_special_rounded, 'color': StudyAiColors.amberAccent, 'tab': 3},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Learning Shortcuts',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: StudyAiColors.textLight),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 85,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: actions.length,
            separatorBuilder: (_, __) => const SizedBox(width: 14),
            itemBuilder: (ctx, i) {
              final act = actions[i];
              return StudyAiGlassCard(
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                onTap: () {
                  if (act['title'] == 'Audio Lessons') {
                    VoiceTeacherDialog.show(
                      context,
                      topic: state.activeTopic,
                      grade: 10,
                      subject: state.activeSubject,
                      apiClient: state.apiClient,
                    );
                  } else {
                    state.setNavIndex(act['tab'] as int);
                  }
                },
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: (act['color'] as Color).withOpacity(0.18),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(act['icon'] as IconData, color: act['color'] as Color, size: 22),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      act['title'] as String,
                      style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: Colors.white),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildSubjectProgressSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Subject Mastery & Progress',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: StudyAiColors.textLight),
            ),
            TextButton(
              onPressed: () => state.setNavIndex(3),
              child: const Text('View All', style: TextStyle(color: StudyAiColors.primary, fontWeight: FontWeight.w600)),
            ),
          ],
        ),
        const SizedBox(height: 12),
        LayoutBuilder(
          builder: (ctx, constraints) {
            final crossAxisCount = constraints.maxWidth >= 900 ? 3 : (constraints.maxWidth >= 600 ? 2 : 1);
            return GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: state.progressList.length,
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: crossAxisCount,
                crossAxisSpacing: 14,
                mainAxisSpacing: 14,
                childAspectRatio: 2.2,
              ),
              itemBuilder: (ctx, index) {
                final prog = state.progressList[index];
                return SubjectProgressCard(
                  subject: prog.subject,
                  masteryPercentage: prog.masteryLevel,
                  studyMinutes: prog.totalStudyMinutes,
                  accentColor: index == 0
                      ? StudyAiColors.primary
                      : (index == 1 ? StudyAiColors.cyanAccent : StudyAiColors.greenAccent),
                  onTap: () {
                    state.setActiveTopic(prog.topic, prog.subject);
                    state.setNavIndex(2); // Jump to Tutor
                  },
                );
              },
            );
          },
        ),
      ],
    );
  }

  Widget _buildTodayScheduleCard(BuildContext context) {
    return StudyAiGlassCard(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Today\'s Study Schedule',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: StudyAiColors.textLight),
              ),
              Icon(Icons.calendar_today_rounded, size: 16, color: StudyAiColors.textMuted),
            ],
          ),
          const SizedBox(height: 16),
          if (state.schedulesList.isEmpty)
            const Text('No study slots scheduled for today. Great time for free exploration!', style: TextStyle(color: StudyAiColors.textMuted, fontSize: 13))
          else
            ...state.schedulesList.map((s) => Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.04),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.white.withOpacity(0.08)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 4,
                        height: 36,
                        decoration: BoxDecoration(color: StudyAiColors.primary, borderRadius: BorderRadius.circular(2)),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(s.subject, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: Colors.white)),
                            Text('${s.startTime} - ${s.endTime} • ${s.topic ?? 'Core Revision'}', style: const TextStyle(fontSize: 11, color: StudyAiColors.textMuted)),
                          ],
                        ),
                      ),
                      const Icon(Icons.notifications_active_rounded, size: 16, color: StudyAiColors.amberAccent),
                    ],
                  ),
                )),
        ],
      ),
    );
  }

  Widget _buildUpcomingExaminations(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Upcoming Examinations & Mock Tests',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: StudyAiColors.textLight),
        ),
        const SizedBox(height: 12),
        if (state.examinationsList.isEmpty)
          const StudyAiEmptyView(
            title: 'No Active Exams',
            description: 'All assessments completed! You are fully on track.',
            icon: Icons.done_all_rounded,
          )
        else
          ...state.examinationsList.map((exam) => UpcomingExamCard(
                examination: exam,
                onStart: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Starting examination: ${exam.title} (${exam.durationMinutes} minutes)'),
                      backgroundColor: StudyAiColors.primary,
                    ),
                  );
                },
              )),
      ],
    );
  }

  Widget _buildRecommendationsAndAchievements(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Unlocked Achievements',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: StudyAiColors.textLight),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 110,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: state.achievementsList.length,
            separatorBuilder: (_, __) => const SizedBox(width: 14),
            itemBuilder: (ctx, i) {
              final ach = state.achievementsList[i];
              return StudyAiGlassCard(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: StudyAiColors.amberAccent.withOpacity(0.18),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.emoji_events_rounded, color: StudyAiColors.amberAccent, size: 24),
                    ),
                    const SizedBox(width: 14),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(ach.title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: Colors.white)),
                        const SizedBox(height: 2),
                        Text(ach.description, style: const TextStyle(fontSize: 11, color: StudyAiColors.textMuted)),
                        const SizedBox(height: 4),
                        Text('+${ach.pointsReward} Points Earned', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: StudyAiColors.primary)),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
