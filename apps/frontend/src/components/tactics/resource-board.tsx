import { useCallback, useRef, type RefObject } from 'react';
import {
  getTacticalDocument,
  putTacticalDocument,
  type TacticalDocumentEnvelope,
  type TacticalResource,
} from '../../lib/api';
import type { TacticalDocument } from '../../lib/tactical-document-core';
import { useAssignmentPage } from '../../lib/use-assignment-page';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import {
  TacticalBoardEditor,
  type BoardEditorHandle,
} from './tactical-board-editor';

type Props = {
  resource: TacticalResource;
  readOnly: boolean;
  controllerRef: RefObject<BoardEditorHandle | null>;
  rosterSource?: { teamId: string; clubId: string; name: string };
  onSaved: () => void;
};

// Parent binds this component to the authorized resource/session/workspace key.
// Retry replaces only a failed initial read, never a live draft or its token.
export function ResourceBoard(props: Props) {
  const { resource } = props;
  const load = useCallback(() => getTacticalDocument(resource), [resource]);
  const state = useAssignmentPage(load);
  if (state.loading) return <p role="status">Tahta yükleniyor…</p>;
  if (state.error || !state.data)
    return (
      <Alert role="alert">
        <AlertTitle>Tahta açılamadı</AlertTitle>
        <AlertDescription>
          {state.error || 'Tahta yanıtı alınamadı.'}
        </AlertDescription>
        <Button onClick={state.retry}>Tahtayı yeniden yükle</Button>
      </Alert>
    );
  return <LoadedResourceBoard {...props} initial={state.data} />;
}

function LoadedResourceBoard({
  initial,
  resource,
  readOnly,
  controllerRef,
  rosterSource,
  onSaved,
}: Props & { initial: TacticalDocumentEnvelope }) {
  const token = useRef(initial.writeToken);
  async function save(document: TacticalDocument) {
    try {
      const saved = await putTacticalDocument(
        resource,
        document,
        token.current,
      );
      // Adopt only the token returned by this successful write. Never re-read
      // and retry on conflict; the editor retains its complete local history.
      token.current = saved.writeToken;
      onSaved();
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : 'Tahta kaydedilemedi.';
      if (message.includes('TACTICAL_DOCUMENT_WRITE_CONFLICT'))
        throw new Error(
          'Tahta başka bir oturumda değişti. Taslağınız korundu. JSON olarak dışa aktarabilir, ardından sayfayı yeniden açabilirsiniz. Otomatik üzerine yazılmadı.',
          { cause },
        );
      if (message.includes('TACTICAL_V2_WRITES_DISABLED'))
        throw new Error(
          'Animasyon kaydı bu ortamda henüz açılmadı. Taslağınız korundu; JSON olarak dışa aktarabilirsiniz.',
          { cause },
        );
      throw new Error(
        `${message} Taslağınız korundu; kayıt otomatik tekrarlanmadı.`,
        { cause },
      );
    }
  }
  return (
    <TacticalBoardEditor
      initialDocument={initial.document ?? undefined}
      initiallySaved={initial.document !== null}
      onSaveDocument={save}
      readOnly={readOnly}
      controllerRef={controllerRef}
      rosterSource={rosterSource}
    />
  );
}
