/* library_logo — 1280x720 TRANSPARENT PNG.
   Steam lays this over the library_hero banner, so it must stay readable on top of
   a busy, unpredictable image. That is why it carries a heavy dark stroke and a
   deep shadow rather than just coloured type: over a bright patch of sky, plain
   sage green on transparency disappears.
   ⛔ Transparency comes from omitBackground:true AND no background on the element.
   Run:  node store/jimothy-steam/capsules/logo.js     (static server on :8942) */
const puppeteer=require('/workspaces/lucid-winds/node_modules/puppeteer');
const fs=require('fs');
const BASE='http://localhost:8942';
const OUT=__dirname+'/out'; fs.mkdirSync(OUT,{recursive:true});

function page(withRoon){
 const roon=BASE+'/satellites/stream-hop/assets/hero/idle.png';
 return `<!doctype html><html><head><meta charset="utf-8">
 <link href="${BASE}/store/jimothy-steam/fonts/fonts.css" rel="stylesheet">
 <style>
 *{margin:0;padding:0;box-sizing:border-box}
 html,body{width:1280px;height:720px;background:transparent}
 .wrap{width:1280px;height:720px;display:flex;align-items:center;justify-content:center;gap:38px}
 .type{text-align:${withRoon?'left':'center'};font-family:'Fredoka','Nunito',system-ui,sans-serif;line-height:.92}
 /* the stroke is what keeps this legible over a bright hero; the stacked shadows
    fake a soft outer glow that survives Steam's own scaling */
 .l1{font-size:74px;font-weight:700;letter-spacing:13px;color:#e2bf5a;text-transform:uppercase;
     -webkit-text-stroke:7px #0d1408;paint-order:stroke fill;
     text-shadow:0 6px 0 #0d1408, 0 0 26px rgba(0,0,0,.95), 0 0 60px rgba(0,0,0,.7)}
 .l2{font-size:196px;font-weight:800;color:#93d167;letter-spacing:2px;margin-top:6px;line-height:1.06;padding-bottom:10px;
     -webkit-text-stroke:14px #0d1408;paint-order:stroke fill;
     text-shadow:0 12px 0 #0d1408, 0 0 44px rgba(122,179,86,.45), 0 0 90px rgba(0,0,0,.8)}
 .l3{margin-top:34px;font-family:'Nunito',system-ui,sans-serif;font-weight:800;font-size:44px;
     letter-spacing:5px;color:#e8dcc8;text-transform:uppercase;
     -webkit-text-stroke:6px #0d1408;paint-order:stroke fill;
     text-shadow:0 5px 0 #0d1408, 0 0 30px rgba(0,0,0,.9)}
 img.roon{height:430px;filter:drop-shadow(0 10px 26px rgba(0,0,0,.85)) drop-shadow(0 0 3px #0d1408)}
 </style></head><body><div class="wrap">
   ${withRoon?`<img class="roon" src="${roon}">`:''}
   <div class="type">
     <div class="l1">Jumping</div>
     <div class="l2">Jimothy</div>
     <div class="l3">The Little Nugget</div>
   </div>
 </div></body></html>`;
}

(async()=>{
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox']});
 for(const [name,withRoon] of [['library_logo_1280x720',false],['library_logo_1280x720_with-jimothy',true]]){
  const p=await b.newPage();
  await p.setViewport({width:1280,height:720,deviceScaleFactor:1});
  await p.setContent(page(withRoon),{waitUntil:'networkidle0',timeout:60000});
  await new Promise(r=>setTimeout(r,900));
  await p.screenshot({path:`${OUT}/${name}.png`, omitBackground:true});
  console.log('  wrote '+name+'.png');
  await p.close();
 }
 await b.close();
})();
