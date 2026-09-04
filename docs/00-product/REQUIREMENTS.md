# Requirements

| ID | Requirement | Source | Acceptance criteria | Status |
|---|---|---|---|---|
| REQ-001 | Sezon bağlamında antrenman planı oluştur ve görüntüle | Onaylı ilk hedef | Plan doğru sezon/takım bağlamıyla geri okunur | Proposed |
| REQ-002 | Egzersizleri faz ve sırayla plana bağla | Onaylı ilk hedef | Plan ayrıntısı sıralı egzersizleri içerir | Proposed |
| REQ-003 | Oyuncu katılımını plan bazında takip et | Onaylı ilk hedef | Oyuncu/plan için güncel durum geri okunur | Proposed |
| REQ-004 | Temel taktik analiz kaydı oluştur ve güncelle | Onaylı ilk hedef | Analiz kalıcıdır ve yetkili kullanıcıca erişilir | Proposed |
| REQ-005 | Kulüp verisini onaylı rol/yetki sınırlarıyla izole et | ADR-0005, ADR-0007 | Yetkisiz çapraz kulüp erişimi reddedilir | Implemented — negative E2E verified |
| REQ-006 | Repository CDSK 0.1.0 yapısına uysun | ADR-0001 | Resmî CDSK validator geçer | Implemented |
| REQ-007 | Hesapları davetle oluştur, askıya al ve oturumlarını iptal et | ADR-0008 | Scope, token replay, suspension ve audit testleri geçer | Implemented |
| REQ-008 | Koçun ilk web akışını haftalık sezon bağlamından yürüt | ADR-0009 | Login, haftalık plan, antrenman ve katılım kritik yolu frontend kalite kapılarından geçer | Approved — implementation pending |
