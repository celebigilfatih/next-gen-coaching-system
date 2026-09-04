"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Trophy, X } from "lucide-react";
import Link from "next/link";
import { routes } from "@/lib/routes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  club: { id: string; name: string };
  _count: { weeks: number; matches: number };
}

export default function SeasonPlannerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    clubId: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(routes.signin);
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchSeasons();
    }
  }, [status]);

  const fetchSeasons = async () => {
    try {
      const token = (session as any)?.accessToken;
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/seasons`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSeasons(response.data);
    } catch (error) {
      console.error("Error fetching seasons:", error);
    } finally {
      setLoading(false);
    }
  };

  const createSeason = async () => {
    if (!formData.name || !formData.startDate || !formData.endDate) {
      alert("Lütfen tüm alanları doldurun");
      return;
    }
    
    try {
      setCreateLoading(true);
      const token = (session as any)?.accessToken;
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/seasons`,
        {
          name: formData.name,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          clubId: formData.clubId || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowCreateDialog(false);
      setFormData({ name: "", startDate: "", endDate: "", clubId: "" });
      fetchSeasons();
    } catch (error: any) {
      console.error("Error creating season:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      alert(`Sezon oluşturulamadı: ${error.response?.data?.message || error.message}`);
    } finally {
      setCreateLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Yükleniyor...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col lg:ml-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-auto p-8 lg:p-10 bg-background mt-[57px]">
          <div className="max-w-7xl mx-auto space-y-8 lg:space-y-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Sezon Takvimi</h1>
                <p className="text-muted-foreground mt-1">
                  Haftalık antrenman ve maç planlaması yapın
                </p>
              </div>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Sezon
              </Button>
            </div>

            {seasons.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Henüz sezon oluşturulmamış</h3>
                  <p className="text-muted-foreground mb-4">
                    Haftalık takvim ile antrenmanlarınızı planlayın
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Sezon Oluştur
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {seasons.map((season) => (
                  <Card key={season.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-start justify-between">
                        <span>{season.name}</span>
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Başlangıç:</span>
                          <span className="font-medium text-foreground">
                            {new Date(season.startDate).toLocaleDateString("tr-TR")}
                          </span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span>Bitiş:</span>
                          <span className="font-medium text-foreground">
                            {new Date(season.endDate).toLocaleDateString("tr-TR")}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-orange-500" />
                          <span className="font-medium">{season._count.weeks}</span>
                          <span className="text-muted-foreground">Hafta</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="h-4 w-4 text-orange-500" />
                          <span className="font-medium">{season._count.matches}</span>
                          <span className="text-muted-foreground">Maç</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/season-planner/${season.id}`} className="flex-1">
                          <Button className="w-full" size="sm">
                            Takvimi Görüntüle
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Season Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Yeni Sezon Oluştur</CardTitle>
              <button onClick={() => setShowCreateDialog(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Sezon Adı</Label>
                <Input
                  id="name"
                  placeholder="örn: 2025/2026 Sezonu"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="startDate">Başlangıç Tarihi</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="endDate">Bitiş Tarihi</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowCreateDialog(false)} disabled={createLoading}>
                  İptal
                </Button>
                <Button className="flex-1" onClick={createSeason} disabled={createLoading}>
                  {createLoading ? "Oluşturuluyor..." : "Oluştur"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
