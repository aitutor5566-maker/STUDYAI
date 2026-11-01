import 'package:flutter/material.dart';
import 'package:shared_ui/shared_ui.dart';
import 'package:flutter_studyai_visual/flutter_studyai_visual.dart';

class Interactive3DDialog extends StatelessWidget {
  final String modelTitle;
  final String? initialPart;

  const Interactive3DDialog({
    Key? key,
    required this.modelTitle,
    this.initialPart,
  }) : super(key: key);

  static void show(BuildContext context, {required String modelTitle, String? initialPart}) {
    showDialog(
      context: context,
      builder: (ctx) => Interactive3DDialog(modelTitle: modelTitle, initialPart: initialPart),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
      child: StudyAiGlassCard(
        padding: const EdgeInsets.all(20),
        child: SizedBox(
          width: 900,
          height: 600,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: StudyAiColors.primary.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.view_in_ar_rounded, color: StudyAiColors.primary, size: 22),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            modelTitle,
                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: StudyAiColors.textLight),
                          ),
                          const Text(
                            'Three.js Interactive Scientific Simulation (Web & Canvas)',
                            style: TextStyle(fontSize: 12, color: StudyAiColors.textMuted),
                          ),
                        ],
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, color: StudyAiColors.textLight),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(14),
                  child: FlutterStudyAiVisualCanvas(
                    activeTopic: modelTitle,
                    selectedPart: initialPart,
                    onPartSelected: (part) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Selected 3D Component: $part'),
                          duration: const Duration(seconds: 2),
                          backgroundColor: StudyAiColors.surface,
                        ),
                      );
                    },
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
