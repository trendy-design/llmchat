const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');
const url = require('url');
const { ipcMain } = require('electron');

const isDev = process.env.NODE_ENV === 'development';

const APP_URL = isDev
    ? 'http://localhost:3006'
    : url.format({
          pathname: path.join(__dirname, '../.next/server/app/index.html'),
          protocol: 'file:',
          slashes: true,
      });

let mainWindow;
let commandWindow;
function createCommandWindow() {
    console.log('path', path.join(app.getAppPath(), 'electron/preload.js'));
    commandWindow = new BrowserWindow({
        width: 600,
        height: 60,
        frame: false,
        // resizable: false,

        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(app.getAppPath(), 'electron/preload.js'),
        },
    });

    commandWindow.loadURL(APP_URL + '/command');

    commandWindow.on('closed', () => {
        commandWindow = null;
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        frame: false,
        // 👇  Hide the title‑bar chrome but keep the traffic lights
        titleBarStyle: 'hiddenInset', // or 'hidden' | 'customButtonsOnHover'
        //   — hidden      : traffic lights flush left
        //   — hiddenInset : traffic lights inset by 6 px
        //   — customButtonsOnHover : show only on hover (experimental)

        // Optional fine‑tuning:
        trafficLightPosition: { x: 12, y: 12 }, // absolute offset, px
        vibrancy: 'sidebar',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(app.getAppPath(), 'electron/preload.js'), // absolute!
        },
    });

    mainWindow.loadURL(APP_URL);

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', () => {
    createWindow();
    createCommandWindow();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
    if (mainWindow === null) createWindow();

    globalShortcut.register('CommandOrControl+K', () => {
        commandWindow.show();
    });
});

ipcMain.on('window:show', () => {
    if (commandWindow?.isVisible()) return; // idempotent
    commandWindow.show(); // ⬅️ displays and focuses
});

ipcMain.on('window:hide', () => {
    if (!commandWindow?.isVisible()) return;
    commandWindow.hide(); // ⬅️ keeps the process alive
    // Optional extras …
    // win.setSkipTaskbar(true);         // remove from task‑bar / dock
    // app.dock?.hide();                 // macOS dock icon
});

ipcMain.on('command:show', () => {
    if (commandWindow?.isVisible()) return;
    commandWindow.show();
});

ipcMain.on('command:hide', () => {
    if (!commandWindow?.isVisible()) return;
    commandWindow.hide();
});
