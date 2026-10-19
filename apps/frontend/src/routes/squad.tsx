import {
  IdentificationBadge,
  ShieldChevron,
  UsersThree,
} from '@phosphor-icons/react';
import { useCallback, useRef } from 'react';
import { ResponsivePlayerList } from '../components/domain/player-list';
import { PagePagination } from '../components/feedback/page-pagination';
import { MetricCard } from '../components/presentation/metric-card';
import { PageHero } from '../components/presentation/page-hero';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import teamsHero from '../assets/teams-hero.png';
import { getSportingRosterPage } from '../lib/api';
import { getSession } from '../lib/session';
import { useAssignmentPage } from '../lib/use-assignment-page';
import { useWorkspace } from '../lib/workspace-context';

export function meta() {
  return [{ title: 'Kadro | NGCS' }];
}

export default function SquadRoute() {
  const { team, teamSeason, loading, error, reload } = useWorkspace();
  return (
    <div className="page-shell player-operations-reference squad-reference">
      <PageHero
        className="player-operations-reference__hero squad-reference__hero"
        image={teamsHero}
        eyebrow="Takım görünümü"
        title="Kadro"
        description={`${team?.name ?? 'Takım TBD'} için güncel ve yetki filtreli oyuncu listesi.`}
      />
      {error ? (
        <Alert className="route-error">
          <AlertTitle>Kadro alınamadı</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button onClick={() => void reload()}>Tekrar dene</Button>
        </Alert>
      ) : null}
      {loading ? (
        <div className="loading-grid">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      ) : error ? null : getSession()?.user.role === 'PLAYER' ? (
        <p>Bu rol için takım kadrosu erişimi bulunmuyor.</p>
      ) : !team ? (
        <p>Bu takım için kadro bağlamı bulunmuyor.</p>
      ) : (
        <SquadMembers
          key={`${team.id}:${teamSeason?.id ?? '*'}`}
          teamId={team.id}
          teamName={team.name}
          ageGroup={team.ageGroupLabel}
          teamSeasonId={teamSeason?.id}
        />
      )}
    </div>
  );
}

function SquadMembers({
  teamId,
  teamName,
  ageGroup,
  teamSeasonId,
}: {
  teamId: string;
  teamName: string;
  ageGroup: string | null;
  teamSeasonId?: string;
}) {
  const asOf = useRef(new Date().toISOString()).current;
  const load = useCallback(
    (after?: string) =>
      getSportingRosterPage(teamId, { asOf, teamSeasonId, after }),
    [asOf, teamId, teamSeasonId],
  );
  const state = useAssignmentPage(load);
  const roster = state.data;
  const players =
    roster?.assignments.filter((item) => item.person.playerProfile) ?? [];
  const playerTotal = roster?.page.playerAssignments ?? 0;
  return (
    <section
      className="player-operations-reference__directory squad-reference__directory"
      aria-labelledby="squad-directory-title"
    >
      {roster && (
        <div className="player-operations-reference__metrics squad-reference__metrics">
          <p className="sr-only" aria-label="Kadro toplamı">
            {playerTotal} oyuncu
          </p>
          <MetricCard
            icon={UsersThree}
            label="Toplam oyuncu"
            value={playerTotal}
            detail="Güncel sportif atama"
          />
          <MetricCard
            icon={IdentificationBadge}
            label="Bu sayfa"
            value={players.length}
            detail={`Sayfa ${state.pageNumber}`}
            tone="violet"
          />
          <MetricCard
            icon={ShieldChevron}
            label="Yaş grubu"
            value={ageGroup || 'TBD'}
            detail={teamName}
            tone="teal"
          />
        </div>
      )}
      <header className="player-operations-reference__section-head">
        <div>
          <p className="page-kicker">Kadro dizini</p>
          <h2 id="squad-directory-title">Güncel Oyuncular</h2>
        </div>
        {roster && <span>{playerTotal} oyuncu</span>}
      </header>
      {state.loading ? (
        <div role="status" aria-label="Kadro yükleniyor">
          <Skeleton className="h-44" />
        </div>
      ) : state.error ? (
        <Alert role="alert">
          <AlertTitle>Kadro alınamadı</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
          <Button onClick={state.retry}>Kadroyu tekrar yükle</Button>
        </Alert>
      ) : players.length ? (
        <ResponsivePlayerList
          items={players.map((assignment) => ({
            id: assignment.person.id,
            displayName: assignment.person.displayName,
            position: assignment.person.playerProfile?.primaryPosition ?? null,
            preferredFoot:
              assignment.person.playerProfile?.preferredFoot ?? null,
            assignment: assignmentLabel(assignment.assignmentType),
          }))}
        />
      ) : (
        <div className="empty-state">
          <UsersThree weight="duotone" />
          <h2>
            {playerTotal === 0 ? 'Oyuncu bulunamadı' : 'Bu sayfada oyuncu yok'}
          </h2>
          <p>
            {playerTotal === 0
              ? 'Bu takıma atanmış oyuncular burada görünecek.'
              : 'Önceki sayfaya dönebilirsiniz.'}
          </p>
        </div>
      )}
      <PagePagination
        label="Kadro sayfaları"
        previousDisabled={state.loading || state.pageNumber === 1}
        onPrevious={state.previous}
        summary={
          <>
            Sayfa {state.pageNumber}
            {roster ? ` · ${players.length} / ${playerTotal} oyuncu` : ''}
          </>
        }
        nextDisabled={state.loading || !roster?.page.nextCursor}
        onNext={() => {
          if (roster?.page.nextCursor) state.next(roster.page.nextCursor);
        }}
      />
    </section>
  );
}

function assignmentLabel(value: string) {
  return (
    (
      {
        LEGACY_MEMBER: 'Mevcut üye',
        PRIMARY_REGISTERED: 'Ana takım',
        TRAINING_GUEST: 'Antrenman misafiri',
        MATCH_ELIGIBLE: 'Maç uygun',
        LOAN_IN: 'Kiralık gelen',
        LOAN_OUT: 'Kiralık giden',
        INTERNATIONAL_DUTY: 'Milli takım',
        STAFF: 'Teknik ekip',
      } as Record<string, string>
    )[value] ?? value
  );
}
