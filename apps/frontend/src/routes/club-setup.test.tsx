import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ClubSetupRoute from './club-setup';

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  status: vi.fn(),
  session: {
    token: 'test-only',
    user: { id: 'operator', role: 'SYSTEM_ADMIN' },
  },
}));
vi.mock('../lib/api', () => ({
  createClubSetup: mocks.create,
  getClubSetupStatus: mocks.status,
}));
vi.mock('../lib/session', () => ({
  getSession: () => mocks.session,
  subscribeSession: () => () => {},
}));
const result = {
  state: 'completed',
  clubId: 'club-new',
  clubName: 'Yeni Kulüp',
  clubSeasonId: 'season-new',
  firstTeamId: 'team-new',
  teamCount: 2,
  staffCount: 0,
};
function setup(url = '/app/setup') {
  const router = createMemoryRouter(
    [
      { path: '/app/setup', element: <ClubSetupRoute /> },
      { path: '/app/settings', element: <p>Ayarlar hedefi</p> },
      { path: '/app/dashboard', element: <p>Dashboard hedefi</p> },
    ],
    { initialEntries: [url] },
  );
  return {
    router,
    user: userEvent.setup(),
    ...render(<RouterProvider router={router} />),
  };
}
async function toTeams(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Kulüp adı'), 'Yeni Kulüp');
  await user.click(screen.getByRole('button', { name: 'Devam et' }));
  await user.type(screen.getByLabelText('Sezon adı'), '2026-2027');
  fireEvent.change(screen.getByLabelText('Başlangıç günü'), {
    target: { value: '2026-08-14' },
  });
  fireEvent.change(screen.getByLabelText('Bitiş günü (dahil)'), {
    target: { value: '2027-05-23' },
  });
  await user.click(screen.getByRole('button', { name: 'Devam et' }));
}

describe('guided club setup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.session.user.role = 'SYSTEM_ADMIN';
    mocks.create.mockResolvedValue(result);
    mocks.status.mockResolvedValue({ state: 'not-found' });
  });
  it('keeps all writes until final review and permits skipped staff', async () => {
    const { user, router } = setup();
    await toTeams(user);
    await user.click(screen.getByRole('button', { name: 'U8' }));
    await user.click(screen.getByRole('button', { name: 'Devam et' }));
    await user.click(screen.getByRole('button', { name: 'Sonra ekle' }));
    expect(screen.getByText('Sonra eklenecek')).toBeInTheDocument();
    expect(mocks.create).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Kurulumu oluştur' }));
    expect(
      await screen.findByText('Çalışma alanınız hazır'),
    ).toBeInTheDocument();
    expect(mocks.create).toHaveBeenCalledOnce();
    expect(mocks.create.mock.calls[0][0]).toMatchObject({
      club: { name: 'Yeni Kulüp', primaryColor: '#0878ed' },
      academyTeams: [{ key: 'u8' }],
      staff: [],
    });
    await user.click(
      screen.getByRole('button', { name: /Çalışma alanına geç/ }),
    );
    expect(router.state.location.search).toContain('ngcsClub=club-new');
    expect(router.state.location.search).toContain('ngcsSeason=season-new');
    expect(router.state.location.search).toContain('ngcsTeam=team-new');
  });
  it('validates fields, keeps values on back, and previews entered colors', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Devam et' }));
    expect(screen.getByLabelText('Kulüp adı')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    await user.type(screen.getByLabelText('Kulüp adı'), 'Yeni Kulüp');
    fireEvent.change(screen.getByLabelText('Ana renk', { exact: true }), {
      target: { value: '#ffcc00' },
    });
    await user.click(screen.getByRole('button', { name: 'Devam et' }));
    await user.click(screen.getByRole('button', { name: /Geri/ }));
    expect(screen.getByLabelText('Kulüp adı')).toHaveValue('Yeni Kulüp');
    expect(screen.getByLabelText('Ana renk', { exact: true })).toHaveValue(
      '#ffcc00',
    );
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it('submits explicit staff team, role and season dates without invitation fields', async () => {
    const { user } = setup();
    await toTeams(user);
    await user.click(screen.getByRole('button', { name: 'Devam et' }));
    await user.click(screen.getByRole('button', { name: 'Teknik kişi ekle' }));
    await user.type(screen.getByLabelText('Ad soyad'), 'Deniz Örnek');
    await user.selectOptions(
      screen.getByLabelText('Sportif görev'),
      'GOALKEEPER_COACH',
    );
    await user.click(screen.getByRole('button', { name: 'Devam et' }));
    await user.click(screen.getByRole('button', { name: 'Kurulumu oluştur' }));
    await screen.findByText('Çalışma alanınız hazır');
    expect(mocks.create.mock.calls[0][0].staff).toEqual([
      expect.objectContaining({
        name: 'Deniz Örnek',
        role: 'GOALKEEPER_COACH',
        teamKey: 'first-team',
        validFrom: '2026-08-14',
        validTo: '2027-05-23',
      }),
    ]);
    expect(JSON.stringify(mocks.create.mock.calls[0][0])).not.toMatch(
      /email|invitation|capabilities/,
    );
  });
  it('retains a failed draft and reuses the exact request for explicit retry', async () => {
    mocks.create
      .mockRejectedValueOnce(new Error('Bağlantı kesildi.'))
      .mockResolvedValue(result);
    const { user } = setup();
    await toTeams(user);
    await user.click(screen.getByRole('button', { name: 'Devam et' }));
    await user.click(screen.getByRole('button', { name: 'Sonra ekle' }));
    await user.click(screen.getByRole('button', { name: 'Kurulumu oluştur' }));
    await screen.findByText('Bağlantı kesildi.');
    const first = mocks.create.mock.calls[0][0];
    expect(
      screen.getByRole('button', { name: 'Kurulumu oluştur' }),
    ).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Sonucu kontrol et' }));
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Bilgileri düzenle' }),
      ).toBeInTheDocument(),
    );
    await user.click(
      screen.getByRole('button', { name: 'Aynı isteği tekrar gönder' }),
    );
    await screen.findByText('Çalışma alanınız hazır');
    expect(mocks.create.mock.calls[1][0]).toEqual(first);
  });
  it('queries a completed request after reload without resubmitting person data', async () => {
    mocks.status.mockResolvedValue(result);
    setup('/app/setup?request=206b139d-4593-4fa7-bb1b-47f154dc4c37');
    await screen.findByText('Çalışma alanınız hazır');
    expect(mocks.status).toHaveBeenCalledWith(
      '206b139d-4593-4fa7-bb1b-47f154dc4c37',
    );
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it('allows reform entry after a not-found result while retaining request identity', async () => {
    const { user } = setup(
      '/app/setup?request=206b139d-4593-4fa7-bb1b-47f154dc4c37',
    );
    await user.click(
      await screen.findByRole('button', { name: 'Formu yeniden doldur' }),
    );
    await toTeams(user);
    await user.click(screen.getByRole('button', { name: 'Devam et' }));
    await user.click(screen.getByRole('button', { name: 'Sonra ekle' }));
    await user.click(screen.getByRole('button', { name: 'Kurulumu oluştur' }));
    await screen.findByText('Çalışma alanınız hazır');
    expect(mocks.create.mock.calls[0][0].requestId).toBe(
      '206b139d-4593-4fa7-bb1b-47f154dc4c37',
    );
  });
  it('blocks accidental navigation and lets the user keep the draft', async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText('Kulüp adı'), 'Kaybolmasın');
    await user.click(screen.getByRole('link', { name: 'Ayarlara dön' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Kuruluma dön' }));
    expect(screen.getByLabelText('Kulüp adı')).toHaveValue('Kaybolmasın');
  });
  it('denies non-system roles without setup calls', () => {
    mocks.session.user.role = 'CLUB_ADMIN';
    setup();
    expect(screen.getByText('Yönetici erişimi gerekli')).toBeInTheDocument();
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.status).not.toHaveBeenCalled();
  });
});
