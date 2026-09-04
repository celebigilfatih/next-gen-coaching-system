"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Sidebar } from "@/components/sidebar";
import { ErrorBoundary } from "@/components/error-boundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { fetchAPI, putAPI } from "@/lib/api";

export default function EditDrillPage() {
  const router = useRouter();
  const params = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const id = params?.id as string;
  const { data: session, status } = useSession();
  const token = (session as any)?.accessToken as string | undefined;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "TECHNICAL",
    ageGroup: "U12",
    difficulty: "MEDIUM",
    durationMin: 20,
    equipment: "",
    trainingSet: "",
    techniques: "",
    tactics: "",
    coordination: "",
    organization: "",
    process: "",
    variations: "",
    tips: "",
    playerCount: "",
    trainingArea: "",
    location: "",
    comments: "",
  });

  const { data: drill, isLoading } = useQuery({
    queryKey: ["drill", id],
    queryFn: async () => {
      const res = await fetchAPI(`/drills/${id}`, { token });
      if (!res.ok) throw new Error("Drill bulunamadı");
      return res.json();
    },
    enabled: !!id && !!token,
  });

  useEffect(() => {
    if (drill) {
      setFormData({
        title: drill.title || "",
        category: drill.category || "TECHNICAL",
        ageGroup: drill.ageGroup || "U12",
        difficulty: drill.difficulty || "MEDIUM",
        durationMin: drill.durationMin || 20,
        equipment: drill.equipment || "",
        trainingSet: drill.jsonData?.trainingSet || "",
        techniques: drill.jsonData?.techniques || "",
        tactics: drill.jsonData?.tactics || "",
        coordination: drill.jsonData?.coordination || "",
        organization: drill.jsonData?.organization || "",
        process: drill.jsonData?.process || "",
        variations: drill.jsonData?.variations || "",
        tips: drill.jsonData?.tips || "",
        playerCount: drill.jsonData?.playerCount || "",
        trainingArea: drill.jsonData?.trainingArea || "",
        location: drill.jsonData?.location || "",
        comments: drill.jsonData?.comments || "",
      });
    }
  }, [drill]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert("⚠️ Lütfen giriş yapın");
      return;
    }

    setLoading(true);
    try {
      const drillData = {
        title: formData.title,
        category: formData.category,
        ageGroup: formData.ageGroup,
        difficulty: formData.difficulty,
        durationMin: formData.durationMin,
        equipment: formData.equipment || null,
        jsonData: {
          trainingSet: formData.trainingSet,
          techniques: formData.techniques,
          tactics: formData.tactics,
          coordination: formData.coordination,
          organization: formData.organization,
          process: formData.process,
          variations: formData.variations,
          tips: formData.tips,
          playerCount: formData.playerCount,
          trainingArea: formData.trainingArea,
          location: formData.location,
          comments: formData.comments,
        },
      };

      const res = await putAPI(`/drills/${id}`, drillData, token);
      
      if (res.ok) {
        alert("✅ Antrenman başarıyla güncellendi!");
        router.push(`/drills/${id}`);
      } else {
        const error = await res.json();
        alert(`❌ Hata: ${error.message || 'Güncelleme başarısız'}`);
      }
    } catch (error) {
      console.error("Error updating drill:", error);
      alert("❌ Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Giriş Gerekli</CardTitle>
            <CardDescription>Antrenman düzenlemek için giriş yapmalısınız</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/signin">
              <Button className="w-full">Giriş Yap</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!drill) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Antrenman Bulunamadı</CardTitle>
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

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <main className="flex-1 lg:ml-64 mt-[57px]">
          <div className="p-8 lg:p-10 max-w-4xl mx-auto space-y-8 lg:space-y-10">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <Link href={`/drills/${id}`}>
                  <Button variant="ghost" size="sm" className="gap-2 mb-2">
                    <ArrowLeft className="h-4 w-4" />
                    Geri
                  </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">
                  Antrenmanı Düzenle
                </h1>
                <p className="text-muted-foreground mt-1">
                  Antrenman detaylarını güncelleyin
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Temel Bilgiler */}
              <Card>
                <CardHeader>
                  <CardTitle>Temel Bilgiler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Antrenman Adı *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => updateField("title", e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Kategori *</Label>
                      <Select value={formData.category} onValueChange={(v) => updateField("category", v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WARM_UP">🎽 Isınma</SelectItem>
                          <SelectItem value="TECHNICAL">⚽ Teknik</SelectItem>
                          <SelectItem value="TACTICAL">🎯 Taktik</SelectItem>
                          <SelectItem value="COOL_DOWN">🧘 Soğuma</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ageGroup">Yaş Grubu *</Label>
                      <Select value={formData.ageGroup} onValueChange={(v) => updateField("ageGroup", v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["U8", "U10", "U12", "U14", "U16", "U18", "SENIOR"].map((ag) => (
                            <SelectItem key={ag} value={ag}>{ag}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Zorluk *</Label>
                      <Select value={formData.difficulty} onValueChange={(v) => updateField("difficulty", v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EASY">Kolay</SelectItem>
                          <SelectItem value="MEDIUM">Orta</SelectItem>
                          <SelectItem value="HARD">Zor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Süre (dakika) *</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        max="120"
                        value={formData.durationMin}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          updateField("durationMin", isNaN(val) ? 0 : val);
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="equipment">Ekipman</Label>
                    <Input
                      id="equipment"
                      value={formData.equipment}
                      onChange={(e) => updateField("equipment", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Antrenman Detayları */}
              <Card>
                <CardHeader>
                  <CardTitle>Antrenman Detayları</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="trainingSet">Eğitim Seti</Label>
                    <Input
                      id="trainingSet"
                      value={formData.trainingSet}
                      onChange={(e) => updateField("trainingSet", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="techniques">Teknik</Label>
                      <Input
                        id="techniques"
                        value={formData.techniques}
                        onChange={(e) => updateField("techniques", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tactics">Taktikler</Label>
                      <Input
                        id="tactics"
                        value={formData.tactics}
                        onChange={(e) => updateField("tactics", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coordination">Koordinasyon</Label>
                    <Input
                      id="coordination"
                      value={formData.coordination}
                      onChange={(e) => updateField("coordination", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organization">Organizasyon</Label>
                    <Textarea
                      id="organization"
                      rows={4}
                      value={formData.organization}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField("organization", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="process">İşlem</Label>
                    <Textarea
                      id="process"
                      rows={4}
                      value={formData.process}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField("process", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="variations">Varyasyonlar</Label>
                    <Textarea
                      id="variations"
                      rows={3}
                      value={formData.variations}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField("variations", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tips">İpuçları</Label>
                    <Textarea
                      id="tips"
                      rows={3}
                      value={formData.tips}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField("tips", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Alan ve Katılımcı */}
              <Card>
                <CardHeader>
                  <CardTitle>Alan ve Katılımcı Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="playerCount">Oyuncu Sayısı</Label>
                      <Input
                        id="playerCount"
                        value={formData.playerCount}
                        onChange={(e) => updateField("playerCount", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="trainingArea">Eğitim Biçimi</Label>
                      <Input
                        id="trainingArea"
                        value={formData.trainingArea}
                        onChange={(e) => updateField("trainingArea", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Eğitim Yeri</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => updateField("location", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comments">Yorumlar</Label>
                    <Textarea
                      id="comments"
                      rows={3}
                      value={formData.comments}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField("comments", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Submit */}
              <div className="flex justify-end gap-3">
                <Link href={`/drills/${id}`}>
                  <Button type="button" variant="outline">
                    İptal
                  </Button>
                </Link>
                <Button type="submit" disabled={loading} className="gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Değişiklikleri Kaydet
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}
