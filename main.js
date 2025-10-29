const { app, session } = require('electron');
const { registerSessionGuards } = require("./app/permissions");
const { registerNotificationBridge } = require("./app/notifications");
const { ensureAutostart, shouldEnableAutostart } = require('./app/autostart');
const {
  createMainWindow,
  focusMainWindow,
  getMainWindow,
  setQuitting,
} = require("./app/windowManager");

// Enforce single instance (mutex) so only one app runs.
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  // Ensure immediate exit to avoid scheduling any work.
  try { process.exit(0); } catch {}
} else {
  app.on('second-instance', () => {
    const win = getMainWindow();
    if (win) {
      focusMainWindow();
      return;
    }
    createWindowWithTray();
  });
}


function createWindowWithTray() {
  return createMainWindow({
    startInTray: process.argv.includes("--start-in-tray"),
    onQuit: () => {
      setQuitting(true);
      app.quit();
    },
  });
}

async function bootstrap() {
  registerSessionGuards(session.defaultSession);
  registerNotificationBridge();

  createWindowWithTray();

  // Enable autostart only for production/non-debug runs (env-driven).
  if (shouldEnableAutostart(app)) {
    try { await ensureAutostart(app, true); } catch {}
  }

  app.on("activate", () => {
    const win = getMainWindow();
    if (!win) {
      createWindowWithTray();
      return;
    }
    focusMainWindow();
  });
}

app
  .whenReady()
  .then(bootstrap)
  .catch((err) => {
    console.error("Failed to initialize application", err);
    app.quit();
  });

app.on("before-quit", () => {
  setQuitting(true);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    // Keep running in the tray until the user chooses Quit.
  }
});
// Load environment variables from .env early.
require('./app/env').loadEnv();
