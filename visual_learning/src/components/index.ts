export interface VisualAnnotationMarker {
  id: string;
  worldPosition: [number, number, number];
  title: string;
  text: string;
  color?: string;
  expanded?: boolean;
}

export interface HotspotAction {
  targetPartId: string;
  zoomLevel: number;
  highlightColor: string;
  explanationMarkdown: string;
}
