import { ArrowLeft, FloppyDisk, SoccerBall } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { toast } from 'sonner';
import { TacticalBoardEditor } from '../components/tactics/tactical-board-editor';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
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
  updateMatchTacticalBoard,
  type Match,
  type MatchAnalysis,
} from '../lib/api';
import {
  emptyBoard,
  type TacticalBoardDocumentV1,
} from '../lib/tactical-board';
import { useWorkspace } from '../lib/workspace-context';

export function meta() {
  return [{ title: 'Maç Detayı | NGCS' }];
}
export default function MatchDetailRoute() {
  const { matchId } = useParams();
  const { matches, loading } = useWorkspace();
  const [match, setMatch] = useState<Match>();
  const [analysis, setAnalysis] = useState('');
  const [opponentFormation, setOpponentFormation] = useState('TBD');
  const [focus, setFocus] = useState('TBD');
  const [ourFormation, setOurFormation] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const value = matches.find((item) => item.id === matchId);
    if (!value) return;
    // The editable draft intentionally follows the selected server record.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMatch(value);
    setOurFormation(value.ourFormation ?? '');
    setNotes(value.notes ?? '');
    const normalized = normalizeAnalysis(value.opponentAnalysis);
    setAnalysis(normalized.summary);
    setOpponentFormation(normalized.opponentFormation);
    setFocus(normalized.focus);
  }, [matchId, matches]);

  async function saveAnalysis() {
    if (!matchId) return;
    const value = await updateMatch(matchId, {
      opponentAnalysis: { summary: analysis, opponentFormation, focus },
      ourFormation,
      notes,
    });
    setMatch(value);
    toast.success('Maç analizi kaydedildi');
  }
  async function saveBoard(document: TacticalBoardDocumentV1) {
    if (!matchId) throw new Error('Maç kimliği bulunamadı.');
    const value = await updateMatchTacticalBoard(matchId, document);
    setMatch(value);
  }

  if (loading && !match)
    return (
      <div className="page-shell">
        <p>Maç yükleniyor…</p>
      </div>
    );
  if (!match)
    return (
      <div className="page-shell">
        <Alert className="route-error">
          <AlertTitle>Maç bulunamadı</AlertTitle>
          <AlertDescription>
            Bu maç takımınızın görünür kapsamı dışında olabilir.
          </AlertDescription>
        </Alert>
      </div>
    );
  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="page-kicker">Maç hazırlığı</p>
          <h1>{match.opponent}</h1>
          <p>
            {new Intl.DateTimeFormat('tr-TR', {
              dateStyle: 'full',
              timeStyle: 'short',
            }).format(new Date(match.date))}{' '}
            · {match.location}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/app/matches">
            <ArrowLeft />
            Maçlar
          </Link>
        </Button>
      </header>
      <Tabs defaultValue="analysis">
        <TabsList>
          <TabsTrigger value="analysis">Analiz</TabsTrigger>
          <TabsTrigger value="board">Taktik tahtası</TabsTrigger>
        </TabsList>
        <TabsContent value="analysis">
          <Card className="match-analysis-card">
            <CardHeader>
              <CardTitle>
                <SoccerBall /> Rakip ve oyun planı
              </CardTitle>
            </CardHeader>
            <CardContent className="analysis-form">
              <label>
                Rakip analizi
                <Textarea
                  value={analysis}
                  onChange={(event) => setAnalysis(event.target.value)}
                />
              </label>
              <div className="analysis-two">
                <label>
                  Dizilişimiz
                  <Input
                    value={ourFormation}
                    onChange={(event) => setOurFormation(event.target.value)}
                  />
                </label>
                <label>
                  Rakip dizilişi
                  <Input
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
                  value={focus}
                  onChange={(event) => setFocus(event.target.value)}
                />
              </label>
              <label>
                Koç notu
                <Textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </label>
              <Button
                className="justify-self-end"
                onClick={() => void saveAnalysis()}
              >
                <FloppyDisk />
                Analizi kaydet
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="board">
          <TacticalBoardEditor
            initialDocument={match.tacticalBoard ?? emptyBoard()}
            onSave={saveBoard}
          />
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
