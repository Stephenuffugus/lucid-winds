import puppeteer from "puppeteer"; import fs from "fs";
const OUT=process.env.OUT; const b=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-gpu","--mute-audio","--disable-dev-shm-usage"]});
const pg=await b.newPage(); await pg.setViewport({width:412,height:915,deviceScaleFactor:2,isMobile:true,hasTouch:true});
await pg.evaluateOnNewDocument(()=>{ try{ localStorage.setItem('sws_dev_ok','1'); }catch(e){} });
await pg.goto("http://127.0.0.1:8777/satellites/attic/?attictest=1&probe="+Math.random(),{waitUntil:"domcontentloaded"}); await new Promise(r=>setTimeout(r,1200));
const png=await pg.evaluate(()=>new Promise(res=>{ const D=window.ATTIC_DEV; D.setTix(30);
  let h=null; for(let i=0;i<6000&&!h;i++){ let c=Array.from({length:64},()=> "0123456789abcdef"[Math.floor(Math.random()*16)]).join(""); c=c.slice(0,16)+'83'+c.slice(18); const it=window.ATTIC.hashToItem(c); if(it.cls==='VHS'&&it.name.length>26&&it.sub.length>40) h=c; }
  D.show(h); document.getElementById('gb').click();
  setTimeout(()=>{ D.drawCard(h,(cv)=>res({h, url:cv.toDataURL('image/png'), grade:window.ATTIC.hashToItem(h).grade})); },1400); }));
fs.writeFileSync(OUT+"/card-vhs-workout.png", Buffer.from(png.url.split(',')[1],'base64')); console.log('vhs card', png.grade, png.h.slice(0,20));
await pg.screenshot({path:OUT+"/vhs-find.png"});
await b.close();
