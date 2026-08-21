/* Where does the 913ms go, and what makes it cheap? Split step+render from the
   screenshot, then try the knobs: device scale, jpeg vs png, optimizeForSpeed. */
const L=require('./lib.js');
(async()=>{
 const srv=await L.serve(L.PORT);
 const b=await L.puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox','--disable-gpu']});
 for(const dsf of [2,1.5]){
  const p=await L.boot(b,{prog:{char:'roon'},dsf});
  await p.evaluate(()=>{ SH_DEV.start('adventure',12); });
  await L.sleep(2200); await L.seizeClock(p);
  const time=async(label,fn,n)=>{ const t=Date.now(); for(let i=0;i<n;i++) await fn(i); const per=(Date.now()-t)/n;
    console.log(`  dsf${dsf} ${label}: ${per.toFixed(0)}ms`); return per; };
  await time('step+render only', async()=>{ await p.evaluate(()=>{SH_DEV.step(1/30);SH_DEV.render();}); }, 15);
  await time('+ png screenshot', async(i)=>{ await p.evaluate(()=>{SH_DEV.step(1/30);SH_DEV.render();});
    await p.screenshot({path:'/tmp/sp.png'}); }, 10);
  await time('+ jpeg q90', async()=>{ await p.evaluate(()=>{SH_DEV.step(1/30);SH_DEV.render();});
    await p.screenshot({path:'/tmp/sp.jpg',type:'jpeg',quality:90}); }, 10);
  await time('+ jpeg optimizeForSpeed', async()=>{ await p.evaluate(()=>{SH_DEV.step(1/30);SH_DEV.render();});
    await p.screenshot({path:'/tmp/sp2.jpg',type:'jpeg',quality:90,optimizeForSpeed:true,captureBeyondViewport:false}); }, 10);
  /* the in-page route: pull the canvas straight out as a data URL. Loses the DOM
     hoppad, so only usable if we re-add it — measure it before deciding. */
  await time('canvas.toDataURL jpeg', async()=>{ await p.evaluate(()=>{SH_DEV.step(1/30);SH_DEV.render();
     window.__last=document.getElementById('game').toDataURL('image/jpeg',0.9); }); }, 10);
  await p.close();
 }
 await b.close(); srv.close();
})();
