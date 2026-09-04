import { ArrowLeft, Copy, FloppyDisk } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
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
  createDrill,
  getDrill,
  updateDrill,
  type Drill,
  type DrillPhase,
} from '../lib/api';
import { getSession } from '../lib/session';
import {
  emptyBoard,
  validateBoard,
  type TacticalBoardDocumentV1,
} from '../lib/tactical-board';
import { useWorkspace } from '../lib/workspace-context';

export function TacticsEditorPage({ drillId }: { drillId?: string }) {
  const navigate = useNavigate();
  const { group, reload } = useWorkspace();
  const principal = getSession()?.user;
  const [drill, setDrill] = useState<Drill>();
  const [loading, setLoading] = useState(Boolean(drillId));
  const [error, setError] = useState('');
  const [title, setTitle] = useState('Yeni taktik egzersizi');
  const [category, setCategory] = useState<DrillPhase>('TACTICAL');
  const [duration, setDuration] = useState(20);
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>(
    'MEDIUM',
  );
  const [equipment, setEquipment] = useState('');
  const [scope, setScope] = useState<'GLOBAL' | 'CLUB'>('CLUB');
  const [document, setDocument] =
    useState<TacticalBoardDocumentV1>(emptyBoard());

  useEffect(() => {
    if (!drillId) return;
    getDrill(drillId)
      .then((value) => {
        setDrill(value);
        setTitle(value.title);
        setCategory(value.category);
        setDuration(value.durationMin);
        setDifficulty(value.difficulty);
        setEquipment(value.equipment ?? '');
        setScope(value.scope);
        try {
          setDocument(validateBoard(value.jsonData));
        } catch {
          setError('Bu egzersiz geçerli bir NGCS taktik tahtası içermiyor.');
        }
      })
      .catch((cause) =>
        setError(
          cause instanceof Error ? cause.message : 'Egzersiz yüklenemedi.',
        ),
      )
      .finally(() => setLoading(false));
  }, [drillId]);

  async function save(nextDocument: TacticalBoardDocumentV1) {
    const effectiveScope = principal?.role === 'SYSTEM_ADMIN' ? scope : 'CLUB';
    if (effectiveScope === 'CLUB' && !group)
      throw new Error('Egzersiz için atanmış takım bulunamadı.');
    const ageGroup = group?.ageGroup ?? drill?.ageGroup;
    if (!ageGroup) throw new Error('Egzersiz yaş grubu belirlenemedi.');
    const common = {
      title,
      category,
      ageGroup,
      durationMin: duration,
      difficulty,
      equipment,
      jsonData: nextDocument,
    };
    const shouldCopy = Boolean(
      drill && drill.scope === 'GLOBAL' && principal?.role !== 'SYSTEM_ADMIN',
    );
    const saved =
      drill && !shouldCopy
        ? await updateDrill(drill.id, common)
        : await createDrill({
            ...common,
            scope: shouldCopy ? 'CLUB' : effectiveScope,
            groupId:
              shouldCopy || effectiveScope === 'CLUB' ? group?.id : undefined,
          });
    setDrill(saved);
    setDocument(validateBoard(saved.jsonData));
    await reload();
    if (!drillId || shouldCopy)
      navigate(`/app/tactics/${saved.id}`, { replace: true });
    toast.success(
      shouldCopy
        ? 'Global egzersiz kulüp kopyası olarak kaydedildi'
        : 'Egzersiz kaydedildi',
    );
  }

  if (loading)
    return (
      <div className="page-shell">
        <p>Tahta yükleniyor…</p>
      </div>
    );
  return (
    <div className="page-shell tactics-editor-page">
      <header className="page-header">
        <div>
          <p className="page-kicker">
            {drill ? 'Egzersiz tahtası' : 'Yeni egzersiz'}
          </p>
          <h1>{title}</h1>
          <p>
            {drill?.scope === 'GLOBAL'
              ? 'Global kütüphane · Koç değişiklikleri kulüp kopyası oluşturur.'
              : `${group?.name ?? 'Takım TBD'} · Kulüp kapsamı`}
          </p>
        </div>
        <div className="page-actions">
          <Button variant="outline" asChild>
            <Link to="/app/tactics">
              <ArrowLeft />
              Kütüphane
            </Link>
          </Button>
          {drill?.scope === 'GLOBAL' && principal?.role !== 'SYSTEM_ADMIN' ? (
            <Badge variant="amber">
              <Copy />
              Kopyala ve düzenle
            </Badge>
          ) : null}
        </div>
      </header>
      {error ? (
        <Alert className="route-error">
          <AlertTitle>Tahta açılamadı</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <section className="drill-fields">
        <label>
          Başlık
          <Input
            value={title}
            maxLength={120}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <label>
          Kategori
          <Select
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
            value={difficulty}
            onValueChange={(value) => setDifficulty(value as typeof difficulty)}
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
          <label>
            Kapsam
            <Select
              value={scope}
              onValueChange={(value) => setScope(value as typeof scope)}
              disabled={Boolean(drill)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GLOBAL">Global</SelectItem>
                <SelectItem value="CLUB">Kulüp</SelectItem>
              </SelectContent>
            </Select>
          </label>
        ) : null}
        <label>
          Ekipman
          <Input
            value={equipment}
            maxLength={500}
            onChange={(event) => setEquipment(event.target.value)}
          />
        </label>
      </section>
      <TacticalBoardEditor
        key={drill?.id ?? 'new'}
        initialDocument={document}
        onSave={save}
      />
      <p className="shortcut-note">
        <FloppyDisk /> Kaydet: ⌘/Ctrl+S · Geri al: ⌘/Ctrl+Z · Çoğalt: ⌘/Ctrl+D ·
        Sil: Delete
      </p>
    </div>
  );
}
