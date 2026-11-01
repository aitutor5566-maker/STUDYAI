class VisualLabelInfo {
  final String text;
  final double x;
  final double y;
  final String description;

  VisualLabelInfo({
    required this.text,
    required this.x,
    required this.y,
    required this.description,
  });

  factory VisualLabelInfo.fromJson(Map<String, dynamic> json) {
    return VisualLabelInfo(
      text: json['text'] ?? '',
      x: (json['x'] as num?)?.toDouble() ?? 0.0,
      y: (json['y'] as num?)?.toDouble() ?? 0.0,
      description: json['description'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'text': text,
        'x': x,
        'y': y,
        'description': description,
      };
}

class VisualAssetSpec {
  final String id;
  final String topic;
  final String visualType;
  final String dataUrl;
  final String caption;
  final List<VisualLabelInfo> labels;

  VisualAssetSpec({
    required this.id,
    required this.topic,
    required this.visualType,
    required this.dataUrl,
    required this.caption,
    this.labels = const [],
  });

  factory VisualAssetSpec.fromJson(Map<String, dynamic> json) {
    return VisualAssetSpec(
      id: json['id'] ?? '',
      topic: json['topic'] ?? '',
      visualType: json['visualType'] ?? json['visual_type'] ?? 'scientific_diagram',
      dataUrl: json['dataUrl'] ?? json['data_url'] ?? '',
      caption: json['caption'] ?? '',
      labels: (json['labels'] as List<dynamic>?)
              ?.map((l) => VisualLabelInfo.fromJson(l as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}
