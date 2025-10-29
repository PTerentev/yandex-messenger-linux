import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';

interface AfterPackContextLite {
  electronPlatformName: string;
  appOutDir: string;
  packager: {
    executableName?: string;
    appInfo?: { productFilename?: string };
  };
}

async function afterPack(context: AfterPackContextLite): Promise<void> {
  if (context.electronPlatformName !== 'linux') return;

  const sandboxPath = path.join(context.appOutDir, 'chrome-sandbox');
  try {
    await fs.unlink(sandboxPath);
    console.log('[afterPack] Removed chrome-sandbox from', sandboxPath);
  } catch (err) {
    const error = err as NodeJS.ErrnoException | undefined;
    if (!error || error.code !== 'ENOENT') {
      throw err;
    }
  }

  const exeName =
    context.packager.executableName ||
    context.packager.appInfo?.productFilename ||
    'yandex-messenger';
  const exePath = path.join(context.appOutDir, exeName);
  const binPath = path.join(context.appOutDir, `${exeName}-bin`);

  try {
    if (fsSync.existsSync(binPath)) return;

    await fs.rename(exePath, binPath);
    const wrapper =
      '#!/usr/bin/env bash\n' +
      'set -euo pipefail\n' +
      'export ELECTRON_DISABLE_SANDBOX=1\n' +
      'export ENVIRONMENT=production\n' +
      `exec "$(dirname "$0")/${exeName}-bin" --no-sandbox --disable-setuid-sandbox --disable-gpu-sandbox "$@"\n`;
    await fs.writeFile(exePath, wrapper, { mode: 0o755 });
    console.log('[afterPack] Wrapped executable with no-sandbox launcher');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[afterPack] Failed to wrap executable:', message);
  }
}

export = afterPack;
