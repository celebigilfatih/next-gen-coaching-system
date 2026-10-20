# Glossary

| Term | Definition | Notes |
|---|---|---|
| CDSK | Çelebigil Development Standard Kit | Repository tabanlı geliştirme standardı |
| Sezon | Belirli başlangıç ve bitiş tarihine sahip sportif çalışma dönemi | Prisma `Season` modeli |
| Antrenman planı | Egzersizleri, süreyi, grup ve antrenör bağlamını birleştiren plan | Prisma `TrainingPlan` modeli |
| Egzersiz | Isınma, teknik, taktik veya soğuma kategorisindeki çalışma | Kodda `Drill` adı kullanılır |
| Katılım | Oyuncunun belirli antrenman planındaki bulunma durumu | Kodda `Attendance` |
| Taktik analiz | Maç, rakip, diziliş veya oyun planına ilişkin yapılandırılmış analiz | Kesin ürün sınırı `TBD` |
| Dar MVP | Onaylı ilk kapsam: planlama, katılım/takip ve temel taktik analiz | ADR-0002 |
| Person | Oyuncu veya staff'ın uygulama hesabından bağımsız kulüp kimliği | Hesap isteğe bağlı bire bir bağlantıdır |
| Team | Sezonlar boyunca devam eden, kulüp tarafından adlandırılan sportif takım | Yaş/kategori sabit enum değil yapılandırılabilir metindir |
| TeamSeason | Bir Team'in belirli ClubSeason içindeki bağlamı | Legacy `Season` ile geçici uyumluluk bağlantısı vardır |
| Sporting Assignment | Bir kişinin takım/rol ilişkisinin türü ve etkili tarih aralığı | Kaynak, gerekçe ve oluşturan aktör izlenir |
| Player 360 | Yetkiye göre farklı domain kanıtlarını birleştiren oyuncu okuma modeli | Tek kaynak tablo veya readiness skoru değildir |
| Sporting availability | Oyuncunun futbol faaliyetine katılım uygunluğunun sınırlı durumu | Klinik tanı/not değildir; ADR-0023 |
