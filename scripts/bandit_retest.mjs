import puppeteer from 'puppeteer';
const OUT='/tmp/claude-1000/-workspaces-lucid-winds/d6e4270b-d486-419c-825e-b18f22aea7f8/scratchpad';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await puppeteer.launch({args:['--no-sandbox','--mute-audio']});
const p=await b.newPage();
await p.emulate({viewport:{width:412,height:915,isMobile:true,hasTouch:true,deviceScaleFactor:2},
  userAgent:'Mozilla/5.0 (Linux; Android 15; Pixel 9) Mobile'});
await p.goto('http://127.0.0.1:8901/index.html',{waitUntil:'networkidle2'});
for(let i=0;i<5;i++){ await p.touchscreen.tap(206,457); await sleep(300);
  if(await p.evaluate(()=>{const e=document.querySelector('#intro');return !e||getComputedStyle(e).display==='none';})) break; }
const toClient=(sel,vw,vh,x,y)=>p.evaluate((sel,vw,vh,x,y)=>{
  const r=document.querySelector(sel).getBoundingClientRect();
  const s=Math.min(r.width/vw,r.height/vh);
  return {x:r.left+(r.width-vw*s)/2+x*s, y:r.top+(r.height-vh*s)/2+y*s, s};
},sel,vw,vh,x,y);

// CRADLE full cycle
await p.evaluate(()=>showToy('cradle'));
await sleep(300);
const grab=await toClient('#cradleSvg',220,240,54+4*36,170);
await p.touchscreen.touchStart(grab.x,grab.y);
for(let i=1;i<=8;i++){ await p.touchscreen.touchMove(grab.x+i*9,grab.y-i*3); await sleep(14); }
await p.touchscreen.touchEnd();
let clacked=false, frames=0;
for(let i=0;i<30;i++){ await sleep(150);
  const s=await p.evaluate(()=>({sv:crShiverV,l:crL,vl:crVL}));
  if(s.sv>0){ clacked=true;
    console.log('CRADLE clack at ~'+(i*150)+'ms, shiverV=',s.sv.toFixed(2),'left ball launched:',s.vl<0||s.l<0);
    await p.screenshot({path:OUT+'/cradle-impact.png'}); break; }
}
if(!clacked) console.log('CRADLE: NO CLACK in 4.5s — problem');

// TICKLE at the true belly (below the string ring's reach)
await p.evaluate(()=>showToy('coon'));
await sleep(300);
const belly=await toClient('#coon',200,236,100,207);
await p.touchscreen.touchStart(belly.x,belly.y);
let giggled=null;
for(let i=0;i<16;i++){ await p.touchscreen.touchMove(belly.x+(i%2?24:-24),belly.y+(i%3)); await sleep(30);
  if(!giggled){ const g=await p.evaluate(()=>({cls:document.querySelector('#coon').getAttribute('class'),
      words:[...document.querySelectorAll('.floatword')].map(w=>w.textContent)}));
    if(g.cls||g.words.length){ giggled=g; } } }
await p.touchscreen.touchEnd();
console.log('COON tickle:',JSON.stringify(giggled||{result:'no reaction'}));
await b.close(); console.log('DONE');
