import type { TacticalBoardDocumentV1 } from './tactical-board';

/** Translate once, with one shared boundary-clamped delta: preserve formation spacing. */
export function translateSelection(
  board: TacticalBoardDocumentV1,
  ids: readonly string[],
  dx: number,
  dy: number,
) {
  const chosen = new Set(ids);
  const elements = board.elements.filter((element) => chosen.has(element.id));
  if (!elements.length || !Number.isFinite(dx) || !Number.isFinite(dy))
    return board;
  const xs = elements.flatMap((element) =>
    element.type === 'arrow' && element.endX !== undefined
      ? [element.x, element.endX]
      : [element.x],
  );
  const ys = elements.flatMap((element) =>
    element.type === 'arrow' && element.endY !== undefined
      ? [element.y, element.endY]
      : [element.y],
  );
  const x = Math.max(
    -Math.min(...xs),
    Math.min(board.pitch.width - Math.max(...xs), dx),
  );
  const y = Math.max(
    -Math.min(...ys),
    Math.min(board.pitch.height - Math.max(...ys), dy),
  );
  return {
    ...board,
    elements: board.elements.map((element) =>
      chosen.has(element.id)
        ? {
            ...element,
            x: element.x + x,
            y: element.y + y,
            ...(element.type === 'arrow'
              ? {
                  endX: (element.endX ?? element.x) + x,
                  endY: (element.endY ?? element.y) + y,
                }
              : {}),
          }
        : element,
    ),
  };
}
