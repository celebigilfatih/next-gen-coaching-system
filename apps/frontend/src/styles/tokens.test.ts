import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import { describe, expect, it } from 'vitest';

const read = (path: string) =>
  readFileSync(new URL(path, import.meta.url), 'utf8');
const tokens = read('./tokens.css');
const light = tokens.split('.dark {')[0];

describe('NGCS token compatibility', () => {
  it('keeps the legacy muted text separate from the shadcn surface', () => {
    expect(light).toContain('--legacy-muted-foreground: #617089;');
    expect(light).toContain('--muted: var(--soft);');
    expect(tokens).toContain('--color-muted: var(--muted);');
    for (const path of ['../styles.css', '../workspace.css']) {
      expect(read(path)).not.toContain('var(--muted)');
      expect(read(path)).toContain('var(--legacy-muted-foreground)');
    }
  });

  it('preserves light brand, surfaces and responsive base dimensions', () => {
    for (const declaration of [
      '--navy-950: #00182f;',
      '--blue: #0878ed;',
      '--amber: #ef8500;',
      '--input-surface: #fff;',
      '--warning-hover: #d97706;',
      '--overlay: var(--color-slate-950);',
      '--skeleton: var(--color-slate-200);',
      '--scrollbar: var(--color-slate-300);',
      '--layout-sidebar-width: 176px;',
      '--layout-topbar-height: 68px;',
      '--page-gutter: clamp(22px, 3vw, 52px);',
      '--dialog-max-width: 560px;',
      '--sheet-max-width: 390px;',
    ]) {
      expect(light).toContain(declaration);
    }
  });

  it('loads one token source after Tailwind and before legacy rules', () => {
    const css = read('../styles.css');
    expect(css.indexOf("@import './styles/tokens.css';")).toBeGreaterThan(
      css.indexOf("@import 'tailwindcss';"),
    );
    expect(css).not.toContain('@theme inline');
    expect(css).not.toContain('--primary:');
    expect(tokens).toContain('.dark {');
    expect(read('../root.tsx')).not.toMatch(/className=["']dark["']/);
  });
});
