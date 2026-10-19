import { useEffect, useRef, useState } from 'react';
import { updateMatch, type Match } from '../lib/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { FormError, FormField } from './forms/form-field';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

const localTime = (date: string) =>
  new Date(Date.parse(date) + 3 * 3_600_000).toISOString().slice(0, 16);
export function MatchScheduleDialog({
  matchId,
  date,
  onSaved,
}: {
  matchId: string;
  date: string;
  onSaved: (date: string) => void;
}) {
  const [open, setOpen] = useState(false),
    [value, setValue] = useState(localTime(date));
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const [result, setResult] = useState<Match['planningSync']>();
  const alive = useRef(true),
    locked = useRef(false);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError('');
    try {
      const saved = await updateMatch(matchId, {
        date: new Date(`${value}:00+03:00`).toISOString(),
      });
      if (!alive.current) return;
      onSaved(saved.date);
      setResult(saved.planningSync);
      setOpen(false);
    } catch (cause) {
      if (alive.current)
        setError(
          cause instanceof Error ? cause.message : 'Maç tarihi kaydedilemedi.',
        );
    } finally {
      locked.current = false;
      if (alive.current) setBusy(false);
    }
  }
  return (
    <div className="grid gap-3">
      <div>
        <Button
          className="min-h-11"
          variant="outline"
          onClick={() => {
            setValue(localTime(date));
            setError('');
            setOpen(true);
          }}
        >
          Tarih ve saati düzenle
        </Button>
      </div>
      {result && (
        <Alert role="status">
          <AlertTitle>Maç tarihi kaydedildi</AlertTitle>
          <AlertDescription>
            {result.status === 'not-enrolled'
              ? 'Bu hafta otomatik programa bağlı değil; mevcut planlar değiştirilmedi.'
              : `${result.updated} etkinlik güncellendi, ${result.created} eklendi, ${result.retired} eski örnek etkinlik kaldırıldı. ${result.protected} elle düzenlenen, silinen veya geçmiş kayıt korundu.`}
          </AlertDescription>
        </Alert>
      )}
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!locked.current) setOpen(next);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Maç tarihini ve saatini düzenle</DialogTitle>
            <DialogDescription>
              Saatler Türkiye saatidir. A Takım’ın bağlı antrenman ve
              toplantıları yeni maç takvimine uyarlanır. Elle düzenlediğiniz
              kayıtlar korunur; çakışmada hiçbir değişiklik kaydedilmez.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(event) => void save(event)}>
            <FormField
              htmlFor="match-schedule-date"
              label="Yeni tarih ve başlama saati"
            >
              <Input
                className="min-h-11 text-base"
                id="match-schedule-date"
                type="datetime-local"
                required
                value={value}
                disabled={busy}
                onChange={(event) => setValue(event.target.value)}
              />
            </FormField>
            <FormError message={error} />
            <DialogFooter className="mt-4 flex-col sm:flex-row">
              <Button
                className="min-h-11 w-full sm:w-auto"
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => setOpen(false)}
              >
                Vazgeç
              </Button>
              <Button
                className="min-h-11 w-full sm:w-auto"
                type="submit"
                disabled={busy || !value}
              >
                {busy ? 'Kaydediliyor…' : 'Tarihi ve programı güncelle'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
