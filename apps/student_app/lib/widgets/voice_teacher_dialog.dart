import 'package:flutter/material.dart';
import 'package:shared_ui/shared_ui.dart';

class VoiceTeacherDialog extends StatefulWidget {
  final dynamic apiClient;
  final String topic;
  final int grade;
  final String subject;
  final String mode;

  const VoiceTeacherDialog({
    Key? key,
    required this.apiClient,
    required this.topic,
    required this.grade,
    required this.subject,
    required this.mode,
  }) : super(key: key);

  @override
  State<VoiceTeacherDialog> createState() => _VoiceTeacherDialogState();
}

class _VoiceTeacherDialogState extends State<VoiceTeacherDialog> with SingleTickerProviderStateMixin {
  final TextEditingController _studentTextController = TextEditingController();
  late AnimationController _waveController;

  String? _sessionId;
  String _teacherSpeech = 'Connecting to Google Gemini Voice Lesson Orchestrator...';
  String _stepTitle = 'Starting Lesson';
  int _currentStep = 0;
  int _totalSteps = 5;
  bool _isLoading = true;
  bool _isSpeaking = false;
  bool _isListening = false;
  bool _isPaused = false;
  String _selectedVoice = 'Kore';
  Map<String, dynamic>? _syncedVisual;
  final List<Map<String, String>> _transcript = [];

  @override
  void initState() {
    super.initState();
    _waveController = AnimationController(vsync: this, duration: const Duration(milliseconds: 1200))..repeat(reverse: true);
    _startVoiceLesson();
  }

  @override
  void dispose() {
    _waveController.dispose();
    _studentTextController.dispose();
    _stopSession();
    super.dispose();
  }

  Future<void> _startVoiceLesson() async {
    setState(() {
      _isLoading = true;
      _teacherSpeech = 'Preparing lesson using verified ICSE curriculum knowledge...';
    });

    try {
      final res = await widget.apiClient.post('/api/v1/voice/start-lesson', {
        'topic': widget.topic,
        'grade': widget.grade,
        'subject': widget.subject,
        'mode': widget.mode,
        'voice_name': _selectedVoice,
      });

      if (mounted) {
        setState(() {
          _sessionId = res['session_id'];
          _teacherSpeech = res['teacher_speech'] ?? '';
          _stepTitle = res['step_title'] ?? 'Welcome';
          _currentStep = res['current_step_index'] ?? 0;
          _totalSteps = res['total_steps'] ?? 5;
          _syncedVisual = res['synced_visual'];
          _isLoading = false;
          _isSpeaking = true;
          _transcript.add({'speaker': 'teacher', 'text': _teacherSpeech});
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _teacherSpeech = 'Voice lesson ready. Tap below to speak with your teacher.';
        });
      }
    }
  }

  Future<void> _sendStudentTurn(String text) async {
    if (_sessionId == null || text.trim().isEmpty) return;

    final studentUtterance = text.trim();
    _studentTextController.clear();

    setState(() {
      _transcript.add({'speaker': 'student', 'text': studentUtterance});
      _isLoading = true;
      _isListening = false;
    });

    try {
      final res = await widget.apiClient.post('/api/v1/voice/interact', {
        'session_id': _sessionId,
        'student_utterance': studentUtterance,
      });

      if (mounted) {
        final reply = res['teacher_speech'] ?? '';
        setState(() {
          _teacherSpeech = reply;
          _stepTitle = res['step_title'] ?? _stepTitle;
          _currentStep = res['current_step_index'] ?? _currentStep;
          _syncedVisual = res['synced_visual'] ?? _syncedVisual;
          _isLoading = false;
          _isSpeaking = true;
          _transcript.add({'speaker': 'teacher', 'text': reply});
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _stopSession() async {
    if (_sessionId != null) {
      try {
        await widget.apiClient.post('/api/v1/voice/control', {
          'session_id': _sessionId,
          'action': 'stop',
        });
      } catch (_) {}
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      child: Container(
        width: 760,
        constraints: const BoxConstraints(maxHeight: 680),
        decoration: BoxDecoration(
          color: const Color(0xFF0F172A),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: StudyAiColors.primary.withOpacity(0.4), width: 2),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.6),
              blurRadius: 30,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Column(
          children: [
            // Top Bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.04),
                borderRadius: const BorderRadius.vertical(top: Radius.circular(22)),
                border: Border.bottom(color: Colors.white.withOpacity(0.08)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [StudyAiColors.primary, StudyAiColors.primaryDark]),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.mic, color: Colors.white, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Text(
                              'AI Teacher Voice Lesson',
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: StudyAiColors.primary.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(999),
                                border: Border.all(color: StudyAiColors.primary.withOpacity(0.4)),
                              ),
                              child: Text(
                                'Grade ${widget.grade} • ${widget.subject}',
                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: StudyAiColors.primary),
                              ),
                            ),
                          ],
                        ),
                        Text(
                          'Topic: ${widget.topic} • Powered by Google Gemini Native Conversational Voice',
                          style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.6)),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white70),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
            ),

            // Main Body: Audio Orb Animation & Live Subtitles
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    // Visual & Audio Indicator Orb
                    AnimatedBuilder(
                      animation: _waveController,
                      builder: (context, child) {
                        final pulse = _isSpeaking ? _waveController.value * 18 : 4.0;
                        return Container(
                          width: 84,
                          height: 84,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: const RadialGradient(colors: [StudyAiColors.primary, Color(0xFF0F172A)]),
                            boxShadow: [
                              BoxShadow(
                                color: StudyAiColors.primary.withOpacity(_isSpeaking ? 0.6 : 0.2),
                                blurRadius: 20 + pulse,
                                spreadRadius: pulse / 2,
                              ),
                            ],
                          ),
                          child: Icon(
                            _isSpeaking ? Icons.volume_up : Icons.mic,
                            color: Colors.white,
                            size: 36,
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: 12),
                    Text(
                      _stepTitle,
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: StudyAiColors.cyanAccent),
                    ),
                    Text(
                      'Step ${_currentStep + 1} of $_totalSteps',
                      style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.5)),
                    ),
                    const SizedBox(height: 16),

                    // Live Speech Transcript Box
                    Expanded(
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.white.withOpacity(0.1)),
                        ),
                        child: SingleChildScrollView(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              for (final msg in _transcript)
                                Padding(
                                  padding: const EdgeInsets.only(bottom: 12),
                                  child: Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: msg['speaker'] == 'teacher'
                                              ? StudyAiColors.primary.withOpacity(0.25)
                                              : StudyAiColors.cyanAccent.withOpacity(0.25),
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: Text(
                                          msg['speaker'] == 'teacher' ? 'TEACHER' : 'YOU',
                                          style: TextStyle(
                                            fontSize: 9,
                                            fontWeight: FontWeight.w900,
                                            color: msg['speaker'] == 'teacher' ? StudyAiColors.primary : StudyAiColors.cyanAccent,
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          msg['text'] ?? '',
                                          style: const TextStyle(fontSize: 13, color: Colors.white, height: 1.4),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              if (_isLoading)
                                Padding(
                                  padding: const EdgeInsets.all(8.0),
                                  child: Row(
                                    children: [
                                      const SizedBox(
                                        width: 14,
                                        height: 14,
                                        child: CircularProgressIndicator(strokeWidth: 2, color: StudyAiColors.primary),
                                      ),
                                      const SizedBox(width: 8),
                                      Text('Teacher is thinking...', style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.6))),
                                    ],
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 12),

                    // Quick Spoken Suggestions
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _buildQuickChip('I understand!'),
                        const SizedBox(width: 8),
                        _buildQuickChip('Explain again'),
                        const SizedBox(width: 8),
                        _buildQuickChip('Give me an example'),
                        const SizedBox(width: 8),
                        _buildQuickChip('I don\'t understand'),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            // Bottom Spoken Response & Voice Controls Bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: const BorderRadius.vertical(bottom: Radius.circular(22)),
                border: Border.top(color: Colors.white.withOpacity(0.08)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _studentTextController,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: InputDecoration(
                        hintText: 'Speak into microphone or type your response...',
                        hintStyle: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 13),
                        filled: true,
                        fillColor: Colors.black.withOpacity(0.3),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(999), borderSide: BorderSide.none),
                      ),
                      onSubmitted: _sendStudentTurn,
                    ),
                  ),
                  const SizedBox(width: 10),
                  IconButton(
                    icon: Icon(_isListening ? Icons.mic : Icons.mic_none, color: _isListening ? StudyAiColors.greenAccent : StudyAiColors.primary),
                    onPressed: () {
                      if (_studentTextController.text.isNotEmpty) {
                        _sendStudentTurn(_studentTextController.text);
                      } else {
                        setState(() => _isListening = !_isListening);
                      }
                    },
                  ),
                  const SizedBox(width: 6),
                  ElevatedButton(
                    onPressed: () => _sendStudentTurn('Explain again, please.'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white.withOpacity(0.1),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                    ),
                    child: const Text('Repeat', style: TextStyle(fontSize: 12)),
                  ),
                  const SizedBox(width: 6),
                  ElevatedButton(
                    onPressed: () {
                      _stopSession();
                      Navigator.of(context).pop();
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.redAccent,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                    ),
                    child: const Text('End Lesson', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickChip(String text) {
    return InkWell(
      onTap: () => _sendStudentTurn(text),
      borderRadius: BorderRadius.circular(999),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.06),
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: Colors.white.withOpacity(0.12)),
        ),
        child: Text(text, style: TextStyle(fontSize: 10.5, color: Colors.white.withOpacity(0.85), fontWeight: FontWeight.w600)),
      ),
    );
  }
}
