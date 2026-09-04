import {
  CalendarBlank,
  MapPin,
  SoccerBall,
  Strategy,
} from '@phosphor-icons/react';
import { Link } from 'react-router';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { useWorkspace } from '../lib/workspace-context';

export function meta() {
  return [{ title: 'Maçlar | NGCS' }];
}
export default function MatchesRoute() {
  const { group, matches, loading, error } = useWorkspace();
  const sorted = [...matches].sort((a, b) => a.date.localeCompare(b.date));
  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="page-kicker">Maç hazırlığı</p>
          <h1>Maçlar</h1>
          <p>
            {group?.name ?? 'Takım TBD'} için analiz, notlar ve taktik tahtası.
          </p>
        </div>
      </header>
      {error ? (
        <Alert className="route-error">
          <AlertTitle>Maçlar alınamadı</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {loading ? (
        <div className="loading-grid">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      ) : sorted.length ? (
        <div className="catalog-grid">
          {sorted.map((match) => (
            <Link
              className="list-link"
              to={`/app/matches/${match.id}`}
              key={match.id}
            >
              <Card className="match-card">
                <CardHeader>
                  <div className="card-title-row">
                    <CardTitle>{match.opponent}</CardTitle>
                    <Badge variant="amber">{match.competition || 'Maç'}</Badge>
                  </div>
                  <CardDescription>
                    {match.notes || 'Koç notu eklenmedi.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="meta-row">
                    <span>
                      <CalendarBlank />
                      {new Intl.DateTimeFormat('tr-TR', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      }).format(new Date(match.date))}
                    </span>
                    <span>
                      <MapPin />
                      {match.location}
                    </span>
                    <span>
                      <Strategy />
                      {match.tacticalBoard ? 'Tahta hazır' : 'Tahta bekliyor'}
                    </span>
                    <span>
                      <SoccerBall />
                      {match.ourFormation || 'Diziliş TBD'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <SoccerBall weight="duotone" />
          <h2>Planlanmış maç yok</h2>
          <p>
            Sezon maçları oluşturulduğunda analiz çalışma alanı burada açılır.
          </p>
        </div>
      )}
    </div>
  );
}
