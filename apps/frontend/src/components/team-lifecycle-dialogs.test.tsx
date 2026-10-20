import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ArchiveTeamDialog, TeamFormDialog } from './team-lifecycle-dialogs';

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  archive: vi.fn(),
  success: vi.fn(),
}));
vi.mock('../lib/api', () => ({
  createSportingTeam: mocks.create,
  updateSportingTeam: mocks.update,
  archiveSportingTeam: mocks.archive,
}));
vi.mock('sonner', () => ({ toast: { success: mocks.success } }));

const team = {
  id: 'team-a',
  clubId: 'club-a',
  name: 'U17',
  categoryKey: 'ALT_YAPI',
  categoryLabel: 'Altyapı',
  ageGroupLabel: 'U17',
  minimumAge: null,
  maximumAge: null,
  legacyGroupId: 'team-a',
  archivedAt: null,
  teamSeasons: [],
};

describe('team lifecycle dialogs', () => {
  beforeEach(() => {
    mocks.create.mockReset();
    mocks.update.mockReset();
    mocks.archive.mockReset();
    mocks.success.mockReset();
  });

  it('creates an academy team only with trimmed visible fields', async () => {
    mocks.create.mockResolvedValue(team);
    const saved = vi.fn();
    const open = vi.fn();
    render(
      <TeamFormDialog
        open
        onOpenChange={open}
        mode="create"
        classification="ACADEMY"
        clubId="club-a"
        clubSeasonId="season-a"
        clubSeasonName="2026–27"
        onSaved={saved}
      />,
    );
    fireEvent.change(screen.getByLabelText('Takım adı'), {
      target: { value: ' U17 Gelişim ' },
    });
    fireEvent.change(screen.getByLabelText('Yaş / kademe etiketi'), {
      target: { value: ' U17 ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Takımı oluştur' }));
    await waitFor(() =>
      expect(mocks.create).toHaveBeenCalledWith({
        clubId: 'club-a',
        clubSeasonId: 'season-a',
        name: 'U17 Gelişim',
        ageGroupLabel: 'U17',
        classification: 'ACADEMY',
      }),
    );
    expect(saved).toHaveBeenCalledWith(team);
    expect(open).toHaveBeenCalledWith(false);
  });

  it('prefills edit fields and keeps the dialog open on API failure', async () => {
    mocks.update.mockRejectedValue(new Error('Güncelleme reddedildi'));
    const open = vi.fn();
    render(
      <TeamFormDialog
        open
        onOpenChange={open}
        mode="edit"
        classification="ACADEMY"
        clubId="club-a"
        clubSeasonId="season-a"
        clubSeasonName="2026–27"
        team={team}
        onSaved={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('Takım adı')).toHaveValue('U17');
    fireEvent.click(
      screen.getByRole('button', { name: 'Değişiklikleri kaydet' }),
    );
    expect(
      await screen.findByText('Güncelleme reddedildi'),
    ).toBeInTheDocument();
    expect(open).not.toHaveBeenCalledWith(false);
  });

  it('archives only after explicit confirmation and preserves the record on error', async () => {
    mocks.archive.mockRejectedValue(new Error('Arşivleme reddedildi'));
    const open = vi.fn();
    const archived = vi.fn();
    render(
      <ArchiveTeamDialog
        open
        onOpenChange={open}
        team={team}
        onArchived={archived}
      />,
    );
    expect(screen.getByText(/geçmişi silinmeyecek/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Takımı arşivle' }));
    expect(await screen.findByText('Arşivleme reddedildi')).toBeInTheDocument();
    expect(archived).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalledWith(false);
  });
});
