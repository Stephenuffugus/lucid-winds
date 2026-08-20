import puppeteer from 'puppeteer';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await puppeteer.launch({args:['--no-sandbox','--mute-audio']});
const p=await b.newPage();
await p.emulate({viewport:{width:412,height:915,isMobile:true,hasTouch:true,deviceScaleFactor:2},
  userAgent:'Mozilla/5.0 Mobile'});
await p.goto('http://127.0.0.1:8901/index.html',{waitUntil:'networkidle2'});
for(let i=0;i<5;i++){ await p.touchscreen.tap(206,457); await sleep(300);
  if(await p.evaluate(()=>{const e=document.querySelector('#intro');return !e||getComputedStyle(e).display==='none';})) break; }
await p.evaluate(()=>showToy('coin'));
await sleep(300);
const faces=[];
for(let k=0;k<16;k++){
  await p.evaluate(()=>{cnState='rest';cnOmega=0;cnTilt=0;cnWob=0;coinFlick(0.02);});
  for(let i=0;i<90;i++){ await sleep(60); if(await p.evaluate(()=>cnState==='rest')) break; }
  faces.push(await p.evaluate(()=>cnFace));
}
console.log('COIN 16 identical flicks:',JSON.stringify(faces),'heads:',faces.filter(f=>f).length,'of 16');
await b.close();
