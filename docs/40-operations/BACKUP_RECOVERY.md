# Backup and Recovery

## Protected Data

PostgreSQL içindeki kulüp, kullanıcı, plan, katılım, analiz, performans ve sağlık
verisi. Veri sınıflandırması ve sahipleri `TBD`.

## Backup, Retention and Encryption

TBD. Docker named volume (`pgdata`) yedekleme değildir. Retention, şifreleme,
lokasyon ve erişim politikası açık onay gerektirir.

## Restore Procedure

TBD; production veri modeli ve işletim sahibi belirlenmeden varsayılmayacak.

## Restore Test Evidence

Henüz kanıt yok. Hedef RPO/RTO ve restore test sıklığı `TBD`.
