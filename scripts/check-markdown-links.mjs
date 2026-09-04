import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ignoredDirectories = new Set([".git", "coverage", "dist", "node_modules", "output"]);

function markdownFiles(directory) {
  return readdirSync(directory).flatMap((entry) => {
    if (ignoredDirectories.has(entry)) return [];
    const absolutePath = path.join(directory, entry);
    if (statSync(absolutePath).isDirectory()) return markdownFiles(absolutePath);
    return absolutePath.endsWith(".md") ? [absolutePath] : [];
  });
}

const brokenLinks = [];
const files = markdownFiles(repositoryRoot);
for (const file of files) {
  const contents = readFileSync(file, "utf8");
  for (const [, rawTarget] of contents.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    if (/^(?:https?:|mailto:|#|data:)/.test(rawTarget)) continue;
    let target = rawTarget.split("#", 1)[0];
    if (target.startsWith("<") && target.endsWith(">")) {
      target = target.slice(1, -1);
    }
    if (!target) continue;
    const resolved = path.resolve(path.dirname(file), decodeURIComponent(target));
    if (!existsSync(resolved)) {
      brokenLinks.push(`${path.relative(repositoryRoot, file)} -> ${rawTarget}`);
    }
  }
}

console.log(`[docs] ${files.length} Markdown files; ${brokenLinks.length} broken local links`);
if (brokenLinks.length > 0) {
  console.error(brokenLinks.join("\n"));
  process.exit(1);
}
