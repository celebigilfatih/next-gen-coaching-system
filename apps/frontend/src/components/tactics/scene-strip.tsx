import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  Plus,
  Trash,
  Check,
  X,
} from '@phosphor-icons/react';
import type {
  TacticalBoardDocumentV2,
  TacticalScene,
} from '../../lib/tactical-document-core';
import type { SceneEdit } from '../../lib/tactical-scenes';
import { id } from '../../lib/tactical-board';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

export function SceneStrip({
  document,
  selectedId,
  onSelect,
  onEdit,
  readOnly,
  busy,
  editingLocked = false,
}: {
  document: TacticalBoardDocumentV2;
  selectedId: string;
  onSelect: (id: string) => void;
  onEdit: (edit: SceneEdit) => void;
  readOnly: boolean;
  busy: boolean;
  editingLocked?: boolean;
}) {
  const [removeId, setRemoveId] = useState<string | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const deleteRef = useRef<HTMLButtonElement>(null);
  const stripRef = useRef<HTMLElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);
  const previousSelection = useRef(selectedId);
  useEffect(() => {
    if (previousSelection.current !== selectedId)
      activeButtonRef.current?.scrollIntoView?.({
        block: 'nearest',
        inline: 'nearest',
      });
    previousSelection.current = selectedId;
  }, [selectedId]);
  const index = document.scenes.findIndex((scene) => scene.id === selectedId);
  const selected = document.scenes[index];
  const removal = document.scenes.find((scene) => scene.id === removeId);
  const locked = readOnly || busy || editingLocked;
  const total = document.scenes.reduce(
    (sum, scene) => sum + scene.holdMs + scene.transitionMs,
    0,
  );
  return (
    <section
      ref={stripRef}
      tabIndex={-1}
      className="scene-strip"
      aria-label="Sahne düzenleyici"
    >
      <div className="scene-strip-heading">
        <strong>
          Sahneler{' '}
          <span>
            {document.scenes.length}/12 ·{' '}
            {(total / 1000).toLocaleString('tr-TR')} sn
          </span>
        </strong>
        <span>Sahne seçimi kaydı değiştirmez.</span>
      </div>
      <div className="scene-strip-items" role="group" aria-label="Sahne seçimi">
        {document.scenes.map((scene, order) => (
          <Button
            key={scene.id}
            ref={scene.id === selectedId ? activeButtonRef : undefined}
            variant={scene.id === selectedId ? 'secondary' : 'outline'}
            aria-pressed={scene.id === selectedId}
            aria-label={`Sahne ${order + 1}: ${scene.title}`}
            disabled={busy}
            onClick={() => onSelect(scene.id)}
          >
            <span className="scene-number">{order + 1}</span>
            <span className="scene-label">
              <strong>{scene.title}</strong>
              <small>
                {scene.board.elements.length} eleman · {scene.holdMs / 1000} sn
              </small>
            </span>
          </Button>
        ))}
      </div>
      {!readOnly && (
        <>
          <div className="scene-strip-actions">
            <Button
              size="sm"
              variant="outline"
              disabled={locked || document.scenes.length >= 12}
              onClick={() =>
                onEdit({ type: 'duplicate', id: selectedId, newId: id() })
              }
            >
              <Plus />
              Sahne ekle
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={locked || document.scenes.length >= 12}
              onClick={() =>
                onEdit({ type: 'duplicate', id: selectedId, newId: id() })
              }
            >
              <Copy />
              Sahneyi çoğalt
            </Button>
            <Button
              size="sm"
              variant="ghost"
              aria-label="Sahneyi sola taşı"
              disabled={locked || index === 0}
              onClick={() =>
                onEdit({ type: 'move', id: selectedId, direction: -1 })
              }
            >
              <ArrowLeft />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              aria-label="Sahneyi sağa taşı"
              disabled={locked || index === document.scenes.length - 1}
              onClick={() =>
                onEdit({ type: 'move', id: selectedId, direction: 1 })
              }
            >
              <ArrowRight />
            </Button>
            <Button
              ref={deleteRef}
              size="sm"
              variant="ghost"
              disabled={locked || document.scenes.length === 1}
              onClick={() => setRemoveId(selectedId)}
            >
              <Trash />
              Sahneyi sil
            </Button>
          </div>
          <SceneSettings
            key={JSON.stringify(selected)}
            scene={selected}
            last={index === document.scenes.length - 1}
            busy={busy || editingLocked}
            onApply={(patch) =>
              onEdit({ type: 'update', id: selectedId, patch })
            }
          />
          <p className="scene-help">
            Ad ve süre alanlarını değiştirdikten sonra “Sahne ayarlarını uygula”
            ile taslağa alın. Ekle, seçili sahneyi kopyalar; oyuncu ve top
            kimliklerini korur. Sıralama veya silme sonrası son sahne kesme
            geçişiyle biter. Çok sahneli belgede saha türü değiştirilemez.
          </p>
        </>
      )}
      <Dialog
        open={Boolean(removal)}
        onOpenChange={(open) => {
          if (!open && !busy) setRemoveId(null);
        }}
      >
        <DialogContent
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            cancelRef.current?.focus();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (deleteRef.current?.disabled) stripRef.current?.focus();
            else deleteRef.current?.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle>Sahne silinsin mi?</DialogTitle>
            <DialogDescription>
              “{removal?.title}” ve bu sahnedeki elemanlar taslaktan
              kaldırılacak. Son sahnenin geçişi kesme olur. Geri al ile geri
              getirebilirsiniz; kalıcı kayıt yalnız Kaydet ile yapılır.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              ref={cancelRef}
              variant="outline"
              disabled={busy}
              onClick={() => setRemoveId(null)}
            >
              <X aria-hidden="true" />
              İptal
            </Button>
            <Button
              variant="destructive"
              disabled={busy || document.scenes.length === 1}
              onClick={() => {
                if (removal) onEdit({ type: 'remove', id: removal.id });
                setRemoveId(null);
              }}
            >
              <Trash aria-hidden="true" />
              Sahneyi silmeyi onayla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function SceneSettings({
  scene,
  last,
  busy,
  onApply,
}: {
  scene: TacticalScene;
  last: boolean;
  busy: boolean;
  onApply: (
    patch: Pick<
      TacticalScene,
      'title' | 'holdMs' | 'transition' | 'transitionMs'
    >,
  ) => void;
}) {
  const [title, setTitle] = useState(scene.title);
  const [hold, setHold] = useState(String(scene.holdMs));
  const [transition, setTransition] = useState(scene.transition);
  const [duration, setDuration] = useState(String(scene.transitionMs || 1000));
  return (
    <form
      className="scene-settings"
      onSubmit={(event) => {
        event.preventDefault();
        onApply({
          title,
          holdMs: Number(hold),
          transition,
          transitionMs: transition === 'cut' ? 0 : Number(duration),
        });
      }}
    >
      <label>
        Sahne adı
        <Input
          required
          maxLength={80}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={busy}
        />
      </label>
      <label>
        Bekleme (ms)
        <Input
          required
          type="number"
          min={last ? 1 : 0}
          max={30000}
          step={1}
          value={hold}
          onChange={(event) => setHold(event.target.value)}
          disabled={busy}
        />
      </label>
      <label>
        Sonraki sahneye geçiş
        <select
          value={transition}
          onChange={(event) =>
            setTransition(event.target.value as 'cut' | 'linear')
          }
          disabled={last || busy}
        >
          <option value="cut">Kesme</option>
          <option value="linear">Doğrusal</option>
        </select>
      </label>
      {transition === 'linear' && (
        <label>
          Geçiş (ms)
          <Input
            required
            type="number"
            min={100}
            max={10000}
            step={1}
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            disabled={busy}
          />
        </label>
      )}
      <Button
        type="submit"
        variant="outline"
        size="sm"
        disabled={busy || !title.trim()}
      >
        <Check aria-hidden="true" />
        Sahne ayarlarını uygula
      </Button>
    </form>
  );
}
