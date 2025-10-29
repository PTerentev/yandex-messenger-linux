const { spawn } = require('child_process');
const { DEFAULT_BROWSER } = require('./config');

function resolveBrowserBinary() {
  return process.env.YAM_BROWSER || DEFAULT_BROWSER;
}

function openExternalSafe(rawUrl) {
  let target = rawUrl;
  try {
    target = new URL(rawUrl).toString();
  } catch {
    // ignore parsing issues and use the raw string
  }

  const browser = resolveBrowserBinary();
  const tabFlag = /chrome|chromium|brave|edge/i.test(browser) ? '--new-tab' : '-new-tab';

  try {
    const child = spawn(browser, [tabFlag, target], { stdio: 'ignore', detached: true });
    child.unref();
  } catch (err) {
    console.error('Failed to open external URL', target, err);
  }
}

function isYandexUrl(rawUrl) {
  try {
    const { hostname } = new URL(rawUrl);
    return (
      hostname === 'yandex.ru' ||
      hostname === 'yandex.com' ||
      hostname.endsWith('.yandex.ru') ||
      hostname.endsWith('.yandex.com')
    );
  } catch {
    return false;
  }
}

module.exports = {
  resolveBrowserBinary,
  openExternalSafe,
  isYandexUrl
};
