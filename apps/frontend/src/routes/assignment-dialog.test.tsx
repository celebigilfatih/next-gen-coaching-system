import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PlayerDetailRoute from './player-detail';

const mocks = vi.hoisted(() => ({
  api: {
    getSportingPlayer360Page: vi.fn(),
    getAssignmentOptions: vi.fn(),
    createSportingAssignment: vi.fn(),
    transitionSportingPrimary: vi.fn(),
  },
  session: { role: 'COACH' },
  toast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('../lib/api', () => mocks.api);
vi.mock('../lib/session', () => ({
  getSession: () => ({ user: mocks.session }),
}));
vi.mock('sonner', () => ({ toast: mocks.toast }));

const options = (kind: string) => ({
  items: [
    {
      id: kind === 'teams' ? 'team' : 'role',
      name: kind === 'teams' ? 'U17' : 'Oyuncu',
    },
  ],
  nextCursor: null,
});
function setup() {
  return render(
    <MemoryRouter initialEntries={['/app/players/person?asOf=2026-09-07']}>
      <Routes>
        <Route path="/app/players/:personId" element={<PlayerDetailRoute />} />
      </Routes>
    </MemoryRouter>,
  );
}
async function open() {
  const user = userEvent.setup();
  await user.click(await screen.findByRole('button', { name: 'Atama ekle' }));
  await waitFor(() =>
    expect(screen.getByLabelText('Atama takımı')).toBeEnabled(),
  );
  await waitFor(() =>
    expect(screen.getByLabelText('Atama rolü')).toBeEnabled(),
  );
  return user;
}
async function selectRequired(user: ReturnType<typeof userEvent.setup>) {
  await user.selectOptions(screen.getByLabelText('Atama takımı'), 'team');
  await user.selectOptions(screen.getByLabelText('Atama rolü'), 'role');
}

describe('sporting assignment dialog presentation regression', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.session.role = 'COACH';
    mocks.api.getSportingPlayer360Page.mockResolvedValue({
      id: 'person',
      clubId: 'club',
      displayName: 'Arda',
      birthDate: null,
      playerProfile: {},
      account: null,
      asOf: '2026-09-07T12:00:00Z',
      assignments: [],
      evidence: { attendance: {} },
      assignmentPage: {
        total: 0,
        activeCount: 0,
        historyVisible: true,
        limit: 25,
        nextCursor: null,
      },
    });
    mocks.api.getAssignmentOptions.mockImplementation(async (kind: string) =>
      options(kind),
    );
    mocks.api.createSportingAssignment.mockResolvedValue({});
    mocks.api.transitionSportingPrimary.mockResolvedValue({});
  });

  it('preserves the PLAYER UI guard without loading assignment options', async () => {
    mocks.session.role = 'PLAYER';
    setup();
    await screen.findByText('Arda');
    expect(
      screen.queryByRole('button', { name: 'Atama ekle' }),
    ).not.toBeInTheDocument();
    expect(mocks.api.getAssignmentOptions).not.toHaveBeenCalled();
  });

  it('keeps explicit required selections, UTC date default and optional reason', async () => {
    setup();
    const user = await open();
    expect(
      screen.getByRole('dialog', { name: 'Sportif atama' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Atama türü')).toHaveValue('TRAINING_GUEST');
    expect(screen.getByLabelText('Başlangıç')).toHaveValue(
      new Date().toISOString().slice(0, 10),
    );
    expect(screen.getByLabelText('Başlangıç')).not.toHaveAttribute('min');
    expect(screen.getByLabelText('Başlangıç')).not.toHaveAttribute('max');
    for (const label of [
      'Atama takımı',
      'Atama türü',
      'Atama rolü',
      'Başlangıç',
    ]) {
      expect(screen.getByLabelText(label)).toBeRequired();
    }
    expect(screen.getByLabelText('Gerekçe')).not.toBeRequired();
    expect(screen.getByRole('button', { name: 'Kaydet' })).toBeDisabled();
    await user.selectOptions(screen.getByLabelText('Atama takımı'), 'team');
    expect(screen.getByRole('button', { name: 'Kaydet' })).toBeDisabled();
    await user.selectOptions(screen.getByLabelText('Atama rolü'), 'role');
    expect(screen.getByRole('button', { name: 'Kaydet' })).toBeEnabled();
    expect(mocks.api.getAssignmentOptions).toHaveBeenCalledWith(
      'teams',
      'club',
      undefined,
    );
    expect(mocks.api.getAssignmentOptions).toHaveBeenCalledWith(
      'roles',
      'club',
      undefined,
    );
  });

  it.each([
    'TRAINING_GUEST',
    'MATCH_ELIGIBLE',
    'PRIMARY_REGISTERED',
    'LOAN_IN',
    'INTERNATIONAL_DUTY',
  ])(
    'preserves %s dispatch, payload and successful refresh',
    async (assignmentType) => {
      setup();
      const user = await open();
      await selectRequired(user);
      await user.selectOptions(
        screen.getByLabelText('Atama türü'),
        assignmentType,
      );
      fireEvent.change(screen.getByLabelText('Başlangıç'), {
        target: { value: '2026-08-15' },
      });
      await user.type(screen.getByLabelText('Gerekçe'), '  Sportif karar  ');
      await user.click(screen.getByRole('button', { name: 'Kaydet' }));
      const common = {
        personId: 'person',
        teamId: 'team',
        roleDefinitionId: 'role',
        reason: 'Sportif karar',
      };
      if (assignmentType === 'PRIMARY_REGISTERED') {
        expect(
          mocks.api.transitionSportingPrimary,
        ).toHaveBeenCalledExactlyOnceWith({
          ...common,
          validAt: '2026-08-15T12:00:00.000Z',
        });
        expect(mocks.api.createSportingAssignment).not.toHaveBeenCalled();
      } else {
        expect(
          mocks.api.createSportingAssignment,
        ).toHaveBeenCalledExactlyOnceWith({
          ...common,
          assignmentType,
          validFrom: '2026-08-15T12:00:00.000Z',
        });
        expect(mocks.api.transitionSportingPrimary).not.toHaveBeenCalled();
      }
      expect(mocks.toast.success).toHaveBeenCalledWith(
        'Sportif atama kaydedildi',
      );
      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      );
      expect(mocks.api.getSportingPlayer360Page).toHaveBeenCalledTimes(2);
    },
  );

  it('keeps native required-date validation before submission', async () => {
    setup();
    const user = await open();
    await selectRequired(user);
    fireEvent.change(screen.getByLabelText('Başlangıç'), {
      target: { value: '' },
    });
    await user.click(screen.getByRole('button', { name: 'Kaydet' }));
    expect(screen.getByLabelText('Başlangıç')).toBeInvalid();
    expect(mocks.api.createSportingAssignment).not.toHaveBeenCalled();
  });

  it('supports Enter submission, blank reason and a disabled pending save', async () => {
    let resolve!: () => void;
    mocks.api.createSportingAssignment.mockImplementation(
      () =>
        new Promise<void>((done) => {
          resolve = done;
        }),
    );
    setup();
    const user = await open();
    await selectRequired(user);
    await user.type(screen.getByLabelText('Gerekçe'), '   {Enter}');
    expect(mocks.api.createSportingAssignment).toHaveBeenCalledTimes(1);
    expect(
      mocks.api.createSportingAssignment.mock.calls[0][0].reason,
    ).toBeUndefined();
    expect(
      screen.getByRole('button', { name: 'Kaydediliyor…' }),
    ).toBeDisabled();
    expect(screen.getByLabelText('Gerekçe').closest('form')).toHaveAttribute(
      'aria-busy',
      'true',
    );
    await act(async () => resolve());
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it.each([new Error('Atama yetkisi yok.'), 'unknown'])(
    'retains values on failure and allows retry (%s)',
    async (cause) => {
      mocks.api.createSportingAssignment.mockRejectedValueOnce(cause);
      setup();
      const user = await open();
      await selectRequired(user);
      await user.type(screen.getByLabelText('Gerekçe'), 'Korunan gerekçe');
      await user.click(screen.getByRole('button', { name: 'Kaydet' }));
      expect(mocks.toast.error).toHaveBeenCalledWith(
        cause instanceof Error ? cause.message : 'Atama kaydedilemedi.',
      );
      expect(screen.getByLabelText('Atama takımı')).toHaveValue('team');
      expect(screen.getByLabelText('Atama rolü')).toHaveValue('role');
      expect(screen.getByLabelText('Gerekçe')).toHaveValue('Korunan gerekçe');
      expect(screen.getByRole('button', { name: 'Kaydet' })).toBeEnabled();
      expect(mocks.api.getSportingPlayer360Page).toHaveBeenCalledTimes(1);
      await user.click(screen.getByRole('button', { name: 'Kaydet' }));
      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      );
    },
  );

  it.each(['Escape', 'Vazgeç', 'Kapat'])(
    'dismisses with %s, returns focus and resets on reopening',
    async (action) => {
      setup();
      const user = await open();
      await selectRequired(user);
      await user.selectOptions(screen.getByLabelText('Atama türü'), 'LOAN_IN');
      await user.type(screen.getByLabelText('Gerekçe'), 'Kaydedilmeyecek');
      fireEvent.change(screen.getByLabelText('Başlangıç'), {
        target: { value: '2025-01-01' },
      });
      if (action === 'Escape') await user.keyboard('{Escape}');
      else await user.click(screen.getByRole('button', { name: action }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Atama ekle' })).toHaveFocus();
      await open();
      expect(screen.getByLabelText('Atama takımı')).toHaveValue('');
      expect(screen.getByLabelText('Atama rolü')).toHaveValue('');
      expect(screen.getByLabelText('Atama türü')).toHaveValue('TRAINING_GUEST');
      expect(screen.getByLabelText('Başlangıç')).toHaveValue(
        new Date().toISOString().slice(0, 10),
      );
      expect(screen.getByLabelText('Gerekçe')).toHaveValue('');
      expect(screen.getByRole('button', { name: 'Kaydet' })).toBeDisabled();
      expect(mocks.api.createSportingAssignment).not.toHaveBeenCalled();
      expect(mocks.api.transitionSportingPrimary).not.toHaveBeenCalled();
    },
  );

  it('does not enable save for an empty role catalog', async () => {
    mocks.api.getAssignmentOptions.mockImplementation(async (kind: string) =>
      kind === 'roles' ? { items: [], nextCursor: null } : options(kind),
    );
    setup();
    const user = await open();
    await user.selectOptions(screen.getByLabelText('Atama takımı'), 'team');
    expect(screen.getByText('Bu sayfada seçenek yok.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kaydet' })).toBeDisabled();
  });
});
