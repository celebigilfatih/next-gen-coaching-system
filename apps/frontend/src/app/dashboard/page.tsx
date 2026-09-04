"use client";
import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { ClubSetupModal } from "@/components/club-setup-modal";
import { useClubStore } from "@/store/useClubStore";
import { routes } from "@/lib/routes";
import {
  Users,
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  UserPlus,
  Activity,
  BarChart3,
  ClipboardList,
  Library,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface DashboardStats {
  totalTrainings: number;
  activeAthletes: number;
  newRegistrations: number;
  totalHours: string;
  recentTrainings: any[];
  recentDrills: any[];
  upcomingMatches: any[];
  trends: {
    trainings: string;
    athletes: string;
    registrations: string;
    hours: string;
  };
}

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  trend: "up" | "down";
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

function StatCard({ title, value, change, trend, icon: Icon, iconBg, iconColor }: StatCardProps) {
  return (
    <Card className="rounded-xl shadow-sm border border-slate-200 bg-white overflow-hidden">
      <CardContent className="px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">{value}</p>
            <div className={`flex items-center text-xs font-medium mt-1 ${
              trend === "up" ? "text-emerald-600" : "text-rose-600"
            }`}>
              {trend === "up" ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {change}
              <span className="text-slate-400 ml-1">from last month</span>
            </div>
          </div>
          <div className={`p-2 rounded-full ${iconBg}`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { selectedClub } = useClubStore();
  const userRole = (session as any)?.role;
  const userName = (session as any)?.user?.name ?? "Kullanıcı";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showClubSetup, setShowClubSetup] = useState(false);
  const [clubs, setClubs] = useState<any[]>([]);
  const [clubsLoaded, setClubsLoaded] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const token = (session as any)?.accessToken;

  // Check if user has any clubs
  useEffect(() => {
    if (!token || userRole !== 'ADMIN') return;
    
    const checkClubs = async () => {
      try {
        const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/clubs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setClubs(data);
          setClubsLoaded(true);
          
          // If no clubs exist, show setup modal
          if (data.length === 0) {
            setShowClubSetup(true);
          }
        }
      } catch (error) {
        console.error('Failed to check clubs:', error);
        setClubsLoaded(true);
      }
    };
    
    checkClubs();
  }, [token, userRole]);

  // Fetch dashboard stats
  useEffect(() => {
    if (!token) return;
    
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const url = new URL(process.env.NEXT_PUBLIC_API_URL + "/stats/dashboard");
        if (selectedClub?.id) {
          url.searchParams.set('clubId', selectedClub.id);
        }
        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };
    
    fetchStats();
  }, [token, selectedClub?.id]);

  const getTrendDirection = (change: string): "up" | "down" => {
    return change.startsWith('+') ? 'up' : 'down';
  };

  return (
    <div className="flex min-h-screen">
      <ClubSetupModal 
        open={showClubSetup} 
        onClose={() => {
          setShowClubSetup(false);
          // Reload clubs after setup
          if (token && userRole === 'ADMIN') {
            fetch(process.env.NEXT_PUBLIC_API_URL + "/clubs", {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then(res => res.json())
            .then(data => setClubs(data))
            .catch(console.error);
          }
        }} 
      />
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 lg:ml-64">
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="mt-[57px]">
          <div className="p-8 lg:p-10 space-y-8 lg:space-y-10">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Proje Dashboard</h1>
              <p className="text-sm font-medium text-slate-500 mt-1">
                {selectedClub ? selectedClub.name : "Hoş geldiniz"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="h-9 rounded-lg border-slate-200 text-xs font-medium">
                <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                09 Eki 2025 - 05 Kas 2025
              </Button>
              <Button size="sm" className="h-9 rounded-lg text-xs font-bold">Export</Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsLoading || !stats ? (
              <>
                <Card className="rounded-xl border-slate-200"><CardContent className="pt-6 text-slate-400 text-sm font-medium">Yükleniyor...</CardContent></Card>
                <Card className="rounded-xl border-slate-200"><CardContent className="pt-6 text-slate-400 text-sm font-medium">Yükleniyor...</CardContent></Card>
                <Card className="rounded-xl border-slate-200"><CardContent className="pt-6 text-slate-400 text-sm font-medium">Yükleniyor...</CardContent></Card>
                <Card className="rounded-xl border-slate-200"><CardContent className="pt-6 text-slate-400 text-sm font-medium">Yükleniyor...</CardContent></Card>
              </>
            ) : (
              <>
                <StatCard
                  title="Toplam Antrenman"
                  value={stats.totalTrainings}
                  change={stats.trends.trainings}
                  trend={getTrendDirection(stats.trends.trainings)}
                  icon={Activity}
                  iconBg="bg-blue-100"
                  iconColor="text-blue-600"
                />
                <StatCard
                  title="Aktif Sporcular"
                  value={stats.activeAthletes}
                  change={stats.trends.athletes}
                  trend={getTrendDirection(stats.trends.athletes)}
                  icon={Users}
                  iconBg="bg-emerald-100"
                  iconColor="text-emerald-600"
                />
                <StatCard
                  title="Yeni Kayıtlar"
                  value={stats.newRegistrations}
                  change={stats.trends.registrations}
                  trend={getTrendDirection(stats.trends.registrations)}
                  icon={UserPlus}
                  iconBg="bg-violet-100"
                  iconColor="text-violet-600"
                />
                <StatCard
                  title="Toplam Saat"
                  value={stats.totalHours}
                  change={stats.trends.hours}
                  trend={getTrendDirection(stats.trends.hours)}
                  icon={Clock}
                  iconBg="bg-amber-100"
                  iconColor="text-amber-600"
                />
              </>
            )}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Trainings */}
            <Card className="rounded-xl shadow-sm border border-slate-200 bg-white overflow-hidden">
              <CardHeader className="p-6 border-b border-slate-100 bg-slate-50/30">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900 tracking-tight">Son Eklenen Antrenmanlar</CardTitle>
                    <CardDescription className="text-xs font-medium text-slate-500 mt-1">Sisteme yeni girilen antrenman planları</CardDescription>
                  </div>
                  <Link href="/planner">
                    <Button variant="ghost" size="sm" className="h-8 text-xs font-bold">Hepsini Gör</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {statsLoading || !stats?.recentTrainings ? (
                    <p className="text-sm text-slate-400 font-medium">Yükleniyor...</p>
                  ) : stats.recentTrainings.length === 0 ? (
                    <div className="py-12 text-center">
                      <ClipboardList className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm font-bold text-slate-900">Henüz antrenman planı bulunmuyor.</p>
                      <p className="text-xs font-medium text-slate-500 mt-1">İlk planınızı oluşturun</p>
                    </div>
                  ) : (
                    stats.recentTrainings.map((plan) => (
                      <div key={plan.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50/50 hover:border-slate-200 transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-sm text-primary">
                            <ClipboardList className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{plan.title}</p>
                            <p className="text-xs font-medium text-slate-500">
                              {plan.group?.name || 'Grup Atanmamış'} • {plan.totalDuration} dk
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {new Date(plan.createdAt).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Matches */}
            <Card className="rounded-xl shadow-sm border border-slate-200 bg-white overflow-hidden">
              <CardHeader className="p-6 border-b border-slate-100 bg-slate-50/30">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900 tracking-tight">Yaklaşan Maçlar</CardTitle>
                    <CardDescription className="text-xs font-medium text-slate-500 mt-1">Önümüzdeki günlerdeki müsabakalar</CardDescription>
                  </div>
                  <Link href="/season-planner">
                    <Button variant="ghost" size="sm" className="h-8 text-xs font-bold">Planlayıcı</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {statsLoading || !stats?.upcomingMatches ? (
                    <p className="text-sm text-slate-400 font-medium">Yükleniyor...</p>
                  ) : stats.upcomingMatches.length === 0 ? (
                    <div className="py-12 text-center">
                      <Target className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm font-bold text-slate-900">Planlanmış maç bulunmuyor.</p>
                      <p className="text-xs font-medium text-slate-500 mt-1">Sezon planlayıcısını kullanın</p>
                    </div>
                  ) : (
                    stats.upcomingMatches.map((match) => (
                      <div key={match.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50/50 hover:border-slate-200 transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase whitespace-nowrap min-w-[64px] text-center text-slate-600 shadow-sm">
                            {match.group?.name || 'A TAKIM'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">vs {match.opponent}</p>
                            <p className="text-xs font-medium text-slate-500">
                              {match.location} • {match.competition || 'Hazırlık Maçı'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900">
                            {new Date(match.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {new Date(match.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Drills */}
            <Card className="lg:col-span-2 rounded-xl shadow-sm border border-slate-200 bg-white overflow-hidden">
              <CardHeader className="p-6 border-b border-slate-100 bg-slate-50/30">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900 tracking-tight">Yeni Driller</CardTitle>
                    <CardDescription className="text-xs font-medium text-slate-500 mt-1">Antrenman havuzuna eklenen son çalışmalar</CardDescription>
                  </div>
                  <Link href="/drills">
                    <Button size="sm" className="h-8 text-xs font-bold rounded-lg">Kütüphaneye Git</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {statsLoading || !stats?.recentDrills ? (
                    <p className="text-sm text-slate-400 font-medium">Yükleniyor...</p>
                  ) : stats.recentDrills.length === 0 ? (
                    <div className="col-span-full py-12 text-center">
                      <Library className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm font-bold text-slate-900">Henüz drill eklenmemiş.</p>
                      <p className="text-xs font-medium text-slate-500 mt-1">Drill kütüphanesini keşfedin</p>
                    </div>
                  ) : (
                    stats.recentDrills.map((drill) => (
                      <div key={drill.id} className="flex items-start gap-3 p-3 border border-slate-100 rounded-xl hover:bg-slate-50/50 hover:border-slate-200 transition-all group">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                          {drill.imageUrl ? (
                            <img src={drill.imageUrl} alt={drill.title} className="w-full h-full object-cover" />
                          ) : (
                            <Library className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 line-clamp-1">{drill.title}</p>
                          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{drill.category}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded text-slate-600 font-medium">
                              {drill.difficulty}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded text-slate-600 font-medium">
                              {drill.durationMin} dk
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Chart */}
            <Card className="lg:col-span-2 rounded-xl shadow-sm border border-slate-200 bg-white overflow-hidden">
              <CardHeader className="p-6 border-b border-slate-100 bg-slate-50/30">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900 tracking-tight">Antrenman Özeti</CardTitle>
                    <CardDescription className="text-xs font-medium text-slate-500 mt-1">Son 3 ay için toplam</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 text-xs font-bold rounded-lg border-slate-200">Son 3 ay</Button>
                    <Button variant="ghost" size="sm" className="h-8 text-xs font-bold">Son 30 gün</Button>
                    <Button variant="ghost" size="sm" className="h-8 text-xs font-bold">Son 7 gün</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[400px] flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-slate-200" />
                    <p className="text-sm font-bold text-slate-900">Antrenman verileri grafik olarak burada görüntülenecek.</p>
                    <p className="text-xs font-medium text-slate-500 mt-1">Veriler toplandıkça grafik otomatik olarak güncellenecektir.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Matches */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Yaklaşan Maçlar</CardTitle>
                    <CardDescription>Önümüzdeki günlerdeki müsabakalar</CardDescription>
                  </div>
                  <Link href="/season-planner">
                    <Button variant="ghost" size="sm">Planlayıcı</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statsLoading || !stats?.upcomingMatches ? (
                    <p className="text-sm text-muted-foreground">Yükleniyor...</p>
                  ) : stats.upcomingMatches.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Planlanmış maç bulunmuyor.</p>
                  ) : (
                    stats.upcomingMatches.map((match) => (
                      <div key={match.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="px-2 py-1 bg-blue-100 rounded-lg text-blue-700 text-[10px] font-black uppercase whitespace-nowrap min-w-[64px] text-center border border-blue-200">
                            {match.group?.name || 'A TAKIM'}
                          </div>
                          <div>
                            <p className="text-sm font-medium">vs {match.opponent}</p>
                            <p className="text-xs text-muted-foreground">
                              {match.location} • {match.competition || 'Hazırlık Maçı'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {new Date(match.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(match.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Drills */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Yeni Driller</CardTitle>
                    <CardDescription>Antrenman havuzuna eklenen son çalışmalar</CardDescription>
                  </div>
                  <Link href="/drills">
                    <Button variant="ghost" size="sm">Kütüphaneye Git</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {statsLoading || !stats?.recentDrills ? (
                    <p className="text-sm text-muted-foreground">Yükleniyor...</p>
                  ) : stats.recentDrills.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Henüz drill eklenmemiş.</p>
                  ) : (
                    stats.recentDrills.map((drill) => (
                      <div key={drill.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                          {drill.imageUrl ? (
                            <img src={drill.imageUrl} alt={drill.title} className="w-full h-full object-cover" />
                          ) : (
                            <Library className="h-6 w-6 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium line-clamp-1">{drill.title}</p>
                          <p className="text-xs text-muted-foreground">{drill.category}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
                              {drill.difficulty}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
                              {drill.durationMin} dk
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Chart (Now smaller to fit the grid if needed, or keeping it separate) */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Antrenman Özeti</CardTitle>
                    <CardDescription>Son 3 ay için toplam</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Son 3 ay</Button>
                    <Button variant="ghost" size="sm">Son 30 gün</Button>
                    <Button variant="ghost" size="sm">Son 7 gün</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl bg-slate-50/50">
                  <div className="text-center">
                    <BarChart3 className="h-10 w-10 mx-auto mb-4 opacity-20" />
                    <p>Antrenman verileri grafik olarak burada görüntülenecek.</p>
                    <p className="text-sm opacity-60">Veriler toplandıkça grafik otomatik olarak güncellenecektir.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
