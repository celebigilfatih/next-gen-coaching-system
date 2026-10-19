import { useState } from 'react';
import { toast } from 'sonner';
import type { TrainingPlan } from '../lib/api';
import {
  createTrainingPlan,
  deleteTrainingPlan,
  updateTrainingPlan,
} from '../lib/api';
import { FormError, FormField } from './forms/form-field';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

type EditableTrainingPlan = Pick<
  TrainingPlan,
  'id' | 'title' | 'date' | 'notes'
>;

type TrainingPlanDialogProps = {
  mode: 'create' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId?: string;
  groupName: string;
  plan?: EditableTrainingPlan;
  returnFocusId?: string;
  onSaved: (plan: TrainingPlan) => void | Promise<void>;
};

function localDateTimeValue(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function TrainingPlanDialog({
  mode,
  open,
  onOpenChange,
  groupId,
  groupName,
  plan,
  returnFocusId,
  onSaved,
}: TrainingPlanDialogProps) {
  const [title, setTitle] = useState(
    mode === 'edit' ? (plan?.title ?? '') : 'Yeni antrenman',
  );
  const [date, setDate] = useState(
    mode === 'edit' ? localDateTimeValue(plan?.date) : '',
  );
  const [notes, setNotes] = useState(
    mode === 'edit' ? (plan?.notes ?? '') : '',
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function changeOpen(next: boolean) {
    if (saving) return;
    onOpenChange(next);
  }

  async function submit() {
    if (!title.trim() || !date || saving) return;
    if (mode === 'create' && !groupId) return;
    setSaving(true);
    setError('');
    try {
      const input = {
        title,
        date: new Date(date).toISOString(),
        notes,
      };
      const saved =
        mode === 'create'
          ? await createTrainingPlan({ ...input, groupId: groupId as string })
          : await updateTrainingPlan(plan!.id, input);
      await onSaved(saved);
      onOpenChange(false);
      toast.success(
        mode === 'create'
          ? 'Antrenman planı oluşturuldu'
          : 'Antrenman planı güncellendi',
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : mode === 'create'
            ? 'Plan oluşturulamadı.'
            : 'Plan güncellenemedi.',
      );
    } finally {
      setSaving(false);
    }
  }

  const editing = mode === 'edit';
  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto"
        onCloseAutoFocus={(event) => {
          if (!returnFocusId) return;
          event.preventDefault();
          document.getElementById(returnFocusId)?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {editing ? 'Antrenmanı düzenle' : 'Yeni antrenman planı'}
          </DialogTitle>
          <DialogDescription>
            {groupName} için başlık, tarih ve amacı belirleyin. Süre plan
            fazlarından hesaplanır.
          </DialogDescription>
        </DialogHeader>
        <FormError message={error} />
        <div className="grid gap-5" aria-busy={saving}>
          <FormField label="Başlık" htmlFor={`training-${mode}-title`}>
            <Input
              id={`training-${mode}-title`}
              value={title}
              disabled={saving}
              onChange={(event) => setTitle(event.target.value)}
            />
          </FormField>
          <FormField label="Tarih ve saat" htmlFor={`training-${mode}-date`}>
            <Input
              id={`training-${mode}-date`}
              type="datetime-local"
              value={date}
              disabled={saving}
              onChange={(event) => setDate(event.target.value)}
            />
          </FormField>
          <FormField label="Amaç" htmlFor={`training-${mode}-notes`}>
            <Textarea
              id={`training-${mode}-notes`}
              value={notes}
              disabled={saving}
              onChange={(event) => setNotes(event.target.value)}
            />
          </FormField>
        </div>
        <DialogFooter className="flex-wrap text-sm font-semibold">
          <Button
            type="button"
            variant="outline"
            onClick={() => changeOpen(false)}
          >
            Vazgeç
          </Button>
          <Button
            type="button"
            disabled={!title.trim() || !date || saving}
            onClick={() => void submit()}
          >
            {saving
              ? editing
                ? 'Güncelleniyor…'
                : 'Oluşturuluyor…'
              : editing
                ? 'Değişiklikleri kaydet'
                : 'Planı oluştur'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type DeleteTrainingPlanDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Pick<TrainingPlan, 'id' | 'title'>;
  returnFocusId?: string;
  onDeleted: () => void | Promise<void>;
};

function DeleteTrainingPlanDialog({
  open,
  onOpenChange,
  plan,
  returnFocusId,
  onDeleted,
}: DeleteTrainingPlanDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  function changeOpen(next: boolean) {
    if (deleting) return;
    if (next) setError('');
    onOpenChange(next);
  }

  async function remove() {
    if (deleting) return;
    setDeleting(true);
    setError('');
    try {
      await deleteTrainingPlan(plan.id);
      await onDeleted();
      onOpenChange(false);
      toast.success('Antrenman planı kalıcı olarak silindi');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Plan silinemedi.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          document.getElementById(`training-delete-cancel-${plan.id}`)?.focus();
        }}
        onCloseAutoFocus={(event) => {
          if (!returnFocusId) return;
          event.preventDefault();
          document.getElementById(returnFocusId)?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>Antrenmanı kalıcı sil</DialogTitle>
          <DialogDescription>
            “{plan.title}” planı; bağlı fazlar, taktik tahta snapshot’ları,
            katılım kayıtları ve takvim bağlantılarıyla birlikte geri alınamaz
            biçimde silinecek.
          </DialogDescription>
        </DialogHeader>
        <FormError message={error} />
        <DialogFooter className="flex-wrap text-sm font-semibold">
          <Button
            id={`training-delete-cancel-${plan.id}`}
            type="button"
            variant="outline"
            disabled={deleting}
            onClick={() => changeOpen(false)}
          >
            Vazgeç
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleting}
            onClick={() => void remove()}
          >
            {deleting ? 'Siliniyor…' : 'Antrenmanı kalıcı sil'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { DeleteTrainingPlanDialog, TrainingPlanDialog, localDateTimeValue };
