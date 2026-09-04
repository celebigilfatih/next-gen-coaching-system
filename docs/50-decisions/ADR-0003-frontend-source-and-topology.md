# ADR-0003: Frontend kaynağı ve repository topolojisi

- **Status:** Accepted
- **Date:** 2026-08-31
- **Owners / approvers:** Explicit user approval; named repository owner TBD
- **Supersedes / superseded by:** N/A
- **Related:** `apps/frontend`, `docker-compose.yml`

## Context

`apps/frontend`, commit `8ea4664ca81e693c4b22a18e499026b693c46509`
hedefli bir gitlink'ti. `.gitmodules` kaydı, kaynak URL'si ve hedef commit objesi
yerel geçmişte yoktur. Kayıtlı GitHub origin'inin güncel ağacında da yalnız aynı
gitlink vardır; `.gitmodules` ve hedef commit için erişilebilir repository kanıtı
bulunamamıştır. Eski frontend bu kanıtlardan kurtarılamaz.

## Decision Drivers

Kaynak geçmişini korumak, yanlış frontend üretimini önlemek, sahiplik ve delivery
modelini açık hale getirmek.

## Considered Options

1. Orijinal URL/commit'i doğrulayıp submodule yapısını onarmak.
2. Kaynağı normal monorepo dizinine kontrollü biçimde taşımak.
3. Bu repository'yi backend-only kabul edip frontend'i ayrı sistem olarak belgelemek.

## Decision

Option 2 is accepted:

- Repository, backend ve gelecekteki frontend için monorepo olarak yönetilir.
- Kırık gitlink kaldırılır; `apps/frontend` normal izlenen dizin olarak ayrılır.
- Kaynak kanıtı olmadığı için eski frontend yeniden yaratılmış gibi gösterilmez.
- Framework, package manager, UI architecture ve deployment modeli ayrı bir karar
  kapısına kadar `TBD` kalır.
- Çalıştırılabilir frontend bulunana kadar Compose frontend servisi ve doğrulanmamış
  frontend environment değişkenleri kaldırılır.

## Consequences

Repository topolojisi artık nettir ve submodule operasyonuna ihtiyaç yoktur. Ancak
frontend uygulaması henüz mevcut değildir; tam yığın build, UI testleri ve frontend
deployment yeni teknoloji/ürün kararı uygulanana kadar kapsam dışıdır. Backend ve
CDSK akışları bağımsız ve doğrulanabilir kalır.

## Rollout and Rollback

Gitlink kaldırılır, framework-neutral bir workspace bağlam belgesi eklenir ve
Compose yalnız doğrulanmış PostgreSQL/backend servislerini içerir. Rollback yalnız
orijinal repository URL'si ve hedef commit erişimi kanıtlanırsa submodule olarak
yapılabilir; bilinmeyen bir URL tahmin edilmez.

## Open Questions

- Birincil persona, ilk frontend kullanıcı akışı, framework/runtime ve package
  manager ADR-0009 ile çözüldü.
- Frontend hosting ve ölçülebilir erişilebilirlik hedefleri nelerdir?

## Implementation Outcome

- `apps/frontend` gitlink'i kaldırıldı ve normal monorepo dizini ayrıldı.
- Dizin yalnız framework-neutral bir README içerir; uygulama scaffold'u üretilmedi.
- Compose ve `.env.example` doğrulanmamış Next.js/NextAuth varsayımlarından arındırıldı.
