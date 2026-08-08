/* The bed runs on a setInterval, and a game plays dozens of timers. If one
   interval survives a phase change the pulses stack until the host is a drone.
   This drives a game and counts live intervals rather than trusting the code. */
const path=require('path'),http=require('http'),fs=require('fs');
const ROOT='/workspaces/lucid-winds';
const pup=require(path.join(ROOT,'node_modules','puppeteer'));
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg'};
const server=http.createServer((rq,rs)=>{let p=rq.url.split('?')[0];if(p.endsWith('/'))p+='index.html';
 fs.readFile(path.join(ROOT,p),(e,d)=>{if(e){rs.writeHead(404);rs.end('nf');return;}
 rs.writeHead(200,{'content-type':MIME[path.extname(p)]||'application/octet-stream'});rs.end(d);});});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 await new Promise(r=>server.listen(8240,r));
 const b=await pup.launch({protocolTimeout:60000,args:['--no-sandbox','--disable-dev-shm-usage']});
 const host=await b.newPage();
 await host.evaluateOnNewDocument(()=>{
   try{localStorage.setItem('sws_dev_ok','1'); localStorage.setItem('party_sound','on');}catch(e){}
   window.__iv=0;
   const si=window.setInterval, ci=window.clearInterval;
   window.setInterval=function(){ window.__iv++; return si.apply(window,arguments); };
   window.clearInterval=function(id){ if(id!==undefined&&id!==null) window.__iv--; return ci.call(window,id); };
 });
 await host.setViewport({width:1280,height:800});
 await host.goto('http://localhost:8240/party/host.html?game=mothlight&ml_fast=1',{waitUntil:'networkidle2'});
 await sleep(500);
 const code=await host.$eval('#ps-code',e=>e.textContent.trim());
 const phones=[];
 for(let i=0;i<3;i++){
   const p=await b.newPage();
   await p.evaluateOnNewDocument(()=>{
     try{localStorage.setItem('sws_dev_ok','1')}catch(e){}
     setInterval(function(){
       var btns=document.querySelectorAll('#game-root .screen.on button:not([disabled])');
       if(!btns.length)return; var el=btns[Math.floor(Math.random()*btns.length)];
       var r=el.getBoundingClientRect();
       var at=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
       (at||el).dispatchEvent(new MouseEvent('click',{bubbles:true}));},600);
   });
   await p.setViewport({width:375,height:667,isMobile:true,hasTouch:true});
   await p.goto('http://localhost:8240/party/play.html',{waitUntil:'domcontentloaded'});
   await p.type('#pj-code',code);
   await p.evaluate(()=>{document.getElementById('pj-name').value='';});
   await p.type('#pj-name',['Ada','Bo','Cy'][i]);
   await p.evaluate(()=>{document.getElementById('pj-go').dispatchEvent(new MouseEvent('click',{bubbles:true}));});
   await sleep(300); phones.push(p);
 }
 await sleep(800);
 const base=await host.evaluate(()=>window.__iv);
 await host.evaluate(()=>{document.getElementById('ps-start').dispatchEvent(new MouseEvent('click',{bubbles:true}));});
 const samples=[];
 for(let i=0;i<14;i++){ await sleep(3000); samples.push(await host.evaluate(()=>window.__iv)); }
 await b.close(); server.close();
 const max=Math.max(...samples);
 console.log('live intervals at lobby: '+base);
 console.log('during play: '+samples.join(' '));
 console.log('peak: '+max);
 /* the shell keeps a presence interval and a timer; the bed adds at most one */
 if(max-base>3){ console.error('LEAK: intervals grew by '+(max-base)); process.exit(1); }
 console.log('RESULT: PASS (no interval leak)');
})().catch(e=>{console.error('LEAK PROBE FAILED: '+e.message);process.exit(1);});
