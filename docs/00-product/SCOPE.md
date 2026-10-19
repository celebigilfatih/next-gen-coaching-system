# Scope

## MVP In Scope

- Sezon bağlamı ve haftalık/günlük planlama desteği.
- Antrenman planı ve egzersiz ilişkilendirmesi.
- Oyuncu katılım/takip kaydı.
- Taktik, maç ve rakip analizinin temel kaydı.
- Kulüp/grup kapsamlı egzersiz kütüphanesi; ortak etkileşimli taktik tahta;
  antrenman snapshot'ı ve maç tahtası.
- Koç genel bakışı, drill kütüphanesi, plan bazlı yoklama erişimi ve doğrulanmış
  çalışma alanı/oturum ayarları.
- MVP için gerekli kullanıcı, kulüp, takım/grup ve kimlik doğrulama desteği.

## Explicit Non-goals

- Sağlık/sakatlık yönetimini MVP özelliği olarak tamamlamak.
- İleri performans analitiği, scouting veya otomatik risk/skor üretimi.
- Video dosyası yükleme, işleme veya barındırma.
- PlayDrill uyumluluğu, tahta animasyonu ve çok sahneli/video taktik anlatımı.
- AI destekli öneri ya da analiz.
- Native mobil uygulama veya public pazarlama sitesi teslim etmek.

Mevcut backend'de non-goal alanlarına ait prototip kod bulunması onları onaylı
MVP kapsamına sokmaz; kod bu başlangıçta silinmez.

## Later

- Sağlık, rehabilitasyon ve oyuncu yük yönetimi.
- İleri takım/oyuncu performansı ve scouting.
- Video analizi ve AI destekli akışlar.
- Native mobil istemci ve production frontend deployment modeli.

## Phase 2 — Approved Foundation Scope

ADR-0021–0024 ile uzun vadeli ürün sınırı genişletilmiştir; tamamlanmış dar MVP
korunan başlangıç tabanıdır. İlk Phase 2 dilimi P0.1 ile sınırlıdır:

- `Person`/hesap ayrımı, kalıcı `Team`, `ClubSeason`/`TeamSeason` ve tarihli
  sportif atamalar.
- Kulüp ve takım kapsamında işlevsel rol/yetenek yetkilendirmesi.
- Tarihe göre takım kadrosu, oyuncu dizini ve kanıtla sınırlı Player 360 özeti.
- `PlayerGroup`, `GroupMember` ve `Season` için additive uyumluluk/backfill.

P0.1; klinik veri, scouting pipeline, gelişmiş performans, video ingestion,
readiness skoru, AI önerisi, dış sağlayıcı sözleşmesi veya production rollout
içermez. Bunlar ilgili karar ve gizlilik kapıları açılmadan etkinleştirilemez.

## Professional Drill Library — Approved Increment

- 120 özgün Türkçe egzersiz repository manifestinde `DRAFT` hazırlanır.
- Immutable sürüm, U12/U14/U16/U18/A Takım varyantı, TacticalBoardDocumentV1,
  kaynak/lisans/checksum ve author-reviewer-publisher akışı kapsam içidir.
- Rakip içerik kopyalama/scraping, FIFA içeriğini izinsiz ticari kullanma,
  belirsiz/NC/ND/SA lisans, canlı dış aktarım, video/animasyon ve ücretli sağlayıcı
  entegrasyonu kapsam dışıdır.
- Adlandırılmış futbol uzmanı, retained/production import ve üç dalganın yayını
  `TBD`dir; bunlar tamamlanmadan paket `PUBLISHED` sayılmaz.

## Scope Change Policy

2026-09-19: ADR-0036 / CR-026 çok-sahneli 2D animasyonu ayrı bir Phase 2
artımı olarak **Accepted** durumundadır; kullanıcı A–D paketini açıkça onayladı.
Yukarıdaki non-goal tarihsel MVP sınırıdır. Yeni Phase 2 kapsamı sınırlı sahne/
doğrusal animasyon ve güvenli kayıttır; video/3D/offline ve editorial V2 kapsamı
genişletilmez. [Karar](../50-decisions/ADR-0036-tactical-scenes-and-playback.md).

MVP genişlemesi change request ve açık kullanıcı onayı gerektirir; mimari etkide
ADR hazırlanır.
