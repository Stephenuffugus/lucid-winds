/* Litter Bug play-through with REAL touch events at a device size.
   ROOT=/workspaces/Litter_Bug OUT=<dir> W=412 H=915 STAGES=boot,sort,grub,wire,pry,mint,dump,arena,day2 node lbplay.mjs
   Every tap: find the element by text, take its rect, elementFromPoint at the centre must be the
   element or inside it, then page.touchscreen.tap. A blocked tap is reported, never worked around. */
import puppeteer from "puppeteer";
import { createServer } from "http"; import fs from "fs"; import path from "path";
const ROOT=process.env.ROOT||"/workspaces/Litter_Bug", OUT=process.env.OUT||"./lb";
const W=+process.env.W||412, H=+process.env.H||915;
const STAGES=(process.env.STAGES||"boot,sort,grub,wire,pry,mint,dump,arena,day2").split(",");
const DAYOFF=+process.env.DAYOFF||0;           /* ms added to Date.now() inside the page */
const KEEP=process.env.KEEP==="1";              /* keep localStorage from a previous run (profile dir) */
fs.mkdirSync(OUT,{recursive:true});
const M={".html":"text/html",".js":"text/javascript",".css":"text/css",".png":"image/png",".jpg":"image/jpeg",".svg":"image/svg+xml",".json":"application/json",".webmanifest":"application/manifest+json"};
const s=createServer((q,r)=>{const u=decodeURIComponent(q.url.split("?")[0]);const p=path.join(ROOT,u.endsWith("/")?u+"index.html":u);
if(!fs.existsSync(p)||fs.statSync(p).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{"content-type":M[path.extname(p)]||"application/octet-stream"});r.end(fs.readFileSync(p))});
await new Promise(r=>s.listen(0,"127.0.0.1",r)); const port=s.address().port;
const b=await puppeteer.launch({headless:"new",userDataDir:KEEP?OUT+"/profile":undefined,args:["--no-sandbox","--disable-gpu","--mute-audio","--disable-dev-shm-usage"]});
const pg=await b.newPage(); await pg.setViewport({width:W,height:H,deviceScaleFactor:2,isMobile:true,hasTouch:true});
const errs=[]; pg.on("pageerror",e=>errs.push("pageerror: "+String(e).slice(0,160))); pg.on("console",m=>{ if(m.type()==="error") errs.push("console: "+m.text().slice(0,160)); });
if(DAYOFF) await pg.evaluateOnNewDocument((off)=>{ const R=Date.now; Date.now=()=>R()+off; },DAYOFF);
const log=(...a)=>console.log(...a);
let n=0; const shot=async(name)=>{ n++; const f=`${OUT}/${process.env.PFX||""}${String(n).padStart(2,"0")}-${name}.png`; await pg.screenshot({path:f}); log("shot "+f); };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
/* find + hit-test + real tap. sel narrows the candidate pool; re matches trimmed text. */
async function tap(re, sel, quiet){
  const r=await pg.evaluate((src,sel)=>{
    const re=new RegExp(src,"i");
    const pool=[...document.querySelectorAll(sel||"button,a,[role=button],.bin,.pileitem,.krow,.cs,.card,.mv,.exitpill")];
    const el=pool.find(e=>{ const rr=e.getBoundingClientRect(); return rr.width>8&&rr.height>8&&re.test((e.textContent||"").trim()); });
    if(!el) return {miss:true, seen:pool.filter(e=>e.getBoundingClientRect().width>8).map(e=>(e.textContent||"").trim().slice(0,24))};
    const rr=el.getBoundingClientRect(); const x=rr.left+rr.width/2, y=rr.top+rr.height/2;
    const hit=document.elementFromPoint(x,y); const okHit=hit&&(hit===el||el.contains(hit));
    const on=x>=0&&y>=0&&x<=innerWidth&&y<=innerHeight;
    const nm=e=>e?e.tagName.toLowerCase()+(e.id?"#"+e.id:"")+(e.className&&typeof e.className==="string"?"."+e.className.split(/\s+/)[0]:""):"null";
    return {x,y,w:rr.width,h:rr.height,okHit,on,hit:nm(hit),label:(el.textContent||"").trim().slice(0,28)};
  },re.source||re,sel);
  if(r.miss){ log("TAP /"+re+"/ MISSING. seen: "+JSON.stringify(r.seen.slice(0,12))); return false; }
  if(!r.on||!r.okHit){ log(`TAP "${r.label}" BLOCKED at (${r.x|0},${r.y|0}) ${r.w|0}x${r.h|0} on:${r.on} top:${r.hit}`); return false; }
  await pg.touchscreen.tap(r.x,r.y);
  if(!quiet) log(`tap "${r.label}" (${r.x|0},${r.y|0}) ${r.w|0}x${r.h|0}${r.h*1<48?" ⚠ <48px":""}`);
  return true;
}
const cur=()=>pg.evaluate(()=>window.LB_DEV?window.LB_DEV.cur():document.querySelector(".screen.on")?.id);
const state=()=>pg.evaluate(()=>{ const G=window.LB_DEV&&window.LB_DEV.state(); return G?{kind:G.kind,t:G.t,score:G.score,over:G.over,round:G.round,level:G.level,lids:G.lids}:null; });
const visibleText=()=>pg.evaluate(()=>{ const out=[]; const scr=document.querySelector(".screen.on"); if(!scr) return out;
  for(const e of scr.querySelectorAll("*")){ if(e.children.length) continue; const t=(e.textContent||"").trim(); if(!t) continue; const r=e.getBoundingClientRect(); if(r.width<2||r.height<2) continue;
    const vis=r.bottom>0&&r.top<innerHeight; out.push((vis?"":"OFF ")+t.slice(0,60)); } return out; });
async function waitScreen(id, ms){ const t0=Date.now(); while(Date.now()-t0<ms){ if((await cur())===id) return true; await sleep(250);} return false; }
async function bootShots(){
  await pg.goto(`http://127.0.0.1:${port}/index.html?lbtest=1`,{waitUntil:"load",timeout:45000}); await sleep(1500);
  log("boot screen: "+await cur()); await shot("boot"); log("boot text: "+JSON.stringify(await visibleText()).slice(0,600));
  if((await cur())==="s-how"){ await tap(/^got it$/i); await sleep(600); }
  await shot("home"); log("home text: "+JSON.stringify(await visibleText()).slice(0,400));
  await tap(/^bugdex$/i); await sleep(600); await shot("dex-empty"); log("dex text: "+JSON.stringify(await visibleText()));
  await tap(/^back$/i); await sleep(400);
  await tap(/dumpster/i); await sleep(600); await shot("dump-locked"); log("dump text: "+JSON.stringify(await visibleText()));
  await tap(/^back$/i); await sleep(400);
  await tap(/how to play/i); await sleep(500); await shot("howto-again"); await tap(/^got it$/i); await sleep(400);
}
async function goHome(){ for(let i=0;i<4;i++){ const c=await cur(); if(c==="s-home") return true; if(c==="s-done"){ await tap(/^home$/i); } else if(c==="s-how"){ await tap(/^got it$/i); } else if(c==="s-mint"){ await tap(/into the bugdex/i); } else if(c==="s-arena"){ await tap(/leave the dumpster|back to the ladder/i); } else { await tap(/^back$/i); } await sleep(500); } return (await cur())==="s-home"; }
async function openBlock(){ if((await cur())!=="s-block"){ if((await cur())==="s-done"){ await tap(/another block|that is the lot/i); } else { await goHome(); await tap(/scavenge|picked clean/i); } await sleep(600); } log("block screen: "+await cur()); }
async function playSort(){
  await openBlock(); await shot("block-picker"); log("block text: "+JSON.stringify(await visibleText()));
  await tap(/sort the recycling/i); await sleep(1200); await shot("sort-early");
  let shots=0; const t0=Date.now();
  while(true){ const st=await state(); if(!st||st.over||st.kind!=="sort") break;
    const mat=await pg.evaluate(()=>{ const G=window.LB_DEV.state(); const p=G&&G.pieces&&G.pieces[G.active]; return p?p.mat:null; });
    if(mat){ await tap(new RegExp("^"+mat,"i"), ".bin", true); await sleep(650); } else await sleep(200);
    if(Date.now()-t0>20000&&shots===0){ shots++; await shot("sort-mid"); log("sort mid state "+JSON.stringify(await state())); }
    if(Date.now()-t0>70000) break; }
  await waitScreen("s-done",8000); log("sort done state: "+JSON.stringify(await state())); await shot("sort-done"); log("done text: "+JSON.stringify(await visibleText()));
}
async function playGrub(){
  await openBlock(); await tap(/grub hunt/i); await sleep(1200); await shot("grub-r1");
  let lastRound=0, t0=Date.now();
  while(true){ const st=await state(); if(!st||st.over||st.kind!=="grub") break;
    if(st.round!==lastRound){ lastRound=st.round; if(st.round===4||st.round===8) await shot("grub-r"+st.round); }
    const g=await pg.evaluate(()=>{ const els=[...document.querySelectorAll(".pileitem")]; const el=els.find(e=>e.innerHTML.indexOf('cx="49" cy="28"')>=0); if(!el) return null; const r=el.getBoundingClientRect(); const x=r.left+r.width/2,y=r.top+r.height/2; const hit=document.elementFromPoint(x,y); return {x,y,ok:hit===el||el.contains(hit),w:r.width,h:r.height,n:els.length,hit:hit?hit.className:""}; });
    if(g){ if(!g.ok){ log("grub BLOCKED by "+g.hit+" round "+st.round); await sleep(500); } else { await pg.touchscreen.tap(g.x,g.y); if(st.round<=2) log(`grub tap r${st.round} (${g.x|0},${g.y|0}) ${g.w|0}x${g.h|0} of ${g.n}`); await sleep(900);} } else await sleep(300);
    if(Date.now()-t0>70000) break; }
  await waitScreen("s-done",8000); log("grub done: "+JSON.stringify(await state())); await shot("grub-done");
}
async function playWire(){
  await openBlock(); await tap(/wire untangle/i); await sleep(1200); await shot("wire-r1");
  let t0=Date.now(), rounds=0, lastLevel=0;
  while(true){ const st=await state(); if(!st||st.over||st.kind!=="wire") break;
    if(st.level!==lastLevel){ lastLevel=st.level; rounds++; if(st.level===3) await shot("wire-r3"); }
    /* target: convex ring in index order = zero crossings. drag each pin with a real touch. */
    const plan=await pg.evaluate(()=>{ const G=window.LB_DEV.state(); const f=document.getElementById("p-field"); const fr=f.getBoundingClientRect(); const sc=fr.width/f.clientWidth;
      const n=G.pins.length, cx=f.clientWidth/2, cy=f.clientHeight/2, rad=Math.min(f.clientWidth,f.clientHeight)/2-60; const out=[];
      for(let i=0;i<n;i++){ const a=(i/n)*Math.PI*2-Math.PI/2; const tx=cx+Math.cos(a)*rad, ty=cy+Math.sin(a)*rad*(f.clientHeight>f.clientWidth?1.3:1);
        const pr=G.pinEls[i].getBoundingClientRect(); const px=pr.left+pr.width/2, py=pr.top+pr.height/2; const hit=document.elementFromPoint(px,py);
        out.push({from:[px,py],to:[fr.left+tx*sc, fr.top+ty*sc],ok:hit===G.pinEls[i]||G.pinEls[i].contains(hit),w:pr.width}); } return out; });
    for(const p of plan){ if(!p.ok){ log("pin BLOCKED"); continue; }
      await pg.touchscreen.touchStart(p.from[0],p.from[1]); for(let k=1;k<=6;k++){ await pg.touchscreen.touchMove(p.from[0]+(p.to[0]-p.from[0])*k/6, p.from[1]+(p.to[1]-p.from[1])*k/6); await sleep(16);} await pg.touchscreen.touchEnd(); await sleep(120);
      const st2=await state(); if(!st2||st2.level!==st.level) break; }
    await sleep(600); const st3=await state(); if(st3&&st3.level===st.level){ const x=await pg.evaluate(()=>{ const G=window.LB_DEV.state(); return G.pins.map(p=>[p.x|0,p.y|0]); }); log("wire level "+st.level+" still knotted after a full ring drag: "+JSON.stringify(x)); await sleep(1500); }
    if(Date.now()-t0>70000) break; }
  await waitScreen("s-done",8000); log("wire done: "+JSON.stringify(await state())+" rounds "+rounds); await shot("wire-done");
}
async function playPry(){
  await openBlock(); await tap(/pry the lids/i); await sleep(1000); await shot("pry-early");
  let t0=Date.now(), taps=0;
  while(true){ const st=await state(); if(!st||st.over||st.kind!=="pry") break;
    const inz=await pg.evaluate(()=>{ const G=window.LB_DEV.state(); return G.pos>=G.zoneAt+G.zone*0.2&&G.pos<=G.zoneAt+G.zone*0.8; });
    if(inz){ const ok=await tap(/^pry$/i, "button", true); if(ok) taps++; await sleep(300); if(taps===4) await shot("pry-mid"); } else await sleep(40);
    if(Date.now()-t0>70000) break; }
  await waitScreen("s-done",8000); log("pry done: "+JSON.stringify(await state())+" taps "+taps); await shot("pry-done"); log("done text: "+JSON.stringify(await visibleText()));
}
async function doMint(){
  let c=await cur(); log("mint from "+c); if(c!=="s-done"&&c!=="s-home"){ await goHome(); c=await cur(); }
  if(c==="s-done"){ if(!(await tap(/open the jar/i))){ await tap(/^home$/i); await sleep(500); await tap(/a bug is ready/i);} }
  else { await tap(/a bug is ready/i); }
  await sleep(1500); await shot("mint"); log("mint text: "+JSON.stringify(await visibleText()));
  await tap(/into the bugdex/i); await sleep(700); await shot("home-with-bug");
  await tap(/^bugdex$/i); await sleep(600); await shot("dex-one"); await tap(/.+/,".card"); await sleep(600); await shot("specimen"); log("spec text: "+JSON.stringify(await visibleText()));
  await tap(/^back$/i); await sleep(400); await tap(/^back$/i); await sleep(400);
}
async function doDump(){ if((await cur())!=="s-home") await goHome(); await tap(/dumpster/i); await sleep(800); await shot("dump-open"); log("dump text: "+JSON.stringify(await visibleText())); }
async function doArena(){
  if((await cur())!=="s-dump") await doDump();
  const ok=await tap(/◆/,".krow"); if(!ok) return; await sleep(1000); await shot("arena-open"); log("arena text: "+JSON.stringify(await visibleText()).slice(0,900));
  let rounds=0;
  while(rounds<12){ const over=await pg.evaluate(()=>document.getElementById("a-over").classList.contains("on")); if(over) break;
    /* pick the move with the highest max damage as a player would read the cards */
    const pick=await pg.evaluate(()=>{ const mv=[...document.querySelectorAll(".mv")]; let best=0,bi=0; mv.forEach((m,i)=>{ const t=m.querySelector(".md")?.textContent||""; const mm=t.match(/(\d+) to (\d+)/); const v=mm?+mm[2]:0; if(v>best){best=v;bi=i;} }); return (mv[bi]?.querySelector(".mn")?.textContent||"").trim(); });
    if(!pick) break; const t=await tap(new RegExp("^"+pick.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")), ".mv"); if(!t) break; rounds++; await sleep(2600);
    if(rounds===1) await shot("arena-r1"); }
  await sleep(800); await shot("arena-over"); log("over text: "+JSON.stringify(await visibleText()).slice(0,500));
  await tap(/back to the ladder/i); await sleep(800); await shot("dump-after"); await tap(/^back$/i); await sleep(500); await shot("home-after-arena");
}
try{
  await pg.goto(`http://127.0.0.1:${port}/index.html?lbtest=1`,{waitUntil:"load"}); await sleep(1200);
  if((await cur())==="s-how"){ await shot("howto"); log("howto text: "+JSON.stringify(await visibleText())); await tap(/^got it$/i); await sleep(500);}
  const feat=await pg.evaluate(()=>window.LB_DEV.featured()); log("featured today: "+feat);
  await tap(/scavenge/i); await sleep(700); await shot("picker-day1"); log("picker text: "+JSON.stringify(await visibleText()));
  const order=await pg.evaluate(()=>[...document.querySelectorAll('#s-block [data-job]')].map(b=>b.getAttribute('data-job')+(b.classList.contains('primary')?'*':'')));
  log("picker order: "+JSON.stringify(order));
  const chip=await pg.evaluate(()=>{ const c=document.querySelector('#s-block .fb'); if(!c) return null; const r=c.getBoundingClientRect(); const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2); return {w:r.width,h:r.height,top:r.top,visible:!!hit&&(hit===c||c.contains(hit)),hit:hit&&hit.className}; });
  log("TODAY chip: "+JSON.stringify(chip));
  const play={sort:playSort,grub:playGrub,wire:playWire,pry:playPry};
  const t0=Date.now(); await play[feat](); const el=(Date.now()-t0)/1000;
  log("featured block played in "+el.toFixed(1)+"s wall, state "+JSON.stringify(await state()));
  log("done text: "+JSON.stringify(await visibleText()));
  await shot("done-featured");
  await tap(/another block|that is the lot/i); await sleep(700); await shot("picker-after-clean"); log("picker text 2: "+JSON.stringify(await visibleText()));
  /* a second block, not featured */
  const other=["sort","grub","wire","pry"].filter(k=>k!==feat)[0];
  await play[other](); log("other block done text: "+JSON.stringify(await visibleText())); await shot("done-other");
  await tap(/^home$/i); await sleep(500);
  if(await tap(/a bug is ready/i)){ await sleep(1500); await shot("mint"); await tap(/into the bugdex/i); await sleep(600); }
  await tap(/^bugdex$/i); await sleep(700); await shot("dex-families"); log("dex text: "+JSON.stringify(await visibleText()));
  const fam=await pg.evaluate(()=>[...document.querySelectorAll('#x-fam .gcell')].map(c=>c.textContent.trim()));
  log("families: "+JSON.stringify(fam));
  await tap(/^back$/i); await sleep(400);
  log("day2: reload with clock +1 day"); await pg.evaluateOnNewDocument(()=>{ const R=Date.now; Date.now=()=>R()+864e5; });
  await pg.goto(`http://127.0.0.1:${port}/index.html?lbtest=1`,{waitUntil:"load"}); await sleep(1200);
  const feat2=await pg.evaluate(()=>window.LB_DEV.featured()); log("featured day 2: "+feat2);
  await tap(/scavenge/i); await sleep(700); await shot("picker-day2"); log("picker day2 text: "+JSON.stringify(await visibleText()));
  const save=await pg.evaluate(()=>window.LB_DEV?JSON.stringify(window.LB_DEV.save()):null); log("SAVE: "+(save||"").slice(0,400));
}catch(e){ log("DRIVER ERROR: "+e.message); await shot("error"); }
log("page errors: "+JSON.stringify(errs));
await b.close(); s.close();
