import {
  ArrowLeft,
  ArrowRight,
  CalendarBlank,
  CalendarCheck,
  Clock,
  Fire,
  ListNumbers,
  PencilSimple,
  SquaresFour,
  Strategy,
  Target,
  Trash,
  UsersThree,
  Wind,
} from '@phosphor-icons/react';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router';
import { toast } from 'sonner';
import '../styles/training-detail-workspace.css';
import {
  TacticalBoardEditor,
  type BoardEditorHandle,
} from '../components/tactics/tactical-board-editor';
import { PlanDrillPicker } from '../components/plan-drill-picker';
import { DrillInstructions } from '../components/drill-preview';
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
  const selectedIndex =
    plan?.drills.findIndex((item) => item.id === selectedId) ?? -1;
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
  function changeTab(next: string) {
    if (next !== tab)
      transition(() => {
        clearBoard();
        setTab(next);
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
        expectedVersionId: drill.contentVersionId ?? undefined,
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
    <div className="page-shell training-detail-reference training-detail-workspace">
      <header className="training-detail-heading">
        <div className="training-detail-heading-row">
          <div>
            <div className="training-detail-title">
              <span className="training-detail-title-icon" aria-hidden="true">
                <CalendarCheck weight="duotone" />
              </span>
              <h1>{plan.title}</h1>
            </div>
            <p className="training-detail-date">
              <CalendarBlank aria-hidden="true" />
              {plan.date
                ? new Intl.DateTimeFormat('tr-TR', {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  }).format(new Date(plan.date))
                : 'Tarih TBD'}
            </p>
          </div>
          <div className="training-detail-actions">
            {canManage ? (
              <>
                <Button
                  id="training-detail-edit-trigger"
                  variant="outline"
                  disabled={busy}
                  onClick={() => transition(() => setEditOpen(true))}
                >
                  <PencilSimple
                    aria-hidden="true"
                    className="training-detail-edit-icon"
                  />
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
          </div>
        </div>
      </header>
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
        <dl>
          <div>
            <dt>
              <Clock
                aria-hidden="true"
                weight="duotone"
                className="training-detail-summary-icon"
                data-tone="amber"
              />{' '}
              Toplam süre
            </dt>
            <dd>{plan.totalDuration} dk</dd>
          </div>
          <div>
            <dt>
              <ListNumbers
                aria-hidden="true"
                weight="duotone"
                className="training-detail-summary-icon"
                data-tone="violet"
              />{' '}
              Plan fazı
            </dt>
            <dd>{plan.drills.length} faz</dd>
          </div>
          <div>
            <dt>
              <Target
                aria-hidden="true"
                weight="duotone"
                className="training-detail-summary-icon"
                data-tone="green"
              />{' '}
              Plan amacı
            </dt>
            <dd>{plan.notes || 'Belirtilmedi'}</dd>
          </div>
        </dl>
      </section>
      <Tabs
        className="training-detail-reference__tabs"
        value={tab}
        onValueChange={changeTab}
      >
        <div className="training-detail-tabs-head">
          <h2>
            <SquaresFour
              aria-hidden="true"
              weight="duotone"
              className="training-detail-section-icon"
            />{' '}
            Antrenman çalışma alanı
          </h2>
          <TabsList>
            <TabsTrigger value="flow" disabled={busy}>
              <ListNumbers
                aria-hidden="true"
                className="training-detail-tab-icon"
                data-tone="blue"
              />
              Akış
            </TabsTrigger>
            <TabsTrigger value="board" disabled={busy}>
              <Strategy
                aria-hidden="true"
                className="training-detail-tab-icon"
                data-tone="violet"
              />
              Taktik tahtası
            </TabsTrigger>
            <TabsTrigger value="attendance" disabled={busy}>
              <UsersThree
                aria-hidden="true"
                className="training-detail-tab-icon"
                data-tone="green"
              />
              Katılım
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="flow" className="training-detail-reference__panel">
          <div className="training-flow-layout">
            <section aria-labelledby="training-phases-title">
              <div className="training-section-heading">
                <h3 id="training-phases-title">
                  <ListNumbers
                    aria-hidden="true"
                    className="training-detail-flow-icon"
                  />{' '}
                  Antrenman akışı
                </h3>
                <span>
                  {plan.drills.length} faz · {plan.totalDuration} dk
                </span>
              </div>
              {plan.drills.length ? (
                <ol className="training-phases" aria-label="Antrenman fazları">
                  {plan.drills.map((item, index) => (
                    <li key={item.id}>
                      <button
                        disabled={busy}
                        aria-pressed={selectedId === item.id}
                        onClick={() => selectPhase(item.id)}
                      >
                        <span className="training-phase-number">
                          {index + 1}
                        </span>
                        <span className="training-phase-copy">
                          <span className="training-phase-label">
                            <PhaseIcon phase={item.phase} />
                            {phaseLabel(item.phase)}
                          </span>
                          <strong>{item.drill.title}</strong>
                        </span>
                        <span className="training-phase-duration">
                          <Clock /> {item.drill.durationMin} dk
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="empty-state">
                  <Strategy />
                  <h3>Plan fazı yok</h3>
                  <p>Bu plana henüz egzersiz eklenmemiş.</p>
                </div>
              )}
            </section>
            {selected && (
              <section
                className="training-selected-phase"
                aria-labelledby="selected-phase-title"
              >
                <p className="training-detail-kicker">
                  Seçili faz · {selectedIndex + 1} / {plan.drills.length}
                </p>
                <h3 id="selected-phase-title">{selected.drill.title}</h3>
                <div className="training-selected-meta">
                  <Badge>
                    <PhaseIcon phase={selected.phase} />
                    {phaseLabel(selected.phase)}
                  </Badge>
                  <span>
                    <Clock /> {selected.drill.durationMin} dk
                  </span>
                </div>
                <p className="training-phase-notes">
                  {selected.notes || 'Faz notu yok'}
                </p>
                {selected.contentSnapshot && (
                  <details className="drill-choice-summary">
                    <summary>
                      Seçili fazın kayıtlı uygulaması ·{' '}
                      {selected.contentSnapshot.ageGroup === 'SENIOR'
                        ? 'A Takım'
                        : selected.contentSnapshot.ageGroup}{' '}
                      · v{selected.contentSnapshot.sourceVersion}
                    </summary>
                    <DrillInstructions content={selected.contentSnapshot} />
                  </details>
                )}
                <Button disabled={busy} onClick={() => changeTab('board')}>
                  <Strategy /> Taktik tahtasına geç <ArrowRight />
                </Button>
              </section>
            )}
          </div>
          <div className="training-add-section">
            {refreshNeeded ? (
              <Alert role="alert">
                <AlertDescription>
                  {error || 'Plan yenileniyor…'}
                </AlertDescription>
                <Button
                  disabled={refreshBusy}
                  onClick={() => void refreshPlan()}
                >
                  Planı yenile
                </Button>
              </Alert>
            ) : !canManage ? (
              <p>Bu planı salt okunur görüntülüyorsunuz.</p>
            ) : plan.groupId ? (
              <details open={plan.drills.length === 0 ? true : undefined}>
                <summary>Plana egzersiz ekle</summary>
                <PlanDrillPicker
                  key={JSON.stringify([plan.id, plan.groupId, scope])}
                  groupId={plan.groupId}
                  ageGroup={group?.ageGroup}
                  attachedIds={plan.drills.map((item) => item.drillId)}
                  onAdd={addDrill}
                />
              </details>
            ) : (
              <p>Egzersiz seçimi için planın grup bağlamı bulunmuyor.</p>
            )}
          </div>
        </TabsContent>
        <TabsContent
          value="board"
          className="training-detail-reference__panel training-detail-reference__panel--board"
        >
          {plan.drills.length ? (
            <>
              <div className="snapshot-picker">
                <div className="training-board-phase-heading">
                  <label htmlFor="snapshot-phase">Tahta için faz seçin</label>
                  <span>
                    {selectedIndex >= 0 ? selectedIndex + 1 : '–'} /{' '}
                    {plan.drills.length} faz
                  </span>
                </div>
                <select
                  id="snapshot-phase"
                  className="min-w-0 max-w-full"
                  value={selectedId}
                  disabled={busy}
                  onChange={(event) => selectPhase(event.target.value)}
                >
                  <option value="">Faz seçin</option>
                  {plan.drills.map((item, index) => (
                    <option value={item.id} key={item.id}>
                      {item.drill.title} · {phaseLabel(item.phase)} ·{' '}
                      {index + 1}
                    </option>
                  ))}
                </select>
                <div
                  className="training-phase-navigation"
                  aria-label="Fazlar arasında gezin"
                >
                  <Button
                    variant="outline"
                    disabled={busy || selectedIndex <= 0}
                    onClick={() =>
                      selectPhase(plan.drills[selectedIndex - 1].id)
                    }
                  >
                    <ArrowLeft /> Önceki faz
                  </Button>
                  <Button
                    variant="outline"
                    disabled={
                      busy ||
                      selectedIndex < 0 ||
                      selectedIndex >= plan.drills.length - 1
                    }
                    onClick={() =>
                      selectPhase(plan.drills[selectedIndex + 1].id)
                    }
                  >
                    Sonraki faz <ArrowRight />
                  </Button>
                </div>
                <Button
                  className="training-open-board"
                  disabled={!selected || busy || boardLoading || Boolean(board)}
                  onClick={() => void openBoard()}
                >
                  Tahtayı aç
                </Button>
              </div>
              {!board && !boardLoading && !boardError && (
                <div className="training-board-placeholder">
                  <Strategy />
                  <h3>{selected ? selected.drill.title : 'Bir faz seçin'}</h3>
                  <p>Seçili fazı sahada incelemek için tahtayı açın.</p>
                </div>
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
function PhaseIcon({
  phase,
}: {
  phase: TrainingEditorMetadata['drills'][number]['phase'];
}) {
  const Icon = {
    WARM_UP: Fire,
    TECHNICAL: Target,
    TACTICAL: Strategy,
    COOL_DOWN: Wind,
  }[phase];
  return (
    <Icon
      aria-hidden="true"
      weight="duotone"
      className="training-phase-icon"
      data-phase={phase}
    />
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
