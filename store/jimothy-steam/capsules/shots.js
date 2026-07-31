/* Steam screenshots for Jumping Jimothy.
   The game is portrait and Valve wants 1920x1080, so each shot is the real game
   frame at native size, centred on its own backdrop blurred out behind it.
   ⛔ Never stretch the game to fill 16:9 - that is the thing that looks cheap. */
const puppeteer=require('/workspaces/lucid-winds/node_modules/puppeteer');
const fs=require('fs');
const BASE='http://localhost:8942';
const OUT=__dirname+'/out/screenshots';
fs.mkdirSync(OUT,{recursive:true});

const SHOTS=[
 {f:'01-rush-hour',  lvl:4,   bg:'zone-street.jpg'},
 {f:'02-the-canal',  lvl:34,  bg:'zone-waterfront.jpg'},
 {f:'03-deep-city',  lvl:72,  bg:'zone-skyline.jpg'},
];
const MENUS=[
 {f:'04-prize-bin',  screen:'s-skins', bg:'zone-market.jpg'},
 {f:'05-the-street', screen:'s-title', bg:'zone-dumpster.jpg'},
];

(async()=>{
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox']});
 const grab=async(setup,name)=>{
   const p=await b.newPage();
   await p.setViewport({width:540,height:960,deviceScaleFactor:2});
   await p.setRequestInterception(true);
   p.on('request',r=>{ if(r.url().includes('swFeedback')) return r.abort(); r.continue(); });
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
   await new Promise(r=>setTimeout(r,1600));
   const buf=await p.screenshot({encoding:'base64'});
   await p.close();
   return buf;
 };
 const compose=async(b64,bg,file)=>{
   const p=await b.newPage();
   await p.setViewport({width:1920,height:1080,deviceScaleFactor:1});
   await p.setContent(`<!doctype html><html><head><style>
     *{margin:0;padding:0}html,body{width:1920px;height:1080px;overflow:hidden;background:#06090a}
     .bg{position:absolute;inset:-40px;background:url('${BASE}/satellites/stream-hop/assets/bg/${bg}') center/cover no-repeat;
         filter:blur(26px) brightness(.34) saturate(.9)}
     .fade{position:absolute;inset:0;background:radial-gradient(70% 90% at 50% 50%, rgba(0,0,0,0) 0%, rgba(4,7,4,.75) 100%)}
     .shot{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);height:1010px;width:auto;
           border-radius:10px;box-shadow:0 26px 90px rgba(0,0,0,.85), 0 0 0 1px rgba(200,168,75,.22)}
   </style></head><body><div class="bg"></div><div class="fade"></div>
   <img class="shot" src="data:image/png;base64,${b64}"></body></html>`,{waitUntil:'networkidle0',timeout:60000});
   await new Promise(r=>setTimeout(r,700));
   await p.screenshot({path:OUT+'/'+file+'_1920x1080.png'});
   await p.close();
   console.log('  wrote '+file);
 };
 for(const s of SHOTS){
   const b64=await grab(async p=>{ await p.evaluate(l=>{ SH_DEV.start('adventure',l); }, s.lvl);
     await new Promise(r=>setTimeout(r,1400));
     await p.evaluate(()=>{ for(let i=0;i<3;i++) SH_DEV.hop&&SH_DEV.hop('up'); }); }, s.f);
   await compose(b64,s.bg,s.f);
 }
 for(const m of MENUS){
   const b64=await grab(async p=>{ await p.evaluate(id=>{ try{SH_DEV.show(id)}catch(e){} }, m.screen); }, m.f);
   await compose(b64,m.bg,m.f);
 }
 await b.close();
})();
