import 'package:flutter/material.dart';

/// STUDYAI Universal Responsive Breakpoints
/// Supports: Compact Mobile (<360px), Mobile (360-599px), Tablet (600-1023px),
/// Desktop (1024-1439px), and Large Desktop (>=1440px).
class StudyAiBreakpoints {
  static const double compactMobile = 360.0;
  static const double mobile = 600.0;
  static const double tablet = 1024.0;
  static const double desktop = 1440.0;

  static bool isCompactMobile(BuildContext context) =>
      MediaQuery.of(context).size.width < compactMobile;

  static bool isMobile(BuildContext context) {
    final w = MediaQuery.of(context).size.width;
    return w >= compactMobile && w < mobile;
  }

  static bool isAnyMobile(BuildContext context) =>
      MediaQuery.of(context).size.width < mobile;

  static bool isTablet(BuildContext context) {
    final w = MediaQuery.of(context).size.width;
    return w >= mobile && w < tablet;
  }

  static bool isDesktop(BuildContext context) {
    final w = MediaQuery.of(context).size.width;
    return w >= tablet && w < desktop;
  }

  static bool isLargeDesktop(BuildContext context) =>
      MediaQuery.of(context).size.width >= desktop;

  static double contentMaxWidth(BuildContext context) {
    final w = MediaQuery.of(context).size.width;
    if (w >= desktop) return 1400.0;
    if (w >= tablet) return 1200.0;
    return double.infinity;
  }

  static EdgeInsets pagePadding(BuildContext context) {
    final w = MediaQuery.of(context).size.width;
    if (w < compactMobile) {
      return const EdgeInsets.symmetric(horizontal: 12, vertical: 12);
    }
    if (w < mobile) {
      return const EdgeInsets.symmetric(horizontal: 16, vertical: 16);
    }
    if (w < tablet) {
      return const EdgeInsets.symmetric(horizontal: 24, vertical: 20);
    }
    if (w < desktop) {
      return const EdgeInsets.symmetric(horizontal: 32, vertical: 24);
    }
    return const EdgeInsets.symmetric(horizontal: 48, vertical: 32);
  }
}

/// Adaptive Widget Builder depending on Screen Size constraints
class ResponsiveBuilder extends StatelessWidget {
  final Widget Function(BuildContext context, BoxConstraints constraints) mobile;
  final Widget Function(BuildContext context, BoxConstraints constraints)? tablet;
  final Widget Function(BuildContext context, BoxConstraints constraints)? desktop;

  const ResponsiveBuilder({
    Key? key,
    required this.mobile,
    this.tablet,
    this.desktop,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth >= StudyAiBreakpoints.tablet && desktop != null) {
          return desktop!(context, constraints);
        }
        if (constraints.maxWidth >= StudyAiBreakpoints.mobile && tablet != null) {
          return tablet!(context, constraints);
        }
        return mobile(context, constraints);
      },
    );
  }
}

/// Responsive Container that constraints maximum reading width on large desktop screens
class StudyAiResponsiveContainer extends StatelessWidget {
  final Widget child;
  final double? maxWidth;

  const StudyAiResponsiveContainer({
    Key? key,
    required this.child,
    this.maxWidth,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final maxW = maxWidth ?? StudyAiBreakpoints.contentMaxWidth(context);
    return Center(
      child: ConstrainedBox(
        constraints: BoxConstraints(maxWidth: maxW),
        child: child,
      ),
    );
  }
}
