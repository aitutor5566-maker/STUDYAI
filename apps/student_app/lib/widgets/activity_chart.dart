import 'package:flutter/material.dart';
import 'package:shared_ui/shared_ui.dart';

class WeeklyActivityChart extends StatelessWidget {
  final List<int> dailyMinutes; // Mon to Sun

  const WeeklyActivityChart({
    Key? key,
    this.dailyMinutes = const [45, 60, 30, 85, 50, 90, 40],
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    final maxMinutes = dailyMinutes.reduce((curr, next) => curr > next ? curr : next);

    return StudyAiGlassCard(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Weekly Study Activity',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: StudyAiColors.textLight,
                ),
              ),
              Text(
                '${dailyMinutes.reduce((a, b) => a + b)} mins total',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: StudyAiColors.primary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          SizedBox(
            height: 120,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: List.generate(7, (index) {
                final mins = dailyMinutes[index];
                final heightFactor = maxMinutes > 0 ? (mins / maxMinutes) : 0.0;
                final isToday = (index == 6); // Sunday demo

                return Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Text(
                      '$mins',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: isToday ? StudyAiColors.primary : StudyAiColors.textMuted,
                      ),
                    ),
                    const SizedBox(height: 6),
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      width: 28,
                      height: (heightFactor * 75).clamp(8.0, 75.0),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.bottomCenter,
                          end: Alignment.topCenter,
                          colors: isToday
                              ? [StudyAiColors.primaryDark, StudyAiColors.primaryLight]
                              : [StudyAiColors.surfaceLight, StudyAiColors.cyanAccent.withOpacity(0.5)],
                        ),
                        borderRadius: BorderRadius.circular(6),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      days[index],
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: isToday ? FontWeight.w700 : FontWeight.w500,
                        color: isToday ? Colors.white : StudyAiColors.textMuted,
                      ),
                    ),
                  ],
                );
              }),
            ),
          ),
        ],
      ),
    );
  }
}
