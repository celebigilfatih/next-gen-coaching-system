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
    expect(parsed.querySelector('polygon')?.getAttribute('fill')).toBe(
      '#f59e0b',
    );
  });

  it('exports equipment, movement and player identities instead of generic circles', () => {
    const board = {
      ...emptyBoard(),
      elements: [
        {
          id: 'p1',
          type: 'player' as const,
          x: 100,
          y: 200,
          team: 'home' as const,
          number: '10',
          name: '<script>bad()</script> & Ali',
        },
        {
          id: 'g1',
          type: 'goal' as const,
          x: 400,
          y: 200,
          size: 'small' as const,
        },
        {
          id: 'a1',
          type: 'arrow' as const,
          x: 100,
          y: 200,
          endX: 300,
          endY: 240,
          style: 'curved' as const,
        },
        {
          id: 'l1',
          type: 'ladder' as const,
          x: 400,
          y: 500,
          length: 140,
          rungs: 6,
        },
      ],
    };
    const svg = new DOMParser().parseFromString(
      boardSvg(board),
      'image/svg+xml',
    );
    expect(svg.querySelector('parsererror')).toBeNull();
    expect(svg.querySelector('script')).toBeNull();
    expect(svg.querySelector('g')?.querySelector('polygon')).not.toBeNull();
    expect(svg.querySelector('g')?.textContent).toContain(
      '<script>bad()</script> & Ali',
    );
    const groups = svg.querySelectorAll('g');
    expect(groups[1].querySelectorAll('polyline').length).toBeGreaterThan(5);
    expect(groups[2].querySelector('polygon')).not.toBeNull();
    expect(groups[3].querySelectorAll('rect')).toHaveLength(6);
    const discs = new DOMParser().parseFromString(
      boardSvg(board, 'disc'),
      'image/svg+xml',
    );
    expect(discs.querySelector('g')?.querySelector('polygon')).toBeNull();
    expect(discs.querySelector('g')?.querySelector('circle')).not.toBeNull();
    expect(board.schemaVersion).toBe(1);
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
