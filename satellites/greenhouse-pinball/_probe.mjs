import http from 'http'; import fs from 'fs'; import path from 'path'; import puppeteer from 'puppeteer';
const ROOT='/workspaces/lucid-winds';
const M={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.svg':'image/svg+xml','.webmanifest':'application/json'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]);const f=path.join(ROOT,u);
 if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);r.end();return;}
 r.writeHead(200,{'content-type':M[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>srv.listen(8811,'127.0.0.1',r));
const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
const p=await b.newPage();
p.on('pageerror',e=>console.log('ERR',String(e).slice(0,200)));
await p.goto('http://127.0.0.1:8811/satellites/greenhouse-pinball/index.html?gptest=1',{waitUntil:'domcontentloaded'});
await new Promise(r=>setTimeout(r,500));
const out=await p.evaluate(()=>{
  const res={};
  window.PIN_DEV.start('zen');
  const g=window.PIN_DEV.state();
  // A) in-bounds upper-field spawns at absurd speed
  let esc=null, n=0;
  for(let t=0;t<400 && !esc;t++){
    g.balls.length=0;
    const a=Math.random()*Math.PI*2, sp=3000+Math.random()*1200;
    window.PIN_DEV.addBall({x:85+Math.random()*360, y:150+Math.random()*520, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp});
    g.awaitLaunch=false; g.netTime=0; g.tiltOut=0; n++;
    for(let i=0;i<60;i++){
      window.PIN_DEV.step(0.05);
      const bb=g.balls[0]; if(!bb) break;
      if(bb.inLane||bb.captured||bb.onRail) break;
      if(bb.y<852 && (bb.x<44||bb.x>486)){ esc={x:Math.round(bb.x),y:Math.round(bb.y),i}; break; }
      if(bb.y<80||bb.y>1000){ esc={x:Math.round(bb.x),y:Math.round(bb.y),i,why:'y'}; break; }
    }
  }
  res.A={esc,n};
  // B) real tip flip at 20fps
  let esc2=null, n2=0;
  for(let t=0;t<200 && !esc2;t++){
    g.balls.length=0;
    // sit the bead on the left blade tip
    const F={px:170,py:842,L:82};
    const a=0.50, tx=F.px+Math.cos(a)*(F.L*(0.85+Math.random()*0.15)), ty=F.py+Math.sin(a)*(F.L*0.9);
    window.PIN_DEV.addBall({x:tx, y:ty-18, vx:(Math.random()*2-1)*60, vy:120+Math.random()*260});
    g.awaitLaunch=false; g.netTime=0; g.tiltOut=0; n2++;
    window.PIN_DEV.flip&&window.PIN_DEV.flip('L',true);
    for(let i=0;i<40;i++){
      window.PIN_DEV.step(0.05);
      const bb=g.balls[0]; if(!bb) break;
      if(bb.inLane||bb.captured||bb.onRail) break;
      if(bb.y<852 && (bb.x<44||bb.x>486)){ esc2={x:Math.round(bb.x),y:Math.round(bb.y),i}; break; }
      if(bb.y<80){ esc2={x:Math.round(bb.x),y:Math.round(bb.y),i,why:'y'}; break; }
      if(i===2) window.PIN_DEV.flip&&window.PIN_DEV.flip('L',false);
    }
  }
  res.B={esc:esc2,n:n2};
  res.devKeys=Object.keys(window.PIN_DEV);
  return res;
});
console.log(JSON.stringify(out,null,1));
await b.close(); srv.close();
