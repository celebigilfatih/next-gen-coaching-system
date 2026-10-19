import {
  ArrowLeft,
  Books,
  Clock,
  Copy,
  Ruler,
  ShieldCheck,
  Strategy,
  Users,
} from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { TacticalBoardEditor } from '../components/tactics/tactical-board-editor';
import { PageHero } from '../components/presentation/page-hero';
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
import { getDrillContent, type DrillContentDetail } from '../lib/api';
import { useWorkspace } from '../lib/workspace-context';
import teamsHero from '../assets/teams-hero.png';

export function meta() {
  return [{ title: 'Egzersiz Detayı | NGCS' }];
}

export default function LibraryDetailRoute() {
  const { drillId = '' } = useParams();
  const { group } = useWorkspace();
  const requestKey = `${drillId}:${group?.ageGroup ?? ''}`;
  const [result, setResult] = useState<{
    key: string;
    detail?: DrillContentDetail;
    error: string;
  }>({ key: '', error: '' });
  useEffect(() => {
    let active = true;
    getDrillContent(drillId, group?.ageGroup)
      .then(
        (detail) => active && setResult({ key: requestKey, detail, error: '' }),
      )
      .catch(
        (cause) =>
          active &&
          setResult({
            key: requestKey,
            error:
              cause instanceof Error ? cause.message : 'Egzersiz yüklenemedi.',
          }),
      );
    return () => {
      active = false;
    };
  }, [drillId, group?.ageGroup, requestKey]);

  const loading = result.key !== requestKey;
  const { detail, error } = result;

  if (loading)
    return (
      <div className="page-shell">
        <Skeleton className="h-56" />
        <Skeleton className="h-96" />
      </div>
    );
  if (error || !detail)
    return (
      <div className="page-shell">
        <Alert role="alert">
          <AlertDescription>{error || 'Egzersiz bulunamadı.'}</AlertDescription>
          <Button asChild variant="outline">
            <Link to="/app/library">Kütüphaneye dön</Link>
          </Button>
        </Alert>
      </div>
    );

  const version = detail.version;
  if (!version)
    return (
      <div className="page-shell">
        <Alert>
          <AlertDescription>
            Bu eski kaydın profesyonel içerik ayrıntıları henüz doğrulanmadı.
          </AlertDescription>
          <Button asChild variant="outline">
            <Link to="/app/library">Kütüphaneye dön</Link>
          </Button>
        </Alert>
      </div>
    );
  const variant = detail.variant;
  return (
    <div className="page-shell library-detail">
      <PageHero
        image={teamsHero}
        eyebrow="Egzersiz detayı"
        title={version.title}
        description={version.summary}
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/app/library">
                <ArrowLeft /> Kütüphaneye dön
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/app/trainings">
                <Books /> Antrenmana ekle
              </Link>
            </Button>
            <Button asChild>
              <Link to={`/app/tactics/${detail.drill.id}`}>
                <Copy /> Kopyala ve düzenle
              </Link>
            </Button>
          </>
        }
      />
      <section className="library-detail__facts" aria-label="Egzersiz özeti">
        <Fact
          icon={Clock}
          label="Süre"
          value={`${variant?.durationMin ?? version.durationMin} dk`}
        />
        <Fact
          icon={Users}
          label="Oyuncu"
          value={playerRange(variant?.playerMin, variant?.playerMax)}
        />
        <Fact
          icon={Ruler}
          label="Alan"
          value={area(variant?.areaLengthM, variant?.areaWidthM)}
        />
        <Fact icon={Strategy} label="Amaç" value={version.objectiveLabel} />
        <Fact
          icon={ShieldCheck}
          label="Kaynak"
          value={sourceLabel(version.source.license)}
        />
      </section>
      <div className="library-detail__grid">
        <div className="library-detail__main">
          <ContentCard title="Organizasyon">
            <p>{version.organization}</p>
          </ContentCard>
          <ContentList title="Uygulama" items={version.steps} />
          <ContentList
            title="Koçluk noktaları"
            items={version.coachingPoints}
          />
          <div className="library-detail__split">
            <ContentList title="İlerletme" items={version.progressions} />
            <ContentList title="Kolaylaştırma" items={version.regressions} />
          </div>
          {variant ? (
            <ContentList
              title={`${variant.ageGroup === 'SENIOR' ? 'A Takım' : variant.ageGroup} varyantı`}
              items={[...variant.rules, ...variant.coachingPoints]}
            />
          ) : null}
        </div>
        <aside className="library-detail__aside">
          <Card>
            <CardHeader>
              <CardTitle>Saha yerleşimi</CardTitle>
            </CardHeader>
            <CardContent>
              {version.boardDocument ? (
                <TacticalBoardEditor
                  initialDocument={version.boardDocument}
                  initiallySaved
                  readOnly
                />
              ) : (
                <p>Bu egzersiz için saha yerleşimi bulunmuyor.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Kaynak ve kullanım</CardTitle>
            </CardHeader>
            <CardContent className="library-detail__source">
              <Badge>{sourceLabel(version.source.license)}</Badge>
              <strong>{version.source.title}</strong>
              {version.source.author ? (
                <p>Yazar: {version.source.author}</p>
              ) : null}
              {version.source.attribution ? (
                <p>{version.source.attribution}</p>
              ) : null}
              {version.source.changes ? (
                <p>Uyarlama: {version.source.changes}</p>
              ) : null}
              {version.source.sourceUrl ? (
                <a
                  href={version.source.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Özgün kaynağı aç
                </a>
              ) : null}
              {version.safetyNotes ? <p>{version.safetyNotes}</p> : null}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="library-detail__fact">
        <Icon aria-hidden="true" />
        <span>{label}</span>
        <strong>{value}</strong>
      </CardContent>
    </Card>
  );
}

function ContentCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ContentList({ title, items }: { title: string; items: string[] }) {
  return (
    <ContentCard title={title}>
      <ol className="library-detail__list">
        {items.map((item, index) => (
          <li key={`${index}-${item}`}>{item}</li>
        ))}
      </ol>
    </ContentCard>
  );
}

function playerRange(min?: number | null, max?: number | null) {
  return min && max ? `${min}–${max}` : 'TBD';
}
function area(length?: number | null, width?: number | null) {
  return length && width ? `${length}×${width} m` : 'TBD';
}
function sourceLabel(license: string) {
  return (
    {
      NGCS_PROPRIETARY: 'NGCS özgün',
      CC0: 'CC0',
      CC_BY_4_0: 'CC BY 4.0',
      LEGACY_UNVERIFIED: 'Kaynak doğrulanmadı',
    }[license] ?? license
  );
}
