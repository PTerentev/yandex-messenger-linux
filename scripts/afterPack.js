// Linux packaging tweaks:
// - Remove chrome-sandbox so Chromium doesn't try to use SUID sandbox in AppImage.
// - Wrap the executable to always set ELECTRON_DISABLE_SANDBOX and pass flags.
const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');

module.exports = async function afterPack(context) {
  if (context.electronPlatformName !== 'linux') return;

  // 1) Remove setuid helper if present
  const sandboxPath = path.join(context.appOutDir, 'chrome-sandbox');
  try {
    await fs.unlink(sandboxPath);
    console.log('[afterPack] Removed chrome-sandbox from', sandboxPath);
  } catch (err) {
    if (!err || err.code !== 'ENOENT') throw err;
  }

  // 2) Ensure all launches run with no-sandbox flags via a small wrapper
  const exeName = context.packager.executableName; // e.g. yandex-messenger
  const exePath = path.join(context.appOutDir, exeName);
  const binPath = path.join(context.appOutDir, `${exeName}-bin`);

  try {
    // If we've already wrapped, do nothing
    if (fsSync.existsSync(binPath)) return;

    await fs.rename(exePath, binPath);
    const wrapper = `#!/usr/bin/env bash\n` +
      `set -euo pipefail\n` +
      `export ELECTRON_DISABLE_SANDBOX=1\n` +
      `exec "$(dirname "$0")/${exeName}-bin" --no-sandbox --disable-setuid-sandbox --disable-gpu-sandbox "$@"\n`;
    await fs.writeFile(exePath, wrapper, { mode: 0o755 });
    console.log('[afterPack] Wrapped executable with no-sandbox launcher');
  } catch (err) {
    console.warn('[afterPack] Failed to wrap executable:', err && err.message);
  }
};
