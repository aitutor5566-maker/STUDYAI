import 'package:flutter/material.dart';

enum KatanaWarriorState {
  idle,
  running,
  jumping,
  slashing,
  defending,
  specialStrike,
  hit,
  victory,
  defeat,
}

enum KatanaEnemyState {
  idle,
  approaching,
  attacking,
  hit,
  bossRage,
  defeat,
}

class FireflyParticle {
  double x;
  double y;
  double radius;
  double speedX;
  double speedY;
  double opacity;
  double phase;

  FireflyParticle({
    required this.x,
    required this.y,
    required this.radius,
    required this.speedX,
    required this.speedY,
    required this.opacity,
    required this.phase,
  });
}

class SlashParticle {
  double x;
  double y;
  double vx;
  double vy;
  double life;
  Color color;

  SlashParticle({
    required this.x,
    required this.y,
    required this.vx,
    required this.vy,
    required this.life,
    required this.color,
  });
}
