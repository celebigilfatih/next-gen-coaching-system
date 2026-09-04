"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Building2 } from "lucide-react";

interface ClubSetupModalProps {
  open: boolean;
  onClose: () => void;
}

export function ClubSetupModal({ open, onClose }: ClubSetupModalProps) {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;
  const router = useRouter();
  const [clubName, setClubName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubName.trim() || !token) return;

    setLoading(true);
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/clubs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: clubName.trim(),
          description: description.trim() || clubName.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error("Kulüp oluşturulamadı");
      }

      const club = await res.json();
      
      // Admin kullanıcısını yeni kulübe ata
      const userId = (session as any)?.userId;
      if (userId) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clubs/${club.id}/assign`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId }),
        });
      }

      alert(`✅ ${clubName} kulübü başarıyla oluşturuldu!`);
      onClose();
      router.refresh();
    } catch (error) {
      console.error("Club creation error:", error);
      alert("❌ Kulüp oluşturulurken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Hoş Geldiniz! 🎉</DialogTitle>
              <DialogDescription className="mt-1">
                Kulübünüzün adını girin ve başlayın
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="clubName">Kulüp Adı *</Label>
            <Input
              id="clubName"
              placeholder="Örn: Galatasaray, Fenerbahçe, Beşiktaş..."
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Açıklama (İsteğe bağlı)</Label>
            <Input
              id="description"
              placeholder="Kulübünüz hakkında kısa bilgi..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={!clubName.trim() || loading}
              className="flex-1"
            >
              {loading ? "Oluşturuluyor..." : "Kulübü Oluştur"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Bu bilgileri daha sonra ayarlardan değiştirebilirsiniz
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
