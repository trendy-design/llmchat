import type { WindowAPI } from '@repo/electron/types';

declare global {
  interface Window {
    electronAPI: Readonly<WindowAPI>;
  }
}