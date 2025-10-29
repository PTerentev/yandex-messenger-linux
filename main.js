const { app, session } = require('electron');
const { registerSessionGuards } = require('./app/permissions');
const { registerNotificationBridge } = require('./app/notifications');
const {
  createMainWindow,
  focusMainWindow,
  getMainWindow,
  setQuitting
} = require('./app/windowManager');

function createWindowWithTray() {
  return createMainWindow({
    startInTray: process.argv.includes('--start-in-tray'),
    onQuit: () => {
      setQuitting(true);
      app.quit();
    }
  });
}

async function bootstrap() {
  registerSessionGuards(session.defaultSession);
  registerNotificationBridge();

  createWindowWithTray();

  app.on('activate', () => {
    const win = getMainWindow();
    if (!win) {
      createWindowWithTray();
      return;
    }
    focusMainWindow();
  });
}

app.whenReady()
  .then(bootstrap)
  .catch((err) => {
    console.error('Failed to initialize application', err);
    app.quit();
  });

app.on('before-quit', () => {
  setQuitting(true);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Keep running in the tray until the user chooses Quit.
  }
});
