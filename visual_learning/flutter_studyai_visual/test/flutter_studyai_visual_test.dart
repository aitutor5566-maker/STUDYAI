import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_studyai_visual/flutter_studyai_visual.dart';

void main() {
  group('VisualBridgeMessage & Protocol Serialization', () {
    test('serializes and deserializes VisualBridgeMessage correctly', () {
      final msg = VisualBridgeMessage(
        type: 'loadModel',
        payload: {'topic': 'Human Heart', 'quality': 'high'},
      );

      final jsonStr = msg.toJson();
      final decoded = VisualBridgeMessage.fromJson(jsonStr);

      expect(decoded.type, equals('loadModel'));
      expect(decoded.payload['topic'], equals('Human Heart'));
      expect(decoded.payload['quality'], equals('high'));
      expect(decoded.timestamp, isNotNull);
    });

    test('parses VisualComponentInfo from bridge map', () {
      final map = {
        'id': 'left_ventricle',
        'label': 'Left Ventricle',
        'role': 'Pumps oxygenated blood to systemic circulation',
        'color': '#ef4444'
      };

      final info = VisualComponentInfo.fromMap(map);
      expect(info.id, equals('left_ventricle'));
      expect(info.label, equals('Left Ventricle'));
      expect(info.role, contains('systemic circulation'));
      expect(info.color, equals('#ef4444'));
    });

    test('parses VisualPerformanceTelemetry correctly', () {
      final map = {
        'fps': 60,
        'drawCalls': 14,
        'triangles': 4800,
        'memoryMB': 18.5,
        'qualityMode': 'high'
      };

      final telemetry = VisualPerformanceTelemetry.fromMap(map);
      expect(telemetry.fps, equals(60));
      expect(telemetry.drawCalls, equals(14));
      expect(telemetry.triangles, equals(4800));
      expect(telemetry.memoryMB, equals(18.5));
      expect(telemetry.qualityMode, equals('high'));
    });
  });

  group('VisualActionType & VisualEventType Enums', () {
    test('contains all required actions and events', () {
      expect(VisualActionType.values, contains(VisualActionType.loadModel));
      expect(VisualActionType.values, contains(VisualActionType.selectComponent));
      expect(VisualActionType.values, contains(VisualActionType.setCameraZoom));
      expect(VisualActionType.values, contains(VisualActionType.resetCamera));
      expect(VisualActionType.values, contains(VisualActionType.toggleAnimation));
      expect(VisualActionType.values, contains(VisualActionType.setQualityMode));
      expect(VisualActionType.values, contains(VisualActionType.dispose));

      expect(VisualEventType.values, contains(VisualEventType.onModelLoaded));
      expect(VisualEventType.values, contains(VisualEventType.onComponentSelected));
      expect(VisualEventType.values, contains(VisualEventType.onRenderingError));
      expect(VisualEventType.values, contains(VisualEventType.onPerformanceReport));
      expect(VisualEventType.values, contains(VisualEventType.onLowMemoryWarning));
    });
  });
}
