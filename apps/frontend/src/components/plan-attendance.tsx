import {
  CheckCircle,
  CircleDashed,
  UsersThree,
  XCircle,
} from '@phosphor-icons/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  getPlanAttendancePage,
  markAttendance,
  type PlanAttendancePage,
} from '../lib/api';
import { getSession } from '../lib/session';
import { useAssignmentPage } from '../lib/use-assignment-page';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import '../styles/plan-attendance.css';

export function PlanAttendance({ planId }: { planId: string }) {
  const load = useCallback(
    (after?: string) => getPlanAttendancePage(planId, after),
    [planId],
  );
  const state = useAssignmentPage(load);
  const [busyPlayer, setBusyPlayer] = useState<string | null>(null);
  const busy = busyPlayer !== null;
  const [writeError, setWriteError] = useState('');
  const locked = useRef(false);
  const mounted = useRef(true);
  const controls = useRef(new Map<string, HTMLButtonElement>());
  const restoreFocus = useRef<string | null>(null);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const canWrite = ['SYSTEM_ADMIN', 'CLUB_ADMIN', 'COACH'].includes(
    getSession()?.user.role ?? '',
  );
  useEffect(() => {
    if (!state.loading && state.data && restoreFocus.current) {
      controls.current.get(restoreFocus.current)?.focus();
      restoreFocus.current = null;
    }
  }, [state.loading, state.data]);
  async function mark(
    item: PlanAttendancePage['items'][number],
    status: 'PRESENT' | 'ABSENT',
  ) {
    if (
      locked.current ||
      !canWrite ||
      state.loading ||
      writeError ||
      item.status === status
    )
      return;
    locked.current = true;
    setBusyPlayer(item.id);
    try {
      await markAttendance({
        planId,
        playerId: item.playerId,
        status,
      });
      if (mounted.current) {
        restoreFocus.current = `${item.id}:${status}`;
        state.retry();
        toast.success('Katılım güncellendi');
      }
    } catch {
      if (mounted.current)
        setWriteError(
          'Katılım kaydı doğrulanamadı. Yeniden yazmadan önce güncel durumu yükleyin.',
        );
    } finally {
      locked.current = false;
      if (mounted.current) setBusyPlayer(null);
    }
  }
  const page = state.data;
  return (
    <section className="plan-attendance" aria-label="Oyuncu katılımı">
      <header className="plan-attendance__header">
        <div>
          <p className="plan-attendance__eyebrow">Antrenman yoklaması</p>
          <h3>
            <UsersThree aria-hidden="true" /> Katılım ·{' '}
            {page ? `${page.presentTotal}/${page.total}` : '—'}
          </h3>
          <p>
            {canWrite
              ? 'Her oyuncu için katılım durumunu seçin. Seçiminiz anında kaydedilir.'
              : 'Bu antrenmana ait kendi katılım durumunuzu görüntülüyorsunuz.'}
          </p>
        </div>
        <span className="plan-attendance__count">
          {page
            ? `${page.total} oyuncu`
            : state.error
              ? 'Oyuncular yüklenemedi'
              : 'Oyuncular yükleniyor'}
        </span>
      </header>
      <div className="plan-attendance__body">
        {writeError && (
          <Alert role="alert" className="plan-attendance__alert">
            <AlertDescription>{writeError}</AlertDescription>
            <Button
              onClick={() => {
                setWriteError('');
                state.retry();
              }}
            >
              Güncel katılımı yükle
            </Button>
          </Alert>
        )}
        {state.loading ? (
          <div
            className="plan-attendance__loading"
            role="status"
            aria-label="Katılım yükleniyor"
          >
            <Skeleton className="h-32" />
          </div>
        ) : state.error ? (
          <Alert role="alert" className="plan-attendance__alert">
            <AlertDescription>{state.error}</AlertDescription>
            <Button onClick={state.retry}>Katılımı tekrar yükle</Button>
          </Alert>
        ) : page?.items.length ? (
          <ul className="plan-attendance__list" aria-label="Oyuncu yoklamaları">
            {page.items.map((item) => {
              const Icon =
                item.status === 'PRESENT'
                  ? CheckCircle
                  : item.status === 'ABSENT'
                    ? XCircle
                    : CircleDashed;
              const label =
                item.status === 'PRESENT'
                  ? 'Katıldı'
                  : item.status === 'ABSENT'
                    ? 'Katılmadı'
                    : 'Henüz işaretlenmedi';
              return (
                <li key={item.id} className="plan-attendance__row">
                  <span className="plan-attendance__avatar" aria-hidden="true">
                    {item.name
                      .trim()
                      .split(/\s+/)
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join('')
                      .toLocaleUpperCase('tr-TR')}
                  </span>
                  <div className="plan-attendance__player">
                    <strong>{item.name}</strong>
                    <span
                      className="plan-attendance__status"
                      data-status={item.status ?? 'UNMARKED'}
                    >
                      <Icon
                        aria-hidden="true"
                        weight={item.status ? 'fill' : 'regular'}
                      />{' '}
                      {label}
                    </span>
                  </div>
                  {canWrite && (
                    <div
                      className="plan-attendance__actions"
                      role="group"
                      aria-label={`${item.name} yoklaması`}
                    >
                      {(['PRESENT', 'ABSENT'] as const).map((status) => (
                        <Button
                          key={status}
                          ref={(node) => {
                            const key = `${item.id}:${status}`;
                            if (node) controls.current.set(key, node);
                            else controls.current.delete(key);
                          }}
                          variant="outline"
                          data-attendance={status}
                          aria-label={`${item.name}: ${status === 'PRESENT' ? 'Katıldı' : 'Katılmadı'}`}
                          aria-pressed={item.status === status}
                          disabled={busy || Boolean(writeError)}
                          onClick={() => void mark(item, status)}
                        >
                          {status === 'PRESENT' ? (
                            <CheckCircle aria-hidden="true" />
                          ) : (
                            <XCircle aria-hidden="true" />
                          )}
                          {status === 'PRESENT' ? 'Katıldı' : 'Katılmadı'}
                        </Button>
                      ))}
                    </div>
                  )}
                  {busyPlayer === item.id && (
                    <span className="plan-attendance__saving" role="status">
                      Kaydediliyor…
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="plan-attendance__empty">
            {page?.total === 0
              ? 'Takım oyuncusu bulunamadı.'
              : 'Bu sayfada oyuncu yok; önceki sayfaya dönebilirsiniz.'}
          </p>
        )}
        <nav
          aria-label="Katılım sayfaları"
          className="plan-attendance__pager"
          data-paged={state.pageNumber > 1 || Boolean(page?.nextCursor)}
        >
          {(state.pageNumber > 1 || page?.nextCursor) && (
            <Button
              variant="outline"
              disabled={busy || state.loading || state.pageNumber === 1}
              onClick={state.previous}
            >
              Önceki sayfa
            </Button>
          )}
          <span role="status">
            Sayfa {state.pageNumber}
            {page ? ` · ${page.items.length} / ${page.total} oyuncu` : ''}
          </span>
          {(state.pageNumber > 1 || page?.nextCursor) && (
            <Button
              variant="outline"
              disabled={busy || state.loading || !page?.nextCursor}
              onClick={() => {
                if (page?.nextCursor) state.next(page.nextCursor);
              }}
            >
              Sonraki sayfa
            </Button>
          )}
        </nav>
        <p className="plan-attendance__note">
          {canWrite
            ? 'Henüz işaretlenmeyen oyuncular katılmadı olarak sayılmaz.'
            : 'Yalnız kendi katılımınızı görüntüleyebilirsiniz.'}
        </p>
      </div>
    </section>
  );
}
