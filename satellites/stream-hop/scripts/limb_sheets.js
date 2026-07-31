/* Batched limb-review sheets — 8 characters per image, the four poses that expose
   limbs most (cheer, leap, dash-run, run-r). Six images you can flick through on a
   phone in two minutes, instead of scrolling 856 frames.
   Run from the repo root:  node satellites/stream-hop/scripts/limb_sheets.js
   Output: satellites/stream-hop/art-sheets/limb-review/ */
const fs=require('fs'), path=require('path');
const puppeteer=require(path.join(__dirname,'../../../node_modules/puppeteer'));
const ROOT=path.join(__dirname,'../../..');
const OUT=path.join(ROOT,'satellites/stream-hop/art-sheets/limb-review');
const POSES=['cheer','leap','dash-run','run-r'];   // arms and legs are furthest from the body here
const PER=8;
fs.mkdirSync(OUT,{recursive:true});

const src=fs.readFileSync(path.join(ROOT,'satellites/stream-hop/index.html'),'utf8');
const seg=src.slice(src.indexOf('var CHARS='), src.indexOf('var FINISHES='));
const chars=[...seg.matchAll(/\{id:'([a-z0-9_]+)',\s*name:'([^']*)',\s*rar:'([a-z]+)'([^}]*)\}/g)]
  .map(m=>({id:m[1],name:m[2],sheet:(m[4].match(/sheet:'([^']+)'/)||[])[1]}))
  .filter(c=>c.sheet);

(async()=>{
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox']});
 let n=0;
 for(let i=0;i<chars.length;i+=PER){
  n++;
  const rows=chars.slice(i,i+PER).map(c=>{
    const cells=POSES.map(p=>{
      const f=path.join(ROOT,'satellites/stream-hop/assets',c.sheet,p+'.png');
      return fs.existsSync(f)
        ? `<figure><img src="file://${f}"><figcaption>${p}</figcaption></figure>`
        : `<figure class="none"><div class="x">no ${p}</div></figure>`;
    }).join('');
    return `<div class="row"><div class="nm">${c.name}<br><span>${c.id}</span></div>${cells}</div>`;
  }).join('');
  const html=`<!doctype html><meta charset="utf-8"><style>
   body{background:#141810;color:#e8dcc8;font:13px system-ui;margin:0;padding:10px}
   .row{display:flex;align-items:center;gap:8px;border-bottom:1px solid #262f1d;padding:6px 0}
   .nm{width:150px;font-weight:700;flex:none}.nm span{font:10px ui-monospace;color:#8a9178;font-weight:400}
   figure{margin:0;width:190px;height:190px;background:#0b0f0b;border:1px solid #2a331f;border-radius:6px;
     display:flex;flex-direction:column;align-items:center;justify-content:center;flex:none}
   figure.none{background:#2a1414;border-color:#5a2a2a}.x{color:#e89a9a;font-size:11px}
   img{max-width:180px;max-height:160px;object-fit:contain}
   figcaption{font:10px ui-monospace;color:#8a9178}</style>${rows}`;
  const p=await b.newPage();
  await p.setViewport({width:1000,height:1650});
  await p.setContent(html,{waitUntil:'networkidle0',timeout:60000});
  await new Promise(r=>setTimeout(r,900));
  await p.screenshot({path:path.join(OUT,'limb-review-'+n+'.png'),fullPage:true});
  await p.close();
  console.log('  wrote limb-review-'+n+'.png');
 }
 await b.close();
 console.log(chars.length+' characters across '+n+' sheets');
})();
