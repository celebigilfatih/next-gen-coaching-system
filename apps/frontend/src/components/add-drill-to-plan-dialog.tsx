import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import {
  addTrainingPlanDrill,
  getTrainingEditorMetadata,
  getTrainingPlanPage,
  type DrillPhase,
  type TrainingEditorMetadata,
} from '../lib/api';
import { useAssignmentPage } from '../lib/use-assignment-page';
import { TrainingPlanDialog } from './training-plan-dialogs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { NativeSelect } from './ui/native-select';

export function AddDrillToPlanDialog({
  groupId,
  clubId,
  groupName,
  seasonId,
  drillId,
  expectedVersionId,
  phase,
  onClose,
}: {
  groupId: string;
  clubId?: string;
  groupName: string;
  seasonId?: string;
  drillId: string;
  expectedVersionId: string;
  phase: DrillPhase;
  onClose: () => void;
}) {
  const load = useCallback(
    (after?: string) => getTrainingPlanPage(groupId, seasonId, after),
    [groupId, seasonId],
  );
  const page = useAssignmentPage(load);
  const [selectedId, setSelectedId] = useState('');
  const [selection, setSelection] = useState<{
    id: string;
    plan?: TrainingEditorMetadata;
    error?: string;
  }>();
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const writing = useRef(false);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    getTrainingEditorMetadata(selectedId)
      .then((plan) => {
        if (!active) return;
        if (plan.groupId !== groupId) {
          setSelection({
            id: selectedId,
            error: 'Planın takım bağlamı değişti.',
          });
          return;
        }
        setSelection({ id: selectedId, plan });
      })
      .catch((cause: unknown) => {
        if (active)
          setSelection({
            id: selectedId,
            error: cause instanceof Error ? cause.message : 'Plan okunamadı.',
          });
      });
    return () => {
      active = false;
    };
  }, [selectedId, groupId, revision]);
  const current = selection?.id === selectedId ? selection : undefined;
  const plan = current?.plan;
  const attached = plan?.drills.some((item) => item.drillId === drillId);
  const options = page.data?.items ?? [];
  async function add() {
    if (!plan || attached || uncertain || writing.current) return;
    writing.current = true;
    setSaving(true);
    setError('');
    try {
      await addTrainingPlanDrill(plan.id, {
        drillId,
        expectedVersionId,
        phase,
        order:
          Math.max(
            -1,
            ...plan.drills
              .filter((item) => item.phase === phase)
              .map((item) => item.order),
          ) + 1,
      });
      if (alive.current) setAdded(true);
    } catch (cause) {
      if (alive.current) {
        setUncertain(true);
        setError(
          `${cause instanceof Error ? cause.message : 'Ekleme tamamlanamadı.'} Yeniden eklemeden önce planı kontrol edin.`,
        );
      }
    } finally {
      writing.current = false;
      if (alive.current) setSaving(false);
    }
  }
  async function verify() {
    if (!selectedId || writing.current) return;
    writing.current = true;
    setSaving(true);
    try {
      const checked = await getTrainingEditorMetadata(selectedId);
      if (!alive.current) return;
      if (checked.groupId !== groupId)
        throw new Error('Planın takım bağlamı değişti.');
      setSelection({ id: selectedId, plan: checked });
      setAdded(checked.drills.some((item) => item.drillId === drillId));
      setUncertain(false);
      setError('');
    } catch (cause) {
      if (alive.current)
        setError(
          cause instanceof Error ? cause.message : 'Plan doğrulanamadı.',
        );
    } finally {
      writing.current = false;
      if (alive.current) setSaving(false);
    }
  }
  return (
    <>
      <Dialog
        open={!creating}
        onOpenChange={(open) => {
          if (!open && !saving) onClose();
        }}
      >
        <DialogContent className="drill-plan-dialog">
          <DialogHeader>
            <DialogTitle>Egzersizi antrenmana ekle</DialogTitle>
            <DialogDescription>
              {groupName} için bir plan seçin veya yeni antrenman oluşturun.
            </DialogDescription>
          </DialogHeader>
          {added ? (
            <div role="status">
              <p>Egzersiz plana eklendi.</p>
              <Button asChild>
                <Link to={`/app/trainings/${selectedId}`}>Antrenmanı aç</Link>
              </Button>
            </div>
          ) : (
            <>
              <label>
                Antrenman planı
                <NativeSelect
                  aria-label="Antrenman planı"
                  disabled={saving || uncertain}
                  value={selectedId}
                  onChange={(e) => {
                    setSelectedId(e.target.value);
                    setError('');
                  }}
                >
                  <option value="">Plan seçin</option>
                  {selectedId &&
                    !options.some((item) => item.id === selectedId) && (
                      <option value={selectedId}>
                        {plan?.title ?? 'Seçilen antrenman'}
                      </option>
                    )}
                  {options.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                      {item.date
                        ? ` · ${new Date(item.date).toLocaleDateString('tr-TR')}`
                        : ''}
                    </option>
                  ))}
                </NativeSelect>
              </label>
              {plan && (
                <section
                  aria-label="Seçilen antrenman özeti"
                  className="rounded-md border border-border p-3 text-sm"
                >
                  <strong>{plan.title}</strong>
                  <p>
                    {plan.date
                      ? new Date(plan.date).toLocaleString('tr-TR', {
                          dateStyle: 'long',
                          timeStyle: 'short',
                        })
                      : 'Tarihsiz antrenman'}
                  </p>
                  <p>
                    {plan.totalDuration} dk · {plan.drills.length} faz
                  </p>
                </section>
              )}
              {page.loading ? (
                <p role="status">Planlar yükleniyor…</p>
              ) : page.error ? (
                <div role="alert">
                  {page.error}
                  <Button onClick={page.retry}>Planları tekrar yükle</Button>
                </div>
              ) : (
                !options.length && (
                  <p>
                    Bu takım ve sezon için plan bulunmuyor. Yeni antrenman
                    oluşturabilirsiniz.
                  </p>
                )
              )}
              <nav
                aria-label="Antrenman seçenek sayfaları"
                className="drill-picker-pagination"
              >
                <Button
                  variant="outline"
                  disabled={saving || page.loading || page.pageNumber === 1}
                  onClick={page.previous}
                >
                  Önceki
                </Button>
                <span>
                  Sayfa {page.pageNumber} · {page.data?.summary?.total ?? 0}{' '}
                  plan
                </span>
                <Button
                  variant="outline"
                  disabled={saving || page.loading || !page.data?.nextCursor}
                  onClick={() => {
                    if (page.data?.nextCursor) page.next(page.data.nextCursor);
                  }}
                >
                  Sonraki
                </Button>
              </nav>
              {selectedId && !current && (
                <p role="status">Plan kontrol ediliyor…</p>
              )}
              {current?.error && (
                <div role="alert">
                  {current.error}
                  <Button
                    onClick={() => {
                      setSelection(undefined);
                      setRevision((value) => value + 1);
                    }}
                  >
                    Seçilen planı tekrar yükle
                  </Button>
                </div>
              )}
              {attached && (
                <p role="status">Bu egzersiz seçilen planda zaten bulunuyor.</p>
              )}
              {error && <p role="alert">{error}</p>}
              {uncertain && (
                <Button disabled={saving} onClick={() => void verify()}>
                  Planı yenile ve sonucu kontrol et
                </Button>
              )}
              <div className="drill-dialog-actions">
                <Button
                  variant="outline"
                  disabled={saving || uncertain}
                  onClick={() => setCreating(true)}
                >
                  Yeni antrenman
                </Button>
                <Button
                  disabled={saving || !plan || attached || uncertain}
                  onClick={() => void add()}
                >
                  {saving ? 'Kontrol ediliyor…' : 'Plana ekle'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      {creating && (
        <TrainingPlanDialog
          mode="create"
          open
          groupId={groupId}
          clubId={clubId}
          groupName={groupName}
          onOpenChange={setCreating}
          onSaved={async (created) => {
            if (!alive.current) return;
            setSelectedId(created.id);
            setCreating(false);
            await page.reload();
          }}
        />
      )}
    </>
  );
}
