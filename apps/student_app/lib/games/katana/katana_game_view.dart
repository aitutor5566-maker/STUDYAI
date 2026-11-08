import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:shared_models/shared_models.dart';
import 'package:shared_services/shared_services.dart';
import 'package:shared_ui/shared_ui.dart';
import 'katana_models.dart';
import 'parallax_forest_painter.dart';

class KatanaGameView extends StatefulWidget {
  final StudyAiApiClient apiClient;
  final String topic;
  final String subject;
  final String mode; // 'campaign', 'practice', 'endless'
  final int stageIndex;
  final VoidCallback? onExit;

  const KatanaGameView({
    Key? key,
    required this.apiClient,
    required this.topic,
    required this.subject,
    this.mode = 'campaign',
    this.stageIndex = 1,
    this.onExit,
  }) : super(key: key);

  @override
  State<KatanaGameView> createState() => _KatanaGameViewState();
}

class _KatanaGameViewState extends State<KatanaGameView> with SingleTickerProviderStateMixin {
  late final AnimationController _tickerController;

  // Game Engine State
  double _animationTime = 0.0;
  double _cameraX = 0.0;
  KatanaWarriorState _warriorState = KatanaWarriorState.idle;
  KatanaEnemyState _enemyState = KatanaEnemyState.idle;
  double _actionProgress = 0.0;

  // Particle systems
  final List<FireflyParticle> _fireflies = [];
  final List<SlashParticle> _slashParticles = [];

  // Session & Battle State
  bool _isLoading = true;
  String? _sessionId;
  int _playerHp = 100;
  int _playerMaxHp = 100;
  int _enemyHp = 100;
  int _enemyMaxHp = 100;
  int _spiritEnergy = 0;
  int _score = 0;
  int _comboCount = 0;
  int _currentWave = 1;
  final int _totalWaves = 5;
  bool _isBoss = false;

  KatanaQuestion? _currentQuestion;
  String? _selectedOption;
  bool _isCheckingAnswer = false;
  String? _lastExplanation;
  bool? _lastAnswerCorrect;

  // Victory / Defeat Overlay
  bool _isGameOver = false;
  bool _isVictory = false;
  int _earnedXp = 0;
  int _earnedStars = 0;

  @override
  void initState() {
    super.initState();

    _isBoss = widget.stageIndex == 5;
    if (_isBoss) {
      _enemyHp = 250;
      _enemyMaxHp = 250;
    }

    // Seed floating firefly particles
    final rnd = math.Random();
    for (int i = 0; i < 28; i++) {
      _fireflies.add(FireflyParticle(
        x: rnd.nextDouble() * 1200,
        y: 80 + rnd.nextDouble() * 420,
        radius: 1.5 + rnd.nextDouble() * 2.5,
        speedX: -0.4 + rnd.nextDouble() * 0.8,
        speedY: -0.3 + rnd.nextDouble() * 0.6,
        opacity: 0.4 + rnd.nextDouble() * 0.6,
        phase: rnd.nextDouble() * math.pi * 2,
      ));
    }

    // 60 FPS Ticker loop
    _tickerController = AnimationController(vsync: this, duration: const Duration(seconds: 10000))
      ..addListener(_onTick);
    _tickerController.forward();

    // Start battle session via backend
    _startBattleSession();
  }

  void _onTick() {
    setState(() {
      _animationTime += 0.016;
      _cameraX += 0.8;

      // Update fireflies
      for (final f in _fireflies) {
        f.x += f.speedX;
        f.y += f.speedY;
        if (f.x < -20) f.x = 1220;
        if (f.x > 1220) f.x = -20;
        if (f.y < 40) f.y = 480;
        if (f.y > 520) f.y = 50;
      }

      // Update slash particles
      for (int i = _slashParticles.length - 1; i >= 0; i--) {
        final sp = _slashParticles[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.life -= 0.04;
        if (sp.life <= 0) {
          _slashParticles.removeAt(i);
        }
      }

      // Animation transition timers
      if (_warriorState == KatanaWarriorState.slashing) {
        _actionProgress += 0.06;
        if (_actionProgress >= 1.0) {
          _warriorState = KatanaWarriorState.idle;
          _actionProgress = 0.0;
        }
      } else if (_warriorState == KatanaWarriorState.hit) {
        _actionProgress += 0.05;
        if (_actionProgress >= 1.0) {
          _warriorState = KatanaWarriorState.idle;
          _actionProgress = 0.0;
        }
      }

      if (_enemyState == KatanaEnemyState.hit) {
        if (_actionProgress >= 0.8) {
          _enemyState = KatanaEnemyState.idle;
        }
      }
    });
  }

  Future<void> _startBattleSession() async {
    try {
      final res = await widget.apiClient.startKatanaSession(
        mode: widget.mode,
        environment: 'moonlit_bamboo_forest',
        subject: widget.subject,
        topic: widget.topic,
        stageIndex: widget.stageIndex,
      );

      setState(() {
        _sessionId = res['sessionId'] as String?;
        _playerHp = (res['playerHp'] as num?)?.toInt() ?? 100;
        _playerMaxHp = (res['playerMaxHp'] as num?)?.toInt() ?? 100;
        _currentWave = (res['currentWave'] as num?)?.toInt() ?? 1;
        if (res['currentQuestion'] != null) {
          _currentQuestion = KatanaQuestion.fromJson(res['currentQuestion'] as Map<String, dynamic>);
        }
        _isLoading = false;
      });
    } catch (_) {
      // Offline fallback starter question
      setState(() {
        _sessionId = 'local-kat-sess-01';
        _currentQuestion = KatanaQuestion(
          id: 'kq-local-1',
          subject: widget.subject,
          topic: widget.topic,
          prompt: 'During photosynthesis in green plants, which molecule is split to release oxygen gas into the atmosphere?',
          options: ['Water (H2O)', 'Carbon dioxide (CO2)', 'Glucose (C6H12O6)'],
          difficulty: 'medium',
          conceptTag: 'Photolysis & Light Reactions',
          questionType: 'mcq_battle',
        );
        _isLoading = false;
      });
    }
  }

  Future<void> _handleSelectOption(String option) async {
    if (_isCheckingAnswer || _currentQuestion == null || _isGameOver) return;

    setState(() {
      _selectedOption = option;
      _isCheckingAnswer = true;
    });

    try {
      final strikeRes = await widget.apiClient.validateKatanaStrike(
        sessionId: _sessionId ?? 'local-sess',
        questionId: _currentQuestion!.id,
        studentAnswer: option,
      );

      _applyStrikeFeedback(strikeRes);
    } catch (_) {
      // Local evaluation fallback
      final isCorrect = option.toLowerCase().contains('water') || option.toLowerCase().contains('20');
      final fallbackResult = KatanaStrikeResult(
        isCorrect: isCorrect,
        damageDealt: isCorrect ? 40 : 0,
        playerDamageTaken: isCorrect ? 0 : 20,
        playerHp: math.max(0, _playerHp - (isCorrect ? 0 : 20)),
        spiritEnergy: math.min(100, _spiritEnergy + (isCorrect ? 25 : 5)),
        comboCount: isCorrect ? _comboCount + 1 : 0,
        score: _score + (isCorrect ? 150 : 0),
        explanation: isCorrect
          ? 'Correct strike! Water molecules undergo photolysis in the thylakoid lumen releasing oxygen.'
          : 'Incorrect. Remember that water (H2O), not carbon dioxide, is split to produce oxygen.',
        conceptTag: _currentQuestion?.conceptTag ?? 'Key Concept',
        strikeAnimation: isCorrect ? 'katana_slash' : 'player_defend_hit',
        isDefeated: false,
      );

      _applyStrikeFeedback(fallbackResult);
    }
  }

  void _applyStrikeFeedback(KatanaStrikeResult strike) {
    setState(() {
      _isCheckingAnswer = false;
      _lastAnswerCorrect = strike.isCorrect;
      _lastExplanation = strike.explanation;

      _playerHp = strike.playerHp;
      _spiritEnergy = strike.spiritEnergy;
      _comboCount = strike.comboCount;
      _score = strike.score;

      if (strike.isCorrect) {
        // Trigger warrior slash and enemy hit
        _warriorState = KatanaWarriorState.slashing;
        _enemyState = KatanaEnemyState.hit;
        _actionProgress = 0.0;
        _enemyHp = math.max(0, _enemyHp - strike.damageDealt);

        // Spawn glowing orange & cyan slash sparks
        final rnd = math.Random();
        for (int i = 0; i < 18; i++) {
          _slashParticles.add(SlashParticle(
            x: 600 + rnd.nextDouble() * 60,
            y: 280 + rnd.nextDouble() * 60,
            vx: -4 + rnd.nextDouble() * 8,
            vy: -4 + rnd.nextDouble() * 8,
            life: 1.0,
            color: (i % 2 == 0) ? const Color(0xFFFF6A00) : const Color(0xFF38BDF8),
          ));
        }
      } else {
        // Player takes hit
        _warriorState = KatanaWarriorState.hit;
        _actionProgress = 0.0;
      }

      // Check for Enemy Defeat / Stage Victory
      if (_enemyHp <= 0) {
        if (_currentWave < _totalWaves) {
          // Advance to next wave
          _currentWave++;
          _enemyHp = _isBoss ? 250 : 100;
          _currentQuestion = strike.nextQuestion ?? _currentQuestion;
        } else {
          // Stage cleared!
          _triggerVictory();
        }
      } else if (_playerHp <= 0) {
        // Player defeated
        _triggerDefeat();
      } else {
        // Next question
        if (strike.nextQuestion != null) {
          _currentQuestion = strike.nextQuestion;
        }
      }
    });
  }

  Future<void> _triggerVictory() async {
    setState(() {
      _isGameOver = true;
      _isVictory = true;
      _warriorState = KatanaWarriorState.victory;
    });

    try {
      final summary = await widget.apiClient.completeKatanaSession(
        sessionId: _sessionId ?? 'local-sess',
        victory: true,
      );
      setState(() {
        _earnedXp = (summary['xpEarned'] as num?)?.toInt() ?? 250;
        _earnedStars = (summary['stars'] as num?)?.toInt() ?? 3;
      });
    } catch (_) {
      setState(() {
        _earnedXp = 250;
        _earnedStars = 3;
      });
    }
  }

  Future<void> _triggerDefeat() async {
    setState(() {
      _isGameOver = true;
      _isVictory = false;
      _warriorState = KatanaWarriorState.defeat;
    });

    try {
      await widget.apiClient.completeKatanaSession(
        sessionId: _sessionId ?? 'local-sess',
        victory: false,
      );
    } catch (_) {}
  }

  @override
  void dispose() {
    _tickerController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Container(
        color: const Color(0xFF060B19),
        child: const Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              CircularProgressIndicator(color: StudyAiColors.primary),
              SizedBox(height: 16),
              Text(
                'Entering the Moonlit Bamboo Forest...',
                style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // 1. 2.5D Canvas Render Layer (Parallax Bamboo Forest, Samurai & Enemy)
          Positioned.fill(
            child: CustomPaint(
              painter: ParallaxForestPainter(
                animationTime: _animationTime,
                cameraX: _cameraX,
                warriorState: _warriorState,
                enemyState: _enemyState,
                warriorActionProgress: _actionProgress,
                fireflies: _fireflies,
                slashParticles: _slashParticles,
                isBoss: _isBoss,
                enemyHpRatio: _enemyMaxHp > 0 ? _enemyHp / _enemyMaxHp : 0.0,
                playerHpRatio: _playerMaxHp > 0 ? _playerHp / _playerMaxHp : 0.0,
              ),
            ),
          ),

          // 2. Top Tactical HUD (HP Bars, Combo, Wave, Exit)
          Positioned(
            top: 24,
            left: 20,
            right: 20,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Player Status (Left)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A).withOpacity(0.85),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: StudyAiColors.primary.withOpacity(0.4)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.shield_rounded, size: 16, color: StudyAiColors.cyanAccent),
                          const SizedBox(width: 6),
                          const Text('WARRIOR', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Colors.white)),
                          if (_comboCount > 1) ...[
                            const SizedBox(width: 10),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: StudyAiColors.primary,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text('x$_comboCount COMBO 🔥', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white)),
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 6),
                      // HP Bar
                      Row(
                        children: [
                          Container(
                            width: 130,
                            height: 8,
                            decoration: BoxDecoration(color: Colors.white12, borderRadius: BorderRadius.circular(999)),
                            child: FractionallySizedBox(
                              alignment: Alignment.centerLeft,
                              widthFactor: math.max(0, _playerHp / _playerMaxHp),
                              child: Container(
                                decoration: BoxDecoration(
                                  gradient: const LinearGradient(colors: [Color(0xFF10B981), Color(0xFF34D399)]),
                                  borderRadius: BorderRadius.circular(999),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text('$_playerHp/$_playerMaxHp', style: const TextStyle(fontSize: 10, color: Colors.white70, fontWeight: FontWeight.w700)),
                        ],
                      ),
                    ],
                  ),
                ),

                // Center Topic & Wave Info
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.7),
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(color: Colors.white12),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(widget.topic, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: StudyAiColors.primary)),
                      const Text(' • ', style: TextStyle(color: Colors.white30)),
                      Text(
                        _isBoss ? 'FINAL BOSS' : 'Wave $_currentWave of $_totalWaves',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white),
                      ),
                    ],
                  ),
                ),

                // Enemy Status & Close Button (Right)
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A).withOpacity(0.85),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.red.withOpacity(0.4)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Row(
                            children: [
                              Text(
                                _isBoss ? 'SHADOW WARLORD' : 'SHADOW SPIRIT',
                                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Colors.redAccent),
                              ),
                              const SizedBox(width: 6),
                              const Icon(Icons.flash_on_rounded, size: 16, color: Colors.redAccent),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              Text('$_enemyHp/$_enemyMaxHp', style: const TextStyle(fontSize: 10, color: Colors.white70, fontWeight: FontWeight.w700)),
                              const SizedBox(width: 8),
                              Container(
                                width: 130,
                                height: 8,
                                decoration: BoxDecoration(color: Colors.white12, borderRadius: BorderRadius.circular(999)),
                                child: FractionallySizedBox(
                                  alignment: Alignment.centerRight,
                                  widthFactor: math.max(0, _enemyHp / _enemyMaxHp),
                                  child: Container(
                                    decoration: BoxDecoration(
                                      gradient: const LinearGradient(colors: [Color(0xFFEF4444), Color(0xFFDC2626)]),
                                      borderRadius: BorderRadius.circular(999),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 10),
                    IconButton(
                      icon: const Icon(Icons.close_rounded, color: Colors.white),
                      onPressed: () {
                        if (widget.onExit != null) {
                          widget.onExit!();
                        } else {
                          Navigator.of(context).pop();
                        }
                      },
                    ),
                  ],
                ),
              ],
            ),
          ),

          // 3. Bottom Tactical Question Card & 3-Choice Combat Actions
          if (!_isGameOver && _currentQuestion != null)
            Positioned(
              bottom: 24,
              left: 24,
              right: 24,
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 820),
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A).withOpacity(0.92),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: StudyAiColors.primary.withOpacity(0.6), width: 1.5),
                      boxShadow: [
                        BoxShadow(color: StudyAiColors.primary.withOpacity(0.2), blurRadius: 24, offset: const Offset(0, 6)),
                      ],
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Tag & Question Header
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                              decoration: BoxDecoration(
                                color: StudyAiColors.primary.withOpacity(0.18),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                _currentQuestion!.conceptTag.toUpperCase(),
                                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: StudyAiColors.primary),
                              ),
                            ),
                            Text('Score: $_score', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Colors.white70)),
                          ],
                        ),
                        const SizedBox(height: 10),

                        // Prompt
                        Text(
                          _currentQuestion!.prompt,
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white, height: 1.4),
                        ),
                        const SizedBox(height: 16),

                        // 3 Tactical Answer Options
                        Column(
                          children: _currentQuestion!.options.map((opt) {
                            final isSelected = _selectedOption == opt;
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 8),
                              child: Material(
                                color: Colors.transparent,
                                child: InkWell(
                                  borderRadius: BorderRadius.circular(12),
                                  onTap: () => _handleSelectOption(opt),
                                  child: Container(
                                    width: double.infinity,
                                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                    decoration: BoxDecoration(
                                      color: isSelected
                                          ? StudyAiColors.primary.withOpacity(0.25)
                                          : const Color(0xFF1E293B).withOpacity(0.8),
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(
                                        color: isSelected ? StudyAiColors.primary : Colors.white12,
                                        width: isSelected ? 1.5 : 1.0,
                                      ),
                                    ),
                                    child: Row(
                                      children: [
                                        Container(
                                          width: 28,
                                          height: 28,
                                          decoration: BoxDecoration(
                                            color: isSelected ? StudyAiColors.primary : Colors.white10,
                                            shape: BoxShape.circle,
                                          ),
                                          child: Center(
                                            child: Icon(
                                              isSelected ? Icons.sports_martial_arts_rounded : Icons.radio_button_unchecked_rounded,
                                              size: 14,
                                              color: Colors.white,
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 12),
                                        Expanded(
                                          child: Text(
                                            opt,
                                            style: TextStyle(
                                              fontSize: 14,
                                              fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                                              color: isSelected ? StudyAiColors.primaryLight : Colors.white,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),

                        // Educational Explanation Popup
                        if (_lastExplanation != null) ...[
                          const SizedBox(height: 10),
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: (_lastAnswerCorrect == true ? const Color(0xFF065F46) : const Color(0xFF991B1B)).withOpacity(0.4),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                color: _lastAnswerCorrect == true ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                              ),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  _lastAnswerCorrect == true ? Icons.check_circle_rounded : Icons.info_outline_rounded,
                                  size: 18,
                                  color: _lastAnswerCorrect == true ? const Color(0xFF34D399) : const Color(0xFFF87171),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    _lastExplanation!,
                                    style: const TextStyle(fontSize: 12, color: Colors.white, height: 1.4),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ),
            ),

          // 4. Victory / Defeat Modal
          if (_isGameOver)
            Container(
              color: Colors.black.withOpacity(0.85),
              child: Center(
                child: Container(
                  width: 440,
                  padding: const EdgeInsets.all(28),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: _isVictory ? StudyAiColors.primary : Colors.red, width: 2),
                    boxShadow: [
                      BoxShadow(color: (_isVictory ? StudyAiColors.primary : Colors.red).withOpacity(0.25), blurRadius: 32),
                    ],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        _isVictory ? Icons.emoji_events_rounded : Icons.refresh_rounded,
                        size: 56,
                        color: _isVictory ? const Color(0xFFF59E0B) : Colors.redAccent,
                      ),
                      const SizedBox(height: 14),
                      Text(
                        _isVictory ? 'WISDOM STRIKE VICTORY!' : 'SPIRIT DEPLETED',
                        style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _isVictory
                            ? 'You shattered the shadow spirits with precise curriculum mastery!'
                            : 'Review weak concepts and reforge your spirit to conquer this challenge.',
                        textAlign: TextAlign.center,
                        style: const TextStyle(fontSize: 13, color: StudyAiColors.textMuted, height: 1.4),
                      ),
                      const SizedBox(height: 20),

                      if (_isVictory) ...[
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: List.generate(3, (idx) {
                            return Icon(
                              Icons.star_rounded,
                              size: 36,
                              color: idx < _earnedStars ? const Color(0xFFF59E0B) : Colors.white12,
                            );
                          }),
                        ),
                        const SizedBox(height: 12),
                        Text('+$_earnedXp XP Earned', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: StudyAiColors.primary)),
                        const SizedBox(height: 20),
                      ],

                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton(
                              onPressed: () {
                                if (widget.onExit != null) {
                                  widget.onExit!();
                                } else {
                                  Navigator.of(context).pop();
                                }
                              },
                              style: OutlinedButton.styleFrom(
                                foregroundColor: Colors.white,
                                side: const BorderSide(color: Colors.white24),
                                padding: const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              child: const Text('Back to Library'),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: ElevatedButton(
                              onPressed: () {
                                setState(() {
                                  _playerHp = 100;
                                  _enemyHp = _isBoss ? 250 : 100;
                                  _isGameOver = false;
                                  _isVictory = false;
                                  _currentWave = 1;
                                  _startBattleSession();
                                });
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: StudyAiColors.primary,
                                padding: const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              child: const Text('Battle Again', style: TextStyle(fontWeight: FontWeight.w800)),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
