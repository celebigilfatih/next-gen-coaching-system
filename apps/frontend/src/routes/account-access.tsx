import {
  CheckCircle,
  Copy,
  DotsThree,
  LockKey,
  MagnifyingGlass,
  PauseCircle,
  PlayCircle,
  ShieldCheck,
  UserPlus,
  UsersThree,
} from '@phosphor-icons/react';
import { type FormEvent, useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { toast } from 'sonner';
import dashboardCoachWide from '../assets/dashboard-coach-wide.png';
import { EmptyState, LoadingState } from '../components/feedback/data-state';
import { PagePagination } from '../components/feedback/page-pagination';
import { FormError, FormField } from '../components/forms/form-field';
import { MetricCard } from '../components/presentation/metric-card';
import { PageHero } from '../components/presentation/page-hero';
import { SectionCard } from '../components/presentation/section-card';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Skeleton } from '../components/ui/skeleton';
import {
  changeAccountAccess,
  createAccountInvitation,
  getAccountPage,
  issueAccountPasswordReset,
  listSportingRoles,
  revokeAccountSessions,
  setAccountStatus,
  type AccountPage,
  type AccountRole,
  type AccountStatus,
  type ManagedAccount,
  type SportingRole,
} from '../lib/api';
import { getSession, type SessionUser } from '../lib/session';
import { useWorkspace } from '../lib/workspace-context';

export function meta() {
  return [{ title: 'Kullanıcılar ve Yetkiler | NGCS' }];
}

const accountRoles: AccountRole[] = [
  'SYSTEM_ADMIN',
  'CLUB_ADMIN',
  'COACH',
  'PLAYER',
];

const roleDescriptions: Array<{
  role: AccountRole;
  title: string;
  scope: string;
  permissions: string;
}> = [
  {
    role: 'SYSTEM_ADMIN',
    title: 'Sistem yöneticisi',
    scope: 'Tüm platform',
    permissions: 'Kulüp ve hesap yaşam döngüsü; global yönetim.',
  },
  {
    role: 'CLUB_ADMIN',
    title: 'Kulüp yöneticisi',
    scope: 'Kendi kulübü',
    permissions: 'Koç ve oyuncu daveti, erişim ve oturum yönetimi.',
  },
  {
    role: 'COACH',
    title: 'Antrenör',
    scope: 'Atandığı takımlar',
    permissions: 'Plan, yoklama, egzersiz ve taktik operasyonları.',
  },
  {
    role: 'PLAYER',
    title: 'Oyuncu',
    scope: 'Kendi profili',
    permissions: 'Kendi profili, programı ve katılımını görüntüleme.',
  },
];

type SensitiveResult = {
  title: string;
  description: string;
  url?: string;
};

export default function AccountAccessRoute() {
  const session = getSession();
  const { club, loading, error } = useWorkspace();
  if (!session) return <Navigate to="/login" replace />;
  if (!['SYSTEM_ADMIN', 'CLUB_ADMIN'].includes(session.user.role))
    return <Navigate to="/app/settings" replace />;
  if (loading)
    return <Skeleton className="h-44" aria-label="Çalışma alanı yükleniyor" />;
  if (error)
    return (
      <Alert role="alert" className="m-6">
        <ShieldCheck />
        <AlertTitle>Çalışma alanı alınamadı</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  const clubId =
    session.user.role === 'SYSTEM_ADMIN'
      ? club?.id
      : (session.user.clubId ?? undefined);
  return (
    <AccountDirectory
      key={`${session.user.role}:${clubId ?? 'all'}`}
      actor={session.user}
      clubId={clubId}
      clubName={club?.name}
    />
  );
}

function AccountDirectory({
  actor,
  clubId,
  clubName,
}: {
  actor: SessionUser;
  clubId?: string;
  clubName?: string;
}) {
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<AccountRole | 'ALL'>('ALL');
  const [status, setStatus] = useState<AccountStatus | 'ALL'>('ALL');
  const [cursors, setCursors] = useState<Array<string | undefined>>([
    undefined,
  ]);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{
    key: string;
    data?: AccountPage;
    error?: string;
  }>();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editing, setEditing] = useState<ManagedAccount | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    account: ManagedAccount;
    action: 'suspend' | 'reactivate' | 'reset' | 'revoke';
  } | null>(null);
  const [sensitive, setSensitive] = useState<SensitiveResult | null>(null);
  const [sportingRoles, setSportingRoles] = useState<SportingRole[]>([]);
  const after = cursors[cursors.length - 1];
  const requestKey = JSON.stringify([
    clubId,
    after,
    query,
    role,
    status,
    revision,
  ]);
  const loading = result?.key !== requestKey;
  const page = loading ? undefined : result?.data;
  const error = loading ? '' : result?.error;

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(
      () => {
        getAccountPage({
          clubId,
          after,
          q: query.trim(),
          role: role === 'ALL' ? undefined : role,
          status: status === 'ALL' ? undefined : status,
        })
          .then((data) => {
            if (active) setResult({ key: requestKey, data });
          })
          .catch((cause: unknown) => {
            if (active)
              setResult({
                key: requestKey,
                error:
                  cause instanceof Error
                    ? cause.message
                    : 'Kullanıcılar alınamadı.',
              });
          });
      },
      query ? 250 : 0,
    );
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [after, clubId, query, requestKey, role, status]);

  useEffect(() => {
    let active = true;
    if (!clubId) return;
    void listSportingRoles(clubId)
      .then((items) => {
        if (active) setSportingRoles(items);
      })
      .catch(() => {
        if (active) setSportingRoles([]);
      });
    return () => {
      active = false;
    };
  }, [clubId]);

  function resetPage() {
    setCursors([undefined]);
  }

  function refresh() {
    setRevision((value) => value + 1);
  }

  return (
    <div className="page-shell account-access-reference">
      <PageHero
        className="account-access-reference__hero"
        image={dashboardCoachWide}
        eyebrow="Kimlik ve erişim"
        title="Kullanıcılar ve Yetkiler"
        description={`${clubName ?? (clubId ? 'Seçili kulüp' : 'Tüm platform')} kapsamında hesap rollerini ve erişim durumunu yönetin.`}
        actions={
          <Button onClick={() => setInviteOpen(true)}>
            <UserPlus weight="duotone" /> Kullanıcı davet et
          </Button>
        }
      />

      <section
        className="account-access-reference__metrics"
        aria-label="Kullanıcı özetleri"
      >
        <MetricCard
          icon={UsersThree}
          label="Toplam hesap"
          value={page?.total ?? '—'}
          detail="Geçerli filtre kapsamında"
        />
        <MetricCard
          icon={CheckCircle}
          label="Aktif"
          value={page?.summary.active ?? '—'}
          detail="Giriş yapabilir"
          tone="teal"
        />
        <MetricCard
          icon={PauseCircle}
          label="Askıda"
          value={page?.summary.suspended ?? '—'}
          detail="Erişimi durdurulmuş"
          tone="amber"
        />
        <MetricCard
          icon={ShieldCheck}
          label="Yönetim kapsamı"
          value={actor.role === 'SYSTEM_ADMIN' ? 'Platform' : 'Kulüp'}
          detail="Sunucu tarafından zorlanır"
          tone="violet"
        />
      </section>

      <section
        className="account-access-reference__directory"
        aria-labelledby="account-directory-title"
      >
        <header className="account-access-reference__directory-head">
          <div>
            <p className="page-kicker">Hesap dizini</p>
            <h2 id="account-directory-title">Kullanıcı hesapları</h2>
            <span>
              Parola ve token değerleri bu listede hiçbir zaman gösterilmez.
            </span>
          </div>
          <div className="account-access-reference__filters">
            <label className="account-access-reference__search">
              <MagnifyingGlass aria-hidden="true" />
              <Input
                aria-label="Kullanıcı ara"
                placeholder="Ad veya e-posta ara…"
                value={query}
                maxLength={100}
                onChange={(event) => {
                  setQuery(event.currentTarget.value);
                  resetPage();
                }}
              />
            </label>
            <Select
              value={role}
              onValueChange={(value) => {
                setRole(value as AccountRole | 'ALL');
                resetPage();
              }}
            >
              <SelectTrigger aria-label="Rol filtresi">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tüm roller</SelectItem>
                {accountRoles.map((item) => (
                  <SelectItem value={item} key={item}>
                    {roleLabel(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value as AccountStatus | 'ALL');
                resetPage();
              }}
            >
              <SelectTrigger aria-label="Durum filtresi">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tüm durumlar</SelectItem>
                <SelectItem value="ACTIVE">Aktif</SelectItem>
                <SelectItem value="SUSPENDED">Askıda</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </header>

        {loading ? (
          <LoadingState
            label="Kullanıcılar yükleniyor"
            count={4}
            skeletonClassName="h-14"
          />
        ) : error ? (
          <Alert role="alert" className="m-4">
            <ShieldCheck />
            <AlertTitle>Kullanıcılar alınamadı</AlertTitle>
            <AlertDescription>
              {error}
              <Button variant="outline" size="sm" onClick={refresh}>
                Yeniden dene
              </Button>
            </AlertDescription>
          </Alert>
        ) : page?.items.length ? (
          <div className="account-access-reference__table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Kullanıcı</th>
                  <th>Kulüp</th>
                  <th>Rol</th>
                  <th>Durum</th>
                  <th>Oluşturulma</th>
                  <th>
                    <span className="sr-only">İşlemler</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {page.items.map((account) => (
                  <AccountRow
                    key={account.id}
                    actor={actor}
                    account={account}
                    onEdit={setEditing}
                    onAction={(action) => setPendingAction({ account, action })}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={<UsersThree weight="duotone" />}
            title="Kullanıcı bulunamadı"
            description="Seçili kapsam ve filtrelerle eşleşen hesap yok."
          />
        )}

        {page ? (
          <PagePagination
            label="Kullanıcı sayfaları"
            summary={`Sayfa ${cursors.length} · ${page.items.length} / ${page.total} hesap`}
            previousDisabled={cursors.length === 1 || loading}
            nextDisabled={!page.nextCursor || loading}
            onPrevious={() => setCursors((items) => items.slice(0, -1))}
            onNext={() =>
              page.nextCursor &&
              setCursors((items) => [...items, page.nextCursor!])
            }
          />
        ) : null}
      </section>

      <RoleMatrix sportingRoles={sportingRoles} clubId={clubId} />

      {inviteOpen ? (
        <InviteAccountDialog
          open
          onOpenChange={setInviteOpen}
          actor={actor}
          clubId={clubId}
          onCreated={(result) => {
            resetPage();
            refresh();
            setSensitive(result);
          }}
        />
      ) : null}
      {editing ? (
        <AccessDialog
          account={editing}
          actor={actor}
          fallbackClubId={clubId}
          onOpenChange={(open) => !open && setEditing(null)}
          onSaved={() => {
            setEditing(null);
            refresh();
          }}
        />
      ) : null}
      {pendingAction ? (
        <AccountActionDialog
          value={pendingAction}
          onOpenChange={(open) => !open && setPendingAction(null)}
          onCompleted={(result) => {
            setPendingAction(null);
            refresh();
            if (result) setSensitive(result);
          }}
        />
      ) : null}
      {sensitive ? (
        <SensitiveResultDialog
          value={sensitive}
          onOpenChange={(open) => !open && setSensitive(null)}
        />
      ) : null}
    </div>
  );
}

function AccountRow({
  actor,
  account,
  onEdit,
  onAction,
}: {
  actor: SessionUser;
  account: ManagedAccount;
  onEdit: (account: ManagedAccount) => void;
  onAction: (action: 'suspend' | 'reactivate' | 'reset' | 'revoke') => void;
}) {
  const self = actor.id === account.id;
  const manageable =
    !self &&
    (actor.role === 'SYSTEM_ADMIN' ||
      (actor.role === 'CLUB_ADMIN' &&
        account.clubId === actor.clubId &&
        ['COACH', 'PLAYER'].includes(account.role)));
  return (
    <tr>
      <td data-label="Kullanıcı">
        <strong>{account.name}</strong>
        <small>{account.email}</small>
      </td>
      <td data-label="Kulüp">{account.club?.name ?? 'Platform'}</td>
      <td data-label="Rol">
        <Badge variant="outline">{roleLabel(account.role)}</Badge>
      </td>
      <td data-label="Durum">
        <Badge variant={account.status === 'ACTIVE' ? 'default' : 'amber'}>
          {account.status === 'ACTIVE' ? 'Aktif' : 'Askıda'}
        </Badge>
      </td>
      <td data-label="Oluşturulma">{formatDate(account.createdAt)}</td>
      <td className="account-access-reference__actions">
        {manageable ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`${account.name} hesabı işlemleri`}
              >
                <DotsThree weight="bold" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onEdit(account)}>
                <ShieldCheck /> Rolü değiştir
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onAction('reset')}>
                <LockKey /> Parola sıfırlama bağlantısı
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onAction('revoke')}>
                <LockKey /> Oturumları kapat
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {account.status === 'ACTIVE' ? (
                <DropdownMenuItem
                  className="text-red-600"
                  onSelect={() => onAction('suspend')}
                >
                  <PauseCircle /> Hesabı askıya al
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onSelect={() => onAction('reactivate')}>
                  <PlayCircle /> Hesabı etkinleştir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <span className="account-access-reference__protected">
            {self ? 'Bu hesap' : 'Korumalı'}
          </span>
        )}
      </td>
    </tr>
  );
}

function InviteAccountDialog({
  open,
  onOpenChange,
  actor,
  clubId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actor: SessionUser;
  clubId?: string;
  onCreated: (result: SensitiveResult) => void;
}) {
  const allowedRoles: AccountRole[] =
    actor.role === 'SYSTEM_ADMIN' ? accountRoles : ['COACH', 'PLAYER'];
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AccountRole>('COACH');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (role !== 'SYSTEM_ADMIN' && !clubId) {
      setError('Sistem dışı bir rol için üst bardan kulüp seçin.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const result = await createAccountInvitation({
        email: email.trim(),
        role,
        ...(role === 'SYSTEM_ADMIN' ? {} : { clubId }),
      });
      onOpenChange(false);
      onCreated({
        title: 'Davet oluşturuldu',
        description: result.token
          ? 'Bu bağlantı yalnız bir kez gösterilir. Güvenli bir kanaldan paylaşın.'
          : 'Davet, yapılandırılmış teslim sağlayıcısına gönderildi.',
        url: result.token
          ? completionUrl('accept-invitation', result.token)
          : undefined,
      });
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Davet oluşturulamadı.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={busy ? undefined : onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kullanıcı davet et</DialogTitle>
          <DialogDescription>
            Hesap, tek kullanımlık ve 24 saat geçerli bağlantıyla oluşturulur.
          </DialogDescription>
        </DialogHeader>
        <form
          className="account-access-reference__dialog-form"
          onSubmit={submit}
        >
          <FormField label="E-posta" htmlFor="account-invite-email">
            <Input
              id="account-invite-email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              disabled={busy}
              onChange={(event) => setEmail(event.currentTarget.value)}
            />
          </FormField>
          <FormField label="Hesap rolü" htmlFor="account-invite-role">
            <Select
              value={role}
              disabled={busy}
              onValueChange={(value) => setRole(value as AccountRole)}
            >
              <SelectTrigger id="account-invite-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allowedRoles.map((item) => (
                  <SelectItem key={item} value={item}>
                    {roleLabel(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormError message={error} />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={busy}>
                İptal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={busy || !email.trim()}>
              {busy ? 'Oluşturuluyor…' : 'Daveti oluştur'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AccessDialog({
  account,
  actor,
  fallbackClubId,
  onOpenChange,
  onSaved,
}: {
  account: ManagedAccount;
  actor: SessionUser;
  fallbackClubId?: string;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [role, setRole] = useState<AccountRole>(account.role);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const allowedRoles =
    actor.role === 'SYSTEM_ADMIN'
      ? accountRoles
      : (['COACH', 'PLAYER'] as const);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || role === account.role) return;
    const targetClubId = account.clubId ?? fallbackClubId;
    if (role !== 'SYSTEM_ADMIN' && !targetClubId) {
      setError('Bu rol için üst bardan hedef kulübü seçin.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await changeAccountAccess(account.id, {
        role,
        ...(account.clubId || role === 'SYSTEM_ADMIN'
          ? {}
          : { clubId: targetClubId }),
      });
      toast.success('Kullanıcı rolü güncellendi. Mevcut oturumları kapatıldı.');
      onSaved();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Rol güncellenemedi.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open onOpenChange={busy ? undefined : onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{account.name} — rol değiştir</DialogTitle>
          <DialogDescription>
            Değişiklik hemen geçerli olur ve açık oturumları kapatır.
          </DialogDescription>
        </DialogHeader>
        <form
          className="account-access-reference__dialog-form"
          onSubmit={submit}
        >
          <FormField label="Yeni rol" htmlFor="account-access-role">
            <Select
              value={role}
              disabled={busy}
              onValueChange={(value) => setRole(value as AccountRole)}
            >
              <SelectTrigger id="account-access-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allowedRoles.map((item) => (
                  <SelectItem key={item} value={item}>
                    {roleLabel(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormError message={error} />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={busy} autoFocus>
                İptal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={busy || role === account.role}>
              {busy ? 'Kaydediliyor…' : 'Rolü kaydet'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AccountActionDialog({
  value,
  onOpenChange,
  onCompleted,
}: {
  value: {
    account: ManagedAccount;
    action: 'suspend' | 'reactivate' | 'reset' | 'revoke';
  };
  onOpenChange: (open: boolean) => void;
  onCompleted: (result?: SensitiveResult) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const copy = actionCopy(value.action);
  async function submit() {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      let result: SensitiveResult | undefined;
      if (value.action === 'suspend')
        await setAccountStatus(value.account.id, 'SUSPENDED');
      if (value.action === 'reactivate')
        await setAccountStatus(value.account.id, 'ACTIVE');
      if (value.action === 'revoke')
        await revokeAccountSessions(value.account.id);
      if (value.action === 'reset') {
        const reset = await issueAccountPasswordReset(value.account.id);
        result = {
          title: 'Parola sıfırlama isteği oluşturuldu',
          description: reset.token
            ? 'Bu bağlantı yalnız bir kez gösterilir. Güvenli bir kanaldan paylaşın.'
            : 'Bağlantı, yapılandırılmış teslim sağlayıcısına gönderildi.',
          url: reset.token
            ? completionUrl('reset-password', reset.token)
            : undefined,
        };
      }
      toast.success(copy.success);
      onCompleted(result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : copy.error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog open onOpenChange={busy ? undefined : onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>
            {value.account.name} ({value.account.email}) — {copy.description}
          </DialogDescription>
        </DialogHeader>
        <FormError message={error} />
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={busy} autoFocus>
              İptal
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant={value.action === 'suspend' ? 'destructive' : 'default'}
            disabled={busy}
            onClick={() => void submit()}
          >
            {busy ? 'İşleniyor…' : copy.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SensitiveResultDialog({
  value,
  onOpenChange,
}: {
  value: SensitiveResult;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{value.title}</DialogTitle>
          <DialogDescription>{value.description}</DialogDescription>
        </DialogHeader>
        {value.url ? (
          <div className="account-access-reference__token-result">
            <code>{value.url}</code>
            <Button
              type="button"
              variant="outline"
              onClick={() => void copyValue(value.url!)}
            >
              <Copy /> Bağlantıyı kopyala
            </Button>
          </div>
        ) : (
          <Alert>
            <CheckCircle />
            <AlertTitle>Teslim kabul edildi</AlertTitle>
            <AlertDescription>
              Gizli token tarayıcıya gönderilmedi.
            </AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button">Tamam</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RoleMatrix({
  sportingRoles,
  clubId,
}: {
  sportingRoles: SportingRole[];
  clubId?: string;
}) {
  return (
    <div className="account-access-reference__matrices">
      <SectionCard
        title="Hesap rolü matrisi"
        description="Platform giriş rolü ve temel kaynak kapsamı"
        action={<ShieldCheck weight="duotone" />}
        contentClassName="account-access-reference__role-grid"
      >
        {roleDescriptions.map((item) => (
          <article key={item.role}>
            <Badge variant="outline">{item.role}</Badge>
            <h3>{item.title}</h3>
            <strong>{item.scope}</strong>
            <p>{item.permissions}</p>
          </article>
        ))}
      </SectionCard>
      <SectionCard
        title="Sportif görev yetkileri"
        description="Takım atamalarıyla birlikte çalışan, salt okunur capability görünümü"
        action={<UsersThree weight="duotone" />}
        contentClassName="account-access-reference__capability-list"
      >
        {!clubId ? (
          <p>Sportif görevleri görmek için üst bardan bir kulüp seçin.</p>
        ) : sportingRoles.length ? (
          sportingRoles.map((item) => (
            <article key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <small>{item.systemKey ?? item.key}</small>
              </div>
              <p>
                {item.capabilities.length
                  ? item.capabilities
                      .map(({ capability }) => capabilityLabel(capability))
                      .join(' · ')
                  : 'Açık capability yok'}
              </p>
            </article>
          ))
        ) : (
          <p>Bu kulüp için görünür sportif görev bulunamadı.</p>
        )}
      </SectionCard>
    </div>
  );
}

function actionCopy(action: 'suspend' | 'reactivate' | 'reset' | 'revoke') {
  return {
    suspend: {
      title: 'Hesabı askıya al',
      description: 'kullanıcının giriş ve açık oturum erişimi durdurulur.',
      confirm: 'Hesabı askıya al',
      success: 'Hesap askıya alındı.',
      error: 'Hesap askıya alınamadı.',
    },
    reactivate: {
      title: 'Hesabı yeniden etkinleştir',
      description: 'kullanıcı tekrar giriş yapabilir.',
      confirm: 'Hesabı etkinleştir',
      success: 'Hesap etkinleştirildi.',
      error: 'Hesap etkinleştirilemedi.',
    },
    reset: {
      title: 'Parola sıfırlama bağlantısı oluştur',
      description: 'önceki açık sıfırlama bağlantısı geçersiz olur.',
      confirm: 'Bağlantıyı oluştur',
      success: 'Parola sıfırlama isteği oluşturuldu.',
      error: 'Parola sıfırlama isteği oluşturulamadı.',
    },
    revoke: {
      title: 'Tüm oturumları kapat',
      description: 'mevcut erişim ve yenileme oturumları hemen geçersiz olur.',
      confirm: 'Oturumları kapat',
      success: 'Kullanıcının oturumları kapatıldı.',
      error: 'Oturumlar kapatılamadı.',
    },
  }[action];
}

function roleLabel(role: AccountRole) {
  return {
    SYSTEM_ADMIN: 'Sistem yöneticisi',
    CLUB_ADMIN: 'Kulüp yöneticisi',
    COACH: 'Antrenör',
    PLAYER: 'Oyuncu',
  }[role];
}

function capabilityLabel(capability: string) {
  return (
    (
      {
        TEAM_VIEW: 'Takım görüntüleme',
        TEAM_MANAGE: 'Takım yönetimi',
        PLAYER_VIEW: 'Oyuncu görüntüleme',
        PLAYER_MANAGE: 'Oyuncu yönetimi',
        PLAYER_HISTORY_VIEW: 'Oyuncu geçmişi',
        ASSIGNMENT_VIEW: 'Atama görüntüleme',
        ASSIGNMENT_MANAGE: 'Atama yönetimi',
        AVAILABILITY_VIEW: 'Uygunluk görüntüleme',
      } as Record<string, string>
    )[capability] ?? capability
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function completionUrl(
  route: 'accept-invitation' | 'reset-password',
  token: string,
) {
  return `${window.location.origin}/${route}#token=${encodeURIComponent(token)}`;
}

async function copyValue(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success('Bağlantı kopyalandı.');
  } catch {
    toast.error('Bağlantı kopyalanamadı.');
  }
}
