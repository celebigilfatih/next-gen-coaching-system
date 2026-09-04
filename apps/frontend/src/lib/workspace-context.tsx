import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  listDrills,
  listGroupMembers,
  listGroups,
  listMatches,
  listSeasons,
  listTrainingPlans,
  type Drill,
  type Group,
  type GroupMember,
  type Match,
  type Season,
  type TrainingPlan,
} from './api';

type WorkspaceState = {
  groups: Group[];
  group?: Group;
  seasons: Season[];
  season?: Season;
  plans: TrainingPlan[];
  matches: Match[];
  drills: Drill[];
  members: GroupMember[];
  loading: boolean;
  error: string;
  selectGroup: (id: string) => void;
  reload: () => Promise<void>;
};

const WorkspaceContext = createContext<WorkspaceState | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupId, setGroupId] = useState('');
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [drills, setDrills] = useState<Drill[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const group = groups.find((item) => item.id === groupId) ?? groups[0];
  const season =
    seasons.find((item) => item.groupId === group?.id) ?? seasons[0];

  async function reload() {
    setLoading(true);
    setError('');
    try {
      const [nextGroups, nextSeasons] = await Promise.all([
        listGroups(),
        listSeasons(),
      ]);
      setGroups(nextGroups);
      setSeasons(nextSeasons);
      const activeGroup =
        nextGroups.find((item) => item.id === groupId) ?? nextGroups[0];
      if (!activeGroup) {
        setPlans([]);
        setMatches([]);
        setDrills([]);
        setMembers([]);
        return;
      }
      setGroupId(activeGroup.id);
      const activeSeason =
        nextSeasons.find((item) => item.groupId === activeGroup.id) ??
        nextSeasons[0];
      const [nextPlans, nextMatches, nextDrills, nextMembers] =
        await Promise.all([
          listTrainingPlans(activeGroup.id),
          activeSeason ? listMatches(activeSeason.id) : Promise.resolve([]),
          listDrills(activeGroup.ageGroup, activeGroup.id),
          listGroupMembers(activeGroup.id),
        ]);
      setPlans(nextPlans);
      setMatches(nextMatches);
      setDrills(nextDrills);
      setMembers(nextMembers);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Çalışma alanı yüklenemedi.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void reload(), 0);
    return () => window.clearTimeout(timer);
    // Initial load only. Group changes are applied explicitly from the selector.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!groupId || loading) return;
    const activeGroup = groups.find((item) => item.id === groupId);
    if (!activeGroup) return;
    const activeSeason =
      seasons.find((item) => item.groupId === groupId) ?? seasons[0];
    Promise.all([
      listTrainingPlans(groupId),
      activeSeason ? listMatches(activeSeason.id) : Promise.resolve([]),
      listDrills(activeGroup.ageGroup, groupId),
      listGroupMembers(groupId),
    ])
      .then(([nextPlans, nextMatches, nextDrills, nextMembers]) => {
        setPlans(nextPlans);
        setMatches(nextMatches);
        setDrills(nextDrills);
        setMembers(nextMembers);
      })
      .catch((cause) =>
        setError(
          cause instanceof Error ? cause.message : 'Takım değiştirilemedi.',
        ),
      )
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const value = useMemo<WorkspaceState>(
    () => ({
      groups,
      group,
      seasons,
      season,
      plans,
      matches,
      drills,
      members,
      loading,
      error,
      selectGroup: (id: string) => {
        setLoading(true);
        setGroupId(id);
      },
      reload,
    }),
    // reload intentionally uses current selection and remains safe between renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      groups,
      group,
      seasons,
      season,
      plans,
      matches,
      drills,
      members,
      loading,
      error,
    ],
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context)
    throw new Error('useWorkspace must be used inside WorkspaceProvider');
  return context;
}
