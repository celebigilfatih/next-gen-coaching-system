import {
  CalendarBlank,
  CaretLeft,
  CaretRight,
  Clock,
  Plus,
  SoccerBall,
  Target,
  UsersThree,
  Moon,
} from '@phosphor-icons/react';
import { useCallback, useState, useSyncExternalStore } from 'react';
import { Link, useSearchParams } from 'react-router';
import teamsHero from '../assets/teams-hero.png';
import { PageHero } from '../components/presentation/page-hero';
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
import { getPlanningPage } from '../lib/api';
import { useAssignmentPage } from '../lib/use-assignment-page';
import { useWorkspace } from '../lib/workspace-context';
import { getSession, subscribeSession } from '../lib/session';
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
import {
  planningLabels,
  planningTime,
  type PlanningEvent,
} from '../lib/planning';
import {
  WeekDeleteDialog,
  WeekEventDialog,
  WeekProgramDialog,
} from '../components/week-planning-dialogs';
import '../styles/week-planning.css';

export function meta() {
  return [{ title: 'Hafta | NGCS' }];
}
export default function WeekRoute() {
  const { group, season, scope, loading, error } = useWorkspace();
  const [params, setParams] = useSearchParams();
  const start = parseWeekStart(params.get('start'));
  const days = weekDays(start);
  const session = useSyncExternalStore(
    subscribeSession,
    getSession,
    () => null,
  );
  const writable = !!session && session.user.role !== 'PLAYER';
  const [revision, setRevision] = useState(0);
  const [dialog, setDialog] = useState<'program' | 'event' | 'delete' | null>(
    () => (params.has('planningRequest') ? 'program' : null),
  );
  const [selected, setSelected] = useState<PlanningEvent>();
  const [eventDay, setEventDay] = useState(toLocalDateKey(start));
  const resourceKey = JSON.stringify([
    scope.clubId,
    scope.clubSeasonId,
    scope.teamId,
    group?.id,
    season?.id,
  ]);
  function selectWeek(date: Date) {
    const next = new URLSearchParams(params);
    next.set('start', toLocalDateKey(startOfLocalWeek(date)));
    setParams(next);
  }
  function add(day: string) {
    if (params.has('planningRequest')) {
      setDialog('program');
      return;
    }
    setEventDay(day);
    setSelected(undefined);
    setDialog('event');
  }
  return (
    <div className="page-shell week-page week-reference">
      <PageHero
        className="week-reference__hero"
        image={teamsHero}
        eyebrow="Hafta"
        title="Haftalık Plan"
        description={`${group?.name ?? 'Takım TBD'} · ${workspaceSeasonLabel(scope, season?.name)} için antrenman, toplantı ve maç akışını yönetin.`}
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
            onClick={() => selectWeek(addDays(start, -7))}
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
            onClick={() => selectWeek(addDays(start, 7))}
            aria-label="Sonraki hafta"
          >
            <CaretRight />
          </Button>
          <input
            aria-label="Hafta seç"
            type="date"
            value={toLocalDateKey(start)}
            onChange={(e) => {
              if (e.target.value)
                selectWeek(new Date(`${e.target.value}T12:00:00`));
            }}
          />
        </div>
      </section>
      {writable && (
        <div className="week-planning-actions">
          <Button
            disabled={!season || loading}
            onClick={() => add(toLocalDateKey(start))}
          >
            <Plus />
            Etkinlik ekle
          </Button>
          <Button
            variant="outline"
            disabled={!season || loading || scope.clubSeasonId === '*'}
            onClick={() => setDialog('program')}
          >
            Haftalık program hazırla
          </Button>
          {!season && (
            <p>Etkinlik yönetimi için belirli bir takım ve sezon seçin.</p>
          )}
        </div>
      )}
      {error && (
        <Alert className="route-error">
          <AlertTitle>Veri alınamadı</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <p className="week-reference__note">
        Tarihsiz taslaklar haftalık görünümde yer almaz.{' '}
        <Link className="underline" to="/app/trainings">
          Tarihsiz taslakları gör
        </Link>
      </p>
      {loading ? (
        <div className="loading-grid">
          {days.slice(0, 3).map((day) => (
            <Skeleton className="h-64" key={day.toISOString()} />
          ))}
        </div>
      ) : error ? null : !group ? (
        <p>Bu takım için antrenman bağlamı bulunmuyor.</p>
      ) : !season && scope.clubSeasonId !== '*' ? (
        <p>Seçili sezon için takvim bağlamı bulunmuyor.</p>
      ) : (
        <div className="week-board">
          {days.map((day) => (
            <Card
              key={day.toISOString()}
              className={
                sameLocalDay(new Date(), day) ? 'week-day today' : 'week-day'
              }
            >
              <CardHeader className="week-day-header">
                <div>
                  <span>
                    {new Intl.DateTimeFormat('tr-TR', { weekday: 'long' })
                      .format(day)
                      .toLocaleUpperCase('tr-TR')}
                  </span>
                  <small>
                    {new Intl.DateTimeFormat('tr-TR', { month: 'long' }).format(
                      day,
                    )}
                  </small>
                </div>
                <CardTitle>{day.getDate()}</CardTitle>
                {sameLocalDay(new Date(), day) && <Badge>Bugün</Badge>}
              </CardHeader>
              <CardContent className="week-events">
                <DayEvents
                  key={`${resourceKey}:${day.toISOString()}:${revision}`}
                  groupId={group.id}
                  seasonId={season?.id}
                  from={day.toISOString()}
                  until={addDays(day, 1).toISOString()}
                  label={toLocalDateKey(day)}
                  writable={writable && !!season}
                  onAdd={() => add(toLocalDateKey(day))}
                  onEdit={(e) => {
                    setSelected(e);
                    setDialog('event');
                  }}
                  onDelete={(e) => {
                    setSelected(e);
                    setDialog('delete');
                  }}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {writable && dialog === 'program' && (
        <WeekProgramDialog
          key={`${resourceKey}:program`}
          clubSeasonId={scope.clubSeasonId}
          seasonId={season?.id}
          weekStart={toLocalDateKey(start)}
          onClose={() => setDialog(null)}
          onSaved={() => setRevision((v) => v + 1)}
        />
      )}
      {writable && dialog === 'event' && season && (
        <WeekEventDialog
          key={`${resourceKey}:${selected?.id ?? eventDay}`}
          seasonId={season.id}
          day={eventDay}
          event={selected}
          onClose={() => setDialog(null)}
          onSaved={() => setRevision((v) => v + 1)}
        />
      )}
      {writable && dialog === 'delete' && selected && (
        <WeekDeleteDialog
          key={`${resourceKey}:${selected.id}:delete`}
          event={selected}
          onClose={() => setDialog(null)}
          onSaved={() => setRevision((v) => v + 1)}
        />
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
  writable,
  onAdd,
  onEdit,
  onDelete,
}: {
  groupId: string;
  seasonId?: string;
  from: string;
  until: string;
  label: string;
  writable: boolean;
  onAdd: () => void;
  onEdit: (e: PlanningEvent) => void;
  onDelete: (e: PlanningEvent) => void;
}) {
  const load = useCallback(
    (after?: string) => getPlanningPage(groupId, seasonId, from, until, after),
    [groupId, seasonId, from, until],
  );
  const state = useAssignmentPage(load),
    page = state.data;
  return (
    <section aria-label={`${label} etkinlikleri`} className="week-day-events">
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
            <p className="week-daily-summary">
              {page.summary.trainingCount} antrenman ·{' '}
              {page.summary.trainingMinutes} dk
              {page.summary.meetingCount > 0
                ? ` · ${page.summary.meetingCount} toplantı`
                : ''}
              {page.summary.matchCount > 0
                ? ` · ${page.summary.matchCount} maç`
                : ''}
            </p>
          )}
          {page?.items.map((e) => {
            const Icon =
              e.kind === 'MATCH'
                ? SoccerBall
                : e.kind === 'TOPLANTI'
                  ? UsersThree
                  : e.kind === 'REST'
                    ? Moon
                    : Target;
            const content = (
              <>
                <Icon weight="duotone" />
                <span>
                  <Badge variant="secondary">
                    {planningLabels[e.kind] ?? 'Etkinlik'}
                  </Badge>
                  <strong>{e.title}</strong>
                  <small>
                    <Clock />
                    {planningTime(e.date)}
                    {e.duration > 0 ? ` · ${e.duration} dk` : ''}
                  </small>
                  {e.location && <small>{e.location}</small>}
                  {e.topic && <small>{e.topic}</small>}
                </span>
              </>
            );
            return (
              <article
                key={`${e.source}:${e.id}`}
                className={`week-event-block kind-${e.kind.toLowerCase()}`}
              >
                {e.source === 'plan' || e.source === 'match' ? (
                  <Link
                    className={`week-event ${e.source === 'match' ? 'match' : 'training'}`}
                    to={
                      e.source === 'match'
                        ? `/app/matches/${e.id}`
                        : `/app/trainings/${e.id}`
                    }
                  >
                    {content}
                  </Link>
                ) : (
                  <div className="week-event meeting">{content}</div>
                )}
                {e.source === 'event' && e.notes && (
                  <details className="week-event-notes">
                    <summary>Notları göster</summary>
                    <p>{e.notes}</p>
                  </details>
                )}
                {writable && e.source !== 'match' && e.kind !== 'MATCH' && (
                  <div className="week-event-tools">
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`${e.title} düzenle`}
                      onClick={() => onEdit(e)}
                    >
                      Düzenle
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`${e.title} sil`}
                      onClick={() => onDelete(e)}
                    >
                      Sil
                    </Button>
                  </div>
                )}
              </article>
            );
          })}
          {!page?.items.length && (
            <span className="week-empty">
              {state.pageNumber > 1
                ? 'Bu sayfada etkinlik yok'
                : 'Planlanmış etkinlik yok'}
            </span>
          )}
          {(state.pageNumber > 1 || page?.nextCursor) && (
            <nav
              aria-label={`${label} etkinlik sayfaları`}
              className="week-event-paging"
            >
              <Button
                size="sm"
                variant="outline"
                disabled={state.loading || state.pageNumber === 1}
                onClick={state.previous}
              >
                Önceki
              </Button>
              <span>
                Sayfa {state.pageNumber} · {page?.summary.total ?? 0} etkinlik
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={state.loading || !page?.nextCursor}
                onClick={() => {
                  if (page?.nextCursor) state.next(page.nextCursor);
                }}
              >
                Sonraki
              </Button>
            </nav>
          )}
        </>
      )}
      {writable && (
        <Button
          variant="outline"
          size="sm"
          className="week-add-event"
          onClick={onAdd}
        >
          <Plus />
          Ekle
        </Button>
      )}
    </section>
  );
}
