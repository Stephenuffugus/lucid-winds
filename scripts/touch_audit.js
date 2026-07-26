#!/usr/bin/env node
/* Studio-wide touch-target audit — RENDERED pixels, the honest measurement.
 *
 * ⛔ THE LAW (memory: touch-targets-measure-rendered-px): most satellites scale
 * a fixed 540x960 stage to the phone, so CSS px lie by the stage scale (~0.72
 * at 390w). 48 CSS px renders ~35 real px. This audits getBoundingClientRect
 * at a real phone viewport, so its numbers are what a thumb actually gets.
 *
 * Scope, stated honestly: it measures the screens it can reach generically —
 * the landing/menu screen, plus one click into an obvious play/start gate if
 * present. Deep screens (shops, results) need per-game probes; the menu is
 * where the shared .btn template lives, so this ranks the fleet fairly.
 *
 * USAGE  node scripts/touch_audit.js [minPx]      # default threshold 48
 * OUTPUT one line per game: worst control size + count under threshold,
 *        sorted worst-first. Exit 0 always (it is a report, not a gate).
 */
const puppeteer = require('puppeteer');
const path = require('path'); const http = require('http'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const MIN = parseFloat(process.argv[2] || '48');
const MIME = { '.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png',
               '.jpg':'image/jpeg','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.mp3':'audio/mpeg' };
function serve(){ return new Promise(r=>{ const s=http.createServer((q,res)=>{
  let p=decodeURIComponent(q.url.split('?')[0]); if(p.endsWith('/'))p+='index.html';
  const f=path.join(ROOT,p);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end('x');}
  res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});
  fs.createReadStream(f).pipe(res); }); s.listen(0,'127.0.0.1',()=>r(s)); }); }

const MEASURE = `(() => {
  const els=[...document.querySelectorAll('button,a[href],[onclick],[role=button],input[type=range],input[type=checkbox],select,.btn,.tbtn')];
  const out=[];
  for(const el of els){
    const r=el.getBoundingClientRect();
    if(r.width<4||r.height<4)continue;                       // display:none-ish
    if(r.bottom<0||r.top>window.innerHeight)continue;        // offscreen
    const cs=getComputedStyle(el);
    if(cs.visibility==='hidden'||cs.pointerEvents==='none')continue;
    // credit pseudo-element tap zones the way the sweep builds them
    let w=r.width,h=r.height;
    for(const pe of ['::before','::after']){
      const ps=getComputedStyle(el,pe);
      if(ps.content!=='none'&&ps.position==='absolute'){
        const pw=parseFloat(ps.width)||0, ph=parseFloat(ps.height)||0;
        if(pw>w)w=pw; if(ph>h)h=ph;
      }
    }
    out.push({t:(el.textContent||el.className||el.tagName).trim().slice(0,22),w:+w.toFixed(1),h:+h.toFixed(1),m:+Math.min(w,h).toFixed(1)});
  }
  return out;
})()`;

(async () => {
  const srv=await serve();
  const browser=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage']});
  const sats=fs.readdirSync(path.join(ROOT,'satellites')).filter(d=>{
    try{ return fs.existsSync(path.join(ROOT,'satellites',d,'index.html')); }catch(e){ return false; }
  }).sort();
  const rows=[];
  for(const slug of sats){
    const page=await browser.newPage();
    await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
    let controls=[],err='';
    try{
      await page.goto('http://127.0.0.1:'+srv.address().port+'/satellites/'+slug+'/index.html',
        {waitUntil:'domcontentloaded',timeout:20000});
      await new Promise(r=>setTimeout(r,1800));
      controls=await page.evaluate(MEASURE);
      // one hop through an obvious gate, measuring both screens
      const hopped=await page.evaluate(()=>{
        const b=[...document.querySelectorAll('button,[role=button],.btn')].filter(e=>e.offsetParent!==null)
          .find(e=>/^\\s*(play|start|let.?s|begin|got it)\\b/i.test(e.textContent||''));
        if(b){b.click();return true;} return false;
      });
      if(hopped){ await new Promise(r=>setTimeout(r,1200));
        controls=controls.concat(await page.evaluate(MEASURE)); }
    }catch(e){ err=e.message.slice(0,40); }
    await page.close();
    const bad=controls.filter(c=>c.m<MIN-0.5);
    const worst=controls.length?Math.min(...controls.map(c=>c.m)):null;
    rows.push({slug,n:controls.length,under:bad.length,worst,err,
      worstNames:bad.sort((a,b)=>a.m-b.m).slice(0,3).map(c=>c.t+'@'+c.m).join(' | ')});
  }
  await browser.close(); srv.close();
  rows.sort((a,b)=>(a.worst==null?99:a.worst)-(b.worst==null?99:b.worst));
  console.log('satellite'.padEnd(22)+'ctrls under  worst  offenders');
  for(const r of rows){
    console.log(r.slug.padEnd(22)+String(r.n).padStart(5)+String(r.under).padStart(6)
      +String(r.worst==null?'-':r.worst).padStart(7)+'  '+(r.err?('ERR '+r.err):r.worstNames));
  }
  const clean=rows.filter(r=>!r.err&&r.under===0).length;
  console.log('\n'+rows.length+' satellites · '+clean+' clean at '+MIN+'px rendered · '
    +rows.filter(r=>r.err).length+' errored');
})();
