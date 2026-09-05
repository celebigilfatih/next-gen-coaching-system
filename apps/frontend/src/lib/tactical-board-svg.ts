import {
  validateBoard,
  type BoardElement,
  type TacticalBoardDocumentV1,
} from './tactical-board';

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

export function boardSvg(document: TacticalBoardDocumentV1) {
  const valid = validateBoard(document);
  const elements = valid.elements
    .map((element) => {
      const color =
        element.team === 'away' ? '#ef4444' : (element.color ?? '#1687ff');
      return `<g transform="translate(${escapeXml(element.x)} ${escapeXml(element.y)}) rotate(${escapeXml(element.rotation ?? 0)})"><circle r="${escapeXml(element.radius ?? 14)}" fill="${escapeXml(color)}"/><title>${escapeXml(elementLabels[element.type])}</title></g>`;
    })
    .join('');
  const width = escapeXml(valid.pitch.width);
  const height = escapeXml(valid.pitch.height);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#16844e"/><rect x="12" y="12" width="${escapeXml(valid.pitch.width - 24)}" height="${escapeXml(valid.pitch.height - 24)}" fill="none" stroke="#fff" stroke-width="4"/>${elements}</svg>`;
}
