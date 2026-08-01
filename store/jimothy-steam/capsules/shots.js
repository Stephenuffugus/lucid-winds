/* Steam screenshots for Jumping Jimothy.
   The game is portrait and Valve wants 1920x1080, so each shot is the real game
   frame at native size, centred on its own backdrop blurred out behind it.
   ⛔ Never stretch the game to fill 16:9 - that is the thing that looks cheap. */
const puppeteer=require('/workspaces/lucid-winds/node_modules/puppeteer');
const fs=require('fs');
const BASE='http://localhost:8942';
const OUT=__dirname+'/out/screenshots';
fs.mkdirSync(OUT,{recursive:true});

/* ⛔⛔ ALL FIVE ARE GAMEPLAY NOW. The two menu shots were replaced 2026-08-02
   because they were actively harmful on a paid store page:
     04-prize-bin was a wall of body text on black with NO art, and it showed
       two things that must never appear there - the retired "Colours" feature,
       and a live "14 pack costumes + the soundtrack - $3" purchase button. On
       Steam that pack is GRANTED, so the shot advertised a purchase the build
       does not have, next to a feature the game no longer has.
     05-the-street was the WEB title screen, showing Sign in and Support the
       Studio, both of which the Steam build hides.
   Menus do not sell an arcade game anyway. Five zones, five decades, five
   different looks. */
const SHOTS=[
 {f:'01-rush-hour',   lvl:4,   bg:'zone-street.jpg'},
 {f:'02-pike-market', lvl:18,  bg:'zone-market.jpg'},
 {f:'03-the-canal',   lvl:34,  bg:'zone-waterfront.jpg'},
 {f:'04-fremont',     lvl:52,  bg:'zone-bridge.jpg'},
 {f:'05-deep-city',   lvl:72,  bg:'zone-skyline.jpg'},
];
const MENUS=[];

(async()=>{
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox']});
 const grab=async(setup,name,verify)=>{
   const p=await b.newPage();
   await p.setViewport({width:540,height:960,deviceScaleFactor:2});
   await p.setRequestInterception(true);
   p.on('request',r=>{ if(r.url().includes('swFeedback')) return r.abort(); r.continue(); });
   /* ⛔ Shoot the build we SHIP. Without this the capture carries Sign in and
      Support the Studio, which the Steam build hides - the first pass put both
      on a store screenshot. Must land before any page script reads it. */
   await p.evaluateOnNewDocument(()=>{ window.__STEAM_BUILD=true; });
   await p.goto(BASE+'/satellites/stream-hop/index.html?shtest=1',{waitUntil:'networkidle2',timeout:60000});
   await new Promise(r=>setTimeout(r,3200));
   await p.evaluate(()=>{const e=document.getElementById('splash-tap'); if(e)e.click();});
   await new Promise(r=>setTimeout(r,1800));
   /* ⛔ The Daily Reward card opens over the title on a fresh profile and dimmed
      the gameplay behind it in the first pass. Claim it, then close anything
      still floating, so a store screenshot shows the GAME. */
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
   /* ⛔ THE CHECK HAS TO BE THE LAST THING BEFORE THE SHUTTER. Run two attempts
      ago it lived inside setup(), grab then waited another 1600ms, and on level
      72 Jimothy died inside that gap - so the shot was verified alive and
      photographed dead. Verify here, immediately before the exposure. */
   const good = verify ? await verify(p) : true;
   const buf = good ? await p.screenshot({encoding:'base64'}) : null;
   await p.close();
   return buf;
 };
 const compose=async(b64,bg,file)=>{
   const p=await b.newPage();
   await p.setViewport({width:1920,height:1080,deviceScaleFactor:1});
   await p.setContent(`<!doctype html><html><head><style>
     /* ⛔ The first pass blurred the backdrop to brightness .34 and then laid a
        75% black radial over it, which is why 70% of a 1920x1080 store shot was
        an almost-black rectangle. The backdrop is the game's OWN zone art: let
        it be seen. Blur says "this is behind", darkness says "nothing here". */
     *{margin:0;padding:0}html,body{width:1920px;height:1080px;overflow:hidden;background:#06090a}
     .bg{position:absolute;inset:-40px;background:url('${BASE}/satellites/stream-hop/assets/bg/${bg}') center/cover no-repeat;
         filter:blur(16px) brightness(.62) saturate(1.05)}
     .fade{position:absolute;inset:0;background:radial-gradient(78% 96% at 50% 50%, rgba(0,0,0,0) 0%, rgba(4,7,4,.55) 100%)}
     /* a warm spill behind the frame so the portrait strip reads as LIT rather
        than as a picture pasted onto a dark page */
     .glow{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
           width:900px;height:1080px;border-radius:50%;
           background:radial-gradient(50% 50% at 50% 50%, rgba(214,168,74,.20) 0%, rgba(214,168,74,0) 70%)}
     .shot{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);height:1044px;width:auto;
           border-radius:10px;box-shadow:0 26px 90px rgba(0,0,0,.85), 0 0 0 1px rgba(200,168,75,.30)}
   </style></head><body><div class="bg"></div><div class="fade"></div><div class="glow"></div>
   <img class="shot" src="data:image/png;base64,${b64}"></body></html>`,{waitUntil:'domcontentloaded',timeout:60000});
   /* ⛔ networkidle0 raced a single backdrop image and timed the whole run out on
      shot 2. Wait for the one asset we actually need, by name. */
   await p.evaluate(()=>{ const i=document.querySelector('.bg'); return document.fonts?document.fonts.ready:0; });
   await new Promise(r=>setTimeout(r,900));
   await new Promise(r=>setTimeout(r,700));
   await p.screenshot({path:OUT+'/'+file+'_1920x1080.png'});
   await p.close();
   console.log('  wrote '+file);
 };
 /* ⛔⛔ THE FIRST RUN SHOT A DEATH SCREEN. Three blind SH_DEV.hop('up') calls
    walk Jimothy straight into a lane of traffic, and the capture came back with
    "FLATTENED - He did not see it coming" across the middle of a store
    screenshot. The old script did the same thing and only got away with it by
    luck. Hop one lane at a time, check G.dead between hops, and re-roll the
    whole shot if he dies - a screenshot of the fail state is worse than no
    screenshot. */
 /* ⛔ G.dead ALONE IS NOT ENOUGH. The second run still shot a FLATTENED summary
    card, because once the game-over screen takes over, G is reset and G.dead
    reads false again - so the flag says "alive" while the screen says "you
    died". Ask the SCREEN, which is the thing being photographed. */
 const alive=p=>p.evaluate(()=>{
   const g=SH_DEV.state();
   if(g&&g.dead) return false;
   const vis=id=>{ const e=document.getElementById(id);
     return !!e && getComputedStyle(e).display!=='none' && e.getBoundingClientRect().height>0; };
   return !(vis('s-go')||vis('s-clear')||vis('s-pause'));
 });
 for(const s of SHOTS){
   let b64=null;
   for(let attempt=1; attempt<=8 && !b64; attempt++){
     const cand=await grab(async p=>{
       await p.evaluate(l=>{ SH_DEV.start('adventure',l); }, s.lvl);
       await new Promise(r=>setTimeout(r,1500));
       /* two hops, not three: he is a lane deeper into the board without
          spending as long standing in traffic while the camera warms up */
       for(let i=0;i<2;i++){
         await p.evaluate(()=>{ SH_DEV.hop&&SH_DEV.hop('up'); });
         await new Promise(r=>setTimeout(r,380));
         if(!(await alive(p))) break;
       }
     }, s.f, alive);
     if(cand) b64=cand; else console.log(`  ${s.f}: he got flattened, re-rolling (${attempt}/8)`);
   }
   if(!b64){ console.log(`  ${s.f}: SKIPPED, could not get a clean run`); continue; }
   await compose(b64,s.bg,s.f);
 }
 await b.close();
})();
