import { describe, expect, it } from 'vitest';
import { emptyBoard } from './tactical-board';
import {
  createSequence,
  editScenes,
  replaceSceneBoard,
} from './tactical-scenes';

const board = {
  ...emptyBoard(),
  elements: [
    {
      id: 'player-1',
      type: 'player' as const,
      team: 'home' as const,
      x: 100,
      y: 100,
    },
  ],
};
const seed = () => createSequence(board, 'one');
describe('scene editing boundaries', () => {
  it('explicitly converts V1 without mutation; duplicates stable element identities', () => {
    const original = seed();
    const next = editScenes(original, {
      type: 'duplicate',
      id: 'one',
      newId: 'two',
    });
    expect(next.scenes[1].board).toEqual(board);
    expect(next.scenes[1].board).not.toBe(original.scenes[0].board);
    expect(next.scenes[0].transition).toBe('cut');
    expect(original.scenes).toHaveLength(1);
    expect(board.schemaVersion).toBe(1);
  });
  it('reordering and deletion normalize the final transition atomically', () => {
    let next = editScenes(seed(), {
      type: 'duplicate',
      id: 'one',
      newId: 'two',
    });
    next = editScenes(next, {
      type: 'update',
      id: 'one',
      patch: {
        title: '  Pres  ',
        holdMs: 0,
        transition: 'linear',
        transitionMs: 1000,
      },
    });
    expect(next.scenes[0].title).toBe('Pres');
    const moved = editScenes(next, { type: 'move', id: 'one', direction: 1 });
    expect(moved.scenes[1]).toMatchObject({
      id: 'one',
      holdMs: 1,
      transition: 'cut',
      transitionMs: 0,
    });
    const removed = editScenes(next, { type: 'remove', id: 'two' });
    expect(removed.scenes[0]).toMatchObject({
      id: 'one',
      holdMs: 1,
      transition: 'cut',
      transitionMs: 0,
    });
    expect(next.scenes[0].transition).toBe('linear');
  });
  it('rejects last removal, invalid id/title/timing and a moving final scene', () => {
    expect(() => editScenes(seed(), { type: 'remove', id: 'one' })).toThrow(
      'Son sahne',
    );
    expect(() => editScenes(seed(), { type: 'remove', id: 'missing' })).toThrow(
      'bulunamadı',
    );
    for (const patch of [
      { title: '', holdMs: 2000, transition: 'cut' as const, transitionMs: 0 },
      { title: 'a', holdMs: 0, transition: 'cut' as const, transitionMs: 0 },
      { title: 'a', holdMs: 1.5, transition: 'cut' as const, transitionMs: 0 },
      {
        title: 'a',
        holdMs: 2000,
        transition: 'linear' as const,
        transitionMs: 1000,
      },
    ])
      expect(() =>
        editScenes(seed(), { type: 'update', id: 'one', patch }),
      ).toThrow();
  });
  it('accepts twelve scenes but rejects a thirteenth and duplicate identity', () => {
    let next = seed();
    for (let i = 2; i <= 12; i++)
      next = editScenes(next, { type: 'duplicate', id: 'one', newId: `s${i}` });
    expect(next.scenes).toHaveLength(12);
    expect(() =>
      editScenes(next, { type: 'duplicate', id: 'one', newId: 's13' }),
    ).toThrow('12');
    expect(() =>
      editScenes(seed(), { type: 'duplicate', id: 'one', newId: 'one' }),
    ).toThrow();
  });
  it('rejects aggregate duration, pitch mismatch and cross-scene type mismatch without mutation', () => {
    let next = seed();
    for (let i = 2; i <= 5; i++)
      next = editScenes(next, { type: 'duplicate', id: 'one', newId: `s${i}` });
    for (let i = 0; i < 4; i++)
      next = editScenes(next, {
        type: 'update',
        id: next.scenes[i].id,
        patch: {
          title: 'Pres',
          holdMs: 29000,
          transition: 'cut',
          transitionMs: 0,
        },
      });
    expect(() =>
      editScenes(next, {
        type: 'update',
        id: next.scenes[4].id,
        patch: {
          title: 'Pres',
          holdMs: 30000,
          transition: 'cut',
          transitionMs: 0,
        },
      }),
    ).toThrow();
    expect(() => replaceSceneBoard(next, 'one', emptyBoard('half'))).toThrow();
    expect(() =>
      replaceSceneBoard(next, 'one', {
        ...board,
        elements: [{ id: 'player-1', type: 'ball', x: 1, y: 1 }],
      }),
    ).toThrow();
    expect(next.scenes[0].board).toEqual(board);
  });
  it('changes only the selected board and keeps other scenes immutable', () => {
    const next = editScenes(seed(), {
      type: 'duplicate',
      id: 'one',
      newId: 'two',
    });
    const changed = replaceSceneBoard(next, 'two', {
      ...board,
      elements: [{ ...board.elements[0], x: 500 }],
    });
    if (changed.schemaVersion !== 2) throw new Error();
    expect(changed.scenes[0].board.elements[0].x).toBe(100);
    expect(changed.scenes[1].board.elements[0].x).toBe(500);
    expect(next.scenes[1].board.elements[0].x).toBe(100);
  });
});
