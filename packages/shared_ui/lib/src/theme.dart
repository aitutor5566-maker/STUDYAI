import 'package:flutter/material.dart';

class StudyAiColors {
  // Primary Rich Orange Palette (Apple-Inspired Education)
  static const Color primary = Color(0xFFFF6A00);
  static const Color primaryLight = Color(0xFFFF8533);
  static const Color primaryDark = Color(0xFFE05D00);
  static const Color primaryGlow = Color(0x33FF6A00);

  // Backgrounds & Glass Surfaces
  static const Color background = Color(0xFF0F172A);
  static const Color backgroundLight = Color(0xFFF8FAFC);
  static const Color surface = Color(0xFF1E293B);
  static const Color surfaceLight = Color(0xFF334155);
  static const Color glassSurface = Color(0x991E293B);
  static const Color glassBorder = Color(0x26FFFFFF);

  // Typography
  static const Color textLight = Color(0xFFF8FAFC);
  static const Color textMuted = Color(0xFF94A3B8);
  static const Color textDark = Color(0xFF0F172A);

  // Accents
  static const Color cyanAccent = Color(0xFF38BDF8);
  static const Color greenAccent = Color(0xFF10B981);
  static const Color redAccent = Color(0xFFEF4444);
  static const Color amberAccent = Color(0xFFF59E0B);
  static const Color purpleAccent = Color(0xFF8B5CF6);
}

class StudyAiTheme {
  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: StudyAiColors.background,
      primaryColor: StudyAiColors.primary,
      fontFamily: 'Inter',
      colorScheme: const ColorScheme.dark(
        primary: StudyAiColors.primary,
        secondary: StudyAiColors.cyanAccent,
        surface: StudyAiColors.surface,
        background: StudyAiColors.background,
        error: StudyAiColors.redAccent,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: StudyAiColors.textLight,
          fontSize: 20,
          fontWeight: FontWeight.w700,
          letterSpacing: -0.5,
        ),
      ),
      cardTheme: CardTheme(
        color: StudyAiColors.surface.withOpacity(0.85),
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: StudyAiColors.glassBorder, width: 1),
        ),
      ),
    );
  }
}
