import puppeteer from 'puppeteer';
const b=await puppeteer.launch({args:['--no-sandbox','--mute-audio']});
const p=await b.newPage();
await p.emulate({viewport:{width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:2},
  userAgent:'Mozilla/5.0 (Linux; Android 15; Pixel 9) Mobile'});
await p.goto('http://127.0.0.1:8777/portal/index.html',{waitUntil:'networkidle2',timeout:60000});
await new Promise(r=>setTimeout(r,1500));
const m=await p.evaluate(()=>{
  const H=document.documentElement.scrollHeight, vh=innerHeight;
  const q=s=>document.querySelector(s);
  const topOf=el=>el?Math.round(el.getBoundingClientRect().top+scrollY):null;
  const shelves=[...document.querySelectorAll('.shelf')].map(s=>({
    title:(s.querySelector('.shelf-h')||{}).childNodes?s.querySelector('.shelf-h').textContent.trim().slice(0,40):'',
    cards:s.querySelectorAll('.card').length}));
  return {
    pageHeightPx:H, viewports:+(H/vh).toFixed(1),
    totalCardsInDom:document.querySelectorAll('.card').length,
    gardenCards:q('#garden')?q('#garden').querySelectorAll('.card').length:0,
    shelfCount:shelves.length, shelves,
    firstShelfTop:topOf(q('.shelf')), everythingTop:topOf(q('#everything-h')),
    searchTop:topOf(q('#gsearch')), membersTop:topOf(q('.members')),
    tabsCount:document.querySelectorAll('#tabs button').length,
    imgCount:document.images.length,
    liteActive:document.documentElement.classList.contains('perf-lite')||document.documentElement.classList.contains('lite')
  };
});
console.log(JSON.stringify(m,null,1));
await p.screenshot({path:'/tmp/claude-1000/-workspaces-lucid-winds/d6e4270b-d486-419c-825e-b18f22aea7f8/scratchpad/portal-top.png'});
await b.close();
