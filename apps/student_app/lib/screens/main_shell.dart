import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:shared_ui/shared_ui.dart';
import '../state/student_app_state.dart';
import 'home_screen.dart';
import 'notes_screen.dart';
import 'tutor_screen.dart';
import 'library_screen.dart';
import 'profile_screen.dart';

class MainShell extends StatelessWidget {
  final StudentAppState state;

  const MainShell({Key? key, required this.state}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isDesktop = constraints.maxWidth >= StudyAiBreakpoints.tablet;
        final isTablet = constraints.maxWidth >= StudyAiBreakpoints.mobile && constraints.maxWidth < StudyAiBreakpoints.tablet;
        final isCompactMobile = constraints.maxWidth < StudyAiBreakpoints.compactMobile;

        return Scaffold(
          backgroundColor: StudyAiColors.background,
          body: Row(
            children: [
              if (isDesktop || isTablet) _buildSideNav(context, isCompact: isTablet),
              Expanded(
                child: Column(
                  children: [
                    _buildTopHeader(context, isCompact: isCompactMobile),
                    Expanded(
                      child: AnimatedSwitcher(
                        duration: const Duration(milliseconds: 200),
                        child: _buildCurrentScreen(),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          bottomNavigationBar: (!isDesktop && !isTablet) ? _buildFloatingBottomNav(context) : null,
        );
      },
    );
  }

  Widget _buildCurrentScreen() {
    switch (state.currentNavIndex) {
      case 0:
        return HomeScreen(state: state);
      case 1:
        return NotesScreen(state: state);
      case 2:
        return TutorScreen(state: state);
      case 3:
        return LibraryScreen(state: state);
      case 4:
        return ProfileScreen(state: state);
      default:
        return HomeScreen(state: state);
    }
  }

  Widget _buildTopHeader(BuildContext context, {bool isCompact = false}) {
    return Container(
      height: 64,
      padding: EdgeInsets.symmetric(horizontal: isCompact ? 12 : 24),
      decoration: BoxDecoration(
        color: StudyAiColors.background.withOpacity(0.85),
        border: const Border(bottom: BorderSide(color: StudyAiColors.glassBorder, width: 1)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [StudyAiColors.primary, StudyAiColors.primaryLight]),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Center(
                  child: Text('S', style: TextStyle(fontWeight: FontWeight.w900, color: Colors.white, fontSize: 18)),
                ),
              ),
              const SizedBox(width: 10),
              Text(
                'STUDYAI',
                style: TextStyle(
                  fontWeight: FontWeight.w900,
                  fontSize: isCompact ? 16 : 18,
                  letterSpacing: -0.5,
                  color: Colors.white,
                ),
              ),
            ],
          ),
          Row(
            children: [
              if (!isCompact) ...[
                StudyAiGlassPill(
                  label: '${state.streakDays} Days',
                  icon: Icons.local_fire_department_rounded,
                  color: StudyAiColors.amberAccent,
                  isSelected: true,
                ),
                const SizedBox(width: 8),
              ],
              StudyAiGlassPill(
                label: '${state.totalPoints} pts',
                icon: Icons.stars_rounded,
                color: StudyAiColors.primary,
                isSelected: true,
              ),
              const SizedBox(width: 8),
              IconButton(
                icon: const Icon(Icons.notifications_outlined, color: StudyAiColors.textLight, size: 20),
                tooltip: 'Notifications',
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('All caught up! Weekly Science Assessment scheduled tomorrow.'),
                      backgroundColor: StudyAiColors.surface,
                    ),
                  );
                },
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSideNav(BuildContext context, {required bool isCompact}) {
    final navItems = [
      {'title': 'Home', 'icon': Icons.home_rounded},
      {'title': 'AI Notes', 'icon': Icons.menu_book_rounded},
      {'title': 'AI Tutor', 'icon': Icons.psychology_rounded},
      {'title': 'Library', 'icon': Icons.folder_special_rounded},
      {'title': 'Profile', 'icon': Icons.person_rounded},
    ];

    return Container(
      width: isCompact ? 80 : 240,
      decoration: BoxDecoration(
        color: StudyAiColors.surface.withOpacity(0.6),
        border: const Border(right: BorderSide(color: StudyAiColors.glassBorder, width: 1)),
      ),
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 12),
      child: Column(
        children: [
          Expanded(
            child: ListView.separated(
              itemCount: navItems.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (ctx, i) {
                final item = navItems[i];
                final isSelected = (state.currentNavIndex == i);

                return Material(
                  color: Colors.transparent,
                  child: InkWell(
                    borderRadius: BorderRadius.circular(12),
                    onTap: () => state.setNavIndex(i),
                    child: Container(
                      padding: EdgeInsets.symmetric(horizontal: isCompact ? 10 : 16, vertical: 12),
                      decoration: BoxDecoration(
                        color: isSelected ? StudyAiColors.primary.withOpacity(0.18) : Colors.transparent,
                        borderRadius: BorderRadius.circular(12),
                        border: isSelected ? Border.all(color: StudyAiColors.primary.withOpacity(0.4)) : null,
                      ),
                      child: Row(
                        mainAxisAlignment: isCompact ? MainAxisAlignment.center : MainAxisAlignment.start,
                        children: [
                          Icon(
                            item['icon'] as IconData,
                            size: 22,
                            color: isSelected ? StudyAiColors.primary : StudyAiColors.textMuted,
                          ),
                          if (!isCompact) ...[
                            const SizedBox(width: 14),
                            Text(
                              item['title'] as String,
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                                color: isSelected ? Colors.white : StudyAiColors.textMuted,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          if (!isCompact)
            StudyAiGlassCard(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 16,
                    backgroundColor: StudyAiColors.primary,
                    child: Text(
                      state.userProfile?.fullName.isNotEmpty == true ? state.userProfile!.fullName[0] : 'V',
                      style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: Colors.white),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          state.userProfile?.fullName ?? 'Vishwak Sai',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const Text(
                          'Class 10 CBSE',
                          style: TextStyle(fontSize: 10, color: StudyAiColors.textMuted),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildFloatingBottomNav(BuildContext context) {
    final isCompact = MediaQuery.of(context).size.width < StudyAiBreakpoints.compactMobile;
    final navItems = [
      {'title': 'Home', 'icon': Icons.home_rounded},
      {'title': 'Notes', 'icon': Icons.menu_book_rounded},
      {'title': 'Tutor', 'icon': Icons.psychology_rounded},
      {'title': 'Library', 'icon': Icons.folder_special_rounded},
      {'title': 'Profile', 'icon': Icons.person_rounded},
    ];

    return SafeArea(
      child: Container(
        margin: EdgeInsets.fromLTRB(isCompact ? 8 : 16, 0, isCompact ? 8 : 16, isCompact ? 6 : 12),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(24),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
            child: Container(
              height: isCompact ? 56 : 64,
              decoration: BoxDecoration(
                color: StudyAiColors.surface.withOpacity(0.85),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: StudyAiColors.glassBorder, width: 1.2),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.3),
                    blurRadius: 20,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: List.generate(navItems.length, (i) {
                  final item = navItems[i];
                  final isSelected = (state.currentNavIndex == i);

                  return GestureDetector(
                    onTap: () => state.setNavIndex(i),
                    behavior: HitTestBehavior.opaque,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          item['icon'] as IconData,
                          size: isCompact ? 19 : 22,
                          color: isSelected ? StudyAiColors.primary : StudyAiColors.textMuted,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          item['title'] as String,
                          style: TextStyle(
                            fontSize: isCompact ? 9 : 10,
                            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                            color: isSelected ? StudyAiColors.primary : StudyAiColors.textMuted,
                          ),
                        ),
                        if (isSelected)
                          Container(
                            margin: const EdgeInsets.only(top: 2),
                            width: 4,
                            height: 4,
                            decoration: const BoxDecoration(
                              color: StudyAiColors.primary,
                              shape: BoxShape.circle,
                            ),
                          ),
                      ],
                    ),
                  );
                }),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
