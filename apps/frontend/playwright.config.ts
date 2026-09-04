import { defineConfig, devices } from '@playwright/test';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendRoot = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(frontendRoot, '../..');
const databaseUrl = process.env.E2E_DATABASE_URL ?? '';
const jwtSecret = randomBytes(32).toString('hex');

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
    baseURL: 'http://localhost:3001',
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
        PORT: '4000',
      },
      url: 'http://localhost:4000',
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: 'npm run dev -- --host localhost --port 3001 --strictPort',
      cwd: frontendRoot,
      env: {
        VITE_API_BASE_URL: 'http://localhost:4000',
      },
      url: 'http://localhost:3001/login',
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
