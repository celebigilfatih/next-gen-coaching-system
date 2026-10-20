import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import AppLayout from './app-layout';
import HomeRoute from './home';
import AppIndex from './app-index';

const session = vi.hoisted(() => ({
  user: { name: 'Test Coach', email: 'coach@example.test', role: 'COACH' },
}));
vi.mock('../lib/session', () => ({
  getSession: () => session,
  subscribeSession: () => () => {},
}));
vi.mock('../lib/api', () => ({ logout: vi.fn() }));
vi.mock('../lib/workspace-context', () => ({
  WorkspaceProvider: ({ children }: { children: ReactNode }) => children,
  useWorkspace: () => ({ club: { name: 'Test Club' } }),
}));
vi.mock('../components/workspace-scope-selector', () => ({
  WorkspaceScopeSelector: () => <div aria-label="Çalışma kapsamı" />,
}));
vi.mock('../components/match-notifications', () => ({
  MatchNotifications: () => <button>Bildirimler</button>,
}));

function show(path = '/app/dashboard') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<AppIndex />} />
          <Route path="dashboard" element={<h1>Dashboard destination</h1>} />
          <Route path="trainings" element={<h1>Training destination</h1>} />
          <Route path="teams/first-team" element={<h1>First team</h1>} />
          <Route path="teams/academy" element={<h1>Academy</h1>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('reference shell navigation', () => {
  afterEach(() => {
    session.user.role = 'COACH';
  });

  it.each(['/', '/app'])(
    'lands %s on Dashboard while preserving the Week link',
    async (path) => {
      show(path);
      await screen.findByRole('heading', { name: 'Dashboard destination' });
      const nav = screen.getByRole('navigation', { name: 'Ana navigasyon' });
      expect(
        within(nav).getByRole('link', { name: 'Ana Sayfa' }),
      ).toHaveAttribute('aria-current', 'page');
      expect(within(nav).getByRole('link', { name: 'Hafta' })).toHaveAttribute(
        'href',
        '/app/week',
      );
      expect(within(nav).getAllByRole('link')).toHaveLength(12);
      expect(
        within(nav).getByRole('link', { name: 'A Takım' }),
      ).toHaveAttribute('href', '/app/teams/first-team');
      expect(
        within(nav).getByRole('link', { name: 'Altyapı' }),
      ).toHaveAttribute('href', '/app/teams/academy');
      expect(screen.getByText('Test Club')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Kullanıcı menüsü' }),
      ).toHaveTextContent('Test Coach');
    },
  );
  it.each([{ ctrlKey: true }, { metaKey: true }])(
    'focuses menu-only search with the keyboard shortcut %j',
    (modifiers) => {
      show();
      fireEvent.keyDown(window, { key: 'k', ...modifiers });
      expect(
        screen.getByRole('textbox', { name: 'Menülerde ara' }),
      ).toHaveFocus();
      fireEvent.change(screen.getByRole('textbox', { name: 'Menülerde ara' }), {
        target: { value: 'Antrenmanlar' },
      });
      fireEvent.submit(screen.getByRole('search'));
      expect(
        screen.getByRole('heading', { name: 'Training destination' }),
      ).toBeInTheDocument();
    },
  );
  it('preserves five mobile tasks and the accessible Sheet with all routes', () => {
    show();
    // Structural coverage: jsdom does not apply responsive media queries.
    // Real narrow-viewport visibility remains a separate browser QA gate.
    const mobile = screen.getByLabelText('Mobil ana navigasyon');
    expect(within(mobile).getAllByRole('link', { hidden: true })).toHaveLength(
      5,
    );
    fireEvent.click(screen.getByLabelText('Menüyü aç'));
    const dialog = screen.getByRole('dialog', { name: 'NGCS' });
    expect(
      within(dialog).getByRole('link', { name: 'Ana Sayfa' }),
    ).toHaveAttribute('href', '/app/dashboard');
    expect(within(dialog).getAllByRole('link')).toHaveLength(12);
  });

  it('shows account administration only to administrative roles', () => {
    session.user.role = 'SYSTEM_ADMIN';
    show();
    expect(
      screen.getByRole('link', { name: 'Kullanıcılar ve Yetkiler' }),
    ).toHaveAttribute('href', '/app/settings/users');
  });

  it.each([
    ['/app/teams/first-team', 'A Takım', 'Altyapı'],
    ['/app/teams/academy', 'Altyapı', 'A Takım'],
  ])(
    'marks only the selected team destination active at %s',
    (path, active, inactive) => {
      show(path);
      expect(screen.getByRole('link', { name: active })).toHaveAttribute(
        'aria-current',
        'page',
      );
      expect(screen.getByRole('link', { name: inactive })).not.toHaveAttribute(
        'aria-current',
      );
    },
  );
});
