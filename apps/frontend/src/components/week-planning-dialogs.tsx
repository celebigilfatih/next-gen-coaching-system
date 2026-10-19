import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import {
  applyWeekProgram,
  createPlanningEvent,
  deletePlanningEvent,
  deleteTrainingPlan,
  getPlanningTeams,
  getWeekApplication,
  previewWeekProgram,
  updatePlanningEvent,
  updateTrainingPlan,
} from '../lib/api';
import {
  localInput,
  planningLabels,
  planningRequestPattern,
  type ApplyProgram,
  type PlanningEvent,
  type PlanningEventInput,
  type PlanningKind,
  type PlanningResult,
  type PlanningTeam,
  type ProgramInput,
  type ProgramPreview,
} from '../lib/planning';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { NativeSelect } from './ui/native-select';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { FormField, FormError } from './forms/form-field';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';

const message = (e: unknown) =>
  e instanceof Error ? e.message : 'İşlem tamamlanamadı.';
function useAlive() {
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  return alive;
}
function Result({ result }: { result: PlanningResult }) {
  return (
    <Alert>
      <AlertTitle>Kayıt tamamlandı</AlertTitle>
      <AlertDescription>
        {result.teamCount} takım · {result.trainingCount} antrenman/toparlanma ·{' '}
        {result.meetingCount} toplantı · toplam {result.eventCount} etkinlik.
        Mevcut maçlar korunmuştur.
      </AlertDescription>
    </Alert>
  );
}

export function WeekProgramDialog({
  clubSeasonId,
  seasonId,
  weekStart,
  onClose,
  onSaved,
}: {
  clubSeasonId: string;
  seasonId?: string;
  weekStart: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [params, setParams] = useSearchParams();
  const recovery = params.get('planningRequest');
  const [id] = useState(() =>
    recovery && planningRequestPattern.test(recovery)
      ? recovery
      : crypto.randomUUID(),
  );
  const [teams, setTeams] = useState<PlanningTeam[]>([]);
  const [selected, setSelected] = useState<string[]>(
    seasonId ? [seasonId] : [],
  );
  const [overrides, setOverrides] = useState<ProgramInput['overrides']>([]);
  const [preview, setPreview] = useState<ProgramPreview>();
  const [validPreview, setValidPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState<ApplyProgram>();
  const [result, setResult] = useState<PlanningResult>();
  const [recovering, setRecovering] = useState(!!recovery);
  const [recoveryChecked, setRecoveryChecked] = useState(false);
  const lock = useRef(false),
    sequence = useRef(0),
    alive = useAlive();
  useEffect(() => {
    let active = true;
    getPlanningTeams(clubSeasonId)
      .then((value) => {
        if (active) setTeams(value.items);
      })
      .catch((e) => {
        if (active) setError(message(e));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [clubSeasonId]);
  useEffect(() => {
    if (!recovery || submitted) return;
    let active = true;
    if (!planningRequestPattern.test(recovery)) {
      return;
    }
    getWeekApplication(recovery)
      .then((value) => {
        if (!active) return;
        if (value.state === 'completed') setResult(value);
        else setRecoveryChecked(true);
      })
      .catch((e) => {
        if (active) setError(message(e));
      })
      .finally(() => {
        if (active) setRecovering(false);
      });
    return () => {
      active = false;
    };
  }, [recovery, submitted]);
  function changeRow(
    key: string,
    patch: { excluded?: boolean; startsAt?: string },
  ) {
    sequence.current++;
    setValidPreview(false);
    setError('');
    setOverrides((previous) => {
      const old = previous.find((o) => o.key === key);
      return [
        ...previous.filter((o) => o.key !== key),
        { key, excluded: old?.excluded ?? false, ...old, ...patch },
      ];
    });
  }
  async function generate() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    const current = ++sequence.current;
    try {
      const value = await previewWeekProgram({
        weekStart,
        seasonIds: selected,
        overrides,
      });
      if (alive.current && current === sequence.current) {
        setPreview(value);
        setValidPreview(true);
      }
    } catch (e) {
      if (alive.current) setError(message(e));
    } finally {
      lock.current = false;
      if (alive.current) setBusy(false);
    }
  }
  async function check() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      const value = await getWeekApplication(id);
      if (!alive.current) return;
      if (value.state === 'completed') setResult(value);
      else {
        setRecoveryChecked(true);
        setError('Henüz tamamlanmış kayıt yok. Aynı isteği yeniden deneyin.');
      }
    } catch (e) {
      if (alive.current) setError(message(e));
    } finally {
      lock.current = false;
      if (alive.current) setBusy(false);
    }
  }
  async function save() {
    if (lock.current || (!preview && !submitted)) return;
    const input = submitted ?? {
      requestId: id,
      previewToken: preview!.token,
      program: preview!.input,
    };
    setSubmitted(input);
    lock.current = true;
    setBusy(true);
    setError('');
    const next = new URLSearchParams(params);
    next.set('planningRequest', id);
    setParams(next, { replace: true });
    try {
      const value = await applyWeekProgram(input);
      if (alive.current) setResult(value);
    } catch (e) {
      if (alive.current) setError(message(e));
    } finally {
      lock.current = false;
      if (alive.current) setBusy(false);
    }
  }
  function finish() {
    onSaved();
    const next = new URLSearchParams(params);
    next.delete('planningRequest');
    setParams(next, { replace: true });
    onClose();
  }
  const frozen = !!submitted && !result;
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <DialogContent className="week-program-dialog">
        <DialogHeader>
          <DialogTitle>Haftalık program hazırla</DialogTitle>
          <DialogDescription>
            {weekStart} haftası · Dengeli gelişim · Örnek kulüp programı.
            Önizleme kayıt oluşturmaz; yalnız son uygulama yazar.
          </DialogDescription>
        </DialogHeader>
        <div className="week-program-body">
          <FormError message={error} />
          {recovery && !planningRequestPattern.test(recovery) ? (
            <p role="alert">Planlama bağlantısı geçersiz.</p>
          ) : result ? (
            <Result result={result} />
          ) : recovering ? (
            <p role="status">Önceki isteğin sonucu kontrol ediliyor…</p>
          ) : (
            <>
              {recovery && !recoveryChecked && !submitted ? (
                <Button disabled={busy} onClick={() => void check()}>
                  Sonucu tekrar kontrol et
                </Button>
              ) : null}
              {recoveryChecked && !submitted && (
                <p role="status">
                  Kayıt bulunmadı. Yeniden seçim yapın; aynı istek kimliği
                  korunur.
                </p>
              )}
              <fieldset
                disabled={busy || frozen}
                className="week-team-selection"
              >
                <legend>Program uygulanacak takımlar</legend>
                {loading ? (
                  <p role="status">Takımlar yükleniyor…</p>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelected(teams.map((t) => t.seasonId));
                        setPreview(undefined);
                        setValidPreview(false);
                        setOverrides([]);
                      }}
                    >
                      Tüm takımları seç
                    </Button>
                    {!teams.length && (
                      <p>Bu sezonda yönetebileceğiniz takım bulunmuyor.</p>
                    )}
                    <div className="week-team-options">
                      {teams.map((t) => (
                        <label key={t.seasonId}>
                          <input
                            type="checkbox"
                            checked={selected.includes(t.seasonId)}
                            onChange={(e) => {
                              setSelected((p) =>
                                e.target.checked
                                  ? [...p, t.seasonId]
                                  : p.filter((s) => s !== t.seasonId),
                              );
                              setOverrides([]);
                              setPreview(undefined);
                              setValidPreview(false);
                            }}
                          />
                          {t.name} <small>{t.ageGroup}</small>
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </fieldset>
              <p className="text-sm text-muted-foreground">
                A Takım 10.00/16.00; altyapı hafta içi 17.00 sonrası. Küçük
                yaşlarda daha az seans; maç çevresinde aktivasyon ve toparlanma.
                Mevcut maçlar değiştirilmez.
              </p>
              {!frozen && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    disabled={busy || loading || !selected.length}
                    onClick={() => void generate()}
                  >
                    {busy
                      ? 'Hazırlanıyor…'
                      : preview
                        ? 'Önizlemeyi güncelle'
                        : 'Önizleme hazırla'}
                  </Button>
                  {!!overrides.length && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setOverrides([]);
                        setValidPreview(false);
                        setPreview(undefined);
                      }}
                    >
                      Satır değişikliklerini sıfırla
                    </Button>
                  )}
                </div>
              )}
              {preview && (
                <div className="week-program-preview">
                  {preview.teams.map((team) => (
                    <details
                      className="week-team-preview"
                      open={
                        team.seasonId === seasonId || preview.teams.length === 1
                      }
                      key={team.seasonId}
                      aria-label={`${team.name} program önizlemesi`}
                    >
                      <summary>
                        <h3>
                          {team.name}{' '}
                          <Badge variant="secondary">{team.ageGroup}</Badge>
                        </h3>
                        <span>{team.events.length} etkinlik</span>
                      </summary>
                      <p>
                        {team.matches.length
                          ? team.matches
                              .map(
                                (m) =>
                                  `${new Date(m.date).toLocaleString('tr-TR')} · ${m.opponent}`,
                              )
                              .join(' / ')
                          : 'Kayıtlı maç yok · gelişim haftası'}
                      </p>
                      {team.events.map((event) => {
                        const edit = overrides.find((o) => o.key === event.key);
                        return (
                          <div className="week-preview-row" key={event.key}>
                            <label>
                              <input
                                type="checkbox"
                                disabled={busy || frozen}
                                checked={!edit?.excluded}
                                onChange={(e) =>
                                  changeRow(event.key, {
                                    excluded: !e.target.checked,
                                  })
                                }
                              />
                              <span>
                                <strong>{event.title}</strong>
                                <small>
                                  {planningLabels[event.kind]} ·{' '}
                                  {event.duration} dk
                                </small>
                                {event.topic && <small>{event.topic}</small>}
                              </span>
                            </label>
                            <Input
                              type="datetime-local"
                              aria-label={`${team.name} ${event.title} saati`}
                              disabled={busy || frozen}
                              value={localInput(
                                edit?.startsAt ?? event.startsAt,
                              )}
                              onChange={(e) => {
                                if (e.target.value)
                                  changeRow(event.key, {
                                    startsAt: new Date(
                                      e.target.value,
                                    ).toISOString(),
                                  });
                              }}
                            />
                            {!!event.phases?.length && (
                              <details className="week-phase-preview">
                                <summary>
                                  {event.phases.length} faz ve egzersiz
                                </summary>
                                {event.phases.map((phase) => (
                                  <section key={phase.phase}>
                                    <strong>
                                      {phase.title} · {phase.duration} dk
                                    </strong>
                                    <p>{phase.notes}</p>
                                  </section>
                                ))}
                              </details>
                            )}
                          </div>
                        );
                      })}
                    </details>
                  ))}
                </div>
              )}
              {validPreview && preview?.conflicts.length ? (
                <Alert role="alert">
                  <AlertTitle>Programı uygulamadan önce düzeltin</AlertTitle>
                  <AlertDescription>
                    <ul>
                      {preview.conflicts.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              ) : null}
              {preview && !validPreview && !frozen && (
                <p role="status">
                  Satırlar değişti. Kayıttan önce önizlemeyi güncelleyin.
                </p>
              )}
              {frozen && (
                <Alert>
                  <AlertTitle>Gönderilen taslak korunuyor</AlertTitle>
                  <AlertDescription>
                    Sonucu kontrol edin veya aynı isteği tekrar gönderin. Yeni
                    bir istekle tekrar program oluşturmayın.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>
        <DialogFooter>
          {result ? (
            <Button onClick={finish}>Haftayı göster</Button>
          ) : (
            <>
              <Button variant="outline" disabled={busy} onClick={onClose}>
                Kapat
              </Button>
              {frozen && (
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => void check()}
                >
                  Sonucu kontrol et
                </Button>
              )}
              {frozen && recoveryChecked && (
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => {
                    setSubmitted(undefined);
                    setValidPreview(false);
                    setRecoveryChecked(false);
                  }}
                >
                  Taslağı düzenle
                </Button>
              )}
              <Button
                disabled={
                  busy ||
                  loading ||
                  recovering ||
                  (!submitted &&
                    (!validPreview || !preview || !!preview.conflicts.length))
                }
                onClick={() => void save()}
              >
                {busy
                  ? 'İşleniyor…'
                  : submitted
                    ? 'Aynı isteği yeniden dene'
                    : 'Programı uygula'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function WeekEventDialog({
  seasonId,
  day,
  event,
  onClose,
  onSaved,
}: {
  seasonId: string;
  day: string;
  event?: PlanningEvent;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [params, setParams] = useSearchParams();
  const [id] = useState(() => crypto.randomUUID());
  const [kind, setKind] = useState<PlanningKind>(
    (event?.kind as PlanningKind) ?? 'TRAINING',
  );
  const [title, setTitle] = useState(event?.title ?? '');
  const [date, setDate] = useState(
    event ? localInput(event.date) : `${day}T17:00`,
  );
  const [duration, setDuration] = useState(event?.duration ?? 60);
  const [notes, setNotes] = useState(event?.notes ?? '');
  const [location, setLocation] = useState(event?.location ?? '');
  const [topic, setTopic] = useState(event?.topic ?? '');
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [result, setResult] = useState<PlanningResult>();
  const [submitted, setSubmitted] = useState<PlanningEventInput>();
  const [canEdit, setCanEdit] = useState(false);
  const lock = useRef(false),
    alive = useAlive();
  const physical = event?.source === 'plan';
  const invalidDuration = physical
    ? false
    : !Number.isInteger(duration) ||
      duration <
        (!event && ['TRAINING', 'RECOVERY', 'TACTICAL'].includes(kind)
          ? 20
          : 1) ||
      duration > 480;
  async function save() {
    if (lock.current || !title.trim() || !date) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      if (event) {
        if (physical)
          await updateTrainingPlan(event.id, {
            title,
            date: new Date(date).toISOString(),
            notes,
          });
        else
          await updatePlanningEvent(event.id, {
            seasonId,
            kind,
            title,
            startsAt: new Date(date).toISOString(),
            duration,
            notes,
            location,
            topic,
          });
        if (alive.current) {
          onSaved();
          onClose();
        }
      } else {
        const input = submitted ?? {
          requestId: id,
          seasonId,
          kind,
          title,
          startsAt: new Date(date).toISOString(),
          duration,
          notes,
          location,
          topic,
        };
        setSubmitted(input);
        const next = new URLSearchParams(params);
        next.set('planningRequest', id);
        setParams(next, { replace: true });
        const value = await createPlanningEvent(input);
        if (alive.current) setResult(value);
      }
    } catch (e) {
      if (alive.current) setError(message(e));
    } finally {
      lock.current = false;
      if (alive.current) setBusy(false);
    }
  }
  async function check() {
    setBusy(true);
    setError('');
    try {
      const value = await getWeekApplication(id);
      if (alive.current) {
        if (value.state === 'completed') setResult(value);
        else {
          setCanEdit(true);
          setError(
            'Henüz kayıt yok. Aynı isteği yeniden deneyin veya taslağı düzenleyin.',
          );
        }
      }
    } catch (e) {
      if (alive.current) setError(message(e));
    } finally {
      if (alive.current) setBusy(false);
    }
  }
  function finish() {
    onSaved();
    const next = new URLSearchParams(params);
    next.delete('planningRequest');
    setParams(next, { replace: true });
    onClose();
  }
  return (
    <Dialog
      open
      onOpenChange={(o) => {
        if (!o && !busy) onClose();
      }}
    >
      <DialogContent className="week-event-dialog">
        <DialogHeader>
          <DialogTitle>
            {event ? 'Etkinliği düzenle' : 'Etkinlik ekle'}
          </DialogTitle>
          <DialogDescription>
            {physical
              ? 'Antrenman süresi fazlardan hesaplanır. Fazları antrenman detayından düzenleyin.'
              : 'Seçili takım ve sezon için saat, süre ve amacı belirleyin. Yeni fiziksel seans dört örnek fazla oluşturulur.'}
          </DialogDescription>
        </DialogHeader>
        <FormError message={error} />
        {result ? (
          <Result result={result} />
        ) : (
          <fieldset
            disabled={busy || !!submitted}
            className="week-event-fields"
          >
            <FormField htmlFor="event-kind" label="Etkinlik türü">
              <NativeSelect
                id="event-kind"
                disabled={!!event}
                value={kind}
                onChange={(e) => setKind(e.target.value as PlanningKind)}
              >
                {(
                  Object.entries(planningLabels).filter(
                    ([k]) => k !== 'MATCH',
                  ) as [PlanningKind, string][]
                ).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </NativeSelect>
            </FormField>
            <FormField htmlFor="event-title" label="Başlık">
              <Input
                id="event-title"
                maxLength={120}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </FormField>
            <FormField htmlFor="event-date" label="Başlangıç">
              <Input
                id="event-date"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </FormField>
            <FormField htmlFor="event-duration" label="Süre (dk)">
              <Input
                id="event-duration"
                type="number"
                min={
                  ['TRAINING', 'TACTICAL', 'RECOVERY'].includes(kind) ? 20 : 1
                }
                max={480}
                disabled={physical}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </FormField>
            {!physical && (
              <>
                <FormField htmlFor="event-location" label="Yer">
                  <Input
                    id="event-location"
                    maxLength={200}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </FormField>
                <FormField htmlFor="event-topic" label="Gündem / konu">
                  <Textarea
                    id="event-topic"
                    maxLength={500}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </FormField>
              </>
            )}
            <FormField htmlFor="event-notes" label="Amaç ve notlar">
              <Textarea
                id="event-notes"
                maxLength={3000}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </FormField>
          </fieldset>
        )}
        <DialogFooter>
          {result ? (
            <Button onClick={finish}>Haftayı göster</Button>
          ) : (
            <>
              <Button variant="outline" disabled={busy} onClick={onClose}>
                Vazgeç
              </Button>
              {submitted && (
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => void check()}
                >
                  Sonucu kontrol et
                </Button>
              )}
              {submitted && canEdit && (
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => {
                    setSubmitted(undefined);
                    setCanEdit(false);
                  }}
                >
                  Taslağı düzenle
                </Button>
              )}
              <Button
                disabled={busy || !title.trim() || !date || invalidDuration}
                onClick={() => void save()}
              >
                {busy
                  ? 'Kaydediliyor…'
                  : submitted
                    ? 'Aynı isteği yeniden dene'
                    : 'Kaydet'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
export function WeekDeleteDialog({
  event,
  onClose,
  onSaved,
}: {
  event: PlanningEvent;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const alive = useAlive();
  async function remove() {
    setBusy(true);
    setError('');
    try {
      if (event.source === 'plan') await deleteTrainingPlan(event.id);
      else await deletePlanningEvent(event.id);
      if (alive.current) {
        onSaved();
        onClose();
      }
    } catch (e) {
      if (alive.current) setError(message(e));
    } finally {
      if (alive.current) setBusy(false);
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(o) => {
        if (!o && !busy) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Etkinliği kalıcı sil</DialogTitle>
          <DialogDescription>
            “{event.title}” silinecek.{' '}
            {event.source === 'plan'
              ? 'Antrenman fazları, tahta kopyaları ve bağlı yoklama kayıtları da kaldırılır. '
              : ''}
            Bu işlem geri alınamaz.
          </DialogDescription>
        </DialogHeader>
        <FormError message={error} />
        <DialogFooter>
          <Button variant="outline" disabled={busy} onClick={onClose}>
            Vazgeç
          </Button>
          <Button
            variant="destructive"
            disabled={busy}
            onClick={() => void remove()}
          >
            {busy ? 'Siliniyor…' : 'Kalıcı sil'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
