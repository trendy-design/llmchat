import type { WindowAPI } from '../../shared/api';

declare global {
  interface Window {
    electronAPI: Readonly<WindowAPI>;
  }
}