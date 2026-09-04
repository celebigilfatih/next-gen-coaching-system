"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar, 
  Trophy, 
  Edit2, 
  X, 
  Clock, 
  Zap, 
  CheckCircle2, 
  PlayCircle, 
  Moon, 
  BrainCircuit, 
  MapPin, 
  Home, 
  Plane, 
  Dumbbell,
  Flag,
  Users,
  Medal,
  Swords,
  TrendingUp,
  Activity,
  Timer
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TrainingPlanBuilder } from "@/components/training-plan-builder";
import Link from "next/link";

interface DayPlan {
  id: string;
  dayOfWeek: number;
  date: string;
  type: "TRAINING" | "MATCH" | "REST" | "RECOVERY" | "TACTICAL" | "TOPLANTI" | "GORUSME";
  title?: string;
  duration?: number;
  intensity?: number;
  notes?: string;
  location?: string;
  topic?: string;
  opponent?: string;
  competition?: string;
  completed: boolean;
  trainingPlan?: {
    id: string;
    title: string;
    group?: {
      id: string;
      name: string;
      category: string;
    };
    drills: Array<{
      drill: {
        id: string;
        title: string;
        durationMin: number;
      };
    }>;
  };
}

interface WeekPlan {
  id: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  notes?: string;
  totalLoad: number;
  days: DayPlan[];
}

interface Match {
  id: string;
  date: string;
  opponent: string;
  location: string;
  competition?: string;
  result?: string;
  group?: {
    id: string;
    name: string;
    ageGroup: string;
    category: string;
  };
}

interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  clubId: string | null;
  weeks: WeekPlan[];
  matches: Match[];
}

const DAY_NAMES = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const DAY_TYPE_LABELS: Record<string, string> = {
  TRAINING: "Antrenman",
  MATCH: "Maç",
  REST: "Dinlenme",
  RECOVERY: "Toparlanma",
  TACTICAL: "Taktik",
  TOPLANTI: "Toplantı",
  GORUSME: "Görüşme",
};
const DAY_TYPE_ICONS: Record<string, any> = {
  TRAINING: PlayCircle,
  MATCH: Trophy,
  REST: Moon,
  RECOVERY: CheckCircle2,
  TACTICAL: BrainCircuit,
  TOPLANTI: Users,
  GORUSME: Zap,
};
const DAY_TYPE_COLORS: Record<string, string> = {
  TRAINING: "bg-green-500/10 border-green-500/30 hover:bg-green-500/20 text-green-700",
  MATCH: "bg-red-500/10 border-red-500/30 hover:bg-red-500/20 text-red-700",
  REST: "bg-slate-500/10 border-slate-500/30 hover:bg-slate-500/20 text-slate-700",
  RECOVERY: "bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20 text-purple-700",
  TACTICAL: "bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-500/20 text-indigo-700",
  TOPLANTI: "bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 text-blue-700",
  GORUSME: "bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 text-amber-700",
};

export default function SeasonDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const seasonId = params.id as string;

  const [season, setSeason] = useState<Season | null>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showDayDialog, setShowDayDialog] = useState(false);
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [showPlanDetailDialog, setShowPlanDetailDialog] = useState(false);
  const [showTrainingPlanDialog, setShowTrainingPlanDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<DayPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState<{ weekId: string; dayOfWeek: number; date: string } | null>(null);
  const [editingDay, setEditingDay] = useState<{ weekId: string; dayOfWeek: number; date: string } | null>(null);
  const [filters, setFilters] = useState<{ types: string[], search: string, teamFilter: 'ALL' | 'A_TAKIM' | 'GROUPS' }>({
    types: [],
    search: "",
    teamFilter: 'ALL'
  });

  const [dayFormData, setDayFormData] = useState({
    type: "TRAINING" as DayPlan["type"],
    title: "",
    duration: "",
    intensity: "",
    notes: "",
    location: "",
    topic: "",
    opponent: "",
    competition: "",
  });

  const [matchFormData, setMatchFormData] = useState({
    date: "",
    opponent: "",
    location: "HOME",
    competition: "",
    groupId: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && seasonId) {
      fetchSeason();
    }
  }, [status, seasonId]);

  useEffect(() => {
    if (status === "authenticated" && season?.clubId) {
      fetchGroups();
    }
  }, [status, season?.clubId]);

  const fetchGroups = async () => {
    try {
      const token = (session as any)?.accessToken;
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/groups`, {
        params: { clubId: season?.clubId },
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(res.data);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const fetchSeason = async () => {
    try {
      const token = (session as any)?.accessToken;
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/seasons/${seasonId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      if (!data) throw new Error('No data received');
      if (!data.weeks) data.weeks = [];
      if (!data.matches) data.matches = [];
      
      if (data.weeks.length === 0) {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/seasons/${seasonId}/generate-weeks`, {}, { headers: { Authorization: `Bearer ${token}` } });
        const refreshResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/seasons/${seasonId}`, { headers: { Authorization: `Bearer ${token}` } });
        setSeason(refreshResponse.data);
      } else {
        setSeason(data);
      }
    } catch (error: any) {
      console.error("Error fetching season:", error);
      alert(`Sezon yüklenemedi: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createOrUpdateDay = async () => {
    if (!editingDay) return;
    try {
      const token = (session as any)?.accessToken;
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/seasons/weeks/${editingDay.weekId}/days`, {
        dayOfWeek: editingDay.dayOfWeek,
        date: editingDay.date,
        type: dayFormData.type,
        title: dayFormData.title || null,
        duration: dayFormData.duration ? parseInt(dayFormData.duration) : null,
        intensity: dayFormData.intensity ? parseInt(dayFormData.intensity) : null,
        notes: dayFormData.notes || null,
        location: dayFormData.location || null,
        topic: dayFormData.topic || null,
        opponent: dayFormData.opponent || null,
        competition: dayFormData.competition || null,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setShowDayDialog(false);
      setEditingDay(null);
      setDayFormData({ 
        type: "TRAINING", 
        title: "", 
        duration: "", 
        intensity: "", 
        notes: "", 
        location: "", 
        topic: "", 
        opponent: "", 
        competition: "" 
      });
      fetchSeason();
    } catch (error) {
      console.error("Error saving day:", error);
      alert("Gün kaydedilemedi");
    }
  };

  const createMatch = async () => {
    if (!matchFormData.date || !matchFormData.opponent) {
      alert("Lütfen tarih ve rakip bilgilerini girin");
      return;
    }
    try {
      const token = (session as any)?.accessToken;
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/seasons/${seasonId}/matches`, matchFormData, { headers: { Authorization: `Bearer ${token}` } });
      setShowMatchDialog(false);
      setMatchFormData({ date: "", opponent: "", location: "HOME", competition: "", groupId: "" });
      fetchSeason();
    } catch (error) {
      console.error("Error creating match:", error);
      alert("Maç eklenemedi");
    }
  };

  const deleteDay = async (dayId: string) => {
    if (!confirm('Bu planı silmek istediğinizden emin misiniz?')) return;
    try {
      const token = (session as any)?.accessToken;
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/seasons/days/${dayId}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchSeason();
    } catch (error) {
      console.error("Error deleting day:", error);
      alert("Plan silinemedi");
    }
  };

  const deleteMatch = async (matchId: string) => {
    if (!confirm('Bu maçı silmek istediğinizden emin misiniz?')) return;
    try {
      const token = (session as any)?.accessToken;
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/seasons/matches/${matchId}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchSeason();
    } catch (error) {
      console.error("Error deleting match:", error);
      alert("Maç silinemedi");
    }
  };

  const openDayDialog = (weekId: string, dayOfWeek: number, date: string, existingDay?: DayPlan) => {
    setEditingDay({ weekId, dayOfWeek, date });
    if (existingDay) {
      setDayFormData({ 
        type: existingDay.type, 
        title: existingDay.title || "", 
        duration: existingDay.duration?.toString() || "", 
        intensity: existingDay.intensity?.toString() || "", 
        notes: existingDay.notes || "",
        location: existingDay.location || "",
        topic: existingDay.topic || "",
        opponent: existingDay.opponent || "",
        competition: existingDay.competition || ""
      });
    } else {
      setDayFormData({ 
        type: "TRAINING", 
        title: "", 
        duration: "", 
        intensity: "", 
        notes: "", 
        location: "", 
        topic: "", 
        opponent: "", 
        competition: "" 
      });
    }
    setShowDayDialog(true);
  };

  const goToPrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const goToNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const stats = season ? (() => {
    let trainingCount = 0;
    
    // Filter matches based on the current filters
    const filteredMatchesForStats = season.matches.filter(match => {
      let matchesTeam = true;
      if (filters.teamFilter === 'A_TAKIM') {
        matchesTeam = !match.group || 
                      match.group.category === 'A_TAKIM' || 
                      match.group.name.toLowerCase().includes('a takım') || 
                      match.group.name.toLowerCase().includes('a takim');
      } else if (filters.teamFilter === 'GROUPS') {
        const isATeamMatch = !match.group || 
                        match.group.category === 'A_TAKIM' || 
                        match.group.name.toLowerCase().includes('a takım') || 
                        match.group.name.toLowerCase().includes('a takim');
        matchesTeam = !isATeamMatch;
      }
      return matchesTeam;
    });

    let matchCount = filteredMatchesForStats.length;
    let totalIntensity = 0;
    let intensityCount = 0;
    let totalDuration = 0;

    season.weeks.forEach(week => {
      week.days.forEach(day => {
        // Check if this day plan matches the team filter
        let matchesTeam = true;
        const groupPlan = day.trainingPlan?.group;
        const isATeamPlan = !groupPlan || 
                        groupPlan.category === 'A_TAKIM' || 
                        groupPlan.name.toLowerCase().includes('a takım') || 
                        groupPlan.name.toLowerCase().includes('a takim');

        if (filters.teamFilter === 'A_TAKIM') {
          matchesTeam = isATeamPlan;
        } else if (filters.teamFilter === 'GROUPS') {
          matchesTeam = !isATeamPlan;
        }

        if (matchesTeam) {
          if (day.type === "TRAINING" || day.type === "TACTICAL" || day.type === "RECOVERY") trainingCount++;
          if (day.intensity) { totalIntensity += day.intensity; intensityCount++; }
          if (day.duration) totalDuration += day.duration;
        }
      });
    });
    return { trainingCount, matchCount, avgIntensity: intensityCount > 0 ? (totalIntensity / intensityCount).toFixed(1) : 0, totalDuration };
  })() : null;

  const filteredMatchesForCard = useMemo(() => {
    if (!season) return [];
    return season.matches.filter(match => {
      const matchesSearch = filters.search === "" || 
        match.opponent.toLowerCase().includes(filters.search.toLowerCase()) ||
        match.competition?.toLowerCase().includes(filters.search.toLowerCase());
      
      let matchesTeam = true;
      if (filters.teamFilter === 'A_TAKIM') {
        matchesTeam = match.group?.category === 'A_TAKIM' || 
                      match.group?.name.toLowerCase().includes('a takım') ||
                      match.group?.name.toLowerCase().includes('a takim') ||
                      !match.group;
      } else if (filters.teamFilter === 'GROUPS') {
        const isATeamMatch = !match.group || 
                        match.group.category === 'A_TAKIM' || 
                        match.group.name.toLowerCase().includes('a takım') || 
                        match.group.name.toLowerCase().includes('a takim');
        matchesTeam = !isATeamMatch;
      }
      return matchesSearch && matchesTeam;
    });
  }, [season, filters.teamFilter, filters.search]);

  const getMonthDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay() + (firstDay.getDay() === 0 ? -6 : 1));
    const days = [];
    const current = new Date(startDate);
    for (let i = 0; i < 42; i++) { days.push(new Date(current)); current.setDate(current.getDate() + 1); }
    return days;
  };

  if (status === "loading" || loading) return <div className="flex h-screen items-center justify-center text-muted-foreground">Yükleniyor...</div>;
  if (!session || !season) return null;

  const toggleTypeFilter = (type: string) => {
    setFilters(prev => ({
      ...prev,
      types: prev.types.includes(type) 
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }));
  };

  const monthDays = getMonthDays();
  const currentMonthName = currentMonth.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col lg:ml-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-auto p-8 lg:p-10 bg-background mt-[57px]">
          <div className="max-w-[1920px] mx-auto space-y-8 lg:space-y-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
              <div className="space-y-1">
                <Link 
                  href="/season-planner" 
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-orange-600 transition-colors group mb-1"
                >
                  <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  Sezon Planlayıcıya Dön
                </Link>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-none">
                      {season.name}
                    </h1>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold px-2 py-0.5">
                        {new Date(season.startDate).toLocaleDateString("tr-TR", { month: 'long', year: 'numeric' })} - {new Date(season.endDate).toLocaleDateString("tr-TR", { month: 'long', year: 'numeric' })}
                      </Badge>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                        <MapPin className="h-3 w-3" />
                        {season.clubId ? "Kulüp Sezonu" : "Bireysel Sezon"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="rounded-xl border-slate-200 font-bold" onClick={() => window.print()}><Calendar className="h-4 w-4 mr-2" /> Yazdır</Button>
                <Button className="rounded-xl shadow-lg shadow-primary/20 font-black px-6" onClick={() => setShowMatchDialog(true)}><Plus className="h-4 w-4 mr-2" /> Maç Ekle</Button>
              </div>
            </div>

            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Antrenman", value: stats.trainingCount, icon: Activity, color: "text-blue-600", bg: "bg-blue-50", description: "Planlanan seanslar" },
                  { label: "Maçlar", value: stats.matchCount, icon: Trophy, color: "text-orange-600", bg: "bg-orange-50", description: "Toplam müsabaka" },
                  { label: "Ort. Şiddet", value: stats.avgIntensity + "/10", icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50", description: "Sezon yoğunluğu" },
                  { label: "Toplam Süre", value: stats.totalDuration + " dk", icon: Timer, color: "text-purple-600", bg: "bg-purple-50", description: "Saha çalışması" }
                ].map((stat, i) => (
                  <Card key={i} className="border-none shadow-sm bg-white hover:shadow-md transition-all duration-300 group">
                    <CardContent className="p-6 flex items-center gap-5">
                      <div className={`h-14 w-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110 duration-300 shadow-inner`}>
                        <stat.icon className="h-7 w-7" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                        <p className="text-2xl font-black text-slate-900 leading-none">{stat.value}</p>
                        <p className="text-[10px] font-medium text-slate-400">{stat.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-4 p-4 bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 shadow-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2">Etkinlik Tipi:</span>
                  {["TRAINING", "MATCH", "TOPLANTI", "GORUSME"].map((type) => (
                    <Button
                      key={type}
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleTypeFilter(type)}
                      className={`h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                        filters.types.includes(type)
                          ? `${DAY_TYPE_COLORS[type]} ring-2 ring-current ring-offset-2`
                          : "bg-white/50 text-slate-500 hover:bg-white"
                      }`}
                    >
                      {DAY_TYPE_LABELS[type]}
                    </Button>
                  ))}
                  {filters.types.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setFilters(prev => ({ ...prev, types: [] }))}
                      className="h-8 text-[10px] font-bold text-slate-400 hover:text-red-500"
                    >
                      Temizle
                    </Button>
                  )}
                </div>
                <div className="relative w-full md:w-64">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    placeholder="Ara (Başlık, rakip...)"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-9 h-9 rounded-xl border-white/20 bg-white/50 backdrop-blur-sm text-xs font-medium placeholder:text-slate-400 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100/50">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2">Takım Filtresi:</span>
                {[
                  { id: 'ALL', label: 'Tüm Takımlar' },
                  { id: 'A_TAKIM', label: 'Sadece A Takım' },
                  { id: 'GROUPS', label: 'Sadece Altyapı/Gruplar' }
                ].map((f) => (
                  <Button
                    key={f.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilters(prev => ({ ...prev, teamFilter: f.id as any }))}
                    className={`h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                      filters.teamFilter === f.id
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "bg-white/50 text-slate-500 hover:bg-white"
                    }`}
                  >
                    {f.label}
                  </Button>
                ))}
              </div>
            </div>

            <Card className="border-none shadow-xl bg-white/40 backdrop-blur-md overflow-hidden">
              <div className="h-1.5 bg-linear-to-r from-primary via-orange-500 to-amber-400 w-full" />
              <CardHeader className="pb-4 border-b border-slate-100/50">
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="icon" onClick={goToPrevMonth} className="rounded-xl hover:bg-primary/5 text-primary"><ChevronLeft className="h-5 w-5" /></Button>
                  <div className="text-center">
                    <CardTitle className="text-2xl font-black capitalize text-slate-800 tracking-tight">{currentMonthName}</CardTitle>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Aylık Planlama Görünümü</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={goToNextMonth} className="rounded-xl hover:bg-primary/5 text-primary"><ChevronRight className="h-5 w-5" /></Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-7 gap-3">
                    {DAY_NAMES.map((day) => <div key={day} className="text-center font-black text-[10px] uppercase tracking-[0.2em] py-3 text-slate-400 bg-slate-50/50 rounded-xl border border-slate-100/50">{day}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-3">
                    {monthDays.map((dayDate, index) => {
                      const isCurrentMonth = dayDate.getMonth() === currentMonth.getMonth();
                      const dayDateStr = dayDate.toISOString();
                      
                      // Find week using robust date comparison
                      const week = season.weeks.find(w => { 
                        const ws = new Date(w.startDate); 
                        const we = new Date(w.endDate);
                        const d = new Date(dayDate);
                        // Normalize to midnight for range check
                        const dTime = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
                        const wsTime = new Date(ws.getFullYear(), ws.getMonth(), ws.getDate()).getTime();
                        const weTime = new Date(we.getFullYear(), we.getMonth(), we.getDate()).getTime();
                        return dTime >= wsTime && dTime <= weTime;
                      });

                      // Find day plans across all weeks for this specific date
                      const dayPlans = season.weeks.flatMap(w => w.days).filter(d => {
                        const dDate = new Date(d.date);
                        return dDate.getFullYear() === dayDate.getFullYear() &&
                               dDate.getMonth() === dayDate.getMonth() &&
                               dDate.getDate() === dayDate.getDate();
                      });

                      const dayMatches = season.matches.filter(m => {
                        const mDate = new Date(m.date);
                        return mDate.getFullYear() === dayDate.getFullYear() &&
                               mDate.getMonth() === dayDate.getMonth() &&
                               mDate.getDate() === dayDate.getDate();
                      });

                      const filteredDayPlans = dayPlans.filter(plan => {
                        const matchesType = filters.types.length === 0 || 
                          filters.types.some(t => {
                            if (t === "TRAINING") return ["TRAINING", "TACTICAL", "RECOVERY"].includes(plan.type);
                            return t === plan.type;
                          });

                        const matchesSearch = filters.search === "" || 
                          (plan.title?.toLowerCase().includes(filters.search.toLowerCase())) ||
                          (plan.topic?.toLowerCase().includes(filters.search.toLowerCase())) ||
                          (plan.opponent?.toLowerCase().includes(filters.search.toLowerCase()));
                        
                        let matchesTeam = true;
                        const groupPlan = plan.trainingPlan?.group;
                        const isATeamPlan = !groupPlan || 
                                        groupPlan.category === 'A_TAKIM' || 
                                        groupPlan.name.toLowerCase().includes('a takım') || 
                                        groupPlan.name.toLowerCase().includes('a takim');

                        if (filters.teamFilter === 'A_TAKIM') {
                          matchesTeam = isATeamPlan;
                        } else if (filters.teamFilter === 'GROUPS') {
                          matchesTeam = !isATeamPlan;
                        }

                        return matchesType && matchesSearch && matchesTeam;
                      });

                      const filteredDayMatches = dayMatches.filter(match => {
                        const matchesType = filters.types.length === 0 || filters.types.includes("MATCH");
                        const matchesSearch = filters.search === "" || 
                          match.opponent.toLowerCase().includes(filters.search.toLowerCase()) ||
                          match.competition?.toLowerCase().includes(filters.search.toLowerCase());
                        
                        let matchesTeam = true;
                        if (filters.teamFilter === 'A_TAKIM') {
                          matchesTeam = !match.group || 
                                        match.group.category === 'A_TAKIM' || 
                                        match.group.name.toLowerCase().includes('a takım') ||
                                        match.group.name.toLowerCase().includes('a takim');
                        } else if (filters.teamFilter === 'GROUPS') {
                          const isATeamMatch = !match.group || 
                                          match.group.category === 'A_TAKIM' || 
                                          match.group.name.toLowerCase().includes('a takım') || 
                                          match.group.name.toLowerCase().includes('a takim');
                          matchesTeam = !isATeamMatch;
                        }

                        return matchesType && matchesSearch && matchesTeam;
                      });

                      const isSelected = selectedDay && 
                                        new Date(selectedDay.date).getFullYear() === dayDate.getFullYear() &&
                                        new Date(selectedDay.date).getMonth() === dayDate.getMonth() &&
                                        new Date(selectedDay.date).getDate() === dayDate.getDate();
                      
                      const isToday = new Date().toDateString() === dayDate.toDateString();
                      const dayOfWeek = dayDate.getDay() === 0 ? 7 : dayDate.getDay();
                      return (
                        <div 
                          key={index} 
                          className={`group relative rounded-2xl min-h-[150px] p-3 transition-all duration-300 border-2 
                            ${!isCurrentMonth 
                              ? 'bg-slate-50/10 border-slate-100 opacity-20 grayscale cursor-not-allowed' 
                              : 'bg-white/40 backdrop-blur-sm hover:bg-white border-transparent shadow-sm hover:shadow-xl hover:-translate-y-1'
                            } 
                            ${isSelected ? 'ring-2 ring-primary border-primary bg-white z-10' : ''} 
                            ${isToday ? 'ring-2 ring-orange-500/50 border-orange-100 bg-orange-50/30' : ''}`} 
                          onClick={() => isCurrentMonth && week && setSelectedDay(isSelected ? null : { weekId: week.id, dayOfWeek, date: dayDateStr })}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <span className={`flex items-center justify-center h-8 w-8 rounded-xl text-xs font-black transition-all
                              ${isToday 
                                ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110' 
                                : isCurrentMonth 
                                  ? 'text-slate-500 group-hover:text-primary group-hover:bg-primary/10' 
                                  : 'text-slate-300'
                              }`}
                            >
                              {dayDate.getDate()}
                            </span>
                            {isToday && (
                              <Badge variant="outline" className="text-[8px] font-black border-primary text-primary bg-primary/5 px-1 py-0 uppercase tracking-tighter">
                                Bugün
                              </Badge>
                            )}
                          </div>
                          
                          <div className="space-y-1.5 pb-8">
                            {filteredDayPlans.slice(0, 3).map((plan) => {
                              const Icon = DAY_TYPE_ICONS[plan.type];
                              return (
                                <div 
                                  key={plan.id} 
                                  className={`${DAY_TYPE_COLORS[plan.type]} border rounded-xl px-2 py-1.5 text-[10px] flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md font-bold ${plan.trainingPlan ? 'ring-1 ring-primary/20' : ''}`} 
                                  onClick={(e) => { e.stopPropagation(); setSelectedPlan(plan); setShowPlanDetailDialog(true); }}
                                >
                                  <Icon className="h-3.5 w-3.5 shrink-0" />
                                  <span className="truncate flex-1">
                                    {plan.type === "MATCH" ? (plan.opponent ? `Maç: ${plan.opponent}` : "Maç") : 
                                     plan.type === "GORUSME" ? plan.topic : 
                                     (plan.type === "TOPLANTI" ? plan.title : plan.title) || 
                                     DAY_TYPE_LABELS[plan.type]}
                                  </span>
                                  {plan.trainingPlan && <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
                                </div>
                              );
                            })}
                            {filteredDayPlans.length > 3 && (
                              <div className="text-[9px] font-black text-slate-400 text-center py-1 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                                +{filteredDayPlans.length - 3} Plan Daha
                              </div>
                            )}
                            
                            {/* Day Matches */}
                            {filteredDayMatches.length > 0 && (
                              <div className="space-y-1">
                                {filteredDayMatches.map((match) => (
                                  <div 
                                    key={match.id} 
                                    className="bg-slate-900 text-white rounded-xl px-2 py-1.5 text-[10px] flex items-center justify-between gap-2 shadow-lg group/match hover:bg-slate-800 transition-colors"
                                  >
                                    <div className="flex flex-col truncate">
                                      <div className="flex items-center gap-2 truncate">
                                        <Trophy className="h-3 w-3 shrink-0 text-orange-400" />
                                        <span className="truncate font-black uppercase tracking-tighter">{match.opponent}</span>
                                      </div>
                                    </div>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); deleteMatch(match.id); }} 
                                      className="opacity-0 group-hover/match:opacity-100 p-0.5 hover:bg-white/20 rounded transition-opacity"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {isCurrentMonth && week && (
                            <div className="absolute inset-x-2 bottom-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                              <Button 
                                size="sm" 
                                variant="secondary" 
                                className="flex-1 h-8 text-[9px] font-black rounded-xl bg-primary text-white hover:bg-orange-600 border-none shadow-lg shadow-primary/20" 
                                onClick={(e) => { e.stopPropagation(); setSelectedDay({ weekId: week.id, dayOfWeek, date: dayDateStr }); setShowTrainingPlanDialog(true); }}
                              >
                                <Plus className="h-3 w-3 mr-1" /> ANTRENMAN
                              </Button>
                              <Button 
                                size="icon" 
                                variant="secondary" 
                                className="h-8 w-8 rounded-xl bg-white text-slate-400 hover:text-primary border border-slate-100 shadow-sm" 
                                onClick={(e) => { e.stopPropagation(); openDayDialog(week.id, dayOfWeek, dayDateStr); }}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 border-none shadow-xl bg-white/60 backdrop-blur-md overflow-hidden group">
                <div className="h-1.5 bg-linear-to-r from-primary via-orange-500 to-amber-400 w-full" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-3 text-xl font-black">
                      <div className="p-2 bg-orange-100 rounded-xl text-orange-600">
                        <Trophy className="h-5 w-5" />
                      </div> 
                      Yaklaşan Maçlar
                    </CardTitle>
                    <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-11">
                      Önümüzdeki müsabaka takvimi
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs font-bold text-primary hover:bg-primary/5 rounded-lg">
                    Tümünü Gör
                  </Button>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredMatchesForCard.length > 0 ? filteredMatchesForCard.slice(0, 4).map((match) => (
                      <div 
                        key={match.id} 
                        className="flex items-center gap-4 p-4 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl hover:shadow-lg transition-all duration-300 group/match-card"
                      >
                        <div className={`flex flex-col items-center justify-center h-14 w-14 rounded-2xl font-black text-xs transition-all duration-300 
                          ${match.location === "HOME" 
                            ? "bg-green-50 text-green-600 group-hover/match-card:bg-green-600 group-hover/match-card:text-white" 
                            : "bg-orange-50 text-orange-600 group-hover/match-card:bg-orange-600 group-hover/match-card:text-white"
                          }`}
                        >
                          {match.location === "HOME" ? <Home className="h-6 w-6" /> : <Plane className="h-6 w-6" />}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <h4 className="font-black text-sm text-slate-900 truncate uppercase tracking-tighter">
                            {match.opponent}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="text-[10px] font-bold border-slate-200 text-slate-500 bg-white group-hover/match-card:bg-white/20">
                              {new Date(match.date).toLocaleDateString("tr-TR", { day: 'numeric', month: 'short' })}
                            </Badge>
                            {match.competition && (
                              <Badge className="text-[10px] font-bold bg-primary/10 text-primary border-none group-hover/match-card:bg-white/20 group-hover/match-card:text-white">
                                {match.competition}
                              </Badge>
                            )}
                          </div>
                          {match.group && (
                            <p className="text-[10px] font-bold text-slate-400 normal-case">
                              {match.group.name}
                            </p>
                          )}
                        </div>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover/match-card:opacity-100" 
                          onClick={() => deleteMatch(match.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )) : (
                      <div className="col-span-2 py-12 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 space-y-3">
                        <Trophy className="h-12 w-12 text-slate-200 mx-auto" />
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Henüz maç programı eklenmedi.</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="rounded-xl font-bold" 
                          onClick={() => setShowMatchDialog(true)}
                        >
                          <Plus className="h-3 w-3 mr-2" /> İlk Maçı Ekle
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl bg-linear-to-br from-primary via-orange-600 to-orange-700 text-white overflow-hidden flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl font-black flex items-center gap-3">
                    <BrainCircuit className="h-6 w-6" /> 
                    Sezon Analizi
                  </CardTitle>
                  <CardDescription className="text-white/70 font-medium text-xs">
                    AI Destekli Program Değerlendirmesi
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 flex-1">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-90">
                        <span>Antrenman Tamamlama</span>
                        <span className="bg-white/20 px-1.5 py-0.5 rounded-md">%65</span>
                      </div>
                      <div className="h-2.5 bg-white/20 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-white w-[65%] rounded-full shadow-[0_0_15px_rgba(255,255,255,0.6)]" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-90">
                        <span>Fiziksel Yük Dengesi</span>
                        <span className="bg-white/20 px-1.5 py-0.5 rounded-md">Optimal</span>
                      </div>
                      <div className="h-2.5 bg-white/20 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-amber-300 w-[80%] rounded-full shadow-[0_0_15px_rgba(252,211,77,0.4)]" />
                      </div>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-white/10 space-y-4">
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
                      <p className="text-xs font-bold leading-relaxed text-white/90">
                        Bu sezon planlanan antrenmanların yoğunluğu, maç takvimiyle uyumlu görünüyor. Önümüzdeki 2 hafta toparlanma evresine odaklanmanız önerilir.
                      </p>
                    </div>
                    <Button variant="secondary" className="w-full font-black text-[10px] uppercase tracking-wider h-12 bg-white text-primary hover:bg-slate-50 rounded-2xl shadow-lg shadow-black/10">
                      Detaylı Analiz Gör
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Plan Detail Dialog */}
      <Dialog open={showPlanDetailDialog && !!selectedPlan} onOpenChange={(open) => !open && setSelectedPlan(null)}>
        <DialogContent className="max-w-md bg-white/90 backdrop-blur-xl border-none shadow-2xl rounded-3xl p-0 overflow-hidden">
          {selectedPlan && (
            <>
              <div className={`h-2 w-full ${DAY_TYPE_COLORS[selectedPlan.type].split(' ')[0]}`} />
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl ${DAY_TYPE_COLORS[selectedPlan.type]}`}>
                      {(() => { const Icon = DAY_TYPE_ICONS[selectedPlan.type]; return <Icon className="h-5 w-5" />; })()}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 leading-tight">
                        {DAY_TYPE_LABELS[selectedPlan.type]}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Etkinlik Detayları
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {(selectedPlan.type === "MATCH" && selectedPlan.opponent) ? (
                    <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-1 block">Rakip Takım</Label>
                      <p className="font-black text-xl text-orange-700">{selectedPlan.opponent}</p>
                      {selectedPlan.competition && (
                        <Badge className="mt-2 bg-orange-200 text-orange-800 border-none font-bold">
                          {selectedPlan.competition}
                        </Badge>
                      )}
                    </div>
                  ) : (selectedPlan.title || selectedPlan.topic) && (
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">
                        {selectedPlan.type === "GORUSME" ? "Görüşme Konusu" : "Başlık"}
                      </Label>
                      <p className="font-bold text-slate-800">{selectedPlan.type === "GORUSME" ? selectedPlan.topic : selectedPlan.title}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {selectedPlan.location && (
                      <div className="col-span-2 flex items-center gap-3 text-sm font-bold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <MapPin className="h-4 w-4 text-primary" />
                        {selectedPlan.location}
                      </div>
                    )}
                    {selectedPlan.duration && (
                      <div className="flex items-center gap-3 text-sm font-bold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <Clock className="h-4 w-4 text-blue-500" />
                        {selectedPlan.duration} Dakika
                      </div>
                    )}
                    {(selectedPlan.intensity && !["TOPLANTI", "GORUSME"].includes(selectedPlan.type)) && (
                      <div className="flex items-center gap-3 text-sm font-bold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <Zap className="h-4 w-4 text-amber-500" />
                        Şiddet: {selectedPlan.intensity}/10
                      </div>
                    )}
                  </div>

                  {selectedPlan.notes && (
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notlar</Label>
                      <div className="text-sm font-medium text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100 italic leading-relaxed">
                        "{selectedPlan.notes}"
                      </div>
                    </div>
                  )}

                  {selectedPlan.trainingPlan && (
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bağlı Antrenman Planı</Label>
                      <div className="bg-linear-to-br from-primary/5 to-orange-500/10 border border-primary/20 rounded-2xl p-4 space-y-3 shadow-inner">
                        <div className="flex items-center gap-2">
                          <PlayCircle className="h-4 w-4 text-primary" />
                          <span className="font-black text-primary text-sm uppercase">{selectedPlan.trainingPlan.title}</span>
                        </div>
                        {selectedPlan.trainingPlan.drills?.length > 0 && (
                          <div className="space-y-1.5 pl-6 border-l-2 border-primary/20">
                            {selectedPlan.trainingPlan.drills.slice(0, 5).map((pd: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between text-xs font-bold text-slate-600">
                                <span className="truncate">{pd.drill.title}</span>
                                <span className="text-slate-400 ml-2">{pd.drill.durationMin}'</span>
                              </div>
                            ))}
                            {selectedPlan.trainingPlan.drills.length > 5 && (
                              <p className="text-[10px] font-black text-primary/60 pt-1">+{selectedPlan.trainingPlan.drills.length - 5} Drill Daha</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    {selectedPlan.completed ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-black px-3 py-1 rounded-full text-[10px] uppercase">
                        <CheckCircle2 className="h-3 w-3 mr-1.5" /> Tamamlandı
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none font-black px-3 py-1 rounded-full text-[10px] uppercase">
                        <Timer className="h-3 w-3 mr-1.5" /> Planlandı
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-2xl font-bold h-12 border-slate-200" 
                    onClick={() => { 
                      setShowPlanDetailDialog(false); 
                      const week = season?.weeks.find(w => w.days.some(d => d.id === selectedPlan.id)); 
                      const day = week?.days.find(d => d.id === selectedPlan.id); 
                      if (week && day) openDayDialog(week.id, day.dayOfWeek, day.date, selectedPlan); 
                      setSelectedPlan(null); 
                    }}
                  >
                    <Edit2 className="h-4 w-4 mr-2" /> Düzenle
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1 rounded-2xl font-black h-12 shadow-lg shadow-red-100" 
                    onClick={() => { 
                      deleteDay(selectedPlan.id); 
                      setShowPlanDetailDialog(false); 
                      setSelectedPlan(null); 
                    }}
                  >
                    <X className="h-4 w-4 mr-2" /> Sil
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Day Plan Edit/Create Dialog */}
      <Dialog open={showDayDialog} onOpenChange={setShowDayDialog}>
        <DialogContent className="max-w-md bg-white border-none shadow-2xl rounded-3xl p-0 overflow-hidden">
          <div className="h-1.5 bg-linear-to-r from-primary to-orange-400 w-full" />
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-slate-100 text-slate-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-slate-900">Gün Planı</DialogTitle>
                <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Plan detaylarını düzenle
                </CardDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="p-6 pt-4 space-y-5 max-h-[80vh] overflow-y-auto">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-xs font-black uppercase tracking-widest text-slate-500">Plan Tipi</Label>
                <Select value={dayFormData.type} onValueChange={(value: any) => setDayFormData({ ...dayFormData, type: value })}>
                  <SelectTrigger className="rounded-xl border-slate-200 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MATCH" className="font-bold text-slate-700">⚽ Maç</SelectItem>
                    <SelectItem value="TOPLANTI" className="font-bold text-slate-700">👥 Toplantı</SelectItem>
                    <SelectItem value="GORUSME" className="font-bold text-slate-700">💬 Görüşme</SelectItem>
                    <SelectItem value="TRAINING" className="font-bold text-slate-700">🏃 Antrenman</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {dayFormData.type === "MATCH" ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2">
                    <Label htmlFor="matchSelect" className="text-xs font-black uppercase tracking-widest text-slate-500">Mevcut Maçlardan Seç</Label>
                    <Select 
                      onValueChange={(value) => {
                        const selectedMatch = season?.matches.find(m => m.id === value);
                        if (selectedMatch) {
                          setDayFormData({
                            ...dayFormData,
                            opponent: selectedMatch.opponent,
                            location: selectedMatch.location === "HOME" ? "İç Saha" : selectedMatch.location === "AWAY" ? "Deplasman" : "Tarafsız Saha",
                            competition: selectedMatch.competition || "",
                            title: `Maç: ${selectedMatch.opponent}`
                          });
                        }
                      }}
                    >
                      <SelectTrigger className="rounded-xl border-slate-200 h-11">
                        <SelectValue placeholder="Bir maç seçin..." />
                      </SelectTrigger>
                      <SelectContent>
                        {season?.matches.map((m) => (
                          <SelectItem key={m.id} value={m.id} className="font-medium">
                            {m.opponent} ({new Date(m.date).toLocaleDateString('tr-TR')})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100" /></div>
                    <div className="relative flex justify-center text-[9px] uppercase font-black tracking-widest"><span className="bg-white px-3 text-slate-300">Veya Manuel Giriş</span></div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="opponent" className="text-xs font-black uppercase tracking-widest text-slate-500">Rakip Takım</Label>
                    <Input id="opponent" placeholder="örn: rakip kulüp adı" value={dayFormData.opponent} onChange={(e) => setDayFormData({ ...dayFormData, opponent: e.target.value })} className="rounded-xl border-slate-200 h-11" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-xs font-black uppercase tracking-widest text-slate-500">Saha / Konum</Label>
                      <Input id="location" placeholder="örn: İç Saha" value={dayFormData.location} onChange={(e) => setDayFormData({ ...dayFormData, location: e.target.value })} className="rounded-xl border-slate-200 h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="competition" className="text-xs font-black uppercase tracking-widest text-slate-500">Müsabaka</Label>
                      <Input id="competition" placeholder="örn: Lig" value={dayFormData.competition} onChange={(e) => setDayFormData({ ...dayFormData, competition: e.target.value })} className="rounded-xl border-slate-200 h-11" />
                    </div>
                  </div>
                </div>
              ) : dayFormData.type === "TOPLANTI" ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-slate-500">Toplantı Başlığı</Label>
                    <Input id="title" placeholder="örn: Veli Toplantısı" value={dayFormData.title} onChange={(e) => setDayFormData({ ...dayFormData, title: e.target.value })} className="rounded-xl border-slate-200 h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-xs font-black uppercase tracking-widest text-slate-500">Konum</Label>
                    <Input id="location" placeholder="örn: Kulüp Binası" value={dayFormData.location} onChange={(e) => setDayFormData({ ...dayFormData, location: e.target.value })} className="rounded-xl border-slate-200 h-11" />
                  </div>
                </div>
              ) : dayFormData.type === "GORUSME" ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2">
                    <Label htmlFor="topic" className="text-xs font-black uppercase tracking-widest text-slate-500">Görüşülen Kişi / Konu</Label>
                    <Input id="topic" placeholder="örn: Oyuncu Ailesi Görüşmesi" value={dayFormData.topic} onChange={(e) => setDayFormData({ ...dayFormData, topic: e.target.value })} className="rounded-xl border-slate-200 h-11" />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-slate-500">Başlık</Label>
                  <Input id="title" placeholder="örn: Sabah Antrenmanı" value={dayFormData.title} onChange={(e) => setDayFormData({ ...dayFormData, title: e.target.value })} className="rounded-xl border-slate-200 h-11" />
                </div>
              )}

              {dayFormData.type !== "REST" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-xs font-black uppercase tracking-widest text-slate-500">Süre (dk)</Label>
                    <Input id="duration" type="number" placeholder="90" value={dayFormData.duration} onChange={(e) => setDayFormData({ ...dayFormData, duration: e.target.value })} className="rounded-xl border-slate-200 h-11" />
                  </div>
                  {(!["TOPLANTI", "GORUSME"].includes(dayFormData.type)) && (
                    <div className="space-y-2">
                      <Label htmlFor="intensity" className="text-xs font-black uppercase tracking-widest text-slate-500">Şiddet (1-10)</Label>
                      <Input id="intensity" type="number" min="1" max="10" placeholder="7" value={dayFormData.intensity} onChange={(e) => setDayFormData({ ...dayFormData, intensity: e.target.value })} className="rounded-xl border-slate-200 h-11" />
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-xs font-black uppercase tracking-widest text-slate-500">Notlar</Label>
                <Textarea id="notes" placeholder="Ek notlar..." value={dayFormData.notes} onChange={(e) => setDayFormData({ ...dayFormData, notes: e.target.value })} className="rounded-xl border-slate-200 min-h-[100px] resize-none" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 rounded-2xl font-bold h-12 border-slate-200" onClick={() => setShowDayDialog(false)}>
                İptal
              </Button>
              <Button className="flex-1 rounded-2xl font-black h-12 bg-primary hover:bg-orange-600 shadow-lg shadow-primary/20" onClick={createOrUpdateDay}>
                Kaydet
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showTrainingPlanDialog} onOpenChange={setShowTrainingPlanDialog}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[95vh] overflow-y-auto bg-white border-none shadow-2xl rounded-3xl p-0">
          <div className="h-1.5 bg-linear-to-r from-primary to-orange-400 w-full" />
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-2xl font-black text-slate-800">Antrenman Planı Oluştur</DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-0">
            {selectedDay && (
              <TrainingPlanBuilder initialDate={selectedDay.date.slice(0, 10)} initialClubId={season.clubId || undefined} onSuccess={async (plan) => {
                try {
                  const token = (session as any)?.accessToken;
                  await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/seasons/weeks/${selectedDay.weekId}/days`, { 
                    dayOfWeek: selectedDay.dayOfWeek, 
                    date: selectedDay.date, 
                    type: "TRAINING", 
                    title: plan.title, 
                    trainingPlanId: plan.id, 
                    duration: plan.totalDuration,
                    notes: plan.notes
                  }, { headers: { Authorization: `Bearer ${token}` } });
                  setShowTrainingPlanDialog(false); fetchSeason();
                } catch (error) { console.error("Error linking training plan:", error); alert("Antrenman planı oluşturuldu ancak takvime eklenirken bir hata oluştu."); }
              }} onCancel={() => setShowTrainingPlanDialog(false)} />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showMatchDialog} onOpenChange={setShowMatchDialog}>
        <DialogContent className="max-w-md bg-white border-none shadow-2xl rounded-3xl p-0 overflow-hidden">
          <div className="h-1.5 bg-linear-to-r from-primary to-orange-400 w-full" />
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-100 rounded-2xl text-orange-600">
                <Trophy className="h-5 w-5" />
              </div>
              <DialogTitle className="text-2xl font-black text-slate-800">Maç Ekle</DialogTitle>
            </div>
          </DialogHeader>
          <div className="p-6 pt-4 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="matchDate" className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" /> Tarih & Saat
              </Label>
              <Input 
                id="matchDate" 
                type="datetime-local" 
                value={matchFormData.date} 
                onChange={(e) => setMatchFormData({ ...matchFormData, date: e.target.value })} 
                className="rounded-xl border-slate-200 h-11 focus:ring-primary/20 focus:border-primary" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="opponent" className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Swords className="h-3.5 w-3.5" /> Rakip Takım
              </Label>
              <Input 
                id="opponent" 
                placeholder="Rakip takım adını girin..." 
                value={matchFormData.opponent} 
                onChange={(e) => setMatchFormData({ ...matchFormData, opponent: e.target.value })} 
                className="rounded-xl border-slate-200 h-11 focus:ring-primary/20 focus:border-primary" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" /> Konum
                </Label>
                <Select value={matchFormData.location} onValueChange={(value) => setMatchFormData({ ...matchFormData, location: value })}>
                  <SelectTrigger className="rounded-xl border-slate-200 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOME">İç Saha</SelectItem>
                    <SelectItem value="AWAY">Deplasman</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="competition" className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Flag className="h-3.5 w-3.5" /> Müsabaka
                </Label>
                <Select value={matchFormData.competition} onValueChange={(value) => setMatchFormData({ ...matchFormData, competition: value })}>
                  <SelectTrigger className="rounded-xl border-slate-200 h-11">
                    <SelectValue placeholder="Seçin..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lig">Lig</SelectItem>
                    <SelectItem value="Kupa">Kupa</SelectItem>
                    <SelectItem value="Hazırlık">Hazırlık</SelectItem>
                    <SelectItem value="Turnuva">Turnuva</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="groupId" className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Users className="h-3.5 w-3.5" /> İlgili Takım / Yaş Grubu
              </Label>
              <Select value={matchFormData.groupId} onValueChange={(value) => setMatchFormData({ ...matchFormData, groupId: value })}>
                <SelectTrigger className="rounded-xl border-slate-200 h-11 focus:ring-primary/20 focus:border-primary">
                  <SelectValue placeholder="Takım seçin..." />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name} {group.category === 'A_TAKIM' ? '(A Takım)' : `(${group.ageGroup})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1 rounded-2xl font-bold h-12 border-slate-200" onClick={() => setShowMatchDialog(false)}>
                İptal
              </Button>
              <Button className="flex-1 rounded-2xl font-black h-12 bg-primary hover:bg-orange-700 shadow-lg shadow-primary/20" onClick={createMatch}>
                Maçı Kaydet
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
