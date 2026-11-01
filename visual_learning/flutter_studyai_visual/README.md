# STUDYAI Visual Learning — Flutter 3D Integration Architecture

Official multiplatform Flutter package integrating the single-source **Three.js Visual Learning Engine** (`visual_learning/three.js/`) into STUDYAI for Web, Android, and iOS.

---

## 1. Architectural Principles

- **Unified Engine**: Interfaces directly with the centralized Three.js engine (`visual_learning/engine/VisualLearningEngine.ts` and `visual_learning/flutter_studyai_visual/assets/visual_canvas.html`). No duplicate Three.js copies are permitted.
- **Cross-Platform Adaptability**:
  - **Flutter Web**: Direct DOM IFrame and `window.postMessage` bridge with sub-millisecond dispatch latency.
  - **Android & iOS**: Hardware-accelerated `webview_flutter` surface communicating over `JavaScriptChannel('StudyAiVisualBridge')`.
- **Low-Memory & Eco Fallbacks**: Detects memory pressure and automatically adapts geometry resolution, limits render passes, and switches to SVG diagram rendering if WebGL context is lost.
- **Bi-Directional Bridge**:
  - Flutter -> Three.js: `loadModel`, `selectComponent`, `setCameraZoom`, `resetCamera`, `toggleAnimation`, `setQualityMode`.
  - Three.js -> Flutter: `onModelLoaded`, `onComponentSelected`, `onRenderingError`, `onPerformanceReport`, `onLowMemoryWarning`.

---

## 2. Usage in Flutter

```dart
import 'package:flutter/material.dart';
import 'package:flutter_studyai_visual/flutter_studyai_visual.dart';

class LessonVisualScreen extends StatelessWidget {
  final String topic;
  const LessonVisualScreen({Key? key, required this.topic}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('3D Visual Learning: $topic')),
      body: StudyAi3DViewer(
        topic: topic,
        onComponentSelected: (component) {
          print('Student selected: ${component.label} (${component.role})');
          // Dispatch contextual question to AI Tutor
        },
        enableTelemetryBadge: true,
      ),
    );
  }
}
```

---

## 3. Package Structure

```
flutter_studyai_visual/
├── assets/
│   └── visual_canvas.html        # WebView HTML runtime embedding Three.js
├── lib/
│   ├── flutter_studyai_visual.dart # Main library exports
│   └── src/
│       ├── bridge_protocol.dart   # JSON bridge protocol models & enums
│       ├── platform_adapter.dart  # Web DOM & Mobile WebView platform adapters
│       └── studyai_3d_viewer.dart # Full-featured interactive Flutter Widget
├── test/
│   └── flutter_studyai_visual_test.dart # Automated protocol tests
└── pubspec.yaml
```
