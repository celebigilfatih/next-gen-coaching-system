# Team lifecycle verification — 2026-09-08

## Result

**Passed.** A Takım tekilliği, altyapı oluşturma/düzenleme/arşivleme/geri
yükleme, serbest kademe etiketi, rol/tenant sınırları ve iki sekmeli yönetim
yüzeyi doğrulandı. Korunan yerel takım kayıtları test amacıyla arşivlenmedi.

## Database and API evidence

- PostgreSQL 16 disposable veritabanında yedi migration uygulandı; ikinci status
  kontrolü güncel, Prisma schema diff boştu.
- Eşzamanlı iki A Takım oluşturma denemesinde partial unique indeks nedeniyle
  yalnız bir kayıt başarılı oldu.
- Altyapı E2E; oluşturma, seçili `ClubSeason` bağlantısı, ad/kademe güncelleme,
  geçmiş sezon/roster/maç/antrenman ilişkilerini koruyan archive ve aynı kimlikle
  restore akışını doğruladı.
- `COACH`, `PLAYER`, çapraz kulüp yöneticisi, A Takım arşivleme ve update
  mass-assignment istekleri fail-closed reddedildi.
- Retained veritabanının disposable clone'unda migration öncesi/sonrası
  `PlayerGroup.ageGroup` hash'i `311aa617008257d05d2e1688ad0a0add`,
  `Drill.ageGroup` hash'i `012d1635eda0ea28108c39c2f99f89f7` olarak aynı
  kaldı; iki kolon da `text` oldu ve partial unique indeks oluştu.
- Hedefli HTTP E2E: 3/3. Backend unit toplamı: 52 suite / 706 test.

## Frontend and visual evidence

- Varsayılan A Takım sekmesi, URL ile korunan iki sekme, sistem yöneticisi A
  Takım boş durumu ve create koruması canlı Chrome oturumunda doğrulandı.
- Altyapı sekmesinde gerçek katalog kartı, çalışma takımı seçimi, düzenle/arşivle
  menüsü, create Dialog, geçmişi koruma metni taşıyan archive onayı ve yöneticiye
  özel arşiv Sheet'i salt okunur etkileşimle incelendi. Hiçbir mutation onaylanmadı.
- Frontend testleri rol görünürlüğü, exact-season gereksinimi, create/edit/
  archive/restore, cursor, stale response, retry ve workspace fallback'ini kapsar.
- Responsive davranış CSS kırılımı ve route/component testlerinde doğrulandı;
  bu düzeltme turunda kullanıcı tarayıcısının viewport'u programatik olarak
  değiştirilmedi. Formal WCAG seviyesi `TBD`dir.
- Frontend unit toplamı: 42 dosya / 276 test.

## Safety and recovery

- Production deploy, seed/reset, commit veya push yapılmadı.
- Retained yerel veritabanına doğrulanmış migration uygulandı; uygulama verisi
  silinmedi. Migration öncesi disposable doğrulama dump'ı container içinde
  `/tmp/ngcs-team-lifecycle-upgrade.dump` konumunda tutulur.
- İleri migration rollback yaklaşımı [ADR-0028](../50-decisions/ADR-0028-first-team-and-academy-lifecycle.md)
  içinde kayıtlıdır.
