export const pitchConfigs = {
  full: { label: 'Tam saha', width: 1200, height: 800 },
  half: { label: 'Yarım saha', width: 800, height: 600 },
  third: { label: 'Üçte bir saha', width: 800, height: 450 },
  quarter: { label: 'Çeyrek saha', width: 800, height: 350 },
  mini7: { label: '7v7', width: 950, height: 650 },
  mini5: { label: '5v5', width: 800, height: 550 },
  training: { label: 'Antrenman alanı', width: 750, height: 550 },
  grid: { label: 'Grid', width: 650, height: 650 },
  penalty: { label: 'Penaltı alanı', width: 600, height: 500 },
  corner: { label: 'Korner alanı', width: 500, height: 500 },
  freekick: { label: 'Serbest vuruş', width: 600, height: 500 },
} as const;

export type PitchType = keyof typeof pitchConfigs;
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

export function emptyBoard(type: PitchType = 'full'): TacticalBoardDocumentV1 {
  const pitch = pitchConfigs[type];
  return {
    schemaVersion: 1,
    kind: 'tactical-board',
    pitch: { type, width: pitch.width, height: pitch.height },
    elements: [],
  };
}

export function validateBoard(value: unknown): TacticalBoardDocumentV1 {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Belge bir nesne olmalı.');
  }
  const document = value as Partial<TacticalBoardDocumentV1> &
    Record<string, unknown>;
  const allowedRoot = new Set(['schemaVersion', 'kind', 'pitch', 'elements']);
  if (Object.keys(document).some((key) => !allowedRoot.has(key))) {
    throw new Error('Belge bilinmeyen alan içeriyor.');
  }
  if (document.schemaVersion !== 1 || document.kind !== 'tactical-board') {
    throw new Error('Yalnız NGCS taktik tahta v1 belgeleri desteklenir.');
  }
  if (!document.pitch || typeof document.pitch !== 'object') {
    throw new Error('Saha bilgisi eksik.');
  }
  const pitch = document.pitch;
  const config = pitchConfigs[pitch.type as PitchType];
  if (
    !config ||
    pitch.width !== config.width ||
    pitch.height !== config.height
  ) {
    throw new Error('Saha türü veya ölçüleri geçersiz.');
  }
  if (!Array.isArray(document.elements) || document.elements.length > 250) {
    throw new Error('Tahta en fazla 250 eleman içerebilir.');
  }
  const ids = new Set<string>();
  for (const element of document.elements) {
    if (
      !element ||
      typeof element !== 'object' ||
      !element.id ||
      ids.has(element.id)
    ) {
      throw new Error('Eleman kimlikleri eksiksiz ve benzersiz olmalı.');
    }
    if (
      ![
        'player',
        'goalkeeper',
        'ball',
        'cone',
        'goal',
        'flag',
        'wall',
        'ladder',
        'marker',
        'arrow',
        'line',
        'zone',
        'text',
      ].includes(element.type)
    ) {
      throw new Error('Bilinmeyen tahta elemanı.');
    }
    if (
      !Number.isFinite(element.x) ||
      !Number.isFinite(element.y) ||
      element.x < 0 ||
      element.x > config.width ||
      element.y < 0 ||
      element.y > config.height
    ) {
      throw new Error('Eleman saha sınırları dışında.');
    }
    ids.add(element.id);
  }
  if (new Blob([JSON.stringify(document)]).size > 100_000) {
    throw new Error('Tahta belgesi 100 KB sınırını aşıyor.');
  }
  return document as TacticalBoardDocumentV1;
}

export const formations = [
  '4-4-2',
  '4-3-3',
  '4-2-3-1',
  '3-5-2',
  '3-4-3',
  '5-3-2',
] as const;

export function formationElements(
  formation: (typeof formations)[number],
  team: Team,
  width: number,
  height: number,
) {
  const lines = formation.split('-').map(Number);
  const direction = team === 'away' ? -1 : 1;
  const startX = team === 'away' ? width * 0.88 : width * 0.12;
  const available = width * 0.35;
  const colorNumber = team === 'home' ? 1 : 12;
  const elements: BoardElement[] = [
    {
      id: id(),
      type: 'goalkeeper',
      x: startX,
      y: height / 2,
      team,
      number: String(team === 'home' ? 1 : 12),
      size: 34,
    },
  ];
  lines.forEach((count, lineIndex) => {
    const x = startX + direction * available * ((lineIndex + 1) / lines.length);
    for (let index = 0; index < count; index += 1) {
      elements.push({
        id: id(),
        type: 'player',
        x,
        y: (height * (index + 1)) / (count + 1),
        team,
        number: String(colorNumber + elements.length),
        radius: 24,
      });
    }
  });
  return elements;
}

export function id() {
  return `el_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
