import { describe, expect, it } from 'vitest';
import { emptyBoard } from './tactical-board';
import { boardSvg } from './tactical-board-svg';

describe('boardSvg', () => {
  it('exports a parseable SVG for a valid tactical board', () => {
    const svg = boardSvg({
      ...emptyBoard(),
      elements: [
        {
          id: 'cone-1',
          type: 'cone',
          x: 100,
          y: 120,
          color: '#f59e0b',
          size: 20,
        },
      ],
    });
    const parsed = new DOMParser().parseFromString(svg, 'image/svg+xml');

    expect(parsed.querySelector('parsererror')).toBeNull();
    expect(parsed.querySelector('circle')?.getAttribute('fill')).toBe(
      '#f59e0b',
    );
  });

  it('rejects attribute injection through color or numeric fields', () => {
    const unsafeColor = {
      ...emptyBoard(),
      elements: [
        {
          id: 'cone-1',
          type: 'cone',
          x: 100,
          y: 120,
          color: 'red" onclick="alert(1)',
          size: 20,
        },
      ],
    };
    const unsafeRotation = {
      ...emptyBoard(),
      elements: [
        {
          id: 'ball-1',
          type: 'ball',
          x: 100,
          y: 120,
          rotation: '0)" onclick="alert(1)',
          radius: 12,
        },
      ],
    };

    expect(() => boardSvg(unsafeColor as never)).toThrow(/hexadecimal/i);
    expect(() => boardSvg(unsafeRotation as never)).toThrow(/dönüş/i);
  });
});
