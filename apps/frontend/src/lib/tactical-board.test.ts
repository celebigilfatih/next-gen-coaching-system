import { describe, expect, it } from 'vitest';
import {
  changeBoardPitch,
  emptyBoard,
  formationElements,
  validateBoard,
  pitchConfigs,
  type PitchType,
  type TacticalBoardDocumentV1,
} from './tactical-board';
import { validateStaticBoard } from './tactical-document-core';

describe('TacticalBoardDocumentV1', () => {
  it.each(Object.keys(pitchConfigs) as PitchType[])(
    'moves anchors and arrow/line endpoints proportionally to %s without editing identities or sizes',
    (type) => {
      const original: TacticalBoardDocumentV1 = {
        ...emptyBoard(),
        elements: [
          {
            id: 'p',
            type: 'player',
            x: 1080,
            y: 720,
            team: 'home',
            name: 'Test Oyuncu',
            number: '10',
            radius: 24,
            rotation: 30,
          },
          {
            id: 'a',
            type: 'arrow',
            x: 600,
            y: 400,
            endX: 1200,
            endY: 800,
            thickness: 5,
            style: 'straight',
          },
          {
            id: 'l',
            type: 'line',
            x: 120,
            y: 80,
            points: [0, 0, 120, 80],
            thickness: 4,
            style: 'solid',
          },
        ],
      };
      const before = JSON.stringify(original);
      const next = changeBoardPitch(original, type);
      const { width, height } = pitchConfigs[type];
      expect(next.elements[0]).toEqual({
        ...original.elements[0],
        x: width * 0.9,
        y: height * 0.9,
      });
      expect(next.elements[1]).toMatchObject({
        x: width / 2,
        y: height / 2,
        endX: width,
        endY: height,
      });
      expect(next.elements[2].points).toEqual([0, 0, width / 10, height / 10]);
      expect(validateStaticBoard(JSON.parse(JSON.stringify(next)))).toEqual(
        next,
      );
      expect(JSON.stringify(original)).toBe(before);
      expect(changeBoardPitch(next, type)).toBe(next);
    },
  );

  it('preserves an oversized equipment draft instead of silently shrinking it or creating an unsaveable pitch', () => {
    const board: TacticalBoardDocumentV1 = {
      ...emptyBoard(),
      elements: [
        {
          id: 'zone',
          type: 'zone',
          x: 600,
          y: 400,
          width: 1000,
          height: 700,
          opacity: 0.25,
        },
      ],
    };
    expect(() => changeBoardPitch(board, 'corner')).toThrow(
      /Önce boyutlarını küçültün/,
    );
    expect(board.pitch.type).toBe('full');
    expect(board.elements[0].width).toBe(1000);
  });
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
