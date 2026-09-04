"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { ErrorBoundary } from "@/components/error-boundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Users, UserPlus, Loader2, Mail, Shield, Building2, Edit2, Calendar, ChevronUp, ChevronDown, Trash2, Plus } from "lucide-react";
import { fetchAPI, postAPI } from "@/lib/api";

export default function UsersManagementPage() {
  const { data: session, status } = useSession();
  const token = (session as any)?.accessToken as string | undefined;
  const qc = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "COACH" | "PLAYER">("PLAYER");
  const [clubId, setClubId] = useState("");
  const [selectedUserEdit, setSelectedUserEdit] = useState<any>(null);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showHealthTimeline, setShowHealthTimeline] = useState(false);
  const [showNotesTimeline, setShowNotesTimeline] = useState(false);
  const [newHealthEntry, setNewHealthEntry] = useState("");
  const [newCoachNote, setNewCoachNote] = useState("");

  // Fetch users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetchAPI("/users", { token });
      if (!res.ok) throw new Error("Kullanıcılar yüklenemedi");
      return res.json();
    },
    enabled: !!token,
  });

  // Fetch clubs for dropdown
  const { data: clubs, isLoading: clubsLoading } = useQuery({
    queryKey: ["clubs"],
    queryFn: async () => {
      const res = await fetchAPI("/clubs", { token });
      if (!res.ok) throw new Error("Kulüpler yüklenemedi");
      return res.json();
    },
    enabled: !!token,
  });

  // Fetch health logs for selected user
  const { data: healthLogs } = useQuery({
    queryKey: ["health-logs", selectedUserEdit?.id],
    queryFn: async () => {
      if (!selectedUserEdit?.id) return [];
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${selectedUserEdit.id}/health-logs`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!token && !!selectedUserEdit?.id,
  });

  // Fetch coach notes for selected user
  const { data: coachNotes } = useQuery({
    queryKey: ["coach-notes", selectedUserEdit?.id],
    queryFn: async () => {
      if (!selectedUserEdit?.id) return [];
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${selectedUserEdit.id}/coach-notes`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!token && !!selectedUserEdit?.id,
  });

  // Add health log mutation
  const addHealthLog = useMutation({
    mutationFn: async (status: string) => {
      if (!selectedUserEdit?.id) throw new Error("Kullanıcı se\u00e7ilmemi\u015f");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${selectedUserEdit.id}/health-logs`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
          body: JSON.stringify({ status }),
        }
      );
      if (!res.ok) throw new Error("Sa\u011fl\u0131k giri\u015fi eklenemedi");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["health-logs", selectedUserEdit?.id] });
      setNewHealthEntry("");
      alert("✅ Sa\u011fl\u0131k durumu kaydedildi");
    },
    onError: (err: Error) => {
      alert(`❌ ${err.message}`);
    },
  });

  // Delete health log mutation
  const deleteHealthLog = useMutation({
    mutationFn: async (logId: string) => {
      if (!selectedUserEdit?.id) throw new Error("Kullanıcı se\u00e7ilmemi\u015f");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${selectedUserEdit.id}/health-logs/${logId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token ?? ""}` },
        }
      );
      if (!res.ok) throw new Error("Sa\u011fl\u0131k giri\u015fi silinemedi");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["health-logs", selectedUserEdit?.id] });
      alert("✅ Sa\u011fl\u0131k giri\u015fi silindi");
    },
    onError: (err: Error) => {
      alert(`❌ ${err.message}`);
    },
  });

  // Add coach note mutation
  const addCoachNote = useMutation({
    mutationFn: async (note: string) => {
      if (!selectedUserEdit?.id) throw new Error("Kullanıcı se\u00e7ilmemi\u015f");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${selectedUserEdit.id}/coach-notes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
          body: JSON.stringify({ note }),
        }
      );
      if (!res.ok) throw new Error("Not eklenemedi");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coach-notes", selectedUserEdit?.id] });
      setNewCoachNote("");
      alert("✅ Not kaydedildi");
    },
    onError: (err: Error) => {
      alert(`❌ ${err.message}`);
    },
  });

  // Delete coach note mutation
  const deleteCoachNote = useMutation({
    mutationFn: async (noteId: string) => {
      if (!selectedUserEdit?.id) throw new Error("Kullanıcı se\u00e7ilmemi\u015f");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${selectedUserEdit.id}/coach-notes/${noteId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token ?? ""}` },
        }
      );
      if (!res.ok) throw new Error("Not silinemedi");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coach-notes", selectedUserEdit?.id] });
      alert("✅ Not silindi");
    },
    onError: (err: Error) => {
      alert(`❌ ${err.message}`);
    },
  });
  const createUser = useMutation({
    mutationFn: async () => {
      const res = await postAPI(
        "/auth/register",
        {
          name,
          email,
          password,
          role,
          clubId: clubId || undefined,
        },
        token
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Kullanıcı oluşturulamadı");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      setName("");
      setEmail("");
      setPassword("");
      setRole("PLAYER");
      setClubId("");
      alert("✅ Kullanıcı başarıyla oluşturuldu!");
    },
    onError: (error: Error) => {
      alert(`❌ Hata: ${error.message}`);
    },
  });

  // Auth check
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

  const getRoleBadge = (userRole: string) => {
    const badges = {
      ADMIN: "bg-red-100 text-red-600",
      COACH: "bg-orange-100 text-orange-600",
      PLAYER: "bg-green-100 text-green-600",
    };
    return badges[userRole as keyof typeof badges] || "bg-gray-100 text-gray-600";
  };

  const getRoleLabel = (userRole: string) => {
    const labels = {
      ADMIN: "Yönetici",
      COACH: "Antrenör",
      PLAYER: "Sporcu",
    };
    return labels[userRole as keyof typeof labels] || userRole;
  };

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 lg:ml-64">
          <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="mt-[57px]">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-50 rounded-full border border-slate-100 shadow-sm">
                  <Users className="h-6 w-6 text-slate-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kullanıcı Yönetimi</h1>
                  <p className="text-sm font-medium text-slate-500 mt-1">
                    Sistem kullanıcılarını oluşturun ve yönetin
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create User Form */}
                <Card className="lg:col-span-1 rounded-xl shadow-sm border border-slate-200 bg-white overflow-hidden">
                  <CardHeader className="p-6 border-b border-slate-100 bg-slate-50/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm">
                        <UserPlus className="h-5 w-5 text-slate-400" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-slate-900 tracking-tight">Yeni Kullanıcı Oluştur</CardTitle>
                        <CardDescription className="text-xs font-medium text-slate-500 mt-1">Sisteme yeni bir kullanıcı ekleyin</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ad Soyad *</label>
                      <Input
                        placeholder="Örn: Ahmet Yılmaz"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-10 rounded-lg border-slate-200 text-sm font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">E-posta *</label>
                      <Input
                        type="email"
                        placeholder="ornek@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-10 rounded-lg border-slate-200 text-sm font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Şifre *</label>
                      <Input
                        type="password"
                        placeholder="En az 6 karakter"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-10 rounded-lg border-slate-200 text-sm font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rol *</label>
                      <Select value={role} onValueChange={(v) => setRole(v as any)}>
                        <SelectTrigger className="h-10 rounded-lg border-slate-200 text-sm font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PLAYER">Sporcu</SelectItem>
                          <SelectItem value="COACH">Antrenör</SelectItem>
                          <SelectItem value="ADMIN">Yönetici</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kulüp (Opsiyonel)</label>
                      <Select 
                        value={clubId || "none"} 
                        onValueChange={(v) => setClubId(v === "none" ? "" : v)}
                      >
                        <SelectTrigger className="h-10 rounded-lg border-slate-200 text-sm font-medium">
                          <SelectValue placeholder="Kulüp seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Kulüp Yok</SelectItem>
                          {clubsLoading ? (
                            <div className="px-2 py-1.5 text-sm text-slate-400">
                              Yükleniyor...
                            </div>
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
                    <Button
                      onClick={() => createUser.mutate()}
                      disabled={!name || !email || !password || createUser.isPending}
                      className="w-full h-11 rounded-lg text-sm font-bold"
                    >
                      {createUser.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Oluşturuluyor...
                        </>
                      ) : (
                        "Kullanıcı Oluştur"
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Users List */}
                <Card className="lg:col-span-2 rounded-xl shadow-sm border border-slate-200 bg-white overflow-hidden">
                  <CardHeader className="p-6 border-b border-slate-100 bg-slate-50/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base font-bold text-slate-900 tracking-tight">Tüm Kullanıcılar</CardTitle>
                        <CardDescription className="text-xs font-medium text-slate-500 mt-1">
                          {(users ?? []).length} kullanıcı kayıtlı
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {usersLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
                      </div>
                    ) : (users ?? []).length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-900">Henüz kullanıcı eklenmemiş</p>
                        <p className="text-xs font-medium text-slate-500 mt-1">Yeni kullanıcı oluşturun</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {(users ?? []).map((user: any) => (
                          <div
                            key={user.id}
                            className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50/50 hover:border-slate-200 transition-all flex items-start justify-between group"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-slate-900">{user.name}</p>
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                                    user.role === 'ADMIN' ? 'bg-rose-50 border-rose-200 text-rose-600' :
                                    user.role === 'COACH' ? 'bg-amber-50 border-amber-200 text-amber-600' :
                                    'bg-emerald-50 border-emerald-200 text-emerald-600'
                                  }`}
                                >
                                  {getRoleLabel(user.role)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-xs font-medium text-slate-500 mt-1.5">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </div>
                              {user.clubId && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                  <Building2 className="h-3 w-3" />
                                  Kulüp ID: {user.clubId.slice(0, 8)}...
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-xs text-muted-foreground whitespace-nowrap">
                                {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                              </div>
                              {user.role === "PLAYER" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUserEdit(user);
                                    setShowTimelineModal(true);
                                  }}
                                  className="text-primary hover:text-primary hover:bg-primary/10"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* User Timeline Modal */}
            <Dialog open={showTimelineModal} onOpenChange={(open) => {
              if (!open) {
                setSelectedUserEdit(null);
                setShowHealthTimeline(false);
                setShowNotesTimeline(false);
                setNewHealthEntry("");
                setNewCoachNote("");
              }
              setShowTimelineModal(open);
            }}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{selectedUserEdit?.name} - Sağlık ve Notlar</DialogTitle>
                  <DialogDescription>
                    Oyuncunun sağlık geçmişi ve koç notlarını yönetin
                  </DialogDescription>
                </DialogHeader>

                {selectedUserEdit && (
                  <div className="space-y-4">
                    {/* Health Logs Timeline */}
                    <div className="border-t pt-4">
                      <button
                        onClick={() => setShowHealthTimeline(!showHealthTimeline)}
                        className="flex items-center justify-between w-full text-sm font-medium hover:text-primary transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Sağlık Geçmişi ({healthLogs?.length || 0})
                        </span>
                        {showHealthTimeline ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      {showHealthTimeline && (
                        <div className="mt-3 space-y-2">
                          <div className="flex gap-1">
                            <Input
                              placeholder="Sağlık durumu (ör: Sağlı, Sakatlı)"
                              value={newHealthEntry}
                              onChange={(e) => setNewHealthEntry(e.target.value)}
                              className="text-sm"
                            />
                            <Button
                              size="sm"
                              onClick={() => {
                                if (newHealthEntry.trim()) {
                                  addHealthLog.mutate(newHealthEntry);
                                }
                              }}
                              disabled={!newHealthEntry.trim() || addHealthLog.isPending}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {healthLogs && healthLogs.length > 0 ? (
                              healthLogs.map((log: any) => (
                                <div
                                  key={log.id}
                                  className="flex items-center justify-between p-2 bg-muted rounded-sm text-sm"
                                >
                                  <div>
                                    <p className="font-medium">{log.status}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(log.createdAt).toLocaleDateString('tr-TR', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteHealthLog.mutate(log.id)}
                                    disabled={deleteHealthLog.isPending}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Trash2 className="h-3 w-3 text-destructive" />
                                  </Button>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-muted-foreground text-center py-2">Henüz kayıt yok</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Coach Notes Timeline */}
                    <div className="border-t pt-4">
                      <button
                        onClick={() => setShowNotesTimeline(!showNotesTimeline)}
                        className="flex items-center justify-between w-full text-sm font-medium hover:text-primary transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Koç Notları ({coachNotes?.length || 0})
                        </span>
                        {showNotesTimeline ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      {showNotesTimeline && (
                        <div className="mt-3 space-y-2">
                          <div className="flex gap-1">
                            <textarea
                              placeholder="Not ekle..."
                              value={newCoachNote}
                              onChange={(e) => setNewCoachNote(e.target.value)}
                              className="flex-1 px-3 py-2 border border-input rounded-md text-sm resize-none h-16"
                            />
                            <Button
                              size="sm"
                              onClick={() => {
                                if (newCoachNote.trim()) {
                                  addCoachNote.mutate(newCoachNote);
                                }
                              }}
                              disabled={!newCoachNote.trim() || addCoachNote.isPending}
                              className="h-16"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {coachNotes && coachNotes.length > 0 ? (
                              coachNotes.map((note: any) => (
                                <div
                                  key={note.id}
                                  className="flex items-start justify-between p-2 bg-muted rounded-sm text-sm"
                                >
                                  <div className="flex-1">
                                    <p className="font-medium">{note.note}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {new Date(note.createdAt).toLocaleDateString('tr-TR', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteCoachNote.mutate(note.id)}
                                    disabled={deleteCoachNote.isPending}
                                    className="h-6 w-6 p-0 shrink-0 ml-2"
                                  >
                                    <Trash2 className="h-3 w-3 text-destructive" />
                                  </Button>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-muted-foreground text-center py-2">Henüz kayıt yok</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowTimelineModal(false);
                      setSelectedUserEdit(null);
                      setShowHealthTimeline(false);
                      setShowNotesTimeline(false);
                      setNewHealthEntry("");
                      setNewCoachNote("");
                    }}
                  >
                    Kapat
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
