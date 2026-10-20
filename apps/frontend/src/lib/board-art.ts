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
            : '#f7c630'
          : color;
      const shapes: BoardArt[] =
        appearance === 'disc'
          ? [{ ...circle(0, 0, r, kit), stroke: '#ffffff', strokeWidth: 2.5 }]
          : [
              {
                ...rect(-r * 0.68, -r * 0.7, r * 1.48, r * 1.9, '#071d2b'),
                cornerRadius: r * 0.25,
                opacity: 0.22,
              },
              {
                type: 'line',
                points: [
                  -0.4, -1, -0.95, -0.75, -1.24, -0.18, -0.72, 0.04, -0.55,
                  -0.24, -0.55, 1, 0.55, 1, 0.55, -0.24, 0.72, 0.04, 1.24,
                  -0.18, 0.95, -0.75, 0.4, -1, 0.24, -0.8, -0.24, -0.8,
                ].map((n) => n * r),
                closed: true,
                fill: kit,
                stroke: '#102439',
                strokeWidth: 2,
              },
              {
                type: 'line',
                points: [-0.55, -0.24, -0.36, -0.1, -0.36, 0.94, -0.55, 1].map(
                  (n) => n * r,
                ),
                closed: true,
                fill: '#08263d',
                opacity: 0.24,
              },
              {
                type: 'line',
                points: [0.55, -0.24, 0.36, -0.1, 0.36, 0.94, 0.55, 1].map(
                  (n) => n * r,
                ),
                closed: true,
                fill: '#08263d',
                opacity: 0.24,
              },
              line(
                [-r * 0.88, -r * 0.72, -r * 0.47, -r * 0.91],
                '#ffffff',
                r * 0.1,
              ),
              line(
                [r * 0.88, -r * 0.72, r * 0.47, -r * 0.91],
                '#ffffff',
                r * 0.1,
              ),
              line(
                [-r * 0.32, -r * 0.86, 0, -r * 0.61, r * 0.32, -r * 0.86],
                '#102439',
                2,
              ),
              {
                ...rect(-r * 0.3, -r * 0.43, r * 0.6, r * 0.22, '#ffffff'),
                cornerRadius: 3,
                opacity: 0.13,
              },
              line([-r * 0.48, r * 0.89, r * 0.48, r * 0.89], '#102439', 1.5),
            ];
      if (element.type === 'goalkeeper' && appearance === 'shirt') {
        // Long sleeves and gloves distinguish the role even without kit color.
        for (const side of [-1, 1]) {
          shapes.push(
            {
              type: 'line',
              points: [
                side * r * 0.95,
                -r * 0.5,
                side * r * 1.2,
                r * 0.35,
                side * r * 0.86,
                r * 0.5,
                side * r * 0.65,
                -r * 0.18,
              ],
              closed: true,
              fill: kit,
              stroke: '#102439',
              strokeWidth: 2,
            },
            {
              ...rect(
                side * r * 1.02 - r * 0.18,
                r * 0.29,
                r * 0.36,
                r * 0.42,
                '#1b3046',
              ),
              cornerRadius: r * 0.1,
              stroke: '#102439',
              strokeWidth: 1.5,
            },
          );
        }
      }
      shapes.push({
        type: 'text',
        x: -r,
        y: -r * 0.3,
        width: r * 2,
        text: element.number ?? (element.type === 'goalkeeper' ? '1' : ''),
        fontSize: Math.max(10, r * 0.7),
        fill:
          element.type === 'goalkeeper' && appearance === 'shirt'
            ? '#102439'
            : '#ffffff',
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
      // Classic stitched football: one central pentagon, five edge panels and
      // fine seams. Keep every panel inside the ball, including in SVG exports.
      const panel = (
        cx: number,
        cy: number,
        radius: number,
        angle: number,
      ) => ({
        type: 'line' as const,
        points: Array.from({ length: 5 }, (_, i) => {
          const a = angle + (i * Math.PI * 2) / 5;
          const x = cx + Math.cos(a) * radius;
          const y = cy + Math.sin(a) * radius;
          const factor = Math.min(1, (r * 0.96) / Math.hypot(x, y));
          return [x * factor, y * factor];
        }).flat(),
        closed: true,
        fill: '#17212b',
      });
      return [
        { ...circle(r * 0.12, r * 0.2, r * 1.04, '#0c2530'), opacity: 0.2 },
        {
          ...circle(0, 0, r, '#ffffff'),
          stroke: '#17212b',
          strokeWidth: Math.max(0.8, r * 0.07),
        },
        { ...circle(r * 0.14, r * 0.18, r * 0.79, '#dce5e9'), opacity: 0.32 },
        ...[0, 1, 2, 3, 4].flatMap((i) => {
          const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
          return [
            line(
              [
                Math.cos(a) * r * 0.34,
                Math.sin(a) * r * 0.34,
                Math.cos(a) * r * 0.72,
                Math.sin(a) * r * 0.72,
              ],
              '#82929d',
              Math.max(0.45, r * 0.045),
            ),
            panel(
              Math.cos(a) * r * 0.87,
              Math.sin(a) * r * 0.87,
              r * 0.22,
              a + Math.PI,
            ),
          ];
        }),
        panel(0, 0, r * 0.36, -Math.PI / 2),
        { ...circle(-r * 0.28, -r * 0.48, r * 0.12, '#ffffff'), opacity: 0.8 },
      ];
    }
    case 'cone': {
      const orange = element.color ?? '#f97316';
      return [
        {
          ...rect(-size * 0.76, size * 0.3, size * 1.52, size * 0.3, '#102439'),
          cornerRadius: size * 0.12,
        },
        {
          ...rect(-size * 0.67, size * 0.24, size * 1.34, size * 0.22, orange),
          cornerRadius: size * 0.1,
          stroke: '#102439',
          strokeWidth: 1.4,
        },
        {
          type: 'line',
          points: [
            -size * 0.55,
            size * 0.3,
            -size * 0.12,
            -size * 0.95,
            size * 0.12,
            -size * 0.95,
            size * 0.55,
            size * 0.3,
          ],
          closed: true,
          fill: orange,
          stroke: '#102439',
          strokeWidth: 1.8,
        },
        {
          type: 'line',
          points: [
            -size * 0.28,
            -size * 0.48,
            size * 0.28,
            -size * 0.48,
            size * 0.37,
            -size * 0.22,
            -size * 0.37,
            -size * 0.22,
          ],
          closed: true,
          fill: '#ffffff',
        },
        {
          type: 'line',
          points: [
            -size * 0.44,
            -size * 0.02,
            size * 0.44,
            -size * 0.02,
            size * 0.51,
            size * 0.18,
            -size * 0.51,
            size * 0.18,
          ],
          closed: true,
          fill: '#ffffff',
        },
        line(
          [-size * 0.07, -size * 0.8, -size * 0.15, -size * 0.57],
          '#ffcc9a',
          2,
        ),
      ];
    }
    case 'goal': {
      const w = element.size === 'small' ? 60 : 100;
      return [
        {
          ...rect(-w / 2 + 3, -18, w, 47, '#102439'),
          opacity: 0.16,
          cornerRadius: 3,
        },
        { ...rect(-w / 2 + 4, -18, w - 8, 36, '#dcebf4'), opacity: 0.12 },
        ...Array.from({ length: 9 }, (_, i) =>
          line(
            [
              -w / 2 + 4 + (i * (w - 8)) / 8,
              -18,
              -w / 2 + 4 + (i * (w - 8)) / 8,
              20,
            ],
            '#9bafbb',
            1.2,
          ),
        ),
        ...[-18, -8, 2, 12, 20].map((y) =>
          line([-w / 2 + 4, y, w / 2 - 4, y], '#9bafbb', 1.2),
        ),
        line(
          [-w / 2 + 7, 20, -w / 2 + 7, -15, w / 2 - 7, -15, w / 2 - 7, 20],
          '#9bafbb',
          2,
        ),
        line([-w / 2, 22, -w / 2, -22, w / 2, -22, w / 2, 22], '#102439', 8),
        line([-w / 2, 22, -w / 2, -22, w / 2, -22, w / 2, 22], '#ffffff', 4.5),
        line([-w / 2 - 2, 23, -w / 2 + 4, 23], '#102439', 3),
        line([w / 2 - 4, 23, w / 2 + 2, 23], '#102439', 3),
      ];
    }
    case 'flag': {
      const h = element.height ?? 60;
      return [
        {
          ...rect(-8, -2, 16, 7, '#1b3046'),
          cornerRadius: 3,
          stroke: '#102439',
          strokeWidth: 1.5,
        },
        line([0, 0, 0, -h], '#102439', 6),
        line([0, -1, 0, -h], '#ffffff', 2.5),
        {
          type: 'line',
          points: [2, -h, 32, -h + 12, 2, -h + 25],
          closed: true,
          fill: element.color ?? '#f6a623',
          stroke: '#102439',
          strokeWidth: 1.8,
        },
        line([5, -h + 5, 20, -h + 11], '#fff5df', 1.5),
      ];
    }
    case 'wall': {
      const w = element.width ?? 130;
      const count = Math.max(1, Math.round(w / 28));
      const amber = element.color ?? '#f7c630';
      return Array.from({ length: count }, (_, i) => {
        const x = -w / 2 + ((i + 0.5) * w) / count;
        return [
          { ...circle(x, -14, 6, amber), stroke: '#102439', strokeWidth: 1.5 },
          {
            ...rect(x - 11, -6, 22, 26, amber),
            cornerRadius: 3,
            stroke: '#102439',
            strokeWidth: 1.8,
          },
          ...[-5, 0, 5].map((dx) =>
            line([x + dx, -1, x + dx, 14], '#805c16', 1.4),
          ),
          ...[-4, 4].map((dx) =>
            line([x + dx, 20, x + dx, 33], '#102439', 3.5),
          ),
          {
            ...rect(x - 13, 31, 26, 6, '#1b3046'),
            cornerRadius: 2,
            stroke: '#102439',
            strokeWidth: 1.2,
          },
        ];
      }).flat();
    }
    case 'ladder': {
      const length = element.length ?? 140;
      const rungs = Math.max(2, Math.min(30, element.rungs ?? 6));
      return [
        line([-length / 2, -18, length / 2, -18], '#102439', 6),
        line([-length / 2, 18, length / 2, 18], '#102439', 6),
        ...Array.from({ length: rungs }, (_, i) => {
          const x = -length / 2 + (length * i) / (rungs - 1);
          return {
            ...rect(x - 3, -20, 6, 40, element.color ?? '#f7c630'),
            cornerRadius: 2,
            stroke: '#102439',
            strokeWidth: 1.5,
          };
        }),
      ];
    }
    case 'marker':
      return [
        {
          ...circle(0, 0, size / 2, element.color ?? '#f7ce54'),
          stroke: '#102439',
          strokeWidth: 2,
        },
        circle(0, 0, size / 6, '#102439'),
        {
          ...circle(-size * 0.17, -size * 0.19, size * 0.07, '#ffffff'),
          opacity: 0.7,
        },
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
  const white = '#eef7ef';
  const shapes: BoardArt[] = [rect(0, 0, w, h, '#246347')];
  for (let i = 0; i < 10; i += 2)
    shapes.push(rect((i * w) / 10, 0, w / 10, h, '#296e50'));
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
  // Crop one canonical football layout, rather than drawing two goals on every template.
  // These are rendering coordinates, not new document fields or regulation-size claims.
  const length = type === 'mini7' ? 70 : type === 'mini5' ? 40 : 105;
  const breadth = type === 'mini7' ? 50 : type === 'mini5' ? 30 : 68;
  const crop: [number, number, number, number] =
    type === 'half'
      ? [0, 0, 52.5, 68]
      : type === 'third'
        ? [0, 0, 35, 68]
        : type === 'quarter'
          ? [0, 0, 52.5, 34]
          : type === 'penalty'
            ? [0, 10, 25, 58]
            : type === 'corner'
              ? [0, 0, 26.25, 34]
              : type === 'freekick'
                ? [0, 0, 42, 68]
                : [0, 0, length, breadth];
  const [left, top, right, bottom] = crop;
  const px = (x: number) => 18 + ((x - left) / (right - left)) * (w - 36);
  const py = (y: number) => 18 + ((y - top) / (bottom - top)) * (h - 36);
  const draw = (points: number[], thickness = 2.5) => {
    let path: number[] = [];
    const flush = () => {
      if (path.length > 2) shapes.push(line(path, white, thickness));
      path = [];
    };
    for (let i = 0; i < points.length - 2; i += 2) {
      const clipped = clipPitchSegment(points.slice(i, i + 4), crop);
      if (!clipped) {
        flush();
        continue;
      }
      const [x1, y1, x2, y2] = clipped;
      const start = [px(x1), py(y1)];
      if (
        path.length &&
        (Math.abs(path[path.length - 2] - start[0]) > 0.01 ||
          Math.abs(path[path.length - 1] - start[1]) > 0.01)
      )
        flush();
      if (!path.length) path.push(...start);
      path.push(px(x2), py(y2));
    }
    flush();
  };
  const arc = (
    cx: number,
    cy: number,
    radius: number,
    from: number,
    to: number,
  ) => {
    const points = Array.from({ length: 65 }, (_, i) => {
      const angle = from + ((to - from) * i) / 64;
      return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius];
    }).flat();
    draw(points);
  };
  const spot = (x: number, y: number) => {
    if (x >= left && x <= right && y >= top && y <= bottom)
      shapes.push(circle(px(x), py(y), 3, white));
  };
  draw([length / 2, 0, length / 2, breadth]);
  const centreRadius = type === 'mini5' ? 3 : type === 'mini7' ? 6 : 9.15;
  arc(length / 2, breadth / 2, centreRadius, 0, Math.PI * 2);
  spot(length / 2, breadth / 2);
  const depth = type === 'mini5' ? 6 : type === 'mini7' ? 12 : 16.5;
  const boxHalf = type === 'mini5' ? 8 : type === 'mini7' ? 14 : 20.16;
  const smallDepth = type === 'mini5' ? 2 : type === 'mini7' ? 4 : 5.5;
  const smallHalf = type === 'mini5' ? 4 : type === 'mini7' ? 7 : 9.16;
  const penaltySpot = type === 'mini5' ? 4 : type === 'mini7' ? 8 : 11;
  for (const far of [false, true]) {
    const x = (value: number) => (far ? length - value : value);
    draw([
      x(0),
      breadth / 2 - boxHalf,
      x(depth),
      breadth / 2 - boxHalf,
      x(depth),
      breadth / 2 + boxHalf,
      x(0),
      breadth / 2 + boxHalf,
    ]);
    draw([
      x(0),
      breadth / 2 - smallHalf,
      x(smallDepth),
      breadth / 2 - smallHalf,
      x(smallDepth),
      breadth / 2 + smallHalf,
      x(0),
      breadth / 2 + smallHalf,
    ]);
    draw(
      [
        x(0),
        breadth / 2 - (type === 'mini5' ? 1.5 : 3.66),
        x(0),
        breadth / 2 + (type === 'mini5' ? 1.5 : 3.66),
      ],
      5,
    );
    spot(x(penaltySpot), breadth / 2);
    const angle = Math.acos((depth - penaltySpot) / centreRadius);
    arc(
      x(penaltySpot),
      breadth / 2,
      centreRadius,
      far ? Math.PI - angle : -angle,
      far ? Math.PI + angle : angle,
    );
  }
  arc(0, 0, 1, 0, Math.PI / 2);
  arc(length, 0, 1, Math.PI / 2, Math.PI);
  arc(0, breadth, 1, -Math.PI / 2, 0);
  arc(length, breadth, 1, Math.PI, Math.PI * 1.5);
  return shapes;
}

/** Liang–Barsky segment clipping keeps cropped circles/boxes inside every export. */
function clipPitchSegment(
  [x, y, endX, endY]: number[],
  [left, top, right, bottom]: [number, number, number, number],
): number[] | null {
  const dx = endX - x;
  const dy = endY - y;
  let start = 0;
  let end = 1;
  const p = [-dx, dx, -dy, dy];
  const q = [x - left, right - x, y - top, bottom - y];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return null;
      continue;
    }
    const ratio = q[i] / p[i];
    if (p[i] < 0) start = Math.max(start, ratio);
    else end = Math.min(end, ratio);
    if (start > end) return null;
  }
  return [x + start * dx, y + start * dy, x + end * dx, y + end * dy];
}
