import { Bell } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { getMatchTotal } from '../lib/api';
import { useAssignmentPage } from '../lib/use-assignment-page';
import { useWorkspace } from '../lib/workspace-context';
import { Button } from './ui/button';

export function MatchNotifications() {
  const { group, season, scope, loading, error } = useWorkspace();
  if (loading || error || !group || (!season && scope.clubSeasonId !== '*'))
    return (
      <Button variant="ghost" size="icon" aria-label="Bildirimler" disabled>
        <Bell />
      </Button>
    );
  return (
    <MatchCount
      key={JSON.stringify([scope, group.id, season?.id])}
      groupId={group.id}
      seasonId={scope.clubSeasonId === '*' ? undefined : season?.id}
    />
  );
}
function MatchCount({
  groupId,
  seasonId,
}: {
  groupId: string;
  seasonId?: string;
}) {
  const load = useCallback(
    () => getMatchTotal(groupId, seasonId),
    [groupId, seasonId],
  );
  const state = useAssignmentPage(load);
  return (
    <Button
      variant="ghost"
      size="icon"
      className="ngcs-notifications"
      aria-label="Bildirimler"
      disabled={state.loading}
      title={
        state.error
          ? 'Maç sayısı alınamadı; yeniden dene'
          : state.loading
            ? 'Maç sayısı yükleniyor'
            : 'Bildirimler'
      }
      onClick={() => {
        if (state.error) {
          toast.error('Maç sayısı alınamadı. Yeniden deneniyor.');
          state.retry();
        } else
          toast.info(
            state.data
              ? `${state.data} maç çalışma alanında hazır.`
              : 'Yeni bildiriminiz yok.',
          );
      }}
    >
      <Bell />
      {state.loading ? (
        <span>…</span>
      ) : state.error ? (
        <span>!</span>
      ) : state.data ? (
        <span>{state.data}</span>
      ) : null}
    </Button>
  );
}
