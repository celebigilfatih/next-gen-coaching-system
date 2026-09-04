"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  Trophy, 
  Target, 
  Calendar, 
  Library, 
  ArrowRight, 
  Zap, 
  Users, 
  BarChart3,
  CheckCircle2,
  PlayCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const { data: session, status } = useSession();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">NGCS <span className="text-orange-600">Platform</span></span>
          </div>
          <div className="flex items-center gap-4">
            {status === "authenticated" ? (
              <Link href="/dashboard">
                <Button variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50">
                  Dashboard'a Git
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/signin">
                  <Button variant="ghost" className="text-slate-600 hover:text-orange-600">Giriş Yap</Button>
                </Link>
                <Link href="/signin">
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-200">
                    Hemen Başla
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto relative">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-50 -z-10" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-50 rounded-full blur-3xl opacity-50 -z-10" />
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-bold uppercase tracking-wider">
                <Zap className="h-4 w-4" />
                Yeni Nesil Koçluk Deneyimi
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1]">
                Takımınızı <span className="text-orange-600">Veriyle</span> Yönetin, Zirveye Taşıyın.
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
                NGCS, elit futbol antrenörleri için tasarlanmış en kapsamlı antrenman yönetimi, taktik planlama ve performans analiz platformudur.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/signin">
                  <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white h-14 px-8 text-lg font-bold shadow-xl shadow-orange-200 w-full sm:w-auto">
                    Ücretsiz Dene <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <div className="flex items-center gap-4 px-4 text-slate-500 font-medium">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                    ))}
                  </div>
                  <span>+500 Antrenörün Tercihi</span>
                </div>
              </div>
            </div>
            
            <div className="relative lg:ml-12">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-4 shadow-2xl rotate-2 relative overflow-hidden group hover:rotate-0 transition-transform duration-500">
                <div className="bg-white rounded-2xl overflow-hidden shadow-inner aspect-[4/3] flex items-center justify-center border-4 border-orange-400/20">
                  <div className="text-center space-y-4">
                    <Trophy className="h-20 w-20 text-orange-100 mx-auto opacity-50" />
                    <p className="text-orange-600 font-black text-2xl uppercase tracking-widest">Taktik Tahtası</p>
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-8 right-8 w-12 h-12 bg-white/20 rounded-full blur-xl" />
                <div className="absolute bottom-8 left-8 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
              </div>
              
              {/* Feature Tags */}
              <div className="absolute -left-8 top-1/4 bg-white p-4 rounded-2xl shadow-xl border border-orange-100 flex items-center gap-3 animate-bounce duration-[3000ms]">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Sezon Planı</p>
                  <p className="text-sm font-bold text-slate-900">100% Tamamlandı</p>
                </div>
              </div>
              
              <div className="absolute -right-4 bottom-1/4 bg-white p-4 rounded-2xl shadow-xl border border-orange-100 flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Performans</p>
                  <p className="text-sm font-bold text-slate-900">+12% Artış</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50 border-y border-orange-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Her Şey Tek Bir Platformda</h2>
            <p className="text-slate-600">Modern futbolun gereksinim duyduğu tüm araçlar, antrenörlerin işini kolaylaştırmak için entegre edildi.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                icon: Library, 
                title: "Drill Kütüphanesi", 
                desc: "Yüzlerce hazır antrenman drilli veya kendi özel setlerinizi oluşturun.",
                color: "orange"
              },
              { 
                icon: Target, 
                title: "Taktik Tahtası", 
                desc: "Görsel ve interaktif tahta ile set hücumlarını ve savunma kurgularını planlayın.",
                color: "blue"
              },
              { 
                icon: Calendar, 
                title: "Sezon Planlayıcı", 
                desc: "Makro ve mikro döngülerle tüm sezonu haftalık bazda organize edin.",
                color: "green"
              },
              { 
                icon: Users, 
                title: "Performans Analizi", 
                desc: "GPS ve wellness verileriyle oyuncu yükünü ve gelişimini takip edin.",
                color: "purple"
              }
            ].map((f, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group">
                <div className={`w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-6 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300`}>
                  <f.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-600/10 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">
              Takımınızı Dönüştürmeye <br/> <span className="text-orange-500">Bugün Başlayın.</span>
            </h2>
            <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed">
              Profesyonel antrenörlerin kullandığı araçlarla fark yaratın. Üstelik kurulum gerektirmez, hemen kullanmaya başlayın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/signin">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white h-14 px-10 text-lg font-bold rounded-2xl shadow-xl shadow-orange-600/20">
                  Ücretsiz Hesap Oluştur
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 h-14 px-10 text-lg font-bold rounded-2xl">
                Demoyu İzle
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-orange-600 flex items-center justify-center">
              <Trophy className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900">NGCS Platform</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 NGCS Platform. Tüm hakları saklıdır.</p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-orange-600 transition-colors">Twitter</a>
            <a href="#" className="text-slate-400 hover:text-orange-600 transition-colors">LinkedIn</a>
            <a href="#" className="text-slate-400 hover:text-orange-600 transition-colors">Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
