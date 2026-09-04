# ADR-0011: shadcn tabanlı rotalı koç çalışma alanı

- **Status:** Accepted
- **Date:** 2026-09-04
- **Owners / approvers:** Explicit user approval; named design owner TBD
- **Supersedes / superseded by:** Extends ADR-0009
- **Related:** ADR-0003, ADR-0009, REQ-008, BL-014

## Context

ADR-0009 koç öncelikli React Router frontend'ini ve “Koç Operasyon Masası”
görsel yönünü kabul etti. Tek route içindeki görünüm modları paylaşılabilir URL,
modüler alan bileşeni ve ortak taktik çalışma yüzeyi sağlamıyordu.

## Decision

- React Router Framework Mode, React 19, TypeScript ve Vite korunur.
- UI katmanı Tailwind CSS değişkenleri ve kullanılan shadcn/Radix primitive'leriyle
  bileşenleştirilir; ikon seti Phosphor'dur.
- Lacivert–mavi kimlik, amber maç vurgusu, Inter ve Barlow Condensed korunur.
- Ortak `/app` shell'i şu adreslenebilir görev rotalarını sunar: `week`,
  `trainings`, `tactics`, `squad`, `matches`; plan, egzersiz ve maç ayrıntıları
  kimlikli alt rotalardır.
- Haftalık görünüm yerel takvimde Pazartesi–Pazar hesaplanır; önceki/sonraki,
  bugün ve tarih seçimi ay/yıl sınırlarında çalışır.
- Masaüstü ve tablet tam çalışma hedefidir. Mobilde beşli navigasyon, özetler ve
  tahta görüntüleme korunur. Formal WCAG hedefi `TBD` kalır.
- Next.js, NextAuth, Zustand veya BFF eklenmez.

## Consequences

Rotalar paylaşılabilir ve alanlar ayrı test edilebilir hale gelir. Konva editörü
istemci paketini büyütür; rota bazlı chunk olarak yüklenir. Mevcut memory-only JWT
davranışı değişmez ve ADR-0010 `Proposed` kalır.

## Verification

Frontend typecheck, lint, Vitest, production/Sites build ve Playwright geçti.
Playwright beş görev rotasını 1440, 1024 ve 390 piksel genişlikte doğruladı.

## Open Questions

- Formal erişilebilirlik seviyesi, browser destek matrisi ve tasarım owner'ı `TBD`.
- Production hosting/origin ve kalıcı oturum ADR-0010 kapsamındadır.
