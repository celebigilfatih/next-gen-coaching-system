import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SettingsRoute from './settings';

const mocks = vi.hoisted(() => ({
  logout: vi.fn(),
  error: vi.fn(),
  persistent: true,
}));
vi.mock('../lib/api', () => ({ logout: mocks.logout }));
vi.mock('sonner', () => ({ toast: { error: mocks.error } }));
vi.mock('../lib/session', () => ({
  getSession: () => ({
    persistent: mocks.persistent,
    user: { name: 'Test Coach', email: 'coach@example.test', role: 'COACH' },
  }),
}));
vi.mock('../lib/workspace-context', () => ({
  useWorkspace: () => ({
    group: { name: 'U17', ageGroup: 'U17' },
    season: undefined,
    scope: { clubSeasonId: '*' },
  }),
}));

function renderSettings() {
  return render(
    <MemoryRouter initialEntries={['/app/settings']}>
      <Routes>
        <Route path="/app/settings" element={<SettingsRoute />} />
        <Route path="/login" element={<h1>Login</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}
describe('settings layout preserves account behavior', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.persistent = true;
  });
  it('preserves profile, workspace and both session descriptions', () => {
    const view = renderSettings();
    expect(screen.getByText('coach@example.test')).toBeInTheDocument();
    expect(screen.getAllByText('Tüm sezonlar')).toHaveLength(2);
    expect(screen.getByText('Güvenli oturum')).toBeInTheDocument();
    view.unmount();
    mocks.persistent = false;
    renderSettings();
    expect(screen.getByText('Geçici oturum')).toBeInTheDocument();
    expect(
      screen.getByText('Sayfa yenilendiğinde yeniden giriş gerekir.'),
    ).toBeInTheDocument();
  });
  it('waits for successful logout before navigating', async () => {
    let complete!: () => void;
    mocks.logout.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          complete = resolve;
        }),
    );
    renderSettings();
    await userEvent.click(screen.getByRole('button', { name: 'Çıkış yap' }));
    expect(
      screen.getByRole('heading', { name: 'Ayarlar' }),
    ).toBeInTheDocument();
    complete();
    expect(
      await screen.findByRole('heading', { name: 'Login' }),
    ).toBeInTheDocument();
    expect(mocks.logout).toHaveBeenCalledTimes(1);
  });
  it.each([new Error('Service unavailable'), 'unknown'])(
    'keeps the page and reports logout failure: %s',
    async (error) => {
      mocks.logout.mockRejectedValue(error);
      renderSettings();
      await userEvent.click(screen.getByRole('button', { name: 'Çıkış yap' }));
      await waitFor(() =>
        expect(mocks.error).toHaveBeenCalledWith(
          error instanceof Error ? error.message : 'Çıkış tamamlanamadı.',
        ),
      );
      expect(
        screen.getByRole('heading', { name: 'Ayarlar' }),
      ).toBeInTheDocument();
    },
  );
});
