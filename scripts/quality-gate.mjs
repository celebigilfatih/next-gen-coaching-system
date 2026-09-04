import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const steps = [
  ["Repository script format", "npm", ["run", "format:repo"]],
  ["Backend typecheck", "npm", ["--prefix", "apps/backend", "run", "typecheck"]],
  ["Backend lint", "npm", ["--prefix", "apps/backend", "run", "lint"]],
  ["Backend format", "npm", ["--prefix", "apps/backend", "run", "format:check"]],
  ["Backend unit tests", "npm", ["--prefix", "apps/backend", "test", "--", "--runInBand"]],
  ["Backend build", "npm", ["--prefix", "apps/backend", "run", "build:check"]],
  ["Frontend typecheck", "npm", ["--prefix", "apps/frontend", "run", "typecheck"]],
  ["Frontend lint", "npm", ["--prefix", "apps/frontend", "run", "lint"]],
  ["Frontend format", "npm", ["--prefix", "apps/frontend", "run", "format:check"]],
  ["Frontend unit tests", "npm", ["--prefix", "apps/frontend", "test", "--", "--run"]],
  ["Frontend build", "npm", ["--prefix", "apps/frontend", "run", "build"]],
  ["Frontend Sites tests", "npm", ["--prefix", "apps/frontend", "run", "test:sites"]],
  ["Markdown links", "node", ["scripts/check-markdown-links.mjs"]],
  ["CDSK", "node", ["scripts/validate-cdsk.mjs"]],
  ["Git whitespace", "git", ["diff", "--check"]],
];

for (const [label, command, args] of steps) {
  console.log(`\n[quality] ${label}`);
  const result = spawnSync(command, args, {
    cwd: repositoryRoot,
    env: process.env,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    console.error(`[quality] FAILED: ${label}`);
    process.exit(result.status ?? 1);
  }
}

console.log("\n[quality] All non-destructive repository gates passed.");
