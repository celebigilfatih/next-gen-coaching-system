import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { CheckCircle, Plus } from '@phosphor-icons/react';
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
import '../styles/drill-plan-workspace.css';

export function AddDrillToPlanDialog({
  groupId,
  clubId,
  groupName,
  seasonId,
  drillId,
  drillTitle,
  expectedVersionId,
  phase,
  onClose,
}: {
  groupId: string;
  clubId?: string;
  groupName: string;
  seasonId?: string;
  drillId: string;
  drillTitle: string;
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
  const phaseName = {
    WARM_UP: 'Isınma',
    TECHNICAL: 'Teknik',
    TACTICAL: 'Taktik',
    COOL_DOWN: 'Soğuma',
  }[phase];
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
        <DialogContent
          className="drill-plan-dialog drill-plan-workspace"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            document.getElementById('drill-target-plan')?.focus();
          }}
        >
          <DialogHeader className="drill-plan-header">
            <DialogTitle>Egzersizi antrenmana ekle</DialogTitle>
            <DialogDescription>
              Planı seçin, bilgilerini kontrol edin ve eklemeyi tamamlayın.
            </DialogDescription>
          </DialogHeader>
          <div className="drill-plan-scroll">
            <section
              className="drill-plan-exercise"
              aria-label="Eklenecek egzersiz"
            >
              <p>
                {groupName} · {phaseName}
              </p>
              <h3>{drillTitle}</h3>
            </section>
            {added ? (
              <div className="drill-plan-success" role="status">
                <CheckCircle size={28} aria-hidden="true" />
                <h3>Egzersiz plana eklendi.</h3>
                <p>{plan?.title}</p>
                <p>Antrenmanı açarak fazları inceleyebilirsiniz.</p>
              </div>
            ) : (
              <>
                <div className="drill-plan-choice-heading">
                  <label htmlFor="drill-target-plan">Antrenman planı</label>
                  <Button
                    id="drill-create-plan"
                    variant="ghost"
                    disabled={saving || uncertain}
                    onClick={() => setCreating(true)}
                  >
                    <Plus aria-hidden="true" /> Yeni antrenman
                  </Button>
                </div>
                <NativeSelect
                  id="drill-target-plan"
                  aria-describedby="drill-plan-selection-help"
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
                <p id="drill-plan-selection-help" className="drill-plan-help">
                  Yalnızca seçili takım ve sezonun planları gösterilir.
                </p>
                {page.loading ? (
                  <p className="drill-plan-notice" role="status">
                    Planlar yükleniyor…
                  </p>
                ) : page.error ? (
                  <div className="drill-plan-notice" role="alert">
                    <p>{page.error}</p>
                    <Button variant="outline" onClick={page.retry}>
                      Planları tekrar yükle
                    </Button>
                  </div>
                ) : (
                  !options.length && (
                    <p className="drill-plan-notice">
                      Bu takım ve sezon için plan bulunmuyor. Yeni antrenman
                      oluşturabilirsiniz.
                    </p>
                  )
                )}
                <nav
                  aria-label="Antrenman seçenek sayfaları"
                  className="drill-plan-pagination"
                >
                  <Button
                    variant="outline"
                    disabled={saving || page.loading || page.pageNumber === 1}
                    onClick={page.previous}
                  >
                    Önceki
                  </Button>
                  <span aria-live="polite">
                    Sayfa {page.pageNumber}
                    {page.data && <> · {page.data.summary.total} plan</>}
                  </span>
                  <Button
                    variant="outline"
                    disabled={saving || page.loading || !page.data?.nextCursor}
                    onClick={() => {
                      if (page.data?.nextCursor)
                        page.next(page.data.nextCursor);
                    }}
                  >
                    Sonraki
                  </Button>
                </nav>
                {selectedId && !current && (
                  <p className="drill-plan-notice" role="status">
                    Plan kontrol ediliyor…
                  </p>
                )}
                {current?.error && (
                  <div className="drill-plan-notice" role="alert">
                    <p>{current.error}</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelection(undefined);
                        setRevision((value) => value + 1);
                      }}
                    >
                      Seçilen planı tekrar yükle
                    </Button>
                  </div>
                )}
                {plan ? (
                  <section
                    aria-label="Seçilen antrenman özeti"
                    className="drill-plan-summary"
                  >
                    <p className="drill-plan-eyebrow">Seçilen antrenman</p>
                    <h3>{plan.title}</h3>
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
                    {plan.notes && (
                      <details>
                        <summary>Antrenmanın amacı</summary>
                        <p>{plan.notes}</p>
                      </details>
                    )}
                    {!attached && (
                      <p className="drill-plan-placement">
                        {phaseName} bölümünün sonuna eklenecek.
                      </p>
                    )}
                  </section>
                ) : (
                  !selectedId && (
                    <p className="drill-plan-placeholder">
                      Seçtiğiniz antrenmanın tarihi, süresi ve faz bilgisi
                      burada görünecek.
                    </p>
                  )
                )}
                {attached && (
                  <p className="drill-plan-notice" role="status">
                    Bu egzersiz seçilen planda zaten bulunuyor.
                  </p>
                )}
                {error && (
                  <p className="drill-plan-notice" role="alert">
                    {error}
                  </p>
                )}
                {uncertain && (
                  <Button
                    variant="outline"
                    disabled={saving}
                    onClick={() => void verify()}
                  >
                    Planı yenile ve sonucu kontrol et
                  </Button>
                )}
              </>
            )}
          </div>
          <div className="drill-plan-footer">
            <Button variant="outline" disabled={saving} onClick={onClose}>
              {added ? 'Tamam' : 'Vazgeç'}
            </Button>
            {added ? (
              <Button asChild>
                <Link to={`/app/trainings/${selectedId}`}>Antrenmanı aç</Link>
              </Button>
            ) : (
              <Button
                disabled={saving || !plan || attached || uncertain}
                onClick={() => void add()}
              >
                {saving ? 'Kontrol ediliyor…' : 'Plana ekle'}
              </Button>
            )}
          </div>
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
          returnFocusId="drill-create-plan"
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
