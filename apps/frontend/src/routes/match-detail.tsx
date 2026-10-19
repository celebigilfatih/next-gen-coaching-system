import {
  ArrowLeft,
  CalendarBlank,
  Clock,
  FloppyDisk,
  MapPin,
  SoccerBall,
  Strategy,
} from '@phosphor-icons/react';
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { Link, useParams } from 'react-router';
import { toast } from 'sonner';
import type { BoardEditorHandle } from '../components/tactics/tactical-board-editor';
import { ResourceBoard } from '../components/tactics/resource-board';
import { MatchScheduleDialog } from '../components/match-schedule-dialog';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import {
  updateMatch,
  getMatchMetadata,
  type MatchMetadata,
  type TacticalResource,
  type MatchAnalysis,
} from '../lib/api';
import { useWorkspace } from '../lib/workspace-context';
import { useAssignmentPage } from '../lib/use-assignment-page';
import {
  getSession,
  getSessionGeneration,
  subscribeSession,
} from '../lib/session';

export function meta() {
  return [{ title: 'Maç Detayı | NGCS' }];
}
export default function MatchDetailRoute() {
  const { matchId } = useParams();
  const { group, season, scope, loading, error, reload } = useWorkspace();
  const session = useSyncExternalStore(
    subscribeSession,
    getSession,
    () => null,
  );
  const identity = [
    session?.user.id,
    session?.user.role,
    session?.user.clubId,
    getSessionGeneration(),
  ];
  if (!session) return <p>Oturum gerekli.</p>;
  if (loading)
    return (
      <div className="page-shell" role="status">
        Maç kapsamı yükleniyor…
      </div>
    );
  if (error)
    return (
      <div className="page-shell">
        <Alert role="alert">
          <AlertTitle>Çalışma alanı alınamadı</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button onClick={() => void reload()}>Tekrar dene</Button>
        </Alert>
      </div>
    );
  if (!matchId || !group || (!season && scope.clubSeasonId !== '*'))
    return (
      <div className="page-shell">
        <p>Bu takım ve sezon için maç bağlamı bulunmuyor.</p>
      </div>
    );
  return (
    <MatchRead
      key={JSON.stringify([matchId, scope, group.id, season?.id, identity])}
      matchId={matchId}
      groupId={group.id}
      seasonId={scope.clubSeasonId === '*' ? undefined : season?.id}
    />
  );
}
function MatchRead({
  matchId,
  groupId,
  seasonId,
}: {
  matchId: string;
  groupId: string;
  seasonId?: string;
}) {
  const load = useCallback(
    () => getMatchMetadata(matchId, groupId, seasonId),
    [matchId, groupId, seasonId],
  );
  const state = useAssignmentPage(load);
  if (state.loading)
    return (
      <div className="page-shell" role="status">
        Maç yükleniyor…
      </div>
    );
  if (state.error || !state.data)
    return (
      <div className="page-shell">
        <Alert role="alert">
          <AlertTitle>Maç alınamadı</AlertTitle>
          <AlertDescription>
            {state.error || 'Maç bulunamadı.'}
          </AlertDescription>
          <Button onClick={state.retry}>Maçı tekrar yükle</Button>
        </Alert>
      </div>
    );
  return <MatchEditor initialMatch={state.data} />;
}
function MatchEditor({ initialMatch }: { initialMatch: MatchMetadata }) {
  const { team, club } = useWorkspace();
  const principal = getSession()?.user;
  const [match, setMatch] = useState(initialMatch);
  const matchId = initialMatch.id;
  const normalized = normalizeAnalysis(initialMatch.opponentAnalysis);
  const [analysis, setAnalysis] = useState(normalized.summary);
  const [opponentFormation, setOpponentFormation] = useState(
    normalized.opponentFormation,
  );
  const [focus, setFocus] = useState(normalized.focus);
  const [ourFormation, setOurFormation] = useState(
    initialMatch.ourFormation ?? '',
  );
  const [notes, setNotes] = useState(initialMatch.notes ?? '');
  const [tab, setTab] = useState('analysis');
  const boardEditor = useRef<BoardEditorHandle>(null);
  const [analysisError, setAnalysisError] = useState('');
  const [savingAnalysis, setSavingAnalysis] = useState(false);
  const analysisBusy = useRef(false);
  const resource = useMemo<TacticalResource>(
    () => ({ kind: 'match', id: matchId }),
    [matchId],
  );
  const canManage = Boolean(principal && principal.role !== 'PLAYER');
  const boardSaved = useCallback(
    () => setMatch((current) => ({ ...current, hasBoard: true })),
    [],
  );

  function selectTab(next: string) {
    const change = () => {
      setTab(next);
    };
    if (tab === 'board' && boardEditor.current)
      boardEditor.current.transition(change);
    else change();
  }

  async function saveAnalysis() {
    if (!matchId || !canManage || analysisBusy.current) return;
    analysisBusy.current = true;
    setSavingAnalysis(true);
    setAnalysisError('');
    try {
      const value = await updateMatch(matchId, {
        opponentAnalysis: { summary: analysis, opponentFormation, focus },
        ourFormation,
        notes,
      });
      // Legacy mutation returns a full match. Do not consume its board or
      // remount the independent, token-bound editor from that response.
      setMatch((current) => ({
        ...current,
        opponentAnalysis: value.opponentAnalysis,
        ourFormation: value.ourFormation,
        notes: value.notes,
      }));
      toast.success('Maç analizi kaydedildi');
    } catch (cause) {
      setAnalysisError(
        cause instanceof Error ? cause.message : 'Analiz kaydedilemedi.',
      );
    } finally {
      analysisBusy.current = false;
      setSavingAnalysis(false);
    }
  }

  const date = new Date(match.date);
  const fullDate = new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'long',
  }).format(date);
  const weekday = new Intl.DateTimeFormat('tr-TR', { weekday: 'long' }).format(
    date,
  );
  const location =
    match.location === 'HOME'
      ? 'İç saha'
      : match.location === 'AWAY'
        ? 'Deplasman'
        : match.location || 'Saha belirtilmedi';
  const time = new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

  return (
    <div className="page-shell match-detail-reference">
      <header className="match-detail-reference__heading">
        <Link to="/app/matches" className="match-detail-reference__back">
          <ArrowLeft aria-hidden="true" /> Maçlara dön
        </Link>
        <p className="match-detail-reference__competition">
          {match.competition || 'Müsabaka belirtilmedi'}
        </p>
        <h1>{match.opponent}</h1>
        <p className="match-detail-reference__description">
          Maç hazırlığı, rakip analizi ve taktik planı.
        </p>
      </header>

      {canManage && (
        <MatchScheduleDialog
          matchId={matchId}
          date={match.date}
          onSaved={(date) => setMatch((current) => ({ ...current, date }))}
        />
      )}
      <section
        className="match-detail-reference__summary"
        aria-label="Maç hazırlığı özeti"
      >
        <dl>
          <div>
            <dt>
              <CalendarBlank aria-hidden="true" /> Maç tarihi
            </dt>
            <dd>
              <time dateTime={match.date}>{fullDate}</time>
              <small>{weekday}</small>
            </dd>
          </div>
          <div>
            <dt>
              <Clock aria-hidden="true" /> Başlama
            </dt>
            <dd>
              {time}
              <small>Yerel saat</small>
            </dd>
          </div>
          <div>
            <dt>
              <MapPin aria-hidden="true" /> Saha
            </dt>
            <dd>{location}</dd>
          </div>
          <div>
            <dt>
              <Strategy aria-hidden="true" /> Dizilişimiz
            </dt>
            <dd>{match.ourFormation || 'Belirtilmedi'}</dd>
          </div>
          <div>
            <dt>
              <SoccerBall aria-hidden="true" /> Taktik tahta
            </dt>
            <dd>
              <Badge variant={match.hasBoard ? 'default' : 'outline'}>
                {match.hasBoard ? 'Tahta hazır' : 'Tahta yok'}
              </Badge>
            </dd>
          </div>
        </dl>
      </section>

      <Tabs
        value={tab}
        onValueChange={selectTab}
        className="match-detail-reference__tabs"
      >
        <header className="match-detail-reference__tabs-head">
          <div>
            <h2>Hazırlık ve taktik planı</h2>
          </div>
          <TabsList aria-label="Maç detay bölümleri">
            <TabsTrigger value="analysis">Analiz</TabsTrigger>
            <TabsTrigger value="board">Taktik tahtası</TabsTrigger>
          </TabsList>
        </header>
        <TabsContent value="analysis">
          <section
            className="match-detail-reference__analysis-card"
            aria-labelledby="match-analysis-title"
          >
            <header className="match-detail-reference__analysis-head">
              <div>
                <h3 id="match-analysis-title">Rakip ve oyun planı</h3>
                <p>
                  {canManage
                    ? 'Analiz ve notlarınızı düzenleyin, ardından kaydedin.'
                    : 'Bu maçın analiz ve taktik planını görüntülüyorsunuz.'}
                </p>
              </div>
              <Badge variant="outline">
                {canManage ? 'Manuel kayıt' : 'Salt okunur'}
              </Badge>
            </header>
            <div className="analysis-form">
              <label className="match-detail-reference__analysis-field">
                Rakip analizi
                <Textarea
                  disabled={!canManage || savingAnalysis}
                  value={analysis}
                  onChange={(event) => setAnalysis(event.target.value)}
                  placeholder="Rakibin güçlü yönleri, oyun yapısı ve dikkat edilecek noktalar…"
                />
              </label>
              <div className="match-detail-reference__plan-fields">
                <div className="analysis-two">
                  <label>
                    Dizilişimiz
                    <Input
                      disabled={!canManage || savingAnalysis}
                      value={ourFormation}
                      onChange={(event) => setOurFormation(event.target.value)}
                    />
                  </label>
                  <label>
                    Rakip dizilişi
                    <Input
                      disabled={!canManage || savingAnalysis}
                      value={opponentFormation}
                      onChange={(event) =>
                        setOpponentFormation(event.target.value)
                      }
                    />
                  </label>
                </div>
                <label>
                  Odak
                  <Input
                    disabled={!canManage || savingAnalysis}
                    value={focus}
                    onChange={(event) => setFocus(event.target.value)}
                  />
                </label>
              </div>
              <label className="match-detail-reference__notes-field">
                Koç notu
                <Textarea
                  disabled={!canManage || savingAnalysis}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Maç hazırlığına ilişkin notlarınızı ekleyin…"
                />
              </label>
              {analysisError && (
                <Alert
                  role="alert"
                  className="match-detail-reference__save-error"
                >
                  <AlertDescription>{analysisError}</AlertDescription>
                </Alert>
              )}
              <footer className="match-detail-reference__save-bar">
                <p>
                  {canManage
                    ? 'Analiz ve taktik tahtası ayrı kaydedilir.'
                    : 'Bu kayıtta düzenleme yetkiniz bulunmuyor.'}
                </p>
                {canManage && (
                  <Button
                    disabled={savingAnalysis}
                    onClick={() => void saveAnalysis()}
                  >
                    <FloppyDisk aria-hidden="true" />
                    {savingAnalysis ? 'Kaydediliyor…' : 'Analizi kaydet'}
                  </Button>
                )}
              </footer>
            </div>
          </section>
        </TabsContent>
        <TabsContent value="board">
          <section className="match-detail-reference__board">
            <header>
              <div>
                <p className="page-kicker">Saha planı</p>
                <h3>Maç taktik tahtası</h3>
              </div>
              <Badge variant={match.hasBoard ? 'default' : 'outline'}>
                {match.hasBoard ? 'Tahta hazır' : 'Henüz kaydedilmedi'}
              </Badge>
            </header>
            <ResourceBoard
              resource={resource}
              controllerRef={boardEditor}
              onSaved={boardSaved}
              readOnly={!canManage}
              rosterSource={
                team && club
                  ? { teamId: team.id, clubId: club.id, name: team.name }
                  : undefined
              }
            />
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
function normalizeAnalysis(value: unknown): MatchAnalysis {
  if (typeof value === 'string')
    return { summary: value, opponentFormation: 'TBD', focus: 'TBD' };
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return { summary: '', opponentFormation: 'TBD', focus: 'TBD' };
  const candidate = value as Partial<MatchAnalysis>;
  return {
    summary: typeof candidate.summary === 'string' ? candidate.summary : '',
    opponentFormation:
      typeof candidate.opponentFormation === 'string'
        ? candidate.opponentFormation
        : 'TBD',
    focus: typeof candidate.focus === 'string' ? candidate.focus : 'TBD',
  };
}
