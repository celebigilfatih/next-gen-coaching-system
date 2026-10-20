import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PlayerDetailRoute from './player-detail';

const api = vi.hoisted(() => ({
  getSportingPlayer360Page: vi.fn(),
  getPlayerNotePage: vi.fn(),
  getPlayerActivityPage: vi.fn(),
  createPlayerNote: vi.fn(),
  updatePlayerNote: vi.fn(),
  archivePlayerNote: vi.fn(),
  restorePlayerNote: vi.fn(),
  replacePlayerNoteShares: vi.fn(),
  getPlayerNoteRevisions: vi.fn(),
  createSportingAssignment: vi.fn(),
  transitionSportingPrimary: vi.fn(),
  getAssignmentOptions: vi.fn(),
}));
vi.mock('../lib/api', () => api);
vi.mock('../lib/session', () => ({
  getSession: () => ({ user: { role: 'SYSTEM_ADMIN' } }),
}));

const profile = {
  id: 'person-1',
  clubId: 'club-1',
  displayName: 'Ahmet Yılmaz',
  birthDate: null,
  playerProfile: { preferredFoot: 'RIGHT', primaryPosition: 'ORTA_SAHA' },
  account: null,
  asOf: '2026-09-09T12:00:00.000Z',
  assignments: [
    {
      id: 'assignment-1',
      validFrom: '2026-08-01T00:00:00.000Z',
      validTo: null,
      assignmentType: 'PRIMARY_REGISTERED',
      reason: null,
      source: 'PLAYER_GROUP_BACKFILL_V1',
      team: { id: 'team-1', name: 'U18', ageGroupLabel: 'U18' },
      roleDefinition: { name: 'Oyuncu' },
    },
  ],
  availabilityPeriods: [],
  evidence: { attendance: {}, matchParticipation: null },
  assignmentPage: {
    total: 1,
    activeCount: 1,
    historyVisible: true,
    limit: 25,
    nextCursor: null,
  },
};

describe('Player 360 notes experience', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getSportingPlayer360Page.mockResolvedValue(profile);
    api.getPlayerActivityPage.mockResolvedValue({
      items: [],
      nextCursor: null,
      limit: 20,
    });
    api.getPlayerNotePage.mockResolvedValue({
      items: [],
      nextCursor: null,
      limit: 20,
      total: 0,
      summary: { openFollowUps: 0 },
      permissions: { canCreate: true, canShare: true },
    });
  });

  it('localizes the identity and opens a structured note sheet', async () => {
    render(
      <MemoryRouter initialEntries={['/app/players/person-1?tab=notes']}>
        <Routes>
          <Route
            path="/app/players/:personId"
            element={<PlayerDetailRoute />}
          />
        </Routes>
      </MemoryRouter>,
    );
    await screen.findByRole('heading', { name: 'Ahmet Yılmaz' });
    expect(screen.getByText(/Orta saha · Sağ ayak · U18/)).toBeInTheDocument();
    expect(screen.queryByText('ORTA_SAHA')).not.toBeInTheDocument();
    expect(screen.queryByText('Kanıt yok')).not.toBeInTheDocument();
    expect(await screen.findByText('Oyuncu notları')).toBeInTheDocument();
    fireEvent.click(await screen.findByRole('button', { name: /Not ekle/ }));
    expect(
      screen.getByRole('heading', { name: 'Oyuncuya not ekle' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Not')).toHaveAttribute('maxlength', '4000');
  });
});
