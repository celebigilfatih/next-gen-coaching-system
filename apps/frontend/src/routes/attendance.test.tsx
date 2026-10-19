import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AttendanceRoute from './attendance';
const mocks = vi.hoisted(() => ({
  page: vi.fn(),
  workspace: {
    group: { id: 'g', name: 'U17' } as { id: string; name: string } | null,
    season: { id: 's' } as { id: string } | undefined,
    scope: { clubId: 'c', clubSeasonId: 'cs', teamId: 't' },
    loading: false,
    error: '',
  },
}));
vi.mock('../lib/api', () => ({ getAttendancePlanPage: mocks.page }));
vi.mock('../lib/workspace-context', () => ({
  useWorkspace: () => ({
    ...mocks.workspace,
    get plans() {
      throw new Error('No shared plans');
    },
    get members() {
      throw new Error('Counts must be server-derived');
    },
  }),
}));
const page = (title: string, nextCursor: string | null = null) => ({
  items: [{ id: title, title, date: null, notes: null, presentCount: 32 }],
  nextCursor,
  summary: { total: 31, playerCount: 40, presentAttendance: 240 },
  limit: 25,
});
function Harness() {
  return (
    <MemoryRouter>
      <AttendanceRoute />
    </MemoryRouter>
  );
}
describe('bounded attendance catalog', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.workspace = {
      group: { id: 'g', name: 'U17' },
      season: { id: 's' },
      scope: { clubId: 'c', clubSeasonId: 'cs', teamId: 't' },
      loading: false,
      error: '',
    };
    mocks.page.mockImplementation(async (_g, _s, after) =>
      page(after ? 'Second' : 'First', after ? null : 'cursor'),
    );
  });
  it('uses full server player/plan totals and scalar attendance, pages independently and links drafts to detail', async () => {
    render(<Harness />);
    await screen.findByText('First');
    expect(
      document.querySelector('.attendance-reference__hero'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Toplam plan özeti')).toHaveTextContent('31');
    expect(screen.getByLabelText('Yoklama kapsamı özeti')).toHaveTextContent(
      '31 plan · 40 güncel oyuncu · 240 işaretlenmiş katılım',
    );
    expect(
      screen.getByText('32 katılım kaydı · 40 güncel oyuncu'),
    ).toBeInTheDocument();
    expect(screen.getByText('Tarih TBD')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Yoklamayı aç' })).toHaveAttribute(
      'href',
      '/app/trainings/First?tab=attendance',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Sonraki sayfa' }));
    await screen.findByText('Second');
    expect(screen.queryByText('First')).not.toBeInTheDocument();
    expect(screen.getByRole('navigation')).toHaveTextContent(
      'Sayfa 2 · 1 / 31 plan',
    );
    expect(mocks.page).toHaveBeenLastCalledWith('g', 's', 'cursor');
    fireEvent.click(screen.getByRole('button', { name: 'Önceki sayfa' }));
    await screen.findByText('First');
  });
  it('shows loading and errors instead of false empty totals and allows retry/previous after failure', async () => {
    render(<Harness />);
    expect(screen.getByLabelText('Yoklama yükleniyor')).toBeInTheDocument();
    await screen.findByText('First');
    mocks.page.mockRejectedValueOnce(new Error('Read failed'));
    fireEvent.click(screen.getByRole('button', { name: 'Sonraki sayfa' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Read failed');
    expect(
      screen.queryByText('Yoklama bekleyen plan yok'),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Önceki sayfa' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Tekrar dene' }));
    await screen.findByText('Second');
  });
  it('resets on scope changes and ignores late responses', async () => {
    let resolve!: (value: ReturnType<typeof page>) => void;
    mocks.page.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const view = render(<Harness />);
    await waitFor(() => expect(mocks.page).toHaveBeenCalledTimes(1));
    mocks.workspace.group = { id: 'new', name: 'U19' };
    mocks.workspace.scope.teamId = 'new';
    mocks.workspace.season = undefined;
    mocks.workspace.scope.clubSeasonId = '*';
    view.rerender(<Harness />);
    await screen.findByText('First');
    expect(mocks.page).toHaveBeenLastCalledWith('new', undefined, undefined);
    await act(async () => resolve(page('Stale')));
    expect(screen.queryByText('Stale')).not.toBeInTheDocument();
  });
  it('does not request without a usable workspace', async () => {
    mocks.workspace.loading = true;
    const view = render(<Harness />);
    mocks.workspace.loading = false;
    mocks.workspace.error = 'Workspace failed';
    view.rerender(<Harness />);
    expect(screen.getByRole('alert')).toHaveTextContent('Workspace failed');
    mocks.workspace.error = '';
    mocks.workspace.group = null;
    view.rerender(<Harness />);
    expect(
      screen.getByText(/antrenman bağlamı bulunmuyor/),
    ).toBeInTheDocument();
    expect(mocks.page).not.toHaveBeenCalled();
  });
  it('distinguishes a genuine empty catalog from an empty continuation', async () => {
    mocks.page
      .mockResolvedValueOnce(page('First', 'cursor'))
      .mockResolvedValue({ ...page('unused'), items: [] });
    render(<Harness />);
    await screen.findByText('First');
    fireEvent.click(screen.getByRole('button', { name: 'Sonraki sayfa' }));
    await screen.findByText('Bu sayfada plan yok');
    expect(screen.getByRole('navigation')).toHaveTextContent('0 / 31 plan');
    mocks.page.mockResolvedValue({
      ...page('unused'),
      items: [],
      summary: { total: 0, playerCount: 40, presentAttendance: 0 },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Önceki sayfa' }));
    await screen.findByText('Yoklama bekleyen plan yok');
  });
});
