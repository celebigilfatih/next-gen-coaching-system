import type { BoardElement, TacticalBoardDocumentV1 } from './tactical-board';

/** Presentation only: these preferences never change a persisted V1 document. */
export type PlayerAppearance = 'shirt' | 'disc';
export type BoardArt = {
  type: 'rect' | 'circle' | 'line' | 'text';
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  points?: number[];
  closed?: boolean;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  dash?: number[];
  cornerRadius?: number;
  text?: string;
  fontSize?: number;
  align?: 'center' | 'left';
  rotation?: number;
};

const line = (
  points: number[],
  stroke = '#eef8f1',
  strokeWidth = 3,
): BoardArt => ({ type: 'line', points, stroke, strokeWidth });
const rect = (
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
): BoardArt => ({ type: 'rect', x, y, width, height, fill });
const circle = (
  x: number,
  y: number,
  radius: number,
  fill: string,
): BoardArt => ({ type: 'circle', x, y, radius, fill });

export function elementArt(
  element: BoardElement,
  appearance: PlayerAppearance = 'shirt',
): BoardArt[] {
  const color =
    element.color ??
    (element.team === 'away'
      ? '#ef5a62'
      : element.team === 'neutral'
        ? '#e6b33f'
        : '#2378ed');
  const size = typeof element.size === 'number' ? element.size : 24;
  switch (element.type) {
    case 'player':
    case 'goalkeeper': {
      const r = element.type === 'player' ? (element.radius ?? 24) : size / 1.4;
      const kit =
        element.type === 'goalkeeper'
          ? element.team === 'away'
            ? '#a855f7'
            : '#e6b33f'
          : color;
      const shapes: BoardArt[] =
        appearance === 'disc'
          ? [{ ...circle(0, 0, r, kit), stroke: '#ffffff', strokeWidth: 2.5 }]
          : [
              { ...circle(0, r * 0.83, r * 0.85, '#061827'), opacity: 0.16 },
              {
                type: 'line',
                points: [
                  -0.4, -1, -0.95, -0.75, -1.24, -0.18, -0.72, 0.04, -0.55,
                  -0.24, -0.55, 1, 0.55, 1, 0.55, -0.24, 0.72, 0.04, 1.24,
                  -0.18, 0.95, -0.75, 0.4, -1, 0.24, -0.8, -0.24, -0.8,
                ].map((n) => n * r),
                closed: true,
                fill: kit,
                stroke: '#ffffff',
                strokeWidth: 2,
              },
              line(
                [-r * 0.32, -r * 0.86, 0, -r * 0.61, r * 0.32, -r * 0.86],
                '#ffffff',
                2,
              ),
              {
                ...rect(-r * 0.42, -r * 0.4, r * 0.18, r * 1.28, '#ffffff'),
                opacity: 0.13,
              },
            ];
      shapes.push({
        type: 'text',
        x: -r,
        y: -r * 0.3,
        width: r * 2,
        text: element.number ?? (element.type === 'goalkeeper' ? '1' : ''),
        fontSize: Math.max(10, r * 0.7),
        fill: '#ffffff',
        align: 'center',
        rotation: -(element.rotation ?? 0),
      });
      if (element.name)
        shapes.push({
          type: 'text',
          x: -65,
          y: r + 9,
          width: 130,
          text: element.name,
          fontSize: 13,
          fill: '#ffffff',
          align: 'center',
          rotation: -(element.rotation ?? 0),
        });
      return shapes;
    }
    case 'ball': {
      const r = element.radius ?? 12;
      return [
        { ...circle(0, 0, r, '#f8fafc'), stroke: '#142e40', strokeWidth: 1.5 },
        {
          type: 'line',
          points: [
            0, -0.45, 0.43, -0.13, 0.27, 0.37, -0.27, 0.37, -0.43, -0.13,
          ].map((n) => n * r),
          closed: true,
          fill: '#183247',
        },
        ...[0, 1, 2, 3, 4].map((i) => {
          const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
          return line(
            [
              Math.cos(a) * r * 0.4,
              Math.sin(a) * r * 0.4,
              Math.cos(a) * r * 0.91,
              Math.sin(a) * r * 0.91,
            ],
            '#183247',
            1.5,
          );
        }),
      ];
    }
    case 'cone':
      return [
        {
          ...rect(-size * 0.7, size * 0.22, size * 1.4, size * 0.35, '#a95b10'),
          cornerRadius: 4,
        },
        {
          type: 'line',
          points: [-size * 0.53, size * 0.3, 0, -size, size * 0.53, size * 0.3],
          closed: true,
          fill: element.color ?? '#f6a623',
          stroke: '#ffdaa0',
          strokeWidth: 1.5,
        },
        line(
          [-size * 0.25, -size * 0.3, size * 0.25, -size * 0.3],
          '#fff5df',
          4,
        ),
      ];
    case 'goal': {
      const w = element.size === 'small' ? 60 : 100;
      return [
        { ...rect(-w / 2, -22, w, 44, '#cce5ef'), opacity: 0.18 },
        ...Array.from({ length: 9 }, (_, i) => ({
          ...line(
            [-w / 2 + (i * w) / 8, -22, -w / 2 + (i * w) / 8, 22],
            '#c9dce7',
            1,
          ),
          opacity: 0.75,
        })),
        ...[-22, -11, 0, 11, 22].map((y) =>
          line([-w / 2, y, w / 2, y], '#c9dce7', 1),
        ),
        line([-w / 2, 22, -w / 2, -22, w / 2, -22, w / 2, 22], '#ffffff', 5),
      ];
    }
    case 'flag': {
      const h = element.height ?? 60;
      return [
        circle(0, 0, 7, '#143b32'),
        line([0, 0, 0, -h], '#ffffff', 4),
        {
          type: 'line',
          points: [2, -h, 32, -h + 12, 2, -h + 25],
          closed: true,
          fill: element.color ?? '#f6a623',
          stroke: '#fff5df',
          strokeWidth: 1,
        },
      ];
    }
    case 'wall': {
      const w = element.width ?? 130;
      const count = Math.max(1, Math.round(w / 26));
      return Array.from({ length: count }, (_, i) => {
        const x = -w / 2 + ((i + 0.5) * w) / count;
        return [
          circle(x, -13, 6, '#ffd793'),
          {
            ...rect(x - 9, -5, 18, 28, element.color ?? '#f6a623'),
            cornerRadius: 5,
            stroke: '#ffe2ae',
            strokeWidth: 1.5,
          },
          line([x, 23, x, 30], '#e0e9ee', 3),
        ];
      }).flat();
    }
    case 'ladder': {
      const length = element.length ?? 140;
      const rungs = Math.max(2, Math.min(30, element.rungs ?? 6));
      return [
        line([-length / 2, -18, length / 2, -18], '#253c49', 6),
        line([-length / 2, 18, length / 2, 18], '#253c49', 6),
        ...Array.from({ length: rungs }, (_, i) => {
          const x = -length / 2 + (length * i) / (rungs - 1);
          return { ...rect(x - 3, -20, 6, 40, '#f7ce54'), cornerRadius: 2 };
        }),
      ];
    }
    case 'marker':
      return [
        {
          ...circle(0, 0, size / 2, element.color ?? '#f7ce54'),
          stroke: '#fff2c6',
          strokeWidth: 2,
        },
        circle(0, 0, size / 6, '#294638'),
      ];
    case 'arrow': {
      const dx = (element.endX ?? element.x) - element.x;
      const dy = (element.endY ?? element.y) - element.y;
      const points =
        element.style === 'curved'
          ? Array.from({ length: 21 }, (_, i) => {
              const t = i / 20;
              return [dx * t, 2 * (1 - t) * t * (dy - 50) + t * t * dy];
            }).flat()
          : [0, 0, dx, dy];
      const angle = Math.atan2(
        dy - points[points.length - 3],
        dx - points[points.length - 4],
      );
      const head = [
        dx,
        dy,
        dx - 16 * Math.cos(angle) + 7 * Math.sin(angle),
        dy - 16 * Math.sin(angle) - 7 * Math.cos(angle),
        dx - 16 * Math.cos(angle) - 7 * Math.sin(angle),
        dy - 16 * Math.sin(angle) + 7 * Math.cos(angle),
      ];
      return [
        {
          ...line(points, element.color ?? '#ffffff', element.thickness ?? 5),
          dash: element.style === 'dashed' ? [18, 12] : undefined,
        },
        {
          type: 'line',
          points: head,
          closed: true,
          fill: element.color ?? '#ffffff',
        },
      ];
    }
    case 'line':
      return [
        {
          ...line(
            element.points ?? [0, 0, 140, 0],
            element.color ?? '#ffffff',
            element.thickness ?? 4,
          ),
          dash: element.style === 'dashed' ? [16, 10] : undefined,
        },
      ];
    case 'zone':
      return [
        {
          ...rect(
            -(element.width ?? 180) / 2,
            -(element.height ?? 120) / 2,
            element.width ?? 180,
            element.height ?? 120,
            element.color ?? '#38bdf8',
          ),
          opacity: element.opacity ?? 0.25,
          stroke: element.color ?? '#38bdf8',
          strokeWidth: 3,
        },
      ];
    case 'text':
      return [
        {
          type: 'text',
          text: element.text ?? '',
          fontSize: element.fontSize ?? 26,
          fill: element.color ?? '#ffffff',
        },
      ];
  }
}

export function pitchArt(pitch: TacticalBoardDocumentV1['pitch']): BoardArt[] {
  const { width: w, height: h, type } = pitch;
  const white = '#e4eee5';
  const shapes: BoardArt[] = [rect(0, 0, w, h, '#285f49')];
  for (let i = 0; i < 10; i += 2)
    shapes.push(rect((i * w) / 10, 0, w / 10, h, '#2c664e'));
  shapes.push({
    ...rect(18, 18, w - 36, h - 36, 'transparent'),
    stroke: white,
    strokeWidth: 2.5,
  });
  if (type === 'training') return shapes;
  if (type === 'grid') {
    for (let i = 1; i < 8; i++)
      shapes.push(
        {
          ...line([(i * w) / 8, 18, (i * w) / 8, h - 18], white, 1),
          opacity: 0.4,
        },
        {
          ...line([18, (i * h) / 8, w - 18, (i * h) / 8], white, 1),
          opacity: 0.4,
        },
      );
    return shapes;
  }
  // Preserve the existing V1 field orientation; specialty pitch semantics evolve separately.
  shapes.push(
    line([w / 2, 18, w / 2, h - 18], white, 2.5),
    {
      ...circle(w / 2, h / 2, Math.min(w, h) * 0.13, 'transparent'),
      stroke: white,
      strokeWidth: 2.5,
    },
    circle(w / 2, h / 2, 3.5, white),
  );
  for (const right of [false, true]) {
    shapes.push(
      {
        ...rect(
          right ? w - 18 - w * 0.16 : 18,
          h * 0.24,
          w * 0.16,
          h * 0.52,
          'transparent',
        ),
        stroke: white,
        strokeWidth: 2.5,
      },
      {
        ...rect(
          right ? w - 18 - w * 0.055 : 18,
          h * 0.37,
          w * 0.055,
          h * 0.26,
          'transparent',
        ),
        stroke: white,
        strokeWidth: 2.5,
      },
      circle(right ? w - 18 - w * 0.11 : 18 + w * 0.11, h / 2, 3, white),
    );
  }
  return shapes;
}
