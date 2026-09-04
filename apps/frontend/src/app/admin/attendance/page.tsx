"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useSocket } from "@/lib/socket";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { ErrorBoundary } from "@/components/error-boundary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckSquare, Loader2, Download, Printer, Clock, UserCheck, UserX, Users, Calendar } from "lucide-react";
import Link from "next/link";

export default function AttendanceAdminPage() {
  const { data: session, status } = useSession();
  const { socket, isConnected, connectedUsers } = useSocket();
  const token = (session as any)?.accessToken as string | undefined;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clubId, setClubId] = useState("");
  const [planId, setPlanId] = useState<string>("");
  const [plans, setPlans] = useState<any[]>([]);
  const [plan, setPlan] = useState<any | null>(null);
  const [clubs, setClubs] = useState<any[]>([]);

  async function loadClubs() {
    if (!token) return [];
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/clubs", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  }
  async function loadPlansByClub(id: string) {
    if (!token) return;
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/training-plans?clubId=" + id, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setPlans(data);
  }
  async function loadPlanDetail(id: string) {
    if (!token) return;
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/training-plans/" + id, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setPlan(data);
  }
  async function mark(playerId: string, status: "PRESENT" | "ABSENT") {
    if (!plan || !token) return;
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ planId: plan.id, playerId, status }),
    });
    if (res.ok) {
      await loadPlanDetail(plan.id);
      // Broadcast update via Socket.IO
      socket?.emit("attendance:update", { planId: plan.id, playerId, status });
    }
  }

  React.useEffect(() => {
    if (status === "loading") return;
    if (session && (session as any)?.role !== "ADMIN") {
      window.location.href = "/dashboard";
    }
  }, [session, status]);

  React.useEffect(() => {
    if (token) {
      loadClubs().then(setClubs);
    }
  }, [token]);

  // Listen for real-time attendance updates
  React.useEffect(() => {
    if (!socket || !plan) return;

    const handleAttendanceUpdate = (data: { planId: string; playerId: string; status: string }) => {
      if (data.planId === plan.id) {
        loadPlanDetail(plan.id);
      }
    };

    socket.on("attendance:updated", handleAttendanceUpdate);

    return () => {
      socket.off("attendance:updated", handleAttendanceUpdate);
    };
  }, [socket, plan]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if ((session as any)?.role !== "ADMIN") {
    return null;
  }

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 lg:ml-64">
          <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="mt-[57px]">
            <div className="p-8 lg:p-10 space-y-8 lg:space-y-10">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-50 rounded-full border border-slate-100 shadow-sm">
                  <CheckSquare className="h-6 w-6 text-slate-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">Yoklama Yönetimi</h1>
                  <p className="text-sm font-medium text-slate-500 mt-1">Seans yoklamasını gerçek zamanlı takip edin ve yönetin</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full">
                <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-rose-500"}`} />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {isConnected ? "Bağlı" : "Bağlantı Kesildi"} · {connectedUsers.length} kullanıcı
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Select value={clubId} onValueChange={async (v) => { setClubId(v); setPlan(null); setPlans([]); await loadPlansByClub(v); }}>
                <SelectTrigger className="w-[250px] h-10 rounded-lg border-slate-200 text-sm font-medium">
                  <SelectValue placeholder="Kulüp Seçin" />
                </SelectTrigger>
                <SelectContent>
                  {clubs.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={planId} onValueChange={async (v) => { setPlanId(v); await loadPlanDetail(v); }} disabled={!clubId}>
                <SelectTrigger className="w-[350px] h-10 rounded-lg border-slate-200 text-sm font-medium">
                  <SelectValue placeholder="Plan Seçin" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title} {p.date ? `(${new Date(p.date).toLocaleDateString("tr-TR")})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {plan && (
                <Button variant="outline" onClick={() => {
                  const rows = ["Oyuncu,Durum"].concat((plan.attendance ?? []).map((a: any) => `${a.player?.name ?? a.playerId},${a.status}`));
                  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `yoklama-${plan.id}.csv`;
                  link.click();
                  URL.revokeObjectURL(url);
                }} className="gap-2 h-10 rounded-lg border-slate-200 text-xs font-bold">
                  <Download className="h-4 w-4" />
                  CSV İndir
                </Button>
              )}
            </div>

            {plan && (
              <Card className="rounded-xl shadow-sm border border-slate-200 bg-white overflow-hidden">
                <CardHeader className="p-6 border-b border-slate-100 bg-slate-50/30">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-primary">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">{plan.title}</CardTitle>
                        <CardDescription className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mt-1">
                          <Clock className="h-3.5 w-3.5" />
                          {plan.date ? new Date(plan.date).toLocaleDateString("tr-TR") : "-"}
                        </CardDescription>
                      </div>
                    </div>
                    <Link href={`/plans/${plan.id}/print`}>
                      <Button variant="outline" className="gap-2 h-9 rounded-lg border-slate-200 text-xs font-bold">
                        <Printer className="h-4 w-4" />
                        Yazdır
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-base text-slate-900 tracking-tight flex items-center gap-2">
                      <Users className="h-5 w-5 text-slate-400" />
                      Grup Üyeleri
                    </h3>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full">
                      {(plan.group?.members ?? []).length} Sporcu
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(plan.group?.members ?? []).map((m: any) => {
                      const current = (plan.attendance ?? []).find((a: any) => a.playerId === m.userId)?.status;
                      return (
                        <div 
                          key={m.id} 
                          className={`group p-4 rounded-xl flex justify-between items-center transition-all border ${
                            current === "PRESENT" ? "bg-emerald-50/50 border-emerald-100" : 
                            current === "ABSENT" ? "bg-rose-50/50 border-rose-100" : 
                            "bg-white border-slate-100 hover:border-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${
                              current === "PRESENT" ? "bg-emerald-100 text-emerald-600" : 
                              current === "ABSENT" ? "bg-rose-100 text-rose-600" : 
                              "bg-slate-100 text-slate-400"
                            }`}>
                              {(m.user?.name ?? m.userId).substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900">{m.user?.name ?? m.userId}</span>
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                current === "PRESENT" ? "text-emerald-600" : 
                                current === "ABSENT" ? "text-rose-600" : 
                                "text-slate-400"
                              }`}>
                                {current === "PRESENT" ? "Katıldı" : current === "ABSENT" ? "Katılmadı" : "Bekleniyor"}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant={current === "PRESENT" ? "default" : "outline"} 
                              size="sm" 
                              onClick={() => mark(m.userId, "PRESENT")}
                              className={`rounded-lg h-9 w-9 p-0 ${current === "PRESENT" ? "bg-emerald-500 hover:bg-emerald-600 border-none" : "border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"}`}
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant={current === "ABSENT" ? "destructive" : "outline"} 
                              size="sm" 
                              onClick={() => mark(m.userId, "ABSENT")}
                              className={`rounded-lg h-9 w-9 p-0 ${current === "ABSENT" ? "bg-rose-500 hover:bg-rose-600 border-none" : "border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"}`}
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
