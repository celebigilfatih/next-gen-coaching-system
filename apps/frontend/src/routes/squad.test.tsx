import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SquadRoute from './squad';

const mocks = vi.hoisted(() => ({
  page: vi.fn(),
  role: 'COACH',
  workspace: {
    team: { id: 't', name: 'U17', ageGroupLabel: 'U17' },
    teamSeason: { id: 'ts' },
    loading: false,
    error: '',
    reload: vi.fn(),
  },
}));

vi.mock('../lib/api', () => ({ getSportingRosterPage: mocks.page }));
vi.mock('../lib/session', () => ({
  getSession: () => ({ user: { role: mocks.role } }),
}));
vi.mock('../lib/workspace-context', () => ({
  useWorkspace: () => ({
    ...mocks.workspace,
    get members() {
      throw new Error('Shared members forbidden');
    },
  }),
}));

const roster = (name = 'First', cursor: string | null = 'next') => ({
  team: { id: 't', clubId: 'c', name: 'U17', categoryLabel: 'Altyapı' },
  asOf: '2026-09-09T12:00:00.000Z',
  assignments: [
    {
      id: name,
      assignmentType: 'PRIMARY_REGISTERED',
      validFrom: '2026-08-01T00:00:00.000Z',
      validTo: null,
      reason: null,
      source: 'TEST',
      person: {
        id: name,
        displayName: name,
        birthDate: null,
        playerProfile: {
          preferredFoot: 'RIGHT',
          primaryPosition: 'DEFANS',
          secondaryPositions: null,
        },
        staffProfile: null,
      },
      roleDefinition: {
        id: 'role',
        key: 'PLAYER',
        name: 'Oyuncu',
        systemKey: 'PLAYER',
      },
      teamSeason: null,
    },
  ],
  page: {
    total: 30,
    playerAssignments: 30,
    staffAssignments: 0,
    limit: 25,
    nextCursor: cursor,
  },
});

describe('independent canonical squad pages', () => {
  const renderRoute = () =>
    render(
      <MemoryRouter>
        <SquadRoute />
      </MemoryRouter>,
    );
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.role = 'COACH';
    mocks.workspace = {
      team: { id: 't', name: 'U17', ageGroupLabel: 'U17' },
      teamSeason: { id: 'ts' },
      loading: false,
      error: '',
      reload: vi.fn(),
    };
    mocks.page.mockResolvedValue(roster());
  });

  it('pages account-independent players with a full total and global ordinals', async () => {
    renderRoute();
    await screen.findByText('First');
    expect(
      document.querySelector('.squad-reference__hero'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Kadro toplamı')).toHaveTextContent(
      '30 oyuncu',
    );
    expect(screen.getByText('Defans')).toBeInTheDocument();
    mocks.page.mockResolvedValueOnce(roster('Second', null));
    fireEvent.click(screen.getByRole('button', { name: 'Sonraki sayfa' }));
    await screen.findByText('Second');
    expect(screen.getByRole('link', { name: /Profili aç/ })).toHaveAttribute(
      'href',
      '/app/players/Second',
    );
    expect(mocks.page).toHaveBeenLastCalledWith(
      't',
      expect.objectContaining({ teamSeasonId: 'ts', after: 'next' }),
    );
    expect(screen.queryByText('First')).not.toBeInTheDocument();
  });

  it('retries failed continuation and keeps a previous path from empty pages', async () => {
    renderRoute();
    await screen.findByText('First');
    mocks.page.mockRejectedValueOnce(new Error('Offline'));
    fireEvent.click(screen.getByRole('button', { name: 'Sonraki sayfa' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Offline');
    expect(screen.queryByText('Oyuncu bulunamadı')).not.toBeInTheDocument();
    mocks.page.mockResolvedValueOnce({
      ...roster('unused', null),
      assignments: [],
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Kadroyu tekrar yükle' }),
    );
    await screen.findByText('Bu sayfada oyuncu yok');
    expect(screen.getByRole('button', { name: 'Önceki sayfa' })).toBeEnabled();
    expect(mocks.page).toHaveBeenLastCalledWith(
      't',
      expect.objectContaining({ after: 'next' }),
    );
    expect(mocks.workspace.reload).not.toHaveBeenCalled();
  });

  it('resets on team changes and rejects late responses', async () => {
    let resolve!: (value: unknown) => void;
    mocks.page.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const view = renderRoute();
    await waitFor(() => expect(mocks.page).toHaveBeenCalledTimes(1));
    mocks.workspace.team = { id: 't2', name: 'U14', ageGroupLabel: 'U14' };
    mocks.workspace.teamSeason = { id: 'ts2' };
    mocks.page.mockResolvedValue(roster('New'));
    view.rerender(
      <MemoryRouter>
        <SquadRoute />
      </MemoryRouter>,
    );
    await screen.findByText('New');
    await act(async () => resolve(roster('Old')));
    expect(screen.queryByText('Old')).not.toBeInTheDocument();
    expect(mocks.page).toHaveBeenLastCalledWith(
      't2',
      expect.objectContaining({ teamSeasonId: 'ts2', after: undefined }),
    );
  });

  it('shows a real empty state and does not query for PLAYER', async () => {
    mocks.page.mockResolvedValue({
      ...roster('unused', null),
      assignments: [],
      page: {
        total: 0,
        playerAssignments: 0,
        staffAssignments: 0,
        limit: 25,
        nextCursor: null,
      },
    });
    const view = renderRoute();
    await screen.findByText('Oyuncu bulunamadı');
    mocks.role = 'PLAYER';
    mocks.page.mockClear();
    view.rerender(
      <MemoryRouter>
        <SquadRoute />
      </MemoryRouter>,
    );
    expect(
      screen.getByText('Bu rol için takım kadrosu erişimi bulunmuyor.'),
    ).toBeInTheDocument();
    expect(mocks.page).not.toHaveBeenCalled();
  });
});
