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
