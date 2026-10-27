import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { boardSvg, parseDrillContentBody } from "./drill-diagrams/application-validation.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const { format } = createRequire(resolve(root, "package.json"))("prettier");
const folder = resolve(root, "apps/frontend/qa/drill-diagrams-2026-10-27");
const pack = JSON.parse(readFileSync(resolve(root, "content/drills/ngcs-starter-diagrams-v2.json"), "utf8"));
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]
  );
const phaseNames = { WARM_UP: "Isınma", TECHNICAL: "Teknik", TACTICAL: "Taktik", COOL_DOWN: "Soğuma" };
mkdirSync(resolve(folder, "svg"), { recursive: true });
const cards = pack.items.map((item) => {
  parseDrillContentBody(item);
  const svg = boardSvg(item.boardDocument);
  const filename = `${item.drillId}.svg`;
  writeFileSync(resolve(folder, "svg", filename), svg);
  const primary = item.ageVariants[0];
  return `<article data-age="${escape(primary.ageGroup)}" data-phase="${escape(item.category)}" data-title="${escape(item.title.toLocaleLowerCase("tr-TR"))}">
  <header><span>${phaseNames[item.category]}</span><span class="draft">Kaynak taslağı</span><h2>${escape(item.title)}</h2><p>${primary.durationMin} dk · ${primary.playerMin}–${primary.playerMax} oyuncu · ${primary.areaLengthM}×${primary.areaWidthM} m</p></header>
  <a class="drawing" href="svg/${filename}" target="_blank" rel="noopener" aria-label="${escape(item.title)} çizimini büyük aç">${svg.replace("<svg ", `<svg role="img" aria-label="${escape(item.title)} saha organizasyonu" `)}</a>
  <p class="objective">${escape(item.objectiveLabel)}</p>
  <details><summary>Organizasyon ve uygulama</summary><p>${escape(item.organization)}</p><ol>${item.steps.map((step) => `<li>${escape(step)}</li>`).join("")}</ol><h3>Koçluk noktaları</h3><ul>${item.coachingPoints.map((step) => `<li>${escape(step)}</li>`).join("")}</ul><h3>Yaş kuralları</h3><ul>${primary.rules.map((rule) => `<li>${escape(rule)}</li>`).join("")}</ul><p>Ekipman: ${escape(item.equipmentItems.join(", "))}</p></details>
  <footer><a href="svg/${filename}" download>SVG indir</a><button type="button" data-png="svg/${filename}" data-name="${escape(item.drillId)}">PNG indir</button><span>${item.boardDocument.elements.length} eleman</span></footer></article>`;
});
writeFileSync(
  resolve(folder, "index.html"),
  `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>NGCS · Çalışmaya özgü çizimler v2</title><style>
*{box-sizing:border-box}body{margin:0;background:#edf2f7;color:#142c46;font:15px/1.55 system-ui,sans-serif}main{max-width:1600px;margin:auto;padding:24px}h1{font-size:28px;margin:8px 0}h2{font-size:18px;line-height:1.35;margin:10px 0}h3{font-size:15px}p{margin:8px 0}.intro{background:#102b46;color:#fff;padding:24px;border-radius:16px}.intro p{max-width:980px}.toolbar{display:flex;flex-wrap:wrap;gap:12px;align-items:end;margin:20px 0}label{display:grid;gap:4px}select,input,button,summary,footer a{min-height:44px;font:inherit;border-radius:8px}select,input{padding:8px;border:1px solid #bccbd9}input{max-width:100%;width:320px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,460px),1fr));gap:20px;align-items:start}article{background:#fff;border:1px solid #d5dfe9;border-radius:12px;overflow:hidden}article[hidden]{display:none}article header,.objective,details,footer{padding:14px 18px}header span{font-size:12px;border-radius:20px;background:#e6f0ff;padding:4px 8px}.draft{float:right;background:#fff2c5}.drawing{display:block;background:#124b36;padding:8px}.drawing svg{display:block;width:100%;height:auto}details{border-top:1px solid #e2e8f0}summary{cursor:pointer;font-weight:650;padding:8px 0}li{margin:7px 0}footer{display:flex;align-items:center;gap:12px;flex-wrap:wrap;border-top:1px solid #e2e8f0}footer a,button{display:inline-flex;align-items:center;padding:8px 14px;background:#086fc5;color:#fff;border:0;text-decoration:none;cursor:pointer}footer span{margin-left:auto;color:#5e7185;font-size:13px}:focus-visible{outline:3px solid #f59e0b;outline-offset:3px}#count{margin-left:auto;font-weight:650}#download-status{min-height:24px} @media(max-width:600px){main{padding:12px}.intro{padding:16px}h1{font-size:23px}.toolbar label{width:100%}.toolbar input{width:100%}#count{margin:0}.draft{float:none;margin-left:8px}}@media print{.toolbar,footer,.intro p{display:none}.grid{grid-template-columns:1fr 1fr}article{break-inside:avoid}}
</style></head><body><main><section class="intro"><p>NGCS · BL-077</p><h1>Her çalışma için kendi saha organizasyonu</h1><p>24 temel organizasyon · 5 yaş grubu · 120 çalışmaya özgü çizim. Çizimler ortak taktik tahta SVG kaynağıyla üretilmiştir. Eski yayımlı içerikler ve plan kopyaları korunur. Kaynak dosyası DRAFT olarak korunur; sportif onay ve yayın durumu ilgili ADR ve veritabanında izlenir.</p><p>Şema tek örnek çalışma grubunu gösterir; toplam oyuncular dönüşümlü veya uygun alanda paralel gruplarda çalışır. Çizime tıklayarak büyütün.</p></section>
<section class="toolbar" aria-label="Çizim filtreleri"><label>Yaş grubu<select id="age"><option value="SENIOR">A Takım</option><option>U18</option><option>U16</option><option>U14</option><option>U12</option><option value="">Tüm yaşlar</option></select></label><label>Faz<select id="phase"><option value="">Tüm fazlar</option>${Object.entries(
    phaseNames
  )
    .map(([value, label]) => `<option value="${value}">${label}</option>`)
    .join(
      ""
    )}</select></label><label>Çalışma ara<input id="search" type="search" placeholder="Örn. pres, pas, bitiricilik"></label><output id="count" aria-live="polite"></output></section><p id="download-status" role="status"></p><section class="grid" aria-label="Çalışma çizimleri">${cards.join("\n")}</section></main>
<script>
const age=document.querySelector('#age'),phase=document.querySelector('#phase'),search=document.querySelector('#search'),cards=[...document.querySelectorAll('article')];
function filter(){let visible=0;for(const card of cards){card.hidden=!!((age.value&&card.dataset.age!==age.value)||(phase.value&&card.dataset.phase!==phase.value)||(search.value&&!card.dataset.title.includes(search.value.toLocaleLowerCase('tr-TR'))));if(!card.hidden)visible++;}document.querySelector('#count').textContent=visible+' çizim';}for(const field of [age,phase,search])field.addEventListener('input',filter);filter();
for(const button of document.querySelectorAll('[data-png]'))button.addEventListener('click',async()=>{button.disabled=true;const status=document.querySelector('#download-status');try{const image=new Image();image.src=button.dataset.png;await image.decode();const canvas=document.createElement('canvas');canvas.width=1500;canvas.height=1100;canvas.getContext('2d').drawImage(image,0,0,1500,1100);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('PNG oluşturulamadı');const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download=button.dataset.name+'.png';document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);status.textContent='PNG hazır: '+button.dataset.name;}catch(error){status.textContent=error.message||'İndirme başarısız';}finally{button.disabled=false;}});
</script></body></html>\n`
);
const galleryPath = resolve(folder, "index.html");
writeFileSync(
  galleryPath,
  await format(readFileSync(galleryPath, "utf8"), {
    parser: "html",
    singleQuote: true,
    trailingComma: "all",
    endOfLine: "lf",
  })
);
process.stdout.write(`Rendered ${pack.count} SVG diagrams and review gallery\n`);
