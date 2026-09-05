import { CalendarBlank, CheckSquare, UsersThree } from '@phosphor-icons/react';
import { Link } from 'react-router';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { useWorkspace } from '../lib/workspace-context';

export function meta() {
  return [{ title: 'Yoklama | NGCS' }];
}

export default function AttendanceRoute() {
  const { plans, members, group, loading } = useWorkspace();
  const playerCount = members.filter(
    (member) => member.user.role === 'PLAYER',
  ).length;
  const sorted = [...plans].sort((a, b) =>
    (b.date ?? '').localeCompare(a.date ?? ''),
  );
  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="page-kicker">Katılım takibi</p>
          <h1>Yoklama</h1>
          <p>
            {group?.name ?? 'Takım TBD'} · {playerCount} oyuncu
          </p>
        </div>
      </header>
      {loading ? (
        <div className="loading-grid">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : sorted.length ? (
        <div className="attendance-list">
          {sorted.map((plan) => {
            const present = (plan.attendance ?? []).filter(
              (item) => item.status === 'PRESENT',
            ).length;
            return (
              <Card key={plan.id}>
                <CardHeader className="attendance-card-header">
                  <span className="attendance-date">
                    <CalendarBlank />
                    <small>{formatDate(plan.date)}</small>
                  </span>
                  <div>
                    <CardTitle>{plan.title}</CardTitle>
                    <p>{plan.notes || 'Antrenman amacı TBD'}</p>
                  </div>
                  <Badge
                    variant={
                      present === playerCount && playerCount > 0
                        ? 'default'
                        : 'outline'
                    }
                  >
                    {present}/{playerCount} katıldı
                  </Badge>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/app/trainings/${plan.id}?tab=attendance`}>
                      <CheckSquare /> Yoklamayı aç
                    </Link>
                  </Button>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <UsersThree weight="duotone" />
          <h2>Yoklama bekleyen plan yok</h2>
          <p>Önce bir antrenman planı oluşturun.</p>
          <Button asChild>
            <Link to="/app/trainings">Antrenmanlara git</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) return 'Tarih TBD';
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}
