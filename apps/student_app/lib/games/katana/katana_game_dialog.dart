import 'package:flutter/material.dart';
import 'package:shared_services/shared_services.dart';
import 'katana_game_view.dart';

class KatanaGameDialog extends StatelessWidget {
  final StudyAiApiClient apiClient;
  final String topic;
  final String subject;
  final String mode;
  final int stageIndex;

  const KatanaGameDialog({
    Key? key,
    required this.apiClient,
    required this.topic,
    required this.subject,
    this.mode = 'campaign',
    this.stageIndex = 1,
  }) : super(key: key);

  static void show(
    BuildContext context, {
    required StudyAiApiClient apiClient,
    required String topic,
    required String subject,
    String mode = 'campaign',
    int stageIndex = 1,
  }) {
    showGeneralDialog(
      context: context,
      barrierDismissible: false,
      barrierColor: Colors.black.withOpacity(0.85),
      transitionDuration: const Duration(milliseconds: 250),
      pageBuilder: (context, anim1, anim2) {
        return KatanaGameDialog(
          apiClient: apiClient,
          topic: topic,
          subject: subject,
          mode: mode,
          stageIndex: stageIndex,
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Dialog.fullscreen(
      child: KatanaGameView(
        apiClient: apiClient,
        topic: topic,
        subject: subject,
        mode: mode,
        stageIndex: stageIndex,
        onExit: () => Navigator.of(context).pop(),
      ),
    );
  }
}
