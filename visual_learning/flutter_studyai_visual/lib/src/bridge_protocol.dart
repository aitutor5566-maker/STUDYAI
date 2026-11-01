import 'dart:convert';

/// Action commands sent from Flutter Dart to Three.js JavaScript Engine
enum VisualActionType {
  loadModel,
  selectComponent,
  setCameraZoom,
  resetCamera,
  toggleAnimation,
  setQualityMode,
  requestPerformanceStats,
  dispose
}

/// Events received from Three.js JavaScript Engine into Flutter Dart
enum VisualEventType {
  onModelLoaded,
  onComponentSelected,
  onRenderingError,
  onPerformanceReport,
  onLowMemoryWarning
}

/// Strongly-typed Bridge Message for two-way Flutter <-> Three.js communication
class VisualBridgeMessage {
  final String type;
  final Map<String, dynamic> payload;
  final int timestamp;

  VisualBridgeMessage({
    required this.type,
    required this.payload,
    int? timestamp,
  }) : timestamp = timestamp ?? DateTime.now().millisecondsSinceEpoch;

  Map<String, dynamic> toMap() => {
        'type': type,
        'payload': payload,
        'timestamp': timestamp,
      };

  String toJson() => jsonEncode(toMap());

  factory VisualBridgeMessage.fromJson(String jsonStr) {
    final map = jsonDecode(jsonStr) as Map<String, dynamic>;
    return VisualBridgeMessage(
      type: map['type'] as String,
      payload: Map<String, dynamic>.from(map['payload'] as Map),
      timestamp: map['timestamp'] as int?,
    );
  }
}

/// Metadata model for a selected 3D anatomical/scientific component
class VisualComponentInfo {
  final String id;
  final String label;
  final String role;
  final String color;

  VisualComponentInfo({
    required this.id,
    required this.label,
    required this.role,
    required this.color,
  });

  factory VisualComponentInfo.fromMap(Map<String, dynamic> map) {
    return VisualComponentInfo(
      id: map['id']?.toString() ?? '',
      label: map['label']?.toString() ?? 'Component',
      role: map['role']?.toString() ?? '',
      color: map['color']?.toString() ?? '#38BDF8',
    );
  }
}

/// Performance telemetry emitted by the Three.js WebGL engine
class VisualPerformanceTelemetry {
  final int fps;
  final int drawCalls;
  final int triangles;
  final double memoryMB;
  final String qualityMode;

  VisualPerformanceTelemetry({
    required this.fps,
    required this.drawCalls,
    required this.triangles,
    required this.memoryMB,
    required this.qualityMode,
  });

  factory VisualPerformanceTelemetry.fromMap(Map<String, dynamic> map) {
    return VisualPerformanceTelemetry(
      fps: (map['fps'] as num?)?.toInt() ?? 60,
      drawCalls: (map['drawCalls'] as num?)?.toInt() ?? 0,
      triangles: (map['triangles'] as num?)?.toInt() ?? 0,
      memoryMB: (map['memoryMB'] as num?)?.toDouble() ?? 0.0,
      qualityMode: map['qualityMode']?.toString() ?? 'high',
    );
  }
}
