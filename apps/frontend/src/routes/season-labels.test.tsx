import type { ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import AppLayout from './app-layout';
import WeekRoute from './week';
import DashboardRoute from './dashboard';
import SettingsRoute from './settings';

const mocks = vi.hoisted(() => ({
  workspace: {
    group: { id: 'g', name: 'U17', ageGroup: 'U17' },
    team: { id: 't', name: 'U17' },
    club: { id: 'c', name: 'Test Club' },
    season: undefined as { name: string } | undefined,
    clubSeason: undefined as { name: string } | undefined,
    scope: { clubId: 'c', teamId: 't', clubSeasonId: '*' },
    // Keep business reads disabled: this regression tests rendered scope labels.
    loading: true,
    error: '',
  },
  session: {
    user: {
      id: 'coach',
      name: 'Test Coach',
      email: 'coach@example.test',
      role: 'COACH',
    },
  },
}));
vi.mock('../lib/workspace-context', () => ({
  useWorkspace: () => mocks.workspace,
  WorkspaceProvider: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('../lib/session', () => ({
  getSession: () => mocks.session,
  subscribeSession: () => () => {},
}));
vi.mock('../components/workspace-scope-selector', () => ({
  WorkspaceScopeSelector: () => null,
}));
vi.mock('../components/match-notifications', () => ({
  MatchNotifications: () => null,
}));
vi.mock('../components/ui/sonner', () => ({ Toaster: () => null }));

function CurrentPath() {
  return <output aria-label="Current route">{useLocation().pathname}</output>;
}

it('names the user menu, returns keyboard focus and navigates to settings', async () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={['/app/dashboard']}>
      <AppLayout />
      <CurrentPath />
    </MemoryRouter>,
  );
  const trigger = screen.getByRole('button', { name: 'Kullanıcı menüsü' });
  expect(trigger.querySelector('.ngcs-user-details')).toHaveTextContent(
    'Test Coach',
  );
  expect(trigger.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  trigger.focus();
  await user.keyboard('{Enter}{Escape}');
  expect(trigger).toHaveFocus();
  await user.keyboard('{Enter}');
  expect(screen.getByRole('menuitem', { name: 'Ayarlar' })).toHaveFocus();
  await user.keyboard('{Enter}');
  expect(screen.getByLabelText('Current route')).toHaveTextContent(
    '/app/settings',
  );
});

it('focuses the existing navigation search with the documented keyboard shortcut', () => {
  render(
    <MemoryRouter initialEntries={['/app/dashboard']}>
      <AppLayout />
    </MemoryRouter>,
  );
  const search = screen.getByLabelText('Menülerde ara');
  fireEvent.keyDown(window, { key: 'k', metaKey: true });
  expect(search).toHaveFocus();
  expect(screen.getByRole('link', { name: 'Ana Sayfa' })).toHaveClass('active');
});

describe.each([
  ['week', WeekRoute, 'Sezon TBD'],
  ['settings', SettingsRoute, 'TBD'],
] as const)('%s scope label', (_surface, Component, missing) => {
  it('tracks selected → all → missing → selected without masking missing data', () => {
    mocks.workspace.scope.clubSeasonId = 'selected';
    mocks.workspace.season = { name: 'Legacy season' };
    mocks.workspace.clubSeason = { name: 'Club season' };
    const expectedName = 'Legacy season';
    const tree = () => (
      <MemoryRouter>
        <Component />
      </MemoryRouter>
    );
    const view = render(tree());
    const assertLabel = (label: string) =>
      expect(screen.getAllByText(new RegExp(label))).toHaveLength(
        _surface === 'settings' ? 2 : 1,
      );
    assertLabel(expectedName);

    mocks.workspace.scope.clubSeasonId = '*';
    mocks.workspace.season = undefined;
    mocks.workspace.clubSeason = undefined;
    view.rerender(tree());
    assertLabel('Tüm sezonlar');
    expect(screen.queryByText(/Sezon TBD/)).not.toBeInTheDocument();

    mocks.workspace.scope.clubSeasonId = 'missing-selected';
    view.rerender(tree());
    expect(screen.queryByText(/Tüm sezonlar/)).not.toBeInTheDocument();
    assertLabel(missing);

    mocks.workspace.scope.clubSeasonId = '';
    view.rerender(tree());
    expect(screen.queryByText(/Tüm sezonlar/)).not.toBeInTheDocument();
    assertLabel(missing);

    mocks.workspace.scope.clubSeasonId = 'selected';
    mocks.workspace.season = { name: 'Legacy season' };
    mocks.workspace.clubSeason = { name: 'Club season' };
    view.rerender(tree());
    assertLabel(expectedName);
    expect(screen.queryByText(/Tüm sezonlar/)).not.toBeInTheDocument();
  });
});

it('keeps club in the sidebar and avoids duplicating topbar scope labels in the Dashboard welcome', () => {
  const view = render(
    <MemoryRouter>
      <AppLayout />
    </MemoryRouter>,
  );
  expect(screen.getByText('Test Club')).toBeInTheDocument();
  expect(screen.queryByText('Sezon TBD')).not.toBeInTheDocument();
  view.unmount();
  render(
    <MemoryRouter>
      <DashboardRoute />
    </MemoryRouter>,
  );
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Koç');
  expect(screen.queryByText('Sezon TBD')).not.toBeInTheDocument();
  expect(screen.queryByText('Tüm sezonlar')).not.toBeInTheDocument();
});
