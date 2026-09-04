"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Award,
  Target,
  TrendingUp,
  Activity,
  FileText,
  Clock,
  Plus,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { fetchAPI, postAPI, deleteAPI } from "@/lib/api";
import { HealthLogTimelineItem } from "@/components/health-log-timeline-item";

export default function PlayerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = params?.teamId as string;
  const playerId = params?.playerId as string;
  const { data: session } = useSession();
  const token = (session as any)?.accessToken as string | undefined;
  const qc = useQueryClient();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showHealthForm, setShowHealthForm] = useState(false);
  const [showNotesForm, setShowNotesForm] = useState(false);
  const [newCoachNote, setNewCoachNote] = useState("");

  const [newPrimaryStatus, setNewPrimaryStatus] = useState("SAGLIKLI");
  const [newInjuryType, setNewInjuryType] = useState("");
  const [newMuscleSubtype, setNewMuscleSubtype] = useState("");
  const [newLigamentSubtype, setNewLigamentSubtype] = useState("");
  const [newTendonSubtype, setNewTendonSubtype] = useState("");
  const [newBoneSubtype, setNewBoneSubtype] = useState("");
  const [newBodyPart, setNewBodyPart] = useState("");
  const [newRehabPhase, setNewRehabPhase] = useState("");
  const [newTrainingParticipation, setNewTrainingParticipation] = useState("");
  const [newEstimatedReturnDays, setNewEstimatedReturnDays] = useState("");
  const [newClinicalNotes, setNewClinicalNotes] = useState("");

  const { data: player, isLoading: playerLoading } = useQuery({
    queryKey: ["player", playerId],
    queryFn: async () => {
      const res = await fetchAPI(`/users/${playerId}`, { token });
      if (!res.ok) throw new Error("Oyuncu bulunamadı");
      return res.json();
    },
    enabled: !!playerId && !!token,
  });

  const { data: team } = useQuery({
    queryKey: ["team", teamId],
    queryFn: async () => {
      const res = await fetchAPI(`/groups/${teamId}`, { token });
      if (!res.ok) throw new Error("Takım bulunamadı");
      return res.json();
    },
    enabled: !!teamId && !!token,
  });

  const { data: healthLogs, isLoading: healthLogsLoading } = useQuery({
    queryKey: ["healthLogs", playerId],
    queryFn: async () => {
      const res = await fetchAPI(`/users/${playerId}/health-status`, { token });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!playerId && !!token,
  });

  const { data: coachNotes, isLoading: coachNotesLoading } = useQuery({
    queryKey: ["coachNotes", playerId],
    queryFn: async () => {
      const res = await fetchAPI(`/users/${playerId}/coach-notes`, { token });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!playerId && !!token,
  });

  const addHealthLog = useMutation({
    mutationFn: async () => {
      const data = {
        primaryStatus: newPrimaryStatus,
        injuryType: newInjuryType || null,
        muscleInjurySubtype: newMuscleSubtype || null,
        ligamentInjurySubtype: newLigamentSubtype || null,
        tendonInjurySubtype: newTendonSubtype || null,
        boneInjurySubtype: newBoneSubtype || null,
        bodyPart: newBodyPart || null,
        rehabPhase: newRehabPhase || null,
        trainingParticipation: newTrainingParticipation || null,
        estimatedReturnDays: newEstimatedReturnDays || null,
        clinicalNotes: newClinicalNotes || null,
      };
      const res = await postAPI(`/users/${playerId}/health-status`, data, token!);
      if (!res.ok) throw new Error("Sağlık durumu eklenemedi");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["healthLogs", playerId] });
      setShowHealthForm(false);
      setNewPrimaryStatus("SAGLIKLI");
      setNewInjuryType("");
      setNewMuscleSubtype("");
      setNewLigamentSubtype("");
      setNewTendonSubtype("");
      setNewBoneSubtype("");
      setNewBodyPart("");
      setNewRehabPhase("");
      setNewTrainingParticipation("");
      setNewEstimatedReturnDays("");
      setNewClinicalNotes("");
    },
  });

  const addCoachNote = useMutation({
    mutationFn: async () => {
      const res = await postAPI(`/users/${playerId}/coach-notes`, { note: newCoachNote }, token!);
      if (!res.ok) throw new Error("Koç notu eklenemedi");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coachNotes", playerId] });
      setShowNotesForm(false);
      setNewCoachNote("");
    },
  });

  const deleteCoachNote = useMutation({
    mutationFn: async (noteId: string) => {
      const res = await deleteAPI(`/users/${playerId}/coach-notes/${noteId}`, token!);
      if (!res.ok) throw new Error("Koç notu silinemedi");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coachNotes", playerId] });
    },
  });

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case "SAGLIKLI":
        return "bg-green-50 text-green-700 border-green-200";
      case "YUK_KONTROLLU":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "HAFIF_SAKATILIK":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "ORTA_SAKATILIK":
        return "bg-red-50 text-red-700 border-red-200";
      case "CIDDI_SAKATILIK":
        return "bg-red-100 text-red-800 border-red-300";
      case "REHABILITASYON":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "TEDAVI_ALTINDA":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";
      case "MAC_ANTRENMAN_DISI":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "KARANTINA_IZOLASYON":
        return "bg-gray-50 text-gray-700 border-gray-200";
      case "HASTALIK":
        return "bg-red-50 text-red-700 border-red-200";
      case "YARALI":
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getHealthStatusLabel = (status: string) => {
    switch (status) {
      case "SAGLIKLI":
        return "Sağlıklı";
      case "YUK_KONTROLLU":
        return "Yük Kontrollü";
      case "HAFIF_SAKATILIK":
        return "Hafif Sakatlık";
      case "ORTA_SAKATILIK":
        return "Orta Sakatlık";
      case "CIDDI_SAKATILIK":
        return "Ciddi Sakatlık";
      case "REHABILITASYON":
        return "Rehabilitasyon";
      case "TEDAVI_ALTINDA":
        return "Tedavi Altında";
      case "MAC_ANTRENMAN_DISI":
        return "Maç/Antrenman Dışı";
      case "KARANTINA_IZOLASYON":
        return "Karantina";
      case "HASTALIK":
        return "Hastalık";
      case "YARALI":
        return "Yaralı";
      default:
        return status;
    }
  };

  const getTrainingParticipationLabel = (status: string) => {
    switch (status) {
      case "FULL":
        return "Tam Katılım";
      case "PARTIAL":
        return "Kısmi Katılım";
      case "NONE":
        return "Katılmadı";
      default:
        return status;
    }
  };

  if (playerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 lg:ml-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 md:p-6 lg:p-8">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">{player?.name || "Oyuncu"}</h1>
                <p className="text-sm text-muted-foreground">
                  {team?.name || "Takım Bilgisi Yok"}
                </p>
              </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
                <TabsTrigger value="health">Sağlık</TabsTrigger>
                <TabsTrigger value="performance">Performans</TabsTrigger>
                <TabsTrigger value="notes">Notlar</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-4 xl:col-span-3 space-y-6">
                    <Card className="rounded-md shadow-sm border border-muted">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                          <User className="w-4 h-4 text-muted-foreground" />
                          Profil
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-center">
                          <Avatar className="h-20 w-20">
                            <AvatarImage src={player?.avatar} alt={player?.name} />
                            <AvatarFallback className="text-lg bg-muted">
                              {player?.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="text-center space-y-1">
                          <p className="font-medium">{player?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {player?.position || "Pozisyon Belirtilmemiş"}
                          </p>
                        </div>
                        <Separator />
                        <div className="space-y-2 text-sm">
                          {player?.phone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="w-4 h-4" />
                              <span>{player.phone}</span>
                            </div>
                          )}
                          {player?.email && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="w-4 h-4" />
                              <span className="truncate">{player.email}</span>
                            </div>
                          )}
                          {player?.birthDate && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(player.birthDate).toLocaleDateString("tr-TR")}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="rounded-md shadow-sm border border-muted">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                          <Activity className="w-4 h-4 text-muted-foreground" />
                          Sağlık Durumu
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {healthLogs && healthLogs.length > 0 ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge className={getHealthStatusColor(healthLogs[0].primaryStatus)}>
                                {getHealthStatusLabel(healthLogs[0].primaryStatus)}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(healthLogs[0].createdAt).toLocaleDateString("tr-TR")}
                            </span>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Kayıt bulunamadı</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="rounded-md shadow-sm border border-muted">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted">
                              <TrendingUp className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-lg font-semibold">95%</p>
                              <p className="text-xs text-muted-foreground">Katılım</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="rounded-md shadow-sm border border-muted">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted">
                              <Target className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-lg font-semibold">12</p>
                              <p className="text-xs text-muted-foreground">Maç</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="rounded-md shadow-sm border border-muted">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted">
                              <Activity className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-lg font-semibold">8.5</p>
                              <p className="text-xs text-muted-foreground">Performans</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="rounded-md shadow-sm border border-muted">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted">
                              <Award className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-lg font-semibold">3</p>
                              <p className="text-xs text-muted-foreground">Gol/Asist</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="rounded-md shadow-sm border border-muted md:col-span-2 lg:col-span-3">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                          <Award className="w-4 h-4 text-muted-foreground" />
                          Sezon Özeti
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <Card className="rounded-md shadow-sm border border-muted bg-muted/30">
                            <CardContent className="p-4 text-center">
                              <p className="text-lg font-semibold">19</p>
                              <p className="text-xs text-muted-foreground">Toplam Maç</p>
                            </CardContent>
                          </Card>
                          <Card className="rounded-md shadow-sm border border-muted bg-muted/30">
                            <CardContent className="p-4 text-center">
                              <p className="text-lg font-semibold">1,450</p>
                              <p className="text-xs text-muted-foreground">Toplam Dakika</p>
                            </CardContent>
                          </Card>
                          <Card className="rounded-md shadow-sm border border-muted bg-muted/30">
                            <CardContent className="p-4 text-center">
                              <p className="text-lg font-semibold">3</p>
                              <p className="text-xs text-muted-foreground">Gol</p>
                            </CardContent>
                          </Card>
                          <Card className="rounded-md shadow-sm border border-muted bg-muted/30">
                            <CardContent className="p-4 text-center">
                              <p className="text-lg font-semibold">2</p>
                              <p className="text-xs text-muted-foreground">Sarı Kart</p>
                            </CardContent>
                          </Card>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="health" className="mt-6">
                <Card className="rounded-md shadow-sm border border-muted">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-muted-foreground" />
                      <CardTitle className="text-sm font-semibold">Sağlık Durumu Geçmişi</CardTitle>
                    </div>
                    <Button size="sm" onClick={() => setShowHealthForm(!showHealthForm)}>
                      <Plus className="w-4 h-4 mr-1" />
                      Ekle
                    </Button>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    {showHealthForm && (
                      <Card className="rounded-md shadow-sm border border-muted bg-muted/50">
                        <CardContent className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
                          <div className="space-y-2">
                            <Label className="text-xs font-medium">Durum Kategorisi *</Label>
                            <Select value={newPrimaryStatus} onValueChange={(v) => setNewPrimaryStatus(v)}>
                              <SelectTrigger className="h-9 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="SAGLIKLI">Sağlıklı</SelectItem>
                                <SelectItem value="YUK_KONTROLLU">Yük Kontrollü / İzleniyor</SelectItem>
                                <SelectItem value="HAFIF_SAKATILIK">Hafif Sakatlık</SelectItem>
                                <SelectItem value="ORTA_SAKATILIK">Orta Seviye Sakatlık</SelectItem>
                                <SelectItem value="CIDDI_SAKATILIK">Ciddi Sakatlık</SelectItem>
                                <SelectItem value="REHABILITASYON">Rehabilitasyon Sürecinde</SelectItem>
                                <SelectItem value="TEDAVI_ALTINDA">Tedavi Altında</SelectItem>
                                <SelectItem value="MAC_ANTRENMAN_DISI">Maç / Antrenman Dışı</SelectItem>
                                <SelectItem value="KARANTINA_IZOLASYON">Karantina / İzolasyon</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {["HAFIF_SAKATILIK", "ORTA_SAKATILIK", "CIDDI_SAKATILIK"].includes(newPrimaryStatus) && (
                            <>
                              <div className="space-y-2">
                                <Label className="text-xs font-medium">Sakatlık Türü</Label>
                                <Select
                                  value={newInjuryType}
                                  onValueChange={(v) => {
                                    setNewInjuryType(v);
                                    setNewMuscleSubtype("");
                                    setNewLigamentSubtype("");
                                    setNewTendonSubtype("");
                                    setNewBoneSubtype("");
                                  }}
                                >
                                  <SelectTrigger className="h-9 text-sm">
                                    <SelectValue placeholder="Seçiniz" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="MUSCLE">Kas Sakatlıkları</SelectItem>
                                    <SelectItem value="LIGAMENT">Bağ & Eklem Sakatlıkları</SelectItem>
                                    <SelectItem value="TENDON">Tendon Sakatlıkları</SelectItem>
                                    <SelectItem value="BONE">Kemik & Travmatik</SelectItem>
                                    <SelectItem value="OTHER">Diğer</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {newInjuryType === "MUSCLE" && (
                                <div className="space-y-2">
                                  <Label className="text-xs font-medium">Kas Sakatlığı Türü</Label>
                                  <Select value={newMuscleSubtype} onValueChange={setNewMuscleSubtype}>
                                    <SelectTrigger className="h-9 text-sm">
                                      <SelectValue placeholder="Seçiniz" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="ADALE_ZORLENMASI">Adale Zorlanması</SelectItem>
                                      <SelectItem value="KAS_YIRTIGI_GRADE1">Kas Yırtığı (Grade 1)</SelectItem>
                                      <SelectItem value="KAS_YIRTIGI_GRADE2">Kas Yırtığı (Grade 2)</SelectItem>
                                      <SelectItem value="KAS_YIRTIGI_GRADE3">Kas Yırtığı (Grade 3)</SelectItem>
                                      <SelectItem value="KAS_SERTLIGI_SPAZM">Kas Sertliği / Spazm</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}

                              {newInjuryType === "LIGAMENT" && (
                                <div className="space-y-2">
                                  <Label className="text-xs font-medium">Bağ/Eklem Sakatlığı Türü</Label>
                                  <Select value={newLigamentSubtype} onValueChange={setNewLigamentSubtype}>
                                    <SelectTrigger className="h-9 text-sm">
                                      <SelectValue placeholder="Seçiniz" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="ACL">Ön Çapraz Bağ (ACL)</SelectItem>
                                      <SelectItem value="PCL">Arka Çapraz Bağ (PCL)</SelectItem>
                                      <SelectItem value="MCL">İç Yan Bağ (MCL)</SelectItem>
                                      <SelectItem value="LCL">Dış Yan Bağ (LCL)</SelectItem>
                                      <SelectItem value="MENISKUS">Menisküs</SelectItem>
                                      <SelectItem value="AYAK_BILEGI_BURKULMASI">Ayak Bileği Burkulması</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}

                              {newInjuryType === "TENDON" && (
                                <div className="space-y-2">
                                  <Label className="text-xs font-medium">Tendon Sakatlığı Türü</Label>
                                  <Select value={newTendonSubtype} onValueChange={setNewTendonSubtype}>
                                    <SelectTrigger className="h-9 text-sm">
                                      <SelectValue placeholder="Seçiniz" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="AKILLES">Aşil Tendon</SelectItem>
                                      <SelectItem value="PATELLA">Patellar Tendon</SelectItem>
                                      <SelectItem value="QUADRICEPS">Quadriceps Tendon</SelectItem>
                                      <SelectItem value="TENNIS_ELBOW">Tenisçi Dirseği</SelectItem>
                                      <SelectItem value="GOLECI_ELBOW">Kaleci Dirseği</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}

                              {newInjuryType === "BONE" && (
                                <div className="space-y-2">
                                  <Label className="text-xs font-medium">Kemik/Travmatik Türü</Label>
                                  <Select value={newBoneSubtype} onValueChange={setNewBoneSubtype}>
                                    <SelectTrigger className="h-9 text-sm">
                                      <SelectValue placeholder="Seçiniz" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="KIRIK">Kırık</SelectItem>
                                      <SelectItem value="CHIPPED_FRAGMENT">Kırık Parça</SelectItem>
                                      <SelectItem value="STRESS_FRESSURE">Stres Kırığı / Basınç</SelectItem>
                                      <SelectItem value="CONTUSION">Kontüzyon / Çürük</SelectItem>
                                      <SelectItem value="OSTEOCHONDRAL">Osteokondral Lezyon</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </>
                          )}

                          {["HAFIF_SAKATILIK", "ORTA_SAKATILIK", "CIDDI_SAKATILIK", "REHABILITASYON", "TEDAVI_ALTINDA"].includes(newPrimaryStatus) && (
                            <div className="space-y-2">
                              <Label className="text-xs font-medium">Vücut Bölgesi</Label>
                              <Select value={newBodyPart} onValueChange={setNewBodyPart}>
                                <SelectTrigger className="h-9 text-sm">
                                  <SelectValue placeholder="Seçiniz" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="BAS">Baş</SelectItem>
                                  <SelectItem value="BOYUN">Boyun</SelectItem>
                                  <SelectItem value="OMUZ">Omuz</SelectItem>
                                  <SelectItem value="KOL">Kol</SelectItem>
                                  <SelectItem value="DIRSEK">Dirsek</SelectItem>
                                  <SelectItem value="ÖN KOL">Ön Kol</SelectItem>
                                  <SelectItem value="BILEK">Bilek</SelectItem>
                                  <SelectItem value="EL">El</SelectItem>
                                  <SelectItem value="GÖĞÜS">Göğüs</SelectItem>
                                  <SelectItem value="KARIN">Karın</SelectItem>
                                  <SelectItem value="BEL">Bel</SelectItem>
                                  <SelectItem value="KALÇA">Kalça</SelectItem>
                                  <SelectItem value="UYLUK">Uyluk</SelectItem>
                                  <SelectItem value="DIZ">Diz</SelectItem>
                                  <SelectItem value="ALT BACAK">Alt Bacak</SelectItem>
                                  <SelectItem value="AYAK BİLEĞİ">Ayak Bileği</SelectItem>
                                  <SelectItem value="AYAK">Ayak</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {["REHABILITASYON", "TEDAVI_ALTINDA"].includes(newPrimaryStatus) && (
                            <div className="space-y-2">
                              <Label className="text-xs font-medium">Rehabilitasyon Fazı</Label>
                              <Select value={newRehabPhase} onValueChange={setNewRehabPhase}>
                                <SelectTrigger className="h-9 text-sm">
                                  <SelectValue placeholder="Seçiniz" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="AKUT_FAZ">Akut Faz (İlk 48 saat)</SelectItem>
                                  <SelectItem value="PROGRESIF_FAZ">Progresif Yüklenme Fazı</SelectItem>
                                  <SelectItem value="FONKSIYONEL_FAZ">Fonksiyonel Faz</SelectItem>
                                  <SelectItem value="SPORYA_DÖNÜŞ">Spora Dönüş Hazırlığı</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {["HAFIF_SAKATILIK", "ORTA_SAKATILIK", "CIDDI_SAKATILIK", "REHABILITASYON", "YUK_KONTROLLU"].includes(newPrimaryStatus) && (
                            <div className="space-y-2">
                              <Label className="text-xs font-medium">Antrenmana Katılım</Label>
                              <Select value={newTrainingParticipation} onValueChange={setNewTrainingParticipation}>
                                <SelectTrigger className="h-9 text-sm">
                                  <SelectValue placeholder="Seçiniz" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="FULL">Tam Katılım</SelectItem>
                                  <SelectItem value="PARTIAL">Kısmi Katılım</SelectItem>
                                  <SelectItem value="NONE">Katılmadı</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {["HAFIF_SAKATILIK", "ORTA_SAKATILIK", "CIDDI_SAKATILIK", "REHABILITASYON"].includes(newPrimaryStatus) && (
                            <div className="space-y-2">
                              <Label className="text-xs font-medium">Tahmini Dönüş</Label>
                              <Select value={newEstimatedReturnDays} onValueChange={setNewEstimatedReturnDays}>
                                <SelectTrigger className="h-9 text-sm">
                                  <SelectValue placeholder="Seçiniz" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="DAYS_3_5">3–5 Gün</SelectItem>
                                  <SelectItem value="DAYS_7">1 Hafta</SelectItem>
                                  <SelectItem value="DAYS_14">2 Hafta</SelectItem>
                                  <SelectItem value="DAYS_21_28">3–4 Hafta</SelectItem>
                                  <SelectItem value="DAYS_30_90">1–3 Ay</SelectItem>
                                  <SelectItem value="DAYS_90_PLUS">3+ Ay</SelectItem>
                                  <SelectItem value="BELIRSIZ">Belirsiz</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          <div className="space-y-2">
                            <Label className="text-xs font-medium">Doktor / Fizyoterapist Notu</Label>
                            <Textarea
                              placeholder="MR sonucu, doktor önerisi, yüklenme limiti, risk notları..."
                              value={newClinicalNotes}
                              onChange={(e) => setNewClinicalNotes(e.target.value)}
                              className="resize-none h-16 text-sm"
                            />
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button size="sm" onClick={() => addHealthLog.mutate()} disabled={addHealthLog.isPending}>
                              {addHealthLog.isPending ? "Ekleniyor..." : "Kaydet"}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setShowHealthForm(false)}>
                              İptal
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Geçmiş Kayıtlar
                      </h3>
                      {healthLogsLoading && (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                        </div>
                      )}
                      {!healthLogsLoading && healthLogs && healthLogs.length > 0 && (
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                          {[...healthLogs].reverse().map((log: any, index: number) => (
                            <HealthLogTimelineItem
                              key={log.id}
                              log={log}
                              index={index}
                              totalLogs={healthLogs.length}
                              getHealthStatusColor={getHealthStatusColor}
                              getHealthStatusLabel={getHealthStatusLabel}
                            />
                          ))}
                        </div>
                      )}
                      {!healthLogsLoading && (!healthLogs || healthLogs.length === 0) && (
                        <p className="text-sm text-muted-foreground text-center py-4">Henüz sağlık kaydı yok</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="mt-6">
                <Card className="rounded-md shadow-sm border border-muted">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      Performans Analizi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="rounded-md shadow-sm border border-muted bg-muted/30">
                        <CardContent className="p-4 space-y-2">
                          <p className="text-xs text-muted-foreground">Haftalık Antrenman Yükü</p>
                          <div className="flex items-center gap-2">
                            <Progress value={75} className="flex-1 h-2" />
                            <span className="text-sm font-medium">75%</span>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="rounded-md shadow-sm border border-muted bg-muted/30">
                        <CardContent className="p-4 space-y-2">
                          <p className="text-xs text-muted-foreground">Maç Katılımı</p>
                          <div className="flex items-center gap-2">
                            <Progress value={85} className="flex-1 h-2" />
                            <span className="text-sm font-medium">85%</span>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="rounded-md shadow-sm border border-muted bg-muted/30">
                        <CardContent className="p-4 space-y-2">
                          <p className="text-xs text-muted-foreground">Performans Trendi</p>
                          <div className="flex items-center gap-2">
                            <Progress value={90} className="flex-1 h-2" />
                            <span className="text-sm font-medium">90%</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="mt-6">
                <Card className="rounded-md shadow-sm border border-muted">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <CardTitle className="text-sm font-semibold">Koç Notları</CardTitle>
                    </div>
                    <Button size="sm" onClick={() => setShowNotesForm(!showNotesForm)}>
                      <Plus className="w-4 h-4 mr-1" />
                      Ekle
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {showNotesForm && (
                      <Card className="rounded-md shadow-sm border border-muted bg-muted/50">
                        <CardContent className="p-4 space-y-3">
                          <div className="space-y-2">
                            <Label>Not Ekle *</Label>
                            <Textarea
                              value={newCoachNote}
                              onChange={(e) => setNewCoachNote(e.target.value)}
                              placeholder="Oyuncu hakkında notlarınız..."
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => addCoachNote.mutate()} disabled={addCoachNote.isPending || !newCoachNote.trim()}>
                              {addCoachNote.isPending ? "Ekleniyor..." : "Kaydet"}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setShowNotesForm(false)}>
                              İptal
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {coachNotesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {coachNotes && coachNotes.length > 0 ? (
                          [...coachNotes].reverse().map((note: any) => (
                            <Card key={note.id} className="rounded-md shadow-sm border border-muted">
                              <CardContent className="p-4 flex items-start gap-3">
                                <div className="flex-1 space-y-1">
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(note.createdAt).toLocaleString("tr-TR")}
                                  </p>
                                  <p className="text-sm">{note.note}</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-muted-foreground hover:text-destructive"
                                  onClick={() => deleteCoachNote.mutate(note.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">Henüz koç notu yok</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
