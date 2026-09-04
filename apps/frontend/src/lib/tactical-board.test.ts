import { describe, expect, it } from 'vitest';
import { emptyBoard, formationElements, validateBoard } from './tactical-board';

describe('TacticalBoardDocumentV1', () => {
  it('accepts the canonical empty board', () => {
    expect(validateBoard(emptyBoard('mini7')).pitch).toEqual({
      type: 'mini7',
      width: 950,
      height: 650,
    });
  });

  it('rejects unknown element types and more than 250 elements', () => {
    expect(() =>
      validateBoard({
        ...emptyBoard(),
        elements: [{ id: 'x', type: 'video', x: 1, y: 1 }],
      }),
    ).toThrow(/bilinmeyen/i);
    expect(() =>
      validateBoard({
        ...emptyBoard(),
        elements: Array.from({ length: 251 }, (_, index) => ({
          id: `p-${index}`,
          type: 'player',
          x: 100,
          y: 100,
        })),
      }),
    ).toThrow(/250/);
  });

  it('creates eleven independently identified players for every formation', () => {
    const elements = formationElements('4-2-3-1', 'home', 1200, 800);
    expect(elements).toHaveLength(11);
    expect(new Set(elements.map((element) => element.id)).size).toBe(11);
  });
});
