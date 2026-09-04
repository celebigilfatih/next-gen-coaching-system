import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('login', 'routes/login.tsx'),
  route('app', 'routes/app-layout.tsx', [
    index('routes/app-index.tsx'),
    route('week', 'routes/week.tsx'),
    route('trainings', 'routes/trainings.tsx'),
    route('trainings/:planId', 'routes/training-detail.tsx'),
    route('tactics', 'routes/tactics.tsx'),
    route('tactics/new', 'routes/tactics-new.tsx'),
    route('tactics/:drillId', 'routes/tactics-detail.tsx'),
    route('squad', 'routes/squad.tsx'),
    route('matches', 'routes/matches.tsx'),
    route('matches/:matchId', 'routes/match-detail.tsx'),
  ]),
] satisfies RouteConfig;
