import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AccountAccessRoute from './account-access';

const mocks = vi.hoisted(() => ({
  role: 'SYSTEM_ADMIN' as 'SYSTEM_ADMIN' | 'CLUB_ADMIN' | 'COACH' | 'PLAYER',
  getAccountPage: vi.fn(),
  createInvitation: vi.fn(),
  changeAccess: vi.fn(),
  setStatus: vi.fn(),
  issueReset: vi.fn(),
  revokeSessions: vi.fn(),
  listRoles: vi.fn(),
}));

vi.mock('../lib/session', () => ({
  getSession: () => ({
    token: 'token',
    user: {
      id: 'admin',
      name: 'Admin User',
      email: 'admin@example.test',
      role: mocks.role,
      clubId: mocks.role === 'SYSTEM_ADMIN' ? null : 'club-a',
    },
  }),
}));

vi.mock('../lib/workspace-context', () => ({
  useWorkspace: () => ({
    club: { id: 'club-a', name: 'NGCS Club' },
    loading: false,
    error: '',
  }),
}));

vi.mock('../lib/api', async (loadOriginal) => {
  const original = await loadOriginal<typeof import('../lib/api')>();
  return {
    ...original,
    getAccountPage: mocks.getAccountPage,
    createAccountInvitation: mocks.createInvitation,
    changeAccountAccess: mocks.changeAccess,
    setAccountStatus: mocks.setStatus,
    issueAccountPasswordReset: mocks.issueReset,
    revokeAccountSessions: mocks.revokeSessions,
    listSportingRoles: mocks.listRoles,
  };
});

const account = {
  id: 'coach-a',
  name: 'Coach A',
  email: 'coach@example.test',
  role: 'COACH' as const,
  status: 'ACTIVE' as const,
  clubId: 'club-a',
  club: { name: 'NGCS Club' },
  createdAt: '2026-09-08T12:00:00.000Z',
};

function page() {
  return {
    items: [account],
    nextCursor: null,
    limit: 25,
    total: 1,
    summary: { active: 1, suspended: 0 },
  };
}

function renderRoute() {
  return render(
    <MemoryRouter initialEntries={['/app/settings/users']}>
      <Routes>
        <Route path="/app/settings/users" element={<AccountAccessRoute />} />
        <Route path="/app/settings" element={<p>Ayarlar hedefi</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('account access management', () => {
  beforeEach(() => {
    mocks.role = 'SYSTEM_ADMIN';
    mocks.getAccountPage.mockReset().mockResolvedValue(page());
    mocks.createInvitation.mockReset().mockResolvedValue({
      invitation: {
        id: 'invite',
        email: 'new@example.test',
        role: 'COACH',
        clubId: 'club-a',
        expiresAt: '2026-09-09T12:00:00.000Z',
        createdAt: '2026-09-08T12:00:00.000Z',
      },
      delivery: { status: 'accepted' },
    });
    mocks.changeAccess.mockReset().mockResolvedValue(account);
    mocks.setStatus.mockReset().mockResolvedValue({
      ...account,
      status: 'SUSPENDED',
    });
    mocks.issueReset.mockReset();
    mocks.revokeSessions.mockReset();
    mocks.listRoles.mockReset().mockResolvedValue([
      {
        id: 'role-a',
        key: 'HEAD_COACH',
        name: 'Teknik direktör',
        systemKey: 'HEAD_COACH',
        capabilities: [{ capability: 'TEAM_VIEW' }],
      },
    ]);
  });

  it('renders a scoped safe account directory and both permission layers', async () => {
    renderRoute();

    expect(
      await screen.findByRole('heading', {
        name: 'Kullanıcılar ve Yetkiler',
      }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Coach A')).toBeInTheDocument();
    expect(screen.getByText('Sistem yöneticisi')).toBeInTheDocument();
    expect(await screen.findByText('Teknik direktör')).toBeInTheDocument();
    expect(screen.getByText('Takım görüntüleme')).toBeInTheDocument();
    expect(mocks.getAccountPage).toHaveBeenCalledWith(
      expect.objectContaining({ clubId: 'club-a' }),
    );
  });

  it('redirects operational roles away from administration', async () => {
    mocks.role = 'COACH';
    renderRoute();
    expect(await screen.findByText('Ayarlar hedefi')).toBeInTheDocument();
    expect(mocks.getAccountPage).not.toHaveBeenCalled();
  });

  it('lets a club admin invite only into its server-scoped club', async () => {
    mocks.role = 'CLUB_ADMIN';
    const user = userEvent.setup();
    renderRoute();
    await screen.findByText('Coach A');

    await user.click(
      screen.getByRole('button', { name: 'Kullanıcı davet et' }),
    );
    await user.type(screen.getByLabelText('E-posta'), 'new@example.test');
    await user.click(screen.getByRole('button', { name: 'Daveti oluştur' }));

    await waitFor(() =>
      expect(mocks.createInvitation).toHaveBeenCalledWith({
        email: 'new@example.test',
        role: 'COACH',
        clubId: 'club-a',
      }),
    );
    expect(await screen.findByText('Teslim kabul edildi')).toBeInTheDocument();
  });

  it('requires explicit confirmation before suspending an account', async () => {
    const user = userEvent.setup();
    renderRoute();
    await screen.findByText('Coach A');

    await user.click(
      screen.getByRole('button', { name: 'Coach A hesabı işlemleri' }),
    );
    await user.click(
      screen.getByRole('menuitem', { name: 'Hesabı askıya al' }),
    );
    expect(
      screen.getByRole('heading', { name: 'Hesabı askıya al' }),
    ).toBeInTheDocument();
    expect(mocks.setStatus).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Hesabı askıya al' }));
    await waitFor(() =>
      expect(mocks.setStatus).toHaveBeenCalledWith('coach-a', 'SUSPENDED'),
    );
  });
});
