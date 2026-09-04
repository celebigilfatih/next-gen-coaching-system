import { Copy, Plus, Strategy } from '@phosphor-icons/react';
import { Link } from 'react-router';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
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
  return [{ title: 'Taktik Tahtası | NGCS' }];
}

export default function TacticsRoute() {
  const { drills, group, loading, error } = useWorkspace();
  const tacticalDrills = drills.filter(
    (drill) =>
      drill.jsonData &&
      typeof drill.jsonData === 'object' &&
      (drill.jsonData as { kind?: string }).kind === 'tactical-board',
  );
  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="page-kicker">Ortak çalışma alanı</p>
          <h1>Taktik Tahtası</h1>
          <p>
            {group?.name ?? 'Takım TBD'} için kulüp ve global egzersiz
            kütüphanesi.
          </p>
        </div>
        <div className="page-actions">
          <Button asChild>
            <Link to="/app/tactics/new">
              <Plus />
              Yeni egzersiz
            </Link>
          </Button>
        </div>
      </header>
      {error ? (
        <Alert className="route-error">
          <AlertTitle>Kütüphane alınamadı</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {loading ? (
        <div className="loading-grid">
          <Skeleton className="h-52" />
          <Skeleton className="h-52" />
          <Skeleton className="h-52" />
        </div>
      ) : tacticalDrills.length ? (
        <div className="catalog-grid">
          {tacticalDrills.map((drill) => (
            <Link
              className="list-link"
              to={`/app/tactics/${drill.id}`}
              key={drill.id}
            >
              <Card className="tactic-card">
                <div className="pitch-preview">
                  <Strategy weight="duotone" />
                </div>
                <CardHeader>
                  <div className="card-title-row">
                    <CardTitle>{drill.title}</CardTitle>
                    <Badge
                      variant={
                        drill.scope === 'GLOBAL' ? 'secondary' : 'default'
                      }
                    >
                      {drill.scope === 'GLOBAL' ? 'Global' : 'Kulüp'}
                    </Badge>
                  </div>
                  <CardDescription>
                    {drill.category} · {drill.durationMin} dk · {drill.ageGroup}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {drill.scope === 'GLOBAL' ? (
                    <span className="copy-hint">
                      <Copy /> Kopyala ve düzenle
                    </span>
                  ) : (
                    <span className="copy-hint">Takım tahtasını aç</span>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Strategy weight="duotone" />
          <h2>Henüz taktik egzersizi yok</h2>
          <p>
            İlk kulüp egzersizini oluşturup saha yerleşimini takımınızla
            paylaşın.
          </p>
          <Button asChild>
            <Link to="/app/tactics/new">
              <Plus />
              Tahta oluştur
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
