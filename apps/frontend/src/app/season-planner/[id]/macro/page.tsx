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
import { ArrowLeft, Plus, X, TrendingUp } from "lucide-react";
import Link from "next/link";
import { routes } from "@/lib/routes";

interface MacroCycle {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  type: string;
  intensity: number;
  notes?: string;
}

export default function MacroCyclePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const seasonId = params.id as string;
  const [macros, setMacros] = useState<MacroCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    startDate: "",
    endDate: "",
    type: "PRE_SEASON",
    intensity: 5,
    notes: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(routes.signin);
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && seasonId) {
      fetchMacros();
    }
  }, [status, seasonId]);

  const fetchMacros = async () => {
    try {
      const token = (session as any)?.accessToken;
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/seasons/${seasonId}/macros`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMacros(response.data);
    } catch (error) {
      console.error("Error fetching macros:", error);
    } finally {
      setLoading(false);
    }
  };

  const createMacro = async () => {
    if (!formData.title || !formData.startDate || !formData.endDate) {
      alert("Lütfen tüm zorunlu alanları doldurun");
      return;
    }

    try {
      setCreateLoading(true);
      const token = (session as any)?.accessToken;
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/seasons/${seasonId}/macros`,
        {
          title: formData.title,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          type: formData.type,
          intensity: formData.intensity,
          notes: formData.notes || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowCreateDialog(false);
      setFormData({
        title: "",
        startDate: "",
        endDate: "",
        type: "PRE_SEASON",
        intensity: 5,
        notes: "",
      });
      fetchMacros();
    } catch (error) {
      console.error("Error creating macro:", error);
      alert("Makro döngü oluşturulamadı");
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
                  <h1 className="text-3xl font-bold">Makro Döngüler</h1>
                  <p className="text-muted-foreground mt-1">
                    Sezon dönemlerini ve yoğunluklarını planlayın
                  </p>
                </div>
              </div>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Makro Döngü
              </Button>
            </div>

            {macros.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Henüz makro döngü oluşturulmamış</h3>
                  <p className="text-muted-foreground mb-4">
                    İlk makro döngünüzü oluşturarak başlayın
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Makro Döngü Oluştur
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {macros.map((macro) => (
                  <Card key={macro.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{macro.title}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(macro.startDate).toLocaleDateString("tr-TR")} - {new Date(macro.endDate).toLocaleDateString("tr-TR")}
                          </p>
                        </div>
                        <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                          {macro.type}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Yoğunluk:</span>
                          <div className="flex-1 bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${(macro.intensity / 10) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{macro.intensity}/10</span>
                        </div>
                        {macro.notes && (
                          <p className="text-sm text-muted-foreground">{macro.notes}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Macro Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Yeni Makro Döngü</CardTitle>
              <button onClick={() => setShowCreateDialog(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Döngü Adı *</Label>
                <Input
                  id="title"
                  placeholder="örn: Hazırlık Dönemi"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="type">Dönem Tipi</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="PRE_SEASON">Hazırlık Dönemi</option>
                  <option value="IN_SEASON">Lig Sezonu</option>
                  <option value="POST_SEASON">Sezon Sonu</option>
                </select>
              </div>
              <div>
                <Label htmlFor="startDate">Başlangıç Tarihi *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="endDate">Bitiş Tarihi *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="intensity">Yoğunluk (1-10): {formData.intensity}</Label>
                <Input
                  id="intensity"
                  type="range"
                  min="1"
                  max="10"
                  value={formData.intensity}
                  onChange={(e) => setFormData({ ...formData, intensity: parseInt(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notlar</Label>
                <Textarea
                  id="notes"
                  placeholder="Dönem hakkında notlar..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowCreateDialog(false)} disabled={createLoading}>
                  İptal
                </Button>
                <Button className="flex-1" onClick={createMacro} disabled={createLoading}>
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
