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
const toClient=(sel,vw,vh,x,y)=>p.evaluate((sel,vw,vh,x,y)=>{
  const r=document.querySelector(sel).getBoundingClientRect();
  const s=Math.min(r.width/vw,r.height/vh);
  return {x:r.left+(r.width-vw*s)/2+x*s, y:r.top+(r.height-vh*s)/2+y*s, s};
},sel,vw,vh,x,y);

// ===== CRADLE =====
await p.evaluate(()=>showToy('cradle'));
await sleep(300);
// 1. alignment: rest positions inside the frame
const rest=await p.evaluate(()=>crB.map((b,i)=>+crBallX(i).toFixed(1)));
console.log('CRADLE rest x (frame interior 23..197):',JSON.stringify(rest));
// 2. grab ball index 1 (second from left) and drag left => TWO balls move
const b1=await toClient('#cradleSvg',220,240,42+34,170);
await p.touchscreen.touchStart(b1.x,b1.y);
for(let i=1;i<=10;i++){ await p.touchscreen.touchMove(b1.x-i*7,b1.y-i*2); await sleep(14); }
const grab2=await p.evaluate(()=>({a0:+crB[0].a.toFixed(2),a1:+crB[1].a.toFixed(2),a4:+crB[4].a.toFixed(2)}));
console.log('CRADLE drag ball 2 left: ball0 angle',grab2.a0,'ball1',grab2.a1,'(both should be negative = pushed left), ball4',grab2.a4);
await p.screenshot({path:OUT+'/cradle2-multigrab.png'});
await p.touchscreen.touchEnd();
await sleep(400);
// 3. speed: release from ~-0.5 rad, first clack should come well under a second
const t0=Date.now(); let clackMs=null;
for(let i=0;i<25;i++){ await sleep(60);
  const s=await p.evaluate(()=>crClackT);
  if(s>0){ clackMs=Date.now()-t0; break; } }
console.log('CRADLE first clack after release: ~'+clackMs+'ms (was ~1050ms at the old speed, want <700)');
// 4. NO-RESET: while still swinging, grab ball 4; check others keep moving
await sleep(200);
const before=await p.evaluate(()=>crB.map(b=>+b.a.toFixed(3)));
const b4=await toClient('#cradleSvg',220,240,42+4*34,170);
await p.touchscreen.touchStart(b4.x,b4.y);
await sleep(250);
const during=await p.evaluate(()=>({held:crB[4].held, others:crB.slice(0,4).map(b=>+(Math.abs(b.a)+Math.abs(b.v)).toFixed(4))}));
await p.touchscreen.touchEnd();
const stillMoving=during.others.some(v=>v>0.003);
console.log('CRADLE grab-while-running: ball4 held='+during.held+', others still in motion='+stillMoving+' (must be true — no reset)');

// ===== GEARS (5) =====
await p.evaluate(()=>showToy('gear'));
await sleep(300);
const g0=await toClient('#gearSvg',200,200,60,74);
const R=40*g0.s*0.8;
await p.touchscreen.touchStart(g0.x,g0.y-R);
for(let i=1;i<=10;i++){ const a=-Math.PI/2+i/10*Math.PI/2;
  await p.touchscreen.touchMove(g0.x+R*Math.cos(a),g0.y+R*Math.sin(a)); await sleep(12); }
await p.touchscreen.touchEnd();
const gAngs=await p.evaluate(()=>GEARS.map(g=>+(g.ang*180/Math.PI).toFixed(1)));
console.log('GEARS after quarter-turn on g0 [g0,g1,g2,g3,g4]:',JSON.stringify(gAngs),
  '(signs must alternate down each chain: g0+,g1-,g2+,g3-,g4+)');
await p.screenshot({path:OUT+'/gears5.png'});

// ===== COIN =====
await p.evaluate(()=>showToy('coin'));
await sleep(300);
// visible flip: during spin the mark must be visible some of the time
const c=await toClient('#coinSvg',200,220,100,120);
await p.touchscreen.touchStart(c.x-40,c.y);
for(let i=1;i<=6;i++){ await p.touchscreen.touchMove(c.x-40+i*14,c.y); await sleep(10); }
await p.touchscreen.touchEnd();
let markSeen=0, faceChanges=0, lastP=-1;
for(let i=0;i<30;i++){ await sleep(50);
  const s=await p.evaluate(()=>({o:+document.querySelector('#coinMark').getAttribute('opacity'),
    p:Math.floor(Math.abs(cnShow)/Math.PI)%2, st:cnState}));
  if(s.o>0.25) markSeen++;
  if(s.p!==lastP){ if(lastP>=0) faceChanges++; lastP=s.p; }
  if(s.st==='rest') break; }
console.log('COIN during spin: mark visible in',markSeen,'of samples, face swapped',faceChanges,'times (must be >2 = visibly flipping)');
// fairness: 12 flicks of varying strength
const faces=[];
for(let k=0;k<12;k++){
  await p.evaluate(()=>{cnState='rest';cnOmega=0;cnTilt=0;cnWob=0;});
  const sp=6+k*3;
  await p.touchscreen.touchStart(c.x-40,c.y+10);
  for(let i=1;i<=5;i++){ await p.touchscreen.touchMove(c.x-40+i*sp,c.y+10); await sleep(8); }
  await p.touchscreen.touchEnd();
  for(let i=0;i<80;i++){ await sleep(60);
    if(await p.evaluate(()=>cnState==='rest')) break; }
  faces.push(await p.evaluate(()=>cnFace));
}
console.log('COIN 12 landings [1=heads]:',JSON.stringify(faces),'heads:',faces.filter(f=>f).length,'(must not be 0 or 12)');

// ===== CHOCOLATE =====
await p.evaluate(()=>showToy('choc'));
await sleep(300);
let st=await p.evaluate(()=>({foil:chocFoil,cols:chocCols}));
console.log('CHOC fresh bar: foil='+st.foil);
const ch=await toClient('#chocSvg',300,200,150,104);
await p.touchscreen.touchStart(ch.x,ch.y);
for(let i=1;i<=12;i++){ await p.touchscreen.touchMove(ch.x+i*12,ch.y); await sleep(14); }
await p.touchscreen.touchEnd();
st=await p.evaluate(()=>({foil:chocFoil}));
console.log('CHOC after sideways drag: foil='+st.foil+' (must be false)');
// score then snap groove 4
const gr=await toClient('#chocSvg',300,200,150-126+4*42,104);
await p.touchscreen.tap(gr.x,gr.y); await sleep(150);
const cr=await p.evaluate(()=>chocCracked);
await p.touchscreen.tap(gr.x,gr.y); await sleep(700);
st=await p.evaluate(()=>({cols:chocCols,lock:chocLock}));
console.log('CHOC groove 4: after tap1 cracked='+cr+' (must be 4), after tap2 cols='+st.cols+' (must be 4)');
await p.screenshot({path:OUT+'/choc2.png'});

// ===== RAIN STICK: lateral motion + pin scatter =====
await p.evaluate(()=>showToy('shake'));
await sleep(300);
const xs0=await p.evaluate(()=>shGrains.slice(0,20).map(g=>+g.x.toFixed(1)));
await p.evaluate(()=>{shAng=Math.PI;});   // flip it fully over
await sleep(2500);
const xs1=await p.evaluate(()=>shGrains.slice(0,20).map(g=>+g.x.toFixed(1)));
const lateral=xs0.some((x,i)=>Math.abs(x-xs1[i])>1.5);
const ys=await p.evaluate(()=>({min:Math.min.apply(0,shGrains.map(g=>g.y)),max:Math.max.apply(0,shGrains.map(g=>g.y))}));
console.log('SHAKE after full flip: grains scattered laterally='+lateral+', y-range',JSON.stringify(ys),'(must stay within ~42..258)');

// ===== EDAMAME =====
await p.evaluate(()=>showToy('eda'));
await sleep(300);
const eda=await toClient('#edaSvg',240,160,64,80);
const seen={};
for(let k=0;k<10;k++){
  await p.touchscreen.tap(eda.x,eda.y); await sleep(120);
  const f=await p.evaluate(()=>edaOut[0]?EDA_FACES[edaFace[0]]:null);
  if(f) seen[f]=1;
  await p.touchscreen.tap(eda.x,(await toClient('#edaSvg',240,160,64,52)).y); await sleep(120);
}
console.log('EDAMAME 10 pops drew faces:',Object.keys(seen).join(', '),'(bank is 24)');
await b.close(); console.log('DONE');
