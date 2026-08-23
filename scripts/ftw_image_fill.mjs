/* Stephen, 2026-08-24: "almost every single image is shrunken too much and should
   be bigger and fill whatever box they're in... there were large gaps around many
   of them." This measures every visible <img> on every screen: what it is, the box
   it sits in, how much of that box it covers, and whether the gap is an ASPECT
   mismatch (a square image in a wide box) or just an undersized rule. */
import puppeteer from "puppeteer";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const L={width:915,height:412,deviceScaleFactor:2,isMobile:true,hasTouch:true};
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox"]});
const p=await br.newPage();
await p.setViewport(L);
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem("sws_dev_ok","1");}catch(e){}});
await p.goto("http://127.0.0.1:8777/satellites/flock-the-world/?probe="+Math.random(),{waitUntil:"domcontentloaded"});
await sleep(2800);
const MEASURE=`(()=>{
  const out=[];
  document.querySelectorAll('img').forEach(im=>{
    const r=im.getBoundingClientRect(); if(r.width<3||r.height<3)return;
    const par=im.parentElement, pr=par?par.getBoundingClientRect():null; if(!pr||pr.width<3)return;
    const cs=getComputedStyle(im);
    const nat=im.naturalWidth&&im.naturalHeight?im.naturalWidth/im.naturalHeight:null;
    const boxA=pr.width/pr.height;
    out.push({
      src:(im.currentSrc||im.src||'').split('/').slice(-2).join('/'),
      nat:im.naturalWidth+'x'+im.naturalHeight,
      img:Math.round(r.width)+'x'+Math.round(r.height),
      box:Math.round(pr.width)+'x'+Math.round(pr.height),
      areaPct:Math.round(100*(r.width*r.height)/(pr.width*pr.height)),
      fit:cs.objectFit,
      aspectGap: nat&&boxA ? Math.round(100*Math.abs(nat-boxA)/Math.max(nat,boxA)) : null
    });
  });
  return out;
})()`;
const seen=new Map();
async function sweep(label){
  const rows=await p.evaluate(MEASURE);
  rows.forEach(r=>{ const k=label+'|'+r.src; if(!seen.has(k)) seen.set(k,{...r,screen:label}); });
  return rows.length;
}
console.log('menu           imgs:',await sweep('menu'));
await p.evaluate(()=>document.getElementById("startBtn").click()); await sleep(1400);
console.log('briefing/pick  imgs:',await sweep('pick'));
for(const [fx,fy] of [[0.5,0.45],[0.3,0.4],[0.62,0.5]]){
  const b=await p.evaluate((fx,fy)=>{const c=document.getElementById("pickMap");const r=c.getBoundingClientRect();return{x:r.x+r.width*fx,y:r.y+r.height*fy};},fx,fy);
  await p.touchscreen.tap(b.x,b.y); await sleep(450);
  if(await p.evaluate(()=>!document.getElementById("beginBtn").disabled))break;
}
await p.evaluate(()=>{const i=document.getElementById("coInput");i.value="Vigil";i.dispatchEvent(new Event("input",{bubbles:true}));});
await p.evaluate(()=>document.getElementById("beginBtn").click()); await sleep(2400);
console.log('game/map       imgs:',await sweep('map'));
for(const t of ['led','dep','cap','inf','war','reg','log']){
  const ok=await p.evaluate(x=>{const b=document.querySelector('.nb[data-tab="'+x+'"]');if(!b)return false;b.click();return true;},t);
  if(!ok){console.log('tab '+t+' missing');continue;}
  await sleep(1300);
  console.log('tab '+t.padEnd(10)+' imgs:',await sweep('tab:'+t));
  await p.evaluate(()=>{try{closeSheet();}catch(e){}}); await sleep(400);
}
const gotEv=await p.evaluate(()=>{try{for(let i=0;i<400;i++){maybeEvent(S);if(document.querySelector('#modal.on,.modal.on'))return true;}}catch(e){return false}return false;});
if(gotEv){await sleep(900);console.log('event modal    imgs:',await sweep('event'));}
console.log('\n=== EVERY VISIBLE IMAGE, worst fill first ===');
const all=[...seen.values()].sort((a,b)=>a.areaPct-b.areaPct);
console.log('  fill  aspectGap  rendered     in box       fit        native      screen / file');
all.forEach(r=>console.log(
  '  '+String(r.areaPct+'%').padStart(5)
 +'  '+String(r.aspectGap==null?'-':r.aspectGap+'%').padStart(9)
 +'  '+r.img.padEnd(11)+'  '+r.box.padEnd(11)+'  '+String(r.fit).padEnd(9)+'  '+r.nat.padEnd(10)
 +'  '+r.screen+' / '+r.src));
const bad=all.filter(r=>r.areaPct<50);
console.log('\n  '+all.length+' visible images, '+bad.length+' covering under half their box');
const aspect=all.filter(r=>r.aspectGap!=null&&r.aspectGap>25);
console.log('  '+aspect.length+' with an aspect mismatch over 25% (a square image in a wide box, or the reverse)');
await br.close();
