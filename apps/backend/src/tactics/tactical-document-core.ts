// Mirrored pure contract: frontend/backend parity is enforced by tests.
// Legacy V1 HTTP validators remain unchanged until BL-058b.
export const TACTICAL_BOARD_KIND = 'tactical-board' as const;
export const TACTICAL_BOARD_SCHEMA_VERSION = 1 as const;
export const MAX_TACTICAL_BOARD_ELEMENTS = 250;
export const MAX_TACTICAL_BOARD_BYTES = 100_000;

export const PITCH_CONFIGS = {
  full: { width: 1200, height: 800 },
  half: { width: 800, height: 600 },
  third: { width: 800, height: 450 },
  quarter: { width: 800, height: 350 },
  mini7: { width: 950, height: 650 },
  mini5: { width: 800, height: 550 },
  training: { width: 750, height: 550 },
  grid: { width: 650, height: 650 },
  penalty: { width: 600, height: 500 },
  corner: { width: 500, height: 500 },
  freekick: { width: 600, height: 500 },
} as const;

export type PitchType = keyof typeof PITCH_CONFIGS;

const ELEMENT_KEYS: Record<string, Set<string>> = {
  player: new Set(['team', 'number', 'name', 'radius']),
  goalkeeper: new Set(['team', 'number', 'name', 'size']),
  ball: new Set(['radius']),
  cone: new Set(['color', 'size']),
  goal: new Set(['size']),
  flag: new Set(['color', 'height']),
  wall: new Set(['width']),
  ladder: new Set(['length', 'rungs']),
  marker: new Set(['shape', 'color', 'size']),
  arrow: new Set(['endX', 'endY', 'color', 'thickness', 'style']),
  line: new Set(['points', 'color', 'thickness', 'style']),
  zone: new Set(['width', 'height', 'color', 'opacity']),
  text: new Set(['text', 'fontSize', 'color']),
};

const COMMON_KEYS = new Set(['id', 'type', 'x', 'y', 'rotation']);

function invalid(detail: string): never {
  throw new Error(`Invalid tactical board document: ${detail}`);
}

function object(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    invalid(`${label} must be an object`);
  }
  return value as Record<string, unknown>;
}

function finiteNumber(value: unknown, label: string, min: number, max: number) {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < min ||
    value > max
  ) {
    invalid(`${label} must be between ${min} and ${max}`);
  }
}

function optionalNumber(
  value: unknown,
  label: string,
  min: number,
  max: number,
) {
  if (value !== undefined) finiteNumber(value, label, min, max);
}

function optionalString(value: unknown, label: string, maxLength: number) {
  if (
    value !== undefined &&
    (typeof value !== 'string' || value.length > maxLength)
  ) {
    invalid(`${label} must be a string of at most ${maxLength} characters`);
  }
}

function optionalColor(value: unknown, label: string) {
  if (
    value !== undefined &&
    (typeof value !== 'string' ||
      !/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value))
  ) {
    invalid(`${label} must be a hexadecimal color`);
  }
}

function enumeration(value: unknown, label: string, values: readonly string[]) {
  if (typeof value !== 'string' || !values.includes(value)) {
    invalid(`${label} is not supported`);
  }
}

function validateElement(
  value: unknown,
  index: number,
  width: number,
  height: number,
) {
  const element = object(value, `elements[${index}]`);
  const type = element.type;
  if (
    typeof type !== 'string' ||
    !Object.prototype.hasOwnProperty.call(ELEMENT_KEYS, type)
  )
    invalid(`elements[${index}].type is not supported`);

  const allowed = new Set([...COMMON_KEYS, ...ELEMENT_KEYS[type]]);
  for (const key of Object.keys(element)) {
    if (!allowed.has(key)) invalid(`elements[${index}].${key} is not allowed`);
  }

  if (
    typeof element.id !== 'string' ||
    !/^[A-Za-z0-9_-]{1,80}$/.test(element.id)
  ) {
    invalid(`elements[${index}].id is invalid`);
  }
  finiteNumber(element.x, `elements[${index}].x`, 0, width);
  finiteNumber(element.y, `elements[${index}].y`, 0, height);
  optionalNumber(element.rotation, `elements[${index}].rotation`, -360, 360);

  if (type === 'player' || type === 'goalkeeper') {
    enumeration(element.team, `elements[${index}].team`, [
      'home',
      'away',
      'neutral',
    ]);
    optionalString(element.number, `elements[${index}].number`, 4);
    optionalString(element.name, `elements[${index}].name`, 80);
  }
  if (type === 'player')
    optionalNumber(element.radius, `elements[${index}].radius`, 8, 80);
  if (type === 'goalkeeper')
    optionalNumber(element.size, `elements[${index}].size`, 12, 100);
  if (type === 'ball')
    optionalNumber(element.radius, `elements[${index}].radius`, 4, 40);
  if (
    ['cone', 'flag', 'marker', 'arrow', 'line', 'zone', 'text'].includes(type)
  ) {
    optionalColor(element.color, `elements[${index}].color`);
  }
  if (type === 'cone' || type === 'marker')
    optionalNumber(element.size, `elements[${index}].size`, 4, 100);
  if (type === 'goal')
    enumeration(element.size, `elements[${index}].size`, ['small', 'large']);
  if (type === 'flag')
    optionalNumber(element.height, `elements[${index}].height`, 10, 200);
  if (type === 'wall')
    finiteNumber(element.width, `elements[${index}].width`, 10, width);
  if (type === 'ladder') {
    finiteNumber(element.length, `elements[${index}].length`, 20, width);
    finiteNumber(element.rungs, `elements[${index}].rungs`, 2, 30);
  }
  if (type === 'marker')
    enumeration(element.shape, `elements[${index}].shape`, [
      'circle',
      'square',
      'triangle',
      'x',
    ]);
  if (type === 'arrow') {
    finiteNumber(element.endX, `elements[${index}].endX`, 0, width);
    finiteNumber(element.endY, `elements[${index}].endY`, 0, height);
    finiteNumber(element.thickness, `elements[${index}].thickness`, 1, 20);
    enumeration(element.style, `elements[${index}].style`, [
      'straight',
      'curved',
      'dashed',
    ]);
  }
  if (type === 'line') {
    if (
      !Array.isArray(element.points) ||
      element.points.length < 4 ||
      element.points.length > 500 ||
      element.points.some(
        (point) => typeof point !== 'number' || !Number.isFinite(point),
      )
    ) {
      invalid(`elements[${index}].points is invalid`);
    }
    finiteNumber(element.thickness, `elements[${index}].thickness`, 1, 20);
    enumeration(element.style, `elements[${index}].style`, ['solid', 'dashed']);
  }
  if (type === 'zone') {
    finiteNumber(element.width, `elements[${index}].width`, 5, width);
    finiteNumber(element.height, `elements[${index}].height`, 5, height);
    finiteNumber(element.opacity, `elements[${index}].opacity`, 0.05, 1);
  }
  if (type === 'text') {
    if (typeof element.text !== 'string' || element.text.length > 500)
      invalid(`elements[${index}].text is invalid`);
    finiteNumber(element.fontSize, `elements[${index}].fontSize`, 8, 96);
  }
}

export function validateStaticBoard(value: unknown) {
  let byteLength = 0;
  try {
    byteLength = new TextEncoder().encode(JSON.stringify(value)).byteLength;
  } catch {
    invalid('document must be JSON serializable');
  }
  if (byteLength > MAX_TACTICAL_BOARD_BYTES)
    invalid(`document exceeds ${MAX_TACTICAL_BOARD_BYTES} bytes`);

  const document = object(value, 'document');
  const allowedRoot = new Set(['schemaVersion', 'kind', 'pitch', 'elements']);
  for (const key of Object.keys(document))
    if (!allowedRoot.has(key)) invalid(`${key} is not allowed`);
  if (
    document.schemaVersion !== TACTICAL_BOARD_SCHEMA_VERSION ||
    document.kind !== TACTICAL_BOARD_KIND
  ) {
    invalid('schemaVersion or kind is not supported');
  }

  const pitch = object(document.pitch, 'pitch');
  for (const key of Object.keys(pitch))
    if (!['type', 'width', 'height'].includes(key))
      invalid(`pitch.${key} is not allowed`);
  if (
    typeof pitch.type !== 'string' ||
    !Object.prototype.hasOwnProperty.call(PITCH_CONFIGS, pitch.type)
  )
    invalid('pitch.type is not supported');
  const config = PITCH_CONFIGS[pitch.type as PitchType];
  if (pitch.width !== config.width || pitch.height !== config.height)
    invalid('pitch dimensions must match the canonical pitch type');

  if (
    !Array.isArray(document.elements) ||
    document.elements.length > MAX_TACTICAL_BOARD_ELEMENTS
  ) {
    invalid(
      `elements must contain at most ${MAX_TACTICAL_BOARD_ELEMENTS} entries`,
    );
  }
  const ids = new Set<string>();
  document.elements.forEach((element, index) => {
    validateElement(element, index, config.width, config.height);
    const id = (element as { id: string }).id;
    if (ids.has(id)) invalid(`elements[${index}].id must be unique`);
    ids.add(id);
  });

  return value as TacticalBoardDocumentV1;
}

export function isTacticalBoardDocument(value: unknown) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      (value as Record<string, unknown>).kind === TACTICAL_BOARD_KIND,
  );
}

export type Team = 'home' | 'away' | 'neutral';
export type BoardElementType =
  | 'player'
  | 'goalkeeper'
  | 'ball'
  | 'cone'
  | 'goal'
  | 'flag'
  | 'wall'
  | 'ladder'
  | 'marker'
  | 'arrow'
  | 'line'
  | 'zone'
  | 'text';

export type BoardElement = {
  id: string;
  type: BoardElementType;
  x: number;
  y: number;
  rotation?: number;
  team?: Team;
  number?: string;
  name?: string;
  radius?: number;
  size?: number | 'small' | 'large';
  color?: string;
  height?: number;
  width?: number;
  length?: number;
  rungs?: number;
  shape?: 'circle' | 'square' | 'triangle' | 'x';
  endX?: number;
  endY?: number;
  thickness?: number;
  style?: 'straight' | 'curved' | 'dashed' | 'solid';
  points?: number[];
  opacity?: number;
  text?: string;
  fontSize?: number;
};

export type TacticalBoardDocumentV1 = {
  schemaVersion: 1;
  kind: 'tactical-board';
  pitch: { type: PitchType; width: number; height: number };
  elements: BoardElement[];
};

export const MAX_TACTICAL_SCENES = 12;
export const MAX_SCENE_ELEMENT_INSTANCES = 1_500;
export const MAX_TACTICAL_SEQUENCE_BYTES = 500_000;
export const MAX_TACTICAL_DURATION_MS = 120_000;

export type TacticalScene = {
  id: string;
  title: string;
  holdMs: number;
  transition: 'cut' | 'linear';
  transitionMs: number;
  board: TacticalBoardDocumentV1;
};
export type TacticalBoardDocumentV2 = {
  schemaVersion: 2;
  kind: 'tactical-board';
  scenes: TacticalScene[];
};
export type TacticalDocument =
  | TacticalBoardDocumentV1
  | TacticalBoardDocumentV2;

function exactKeys(value: Record<string, unknown>, keys: readonly string[]) {
  if (Object.keys(value).some((key) => !keys.includes(key)))
    invalid('unknown field');
}
function integer(value: unknown, min: number, max: number) {
  finiteNumber(value, 'duration', min, max);
  if (!Number.isInteger(value)) invalid('duration must be an integer');
}

/** New opt-in boundary only; never auto-converts or downgrades documents. */
export function validateTacticalDocument(value: unknown): TacticalDocument {
  const document = object(value, 'document');
  if (document.schemaVersion === 1) return validateStaticBoard(value);
  if (document.schemaVersion !== 2 || document.kind !== TACTICAL_BOARD_KIND)
    invalid('schemaVersion or kind is not supported');
  exactKeys(document, ['schemaVersion', 'kind', 'scenes']);
  let bytes: number;
  try {
    bytes = new TextEncoder().encode(JSON.stringify(value)).byteLength;
  } catch {
    invalid('document must be JSON serializable');
  }
  if (bytes > MAX_TACTICAL_SEQUENCE_BYTES)
    invalid('sequence byte limit exceeded');
  if (
    !Array.isArray(document.scenes) ||
    !document.scenes.length ||
    document.scenes.length > MAX_TACTICAL_SCENES
  )
    invalid('scene count out of range');
  const sceneIds = new Set<string>();
  const elementTypes = new Map<string, string>();
  let pitch: TacticalBoardDocumentV1['pitch'] | undefined;
  let count = 0;
  let duration = 0;
  const scenes = document.scenes.map((raw, index): TacticalScene => {
    const scene = object(raw, 'scene');
    exactKeys(scene, [
      'id',
      'title',
      'holdMs',
      'transition',
      'transitionMs',
      'board',
    ]);
    if (
      typeof scene.id !== 'string' ||
      !/^[A-Za-z0-9_-]{1,80}$/.test(scene.id) ||
      sceneIds.has(scene.id)
    )
      invalid('scene id must be valid and unique');
    sceneIds.add(scene.id);
    if (
      typeof scene.title !== 'string' ||
      !scene.title.trim() ||
      scene.title.trim().length > 80
    )
      invalid('scene title must contain 1–80 characters');
    integer(scene.holdMs, 0, 30_000);
    enumeration(scene.transition, 'transition', ['cut', 'linear']);
    integer(
      scene.transitionMs,
      scene.transition === 'cut' ? 0 : 100,
      scene.transition === 'cut' ? 0 : 10_000,
    );
    if (
      index === (document.scenes as unknown[]).length - 1 &&
      (scene.transition !== 'cut' ||
        scene.transitionMs !== 0 ||
        (scene.holdMs as number) < 1)
    )
      invalid('last scene must hold and end with cut/0');
    const board = validateStaticBoard(scene.board);
    if (
      pitch &&
      (pitch.type !== board.pitch.type ||
        pitch.width !== board.pitch.width ||
        pitch.height !== board.pitch.height)
    )
      invalid('scene pitches must match');
    pitch = board.pitch;
    count += board.elements.length;
    duration += (scene.holdMs as number) + (scene.transitionMs as number);
    for (const element of board.elements) {
      const previous = elementTypes.get(element.id);
      if (previous && previous !== element.type)
        invalid('element id changes type across scenes');
      elementTypes.set(element.id, element.type);
    }
    return {
      id: scene.id,
      title: scene.title.trim(),
      holdMs: scene.holdMs as number,
      transition: scene.transition as TacticalScene['transition'],
      transitionMs: scene.transitionMs as number,
      board,
    };
  });
  if (count > MAX_SCENE_ELEMENT_INSTANCES)
    invalid('total element limit exceeded');
  if (duration < 1 || duration > MAX_TACTICAL_DURATION_MS)
    invalid('total duration out of range');
  return { schemaVersion: 2, kind: TACTICAL_BOARD_KIND, scenes };
}

export type TacticalFrame = {
  board: TacticalBoardDocumentV1;
  sceneId: string | null;
  sceneIndex: number;
  phase: 'hold' | 'transition' | 'finished';
  progress: number;
  timeMs: number;
};

/**
 * Validates/clones once, then samples by absolute media time, not accumulated frames.
 * No requestAnimationFrame, state mutation, HTTP or persistence in this core.
 * The caller owns clock, speed, pause and loop; returned frames never alias input.
 */
export function createTacticalPlayback(value: unknown) {
  const document = structuredClone(validateTacticalDocument(value));
  const scenes = document.schemaVersion === 2 ? document.scenes : [];
  const durationMs = scenes.reduce(
    (sum, scene) => sum + scene.holdMs + scene.transitionMs,
    0,
  );
  const starts: number[] = [];
  let elapsed = 0;
  for (const scene of scenes) {
    starts.push(elapsed);
    elapsed += scene.holdMs + scene.transitionMs;
  }
  function frameAt(requestedMs: number): TacticalFrame {
    if (!Number.isFinite(requestedMs)) invalid('playback time must be finite');
    const timeMs = Math.max(0, Math.min(durationMs, requestedMs));
    if (document.schemaVersion === 1)
      return {
        board: structuredClone(document),
        sceneId: null,
        sceneIndex: 0,
        phase: 'finished',
        progress: 1,
        timeMs: 0,
      };
    const lastIndex = scenes.length - 1;
    if (timeMs >= durationMs)
      return {
        board: structuredClone(scenes[lastIndex].board),
        sceneId: scenes[lastIndex].id,
        sceneIndex: lastIndex,
        phase: 'finished',
        progress: 1,
        timeMs,
      };
    for (let index = 0; index < scenes.length; index++) {
      const scene = scenes[index];
      const localTime = timeMs - starts[index];
      if (localTime < scene.holdMs)
        return {
          board: structuredClone(scene.board),
          sceneId: scene.id,
          sceneIndex: index,
          phase: 'hold',
          progress: 0,
          timeMs,
        };
      if (
        scene.transition === 'linear' &&
        localTime < scene.holdMs + scene.transitionMs
      ) {
        const board = structuredClone(scene.board);
        const progress = (localTime - scene.holdMs) / scene.transitionMs;
        const destination = new Map(
          scenes[index + 1].board.elements.map((element) => [
            element.id,
            element,
          ]),
        );
        board.elements = board.elements.map((element) => {
          const target = destination.get(element.id);
          if (
            !target ||
            target.type !== element.type ||
            !['player', 'goalkeeper', 'ball'].includes(element.type)
          )
            return element;
          return {
            ...element,
            x: element.x + (target.x - element.x) * progress,
            y: element.y + (target.y - element.y) * progress,
          };
        });
        return {
          board,
          sceneId: scene.id,
          sceneIndex: index,
          phase: 'transition',
          progress,
          timeMs,
        };
      }
    }
    // Validation guarantees a positive final hold; this cannot occur.
    throw new Error('Invalid tactical timeline');
  }
  return { durationMs, frameAt };
}
