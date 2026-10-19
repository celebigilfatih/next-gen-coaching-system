import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlanAttendance } from './plan-attendance';

const api = vi.hoisted(() => ({ page: vi.fn(), mark: vi.fn(), role: 'COACH' }));
vi.mock('../lib/api', () => ({
  getPlanAttendancePage: api.page,
  markAttendance: api.mark,
}));
vi.mock('../lib/session', () => ({
  getSession: () => ({ user: { role: api.role } }),
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn() } }));
const item = (id: string, status: 'PRESENT' | 'ABSENT' | null = null) => ({
  id,
  playerId: `p-${id}`,
  name: `Player ${id}`,
  status,
});
const page = (
  items = [item('a')],
  nextCursor: string | null = 'a',
  presentTotal = 12,
) => ({ items, total: 30, presentTotal, limit: 25, nextCursor });
describe('independent paged plan attendance', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    api.role = 'COACH';
    api.page.mockResolvedValue(page());
    api.mark.mockResolvedValue({});
  });
  it('uses full totals, retries the same cursor and preserves empty continuation navigation', async () => {
    api.page
      .mockResolvedValueOnce(page())
      .mockRejectedValueOnce(new Error('Read failed'))
      .mockResolvedValueOnce(page([], null));
    render(<PlanAttendance planId="plan" />);
    expect(screen.getByLabelText('Katılım yükleniyor')).toBeInTheDocument();
    await screen.findByText('Katılım · 12/30');
    fireEvent.click(screen.getByRole('button', { name: 'Sonraki sayfa' }));
    await screen.findByText('Read failed');
    expect(screen.queryByText('Player a')).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: 'Katılımı tekrar yükle' }),
    );
    await screen.findByText(/Bu sayfada oyuncu yok/);
    expect(api.page).toHaveBeenLastCalledWith('plan', 'a');
    expect(screen.getByRole('button', { name: 'Önceki sayfa' })).toBeEnabled();
    await screen.findByText('Katılım · 12/30');
  });
  it('serializes explicit writes, re-reads totals and never marks another page player', async () => {
    let done!: () => void;
    api.mark.mockReturnValue(
      new Promise<void>((resolve) => {
        done = resolve;
      }),
    );
    api.page
      .mockResolvedValueOnce(page())
      .mockResolvedValueOnce(page([item('z')], null))
      .mockResolvedValueOnce(page([item('z', 'PRESENT')], null, 13));
    render(<PlanAttendance planId="plan" />);
    await screen.findByText('Player a');
    fireEvent.click(screen.getByRole('button', { name: 'Sonraki sayfa' }));
    const player = await screen.findByRole('button', { name: 'Player z' });
    fireEvent.click(player);
    fireEvent.click(player);
    expect(api.mark).toHaveBeenCalledTimes(1);
    expect(api.mark).toHaveBeenCalledWith({
      planId: 'plan',
      playerId: 'p-z',
      status: 'PRESENT',
    });
    expect(player).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Önceki sayfa' })).toBeDisabled();
    await act(async () => done());
    await screen.findByText('Katılım · 13/30');
    expect(api.page).toHaveBeenLastCalledWith('plan', 'a');
    expect(screen.getByRole('button', { name: 'Player z' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
  it('handles write failure without optimistic success or automatic repeat', async () => {
    api.mark.mockRejectedValue(new Error('network'));
    render(<PlanAttendance planId="plan" />);
    fireEvent.click(await screen.findByRole('button', { name: 'Player a' }));
    await screen.findByText(/Katılım kaydı doğrulanamadı/);
    expect(screen.getByRole('button', { name: 'Player a' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(screen.getByRole('button', { name: 'Player a' })).toBeDisabled();
    fireEvent.click(
      screen.getByRole('button', { name: 'Güncel katılımı yükle' }),
    );
    await waitFor(() => expect(api.page).toHaveBeenCalledTimes(2));
    expect(api.mark).toHaveBeenCalledTimes(1);
  });
  it('does not repeat a successful write when post-write read fails', async () => {
    api.page
      .mockResolvedValueOnce(page([item('a', 'PRESENT')]))
      .mockRejectedValueOnce(new Error('Refresh failed'))
      .mockResolvedValueOnce(page([item('a', 'ABSENT')], null, 11));
    render(<PlanAttendance planId="plan" />);
    fireEvent.click(await screen.findByRole('button', { name: 'Player a' }));
    await screen.findByText('Refresh failed');
    expect(api.mark).toHaveBeenCalledWith({
      planId: 'plan',
      playerId: 'p-a',
      status: 'ABSENT',
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Katılımı tekrar yükle' }),
    );
    await screen.findByText('Katılım · 11/30');
    expect(api.mark).toHaveBeenCalledTimes(1);
  });
  it('drops late responses after scope/plan remount', async () => {
    let resolveOld!: (value: unknown) => void;
    api.page
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveOld = resolve;
        }),
      )
      .mockResolvedValueOnce(page([item('new')], null));
    const view = render(<PlanAttendance key="old" planId="old" />);
    await waitFor(() =>
      expect(api.page).toHaveBeenCalledWith('old', undefined),
    );
    view.rerender(<PlanAttendance key="new" planId="new" />);
    await screen.findByText('Player new');
    await act(async () => resolveOld(page([item('old')])));
    expect(screen.queryByText('Player old')).not.toBeInTheDocument();
  });
  it('renders real zero and player self attendance without write controls', async () => {
    api.role = 'PLAYER';
    api.page
      .mockResolvedValueOnce({ ...page([], null, 0), total: 0 })
      .mockResolvedValueOnce({
        ...page([item('self', 'PRESENT')], null, 1),
        total: 1,
      });
    const view = render(<PlanAttendance key="empty" planId="empty" />);
    await screen.findByText('Katılım · 0/0');
    view.rerender(<PlanAttendance key="self" planId="self" />);
    const self = await screen.findByRole('button', { name: 'Player self' });
    expect(self).toBeDisabled();
    expect(self).toHaveAttribute('aria-pressed', 'true');
    expect(api.mark).not.toHaveBeenCalled();
  });
});
