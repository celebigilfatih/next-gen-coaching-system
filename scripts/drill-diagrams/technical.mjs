import { finish } from "./diagram-builder.mjs";

// These are draft coaching proposals. The drawing shows one working group;
// the manifest's total player range is organized in parallel groups or rotations.
const group = ({ age }, size) =>
  `Seçilen yaşın alan ve toplam oyuncu aralığını kullan. Çizim ${size} kişilik tek çalışma grubunu gösterir. Toplam sayıyı ${size} kişilik gruplara ayır; alan ve güvenli mesafe uygunsa paralel kur, kalan oyuncuları sırayla değiştir. Alan yetmiyorsa tek grup çalışır, diğerleri saha dışında top toplama/dinlenme görevi yapar. ${age.label} uyarlamasında antrenör baskıyı oyuncuların uygulama başarısına göre ayarlar.`;

const gate = (d, x, y, vertical = true) => {
  d.cone(x - (vertical ? 0 : 4), y - (vertical ? 4 : 0));
  d.cone(x + (vertical ? 0 : 4), y + (vertical ? 4 : 0));
};

export const technical = {
  pas: (ctx) => {
    const { diagram: d, age } = ctx;
    d.player(22, 74, 1);
    d.player(50, 24, 2);
    d.player(80, 72, 3);
    d.player(48, 54, 4, "away");
    d.ball(27, 69);
    gate(d, 35, 49);
    gate(d, 66, 47);
    gate(d, 51, 74);
    d.pass(28, 65, 46, 31);
    d.pass(56, 32, 75, 64);
    d.pass(73, 74, 30, 74);
    d.run(20, 67, 26, 52);
    d.run(45, 22, 39, 30);
    d.text(10, 17, "Üç pas kapısı", 14);
    d.text(10, 84, "Pas sonrası yeni açı", 13);
    return finish(d, {
      organization: `${group(ctx, 4)} Üç çift koniden üçgen pas kapısı kur. Mavi 1, 2 ve 3 kapıların dışındaki pas noktalarında, kırmızı 4 üçgenin ortasındadır. Bir top 1'de başlar; kırmızı oyuncunun rolü yaş kuralına göre değişir.`,
      steps: [
        "1, sol kapının arasından 2'ye yerden pas verir ve aynı kapı çizgisinde kalmadan yana açılarak yeni destek açısı oluşturur.",
        "2 topu alırken 3'ü görür, sağ kapıdan 3'e pas verir; pas sonrası kendi bölgesinde iki-üç adım yer değiştirir.",
        "3 alttaki kapıdan 1'e oynar. Pası bekleyen oyuncu kapının karşısına hareket ederek hat açar; kimse pasın geçtiği kapıda beklemez.",
        "Top üç kapıdan kayıpsız dolaşınca grup 1 puan kazanır. Kırmızı pası keserse top en yakın dış oyuncudan yeniden başlar.",
        "Her 60 saniyede 1→2→3→4→1 rol değişimi yap; yedek varsa kırmızıdan çıkan oyuncuyla değiştir. İkinci turda pas yönünü tersine çevir.",
      ],
      coachingPoints: [
        "Pas alıcısının uzağındaki ayağına uygun şiddetle gönderilsin.",
        "Alıcı pas çıkmadan kapının arkasında yeni açı bulsun.",
        "Pas sonrası hareket, sonraki pas hattını kapatmadan yapılsın.",
      ],
      progressions: [
        "Kırmızının aktif araya girmesine izin ver; aynı kapıyı art arda kullanmadan oyuncuların yön değiştirmesini iste.",
      ],
      regressions: ["Kırmızıyı gözlemci yap, kapıları genişlet ve kontrol ile pası ayrı temaslarda uygula."],
      equipmentItems: ["1 top ve yedek toplar", "6 koni", "2 renk yelek"],
      rules: [
        [
          "U12: kırmızı önce pasif gölge olur; dış oyuncular serbest temasla önceden gösterilen yönde oynar.",
          "U14: kırmızı yalnız bir kapıyı yürüyerek kapatır; dış üçlü iki yön arasında seçim yapar.",
          "U16: kırmızı aktif pas keser; dış üçlü en çok üç temasla boş kapıyı seçer.",
          "U18: kırmızı aktif pas keser; iki temas hedeflenir, kayıpta dış üçlü en yakın pası birlikte kapatır.",
          "A Takım: kırmızı aktif presle bir tarafı yönlendirir; dış üçlü tek/iki temas seçimini pas açısına göre yapar ve kayıpta ilk pası kapatır.",
        ][age.level],
        "Puan için top konilerin arasından geçmeli ve takım arkadaşında kontrol edilmelidir; oyuncu veya koniye çarpan denemede puan verilmez.",
      ],
    });
  },

  "ilk-kontrol": (ctx) => {
    const { diagram: d, age } = ctx;
    d.line(50, 16, 86, 50);
    d.line(86, 50, 50, 84);
    d.line(50, 84, 14, 50);
    d.line(14, 50, 50, 16);
    d.player(50, 78, 1);
    d.player(50, 49, 2);
    d.player(50, 21, 3);
    d.player(20, 50, 4);
    d.player(80, 50, 5);
    if (age.level >= 2) d.player(43, 40, 6, "away");
    d.ball(54, 72);
    gate(d, 65, 49);
    gate(d, 35, 49);
    d.pass(50, 70, 50, 56);
    d.dribble(55, 49, 69, 49);
    d.pass(70, 49, 75, 49);
    d.run(54, 44, 64, 40);
    d.text(11, 15, "Kontrol elması", 14);
    d.text(12, 85, "Sağ / sol çıkış", 13);
    return finish(d, {
      organization: `${group(ctx, age.level >= 2 ? 6 : 5)} Dört dış pas noktası elmas oluşturur: 1 altta, 3 üstte, 4 solda, 5 sağdadır. 2 merkezde alıcıdır; sağ ve solda birer kontrol kapısı vardır.${age.level >= 2 ? " Kırmızı 6, merkez alıcının sol arkasından baskı yapar." : " Savunmacı yoktur; antrenör yönü işaret eder."} Top 1'de başlar.`,
      steps: [
        "2, top 1'den çıkmadan iki omuz üzerinden dış oyuncuları ve varsa baskıyı tarar.",
        "1 merkeze pas verir. Çizimde 2 ilk dokunuşunu sağ kapıdan açık alana yapar ve ikinci aksiyonda 5'e pas verir.",
        "2 merkeze döner; 5 sıradaki servisçi olur. Bir sonraki servis farklı bir dış noktadan gelir ve alıcı boş sağ/sol kapıyı kullanır.",
        "Kontrol kapısından çıkıp dış oyuncuya isabetli pas ulaştırmak 1 puandır. Kontrol topu dışarı taşırsa veya baskı topu kazanırsa puan yoktur.",
        "Dört servis sonrası alıcı, en son pas verdiği dış oyuncuyla değişir; savunmacı varsa her tur değişir. Yedekleri dış noktalardan dönüşümlü içeri al.",
      ],
      coachingPoints: [
        "İlk temas öncesi omuz kontrolünün gerçekten yapıldığını gözle.",
        "Kalça ve destek ayağını seçilen çıkışa aç; topu erişilemeyecek kadar uzağa itme.",
        "İkinci aksiyonun pas hattını ilk temasla hazırla.",
      ],
      progressions: ["Servisçi alıcının hazırlandığı ayağı değiştirir; savunmacı baskı yönünü geç belli eder."],
      regressions: ["Servis hızını düşür, tek çıkışı önceden belirle ve alıcıya kapı öncesi ek kontrol hakkı ver."],
      equipmentItems: ["1 top ve yedek toplar", "Elmas sınır konileri", "4 çıkış konisi", "2 renk yelek"],
      rules: [
        [
          "U12: servis öncesi sağ/sol kapı söylenir; serbest temasla doğru yöne ilk kontrol aranır.",
          "U14: kapı pas hareketi başlayınca gösterilir; kontrol ve çıkış pası için üç temas hedeflenir.",
          "U16: kırmızı 6 pas çıktıktan sonra kontrollü aktif baskıya başlar; alıcı baskıdan uzak kapıyı seçer.",
          "U18: kırmızı 6 servisle birlikte aktif baskıya çıkar; alıcı üç temas içinde kapıdan çıkıp dış oyuncuyu bulur.",
          "A Takım: kırmızı 6 iki taraftan birine baskıyı yönlendirir; alıcı iki/üç temas tercihini baskıya göre yapar, kapı kapalıysa servisçiye güvenli dönüş kullanır.",
        ][age.level],
        "Merkez alıcı dış oyuncuya pas vermeden yeni top gönderilmez; güvenli geri pas puan kazandırmaz fakat top kaybı sayılmaz.",
      ],
    });
  },

  "top-surme": (ctx) => {
    const { diagram: d, age } = ctx;
    d.zone(50, 50, 48, 42);
    d.player(43, 55, 1);
    d.player(55, 42, 2, "away");
    d.player(50, 81, 3);
    d.ball(48, 58);
    gate(d, 82, 46);
    gate(d, 18, 46);
    d.dribble(49, 58, 68, 60);
    d.dribble(68, 60, 85, 46);
    d.run(58, 45, 69, 52);
    d.pass(85, 54, 55, 77);
    d.text(13, 17, "Dar alan → boş kapı", 14);
    d.text(28, 87, "3: topu yeniden başlatır", 12);
    return finish(d, {
      organization: `${group(ctx, 3)} Ortadaki renkli kare yakın kontrol alanıdır. Sağ ve solda birer kaçış kapısı, altta servisçi 3 vardır. Mavi 1 top sürer; kırmızı 2 yaş kuralına göre gölge veya rakiptir. Her üçlü tek top kullanır.`,
      steps: [
        "3 yerden 1'e servis yapar; 1 renkli kare içinde yakın dokunuşlarla topu taşırken iki kapıyı gözler.",
        "2 bir kapıya yaklaşınca 1 hız veya yön değiştirip boş tarafa çıkar. Çizimde sağ kapıya doğru iki aşamalı sürme gösterilir.",
        "1 top ile kapıyı geçip hemen kontrol ederse 1 puan alır; ardından 3'e dıştan pas verip başlangıç alanına döner.",
        "2 topu kazanırsa servisçi 3'e pas vererek 1 puan kazanır. Her hücum kapı geçişi, top kaybı veya topun dışarı çıkışıyla biter.",
        "Üç hücum sonrası 1→2→3→1 değiş; ek oyuncu varsa 3'ten sırayla katılır. İki kapıya aynı anda başka grup yerleştirme.",
      ],
      coachingPoints: [
        "Dar karede topu ayağa yakın tut; boş alana çıkınca dokunuşu uzat.",
        "Topu rakibe yakın ayakla açıkta bırakmadan gövdeyi araya koy.",
        "Kapıdan sonra topu durdurabilecek mesafe ve dengeyi koru.",
      ],
      progressions: [
        "Rakip ilk servis anından itibaren iki kapıyı da savunabilir; hücumcu aldatma sonrası hızlanmayı kullanır.",
      ],
      regressions: ["Rakibi yürüyen gölge yap; kareyi ve kapıları genişleterek bir kapıyı önceden açık bırak."],
      equipmentItems: ["1 top ve yedek toplar", "8 alan/kapı konisi", "2 renk yelek"],
      rules: [
        [
          "U12: 2 önce pasif gölge olur; antrenör boş kapıyı gösterdikten sonra kontrollü aktif savunmaya geçilir.",
          "U14: 2 bir kapıyı yürüyerek kapatır; 1 diğer kapıyı kendi seçer.",
          "U16: 2 servis alındığında aktif savunur; 1 aldatma veya yön değişimiyle iki kapıdan birini seçer.",
          "U18: 2 servis çıkınca aktif olur; kazanırsa 3'e ilk pasıyla karşı puan arar.",
          "A Takım: 2 bir yöne baskı tuzağı kurabilir; 1 erken kaçış ile rakibi çekip ters çıkış arasında karar verir, top kaybında 3'e pası engellemeye çalışır.",
        ][age.level],
        "Kapıdan topsuz koşmak puan değildir; kontrol edilen top kapıdan geçmeli. Temas itme/çekme içermeden topa yönelik olmalıdır.",
      ],
    });
  },

  bitiricilik: (ctx) => {
    const { diagram: d, age } = ctx;
    d.zone(28, 56, 16, 50);
    d.zone(50, 56, 16, 50);
    d.zone(72, 56, 16, 50);
    d.goal(50, 14, 0, "large");
    d.keeper(50, 24, "K");
    d.player(28, 76, 1);
    d.player(50, 76, 2);
    d.player(72, 76, 3);
    d.ball(32, 71);
    d.ball(54, 72);
    d.ball(76, 72);
    if (age.level >= 2) d.player(62, 41, 4, "away");
    d.dribble(28, 68, 28, 41);
    d.pass(30, 38, 46, 18);
    d.dribble(50, 68, 50, 43);
    d.dribble(72, 68, 72, 41);
    d.text(9, 16, "Sıra: 1 → 2 → 3", 13);
    d.text(20, 87, "Üç ayrı geliş açısı", 13);
    return finish(d, {
      organization: `${group(ctx, age.level >= 2 ? 5 : 4)} Üç renkli koridor tek kaleye bakar; solda 1, ortada 2, sağda 3 ve kalede K bulunur. Her hücumcunun topu vardır.${age.level >= 2 ? " Kırmızı 4 şut bölgesinde sıradaki hücumcuyu karşılar." : " Savunmacı yoktur; kaleci her şuttan önce hazır olduğunu gösterir."} Koridorlar aynı anda kullanılmaz.`,
      steps: [
        "Kaleci hazır işareti verince 1 sol koridorda top sürerek üst uçtaki şut bölgesine yaklaşır ve dengeli biçimde kaleye vurur; mavi düz ok şut yönünü gösterir.",
        "1 şut sonrası yan sınırdan çıkar. Kaleci topu güvene alıp yeniden hazır olduğunda 2 orta koridordan, ardından 3 sağ koridordan aynı görevi yapar.",
        "Hücumcu kalecinin konumuna göre yakın veya uzak köşeyi seçer; savunmacı bulunan yaşlarda açık şut hattını kontrolle hazırlar.",
        "Gol 1 puandır; isabetli fakat kalecinin tuttuğu şut ayrıca isabet olarak sayılır. Üç koridordaki gol/isabet sayısını ayrı izleyerek açıları karşılaştır.",
        "Üç şuttan sonra hücumcular soldan ortaya, ortadan sağa, sağdan sola geçer. Savunmacıyı bir tur sonunda değiştir; kaleci rolünü yalnız bu rolü üstlenen uygun oyuncular arasında döndür. Toplar sıra bitince toplanır.",
      ],
      coachingPoints: [
        "Son dokunuş şut adımını hazırlasın; destek ayağı dengeli yerleşsin.",
        "Topa temas yüzeyini hedeflenen şutla eşleştir; her açıdan aynı vuruşu dayatma.",
        "Şut öncesi kaleciyi gör, başını son anda kaldırmak için dengeyi bozma.",
      ],
      progressions: ["Savunmacı koridorun üst ucundan aktif yaklaşır; hücumcu ilk açık şut hattını kullanır."],
      regressions: ["Şut mesafesini ve yaklaşma hızını azalt; koridorda savunmacı olmadan kontrollü vuruş yap."],
      equipmentItems: ["1 uygun boy kale", "En az 3 top", "Koridor konileri", "2 renk yelek"],
      rules: [
        [
          "U12: serbest temasla dengeli vuruş hedeflenir; kaleci hazır olmadan yeni top hareket etmez.",
          "U14: son iki dokunuşta kontrol ve şut hazırlanır; oyuncu kalecinin bıraktığı köşeyi seçer.",
          "U16: kırmızı 4 ilk dokunuştan sonra kontrollü aktif yaklaşır; üç koridorda da şut açısı aranır.",
          "U18: kırmızı 4 şut bölgesinden aktif yaklaşır; hücumcu baskı gelmeden bitiriş veya bir yön değişimi seçer.",
          "A Takım: kırmızı 4 koridor girişine göre şut açısını kapatır; hücumcu kalecinin ve rakibin konumuna göre erken şut ya da ek dokunuşu seçer.",
        ][age.level],
        "Aynı anda yalnız bir top canlıdır; top toplamak için şut yoluna girilmez. Oyuncular diğer koridoru kesmeden dıştan döner.",
      ],
    });
  },

  orta: (ctx) => {
    const { diagram: d, age } = ctx;
    d.goal(49, 14, 0, "large");
    d.keeper(49, 23, "K");
    d.zone(49, 34, 44, 25);
    d.line(73, 30, 73, 81);
    d.player(78, 78, 1);
    d.player(77, 55, 2);
    d.player(59, 65, 3);
    d.player(39, 61, 4);
    d.player(56, 51, 5);
    d.ball(81, 73);
    if (age.level >= 2) d.player(51, 36, 6, "away");
    d.pass(78, 71, 77, 61);
    d.pass(72, 56, 64, 62);
    d.pass(64, 58, 85, 35);
    d.run(85, 73, 86, 36);
    d.pass(82, 32, 44, 31);
    d.run(39, 55, 41, 32);
    d.run(58, 47, 58, 31);
    d.text(9, 16, "Kanat bağlantısı", 14);
    d.text(12, 83, "4: arka / 5: ön koşu", 13);
    return finish(d, {
      organization: `${group(ctx, age.level >= 2 ? 7 : 6)} Sağ çizgi dışındaki koridor kanat bölgesidir: 1 geride, 2 kanatta, 3 iç bağlantıda; 4 ve 5 ceza alanı önünde, K kalededir.${age.level >= 2 ? " Kırmızı 6 orta hedef alanını savunur." : " Hedef alanda savunmacı yoktur."} Tek top 1'de başlar; renkli alan orta ve bitiriş hedefidir.`,
      steps: [
        "1 kanattaki 2'ye pas verir ve çizgi dışından bindirir. 2 iç bağlantı 3'e geri bırakır; 3 pas öncesi bindiren 1'i görür.",
        "3 topu 1'in koşu yoluna yerden gönderir. 1 çizimde sağ üst köşeye yaklaşırken 4 arka, 5 ön hedefe farklı hatlardan koşar.",
        "1 başını kaldırıp uygun hedefe yerden orta veya geriye çıkarma yapar; çizimde 4'ün arka hedefi gösterilir. 4 ve 5 aynı noktaya koşmaz.",
        "Hedef alanda kontrol edilebilir orta 1, bunu izleyen gol ek 1 puandır. Kaleci veya savunmacı topu kazandığında tekrar biter; ikinci top gönderilmez.",
        "Her iki tekrarda 1→2→3→4→5→1 döndür; savunmacı varsa bir tur sonunda değiştir. Kaleci hazır olduktan sonra yeniden başla; sonraki tur aynı düzeni sol kanada aynala.",
      ],
      coachingPoints: [
        "Bindirme pasla eş zamanlı başlasın; kanat oyuncusuna çarpmayan dış hat kullanılsın.",
        "Orta öncesi hedef koşularını gör ve topu kalecinin kolay erişimine bırakmamaya çalış.",
        "Ön ve arka hedef koşuları farklı zamanda hızlansın; bitirişte oyuncular birbirinin hattını kapatmasın.",
      ],
      progressions: [
        "Kırmızı savunmacı ön veya arka hedefi seçerek kapatır; ortayı yapan oyuncu diğer hedefe ya da geriye çıkarmaya karar verir.",
      ],
      regressions: [
        "Kanat bağlantısını yavaş tempoda ve savunmasız yap; yalnız 4'e yerden orta ile başla, sonra 5'i ekle.",
      ],
      equipmentItems: ["1 uygun boy kale", "1 top ve yedek toplar", "Kanat ve hedef alanı konileri", "2 renk yelek"],
      rules: [
        [
          "U12: bağlantıda serbest temas, önceden belirlenen yerden orta ve sırayla bitiriş kullanılır; koşu zamanlaması keşfedilir.",
          "U14: bağlantıda üç temas hedeflenir; 1 ön ve arka hedef arasından boş olanı seçer.",
          "U16: kırmızı 6 hedef alanında kontrollü aktif savunur; kanat oyuncusu yerden orta ile geriye çıkarma arasında karar verir.",
          "U18: kırmızı 6 aktif savunur; bağlantıda iki temas hedeflenir, kayıpta 3 ilk çıkış pasını kapatır.",
          "A Takım: kırmızı 6 kaleciyle ön/arka alan paylaşır; 1 servis şeklini koşuya ve savunmaya göre seçer, kayıpta 3 ile yakın kanat oyuncusu ilk pası kapatır.",
        ][age.level],
        "Bu temel uygulamada ortalar yerden yapılır; kaleci ve hücumcunun aynı topa kontrolsüz girmesi halinde tekrar durdurulur. Hedef alan boşalmadan yeni atak başlamaz.",
      ],
    });
  },

  "baski-altinda-alma": (ctx) => {
    const { diagram: d, age } = ctx;
    d.zone(50, 48, 28, 30);
    d.player(50, 79, 1);
    d.player(50, 51, 2);
    d.player(50, 39, 3, "away");
    d.player(50, 18, 4);
    d.ball(54, 74);
    gate(d, 30, 42);
    gate(d, 70, 42);
    d.pass(50, 71, 50, 58);
    d.dribble(55, 53, 72, 41);
    d.pass(69, 35, 55, 21);
    d.run(55, 39, 63, 46);
    d.text(10, 16, "Sırtı dönük alıcı", 14);
    d.text(12, 86, "Önce tara, sonra dön", 13);
    return finish(d, {
      organization: `${group(ctx, 4)} Alt servisçi 1, renkli alanda sırtı hedefe dönük alıcı 2, onun arkasında kırmızı 3, üst hedefte 4 yer alır. Alanın sağ ve solunda dönüş kapısı vardır. Top 1'de başlar; 3'ün baskı zamanı yaş kuralında tanımlıdır.`,
      steps: [
        "2, pas gelmeden 3'ün hangi omuzda bulunduğunu ve iki kapıyı tarar. 1 yerden 2'nin erişebileceği ayağına servis yapar.",
        "2 top ile rakip arasına gövdesini koyar; boş omuz üzerinden kapıya döner. Çizimde sağ kapıdan kaçış ve üst hedef 4'e pas gösterilir.",
        "İki kapı da kapanmışsa 2 topu 1'e geri bırakabilir; 1 yeni açıdan tekrar servis eder. Körlemesine dönüş zorunlu değildir.",
        "Kapıdan kontrollü çıkıp 4'e isabetli pas 1 puandır. 3 topu kazanıp 1'e oynarsa savunmacı 1 puan alır; güvenli geri pas puansız devamdır.",
        "İki hücumdan sonra 1→2→3→4→1 değiştir. Hedef 4 topu yan sınırdan yeni servisçiye ulaştırır; yedek varsa servisçi rolünden içeri girer.",
      ],
      coachingPoints: [
        "Tarama, yalnız baş hareketi değil baskı yönünü tanıyıp kapı seçimiyle sonuçlansın.",
        "Dizleri hafif bükerek dengeli kal; kol ile itmeden gövdeyi top ile rakip arasına yerleştir.",
        "Dönüşe ilk temas karar versin; güvenli dönüş yoksa geri bağlantıyı koru.",
      ],
      progressions: [
        "Savunmacı servis öncesi omuz değiştirir; alıcı dönüş ile tek temas geri bırakma arasında karar verir.",
      ],
      regressions: ["Savunmacıyı bir omuzda pasif tut, pas hızını azalt ve kapıyı genişlet."],
      equipmentItems: ["1 top ve yedek toplar", "4 kapı konisi", "Alan konileri", "2 renk yelek"],
      rules: [
        [
          "U12: 3 önce bir omuzda pasif gölge olur; 2 boş kapıyı görerek döner, başarı sonrası kontrollü aktif baskı eklenir.",
          "U14: 3 pas çıktıktan sonra yürüyerek bir omuzu kapatır; 2 dönüş veya geri pası seçer.",
          "U16: 3 ilk kontrolle birlikte aktif baskıya başlar; 2 üç temas içinde dönüş ya da geri bağlantı arar.",
          "U18: 3 servisle birlikte aktif olur; kazanırsa ilk pasını 1'e atar, 2 kayıp sonrası bu hattı kapatır.",
          "A Takım: 3 servis öncesi baskı omzunu değiştirip bir çıkışa yönlendirir; 2 tek temas bağlantı veya dönüşü hedef 4'ün hattına göre seçer.",
        ][age.level],
        "Tutma, çekme ve arkadan itme yoktur; savunma topa yönelir. Her top kaybı veya hedef pasıyla tekrar tamamlanır.",
      ],
    });
  },

  "zayif-ayak": (ctx) => {
    const { diagram: d, age } = ctx;
    d.player(23, 76, 1);
    d.player(23, 33, 2);
    d.player(72, 43, 3);
    d.ball(27, 71);
    d.goal(79, 17, 0, "small");
    gate(d, 39, 33);
    d.cone(51, 27);
    d.cone(57, 39);
    d.cone(64, 27);
    if (age.level >= 3) d.player(64, 52, 4, "away");
    d.pass(23, 68, 23, 40);
    d.dribble(29, 33, 45, 33);
    d.dribble(45, 33, 65, 36);
    d.pass(66, 38, 68, 41);
    d.pass(74, 36, 79, 21);
    d.run(71, 52, 62, 77);
    d.run(57, 79, 31, 79);
    d.text(9, 16, "Kontrol → sürme → vuruş", 13);
    d.text(31, 87, "Dıştan başlangıca dön", 12);
    return finish(d, {
      organization: `${group(ctx, age.level >= 3 ? 4 : 3)} Üç istasyonlu açık devre kur: 1 altta servis, 2 sol üstte kontrol, 3 sağda mini kaleye bitiriş noktasıdır. 2'nin önünde kontrol kapısı ve üç yön değiştirme konisi vardır.${age.level >= 3 ? " Kırmızı 4, son pas ve bitirişi yaş kuralına göre savunur." : " Temel tur savunmasızdır."} Her oyuncu tercih etmediği ayağını kendisi belirtir; bir top 1'de başlar.`,
      steps: [
        "1 tercih etmediği ayakla 2'ye yerden pas verir; 2 kendi tercih etmediği ayağını kullanarak topu sağındaki kontrol kapısından geçirir.",
        "2 üç koninin arasından dönüşümlü yön değiştirerek ilerler; kontrolünü koruduktan sonra 3'e tercih etmediği ayakla pas verir.",
        "3 topu mini kale yönüne hazırlar ve tercih etmediği ayakla vuruş yapar. Çizimde mavi düz son ok kaleye vuruştur; kırmızı varsa son pasla birlikte devreye girer.",
        "Kontrol kapısı ve slalom kayıpsız tamamlanırsa 1 puan, mini kaleye gol olursa ek 1 puan ver. Ayak seçimini koruyamayan denemede ilgili istasyon puanı verilmez, tekrar sakin tempoda sürdürülür.",
        "Top kaleden alındıktan sonra 1, 2'nin başlangıcına; 2, 3'ün noktasına geçer; 3 alt dış dönüş yolundan 1'e gelir. Yeni top ancak devre boşaldığında başlar; kırmızı varsa her üç turda değişir.",
      ],
      coachingPoints: [
        "Destek ayağını hedefe göre yerleştir ve vuruş yüzeyini sabit tut.",
        "Tercih edilmeyen ayakta isabet için yaklaşma hızını gerektiğinde düşür.",
        "Kontrolü topun altına uzanarak değil dengeli bir sonraki adıma hazırlayarak yap.",
      ],
      progressions: ["Son pasın geliş açısını değiştir; uygun seviyede kırmızı 4 son pası veya şutu aktif kapatır."],
      regressions: ["Koniler arası mesafeyi aç, kontrol için ek temas ver ve şut mesafesini kısalt."],
      equipmentItems: ["1 mini kale", "1 top ve yedek toplar", "5 istasyon konisi", "2 renk yelek"],
      rules: [
        [
          "U12: serbest temasla düşük tempoda devre tamamlanır; her istasyonda tercih edilmeyen ayak kullanımı ayrı gözlenir.",
          "U14: ilk kontrolü kapı yönüne yap; slalomda iç/dış yüzey seçimini oyuncu belirler.",
          "U16: 3 bitirişten önce en çok iki hazırlık teması kullanır; son pasın geliş açısı her tur değiştirilir.",
          "U18: kırmızı 4 son pas çıktıktan sonra kontrollü aktif yaklaşır; 3 iki temas içinde kontrol ve vuruş arar.",
          "A Takım: kırmızı 4 son pasla birlikte aktif savunur; 3 tercih edilmeyen ayakla erken vuruş veya baskıdan uzak kontrol arasında karar verir.",
        ][age.level],
        "Devreyi hız yarışı yapma; farklı oyuncuların tercih etmediği ayak farklı olabilir. Tek canlı top kullanılır ve dönüş yolu slalom/şut hattının dışındadır.",
      ],
    });
  },

  kombinasyon: (ctx) => {
    const { diagram: d, age } = ctx;
    d.player(50, 79, 1);
    d.player(50, 47, 2);
    d.player(24, 29, 3);
    d.player(78, 24, 4);
    d.player(57, 36, 5, "away");
    d.ball(54, 73);
    gate(d, 69, 29);
    d.line(50, 70, 50, 56);
    d.line(50, 41, 28, 25);
    d.line(50, 41, 75, 25);
    d.pass(50, 71, 50, 54);
    d.pass(45, 43, 29, 32);
    d.pass(30, 29, 69, 29);
    d.run(53, 46, 69, 28);
    d.pass(72, 27, 75, 25);
    d.text(9, 16, "Üçüncü oyuncu Y akışı", 14);
    d.text(12, 87, "1 → 2 → 3 → koşan 2", 13);
    return finish(d, {
      organization: `${group(ctx, 5)} Y biçiminde 1 alt servisçi, 2 merkez duvar oyuncusu, 3 sol destek, 4 sağ üst hedef olur. Kırmızı 5 merkez ile hedef arasındadır. Sağ koldaki koni kapısı 2'nin üçüncü oyuncu koşusunu hedefler. Tek top 1'de başlar; kırmızının rolü yaşa göre değişir.`,
      steps: [
        "1 merkeze 2'ye pas verir. 2 yüzünü servisçiye dönük tutarak sol destekteki 3'e bırakır; 3 top çıkmadan pas açısı oluşturur.",
        "2 pasından hemen sonra kırmızı 5'in sağından kapıya doğru koşar. 3 topu koşan 2'nin önüne, kapının arasından gönderir; çizimde üçüncü oyuncu koşusu turuncudur.",
        "2 ileride topu alıp hedef 4'e pas vererek kombinasyonu tamamlar. Kapı kapanmışsa yaş kuralına göre 3 topu 1'e geri bağlayıp yeni tekrar kurar.",
        "1→2→3→koşan 2→4 dizisi kayıpsız tamamlanırsa 1 puan ver. Kırmızı pası kesip 1'e oynarsa savunmacı 1 puan kazanır.",
        "İki tekrarda 1→2→3→4→5→1 rotasyonu yap; 4 topu dış sınırdan yeni servisçiye döndürür. Sonraki tur düzeni sola aynala, yedekleri 1 noktasından içeri al.",
      ],
      coachingPoints: [
        "Duvar pasını 3'ün ileri görüşünü koruyacağı ayağına bırak.",
        "2'nin koşusu pasından sonra hızlansın; top beklemek için kapıda durmasın.",
        "3 başını kaldırıp koşu yoluna pas versin; sabit oyuncunun mevcut ayağını hedeflemesin.",
      ],
      progressions: [
        "Kırmızı 5 pas hattını aktif kapatsın; 3 koşu pası ile 1'e güvenli bağlantı arasında seçim yapsın.",
      ],
      regressions: ["Kırmızıyı pasif tut, 2'ye kontrol ederek bırakma hakkı ver ve koşuyu antrenör işaretiyle başlat."],
      equipmentItems: ["1 top ve yedek toplar", "Y noktası konileri", "2 hedef kapısı konisi", "2 renk yelek"],
      rules: [
        [
          "U12: kırmızı 5 pasif yer tutar; 2 ve 3 serbest temasla önceden anlatılan sağ koşuyu uygular.",
          "U14: kırmızı 5 kapıya yürüyerek yaklaşır; 3 koşu pasının zamanını seçer, kapı kapalıysa 1'e döner.",
          "U16: kırmızı 5, 2 topu 3'e bıraktığında aktif savunur; 3 iki/üç temasta koşu pası ya da geri bağlantı seçer.",
          "U18: kırmızı 5 ilk servisle birlikte aktif olur; 2 uygun pası tek temas bırakır, 3 baskıya göre koşu pası veya geri bağlantı kullanır.",
          "A Takım: kırmızı 5 merkez dönüşünü ve koşu hattını yönlendirmeye çalışır; 2 ile 3 tek/iki temas seçimini baskıya göre yapar, kayıpta hedefe ilk pası kapatır.",
        ][age.level],
        "Üçüncü oyuncu pası, 2 kapıdan hareket halinde geçerken önüne verilir; top veya oyuncu geçişi kapanırsa çarpışmak yerine geri bağlantıyla tekrar kurulur.",
      ],
    });
  },
};
