import type { BoardElement } from './tactical-board';
import { elementArtworkSvg } from './tactical-board-svg';

export const equipmentTools = [
  {
    type: 'player',
    label: 'Oyuncu',
    patch: { team: 'home', number: '8', radius: 24 },
    viewBox: '-34 -29 68 60',
  },
  {
    type: 'goalkeeper',
    label: 'Kaleci',
    patch: { team: 'home', number: '1', size: 34 },
    viewBox: '-34 -29 68 60',
  },
  {
    type: 'ball',
    label: 'Top',
    patch: { radius: 12 },
    viewBox: '-15 -15 30 30',
  },
  {
    type: 'cone',
    label: 'Huni',
    patch: { color: '#f97316', size: 24 },
    viewBox: '-22 -27 44 46',
  },
  {
    type: 'goal',
    label: 'Kale',
    patch: { size: 'large' },
    viewBox: '-56 -28 112 60',
  },
  {
    type: 'wall',
    label: 'Baraj',
    patch: { width: 84 },
    viewBox: '-46 -24 92 64',
  },
  {
    type: 'flag',
    label: 'Bayrak',
    patch: { color: '#f59e0b', height: 60 },
    viewBox: '-10 -65 48 76',
  },
  {
    type: 'ladder',
    label: 'Merdiven',
    patch: { length: 140, rungs: 6 },
    viewBox: '-76 -25 152 50',
  },
  {
    type: 'marker',
    label: 'İşaret',
    patch: { shape: 'circle', color: '#facc15', size: 24 },
    viewBox: '-16 -16 32 32',
  },
] satisfies Array<{
  type: BoardElement['type'];
  label: string;
  patch: Partial<BoardElement>;
  viewBox: string;
}>;

export const equipmentImages: ReadonlyMap<BoardElement['type'], string> =
  new Map(
    equipmentTools.map((tool) => [
      tool.type,
      `data:image/svg+xml,${encodeURIComponent(elementArtworkSvg({ id: 'tool-preview', type: tool.type, x: 0, y: 0, ...tool.patch }, tool.viewBox))}`,
    ]),
  );
