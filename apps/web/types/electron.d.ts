
export interface WindowAPI {
  window: {
    show(): void;
    hide(): void;
    showCommand(): void;
    hideCommand(): void;
    minimise(): void;
    toggleMaximise(): Promise<boolean>;   // returns new state
    onFocus(cb: (focused: boolean) => void): () => void; // unsubscribe fn
  };
  version: '1.0.0';
}

declare global {
  interface Window {
    electronAPI: WindowAPI;
  }
}