import { ShieldChevron, UsersThree } from '@phosphor-icons/react';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { useWorkspace } from '../lib/workspace-context';

export function meta() {
  return [{ title: 'Kadro | NGCS' }];
}
export default function SquadRoute() {
  const { group, members, loading, error } = useWorkspace();
  const players = members.filter((member) => member.user.role === 'PLAYER');
  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="page-kicker">Takım görünümü</p>
          <h1>Kadro</h1>
          <p>
            {group?.name ?? 'Takım TBD'} · {players.length} oyuncu
          </p>
        </div>
      </header>
      {error ? (
        <Alert className="route-error">
          <AlertTitle>Kadro alınamadı</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {loading ? (
        <div className="loading-grid">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      ) : players.length ? (
        <div className="squad-grid">
          {players.map((member, index) => (
            <Card key={member.id}>
              <CardHeader className="player-card-head">
                <div className="squad-number">{index + 1}</div>
                <div>
                  <CardTitle>{member.user.name}</CardTitle>
                  <span className="player-email">{member.user.email}</span>
                </div>
              </CardHeader>
              <CardContent className="meta-row">
                <Badge variant="outline">
                  {member.user.position || 'Pozisyon TBD'}
                </Badge>
                <span>
                  <ShieldChevron />
                  {group?.ageGroup ?? 'Yaş grubu TBD'}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <UsersThree weight="duotone" />
          <h2>Oyuncu bulunamadı</h2>
          <p>Bu gruba atanmış oyuncular burada görünecek.</p>
        </div>
      )}
    </div>
  );
}
