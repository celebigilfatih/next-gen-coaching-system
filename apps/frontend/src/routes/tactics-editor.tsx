import { ArrowLeft, Copy, FloppyDisk } from '@phosphor-icons/react';
import { useCallback, useRef, useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { TacticalBoardEditor } from '../components/tactics/tactical-board-editor';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  createTacticalDrill,
  getTacticalDrillMetadata,
  getTacticalDocument,
  saveTacticalDrill,
  type TacticalDrillMetadata,
  type TacticalDocumentEnvelope,
  type DrillPhase,
} from '../lib/api';
import {
  getSession,
  getSessionGeneration,
  subscribeSession,
} from '../lib/session';
import { emptyBoard } from '../lib/tactical-board';
import type { TacticalDocument } from '../lib/tactical-document-core';
import { useAssignmentPage } from '../lib/use-assignment-page';
import { useWorkspace } from '../lib/workspace-context';

export function TacticsEditorPage({ drillId }: { drillId?: string }) {
  const { scope, group, loading, error, reload } = useWorkspace();
  const session = useSyncExternalStore(
    subscribeSession,
    getSession,
    () => null,
  );
  if (!session) return <p>Oturum gerekli.</p>;
  if (loading) return <p role="status">Çalışma alanı yükleniyor…</p>;
  if (error)
    return (
      <Alert role="alert">
        <AlertDescription>{error}</AlertDescription>
        <Button onClick={() => void reload()}>Tekrar dene</Button>
      </Alert>
    );
  const key = JSON.stringify([
    drillId,
    scope,
    group?.id,
    session.user.id,
    session.user.role,
    session.user.clubId,
    getSessionGeneration(),
  ]);
  return drillId ? (
    <ReadDrill key={key} drillId={drillId} />
  ) : (
    <LoadedDrill key={key} />
  );
}

function ReadDrill({ drillId }: { drillId: string }) {
  const load = useCallback(async () => {
    const drill = await getTacticalDrillMetadata(drillId);
    const envelope = await getTacticalDocument({ kind: 'drill', id: drillId });
    if (!envelope.document)
      throw new Error('Egzersizin tahta belgesi bulunamadı.');
    return { drill, envelope };
  }, [drillId]);
  const state = useAssignmentPage(load);
  if (state.loading) return <p role="status">Tahta yükleniyor…</p>;
  if (state.error || !state.data)
    return (
      <Alert role="alert">
        <AlertTitle>Tahta açılamadı</AlertTitle>
        <AlertDescription>{state.error}</AlertDescription>
        <Button onClick={state.retry}>Tahtayı yeniden yükle</Button>
      </Alert>
    );
  return (
    <LoadedDrill initial={state.data.drill} envelope={state.data.envelope} />
  );
}

function LoadedDrill({
  initial,
  envelope,
}: {
  initial?: TacticalDrillMetadata;
  envelope?: TacticalDocumentEnvelope;
}) {
  const { club, group, team } = useWorkspace();
  const principal = getSession()?.user;
  const [drill, setDrill] = useState(initial);
  const token = useRef(envelope?.writeToken);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(initial?.title ?? 'Yeni taktik egzersizi');
  const [category, setCategory] = useState<DrillPhase>(
    initial?.category ?? 'TACTICAL',
  );
  const [duration, setDuration] = useState(initial?.durationMin ?? 20);
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>(
    initial?.difficulty ?? 'MEDIUM',
  );
  const [equipment, setEquipment] = useState(initial?.equipment ?? '');
  const scope = 'CLUB' as const;
  const [document] = useState<TacticalDocument>(
    envelope?.document ?? emptyBoard(),
  );
  const readOnly =
    !principal ||
    principal.role === 'PLAYER' ||
    (drill?.scope === 'CLUB' &&
      principal.role === 'COACH' &&
      drill.createdById !== principal.id);

  async function save(nextDocument: TacticalDocument) {
    if (readOnly) throw new Error('Bu egzersiz salt okunur.');
    const shouldCopy = drill?.scope === 'GLOBAL';
    if ((!drill || shouldCopy) && !group)
      throw new Error('Egzersiz için atanmış takım bulunamadı.');
    const common = {
      title,
      category,
      durationMin: duration,
      difficulty,
      equipment,
    };
    try {
      const saved =
        drill && !shouldCopy
          ? await saveTacticalDrill(
              drill.id,
              common,
              nextDocument,
              token.current ?? '',
            )
          : await createTacticalDrill({
              metadata: common,
              document: nextDocument,
              groupId: group!.id,
              ...(shouldCopy
                ? { sourceId: drill!.id, expectedSourceToken: token.current }
                : {}),
            });
      token.current = saved.writeToken;
      setDrill(saved.drill);
      toast.success(
        shouldCopy
          ? 'Global egzersiz kulüp kopyası olarak kaydedildi'
          : 'Egzersiz kaydedildi',
      );
      return !initial || shouldCopy
        ? { redirectTo: `/app/tactics/${saved.drill.id}`, replace: true }
        : undefined;
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : 'Egzersiz kaydedilemedi.';
      if (message.includes('TACTICAL_DOCUMENT_WRITE_CONFLICT'))
        throw new Error(
          'Kaynak başka bir oturumda değişti. Taslağınız korundu; JSON dışa aktardıktan sonra sayfayı yeniden açın. Otomatik üzerine yazılmadı.',
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
    }
  }
  return (
    <div className="page-shell tactics-editor-page tactics-editor-reference tactical-studio-page">
      <header className="studio-heading">
        <div>
          <h1>{title}</h1>
          <p>
            {group?.name ?? 'Takım seçilmedi'} · Taktik stüdyosu · {duration} dk
          </p>
        </div>
        <div className="page-actions">
          {drill?.scope === 'GLOBAL' ? (
            <Badge variant="amber">
              <Copy />
              Kopyala ve düzenle
            </Badge>
          ) : null}
          <Button variant="outline" asChild>
            <Link to="/app/tactics">
              <ArrowLeft />
              Kütüphane
            </Link>
          </Button>
        </div>
      </header>
      <details className="studio-details">
        <summary>
          Egzersiz bilgileri · Başlık, süre, kategori ve ekipman
        </summary>
        <section className="drill-fields">
          <label>
            Başlık
            <Input
              disabled={readOnly || saving}
              value={title}
              maxLength={120}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <label>
            Kategori
            <Select
              disabled={readOnly || saving}
              value={category}
              onValueChange={(value) => setCategory(value as DrillPhase)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WARM_UP">Isınma</SelectItem>
                <SelectItem value="TECHNICAL">Teknik</SelectItem>
                <SelectItem value="TACTICAL">Taktik</SelectItem>
                <SelectItem value="COOL_DOWN">Soğuma</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <label>
            Süre
            <Input
              disabled={readOnly || saving}
              type="number"
              min={1}
              max={300}
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
            />
          </label>
          <label>
            Zorluk
            <Select
              disabled={readOnly || saving}
              value={difficulty}
              onValueChange={(value) =>
                setDifficulty(value as typeof difficulty)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EASY">Kolay</SelectItem>
                <SelectItem value="MEDIUM">Orta</SelectItem>
                <SelectItem value="HARD">Zor</SelectItem>
              </SelectContent>
            </Select>
          </label>
          {principal?.role === 'SYSTEM_ADMIN' ? (
            <Alert>
              <AlertDescription>
                Bu tahta kulüp kopyası olarak kaydedilir. Global yayınlar{' '}
                <Link to="/app/library/manage">uzman inceleme kuyruğundan</Link>{' '}
                yönetilir.
              </AlertDescription>
            </Alert>
          ) : null}
          <label>
            Ekipman
            <Input
              disabled={readOnly || saving}
              value={equipment}
              maxLength={500}
              onChange={(event) => setEquipment(event.target.value)}
            />
          </label>
        </section>
      </details>
      <TacticalBoardEditor
        readOnly={readOnly}
        rosterSource={
          team && club && (!drill?.groupId || drill.groupId === group?.id)
            ? { teamId: team.id, clubId: club.id, name: team.name }
            : undefined
        }
        initialDocument={document}
        initiallySaved={Boolean(initial)}
        onSaveDocument={save}
        onSavingChange={setSaving}
        changeKey={JSON.stringify({
          title,
          category,
          duration,
          difficulty,
          equipment,
          scope,
        })}
      />
      <p className="shortcut-note">
        <FloppyDisk /> Kaydet: ⌘/Ctrl+S · Geri al: ⌘/Ctrl+Z · Çoğalt: ⌘/Ctrl+D ·
        Sil: Delete
      </p>
    </div>
  );
}
