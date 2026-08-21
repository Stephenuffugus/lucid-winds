/* Does the seize-the-clock trick actually work? Three questions, answered by
   measurement, not by hope:
     1. after seizeClock, does the world stand still on its own?
     2. does step(1/30)+render() move it by exactly one frame?
     3. how long does one 1080x1920 screenshot cost (the whole trailer budget)? */
const L=require('./lib.js');
(async()=>{
 const srv=await L.serve(L.PORT);
 const b=await L.puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox']});
 const p=await L.boot(b,{prog:{char:'roon'}});
 await p.evaluate(()=>{ SH_DEV.start('adventure',12); });
 await L.sleep(2500);
 console.log('running state:', JSON.stringify(await p.evaluate(()=>{const g=SH_DEV.state();return {r:g.cr.r,x:Math.round(g.cr.x),phase:g.phase,lvl:g.level,t:+g.t.toFixed(2)};})));
 await L.seizeClock(p);
 const a=await p.evaluate(()=>{const g=SH_DEV.state();return {t:+g.t.toFixed(3),x:Math.round(g.cr.x)};});
 await L.sleep(700);
 const c=await p.evaluate(()=>{const g=SH_DEV.state();return {t:+g.t.toFixed(3),x:Math.round(g.cr.x)};});
 console.log('Q1 world frozen after seize? before',JSON.stringify(a),'after 700ms',JSON.stringify(c),
   '=>', (a.t===c.t?'FROZEN (good)':'STILL RUNNING (bad)'));
 const d=await p.evaluate(()=>{ SH_DEV.step(1/30); SH_DEV.render(); const g=SH_DEV.state(); return {t:+g.t.toFixed(3)};});
 console.log('Q2 one manual step:', a.t, '->', d.t, '=>', (Math.abs((d.t-a.t)-1/30)<0.002?'exactly 1/30 (good)':'unexpected'));
 const t0=Date.now(); const N=20;
 for(let i=0;i<N;i++){ await p.evaluate(()=>{SH_DEV.step(1/30);SH_DEV.render();}); await p.screenshot({path:'/tmp/probe_f'+i+'.png'}); }
 const per=(Date.now()-t0)/N;
 console.log('Q3 per-frame cost:', per.toFixed(0)+'ms  => 1400 frames ≈ '+((per*1400)/60000).toFixed(1)+' min');
 // do the frames actually differ?
 const fs=require('fs'); const h=f=>require('crypto').createHash('md5').update(fs.readFileSync(f)).digest('hex').slice(0,8);
 console.log('frame hashes 0,5,10,19:', h('/tmp/probe_f0.png'), h('/tmp/probe_f5.png'), h('/tmp/probe_f10.png'), h('/tmp/probe_f19.png'));
 fs.copyFileSync('/tmp/probe_f19.png', __dirname+'/../frames/_probe_last.png');
 await b.close(); srv.close();
})();
