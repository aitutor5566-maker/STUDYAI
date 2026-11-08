import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'katana_models.dart';

class ParallaxForestPainter extends CustomPainter {
  final double animationTime; // continuously advancing seconds
  final double cameraX;
  final KatanaWarriorState warriorState;
  final KatanaEnemyState enemyState;
  final double warriorActionProgress; // 0.0 to 1.0 for slash or hit
  final int targetedEnemyIndex; // 0, 1, 2, 3
  final Set<int> defeatedEnemies; // indices of defeated enemies
  final List<FireflyParticle> fireflies;
  final List<SlashParticle> slashParticles;
  final bool isBoss;
  final double enemyHpRatio; // 0.0 to 1.0
  final double playerHpRatio;
  final List<String> optionLetters; // ['A', 'B', 'C', 'D']

  ParallaxForestPainter({
    required this.animationTime,
    required this.cameraX,
    required this.warriorState,
    required this.enemyState,
    required this.warriorActionProgress,
    this.targetedEnemyIndex = 0,
    this.defeatedEnemies = const {},
    required this.fireflies,
    required this.slashParticles,
    required this.isBoss,
    required this.enemyHpRatio,
    required this.playerHpRatio,
    this.optionLetters = const ['A', 'B', 'C', 'D'],
  });

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;
    final groundY = h * 0.72;

    // 1. Layer 1: Night Sky Gradient (Moonlit Bamboo Forest)
    final skyPaint = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [Color(0xFF060B19), Color(0xFF0F1E36), Color(0xFF0B3B42)],
      ).createShader(Rect.fromLTWH(0, 0, w, h));
    canvas.drawRect(Rect.fromLTWH(0, 0, w, h), skyPaint);

    // 2. Full Glowing Moon
    final moonX = w * 0.82 - (cameraX * 0.04) % (w * 0.4);
    final moonY = h * 0.20;
    final moonRadius = math.min(w, h) * 0.10;

    // Outer Moon Aura
    final moonAuraPaint = Paint()
      ..color = const Color(0x3338BDF8)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 28);
    canvas.drawCircle(Offset(moonX, moonY), moonRadius * 1.5, moonAuraPaint);

    // Moon Core
    final moonPaint = Paint()..color = const Color(0xFFF1F5F9);
    canvas.drawCircle(Offset(moonX, moonY), moonRadius, moonPaint);

    // Moon craters
    final craterPaint = Paint()..color = const Color(0xFFCBD5E1).withOpacity(0.4);
    canvas.drawCircle(Offset(moonX - moonRadius * 0.3, moonY - moonRadius * 0.2), moonRadius * 0.25, craterPaint);
    canvas.drawCircle(Offset(moonX + moonRadius * 0.25, moonY + moonRadius * 0.3), moonRadius * 0.18, craterPaint);

    // 3. Layer 2: Distant Mountain Silhouettes (Parallax 0.15)
    final mountainOffset = (cameraX * 0.15) % (w * 1.5);
    final mountainPath = Path();
    mountainPath.moveTo(-w * 0.5 - mountainOffset, groundY);
    for (double x = -w * 0.5 - mountainOffset; x <= w * 2; x += 180) {
      final peakH = 110 + 40 * math.sin((x + 200) * 0.005);
      mountainPath.lineTo(x + 90, groundY - peakH);
      mountainPath.lineTo(x + 180, groundY);
    }
    mountainPath.lineTo(w, h);
    mountainPath.lineTo(0, h);
    mountainPath.close();

    final mountainPaint = Paint()..color = const Color(0xFF0A192F).withOpacity(0.85);
    canvas.drawPath(mountainPath, mountainPaint);

    // 4. Layer 3: Distant Bamboo Stalks (Parallax 0.35)
    final distOffset = (cameraX * 0.35) % 120;
    final distBambooPaint = Paint()
      ..color = const Color(0xFF0D3B43).withOpacity(0.65)
      ..strokeWidth = 14
      ..strokeCap = StrokeCap.round;

    for (double bx = -100 - distOffset; bx <= w + 100; bx += 70) {
      final sway = math.sin(animationTime * 1.2 + bx * 0.05) * 6;
      canvas.drawLine(Offset(bx, groundY), Offset(bx + sway, groundY - 240), distBambooPaint);
    }

    // 5. Layer 4: Near Bamboo Stalks (Parallax 0.65)
    final nearOffset = (cameraX * 0.65) % 160;
    final nearBambooPaint = Paint()
      ..color = const Color(0xFF0E565F)
      ..strokeWidth = 22
      ..strokeCap = StrokeCap.round;

    for (double bx = -120 - nearOffset; bx <= w + 120; bx += 130) {
      final sway = math.sin(animationTime * 1.5 + bx * 0.08) * 10;
      canvas.drawLine(Offset(bx, groundY), Offset(bx + sway, groundY - 320), nearBambooPaint);
    }

    // 6. Ground Plane (Stone bridge / battlefield floor)
    final groundPaint = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [Color(0xFF1C2833), Color(0xFF0B1015)],
      ).createShader(Rect.fromLTWH(0, groundY, w, h - groundY));
    canvas.drawRect(Rect.fromLTWH(0, groundY, w, h - groundY), groundPaint);

    // Glowing Orange Ground Edge Line
    final edgePaint = Paint()
      ..color = const Color(0xFFFF6A00).withOpacity(0.7)
      ..strokeWidth = 3;
    canvas.drawLine(Offset(0, groundY), Offset(w, groundY), edgePaint);

    // 7. Firefly Particles
    for (final f in fireflies) {
      f.x += f.speedX;
      f.y += f.speedY;
      if (f.x < -20) f.x = w + 20;
      if (f.x > w + 20) f.x = -20;

      final pulse = 0.5 + 0.5 * math.sin(animationTime * 2.5 + f.phase);
      final fireflyPaint = Paint()
        ..color = const Color(0xFF38BDF8).withOpacity(f.opacity * pulse)
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 3);
      canvas.drawCircle(Offset(f.x, f.y), f.radius, fireflyPaint);
    }

    // 8. Calculate 4 Enemy Positions (Across right half of battlefield)
    final enemyPositions = [
      w * 0.52, // Enemy 0 (Option A)
      w * 0.66, // Enemy 1 (Option B)
      w * 0.79, // Enemy 2 (Option C)
      w * 0.91, // Enemy 3 (Option D)
    ];

    // 9. Draw 4 Separate Shadow Warrior Enemies with Option Billboard Badges
    for (int i = 0; i < enemyPositions.length; i++) {
      if (defeatedEnemies.contains(i)) continue;

      final ex = enemyPositions[i];
      final isTargeted = warriorState == KatanaWarriorState.slashing && targetedEnemyIndex == i;

      _drawEnemy(
        canvas,
        ex,
        groundY,
        isTargeted ? enemyState : KatanaEnemyState.idle,
        warriorActionProgress,
        animationTime + i * 0.8,
        isBoss,
        optionLetters.length > i ? optionLetters[i] : String.fromCharCode(65 + i),
      );
    }

    // 10. Draw Main Samurai Warrior (Dashes to targeted enemy during slash)
    double warriorBaseX = w * 0.22;
    double warriorX = warriorBaseX;

    if (warriorState == KatanaWarriorState.slashing && targetedEnemyIndex >= 0 && targetedEnemyIndex < enemyPositions.length) {
      // Dash towards target enemy
      final targetX = enemyPositions[targetedEnemyIndex] - 50;
      warriorX = warriorBaseX + (targetX - warriorBaseX) * math.min(warriorActionProgress * 1.8, 1.0);
    }

    _drawWarrior(canvas, warriorX, groundY, warriorState, warriorActionProgress, animationTime);

    // 11. Slash & Impact Particles
    for (final sp in slashParticles) {
      final particlePaint = Paint()
        ..color = sp.color.withOpacity(math.max(0, sp.life))
        ..strokeWidth = 3
        ..strokeCap = StrokeCap.round;
      canvas.drawLine(Offset(sp.x, sp.y), Offset(sp.x - sp.vx * 3, sp.y - sp.vy * 3), particlePaint);
    }
  }

  // Draw Samurai Warrior with Ronin Hat, Katana, and Slashing Energy
  void _drawWarrior(Canvas canvas, double x, double y, KatanaWarriorState state, double progress, double time) {
    final isSlashing = state == KatanaWarriorState.slashing || state == KatanaWarriorState.specialStrike;
    final isHit = state == KatanaWarriorState.hit;

    final bobbing = isSlashing ? 0.0 : math.sin(time * 3.5) * 3;
    final warriorY = y - 60 + bobbing;

    canvas.save();
    canvas.translate(x, warriorY);

    if (isHit) {
      canvas.translate(-8, 0); // Stagger backward on hit
    }

    // Shadow on ground
    final shadowPaint = Paint()..color = Colors.black.withOpacity(0.4);
    canvas.drawOval(Rect.fromCenter(center: Offset(0, 60 - bobbing), width: 48, height: 12), shadowPaint);

    // Robes / Hakama
    final robePaint = Paint()..color = isHit ? const Color(0xFF7F1D1D) : const Color(0xFF0F172A);
    final armorPaint = Paint()..color = const Color(0xFF1E293B);
    final sashPaint = Paint()..color = const Color(0xFFFF6A00); // StudyAi orange sash

    // Body Torso
    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromCenter(center: const Offset(0, 10), width: 26, height: 42), const Radius.circular(6)), robePaint);
    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromCenter(center: const Offset(0, 6), width: 20, height: 26), const Radius.circular(4)), armorPaint);

    // Orange Obi Sash
    canvas.drawRect(Rect.fromCenter(center: const Offset(0, 18), width: 24, height: 6), sashPaint);

    // Head & Straw Hat (Kasa)
    final headPaint = Paint()..color = const Color(0xFFE2E8F0);
    canvas.drawCircle(const Offset(0, -18), 10, headPaint);

    // Ronin Kasa Hat
    final hatPath = Path();
    hatPath.moveTo(-22, -22);
    hatPath.lineTo(22, -22);
    hatPath.lineTo(0, -36);
    hatPath.close();
    final hatPaint = Paint()..color = const Color(0xFFB45309);
    canvas.drawPath(hatPath, hatPaint);

    // Glowing Eyes under hat brim
    final eyePaint = Paint()..color = const Color(0xFF38BDF8);
    canvas.drawCircle(const Offset(4, -18), 1.8, eyePaint);

    // Katana Blade & Arm
    final bladePaint = Paint()
      ..color = isSlashing ? const Color(0xFF38BDF8) : const Color(0xFFE2E8F0)
      ..strokeWidth = 3.5
      ..strokeCap = StrokeCap.round;

    if (isSlashing) {
      // Slashing forward swing with energy trail
      final slashAngle = -math.pi * 0.3 + progress * math.pi * 0.8;
      canvas.save();
      canvas.translate(14, 10);
      canvas.rotate(slashAngle);
      canvas.drawLine(Offset.zero, const Offset(55, 0), bladePaint);

      // Katana Glowing Energy Arc
      final arcPaint = Paint()
        ..color = const Color(0xFFFF6A00).withOpacity(1.0 - progress)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 6
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 8);
      canvas.drawArc(Rect.fromCircle(center: Offset.zero, radius: 55), -0.5, 1.4, false, arcPaint);
      canvas.restore();
    } else {
      // Sheathed / Ready stance
      canvas.drawLine(const Offset(4, 14), const Offset(28, -8), bladePaint);
    }

    canvas.restore();
  }

  // Draw 3D-styled Shadow Demon Enemy with floating option badge
  void _drawEnemy(
    Canvas canvas,
    double x,
    double y,
    KatanaEnemyState state,
    double progress,
    double time,
    bool isBoss,
    String optionLetter,
  ) {
    final scale = isBoss ? 1.25 : 0.9;
    final isHit = state == KatanaEnemyState.hit;
    final floatY = math.sin(time * 3.0 + 1.2) * 5;
    final enemyY = y - (isBoss ? 75 : 55) + floatY;

    canvas.save();
    canvas.translate(x, enemyY);
    canvas.scale(scale);

    if (isHit) {
      canvas.translate(12, 0); // Stagger backward on hit
    }

    // Shadow Demon Mist Body
    final mistPaint = Paint()
      ..color = isHit ? const Color(0xFFEF4444).withOpacity(0.9) : (isBoss ? const Color(0xFF4A0404) : const Color(0xFF1E1B4B))
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, isBoss ? 12 : 6);

    canvas.drawOval(Rect.fromCenter(center: const Offset(0, 10), width: isBoss ? 56 : 38, height: isBoss ? 70 : 48), mistPaint);

    // Demon Face & Horns
    final hornPaint = Paint()..color = isBoss ? const Color(0xFFDC2626) : const Color(0xFF7C3AED);
    final hornLeft = Path()
      ..moveTo(-12, -18)
      ..quadraticBezierTo(-22, -34, -14, -42)
      ..lineTo(-8, -20);
    final hornRight = Path()
      ..moveTo(12, -18)
      ..quadraticBezierTo(22, -34, 14, -42)
      ..lineTo(8, -20);
    canvas.drawPath(hornLeft, hornPaint);
    canvas.drawPath(hornRight, hornPaint);

    // Piercing Red Glowing Eyes
    final redEyePaint = Paint()
      ..color = const Color(0xFFEF4444)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 4);
    canvas.drawCircle(const Offset(-8, -8), isBoss ? 4.5 : 3.0, redEyePaint);
    canvas.drawCircle(const Offset(8, -8), isBoss ? 4.5 : 3.0, redEyePaint);

    // Option Badge Pill Above Enemy Head [A], [B], [C], [D]
    final badgePaint = Paint()..color = const Color(0xFFFF6A00);
    canvas.drawRRect(
      RRect.fromRectAndRadius(Rect.fromCenter(center: const Offset(0, -56), width: 28, height: 28), const Radius.circular(14)),
      badgePaint,
    );

    final textPainter = TextPainter(
      text: TextSpan(
        text: optionLetter,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 14,
          fontWeight: FontWeight.w900,
        ),
      ),
      textDirection: TextDirection.ltr,
    )..layout();

    textPainter.paint(
      canvas,
      Offset(-textPainter.width / 2, -56 - textPainter.height / 2),
    );

    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant ParallaxForestPainter oldDelegate) {
    return true; // continuous 60 FPS animation ticker
  }
}
