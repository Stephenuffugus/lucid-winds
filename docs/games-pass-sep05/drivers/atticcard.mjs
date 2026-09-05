/* rummage, wipe, then draw the canvas card through the game's own drawCard and save it */
import puppeteer from "puppeteer"; import fs from "fs";
const OUT=process.env.OUT; const b=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-gpu","--mute-audio","--disable-dev-shm-usage"]});
const pg=await b.newPage(); await pg.setViewport({width:412,height:915,deviceScaleFactor:2,isMobile:true,hasTouch:true});
await pg.evaluateOnNewDocument(()=>{ try{ localStorage.setItem('sws_dev_ok','1'); }catch(e){} });
await pg.goto("http://127.0.0.1:8777/satellites/attic/?attictest=1&probe="+Math.random(),{waitUntil:"domcontentloaded"}); await new Promise(r=>setTimeout(r,1200));
const out=[];
for(const want of ['PLAYED','FINE','NEAR MINT','FACTORY SEALED']){
  const png=await pg.evaluate((want)=>new Promise(res=>{ const D=window.ATTIC_DEV; D.setTix(30);
    /* find a hash at the wanted grade by walking byte 2 */
    let h=null; for(let i=0;i<4000&&!h;i++){ const c=Array.from({length:64},()=> "0123456789abcdef"[Math.floor(Math.random()*16)]).join(""); if(window.ATTIC.hashToItem(c).grade===want) h=c; }
    D.show(h); document.getElementById('gb').click();
    setTimeout(()=>{ D.drawCard(h,(cv)=>res({h, url:cv.toDataURL('image/png'), story:window.ATTIC.hashToItem(h).revealStory, wear:document.getElementById('wearSlot').textContent})); },1400); }), want);
  fs.writeFileSync(OUT+"/card-"+want.replace(/ /g,'')+".png", Buffer.from(png.url.split(',')[1],'base64'));
  out.push(want+': '+png.wear);
}
console.log(out.join("\n"));
await b.close();
