import { existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const validator = process.env.CDSK_VALIDATOR
  ? path.resolve(process.env.CDSK_VALIDATOR)
  : path.resolve(repositoryRoot, "../cdsk/scripts/validate_project.py");

if (!existsSync(validator)) {
  console.error("CDSK validator bulunamadı. CDSK_VALIDATOR değişkenini validate_project.py yoluna ayarlayın.");
  process.exit(1);
}

const result = spawnSync(process.env.PYTHON ?? "python3", [validator, "."], {
  cwd: repositoryRoot,
  stdio: "inherit",
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
