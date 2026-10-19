import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LibraryRoute from './library';
import { useDrillCatalogFilters } from '../components/drill-catalog-filters';
const mocks = vi.hoisted(() => ({
  page: vi.fn(),
  filtered: vi.fn(),
  content: vi.fn(),
  workspace: {
    group: { id: 'g', name: 'U17' } as { id: string; name: string } | null,
    scope: { clubId: 'c', clubSeasonId: 'cs', teamId: 't' },
    loading: false,
    error: '',
  },
}));
vi.mock('../lib/api', () => ({
  getDrillPage: mocks.page,
  getFilteredDrillPage: mocks.filtered,
  getDrillContent: mocks.content,
}));
vi.mock('../lib/workspace-context', () => ({
  useWorkspace: () => ({
    ...mocks.workspace,
    get drills() {
      throw new Error('Library cannot read the full shared drill array');
    },
  }),
}));
const page = (title: string, nextCursor: string | null = null) => ({
  items: [
    {
      id: title,
      title,
      category: 'TACTICAL',
      durationMin: 20,
      scope: 'GLOBAL',
      difficulty: 'EASY',
      isBoard: true,
      ageGroup: 'U16',
    },
  ],
  total: 31,
  ageGroup: 'U18',
  limit: 25,
  nextCursor,
});
function Harness() {
  return (
    <MemoryRouter>
      <LibraryRoute />
    </MemoryRouter>
  );
}
describe('independent drill library', () => {
  it('keeps the active server query stable while search text is being typed', () => {
    vi.useFakeTimers();
    try {
      const { result } = renderHook(() => useDrillCatalogFilters());
      const original = result.current.filters;
      act(() => result.current.setDraft({ q: 'pa' }));
      expect(result.current.filters).toBe(original);
      act(() => result.current.setDraft({ q: 'pas' }));
      expect(result.current.filters).toBe(original);
      act(() => vi.advanceTimersByTime(250));
      expect(result.current.filters.q).toBe('pas');
    } finally {
      vi.useRealTimers();
    }
  });
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.workspace = {
      group: { id: 'g', name: 'U17' },
      scope: { clubId: 'c', clubSeasonId: 'cs', teamId: 't' },
      loading: false,
      error: '',
    };
    mocks.page.mockImplementation(async (_g, category, after) =>
      page(category ?? (after ? 'Second' : 'First'), after ? null : 'cursor'),
    );
    mocks.filtered.mockImplementation(async () => page('Filtered'));
  });
  it('renders the compact register with verified totals and categories', async () => {
    render(<Harness />);
    await screen.findByText('First');
    expect(
      screen.getByRole('heading', { name: 'Egzersiz Kütüphanesi' }),
    ).toBeInTheDocument();
    expect(document.querySelector('.page-hero-image')).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Antrenman İçerikleri' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Egzersiz kapsamı özeti')).toHaveTextContent(
      '31 egzersiz',
    );
    expect(screen.getByRole('tab', { name: 'Tümü' })).toBeInTheDocument();
    expect(screen.queryByText(/sağlık|scouting/i)).not.toBeInTheDocument();
  });
  it('uses scalar board markers and full filtered totals while replacing pages', async () => {
    render(<Harness />);
    await screen.findByText('First');
    expect(screen.getByLabelText('Egzersiz kapsamı özeti')).toHaveTextContent(
      '31 egzersiz',
    );
    expect(screen.getByRole('link', { name: 'First' })).toHaveAttribute(
      'href',
      '/app/library/First',
    );
    expect(
      screen.getByRole('button', { name: 'First önizle' }),
    ).toBeInTheDocument();
    expect(mocks.content).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Sonraki sayfa' }));
    await screen.findByText('Second');
    expect(screen.queryByText('First')).not.toBeInTheDocument();
    expect(
      screen.getByRole('navigation', {
        name: 'Egzersiz sayfaları',
      }),
    ).toHaveTextContent('Sayfa 2 · 1 / 31 egzersiz');
    expect(mocks.page).toHaveBeenLastCalledWith('g', undefined, 'cursor');
    fireEvent.click(screen.getByRole('button', { name: 'Önceki sayfa' }));
    await screen.findByText('First');
  });
  it('filters on the server and resets pagination when switching category', async () => {
    render(<Harness />);
    await screen.findByText('First');
    fireEvent.click(screen.getByRole('button', { name: 'Sonraki sayfa' }));
    await screen.findByText('Second');
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Teknik' }), {
      button: 0,
      ctrlKey: false,
    });
    await screen.findByText('TECHNICAL');
    expect(mocks.page).toHaveBeenLastCalledWith('g', 'TECHNICAL', undefined);
    expect(screen.getByRole('button', { name: 'Önceki sayfa' })).toBeDisabled();
  });
  it('applies source filters on the server and exposes mobile filter controls', async () => {
    render(<Harness />);
    await screen.findByText('First');
    fireEvent.click(screen.getByRole('button', { name: 'NGCS' }));
    await screen.findByText('Filtered');
    expect(mocks.filtered).toHaveBeenLastCalledWith(
      'g',
      undefined,
      expect.objectContaining({ source: 'NGCS' }),
      undefined,
    );
    expect(
      screen.getByRole('button', { name: 'Filtreler' }),
    ).toBeInTheDocument();
  });
  it('rejects stale results after scope changes and resets category', async () => {
    let resolve!: (value: ReturnType<typeof page>) => void;
    mocks.page.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const view = render(<Harness />);
    await waitFor(() => expect(mocks.page).toHaveBeenCalledTimes(1));
    mocks.workspace.group = { id: 'new', name: 'New' };
    mocks.workspace.scope.teamId = 'new';
    view.rerender(<Harness />);
    await screen.findByText('First');
    expect(mocks.page).toHaveBeenLastCalledWith('new', undefined, undefined);
    await act(async () => resolve(page('Stale')));
    expect(screen.queryByText('Stale')).not.toBeInTheDocument();
  });
  it('distinguishes failed pages from emptiness and retries without losing previous navigation', async () => {
    render(<Harness />);
    expect(screen.getByLabelText('Egzersizler yükleniyor')).toBeInTheDocument();
    await screen.findByText('First');
    mocks.page.mockRejectedValueOnce(new Error('Failed'));
    fireEvent.click(screen.getByRole('button', { name: 'Sonraki sayfa' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Failed');
    expect(
      screen.queryByText('Bu kategoride egzersiz yok'),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Önceki sayfa' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Tekrar dene' }));
    await screen.findByText('Second');
  });
  it('does not fetch for missing/loading/failed scope and links plain exercises to their details', async () => {
    mocks.workspace.loading = true;
    const view = render(<Harness />);
    mocks.workspace.loading = false;
    mocks.workspace.error = 'Workspace failed';
    view.rerender(<Harness />);
    expect(screen.getByRole('alert')).toHaveTextContent('Workspace failed');
    mocks.workspace.error = '';
    mocks.workspace.group = null;
    view.rerender(<Harness />);
    expect(mocks.page).not.toHaveBeenCalled();
    mocks.workspace.group = { id: 'g', name: 'U17' };
    mocks.page.mockResolvedValue({
      ...page('Plain'),
      items: [{ ...page('Plain').items[0], isBoard: false }],
    });
    view.rerender(<Harness />);
    await screen.findByText('Plain');
    expect(
      screen.getByRole('button', { name: 'Plain önizle' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Plain' })).toHaveAttribute(
      'href',
      '/app/library/Plain',
    );
  });
  it('loads preview only on demand with the resolved catalog age and returns focus', async () => {
    mocks.content.mockResolvedValue({ version: null, variant: null });
    render(<Harness />);
    const trigger = await screen.findByRole('button', { name: 'First önizle' });
    expect(mocks.content).not.toHaveBeenCalled();
    fireEvent.click(trigger);
    expect(
      await screen.findByText(
        'Bu eski kaydın profesyonel içerik ayrıntıları bulunmuyor.',
      ),
    ).toBeInTheDocument();
    expect(mocks.content).toHaveBeenCalledWith('First', 'U18');
    expect(
      screen.getByRole('link', { name: 'Egzersiz detayını aç' }),
    ).toHaveAttribute('href', '/app/library/First');
    fireEvent.click(screen.getByRole('button', { name: 'Önizlemeyi kapat' }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
  });
  it('keeps one search outside the filter panel and combines advanced filters with source', async () => {
    render(<Harness />);
    await screen.findByText('First');
    fireEvent.click(screen.getByRole('button', { name: 'NGCS' }));
    await screen.findByText('Filtered');
    fireEvent.click(screen.getByRole('button', { name: 'Filtreler' }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Yaş grubu' }), {
      target: { value: 'U14' },
    });
    await waitFor(() =>
      expect(mocks.filtered).toHaveBeenLastCalledWith(
        'g',
        undefined,
        expect.objectContaining({ source: 'NGCS', ageGroup: 'U14' }),
        undefined,
      ),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Sonuçları göster' }));
    expect(
      screen.getAllByRole('textbox', { name: 'Egzersiz ara' }),
    ).toHaveLength(1);
    fireEvent.change(screen.getByRole('textbox', { name: 'Egzersiz ara' }), {
      target: { value: 'pas' },
    });
    await waitFor(() =>
      expect(mocks.filtered).toHaveBeenLastCalledWith(
        'g',
        undefined,
        expect.objectContaining({ source: 'NGCS', ageGroup: 'U14', q: 'pas' }),
        undefined,
      ),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Tümünü temizle' }));
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Egzersiz ara' })).toHaveValue(
        '',
      ),
    );
  });
});
