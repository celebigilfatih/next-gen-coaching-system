"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "@/components/error-boundary";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Loader2, Users, Trophy, GraduationCap, Trash2, Plus, UserPlus, Edit2, AlertTriangle, ChevronDown, ChevronUp, Calendar, Eye } from "lucide-react";

interface Team {
  id: string;
  name: string;
  category: string;
  ageGroup?: string;
  members?: any[];
}

interface Player {
  id: string;
  name: string;
  email: string;
  position?: string;
}

interface TeamMember {
  id: string;
  userId: string;
  user: Player;
}

export default function AdminTeamsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const token = (session as any)?.accessToken as string | undefined;
  const qc = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clubId, setClubId] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [showHealthTimeline, setShowHealthTimeline] = useState(false);
  const [showNotesTimeline, setShowNotesTimeline] = useState(false);
  const [newHealthStatus, setNewHealthStatus] = useState<'SAGLIK' | 'HAREKET_SINIRLAMASI' | 'IZOLASYON' | 'YARALI'>('SAGLIK');
  const [newHealthSeverity, setNewHealthSeverity] = useState<'HAFIF' | 'ORTA' | 'CIDDI'>('HAFIF');
  const [newHealthBodyPart, setNewHealthBodyPart] = useState("");
  const [newHealthReturnDate, setNewHealthReturnDate] = useState("");
  const [newHealthNotes, setNewHealthNotes] = useState("");
  const [newCoachNote, setNewCoachNote] = useState("");
  
  // Comprehensive Health Status Form State
  const [showComprehensiveHealthForm, setShowComprehensiveHealthForm] = useState(false);
  const [showHealthStatusTimeline, setShowHealthStatusTimeline] = useState(false);
  const [newPrimaryStatus, setNewPrimaryStatus] = useState<string>("SAGLIKLI");
  const [newInjuryType, setNewInjuryType] = useState<string>("");
  const [newMuscleSubtype, setNewMuscleSubtype] = useState<string>("");
  const [newLigamentSubtype, setNewLigamentSubtype] = useState<string>("");
  const [newTendonSubtype, setNewTendonSubtype] = useState<string>("");
  const [newBoneSubtype, setNewBoneSubtype] = useState<string>("");
  const [newBodyPart, setNewBodyPart] = useState<string>("");
  const [newRehabPhase, setNewRehabPhase] = useState<string>("");
  const [newTrainingParticipation, setNewTrainingParticipation] = useState<string>("");
  const [newEstimatedReturnDays, setNewEstimatedReturnDays] = useState<string>("");
  const [newClinicalNotes, setNewClinicalNotes] = useState<string>("");

  // Dialog states
  const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false);
  const [showEditTeamDialog, setShowEditTeamDialog] = useState(false);
  const [showDeleteTeamDialog, setShowDeleteTeamDialog] = useState(false);
  const [showAddPlayerDialog, setShowAddPlayerDialog] = useState(false);
  const [showEditPlayerDialog, setShowEditPlayerDialog] = useState(false);
  const [showDeletePlayerDialog, setShowDeletePlayerDialog] = useState(false);
  const [selectedPlayerToDelete, setSelectedPlayerToDelete] = useState<TeamMember | null>(null);
  const [selectedPlayerToEdit, setSelectedPlayerToEdit] = useState<TeamMember | null>(null);

  // Form states
  const [formTeamName, setFormTeamName] = useState("");
  const [formTeamAge, setFormTeamAge] = useState("U12");
  const [formNewPlayerName, setFormNewPlayerName] = useState("");
  const [formNewPlayerEmail, setFormNewPlayerEmail] = useState("");
  const [formNewPlayerPosition, setFormNewPlayerPosition] = useState("");
  const [formNewPlayerBirthDate, setFormNewPlayerBirthDate] = useState("");
  const [formNewPlayerHealth, setFormNewPlayerHealth] = useState("");
  const [formNewPlayerCoachNotes, setFormNewPlayerCoachNotes] = useState("");
  const [formEditPlayerName, setFormEditPlayerName] = useState("");
  const [formEditPlayerEmail, setFormEditPlayerEmail] = useState("");
  const [formEditPlayerPosition, setFormEditPlayerPosition] = useState("");
  const [formEditPlayerBirthDate, setFormEditPlayerBirthDate] = useState("");
  const [formEditPlayerHealth, setFormEditPlayerHealth] = useState("");
  const [formEditPlayerCoachNotes, setFormEditPlayerCoachNotes] = useState("");
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  // Fetch clubs
  const { data: clubs, isLoading: clubsLoading, error: clubsError } = useQuery({
    queryKey: ["clubs"],
    queryFn: async () => {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/clubs", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`Failed to fetch clubs: ${res.status}`);
      return res.json();
    },
    enabled: !!token,
  });

  React.useEffect(() => {
    if (clubs && clubs.length > 0 && !clubId) {
      setClubId(clubs[0].id);
    }
  }, [clubs, clubId]);

  // Fetch groups/teams
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

  React.useEffect(() => {
    if (groups && groups.length > 0 && !selectedTeam) {
      setSelectedTeam(groups[0].id);
    }
  }, [groups, selectedTeam]);

  // Fetch all players
  const { data: players } = useQuery({
    queryKey: ["players", clubId],
    queryFn: async () => {
      const url = new URL(process.env.NEXT_PUBLIC_API_URL + "/users/players");
      if (clubId) url.searchParams.set("clubId", clubId);
      const res = await fetch(url.toString(), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return res.json();
    },
    enabled: !!token && !!clubId,
  });

  // Fetch selected team members
  const { data: teamMembers } = useQuery({
    queryKey: ["team-members", selectedTeam],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups/${selectedTeam}/members`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return res.json();
    },
    enabled: !!token && !!selectedTeam,
  });

  // Fetch health logs for selected player
  const { data: healthLogs } = useQuery({
    queryKey: ["health-logs", selectedPlayerToEdit?.userId],
    queryFn: async () => {
      if (!selectedPlayerToEdit?.userId) return [];
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${selectedPlayerToEdit.userId}/health-logs`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!token && !!selectedPlayerToEdit?.userId,
  });

  // Fetch coach notes for selected player
  const { data: coachNotes } = useQuery({
    queryKey: ["coach-notes", selectedPlayerToEdit?.userId],
    queryFn: async () => {
      if (!selectedPlayerToEdit?.userId) return [];
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${selectedPlayerToEdit.userId}/coach-notes`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!token && !!selectedPlayerToEdit?.userId,
  });

  // Fetch comprehensive health status for selected player
  const { data: healthStatusRecords } = useQuery({
    queryKey: ["health-status", selectedPlayerToEdit?.userId],
    queryFn: async () => {
      if (!selectedPlayerToEdit?.userId) return [];
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${selectedPlayerToEdit.userId}/health-status`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!token && !!selectedPlayerToEdit?.userId,
  });

  // Add health log mutation
  const addHealthLog = useMutation({
    mutationFn: async () => {
      if (!selectedPlayerToEdit?.userId) throw new Error("Oyuncu se\u00e7ilmemi\u015f");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${selectedPlayerToEdit.userId}/health-logs`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
          body: JSON.stringify({
            status: newHealthStatus,
            severity: newHealthStatus === 'YARALI' ? newHealthSeverity : undefined,
            bodyPart: newHealthStatus === 'YARALI' ? newHealthBodyPart : undefined,
            expectedReturnDate: newHealthReturnDate ? new Date(newHealthReturnDate) : undefined,
            notes: newHealthNotes,
          }),
        }
      );
      if (!res.ok) throw new Error("Sa\u011fl\u0131k giri\u015fi eklenemedi");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["health-logs", selectedPlayerToEdit?.userId] });
      setNewHealthStatus('SAGLIK');
      setNewHealthSeverity('HAFIF');
      setNewHealthBodyPart("");
      setNewHealthReturnDate("");
      setNewHealthNotes("");
      alert("✅ Sa\u011fl\u0131k durumu kaydedildi");
    },
    onError: (err: Error) => {
      alert(`❌ ${err.message}`);
    },
  });

  // Delete health log mutation
  const deleteHealthLog = useMutation({
    mutationFn: async (logId: string) => {
      if (!selectedPlayerToEdit?.userId) throw new Error("Oyuncu se\u00e7ilmemi\u015f");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${selectedPlayerToEdit.userId}/health-logs/${logId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token ?? ""}` },
        }
      );
      if (!res.ok) throw new Error("Sa\u011fl\u0131k giri\u015fi silinemedi");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["health-logs", selectedPlayerToEdit?.userId] });
      alert("✅ Sa\u011fl\u0131k giri\u015fi silindi");
    },
    onError: (err: Error) => {
      alert(`❌ ${err.message}`);
    },
  });

  // Add coach note mutation
  const addCoachNote = useMutation({
    mutationFn: async (note: string) => {
      if (!selectedPlayerToEdit?.userId) throw new Error("Oyuncu se\u00e7ilmemi\u015f");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${selectedPlayerToEdit.userId}/coach-notes`,
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
      qc.invalidateQueries({ queryKey: ["coach-notes", selectedPlayerToEdit?.userId] });
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
      if (!selectedPlayerToEdit?.userId) throw new Error("Oyuncu se\u00e7ilmemi\u015f");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${selectedPlayerToEdit.userId}/coach-notes/${noteId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token ?? ""}` },
        }
      );
      if (!res.ok) throw new Error("Not silinemedi");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coach-notes", selectedPlayerToEdit?.userId] });
      alert("✅ Not silindi");
    },
    onError: (err: Error) => {
      alert(`❌ ${err.message}`);
    },
  });

  // Add comprehensive health status mutation
  const addHealthStatus = useMutation({
    mutationFn: async () => {
      if (!selectedPlayerToEdit?.userId) throw new Error("Oyuncu seçilmemiş");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${selectedPlayerToEdit.userId}/health-status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
          body: JSON.stringify({
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
          }),
        }
      );
      if (!res.ok) throw new Error("Sağlık durumu eklenemedi");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["health-status", selectedPlayerToEdit?.userId] });
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
      alert("✅ Sağlık durumu kaydedildi");
    },
    onError: (err: Error) => {
      alert(`❌ ${err.message}`);
    },
  });

  // Delete comprehensive health status mutation
  const deleteHealthStatus = useMutation({
    mutationFn: async (statusId: string) => {
      if (!selectedPlayerToEdit?.userId) throw new Error("Oyuncu seçilmemiş");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${selectedPlayerToEdit.userId}/health-status/${statusId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token ?? ""}` },
        }
      );
      if (!res.ok) throw new Error("Sağlık durumu silinemedi");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["health-status", selectedPlayerToEdit?.userId] });
      alert("✅ Sağlık durumu silindi");
    },
    onError: (err: Error) => {
      alert(`❌ ${err.message}`);
    },
  });

  // Create team mutation
  const createTeam = useMutation({
    mutationFn: async () => {
      if (!clubId) throw new Error("Kulüp seçilmemiş");
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
        body: JSON.stringify({ clubId, name: formTeamName, ageGroup: formTeamAge, category: "ALT_YAPI" }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Takım oluşturulamadı' }));
        throw new Error(errorData.message || "Takım oluşturulamadı");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups", clubId] });
      setFormTeamName("");
      setFormTeamAge("U12");
      setShowCreateTeamDialog(false);
    },
    onError: (err: Error) => {
      alert(`❌ ${err.message}`);
    },
  });

  // Update team mutation
  const updateTeam = useMutation({
    mutationFn: async () => {
      if (!editingTeam) throw new Error("Takım seçilmemiş");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups/${editingTeam.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
        body: JSON.stringify({ name: formTeamName, ageGroup: formTeamAge }),
      });
      if (!res.ok) throw new Error("Takım güncellenemedi");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups", clubId] });
      setFormTeamName("");
      setFormTeamAge("U12");
      setEditingTeam(null);
      setShowEditTeamDialog(false);
    },
    onError: (err: Error) => {
      alert(`❌ ${err.message}`);
    },
  });

  // Delete team mutation
  const deleteTeam = useMutation({
    mutationFn: async () => {
      if (!editingTeam) throw new Error("Takım seçilmemiş");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups/${editingTeam.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      if (!res.ok) throw new Error("Takım silinemedi");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups", clubId] });
      setEditingTeam(null);
      setShowDeleteTeamDialog(false);
      setSelectedTeam("");
    },
    onError: (err: Error) => {
      alert(`❌ ${err.message}`);
    },
  });

  // Create player mutation
  const createPlayer = useMutation({
    mutationFn: async () => {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
        body: JSON.stringify({
          name: formNewPlayerName,
          email: formNewPlayerEmail,
          password: "player123",
          role: "PLAYER",
          clubId,
          position: formNewPlayerPosition || undefined,
          birthDate: formNewPlayerBirthDate || undefined,
          health: formNewPlayerHealth || undefined,
          coachNotes: formNewPlayerCoachNotes || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Oyuncu oluşturulamadı");
      }
      return res.json();
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["players", clubId] });
      if (selectedTeam) {
        addPlayerToTeam.mutate({ playerId: data.user.id });
      }
      setFormNewPlayerName("");
      setFormNewPlayerEmail("");
      setFormNewPlayerPosition("");
      setFormNewPlayerBirthDate("");
      setFormNewPlayerHealth("");
      setFormNewPlayerCoachNotes("");
      setShowAddPlayerDialog(false);
    },
    onError: (err: Error) => {
      alert(`❌ ${err.message}`);
    },
  });

  // Add player to team mutation
  const addPlayerToTeam = useMutation({
    mutationFn: async ({ playerId }: { playerId: string }) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups/${selectedTeam}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
        body: JSON.stringify({ userId: playerId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Eklenemedi");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team-members", selectedTeam] });
      setSelectedPlayer("");
      alert("✅ Oyuncu takıma eklendi");
    },
    onError: (err: Error) => {
      alert(`❌ ${err.message}`);
    },
  });

  // Remove player from team mutation
  const removePlayerFromTeam = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups/${selectedTeam}/members/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Çıkarılamadı");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team-members", selectedTeam] });
      setShowDeletePlayerDialog(false);
      setSelectedPlayerToDelete(null);
      alert("✅ Oyuncu takımdan çıkarıldı");
    },
  });

  // Update player mutation
  const updatePlayer = useMutation({
    mutationFn: async (playerId: string) => {
      if (!selectedPlayerToEdit) throw new Error("Oyuncu seçilmemiş");
      const updateData: any = {};
      if (formEditPlayerName) updateData.name = formEditPlayerName;
      if (formEditPlayerEmail) updateData.email = formEditPlayerEmail;
      if (formEditPlayerPosition) updateData.position = formEditPlayerPosition;
      if (formEditPlayerBirthDate) updateData.birthDate = formEditPlayerBirthDate;
      if (formEditPlayerHealth) updateData.health = formEditPlayerHealth;
      if (formEditPlayerCoachNotes) updateData.coachNotes = formEditPlayerCoachNotes;
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${playerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
        body: JSON.stringify(updateData),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Oyuncu güncellenemedi" }));
        throw new Error(err.message || "Oyuncu güncellenemedi");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team-members", selectedTeam] });
      qc.invalidateQueries({ queryKey: ["players", clubId] });
      setShowEditPlayerDialog(false);
      setSelectedPlayerToEdit(null);
      setFormEditPlayerName("");
      setFormEditPlayerEmail("");
      setFormEditPlayerPosition("");
      setFormEditPlayerBirthDate("");
      setFormEditPlayerHealth("");
      setFormEditPlayerCoachNotes("");
      alert("✅ Oyuncu bilgileri güncellendi");
    },
    onError: (err: Error) => {
      alert(`❌ ${err.message}`);
    },
  });

  // Auth check
  React.useEffect(() => {
    if (status === "loading") return;
    if (session && (session as any)?.role !== "ADMIN") {
      window.location.href = "/dashboard";
    }
  }, [session, status]);

  if (status === "loading" || clubsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (clubsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
          <p className="text-destructive font-medium">Kulüpler yüklenemedi</p>
          <p className="text-sm text-muted-foreground">{(clubsError as Error).message}</p>
          <Button onClick={() => window.location.reload()}>Yeniden Dene</Button>
        </div>
      </div>
    );
  }

  if ((session as any)?.role !== "ADMIN") {
    return null;
  }

  const aTeam = (groups ?? []).find((g: any) => g.category === 'A_TAKIM') as Team;
  const altYapiTeams = (groups ?? []).filter((g: any) => g.category === 'ALT_YAPI') as Team[];
  const selectedTeamData = (groups ?? []).find((g: any) => g.id === selectedTeam) as Team;
  const teamMemberIds = (teamMembers ?? []).map((m: any) => m.userId);
  const availablePlayers = (players ?? []).filter((p: any) => !teamMemberIds.includes(p.id));

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 lg:ml-64">
          <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="mt-[57px]">
            <div className="p-6 lg:p-8 space-y-8">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-muted pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-md border border-muted/50">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground uppercase tracking-wider">Kadro Yönetimi</h1>
                    <p className="text-xs text-muted-foreground">Takımları ve oyuncuları yönetin</p>
                  </div>
                </div>
                {clubId && (
                  <Badge variant="outline" className="text-[10px] font-semibold border-muted bg-muted/20 uppercase px-2 py-0.5">
                    {clubs?.find((c: any) => c.id === clubId)?.name}
                  </Badge>
                )}
              </div>

              {/* Main Content */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Left Sidebar: Teams List */}
                <div className="lg:col-span-1 space-y-4">
                  <Card className="rounded-xl shadow-sm border border-slate-200 bg-white overflow-hidden">
                    <CardHeader className="p-6 pb-2">
                      <CardTitle className="text-sm font-medium text-slate-500">Takımlar</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-1">
                      {/* A Team */}
                      {aTeam && (
                        <div
                          onClick={() => setSelectedTeam(aTeam.id)}
                          className={cn(
                            "p-3 rounded-lg cursor-pointer transition-all border",
                            selectedTeam === aTeam.id
                              ? 'bg-slate-50 border-slate-200 shadow-sm'
                              : 'border-transparent hover:bg-slate-50/50'
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "p-2 rounded-full border",
                              selectedTeam === aTeam.id ? "bg-primary/10 border-primary/20" : "bg-slate-50 border-slate-100"
                            )}>
                              <Trophy className={cn(
                                "h-4 w-4",
                                selectedTeam === aTeam.id ? "text-primary" : "text-slate-400"
                              )} />
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                              <p className="text-sm font-bold text-slate-900 truncate uppercase">{aTeam.name}</p>
                              <p className="text-[10px] text-slate-500 uppercase font-medium">A Takım</p>
                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-xl font-bold text-slate-900 tracking-tight">{teamMembers?.length || 0}</span>
                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Oyuncu</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Alt Yapı Teams */}
                      {altYapiTeams.length > 0 && (
                        <div className="space-y-1 pt-4">
                          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Alt Yapı</h3>
                          {altYapiTeams.map((team) => (
                            <div
                              key={team.id}
                              onClick={() => setSelectedTeam(team.id)}
                              className={cn(
                                "p-3 rounded-lg cursor-pointer transition-all border",
                                selectedTeam === team.id
                                  ? 'bg-slate-50 border-slate-200 shadow-sm'
                                  : 'border-transparent hover:bg-slate-50/50'
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <div className={cn(
                                  "p-2 rounded-full border",
                                  selectedTeam === team.id ? "bg-blue-50 border-blue-100" : "bg-slate-50 border-slate-100"
                                )}>
                                  <GraduationCap className={cn(
                                    "h-4 w-4",
                                    selectedTeam === team.id ? "text-blue-600" : "text-slate-400"
                                  )} />
                                </div>
                                <div className="flex-1 min-w-0 pt-0.5">
                                  <p className="text-sm font-bold text-slate-900 truncate uppercase">{team.name}</p>
                                  <p className="text-[10px] text-slate-500 uppercase font-medium">{team.ageGroup || 'N/A'}</p>
                                  <div className="mt-2 flex items-center gap-2">
                                    <span className="text-xl font-bold text-slate-900 tracking-tight">{teamMembers?.length || 0}</span>
                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Oyuncu</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="px-2 pt-2 border-t border-muted/30">
                        <Dialog open={showCreateTeamDialog} onOpenChange={setShowCreateTeamDialog}>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="w-full h-8 text-[10px] font-bold uppercase tracking-wider rounded-md border-muted shadow-sm" size="sm">
                              <Plus className="h-3 w-3 mr-1.5" />
                              Yeni Alt Yapı
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="rounded-md border-muted shadow-sm bg-background">
                            <DialogHeader>
                              <DialogTitle className="text-sm font-semibold uppercase tracking-wider">Yeni Takım Oluştur</DialogTitle>
                              <DialogDescription className="text-xs text-muted-foreground">
                                Takım adı ve yaş grubunu belirleyin
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight">Takım Adı *</label>
                                <Input
                                  placeholder="Örn: U14 Takımı"
                                  value={formTeamName}
                                  onChange={(e) => setFormTeamName(e.target.value)}
                                  className="h-9 rounded-md shadow-sm border-muted focus-visible:ring-primary"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight">Yaş Grubu *</label>
                                <Select value={formTeamAge} onValueChange={setFormTeamAge}>
                                  <SelectTrigger className="h-9 rounded-md shadow-sm border-muted focus-visible:ring-primary">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {["U8", "U10", "U12", "U14", "U16", "U18"].map((ag) => (
                                      <SelectItem key={ag} value={ag}>{ag}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <DialogFooter className="gap-2">
                              <Button
                                variant="outline"
                                className="h-9 rounded-md shadow-sm text-xs font-semibold"
                                onClick={() => {
                                  setShowCreateTeamDialog(false);
                                  setFormTeamName("");
                                  setFormTeamAge("U12");
                                }}
                              >
                                İptal
                              </Button>
                              <Button
                                className="h-9 rounded-md shadow-sm text-xs font-semibold"
                                onClick={() => createTeam.mutate()}
                                disabled={!formTeamName || createTeam.isPending}
                              >
                                {createTeam.isPending ? "Oluşturuluyor..." : "Oluştur"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Section: Team Details and Roster */}
                <div className="lg:col-span-3 space-y-6">
                  {selectedTeamData ? (
                    <>
                      {/* Team Info Card */}
                      <Card className="rounded-xl shadow-sm border border-slate-200 bg-white overflow-hidden">
                        <CardHeader className="p-6 pb-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-slate-50 border border-slate-100 rounded-full">
                                {selectedTeamData.category === 'A_TAKIM' ? (
                                  <Trophy className="h-6 w-6 text-primary" />
                                ) : (
                                  <GraduationCap className="h-6 w-6 text-blue-600" />
                                )}
                              </div>
                              <div>
                                <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">{selectedTeamData.name}</CardTitle>
                                <CardDescription className="text-sm font-medium text-slate-500">
                                  {selectedTeamData.category === 'A_TAKIM' ? 'A Takım Kadrosu' : `${selectedTeamData.ageGroup} Alt Yapı Kadrosu`}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Dialog open={showEditTeamDialog} onOpenChange={setShowEditTeamDialog}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 rounded-lg shadow-sm text-xs font-medium border-slate-200 hover:bg-slate-50"
                                    onClick={() => {
                                      setEditingTeam(selectedTeamData);
                                      setFormTeamName(selectedTeamData.name);
                                      setFormTeamAge(selectedTeamData.ageGroup || "U12");
                                    }}
                                  >
                                    <Edit2 className="h-3.5 w-3.5 mr-2 text-slate-500" />
                                    Düzenle
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="rounded-md shadow-sm bg-background border-muted">
                                  <DialogHeader>
                                    <DialogTitle className="text-sm font-semibold uppercase tracking-wider">Takımı Düzenle</DialogTitle>
                                    <DialogDescription className="text-xs text-muted-foreground">
                                      Takım bilgilerini güncelleyin
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="space-y-1.5">
                                      <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight">Takım Adı *</label>
                                      <Input
                                        value={formTeamName}
                                        onChange={(e) => setFormTeamName(e.target.value)}
                                        className="h-9 rounded-md shadow-sm border-muted focus-visible:ring-primary"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight">Yaş Grubu *</label>
                                      <Select value={formTeamAge} onValueChange={setFormTeamAge}>
                                        <SelectTrigger className="h-9 rounded-md shadow-sm border-muted focus-visible:ring-primary">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {["U8", "U10", "U12", "U14", "U16", "U18"].map((ag) => (
                                            <SelectItem key={ag} value={ag}>{ag}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  <DialogFooter className="gap-2">
                                    <Button
                                      variant="outline"
                                      className="h-9 rounded-md shadow-sm text-xs font-semibold"
                                      onClick={() => {
                                        setShowEditTeamDialog(false);
                                        setEditingTeam(null);
                                        setFormTeamName("");
                                      }}
                                    >
                                      İptal
                                    </Button>
                                    <Button
                                      className="h-9 rounded-md shadow-sm text-xs font-semibold"
                                      onClick={() => updateTeam.mutate()}
                                      disabled={!formTeamName || updateTeam.isPending}
                                    >
                                      {updateTeam.isPending ? "Kaydediliyor..." : "Kaydet"}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                      <Dialog open={showDeleteTeamDialog} onOpenChange={setShowDeleteTeamDialog}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 rounded-lg shadow-sm text-xs font-medium border-slate-200 text-destructive hover:bg-destructive/5"
                                    onClick={() => setEditingTeam(selectedTeamData)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                                    Sil
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="rounded-xl shadow-lg border-slate-200 bg-white">
                                  <DialogHeader>
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-destructive/10 rounded-full">
                                        <AlertTriangle className="h-5 w-5 text-destructive" />
                                      </div>
                                      <div>
                                        <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">Takımı Sil</DialogTitle>
                                        <DialogDescription className="text-sm font-medium text-slate-500">
                                          Bu işlem geri alınamaz. <strong>{selectedTeamData?.name}</strong> takımını silmek istediğinizden emin misiniz?
                                        </DialogDescription>
                                      </div>
                                    </div>
                                  </DialogHeader>
                                  <DialogFooter className="gap-3 mt-6">
                                    <Button
                                      variant="outline"
                                      className="h-10 rounded-lg shadow-sm text-sm font-medium border-slate-200"
                                      onClick={() => {
                                        setShowDeleteTeamDialog(false);
                                        setEditingTeam(null);
                                      }}
                                    >
                                      İptal
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      className="h-10 rounded-lg shadow-sm text-sm font-medium"
                                      onClick={() => deleteTeam.mutate()}
                                      disabled={deleteTeam.isPending}
                                    >
                                      {deleteTeam.isPending ? "Siliniyor..." : "Evet, Sil"}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>

                      {/* Roster Card */}
                      <Card className="rounded-xl shadow-sm border border-slate-200 bg-white overflow-hidden">
                        <CardHeader className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-sm font-medium text-slate-500">Kadro</CardTitle>
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-2xl font-bold text-slate-900 tracking-tight">{teamMembers?.length || 0}</span>
                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Aktif Oyuncu</span>
                              </div>
                            </div>
                            <Dialog open={showAddPlayerDialog} onOpenChange={setShowAddPlayerDialog}>
                              <DialogTrigger asChild>
                                <Button size="sm" className="h-9 rounded-lg shadow-sm text-xs font-medium px-4">
                                  <UserPlus className="h-4 w-4 mr-2" />
                                  Oyuncu Ekle
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md rounded-xl shadow-lg border-slate-200 bg-white">
                                <DialogHeader>
                                  <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">Oyuncu Ekle</DialogTitle>
                                  <DialogDescription className="text-sm font-medium text-slate-500">
                                    Yeni oyuncu oluşturun veya mevcut oyuncu listesinden ekleyin
                                  </DialogDescription>
                                </DialogHeader>
                                <Tabs defaultValue="new" className="w-full mt-4">
                                  <TabsList className="grid w-full grid-cols-2 h-10 p-1 bg-slate-50 rounded-lg border border-slate-200">
                                    <TabsTrigger value="new" className="text-xs font-medium rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Yeni Oyuncu</TabsTrigger>
                                    <TabsTrigger value="existing" className="text-xs font-medium rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Mevcut Oyuncu</TabsTrigger>
                                  </TabsList>
                                  <TabsContent value="new" className="space-y-4 mt-6">
                                    <div className="space-y-1.5">
                                      <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight">Ad Soyad *</label>
                                      <Input
                                        placeholder="Örn: Ahmet Yılmaz"
                                        value={formNewPlayerName}
                                        onChange={(e) => setFormNewPlayerName(e.target.value)}
                                        className="h-9 rounded-md shadow-sm border-muted focus-visible:ring-primary"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight">E-posta *</label>
                                      <Input
                                        type="email"
                                        placeholder="oyuncu@example.com"
                                        value={formNewPlayerEmail}
                                        onChange={(e) => setFormNewPlayerEmail(e.target.value)}
                                        className="h-9 rounded-md shadow-sm border-muted focus-visible:ring-primary"
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight">Mevki</label>
                                        <Select value={formNewPlayerPosition} onValueChange={setFormNewPlayerPosition}>
                                          <SelectTrigger className="h-9 rounded-md shadow-sm border-muted focus-visible:ring-primary">
                                            <SelectValue placeholder="Seç" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="KALECI">Kaleci</SelectItem>
                                            <SelectItem value="DEFANS">Defans</SelectItem>
                                            <SelectItem value="ORTA_SAHA">Orta Saha</SelectItem>
                                            <SelectItem value="FORVET">Forvet</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight">Doğum Tarihi</label>
                                        <Input
                                          type="date"
                                          value={formNewPlayerBirthDate}
                                          onChange={(e) => setFormNewPlayerBirthDate(e.target.value)}
                                          className="h-9 rounded-md shadow-sm border-muted focus-visible:ring-primary"
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button
                                        className="w-full h-9 rounded-md shadow-sm text-xs font-semibold"
                                        onClick={() => createPlayer.mutate()}
                                        disabled={!formNewPlayerName || !formNewPlayerEmail || createPlayer.isPending}
                                      >
                                        {createPlayer.isPending ? "Oluşturuluyor..." : "Oyuncuyu Oluştur ve Ekle"}
                                      </Button>
                                    </DialogFooter>
                                  </TabsContent>
                                  <TabsContent value="existing" className="space-y-4 mt-6">
                                    <div className="space-y-1.5">
                                      <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight">Oyuncu Seç *</label>
                                      <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                                        <SelectTrigger className="h-9 rounded-md shadow-sm border-muted focus-visible:ring-primary">
                                          <SelectValue placeholder="Oyuncu seç" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {availablePlayers.map((p: Player) => (
                                            <SelectItem key={p.id} value={p.id}>
                                              {p.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      {selectedPlayer && availablePlayers.find((p: Player) => p.id === selectedPlayer) && (
                                        <p className="text-[10px] text-muted-foreground mt-2 uppercase font-medium">
                                          {availablePlayers.find((p: Player) => p.id === selectedPlayer)?.email}
                                        </p>
                                      )}
                                    </div>
                                    <DialogFooter>
                                      <Button
                                        variant="outline"
                                        className="h-9 rounded-md shadow-sm text-xs font-semibold"
                                        onClick={() => {
                                          setShowAddPlayerDialog(false);
                                          setSelectedPlayer("");
                                        }}
                                      >
                                        İptal
                                      </Button>
                                      <Button
                                        className="h-9 rounded-md shadow-sm text-xs font-semibold"
                                        onClick={() => selectedPlayer && addPlayerToTeam.mutate({ playerId: selectedPlayer })}
                                        disabled={!selectedPlayer || addPlayerToTeam.isPending}
                                      >
                                        {addPlayerToTeam.isPending ? "Ekleniyor..." : "Ekle"}
                                      </Button>
                                    </DialogFooter>
                                  </TabsContent>
                                </Tabs>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {(teamMembers ?? []).length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              <Users className="h-8 w-8 mx-auto opacity-50 mb-2" />
                              <p>Henüz oyuncu eklenmemiş</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {(teamMembers ?? []).map((member: TeamMember) => (
                                <div
                                  key={member.id}
                                  className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50/50 hover:border-slate-200 transition-all group"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="font-bold text-slate-900 text-sm tracking-tight">{member.user.name}</p>
                                      {member.user.position && (
                                        <Badge variant="outline" className="text-[10px] font-bold border-slate-200 bg-slate-50 text-slate-600 h-5">
                                          {member.user.position}
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs font-medium text-slate-400 mt-0.5">{member.user.email}</p>
                                  </div>
                                  <div className="flex gap-2">
                                    {/* View Player Button */}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => router.push(`/admin/teams/${selectedTeam}/player/${member.user.id}`)}
                                      className="h-8 w-8 p-0 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    {/* Edit Player Button */}
                                    <Dialog open={showEditPlayerDialog && selectedPlayerToEdit?.id === member.id} onOpenChange={(open) => {
                                      if (!open) setSelectedPlayerToEdit(null);
                                      setShowEditPlayerDialog(open);
                                    }}>
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            router.push(`/admin/teams/${selectedTeam}/player/${member.user.id}`);
                                          }}
                                          className="h-8 w-8 p-0 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full"
                                        >
                                          <Edit2 className="h-4 w-4" />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-xl rounded-xl shadow-lg border-slate-200 bg-white">
                                        <DialogHeader>
                                          <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">Oyuncu Bilgileri</DialogTitle>
                                          <DialogDescription className="text-sm font-medium text-slate-500">
                                            {member.user.name} adlı oyuncunun profilini ve sağlık geçmişini yönetin
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                          <div>
                                            <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight">Ad Soyad *</label>
                                            <Input
                                              value={formEditPlayerName}
                                              onChange={(e) => setFormEditPlayerName(e.target.value)}
                                              className="h-9 rounded-md shadow-sm border-muted focus-visible:ring-primary"
                                            />
                                          </div>
                                          <div>
                                            <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight">E-posta *</label>
                                            <Input
                                              type="email"
                                              value={formEditPlayerEmail}
                                              onChange={(e) => setFormEditPlayerEmail(e.target.value)}
                                              className="h-9 rounded-md shadow-sm border-muted focus-visible:ring-primary"
                                            />
                                          </div>
                                          <div>
                                            <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight">Mevki</label>
                                            <Select value={formEditPlayerPosition} onValueChange={setFormEditPlayerPosition}>
                                              <SelectTrigger className="h-9 rounded-md shadow-sm border-muted focus-visible:ring-primary">
                                                <SelectValue placeholder="Mevki seç" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="KALECI">Kaleci</SelectItem>
                                                <SelectItem value="DEFANS">Defans</SelectItem>
                                                <SelectItem value="ORTA_SAHA">Orta Saha</SelectItem>
                                                <SelectItem value="FORVET">Forvet</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div>
                                            <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight">Doğum Tarihi</label>
                                            <Input
                                              type="date"
                                              value={formEditPlayerBirthDate}
                                              onChange={(e) => setFormEditPlayerBirthDate(e.target.value)}
                                              className="h-9 rounded-md shadow-sm border-muted focus-visible:ring-primary"
                                            />
                                          </div>
                                          <div>
                                            <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight">Sağlık (Sağlık Durumu)</label>
                                            <Input
                                              placeholder="Örn: Sağlıklı, Sakatlık (Maça çıkamadı)"
                                              value={formEditPlayerHealth}
                                              onChange={(e) => setFormEditPlayerHealth(e.target.value)}
                                              className="h-9 rounded-md shadow-sm border-muted focus-visible:ring-primary"
                                            />
                                          </div>
                                          <div>
                                            <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight">Koç Notları (Coach Notes)</label>
                                            <textarea
                                              placeholder="Oyuncu hakkında notlar..."
                                              value={formEditPlayerCoachNotes}
                                              onChange={(e) => setFormEditPlayerCoachNotes(e.target.value)}
                                              className="w-full px-3 py-2 h-24 border border-muted rounded-md text-sm focus-visible:ring-primary resize-none"
                                              rows={3}
                                            />
                                          </div>
                                        </div>

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
                                            <div className="mt-3 space-y-3">
                                              {/* Health Status Form */}
                                              <div className="space-y-3 p-4 bg-muted/30 rounded-md border border-muted">
                                                <div>
                                                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight">Durum *</label>
                                                  <Select value={newHealthStatus} onValueChange={(v: any) => setNewHealthStatus(v)}>
                                                    <SelectTrigger className="h-8 rounded-md shadow-sm border-muted focus-visible:ring-primary">
                                                      <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      <SelectItem value="SAGLIK">✅ Sağlı</SelectItem>
                                                      <SelectItem value="HAREKET_SINIRLAMASI">⚠️ Hareket Sınırlaması</SelectItem>
                                                      <SelectItem value="IZOLASYON">🔒 İzolasyon</SelectItem>
                                                      <SelectItem value="YARALI">🚑 Yaralı</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                </div>

                                                {newHealthStatus === 'YARALI' && (
                                                  <>
                                                    <div>
                                                      <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight">Ciddiyet</label>
                                                      <Select value={newHealthSeverity} onValueChange={(v: any) => setNewHealthSeverity(v)}>
                                                        <SelectTrigger className="h-8 rounded-md shadow-sm border-muted focus-visible:ring-primary">
                                                          <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                          <SelectItem value="HAFIF">Hafif</SelectItem>
                                                          <SelectItem value="ORTA">Orta</SelectItem>
                                                          <SelectItem value="CIDDI">Ciddi</SelectItem>
                                                        </SelectContent>
                                                      </Select>
                                                    </div>
                                                    <div>
                                                      <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight">Etkilenen Bölge</label>
                                                      <Input
                                                        placeholder="Örn: Sol Ayak, Sağ Dizayn"
                                                        value={newHealthBodyPart}
                                                        onChange={(e) => setNewHealthBodyPart(e.target.value)}
                                                        className="h-8 rounded-md shadow-sm border-muted focus-visible:ring-primary"
                                                      />
                                                    </div>
                                                    <div>
                                                      <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight">Dönüş Tarihi</label>
                                                      <Input
                                                        type="date"
                                                        value={newHealthReturnDate}
                                                        onChange={(e) => setNewHealthReturnDate(e.target.value)}
                                                        className="h-8 rounded-md shadow-sm border-muted focus-visible:ring-primary"
                                                      />
                                                    </div>
                                                  </>
                                                )}

                                                <div>
                                                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight">Notlar</label>
                                                  <textarea
                                                    placeholder="Ek detaylar ekle..."
                                                    value={newHealthNotes}
                                                    onChange={(e) => setNewHealthNotes(e.target.value)}
                                                    className="w-full px-3 py-2 h-20 border border-muted rounded-md text-sm focus-visible:ring-primary resize-none"
                                                  />
                                                </div>

                                                <Button
                                                  onClick={() => addHealthLog.mutate()}
                                                  disabled={addHealthLog.isPending}
                                                  className="w-full h-9 rounded-md shadow-sm text-xs font-semibold"
                                                >
                                                  <Plus className="h-4 w-4 mr-2" />
                                                  Ekle
                                                </Button>
                                              </div>
                                              <div className="space-y-2 max-h-64 overflow-y-auto">
                                                {healthLogs && healthLogs.length > 0 ? (
                                                  healthLogs.map((log: any) => (
                                                    <div
                                                      key={log.id}
                                                      className="flex items-start justify-between p-3 bg-muted/50 rounded-md border border-muted text-sm"
                                                    >
                                                      <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                          <p className="font-semibold text-sm">
                                                            {log.status === 'SAGLIK' && '✅'}
                                                            {log.status === 'HAREKET_SINIRLAMASI' && '⚠️'}
                                                            {log.status === 'IZOLASYON' && '🔒'}
                                                            {log.status === 'YARALI' && '🚑'}
                                                            {' '}
                                                            {log.status === 'SAGLIK' && 'Sağlı'}
                                                            {log.status === 'HAREKET_SINIRLAMASI' && 'Hareket Sınırlaması'}
                                                            {log.status === 'IZOLASYON' && 'İzolasyon'}
                                                            {log.status === 'YARALI' && 'Yaralı'}
                                                          </p>
                                                          {log.severity && (
                                                            <Badge variant="outline" className="text-[10px] font-bold border-muted h-5">
                                                              {log.severity === 'HAFIF' && 'Hafif'}
                                                              {log.severity === 'ORTA' && 'Orta'}
                                                              {log.severity === 'CIDDI' && 'Ciddi'}
                                                            </Badge>
                                                          )}
                                                        </div>
                                                        {log.bodyPart && <p className="text-xs text-muted-foreground mt-1">📍 {log.bodyPart}</p>}
                                                        {log.expectedReturnDate && (
                                                          <p className="text-xs text-muted-foreground">📅 Dönüş: {new Date(log.expectedReturnDate).toLocaleDateString('tr-TR')}</p>
                                                        )}
                                                        {log.notes && <p className="text-xs mt-1 text-muted-foreground">📝 {log.notes}</p>}
                                                        <p className="text-xs text-muted-foreground mt-1">
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
                                                        className="h-8 w-8 p-0 flex-shrink-0 ml-2"
                                                      >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
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
                                                        <p className="font-medium break-words">{note.note}</p>
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
                                                        className="h-6 w-6 p-0 flex-shrink-0 ml-2"
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

                                        {/* Comprehensive Health Status Timeline */}
                                        <div className="border-t pt-4">
                                          <button
                                            onClick={() => setShowHealthStatusTimeline(!showHealthStatusTimeline)}
                                            className="flex items-center justify-between w-full text-sm font-medium hover:text-primary transition-colors"
                                          >
                                            <span className="flex items-center gap-2">
                                              <Calendar className="h-4 w-4" />
                                              Sağlık Durumu Detaylı ({healthStatusRecords?.length || 0})
                                            </span>
                                            {showHealthStatusTimeline ? (
                                              <ChevronUp className="h-4 w-4" />
                                            ) : (
                                              <ChevronDown className="h-4 w-4" />
                                            )}
                                          </button>
                                          {showHealthStatusTimeline && (
                                            <div className="mt-3 space-y-3">
                                              {/* Comprehensive Health Status Form */}
                                              <div className="space-y-2 p-3 bg-muted rounded-md max-h-96 overflow-y-auto">
                                                {/* Primary Status */}
                                                <div>
                                                  <label className="text-xs font-medium">Durum Kategorisi *</label>
                                                  <Select value={newPrimaryStatus} onValueChange={(v) => setNewPrimaryStatus(v)}>
                                                    <SelectTrigger className="mt-1 h-8 text-sm">
                                                      <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      <SelectItem value="SAGLIKLI">🟢 Sağlıklı</SelectItem>
                                                      <SelectItem value="YUK_KONTROLLU">🟡 Yük Kontrollü / İzleniyor</SelectItem>
                                                      <SelectItem value="HAFIF_SAKATILIK">🟠 Hafif Sakatlık</SelectItem>
                                                      <SelectItem value="ORTA_SAKATILIK">🔴 Orta Seviye Sakatlık</SelectItem>
                                                      <SelectItem value="CIDDI_SAKATILIK">⛔ Ciddi Sakatlık</SelectItem>
                                                      <SelectItem value="REHABILITASYON">🏥 Rehabilitasyon Sürecinde</SelectItem>
                                                      <SelectItem value="TEDAVI_ALTINDA">🧊 Tedavi Altında</SelectItem>
                                                      <SelectItem value="MAC_ANTRENMAN_DISI">🏠 Maç / Antrenman Dışı</SelectItem>
                                                      <SelectItem value="KARANTINA_IZOLASYON">🔒 Karantina / İzolasyon</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                </div>

                                                {/* Conditional Injury Type */}
                                                {['HAFIF_SAKATILIK', 'ORTA_SAKATILIK', 'CIDDI_SAKATILIK'].includes(newPrimaryStatus) && (
                                                  <>
                                                    <div>
                                                      <label className="text-xs font-medium">Sakatlık Türü</label>
                                                      <Select value={newInjuryType} onValueChange={(v) => { setNewInjuryType(v); setNewMuscleSubtype(''); setNewLigamentSubtype(''); setNewTendonSubtype(''); setNewBoneSubtype(''); }}>
                                                        <SelectTrigger className="mt-1 h-8 text-sm">
                                                          <SelectValue placeholder="Seçiniz" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                          <SelectItem value="MUSCLE">💪 Kas Sakatlıkları</SelectItem>
                                                          <SelectItem value="LIGAMENT">🦵 Bağ & Eklem Sakatlıkları</SelectItem>
                                                          <SelectItem value="TENDON">🦶 Tendon Sakatlıkları</SelectItem>
                                                          <SelectItem value="BONE">🦴 Kemik & Travmatik</SelectItem>
                                                          <SelectItem value="OTHER">🧠 Diğer</SelectItem>
                                                        </SelectContent>
                                                      </Select>
                                                    </div>

                                                    {/* Muscle Injury Subtype */}
                                                    {newInjuryType === 'MUSCLE' && (
                                                      <div>
                                                        <label className="text-xs font-medium">Kas Sakatlığı Türü</label>
                                                        <Select value={newMuscleSubtype} onValueChange={setNewMuscleSubtype}>
                                                          <SelectTrigger className="mt-1 h-8 text-sm">
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

                                                    {/* Ligament Injury Subtype */}
                                                    {newInjuryType === 'LIGAMENT' && (
                                                      <div>
                                                        <label className="text-xs font-medium">Bağ/Eklem Sakatlığı Türü</label>
                                                        <Select value={newLigamentSubtype} onValueChange={setNewLigamentSubtype}>
                                                          <SelectTrigger className="mt-1 h-8 text-sm">
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

                                                    {/* Tendon Injury Subtype */}
                                                    {newInjuryType === 'TENDON' && (
                                                      <div>
                                                        <label className="text-xs font-medium">Tendon Sakatlığı Türü</label>
                                                        <Select value={newTendonSubtype} onValueChange={setNewTendonSubtype}>
                                                          <SelectTrigger className="mt-1 h-8 text-sm">
                                                            <SelectValue placeholder="Seçiniz" />
                                                          </SelectTrigger>
                                                          <SelectContent>
                                                            <SelectItem value="ASIL_TENDONU">Aşil Tendonu</SelectItem>
                                                            <SelectItem value="PATELLAR_TENDONU">Patellar Tendon</SelectItem>
                                                            <SelectItem value="HAMSTRING_TENDONU">Hamstring Tendonu</SelectItem>
                                                          </SelectContent>
                                                        </Select>
                                                      </div>
                                                    )}

                                                    {/* Bone Injury Subtype */}
                                                    {newInjuryType === 'BONE' && (
                                                      <div>
                                                        <label className="text-xs font-medium">Kemik Sakatlığı Türü</label>
                                                        <Select value={newBoneSubtype} onValueChange={setNewBoneSubtype}>
                                                          <SelectTrigger className="mt-1 h-8 text-sm">
                                                            <SelectValue placeholder="Seçiniz" />
                                                          </SelectTrigger>
                                                          <SelectContent>
                                                            <SelectItem value="KIRIK">Kırık</SelectItem>
                                                            <SelectItem value="CATLAK">Çatlak</SelectItem>
                                                            <SelectItem value="DARBE_KONTUZYONU">Darbe (Kontüzyon)</SelectItem>
                                                          </SelectContent>
                                                        </Select>
                                                      </div>
                                                    )}
                                                  </>
                                                )}

                                                {/* Body Part */}
                                                <div>
                                                  <label className="text-xs font-medium">Etkilenen Bölge</label>
                                                  <Select value={newBodyPart} onValueChange={setNewBodyPart}>
                                                    <SelectTrigger className="mt-1 h-8 text-sm">
                                                      <SelectValue placeholder="Seçiniz" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      <SelectItem value="AYAK_AYAK_BILEGI">Ayak / Ayak Bileği</SelectItem>
                                                      <SelectItem value="DIZ">Diz</SelectItem>
                                                      <SelectItem value="BALDIR">Baldır</SelectItem>
                                                      <SelectItem value="HAMSTRING">Hamstring</SelectItem>
                                                      <SelectItem value="QUADRICEPS">Quadriceps</SelectItem>
                                                      <SelectItem value="KALCA">Kalça</SelectItem>
                                                      <SelectItem value="KASIK">Kasık</SelectItem>
                                                      <SelectItem value="BEL_SIRT">Bel / Sırt</SelectItem>
                                                      <SelectItem value="OMUZ">Omuz</SelectItem>
                                                      <SelectItem value="BOYUN">Boyun</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                </div>

                                                {/* Rehab Phase */}
                                                <div>
                                                  <label className="text-xs font-medium">Rehabilitasyon Aşaması</label>
                                                  <Select value={newRehabPhase} onValueChange={setNewRehabPhase}>
                                                    <SelectTrigger className="mt-1 h-8 text-sm">
                                                      <SelectValue placeholder="Seçiniz" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      <SelectItem value="AKUT_DONEM">🧊 Akut Dönem</SelectItem>
                                                      <SelectItem value="HAFIF_AKTIVITE">🏃 Hafif Aktivite</SelectItem>
                                                      <SelectItem value="KUVVET_MOBILITE">🏋️ Kuvvet & Mobilite</SelectItem>
                                                      <SelectItem value="TOPLA_CALISMA">⚽ Topla Çalışma</SelectItem>
                                                      <SelectItem value="MAC_ONCESI_HAZIRLIGI">🧠 Maç Öncesi Hazırlık</SelectItem>
                                                      <SelectItem value="TAM_KATILIM_ONAY">✅ Tam Katılım Onayı</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                </div>

                                                {/* Training Participation */}
                                                <div>
                                                  <label className="text-xs font-medium">Antrenman Katılım Durumu</label>
                                                  <Select value={newTrainingParticipation} onValueChange={setNewTrainingParticipation}>
                                                    <SelectTrigger className="mt-1 h-8 text-sm">
                                                      <SelectValue placeholder="Seçiniz" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      <SelectItem value="ANTRENMANA_KATILAMAZ">❌ Antrenmana Katılamaz</SelectItem>
                                                      <SelectItem value="KISITLI_KATILIM">⚠️ Kısıtlı Katılım</SelectItem>
                                                      <SelectItem value="TAKIMDAN_AYRI">🟡 Takımdan Ayrı</SelectItem>
                                                      <SelectItem value="TAM_KATILIM">🟢 Tam Katılım</SelectItem>
                                                      <SelectItem value="MAC_HAZIR">🎯 Maça Hazır</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                </div>

                                                {/* Estimated Return Days */}
                                                <div>
                                                  <label className="text-xs font-medium">Tahmini Dönüş Süresi</label>
                                                  <Select value={newEstimatedReturnDays} onValueChange={setNewEstimatedReturnDays}>
                                                    <SelectTrigger className="mt-1 h-8 text-sm">
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

                                                {/* Clinical Notes */}
                                                <div>
                                                  <label className="text-xs font-medium">Doktor / Fizyoterapist Notu</label>
                                                  <textarea
                                                    placeholder="MR sonucu, doktor önerisi, yüklenme limiti, risk notları..."
                                                    value={newClinicalNotes}
                                                    onChange={(e) => setNewClinicalNotes(e.target.value)}
                                                    className="mt-1 w-full px-2 py-1 border border-input rounded text-sm resize-none h-12"
                                                  />
                                                </div>

                                                <Button
                                                  size="sm"
                                                  onClick={() => addHealthStatus.mutate()}
                                                  disabled={addHealthStatus.isPending || !newPrimaryStatus}
                                                  className="w-full bg-orange-600 hover:bg-orange-700"
                                                >
                                                  <Plus className="h-4 w-4 mr-2" />
                                                  Ekle
                                                </Button>
                                              </div>

                                              {/* Health Status Records Timeline */}
                                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                                {healthStatusRecords && healthStatusRecords.length > 0 ? (
                                                  healthStatusRecords.map((record: any) => (
                                                    <div
                                                      key={record.id}
                                                      className="flex items-start justify-between p-2 bg-muted rounded-sm text-sm"
                                                    >
                                                      <div className="flex-1 min-w-0">
                                                        <p className="font-medium flex items-center gap-2">
                                                          {record.primaryStatus === 'SAGLIKLI' && '🟢'}
                                                          {record.primaryStatus === 'YUK_KONTROLLU' && '🟡'}
                                                          {record.primaryStatus === 'HAFIF_SAKATILIK' && '🟠'}
                                                          {record.primaryStatus === 'ORTA_SAKATILIK' && '🔴'}
                                                          {record.primaryStatus === 'CIDDI_SAKATILIK' && '⛔'}
                                                          {record.primaryStatus === 'REHABILITASYON' && '🏥'}
                                                          {record.primaryStatus === 'TEDAVI_ALTINDA' && '🧊'}
                                                          {record.primaryStatus === 'MAC_ANTRENMAN_DISI' && '🏠'}
                                                          {record.primaryStatus === 'KARANTINA_IZOLASYON' && '🔒'}
                                                          {record.primaryStatus}
                                                        </p>
                                                        {record.bodyPart && <p className="text-xs text-muted-foreground mt-1">📍 {record.bodyPart}</p>}
                                                        {record.rehabPhase && <p className="text-xs text-muted-foreground">🏃 Rehab: {record.rehabPhase}</p>}
                                                        {record.trainingParticipation && <p className="text-xs text-muted-foreground">⚽ {record.trainingParticipation}</p>}
                                                        {record.estimatedReturnDays && <p className="text-xs text-muted-foreground">📅 Dönüş: {record.estimatedReturnDays}</p>}
                                                        {record.clinicalNotes && <p className="text-xs mt-1 text-muted-foreground break-words">📝 {record.clinicalNotes}</p>}
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                          {new Date(record.createdAt).toLocaleDateString('tr-TR', {
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
                                                        onClick={() => deleteHealthStatus.mutate(record.id)}
                                                        disabled={deleteHealthStatus.isPending}
                                                        className="h-6 w-6 p-0 flex-shrink-0 ml-2"
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
                                        <DialogFooter>
                                          <Button
                                            variant="outline"
                                            onClick={() => {
                                              setShowEditPlayerDialog(false);
                                              setSelectedPlayerToEdit(null);
                                              setFormEditPlayerName("");
                                              setFormEditPlayerEmail("");
                                              setFormEditPlayerPosition("");
                                              setFormEditPlayerBirthDate("");
                                              setFormEditPlayerHealth("");
                                              setFormEditPlayerCoachNotes("");
                                            }}
                                          >
                                            İptal
                                          </Button>
                                          <Button
                                            onClick={() => updatePlayer.mutate(member.userId)}
                                            disabled={!formEditPlayerName || !formEditPlayerEmail || updatePlayer.isPending}
                                          >
                                            {updatePlayer.isPending ? "Kaydediliyor..." : "Kaydet"}
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>

                                    {/* Delete Player Button */}
                                    <Dialog open={showDeletePlayerDialog && selectedPlayerToDelete?.id === member.id} onOpenChange={(open) => {
                                      if (!open) setSelectedPlayerToDelete(null);
                                      setShowDeletePlayerDialog(open);
                                    }}>
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setSelectedPlayerToDelete(member)}
                                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <div className="flex items-center gap-2">
                                            <AlertTriangle className="h-5 w-5 text-destructive" />
                                            <DialogTitle>Oyuncuyu Çıkar</DialogTitle>
                                          </div>
                                          <DialogDescription>
                                            <strong>{member.user.name}</strong> oyuncusunu <strong>{selectedTeamData?.name}</strong> takımından çıkarmak istediğinizden emin misiniz?
                                          </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                          <Button
                                            variant="outline"
                                            onClick={() => {
                                              setShowDeletePlayerDialog(false);
                                              setSelectedPlayerToDelete(null);
                                            }}
                                          >
                                            İptal
                                          </Button>
                                          <Button
                                            variant="destructive"
                                            onClick={() => removePlayerFromTeam.mutate(member.userId)}
                                            disabled={removePlayerFromTeam.isPending}
                                          >
                                            {removePlayerFromTeam.isPending ? "Çıkarılıyor..." : "Evet, Çıkar"}
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    <Card className="flex items-center justify-center h-96">
                      <div className="text-center text-muted-foreground">
                        <Users className="h-8 w-8 mx-auto opacity-50 mb-2" />
                        <p>Bir takım seçin</p>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
