import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getTacticalDocument,
  createTacticalDrill,
  saveTacticalDrill,
  putTacticalDocument,
  getTrainingPhaseDocument,
  putTrainingPhaseDocument,
  type TacticalResource,
} from './api';
import { emptyBoard } from './tactical-board';
import { createSequence } from './tactical-scenes';

afterEach(() => vi.unstubAllGlobals());
describe('opt-in tactical document API', () => {
  it('validates plan provenance and returns whole V2 snapshots after a token-bound write', async () => {
    const document = createSequence(emptyBoard(), 'one');
    const envelope = {
      document,
      writeToken: 'source-token',
      phase: {
        planId: 'p',
        planDrillId: 'phase',
        drillId: 'd',
        origin: 'drill',
      },
    };
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(envelope)))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            ...envelope,
            writeToken: 'snapshot-token',
            phase: { ...envelope.phase, origin: 'snapshot' },
          }),
        ),
      );
    vi.stubGlobal('fetch', fetcher);
    expect(await getTrainingPhaseDocument('p', 'phase')).toMatchObject({
      origin: 'drill',
      status: 'ready',
      document,
      writeToken: 'source-token',
    });
    expect(
      await putTrainingPhaseDocument('p', 'phase', document, 'source-token'),
    ).toMatchObject({
      origin: 'snapshot',
      document,
      writeToken: 'snapshot-token',
    });
    expect(JSON.parse(fetcher.mock.calls[1][1].body)).toEqual({
      document,
      expectedWriteToken: 'source-token',
    });
    expect(fetcher.mock.calls[1][0]).toContain(
      '/training-plans/p/drills/phase/tactical-document',
    );
  });
  it.each([
    { planId: 'other', planDrillId: 'phase', drillId: 'd', origin: 'drill' },
    { planId: 'p', planDrillId: 'other', drillId: 'd', origin: 'snapshot' },
    { planId: 'p', planDrillId: 'phase', drillId: 'd', origin: 'unknown' },
    undefined,
  ])(
    'rejects mismatched/invalid provenance without an empty-board fallback: %j',
    async (phase) => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          new Response(
            JSON.stringify({
              document: emptyBoard(),
              writeToken: 'token',
              phase,
            }),
          ),
        ),
      );
      await expect(getTrainingPhaseDocument('p', 'phase')).rejects.toThrow();
    },
  );
  it('accepts an absent plan document but refuses to acknowledge it as a saved snapshot', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(
        async () =>
          new Response(
            JSON.stringify({
              document: null,
              writeToken: 'absent-token',
              phase: {
                planId: 'p',
                planDrillId: 'phase',
                drillId: 'd',
                origin: null,
              },
            }),
          ),
      ),
    );
    expect(await getTrainingPhaseDocument('p', 'phase')).toMatchObject({
      status: 'absent',
      document: null,
    });
    await expect(
      putTrainingPhaseDocument('p', 'phase', emptyBoard(), 'token'),
    ).rejects.toThrow('doğrulanamadı');
  });
  const metadata = {
    title: 'Synthetic',
    category: 'TACTICAL' as const,
    difficulty: 'MEDIUM' as const,
    durationMin: 20,
  };
  it('uses one request for atomic drill metadata/document save and source-bound copy', async () => {
    const document = createSequence(emptyBoard(), 'one');
    const fetcher = vi.fn().mockImplementation(
      async () =>
        new Response(
          JSON.stringify({
            drill: { id: 'saved' },
            document,
            writeToken: 'next',
          }),
        ),
    );
    vi.stubGlobal('fetch', fetcher);
    await saveTacticalDrill('d/1', metadata, document, 'original');
    expect(fetcher.mock.calls[0][0]).toContain('/drills/d%2F1/tactical-editor');
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({
      metadata,
      document,
      expectedWriteToken: 'original',
    });
    await createTacticalDrill({
      groupId: 'g',
      metadata,
      document,
      sourceId: 'source',
      expectedSourceToken: 'original',
    });
    expect(fetcher.mock.calls[1][0]).toContain('/drills/tactical-editor');
    expect(JSON.parse(fetcher.mock.calls[1][1].body)).toMatchObject({
      sourceId: 'source',
      expectedSourceToken: 'original',
    });
  });
  it('rejects an invalid successful create response without retrying', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          drill: { id: 'd' },
          document: null,
          writeToken: 'next',
        }),
      ),
    );
    vi.stubGlobal('fetch', fetcher);
    await expect(
      createTacticalDrill({ groupId: 'g', metadata, document: emptyBoard() }),
    ).rejects.toThrow('doğrulanamadı');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it.each([
    [{ kind: 'drill', id: 'd/1' }, '/drills/d%2F1/tactical-document'],
    [
      { kind: 'plan', id: 'phase', planId: 'plan' },
      '/training-plans/plan/drills/phase/tactical-document',
    ],
    [
      { kind: 'match', id: 'match' },
      '/seasons/matches/match/tactical-document',
    ],
  ] as [TacticalResource, string][])(
    'uses authorized adapter path %j',
    async (resource, path) => {
      const fetcher = vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ document: null, writeToken: 'opaque-read-token' }),
          ),
        );
      vi.stubGlobal('fetch', fetcher);
      expect(await getTacticalDocument(resource)).toEqual({
        document: null,
        writeToken: 'opaque-read-token',
      });
      expect(fetcher.mock.calls[0][0]).toContain(path);
    },
  );
  it('sends the exact caller token and whole document, returning the new token only on success', async () => {
    const document = createSequence(emptyBoard(), 'scene');
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ document, writeToken: 'new-token' })),
      );
    vi.stubGlobal('fetch', fetcher);
    expect(
      await putTacticalDocument(
        { kind: 'drill', id: 'd' },
        document,
        'old-token',
      ),
    ).toEqual({ document, writeToken: 'new-token' });
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({
      document,
      expectedWriteToken: 'old-token',
    });
  });
  it('does not read a fresh token or retry a conflict', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: 'Tahta değişti (409)' }), {
        status: 409,
      }),
    );
    vi.stubGlobal('fetch', fetcher);
    await expect(
      putTacticalDocument({ kind: 'match', id: 'm' }, emptyBoard(), 'old'),
    ).rejects.toThrow('409');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('rejects missing token before network and invalid responses without an empty board fallback', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          document: { schemaVersion: 99 },
          writeToken: 'token',
        }),
      ),
    );
    vi.stubGlobal('fetch', fetcher);
    await expect(
      putTacticalDocument({ kind: 'drill', id: 'd' }, emptyBoard(), ''),
    ).rejects.toThrow('anahtarı');
    expect(fetcher).not.toHaveBeenCalled();
    await expect(
      getTacticalDocument({ kind: 'drill', id: 'd' }),
    ).rejects.toThrow();
  });
});
