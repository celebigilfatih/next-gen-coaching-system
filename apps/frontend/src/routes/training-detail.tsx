import {
  ArrowLeft,
  CalendarBlank,
  Clock,
  PencilSimple,
  Strategy,
  Trash,
} from '@phosphor-icons/react';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router';
import { toast } from 'sonner';
import teamsHero from '../assets/teams-hero.png';
import { PageHero } from '../components/presentation/page-hero';
import {
  TacticalBoardEditor,
  type BoardEditorHandle,
} from '../components/tactics/tactical-board-editor';
import { PlanDrillPicker } from '../components/plan-drill-picker';
import { PlanAttendance } from '../components/plan-attendance';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  DeleteTrainingPlanDialog,
  TrainingPlanDialog,
} from '../components/training-plan-dialogs';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import {
  getTrainingEditorMetadata,
  getTrainingPhaseDocument,
  addTrainingPlanDrill,
  putTrainingPhaseDocument,
  type TrainingEditorMetadata,
  type TrainingPhaseDocument,
  type DrillCatalogItem,
  type TrainingPlan,
} from '../lib/api';
import {
  validateTacticalDocument,
  type TacticalDocument,
} from '../lib/tactical-document-core';
import {
  getSession,
  getSessionGeneration,
  subscribeSession,
} from '../lib/session';
import { useWorkspace } from '../lib/workspace-context';

export function meta() {
  return [{ title: 'Antrenman Detayı | NGCS' }];
}
export default function TrainingDetailRoute() {
  const { planId } = useParams();
  const { scope } = useWorkspace();
  const { search } = useLocation();
  const session = useSyncExternalStore(
    subscribeSession,
    getSession,
    () => null,
  );
  const identity = JSON.stringify([
    session?.user.id,
    session?.user.role,
    session?.user.clubId,
    getSessionGeneration(),
  ]);
  if (!session) return <p>Oturum gerekli.</p>;
  return (
    <TrainingDetail
      key={JSON.stringify([planId, scope, search, identity])}
      planId={planId}
      canManage={Boolean(session && session.user.role !== 'PLAYER')}
    />
  );
}
function boardKey(document: TacticalDocument) {
  return JSON.stringify(document, (_key, value: unknown) =>
    value && typeof value === 'object' && !Array.isArray(value)
      ? Object.fromEntries(
          Object.entries(value).sort(([a], [b]) => a.localeCompare(b)),
        )
      : value,
  );
}
function validatedBoard(
  value: TrainingPhaseDocument,
  planId: string,
  phaseId: string,
  drillId: string,
) {
  if (
    value.planId !== planId ||
    value.planDrillId !== phaseId ||
    value.drillId !== drillId ||
    !value.writeToken
  )
    throw new Error('Tahta yanıtı seçilen fazla eşleşmiyor.');
  if (value.status === 'ready') {
    if (value.origin !== 'snapshot' && value.origin !== 'drill')
      throw new Error('Geçersiz tahta kaynağı.');
    return { ...value, document: validateTacticalDocument(value.document) };
  }
  if (
    value.status !== 'absent' ||
    value.origin !== null ||
    value.document !== null
  )
    throw new Error('Geçersiz tahta yanıtı.');
  return value;
}

function TrainingDetail({
  planId,
  canManage,
}: {
  planId?: string;
  canManage: boolean;
}) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { scope, reload, group, team, club } = useWorkspace();
  const [plan, setPlan] = useState<TrainingEditorMetadata>();
  const [selectedId, setSelectedId] = useState('');
  const [tab, setTab] = useState(
    searchParams.get('tab') === 'attendance' ? 'attendance' : 'flow',
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshNeeded, setRefreshNeeded] = useState(false);
  const [refreshBusy, setRefreshBusy] = useState(false);
  const [adding, setAdding] = useState(false);
  const [pendingAddedId, setPendingAddedId] = useState<string>();
  const [board, setBoard] = useState<TrainingPhaseDocument>();
  const writeToken = useRef('');
  const [boardLoading, setBoardLoading] = useState(false);
  const [boardError, setBoardError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uncertain, setUncertain] = useState<{
    submitted: string;
    checked?: boolean;
    matches?: boolean;
    verifiedToken?: string;
  }>();
  const [checking, setChecking] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const editor = useRef<BoardEditorHandle>(null);
  const alive = useRef(true);
  const readGeneration = useRef(0);
  const writeBusy = useRef(false);
  const selected = plan?.drills.find((item) => item.id === selectedId);
  const busy = saving || adding || checking;

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    let active = true;
    if (planId)
      getTrainingEditorMetadata(planId)
        .then((value) => {
          if (!active) return;
          setPlan(value);
          setSelectedId(value.drills[0]?.id ?? '');
        })
        .catch((cause: unknown) => {
          if (active)
            setError(
              cause instanceof Error ? cause.message : 'Plan yüklenemedi.',
            );
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    return () => {
      active = false;
    };
  }, [planId]);

  function clearBoard() {
    ++readGeneration.current;
    setBoard(undefined);
    writeToken.current = '';
    setBoardError('');
    setBoardLoading(false);
    setUncertain(undefined);
    setSaving(false);
  }
  function transition(action: () => void) {
    if (busy || writeBusy.current) return;
    if (editor.current) editor.current.transition(action);
    else action();
  }
  function selectPhase(id: string) {
    if (id === selectedId) return;
    transition(() => {
      clearBoard();
      setSelectedId(id);
    });
  }
  async function openBoard() {
    if (!planId || !selected || busy) return;
    const generation = ++readGeneration.current;
    setBoard(undefined);
    setBoardLoading(true);
    setBoardError('');
    try {
      const next = validatedBoard(
        await getTrainingPhaseDocument(planId, selected.id),
        planId,
        selected.id,
        selected.drillId,
      );
      if (alive.current && generation === readGeneration.current) {
        writeToken.current = next.writeToken;
        setBoard(next);
      }
    } catch (cause) {
      if (alive.current && generation === readGeneration.current)
        setBoardError(
          cause instanceof Error ? cause.message : 'Tahta yüklenemedi.',
        );
    } finally {
      if (alive.current && generation === readGeneration.current)
        setBoardLoading(false);
    }
  }
  async function saveBoard(document: TacticalDocument) {
    if (!planId || !selected || !canManage || writeBusy.current)
      throw new Error('Tahta şu anda kaydedilemiyor.');
    if (uncertain) {
      if (
        uncertain.matches &&
        uncertain.verifiedToken &&
        uncertain.submitted === boardKey(document)
      ) {
        // Explicit acknowledgement of the exact persisted snapshot, never a
        // refreshed token used to overwrite a different server document.
        writeToken.current = uncertain.verifiedToken;
        setUncertain(undefined);
        return;
      }
      throw new Error(
        'Önce kaydı doğrulayın; gerekirse uyarıyı İptal ile kapatın.',
      );
    }
    writeBusy.current = true;
    try {
      const updated = validatedBoard(
        await putTrainingPhaseDocument(
          planId,
          selected.id,
          document,
          writeToken.current,
        ),
        planId,
        selected.id,
        selected.drillId,
      );
      if (!alive.current) throw new Error('Çalışma alanı değişti.');
      if (
        updated.status !== 'ready' ||
        updated.origin !== 'snapshot' ||
        boardKey(updated.document) !== boardKey(document)
      )
        throw new Error('Kaydedilen tahta doğrulanamadı.');
      writeToken.current = updated.writeToken;
      // The editor's save completion advances its baseline without remounting it.
    } catch (cause) {
      if (alive.current) setUncertain({ submitted: boardKey(document) });
      const message =
        cause instanceof Error ? cause.message : 'Tahta kaydedilemedi.';
      if (message.includes('TACTICAL_DOCUMENT_WRITE_CONFLICT'))
        throw new Error(
          'Tahta veya kaynak egzersiz değişti. Taslağınız korundu; otomatik üzerine yazılmadı. Farklı kaydı değiştirmek için JSON dışa aktarın ve fazı yeniden açın.',
          { cause },
        );
      if (message.includes('TACTICAL_V2_WRITES_DISABLED'))
        throw new Error(
          'Animasyon kaydı bu ortamda henüz açılmadı. Taslağınız korundu; JSON olarak dışa aktarabilirsiniz.',
          { cause },
        );
      throw new Error(
        `${message} Taslağınız korundu; kayıt otomatik tekrarlanmadı.`,
        { cause },
      );
    } finally {
      writeBusy.current = false;
    }
  }
  async function checkSave() {
    if (!planId || !selected || !uncertain || checking || saving) return;
    setChecking(true);
    setBoardError('');
    try {
      const value = validatedBoard(
        await getTrainingPhaseDocument(planId, selected.id),
        planId,
        selected.id,
        selected.drillId,
      );
      if (alive.current)
        setUncertain({
          ...uncertain,
          checked: true,
          matches:
            value.status === 'ready' &&
            value.origin === 'snapshot' &&
            boardKey(value.document) === uncertain.submitted,
          verifiedToken: value.writeToken,
        });
    } catch (cause) {
      if (alive.current)
        setBoardError(
          cause instanceof Error ? cause.message : 'Kayıt doğrulanamadı.',
        );
    } finally {
      if (alive.current) setChecking(false);
    }
  }
  async function refreshPlan(addedId = pendingAddedId) {
    if (!planId) return;
    setRefreshBusy(true);
    try {
      const next = await getTrainingEditorMetadata(planId);
      if (!alive.current) return;
      setPlan(next);
      if (addedId && next.drills.some((item) => item.id === addedId))
        setSelectedId(addedId);
      else
        setSelectedId((current) =>
          next.drills.some((item) => item.id === current)
            ? current
            : (next.drills[0]?.id ?? ''),
        );
      setRefreshNeeded(false);
      setPendingAddedId(undefined);
      setError('');
    } catch {
      if (alive.current)
        setError(
          'Egzersiz ekleme sonrası plan yenilenemedi. Tekrar eklemeyin; planı yenileyin.',
        );
    } finally {
      if (alive.current) {
        setRefreshBusy(false);
        setLoading(false);
      }
    }
  }
  async function addDrill(drill: DrillCatalogItem) {
    if (!planId || !plan || refreshNeeded || !canManage || writeBusy.current)
      return;
    writeBusy.current = true;
    setAdding(true);
    let added: { id: string };
    try {
      added = await addTrainingPlanDrill(planId, {
        drillId: drill.id,
        phase: drill.category,
        order:
          Math.max(
            -1,
            ...plan.drills
              .filter((item) => item.phase === drill.category)
              .map((item) => item.order),
          ) + 1,
      });
    } catch (cause) {
      if (alive.current) {
        setRefreshNeeded(true);
        setError(
          'Ekleme sonucu doğrulanamadı. Yeniden eklemeden önce planı yenileyip kontrol edin.',
        );
      }
      throw cause;
    } finally {
      writeBusy.current = false;
      if (alive.current) setAdding(false);
    }
    if (!alive.current) return;
    setRefreshNeeded(true);
    setPendingAddedId(added.id);
    await refreshPlan(added.id);
    if (!alive.current) return;
    await reload();
    if (alive.current) toast.success('Egzersiz plana eklendi');
  }

  async function planUpdated(updated: TrainingPlan) {
    if (alive.current)
      setPlan((current) =>
        current
          ? {
              ...current,
              title: updated.title,
              date: updated.date,
              notes: updated.notes,
            }
          : current,
      );
    await reload();
  }

  async function planDeleted() {
    await reload();
    navigate('/app/trainings');
  }

  if (loading)
    return (
      <div className="page-shell training-detail-reference">
        <div role="status" className="training-detail-reference__loading">
          <p>Plan yükleniyor…</p>
        </div>
      </div>
    );
  if (!plan)
    return (
      <div className="page-shell training-detail-reference">
        <Alert className="route-error">
          <AlertTitle>Plan açılamadı</AlertTitle>
          <AlertDescription>
            {error || 'Antrenman bulunamadı.'}
          </AlertDescription>
          <Button disabled={refreshBusy} onClick={() => void refreshPlan()}>
            Planı yeniden yükle
          </Button>
        </Alert>
      </div>
    );
  return (
    <div className="page-shell training-detail-reference">
      <PageHero
        className="training-detail-reference__hero"
        image={teamsHero}
        eyebrow="Antrenman detayı"
        title={plan.title}
        description={
          plan.date
            ? new Intl.DateTimeFormat('tr-TR', {
                dateStyle: 'full',
                timeStyle: 'short',
              }).format(new Date(plan.date))
            : 'Tarih TBD'
        }
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/app/trainings">
                <ArrowLeft />
                Planlar
              </Link>
            </Button>
            {canManage ? (
              <>
                <Button
                  id="training-detail-edit-trigger"
                  variant="outline"
                  disabled={busy}
                  onClick={() => transition(() => setEditOpen(true))}
                >
                  <PencilSimple />
                  Düzenle
                </Button>
                <Button
                  id="training-detail-delete-trigger"
                  variant="destructive"
                  disabled={busy}
                  onClick={() => transition(() => setDeleteOpen(true))}
                >
                  <Trash />
                  Sil
                </Button>
              </>
            ) : null}
          </>
        }
      />
      {canManage ? (
        <>
          <TrainingPlanDialog
            mode="edit"
            open={editOpen}
            onOpenChange={setEditOpen}
            groupName={group?.name ?? 'Seçili takım'}
            plan={plan}
            returnFocusId="training-detail-edit-trigger"
            onSaved={planUpdated}
          />
          <DeleteTrainingPlanDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            plan={plan}
            returnFocusId="training-detail-delete-trigger"
            onDeleted={planDeleted}
          />
        </>
      ) : null}
      <section
        className="training-detail-reference__summary"
        aria-label="Plan özeti"
      >
        <span>
          <Clock weight="duotone" />
          <small>Toplam süre</small>
          <strong>{plan.totalDuration} dk</strong>
        </span>
        <span>
          <Strategy weight="duotone" />
          <small>Plan fazı</small>
          <strong>{plan.drills.length}</strong>
        </span>
        <span>
          <CalendarBlank weight="duotone" />
          <small>Plan amacı</small>
          <strong>{plan.notes || 'TBD'}</strong>
        </span>
      </section>
      <Tabs
        className="training-detail-reference__tabs"
        value={tab}
        onValueChange={(next) => {
          if (next !== tab)
            transition(() => {
              clearBoard();
              setTab(next);
            });
        }}
      >
        <TabsList>
          <TabsTrigger value="flow" disabled={busy}>
            Akış
          </TabsTrigger>
          <TabsTrigger value="board" disabled={busy}>
            Taktik snapshot
          </TabsTrigger>
          <TabsTrigger value="attendance" disabled={busy}>
            Katılım
          </TabsTrigger>
        </TabsList>
        <TabsContent value="flow" className="training-detail-reference__panel">
          {refreshNeeded ? (
            <Alert role="alert">
              <AlertDescription>
                {error || 'Plan yenileniyor…'}
              </AlertDescription>
              <Button disabled={refreshBusy} onClick={() => void refreshPlan()}>
                Planı yenile
              </Button>
            </Alert>
          ) : !canManage ? (
            <p>Bu planı salt okunur görüntülüyorsunuz.</p>
          ) : plan.groupId ? (
            <PlanDrillPicker
              key={JSON.stringify([plan.id, plan.groupId, scope])}
              groupId={plan.groupId}
              attachedIds={plan.drills.map((item) => item.drillId)}
              onAdd={addDrill}
            />
          ) : (
            <p>Egzersiz seçimi için planın grup bağlamı bulunmuyor.</p>
          )}
          <div className="phase-cards">
            {plan.drills.length ? (
              plan.drills.map((item) => (
                <button
                  disabled={busy}
                  className={
                    selectedId === item.id
                      ? 'phase-card selected'
                      : 'phase-card'
                  }
                  key={item.id}
                  onClick={() => selectPhase(item.id)}
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
        <TabsContent
          value="board"
          className="training-detail-reference__panel training-detail-reference__panel--board"
        >
          {plan.drills.length ? (
            <>
              <div className="snapshot-picker flex flex-wrap gap-3">
                <label htmlFor="snapshot-phase">Snapshot kaynağı</label>
                <select
                  id="snapshot-phase"
                  className="min-w-0 max-w-full"
                  value={selectedId}
                  disabled={busy}
                  onChange={(event) => selectPhase(event.target.value)}
                >
                  <option value="">Faz seçin</option>
                  {plan.drills.map((item) => (
                    <option value={item.id} key={item.id}>
                      {item.drill.title} · {phaseLabel(item.phase)} ·{' '}
                      {item.order + 1}
                    </option>
                  ))}
                </select>
                <Button
                  disabled={!selected || busy || boardLoading || Boolean(board)}
                  onClick={() => void openBoard()}
                >
                  Tahtayı aç
                </Button>
              </div>
              {!board && !boardLoading && !boardError && (
                <p>Yalnız açtığınız fazın tahtası yüklenir.</p>
              )}
              {boardLoading && <p role="status">Tahta yükleniyor…</p>}
              {boardError && (
                <Alert role="alert">
                  <AlertDescription>{boardError}</AlertDescription>
                  {!board && (
                    <Button onClick={() => void openBoard()}>
                      Tahtayı yeniden yükle
                    </Button>
                  )}
                </Alert>
              )}
              {uncertain && (
                <Alert role="alert">
                  <AlertTitle>Kayıt sonucunu doğrulayın</AlertTitle>
                  <AlertDescription>
                    {uncertain.matches
                      ? 'Snapshot sunucuda doğrulandı. Kaydet ile taslağın kayıt durumunu onaylayın; aynı içerik tekrar gönderilmeyecek.'
                      : uncertain.checked
                        ? 'Sunucudaki kayıt gönderilen taslakla aynı değil. Taslağınız ve eski kayıt anahtarınız korunuyor. Farklı kaydı değiştirmek için önce JSON dışa aktarın ve fazı yeniden açın.'
                        : 'Taslak korunuyor. Otomatik kayıt tekrarı yapılmadı; önce sunucudaki kaydı okuyun.'}
                  </AlertDescription>
                  <Button
                    disabled={checking || saving}
                    onClick={() => void checkSave()}
                  >
                    Kaydı doğrula
                  </Button>
                  {uncertain.checked && (
                    <Button
                      variant="outline"
                      disabled={checking || saving}
                      onClick={() => setUncertain(undefined)}
                    >
                      Taslağı koru; yeniden kaydetmeye izin ver
                    </Button>
                  )}
                </Alert>
              )}
              {board?.status === 'ready' && (
                <TacticalBoardEditor
                  rosterSource={
                    team && club && plan.groupId === group?.id
                      ? { teamId: team.id, clubId: club.id, name: team.name }
                      : undefined
                  }
                  controllerRef={editor}
                  onSavingChange={setSaving}
                  key={board.planDrillId}
                  initiallySaved={board.origin === 'snapshot'}
                  initialDocument={board.document}
                  onSaveDocument={saveBoard}
                  readOnly={!canManage}
                />
              )}
              {board && board.status !== 'ready' && (
                <Alert>
                  <AlertTitle>
                    {board.status === 'absent'
                      ? 'Bu fazda tahta kaydı yok'
                      : 'Bu fazın tahta verisi geçersiz'}
                  </AlertTitle>
                  <AlertDescription>
                    Başka bir faz seçebilirsiniz. Mevcut veri değiştirilmedi.
                  </AlertDescription>
                </Alert>
              )}
            </>
          ) : (
            <div className="empty-state">
              <Strategy />
              <h2>Plan fazı yok</h2>
              <p>Önce plana bir egzersiz ekleyin.</p>
            </div>
          )}
        </TabsContent>
        <TabsContent
          value="attendance"
          className="training-detail-reference__panel training-detail-reference__panel--attendance"
        >
          <PlanAttendance
            key={JSON.stringify([plan.id, scope])}
            planId={plan.id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
function phaseLabel(value: TrainingEditorMetadata['drills'][number]['phase']) {
  return {
    WARM_UP: 'Isınma',
    TECHNICAL: 'Teknik',
    TACTICAL: 'Taktik',
    COOL_DOWN: 'Soğuma',
  }[value];
}
