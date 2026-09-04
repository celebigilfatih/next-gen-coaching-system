"use client";
import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { ErrorBoundary } from "@/components/error-boundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, Loader2, Clock, Users, MapPin, Target, 
  Trophy, Layers, Zap, BookOpen, Lightbulb, Settings, Activity, 
  TrendingUp, Shield, Flag } from "lucide-react";
import Link from "next/link";
import { fetchAPI, deleteAPI } from "@/lib/api";

export default function DrillDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { data: session } = useSession();
  const token = (session as any)?.accessToken as string | undefined;
  const qc = useQueryClient();
  const [deleting, setDeleting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: drill, isLoading } = useQuery({
    queryKey: ["drill", id],
    queryFn: async () => {
      const res = await fetchAPI(`/drills/${id}`, { token });
      if (!res.ok) throw new Error("Drill bulunamadı");
      return res.json();
    },
    enabled: !!id,
  });

  const handleDelete = async () => {
    if (!token) {
      alert("⚠️ Lütfen giriş yapın");
      return;
    }

    const confirmed = confirm("❌ Bu antrenmanı silmek istediğinizden emin misiniz?");
    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await deleteAPI(`/drills/${id}`, token);
      if (res.ok) {
        alert("✅ Antrenman başarıyla silindi!");
        qc.invalidateQueries({ queryKey: ["drills"] });
        router.push("/drills");
      } else {
        alert("❌ Silme başarısız");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("❌ Bir hata oluştu");
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!drill) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Antrenman Bulunamadı</CardTitle>
            <CardDescription>İstenen antrenman mevcut değil</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/drills">
              <Button>Geri Dön</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const categoryLabel: Record<string, string> = {
    WARM_UP: "🎽 Isınma",
    TECHNICAL: "⚽ Teknik",
    TACTICAL: "🎯 Taktik",
    COOL_DOWN: "🧘 Soğuma",
  };

  const difficultyLabel: Record<string, string> = {
    EASY: "Kolay",
    MEDIUM: "Orta",
    HARD: "Zor",
  };

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 lg:ml-64">
          <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="mt-[57px]">
            <div className="p-8 lg:p-10 max-w-5xl mx-auto space-y-8 lg:space-y-10">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Link href="/drills">
                  <Button variant="ghost" size="sm" className="gap-2 mb-3">
                    <ArrowLeft className="h-4 w-4" />
                    Antrenman Kütüphanesine Dön
                  </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                  {drill.title}
                </h1>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <span className="bg-secondary px-3 py-1 rounded-full">{categoryLabel[drill.category] || drill.category}</span>
                  <span className="bg-secondary px-3 py-1 rounded-full">{drill.ageGroup}</span>
                  <span className="bg-secondary px-3 py-1 rounded-full">{difficultyLabel[drill.difficulty] || drill.difficulty}</span>
                  <span className="bg-secondary px-3 py-1 rounded-full flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {drill.durationMin} dakika
                  </span>
                </div>
              </div>

              {session && (
                <div className="flex gap-2">
                  <Link href={`/drills/${id}/edit`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Edit className="h-4 w-4" />
                      Düzenle
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Sil
                  </Button>
                </div>
              )}
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {drill.equipment && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                      <Trophy className="h-4 w-4 text-amber-500" />
                      Ekipman
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-semibold flex items-start gap-2">
                      <Trophy className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      {drill.equipment}
                    </p>
                  </CardContent>
                </Card>
              )}
              {drill.jsonData?.playerCount && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4 text-orange-500" />
                      Oyuncu Sayısı
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-semibold flex items-center gap-2">
                      <Users className="h-4 w-4 text-orange-500 flex-shrink-0" />
                      {drill.jsonData.playerCount}
                    </p>
                  </CardContent>
                </Card>
              )}
              {drill.jsonData?.location && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 text-red-500" />
                      Eğitim Yeri
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-semibold flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-500 flex-shrink-0" />
                      {drill.jsonData.location}
                    </p>
                  </CardContent>
                </Card>
              )}
              {drill.jsonData?.trainingArea && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                      <Activity className="h-4 w-4 text-green-500" />
                      Eğitim Biçimi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-semibold flex items-start gap-2">
                      <Activity className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {drill.jsonData.trainingArea}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Organization */}
                {drill.jsonData?.organization && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Layers className="h-5 w-5 text-orange-500" />
                        Organizasyon
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{drill.jsonData.organization}</pre>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Process */}
                {drill.jsonData?.process && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-green-500" />
                        İşlem
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{drill.jsonData.process}</pre>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Variations */}
                {drill.jsonData?.variations && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-purple-500" />
                        Varyasyonlar
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{drill.jsonData.variations}</pre>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Tips */}
                {drill.jsonData?.tips && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                        İpuçları ve Düzeltmeler
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{drill.jsonData.tips}</pre>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar Info */}
              <div className="space-y-4">
                {drill.jsonData?.trainingSet && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                        <BookOpen className="h-4 w-4 text-indigo-500" />
                        Eğitim Seti
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{drill.jsonData.trainingSet}</p>
                    </CardContent>
                  </Card>
                )}

                {drill.jsonData?.techniques && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                        <Zap className="h-4 w-4 text-orange-500" />
                        Teknik
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{drill.jsonData.techniques}</p>
                    </CardContent>
                  </Card>
                )}

                {drill.jsonData?.tactics && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                        <Shield className="h-4 w-4 text-emerald-500" />
                        Taktikler
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{drill.jsonData.tactics}</p>
                    </CardContent>
                  </Card>
                )}

                {drill.jsonData?.coordination && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                        <Target className="h-4 w-4 text-pink-500" />
                        Koordinasyon
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{drill.jsonData.coordination}</p>
                    </CardContent>
                  </Card>
                )}

                {drill.jsonData?.comments && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                        <Flag className="h-4 w-4 text-gray-500" />
                        Yorumlar
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{drill.jsonData.comments}</p>
                    </CardContent>
                  </Card>
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
