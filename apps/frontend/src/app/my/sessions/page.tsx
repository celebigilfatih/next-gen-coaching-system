"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { Sidebar } from "@/components/sidebar";
import { ErrorBoundary } from "@/components/error-boundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Loader2 } from "lucide-react";
import Link from "next/link";

export default function MySessionsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();
  const token = (session as any)?.accessToken as string | undefined;
  const [plans, setPlans] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(process.env.NEXT_PUBLIC_API_URL + "/training-plans/my", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setPlans)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <main className="flex-1 lg:ml-64 mt-14 lg:mt-0">
          <div className="p-6 space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Calendar className="h-8 w-8" />
                Seanslarım
              </h1>
              <p className="text-muted-foreground mt-1">Katıldığınız antrenman seanslarını görüntüleyin</p>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : plans.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Henüz seans kaydı bulunamadı
                </CardContent>
              </Card>
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
