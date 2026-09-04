import { useParams } from 'react-router';
import { TacticsEditorPage } from './tactics-editor';
export function meta() {
  return [{ title: 'Taktik Tahtası | NGCS' }];
}
export default function TacticsDetailRoute() {
  const { drillId } = useParams();
  return <TacticsEditorPage drillId={drillId} />;
}
