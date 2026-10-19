import { ArrowRight, IdentificationBadge } from '@phosphor-icons/react';
import { Link } from 'react-router';
import type { SportingPlayer, SportingPosition } from '../../lib/api';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export type PlayerListEntry = {
  id: string;
  displayName: string;
  position: SportingPosition | null;
  preferredFoot: SportingPlayer['playerProfile']['preferredFoot'];
  assignment: string;
};

export function ResponsivePlayerList({ items }: { items: PlayerListEntry[] }) {
  return (
    <>
      <div className="player-list-table-wrap">
        <table className="player-list-table">
          <caption className="sr-only">Oyuncu listesi</caption>
          <thead>
            <tr>
              <th scope="col">Oyuncu</th>
              <th scope="col">Pozisyon</th>
              <th scope="col">Tercih edilen ayak</th>
              <th scope="col">Güncel atama</th>
              <th scope="col" className="player-list-table__action">
                İşlem
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((player) => (
              <tr key={player.id}>
                <td data-label="Oyuncu">
                  <div className="player-list-identity">
                    <span aria-hidden="true">
                      <IdentificationBadge weight="duotone" />
                    </span>
                    <strong>{player.displayName}</strong>
                  </div>
                </td>
                <td data-label="Pozisyon">{positionLabel(player.position)}</td>
                <td data-label="Ayak">{footLabel(player.preferredFoot)}</td>
                <td data-label="Atama">
                  <Badge variant="outline">{player.assignment}</Badge>
                </td>
                <td data-label="İşlem" className="player-list-table__action">
                  <Button asChild variant="ghost" size="sm">
                    <Link to={`/app/players/${player.id}`}>
                      Profili aç <ArrowRight aria-hidden="true" />
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function positionLabel(position: SportingPosition | null) {
  if (!position) return 'Pozisyon belirtilmemiş';
  return (
    {
      KALECI: 'Kaleci',
      DEFANS: 'Defans',
      ORTA_SAHA: 'Orta saha',
      FORVET: 'Forvet',
    }[position] ?? 'Pozisyon belirtilmemiş'
  );
}

export function footLabel(
  foot: SportingPlayer['playerProfile']['preferredFoot'],
) {
  if (!foot) return 'Belirtilmemiş';
  return (
    {
      LEFT: 'Sol',
      RIGHT: 'Sağ',
      BOTH: 'İki ayak',
      UNKNOWN: 'Belirtilmemiş',
    }[foot] ?? 'Belirtilmemiş'
  );
}
