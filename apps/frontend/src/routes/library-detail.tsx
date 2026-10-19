import {
  ArrowLeft,
  Books,
  Clock,
  Copy,
  Ruler,
  Users,
} from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { TacticalBoardEditor } from '../components/tactics/tactical-board-editor';
import { AddDrillToPlanDialog } from '../components/add-drill-to-plan-dialog';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import { getDrillContent, type DrillContentDetail } from '../lib/api';
import { useWorkspace } from '../lib/workspace-context';
import { getSession } from '../lib/session';
import '../styles/library-detail-workspace.css';

export function meta() {
  return [{ title: 'Egzersiz Detayı | NGCS' }];
}

export default function LibraryDetailRoute() {
  const { drillId = '' } = useParams();
  const workspace = useWorkspace();
  const {
    group,
    scope,
    loading: scopeLoading,
    error: scopeError,
    reload,
  } = workspace;
  const [revision, setRevision] = useState(0);
  const requestKey = JSON.stringify([
    drillId,
    group?.id,
    group?.ageGroup,
    scope,
    revision,
  ]);
  const [result, setResult] = useState<{
    key: string;
    detail?: DrillContentDetail;
    error?: string;
  }>();
  useEffect(() => {
    if (scopeLoading || scopeError) return;
    let active = true;
    getDrillContent(drillId, group?.ageGroup)
      .then((detail) => {
        if (active) setResult({ key: requestKey, detail });
      })
      .catch((cause: unknown) => {
        if (active)
          setResult({
            key: requestKey,
            error:
              cause instanceof Error ? cause.message : 'Egzersiz yüklenemedi.',
          });
      });
    return () => {
      active = false;
    };
  }, [drillId, group?.ageGroup, requestKey, scopeLoading, scopeError]);
  if (scopeError)
    return (
      <DetailState>
        <Alert role="alert">
          <AlertDescription>{scopeError}</AlertDescription>
          <Button onClick={() => void reload()}>Tekrar dene</Button>
        </Alert>
      </DetailState>
    );
  if (scopeLoading || result?.key !== requestKey)
    return (
      <DetailState>
        <div role="status" aria-label="Egzersiz yükleniyor">
          <Skeleton className="h-56" />
          <Skeleton className="h-96" />
        </div>
      </DetailState>
    );
  if (result.error || !result.detail)
    return (
      <DetailState>
        <Alert role="alert">
          <AlertDescription>
            {result.error || 'Egzersiz bulunamadı.'}
          </AlertDescription>
          <Button onClick={() => setRevision((value) => value + 1)}>
            Tekrar dene
          </Button>
        </Alert>
      </DetailState>
    );
  if (!result.detail.version)
    return (
      <DetailState>
        <Alert>
          <AlertDescription>
            Bu eski kaydın profesyonel içerik ayrıntıları henüz doğrulanmadı.
          </AlertDescription>
        </Alert>
      </DetailState>
    );
  return (
    <ExerciseContent
      key={requestKey}
      detail={result.detail}
      workspace={workspace}
    />
  );
}
function BackLink() {
  return (
    <Link className="exercise-detail-back" to="/app/library">
      <ArrowLeft /> Kütüphaneye dön
    </Link>
  );
}
function DetailState({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-shell exercise-detail-workspace">
      <BackLink />
      {children}
    </div>
  );
}

function ExerciseContent({
  detail,
  workspace,
}: {
  detail: DrillContentDetail;
  workspace: ReturnType<typeof useWorkspace>;
}) {
  const [adding, setAdding] = useState(false);
  const addTrigger = useRef<HTMLButtonElement>(null);
  const { group, scope, season } = workspace;
  const version = detail.version!;
  const variant = detail.variant;
  const canAdd = Boolean(
    group && variant && getSession()?.user.role !== 'PLAYER',
  );
  return (
    <div className="page-shell exercise-detail-workspace">
      <header className="exercise-detail-heading">
        <BackLink />
        <div className="exercise-detail-heading-row">
          <div>
            <p className="exercise-detail-kicker">
              Egzersiz detayı · {group?.name ?? 'Takım seçilmedi'}
            </p>
            <h1>{version.title}</h1>
            <div className="exercise-detail-labels">
              <Badge variant="secondary">{phaseLabel(version.category)}</Badge>
              <span>{difficultyLabel(version.difficulty)}</span>
              <span>{sourceLabel(version.source.license)}</span>
            </div>
          </div>
          <div className="exercise-detail-actions">
            <Button
              ref={addTrigger}
              id="exercise-add-to-plan"
              aria-haspopup="dialog"
              aria-expanded={adding}
              disabled={!canAdd}
              onClick={() => setAdding(true)}
            >
              <Books /> Antrenmana ekle
            </Button>
            <Button asChild variant="outline">
              <Link to={'/app/tactics/' + detail.drill.id}>
                <Copy /> Kopyala ve düzenle
              </Link>
            </Button>
          </div>
        </div>
      </header>
      {adding && group && variant && (
        <AddDrillToPlanDialog
          groupId={group.id}
          clubId={scope.clubId}
          groupName={group.name}
          seasonId={season?.id}
          drillId={detail.drill.id}
          expectedVersionId={version.id}
          phase={version.category}
          onClose={() => {
            setAdding(false);
            window.requestAnimationFrame(() => addTrigger.current?.focus());
          }}
        />
      )}
      {!variant && (
        <Alert>
          <AlertDescription>
            Bu takım yaşı için yayınlanmış uyarlama bulunmuyor. Bu çalışma
            mevcut takıma eklenemez.
          </AlertDescription>
        </Alert>
      )}
      <section className="exercise-detail-summary" aria-label="Egzersiz özeti">
        <dl>
          <Fact
            icon={Clock}
            label={variant ? 'Süre' : 'Temel süre'}
            value={(variant?.durationMin ?? version.durationMin) + ' dk'}
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
          <Fact
            label="Uyarlama"
            value={variant ? ageLabel(variant.ageGroup) : 'Bulunmuyor'}
          />
        </dl>
      </section>
      <Tabs defaultValue="application" className="exercise-detail-panel">
        <div className="exercise-detail-panel-heading">
          <h2>Çalışma rehberi</h2>
          <TabsList aria-label="Egzersiz görünümü">
            <TabsTrigger value="application">Uygulama</TabsTrigger>
            <TabsTrigger value="pitch">Saha</TabsTrigger>
            <TabsTrigger value="source">Kaynak</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent
          value="application"
          className="exercise-detail-application"
        >
          <div className="exercise-detail-instructions">
            <section className="exercise-detail-purpose">
              <p className="exercise-detail-kicker">Çalışmanın amacı</p>
              <h3>{version.objectiveLabel}</h3>
              <details className="exercise-detail-description">
                <summary>Egzersiz açıklaması</summary>
                <p>{version.summary}</p>
              </details>
            </section>
            <section className="exercise-detail-organization">
              <h3>Organizasyon</h3>
              <p>{version.organization}</p>
              <p className="exercise-detail-equipment">
                <strong>Ekipman:</strong>{' '}
                {version.equipmentItems.length
                  ? version.equipmentItems.join(', ')
                  : 'Ekipman belirtilmedi.'}
              </p>
            </section>
            <section>
              <h3>Uygulama adımları</h3>
              {version.steps.length ? (
                <ol
                  className="exercise-detail-steps"
                  aria-label="Uygulama adımları"
                >
                  {version.steps.map((step, index) => (
                    <li role="listitem" key={index}>
                      <span aria-hidden="true">{index + 1}</span>
                      <p>{step}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p>Uygulama adımı belirtilmedi.</p>
              )}
            </section>
          </div>
          <aside
            className="exercise-detail-coaching"
            aria-label="Antrenör rehberi"
          >
            {variant && (
              <section className="exercise-detail-variant">
                <h3>{ageLabel(variant.ageGroup)} uyarlaması</h3>
                <p className="exercise-detail-muted">
                  Seçili takım yaşı için yayınlanan kurallar
                </p>
                <ContentList
                  items={[...variant.rules, ...variant.coachingPoints]}
                />
              </section>
            )}
            <ContentDisclosure
              title="Koçluk noktaları"
              items={version.coachingPoints}
              initiallyOpen
            />
            {version.constraints.length > 0 && (
              <ContentDisclosure
                title="Uygulama kuralları"
                items={version.constraints}
              />
            )}
            <ContentDisclosure title="İlerletme" items={version.progressions} />
            <ContentDisclosure
              title="Kolaylaştırma"
              items={version.regressions}
            />
            {version.safetyNotes && (
              <section className="exercise-detail-safety">
                <h3>Saha ve uygulama notu</h3>
                <p>{version.safetyNotes}</p>
              </section>
            )}
          </aside>
        </TabsContent>
        <TabsContent value="pitch" className="exercise-detail-pitch">
          <div className="exercise-detail-pitch-intro">
            <h3>Saha önizlemesi</h3>
            <p>
              Yerleşimi inceleyin; daha geniş görünüm için odak modunu açın.
            </p>
          </div>
          {version.boardDocument ? (
            <TacticalBoardEditor
              key={version.id}
              initialDocument={version.boardDocument}
              initiallySaved
              readOnly
            />
          ) : (
            <p>Bu egzersiz için saha yerleşimi bulunmuyor.</p>
          )}
        </TabsContent>
        <TabsContent value="source" className="exercise-detail-source">
          <section>
            <h3>Kaynak ve kullanım</h3>
            <Badge variant="secondary">
              {sourceLabel(version.source.license)}
            </Badge>
            <h4>{version.source.title}</h4>
            {version.source.author && <p>Yazar: {version.source.author}</p>}
            {version.source.attribution && <p>{version.source.attribution}</p>}
            {version.source.changes && (
              <p>Uyarlama: {version.source.changes}</p>
            )}
            {version.source.sourceUrl && (
              <a
                href={version.source.sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                Özgün kaynağı aç
              </a>
            )}
          </section>
          {version.safetyNotes && (
            <section>
              <h3>Saha ve uygulama notu</h3>
              <p>{version.safetyNotes}</p>
            </section>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt>
        {Icon && <Icon aria-hidden="true" />}
        {label}
      </dt>
      <dd>{value}</dd>
    </div>
  );
}
function ContentList({ items }: { items: string[] }) {
  return items.length ? (
    <ul className="exercise-detail-points">
      {items.map((text, index) => (
        <li key={index}>{text}</li>
      ))}
    </ul>
  ) : (
    <p className="exercise-detail-muted">Ek not belirtilmedi.</p>
  );
}
function ContentDisclosure({
  title,
  items,
  initiallyOpen = false,
}: {
  title: string;
  items: string[];
  initiallyOpen?: boolean;
}) {
  return (
    <details className="exercise-detail-disclosure" open={initiallyOpen}>
      <summary>{title}</summary>
      <ContentList items={items} />
    </details>
  );
}
function playerRange(min?: number | null, max?: number | null) {
  return min && max ? min + '–' + max : 'Belirtilmedi';
}
function area(length?: number | null, width?: number | null) {
  return length && width ? length + '×' + width + ' m' : 'Belirtilmedi';
}
function ageLabel(age: string) {
  return age === 'SENIOR' ? 'A Takım' : age;
}
function phaseLabel(value: string) {
  return (
    {
      WARM_UP: 'Isınma',
      TECHNICAL: 'Teknik',
      TACTICAL: 'Taktik',
      COOL_DOWN: 'Soğuma',
    }[value] ?? value
  );
}
function difficultyLabel(value: string) {
  return { EASY: 'Başlangıç', MEDIUM: 'Orta', HARD: 'İleri' }[value] ?? value;
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
