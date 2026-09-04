import {
  CalendarBlank,
  CaretDown,
  CheckCircle,
  ClipboardText,
  Clock,
  FloppyDisk,
  ShieldChevron,
  SoccerBall,
  Target,
  UsersThree,
  UserCircle,
  X,
} from '@phosphor-icons/react';
import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router';
import {
  createTrainingPlan,
  listAttendance,
  listDrills,
  listGroupMembers,
  listGroups,
  listMatches,
  listSeasons,
  listTrainingPlans,
  markAttendance,
  replaceTrainingPlanDrills,
  updateMatch,
  updateTrainingPlan,
  type Drill,
  type DrillPhase,
  type MatchAnalysis,
} from '../lib/api';
import { getSession, type SessionUser } from '../lib/session';

type Mode = 'overview' | 'plan' | 'attendance' | 'match';

type WeekDay = {
  key: string;
  short: string;
  day: string;
  month: string;
  isToday?: boolean;
  event?: {
    time: string;
    label: string;
    detail: string;
    kind: 'training' | 'match';
  };
};

const week: WeekDay[] = [
  { key: '2026-08-31', short: 'PZT', day: '31', month: 'Ağustos' },
  { key: '2026-09-01', short: 'SAL', day: '01', month: 'Eylül', isToday: true },
  {
    key: '2026-09-02',
    short: 'ÇAR',
    day: '02',
    month: 'Eylül',
    event: {
      time: '18:00',
      label: 'Antrenman',
      detail: 'Saha 1',
      kind: 'training',
    },
  },
  { key: '2026-09-03', short: 'PER', day: '03', month: 'Eylül' },
  { key: '2026-09-04', short: 'CUM', day: '04', month: 'Eylül' },
  { key: '2026-09-05', short: 'CMT', day: '05', month: 'Eylül' },
  {
    key: '2026-09-06',
    short: 'PZR',
    day: '06',
    month: 'Eylül',
    event: { time: '15:00', label: 'Maç', detail: 'Deplasman', kind: 'match' },
  },
];

type TrainingPhase = {
  id: number;
  phase: DrillPhase;
  name: string;
  drillId?: string;
  drillTitle: string;
  notes: string;
  minutes: number;
};

const initialPhases: TrainingPhase[] = [
  {
    id: 1,
    phase: 'WARM_UP',
    name: 'Isınma',
    drillTitle: 'Dinamik ısınma ve koordinasyon',
    notes: 'Pas açma çalışmaları.',
    minutes: 15,
  },
  {
    id: 2,
    phase: 'TECHNICAL',
    name: 'Teknik',
    drillTitle: 'Pas, kontrol ve yön değiştirme',
    notes: '3’e 2 geçiş oyunları.',
    minutes: 25,
  },
  {
    id: 3,
    phase: 'TACTICAL',
    name: 'Taktik',
    drillTitle: 'Pozisyon oyunu ve oyun kurma',
    notes: 'Son pas ve bitirme.',
    minutes: 35,
  },
  {
    id: 4,
    phase: 'COOL_DOWN',
    name: 'Soğuma',
    drillTitle: 'Yavaş koşu ve esneme',
    notes: 'Toparlanma.',
    minutes: 15,
  },
];

type Player = { id: string; name: string };

const demoPlayers: Player[] = [
  { id: 'demo-arda', name: 'Arda Demir' },
  { id: 'demo-bora', name: 'Bora Aydın' },
  { id: 'demo-can', name: 'Can Efe' },
  { id: 'demo-deniz', name: 'Deniz Kaya' },
  { id: 'demo-emir', name: 'Emir Aksoy' },
  { id: 'demo-kerem', name: 'Kerem Yalçın' },
];

export function meta() {
  return [{ title: 'Koç Operasyon Masası | NGCS' }];
}

export default function WeekRoute() {
  const session = getSession();
  if (!session) return <Navigate to="/login" replace />;
  return <WeekWorkspace live sessionUser={session.user} />;
}

export function WeekWorkspace({
  live = false,
  sessionUser,
}: {
  live?: boolean;
  sessionUser?: SessionUser;
} = {}) {
  const [mode, setMode] = useState<Mode>('overview');
  const [selectedDay, setSelectedDay] = useState('2026-09-02');
  const [phases, setPhases] = useState(initialPhases);
  const [drills, setDrills] = useState<Drill[]>([]);
  const [players, setPlayers] = useState<Player[]>(demoPlayers);
  const [attendance, setAttendance] = useState<Record<string, boolean>>(
    Object.fromEntries(demoPlayers.map((player) => [player.id, true])),
  );
  const [toast, setToast] = useState('');
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(live);
  const [saving, setSaving] = useState(false);
  const [groupId, setGroupId] = useState<string>();
  const [planId, setPlanId] = useState<string>();
  const [teamName, setTeamName] = useState('U17 A Takımı');
  const [seasonName, setSeasonName] = useState('2026–27 Sezonu');
  const [objective, setObjective] = useState(
    'Topa sahipken oyun kurma ve son pas kalitesini artırmak.',
  );
  const [analysis, setAnalysis] = useState(
    'Rakip ilk bölgede 4-4-2 ile daralıyor; ters kanada hızlı çıkış öncelikli.',
  );
  const [matchId, setMatchId] = useState<string>();
  const [matchOpponent, setMatchOpponent] = useState('Gençlerbirliği U17');
  const [matchMeta, setMatchMeta] = useState(
    'Pazar, 6 Eylül · 15:00 · Deplasman',
  );
  const [ourFormation, setOurFormation] = useState('4-3-3');
  const [opponentFormation, setOpponentFormation] = useState('4-4-2');
  const [matchFocus, setMatchFocus] = useState('İlk bölge baskısı');
  const [coachNote, setCoachNote] = useState(
    'Top kaybı sonrası ilk beş saniye baskı; bekler kontrollü çıkacak.',
  );

  const totalMinutes = useMemo(
    () => phases.reduce((sum, phase) => sum + phase.minutes, 0),
    [phases],
  );

  useEffect(() => {
    if (!live) return;

    let cancelled = false;
    async function loadWorkspace() {
      setLoading(true);
      setApiError('');
      try {
        const [groups, seasons] = await Promise.all([
          listGroups(),
          listSeasons(),
        ]);
        const group = groups[0];
        if (!group) throw new Error('Bu koça atanmış takım bulunamadı.');

        const season =
          seasons.find((candidate) => candidate.groupId === group.id) ??
          seasons[0];
        const [members, plans, matches, drillCatalog] = await Promise.all([
          listGroupMembers(group.id),
          listTrainingPlans(group.id),
          season ? listMatches(season.id) : Promise.resolve([]),
          listDrills(group.ageGroup),
        ]);
        if (cancelled) return;

        const activePlayers = members
          .map((member) => member.user)
          .filter((user) => user.role === 'PLAYER')
          .map((user) => ({ id: user.id, name: user.name }));
        const plan =
          plans.find((candidate) => candidate.date?.startsWith('2026-09-02')) ??
          plans[0];
        const match =
          matches.find((candidate) =>
            candidate.date.startsWith('2026-09-06'),
          ) ?? matches[0];

        setGroupId(group.id);
        setTeamName(group.name);
        setDrills(drillCatalog);
        setPhases(hydratePhases(drillCatalog, plan?.drills ?? []));
        if (season) setSeasonName(season.name);
        setPlayers(activePlayers);
        setAttendance(
          Object.fromEntries(
            activePlayers.map((player) => {
              const record = (plan?.attendance ?? []).find(
                (item) => item.playerId === player.id,
              );
              return [player.id, record ? record.status === 'PRESENT' : true];
            }),
          ),
        );
        if (plan) {
          setPlanId(plan.id);
          if (plan.notes) setObjective(plan.notes);
        }
        if (match) {
          const opponentAnalysis = normalizeMatchAnalysis(
            match.opponentAnalysis,
          );
          setMatchId(match.id);
          setMatchOpponent(match.opponent);
          setMatchMeta(formatMatchMeta(match.date, match.location));
          setAnalysis(opponentAnalysis.summary);
          setOpponentFormation(opponentAnalysis.opponentFormation);
          setMatchFocus(opponentAnalysis.focus);
          setOurFormation(match.ourFormation ?? 'TBD');
          setCoachNote(match.notes ?? '');
        }
      } catch (cause) {
        if (!cancelled) {
          setApiError(
            cause instanceof Error
              ? cause.message
              : 'Çalışma alanı yüklenemedi.',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadWorkspace();
    return () => {
      cancelled = true;
    };
  }, [live]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  }

  function selectDay(day: WeekDay) {
    setSelectedDay(day.key);
    if (day.event?.kind === 'match') setMode('match');
    else setMode('overview');
  }

  async function savePlan() {
    if (!live) {
      setMode('overview');
      showToast('Antrenman planı kaydedildi');
      return;
    }
    if (!groupId) {
      setApiError('Plan için atanmış takım bulunamadı.');
      return;
    }

    setSaving(true);
    setApiError('');
    try {
      const input = {
        title: `${teamName} · 2 Eylül Antrenmanı`,
        groupId,
        date: '2026-09-02T18:00:00.000Z',
        notes: objective,
      };
      const plan = planId
        ? await updateTrainingPlan(planId, input)
        : await createTrainingPlan(input);
      const planWithDrills = await replaceTrainingPlanDrills(
        plan.id,
        phases.flatMap((phase) =>
          phase.drillId
            ? [
                {
                  drillId: phase.drillId,
                  phase: phase.phase,
                  order: 0,
                  notes: phase.notes || undefined,
                },
              ]
            : [],
        ),
      );
      setPlanId(planWithDrills.id);
      setPhases(hydratePhases(drills, planWithDrills.drills ?? []));
      setMode('overview');
      showToast('Antrenman planı kaydedildi');
    } catch (cause) {
      setApiError(
        cause instanceof Error ? cause.message : 'Antrenman kaydedilemedi.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveAttendance() {
    if (!live) {
      showToast('Katılım listesi kaydedildi');
      return;
    }
    if (!planId) {
      setApiError('Katılımı kaydetmeden önce antrenman planını kaydedin.');
      return;
    }

    setSaving(true);
    setApiError('');
    try {
      await Promise.all(
        players.map((player) =>
          markAttendance({
            planId,
            playerId: player.id,
            status: attendance[player.id] ? 'PRESENT' : 'ABSENT',
          }),
        ),
      );
      const records = await listAttendance(planId);
      setAttendance(
        Object.fromEntries(
          players.map((player) => {
            const record = records.find((item) => item.playerId === player.id);
            return [player.id, record?.status === 'PRESENT'];
          }),
        ),
      );
      showToast('Katılım listesi kaydedildi');
    } catch (cause) {
      setApiError(
        cause instanceof Error ? cause.message : 'Katılım kaydedilemedi.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveMatchAnalysis() {
    if (!live) {
      showToast('Maç analizi kaydedildi');
      return;
    }
    if (!matchId) {
      setApiError('Sezon için kaydedilebilir maç bulunamadı.');
      return;
    }

    setSaving(true);
    setApiError('');
    try {
      const match = await updateMatch(matchId, {
        opponentAnalysis: {
          summary: analysis,
          opponentFormation,
          focus: matchFocus,
        },
        ourFormation,
        notes: coachNote,
      });
      const savedAnalysis = normalizeMatchAnalysis(match.opponentAnalysis);
      setAnalysis(savedAnalysis.summary);
      setOpponentFormation(savedAnalysis.opponentFormation);
      setMatchFocus(savedAnalysis.focus);
      setOurFormation(match.ourFormation ?? 'TBD');
      setCoachNote(match.notes ?? '');
      showToast('Maç analizi kaydedildi');
    } catch (cause) {
      setApiError(
        cause instanceof Error ? cause.message : 'Maç analizi kaydedilemedi.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="workspace-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <h1>Koç Operasyon Masası</h1>
          <p>Next Generation Coaching System</p>
        </div>
        <nav className="primary-nav" aria-label="Ana navigasyon">
          <button
            className={mode === 'overview' ? 'active' : ''}
            onClick={() => setMode('overview')}
          >
            <CalendarBlank weight="duotone" />
            Hafta
          </button>
          <button
            className={mode === 'plan' ? 'active' : ''}
            onClick={() => setMode('plan')}
          >
            <ClipboardText weight="duotone" />
            Antrenmanlar
          </button>
          <button
            className={mode === 'attendance' ? 'active' : ''}
            onClick={() => setMode('attendance')}
          >
            <UsersThree weight="duotone" />
            Kadro
          </button>
          <button
            className={mode === 'match' ? 'active' : ''}
            onClick={() => {
              setSelectedDay('2026-09-06');
              setMode('match');
            }}
          >
            <SoccerBall weight="duotone" />
            Maçlar
          </button>
        </nav>
        <div className="sidebar-footer">
          <div className="team-chip">
            <ShieldChevron weight="duotone" />
            <span>
              <strong>{teamName}</strong>
              <small>{seasonName}</small>
            </span>
          </div>
          <div className="profile-chip">
            <UserCircle weight="duotone" />
            <span>
              <strong>{sessionUser?.name ?? 'Mehmet Yılmaz'}</strong>
              <small>Baş Antrenör</small>
            </span>
            <CaretDown />
          </div>
          <Link className="sidebar-login" to="/login">
            Hesap değiştir
          </Link>
        </div>
      </aside>

      <section
        className="week-rail"
        aria-label="31 Ağustos – 6 Eylül 2026 haftası"
      >
        <header>
          <h2>31 Ağustos – 6 Eylül 2026</h2>
        </header>
        <div className="day-list">
          {week.map((day) => (
            <button
              key={day.key}
              className={`day-row ${day.isToday ? 'today' : ''} ${selectedDay === day.key ? 'selected' : ''}`}
              onClick={() => selectDay(day)}
              aria-pressed={selectedDay === day.key}
              aria-label={`${day.short} ${day.day} ${day.month}${day.isToday ? ', bugün' : ''}${day.event ? `, ${day.event.time} ${day.event.label}, ${day.event.detail}` : ', etkinlik yok'}`}
            >
              <span className="day-date">
                {day.isToday ? <small>BUGÜN</small> : null}
                <span>{day.short}</span>
                <strong>{day.day}</strong>
                <em>{day.month}</em>
              </span>
              <span className={`day-event ${day.event?.kind ?? ''}`}>
                {day.event ? (
                  <>
                    <strong>{day.event.time}</strong>
                    <span>{day.event.label}</span>
                    <small>{day.event.detail}</small>
                  </>
                ) : (
                  <i>–</i>
                )}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="work-pane">
        {loading ? (
          <div className="workspace-notice" role="status">
            Takım verisi yükleniyor…
          </div>
        ) : null}
        {apiError ? (
          <div className="workspace-notice error" role="alert">
            {apiError}
          </div>
        ) : null}
        {mode === 'overview' ? (
          <Overview
            teamName={teamName}
            seasonName={seasonName}
            objective={objective}
            phases={phases}
            totalMinutes={totalMinutes}
            onComplete={() => showToast('Antrenman planı tamamlandı')}
            onAttendance={() => setMode('attendance')}
          />
        ) : null}
        {mode === 'plan' ? (
          <PlanEditor
            objective={objective}
            phases={phases}
            drills={drills}
            onObjectiveChange={setObjective}
            onDrillChange={(id, drillId) =>
              setPhases((current) =>
                current.map((phase) =>
                  phase.id === id
                    ? selectPhaseDrill(phase, drills, drillId)
                    : phase,
                ),
              )
            }
            onPhaseNoteChange={(id, notes) =>
              setPhases((current) =>
                current.map((phase) =>
                  phase.id === id ? { ...phase, notes } : phase,
                ),
              )
            }
            onSave={() => void savePlan()}
            saving={saving}
          />
        ) : null}
        {mode === 'attendance' ? (
          <Attendance
            teamName={teamName}
            players={players}
            attendance={attendance}
            onToggle={(playerId) =>
              setAttendance((current) => ({
                ...current,
                [playerId]: !current[playerId],
              }))
            }
            onSave={() => void saveAttendance()}
            onClose={() => setMode('overview')}
            saving={saving}
          />
        ) : null}
        {mode === 'match' ? (
          <MatchPanel
            opponent={matchOpponent}
            meta={matchMeta}
            analysis={analysis}
            ourFormation={ourFormation}
            opponentFormation={opponentFormation}
            focus={matchFocus}
            coachNote={coachNote}
            onAnalysisChange={setAnalysis}
            onCoachNoteChange={setCoachNote}
            onSave={() => void saveMatchAnalysis()}
            saving={saving}
          />
        ) : null}
      </section>
      {toast ? (
        <div className="toast" role="status">
          <CheckCircle weight="fill" />
          {toast}
        </div>
      ) : null}
    </main>
  );
}

function Overview({
  teamName,
  seasonName,
  objective,
  phases,
  totalMinutes,
  onComplete,
  onAttendance,
}: {
  teamName: string;
  seasonName: string;
  objective: string;
  phases: TrainingPhase[];
  totalMinutes: number;
  onComplete: () => void;
  onAttendance: () => void;
}) {
  return (
    <div className="pane-content overview-pane">
      <header className="work-header">
        <p className="section-kicker">Antrenman</p>
        <h2>{teamName}</h2>
        <p>{seasonName}</p>
      </header>
      <div className="training-summary">
        <div>
          <Target weight="duotone" />
          <span>
            <small>Antrenman Amacı</small>
            <strong>{objective}</strong>
          </span>
        </div>
        <div>
          <Clock weight="duotone" />
          <span>
            <small>Toplam Süre</small>
            <strong className="duration">
              {totalMinutes} <em>dk</em>
            </strong>
          </span>
        </div>
      </div>
      <section className="flow-section">
        <h3>Antrenman Akışı</h3>
        <ol className="phase-list">
          {phases.map((phase) => (
            <li key={phase.id}>
              <span className="phase-number">{phase.id}</span>
              <span className="phase-copy">
                <strong>{phase.name}</strong>
                <small>
                  {phase.drillTitle}
                  {phase.notes ? ` · ${phase.notes}` : ''}
                </small>
              </span>
              <strong className="phase-duration">
                {phase.minutes} <em>dk</em>
              </strong>
            </li>
          ))}
        </ol>
      </section>
      <div className="work-actions">
        <button
          className="button button-primary button-large"
          onClick={onComplete}
        >
          <ClipboardText weight="duotone" />
          Planı tamamla
        </button>
        <button
          className="button button-secondary button-large"
          onClick={onAttendance}
        >
          <UsersThree weight="duotone" />
          Katılımı aç
        </button>
      </div>
    </div>
  );
}

function PlanEditor({
  objective,
  phases,
  drills,
  onObjectiveChange,
  onDrillChange,
  onPhaseNoteChange,
  onSave,
  saving,
}: {
  objective: string;
  phases: TrainingPhase[];
  drills: Drill[];
  onObjectiveChange: (value: string) => void;
  onDrillChange: (id: number, drillId: string) => void;
  onPhaseNoteChange: (id: number, notes: string) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="pane-content editor-pane">
      <header className="subpage-header">
        <div>
          <p className="section-kicker">Antrenman planı</p>
          <h2>Çarşamba, 2 Eylül</h2>
          <p>18:00 · Saha 1</p>
        </div>
      </header>
      <label className="field-label">
        Antrenman amacı
        <textarea
          value={objective}
          onChange={(event) => onObjectiveChange(event.target.value)}
        />
      </label>
      <div className="editable-phases">
        {phases.map((phase) => (
          <div className="phase-editor-row" key={phase.id}>
            <span className="phase-fields">
              <strong>
                {phase.id}. {phase.name}
              </strong>
              <select
                aria-label={`${phase.name} egzersizi`}
                value={phase.drillId ?? ''}
                onChange={(event) =>
                  onDrillChange(phase.id, event.target.value)
                }
              >
                <option value="">Egzersiz seçin</option>
                {drills
                  .filter((drill) => drill.category === phase.phase)
                  .map((drill) => (
                    <option key={drill.id} value={drill.id}>
                      {drill.title}
                    </option>
                  ))}
              </select>
              <input
                aria-label={`${phase.name} notu`}
                value={phase.notes}
                placeholder="Faz notu"
                onChange={(event) =>
                  onPhaseNoteChange(phase.id, event.target.value)
                }
              />
            </span>
            <span className="minutes-input">
              <strong>{phase.minutes}</strong>
              <em>dk</em>
            </span>
          </div>
        ))}
      </div>
      <button
        className="button button-primary button-large align-end"
        onClick={onSave}
        disabled={saving}
      >
        <FloppyDisk weight="duotone" />
        {saving ? 'Plan kaydediliyor…' : 'Planı kaydet'}
      </button>
    </div>
  );
}

function Attendance({
  teamName,
  players,
  attendance,
  onToggle,
  onSave,
  onClose,
  saving,
}: {
  teamName: string;
  players: Player[];
  attendance: Record<string, boolean>;
  onToggle: (playerId: string) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
}) {
  const presentCount = Object.values(attendance).filter(Boolean).length;
  return (
    <div className="pane-content attendance-pane">
      <header className="subpage-header">
        <div>
          <p className="section-kicker">Katılım</p>
          <h2>{teamName}</h2>
          <p>
            Çarşamba, 2 Eylül · {presentCount}/{players.length} oyuncu mevcut
          </p>
        </div>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Katılımı kapat"
        >
          <X />
        </button>
      </header>
      <div className="player-list">
        {players.map((player, index) => (
          <button
            key={player.id}
            onClick={() => onToggle(player.id)}
            aria-pressed={attendance[player.id]}
          >
            <span className="player-avatar">{index + 1}</span>
            <strong>{player.name}</strong>
            <span
              className={
                attendance[player.id] ? 'presence present' : 'presence absent'
              }
            >
              {attendance[player.id] ? 'Mevcut' : 'Yok'}
            </span>
          </button>
        ))}
      </div>
      <button
        className="button button-primary button-large align-end"
        onClick={onSave}
        disabled={saving}
      >
        <FloppyDisk weight="duotone" />
        {saving ? 'Katılım kaydediliyor…' : 'Katılımı kaydet'}
      </button>
    </div>
  );
}

function MatchPanel({
  opponent,
  meta,
  analysis,
  ourFormation,
  opponentFormation,
  focus,
  coachNote,
  onAnalysisChange,
  onCoachNoteChange,
  onSave,
  saving,
}: {
  opponent: string;
  meta: string;
  analysis: string;
  ourFormation: string;
  opponentFormation: string;
  focus: string;
  coachNote: string;
  onAnalysisChange: (value: string) => void;
  onCoachNoteChange: (value: string) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="pane-content match-pane">
      <header className="work-header match-header">
        <p className="section-kicker">Maç hazırlığı</p>
        <h2>{opponent}</h2>
        <p>{meta}</p>
      </header>
      <div className="match-facts">
        <span>
          <small>Dizilişimiz</small>
          <strong>{ourFormation}</strong>
        </span>
        <span>
          <small>Rakip dizilişi</small>
          <strong>{opponentFormation}</strong>
        </span>
        <span>
          <small>Odak</small>
          <strong>{focus}</strong>
        </span>
      </div>
      <label className="field-label">
        Rakip ve taktik analizi
        <textarea
          rows={7}
          value={analysis}
          onChange={(event) => onAnalysisChange(event.target.value)}
        />
      </label>
      <label className="field-label">
        Koç notu
        <textarea
          rows={4}
          value={coachNote}
          onChange={(event) => onCoachNoteChange(event.target.value)}
        />
      </label>
      <button
        className="button button-match button-large align-end"
        onClick={onSave}
        disabled={saving}
      >
        <FloppyDisk weight="duotone" />
        {saving ? 'Analiz kaydediliyor…' : 'Analizi kaydet'}
      </button>
    </div>
  );
}

function normalizeMatchAnalysis(value: unknown): MatchAnalysis {
  if (typeof value === 'string') {
    return { summary: value, opponentFormation: 'TBD', focus: 'TBD' };
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { summary: '', opponentFormation: 'TBD', focus: 'TBD' };
  }

  const candidate = value as Partial<Record<keyof MatchAnalysis, unknown>>;

  return {
    summary: typeof candidate.summary === 'string' ? candidate.summary : '',
    opponentFormation:
      typeof candidate.opponentFormation === 'string'
        ? candidate.opponentFormation
        : 'TBD',
    focus: typeof candidate.focus === 'string' ? candidate.focus : 'TBD',
  };
}

function formatMatchMeta(dateValue: string, location: string) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return `TBD · ${location}`;

  const weekday = new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long',
    timeZone: 'UTC',
  }).format(date);
  const calendarDate = new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(date);
  const time = new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(date);

  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${calendarDate} · ${time} · ${location}`;
}

function hydratePhases(
  drills: Drill[],
  planDrills: Array<{
    drillId: string;
    phase: DrillPhase;
    notes: string | null;
    drill: Drill;
  }>,
): TrainingPhase[] {
  return initialPhases.map((phase) => {
    const saved = planDrills.find((entry) => entry.phase === phase.phase);
    const drill =
      saved?.drill ?? drills.find((entry) => entry.category === phase.phase);
    return {
      ...phase,
      drillId: drill?.id,
      drillTitle: drill?.title ?? 'Egzersiz seçilmedi',
      notes: saved?.notes ?? '',
      minutes: drill?.durationMin ?? 0,
    };
  });
}

function selectPhaseDrill(
  phase: TrainingPhase,
  drills: Drill[],
  drillId: string,
): TrainingPhase {
  const drill = drills.find((entry) => entry.id === drillId);
  return {
    ...phase,
    drillId: drill?.id,
    drillTitle: drill?.title ?? 'Egzersiz seçilmedi',
    minutes: drill?.durationMin ?? 0,
  };
}
