import puppeteer from 'puppeteer';
const OUT='/tmp/claude-1000/-workspaces-lucid-winds/d6e4270b-d486-419c-825e-b18f22aea7f8/scratchpad';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await puppeteer.launch({args:['--no-sandbox','--mute-audio']});
const p=await b.newPage();
await p.emulate({viewport:{width:412,height:915,isMobile:true,hasTouch:true,deviceScaleFactor:2},userAgent:'Mozilla/5.0 Mobile'});
p.on('pageerror',e=>console.log('PAGEERROR:',e.message));
await p.goto('http://127.0.0.1:8777/bramblewick.html?bramblewicktest=1',{waitUntil:'networkidle2'});
await sleep(700);
await p.evaluate(()=>{ __bw.start(1,0);
  __bw.addCompanion('ladybug'); __bw.addCompanion('bee'); __bw.addCompanion('koala'); __bw.addCompanion('mammoth'); });
for(let i=0;i<14;i++){
  await sleep(700);
  await p.evaluate(()=>{ if(__bw.state()&&__bw.state().state==="LEVELUP") __bw.pick(0);
    if(__bw.state()&&__bw.state().pests<10){ __bw.swarmAt(3,'mite'); __bw.swarmAt(3,'spittle'); __bw.swarmAt(3,'wasp'); } });
}
console.log('fx:',JSON.stringify(await p.evaluate(()=>__bw.fxCounts())));
console.log('state:',JSON.stringify(await p.evaluate(()=>__bw.state())));
await p.screenshot({path:OUT+'/bramble-run.png'});
await b.close(); console.log('DONE');
