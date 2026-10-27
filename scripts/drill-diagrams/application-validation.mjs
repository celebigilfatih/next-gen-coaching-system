import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Exercise the shipped validators/renderers, without creating a second drawing implementation.
const root = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const frontendRequire = createRequire(resolve(root, "apps/frontend/package.json"));
const backendRequire = createRequire(resolve(root, "apps/backend/package.json"));
backendRequire("ts-node").register({
  transpileOnly: true,
  skipProject: true,
  moduleTypes: { "**": "cjs" },
  compilerOptions: { module: "CommonJS", moduleResolution: "Node", target: "ES2022", esModuleInterop: true },
});
export const { parseDrillContentBody } = backendRequire(resolve(root, "apps/backend/src/drills/drill-content.dto.ts"));
export const { boardSvg } = frontendRequire(resolve(root, "apps/frontend/src/lib/tactical-board-svg.ts"));
