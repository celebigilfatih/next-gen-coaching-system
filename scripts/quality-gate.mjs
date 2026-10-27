import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { npmInvocation, toolingEnvironment } from "./tool-runtime.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const steps = [
  ["Quality tooling tests", "node", ["--test", "scripts/quality-tools.test.mjs"]],
  ["Repository script format", "npm", ["run", "format:repo"]],
  ["Backend Prisma client", "node", ["scripts/generate-quality-client.mjs"]],
  ["Drill diagram content tests", "node", ["--test", "scripts/drill-diagrams.test.mjs"]],
  ["Backend typecheck", "npm", ["--prefix", "apps/backend", "run", "typecheck:quality"]],
  ["Backend lint", "npm", ["--prefix", "apps/backend", "run", "lint"]],
  ["Backend format", "npm", ["--prefix", "apps/backend", "run", "format:check"]],
  ["Backend unit tests", "npm", ["--prefix", "apps/backend", "test", "--", "--runInBand"]],
  ["Backend build", "npm", ["--prefix", "apps/backend", "run", "build:quality"]],
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

export function runSteps(selectedSteps, { root = repositoryRoot, keepGoing = false, log = console } = {}) {
  const failures = [];
  for (const [label, command, args] of selectedSteps) {
    log.log(`\n[quality] ${label}`);
    try {
      const [executable, arguments_] =
        command === "npm" ? npmInvocation(args, root) : [command === "node" ? process.execPath : command, args];
      const result = spawnSync(executable, arguments_, {
        cwd: root,
        env: toolingEnvironment(root),
        stdio: "inherit",
        windowsHide: true,
      });
      if (result.error) throw result.error;
      if (result.status !== 0) throw new Error(`exit=${result.status ?? "signal"} ${result.signal ?? ""}`);
      log.log(`[quality] PASS: ${label}`);
    } catch (error) {
      failures.push(label);
      log.error(`[quality] FAILED: ${label}: ${error.message}`);
      if (!keepGoing) break;
    }
  }
  log.log(
    `\n[quality] ${failures.length ? `FAILED: ${failures.join(", ")}` : "All non-destructive repository gates passed."}`
  );
  return failures.length ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = runSteps(steps, { keepGoing: process.argv.includes("--continue-on-error") });
}
