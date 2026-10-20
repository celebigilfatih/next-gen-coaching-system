import { describe, expect, it } from 'vitest';
import { equipmentImages, equipmentTools } from './board-equipment';
import { elementArt } from './board-art';
import { boardSvg } from './tactical-board-svg';
import { emptyBoard, type BoardElement } from './tactical-board';

describe('shared equipment artwork', () => {
  it.each(equipmentTools)(
    '$label uses the exact pitch artwork in its miniature and SVG export',
    (tool) => {
      const element: BoardElement = {
        id: 'saved-object',
        type: tool.type,
        x: 120,
        y: 140,
        rotation: 15,
        ...tool.patch,
      };
      const before = JSON.stringify(element);
      const parse = (svg: string) =>
        new DOMParser().parseFromString(svg, 'image/svg+xml');
      const miniature = parse(
        decodeURIComponent(equipmentImages.get(tool.type)!.split(',')[1]),
      );
      const exported = parse(
        boardSvg({ ...emptyBoard(), elements: [{ ...element, rotation: 0 }] }),
      );
      const group = exported.querySelector('g')!;
      group.querySelector('title')!.remove();
      expect(miniature.querySelector('parsererror')).toBeNull();
      expect(miniature.documentElement.innerHTML).toBe(group.innerHTML);
      expect(boardSvg({ ...emptyBoard(), elements: [element] })).toContain(
        'rotate(15)',
      );
      expect(JSON.stringify(element)).toBe(before);
    },
  );

  it('keeps custom identities, colors and sizes, with a distinct keeper and the disc alternative', () => {
    const player: BoardElement = {
      id: 'legacy-player',
      type: 'player',
      x: 100,
      y: 100,
      radius: 18,
      color: '#aa2244',
      number: '27',
      name: 'Saved name',
    };
    const before = JSON.stringify(player);
    expect(elementArt(player).some((shape) => shape.fill === '#aa2244')).toBe(
      true,
    );
    expect(
      elementArt(player).find((shape) => shape.type === 'text')?.text,
    ).toBe('27');
    expect(
      elementArt(player, 'disc').some((shape) => shape.type === 'circle'),
    ).toBe(true);
    expect(
      elementArt(player, 'disc').some((shape) => shape.type === 'line'),
    ).toBe(false);
    expect(
      elementArt({ ...player, type: 'goalkeeper', size: 34 }).filter(
        (shape) => shape.type === 'rect',
      ).length,
    ).toBeGreaterThan(
      elementArt(player).filter((shape) => shape.type === 'rect').length,
    );
    expect(JSON.stringify(player)).toBe(before);
  });
});
