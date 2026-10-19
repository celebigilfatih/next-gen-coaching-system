import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { Link, useBlocker, useNavigate, useSearchParams } from 'react-router';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  ShieldChevron,
  Trash,
} from '@phosphor-icons/react';
import { PageContainer, PageHeader } from '../components/layout/page-layout';
import { FormError, FormField } from '../components/forms/form-field';
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
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { NativeSelect } from '../components/ui/native-select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog';
import { createClubSetup, getClubSetupStatus } from '../lib/api';
import { getSession, subscribeSession } from '../lib/session';
import { clubTheme, prepareClubLogo } from '../lib/club-branding';
import {
  newSetupDraft,
  setupErrors,
  setupRequestPattern,
  staffRoles,
  type ClubSetupDraft,
  type ClubSetupPayload,
  type ClubSetupResult,
  type SetupStaffRole,
} from '../lib/club-setup';
import '../styles/club-setup.css';

const steps = ['Kulüp', 'Sezon', 'Takımlar', 'Teknik kadro', 'Kontrol'];
export function meta() {
  return [{ title: 'Kulüp kurulumu | NGCS' }];
}

export default function ClubSetupRoute() {
  const session = useSyncExternalStore(
    subscribeSession,
    getSession,
    () => null,
  );
  if (session?.user.role !== 'SYSTEM_ADMIN')
    return (
      <PageContainer>
        <PageHeader title="Kulüp kurulumu" />
        <Alert>
          <AlertTitle>Yönetici erişimi gerekli</AlertTitle>
          <AlertDescription>
            Yeni kulüp ve ilk A Takım kurulumunu sistem yöneticisi yapabilir.
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/app/dashboard">Ana sayfaya dön</Link>
        </Button>
      </PageContainer>
    );
  return <SetupWizard key={session.user.id} />;
}

function SetupWizard() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const requestId = params.get('request');
  const [draft, setDraft] = useState(newSetupDraft);
  const [step, setStep] = useState(0);
  const [includeStaff, setIncludeStaff] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState(
    requestId && !setupRequestPattern.test(requestId)
      ? 'Kurulum bağlantısı geçersiz. Ayarlar üzerinden yeni kurulum açın.'
      : '',
  );
  const [logoBusy, setLogoBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState<ClubSetupPayload | null>(null);
  const [checking, setChecking] = useState(
    Boolean(requestId && setupRequestPattern.test(requestId)),
  );
  const [notFound, setNotFound] = useState(false);
  const [result, setResult] = useState<ClubSetupResult | null>(null);
  const [recovery, setRecovery] = useState(Boolean(requestId));
  const heading = useRef<HTMLHeadingElement>(null);
  const generation = useRef(0);
  const submitLock = useRef(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(newSetupDraft());
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !result &&
      (dirty || Boolean(requestId)) &&
      currentLocation.pathname !== nextLocation.pathname,
  );
  useEffect(() => {
    heading.current?.focus({ preventScroll: step === 0 });
  }, [step]);
  useEffect(() => {
    function warn(event: BeforeUnloadEvent) {
      if (!result && (dirty || requestId)) event.preventDefault();
    }
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, result, requestId]);
  useEffect(
    () => () => {
      generation.current++;
    },
    [],
  );
  useEffect(() => {
    if (!requestId || !recovery) return;
    const current = generation.current;
    let active = true;
    if (!setupRequestPattern.test(requestId)) {
      return;
    }
    void getClubSetupStatus(requestId)
      .then((value) => {
        if (!active || generation.current !== current) return;
        if (value.state === 'completed') setResult(value);
        else setNotFound(true);
      })
      .catch((cause: unknown) => {
        if (active) setError(message(cause));
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
    };
  }, [requestId, recovery]);

  function patch(part: keyof ClubSetupDraft, values: object) {
    setDraft((previous) => ({
      ...previous,
      [part]: { ...previous[part], ...values },
    }));
  }
  function go(next: number) {
    setErrors({});
    setError('');
    setStep(next);
  }
  function next() {
    const fields = setupErrors(draft, step);
    setErrors(fields);
    if (Object.keys(fields).length) {
      document.getElementById(Object.keys(fields)[0])?.focus();
      return;
    }
    if (step === 3) setIncludeStaff(true);
    go(step + 1);
  }
  async function logo(file?: File) {
    if (!file) return;
    setLogoBusy(true);
    setError('');
    const current = generation.current;
    try {
      const data = await prepareClubLogo(file);
      if (current === generation.current) patch('club', { logo: data });
    } catch (cause) {
      if (current === generation.current) setError(message(cause));
    } finally {
      if (current === generation.current) setLogoBusy(false);
    }
  }
  async function save() {
    if (submitLock.current) return;
    const validDraft = { ...draft, staff: includeStaff ? draft.staff : [] };
    for (let index = 0; index < 4; index++) {
      const fields = setupErrors(validDraft, index);
      if (Object.keys(fields).length) {
        setStep(index);
        setErrors(fields);
        return;
      }
    }
    const id = requestId ?? crypto.randomUUID();
    const payload = submitted ?? { ...validDraft, requestId: id };
    if (new TextEncoder().encode(JSON.stringify(payload)).length > 102_400) {
      setError(
        'Logo ve kayıtlar birlikte çok büyük. Logoyu küçültün veya daha az teknik kişi ekleyin.',
      );
      return;
    }
    if (!requestId) setParams({ request: id }, { replace: true });
    setSubmitted(payload);
    setNotFound(false);
    setBusy(true);
    setError('');
    submitLock.current = true;
    const current = generation.current;
    try {
      const saved = await createClubSetup(payload);
      if (current === generation.current) setResult(saved);
    } catch (cause) {
      if (current === generation.current) setError(message(cause));
    } finally {
      if (current === generation.current) {
        setBusy(false);
        submitLock.current = false;
      }
    }
  }
  async function check() {
    if (!requestId || !setupRequestPattern.test(requestId) || checking) return;
    setChecking(true);
    setError('');
    const current = generation.current;
    try {
      const saved = await getClubSetupStatus(requestId);
      if (current !== generation.current) return;
      if (saved.state === 'completed') setResult(saved);
      else setNotFound(true);
    } catch (cause) {
      if (current === generation.current) setError(message(cause));
    } finally {
      if (current === generation.current) setChecking(false);
    }
  }
  const choices = [
    { key: 'first-team', ...draft.firstTeam },
    ...draft.academyTeams,
  ];
  const field = (id: string, label: string, children: ReactNode) => (
    <FormField htmlFor={id} label={label}>
      {children}
      {errors[id] && (
        <p id={`${id}-error`} className="setup-field-error" role="alert">
          {errors[id]}
        </p>
      )}
    </FormField>
  );
  const input = (
    id: string,
    value: string,
    change: (value: string) => void,
    properties: {
      type?: string;
      maxLength?: number;
      min?: string;
      max?: string;
    } = {},
  ) => (
    <Input
      id={id}
      value={value}
      onChange={(event) => change(event.target.value)}
      aria-invalid={Boolean(errors[id])}
      aria-describedby={errors[id] ? `${id}-error` : undefined}
      {...properties}
    />
  );
  if (result)
    return (
      <PageContainer width="readable">
        <PageHeader
          eyebrow="Kurulum tamamlandı"
          title={result.clubName}
          description="Kulüp, sezon ve takımlar birlikte kaydedildi."
        />
        <Card>
          <CardHeader>
            <Check size={32} className="text-primary" />
            <CardTitle>Çalışma alanınız hazır</CardTitle>
            <CardDescription>
              {result.teamCount} takım ve {result.staffCount} teknik kadro kaydı
              oluşturuldu. Hesap davetleri ayrı yönetilir.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() =>
                navigate(
                  `/app/dashboard?${new URLSearchParams({ ngcsClub: result.clubId, ngcsSeason: result.clubSeasonId, ngcsTeam: result.firstTeamId })}`,
                )
              }
            >
              Çalışma alanına geç <ArrowRight />
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    );
  if (recovery)
    return (
      <PageContainer width="readable">
        <PageHeader
          title="Kurulum sonucunu kontrol et"
          description="Bu bağlantı yalnız kendi kurulum isteğinizin sonucunu gösterir. Formdaki kişi ve logo bilgileri tarayıcıya kaydedilmez."
        />
        <Card>
          <CardContent className="pt-5">
            <p role="status">
              {checking
                ? 'Sonuç kontrol ediliyor…'
                : notFound
                  ? 'Bu istek için tamamlanmış kurulum bulunamadı.'
                  : 'Sonuç henüz doğrulanamadı.'}
            </p>
            <FormError message={error} />
            <div className="mt-5 flex flex-wrap gap-3">
              <Button disabled={checking} onClick={() => void check()}>
                Yeniden kontrol et
              </Button>
              {notFound && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setRecovery(false);
                    setNotFound(false);
                    setError('');
                  }}
                >
                  Formu yeniden doldur
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    );

  return (
    <PageContainer className="club-setup-page">
      <PageHeader
        eyebrow="Çalışma alanı"
        title="Kulübünüzü kurun"
        description="Kulüp kimliğinden teknik kadroya, beş adımda hazır bir çalışma alanı."
        actions={
          <Button asChild variant="outline">
            <Link to="/app/settings">Ayarlara dön</Link>
          </Button>
        }
      />
      <ol className="setup-steps" aria-label="Kurulum adımları">
        {steps.map((label, index) => (
          <li key={label} aria-current={step === index ? 'step' : undefined}>
            <span
              className={
                index <= step ? 'setup-step setup-step--active' : 'setup-step'
              }
            >
              {index < step ? (
                <Check size={16} aria-hidden="true" />
              ) : (
                index + 1
              )}
            </span>
            <span>
              {label}
              {index === 3 && <small>İsteğe bağlı</small>}
            </span>
          </li>
        ))}
      </ol>
      <div className="setup-layout">
        <Card className="min-w-0">
          <CardHeader>
            <p className="setup-eyebrow">ADIM {step + 1} / 5</p>
            <h2 ref={heading} tabIndex={-1} className="setup-heading">
              {
                [
                  'Kulüp kimliği',
                  'Sezonu tanımlayın',
                  'Takımlarınızı belirleyin',
                  'Teknik kadroyu ekleyin',
                  'Bilgileri kontrol edin',
                ][step]
              }
            </h2>
            <CardDescription>
              {
                [
                  'Logo ve renkler kulübünüzün çalışma alanına yansır.',
                  'Sezon ve görev günleri Türkiye saatine göre değerlendirilir.',
                  'Bir A Takım oluşturulur; altyapı gruplarını ihtiyacınıza göre seçin.',
                  'Bu adımı atlayabilirsiniz. Kişi kaydı giriş hesabı oluşturmaz.',
                  'Son onayınıza kadar hiçbir kayıt oluşturulmadı.',
                ][step]
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (step < 4) next();
                else void save();
              }}
            >
              <fieldset
                disabled={busy || Boolean(submitted)}
                className="setup-fields"
              >
                {step === 0 && (
                  <>
                    {field(
                      'club-name',
                      'Kulüp adı',
                      input(
                        'club-name',
                        draft.club.name,
                        (name) => patch('club', { name }),
                        { maxLength: 80 },
                      ),
                    )}
                    {field(
                      'club-description',
                      'Kısa açıklama (isteğe bağlı)',
                      <Textarea
                        id="club-description"
                        maxLength={500}
                        rows={2}
                        value={draft.club.description}
                        onChange={(event) =>
                          patch('club', { description: event.target.value })
                        }
                        aria-invalid={Boolean(errors['club-description'])}
                      />,
                    )}
                    {field(
                      'club-logo',
                      'Kulüp logosu (isteğe bağlı)',
                      <>
                        <Input
                          id="club-logo"
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          disabled={logoBusy}
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            event.currentTarget.value = '';
                            void logo(file);
                          }}
                        />
                        <p className="setup-help">
                          PNG, JPEG veya WebP · En fazla 2 MiB. Logo yalnız
                          kurulumu tamamladığınızda yüklenir.
                        </p>
                        {logoBusy && <p role="status">Logo hazırlanıyor…</p>}
                        {draft.club.logo && (
                          <div className="flex items-center gap-4">
                            <img
                              src={draft.club.logo}
                              alt="Seçilen kulüp logosu"
                              className="setup-logo"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => patch('club', { logo: null })}
                            >
                              Logoyu kaldır
                            </Button>
                          </div>
                        )}
                      </>,
                    )}
                    <div className="setup-pair">
                      {(['primaryColor', 'secondaryColor'] as const).map(
                        (name, index) => (
                          <div key={name}>
                            {field(
                              name,
                              index === 0 ? 'Ana renk' : 'İkinci renk',
                              <div className="flex items-center gap-3">
                                <input
                                  type="color"
                                  aria-label={
                                    index === 0
                                      ? 'Ana renk seçici'
                                      : 'İkinci renk seçici'
                                  }
                                  value={
                                    /^#[0-9a-f]{6}$/i.test(draft.club[name])
                                      ? draft.club[name]
                                      : '#000000'
                                  }
                                  onChange={(event) =>
                                    patch('club', {
                                      [name]: event.target.value,
                                    })
                                  }
                                  className="setup-color"
                                />
                                {input(
                                  name,
                                  draft.club[name],
                                  (value) => patch('club', { [name]: value }),
                                  { maxLength: 7 },
                                )}
                              </div>,
                            )}
                          </div>
                        ),
                      )}
                    </div>
                    <p className="setup-help">
                      Butonlar, vurgu ve açık yüzeyler renklerinizden türetilir;
                      metin rengi okunabilirlik için otomatik seçilir.
                    </p>
                  </>
                )}
                {step === 1 && (
                  <>
                    {field(
                      'season-name',
                      'Sezon adı',
                      input(
                        'season-name',
                        draft.season.name,
                        (name) => patch('season', { name }),
                        { maxLength: 80 },
                      ),
                    )}
                    <div className="setup-pair">
                      {field(
                        'season-start',
                        'Başlangıç günü',
                        input(
                          'season-start',
                          draft.season.startDate,
                          (startDate) => patch('season', { startDate }),
                          { type: 'date', min: '1900-01-01' },
                        ),
                      )}
                      {field(
                        'season-end',
                        'Bitiş günü (dahil)',
                        input(
                          'season-end',
                          draft.season.endDate,
                          (endDate) => patch('season', { endDate }),
                          {
                            type: 'date',
                            min: draft.season.startDate || '1900-01-01',
                          },
                        ),
                      )}
                    </div>
                    <Alert>
                      <AlertDescription>
                        Tarih aralığını siz belirlersiniz. Fikstür veya
                        antrenman kaydı otomatik oluşturulmaz.
                      </AlertDescription>
                    </Alert>
                  </>
                )}
                {step === 2 && (
                  <>
                    <div className="setup-subsection">
                      <Badge>İlk takım</Badge>
                      <div className="setup-pair">
                        {field(
                          'first-name',
                          'A Takım adı',
                          input(
                            'first-name',
                            draft.firstTeam.name,
                            (name) => patch('firstTeam', { name }),
                            { maxLength: 80 },
                          ),
                        )}
                        {field(
                          'first-age',
                          'A Takım yaş etiketi',
                          input(
                            'first-age',
                            draft.firstTeam.ageGroupLabel,
                            (ageGroupLabel) =>
                              patch('firstTeam', { ageGroupLabel }),
                            { maxLength: 32 },
                          ),
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold">Altyapı grupları</h3>
                      <p className="setup-help">
                        Önerilerden seçin veya özel bir grup ekleyin. En fazla
                        20 altyapı takımı.
                      </p>
                      <div className="setup-age-options">
                        {Array.from({ length: 9 }, (_, i) => `U${i + 8}`).map(
                          (age) => {
                            const selected = draft.academyTeams.some(
                              (team) => team.key === age.toLowerCase(),
                            );
                            return (
                              <Button
                                type="button"
                                key={age}
                                variant={selected ? 'default' : 'outline'}
                                aria-pressed={selected}
                                disabled={
                                  !selected && draft.academyTeams.length >= 20
                                }
                                onClick={() =>
                                  setDraft((previous) => ({
                                    ...previous,
                                    academyTeams: selected
                                      ? previous.academyTeams.filter(
                                          (team) =>
                                            team.key !== age.toLowerCase(),
                                        )
                                      : [
                                          ...previous.academyTeams,
                                          {
                                            key: age.toLowerCase(),
                                            name: `${age} Takımı`,
                                            ageGroupLabel: age,
                                          },
                                        ],
                                  }))
                                }
                              >
                                {selected && <Check />} {age}
                              </Button>
                            );
                          },
                        )}
                      </div>
                    </div>
                    {draft.academyTeams.map((team) => (
                      <div key={team.key} className="setup-row">
                        <div className="setup-pair">
                          {field(
                            `name-${team.key}`,
                            'Takım adı',
                            input(
                              `name-${team.key}`,
                              team.name,
                              (name) =>
                                setDraft((previous) => ({
                                  ...previous,
                                  academyTeams: previous.academyTeams.map(
                                    (item) =>
                                      item.key === team.key
                                        ? { ...item, name }
                                        : item,
                                  ),
                                })),
                              { maxLength: 80 },
                            ),
                          )}
                          {field(
                            `age-${team.key}`,
                            'Yaş / kademe etiketi',
                            input(
                              `age-${team.key}`,
                              team.ageGroupLabel,
                              (ageGroupLabel) =>
                                setDraft((previous) => ({
                                  ...previous,
                                  academyTeams: previous.academyTeams.map(
                                    (item) =>
                                      item.key === team.key
                                        ? { ...item, ageGroupLabel }
                                        : item,
                                  ),
                                })),
                              { maxLength: 32 },
                            ),
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          aria-label={`${team.name} grubunu kaldır`}
                          onClick={() =>
                            setDraft((previous) => ({
                              ...previous,
                              academyTeams: previous.academyTeams.filter(
                                (item) => item.key !== team.key,
                              ),
                            }))
                          }
                        >
                          <Trash />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      disabled={draft.academyTeams.length >= 20}
                      onClick={() =>
                        setDraft((previous) => ({
                          ...previous,
                          academyTeams: [
                            ...previous.academyTeams,
                            {
                              key: `team-${crypto.randomUUID()}`,
                              name: '',
                              ageGroupLabel: '',
                            },
                          ],
                        }))
                      }
                    >
                      <Plus /> Özel grup ekle
                    </Button>
                  </>
                )}
                {step === 3 && (
                  <>
                    <Alert>
                      <AlertDescription>
                        Her satır ayrı bir kişi ve takım görevidir. Aynı adlı
                        kişiler birleştirilmez. Giriş hesabı, davet ve erişim
                        yetkisi oluşturulmaz.
                      </AlertDescription>
                    </Alert>
                    {!draft.staff.length && (
                      <p className="setup-help">
                        Henüz teknik kadro eklenmedi. Bu adımı “Sonra ekle” ile
                        atlayabilirsiniz.
                      </p>
                    )}
                    {draft.staff.map((person, index) => {
                      const update = (values: object) =>
                        setDraft((previous) => ({
                          ...previous,
                          staff: previous.staff.map((item) =>
                            item.key === person.key
                              ? { ...item, ...values }
                              : item,
                          ),
                        }));
                      return (
                        <div className="setup-subsection" key={person.key}>
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">
                              Teknik kişi {index + 1}
                            </h3>
                            <Button
                              type="button"
                              variant="ghost"
                              aria-label={`Teknik kişi ${index + 1} kaydını kaldır`}
                              onClick={() =>
                                setDraft((previous) => ({
                                  ...previous,
                                  staff: previous.staff.filter(
                                    (item) => item.key !== person.key,
                                  ),
                                }))
                              }
                            >
                              <Trash />
                            </Button>
                          </div>
                          {field(
                            `staff-${person.key}`,
                            'Ad soyad',
                            input(
                              `staff-${person.key}`,
                              person.name,
                              (name) => update({ name }),
                              { maxLength: 80 },
                            ),
                          )}
                          <div className="setup-pair">
                            {field(
                              `role-${person.key}`,
                              'Sportif görev',
                              <NativeSelect
                                id={`role-${person.key}`}
                                value={person.role}
                                onChange={(event) =>
                                  update({
                                    role: event.target.value as SetupStaffRole,
                                  })
                                }
                              >
                                {staffRoles.map((role) => (
                                  <option value={role.key} key={role.key}>
                                    {role.name}
                                  </option>
                                ))}
                              </NativeSelect>,
                            )}
                            {field(
                              `team-${person.key}`,
                              'Görev takımı',
                              <NativeSelect
                                id={`team-${person.key}`}
                                value={
                                  choices.some(
                                    (team) => team.key === person.teamKey,
                                  )
                                    ? person.teamKey
                                    : ''
                                }
                                aria-invalid={Boolean(
                                  errors[`team-${person.key}`],
                                )}
                                onChange={(event) =>
                                  update({ teamKey: event.target.value })
                                }
                              >
                                <option value="" disabled>
                                  Takım seçin
                                </option>
                                {choices.map((team) => (
                                  <option key={team.key} value={team.key}>
                                    {team.name}
                                  </option>
                                ))}
                              </NativeSelect>,
                            )}
                          </div>
                          <div className="setup-pair">
                            {field(
                              `from-${person.key}`,
                              'Görev başlangıcı',
                              input(
                                `from-${person.key}`,
                                person.validFrom,
                                (validFrom) => update({ validFrom }),
                                {
                                  type: 'date',
                                  min: draft.season.startDate,
                                  max: draft.season.endDate,
                                },
                              ),
                            )}
                            {field(
                              `to-${person.key}`,
                              'Görev bitişi (dahil)',
                              input(
                                `to-${person.key}`,
                                person.validTo,
                                (validTo) => update({ validTo }),
                                {
                                  type: 'date',
                                  min: person.validFrom,
                                  max: draft.season.endDate,
                                },
                              ),
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <Button
                      type="button"
                      variant="outline"
                      disabled={draft.staff.length >= 60}
                      onClick={() =>
                        setDraft((previous) => ({
                          ...previous,
                          staff: [
                            ...previous.staff,
                            {
                              key: crypto.randomUUID(),
                              name: '',
                              role: 'HEAD_COACH',
                              teamKey: 'first-team',
                              validFrom: previous.season.startDate,
                              validTo: previous.season.endDate,
                            },
                          ],
                        }))
                      }
                    >
                      <Plus /> Teknik kişi ekle
                    </Button>
                  </>
                )}
                {step === 4 && (
                  <div className="setup-review">
                    <dl>
                      <div>
                        <dt>Kulüp</dt>
                        <dd>{draft.club.name}</dd>
                      </div>
                      <div>
                        <dt>Sezon</dt>
                        <dd>
                          {draft.season.name} · {draft.season.startDate} –{' '}
                          {draft.season.endDate}
                        </dd>
                      </div>
                      <div>
                        <dt>Takımlar</dt>
                        <dd>
                          {choices.map((team) => (
                            <Badge variant="outline" key={team.key}>
                              {team.name}
                            </Badge>
                          ))}
                        </dd>
                      </div>
                      <div>
                        <dt>Teknik kadro</dt>
                        <dd>
                          {includeStaff && draft.staff.length
                            ? draft.staff.map((person) => (
                                <p key={person.key}>
                                  {person.name} ·{' '}
                                  {
                                    staffRoles.find(
                                      (role) => role.key === person.role,
                                    )?.name
                                  }{' '}
                                  ·{' '}
                                  {
                                    choices.find(
                                      (team) => team.key === person.teamKey,
                                    )?.name
                                  }
                                  <small>
                                    {person.validFrom} – {person.validTo}
                                  </small>
                                </p>
                              ))
                            : 'Sonra eklenecek'}
                        </dd>
                      </div>
                    </dl>
                    <Alert>
                      <AlertDescription>
                        Yeni kulüp ve bağlı kayıtlar birlikte oluşturulacak.
                        Kişiler için hesap açılmaz ve davet gönderilmez.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </fieldset>
              <FormError message={error} />
              {submitted && !busy && (
                <Alert className="mt-4">
                  <AlertTitle>Önce kayıt sonucunu doğrulayın</AlertTitle>
                  <AlertDescription>
                    Bağlantı kesilmiş olsa da kayıt tamamlanmış olabilir. Aynı
                    istek korunuyor.
                  </AlertDescription>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={checking}
                      onClick={() => void check()}
                    >
                      {checking ? 'Kontrol ediliyor…' : 'Sonucu kontrol et'}
                    </Button>
                    <Button
                      type="button"
                      disabled={checking}
                      onClick={() => void save()}
                    >
                      Aynı isteği tekrar gönder
                    </Button>
                    {notFound && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setSubmitted(null);
                          setStep(0);
                          setError('');
                        }}
                      >
                        Bilgileri düzenle
                      </Button>
                    )}
                  </div>
                  {notFound && (
                    <p className="setup-help">
                      Tamamlanmış kayıt bulunamadı. Düzenlemede aynı istek
                      kimliği korunur.
                    </p>
                  )}
                </Alert>
              )}
              <div className="setup-footer">
                <Button
                  type="button"
                  variant="outline"
                  disabled={step === 0 || busy || Boolean(submitted)}
                  onClick={() => go(step - 1)}
                >
                  <ArrowLeft /> Geri
                </Button>
                <div className="flex flex-wrap justify-end gap-2">
                  {step === 3 && (
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={busy || Boolean(submitted)}
                      onClick={() => {
                        setIncludeStaff(false);
                        go(4);
                      }}
                    >
                      Sonra ekle
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={busy || logoBusy || Boolean(submitted)}
                  >
                    {busy
                      ? 'Kaydediliyor…'
                      : step === 4
                        ? 'Kurulumu oluştur'
                        : 'Devam et'}
                    {!busy && <ArrowRight />}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
        <aside className="setup-aside">
          <div className="setup-preview" style={clubTheme(draft.club)}>
            <p className="setup-eyebrow">CANLI TEMA ÖNİZLEMESİ</p>
            <div className="setup-preview-brand">
              {draft.club.logo ? (
                <img src={draft.club.logo} alt="Logo önizlemesi" />
              ) : (
                <ShieldChevron size={36} />
              )}
              <strong>{draft.club.name || 'Kulübünüz'}</strong>
            </div>
            <div className="setup-preview-nav">Genel bakış</div>
            <div className="setup-preview-card">
              <span>Çalışma alanı</span>
              <h3>Birlikte gelişelim.</h3>
              <p>
                {choices.length} takım · {includeStaff ? draft.staff.length : 0}{' '}
                teknik kişi
              </p>
              <Button
                type="button"
                tabIndex={-1}
                className="pointer-events-none"
              >
                Örnek buton <ArrowRight />
              </Button>
            </div>
            <div className="setup-swatches">
              <span style={{ background: draft.club.primaryColor }} />
              <span style={{ background: draft.club.secondaryColor }} />
              <small>Otomatik uyumlu tonlar</small>
            </div>
          </div>
          <p className="setup-help">
            Önizleme henüz kaydedilmedi. Sayfayı yenilerseniz form temizlenir;
            gönderilmiş bir isteğin sonucu aynı bağlantıdan sorgulanabilir.
          </p>
        </aside>
      </div>
      <Dialog
        open={blocker.state === 'blocked'}
        onOpenChange={(open) => {
          if (!open && blocker.state === 'blocked') blocker.reset();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kurulumdan ayrılsın mı?</DialogTitle>
            <DialogDescription>
              Kaydedilmemiş form bilgileri silinir. Gönderilmiş isteğiniz varsa
              sonucu aynı kurulum bağlantısından kontrol edebilirsiniz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => {
                if (blocker.state === 'blocked') blocker.reset();
              }}
            >
              Kuruluma dön
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (blocker.state === 'blocked') blocker.proceed();
              }}
            >
              Ayrıl
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

function message(cause: unknown) {
  return cause instanceof Error
    ? cause.message
    : 'İşlem tamamlanamadı. Lütfen yeniden deneyin.';
}
