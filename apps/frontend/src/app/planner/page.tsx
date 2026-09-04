"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Loader2, 
  Plus, 
  X, 
  Clock, 
  Calendar, 
  Layout, 
  ChevronRight, 
  Trash2, 
  Dumbbell, 
  TrendingUp, 
  Activity, 
  Wind,
  Trophy,
  Users,
  Save,
  Flame,
  Zap,
  Coffee,
  Target,
  FileText,
  ClipboardList
} from "lucide-react";
import { TrainingPlanBuilder } from "@/components/training-plan-builder";
import { ErrorBoundary } from "@/components/error-boundary";
import { useRouter } from "next/navigation";

export default function PlannerPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  React.useEffect(() => {
    const role = (session as any)?.role;
    if (session && role !== "ADMIN" && role !== "COACH") {
      window.location.href = "/dashboard";
    }
  }, [session]);

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen bg-background">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 lg:ml-64 flex flex-col">
          <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          
          <main className="flex-1 overflow-auto mt-[57px]">
            <div className="p-8 lg:p-10 max-w-[1600px] mx-auto space-y-10">
              {/* Page Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <ClipboardList className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground uppercase">Antrenman Planlayıcı</h1>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-70">Yeni antrenman seansları oluşturun ve drilleri yönetin.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-10">
                <TrainingPlanBuilder 
                  onSuccess={(plan) => {
                    alert("✅ Plan başarıyla oluşturuldu!");
                  }}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
