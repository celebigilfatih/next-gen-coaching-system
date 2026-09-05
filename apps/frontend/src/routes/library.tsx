import { Books, Clock, Plus, Strategy } from '@phosphor-icons/react';
import { Link } from 'react-router';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import type { Drill, DrillPhase } from '../lib/api';
import { useWorkspace } from '../lib/workspace-context';

const phases: { value: 'ALL' | DrillPhase; label: string }[] = [
  { value: 'ALL', label: 'Tümü' },
  { value: 'WARM_UP', label: 'Isınma' },
  { value: 'TECHNICAL', label: 'Teknik' },
  { value: 'TACTICAL', label: 'Taktik' },
  { value: 'COOL_DOWN', label: 'Soğuma' },
];

export function meta() {
  return [{ title: 'Egzersiz Kütüphanesi | NGCS' }];
}

export default function LibraryRoute() {
  const { drills, group, loading } = useWorkspace();
  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="page-kicker">Antrenman içeriği</p>
          <h1>Egzersiz Kütüphanesi</h1>
          <p>{group?.name ?? 'Takım TBD'} için global ve kulüp egzersizleri.</p>
        </div>
        <Button asChild>
          <Link to="/app/tactics/new">
            <Plus /> Tahta egzersizi oluştur
          </Link>
        </Button>
      </header>
      {loading ? (
        <div className="loading-grid">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      ) : (
        <Tabs defaultValue="ALL">
          <TabsList className="library-tabs">
            {phases.map((phase) => (
              <TabsTrigger key={phase.value} value={phase.value}>
                {phase.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {phases.map((phase) => {
            const visible =
              phase.value === 'ALL'
                ? drills
                : drills.filter((drill) => drill.category === phase.value);
            return (
              <TabsContent value={phase.value} key={phase.value}>
                <DrillGrid drills={visible} />
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </div>
  );
}

function DrillGrid({ drills }: { drills: Drill[] }) {
  if (!drills.length)
    return (
      <div className="empty-state">
        <Books weight="duotone" />
        <h2>Bu kategoride egzersiz yok</h2>
        <p>Kulüp egzersizleri oluşturulduğunda burada görünecek.</p>
      </div>
    );
  return (
    <div className="catalog-grid">
      {drills.map((drill) => {
        const board = isBoard(drill);
        const card = (
          <Card className={board ? 'library-card board' : 'library-card'}>
            <CardHeader>
              <div className="card-title-row">
                <CardTitle>{drill.title}</CardTitle>
                <Badge
                  variant={drill.scope === 'GLOBAL' ? 'secondary' : 'default'}
                >
                  {drill.scope === 'GLOBAL' ? 'Global' : 'Kulüp'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="meta-row">
                <span>
                  <Clock /> {drill.durationMin} dk
                </span>
                <span>{phaseLabel(drill.category)}</span>
                <span>{drill.difficulty}</span>
              </div>
              <p className="library-equipment">
                {drill.equipment || 'Ekipman belirtilmedi'}
              </p>
              {board ? (
                <span className="copy-hint">
                  <Strategy /> Taktik tahtasını aç
                </span>
              ) : (
                <span className="library-plan-hint">
                  Antrenman planına eklenebilir
                </span>
              )}
            </CardContent>
          </Card>
        );
        return board ? (
          <Link
            className="list-link"
            to={`/app/tactics/${drill.id}`}
            key={drill.id}
          >
            {card}
          </Link>
        ) : (
          <div key={drill.id}>{card}</div>
        );
      })}
    </div>
  );
}

function isBoard(drill: Drill) {
  return Boolean(
    drill.jsonData &&
      typeof drill.jsonData === 'object' &&
      (drill.jsonData as { kind?: string }).kind === 'tactical-board',
  );
}

function phaseLabel(value: DrillPhase) {
  return {
    WARM_UP: 'Isınma',
    TECHNICAL: 'Teknik',
    TACTICAL: 'Taktik',
    COOL_DOWN: 'Soğuma',
  }[value];
}
