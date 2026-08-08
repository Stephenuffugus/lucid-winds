const path=require('path'),http=require('http'),fs=require('fs');
const ROOT='/workspaces/lucid-winds';
const pup=require(path.join(ROOT,'node_modules','puppeteer'));
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg'};
const server=http.createServer((rq,rs)=>{let p=rq.url.split('?')[0];if(p.endsWith('/'))p+='index.html';
 fs.readFile(path.join(ROOT,p),(e,d)=>{if(e){rs.writeHead(404);rs.end('nf');return;}
 rs.writeHead(200,{'content-type':MIME[path.extname(p)]||'application/octet-stream'});rs.end(d);});});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const OUT=process.env.SHOTS||'/tmp/picker';
(async()=>{
 await new Promise(r=>server.listen(8237,r)); fs.mkdirSync(OUT,{recursive:true});
 const b=await pup.launch({protocolTimeout:60000,args:['--no-sandbox','--disable-dev-shm-usage']});
 const errs=[];
 const p=await b.newPage();
 p.on('pageerror',e=>errs.push('PAGEERROR '+e.message));
 p.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE '+m.text());});
 await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('sws_dev_ok','1')}catch(e){}});
 await p.setViewport({width:1920,height:1080});
 /* the FRONT DOOR: no ?game= at all, which is how a person actually arrives */
 await p.goto('http://localhost:8237/party/host.html',{waitUntil:'networkidle2'});
 await sleep(700);
 const cards=await p.$$eval('.ps-card',els=>els.map(e=>({
   name:(e.querySelector('.nm')||{}).textContent,
   meta:(e.querySelector('.mt')||{}).textContent,
   h:Math.round(e.getBoundingClientRect().height),
   below:e.getBoundingClientRect().bottom>window.innerHeight })));
 console.log('cards on the menu: '+cards.length);
 cards.forEach(c=>console.log('  '+c.name+'  ['+c.meta+']  '+c.h+'px'+(c.below?'  ⛔ BELOW THE FOLD':'')));
 await p.screenshot({path:path.join(OUT,'picker.png')});
 /* every card must be reachable by a real hit test, not just present */
 const reach=await p.evaluate(()=>{
   const out=[];
   document.querySelectorAll('.ps-card').forEach(function(c){
     const r=c.getBoundingClientRect();
     const at=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
     out.push({n:(c.querySelector('.nm')||{}).textContent, ok:!!(at&&(at===c||c.contains(at)))});
   });
   return out;});
 const unreachable=reach.filter(r=>!r.ok);
 console.log(unreachable.length?('UNREACHABLE: '+unreachable.map(r=>r.n).join(', ')):'every card is hittable');
 /* pick one for real and require a room */
 await p.evaluate(()=>{
   const c=document.querySelectorAll('.ps-card')[2];
   const r=c.getBoundingClientRect();
   const at=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
   (at||c).dispatchEvent(new MouseEvent('click',{bubbles:true}));});
 await sleep(1400);
 const st=await p.evaluate(()=>({
   code:(document.getElementById('ps-code')||{}).textContent,
   lobby:document.getElementById('ps-lobby').classList.contains('on'),
   pick:document.getElementById('ps-pick').classList.contains('on'),
   join:(document.getElementById('ps-join-url')||{}).textContent,
   note:(document.getElementById('ps-transport-note')||{}).textContent.slice(0,60)}));
 console.log('after picking the third card: '+JSON.stringify(st));
 await p.screenshot({path:path.join(OUT,'after-pick.png')});
 if(!/^[A-Z0-9]{4}$/.test(st.code||'')) throw new Error('picking a game did not open a room');
 if(!st.lobby||st.pick) throw new Error('the menu did not hand over to the lobby');
 await b.close(); server.close();
 console.log(errs.length?('CONSOLE ERRORS:\n'+errs.join('\n')):'console clean');
 console.log('RESULT: '+(errs.length||unreachable.length?'FAIL':'PASS'));
})().catch(e=>{console.error('PICKER FAILED: '+e.message);process.exit(1);});
