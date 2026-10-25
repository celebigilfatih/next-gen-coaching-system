import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync, unlinkSync, rmdirSync } from "node:fs";
import { runSteps } from "./quality-gate.mjs";
import { npmInvocation, pythonInvocation, toolingEnvironment } from "./tool-runtime.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const quiet = { log() {}, error() {} };

test("local npm executes without a global npm command and preserves literal arguments", () => {
  const [executable, args] = npmInvocation(["--version"], root, {});
  assert.equal(executable, process.execPath);
  const result = spawnSync(executable, args, { cwd: root, encoding: "utf8", windowsHide: true });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), "12.2.0");
  assert.equal(
    runSteps(
      [
        [
          "literal argv",
          "node",
          ["-e", "require('node:assert/strict').equal(process.argv[1], 'space & value')", "space & value"],
        ],
      ],
      { root, log: quiet }
    ),
    0
  );
});

test("failed stage is nonzero and fail-fast stops before the next stage", () => {
  const messages = [];
  const log = { log: (value) => messages.push(value), error: (value) => messages.push(value) };
  assert.equal(
    runSteps(
      [
        ["bad", "node", ["-e", "process.exit(7)"]],
        ["later", "node", ["-e", ""]],
      ],
      { log }
    ),
    1
  );
  assert.equal(
    messages.some((value) => value === "\n[quality] later"),
    false
  );
});

test("continue-on-error attempts subsequent checks but still fails on missing executables", () => {
  const messages = [];
  const log = { log: (value) => messages.push(value), error: (value) => messages.push(value) };
  assert.equal(
    runSteps(
      [
        ["missing", "ngcs-nonexistent-test-tool", []],
        ["later", "node", ["-e", ""]],
      ],
      { keepGoing: true, log }
    ),
    1
  );
  assert.ok(messages.includes("[quality] PASS: later"));
});

test("tool PATH retains system entries and explicit Python is passed without shell parsing", () => {
  const env = toolingEnvironment(root, { PATH: "original" });
  assert.ok(env.PATH.endsWith(`${path.delimiter}original`));
  assert.deepEqual(pythonInvocation({ PYTHON: "C:/Python With Spaces/python.exe" }), [
    "C:/Python With Spaces/python.exe",
    [],
  ]);
});

test("CDSK fails closed when the configured validator is missing", () => {
  const result = spawnSync(process.execPath, ["scripts/validate-cdsk.mjs"], {
    cwd: root,
    env: { ...process.env, CDSK_VALIDATOR: path.join(root, "missing-validator-for-test.py") },
    encoding: "utf8",
    windowsHide: true,
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /CDSK validator bulunamadı/);
});

test("bundled CDSK CLI contract rejects broken disposable projects", () => {
  const [python, prefix] = pythonInvocation();
  const result = spawnSync(python, [...prefix, "-B", "scripts/cdsk/test_validate_project.py"], {
    cwd: root,
    encoding: "utf8",
    windowsHide: true,
  });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stderr, /Ran 17 tests/);
});

test("CDSK wrapper uses the repository validator without an external checkout", () => {
  const environment = { ...process.env };
  delete environment.CDSK_VALIDATOR;
  const result = spawnSync(process.execPath, ["scripts/validate-cdsk.mjs"], {
    cwd: root,
    env: environment,
    encoding: "utf8",
    windowsHide: true,
  });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /CDSK 0\.1\.0 project profile r1/);
});

test("validator paths with spaces run under real Python and preserve its failure status", () => {
  const cache = path.join(root, "node_modules/.cache");
  mkdirSync(cache, { recursive: true });
  const directory = mkdtempSync(path.join(cache, "quality validator fixture "));
  const fixture = path.join(directory, "validator fixture.py");
  writeFileSync(fixture, 'import sys\nprint("test fixture only")\nsys.exit(7)\n');
  try {
    const [python] = pythonInvocation();
    const result = spawnSync(process.execPath, ["scripts/validate-cdsk.mjs"], {
      cwd: root,
      env: { ...process.env, CDSK_VALIDATOR: fixture, PYTHON: python },
      encoding: "utf8",
      windowsHide: true,
    });
    assert.equal(result.status, 7, result.stderr);
    assert.match(result.stdout, /test fixture only/);
  } finally {
    unlinkSync(fixture);
    rmdirSync(directory);
  }
});
