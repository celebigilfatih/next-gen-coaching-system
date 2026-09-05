import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Strategy,
  UsersThree,
} from '@phosphor-icons/react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { TacticalBoardEditor } from '../components/tactics/tactical-board-editor';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import {
  getTrainingPlan,
  markAttendance,
  replaceTrainingPlanDrills,
  updatePlanDrillBoard,
  type PlanDrill,
  type TrainingPlan,
} from '../lib/api';
import {
  validateBoard,
  type TacticalBoardDocumentV1,
} from '../lib/tactical-board';
import { useWorkspace } from '../lib/workspace-context';

export function meta() {
  return [{ title: 'Antrenman Detayı | NGCS' }];
}
export default function TrainingDetailRoute() {
  const { planId } = useParams();
  const [searchParams] = useSearchParams();
  const { members, drills } = useWorkspace();
  const [plan, setPlan] = useState<TrainingPlan>();
  const [selected, setSelected] = useState<PlanDrill>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const players = useMemo(
    () => members.filter((member) => member.user.role === 'PLAYER'),
    [members],
  );
  const [present, setPresent] = useState<Set<string>>(new Set());
  const [drillToAdd, setDrillToAdd] = useState('');

  useEffect(() => {
    if (!planId) return;
    getTrainingPlan(planId)
      .then((value) => {
        setPlan(value);
        const first = value.drills?.find(hasBoard);
        setSelected(first);
        setPresent(
          new Set(
            (value.attendance ?? [])
              .filter((item) => item.status === 'PRESENT')
              .map((item) => item.playerId),
          ),
        );
      })
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : 'Plan yüklenemedi.'),
      )
      .finally(() => setLoading(false));
  }, [planId]);

  async function saveBoard(document: TacticalBoardDocumentV1) {
    if (!planId || !selected)
      throw new Error('Snapshot için antrenman fazı seçin.');
    const updated = await updatePlanDrillBoard(planId, selected.id, document);
    setSelected(updated);
    setPlan((current) =>
      current
        ? {
            ...current,
            drills: current.drills?.map((item) =>
              item.id === updated.id ? updated : item,
            ),
          }
        : current,
    );
  }

  async function toggleAttendance(playerId: string) {
    if (!planId) return;
    const nextPresent = !present.has(playerId);
    await markAttendance({
      planId,
      playerId,
      status: nextPresent ? 'PRESENT' : 'ABSENT',
    });
    setPresent((current) => {
      const next = new Set(current);
      if (nextPresent) next.add(playerId);
      else next.delete(playerId);
      return next;
    });
    toast.success('Katılım güncellendi');
  }

  async function addDrill() {
    if (!planId || !drillToAdd) return;
    const drill = drills.find((item) => item.id === drillToAdd);
    if (!drill) return;
    const current = plan?.drills ?? [];
    const next = await replaceTrainingPlanDrills(planId, [
      ...current.map((item) => ({
        drillId: item.drillId,
        phase: item.phase,
        order: item.order,
        notes: item.notes ?? undefined,
      })),
      {
        drillId: drill.id,
        phase: drill.category,
        order: current.filter((item) => item.phase === drill.category).length,
      },
    ]);
    setPlan(next);
    setSelected(next.drills?.find((item) => item.drillId === drill.id));
    setDrillToAdd('');
    toast.success('Egzersiz plana eklendi');
  }

  if (loading)
    return (
      <div className="page-shell">
        <p>Plan yükleniyor…</p>
      </div>
    );
  if (!plan)
    return (
      <div className="page-shell">
        <Alert className="route-error">
          <AlertTitle>Plan açılamadı</AlertTitle>
          <AlertDescription>
            {error || 'Antrenman bulunamadı.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="page-kicker">Antrenman detayı</p>
          <h1>{plan.title}</h1>
          <p>
            {plan.date
              ? new Intl.DateTimeFormat('tr-TR', {
                  dateStyle: 'full',
                  timeStyle: 'short',
                }).format(new Date(plan.date))
              : 'Tarih TBD'}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/app/trainings">
            <ArrowLeft />
            Planlar
          </Link>
        </Button>
      </header>
      <Tabs
        defaultValue={
          searchParams.get('tab') === 'attendance' ? 'attendance' : 'flow'
        }
      >
        <TabsList>
          <TabsTrigger value="flow">Akış</TabsTrigger>
          <TabsTrigger value="board">Taktik snapshot</TabsTrigger>
          <TabsTrigger value="attendance">Katılım</TabsTrigger>
        </TabsList>
        <TabsContent value="flow">
          <div className="plan-add-drill">
            <label htmlFor="plan-drill-select">Egzersiz ekle</label>
            <select
              id="plan-drill-select"
              value={drillToAdd}
              onChange={(event) => setDrillToAdd(event.target.value)}
            >
              <option value="">Kütüphaneden seçin</option>
              {drills
                .filter(
                  (drill) =>
                    !plan.drills?.some((item) => item.drillId === drill.id),
                )
                .map((drill) => (
                  <option key={drill.id} value={drill.id}>
                    {drill.title} · {phaseLabel(drill.category)}
                  </option>
                ))}
            </select>
            <Button disabled={!drillToAdd} onClick={() => void addDrill()}>
              Plana ekle
            </Button>
          </div>
          <div className="phase-cards">
            {plan.drills?.length ? (
              plan.drills.map((item) => (
                <button
                  className={
                    selected?.id === item.id
                      ? 'phase-card selected'
                      : 'phase-card'
                  }
                  key={item.id}
                  onClick={() => setSelected(item)}
                >
                  <span>
                    <Badge>{phaseLabel(item.phase)}</Badge>
                    <strong>{item.drill.title}</strong>
                    <small>{item.notes || 'Faz notu yok'}</small>
                  </span>
                  <span>
                    <Clock />
                    {item.drill.durationMin} dk
                  </span>
                </button>
              ))
            ) : (
              <div className="empty-state">
                <Strategy />
                <h2>Plan fazı yok</h2>
                <p>Bu plana henüz egzersiz eklenmemiş.</p>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="board">
          {selected && hasBoard(selected) ? (
            <>
              <div className="snapshot-picker">
                <strong>Snapshot kaynağı</strong>
                <select
                  value={selected.id}
                  onChange={(event) =>
                    setSelected(
                      plan.drills?.find(
                        (item) => item.id === event.target.value,
                      ),
                    )
                  }
                >
                  {plan.drills?.filter(hasBoard).map((item) => (
                    <option value={item.id} key={item.id}>
                      {item.drill.title}
                    </option>
                  ))}
                </select>
              </div>
              <TacticalBoardEditor
                key={`${selected.id}-${Boolean(selected.boardSnapshot)}`}
                initialDocument={
                  selected.boardSnapshot ??
                  validateBoard(selected.drill.jsonData)
                }
                onSave={saveBoard}
              />
            </>
          ) : (
            <div className="empty-state">
              <Strategy />
              <h2>Tahta destekli faz yok</h2>
              <p>Önce taktik tahtası içeren bir egzersizi plana ekleyin.</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>
                <UsersThree /> Katılım · {present.size}/{players.length}
              </CardTitle>
            </CardHeader>
            <CardContent className="attendance-grid">
              {players.length ? (
                players.map((member) => (
                  <Button
                    key={member.user.id}
                    variant={
                      present.has(member.user.id) ? 'default' : 'outline'
                    }
                    onClick={() => void toggleAttendance(member.user.id)}
                  >
                    <CheckCircle
                      weight={present.has(member.user.id) ? 'fill' : 'regular'}
                    />
                    {member.user.name}
                  </Button>
                ))
              ) : (
                <p>Takım oyuncusu bulunamadı.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
function hasBoard(item: PlanDrill) {
  try {
    validateBoard(item.boardSnapshot ?? item.drill.jsonData);
    return true;
  } catch {
    return false;
  }
}
function phaseLabel(value: PlanDrill['phase']) {
  return {
    WARM_UP: 'Isınma',
    TECHNICAL: 'Teknik',
    TACTICAL: 'Taktik',
    COOL_DOWN: 'Soğuma',
  }[value];
}
