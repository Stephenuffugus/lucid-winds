const puppeteer = require('/workspaces/lucid-winds/node_modules/puppeteer');
(async () => {
  const b = await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
  const ctx = await b.createBrowserContext();
  const p = await ctx.newPage();
  await p.setViewport({width:390,height:844});
  await p.setRequestInterception(true);
  const served=[];
  p.on('request',req=>{ const u=req.url();
    if(u.includes('/play/shell.js')){ served.push('ABORT '+u.slice(-40)); req.abort(); }
    else { if(u.includes('.js')) served.push(u.slice(-50)); req.continue(); } });
  await p.goto('http://localhost:8901/portal/index.html',{waitUntil:'networkidle2'}).catch(()=>{});
  await p.evaluate(()=>{
    window.__info=[];
    window.addEventListener('message',e=>{ if(e.data&&e.data.sws==='ready'){
      const fr=document.getElementById('game-frame');
      window.__info.push({fromGameFrame: e.source===fr.contentWindow, origin:e.origin});
    }});
    const a=[...document.querySelectorAll('a')].find(x=>/\/play\/[^\/?#]+\.html/.test(x.getAttribute('href')||'')&&!x.target); a.click();
  });
  await new Promise(r=>setTimeout(r,5000));
  console.log('READY-SOURCE', JSON.stringify(await p.evaluate(()=>window.__info)));
  const inFrame = await p.evaluate(()=>{
    const d=document.getElementById('game-frame').contentDocument;
    return { scripts:[...d.scripts].map(s=>s.src.slice(-40)||'(inline)'), hasShellFn: typeof document.getElementById('game-frame').contentWindow.LW_SHELL !== 'undefined' };
  });
  console.log('FRAME', JSON.stringify(inFrame));
  console.log('JS-REQS', JSON.stringify(served.filter(s=>s.includes('play/')||s.includes('games/')||s.includes('ABORT')||s.includes('sunbeam'))));
  await b.close();
})().catch(e=>{console.error('FATAL',e.message);process.exit(1)});
