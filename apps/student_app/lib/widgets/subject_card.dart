import 'package:flutter/material.dart';
import 'package:shared_ui/shared_ui.dart';

class SubjectProgressCard extends StatelessWidget {
  final String subject;
  final double masteryPercentage;
  final int studyMinutes;
  final Color accentColor;
  final VoidCallback? onTap;

  const SubjectProgressCard({
    Key? key,
    required this.subject,
    required this.masteryPercentage,
    required this.studyMinutes,
    this.accentColor = StudyAiColors.primary,
    this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return StudyAiGlassCard(
      onTap: onTap,
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                subject,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: StudyAiColors.textLight,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: accentColor.withOpacity(0.18),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '${masteryPercentage.toInt()}%',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: accentColor,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: masteryPercentage / 100.0,
              backgroundColor: Colors.white.withOpacity(0.1),
              valueColor: AlwaysStoppedAnimation<Color>(accentColor),
              minHeight: 6,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            '${studyMinutes ~/ 60}h ${studyMinutes % 60}m studied',
            style: const TextStyle(
              fontSize: 12,
              color: StudyAiColors.textMuted,
            ),
          ),
        ],
      ),
    );
  }
}
