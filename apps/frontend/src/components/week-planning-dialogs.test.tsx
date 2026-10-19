import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  WeekDeleteDialog,
  WeekEventDialog,
  WeekProgramDialog,
} from './week-planning-dialogs';
import type { PlanningEvent, ProgramInput } from '../lib/planning';
const api = vi.hoisted(() => ({
  applyWeekProgram: vi.fn(),
  createPlanningEvent: vi.fn(),
  deletePlanningEvent: vi.fn(),
  deleteTrainingPlan: vi.fn(),
  getPlanningTeams: vi.fn(),
  getWeekApplication: vi.fn(),
  previewWeekProgram: vi.fn(),
  updatePlanningEvent: vi.fn(),
  updateTrainingPlan: vi.fn(),
}));
vi.mock('../lib/api', () => api);
const result = {
  state: 'completed',
  requestId: 'a',
  teamCount: 1,
  eventCount: 1,
  trainingCount: 1,
  meetingCount: 0,
  eventIds: ['e'],
  planIds: ['p'],
};
const team = {
  seasonId: 's',
  groupId: 'g',
  name: 'A Takım',
  ageGroup: 'SENIOR',
};
const meeting: PlanningEvent = {
  id: 'meeting',
  source: 'event',
  kind: 'TOPLANTI',
  title: 'Maç toplantısı',
  date: '2026-10-20T15:00:00+03:00',
  duration: 25,
  notes: 'Notes',
  location: 'Oda',
  topic: 'Gündem',
  completed: false,
};
function URL() {
  return <output aria-label="URL">{useLocation().search}</output>;
}
function program(initial = '/app/week?start=2026-10-19') {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <WeekProgramDialog
        clubSeasonId="cs"
        seasonId="s"
        weekStart="2026-10-19"
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />
      <URL />
    </MemoryRouter>,
  );
}
describe('weekly planning dialogs', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    api.getPlanningTeams.mockResolvedValue({
      items: [
        team,
        { seasonId: 'u8', groupId: 'g8', name: 'U8', ageGroup: 'U8' },
      ],
    });
    api.previewWeekProgram.mockImplementation(async (input: ProgramInput) => ({
      token: 'preview',
      input,
      conflicts: [],
      teams: [
        {
          ...team,
          applied: false,
          matches: [],
          events: [
            {
              key: 's:0:0',
              seasonId: 's',
              kind: 'TRAINING',
              title: 'Teknik seans',
              startsAt: '2026-10-20T10:00:00+03:00',
              duration: 60,
              notes: 'Example',
              topic: '',
              location: 'Saha',
            },
          ],
        },
      ],
    }));
    api.applyWeekProgram.mockResolvedValue(result);
    api.createPlanningEvent.mockResolvedValue(result);
    api.getWeekApplication.mockResolvedValue({ state: 'not-found' });
  });
  it('previews selected/all teams without writes and requires refreshed preview after row edits', async () => {
    program();
    await screen.findByLabelText(/A Takım/);
    fireEvent.click(screen.getByRole('button', { name: 'Tüm takımları seç' }));
    fireEvent.click(screen.getByRole('button', { name: 'Önizleme hazırla' }));
    await screen.findByText('Teknik seans');
    expect(api.applyWeekProgram).not.toHaveBeenCalled();
    expect(api.previewWeekProgram.mock.lastCall?.[0].seasonIds).toEqual([
      's',
      'u8',
    ]);
    fireEvent.click(screen.getByRole('checkbox', { name: /Teknik seans/ }));
    expect(
      screen.getByRole('button', { name: 'Programı uygula' }),
    ).toBeDisabled();
    fireEvent.click(
      screen.getByRole('button', { name: 'Önizlemeyi güncelle' }),
    );
    await waitFor(() =>
      expect(api.previewWeekProgram).toHaveBeenCalledTimes(2),
    );
    expect(api.previewWeekProgram.mock.lastCall?.[0].overrides).toEqual([
      { key: 's:0:0', excluded: true },
    ]);
  });
  it('locks submitted input and retries the identical request after an uncertain network failure', async () => {
    api.applyWeekProgram.mockRejectedValueOnce(
      new Error('Network unavailable'),
    );
    program();
    await screen.findByLabelText(/A Takım/);
    fireEvent.click(screen.getByRole('button', { name: 'Önizleme hazırla' }));
    await screen.findByText('Teknik seans');
    fireEvent.click(screen.getByRole('button', { name: 'Programı uygula' }));
    await screen.findByText('Network unavailable');
    expect(screen.getByRole('checkbox', { name: /A Takım/ })).toBeDisabled();
    const sent = api.applyWeekProgram.mock.calls[0][0];
    fireEvent.click(
      screen.getByRole('button', { name: 'Aynı isteği yeniden dene' }),
    );
    await screen.findByText('Kayıt tamamlandı');
    expect(api.applyWeekProgram.mock.calls[1][0]).toEqual(sent);
    expect(screen.getByLabelText('URL')).toHaveTextContent('planningRequest=');
    expect(screen.getByLabelText('URL')).not.toHaveTextContent('Teknik');
  });
  it('reload checks only the opaque request result and never resubmits', async () => {
    const id = 'b1a7e360-3b31-4b88-9494-a025d3ca2eda';
    api.getWeekApplication.mockResolvedValue(result);
    program(`/app/week?planningRequest=${id}`);
    await screen.findByText('Kayıt tamamlandı');
    expect(api.getWeekApplication).toHaveBeenCalledWith(id);
    expect(api.applyWeekProgram).not.toHaveBeenCalled();
    expect(api.previewWeekProgram).not.toHaveBeenCalled();
  });
  it('shows conflicts and blocks application', async () => {
    api.previewWeekProgram.mockResolvedValue({
      token: 'x',
      input: { weekStart: '2026-10-19', seasonIds: ['s'], overrides: [] },
      teams: [],
      conflicts: ['A Takım: saat çakışıyor'],
    });
    program();
    await screen.findByLabelText(/A Takım/);
    fireEvent.click(screen.getByRole('button', { name: 'Önizleme hazırla' }));
    await screen.findByText('A Takım: saat çakışıyor');
    expect(
      screen.getByRole('button', { name: 'Programı uygula' }),
    ).toBeDisabled();
  });
  it('creates a meeting with agenda and actual fields, without account or invitation fields', async () => {
    render(
      <MemoryRouter>
        <WeekEventDialog
          seasonId="s"
          day="2026-10-20"
          onClose={vi.fn()}
          onSaved={vi.fn()}
        />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText('Etkinlik türü'), {
      target: { value: 'TOPLANTI' },
    });
    fireEvent.change(screen.getByLabelText('Başlık'), {
      target: { value: 'Rakip toplantısı' },
    });
    fireEvent.change(screen.getByLabelText('Süre (dk)'), {
      target: { value: '25' },
    });
    fireEvent.change(screen.getByLabelText('Gündem / konu'), {
      target: { value: 'Oyun planı' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
    await screen.findByText('Kayıt tamamlandı');
    expect(api.createPlanningEvent.mock.calls[0][0]).toMatchObject({
      seasonId: 's',
      kind: 'TOPLANTI',
      title: 'Rakip toplantısı',
      duration: 25,
      topic: 'Oyun planı',
    });
    expect(screen.queryByLabelText(/e-posta|davet/i)).not.toBeInTheDocument();
  });
  it('keeps physical duration derived and routes edits through existing plan lifecycle', async () => {
    const onSaved = vi.fn();
    render(
      <MemoryRouter>
        <WeekEventDialog
          seasonId="s"
          day="2026-10-20"
          event={{ ...meeting, id: 'p', source: 'plan', kind: 'TRAINING' }}
          onClose={vi.fn()}
          onSaved={onSaved}
        />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText('Süre (dk)')).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Başlık'), {
      target: { value: 'Yeni başlık' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(api.updateTrainingPlan.mock.calls[0]).toEqual([
      'p',
      expect.objectContaining({ title: 'Yeni başlık' }),
    ]);
    expect(api.updatePlanningEvent).not.toHaveBeenCalled();
  });
  it('deletes only after explicit confirmation and preserves failed records', async () => {
    api.deletePlanningEvent.mockRejectedValue(new Error('Delete failed'));
    const onSaved = vi.fn();
    render(
      <MemoryRouter>
        <WeekDeleteDialog event={meeting} onClose={vi.fn()} onSaved={onSaved} />
      </MemoryRouter>,
    );
    expect(api.deletePlanningEvent).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Kalıcı sil' }));
    await screen.findByText('Delete failed');
    expect(onSaved).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
