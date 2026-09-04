import {
  CalendarBlank,
  CaretDown,
  ClipboardText,
  SoccerBall,
  Strategy,
  UsersThree,
  UserCircle,
} from '@phosphor-icons/react';
import { NavLink, Navigate, Outlet } from 'react-router';
import { Toaster } from '../components/ui/sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/ui/tooltip';
import { getSession } from '../lib/session';
import { WorkspaceProvider, useWorkspace } from '../lib/workspace-context';
import '../workspace.css';

const navigation = [
  { to: '/app/week', label: 'Hafta', icon: CalendarBlank },
  { to: '/app/trainings', label: 'Antrenmanlar', icon: ClipboardText },
  { to: '/app/tactics', label: 'Taktik Tahtası', icon: Strategy },
  { to: '/app/squad', label: 'Kadro', icon: UsersThree },
  { to: '/app/matches', label: 'Maçlar', icon: SoccerBall },
];

export default function AppLayout() {
  const session = getSession();
  if (!session) return <Navigate to="/login" replace />;
  return (
    <WorkspaceProvider>
      <TooltipProvider delayDuration={250}>
        <Shell userName={session.user.name} />
        <Toaster />
      </TooltipProvider>
    </WorkspaceProvider>
  );
}

function Shell({ userName }: { userName: string }) {
  const { groups, group, season, selectGroup } = useWorkspace();
  return (
    <main className="ngcs-shell">
      <aside className="ngcs-sidebar">
        <NavLink to="/app/week" className="ngcs-brand">
          <span className="ngcs-brand-mark">NG</span>
          <span>
            <strong>Koç Operasyon Masası</strong>
            <small>Next Generation Coaching</small>
          </span>
        </NavLink>
        <nav className="ngcs-nav" aria-label="Ana navigasyon">
          {navigation.map(({ to, label, icon: Icon }) => (
            <Tooltip key={to}>
              <TooltipTrigger asChild>
                <NavLink
                  aria-label={label}
                  to={to}
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  <Icon weight="duotone" />
                  <span>{label}</span>
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right" className="ngcs-nav-tooltip">
                {label}
              </TooltipContent>
            </Tooltip>
          ))}
        </nav>
        <div className="ngcs-sidebar-footer">
          <label className="ngcs-team-select">
            <span>Aktif takım</span>
            <select
              value={group?.id ?? ''}
              onChange={(event) => selectGroup(event.target.value)}
            >
              {groups.length ? (
                groups.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))
              ) : (
                <option value="">Atanmış takım yok</option>
              )}
            </select>
            <CaretDown aria-hidden="true" />
          </label>
          <div className="ngcs-profile">
            <UserCircle weight="duotone" />
            <span>
              <strong>{userName}</strong>
              <small>{season?.name ?? 'Sezon TBD'}</small>
            </span>
          </div>
        </div>
      </aside>
      <section className="ngcs-main">
        <Outlet />
      </section>
    </main>
  );
}
