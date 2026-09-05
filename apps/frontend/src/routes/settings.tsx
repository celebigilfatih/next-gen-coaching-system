import { Gear, ShieldCheck, SignOut, UsersThree } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { clearSession, getSession } from '../lib/session';
import { useWorkspace } from '../lib/workspace-context';

export function meta() {
  return [{ title: 'Ayarlar | NGCS' }];
}

export default function SettingsRoute() {
  const navigate = useNavigate();
  const user = getSession()?.user;
  const { group, season } = useWorkspace();
  function logout() {
    clearSession();
    navigate('/login');
  }
  return (
    <div className="page-shell settings-page">
      <header className="page-header">
        <div>
          <p className="page-kicker">Çalışma alanı</p>
          <h1>Ayarlar</h1>
          <p>Hesap, takım ve yerel oturum bilgileri.</p>
        </div>
      </header>
      <div className="settings-grid">
        <Card>
          <CardHeader>
            <CardTitle>
              <Gear /> Profil özeti
            </CardTitle>
          </CardHeader>
          <CardContent className="settings-list">
            <SettingsRow label="Ad" value={user?.name ?? 'TBD'} />
            <Separator />
            <SettingsRow label="E-posta" value={user?.email ?? 'TBD'} />
            <Separator />
            <SettingsRow
              label="Rol"
              value={<Badge>{user?.role ?? 'TBD'}</Badge>}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              <UsersThree /> Aktif bağlam
            </CardTitle>
          </CardHeader>
          <CardContent className="settings-list">
            <SettingsRow label="Takım" value={group?.name ?? 'TBD'} />
            <Separator />
            <SettingsRow label="Yaş grubu" value={group?.ageGroup ?? 'TBD'} />
            <Separator />
            <SettingsRow label="Sezon" value={season?.name ?? 'TBD'} />
          </CardContent>
        </Card>
      </div>
      <Alert className="session-alert">
        <ShieldCheck />
        <AlertTitle>Yerel ve geçici oturum</AlertTitle>
        <AlertDescription>
          Access token yalnız tarayıcı belleğinde tutulur. Sayfa yenilendiğinde
          yeniden giriş gerekir; kalıcı session ADR-0010 implementation
          girdilerini bekliyor.
        </AlertDescription>
      </Alert>
      <Button variant="destructive" onClick={logout}>
        <SignOut /> Çıkış yap
      </Button>
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
