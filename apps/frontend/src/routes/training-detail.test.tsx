import { act, fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkspaceProvider } from '../lib/workspace-context';
import TrainingsRoute from './trainings';
import type { Drill, TrainingPlan } from '../lib/api';
import TrainingDetailRoute from './training-detail';
import { resolveWorkspaceScope } from '../lib/workspace-scope';
import type { SportingWorkspace } from '../lib/api';
import { setSession } from '../lib/session';

const api = vi.hoisted(() => ({
  getSportingWorkspaceSelection: vi.fn(),
  getSportingCatalog: vi.fn(),
  getLegacyWorkspaceContext: vi.fn(),
  listGroups: vi.fn(),
  listSeasons: vi.fn(),
  listTrainingPlans: vi.fn(),
  getTrainingPlanPage: vi.fn(),
  listMatches: vi.fn(),
  listDrills: vi.fn(),
  getFilteredDrillPage: vi.fn(),
  listGroupMembers: vi.fn(),
  getTrainingPlan: vi.fn(),
  getTrainingEditorMetadata: vi.fn(),
  getTrainingPhaseDocument: vi.fn(),
  addTrainingPlanDrill: vi.fn(),
  markAttendance: vi.fn(),
  putTrainingPhaseDocument: vi.fn(),
  createTrainingPlan: vi.fn(),
  updateTrainingPlan: vi.fn(),
  deleteTrainingPlan: vi.fn(),
}));
vi.mock('../lib/api', () => api);
vi.mock('../components/tactics/tactical-board-editor', () => ({
  TacticalBoardEditor: () => null,
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn() } }));

describe('training plan workspace synchronization', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    setSession({
      token: 'unit-only',
      user: {
        id: 'coach',
        role: 'COACH',
        clubId: 'club',
        name: 'Coach',
        email: 'coach@example.test',
      },
    });
  });
  it.each([false, true])(
    'refreshes catalog after additive write; post-write read fails=%s',
    async (failRefresh) => {
      const drill: Drill = {
        id: 'drill',
        title: 'Isınma',
        category: 'WARM_UP',
        ageGroup: 'U18',
        durationMin: 12,
        difficulty: 'EASY',
        jsonData: {},
        scope: 'GLOBAL',
        clubId: null,
        groupId: null,
        createdById: null,
      };
      let stored: TrainingPlan = {
        id: 'plan',
        title: 'Demo plan',
        groupId: 'group',
        date: null,
        notes: null,
        totalDuration: 0,
        drills: [],
      };
      api.getLegacyWorkspaceContext.mockResolvedValue({
        group: { id: 'group', name: 'U17', ageGroup: 'U18', clubId: 'club' },
        season: null,
        matches: [],
      });
      const sportingData: SportingWorkspace = {
        clubs: [{ id: 'club', name: 'Club' }],
        teams: [
          {
            id: 'team',
            legacyGroupId: 'group',
            clubId: 'club',
            name: 'U17',
            categoryKey: 'ACADEMY',
            categoryLabel: 'Altyapı',
            ageGroupLabel: 'U17',
            minimumAge: null,
            maximumAge: null,
            teamSeasons: [],
          },
        ],
      };
      api.getSportingWorkspaceSelection.mockImplementation(async (desired) => {
        const state = resolveWorkspaceScope(sportingData, desired);
        const page = (items: unknown[]) => ({
          items,
          nextCursor: null,
          limit: 25,
        });
        return {
          ...state,
          clubs: page(sportingData.clubs),
          seasons: page(state.clubSeasons),
          teams: page(state.teams),
        };
      });
      api.listSeasons.mockResolvedValue([]);
      api.listMatches.mockResolvedValue([]);
      api.listDrills.mockRejectedValue(new Error('Full drill list forbidden'));
      api.getFilteredDrillPage.mockResolvedValue({
        items: [drill],
        total: 1,
        limit: 25,
        nextCursor: null,
      });
      api.listGroupMembers.mockResolvedValue([]);
      api.listTrainingPlans.mockRejectedValue(
        new Error('Full plan read forbidden'),
      );
      api.getTrainingPlanPage.mockImplementation(async () => ({
        items: [{ ...stored, phaseCount: stored.drills?.length ?? 0 }],
        limit: 25,
        nextCursor: null,
        summary: {
          total: 1,
          scheduled: 0,
          undated: 1,
          totalDuration: stored.totalDuration,
          presentAttendance: 0,
        },
      }));
      let failNextRead = false;
      api.getTrainingEditorMetadata.mockImplementation(async () => {
        if (failNextRead) {
          failNextRead = false;
          throw new Error('Read interrupted');
        }
        return stored;
      });
      api.addTrainingPlanDrill.mockImplementation(async () => {
        failNextRead = failRefresh;
        stored = {
          ...stored,
          totalDuration: 12,
          drills: [
            {
              id: 'phase',
              drillId: drill.id,
              phase: 'WARM_UP',
              order: 0,
              notes: null,
              drill,
            },
          ],
        };
        return { id: 'phase' };
      });
      const router = createMemoryRouter(
        [
          {
            element: (
              <WorkspaceProvider>
                <Outlet />
              </WorkspaceProvider>
            ),
            children: [
              {
                path: '/app/trainings/:planId',
                element: <TrainingDetailRoute />,
              },
              { path: '/app/trainings', element: <TrainingsRoute /> },
            ],
          },
        ],
        { initialEntries: ['/app/trainings/plan'] },
      );
      render(<RouterProvider router={router} />);
      await screen.findByRole('option', { name: 'Isınma · Isınma' });
      expect(screen.getByRole('button', { name: 'Düzenle' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Sil' })).toBeEnabled();
      fireEvent.change(screen.getByLabelText('Egzersiz ekle'), {
        target: { value: 'drill' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Plana ekle' }));
      if (failRefresh) {
        await screen.findByText(/Egzersiz ekleme sonrası plan yenilenemedi/);
        expect(
          screen.queryByRole('button', { name: 'Plana ekle' }),
        ).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Planı yenile' }));
      }
      await screen.findByText('Faz notu yok');
      await act(async () => {
        await router.navigate('/app/trainings');
      });
      expect(await screen.findByText('1 faz')).toBeInTheDocument();
      expect(
        screen.getByLabelText('Antrenman kapsamı özeti'),
      ).toHaveTextContent('12 dakika');
      expect(api.listTrainingPlans).not.toHaveBeenCalled();
      expect(api.listDrills).not.toHaveBeenCalled();
      expect(api.getTrainingPlan).not.toHaveBeenCalled();
      expect(api.getTrainingPhaseDocument).not.toHaveBeenCalled();
      expect(api.addTrainingPlanDrill).toHaveBeenCalledTimes(1);
      expect(api.getFilteredDrillPage).toHaveBeenCalledWith(
        'group',
        undefined,
        expect.objectContaining({
          collection: 'ngcs-starter-v1',
          ageScope: 'TEAM',
        }),
        undefined,
      );
      expect(api.addTrainingPlanDrill).toHaveBeenCalledWith('plan', {
        drillId: 'drill',
        phase: 'WARM_UP',
        order: 0,
      });
    },
  );
});
