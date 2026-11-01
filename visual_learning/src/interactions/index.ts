export interface InteractionEvent {
  type: 'hover' | 'click' | 'double_click' | 'drag';
  partId?: string;
  normalizedCoords: [number, number];
  timestamp: number;
}

export interface InteractionHandler {
  onSelectPart(partId: string): void;
  onHoverPart(partId: string | null): void;
  onResetView(): void;
}
