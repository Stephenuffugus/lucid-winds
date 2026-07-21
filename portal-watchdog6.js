const puppeteer = require('/workspaces/lucid-winds/node_modules/puppeteer');
(async () => {
  const b = await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
  const ctx = await b.createBrowserContext();
  const p = await ctx.newPage();
  await p.setViewport({width:390,height:844});
  await p.setRequestInterception(true);
  p.on('request',req=>{ if(req.url().includes('/play/shell.js')) req.abort(); else req.continue(); });
  await p.goto('http://localhost:8901/portal/index.html',{waitUntil:'networkidle2'}).catch(()=>{});
  await p.evaluate(()=>{
    window.__msgs=[];
    window.addEventListener('message',e=>{ try{ window.__msgs.push(JSON.stringify(e.data).slice(0,80)); }catch(_){ window.__msgs.push('unserializable'); } });
    const a=[...document.querySelectorAll('a')].find(x=>/\/play\/[^\/?#]+\.html/.test(x.getAttribute('href')||'')&&!x.target); a.click();
  });
  await new Promise(r=>setTimeout(r,5000));
  console.log('MESSAGES', JSON.stringify(await p.evaluate(()=>window.__msgs)));
  await b.close();
})().catch(e=>{console.error('FATAL',e.message);process.exit(1)});
