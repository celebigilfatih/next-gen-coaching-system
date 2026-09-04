"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Bell, Search, Settings, ChevronDown, Menu, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import { useClubStore } from "@/store/useClubStore";
import { routes } from "@/lib/routes";

interface TopBarProps {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { data: session } = useSession();
  const { selectedClub } = useClubStore();
  const token = (session as any)?.accessToken as string | undefined;
  
  const { data: clubs } = useQuery({
    queryKey: ["clubs"],
    queryFn: async () => {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/clubs", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!token,
  });

  const clubName = selectedClub?.name || clubs?.[0]?.name;

  const userName = (session as any)?.user?.name ?? "Kullanıcı";
  const userEmail = (session as any)?.user?.email ?? "";
  const userRole = (session as any)?.role ?? "USER";

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      ADMIN: "Yönetici",
      COACH: "Antrenör",
      PLAYER: "Sporcu",
    };
    return roles[role] || role;
  };

  return (
    <div className="fixed top-0 left-0 right-0 lg:left-64 z-40 bg-background border-b">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left Section */}
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Search */}
          <div className="relative hidden md:block w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Ara..."
              className="pl-10 pr-4"
            />
          </div>

          {/* Club Name Indicator */}
          {clubName && (
            <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
              <Building2 className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-xs font-bold text-slate-600">{clubName}</span>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="icon" onClick={() => window.location.href = routes.adminSettings}>
            <Settings className="h-5 w-5" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-600 text-white text-xs">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground">{getRoleLabel(userRole)}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.location.href = routes.dashboard}>
                <span>Kontrol Paneli</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Profil Ayarları</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Tercihler</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: routes.signin })}
                className="text-red-600 focus:text-red-600"
              >
                <span>Çıkış Yap</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
