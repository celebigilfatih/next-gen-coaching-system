import {
  ArrowLeft,
  Check,
  PaperPlaneTilt,
  SealCheck,
  Trash,
  X,
} from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import {
  getDrillContentQueue,
  publishDrillStarterPack,
  transitionDrillContent,
  type DrillContentQueueItem,
  type DrillContentStatus,
} from '../lib/api';
import { getSession } from '../lib/session';
import { DrillEditorialPreview } from '../components/drill-preview';

const statuses: Array<{ value: DrillContentStatus; label: string }> = [
  { value: 'DRAFT', label: 'Taslaklar' },
  { value: 'IN_REVIEW', label: 'İncelemede' },
  { value: 'APPROVED', label: 'Onaylandı' },
  { value: 'PUBLISHED', label: 'Yayında' },
  { value: 'ARCHIVED', label: 'Arşiv' },
];

export function meta() {
  return [{ title: 'Egzersiz İçerik Yönetimi | NGCS' }];
}

export default function LibraryManageRoute() {
  const [status, setStatus] = useState<DrillContentStatus>('DRAFT');
  const [items, setItems] = useState<DrillContentQueueItem[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [comment, setComment] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState('');
  const [revision, setRevision] = useState(0);
  const [loadedKey, setLoadedKey] = useState('');
  const [previewId, setPreviewId] = useState('');
  const principal = getSession()?.user;
  const requestKey = `${status}:${revision}`;
  useEffect(() => {
    let active = true;
    getDrillContentQueue(status)
      .then((page) => {
        if (!active) return;
        setItems(page.items);
        setTotal(page.total);
        setError('');
      })
      .catch((cause) => {
        if (!active) return;
        setError(
          cause instanceof Error
            ? cause.message
            : 'İçerik kuyruğu yüklenemedi.',
        );
      })
      .finally(() => active && setLoadedKey(requestKey));
    return () => {
      active = false;
    };
  }, [requestKey, status]);
  const loading = loadedKey !== requestKey;
  const preview = !loading
    ? items.find((item) => item.id === previewId)
    : undefined;

  async function transition(
    item: DrillContentQueueItem,
    action: 'submit' | 'approve' | 'reject' | 'publish' | 'archive',
  ) {
    setBusy(item.id);
    try {
      await transitionDrillContent(item.id, action, comment[item.id]);
      toast.success('İçerik durumu güncellendi');
      setRevision((current) => current + 1);
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : 'İşlem tamamlanamadı',
      );
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="page-shell library-manage">
      <header className="library-manage__header">
        <div>
          <p className="page-kicker">Global egzersiz kütüphanesi</p>
          <h1>İçerik Yönetimi</h1>
          <p>
            Taslaklar uzman incelemesi ve sistem yöneticisi yayını olmadan
            kataloğa çıkmaz.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/app/library">
            <ArrowLeft /> Kütüphaneye dön
          </Link>
        </Button>
      </header>
      {principal?.role === 'SYSTEM_ADMIN' && status === 'APPROVED' && (
        <div className="drill-choice-summary">
          <p>
            NGCS başlangıç paketinin ilk yayını, 120 egzersizin tamamı bağımsız
            uzman onayı aldıktan sonra birlikte yapılır.
          </p>
          <Button
            disabled={Boolean(busy) || loading}
            onClick={async () => {
              if (busy) return;
              setBusy('starter-pack');
              try {
                await publishDrillStarterPack();
                toast.success('120 egzersizlik başlangıç paketi yayımlandı');
                setRevision((value) => value + 1);
              } catch (cause) {
                toast.error(
                  cause instanceof Error
                    ? cause.message
                    : 'Paket yayımlanamadı.',
                );
              } finally {
                setBusy('');
              }
            }}
          >
            120 egzersizlik paketi yayımla
          </Button>
        </div>
      )}
      <Alert>
        <AlertDescription>
          NGCS başlangıç paketi 120 taslak içerir. Adlandırılmış futbol uzmanı
          hâlâ TBD olduğu için paket otomatik yayınlanmaz.
        </AlertDescription>
      </Alert>
      <Tabs
        value={status}
        onValueChange={(value) => setStatus(value as DrillContentStatus)}
      >
        <TabsList className="library-manage__tabs">
          {statuses.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <p className="library-manage__total">{total} kayıt</p>
      {preview && (
        <DrillEditorialPreview
          key={preview.id}
          version={preview}
          onClose={() => setPreviewId('')}
        />
      )}
      {loading ? (
        <div className="loading-grid">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      ) : error ? (
        <Alert role="alert">
          <AlertDescription>{error}</AlertDescription>
          <Button onClick={() => setRevision((current) => current + 1)}>
            Tekrar dene
          </Button>
        </Alert>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <SealCheck />
          <h2>Bu kuyruk boş</h2>
          <p>Bu durumda bekleyen içerik bulunmuyor.</p>
        </div>
      ) : (
        <div className="library-manage__grid">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="library-manage__title">
                  <CardTitle>{item.title}</CardTitle>
                  <Badge>{statusLabel(item.status)}</Badge>
                </div>
                <p>
                  v{item.version} · {item.objectiveLabel} ·{' '}
                  {item.createdBy?.name ?? 'Yazar TBD'}
                </p>
              </CardHeader>
              <CardContent className="library-manage__content">
                <p>{item.summary}</p>
                <Button variant="outline" onClick={() => setPreviewId(item.id)}>
                  İçeriği ve yaş uyarlamalarını incele
                </Button>
                {item.status === 'IN_REVIEW' &&
                item.createdBy?.id === principal?.id ? (
                  <Alert className="library-manage__review-boundary">
                    <AlertDescription>
                      Bu içerik sizin tarafınızdan oluşturuldu. Bağımsız bir
                      futbol uzmanı incelemeden onaylayamaz veya
                      reddedemezsiniz.
                    </AlertDescription>
                  </Alert>
                ) : null}
                {item.status === 'IN_REVIEW' &&
                item.createdBy?.id !== principal?.id ? (
                  <Textarea
                    aria-label={`${item.title} inceleme notu`}
                    value={comment[item.id] ?? ''}
                    placeholder="Onay notu veya zorunlu red gerekçesi"
                    onChange={(event) =>
                      setComment((current) => ({
                        ...current,
                        [item.id]: event.target.value,
                      }))
                    }
                  />
                ) : null}
                <div className="library-manage__actions">
                  {item.status === 'DRAFT' ? (
                    <Button
                      disabled={busy === item.id}
                      onClick={() => void transition(item, 'submit')}
                    >
                      <PaperPlaneTilt /> İncelemeye gönder
                    </Button>
                  ) : null}
                  {item.status === 'IN_REVIEW' ? (
                    <>
                      <Button
                        disabled={
                          busy === item.id ||
                          item.createdBy?.id === principal?.id
                        }
                        title={
                          item.createdBy?.id === principal?.id
                            ? 'Yazar kendi içeriğini onaylayamaz'
                            : undefined
                        }
                        onClick={() => void transition(item, 'approve')}
                      >
                        <Check /> Onayla
                      </Button>
                      <Button
                        variant="destructive"
                        disabled={
                          busy === item.id ||
                          item.createdBy?.id === principal?.id ||
                          !comment[item.id]?.trim()
                        }
                        title={
                          item.createdBy?.id === principal?.id
                            ? 'Yazar kendi içeriğini inceleyemez'
                            : undefined
                        }
                        onClick={() => void transition(item, 'reject')}
                      >
                        <X /> Reddet
                      </Button>
                    </>
                  ) : null}
                  {item.status === 'APPROVED' &&
                  principal?.role === 'SYSTEM_ADMIN' ? (
                    <Button
                      disabled={
                        Boolean(busy) ||
                        (item.drillId.startsWith('ngcs-starter-v1-') &&
                          item.version === 1)
                      }
                      title={
                        item.drillId.startsWith('ngcs-starter-v1-') &&
                        item.version === 1
                          ? 'Başlangıç paketi 120 egzersiz birlikte yayımlanır'
                          : undefined
                      }
                      onClick={() => void transition(item, 'publish')}
                    >
                      <SealCheck /> Yayınla
                    </Button>
                  ) : null}
                  {item.status === 'PUBLISHED' &&
                  principal?.role === 'SYSTEM_ADMIN' ? (
                    <Button
                      variant="destructive"
                      disabled={busy === item.id}
                      onClick={() => void transition(item, 'archive')}
                    >
                      <Trash /> Arşivle
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function statusLabel(status: DrillContentStatus) {
  return {
    DRAFT: 'Taslak',
    IN_REVIEW: 'İncelemede',
    APPROVED: 'Onaylandı',
    PUBLISHED: 'Yayında',
    ARCHIVED: 'Arşiv',
  }[status];
}
