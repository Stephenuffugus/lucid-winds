import puppeteer from 'puppeteer';
const OUT='/tmp/claude-1000/-workspaces-lucid-winds/d6e4270b-d486-419c-825e-b18f22aea7f8/scratchpad';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await puppeteer.launch({args:['--no-sandbox','--mute-audio']});
const p=await b.newPage();
await p.emulate({viewport:{width:412,height:915,isMobile:true,hasTouch:true,deviceScaleFactor:2},
  userAgent:'Mozilla/5.0 (Linux; Android 15; Pixel 9) Mobile'});
p.on('pageerror',e=>console.log('PAGEERROR:',e.message));
await p.goto('http://127.0.0.1:8901/index.html',{waitUntil:'networkidle2'});
for(let i=0;i<5;i++){ await p.touchscreen.tap(206,457); await sleep(300);
  if(await p.evaluate(()=>{const e=document.querySelector('#intro');return !e||getComputedStyle(e).display==='none';})) break; }

// helper: viewBox->client for any svg
const toClient=(sel,vw,vh,x,y)=>p.evaluate((sel,vw,vh,x,y)=>{
  const r=document.querySelector(sel).getBoundingClientRect();
  const s=Math.min(r.width/vw,r.height/vh);
  return {x:r.left+(r.width-vw*s)/2+x*s, y:r.top+(r.height-vh*s)/2+y*s, s};
},sel,vw,vh,x,y);

// ---- CRADLE: pull the RIGHT ball to the RIGHT; the BALL on screen must move RIGHT
await p.evaluate(()=>showToy('cradle'));
await sleep(300);
const ball4=await p.evaluate(()=>document.querySelector('#cr4 circle').getBoundingClientRect().x);
const grab=await toClient('#cradleSvg',220,240,54+4*36,170);
await p.touchscreen.touchStart(grab.x,grab.y);
for(let i=1;i<=8;i++){ await p.touchscreen.touchMove(grab.x+i*8,grab.y-i*3); await sleep(14); }
const ball4b=await p.evaluate(()=>document.querySelector('#cr4 circle').getBoundingClientRect().x);
const crState=await p.evaluate(()=>({crR:+crR.toFixed(3)}));
console.log('CRADLE pull right: ball moved',(ball4b-ball4).toFixed(1),'px (MUST be positive), crR=',crState.crR,'(must be >0)');
await p.screenshot({path:OUT+'/cradle-held.png'});
await p.touchscreen.touchEnd();
await sleep(900);  // let it swing and clack
const shiver=await p.evaluate(()=>({shiverV:+crShiverV.toFixed(2), crL:+crL.toFixed(3)}));
console.log('CRADLE after release: shiverV=',shiver.shiverV,'(clack fired if >0), left ball moving:',shiver.crL);
await p.screenshot({path:OUT+'/cradle-swinging.png'});

// ---- RACCOON: triple boop => sneeze
await p.evaluate(()=>showToy('coon'));
await sleep(300);
const nose=await toClient('#coon',200,236,100,119);
for(let i=0;i<3;i++){ await p.touchscreen.tap(nose.x,nose.y); await sleep(160); }
await sleep(120);
const sneezing=await p.evaluate(()=>({cls:document.querySelector('#coon').getAttribute('class'),
  words:[...document.querySelectorAll('.floatword')].map(w=>w.textContent)}));
console.log('COON triple boop:',JSON.stringify(sneezing));
await p.screenshot({path:OUT+'/coon-sneeze.png'});
await sleep(600);
// tickle: scribble on the belly
const belly=await toClient('#coon',200,236,100,196);
await p.touchscreen.touchStart(belly.x,belly.y);
for(let i=0;i<14;i++){ await p.touchscreen.touchMove(belly.x+(i%2?26:-26),belly.y+(i%3)); await sleep(30); }
const giggle=await p.evaluate(()=>({cls:document.querySelector('#coon').getAttribute('class'),
  words:[...document.querySelectorAll('.floatword')].map(w=>w.textContent)}));
await p.touchscreen.touchEnd();
console.log('COON tickle:',JSON.stringify(giggle));

// ---- PUPPET: slow drag => hum active
await p.evaluate(()=>showToy('pup'));
await sleep(300);
const mouth=await toClient('#pupSvg',200,224,100,110);
await p.touchscreen.touchStart(mouth.x,mouth.y);
for(let i=1;i<=20;i++){ await p.touchscreen.touchMove(mouth.x,mouth.y-i*3); await sleep(28); }
const hum=await p.evaluate(()=>({humming:!!(pupHum&&!pupHum.dead), open:+pupOpen.toFixed(2)}));
await p.touchscreen.touchEnd();
console.log('PUPPET slow drag: hum active =',hum.humming,'open=',hum.open);
// eye poke
const eye=await toClient('#pupSvg',200,224,74,52);
await p.touchscreen.tap(eye.x,eye.y);
await sleep(100);
const dizzy=await p.evaluate(()=>document.querySelector('#pupSvg').classList.contains('dizzy'));
console.log('PUPPET eye poke: dizzy =',dizzy);

// ---- GEARS: drag then release => coast
await p.evaluate(()=>showToy('gear'));
await sleep(300);
const g0=await toClient('#gearSvg',200,200,60,74);
const R=40*g0.s*0.8;
await p.touchscreen.touchStart(g0.x,g0.y-R);
for(let i=1;i<=10;i++){ const a=-Math.PI/2+i/10*Math.PI;
  await p.touchscreen.touchMove(g0.x+R*Math.cos(a),g0.y+R*Math.sin(a)); await sleep(12); }
await p.touchscreen.touchEnd();
const om1=await p.evaluate(()=>+gearOmega.toFixed(5));
const a1=await p.evaluate(()=>+GEARS[0].ang.toFixed(3));
await sleep(400);
const om2=await p.evaluate(()=>+gearOmega.toFixed(5));
const a2=await p.evaluate(()=>+GEARS[0].ang.toFixed(3));
console.log('GEARS coast: omega',om1,'->',om2,'| angle advanced while untouched:',(a2-a1).toFixed(3),'rad (must be nonzero, decaying)');
await b.close(); console.log('DONE');
