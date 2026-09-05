import { defineConfig, devices } from '@playwright/test';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendRoot = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(frontendRoot, '../..');
const databaseUrl = process.env.E2E_DATABASE_URL ?? '';
const jwtSecret = randomBytes(32).toString('hex');
const frontendPort = process.env.E2E_FRONTEND_PORT ?? '3001';
const backendPort = process.env.E2E_BACKEND_PORT ?? '4000';
const frontendBaseUrl = `http://localhost:${frontendPort}`;
const backendBaseUrl = `http://localhost:${backendPort}`;

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: path.join(
    repositoryRoot,
    'output/playwright/ngcs-coach-flow/results',
  ),
  reporter: [
    ['list'],
    [
      'html',
      {
        outputFolder: path.join(
          repositoryRoot,
          'output/playwright/ngcs-coach-flow/report',
        ),
        open: 'never',
      },
    ],
  ],
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 8_000 },
  use: {
    baseURL: frontendBaseUrl,
    ...devices['Desktop Chrome'],
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'npm run start',
      cwd: '../backend',
      env: {
        DATABASE_URL: databaseUrl,
        JWT_SECRET: jwtSecret,
        NODE_ENV: 'test',
        PORT: backendPort,
        PERSISTENT_SESSIONS_ENABLED:
          process.env.E2E_PERSISTENT_SESSIONS ?? 'false',
        FRONTEND_ORIGIN: frontendBaseUrl,
      },
      url: backendBaseUrl,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: `npm run dev -- --host localhost --port ${frontendPort} --strictPort`,
      cwd: frontendRoot,
      env: {
        VITE_API_BASE_URL: backendBaseUrl,
        VITE_PERSISTENT_SESSIONS_ENABLED:
          process.env.E2E_PERSISTENT_SESSIONS ?? 'false',
      },
      url: `${frontendBaseUrl}/login`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
