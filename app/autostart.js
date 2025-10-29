const fs = require('fs/promises');
const path = require('path');
const os = require('os');
const { APP_NAME } = require('./config');
const { ENVIRONMENTS, getEnvironment } = require('./env');

function getAutostartDir() {
  return path.join(os.homedir(), '.config', 'autostart');
}

function getDesktopFilePath() {
  // Use a constant filename to avoid duplicates across versions.
  return path.join(getAutostartDir(), 'yandex-messenger.terentev.desktop');
}

function resolveExecPath() {
  // Prefer the AppImage file path if present; process.execPath inside
  // an AppImage points to a temporary mount that won't exist on reboot.
  const appImage = process.env.APPIMAGE;
  if (appImage && appImage.trim().length > 0) {
    return appImage;
  }
  return process.execPath;
}

function buildDesktopContent(app, execPath) {
  const name = app.getName ? app.getName() : APP_NAME;
  const lines = [
    '[Desktop Entry]',
    'Type=Application',
    'Version=1.0',
    `Name=${name}`,
    'Comment=Start on login',
    `Exec="${execPath}" --start-in-tray`,
    'Icon=yandex-messenger',
    'Terminal=false',
    'X-GNOME-Autostart-enabled=true',
    'Categories=Network;'
  ];
  return lines.join('\n');
}

async function isAutostartEnabled(app) {
  try {
    await fs.access(getDesktopFilePath(app));
    return true;
  } catch {
    return false;
  }
}

async function ensureAutostart(app) {
  const autostartDir = getAutostartDir();
  const desktopPath = getDesktopFilePath(app);

  await fs.mkdir(autostartDir, { recursive: true });

  const desired = buildDesktopContent(app, resolveExecPath());
  let current = null;
  try { current = await fs.readFile(desktopPath, 'utf8'); } catch {}
  if (current !== desired) {
    await fs.writeFile(desktopPath, desired, { encoding: 'utf8' });
  }
  
  return true;
}

function shouldEnableAutostart() {
  // Enable autostart only for production environment.
  return getEnvironment() === ENVIRONMENTS.PRODUCTION;
}

module.exports = {
  ensureAutostart,
  isAutostartEnabled,
  getDesktopFilePath,
  shouldEnableAutostart,
};
