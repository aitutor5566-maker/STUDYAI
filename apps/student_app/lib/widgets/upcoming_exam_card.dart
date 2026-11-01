import 'package:flutter/material.dart';
import 'package:shared_models/shared_models.dart';
import 'package:shared_ui/shared_ui.dart';

class UpcomingExamCard extends StatelessWidget {
  final Examination examination;
  final VoidCallback onStart;

  const UpcomingExamCard({
    Key? key,
    required this.examination,
    required this.onStart,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return StudyAiGlassCard(
      padding: const EdgeInsets.all(18),
      child: Row(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: StudyAiColors.primary.withOpacity(0.15),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: StudyAiColors.primary.withOpacity(0.3), width: 1.5),
            ),
            child: const Icon(Icons.assignment_turned_in_rounded, color: StudyAiColors.primary, size: 26),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: StudyAiColors.cyanAccent.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        examination.subject.toUpperCase(),
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: StudyAiColors.cyanAccent),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '${examination.durationMinutes} mins • ${examination.totalMarks} marks',
                      style: const TextStyle(fontSize: 12, color: StudyAiColors.textMuted),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  examination.title,
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: StudyAiColors.textLight),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          ElevatedButton(
            onPressed: onStart,
            style: ElevatedButton.styleFrom(
              backgroundColor: StudyAiColors.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: const Text('Start Exam', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
          ),
        ],
      ),
    );
  }
}
