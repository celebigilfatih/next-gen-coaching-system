# Çalışmaya özgü çizim revizyonu QA — 2026-10-27

Tam sonuç ve sınırlar: [doğrulama raporu](../../../../docs/30-quality/DRILL_DIAGRAM_REVISION_2026-10-27.md).
Bu klasör yeni DRAFT içeriğin teknik/görsel kanıtıdır; gerçek sportif yayın onayı değildir.

Sonraki açık kullanıcı onayıyla120 v2 yerelde yayımlandı. Gerçek canonical
önce/sonra ve korunmuş plan kanıtı [publication](publication/README.md)
klasöründedir. Buradaki önceki sentetik/DRAFT görüntüler hazırlık aşamasına aittir.

- index.html ve svg/: aynı120 manifestten gerçek ortak SVG kaynağıyla üretilen
  salt okunur inceleme galerisi. Varsayılan A Takım24; yaş/faz/arama/rehber/indirme.
- gallery-desktop.jpg: A Takım24 çalışma.
- gallery-warm-up.jpg, gallery-technical.jpg, gallery-tactical.jpg,
  gallery-cool-down.jpg:24 çalışma, dört fazda incelendi.
- gallery-tablet-u12.jpg ve gallery-mobile-u12.jpg:1024×768/390×844, U12 ısınma4.
- app-final-zone-desktop.jpg, app-final-zone-tablet.jpg, app-final-zone-mobile.jpg:
  sentetik uygulamada gerçek Konva son bölge önizlemesi.
- app-pas-desktop.jpg, app-pres-desktop.jpg, app-bitiricilik-desktop.jpg,
  app-kombinasyon-desktop.jpg, app-soguma-desktop.jpg: beş farklı gerçek önizleme.
- app-add-plan-selected.jpg ve app-add-plan-success.jpg: mevcut sentetik plana ekleme.
- app-plan-58-minutes.jpg, app-plan-new-board.jpg ve
  app-plan-old-board-preserved.jpg: aynı planda yeni22 nesneli v2 ve eski7 nesneli
  v1; toplam58dk.
- export-u12-01.png/SVG: IAB'de indirilen gerçek örnek dosyalar; PNG1500×1100,
  SVG kaynak dosyayla aynı hash.
- app-export-pas.png/SVG ve export-verification.json: gerçek plan editörü
  indirmeleri; SVG ok ucu koordinatlarında Node/browser yaklaşık1e-14 farkı,
  dokuz ondalıkta aynı yapı/değerler; PNG1500×1100 görsel kabulü.
- import-verification.json: temiz PostgreSQL, idempotency, normal yayın kapısı,
  eski içerik/plan ve kalıcı41 iş tablosu değişmezliği.
- plan-browser-verification.json: browser eklemesinin yeni22 nesneli v2'si,
  eski7 nesneli v1 ve58dk toplam süre ile DB doğrulaması.

JSON'lar kimlik/credential/token içermez. Operatör config'leri ve ham loglar
ignored output/ altında kalır. Canonical uygulama yerine yalnız sentetik QA
uygulamasında iş verisi yazılmıştır. Screenshot'lar yeniden üretilmez; galeri
üreticisi yalnız index.html/svg dosyalarını yeniler.
