import { finish } from "./diagram-builder.mjs";

// Original coaching proposals. These organizations remain DRAFT until reviewed.
const groupNote = (_area, _players, count) =>
  `Seçilen yaş uyarlamasındaki alanı kullan; çizim ${count} kişilik tek örnek çalışma grubudur. Toplam oyuncu aralığını seçilen yaş uyarlamasından al. Aynı düzeni aralıklı paralel gruplarda kur; tam gruba sığmayan oyuncuları her turda sırayla değiştir, bekleyenlere aktif rotanın dışında yer ayır.`;

const circle = (count, radius = 30) =>
  Array.from({ length: count }, (_, i) => {
    const angle = Math.PI / 2 + (i * Math.PI * 2) / count;
    return [50 + Math.cos(angle) * radius, 50 + Math.sin(angle) * radius];
  });

const shortPass = (d, from, to) => {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  d.pass(from[0] + dx * 0.13, from[1] + dy * 0.13, to[0] - dx * 0.13, to[1] - dy * 0.13);
};

export const warmCool = {
  "dinamik-hareketlilik"({ age, diagram: d, area, players }) {
    [22, 50, 78].forEach((x, i) => {
      d.zone(x, 45, 14, 46);
      [
        [x - 7, 22],
        [x + 7, 22],
        [x - 7, 68],
        [x + 7, 68],
      ].forEach(([a, b]) => d.cone(a, b));
      d.player(x, 74, i * 2 + 1);
      d.player(x, 85, i * 2 + 2);
      d.run(x, 68, x, 29);
    });
    d.text(15, 13, "1 · Adımlama", 13);
    d.text(43, 13, "2 · Yan adım", 13);
    d.text(70, 13, "3 · Kalça aç", 13);
    const decision = [
      "U12: antrenör her koridorda bir hareket gösterir; oyuncular modeli rahat tempoda taklit eder.",
      "U14: antrenör iki hareketten birini başlangıçtan önce söyler; oyuncu doğru hareketi seçer.",
      "U16: öndeki oyuncu iki hareketten birini seçer, eşi mesafeyi koruyarak sonraki tekrarda eşler.",
      "U18: eşler iki hareketi sıraya koyar; ikinci oyuncu ilk oyuncunun bitirişini görmeden başlamaz.",
      "A Takım: eşler pozisyonlarına uygun iki kontrollü hareketi antrenöre gösterir; onaylanan sırayı uygular.",
    ][age.level];
    return finish(d, {
      organization: `${groupNote(area, players, 6)} Üç ayrı tek yönlü koridor kur; 1–2, 3–4 ve 5–6 koridor girişinde eşleşir. İlk turda adımlama, yan adım ve kontrollü kalça açma gösterilir. Koridor dışındaki dönüş yolunu boş tut.`,
      steps: [
        "1, 3 ve 5 kendi koridorunda gösterilen hareketle ilerler; eşleri girişte bekler.",
        "Çıkış konilerini geçen oyuncu koridor dışından yürüyerek geri döner; yol boşalınca eşi başlar.",
        decision,
        "Her eş iki geçişi tamamlayınca bir sonraki koridora yürür; üç koridoru tamamlamak bir turdur.",
        "Başarı ölçütü üç hareketi dengeli, boş koridorda ve komşu oyuncuya yaklaşmadan tamamlamaktır; hız yarışı yapılmaz.",
      ],
      coachingPoints: [
        "Hareket genişliğini oyuncunun rahatça kontrol edebildiği aralıkta tut.",
        "Yan adımda gövde kontrolünü ve dönüşte çevre kontrolünü gözle.",
        "Eşin hareketini kopyalarken mesafeyi korumayı hızdan önce değerlendir.",
      ],
      progressions: ["Aynı sakin tempoda koridorun ilk ve ikinci yarısına iki farklı hareket koy."],
      regressions: ["Koridoru kısalt; her geçişte yalnız bir gösterilmiş hareket kullan ve eşleri tek tek başlat."],
      equipmentItems: ["12 koni"],
      rules: [
        "Koridor içinde sollama ve karşı yönde dönüş yoktur.",
        decision,
        "Oyuncu rahatsızlık hissederse hareketi durdurup antrenöre bildirir.",
      ],
    });
  },

  reaksiyon({ age, diagram: d, area, players }) {
    d.zone(50, 49, 16, 16);
    [
      [20, 29],
      [20, 43],
    ].forEach(([x, y]) => d.cone(x, y, "#ef4444"));
    [
      [80, 29],
      [80, 43],
    ].forEach(([x, y]) => d.cone(x, y, "#60a5fa"));
    d.text(10, 19, "Kırmızı", 13);
    d.text(74, 19, "Mavi", 13);
    if (age.level >= 2) {
      d.cone(44, 20, "#facc15");
      d.cone(56, 20, "#facc15");
      d.text(44, 12, "Sarı", 13);
      d.run(50, 43, 50, 25);
    }
    d.player(50, 50, 1);
    [
      [36, 82],
      [50, 82],
      [64, 82],
    ].forEach(([x, y], i) => d.player(x, y, i + 2));
    d.run(44, 48, 24, 37);
    d.run(56, 48, 76, 37);
    d.line(29, 72, 71, 72);
    d.text(29, 63, "Sıradaki oyuncular", 13);
    const decision = [
      "U12: iki kapı kullan; antrenör rengi söyler ve aynı kapıyı gösterir.",
      "U14: iki kapı kullan; oyuncu yalnız renk işaretini gördükten sonra kapıyı seçer.",
      "U16: üç kapı kullan; antrenörün gösterdiği renge göre boş kapıya yönel.",
      "U18: üç kapı kullan; sıradaki eş bir kapıyı kapalı ilan eder, oyuncu kalan iki kapıdan gösterileni seçer.",
      "A Takım: üç kapı kullan; sıradaki eş kapalı kapıyı işaretler, çalışan oyuncu açık iki seçenekten birini adıyla söyleyip seçer.",
    ][age.level];
    const gateSetup =
      age.level >= 2
        ? "Merkezin solunda kırmızı, sağında mavi ve önünde sarı olmak üzere çizimde üç kapı vardır; bu üç kapıyı kur."
        : "Merkezin solunda kırmızı ve sağında mavi olmak üzere çizimde iki kapı vardır; bu iki kapıyı kur.";
    return finish(d, {
      organization: `${groupNote(area, players, 4)} 1 merkez başlangıç karesindedir; 2–4 ayrı bekleme çizgisindedir. ${gateSetup} İşareti antrenör veya sırası belirtilen eş verir; kimse kapıya doğru yarışmaz.`,
      steps: [
        decision,
        "1 merkezde rahat adımlarken işareti alır; başını kaldırır, kapıyı söyler ve kontrollü kısa koşuyla yalnız o kapıyı geçer.",
        "Kapıdan sonra yavaşlar ve dış kenardan yürüyerek bekleme çizgisine döner; 2 merkezde yerini alır.",
        "Dört oyuncu sırayla tamamladıktan sonra işaret veren rolünü değiştir; yanlış seçimde durup işareti yeniden göster.",
        "Başarı ölçütü seçimi doğru sözelleştirip kapıyı dengeli geçmektir; süre ve sıralama puanı tutulmaz.",
      ],
      coachingPoints: [
        "İşaret verilmeden yön tahminiyle fırlamayı önle.",
        "Yön değişiminde kısa, kontrollü adımlar gözle.",
        "Bekleyenleri dönüş yolundan uzakta tut; hızlı dönüş yerine yavaşlayarak bitirmeyi hatırlat.",
      ],
      progressions: ["Koşu hızını artırmadan görsel işaret ile kapalı kapı bilgisini birlikte kullan."],
      regressions: ["İki kapı ve tek renkli sözlü işarete dön; kapıya yürüyerek git."],
      equipmentItems: [age.level >= 2 ? "6 renkli koni" : "4 renkli koni", "başlangıç için 4 düz işaretleyici"],
      rules: [
        "Alanda aynı anda yalnız bir çalışan oyuncu bulunur; savunmacı ve fiziksel temas yoktur.",
        decision,
        "Her seçimden sonra yürüyerek dönüş ve sıra değişimi yapılır.",
      ],
    });
  },

  "topla-aktivasyon"({ age, diagram: d, area, players }) {
    const count = age.teamSize + 1;
    const positions = circle(count);
    d.zone(50, 48, 12, 12);
    d.text(39, 12, "Tek oyuncu merkezde", 13);
    positions.forEach(([x, y], i) => {
      d.player(x, y, i + 1);
      d.ball(x + 4, y + 2);
      d.cone(x - 5, y + 5);
    });
    d.dribble(48, 74, 46, 52);
    d.dribble(54, 53, 55, 73);
    const task = [
      "U12: dört oyuncu sırayla merkeze girer; antrenörün gösterdiği tek taban durdurmayı uygular.",
      "U14: beş oyuncu sırayla girer; merkeze varmadan sağ veya sol ayakla dönüş kararını söyler.",
      "U16: beş oyuncu sırayla girer; eşin el işaretine göre iki dönüş yönünden birini seçer.",
      "U18: altı oyuncu sırayla girer; merkeze girmeden çevre kontrolü yapıp boş dönüş tarafını söyler.",
      "A Takım: altı oyuncu sırayla girer; pozisyonuna uygun açık vücut yönünü seçer ve dönüşten sonra kararını eşine açıklar.",
    ][age.level];
    return finish(d, {
      organization: `${groupNote(area, players, count)} ${count} oyuncu çember üzerindeki konilerde kendi topuyla başlar; merkez karede en fazla bir oyuncu çalışır. Çizimde 1'in merkeze gidişi ve kendi konisine dönüşü gösterilir. Diğer oyuncular kendi noktasında küçük top dokunuşları yapar.`,
      steps: [
        task,
        "1 küçük dokunuşlarla merkeze top sürer, topu tabanıyla kontrol eder ve seçtiği yöne dönerek kendi konisine geri çıkar.",
        "1 dış koniye ulaştığında 2 başlar; sıra çember boyunca ilerler, merkezde yollar kesişmez.",
        "Bir tur sonunda dönüş ayağını değiştir; sonraki turu diğer yönden başlat.",
        "Başarı ölçütü topu merkez içinde kontrol edip kendi noktasına yakın tutarak dönmektir; top kapma veya hızlı tur puanı yoktur.",
      ],
      coachingPoints: [
        "Başını kısa aralıklarla kaldırmayı ve merkezin boş olduğunu görmeyi iste.",
        "Topu durdururken ve dönerken rahat adım aralığını koru.",
        "Bekleyen oyuncunun topunun komşu başlangıç noktasına gitmemesini gözle.",
      ],
      progressions: ["Hızı artırmadan merkezde ikinci bir kontrollü dokunuş ve diğer ayakla çıkış ekle."],
      regressions: ["Dönüş seçimini kaldır; topu durdurup aynı yoldan yavaşça geri dön."],
      equipmentItems: [`grup başına ${count} top`, `grup başına ${count} koni`, "merkez için 4 düz işaretleyici"],
      rules: [
        "Merkez boşalmadan sıradaki oyuncu başlamaz; rakip baskısı uygulanmaz.",
        task,
        "Oyuncular yalnız kendi toplarıyla çalışır; merkezde pas alışverişi yapılmaz.",
      ],
    });
  },

  koordinasyon({ age, diagram: d, area, players }) {
    d.player(28, 75, 1);
    d.player(74, 29, 2);
    d.player(20, 86, 3);
    d.ball(69, 32);
    d.ladder(28, 50, 18, 90);
    d.cone(28, 27);
    d.cone(73, 74);
    d.run(28, 69, 28, 63);
    d.run(28, 36, 34, 31);
    d.pass(68, 29, 39, 29);
    d.pass(39, 36, 68, 36);
    d.run(42, 44, 72, 70);
    d.run(67, 79, 32, 79);
    d.text(14, 13, "Adımla → pas al → geri ver", 13);
    d.text(49, 85, "Yürüyerek dön", 13);
    const task = [
      "U12: merdivende her aralığa bir kontrollü adım; çıkıştan sonra topu durdur ve iki dokunuşla geri ver.",
      "U14: iki önceden gösterilmiş adım düzeninden birini eşin söyler; çıkışta rahat ayağınla kontrol et ve geri ver.",
      "U16: eş sağ veya sol ayağa pas verir; merdivenden çıkınca vücudunu gelen topa göre açıp kontrol ederek geri ver.",
      "U18: çıkışta pasörün işaret ettiği ayağa hazırlan; geri pasın yönünü pasörün açık tarafına ayarla.",
      "A Takım: pasör rolüne uygun ayağı ve geri pas açısını işaret eder; çalışan oyuncu çıkışta bakıp o açıyı kurar.",
    ][age.level];
    return finish(d, {
      organization: `${groupNote(area, players, 3)} 1 merdiven girişinde, 2 ileride sağ çaprazdaki topuyla pas istasyonunda, 3 girişin gerisinde bekler. Merdiven çıkışı ile pas istasyonu arasında açık bir alım noktası vardır; dönüş yolu sağ alttaki koninin dışından geçer.`,
      steps: [
        task,
        "1 merdiveni kontrollü geçer, çıkış konisinde dengeli durur ve 2 ile göz teması kurar.",
        "2 çıkıştaki 1'e yerden pas verir; 1 topu kontrol edip 2'ye geri yollar, ardından dış dönüş konisine yürür.",
        "1 merdivenden ve alım noktasından uzaklaştığında 3 başlar; 1 ve 3 ikişer tekrar yapınca 2 pasör rolünü sıradaki oyuncuya devreder.",
        "Başarı ölçütü merdivene takılmadan dengeli çıkış ve pasörün rahat kontrol edebileceği geri pastır; adım hızı puanlanmaz.",
      ],
      coachingPoints: [
        "Pasın merdiven içinde değil, çıkışta dengeli pozisyona verildiğini kontrol et.",
        "Başını çıkışta kaldırmayı ve destek ayağını yerleştirmeyi hatırlat.",
        "Sıra oyuncusunun yeterli boşluk bırakmasını ve dönüş rotasının merdiveni kesmemesini sağla.",
      ],
      progressions: ["Temas sayısını zorlamadan pasörün sağ veya sol ayağa pas seçimini ekle."],
      regressions: ["Merdiveni kaldırıp düz işaretleyiciler arasında yürü; alım noktasında topu tamamen durdur."],
      equipmentItems: ["grup başına 1 koordinasyon merdiveni", "grup başına 1 top", "2 dönüş konisi"],
      rules: [
        "Oyuncu merdivenden çıktıktan ve hazır olduğunu gösterdikten sonra pas verilir.",
        task,
        "Savunmacı ve yarış yoktur; dönüş yürüyerek yapılır.",
      ],
    });
  },

  "aktif-toparlanma"({ age, diagram: d, area, players }) {
    const count = age.teamSize;
    [
      [18, 25],
      [82, 25],
      [82, 77],
      [18, 77],
    ].forEach(([x, y]) => d.cone(x, y));
    d.run(25, 25, 75, 25);
    d.run(82, 32, 82, 69);
    d.run(75, 77, 25, 77);
    d.run(18, 70, 18, 33);
    d.zone(38, 49, 16, 20);
    d.zone(64, 49, 16, 20);
    d.text(29, 44, "Ayak bileği", 12);
    d.text(56, 44, "Rahat açılma", 12);
    d.text(27, 12, "Dış rota: yürüyüş", 14);
    [
      [40, 25],
      [82, 51],
      [47, 77],
      [18, 53],
      [65, 77],
    ]
      .slice(0, count)
      .forEach(([x, y], i) => d.player(x, y, i + 1));
    const task = [
      "U12: üç kişilik grup; antrenör her cepte tek bir rahat hareketi gösterir ve grubu birlikte yeniden başlatır.",
      "U14: dört kişilik grup; her oyuncu iki gösterilmiş rahat hareketten birini seçer.",
      "U16: dört kişilik grup; eşler birbirine mesafe ve dengeli duruş konusunda tek gözlem verir.",
      "U18: beş kişilik grup; her oyuncu cepten çıkmaya hazır olduğunu işaret eder, grup kimseyi hızlandırmaz.",
      "A Takım: beş kişilik grup; oyuncular kendi rahat yürüyüş temposunu seçer, tur sonunda antrenöre kısa geri bildirim verir.",
    ][age.level];
    return finish(d, {
      organization: `${groupNote(area, players, count)} ${count} oyuncu dış dikdörtgen rotaya aralıklı yerleşir. Ortadaki iki cep yürüyüşten çıkıp kontrollü hareketlilik yapmak içindir; ceplerin erişim yolunu boş bırak. Kesik oklar bu çalışmada yürüyüş yönünü gösterir.`,
      steps: [
        "Oyuncular ok yönünde konuşmayı rahat sürdürebildikleri kendi yürüyüş tempolarıyla dolaşır; birbirini geçmez.",
        "Antrenörün işaretinde yakın cepten içeri girip dengeli ayak bileği hareketi veya rahat gövde açılmasını uygular; zorlayıcı esneme yapılmaz.",
        task,
        "Hazır olan oyuncu dış rotada boşluk görerek yeniden yürüyüşe katılır; sonraki turda diğer cebi kullanır.",
        "Başarı ölçütü iki cebi acele etmeden kullanmak ve rotaya aralığı koruyarak dönmektir; tur sayısı yarışı yoktur.",
      ],
      coachingPoints: [
        "Temponun tur boyunca yükselmediğini ve yürüyüşün rahat kaldığını gözle.",
        "Cepte hareket genişliğini oyuncunun rahat kontrolüyle sınırla.",
        "Yeniden katılmada gelen oyuncuya yol vermeyi hatırlat.",
      ],
      progressions: ["Tempo yerine öz yönetimi geliştir: oyuncu rahat bulduğu hareketi seçip seçimini eşine açıklar."],
      regressions: ["Tek cep ve daha kısa yürüyüş rotası kullan; oyuncunun gerektiğinde durmasına izin ver."],
      equipmentItems: ["4 dış rota konisi", "iki hareketlilik cebi için 8 düz işaretleyici"],
      rules: [
        "Koşu, sprint, rakip baskısı ve süreye karşı yarış yoktur.",
        task,
        "Oyuncu rahatsızlıkta durup antrenöre bildirir; hareket zorlanmaz.",
      ],
    });
  },

  "teknik-soguma"({ age, diagram: d, area, players }) {
    const count = age.teamSize + 1;
    const positions = circle(count, 29);
    positions.forEach(([x, y], i) => d.player(x, y, i + 1));
    d.ball(55, 79);
    positions.forEach((point, i) => shortPass(d, point, positions[(i + 1) % count]));
    d.text(24, 12, "Bir top · yerini koru · rahat pas", 14);
    const task = [
      "U12: dört oyuncu, tek top; antrenörün belirlediği yönde komşuya pas ver, topu durdurmak serbesttir.",
      "U14: beş oyuncu, tek top; alıcı pas öncesi sağ veya sol ayağını gösterir, pasör buna göre verir.",
      "U16: beş oyuncu, tek top; alıcı hazır olduğunu gösterir, pasör sonraki komşuyu adıyla söyler.",
      "U18: altı oyuncu, tek top; tur sonunda alıcı yön değişimi teklif eder, herkes hazırsa yön değiştirilir.",
      "A Takım: altı oyuncu, tek top; alıcı uygun ayağını ve vücut açısını kendi rolü üzerinden seçer, tur sonunda yönü birlikte değiştirir.",
    ][age.level];
    return finish(d, {
      organization: `${groupNote(area, players, count)} ${count} oyuncu çemberde rahat bir pas mesafesiyle sabit durur; yalnız 1'de top vardır. Çizimdeki mavi oklar topun çemberde sırayla dolaşmasını gösterir; merkezde oyuncu veya top kapma görevi yoktur.`,
      steps: [
        task,
        "1 hazır komşusuna hafif yerden pas verir; alıcı rahat sayıda dokunuşla kontrol edip sonraki komşusuna yollar.",
        "Top her oyuncuya uğrayıp 1'e döndüğünde bir tur tamamlanır; acele etmeden hazır işaretini bekle.",
        "İki tur sonra pas yönünü ve ilk pasörü değiştir; yer değiştirmek için koşulmaz.",
        "Başarı ölçütü topun çember dışına kaçmadan herkes tarafından rahat kontrol edilmesidir; seri veya tek dokunuş hedefi konmaz.",
      ],
      coachingPoints: [
        "Pas şiddetini komşunun rahat kontrolüne göre ayarla.",
        "Topu ayağının altına sıkıştırmadan dengeli ilk teması gözle.",
        "İsim söyleme ve hazır olma işaretinin pası acele ettirmediğini kontrol et.",
      ],
      progressions: ["Hızı artırmadan alıcının tercih ettiği ayağa pası daha tutarlı göndermeyi hedefle."],
      regressions: ["Çemberi küçült ve her alıcıya topu tamamen durdurma serbestliği ver."],
      equipmentItems: ["grup başına 1 top", "çember noktaları için düz işaretleyiciler"],
      rules: [
        "Savunmacı, top kapma, temas sınırı ve pas süresi sınırı yoktur.",
        task,
        "Top kaçınca en yakın oyuncu yürüyerek alır; diğerleri yerini korur.",
      ],
    });
  },

  "nefes-hareketlilik"({ age, diagram: d, area, players }) {
    const stations = [
      [26, 33],
      [70, 33],
      [26, 70],
      [70, 70],
    ];
    stations.forEach(([x, y], i) => {
      d.zone(x, y, 27, 25);
      d.player(x, y + 2, i + 1);
      d.marker(x - 8, y + 8);
      d.marker(x + 8, y + 8);
    });
    d.text(15, 22, "1 · Omuz", 12);
    d.text(58, 22, "2 · Gövde", 12);
    d.text(15, 59, "3 · Kalça", 12);
    d.text(58, 59, "4 · Ayak bileği", 12);
    d.run(43, 34, 53, 34);
    d.run(70, 49, 70, 53);
    d.run(53, 73, 43, 73);
    d.run(26, 54, 26, 49);
    const task = [
      "U12: antrenör her istasyonda tek bir rahat hareketi gösterir; oyuncular nefesi tutmadan kendi ritminde uygular.",
      "U14: oyuncu her istasyonda gösterilen iki rahat hareketten birini seçer; hazır olduğunu söyleyince yürüyerek değişir.",
      "U16: oyuncu hareket genişliğini kendisi küçültüp büyütebilir; eşine yalnız dengeyle ilgili bir gözlem verir.",
      "U18: oyuncu iki rahat hareketi kendi sırasına koyar; istasyon değişimine hazır olduğunu işaret eder.",
      "A Takım: oyuncu rahat bulduğu hareket sırasını seçer; antrenöre hangi hareketi tercih ettiğini kısa bir cümleyle söyler.",
    ][age.level];
    return finish(d, {
      organization: `${groupNote(area, players, 4)} Dört oyuncu dört ayrı kişisel hareketlilik istasyonunda başlar: omuz, gövde, kalça ve ayak bileği. İşaretleyiciler kişisel alanı gösterir; oklar yalnız istasyonlar arasında yürüyüş yönüdür. Top ve rakip yoktur.`,
      steps: [
        "Oyuncular dengeli duruş alır; doğal, rahat nefes ritmini koruyarak istasyonun gösterilen küçük hareketini uygular.",
        task,
        "Antrenör herkesin hazır olduğunu gördüğünde oyuncular sıradaki boşalan istasyona yürür; dönüşler aynı yöndedir.",
        "Dört istasyonu tamamlayan grup durup hangi hareketi rahat bulduğunu paylaşır; gerekirse yalnız seçilen istasyonu tekrarlar.",
        "Başarı ölçütü hareketleri zorlamadan kontrollü tamamlamak ve istasyon değişiminde kişisel alanı korumaktır.",
      ],
      coachingPoints: [
        "Nefes tutma, zorunlu nefes sayısı veya zorunlu nefes süresi verme.",
        "Hareketin genişliğini oyuncunun rahatlığına göre küçült; eşle bastırarak esnetme yapma.",
        "İstasyon geçişini acele ettirme ve herkesin durabilmesine alan bırak.",
      ],
      progressions: ["Yoğunluğu artırmadan oyuncunun rahat iki hareketi kendi sırasına koymasına izin ver."],
      regressions: [
        "İstasyon değiştirmeden tek rahat hareketi uygula; oyuncu isterse oturarak veya durarak dinlenebilir.",
      ],
      equipmentItems: ["kişisel alanları belirlemek için düz işaretleyiciler"],
      rules: [
        "Nefes ritmi kişiseldir; nefes tutma ve süreye karşı görev yoktur.",
        task,
        "Rahatsızlık hisseden oyuncu hareketi bırakıp antrenöre bildirir; bu çalışma klinik değerlendirme değildir.",
      ],
    });
  },

  yansitma({ age, diagram: d, area, players }) {
    d.zone(50, 38, 68, 44);
    d.zone(50, 79, 54, 16, "#a78bfa");
    d.player(27, 29, 1);
    d.player(71, 50, 2);
    d.player(50, 38, 3, "away");
    d.ball(31, 32);
    [
      [16, 26],
      [16, 40],
      [84, 42],
      [84, 56],
    ].forEach(([x, y]) => d.cone(x, y));
    d.pass(33, 33, 65, 48);
    d.run(71, 43, 72, 31);
    d.dribble(76, 50, 88, 49);
    d.run(76, 62, 68, 70);
    d.marker(34, 82);
    d.marker(50, 82);
    d.marker(66, 82);
    d.text(28, 12, "2v1 · yalnız yürüyüş", 14);
    d.text(30, 73, "Dur · anlat · sonraki deneme", 12);
    const pressure = [
      "U12: 3 bir kapıyı göstererek kapalı tutar; pas kesmez ve topa müdahale etmez.",
      "U14: 3 yürüyerek tek pas kanalını gölgeler; topa müdahale etmez.",
      "U16: 3 yalnız yürüyerek pas arasına girebilir; ikili mücadele ve topa ayak uzatma yoktur.",
      "U18: 3 yürüyerek bir pas kanalını kapatır; hücumcular açık kapıyı ve destek açısını birlikte seçer.",
      "A Takım: 3 yürüyerek önceden konuşulan bir kanalı kapatır; hücumcular kendi rollerine uygun destek açısı seçer.",
    ][age.level];
    const reflection =
      age.level <= 1
        ? "Her oyuncu gördüğü bir boşluğu söyler; antrenör tek soruyla sonraki denemeyi netleştirir."
        : "Her oyuncu bir kararını ve sonraki denemede değiştireceği bir davranışı söyler; eşler bunu kısa bir ortak hedefe çevirir.";
    return finish(d, {
      organization: `${groupNote(area, players, 3)} 1 ve 2 hücumcu, 3 yön gösteren/gölge savunmacıdır; tek top 1'dedir. İki yan kapı hedef, alttaki ayrı alan tur sonrası yansıtma noktasıdır; oradaki üç işaret yeni oyuncu değildir. Bütün oyun yürüyüşle oynanır.`,
      steps: [
        pressure,
        "1 ve 2 birbirine iki rahat pas verir; alıcı boş açıya yürüyerek destek olur, ardından açık kapıya topu yürüyüşle sürer.",
        "Top çıkınca, araya girilince veya kapı geçilince tur biter; topu alan oyuncu yürüyerek getirir ve üçü yansıtma alanına gider.",
        reflection,
        "3 hücuma, 1 gölge rolüne geçer; diğer kapı yönünde ortak hedefi bir kısa turda yeniden dene.",
        "Başarı ölçütü sakin iki pasın ardından bir açık kapıyı bulmak ve herkesin gözlemini paylaşmasıdır; skor ve kazanan tutulmaz.",
      ],
      coachingPoints: [
        "Düşük tempoyu koru; boşluğa destek için kısa yürüyüş yeterlidir.",
        "Yansıtmayı kişiye yönelik yargı yerine görülen pas açısı ve kararla ilişkilendir.",
        "Her oyuncuya kısa konuşma sırası ver; sonraki tur için yalnız bir ortak davranış seç.",
      ],
      progressions: [
        "Yürüyüş temposunu koruyarak hücumcuların kullanacakları kapıyı önceden söylemeden birlikte seçmesini iste.",
      ],
      regressions: ["3'ü sabit yön gösterici yap; tek kapı ve serbest kontrolle iki pası tamamla."],
      equipmentItems: [
        "grup başına 1 top",
        "4 kapı konisi",
        "oyun ve yansıtma alanı için düz işaretleyiciler",
        "3 yansıtma noktası işaretleyicisi",
      ],
      rules: [
        "Yalnız yürüyüş; koşu, temas, kayma ve top için ikili mücadele yoktur.",
        pressure,
        "Her kısa turun ardından yansıtma ve rol değişimi yapılır; konuşmak istemeyen oyuncu pas geçebilir.",
      ],
    });
  },
};
