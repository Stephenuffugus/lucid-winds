const puppeteer = require('/workspaces/lucid-winds/node_modules/puppeteer');
(async () => {
  const b = await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
  // CASE A: block the GAME MODULE (spinner-forever case)
  for(const [tag,pat] of [['GAME-BLOCKED','/games/'],['SHELL-BLOCKED','/play/shell.js']]){
    const ctx = await b.createBrowserContext();
    const p = await ctx.newPage();
    await p.setViewport({width:390,height:844});
    await p.setRequestInterception(true);
    p.on('request',req=>{ if(req.url().includes(pat)) req.abort(); else req.continue(); });
    await p.goto('http://localhost:8901/portal/index.html',{waitUntil:'networkidle2'}).catch(()=>{});
    await p.evaluate(()=>{ const a=[...document.querySelectorAll('a')].find(x=>/\/play\/[^\/?#]+\.html/.test(x.getAttribute('href')||'')&&!x.target); a.click(); });
    await new Promise(r=>setTimeout(r,9500));
    const mid = await p.evaluate(()=>({ rebuilt:(document.getElementById('game-frame').srcdoc||'').includes('&r=1') }));
    await new Promise(r=>setTimeout(r,9000));
    const end = await p.evaluate(()=>({ retryPage:(document.getElementById('game-frame').srcdoc||'').includes('did not load') }));
    console.log(tag, 'rebuilt@8s='+mid.rebuilt, 'retryPage@16s='+end.retryPage);
    if(end.retryPage){ await p.screenshot({path:__dirname+'/portal-retrypage.png'}); }
    await ctx.close();
  }
  // CASE B: healthy — watchdog must stay silent
  const ctx2 = await b.createBrowserContext();
  const p2 = await ctx2.newPage();
  await p2.setViewport({width:390,height:844});
  await p2.goto('http://localhost:8901/portal/index.html',{waitUntil:'networkidle2'}).catch(()=>{});
  await p2.evaluate(()=>{ const a=[...document.querySelectorAll('a')].find(x=>/\/play\/[^\/?#]+\.html/.test(x.getAttribute('href')||'')&&!x.target); a.click(); });
  await new Promise(r=>setTimeout(r,10000));
  const h = await p2.evaluate(()=>{ const fr=document.getElementById('game-frame');
    return { mounted: !fr.contentDocument.getElementById('shell-loading'), rebuilt:(fr.srcdoc||'').includes('&r='), retry:(fr.srcdoc||'').includes('did not load') }; });
  console.log('HEALTHY', JSON.stringify(h), '(expect mounted:true, rebuilt:false)');
  await b.close();
})().catch(e=>{console.error('FATAL',e.message);process.exit(1)});
