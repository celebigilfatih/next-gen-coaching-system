import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TacticsEditorPage } from './tactics-editor';
import { setSession } from '../lib/session';
import { createSequence } from '../lib/tactical-scenes';
import { emptyBoard } from '../lib/tactical-board';

const api = vi.hoisted(() => ({
  metadata: vi.fn(),
  read: vi.fn(),
  save: vi.fn(),
  create: vi.fn(),
}));
vi.mock('../lib/api', () => ({
  getTacticalDrillMetadata: api.metadata,
  getTacticalDocument: api.read,
  saveTacticalDrill: api.save,
  createTacticalDrill: api.create,
}));
vi.mock('../lib/workspace-context', () => ({
  useWorkspace: () => ({
    group: { id: 'g', name: 'U18' },
    scope: { clubId: 'c', teamId: 't' },
    loading: false,
    error: '',
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
const drill = {
  id: 'd',
  title: 'QA egzersizi',
  category: 'TACTICAL',
  durationMin: 20,
  difficulty: 'MEDIUM',
  equipment: 'Top',
  scope: 'CLUB',
  groupId: 'g',
  clubId: 'c',
  createdById: 'coach',
  ageGroup: 'U18',
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
  api.metadata.mockResolvedValue(drill);
  api.read.mockResolvedValue({ document: sequence, writeToken: 'first' });
  api.save.mockImplementation(async (_, metadata, document) => ({
    drill: { ...drill, ...metadata },
    document,
    writeToken: 'next',
  }));
  api.create.mockImplementation(async ({ metadata, document }) => ({
    drill: { ...drill, ...metadata, id: 'copy' },
    document,
    writeToken: 'copy-token',
  }));
});
afterEach(() => vi.unstubAllGlobals());
function open(existing = true) {
  const router = createMemoryRouter(
    [
      {
        path: '/edit',
        element: <TacticsEditorPage drillId={existing ? 'd' : undefined} />,
      },
      { path: '/app/tactics/:id', element: <p>Kaydedilen egzersiz</p> },
      { path: '/app/tactics', element: <p>Katalog</p> },
    ],
    { initialEntries: ['/edit'] },
  );
  return { router, ...render(<RouterProvider router={router} />) };
}
describe('drill route tactical cutover', () => {
  it('locks metadata and prevents duplicate saves while a write is pending', async () => {
    let finish!: (value: unknown) => void;
    api.save.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    open();
    await screen.findByRole('button', { name: 'Sahne ekle' });
    fireEvent.click(
      screen.getByText(
        'Egzersiz bilgileri · Başlık, süre, kategori ve ekipman',
      ),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
    await waitFor(() => expect(screen.getByLabelText('Başlık')).toBeDisabled());
    expect(api.save).toHaveBeenCalledTimes(1);
    await act(async () =>
      finish({ drill, document: sequence, writeToken: 'next' }),
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Başlık')).not.toBeDisabled(),
    );
  });
  it('discards a late read from a previous resource', async () => {
    let finish!: (value: unknown) => void;
    api.metadata.mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const view = render(
      <RouterProvider
        router={createMemoryRouter(
          [{ path: '/edit', element: <TacticsEditorPage drillId="old" /> }],
          { initialEntries: ['/edit'] },
        )}
      />,
    );
    await waitFor(() => expect(api.metadata).toHaveBeenCalledWith('old'));
    view.rerender(
      <RouterProvider
        router={createMemoryRouter(
          [{ path: '/edit', element: <TacticsEditorPage drillId="new" /> }],
          { initialEntries: ['/edit'] },
        )}
      />,
    );
    await screen.findByRole('heading', { name: 'QA egzersizi' });
    await act(async () =>
      finish({ ...drill, id: 'old', title: 'Stale private draft' }),
    );
    expect(screen.queryByText('Stale private draft')).not.toBeInTheDocument();
  });
  it('reads metadata and whole V2, saves metadata and scenes together and adopts only the returned token', async () => {
    open();
    await screen.findByRole('button', { name: 'Sahne ekle' });
    fireEvent.click(
      screen.getByText(
        'Egzersiz bilgileri · Başlık, süre, kategori ve ekipman',
      ),
    );
    fireEvent.change(screen.getByLabelText('Başlık'), {
      target: { value: 'Yeni başlık' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sahne ekle' }));
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Kaydedildi'),
    );
    expect(api.save.mock.calls[0][1].title).toBe('Yeni başlık');
    expect(api.save.mock.calls[0][2].scenes).toHaveLength(2);
    expect(api.save.mock.calls[0][3]).toBe('first');
    fireEvent.click(screen.getByRole('button', { name: 'Sahne ekle' }));
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
    await waitFor(() => expect(api.save).toHaveBeenCalledTimes(2));
    expect(api.save.mock.calls[1][3]).toBe('next');
    expect(api.read).toHaveBeenCalledTimes(1);
  });
  it.each([
    'TACTICAL_DOCUMENT_WRITE_CONFLICT',
    'TACTICAL_V2_WRITES_DISABLED',
    'Network failed',
  ])('keeps the entire draft and token on %s', async (message) => {
    api.save.mockRejectedValue(new Error(message));
    open();
    fireEvent.click(await screen.findByRole('button', { name: 'Sahne ekle' }));
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
    await screen.findByText(/Taslağınız korundu/);
    expect(
      screen.getByRole('region', { name: 'Sahne düzenleyici' }),
    ).toHaveTextContent('2/12');
    expect(api.read).toHaveBeenCalledTimes(1);
    expect(api.save).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
    await waitFor(() => expect(api.save).toHaveBeenCalledTimes(2));
    expect(api.save.mock.calls[1][3]).toBe('first');
  });
  it('copies a global source with its original token and never updates the source', async () => {
    api.metadata.mockResolvedValue({ ...drill, scope: 'GLOBAL' });
    const { router } = open();
    fireEvent.click(await screen.findByRole('button', { name: 'Sahne ekle' }));
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
    await screen.findByText('Kaydedilen egzersiz');
    expect(router.state.location.pathname).toBe('/app/tactics/copy');
    expect(api.create.mock.calls[0][0]).toMatchObject({
      groupId: 'g',
      sourceId: 'd',
      expectedSourceToken: 'first',
      document: { schemaVersion: 2 },
    });
    expect(api.save).not.toHaveBeenCalled();
  });
  it('creates a new V1 without fetching or submitting ownership fields', async () => {
    open(false);
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
    await screen.findByText('Kaydedilen egzersiz');
    expect(api.create.mock.calls[0][0]).toMatchObject({
      groupId: 'g',
      document: { schemaVersion: 1 },
    });
    expect(api.create.mock.calls[0][0]).not.toHaveProperty('clubId');
    expect(api.read).not.toHaveBeenCalled();
  });
  it('failed reads never mount a blank editor; explicit retry re-reads', async () => {
    api.read.mockRejectedValueOnce(new Error('Read denied'));
    open();
    await screen.findByText('Read denied');
    expect(
      screen.queryByRole('button', { name: 'Kaydet' }),
    ).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: 'Tahtayı yeniden yükle' }),
    );
    await screen.findByRole('button', { name: 'Sahne ekle' });
    expect(api.read).toHaveBeenCalledTimes(2);
  });
  it('other coach and PLAYER see readonly playback; metadata fields cannot mutate', async () => {
    api.metadata.mockResolvedValue({ ...drill, createdById: 'peer' });
    open();
    await screen.findByRole('button', { name: 'Oynat' });
    expect(
      screen.queryByRole('button', { name: 'Kaydet' }),
    ).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByText(
        'Egzersiz bilgileri · Başlık, süre, kategori ve ekipman',
      ),
    );
    expect(screen.getByLabelText('Başlık')).toBeDisabled();
    act(() =>
      setSession({
        token: 'p',
        user: {
          id: 'player',
          name: 'Player',
          email: 'p@example.test',
          role: 'PLAYER',
          clubId: 'c',
        },
      }),
    );
    await screen.findByRole('button', { name: 'Oynat' });
    expect(
      screen.queryByRole('button', { name: 'Kaydet' }),
    ).not.toBeInTheDocument();
    expect(api.save).not.toHaveBeenCalled();
  });
  it('guards metadata-only navigation and keeps the route on failed save-and-leave', async () => {
    api.save.mockRejectedValue(new Error('TACTICAL_DOCUMENT_WRITE_CONFLICT'));
    const { router } = open();
    await screen.findByRole('button', { name: 'Sahne ekle' });
    fireEvent.click(
      screen.getByText(
        'Egzersiz bilgileri · Başlık, süre, kategori ve ekipman',
      ),
    );
    fireEvent.change(screen.getByLabelText('Başlık'), {
      target: { value: 'Unsaved' },
    });
    fireEvent.click(screen.getByRole('link', { name: 'Kütüphane' }));
    await screen.findByRole('dialog');
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet ve çık' }));
    await waitFor(() => expect(api.save).toHaveBeenCalledTimes(1));
    expect(router.state.location.pathname).toBe('/edit');
  });
});
