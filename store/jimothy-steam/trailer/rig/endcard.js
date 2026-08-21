/* Beats 11 and 12: the wordmark on the rainy city, Jimothy walks in and sits,
   then the lockup holds with the differentiator line under it. This is the one
   part of the trailer that is composed rather than captured, so it is built at
   the full 1920x1080 and drops into the cut without the plate.

   Everything is driven by an explicit frame index through __setFrame(f) — no
   CSS animations, no rAF, no wall clock — so the shot is reproducible and a
   re-run is identical to the last one, same as every gameplay beat.

   ⛔ The wordmark here is the SHIPPED one from capsules/build.js, deliberately.
   Stephen is choosing a new one from the explorations in capsules/wordmark_
   options/; when he picks, re-run this with that treatment and recut the tail.
   Guessing his answer into the trailer would just have to be undone. */
const L=require('./lib.js');
const OUT=__dirname+'/../frames/b11_endcard';
L.fs.mkdirSync(OUT,{recursive:true});
const W=1920,H=1080,N=210,FPS=30;
const PORT=L.PORT+2, BASE='http://localhost:'+PORT;

const page=()=>`<!doctype html><html><head><meta charset="utf-8">
<link href="${BASE}/store/jimothy-steam/fonts/fonts.css" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:#06090a}
.bg{position:absolute;inset:-40px;background:url('${BASE}/satellites/stream-hop/assets/bg/zone-skyline.jpg') center 34%/cover no-repeat;
    filter:blur(9px) brightness(.52) saturate(1.3) sepia(.14)}
.warm{position:absolute;inset:0;mix-blend-mode:soft-light;background:
  radial-gradient(64% 74% at 50% 46%, rgba(158,104,38,.34) 0%, rgba(0,0,0,0) 76%)}
.vig{position:absolute;inset:0;background:
  radial-gradient(78% 96% at 50% 46%, rgba(0,0,0,0) 0%, rgba(5,8,5,.72) 100%),
  linear-gradient(180deg, rgba(5,8,5,.55) 0%, rgba(0,0,0,0) 26%, rgba(0,0,0,0) 62%, rgba(5,8,5,.82) 100%)}
#rain{position:absolute;inset:0}
.ground{position:absolute;left:0;right:0;bottom:100px;height:2px;
  background:linear-gradient(90deg,rgba(0,0,0,0),rgba(200,168,75,.14) 30%,rgba(200,168,75,.14) 70%,rgba(0,0,0,0))}
.type{position:absolute;left:0;right:0;top:186px;text-align:center;
  font-family:'Fredoka','Nunito',system-ui,sans-serif;line-height:.96}
.l1{font-size:66px;font-weight:700;letter-spacing:13px;color:#c8a84b;text-transform:uppercase;
    text-shadow:0 3px 0 #14200f,0 3px 18px rgba(0,0,0,.9)}
.l2{font-size:172px;font-weight:800;color:#8ec964;letter-spacing:2px;margin-top:6px;
    text-shadow:0 10px 0 #14200f, 0 0 86px rgba(122,179,86,.42), 0 4px 22px rgba(0,0,0,.92)}
/* ⛔ anchor by HEIGHT, not width: idle is 216x247, sit is 186x261 and run-r is
   262x198, so one fixed width made him change size and float off the ground
   every time the pose swapped. Height plus a per pose scale keeps his feet on
   the same line and his head clear of the copy. */
.roon{position:absolute;bottom:104px;width:auto;
  filter:drop-shadow(0 22px 26px rgba(0,0,0,.8))}
.lines{position:absolute;left:0;right:0;top:462px;text-align:center;
  font-family:'Fredoka','Nunito',system-ui,sans-serif;font-weight:600;font-size:52px;
  letter-spacing:1px;color:#e8dcc8;text-transform:uppercase;line-height:1.32;
  text-shadow:0 3px 0 rgba(8,12,7,.9), 0 4px 24px rgba(0,0,0,.95)}
.lines div{opacity:0}
.small{position:absolute;left:0;right:0;top:486px;text-align:center;opacity:0;
  font-family:'Fredoka','Nunito',system-ui,sans-serif;font-weight:600;font-size:46px;
  letter-spacing:2.4px;color:#c8a84b;text-transform:uppercase;
  text-shadow:0 3px 0 rgba(8,12,7,.9), 0 4px 24px rgba(0,0,0,.95)}
.fade{position:absolute;inset:0;background:#05070a;opacity:0;pointer-events:none}
</style></head><body>
<div class="bg"></div><div class="warm"></div><canvas id="rain" width="${W}" height="${H}"></canvas>
<div class="vig"></div><div class="ground"></div>
<div class="type"><div class="l1">Jumping</div><div class="l2">Jimothy</div></div>
<img class="roon" id="roon" src="${BASE}/satellites/stream-hop/assets/hero/idle.png">
<div class="lines"><div id="ln1">A run takes two minutes.</div><div id="ln2">The feast takes a lifetime.</div></div>
<div class="small" id="sml">No account. No internet. Nothing else to buy.</div>
<div class="fade" id="fade"></div>
<script>
var BASE='${BASE}', N=${N};
/* seeded rain so every run draws the same storm */
var seed=20260821; function rnd(){ seed=(seed*1664525+1013904223)>>>0; return seed/4294967296; }
var DROPS=[]; for(var i=0;i<230;i++) DROPS.push({x:rnd()*${W}, y:rnd()*${H}, len:18+rnd()*34, sp:560+rnd()*660, a:.14+rnd()*.26});
var cv=document.getElementById('rain'), cx=cv.getContext('2d');
var POSE=['run-r','run-r2','run-l','run-r2'];
function img(n){ return BASE+'/satellites/stream-hop/assets/hero/'+n+'.png'; }
function ease(t){ t=Math.max(0,Math.min(1,t)); return t*t*(3-2*t); }
window.__setFrame=function(f){
  var t=f/${FPS};
  /* rain */
  cx.clearRect(0,0,${W},${H}); cx.lineCap='round';
  for(var i=0;i<DROPS.length;i++){ var d=DROPS[i];
    var y=(d.y + d.sp*t) % (${H}+80) - 40, x=(d.x - d.sp*0.19*t) % (${W}+60);
    if(x<-30) x+=${W}+60;
    cx.strokeStyle='rgba(198,214,226,'+d.a+')'; cx.lineWidth=1.5;
    cx.beginPath(); cx.moveTo(x,y); cx.lineTo(x-d.len*0.19, y+d.len); cx.stroke(); }
  /* Jimothy: walks in from the left, decelerates, then sits */
  var WALK0=8, WALK1=74, SIT=86;
  var r=document.getElementById('roon');
  var p=ease((f-WALK0)/(WALK1-WALK0));
  var x0=-360, x1=${W}*0.5-142;
  var x=x0+(x1-x0)*p;
  var sitting=f>=SIT;
  var settle=ease((f-SIT)/14);
  if(f<WALK0){ r.style.opacity=0; }
  else { r.style.opacity=1; }
  var src = sitting ? 'sit' : (f<WALK0? 'idle' : POSE[Math.floor(f/4)%POSE.length]);
  if(r.getAttribute('data-p')!==src){ r.setAttribute('data-p',src); r.src=img(src); }
  /* the run poses are a crouch, so they need less height to read the same size */
  var HT={sit:300, idle:290, 'run-r':236, 'run-r2':236, 'run-l':236, land:250};
  r.style.height=(HT[src]||280)+'px';
  /* a small bob while walking, and a settle when he lands on his backside */
  var bob = (!sitting && f>=WALK0) ? Math.sin(f*0.52)*7*(1-p*0.55) : 0;
  var drop = sitting ? 16*settle : 0;
  r.style.left=Math.round(x)+'px';
  r.style.transform='translateY('+(bob+drop)+'px)';

  /* type */
  document.querySelector('.type').style.opacity=ease((f-4)/22);
  document.getElementById('ln1').style.opacity=ease((f-34)/20)*(1-ease((f-118)/16));
  document.getElementById('ln2').style.opacity=ease((f-78)/20)*(1-ease((f-118)/16));
  document.getElementById('sml').style.opacity=ease((f-136)/22);
  /* open from black, and do not fade out: the cut ends on the lockup */
  document.getElementById('fade').style.opacity=1-ease(f/10);
};
window.__setFrame(0);
</script></body></html>`;

(async()=>{
 const srv=await L.serve(PORT);
 const b=await L.puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox','--disable-gpu']});
 const p=await b.newPage();
 const missing=[];
 p.on('requestfailed',r=>{ const t=(r.failure()||{}).errorText||''; if(t!=='net::ERR_ABORTED') missing.push(r.url()+' '+t); });
 p.on('response',r=>{ if(r.status()>=400) missing.push(r.url()+' HTTP '+r.status()); });
 await p.setViewport({width:W,height:H,deviceScaleFactor:1});
 await p.setContent(page(),{waitUntil:'networkidle0',timeout:60000});
 await p.evaluate(()=>document.fonts?document.fonts.ready:0);
 await L.sleep(700);
 /* ⛔ every walk pose is swapped in by src, so they must all be warm before the
    shutter opens or the walk photographs as gaps */
 await p.evaluate((base)=>{ return Promise.all(['idle','sit','run-r','run-r2','run-l','land'].map(n=>new Promise(res=>{
   const i=new Image(); i.onload=res; i.onerror=res; i.src=base+'/satellites/stream-hop/assets/hero/'+n+'.png'; }))); }, BASE);
 await L.sleep(400);
 if(missing.length){ console.error('MISSING ASSETS, refusing to write:'); missing.forEach(u=>console.error('  '+u)); await b.close(); srv.close(); process.exit(1); }
 for(const f of L.fs.readdirSync(OUT)) if(/\.jpg$/.test(f)) L.fs.unlinkSync(OUT+'/'+f);
 for(let f=0;f<N;f++){
  await p.evaluate(i=>window.__setFrame(i), f);
  await p.screenshot({path:OUT+'/f'+String(f).padStart(5,'0')+'.jpg', type:'jpeg', quality:94});
 }
 console.log('endcard: wrote '+N+' frames ('+(N/FPS).toFixed(1)+'s)');
 await b.close(); srv.close();
})();
