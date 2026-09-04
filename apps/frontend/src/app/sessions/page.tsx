"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { Sidebar } from "@/components/sidebar";
import { ErrorBoundary } from "@/components/error-boundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Loader2 } from "lucide-react";
import Link from "next/link";
import { fetchAPI } from "@/lib/api";

export default function SessionsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();
  const token = (session as any)?.accessToken as string | undefined;
  const [clubId, setClubId] = React.useState("");
  const [plans, setPlans] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [clubs, setClubs] = React.useState<any[]>([]);
  React.useEffect(() => {
    if (!token) return;
    fetchAPI("/clubs", { token })
      .then((r) => r.json())
      .then(setClubs)
      .catch(console.error);
  }, [token]);

  async function loadPlans() {
    if (!token) return;
    setLoading(true);
    try {
      const url = new URL(process.env.NEXT_PUBLIC_API_URL + "/training-plans");
      if (clubId) url.searchParams.set("clubId", clubId);
      const res = await fetchAPI(`/training-plans${clubId ? `?clubId=${clubId}` : ""}`, { token });
      const data = await res.json();
      setPlans(data);
    } catch (error) {
      console.error("Failed to load plans:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <main className="flex-1 lg:ml-64 mt-14 lg:mt-0">
          <div className="p-6 space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Calendar className="h-8 w-8" />
                Antrenman Seansları
              </h1>
              <p className="text-muted-foreground mt-1">Tüm antrenman seanslarını görüntüleyin ve yönetin</p>
            </div>
            <div className="flex gap-3 items-center">
              <Select value={clubId || "all"} onValueChange={(v) => setClubId(v === "all" ? "" : v)}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Tüm Kulüpler" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kulüpler</SelectItem>
                  {clubs.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={loadPlans} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Yükleniyor...
                  </>
                ) : (
                  "Seansları Yükle"
                )}
              </Button>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plans.map((p) => {
                  const present = (p.attendance ?? []).filter((a: any) => a.status === "PRESENT").length;
                  const absent = (p.attendance ?? []).filter((a: any) => a.status === "ABSENT").length;
                  return (
                    <Card key={p.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{p.title}</CardTitle>
                            <CardDescription>
                              Tarih: {p.date ? new Date(p.date).toLocaleDateString("tr-TR") : "-"} · Süre: {p.totalDuration ?? 0} dk
                            </CardDescription>
                          </div>
                          <Link href={`/plans/${p.id}/print`}>
                            <Button variant="outline" size="sm">
                              Yazdır
                            </Button>
                          </Link>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground">
                          Yoklama: {present} katıldı / {absent} katılmadı
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}
