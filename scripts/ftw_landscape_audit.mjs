/* Stephen's Aug 24 notes on Flock the World, measured rather than eyeballed.
   Landscape 915x412 is the intended play orientation. Every step asserts the
   live screen before it measures, and every tap is refused unless
   elementFromPoint at the control's centre actually hits it. */
import puppeteer from "puppeteer";
const OUT="/workspaces/lucid-winds/portal-assets/review/ftw-landscape-aug24";
import fs from "fs"; fs.mkdirSync(OUT,{recursive:true});
const L={width:915,height:412,deviceScaleFactor:2,isMobile:true,hasTouch:true};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox"]});
const p=await br.newPage();
const errs=[];
p.on("pageerror",e=>errs.push("pageerror: "+String(e).slice(0,160)));
p.on("console",m=>{if(m.type()==="error")errs.push("console: "+m.text().slice(0,140));});
await p.evaluateOnNewDocument(()=>{
  try{localStorage.setItem("sws_dev_ok","1");}catch(e){}
  const hide=()=>{const s=document.createElement("style");
    s.textContent=".lwfb-fab,#lwfb-fab,[id*=lwfb]{display:none !important}";document.head.appendChild(s);};
  if(document.head)hide(); else document.addEventListener("DOMContentLoaded",hide);
});
await p.setViewport(L);
await p.goto("http://127.0.0.1:8777/satellites/flock-the-world/?probe="+Math.random(),{waitUntil:"domcontentloaded"});
await sleep(3000);
const live=()=>p.evaluate(()=>{const on=[...document.querySelectorAll(".screen")].filter(e=>e.classList.contains("on")).map(e=>e.id);return on.length?on.join(","):"(game)";});
async function shot(n){await p.screenshot({path:`${OUT}/${n}.png`});console.log("  shot "+n+"  screen="+await live());}
/* into the game */
await p.evaluate(()=>document.getElementById("startBtn").click()); await sleep(1500);
let picked=false;
for(const [fx,fy] of [[0.50,0.45],[0.30,0.40],[0.62,0.50],[0.45,0.35],[0.70,0.55]]){
  const b=await p.evaluate((fx,fy)=>{const c=document.getElementById("pickMap");const r=c.getBoundingClientRect();return{x:r.x+r.width*fx,y:r.y+r.height*fy};},fx,fy);
  await p.touchscreen.tap(b.x,b.y); await sleep(600);
  if(await p.evaluate(()=>!document.getElementById("beginBtn").disabled)){picked=true;break;}
}
console.log("  country picked:",picked);
await p.evaluate(()=>{const i=document.getElementById("coInput");i.value="Vigil Systems";i.dispatchEvent(new Event("input",{bubbles:true}));});
await sleep(400);
await p.evaluate(()=>document.getElementById("beginBtn").click()); await sleep(2600);
console.log("  in game:",await live());
await shot("01_map_landscape");

/* ---- 1. how much of the screen is the map, and does the whole map fit ---- */
console.log("\n== MAP AND HUD ==");
console.log(JSON.stringify(await p.evaluate(()=>{
  const hud=document.getElementById('hud'), wrap=document.getElementById('mapWrap');
  const hb=hud?hud.getBoundingClientRect():null, wb=wrap?wrap.getBoundingClientRect():null;
  const v=(typeof gv!=='undefined')?gv:null;
  return {
    screen:[innerWidth,innerHeight],
    hud: hb?{h:Math.round(hb.height), pctOfScreen:+(100*hb.height/innerHeight).toFixed(1)}:null,
    mapWrap: wb?{w:Math.round(wb.width),h:Math.round(wb.height)}:null,
    view: v?{z:+v.z.toFixed(4), containZ:+v.containZ.toFixed(4), inset:Math.round(v.inset||0),
             mapDrawn:[Math.round(PW*v.z),Math.round(PH*v.z)],
             wholeMapVisible: (PW*v.z<=v.w+1)&&(PH*v.z<=v.h-(v.inset||0)+1)}:null,
  };
}),null,1));

/* ---- 2. bubbles: size, tap target, lifetime ---- */
console.log("\n== BUBBLES ==");
console.log(JSON.stringify(await p.evaluate(()=>{
  const out={cfgLife:(typeof CFG!=='undefined')?CFG.bubbleLife:null, spawned:0, samples:[]};
  try{ for(let i=0;i<40;i++) if(typeof spawnBubble==='function') spawnBubble(S); }catch(e){ out.err=String(e).slice(0,90); }
  const bs=(S&&S.bubbles)||[];
  out.spawned=bs.length;
  out.samples=bs.slice(0,4).map(b=>({k:b.k, life:b.life!=null?+(+b.life).toFixed(1):null, x:Math.round(b.x||0), y:Math.round(b.y||0)}));
  return out;
}),null,1));

/* ---- 3. every image: is it filling its box ---- */
console.log("\n== IMAGE FILL (rendered box vs the space it sits in) ==");
console.log(await p.evaluate(()=>{
  const rows=[];
  document.querySelectorAll('img').forEach(im=>{
    const r=im.getBoundingClientRect(); if(r.width<4||r.height<4) return;
    const par=im.parentElement, pr=par?par.getBoundingClientRect():null;
    if(!pr||pr.width<4) return;
    const fillW=100*r.width/pr.width, fillH=100*r.height/pr.height;
    const cs=getComputedStyle(im);
    rows.push({src:(im.currentSrc||im.src||'').split('/').pop().slice(0,26),
      box:Math.round(pr.width)+'x'+Math.round(pr.height),
      img:Math.round(r.width)+'x'+Math.round(r.height),
      fill:Math.round(Math.min(fillW,fillH))+'%',
      fit:cs.objectFit, nat:im.naturalWidth+'x'+im.naturalHeight});
  });
  if(!rows.length) return '  (no visible img elements on this screen)';
  return rows.map(r=>'  '+r.fill.padStart(5)+'  '+r.img.padEnd(11)+' in '+r.box.padEnd(11)+' fit='+String(r.fit).padEnd(8)+' nat='+r.nat.padEnd(11)+' '+r.src).join('\n');
}));

/* ---- 4. the skill trees: how much can you see at once ---- */
for(const [tab,label] of [['dep','02_tree_deployment'],['cap','03_tree_watchlist']]){
  const ok=await p.evaluate(t=>{const b=document.querySelector('.nb[data-tab="'+t+'"]');if(!b)return false;b.click();return true;},tab);
  if(!ok){console.log("  tab "+tab+" not found");continue;}
  await sleep(1500);
  await shot(label);
  console.log("\n== TREE "+tab+" ==");
  console.log(JSON.stringify(await p.evaluate(()=>{
    const sh=document.querySelector('.sheet.on,#sheet.on')||document.getElementById('sheet');
    if(!sh) return {err:'no sheet'};
    const sb=sh.getBoundingClientRect();
    const nodes=[...sh.querySelectorAll('.node,.tnode,[data-node]')];
    const vis=nodes.filter(n=>{const r=n.getBoundingClientRect();return r.bottom>sb.top&&r.top<sb.bottom&&r.height>4;});
    const imgs=[...sh.querySelectorAll('img')];
    const fills=imgs.map(im=>{const r=im.getBoundingClientRect();const pr=im.parentElement.getBoundingClientRect();
      return pr.width>4?Math.round(100*Math.min(r.width/pr.width,r.height/pr.height)):null;}).filter(v=>v!=null);
    return {sheet:Math.round(sb.width)+'x'+Math.round(sb.height),
      sheetPctOfScreen:+(100*sb.height/innerHeight).toFixed(0),
      nodesTotal:nodes.length, nodesVisible:vis.length,
      scrollH:sh.scrollHeight, clientH:sh.clientHeight,
      screensOfScroll:+(sh.scrollHeight/Math.max(1,sh.clientHeight)).toFixed(2),
      imgCount:imgs.length, imgFillPct:fills};
  }),null,1));
  await p.evaluate(()=>{try{closeSheet();}catch(e){document.querySelectorAll('.sheet.on').forEach(e=>e.classList.remove('on'));}});
  await sleep(600);
}
console.log("\n--- page errors ---");
console.log(errs.length?[...new Set(errs)].slice(0,6).join("\n"):"none");
await br.close();
