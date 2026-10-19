import { describe, it, expect } from 'vitest';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  createTacticalPlayback,
  validateTacticalDocument,
  type TacticalBoardDocumentV2,
  type TacticalBoardDocumentV1,
} from './tactical-document-core';

type Change = { path: (string | number)[]; value?: unknown; remove?: boolean };
const fixtures = JSON.parse(
  readFileSync(
    resolve(process.cwd(), '../../content/tactical-contract/fixtures.json'),
    'utf8',
  ),
) as {
  v1: TacticalBoardDocumentV1;
  v2: TacticalBoardDocumentV2;
  invalid: { name: string; changes: Change[] }[];
};
const sample = () => structuredClone(fixtures.v2);
function changed(changes: Change[]) {
  const doc = sample();
  for (const change of changes) {
    let node = doc as unknown as Record<string | number, unknown>;
    for (const key of change.path.slice(0, -1))
      node = node[key] as Record<string | number, unknown>;
    const key = change.path[change.path.length - 1];
    if (change.remove) delete node[key];
    else node[key] = change.value;
  }
  return doc;
}
const byteLength = (value: unknown) =>
  new TextEncoder().encode(JSON.stringify(value)).byteLength;
const elementAt = (
  frame: ReturnType<ReturnType<typeof createTacticalPlayback>['frameAt']>,
  id: string,
) => frame.board.elements.find((e) => e.id === id)!;
function repeatScenes(n: number, elements = 1) {
  const doc = sample();
  doc.scenes = Array.from({ length: n }, (_, i) => ({
    ...structuredClone(doc.scenes[1]),
    id: 's' + i,
    board: {
      ...structuredClone(fixtures.v1),
      elements: Array.from({ length: elements }, (_, j) => ({
        id: 'p' + j,
        type: 'ball' as const,
        x: 10,
        y: 10,
      })),
    },
  }));
  return doc;
}

describe('versioned tactical contract fixtures', () => {
  it('accepts V1 unchanged and V2 without mutation or conversion', () => {
    expect(validateTacticalDocument(fixtures.v1)).toEqual(fixtures.v1);
    const doc = sample();
    const before = JSON.stringify(doc);
    expect(validateTacticalDocument(doc)).toEqual(doc);
    expect(JSON.stringify(doc)).toBe(before);
  });
  it.each(fixtures.invalid)('rejects $name', ({ changes }) => {
    expect(() => validateTacticalDocument(changed(changes))).toThrow();
  });
  it.each([null, [], 42, 'text', undefined])(
    'rejects non-document %s',
    (value) => {
      expect(() => validateTacticalDocument(value)).toThrow();
    },
  );
  it.each([NaN, Infinity, -Infinity])(
    'rejects nonfinite numbers %s',
    (number) => {
      const doc = sample();
      doc.scenes[0].holdMs = number;
      expect(() => validateTacticalDocument(doc)).toThrow();
      const board = sample();
      board.scenes[0].board.elements[0].x = number;
      expect(() => validateTacticalDocument(board)).toThrow();
    },
  );
  it('rejects cyclic input without returning partial data', () => {
    const doc = sample();
    (
      doc.scenes[0].board.elements[0] as unknown as Record<string, unknown>
    ).loop = doc;
    expect(() => validateTacticalDocument(doc)).toThrow();
  });
  it('normalizes titles on output without mutating the input', () => {
    const doc = sample();
    doc.scenes[0].title = '  Başlangıç  ';
    const out = validateTacticalDocument(doc) as TacticalBoardDocumentV2;
    expect(out.scenes[0].title).toBe('Başlangıç');
    expect(doc.scenes[0].title).toBe('  Başlangıç  ');
  });
  it('enforces scene and aggregate-element limits at n/n+1', () => {
    expect(() => validateTacticalDocument(repeatScenes(12))).not.toThrow();
    expect(() => validateTacticalDocument(repeatScenes(13))).toThrow();
    expect(() => validateTacticalDocument(repeatScenes(6, 250))).not.toThrow();
    const tooMany = repeatScenes(6, 250);
    tooMany.scenes.push({ ...repeatScenes(1).scenes[0], id: 'extra' });
    expect(() => validateTacticalDocument(tooMany)).toThrow(/total element/);
    expect(() => validateTacticalDocument(repeatScenes(1, 251))).toThrow();
  });
  it('enforces individual and total duration limits', () => {
    const doc = repeatScenes(4);
    doc.scenes.forEach((s) => (s.holdMs = 30000));
    expect(() => validateTacticalDocument(doc)).not.toThrow();
    doc.scenes.push({ ...repeatScenes(1).scenes[0], id: 'extra', holdMs: 1 });
    expect(() => validateTacticalDocument(doc)).toThrow(/total duration/);
    const min = repeatScenes(1);
    min.scenes[0].holdMs = 1;
    expect(() => validateTacticalDocument(min)).not.toThrow();
    const linear = sample();
    linear.scenes[0].transitionMs = 100;
    expect(() => validateTacticalDocument(linear)).not.toThrow();
    linear.scenes[0].transitionMs = 10000;
    expect(() => validateTacticalDocument(linear)).not.toThrow();
  });
  it('enforces sequence UTF-8 bytes at 500000 and 500001 before title normalization', () => {
    const doc = sample();
    doc.scenes[0].title = 'İ😀';
    doc.scenes[0].title =
      ' '.repeat(500000 - byteLength(doc)) + doc.scenes[0].title;
    expect(byteLength(doc)).toBe(500000);
    expect(() => validateTacticalDocument(doc)).not.toThrow();
    doc.scenes[0].title = ' ' + doc.scenes[0].title;
    expect(() => validateTacticalDocument(doc)).toThrow(/byte limit/);
  });
  it('enforces the per-scene 100000-byte bound', () => {
    const doc = repeatScenes(1);
    doc.scenes[0].board.elements = Array.from({ length: 200 }, (_, i) => ({
      id: 't' + i,
      type: 'text' as const,
      x: 1,
      y: 1,
      fontSize: 10,
      text: '',
    }));
    for (const element of doc.scenes[0].board.elements) {
      const needed = 100000 - byteLength(doc.scenes[0].board);
      element.text = 'a'.repeat(Math.min(500, needed));
    }
    expect(byteLength(doc.scenes[0].board)).toBe(100000);
    expect(() => validateTacticalDocument(doc)).not.toThrow();
    doc.scenes[0].board.elements[199].text += 'a';
    expect(() => validateTacticalDocument(doc)).toThrow(/100000/);
  });
});

describe('deterministic tactical time evaluator', () => {
  it('handles start, hold, transition midpoint, target boundary and final hold', () => {
    const engine = createTacticalPlayback(sample());
    expect(engine.durationMs).toBe(3000);
    expect(engine.frameAt(0).phase).toBe('hold');
    expect(elementAt(engine.frameAt(999), 'p').x).toBe(100);
    expect(engine.frameAt(1000)).toMatchObject({
      phase: 'transition',
      progress: 0,
    });
    for (const id of ['p', 'g', 'b']) {
      const start = elementAt(engine.frameAt(0), id);
      expect(elementAt(engine.frameAt(1500), id)).toMatchObject({
        x: start.x + 50,
        y: start.y + 50,
      });
    }
    expect(elementAt(engine.frameAt(1500), 'c').x).toBe(200);
    expect(elementAt(engine.frameAt(2000), 'c').x).toBe(300);
    expect(engine.frameAt(2000)).toMatchObject({
      sceneId: 's2',
      phase: 'hold',
    });
    expect(engine.frameAt(3000)).toMatchObject({
      sceneId: 's2',
      phase: 'finished',
    });
    expect(engine.frameAt(-100)).toEqual(engine.frameAt(0));
    expect(engine.frameAt(99999)).toEqual(engine.frameAt(3000));
  });
  it('retains source appearance and entering/exiting objects until the boundary', () => {
    const doc = sample();
    doc.scenes[1].board.elements = doc.scenes[1].board.elements.filter(
      (e) => e.id !== 'g',
    );
    doc.scenes[1].board.elements.push({
      id: 'new',
      type: 'ball',
      x: 10,
      y: 10,
    });
    Object.assign(doc.scenes[1].board.elements[0], {
      name: 'Hedef',
      team: 'away',
      radius: 30,
      rotation: 90,
    });
    const engine = createTacticalPlayback(doc);
    expect(elementAt(engine.frameAt(1500), 'p')).toMatchObject({
      name: 'Sentetik Oyuncu',
      team: 'home',
      radius: 24,
    });
    expect(elementAt(engine.frameAt(1500), 'g')).toBeDefined();
    expect(elementAt(engine.frameAt(1500), 'new')).toBeUndefined();
    expect(elementAt(engine.frameAt(2000), 'g')).toBeUndefined();
    expect(elementAt(engine.frameAt(2000), 'new')).toBeDefined();
    expect(elementAt(engine.frameAt(2000), 'p')).toMatchObject({
      name: 'Hedef',
      team: 'away',
      radius: 30,
      rotation: 90,
    });
  });
  it('skips zero hold/cut scenes and preserves the exact last frame', () => {
    const doc = repeatScenes(3);
    doc.scenes[0].holdMs = 0;
    doc.scenes[1].holdMs = 0;
    const engine = createTacticalPlayback(doc);
    expect(engine.frameAt(0).sceneId).toBe('s2');
    expect(engine.frameAt(1000).board).toEqual(doc.scenes[2].board);
  });
  it('has no input/output aliasing or accumulated seek state', () => {
    const doc = sample();
    const engine = createTacticalPlayback(doc);
    const expected = engine.frameAt(1500);
    doc.scenes[0].board.elements[0].x = 999;
    const out = engine.frameAt(1500);
    out.board.elements[0].x = 888;
    for (const t of [2999, 0, 1000, 50, 2000]) engine.frameAt(t);
    expect(engine.frameAt(1500)).toEqual(expected);
  });
  it.each([0.5, 1, 2])(
    'samples absolute media time independently of 30/60 Hz at speed %s',
    (speed) => {
      const engine = createTacticalPlayback(sample());
      for (const fps of [30, 60]) {
        for (
          let tick = 0;
          tick <= Math.ceil(3000 / ((1000 / fps) * speed));
          tick++
        ) {
          const wallTime = (tick * 1000) / fps;
          const frame = engine.frameAt(wallTime * speed);
          expect(frame.timeMs).toBe(Math.min(3000, wallTime * speed));
        }
        expect(engine.frameAt((3000 / speed) * speed).phase).toBe('finished');
      }
    },
  );
  it('samples static V1 without converting its schema', () => {
    const engine = createTacticalPlayback(fixtures.v1);
    expect(engine.durationMs).toBe(0);
    expect(engine.frameAt(500).board).toEqual(fixtures.v1);
  });
  it.each([NaN, Infinity, -Infinity])('rejects invalid time %s', (t) => {
    expect(() => createTacticalPlayback(sample()).frameAt(t)).toThrow();
  });
});

it('keeps both dependency-free core copies compiled identically', () => {
  const compile = (path: string) =>
    ts.transpileModule(readFileSync(path, 'utf8'), {
      compilerOptions: {
        target: ts.ScriptTarget.ES2021,
        module: ts.ModuleKind.CommonJS,
        removeComments: true,
      },
    }).outputText;
  expect(
    compile(resolve(process.cwd(), 'src/lib/tactical-document-core.ts')),
  ).toBe(
    compile(
      resolve(
        process.cwd(),
        '../backend/src/tactics/tactical-document-core.ts',
      ),
    ),
  );
});
