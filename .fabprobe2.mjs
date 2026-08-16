import fs from 'node:fs'; import http from 'node:http'; import path from 'node:path'; import puppeteer from 'puppeteer';
const ROOT='/workspaces/lucid-winds';
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split('?')[0]); if(p.endsWith('/'))p+='index.html';
 const f=path.join(ROOT,p); if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);res.end('no');return;}
 res.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'}); fs.createReadStream(f).pipe(res);});
await new Promise(r=>server.listen(0,r)); const P=server.address().port;
const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage']});
for(const [name,url,seed] of [
  ['rule-root',`http://127.0.0.1:${P}/satellites/rule-root/?rrtest=1`,{rr_how_v1:'1'}],
  ['burrow-bowl',`http://127.0.0.1:${P}/satellites/burrow-bowl/?bb_test=1`,{sws_dev_ok:'1'}],
  ['flipbook',`http://127.0.0.1:${P}/satellites/flipbook/?fbtest=1`,{fb_helpseen:'1'}]]){
  const ctx=await b.createBrowserContext(); const pg=await ctx.newPage();
  await pg.setViewport({width:375,height:667,deviceScaleFactor:2,isMobile:true,hasTouch:true}); await pg.bringToFront();
  await pg.goto(url,{waitUntil:'domcontentloaded'});
  await pg.evaluate(s=>{localStorage.clear(); for(const k in s)localStorage.setItem(k,s[k]);},seed);
  await pg.goto(url,{waitUntil:'load'});
  const rows=[];
  for(const t of [3000,7000,15000,23000]){
    await new Promise(r=>setTimeout(r,t===3000?3000:t-rows.length*0));
    const st=await pg.evaluate(()=>{const f=document.querySelector('.lwfb-fab'); if(!f)return 'none';
      const r=f.getBoundingClientRect(),cs=getComputedStyle(f);
      return Math.round(r.left)+','+Math.round(r.top)+' op='+cs.opacity+' pe='+cs.pointerEvents+
       ' state='+(window.LW_Feedback&&LW_Feedback._fab?LW_Feedback._fab.state():'?');});
    rows.push(t+'ms '+st);
  }
  console.log(name.padEnd(12), rows.join(' | '));
  await ctx.close();
}
await b.close(); server.close();
