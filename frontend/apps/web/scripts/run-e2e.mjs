import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const cwd = process.cwd();
const port = process.env.PORT || '3000';
const healthUrl = `http://127.0.0.1:${port}/robots.txt`;
const buildIdPath = join(cwd, '.next', 'BUILD_ID');

if (!existsSync(buildIdPath)) {
  console.error('Next build artifact is missing. Run pnpm build before pnpm e2e.');
  process.exit(1);
}

const serverEnv = {
  ...process.env,
  BACKEND_API_URL:
    process.env.BACKEND_API_URL || 'https://demonightlight.test9.io.vn/api/backend',
  NEXT_PUBLIC_API_URL:
    process.env.NEXT_PUBLIC_API_URL || 'https://demonightlight.test9.io.vn/api/backend',
};

const server = spawn(
  process.execPath,
  ['./node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', port],
  {
    cwd,
    env: serverEnv,
    stdio: ['ignore', 'inherit', 'inherit'],
    windowsHide: true,
  },
);

let shuttingDown = false;

async function waitForServer() {
  const startedAt = Date.now();

  while (Date.now() - startedAt < 60_000) {
    try {
      const response = await fetch(healthUrl);

      if (response.ok) {
        return;
      }
    } catch {
      await delay(500);
    }
  }

  throw new Error(`Timed out waiting for ${healthUrl}`);
}

function killServer() {
  if (shuttingDown || server.killed) {
    return;
  }

  shuttingDown = true;

  if (process.platform === 'win32' && server.pid) {
    spawn('taskkill', ['/pid', String(server.pid), '/T', '/F'], {
      stdio: 'ignore',
      windowsHide: true,
    });
    return;
  }

  server.kill('SIGTERM');
}

process.on('exit', killServer);
process.on('SIGINT', () => {
  killServer();
  process.exit(130);
});
process.on('SIGTERM', () => {
  killServer();
  process.exit(143);
});

try {
  await waitForServer();

  const testProcess = spawn(
    process.execPath,
    ['./node_modules/@playwright/test/cli.js', 'test'],
    {
      cwd,
      env: {
        ...process.env,
        PLAYWRIGHT_EXTERNAL_SERVER: '1',
        PLAYWRIGHT_HTML_OPEN: 'never',
      },
      stdio: 'inherit',
      windowsHide: true,
    },
  );

  const exitCode = await new Promise((resolve) => {
    testProcess.on('exit', (code) => resolve(code ?? 1));
  });

  killServer();
  process.exit(exitCode);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  killServer();
  process.exit(1);
}
