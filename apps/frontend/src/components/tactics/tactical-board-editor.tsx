import {
  ArrowsOut,
  ArrowsIn,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  CornersOut,
  SidebarSimple,
  TShirt,
  TrafficCone,
  LadderSimple,
  Rectangle,
  UsersThree,
  Minus,
  Square,
  Hand,
  Cursor,
  ArrowBendUpRight,
  ArrowRight,
  ArrowsClockwise,
  Circle,
  Copy,
  DownloadSimple,
  Flag,
  FloppyDisk,
  GridFour,
  SoccerBall,
  TextT,
  Trash,
  UploadSimple,
} from '@phosphor-icons/react';
import Konva from 'konva';
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type Ref,
} from 'react';
import { useBlocker, useNavigate, useLocation } from 'react-router';
import {
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
import { boardSvg } from '../../lib/tactical-board-svg';
import {
  elementArt,
  pitchArt,
  type BoardArt,
  type PlayerAppearance,
} from '../../lib/board-art';
import '../../styles/tactical-studio.css';
import { translateSelection } from '../../lib/board-selection';
import { BoardRoster, type BoardRosterSource } from './board-roster';
import {
  validateTacticalDocument,
  type TacticalDocument,
} from '../../lib/tactical-document-core';
import {
  createSequence,
  editScenes,
  replaceSceneBoard,
  type SceneEdit,
} from '../../lib/tactical-scenes';
import { SceneStrip } from './scene-strip';
import { useTacticalPlayback } from './use-tactical-playback';
import { PlaybackControls } from './playback-controls';

const watchNarrowViewport = (listener: () => void) => {
  const media = window.matchMedia?.('(max-width: 700px)');
  media?.addEventListener('change', listener);
  return () => media?.removeEventListener('change', listener);
};
const readNarrowViewport = () =>
  window.matchMedia?.('(max-width: 700px)').matches ?? false;

export type BoardEditorHandle = { transition: (action: () => void) => void };
type Props = {
  rosterSource?: BoardRosterSource;
  controllerRef?: Ref<BoardEditorHandle>;
  onSavingChange?: (saving: boolean) => void;
  initialDocument?: TacticalDocument | null;
  initiallySaved?: boolean;
  onSave?: (
    document: TacticalBoardDocumentV1,
  ) =>
    | Promise<void | { redirectTo: string; replace?: boolean }>
    | void
    | { redirectTo: string; replace?: boolean };
  // Opt-in V2 adapter. Legacy callers never receive a truncated scene as V1.
  onSaveDocument?: (
    document: TacticalDocument,
  ) => Promise<void | { redirectTo: string; replace?: boolean }>;
  readOnly?: boolean;
  changeKey?: string;
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
    icon: TShirt,
    patch: { team: 'home', number: '8', radius: 24 },
  },
  {
    type: 'goalkeeper',
    label: 'Kaleci',
    icon: TShirt,
    patch: { team: 'home', number: '1', size: 34 },
  },
  { type: 'ball', label: 'Top', icon: SoccerBall, patch: { radius: 12 } },
  {
    type: 'cone',
    label: 'Koni',
    icon: TrafficCone,
    patch: { color: '#f59e0b', size: 24 },
  },
  { type: 'goal', label: 'Kale', icon: Rectangle, patch: { size: 'large' } },
  {
    type: 'flag',
    label: 'Bayrak',
    icon: Flag,
    patch: { color: '#f59e0b', height: 60 },
  },
  { type: 'wall', label: 'Baraj', icon: UsersThree, patch: { width: 130 } },
  {
    type: 'ladder',
    label: 'Merdiven',
    icon: LadderSimple,
    patch: { length: 140, rungs: 6 },
  },
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
    icon: ArrowRight,
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
    icon: Minus,
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
    icon: Square,
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
  initiallySaved = initialDocument != null,
  onSave,
  onSaveDocument,
  readOnly = false,
  changeKey = '',
  controllerRef,
  onSavingChange,
  rosterSource,
}: Props) {
  const navigate = useNavigate();
  const seed = useMemo(
    () => initialDocument ?? emptyBoard(),
    [initialDocument],
  );
  const [timeline, setTimeline] = useState({ history: [seed], index: 0 });
  const { history, index: historyIndex } = timeline;
  const fullDocument = history[historyIndex];
  const playback = useTacticalPlayback(fullDocument);
  const { transport, state: playbackState } = playback;
  const preview = playbackState.preview;
  const location = useLocation();
  const latestDocument = useRef(fullDocument);
  useEffect(() => {
    latestDocument.current = fullDocument;
  }, [fullDocument]);
  const [selectedSceneId, setSelectedSceneId] = useState<string>();
  const activeScene =
    fullDocument.schemaVersion === 2
      ? (fullDocument.scenes.find((scene) => scene.id === selectedSceneId) ??
        fullDocument.scenes[0])
      : undefined;
  const document =
    fullDocument.schemaVersion === 1 ? fullDocument : activeScene!.board;
  const renderBoard = playback.frame?.board ?? document;
  const multipleScenes =
    fullDocument.schemaVersion === 2 && fullDocument.scenes.length > 1;
  const [saved, setSaved] = useState(JSON.stringify(seed));
  const [hasSaved, setHasSaved] = useState(initiallySaved);
  const [storedSelectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedIds = useMemo(
    () =>
      storedSelectedIds.filter((value) =>
        document.elements.some((element) => element.id === value),
      ),
    [storedSelectedIds, document],
  );
  const selectedId = selectedIds.length === 1 ? selectedIds[0] : undefined;
  const setSelectedId = useCallback(
    (value: string | undefined) => setSelectedIds(value ? [value] : []),
    [],
  );
  const [multiSelect, setMultiSelect] = useState(false);
  const dragIds = useRef<string[]>([]);
  const selectElement = (elementId: string, additive = false) => {
    setSelectedIds((current) =>
      additive || multiSelect
        ? current.includes(elementId)
          ? current.filter((value) => value !== elementId)
          : [...current, elementId]
        : [elementId],
    );
  };
  const [gridSnap, setGridSnap] = useState(true);
  const [formation, setFormation] =
    useState<(typeof formations)[number]>('4-3-3');
  const [clearOpen, setClearOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const allowNavigationRef = useRef(false);
  const [containerWidth, setContainerWidth] = useState(900);
  const [containerHeight, setContainerHeight] = useState(580);
  const [appearance, setAppearance] = useState<PlayerAppearance>('shirt');
  const [zoom, setZoom] = useState(1);
  const [panning, setPanning] = useState(false);
  const narrowViewport = useSyncExternalStore(
    watchNarrowViewport,
    readNarrowViewport,
    () => false,
  );
  const [inspectorPreference, setInspectorPreference] = useState<
    boolean | null
  >(null);
  const inspectorOpen = inspectorPreference ?? !narrowViewport;
  const [inspectorTab, setInspectorTab] = useState('layers');
  const [expanded, setExpanded] = useState(false);
  const expandRef = useRef<HTMLButtonElement>(null);
  const panOrigin = useRef<{
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  useEffect(() => {
    if (!expanded) return;
    const previous = window.document.body.style.overflow;
    window.document.body.style.overflow = 'hidden';
    const escape = (event: KeyboardEvent) => {
      if (
        event.key === 'Escape' &&
        !window.document.querySelector('[role="dialog"], [role="listbox"]')
      ) {
        setExpanded(false);
        expandRef.current?.focus();
      }
    };
    window.addEventListener('keydown', escape);
    return () => {
      window.document.body.style.overflow = previous;
      window.removeEventListener('keydown', escape);
    };
  }, [expanded]);
  const [savedChangeKey, setSavedChangeKey] = useState(changeKey);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const savingRef = useRef(false);
  const editingLocked = readOnly || saving || preview;
  const alive = useRef(true);
  const [localTransition, setLocalTransition] = useState<(() => void) | null>(
    null,
  );
  const serializedDocument = useMemo(
    () => JSON.stringify(fullDocument),
    [fullDocument],
  );
  const dirty = serializedDocument !== saved || changeKey !== savedChangeKey;
  const blocker = useBlocker(
    () =>
      (dirty || savingRef.current) && !readOnly && !allowNavigationRef.current,
  );
  useEffect(() => {
    transport.pause();
  }, [
    transport,
    location.key,
    readOnly,
    changeKey,
    rosterSource?.teamId,
    rosterSource?.clubId,
  ]);
  useEffect(() => {
    if (blocker.state === 'blocked') transport.exitPreview();
  }, [blocker.state, transport]);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    onSavingChange?.(saving);
  }, [saving, onSavingChange]);
  useImperativeHandle(
    controllerRef,
    () => ({
      transition(action) {
        transport.exitPreview();
        if (savingRef.current || localTransition || blocker.state === 'blocked')
          return;
        if (dirty && !readOnly) setLocalTransition(() => action);
        else action();
      },
    }),
    [dirty, readOnly, localTransition, blocker.state, transport],
  );

  function cancelTransition() {
    if (savingRef.current) return;
    setLocalTransition(null);
    if (blocker.state === 'blocked') blocker.reset();
  }
  function finishTransition() {
    const action = localTransition;
    setLocalTransition(null);
    if (blocker.state === 'blocked') blocker.proceed();
    else action?.();
  }

  const commitDocument = useCallback(
    (next: TacticalDocument) => {
      if (savingRef.current || readOnly || transport.getSnapshot().preview)
        return;
      setTimeline((current) => {
        const history = [
          ...current.history.slice(
            Math.max(0, current.index - 49),
            current.index + 1,
          ),
          next,
        ].slice(-51);
        return { history, index: history.length - 1 };
      });
    },
    [readOnly, transport],
  );

  const commit = useCallback(
    (next: TacticalBoardDocumentV1) => {
      try {
        commitDocument(replaceSceneBoard(fullDocument, activeScene?.id, next));
      } catch (cause) {
        toast.error(
          cause instanceof Error ? cause.message : 'Sahne değiştirilemedi.',
        );
      }
    },
    [commitDocument, fullDocument, activeScene],
  );

  function selectScene(sceneId: string) {
    if (savingRef.current) return;
    transport.exitPreview();
    setSelectedSceneId(sceneId);
    setSelectedIds([]);
  }

  function changeScenes(edit: SceneEdit) {
    if (
      readOnly ||
      savingRef.current ||
      transport.getSnapshot().preview ||
      fullDocument.schemaVersion !== 2
    )
      return;
    try {
      const next = editScenes(fullDocument, edit);
      if (next === fullDocument) return;
      commitDocument(next);
      selectScene(
        edit.type === 'duplicate'
          ? edit.newId
          : next.scenes.some((scene) => scene.id === activeScene?.id)
            ? activeScene!.id
            : next.scenes[
                Math.max(
                  0,
                  fullDocument.scenes.findIndex(
                    (scene) => scene.id === edit.id,
                  ) - 1,
                )
              ].id,
      );
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : 'Sahne değiştirilemedi.',
      );
    }
  }

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
      setContainerHeight(entry.contentRect.height);
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const transformer = transformerRef.current;
    const stage = stageRef.current;
    if (!transformer || !stage) return;
    const nodes = (selectedIds.length === 1 ? selectedIds : [])
      .map((value) => stage.findOne(`#${value}`))
      .filter((node): node is Konva.Node => Boolean(node));
    transformer.nodes(nodes);
    transformer.getLayer()?.batchDraw();
  }, [selectedIds, document, appearance, panning]);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if ((!dirty && !savingRef.current) || readOnly) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [dirty, readOnly]);

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
    if (!selectedIds.length || readOnly || savingRef.current) return;
    commit({
      ...document,
      elements: document.elements.filter(
        (element) => !selectedIds.includes(element.id),
      ),
    });
    setSelectedId(undefined);
  }, [commit, document, readOnly, selectedIds, setSelectedId]);

  const duplicateSelected = useCallback(() => {
    const source = document.elements.filter((element) =>
      selectedIds.includes(element.id),
    );
    if (
      !source.length ||
      readOnly ||
      savingRef.current ||
      document.elements.length + source.length > 250
    )
      return;
    const moved = translateSelection(
      { ...document, elements: source },
      selectedIds,
      24,
      24,
    );
    const copies = moved.elements.map((element) => ({ ...element, id: id() }));
    commit({ ...document, elements: [...document.elements, ...copies] });
    setSelectedIds(copies.map((element) => element.id));
  }, [commit, document, readOnly, selectedIds]);

  const nudgeSelection = useCallback(
    (dx: number, dy: number) => {
      if (!selectedIds.length || readOnly || savingRef.current) return;
      commit(translateSelection(document, selectedIds, dx, dy));
    },
    [commit, document, readOnly, selectedIds],
  );

  const undo = useCallback(() => {
    if (!savingRef.current && !readOnly && !transport.getSnapshot().preview)
      setTimeline((current) => ({
        ...current,
        index: Math.max(0, current.index - 1),
      }));
  }, [readOnly, transport]);
  const redo = useCallback(() => {
    if (!savingRef.current && !readOnly && !transport.getSnapshot().preview)
      setTimeline((current) => ({
        ...current,
        index: Math.min(current.history.length - 1, current.index + 1),
      }));
  }, [readOnly, transport]);

  const save = useCallback(async () => {
    if (
      savingRef.current ||
      readOnly ||
      transport.getSnapshot().preview ||
      (!onSave && !onSaveDocument)
    )
      return false;
    savingRef.current = true;
    setSaving(true);
    setSaveError(null);
    try {
      const valid = onSaveDocument
        ? validateTacticalDocument(fullDocument)
        : validateBoard(fullDocument);
      const result = onSaveDocument
        ? await onSaveDocument(valid)
        : await onSave?.(valid as TacticalBoardDocumentV1);
      if (!alive.current) return false;
      setSaved(JSON.stringify(valid));
      setHasSaved(true);
      setSavedChangeKey(changeKey);
      if (result?.redirectTo && blocker.state !== 'blocked') {
        allowNavigationRef.current = true;
        navigate(result.redirectTo, { replace: result.replace });
      }
      toast.success('Taktik tahtası kaydedildi');
      return true;
    } catch (cause) {
      if (!alive.current) return false;
      setSaveError(
        cause instanceof Error ? cause.message : 'Tahta kaydedilemedi.',
      );
      toast.error(
        cause instanceof Error ? cause.message : 'Tahta kaydedilemedi.',
      );
      return false;
    } finally {
      allowNavigationRef.current = false;
      savingRef.current = false;
      if (alive.current) setSaving(false);
    }
  }, [
    blocker.state,
    changeKey,
    fullDocument,
    navigate,
    onSave,
    onSaveDocument,
    readOnly,
    transport,
  ]);

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      // A modal owns keyboard interaction; never mutate the board behind it.
      if (window.document.querySelector('[role="dialog"]')) return;
      const target = event.target;
      if (
        target instanceof Element &&
        target.matches('input, textarea, select, [contenteditable="true"]')
      )
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
  }, [duplicateSelected, redo, removeSelected, save, undo, setSelectedId]);

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
    setInspectorTab('properties');
  }

  function changePitch(type: PitchType) {
    if (multipleScenes || savingRef.current) return;
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

  function movedDocument(elementId: string, x: number, y: number) {
    const source = document.elements.find(
      (element) => element.id === elementId,
    )!;
    const snap = (value: number) =>
      gridSnap ? Math.round(value / 20) * 20 : Math.round(value);
    return translateSelection(
      document,
      dragIds.current.length ? dragIds.current : [elementId],
      snap(x) - source.x,
      snap(y) - source.y,
    );
  }

  function previewMove(elementId: string, x: number, y: number) {
    const next = movedDocument(elementId, x, y);
    for (const element of next.elements) {
      if (!dragIds.current.includes(element.id)) continue;
      stageRef.current
        ?.findOne(`#${element.id}`)
        ?.position({ x: element.x, y: element.y });
    }
  }

  function moveElement(elementId: string, x: number, y: number) {
    commit(movedDocument(elementId, x, y));
    dragIds.current = [];
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
    if (
      !file ||
      savingRef.current ||
      readOnly ||
      transport.getSnapshot().preview
    )
      return;
    const startingDocument = fullDocument;
    try {
      if (file.size > (onSaveDocument ? 500000 : 100000))
        throw new Error('JSON dosyası boyut sınırını aşıyor.');
      const parsed: unknown = JSON.parse(await file.text());
      if (
        !alive.current ||
        savingRef.current ||
        transport.getSnapshot().preview ||
        latestDocument.current !== startingDocument
      )
        throw new Error('Tahta değişti. Dosyayı yeniden seçin.');
      const next = onSaveDocument
        ? validateTacticalDocument(parsed)
        : validateBoard(parsed);
      if (fullDocument.schemaVersion === 2 && next.schemaVersion === 1)
        throw new Error(
          'Çok sahneli belge tek sahneyle değiştirilemez. Ayrı bir tahta açın.',
        );
      commitDocument(next);
      setSelectedId(undefined);
      toast.success('NGCS JSON içe aktarıldı');
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : 'Dosya içe aktarılamadı.',
      );
    }
    if (importRef.current) importRef.current.value = '';
  }

  const scale =
    Math.max(
      0.1,
      Math.min(
        (containerWidth - 32) / document.pitch.width,
        (containerHeight - 32) / document.pitch.height,
      ),
    ) * zoom;
  function fitPitch() {
    setZoom(1);
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      containerRef.current.scrollLeft = 0;
    }
  }
  const selected = document.elements.find(
    (element) => element.id === selectedId,
  );

  return (
    <div
      className={`board-editor tactical-studio${expanded ? ' tactical-studio--expanded' : ''}${inspectorOpen ? '' : ' tactical-studio--no-inspector'}${readOnly ? ' tactical-studio--readonly' : ''}`}
      aria-label="Taktik çalışma alanı"
    >
      <Dialog
        open={blocker.state === 'blocked' || Boolean(localTransition)}
        onOpenChange={(open) => {
          if (!open) cancelTransition();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kaydedilmemiş değişiklikler var</DialogTitle>
            <DialogDescription>
              Bu sayfadan ayrılırsanız taktik tahtasındaki son değişiklikler
              kaybolacak.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={cancelTransition}
              disabled={saving}
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={finishTransition}
              disabled={saving}
            >
              Değişiklikleri at
            </Button>
            <Button
              onClick={async () => {
                if (await save()) finishTransition();
              }}
              disabled={saving}
            >
              {saving ? 'Kaydediliyor…' : 'Kaydet ve çık'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="board-commandbar">
        <div className="board-commandbar-tools">
          <Select
            value={document.pitch.type}
            onValueChange={(value) => changePitch(value as PitchType)}
            disabled={editingLocked || multipleScenes}
          >
            <SelectTrigger className="w-48" aria-label="Saha türü">
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
            disabled={editingLocked || historyIndex === 0}
          >
            Geri al
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={redo}
            disabled={editingLocked || historyIndex >= history.length - 1}
          >
            Yinele
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label={
              inspectorOpen
                ? 'Özellik panelini gizle'
                : 'Özellik panelini göster'
            }
            aria-expanded={inspectorOpen}
            onClick={() => setInspectorPreference(!inspectorOpen)}
          >
            <SidebarSimple />
          </Button>
          <Button
            ref={expandRef}
            size="icon"
            variant="ghost"
            aria-label={expanded ? 'Odak modundan çık' : 'Odak modunu aç'}
            aria-pressed={expanded}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? <ArrowsIn /> : <ArrowsOut />}
          </Button>
        </div>
        <details className="board-view-options">
          <summary>Görünüm</summary>
          <div className="board-view-settings">
            <Button
              variant={gridSnap ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setGridSnap((value) => !value)}
              aria-pressed={gridSnap}
              disabled={editingLocked}
            >
              <GridFour />
              Izgaraya hizala
            </Button>
            <div
              className="board-appearance"
              role="group"
              aria-label="Oyuncu görünümü"
            >
              <Button
                size="sm"
                variant={appearance === 'shirt' ? 'secondary' : 'ghost'}
                aria-pressed={appearance === 'shirt'}
                onClick={() => setAppearance('shirt')}
              >
                <TShirt />
                Forma
              </Button>
              <Button
                size="sm"
                variant={appearance === 'disc' ? 'secondary' : 'ghost'}
                aria-pressed={appearance === 'disc'}
                onClick={() => setAppearance('disc')}
              >
                <Circle />
                Disk
              </Button>
            </div>
          </div>
        </details>
        <div className="board-save-controls">
          <span
            className={dirty ? 'dirty-indicator dirty' : 'dirty-indicator'}
            role="status"
          >
            {saving
              ? 'Kaydediliyor…'
              : dirty
                ? 'Kaydedilmemiş değişiklik'
                : hasSaved
                  ? 'Kaydedildi'
                  : 'Henüz kaydedilmedi'}
          </span>
          {!readOnly ? (
            <Button
              className="ml-auto"
              onClick={() => void save()}
              disabled={saving || preview || (!onSave && !onSaveDocument)}
            >
              <FloppyDisk />
              Kaydet
            </Button>
          ) : null}
        </div>
      </div>
      {saveError && (
        <p className="scene-save-error" role="alert">
          {saveError} Taslağınız korunuyor. Çakışmada başka kaydı otomatik
          olarak ezmeyiz.
        </p>
      )}
      <div className="board-workspace">
        <div className="board-layout">
          {!readOnly ? (
            <aside className="board-tools">
              <fieldset disabled={editingLocked} className="board-tool-scroll">
                <p className="tool-heading">Araçlar</p>
                <button
                  aria-pressed={!panning}
                  onClick={() => setPanning(false)}
                  title="Seç ve taşı"
                >
                  <Cursor />
                  <span>Seç</span>
                </button>
                <button
                  aria-pressed={panning}
                  onClick={() => setPanning((value) => !value)}
                  title="Sahayı kaydır"
                >
                  <Hand />
                  <span>Kaydır</span>
                </button>
                {tools.map((tool, index) => {
                  const Icon = tool.icon ?? Circle;
                  return (
                    <button
                      key={`${tool.type}-${index}`}
                      title={tool.label}
                      disabled={saving || document.elements.length >= 250}
                      onClick={() => {
                        setPanning(false);
                        addElement(tool);
                      }}
                    >
                      <Icon />
                      <span>{tool.label}</span>
                    </button>
                  );
                })}
              </fieldset>
            </aside>
          ) : null}
          <div className="board-stage-shell">
            <div className="board-stage-caption">
              <span>TAKTİK ÇALIŞMA ALANI</span>
              <span>{document.elements.length} / 250 eleman</span>
            </div>
            <div
              className={`board-canvas-wrap${panning ? ' is-panning' : ''}`}
              ref={containerRef}
              tabIndex={0}
              role="region"
              aria-label="Saha; kaydırmak için ok tuşlarını kullanın"
              onPointerDownCapture={(event) => {
                if (!panning) return;
                const node = event.currentTarget;
                panOrigin.current = {
                  x: event.clientX,
                  y: event.clientY,
                  left: node.scrollLeft,
                  top: node.scrollTop,
                };
                node.setPointerCapture(event.pointerId);
                event.preventDefault();
                event.stopPropagation();
              }}
              onPointerMove={(event) => {
                const origin = panOrigin.current;
                if (!origin) return;
                event.currentTarget.scrollLeft =
                  origin.left - (event.clientX - origin.x);
                event.currentTarget.scrollTop =
                  origin.top - (event.clientY - origin.y);
              }}
              onPointerUp={(event) => {
                panOrigin.current = null;
                if (event.currentTarget.hasPointerCapture(event.pointerId))
                  event.currentTarget.releasePointerCapture(event.pointerId);
              }}
              onPointerCancel={() => {
                panOrigin.current = null;
              }}
            >
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
                  {renderBoard.elements.map((element) => (
                    <BoardNode
                      key={element.id}
                      element={element}
                      appearance={appearance}
                      multiSelected={
                        !preview &&
                        selectedIds.length > 1 &&
                        selectedIds.includes(element.id)
                      }
                      readOnly={editingLocked || panning}
                      onSelect={(additive) => {
                        if (!panning && !preview) {
                          selectElement(element.id, additive);
                          setInspectorTab('properties');
                        }
                      }}
                      onDragStart={() => {
                        dragIds.current = selectedIds.includes(element.id)
                          ? selectedIds
                          : [element.id];
                        setSelectedIds(dragIds.current);
                      }}
                      onDragMove={(x, y) => previewMove(element.id, x, y)}
                      onMove={(x, y) => moveElement(element.id, x, y)}
                      onTransform={(node) => transformElement(element, node)}
                    />
                  ))}
                  {!editingLocked && !panning ? (
                    <Transformer
                      ref={transformerRef}
                      rotateEnabled={selectedIds.length <= 1}
                      resizeEnabled={selectedIds.length <= 1}
                      shouldOverdrawWholeArea={false}
                      anchorSize={14}
                      borderStroke="#facc15"
                      anchorFill="#ffffff"
                      anchorStroke="#0a3156"
                      boundBoxFunc={(oldBox, newBox) =>
                        newBox.width < 12 || newBox.height < 12
                          ? oldBox
                          : newBox
                      }
                    />
                  ) : null}
                </Layer>
              </Stage>
            </div>
            <div
              className="board-view-controls"
              role="group"
              aria-label="Saha görünümü"
            >
              <Button
                size="icon"
                variant="ghost"
                aria-label="Uzaklaştır"
                disabled={zoom <= 1}
                onClick={() => setZoom((value) => Math.max(1, value - 0.25))}
              >
                <MagnifyingGlassMinus />
              </Button>
              <span>{Math.round(zoom * 100)}%</span>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Yakınlaştır"
                disabled={zoom >= 3}
                onClick={() => setZoom((value) => Math.min(3, value + 0.25))}
              >
                <MagnifyingGlassPlus />
              </Button>
              <Button size="sm" variant="ghost" onClick={fitPitch}>
                <CornersOut />
                Sahaya sığdır
              </Button>
            </div>
          </div>
        </div>
        {fullDocument.schemaVersion === 2 && (
          <PlaybackControls
            state={playbackState}
            durationMs={playback.durationMs}
            reducedMotion={playback.reducedMotion}
            disabled={saving}
            sceneTitle={
              fullDocument.scenes.find(
                (scene) => scene.id === playback.frame?.sceneId,
              )?.title
            }
            onPlay={() => {
              if (
                savingRef.current ||
                window.document.hidden ||
                window.document.querySelector(
                  '[role="dialog"], [role="alertdialog"], [role="listbox"]',
                )
              )
                return;
              setSelectedIds([]);
              transport.play();
            }}
            onPause={transport.pause}
            onSeek={transport.seek}
            onSpeed={transport.setSpeed}
            onLoop={transport.setLoop}
            onEdit={() =>
              selectScene(playback.frame?.sceneId ?? activeScene!.id)
            }
          />
        )}
        {fullDocument.schemaVersion === 2 ? (
          <SceneStrip
            document={fullDocument}
            selectedId={activeScene!.id}
            onSelect={selectScene}
            onEdit={changeScenes}
            readOnly={readOnly}
            busy={saving}
            editingLocked={preview}
          />
        ) : onSaveDocument && !readOnly ? (
          <div className="scene-strip scene-strip-heading">
            <span>
              Bu tahta tek sahnelidir. Dönüşüm taslakta kalır; Kaydet gerekir.
            </span>
            <Button
              variant="outline"
              disabled={saving}
              onClick={() => {
                if (savingRef.current) return;
                const next = createSequence(document, id());
                commitDocument(next);
                selectScene(next.scenes[0].id);
              }}
            >
              Animasyon oluştur
            </Button>
          </div>
        ) : null}
        <aside
          aria-label="Tahta özellikleri"
          className="board-inspector"
          hidden={!inspectorOpen}
        >
          <fieldset disabled={editingLocked} className="board-control-group">
            {!readOnly ? (
              <div className="board-multi-controls">
                <Button
                  size="sm"
                  variant={multiSelect ? 'secondary' : 'outline'}
                  aria-pressed={multiSelect}
                  onClick={() => setMultiSelect((value) => !value)}
                >
                  Çoklu seçim
                </Button>
                <p className="board-help">
                  Shift+tık veya çoklu seçim ile elemanları birleştirin.
                </p>
                <div className="board-team-selection">
                  {(['home', 'away'] as const).map((team) => (
                    <Button
                      key={team}
                      size="sm"
                      variant="ghost"
                      disabled={saving}
                      onClick={() => {
                        setSelectedIds(
                          document.elements
                            .filter(
                              (element) =>
                                (element.type === 'player' ||
                                  element.type === 'goalkeeper') &&
                                element.team === team,
                            )
                            .map((element) => element.id),
                        );
                        setInspectorTab('properties');
                      }}
                    >
                      {team === 'home' ? 'Ev takımını seç' : 'Rakibi seç'}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedIds([])}
                  >
                    Seçimi bırak
                  </Button>
                </div>
                {selectedIds.length ? (
                  <div
                    role="group"
                    aria-label="Seçili elemanları taşı"
                    className="board-nudge"
                  >
                    <span>
                      {
                        selectedIds.filter((value) =>
                          document.elements.some(
                            (element) => element.id === value,
                          ),
                        ).length
                      }{' '}
                      seçili
                    </span>
                    {(
                      [
                        ['Sola taşı', -20, 0, '←'],
                        ['Yukarı taşı', 0, -20, '↑'],
                        ['Aşağı taşı', 0, 20, '↓'],
                        ['Sağa taşı', 20, 0, '→'],
                      ] as const
                    ).map(([label, dx, dy, arrow]) => (
                      <Button
                        key={label}
                        size="icon"
                        variant="outline"
                        aria-label={label}
                        disabled={saving}
                        onClick={() => nudgeSelection(dx, dy)}
                      >
                        {arrow}
                      </Button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
            <Tabs value={inspectorTab} onValueChange={setInspectorTab}>
              <TabsList className="w-full">
                <TabsTrigger className="flex-1" value="layers">
                  Katmanlar
                </TabsTrigger>
                <TabsTrigger className="flex-1" value="properties">
                  Özellikler
                </TabsTrigger>
                {rosterSource && !readOnly ? (
                  <TabsTrigger className="flex-1" value="roster">
                    Kadro
                  </TabsTrigger>
                ) : null}
              </TabsList>
              <TabsContent value="layers">
                <ScrollArea className="board-layer-list">
                  {document.elements.length ? (
                    [...document.elements].reverse().map((element) => (
                      <button
                        className={
                          selectedIds.includes(element.id) ? 'selected' : ''
                        }
                        aria-pressed={selectedIds.includes(element.id)}
                        aria-label={`${labelFor(element)}${element.number ? ` · ${element.number}` : ''}${element.name ? ` · ${element.name}` : ''}${element.team === 'home' ? ' Ev' : element.team === 'away' ? ' Deplasman' : ''}`}
                        key={element.id}
                        onClick={(event) =>
                          selectElement(
                            element.id,
                            event.shiftKey || event.metaKey || event.ctrlKey,
                          )
                        }
                      >
                        <span>
                          {labelFor(element)}
                          {element.number ? ` · ${element.number}` : ''}
                          {element.name ? ` · ${element.name}` : ''}
                        </span>
                        <small>
                          {element.team === 'home'
                            ? 'Ev'
                            : element.team === 'away'
                              ? 'Deplasman'
                              : ''}
                        </small>
                      </button>
                    ))
                  ) : (
                    <p className="board-help">Henüz eleman yok.</p>
                  )}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="properties">
                {selectedIds.length > 1 ? (
                  <p className="board-help">
                    {selectedIds.length} eleman seçili. Bir elemanı sürükleyerek
                    veya yön düğmeleriyle birimi birlikte taşıyın. Boyut ve
                    dönüş için tek eleman seçin.
                  </p>
                ) : selected ? (
                  <Properties
                    element={selected}
                    onChange={(patch) => updateElement(selected.id, patch)}
                    readOnly={readOnly || saving}
                  />
                ) : (
                  <p className="board-help">
                    Özelliklerini düzenlemek için bir eleman seçin.
                  </p>
                )}
              </TabsContent>
              {rosterSource && !readOnly ? (
                <TabsContent value="roster">
                  <BoardRoster
                    key={`${rosterSource.clubId}:${rosterSource.teamId}`}
                    source={rosterSource}
                    disabled={saving}
                    addDisabled={document.elements.length >= 250}
                    assignment={{
                      slots: document.elements.filter(
                        (element) =>
                          element.type === 'player' ||
                          element.type === 'goalkeeper',
                      ),
                      selectedId,
                      onSelect: setSelectedId,
                      onAssign: (slot, name) => {
                        if (savingRef.current || readOnly || name.length > 80)
                          return;
                        const current = document.elements.find(
                          (element) => element.id === slot.id,
                        );
                        if (
                          !current ||
                          JSON.stringify(current) !== JSON.stringify(slot)
                        )
                          return;
                        updateElement(slot.id, { name, number: '' });
                        toast.success(
                          'Oyuncu formasyon yerine atandı. Değişikliği kaydetmeyi unutmayın.',
                        );
                      },
                    }}
                    onChoose={(name, goalkeeper) => {
                      if (savingRef.current || document.elements.length >= 250)
                        return;
                      addElement({
                        type: goalkeeper ? 'goalkeeper' : 'player',
                        label: 'Oyuncu',
                        patch: {
                          team: 'home',
                          name,
                          number: '',
                          ...(goalkeeper ? { size: 34 } : { radius: 24 }),
                        },
                      });
                    }}
                  />
                </TabsContent>
              ) : null}
            </Tabs>
            {!readOnly ? (
              <div className="board-selection-actions">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={duplicateSelected}
                  disabled={
                    !selectedIds.length ||
                    saving ||
                    document.elements.length + selectedIds.length > 250
                  }
                >
                  <Copy />
                  Çoğalt
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={removeSelected}
                  disabled={!selectedIds.length || saving}
                >
                  <Trash />
                  Sil
                </Button>
              </div>
            ) : null}
          </fieldset>
        </aside>
        {!readOnly ? (
          <fieldset className="board-footerbar" disabled={saving || preview}>
            <Select
              value={formation}
              onValueChange={(value) => setFormation(value as typeof formation)}
            >
              <SelectTrigger className="w-36" aria-label="Formasyon">
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
                    JSON.stringify(fullDocument),
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
                onClick={() =>
                  exportPng(
                    stageRef.current,
                    document,
                    activeScene
                      ? `ngcs-scene-${activeScene.id}.png`
                      : undefined,
                  )
                }
              >
                <DownloadSimple />
                {activeScene ? 'Seçili sahne PNG' : 'PNG'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  download(
                    activeScene
                      ? `ngcs-scene-${activeScene.id}.svg`
                      : 'ngcs-tactical-board.svg',
                    boardSvg(document, appearance),
                    'image/svg+xml',
                  )
                }
              >
                <DownloadSimple />
                {activeScene ? 'Seçili sahne SVG' : 'SVG'}
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
          </fieldset>
        ) : null}
      </div>
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

function ArtNodes({ shapes }: { shapes: BoardArt[] }) {
  return (
    <>
      {shapes.map((shape, index) => {
        const { type, ...props } = shape;
        if (type === 'circle') return <KCircle key={index} {...props} />;
        if (type === 'rect') return <Rect key={index} {...props} />;
        if (type === 'line')
          return (
            <Line key={index} {...props} lineJoin="round" lineCap="round" />
          );
        const { rotation, ...textProps } = props;
        return (
          <Group key={index} rotation={rotation}>
            <Text
              {...textProps}
              fontFamily="Inter, sans-serif"
              fontStyle="bold"
            />
          </Group>
        );
      })}
    </>
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
  return (
    <Group listening={false}>
      <ArtNodes shapes={pitchArt({ width, height, type })} />
    </Group>
  );
}

function BoardNode({
  element,
  appearance,
  multiSelected,
  readOnly,
  onSelect,
  onDragStart,
  onDragMove,
  onMove,
  onTransform,
}: {
  element: BoardElement;
  appearance: PlayerAppearance;
  multiSelected: boolean;
  readOnly: boolean;
  onSelect: (additive: boolean) => void;
  onDragStart: () => void;
  onDragMove: (x: number, y: number) => void;
  onMove: (x: number, y: number) => void;
  onTransform: (node: Konva.Node) => void;
}) {
  return (
    <Group
      id={element.id}
      x={element.x}
      y={element.y}
      rotation={element.rotation ?? 0}
      draggable={!readOnly}
      onClick={(event) =>
        onSelect(event.evt.shiftKey || event.evt.metaKey || event.evt.ctrlKey)
      }
      onTap={() => onSelect(false)}
      onDragStart={onDragStart}
      onDragMove={(event) => onDragMove(event.target.x(), event.target.y())}
      onDragEnd={(event) => onMove(event.target.x(), event.target.y())}
      onTransformEnd={(event) => onTransform(event.target)}
    >
      <ArtNodes shapes={elementArt(element, appearance)} />
      {multiSelected ? (
        <KCircle
          name="selection-hint"
          radius={36}
          stroke="#facc15"
          strokeWidth={2}
          dash={[4, 3]}
          listening={false}
        />
      ) : null}
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
      {element.type === 'player' || element.type === 'goalkeeper' ? (
        <label className="property-wide">
          Oyuncu adı
          <Input
            value={element.name ?? ''}
            maxLength={60}
            disabled={readOnly}
            onChange={(event) => onChange({ name: event.target.value })}
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
function exportPng(
  stage: Konva.Stage | null,
  board: TacticalBoardDocumentV1,
  filename = 'ngcs-tactical-board.png',
) {
  if (!stage) return;
  const exported = stage.clone({
    width: board.pitch.width,
    height: board.pitch.height,
    scaleX: 1,
    scaleY: 1,
  }) as Konva.Stage;
  try {
    exported.find('Transformer').forEach((node) => node.destroy());
    exported.find('.selection-hint').forEach((node) => node.destroy());
    const link = window.document.createElement('a');
    link.download = filename;
    link.href = exported.toDataURL({ pixelRatio: 2 });
    link.click();
  } finally {
    exported.destroy();
  }
}
