import {
  CalendarBlank,
  Clock,
  ClipboardText,
  Plus,
  Strategy,
} from '@phosphor-icons/react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
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
import { Skeleton } from '../components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { createTrainingPlan } from '../lib/api';
import { useWorkspace } from '../lib/workspace-context';

export function meta() {
  return [{ title: 'Antrenmanlar | NGCS' }];
}
export default function TrainingsRoute() {
  const { group, plans, loading, error, reload } = useWorkspace();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('Yeni antrenman');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const sorted = [...plans].sort((a, b) =>
    (b.date ?? '').localeCompare(a.date ?? ''),
  );

  async function createPlan() {
    if (!group || !date) return;
    setSaving(true);
    try {
      const plan = await createTrainingPlan({
        title,
        groupId: group.id,
        date: new Date(date).toISOString(),
        notes,
      });
      await reload();
      setOpen(false);
      navigate(`/app/trainings/${plan.id}`);
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="page-kicker">Plan ve takip</p>
          <h1>Antrenmanlar</h1>
          <p>
            {group?.name ?? 'Takım TBD'} için antrenman akışları ve tahta
            snapshot’ları.
          </p>
        </div>
        <div className="page-actions">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus />
                Yeni plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni antrenman planı</DialogTitle>
                <DialogDescription>
                  {group?.name ?? 'Takım TBD'} için tarih ve amacı belirleyin.
                </DialogDescription>
              </DialogHeader>
              <div className="dialog-form">
                <label>
                  Başlık
                  <Input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                  />
                </label>
                <label>
                  Tarih ve saat
                  <Input
                    type="datetime-local"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                  />
                </label>
                <label>
                  Amaç
                  <Textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                  />
                </label>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Vazgeç
                </Button>
                <Button
                  disabled={!title.trim() || !date || saving}
                  onClick={() => void createPlan()}
                >
                  {saving ? 'Oluşturuluyor…' : 'Planı oluştur'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>
      {error ? (
        <Alert className="route-error">
          <AlertTitle>Planlar alınamadı</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {loading ? (
        <div className="loading-grid">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      ) : sorted.length ? (
        <div className="catalog-grid">
          {sorted.map((plan) => (
            <Link
              className="list-link"
              to={`/app/trainings/${plan.id}`}
              key={plan.id}
            >
              <Card>
                <CardHeader>
                  <div className="card-title-row">
                    <CardTitle>{plan.title}</CardTitle>
                    <Badge variant="outline">{plan.totalDuration} dk</Badge>
                  </div>
                  <CardDescription>
                    {plan.notes || 'Antrenman amacı TBD'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="meta-row">
                    <span>
                      <CalendarBlank />
                      {formatDate(plan.date)}
                    </span>
                    <span>
                      <ClipboardText />
                      {plan.drills?.length ?? 0} faz
                    </span>
                    <span>
                      <Strategy />
                      Tahta snapshot
                    </span>
                    <span>
                      <Clock />
                      {plan.totalDuration} dakika
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <ClipboardText weight="duotone" />
          <h2>Henüz antrenman planı yok</h2>
          <p>Takım için ilk antrenman oluşturulduğunda burada görünecek.</p>
        </div>
      )}
    </div>
  );
}
function formatDate(value: string | null) {
  if (!value) return 'Tarih TBD';
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(value));
}
