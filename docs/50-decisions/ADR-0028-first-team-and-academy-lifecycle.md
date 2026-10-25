# ADR-0028: A Takım ve altyapı takım yaşam döngüsü

- **Status:** Accepted
- **Date:** 2026-09-08
- **Owners / approvers:** Kullanıcı 2026-09-08 tarihinde planı açıkça onayladı; named product/data/security owner `TBD`
- **Supersedes / superseded by:** Sekmeli sunum kararı ADR-0029 tarafından kısmen superseded; yaşam döngüsü ve yetki kararı geçerlidir
- **Related:** ADR-0005, ADR-0007, ADR-0022, ADR-0023, REQ-019, BL-051, CR-020

## Context

Takım kataloğu A Takım ile altyapıyı ayrı yaşam döngüleri olarak yönetmiyordu.
Legacy `PlayerGroup` yazımı takımı seçili kulüp sezonuna bağlamıyor, aynı takım
kart ve tabloda yineleniyor, sabit yaş enum'u kulüplerin `U17`, `U19` veya
`B Takım` gibi gerçek kademe adlarını temsil edemiyordu. Sportif geçmişi silmeden
bir takımı aktif operasyonlardan çıkaracak bir durum alanı da yoktu.

## Decision

- Bir kulüpte yalnız bir aktif `A_TAKIM` bulunur. Bu kural, servis kontrolüne ek
  olarak `Team.clubId` üzerinde `categoryKey = 'A_TAKIM' AND archivedAt IS NULL`
  koşullu tekil indeksle güvenceye alınır.
- İlk A Takım kaydını yalnız `SYSTEM_ADMIN` oluşturur. `SYSTEM_ADMIN` ile aynı
  kulübün `CLUB_ADMIN` hesabı adı ve yaş/kademe etiketini düzenleyebilir. A Takım
  arşivlenemez veya silinemez.
- Altyapı takımlarını `SYSTEM_ADMIN` ve aynı kulübün `CLUB_ADMIN` hesabı
  oluşturabilir, düzenleyebilir, arşivleyebilir ve geri yükleyebilir. `COACH` ve
  `PLAYER` salt okunurdur.
- Oluşturma belirli bir `ClubSeason` gerektirir. `PlayerGroup`, canonical `Team`,
  legacy `Season`, `TeamSeason` ve audit olayı tek Serializable transaction
  içinde yazılır. Ad/kademe güncellemesi ile archive/restore da legacy ve
  canonical kayıtları atomik tutar.
- `PlayerGroup.ageGroup` ve `Drill.ageGroup` mevcut değerler korunarak metne
  geçirilir. Yeni değerler trim edilir, kontrol karakteri içeremez ve 1–32
  karakterdir.
- `Team.archivedAt` ve `PlayerGroup.archivedAt` geçmiş ilişkileri silmeden aktif
  katalog ve workspace seçiminden çıkarır. Restore aynı kimlik ve sezon geçmişini
  tekrar etkinleştirir.
- Takım oluşturma, güncelleme, arşivleme ve geri yükleme ayrı güvenlik audit
  olaylarıdır. İstemci kulüp, sınıflandırma, sezon veya sahipliği update yoluyla
  değiştiremez.

## Consequences

Bu ADR'nin ilk tesliminde `/app/teams` A Takım ve Altyapı sekmelerine ayrılmış,
URL durumu `?view=first-team|academy` ile korunmuştu. ADR-0029 yalnız bu sunumu
iki sidebar hedefine dönüştürür. A Takımın tek korunan kart, altyapının aranabilir
cursor tabanlı dizin ve yönetici olmayan rollerin salt-okunur davranışı değişmez.

Şema değişikliği geri uyumludur ancak uygulama kodu yeni migration uygulanmadan
çalıştırılmamalıdır. Sabit `AgeGroup` enum'una bağlı dış tüketici varsa metin
etiketine geçişi ayrıca doğrulanmalıdır; bilinen dış tüketici `TBD`dir.

## Rollout and rollback

Migration önce disposable PostgreSQL 16 üzerinde deploy/status/diff ve mevcut
veriden alınmış disposable clone üzerinde değer-hash karşılaştırmasıyla
doğrulanır. Rollback için uygulama revision'ı geri alınır; yeni arşiv alanlarının
ve audit enum değerlerinin fiziksel kaldırılması yerine ileri düzeltme migration'ı
hazırlanır. Partial unique indeks kaldırılmadan önce yinelenen aktif A Takım
kayıtlarının bulunmadığı doğrulanmalıdır.
