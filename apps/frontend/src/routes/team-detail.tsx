import {
  ArrowLeft,
  IdentificationCard,
  UsersThree,
} from '@phosphor-icons/react';
import { useCallback, useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { ResponsivePlayerList } from '../components/domain/player-list';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { getSportingRosterPage } from '../lib/api';

import { useAssignmentPage } from '../lib/use-assignment-page';
import { AssignmentPageControls } from '../components/assignment-page-controls';

export function meta() {
  return [{ title: 'Takım Kadrosu | NGCS' }];
}

export default function TeamDetailRoute() {
  const { teamId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const asOf =
    searchParams.get('asOf') ?? new Date().toISOString().slice(0, 10);
  const teamSeasonId = searchParams.get('teamSeasonId') ?? undefined;
  return (
    <TeamRoster
      key={teamId + ':' + asOf + ':' + teamSeasonId}
      teamId={teamId!}
      asOf={asOf}
      teamSeasonId={teamSeasonId}
      setDate={(date) =>
        setSearchParams((previous) => {
          const next = new URLSearchParams(previous);
          next.set('asOf', date);
          return next;
        })
      }
    />
  );
}

function TeamRoster({
  teamId,
  asOf,
  teamSeasonId,
  setDate,
}: {
  teamId: string;
  asOf: string;
  teamSeasonId?: string;
  setDate: (date: string) => void;
}) {
  const load = useCallback(
    (after?: string) =>
      getSportingRosterPage(teamId, {
        asOf: `${asOf}T12:00:00.000Z`,
        teamSeasonId,
        after,
      }),
    [teamId, asOf, teamSeasonId],
  );
  const state = useAssignmentPage(load);
  const { data: roster, loading, error } = state;

  const players = useMemo(
    () => roster?.assignments.filter((item) => item.person.playerProfile) ?? [],
    [roster],
  );
  const staff = useMemo(
    () => roster?.assignments.filter((item) => item.person.staffProfile) ?? [],
    [roster],
  );

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="page-kicker">Tarihe göre kadro</p>
          <h1>{roster?.team.name ?? 'Takım'}</h1>
          <p>
            {roster?.team.categoryLabel ?? 'Kategori TBD'} ·{' '}
            {roster?.page.playerAssignments ?? '—'} oyuncu ataması ·{' '}
            {roster?.page.staffAssignments ?? '—'} teknik ekip ataması
          </p>
        </div>
        <div className="page-actions">
          <label className="as-of-control">
            <span>Kadro tarihi</span>
            <input
              aria-label="Kadro tarihi"
              type="date"
              value={asOf}
              onChange={(event) => setDate(event.currentTarget.value)}
            />
          </label>
          <Button variant="outline" asChild>
            <Link
              to={
                roster?.team.categoryLabel === 'A Takım'
                  ? '/app/teams/first-team'
                  : '/app/teams/academy'
              }
            >
              <ArrowLeft />
              {roster?.team.categoryLabel === 'A Takım'
                ? 'A Takıma dön'
                : 'Altyapıya dön'}
            </Link>
          </Button>
        </div>
      </header>
      {error ? (
        <Alert className="route-error">
          <AlertTitle>Kadro alınamadı</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button variant="outline" onClick={state.retry}>
            Tekrar dene
          </Button>
        </Alert>
      ) : null}
      {loading ? (
        <div className="loading-grid">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      ) : error ? null : roster?.assignments.length ? (
        <>
          <section className="sporting-section">
            <div className="sporting-section-title">
              <UsersThree />
              <h2>Oyuncular</h2>
              <Badge>{players.length} bu sayfada</Badge>
            </div>
            <ResponsivePlayerList
              items={players.map((assignment) => ({
                id: assignment.person.id,
                displayName: assignment.person.displayName,
                position:
                  assignment.person.playerProfile?.primaryPosition ?? null,
                preferredFoot:
                  assignment.person.playerProfile?.preferredFoot ?? null,
                assignment: `${assignmentLabel(assignment.assignmentType)} · ${dateLabel(assignment.validFrom)}`,
              }))}
            />
          </section>
          <section className="sporting-section">
            <div className="sporting-section-title">
              <IdentificationCard />
              <h2>Teknik ekip</h2>
              <Badge variant="outline">{staff.length} bu sayfada</Badge>
            </div>
            {staff.length ? (
              <div className="squad-grid">
                {staff.map((assignment) => (
                  <Card key={assignment.id}>
                    <CardHeader>
                      <CardTitle>{assignment.person.displayName}</CardTitle>
                    </CardHeader>
                    <CardContent className="meta-row">
                      <Badge variant="outline">
                        {assignment.roleDefinition.name}
                      </Badge>
                      <span>
                        {assignment.person.staffProfile?.title ??
                          'Görev tanımı TBD'}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="sporting-muted">
                Bu sayfada teknik ekip ataması yok.
              </p>
            )}
          </section>
        </>
      ) : (
        <div className="empty-state">
          <UsersThree weight="duotone" />
          <h2>Bu sayfada atama yok</h2>
          <p>
            Başka bir tarih seçin veya yetkili kullanıcıyla takım ataması
            oluşturun.
          </p>
        </div>
      )}
      <AssignmentPageControls
        label="Kadro sayfaları"
        page={roster?.page}
        count={roster?.assignments.length ?? 0}
        state={state}
      />
    </div>
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

function dateLabel(value: string) {
  return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium' }).format(
    new Date(value),
  );
}
