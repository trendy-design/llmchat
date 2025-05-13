"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// electron/preload.ts
const electron_1 = require("electron");
const api = {
    window: {
        show: () => electron_1.ipcRenderer.send('window:show'),
        hide: () => electron_1.ipcRenderer.send('window:hide'),
        showCommand: () => electron_1.ipcRenderer.send('command:show'),
        hideCommand: () => electron_1.ipcRenderer.send('command:hide'),
        minimise: () => electron_1.ipcRenderer.send('window:minimise'),
        toggleMaximise: () => electron_1.ipcRenderer.invoke('window:toggleMax'),
        onFocus: cb => {
            const listener = (_, state) => cb(state);
            electron_1.ipcRenderer.on('window:focus', listener);
            return () => electron_1.ipcRenderer.removeListener('window:focus', listener);
        },
    },
    version: '1.0.0',
};
// Freeze every level so malicious scripts cannot monkey‑patch it.
Object.freeze(api);
Object.freeze(api.window);
electron_1.contextBridge.exposeInMainWorld('electronAPI', api);
