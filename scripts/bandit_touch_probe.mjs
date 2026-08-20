// Probe Bandit's Box spinner + gears with REAL touch gestures at phone size.
// Serves nothing itself — expects http://127.0.0.1:8901/ pointing at the game dir.
import puppeteer from 'puppeteer';

const OUT = '/tmp/claude-1000/-workspaces-lucid-winds/d6e4270b-d486-419c-825e-b18f22aea7f8/scratchpad';
const sleep = ms => new Promise(r => setTimeout(r, ms));

const browser = await puppeteer.launch({args:['--no-sandbox','--mute-audio']});
const page = await browser.newPage();
await page.emulate({
  viewport:{width:412,height:915,isMobile:true,hasTouch:true,deviceScaleFactor:2},
  userAgent:'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/126 Mobile Safari/537.36'
});
page.on('pageerror', e => console.log('PAGEERROR:', e.message));
await page.goto('http://127.0.0.1:8901/index.html', {waitUntil:'networkidle2'});

// dismiss intro (retry — splash may hold)
for (let i=0;i<5;i++){
  await page.touchscreen.tap(206, 457);
  await sleep(400);
  const gone = await page.evaluate(()=>{
    const el=document.querySelector('#intro');
    return !el || el.style.display==='none' || getComputedStyle(el).display==='none';
  });
  if (gone) break;
}

// A touch swipe helper with velocity (multiple moves)
async function swipe(x1,y1,x2,y2,steps=8,stepMs=12){
  await page.touchscreen.touchStart(x1,y1);
  for(let i=1;i<=steps;i++){
    await page.touchscreen.touchMove(x1+(x2-x1)*i/steps, y1+(y2-y1)*i/steps);
    await sleep(stepMs);
  }
  await page.touchscreen.touchEnd();
}

// ---------- SPINNER ----------
await page.evaluate(()=>showToy('spin'));
await sleep(400);
const spinGeom = await page.evaluate(()=>{
  const svg=document.querySelector('#spinSvg').getBoundingClientRect();
  const grp=document.querySelector('#spinGrp').getBoundingClientRect();
  return {svg:{x:svg.x,y:svg.y,w:svg.width,h:svg.height},
          grp:{cx:grp.x+grp.width/2, cy:grp.y+grp.height/2, w:grp.width, h:grp.height}};
});
console.log('SPINNER geometry:', JSON.stringify(spinGeom));
await page.screenshot({path:OUT+'/spin-0-rest.png'});

// Flick: vertical swipe DOWN the RIGHT side of the hub => expect CLOCKWISE (omega>0)
const hub = {x: spinGeom.svg.x+spinGeom.svg.w/2, y: spinGeom.svg.y+spinGeom.svg.h/2};
await swipe(hub.x+60, hub.y-90, hub.x+70, hub.y+90, 6, 8);
const s1 = await page.evaluate(()=>({omega:spinOmega, ang:spinAng}));
console.log('after RIGHT-side DOWN flick (expect omega>0 clockwise):', JSON.stringify(s1));
await sleep(250);
await page.screenshot({path:OUT+'/spin-1-flicked.png'});

// track the group's on-screen center while it coasts — an orbit shows up as movement
const track = await page.evaluate(async ()=>{
  const pts=[];
  for(let i=0;i<12;i++){
    const r=document.querySelector('#spinGrp').getBoundingClientRect();
    pts.push([+(r.x+r.width/2).toFixed(1), +(r.y+r.height/2).toFixed(1), +(r.width).toFixed(1)]);
    await new Promise(res=>setTimeout(res,90));
  }
  return pts;
});
console.log('SPINNER center drift while coasting [cx,cy,w]:', JSON.stringify(track));
await page.screenshot({path:OUT+'/spin-2-coasting.png'});

// A flick straight through the hub — the ambiguous gesture
await page.evaluate(()=>{spinOmega=0;});
await swipe(hub.x-90, hub.y-4, hub.x+90, hub.y+4, 6, 8);
const s2 = await page.evaluate(()=>({omega:spinOmega}));
console.log('after flick THROUGH the hub (physically ~0):', JSON.stringify(s2));

// ---------- GEARS ----------
await page.evaluate(()=>showToy('gear'));
await sleep(400);
await page.screenshot({path:OUT+'/gear-0-rest.png'});
const gearGeom = await page.evaluate(()=>{
  const r=document.querySelector('#gearSvg').getBoundingClientRect();
  // where the code THINKS a touch at the drawn center of gear 0 lands:
  // drawn position of viewBox point (70,78) under xMidYMid meet:
  const s=Math.min(r.width,r.height)/200;
  const ox=r.left+(r.width -200*s)/2, oy=r.top+(r.height-200*s)/2;
  const drawn0={x:ox+70*s, y:oy+78*s};
  // what gearXY computes for that client point:
  const mapped={x:(drawn0.x-r.left)/r.width*200, y:(drawn0.y-r.top)/r.height*200};
  return {rect:{w:r.width,h:r.height}, scale:s, drawn0, mapped, gears:GEARS.map(g=>({cx:g.cx,cy:g.cy,r:g.r}))};
});
console.log('GEARS geometry:', JSON.stringify(gearGeom));

// Drag a small circle around gear 0's TRUE drawn position — does it engage and which way do gears turn?
const g0=gearGeom.drawn0, R=gearGeom.gears[0].r*gearGeom.scale*0.8;
await page.touchscreen.touchStart(g0.x+R, g0.y);
for(let i=1;i<=10;i++){ // clockwise arc
  const a=i/10*Math.PI; // half turn clockwise
  await page.touchscreen.touchMove(g0.x+R*Math.cos(a), g0.y+R*Math.sin(a));
  await sleep(14);
}
const gs = await page.evaluate(()=>({down:gearDown, drag:gearDrag, angs:GEARS.map(g=>+(g.ang*180/Math.PI).toFixed(1))}));
await page.touchscreen.touchEnd();
console.log('after CLOCKWISE half-turn on gear0 (expect gear0 ang>0):', JSON.stringify(gs));
await page.screenshot({path:OUT+'/gear-1-dragged.png'});

await browser.close();
console.log('DONE');
