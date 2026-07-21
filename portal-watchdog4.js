const puppeteer = require('/workspaces/lucid-winds/node_modules/puppeteer');
(async () => {
  const b = await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
  const ctx = await b.createBrowserContext();
  const p = await ctx.newPage();
  p.on('pageerror',e=>console.log('PAGEERR', e.message.slice(0,200)));
  p.on('console',m=>{ if(m.type()==='error') console.log('CONSOLE', m.text().slice(0,150)); });
  await p.setViewport({width:390,height:844});
  await p.setRequestInterception(true);
  p.on('request',req=>{ if(req.url().includes('/play/shell.js')) req.abort(); else req.continue(); });
  await p.goto('http://localhost:8901/portal/index.html',{waitUntil:'networkidle2'}).catch(()=>{});
  await p.evaluate(()=>{ const a=[...document.querySelectorAll('a')].find(x=>/\/play\/[^\/?#]+\.html/.test(x.getAttribute('href')||'')&&!x.target); a.click(); });
  for(let t=1;t<=20;t++){
    await new Promise(r=>setTimeout(r,1000));
    const s = await p.evaluate(()=>{ const sd=document.getElementById('game-frame').srcdoc||''; 
      return { r1:sd.includes('&r=1'), retry:sd.includes('did not load'), len:sd.length }; });
    if(t%2===0||s.r1||s.retry) console.log('t='+t+'s', JSON.stringify(s));
    if(s.retry) break;
  }
  await b.close();
})().catch(e=>{console.error('FATAL',e.message);process.exit(1)});
