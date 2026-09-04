"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setError(res.error);
    else window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50/30 p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white shadow-xl border border-orange-100 p-8 rounded-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-orange-600">NGCS Platform</h1>
          <p className="text-sm text-muted-foreground font-medium">Lütfen bilgilerinizi girin</p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="coach@demo.com"
              className="border border-slate-200 px-4 py-2.5 rounded-xl w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="border border-slate-200 px-4 py-2.5 rounded-xl w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
              required
            />
          </div>
        </div>
        {error && <p className="text-red-600 text-xs font-bold text-center bg-red-50 py-2 rounded-lg">{error}</p>}
        <button type="submit" disabled={loading} className="bg-orange-600 text-white font-bold py-3 rounded-xl w-full hover:bg-orange-700 shadow-lg shadow-orange-200 transition-all active:scale-[0.98] disabled:opacity-50">
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>
    </div>
  );
}
