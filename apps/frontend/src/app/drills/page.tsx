"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { ErrorBoundary } from "@/components/error-boundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Library, Plus } from "lucide-react";
import Link from "next/link";

function useDrills(params: { category?: string; ageGroup?: string; difficulty?: string }) {
  return useQuery({
    queryKey: ["drills", params],
    queryFn: async () => {
      const url = new URL(process.env.NEXT_PUBLIC_API_URL + "/drills");
      Object.entries(params).forEach(([k, v]) => {
        if (v) url.searchParams.set(k, v);
      });
      const res = await fetch(url.toString());
      return res.json();
    },
  });
}

export default function DrillLibraryPage() {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [category, setCategory] = useState<string | undefined>();
  const [ageGroup, setAgeGroup] = useState<string | undefined>();
  const [difficulty, setDifficulty] = useState<string | undefined>();
  const { data, isLoading } = useDrills({ category, ageGroup, difficulty });

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 lg:ml-64">
          <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="mt-[57px]">
            <div className="p-8 lg:p-10 space-y-8 lg:space-y-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-50 rounded-full border border-slate-100 shadow-sm">
                  <Library className="h-6 w-6 text-slate-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">Antrenman Kütüphanesi</h1>
                  <p className="text-sm font-medium text-slate-500 mt-1">
                    Kategoriye, yaş grubuna ve zorluk seviyesine göre antrenmanları inceleyin
                  </p>
                </div>
              </div>
              {session && (
                <Link href="/drills/new">
                  <Button size="sm" className="h-9 rounded-lg text-xs font-bold px-4 gap-2">
                    <Plus className="h-4 w-4" />
                    Antrenman Ekle
                  </Button>
                </Link>
              )}
            </div>
            <div className="flex gap-3">
              <Select value={category ?? "all"} onValueChange={(v) => setCategory(v === "all" ? undefined : v)}>
                <SelectTrigger className="w-[200px] h-10 rounded-lg border-slate-200 text-sm font-medium">
                  <SelectValue placeholder="Tüm Kategoriler" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kategoriler</SelectItem>
                  <SelectItem value="WARM_UP">Isınma</SelectItem>
                  <SelectItem value="TECHNICAL">Teknik</SelectItem>
                  <SelectItem value="TACTICAL">Taktik</SelectItem>
                  <SelectItem value="COOL_DOWN">Soğuma</SelectItem>
                </SelectContent>
              </Select>
              <Select value={ageGroup ?? "all"} onValueChange={(v) => setAgeGroup(v === "all" ? undefined : v)}>
                <SelectTrigger className="w-[200px] h-10 rounded-lg border-slate-200 text-sm font-medium">
                  <SelectValue placeholder="Tüm Yaş Grupları" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Yaş Grupları</SelectItem>
                  {["U8", "U10", "U12", "U14", "U16", "U18", "SENIOR"].map((ag) => (
                    <SelectItem key={ag} value={ag}>
                      {ag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={difficulty ?? "all"} onValueChange={(v) => setDifficulty(v === "all" ? undefined : v)}>
                <SelectTrigger className="w-[200px] h-10 rounded-lg border-slate-200 text-sm font-medium">
                  <SelectValue placeholder="Tüm Zorluklar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Zorluklar</SelectItem>
                  <SelectItem value="EASY">Kolay</SelectItem>
                  <SelectItem value="MEDIUM">Orta</SelectItem>
                  <SelectItem value="HARD">Zor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-10 w-10 animate-spin text-slate-300" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(data ?? []).length === 0 ? (
                  <div className="col-span-full text-center py-16">
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-full inline-flex mb-4">
                      <Library className="h-10 w-10 text-slate-300" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">Henüz antrenman bulunamadı</p>
                    <p className="text-xs font-medium text-slate-500 mt-1">Filtreleri değiştirmeyi deneyin</p>
                  </div>
                ) : (
                  (data ?? []).map((d: any) => (
                    <Link key={d.id} href={`/drills/${d.id}`}>
                      <Card className="rounded-xl shadow-sm border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all cursor-pointer h-full overflow-hidden group">
                        <CardHeader className="p-6 border-b border-slate-100 bg-slate-50/30">
                          <CardTitle className="text-base font-bold text-slate-900 tracking-tight group-hover:text-primary transition-colors">{d.title}</CardTitle>
                          <CardDescription className="text-xs font-medium text-slate-500 mt-1">
                            {d.category === 'WARM_UP' && '🎽 Isınma'}
                            {d.category === 'TECHNICAL' && '⚽ Teknik'}
                            {d.category === 'TACTICAL' && '🎯 Taktik'}
                            {d.category === 'COOL_DOWN' && '🧘 Soğuma'}
                            <span className="mx-1.5 text-slate-300">·</span>
                            {d.ageGroup}
                            <span className="mx-1.5 text-slate-300">·</span>
                            {d.difficulty === 'EASY' && <span className="text-emerald-600 font-bold">Kolay</span>}
                            {d.difficulty === 'MEDIUM' && <span className="text-amber-600 font-bold">Orta</span>}
                            {d.difficulty === 'HARD' && <span className="text-rose-600 font-bold">Zor</span>}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Süre</span>
                            <span className="font-bold text-slate-900">{d.durationMin} dk</span>
                          </div>
                          {d.equipment && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ekipman</span>
                              <span className="font-medium text-slate-600">{d.equipment}</span>
                            </div>
                          )}
                          {d.jsonData?.description && (
                            <p className="text-sm text-slate-500 line-clamp-2">
                              {d.jsonData.description}
                            </p>
                          )}
                          {d.jsonData?.purpose && (
                            <div className="text-xs font-medium text-slate-600 bg-slate-50 border border-slate-100 p-3 rounded-lg">
                              <span className="font-bold text-slate-900">🎯 Amaç:</span> {d.jsonData.purpose}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                )}
              </div>
            )}
            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
