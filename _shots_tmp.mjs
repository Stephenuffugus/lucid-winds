import http from 'http'; import fs from 'fs'; import path from 'path'; import puppeteer from 'puppeteer';
const ROOT='/workspaces/lucid-winds'; const OUT='/tmp/claude-1000/-workspaces-lucid-winds/5d3fb669-7586-4960-ab47-ebc7334caf3a/scratchpad';
const M={'.html':'text/html','.js':'application/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.css':'text/css'};
const s=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';const f=path.join(ROOT,p);
 if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);r.end();return;}r.writeHead(200,{'Content-Type':M[path.extname(f)]||'text/plain'});r.end(fs.readFileSync(f));});
await new Promise(r=>s.listen(8987,r));
const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage']});

// 1) BURR BLAST, landscape (the game's own framing), mid-aim so the guide is drawn
{
  const p=await b.newPage(); await p.setViewport({width:812,height:375,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await p.goto('http://127.0.0.1:8987/satellites/burr-blast/?bbtest=1',{waitUntil:'load'});
  await new Promise(r=>setTimeout(r,700));
  await p.evaluate(()=>{ document.getElementById('btnComicSkip').click(); window.BB_DEBUG.enter(4); });
  await new Promise(r=>setTimeout(r,2600));  // let the survey pan finish
  const pt=await p.evaluate(()=>{ const G=window.BB_DEBUG.snap&&null; return null; });
  // drag from the sling
  const c=await p.evaluate(()=>{ const cv=document.getElementById('game'); const r=cv.getBoundingClientRect(); return {l:r.left,t:r.top}; });
  const sl=await p.evaluate(()=>{ // world->screen for the sling anchor
    const g=window; return null; });
  await p.mouse.move(c.l+120,c.t+180); await p.mouse.down();
  await p.mouse.move(c.l+40,c.t+250,{steps:10});
  await new Promise(r=>setTimeout(r,400));
  await p.screenshot({path:OUT+'/bb-aim-landscape.png'});
  await p.mouse.up();
  await new Promise(r=>setTimeout(r,1200));
  await p.screenshot({path:OUT+'/bb-flight-landscape.png'});
  await p.close();
}
// 2) BURR BLAST portrait: the rotate nudge, then paused
{
  const p=await b.newPage(); await p.setViewport({width:375,height:667,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await p.goto('http://127.0.0.1:8987/satellites/burr-blast/?bbtest=1',{waitUntil:'load'});
  await new Promise(r=>setTimeout(r,700));
  await p.evaluate(()=>{ document.getElementById('btnComicSkip').click(); window.BB_DEBUG.enter(1); });
  await new Promise(r=>setTimeout(r,600));
  await p.screenshot({path:OUT+'/bb-portrait-nudge.png'});
  await p.evaluate(()=>{ document.getElementById('btnPause').click(); });
  await new Promise(r=>setTimeout(r,400));
  await p.screenshot({path:OUT+'/bb-portrait-paused.png'});
  await p.close();
}
// 3) BURR BLAST loadout (nutrient steppers, 48px, fab parked)
{
  const p=await b.newPage(); await p.setViewport({width:375,height:667,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await p.goto('http://127.0.0.1:8987/satellites/burr-blast/?bbtest=1',{waitUntil:'load'});
  await new Promise(r=>setTimeout(r,700));
  await p.evaluate(()=>{ document.getElementById('btnComicSkip').click(); document.getElementById('btnPlay').click(); });
  await new Promise(r=>setTimeout(r,300));
  await p.evaluate(()=>{ document.querySelector('#lsBody .ls-cell').click(); });
  await new Promise(r=>setTimeout(r,4200));
  await p.screenshot({path:OUT+'/bb-loadout.png'});
  await p.close();
}
// 4) GARDEN TD in play, portrait: bottom bar + fab
{
  const p=await b.newPage(); await p.setViewport({width:375,height:667,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await p.goto('http://127.0.0.1:8987/satellites/garden-td/',{waitUntil:'load'});
  await new Promise(r=>setTimeout(r,700));
  await p.evaluate(()=>{ window.__GTD.start('garden',1); });
  await new Promise(r=>setTimeout(r,500));
  await p.screenshot({path:OUT+'/gtd-tip.png'});
  await p.evaluate(()=>{ document.getElementById('game').dispatchEvent(new PointerEvent('pointerdown',{clientX:180,clientY:300,bubbles:true})); window.__GTD.addSeeds(600);
    window.__GTD.place(0,'marigold'); window.__GTD.place(1,'sundew'); window.__GTD.place(2,'cactus'); window.__GTD.startWave(); });
  await new Promise(r=>setTimeout(r,4600));
  await p.screenshot({path:OUT+'/gtd-play.png'});
  await p.close();
}
// 5) GARDEN TD desktop width — the LOOKING rule says shoot desktop too
{
  const p=await b.newPage(); await p.setViewport({width:1280,height:800,deviceScaleFactor:1});
  await p.goto('http://127.0.0.1:8987/satellites/garden-td/',{waitUntil:'load'});
  await new Promise(r=>setTimeout(r,700));
  await p.evaluate(()=>{ window.__GTD.start('garden',1); window.__GTD.addSeeds(600); document.getElementById('tip').classList.remove('show'); });
  await new Promise(r=>setTimeout(r,4400));
  await p.screenshot({path:OUT+'/gtd-desktop.png'});
  await p.close();
}
await b.close(); s.close(); process.exit(0);
