import { describe, expect, it } from 'vitest';
import { pitchArt } from './board-art';
import { emptyBoard, pitchConfigs, type PitchType } from './tactical-board';
import { boardSvg } from './tactical-board-svg';

describe('football pitch templates', () => {
  it.each(Object.keys(pitchConfigs) as PitchType[])(
    '%s stays inside its canonical drawing and exports as valid SVG',
    (type) => {
      const board = emptyBoard(type);
      const before = JSON.stringify(board);
      const shapes = pitchArt(board.pitch);
      for (const shape of shapes) {
        for (let i = 0; i < (shape.points?.length ?? 0); i++) {
          const coordinate = shape.points![i];
          expect(Number.isFinite(coordinate)).toBe(true);
          expect(coordinate).toBeGreaterThanOrEqual(18 - 0.001);
          expect(coordinate).toBeLessThanOrEqual(
            (i % 2 ? board.pitch.height : board.pitch.width) - 18 + 0.001,
          );
        }
      }
      const svg = new DOMParser().parseFromString(
        boardSvg(board),
        'image/svg+xml',
      );
      expect(svg.querySelector('parsererror')).toBeNull();
      expect(JSON.stringify(board)).toBe(before);
    },
  );

  it('shows two goal mouths only on full and small-sided pitches; crops specialty templates', () => {
    const mouths = (type: PitchType) =>
      pitchArt(emptyBoard(type).pitch).filter(
        (shape) => shape.strokeWidth === 5,
      );
    for (const type of ['full', 'mini7', 'mini5'] as const)
      expect(mouths(type)).toHaveLength(2);
    for (const type of [
      'half',
      'third',
      'quarter',
      'penalty',
      'corner',
      'freekick',
    ] as const)
      expect(mouths(type)).toHaveLength(1);
    const half = pitchArt(emptyBoard('half').pitch);
    expect(half.filter((shape) => shape.type === 'circle')).toHaveLength(2);
    expect(
      pitchArt(emptyBoard('penalty').pitch).filter(
        (shape) => shape.type === 'circle',
      ),
    ).toHaveLength(1);
    expect(
      pitchArt(emptyBoard('training').pitch).some(
        (shape) => shape.type === 'line',
      ),
    ).toBe(false);
    expect(
      pitchArt(emptyBoard('grid').pitch).filter(
        (shape) => shape.type === 'line',
      ),
    ).toHaveLength(14);
    expect(
      new Set(
        Object.keys(pitchConfigs).map((type) =>
          JSON.stringify(pitchArt(emptyBoard(type as PitchType).pitch)),
        ),
      ).size,
    ).toBe(11);
  });
});
