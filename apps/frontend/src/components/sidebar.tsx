"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Home,
  Library,
  Target,
  ClipboardList,
  BarChart3,
  Users,
  Building2,
  CheckSquare,
  LogOut,
  Menu,
  X,
  UserCog,
  Calendar,
  Trophy,
  Settings,
} from "lucide-react";
import { routes } from "@/lib/routes";
import { useClubStore } from "@/store/useClubStore";
import { useState } from "react";

const menuItems = [
  { icon: Home, label: "Kontrol Paneli", href: routes.dashboard, roles: ["ADMIN", "COACH", "PLAYER"] },
  { icon: Library, label: "Antrenman Kütüphanesi", href: routes.drills, roles: ["ADMIN", "COACH", "PLAYER"] },
  { icon: Target, label: "Taktik Tahtası", href: routes.drillBuilder, roles: ["ADMIN", "COACH", "PLAYER"] },
  { icon: ClipboardList, label: "Antrenman Planlayıcı", href: routes.planner, roles: ["ADMIN", "COACH"] },
  { icon: Calendar, label: "Sezon Planlayıcı", href: routes.seasonPlanner, roles: ["ADMIN", "COACH"] },
  { icon: Trophy, label: "A Takım Merkezi", href: routes.aTeam, roles: ["ADMIN", "COACH"] },
  { icon: BarChart3, label: "Analizler", href: routes.analytics, roles: ["ADMIN", "COACH"] },
  { icon: Users, label: "Kadro Yönetimi", href: routes.admin.teams, roles: ["ADMIN"] },
  { icon: UserCog, label: "Kullanıcılar", href: routes.admin.users, roles: ["ADMIN"] },
  { icon: CheckSquare, label: "Yoklama", href: routes.admin.attendance, roles: ["ADMIN"] },
  { icon: Settings, label: "Ayarlar", href: routes.admin.settings, roles: ["ADMIN"] },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { selectedClub } = useClubStore();
  const userRole = (session as any)?.role;
  const token = (session as any)?.accessToken as string | undefined;

  const { data: clubs } = useQuery({
    queryKey: ["clubs"],
    queryFn: async () => {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/clubs", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Kulüpler yüklenemedi");
      return res.json();
    },
    enabled: !!token,
  });

  const clubName = selectedClub?.name || clubs?.[0]?.name || "NGCS Platform";

  // Debug: Konsola rol bilgisini yazdır
  useEffect(() => {
    console.log('Sidebar - User Role:', userRole);
    console.log('Sidebar - Session:', session);
  }, [userRole, session]);

  const filteredMenu = menuItems.filter((item) => item.roles.includes(userRole));

  const NavContent = () => (
    <>
      <div className="space-y-1">
        {filteredMenu.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
              )}
              onClick={() => setIsOpen(false)}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
      <div className="mt-auto pt-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          onClick={() => {
            signOut({ callbackUrl: routes.signin });
          }}
        >
          <LogOut className="h-4 w-4" />
          Çıkış Yap
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div className="fixed inset-y-0 left-0 w-64 bg-background border-r p-4 flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-6 mt-14">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">{clubName[0]}</span>
              </div>
              <span className="font-bold text-lg">{clubName}</span>
            </div>
            <NavContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col border-r bg-background p-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">{clubName[0]}</span>
          </div>
          <span className="font-bold text-lg">{clubName}</span>
        </div>
        <NavContent />
      </aside>
    </>
  );
}
