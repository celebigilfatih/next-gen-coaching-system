import {
  validateTacticalDocument,
  type TacticalDocument,
  type TacticalBoardDocumentV1,
  type TacticalBoardDocumentV2,
  type TacticalScene,
} from './tactical-document-core';

export type SceneEdit =
  | { type: 'duplicate'; id: string; newId: string }
  | { type: 'move'; id: string; direction: -1 | 1 }
  | { type: 'remove'; id: string }
  | {
      type: 'update';
      id: string;
      patch: Pick<
        TacticalScene,
        'title' | 'holdMs' | 'transition' | 'transitionMs'
      >;
    };

export function createSequence(
  board: TacticalBoardDocumentV1,
  id: string,
): TacticalBoardDocumentV2 {
  return validateTacticalDocument({
    schemaVersion: 2,
    kind: 'tactical-board',
    scenes: [
      {
        id,
        title: 'Sahne 1',
        holdMs: 2000,
        transition: 'cut',
        transitionMs: 0,
        board,
      },
    ],
  }) as TacticalBoardDocumentV2;
}

export function editScenes(
  document: TacticalBoardDocumentV2,
  edit: SceneEdit,
): TacticalBoardDocumentV2 {
  const scenes = document.scenes.slice();
  const index = scenes.findIndex((scene) => scene.id === edit.id);
  if (index < 0) throw new Error('Sahne bulunamadı.');
  const scene = scenes[index];
  if (edit.type === 'duplicate') {
    if (scenes.length >= 12)
      throw new Error('En fazla 12 sahne oluşturabilirsiniz.');
    scenes.splice(index + 1, 0, {
      ...structuredClone(scene),
      id: edit.newId,
      title: `${scene.title.slice(0, 72)} kopyası`,
    });
  } else if (edit.type === 'remove') {
    if (scenes.length === 1) throw new Error('Son sahne silinemez.');
    scenes.splice(index, 1);
  } else if (edit.type === 'move') {
    const target = index + edit.direction;
    if (target < 0 || target >= scenes.length) return document;
    [scenes[index], scenes[target]] = [scenes[target], scenes[index]];
  } else {
    scenes[index] = { ...scene, ...edit.patch, title: edit.patch.title.trim() };
  }
  // Ordering changes make the final frame static in this same undo transition.
  if (edit.type !== 'update') {
    const last = scenes.length - 1;
    scenes[last] = {
      ...scenes[last],
      transition: 'cut',
      transitionMs: 0,
      holdMs: Math.max(1, scenes[last].holdMs),
    };
  }
  return validateTacticalDocument({
    ...document,
    scenes,
  }) as TacticalBoardDocumentV2;
}

export function replaceSceneBoard(
  document: TacticalDocument,
  sceneId: string | undefined,
  board: TacticalBoardDocumentV1,
): TacticalDocument {
  if (document.schemaVersion === 1) return board;
  if (!document.scenes.some((scene) => scene.id === sceneId))
    throw new Error('Sahne bulunamadı.');
  return validateTacticalDocument({
    ...document,
    scenes: document.scenes.map((scene) =>
      scene.id === sceneId ? { ...scene, board } : scene,
    ),
  });
}
