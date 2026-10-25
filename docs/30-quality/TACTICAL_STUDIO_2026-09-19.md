# Taktik stüdyosu — 2026-09-19

## Scope

ADR-0035 / CR-025 / REQ-024 / BL-057: profesyonel 2D editörün ilk dilimi.
Backend, API, migration, kayıtlı tahtalar ve retained DB üzerinde mutation yok.
Çalışma ağacındaki önceki kullanıcı değişiklikleri korunur.

## Implementation

- Egzersiz editöründe kompakt başlık ve açılır metadata; fotoğraflı hero kaldırıldı.
- Forma/disk sunumu, oyuncu adı, belirgin ekipman ve araç ikonları.
- Tek domain çizim kaynağı: `board-art.ts`; Konva ve güvenli SVG bunu kullanır.
- Yakınlaştırma 100–300%, kaydırma, sahaya sığdırma, panel ve odak görünümü.
- Görünüm tercihleri V1 belgesine veya undo/dirty durumuna yazılmaz.
- PNG export clone üzerinde yapılır; seçim çerçevesi çıkarılır, sabit canonical
  boyut kullanılır. SVG artık gerçek nesneleri ve metinleri serileştirir.

## Verification

- Yeni davranış testleri: görünüm/zoom/panel/odak değişiminde dirty-state ve
  V1 kayıt değişmez; Escape odak geri verir; isim görünüm değişiminde korunur.
- Export testi forma/disk, fileli kale, merdiven, ok geometrisini ve kötü niyetli
  metnin XML-escaped kalmasını doğrular; renk/rotation injection testi korunur.
- İlk kök kalite çalışmasında build sandbox'ın yerel preview portunu engellemesi
  nedeniyle EPERM aldı. Port izniyle tekrar çalıştırılan kök kapıda 725 backend,
  291 frontend ve 4 Sites testi; typecheck, lint, format ve iki build geçti.
  Markdown kontrolü 131 dosyada sıfır kırık yerel bağlantı buldu.
  CDSK ve `git diff --check` geçti; kök kapı exit 0 ile tamamlandı.
- Görsel QA gerçek editör bileşenini aynı NGCS stilleriyle izole yerel harness'te
  22 oyuncu ve ekipman içeren sentetik V1 belgeyle çalıştırır. Bu ortamın save
  callback'i no-op'tur; API persistence kanıtı olarak kullanılamaz.
- 1672×941, 1024×900 ve 390×844 bileşen görünümleri incelendi. Tablet DOM
  genişliği 1024/scrollWidth 1024, mobil 390/390; yatay sayfa taşması yok.
  Forma/disk, zoom/fit ve panel kontrolleri kontrol edildi. Formal tam-route
  veya dokunmatik cihaz sertifikasyonu iddia edilmez.
- Chrome'da PNG ve SVG indirmeleri doğrulandı. PNG 2400×1600 olarak açılıp
  saha, 22 sentetik oyuncu, top, fileli kale, koni, merdiven ve ok incelendi.
  IAB download-event gözlemi zaman aşımına uğradığından indirme kanıtı Chrome
  üzerinden alındı. QA çıktıları Downloads altında `ngcs-tactical-board` adıyla
  bulunur; gerçek takım verisi içermez.
- Canlı kullanıcı sekmesi başlangıçta incelendi. Geliştirme sunucusu durmuştu;
  frontend 3132/backend 4000 retained `ngcs_local_session_dev` ile başlatıldı.
  Yeniden bağlanmada memory-only oturum sona erdi; gerçek hesaba giriş sonrası
  entegre route QA ayrıca doğrulanmalıdır.
- Yerel frontend `/login` (3132) ve backend `/` (4000) HTTP 200 yanıtladı.

## Remaining work

Gerçek kadro kimlikleri, çoklu seçim/birim taşıma, özel formasyonlar, animasyon,
maç günü offline paket, takım paylaşımı ve 3D bu ilk dilimin teslimi değildir.
Özel saha şablonlarının futbol geometrisi ve gerçek tablet dokunma pilotu ayrıca
değerlendirilecektir. Formal erişilebilirlik seviyesi TBD.
