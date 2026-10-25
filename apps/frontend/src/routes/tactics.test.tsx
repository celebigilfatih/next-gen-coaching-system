import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TacticsRoute from './tactics';

const mocks = vi.hoisted(() => ({
  page: vi.fn(),
  reload: vi.fn(),
  workspace: {
    group: { id: 'g', name: 'U17' } as { id: string; name: string } | null,
    scope: { clubId: 'c', clubSeasonId: 'cs', teamId: 't' },
    loading: false,
    error: '',
  },
}));
vi.mock('../lib/api', () => ({ getTacticalDrillPage: mocks.page }));
vi.mock('../lib/workspace-context', () => ({
  useWorkspace: () => ({
    ...mocks.workspace,
    reload: mocks.reload,
    get drills() {
      throw new Error('Tactics must not read the shared drill array');
    },
  }),
}));
function page(title = 'Board', cursor: string | null = 'cursor') {
  return {
    items: [
      {
        id: title,
        title,
        scope: 'GLOBAL',
        category: 'WARM_UP',
        ageGroup: 'U18',
        durationMin: 20,
        isBoard: true,
      },
    ],
    total: 31,
    nextCursor: cursor,
    limit: 25,
  };
}
function Harness() {
  return (
    <MemoryRouter>
      <TacticsRoute />
    </MemoryRouter>
  );
}
describe('independent tactical catalog', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.workspace = {
      group: { id: 'g', name: 'U17' },
      scope: { clubId: 'c', clubSeasonId: 'cs', teamId: 't' },
      loading: false,
      error: '',
    };
    mocks.page.mockImplementation(async (_group, after) =>
      page(after ? 'Second' : 'First', after ? null : 'cursor'),
    );
  });
  it('renders the compact match-style catalog with authoritative totals', async () => {
    render(<Harness />);
    await screen.findByText('First');
    expect(
      screen.getByRole('heading', { name: 'Taktik Tahtası' }),
    ).toBeInTheDocument();
    expect(document.querySelector('.page-hero-image')).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Taktik Çalışmaları' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Taktik kapsamı özeti')).toHaveTextContent(
      '31 taktik egzersizi',
    );
    expect(
      screen.getByRole('table', { name: 'Taktik egzersizleri' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Çalışma' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/NGCS JSON içe aktarım/)).toBeInTheDocument();
  });
  it('uses full totals and scoped register links across pages without filtering by category', async () => {
    render(<Harness />);
    await screen.findByText('First');
    expect(screen.getByLabelText('Taktik kapsamı özeti')).toHaveTextContent(
      '31 taktik egzersizi',
    );
    expect(screen.getByRole('link', { name: /First/ })).toHaveAttribute(
      'href',
      '/app/tactics/First',
    );
    expect(screen.getByText('Kopyala ve düzenle')).toBeInTheDocument();
    expect(screen.getByText(/Isınma/)).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /First/ })).toHaveTextContent(
      '20 dk',
    );
    expect(
      document.querySelector('[data-slot="football-card-preview"]'),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sonraki sayfa' }));
    await screen.findByText('Second');
    expect(screen.queryByText('First')).not.toBeInTheDocument();
    expect(mocks.page).toHaveBeenLastCalledWith('g', 'cursor');
    expect(screen.getByRole('navigation')).toHaveTextContent(
      'Sayfa 2 · 1 / 31',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Önceki sayfa' }));
    await screen.findByText('First');
  });
  it('resets scope and discards an old team response', async () => {
    let resolve!: (value: ReturnType<typeof page>) => void;
    mocks.page.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const view = render(<Harness />);
    await waitFor(() => expect(mocks.page).toHaveBeenCalledTimes(1));
    mocks.workspace.group = { id: 'new-group', name: 'U19' };
    mocks.workspace.scope.teamId = 'new-team';
    view.rerender(<Harness />);
    await screen.findByText('First');
    expect(mocks.page).toHaveBeenLastCalledWith('new-group', undefined);
    await act(async () => resolve(page('Stale')));
    expect(screen.queryByText('Stale')).not.toBeInTheDocument();
    mocks.workspace.scope.clubSeasonId = '*';
    view.rerender(<Harness />);
    expect(screen.queryByText('First')).not.toBeInTheDocument();
    await screen.findByText('First');
    expect(screen.getByRole('button', { name: 'Önceki sayfa' })).toBeDisabled();
  });
  it('distinguishes loading and failure, retries a failed continuation and allows returning', async () => {
    render(<Harness />);
    expect(
      screen.getByLabelText('Taktik egzersizler yükleniyor'),
    ).toBeInTheDocument();
    await screen.findByText('First');
    mocks.page.mockRejectedValueOnce(new Error('Taktik alınamadı'));
    fireEvent.click(screen.getByRole('button', { name: 'Sonraki sayfa' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Taktik alınamadı',
    );
    expect(
      screen.queryByText('Henüz taktik egzersizi yok'),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Önceki sayfa' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Tekrar dene' }));
    await screen.findByText('Second');
    expect(mocks.reload).not.toHaveBeenCalled();
  });
  it('does not fetch for loading, failed or missing workspace', async () => {
    mocks.workspace.loading = true;
    const view = render(<Harness />);
    expect(
      screen.getByLabelText('Taktik kapsamı yükleniyor'),
    ).toBeInTheDocument();
    mocks.workspace.loading = false;
    mocks.workspace.error = 'Workspace failed';
    view.rerender(<Harness />);
    expect(screen.getByRole('alert')).toHaveTextContent('Workspace failed');
    fireEvent.click(screen.getByRole('button', { name: 'Tekrar dene' }));
    expect(mocks.reload).toHaveBeenCalledTimes(1);
    mocks.workspace.error = '';
    mocks.workspace.group = null;
    view.rerender(<Harness />);
    expect(
      screen.getByText(/taktik egzersiz bağlamı bulunmuyor/),
    ).toBeInTheDocument();
    expect(mocks.page).not.toHaveBeenCalled();
  });
  it('distinguishes empty continuation from an empty library and retains create actions', async () => {
    render(<Harness />);
    await screen.findByText('First');
    mocks.page.mockResolvedValueOnce({
      ...page(),
      items: [],
      nextCursor: null,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sonraki sayfa' }));
    await screen.findByText('Bu sayfada taktik egzersizi yok.');
    expect(screen.getByLabelText('Taktik kapsamı özeti')).toHaveTextContent(
      '31',
    );
    expect(
      screen.queryByText('Henüz taktik egzersizi yok'),
    ).not.toBeInTheDocument();
    mocks.page.mockResolvedValueOnce({
      ...page(),
      items: [],
      total: 0,
      nextCursor: null,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Önceki sayfa' }));
    await screen.findByText('Henüz taktik egzersizi yok');
    expect(screen.getByLabelText('Taktik kapsamı özeti')).toHaveTextContent(
      '0 taktik',
    );
    expect(screen.getByRole('link', { name: 'Tahta oluştur' })).toHaveAttribute(
      'href',
      '/app/tactics/new',
    );
  });
});
