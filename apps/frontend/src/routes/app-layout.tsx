import {
  Books,
  CalendarBlank,
  CaretDown,
  CheckSquare,
  ClipboardText,
  Gear,
  List,
  MagnifyingGlass,
  ShieldChevron,
  SignOut,
  SoccerBall,
  House,
  Strategy,
  UserList,
  UserGear,
  UsersThree,
} from '@phosphor-icons/react';
import {
  type ComponentType,
  type FormEvent,
  useEffect,
  useRef,
  useSyncExternalStore,
} from 'react';
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
import { getSession, subscribeSession, type SessionUser } from '../lib/session';
import { logout as endSession } from '../lib/api';
import { WorkspaceProvider, useWorkspace } from '../lib/workspace-context';
import { useClubTheme } from '../lib/use-club-theme';
import '../styles/club-branding.css';
import { WorkspaceScopeSelector } from '../components/workspace-scope-selector';
import { MatchNotifications } from '../components/match-notifications';
import '../workspace.css';
import '../styles/dashboard-reference.css';
import '../styles/teams-reference.css';
import '../styles/matches-reference.css';
import '../styles/week-reference.css';
import '../styles/training-reference.css';
import '../styles/library-tactics-reference.css';
import '../styles/match-detail-reference.css';
import '../styles/player-operations-reference.css';
import '../styles/settings-reference.css';
import '../styles/account-access-reference.css';

type NavigationItem = {
  to: string;
  label: string;
  icon: ComponentType<{ weight?: 'duotone' }>;
  adminOnly?: boolean;
};

const navigationSections: { label: string; items: NavigationItem[] }[] = [
  {
    label: 'Genel',
    items: [
      { to: '/app/dashboard', label: 'Ana Sayfa', icon: House },
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
    label: 'Sportif organizasyon',
    items: [
      { to: '/app/teams/first-team', label: 'A Takım', icon: ShieldChevron },
      { to: '/app/teams/academy', label: 'Altyapı', icon: UsersThree },
      { to: '/app/players', label: 'Oyuncular', icon: UserList },
      { to: '/app/squad', label: 'Kadro', icon: UsersThree },
      { to: '/app/attendance', label: 'Yoklama', icon: CheckSquare },
      { to: '/app/settings', label: 'Ayarlar', icon: Gear },
      {
        to: '/app/settings/users',
        label: 'Kullanıcılar ve Yetkiler',
        icon: UserGear,
        adminOnly: true,
      },
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
  const session = useSyncExternalStore(
    subscribeSession,
    getSession,
    () => null,
  );
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
  const { club } = useWorkspace();
  useClubTheme(club);
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const visibleNavigation = navigation.filter(
    ({ adminOnly }) =>
      !adminOnly || user.role === 'SYSTEM_ADMIN' || user.role === 'CLUB_ADMIN',
  );

  useEffect(() => {
    function focusNavigationSearch(event: KeyboardEvent) {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLocaleLowerCase() === 'k'
      ) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', focusNavigationSearch);
    return () => window.removeEventListener('keydown', focusNavigationSearch);
  }, []);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const query = String(new FormData(form).get('navigation-query') ?? '')
      .trim()
      .toLocaleLowerCase('tr-TR');
    if (!query) return;
    const match = visibleNavigation.find((item) =>
      item.label.toLocaleLowerCase('tr-TR').includes(query),
    );
    if (match) {
      form.reset();
      navigate(match.to);
    } else {
      toast.info('Bu menü bulunamadı.');
    }
  }

  async function logout() {
    try {
      await endSession();
      navigate('/login');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Çıkış tamamlanamadı.',
      );
    }
  }

  return (
    <main className="ngcs-shell">
      <aside className="ngcs-sidebar">
        <Brand />
        <Navigation user={user} />
        <SidebarFooter />
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
                  <SheetTitle>NGCS</SheetTitle>
                </SheetHeader>
                <Navigation mobile user={user} />
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
              ref={searchInputRef}
            />
            <kbd aria-hidden="true">⌘ K</kbd>
          </form>
          <WorkspaceScopeSelector variant="topbar" />
          <MatchNotifications />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="ngcs-user-menu"
                aria-label="Kullanıcı menüsü"
              >
                <Avatar aria-hidden="true">
                  <AvatarFallback>{initials(user.name)}</AvatarFallback>
                </Avatar>
                <span className="ngcs-user-details">
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
  const { club } = useWorkspace();
  const logo = club?.logo;
  return (
    <NavLink to="/app/dashboard" className="ngcs-brand">
      {logo && /^data:image\/(png|jpeg|webp);base64,/.test(logo) ? (
        <img
          src={logo}
          alt={`${club.name} logosu`}
          className="ngcs-club-logo"
        />
      ) : (
        <ShieldChevron className="ngcs-brand-mark" weight="duotone" />
      )}
      <span>
        <strong>NGCS</strong>
        <small>Next Generation Coaching System</small>
      </span>
    </NavLink>
  );
}

function Navigation({
  mobile = false,
  user = getSession()?.user,
}: {
  mobile?: boolean;
  user?: SessionUser;
}) {
  return (
    <nav
      className={mobile ? 'ngcs-nav ngcs-nav-sheet' : 'ngcs-nav'}
      aria-label="Ana navigasyon"
    >
      {navigationSections.map((section) => (
        <div className="ngcs-nav-section" key={section.label}>
          <span className="ngcs-nav-label">{section.label}</span>
          {section.items
            .filter(
              ({ adminOnly }) =>
                !adminOnly ||
                user?.role === 'SYSTEM_ADMIN' ||
                user?.role === 'CLUB_ADMIN',
            )
            .map(({ to, label, icon: Icon }) => {
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

function SidebarFooter() {
  const { club } = useWorkspace();
  return (
    <div className="ngcs-sidebar-footer">
      <div className="ngcs-profile">
        <ShieldChevron size={36} weight="duotone" aria-hidden="true" />
        <span>
          <strong>{club?.name ?? 'Kulüp seçilmedi'}</strong>
          <small>
            Daha iyi oyuncular.
            <br />
            Daha güçlü yarınlar.
          </small>
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
