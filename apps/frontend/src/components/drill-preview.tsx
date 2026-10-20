import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  getDrillContent,
  type DrillContentDetail,
  type DrillCatalogItem,
  type PlanDrillContentSnapshot,
} from '../lib/api';
import { TacticalBoardEditor } from './tactics/tactical-board-editor';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import '../styles/drill-preview-workspace.css';

export function DrillInstructions({
  content,
}: {
  content: Pick<
    PlanDrillContentSnapshot,
    | 'organization'
    | 'steps'
    | 'coachingPoints'
    | 'rules'
    | 'variantCoachingPoints'
    | 'progressions'
    | 'regressions'
  >;
}) {
  return (
    <div className="drill-instructions">
      <section>
        <h3>Organizasyon</h3>
        <p>{content.organization}</p>
      </section>
      {(
        [
          ['Uygulama', content.steps],
          ['Koçluk noktaları', content.coachingPoints],
          [
            'Yaş uyarlaması',
            [...content.rules, ...content.variantCoachingPoints],
          ],
          ['İlerletme', content.progressions],
          ['Kolaylaştırma', content.regressions],
        ] as const
      ).map(([title, items]) => (
        <section key={title}>
          <h3>{title}</h3>
          <ol>
            {items.map((text, index) => (
              <li key={index}>{text}</li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

export function DrillPreview({
  drillId,
  ageGroup,
  onClose,
  catalogItem,
  detailHref,
  returnFocusId,
}: {
  drillId: string;
  ageGroup?: string;
  onClose: () => void;
  catalogItem?: DrillCatalogItem;
  detailHref?: string;
  returnFocusId?: string;
}) {
  const [result, setResult] = useState<{
    detail?: DrillContentDetail;
    error?: string;
  }>();
  useEffect(() => {
    let active = true;
    getDrillContent(drillId, ageGroup)
      .then((detail) => {
        if (active) setResult({ detail });
      })
      .catch((cause: unknown) => {
        if (active)
          setResult({
            error:
              cause instanceof Error ? cause.message : 'İçerik yüklenemedi.',
          });
      });
    return () => {
      active = false;
    };
  }, [drillId, ageGroup]);
  const version = result?.detail?.version;
  const variant = result?.detail?.variant;
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="drill-preview-dialog drill-preview-workspace"
        onCloseAutoFocus={(event) => {
          const trigger = returnFocusId
            ? document.getElementById(returnFocusId)
            : null;
          if (trigger) {
            event.preventDefault();
            trigger.focus();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {version?.title ?? catalogItem?.title ?? 'Egzersiz önizlemesi'}
          </DialogTitle>
          <DialogDescription>
            Çalışmanın uygulamasını ve seçilen yaş uyarlamasını inceleyin.
          </DialogDescription>
        </DialogHeader>
        <div className="drill-preview-scroll">
          {!result ? (
            <p role="status">İçerik yükleniyor…</p>
          ) : result.error ? (
            <p role="alert">{result.error}</p>
          ) : !version ? (
            <>
              {catalogItem && (
                <p>
                  {catalogItem.ageGroup === 'SENIOR'
                    ? 'A Takım'
                    : catalogItem.ageGroup}{' '}
                  · {catalogItem.durationMin} dk
                </p>
              )}
              <p>{catalogItem?.summary || catalogItem?.equipment}</p>
              <p>
                Bu egzersizin ayrıntılı uygulama ve yaş uyarlaması henüz
                eklenmemiş. Kayıtlı bilgilerle plana ekleyebilirsiniz.
              </p>
            </>
          ) : (
            <>
              <p>
                Seçilen uyarlama:{' '}
                {variant?.ageGroup === 'SENIOR'
                  ? 'A Takım'
                  : (variant?.ageGroup ?? 'Yaş uyarlaması yok')}{' '}
                · {variant?.durationMin ?? version.durationMin} dk
                {(variant?.playerMin ?? version.playerMin) && (
                  <>
                    {' '}
                    · {variant?.playerMin ?? version.playerMin}–
                    {variant?.playerMax ?? version.playerMax} oyuncu
                  </>
                )}
                {(variant?.areaLengthM ?? version.areaLengthM) && (
                  <>
                    {' '}
                    · {variant?.areaLengthM ?? version.areaLengthM}×
                    {variant?.areaWidthM ?? version.areaWidthM} m
                  </>
                )}
              </p>
              {!variant && (
                <p role="alert">
                  Bu takım yaşı için yayınlanmış uyarlama bulunmuyor.
                </p>
              )}
              <Tabs defaultValue="instructions" className="drill-preview-tabs">
                <TabsList aria-label="Önizleme görünümü">
                  <TabsTrigger value="instructions">Uygulama</TabsTrigger>
                  <TabsTrigger value="pitch">Saha</TabsTrigger>
                </TabsList>
                <TabsContent value="instructions">
                  <p className="drill-preview-summary">{version.summary}</p>
                  <DrillInstructions
                    content={{
                      ...version,
                      rules: variant?.rules ?? [],
                      variantCoachingPoints: variant?.coachingPoints ?? [],
                    }}
                  />
                  <p>{version.safetyNotes}</p>
                  <p>Ekipman: {version.equipmentItems.join(', ')}</p>
                </TabsContent>
                <TabsContent value="pitch">
                  {version.boardDocument ? (
                    <TacticalBoardEditor
                      key={version.id}
                      initialDocument={version.boardDocument}
                      initiallySaved
                      readOnly
                    />
                  ) : (
                    <p>Bu egzersize ait saha çizimi bulunmuyor.</p>
                  )}
                </TabsContent>
              </Tabs>
              <p>
                Kaynak: {version.source.title} · {version.source.license}
                {version.source.attribution
                  ? ` · ${version.source.attribution}`
                  : ''}
              </p>
            </>
          )}
        </div>
        <footer className="drill-preview-footer">
          <Button type="button" variant="outline" onClick={onClose}>
            Önizlemeyi kapat
          </Button>
          {detailHref && (
            <Button asChild>
              <Link to={detailHref}>Egzersiz detayını aç</Link>
            </Button>
          )}
        </footer>
      </DialogContent>
    </Dialog>
  );
}

export function DrillEditorialPreview({
  version,
  onClose,
}: {
  version: NonNullable<DrillContentDetail['version']>;
  onClose: () => void;
}) {
  const [age, setAge] = useState(version.ageVariants[0]?.ageGroup ?? '');
  const variant = version.ageVariants.find((item) => item.ageGroup === age);
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="drill-preview-dialog">
        <DialogHeader>
          <DialogTitle>{version.title}</DialogTitle>
          <DialogDescription>
            Sportif inceleme: organizasyonu, kuralları, süreyi, oyuncu sayısını,
            alanı ve çizimin çalışmayla eşleşmesini kontrol edin.
          </DialogDescription>
        </DialogHeader>
        <p>{version.summary}</p>
        <label>
          İncelenen yaş
          <select
            aria-label="İncelenen yaş"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          >
            {version.ageVariants.map((item) => (
              <option key={item.ageGroup} value={item.ageGroup}>
                {item.ageGroup === 'SENIOR' ? 'A Takım' : item.ageGroup}
              </option>
            ))}
          </select>
        </label>
        <p>
          {variant?.durationMin ?? version.durationMin} dk ·{' '}
          {variant?.playerMin ?? version.playerMin}–
          {variant?.playerMax ?? version.playerMax} oyuncu ·{' '}
          {variant?.areaLengthM ?? version.areaLengthM}×
          {variant?.areaWidthM ?? version.areaWidthM} m ·{' '}
          {version.equipmentItems.join(', ')}
        </p>
        <DrillInstructions
          content={{
            ...version,
            rules: variant?.rules ?? [],
            variantCoachingPoints: variant?.coachingPoints ?? [],
          }}
        />
        {version.boardDocument && (
          <TacticalBoardEditor
            key={version.id}
            initialDocument={version.boardDocument}
            initiallySaved
            readOnly
          />
        )}
        <p>{version.safetyNotes}</p>
        <p>
          Kaynak: {version.source.title} · {version.source.license}
        </p>
        <Button variant="outline" onClick={onClose}>
          İncelemeyi kapat
        </Button>
      </DialogContent>
    </Dialog>
  );
}
