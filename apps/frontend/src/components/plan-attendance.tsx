import { CheckCircle, UsersThree } from '@phosphor-icons/react';
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
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';

export function PlanAttendance({ planId }: { planId: string }) {
  const load = useCallback(
    (after?: string) => getPlanAttendancePage(planId, after),
    [planId],
  );
  const state = useAssignmentPage(load);
  const [busy, setBusy] = useState(false);
  const [writeError, setWriteError] = useState('');
  const locked = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const canWrite = ['SYSTEM_ADMIN', 'CLUB_ADMIN', 'COACH'].includes(
    getSession()?.user.role ?? '',
  );
  async function toggle(item: PlanAttendancePage['items'][number]) {
    if (locked.current || !canWrite || state.loading || writeError) return;
    locked.current = true;
    setBusy(true);
    try {
      await markAttendance({
        planId,
        playerId: item.playerId,
        status: item.status === 'PRESENT' ? 'ABSENT' : 'PRESENT',
      });
      if (mounted.current) {
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
      if (mounted.current) setBusy(false);
    }
  }
  const page = state.data;
  return (
    <Card className="plan-attendance-reference">
      <CardHeader>
        <CardTitle>
          <UsersThree /> Katılım ·{' '}
          {page ? `${page.presentTotal}/${page.total}` : '—'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <nav
          aria-label="Katılım sayfaları"
          className="flex flex-wrap items-center gap-3 pb-4"
        >
          <Button
            variant="outline"
            disabled={busy || state.loading || state.pageNumber === 1}
            onClick={state.previous}
          >
            Önceki sayfa
          </Button>
          <span role="status">
            Sayfa {state.pageNumber}
            {page ? ` · ${page.items.length} / ${page.total} oyuncu` : ''}
          </span>
          <Button
            variant="outline"
            disabled={busy || state.loading || !page?.nextCursor}
            onClick={() => {
              if (page?.nextCursor) state.next(page.nextCursor);
            }}
          >
            Sonraki sayfa
          </Button>
        </nav>
        {writeError && (
          <Alert role="alert">
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
          <div role="status" aria-label="Katılım yükleniyor">
            <Skeleton className="h-32" />
          </div>
        ) : state.error ? (
          <Alert role="alert">
            <AlertDescription>{state.error}</AlertDescription>
            <Button onClick={state.retry}>Katılımı tekrar yükle</Button>
          </Alert>
        ) : page?.items.length ? (
          <div className="attendance-grid">
            {page.items.map((item) => (
              <Button
                key={item.id}
                variant={item.status === 'PRESENT' ? 'default' : 'outline'}
                aria-pressed={item.status === 'PRESENT'}
                disabled={!canWrite || busy || Boolean(writeError)}
                onClick={() => void toggle(item)}
              >
                <CheckCircle
                  weight={item.status === 'PRESENT' ? 'fill' : 'regular'}
                />
                {item.name}
              </Button>
            ))}
          </div>
        ) : (
          <p>
            {page?.total === 0
              ? 'Takım oyuncusu bulunamadı.'
              : 'Bu sayfada oyuncu yok; önceki sayfaya dönebilirsiniz.'}
          </p>
        )}
        {!canWrite && <p>Yalnız kendi katılımınızı görüntüleyebilirsiniz.</p>}
      </CardContent>
    </Card>
  );
}
