import {
  CalendarBlank,
  CaretLeft,
  CaretRight,
  Clock,
  SoccerBall,
  Target,
} from '@phosphor-icons/react';
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
  const { group, season, plans, matches, loading, error } = useWorkspace();
  const [params, setParams] = useSearchParams();
  const start = parseWeekStart(params.get('start'));
  const days = weekDays(start);

  function move(amount: number) {
    setParams({ start: toLocalDateKey(addDays(start, amount * 7)) });
  }

  return (
    <div className="page-shell week-page">
      <header className="page-header">
        <div>
          <p className="page-kicker">Operasyon takvimi</p>
          <h1>Hafta</h1>
          <p>
            {group?.name ?? 'Takım TBD'} · {season?.name ?? 'Sezon TBD'}
          </p>
        </div>
        <div className="page-actions week-controls">
          <Button
            variant="outline"
            size="icon"
            onClick={() => move(-1)}
            aria-label="Önceki hafta"
          >
            <CaretLeft />
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              setParams({ start: toLocalDateKey(startOfLocalWeek(new Date())) })
            }
          >
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
            onChange={(event) =>
              setParams({
                start: toLocalDateKey(
                  startOfLocalWeek(new Date(`${event.target.value}T12:00:00`)),
                ),
              })
            }
          />
        </div>
      </header>
      <div className="week-title">
        <CalendarBlank weight="duotone" />
        <strong>{weekLabel(start)}</strong>
      </div>
      {error ? (
        <Alert className="route-error">
          <AlertTitle>Veri alınamadı</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {loading ? (
        <div className="loading-grid">
          {days.slice(0, 3).map((day) => (
            <Skeleton className="h-64" key={day.toISOString()} />
          ))}
        </div>
      ) : (
        <div className="week-board">
          {days.map((day) => {
            const dayPlans = plans.filter(
              (plan) => plan.date && sameLocalDay(plan.date, day),
            );
            const dayMatches = matches.filter((match) =>
              sameLocalDay(match.date, day),
            );
            const today = sameLocalDay(new Date(), day);
            return (
              <Card
                key={day.toISOString()}
                className={today ? 'week-day today' : 'week-day'}
              >
                <CardHeader className="week-day-header">
                  <span>
                    {new Intl.DateTimeFormat('tr-TR', { weekday: 'short' })
                      .format(day)
                      .toLocaleUpperCase('tr-TR')}
                  </span>
                  <CardTitle>{day.getDate()}</CardTitle>
                  <small>
                    {new Intl.DateTimeFormat('tr-TR', { month: 'long' }).format(
                      day,
                    )}
                  </small>
                  {today ? <Badge>Bugün</Badge> : null}
                </CardHeader>
                <CardContent className="week-events">
                  {dayPlans.map((plan) => (
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
                  {dayMatches.map((match) => (
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
                  {!dayPlans.length && !dayMatches.length ? (
                    <span className="week-empty">Planlanmış etkinlik yok</span>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
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
