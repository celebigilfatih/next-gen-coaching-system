import { existsSync } from "node:fs";
import path from "node:path";

export function npmInvocation(args, root, environment = process.env) {
  const candidates = [
    path.join(root, "node_modules/npm/bin/npm-cli.js"),
    environment.npm_execpath?.endsWith("npm-cli.js") ? environment.npm_execpath : undefined,
    path.resolve(path.dirname(process.execPath), "node_modules/npm/bin/npm-cli.js"),
    path.resolve(path.dirname(process.execPath), "../lib/node_modules/npm/bin/npm-cli.js"),
  ];
  const cli = candidates.find((candidate) => candidate && existsSync(candidate));
  if (!cli) {
    throw new Error("npm CLI bulunamadı. Lockfile bağımlılıklarını kurun; bootstrap için runbook'a bakın.");
  }
  return [process.execPath, [cli, ...args]];
}

export function toolingEnvironment(root, environment = process.env) {
  const result = { ...environment };
  const pathKey = Object.keys(result).find((key) => key.toLowerCase() === "path") ?? "PATH";
  result[pathKey] = [path.dirname(process.execPath), path.join(root, "node_modules/.bin"), result[pathKey]]
    .filter(Boolean)
    .join(path.delimiter);
  return result;
}

export function pythonInvocation(environment = process.env) {
  if (environment.PYTHON) return [environment.PYTHON, []];
  // The Codex bundled Node/Python runtimes are siblings; no user-specific path.
  const bundled = path.resolve(path.dirname(process.execPath), "../../python/python.exe");
  if (process.platform === "win32" && existsSync(bundled)) return [bundled, []];
  return process.platform === "win32" ? ["py", ["-3"]] : ["python3", []];
}
