import {
  Bell,
  Books,
  CalendarBlank,
  CaretDown,
  CheckSquare,
  ClipboardText,
  Gear,
  List,
  MagnifyingGlass,
  SignOut,
  SoccerBall,
  SquaresFour,
  Strategy,
  UsersThree,
} from '@phosphor-icons/react';
import { type ComponentType, type FormEvent } from 'react';
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Input } from '../components/ui/input';
import { Separator } from '../components/ui/separator';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../components/ui/sheet';
import { Toaster } from '../components/ui/sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/ui/tooltip';
import { clearSession, getSession, type SessionUser } from '../lib/session';
import { WorkspaceProvider, useWorkspace } from '../lib/workspace-context';
import '../workspace.css';

type NavigationItem = {
  to: string;
  label: string;
  icon: ComponentType<{ weight?: 'duotone' }>;
};

const navigationSections: { label: string; items: NavigationItem[] }[] = [
  {
    label: 'Genel',
    items: [
      { to: '/app/dashboard', label: 'Genel Bakış', icon: SquaresFour },
      { to: '/app/week', label: 'Hafta', icon: CalendarBlank },
    ],
  },
  {
    label: 'Planlama',
    items: [
      { to: '/app/trainings', label: 'Antrenmanlar', icon: ClipboardText },
      { to: '/app/library', label: 'Egzersiz Kütüphanesi', icon: Books },
      { to: '/app/tactics', label: 'Taktik Tahtası', icon: Strategy },
      { to: '/app/matches', label: 'Maçlar', icon: SoccerBall },
    ],
  },
  {
    label: 'Takım',
    items: [
      { to: '/app/squad', label: 'Kadro', icon: UsersThree },
      { to: '/app/attendance', label: 'Yoklama', icon: CheckSquare },
      { to: '/app/settings', label: 'Ayarlar', icon: Gear },
    ],
  },
];

const navigation = navigationSections.flatMap((section) => section.items);
const mobileNavigation = [
  '/app/week',
  '/app/trainings',
  '/app/tactics',
  '/app/squad',
  '/app/matches',
].map((path) => navigation.find(({ to }) => to === path)!);

export default function AppLayout() {
  const session = getSession();
  if (!session) return <Navigate to="/login" replace />;
  return (
    <WorkspaceProvider>
      <TooltipProvider delayDuration={250}>
        <Shell user={session.user} />
        <Toaster />
      </TooltipProvider>
    </WorkspaceProvider>
  );
}

function Shell({ user }: { user: SessionUser }) {
  const navigate = useNavigate();
  const { groups, group, season, matches, selectGroup } = useWorkspace();

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const query = String(new FormData(form).get('navigation-query') ?? '')
      .trim()
      .toLocaleLowerCase('tr-TR');
    if (!query) return;
    const match = navigation.find((item) =>
      item.label.toLocaleLowerCase('tr-TR').includes(query),
    );
    if (match) {
      form.reset();
      navigate(match.to);
    } else {
      toast.info('Bu menü bulunamadı.');
    }
  }

  function logout() {
    clearSession();
    navigate('/login');
  }

  return (
    <main className="ngcs-shell">
      <aside className="ngcs-sidebar">
        <Brand />
        <Navigation />
        <SidebarFooter
          groups={groups}
          groupId={group?.id ?? ''}
          user={user}
          seasonName={season?.name}
          onGroupChange={selectGroup}
        />
      </aside>

      <section className="ngcs-content">
        <header className="ngcs-topbar">
          <div className="ngcs-mobile-menu">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Menüyü aç">
                  <List />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="ngcs-mobile-sheet">
                <SheetHeader>
                  <SheetTitle>Koç Operasyon Masası</SheetTitle>
                </SheetHeader>
                <Navigation mobile />
              </SheetContent>
            </Sheet>
          </div>
          <form className="ngcs-search" onSubmit={submitSearch} role="search">
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              aria-label="Menüde ara"
            >
              <MagnifyingGlass aria-hidden="true" />
            </Button>
            <Input
              aria-label="Menülerde ara"
              name="navigation-query"
              placeholder="Menülerde ara…"
            />
          </form>
          <div className="ngcs-topbar-context">
            <span>{group?.name ?? 'Takım seçilmedi'}</span>
            <Separator orientation="vertical" />
            <span>{season?.name ?? 'Sezon TBD'}</span>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="ngcs-notifications"
                aria-label="Bildirimler"
                onClick={() =>
                  toast.info(
                    matches.length
                      ? `${matches.length} maç çalışma alanında hazır.`
                      : 'Yeni bildiriminiz yok.',
                  )
                }
              >
                <Bell />
                {matches.length ? <span>{matches.length}</span> : null}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bildirimler</TooltipContent>
          </Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="ngcs-user-menu">
                <Avatar>
                  <AvatarFallback>{initials(user.name)}</AvatarFallback>
                </Avatar>
                <span>
                  <strong>{user.name}</strong>
                  <small>{roleLabel(user.role)}</small>
                </span>
                <CaretDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="ngcs-user-summary">
                <strong>{user.name}</strong>
                <small>{user.email}</small>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => navigate('/app/settings')}>
                <Gear /> Ayarlar
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onSelect={logout}>
                <SignOut /> Çıkış yap
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <section className="ngcs-main">
          <Outlet />
        </section>
      </section>

      <nav className="ngcs-mobile-nav" aria-label="Mobil ana navigasyon">
        {mobileNavigation.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to}>
            <Icon weight="duotone" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </main>
  );
}

function Brand() {
  return (
    <NavLink to="/app/dashboard" className="ngcs-brand">
      <span className="ngcs-brand-mark">NG</span>
      <span>
        <strong>Koç Operasyon Masası</strong>
        <small>Next Generation Coaching</small>
      </span>
    </NavLink>
  );
}

function Navigation({ mobile = false }: { mobile?: boolean }) {
  return (
    <nav
      className={mobile ? 'ngcs-nav ngcs-nav-sheet' : 'ngcs-nav'}
      aria-label="Ana navigasyon"
    >
      {navigationSections.map((section) => (
        <div className="ngcs-nav-section" key={section.label}>
          <span className="ngcs-nav-label">{section.label}</span>
          {section.items.map(({ to, label, icon: Icon }) => {
            const link = (
              <NavLink
                aria-label={label}
                to={to}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                <Icon weight="duotone" />
                <span>{label}</span>
              </NavLink>
            );
            if (mobile)
              return (
                <SheetClose asChild key={to}>
                  {link}
                </SheetClose>
              );
            return (
              <Tooltip key={to}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right" className="ngcs-nav-tooltip">
                  {label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function SidebarFooter({
  groups,
  groupId,
  user,
  seasonName,
  onGroupChange,
}: {
  groups: { id: string; name: string }[];
  groupId: string;
  user: SessionUser;
  seasonName?: string;
  onGroupChange: (id: string) => void;
}) {
  return (
    <div className="ngcs-sidebar-footer">
      <label className="ngcs-team-select">
        <span>Aktif takım</span>
        <select
          value={groupId}
          onChange={(event) => onGroupChange(event.target.value)}
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
        <Avatar>
          <AvatarFallback>{initials(user.name)}</AvatarFallback>
        </Avatar>
        <span>
          <strong>{user.name}</strong>
          <small>{seasonName ?? 'Sezon TBD'}</small>
        </span>
      </div>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toLocaleUpperCase('tr-TR')
    .slice(0, 2);
}

function roleLabel(role: SessionUser['role']) {
  return {
    SYSTEM_ADMIN: 'Sistem yöneticisi',
    CLUB_ADMIN: 'Kulüp yöneticisi',
    COACH: 'Antrenör',
    PLAYER: 'Oyuncu',
  }[role];
}
