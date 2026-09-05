# ADR-0013: Genişletilmiş koç navigasyonu ve shadcn shell

- **Status:** Accepted
- **Date:** 2026-09-05
- **Owners / approvers:** Explicit user approval; named design owner TBD
- **Supersedes / superseded by:** Extends ADR-0011
- **Related:** ADR-0002, ADR-0009, ADR-0011, REQ-008, REQ-011

## Context

ADR-0011 beş ana görev rotasını ve shadcn/Radix tabanlı “Koç Operasyon Masası”
shell'ini kabul etti. Eski frontend kaynağındaki genel bakış, egzersiz kütüphanesi,
yoklama ve ayarlar girişleri yeni shell'de görünür değildi. Kullanıcı 2026-09-05'te
eski arayüzün görsel dilini koruyarak bu eksik menülerin yeni arayüze alınmasını
açıkça onayladı.

## Decision

- `/app/dashboard`, `/app/library`, `/app/attendance` ve `/app/settings` destek
  rotaları ortak shell'e eklenir; `/app` genel bakışa yönlenir.
- Masaüstü navigasyonu `Genel`, `Planlama` ve `Takım` başlıkları altında dokuz
  adreslenebilir giriş sunar.
- Mobil alt navigasyonda ADR-0011 ile kabul edilen beş ana görev korunur; destek
  rotaları shadcn `Sheet` içindeki tam navigasyondan erişilir.
- Üst çubuk shadcn `Input`, `Avatar`, `DropdownMenu`, `Tooltip`, `Separator` ve
  bildirim yüzeylerini kullanır; takım/sezon bağlamı ve menü araması görünürdür.
- Genel Bakış gerçek workspace verisini özetler. Egzersiz Kütüphanesi mevcut drill
  verisini faz ve kapsamla listeler. Yoklama, antrenman ayrıntısındaki katılım
  sekmesine derin bağlantı verir. Ayarlar yalnız doğrulanmış kullanıcı/takım/sezon
  bağlamını ve geçici oturum kısıtını gösterir.
- Analizler, scouting, sağlık, kullanıcı ve kulüp yönetimi bu kararla navigasyona
  alınmaz. Bunlar mevcut MVP sınırı ve ayrıca yetki/veri politikası onayı gerektirir.
- Backend API, Prisma şeması ve çalışma zamanı yetkilendirmesi değişmez.

## Consequences

Koç, eski arayüzdeki temel destek işlevlerine tek shell içinde ulaşır. Dokuz girişin
mobil alt çubuğa sıkıştırılmaması küçük ekranda görev önceliğini korur; destek
rotaları için bir ek menü açma adımı gerekir. Genel bakış yeni varsayılan `/app`
rotası olur, login sonrası mevcut `/app/week` yönlendirmesi değişmez.

## Verification

- Frontend typecheck, lint, Vitest, production build ve Sites worker testleri geçti.
- Masaüstünde dört yeni rota ve menü başlıkları gerçek backend fixture'ıyla açıldı.
- 390 × 844 mobil görünümde beşli alt navigasyon, tam menü `Sheet`'i, Ayarlar
  rotası ve yatay taşma kontrol edildi.
- Tarayıcı console error/warning günlüğü boş doğrulandı.
- Kaynak ve uygulama görselleri `design-qa.md` içinde karşılaştırıldı.

## Open Questions

- Formal WCAG hedefi, browser destek matrisi ve tasarım owner'ı `TBD`.
- Kullanıcı/kulüp yönetimi için ayrı yönetim bilgi mimarisi `TBD`.
- Production hosting ve kalıcı oturum ADR-0010 implementation girdilerini bekler.
