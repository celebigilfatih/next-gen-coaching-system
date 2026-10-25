import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PlayersRoute from './players';

const mocks = vi.hoisted(() => ({
  page: vi.fn(),
  workspace: {
    team: { id: 'team-a', name: 'U17' },
    club: { id: 'club-a' },
    clubSeason: { id: 'season-a' },
    loading: false,
    error: '',
  },
}));
vi.mock('../lib/api', () => ({ getSportingPlayerPage: mocks.page }));
vi.mock('../lib/workspace-context', () => ({
  useWorkspace: () => mocks.workspace,
}));
const player = (id: string) => ({
  id,
  displayName: id,
  playerProfile: { primaryPosition: null, preferredFoot: null },
  assignments: [],
});
const page = (name: string, nextCursor: string | null = null) => ({
  items: [player(name)],
  nextCursor,
  limit: 25,
  total: 1,
  summary: {
    total: 1,
    positions: {
      KALECI: 0,
      DEFANS: 0,
      ORTA_SAHA: 0,
      FORVET: 0,
      UNASSIGNED: 1,
    },
  },
});
const emptyPage = () => ({
  items: [],
  nextCursor: null,
  limit: 25,
  total: 0,
  summary: {
    total: 0,
    positions: {
      KALECI: 0,
      DEFANS: 0,
      ORTA_SAHA: 0,
      FORVET: 0,
      UNASSIGNED: 0,
    },
  },
});
function renderRoute() {
  return render(
    <MemoryRouter>
      <PlayersRoute />
    </MemoryRouter>,
  );
}

describe('player server pagination', () => {
  beforeEach(() => {
    mocks.page.mockReset();
    mocks.workspace = {
      team: { id: 'team-a', name: 'U17' },
      club: { id: 'club-a' },
      clubSeason: { id: 'season-a' },
      loading: false,
      error: '',
    };
  });
  it('shows named loading with disabled pagination, not a premature empty result', async () => {
    let resolve!: (value: ReturnType<typeof page>) => void;
    mocks.page.mockReturnValueOnce(
      new Promise((done) => {
        resolve = done;
      }),
    );
    renderRoute();
    await waitFor(() => expect(mocks.page).toHaveBeenCalledOnce());
    expect(
      screen.getByRole('status', { name: 'Oyuncular yükleniyor' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Oyuncu bulunamadı')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Önceki sayfa' })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Sonraki sayfa' }),
    ).toBeDisabled();
    await act(async () => resolve(page('Loaded')));
    expect(
      document.querySelector('.player-operations-reference__hero'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Kadro özeti')).toHaveTextContent(
      '1 toplam oyuncu',
    );
    expect(
      screen.queryByRole('status', { name: 'Oyuncular yükleniyor' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Sayfa 1 · 1 / 1 sonuç')).toBeInTheDocument();
  });
  it('keeps a failed continuation recoverable at the same cursor without stale counts', async () => {
    mocks.page
      .mockResolvedValueOnce(page('First', 'cursor-a'))
      .mockRejectedValueOnce(new Error('Forbidden'))
      .mockResolvedValueOnce(page('Recovered'));
    renderRoute();
    await screen.findByText('First');
    fireEvent.click(screen.getByRole('button', { name: 'Sonraki sayfa' }));
    await screen.findByText('Forbidden');
    expect(screen.getByRole('alert')).toHaveTextContent('Oyuncular alınamadı');
    expect(screen.queryByText('First')).not.toBeInTheDocument();
    expect(screen.queryByText(/oyuncu gösteriliyor/)).not.toBeInTheDocument();
    expect(screen.queryByText('Oyuncu bulunamadı')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Önceki sayfa' })).toBeEnabled();
    expect(
      screen.getByRole('button', { name: 'Sonraki sayfa' }),
    ).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Tekrar dene' }));
    await screen.findByText('Recovered');
    expect(mocks.page.mock.calls[1]).toEqual(mocks.page.mock.calls[2]);
    expect(mocks.page.mock.calls[2][0].after).toBe('cursor-a');
  });
  it('keeps workspace failure separate and does not invent a directory retry', () => {
    mocks.workspace.error = 'Workspace forbidden';
    renderRoute();
    expect(screen.getByRole('alert')).toHaveTextContent('Workspace forbidden');
    expect(
      screen.queryByRole('button', { name: 'Tekrar dene' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Oyuncu bulunamadı')).not.toBeInTheDocument();
    expect(mocks.page).not.toHaveBeenCalled();
  });
  it('keeps previous navigation on an empty continuation and reports only shown count', async () => {
    mocks.page
      .mockResolvedValueOnce(page('First', 'cursor-a'))
      .mockResolvedValueOnce(emptyPage())
      .mockResolvedValueOnce(page('First'));
    renderRoute();
    await screen.findByText('First');
    fireEvent.click(screen.getByRole('button', { name: 'Sonraki sayfa' }));
    await screen.findByText('Takımda oyuncu yok');
    expect(screen.getByText('Sayfa 2 · 0 / 0 sonuç')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Önceki sayfa' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Önceki sayfa' }));
    await screen.findByText('First');
    expect(mocks.page.mock.calls[2][0].after).toBeUndefined();
  });
  it('loads next/previous pages and searches beyond the currently loaded page', async () => {
    mocks.page
      .mockResolvedValueOnce(page('First', 'cursor-a'))
      .mockResolvedValueOnce(page('Second'))
      .mockResolvedValueOnce(page('First', 'cursor-a'))
      .mockResolvedValueOnce(page('Remote search result'));
    renderRoute();
    expect(await screen.findByText('First')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Önceki sayfa' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Sonraki sayfa' }));
    expect(await screen.findByText('Second')).toBeInTheDocument();
    expect(mocks.page).toHaveBeenLastCalledWith(
      expect.objectContaining({ after: 'cursor-a' }),
    );
    expect(screen.queryByText('First')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Sonraki sayfa' }),
    ).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Önceki sayfa' }));
    await screen.findByText('First');
    fireEvent.change(screen.getByLabelText('Oyuncu ara'), {
      target: { value: 'Remote' },
    });
    expect(await screen.findByText('Remote search result')).toBeInTheDocument();
    expect(mocks.page).toHaveBeenLastCalledWith(
      expect.objectContaining({ q: 'Remote', after: undefined }),
    );
  });
  it('sends URL-backed position and name sorting to the server', async () => {
    mocks.page.mockResolvedValue(page('Deniz'));
    renderRoute();
    await screen.findByText('Deniz');
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Profili aç/ })).toHaveAttribute(
      'href',
      '/app/players/Deniz',
    );
    fireEvent.change(screen.getByLabelText('Pozisyona göre filtrele'), {
      target: { value: 'DEFANS' },
    });
    await waitFor(() =>
      expect(mocks.page).toHaveBeenLastCalledWith(
        expect.objectContaining({
          position: 'DEFANS',
          sort: 'NAME_ASC',
          after: undefined,
        }),
      ),
    );
    fireEvent.change(screen.getByLabelText('Oyuncuları sırala'), {
      target: { value: 'NAME_DESC' },
    });
    await waitFor(() =>
      expect(mocks.page).toHaveBeenLastCalledWith(
        expect.objectContaining({ position: 'DEFANS', sort: 'NAME_DESC' }),
      ),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Filtreleri temizle' }));
    await waitFor(() =>
      expect(mocks.page).toHaveBeenLastCalledWith(
        expect.objectContaining({ position: undefined, sort: 'NAME_ASC' }),
      ),
    );
  });
  it('resets scope and ignores an old pending response', async () => {
    let resolveOld!: (value: ReturnType<typeof page>) => void;
    mocks.page
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveOld = resolve;
        }),
      )
      .mockResolvedValueOnce(page('New scope'));
    const view = renderRoute();
    await waitFor(() => expect(mocks.page).toHaveBeenCalledTimes(1));
    mocks.workspace = {
      ...mocks.workspace,
      team: { id: 'team-b', name: 'U19' },
    };
    view.rerender(
      <MemoryRouter>
        <PlayersRoute />
      </MemoryRouter>,
    );
    await screen.findByText('New scope');
    await act(async () => resolveOld(page('Old scope', 'old-cursor')));
    expect(screen.queryByText('Old scope')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Önceki sayfa' })).toBeDisabled();
  });
  it('distinguishes failures from empty results and retries the same request', async () => {
    mocks.page
      .mockRejectedValueOnce(new Error('Network unavailable'))
      .mockResolvedValueOnce(emptyPage());
    renderRoute();
    await screen.findByText('Network unavailable');
    expect(screen.queryByText('Oyuncu bulunamadı')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tekrar dene' }));
    await screen.findByText('Takımda oyuncu yok');
    expect(mocks.page.mock.calls[0]).toEqual(mocks.page.mock.calls[1]);
  });
});
