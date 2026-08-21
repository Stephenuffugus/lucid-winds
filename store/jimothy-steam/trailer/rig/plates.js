/* The frame furniture: everything in the 1920x1080 picture that is NOT the
   game. Built once, in the browser (so it uses the same Fredoka and the same
   blurred-city treatment as the shipped screenshots), then composited onto the
   frame sequences by ffmpeg — 1380 frames through a browser compositor would
   cost twenty minutes for a picture that never changes.

   Layers, bottom to top:
     plate.png     opaque  blurred city + vignette + gold glow + the slot shadow
     slotline.png  RGBA    the gold hairline around the game frame, drawn ON TOP
                           so the frame's own edge sits under it
     cap_NN.png    RGBA    one caption, left panel only, faded in by ffmpeg

   ⛔ The game frame is 588x1044 at x=666,y=18: 540x960 is 9:16 and 1044 tall
   keeps it at true aspect. Nothing here may scale it to fill 16:9 — a stretched
   portrait frame is the cheapest looking thing on a store page (4.3's DON'Ts). */
const L=require('./lib.js');
const OUT=__dirname+'/../plates';
L.fs.mkdirSync(OUT,{recursive:true});

const W=1920,H=1080, GW=588, GH=1044, GX=Math.round((W-GW)/2), GY=Math.round((H-GH)/2);

/* Captions, verbatim from STORE_PAGE_FILL.md Part 4.3. ⛔ no dashes in copy. */
const CAPS=[
 /* line breaks are authored, not left to wrapping: a 60px caption in a 526px
    box breaks where the box runs out, which put "TRAIL" alone on a third line. */
 {id:'c01', t:"SEATTLE'S\nROUNDEST RACCOON"},
 {id:'c02', t:'TEN CHAPTERS'},
 {id:'c03', t:'EVERY CLEAN HOP\nGROWS THE TRAIL'},
 {id:'c04', t:'ONE BAD HOP\nTAKES IT ALL'},
 {id:'c05', t:'EVERY TENTH LEVEL\nIS A SET PIECE'},
 {id:'c06', t:'NINE POWER UPS'},
 {id:'c07a',t:'100 LEVELS'},
 {id:'c07b',t:'AND IT DOES NOT\nSTOP THERE'},
 {id:'c08', t:'45 TO PLAY AS'},
 {id:'c09', t:'ONE COURSE A DAY,\nTHE SAME ROAD FOR EVERYONE'},
 {id:'c10', t:'THE GREATEST\nDUMPSTER FEAST IN TOWN'},
];

const bgUrl=L.BASE+'/satellites/stream-hop/assets/bg/zone-skyline.jpg';
const head=`<link href="${L.BASE}/store/jimothy-steam/fonts/fonts.css" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}
 html,body{width:${W}px;height:${H}px;overflow:hidden}</style>`;

function platePage(){ return `<!doctype html><html><head><meta charset="utf-8">${head}<style>
 body{background:#06090a}
 .bg{position:absolute;inset:-60px;background:url('${bgUrl}') center 30%/cover no-repeat;
     filter:blur(20px) brightness(.66) saturate(1.34) sepia(.16) hue-rotate(-8deg)}
 /* a warm wash ties the cold skyline to the amber of the game frame */
 .warm{position:absolute;inset:0;background:
   radial-gradient(70% 80% at 50% 52%, rgba(158,104,38,.30) 0%, rgba(120,70,26,.10) 55%, rgba(0,0,0,0) 78%);
   mix-blend-mode:soft-light}
 .fade{position:absolute;inset:0;background:
   radial-gradient(74% 92% at 50% 50%, rgba(0,0,0,0) 0%, rgba(7,9,6,.62) 100%)}
 .glow{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
   width:1000px;height:1080px;border-radius:50%;
   background:radial-gradient(50% 50% at 50% 50%, rgba(224,176,80,.30) 0%, rgba(214,168,74,0) 72%)}
 /* the slot: only its shadow, because the game frame lands on top of it */
 .slot{position:absolute;left:${GX}px;top:${GY}px;width:${GW}px;height:${GH}px;border-radius:10px;
   background:#040605;box-shadow:0 26px 90px rgba(0,0,0,.85), 0 0 60px rgba(0,0,0,.6)}
</style></head><body>
 <div class="bg"></div><div class="warm"></div><div class="fade"></div><div class="glow"></div><div class="slot"></div>
</body></html>`; }

function slotPage(){ return `<!doctype html><html><head><meta charset="utf-8">${head}<style>
 body{background:transparent}
 .line{position:absolute;left:${GX}px;top:${GY}px;width:${GW}px;height:${GH}px;border-radius:10px;
   box-shadow:0 0 0 1px rgba(200,168,75,.34) inset, 0 0 0 1px rgba(200,168,75,.34)}
</style></head><body><div class="line"></div></body></html>`; }

function capPage(text){
 const lines=text.split('\n').map(s=>`<div>${s}</div>`).join('');
 return `<!doctype html><html><head><meta charset="utf-8">${head}<style>
 body{background:transparent}
 .wrap{position:absolute;left:78px;top:50%;transform:translateY(-50%);width:${GX-140}px}
 .rule{width:104px;height:5px;border-radius:3px;margin:0 0 30px 4px;
   background:linear-gradient(90deg,#c8a84b,rgba(200,168,75,.12))}
 .cap{font-family:'Fredoka','Nunito',system-ui,sans-serif;font-weight:600;
   font-size:60px;line-height:1.14;letter-spacing:.6px;color:#e8dcc8;text-transform:uppercase;
   text-shadow:0 3px 0 rgba(8,12,7,.9), 0 4px 26px rgba(0,0,0,.95)}
</style></head><body><div class="wrap"><div class="rule"></div><div class="cap">${lines}</div></div></body></html>`; }

(async()=>{
 const srv=await L.serve(L.PORT+1);
 const b=await L.puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox','--disable-gpu']});
 const shoot=async(html,file,transparent)=>{
  const p=await b.newPage();
  const missing=[];
  p.on('requestfailed',r=>{ const t=(r.failure()||{}).errorText||''; if(t!=='net::ERR_ABORTED') missing.push(r.url()+' '+t); });
  p.on('response',r=>{ if(r.status()>=400) missing.push(r.url()+' HTTP '+r.status()); });
  await p.setViewport({width:W,height:H,deviceScaleFactor:1});
  await p.setContent(html.split(L.BASE).join('http://localhost:'+(L.PORT+1)),{waitUntil:'networkidle0',timeout:60000});
  await p.evaluate(()=>document.fonts?document.fonts.ready:0);
  await L.sleep(500);
  /* ⛔ fail LOUDLY on a missing asset: the capsule builder once shipped black
     wordmark-only art because every image 404'd and networkidle0 was happy. */
  if(missing.length){ console.error('  '+file+': MISSING ASSETS, not writing:'); missing.forEach(u=>console.error('    '+u)); await p.close(); return false; }
  await p.screenshot({path:OUT+'/'+file, omitBackground:!!transparent});
  await p.close(); console.log('  wrote '+file); return true;
 };
 await shoot(platePage(),'plate.png',false);
 await shoot(slotPage(),'slotline.png',true);
 for(const c of CAPS) await shoot(capPage(c.t), c.id+'.png', true);
 L.fs.writeFileSync(OUT+'/_geometry.json', JSON.stringify({W,H,GW,GH,GX,GY},null,1));
 await b.close(); srv.close();
})();
