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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Users, UserPlus, Edit2, Save, X, Calendar, ChevronUp, ChevronDown, Trash2, Plus } from "lucide-react";

export default function AdminGroupsPage() {
  const { data: session, status } = useSession();
  const token = (session as any)?.accessToken as string | undefined;
  const qc = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clubId, setClubId] = useState("");
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showHealthTimeline, setShowHealthTimeline] = useState(false);
  const [showNotesTimeline, setShowNotesTimeline] = useState(false);
  const [newHealthEntry, setNewHealthEntry] = useState("");
  const [newCoachNote, setNewCoachNote] = useState("");
  
  // TÜM HOOKLAR ERKEN RETURN'LERDEN ÖNCE
  const { data: clubs } = useQuery({
    queryKey: ["clubs"],
    queryFn: async () => {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/clubs", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return res.json();
    },
    enabled: !!token,
  });

  // Auto-select the first (and only) club
  React.useEffect(() => {
    if (clubs && clubs.length > 0 && !clubId) {
      setClubId(clubs[0].id);
    }
  }, [clubs, clubId]);

  const { data: groups } = useQuery({
    queryKey: ["groups", clubId],
    queryFn: async () => {
      const url = new URL(process.env.NEXT_PUBLIC_API_URL + "/groups");
      url.searchParams.set("clubId", clubId);
      const res = await fetch(url.toString(), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return res.json();
    },
    enabled: !!token && !!clubId,
  });

  const updateGroupMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Takım güncellenemedi');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups'] });
      setEditingGroup(null);
      setEditName('');
    },
  });

  const handleEdit = (group: any) => {
    setEditingGroup(group.id);
    setEditName(group.name);
  };

  const handleSave = () => {
    if (editingGroup && editName.trim()) {
      updateGroupMutation.mutate({ id: editingGroup, name: editName.trim() });
    }
  };

  const handleCancel = () => {
    setEditingGroup(null);
    setEditName('');
  };

  // Fetch health logs for selected member
  const { data: healthLogs } = useQuery({
    queryKey: ["health-logs", selectedMember?.userId],
    queryFn: async () => {
      if (!selectedMember?.userId) return [];
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${selectedMember.userId}/health-logs`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!token && !!selectedMember?.userId,
  });

  // Fetch coach notes for selected member
  const { data: coachNotes } = useQuery({
    queryKey: ["coach-notes", selectedMember?.userId],
    queryFn: async () => {
      if (!selectedMember?.userId) return [];
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${selectedMember.userId}/coach-notes`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!token && !!selectedMember?.userId,
  });

  // Add health log mutation
  const addHealthLog = useMutation({
    mutationFn: async (status: string) => {
      if (!selectedMember?.userId) throw new Error("Oyuncu seçilmemiş");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${selectedMember.userId}/health-logs`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
          body: JSON.stringify({ status }),
        }
      );
      if (!res.ok) throw new Error("Sağlık girişi eklenemedi");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["health-logs", selectedMember?.userId] });
      setNewHealthEntry("");
      alert("✅ Sağlık durumu kaydedildi");
    },
    onError: (err: Error) => {
      alert(`❌ ${err.message}`);
    },
  });

  // Delete health log mutation
  const deleteHealthLog = useMutation({
    mutationFn: async (logId: string) => {
      if (!selectedMember?.userId) throw new Error("Oyuncu seçilmemiş");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${selectedMember.userId}/health-logs/${logId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token ?? ""}` },
        }
      );
      if (!res.ok) throw new Error("Sağlık girişi silinemedi");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["health-logs", selectedMember?.userId] });
      alert("✅ Sağlık girişi silindi");
    },
    onError: (err: Error) => {
      alert(`❌ ${err.message}`);
    },
  });

  // Add coach note mutation
  const addCoachNote = useMutation({
    mutationFn: async (note: string) => {
      if (!selectedMember?.userId) throw new Error("Oyuncu seçilmemiş");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${selectedMember.userId}/coach-notes`,
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
      qc.invalidateQueries({ queryKey: ["coach-notes", selectedMember?.userId] });
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
      if (!selectedMember?.userId) throw new Error("Oyuncu seçilmemiş");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${selectedMember.userId}/coach-notes/${noteId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token ?? ""}` },
        }
      );
      if (!res.ok) throw new Error("Not silinemedi");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coach-notes", selectedMember?.userId] });
      alert("✅ Not silindi");
    },
    onError: (err: Error) => {
      alert(`❌ ${err.message}`);
    },
  });
  
  // ERKEN RETURN'LER hookların SONRASINDA
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
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-50 rounded-full border border-slate-100 shadow-sm">
                <Users className="h-6 w-6 text-slate-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Takımlar ve Oyuncular</h1>
                <p className="text-sm font-medium text-slate-500 mt-1">Tüm takımları ve oyuncuları görüntüleyin</p>
              </div>
            </div>

            <Card className="rounded-xl shadow-sm border border-slate-200 bg-white overflow-hidden">
              <CardHeader className="p-6 border-b border-slate-100 bg-slate-50/30">
                <CardTitle className="text-base font-bold text-slate-900 tracking-tight">Takımlar</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* A Takım */}
                <div className="mb-8">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="h-2 w-2 bg-primary rounded-full"></span>
                    A Takım
                  </h3>
                  <div className="space-y-3">
                    {(groups ?? []).filter((g: any) => g.category === 'A_TAKIM').map((g: any) => (
                      <div key={g.id} className="border border-slate-100 p-5 rounded-xl bg-slate-50/30 hover:border-slate-200 transition-all">
                        <div className="flex items-center justify-between">
                          {editingGroup === g.id ? (
                            <div className="flex-1 flex items-center gap-3">
                              <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="max-w-xs h-10 rounded-lg border-slate-200 text-sm font-medium"
                                autoFocus
                              />
                              <Button size="sm" onClick={handleSave} disabled={updateGroupMutation.isPending} className="h-9 rounded-lg">
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={handleCancel} className="h-9 rounded-lg">
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div>
                                <p className="font-bold text-lg text-slate-900">{g.name}</p>
                                <p className="text-xs font-medium text-slate-500 mt-0.5">{g.ageGroup} · {g.members?.length || 0} oyuncu</p>
                              </div>
                              <Button size="sm" variant="outline" onClick={() => handleEdit(g)} className="h-8 rounded-lg border-slate-200">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                        {g.members && g.members.length > 0 && (
                          <div className="mt-4 pl-4 border-l-2 border-slate-200 space-y-2">
                            {g.members.map((m: any) => (
                              <p
                                key={m.id}
                                onClick={() => {
                                  setSelectedMember(m);
                                  setShowTimelineModal(true);
                                }}
                                className="text-sm font-medium text-slate-500 cursor-pointer hover:text-primary transition-colors"
                              >
                                • {m.user?.name || 'Bilinmeyen'}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {(groups ?? []).filter((g: any) => g.category === 'A_TAKIM').length === 0 && (
                      <div className="py-8 text-center">
                        <Users className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-900">Henüz A Takım eklenmemiş</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Alt Yapı */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="h-2 w-2 bg-amber-500 rounded-full"></span>
                    Alt Yapı
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(groups ?? []).filter((g: any) => g.category === 'ALT_YAPI').map((g: any) => (
                      <div key={g.id} className="border border-slate-100 p-5 rounded-xl hover:border-slate-200 hover:shadow-sm transition-all bg-white">
                        <div className="flex items-center justify-between mb-3">
                          {editingGroup === g.id ? (
                            <div className="flex-1 flex items-center gap-2">
                              <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="max-w-xs"
                                autoFocus
                              />
                              <Button size="sm" onClick={handleSave} disabled={updateGroupMutation.isPending}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={handleCancel}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div>
                                <p className="font-semibold">{g.name}</p>
                                <p className="text-sm text-muted-foreground">{g.ageGroup} · {g.members?.length || 0} oyuncu</p>
                              </div>
                              <Button size="sm" variant="outline" onClick={() => handleEdit(g)}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                        {g.members && g.members.length > 0 && (
                          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                            {g.members.slice(0, 3).map((m: any) => (
                              <p
                                key={m.id}
                                onClick={() => {
                                  setSelectedMember(m);
                                  setShowTimelineModal(true);
                                }}
                                className="cursor-pointer hover:text-primary transition-colors"
                              >
                                • {m.user?.name || 'Bilinmeyen'}
                              </p>
                            ))}
                            {g.members.length > 3 && (
                              <p className="italic">+{g.members.length - 3} diğer oyuncu</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    {(groups ?? []).filter((g: any) => g.category === 'ALT_YAPI').length === 0 && (
                      <p className="text-sm text-muted-foreground col-span-2">Henüz Alt Yapı takımı eklenmemiş</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Member Timeline Modal */}
            <Dialog open={showTimelineModal} onOpenChange={(open) => {
              if (!open) {
                setSelectedMember(null);
                setShowHealthTimeline(false);
                setShowNotesTimeline(false);
                setNewHealthEntry("");
                setNewCoachNote("");
              }
              setShowTimelineModal(open);
            }}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{selectedMember?.user?.name} - Sağlık ve Notlar</DialogTitle>
                  <DialogDescription>
                    Oyuncunun sağlık geçmişi ve koç notlarını yönetin
                  </DialogDescription>
                </DialogHeader>

                {selectedMember && (
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
                      setSelectedMember(null);
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
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}
