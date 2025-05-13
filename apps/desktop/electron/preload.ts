// electron/preload.ts
import { contextBridge, ipcRenderer } from 'electron';
import { WindowAPI } from '../shared/api';

const api: WindowAPI = {
    window: {
        show: () => ipcRenderer.send('window:show'),
        hide: () => ipcRenderer.send('window:hide'),
        showCommand: () => ipcRenderer.send('command:show'),
        hideCommand: () => ipcRenderer.send('command:hide'),
        minimise: () => ipcRenderer.send('window:minimise'),
        toggleMaximise: () => ipcRenderer.invoke('window:toggleMax'),
        onFocus: cb => {
            const listener = (_: unknown, state: boolean) => cb(state);
            ipcRenderer.on('window:focus', listener);
            return () => ipcRenderer.removeListener('window:focus', listener);
        },
    },
    version: '1.0.0',
};

// Freeze every level so malicious scripts cannot monkey‑patch it.
Object.freeze(api);
Object.freeze(api.window);

contextBridge.exposeInMainWorld('electronAPI', api);
