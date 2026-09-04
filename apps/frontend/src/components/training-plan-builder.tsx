"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Loader2, 
  Plus, 
  X, 
  Clock, 
  Calendar, 
  Layout, 
  Trash2, 
  Dumbbell, 
  Activity, 
  Trophy,
  Users,
  Save,
  Flame,
  Zap,
  Coffee,
  Target,
  FileText,
  ClipboardList
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TrainingPlanBuilderProps {
  initialDate?: string;
  initialClubId?: string;
  onSuccess?: (plan: any) => void;
  onCancel?: () => void;
}

export function TrainingPlanBuilder({ 
  initialDate, 
  initialClubId, 
  onSuccess, 
  onCancel 
}: TrainingPlanBuilderProps) {
  const { data: session } = useSession();
  const [phase, setPhase] = useState<"WARM_UP" | "TECHNICAL" | "TACTICAL" | "COOL_DOWN">("WARM_UP");
  const [selected, setSelected] = useState<any[]>([]);
  const [title, setTitle] = useState("Antrenman Planı");
  const [clubId, setClubId] = useState(initialClubId || "");
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [date, setDate] = useState<string>(initialDate || new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const token = (session as any)?.accessToken as string | undefined;
  
  const { data: clubs } = useQuery({
    queryKey: ["clubs"],
    queryFn: async () => {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/clubs", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Kulüpler yüklenemedi");
      return res.json();
    },
    enabled: !!token && !initialClubId,
  });

  React.useEffect(() => {
    if (clubs && clubs.length > 0 && !clubId) {
      setClubId(clubs[0].id);
    }
  }, [clubs, clubId]);

  const { data: teams, isLoading: teamsLoading, refetch: refetchTeams } = useQuery({
    queryKey: ["teams", clubId],
    queryFn: async () => {
      const url = new URL(process.env.NEXT_PUBLIC_API_URL + "/groups");
      url.searchParams.set("clubId", clubId);
      const res = await fetch(url.toString(), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Takımlar yüklenemedi");
      return res.json();
    },
    enabled: !!token && !!clubId,
  });

  const { data: suggestions, isLoading: suggestionsLoading } = useQuery({
    queryKey: ["drills", phase],
    queryFn: async () => {
      const url = new URL(process.env.NEXT_PUBLIC_API_URL + "/drills");
      url.searchParams.set("category", phase);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Drill'ler yüklenemedi");
      return res.json();
    },
    enabled: !!token,
  });

  function addDrill(drill: any) {
    setSelected([...selected, { ...drill, phase, customDuration: drill.durationMin }]);
  }

  function updateDuration(index: number, newDuration: number) {
    const updated = [...selected];
    updated[index] = { ...updated[index], customDuration: newDuration };
    setSelected(updated);
  }

  const totalDuration = selected.reduce((acc, d) => acc + (d.customDuration ?? d.durationMin ?? 0), 0);

  function resetForm() {
    setSelected([]);
    setTitle("Antrenman Planı");
    setNotes("");
    setPhase("WARM_UP");
  }

  async function savePlan() {
    if (selected.length === 0) {
      alert("Lütfen en az bir drill ekleyin.");
      return;
    }
    if (!groupId || groupId === "none") {
      alert("Lütfen bir takım seçin.");
      return;
    }
    if (!clubId) {
      alert("Lütfen bir kulüp seçin.");
      return;
    }
    setLoading(true);
    try {
      const createRes = await fetch(process.env.NEXT_PUBLIC_API_URL + "/training-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
        body: JSON.stringify({
          title,
          clubId,
          coachId: (session as any)?.user?.id ?? (session as any)?.userId,
          groupId: groupId === "none" ? undefined : groupId,
          date: new Date(date).toISOString(),
          notes,
        }),
      });
      if (!createRes.ok) throw new Error("Plan oluşturulamadı");
      const plan = await createRes.json();
      
      for (let i = 0; i < selected.length; i++) {
        const d = selected[i];
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/training-plans/${plan.id}/drills`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
          body: JSON.stringify({ 
            drillId: d.id, 
            phase: d.category || d.phase, 
            order: i, 
            durationMin: d.customDuration ?? d.durationMin,
          }),
        });
      }
      
      if (onSuccess) onSuccess(plan);
      resetForm();
    } catch (error: any) {
      console.error("Plan kaydetme hatası:", error);
      alert("Hata: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header with Stats */}
      <Card className="border bg-card overflow-hidden hover:shadow-md transition-all">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <ClipboardList className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-foreground uppercase">Seans Detayları</h2>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-70">Antrenman bilgilerini ve grubunu belirleyin.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">Toplam Süre</span>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-2xl font-black text-foreground tabular-nums">{totalDuration} <span className="text-xs font-bold text-muted-foreground">DK</span></span>
                </div>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">Drill Sayısı</span>
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-primary" />
                  <span className="text-2xl font-black text-foreground tabular-nums">{selected.length}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column: Form and suggestions */}
        <div className="xl:col-span-7 space-y-8">
          {/* Main Info Card */}
          <Card className="border bg-card overflow-hidden group relative hover:shadow-md transition-all">
            <CardHeader className="pb-4 border-b bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold tracking-tight">Temel Bilgiler</CardTitle>
                  <CardDescription className="text-xs uppercase font-bold tracking-widest opacity-60">Seans Konfigürasyonu</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="title" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Plan Başlığı</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="title"
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                      placeholder="Örn: Pazartesi Teknik Isınma" 
                      className="pl-10 h-10 bg-muted/30 border-none focus-visible:ring-primary transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="group" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Takım / Grup</Label>
                  <Select value={groupId ?? "none"} onValueChange={(v) => setGroupId(v === "none" ? undefined : v)}>
                    <SelectTrigger id="group" className="h-10 bg-muted/30 border-none focus-visible:ring-primary transition-all">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Takım seçin" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Takım seçin</SelectItem>
                      {teams?.map((g: any) => (
                        <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Seans Tarihi</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input 
                      id="date"
                      type="date" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)} 
                      className="pl-10 h-10 bg-muted/30 border-none focus-visible:ring-primary transition-all"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="notes" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Özel Notlar</Label>
                  <Textarea 
                    id="notes"
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    placeholder="Antrenman hakkında hedefler veya ek notlar..." 
                    className="min-h-[100px] resize-none bg-muted/30 border-none focus-visible:ring-primary transition-all"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Drill Suggestions Section */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Dumbbell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-foreground uppercase tracking-tight">Drill Havuzu</h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-70">Kategorilere göre seçim yapın</p>
                </div>
              </div>
              
              <div className="flex bg-muted/50 p-1 rounded-xl border shadow-inner">
                {[
                  { id: "WARM_UP", label: "Isınma", icon: Flame, color: "text-orange-600", bg: "bg-orange-50" },
                  { id: "TECHNICAL", label: "Teknik", icon: Target, color: "text-blue-600", bg: "bg-blue-50" },
                  { id: "TACTICAL", label: "Taktik", icon: Zap, color: "text-purple-600", bg: "bg-purple-50" },
                  { id: "COOL_DOWN", label: "Soğuma", icon: Coffee, color: "text-green-600", bg: "bg-green-50" }
                ].map((p) => {
                  const Icon = p.icon;
                  const isActive = phase === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPhase(p.id as any)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                        isActive 
                          ? "bg-background shadow-sm text-primary border" 
                          : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                      )}
                    >
                      <Icon className={cn("h-3.5 w-3.5", isActive ? p.color : "text-slate-400")} />
                      <span className="hidden md:inline">{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {suggestionsLoading ? (
                <div className="col-span-full py-20 text-center bg-white/20 rounded-2xl border border-dashed border-slate-300">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500/20" />
                  <p className="mt-4 text-sm text-slate-400 font-medium">Driller yükleniyor...</p>
                </div>
              ) : suggestions?.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white/20 rounded-2xl border border-dashed border-slate-300">
                  <p className="text-sm text-slate-400 font-medium">Bu kategoride henüz drill bulunmuyor.</p>
                </div>
              ) : suggestions?.map((d: any) => (
                <div 
                  key={d.id} 
                  className="group flex items-center justify-between p-3 bg-card border rounded-xl hover:border-primary/30 hover:shadow-sm transition-all"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[8px] font-black text-primary bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10 uppercase tracking-tighter">
                        {d.durationMin} DK
                      </span>
                      <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                        {d.difficulty}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-foreground truncate group-hover:text-primary transition-colors">
                      {d.title}
                    </h4>
                  </div>
                  
                  <Button 
                    size="icon" 
                    variant="secondary"
                    className="h-8 w-8 rounded-lg shrink-0 hover:bg-primary hover:text-white transition-all"
                    onClick={() => addDrill(d)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Session Flow */}
        <div className="xl:col-span-5">
          <Card className="border bg-card overflow-hidden h-fit sticky top-24 shadow-lg">
            <CardHeader className="bg-slate-900 py-6 border-b-0 relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Trophy className="h-20 w-20 text-white" />
              </div>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
                    <Trophy className="h-5 w-5 text-orange-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-base font-black uppercase tracking-tight">Seans Akışı</CardTitle>
                    <CardDescription className="text-slate-400 text-[10px] font-bold uppercase tracking-widest opacity-80">Sıralama ve Süre Yönetimi</CardDescription>
                  </div>
                </div>
                <Badge className="bg-orange-600 hover:bg-orange-600 text-white font-black px-3 py-1">
                  {selected.length} DRILL
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {selected.length === 0 ? (
                <div className="py-20 text-center bg-muted/20 rounded-2xl border-2 border-dashed border-muted flex flex-col items-center justify-center">
                  <div className="p-5 bg-background rounded-full shadow-sm mb-4 border">
                    <Layout className="h-8 w-8 text-muted-foreground opacity-30" />
                  </div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">
                    Henüz drill eklenmedi.
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-2">Soldaki kütüphaneden seçim yapın.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {selected.map((d, i) => (
                    <Card 
                      key={i} 
                      className="border bg-muted/10 overflow-hidden hover:bg-muted/20 hover:border-primary/20 transition-all group"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-[11px] font-black text-white shadow-md">
                            {i + 1}
                          </div>
                                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-foreground truncate">{d.title}</h4>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                              {d.phase || d.category}
                            </p>
                          </div>
                                          
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                            onClick={() => setSelected(selected.filter((_, idx) => idx !== i))}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                
                        <div className="flex items-center justify-between p-3 bg-background rounded-xl border shadow-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-primary" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Süre (Dakika)</span>
                          </div>
                          <div className="flex items-center bg-muted/50 rounded-lg px-2 py-1">
                            <Input
                              type="number"
                              value={d.customDuration ?? d.durationMin}
                              onChange={(e) => updateDuration(i, parseInt(e.target.value) || d.durationMin)}
                              className="w-10 h-6 border-none bg-transparent text-xs font-black text-center p-0 focus-visible:ring-0"
                            />
                            <span className="text-[9px] font-black text-muted-foreground uppercase ml-1">dk</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
        
              <div className="mt-8 pt-6 border-t space-y-4">
                <Button 
                  onClick={savePlan} 
                  disabled={loading || !groupId || groupId === "none" || selected.length === 0} 
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 gap-2"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Planı Kaydet & Yayınla
                    </>
                  )}
                </Button>
                        
                <div className="flex gap-3">
                  <Button variant="outline" onClick={resetForm} className="flex-1 h-10 border-border bg-muted/20 font-bold text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground">
                    Formu Temizle
                  </Button>
                  {onCancel && (
                    <Button variant="ghost" onClick={onCancel} className="flex-1 h-10 font-bold text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground">
                      Vazgeç
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
