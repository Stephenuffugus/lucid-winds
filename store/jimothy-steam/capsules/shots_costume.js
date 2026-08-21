/* Costume screenshots for Jumping Jimothy — Sharkothy + Dinothy.
   Same pipeline as shots.js (real game frame, native size, blurred zone
   backdrop, never stretched), plus one new trick: the save is seeded before
   the page boots, so the costume is equipped through the same PROG.char path
   the real wardrobe uses (loader restores p.char + p.chars, verified).
   Serves the repo itself in-process, so no external server is needed. */
const puppeteer=require('/workspaces/lucid-winds/node_modules/puppeteer');
const fs=require('fs');
const path=require('path');
const http=require('http');
const ROOT='/workspaces/lucid-winds';
const PORT=8943;
const BASE='http://localhost:'+PORT;
const OUT=__dirname+'/out/screenshots';
fs.mkdirSync(OUT,{recursive:true});

const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png',
  '.jpg':'image/jpeg','.jpeg':'image/jpeg','.json':'application/json','.woff2':'font/woff2',
  '.woff':'font/woff','.mp3':'audio/mpeg','.ogg':'audio/ogg','.svg':'image/svg+xml','.webp':'image/webp'};
const server=http.createServer((req,res)=>{
  const clean=decodeURIComponent(req.url.split('?')[0]);
  let fp=path.normalize(path.join(ROOT,clean));
  if(!fp.startsWith(ROOT)){res.writeHead(403);res.end();return;}
  fs.readFile(fp,(err,buf)=>{
    if(err){res.writeHead(404);res.end();return;}
    res.writeHead(200,{'Content-Type':MIME[path.extname(fp)]||'application/octet-stream'});
    res.end(buf);
  });
});

const SHOTS=[
 /* ⛔ level 38 is a TRAP for this harness: a bus lane sits on the start rows and
    every timing variation got bumped there (dizzy-star frame, twice). The lvl-33
    frame was clean but Stephen's verdict: shark HALF HIDDEN behind ferry + life
    rings. Shooting four candidates on different courses; a human picks the one
    where the costume is fully in the open. 07-dinothy is DONE — keep commented. */
 {f:'06cand-a-sodo24',   lvl:24, bg:'zone-waterfront.jpg', chr:'shark'},
 {f:'06cand-b-canal31',  lvl:31, bg:'zone-waterfront.jpg', chr:'shark'},
 {f:'06cand-c-canal36',  lvl:36, bg:'zone-waterfront.jpg', chr:'shark'},
 {f:'06cand-d-market12', lvl:12, bg:'zone-market.jpg',     chr:'shark'},
 //{f:'07-dinothy',   lvl:26, bg:'zone-dumpster.jpg',   chr:'dino'},
];

(async()=>{
 await new Promise(r=>server.listen(PORT,'127.0.0.1',r));
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox']});
 const grab=async(chr,setup,name,verify)=>{
   const p=await b.newPage();
   await p.setViewport({width:540,height:960,deviceScaleFactor:2});
   await p.setRequestInterception(true);
   p.on('request',r=>{ if(r.url().includes('swFeedback')) return r.abort(); r.continue(); });
   /* ⛔ Shoot the build we SHIP (hides Sign in / Support the Studio), and seed
      the save BEFORE any page script runs: v:2 skips the char-reset migration,
      chars marks both owned, char equips, hopped skips first-run hand holding. */
   await p.evaluateOnNewDocument((id)=>{
     window.__STEAM_BUILD=true;
     try{ localStorage.setItem('sh_prog', JSON.stringify(
       {v:2, char:id, chars:{shark:1,dino:1}, hopped:1})); }catch(e){}
   }, chr);
   await p.goto(BASE+'/satellites/stream-hop/index.html?shtest=1',{waitUntil:'networkidle2',timeout:60000});
   await new Promise(r=>setTimeout(r,3200));
   await p.evaluate(()=>{const e=document.getElementById('splash-tap'); if(e)e.click();});
   await new Promise(r=>setTimeout(r,1800));
   /* Claim/close anything floating (Daily Reward on a fresh profile, etc.) */
   for(let i=0;i<3;i++){
     const hit=await p.evaluate(()=>{
       const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
       const el=Array.from(document.querySelectorAll('button,div,.btn'))
         .filter(vis).find(e=>/^(Claim|Collect|OK|Continue|Close|✕|Got it)$/i.test((e.innerText||'').trim()));
       if(el){ el.click(); return true; } return false;
     });
     if(!hit) break;
     await new Promise(r=>setTimeout(r,900));
   }
   await new Promise(r=>setTimeout(r,600));
   await setup(p);
   await new Promise(r=>setTimeout(r,900));
   const okChr=await p.evaluate(id=>{ try{ const g=SH_DEV.state(); return !!(g&&g.chr&&g.chr.id===id); }catch(e){ return false; } }, chr);
   if(!okChr){ console.log(`  ${name}: costume NOT equipped in G.chr, aborting this attempt`); await p.close(); return null; }
   /* ⛔ verify must be the LAST thing before the shutter (level-72 lesson) */
   const good = verify ? await verify(p) : true;
   const buf = good ? await p.screenshot({encoding:'base64'}) : null;
   await p.close();
   return buf;
 };
 const compose=async(b64,bg,file)=>{
   const p=await b.newPage();
   await p.setViewport({width:1920,height:1080,deviceScaleFactor:1});
   await p.setContent(`<!doctype html><html><head><style>
     *{margin:0;padding:0}html,body{width:1920px;height:1080px;overflow:hidden;background:#06090a}
     .bg{position:absolute;inset:-40px;background:url('${BASE}/satellites/stream-hop/assets/bg/${bg}') center/cover no-repeat;
         filter:blur(16px) brightness(.62) saturate(1.05)}
     .fade{position:absolute;inset:0;background:radial-gradient(78% 96% at 50% 50%, rgba(0,0,0,0) 0%, rgba(4,7,4,.55) 100%)}
     .glow{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
           width:900px;height:1080px;border-radius:50%;
           background:radial-gradient(50% 50% at 50% 50%, rgba(214,168,74,.20) 0%, rgba(214,168,74,0) 70%)}
     .shot{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);height:1044px;width:auto;
           border-radius:10px;box-shadow:0 26px 90px rgba(0,0,0,.85), 0 0 0 1px rgba(200,168,75,.30)}
   </style></head><body><div class="bg"></div><div class="fade"></div><div class="glow"></div>
   <img class="shot" src="data:image/png;base64,${b64}"></body></html>`,{waitUntil:'domcontentloaded',timeout:60000});
   await p.evaluate(()=>{ return document.fonts?document.fonts.ready:0; });
   await new Promise(r=>setTimeout(r,1600));
   await p.screenshot({path:OUT+'/'+file+'_1920x1080.png'});
   await p.close();
   console.log('  wrote '+file);
 };
 /* ⛔ ask the SCREEN, not just G.dead (game-over resets G and lies). And more
    than alive: the first costume run photographed both mascots mid-TUMBLE with
    dizzy stars, because phase==='dying' and the bump brace (saveT) both read as
    "not dead". A store shot needs: playing, unhurt, hop settled, no overlays. */
 const alive=p=>p.evaluate(()=>{
   const g=SH_DEV.state();
   if(!g||g.dead||g.phase!=='play'||(g.saveT>0)||g.hop) return false;
   const vis=id=>{ const e=document.getElementById(id);
     return !!e && getComputedStyle(e).display!=='none' && e.getBoundingClientRect().height>0; };
   return !(vis('s-go')||vis('s-clear')||vis('s-pause'));
 });
 for(const s of SHOTS){
   let b64=null;
   for(let attempt=1; attempt<=8 && !b64; attempt++){
     const cand=await grab(s.chr, async p=>{
       await p.evaluate(l=>{ SH_DEV.start('adventure',l); }, s.lvl);
       /* let the level banner finish fading before anything else. The delay is
          varied per attempt ON PURPOSE: the level seed is fixed, so identical
          timing + identical hops = the exact same death, eight times over
          (probe_dino.js proved it: buffered hop onto row 404, 'squish', 3/3). */
       await new Promise(r=>setTimeout(r,3500+attempt*600));
       /* the game's own safe bot: hops forward only when the lane ahead is
          clear. Hop count also varies per attempt. */
       await p.evaluate(h=>{ SH_DEV.autoPlay&&SH_DEV.autoPlay(h); }, 2+(attempt%4));
       /* ⛔ shoot FAST: the long settle wait was the window where a buffered
          extra hop walked him into traffic. One paint is all we need. */
       await new Promise(r=>setTimeout(r,120));
     }, s.f, alive);
     if(cand) b64=cand; else console.log(`  ${s.f}: flattened or not equipped, re-rolling (${attempt}/8)`);
   }
   if(!b64){ console.log(`  ${s.f}: SKIPPED, could not get a clean run`); continue; }
   await compose(b64,s.bg,s.f);
 }
 await b.close();
 server.close();
})();
