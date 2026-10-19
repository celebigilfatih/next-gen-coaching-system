import {
  validateBoard,
  type BoardElement,
  type TacticalBoardDocumentV1,
} from './tactical-board';
import {
  elementArt,
  pitchArt,
  type BoardArt,
  type PlayerAppearance,
} from './board-art';

const elementLabels: Record<BoardElement['type'], string> = {
  player: 'Oyuncu',
  goalkeeper: 'Kaleci',
  ball: 'Top',
  cone: 'Koni',
  goal: 'Kale',
  flag: 'Bayrak',
  wall: 'Baraj',
  ladder: 'Merdiven',
  marker: 'İşaret',
  arrow: 'Düz ok',
  line: 'Çizgi',
  zone: 'Bölge',
  text: 'Metin',
};

function escapeXml(value: string | number) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&apos;',
      })[character]!,
  );
}

function artSvg(shape: BoardArt): string {
  const x = shape.x ?? 0;
  const y = shape.y ?? 0;
  const style = `fill="${escapeXml(shape.fill ?? 'none')}" stroke="${escapeXml(shape.stroke ?? 'none')}" stroke-width="${escapeXml(shape.strokeWidth ?? 0)}" opacity="${escapeXml(shape.opacity ?? 1)}" stroke-linejoin="round" stroke-linecap="round"${shape.dash ? ` stroke-dasharray="${escapeXml(shape.dash.join(' '))}"` : ''}`;
  if (shape.type === 'circle')
    return `<circle cx="${escapeXml(x)}" cy="${escapeXml(y)}" r="${escapeXml(shape.radius ?? 0)}" ${style}/>`;
  if (shape.type === 'rect')
    return `<rect x="${escapeXml(x)}" y="${escapeXml(y)}" width="${escapeXml(shape.width ?? 0)}" height="${escapeXml(shape.height ?? 0)}" rx="${escapeXml(shape.cornerRadius ?? 0)}" ${style}/>`;
  if (shape.type === 'line')
    return `<${shape.closed ? 'polygon' : 'polyline'} points="${escapeXml((shape.points ?? []).join(' '))}" ${style}/>`;
  const fontSize = shape.fontSize ?? 16;
  const textX = x + (shape.align === 'center' ? (shape.width ?? 0) / 2 : 0);
  return `<text x="${escapeXml(textX)}" y="${escapeXml(y + fontSize * 0.8)}" transform="rotate(${escapeXml(shape.rotation ?? 0)})" text-anchor="${shape.align === 'center' ? 'middle' : 'start'}" font-family="Inter, sans-serif" font-weight="700" font-size="${escapeXml(fontSize)}" ${style}>${escapeXml(shape.text ?? '')}</text>`;
}

export function boardSvg(
  document: TacticalBoardDocumentV1,
  appearance: PlayerAppearance = 'shirt',
) {
  const valid = validateBoard(document);
  const elements = valid.elements
    .map((element) => {
      return `<g transform="translate(${escapeXml(element.x)} ${escapeXml(element.y)}) rotate(${escapeXml(element.rotation ?? 0)})"><title>${escapeXml(elementLabels[element.type])}</title>${elementArt(element, appearance).map(artSvg).join('')}</g>`;
    })
    .join('');
  const width = escapeXml(valid.pitch.width);
  const height = escapeXml(valid.pitch.height);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${pitchArt(valid.pitch).map(artSvg).join('')}${elements}</svg>`;
}
