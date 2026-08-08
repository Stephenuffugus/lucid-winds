/* HOST DROP TEST.

   WHACKBOX_PLAN, non negotiable: "a dropped host mid-round must not destroy the
   party". Before this existed a phone whose big screen died sat on a frozen
   screen forever with nothing said, which is the worst possible version: the
   party ends and nobody is told why.

   This kills the host tab mid game for real, then brings a new host up on the
   SAME room code, and requires three things:
     1. every phone notices and says so, within about ten seconds
     2. no phone is asked to retype anything
     3. every phone is back in a live phase once the big screen returns

   Usage: node test/hostdrop.js [slug] [players] */
const path=require('path'), http=require('http'), fs=require('fs');
const ROOT=path.resolve(__dirname,'..','..');
const SLUG=process.argv[2]||'mothlight';
const PLAYERS=parseInt(process.argv[3]||'3',10);
const puppeteer=require(path.join(ROOT,'node_modules','puppeteer'));
const FAST={mothlight:'ml_fast=1',firefly:'ff_fast=1',liftingfog:'lf_fast=1',
            firstfrost:'fr_fast=1',moongraft:'mg_fast=1',samesoil:'ss_fast=1'};
const NAMES=['Ada','Bo','Cy','Del','Eve','Fin','Gus','Hal'];
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg'};
const server=http.createServer((rq,rs)=>{let p=rq.url.split('?')[0];if(p.endsWith('/'))p+='index.html';
  fs.readFile(path.join(ROOT,p),(e,d)=>{if(e){rs.writeHead(404);rs.end('nf');return;}
  rs.writeHead(200,{'content-type':MIME[path.extname(p)]||'application/octet-stream'});rs.end(d);});});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const log=[];

async function openHost(browser, base, code){
  const h=await browser.newPage();
  await h.evaluateOnNewDocument(()=>{try{localStorage.setItem('sws_dev_ok','1')}catch(e){}});
  await h.setViewport({width:1600,height:900});
  const q='?game='+SLUG+'&'+(FAST[SLUG]||'')+(code?('&code='+code):'');
  await h.goto(base+'/host.html'+q,{waitUntil:'networkidle2'});
  await sleep(600);
  return h;
}

(async()=>{
  await new Promise(r=>server.listen(8236,r));
  const base='http://localhost:8236/party';
  const browser=await puppeteer.launch({protocolTimeout:90000,
    args:['--no-sandbox','--disable-dev-shm-usage','--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding','--disable-background-timer-throttling']});

  let host=await openHost(browser, base, null);
  const code=await host.$eval('#ps-code',e=>e.textContent.trim());
  log.push('room '+code);

  const phones=[];
  for(let i=0;i<PLAYERS;i++){
    const p=await browser.newPage();
    await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('sws_dev_ok','1')}catch(e){}});
    await p.setViewport({width:375,height:667,isMobile:true,hasTouch:true});
    await p.goto(base+'/play.html',{waitUntil:'domcontentloaded'});
    await p.type('#pj-code',code);
    await p.evaluate(()=>{document.getElementById('pj-name').value='';});
    await p.type('#pj-name',NAMES[i]);
    await p.evaluate(()=>{document.getElementById('pj-go').dispatchEvent(new MouseEvent('click',{bubbles:true}));});
    await sleep(350);
    phones.push(p);
  }
  await sleep(900);
  await host.evaluate(()=>{document.getElementById('ps-start').dispatchEvent(new MouseEvent('click',{bubbles:true}));});
  await sleep(2500);

  const before=await phones[0].evaluate(()=>{
    const on=document.querySelector('#game-root .screen.on');
    return on?on.id:'none';});
  log.push('phones are in a live phase before the drop: '+before);
  if(before==='none') throw new Error('game never started, nothing to drop');

  /* ---- kill the big screen for real ---- */
  await host.close();
  log.push('host tab closed');

  let noticed=0;
  const deadline=Date.now()+14000;
  while(Date.now()<deadline){
    noticed=0;
    for(const p of phones){
      const lost=await p.evaluate(()=>{
        const el=document.getElementById('ps-lost');
        return !!el && el.classList.contains('on');
      }).catch(()=>false);
      if(lost) noticed++;
    }
    if(noticed===phones.length) break;
    await sleep(700);
  }
  log.push('phones that noticed the big screen was gone: '+noticed+' of '+phones.length);
  if(noticed!==phones.length) throw new Error('phones did not notice the host drop');

  /* nobody may be sent back to the join form */
  for(let i=0;i<phones.length;i++){
    const retype=await phones[i].evaluate(()=>
      getComputedStyle(document.getElementById('ps-join')).display!=='none');
    if(retype) throw new Error('phone '+(i+1)+' was thrown back to the join form');
  }
  log.push('no phone was asked to retype the code');

  /* ---- the big screen comes back on the same code ---- */
  host=await openHost(browser, base, code);
  const code2=await host.$eval('#ps-code',e=>e.textContent.trim());
  log.push('new host came up on code '+code2);
  if(code2!==code) throw new Error('the room code changed on restart: '+code+' -> '+code2);

  let back=0;
  const d2=Date.now()+12000;
  while(Date.now()<d2){
    back=0;
    for(const p of phones){
      const ok=await p.evaluate(()=>{
        const el=document.getElementById('ps-lost');
        return !(el&&el.classList.contains('on'));
      }).catch(()=>false);
      if(ok) back++;
    }
    if(back===phones.length) break;
    await sleep(700);
  }
  log.push('phones back with the big screen: '+back+' of '+phones.length);
  if(back!==phones.length) throw new Error('phones never recovered after the host returned');

  /* .ps-prow.dim is the "nobody yet" placeholder, not a player */
  let roster=[];
  const rd=Date.now()+8000;
  while(Date.now()<rd){
    roster=await host.$$eval('.ps-prow:not(.dim)',els=>els.map(e=>e.textContent.trim()));
    if(roster.length===PLAYERS) break;
    await sleep(600);
  }
  log.push('new host sees the room again: '+roster.join(', '));
  if(roster.length!==PLAYERS) throw new Error('new host saw '+roster.length+' of '+PLAYERS+' players');

  await browser.close(); server.close();
  console.log(log.join('\n'));
  console.log('RESULT: PASS');
})().catch(e=>{console.log(log.join('\n')); console.error('HOST DROP FAILED: '+e.message); process.exit(1);});
