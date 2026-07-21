const puppeteer = require('/workspaces/lucid-winds/node_modules/puppeteer');
(async () => {
  const b = await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
  const ctx = await b.createBrowserContext();
  const p = await ctx.newPage();
  await p.setViewport({width:390,height:844});
  await p.goto('http://localhost:8901/portal/index.html',{waitUntil:'networkidle2'}).catch(()=>{});
  await p.evaluate(()=>{ const a=[...document.querySelectorAll('a')].find(x=>/\/play\/[^\/?#]+\.html/.test(x.getAttribute('href')||'')&&!x.target); a.click(); });
  await new Promise(r=>setTimeout(r,1500));
  await p.evaluate(()=>window.postMessage({sws:'retryGame'},'*'));
  await new Promise(r=>setTimeout(r,800));
  const s = await p.evaluate(()=>{ const sd=document.getElementById('game-frame').srcdoc||''; return {bustX:sd.includes('&r=x'), len:sd.length}; });
  console.log('RETRY-PROBE', JSON.stringify(s), '(bustX true => srcdocOpts set & rebuild path works)');
  // also probe: does setTimeout work at all in the page?
  const t = await p.evaluate(()=>new Promise(res=>{ const t0=Date.now(); setTimeout(()=>res(Date.now()-t0), 1200); }));
  console.log('TIMER-PROBE', t+'ms (expect ~1200)');
  await b.close();
})().catch(e=>{console.error('FATAL',e.message);process.exit(1)});
