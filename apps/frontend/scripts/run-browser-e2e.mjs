import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const frontendRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const backendRoot = path.resolve(frontendRoot, '../backend');
const databaseUrl = process.env.E2E_DATABASE_URL;

if (!databaseUrl || process.env.E2E_ALLOW_DESTRUCTIVE_RESET !== 'true') {
  throw new Error(
    'Browser E2E requires E2E_DATABASE_URL and E2E_ALLOW_DESTRUCTIVE_RESET=true',
  );
}

const parsedDatabaseUrl = new URL(databaseUrl);
const databaseName = parsedDatabaseUrl.pathname.replace(/^\//, '');
if (
  !['postgres:', 'postgresql:'].includes(parsedDatabaseUrl.protocol) ||
  !/(e2e|test)/i.test(databaseName)
) {
  throw new Error(
    'E2E_DATABASE_URL must target a PostgreSQL database whose name contains e2e or test',
  );
}

if (!process.env.E2E_COACH_PASSWORD) {
  throw new Error('E2E_COACH_PASSWORD is required');
}

const sharedEnv = {
  ...process.env,
  DATABASE_URL: databaseUrl,
};

function run(command, args, cwd, env = sharedEnv) {
  const result = spawnSync(command, args, {
    cwd,
    env,
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run('npm', ['run', 'prisma:migrate:deploy'], backendRoot);
run('node', ['scripts/seed-browser-e2e.js'], backendRoot);
run(
  path.join(frontendRoot, 'node_modules/.bin/playwright'),
  ['test', '--config=playwright.config.ts'],
  frontendRoot,
);
