"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-6 text-center max-w-md">
        <div className="text-9xl font-bold text-muted-foreground/20">404</div>
        <div>
          <h1 className="text-3xl font-bold mb-2">Sayfa Bulunamadı</h1>
          <p className="text-muted-foreground">
            Aradığınız sayfa mevcut değil veya taşınmış olabilir.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard">
            <Button variant="default" className="gap-2">
              <Home className="h-4 w-4" />
              Ana Sayfaya Dön
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Geri Dön
          </Button>
        </div>
      </div>
    </div>
  );
}
