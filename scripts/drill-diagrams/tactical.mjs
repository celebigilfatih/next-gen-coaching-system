import { finish } from "./diagram-builder.mjs";

// Original coaching proposals. Sporting review of this DRAFT content is pending.
const size = (age) => (age.level === 0 ? 3 : age.level === 1 ? 4 : 5);
const allocation = (_ctx, active) =>
  `Çizim ${active} aktif oyunculu bir örnek gruptur. Alan ölçüsü ve toplam oyuncu aralığı seçilen yaş varyantının bilgilerinden alınır. ` +
  `Her ${active} kişiye bir grup kur; alan uygunsa seçilen ölçülerde paralel sahalar kullan, değilse grupları sırayla oynat. ` +
  `Tam gruba sığmayan oyuncular saha dışında yedek top ve gözlem görevinde bekler; her iki hücumdan sonra aynı sayıda aktif oyuncuyla yer değiştirir. ` +
  `Her turda bütün başlangıç rollerini sırayla döndür. DRAFT öneri; insan antrenör incelemesi bekleniyor.`;
const pressure = (age) =>
  age.level === 0
    ? "İlk iki tur rakip yalnız pas yolunu gölgeler; sonra kontrollü top kazanmasına izin ver. Dokunuş sınırı koyma."
    : age.level === 1
      ? "Rakip kontrollü aktif oynar; oyuncuya alım öncesi bakış ve iki güvenli pas seçeneği için zaman tanı."
      : age.level === 2
        ? "Rakip aktif oynar; topun yönüne göre destek ve koruma rollerini oyuncular seçer."
        : age.level === 3
          ? "Aktif baskıda ilk çözüm kapanırsa ikinci yönü oyuncular seçer; top kaybında roller hemen değişir."
          : "Rakip bazen merkezi, bazen kanadı kapatır; oyuncular baskının yönünü okuyup güvenli ilerleme ile doğrudan hücum arasında seçim yapar.";
const boundary = (d) => {
  d.zone(50, 50, 80, 72);
  [
    [10, 14],
    [90, 14],
    [10, 86],
    [90, 86],
  ].forEach(([x, y]) => d.cone(x, y));
};
const people = (d, points, team, start = 1) => points.forEach(([x, y], i) => d.player(x, y, start + i, team));

export const tactical = {
  "topa-sahip-olma": (ctx) => {
    const { age, diagram: d } = ctx;
    const n = size(age) - 1;
    boundary(d);
    d.zone(50, 24, 66, 16, "#facc15");
    d.zone(50, 76, 66, 16, "#facc15");
    const home = [
      [29, 60],
      [69, 56],
      [26, 40],
      [71, 37],
    ].slice(0, n);
    const away = [
      [42, 57],
      [58, 42],
      [42, 35],
      [58, 66],
    ].slice(0, n);
    people(d, home, "home");
    people(d, away, "away");
    d.player(50, 78, "N1", "neutral");
    d.player(50, 22, "N2", "neutral");
    d.ball(46, 76);
    d.pass(47, 72, 31, 63);
    d.pass(33, 60, 65, 56);
    d.pass(70, 51, 53, 26);
    d.run(31, 56, 27, 44);
    d.text(12, 18, "Hedef N2", 12);
    d.text(12, 80, "Başla N1", 12);
    return finish(d, {
      organization: `${allocation(ctx, n * 2 + 2)} İçeride ${n} maviye karşı ${n} kırmızı; uç bölgelerde iki sarı nötr hedef vardır. Topa sahip ekip iki nötrü de kullanır.`,
      steps: [
        "N1 topu mavi 1'e verir; mavi takımın ilk hedefi N2'ye kontrollü pas ulaştırmaktır.",
        "Mavi 2 yana açılır; 1 pas sonrası tekrar destek açısı kurar. Merkez kapanırsa N1'e dönüp öteki yandan ilerle.",
        "N2'nin uç bölgede kontrol ettiği geçiş 1 puandır; N2 beklemeden aynı takıma servis eder ve hedef N1 olur.",
        "Kırmızı topu kazandığında nötrlerle oynayarak karşı uç hedefe yönelir; puan için kazanımın ardından iki iç pas tamamlar.",
        "Top dışarı çıktığında en yakın nötrden başla. İki yönlü puan denemesinden sonra nötrleri iç oyuncularla değiştir.",
      ],
      coachingPoints: [
        "İki destek oyuncusu aynı pas gölgesinde kalmasın.",
        "Alımdan önce karşı uç hedefi ve rakibi tara.",
        "İleri yol kapalıysa topu nötr üzerinden yeniden yönlendir.",
      ],
      progressions: ["Karşı nötre ulaşmadan önce iç oyuncuların zayıf tarafa bir yön değişimi yapmasını iste."],
      regressions: ["Uç bölgelere rakip girişini kaldır; nötr alımından sonra kısa yerleşme süresi ver."],
      equipmentItems: [
        "1 oyun topu ve yedek toplar",
        "İki renk yelek ve 2 nötr yelek",
        "Saha ve iki uç bölge için işaret konileri",
      ],
      rules: [
        pressure(age),
        "Nötrler yalnız kendi uç bölgesinde oynar; topu alan hedef yönü değiştirir.",
        "Puan için top hedef oyuncuda kontrol edilmelidir; bölgeye rastgele vurmak puan değildir.",
      ],
    });
  },

  "geriden-oyun": (ctx) => {
    const { age, diagram: d } = ctx;
    const young = age.level === 0;
    const builders = young ? 2 : 3;
    const pressers = young ? 2 : age.level === 1 ? 2 : 4;
    const targets = young ? 1 : 2;
    boundary(d);
    d.zone(50, 27, 76, 22, "#facc15");
    d.line(11, 39, 89, 39);
    d.goal(50, 83, 180, "large");
    d.keeper(50, 74, "K", "home");
    people(
      d,
      [
        [25, 62],
        [75, 62],
        [50, 49],
      ].slice(0, builders),
      "home",
      2
    );
    people(
      d,
      [
        [38, 55],
        [64, 53],
        [30, 40],
        [72, 39],
      ].slice(0, pressers),
      "away"
    );
    people(
      d,
      targets === 1
        ? [[50, 24]]
        : [
            [25, 24],
            [75, 24],
          ],
      "home",
      6
    );
    d.ball(46, 72);
    d.pass(45, 70, 29, 63);
    d.pass(25, 58, young ? 48 : 27, 28);
    d.run(73, 58, 79, 45);
    if (!young) d.pass(28, 61, 46, 50);
    d.text(12, 18, "Çıkış bölgesi", 12);
    d.text(59, 81, "Kazan: kaleye", 12);
    const active = 1 + builders + pressers + targets;
    return finish(d, {
      organization: `${allocation(ctx, active)} Bir mavi kaleci, ${builders} oyun kurucu ve çıkış bölgesinde ${targets} mavi hedef; karşılarında ${pressers} kırmızı baskıcı vardır. Mavi kale kırmızının top kazanımı sonrası karşı hedefidir.`,
      steps: [
        "Kaleci topu başlatır; iki gerideki mavi yana açılır. İlk pası kalecinin gördüğü serbest tarafa ver.",
        young
          ? "İki oyun kurucu kaleciyi üçüncü pas seçeneği yapar; tek ileri hedef rakibin pas gölgesinden çıkar."
          : "Merkezdeki mavi baskıyı üzerine çeker; kanat ve iki ileri hedeften açık olanı üçüncü oyuncu bağlantısıyla bul.",
        "Mavi topu çıkış bölgesindeki hedefe kontrol ettirirse 1 puan alır. Hedef geriye servis eder ve yeni hücum kaleciden başlar.",
        "Kırmızı topu kazanınca aynı kaleye hücum eder; mavi oyun kurucular savunmaya döner. Gol kırmızıya 1 puandır.",
        "Gol, kontrollü çıkış veya topun dışarı gitmesi tekrar sonudur. İki tekrardan sonra ileri hedef, oyun kurucu ve baskıcıları döndür; kaleci rolünü uygun oyuncularla değiştir.",
      ],
      coachingPoints: [
        "Kaleci ilk pasından sonra geri destek açısını korusun.",
        "İleri hedef topa düz yaklaşarak rakibin arkasına saklanmasın.",
        "Merkez kapalıysa kanadı kullan; zorunlu ileri pasla topu kaybetme.",
      ],
      progressions: [
        "Baskıcılar kaleci pasına göre merkez ya da kanat tuzağını seçsin; çıkış ekibi üçüncü oyuncu veya kaleciye dönüşle çözsün.",
      ],
      regressions: ["İlk pas tamamlanana kadar baskıcıları orta çizginin gerisinde tut."],
      equipmentItems: [
        "1 büyük kale",
        "1 oyun topu ve kaleci yanında yedek toplar",
        "İki renk yelek",
        "Çıkış bölgesi için koniler",
      ],
      rules: [
        pressure(age),
        "İleri hedefler çıkış bölgesinde başlar; başarılı kontrolden sonra top kaleciye dönmeden yeni puan sayılmaz.",
        "Baskıcı kazanırsa oyun durmaz; kaleye hücum eder.",
      ],
    });
  },

  pres: (ctx) => {
    const { age, diagram: d } = ctx;
    const n = size(age);
    boundary(d);
    d.zone(76, 45, 24, 40, "#facc15");
    d.goal(26, 84, 180);
    d.goal(74, 84, 180);
    d.cone(28, 17);
    d.cone(44, 17);
    d.cone(59, 17);
    d.cone(75, 17);
    people(
      d,
      [
        [50, 29],
        [78, 43],
        [24, 44],
        [52, 47],
        [36, 25],
      ].slice(0, n),
      "away"
    );
    people(
      d,
      [
        [56, 48],
        [71, 61],
        [34, 60],
        [48, 68],
        [24, 65],
      ].slice(0, n),
      "home"
    );
    d.ball(55, 29);
    d.pass(55, 31, 74, 41);
    d.run(59, 48, 73, 47);
    d.run(71, 57, 69, 48);
    d.run(36, 58, 44, 48);
    d.pass(77, 48, 75, 77);
    d.text(12, 18, "Çıkış kapıları", 12);
    d.text(61, 29, "Tuzak", 12);
    d.text(12, 78, "Kazan: mini kale", 12);
    return finish(d, {
      organization: `${allocation(ctx, n * 2)} ${n} kırmızı oyun kurucu yukarıdaki iki koni kapısından çıkmaya çalışır; ${n} mavi baskıcı aşağıdaki iki mini kaleye hücum eder. Sarı yan bölge baskı tetikleyicisini gösterir.`,
      steps: [
        "Kırmızı 1 merkezden başlar ve yan oyuncu 2'ye pas verir. U12 ilk turda bu pası önceden bilir; sonraki turlarda yönü kırmızı seçer.",
        "Yana giden pas sırasında en yakın mavi dıştan içe yaklaşır; ikinci mavi iç dönüş pasını kapatır, üçüncü mavi uzak bağlantıyı daraltır.",
        "Kırmızı topu kaybetmeden üstteki bir kapıdan sürerek geçirirse 1 puan alır; baskı kırılırsa maviler birlikte geri yerleşir.",
        "Mavi topu kazandığında aşağıdaki iki mini kaleden açık olana oynar; gol 1 puandır. Kırmızı kayıptan sonra savunmaya döner.",
        "Gol, kapı geçişi veya dışarı çıkan top sonrası kırmızı merkezden yeniden başlar. İki hücum sonunda takımlar görev değiştirir; ilk baskıcı da her tur değişir.",
      ],
      coachingPoints: [
        "İlk baskıyı arkadaşlarının mesafesiyle birlikte başlat.",
        "İkinci oyuncu topa yığılmak yerine iç pası kapatsın.",
        "Baskı aşılırsa tek başına kovalamak yerine takımın arkasına dön.",
      ],
      progressions: [
        "Kırmızı geri pas veya ters kanat pasıyla tuzaktan kaçabilsin; maviler tetikleyiciyi kendileri seçsin.",
      ],
      regressions: ["Başlangıç pasını hep aynı yana ver; ilk baskı ve destek pozisyonunu yürüyerek prova et."],
      equipmentItems: [
        "2 mini kale",
        "1 oyun topu ve yedek toplar",
        "İki renk yelek",
        "İki çıkış kapısı ve yan bölge için koniler",
      ],
      rules: [
        pressure(age),
        "Yan bölge zorunlu hapis alanı değildir; kırmızı ters yöne çıkabilir.",
        "Mavi puanı yalnız top kazanımı sonrası mini kale golünden alır; salt baskı yapmak puan değildir.",
      ],
    });
  },

  "hucum-gecisi": (ctx) => {
    const { age, diagram: d } = ctx;
    const n = size(age);
    boundary(d);
    d.zone(50, 59, 54, 28, "#facc15");
    d.goal(28, 18, 0);
    d.goal(74, 18, 0);
    d.goal(50, 83, 180);
    people(
      d,
      [
        [43, 59],
        [67, 55],
        [30, 69],
        [76, 69],
        [22, 48],
      ].slice(0, n),
      "home"
    );
    people(
      d,
      [
        [52, 59],
        [58, 43],
        [35, 41],
        [73, 37],
        [50, 74],
      ].slice(0, n),
      "away"
    );
    d.ball(47, 57);
    d.pass(44, 54, 63, 51);
    d.run(32, 65, 28, 30);
    d.run(68, 51, 75, 30);
    d.pass(64, 48, 32, 29);
    d.dribble(29, 29, 29, 22);
    d.text(12, 22, "İki ileri hedef", 12);
    d.text(24, 77, "Kazanım alanı", 12);
    return finish(d, {
      organization: `${allocation(ctx, n * 2)} ${n} mavi ve ${n} kırmızı oynar. Kırmızı alttaki mini kaleye, mavi üstteki iki mini kaleye hücum eder. Sarı alanda gösterilen an, mavinin topu kazandığı örnektir.`,
      steps: [
        "Kırmızı merkezde topu kullanarak alttaki kaleye ilerler; mavi organize savunur. İlk öğretim tekrarında antrenör topu mavi 1'e vererek kazanım anını başlatabilir.",
        "Mavi 1 kazandığı topu kaldırıp başını çevirir; uygun ileri pas varsa 2'yi bulur, yoksa topu koruyup yana destek kullanır.",
        "Bir mavi geniş koşuyla iki üst kaleyi açar; diğer mavi topun gerisinde emniyet desteği sağlar. Kırmızı geriye dönüp iki hedefi savunur.",
        "Mavinin kazanımdan sonraki ilk üç pas içinde yaptığı gol 2, daha sonraki gol 1 puandır; kırmızı tekrar kazanırsa alttaki kaleye devam eder.",
        "Gol veya dışarı çıkan top sonrasında kırmızı merkezden başlar. İki hücumdan sonra takım hedeflerini ve ilk top kazanıcıyı değiştir.",
      ],
      coachingPoints: [
        "İlk bakış ileriye olsun; kapalı yola zorla pas verme.",
        "İki destek oyuncusu aynı koşu hattını kullanmasın.",
        "Kazanımda bütün oyuncular topun önüne çıkmasın; biri geri bağlantıyı korusun.",
      ],
      progressions: ["İlk pası rakibin kapattığı senaryoda güvenli destek üzerinden ters mini kaleyi bulmayı iste."],
      regressions: ["Kazanım başlangıcında kırmızı iki adım geri çekilir; maviye ilk pası kurma zamanı verir."],
      equipmentItems: [
        "3 mini kale",
        "1 oyun topu ve yedek toplar",
        "İki renk yelek",
        "Merkez kazanım alanı için koniler",
      ],
      rules: [
        pressure(age),
        "Top kaybında oyun devam eder; her takım kendi hedef yönünü korur.",
        "Üç pas bonusu acele şut zorunluluğu değildir; güvenli oyunla gelen gol de sayılır.",
      ],
    });
  },

  "savunma-gecisi": (ctx) => {
    const { age, diagram: d } = ctx;
    const n = size(age);
    boundary(d);
    d.zone(50, 73, 72, 20, "#facc15");
    d.line(12, 62, 88, 62);
    d.goal(26, 84, 180);
    d.goal(75, 84, 180);
    d.goal(50, 18, 0);
    people(
      d,
      [
        [54, 40],
        [32, 47],
        [70, 53],
        [23, 34],
        [76, 29],
      ].slice(0, n),
      "home"
    );
    people(
      d,
      [
        [61, 43],
        [48, 58],
        [26, 59],
        [72, 66],
        [36, 28],
      ].slice(0, n),
      "away"
    );
    d.ball(64, 44);
    d.run(55, 44, 59, 47);
    d.run(35, 49, 45, 62);
    d.run(70, 57, 65, 70);
    d.pass(61, 48, 51, 55);
    d.dribble(47, 63, 30, 77);
    d.text(12, 18, "Mavi hücum", 12);
    d.text(12, 70, "Geri yerleş", 12);
    return finish(d, {
      organization: `${allocation(ctx, n * 2)} ${n} mavi üst mini kaleye, ${n} kırmızı iki alt mini kaleye oynar. Çizim mavinin kırmızıya top kaybettiği andır. Alt sarı şerit, baskı aşıldığında mavinin yeniden savunma düzeni kuracağı referanstır.`,
      steps: [
        "Mavi hücum ederken kırmızı topu kazanır; ilk öğretim tekrarında antrenör topu kırmızı 1'e servis ederek kayıp anını gösterebilir.",
        "Topa en yakın mavi kontrollü baskı yapar; ikinci mavi ilk ileri pası kapatır, üçüncü mavi merkezden geriye dönerek iki alt kaleyi korur.",
        "Antrenör kayıptan itibaren beşe sayar. Mavi bu sürede kazanırsa üst mini kaleye devam eder; sayım yalnız ortak tepki işaretidir.",
        "İlk baskı aşılırsa ya da sayım biterse bütün maviler merkez yolunu daraltıp sarı şerit hizasında yeniden yerleşir; kırmızı alt kaleleri arar.",
        "Her gol 1 puandır. Mavi ilk beş sayımda kazanıp gol yaparsa 1 ek puan alır. Gol/dışarı sonrası maviden başla; iki hücumda takım görevlerini değiştir.",
      ],
      coachingPoints: [
        "Yakın oyuncu baskı yaparken uzak oyuncu hedef kaleyi korusun.",
        "Geri koşarken topu ve merkezdeki rakibi birlikte gör.",
        "İlk baskı kırıldıysa ikinci bir yalnız kovalamayı başlatma; birlikte yerleş.",
      ],
      progressions: [
        "Kırmızı kazanımda ilk pası ters yöne oynayarak mavinin baskıdan geri yerleşmeye geçiş kararını zorlasın.",
      ],
      regressions: [
        "Kayıp anını durdurarak yakın baskı, pas koruma ve geri dönüş rollerini birer kez göster; sonra oyunu sürdür.",
      ],
      equipmentItems: [
        "3 mini kale",
        "1 oyun topu ve yedek toplar",
        "İki renk yelek",
        "Geri yerleşme şeridi için koniler",
      ],
      rules: [
        pressure(age),
        "Beş sayım dolunca top otomatik el değiştirmez; oyun sürer ve mavi yerleşme görevine geçer.",
        "Kırmızı kazanır kazanmaz hücum edebilir; tekrar yalnız gol veya dışarıda durur.",
      ],
    });
  },

  "kompakt-blok": (ctx) => {
    const { age, diagram: d } = ctx;
    const defenders = age.level < 2 ? 4 : 6;
    const attackers = age.level === 0 ? 2 : 4;
    boundary(d);
    d.zone(50, 52, 66, 30, "#facc15");
    d.line(17, 46, 83, 46);
    d.line(17, 65, 83, 65);
    d.goal(33, 83, 180);
    d.goal(68, 83, 180);
    const front =
      defenders === 4
        ? [
            [38, 46],
            [66, 46],
          ]
        : [
            [29, 46],
            [50, 46],
            [71, 46],
          ];
    const back =
      defenders === 4
        ? [
            [38, 65],
            [66, 65],
          ]
        : [
            [29, 65],
            [50, 65],
            [71, 65],
          ];
    people(d, [...front, ...back], "home");
    people(
      d,
      [
        [25, 27],
        [76, 28],
        [48, 23],
        [57, 56],
      ].slice(0, attackers),
      "away"
    );
    d.cone(25, 18);
    d.cone(41, 18);
    d.cone(60, 18);
    d.cone(76, 18);
    d.ball(30, 27);
    d.pass(31, 28, 70, 28);
    [...front, ...back].forEach(([x, y]) => d.run(x + 3, y + 3, x + 11, y + 3));
    d.pass(75, 33, 69, 76);
    d.text(12, 35, "1. hat", 12);
    d.text(12, 72, "2. hat", 12);
    d.text(48, 15, "Çıkış kapıları", 12);
    return finish(d, {
      organization: `${allocation(ctx, defenders + attackers)} Mavi savunma iki gerçek hattan oluşur: önde ${defenders / 2}, arkada ${defenders / 2} oyuncu. ${attackers} kırmızı iki alt mini kaleye hücum eder. Mavi kazanırsa üstteki koni kapılarından çıkar.`,
      steps: [
        "Kırmızı 1 dışarıdan başlar ve 2'ye yatay pas verir. İki mavi hat topun gittiği tarafa birlikte kayar.",
        "Ön hattın topa yakın oyuncusu pası karşılar; arkadaki hat merkezi ve kale yolunu kapatır. Uzak oyuncular boşalan merkez bağlantısını daraltır.",
        attackers === 2
          ? "İki kırmızı topu yanlara çevirip hatlar arasında sürüş yolu arar; mavi oyuncular çizgiler üzerinde sabit kalmadan rakibi karşılar."
          : "Kırmızının hat arasındaki oyuncusu alım arar; mavi ön hat pası engellerken arka hat koşuyu devralır. Kırmızı yan pas, iç pas veya sürüşü seçer.",
        "Kırmızı alt mini kaleye gol atarsa 1 puan alır. Mavi kazanırsa üstteki kapılardan kontrollü sürüşle çıkarak 1 puan alır; kırmızı geri savunur.",
        "Gol, kapı geçişi veya dışarıda tekrar biter. İki hücumda ön ve arka hattı değiştir; sonraki turda kırmızı oyuncuları da sırayla mavi rollere geçir.",
      ],
      coachingPoints: [
        "İki hat aynı anda topa yaklaşarak arka alanı boşaltmasın.",
        "Uzak taraftaki oyuncu merkezle bağını korusun.",
        "Hat arasındaki rakibi kimin devraldığını kısa sesli iletişimle bildir.",
      ],
      progressions: [
        "Kırmızı hat arası alımdan sonra ters taraftaki mini kaleyi hedefleyebilir; mavi blok ikinci kez kayar.",
      ],
      regressions: [
        "İlk iki yatay pas boyunca oyunu durdurup iki hattın birlikte yerleşmesini göster; ardından canlı oyuna geç.",
      ],
      equipmentItems: [
        "2 mini kale",
        "1 oyun topu ve yedek toplar",
        "İki renk yelek",
        "Hat referansları ve iki çıkış kapısı için koniler",
      ],
      rules: [
        pressure(age),
        "Çizgiler yerleşme referansıdır; savunmacılar müdahale ve geri dönüş için hat dışına çıkabilir.",
        "Mavi topu kazandığında yalnız uzaklaştırmak puan değildir; çıkış kapısında kontrol gerekir.",
      ],
    });
  },

  "genislik-derinlik": (ctx) => {
    const { age, diagram: d } = ctx;
    const n = size(age) - 1;
    boundary(d);
    d.zone(18, 50, 16, 68, "#facc15");
    d.zone(82, 50, 16, 68, "#facc15");
    d.line(28, 15, 28, 85);
    d.line(72, 15, 72, 85);
    d.goal(50, 18, 0);
    d.goal(50, 83, 180);
    people(
      d,
      [
        [40, 62],
        [56, 33],
        [61, 56],
        [37, 43],
      ].slice(0, n),
      "home"
    );
    people(
      d,
      [
        [48, 53],
        [58, 44],
        [38, 31],
        [60, 71],
      ].slice(0, n),
      "away"
    );
    d.player(18, 48, "N1", "neutral");
    d.player(82, 42, "N2", "neutral");
    d.ball(36, 62);
    d.pass(36, 60, 21, 50);
    d.pass(22, 45, 52, 33);
    d.run(57, 29, 62, 22);
    d.pass(60, 34, 78, 41);
    d.run(44, 62, 50, 69);
    d.text(12, 18, "Genişlik", 12);
    d.text(71, 77, "Nötr", 12);
    return finish(d, {
      organization: `${allocation(ctx, n * 2 + 2)} Merkezde ${n} maviye karşı ${n} kırmızı; iki yan koridorda birer nötr vardır. Mavi üst, kırmızı alt mini kaleye oynar. Nötrler topa sahip takıma genişlik sağlar; iç oyuncular derinlik ve geri desteği kurar.`,
      steps: [
        "Mavi 1 başlar ve sol nötr N1'i bulur; ileri oyuncu rakibin arkasında derinlik açısı oluşturur.",
        "N1 içteki ileri oyuncuya ya da gerideki desteğe pas seçer; merkez kapanırsa N2 üzerinden yön değiştir.",
        "Bir oyuncu derinlik verirken bir diğeri topun gerisinde kalır. Nötrler kendi yan koridorunda ileri geri hareket ederek pas açısı kurar.",
        "En az bir yan nötr bağlantısından sonra rakip mini kaleye gol 1 puandır; aynı hücumda iki nötr kullanılırsa gol 2 puandır.",
        "Kırmızı kazanırsa nötrleri kullanarak alt kaleye yönelir; önceki takım geri savunur. Gol/dışarı sonrası karşı ekip başlar. İki hücumda nötrleri ve iç rolleri döndür.",
      ],
      coachingPoints: [
        "Genişlik pası verildiğinde iç oyuncular aynı yatay hatta kalmasın.",
        "Derinlik oyuncusu sürekli topa yaklaşarak alanı daraltmasın.",
        "Ters kanat açık olsa da pas yolu kapalıysa geriden bağlantı kur.",
      ],
      progressions: ["Nötr topu aldığında en yakın rakip yan koridora girerek kontrollü baskı yapabilir."],
      regressions: ["Yan nötrlere baskı uygulama; gol öncesi tek yan bağlantıyı yeterli tut ve bonusu kaldır."],
      equipmentItems: [
        "2 mini kale",
        "1 oyun topu ve yedek toplar",
        "İki renk yelek ve 2 nötr yelek",
        "İki yan koridor için koniler",
      ],
      rules: [
        pressure(age),
        "Nötrler gol atmaz, yan koridorlardan çıkarak merkezde sayısal üstünlük kurmaz.",
        "Top kazanımı yeni hücumdur; önceki takımın yan bağlantıları yeni takım için sayılmaz.",
      ],
    });
  },

  "son-bolge": (ctx) => {
    const { age, diagram: d } = ctx;
    const n = size(age);
    boundary(d);
    d.zone(50, 30, 56, 28, "#facc15");
    d.line(22, 44, 78, 44);
    d.goal(50, 17, 0, "large");
    d.keeper(50, 25, "K", "away");
    d.goal(24, 82, 180);
    d.goal(76, 82, 180);
    people(
      d,
      [
        [49, 58],
        [77, 48],
        [38, 37],
        [23, 49],
        [62, 64],
      ].slice(0, n),
      "home"
    );
    people(
      d,
      [
        [53, 42],
        [68, 37],
        [34, 47],
        [57, 32],
      ].slice(0, n - 1),
      "away"
    );
    d.ball(45, 58);
    d.pass(53, 56, 73, 49);
    d.dribble(76, 44, 75, 30);
    d.run(38, 33, 45, 29);
    d.pass(72, 33, 53, 55);
    d.pass(49, 52, 51, 30);
    d.text(12, 22, "Son pas / şut", 12);
    d.text(12, 73, "Kırmızı: karşı hedef", 12);
    return finish(d, {
      organization: `${allocation(ctx, n * 2)} ${n} mavi hücumcu, ${n - 1} kırmızı savunmacı ve bir kırmızı kaleci oynar. Mavi üstteki büyük kaleye, kırmızı kazanımda alttaki iki mini kaleye hücum eder. Sarı alan son pas ve koşu karar bölgesidir.`,
      steps: [
        "Mavi 1 kaleye dönük merkezden başlar; savunmacılar şut yolunu ya da kanat pasını kapatmayı seçer.",
        "Şut yolu açıksa mavi 1 bitirir; merkez kapalıysa 2'yi kanatta bulur. İleri oyuncu ön direğe koşu ile geriye çıkarılan pasa destek arasında seçim yapar.",
        "Kanat oyuncusu savunmacı öne gelirse geriye pas, içeride kalırsa sürüş veya son pas seçer; pas yolu yoksa merkeze dönüp hücumu yeniden kurar.",
        "Büyük kaleye her gol 1 puandır; savunma çizgisi gerisine koşu veya geriye çıkarılan pas sonrası tek vuruş golü 2 puandır. Zorunlu orta ya da şut koridoru yoktur.",
        "Kırmızı veya kaleci topu kazanınca iki alt mini kaleden birine oynar; mavi geçişi savunur. Kırmızı golü 1 puandır. Gol/dışarı sonrası merkezden başla; iki hücumda rolleri sırayla döndür.",
      ],
      coachingPoints: [
        "Top gelmeden kaleci konumunu ve kapalı şut yolunu gör.",
        "İki hücumcu aynı anda aynı direğe koşmasın.",
        "Geriye çıkarılan pasta topun gerisindeki destek acele etmeden alanı görsün.",
      ],
      progressions: [
        "Kırmızı savunmayı dar veya geniş başlat; mavi takımdan hangi son pasın neden açık olduğunu okuyarak çözüm seçmesini iste.",
      ],
      regressions: [
        "İlk kanat pasına kadar savunmacılar sarı alanda beklesin; hücumcular alım ve koşu zamanını kurabilsin.",
      ],
      equipmentItems: [
        "1 büyük kale ve 2 mini kale",
        "1 oyun topu ve merkezde yedek toplar",
        "İki renk yelek",
        "Karar alanı için koniler",
      ],
      rules: [
        pressure(age),
        "Savunmacılar ve kaleci canlı rakiptir; top kazanımında oyun sürer.",
        "Bonus için zorla son pas aranmaz; açık şut ve güvenli geri pas geçerli kararlardır.",
      ],
    });
  },
};
