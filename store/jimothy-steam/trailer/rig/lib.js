/* Shared rig for the Jumping Jimothy trailer capture.
   Same bones as capsules/shots_costume.js (in-process repo server, save seeded
   before boot, ?shtest=1 dev surface) with one addition that makes VIDEO
   possible at all: after the game is running we stub requestAnimationFrame, so
   the game's own loop() cannot reschedule itself. From that point the harness
   owns the clock — step(1/30) + render() + screenshot, once per frame. Frames
   come out evenly spaced and repeatable instead of however fast a headless box
   happened to paint, and a re-run of a beat is identical to the last one. */
const puppeteer=require('/workspaces/lucid-winds/node_modules/puppeteer');
const fs=require('fs'), path=require('path'), http=require('http');
const ROOT='/workspaces/lucid-winds';
const PORT=8947;
const BASE='http://localhost:'+PORT;
const FPS=30, DT=1/30;

const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png',
 '.jpg':'image/jpeg','.jpeg':'image/jpeg','.json':'application/json','.woff2':'font/woff2',
 '.woff':'font/woff','.ttf':'font/ttf','.mp3':'audio/mpeg','.ogg':'audio/ogg',
 '.svg':'image/svg+xml','.webp':'image/webp'};
function serve(port){
 const s=http.createServer((req,res)=>{
  const clean=decodeURIComponent(req.url.split('?')[0]);
  const fp=path.normalize(path.join(ROOT,clean));
  if(!fp.startsWith(ROOT)){res.writeHead(403);res.end();return;}
  fs.readFile(fp,(e,buf)=>{ if(e){res.writeHead(404);res.end();return;}
   /* ACAO: compositor pages are built with setContent (opaque origin) and
      browsers block cross-origin FONT loads without it. Images are fine. */
   res.writeHead(200,{'Content-Type':MIME[path.extname(fp)]||'application/octet-stream',
    'Access-Control-Allow-Origin':'*'}); res.end(buf); });
 });
 return new Promise(r=>s.listen(port,'127.0.0.1',()=>r(s)));
}

/* Boot the shipped build with a seeded save, past the splash and any daily
   reward popup, sitting on the title screen. */
async function boot(browser,opts){
 opts=opts||{};
 const p=await browser.newPage();
 await p.setViewport({width:540,height:960,deviceScaleFactor:opts.dsf||2});
 await p.setRequestInterception(true);
 p.on('request',r=>{ if(r.url().includes('swFeedback')) return r.abort(); r.continue(); });
 const prog=Object.assign({v:2, hopped:1, taughtPower:1, taughtEgg:1}, opts.prog||{});
 await p.evaluateOnNewDocument((pr)=>{
  window.__STEAM_BUILD=true;
  try{ localStorage.setItem('sh_prog', JSON.stringify(pr)); }catch(e){}
  try{ localStorage.setItem('sh_set', JSON.stringify({sound:false,music:false,shake:true,cb:false,mute:true})); }catch(e){}
 }, prog);
 await p.goto(BASE+'/satellites/stream-hop/index.html?shtest=1',{waitUntil:'networkidle2',timeout:60000});
 await sleep(3200);
 await p.evaluate(()=>{const e=document.getElementById('splash-tap'); if(e)e.click();});
 await sleep(1600);
 for(let i=0;i<4;i++){
  const hit=await p.evaluate(()=>{
   const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
   const el=Array.from(document.querySelectorAll('button,div,.btn')).filter(vis)
     .find(e=>/^(Claim|Collect|OK|Continue|Close|✕|Got it)$/i.test((e.innerText||'').trim()));
   if(el){ el.click(); return true; } return false;
  });
  if(!hit) break; await sleep(800);
 }
 await sleep(500);
 return p;
}

/* ⛔ THE WHOLE TRICK. Call this once the level is running. loop() ends every
   frame with requestAnimationFrame(loop); with rAF stubbed the chain dies and
   nothing steps the world but us. Anything else that wants a frame (the score
   roll on the clear card) is queued into __rafQ so a UI beat can pump it. */
async function seizeClock(p){
 await p.evaluate(()=>{
  window.__rafQ=[];
  window.__rafReal=window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame=function(cb){ window.__rafQ.push(cb); return window.__rafQ.length; };
  window.cancelAnimationFrame=function(){};
  /* ⛔⛔ THE DOUBLE STEP. Some screens animate on rAF rather than in the game
     loop — the game-over card rolls its feast and trail numbers that way — so
     those shots have to pump the held queue. But show('s-play') ends with
     requestAnimationFrame(loop), so loop() is sitting in that queue too, and
     pumping it steps the world a SECOND time and re-queues itself forever.
     Measured: the death shot's run drifted 12 frames in 13, because the world
     was running at double speed while the harness believed it owned the clock.
     While a run is live there is nothing in the queue worth running, so drop
     it; once the run is over, loop() no-ops on `running` and pumping is safe. */
  window.__pump=function(t){
   var q=window.__rafQ||[]; window.__rafQ=[];
   var g=null; try{ g=SH_DEV.state(); }catch(e){}
   if(g && g.phase==='play') return 0;              // discard: loop() would double step
   for(var i=0;i<q.length;i++){ try{ q[i](t); }catch(e){} }
   return q.length;
  };
 });
 await sleep(120);            // let the in-flight frame finish and not reschedule
}
async function releaseClock(p){
 await p.evaluate(()=>{ if(window.__rafReal){ window.requestAnimationFrame=window.__rafReal; } });
}
/* pump queued rAF callbacks with a synthetic timestamp — for screens whose
   animation is a rAF roll rather than the game loop */
async function pumpRaf(p,ts){
 await p.evaluate((t)=>{
  const q=window.__rafQ||[]; window.__rafQ=[];
  for(const cb of q){ try{ cb(t); }catch(e){} }
 }, ts);
}

/* ⛔ ONE SAVE FOR EVERY PROBE AND EVERY SHOT. The first bank probe booted a
   different save AND started hopping at frame 0 while the level probe held for
   100 frames; the two disagreed wildly about level 78 and it looked like the
   save was to blame. It was the entry point — the levels are seeded, so a
   different first hop is a different run for the rest of its life. Both inputs
   now come from here so a probe cannot quietly measure a different game than
   the one being shot. */
/* ⛔ OWN EVERYTHING, EARN NOTHING MID SHOT. The daily beat photographed a
   "BADGE EARNED: Hot Jimothy Summer" modal sitting on top of the Daily card,
   and the level 100 beat photographed two unlock reveals ("Wizothy", "The Trash
   King") sitting on top of LEVEL CLEAR 100 — both shots reported OK because the
   screen underneath really was up. Anything the game can award during a run is
   pre-awarded here so nothing new can fire in front of the camera. It also
   makes the wardrobe beat honest: all 45 present, in colour. */
const ALL_CHARS='jimothy,pigeon,crow,seagull,opossum,skunk,slug,otter,heron,coyote,seal,salmon,orca,soggy,summer,nordic,barista,fishmonger,grad,labcoat,deckhand,market,hardhat,scout,firstfrost,garage,shark,froggery,dino,knight,hazmat,pirate,astronaut,alien,disco,robot,wizard,barnacle,mothman,trashking,chicken,shinothy,ghost,richuncle,sasquatch'.split(',');
const ALL_ACH='first,rows100,rows300,combo10,combo20,chapter1,level20,stars30,critters5,crittersAll,landmarks,caps500,weather,dodge,allpowers,rush40,fogwalk,secrets,streak5,streak10,streak25'.split(',');
const ALL_SEASONS='spring,summer,pride,spooky,winter'.split(',');
const ALL_POWS='coffee,umbrella,trash,crosswalk,vest,boots,espresso,lamp,salmon'.split(',');
const _on=list=>list.reduce((o,k)=>(o[k]=1,o),{});
function baseProg(extra){
  const stars={};
  for(let n=1;n<=100;n++){ const r=(n*2654435761)%97; stars[n]= n>92?0 : r<26?3 : r<58?2 : r<86?1 : 0; }
  return Object.assign({v:2, hopped:1, taughtPower:1, taughtEgg:1, char:'jimothy',
    chars:_on(ALL_CHARS), ach:_on(ALL_ACH), seasons:_on(ALL_SEASONS), pows:_on(ALL_POWS),
    caps:214, adv:{maxLevel:100, stars:stars}, flowers:412, roads:288, maxCombo:14,
    best:{adventure:186,daily:74,zen:120,rush:88}}, extra||{});
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
module.exports={puppeteer,fs,path,ROOT,BASE,PORT,FPS,DT,serve,boot,seizeClock,releaseClock,pumpRaf,sleep,baseProg};
