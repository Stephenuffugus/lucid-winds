import puppeteer from "puppeteer";
const OUT=process.env.OUT; const b=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-gpu","--mute-audio","--disable-dev-shm-usage"]});
for(const [W,H] of [[412,915],[320,568]]){ const pg=await b.newPage(); await pg.setViewport({width:W,height:H,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await pg.evaluateOnNewDocument(()=>{ try{ localStorage.setItem('sws_dev_ok','1'); localStorage.setItem('attic_how','1'); }catch(e){} });
  await pg.goto("http://127.0.0.1:8777/satellites/attic/?attictest=1&probe="+Math.random(),{waitUntil:"domcontentloaded"}); await new Promise(r=>setTimeout(r,1200));
  await pg.evaluate(async()=>{ const D=window.ATTIC_DEV; const h=document.getElementById('howSheet'); if(h) h.className=''; D.setTix(30);
    for(let i=0;i<5;i++){ document.getElementById('go').click(); if(i<4){ document.getElementById('gb').click(); await new Promise(r=>setTimeout(r,1100)); } }
    const base=D.shelf()[0]; const sealedH=base.slice(0,4)+'ff'+base.slice(6); D.addPull(sealedH); D.revealed()[sealedH]=1; D.openShelf(); });
  await new Promise(r=>setTimeout(r,700));
  await pg.screenshot({path:OUT+`/shelf-${W}.png`}); await pg.close(); }
await b.close(); console.log('shelf shots');
