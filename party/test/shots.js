/* Screenshot pass at REAL timers.

   The end to end driver runs on shrunken clocks so a full game fits in a gate,
   and at that speed a two second reveal is over before a loaded browser
   finishes capturing, so shots came out labelled as one phase while showing the
   next. That is worse than no screenshot: it is a picture that lies about what
   it is.

   This pass runs the real clocks, and names each file from the phase read AFTER
   the capture returns, so a label can never claim more than the pixels do.

   Usage: node test/shots.js <slug> [players] [seconds] */
const path=require('path'), http=require('http'), fs=require('fs');
const ROOT=path.resolve(__dirname,'..','..');
const SLUG=process.argv[2]||'mothlight';
const PLAYERS=parseInt(process.argv[3]||'3',10);
const SECONDS=parseInt(process.argv[4]||'80',10);
const SHOTS=process.env.SHOTS||path.join('/tmp','wb-real',SLUG);
const puppeteer=require(path.join(ROOT,'node_modules','puppeteer'));
const NAMES=['Ada','Bo','Cy','Del','Eve','Fin','Gus','Hal'];
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg'};
const server=http.createServer((rq,rs)=>{let p=rq.url.split('?')[0];if(p.endsWith('/'))p+='index.html';
  fs.readFile(path.join(ROOT,p),(e,d)=>{if(e){rs.writeHead(404);rs.end('nf');return;}
  rs.writeHead(200,{'content-type':MIME[path.extname(p)]||'application/octet-stream'});rs.end(d);});});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function autopilot(){
  try{localStorage.setItem('sws_dev_ok','1')}catch(e){}
  window.__auto={pause:false};
  setInterval(function(){
    if(window.__auto.pause) return;
    var b=document.querySelectorAll('#game-root .screen.on button:not([disabled])');
    if(!b.length) return;
    /* answer only some of the time, so the room is caught mid decision in the
       shots rather than always fully resolved */
    if(Math.random()<0.45) return;
    var el=b[Math.floor(Math.random()*b.length)];
    var r=el.getBoundingClientRect();
    var at=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
    var o={bubbles:true,cancelable:true};
    at.dispatchEvent(new MouseEvent('mousedown',o));
    at.dispatchEvent(new MouseEvent('mouseup',o));
    at.dispatchEvent(new MouseEvent('click',o));
  },900);
}

(async()=>{
  await new Promise(r=>server.listen(8234,r));
  fs.mkdirSync(SHOTS,{recursive:true});
  const base='http://localhost:8234/party';
  const browser=await puppeteer.launch({protocolTimeout:90000,
    args:['--no-sandbox','--disable-dev-shm-usage','--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding','--disable-background-timer-throttling']});
  const host=await browser.newPage();
  await host.evaluateOnNewDocument(()=>{try{localStorage.setItem('sws_dev_ok','1')}catch(e){}});
  await host.setViewport({width:1920,height:1080});
  await host.goto(base+'/host.html?game='+SLUG,{waitUntil:'networkidle2'});
  await sleep(700);
  const code=await host.$eval('#ps-code',e=>e.textContent.trim());
  const phones=[];
  for(let i=0;i<PLAYERS;i++){
    const p=await browser.newPage();
    await p.evaluateOnNewDocument(autopilot);
    await p.setViewport({width:375,height:667,isMobile:true,hasTouch:true});
    await p.goto(base+'/play.html',{waitUntil:'domcontentloaded'});
    await p.type('#pj-code',code);
    await p.evaluate(()=>{document.getElementById('pj-name').value='';});
    await p.type('#pj-name',NAMES[i]);
    await p.evaluate(()=>{document.getElementById('pj-go').dispatchEvent(new MouseEvent('click',{bubbles:true}));});
    await sleep(350); phones.push(p);
  }
  await sleep(900);
  await host.evaluate(()=>{document.getElementById('ps-start').dispatchEvent(new MouseEvent('click',{bubbles:true}));});

  const got=new Set(); const end=Date.now()+SECONDS*1000; let n=0;
  const readPhase=()=>host.evaluate(()=>{
    const on=[...document.querySelectorAll('#game-root .on')].find(e=>e.id);
    return on?on.id:'none';});
  while(Date.now()<end){
    await sleep(2500);
    const tmp=path.join(SHOTS,'_tmp.png');
    for(const p of phones) await p.evaluate(()=>{window.__auto.pause=true;}).catch(()=>{});
    await sleep(90);
    try{ await host.screenshot({path:tmp}); }catch(e){ continue; }
    const after=await readPhase();            /* label from AFTER the capture */
    const phoneTmp=path.join(SHOTS,'_ptmp.png');
    let hasPhone=false;
    try{ await phones[0].screenshot({path:phoneTmp}); hasPhone=true; }catch(e){}
    for(const p of phones) await p.evaluate(()=>{window.__auto.pause=false;}).catch(()=>{});
    if(after==='none'){ continue; }
    if(!got.has(after)){
      got.add(after);
      fs.renameSync(tmp,path.join(SHOTS,'host-'+after+'.png'));
      if(hasPhone) fs.renameSync(phoneTmp,path.join(SHOTS,'phone-at-'+after+'.png'));
      n++;
    } else { try{fs.unlinkSync(tmp);}catch(e){} try{fs.unlinkSync(phoneTmp);}catch(e){} }
  }
  await browser.close(); server.close();
  console.log(SLUG+': captured '+n+' phases at real speed: '+[...got].join(', '));
})().catch(e=>{console.error('SHOTS FAILED '+e.message);process.exit(1);});
