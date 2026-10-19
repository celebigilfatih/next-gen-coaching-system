import { useState } from 'react';
import { toast } from 'sonner';
import {
  archiveSportingTeam,
  createSportingTeam,
  updateSportingTeam,
  type SportingTeam,
  type TeamClassification,
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

type TeamFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  classification: TeamClassification;
  clubId: string;
  clubSeasonId: string;
  clubSeasonName: string;
  team?: SportingTeam;
  returnFocusId?: string;
  onSaved: (team: SportingTeam) => void | Promise<void>;
};

export function TeamFormDialog({
  open,
  onOpenChange,
  mode,
  classification,
  clubId,
  clubSeasonId,
  clubSeasonName,
  team,
  returnFocusId,
  onSaved,
}: TeamFormDialogProps) {
  const [name, setName] = useState(team?.name ?? '');
  const [ageGroupLabel, setAgeGroupLabel] = useState(
    team?.ageGroupLabel ?? (classification === 'FIRST_TEAM' ? 'SENIOR' : ''),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const editing = mode === 'edit';

  function changeOpen(next: boolean) {
    if (saving) return;
    if (next) setError('');
    onOpenChange(next);
  }

  async function submit() {
    if (!name.trim() || !ageGroupLabel.trim() || saving) return;
    setSaving(true);
    setError('');
    try {
      const saved = editing
        ? await updateSportingTeam(team!.id, {
            name: name.trim(),
            ageGroupLabel: ageGroupLabel.trim(),
          })
        : await createSportingTeam({
            clubId,
            clubSeasonId,
            name: name.trim(),
            ageGroupLabel: ageGroupLabel.trim(),
            classification,
          });
      await onSaved(saved);
      onOpenChange(false);
      toast.success(editing ? 'Takım güncellendi' : 'Takım oluşturuldu');
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : editing
            ? 'Takım güncellenemedi.'
            : 'Takım oluşturulamadı.',
      );
    } finally {
      setSaving(false);
    }
  }

  const title = editing
    ? `${team?.name ?? 'Takım'} bilgilerini düzenle`
    : classification === 'FIRST_TEAM'
      ? 'A Takımı oluştur'
      : 'Altyapı takımı ekle';
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
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {editing
              ? 'Takımın kalıcı kimliği korunur; yalnız adı ve yaş etiketi güncellenir.'
              : `${clubSeasonName} sezonuna bağlı yeni bir takım oluşturulur.`}
          </DialogDescription>
        </DialogHeader>
        <FormError message={error} />
        <div className="grid gap-5" aria-busy={saving}>
          <FormField label="Takım adı" htmlFor="team-lifecycle-name">
            <Input
              id="team-lifecycle-name"
              value={name}
              maxLength={80}
              disabled={saving}
              autoFocus
              onChange={(event) => setName(event.currentTarget.value)}
            />
          </FormField>
          <FormField label="Yaş / kademe etiketi" htmlFor="team-lifecycle-age">
            <Input
              id="team-lifecycle-age"
              value={ageGroupLabel}
              maxLength={32}
              disabled={saving}
              placeholder="U17, U19 veya B Takım"
              onChange={(event) => setAgeGroupLabel(event.currentTarget.value)}
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
            disabled={!name.trim() || !ageGroupLabel.trim() || saving}
            onClick={() => void submit()}
          >
            {saving
              ? editing
                ? 'Güncelleniyor…'
                : 'Oluşturuluyor…'
              : editing
                ? 'Değişiklikleri kaydet'
                : 'Takımı oluştur'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ArchiveTeamDialog({
  open,
  onOpenChange,
  team,
  returnFocusId,
  onArchived,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: SportingTeam;
  returnFocusId?: string;
  onArchived: () => void | Promise<void>;
}) {
  const [archiving, setArchiving] = useState(false);
  const [error, setError] = useState('');

  function changeOpen(next: boolean) {
    if (archiving) return;
    if (next) setError('');
    onOpenChange(next);
  }

  async function archive() {
    if (archiving) return;
    setArchiving(true);
    setError('');
    try {
      await archiveSportingTeam(team.id);
      await onArchived();
      onOpenChange(false);
      toast.success('Takım arşivlendi');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Takım arşivlenemedi.');
    } finally {
      setArchiving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          document.getElementById(`team-archive-cancel-${team.id}`)?.focus();
        }}
        onCloseAutoFocus={(event) => {
          if (!returnFocusId) return;
          event.preventDefault();
          document.getElementById(returnFocusId)?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>Takımı arşivle</DialogTitle>
          <DialogDescription>
            “{team.name}” aktif listelerden kaldırılacak. Sezon, kadro, maç,
            antrenman ve atama geçmişi silinmeyecek; takım daha sonra geri
            yüklenebilir.
          </DialogDescription>
        </DialogHeader>
        <FormError message={error} />
        <DialogFooter className="flex-wrap text-sm font-semibold">
          <Button
            id={`team-archive-cancel-${team.id}`}
            type="button"
            variant="outline"
            disabled={archiving}
            onClick={() => changeOpen(false)}
          >
            Vazgeç
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={archiving}
            onClick={() => void archive()}
          >
            {archiving ? 'Arşivleniyor…' : 'Takımı arşivle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
