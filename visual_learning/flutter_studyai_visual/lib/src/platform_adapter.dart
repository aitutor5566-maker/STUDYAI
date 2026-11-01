import 'dart:async';
import 'package:flutter/foundation.dart';
import 'bridge_protocol.dart';

/// Abstract adapter interface defining platform-specific rendering
/// for Flutter Web, Android, and iOS.
abstract class StudyAiPlatformVisualAdapter {
  Future<void> initialize({
    required String topic,
    required String modelType,
    required Function(VisualComponentInfo?) onComponentSelected,
    required Function(VisualPerformanceTelemetry) onPerformanceUpdate,
    required Function(String error) onError,
  });

  void sendAction(VisualActionType action, [Map<String, dynamic>? params]);

  void dispose();
}

/// Web implementation: Interacts with Three.js canvas in the browser DOM
class StudyAiWebVisualAdapter implements StudyAiPlatformVisualAdapter {
  late Function(VisualComponentInfo?) _onComponentSelected;
  late Function(VisualPerformanceTelemetry) _onPerformanceUpdate;
  late Function(String) _onError;
  bool _initialized = false;

  @override
  Future<void> initialize({
    required String topic,
    required String modelType,
    required Function(VisualComponentInfo?) onComponentSelected,
    required Function(VisualPerformanceTelemetry) onPerformanceUpdate,
    required Function(String error) onError,
  }) async {
    _onComponentSelected = onComponentSelected;
    _onPerformanceUpdate = onPerformanceUpdate;
    _onError = onError;
    _initialized = true;

    // Web channel initialization
    if (kIsWeb) {
      // Sends initial load action to the window/iframe bridge
      sendAction(VisualActionType.loadModel, {
        'topic': topic,
        'modelType': modelType,
      });
    }
  }

  @override
  void sendAction(VisualActionType action, [Map<String, dynamic>? params]) {
    if (!_initialized) return;
    final msg = VisualBridgeMessage(
      type: action.name,
      payload: params ?? {},
    );
    // In production web, this posts to window or the registered JavaScript controller
    debugPrint('[StudyAiWebVisualAdapter] Action dispatched: ${msg.toJson()}');
  }

  void handleIncomingMessage(String rawJson) {
    try {
      final msg = VisualBridgeMessage.fromJson(rawJson);
      if (msg.type == VisualEventType.onComponentSelected.name) {
        final part = msg.payload.isNotEmpty
            ? VisualComponentInfo.fromMap(msg.payload)
            : null;
        _onComponentSelected(part);
      } else if (msg.type == VisualEventType.onPerformanceReport.name) {
        _onPerformanceUpdate(VisualPerformanceTelemetry.fromMap(msg.payload));
      } else if (msg.type == VisualEventType.onRenderingError.name) {
        _onError(msg.payload['message']?.toString() ?? 'Rendering error');
      }
    } catch (e) {
      _onError('Failed to parse bridge message: $e');
    }
  }

  @override
  void dispose() {
    sendAction(VisualActionType.dispose);
    _initialized = false;
  }
}

/// Native implementation for Android and iOS via WebView / JavaScriptChannel
class StudyAiNativeVisualAdapter implements StudyAiPlatformVisualAdapter {
  late Function(VisualComponentInfo?) _onComponentSelected;
  late Function(VisualPerformanceTelemetry) _onPerformanceUpdate;
  late Function(String) _onError;
  bool _initialized = false;

  @override
  Future<void> initialize({
    required String topic,
    required String modelType,
    required Function(VisualComponentInfo?) onComponentSelected,
    required Function(VisualPerformanceTelemetry) onPerformanceUpdate,
    required Function(String error) onError,
  }) async {
    _onComponentSelected = onComponentSelected;
    _onPerformanceUpdate = onPerformanceUpdate;
    _onError = onError;
    _initialized = true;

    sendAction(VisualActionType.loadModel, {
      'topic': topic,
      'modelType': modelType,
    });
  }

  @override
  void sendAction(VisualActionType action, [Map<String, dynamic>? params]) {
    if (!_initialized) return;
    final msg = VisualBridgeMessage(
      type: action.name,
      payload: params ?? {},
    );
    // Evaluates in WebViewController: window.StudyAiVisualBridge.receiveFromFlutter(msg.toJson())
    debugPrint('[StudyAiNativeVisualAdapter] Dispatched to WebView: ${msg.toJson()}');
  }

  void onJavaScriptChannelMessage(String messageText) {
    try {
      final msg = VisualBridgeMessage.fromJson(messageText);
      if (msg.type == VisualEventType.onComponentSelected.name) {
        final part = msg.payload.isNotEmpty
            ? VisualComponentInfo.fromMap(msg.payload)
            : null;
        _onComponentSelected(part);
      } else if (msg.type == VisualEventType.onPerformanceReport.name) {
        _onPerformanceUpdate(VisualPerformanceTelemetry.fromMap(msg.payload));
      } else if (msg.type == VisualEventType.onRenderingError.name) {
        _onError(msg.payload['message']?.toString() ?? 'Rendering error');
      }
    } catch (e) {
      _onError('Invalid bridge payload: $e');
    }
  }

  @override
  void dispose() {
    sendAction(VisualActionType.dispose);
    _initialized = false;
  }
}
