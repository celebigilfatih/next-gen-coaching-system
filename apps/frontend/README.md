# NGCS frontend

ADR-0009 ile onaylanan koç öncelikli frontend, React/TypeScript ve React Router
Framework Mode SPA olarak bu workspace'te uygulanır. shadcn/Radix, Tailwind CSS,
Phosphor ve React-Konva tabanı ADR-0011 ile; taktik tahta sözleşmesi ADR-0012 ile
kabul edilmiştir. Görsel hedef “Koç Operasyon Masası”dır.

Ana görev rotaları `/app/week`, `/app/trainings`, `/app/tactics`, `/app/squad` ve
`/app/matches`; destek rotaları `/app/dashboard`, `/app/library`,
`/app/attendance` ve `/app/settings` adreslerindedir. Plan, egzersiz ve maç
detayları kimlikli alt rotalardır. Masaüstü tam navigasyonu dokuz girişi gösterir;
mobil alt navigasyon beş ana görevi korur ve destek rotaları menü Sheet'i içindedir.

## Yerel çalışma

```bash
npm install
npm run dev
```

Varsayılan backend adresi `http://localhost:4000`; farklı bir ortam için
`VITE_API_BASE_URL` kullanılır. JWT yalnız process belleğinde tutulur ve sayfa
yenilendiğinde oturum sona erer.

## Kalite kapıları

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
npm run test:e2e
npm run build
npm run test:sites
```

Browser E2E yalnız adı `e2e` veya `test` içeren dedicated PostgreSQL veritabanında
ve açık destructive-reset onayıyla çalışır:

```bash
E2E_DATABASE_URL=postgresql://.../ngcs_e2e \
E2E_ALLOW_DESTRUCTIVE_RESET=true \
E2E_COACH_PASSWORD=... \
npm run test:e2e
```

Komut migration'ı uygular, deterministik kulüp/takım/sezon fixture'ını kurar,
backend ile frontend'i geçici portlarda başlatır ve gerçek login → kulüp taktik
egzersizi → plan snapshot → maç tahtası → ikinci kulüpten erişim reddi zincirini
doğrular. Ana rotalar ayrıca 1440, 1024 ve 390 piksel genişlikte kontrol edilir;
genişletilmiş shell ve destek rotaları browser/design QA ile doğrulanır.
Credential repository'ye yazılmaz.

Production hosting, kalıcı oturum ve ölçülebilir erişilebilirlik hedefi `TBD`.
