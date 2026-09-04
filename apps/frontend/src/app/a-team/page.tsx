"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Trophy, 
  TrendingUp, 
  Activity, 
  Users, 
  AlertCircle, 
  ChevronRight, 
  Clock, 
  Zap, 
  Heart,
  Layout,
  BarChart3
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { routes } from "@/lib/routes";

export default function ATeamDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(routes.signin);
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Yükleniyor...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Mock data for charts
  const performanceData = [
    { name: 'Pzt', hsr: 1100, load: 75 },
    { name: 'Sal', hsr: 1300, load: 85 },
    { name: 'Çar', hsr: 900, load: 60 },
    { name: 'Per', hsr: 1400, load: 95 },
    { name: 'Cum', hsr: 1200, load: 80 },
    { name: 'Cmt', hsr: 1500, load: 100 },
    { name: 'Paz', hsr: 0, load: 0 },
  ];

  const topPlayers = [
    { name: "Ahmet Yılmaz", hsr: 1250, trend: "+5%", status: "Fit" },
    { name: "Mehmet Demir", hsr: 1180, trend: "+3%", status: "Yorgun" },
    { name: "Can Özkan", hsr: 1120, trend: "-2%", status: "Fit" },
    { name: "Selin Ak", hsr: 1050, trend: "+8%", status: "Fit" },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col lg:ml-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-auto p-8 lg:p-10 bg-background mt-[57px]">
          <div className="max-w-[1920px] mx-auto space-y-8 lg:space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Trophy className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
                    A Takım Performans Merkezi
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Elit takım performans izleme, yük analizi ve sakatlık risk yönetimi.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/5 rounded-full border border-green-500/10">
                <Activity className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-green-600 uppercase tracking-wider">
                  Sistem Aktif: Canlı Veri
                </span>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-none shadow-md hover:shadow-lg transition-all border-l-4 border-l-orange-500">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ortalama HSR</CardTitle>
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black italic">1,185m</div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs font-bold text-green-600">+4.2%</span>
                    <span className="text-[10px] text-muted-foreground">geçen haftadan</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md hover:shadow-lg transition-all border-l-4 border-l-amber-500">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Toplam Mesafe</CardTitle>
                  <Activity className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black italic">7,250m</div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs font-bold text-muted-foreground">Sabit</span>
                    <span className="text-[10px] text-muted-foreground">hedef aralığında</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md hover:shadow-lg transition-all border-l-4 border-l-orange-500">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Aktif Kadro</CardTitle>
                  <Users className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black italic">23 / 25</div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs font-bold text-orange-600">2 Eksik</span>
                    <span className="text-[10px] text-muted-foreground">rehabilitasyonda</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md hover:shadow-lg transition-all border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sakatlık Riski</CardTitle>
                  <AlertCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black italic text-green-600 uppercase">Düşük</div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[10px] text-muted-foreground">Tüm parametreler normal</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 border-none shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Haftalık Yük Analizi
                    </CardTitle>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-[10px] font-bold uppercase">HSR</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-orange-200" />
                        <span className="text-[10px] font-bold uppercase">Yük</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={performanceData}>
                        <defs>
                          <linearGradient id="colorHsr" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fontSize: 12, fill: '#94a3b8'}}
                          dy={10}
                        />
                        <YAxis hide />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="hsr" 
                          stroke="#f97316" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorHsr)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Top Performers */}
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2 border-b border-muted">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    Zirve Performanslar
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-5">
                    {topPlayers.map((player, idx) => (
                      <div key={idx} className="group flex items-center justify-between p-2 rounded-xl hover:bg-muted/50 transition-all">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                            idx === 0 ? "bg-yellow-500 text-white" : "bg-muted text-muted-foreground"
                          }`}>
                            #{idx + 1}
                          </div>
                          <div>
                            <p className="font-bold text-sm leading-tight">{player.name}</p>
                            <span className={`text-[10px] font-bold uppercase ${
                              player.status === "Fit" ? "text-green-600" : "text-orange-600"
                            }`}>{player.status}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-black text-primary">{player.hsr}m</div>
                          <span className={`text-[10px] font-bold ${player.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                            {player.trend} HSR
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-6 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1">
                    Tümünü Gör <ChevronRight className="h-3 w-3" />
                  </button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Match Weeks */}
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-muted/30">
                <CardTitle className="flex items-center gap-2">
                  <Layout className="h-5 w-5 text-primary" />
                  Antrenman & Yük Günlüğü
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm">
                    <Clock className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                  <h3 className="font-bold text-muted-foreground">Veri Bekleniyor</h3>
                  <p className="text-sm text-muted-foreground/60 max-w-xs mx-auto mt-1">
                    GPS ve wellness verileri senkronize edildikten sonra günlük analizler burada görünecektir.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
