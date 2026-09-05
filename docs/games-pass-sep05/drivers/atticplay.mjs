/* The Attic play-through with REAL touch events. ROOT=lucid-winds root, page /satellites/attic/?attictest=1
   OUT=<dir> W H PFX. Every tap hit-tested at the element centre, then page.touchscreen.tap. */
import puppeteer from "puppeteer"; import { createServer } from "http"; import fs from "fs"; import path from "path";
const ROOT=process.env.ROOT||"/workspaces/lucid-winds", OUT=process.env.OUT||"./attic", PFX=process.env.PFX||"";
const W=+process.env.W||412, H=+process.env.H||915; fs.mkdirSync(OUT,{recursive:true});
const M={".html":"text/html",".js":"text/javascript",".css":"text/css",".png":"image/png",".jpg":"image/jpeg",".svg":"image/svg+xml",".json":"application/json",".webmanifest":"application/manifest+json",".mp3":"audio/mpeg"};
const s=createServer((q,r)=>{const u=decodeURIComponent(q.url.split("?")[0]);const p=path.join(ROOT,u.endsWith("/")?u+"index.html":u); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()){r.writeHead(404);return r.end()} r.writeHead(200,{"content-type":M[path.extname(p)]||"application/octet-stream"});r.end(fs.readFileSync(p))});
await new Promise(r=>s.listen(0,"127.0.0.1",r)); const port=s.address().port;
const b=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-gpu","--mute-audio","--disable-dev-shm-usage"]});
const pg=await b.newPage(); await pg.setViewport({width:W,height:H,deviceScaleFactor:2,isMobile:true,hasTouch:true});
const errs=[]; pg.on("pageerror",e=>errs.push("pageerror: "+String(e).slice(0,160))); pg.on("console",m=>{ if(m.type()==="error") errs.push("console: "+m.text().slice(0,160)); });
const DAYOFF=+process.env.DAYOFF||0; if(DAYOFF) await pg.evaluateOnNewDocument((off)=>{ const R=Date.now; Date.now=()=>R()+off; },DAYOFF);
const log=(...a)=>console.log(...a); const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let n=0; const shot=async(name)=>{ n++; const f=`${OUT}/${PFX}${String(n).padStart(2,"0")}-${name}.png`; await pg.screenshot({path:f}); log("shot "+f); };
async function tap(re, sel, quiet){
  const r=await pg.evaluate((src,sel)=>{ const re=new RegExp(src,"i");
    const pool=[...document.querySelectorAll(sel||"button,a,[role=button],.slot,.shCard,.want")];
    const cands=pool.filter(e=>{ const rr=e.getBoundingClientRect(); return rr.width>8&&rr.height>8&&re.test((e.textContent||"").trim()); });
    if(!cands.length) return {miss:true, seen:pool.filter(e=>e.getBoundingClientRect().width>8).map(e=>(e.textContent||"").trim().slice(0,22))};
    let el=null, rr, x, y, hit, okHit=false;
    for(const c of cands){ c.scrollIntoView({block:"center"}); rr=c.getBoundingClientRect(); x=rr.left+rr.width/2; y=rr.top+rr.height/2; hit=document.elementFromPoint(x,y); okHit=!!(hit&&(hit===c||c.contains(hit))); el=c; if(okHit) break; }
    const on=x>=0&&y>=0&&x<=innerWidth&&y<=innerHeight;
    const nm=e=>e?e.tagName.toLowerCase()+(e.id?"#"+e.id:"")+(e.className&&typeof e.className==="string"?"."+e.className.split(/\s+/)[0]:""):"null";
    return {x,y,w:rr.width,h:rr.height,okHit,on,hit:nm(hit),label:(el.textContent||"").trim().slice(0,30)}; },re.source||re,sel);
  if(r.miss){ log("TAP /"+re+"/ MISSING. seen: "+JSON.stringify(r.seen.slice(0,14))); return false; }
  if(!r.on||!r.okHit){ log(`TAP "${r.label}" BLOCKED at (${r.x|0},${r.y|0}) ${r.w|0}x${r.h|0} on:${r.on} top:${r.hit}`); return false; }
  await pg.touchscreen.tap(r.x,r.y); if(!quiet) log(`tap "${r.label}" (${r.x|0},${r.y|0}) ${r.w|0}x${r.h|0}${r.h<48||r.w<48?" ⚠ <48px":""}`); return true;
}
const text=()=>pg.evaluate(()=>{ const out=[]; for(const e of document.querySelectorAll("body *")){ if(e.children.length) continue; const t=(e.textContent||"").trim(); if(!t) continue; const r=e.getBoundingClientRect(); if(r.width<2||r.height<2) continue; const cs=getComputedStyle(e); if(cs.visibility==="hidden"||cs.opacity==="0") continue; out.push((r.bottom>0&&r.top<innerHeight?"":"OFF ")+t.slice(0,50)); } return out; });
const tix=()=>pg.evaluate(()=>+document.getElementById("tixN").textContent);
const lines=(sel)=>pg.evaluate((sel)=>{ const el=document.querySelector(sel); if(!el) return null; const rg=document.createRange(); rg.selectNodeContents(el); const rects=[...rg.getClientRects()]; const tops=[...new Set(rects.map(r=>Math.round(r.top)))]; const r=el.getBoundingClientRect(); return {lines:tops.length, h:r.height|0, w:r.width|0}; },sel);
try{
  await pg.goto(`http://127.0.0.1:${port}/satellites/attic/?attictest=1&probe=${Math.random().toString(36).slice(2)}`,{waitUntil:"load",timeout:45000}); await sleep(2500);
  await shot("boot"); log("boot text: "+JSON.stringify(await text()).slice(0,300));
  await tap(/start digging/i); await sleep(800); await shot("hub"); log("hub text: "+JSON.stringify(await text()));
  log("tickets "+await tix());
  await tap(/^rummage/i); await sleep(1200); await shot("card-dusty"); log("card text: "+JSON.stringify(await text()).slice(0,900));
  log("wipe button lines: "+JSON.stringify(await lines("#gb")));
  log("contrast probe meta: "+await pg.evaluate(()=>{ const m=document.querySelector('.meta'); return m?getComputedStyle(m).color+" on "+getComputedStyle(m.parentElement).backgroundColor:null; }));
  await tap(/wipe off the dust/i); await sleep(400); await shot("wipe-mid"); await sleep(1200); await shot("card-revealed"); log("revealed text: "+JSON.stringify(await text()).slice(0,600));
  log("tickets after wipe "+await tix());
  await tap(/^the shelf/i); await sleep(800); await shot("shelf"); log("shelf text: "+JSON.stringify(await text()).slice(0,400));
  const cardOk=await tap(/.+/,".shCard"); await sleep(900); await shot("findcard-front"); log("findcard: "+JSON.stringify(await text()).slice(0,500));
  if(cardOk){ await pg.evaluate(()=>{ const f=document.getElementById('fcFlip'); const r=f.getBoundingClientRect(); window.__fc=[r.left+r.width/2,r.top+r.height/2]; }); const c=await pg.evaluate(()=>window.__fc); await pg.touchscreen.tap(c[0],c[1]); await sleep(900); await shot("findcard-back"); log("back text: "+JSON.stringify(await text()).slice(0,600)); await tap(/^close$/i); await sleep(400); }
  await tap(/^close$/i); await sleep(500);
  await tap(/^want list/i); await sleep(700); await shot("wantlist"); log("want text: "+JSON.stringify(await text()).slice(0,700)); await tap(/^close$/i); await sleep(400);
  /* DUST OFF with a real drag */
  await tap(/^dust off$/i); await sleep(900); await shot("dust-open"); log("dust text: "+JSON.stringify(await text()).slice(0,400));
  const st=await pg.evaluate(()=>{ const r=document.getElementById('dustStage').getBoundingClientRect(); return {x:r.left,y:r.top,w:r.width,h:r.height}; });
  log("dust stage rect "+JSON.stringify(st));
  const t0=Date.now(); let rows=0;
  for(let pass=0; pass<3 && Date.now()-t0<12000; pass++){ for(let yy=st.y+12; yy<st.y+st.h-12; yy+=14){ rows++;
    await pg.touchscreen.touchStart(st.x+8,yy); for(let k=1;k<=8;k++){ await pg.touchscreen.touchMove(st.x+8+(st.w-16)*k/8, yy+(k%2?3:-3)); await sleep(8);} await pg.touchscreen.touchEnd(); }
    if(pass===0){ await shot("dust-mid"); log("dust state after one pass: "+JSON.stringify(await pg.evaluate(()=>window.ATTIC_DEV&&window.ATTIC_DEV.dustState()))); } }
  log("dust state after drags: "+JSON.stringify(await pg.evaluate(()=>window.ATTIC_DEV&&window.ATTIC_DEV.dustState())));
  await tap(/^done$/i); await sleep(900); await shot("dust-done"); log("after dust text: "+JSON.stringify(await text()).slice(0,300)+" tickets "+await tix());
  /* tickets to zero */
  let guard=0; while((await tix())>0 && guard++<20){ await tap(/^rummage/i, null, true); await sleep(700); }
  log("tickets now "+await tix()); await shot("tickets-zero"); log("zero text: "+JSON.stringify(await text()).slice(0,500));
  await tap(/^rummage/i); await sleep(700); await shot("rummage-at-zero"); log("at zero: "+JSON.stringify(await text()).slice(0,300));
  await tap(/today.s find/i); await sleep(1200); await shot("todays-find"); log("daily text: "+JSON.stringify(await text()).slice(0,400));
  /* day two */
  await pg.evaluateOnNewDocument(()=>{ const R=Date.now; Date.now=()=>R()+864e5; });
  await pg.goto(`http://127.0.0.1:${port}/satellites/attic/?attictest=1&probe=${Math.random().toString(36).slice(2)}`,{waitUntil:"load",timeout:45000}); await sleep(2200);
  await shot("day2-hub"); log("day2: "+JSON.stringify(await text()).slice(0,400)+" tickets "+await tix());
}catch(e){ log("DRIVER ERROR: "+e.message); await shot("error"); }
log("page errors: "+JSON.stringify(errs)); await b.close(); s.close();
