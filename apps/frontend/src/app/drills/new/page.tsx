"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
import { postAPI } from "@/lib/api";

export default function NewDrillPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = (session as any)?.accessToken as string | undefined;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "TECHNICAL",
    ageGroup: "U12",
    difficulty: "MEDIUM",
    durationMin: 20,
    equipment: "",
    // jsonData fields
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

      const res = await postAPI("/drills", drillData, token);
      
      if (res.ok) {
        alert("✅ Antrenman başarıyla oluşturuldu!");
        router.push("/drills");
      } else {
        const error = await res.json();
        alert(`❌ Hata: ${error.message || 'Antrenman oluşturulamadı'}`);
      }
    } catch (error) {
      console.error("Error creating drill:", error);
      alert("❌ Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  if (status === "loading") {
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
            <CardDescription>Antrenman eklemek için giriş yapmalısınız</CardDescription>
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

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <main className="flex-1 lg:ml-64 mt-14 lg:mt-0">
          <div className="p-6 max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <Link href="/drills">
                  <Button variant="ghost" size="sm" className="gap-2 mb-2">
                    <ArrowLeft className="h-4 w-4" />
                    Geri
                  </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">
                  Yeni Antrenman Ekle
                </h1>
                <p className="text-muted-foreground mt-1">
                  Antrenman detaylarını girin ve kütüphaneye ekleyin
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Temel Bilgiler */}
              <Card>
                <CardHeader>
                  <CardTitle>Temel Bilgiler</CardTitle>
                  <CardDescription>Antrenmanın genel bilgileri</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Antrenman Adı *</Label>
                    <Input
                      id="title"
                      placeholder="Örn: Pas ve Hareket Antrenmanı"
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
                          <SelectItem value="WARM_UP">🏽 Isınma</SelectItem>
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
                        onChange={(e) => updateField("durationMin", parseInt(e.target.value))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="equipment">Ekipman</Label>
                    <Input
                      id="equipment"
                      placeholder="Örn: Top, Koni, Kaleci eldiveninden"
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
                  <CardDescription>Antrenmanın içeriği ve yapısı</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="trainingSet">Eğitim Seti</Label>
                    <Input
                      id="trainingSet"
                      placeholder="Örn: 3x10 tekrar"
                      value={formData.trainingSet}
                      onChange={(e) => updateField("trainingSet", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="techniques">Teknik</Label>
                      <Input
                        id="techniques"
                        placeholder="Örn: Pas, Kontrol"
                        value={formData.techniques}
                        onChange={(e) => updateField("techniques", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tactics">Taktikler</Label>
                      <Input
                        id="tactics"
                        placeholder="Örn: Pozisyon alma, Baskı"
                        value={formData.tactics}
                        onChange={(e) => updateField("tactics", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coordination">Koordinasyon</Label>
                    <Input
                      id="coordination"
                      placeholder="Örn: Göz-ayak koordinasyonu"
                      value={formData.coordination}
                      onChange={(e) => updateField("coordination", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organization">Organizasyon</Label>
                    <Textarea
                      id="organization"
                      placeholder="Antrenmanın organizasyon detaylarını yazın..."
                      rows={4}
                      value={formData.organization}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField("organization", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="process">İşlem</Label>
                    <Textarea
                      id="process"
                      placeholder="Antrenmanın adım adım işleyişini yazın..."
                      rows={4}
                      value={formData.process}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField("process", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="variations">Varyasyonlar</Label>
                    <Textarea
                      id="variations"
                      placeholder="Antrenmanın farklı versiyonlarını yazın..."
                      rows={3}
                      value={formData.variations}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField("variations", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tips">Uç (İpuçları)</Label>
                    <Textarea
                      id="tips"
                      placeholder="Antçı uyarıları ve ipuçlarını yazın..."
                      rows={3}
                      value={formData.tips}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField("tips", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Alan ve Katılımcı Bilgileri */}
              <Card>
                <CardHeader>
                  <CardTitle>Alan ve Katılımcı Bilgileri</CardTitle>
                  <CardDescription>Antrenman alanı ve oyuncu sayısı</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="playerCount">Oyuncu Sayısı</Label>
                      <Input
                        id="playerCount"
                        placeholder="Örn: 12 oyuncu"
                        value={formData.playerCount}
                        onChange={(e) => updateField("playerCount", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="trainingArea">Eğitim Biçimi</Label>
                      <Input
                        id="trainingArea"
                        placeholder="Örn: Grup çalışması, Takım eğitimi"
                        value={formData.trainingArea}
                        onChange={(e) => updateField("trainingArea", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Eğitim Yeri</Label>
                    <Input
                      id="location"
                      placeholder="Örn: Saha, Salon"
                      value={formData.location}
                      onChange={(e) => updateField("location", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comments">Egzersiz Yorumları</Label>
                    <Textarea
                      id="comments"
                      placeholder="Ek yorumlar ve notlar..."
                      rows={3}
                      value={formData.comments}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField("comments", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end gap-3">
                <Link href="/drills">
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
                      Antrenmanı Kaydet
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
