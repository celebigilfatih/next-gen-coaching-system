import { describe, expect, it } from 'vitest';
import { emptyBoard, type TacticalBoardDocumentV1 } from './tactical-board';
import { translateSelection } from './board-selection';

const board: TacticalBoardDocumentV1 = {
  ...emptyBoard(),
  elements: [
    { id: 'a', type: 'player', team: 'home', x: 20, y: 40 },
    { id: 'b', type: 'player', team: 'home', x: 100, y: 100 },
    { id: 'arrow', type: 'arrow', x: 1100, y: 750, endX: 1180, endY: 780 },
  ],
};
describe('selection translation', () => {
  it('clamps one delta for the entire unit without changing distances', () => {
    const moved = translateSelection(board, ['a', 'b'], -100, -100);
    expect(moved.elements.slice(0, 2).map(({ x, y }) => [x, y])).toEqual([
      [0, 0],
      [80, 60],
    ]);
    expect(moved.elements[2]).toBe(board.elements[2]);
    expect(board.elements[0].x).toBe(20);
  });
  it('moves arrow endpoints and clamps them to the pitch', () => {
    const moved = translateSelection(board, ['b', 'arrow'], 80, 80);
    expect(moved.elements[1]).toMatchObject({ x: 120, y: 120 });
    expect(moved.elements[2]).toMatchObject({
      x: 1120,
      y: 770,
      endX: 1200,
      endY: 800,
    });
  });
  it('does not change local line coordinates or element identities', () => {
    const input = {
      ...emptyBoard(),
      elements: [
        {
          id: 'line',
          type: 'line' as const,
          x: 50,
          y: 50,
          points: [0, 0, 100, 100],
        },
      ],
    };
    expect(translateSelection(input, ['line'], 20, 30).elements[0]).toEqual({
      ...input.elements[0],
      x: 70,
      y: 80,
    });
  });
  it('ignores empty selections and non-finite deltas', () => {
    expect(translateSelection(board, [], 1, 1)).toBe(board);
    expect(translateSelection(board, ['a'], NaN, 1)).toBe(board);
  });
});
