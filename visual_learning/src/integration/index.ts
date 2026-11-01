export interface FlutterBridgeMessage<T = unknown> {
  source: 'studyai_flutter' | 'studyai_threejs';
  action: 'load_model' | 'explode_model' | 'highlight_part' | 'reset_camera' | 'model_loaded' | 'part_selected';
  payload: T;
  requestId?: string;
}

export class FlutterThreeBridge {
  private listener: ((msg: FlutterBridgeMessage) => void) | null = null;

  public init(callback: (msg: FlutterBridgeMessage) => void): void {
    this.listener = callback;
    if (typeof window !== 'undefined') {
      window.addEventListener('message', (event) => {
        if (event.data && event.data.source === 'studyai_flutter') {
          this.listener?.(event.data);
        }
      });
    }
  }

  public sendToFlutter(action: FlutterBridgeMessage['action'], payload: unknown): void {
    if (typeof window !== 'undefined') {
      const message: FlutterBridgeMessage = {
        source: 'studyai_threejs',
        action,
        payload,
      };
      // Send to parent window if inside iframe
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(message, '*');
      }
      // Also post to custom Flutter JavaScript channel if present
      const flutterChannel = (window as unknown as { flutterStudyAIChannel?: { postMessage: (msg: string) => void } }).flutterStudyAIChannel;
      if (flutterChannel && typeof flutterChannel.postMessage === 'function') {
        flutterChannel.postMessage(JSON.stringify(message));
      }
    }
  }
}
