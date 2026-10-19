import {
  CalendarBlank,
  Gear,
  IdentificationCard,
  ShieldCheck,
  SignOut,
  UsersThree,
} from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import dashboardCoachWide from '../assets/dashboard-coach-wide.png';
import { PageHero } from '../components/presentation/page-hero';
import { MetricCard } from '../components/presentation/metric-card';
import { SectionCard } from '../components/presentation/section-card';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { getSession } from '../lib/session';
import { logout as endSession } from '../lib/api';
import { toast } from 'sonner';
import { useWorkspace } from '../lib/workspace-context';
import { workspaceSeasonLabel } from '../lib/workspace-scope';

export function meta() {
  return [{ title: 'Ayarlar | NGCS' }];
}

export default function SettingsRoute() {
  const navigate = useNavigate();
  const session = getSession();
  const user = session?.user;
  const { group, season, scope } = useWorkspace();
  const seasonLabel = workspaceSeasonLabel(scope, season?.name, 'TBD');
  const sessionLabel = session?.persistent ? 'Güvenli' : 'Geçici';
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
    <div className="page-shell settings-reference">
      <PageHero
        className="settings-reference__hero"
        eyebrow="Çalışma alanı"
        title="Ayarlar"
        description="Hesap, takım ve yerel oturum bilgileri."
        image={dashboardCoachWide}
      />

      <section
        className="settings-reference__metrics"
        aria-label="Ayar özetleri"
      >
        <MetricCard
          icon={IdentificationCard}
          label="Kullanıcı rolü"
          value={user?.role ?? 'TBD'}
          detail="Yetki profili"
        />
        <MetricCard
          icon={ShieldCheck}
          label="Oturum"
          value={sessionLabel}
          detail="Bu cihazdaki durum"
          tone="teal"
        />
        <MetricCard
          icon={UsersThree}
          label="Aktif takım"
          value={group?.name ?? 'TBD'}
          detail={group?.ageGroup ?? 'Yaş grubu TBD'}
          tone="violet"
        />
        <MetricCard
          icon={CalendarBlank}
          label="Sezon"
          value={seasonLabel}
          detail="Çalışma kapsamı"
          tone="amber"
        />
      </section>

      <div className="settings-reference__content">
        <div className="settings-reference__details">
          <SectionCard
            className="settings-reference__card"
            title="Profil özeti"
            description="Oturum açmış kullanıcı bilgileri"
            action={<Gear weight="duotone" aria-hidden="true" />}
            contentClassName="settings-list"
          >
            <SettingsRow label="Ad" value={user?.name ?? 'TBD'} />
            <Separator />
            <SettingsRow label="E-posta" value={user?.email ?? 'TBD'} />
            <Separator />
            <SettingsRow
              label="Rol"
              value={<Badge>{user?.role ?? 'TBD'}</Badge>}
            />
          </SectionCard>
          <SectionCard
            className="settings-reference__card"
            title="Aktif bağlam"
            description="Üst bardaki çalışma alanı seçiminiz"
            action={<UsersThree weight="duotone" aria-hidden="true" />}
            contentClassName="settings-list"
          >
            <SettingsRow label="Takım" value={group?.name ?? 'TBD'} />
            <Separator />
            <SettingsRow label="Yaş grubu" value={group?.ageGroup ?? 'TBD'} />
            <Separator />
            <SettingsRow label="Sezon" value={seasonLabel} />
          </SectionCard>
        </div>

        <SectionCard
          className="settings-reference__session"
          title="Oturum güvenliği"
          description="Bu cihazdaki giriş durumunu yönetin"
          action={<ShieldCheck weight="duotone" aria-hidden="true" />}
          contentClassName="settings-reference__session-content"
        >
          <Alert className="session-alert">
            <ShieldCheck />
            <AlertTitle>
              {session?.persistent ? 'Güvenli oturum' : 'Geçici oturum'}
            </AlertTitle>
            <AlertDescription>
              {session?.persistent
                ? 'Sayfayı yenilediğinizde oturumunuz güvenli bir çerezle yenilenir. Çıkış yaptığınızda bu cihazın oturumu sunucuda kapatılır.'
                : 'Sayfa yenilendiğinde yeniden giriş gerekir.'}
            </AlertDescription>
          </Alert>
          <div className="settings-reference__session-actions">
            <Button asChild variant="outline">
              <Link to="/app/dashboard">Ana sayfaya dön</Link>
            </Button>
            <Button variant="destructive" onClick={logout}>
              <SignOut /> Çıkış yap
            </Button>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function SettingsRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
