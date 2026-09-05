# Requirements

| ID | Requirement | Source | Acceptance criteria | Status |
|---|---|---|---|---|
| REQ-001 | Sezon bağlamında antrenman planı oluştur ve görüntüle | Onaylı ilk hedef | Plan doğru sezon/takım bağlamıyla geri okunur | Implemented — browser E2E verified |
| REQ-002 | Egzersizleri faz ve sırayla plana bağla | Onaylı ilk hedef | Plan ayrıntısı sıralı egzersizleri içerir | Implemented — browser E2E verified |
| REQ-003 | Oyuncu katılımını plan bazında takip et | Onaylı ilk hedef | Oyuncu/plan için güncel durum geri okunur | Implemented |
| REQ-004 | Temel taktik analiz kaydı oluştur ve güncelle | Onaylı ilk hedef | Analiz kalıcıdır ve yetkili kullanıcıca erişilir | Implemented — board persistence verified |
| REQ-005 | Kulüp verisini onaylı rol/yetki sınırlarıyla izole et | ADR-0005, ADR-0007 | Yetkisiz çapraz kulüp erişimi reddedilir | Implemented — negative E2E verified |
| REQ-006 | Repository CDSK 0.1.0 yapısına uysun | ADR-0001 | Resmî CDSK validator geçer | Implemented |
| REQ-007 | Hesapları davetle oluştur, askıya al ve oturumlarını iptal et | ADR-0008 | Scope, token replay, suspension ve audit testleri geçer | Implemented |
| REQ-008 | Koçun ilk web akışını haftalık sezon bağlamından yürüt | ADR-0009, ADR-0011 | Login, haftalık plan, antrenman ve katılım kritik yolu frontend kalite kapılarından geçer | Implemented — five routes and responsive E2E verified |
| REQ-009 | Etkileşimli taktik tahtasını ortak ve sürümlü belgeyle kullan | ADR-0011, ADR-0012 | Araçlar, formasyon, undo/redo, açık save ve NGCS import/export doğrulanır | Implemented |
| REQ-010 | Koç atandığı grup için kulüp egzersizi oluşturabilsin | ADR-0012 | Sahiplik, mass-assignment ve çapraz tenant negatif testleri geçer | Implemented |
| REQ-011 | Koç, MVP destek işlevlerine ortak çalışma alanından ulaşabilsin | ADR-0013 | Genel Bakış, Egzersiz Kütüphanesi, Yoklama ve Ayarlar rotaları gerçek bağlamla açılır; mobil ana görev navigasyonu korunur | Implemented — browser and responsive QA verified |
