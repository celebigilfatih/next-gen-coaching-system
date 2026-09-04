"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useClubStore, Club } from "@/store/useClubStore";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2 } from "lucide-react";
import { fetchAPI } from "@/lib/api";

export function ClubSelector() {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken as string | undefined;
  const { selectedClub, setSelectedClub } = useClubStore();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        // Get token from session
        if (!token) {
          console.log('No token available yet');
          setLoading(false);
          return;
        }
        
        const res = await fetchAPI("/clubs", { token });
        if (res.ok) {
          const data = await res.json();
          setClubs(data);
        } else {
          console.error('Failed to fetch clubs:', res.status, res.statusText);
        }
      } catch (error) {
        console.error("Failed to fetch clubs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span>Yükleniyor...</span>
      </div>
    );
  }

  if (!clubs.length) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span>Henüz kulüp yok</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <Select
        value={selectedClub?.id || ""}
        onValueChange={(value) => {
          const club = clubs.find((c) => c.id === value);
          setSelectedClub(club || null);
        }}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Kulüp seçin" />
        </SelectTrigger>
        <SelectContent>
          {clubs.map((club) => (
            <SelectItem key={club.id} value={club.id}>
              {club.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
