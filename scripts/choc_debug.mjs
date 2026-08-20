import puppeteer from 'puppeteer';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await puppeteer.launch({args:['--no-sandbox','--mute-audio']});
const p=await b.newPage();
await p.emulate({viewport:{width:412,height:915,isMobile:true,hasTouch:true,deviceScaleFactor:2},
  userAgent:'Mozilla/5.0 (Linux; Android 15; Pixel 9) Mobile'});
p.on('pageerror',e=>console.log('PAGEERROR:',e.message));
await p.goto('http://127.0.0.1:8901/index.html',{waitUntil:'networkidle2'});
for(let i=0;i<5;i++){ await p.touchscreen.tap(206,457); await sleep(300);
  if(await p.evaluate(()=>{const e=document.querySelector('#intro');return !e||getComputedStyle(e).display==='none';})) break; }
await p.evaluate(()=>{showToy('choc'); chocFoil=false; drawChoc();});
await sleep(300);
const info=await p.evaluate(()=>{
  const r=document.querySelector('#chocSvg').getBoundingClientRect();
  const s=Math.min(r.width/300,r.height/200);
  const ox=r.left+(r.width-300*s)/2, oy=r.top+(r.height-200*s)/2;
  const cx=ox+192*s, cy=oy+104*s;
  const el=document.elementFromPoint(cx,cy);
  return {cx,cy,hit:el?(el.tagName+' cls='+(el.getAttribute('class')||'')+' g='+(el.getAttribute('data-g')||'')):'none',
    grooves:[...document.querySelectorAll('.groove')].length};
});
console.log(JSON.stringify(info));
await p.touchscreen.tap(info.cx,info.cy);
await sleep(200);
console.log('after tap: cracked=',await p.evaluate(()=>chocCracked),'foil=',await p.evaluate(()=>chocFoil));
await b.close();
