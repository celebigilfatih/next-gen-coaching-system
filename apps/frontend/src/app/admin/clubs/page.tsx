"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ErrorBoundary } from "@/components/error-boundary";
import { Loader2, Building2, UserPlus } from "lucide-react";
import { fetchAPI, postAPI } from "@/lib/api";

export default function AdminClubsPage() {
  const { data: session, status } = useSession();
  const token = (session as any)?.accessToken as string | undefined;
  const qc = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [name, setName] = useState("");
  const [selectedClub, setSelectedClub] = useState("");
  const [userEmail, setUserEmail] = useState("");
  
  // Tüm hooklar erken return'lerden ÖNCE çağrılmalı
  const { data: clubs, isLoading } = useQuery({
    queryKey: ["clubs"],
    queryFn: async () => {
      const res = await fetchAPI("/clubs", { token });
      if (!res.ok) throw new Error("Kulüpler yüklenemedi");
      return res.json();
    },
    enabled: !!token,
  });

  const createClub = useMutation({
    mutationFn: async () => {
      const res = await postAPI("/clubs", { name }, token);
      if (!res.ok) throw new Error("Kulüp oluşturulamadı");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clubs"] });
      setName("");
      alert("⚡ Kulüp başarıyla oluşturuldu!");
    },
  });

  async function assignUser() {
    if (!selectedClub || !userEmail) {
      alert("⚠️ Lütfen kulüp ve kullanıcı e-postası seçin");
      return;
    }
    try {
      const userRes = await fetchAPI(
        `/users/by-email?email=${encodeURIComponent(userEmail)}`,
        { token }
      );
      
      // Check if response is ok before parsing
      if (!userRes.ok) {
        alert("❌ Kullanıcı bulunamadı");
        return;
      }
      
      // Check if response has content
      const text = await userRes.text();
      if (!text) {
        alert("❌ Kullanıcı bulunamadı");
        return;
      }
      
      // Parse JSON safely
      let user;
      try {
        user = JSON.parse(text);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        alert("❌ Sunucu yanıtı okunamadı");
        return;
      }
      
      if (!user?.id) {
        alert("❌ Kullanıcı bulunamadı");
        return;
      }
      
      const res = await postAPI(`/clubs/${selectedClub}/assign`, { userId: user.id }, token);
      if (res.ok) {
        alert("✅ Kullanıcı kulübe atandı");
        setUserEmail("");
        setSelectedClub("");
      } else {
        alert("❌ Atama başarısız");
      }
    } catch (error) {
      console.error("Assign error:", error);
      alert("❌ Bir hata oluştu");
    }
  }
  
  // ERKEN RETURN'LER hookların sonrasında
  React.useEffect(() => {
    if (status === "loading") return;
    if (session && (session as any)?.role !== "ADMIN") {
      window.location.href = "/dashboard";
    }
  }, [session, status]);

  if (status === "loading") {
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
      <div className="flex min-h-screen">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <main className="flex-1 lg:ml-64 mt-14 lg:mt-0">
          <div className="p-6 space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Building2 className="h-8 w-8" />
                Kulüp Yönetimi
              </h1>
              <p className="text-muted-foreground mt-1">Kulüpleri oluşturun ve üyeleri yönetin</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Create Club Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Yeni Kulüp Oluştur</CardTitle>
                  <CardDescription>Sisteme yeni bir kulüp ekleyin</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Kulüp Adı</label>
                    <Input
                      placeholder="Örn: Galatasaray SK"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={() => createClub.mutate()}
                    disabled={!name || createClub.isPending}
                    className="w-full"
                  >
                    {createClub.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Oluşturuluyor...
                      </>
                    ) : (
                      "Kulüp Oluştur"
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Assign User Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Kulübe Üye Ekle
                  </CardTitle>
                  <CardDescription>Mevcut bir kullanıcıyı kulübe atayın</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Kulüp Seç</label>
                    <Select value={selectedClub} onValueChange={setSelectedClub}>
                      <SelectTrigger>
                        <SelectValue placeholder="Kulüp seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoading ? (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">Yükleniyor...</div>
                        ) : (clubs ?? []).length === 0 ? (
                          <SelectItem value="none" disabled>Kulüp bulunamadı</SelectItem>
                        ) : (
                          (clubs ?? []).map((c: any) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Kullanıcı E-posta</label>
                    <Input
                      type="email"
                      placeholder="kullanici@email.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={assignUser}
                    disabled={!selectedClub || !userEmail}
                    variant="secondary"
                    className="w-full"
                  >
                    Üyeyi Kulübe Ata
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Clubs List */}
            <Card>
              <CardHeader>
                <CardTitle>Tüm Kulüpler</CardTitle>
                <CardDescription>{(clubs ?? []).length} kulüp kayıtlı</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (clubs ?? []).length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Henüz kulüp eklenmemiş</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(clubs ?? []).map((c: any) => (
                      <div key={c.id} className="p-4 border rounded-lg hover:bg-accent transition-colors">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-primary" />
                          <p className="font-medium">{c.name}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">ID: {c.id.slice(0, 8)}...</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}
