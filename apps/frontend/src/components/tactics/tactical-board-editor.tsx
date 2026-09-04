import {
  ArrowBendUpRight,
  ArrowRight,
  ArrowsClockwise,
  Circle,
  Copy,
  DownloadSimple,
  Flag,
  FloppyDisk,
  GridFour,
  PersonSimpleRun,
  SoccerBall,
  TextT,
  Trash,
  UploadSimple,
} from '@phosphor-icons/react';
import Konva from 'konva';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Arrow,
  Circle as KCircle,
  Group,
  Layer,
  Line,
  Rect,
  Stage,
  Text,
  Transformer,
} from 'react-konva';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  emptyBoard,
  formationElements,
  formations,
  id,
  pitchConfigs,
  validateBoard,
  type BoardElement,
  type BoardElementType,
  type PitchType,
  type TacticalBoardDocumentV1,
  type Team,
} from '../../lib/tactical-board';

type Props = {
  initialDocument?: TacticalBoardDocumentV1 | null;
  onSave?: (document: TacticalBoardDocumentV1) => Promise<void> | void;
  readOnly?: boolean;
};

const tools: Array<{
  type: BoardElementType;
  label: string;
  icon?: typeof Circle;
  patch?: Partial<BoardElement>;
}> = [
  {
    type: 'player',
    label: 'Oyuncu',
    icon: PersonSimpleRun,
    patch: { team: 'home', number: '8', radius: 24 },
  },
  {
    type: 'goalkeeper',
    label: 'Kaleci',
    patch: { team: 'home', number: '1', size: 34 },
  },
  { type: 'ball', label: 'Top', icon: SoccerBall, patch: { radius: 12 } },
  { type: 'cone', label: 'Koni', patch: { color: '#f59e0b', size: 24 } },
  { type: 'goal', label: 'Kale', patch: { size: 'large' } },
  {
    type: 'flag',
    label: 'Bayrak',
    icon: Flag,
    patch: { color: '#f59e0b', height: 60 },
  },
  { type: 'wall', label: 'Baraj', patch: { width: 130 } },
  { type: 'ladder', label: 'Merdiven', patch: { length: 140, rungs: 6 } },
  {
    type: 'marker',
    label: 'İşaret',
    patch: { shape: 'circle', color: '#facc15', size: 24 },
  },
  {
    type: 'arrow',
    label: 'Düz ok',
    icon: ArrowRight,
    patch: {
      endX: 720,
      endY: 400,
      color: '#ffffff',
      thickness: 5,
      style: 'straight',
    },
  },
  {
    type: 'arrow',
    label: 'Kavisli ok',
    icon: ArrowBendUpRight,
    patch: {
      endX: 720,
      endY: 320,
      color: '#ffffff',
      thickness: 5,
      style: 'curved',
    },
  },
  {
    type: 'arrow',
    label: 'Kesikli ok',
    patch: {
      endX: 720,
      endY: 400,
      color: '#facc15',
      thickness: 5,
      style: 'dashed',
    },
  },
  {
    type: 'line',
    label: 'Çizgi',
    patch: {
      points: [0, 0, 140, 0],
      color: '#ffffff',
      thickness: 4,
      style: 'solid',
    },
  },
  {
    type: 'zone',
    label: 'Bölge',
    patch: { width: 180, height: 120, color: '#38bdf8', opacity: 0.25 },
  },
  {
    type: 'text',
    label: 'Metin',
    icon: TextT,
    patch: { text: 'Taktik notu', fontSize: 26, color: '#ffffff' },
  },
];

export function TacticalBoardEditor({
  initialDocument,
  onSave,
  readOnly = false,
}: Props) {
  const seed = useMemo(
    () => initialDocument ?? emptyBoard(),
    [initialDocument],
  );
  const [history, setHistory] = useState<TacticalBoardDocumentV1[]>([seed]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const document = history[historyIndex];
  const [saved, setSaved] = useState(JSON.stringify(seed));
  const [selectedId, setSelectedId] = useState<string>();
  const [gridSnap, setGridSnap] = useState(true);
  const [formation, setFormation] =
    useState<(typeof formations)[number]>('4-3-3');
  const [clearOpen, setClearOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const [containerWidth, setContainerWidth] = useState(900);
  const dirty = JSON.stringify(document) !== saved;

  const commit = useCallback(
    (next: TacticalBoardDocumentV1) => {
      setHistory((current) =>
        [
          ...current.slice(Math.max(0, historyIndex - 49), historyIndex + 1),
          next,
        ].slice(-51),
      );
      setHistoryIndex((current) => Math.min(current + 1, 50));
    },
    [historyIndex],
  );

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) =>
      setContainerWidth(entry.contentRect.width),
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const transformer = transformerRef.current;
    const stage = stageRef.current;
    if (!transformer || !stage) return;
    const node = selectedId ? stage.findOne(`#${selectedId}`) : undefined;
    transformer.nodes(node ? [node] : []);
    transformer.getLayer()?.batchDraw();
  }, [selectedId, document]);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [dirty]);

  const updateElement = useCallback(
    (elementId: string, patch: Partial<BoardElement>) => {
      commit({
        ...document,
        elements: document.elements.map((element) =>
          element.id === elementId ? { ...element, ...patch } : element,
        ),
      });
    },
    [commit, document],
  );

  const removeSelected = useCallback(() => {
    if (!selectedId || readOnly) return;
    commit({
      ...document,
      elements: document.elements.filter(
        (element) => element.id !== selectedId,
      ),
    });
    setSelectedId(undefined);
  }, [commit, document, readOnly, selectedId]);

  const duplicateSelected = useCallback(() => {
    const source = document.elements.find(
      (element) => element.id === selectedId,
    );
    if (!source || readOnly || document.elements.length >= 250) return;
    const copy = {
      ...source,
      id: id(),
      x: Math.min(document.pitch.width, source.x + 24),
      y: Math.min(document.pitch.height, source.y + 24),
    };
    commit({ ...document, elements: [...document.elements, copy] });
    setSelectedId(copy.id);
  }, [commit, document, readOnly, selectedId]);

  const undo = useCallback(
    () => setHistoryIndex((current) => Math.max(0, current - 1)),
    [],
  );
  const redo = useCallback(
    () =>
      setHistoryIndex((current) => Math.min(history.length - 1, current + 1)),
    [history.length],
  );

  const save = useCallback(async () => {
    try {
      const valid = validateBoard(document);
      await onSave?.(valid);
      setSaved(JSON.stringify(valid));
      toast.success('Taktik tahtası kaydedildi');
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : 'Tahta kaydedilemedi.',
      );
    }
  }, [document, onSave]);

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches('input, textarea, select, [contenteditable="true"]'))
        return;
      const command = event.metaKey || event.ctrlKey;
      if (command && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      }
      if (command && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        redo();
      }
      if (command && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        duplicateSelected();
      }
      if (command && event.key.toLowerCase() === 's') {
        event.preventDefault();
        void save();
      }
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        removeSelected();
      }
      if (event.key === 'Escape') setSelectedId(undefined);
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [duplicateSelected, redo, removeSelected, save, undo]);

  function addElement(tool: (typeof tools)[number]) {
    if (readOnly || document.elements.length >= 250) return;
    const base: BoardElement = {
      id: id(),
      type: tool.type,
      x: document.pitch.width / 2,
      y: document.pitch.height / 2,
      ...tool.patch,
    };
    if (tool.type === 'arrow') {
      base.endX = Math.min(document.pitch.width, base.x + 150);
      base.endY = tool.patch?.style === 'curved' ? base.y - 90 : base.y;
    }
    commit({ ...document, elements: [...document.elements, base] });
    setSelectedId(base.id);
  }

  function changePitch(type: PitchType) {
    const config = pitchConfigs[type];
    const next = {
      ...document,
      pitch: { type, width: config.width, height: config.height },
      elements: document.elements.map((element) => ({
        ...element,
        x: Math.min(element.x, config.width),
        y: Math.min(element.y, config.height),
      })),
    };
    commit(next);
  }

  function applyFormation(team: Team) {
    if (document.elements.length + 11 > 250) return;
    commit({
      ...document,
      elements: [
        ...document.elements,
        ...formationElements(
          formation,
          team,
          document.pitch.width,
          document.pitch.height,
        ),
      ],
    });
  }

  function moveElement(elementId: string, x: number, y: number) {
    const snap = (value: number) =>
      gridSnap ? Math.round(value / 20) * 20 : Math.round(value);
    updateElement(elementId, {
      x: Math.max(0, Math.min(document.pitch.width, snap(x))),
      y: Math.max(0, Math.min(document.pitch.height, snap(y))),
    });
  }

  function transformElement(element: BoardElement, node: Konva.Node) {
    const scale = Math.max(Math.abs(node.scaleX()), Math.abs(node.scaleY()));
    const patch: Partial<BoardElement> = {
      rotation: Math.round(node.rotation()),
    };
    if (element.type === 'player' || element.type === 'ball')
      patch.radius = Math.max(
        4,
        Math.min(80, Math.round((element.radius ?? 20) * scale)),
      );
    else if (element.type === 'zone') {
      patch.width = Math.max(
        5,
        Math.min(
          document.pitch.width,
          Math.round((element.width ?? 180) * Math.abs(node.scaleX())),
        ),
      );
      patch.height = Math.max(
        5,
        Math.min(
          document.pitch.height,
          Math.round((element.height ?? 120) * Math.abs(node.scaleY())),
        ),
      );
    } else if (element.type === 'wall')
      patch.width = Math.max(
        10,
        Math.min(
          document.pitch.width,
          Math.round((element.width ?? 130) * scale),
        ),
      );
    else if (element.type === 'ladder')
      patch.length = Math.max(
        20,
        Math.min(
          document.pitch.width,
          Math.round((element.length ?? 140) * scale),
        ),
      );
    else if (element.type === 'text')
      patch.fontSize = Math.max(
        8,
        Math.min(96, Math.round((element.fontSize ?? 26) * scale)),
      );
    else if (
      element.type === 'cone' ||
      element.type === 'marker' ||
      element.type === 'goalkeeper'
    )
      patch.size = Math.max(
        12,
        Math.min(
          100,
          Math.round(
            (typeof element.size === 'number' ? element.size : 30) * scale,
          ),
        ),
      );
    node.scale({ x: 1, y: 1 });
    updateElement(element.id, patch);
  }

  async function importJson(file?: File) {
    if (!file) return;
    try {
      const next = validateBoard(JSON.parse(await file.text()));
      setHistory([next]);
      setHistoryIndex(0);
      setSelectedId(undefined);
      toast.success('NGCS JSON içe aktarıldı');
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : 'Dosya içe aktarılamadı.',
      );
    }
    if (importRef.current) importRef.current.value = '';
  }

  const scale = Math.min(
    1,
    Math.max(0.2, (containerWidth - 4) / document.pitch.width),
  );
  const selected = document.elements.find(
    (element) => element.id === selectedId,
  );

  return (
    <div className="board-editor">
      <div className="board-commandbar">
        <Select
          value={document.pitch.type}
          onValueChange={(value) => changePitch(value as PitchType)}
          disabled={readOnly}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(pitchConfigs).map(([key, value]) => (
              <SelectItem key={key} value={key}>
                {value.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={undo}
          disabled={readOnly || historyIndex === 0}
        >
          Geri al
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={redo}
          disabled={readOnly || historyIndex >= history.length - 1}
        >
          Yinele
        </Button>
        <Button
          variant={gridSnap ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => setGridSnap((value) => !value)}
        >
          <GridFour />
          Grid snap
        </Button>
        <span className={dirty ? 'dirty-indicator dirty' : 'dirty-indicator'}>
          {dirty ? 'Kaydedilmemiş değişiklik' : 'Kaydedildi'}
        </span>
        {!readOnly ? (
          <Button className="ml-auto" onClick={() => void save()}>
            <FloppyDisk />
            Kaydet
          </Button>
        ) : null}
      </div>
      <div className="board-layout">
        {!readOnly ? (
          <aside className="board-tools">
            <ScrollArea className="h-full">
              <p className="tool-heading">Araçlar</p>
              {tools.map((tool, index) => {
                const Icon = tool.icon ?? Circle;
                return (
                  <button
                    key={`${tool.type}-${index}`}
                    onClick={() => addElement(tool)}
                  >
                    <Icon />
                    <span>{tool.label}</span>
                  </button>
                );
              })}
            </ScrollArea>
          </aside>
        ) : null}
        <div className="board-canvas-wrap" ref={containerRef}>
          <Stage
            ref={stageRef}
            width={document.pitch.width * scale}
            height={document.pitch.height * scale}
            scaleX={scale}
            scaleY={scale}
            onPointerDown={(event) => {
              if (event.target === event.target.getStage())
                setSelectedId(undefined);
            }}
          >
            <Layer>
              <Pitch
                width={document.pitch.width}
                height={document.pitch.height}
                type={document.pitch.type}
              />
              {document.elements.map((element) => (
                <BoardNode
                  key={element.id}
                  element={element}
                  selected={element.id === selectedId}
                  readOnly={readOnly}
                  onSelect={() => setSelectedId(element.id)}
                  onMove={(x, y) => moveElement(element.id, x, y)}
                  onTransform={(node) => transformElement(element, node)}
                />
              ))}
              {!readOnly ? (
                <Transformer
                  ref={transformerRef}
                  rotateEnabled
                  anchorSize={14}
                  borderStroke="#facc15"
                  anchorFill="#ffffff"
                  anchorStroke="#0a3156"
                  boundBoxFunc={(oldBox, newBox) =>
                    newBox.width < 12 || newBox.height < 12 ? oldBox : newBox
                  }
                />
              ) : null}
            </Layer>
          </Stage>
        </div>
        <aside className="board-inspector">
          <Tabs defaultValue="layers">
            <TabsList className="w-full">
              <TabsTrigger className="flex-1" value="layers">
                Katmanlar
              </TabsTrigger>
              <TabsTrigger className="flex-1" value="properties">
                Özellikler
              </TabsTrigger>
            </TabsList>
            <TabsContent value="layers">
              <ScrollArea className="board-layer-list">
                {document.elements.length ? (
                  [...document.elements].reverse().map((element) => (
                    <button
                      className={selectedId === element.id ? 'selected' : ''}
                      key={element.id}
                      onClick={() => setSelectedId(element.id)}
                    >
                      <span>{labelFor(element)}</span>
                      <small>{element.id.slice(-6)}</small>
                    </button>
                  ))
                ) : (
                  <p className="board-help">Henüz eleman yok.</p>
                )}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="properties">
              {selected ? (
                <Properties
                  element={selected}
                  onChange={(patch) => updateElement(selected.id, patch)}
                  readOnly={readOnly}
                />
              ) : (
                <p className="board-help">
                  Özelliklerini düzenlemek için bir eleman seçin.
                </p>
              )}
            </TabsContent>
          </Tabs>
          {!readOnly ? (
            <div className="board-selection-actions">
              <Button
                variant="outline"
                size="sm"
                onClick={duplicateSelected}
                disabled={!selected}
              >
                <Copy />
                Çoğalt
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={removeSelected}
                disabled={!selected}
              >
                <Trash />
                Sil
              </Button>
            </div>
          ) : null}
        </aside>
      </div>
      {!readOnly ? (
        <div className="board-footerbar">
          <Select
            value={formation}
            onValueChange={(value) => setFormation(value as typeof formation)}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {formations.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => applyFormation('home')}>
            Ev formasyonu
          </Button>
          <Button variant="outline" onClick={() => applyFormation('away')}>
            Deplasman formasyonu
          </Button>
          <div className="board-export">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => importRef.current?.click()}
            >
              <UploadSimple />
              JSON al
            </Button>
            <input
              ref={importRef}
              hidden
              type="file"
              accept="application/json,.json"
              onChange={(event) => void importJson(event.target.files?.[0])}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                download(
                  'ngcs-tactical-board.json',
                  JSON.stringify(document, null, 2),
                  'application/json',
                )
              }
            >
              <DownloadSimple />
              JSON
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => exportPng(stageRef.current)}
            >
              <DownloadSimple />
              PNG
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                download(
                  'ngcs-tactical-board.svg',
                  boardSvg(document),
                  'image/svg+xml',
                )
              }
            >
              <DownloadSimple />
              SVG
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setClearOpen(true)}
            >
              <ArrowsClockwise />
              Temizle
            </Button>
          </div>
        </div>
      ) : null}
      <Dialog open={clearOpen} onOpenChange={setClearOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tahtayı temizle?</DialogTitle>
            <DialogDescription>
              Tüm elemanlar kaldırılır. Bu işlem geri al ile geri getirilebilir.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearOpen(false)}>
              Vazgeç
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                commit({ ...document, elements: [] });
                setSelectedId(undefined);
                setClearOpen(false);
              }}
            >
              Temizle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Pitch({
  width,
  height,
  type,
}: {
  width: number;
  height: number;
  type: PitchType;
}) {
  const line = '#e8f8ef';
  return (
    <Group listening={false}>
      <Rect width={width} height={height} fill="#16844e" />
      <Rect
        x={12}
        y={12}
        width={width - 24}
        height={height - 24}
        stroke={line}
        strokeWidth={4}
      />
      {type === 'grid' ? (
        Array.from({ length: 7 }, (_, i) => (
          <Group key={i}>
            <Line
              points={[
                ((i + 1) * width) / 8,
                12,
                ((i + 1) * width) / 8,
                height - 12,
              ]}
              stroke={line}
              opacity={0.45}
            />
            <Line
              points={[
                12,
                ((i + 1) * height) / 8,
                width - 12,
                ((i + 1) * height) / 8,
              ]}
              stroke={line}
              opacity={0.45}
            />
          </Group>
        ))
      ) : (
        <>
          <Line
            points={[width / 2, 12, width / 2, height - 12]}
            stroke={line}
            strokeWidth={4}
          />
          <KCircle
            x={width / 2}
            y={height / 2}
            radius={Math.min(width, height) * 0.13}
            stroke={line}
            strokeWidth={4}
          />
          <KCircle x={width / 2} y={height / 2} radius={5} fill={line} />
          <Rect
            x={12}
            y={height * 0.24}
            width={width * 0.16}
            height={height * 0.52}
            stroke={line}
            strokeWidth={4}
          />
          <Rect
            x={width - 12 - width * 0.16}
            y={height * 0.24}
            width={width * 0.16}
            height={height * 0.52}
            stroke={line}
            strokeWidth={4}
          />
        </>
      )}
    </Group>
  );
}

function BoardNode({
  element,
  selected,
  readOnly,
  onSelect,
  onMove,
  onTransform,
}: {
  element: BoardElement;
  selected: boolean;
  readOnly: boolean;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
  onTransform: (node: Konva.Node) => void;
}) {
  const color =
    element.team === 'away'
      ? '#ef4444'
      : element.team === 'neutral'
        ? '#eab308'
        : '#1687ff';
  return (
    <Group
      id={element.id}
      x={element.x}
      y={element.y}
      rotation={element.rotation ?? 0}
      draggable={!readOnly}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(event) => onMove(event.target.x(), event.target.y())}
      onTransformEnd={(event) => onTransform(event.target)}
    >
      {element.type === 'player' ? (
        <>
          <KCircle
            radius={element.radius ?? 24}
            fill={color}
            stroke={selected ? '#facc15' : '#fff'}
            strokeWidth={3}
          />
          <Text
            text={element.number ?? ''}
            width={(element.radius ?? 24) * 2}
            x={-(element.radius ?? 24)}
            y={-8}
            align="center"
            fill="#fff"
            fontStyle="bold"
            fontSize={16}
          />
        </>
      ) : null}
      {element.type === 'goalkeeper' ? (
        <>
          <Rect
            x={-(Number(element.size) || 34) / 2}
            y={-(Number(element.size) || 34) / 2}
            width={Number(element.size) || 34}
            height={Number(element.size) || 34}
            cornerRadius={6}
            fill={color}
            stroke="#fff"
            strokeWidth={3}
          />
          <Text
            text={element.number ?? '1'}
            width={Number(element.size) || 34}
            x={-(Number(element.size) || 34) / 2}
            y={-8}
            align="center"
            fill="#fff"
            fontStyle="bold"
          />
        </>
      ) : null}
      {element.type === 'ball' ? (
        <>
          <KCircle
            radius={element.radius ?? 12}
            fill="#fff"
            stroke="#0f172a"
            strokeWidth={3}
          />
          <KCircle radius={4} fill="#0f172a" />
        </>
      ) : null}
      {element.type === 'cone' ? (
        <Line
          points={[
            0,
            -(Number(element.size) || 24),
            -(Number(element.size) || 24) / 2,
            (Number(element.size) || 24) / 2,
            (Number(element.size) || 24) / 2,
            (Number(element.size) || 24) / 2,
          ]}
          closed
          fill={element.color ?? '#f59e0b'}
          stroke="#fff"
          strokeWidth={2}
        />
      ) : null}
      {element.type === 'goal' ? (
        <Rect
          x={-45}
          y={-18}
          width={90}
          height={36}
          stroke="#fff"
          strokeWidth={5}
          dash={[8, 5]}
        />
      ) : null}
      {element.type === 'flag' ? (
        <>
          <Line
            points={[0, 0, 0, -(element.height ?? 60)]}
            stroke="#fff"
            strokeWidth={4}
          />
          <Line
            points={[
              0,
              -(element.height ?? 60),
              30,
              -(element.height ?? 48),
              0,
              -(element.height ?? 35),
            ]}
            closed
            fill={element.color ?? '#f59e0b'}
          />
        </>
      ) : null}
      {element.type === 'wall' ? (
        <Line
          points={[
            -(element.width ?? 130) / 2,
            0,
            (element.width ?? 130) / 2,
            0,
          ]}
          stroke="#f97316"
          strokeWidth={16}
          dash={[12, 5]}
        />
      ) : null}
      {element.type === 'ladder' ? (
        <Ladder length={element.length ?? 140} rungs={element.rungs ?? 6} />
      ) : null}
      {element.type === 'marker' ? (
        <KCircle
          radius={(Number(element.size) || 24) / 2}
          fill={element.color ?? '#facc15'}
          stroke="#fff"
          strokeWidth={2}
        />
      ) : null}
      {element.type === 'arrow' ? (
        <Arrow
          points={
            element.style === 'curved'
              ? [
                  0,
                  0,
                  (element.endX! - element.x) / 2,
                  element.endY! - element.y - 50,
                  element.endX! - element.x,
                  element.endY! - element.y,
                ]
              : [0, 0, element.endX! - element.x, element.endY! - element.y]
          }
          tension={element.style === 'curved' ? 0.45 : 0}
          stroke={element.color}
          fill={element.color}
          strokeWidth={element.thickness}
          dash={element.style === 'dashed' ? [18, 12] : undefined}
          pointerLength={16}
          pointerWidth={14}
        />
      ) : null}
      {element.type === 'line' ? (
        <Line
          points={element.points}
          stroke={element.color}
          strokeWidth={element.thickness}
          dash={element.style === 'dashed' ? [16, 10] : undefined}
        />
      ) : null}
      {element.type === 'zone' ? (
        <Rect
          width={element.width}
          height={element.height}
          offsetX={(element.width ?? 0) / 2}
          offsetY={(element.height ?? 0) / 2}
          fill={element.color}
          opacity={element.opacity}
          stroke={element.color}
          strokeWidth={3}
        />
      ) : null}
      {element.type === 'text' ? (
        <Text
          text={element.text}
          fontSize={element.fontSize}
          fill={element.color}
          fontStyle="bold"
        />
      ) : null}
    </Group>
  );
}

function Ladder({ length, rungs }: { length: number; rungs: number }) {
  return (
    <Group>
      <Line
        points={[-length / 2, -18, length / 2, -18]}
        stroke="#fde68a"
        strokeWidth={5}
      />
      <Line
        points={[-length / 2, 18, length / 2, 18]}
        stroke="#fde68a"
        strokeWidth={5}
      />
      {Array.from({ length: rungs }, (_, index) => {
        const x = -length / 2 + (length * index) / (rungs - 1);
        return (
          <Line
            key={index}
            points={[x, -18, x, 18]}
            stroke="#fde68a"
            strokeWidth={4}
          />
        );
      })}
    </Group>
  );
}

function Properties({
  element,
  onChange,
  readOnly,
}: {
  element: BoardElement;
  onChange: (patch: Partial<BoardElement>) => void;
  readOnly: boolean;
}) {
  return (
    <div className="property-grid">
      <label>
        X
        <Input
          type="number"
          value={element.x}
          disabled={readOnly}
          onChange={(event) => onChange({ x: Number(event.target.value) })}
        />
      </label>
      <label>
        Y
        <Input
          type="number"
          value={element.y}
          disabled={readOnly}
          onChange={(event) => onChange({ y: Number(event.target.value) })}
        />
      </label>
      <label>
        Döndürme
        <Input
          type="number"
          value={element.rotation ?? 0}
          disabled={readOnly}
          onChange={(event) =>
            onChange({ rotation: Number(event.target.value) })
          }
        />
      </label>
      {element.team ? (
        <label>
          Takım
          <Select
            value={element.team}
            onValueChange={(team) => onChange({ team: team as Team })}
            disabled={readOnly}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="home">Ev</SelectItem>
              <SelectItem value="away">Deplasman</SelectItem>
              <SelectItem value="neutral">Nötr</SelectItem>
            </SelectContent>
          </Select>
        </label>
      ) : null}
      {element.number !== undefined ? (
        <label>
          Numara
          <Input
            value={element.number}
            maxLength={4}
            disabled={readOnly}
            onChange={(event) => onChange({ number: event.target.value })}
          />
        </label>
      ) : null}
      {element.text !== undefined ? (
        <label className="property-wide">
          Metin
          <Input
            value={element.text}
            maxLength={500}
            disabled={readOnly}
            onChange={(event) => onChange({ text: event.target.value })}
          />
        </label>
      ) : null}
    </div>
  );
}

function labelFor(element: BoardElement) {
  return (
    tools.find((tool) => tool.type === element.type)?.label ?? element.type
  );
}
function download(name: string, content: string, type: string) {
  const link = window.document.createElement('a');
  link.href = URL.createObjectURL(new Blob([content], { type }));
  link.download = name;
  link.click();
  URL.revokeObjectURL(link.href);
}
function exportPng(stage: Konva.Stage | null) {
  if (!stage) return;
  const link = window.document.createElement('a');
  link.download = 'ngcs-tactical-board.png';
  link.href = stage.toDataURL({ pixelRatio: 2 });
  link.click();
}
function boardSvg(document: TacticalBoardDocumentV1) {
  const elements = document.elements
    .map(
      (element) =>
        `<g transform="translate(${element.x} ${element.y}) rotate(${element.rotation ?? 0})"><circle r="${element.radius ?? 14}" fill="${element.team === 'away' ? '#ef4444' : (element.color ?? '#1687ff')}"/><title>${labelFor(element)}</title></g>`,
    )
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${document.pitch.width}" height="${document.pitch.height}" viewBox="0 0 ${document.pitch.width} ${document.pitch.height}"><rect width="100%" height="100%" fill="#16844e"/><rect x="12" y="12" width="${document.pitch.width - 24}" height="${document.pitch.height - 24}" fill="none" stroke="#fff" stroke-width="4"/>${elements}</svg>`;
}
