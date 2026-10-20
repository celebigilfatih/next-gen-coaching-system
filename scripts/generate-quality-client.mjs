import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const backend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../apps/backend");
const directory = path.join(backend, "node_modules/.cache/ngcs-quality-prisma");
const source = readFileSync(path.join(backend, "prisma/schema.prisma"), "utf8");
if (!/generator client\s*\{/.test(source)) throw new Error("Prisma client generator is missing");
if (/generator client\s*\{[^}]*\boutput\s*=/.test(source)) {
  throw new Error("Custom Prisma output requires an explicit quality generator configuration");
}
mkdirSync(directory, { recursive: true });
writeFileSync(
  path.join(directory, "schema.prisma"),
  source.replace(/generator client\s*\{/, 'generator client {\n  output = "./client"')
);
const result = spawnSync(
  process.execPath,
  [
    path.join(backend, "node_modules/prisma/build/index.js"),
    "generate",
    "--schema",
    path.join(directory, "schema.prisma"),
  ],
  { cwd: backend, env: process.env, stdio: "inherit", windowsHide: true }
);
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
