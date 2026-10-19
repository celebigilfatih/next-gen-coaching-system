# Core Workflows

## Workflow 1 — Antrenman planlama

1. Atanmış `COACH` sezon ve takım/grup bağlamını seçer.
2. Tarihli antrenman planını oluşturur.
3. Egzersizleri faz, sıra ve notlarıyla plana ekler.
4. Taktik egzersizin o andaki tahta sürümünü plan snapshot'ı olarak kaydeder.
5. Plan kaydedilir ve yeniden görüntülenebilir.

### Success

Plan ve ilişkili egzersizler doğru sezon/takım bağlamında kalıcıdır.

### Failure and Recovery

Validasyon, yetki ve hata mesajı davranışı `TBD`.

## Workflow 2 — Katılım/takip

1. Atanmış `COACH` bir antrenman planını açar.
2. Takımdaki oyuncular için katılım durumunu kaydeder.
3. Güncel katılım listesi görüntülenir.

### Success

Her oyuncu/plan çifti için güncel durum izlenebilir.

### Failure and Recovery

Tekrarlı kayıt, çevrimdışı çalışma ve eşzamanlı güncelleme politikası `TBD`.

## Workflow 3 — Taktik analiz

1. Atanmış `COACH` sezon içindeki maç veya rakip bağlamını seçer.
2. Temel taktik analiz verisini ve ondan ayrı maç tahtasını kaydeder.
3. Analizi ve tahtayı daha sonra görüntüler ve günceller.

### Success

Analiz doğru takım/sezon bağlamında ve yetkili kullanıcılarca erişilebilir.

### Failure and Recovery

Eşzamanlı güncelleme/çakışma davranışı `TBD`.

## Workflow 4 — Kulüp taktik egzersizi

1. Atanmış `COACH`, taktik kütüphanesinde grup kapsamlı tahta oluşturur veya global
   egzersizi “Kopyala ve düzenle” ile çoğaltır.
2. Saha, araç, formasyon ve özellikleri düzenler; değişikliği açıkça kaydeder.
3. Egzersizi yeniden açar ve yetkili antrenman planına bağlar.

### Success

Global kayıt değişmez; kulüp kopyası doğru owner/grup ile saklanır ve başka kulüp
tarafından okunamaz.

## Workflow 5 — Oyuncu yolculuğu ve takım geçişi

1. Yetkili staff oyuncunun mevcut ana takım ve geçici atamalarını görür.
2. Eski takım çalışması için `TRAINING_GUEST` gibi tarihli, ana üyeliği bozmayan
   geçici atama ekler.
3. Kalıcı terfide tek işlem önceki açık `PRIMARY_REGISTERED` kaydını geçiş
   tarihinde kapatır, yeni ana takım kaydını gerekçe ve aktörle açar.
4. Player 360 zaman çizelgesi ve takım `asOf` kadroları geçmişi yeniden üretir.

### Success

Oyuncunun ana ve geçici takım ilişkileri kaybolmadan, tenant ve capability
sınırında, audit kanıtıyla okunur.

### Failure and Recovery

İkinci açık ana takım deterministik conflict üretir; çapraz kulüp/grup referansları
reddedilir. Forward-fix tercih edilir ve additive legacy yapılar korunur.
