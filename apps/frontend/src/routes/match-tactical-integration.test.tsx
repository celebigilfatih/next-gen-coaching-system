import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MatchDetailRoute from './match-detail';
import { setSession } from '../lib/session';
import { createSequence } from '../lib/tactical-scenes';
import { emptyBoard } from '../lib/tactical-board';

const api = vi.hoisted(() => ({
  metadata: vi.fn(),
  read: vi.fn(),
  write: vi.fn(),
  update: vi.fn(),
}));
vi.mock('../lib/api', () => ({
  getMatchMetadata: api.metadata,
  getTacticalDocument: api.read,
  putTacticalDocument: api.write,
  updateMatch: api.update,
}));
vi.mock('../lib/workspace-context', () => ({
  useWorkspace: () => ({
    group: { id: 'g' },
    season: { id: 's' },
    scope: { clubId: 'c', teamId: 't', clubSeasonId: 'cs' },
    loading: false,
    error: '',
    reload: vi.fn(),
  }),
}));
vi.mock('konva', () => ({ default: {} }));
vi.mock('react-konva', () =>
  Object.fromEntries(
    [
      'Circle',
      'Group',
      'Layer',
      'Line',
      'Rect',
      'Stage',
      'Text',
      'Transformer',
    ].map((key) => [key, () => null]),
  ),
);
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
const sequence = createSequence(emptyBoard(), 'one');
const match = {
  id: 'm',
  groupId: 'g',
  seasonId: 's',
  date: '2026-09-26T10:00:00Z',
  opponent: 'QA match',
  location: 'Field',
  competition: null,
  notes: '',
  ourFormation: '',
  opponentAnalysis: '',
  hasBoard: true,
};
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  );
  setSession({
    token: 'synthetic',
    user: {
      id: 'coach',
      name: 'Coach',
      email: 'qa@example.test',
      role: 'COACH',
      clubId: 'c',
    },
  });
  api.metadata.mockResolvedValue(match);
  api.read.mockResolvedValue({ document: sequence, writeToken: 'first' });
  api.write.mockImplementation(async (_, document) => {
    const envelope = { document, writeToken: 'next' };
    api.read.mockResolvedValue(envelope);
    return envelope;
  });
  api.update.mockResolvedValue(match);
});
afterEach(() => vi.unstubAllGlobals());
function open() {
  const router = createMemoryRouter(
    [{ path: '/matches/:matchId', element: <MatchDetailRoute /> }],
    { initialEntries: ['/matches/m'] },
  );
  return { router, ...render(<RouterProvider router={router} />) };
}
function tab(name: string) {
  fireEvent.mouseDown(screen.getByRole('tab', { name }), {
    button: 0,
    ctrlKey: false,
  });
}
describe('match route tactical cutover', () => {
  it('loads metadata first, lazily reads V2 and guards tab changes with the actual editor', async () => {
    open();
    await screen.findByRole('heading', { name: 'QA match' });
    expect(api.read).not.toHaveBeenCalled();
    tab('Taktik tahtası');
    await screen.findByRole('region', { name: 'Sahne düzenleyici' });
    await screen.findByRole('button', { name: 'Sahne ekle' });
    expect(api.read).toHaveBeenCalledWith({ kind: 'match', id: 'm' });
    fireEvent.click(screen.getByRole('button', { name: 'Sahne ekle' }));
    tab('Analiz');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'İptal' }));
    expect(screen.getByRole('tab', { name: 'Taktik tahtası' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    tab('Analiz');
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet ve çık' }));
    await waitFor(() =>
      expect(screen.getByRole('tab', { name: 'Analiz' })).toHaveAttribute(
        'aria-selected',
        'true',
      ),
    );
    expect(api.write.mock.calls[0][1].scenes).toHaveLength(2);
    expect(api.write.mock.calls[0][2]).toBe('first');
    tab('Taktik tahtası');
    await screen.findByRole('region', { name: 'Sahne düzenleyici' });
    expect(
      screen.getByRole('region', { name: 'Sahne düzenleyici' }),
    ).toHaveTextContent('2/12');
    expect(api.read).toHaveBeenCalledTimes(2);
  });
  it('discard really releases the local draft; reopening reads the saved document', async () => {
    open();
    await screen.findByRole('heading', { name: 'QA match' });
    tab('Taktik tahtası');
    await screen.findByRole('button', { name: 'Sahne ekle' });
    fireEvent.click(screen.getByRole('button', { name: 'Sahne ekle' }));
    tab('Analiz');
    fireEvent.click(screen.getByRole('button', { name: 'Değişiklikleri at' }));
    tab('Taktik tahtası');
    expect(
      await screen.findByRole('region', { name: 'Sahne düzenleyici' }),
    ).toHaveTextContent('1/12');
    expect(screen.getByRole('status')).toHaveTextContent('Kaydedildi');
    expect(api.read).toHaveBeenCalledTimes(2);
    expect(api.write).not.toHaveBeenCalled();
  });
  it('keeps a conflicted draft in the board tab and never auto-refreshes its token', async () => {
    api.write.mockRejectedValue(new Error('TACTICAL_DOCUMENT_WRITE_CONFLICT'));
    open();
    await screen.findByRole('heading', { name: 'QA match' });
    tab('Taktik tahtası');
    await screen.findByRole('button', { name: 'Sahne ekle' });
    fireEvent.click(screen.getByRole('button', { name: 'Sahne ekle' }));
    tab('Analiz');
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet ve çık' }));
    await waitFor(() => expect(api.write).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(
        screen.getAllByText(/Tahta başka bir oturumda değişti/).length,
      ).toBeGreaterThan(0),
    );
    expect(
      screen.getByRole('tab', { name: 'Taktik tahtası', hidden: true }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(api.read).toHaveBeenCalledTimes(1);
  });
  it('revoking management by switching to PLAYER remounts a readonly authorized view', async () => {
    open();
    await screen.findByRole('heading', { name: 'QA match' });
    tab('Taktik tahtası');
    await screen.findByRole('button', { name: 'Sahne ekle' });
    act(() =>
      setSession({
        token: 'player',
        user: {
          id: 'player',
          name: 'Player',
          email: 'player@example.test',
          role: 'PLAYER',
          clubId: 'c',
        },
      }),
    );
    await screen.findByRole('heading', { name: 'QA match' });
    expect(
      screen.queryByRole('button', { name: 'Analizi kaydet' }),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText('Koç notu')).toBeDisabled();
    tab('Taktik tahtası');
    await screen.findByRole('button', { name: 'Oynat' });
    expect(
      screen.queryByRole('button', { name: 'Kaydet' }),
    ).not.toBeInTheDocument();
    expect(api.write).not.toHaveBeenCalled();
  });
});
