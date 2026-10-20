import { useEffect, useRef, useState } from 'react';
import { getSportingPlayerPage, type SportingPlayerPage } from '../../lib/api';
import type { BoardElement } from '../../lib/tactical-board';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { NativeSelect } from '../ui/native-select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

export type BoardRosterSource = {
  teamId: string;
  clubId: string;
  name: string;
};

/** Read through the existing capability/tenant-filtered endpoint; never persist a Person id. */
export function BoardRoster({
  source,
  disabled,
  onChoose,
  assignment,
  addDisabled = false,
}: {
  source: BoardRosterSource;
  disabled: boolean;
  onChoose: (name: string, goalkeeper: boolean) => void;
  addDisabled?: boolean;
  assignment?: {
    slots: BoardElement[];
    selectedId?: string;
    onSelect: (id: string) => void;
    onAssign: (slot: BoardElement, name: string) => void;
  };
}) {
  const [mode, setMode] = useState('add');
  const [confirmation, setConfirmation] = useState<{
    slot: BoardElement;
    name: string;
  }>();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const assignmentTriggerRef = useRef<HTMLButtonElement | null>(null);
  const slot = assignment?.slots.find(
    (item) => item.id === assignment.selectedId,
  );
  const confirmationValid =
    confirmation &&
    assignment?.slots.some(
      (item) => JSON.stringify(item) === JSON.stringify(confirmation.slot),
    );
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [after, setAfter] = useState<string>();
  const [result, setResult] = useState<{
    key: string;
    page?: SportingPlayerPage;
    error?: string;
  }>();
  const [retry, setRetry] = useState(0);
  const requestKey = JSON.stringify([
    source.teamId,
    source.clubId,
    q,
    after,
    retry,
  ]);
  const page = result?.key === requestKey ? result.page : undefined;
  const error = result?.key === requestKey ? result.error : undefined;
  useEffect(() => {
    const timer = setTimeout(() => {
      setQ(search.trim());
      setAfter(undefined);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    let current = true;
    getSportingPlayerPage({
      teamId: source.teamId,
      clubId: source.clubId,
      q,
      after,
      sort: 'NAME_ASC',
    })
      .then((value) => {
        if (current) setResult({ key: requestKey, page: value });
      })
      .catch(() => {
        if (current)
          setResult({
            key: requestKey,
            error: 'Kadro yüklenemedi veya bu takıma erişim yetkiniz yok.',
          });
      });
    return () => {
      current = false;
    };
  }, [source.teamId, source.clubId, q, after, requestKey]);
  const pending = result?.key !== requestKey || search.trim() !== q;
  return (
    <section className="board-roster" aria-label="Takım kadrosundan ekle">
      <h3>{source.name}</h3>
      <p className="board-help">
        Güncel kadrodan ad kopyalanır; canlı profil bağlantısı değildir. Forma
        numarasını siz belirleyin. İsimler tahta çıktılarında görünür.
      </p>
      {assignment ? (
        <div className="board-roster-assignment">
          <label>
            Kadro işlemi
            <NativeSelect
              value={mode}
              onChange={(event) => setMode(event.target.value)}
              disabled={disabled}
            >
              <option value="add">Yeni oyuncu ekle</option>
              <option value="assign">Formasyon yerine ata</option>
            </NativeSelect>
          </label>
          {mode === 'assign' ? (
            <>
              <label>
                Formasyon yeri
                <NativeSelect
                  value={slot?.id ?? ''}
                  disabled={disabled}
                  onChange={(event) => assignment.onSelect(event.target.value)}
                >
                  <option value="">Bir oyuncu veya kaleci yeri seçin</option>
                  {assignment.slots.map((item, index) => (
                    <option key={item.id} value={item.id}>
                      {index + 1}.{' '}
                      {item.team === 'home'
                        ? 'Ev'
                        : item.team === 'away'
                          ? 'Deplasman'
                          : 'Tarafsız'}{' '}
                      · {item.type === 'goalkeeper' ? 'Kaleci' : 'Oyuncu'}
                      {item.number ? ` · ${item.number}` : ''}
                      {item.name ? ` · ${item.name}` : ''}
                    </option>
                  ))}
                </NativeSelect>
              </label>
              <p className="board-help">
                Konum, takım rengi ve çizim korunur. Eski ad değiştirilir;
                numara temizlenir. Gerçek forma numarasını Özellikler bölümünden
                girebilirsiniz.
              </p>
              {!assignment.slots.length ? (
                <p>Önce sahaya bir formasyon, oyuncu veya kaleci ekleyin.</p>
              ) : null}
            </>
          ) : addDisabled ? (
            <p role="status">
              250 eleman sınırına ulaşıldı. Mevcut formasyon yerine atama
              yapabilirsiniz.
            </p>
          ) : null}
        </div>
      ) : null}
      <Input
        aria-label="Kadroda oyuncu ara"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      {pending ? (
        <p role="status">Kadro yükleniyor…</p>
      ) : error ? (
        <div role="alert">
          {error}
          <Button onClick={() => setRetry((value) => value + 1)}>
            Yeniden dene
          </Button>
        </div>
      ) : (
        <>
          <p className="board-help">{page?.total ?? 0} eşleşen oyuncu</p>
          {!page?.items.length ? (
            <p>Bu kapsamda oyuncu bulunamadı.</p>
          ) : (
            page.items.map((player) => (
              <Button
                key={player.id}
                variant="outline"
                className="board-roster-player"
                disabled={
                  disabled ||
                  player.displayName.length > 80 ||
                  (mode === 'assign' ? !slot : addDisabled)
                }
                onClick={(event) => {
                  if (mode === 'assign' && slot) {
                    assignmentTriggerRef.current = event.currentTarget;
                    setConfirmation({ slot, name: player.displayName });
                  } else
                    onChoose(
                      player.displayName,
                      player.playerProfile?.primaryPosition === 'KALECI',
                    );
                }}
              >
                {player.displayName}
                <span>
                  {player.displayName.length > 80
                    ? 'Ad 80 karakteri aşıyor; elle kısaltarak ekleyin'
                    : mode === 'assign'
                      ? 'Seçili yere ata'
                      : 'Tahtaya ekle'}
                </span>
              </Button>
            ))
          )}
          <div className="board-roster-pagination">
            <Button
              variant="ghost"
              disabled={!after}
              onClick={() => setAfter(undefined)}
            >
              İlk sayfa
            </Button>
            <Button
              variant="ghost"
              disabled={!page?.nextCursor}
              onClick={() => setAfter(page?.nextCursor ?? undefined)}
            >
              Sonraki
            </Button>
          </div>
        </>
      )}
      <Dialog
        open={Boolean(confirmation)}
        onOpenChange={(open) => {
          if (!open) setConfirmation(undefined);
        }}
      >
        <DialogContent
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            cancelRef.current?.focus();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            assignmentTriggerRef.current?.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle>Formasyon yerine oyuncu ata</DialogTitle>
            <DialogDescription>
              {confirmation?.slot.team === 'home'
                ? 'Ev'
                : confirmation?.slot.team === 'away'
                  ? 'Deplasman'
                  : 'Tarafsız'}{' '}
              takımdaki{' '}
              {confirmation?.slot.number
                ? `${confirmation.slot.number} numaralı `
                : ''}
              {confirmation?.slot.name || 'isimsiz oyuncunun'} yerine{' '}
              {confirmation?.name} atanacak. Konum ve çizim korunacak; mevcut
              numara temizlenecek. Bu işlem geri alınabilir ve yalnız Kaydet ile
              kalıcılaşır.
            </DialogDescription>
          </DialogHeader>
          {!confirmationValid ? (
            <p role="alert">Seçilen yer değişti. İptal edip yeniden seçin.</p>
          ) : null}
          <DialogFooter>
            <Button
              ref={cancelRef}
              variant="outline"
              onClick={() => setConfirmation(undefined)}
            >
              İptal
            </Button>
            <Button
              disabled={disabled || !confirmationValid}
              onClick={() => {
                if (!disabled && confirmation && confirmationValid)
                  assignment?.onAssign(confirmation.slot, confirmation.name);
                setConfirmation(undefined);
              }}
            >
              Oyuncuyu ata
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
