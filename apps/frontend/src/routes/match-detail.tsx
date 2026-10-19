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
import dashboardHero from '../assets/dashboard-coach-wide.png';
import { MetricCard } from '../components/presentation/metric-card';
import { PageHero } from '../components/presentation/page-hero';
import type { BoardEditorHandle } from '../components/tactics/tactical-board-editor';
import { ResourceBoard } from '../components/tactics/resource-board';
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
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(date);
  const compactDate = new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short',
  }).format(date);
  const time = new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

  return (
    <div className="page-shell match-detail-reference">
      <PageHero
        className="match-detail-reference__hero"
        image={dashboardHero}
        eyebrow={match.competition || 'Maç hazırlığı'}
        title={match.opponent}
        description={`${fullDate} · ${match.location}`}
        actions={
          <Button variant="outline" asChild>
            <Link to="/app/matches">
              <ArrowLeft />
              Maçlara dön
            </Link>
          </Button>
        }
      />

      <section
        className="match-detail-reference__metrics"
        aria-label="Maç hazırlığı özeti"
      >
        <MetricCard
          icon={CalendarBlank}
          label="Maç tarihi"
          value={compactDate}
          detail={match.competition || 'Müsabaka TBD'}
        />
        <MetricCard
          icon={Clock}
          label="Başlama"
          value={time}
          detail="Yerel saat"
          tone="teal"
        />
        <MetricCard
          icon={MapPin}
          label="Konum"
          value={match.location || 'TBD'}
          detail="Maç sahası"
          tone="amber"
        />
        <MetricCard
          icon={Strategy}
          label="Dizilişimiz"
          value={match.ourFormation || 'TBD'}
          detail="Kaydedilmiş plan"
          tone="violet"
        />
        <MetricCard
          icon={SoccerBall}
          label="Taktik tahta"
          value={match.hasBoard ? 'Hazır' : 'Bekliyor'}
          detail="Maçtan ayrı belge"
        />
      </section>

      <Tabs
        value={tab}
        onValueChange={selectTab}
        className="match-detail-reference__tabs"
      >
        <header className="match-detail-reference__tabs-head">
          <div>
            <p className="page-kicker">Maç çalışma alanı</p>
            <h2>Hazırlık ve taktik planı</h2>
          </div>
          <TabsList aria-label="Maç detay bölümleri">
            <TabsTrigger value="analysis">Analiz</TabsTrigger>
            <TabsTrigger value="board">Taktik tahtası</TabsTrigger>
          </TabsList>
        </header>
        <TabsContent value="analysis">
          <div className="match-detail-reference__analysis-layout">
            <Card className="match-analysis-card match-detail-reference__analysis-card">
              <CardHeader>
                <div>
                  <p className="page-kicker">Rakip planı</p>
                  <CardTitle>
                    <SoccerBall weight="duotone" /> Rakip ve oyun planı
                  </CardTitle>
                  <CardDescription>
                    Analiz, diziliş ve koç notlarını açık kaydetme eylemiyle
                    güncelleyin.
                  </CardDescription>
                </div>
                <Badge variant="outline">Manuel kayıt</Badge>
              </CardHeader>
              <CardContent className="analysis-form">
                <label>
                  Rakip analizi
                  <Textarea
                    disabled={!canManage || savingAnalysis}
                    value={analysis}
                    onChange={(event) => setAnalysis(event.target.value)}
                  />
                </label>
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
                <label>
                  Koç notu
                  <Textarea
                    disabled={!canManage || savingAnalysis}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                  />
                </label>
                {analysisError && (
                  <Alert role="alert">
                    <AlertDescription>{analysisError}</AlertDescription>
                  </Alert>
                )}
                {canManage && (
                  <Button
                    className="justify-self-end"
                    disabled={savingAnalysis}
                    onClick={() => void saveAnalysis()}
                  >
                    <FloppyDisk />
                    Analizi kaydet
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="match-detail-reference__facts">
              <CardHeader>
                <CardTitle>Maç Özeti</CardTitle>
                <CardDescription>
                  Yetkili maç kaydındaki doğrulanmış bilgiler.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span>
                  <CalendarBlank weight="duotone" />
                  <small>Tarih ve saat</small>
                  <strong>{fullDate}</strong>
                </span>
                <span>
                  <MapPin weight="duotone" />
                  <small>Konum</small>
                  <strong>{match.location || 'TBD'}</strong>
                </span>
                <span>
                  <SoccerBall weight="duotone" />
                  <small>Müsabaka</small>
                  <strong>{match.competition || 'TBD'}</strong>
                </span>
                <span>
                  <Strategy weight="duotone" />
                  <small>Rakip dizilişi</small>
                  <strong>{opponentFormation || 'TBD'}</strong>
                </span>
              </CardContent>
            </Card>
          </div>
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
