import puppeteer from 'puppeteer';
const OUT='/tmp/claude-1000/-workspaces-lucid-winds/d6e4270b-d486-419c-825e-b18f22aea7f8/scratchpad';
const b=await puppeteer.launch({args:['--no-sandbox','--mute-audio']});
const p=await b.newPage();
await p.emulate({viewport:{width:412,height:915,isMobile:true,hasTouch:true,deviceScaleFactor:3},
  userAgent:'Mozilla/5.0 (Linux; Android 15; Pixel 9) Mobile'});
await p.goto('http://127.0.0.1:8901/index.html',{waitUntil:'networkidle2'});
for(let i=0;i<5;i++){ await p.touchscreen.tap(206,457); await new Promise(r=>setTimeout(r,300));
  if(await p.evaluate(()=>{const e=document.querySelector('#intro');return !e||getComputedStyle(e).display==='none';})) break; }
await p.evaluate(()=>showToy('gear'));
await new Promise(r=>setTimeout(r,400));
// both contact regions: viewBox y ~70..160 -> screen y = svgTop+oy+vb*scale
const geom=await p.evaluate(()=>{const r=document.querySelector('#gearSvg').getBoundingClientRect();
  return {top:r.top,left:r.left,w:r.width,h:r.height};});
const s=Math.min(geom.w,geom.h)/200, ox=geom.left+(geom.w-200*s)/2, oy=geom.top+(geom.h-200*s)/2;
await p.screenshot({path:OUT+'/gear-zoom-rest.png',clip:{x:ox+30*s,y:oy+40*s,width:130*s,height:140*s}});
// quarter-turn on gear 0 then reshoot — mesh must HOLD while moving
const g0={x:ox+60*s,y:oy+74*s},R=40*s*0.8;
await p.touchscreen.touchStart(g0.x,g0.y-R);
for(let i=1;i<=8;i++){const a=-Math.PI/2+i/8*Math.PI/2;
  await p.touchscreen.touchMove(g0.x+R*Math.cos(a),g0.y+R*Math.sin(a));
  await new Promise(r=>setTimeout(r,16));}
await p.touchscreen.touchEnd();
await p.screenshot({path:OUT+'/gear-zoom-turned.png',clip:{x:ox+30*s,y:oy+40*s,width:130*s,height:140*s}});
await b.close(); console.log('SHOT');
