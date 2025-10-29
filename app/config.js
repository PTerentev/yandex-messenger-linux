const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

const START_URL = 'https://messenger.360.yandex.ru';
const APP_NAME = 'Yandex Messenger';
const DEFAULT_BROWSER = 'firefox';
const UA_CHROME_VERSION = 'Chrome/141.0.7390.124';

const ICON_PATH = path.join(ROOT_DIR, 'icons', 'icon.png');
const PRELOAD_PATH = path.join(ROOT_DIR, 'preload.js');

const ALLOWED_PERMISSIONS = Object.freeze(new Set([
  'notifications',
  'media',
  'camera',
  'microphone',
  'display-capture',
  'clipboard-read',
  'clipboard-sanitized-write'
]));

const METRIKA_FILTER = Object.freeze({
  urls: [
    'https://mc.yandex.ru/*',
    'https://mc.yandex.com/*',
    'https://metrika.yandex.ru/*',
    'https://metrika.yandex.com/*'
  ]
});

const WINDOW_CONFIG = Object.freeze({
  width: 1200,
  height: 800,
  minWidth: 900,
  minHeight: 600,
  autoHideMenuBar: true,
  show: true,
  title: APP_NAME,
  icon: ICON_PATH,
  webPreferences: {
    preload: PRELOAD_PATH,
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true
  }
});

module.exports = {
  START_URL,
  APP_NAME,
  DEFAULT_BROWSER,
  UA_CHROME_VERSION,
  ICON_PATH,
  WINDOW_CONFIG,
  ALLOWED_PERMISSIONS,
  METRIKA_FILTER
};
