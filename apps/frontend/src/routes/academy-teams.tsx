import { TeamDirectoryRoute } from './teams';

export function meta() {
  return [{ title: 'Altyapı | NGCS' }];
}

export default function AcademyTeamsRoute() {
  return <TeamDirectoryRoute view="academy" />;
}
