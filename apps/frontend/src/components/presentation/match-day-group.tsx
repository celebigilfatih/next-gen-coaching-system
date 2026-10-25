import {
  ArrowRight,
  CaretDown,
  MapPin,
  ShieldChevron,
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
  return value || 'Saha belirtilmedi';
}

export function MatchDayGroup({
  dateKey,
  matches,
  teamName,
}: MatchDayGroupProps) {
  const day = new Date(`${dateKey}T12:00:00`);
  const dateLabel = new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'long',
  }).format(day);
  const weekday = new Intl.DateTimeFormat('tr-TR', { weekday: 'long' }).format(
    day,
  );

  return (
    <tbody className="match-day-group" aria-label={`${dateLabel} ${weekday}`}>
      {matches.map((match) => {
        const home = match.location === 'AWAY' ? match.opponent : teamName;
        const away = match.location === 'AWAY' ? teamName : match.opponent;
        return (
          <tr className="match-reference-row" key={match.id}>
            <th scope="row" className="match-reference-row__date">
              <time dateTime={dateKey}>{dateLabel}</time>
              <span>{weekday}</span>
            </th>
            <td className="match-reference-row__time">
              <time dateTime={match.date}>
                {new Intl.DateTimeFormat('tr-TR', {
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(new Date(match.date))}
              </time>
            </td>
            <td className="match-reference-row__fixture-copy">
              <div className="match-reference-row__fixture">
                <span>
                  <ShieldChevron weight="duotone" aria-hidden="true" />
                  <strong>{home}</strong>
                </span>
                <b>{match.result || 'VS'}</b>
                <span>
                  <ShieldChevron weight="duotone" aria-hidden="true" />
                  <strong>{away}</strong>
                </span>
              </div>
              <p className="match-reference-row__competition">
                {match.competition || 'Müsabaka belirtilmedi'}
              </p>
              {match.notes ? (
                <details className="match-reference-row__notes">
                  <summary aria-label={`${match.opponent} maçı koç notu`}>
                    <span>{match.notes}</span>
                    <CaretDown aria-hidden="true" />
                  </summary>
                  <p>{match.notes}</p>
                </details>
              ) : (
                <p className="match-reference-row__no-note">
                  Koç notu eklenmedi.
                </p>
              )}
            </td>
            <td className="match-reference-row__venue">
              <span>
                <MapPin aria-hidden="true" />
                {locationLabel(match.location)}
              </span>
            </td>
            <td className="match-reference-row__preparation">
              <div>
                <span>
                  <Strategy aria-hidden="true" />
                  {match.ourFormation || 'Diziliş belirtilmedi'}
                </span>
                <Badge variant={match.hasBoard ? 'default' : 'outline'}>
                  {match.hasBoard ? 'Tahta hazır' : 'Tahta yok'}
                </Badge>
              </div>
            </td>
            <td className="match-reference-row__action">
              <Button asChild variant="outline" size="sm">
                <Link
                  to={`/app/matches/${match.id}`}
                  aria-label={`${match.opponent} maç detayını aç`}
                >
                  Detay <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </td>
          </tr>
        );
      })}
    </tbody>
  );
}
