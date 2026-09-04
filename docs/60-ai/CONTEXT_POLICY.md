# Context Policy

## Authority Order

Anayasa > kabul edilmiş ADR > ürün/kapsam > mimari > operasyon/kalite > Project
Boot > README/notlar > sohbet.

## Context Boundaries

- Onaylı MVP ile repository'de mevcut prototip kapsamı ayrı tutulur.
- Frontend uygulaması oluşana kadar ADR-0009 dışı UI, hosting veya oturum
  davranışı varsayılmaz.
- Kod, migration ve paket manifestiyle çelişen eski rapor güncel kabul edilmez.
- Çıkarım açıkça çıkarım olarak etiketlenir; bilinmeyen `TBD` kalır.

## Sensitive Data

Secret, token, parola/hash ve kişisel/sağlık verisi dokümana, prompt'a veya
handoff'a kopyalanmaz. Örnek veriler gerçek kişiyi tanımlamaz.
