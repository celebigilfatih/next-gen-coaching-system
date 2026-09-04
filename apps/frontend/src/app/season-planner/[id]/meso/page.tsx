"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, X, Target } from "lucide-react";
import Link from "next/link";
import { routes } from "@/lib/routes";

interface MesoCycle {
  id: string;
  macroId: string;
  startWeek: number;
  endWeek: number;
  goal: string;
  intensityJson: {
    physical: number;
    technical: number;
    tactical: number;
  };
}

interface MacroCycle {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
}

export default function MesoCyclePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const seasonId = params.id as string;
  const [mesos, setMesos] = useState<MesoCycle[]>([]);
  const [macros, setMacros] = useState<MacroCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    macroId: "",
    startWeek: 1,
    endWeek: 4,
    goal: "",
    physical: 7,
    technical: 7,
    tactical: 7,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(routes.signin);
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && seasonId) {
      fetchData();
    }
  }, [status, seasonId]);

  const fetchData = async () => {
    try {
      const token = (session as any)?.accessToken;
      
      // Fetch season details to get mesos
      const seasonResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/seasons/${seasonId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMesos(seasonResponse.data.mesos || []);
      
      // Fetch macros for dropdown
      const macrosResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/seasons/${seasonId}/macros`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMacros(macrosResponse.data);
      
      if (macrosResponse.data.length > 0) {
        setFormData(prev => ({ ...prev, macroId: macrosResponse.data[0].id }));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const createMeso = async () => {
    if (!formData.macroId || !formData.goal || formData.startWeek > formData.endWeek) {
      alert("Lütfen tüm alanları doğru doldurun");
      return;
    }

    try {
      setCreateLoading(true);
      const token = (session as any)?.accessToken;
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/seasons/${seasonId}/meso`,
        {
          macroId: formData.macroId,
          startWeek: formData.startWeek,
          endWeek: formData.endWeek,
          goal: formData.goal,
          intensityJson: {
            physical: formData.physical,
            technical: formData.technical,
            tactical: formData.tactical,
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowCreateDialog(false);
      setFormData({
        macroId: macros[0]?.id || "",
        startWeek: 1,
        endWeek: 4,
        goal: "",
        physical: 7,
        technical: 7,
        tactical: 7,
      });
      fetchData();
    } catch (error) {
      console.error("Error creating meso:", error);
      alert("Mezo döngü oluşturulamadı");
    } finally {
      setCreateLoading(false);
    }
  };

  const getMacroTitle = (macroId: string) => {
    return macros.find(m => m.id === macroId)?.title || "Bilinmiyor";
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
        
        <main className="flex-1 overflow-auto p-6 bg-background">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href={routes.season.detail(seasonId)}>
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold">Mezo Döngüler</h1>
                  <p className="text-muted-foreground mt-1">
                    Haftalık hedefler ve yoğunlukları planlayın (2-6 haftalık döngüler)
                  </p>
                </div>
              </div>
              <Button onClick={() => setShowCreateDialog(true)} disabled={macros.length === 0}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Mezo Döngü
              </Button>
            </div>

            {macros.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Önce Makro Döngü Oluşturun</h3>
                  <p className="text-muted-foreground mb-4">
                    Mezo döngü oluşturmak için önce en az bir makro döngü gereklidir
                  </p>
                  <Link href={routes.season.macro(seasonId)}>
                    <Button>
                      Makro Döngülere Git
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : mesos.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Henüz mezo döngü oluşturulmamış</h3>
                  <p className="text-muted-foreground mb-4">
                    İlk mezo döngünüzü oluşturarak başlayın
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Mezo Döngü Oluştur
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {mesos.map((meso) => (
                  <Card key={meso.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{meso.goal}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Hafta {meso.startWeek} - {meso.endWeek} ({meso.endWeek - meso.startWeek + 1} hafta)
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Makro: {getMacroTitle(meso.macroId)}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-muted-foreground">Fiziksel Yoğunluk</span>
                            <span className="text-sm font-medium">{meso.intensityJson.physical}/10</span>
                          </div>
                          <div className="bg-secondary rounded-full h-2">
                            <div
                              className="bg-orange-500 h-2 rounded-full"
                              style={{ width: `${(meso.intensityJson.physical / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-muted-foreground">Teknik Yoğunluk</span>
                            <span className="text-sm font-medium">{meso.intensityJson.technical}/10</span>
                          </div>
                          <div className="bg-secondary rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${(meso.intensityJson.technical / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-muted-foreground">Taktik Yoğunluk</span>
                            <span className="text-sm font-medium">{meso.intensityJson.tactical}/10</span>
                          </div>
                          <div className="bg-secondary rounded-full h-2">
                            <div
                              className="bg-purple-500 h-2 rounded-full"
                              style={{ width: `${(meso.intensityJson.tactical / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Meso Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Yeni Mezo Döngü</CardTitle>
              <button onClick={() => setShowCreateDialog(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="macroId">Makro Döngü *</Label>
                <select
                  id="macroId"
                  value={formData.macroId}
                  onChange={(e) => setFormData({ ...formData, macroId: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {macros.map((macro) => (
                    <option key={macro.id} value={macro.id}>
                      {macro.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="goal">Hedef/Amaç *</Label>
                <Textarea
                  id="goal"
                  placeholder="örn: Dayanıklılık ve kuvvet gelişimi"
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  className="mt-1"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startWeek">Başlangıç Haftası</Label>
                  <Input
                    id="startWeek"
                    type="number"
                    min="1"
                    value={formData.startWeek}
                    onChange={(e) => setFormData({ ...formData, startWeek: parseInt(e.target.value) || 1 })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="endWeek">Bitiş Haftası</Label>
                  <Input
                    id="endWeek"
                    type="number"
                    min="1"
                    value={formData.endWeek}
                    onChange={(e) => setFormData({ ...formData, endWeek: parseInt(e.target.value) || 1 })}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="space-y-3 pt-2 border-t">
                <h4 className="text-sm font-medium">Yoğunluk Seviyeleri (1-10)</h4>
                
                <div>
                  <Label htmlFor="physical">Fiziksel: {formData.physical}</Label>
                  <Input
                    id="physical"
                    type="range"
                    min="1"
                    max="10"
                    value={formData.physical}
                    onChange={(e) => setFormData({ ...formData, physical: parseInt(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="technical">Teknik: {formData.technical}</Label>
                  <Input
                    id="technical"
                    type="range"
                    min="1"
                    max="10"
                    value={formData.technical}
                    onChange={(e) => setFormData({ ...formData, technical: parseInt(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="tactical">Taktik: {formData.tactical}</Label>
                  <Input
                    id="tactical"
                    type="range"
                    min="1"
                    max="10"
                    value={formData.tactical}
                    onChange={(e) => setFormData({ ...formData, tactical: parseInt(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowCreateDialog(false)} disabled={createLoading}>
                  İptal
                </Button>
                <Button className="flex-1" onClick={createMeso} disabled={createLoading}>
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
