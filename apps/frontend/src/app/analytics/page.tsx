"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { ErrorBoundary } from "@/components/error-boundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { 
  BarChart3, 
  Loader2, 
  LineChart as LineChartIcon, 
  Activity, 
  Users, 
  Dumbbell, 
  Calendar, 
  TrendingUp,
  User,
  Sword,
  Target,
  FileText,
  Video,
  ChevronRight,
  PieChart,
  LayoutDashboard,
  Search,
  Filter,
  Zap,
  PlayCircle,
  Edit2,
  Eye,
  X,
  Trash2,
  Plus,
  Clock,
  Download,
  Brain,
  Shield,
  Heart,
  Award,
  TrendingDown,
  ChevronLeft,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("PLAYER");
  const token = (session as any)?.accessToken as string | undefined;
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalSessions: 0, avgAttendance: 0, totalDrills: 0 });
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [sessionsData, setSessionsData] = useState<any[]>([]);
  
  // New Analytics Data States
  const [performances, setPerformances] = useState<any[]>([]);
  const [videoAnalyses, setVideoAnalyses] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [teamPerformances, setTeamPerformances] = useState<any[]>([]);
  const [scoutingReports, setScoutingReports] = useState<any[]>([]);
  const [matchAnalyses, setMatchAnalyses] = useState<any[]>([]);

  // Dialog States
  const [showPlayerDialog, setShowPlayerDialog] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showMatchAnalysisDialog, setShowMatchAnalysisDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const tabs = [
    { id: "PLAYER", label: "Futbolcu Analizi", icon: User },
    { id: "OPPONENT", label: "Rakip Analizi", icon: Sword },
    { id: "TEAM", label: "Takım Analizi", icon: Users },
    { id: "MATCH", label: "Maç Analizi", icon: Target },
    { id: "TRAINING", label: "Antrenman Analizi", icon: Dumbbell },
    { id: "PHYSICAL", label: "Fiziksel & Performans", icon: Activity },
    { id: "VIDEO", label: "Video Analiz", icon: Video },
    { id: "REPORTS", label: "Raporlar", icon: FileText },
  ];

  React.useEffect(() => {
    if (!token) return;
    fetchInitialData();
  }, [token]);

  const fetchInitialData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch Training Plans
      try {
        const plansRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/training-plans`, { headers });
        if (plansRes.ok) {
          const plans = await plansRes.json();
          const totalSessions = plans.length;
          const totalAttendance = plans.reduce((sum: number, p: any) => sum + (p.attendance?.filter((a: any) => a.status === "PRESENT").length ?? 0), 0);
          const avgAttendance = totalSessions > 0 ? Math.round(totalAttendance / totalSessions) : 0;
          setStats(prev => ({ ...prev, totalSessions, avgAttendance }));

          const attendanceTrend = plans.filter((p: any) => p.date).map((p: any) => ({
            date: new Date(p.date).toLocaleDateString(),
            present: p.attendance?.filter((a: any) => a.status === "PRESENT").length ?? 0,
            absent: p.attendance?.filter((a: any) => a.status === "ABSENT").length ?? 0,
          })).slice(0, 10);
          setAttendanceData(attendanceTrend);
        }
      } catch (e) { console.error("Error fetching plans:", e); }

      // Fetch Drills
      try {
        const drillsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/drills`, { headers });
        if (drillsRes.ok) {
          const drills = await drillsRes.json();
          setStats(prev => ({ ...prev, totalDrills: drills.length }));
        }
      } catch (e) { console.error("Error fetching drills:", e); }

      // Fetch Players
      try {
        const usersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/players`, { headers });
        if (usersRes.ok) {
          setPlayers(await usersRes.json());
        }
      } catch (e) { console.error("Error fetching players:", e); }

      // Fetch Groups
      try {
        const groupsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups`, { headers });
        if (groupsRes.ok) {
          setGroups(await groupsRes.json());
        }
      } catch (e) { console.error("Error fetching groups:", e); }

      // Fetch Analytics Data
      await fetchAnalyticsData();
    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalyticsData = async () => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    try {
      // Player Performance
      try {
        const perfRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/player-performance`, { headers });
        if (perfRes.ok) {
          const data = await perfRes.json();
          setPerformances(Array.isArray(data) ? data : []);
        }
      } catch (e) { console.error("Error fetching performances:", e); }

      // Video Analysis
      try {
        const videoRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/video-analysis`, { headers });
        if (videoRes.ok) setVideoAnalyses(await videoRes.json());
      } catch (e) { console.error("Error fetching videos:", e); }

      // Reports
      try {
        const reportsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/reports`, { headers });
        if (reportsRes.ok) setReports(await reportsRes.json());
      } catch (e) { console.error("Error fetching reports:", e); }

      // Matches
      try {
        const seasonsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/seasons`, { headers });
        if (seasonsRes.ok) {
          const seasons = await seasonsRes.json();
          const matchArrays = await Promise.all(seasons.map((s: any) => 
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/seasons/${s.id}/matches`, { headers }).then(r => r.ok ? r.json() : [])
          ));
          setMatches(matchArrays.flat());
        }
      } catch (e) { console.error("Error fetching matches:", e); }

      // Team Performance
      try {
        const teamRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/team-performance`, { headers });
        if (teamRes.ok) setTeamPerformances(await teamRes.json());
      } catch (e) { console.error("Error fetching team performance:", e); }

      // Scouting Reports
      try {
        const scoutRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/scouting-reports`, { headers });
        if (scoutRes.ok) setScoutingReports(await scoutRes.json());
      } catch (e) { console.error("Error fetching scout reports:", e); }

      // Match Analysis
      try {
        const matchAnalysisRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/match-analysis`, { headers });
        if (matchAnalysisRes.ok) setMatchAnalyses(await matchAnalysisRes.json());
      } catch (e) { console.error("Error fetching match analyses:", e); }

    } catch (error) {
      console.error("Error in fetchAnalyticsData:", error);
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 lg:ml-64">
          <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="mt-[57px] flex-1 flex flex-col overflow-hidden">
            <div className="flex h-full">
              {/* Secondary Navigation */}
              <aside className="w-80 border-r bg-background p-6 hidden xl:block">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 px-2">Analiz Merkezi</h2>
                    <div className="space-y-1">
                      {tabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2 rounded-md transition-all text-sm group",
                            activeTab === tab.id 
                              ? "bg-muted text-foreground font-semibold border border-muted" 
                              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                          )}
                        >
                          <tab.icon className={cn(
                            "h-4 w-4 transition-all",
                            activeTab === tab.id ? "text-primary" : "text-muted-foreground"
                          )} />
                          <span className="flex-1 text-left">{tab.label}</span>
                          {activeTab === tab.id && <ChevronRight className="h-3 w-3 opacity-50" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Card className="rounded-md shadow-sm border border-muted bg-muted/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-[10px] font-semibold text-primary uppercase tracking-widest">Hızlı İpucu</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground leading-relaxed">Filtreleme seçeneklerini kullanarak spesifik tarih aralıklarına odaklanabilirsiniz.</p>
                    </CardContent>
                  </Card>
                </div>
              </aside>

              {/* Main Content Area */}
              <div className="flex-1 overflow-auto">
                <div className="p-8 lg:p-10 max-w-[1600px] mx-auto space-y-8">
                  {/* Header Area */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-muted pb-6">
                    <div>
                      <h1 className="text-xl font-bold tracking-tight text-foreground">
                        {tabs.find(t => t.id === activeTab)?.label}
                      </h1>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activeTab === "PLAYER" && "Bireysel oyuncu istatistiklerini ve teknik kapasite ölçümlerini takip edin."}
                        {activeTab === "OPPONENT" && "Rakip takımların taktiksel dizilişlerini ve anahtar oyuncularını analiz edin."}
                        {activeTab === "TEAM" && "Takımın genel pas yüzdesi ve kolektif verilerini inceleyin."}
                        {activeTab === "MATCH" && "Oynanan maçlardaki gol beklentisi ve aksiyonları görüntüleyin."}
                        {activeTab === "TRAINING" && "Antrenman katılım oranları ve drill bazlı performansları analiz edin."}
                        {activeTab === "PHYSICAL" && "Fiziksel verileri ve kondisyon durumlarını yönetin."}
                        {activeTab === "VIDEO" && "Kritik pozisyonları video üzerinden detaylı analiz edin."}
                        {activeTab === "REPORTS" && "Özelleştirilmiş performans raporları oluşturun ve karşılaştırın."}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="h-8 text-xs font-semibold rounded-md shadow-sm">
                        <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" /> 
                        Filtrele
                      </Button>
                      <Button size="sm" className="h-8 text-xs font-semibold rounded-md shadow-sm">
                        <FileText className="h-3.5 w-3.5 mr-1.5" /> 
                        Dışa Aktar
                      </Button>
                    </div>
                  </div>

                  {/* Render Active Module */}
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                      <div className="relative">
                        <Loader2 className="h-10 w-10 text-primary animate-spin" />
                      </div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Veriler Analiz Ediliyor...</p>
                    </div>
                  ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                      {activeTab === "PLAYER" && <PlayerAnalysisModule performances={performances} players={players} groups={groups} onRefresh={fetchAnalyticsData} token={token} />}
                      {activeTab === "OPPONENT" && <OpponentAnalysisModule reports={scoutingReports} onRefresh={fetchAnalyticsData} token={token} />}
                      {activeTab === "TEAM" && <TeamAnalysisModule performances={teamPerformances} onRefresh={fetchAnalyticsData} token={token} />}
                      {activeTab === "MATCH" && <MatchAnalysisModule analyses={matchAnalyses} matches={matches} onRefresh={fetchAnalyticsData} token={token} />}
                      {activeTab === "TRAINING" && <TrainingAnalysisModule attendanceData={attendanceData} sessionsData={sessionsData} stats={stats} />}
                      {activeTab === "PHYSICAL" && <PhysicalAnalysisModule />}
                      {activeTab === "VIDEO" && <VideoAnalysisModule videoAnalyses={videoAnalyses} onRefresh={fetchAnalyticsData} token={token} />}
                      {activeTab === "REPORTS" && <ReportsModule reports={reports} onRefresh={fetchAnalyticsData} token={token} />}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}

function PlayerAnalysisModule({ performances, players, groups, onRefresh, token }: any) {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedPerf, setSelectedPerf] = useState<any>(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [activeDialogTab, setActiveDialogTab] = useState("CORE");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [groupPlayers, setGroupPlayers] = useState<any[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<"INTERNAL" | "EXTERNAL">("INTERNAL");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [filterAnalysisType, setFilterAnalysisType] = useState<"ALL" | "INTERNAL" | "EXTERNAL">("ALL");
  const [filterGroupId, setFilterGroupId] = useState<string>("ALL");

  React.useEffect(() => {
    if (selectedGroupId && analysisMode === "INTERNAL") {
      fetchGroupPlayers(selectedGroupId);
    } else {
      setGroupPlayers([]);
    }
  }, [selectedGroupId, analysisMode]);

  const fetchGroupPlayers = async (groupId: string) => {
    setLoadingPlayers(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups/${groupId}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const members = await res.json();
        // Members typically come back as an array of objects with a user property
        setGroupPlayers(members.map((m: any) => m.user).filter((u: any) => u.role === 'PLAYER'));
      }
    } catch (error) {
      console.error("Error fetching group players:", error);
    } finally {
      setLoadingPlayers(false);
    }
  };
  
  const initialFormData = {
    playerId: "",
    externalPlayerName: "",
    externalPlayerTeam: "",
    externalPlayerPosition: "",
    analysisType: "INTERNAL",
    date: new Date().toISOString().split('T')[0],
    speed: 50,
    technique: 50,
    endurance: 50,
    tactical: 50,
    form: 50,
    rating: 5.0,
    notes: "",
    physicalStats: { sprint: 50, firstStep: 50, agility: 50, power: 50, balance: 50, flexibility: 50, injuryRisk: "LOW", matchContinuity: 50 },
    technicalStats: { ballControl: 50, shortPass: 50, longPass: 50, passQuality: 50, shot: 50, finishing: 50, weakFoot: 3, dribbling: 50, ballSpeed: 50, cross: 50, header: 50 },
    tacticalStats: { positioning: 50, marking: 50, pressing: 50, reading: 50, decision: 50, transition: 50, discipline: 50, attackingRun: 50, setPiece: 50, formationAdapt: 50 },
    mentalStats: { concentration: 50, confidence: 50, motivation: 50, discipline: 50, reaction: 50, pressure: 50, leadership: 50, teamwork: 50, responsibility: 50 },
    matchImpactStats: { impact: 50, contribution: 50, lostBalls: 0, wonDuels: 0, keyPasses: 0, goalAssist: 0, defense: 50, pressSuccess: 50 },
    formConsistency: { currentForm: 50, stability: 50, trainingPerf: 50, sync: 50 },
    roleAnalysis: { mainPosition: "", roles: [], roleSuitability: 50 },
    developmentPotential: { currentLevel: 50, potential: 50, growthSpeed: 50, areasToImprove: "", suggestions: "" },
    healthStats: { injuryHistory: "", loadStatus: "NORMAL", restNeed: false, intensityEndurance: 50 },
    summaryDetails: { aTeamSuitability: "DEVELOPMENT", scoutNotes: "", coachComment: "" }
  };

  const [formData, setFormData] = useState<any>(initialFormData);

  const filteredPerformances = performances.filter((p: any) => {
    // Top toggle (analysisMode) filter
    const matchesMode = analysisMode === "INTERNAL" 
      ? (p.analysisType === "INTERNAL" || !p.analysisType)
      : (p.analysisType === "EXTERNAL");
    
    // Detailed Table Filters
    const playerName = p.analysisType === "EXTERNAL" ? (p.externalPlayerName || "") : (p.player?.name || "");
    const matchesSearch = playerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const performanceDate = new Date(p.date);
    const matchesDateStart = !dateStart || performanceDate >= new Date(dateStart);
    const matchesDateEnd = !dateEnd || performanceDate <= new Date(dateEnd);
    
    // Dropdown filter (filterAnalysisType) should only apply if not "ALL"
    // and it should probably be synced with analysisMode or removed to avoid conflict.
    // We'll keep it but ensure it doesn't break the top level toggle logic.
    const matchesType = filterAnalysisType === "ALL" || 
                       (filterAnalysisType === "INTERNAL" && (p.analysisType === "INTERNAL" || !p.analysisType)) ||
                       (filterAnalysisType === "EXTERNAL" && p.analysisType === "EXTERNAL");

    const matchesGroup = filterGroupId === "ALL" || 
                        (p.analysisType === "INTERNAL" && p.player?.groups?.some((gm: any) => gm.groupId === filterGroupId));

    return matchesMode && matchesSearch && matchesDateStart && matchesDateEnd && matchesType && matchesGroup;
  });

  const handleSave = async () => {
    // Basic Validation
    if (analysisMode === "INTERNAL") {
      if (!formData.playerId) {
        alert("Lütfen bir futbolcu seçin.");
        return;
      }
    } else {
      if (!formData.externalPlayerName || !formData.externalPlayerTeam) {
        alert("Lütfen oyuncu adı ve takım bilgisini doldurun.");
        return;
      }
    }

    if (!formData.date) {
      alert("Lütfen bir tarih seçin.");
      return;
    }

    if (formData.rating < 0 || formData.rating > 10) {
      alert("Genel puan 0 ile 10 arasında olmalıdır.");
      return;
    }

    const url = `${process.env.NEXT_PUBLIC_API_URL}/analytics/player-performance${selectedPerf ? `/${selectedPerf.id}` : ""}`;
    const method = selectedPerf ? "PUT" : "POST";
    
    // Prepare data based on analysis mode
    const { player, createdAt, updatedAt, id, ...restOfFormData } = formData as any;
    const dataToSave = {
      ...restOfFormData,
      analysisType: analysisMode,
      ...(analysisMode === "EXTERNAL" ? { playerId: null } : { playerId: formData.playerId }),
      date: new Date(formData.date).toISOString()
    };
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(dataToSave)
      });
      if (res.ok) {
        setShowDialog(false);
        onRefresh();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Kayıt sırasında bir hata oluştu: ${errorData.message || res.statusText}`);
      }
    } catch (error) {
      console.error("Error saving performance:", error);
      alert("Sunucu bağlantısında bir hata oluştu.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu analizi silmek istediğinize emin misiniz?")) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/player-performance/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      onRefresh();
    } catch (error) {
      console.error("Error deleting performance:", error);
    }
  };

  const updateNestedStat = (category: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            {analysisMode === "INTERNAL" ? "Kapsamlı Oyuncu Analizi" : "Scout Raporları"}
          </h3>
          <p className="text-xs font-medium text-slate-500 mt-1">Oyuncu bazlı performans ve gelişim verileri</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex border border-slate-200 rounded-lg p-1 bg-slate-50">
            <button
              onClick={() => {
                setAnalysisMode("INTERNAL");
                setSelectedPerf(null);
                setFormData(initialFormData);
                setActiveDialogTab("CORE");
                setSelectedGroupId("");
              }}
              className={cn(
                "px-4 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all",
                analysisMode === "INTERNAL"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              İç Analiz
            </button>
            <button
              onClick={() => {
                setAnalysisMode("EXTERNAL");
                setSelectedPerf(null);
                setFormData(initialFormData);
                setActiveDialogTab("CORE");
                setSelectedGroupId("");
              }}
              className={cn(
                "px-4 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all",
                analysisMode === "EXTERNAL"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              Scout Raporu
            </button>
          </div>
          <Button onClick={() => { 
            setSelectedPerf(null); 
            setViewOnly(false);
            setFormData(initialFormData); 
            setActiveDialogTab("CORE");
            setSelectedGroupId("");
            setGroupPlayers([]);
            setShowDialog(true); 
          }} size="sm" className="h-9 rounded-lg shadow-sm text-xs font-bold px-4">
            <Plus className="h-4 w-4 mr-2" /> Yeni Analiz
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredPerformances.length > 0 ? filteredPerformances.slice(0, 8).map((perf: any, i: number) => (
          <Card key={i} className="rounded-xl shadow-sm border border-slate-200 bg-white group relative overflow-hidden transition-all hover:border-slate-300">
            <CardHeader className="p-6 pb-2">
              <div className="flex justify-between items-start">
                <Badge variant="outline" className="text-slate-500 border-slate-200 bg-slate-50 text-[9px] font-bold tracking-wider uppercase px-2 h-5">%{perf.form} Form</Badge>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full" onClick={() => { 
                    setSelectedPerf(perf); 
                    setViewOnly(true);
                    setAnalysisMode(perf.analysisType || "INTERNAL");
                    if (perf.analysisType === "INTERNAL" && perf.player?.groups && perf.player.groups.length > 0) {
                      setSelectedGroupId(perf.player.groups[0].groupId);
                    }
                    setFormData({
                      ...initialFormData,
                      ...perf,
                      date: new Date(perf.date).toISOString().split('T')[0],
                      physicalStats: perf.physicalStats || initialFormData.physicalStats,
                      technicalStats: perf.technicalStats || initialFormData.technicalStats,
                      tacticalStats: perf.tacticalStats || initialFormData.tacticalStats,
                      mentalStats: perf.mentalStats || initialFormData.mentalStats,
                      matchImpactStats: perf.matchImpactStats || initialFormData.matchImpactStats,
                      formConsistency: perf.formConsistency || initialFormData.formConsistency,
                      roleAnalysis: perf.roleAnalysis || initialFormData.roleAnalysis,
                      developmentPotential: perf.developmentPotential || initialFormData.developmentPotential,
                      healthStats: perf.healthStats || initialFormData.healthStats,
                      summaryDetails: perf.summaryDetails || initialFormData.summaryDetails,
                    }); 
                    setActiveDialogTab("CORE");
                    setShowDialog(true); 
                  }}><Eye className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full" onClick={() => { 
                    setSelectedPerf(perf); 
                    setViewOnly(false);
                    setAnalysisMode(perf.analysisType || "INTERNAL");
                    if (perf.analysisType === "INTERNAL" && perf.player?.groups && perf.player.groups.length > 0) {
                      setSelectedGroupId(perf.player.groups[0].groupId);
                    }
                    setFormData({
                      ...initialFormData,
                      ...perf,
                      date: new Date(perf.date).toISOString().split('T')[0],
                      physicalStats: perf.physicalStats || initialFormData.physicalStats,
                      technicalStats: perf.technicalStats || initialFormData.technicalStats,
                      tacticalStats: perf.tacticalStats || initialFormData.tacticalStats,
                      mentalStats: perf.mentalStats || initialFormData.mentalStats,
                      matchImpactStats: perf.matchImpactStats || initialFormData.matchImpactStats,
                      formConsistency: perf.formConsistency || initialFormData.formConsistency,
                      roleAnalysis: perf.roleAnalysis || initialFormData.roleAnalysis,
                      developmentPotential: perf.developmentPotential || initialFormData.developmentPotential,
                      healthStats: perf.healthStats || initialFormData.healthStats,
                      summaryDetails: perf.summaryDetails || initialFormData.summaryDetails,
                    }); 
                    setActiveDialogTab("CORE");
                    setShowDialog(true); 
                  }}><Edit2 className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full" onClick={() => handleDelete(perf.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="mt-4">
                <CardTitle className="text-base font-bold text-slate-900 tracking-tight">
                  {perf.analysisType === "EXTERNAL" ? perf.externalPlayerName : perf.player?.name}
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500 mt-1">
                  {perf.analysisType === "EXTERNAL" ? `${perf.externalPlayerTeam} • ${perf.externalPlayerPosition}` : perf.player?.position}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rating</p>
                  <p className="text-3xl font-bold tracking-tight text-primary">{perf.rating}</p>
                </div>
                <div className="text-right space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{new Date(perf.date).toLocaleDateString("tr-TR")}</p>
                  <div className="flex gap-1.5 justify-end">
                    <Zap className="h-3.5 w-3.5 text-slate-200" />
                    <Target className="h-3.5 w-3.5 text-slate-200" />
                    <Brain className="h-3.5 w-3.5 text-slate-200" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <Card className="col-span-full py-16 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center bg-slate-50/50">
            <div className="p-4 bg-white border border-slate-200 rounded-full shadow-sm mb-4">
              <User className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-900">
              {analysisMode === "INTERNAL" 
                ? "Henüz kapsamlı performans kaydı bulunmuyor." 
                : "Henüz scout raporu bulunmuyor."}
            </p>
            <p className="text-xs font-medium text-slate-500 mt-1">Yeni bir analiz ekleyerek başlayın</p>
          </Card>
        )}
      </div>

      <Card className="rounded-xl shadow-sm border border-slate-200 bg-white overflow-hidden">
        <CardHeader className="p-6 border-b border-slate-100 bg-slate-50/30 space-y-6">
          <div className="flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm">
                <Activity className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900 tracking-tight">Oyuncu Karşılaştırma & Gelişim Matrisi</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500">Tüm analiz kategorilerindeki verilerin karşılaştırmalı görünümü</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="h-9 rounded-lg shadow-sm text-xs font-bold border-slate-200" onClick={() => {
                setSelectedPerf(null); 
                setViewOnly(false);
                setFormData(initialFormData); 
                setActiveDialogTab("CORE");
                setSelectedGroupId("");
                setGroupPlayers([]);
                setShowDialog(true);
              }}>
                <Plus className="h-3.5 w-3.5 mr-2" /> Yeni Kayıt
              </Button>
              <Button variant="outline" size="sm" className="h-9 rounded-lg shadow-sm text-xs font-bold border-slate-200"><Download className="h-3.5 w-3.5 mr-2" /> Dışa Aktar</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Oyuncu ara..."
                className="pl-9 h-9 text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                className="h-9 text-xs"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
              />
              <span className="text-muted-foreground text-xs">-</span>
              <Input
                type="date"
                className="h-9 text-xs"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
              />
            </div>
            <Select value={filterAnalysisType} onValueChange={(val: any) => {
              setFilterAnalysisType(val);
              if (val !== "ALL") {
                setAnalysisMode(val);
              }
            }}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Analiz Tipi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tüm Analizler</SelectItem>
                <SelectItem value="INTERNAL">İç Analiz</SelectItem>
                <SelectItem value="EXTERNAL">Scout Raporu</SelectItem>
              </SelectContent>
            </Select>

            {analysisMode === "INTERNAL" && (
              <Select value={filterGroupId} onValueChange={setFilterGroupId}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Takım Filtrele" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tüm Takımlar</SelectItem>
                  {groups.map((g: any) => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                setSearchQuery("");
                setDateStart("");
                setDateEnd("");
                setFilterAnalysisType("ALL");
                setFilterGroupId("ALL");
              }}
            >
              Filtreleri Temizle
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-muted/30">
                  <th className="p-4 text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Oyuncu / Tarih</th>
                  <th className="p-4 text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Puan</th>
                  <th className="p-4 text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Fiziksel</th>
                  <th className="p-4 text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Teknik</th>
                  <th className="p-4 text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Taktik</th>
                  <th className="p-4 text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Mental</th>
                  <th className="p-4 text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Etki</th>
                  <th className="p-4 text-[10px] font-bold uppercase text-muted-foreground tracking-wider text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted/20">
                {filteredPerformances.map((p: any, i: number) => (
                  <tr key={i} className="hover:bg-muted/10 transition-colors group">
                    <td className="p-4">
                      <p className="text-sm font-bold">{p.analysisType === "EXTERNAL" ? p.externalPlayerName : p.player?.name}</p>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase">
                        {p.analysisType === "EXTERNAL" && `${p.externalPlayerTeam} • `}
                        {new Date(p.date).toLocaleDateString("tr-TR")}
                      </p>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary" className="font-bold text-primary bg-primary/10 hover:bg-primary/20">{p.rating}</Badge>
                    </td>
                    {[
                      { val: p.speed, icon: Activity },
                      { val: p.technique, icon: Target },
                      { val: p.tactical, icon: Shield },
                      { val: (p.mentalStats?.concentration || 50), icon: Brain },
                      { val: (p.matchImpactStats?.impact || 50), icon: Zap }
                    ].map((stat: any, idx: number) => (
                      <td key={idx} className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden w-16">
                            <div className="h-full bg-primary/80 rounded-full" style={{ width: `${stat.val}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground w-4 text-right">{stat.val}</span>
                        </div>
                      </td>
                    ))}
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => { 
                          setSelectedPerf(p); 
                          setViewOnly(true);
                          setAnalysisMode(p.analysisType || "INTERNAL");
                          if (p.analysisType === "INTERNAL" && p.player?.groups && p.player.groups.length > 0) {
                            setSelectedGroupId(p.player.groups[0].groupId);
                          }
                          setFormData({
                            ...initialFormData,
                            ...p,
                            date: new Date(p.date).toISOString().split('T')[0],
                            physicalStats: p.physicalStats || initialFormData.physicalStats,
                            technicalStats: p.technicalStats || initialFormData.technicalStats,
                            tacticalStats: p.tacticalStats || initialFormData.tacticalStats,
                            mentalStats: p.mentalStats || initialFormData.mentalStats,
                            matchImpactStats: p.matchImpactStats || initialFormData.matchImpactStats,
                            formConsistency: p.formConsistency || initialFormData.formConsistency,
                            roleAnalysis: p.roleAnalysis || initialFormData.roleAnalysis,
                            developmentPotential: p.developmentPotential || initialFormData.developmentPotential,
                            healthStats: p.healthStats || initialFormData.healthStats,
                            summaryDetails: p.summaryDetails || initialFormData.summaryDetails,
                          }); 
                          setActiveDialogTab("CORE");
                          setShowDialog(true); 
                        }}><Eye className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => { 
                          setSelectedPerf(p); 
                          setViewOnly(false);
                          setAnalysisMode(p.analysisType || "INTERNAL");
                          if (p.analysisType === "INTERNAL" && p.player?.groups && p.player.groups.length > 0) {
                            setSelectedGroupId(p.player.groups[0].groupId);
                          }
                          setFormData({
                            ...initialFormData,
                            ...p,
                            date: new Date(p.date).toISOString().split('T')[0],
                            physicalStats: p.physicalStats || initialFormData.physicalStats,
                            technicalStats: p.technicalStats || initialFormData.technicalStats,
                            tacticalStats: p.tacticalStats || initialFormData.tacticalStats,
                            mentalStats: p.mentalStats || initialFormData.mentalStats,
                            matchImpactStats: p.matchImpactStats || initialFormData.matchImpactStats,
                            formConsistency: p.formConsistency || initialFormData.formConsistency,
                            roleAnalysis: p.roleAnalysis || initialFormData.roleAnalysis,
                            developmentPotential: p.developmentPotential || initialFormData.developmentPotential,
                            healthStats: p.healthStats || initialFormData.healthStats,
                            summaryDetails: p.summaryDetails || initialFormData.summaryDetails,
                          }); 
                          setActiveDialogTab("CORE");
                          setShowDialog(true); 
                        }}><Edit2 className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-6xl p-0 overflow-hidden flex flex-col h-[90vh]">
          <DialogHeader className="p-6 border-b bg-muted/30 shrink-0 space-y-0">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <User className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <DialogTitle className="text-xl font-bold tracking-tight">
                  {viewOnly ? "Detaylı Analiz Görüntüle" : (selectedPerf ? "Detaylı Analiz Düzenle" : "Yeni Kapsamlı Oyuncu Analizi")}
                </DialogTitle>
                <DialogDescription className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">FUTBOLCU PERFORMANS MATRİSİ</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="px-6 py-2 border-b bg-muted/20 flex gap-1 shrink-0 overflow-x-auto no-scrollbar">
              {[
                { id: "CORE", label: "Genel", icon: LayoutDashboard },
                { id: "PHYSICAL", label: "Fiziksel", icon: Zap },
                { id: "TECHNICAL", label: "Teknik", icon: Target },
                { id: "TACTICAL", label: "Taktik", icon: Shield },
                { id: "MENTAL", label: "Mental", icon: Brain },
                { id: "IMPACT", label: "Maç Etkisi", icon: Activity },
                { id: "POTENTIAL", label: "Potansiyel", icon: Award }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveDialogTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-[11px] font-bold transition-all whitespace-nowrap",
                    activeDialogTab === tab.id 
                      ? "bg-background shadow-sm text-primary border" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              {activeDialogTab === "CORE" && (
                <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                  {analysisMode === "INTERNAL" ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-tight">Takım / Yaş Grubu</Label>
                        <Select value={selectedGroupId} onValueChange={(val) => {
                          setSelectedGroupId(val);
                          setFormData({ ...formData, playerId: "" }); 
                        }} disabled={viewOnly}>
                          <SelectTrigger className="h-9 bg-muted/30 border-none focus-visible:ring-primary">
                            <SelectValue placeholder="Takım Seçin..." />
                          </SelectTrigger>
                          <SelectContent>
                            {groups.map((g: any) => (
                              <SelectItem key={g.id} value={g.id} className="font-medium">
                                {g.name} ({g.ageGroup})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-tight">
                          {loadingPlayers && <Loader2 className="h-3 w-3 animate-spin inline mr-2" />}
                          Futbolcu Seçimi
                        </Label>
                        <Select value={formData.playerId} onValueChange={(val) => setFormData({ ...formData, playerId: val })} disabled={!selectedGroupId || loadingPlayers || viewOnly}>
                          <SelectTrigger className="h-9 bg-muted/30 border-none focus-visible:ring-primary">
                            <SelectValue placeholder={!selectedGroupId ? "Önce Takım Seçin" : "Oyuncu Seçin..."} />
                          </SelectTrigger>
                          <SelectContent>
                            {groupPlayers.map((p: any) => (
                              <SelectItem key={p.id} value={p.id} className="font-medium">
                                {p.name} ({p.position})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-tight">Analiz Tarihi</Label>
                        <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} disabled={viewOnly} className="h-9 bg-muted/30 border-none focus-visible:ring-primary" />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-tight">Oyuncu Adı</Label>
                        <Input
                          type="text"
                          value={formData.externalPlayerName}
                          onChange={(e) => setFormData({ ...formData, externalPlayerName: e.target.value })}
                          placeholder="Oyuncu adını girin..."
                          disabled={viewOnly}
                          className="h-9 bg-muted/30 border-none focus-visible:ring-primary"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-tight">Kulübü / Takımı</Label>
                        <Input
                          type="text"
                          value={formData.externalPlayerTeam}
                          onChange={(e) => setFormData({ ...formData, externalPlayerTeam: e.target.value })}
                          placeholder="Kulüp veya takım adını girin..."
                          disabled={viewOnly}
                          className="h-9 bg-muted/30 border-none focus-visible:ring-primary"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-tight">Pozisyon</Label>
                        <Select value={formData.externalPlayerPosition} onValueChange={(val) => setFormData({ ...formData, externalPlayerPosition: val })} disabled={viewOnly}>
                          <SelectTrigger className="h-9 bg-muted/30 border-none focus-visible:ring-primary">
                            <SelectValue placeholder="Pozisyon Seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="KALECI">Kaleci</SelectItem>
                            <SelectItem value="DEFANS">Defans</SelectItem>
                            <SelectItem value="ORTA_SAHA">Orta Saha</SelectItem>
                            <SelectItem value="FORVET">Forvet</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5 md:col-span-3">
                        <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-tight">Scout Analiz Tarihi</Label>
                        <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} disabled={viewOnly} className="h-9 bg-muted/30 border-none focus-visible:ring-primary" />
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {["speed", "technique", "endurance", "tactical", "form"].map((field) => (
                      <div key={field} className="space-y-2.5 p-4 bg-muted/30 rounded-lg border-none">
                        <div className="flex justify-between items-center">
                          <Label className="capitalize text-[11px] font-bold text-muted-foreground">
                            {field === "speed" ? "Hız" : field === "technique" ? "Teknik" : field === "endurance" ? "Dayanıklılık" : field === "tactical" ? "Taktik" : "Form"}
                          </Label>
                          <span className="font-bold text-sm text-primary">{formData[field]}</span>
                        </div>
                        <input 
                          type="range" min="0" max="100" 
                          className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                          value={formData[field]}
                          disabled={viewOnly}
                          onChange={(e) => setFormData({ ...formData, [field]: parseInt(e.target.value) })}
                        />
                      </div>
                    ))}
                    <div className="space-y-1.5 p-4 bg-primary/5 rounded-lg border-none">
                      <Label className="text-[11px] font-bold uppercase text-primary tracking-tight">Genel Puan (0-10)</Label>
                      <Input type="number" step="0.1" min="0" max="10" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })} disabled={viewOnly} className="bg-background border-none h-8 font-bold text-center text-primary" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-tight">{analysisMode === "EXTERNAL" ? "Scout Gözlemleri" : "Teknik Ekip Gözlem Özeti"}</Label>
                    <Textarea 
                      className="bg-muted/30 border-none focus-visible:ring-primary min-h-[100px] resize-none"
                      value={formData.notes}
                      disabled={viewOnly}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder={analysisMode === "EXTERNAL" ? "Scout raporunuz ve kritik gözlemlerinizi yazın..." : "Oyuncunun genel durumu ve kritik gözlemlerinizi yazın..."}
                    />
                  </div>
                </div>
              )}

              {activeDialogTab === "PHYSICAL" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                  {[
                    { cat: "physicalStats", field: "sprint", label: "Sprint Hızı" },
                    { cat: "physicalStats", field: "firstStep", label: "İlk Adım Çevikliği" },
                    { cat: "physicalStats", field: "agility", label: "Çabukluk / Patlayıcılık" },
                    { cat: "physicalStats", field: "power", label: "Fiziksel Güç" },
                    { cat: "physicalStats", field: "balance", label: "Denge & Vücut Kontrolü" },
                    { cat: "physicalStats", field: "flexibility", label: "Esneklik" },
                    { cat: "physicalStats", field: "matchContinuity", label: "Maç Devamlılığı (60dk+)" }
                  ].map(stat => (
                    <div key={stat.field} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium text-muted-foreground">{stat.label}</Label>
                        <span className="text-sm font-bold text-primary">{formData.physicalStats[stat.field]}</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" 
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                        value={formData.physicalStats[stat.field]}
                        disabled={viewOnly}
                        onChange={(e) => updateNestedStat(stat.cat, stat.field, parseInt(e.target.value))}
                      />
                    </div>
                  ))}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Sakatlık Riski</Label>
                    <div className="flex gap-2">
                      {["LOW", "MEDIUM", "HIGH"].map(risk => (
                        <button
                          key={risk}
                          onClick={() => updateNestedStat("physicalStats", "injuryRisk", risk)}
                          disabled={viewOnly}
                          className={cn(
                            "flex-1 py-2 rounded-lg text-[10px] font-bold tracking-tight transition-all",
                            formData.physicalStats.injuryRisk === risk 
                              ? (risk === "LOW" ? "bg-green-500 text-white" : risk === "MEDIUM" ? "bg-amber-500 text-white" : "bg-red-500 text-white")
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          )}
                        >
                          {risk === "LOW" ? "DÜŞÜK" : risk === "MEDIUM" ? "ORTA" : "YÜKSEK"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeDialogTab === "TECHNICAL" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                  {[
                    { cat: "technicalStats", field: "ballControl", label: "Top Kontrolü" },
                    { cat: "technicalStats", field: "shortPass", label: "Kısa Pas Kalitesi" },
                    { cat: "technicalStats", field: "longPass", label: "Uzun Pas / Diyagonal" },
                    { cat: "technicalStats", field: "shot", label: "Şut Şiddeti & İsabeti" },
                    { cat: "technicalStats", field: "finishing", label: "Bitiricilik / Son Vuruş" },
                    { cat: "technicalStats", field: "dribbling", label: "Dripling / Adam Eksiltme" },
                    { cat: "technicalStats", field: "ballSpeed", label: "Top Sürme Hızı" },
                    { cat: "technicalStats", field: "cross", label: "Orta Açma Kalitesi" },
                    { cat: "technicalStats", field: "header", label: "Hava Topu (Ofans/Defans)" }
                  ].map(stat => (
                    <div key={stat.field} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium text-muted-foreground">{stat.label}</Label>
                        <span className="text-sm font-bold text-primary">{formData.technicalStats[stat.field]}</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" 
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                        value={formData.technicalStats[stat.field]}
                        disabled={viewOnly}
                        onChange={(e) => updateNestedStat(stat.cat, stat.field, parseInt(e.target.value))}
                      />
                    </div>
                  ))}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Zayıf Ayak Kullanımı (1-5)</Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(val => (
                        <button
                          key={val}
                          onClick={() => updateNestedStat("technicalStats", "weakFoot", val)}
                          disabled={viewOnly}
                          className={cn(
                            "flex-1 h-9 rounded-lg font-bold transition-all",
                            formData.technicalStats.weakFoot === val ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                          )}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeDialogTab === "TACTICAL" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                  {[
                    { cat: "tacticalStats", field: "positioning", label: "Pozisyon Bilgisi" },
                    { cat: "tacticalStats", field: "marking", label: "Alan Kapatma / Markaj" },
                    { cat: "tacticalStats", field: "pressing", label: "Pres Zamanlaması" },
                    { cat: "tacticalStats", field: "reading", label: "Oyun Okuma" },
                    { cat: "tacticalStats", field: "decision", label: "Karar Verme Hızı" },
                    { cat: "tacticalStats", field: "transition", label: "Geçiş Oyununa Uyum" },
                    { cat: "tacticalStats", field: "attackingRun", label: "Hücumda Doğru Koşu" },
                    { cat: "tacticalStats", field: "setPiece", label: "Duran Top Katkısı" },
                    { cat: "tacticalStats", field: "formationAdapt", label: "Farklı Dizilişlere Uyum" }
                  ].map(stat => (
                    <div key={stat.field} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium text-muted-foreground">{stat.label}</Label>
                        <span className="text-sm font-bold text-primary">{formData.tacticalStats[stat.field]}</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" 
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                        value={formData.tacticalStats[stat.field]}
                        disabled={viewOnly}
                        onChange={(e) => updateNestedStat(stat.cat, stat.field, parseInt(e.target.value))}
                      />
                    </div>
                  ))}
                </div>
              )}

              {activeDialogTab === "MENTAL" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                  {[
                    { cat: "mentalStats", field: "concentration", label: "Konsantrasyon" },
                    { cat: "mentalStats", field: "confidence", label: "Özgüven" },
                    { cat: "mentalStats", field: "motivation", label: "Motivasyon" },
                    { cat: "mentalStats", field: "discipline", label: "Maç Disiplini" },
                    { cat: "mentalStats", field: "reaction", label: "Reaksiyon Hızı" },
                    { cat: "mentalStats", field: "pressure", label: "Baskı Altında Performans" },
                    { cat: "mentalStats", field: "leadership", label: "Liderlik / İletişim" },
                    { cat: "mentalStats", field: "teamwork", label: "Takım Uyumu" },
                    { cat: "mentalStats", field: "responsibility", label: "Sorumluluk Alma" }
                  ].map(stat => (
                    <div key={stat.field} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium text-muted-foreground">{stat.label}</Label>
                        <span className="text-sm font-bold text-primary">{formData.mentalStats[stat.field]}</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" 
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                        value={formData.mentalStats[stat.field]}
                        disabled={viewOnly}
                        onChange={(e) => updateNestedStat(stat.cat, stat.field, parseInt(e.target.value))}
                      />
                    </div>
                  ))}
                </div>
              )}

              {activeDialogTab === "IMPACT" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                  {[
                    { cat: "matchImpactStats", field: "impact", label: "Genel Maç Etkisi" },
                    { cat: "matchImpactStats", field: "contribution", label: "Topla Oyun Katkısı" },
                    { cat: "matchImpactStats", field: "defense", label: "Savunma Katkısı" },
                    { cat: "matchImpactStats", field: "pressSuccess", label: "Pres Başarısı" }
                  ].map(stat => (
                    <div key={stat.field} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium text-muted-foreground">{stat.label}</Label>
                        <span className="text-sm font-bold text-primary">{formData.matchImpactStats[stat.field]}</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" 
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                        value={formData.matchImpactStats[stat.field]}
                        disabled={viewOnly}
                        onChange={(e) => updateNestedStat(stat.cat, stat.field, parseInt(e.target.value))}
                      />
                    </div>
                  ))}
                  <div className="grid grid-cols-2 gap-4 col-span-2">
                    {[
                      { cat: "matchImpactStats", field: "lostBalls", label: "Top Kaybı" },
                      { cat: "matchImpactStats", field: "wonDuels", label: "Kazanılan İkili" },
                      { cat: "matchImpactStats", field: "keyPasses", label: "Anahtar Pas" },
                      { cat: "matchImpactStats", field: "goalAssist", label: "Gol/Asist Etki" }
                    ].map(stat => (
                      <div key={stat.field} className="space-y-1.5">
                        <Label className="text-[11px] font-bold uppercase text-muted-foreground">{stat.label}</Label>
                        <Input type="number" value={formData.matchImpactStats[stat.field]} onChange={(e) => updateNestedStat(stat.cat, stat.field, parseInt(e.target.value))} disabled={viewOnly} className="h-9 bg-muted/30 border-none font-bold" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeDialogTab === "POTENTIAL" && (
                <div className="space-y-8 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h4 className="text-sm font-bold uppercase tracking-tight text-primary flex items-center gap-2">
                        <Award className="h-4 w-4" /> Gelişim Endeksi
                      </h4>
                      {[
                        { cat: "developmentPotential", field: "currentLevel", label: "Mevcut Seviye" },
                        { cat: "developmentPotential", field: "potential", label: "Potansiyel Tavanı" },
                        { cat: "developmentPotential", field: "growthSpeed", label: "Gelişim Hızı" }
                      ].map(stat => (
                        <div key={stat.field} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm font-medium text-muted-foreground">{stat.label}</Label>
                            <span className="text-sm font-bold text-primary">{formData.developmentPotential[stat.field]}</span>
                          </div>
                          <input 
                            type="range" min="0" max="100" 
                            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                            value={formData.developmentPotential[stat.field]}
                            disabled={viewOnly}
                            onChange={(e) => updateNestedStat(stat.cat, stat.field, parseInt(e.target.value))}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="space-y-6">
                      <h4 className="text-sm font-bold uppercase tracking-tight text-blue-500 flex items-center gap-2">
                        <User className="h-4 w-4" /> Pozisyon & Rol
                      </h4>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-bold uppercase text-muted-foreground">Alternatif Pozisyonlar</Label>
                          <Input value={formData.roleAnalysis.alternativePositions} onChange={(e) => updateNestedStat("roleAnalysis", "alternativePositions", e.target.value)} disabled={viewOnly} className="h-9 bg-muted/30 border-none font-bold" placeholder="Örn: Kanat Bek, Ön Libero" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-bold uppercase text-muted-foreground">Oyun Rolü</Label>
                          <Input value={formData.roleAnalysis.roles} onChange={(e) => updateNestedStat("roleAnalysis", "roles", e.target.value)} disabled={viewOnly} className="h-9 bg-muted/30 border-none font-bold" placeholder="Örn: Box-to-box, Playmaker" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h4 className="text-sm font-bold uppercase tracking-tight text-amber-500 flex items-center gap-2">
                        <Shield className="h-4 w-4" /> A Takım Uygunluk
                      </h4>
                      <div className="flex flex-col gap-2">
                        {["READY", "ROTATION", "DEVELOPMENT", "TRANSFER"].map(status => (
                          <button
                            key={status}
                            onClick={() => updateNestedStat("summaryDetails", "aTeamSuitability", status)}
                            disabled={viewOnly}
                            className={cn(
                              "w-full py-3 rounded-lg font-bold text-xs tracking-tight transition-all text-left px-4 border",
                              formData.summaryDetails.aTeamSuitability === status 
                                ? "bg-amber-50 border-amber-200 text-amber-700 shadow-sm"
                                : "bg-card border-border text-muted-foreground hover:bg-muted/50"
                            )}
                          >
                            {status === "READY" ? "HAZIR (A TAKIM SEVİYESİ)" : status === "ROTATION" ? "ROTASYON OYUNCUSU" : status === "DEVELOPMENT" ? "GELİŞİM GEREKLİ" : "TRANSFER / KİRALIK TAVSİYESİ"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold uppercase text-muted-foreground">Geliştirilmesi Gereken Alanlar</Label>
                      <Textarea 
                        className="bg-muted/30 border-none min-h-[100px] resize-none focus-visible:ring-primary"
                        value={formData.developmentPotential.areasToImprove}
                        disabled={viewOnly}
                        onChange={(e) => updateNestedStat("developmentPotential", "areasToImprove", e.target.value)}
                        placeholder="Örn: Sol ayak tekniği, Hava topları..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold uppercase text-muted-foreground">Bireysel Antrenman Önerileri</Label>
                      <Textarea 
                        className="bg-muted/30 border-none min-h-[100px] resize-none focus-visible:ring-primary"
                        value={formData.developmentPotential.suggestions}
                        disabled={viewOnly}
                        onChange={(e) => updateNestedStat("developmentPotential", "suggestions", e.target.value)}
                        placeholder="Örn: Duvar çalışması, patlayıcı kuvvet..."
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-muted/30 border-t flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                {["CORE", "PHYSICAL", "TECHNICAL", "TACTICAL", "MENTAL", "IMPACT", "POTENTIAL"].map((tab) => (
                  <div 
                    key={tab}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full transition-all duration-300", 
                      activeDialogTab === tab ? "bg-primary w-4" : "bg-muted-foreground/30"
                    )} 
                  />
                ))}
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDialog(false)} 
                  className="px-6 h-10 rounded-lg font-bold text-muted-foreground hover:bg-background border-border"
                >
                  {viewOnly ? "Kapat" : "İptal"}
                </Button>
                {!viewOnly && (
                  <Button 
                    onClick={handleSave} 
                    className="px-8 h-10 rounded-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                  >
                    {selectedPerf ? "Güncelle" : "Analizi Tamamla"}
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
      </Dialog>
    </div>
  );
}

function OpponentAnalysisModule({ reports, onRefresh, token }: any) {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [formData, setFormData] = useState({
    opponent: "",
    formation: "",
    notes: "",
    strengths: "",
    weaknesses: ""
  });

  const handleSave = async () => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/analytics/scouting-reports${selectedReport ? `/${selectedReport.id}` : ""}`;
    const method = selectedReport ? "PUT" : "POST";
    
    try {
      const { id, createdAt, updatedAt, ...restOfData } = formData as any;
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          ...restOfData,
          strengths: typeof formData.strengths === 'string' ? formData.strengths.split(',').map(s => s.trim()).filter(Boolean) : formData.strengths,
          weaknesses: typeof formData.weaknesses === 'string' ? formData.weaknesses.split(',').map(w => w.trim()).filter(Boolean) : formData.weaknesses
        })
      });
      if (res.ok) {
        setShowDialog(false);
        onRefresh();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Kayıt sırasında bir hata oluştu: ${errorData.message || res.statusText}`);
      }
    } catch (error) {
      console.error("Error saving scouting report:", error);
      alert("Sunucu bağlantısında bir hata oluştu.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu analizi silmek istediğinize emin misiniz?")) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/scouting-reports/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      onRefresh();
    } catch (error) {
      console.error("Error deleting scouting report:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Rakip Gözlem Raporları</h3>
        <Button onClick={() => { 
          setSelectedReport(null); 
          setViewOnly(false);
          setFormData({ opponent: "", formation: "", notes: "", strengths: "", weaknesses: "" }); 
          setShowDialog(true); 
        }} size="sm" className="rounded-md shadow-sm h-8 text-[10px] font-bold uppercase tracking-wider">
          <Plus className="h-3 w-3 mr-1.5" /> Yeni Rapor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.length > 0 ? reports.map((report: any) => (
          <Card key={report.id} className="rounded-md shadow-sm border border-muted bg-background group relative">
            <CardHeader className="pb-3 border-b border-muted/30 mb-3 bg-muted/10">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-muted-foreground border-muted bg-background uppercase text-[9px] font-semibold tracking-wider">Rakip Analizi</Badge>
                    <span className="text-[10px] text-muted-foreground uppercase font-medium">{new Date(report.date).toLocaleDateString("tr-TR")}</span>
                  </div>
                  <CardTitle className="text-sm font-semibold tracking-tight uppercase">{report.opponent}</CardTitle>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => { 
                    setSelectedReport(report); 
                    setViewOnly(true);
                    setFormData({ opponent: report.opponent, formation: report.formation || "", notes: report.notes || "", strengths: report.strengths?.join(', ') || "", weaknesses: report.weaknesses?.join(', ') || "" }); 
                    setShowDialog(true); 
                  }}><Eye className="h-3 w-3" /></Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => { 
                    setSelectedReport(report); 
                    setViewOnly(false);
                    setFormData({ opponent: report.opponent, formation: report.formation || "", notes: report.notes || "", strengths: report.strengths?.join(', ') || "", weaknesses: report.weaknesses?.join(', ') || "" }); 
                    setShowDialog(true); 
                  }}><Edit2 className="h-3 w-3" /></Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(report.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="flex items-center justify-between border-b border-muted/30 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-md bg-muted border border-muted/50 flex items-center justify-center font-bold text-xs text-muted-foreground uppercase">{report.opponent.slice(0, 2)}</div>
                  <div>
                    <p className="text-[11px] font-semibold text-foreground uppercase">{report.opponent}</p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Scout Verisi</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-semibold text-muted-foreground uppercase">Diziliş</p>
                  <p className="text-xs font-bold text-primary">{report.formation || "---"}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Güçlü Yönler</h4>
                  <div className="flex flex-wrap gap-1">
                    {report.strengths?.length > 0 ? report.strengths.map((s: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-[9px] px-1.5 py-0 border-muted text-muted-foreground font-medium bg-muted/5">{s}</Badge>
                    )) : <span className="text-[9px] text-muted-foreground italic">Belirtilmedi</span>}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Zayıf Yönler</h4>
                  <div className="flex flex-wrap gap-1">
                    {report.weaknesses?.length > 0 ? report.weaknesses.map((w: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-[9px] px-1.5 py-0 border-muted text-muted-foreground font-medium bg-muted/5">{w}</Badge>
                    )) : <span className="text-[9px] text-muted-foreground italic">Belirtilmedi</span>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <Card className="col-span-2 py-12 border-dashed flex flex-col items-center justify-center text-center bg-muted/10">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Henüz rakip analizi raporu bulunmuyor.</p>
          </Card>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b bg-muted/30">
            <DialogTitle className="text-xl font-bold tracking-tight">
              {viewOnly ? "Analiz Görüntüle" : (selectedReport ? "Analizi Düzenle" : "Yeni Rakip Analizi")}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rakip Takım</Label>
                <Input value={formData.opponent} onChange={(e) => setFormData({ ...formData, opponent: e.target.value })} disabled={viewOnly} className="bg-muted/30 focus-visible:ring-primary" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Diziliş</Label>
                <Input value={formData.formation} onChange={(e) => setFormData({ ...formData, formation: e.target.value })} disabled={viewOnly} className="bg-muted/30 focus-visible:ring-primary" placeholder="örn: 4-3-3" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Güçlü Yönler (Virgülle ayırın)</Label>
              <Input value={formData.strengths} onChange={(e) => setFormData({ ...formData, strengths: e.target.value })} disabled={viewOnly} className="bg-muted/30 focus-visible:ring-primary" placeholder="Hızlı kanatlar, Duran toplar..." />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Zayıf Yönler (Virgülle ayırın)</Label>
              <Input value={formData.weaknesses} onChange={(e) => setFormData({ ...formData, weaknesses: e.target.value })} disabled={viewOnly} className="bg-muted/30 focus-visible:ring-primary" placeholder="Yavaş defans, Kondisyon..." />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notlar</Label>
              <Textarea 
                className="bg-muted/30 focus-visible:ring-primary min-h-[120px] resize-none"
                value={formData.notes}
                disabled={viewOnly}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Rakip hakkında genel gözlemler ve taktiksel detaylar..."
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowDialog(false)} className="flex-1">
                {viewOnly ? "Kapat" : "İptal"}
              </Button>
              {!viewOnly && (
                <Button onClick={handleSave} className="flex-1">Kaydet</Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TeamAnalysisModule({ performances, onRefresh, token }: any) {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedPerf, setSelectedPerf] = useState<any>(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [formData, setFormData] = useState({ 
    formation: "", 
    passAccuracy: 80, 
    possession: 50, 
    shotsOnTarget: 5, 
    goalsScored: 0, 
    goalsConceded: 0, 
    rating: 7.0, 
    notes: "",
    date: new Date().toISOString().split('T')[0]
  });

  const handleSave = async () => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/analytics/team-performance${selectedPerf ? `/${selectedPerf.id}` : ""}`;
    const method = selectedPerf ? "PUT" : "POST";
    
    try {
      const { id, createdAt, updatedAt, ...restOfData } = formData as any;
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          ...restOfData,
          date: new Date(formData.date).toISOString()
        })
      });
      if (res.ok) {
        setShowDialog(false);
        onRefresh();
      }
    } catch (error) {
      console.error("Error saving team performance:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu kaydı silmek istediğinize emin misiniz?")) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/team-performance/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      onRefresh();
    } catch (error) {
      console.error("Error deleting team performance:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Takım Performans Kayıtları</h3>
          <p className="text-xs font-medium text-slate-500 mt-1">Kolektif takım verileri ve taktiksel analizler</p>
        </div>
        <Button onClick={() => { 
          setSelectedPerf(null); 
          setViewOnly(false);
          setFormData({ formation: "", passAccuracy: 80, possession: 50, shotsOnTarget: 5, goalsScored: 0, goalsConceded: 0, rating: 7.0, notes: "", date: new Date().toISOString().split('T')[0] }); 
          setShowDialog(true); 
        }} size="sm" className="h-9 rounded-lg shadow-sm text-xs font-bold px-4">
          <Plus className="h-4 w-4 mr-2" /> Yeni Kayıt
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {performances.length > 0 ? performances.slice(0, 3).map((perf: any) => (
          <Card key={perf.id} className="rounded-xl shadow-sm border border-slate-200 bg-white group relative overflow-hidden transition-all hover:border-slate-300">
            <CardHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/30">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400">
                  <Users className="h-5 w-5" />
                </div>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-primary hover:bg-white rounded-full shadow-none" onClick={() => { 
                    setSelectedPerf(perf); 
                    setViewOnly(true);
                    setFormData({ ...perf, date: new Date(perf.date).toISOString().split('T')[0] }); 
                    setShowDialog(true); 
                  }}><Eye className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-primary hover:bg-white rounded-full shadow-none" onClick={() => { 
                    setSelectedPerf(perf); 
                    setViewOnly(false);
                    setFormData({ ...perf, date: new Date(perf.date).toISOString().split('T')[0] }); 
                    setShowDialog(true); 
                  }}><Edit2 className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-white rounded-full shadow-none" onClick={() => handleDelete(perf.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(perf.date).toLocaleDateString("tr-TR")}</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold tracking-tight text-slate-900">%{perf.possession}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Topla Oynama</span>
                </div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-tight">Diziliş: <span className="text-slate-900">{perf.formation}</span></p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold text-primary tracking-tight">{perf.rating}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rating</span>
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Analiz Özeti</span>
              </div>
            </CardContent>
          </Card>
        )) : (
          <Card className="col-span-3 py-16 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center bg-slate-50/50">
            <Users className="h-10 w-10 text-slate-200 mb-4" />
            <p className="text-sm font-bold text-slate-900">Takım performans kaydı bulunmuyor.</p>
            <p className="text-xs font-medium text-slate-500 mt-1">İlk performans kaydını oluşturun</p>
          </Card>
        )}
      </div>
      
      <Card className="rounded-xl shadow-sm border border-slate-200 bg-white overflow-hidden">
        <CardHeader className="p-6 border-b border-slate-100 bg-slate-50/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-slate-400" />
                Performans Trendi
              </CardTitle>
              <CardDescription className="text-xs font-medium text-slate-500">Son 5 maçtaki genel takım puanlaması</CardDescription>
            </div>
            <Badge variant="outline" className="border-slate-200 bg-white text-[10px] font-bold text-slate-600 uppercase h-6">Sürekli Gelişim</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-10">
          <div className="h-[200px] flex items-end justify-between gap-6 px-4">
            {performances.length > 0 ? performances.slice(0, 5).reverse().map((perf: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                <div className="w-full bg-slate-50 rounded-t-xl relative h-[160px] overflow-hidden border border-slate-100 shadow-inner">
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-primary/10 group-hover:bg-primary/20 transition-all duration-500 border-t border-primary/20 flex items-start justify-center pt-2" 
                    style={{ height: `${perf.rating * 10}%` }}
                  >
                    <div className="text-center font-bold text-xs text-primary">{perf.rating}</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{new Date(perf.date).toLocaleDateString("tr-TR", { month: 'short', day: 'numeric' })}</span>
              </div>
            )) : (
              <div className="w-full flex items-center justify-center h-full text-slate-400 font-medium text-xs italic">Yeterli veri bulunmuyor.</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg rounded-xl shadow-lg border-slate-200 bg-white p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b border-slate-100 bg-slate-50/30">
            <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">
              {viewOnly ? "Kayıt Görüntüle" : (selectedPerf ? "Kaydı Düzenle" : "Yeni Takım Performansı")}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Diziliş</Label>
                <Input value={formData.formation} onChange={(e) => setFormData({ ...formData, formation: e.target.value })} disabled={viewOnly} className="h-10 rounded-lg border-slate-200 focus-visible:ring-primary text-sm font-medium" placeholder="örn: 4-3-3" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Genel Puan (0-10)</Label>
                <Input type="number" step="0.1" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })} disabled={viewOnly} className="h-10 rounded-lg border-slate-200 focus-visible:ring-primary text-sm font-bold text-primary" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pas İsabeti (%)</Label>
                <Input type="number" value={formData.passAccuracy} onChange={(e) => setFormData({ ...formData, passAccuracy: parseInt(e.target.value) })} disabled={viewOnly} className="h-10 rounded-lg border-slate-200 focus-visible:ring-primary text-sm font-medium" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Topla Oynama (%)</Label>
                <Input type="number" value={formData.possession} onChange={(e) => setFormData({ ...formData, possession: parseInt(e.target.value) })} disabled={viewOnly} className="h-10 rounded-lg border-slate-200 focus-visible:ring-primary text-sm font-medium" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider text-[10px]">İsabetli Şut</Label>
                <Input type="number" value={formData.shotsOnTarget} onChange={(e) => setFormData({ ...formData, shotsOnTarget: parseInt(e.target.value) })} disabled={viewOnly} className="h-10 rounded-lg border-slate-200 focus-visible:ring-primary text-sm font-medium" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider text-[10px]">Atılan Gol</Label>
                <Input type="number" value={formData.goalsScored} onChange={(e) => setFormData({ ...formData, goalsScored: parseInt(e.target.value) })} disabled={viewOnly} className="h-10 rounded-lg border-slate-200 focus-visible:ring-primary text-sm font-medium" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider text-[10px]">Yenilen Gol</Label>
                <Input type="number" value={formData.goalsConceded} onChange={(e) => setFormData({ ...formData, goalsConceded: parseInt(e.target.value) })} disabled={viewOnly} className="h-10 rounded-lg border-slate-200 focus-visible:ring-primary text-sm font-medium" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Notlar</Label>
              <Textarea 
                className="rounded-lg border-slate-200 focus-visible:ring-primary min-h-[100px] resize-none text-sm font-medium"
                value={formData.notes}
                disabled={viewOnly}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Takımın genel performansı hakkında notlar..."
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowDialog(false)} className="flex-1 h-11 rounded-lg border-slate-200 text-sm font-bold">
                {viewOnly ? "Kapat" : "İptal"}
              </Button>
              {!viewOnly && (
                <Button onClick={handleSave} className="flex-1 h-11 rounded-lg text-sm font-bold">Kaydet</Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MatchAnalysisModule({ analyses, matches, onRefresh, token }: any) {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [formData, setFormData] = useState({
    opponent: "",
    date: new Date().toISOString().split('T')[0],
    location: "HOME",
    competition: "Lig",
    result: "",
    ourFormation: "",
    opponentFormation: "",
    possession: 50,
    passAccuracy: 80,
    shotsOnTarget: 5,
    goalsScored: 0,
    goalsConceded: 0,
    rating: 7.0,
    notes: "",
    videoUrl: ""
  });

  const handleSave = async () => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/analytics/match-analysis${selectedAnalysis ? `/${selectedAnalysis.id}` : ""}`;
    const method = selectedAnalysis ? "PUT" : "POST";
    
    try {
      const { id, createdAt, updatedAt, ...restOfData } = formData as any;
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(restOfData)
      });
      if (res.ok) {
        setShowDialog(false);
        onRefresh();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Kayıt sırasında bir hata oluştu: ${errorData.message || res.statusText}`);
      }
    } catch (error) {
      console.error("Error saving match analysis:", error);
      alert("Sunucu bağlantısında bir hata oluştu.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu analizi silmek istediğinize emin misiniz?")) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/match-analysis/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      onRefresh();
    } catch (error) {
      console.error("Error deleting match analysis:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Maç Analiz Kayıtları</h3>
        <Button onClick={() => { 
          setSelectedAnalysis(null); 
          setViewOnly(false);
          setFormData({ 
            opponent: "", 
            date: new Date().toISOString().split('T')[0], 
            location: "HOME", 
            competition: "Lig", 
            result: "", 
            ourFormation: "", 
            opponentFormation: "", 
            possession: 50, 
            passAccuracy: 80, 
            shotsOnTarget: 5, 
            goalsScored: 0, 
            goalsConceded: 0, 
            rating: 7.0, 
            notes: "", 
            videoUrl: "" 
          }); 
          setShowDialog(true); 
        }} size="sm">
          <Plus className="h-4 w-4 mr-2" /> Yeni Analiz
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {analyses.length > 0 ? analyses.map((analysis: any) => (
          <Card key={analysis.id} className="border bg-card overflow-hidden group relative hover:shadow-md transition-all">
            <CardHeader className="pb-4 border-b">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] uppercase font-bold tracking-wider">{analysis.competition}</Badge>
                    <span className="text-[10px] font-medium text-muted-foreground uppercase">{new Date(analysis.date).toLocaleDateString("tr-TR")}</span>
                  </div>
                  <CardTitle className="text-2xl font-bold tracking-tight">NGCS {analysis.result || "vs"} {analysis.opponent}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-muted text-muted-foreground font-semibold px-3">{analysis.location === "HOME" ? "İÇ SAHA" : "DEPLASMAN"}</Badge>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => { 
                      setSelectedAnalysis(analysis); 
                      setViewOnly(true);
                      setFormData({ ...analysis, date: new Date(analysis.date).toISOString().split('T')[0] }); 
                      setShowDialog(true); 
                    }}><Eye className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => { 
                      setSelectedAnalysis(analysis); 
                      setViewOnly(false);
                      setFormData({ ...analysis, date: new Date(analysis.date).toISOString().split('T')[0] }); 
                      setShowDialog(true); 
                    }}><Edit2 className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(analysis.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Topla Oynama", value: `%${analysis.possession}`, icon: Activity },
                  { label: "Pas İsabeti", value: `%${analysis.passAccuracy}`, icon: Target },
                  { label: "İsabetli Şut", value: analysis.shotsOnTarget, icon: Target },
                  { label: "Genel Puan", value: analysis.rating, icon: Award, highlight: true }
                ].map((stat, i) => (
                  <div key={i} className={cn("p-4 rounded-lg border", stat.highlight ? "bg-primary/5 border-primary/20" : "bg-muted/30")}>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
                    <div className="flex items-center gap-2">
                      <stat.icon className={cn("h-4 w-4", stat.highlight ? "text-primary" : "text-muted-foreground")} />
                      <p className={cn("text-xl font-bold tracking-tight", stat.highlight ? "text-primary" : "text-foreground")}>{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Shield className="h-4 w-4" /> Taktiksel Veriler
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg border text-sm">
                      <span className="text-muted-foreground font-medium">Bizim Dizilişimiz</span>
                      <span className="font-bold">{analysis.ourFormation || "Belirtilmedi"}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg border text-sm">
                      <span className="text-muted-foreground font-medium">Rakip Diziliş</span>
                      <span className="font-bold">{analysis.opponentFormation || "Belirtilmedi"}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Teknik Notlar
                  </h4>
                  <div className="p-4 bg-muted/30 rounded-lg border min-h-[100px]">
                    <p className="text-sm font-medium italic text-muted-foreground leading-relaxed">
                      {analysis.notes ? `"${analysis.notes}"` : "Bu maç için henüz analiz notu eklenmemiş."}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <Card className="py-24 border-dashed flex flex-col items-center justify-center text-center bg-muted/10">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Henüz maç analizi kaydı bulunmuyor.</p>
          </Card>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-4xl p-0 overflow-hidden flex flex-col h-[90vh]">
          <DialogHeader className="p-6 border-b bg-muted/30 shrink-0">
            <DialogTitle className="text-xl font-bold tracking-tight">
              {viewOnly ? "Analiz Görüntüle" : (selectedAnalysis ? "Analizi Düzenle" : "Yeni Maç Analizi")}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rakip Takım</Label>
                <Input value={formData.opponent} onChange={(e) => setFormData({ ...formData, opponent: e.target.value })} disabled={viewOnly} className="bg-muted/30 focus-visible:ring-primary" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tarih</Label>
                <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} disabled={viewOnly} className="bg-muted/30 focus-visible:ring-primary" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Müsabaka</Label>
                <Input value={formData.competition} onChange={(e) => setFormData({ ...formData, competition: e.target.value })} disabled={viewOnly} className="bg-muted/30 focus-visible:ring-primary" placeholder="Lig, Kupa..." />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Saha</Label>
                <Select value={formData.location} onValueChange={(val) => setFormData({ ...formData, location: val })} disabled={viewOnly}>
                  <SelectTrigger className="bg-muted/30 focus-visible:ring-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOME">İç Saha</SelectItem>
                    <SelectItem value="AWAY">Deplasman</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Skor (örn: 2-1)</Label>
                <Input value={formData.result} onChange={(e) => setFormData({ ...formData, result: e.target.value })} disabled={viewOnly} className="bg-muted/30 focus-visible:ring-primary" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bizim Dizilişimiz</Label>
                <Input value={formData.ourFormation} onChange={(e) => setFormData({ ...formData, ourFormation: e.target.value })} disabled={viewOnly} className="bg-muted/30 focus-visible:ring-primary" placeholder="4-3-3" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rakip Diziliş</Label>
                <Input value={formData.opponentFormation} onChange={(e) => setFormData({ ...formData, opponentFormation: e.target.value })} disabled={viewOnly} className="bg-muted/30 focus-visible:ring-primary" placeholder="4-4-2" />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Topla Oynama (%)</Label>
                <Input type="number" value={formData.possession} onChange={(e) => setFormData({ ...formData, possession: parseInt(e.target.value) })} disabled={viewOnly} className="bg-muted/30 focus-visible:ring-primary" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pas İsabeti (%)</Label>
                <Input type="number" value={formData.passAccuracy} onChange={(e) => setFormData({ ...formData, passAccuracy: parseInt(e.target.value) })} disabled={viewOnly} className="bg-muted/30 focus-visible:ring-primary" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">İsabetli Şut</Label>
                <Input type="number" value={formData.shotsOnTarget} onChange={(e) => setFormData({ ...formData, shotsOnTarget: parseInt(e.target.value) })} disabled={viewOnly} className="bg-muted/30 focus-visible:ring-primary" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Puan (0-10)</Label>
                <Input type="number" step="0.1" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })} disabled={viewOnly} className="bg-muted/30 focus-visible:ring-primary font-bold" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Atılan Gol</Label>
                <Input type="number" value={formData.goalsScored} onChange={(e) => setFormData({ ...formData, goalsScored: parseInt(e.target.value) })} disabled={viewOnly} className="bg-muted/30 focus-visible:ring-primary" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Yenilen Gol</Label>
                <Input type="number" value={formData.goalsConceded} onChange={(e) => setFormData({ ...formData, goalsConceded: parseInt(e.target.value) })} disabled={viewOnly} className="bg-muted/30 focus-visible:ring-primary" />
              </div>
            </div>

            <div className="space-y-2 border-t pt-4">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Analiz Notları</Label>
              <Textarea 
                className="bg-muted/30 focus-visible:ring-primary min-h-[150px] resize-none"
                value={formData.notes}
                disabled={viewOnly}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Maçın kritik anları, başarılı/başarısız aksiyonlar ve taktiksel notlar..."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Video URL</Label>
              <Input value={formData.videoUrl} onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })} disabled={viewOnly} className="bg-muted/30 focus-visible:ring-primary" placeholder="Maç kaydı veya analiz videosu linki..." />
            </div>
          </div>
          <div className="p-6 bg-muted/30 border-t flex gap-3 shrink-0">
            <Button variant="outline" onClick={() => setShowDialog(false)} className="flex-1">
              {viewOnly ? "Kapat" : "İptal"}
            </Button>
            {!viewOnly && (
              <Button onClick={handleSave} className="flex-1">Kaydet</Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TrainingAnalysisModule({ attendanceData, sessionsData, stats }: any) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Toplam Seanslar", value: stats.totalSessions, icon: Calendar, color: "text-slate-400", bg: "bg-slate-50", trend: "+2.5%" },
          { label: "Ortalama Katılım", value: stats.avgAttendance, icon: Users, color: "text-slate-400", bg: "bg-slate-50", trend: "+5.1%" },
          { label: "Toplam Antrenmanlar", value: stats.totalDrills, icon: Dumbbell, color: "text-slate-400", bg: "bg-slate-50", trend: "-1.2%" },
        ].map((item, i) => (
          <Card key={i} className="rounded-xl border border-slate-200 bg-white shadow-sm relative overflow-hidden">
            <CardHeader className="p-6 pb-2 space-y-0">
              <CardDescription className="text-sm font-medium text-slate-500">{item.label}</CardDescription>
              <div className={cn("absolute top-6 right-6 p-2 rounded-full border border-slate-100", item.bg, item.color)}>
                <item.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="text-3xl font-bold tracking-tight text-slate-900">{item.value}</div>
              <div className="mt-1 flex items-center gap-1.5">
                <span className={cn(
                  "text-xs font-bold",
                  item.trend.startsWith('+') ? "text-emerald-600" : "text-rose-600"
                )}>
                  {item.trend}
                </span>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Geçen Aya Göre</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-100 bg-slate-50/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm text-slate-400"><Activity className="h-5 w-5" /></div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900 tracking-tight">Yoklama Trendi</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500">Son 10 seanstaki katılım dağılımı</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', color: '#64748b' }} />
                  <Bar dataKey="present" fill="#10b981" name="Katıldı" radius={[4, 4, 0, 0]} barSize={24} />
                  <Bar dataKey="absent" fill="#f43f5e" name="Katılmadı" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-100 bg-slate-50/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm text-slate-400"><LineChartIcon className="h-5 w-5" /></div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900 tracking-tight">Aylık Seanslar</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500">Aya göre planlanan antrenman yoğunluğu</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sessionsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', color: '#64748b' }} />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#3b82f6' }} activeDot={{ r: 6 }} name="Seanslar" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PhysicalAnalysisModule() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Ort. Mesafe", value: "8.4 km", icon: Activity, color: "text-blue-600", bg: "bg-blue-50/50" },
          { label: "HSR (Yüksek Şiddet)", value: "650 m", icon: Zap, color: "text-amber-600", bg: "bg-amber-50/50" },
          { label: "Sürat Koşusu", value: "180 m", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50/50" },
          { label: "Yüklenme Endeksi", value: "720", icon: BarChart3, color: "text-red-600", bg: "bg-red-50/50" },
        ].map((item, i) => (
          <Card key={i} className="border bg-card hover:shadow-md transition-all">
            <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
              <div className={cn("p-2 rounded-lg mb-1", item.bg, item.color)}>
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{item.label}</p>
                <p className="text-xl font-bold tracking-tight">{item.value}</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold">
                <TrendingUp className="h-3 w-3" /> %4 Artış
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border bg-card shadow-sm">
        <CardHeader className="p-6">
          <CardTitle className="text-lg font-bold">Yüklenme ve Sakatlık Riski Analizi</CardTitle>
          <CardDescription className="text-sm font-medium">Akut/Kronik İş Yükü Oranı</CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="h-[250px] w-full bg-muted/20 rounded-lg flex items-center justify-center border-2 border-dashed">
            <div className="text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                <Activity className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-muted-foreground italic">GPS Verisi Entegrasyonu Bekleniyor</p>
                <p className="text-xs text-muted-foreground">Analiz oluşturmak için veri yüklemeniz gerekmektedir.</p>
              </div>
              <Button variant="outline" size="sm" className="font-semibold"><Download className="h-3.5 w-3.5 mr-2" /> Veri İçe Aktar (CSV/GPX)</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function VideoAnalysisModule({ videoAnalyses, onRefresh, token }: any) {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    duration: "",
    clipsCount: 0,
    category: "Taktik"
  });

  const handleSave = async () => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/analytics/video-analysis${selectedVideo ? `/${selectedVideo.id}` : ""}`;
    const method = selectedVideo ? "PUT" : "POST";
    
    try {
      const { id, createdAt, updatedAt, ...restOfData } = formData as any;
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(restOfData)
      });
      if (res.ok) {
        setShowDialog(false);
        onRefresh();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Kayıt sırasında bir hata oluştu: ${errorData.message || res.statusText}`);
      }
    } catch (error) {
      console.error("Error saving video analysis:", error);
      alert("Sunucu bağlantısında bir hata oluştu.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu video analizini silmek istediğinize emin misiniz?")) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/video-analysis/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      onRefresh();
    } catch (error) {
      console.error("Error deleting video analysis:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold tracking-tight">Video Analiz Oturumları</h3>
          <p className="text-xs text-muted-foreground font-medium">Maç ve antrenman videoları üzerinden taktiksel değerlendirmeler</p>
        </div>
        <Button onClick={() => { 
          setSelectedVideo(null); 
          setViewOnly(false);
          setFormData({ title: "", description: "", videoUrl: "", duration: "", clipsCount: 0, category: "Taktik" }); 
          setShowDialog(true); 
        }} className="font-bold"><Plus className="h-4 w-4 mr-2" /> Yeni Oturum</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videoAnalyses.length > 0 ? videoAnalyses.map((video: any, i: number) => (
          <Card key={i} className="border bg-card overflow-hidden group hover:shadow-md transition-all relative">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
              <Button size="icon" variant="secondary" className="h-7 w-7 bg-background/80 backdrop-blur-sm" onClick={(e) => { 
                e.stopPropagation(); 
                setSelectedVideo(video); 
                setViewOnly(true);
                setFormData({ ...video }); 
                setShowDialog(true); 
              }}><Eye className="h-3.5 w-3.5" /></Button>
              <Button size="icon" variant="secondary" className="h-7 w-7 bg-background/80 backdrop-blur-sm" onClick={(e) => { 
                e.stopPropagation(); 
                setSelectedVideo(video); 
                setViewOnly(false);
                setFormData({ ...video }); 
                setShowDialog(true); 
              }}><Edit2 className="h-3.5 w-3.5" /></Button>
              <Button size="icon" variant="destructive" className="h-7 w-7 opacity-90" onClick={(e) => { e.stopPropagation(); handleDelete(video.id); }}><X className="h-3.5 w-3.5" /></Button>
            </div>
            <div className="aspect-video bg-muted flex items-center justify-center relative border-b">
              <Video className="h-10 w-10 text-muted-foreground/30 group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center shadow-sm">
                  <PlayCircle className="h-6 w-6 text-primary" />
                </div>
              </div>
              <Badge variant="secondary" className="absolute bottom-3 right-3 font-bold">{video.duration || "00:00"}</Badge>
            </div>
            <CardHeader className="p-4">
              <div className="flex justify-between items-start mb-1">
                <CardTitle className="text-base font-bold group-hover:text-primary transition-colors line-clamp-1">{video.title}</CardTitle>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
                <div className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(video.date).toLocaleDateString("tr-TR")}</div>
                <div className="flex items-center gap-1"><Target className="h-3 w-3" /> {video.clipsCount} Klip</div>
                <Badge variant="outline" className="ml-auto text-[9px] px-1.5 h-4 border-primary/20 text-primary">{video.category}</Badge>
              </div>
            </CardHeader>
          </Card>
        )) : (
          <div className="col-span-full py-16 text-center bg-muted/30 rounded-lg border border-dashed border-muted-foreground/20">
            <Video className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground font-bold text-sm">Henüz video analiz oturumu bulunmuyor.</p>
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b bg-muted/30 shrink-0">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight">
                  {viewOnly ? "Oturumu Görüntüle" : (selectedVideo ? "Oturumu Düzenle" : "Yeni Video Oturumu")}
                </DialogTitle>
                <DialogDescription className="text-xs font-medium uppercase tracking-wider">VİDEO ANALİZ DETAYLARI</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-tight">Oturum Başlığı</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} disabled={viewOnly} className="h-10 bg-muted/30 border-none font-bold focus-visible:ring-primary" placeholder="örn: Beşiktaş Maçı Savunma Hataları" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-tight">Video URL</Label>
              <Input value={formData.videoUrl} onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })} disabled={viewOnly} className="h-10 bg-muted/30 border-none font-bold focus-visible:ring-primary" placeholder="YouTube/Vimeo veya Yerel Link" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-tight">Süre (00:00)</Label>
                <Input value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} disabled={viewOnly} className="h-10 bg-muted/30 border-none font-bold focus-visible:ring-primary" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-tight">Klip Sayısı</Label>
                <Input type="number" value={formData.clipsCount} onChange={(e) => setFormData({ ...formData, clipsCount: parseInt(e.target.value) })} disabled={viewOnly} className="h-10 bg-muted/30 border-none font-bold focus-visible:ring-primary" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-tight">Kategori</Label>
              <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })} disabled={viewOnly}>
                <SelectTrigger className="h-10 bg-muted/30 border-none font-bold focus-visible:ring-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Taktik" className="font-medium">Taktik</SelectItem>
                  <SelectItem value="Savunma" className="font-medium">Savunma</SelectItem>
                  <SelectItem value="Hücum" className="font-medium">Hücum</SelectItem>
                  <SelectItem value="Bireysel" className="font-medium">Bireysel</SelectItem>
                  <SelectItem value="Duran Top" className="font-medium">Duran Top</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-tight">Açıklama</Label>
              <Textarea 
                className="bg-muted/30 border-none focus-visible:ring-primary min-h-20 resize-none"
                value={formData.description}
                disabled={viewOnly}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Analiz detayları..."
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowDialog(false)} className="flex-1 h-10 font-bold border-border">
                {viewOnly ? "Kapat" : "İptal"}
              </Button>
              {!viewOnly && (
                <Button onClick={handleSave} className="flex-1 h-10 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">Kaydet</Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReportsModule({ reports, onRefresh, token }: any) {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "PDF",
    category: "Oyuncu"
  });

  const handleCreate = async () => {
    if (!formData.name) {
      alert("Lütfen rapor başlığı girin.");
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/reports`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowDialog(false);
        onRefresh();
        setFormData({ name: "", type: "PDF", category: "Oyuncu" });
      }
    } catch (error) {
      console.error("Error creating report:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu raporu silmek istediğinize emin misiniz?")) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/reports/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      onRefresh();
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border bg-card shadow-sm">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-lg font-bold tracking-tight">Yeni Rapor Oluştur</CardTitle>
            <CardDescription className="text-xs font-medium">Analiz parametrelerini seçerek özel raporlar oluşturun</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rapor Başlığı</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-muted/30 focus-visible:ring-primary" placeholder="örn: Ocak 2026 Performans Özeti" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rapor Tipi</Label>
                <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                  <SelectTrigger className="bg-muted/30 focus-visible:ring-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF Belgesi</SelectItem>
                    <SelectItem value="EXCEL">Excel Tablosu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kategori</Label>
                <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                  <SelectTrigger className="bg-muted/30 focus-visible:ring-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Oyuncu">Oyuncu Bazlı</SelectItem>
                    <SelectItem value="Takım">Takım Bazlı</SelectItem>
                    <SelectItem value="Maç">Maç Analizi</SelectItem>
                    <SelectItem value="Fiziksel">Fiziksel Veriler</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleCreate} className="w-full font-bold shadow-sm mt-2">
              <FileText className="h-4 w-4 mr-2" /> Raporu Hazırla & Kaydet
            </Button>
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="p-6 pb-4 border-b">
            <CardTitle className="text-lg font-bold tracking-tight">Son Oluşturulan Raporlar</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto max-h-[420px]">
            <div className="divide-y">
              {reports.length > 0 ? reports.map((report: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground leading-none">{report.name}</p>
                      <p className="text-[10px] font-medium text-muted-foreground mt-1 uppercase">
                        {new Date(report.date).toLocaleDateString("tr-TR")} • {report.type} • {report.category || "Genel"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(report.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )) : (
                <div className="p-12 text-center text-muted-foreground text-sm font-medium italic">
                  Henüz rapor oluşturulmamış.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Plus component deleted
