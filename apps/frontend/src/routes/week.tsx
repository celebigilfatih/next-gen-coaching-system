import {
  CalendarBlank,
  CaretLeft,
  CaretRight,
  Clock,
  SoccerBall,
  Target,
} from '@phosphor-icons/react';
import { useCallback } from 'react';
import teamsHero from '../assets/teams-hero.png';
import { PageHero } from '../components/presentation/page-hero';
import { getTrainingDayPage, getMatchDayPage } from '../lib/api';
import { useAssignmentPage } from '../lib/use-assignment-page';
import { Link, useSearchParams } from 'react-router';
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
import { useWorkspace } from '../lib/workspace-context';
import { workspaceSeasonLabel } from '../lib/workspace-scope';
import {
  addDays,
  parseWeekStart,
  sameLocalDay,
  startOfLocalWeek,
  toLocalDateKey,
  weekDays,
  weekLabel,
} from '../lib/week';

export function meta() {
  return [{ title: 'Hafta | NGCS' }];
}

export default function WeekRoute() {
  const { group, season, scope, loading, error } = useWorkspace();
  const [params, setParams] = useSearchParams();
  const start = parseWeekStart(params.get('start'));
  const days = weekDays(start);

  function selectWeek(date: Date) {
    const next = new URLSearchParams(params);
    next.set('start', toLocalDateKey(startOfLocalWeek(date)));
    setParams(next);
  }
  function move(amount: number) {
    selectWeek(addDays(start, amount * 7));
  }

  return (
    <div className="page-shell week-page week-reference">
      <PageHero
        className="week-reference__hero"
        image={teamsHero}
        eyebrow="Hafta"
        title="Haftalık Plan"
        description={`${group?.name ?? 'Takım TBD'} · ${workspaceSeasonLabel(scope, season?.name)} için antrenman ve maç akışını tek görünümde takip edin.`}
      />
      <section
        className="week-reference__toolbar"
        aria-label="Hafta görünümü kontrolleri"
      >
        <div className="week-reference__range">
          <span className="week-reference__range-icon" aria-hidden="true">
            <CalendarBlank weight="duotone" />
          </span>
          <div>
            <small>Pazartesi – Pazar</small>
            <strong>{weekLabel(start)}</strong>
          </div>
        </div>
        <div className="week-controls">
          <Button
            variant="outline"
            size="icon"
            onClick={() => move(-1)}
            aria-label="Önceki hafta"
          >
            <CaretLeft />
          </Button>
          <Button variant="outline" onClick={() => selectWeek(new Date())}>
            Bugün
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => move(1)}
            aria-label="Sonraki hafta"
          >
            <CaretRight />
          </Button>
          <input
            aria-label="Hafta seç"
            type="date"
            value={toLocalDateKey(start)}
            onChange={(event) => {
              if (event.target.value)
                selectWeek(new Date(`${event.target.value}T12:00:00`));
            }}
          />
        </div>
      </section>
      {error ? (
        <Alert className="route-error">
          <AlertTitle>Veri alınamadı</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <p className="week-reference__note">
        Tarihsiz taslaklar haftalık görünümde yer almaz.{' '}
        <Link className="underline" to="/app/trainings">
          Tarihsiz taslakları gör
        </Link>{' '}
      </p>
      {loading ? (
        <div className="loading-grid">
          {days.slice(0, 3).map((day) => (
            <Skeleton className="h-64" key={day.toISOString()} />
          ))}
        </div>
      ) : error ? null : !group ? (
        <p>Bu takım için antrenman bağlamı bulunmuyor.</p>
      ) : (
        <div className="week-board">
          {days.map((day) => {
            const today = sameLocalDay(new Date(), day);
            return (
              <Card
                key={day.toISOString()}
                className={today ? 'week-day today' : 'week-day'}
              >
                <CardHeader className="week-day-header">
                  <div>
                    <span>
                      {new Intl.DateTimeFormat('tr-TR', { weekday: 'long' })
                        .format(day)
                        .toLocaleUpperCase('tr-TR')}
                    </span>
                    <small>
                      {new Intl.DateTimeFormat('tr-TR', {
                        month: 'long',
                      }).format(day)}
                    </small>
                  </div>
                  <CardTitle>{day.getDate()}</CardTitle>
                  {today ? <Badge>Bugün</Badge> : null}
                </CardHeader>
                <CardContent className="week-events">
                  <DayEvents
                    key={JSON.stringify([
                      scope.clubId,
                      scope.clubSeasonId,
                      scope.teamId,
                      group.id,
                      season?.id,
                      day.toISOString(),
                    ])}
                    groupId={group.id}
                    seasonId={season?.id}
                    from={day.toISOString()}
                    until={addDays(day, 1).toISOString()}
                    label={toLocalDateKey(day)}
                    matchContextReady={
                      Boolean(season) || scope.clubSeasonId === '*'
                    }
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DayEvents({
  groupId,
  seasonId,
  from,
  until,
  label,
  matchContextReady,
}: {
  groupId: string;
  seasonId?: string;
  from: string;
  until: string;
  label: string;
  matchContextReady: boolean;
}) {
  const load = useCallback(
    (after?: string) =>
      getTrainingDayPage(groupId, seasonId, from, until, after),
    [groupId, seasonId, from, until],
  );
  const state = useAssignmentPage(load);
  const page = state.data;
  const loadMatches = useCallback(
    (after?: string) =>
      matchContextReady
        ? getMatchDayPage(groupId, seasonId, from, until, after)
        : Promise.resolve(undefined),
    [groupId, seasonId, from, until, matchContextReady],
  );
  const matches = useAssignmentPage(loadMatches);
  const matchPage = matches.data;
  return (
    <>
      <section aria-label={`${label} antrenmanları`} className="space-y-2">
        {state.loading ? (
          <div role="status" aria-label="Gün yükleniyor">
            <Skeleton className="h-20" />
          </div>
        ) : state.error ? (
          <Alert role="alert">
            <AlertDescription>{state.error}</AlertDescription>
            <Button variant="outline" onClick={state.retry}>
              Tekrar dene
            </Button>
          </Alert>
        ) : (
          <>
            {page && page.summary.total > 0 && (
              <p className="text-xs text-muted-foreground">
                {page.summary.total} plan · {page.summary.totalDuration} dk
              </p>
            )}
            {page?.items.map((plan) => (
              <Link
                className="week-event training"
                key={plan.id}
                to={`/app/trainings/${plan.id}`}
              >
                <Target weight="duotone" />
                <span>
                  <strong>{plan.title}</strong>
                  <small>
                    <Clock />
                    {formatTime(plan.date)} · {plan.totalDuration} dk
                  </small>
                </span>
              </Link>
            ))}
            {!page?.items.length &&
              (page?.summary.total === 0 &&
              matchContextReady &&
              matchPage?.total === 0 ? (
                <span className="week-empty">Planlanmış etkinlik yok</span>
              ) : state.pageNumber > 1 ? (
                <p className="week-empty">Bu sayfada plan yok</p>
              ) : null)}
          </>
        )}
        {(state.pageNumber > 1 || page?.nextCursor) && (
          <nav
            aria-label={`${label} plan sayfaları`}
            className="flex flex-wrap gap-2"
          >
            <Button
              size="sm"
              variant="outline"
              disabled={state.loading || state.pageNumber === 1}
              onClick={state.previous}
            >
              Önceki sayfa
            </Button>
            <span className="text-xs" role="status">
              Sayfa {state.pageNumber}
              {page
                ? ` · ${page.items.length} / ${page.summary.total} plan`
                : ''}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={state.loading || !page?.nextCursor}
              onClick={() => {
                if (page?.nextCursor) state.next(page.nextCursor);
              }}
            >
              Sonraki sayfa
            </Button>
          </nav>
        )}
      </section>
      <section aria-label={`${label} maçları`} className="space-y-2">
        {!matchContextReady ? (
          <p className="week-empty">Bu sezon için maç bağlamı bulunmuyor.</p>
        ) : matches.loading ? (
          <div role="status" aria-label="Maçlar yükleniyor">
            <Skeleton className="h-20" />
          </div>
        ) : matches.error ? (
          <Alert role="alert">
            <AlertDescription>{matches.error}</AlertDescription>
            <Button
              variant="outline"
              aria-label="Maçları tekrar dene"
              onClick={matches.retry}
            >
              Tekrar dene
            </Button>
          </Alert>
        ) : (
          <>
            {matchPage && matchPage.total > 0 && (
              <p className="text-xs text-muted-foreground">
                {matchPage.total} maç
              </p>
            )}
            {matchPage?.items.map((match) => (
              <Link
                className="week-event match"
                key={match.id}
                to={`/app/matches/${match.id}`}
              >
                <SoccerBall weight="duotone" />
                <span>
                  <strong>{match.opponent}</strong>
                  <small>
                    <Clock />
                    {formatTime(match.date)} · {match.location}
                  </small>
                </span>
              </Link>
            ))}
            {!matchPage?.items.length && matches.pageNumber > 1 && (
              <p className="week-empty">Bu sayfada maç yok</p>
            )}
          </>
        )}
        {(matches.pageNumber > 1 || matchPage?.nextCursor) && (
          <nav
            aria-label={`${label} maç sayfaları`}
            className="flex flex-wrap gap-2"
          >
            <Button
              size="sm"
              variant="outline"
              aria-label="Önceki maçlar"
              disabled={matches.loading || matches.pageNumber === 1}
              onClick={matches.previous}
            >
              Önceki
            </Button>
            <span className="text-xs" role="status">
              Sayfa {matches.pageNumber}
              {matchPage
                ? ` · ${matchPage.items.length} / ${matchPage.total} maç`
                : ''}
            </span>
            <Button
              size="sm"
              variant="outline"
              aria-label="Sonraki maçlar"
              disabled={matches.loading || !matchPage?.nextCursor}
              onClick={() => {
                if (matchPage?.nextCursor) matches.next(matchPage.nextCursor);
              }}
            >
              Sonraki
            </Button>
          </nav>
        )}
      </section>
    </>
  );
}

function formatTime(value: string | null) {
  if (!value) return 'TBD';
  const date = new Date(value);
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
