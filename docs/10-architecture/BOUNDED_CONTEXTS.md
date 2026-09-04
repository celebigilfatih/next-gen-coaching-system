# Bounded Contexts

Bu tablo mevcut NestJS modüllerinden çıkarılmış teknik envanterdir; hedef domain
tasarımı veya onaylı servis ayrışması değildir.

| Context / module | Responsibility | Owns data | Does not own |
|---|---|---|---|
| Auth / Users | JWT, kullanıcı ve teknik roller | User ve ilişkili profil kayıtları | Onaylı yetki politikası |
| Clubs / Groups | Kulüp, takım/grup ve üyelik | Club, PlayerGroup, GroupMember | Antrenman içeriği |
| Drills | Egzersiz kataloğu | Drill | Plan sıralaması |
| Training Plans / Attendance | Plan, egzersiz sırası ve katılım | TrainingPlan, PlanDrill, Attendance | Sezon yaşam döngüsü |
| Seasons | Sezon, hafta, gün ve maç planlaması | Season, WeekPlan, DayPlan, Match | Bağımsız analiz kayıtları |
| Analytics / Stats | Performans ve analiz kayıtları ile özet sorgular | Birden çok analiz modeli | Ürün metrik politikası |
| Events | Gerçek zamanlı istemci bildirimleri | Kalıcı veri doğrulanmadı | Kimlik/yetki politikası |

Bağlam sahipliği, çapraz modül invariants ve hedef mimari `TBD`.
