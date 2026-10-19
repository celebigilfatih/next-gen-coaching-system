import {
  ArrowRight,
  MapPin,
  ShieldChevron,
  SoccerBall,
  Strategy,
} from '@phosphor-icons/react';
import { Link } from 'react-router';
import type { MatchCatalogItem } from '../../lib/api';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

type MatchDayGroupProps = {
  dateKey: string;
  matches: MatchCatalogItem[];
  teamName: string;
};

function locationLabel(value: string) {
  if (value === 'HOME') return 'İç saha';
  if (value === 'AWAY') return 'Deplasman';
  return value || 'Konum TBD';
}

function dayLabel(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'full',
  }).format(new Date(`${value}T12:00:00`));
}

export function MatchDayGroup({
  dateKey,
  matches,
  teamName,
}: MatchDayGroupProps) {
  const titleId = `match-day-${dateKey}`;
  return (
    <section className="match-day-group" aria-labelledby={titleId}>
      <header className="match-day-group__header">
        <h2 id={titleId}>{dayLabel(dateKey)}</h2>
        <span>{matches.length} maç</span>
      </header>
      <div className="match-day-group__rows">
        {matches.map((match) => {
          const home = match.location === 'AWAY' ? match.opponent : teamName;
          const away = match.location === 'AWAY' ? teamName : match.opponent;
          return (
            <article className="match-reference-row" key={match.id}>
              <time dateTime={match.date}>
                {new Intl.DateTimeFormat('tr-TR', {
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(new Date(match.date))}
              </time>
              <Badge variant="secondary">
                {match.competition || 'Müsabaka TBD'}
              </Badge>
              <div className="match-reference-row__fixture-copy">
                <div className="match-reference-row__fixture">
                  <span>
                    <ShieldChevron weight="duotone" aria-hidden="true" />
                    <strong>{home}</strong>
                  </span>
                  <b>{match.result || 'VS'}</b>
                  <span>
                    <SoccerBall weight="duotone" aria-hidden="true" />
                    <strong>{away}</strong>
                  </span>
                </div>
                <small>{match.notes || 'Koç notu eklenmedi.'}</small>
              </div>
              <div className="match-reference-row__meta">
                <span>
                  <MapPin aria-hidden="true" />
                  {locationLabel(match.location)}
                </span>
                <span>
                  <Strategy aria-hidden="true" />
                  {match.ourFormation || 'Diziliş TBD'}
                </span>
                <Badge variant={match.hasBoard ? 'default' : 'outline'}>
                  {match.hasBoard ? 'Tahta hazır' : 'Tahta yok'}
                </Badge>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link
                  to={`/app/matches/${match.id}`}
                  aria-label={`${match.opponent} maç detayını aç`}
                >
                  Detay <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
