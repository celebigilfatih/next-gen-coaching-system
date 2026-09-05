import {
  ArrowRight,
  Books,
  CalendarBlank,
  CheckCircle,
  ClipboardText,
  SoccerBall,
  UsersThree,
} from '@phosphor-icons/react';
import { Link } from 'react-router';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { getSession } from '../lib/session';
import { useWorkspace } from '../lib/workspace-context';

export function meta() {
  return [{ title: 'Genel Bakış | NGCS' }];
}

export default function DashboardRoute() {
  const { group, season, plans, matches, drills, members, loading } =
    useWorkspace();
  const user = getSession()?.user;
  const players = members.filter((member) => member.user.role === 'PLAYER');
  const scheduledMatches = [...matches].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  const recentPlans = [...plans]
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
    .slice(0, 3);
  const present = plans.reduce(
    (total, plan) =>
      total +
      (plan.attendance ?? []).filter((item) => item.status === 'PRESENT')
        .length,
    0,
  );

  return (
    <div className="page-shell dashboard-page">
      <header className="page-header dashboard-heading">
        <div>
          <p className="page-kicker">Günlük operasyon özeti</p>
          <h1>Hoş geldin, {user?.name.split(' ')[0] ?? 'Koç'}</h1>
          <p>
            {group?.name ?? 'Takım TBD'} · {season?.name ?? 'Sezon TBD'}
          </p>
        </div>
        <Button asChild>
          <Link to="/app/trainings">
            Antrenman planla <ArrowRight />
          </Link>
        </Button>
      </header>

      {loading ? (
        <div className="dashboard-stat-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton className="h-32" key={index} />
          ))}
        </div>
      ) : (
        <div className="dashboard-stat-grid">
          <StatCard
            icon={ClipboardText}
            label="Antrenman"
            value={plans.length}
            detail="Aktif takım planı"
          />
          <StatCard
            icon={UsersThree}
            label="Oyuncu"
            value={players.length}
            detail="Kadroda aktif"
          />
          <StatCard
            icon={Books}
            label="Egzersiz"
            value={drills.length}
            detail="Erişilebilir içerik"
          />
          <StatCard
            icon={CheckCircle}
            label="Katılım"
            value={present}
            detail="İşaretlenmiş katılım"
          />
        </div>
      )}

      <div className="dashboard-grid">
        <Card>
          <CardHeader className="section-card-header">
            <div>
              <CardTitle>Son antrenmanlar</CardTitle>
              <CardDescription>
                Planlama ve yoklama için hızlı erişim
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app/trainings">Tümü</Link>
            </Button>
          </CardHeader>
          <CardContent className="dashboard-list">
            {recentPlans.length ? (
              recentPlans.map((plan) => (
                <Link to={`/app/trainings/${plan.id}`} key={plan.id}>
                  <span className="dashboard-list-icon">
                    <CalendarBlank />
                  </span>
                  <span>
                    <strong>{plan.title}</strong>
                    <small>
                      {formatDate(plan.date)} · {plan.totalDuration} dk
                    </small>
                  </span>
                  <Badge variant="outline">
                    {plan.drills?.length ?? 0} faz
                  </Badge>
                </Link>
              ))
            ) : (
              <p className="dashboard-empty">Henüz antrenman planı yok.</p>
            )}
          </CardContent>
        </Card>

        <Card className="dashboard-match-card">
          <CardHeader className="section-card-header">
            <div>
              <CardTitle>Sezon maçları</CardTitle>
              <CardDescription>
                Analiz ve taktik hazırlık durumu
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app/matches">Tümü</Link>
            </Button>
          </CardHeader>
          <CardContent className="dashboard-list">
            {scheduledMatches.length ? (
              scheduledMatches.slice(0, 3).map((match) => (
                <Link to={`/app/matches/${match.id}`} key={match.id}>
                  <span className="dashboard-list-icon amber">
                    <SoccerBall />
                  </span>
                  <span>
                    <strong>{match.opponent}</strong>
                    <small>
                      {formatDate(match.date)} · {match.location}
                    </small>
                  </span>
                  <Badge variant={match.tacticalBoard ? 'default' : 'amber'}>
                    {match.tacticalBoard ? 'Hazır' : 'Tahta bekliyor'}
                  </Badge>
                </Link>
              ))
            ) : (
              <p className="dashboard-empty">Planlanmış maç bulunmuyor.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Books;
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <Card className="dashboard-stat">
      <CardContent>
        <span className="dashboard-stat-icon">
          <Icon weight="duotone" />
        </span>
        <span>
          <small>{label}</small>
          <strong>{value}</strong>
          <em>{detail}</em>
        </span>
      </CardContent>
    </Card>
  );
}

function formatDate(value: string | null) {
  if (!value) return 'Tarih TBD';
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}
