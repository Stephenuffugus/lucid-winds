import puppeteer from "puppeteer";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox"]});
const p=await br.newPage();
const errs=[];p.on("pageerror",e=>errs.push(String(e).slice(0,120)));
await p.setViewport({width:915,height:412,deviceScaleFactor:2,isMobile:true,hasTouch:true});
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem("sws_dev_ok","1");}catch(e){}});
await p.goto("http://127.0.0.1:8777/satellites/flock-the-world/?probe="+Math.random(),{waitUntil:"domcontentloaded"});
await sleep(2600);
await p.evaluate(()=>document.getElementById("startBtn").click()); await sleep(1300);
for(const [fx,fy] of [[0.5,0.45],[0.3,0.4],[0.62,0.5]]){
  const b=await p.evaluate((fx,fy)=>{const c=document.getElementById("pickMap");const r=c.getBoundingClientRect();return{x:r.x+r.width*fx,y:r.y+r.height*fy};},fx,fy);
  await p.touchscreen.tap(b.x,b.y); await sleep(450);
  if(await p.evaluate(()=>!document.getElementById("beginBtn").disabled)) break;
}
await p.evaluate(()=>{const i=document.getElementById("coInput");i.value="Vigil";i.dispatchEvent(new Event("input",{bubbles:true}));});
await p.evaluate(()=>document.getElementById("beginBtn").click()); await sleep(2200);
/* give the player money and open the World tab the way a player does */
await p.evaluate(()=>{S.cash=400*MONEY;});  /* the fixture moved with the unit */
await p.evaluate(()=>document.querySelector('.nb[data-tab="reg"]').click()); await sleep(1300);
/* the sheet scrolls, so scroll it into view the way a thumb would before asking
   whether the tap lands. Below the fold is not the same as unreachable. */
await p.evaluate(()=>{const b=document.getElementById('acqBtn');
  if(b)b.scrollIntoView({block:'center'});});
await sleep(500);
const before=await p.evaluate(()=>{
  const b=document.getElementById('acqBtn'); if(!b)return{err:'no acqBtn in the DOM'};
  const r=b.getBoundingClientRect();
  const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
  return {label:(b.textContent||'').trim(),w:Math.round(r.width),h:Math.round(r.height),
    disabled:b.disabled, tapLands:!!hit&&(hit===b||b.contains(hit)),
    x:r.left+r.width/2,y:r.top+r.height/2,
    cash:Math.round(S.cash),
    cov:+Object.keys(S.regions).reduce((a,k)=>a+S.regions[k].coverage,0).toFixed(4)};
});
console.log('BEFORE  '+JSON.stringify(before));
if(before.err||!before.tapLands){console.log('CANNOT TAP IT');await br.close();process.exit(1);}
await p.touchscreen.tap(before.x,before.y); await sleep(1200);
console.log('AFTER   '+JSON.stringify(await p.evaluate(()=>{
  const b=document.getElementById('acqBtn');
  return {cash:Math.round(S.cash),acqHeat:+(S.acqHeat||0).toFixed(2),
    cov:+Object.keys(S.regions).reduce((a,k)=>a+S.regions[k].coverage,0).toFixed(4),
    newLabel:b?(b.textContent||'').trim():'(gone)'};
})));
await p.screenshot({path:"/workspaces/lucid-winds/portal-assets/review/ftw-landscape-aug24/05_acquisition.png"});
/* THE DESK: is it there, is it three offers, and can a player buy one */
const desk=await p.evaluate(()=>{
  const ops=[...document.querySelectorAll('[data-op]')];
  if(!ops.length)return{err:'no desk offers in the DOM'};
  return {count:ops.length, offers:ops.map(o=>({
    id:o.dataset.op,
    name:(o.querySelector('.opn')||{}).textContent,
    cost:(o.querySelector('.opc')||{}).textContent,
    h:Math.round(o.getBoundingClientRect().height)}))};
});
console.log('DESK    '+JSON.stringify(desk));
if(!desk.err){
  await p.evaluate(()=>{document.querySelector('[data-op]').scrollIntoView({block:'center'});});
  await sleep(500);
  const t=await p.evaluate(()=>{const o=document.querySelector('[data-op]');
    const r=o.getBoundingClientRect(); const x=r.left+r.width/2,y=r.top+r.height/2;
    const hit=document.elementFromPoint(x,y);
    return {ok:!!hit&&(hit===o||o.contains(hit)),x,y,id:o.dataset.op,cashBefore:Math.round(S.cash)};});
  if(!t.ok){console.log('DESK TAP DOES NOT LAND');}
  else{
    await p.touchscreen.tap(t.x,t.y); await sleep(1200);
    console.log('BOUGHT  '+JSON.stringify(await p.evaluate(o=>({
      wanted:o, cashAfter:Math.round(S.cash), dcs:S.dcs||0,
      oversight:+((S.oversight)||0).toFixed(1), inf:S.inf,
      deskNow:[...document.querySelectorAll('[data-op]')].map(x=>x.dataset.op)
    }),t.id)));
  }
}
await p.evaluate(()=>{const d=document.querySelector('.desk');if(d)d.scrollIntoView({block:'center'});});
await sleep(500);
await p.screenshot({path:"/workspaces/lucid-winds/portal-assets/review/ftw-landscape-aug24/09_desk.png"});
console.log(errs.length?'ERRORS '+errs[0]:'no page errors');
await br.close();
