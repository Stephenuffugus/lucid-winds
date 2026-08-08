/* Prove the sound is real: an AudioContext exists, the mute control is a real
   48px control that is reachable, toggling it persists, and a muted run
   schedules nothing. A game that only LOOKS like it has sound is worse than a
   silent one, because nobody checks again. */
const path=require('path'),http=require('http'),fs=require('fs');
const ROOT='/workspaces/lucid-winds';
const pup=require(path.join(ROOT,'node_modules','puppeteer'));
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg'};
const server=http.createServer((rq,rs)=>{let p=rq.url.split('?')[0];if(p.endsWith('/'))p+='index.html';
 fs.readFile(path.join(ROOT,p),(e,d)=>{if(e){rs.writeHead(404);rs.end('nf');return;}
 rs.writeHead(200,{'content-type':MIME[path.extname(p)]||'application/octet-stream'});rs.end(d);});});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 await new Promise(r=>server.listen(8239,r));
 const b=await pup.launch({protocolTimeout:60000,args:['--no-sandbox','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required']});
 const p=await b.newPage();
 const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
 await p.evaluateOnNewDocument(()=>{
   try{localStorage.setItem('sws_dev_ok','1')}catch(e){}
   /* count every oscillator the page ever starts */
   window.__notes=0;
   const patch=()=>{ const AC=window.AudioContext||window.webkitAudioContext; if(!AC)return;
     const orig=AC.prototype.createOscillator;
     AC.prototype.createOscillator=function(){ window.__notes++; return orig.call(this); }; };
   patch();
 });
 await p.setViewport({width:1600,height:900});
 await p.goto('http://localhost:8239/party/host.html?game=mothlight&ml_fast=1',{waitUntil:'networkidle2'});
 await sleep(500);
 const mute=await p.evaluate(()=>{
   const b=document.getElementById('ps-mute'); if(!b) return null;
   const r=b.getBoundingClientRect();
   const at=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
   return {w:Math.round(r.width),h:Math.round(r.height),label:b.textContent,
           reachable:!!(at&&(at===b||b.contains(at)))};});
 console.log('mute control: '+JSON.stringify(mute));
 if(!mute) throw new Error('no mute control on the host');
 if(mute.w<48||mute.h<48) throw new Error('mute control under 48px: '+mute.w+'x'+mute.h);
 if(!mute.reachable) throw new Error('mute control is not reachable');

 /* sound on: playing notes must actually create oscillators */
 const played=await p.evaluate(async()=>{
   PartySound.wake();
   const before=window.__notes;
   PartySound.pip(); PartySound.chime(); PartySound.reveal(true);
   PartySound.tick(3); PartySound.fanfare(); PartySound.thud();
   return window.__notes-before;});
 console.log('notes scheduled with sound ON: '+played);
 if(played<8) throw new Error('sound is on but almost nothing was scheduled');

 /* muted: nothing at all, and the choice survives a reload */
 const muted=await p.evaluate(()=>{
   PartySound.toggle();
   const before=window.__notes;
   PartySound.pip(); PartySound.chime(); PartySound.reveal(true); PartySound.fanfare();
   return {after:window.__notes-before, on:PartySound.isOn(),
           stored:localStorage.getItem('party_sound')};});
 console.log('muted: '+JSON.stringify(muted));
 if(muted.after!==0) throw new Error('muted but '+muted.after+' notes still scheduled');
 if(muted.stored!=='off') throw new Error('mute choice was not stored');

 await p.reload({waitUntil:'networkidle2'});
 await sleep(400);
 const persisted=await p.evaluate(()=>({on:PartySound.isOn(),
   label:document.getElementById('ps-mute').textContent}));
 console.log('after a reload: '+JSON.stringify(persisted));
 if(persisted.on) throw new Error('mute did not survive a reload');

 await b.close(); server.close();
 console.log(errs.length?('CONSOLE ERRORS: '+errs.join(' | ')):'console clean');
 console.log('RESULT: '+(errs.length?'FAIL':'PASS'));
 process.exit(errs.length?2:0);
})().catch(e=>{console.error('AUDIO PROBE FAILED: '+e.message);process.exit(1);});
