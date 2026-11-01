import 'package:flutter/material.dart';
import 'package:shared_ui/shared_ui.dart';
import 'state/student_app_state.dart';
import 'screens/main_shell.dart';

class StudyAiStudentApp extends StatefulWidget {
  const StudyAiStudentApp({Key? key}) : super(key: key);

  @override
  State<StudyAiStudentApp> createState() => _StudyAiStudentAppState();
}

class _StudyAiStudentAppState extends State<StudyAiStudentApp> {
  late final StudentAppState _appState;

  @override
  void initState() {
    super.initState();
    _appState = StudentAppState();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _appState,
      builder: (context, _) {
        return MaterialApp(
          title: 'STUDYAI — Multimodal AI Learning Ecosystem',
          theme: StudyAiTheme.darkTheme,
          debugShowCheckedModeBanner: false,
          home: MainShell(state: _appState),
        );
      },
    );
  }
}
