"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useClubStore } from "@/store/useClubStore";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ErrorBoundary } from "@/components/error-boundary";
import { Loader2, Settings as SettingsIcon, Building2, Save, Info, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminSettingsPage() {
  const { data: session, status } = useSession();
  const { selectedClub, setSelectedClub } = useClubStore();
  const token = (session as any)?.accessToken as string | undefined;
  const qc = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clubName, setClubName] = useState("");
  const [clubDescription, setClubDescription] = useState("");

  // Fetch existing club
  const { data: clubs, isLoading: clubsLoading } = useQuery({
    queryKey: ["clubs"],
    queryFn: async () => {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/clubs", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return res.json();
    },
    enabled: !!token,
    staleTime: 0,
    gcTime: 0,
  });

  const club = clubs?.[0];

  // Set initial values when club data is loaded
  React.useEffect(() => {
    if (club) {
      setClubName(club.name || "");
      setClubDescription(club.description || "");
    }
  }, [club]);

  // Update club mutation
  const updateClub = useMutation({
    mutationFn: async () => {
      if (!club?.id) {
        // Create new club
        const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/clubs", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
          body: JSON.stringify({ name: clubName, description: clubDescription }),
        });
        if (!res.ok) throw new Error("Kulüp oluşturulamadı");
        return res.json();
      } else {
        // Update existing club
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clubs/${club.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
          body: JSON.stringify({ name: clubName, description: clubDescription }),
        });
        if (!res.ok) throw new Error("Kulüp güncellenemedi");
        return res.json();
      }
    },
    onSuccess: async (data) => {
      // Invalidate and refetch immediately
      await qc.invalidateQueries({ queryKey: ["clubs"] });
      await qc.refetchQueries({ queryKey: ["clubs"] });
      
      // Update local state
      setClubName(data.name || "");
      setClubDescription(data.description || "");
      
      // Update club store if the updated club is the selected one
      if (selectedClub?.id === data.id) {
        setSelectedClub(data);
      } else if (!selectedClub && data) {
        // If no club was selected, select this one
        setSelectedClub(data);
      }
      
      alert("✅ Kulüp bilgileri güncellendi!");
    },
    onError: (error: any) => {
      alert("❌ Hata: " + error.message);
    },
  });

  React.useEffect(() => {
    if (status === "loading") return;
    if (session && (session as any)?.role !== "ADMIN") {
      window.location.href = "/dashboard";
    }
  }, [session, status]);

  if (status === "loading" || clubsLoading) {
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
      <div className="flex min-h-screen bg-background">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 lg:ml-64 flex flex-col">
          <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          
          <main className="flex-1 overflow-auto mt-[57px]">
            <div className="p-8 lg:p-10 max-w-6xl mx-auto space-y-10">
              {/* Page Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-50 rounded-full border border-slate-100 shadow-sm">
                    <SettingsIcon className="h-6 w-6 text-slate-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Ayarlar</h1>
                    <p className="text-sm font-medium text-slate-500 mt-0.5">Kulüp ve sistem yapılandırmasını yönetin</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Form */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="rounded-xl shadow-sm border border-slate-200 bg-white overflow-hidden">
                    <CardHeader className="p-6 pb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                          <Building2 className="h-5 w-5 text-slate-400" />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-medium text-slate-500">Kulüp Bilgileri</CardTitle>
                          <CardDescription className="text-lg font-bold text-slate-900 tracking-tight mt-1">
                            {club ? "Kulüp Profili" : "Kulüp Kurulumu"}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-2 space-y-6">
                      <div className="grid gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="clubName" className="text-xs font-medium text-slate-500 uppercase tracking-wider">Kulüp Adı</Label>
                          <Input
                            id="clubName"
                            placeholder="Örn: NGCS Futbol Akademisi"
                            value={clubName}
                            onChange={(e) => setClubName(e.target.value)}
                            className="h-10 rounded-lg shadow-sm border-slate-200 focus-visible:ring-primary text-sm font-medium"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description" className="text-xs font-medium text-slate-500 uppercase tracking-wider">Açıklama</Label>
                          <Textarea
                            id="description"
                            placeholder="Kulüp hakkında kısa açıklama..."
                            value={clubDescription}
                            onChange={(e) => setClubDescription(e.target.value)}
                            rows={4}
                            className="min-h-[120px] rounded-lg shadow-sm border-slate-200 focus-visible:ring-primary resize-none text-sm font-medium"
                          />
                        </div>
                      </div>

                      <div className="pt-2">
                        <Button
                          onClick={() => updateClub.mutate()}
                          disabled={!clubName || updateClub.isPending}
                          className="w-full h-11 rounded-lg shadow-sm text-sm font-bold tracking-tight"
                        >
                          {updateClub.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Kaydediliyor...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              {club ? "Değişiklikleri Kaydet" : "Kulübü Oluştur"}
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column: Info Cards */}
                <div className="space-y-6">
                  {club && (
                    <Card className="rounded-xl shadow-sm border border-slate-200 bg-white overflow-hidden">
                      <CardHeader className="p-6 pb-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                            <Info className="h-5 w-5 text-slate-400" />
                          </div>
                          <CardTitle className="text-sm font-medium text-slate-500">Sistem Bilgileri</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 pt-2 space-y-4">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Kulüp Kimliği (ID)</span>
                          <span className="font-mono bg-slate-50 p-3 rounded-lg text-[10px] break-all border border-slate-100 text-slate-600 font-bold">{club.id}</span>
                        </div>
                        <div className="space-y-3 pt-2">
                          <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-xs font-medium text-slate-500">Kayıt Tarihi</span>
                            <span className="text-xs font-bold text-slate-900">{new Date(club.createdAt).toLocaleDateString('tr-TR')}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-xs font-medium text-slate-500">Son Güncelleme</span>
                            <span className="text-xs font-bold text-slate-900">{new Date(club.updatedAt).toLocaleDateString('tr-TR')}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="rounded-xl shadow-sm border border-slate-100 bg-slate-50/50 overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                          <ShieldCheck className="h-5 w-5 text-slate-400" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-slate-900 tracking-tight">Güvenlik Uyarısı</h4>
                          <p className="text-xs font-medium text-slate-500 leading-relaxed">
                            Bu sayfadaki değişiklikler tüm sistem genelinde etkili olacaktır. Lütfen doğru bilgileri girdiğinizden emin olun.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
