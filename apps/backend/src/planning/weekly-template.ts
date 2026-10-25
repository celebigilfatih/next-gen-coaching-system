import { BadRequestException } from '@nestjs/common';
import { DAY, dayKey, midnight, type PlanningKind } from './planning-input';

export const templateVersion = 'BALANCED_WEEK_V6';
export type ProgramEvent = {
  key: string;
  seasonId: string;
  kind: PlanningKind;
  title: string;
  startsAt: string;
  duration: number;
  notes: string;
  topic: string;
  location: string;
};
type Fixture = { date: Date; opponent: string };
export function physical(kind: string) {
  return ['TRAINING', 'TACTICAL', 'RECOVERY'].includes(kind);
}
export function templateEvents(
  seasonId: string,
  age: string,
  weekStart: string,
  matches: Fixture[],
): ProgramEvent[] {
  const senior = age === 'SENIOR';
  const n = Number(age.slice(1));
  if (!senior && !/^U(?:[89]|1[0-6])$/.test(age))
    throw new BadRequestException(
      `Bu yaş için haftalık şablon bulunmuyor: ${age}`,
    );
  const start = midnight(weekStart).getTime();
  const ordered = [...matches].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );
  const fixtures = ordered.filter(
    (m) => m.date.getTime() >= start && m.date.getTime() < start + 7 * DAY,
  );
  if (fixtures.length > (senior ? 5 : 1))
    throw new BadRequestException(
      senior
        ? 'Altı veya daha fazla maçlı haftada manuel planlama kullanın.'
        : 'Altyapıda iki veya daha fazla maçlı haftada manuel planlama kullanın.',
    );
  if (senior)
    for (let i = 1; i < ordered.length; i++) {
      const previous = ordered[i - 1].date,
        next = ordered[i].date;
      if (
        previous.getTime() < start + 7 * DAY &&
        next.getTime() >= start &&
        (dayKey(previous) === dayKey(next) ||
          next.getTime() - previous.getTime() < DAY)
      )
        throw new BadRequestException(
          'Aynı gün veya 24 saatten kısa aralıklı maçlar için manuel planlama kullanın.',
        );
    }
  const events: ProgramEvent[] = [];
  function add(
    day: number,
    time: string,
    kind: PlanningKind,
    title: string,
    duration: number,
    topic = '',
  ) {
    const date = dayKey(new Date(start + day * DAY));
    events.push({
      key: `${seasonId}:${day}:${events.filter((e) => dayKey(e.startsAt) === date).length}`,
      seasonId,
      kind,
      title,
      duration,
      startsAt: new Date(`${date}T${time}:00+03:00`).toISOString(),
      topic,
      location:
        kind === 'TOPLANTI'
          ? 'Takım toplantı alanı (planlanan)'
          : kind === 'REST'
            ? ''
            : 'Antrenman sahası (planlanan)',
      notes:
        'Örnek kulüp programı • Dengeli gelişim. Koç tarafından yaşa ve takımın ihtiyaçlarına göre düzenlenir.',
    });
  }
  for (let day = 0; day < 7; day++) {
    const date = dayKey(new Date(start + day * DAY));
    const todayMatch = fixtures.find((m) => dayKey(m.date) === date);
    const previous = matches.find(
      (m) =>
        midnight(date).getTime() - midnight(dayKey(m.date)).getTime() === DAY,
    );
    const dayStart = midnight(date).getTime();
    const last = ordered.filter((m) => m.date.getTime() < dayStart).at(-1);
    const next = ordered.find((m) => m.date.getTime() >= dayStart);
    const gapHours =
      last && next
        ? (next.date.getTime() - last.date.getTime()) / 3_600_000
        : Infinity;
    const before = next
      ? Math.round(
          (midnight(dayKey(next.date)).getTime() - midnight(date).getTime()) /
            DAY,
        )
      : -1;
    if (todayMatch) {
      // Keep early kickoffs on their actual local date instead of wrapping the clock.
      const activation = new Date(
        Math.max(dayStart, todayMatch.date.getTime() - 6 * 3_600_000),
      );
      const meeting = new Date(
        Math.max(
          activation.getTime() + 30 * 60_000,
          todayMatch.date.getTime() - 3 * 3_600_000,
        ),
      );
      if (meeting.getTime() + 20 * 60_000 > todayMatch.date.getTime())
        throw new BadRequestException(
          'Bu erken maç saati için aynı güne otomatik hazırlık sığmıyor; manuel planlama kullanın.',
        );
      const clock = (d: Date) =>
        new Date(d.getTime() + 3 * 3_600_000).toISOString().slice(11, 16);
      add(day, clock(activation), 'TRAINING', 'Maç günü hafif aktivasyon', 20);
      add(
        day,
        clock(meeting),
        'TOPLANTI',
        'Maç toplantısı',
        senior ? 20 : 10,
        `${todayMatch.opponent} • görevler, oyun planı ve iletişim`,
      );
    } else if (senior && last && next && gapHours <= 120) {
      // Product example tiers, not a medical load prescription. Both kickoff times matter.
      const short = gapHours <= 72;
      const compact = gapHours <= 96;
      const recovery = !!previous;
      add(
        day,
        '10:00',
        recovery ? 'RECOVERY' : 'TRAINING',
        recovery
          ? 'Toparlanma ve mobilite'
          : before === 1 || short
            ? 'Maç öncesi kısa aktivasyon'
            : 'Kontrollü teknik ve oyun planı aktivasyonu',
        recovery
          ? short
            ? 30
            : compact
              ? 35
              : 40
          : before === 1 || short
            ? short
              ? 20
              : 30
            : compact
              ? 35
              : 45,
      );
      add(
        day,
        '11:00',
        'TOPLANTI',
        recovery
          ? 'Maç değerlendirmesi ve sonraki maç planı'
          : 'Kısa maç planı toplantısı',
        short ? 15 : 20,
        `${next.opponent} • önceki maçtan öğrenilenler, roller ve duran top görevleri`,
      );
      add(day, '16:00', 'REST', 'Toparlanma ve serbest zaman', 240);
      for (const event of events.filter((e) => dayKey(e.startsAt) === date))
        event.notes += ` Maç aralığı: ${Number(gapHours.toFixed(1))} saat. Tek fiziksel seans; süre ve katılım koç tarafından uyarlanır.`;
    } else if (previous) {
      if (senior) {
        add(day, '10:00', 'RECOVERY', 'Toparlanma ve mobilite', 40);
        add(
          day,
          '16:00',
          'TOPLANTI',
          'Önceki maç değerlendirmesi',
          25,
          'Maçtan öğrenilenler, olumlu örnekler ve sonraki hedefler',
        );
      } else add(day, '17:00', 'REST', 'Maç sonrası dinlenme', 60);
    } else if (before === 1) {
      add(
        day,
        senior ? '10:00' : '17:00',
        'TRAINING',
        'Maç öncesi kısa aktivasyon',
        40,
      );
      add(
        day,
        senior ? '11:00' : '17:50',
        'TOPLANTI',
        'Maç planı toplantısı',
        senior ? 20 : 10,
        'Roller, duran toplar ve takım iletişimi',
      );
      if (senior) add(day, '16:00', 'REST', 'Öğleden sonra serbest', 240);
    } else if (senior) {
      // Opponent preparation requires a real fixture, including next Monday.
      const offset = before;
      if (offset === 2) {
        add(day, '10:00', 'TRAINING', 'Rakibe hazırlık', 60);
        add(
          day,
          '15:00',
          'TOPLANTI',
          'Rakip toplantısı',
          25,
          'Rakibin güçlü yönleri, oyun planı ve duran top görevleri',
        );
        add(day, '16:00', 'TRAINING', 'Duran top organizasyonu', 30);
      } else if (offset === 3) {
        add(day, '10:00', 'TRAINING', 'Hücum-savunma geçişleri', 75);
        add(day, '16:00', 'TRAINING', 'Bitiricilik ve kaleciyle çalışma', 45);
      } else if (offset === 4) {
        add(day, '10:00', 'TRAINING', 'Topla çıkış ve takım organizasyonu', 90);
        add(
          day,
          '16:00',
          'TRAINING',
          'Hatlar arası bağlantı ve pozisyon çalışması',
          45,
        );
      } else if (!fixtures.length && day === 5) {
        add(
          day,
          '10:00',
          'TRAINING',
          'Gelişim oyunları ve takım bağlantıları',
          60,
        );
        add(
          day,
          '11:10',
          'TOPLANTI',
          'Haftalık gelişim değerlendirmesi',
          20,
          'Öğrenilenler, takım iletişimi ve sonraki haftanın hedefleri',
        );
      } else if (day === 6) add(day, '10:00', 'REST', 'Dinlenme günü', 240);
      else {
        add(day, '10:00', 'TRAINING', 'İlk kontrol, pas ve destek açıları', 75);
        add(day, '16:00', 'TRAINING', 'Koordinasyon ve bireysel teknik', 45);
      }
    } else {
      const weekdays =
        n <= 9
          ? [1, 3]
          : n <= 12
            ? [0, 2, 4]
            : n <= 14
              ? [0, 1, 3, 4]
              : [0, 1, 2, 4];
      if (day === 5) {
        const duration = n >= 15 ? 75 : 60;
        add(
          day,
          '10:00',
          'TRAINING',
          'Gelişim oyunları ve haftalık öğrenme',
          duration,
        );
        add(
          day,
          n >= 15 ? '11:25' : '11:10',
          'TOPLANTI',
          'Haftalık gelişim değerlendirmesi',
          n <= 9 ? 5 : n <= 12 ? 10 : 15,
          'Öğrenilen beceriler, oyuncu geri bildirimi ve yeni hedef',
        );
      } else if (weekdays.includes(day)) {
        const themes = [
          'Top hâkimiyeti ve ilk kontrol',
          'Pas, destek ve karar verme',
          'Teknik beceri ve küçük alan oyunları',
          'Geçişler ve birlikte savunma',
          'Bitiricilik ve oyun uygulaması',
        ];
        add(
          day,
          '17:00',
          'TRAINING',
          n <= 9
            ? [
                'Topla eğlenceli ısınma',
                'Paslaşma ve destek oyunu',
                'Topla eğlenceli istasyonlar',
                'Topu kazanma ve paylaşma oyunu',
                'Hedef kapı ve bitiriş oyunu',
              ][day]
            : themes[day],
          n <= 9 ? 60 : n <= 12 ? 75 : n <= 14 ? 80 : 90,
        );
        if (n >= 15 && day === 1)
          add(day, '18:45', 'TRAINING', 'Ek teknik ve koordinasyon bloğu', 25);
      } else add(day, '17:00', 'REST', 'Dinlenme ve serbest zaman', 60);
    }
  }
  return events;
}
export function sessionPhases(age: string, title: string, duration: number) {
  const young = /^U[89]$/.test(age);
  const warm = Math.max(5, Math.round((duration * 0.17) / 5) * 5);
  const cool = duration >= 70 ? 10 : 5;
  const technical = Math.max(5, Math.round((duration * 0.3) / 5) * 5);
  const game = duration - warm - cool - technical;
  const phases = [
    {
      phase: 'WARM_UP' as const,
      title: young
        ? 'Topla hareket ve eğlenceli ısınma'
        : 'Dinamik ısınma ve topla hazırlık',
      duration: warm,
      objective: 'Seansın hareket ve top temaslarına hazırlanma',
      organization: 'Küçük istasyonlar; top ve işaret konileri',
      steps: 'Rahat tempoda yön değiştir; top sür; kısa paslarla eş değiştir.',
      coaching:
        'Kısa açıklama, aktif katılım ve kontrollü hareket. Toparlanma/aktivasyon seansında rahat tempo.',
    },
    {
      phase: 'TECHNICAL' as const,
      title: young
        ? 'Top hâkimiyeti ve temel pas oyunu'
        : `${title} • teknik uygulama`,
      duration: technical,
      objective: young
        ? 'İki ayağı kullanma, ilk kontrol ve paylaşma'
        : 'İlk kontrol, tarama ve pas kalitesini geliştirme',
      organization:
        'İkili/üçlü istasyonlar; mesafe takım yaşına göre ayarlanır',
      steps:
        'Kontrol et, destek açısı oluştur, pas ver; basit baskı ekle; rolleri değiştir.',
      coaching:
        'Başını kaldır, uygun ayakla kontrol et; başarılı tekrarları çoğalt. Her oyuncuya top teması.',
    },
    {
      phase: 'TACTICAL' as const,
      title: young
        ? 'Eğlenceli küçük alan oyunu'
        : `${title} • oyun uygulaması`,
      duration: game,
      objective: young
        ? 'Topla çözüm bulma ve birlikte oynama'
        : 'Seans hedefini oyun içinde kararlarla ilişkilendirme',
      organization:
        'Mevcut oyuncu sayısına göre dengeli küçük gruplar; alan koç tarafından ayarlanır',
      steps:
        'Kısa oyunlar oyna; top kaybında birlikte tepki ver; aralarda tek koçluk noktası paylaş. Aktivasyon/toparlanmada rekabet baskısı azaltılır.',
      coaching:
        'Destek açıları, iletişim ve rol değişimi. Küçük yaşlarda sonuçtan çok deneme ve katılım.',
    },
    {
      phase: 'COOL_DOWN' as const,
      title: 'Soğuma ve kısa değerlendirme',
      duration: cool,
      objective: 'Seansı sakin biçimde bitirme ve öğrenmeyi hatırlama',
      organization: 'Takım çemberi ve rahat hareket alanı',
      steps:
        'Tempoyu azalt; rahat hareket et; oyunculardan bir öğrenme noktası al.',
      coaching:
        'Rahat hareketler; koçun geri bildirimine göre süreyi ve uygulamayı oyuncunun düzeyine uyarla.',
    },
  ];
  if (!young) {
    const technique = phases[1],
      play = phases[2];
    if (/Toparlanma|mobilite/i.test(title)) {
      phases[0].title = 'Rahat hareket ve topla hazırlık';
      technique.title = 'Düşük tempoda kontrollü pas';
      technique.steps =
        'İkili rahat paslaş; kontrol sonrası kısa hareket et; aralara serbest mobilite hareketleri koy. Yarışma ve zorlayıcı tekrar eklenmez.';
      play.title = 'Yürüyüş temposunda yerleşim ve top dolaşımı';
      play.steps =
        'Baskısız top dolaştır; destek açılarını yürüyerek göster; kısa molalar ver. Takımın ihtiyacına göre koç bu bloğu dinlenmeye çevirir.';
      play.coaching =
        'Rahat tempo ve iletişim; rekabet, sprint ve kondisyon yüklemesi hedeflenmez.';
    } else if (/aktivasyon/i.test(title)) {
      technique.title = 'Kısa pas ve ilk kontrol aktivasyonu';
      technique.steps =
        'Kısa pas dizileri ve kontrollü yön değişimleri uygula; tekrarlar arasında rahat hareket et.';
      play.title = 'Baskısız oyun planı hatırlatması';
      play.steps =
        'Temel yerleşimleri ve iki basit pas bağlantısını düşük tempoda hatırla; uzun rekabetçi oyun ekleme.';
    } else if (/Duran top/i.test(title)) {
      technique.title = 'Duran top pası ve ayakla bitiriş';
      technique.steps =
        'Pasör ve alıcı rollerini değiştir; kısa korner veya serbest vuruş pas bağlantısını önce baskısız çalış; ayakla hedefe bitir.';
      play.title = 'Duran top görevleri ve ikinci top yerleşimi';
      play.steps =
        'Başlangıç yerleşimini göster; kısa pas organizasyonu uygula; top kaybında denge pozisyonuna dön. Rolleri sırayla değiştir.';
    } else if (/Bitiricilik/i.test(title)) {
      technique.title = 'İlk kontrol ve ayakla bitiriş';
      technique.steps =
        'Pas al, vücudu hedefe çevir ve ayakla bitir; kaleci açı alır; pasör, bitirici ve destek rolünü sırayla değiştir.';
      play.title = 'Destek pası sonrası bitiricilik oyunu';
      play.steps =
        'Dengeli küçük gruplarda destek pasından sonra hedefe git; kaleci ve savunmacıya çözüm üret; kısa oyunlardan sonra tek geri bildirim ver.';
    } else if (/geçiş|savunma/i.test(title)) {
      technique.title = 'Yön değiştirme ve geçiş pası';
      technique.steps =
        'İki hedef arasında kontrol ve yön değiştirme çalış; top kaybı işaretinde yeni pas hedefine yönel; eşleri ve rolleri değiştir.';
      play.title = 'Top kazanma ve kaybetme geçiş oyunu';
      play.steps =
        'Küçük gruplarla hedefli oyun oyna; top kaybında en yakın oyuncu tepki verirken diğerleri alanı dengeler; kazanımda destek açısıyla ileri bağlantı kur.';
    } else if (/Topla çıkış|pozisyon|Hatlar|Rakibe/i.test(title)) {
      technique.title = 'Tarama, yarım dönüş ve destek pası';
      technique.steps =
        'Pas gelmeden çevreyi tara; yarım dönüşle kontrol et; farklı destek açısına pas ver. Baskıyı yaşa göre kademeli ekle.';
      play.title = 'Hatlar arası bağlantı ve baskıdan çıkış oyunu';
      play.steps =
        'Takımı mevcut oyuncu sayısına göre hatlara ayır; geriden hedef bölgeye pasla çık; pasör yeniden destek açısı oluşturur. Top kaybında takım boyunu daralt.';
    } else if (/Koordinasyon|koordinasyon/i.test(title)) {
      technique.title = 'Topla koordinasyon ve iki ayak kullanımı';
      technique.steps =
        'İşaret kapılarında kısa adımlar ve top kontrolü uygula; iki ayağı sırayla kullan; kapı sonrası eşine kontrollü pas ver.';
      play.title = 'Renkli kapı ve karar verme oyunu';
      play.steps =
        'Koçun gösterdiği kapıyı seç; top sürme veya pasla kapıya ulaş; kısa oyunlardan sonra görev ve eş değiştir.';
    }
  }
  return phases.map((p, order) => ({
    ...p,
    order,
    notes: `Örnek kulüp egzersizi • ${age}\nAmaç: ${p.objective}\nOrganizasyon: ${p.organization}\nUygulama: ${p.steps}\nKoçluk: ${p.coaching}`,
  }));
}
