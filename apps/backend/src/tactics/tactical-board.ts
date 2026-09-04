import { BadRequestException } from '@nestjs/common';

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
  throw new BadRequestException(`Invalid tactical board document: ${detail}`);
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
  if (typeof type !== 'string' || !ELEMENT_KEYS[type])
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
    optionalString(element.color, `elements[${index}].color`, 32);
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

export function validateTacticalBoardDocument(value: unknown) {
  let byteLength = 0;
  try {
    byteLength = Buffer.byteLength(JSON.stringify(value), 'utf8');
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
  if (typeof pitch.type !== 'string' || !(pitch.type in PITCH_CONFIGS))
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

  return value as Record<string, unknown>;
}

export function isTacticalBoardDocument(value: unknown) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      (value as Record<string, unknown>).kind === TACTICAL_BOARD_KIND,
  );
}
