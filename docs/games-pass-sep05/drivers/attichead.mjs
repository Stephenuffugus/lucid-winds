import puppeteer from "puppeteer";
const OUT=process.env.OUT; const b=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-gpu","--mute-audio","--disable-dev-shm-usage"]});
for(const [W,H] of [[412,915],[320,568]]){ const pg=await b.newPage(); await pg.setViewport({width:W,height:H,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await pg.evaluateOnNewDocument(()=>{ try{ localStorage.setItem('sws_dev_ok','1'); localStorage.setItem('attic_how','1'); }catch(e){} });
  await pg.goto("http://127.0.0.1:8777/satellites/attic/?attictest=1&probe="+Math.random(),{waitUntil:"domcontentloaded"}); await new Promise(r=>setTimeout(r,1200));
  await pg.evaluate(()=>{ const h=document.getElementById('howSheet'); if(h) h.className=''; });
  const m=await pg.evaluate(()=>{ const c=document.getElementById('sndBtn').getBoundingClientRect(), k=document.getElementById('swsBack').getBoundingClientRect(); const hit=document.elementFromPoint(c.left+c.width/2,c.top+c.height/2); return {chip:[c.left|0,c.top|0,c.width|0,c.height|0], back:[k.left|0,k.top|0,k.width|0,k.height|0], hitOk:hit&&hit.id==='sndBtn', overflow: c.right>innerWidth}; });
  console.log(W+'x'+H, JSON.stringify(m)); await pg.screenshot({path:OUT+`/attic-head-${W}.png`, clip:{x:0,y:0,width:W,height:Math.min(H,420)}}); await pg.close(); }
await b.close();
