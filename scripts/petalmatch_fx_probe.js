#!/usr/bin/env node
/* Petal Match effects probe.
 *
 * The static board shot cannot prove the NEW art fires — rings, petal shards,
 * combo detonations, the star plaque and the chapter plate all only exist for a
 * few hundred ms during play. This drives the real game through _PM_TEST and
 * shoots each of those moments.
 *
 * ⛔ A win is detected by the LEVEL NUMBER GOING UP, never by isObjComplete():
 *   checkState() advances the level the instant the objective completes, so a
 *   poller always sees false. (Same trap the balance harness documents.)
 *
 * USAGE  node scripts/petalmatch_fx_probe.js [outdir]
 */
const puppeteer = require('puppeteer');
const path = require('path'); const http = require('http'); const fs = require('fs');

const OUT  = process.argv[2] || '/tmp';
const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json',
               '.png':'image/png','.jpg':'image/jpeg','.webmanifest':'application/manifest+json','.svg':'image/svg+xml' };

function serve(){ return new Promise(r=>{ const s=http.createServer((q,res)=>{
  let p=decodeURIComponent(q.url.split('?')[0]); if(p.endsWith('/'))p+='index.html';
  const f=path.join(ROOT,p);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end('x');}
  res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});
  fs.createReadStream(f).pipe(res); }); s.listen(0,'127.0.0.1',()=>r(s)); }); }

const sleep = ms => new Promise(r=>setTimeout(r,ms));

(async () => {
  const srv = await serve(); const port = srv.address().port;
  const browser = await puppeteer.launch({ headless:'new', args:['--no-sandbox','--disable-dev-shm-usage'] });
  const page = await browser.newPage();
  await page.setViewport({ width:412, height:915, deviceScaleFactor:2, isMobile:true, hasTouch:true });
  const errs=[]; const bad=[];
  page.on('pageerror',e=>errs.push(e.message));
  page.on('response',r=>{ if(r.status()>=400) bad.push(r.status()+' '+r.url().replace(`http://127.0.0.1:${port}`,'')); });

  await page.goto(`http://127.0.0.1:${port}/play/petalmatch.html`, { waitUntil:'networkidle2', timeout:30000 });

  // 1) the rules card, with the painted tutorial cards
  await sleep(1200);
  const cards = await page.evaluate(()=>document.querySelectorAll('#shell-dir figure img').length);
  await page.screenshot({ path: path.join(OUT,'fx-1-rules.png') });
  console.log('rules card tutorial images:', cards);

  for (let i=0;i<3;i++){
    const c = await page.evaluate(()=>{ const b=Array.from(document.querySelectorAll('button,.btn'))
      .filter(x=>x.offsetParent!==null && /play|start|got it/i.test(x.textContent||'')); if(b[0]){b[0].click();return true;} return false; });
    if(!c) break; await sleep(800);
  }
  await sleep(5200);   // deferred art wave + settle
  console.log('sprites warmed:', await page.evaluate(()=>window.PM_ART?window.PM_ART.count():-1));

  // 2) selection ring — hold a piece
  await page.evaluate(()=>{ const m=window._PM_TEST.moves(); if(m.length) window._PM_TEST.select&&window._PM_TEST.select(m[0][0][0],m[0][0][1]); });
  const selOk = await page.evaluate(()=>{
    const cv=document.querySelector('canvas'); const r=cv.getBoundingClientRect();
    const m=window._PM_TEST.moves(); if(!m.length) return false;
    const cell=m[0][0]; const CELL=r.width/8;
    const ev=n=>new PointerEvent(n,{clientX:r.left+cell[1]*CELL+CELL/2,clientY:r.top+cell[0]*CELL+CELL/2,bubbles:true,pointerId:1});
    cv.dispatchEvent(ev('pointerdown')); return true;
  });
  await sleep(160);
  await page.screenshot({ path: path.join(OUT,'fx-2-selected.png') });
  console.log('selection dispatched:', selOk);
  await page.evaluate(()=>{ window.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:1})); });
  await sleep(400);

  // 3) play until the LEVEL NUMBER GOES UP, shooting the frame right after each move
  const startLv = await page.evaluate(()=>window._PM_TEST.state().level);
  let shotClear=false, shotWin=false;
  for (let i=0;i<400 && !shotWin;i++){
    const acted = await page.evaluate(()=>{
      const s=window._PM_TEST.state(); if(s.animating) return 'wait';
      // movesScored returns [{a:[r,c], b:[r,c], s:objectiveScore}] — take the
      // best-scoring one so the probe reaches a level-up quickly.
      let m = window._PM_TEST.movesScored ? window._PM_TEST.movesScored() : null;
      if (m && m.length) {
        m = m.slice().sort((x,y)=>y.s-x.s);
        window._PM_TEST.play(m[0].a[0], m[0].a[1], m[0].b[0], m[0].b[1]);
        return 'played';
      }
      const p = window._PM_TEST.moves();
      if(!p || !p.length) return 'none';
      window._PM_TEST.play(p[0][0][0], p[0][0][1], p[0][1][0], p[0][1][1]);
      return 'played';
    });
    if(acted==='none') break;
    if(acted==='played' && !shotClear){ await sleep(120);
      await page.screenshot({ path: path.join(OUT,'fx-3-clear.png') }); shotClear=true; }
    await sleep(150);
    const lv = await page.evaluate(()=>window._PM_TEST.state().level);
    if(lv>startLv){ await sleep(120);
      /* ⛔ ASSERT, do not eyeball. The winning move is often also a combo, so
         the pop lettering and the level plaque used to print through each
         other. The plaque must be ALONE in the call-out layer. */
      const kids = await page.evaluate(()=>Array.from(window._PM_TEST.overlay().children)
        .map(c=>c.tagName==='IMG'?c.src.split('/').pop():'PLAQUE:'+(c.textContent||'').slice(0,20)));
      console.log('overlay at level-up:', JSON.stringify(kids),
                  kids.length===1 ? '  OK (plaque alone)' : '  ⛔ OVERLAP');
      await page.screenshot({ path: path.join(OUT,'fx-4-levelup.png') }); shotWin=true; }
  }
  console.log('start level', startLv, '| level-up captured:', shotWin, '| clear frame captured:', shotClear);

  console.log('404s:', bad.length?bad:'none');
  console.log('page errors:', errs.length?errs:'none');
  await browser.close(); srv.close();
})();
