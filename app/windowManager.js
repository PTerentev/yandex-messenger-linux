const { app, BrowserWindow, Menu } = require('electron');
const { START_URL, WINDOW_CONFIG, UA_CHROME_VERSION } = require('./config');
const { openExternalSafe, isYandexUrl } = require('./browser');
const { createApplicationMenu } = require('./menu');
const { createTray } = require('./tray');

let mainWindow = null;
let quitting = false;

function mutateUserAgent(win) {
  const ua = win.webContents.getUserAgent()
    .replace(/Electron\/[0-9.]+\s?/g, '')
    .replace(/Chrome\/[0-9.]+\s?/g, `${UA_CHROME_VERSION} `);
  win.webContents.setUserAgent(ua);
}

function focusWindow(win) {
  if (!win || win.isDestroyed()) return;
  if (!win.isVisible()) win.show();
  if (win.isMinimized()) win.restore();
  win.focus();
}

function createMainWindow({ startInTray = false, onQuit } = {}) {
  const win = new BrowserWindow({
    ...WINDOW_CONFIG,
    // Always create hidden first; show on 'ready-to-show' if not starting in tray.
    show: false
  });

  mutateUserAgent(win);

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isYandexUrl(url)) return { action: 'allow' };
    openExternalSafe(url);
    return { action: 'deny' };
  });

  // Only divert non-Yandex navigations to external browser; allow in-app Yandex flow.
  win.webContents.on('will-navigate', (event, targetUrl) => {
    if (!isYandexUrl(targetUrl)) {
      event.preventDefault();
      openExternalSafe(targetUrl);
    }
  });

  win.loadURL(START_URL).catch((err) => {
    console.error('Failed to load start URL', err);
  });

  // Show when ready unless starting hidden in tray
  win.once('ready-to-show', () => {
    if (!startInTray) win.show();
  });

  win.on('close', (event) => {
    if (!quitting) {
      event.preventDefault();
      win.hide();
    }
  });

  win.on('closed', () => {
    if (mainWindow === win) {
      mainWindow = null;
    }
  });

  const menu = createApplicationMenu(win);
  Menu.setApplicationMenu(menu);

  const handleQuit = typeof onQuit === 'function'
    ? onQuit
    : () => {
        setQuitting(true);
        app.quit();
      };

  createTray(win, handleQuit);

  mainWindow = win;
  return win;
}

function getMainWindow() {
  return mainWindow;
}

function focusMainWindow() {
  focusWindow(mainWindow);
}

function setQuitting(value) {
  quitting = Boolean(value);
}

function isQuitting() {
  return quitting;
}

module.exports = {
  createMainWindow,
  getMainWindow,
  focusMainWindow,
  focusWindow,
  setQuitting,
  isQuitting
};
