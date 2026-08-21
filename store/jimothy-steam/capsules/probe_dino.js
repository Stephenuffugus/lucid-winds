/* Why does the dinothy shot keep failing? One attempt, full state dump. */
const puppeteer=require('/workspaces/lucid-winds/node_modules/puppeteer');
const path=require('path');const fs=require('fs');const http=require('http');
const ROOT='/workspaces/lucid-winds';const PORT=8944;const BASE='http://localhost:'+PORT;
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.mp3':'audio/mpeg','.webp':'image/webp'};
const server=http.createServer((req,res)=>{const clean=decodeURIComponent(req.url.split('?')[0]);
 let fp=path.normalize(path.join(ROOT,clean));if(!fp.startsWith(ROOT)){res.writeHead(403);res.end();return;}
 fs.readFile(fp,(e,b)=>{if(e){res.writeHead(404);res.end();return;}
  res.writeHead(200,{'Content-Type':MIME[path.extname(fp)]||'application/octet-stream'});res.end(b);});});
(async()=>{
 await new Promise(r=>server.listen(PORT,'127.0.0.1',r));
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
 for(let att=1;att<=3;att++){
   const p=await b.newPage();
   await p.setViewport({width:540,height:960,deviceScaleFactor:2});
   await p.evaluateOnNewDocument(()=>{ window.__STEAM_BUILD=true;
     try{ localStorage.setItem('sh_prog', JSON.stringify({v:2,char:'dino',chars:{shark:1,dino:1},hopped:1})); }catch(e){} });
   await p.goto(BASE+'/satellites/stream-hop/index.html?shtest=1',{waitUntil:'networkidle2',timeout:60000});
   await new Promise(r=>setTimeout(r,3200));
   await p.evaluate(()=>{const e=document.getElementById('splash-tap'); if(e)e.click();});
   await new Promise(r=>setTimeout(r,1800));
   const pre=await p.evaluate(()=>{ try{ const g=SH_DEV.state(); return {g:!!g}; }catch(e){ return {err:String(e)}; } });
   await p.evaluate(()=>{ SH_DEV.start('adventure',26); });
   await new Promise(r=>setTimeout(r,3500));
   const mid=await p.evaluate(()=>{ const g=SH_DEV.state();
     return {phase:g.phase,dead:!!g.dead,saveT:g.saveT,hop:!!g.hop,chr:g.chr&&g.chr.id,r:g.cr.r}; });
   const bot=await p.evaluate(()=>{ try{ return SH_DEV.autoPlay?SH_DEV.autoPlay(4):'no autoPlay'; }catch(e){ return 'ERR '+String(e); } });
   await new Promise(r=>setTimeout(r,450));
   const post=await p.evaluate(()=>{ const g=SH_DEV.state();
     return {phase:g.phase,dead:!!g.dead,saveT:g.saveT,hop:!!g.hop,chr:g.chr&&g.chr.id,r:g.cr.r,cause:g.deadCause||''}; });
   console.log(`attempt ${att}: pre=${JSON.stringify(pre)} mid=${JSON.stringify(mid)} bot=${JSON.stringify(bot)} post=${JSON.stringify(post)}`);
   await p.close();
 }
 await b.close(); server.close();
})();
